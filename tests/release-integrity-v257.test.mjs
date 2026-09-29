import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {APP_BUILD} from '../frontend/src/state/app-state.js';
import {RELEASE_MANIFEST_V257,RELEASE_V257} from '../frontend/src/data/release-manifest-v257.js';
import {OFFSET5_DIMENSIONS,OFFSET5_UNIT_CENTERS,offset5DimensionAudit} from '../frontend/src/data/dimensions-offset5.js';
import {DianaEye55MachineTemplate} from '../frontend/src/diana-eye55.js';
import {SharkN650MachineTemplate} from '../frontend/src/shark-n650.js';
import {Polar115MachineTemplate} from '../frontend/src/polar115.js';
import {SheetingMachineTemplate,SHEETING_ACTUAL_LAYOUT,SHEETING_VISUAL_REFERENCE} from '../frontend/src/sheeting.js';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const app=read('../frontend/src/app.js');
const shell=read('../frontend/src/app-shell-v79.js');
const css=read('../frontend/app-shell-v79.css');
const state=read('../frontend/src/state/app-state.js');
const engine=read('../frontend/src/engine.js');
const sw=read('../frontend/sw.js');
const building=read('../frontend/src/factory-building.js');

test('V257 release manifest records one chronological implementation path with explicit exceptions',()=>{
 assert.equal(RELEASE_V257.build,'2026.09.29-257');
 assert.equal(RELEASE_V257.baseMain,'608f09cba7710bab7421313e34d0b860f8251c6d');
 assert.match(RELEASE_V257.policy,/CHRONOLOGICAL_MAIN_ONLY/);
 assert.equal(RELEASE_MANIFEST_V257.length,21);
 const orders=RELEASE_MANIFEST_V257.map(x=>x.order);
 assert.equal(new Set(orders).size,orders.length);
 assert.deepEqual([...orders].sort((a,b)=>a-b),orders);
 assert.equal(RELEASE_MANIFEST_V257.find(x=>x.pr===152)?.status,'recovered');
 assert.equal(RELEASE_MANIFEST_V257.find(x=>x.pr===152)?.recoveredBy,171);
 assert.equal(RELEASE_MANIFEST_V257.find(x=>x.pr===170)?.status,'superseded');
 assert.equal(RELEASE_MANIFEST_V257.find(x=>x.pr===170)?.supersededBy,171);
 assert.equal(RELEASE_MANIFEST_V257.find(x=>x.pr===171)?.mergeCommit,RELEASE_V257.baseMain);
 for(const item of RELEASE_MANIFEST_V257.filter(x=>x.status==='merged'))assert.match(item.mergeCommit,/^[a-f0-9]{40}$/);
});

test('V257 application identity is newer while public shell cache contract remains stable',()=>{
 assert.equal(APP_BUILD,'2026.09.29-257');
 assert.match(state,/APP_BUILD='2026\.09\.29-257'/);
 assert.match(sw,/const VERSION='factory-digital-twin-v249-cache-refresh-20260927'/);
 assert.match(sw,/const LEGACY_VERSION='factory-digital-twin-v222-overlay-state-ssot-20260925'/);
 assert.match(sw,/const RELEASE='222'/);
 assert.match(sw,/const BUILD_FINGERPRINT='SOURCE'/);
});

test('V240 through V248 controls coexist without parallel UI ownership',()=>{
 assert.match(shell,/id="layer-render-quality"|#layer-render-quality|layer-render-quality/);
 assert.match(shell,/bmj:qualitychange/);
 assert.match(state,/walls:true/);
 assert.match(state,/furniture:true/);
 assert.match(engine,/mode==='operator'/);
 assert.match(engine,/machineFocusBounds\(\)/);
 assert.match(shell,/data-transport-mode/);
 assert.match(shell,/Proses penuh/);
 assert.match(shell,/Tahap demi tahap/);
 assert.match(app,/Kualitas visual/);
 assert.match(app,/Edit Pabrik 3D/);
 assert.match(app,/editorMoveStep=\.01/);
 assert.match(app,/undo=\[\],redo=\[\]/);
 assert.doesNotMatch(app,/openPartFocusPopover|closePartFocusPopover|machine-detail-shortcut|machine-simulation-shortcut|machine-part-shortcut/);
 assert.doesNotMatch(css,/part-focus-popover|machine-quick-actions/);
 const opens=[...css].filter(c=>c==='{').length,closes=[...css].filter(c=>c==='}').length;
 assert.equal(opens,closes);
});

test('V250 and V251 retain open IPAL topology with the requested exterior full-length wall vegetation',()=>{
 assert.match(building,/IPAL_OPEN_AIR_WATER_TREATMENT/);
 assert.match(building,/IPAL_PHOTO_VERTICAL_GARDEN_PLANT/);
 assert.match(building,/fullFrameLength:true/);
 assert.match(building,/v251IpalWallVegetationCoverage/);
 assert.match(building,/facesOutward:true/);
 assert.match(building,/frameAttached:true/);
});

test('V253 preserves BMJ custom Offset 5 dimensions after every later merge',()=>{
 const d=OFFSET5_DIMENSIONS,a=offset5DimensionAudit();
 assert.equal(d.revision,'offset5-dimensional-contract-v36');
 assert.equal(d.structuralBody.length,26);
 assert.equal(d.structuralBody.width,3.92);
 assert.equal(d.serviceInclusive.length,27);
 assert.equal(d.serviceInclusive.width,4.60);
 assert.equal(d.repeatedPitch.value,1.95);
 assert.equal(OFFSET5_UNIT_CENTERS.length,8);
 assert.ok(a.puGap>=.72);
 assert.ok(a.pu1ToPU2Gap>=.74);
 assert.ok(a.pu8ToCoaterGap>=.74);
 assert.ok(a.coaterToDryerGap>=.64);
 assert.ok(a.dryerToDeliveryGap>=.69);
});

test('V252/V254 inspection work remains present together with the later V258-V260 structural refinements',()=>{
 const d=new DianaEye55MachineTemplate(),s=new SharkN650MachineTemplate();
 try{
  assert.equal(d.root.userData.visualRefinement,'V260_DIANA_EYE55_ATTACHED_FEEDER_APERTURE_REJECT_PIVOT_REALISM');
  assert.equal(s.root.userData.visualRefinement,'V260_SHARK_N650_ATTACHED_FEEDER_APERTURE_REJECT_PIVOT_REALISM');
  assert.ok(d.findNode('diana55-reject-safety-v254'));
  assert.ok(s.findNode('shark650-reject-guard-v254'));
  assert.ok(d.findNode('diana55-front-aperture-bezel-v260'));
  assert.ok(s.findNode('shark650-front-aperture-bezel-v260'));
  assert.equal(d.findNode('diana55-camera-top')?.userData.installedCountVerified,false);
  assert.equal(s.findNode('shark650-vision-camera')?.userData.installedCameraCountVerified,false);
 }finally{d.dispose();s.dispose();}
});

test('V245 POLAR and Sheeting corrections remain on their current photo/process revisions',()=>{
 const p=new Polar115MachineTemplate(),sh=new SheetingMachineTemplate();
 try{
  assert.equal(p.root.userData.photoRevision,'V260_FOUR_BMJ_PHOTO_ANGLES');
  assert.equal(p.root.userData.actualPhotoEvidence,'BMJ-POLAR-PHOTOS-2026-09');
  assert.equal(p.root.userData.mainHousingProfile,'RECTANGULAR_ROUNDED_HEAD__NO_HALF_CYLINDER_ROOF');
  assert.equal(SHEETING_ACTUAL_LAYOUT.direction,'RIGHT_TO_LEFT');
  assert.equal(SHEETING_VISUAL_REFERENCE.visualRevision,'V197_BMJ_MATERIAL_STATE_AND_GEOMETRY_TRUTH');
  assert.equal(SHEETING_VISUAL_REFERENCE.inputSide,'RIGHT');
  assert.equal(SHEETING_VISUAL_REFERENCE.outputSide,'LEFT');
  assert.ok(sh.findNode('sheeting-knife'));
  assert.ok(sh.findNode('sheeting-delivery'));
 }finally{p.dispose();sh.dispose();}
});

test('V256 recovery is the superset path and its cover-mounted details stay attached in cutaway',()=>{
 const expected=new Map([
  ['BMJ-MCH-0004','V238_YA1A1A_SERVICE_PROCESS_REPOLISH'],
  ['BMJ-MCH-0006','V238_SX52_4L_SERVICE_ACCESS_REPOLISH'],
  ['BMJ-MCH-0007','V238_FZ1200_OPEN_CRADLE_MECHANICAL_REPOLISH'],
  ['BMJ-MCH-0024','V238_UPG_LY300_MODEL_SERVICE_REPOLISH']
 ]);
 for(const [id,revision] of expected){
  const m=createPolishedMachineTemplate(id);
  try{
   assert.equal(m.root.userData.visualRefinement,revision,id);
   assert.equal(m.root.userData.repolishRevision,'V238',id);
   const mounted=m.meshes.filter(mesh=>mesh.userData?.coverMountedDetail);
   assert.ok(mounted.length>0,id);
   m.setExteriorOpen?.(true);
   assert.ok(mounted.every(mesh=>mesh.visible===false),id+' floating cover-mounted detail');
   m.setExteriorOpen?.(false);
   assert.ok(mounted.every(mesh=>mesh.visible!==false),id+' cover-mounted detail did not restore');
  }finally{m.dispose();}
 }
});
