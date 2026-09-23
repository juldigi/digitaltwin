import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const core=readFileSync(new URL('../frontend/src/simulation.js',import.meta.url),'utf8');
const offset10=readFileSync(new URL('../frontend/src/simulation-offset10.js',import.meta.url),'utf8');
const sheeting=readFileSync(new URL('../frontend/src/simulation-sheeting.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('core simulations expose an explicit availability contract',()=>{
 for(const source of [core,offset10,sheeting]){
  assert.match(source,/available:true,blocked:false/);
 }
});

test('simulation start refuses blocked or unavailable process models before opening the machine',()=>{
 assert.match(app,/readiness\?\.blocked\|\|readiness\?\.available===false/);
 assert.match(app,/blockedReason\|\|'Simulasi proses untuk aset ini belum tersedia\.'/);
});

test('pause control cannot accidentally start a READY simulation',()=>{
 assert.match(app,/pause\.disabled=!active/);
 assert.match(app,/function pausePrintingSimulation\(\)\{\s*if\(!engine\?\.isPrintingSimulationActive\(\)\)return;/);
});

test('V187 active runtime cache identifiers are coherent',()=>{
 assert.match(index,/app-shell-v79\.css\?v=191/);
 assert.match(index,/src\/app\.js\?v=191/);
 assert.match(index,/src\/app-shell-v79\.js\?v=191/);
 assert.match(sw,/factory-digital-twin-v191-mobile-viewport-composition-20260923/);
 assert.match(app,/pair\('Versi aplikasi','V191'\)/);
});
