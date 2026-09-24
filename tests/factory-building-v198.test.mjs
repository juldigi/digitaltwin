import test from 'node:test';
import assert from 'node:assert/strict';
import {buildActualFactory,loadFactoryFleet,dedupeWallSegments} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {V198_SOURCE_LEDGER,V198_SOURCE_STATS} from '../frontend/src/data/research-v198.js';

const visibleBySemantic=(root,re)=>{
 const out=[];root.traverse(o=>{if(re.test(String(o.userData?.semantic||'')))out.push(o);});return out;
};

test('V198 deduplicates reversed and near-identical wall segments before rendering',()=>{
 const walls=[
  {a:[1,2],b:[5,2],width:.12},
  {a:[5,2],b:[1,2],width:.12},
  {a:[1.01,2.01],b:[5.01,2.01],width:.12},
  {a:[1,3],b:[5,3],width:.12}
 ];
 const r=dedupeWallSegments(walls,.06);
 assert.equal(r.walls.length,2);
 assert.equal(r.removed,2);
});

test('V198 completes room-by-room operational realism without moving any machine',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),meta=built.root.userData,stats=meta.buildingDetailStats;
 assert.equal(meta.researchVersion,'V203');
 assert.equal(meta.buildingDetailPass,'V203_FULL_ROOM_SHELL_AND_AUDITED_FURNITURE_REALISM');
 assert.ok(stats.roomAccessAudited>0);
 assert.ok(stats.roomFloorFinishes>0);
 assert.ok(stats.visibleFunctionalReferences>0);
 assert.equal(stats.rmsCutSheetStacks,4);
 assert.ok(stats.productionSupportStations>0);
 assert.equal(stats.productionSupportStations,stats.productionWipPallets);
 assert.equal(stats.productionSupportStations,stats.productionWasteBins);
 assert.equal(meta.roomAccessAudit.length,stats.roomAccessAudited);
 assert.ok(Array.isArray(meta.roomProgramAudit)&&meta.roomProgramAudit.length>0);
 assert.ok(meta.roomProgramAudit.every(r=>r.program!=='UNRESOLVED'),JSON.stringify(meta.roomProgramAudit.filter(r=>r.program==='UNRESOLVED')));
 assert.ok(meta.roomProgramAudit.every(r=>r.status==='POPULATED_FUNCTIONAL_REFERENCE'));
 assert.ok(meta.roomProgramAudit.every(r=>['CERAMIC','OFFICE_VINYL','SEALED_CONCRETE'].includes(r.floorFinish)));
 assert.ok(meta.roomProgramAudit.every(r=>['SOURCE_DOOR','FUNCTIONAL_REFERENCE_DOOR'].includes(r.access)),JSON.stringify(meta.roomProgramAudit.filter(r=>!['SOURCE_DOOR','FUNCTIONAL_REFERENCE_DOOR'].includes(r.access))));
 assert.equal(meta.wallDeduplication.input-meta.wallDeduplication.renderedSourceWalls,meta.wallDeduplication.duplicatesRemoved);
 assert.ok(stats.sourceDoorWallOpenings>=(layout.actual.doors?.length||0));

 for(const p of layout.placements.filter(p=>p.status!=='UNIDENTIFIED')){
  const g=built.assets.get(p.machineId);if(!g)continue;
  assert.equal(g.position.x,p.x,p.machineId+' x');
  assert.equal(g.position.z,-p.y,p.machineId+' z');
  assert.equal(g.rotation.y,p.rotation*Math.PI/180,p.machineId+' rotation');
 }
 assert.equal(meta.nonMachineCollisionAudit.accidentalFixtureOverlaps,0);
});

test('V198 makes core room furniture, RMS paper and production support visible while keeping safety references hidden',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root;

 const roomFloors=visibleBySemantic(root,/^ROOM_FLOOR_/);
 assert.ok(roomFloors.length>0);
 assert.ok(roomFloors.every(o=>o.visible));
 assert.ok(roomFloors.every(o=>o.userData.visualizationMode==='FUNCTIONAL_REFERENCE_VISIBLE'||o.userData.functionalReferenceVisible));

 const rms=visibleBySemantic(root,/^RMS_PACKAGING_STORAGE_REFERENCE$/);
 assert.equal(rms.length,1);assert.equal(rms[0].visible,true);
 const sheetStacks=visibleBySemantic(root,/^RMS_CUT_SHEET_STACK_REFERENCE$/);
 assert.equal(sheetStacks.length,4);assert.ok(sheetStacks.every(o=>o.visible));
 const wip=visibleBySemantic(root,/^PRODUCTION_WIP_PALLET_BASE$/);
 assert.ok(wip.length>0);assert.ok(wip.every(o=>o.visible));

 const labels=layout.actual.labels.map(l=>l.text);
 const conditional=[
  [/Adm Room/i,/^V202_ADMIN_OFFICE_DESK_WORKTOP$/],
  [/PPIC/i,/^V202_PPIC_[AB]_DESK_WORKTOP$/],
  [/QC Sample|R\.Sample|R\.INCOMING/i,/^V202_(QC_SAMPLE|INCOMING_QC)_.*DESK_WORKTOP$/],
  [/Toilet/i,/^V202_TOILET_FIXTURE$/],
  [/Pantry|Kitchen|Refreshment/i,/^V202_PANTRY_COUNTER$/],
  [/Locker|Loker|Changing|Change Room/i,/^V202_LOCKER_(LEFT|RIGHT)_LOCKER_(CARCASS|DOOR)$/],
  [/WH Spareparts/i,/^V202_SPAREPART_(LEFT|RIGHT)_RACK_UPRIGHT$/],
  [/Workshop/i,/^V202_WORKSHOP_WORKBENCH_TABLE_TOP$/],
  [/CTF|CTP/i,/^V202_PREPRESS_/]
 ];
 for(const [labelRe,semanticRe] of conditional){
  if(!labels.some(t=>labelRe.test(t)))continue;
  const found=visibleBySemantic(root,semanticRe);
  assert.ok(found.length>0,String(semanticRe)+' missing for source-labelled room');
  assert.ok(found.some(o=>o.visible),String(semanticRe)+' should be visible in V202');
 }

 const safety=visibleBySemantic(root,/FIRE_EXTINGUISHER_REFERENCE|EMERGENCY_LUMINAIRE_REFERENCE|RMS_CONVEX_MIRROR_REFERENCE/);
 assert.ok(safety.length>0);
 assert.ok(safety.every(o=>o.visible===false),'reference-only safety placements must remain hidden');
 for(const layer of ['utility_compressed_air','utility_ahu_piping','utility_ahu_ducting','utility_anchors'])assert.equal(built.layers[layer].visible,false);
});

test('V198 shows realistic factory floor cues without turning safety references into as-built claims',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root;
 const joints=visibleBySemantic(root,/^FLOOR_CONTROL_JOINT_REFERENCE$/);
 const clearances=visibleBySemantic(root,/^FLOOR_SERVICE_CLEARANCE_MARKING_REFERENCE$/);
 assert.ok(joints.length>0&&joints.every(o=>o.visible));
 assert.ok(clearances.length>0&&clearances.every(o=>o.visible));
 const floor=[];root.traverse(o=>{if(o.userData?.semantic==='REINFORCED_CONCRETE_FLOOR')floor.push(o);});
 assert.equal(floor.length,1);
 assert.match(String(floor[0].userData.accuracy),/SOURCE_OUTLINE/);
 assert.equal(built.root.userData.architecturalEvidenceBoundary.notAsBuilt,true);
 assert.match(built.root.userData.assumptions.safetyReference,/NOT_CODE_COMPLIANCE/);
});

test('V198 research ledger adds warehouse, floor, paper-storage and Indonesia context references without duplicate URLs',()=>{
 assert.ok(V198_SOURCE_STATS.newReviewed>=8);
 assert.equal(V198_SOURCE_STATS.total,V198_SOURCE_LEDGER.length);
 assert.equal(V198_SOURCE_STATS.uniqueUrls,V198_SOURCE_LEDGER.length);
 for(const id of ['V198-OSHA-STORAGE-AISLES','V198-OSHA-WALKING-SURFACES','V198-HSE-WAREHOUSING','V198-HSE-WORKPLACE-TRANSPORT','V198-IPB-PACKAGING-WAREHOUSE','V198-MITSUI-EPOXY','V198-COMMONWEALTH-PAPER-STORAGE'])assert.ok(V198_SOURCE_LEDGER.some(s=>s.id===id),id);
});
