import test from 'node:test';
import assert from 'node:assert/strict';
import {createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

test('V333 every Offset 5 transfer guide identifies its actual adjacent PU pair and preserves forward flow metadata',()=>{
 const template=createMachineTemplate('BMJ-MCH-0003');
 try{
  assert.equal(template.root.userData.dimensionLock,'BMJ_CUSTOM_INSTALLED_DIMENSIONS_DO_NOT_NORMALIZE_TO_GENERIC_CD102');
  for(let bay=1;bay<=7;bay++){
   const guide=template.findNode(`transfer-pu${bay}-pu${bay+1}-guide`);
   assert.ok(guide,`guide bay ${bay}`);
   assert.match(guide.name,new RegExp(`PU${bay} → PU${bay+1}`));
   assert.equal(guide.userData.transferFromPU,bay);
   assert.equal(guide.userData.transferToPU,bay+1);
   assert.equal(guide.userData.flowDirection,'FEEDER_TO_DELIVERY_POSITIVE_X');
   assert.equal(guide.userData.installedClearanceVerified,false);
  }
 }finally{template.dispose();}
});

test('V333 Offset 5 transfer gripper simulation retains bay identity without inventing installed phasing',()=>{
 const template=createMachineTemplate('BMJ-MCH-0003');
 const sim=createMachineSimulation('BMJ-MCH-0003',template.root,template);
 try{
  assert.equal(sim.gripperMotions.length,14);
  for(let bay=1;bay<=7;bay++){
   const motions=sim.gripperMotions.filter(item=>item.transferFromPU===bay&&item.transferToPU===bay+1);
   assert.equal(motions.length,2,`PU${bay}→PU${bay+1}`);
   assert.deepEqual(motions.map(item=>item.gripperBar).sort(),['A','B']);
   for(const item of motions){
    assert.equal(item.flowDirection,'FEEDER_TO_DELIVERY_POSITIVE_X');
    assert.equal(item.installedPhaseVerified,false);
   }
  }
  assert.equal(sim.state().interUnitTransferCausalityPolicy,'SEVEN_BAYS_IDENTIFIED_BY_ADJACENT_PU_PAIR__FORWARD_FLOW__PHASE_REMAINS_VISUAL_REFERENCE');
 }finally{sim.dispose();template.dispose();}
});
