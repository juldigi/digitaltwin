import test from 'node:test';
import assert from 'node:assert/strict';
import {
 REMAINING_FLEET_RUNTIME_CONTRACTS,
 createMachineTemplate,
 createPolishedMachineTemplate,
 createMachineSimulation,
 validateRemainingFleetTemplate,
 validateRemainingFleetSimulation
} from '../frontend/src/machine-runtime.js';

const ids=['BMJ-MCH-0007','BMJ-MCH-0008','BMJ-MCH-0022','BMJ-MCH-0004','BMJ-MCH-0021','BMJ-MCH-0023','BMJ-MCH-0024'];

test('V330 remaining fleet assets pass fail-closed geometry and simulation truth contracts',()=>{
 for(const id of ids){
  const template=createPolishedMachineTemplate(id);
  try{
   const audit=validateRemainingFleetTemplate(template,id);
   assert.equal(audit.valid,true,id+': '+JSON.stringify(audit.errors));
   assert.equal(template.root.userData.remainingFleetRuntimeTruthVersion,'V330',id);
   assert.equal(template.root.userData.remainingFleetRuntimeTruthLock,'PASS',id);
   const sim=createMachineSimulation(id,template.root,template);
   try{
    const simAudit=validateRemainingFleetSimulation(sim,template,id);
    assert.equal(simAudit.valid,true,id+': '+JSON.stringify(simAudit.errors));
    assert.equal(template.root.userData.remainingFleetSimulationTruthVersion,'V330',id);
    assert.equal(template.root.userData.remainingFleetSimulationTruthLock,'PASS',id);
   }finally{sim.dispose();}
  }finally{template.dispose();}
 }
});

test('V330 three FZ1200 assets keep distinct BMJ identity while installed OEM ratings and layout stay unverified',()=>{
 const profiles=[['BMJ-MCH-0007','24RVOFS0920'],['BMJ-MCH-0008','2105080SF34'],['BMJ-MCH-0022','22000320']];
 for(const [id,serial] of profiles){
  const template=createMachineTemplate(id),u=template.root.userData,sim=createMachineSimulation(id,template.root,template);
  try{
   assert.equal(u.assetId,id);assert.equal(u.spec.model,'FZ 1200');assert.equal(u.spec.serial,serial);
   assert.equal(u.exactModelVerifiedFromBMJ,true);assert.equal(u.installedOemVerified,false);assert.equal(u.engineeringDimensions,false);
   for(const field of ['installedOemVerified','installedCapacityVerified','installedOpeningVerified','installedPowerVerified','installedEnvelopeVerified','installedHydraulicPressureVerified','installedOilTankVerified','installedNozzleCountVerified','installedBlowerLayoutVerified','installedCylinderCountVerified'])assert.equal(u.spec[field],false,id+':'+field);
   sim.start();let now=1000;sim.update(now);let seenTurn=false,seenAir=false,seenJog=false;
   for(let i=0;i<900;i++){
    now+=20;sim.update(now);const s=sim.state(),audit=validateRemainingFleetSimulation(sim,template,id);
    assert.equal(audit.valid,true,id+': '+JSON.stringify(audit.errors));
    if(s.turningActive){seenTurn=true;assert.equal(s.turnPermitted,true,id);assert.equal(s.clampConfirmed,true,id);assert.equal(s.liftClearance,true,id);}
    if(s.airingActive){seenAir=true;assert.equal(s.airPermitted,true,id);assert.equal(s.turnComplete,true,id);assert.equal(s.turnLockConfirmed,true,id);}
    if(s.joggingActive){seenJog=true;assert.equal(s.airPressureReady,true,id);}
   }
   assert.equal(seenTurn,true,id);assert.equal(seenAir,true,id);assert.equal(seenJog,true,id);
  }finally{sim.dispose();template.dispose();}
 }
});

test('V330 YA1A1A keeps exact identity mechanics visible but simulation blocked until BMJ transport and drive verification',()=>{
 const id='BMJ-MCH-0004',template=createMachineTemplate(id),u=template.root.userData,sim=createMachineSimulation(id,template.root,template);
 try{
  assert.equal(template.cfg.evidence.geometry,'YA1A1A_EXACT_IDENTITY__SHEETFED_GRAVURE_MECHANISM_REFERENCE');
  assert.equal(template.cfg.evidence.simulation,'BLOCKED');
  assert.equal(u.simulationStatus,'BLOCKED_PENDING_YA1A1A_TRANSPORT_DRIVE_VERIFICATION');
  assert.equal(u.gravureMechanismBoundary.exactIdentity,'YA1A1A');
  assert.equal(u.gravureMechanismBoundary.processFamily,'SHEET_FED_SINGLE_COLOR_GRAVURE');
  assert.equal(u.printingNip.verifiedGeometry,false);
  assert.equal(template.findNode('o7-ink-drop-option').userData.installedOptionVerified,false);
  assert.equal(template.findNode('universal-module-6-active').userData.installedDryerTechnologyVerified,false);
  assert.equal(template.findNode('o7-transmission').userData.installedTopologyVerified,false);
  const s=sim.state();
  assert.equal(s.available,false);assert.equal(s.blocked,true);assert.equal(s.stage,'Simulasi belum tervalidasi');
  sim.start();
  assert.equal(sim.state().active,false);
 }finally{sim.dispose();template.dispose();}
});

test('V330 QF-100CS stays a close-family blanking reference and never presses while the XY platform indexes',()=>{
 const id='BMJ-MCH-0021',template=createMachineTemplate(id),u=template.root.userData,sim=createMachineSimulation(id,template.root,template);
 try{
  assert.equal(u.exactModelPublicDocumentationFound,false);
  assert.equal(u.installedBlankingHeadCountVerified,false);
  assert.equal(u.installedCollectorStackerVerified,false);
  assert.equal(u.localSupplierFamilyEvidence.installationProof,false);
  assert.equal(u.localSupplierFamilyEvidence.exactModelEquivalenceProof,false);
  assert.equal(u.familyProcess.safetyInterlock,'PLATFORM_STOP_BEFORE_HYDRAULIC_STROKE');
  assert.equal(template.findNode('qf100-collector-option').userData.installedOptionVerified,false);
  assert.equal(template.findNode('qf100-separation-interface').userData.noInventedForkOrConveyor,true);
  sim.start();let now=1000,seenIndex=false,seenPress=false,seenSeparate=false;sim.update(now);
  for(let i=0;i<1200;i++){
   now+=20;sim.update(now);const s=sim.state(),audit=validateRemainingFleetSimulation(sim,template,id);
   assert.equal(audit.valid,true,JSON.stringify(audit.errors));
   seenIndex||=s.platformIndexing;seenPress||=s.blankingHeadPressing;seenSeparate||=s.blankerSeparationActive;
   assert.equal(s.platformIndexing&&s.blankingHeadPressing,false);
   if(s.blankingHeadPressing){assert.equal(s.blankerPlatformAtPress,true);assert.equal(s.blankerHydraulicPumpActive,true);assert.equal(s.blankerHydraulicValvePressActive,true);}
  }
  assert.equal(seenIndex,true);assert.equal(seenPress,true);assert.equal(seenSeparate,true);
 }finally{sim.dispose();template.dispose();}
});

test('V330 Collator keeps ten bins as cross-family visualization rather than installed BMJ count',()=>{
 const id='BMJ-MCH-0023',template=createMachineTemplate(id),u=template.root.userData,sim=createMachineSimulation(id,template.root,template);
 try{
  assert.equal(u.exactCollatorOemVerified,false);assert.equal(u.exactCollatorModelVerified,false);
  assert.equal(u.modeledReferenceBinCount,10);assert.equal(u.installedBinCountVerified,false);
  assert.equal(u.collatorAirArchitecture.installedTopologyVerified,false);
  assert.equal(u.collatorProcessBoundary,'TEN_BIN_DISPLAY_IS_CROSS_FAMILY_REFERENCE_NOT_BMJ_INSTALLED_COUNT');
  assert.equal(template.findNode('collator-downstream-boundary').userData.installedDownstreamFinisherVerified,false);
  sim.start();let now=1000,seenFeed=false,seenComplete=false;sim.update(now);
  for(let i=0;i<900;i++){
   now+=20;sim.update(now);const s=sim.state(),audit=validateRemainingFleetSimulation(sim,template,id);
   assert.equal(audit.valid,true,JSON.stringify(audit.errors));
   if(s.activeBinFeeds>0){seenFeed=true;assert.equal(s.doubleFeedCheckActive,true);assert.equal(s.collatorSuctionBlowerActive,true);assert.ok(s.activeFeedBinIndexes.every(index=>index>=0&&index<10));if(s.activeFeedBinIndexes.length){assert.equal(s.airSeparationActive,true);assert.equal(s.rotorPickupActive,true);assert.equal(s.collatorSeparationAirControlActive,true);}}
   seenComplete||=s.completedSheetsInSet>0;
  }
  assert.equal(seenFeed,true);assert.equal(seenComplete,true);
 }finally{sim.dispose();template.dispose();}
});

test('V330 UPG-LY300 preserves print-cure-inspect-decision causality and demo-only reject truth',()=>{
 const id='BMJ-MCH-0024',template=createMachineTemplate(id),u=template.root.userData,sim=createMachineSimulation(id,template.root,template);
 try{
  assert.equal(u.spec.model,'UPG-LY300');
  assert.equal(u.spec.installedPrintheadCountVerified,false);
  assert.equal(u.spec.installedCoronaTreatmentVerified,false);
  assert.equal(u.spec.installedCollectionStrapperVerified,false);
  assert.equal(template.findNode('ly300-print-head').userData.installedPrintheadCountVerified,false);
  assert.equal(template.findNode('ly300-collect-strap').userData.installedStrapperVerified,false);
  sim.start();let now=1000,seenPrint=false,seenUv=false,seenCamera=false,seenDecision=false;sim.update(now);
  for(let i=0;i<1000;i++){
   now+=20;sim.update(now);const s=sim.state(),audit=validateRemainingFleetSimulation(sim,template,id);
   assert.equal(audit.valid,true,JSON.stringify(audit.errors));
   seenPrint||=s.printingActive;seenUv||=s.uvActive;seenCamera||=s.cameraActive;seenDecision||=s.decisionReady;
   if(s.uvActive)assert.equal(s.uvPermit,true);
   if(s.cameraActive)assert.equal(s.cameraTrigger,true);
   if(s.demoRejectActive)assert.equal(s.rejectPermit,true);if(s.rejectConfirmed){assert.equal(s.inspectionComplete,true);assert.equal(s.decisionReady,true);}
   assert.equal(s.demoRejectOnly,true);
  }
  assert.equal(seenPrint,true);assert.equal(seenUv,true);assert.equal(seenCamera,true);assert.equal(seenDecision,true);
 }finally{sim.dispose();template.dispose();}
});

test('V330 remaining-fleet truth lock fails closed on promoted unknowns detached process nodes and accidentally enabled gravure simulation',()=>{
 const blanker=createMachineTemplate('BMJ-MCH-0021');
 try{
  blanker.findNode('qf100-collector-option').userData.installedOptionVerified=true;
  const detached=blanker.findNode('qf100-head-ram');detached.parent.remove(detached);
  const audit=validateRemainingFleetTemplate(blanker,'BMJ-MCH-0021');
  assert.equal(audit.valid,false);
  assert.ok(audit.errors.some(e=>e.code==='BLANKER_COLLECTOR_PROMOTED'));
  assert.ok(audit.errors.some(e=>e.code==='CORE_NODE_DETACHED'&&e.detail==='qf100-head-ram'));
  assert.throws(()=>validateRemainingFleetTemplate(blanker,'BMJ-MCH-0021',{throwOnError:true}),/Remaining-fleet runtime truth-lock failed/);
 }finally{blanker.dispose();}

 const gravure=createMachineTemplate('BMJ-MCH-0004'),sim=createMachineSimulation('BMJ-MCH-0004',gravure.root,gravure);
 try{
  sim.blocked=false;
  const audit=validateRemainingFleetSimulation(sim,gravure,'BMJ-MCH-0004');
  assert.equal(audit.valid,false);
  assert.ok(audit.errors.some(e=>e.code==='GRAVURE_MUST_REMAIN_BLOCKED'));
 }finally{sim.dispose();gravure.dispose();}
});

test('V330 contracts cover the previously unguarded fleet only',()=>{
 assert.deepEqual(Object.keys(REMAINING_FLEET_RUNTIME_CONTRACTS).sort(),['BMJ-MCH-0004','BMJ-MCH-0007','BMJ-MCH-0008','BMJ-MCH-0021','BMJ-MCH-0022','BMJ-MCH-0023','BMJ-MCH-0024'].sort());
});
