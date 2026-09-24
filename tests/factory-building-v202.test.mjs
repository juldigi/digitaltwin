import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {V202_SOURCE_LEDGER,V202_SOURCE_STATS} from '../frontend/src/data/research-v202.js';

const collect=(root,re)=>{
 const out=[];root.traverse(o=>{if(re.test(String(o.userData?.semantic||'')))out.push(o);});return out;
};

test('V202 closes every enclosed source-labelled room except valid door/portal openings',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),meta=built.root.userData,s=meta.buildingDetailStats;
 assert.equal(meta.researchVersion,'V203');
 assert.equal(meta.buildingDetailPass,'V203_FULL_ROOM_SHELL_AND_AUDITED_FURNITURE_REALISM');
 assert.ok(Array.isArray(meta.roomEnvelopeAudit)&&meta.roomEnvelopeAudit.length>0);
 const enclosed=meta.roomEnvelopeAudit.filter(r=>r.enclose);
 assert.ok(enclosed.length>0);
 assert.ok(enclosed.every(r=>r.status==='CLOSED_EXCEPT_VALID_OPENINGS'),JSON.stringify(enclosed.filter(r=>r.status!=='CLOSED_EXCEPT_VALID_OPENINGS')));
 assert.equal(meta.roomEnvelopeSummary.openEdges,0);
 assert.equal(meta.roomEnvelopeSummary.invalidOuterOpenings,0);
 assert.equal(meta.roomEnvelopeSummary.wallCornerErrors,0);
 assert.equal(meta.roomEnvelopeSummary.doubleWallOverlaps,0);
 assert.equal(s.outerRoomOpenEdges,0);
 assert.equal(s.outerRoomInvalidOpenings,0);
 assert.ok(s.roomEnvelopeAudited>0);
 assert.ok(s.outerRoomEnvelopeRooms>0);
 assert.ok(s.roomEnvelopeSupplementWalls>0,'V202 should visibly close at least one room gap');
 const supplements=collect(built.root,/^ROOM_ENVELOPE_SUPPLEMENT_REFERENCE$/);
 assert.equal(supplements.length,s.roomEnvelopeSupplementWalls);
 assert.ok(supplements.every(o=>o.visible));
});

test('V202 inferred room doors are actual openings in the audited room edge',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),rooms=built.root.userData.roomEnvelopeAudit.filter(r=>r.enclose);
 for(const r of rooms){
  assert.ok(['N','S','E','W'].includes(r.doorSide),r.label);
  assert.ok(Number.isFinite(r.width)&&r.width>=1.7,r.label+' width');
  assert.ok(Number.isFinite(r.depth)&&r.depth>=1.6,r.label+' depth');
  if(r.doorDistance!==null&&r.doorDistance<=5){
   assert.ok(r.validOpenings>0,r.label+' has a nearby source/reference door but no room-wall opening');
  }
 }
});

test('V202 contextual furniture templates replace legacy generic room furniture',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root,meta=root.userData,s=meta.buildingDetailStats;
 assert.ok(Array.isArray(meta.roomFurnitureAudit)&&meta.roomFurnitureAudit.length>0);
 assert.equal(meta.roomFurnitureAudit.length,s.contextualFurnitureTemplatesApplied);
 assert.ok(meta.roomFurnitureAudit.every(r=>r.status==='V203_CONTEXTUAL_LAYOUT'));
 assert.ok(meta.roomFurnitureAudit.every(r=>r.objectCount>0),JSON.stringify(meta.roomFurnitureAudit.filter(r=>r.objectCount<=0)));
 assert.equal(meta.furnitureLayoutSummary.accessViolations,0);
 assert.equal(meta.furnitureLayoutSummary.wallPenetrations,0);
 assert.equal(meta.furnitureLayoutSummary.orientationErrors,0);
 assert.equal(meta.furnitureLayoutSummary.doorSwingClearanceViolations,0);
 assert.ok(meta.roomFurnitureAudit.every(r=>r.doorClearanceM>=.72));
 const groups=collect(root,/^V202_ROOM_FURNITURE_GROUP$/);
 assert.equal(groups.length,meta.roomFurnitureAudit.length);
 assert.ok(groups.every(g=>g.visible));
 const superseded=[];root.traverse(o=>{if(o.userData?.supersededByV202)superseded.push(o);});
 assert.ok(superseded.length>0);
 assert.ok(superseded.every(o=>o.visible===false));
});

test('V202 new furniture geometry stays inside its audited room envelope',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root,ctx=new Map(root.userData.roomEnvelopeAudit.map(r=>[r.key,r]));
 root.updateMatrixWorld(true);
 const groups=collect(root,/^V202_ROOM_FURNITURE_GROUP$/);
 for(const g of groups){
  const r=ctx.get(g.userData.roomKey);assert.ok(r,g.userData.roomKey);
  const bb=new THREE.Box3().setFromObject(g);
  const plantMinY=-bb.max.z,plantMaxY=-bb.min.z;
  assert.ok(bb.min.x>=r.minX-.18,g.userData.roomLabel+' furniture crosses west wall');
  assert.ok(bb.max.x<=r.maxX+.18,g.userData.roomLabel+' furniture crosses east wall');
  assert.ok(plantMinY>=r.minY-.18,g.userData.roomLabel+' furniture crosses north wall');
  assert.ok(plantMaxY<=r.maxY+.18,g.userData.roomLabel+' furniture crosses south wall');
 }
});

test('V202 every generated chair faces its functional target',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),audit=built.root.userData.v202ChairFacingAudit,s=built.root.userData.buildingDetailStats;
 assert.ok(Array.isArray(audit)&&audit.length>0);
 assert.equal(audit.length,s.v202RoomChairs);
 assert.ok(audit.every(a=>a.errorDeg<=.05),JSON.stringify(audit.filter(a=>a.errorDeg>.05)));
 assert.equal(s.furnitureOrientationErrors,0);
});

test('V202 each room retains a clear door-side aisle and context-appropriate furniture family',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root,audit=built.root.userData.roomFurnitureAudit;
 const aisles=collect(root,/^V202_ROOM_CLEAR_AISLE_REFERENCE$/);
 assert.equal(aisles.length,audit.length);
 assert.ok(aisles.every(o=>o.visible));
 const semantics=new Set();root.traverse(o=>{const s=String(o.userData?.semantic||'');if(s.startsWith('V202_'))semantics.add(s);});
 const required=[
  ['ADMIN_OFFICE','V202_ADMIN_OFFICE_DESK_WORKTOP'],
  ['PPIC_OFFICE','V202_PPIC_PLANNING_BOARD'],
  ['QC_SAMPLE','V202_QC_SAMPLE_INSPECTION_TABLE_TOP'],
  ['INCOMING_QC','V202_INCOMING_QC_INSPECTION_TABLE_TOP'],
  ['PREPRESS','V202_PREPRESS_LIGHT_TABLE_TABLE_TOP'],
  ['WORKSHOP','V202_WORKSHOP_WORKBENCH_TABLE_TOP'],
  ['MAINTENANCE','V202_MAINTENANCE_WORKBENCH_TABLE_TOP'],
  ['PANTRY','V202_PANTRY_BREAK_TABLE_TOP'],
  ['LOCKER_CHANGE','V202_LOCKER_BENCH'],
  ['MEETING','V202_MEETING_TABLE_TOP'],
  ['JANITOR','V202_JANITOR_MOP_SINK']
 ];
 for(const [program,semantic] of required){
  if(!audit.some(r=>r.program===program))continue;
  assert.ok(semantics.has(semantic),program+' missing '+semantic);
 }
});

test('V202 machine placement, production clearance and IPAL open-air invariant remain untouched',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),meta=built.root.userData;
 for(const p of layout.placements.filter(p=>p.status!=='UNIDENTIFIED')){
  const g=built.assets.get(p.machineId);if(!g)continue;
  assert.equal(g.position.x,p.x,p.machineId+' x moved');
  assert.equal(g.position.z,-p.y,p.machineId+' y moved');
  assert.equal(g.rotation.y,p.rotation*Math.PI/180,p.machineId+' rotation changed');
 }
 assert.equal(meta.nonMachineCollisionAudit.accidentalFixtureOverlaps,0);
 assert.equal(meta.ipal.enclosingWalls,0);
 assert.equal(meta.ipal.openSides,true);
 assert.equal(meta.exteriorEnvelopeAudit.openGapCount,0);
});

test('V202 still keeps uncertain safety and MEP references hidden',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet);
 const safety=collect(built.root,/FIRE_EXTINGUISHER_REFERENCE|EMERGENCY_LUMINAIRE_REFERENCE|CONVEX_MIRROR_REFERENCE/);
 assert.ok(safety.length>0&&safety.every(o=>o.visible===false));
 for(const layer of ['utility_compressed_air','utility_ahu_piping','utility_ahu_ducting','utility_anchors'])assert.equal(built.layers[layer].visible,false);
});

test('V202 research ledger covers printing circulation, room access and workstation layout',()=>{
 assert.ok(V202_SOURCE_STATS.newReviewed>=5);
 assert.equal(V202_SOURCE_STATS.total,V202_SOURCE_LEDGER.length);
 assert.equal(V202_SOURCE_STATS.uniqueUrls,V202_SOURCE_LEDGER.length);
 for(const id of ['V202-HSE-PRINT-WALKWAYS','V202-OSHA-MATERIAL-AISLES','V202-OSHA-WORKSTATION-MONITOR','V202-OSHA-WORKSTATION-DESK','V202-OSHA-WORKSTATION-EVALUATION'])assert.ok(V202_SOURCE_LEDGER.some(s=>s.id===id),id);
});
