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

test('simplified navigation stops simulation before changing major context',()=>{
 assert.match(app,/const stopSimulationBeforeNavigation=.*bmj:simulationstoprequest/);
 assert.match(app,/on\('#nav-machine',[\s\S]*stopSimulationBeforeNavigation\(\)/);
 assert.match(app,/on\('#nav-assets',[\s\S]*stopSimulationBeforeNavigation\(\)/);
 assert.match(app,/on\('#nav-help',[\s\S]*stopSimulationBeforeNavigation\(\)/);
 assert.match(app,/on\('#settings',[\s\S]*stopSimulationBeforeNavigation\(\)/);
 assert.match(shell,/#nav-systems'[\s\S]*stopSimulationForNavigation\('system'\)/);
 assert.match(shell,/if\(section!=='simulation'\)stopSimulationForNavigation\(section\)/);
});

test('V185 rotates active runtime identifiers',()=>{
 assert.match(index,/app-shell-v79\.css\?v=212/);
 assert.match(index,/src\/app\.js\?v=212/);
 assert.match(index,/src\/app-shell-v79\.js\?v=212/);
 assert.match(sw,/factory-digital-twin-v212-ui-ssot-stage6-20260925/);
 assert.match(app,/pair\('Versi aplikasi','2026\.09\.25'\)/);
});
