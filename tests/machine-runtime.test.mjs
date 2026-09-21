import test from 'node:test';import assert from 'node:assert/strict';
import {normalizeMachineKey,isDedicatedMachineKey,createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {UniversalMachineTemplate,UniversalProcessSimulation,universalMachineConfig,universalTaxonomy,universalTechnicalSources} from '../frontend/src/universal-machine.js';
import {ReferenceMachineTemplate,ReferenceProcessSimulation,isReferenceMachineKey,REFERENCE_MACHINE_IDS} from '../frontend/src/reference-machines.js';

test('legacy BMJ IDs normalize to the same dedicated routes used by machine cards',()=>{
 assert.equal(normalizeMachineKey('BMJ-MCH-0002'),'sheeting');
 assert.equal(normalizeMachineKey('BMJ-MCH-0003'),'offset5');
 assert.equal(normalizeMachineKey('BMJ-MCH-0009'),'offset10');
 assert.equal(normalizeMachineKey('BMJ-MCH-0010'),'apm2');
 for(const id of ['BMJ-MCH-0002','BMJ-MCH-0003','BMJ-MCH-0009','BMJ-MCH-0010'])assert.equal(isDedicatedMachineKey(id),true,id);
});

test('exact and strong dedicated assets never fall through to UniversalMachineTemplate',()=>{
 for(const key of ['BMJ-MCH-0006','BMJ-MCH-0007','BMJ-MCH-0008','BMJ-MCH-0011','BMJ-MCH-0012','BMJ-MCH-0013','BMJ-MCH-0014','BMJ-MCH-0015','BMJ-MCH-0016','BMJ-MCH-0018','BMJ-MCH-0019','BMJ-MCH-0020','BMJ-MCH-0022','BMJ-MCH-0024']){
  const template=createMachineTemplate(key);
  assert.equal(template.constructor,UniversalMachineTemplate,key+' fell through to plain universal geometry');
  const sim=createMachineSimulation(key,template.root,template);
  assert.equal(sim.constructor,UniversalProcessSimulation,key+' fell through to blocked universal simulation');
  sim.dispose();template.dispose();
 }
});

test('all formerly blocked assets now use reference-grounded geometry and family-process simulation',()=>{
 assert.equal(REFERENCE_MACHINE_IDS.length,21);
 for(const key of REFERENCE_MACHINE_IDS){
  assert.equal(isReferenceMachineKey(key),true,key);
  const template=createMachineTemplate(key),sim=createMachineSimulation(key,template.root,template);
  assert.ok(template instanceof ReferenceMachineTemplate,key);
  assert.ok(sim instanceof ReferenceProcessSimulation,key);
  assert.equal(sim.state().blocked,false,key);assert.equal(sim.state().available,true,key);
  assert.notEqual(universalMachineConfig(key).evidence.geometry,'PLACEHOLDER',key);
  sim.dispose();template.dispose();
 }
});

test('every non-legacy dedicated BMJ runtime is synchronized with UI evidence taxonomy and source routing',()=>{
 const ids=['BMJ-MCH-0001','BMJ-MCH-0005','BMJ-MCH-0006','BMJ-MCH-0007','BMJ-MCH-0008','BMJ-MCH-0011','BMJ-MCH-0012','BMJ-MCH-0013','BMJ-MCH-0014','BMJ-MCH-0015','BMJ-MCH-0016','BMJ-MCH-0018','BMJ-MCH-0019','BMJ-MCH-0020','BMJ-MCH-0022','BMJ-MCH-0024'];
 for(const id of ids){
  const cfg=universalMachineConfig(id),template=createMachineTemplate(id);
  assert.ok(cfg,id);assert.equal(cfg.evidence.simulation,'VERIFIED_PROCESS_MODEL',id+' UI evidence is not simulation-enabled');
  const uiTax=universalTaxonomy(id),runtimeTax=template.taxonomy||[];
  assert.ok(uiTax.length>0,id+' UI taxonomy empty');assert.deepEqual(uiTax.map(n=>n.id),runtimeTax.map(n=>n.id),id+' taxonomy routing diverged');
  const uiSources=universalTechnicalSources(id),runtimeSources=template.root.userData?.sources||[];
  assert.ok(uiSources.length>0,id+' UI sources empty');
  if(runtimeSources.length)assert.deepEqual(uiSources.map(s=>s.id),runtimeSources.map(s=>s.id),id+' source routing diverged');
  template.dispose();
 }
});

test('V120 reference assets expose UI taxonomy and technical-source evidence',()=>{
 for(const id of REFERENCE_MACHINE_IDS){
  const tax=universalTaxonomy(id),sources=universalTechnicalSources(id);
  assert.ok(tax.length>0,id);assert.ok(sources.length>0,id);
  assert.deepEqual([...new Set(tax.map(n=>n.level))].sort(),[1,2,3,4,5,6],id);
 }
});
