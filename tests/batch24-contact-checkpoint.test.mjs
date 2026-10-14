import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

test('LY300 collection sheets contact support and each other without overhang',()=>{
 const t=createMachineTemplate('BMJ-MCH-0024'),s=createMachineSimulation('BMJ-MCH-0024',t.root,t);
 try{
  for(const result of ['PASS_DEMO','REJECT_DEMO']){
   s.outputPrevious({result});s.outputPrevious({result});t.root.updateMatrixWorld(true);
   const arr=result==='PASS_DEMO'?s.goodStack:s.badStack;
   const support=result==='PASS_DEMO'?.415:.410;
   const a=new THREE.Box3().setFromObject(arr[0]),b=new THREE.Box3().setFromObject(arr[1]);
   assert.ok(Math.abs(a.min.y-support)<1e-6);assert.ok(Math.abs(a.max.y-b.min.y)<1e-6);
   if(result==='PASS_DEMO'){assert.ok(a.min.x>=1.47);assert.ok(a.max.x<=2.09);}
  }
 }finally{s.dispose();t.dispose();}
});

test('Both CTP plate envelopes remain concentric and rotate at drum surface speed',()=>{
 for(const id of ['BMJ-MCH-0025','BMJ-MCH-0026']){
  const t=createMachineTemplate(id),s=createMachineSimulation(id,t.root,t);
  try{
   s.start();
   for(const p of [.34,.50,.75]){
    s.elapsed=s.cycle*p;s.updateCTP();t.root.updateMatrixWorld(true);
    const center=s.ctp.drum.getWorldPosition(new THREE.Vector3());
    assert.ok(center.distanceTo(s.ctpWrappedGroup.position)<1e-6);
    const shaft=new THREE.Vector3(0,1,0).applyQuaternion(s.ctp.drum.userData.ctpRestQuaternion);
    assert.ok(shaft.distanceTo(new THREE.Vector3(0,0,1))<1e-6);
    assert.ok(Math.abs(s.ctpWrappedGroup.rotation.z-s.elapsed*5.2)<1e-6);
    assert.equal(s.state().ctpInterlockSafe,true);
   }
  }finally{s.dispose();t.dispose();}
 }
});
