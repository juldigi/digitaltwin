import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const engine=readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('machine switch stops any active simulation before replacing the runtime',()=>{
 assert.match(engine,/if\(this\.simulation\?\.active\)this\.simulation\.stop\(\)/);
 assert.match(app,/if\(engine\?\.isPrintingSimulationActive\?\.\(\)\|\|currentSimulationState\(\)\.active\)stopPrintingSimulation\(\{restoreExterior:true\}\)/);
});
test('failed switch rolls the engine and domain context back to the previous machine',()=>{
 assert.match(app,/previousAsset=getAppState\(\)\.selectedAsset/);
 assert.match(app,/if\(engine\?\.machineKey!==previousRoute\)\{try\{await engine\.switchMachine\(previousRoute\);\}catch\{\}\}/);
 assert.match(app,/selectedAsset:previousAsset\|\|null/);
 assert.match(app,/simulationState:\{active:false,running:false,stage:null,progress:0\}/);
});
test('V188 runtime identifiers are coherent',()=>{
 assert.match(index,/app-shell-v79\.css\?v=217/);
 assert.match(index,/src\/app\.js\?v=217/);
 assert.match(index,/src\/app-shell-v79\.js\?v=217/);
 assert.match(sw,/factory-digital-twin-v217-render-foundation-20260925/);
 assert.match(app,/pair\('Versi aplikasi',APP_BUILD\)/);
});
