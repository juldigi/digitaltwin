import test from 'node:test';
import assert from 'node:assert/strict';
import {
 PDS_RUNTIME_CONTRACTS,
 createMachineTemplate,
 createPolishedMachineTemplate,
 createMachineSimulation,
 validatePdsTemplate,
 validatePdsSimulation
} from '../frontend/src/machine-runtime.js';

const ids=['BMJ-MCH-0025','BMJ-MCH-0026','BMJ-MCH-0027','BMJ-MCH-0028'];

test('V324 all four PDS assets pass fail-closed runtime truth contracts',()=>{
 for(const id of ids){
  const template=createPolishedMachineTemplate(id);
  try{
   const audit=validatePdsTemplate(template,id);
   assert.equal(audit.valid,true,id);
   assert.deepEqual(audit.errors,[],id);
   assert.equal(template.root.userData.pdsRuntimeTruthLock,'PASS',id);
   assert.equal(template.root.userData.pdsRuntimeTruthVersion,'V324',id);
   const sim=createMachineSimulation(id,template.root,template);
   try{
    const simAudit=validatePdsSimulation(sim,template,id);
    assert.equal(simAudit.valid,true,id);
    assert.equal(template.root.userData.pdsSimulationTruthLock,'PASS',id);
   }finally{sim.dispose();}
  }finally{template.dispose();}
 }
});

test('V324 CTP-1 and CTP-2 remain separate BMJ assets without inventing Suprasetter model format loader or options',()=>{
 for(const id of ['BMJ-MCH-0025','BMJ-MCH-0026']){
  const template=createMachineTemplate(id),u=template.root.userData;
  try{
   assert.equal(u.assetId,id);
   assert.equal(u.exactSuprasetterModelVerified,false);
   assert.equal(u.exactPlateFormatVerified,false);
   assert.equal(u.installedLoaderTypeVerified,false);
   assert.deepEqual(u.familyCandidates,['A52','A75','A106','106']);
   for(const optionId of PDS_RUNTIME_CONTRACTS[id].optionNodes)assert.equal(template.findNode(optionId).userData.installedOptionVerified,false,optionId);
   assert.equal(template.findNode('ctp-ids').userData.installedDiodeCountVerified,false);
  }finally{template.dispose();}
 }
});

test('V324 CTP exposure and unload cannot outrun register clamp encoder and release interlocks',()=>{
 for(const id of ['BMJ-MCH-0025','BMJ-MCH-0026']){
  const template=createMachineTemplate(id),sim=createMachineSimulation(id,template.root,template);
  try{
   sim.start();let now=1000,seenExposure=false,seenUnload=false;sim.update(now);
   for(let i=0;i<1500;i++){
    now+=20;sim.update(now);const s=sim.state();
    if(s.ctpExposureActive){
     seenExposure=true;
     assert.equal(s.ctpExposurePermit,true,id);
     assert.equal(s.ctpPlatePresent,true,id);
     assert.equal(s.ctpRegisterConfirmed,true,id);
     assert.equal(s.ctpClampConfirmed,true,id);
     assert.equal(s.ctpDrumEncoderSync,true,id);
     assert.equal(s.ctpLaserTraverseActive,true,id);
     assert.equal(s.ctpInterlockSafe,true,id);
    }
    if(s.ctpUnloadPermit){seenUnload=true;assert.equal(s.ctpClampConfirmed,false,id);}
   }
   assert.equal(seenExposure,true,id);assert.equal(seenUnload,true,id);
  }finally{sim.dispose();template.dispose();}
 }
});

test('V324 SCREEN CTF stays FT-R/Katana family-only and gates exposure/cutter by real modeled permits',()=>{
 const id='BMJ-MCH-0027',template=createMachineTemplate(id),u=template.root.userData,sim=createMachineSimulation(id,template.root,template);
 try{
  assert.equal(u.exactScreenModelVerified,false);
  assert.equal(u.exactLaserWavelengthVerified,false);
  assert.equal(u.processArchitecture,'CAPSTAN_FLATBED_SCAN__NOT_IMAGING_DRUM');
  assert.equal(u.katanaPolygonReference.installedApplicabilityVerified,false);
  for(const optionId of PDS_RUNTIME_CONTRACTS[id].optionNodes)assert.equal(template.findNode(optionId).userData.installedOptionVerified,false,optionId);
  sim.start();let now=1000,seenExposure=false,seenCut=false;sim.update(now);
  for(let i=0;i<1500;i++){
   now+=20;sim.update(now);const s=sim.state();
   if(s.exposureActive){
    seenExposure=true;assert.equal(s.imagesetterExposurePermit,true);assert.equal(s.imagesetterMediaPresent,true);assert.equal(s.imagesetterTensionValid,true);assert.equal(s.imagesetterCapstanEncoderActive,true);assert.equal(s.imagesetterPolygonAtSpeed,true);assert.equal(s.imagesetterInterlockSafe,true);
   }
   if(s.cuttingActive){
    seenCut=true;assert.equal(s.imagesetterCutterPermit,true);assert.equal(s.imagesetterExposureComplete,true);assert.equal(s.imagesetterMediaPresent,true);assert.equal(s.imagesetterInterlockSafe,true);
   }
  }
  assert.equal(seenExposure,true);assert.equal(seenCut,true);
 }finally{sim.dispose();template.dispose();}
});

test('V324 Zund moves only bounded vacuum/XY platform reference and never invents an installed cutting tool',()=>{
 const id='BMJ-MCH-0028',template=createMachineTemplate(id),u=template.root.userData,sim=createMachineSimulation(id,template.root,template);
 try{
  for(const field of ['exactZundModelVerified','installedToolPackageVerified','installedIccVerified','installedItiVerified','installedArcVerified','installedMaterialHandlingVerified'])assert.equal(u[field],false,field);
  for(const optionId of PDS_RUNTIME_CONTRACTS[id].optionNodes)assert.equal(template.findNode(optionId).userData.installedOptionVerified,false,optionId);
  sim.start();let now=1000,seenVacuum=false,seenAxis=false;sim.update(now);
  for(let i=0;i<1200;i++){
   now+=20;sim.update(now);const s=sim.state();
   seenVacuum||=s.vacuumHoldActive;seenAxis||=s.zundAxisMotionActive;
   assert.equal(s.zundToolActionActive,false);
   assert.equal(s.toolActionEnabled,false);
   assert.equal(s.installedToolPackageVerified,false);
   assert.equal(s.registrationCameraInstalledVerified,false);
   assert.equal(s.toolInitializationInstalledVerified,false);
   assert.equal(s.zundVacuumControlActive,s.vacuumHoldActive);
   assert.equal(s.zundVacuumContactActive,s.vacuumHoldActive);
   assert.equal(s.zundVacuumMode,s.vacuumHoldActive?'HOLD':'RELEASE');
  }
  assert.equal(seenVacuum,true);assert.equal(seenAxis,true);
 }finally{sim.dispose();template.dispose();}
});

test('V324 PDS truth lock fails closed on promoted option stale evidence route and detached core process node',()=>{
 const template=createMachineTemplate('BMJ-MCH-0027');
 try{
  template.findNode('ctf-punch-option').userData.installedOptionVerified=true;
  template.cfg={...template.cfg,evidence:{...template.cfg.evidence,geometry:'PLACEHOLDER'}};
  const detached=template.findNode('ctf-cutter');detached.parent.remove(detached);
  const audit=validatePdsTemplate(template,'BMJ-MCH-0027');
  assert.equal(audit.valid,false);
  assert.ok(audit.errors.some(e=>e.code==='OPTION_BOUNDARY_PROMOTED'&&e.detail==='ctf-punch-option'));
  assert.ok(audit.errors.some(e=>e.code==='EVIDENCE_GEOMETRY'));
  assert.ok(audit.errors.some(e=>e.code==='CORE_NODE_DETACHED'&&e.detail==='ctf-cutter'));
  assert.throws(()=>validatePdsTemplate(template,'BMJ-MCH-0027',{throwOnError:true}),/PDS runtime truth-lock failed/);
 }finally{template.dispose();}
});
