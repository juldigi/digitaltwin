import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const runtime=readFileSync(resolve('frontend/src/machine-runtime.js'),'utf8');
const bake=readFileSync(resolve('scripts/bake-factory-fleet.mjs'),'utf8');
const build=readFileSync(resolve('scripts/build.mjs'),'utf8');
const o5=readFileSync(resolve('frontend/src/offset5-realism.js'),'utf8');
const o8=readFileSync(resolve('frontend/src/offset8.js'),'utf8');
const o8r=readFileSync(resolve('frontend/src/offset8-realism.js'),'utf8');
const o10=readFileSync(resolve('frontend/src/offset10.js'),'utf8');
const o10r=readFileSync(resolve('frontend/src/offset10-realism.js'),'utf8');
const sw=readFileSync(resolve('frontend/sw.js'),'utf8');

test('V228 priority offset detail scenes use the promoted realism templates',()=>{
 assert.match(runtime,/Offset5CD102RealismTemplate/);
 assert.match(runtime,/Offset8CX104RealismTemplate/);
 assert.match(runtime,/Offset10CX104SpecialRealismTemplate/);
 assert.match(runtime,/if\(k==='offset5'\)return new Offset5CD102RealismTemplate\(\)/);
 assert.match(runtime,/if\(k==='BMJ-MCH-0005'\)return new Offset8CX104RealismTemplate\(\)/);
 assert.match(runtime,/if\(k==='offset10'\)return new Offset10CX104SpecialRealismTemplate\(\)/);
 assert.match(runtime,/Offset5CD102RealismSimulation/);
 assert.match(runtime,/Offset8CX104RealismSimulation/);
 assert.match(runtime,/Offset10CX104SpecialRealismSimulation/);
});

test('V228 factory home geometry is rebaked from the same live machine runtime before distribution',()=>{
 assert.match(bake,/createMachineTemplate/);
 assert.match(bake,/const t=createMachineTemplate\(place\.machineId\)/);
 assert.match(bake,/t\.setLow\?\.\(true\)/);
 const rebake=build.indexOf("scripts/bake-factory-fleet.mjs");
 const copy=build.indexOf("cpSync('frontend','dist'");
 assert.ok(rebake>=0&&copy>rebake,'factory fleet must be regenerated before frontend is copied to dist');
});

test('V228 Offset 8 feeder and delivery no longer use solid cuboid envelopes',()=>{
 assert.doesNotMatch(o8,/this\.cover\(this\.box\(g,\[2\.3,1\.8,2\.9\],\[0,1\.48,0\]/);
 assert.match(o8,/Preset Plus feeder is an open process frame with side cladding/);
 assert.match(o8,/for\(const z of \[-1\.37,1\.37\]\)this\.cover\(this\.box\(g,\[2\.30,1\.78,\.16\]/);
 assert.doesNotMatch(o8,/this\.cover\(this\.box\(g,\[3\.7,2\.12,2\.95\],\[0,1\.60,0\]/);
 assert.match(o8,/Delivery envelope follows the portal\/canopy architecture/);
 assert.match(o8,/for\(const z of \[-1\.39,1\.39\]\)this\.cover\(this\.box\(g,\[3\.70,2\.10,\.17\]/);
});

test('V228 CX104 printing units retain a dark structural plinth and operator-side modular trim',()=>{
 assert.match(o8,/Dark lower plinth and operator-side vertical trim establish the real CX104 modular rhythm/);
 assert.match(o8,/this\.cover\(this\.box\(g,\[\.98,\.44,2\.58\],\[0,\.66,0\],'graphite'/);
 assert.match(o8,/this\.cover\(this\.box\(g,\[\.075,1\.52,\.028\],\[-\.31,1\.78,-1\.462\],'black'/);
});

test('V228 Offset 10 Preset Plus feeder preserves an open pile and suction process envelope',()=>{
 assert.doesNotMatch(o10,/this\.cover\(this\.box\(frame,\[2\.60,1\.72,3\.02\],\[-\.25,1\.48,0\]/);
 assert.match(o10,/Keep the pile and suction process visually open/);
 assert.match(o10,/for\(const z of \[-1\.42,1\.42\]\)this\.cover\(this\.box\(frame,\[2\.60,1\.72,\.17\]/);
});

test('V228 realism packs preserve evidence boundaries instead of inventing installed hardware',()=>{
 assert.match(o5,/NO_DUPLICATE_PROCESS_HARDWARE/);
 assert.match(o5,/focusightLocationPolicy:'DOWNSTREAM_AFTER_COATING_DRYING'/);
 assert.match(o8r,/Y_ENERGY_TECH_UNASSERTED/);
 assert.match(o8r,/dryerEnergyTechnology='UNASSERTED'/);
 assert.match(o10r,/PROJECT_DOCUMENT_FIRST__EXISTING_NODE_ENRICHMENT_ONLY/);
 assert.match(o10r,/duplicateProcessHardwareAdded:false/);
});

test('V228 keeps detailed realism lazy-loaded while refreshing the shell cache',()=>{
 assert.match(sw,/shell recache without rotating public query identifiers/);
 for(const path of ['machine-runtime.js','offset5-realism.js','offset8-realism.js','offset10-realism.js'])assert.doesNotMatch(sw,new RegExp("'\\./src/"+path.replaceAll('.','\\.')+"'"));
 assert.match(sw,/factory-digital-twin-v222-overlay-state-ssot-20260925/);
 assert.match(sw,/const RELEASE='222'/);
});

test('V228 rebaked fleet keeps headroom inside the existing nine chunk contract',()=>{
 assert.match(bake,/chunkSize=210000/);
});
