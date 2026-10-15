import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
const setup=()=>{const t=createPolishedMachineTemplate('BMJ-MCH-0040');return {t,s:createMachineSimulation('BMJ-MCH-0040',t.root,t)};};
test('final batch SANSIN visible routes are continuous and contained by represented triangle surfaces',()=>{
 const {t,s}=setup();try{t.setExteriorOpen(true);s.start();s.setPathVisible(true);
  const ducts=t.meshes.filter(m=>/sansin-(supply-flexible-connector|supply-duct-trunk|supply-branch|return-duct-trunk|return-drop|return-inlet-interface)-reference/.test(m.userData.mechanismRole||''));
  for(const kind of ['supply','return'])for(const item of s.ahuParticles.filter(p=>p.kind===kind)){
   const at=q=>{s.elapsed=((q-item.phase+1)%1)*s.cycle;s.updateAHU();t.root.updateMatrixWorld(true);return item.mesh.getWorldPosition(new T.Vector3());};
   for(const q of kind==='supply'?[.62,.66,.72,.84]:[.82,.92])assert.ok(at(q-1e-7).distanceTo(at(q+1e-7))<1e-5,kind+':'+q);
   for(const q of kind==='supply'?[.64,.69,.78,.90]:[.50,.87,.96]){const p=at(q),support=ducts.find(m=>{const b=new T.Box3().setFromObject(m);return ['x','y','z'].every(a=>p[a]-b.min[a]>=.028-1e-6&&b.max[a]-p[a]>=.028-1e-6);});assert.ok(support,kind+':outside '+q);const hits=new T.Raycaster(p.clone().add(new T.Vector3(0,1,0)),new T.Vector3(0,-1,0)).intersectObject(support);assert.ok(hits.some(h=>h.point.distanceTo(p)>=.028-1e-6));}
   at(kind==='supply'?.96:.15);assert.equal(item.mesh.visible,false,'unsupported connector hidden');
  }
 }finally{s.dispose();t.dispose();}
});
test('final batch SANSIN second pass preserves all taxonomy levels, mode orders, parent transforms and lifecycle',()=>{
 const {t,s}=setup();try{s.start();
  for(const order of [0,1]){if(order){t.setLow(true);t.setExteriorOpen(true);}else{t.setExteriorOpen(true);t.setLow(true);}s.setPathVisible(true);s.updateAHU();
   for(const n of t.taxonomy){for(const ref of n.meshRefs||[])assert.ok(t.findNode(ref),ref);const target=t.resolveTaxonomyNode(n.id);t.isolate(target);t.highlight(target);t.ghost(true,target);t.showOnly([target]);t.reset();}
   t.setExteriorOpen(false);t.setLow(false);s.updateAHU();assert.ok(s.ahuParticles.filter(p=>p.kind==='return'||p.mesh.parent===t.findNode('sansin-supply-duct')).every(p=>!visible(p.mesh)));assert.equal(s.state().airflowParticleCount,s.ahuParticles.filter(p=>visible(p.mesh)).length);
  }
  t.setExteriorOpen(true);const item=s.ahuParticles.find(p=>p.kind==='return');s.elapsed=.5*s.cycle;s.updateAHU();t.root.updateMatrixWorld(true);const before=item.mesh.getWorldPosition(new T.Vector3());t.findNode('sansin-return-duct').position.x+=.3;t.root.updateMatrixWorld(true);assert.ok(item.mesh.getWorldPosition(new T.Vector3()).sub(before).distanceTo(new T.Vector3(.3,0,0))<1e-8);t.reset();
  s.elapsed=.1*s.cycle;s.updateAHU();s.setPathVisible(false);s.setPathVisible(true);assert.equal(item.mesh.visible,false);
  s.pause();const e=s.elapsed;s.update(7000);assert.equal(s.elapsed,e);s.resume();s.update(7100);s.stop();assert.ok(s.ahuParticles.every(p=>!p.mesh.visible));s.start();s.stop();
  for(const key of ['exactSansinModelVerified','exactCoolingCapacityVerified','plantDuctRouteVerified','indoorOutdoorArrangementVerified','installedDuctTypeVerified'])assert.equal(t.root.userData[key],false,key);
 }finally{s.dispose();t.dispose();}
});
test('final batch SANSIN fan blades share wheel motion without changing authored rest geometry',()=>{
 const {t,s}=setup();try{t.setExteriorOpen(true);const blades=t.meshes.filter(m=>m.userData.mechanismRole==='sansin-supply-fan-blade-reference'),wheel=t.meshes.find(m=>m.userData.mechanismRole==='sansin-indoor-supply-fan');assert.equal(blades.length,8);
  for(const b of blades){assert.equal(b.parent,wheel);assert.ok(new T.Box3().setFromObject(b).getSize(new T.Vector3()).length()>0);}
  const b=blades[0],rest=b.getWorldQuaternion(new T.Quaternion());s.start();s.update(0);s.update(120);assert.ok(rest.angleTo(b.getWorldQuaternion(new T.Quaternion()))>.1);s.pause();const paused=b.getWorldQuaternion(new T.Quaternion());s.update(5000);assert.ok(paused.angleTo(b.getWorldQuaternion(new T.Quaternion()))<1e-7);s.stop();assert.ok(rest.angleTo(b.getWorldQuaternion(new T.Quaternion()))<1e-7);
 }finally{s.dispose();t.dispose();}
});
