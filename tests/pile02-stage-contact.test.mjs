import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {FZ1200MachineTemplate} from '../frontend/src/fz1200.js';
import {FZ1200ProcessSimulation,FZ1200_SIMULATION_STAGES} from '../frontend/src/simulation-fz1200.js';
test('Pile Turner 02 stages follow unequal mechanism windows and pause preserves the active stage',()=>{
 const m=new FZ1200MachineTemplate('BMJ-MCH-0022'),s=new FZ1200ProcessSimulation(m.root,m);
 try{
  s.start();let now=1000;s.update(now);
  for(const [phase,index] of [[.12,1],[.23,2],[.35,3],[.60,4],[.67,5],[.82,6],[.90,7],[.98,7]]){
   while(s.elapsed<phase*14){now+=10;s.update(now);}
   assert.equal(s.state().stage,FZ1200_SIMULATION_STAGES[index],String(phase));
   s.pause();const held=s.state().stage;s.update(now+100000);assert.equal(s.state().stage,held);s.resume();now+=100010;s.update(now);
  }
  s.stop();assert.equal(s.state().stage,FZ1200_SIMULATION_STAGES[0]);
 }finally{s.dispose();m.dispose();}
});
test('Pile Turner 02 contact chain preserves its own identity and supported unload',()=>{
 const m=new FZ1200MachineTemplate('BMJ-MCH-0022'),s=new FZ1200ProcessSimulation(m.root,m);
 const bounds=id=>{m.root.updateMatrixWorld(true);return new THREE.Box3().setFromObject(m.findNode(id));};
 try{
  assert.equal(m.root.userData.assetId,'BMJ-MCH-0022');assert.equal(m.root.userData.spec.serial,'22000320');
  assert.ok(Math.abs(bounds('fz1200-clamp-lower').min.y-bounds('fz1200-base-pallet').max.y)<1e-6);
  s.start();let now=1000;s.update(now);
  for(const t of [2.4,8,13.8]){while(s.elapsed<t){now+=10;s.update(now);}
   if(t===2.4)assert.ok(Math.abs(bounds('fz1200-clamp-upper').min.y-bounds('fz1200-pile').max.y)<.0011);
   else assert.ok(Math.abs(bounds('fz1200-pile').min.y-bounds('fz1200-clamp-upper').max.y)<.0011);
   assert.ok(bounds('fz1200-pile').min.y>0);assert.equal(s.state().interlockSafe,true);
  }
 }finally{s.dispose();m.dispose();}
});
