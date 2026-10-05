import test from 'node:test';
import assert from 'node:assert/strict';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

const visibleInTree=mesh=>{
 for(let node=mesh;node;node=node.parent)if(!node.visible)return false;
 return true;
};

test('V337 Offset 5 mobile cutaway keeps every process rotor visible during simulation',()=>{
 const template=createPolishedMachineTemplate('offset5');
 const simulation=createMachineSimulation('offset5',template.root,template);
 try{
  template.setLow(true);template.setExteriorOpen(true);
  assert.equal(simulation.rotors.length,264);
  const check=()=>{
   for(const rotor of simulation.rotors)assert.ok(visibleInTree(rotor.mesh),`hidden process rotor: ${rotor.mesh.userData.ownerId}`);
  };
  check();simulation.start();
  for(let frame=0;frame<=600;frame++)simulation.update(frame*1000/60);
  check();simulation.pause();check();simulation.resume();simulation.update(11000);
  simulation.stop();check();
  template.setLow(false);template.setLow(true);check();
  assert.ok(template.meshes.some(mesh=>mesh.userData.detail&&!mesh.visible),'low detail must still remove optional details');
  assert.ok(template.meshes.filter(mesh=>mesh.userData.exteriorCover).every(mesh=>!mesh.visible),'cutaway covers stay hidden');
 }finally{simulation.dispose();template.dispose();}
});

test('Offset 5 normal mobile view keeps the actual PU roller diagram inside the covers',()=>{
 const template=createPolishedMachineTemplate('offset5');
 try{
  template.setExteriorOpen(false);template.setLow(true);
  const rollers=template.meshes.filter(mesh=>mesh.userData.actualDiagramSource==='IMG_2777.jpeg');
  assert.equal(rollers.length,192);
  for(const roller of rollers)assert.ok(!visibleInTree(roller),`internal roller exposed: ${roller.userData.ownerId}`);
  template.setExteriorOpen(true);
  for(const roller of rollers)assert.ok(visibleInTree(roller),`missing interior roller: ${roller.userData.ownerId}`);
  template.setExteriorOpen(false);
  assert.equal(template.exteriorOpen,false);
 }finally{template.dispose();}
});
