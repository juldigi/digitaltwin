import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {SharkN650MachineTemplate} from '../frontend/src/shark-n650.js';
import {SharkN650ProcessSimulation} from '../frontend/src/simulation-shark-n650.js';

const worldBounds=node=>{node.updateWorldMatrix(true,true);return new THREE.Box3().setFromObject(node);};
const taggedTop=(template,flag)=>Math.max(...template.meshes.filter(m=>m.userData[flag]).map(m=>worldBounds(m).max.y));
const nearest=(curve,x)=>curve.getPoints(1200).reduce((best,p)=>Math.abs(p.x-x)<Math.abs(best.x-x)?p:best);

test('V325 SHARK suction pickup closes onto the represented pile and stays attached to its stems',()=>{
 const model=new SharkN650MachineTemplate(),sim=new SharkN650ProcessSimulation(model.root,model);
 try{
  const pileTop=worldBounds(model.findNode('shark650-feed-stack')).max.y;
  assert.ok(Math.abs(pileTop-.4645)<1e-6);
  assert.equal(sim.suckers.length,8,'cups and their attached stems must reciprocate together');
  const cups=sim.suckers.filter(m=>m.userData.mechanismRole==='suction-cup');
  assert.equal(cups.length,4);
  for(const cup of cups){
   const bottom=worldBounds(cup).min.y;
   assert.ok(Math.abs((bottom-pileTop)-cup.userData.pickupClearanceM)<1e-6);
  }
  sim.start();let now=1000,minGap=Infinity;
  for(let i=0;i<400;i++){now+=10;sim.update(now);for(const cup of cups)minGap=Math.min(minGap,worldBounds(cup).min.y-pileTop);}
  assert.ok(Math.abs(minGap)<.001,`pickup missed pile by ${minGap} m`);
 }finally{sim.dispose();model.dispose();}
});

test('V325 SHARK tracked blanks follow pile transfer inspection and both return working faces',()=>{
 const model=new SharkN650MachineTemplate(),sim=new SharkN650ProcessSimulation(model.root,model);
 try{
  const pileTop=worldBounds(model.findNode('shark650-feed-stack')).max.y;
  const transferTop=taggedTop(model,'suctionBelt');
  const inspectionTop=taggedTop(model,'inspectBelt');
  const goodTop=taggedTop(model,'goodReturnBelt');
  const badTop=taggedTop(model,'badReturnBelt');
  for(const [x,surface,tolerance] of [[-3.32,pileTop,.001],[-1.82,transferTop,.003],[-.12,inspectionTop,.003]]){
   const y=nearest(sim.curve,x).y;assert.ok(y>=surface-.001&&y-surface<=tolerance,`${x}: blank=${y}, surface=${surface}`);
  }
  assert.ok(Math.abs(sim.goodLaneEntry.y-(goodTop+.003))<1e-6);
  assert.ok(Math.abs(sim.badLaneEntry.y-(badTop+.003))<1e-6);
  const state=sim.state();
  assert.equal(state.scanPositionPolicy,'BLANK_RESTS_ON_INSPECTION_BELT_WORKING_FACE');
  assert.equal(state.pileContactElevationM,.4645);
 }finally{sim.dispose();model.dispose();}
});

test('V325 SHARK output branches remain continuous after contact correction',()=>{
 const model=new SharkN650MachineTemplate(),sim=new SharkN650ProcessSimulation(model.root,model);
 try{
  assert.ok(sim.returnBranchStart.distanceTo(sim.curve.getPointAt(sim.returnBranchStartT))<1e-9);
  assert.ok(sim.goodLaneEntry.y>=taggedTop(model,'goodReturnBelt'));
  assert.ok(sim.badLaneEntry.y>=taggedTop(model,'badReturnBelt'));
 }finally{sim.dispose();model.dispose();}
});
