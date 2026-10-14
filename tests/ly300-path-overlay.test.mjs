import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

test('LY300 primary overlay matches station interpolation and first accepted landing',()=>{
 const t=createMachineTemplate('BMJ-MCH-0024'),s=createMachineSimulation('BMJ-MCH-0024',t.root,t);
 try{
  s.start();const item=s.items[0],positions=s.pathLine.geometry.attributes.position;
  const phases=[0,.18,.30,.45,.57,.70,.76,.92];
  for(let i=0;i<phases.length;i++){
   s.elapsed=phases[i]*6.8;s.updateItems();
   assert.ok(item.group.position.distanceTo(new THREE.Vector3().fromBufferAttribute(positions,i))<1e-6);
  }
  item.result='PASS_DEMO';
  for(const phase of [.80,.90,.94,.98]){
   s.elapsed=phase*6.8;s.updateItems();
   const i=phase<.92?6:7,start=phases[i],end=i===6?.92:1;
   const expected=new THREE.Vector3().fromBufferAttribute(positions,i).lerp(new THREE.Vector3().fromBufferAttribute(positions,i+1),(phase-start)/(end-start));
   assert.ok(item.group.position.distanceTo(expected)<1e-6);
  }
  s.setPathVisible(true);assert.equal(s.pathLine.visible,true);
  s.pause();s.resume();assert.equal(s.pathLine.visible,true);
  s.stop();assert.equal(s.pathLine.visible,false);
 }finally{s.dispose();t.dispose();}
});
