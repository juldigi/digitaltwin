import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {OFFSET5_DIMENSIONS,OFFSET5_UNIT_CENTERS,offset5DimensionAudit} from '../frontend/src/data/dimensions-offset5.js';
import {Offset5CD102RealismTemplate,Offset5CD102RealismSimulation} from '../frontend/src/offset5-realism.js';

test('V251 Offset 5 restores a compact 102-platform process pitch instead of stretching inter-unit access',()=>{
 const d=OFFSET5_DIMENSIONS,a=offset5DimensionAudit();
 assert.equal(d.revision,'offset5-dimensional-contract-v37-reality-recalibration');
 assert.equal(d.repeatedPitch.value,1.22);
 assert.equal(d.layout.printingUnitPitch,1.22);
 assert.equal(OFFSET5_UNIT_CENTERS.length,8);
 for(let i=1;i<OFFSET5_UNIT_CENTERS.length;i++)assert.ok(Math.abs(OFFSET5_UNIT_CENTERS[i]-OFFSET5_UNIT_CENTERS[i-1]-1.22)<1e-9);
 assert.ok(d.structuralBody.length<20&&d.structuralBody.length>15);
 assert.ok(d.structuralBody.width>=2.9&&d.structuralBody.width<=3.4);
 assert.ok(a.puGap>=.08&&a.puGap<=.16,'compact seam gap should not become a fake human-width process bay');
 assert.ok(a.feederToBoardGap>=-.05&&a.feederToBoardGap<.15);
 assert.ok(a.pu8ToCoaterGap>=0&&a.pu8ToCoaterGap<.25);
 assert.ok(a.coaterToDryerGap>=0&&a.coaterToDryerGap<.30);
 assert.ok(a.dryerToDeliveryGap>=0&&a.dryerToDeliveryGap<.35);
});

test('V251 Offset 5 keeps BMJ operator/drive orientation and uses external side access at all seven seams',()=>{
 const m=new Offset5CD102RealismTemplate();
 try{
  assert.equal(m.root.userData.sideAlignment,'PHOTO_VERIFIED_OPERATOR_NEGATIVE_Z');
  assert.equal(m.root.userData.driveSideAlignment,'PHOTO_VERIFIED_DRIVE_POSITIVE_Z');
  assert.equal(m.root.userData.realismPack,'OFFSET5_CD102_8L_WORLD_REALITY_R3');
  for(let i=0;i<7;i++){
   const seam=m.findNode(`press-${i}-gap-footplate`);assert.ok(seam,`missing PU${i+1}->PU${i+2} seam bridge`);
   seam.updateWorldMatrix(true,true);
   const b=new THREE.Box3().setFromObject(seam),size=b.getSize(new THREE.Vector3());
   assert.ok(size.x<.30,`inter-unit seam bridge stretched the process pitch: ${size.x}`);
  }
  const feeder=m.findNode('feeder-frame');assert.ok(feeder);
  assert.equal(m.root.userData.feederRearPolicy,undefined);
 }finally{m.dispose();}
});

test('V251 Offset 5 simulation follows the 720x1020 gripper pitch at the 15000 sph reference and settles sheets after release',()=>{
 const m=new Offset5CD102RealismTemplate(),sim=new Offset5CD102RealismSimulation(m.root,m);
 try{
  assert.equal(sim.nominalSheetsPerHour,15000);
  assert.ok(Math.abs(sim.sheetCyclesPerSecond-15000/3600)<1e-9);
  assert.deepEqual([sim.sheetLength,sim.sheetWidth],[.72,1.02]);
  assert.equal(sim.sheetPitchMeters,1.02);
  assert.ok(Math.abs(sim.baseMetersPerSecond-4.25)<1e-9);
  assert.ok(sim.deliveryDropHeight>.5&&sim.deliveryDropHeight<1.25);
  const st=sim.state();
  assert.equal(st.focusightLocationPolicy,'DOWNSTREAM_AFTER_COATING_DRYING');
  assert.equal(st.deliveryReleasePolicy,'GRIPPER_RELEASE_THEN_FLAT_SHEET_SETTLING_TO_PILE');
  sim.start();sim.update(0);
  let sawRelease=false,sawInspection=false;
  for(let ms=16;ms<=9000;ms+=16){
   sim.update(ms);const s=sim.state();
   sawRelease ||= s.deliveryReleaseActive;
   sawInspection ||= s.inspectionTriggerActive;
  }
  assert.equal(sawInspection,true,'sheet never crossed inline inspection after coating/drying');
  assert.equal(sawRelease,true,'delivery gripper release / flat settling was never visible');
  assert.ok(sim.completed>0,'delivery did not complete any sheets');
 }finally{sim.dispose();m.dispose();}
});
