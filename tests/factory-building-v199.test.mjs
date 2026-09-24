import test from 'node:test';
import assert from 'node:assert/strict';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {V199_SOURCE_LEDGER,V199_SOURCE_STATS} from '../frontend/src/data/research-v199.js';

const collect=(root,re)=>{
 const out=[];root.traverse(o=>{if(re.test(String(o.userData?.semantic||'')))out.push(o);});return out;
};

test('V199 closes the full outer factory envelope except valid source/reference portals',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),meta=built.root.userData,stats=meta.buildingDetailStats;
 assert.equal(meta.researchVersion,'V201');
 assert.equal(meta.buildingDetailPass,'V201_CONTEXTUAL_MACHINE_SIDE_SUPPORT_AND_ARCHITECTURAL_MICRODETAIL');
 assert.ok(meta.exteriorEnvelopeAudit.samples>100);
 assert.equal(meta.exteriorEnvelopeAudit.openGapCount,0);
 assert.equal(stats.exteriorOpenGapCount,0);
 assert.equal(meta.exteriorEnvelopeAudit.supplementSegments,stats.exteriorPerimeterSupplements);
 const supplements=collect(built.root,/^EXTERIOR_PERIMETER_SUPPLEMENT_REFERENCE$/);
 assert.equal(supplements.length,stats.exteriorPerimeterSupplements);
 assert.ok(supplements.every(o=>o.visible));
 assert.ok(supplements.every(o=>o.userData.functionalReferenceVisible===true));
 assert.match(meta.assumptions.architecturalRealism,/CLOSED_ENVELOPE/);
});

test('V199 target-facing seating has zero chair orientation errors',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),meta=built.root.userData,stats=meta.buildingDetailStats;
 assert.ok(stats.chairFacingChecks>0);
 assert.equal(stats.chairFacingErrors,0);
 assert.equal(stats.visitorChairFacingErrors,0);
 assert.equal(stats.meetingChairFacingErrors,0);
 assert.equal(meta.chairFacingAudit.length,stats.chairFacingChecks);
 assert.ok(meta.chairFacingAudit.every(a=>a.errorDeg<=.5));
 assert.ok(meta.chairFacingAudit.every(a=>Number.isFinite(a.targetX)&&Number.isFinite(a.targetY)));
 const chairGroups=collect(built.root,/_CHAIR_ASSEMBLY$/);
 assert.equal(chairGroups.length,stats.chairFacingChecks);
 assert.ok(chairGroups.every(g=>Array.isArray(g.userData.facingTarget)&&g.userData.facingTarget.length===2));
});

test('V199 monitor screens are explicitly oriented toward their task-chair side',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet);
 const screens=collect(built.root,/_MONITOR_SCREEN$/);
 assert.ok(screens.length>0);
 assert.ok(screens.every(s=>s.userData.ergonomicOrientation==='SCREEN_TOWARD_TASK_CHAIR'));
 assert.ok(screens.every(s=>Array.isArray(s.userData.facingTarget)));
});

test('V199 adds visible packaging-plant support objects without creating machine collisions',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),stats=built.root.userData.buildingDetailStats;
 assert.ok(stats.packagingSupportObjects>0);
 assert.ok(stats.emptyPalletStacks>0);
 assert.ok(stats.mobilePaperTrolleys>0);
 assert.ok(stats.floorScaleReferences>0);
 assert.equal(stats.productionFloorTonePatches,10);
 assert.ok(stats.roomWasteBins>0);
 assert.ok(stats.wallClocks>0);
 assert.equal(built.root.userData.nonMachineCollisionAudit.accidentalFixtureOverlaps,0);
 const pallets=collect(built.root,/_EMPTY_PALLET_STACK_REFERENCE$/);
 const trolleys=collect(built.root,/_MOBILE_PAPER_TROLLEY_REFERENCE$/);
 const scales=collect(built.root,/_FLOOR_SCALE_REFERENCE$/);
 assert.ok(pallets.length>0&&pallets.some(o=>o.visible));
 assert.ok(trolleys.length>0&&trolleys.some(o=>o.visible));
 assert.ok(scales.length>0&&scales.some(o=>o.visible));
});

test('V199 keeps all source machine placements locked while building realism increases',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet);
 for(const p of layout.placements.filter(p=>p.status!=='UNIDENTIFIED')){
  const g=built.assets.get(p.machineId);if(!g)continue;
  assert.equal(g.position.x,p.x,p.machineId+' x moved');
  assert.equal(g.position.z,-p.y,p.machineId+' y moved');
  assert.equal(g.rotation.y,p.rotation*Math.PI/180,p.machineId+' rotation changed');
 }
 assert.equal(built.root.userData.nonMachineCollisionAudit.accidentalFixtureOverlaps,0);
});

test('V199 source-labelled room programs remain complete and furnished',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),audit=built.root.userData.roomProgramAudit;
 assert.ok(audit.length>0);
 assert.ok(audit.every(r=>r.program!=='UNRESOLVED'),JSON.stringify(audit.filter(r=>r.program==='UNRESOLVED')));
 assert.ok(audit.every(r=>r.status==='POPULATED_FUNCTIONAL_REFERENCE'));
 assert.ok(audit.every(r=>['SOURCE_DOOR','FUNCTIONAL_REFERENCE_DOOR'].includes(r.access)));
 assert.ok(audit.every(r=>['CERAMIC','OFFICE_VINYL','SEALED_CONCRETE'].includes(r.floorFinish)));
});

test('V199 keeps safety/MEP uncertainty hidden while core architectural and room realism stays visible',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet);
 const safety=collect(built.root,/FIRE_EXTINGUISHER_REFERENCE|EMERGENCY_LUMINAIRE_REFERENCE|CONVEX_MIRROR_REFERENCE/);
 assert.ok(safety.length>0);
 assert.ok(safety.every(o=>o.visible===false));
 for(const layer of ['utility_compressed_air','utility_ahu_piping','utility_ahu_ducting','utility_anchors'])assert.equal(built.layers[layer].visible,false);
 const roomFloors=collect(built.root,/^ROOM_FLOOR_/);
 assert.ok(roomFloors.length>0&&roomFloors.every(o=>o.visible));
 const productionFloor=collect(built.root,/^PRODUCTION_FLOOR_EPOXY_TONE_REFERENCE$/);
 assert.equal(productionFloor.length,10);
 assert.ok(productionFloor.every(o=>o.visible));
});

test('V199 research ledger extends V198 with workstation orientation references and unique URLs',()=>{
 assert.ok(V199_SOURCE_STATS.newReviewed>=4);
 assert.equal(V199_SOURCE_STATS.total,V199_SOURCE_LEDGER.length);
 assert.equal(V199_SOURCE_STATS.uniqueUrls,V199_SOURCE_LEDGER.length);
 for(const id of ['V199-OSHA-WORKSTATION-CHAIRS','V199-OSHA-WORKSTATION-MONITORS','V199-OSHA-WORKSTATION-DESKS','V199-OSHA-WORKSTATION-EVALUATION'])assert.ok(V199_SOURCE_LEDGER.some(s=>s.id===id),id);
});
