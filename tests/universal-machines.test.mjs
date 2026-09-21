import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {UniversalMachineTemplate,UniversalProcessSimulation,universalMachineConfig,universalTaxonomy} from '../frontend/src/universal-machine.js';
import {mechanicalProfile} from '../frontend/src/data/mechanical-profiles.js';

const flagship=new Set(['BMJ-MCH-0002','BMJ-MCH-0003','BMJ-MCH-0005','BMJ-MCH-0006','BMJ-MCH-0009','BMJ-MCH-0010','BMJ-MCH-0011']);
const remaining=MACHINE_REGISTRY.filter(m=>!flagship.has(m.machineId));

test('all 34 remaining equipment resolve to one of the process-specific family builders',()=>{
 assert.equal(remaining.length,34);
 for(const machine of remaining){const cfg=universalMachineConfig(machine.machineId);assert.ok(cfg,machine.machineId);assert.ok(cfg.modules.length>=6);assert.ok(cfg.family);}
});

test('every universal machine has finite grounded geometry and a contiguous six-level taxonomy',()=>{
 for(const machine of remaining){
  const model=new UniversalMachineTemplate(machine.machineId),box=new THREE.Box3().setFromObject(model.root),tax=universalTaxonomy(machine.machineId);
  assert.ok(!box.isEmpty(),machine.machineId);for(const v of [...box.min.toArray(),...box.max.toArray()])assert.ok(Number.isFinite(v));assert.ok(box.min.y>=-0.01,`${machine.machineId} below floor`);
  assert.deepEqual([...new Set(tax.map(n=>n.level))].sort(),[1,2,3,4,5,6]);assert.equal(new Set(tax.map(n=>n.id)).size,tax.length);
  for(const node of tax.filter(n=>n.level>1))assert.ok(tax.some(p=>p.id===node.parentId));
  model.dispose();
 }
});

test('universal cutaway retains visible reference internals while unverified process motion stays blocked',()=>{
 for(const machine of remaining){
  const model=new UniversalMachineTemplate(machine.machineId);model.setExteriorOpen(true);
  assert.ok(model.activeMeshes.length>0,machine.machineId);assert.ok(model.activeMeshes.every(m=>m.visible));
  const initial=model.activeMeshes.map(m=>m.quaternion.clone()),sim=new UniversalProcessSimulation(model.root,model);
  sim.start();sim.update(1000);sim.update(1100);const after=sim.state();
  assert.equal(after.available,false);assert.equal(after.blocked,true);assert.equal(after.active,false);
  assert.equal(after.completed,0);assert.equal(after.sheetsVisible,0);assert.equal(after.mechanismCount,0);
  model.activeMeshes.forEach((m,i)=>assert.ok(m.quaternion.angleTo(initial[i])<1e-12,machine.machineId));
  sim.dispose();model.dispose();
 }
});

test('every non-flagship asset has an evidence-bounded mechanical architecture and process principle',()=>{
 for(const machine of remaining){
  const profile=mechanicalProfile(machine.no),cfg=universalMachineConfig(machine.machineId);
  assert.ok(profile,machine.machineId);assert.equal(cfg.profile,profile);
  assert.ok(profile.architecture.length>=5,machine.machineId);assert.ok(profile.process.length>=5,machine.machineId);
  assert.equal(profile.footprint.length,3);assert.ok(profile.unknowns.length>=1,machine.machineId);
  const taxonomy=universalTaxonomy(machine.machineId);
  for(const component of profile.architecture)assert.ok(taxonomy.some(node=>node.name===component),machine.machineId+' '+component);
 }
});
