import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createSurfaceDetailTexture,SurfaceDetailPool} from '../frontend/src/render/surface-detail.js';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {MACHINE_PLACEMENTS,loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {buildActualFactory} from '../frontend/src/factory-building.js';
import {visibleMachineBounds} from '../scripts/audit-machine-fleet.mjs';

test('optical microfinish is deterministic bounded non-colour data without fabricated damage',()=>{
 for(const surface of ['paintedSteel','stainlessSteel','galvanizedSteel','rubber','paper','factoryConcrete']){
  const a=createSurfaceDetailTexture(surface),b=createSurfaceDetailTexture(surface);
  assert.deepEqual(a.image.data,b.image.data);assert.equal(a.image.data.byteLength,4096);
  assert.equal(a.colorSpace,THREE.NoColorSpace);assert.equal(a.generateMipmaps,true);
  const green=[];for(let i=0;i<a.image.data.length;i+=4){assert.equal(a.image.data[i],255);green.push(a.image.data[i+1]);assert.equal(a.image.data[i+2],255);assert.equal(a.image.data[i+3],255);}
  assert.ok(Math.min(...green)>=224);assert.ok(new Set(green).size>3);
  assert.equal(a.userData.displacement,false);a.dispose();b.dispose();
 }
});

test('pooled finishes release only after the final owner and preserve authored maps/glass',()=>{
 const pool=new SurfaceDetailPool(),g=new THREE.BoxGeometry(1,1,1),a=new THREE.MeshStandardMaterial(),b=a.clone();
 for(const m of [a,b])m.userData.industrialSurface='paintedSteel';
 pool.attach(new THREE.Mesh(g,a));pool.attach(new THREE.Mesh(g,b));assert.equal(a.roughnessMap,b.roughnessMap);
 let released=0;a.roughnessMap.addEventListener('dispose',()=>released++);
 a.dispose();assert.equal(released,0);b.dispose();assert.equal(released,1);b.dispose();assert.equal(released,1);
 const authored=new THREE.Texture(),m=new THREE.MeshStandardMaterial({roughnessMap:authored});m.userData.industrialSurface='paintedSteel';pool.attach(new THREE.Mesh(g,m));assert.equal(m.roughnessMap,authored);
 const glass=new THREE.MeshStandardMaterial({transparent:true,opacity:.4});glass.userData.industrialSurface='paintedSteel';pool.attach(new THREE.Mesh(g,glass));assert.equal(glass.roughnessMap,null);
 pool.dispose();assert.equal(released,1);g.dispose();m.dispose();authored.dispose();glass.dispose();
});

test('all 41 models keep colour, geometry and surface resources through simulation and teardown',()=>{
 for(const p of MACHINE_PLACEMENTS){
  const t=createPolishedMachineTemplate(p.machineId),sim=createMachineSimulation(p.machineId,t.root,t),textures=new Set(),materials=new Set();
  t.root.traverse(o=>{if(o.isMesh)for(const m of [].concat(o.material)){if(m.userData.surfaceDetailRevision==='V344')materials.add(m);if(m.roughnessMap?.userData.surfaceDetailRevision==='V344')textures.add(m.roughnessMap);}});
  assert.ok(textures.size>0&&textures.size<=6,p.machineId);
  const colours=[...materials].map(m=>m.color?.getHex()),bounds=visibleMachineBounds(t.root).getSize(new THREE.Vector3());
  let released=0;for(const tex of textures)tex.addEventListener('dispose',()=>released++);
  sim.start();sim.update(0);for(let i=1;i<30;i++)sim.update(i*16);sim.stop();
  t.ghost?.(true);t.ghost?.(false);
  assert.deepEqual([...materials].map(m=>m.color?.getHex()),colours,p.machineId);
  assert.ok(visibleMachineBounds(t.root).getSize(new THREE.Vector3()).distanceTo(bounds)<1e-6,p.machineId);
  sim.dispose();t.dispose();assert.equal(released,textures.size,p.machineId+' texture leak');
 }
});

test('active photo-derived IPAL adds optical finish and releases it on factory teardown',async()=>{
 const built=buildActualFactory(await loadActualPlantLayout(),[]),textures=new Set();
 built.root.traverse(o=>{if(o.isMesh&&o.userData.evidenceLayer==='PHOTO_ACTUAL'&&o.material?.roughnessMap?.userData.surfaceDetailRevision==='V344')textures.add(o.material.roughnessMap);});
 assert.ok(textures.size>=3&&textures.size<=6);let released=0;for(const tex of textures)tex.addEventListener('dispose',()=>released++);
 built.disposeSurfaceDetails();assert.equal(released,textures.size);built.disposeSurfaceDetails();assert.equal(released,textures.size);
 const resources=new Set();built.root.traverse(o=>{if(o.geometry)resources.add(o.geometry);for(const m of [].concat(o.material||[]))resources.add(m);});for(const r of resources)r.dispose();
});
