import test from 'node:test';
import assert from 'node:assert/strict';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {V201_SOURCE_LEDGER,V201_SOURCE_STATS} from '../frontend/src/data/research-v201.js';

const collect=(root,re)=>{
 const out=[];root.traverse(o=>{if(re.test(String(o.userData?.semantic||'')))out.push(o);});return out;
};

test('V201 keeps all V200 structural, room, collision and machine-placement invariants',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),meta=built.root.userData,s=meta.buildingDetailStats;
 assert.equal(meta.researchVersion,'V201');
 assert.equal(meta.buildingDetailPass,'V201_CONTEXTUAL_MACHINE_SIDE_SUPPORT_AND_ARCHITECTURAL_MICRODETAIL');
 assert.equal(meta.exteriorEnvelopeAudit.openGapCount,0);
 assert.equal(s.chairFacingErrors,0);
 assert.equal(s.visitorChairFacingErrors,0);
 assert.equal(s.meetingChairFacingErrors,0);
 assert.equal(meta.nonMachineCollisionAudit.accidentalFixtureOverlaps,0);
 assert.ok(meta.roomProgramAudit.every(r=>r.program!=='UNRESOLVED'&&r.status==='POPULATED_FUNCTIONAL_REFERENCE'));
 for(const p of layout.placements.filter(p=>p.status!=='UNIDENTIFIED')){
  const g=built.assets.get(p.machineId);if(!g)continue;
  assert.equal(g.position.x,p.x,p.machineId+' x moved');
  assert.equal(g.position.z,-p.y,p.machineId+' y moved');
  assert.equal(g.rotation.y,p.rotation*Math.PI/180,p.machineId+' rotation changed');
 }
});

test('V201 contextual machine-side support belongs to the correct process family',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),audit=built.root.userData.contextualMachineSupportAudit,s=built.root.userData.buildingDetailStats;
 assert.ok(Array.isArray(audit));
 assert.ok(audit.length>0);
 assert.equal(audit.length,s.contextualSupportStations);
 const familyRe={
  PRINTING:/OFFSET|PRINT/i,
  CUTTING:/SHEET|POLAR|CUTTER/i,
  AUTOPLATEN:/AUTOPLATEN|\bAP\b|DIE.?CUT/i,
  FOLDER:/FOLDER|GLUER|FGM/i
 };
 for(const item of audit){
  const p=layout.placements.find(x=>x.machineId===item.machineId);
  assert.ok(p,item.machineId);
  assert.ok(familyRe[item.family].test(String(p.label||'')),item.family+' -> '+p.label);
  assert.ok(Number.isFinite(item.x)&&Number.isFinite(item.y));
 }
 const primary=audit.filter(x=>x.primarySupport);
 assert.equal(primary.length,s.trolleyParkingBays);
});

test('V201 prints realistic support families only when corresponding machine families exist',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),s=built.root.userData.buildingDetailStats;
 const labels=layout.placements.map(p=>String(p.label||'')).join(' ');
 if(/OFFSET|PRINT/i.test(labels))assert.ok(s.printingProofRacks>0);
 if(/SHEET|POLAR|CUTTER/i.test(labels)){assert.ok(s.sheetHandlingTrolleys>0);assert.ok(s.trimWasteCarts>0);}
 if(/AUTOPLATEN|\bAP\b|DIE.?CUT/i.test(labels))assert.ok(s.dieToolTrolleys>0);
 if(/FOLDER|GLUER|FGM/i.test(labels))assert.ok(s.cartonBlankTrolleys>0);
});

test('V201 makes contextual support visible and designated rather than free-floating clutter',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root;
 const families=[
  /PRINTING_PROOF_SAMPLE_RACK_REFERENCE$/,
  /CUTTING_CUT_SHEET_HANDLING_TROLLEY_REFERENCE$/,
  /AUTOPLATEN_DIE_TOOL_TROLLEY_REFERENCE$/,
  /FOLDER_CARTON_BLANK_TROLLEY_REFERENCE$/
 ];
 let visibleFamilies=0;
 for(const re of families){
  const found=collect(root,re);if(!found.length)continue;
  visibleFamilies++;
  assert.ok(found.every(o=>o.visible));
 }
 assert.ok(visibleFamilies>=2);
 const bays=collect(root,/_PARKING_BAY_REFERENCE$/);
 assert.ok(bays.length>0);
 assert.ok(bays.every(o=>o.visible));
});

test('V201 RMS gains organised material-status staging while preserving wrapped paperboard handling',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root;
 const staging=collect(root,/^RMS_MATERIAL_STATUS_STAGING_REFERENCE$/);
 const zones=collect(root,/^RMS_MATERIAL_STATUS_ZONE_REFERENCE$/);
 assert.equal(staging.length,1);
 assert.equal(zones.length,3);
 assert.ok(staging[0].visible&&zones.every(o=>o.visible));
 const accl=collect(root,/^RMS_PAPERBOARD_ACCLIMATISATION_STATUS_TAG_REFERENCE$/);
 assert.ok(accl.length>0);
 assert.ok(accl.every(o=>o.userData.industryReference?.keepWrappedUntilAcclimatised===true));
});

test('V201 room access can carry visible room nameplates without changing access resolution',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),meta=built.root.userData,s=meta.buildingDetailStats;
 assert.ok(meta.roomProgramAudit.every(r=>['SOURCE_DOOR','FUNCTIONAL_REFERENCE_DOOR'].includes(r.access)));
 if(s.roomsWithReferenceAccessDoor>0){
  assert.equal(s.roomDoorNameplates,s.roomsWithReferenceAccessDoor);
  const plates=collect(built.root,/^ROOM_DOOR_NAMEPLATE_REFERENCE$/);
  assert.equal(plates.length,s.roomDoorNameplates);
  assert.ok(plates.every(o=>o.visible));
 }
});

test('V201 roof microdetail enriches the roof layer without obstructing the default interior scene',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),s=built.root.userData.buildingDetailStats;
 assert.ok(s.roofInsulationBlankets>0);
 assert.ok(s.roofDaylightReferences>0);
 assert.equal(built.layers.roof.visible,false);
 const blankets=collect(built.root,/^ROOF_INSULATION_BLANKET_REFERENCE$/);
 const daylight=collect(built.root,/^ROOF_TRANSLUCENT_DAYLIGHT_PANEL_REFERENCE$/);
 assert.ok(blankets.length>0&&daylight.length>0);
});

test('V201 still keeps uncertain safety and MEP placement hidden',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet);
 const safety=collect(built.root,/FIRE_EXTINGUISHER_REFERENCE|EMERGENCY_LUMINAIRE_REFERENCE|CONVEX_MIRROR_REFERENCE/);
 assert.ok(safety.length>0&&safety.every(o=>o.visible===false));
 for(const layer of ['utility_compressed_air','utility_ahu_piping','utility_ahu_ducting','utility_anchors'])assert.equal(built.layers[layer].visible,false);
});

test('V201 research ledger covers printing-specific storage, housekeeping, loading and paperboard conditioning',()=>{
 assert.ok(V201_SOURCE_STATS.newReviewed>=7);
 assert.equal(V201_SOURCE_STATS.total,V201_SOURCE_LEDGER.length);
 assert.equal(V201_SOURCE_STATS.uniqueUrls,V201_SOURCE_LEDGER.length);
 for(const id of [
  'V201-EPA-COMMERCIAL-PRINTING','V201-HSE-PRINT-SLIPS','V201-HSE-PRINT-COSHH',
  'V201-HSE-PRINT-ESSENTIALS','V201-OSHA-WAREHOUSE','V201-OSHA-DOCKBOARD','V201-STORA-PAPERBOARD'
 ])assert.ok(V201_SOURCE_LEDGER.some(s=>s.id===id),id);
});
