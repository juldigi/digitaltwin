import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const engine=fs.readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');
const scope=fs.readFileSync(new URL('../frontend/src/data/foundation-scope.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V157 production app controller has no static imports for technical expansion machines',()=>{
 for(const specifier of [
  './data/taxonomy-offset10.js','./data/sources-offset10.js','./simulation-offset10.js',
  './data/taxonomy-apm2.js','./data/sources-apm2.js','./simulation-apm2.js',
  './data/taxonomy-sheeting.js','./data/sources-sheeting.js','./simulation-sheeting.js',
  './universal-machine.js','./machine-runtime.js'
 ])assert.ok(!app.includes("from '"+specifier+"'"),specifier+' must not be statically imported by Phase-1 app');
 assert.match(app,/ACTIVE_TAXONOMY=OFFSET5_TAXONOMY/);
 assert.match(app,/TAXONOMY_BY_ID=OFFSET5_BY_ID/);
 assert.match(app,/TECHNICAL_SOURCES=OFFSET5_SOURCES/);
 assert.match(app,/PRINTING_SIMULATION_STAGES=OFFSET5_SIM_STAGES/);
});

test('V157 3D engine instantiates OFFSET 5 directly without machine-runtime or expansion exports',()=>{
 assert.match(engine,/import \{OffsetMachineTemplate\} from '\.\/offset5\.js'/);
 assert.match(engine,/import \{PrintingSimulation\} from '\.\/simulation\.js'/);
 assert.doesNotMatch(engine,/from '\.\/machine-runtime\.js'/);
 assert.doesNotMatch(engine,/from '\.\/offset10\.js'/);
 assert.doesNotMatch(engine,/from '\.\/apm2\.js'/);
 assert.doesNotMatch(engine,/from '\.\/sheeting\.js'/);
 assert.match(engine,/this\.template=new OffsetMachineTemplate\(\)/);
 assert.match(engine,/this\.simulation=new PrintingSimulation\(this\.machine,this\.template\)/);
});

test('placeholder route compatibility remains lightweight and cannot unlock technical runtime',()=>{
 assert.match(app,/'BMJ-MCH-0002':'sheeting'/);
 assert.match(app,/'BMJ-MCH-0003':'offset5'/);
 assert.match(app,/'BMJ-MCH-0009':'offset10'/);
 assert.match(app,/'BMJ-MCH-0010':'apm2'/);
 assert.match(app,/MACHINE_KEY=FOUNDATION_SCOPE\.primaryRoute/);
 assert.match(app,/if\(!canOpenTechnical3D\(route\)\)/);
 assert.match(engine,/if\(!canOpenTechnical3D\(requested\)\)/);
});

test('V162 release identifiers keep technical 3D foundation-only while restoring factory context',()=>{
 assert.match(scope,/release:'V162'/);
 assert.match(html,/app-shell-v79\.css\?v=162/);
 assert.match(html,/src\/app\.js\?v=165/);
 assert.match(html,/src\/app-shell-v79\.js\?v=164/);
 assert.match(shell,/v162-factory-first-systems/);
 assert.match(sw,/factory-digital-twin-v165-webgl-fallback-20260923/);
});

test('offline shell also stays free from expansion runtime modules',()=>{
 for(const excluded of ['machine-runtime.js','universal-machine.js','offset10.js','apm2.js','sheeting.js','offset8.js','offset9.js','mk920.js'])assert.doesNotMatch(sw,new RegExp(excluded.replaceAll('.','\\.')));
 for(const required of ['offset5.js','simulation.js','foundation-scope.js','factory-building.js','dwg-fidelity.js'])assert.match(sw,new RegExp(required.replaceAll('.','\\.')));
});
