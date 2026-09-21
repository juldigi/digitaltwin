import test from 'node:test';
import assert from 'node:assert/strict';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {universalMachineConfig,universalTaxonomy} from '../frontend/src/universal-machine.js';
import {createMachineTemplate,createMachineSimulation,isDedicatedMachineKey} from '../frontend/src/machine-runtime.js';
import {ReferenceMachineTemplate,ReferenceProcessSimulation,isReferenceMachineKey} from '../frontend/src/reference-machines.js';

const references=MACHINE_REGISTRY.filter(m=>!isDedicatedMachineKey(m.machineId));

test('V120 assigns an explicit bounded family-reference evidence gate to every non-dedicated machine',()=>{
  assert.equal(references.length,21);
  for(const machine of references){
    const cfg=universalMachineConfig(machine.machineId);
    assert.ok(cfg,machine.machineId);
    assert.equal(isReferenceMachineKey(machine.machineId),true,machine.machineId);
    assert.notEqual(cfg.evidence.geometry,'PLACEHOLDER',machine.machineId);
    assert.equal(cfg.evidence.simulation,'FAMILY_PROCESS_MODEL',machine.machineId);
    assert.ok(cfg.evidence.reason.length>70,machine.machineId);
    assert.ok(cfg.profile.unknowns.length>0,machine.machineId);
  }
});

test('V120 reference geometry is never presented as serial-specific actual BMJ geometry',()=>{
  for(const machine of references){
    const cfg=universalMachineConfig(machine.machineId),model=createMachineTemplate(machine.machineId);
    assert.ok(model instanceof ReferenceMachineTemplate,machine.name);
    assert.equal(model.root.userData.engineeringDimensions,false,machine.name);
    assert.ok(Array.isArray(model.root.userData.referenceBoundary),machine.name);
    assert.ok(model.root.userData.referenceBoundary.length>0,machine.name);
    assert.match(model.root.userData.geometryStatus,/REFERENCE_GROUNDED_FAMILY/,machine.name);
    assert.ok(!/^DEDICATED_/.test(cfg.evidence.geometry),machine.name);
    model.dispose();
  }
});

test('V120 reference taxonomy remains six-level and explicitly non-verified at serial level',()=>{
  for(const machine of references){
    const taxonomy=universalTaxonomy(machine.machineId);
    assert.deepEqual([...new Set(taxonomy.map(n=>n.level))].sort(),[1,2,3,4,5,6]);
    assert.ok(taxonomy.every(n=>n.verified===false));
    assert.ok(taxonomy.every(n=>['FAMILY_REFERENCE','REFERENCE_ONLY'].includes(n.confidence)));
  }
});

test('V120 family-process animation moves only explicitly tagged reference mechanisms',()=>{
  for(const machine of references){
    const template=createMachineTemplate(machine.machineId),sim=createMachineSimulation(machine.machineId,template.root,template);
    assert.ok(template instanceof ReferenceMachineTemplate,machine.machineId);
    assert.ok(sim instanceof ReferenceProcessSimulation,machine.machineId);
    const untagged=template.activeMeshes.filter(m=>!m.userData.motion).map(m=>({m,p:m.position.clone(),q:m.quaternion.clone()}));
    const state=sim.start();assert.equal(state.blocked,false);assert.equal(state.referenceModel,true);
    let now=0;for(let i=0;i<50;i++){now+=100;sim.update(now);}
    assert.ok(sim.state().progress>0);assert.ok(sim.state().mechanismCount>0);
    for(const {m,p,q} of untagged){assert.ok(m.position.distanceTo(p)<1e-12,machine.name+' untagged position changed');assert.ok(m.quaternion.angleTo(q)<1e-12,machine.name+' untagged rotation changed');}
    sim.dispose();template.dispose();
  }
});
