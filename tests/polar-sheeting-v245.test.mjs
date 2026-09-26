import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';

test('all 41 models can reset and enter mobile detail after presentation refinement',()=>{
 for(const asset of MACHINE_REGISTRY){
  const template=createPolishedMachineTemplate(asset.machineId);
  try{assert.doesNotThrow(()=>{template.reset?.();template.setLow?.(true);},asset.machineId);}
  finally{template.dispose();}
 }
});

test('Polar reset restores every refined node without an undefined rest pose',()=>{
 const template=createPolishedMachineTemplate('BMJ-MCH-0001');
 try{
  assert.ok(template.nodes.length>0);
  for(const node of template.nodes){
   assert.ok(node.userData.rest?.isVector3,node.userData.nodeId);
   assert.ok(node.userData.restQuaternion?.isQuaternion,node.userData.nodeId);
  }
  template.explode(.6);template.reset();template.setLow(true);
  assert.ok(template.nodes.every(n=>n.position.distanceTo(n.userData.rest)<1e-9));
 }finally{template.dispose();}
});

test('Sheeting web is one continuous surface, cut stroke appears, and delivery stays face-up',()=>{
 const template=createPolishedMachineTemplate('BMJ-MCH-0002'),sim=createMachineSimulation('BMJ-MCH-0002',template.root,template);
 try{
  assert.equal(sim.webRibbonSegments.length,1);
  const ribbon=sim.webRibbonSegments[0],positions=ribbon.geometry.attributes.position;
  assert.ok(ribbon.geometry.index.count>500);
  assert.ok(positions.count>300);
  for(let s=sim.sheetCenterStartS;s<sim.outputLength;s+=sim.outputLength/40){
   const pose=sim.poseAtDistance(s);
   assert.ok(Math.abs(pose.angle)<Math.PI/2,'detached sheet suddenly turns over');
  }
  sim.start();assert.equal(sim.cutAction.visible,false);
  let now=0;sim.update(now);
  for(let i=0;i<300&&!sim.cutAction.visible;i++){now+=10;sim.update(now);}
  assert.ok(sim.cutAction.visible,'cut cue never appears');
  assert.equal(sim.cutAction.userData.notABlade,true);
  assert.ok(sim.state().cutActionVisible);
  sim.stop();assert.equal(sim.cutAction.visible,false);
 }finally{sim.dispose();template.dispose();}
});
