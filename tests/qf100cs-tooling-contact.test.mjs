import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
const bounds=n=>{n.updateWorldMatrix(true,true);return new THREE.Box3().setFromObject(n);};
test('QF tooling follows pressure plate, pins close onto stock without penetration and stock never sinks into carriage',()=>{
 const m=createMachineTemplate('BMJ-MCH-0021'),s=createMachineSimulation('BMJ-MCH-0021',m.root,m);
 try{
  const role=r=>m.meshes.filter(x=>x.userData.mechanismRole===r);
  const plate=role('blanking-pressure-plate')[0],board=role('honeycomb-pin-board')[0],pins=role('blanking-tool-pin');
  s.start();let minGap=Infinity;
  for(let i=0;i<=400;i++){
   s.elapsed=s.cycle*i/401;s.updateBlanker();const stock=bounds(s.processPiece),platform=bounds(m.findNode('qf100-platform'));
   assert.ok(Math.abs(stock.min.y-platform.max.y)<1e-6,'stock/support contact');
   assert.ok(Math.abs(bounds(plate).min.y-bounds(board).max.y)<1e-6,'board/plate mounting');
   for(const pin of pins){const gap=bounds(pin).min.y-stock.max.y;assert.ok(gap>=-1e-6,'pin penetrates stock');minGap=Math.min(minGap,gap);}
  }
  assert.ok(minGap<.0001,'pins must reach contact during press');
  s.stop();assert.equal(m.findNode('qf100-pin-board').position.y,0);
  for(const hole of role('honeycomb-hole-reference'))assert.equal(hole.visible,false);
 }finally{s.dispose();m.dispose();}
});
