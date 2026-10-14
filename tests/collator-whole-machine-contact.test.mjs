import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

const EPS=1e-6;
const bounds=node=>new THREE.Box3().setFromObject(node);

test('Collator process sheets begin on their represented stacks and stay hidden before feed',()=>{
 const t=createMachineTemplate('BMJ-MCH-0023'),sim=createMachineSimulation('BMJ-MCH-0023',t.root,t);
 try{
  let s=sim.start();
  assert.equal(s.sheetsVisible,0,'transient sheets must not duplicate or penetrate idle stacks');
  sim.elapsed=sim.cycle*.02;sim.updateCollator();
  assert.equal(sim.state().sheetsVisible,0);
  for(const item of sim.collatorSheets)assert.ok(Math.abs(item.start.y-(.390+item.bin*.145))<EPS);
 }finally{sim.dispose();t.dispose();}
});

test('Collator completed set is surface-contacted on delivery belt without sheet overlap',()=>{
 const t=createMachineTemplate('BMJ-MCH-0023'),sim=createMachineSimulation('BMJ-MCH-0023',t.root,t);
 try{
  sim.start();sim.elapsed=sim.cycle*.95;sim.updateCollator();t.root.updateMatrixWorld(true);
  const beltTop=bounds(t.findNode('collator-delivery-belt')).max.y;
  const completed=sim.collatorSheets.filter(x=>x.mesh.visible);
  assert.equal(sim.state().completedSheetsInSet,10);
  assert.equal(completed.length,10);
  const boxes=completed.map(x=>bounds(x.mesh)).sort((a,b)=>a.min.y-b.min.y);
  assert.ok(Math.abs(boxes[0].min.y-beltTop)<EPS,'set bottom must contact belt top');
  for(let i=1;i<boxes.length;i++)assert.ok(Math.abs(boxes[i].min.y-boxes[i-1].max.y)<EPS,'output sheets must contact without overlap');
 }finally{sim.dispose();t.dispose();}
});

test('Collator lifecycle, process labels, taxonomy and visual toggle orders remain coherent',()=>{
 const t=createMachineTemplate('BMJ-MCH-0023'),sim=createMachineSimulation('BMJ-MCH-0023',t.root,t);
 try{
  assert.equal(t.root.userData.installedBinCountVerified,false);
  assert.equal(t.root.userData.exactCollatorModelVerified,false);
  for(const p of [.02,.06,.20,.45,.75,.97]){
   sim.start();sim.elapsed=sim.cycle*p;sim.updateCollator();
   assert.equal(sim.state().stage,sim.stages[p<.04?0:p<.10?1:p<.34?2:p<.58?3:p<.94?4:5]);
  }
  sim.pause();assert.equal(sim.state().paused,true);sim.resume();assert.equal(sim.state().running,true);
  sim.stop();assert.equal(sim.state().sheetsVisible,0);sim.start();assert.equal(sim.state().sheetsVisible,0);
  const target=t.findNode('collator-delivery-belt');
  t.setExteriorOpen(true);t.setLow(true);t.setLow(false);t.setExteriorOpen(false);
  t.setLow(true);t.setExteriorOpen(true);t.setExteriorOpen(false);t.setLow(false);
  t.showOnly([target],true);assert.equal(target.visible,true);t.showOnly([],false);
  t.ghost(true);t.ghost(false);t.explode(.5,target);t.explode(0);t.reset();
  for(const node of t.taxonomy.filter(x=>x.level===6))assert.ok(t.findNode(node.meshRefs[0]),node.id);
 }finally{sim.dispose();t.dispose();}
});
