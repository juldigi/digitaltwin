import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INSPECTION_RUNTIME_CONTRACTS,
  createMachineTemplate,
  createPolishedMachineTemplate,
  createMachineSimulation,
  validateInspectionTemplate,
  validateInspectionSimulation
} from '../frontend/src/machine-runtime.js';

const assets=['BMJ-MCH-0019','BMJ-MCH-0020'];

test('V323 both BMJ offline inspection assets pass fail-closed runtime truth contracts',()=>{
 for(const id of assets){
  const template=createPolishedMachineTemplate(id);
  try{
   const audit=validateInspectionTemplate(template,id);
   assert.equal(audit.valid,true,id);
   assert.deepEqual(audit.errors,[],id);
   assert.equal(template.root.userData.inspectionRuntimeTruthLock,'PASS',id);
   assert.equal(audit.contract,INSPECTION_RUNTIME_CONTRACTS[id],id);
   const sim=createMachineSimulation(id,template.root,template);
   try{
    const simAudit=validateInspectionSimulation(sim,template,id);
    assert.equal(simAudit.valid,true,id);
    assert.equal(template.root.userData.inspectionSimulationTruthLock,'PASS',id);
   }finally{sim.dispose();}
  }finally{template.dispose();}
 }
});

test('V323 Diana Eye 55 keeps exact BMJ identity while camera reject and stacker options remain bounded',()=>{
 const id='BMJ-MCH-0019',template=createMachineTemplate(id);
 try{
  const u=template.root.userData,spec=u.spec,contract=INSPECTION_RUNTIME_CONTRACTS[id];
  assert.equal(u.assetId,id);assert.equal(spec.model,contract.model);assert.equal(spec.serial,contract.serial);
  assert.equal(u.modeledEnvelopeMode,contract.modeledMode);
  assert.equal(template.findNode('diana55-camera-top').userData.capacity,4);
  assert.equal(template.findNode('diana55-camera-area').userData.capacity,2);
  assert.equal(template.findNode('diana55-camera-rear').userData.capacity,1);
  assert.equal(template.findNode('diana55-reject').userData.installedRejectActuationVerified,false);
  for(const flag of contract.unverifiedSpecFlags)assert.equal(spec[flag],false,flag);
  for(const nodeId of contract.hiddenNodes)assert.equal(template.findNode(nodeId).visible,false,nodeId);
 }finally{template.dispose();}
});

test('V323 SHARK N650 preserves P3N1 verbatim and official format conflict instead of decoding installed options',()=>{
 const id='BMJ-MCH-0020',template=createMachineTemplate(id);
 try{
  const u=template.root.userData,spec=u.spec,contract=INSPECTION_RUNTIME_CONTRACTS[id];
  assert.equal(spec.model,'FS-SHARK-N650-P3N1');assert.equal(spec.serial,'FPS241216001');
  assert.equal(spec.currentPageFormatDiscrepancyVerified,true);
  assert.equal(spec.installedMaxInspectionFormatVerified,false);
  assert.equal(spec.suffixDecoded,false);
  assert.equal(u.suffixBoundary,'P3N1_PRESERVED_VERBATIM__NOT_DECODED');
  assert.equal(template.findNode('shark650-vision-camera').userData.p3SuffixDecoded,false);
  assert.equal(template.findNode('shark650-reject').userData.installedRejectTypeVerified,false);
  assert.equal(template.findNode('shark650-return').userData.installedCollectionModeVerified,false);
  for(const flag of contract.unverifiedSpecFlags)assert.equal(spec[flag],false,flag);
  for(const nodeId of contract.hiddenNodes)assert.equal(template.findNode(nodeId).visible,false,nodeId);
 }finally{template.dispose();}
});

test('V323 hidden inspection capability nodes survive isolate showOnly cutaway LOD and reset without leaking into the installed silhouette',()=>{
 for(const id of assets){
  const template=createMachineTemplate(id),contract=INSPECTION_RUNTIME_CONTRACTS[id];
  try{
   const hidden=contract.hiddenNodes.map(nodeId=>template.findNode(nodeId));assert.ok(hidden.every(Boolean),id);
   const primary=id==='BMJ-MCH-0019'?template.findNode('diana55-feeder'):template.findNode('shark650-feeder');
   template.setLow(true);template.setExteriorOpen(true);template.setExteriorOpen(false);
   template.isolate(primary,true);template.isolate(null,false);
   template.showOnly([primary],true);template.showOnly([],false);
   template.reset();template.setLow(false);
   assert.ok(hidden.every(node=>node.visible===false),id+' capability node leaked visible');
  }finally{template.dispose();}
 }
});

test('V323 deterministic inspection decisions stay pending before scan and retain the same tracking ID through reject routing',()=>{
 for(const id of assets){
  const template=createMachineTemplate(id),sim=createMachineSimulation(id,template.root,template);
  try{
   sim.start();let now=1000;sim.update(now);sim.update(now+=10);
   const preDecision=sim.blanks.filter(b=>b.mesh.visible&&b.result===null);
   assert.ok(preDecision.length>0,id);
   let decisionId=null,gateId=null,seenScan=false;
   for(let i=0;i<2200;i++){
    now+=10;sim.update(now);const state=sim.state();seenScan||=state.scanActive;
    const rejected=sim.blanks.find(b=>b.result==='REJECT_DEMO'&&b.trackingId);
    if(rejected&&!decisionId)decisionId=rejected.trackingId;
    if(state.demoRejectActive&&state.activeRejectTrackingIds.length){gateId=state.activeRejectTrackingIds[0];break;}
    assert.equal(state.interlockSafe,true,id);
   }
   assert.equal(seenScan,true,id);assert.ok(decisionId&&gateId,id);assert.equal(gateId,decisionId,id);
   const final=sim.state();assert.equal(final.demoRejectOnly,true,id);
   assert.equal(final.deterministicDefectInjection,INSPECTION_RUNTIME_CONTRACTS[id].deterministicDefectInjection,id);
  }finally{sim.dispose();template.dispose();}
 }
});

test('V323 inspection simulations keep model-specific process boundaries and do not promote demo logic into installed claims',()=>{
 {
  const id='BMJ-MCH-0019',template=createMachineTemplate(id),sim=createMachineSimulation(id,template.root,template);
  try{
   const state=sim.state();
   assert.equal(state.installedRejectActuationVerified,false);
   assert.equal(state.installedCameraCountVerified,false);
   assert.equal(state.installedCameraPopulationRendered,false);
   assert.equal(state.deliveryMode,'ACCEPTED_FISH_SCALE_PLUS_RECOVERABLE_REJECT_COLLECTION');
   assert.equal(state.rejectBranchPolicy,'TRACKED_BLANK_BRANCHES_DIRECTLY_FROM_GATE_TO_RECOVERY_TRAY');
   assert.equal(state.acceptedBranchPolicy,'TRACKED_ACCEPTED_BLANK_BRANCHES_TO_FISH_SCALE_ENTRY_WITHOUT_TELEPORT');
  }finally{sim.dispose();template.dispose();}
 }
 {
  const id='BMJ-MCH-0020',template=createMachineTemplate(id),sim=createMachineSimulation(id,template.root,template);
  try{
   const state=sim.state();
   assert.equal(state.suffixDecoded,false);
   assert.equal(state.installedFeederModeVerified,false);
   assert.equal(state.installedCameraPackageVerified,false);
   assert.equal(state.installedRejectTypeVerified,false);
   assert.equal(state.installedCollectionModeVerified,false);
   assert.equal(state.goodBadReturnLineOfficial,true);
   assert.equal(state.transportMode,'NEGATIVE_PITCH_FULL_SUCTION_OFFLINE_DEMO_REFERENCE');
   assert.equal(state.returnBranchPolicy,'TRACKED_BLANK_BRANCHES_FROM_DECISION_SPLIT_TO_GOOD_OR_BAD_RETURN_ENTRY');
  }finally{sim.dispose();template.dispose();}
 }
});

test('V323 inspection truth lock fails closed on stale taxonomy installed-option promotion and detached process stations',()=>{
 const template=createMachineTemplate('BMJ-MCH-0020');
 try{
  template.root.userData.taxonomyVersion='shark650-v1-stale';
  template.root.userData.spec={...template.root.userData.spec,suffixDecoded:true};
  const detached=template.findNode('shark650-reject');detached.parent.remove(detached);
  const audit=validateInspectionTemplate(template,'BMJ-MCH-0020');
  assert.equal(audit.valid,false);
  assert.ok(audit.errors.some(e=>e.code==='TAXONOMY_VERSION'));
  assert.ok(audit.errors.some(e=>e.code==='INSTALLED_OPTION_BOUNDARY'&&String(e.detail).startsWith('suffixDecoded:')));
  assert.ok(audit.errors.some(e=>e.code==='CORE_NODE_DETACHED'&&e.detail==='shark650-reject'));
  assert.throws(()=>validateInspectionTemplate(template,'BMJ-MCH-0020',{throwOnError:true}),/Inspection runtime truth-lock failed/);
 }finally{template.dispose();}
});
