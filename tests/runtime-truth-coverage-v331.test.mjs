import test from 'node:test';
import assert from 'node:assert/strict';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {
 RUNTIME_TRUTH_DOMAINS,
 createMachineTemplate,
 createPolishedMachineTemplate,
 createMachineSimulation,
 runtimeTruthOwners,
 validateOffset5PilotSimulation,
 validateOffset5PilotTemplate,
 validateRuntimeTruthOwnership
} from '../frontend/src/machine-runtime.js';

test('V331 Offset 5 pilot simulation is fail-closed on installed evidence, custom dimensions, and inter-PU motion policy',()=>{
 const template=createPolishedMachineTemplate('BMJ-MCH-0003'),sim=createMachineSimulation('BMJ-MCH-0003',template.root,template);
 try{
  const audit=validateOffset5PilotSimulation(sim,template);
  assert.equal(audit.valid,true,JSON.stringify(audit.errors));
  assert.equal(template.root.userData.offset5SimulationTruthVersion,'V331');
  assert.equal(template.root.userData.offset5SimulationTruthLock,'PASS');
  const s=sim.state();
  assert.equal(s.customMachineDimensionsPreserved,true);
  assert.equal(s.dimensionPolicy,'USER_CONFIRMED_CUSTOM_INSTALLED_GEOMETRY_OVERRIDES_GENERIC_FAMILY_DIMENSIONS');
  assert.equal(s.rollerDiagramRevision,'offset5-print-unit-reality-v319');
  assert.equal(s.rollerDiagramSource,'IMG_2777.jpeg');
  assert.equal(s.rollerEvidencePolicyRevision,'offset5-roller-evidence-policy-v320');
  assert.equal(s.interUnitGripperPolicy,'RIGID_FINGER_ASSEMBLY_ROTATES_WITH_TRANSFER_DRUM_ORBIT');
  assert.equal(s.cylinderMotionPolicy,'SAME_STRAIGHT_PRINT_DIRECTION_ALL_PU_CONTACT_PAIRS_COUNTER_ROTATE');
  assert.equal(s.rollerHandednessPolicy,'IDENTICAL_IMG_2777_CONTACT_GRAPH_ACROSS_ALL_EIGHT_STRAIGHT_PRINTING_UNITS');
  assert.equal(s.interUnitAccessPolicy,'BMJ_CUSTOM_BROAD_INTERUNIT_ACCESS_AND_OS_DS_STEPS_PRESERVED');
  assert.equal(s.sheetVisualPolicy,'NO_EXTERNAL_FULL_WIDTH_DEMO_GRIPPER_BAR');
  assert.equal(s.inkFlowCount,0);
  assert.equal(s.duplicateProcessHardwareAdded,false);
 }finally{sim.dispose();template.dispose();}
});

test('V331 all seven Offset 5 inter-PU transfer bays retain drum, dual grippers, shaft, spring, cam, and sheet guide',()=>{
 const template=createMachineTemplate('BMJ-MCH-0003');
 try{
  for(let bay=1;bay<=7;bay++){
   const base=`transfer-pu${bay}-pu${bay+1}`;
   for(const id of [base,`${base}-gripper-a`,`${base}-gripper-b`,`${base}-gripper-shaft`,`${base}-gripper-spring`,`${base}-gripper-cam`,`${base}-guide`]){
    const node=template.findNode(id);
    assert.ok(node,id);
    let attached=false;for(let p=node;p;p=p.parent)if(p===template.root){attached=true;break;}
    assert.equal(attached,true,id+' must remain attached to the live Offset 5 scene');
   }
  }
  assert.equal(validateOffset5PilotTemplate(template).valid,true);
 }finally{template.dispose();}
});

test('V331 Offset 5 transfer structure corruption fails closed without changing custom dimensions',()=>{
 const template=createMachineTemplate('BMJ-MCH-0003');
 try{
  const transfer=template.findNode('transfer-pu1-pu2-gripper-cam');
  transfer.parent.remove(transfer);
  const audit=validateOffset5PilotTemplate(template);
  assert.equal(audit.valid,false);
  assert.ok(audit.errors.some(e=>e.code==='TRANSFER_STRUCTURE_DETACHED'&&e.detail==='transfer-pu1-pu2-gripper-cam'));
  assert.equal(template.root.userData.dimensionLock,'BMJ_CUSTOM_INSTALLED_DIMENSIONS_DO_NOT_NORMALIZE_TO_GENERIC_CD102');
  assert.throws(()=>validateOffset5PilotTemplate(template,{throwOnError:true}),/Offset 5 pilot runtime truth-lock failed/);
 }finally{template.dispose();}
});

test('V331 every one of the 41 BMJ assets has exactly one template truth owner',()=>{
 assert.equal(MACHINE_REGISTRY.length,41);
 const counts=new Map(RUNTIME_TRUTH_DOMAINS.map(d=>[d.id,0]));
 for(const machine of MACHINE_REGISTRY){
  const template=createPolishedMachineTemplate(machine.machineId);
  try{
   const audit=validateRuntimeTruthOwnership(template,machine.machineId);
   assert.equal(audit.valid,true,machine.machineId+': '+JSON.stringify(audit.errors));
   assert.equal(audit.owners.length,1,machine.machineId);
   assert.deepEqual(runtimeTruthOwners(template),audit.owners,machine.machineId);
   counts.set(audit.owners[0],(counts.get(audit.owners[0])||0)+1);
   assert.equal(template.root.userData.runtimeTemplateTruthCoverageLock,'PASS',machine.machineId);
  }finally{template.dispose();}
 }
 assert.deepEqual(Object.fromEntries(counts),{
  offset5:1,autoplaten:6,folder:3,inspection:2,pds:4,utility:13,printing:5,'remaining-fleet':7
 });
});

test('V331 every one of the 41 BMJ asset simulations resolves to exactly one truth owner',()=>{
 assert.equal(MACHINE_REGISTRY.length,41);
 const counts=new Map(RUNTIME_TRUTH_DOMAINS.map(d=>[d.id,0]));
 for(const machine of MACHINE_REGISTRY){
  const template=createPolishedMachineTemplate(machine.machineId);
  const sim=createMachineSimulation(machine.machineId,template.root,template);
  try{
   const audit=validateRuntimeTruthOwnership(template,machine.machineId,{simulation:true});
   assert.equal(audit.valid,true,machine.machineId+': '+JSON.stringify(audit.errors));
   assert.equal(audit.owners.length,1,machine.machineId);
   assert.deepEqual(runtimeTruthOwners(template,{simulation:true}),audit.owners,machine.machineId);
   counts.set(audit.owners[0],(counts.get(audit.owners[0])||0)+1);
   assert.equal(template.root.userData.runtimeSimulationTruthCoverageLock,'PASS',machine.machineId);
  }finally{sim.dispose();template.dispose();}
 }
 assert.deepEqual(Object.fromEntries(counts),{
  offset5:1,autoplaten:6,folder:3,inspection:2,pds:4,utility:13,printing:5,'remaining-fleet':7
 });
});

test('V331 global truth ownership fails closed on duplicate or missing domain ownership',()=>{
 const template=createPolishedMachineTemplate('BMJ-MCH-0005');
 try{
  assert.deepEqual(runtimeTruthOwners(template),['printing']);
  template.root.userData.utilityRuntimeTruthLock='PASS';
  let audit=validateRuntimeTruthOwnership(template,'BMJ-MCH-0005');
  assert.equal(audit.valid,false);
  assert.deepEqual(audit.owners,['utility','printing']);
  assert.ok(audit.errors.some(e=>e.code==='MULTIPLE_TRUTH_OWNERS'));
  assert.throws(()=>validateRuntimeTruthOwnership(template,'BMJ-MCH-0005',{throwOnError:true}),/Runtime truth coverage failed/);

  delete template.root.userData.utilityRuntimeTruthLock;
  delete template.root.userData.printingRuntimeTruthLock;
  audit=validateRuntimeTruthOwnership(template,'BMJ-MCH-0005');
  assert.equal(audit.valid,false);
  assert.deepEqual(audit.owners,[]);
  assert.ok(audit.errors.some(e=>e.code==='MISSING_TRUTH_OWNER'));
 }finally{template.dispose();}
});
