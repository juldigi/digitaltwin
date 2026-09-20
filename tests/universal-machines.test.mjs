import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {UniversalMachineTemplate,UniversalProcessSimulation,universalMachineConfig,universalTaxonomy} from '../frontend/src/universal-machine.js';

const flagship=new Set(['BMJ-MCH-0002','BMJ-MCH-0003','BMJ-MCH-0009','BMJ-MCH-0010']);
const remaining=MACHINE_REGISTRY.filter(m=>!flagship.has(m.machineId));

test('all 37 remaining equipment resolve to one of the process-specific family builders',()=>{
 assert.equal(remaining.length,37);
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

test('universal cutaway retains active mechanisms and process simulation advances safely',()=>{
 for(const machine of remaining){const model=new UniversalMachineTemplate(machine.machineId);model.setExteriorOpen(true);assert.ok(model.activeMeshes.length>0,machine.machineId);assert.ok(model.activeMeshes.every(m=>m.visible));const sim=new UniversalProcessSimulation(model.root,model);const before=sim.state();sim.start();sim.update(1000);sim.update(1100);const after=sim.state();assert.equal(after.active,true);assert.ok(after.progress>=before.progress);sim.stop();assert.equal(sim.state().active,false);sim.dispose();model.dispose();}
});
