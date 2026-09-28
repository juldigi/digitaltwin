import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildActualFactory,loadFactoryFleet,shiftWallFromMachineClearance,clipWallToMachineClearance,machineClearanceBoxes} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';

test('a doorless wall near a machine moves outside its service box while the machine stays fixed',()=>{
 const wall={a:[3,-1],b:[3,3],width:.12},box={minX:2,maxX:4,minY:0,maxY:2};
 const moved=shiftWallFromMachineClearance(wall,[box]);
 assert.ok(moved.sourceShiftM);
 assert.deepEqual(moved.sourceCoordinates,[wall.a,wall.b]);
 assert.equal(clipWallToMachineClearance(moved,[box]).length,1);
 assert.equal(moved.b[1]-moved.a[1],4);
 assert.deepEqual(wall.a,[3,-1]);
 assert.equal(shiftWallFromMachineClearance(wall,[box],[{x:3,y:1,width:1}]),wall);
});

test('factory source walls are moved where feasible without changing machine positions or room circulation',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const {layers,root,assets}=buildActualFactory(layout,fleet),moved=layers.walls.children.filter(o=>o.userData.sourceShiftM);
 assert.ok(moved.length>=8);
 const boxes=machineClearanceBoxes(fleet);
 for(const wall of moved){
  assert.ok(wall.userData.sourceCoordinates);
  const length=wall.userData.sourceLength,angle=wall.rotation.y;
  const a=[wall.position.x-Math.cos(angle)*length/2,-wall.position.z-Math.sin(angle)*length/2];
  const b=[wall.position.x+Math.cos(angle)*length/2,-wall.position.z+Math.sin(angle)*length/2];
  assert.equal(clipWallToMachineClearance({a,b},boxes).length,1,wall.userData.sourceEntityId);
 }
 for(const p of layout.placements.filter(p=>p.status!=='UNIDENTIFIED')){const asset=assets.get(p.machineId);if(asset){assert.equal(asset.position.x,p.x);assert.equal(asset.position.z,-p.y);}}
 assert.equal(root.userData.roomEnvelopeSummary.openEdges,0);
});

test('toilet and sparepart warehouse show usable fixtures and stored materials',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const {root}=buildActualFactory(layout,fleet),items=new Map();
 root.traverse(o=>{const s=o.userData?.semantic;if(s)items.set(s,(items.get(s)||0)+1);});
 for(const type of ['V202_TOILET_PORCELAIN_BOWL_REFERENCE','V202_TOILET_SEAT_RING_REFERENCE','V202_TOILET_CISTERN_REFERENCE','V202_TOILET_BASIN_BOWL_REFERENCE','V202_TOILET_FAUCET_SPOUT_REFERENCE','V202_TOILET_FLOOR_DRAIN_REFERENCE','V202_SPAREPART_BIN_FACE_REFERENCE','V202_SPAREPART_BIN_UNNUMBERED_LABEL_REFERENCE','V202_SPAREPART_CLOSED_CARTON_REFERENCE'])assert.ok(items.get(type)>0,type);
});

test('CTP and CTF remain adjacent functional zones when the source has no partition',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const {root}=buildActualFactory(layout,fleet),rooms=root.userData.roomEnvelopeAudit.filter(r=>['CTP','CTF'].includes(r.label)).sort((a,b)=>a.x-b.x);
 assert.equal(rooms.length,2);
 assert.ok(rooms.every(r=>r.sharedUnpartitionedBay&&!r.enclose));
 assert.ok(rooms[0].maxX<=rooms[1].minX+.001);
 const fakeWalls=[];root.traverse(o=>{if(o.userData?.semantic==='ROOM_ENVELOPE_SUPPLEMENT_REFERENCE'&&['CTP','CTF'].includes(o.userData.roomLabel))fakeWalls.push(o);});
 assert.equal(fakeWalls.length,0);
});

test('superseded meeting label inside OFFSET 10 does not create an empty room',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const {root}=buildActualFactory(layout,fleet),meta=root.userData;
 assert.equal(meta.supersededRoomLabels.length,1);
 assert.equal(meta.supersededRoomLabels[0].label,'Meeting');
 assert.ok(meta.supersededRoomLabels[0].reason.includes('OFFSET10'));
 const keys=new Set(meta.v203RoomShellAudit.map(r=>r.key));
 assert.ok(meta.roomEnvelopeAudit.every(r=>keys.has(r.key)));
 assert.ok(!meta.roomEnvelopeAudit.some(r=>r.label==='Meeting'&&Math.abs(r.x-49.0725)<.02));
});

test('electrical, prayer and broke rooms use function-specific interior details',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const {root}=buildActualFactory(layout,fleet),semantics=new Set();root.traverse(o=>{if(o.userData?.semantic)semantics.add(o.userData.semantic);});
 for(const item of ['V202_ELECTRICAL_PANEL_DOOR_REFERENCE','V202_ELECTRICAL_PANEL_DARK_DISPLAY_REFERENCE','V202_PRAYER_SHOE_PAIR_REFERENCE','V202_PRAYER_MAT_EDGE_REFERENCE','V202_BROKE_BIN_TOP_RIM_REFERENCE','V202_BROKE_VISIBLE_PAPER_SCRAP_REFERENCE'])assert.ok(semantics.has(item),item);
});

test('room door jambs and access clearance follow the source door offset',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const {root}=buildActualFactory(layout,fleet),meta=root.userData;
 const shifted=meta.v203RoomShellAudit.filter(r=>r.status==='V203_SHELL_COMPLETE'&&Math.abs(r.doorOffsetX)>.25);
 assert.ok(shifted.length>=5);
 for(const r of shifted){
  const shell=[];root.traverse(o=>{if(o.userData?.semantic==='V203_ROOM_SHELL_GROUP'&&o.userData.roomKey===r.key)shell.push(o);});assert.equal(shell.length,1,r.label);
  const jambs=[];root.traverse(o=>{if(o.userData?.semantic==='V204_ROOM_DOOR_JAMB_REFERENCE'&&o.userData.roomKey===r.key)jambs.push(o);});assert.equal(jambs.length,2,r.label);
  const localX=jambs.map(o=>shell[0].worldToLocal(o.getWorldPosition(new THREE.Vector3())).x);
  assert.ok(Math.abs((localX[0]+localX[1])/2-r.doorOffsetX)<.002,r.label);
 }
 assert.equal(meta.furnitureLayoutSummary.doorApproachViolations,0);
});
