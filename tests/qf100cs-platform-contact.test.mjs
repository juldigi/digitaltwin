import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
const bounds=n=>{n.updateWorldMatrix(true,true);return new THREE.Box3().setFromObject(n);};
test('QF workpiece stays supported and centered on carriage during XY index and stopped press registration',()=>{
 const m=createMachineTemplate('BMJ-MCH-0021'),s=createMachineSimulation('BMJ-MCH-0021',m.root,m);
 try{
  s.start();
  for(let i=0;i<=100;i++){
   s.elapsed=s.cycle*(.15+i*.43/100);s.updateBlanker();
   const p=bounds(s.processPiece),b=bounds(m.findNode('qf100-platform'));
   assert.ok(Math.abs(p.min.y-b.max.y)<1e-6);
   assert.ok(p.min.x>=b.min.x&&p.max.x<=b.max.x);
   assert.ok(p.min.z>=b.min.z&&p.max.z<=b.max.z);
   assert.ok(Math.abs(p.getCenter(new THREE.Vector3()).x-b.getCenter(new THREE.Vector3()).x)<1e-6);
  }
  s.stop();s.start();const p=bounds(s.processPiece),b=bounds(m.findNode('qf100-platform'));
  assert.ok(Math.abs(p.min.y-b.max.y)<1e-6);assert.ok(p.min.x>=b.min.x&&p.max.x<=b.max.x);
 }finally{s.dispose();m.dispose();}
});
