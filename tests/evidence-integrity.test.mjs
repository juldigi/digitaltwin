import test from 'node:test';
import assert from 'node:assert/strict';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {universalMachineConfig,universalTaxonomy} from '../frontend/src/universal-machine.js';
import {createMachineTemplate,createMachineSimulation,isDedicatedMachineKey} from '../frontend/src/machine-runtime.js';
import {ReferenceMachineTemplate,ReferenceProcessSimulation,isReferenceMachineKey} from '../frontend/src/reference-machines.js';

const references=MACHINE_REGISTRY.filter(m=>!isDedicatedMachineKey(m.machineId));
const blockedReferenceIds=new Set(['BMJ-MCH-0004']);

test('reference assets expose explicit evidence gates and simulation availability follows verification depth',()=>{
  assert.equal(references.length,21);
  for(const machine of references){
    const cfg=universalMachineConfig(machine.machineId),blocked=blockedReferenceIds.has(machine.machineId);
    assert.ok(cfg,machine.machineId);
    assert.equal(isReferenceMachineKey(machine.machineId),true,machine.machineId);
    assert.notEqual(cfg.evidence.geometry,'PLACEHOLDER',machine.machineId);
    assert.equal(cfg.evidence.simulation,blocked?'BLOCKED':'FAMILY_PROCESS_MODEL',machine.machineId);
    assert.ok(cfg.evidence.reason.length>70,machine.machineId);
    assert.ok(cfg.profile.unknowns.length>0,machine.machineId);
  }
});

test('reference geometry never presents family/process reconstruction as serial-specific engineering CAD',()=>{
  for(const machine of references){
    const cfg=universalMachineConfig(machine.machineId),model=createMachineTemplate(machine.machineId);
    assert.ok(model instanceof ReferenceMachineTemplate,machine.name);
    assert.equal(model.root.userData.engineeringDimensions,false,machine.name);
    assert.ok(Array.isArray(model.root.userData.referenceBoundary),machine.name);
    assert.ok(model.root.userData.referenceBoundary.length>0,machine.name);
    assert.ok(typeof model.root.userData.geometryStatus==='string'&&model.root.userData.geometryStatus.length>8,machine.name);
    assert.doesNotMatch(model.root.userData.geometryStatus,/SERIAL_SPECIFIC_ENGINEERING|AS_BUILT_VERIFIED/i,machine.name);
    assert.ok(!/^DEDICATED_/.test(cfg.evidence.geometry),machine.name);
    model.dispose();
  }
});

test('reference taxonomy remains six-level and every node carries an explicit bounded confidence state',()=>{
  for(const machine of references){
    const taxonomy=universalTaxonomy(machine.machineId);
    assert.deepEqual([...new Set(taxonomy.map(n=>n.level))].sort(),[1,2,3,4,5,6],machine.machineId);
    assert.ok(taxonomy.every(n=>n.verified===false),machine.machineId);
    assert.ok(taxonomy.every(n=>typeof n.confidence==='string'&&n.confidence.length>2),machine.machineId);
    assert.ok(taxonomy.every(n=>Array.isArray(n.sourceRefs)&&n.sourceRefs.length>0),machine.machineId);
    for(const n of taxonomy)assert.doesNotMatch(n.confidence,/SERIAL_SPECIFIC_VERIFIED|AS_BUILT_VERIFIED/i,machine.machineId+' '+n.id);
  }
});

test('reference simulation respects blocked assets and never moves ordinary untagged active meshes directly',()=>{
  for(const machine of references){
    const template=createMachineTemplate(machine.machineId),sim=createMachineSimulation(machine.machineId,template.root,template),blocked=blockedReferenceIds.has(machine.machineId);
    assert.ok(template instanceof ReferenceMachineTemplate,machine.machineId);
    assert.ok(sim instanceof ReferenceProcessSimulation,machine.machineId);
    const untagged=template.activeMeshes.filter(m=>!m.userData.motion&&!m.userData.folderDriveRestQuaternion&&m.userData.simulationEnabled!==false).map(m=>({m,p:m.position.clone(),q:m.quaternion.clone()}));
    const state=sim.start();assert.equal(state.blocked,blocked);assert.equal(state.referenceModel,true);
    let now=0;for(let i=0;i<50;i++){now+=100;sim.update(now);}
    if(blocked){
      assert.equal(sim.state().progress,0,machine.machineId);
      assert.equal(sim.state().active,false,machine.machineId);
    }else{
      assert.ok(sim.state().progress>0,machine.machineId);
      assert.ok(sim.state().mechanismCount>0,machine.machineId);
    }
    for(const {m,p,q} of untagged){assert.ok(m.position.distanceTo(p)<1e-12,machine.name+' untagged position changed');assert.ok(m.quaternion.angleTo(q)<1e-12,machine.name+' untagged rotation changed');}
    sim.dispose();template.dispose();
  }
});
