import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {buildIpalPhotoDerivedV3} from '../frontend/src/merge-sources/20260925/utility-building-v4/utility/ipal/ipal-photo-derived-v3.js';

test('five neutral AHUs have rim blades attached to a rotating shaft rather than stacked stationary blades',()=>{
 for(const no of [36,37,38,39,41]){
  const id='BMJ-MCH-'+String(no).padStart(4,'0'),t=createPolishedMachineTemplate(id),sim=createMachineSimulation(id,t.root,t);
  try{
   const fan=t.findNode('ahu-supply-fan'),wheel=fan.children.find(o=>o.userData.motion),blades=wheel.children.filter(o=>o.isMesh);
   assert.equal(blades.length,10,id);assert.equal(wheel.userData.installedBladeCountVerified,false);
   for(const b of blades)assert.ok(Math.abs(Math.hypot(b.position.x,b.position.z)-.30)<1e-8);
   t.root.updateMatrixWorld(true);const center=wheel.getWorldPosition(new THREE.Vector3()),before=blades[0].getWorldPosition(new THREE.Vector3());
   assert.ok(Math.abs(before.z-center.z)<1e-8,'blade lies in shaft-normal plane');
   const rest=wheel.quaternion.clone();sim.start();sim.update(0);sim.update(100);t.root.updateMatrixWorld(true);
   assert.ok(blades[0].getWorldPosition(new THREE.Vector3()).distanceTo(before)>.01,'blade follows rotor motion');
   sim.stop();assert.ok(wheel.quaternion.angleTo(rest)<1e-7,'stop restores rotor');
  }finally{sim.dispose();t.dispose();}
 }
});

test('IPAL utility pump coupling bridges motor and volute and feet reach the base',()=>{
 const root=buildIpalPhotoDerivedV3({includeCanopy:false,includePaving:false}),found={};
 root.traverse(o=>{(found[o.userData.semantic]??=[]).push(o);});root.updateMatrixWorld(true);
 const bounds=sem=>new THREE.Box3().setFromObject(found[sem][0]);
 const motor=bounds('PUMP_MOTOR_REFERENCE'),coupling=bounds('PUMP_ROTATING_COUPLING'),volute=bounds('PUMP_VOLUTE_REFERENCE'),base=bounds('PUMP_SKID_BASE');
 assert.ok(Math.abs(motor.max.x-coupling.min.x)<1e-6);assert.ok(Math.abs(coupling.max.x-volute.min.x)<1e-6);
 for(const [sem,housing] of [['PUMP_MOTOR_MOUNTING_FOOT',motor],['PUMP_VOLUTE_MOUNTING_FOOT',volute]])for(const foot of found[sem]){
  const b=new THREE.Box3().setFromObject(foot);assert.ok(Math.abs(b.min.y-base.max.y)<1e-6);assert.ok(Math.abs(b.max.y-housing.min.y)<.002);
 }
});
