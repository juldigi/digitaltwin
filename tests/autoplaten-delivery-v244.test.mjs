import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

test('MK1060 ER places separated blanks and edge waste on their respective conveyors',()=>{
 const template=createPolishedMachineTemplate('BMJ-MCH-0013'),sim=createMachineSimulation('BMJ-MCH-0013',template.root,template);
 try{
  sim.start();sim.update(1000);
  for(let now=1020;now<14000;now+=20)sim.update(now);
  assert.ok(sim.completed>=1);
  for(const [nodeId,pieces,thickness] of [
   ['mk1060-product-delivery',sim.blankStack,.006],
   ['mk1060-waste-conveyor',sim.wastePieces,.012]
  ]){
   const support=new THREE.Box3().setFromObject(template.findNode(nodeId));
   const piece=pieces.find(item=>item.visible);
   assert.ok(piece,`${nodeId} receives output`);
   const world=piece.getWorldPosition(new THREE.Vector3());
   assert.ok(Math.abs(world.y-thickness/2-support.max.y)<.002,`${nodeId} output rests on its conveyor`);
   assert.ok(world.x>=support.min.x&&world.x<=support.max.x);
   assert.ok(world.z>=support.min.z&&world.z<=support.max.z);
  }
 }finally{sim.dispose();template.dispose();}
});

for(const id of ['BMJ-MCH-0013','BMJ-MCH-0014','BMJ-MCH-0015'])test(`${id} preserves cutaway and detail quality when toggled in either order`,()=>{
 const model=createPolishedMachineTemplate(id);
 try{
  const cover=model.meshes.find(m=>m.userData.exteriorCover);
  const detail=model.meshes.find(m=>m.userData.detail&&!m.userData.silhouetteCritical&&!m.userData.exteriorCover);
  assert.ok(cover);assert.ok(detail);
  model.setExteriorOpen(true);model.setLow(true);
  assert.equal(cover.visible,false);assert.equal(detail.visible,false);
  model.setExteriorOpen(false);
  assert.equal(cover.visible,true);assert.equal(detail.visible,false);
  model.setLow(false);
  assert.equal(detail.visible,true);
  model.setLow(true);model.setExteriorOpen(true);
  assert.equal(cover.visible,false);
 }finally{model.dispose();}
});

for(const [id,tableId,pileKey] of [
 ['BMJ-MCH-0011','mk920-delivery-pile','stack'],
 ['BMJ-MCH-0012','mk920-delivery-pile','stack'],
 ['BMJ-MCH-0014','pm106-delivery-pallet','productStack'],
 ['BMJ-MCH-0015','pm106-delivery-pallet','productStack'],
]){
 test(`${id} delivers new product onto an initially empty table`,()=>{
  const template=createPolishedMachineTemplate(id),sim=createMachineSimulation(id,template.root,template);
  try{
   const table=template.findNode(tableId).children.find(o=>o.isMesh);
   assert.ok(table&&sim.staticDeliveryStack?.visible);
   const box=new THREE.Box3().setFromObject(table);
   sim.start();
   assert.equal(sim.staticDeliveryStack.visible,false);
   assert.equal(sim.state().pileSheetsVisible,0);
   sim.outputSheet();
   const product=sim[pileKey].find(o=>o.visible);
   assert.ok(product);
   const world=product.getWorldPosition(new THREE.Vector3());
   assert.ok(world.y>=box.max.y&&world.y<box.max.y+.04,`${id} product floats above or sinks into table`);
   assert.ok(world.x>=box.min.x&&world.x<=box.max.x);
   assert.equal(sim.state().pileSheetsVisible,1);
   sim.stop();
   assert.equal(sim.staticDeliveryStack.visible,true);
   assert.equal(sim.state().pileSheetsVisible,0);
  }finally{sim.dispose();template.dispose();}
 });
}
