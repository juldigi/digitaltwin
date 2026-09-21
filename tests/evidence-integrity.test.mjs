import test from 'node:test';
import assert from 'node:assert/strict';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {UniversalMachineTemplate,UniversalProcessSimulation,universalMachineConfig,universalTaxonomy} from '../frontend/src/universal-machine.js';

const dedicated=new Set([2,3,5,6,9,10,11,12]);

test('V69 assigns an explicit evidence gate to every non-dedicated machine',()=>{
  for(const machine of MACHINE_REGISTRY.filter(m=>!dedicated.has(m.no))){
    const cfg=universalMachineConfig(machine.machineId);
    assert.ok(cfg,machine.machineId);
    assert.ok(['MODEL_IDENTIFIED','IDENTITY_ONLY'].includes(cfg.evidence.grade),machine.machineId);
    assert.ok(['OFFICIAL_FAMILY_REFERENCE','FAMILY_REFERENCE','PLACEHOLDER'].includes(cfg.evidence.geometry),machine.machineId);
    assert.equal(cfg.evidence.simulation,'BLOCKED',machine.machineId);
    assert.ok(cfg.evidence.reason.length>40,machine.machineId);
  }
});

test('V69 never presents unknown-model equipment as actual BMJ geometry',()=>{
  for(const no of [4,17,23,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41]){
    const machine=MACHINE_REGISTRY.find(m=>m.no===no);
    const cfg=universalMachineConfig(machine.machineId);
    assert.equal(cfg.evidence.geometry,'PLACEHOLDER',machine.name);
  }
});

test('V69 generic taxonomy remains six-level but carries reference-only verification',()=>{
  for(const no of [1,5,14,19,28,31,40]){
    const machine=MACHINE_REGISTRY.find(m=>m.no===no);
    const taxonomy=universalTaxonomy(machine.machineId);
    assert.deepEqual([...new Set(taxonomy.map(n=>n.level))].sort(),[1,2,3,4,5,6]);
    assert.ok(taxonomy.every(n=>n.verified===false));
  }
});

test('V69 blocks random universal animation, fake throughput and fabricated products',()=>{
  for(const no of [1,5,11,19,24,28,31,40]){
    const machine=MACHINE_REGISTRY.find(m=>m.no===no);
    const template=new UniversalMachineTemplate(machine.machineId);
    const sim=new UniversalProcessSimulation(template.root,template);
    const transforms=template.activeMeshes.map(m=>({p:m.position.clone(),q:m.quaternion.clone()}));
    const before=sim.state();
    assert.equal(before.available,false);
    assert.equal(before.blocked,true);
    assert.equal(before.completed,0);
    assert.equal(before.sheetsVisible,0);
    assert.equal(before.mechanismCount,0);
    sim.start();
    for(let now=0;now<=10000;now+=40)sim.update(now);
    const after=sim.state();
    assert.equal(after.active,false);
    assert.equal(after.running,false);
    assert.equal(after.completed,0);
    assert.equal(after.sheetsVisible,0);
    template.activeMeshes.forEach((m,i)=>{
      assert.ok(m.position.distanceTo(transforms[i].p)<1e-12,machine.name+' moved position');
      assert.ok(m.quaternion.angleTo(transforms[i].q)<1e-12,machine.name+' rotated without evidence');
    });
    sim.dispose();template.dispose();
  }
});
