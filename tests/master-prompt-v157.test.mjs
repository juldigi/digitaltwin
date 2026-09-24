import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const engine=fs.readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');
const scope=fs.readFileSync(new URL('../frontend/src/data/foundation-scope.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('asset controller selects the requested machine taxonomy and sources',()=>{
 assert.match(app,/ACTIVE_TAXONOMY=IS_OFFSET10\?OFFSET10_TAXONOMY/);
 assert.match(app,/IS_APM2\?APM2_TAXONOMY/);
 assert.match(app,/IS_SHEETING\?SHEETING_TAXONOMY/);
 assert.match(app,/IS_GENERIC\?GENERIC_TAXONOMY/);
 assert.match(app,/TECHNICAL_SOURCES=IS_OFFSET10\?OFFSET10_TECHNICAL_SOURCES/);
});

test('engine loads other machine models only on selection',()=>{
 assert.match(engine,/this\.template=neutralTemplate\(\)/);\n assert.match(engine,/this\.machineKey=null/);
 assert.match(engine,/async switchMachine\(key\)/);
 assert.match(engine,/await import\('\.\/machine-runtime\.js'\)/);
 assert.doesNotMatch(engine,/from '\.\/machine-runtime\.js'/);
});

test('placeholder route compatibility remains lightweight and cannot unlock technical runtime',()=>{
 assert.match(app,/'BMJ-MCH-0002':'sheeting'/);
 assert.match(app,/'BMJ-MCH-0003':'offset5'/);
 assert.match(app,/'BMJ-MCH-0009':'offset10'/);
 assert.match(app,/'BMJ-MCH-0010':'apm2'/);
 assert.match(app,/MACHINE_KEY=null/);
 assert.match(app,/if\(!canOpenTechnical3D\(route\)\)/);
 assert.match(engine,/if\(!canOpenTechnical3D\(requested\)\)/);
});

test('V162 release identifiers keep technical 3D foundation-only while restoring factory context',()=>{
 assert.match(scope,/release:'V162'/);
 assert.match(html,/app-shell-v79\.css\?v=197/);
 assert.match(html,/src\/app\.js\?v=197/);
 assert.match(html,/src\/app-shell-v79\.js\?v=197/);
 assert.match(shell,/v197-architecture-convergence/);
 assert.match(sw,/factory-digital-twin-v209-architecture-convergence-20260925/);
});

test('offline shell also stays free from expansion runtime modules',()=>{
 for(const excluded of ['machine-runtime.js','universal-machine.js','offset10.js','apm2.js','sheeting.js','offset8.js','offset9.js','mk920.js'])assert.doesNotMatch(sw,new RegExp(excluded.replaceAll('.','\\.')));
 for(const required of ['offset5.js','simulation.js','foundation-scope.js','factory-building.js','dwg-fidelity.js'])assert.match(sw,new RegExp(required.replaceAll('.','\\.')));
});
