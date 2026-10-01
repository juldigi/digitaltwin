import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {DEDICATED_MACHINE_IDS,canonicalMachineId,isDedicatedMachineMaturity} from '../frontend/src/data/machine-maturity.js';
import {machineTruthProfile} from '../frontend/src/data/machine-truth-profile.js';
import {DEDICATED_MACHINE_KEYS,isDedicatedMachineKey} from '../frontend/src/machine-runtime.js';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const runtime=readFileSync(new URL('../frontend/src/machine-runtime.js',import.meta.url),'utf8');

test('V283 canonical maturity registry covers the exact 20 dedicated BMJ assets',()=>{
 assert.equal(DEDICATED_MACHINE_IDS.length,20);
 assert.equal(new Set(DEDICATED_MACHINE_IDS).size,20);
 const registered=new Set(MACHINE_REGISTRY.map(machine=>machine.machineId));
 assert.ok(DEDICATED_MACHINE_IDS.every(id=>registered.has(id)));
 assert.equal(MACHINE_REGISTRY.filter(machine=>isDedicatedMachineMaturity(machine)).length,20);
 assert.equal(MACHINE_REGISTRY.filter(machine=>!isDedicatedMachineMaturity(machine)).length,21);
 assert.equal(canonicalMachineId('offset5'),'BMJ-MCH-0003');
 assert.equal(canonicalMachineId('sheeting'),'BMJ-MCH-0002');
 assert.equal(canonicalMachineId('offset10'),'BMJ-MCH-0009');
 assert.equal(canonicalMachineId('apm2'),'BMJ-MCH-0010');
});

test('V283 runtime and truth layer share the same dedicated classification',()=>{
 for(const machine of MACHINE_REGISTRY){
  assert.equal(isDedicatedMachineKey(machine.machineId),isDedicatedMachineMaturity(machine.machineId),machine.machineId);
  assert.equal(machineTruthProfile(machine).dedicated,isDedicatedMachineMaturity(machine),machine.machineId);
 }
 assert.equal(DEDICATED_MACHINE_KEYS.length,20,'legacy runtime key contract stays stable');
 assert.match(runtime,/isDedicatedMachineKey=key=>isDedicatedMachineMaturity\(key\)/);
});

test('V283 keeps model maturity independent from simulation availability',()=>{
 const profiles=MACHINE_REGISTRY.map(machine=>({machine,profile:machineTruthProfile(machine)}));
 assert.equal(profiles.filter(({profile})=>profile.dedicated).length,20);
 assert.equal(profiles.filter(({profile})=>!profile.dedicated).length,21);
 assert.equal(profiles.filter(({profile})=>profile.simulationAvailable).length,40);
 assert.deepEqual(profiles.filter(({profile})=>profile.simulationStatus==='BLOCKED').map(({machine})=>machine.machineId),['BMJ-MCH-0004']);
 const family=machineTruthProfile('BMJ-MCH-0017');
 assert.equal(family.dedicated,false);
 assert.equal(family.simulationAvailable,true);
 assert.equal(family.simulationStatus,'FAMILY_PROCESS_MODEL');
 const fz=machineTruthProfile('BMJ-MCH-0007');
 assert.equal(fz.dedicated,true);
 assert.equal(fz.simulationAvailable,true);
});

test('V283 every registered asset has an explicit non-placeholder truth profile',()=>{
 for(const machine of MACHINE_REGISTRY){
  const profile=machineTruthProfile(machine);
  assert.equal(profile.machineId,machine.machineId);
  assert.notEqual(profile.source3D,'UNKNOWN',machine.machineId);
  assert.notEqual(profile.dataConfidence,'UNVERIFIED',machine.machineId);
  assert.notEqual(profile.discoveryStatus,'DOCUMENTATION_REQUIRED',machine.machineId);
  assert.ok(['VERIFIED_PROCESS_MODEL','FAMILY_PROCESS_MODEL','BLOCKED'].includes(profile.simulationStatus),machine.machineId);
 }
});

test('V283 active-machine and factory contexts consume one canonical truth profile',()=>{
 assert.match(app,/import \{machineTruthProfile\} from '\.\/data\/machine-truth-profile\.js'/);
 assert.match(app,/verifiedMaker=registryMaker==='Belum teridentifikasi'\?null:registryMaker,modelTruth=machineTruthProfile\(registry\)/);
 assert.match(app,/state\.asset=\{\.\.\.state\.asset,'3d_status':modelTruth\.source3D,data_confidence:modelTruth\.dataConfidence,discovery_status:modelTruth\.discoveryStatus\}/);
 assert.match(app,/const route=machineRoute\(machine\),corpus=searchCorpusForMachine\(machine,route\),modelTruth=machineTruthProfile\(machine\)/);
 assert.doesNotMatch(app,/const dedicated=cfg\.evidence\.simulation==='VERIFIED_PROCESS_MODEL'/);
 assert.doesNotMatch(app,/discovery_status:IS_DEDICATED_REGISTRY_MODEL\?'DEDICATED_EVIDENCE_AVAILABLE'/);
});
