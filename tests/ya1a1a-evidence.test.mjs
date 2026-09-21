import test from 'node:test';
import assert from 'node:assert/strict';
import {MACHINE_REGISTRY_BY_ID} from '../frontend/src/data/machine-registry.js';
import {mechanicalProfile} from '../frontend/src/data/mechanical-profiles.js';
import {universalMachineConfig,universalTechnicalSources,universalTaxonomy,UniversalMachineTemplate,UniversalProcessSimulation} from '../frontend/src/universal-machine.js';

test('YA1A1A keeps the BMJ master name but uses gravure rather than offset family mechanics',()=>{
 const m=MACHINE_REGISTRY_BY_ID.get('BMJ-MCH-0004'),cfg=universalMachineConfig(m.machineId),profile=mechanicalProfile(m.no);
 assert.equal(m.name,'OFFSET - 7 MACHINE');
 assert.equal(m.model,'YA1A1A');
 assert.match(m.note,/single gravure press/i);
 assert.equal(cfg.family,'gravure');
 assert.equal(cfg.label,'Single-Unit Gravure Press');
 assert.equal(cfg.evidence.grade,'MODEL_IDENTIFIED');
 assert.equal(cfg.evidence.geometry,'FAMILY_REFERENCE');
 assert.equal(cfg.evidence.simulation,'BLOCKED');
 assert.equal(profile.family,'gravure');
 for(const part of ['Ink Pan & Circulation','Gravure Cylinder','Doctor Blade','Impression Cylinder','Drying / Exhaust'])assert.ok(profile.architecture.includes(part),part);
 assert.ok(!profile.architecture.some(x=>/plate\/blanket/i.test(x)));
});

test('YA1A1A source map preserves the exact-model match and the manufacturer identity boundary',()=>{
 const sources=universalTechnicalSources('BMJ-MCH-0004');
 assert.ok(sources.some(s=>/wlzp\.vip/.test(s.url)&&/YA1A1A/.test(s.title)));
 assert.ok(sources.some(s=>/cnverify\.com/.test(s.url)&&/Ezgravtek/.test(s.title)));
 const taxonomy=universalTaxonomy('BMJ-MCH-0004');
 assert.deepEqual([...new Set(taxonomy.map(n=>n.level))].sort(),[1,2,3,4,5,6]);
 assert.ok(taxonomy.some(n=>n.name==='Gravure Cylinder'));
 assert.ok(taxonomy.some(n=>n.name==='Doctor Blade'));
});

test('YA1A1A family correction does not unlock invented process animation',()=>{
 const model=new UniversalMachineTemplate('BMJ-MCH-0004');
 const sim=new UniversalProcessSimulation(model.root,model);
 const before=model.activeMeshes.map(m=>m.quaternion.clone());
 const state=sim.start();
 assert.equal(state.blocked,true);
 assert.equal(state.active,false);
 sim.update(5000);
 assert.equal(sim.state().completed,0);
 model.activeMeshes.forEach((m,i)=>assert.ok(m.quaternion.angleTo(before[i])<1e-12));
 sim.dispose();model.dispose();
});
