import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createMachineTemplate} from '../frontend/src/machine-runtime.js';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {OFFSET9_SPEC} from '../frontend/src/data/dimensions-offset9.js';
import {OFFSET9_TECHNICAL_SOURCES} from '../frontend/src/data/sources-offset9.js';

const visible=o=>{for(let n=o;n;n=n.parent)if(n.visible===false)return false;return true;};
const structural=o=>o.isMesh&&(!o.userData?.detail||o.userData?.silhouetteCritical||o.userData?.exteriorCover);
const structuralBox=(root,requireVisible=false)=>{
 root.updateMatrixWorld(true);
 const box=new THREE.Box3();let count=0;
 root.traverse(o=>{
  if(!structural(o)||(requireVisible&&!visible(o)))return;
  const b=new THREE.Box3().setFromObject(o,true);
  if(!b.isEmpty()){box.union(b);count++;}
 });
 return {box,count,size:box.getSize(new THREE.Vector3()),center:box.getCenter(new THREE.Vector3())};
};

test('V232 Speedmaster SX52-4+L uses open feeder and delivery architecture instead of closed cuboids',()=>{
 const m=createMachineTemplate('BMJ-MCH-0006');
 try{
  assert.equal(m.root.userData.visualRefinement,'V232_SPEEDMASTER_SX52_4L_FAMILY_SILHOUETTE');
  assert.match(m.root.userData.visualSourceBoundary,/HEIDELBERG_SX52_OFFICIAL_2020/);
  assert.deepEqual(m.root.userData.referenceEnvelope5LOnly,OFFSET9_SPEC.referenceEnvelope5L);
  const feeder=m.findNode('offset9-feeder'),delivery=m.findNode('offset9-delivery');
  assert.ok(feeder&&delivery);
  const feederPile=m.findNode('offset9-feeder-pile'),deliveryStack=m.findNode('offset9-delivery-stack');
  assert.ok(feederPile&&deliveryStack);
  assert.equal(feeder.userData.nodeId,'offset9-feeder');
  assert.equal(delivery.userData.pileHeightOptionVerified,false);
  const critical=m.meshes.filter(x=>x.userData?.silhouetteCritical);
  assert.ok(critical.length>=10);
 }finally{m.dispose();}
});

test('V232 SX52 evidence keeps sample 5+L envelope separate from BMJ 4+L as-built dimensions',()=>{
 const tech=OFFSET9_TECHNICAL_SOURCES.find(x=>x.id==='SX52-OFFICIAL-TECHNICAL-DATA');
 const boundary=OFFSET9_TECHNICAL_SOURCES.find(x=>x.id==='SX52-CONFIGURATION-BOUNDARY');
 assert.ok(tech&&boundary);
 assert.deepEqual(OFFSET9_SPEC.referenceEnvelope5L,[7.67,2.04,1.62]);
 assert.match(OFFSET9_SPEC.dimensionalBoundary,/sample SX 52-5-P\\+L/);
 assert.equal(OFFSET9_SPEC.printingUnits,4);
 assert.equal(OFFSET9_SPEC.coatingUnits,1);
 assert.equal(OFFSET9_SPEC.deliveryPileOptionVerified,false);
});

test('V232 every 3D machine keeps its structural home envelope close to its detail-scene envelope',()=>{
 const failures=[];
 for(const row of MACHINE_REGISTRY.filter(x=>x.has3D)){
  const m=createMachineTemplate(row.machineId);
  try{
   const full=structuralBox(m.root,false);
   assert.ok(full.count>0,`${row.machineId} has no structural meshes`);
   m.setLow?.(true);
   const low=structuralBox(m.root,true);
   if(low.count===0){failures.push(`${row.machineId}: no visible home meshes`);continue;}
   const ratios=['x','y','z'].map(k=>full.size[k]>1e-6?low.size[k]/full.size[k]:1);
   const diag=Math.max(full.size.length(),.001);
   const shift=low.center.distanceTo(full.center)/diag;
   if(ratios.some(v=>v<.82||v>1.06)||shift>.12){
    failures.push(`${row.machineId}: ratios=${ratios.map(v=>v.toFixed(3)).join('/')} shift=${shift.toFixed(3)}`);
   }
  }finally{m.dispose();}
 }
 assert.deepEqual(failures,[]);
});

test('V232 factory bake remains sourced from the same live machine templates',async()=>{
 const fs=await import('node:fs');
 const bake=fs.readFileSync(new URL('../scripts/bake-factory-fleet.mjs',import.meta.url),'utf8');
 const build=fs.readFileSync(new URL('../scripts/build.mjs',import.meta.url),'utf8');
 assert.match(bake,/const t=createMachineTemplate\\(place\\.machineId\\)/);
 assert.match(bake,/t\\.setLow\\?\\.\\(true\\)/);
 assert.ok(build.indexOf('scripts/bake-factory-fleet.mjs')<build.indexOf("cpSync('frontend','dist'"));
});
