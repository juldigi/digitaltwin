import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';
import {auditMachineFleet} from '../scripts/audit-machine-fleet.mjs';

const bake=readFileSync(resolve('scripts/bake-factory-fleet.mjs'),'utf8');
const sw=readFileSync(resolve('frontend/sw.js'),'utf8');
const boxOf=root=>{root.updateMatrixWorld(true);return new THREE.Box3().setFromObject(root);};

test('V234 all 41 machines keep home low-LOD envelope close to the detail model',()=>{
 for(const asset of MACHINE_REGISTRY){
  const m=createPolishedMachineTemplate(asset.machineId);
  try{
   m.setExteriorOpen?.(false);m.setLow?.(false);
   const full=boxOf(m.root),fullSize=full.getSize(new THREE.Vector3()),fullCenter=full.getCenter(new THREE.Vector3());
   m.setLow?.(true);
   const low=boxOf(m.root),lowSize=low.getSize(new THREE.Vector3()),lowCenter=low.getCenter(new THREE.Vector3());
   const ratios=fullSize.toArray().map((v,i)=>v>1e-6?lowSize.getComponent(i)/v:1);
   const drift=fullCenter.distanceTo(lowCenter)/Math.max(...fullSize.toArray(),1e-6);
   assert.ok(ratios.every(v=>v>=.86&&v<=1.14),asset.machineId+' ratios '+ratios.join(','));
   assert.ok(drift<=.10,asset.machineId+' center drift '+drift);
  }finally{m.dispose();}
 }
});

test('V234 fleet audit reports no home/detail silhouette drift',()=>{
 const report=auditMachineFleet();
 assert.equal(report.failed,0,JSON.stringify(report.failures,null,2));
 for(const row of report.machines){
  assert.equal(row.silhouetteParityValid,true,row.machineId);
  assert.ok(Array.isArray(row.silhouetteRatios)&&row.silhouetteRatios.length===3,row.machineId);
  assert.ok(row.silhouetteCenterDrift<=.10,row.machineId);
 }
});

test('V234 factory bake refuses a major silhouette mismatch before serializing home geometry',()=>{
 assert.match(bake,/const silhouetteParity=\(fullBox,lowBox\)=>/);
 assert.match(bake,/ratios\.every\(v=>v>=\.86&&v<=1\.14\)&&centerDrift<=\.10/);
 assert.match(bake,/Home\/detail silhouette drift/);
 assert.match(bake,/silhouetteParity:\{ratios:parity\.ratios,centerDrift:parity\.centerDrift\}/);
});

test('V234 shell marker changes without rotating V222 public cache identifiers',()=>{
 assert.match(sw,/shell recache without rotating public query identifiers/);
 assert.match(sw,/factory-digital-twin-v222-overlay-state-ssot-20260925/);
 assert.match(sw,/const RELEASE='222'/);
});
