import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {FactoryEngine} from '../frontend/src/engine.js';

// Node has no canvas by default, so the real browser-only cabinet decals must
// be enabled explicitly to exercise the material that caused the iPhone crash.
function withCanvasDocument(run){
 const previous=Object.getOwnPropertyDescriptor(globalThis,'document');
 const texts=[];
 Object.defineProperty(globalThis,'document',{configurable:true,value:{
  createElement(tag){
   assert.equal(tag,'canvas');
   return {width:0,height:0,getContext(type){
    assert.equal(type,'2d');
    return {clearRect(){},fillText(text){texts.push(text);}};
   }};
  }
 }});
 try{return run(texts);}finally{
  if(previous)Object.defineProperty(globalThis,'document',previous);
  else delete globalThis.document;
 }
}

test('V334 browser-created Offset 5 decals survive component highlighting and reset',()=>withCanvasDocument(texts=>{
 const template=createPolishedMachineTemplate('BMJ-MCH-0003');
 try{
  const decals=template.meshes.filter(mesh=>mesh.userData.brandText==='HEIDELBERG Speedmaster');
  assert.equal(decals.length,8,'all eight actual browser decals must exist');
  assert.equal(texts.filter(text=>text==='HEIDELBERG').length,8);
  for(const mesh of decals){
   assert.ok(mesh.material.isMeshBasicMaterial);
   assert.equal(mesh.material.emissive,undefined);
   assert.ok(mesh.material.map?.isCanvasTexture);
  }
  const unit=template.findNode('press-0-frame');
  const body=template.meshes.find(mesh=>mesh.material.emissive&&template.contains(unit,mesh));
  const decalColors=decals.map(mesh=>mesh.material.color.getHex());
  assert.doesNotThrow(()=>template.highlight(unit));
  assert.equal(body.material.emissive.getHex(),0x174b47,'physical component remains highlighted');
  assert.doesNotThrow(()=>template.highlightMany([unit,template.findNode('press-1-frame')]));
  assert.doesNotThrow(()=>template.highlightMany([]));
  assert.doesNotThrow(()=>template.reset());
  assert.equal(body.material.emissive.getHex(),0);
  assert.deepEqual(decals.map(mesh=>mesh.material.color.getHex()),decalColors,'reset preserves logo colors');
  assert.ok(decals.every(mesh=>mesh.material.map?.isCanvasTexture),'reset preserves logo textures');
 }finally{template.dispose();}
}));

test('V334 opening browser Offset 5 through the engine view lifecycle retains model and simulation',()=>withCanvasDocument(()=>{
 const template=createPolishedMachineTemplate('BMJ-MCH-0003');
 const simulation=createMachineSimulation('BMJ-MCH-0003',template.root,template);
 const engine=Object.assign(Object.create(FactoryEngine.prototype),{
  template,machine:template.root,simulation,sceneEditing:false,
  studio:new THREE.Group(),factory:new THREE.Group(),
  gizmo:{detach(){}},shadows:{focusBounds(){},reset(){}},
  syncVisualSystems(){},clearPartLabels(){},machineFocusBounds(){return null;},
  applySceneOverrides(){},applyPlacement(){this.machine.visible=false;},
  currentFactoryTarget(){return null;},fit(object){this.fittedObject=object;}
 });
 try{
  assert.doesNotThrow(()=>engine.setView('machine',{}));
  assert.equal(engine.view,'machine');
  assert.equal(engine.machine.visible,true);
  assert.equal(engine.fittedObject,template.root);
  assert.equal(engine.factory.visible,false);
  simulation.start();simulation.update(0);simulation.update(16);
  assert.equal(simulation.state().running,true);
  assert.doesNotThrow(()=>engine.setView('factory',{}));
  assert.equal(simulation.state().running,false);
  assert.doesNotThrow(()=>engine.setView('machine',{}));
  assert.equal(engine.machine.visible,true);
  assert.equal(template.root.userData.offset5RuntimeTruthLock,'PASS');
 }finally{simulation.dispose();template.dispose();}
}));
