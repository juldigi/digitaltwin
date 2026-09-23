import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const shell=readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('leaving simulation through major navigation stops the process and clears transport state',()=>{
 assert.match(shell,/function stopSimulationForNavigation\(targetSection\)/);
 assert.match(shell,/dispatchEvent\(new CustomEvent\('bmj:simulationstoprequest'\)\)/);
 assert.match(shell,/setSimulation\(\{active:false,playing:false,stage:null,progress:0\}\)/);
 assert.match(shell,/document\.body\.classList\.remove\('simulation-transport-open'\)/);
});

test('desktop navigation uses simulation cleanup before changing major context',()=>{
 assert.match(shell,/#nav-machine'[\s\S]*navigateSection\('factory'\)/);
 assert.match(shell,/#nav-assets'[\s\S]*stopSimulationForNavigation\('asset'\)/);
 assert.match(shell,/#nav-systems'[\s\S]*stopSimulationForNavigation\('system'\)/);
 assert.match(shell,/#nav-sources'[\s\S]*navigateSection\('reference',\{inspectorTab:'sources'\}\)/);
 assert.match(shell,/#nav-settings'[\s\S]*stopSimulationForNavigation\('settings'\)/);
});

test('V185 rotates active runtime identifiers',()=>{
 assert.match(index,/app-shell-v79\.css\?v=187/);
 assert.match(index,/src\/app\.js\?v=187/);
 assert.match(index,/src\/app-shell-v79\.js\?v=187/);
 assert.match(sw,/factory-digital-twin-v187-simulation-contract-hardening-20260923/);
 assert.match(app,/pair\('Versi aplikasi','V187'\)/);
});
