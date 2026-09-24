import test from 'node:test';
import assert from 'node:assert/strict';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {V204_SOURCE_LEDGER,V204_SOURCE_STATS} from '../frontend/src/data/research-v204.js';

const collect=(root,re)=>{
 const out=[];root.traverse(o=>{if(re.test(String(o.userData?.semantic||'')))out.push(o);});return out;
};

test('V204 keeps the closed building and room-shell invariants while adding real door circulation detail',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),meta=built.root.userData,s=meta.buildingDetailStats;
 assert.equal(meta.researchVersion,'V204');
 assert.equal(meta.buildingDetailPass,'V204_CIRCULATION_FINISH_AND_FURNITURE_COLLISION_HARDENING');
 assert.equal(meta.exteriorEnvelopeAudit.openGapCount,0);
 assert.equal(meta.roomEnvelopeSummary.openEdges,0);
 assert.equal(meta.roomEnvelopeSummary.invalidOuterOpenings,0);
 assert.equal(meta.roomEnvelopeSummary.wallCornerErrors,0);
 assert.equal(meta.roomEnvelopeSummary.doubleWallOverlaps,0);
 const enclosed=meta.v203RoomShellAudit.filter(r=>r.status==='V203_SHELL_COMPLETE');
 assert.ok(enclosed.length>0);
 assert.equal(s.v204DoorApproachZones,enclosed.length);
 assert.equal(s.v204DoorSwingArcs,enclosed.length*10);
 assert.equal(s.v204DoorJambDetails,enclosed.length*3);
 assert.equal(meta.roomShellSummary.doorApproachZones,s.v204DoorApproachZones);
 assert.equal(meta.roomShellSummary.doorSwingArcSegments,s.v204DoorSwingArcs);
 assert.equal(meta.roomShellSummary.doorJambDetails,s.v204DoorJambDetails);
});

test('V204 door circulation references are visible but remain explicitly non-as-built',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const root=buildActualFactory(layout,fleet).root;
 const approaches=collect(root,/^V204_ROOM_DOOR_APPROACH_ZONE_REFERENCE$/);
 const arcs=collect(root,/^V204_ROOM_DOOR_SWING_ARC_REFERENCE$/);
 const leaves=collect(root,/^V204_ROOM_DOOR_OPEN_LEAF_REFERENCE$/);
 const jambs=collect(root,/^V204_ROOM_DOOR_(JAMB|HEAD)_REFERENCE$/);
 assert.ok(approaches.length>0&&arcs.length>0&&leaves.length>0&&jambs.length>0);
 assert.ok([...approaches,...arcs,...leaves,...jambs].every(o=>o.visible));
 assert.ok(arcs.every(o=>/NOT_AS_BUILT/.test(String(o.userData.accuracy||''))));
 assert.ok(leaves.every(o=>/NOT_AS_BUILT/.test(String(o.userData.accuracy||''))));
});

test('V204 floor finish microdetail differentiates ceramic, vinyl and sealed-concrete rooms',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root,s=root.userData.buildingDetailStats;
 const ceramic=collect(root,/^V204_CERAMIC_GROUT_REFERENCE$/);
 const vinyl=collect(root,/^V204_VINYL_SEAM_REFERENCE$/);
 const concrete=collect(root,/^V204_ROOM_CONCRETE_CONTROL_JOINT_REFERENCE$/);
 assert.ok(s.v204FloorFinishJoints>0);
 assert.equal(ceramic.length+vinyl.length+concrete.length,s.v204FloorFinishJoints);
 assert.ok(ceramic.length>0);
 assert.ok(vinyl.length>0);
 assert.ok([...ceramic,...vinyl,...concrete].every(o=>o.visible));
 assert.equal(root.userData.roomShellSummary.floorFinishJoints,s.v204FloorFinishJoints);
});

test('V204 performs pairwise furniture collision audit in every contextual room',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),meta=built.root.userData,s=meta.buildingDetailStats;
 assert.equal(s.v204RoomPairAudited,meta.roomFurnitureAudit.length);
 assert.equal(meta.furnitureLayoutSummary.roomsPairAudited,s.v204RoomPairAudited);
 assert.equal(meta.furnitureLayoutSummary.pairAudits,s.v204FurniturePairAudits);
 assert.equal(meta.furnitureLayoutSummary.pairOverlapViolations,s.v204FurniturePairOverlapViolations);
 assert.ok(s.v204FurniturePairAudits>0);
 assert.equal(s.v204FurniturePairOverlapViolations,0,JSON.stringify(meta.roomFurnitureAudit.filter(r=>r.pairOverlapViolations>0)));
 assert.ok(meta.roomFurnitureAudit.every(r=>r.status==='V204_CONTEXTUAL_LAYOUT'));
 assert.ok(meta.roomFurnitureAudit.every(r=>r.pairOverlapViolations===0));
 assert.equal(meta.furnitureLayoutSummary.accessViolations,0);
 assert.equal(meta.furnitureLayoutSummary.wallPenetrations,0);
 assert.equal(meta.furnitureLayoutSummary.orientationErrors,0);
 assert.equal(meta.furnitureLayoutSummary.doorApproachViolations,0);
 assert.equal(meta.furnitureLayoutSummary.wallClearanceViolations,0);
});

test('V204 room visual-management boards appear only as contextual support references',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root,s=root.userData.buildingDetailStats;
 const boards=collect(root,/^V204_ROOM_VISUAL_BOARD_REFERENCE$/);
 const eligible=built.root.userData.v203RoomShellAudit.filter(r=>/ADMIN|SUPERVISOR|PPIC|PDS|QC|INCOMING|PREPRESS/.test(r.program)).length;
 assert.equal(boards.length,eligible);
 assert.equal(s.v204WallVisualBoards,eligible);
 assert.ok(boards.every(o=>o.visible));
 assert.ok(boards.every(o=>['INSPECTION_REFERENCE','WORK_INFORMATION_REFERENCE'].includes(o.userData.boardRole)));
});

test('V204 keeps loading/dispatch and IPAL functionally open rather than enclosing them for visual neatness',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root,meta=root.userData;
 const open=meta.v203RoomShellAudit.filter(r=>r.status==='V203_OPEN_FUNCTION_ZONE_NO_ROOM_LINER');
 assert.ok(open.length>=1);
 const approaches=collect(root,/^V204_ROOM_DOOR_APPROACH_ZONE_REFERENCE$/);
 for(const r of open)assert.equal(approaches.filter(o=>o.userData.roomKey===r.key).length,0,r.label);
 assert.equal(meta.ipal.enclosingWalls,0);
 assert.equal(meta.ipal.openSides,true);
});

test('V204 still locks every machine placement and keeps uncertain safety/MEP hidden',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root;
 for(const p of layout.placements.filter(p=>p.status!=='UNIDENTIFIED')){
  const g=built.assets.get(p.machineId);if(!g)continue;
  assert.equal(g.position.x,p.x,p.machineId+' x moved');
  assert.equal(g.position.z,-p.y,p.machineId+' y moved');
  assert.equal(g.rotation.y,p.rotation*Math.PI/180,p.machineId+' rotation changed');
 }
 assert.equal(root.userData.nonMachineCollisionAudit.accidentalFixtureOverlaps,0);
 const safety=collect(root,/FIRE_EXTINGUISHER_REFERENCE|EMERGENCY_LUMINAIRE_REFERENCE|CONVEX_MIRROR_REFERENCE/);
 assert.ok(safety.length>0&&safety.every(o=>o.visible===false));
 for(const layer of ['utility_compressed_air','utility_ahu_piping','utility_ahu_ducting','utility_anchors'])assert.equal(built.layers[layer].visible,false);
});

test('V204 evidence ledger adds circulation and DSE assessment guidance with unique URLs',()=>{
 assert.ok(V204_SOURCE_STATS.newReviewed>=4);
 assert.equal(V204_SOURCE_STATS.total,V204_SOURCE_LEDGER.length);
 assert.equal(V204_SOURCE_STATS.uniqueUrls,V204_SOURCE_LEDGER.length);
 for(const id of ['V204-HSE-DSE-CHECKLIST','V204-HSE-SITE-ROUTES','V204-HSE-SAFE-WORKPLACE','V204-HSE-DSE-POSTURE'])assert.ok(V204_SOURCE_LEDGER.some(s=>s.id===id),id);
});
