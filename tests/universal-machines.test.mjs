import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {UniversalMachineTemplate,UniversalProcessSimulation,universalMachineConfig,universalTaxonomy} from '../frontend/src/universal-machine.js';
import {mechanicalProfile} from '../frontend/src/data/mechanical-profiles.js';
import {isDedicatedMachineKey} from '../frontend/src/machine-runtime.js';

const remaining=MACHINE_REGISTRY.filter(m=>!isDedicatedMachineKey(m.machineId));

test('every evidence-insufficient asset still resolves to a process-specific universal family builder',()=>{
 assert.equal(remaining.length,21);
 for(const machine of remaining){
  const cfg=universalMachineConfig(machine.machineId);
  assert.ok(cfg,machine.machineId);
  assert.ok(cfg.modules.length>=6,machine.machineId);
  assert.ok(cfg.family,machine.machineId);
  assert.equal(cfg.evidence.simulation,'BLOCKED',machine.machineId);
 }
});

test('every universal-runtime machine has finite grounded reference geometry and a contiguous six-level taxonomy',()=>{
 for(const machine of remaining){
  const model=new UniversalMachineTemplate(machine.machineId),box=new THREE.Box3().setFromObject(model.root),tax=universalTaxonomy(machine.machineId);
  assert.ok(!box.isEmpty(),machine.machineId);
  for(const v of [...box.min.toArray(),...box.max.toArray()])assert.ok(Number.isFinite(v),machine.machineId);
  assert.ok(box.min.y>=-0.01,`${machine.machineId} below floor`);
  assert.deepEqual([...new Set(tax.map(n=>n.level))].sort(),[1,2,3,4,5,6]);
  assert.equal(new Set(tax.map(n=>n.id)).size,tax.length);
  for(const node of tax.filter(n=>n.level>1))assert.ok(tax.some(p=>p.id===node.parentId),node.id);
  model.dispose();
 }
});

test('universal cutaway retains reference internals while unverified process motion stays blocked',()=>{
 for(const machine of remaining){
  const model=new UniversalMachineTemplate(machine.machineId);model.setExteriorOpen(true);
  assert.ok(model.activeMeshes.length>0,machine.machineId);
  assert.ok(model.activeMeshes.every(m=>m.visible),machine.machineId);
  const initial=model.activeMeshes.map(m=>m.quaternion.clone()),sim=new UniversalProcessSimulation(model.root,model);
  sim.start();sim.update(1000);sim.update(1100);const after=sim.state();
  assert.equal(after.available,false,machine.machineId);assert.equal(after.blocked,true,machine.machineId);assert.equal(after.active,false,machine.machineId);
  assert.equal(after.completed,0,machine.machineId);assert.equal(after.sheetsVisible,0,machine.machineId);assert.equal(after.mechanismCount,0,machine.machineId);
  model.activeMeshes.forEach((m,i)=>assert.ok(m.quaternion.angleTo(initial[i])<1e-12,machine.machineId));
  sim.dispose();model.dispose();
 }
});

test('every universal-runtime asset has an evidence-bounded mechanical architecture and process principle',()=>{
 for(const machine of remaining){
  const profile=mechanicalProfile(machine.no),cfg=universalMachineConfig(machine.machineId);
  assert.ok(profile,machine.machineId);assert.equal(cfg.profile,profile);
  assert.ok(profile.architecture.length>=5,machine.machineId);assert.ok(profile.process.length>=5,machine.machineId);
  assert.equal(profile.footprint.length,3);assert.ok(profile.unknowns.length>=1,machine.machineId);
  const taxonomy=universalTaxonomy(machine.machineId);
  for(const component of profile.architecture)assert.ok(taxonomy.some(node=>node.name===component),machine.machineId+' '+component);
 }
});
