import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {OFFSET5_DIMENSIONS as D,OFFSET5_UNIT_CENTERS as centers} from '../frontend/src/data/dimensions-offset5.js';
const bounds=n=>new THREE.Box3().setFromObject(n);
const close=(a,b)=>assert.ok(Math.abs(a-b)<.012,`${a} != ${b}`);

test('V339 vacuum-table receiving throat joins both locked faces at table height',()=>{
 const t=createPolishedMachineTemplate('offset5');
 try{
  const throat=t.findNode('feedboard-pu1-throat'),b=bounds(throat);
  close(b.min.x,D.layout.feedBoardCenterX+D.layout.feedBoardLength/2);
  close(b.max.x,centers[0]-D.layout.pu1FrameWidth/2);
  assert.ok(b.min.y<=.28&&b.max.y>=1.35);
  assert.equal(throat.userData.sourcePhoto,'IMG_1626.jpeg');
 }finally{t.dispose();}
});

test('V339 all PU transverse guards cover upper and lower faces without roofing the deck',()=>{
 const t=createPolishedMachineTemplate('offset5');
 try{
  for(let i=0;i<8;i++){
   const guards=t.findNode(`press-${i}-face-guards`),b=bounds(guards);
   assert.ok(b.min.y<1.38&&b.max.y>2.60);
   assert.ok(b.max.z-b.min.z>=1.799);
   assert.equal(guards.userData.sourcePhoto,'IMG_1628.jpeg');
   assert.equal(t.findNode(`press-${i}-top-deck`).userData.solidTopCover,false);
  }
 }finally{t.dispose();}
});

test('V339 normal exterior encloses every inter-PU transfer through quality/reset cycles',()=>{
 const t=createPolishedMachineTemplate('offset5');
 try{
  const transfers=t.meshes.filter(m=>/^transfer-pu\d+-pu\d+/.test(m.userData.ownerId||''));
  assert.ok(transfers.length>40);
  assert.ok(transfers.every(m=>!m.visible),'no transfer mounts exposed on first render');
  for(const low of [true,false,true]){
   t.setLow(low);t.reset();
   assert.ok(transfers.every(m=>!m.visible));
   for(const id of ['feedboard-pu1-throat','pu8-coater-access','coater-dryer-service-bay','dryer-delivery-access']){
    const meshes=[];t.findNode(id).traverse(m=>{if(m.isMesh&&m.userData.exteriorCover)meshes.push(m);});
    assert.ok(meshes.length&&meshes.every(m=>m.visible),`${id} disappears at low=${low}`);
   }
   t.setExteriorOpen(true);
   assert.ok(transfers.every(m=>m.visible));
   t.setExteriorOpen(false);
  }
 }finally{t.dispose();}
});

test('V339 downstream cabinets meet locked module faces and retain flat supported decks',()=>{
 const t=createPolishedMachineTemplate('offset5');
 try{
  for(const id of ['coater-dryer-service-bay','dryer-delivery-access']){
   const n=t.findNode(id),b=bounds(n);
   close(b.min.x,n.userData.upstreamX);close(b.max.x,n.userData.downstreamX);
   assert.ok(b.min.y<=.01);close(b.max.y,1.335);
   assert.equal(n.userData.continuousCabinet,true);
  }
  assert.equal(D.layout.printingUnitPitch,1.95);
  assert.equal(D.layout.firstPrintingUnitX,-5.10);
 }finally{t.dispose();}
});


test('V339 simulation keeps the repaired exterior through start, pause, resume and stop',()=>{
 const t=createPolishedMachineTemplate('offset5');
 const sim=createMachineSimulation('offset5',t.root,t);
 try{
  for(const low of [true,false]){
   t.setLow(low);t.setExteriorOpen(false);
   const check=()=>{
    for(const m of t.meshes.filter(m=>/^transfer-pu/.test(m.userData.ownerId||'')))assert.equal(m.visible,false);
    for(const id of ['feedboard-pu1-throat','coater-dryer-service-bay','dryer-delivery-access'])
     assert.ok(t.findNode(id).children.filter(m=>m.isMesh&&m.userData.exteriorCover).every(m=>m.visible));
   };
   sim.start();for(let frame=0;frame<=600;frame++)sim.update(frame*1000/60);
   check();sim.pause();check();sim.resume();sim.update(11000);check();sim.stop();t.reset();check();
  }
 }finally{sim.dispose();t.dispose();}
});
