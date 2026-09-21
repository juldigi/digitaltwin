import test from 'node:test';import assert from 'node:assert/strict';
import {normalizeMachineKey,isDedicatedMachineKey,createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {UniversalMachineTemplate,UniversalProcessSimulation} from '../frontend/src/universal-machine.js';

test('legacy BMJ IDs normalize to the same dedicated routes used by machine cards',()=>{
 assert.equal(normalizeMachineKey('BMJ-MCH-0002'),'sheeting');
 assert.equal(normalizeMachineKey('BMJ-MCH-0003'),'offset5');
 assert.equal(normalizeMachineKey('BMJ-MCH-0009'),'offset10');
 assert.equal(normalizeMachineKey('BMJ-MCH-0010'),'apm2');
 for(const id of ['BMJ-MCH-0002','BMJ-MCH-0003','BMJ-MCH-0009','BMJ-MCH-0010'])assert.equal(isDedicatedMachineKey(id),true,id);
});

test('new evidence-backed registry assets never fall through to UniversalMachineTemplate',()=>{
 for(const key of ['BMJ-MCH-0006','BMJ-MCH-0007','BMJ-MCH-0008','BMJ-MCH-0011','BMJ-MCH-0012','BMJ-MCH-0013','BMJ-MCH-0014','BMJ-MCH-0015','BMJ-MCH-0016','BMJ-MCH-0018','BMJ-MCH-0019','BMJ-MCH-0020','BMJ-MCH-0022','BMJ-MCH-0024']){
  const template=createMachineTemplate(key);
  assert.equal(template instanceof UniversalMachineTemplate,false,key+' fell through to universal geometry');
  const sim=createMachineSimulation(key,template.root,template);
  assert.equal(sim instanceof UniversalProcessSimulation,false,key+' fell through to blocked universal simulation');
  sim.dispose();template.dispose();
 }
});

test('evidence-insufficient assets still use blocked universal runtime',()=>{
 for(const key of ['BMJ-MCH-0004','BMJ-MCH-0017','BMJ-MCH-0021','BMJ-MCH-0023','BMJ-MCH-0025','BMJ-MCH-0028','BMJ-MCH-0031','BMJ-MCH-0040']){
  const template=createMachineTemplate(key),sim=createMachineSimulation(key,template.root,template);
  assert.ok(template instanceof UniversalMachineTemplate,key);
  assert.ok(sim instanceof UniversalProcessSimulation,key);
  assert.equal(sim.state().blocked,true,key);
  sim.dispose();template.dispose();
 }
});
