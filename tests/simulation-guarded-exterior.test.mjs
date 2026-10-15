import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {shouldAutoOpenInteriorForSimulation} from '../frontend/src/simulation-visibility-policy.js';

test('OFFSET 5 and POLAR 115 begin simulations with guarded exterior intact',()=>{
 for(const key of ['offset5','BMJ-MCH-0001']){
  assert.equal(shouldAutoOpenInteriorForSimulation(key,false),false,key);
  assert.equal(shouldAutoOpenInteriorForSimulation(key,true),false,key);
 }
});

test('sheeting and APM inspection mode does not forcibly reopen existing interior',()=>{
 for(const key of ['sheeting','apm2','offset10']){
  assert.equal(shouldAutoOpenInteriorForSimulation(key,false),true,key);
  assert.equal(shouldAutoOpenInteriorForSimulation(key,true),false,key);
 }
});

test('UI start flow applies guarded policy and Sheeting explains the actual cut indicator',()=>{
 const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
 assert.match(app,/simulationOwnsExterior=shouldAutoOpenInteriorForSimulation\(MACHINE_KEY,isInteriorOpen\(\)\)/);
 assert.match(app,/if\(simulationOwnsExterior\)enableExteriorOpen\(\{forceDetail:false\}\)/);
 assert.match(app,/indikator pada mulut potong menandai pemisahan lembar/);
 assert.match(app,/Gerak pisau internal tidak dianimasikan/);
 assert.doesNotMatch(app,/blade \(pisau\) turun hingga cutting edge/);
});
