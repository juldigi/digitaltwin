import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {OFFSET5_DIMENSIONS as D} from '../frontend/src/data/dimensions-offset5.js';
import {TAXONOMY_BY_ID} from '../frontend/src/data/taxonomy-offset5.js';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

test('every installed layout dimension remains locked to the user-adjusted baseline',()=>{
 assert.deepEqual(D.layout,{
  structuralMinX:-9.20,structuralMaxX:16.80,serviceMinX:-9.75,serviceMaxX:17.25,
  feederCenterX:-8.23,feederBodyLength:1.82,feedBoardCenterX:-6.65,feedBoardLength:1.40,
  firstPrintingUnitX:-5.10,printingUnitPitch:1.95,printingUnitCount:8,printingUnitFrameWidth:1.22,pu1FrameWidth:1.18,
  coaterCenterX:10.595,coaterLength:1.35,dryerCenterX:12.845,dryerLength:1.85,
  inspectionCenterX:13.45,deliveryCenterX:15.67,deliveryBodyLength:2.20,
  operatorWalkwayCenterZ:1.75,operatorWalkwayWidth:.82,driveWalkwayCenterZ:-1.62,driveWalkwayWidth:.64,
  utilityCenterZ:-2.04,platformLength:27,platformCenterX:3.75,
  operatorGalleryLength:23.80,operatorGalleryCenterX:3.40,driveGalleryLength:24.10,driveGalleryCenterX:3.25
 });
});

test('simulation and inspection cycles preserve all installed module transforms and joined cabinet faces',()=>{
 const t=createPolishedMachineTemplate('offset5'),sim=createMachineSimulation('offset5',t.root,t);
 const snapshot=()=>t.parts.map(n=>({id:n.userData.nodeId,position:n.position.toArray(),scale:n.scale.toArray()}));
 const baseline=snapshot();
 const check=()=>{
  assert.deepEqual(snapshot(),baseline);
  for(const id of ['feedboard-pu1-throat','coater-dryer-service-bay','dryer-delivery-access']){
   const node=t.findNode(id),box=new THREE.Box3().setFromObject(node);
   assert.ok(Math.abs(box.min.x-node.userData.upstreamX)<.012,id+' upstream face');
   assert.ok(Math.abs(box.max.x-node.userData.downstreamX)<.012,id+' downstream face');
  }
 };
 try{
  for(const low of [true,false]){
   t.setLow(low);t.setExteriorOpen(false);check();
   sim.start();for(let i=0;i<180;i++)sim.update(1/60);check();
   sim.pause();check();sim.resume();sim.update(1/60);check();sim.stop();check();
   t.setExteriorOpen(true);check();t.setExteriorOpen(false);check();
   t.explode(.5);t.reset();check();
  }
 }finally{sim.dispose();t.dispose();}
});

test('all eight fountain taxonomy entries follow uploaded exterior evidence rather than interior diagram colours',()=>{
 for(let i=1;i<=8;i++){
  const n=TAXONOMY_BY_ID.get(`O5.PRINT.PU${i}.INK.DUCT_ROLL`);
  assert.ok(n,'PU'+i+' fountain entry');
  assert.match(n.description,/IMG_2471/);assert.match(n.description,/IMG_2472/);
  assert.doesNotMatch(n.name,/green|hijau/i);
  assert.match(n.description,/tidak diberi nomor 1–19/);
 }
});
