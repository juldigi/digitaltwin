import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {OFFSET5_DIMENSIONS,OFFSET5_UNIT_CENTERS,offset5DimensionAudit} from '../frontend/src/data/dimensions-offset5.js';
import {Offset5CD102RealismTemplate,Offset5CD102RealismSimulation} from '../frontend/src/offset5-realism.js';

test('V253 preserves the user-confirmed custom installed Offset 5 dimensions',()=>{
 const d=OFFSET5_DIMENSIONS,a=offset5DimensionAudit();
 assert.equal(d.revision,'offset5-dimensional-contract-v36');
 assert.equal(d.structuralBody.length,26.00);
 assert.equal(d.structuralBody.width,3.92);
 assert.equal(d.serviceInclusive.length,27.00);
 assert.equal(d.serviceInclusive.width,4.60);
 assert.equal(d.repeatedPitch.value,1.95);
 assert.equal(d.layout.printingUnitPitch,1.95);
 assert.equal(OFFSET5_UNIT_CENTERS.length,8);
 for(let i=1;i<OFFSET5_UNIT_CENTERS.length;i++)assert.ok(Math.abs(OFFSET5_UNIT_CENTERS[i]-OFFSET5_UNIT_CENTERS[i-1]-1.95)<1e-9);
 assert.ok(a.puGap>=.72,'custom inter-PU access bay must remain broad');
 assert.ok(a.pu1ToPU2Gap>=.74,'custom PU1-PU2 access bay must remain broad');
 assert.ok(a.pu8ToCoaterGap>=.74,'custom PU8/coater access must remain broad');
 assert.ok(a.coaterToDryerGap>=.64,'custom coater/dryer transition must remain broad');
 assert.ok(a.dryerToDeliveryGap>=.69,'custom dryer/delivery transition must remain broad');
});

test('V253 keeps BMJ OS/DS orientation and broad custom inter-unit access',()=>{
 const m=new Offset5CD102RealismTemplate();
 try{
  assert.equal(m.root.userData.sideAlignment,'PHOTO_VERIFIED_OPERATOR_NEGATIVE_Z');
  assert.equal(m.root.userData.driveSideAlignment,'PHOTO_VERIFIED_DRIVE_POSITIVE_Z');
  assert.equal(m.root.userData.realismPack,'OFFSET5_CD102_8L_CUSTOM_INSTALLED_REALITY_R4');
  assert.equal(m.root.userData.dimensionLock,'BMJ_CUSTOM_INSTALLED_DIMENSIONS_DO_NOT_NORMALIZE_TO_GENERIC_CD102');
  for(let i=0;i<7;i++){
   const frameA=new THREE.Box3().setFromObject(m.findNode(`press-${i}-frame`));
   const frameB=new THREE.Box3().setFromObject(m.findNode(`press-${i+1}-frame`));
   const landing=new THREE.Box3().setFromObject(m.findNode(`press-${i}-gap-footplate`));
   const transfer=new THREE.Box3().setFromObject(m.findNode(`transfer-pu${i+1}-pu${i+2}`));
   assert.ok(frameB.min.x-frameA.max.x>=.72,`PU${i+1}/PU${i+2} custom access gap was compacted`);
   assert.ok(landing.min.x<=frameA.max.x+.01&&landing.max.x>=frameB.min.x-.01,`PU${i+1}/PU${i+2} landing no longer spans the custom access bay`);
   assert.ok(landing.max.y>=transfer.max.y+.15,`PU${i+1}/PU${i+2} landing is not above the gripper transfer`);
  }
 }finally{m.dispose();}
});

test('V253 Offset 5 simulation uses 720 mm machine-direction sheet pitch, no fake colour bands, and realistic delivery release',()=>{
 const m=new Offset5CD102RealismTemplate(),sim=new Offset5CD102RealismSimulation(m.root,m);
 try{
  assert.equal(sim.nominalSheetsPerHour,15000);
  assert.deepEqual([sim.sheetLength,sim.sheetWidth],[.72,1.02]);
  assert.equal(sim.sheetPitchMeters,.72);
  assert.ok(Math.abs(sim.baseMetersPerSecond-3.0)<1e-9);
  const st=sim.state();
  assert.equal(st.customMachineDimensionsPreserved,true);
  assert.equal(st.printRepresentation,'CUMULATIVE_FULL_SHEET_REFERENCE_TINT_NO_FAKE_BANDS');
  assert.equal(st.dimensionPolicy,'USER_CONFIRMED_CUSTOM_INSTALLED_GEOMETRY_OVERRIDES_GENERIC_FAMILY_DIMENSIONS');
  assert.equal(st.focusightLocationPolicy,'DOWNSTREAM_AFTER_COATING_DRYING');
  assert.equal(st.interUnitAccessPolicy,'BMJ_CUSTOM_BROAD_INTERUNIT_ACCESS_AND_OS_DS_STEPS_PRESERVED');
  sim.start();sim.update(0);
  let sawRelease=false,sawInspection=false;
  for(let ms=16;ms<=14000;ms+=16){
   sim.update(ms);const s=sim.state();
   sawRelease ||= s.deliveryReleaseActive;
   sawInspection ||= s.inspectionTriggerActive;
  }
  assert.equal(sawInspection,true);
  assert.equal(sawRelease,true);
  assert.ok(sim.completed>0);
  assert.ok(sim.sheets.every(sheet=>sheet.userData.printRepresentation==='CUMULATIVE_FULL_SHEET_REFERENCE_TINT_NO_FAKE_BANDS'));
 }finally{sim.dispose();m.dispose();}
});
