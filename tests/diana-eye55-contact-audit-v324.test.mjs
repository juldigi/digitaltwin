import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {DianaEye55MachineTemplate} from '../frontend/src/diana-eye55.js';
import {DianaEye55ProcessSimulation} from '../frontend/src/simulation-diana-eye55.js';

const workingTopY=(template,flag)=>{
 const meshes=template.meshes.filter(mesh=>mesh.userData[flag]);
 assert.ok(meshes.length>0,flag);
 return Math.max(...meshes.map(mesh=>{
  mesh.updateWorldMatrix(true,false);
  return new THREE.Box3().setFromObject(mesh).max.y;
 }));
};
const nearestCurvePoint=(curve,x)=>curve.getPoints(1000).reduce((best,p)=>Math.abs(p.x-x)<Math.abs(best.x-x)?p:best);

test('V324 Diana blanks remain on the physical belt faces from feeder through delivery',()=>{
 const template=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(template.root,template);
 try{
  const samples=[
   [-3.12,workingTopY(template,'feedBelt')],
   [-2.42,workingTopY(template,'suctionBelt')],
   [-1.45,workingTopY(template,'suctionBelt')],
   [-.24,workingTopY(template,'inspectBelt')],
   [2.55,workingTopY(template,'deliveryBelt')],
   [3.62,workingTopY(template,'deliveryBelt')]
  ];
  for(const [x,surfaceY] of samples){
   const blankY=nearestCurvePoint(sim.curve,x).y;
   assert.ok(blankY>=surfaceY-.001,`${x}: blank ${blankY} penetrates belt top ${surfaceY}`);
   assert.ok(blankY-surfaceY<=.006,`${x}: blank floats ${blankY-surfaceY} m above belt`);
  }
  const state=sim.state();
  assert.equal(state.transportContactElevationM,.744);
  assert.equal(state.deliveryContactElevationM,.714);
  assert.equal(state.scanPositionPolicy,'BLANK_RESTS_ON_SUCTION_BELT_WORKING_FACE_IN_OPTICAL_CELL');
 }finally{sim.dispose();template.dispose();}
});

test('V324 accepted and reject branches start continuously from the corrected transport curve',()=>{
 const template=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(template.root,template);
 try{
  assert.ok(sim.rejectBranchStart.distanceTo(sim.curve.getPointAt(sim.rejectBranchStartT))<1e-9);
  assert.ok(sim.goodBranchStart.distanceTo(sim.curve.getPointAt(sim.goodBranchStartT))<1e-9);
  assert.ok(sim.goodLaneEntry.y>sim.goodBranchStart.y);
  assert.ok(sim.rejectTrayEntry.y<sim.rejectBranchStart.y);
 }finally{sim.dispose();template.dispose();}
});
