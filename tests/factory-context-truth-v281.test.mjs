import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {searchCorpusForMachine} from '../frontend/src/data/search-corpus.js';
import {universalMachineConfig} from '../frontend/src/universal-machine.js';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const routeFor=machine=>({
 'BMJ-MCH-0002':'sheeting',
 'BMJ-MCH-0003':'offset5',
 'BMJ-MCH-0009':'offset10',
 'BMJ-MCH-0010':'apm2'
}[machine.machineId]||machine.machineId);

test('V281 factory dialog no longer limits full truth context to the Offset 5 foundation reference',()=>{
 assert.match(app,/function factoryMachineTruth\(machine,placement\)/);
 assert.match(app,/const truth=primary\?factoryMachineTruth\(machine,placement\):null/);
 assert.doesNotMatch(app,/const truth=primary&&isFoundationPrimary\(machine\)/);
});

test('V281 factory truth has technical-source context for every registered 3D asset',()=>{
 for(const machine of MACHINE_REGISTRY.filter(machine=>machine.has3D)){
  const corpus=searchCorpusForMachine(machine,routeFor(machine));
  assert.ok(corpus.sources.length>0,machine.machineId+' has no factory-dialog source context');
  const route=routeFor(machine);
  if(!['offset5','offset10','apm2','sheeting'].includes(route)){
   const cfg=universalMachineConfig(machine.machineId);
   assert.ok(cfg,machine.machineId+' has no evidence config');
   assert.ok(['VERIFIED_PROCESS_MODEL','FAMILY_PROCESS_MODEL','BLOCKED'].includes(cfg.evidence.simulation));
  }
 }
});

test('V281 factory dialog presents truth and position through readable Indonesian labels',()=>{
 assert.match(app,/pair\('Posisi',readableStatus\(positionVerification\(placement\)\)\)/);
 assert.match(app,/pair\('Dasar model 3D',readableStatus\(truth\?\.source3D\|\|'UNKNOWN'\)\)/);
 assert.match(app,/pair\('Detail model 3D',readableStatus\(truth\?\.detail3D\|\|'UNKNOWN'\)\)/);
 assert.match(app,/pair\('Keandalan data',readableStatus\(truth\?\.dataConfidence\|\|'UNVERIFIED'\)\)/);
 assert.match(app,/pair\('Referensi teknis',truth\?\.sourceCount\?truth\.sourceCount\+' sumber':'Belum tersedia'\)/);
});

test('V281 family-reference and blocked assets stay distinct in factory truth construction',()=>{
 assert.match(app,/const dedicated=cfg\.evidence\.simulation==='VERIFIED_PROCESS_MODEL',runnable=\['VERIFIED_PROCESS_MODEL','FAMILY_PROCESS_MODEL'\]\.includes\(cfg\.evidence\.simulation\)/);
 assert.match(app,/runnable\?'REFERENCE PROCEDURAL \/ '\+cfg\.evidence\.geometry:'PROCEDURAL \/ '\+cfg\.evidence\.geometry/);
 assert.match(app,/runnable\?'FAMILY_REFERENCE_AVAILABLE':'EVIDENCE_BOUNDED_REFERENCE'/);
});
