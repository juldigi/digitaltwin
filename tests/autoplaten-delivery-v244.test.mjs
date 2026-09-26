import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

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
