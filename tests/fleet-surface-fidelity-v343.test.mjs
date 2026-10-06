import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {bakeIndexedSurface,fleetMaterialDescriptor} from '../scripts/fleet-surface-bake.mjs';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';
import {MACHINE_PLACEMENTS,loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {buildActualFactory} from '../frontend/src/factory-building.js';
import {usesIndustrialEnvironment} from '../frontend/src/render/environment-system.js';

test('all 41 machines distinguish authored surface materials without changing their palette',()=>{
 for(const p of MACHINE_PLACEMENTS){
  const t=createPolishedMachineTemplate(p.machineId),materials=new Set();
  try{
   t.root.traverse(o=>{if(o.isMesh)for(const m of [].concat(o.material))materials.add(m);});
   const classified=[...materials].filter(m=>m.userData.surfaceRevision==='V343');
   assert.ok(classified.length>0,p.machineId);
   for(const m of classified){
    if(['paintedSteel','rubber','paper'].includes(m.userData.industrialSurface))assert.equal(m.metalness,0,p.machineId+' '+m.userData.surfaceKind);
    if(m.userData.industrialSurface==='stainlessSteel')assert.ok(m.metalness>=.9);
   }
   const colors=[...materials].map(m=>m.color?.getHex()),opaque=[...materials].filter(m=>!m.transparent&&m.opacity===1);
   t.ghost?.(true);t.ghost?.(false);
   assert.deepEqual([...materials].map(m=>m.color?.getHex()),colors);
   for(const m of opaque){assert.equal(m.opacity,1);assert.equal(m.transparent,false);}
  }finally{t.dispose();}
 }
});

test('fleet baking keeps hard panel edges and collapses zero-area quantized faces',()=>{
 const box=new THREE.BoxGeometry(2,2,2).toNonIndexed(),b=bakeIndexedSurface(box);
 assert.equal(b.p.length/3,24,'six faces retain independent corner normals');
 assert.equal(b.n.length,b.p.length);assert.equal(b.i.length,36);
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,.001,0,0,0,.001,0],3));geo.setAttribute('normal',new THREE.Float32BufferAttribute([0,0,1,0,0,1,0,0,1],3));
 assert.equal(bakeIndexedSurface(geo).i.length,0);box.dispose();geo.dispose();
});

test('same-colour paint and metal retain distinct bake descriptors',()=>{
 const paint=new THREE.MeshStandardMaterial({color:0x999999,roughness:.46,metalness:0}),steel=new THREE.MeshStandardMaterial({color:0x999999,roughness:.32,metalness:.95});
 assert.notDeepEqual(fleetMaterialDescriptor(paint),fleetMaterialDescriptor(steel));paint.dispose();steel.dispose();
});

test('factory loader retains authored fleet normals and photo-derived IPAL material distinctions',async()=>{
 const layout=await loadActualPlantLayout(),g=new THREE.BoxGeometry(2,2,2).toNonIndexed(),b=bakeIndexedSurface(g);
 const entry={placement:{machineId:'BMJ-MCH-0003',label:'OFFSET 5',x:10,y:10,rotation:0,status:'DXF_FOOTPRINT'},size:[2,2,2],meshes:[{...b,color:0x999999,roughness:.32,metalness:.95,surface:'stainlessSteel'}]};
 const built=buildActualFactory(layout,[entry]),mesh=built.assets.get('BMJ-MCH-0003').children.find(o=>o.isMesh);
 assert.deepEqual(Array.from(mesh.geometry.attributes.normal.array),Array.from(new Float32Array(b.n)));
 assert.equal(mesh.material.metalness,.95);const found={};
 built.root.traverse(o=>{if(o.userData.semantic)found[o.userData.semantic]=o;});
 assert.equal(found.IPAL_PHOTO_HOPPER_CYLINDER.material.metalness,.9);
 assert.equal(found.IPAL_PHOTO_TANGKI_AN_AEROBIK.material.metalness,.9);
 assert.equal(found.IPAL_PHOTO_CHEMICAL_RACK_COLUMN.material.metalness,0);
 assert.equal(found.IPAL_PHOTO_PUMP_MOTOR.material.metalness,0);
 const resources=new Set();built.root.traverse(o=>{if(o.geometry)resources.add(o.geometry);for(const m of [].concat(o.material||[]))resources.add(m);});for(const r of resources)r.dispose();g.dispose();
});

test('bounded industrial reflections are available on balanced profiles, with economical mode excluded',()=>{
 assert.equal(usesIndustrialEnvironment('hemat'),false);
 for(const p of ['seimbang','tinggi','engineering','cinematic'])assert.equal(usesIndustrialEnvironment(p),true);
});
