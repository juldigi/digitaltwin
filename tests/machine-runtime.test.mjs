import test from 'node:test';import assert from 'node:assert/strict';
import {normalizeMachineKey,isDedicatedMachineKey,createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {UniversalMachineTemplate,UniversalProcessSimulation,universalMachineConfig,universalTaxonomy,universalTechnicalSources} from '../frontend/src/universal-machine.js';
import {ReferenceMachineTemplate,ReferenceProcessSimulation,isReferenceMachineKey,REFERENCE_MACHINE_IDS} from '../frontend/src/reference-machines.js';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';

const blockedReferenceIds=new Set(['BMJ-MCH-0004']);

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
  assert.notEqual(template.constructor,UniversalMachineTemplate,key+' fell through to plain universal geometry');
  const sim=createMachineSimulation(key,template.root,template);
  assert.notEqual(sim.constructor,UniversalProcessSimulation,key+' fell through to blocked universal simulation');
  sim.dispose();template.dispose();
 }
});

test('all reference assets use evidence-grounded geometry and simulation availability follows the evidence boundary',()=>{
 assert.equal(REFERENCE_MACHINE_IDS.length,21);
 for(const key of REFERENCE_MACHINE_IDS){
  assert.equal(isReferenceMachineKey(key),true,key);
  const template=createMachineTemplate(key),sim=createMachineSimulation(key,template.root,template);
  assert.ok(template instanceof ReferenceMachineTemplate,key);
  assert.ok(sim instanceof ReferenceProcessSimulation,key);
  const blocked=blockedReferenceIds.has(key);
  assert.equal(sim.state().blocked,blocked,key);
  assert.equal(sim.state().available,!blocked,key);
  assert.equal(universalMachineConfig(key).evidence.simulation,blocked?'BLOCKED':'FAMILY_PROCESS_MODEL',key);
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

test('V120 registry invariant: all 41 BMJ assets avoid plain universal geometry and blocked universal simulation',()=>{
 assert.equal(MACHINE_REGISTRY.length,41);
 for(const machine of MACHINE_REGISTRY){
  const template=createMachineTemplate(machine.machineId),sim=createMachineSimulation(machine.machineId,template.root,template);
  assert.notEqual(template.constructor,UniversalMachineTemplate,machine.machineId+' still renders plain universal geometry');
  assert.notEqual(sim.constructor,UniversalProcessSimulation,machine.machineId+' still uses blocked universal simulation');
  sim.dispose();template.dispose();
 }
});

test('V120 reference assets expose UI taxonomy and technical-source evidence',()=>{
 for(const id of REFERENCE_MACHINE_IDS){
  const tax=universalTaxonomy(id),sources=universalTechnicalSources(id);
  assert.ok(tax.length>0,id);assert.ok(sources.length>0,id);
  assert.deepEqual([...new Set(tax.map(n=>n.level))].sort(),[1,2,3,4,5,6],id);
 }
});

test('V132 AHU twins expose indoor/outdoor duct interfaces and separate supply return airflow simulation',()=>{
 const ids=['BMJ-MCH-0036','BMJ-MCH-0037','BMJ-MCH-0038','BMJ-MCH-0039','BMJ-MCH-0040','BMJ-MCH-0041'];
 for(const id of ids){
  const template=createMachineTemplate(id),roles=new Set(),nodes=new Set();
  template.root.traverse(o=>{if(o.userData?.mechanismRole)roles.add(o.userData.mechanismRole);if(o.userData?.nodeId)nodes.add(o.userData.nodeId);});
  assert.equal(template.root.userData.plantDuctRouteVerified,false,id);
  assert.ok(nodes.has(id==='BMJ-MCH-0040'?'sansin-air-distribution':'ahu-air-distribution'),id);
  assert.ok(nodes.has(id==='BMJ-MCH-0040'?'sansin-supply-duct':'ahu-supply-duct'),id);
  assert.ok(nodes.has(id==='BMJ-MCH-0040'?'sansin-return-duct':'ahu-return-duct'),id);
  assert.ok(roles.has(id==='BMJ-MCH-0040'?'sansin-supply-duct-trunk-reference':'ahu-supply-duct-trunk-reference'),id);
  const taxonomy=universalTaxonomy(id);assert.ok(taxonomy.some(n=>/Duct|Air Distribution/i.test(n.name)&&n.level===2),id+' duct taxonomy missing');
  const sim=createMachineSimulation(id,template.root,template),started=sim.start();
  assert.ok(started.airflowParticleCount>=28,id);
  assert.equal(started.supplyAirflowParticleCount,18,id);
  assert.equal(started.returnAirflowParticleCount,10,id);
  if(id==='BMJ-MCH-0040'){
   assert.equal(started.outdoorAirflowParticleCount,8,id);
   const indoor=template.findNode('universal-module-4'),outdoor=template.findNode('universal-module-5');
   assert.ok(outdoor.position.z-indoor.position.z>1.5,'SANSIN indoor/outdoor envelopes are not visibly separated');
   const oldBase=template.findNode('universal-base');assert.ok(oldBase.children.filter(c=>c.isMesh).every(m=>m.visible===false),'legacy continuous SANSIN base should be hidden');
  }else assert.equal(started.outdoorAirflowParticleCount,0,id);
  sim.update(0);sim.update(120);const state=sim.state();
  assert.equal(state.supplyAirActive,true,id);assert.equal(state.returnAirReferenceActive,true,id);
  assert.equal(state.plantDuctRouteVerified,false,id);
  sim.dispose();template.dispose();
 }
});

test('V132 keeps generic AHU evidence vendor-neutral and SANSIN evidence brand-specific',()=>{
 for(const id of ['BMJ-MCH-0036','BMJ-MCH-0037','BMJ-MCH-0038','BMJ-MCH-0039','BMJ-MCH-0041']){
  const urls=universalTechnicalSources(id).map(s=>s.url).join(' ');
  assert.doesNotMatch(urls,/sansin|nesacsentral|made-in-china/i,id);
 }
 const urls=universalTechnicalSources('BMJ-MCH-0040').map(s=>s.url).join(' ');
 assert.match(urls,/nesacsentral/i);
});

test('V132 generic AHUs never invent an outdoor condenser while SANSIN keeps the family outdoor heat-rejection package',()=>{
 for(const id of ['BMJ-MCH-0036','BMJ-MCH-0037','BMJ-MCH-0038','BMJ-MCH-0039','BMJ-MCH-0041']){
  const template=createMachineTemplate(id),roles=new Set();template.root.traverse(o=>{if(o.userData?.mechanismRole)roles.add(o.userData.mechanismRole);});
  assert.equal(template.root.userData.outdoorCondensingUnitAssumed,false,id);
  assert.ok(roles.has('ahu-weather-hood-boundary'),id);
  assert.ok(!roles.has('sansin-refrigeration-compressor-reference'),id);
  template.dispose();
 }
 const sansin=createMachineTemplate('BMJ-MCH-0040'),roles=new Set();sansin.root.traverse(o=>{if(o.userData?.mechanismRole)roles.add(o.userData.mechanismRole);});
 assert.ok(roles.has('sansin-refrigeration-compressor-reference'));
 assert.ok(roles.has('sansin-outdoor-condenser-fan-reference'));
 assert.ok(roles.has('sansin-refrigerant-interconnect-reference'));
 assert.ok(roles.has('sansin-outdoor-fan-guard-reference'));
 sansin.dispose();
});
