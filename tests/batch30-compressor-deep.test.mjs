import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
const ids=['BMJ-MCH-0030','BMJ-MCH-0031','BMJ-MCH-0032'];
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};

test('batch30 exhaust grille rests on actual cabinet top triangles without resizing either component',()=>{
 for(const id of ids){const t=createPolishedMachineTemplate(id);
  try{t.setExteriorOpen(false);t.root.updateMatrixWorld(true);let top;t.root.traverse(m=>{if(m.userData.mechanismRole==='compressor-cabinet-top-panel-reference')top=m;});
   const grilles=t.meshes.filter(m=>m.userData.mechanismRole==='compressor-top-exhaust-grille-reference');assert.equal(grilles.length,9);
   for(const m of grilles){const point=m.getWorldPosition(new T.Vector3());point.y=new T.Box3().setFromObject(m).min.y;
    const hit=new T.Raycaster(point.clone().add(new T.Vector3(0,.05,0)),new T.Vector3(0,-1,0)).intersectObject(top)[0];assert.ok(hit&&hit.point.distanceTo(point)<1e-6,id+' grille floating');}
  }finally{t.dispose();}}
});

test('batch30 replaced compressor covers stay retired through modes and simulation inspection',()=>{
 for(const id of ids){const t=createPolishedMachineTemplate(id),s=createMachineSimulation(id,t.root,t);
  try{
   const retired=t.meshes.filter(m=>m.userData.replacedByUnifiedCabinet);assert.equal(retired.length,13);
   const check=()=>assert.ok(retired.every(m=>!visible(m)),id);
   for(const order of [0,1]){s.start();if(order){t.setLow(true);t.setExteriorOpen(true);}else{t.setExteriorOpen(true);t.setLow(true);}check();t.setExteriorOpen(false);t.setLow(false);check();t.isolate(t.findNode('universal-module-1'));t.showOnly([],false);t.explode(.4);t.ghost(true);t.reset();check();s.pause();const time=s.elapsed;s.update(200);assert.equal(s.elapsed,time);s.resume();s.update(300);s.update(400);check();s.stop();s.start();check();s.stop();}
   for(const n of t.taxonomy)for(const ref of n.meshRefs||[])assert.ok(t.findNode(ref),id+':'+ref);
  }finally{s.dispose();t.dispose();}}
});

test('batch30 package air and oil reference handoffs are continuous without changing hardware',()=>{
 for(const id of ids){const t=createPolishedMachineTemplate(id),s=createMachineSimulation(id,t.root,t);
  try{s.start();
   for(const kind of ['air','oil'])for(const item of s.compressorParticles.filter(p=>p.kind===kind).slice(0,3)){
    for(const boundary of kind==='oil'?[.25,.50,.75]:[.12,.28,.45,.58,.70]){
     const position=q=>{s.elapsed=((q-item.phase+1)%1)*s.cycle;s.updateCompressor();return item.mesh.position.clone();};
     assert.ok(position(boundary-1e-7).distanceTo(position(boundary+1e-7))<1e-5,id+':'+kind+':'+boundary);
    }
   }
  }finally{s.dispose();t.dispose();}}
});

test('batch30 distribution follows existing pipe triangles, not diagonals, and tracks explode',()=>{
 for(const id of ids){const t=createPolishedMachineTemplate(id),s=createMachineSimulation(id,t.root,t);
  try{s.start();t.setExteriorOpen(true);s.setPathVisible(true);
   const pipes=[];t.root.traverse(m=>{if(m.isMesh&&/compressed-air-(ring-main|swan-neck-rise|swan-neck-top-takeoff|service-drop|service-offtake)-reference/.test(m.userData.mechanismRole||''))pipes.push(m);});
   for(const item of s.compressorParticles.filter(p=>p.kind==='distribution').slice(0,3)){
    for(const q of [.36,.50,.72,.86,.91,.96,.978,.994]){
     s.elapsed=((q-item.phase+1)%1)*s.cycle;s.updateCompressor();t.root.updateMatrixWorld(true);
     const point=item.mesh.getWorldPosition(new T.Vector3()),direction=[.36,.86,.96,.978].includes(q)?new T.Vector3(1,0,0):new T.Vector3(0,1,0);
     const hit=new T.Raycaster(point.clone().addScaledVector(direction,.20),direction.clone().negate()).intersectObjects(pipes)[0];
     assert.ok(hit,id+':'+q+' missing pipe triangle');assert.ok(hit.point.distanceTo(point)-.024>.001,id+':'+q+' sphere outside pipe');
    }
    s.elapsed=((.2-item.phase+1)%1)*s.cycle;s.updateCompressor();s.setPathVisible(false);s.setPathVisible(true);assert.equal(item.mesh.visible,false);
   }
   const item=s.compressorParticles.find(p=>p.kind==='distribution');s.elapsed=.96*s.cycle;s.updateCompressor();
   t.root.updateMatrixWorld(true);const before=item.mesh.getWorldPosition(new T.Vector3());const ring=t.findNode('compressor-ring-main-reference');ring.position.x+=.30;t.root.updateMatrixWorld(true);assert.ok(item.mesh.getWorldPosition(new T.Vector3()).sub(before).distanceTo(new T.Vector3(.30,0,0))<1e-8);
  }finally{s.dispose();t.dispose();}}
});
