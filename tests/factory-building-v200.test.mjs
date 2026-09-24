import test from 'node:test';
import assert from 'node:assert/strict';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {V200_SOURCE_LEDGER,V200_SOURCE_STATS} from '../frontend/src/data/research-v200.js';

const collect=(root,re)=>{
 const out=[];root.traverse(o=>{if(re.test(String(o.userData?.semantic||'')))out.push(o);});return out;
};

test('V200 keeps shell, furniture orientation and machine placement invariants intact',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),meta=built.root.userData,stats=meta.buildingDetailStats;
 assert.equal(meta.researchVersion,'V200');
 assert.equal(meta.buildingDetailPass,'V200_WORLD_REALISM_OPERATIONAL_DETAIL_AND_HOUSEKEEPING');
 assert.equal(meta.exteriorEnvelopeAudit.openGapCount,0);
 assert.equal(stats.exteriorOpenGapCount,0);
 assert.equal(stats.chairFacingErrors,0);
 assert.equal(stats.visitorChairFacingErrors,0);
 assert.equal(stats.meetingChairFacingErrors,0);
 assert.equal(meta.nonMachineCollisionAudit.accidentalFixtureOverlaps,0);
 for(const p of layout.placements.filter(p=>p.status!=='UNIDENTIFIED')){
  const g=built.assets.get(p.machineId);if(!g)continue;
  assert.equal(g.position.x,p.x,p.machineId+' x moved');
  assert.equal(g.position.z,-p.y,p.machineId+' y moved');
  assert.equal(g.rotation.y,p.rotation*Math.PI/180,p.machineId+' rotation changed');
 }
});

test('V200 adds grounded line-side operational detail instead of random clutter',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),meta=built.root.userData,s=meta.buildingDetailStats;
 assert.ok(Array.isArray(meta.operationalReferenceAudit));
 assert.ok(meta.operationalReferenceAudit.length>0);
 assert.equal(meta.operationalReferenceAudit.length,s.operationalReferenceObjects);
 assert.ok(meta.operationalReferenceAudit.every(x=>x.grounded===true));
 assert.ok(meta.operationalReferenceAudit.every(x=>x.clearanceSafe===true),JSON.stringify(meta.operationalReferenceAudit.filter(x=>!x.clearanceSafe)));
 assert.ok(s.wasteSegregationStations>0);
 assert.ok(s.productionHousekeepingStations>0);
 assert.ok(s.mobileQcStations>0);
 assert.ok(s.materialStatusBoards>0);
 assert.ok(s.productionAisleArrows>0);
});

test('V200 packaging support is structurally richer in RMS and finished goods',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root,s=root.userData.buildingDetailStats;
 assert.ok(s.palletCornerProtectors>0);
 assert.ok(s.paperAcclimatisationTags>0);
 assert.ok(s.columnIdentificationPlates>0);
 assert.ok(s.columnImpactGuards>0);
 const accl=collect(root,/^RMS_PAPERBOARD_ACCLIMATISATION_STATUS_TAG_REFERENCE$/);
 assert.ok(accl.length>0);
 assert.ok(accl.every(o=>o.userData.industryReference?.keepWrappedUntilAcclimatised===true));
 const corners=collect(root,/CORNER_PROTECTOR_REFERENCE$/);
 assert.ok(corners.length>0);
 const colIds=collect(root,/^PRODUCTION_COLUMN_IDENTIFICATION_PLATE_REFERENCE$/);
 assert.ok(colIds.length>0&&colIds.every(o=>o.visible));
 const guards=collect(root,/^PRODUCTION_COLUMN_IMPACT_GUARD_REFERENCE$/);
 assert.ok(guards.length>0&&guards.every(o=>o.visible));
});

test('V200 visible operational references include 5S, QC, waste and visual-management families',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root;
 const families=[
  /PRODUCTION_WASTE_SEGREGATION_STATION_REFERENCE$/,
  /PRODUCTION_HOUSEKEEPING_STATION_REFERENCE$/,
  /PRODUCTION_MOBILE_QC_STATION_REFERENCE$/,
  /PRODUCTION_MATERIAL_STATUS_BOARD_REFERENCE$/,
  /PRODUCTION_AISLE_DIRECTION_ARROW_REFERENCE$/
 ];
 for(const re of families){
  const found=collect(root,re);
  assert.ok(found.length>0,String(re));
  assert.ok(found.some(o=>o.visible),String(re)+' should be visible');
 }
});

test('V200 source-labelled rooms remain complete while support details increase',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),audit=built.root.userData.roomProgramAudit,s=built.root.userData.buildingDetailStats;
 assert.ok(audit.length>0);
 assert.ok(audit.every(r=>r.program!=='UNRESOLVED'));
 assert.ok(audit.every(r=>r.status==='POPULATED_FUNCTIONAL_REFERENCE'));
 assert.ok(audit.every(r=>['SOURCE_DOOR','FUNCTIONAL_REFERENCE_DOOR'].includes(r.access)));
 assert.ok(s.roomWasteBins>0);
 assert.ok(s.wallClocks>0);
});

test('V200 does not promote uncertain life-safety or MEP references to as-built',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet);
 const safety=collect(built.root,/FIRE_EXTINGUISHER_REFERENCE|EMERGENCY_LUMINAIRE_REFERENCE|CONVEX_MIRROR_REFERENCE/);
 assert.ok(safety.length>0);
 assert.ok(safety.every(o=>o.visible===false));
 for(const layer of ['utility_compressed_air','utility_ahu_piping','utility_ahu_ducting','utility_anchors'])assert.equal(built.layers[layer].visible,false);
 assert.equal(built.root.userData.architecturalEvidenceBoundary.notAsBuilt,true);
});

test('V200 research ledger covers storage, housekeeping, traffic separation, paperboard handling and workstation ergonomics',()=>{
 assert.ok(V200_SOURCE_STATS.newReviewed>=7);
 assert.equal(V200_SOURCE_STATS.total,V200_SOURCE_LEDGER.length);
 assert.equal(V200_SOURCE_STATS.uniqueUrls,V200_SOURCE_LEDGER.length);
 for(const id of [
  'V200-OSHA-1910-176','V200-OSHA-1910-22','V200-HSE-WAREHOUSING','V200-HSE-SEPARATION',
  'V200-STORA-NATURA-STORAGE','V200-OSHA-MONITOR','V200-OSHA-DESK'
 ])assert.ok(V200_SOURCE_LEDGER.some(s=>s.id===id),id);
});
