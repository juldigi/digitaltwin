import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

test('APM drive cylinders and sprocket rings spin around their own geometry axis',()=>{
 const template=createPolishedMachineTemplate('BMJ-MCH-0010');
 const sim=createMachineSimulation('BMJ-MCH-0010',template.root,template);
 try{
  const roles=['main-shaft','main-motor','feed-roller','chain-sprocket'];
  for(const role of roles){
   const rotor=sim.rotors.find(o=>o.userData.mechanismRole===role);
   assert.ok(rotor,role);
   const axis=rotor.geometry.type==='TorusGeometry'?new THREE.Vector3(0,0,1):new THREE.Vector3(0,1,0);
   const before=axis.clone().applyQuaternion(rotor.quaternion);
   sim.spin(rotor,.2,4);
   const after=axis.clone().applyQuaternion(rotor.quaternion);
   assert.ok(before.distanceTo(after)<1e-6,`${role} wobbles off its shaft`);
  }
 }finally{sim.dispose();template.dispose();}
});

for(const id of ['BMJ-MCH-0019','BMJ-MCH-0020','BMJ-MCH-0024']){
 test(`${id} keeps the shaft direction fixed on both transverse and longitudinal drives`,()=>{
  const template=createPolishedMachineTemplate(id),sim=createMachineSimulation(id,template.root,template);
  try{
   for(const direction of ['x','z']){
    const rotor=sim.rotors.find(o=>o.userData.rotorAxis===direction);
    assert.ok(rotor,`${id} lacks a ${direction} drive`);
    const shaft=new THREE.Vector3(0,1,0),before=shaft.clone().applyQuaternion(rotor.quaternion);
    sim.spin(rotor,.2,4);
    assert.ok(before.distanceTo(shaft.applyQuaternion(rotor.quaternion))<1e-6,`${id} ${direction} shaft wobbles`);
   }
  }finally{sim.dispose();template.dispose();}
 });
}

test('reference-family cylinders remain coaxial during simulation',()=>{
 const template=createPolishedMachineTemplate('BMJ-MCH-0017'),sim=createMachineSimulation('BMJ-MCH-0017',template.root,template);
 try{
  const rotor=sim.motions.find(item=>item.motion.type==='spin'&&item.mesh.geometry.type==='CylinderGeometry');
  assert.ok(rotor);
  const shaft=new THREE.Vector3(0,1,0),before=shaft.clone().applyQuaternion(rotor.mesh.quaternion);
  sim.start();sim.update(0);sim.update(100);
  assert.ok(before.distanceTo(shaft.applyQuaternion(rotor.mesh.quaternion))<1e-6);
 }finally{sim.dispose();template.dispose();}
});

for(const id of ['BMJ-MCH-0003','BMJ-MCH-0005','BMJ-MCH-0006','BMJ-MCH-0009','BMJ-MCH-0010']){
 test(`${id} starts with an empty delivery and restores presentation pile after stop`,()=>{
  const template=createPolishedMachineTemplate(id);
  const sim=createMachineSimulation(id,template.root,template);
  try{
   assert.ok(sim.staticDeliveryStack,id+' missing static pile');
   assert.equal(sim.staticDeliveryStack.visible,true);
   sim.start();
   assert.equal(sim.staticDeliveryStack.visible,false);
   assert.equal(sim.state().pileSheetsVisible,0);
   if(id==='BMJ-MCH-0010'){
    sim.deposit();
    assert.equal(sim.state().pileSheetsVisible,1);
    assert.ok(sim.pileSheets[0].mesh.position.y<.55,'result lies on the delivery table');
   }
   sim.stop();
   assert.equal(sim.staticDeliveryStack.visible,true);
   assert.equal(sim.state().pileSheetsVisible,0);
  }finally{sim.dispose();template.dispose();}
 });
}
