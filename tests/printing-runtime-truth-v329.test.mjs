import test from 'node:test';
import assert from 'node:assert/strict';
import {
 PRINTING_RUNTIME_CONTRACTS,
 createMachineTemplate,
 createPolishedMachineTemplate,
 createMachineSimulation,
 validatePrintingTemplate,
 validatePrintingSimulation
} from '../frontend/src/machine-runtime.js';

const ids=['BMJ-MCH-0001','BMJ-MCH-0002','BMJ-MCH-0005','BMJ-MCH-0006','BMJ-MCH-0009'];

test('V329 all five Printing assets pass fail-closed runtime truth contracts',()=>{
 for(const id of ids){
  const template=createPolishedMachineTemplate(id);
  try{
   const audit=validatePrintingTemplate(template,id);
   assert.equal(audit.valid,true,id+': '+JSON.stringify(audit.errors));
   assert.deepEqual(audit.errors,[],id);
   assert.equal(template.root.userData.printingRuntimeTruthVersion,'V329',id);
   assert.equal(template.root.userData.printingRuntimeTruthLock,'PASS',id);
   const sim=createMachineSimulation(id,template.root,template);
   try{
    const simAudit=validatePrintingSimulation(sim,template,id);
    assert.equal(simAudit.valid,true,id+': '+JSON.stringify(simAudit.errors));
    assert.equal(template.root.userData.printingSimulationTruthVersion,'V329',id);
    assert.equal(template.root.userData.printingSimulationTruthLock,'PASS',id);
   }finally{sim.dispose();}
  }finally{template.dispose();}
 }
});

test('V329 POLAR remains the BMJ photo-handed EM-MON cutter with safety-chain truth intact',()=>{
 const id='BMJ-MCH-0001',template=createMachineTemplate(id),u=template.root.userData,sim=createMachineSimulation(id,template.root,template);
 try{
  assert.equal(u.model,'115 EM MON');
  assert.equal(u.serial,'5831536');
  assert.equal(u.photoRevision,'V260_FOUR_BMJ_PHOTO_ANGLES');
  assert.equal(u.actualPhotoEvidence,'BMJ-POLAR-PHOTOS-2026-09');
  assert.match(u.photoOrientation,/PERFORATED_TABLE_FRONT_RIGHT/);
  assert.match(u.photoOrientation,/DRIVE_REAR_LEFT/);
  assert.equal(template.findNode('polar-safety-twohand').userData.simultaneityControlReference,true);
  assert.equal(template.findNode('polar-safety-twohand').userData.antiRepeatReference,true);
  const s=sim.state();
  assert.equal(s.safetyReference.twoHandSimultaneity,true);
  assert.equal(s.safetyReference.antiRepeat,true);
  assert.equal(s.safetyReference.lightBarrierStopsClampAndKnife,true);
  assert.equal(s.materialSplit.conserved,true);
 }finally{sim.dispose();template.dispose();}
});

test('V329 Sheeting keeps actual right-to-left single-reel geometry and refuses speculative internal knife hardware',()=>{
 const id='BMJ-MCH-0002',template=createMachineTemplate(id),u=template.root.userData,sim=createMachineSimulation(id,template.root,template);
 try{
  assert.equal(u.processDirection,'RIGHT_TO_LEFT');
  assert.equal(u.processFlow.direction,'RIGHT_TO_LEFT');
  assert.equal(u.researchVersion,'V197');
  assert.equal(u.processFlow.unwindArchitecture,'ONE_LOADED_REEL__LEFT_RIGHT_ARM_PAIR__TWO_SIDE_HYDRAULIC_SUPPORTS__NO_LONGITUDINAL_SECOND_STATION');
  assert.equal(u.processFlow.cutterArchitecture,'HSM56_FLAT_BED_KNIFE_WORDING_ONLY__BMJ_INTERNAL_MECHANISM_NOT_VISIBLE__NO_SPECULATIVE_FLY_KNIFE_GEOMETRY');
  assert.equal(template.findNode('sheeting-knife').userData.visibleKnifeGeometry,false);
  assert.equal(template.findNode('sheeting-flatbed-cutter-family')?.children.length||0,0);
  assert.equal(template.findNode('sheeting-cut-takeaway-pinch')?.children.length||0,0);
  const s=sim.state();
  assert.equal(s.bladeVisible,false);
  assert.equal(s.bladeCount,0);
  assert.equal(s.visibleKnifeGeometry,false);
  assert.equal(s.cutterMode,'GUARDED_CROSS_CUT__INTERNAL_MECHANISM_UNRESOLVED');
  assert.equal(s.detachedSheetStartsWithTrailingEdgeAtCutPoint,true);
 }finally{sim.dispose();template.dispose();}
});

test('V329 Offset 8 locks LYYL sequence without inventing UV IR LED dryer technology or exact roller counts',()=>{
 const id='BMJ-MCH-0005',template=createMachineTemplate(id),u=template.root.userData,sim=createMachineSimulation(id,template.root,template);
 try{
  assert.equal(u.spec.configuration,'8 PU + L + Y + Y + L');
  assert.equal(u.dryerEnergyTechnology,'UNASSERTED');
  assert.equal(u.spec.dryerEnergyTechnologyVerified,false);
  for(const y of ['offset8-y1','offset8-y2'])assert.equal(template.findNode(y).userData.energyTechnologyVerified,false,y);
  for(let i=1;i<=8;i++){
   assert.equal(template.findNode('offset8-pu'+i+'-inking').userData.exactRollerCountVerified,false,'PU'+i+' ink');
   assert.equal(template.findNode('offset8-pu'+i+'-dampening').userData.exactRollerCountVerified,false,'PU'+i+' damp');
  }
  const s=sim.state();
  assert.equal(s.realismPack,'OFFSET8_CX104_8LYYL_FINAL_REFINEMENT_R2');
  assert.equal(s.dryerEnergyTechnology,'UNASSERTED');
  assert.equal(s.uvLampCount,0);
  assert.equal(s.uvActive,false);
  assert.equal(s.duplicateProcessHardwareAdded,false);
 }finally{sim.dispose();template.dispose();}
});

test('V329 Offset 9 keeps SX52 4+L option boundaries and does not promote unverified high-pile Venturi',()=>{
 const id='BMJ-MCH-0006',template=createMachineTemplate(id),u=template.root.userData,sim=createMachineSimulation(id,template.root,template);
 try{
  assert.equal(u.spec.serial,'GS001804');
  assert.equal(u.spec.configuration,'4 PU + L');
  assert.equal(u.spec.deliveryPileOptionVerified,false);
  assert.equal(u.spec.dryerInstalledVerified,false);
  assert.equal(u.spec.perfectorInstalledVerified,false);
  assert.equal(template.findNode('offset9-delivery').userData.pileHeightOptionVerified,false);
  const s=sim.state();
  assert.equal(s.simulationBoundary,'SX52_4L_PROCESS__OPTIONS_NOT_INFERRED');
  assert.equal(s.deliveryVenturiInstalledVerified,false);
  assert.equal(s.airGuidanceActive,false);
  assert.equal(s.uvLampCount,0);
 }finally{sim.dispose();template.dispose();}
});

test('V329 Offset 10 preserves project-documented 11 PU 3 coating 2 Y FoilStar and nine UV lamps',()=>{
 const id='BMJ-MCH-0009',template=createMachineTemplate(id),u=template.root.userData,sim=createMachineSimulation(id,template.root,template);
 try{
  assert.equal(u.assetId,'MACHINE-OFFSET10');
  assert.equal(u.dimensionAudit.printingUnits,11);
  assert.equal(u.dimensionAudit.coatingUnits,3);
  assert.equal(u.dimensionAudit.yUnits,2);
  let lamps=0,beams=0;
  for(const nodeId of ['o10-y1-uv','o10-y2-uv','o10-eop-uv'])template.findNode(nodeId).traverse(o=>{if(o.userData?.uvLamp)lamps++;if(o.userData?.uvBeam)beams++;});
  assert.equal(lamps,9);assert.equal(beams,9);
  let unwind=0,rewind=0;template.findNode('o10-foilstar-rolls').traverse(o=>{if(o.userData?.foilReel==='unwind')unwind++;if(o.userData?.foilReel==='rewind')rewind++;});
  assert.equal(unwind,6);assert.equal(rewind,6);
  const s=sim.state();
  assert.equal(s.uvLampCount,9);
  assert.equal(s.realismPack,'OFFSET10_CX104_SPECIAL_FINAL_REFINEMENT_R2');
  assert.equal(s.duplicateProcessHardwareAdded,false);
  assert.equal(s.motionPolicy,'PROJECT_DOCUMENTED_MOVING_PARTS_ONLY__NO_COVER_OR_SERVICE_MOTION');
 }finally{sim.dispose();template.dispose();}
});

test('V329 Printing truth lock fails closed when a source boundary is promoted or a core process node is detached',()=>{
 const offset8=createMachineTemplate('BMJ-MCH-0005');
 try{
  offset8.findNode('offset8-y1').userData.energyTechnologyVerified=true;
  const detached=offset8.findNode('offset8-delivery-brake');detached.parent.remove(detached);
  const audit=validatePrintingTemplate(offset8,'BMJ-MCH-0005');
  assert.equal(audit.valid,false);
  assert.ok(audit.errors.some(e=>e.code==='OFFSET8_Y_ENERGY_PROMOTED'&&e.detail==='offset8-y1'));
  assert.ok(audit.errors.some(e=>e.code==='CORE_NODE_DETACHED'&&e.detail==='offset8-delivery-brake'));
  assert.throws(()=>validatePrintingTemplate(offset8,'BMJ-MCH-0005',{throwOnError:true}),/Printing runtime truth-lock failed/);
 }finally{offset8.dispose();}

 const sheeting=createMachineTemplate('BMJ-MCH-0002');
 try{
  sheeting.findNode('sheeting-knife').userData.visibleKnifeGeometry=true;
  const audit=validatePrintingTemplate(sheeting,'BMJ-MCH-0002');
  assert.equal(audit.valid,false);
  assert.ok(audit.errors.some(e=>e.code==='SHEETING_VISIBLE_KNIFE_BOUNDARY'));
 }finally{sheeting.dispose();}
});

test('V329 contracts cover only the intended Printing pilot group and do not overlap Offset 5',()=>{
 assert.deepEqual(Object.keys(PRINTING_RUNTIME_CONTRACTS).sort(),['BMJ-MCH-0001','BMJ-MCH-0005','BMJ-MCH-0006','offset10','sheeting'].sort());
 assert.equal(PRINTING_RUNTIME_CONTRACTS.offset5,undefined);
});
