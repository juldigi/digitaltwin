import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {FactoryEngine} from '../frontend/src/engine.js';

function canvasDocument(run){
 const previous=Object.getOwnPropertyDescriptor(globalThis,'document');
 Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement(tag){
  assert.equal(tag,'canvas');return {width:0,height:0,getContext(){return {clearRect(){},fillRect(){},fillText(){}};}};
 }}});
 try{return run();}finally{if(previous)Object.defineProperty(globalThis,'document',previous);else delete globalThis.document;}
}

test('V335 all 41 browser-created models survive inspection and simulation lifecycle',()=>canvasDocument(()=>{
 for(const asset of MACHINE_REGISTRY){
  const template=createPolishedMachineTemplate(asset.machineId);
  let simulation;
  try{
   const rest=new Map();template.root.traverse(node=>{if(node.isMesh)rest.set(node,{position:node.position.clone(),quaternion:node.quaternion.clone(),scale:node.scale.clone()});});
   const materials=new Map();template.root.traverse(node=>{if(node.isMesh)for(const m of Array.isArray(node.material)?node.material:[node.material])if(m)materials.set(m,[m.transparent,m.opacity,m.depthWrite]);});
   template.reset();template.highlight?.(template.nodes?.[0]||null);template.highlightMany?.(template.nodes?.slice(0,2)||[]);
   template.ghost?.(true);template.ghost?.(false);template.setExteriorOpen?.(true);template.setLow?.(true);template.setLow?.(false);
   for(const [m,state] of materials)assert.deepEqual([m.transparent,m.opacity,m.depthWrite],state,`${asset.machineId}: authored alpha/depth round-trip`);
   simulation=createMachineSimulation(asset.machineId,template.root,template);simulation.start();
   for(let frame=0;frame<=180;frame++)simulation.update(frame*1000/60);
   simulation.pause?.();simulation.resume?.();simulation.update(4000);simulation.stop();
   template.setExteriorOpen?.(false);template.reset();template.root.updateMatrixWorld(true);
   for(const [node,pose] of rest){assert.ok(node.position.distanceTo(pose.position)<.001,`${asset.machineId}: position reset ${node.userData.ownerId}`);assert.ok(node.scale.distanceTo(pose.scale)<.001,`${asset.machineId}: scale reset`);assert.ok(node.quaternion.angleTo(pose.quaternion)<.001,`${asset.machineId}: rotation reset`);}
   template.root.traverse(node=>{
    if(!node.isMesh)return;
    assert.ok([...node.position.toArray(),...node.scale.toArray(),...node.quaternion.toArray()].every(Number.isFinite),asset.machineId);
   });
  }finally{simulation?.dispose?.();template.dispose();}
 }
}));

test('V335 Offset 5 reset preserves authored alpha and depth settings',()=>canvasDocument(()=>{
 const template=createPolishedMachineTemplate('BMJ-MCH-0003');
 try{
  const decals=template.meshes.filter(mesh=>mesh.userData.brandText==='HEIDELBERG Speedmaster');
  assert.equal(decals.length,8);
  const beams=template.meshes.filter(mesh=>mesh.userData.uvBeam);
  assert.ok(beams.length>0);
  const materials=[...decals,...beams].map(mesh=>mesh.material);
  const before=materials.map(m=>[m.transparent,m.opacity,m.depthWrite]);
  template.ghost(true);assert.ok(materials.every(m=>!m.depthWrite));template.ghost(false);template.reset();
  assert.deepEqual(materials.map(m=>[m.transparent,m.opacity,m.depthWrite]),before);
 }finally{template.dispose();}
}));

test('V335 Offset 5 UV beam retains its authored emission after inspection reset',()=>canvasDocument(()=>{
 const template=createPolishedMachineTemplate('BMJ-MCH-0003');
 const simulation=createMachineSimulation('BMJ-MCH-0003',template.root,template);
 try{
  const colors=simulation.uvBeams.map(({material})=>material.emissive.getHex());
  assert.ok(colors.length>0&&colors.every(color=>color!==0));
  template.reset();simulation.start();simulation.setUV(true);
  assert.deepEqual(simulation.uvBeams.map(({material})=>material.emissive.getHex()),colors);
  simulation.stop();
  assert.deepEqual(simulation.uvBeams.map(({material})=>material.emissive.getHex()),colors);
 }finally{simulation.dispose();template.dispose();}
}));

test('V335 active machine simulation reframes after portrait canvas resizing',()=>{
 const machine=new THREE.Group(),calls=[];
 const engine=Object.assign(Object.create(FactoryEngine.prototype),{
  container:{clientWidth:390,clientHeight:844},renderer:{setSize(w,h){calls.push(['renderer',w,h]);}},
  postProcessing:{resize(w,h){calls.push(['post',w,h]);}},camera:new THREE.PerspectiveCamera(38,1.5),
  machine,view:'machine',simulation:{active:true},fit(object,mode,animate){calls.push(['fit',object,mode,animate,this.camera.aspect]);}
 });
 engine.resize();assert.deepEqual(calls.at(-1),['fit',machine,'iso',false,390/844]);
 engine.simulation.active=false;calls.length=0;engine.resize();assert.equal(calls.length,2,'idle resize retains user camera');
});
