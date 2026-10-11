import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {OFFSET5_TAXONOMY} from '../frontend/src/data/taxonomy-offset5.js';
const fixture=()=>{const t=createPolishedMachineTemplate('offset5');return {t,s:createMachineSimulation('offset5',t.root,t)};};
test('all three coater rollers remain round over a full moving cycle and reset',()=>{
 const {t,s}=fixture();try{const rollers=s.rotors.filter(r=>r.mesh.userData.coaterRole);assert.equal(rollers.length,3);s.start();
 for(let f=0;f<40;f++){s.update(1000+f*29);t.root.updateMatrixWorld(true);for(const {mesh}of rollers){const c=mesh.getWorldPosition(new T.Vector3()),a=mesh.geometry.attributes.position;let vertices=0;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(mesh.matrixWorld),r=Math.hypot(p.x-c.x,p.y-c.y);if(r<.01)continue;assert.ok(Math.abs(r-mesh.geometry.parameters.radiusTop)<1e-6,`oval ${mesh.userData.coaterRole}: ${r}`);vertices++;}assert.ok(vertices>20);}}
 s.stop();assert.equal(t.root.userData.machineEnvelope.structuralBody.length,26);
 }finally{s.dispose();t.dispose();}
});
test('sheet clears actual moving coating and impression surfaces, including the nip',()=>{
 const {t,s}=fixture();try{const rollers=s.rotors.filter(r=>['impression-cylinder','coating-cylinder'].includes(r.mesh.userData.coaterRole));const points=Array.from({length:7000},(_,i)=>s.curve.getPointAt(i/6999)).filter(p=>p.x>10.1&&p.x<11.2),ray=new T.Raycaster();let checks=0;s.start();
 for(let f=0;f<20;f++){s.update(1000+f*35);t.root.updateMatrixWorld(true);for(const {mesh}of rollers){const c=mesh.getWorldPosition(new T.Vector3());for(const p of points){const dir=p.clone().sub(c),distance=dir.length();if(distance>.40)continue;dir.normalize();ray.set(c.clone().add(dir),dir.clone().negate());const hit=ray.intersectObject(mesh,false)[0];assert.ok(hit);assert.ok(distance-(1-hit.distance)>.0008,`sheet penetrates ${mesh.userData.coaterRole}`);checks++;}}}assert.ok(checks>500);
 }finally{s.dispose();t.dispose();}
});
test('tray clears impression and base, and doctor blade reaches anilox without penetrating it',()=>{
 const {t,s}=fixture();try{t.root.updateMatrixWorld(true);const anilox=t.findNode('coater-roller-anilox').children.find(m=>m.isMesh),c=anilox.getWorldPosition(new T.Vector3()),blade=t.findNode('coater-doctor-blade').children.find(m=>m.isMesh),a=blade.geometry.attributes.position,idx=blade.geometry.index;let gap=Infinity;
 for(let j=0;j<(idx?.count||a.count);j+=3){const pts=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(a,idx?idx.getX(j+k):j+k).applyMatrix4(blade.matrixWorld));gap=Math.min(gap,c.distanceTo(new T.Triangle(...pts).closestPointToPoint(c,new T.Vector3()))-.115);}assert.ok(gap>.0008&&gap<.0012,`blade gap ${gap}`);
 const tray=t.findNode('coater-catch-tray').children.find(m=>m.isMesh),b=new T.Box3().setFromObject(tray);assert.ok(b.max.y<1.03-.255-.01);assert.ok(b.min.y>.70+.01);
 const taxonomy=OFFSET5_TAXONOMY;for(const id of ['coater-roller-anilox','coater-roller-coating','coater-roller-impression','coater-doctor-blade'])assert.ok(taxonomy.some(n=>n.meshRefs?.length===1&&n.meshRefs[0]===id),`individual mapping ${id}`);
 assert.equal(t.findNode('coater').userData.installedGripperVerified,false);
 }finally{s.dispose();t.dispose();}
});
