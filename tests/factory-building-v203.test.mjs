import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {V203_SOURCE_LEDGER,V203_SOURCE_STATS} from '../frontend/src/data/research-v203.js';

const collect=(root,re)=>{
 const out=[];root.traverse(o=>{if(re.test(String(o.userData?.semantic||'')))out.push(o);});return out;
};

test('V203 keeps every enclosed room closed and upgrades each processed room to a full shell',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root,meta=root.userData,s=meta.buildingDetailStats;
 assert.equal(meta.researchVersion,'V203');
 assert.equal(meta.buildingDetailPass,'V203_FULL_ROOM_SHELL_AND_AUDITED_FURNITURE_REALISM');
 assert.equal(meta.exteriorEnvelopeAudit.openGapCount,0);
 assert.equal(meta.roomEnvelopeSummary.openEdges,0);
 assert.equal(meta.roomEnvelopeSummary.invalidOuterOpenings,0);
 assert.equal(meta.roomEnvelopeSummary.wallCornerErrors,0);
 assert.equal(meta.roomEnvelopeSummary.doubleWallOverlaps,0);
 assert.ok(Array.isArray(meta.v203RoomShellAudit)&&meta.v203RoomShellAudit.length>0);
 assert.equal(meta.v203RoomShellAudit.length,meta.roomFurnitureAudit.length);
 assert.equal(s.roomEnvelopeFloorPads,meta.v203RoomShellAudit.length);
 assert.equal(s.roomFloorFinishes,meta.v203RoomShellAudit.length);
 const enclosed=meta.v203RoomShellAudit.filter(r=>r.status==='V203_SHELL_COMPLETE');
 assert.ok(enclosed.length>0);
 assert.equal(s.roomThresholdTransitions,enclosed.length);
 assert.ok(s.roomSkirtingRuns>=enclosed.length*3);
 assert.ok(s.roomInteriorLinerRuns>=enclosed.length*3);
 const shellGroups=collect(root,/^V203_ROOM_SHELL_GROUP$/);
 assert.equal(shellGroups.length,meta.v203RoomShellAudit.length);
 assert.ok(shellGroups.every(g=>g.visible));
});

test('V203 preserves open loading/dispatch function zones instead of inventing enclosing walls',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root,meta=root.userData;
 const open=meta.v203RoomShellAudit.filter(r=>r.status==='V203_OPEN_FUNCTION_ZONE_NO_ROOM_LINER');
 assert.ok(open.length>=1);
 for(const r of open){
  const g=collect(root,/^V203_ROOM_SHELL_GROUP$/).find(x=>x.userData.roomKey===r.key);
  assert.ok(g,r.key);
  const liners=[];g.traverse(o=>{if(/^V203_ROOM_INTERIOR_LINER/.test(String(o.userData?.semantic||'')))liners.push(o);});
  assert.equal(liners.length,0,r.label+' should remain an open function zone');
 }
 assert.equal(meta.ipal.openSides,true);
 assert.equal(meta.ipal.enclosingWalls,0);
});

test('V203 corrects local room width/depth after east-west furniture-group rotation',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const meta=buildActualFactory(layout,fleet).root.userData;
 const env=new Map(meta.roomEnvelopeAudit.map(r=>[r.key,r]));
 for(const shell of meta.v203RoomShellAudit){
  const r=env.get(shell.key);assert.ok(r,shell.key);
  const ew=r.doorSide==='E'||r.doorSide==='W';
  const expectedW=(ew?r.depth:r.width)-.06,expectedD=(ew?r.width:r.depth)-.06;
  assert.ok(Math.abs(shell.localWidth-expectedW)<=.02,shell.label+' local width wrong');
  assert.ok(Math.abs(shell.localDepth-expectedD)<=.02,shell.label+' local depth wrong');
 }
});

test('V203 performs real furniture footprint and door-approach audits instead of hard-coded zeroes',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),meta=built.root.userData,s=meta.buildingDetailStats;
 assert.ok(Array.isArray(meta.v203FurnitureFootprintAudit)&&meta.v203FurnitureFootprintAudit.length>0);
 assert.equal(meta.v203FurnitureFootprintAudit.length,s.v203FurnitureFootprintAudits);
 assert.equal(meta.furnitureLayoutSummary.footprintAudits,s.v203FurnitureFootprintAudits);
 assert.equal(meta.furnitureLayoutSummary.doorApproachViolations,s.v203DoorApproachViolations);
 assert.equal(meta.furnitureLayoutSummary.wallClearanceViolations,s.v203WallClearanceViolations);
 assert.equal(s.v203DoorApproachViolations,0,JSON.stringify(meta.v203FurnitureFootprintAudit.filter(x=>x.doorApproachViolation)));
 assert.equal(s.v203WallClearanceViolations,0,JSON.stringify(meta.v203FurnitureFootprintAudit.filter(x=>x.wallViolation)));
 assert.equal(meta.furnitureLayoutSummary.accessViolations,0);
 assert.equal(meta.furnitureLayoutSummary.wallPenetrations,0);
 assert.equal(meta.furnitureLayoutSummary.orientationErrors,0);
 assert.equal(meta.furnitureLayoutSummary.doorSwingClearanceViolations,0);
 assert.ok(meta.furnitureLayoutSummary.minLayoutScale>=.70,'room furniture is being shrunk too aggressively: '+meta.furnitureLayoutSummary.minLayoutScale);
 assert.ok(meta.roomFurnitureAudit.every(r=>r.status==='V203_CONTEXTUAL_LAYOUT'));
 assert.ok(meta.roomFurnitureAudit.every(r=>r.footprints>0));
});

test('V203 workstation and storage geometry is materially more detailed without filling legroom',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root,s=root.userData.buildingDetailStats;
 assert.ok(s.v203DeskCableTrays>0);
 assert.ok(s.v203DeskPedestals>0);
 assert.ok(s.v203ChairCasters>0);
 assert.ok(s.v203CabinetShelves>0);
 assert.ok(s.v203CabinetHandles>0);
 const trays=collect(root,/^V202_.*_CABLE_TRAY$/),peds=collect(root,/^V202_.*_SIDE_PEDESTAL$/),monitors=collect(root,/^V202_.*_MONITOR$/);
 assert.ok(trays.length>0&&trays.every(o=>o.visible));
 assert.ok(peds.length>0&&peds.every(o=>o.visible));
 assert.ok(monitors.length>0&&monitors.some(o=>String(o.userData.semantic).startsWith('V202_')));
 const desks=metaDeskGroups(root);
 assert.ok(desks.length>0);
});

function metaDeskGroups(root){
 const out=[];root.traverse(o=>{const s=String(o.userData?.semantic||'');if(/^V202_.*_DESK_WORKTOP$/.test(s))out.push(o);});return out;
}

test('V203 room-specific microdetail is contextual rather than copied identically into every room',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),s=built.root.userData.buildingDetailStats,programs=new Set(built.root.userData.roomFurnitureAudit.map(r=>r.program));
 if(programs.has('LOCKER_CHANGE'))assert.ok(s.v203LockerDoors>0);
 if(programs.has('QC_SAMPLE')||programs.has('INCOMING_QC'))assert.ok(s.v203QcSampleDetails>0);
 if(programs.has('WORKSHOP')||programs.has('MAINTENANCE'))assert.ok(s.v203WorkshopToolDetails>0);
 if(programs.has('PANTRY'))assert.ok(s.v203PantryDetails>0);
 if(programs.has('SPAREPART_WAREHOUSE'))assert.ok(s.v203SparepartBins>0);
 assert.ok(s.roomCeilingPanelsV203>0);
 assert.ok(s.roomCeilingGridLinesV203>0);
 assert.ok(s.roomLedPanelsV203>0);
 assert.ok(s.roomWallServiceReferences>0);
});

test('V203 full-envelope room floors replace the old fixed 2.60 x 2.35 patches',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root,meta=root.userData;
 const floors=collect(root,/^ROOM_FLOOR_(OFFICE_VINYL|CERAMIC|SEALED_CONCRETE)_REFERENCE$/);
 assert.equal(floors.length,meta.v203RoomShellAudit.length);
 root.updateMatrixWorld(true);
 for(const floor of floors){
  const box=new THREE.Box3().setFromObject(floor),size=new THREE.Vector3();box.getSize(size);
  assert.ok(Math.max(size.x,size.z)>1.6,'room floor pad still looks like a tiny generic patch');
 }
});

test('V203 does not move machines or promote uncertain safety/MEP references to as-built',async()=>{
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

test('V203 evidence ledger includes printing circulation, material-clearance and workstation references',()=>{
 assert.ok(V203_SOURCE_STATS.newReviewed>=5);
 assert.equal(V203_SOURCE_STATS.total,V203_SOURCE_LEDGER.length);
 assert.equal(V203_SOURCE_STATS.uniqueUrls,V203_SOURCE_LEDGER.length);
 for(const id of ['V203-HSE-PRINT-PRODUCTION','V203-OSHA-1910-176','V203-OSHA-DESK','V203-OSHA-MONITOR','V203-OSHA-EVALUATION'])assert.ok(V203_SOURCE_LEDGER.some(s=>s.id===id),id);
});
