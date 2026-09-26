import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';
import {auditMachineFleet} from '../scripts/audit-machine-fleet.mjs';

const engine=readFileSync(resolve('frontend/src/engine.js'),'utf8');
const bake=readFileSync(resolve('scripts/bake-factory-fleet.mjs'),'utf8');
const polish=readFileSync(resolve('frontend/src/machine-presentation-polish.js'),'utf8');
const sw=readFileSync(resolve('frontend/sw.js'),'utf8');

test('V233 applies presentation polish to all 41 registry machines',()=>{
 assert.equal(MACHINE_REGISTRY.length,41);
 for(const asset of MACHINE_REGISTRY){
  const m=createPolishedMachineTemplate(asset.machineId);
  try{
   assert.equal(m.root.userData.presentationPolishRevision,'V233',asset.machineId);
   assert.equal(m.root.userData.presentationGeometryPolicy,'NO_GENERIC_GEOMETRY_REPLACEMENT__PRESERVE_MACHINE_SPECIFIC_TEMPLATE',asset.machineId);
   assert.equal(m.root.userData.presentationAudit?.valid,true,asset.machineId);
   assert.ok(m.root.userData.presentationAudit?.meshes>0,asset.machineId);
  }finally{m.dispose();}
 }
});

test('V233 full fleet audit finds no invalid geometry, collapsed low-LOD or moving exterior cover',()=>{
 const report=auditMachineFleet();
 assert.equal(report.total,41);
 assert.equal(report.audited,41);
 assert.equal(report.failed,0,JSON.stringify(report.failures,null,2));
 assert.equal(report.passed,41);
});

test('V233 transparent materials stop writing depth and transparent meshes do not cast opaque shadows',()=>{
 for(const id of ['BMJ-MCH-0003','BMJ-MCH-0019','BMJ-MCH-0024']){
  const m=createPolishedMachineTemplate(id);
  try{
   let checked=0;
   m.root.traverse(o=>{
    if(!o.isMesh)return;
    const mats=Array.isArray(o.material)?o.material:[o.material];
    if(mats.some(x=>x&&(x.transparent||x.opacity<.94))){
     checked++;
     assert.equal(o.castShadow,false);
     for(const mat of mats)if(mat&&(mat.transparent||mat.opacity<.94))assert.equal(mat.depthWrite,false);
    }
   });
   assert.ok(checked>0,id+' expected transparent machine detail');
  }finally{m.dispose();}
 }
});

test('V233 UV and inspection light meshes receive bounded emissive presentation without changing geometry',()=>{
 for(const id of ['BMJ-MCH-0019','BMJ-MCH-0020','BMJ-MCH-0024']){
  const m=createPolishedMachineTemplate(id);
  try{
   const lights=[];
   m.root.traverse(o=>{if(o.isMesh&&(o.userData?.uvLamp||o.userData?.inspectionLight))lights.push(o);});
   assert.ok(lights.length>0,id+' expected process lights');
   for(const light of lights){
    if(Array.isArray(light.material)||!('emissiveIntensity' in light.material))continue;
    assert.ok(light.material.emissiveIntensity>=.22);
    assert.equal(light.castShadow,false);
   }
  }finally{m.dispose();}
 }
});

test('V233 live detail scene and factory bake both use the polished wrapper',()=>{
 assert.match(engine,/createPolishedMachineTemplate/);
 assert.match(engine,/const nextTemplate=createPolishedMachineTemplate\(requested\)/);
 assert.match(bake,/createPolishedMachineTemplate/);
 assert.match(bake,/const t=createPolishedMachineTemplate\(place\.machineId\)/);
 assert.match(bake,/t\.setLow\?\.\(true\)/);
});

test('V233 presentation pass preserves machine-specific geometry and performs only surface, bounds and shadow operations',()=>{
 assert.match(polish,/NO_GENERIC_GEOMETRY_REPLACEMENT__PRESERVE_MACHINE_SPECIFIC_TEMPLATE/);
 assert.doesNotMatch(polish,/new THREE\.(BoxGeometry|CylinderGeometry|SphereGeometry|TorusGeometry)/);
 assert.match(polish,/geometry\.computeBoundingBox\(\)/);
 assert.match(polish,/geometry\.computeBoundingSphere\(\)/);
});

test('V233 all polished machine envelopes remain finite after low LOD',()=>{
 for(const asset of MACHINE_REGISTRY){
  const m=createPolishedMachineTemplate(asset.machineId);
  try{
   m.setLow?.(true);m.setExteriorOpen?.(false);m.root.updateMatrixWorld(true);
   const b=new THREE.Box3().setFromObject(m.root),s=b.getSize(new THREE.Vector3());
   for(const v of [...b.min.toArray(),...b.max.toArray(),...s.toArray()])assert.ok(Number.isFinite(v),asset.machineId);
   assert.ok(Math.min(...s.toArray())>.03,asset.machineId);
  }finally{m.dispose();}
 }
});

test('V233 shell marker changes while public V222 cache/query contract remains stable',()=>{
 assert.match(sw,/shell recache without rotating public query identifiers/);
 assert.match(sw,/factory-digital-twin-v222-overlay-state-ssot-20260925/);
 assert.match(sw,/const RELEASE='222'/);
});
