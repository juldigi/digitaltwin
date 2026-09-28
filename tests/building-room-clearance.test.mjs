import test from 'node:test';
import assert from 'node:assert/strict';
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
