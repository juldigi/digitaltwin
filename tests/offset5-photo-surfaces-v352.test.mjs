import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {TAXONOMY_BY_ID} from '../frontend/src/data/taxonomy-offset5.js';

test('photo fountain liners remain inclined, attached and inside unchanged PU pitch through simulation',()=>{
 const t=createPolishedMachineTemplate('offset5'),sim=createMachineSimulation('offset5',t.root,t);
 try{
  const baseline=t.parts.map(n=>n.position.toArray());
  for(let i=0;i<8;i++){
   const liner=t.findNode(`press-${i}-fountain-liner`),guard=t.findNode(`press-${i}-fountain-guard`);
   assert.ok(liner&&guard);
   const b=new THREE.Box3().setFromObject(liner),u=t.findNode(`press-${i+1}`);
   assert.ok(b.min.x>u.position.x-.59&&b.max.x<u.position.x+.59);
   assert.ok(b.max.y-b.min.y>.10,'liner slope lost');
   const entry=TAXONOMY_BY_ID.get(`O5.PRINT.PU${i+1}.INK.FOUNTAIN.S1`);
   assert.deepEqual(entry.meshRefs,[`press-${i}-fountain-liner`]);assert.equal(entry.verified,false);
  }
  for(const low of [true,false])for(const interior of [false,true]){
   t.setLow(low);t.setExteriorOpen(interior);sim.start();for(let n=0;n<120;n++)sim.update(1/60);sim.pause();sim.resume();sim.stop();
   assert.deepEqual(t.parts.map(n=>n.position.toArray()),baseline);
   for(let i=0;i<8;i++)assert.equal(t.findNode(`press-${i}-fountain-liner`).visible,true);
  }
 }finally{sim.dispose();t.dispose();}
});

test('inspection shoulder and part taxonomy follow attached camera hardware rather than empty focus targets',()=>{
 const t=createPolishedMachineTemplate('offset5');
 try{
  let count=0;t.findNode('inspection-bridge').traverse(o=>{if(o.userData.photoCrankedUpright)count+=o.userData.photoCrankedUprightCount||1;});assert.equal(count,2);
  const camA=TAXONOMY_BY_ID.get('O5.INSPECTION.CAMERA.B1.P1'),camB=TAXONOMY_BY_ID.get('O5.INSPECTION.CAMERA.B1.P2');
  assert.deepEqual(camA.meshRefs,['inspection-camera-a']);assert.deepEqual(camB.meshRefs,['inspection-camera-b']);
  for(const n of [...TAXONOMY_BY_ID.values()].filter(n=>n.id.startsWith('O5.INSPECTION.'))){
   for(const ref of n.meshRefs||[])assert.ok(t.findNode(ref),`${n.id}: ${ref}`);
  }
 }finally{t.dispose();}
});
