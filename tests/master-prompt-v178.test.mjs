import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const app=read('../frontend/src/app.js');
const shell=read('../frontend/src/app-shell-v79.js');
const sw=read('../frontend/sw.js');

test('V178 app exposes an internal stop request that reaches the actual engine simulation',()=>{
  assert.match(app,/window\.addEventListener\('bmj:simulationstoprequest'/);
  assert.match(app,/engine\?\.isPrintingSimulationActive\?\.\(\)\|\|currentSimulationState\(\)\.active/);
  assert.match(app,/stopPrintingSimulation\(\{restoreExterior:true\}\)/);
});

test('V178 entering 2D stops active or paused simulation before changing workspace mode',()=>{
  const start=shell.indexOf("q('#mode-2d')?.addEventListener");
  const end=shell.indexOf("q('#mode-3d')?.addEventListener",start);
  const body=shell.slice(start,end);
  assert.match(body,/simulationTab=current\.inspectorState\?\.tab==='simulation'/);
  assert.match(body,/current\.simulationState\?\.active\|\|simulationTab/);
  assert.match(body,/dispatchEvent\(new CustomEvent\('bmj:simulationstoprequest'\)\)/);
  assert.ok(body.indexOf("bmj:simulationstoprequest")<body.indexOf("setViewMode('2d')"));
});

test('V178 a visible Simulation tab returns to Overview when entering 2D',()=>{
  const start=shell.indexOf("q('#mode-2d')?.addEventListener");
  const end=shell.indexOf("q('#mode-3d')?.addEventListener",start);
  const body=shell.slice(start,end);
  assert.match(body,/current\.inspectorState\?\.open&&simulationTab/);
  assert.match(body,/q\('\[data-tab="overview"\]'\)\?\.click\(\)/);
  assert.ok(body.indexOf("[data-tab=\"overview\"]")<body.indexOf("setViewMode('2d')"));
});

test('V178 app shell and service worker are cache-busted',()=>{
  assert.match(html,/src\/app\.js\?v=214/);
  assert.match(html,/src\/app-shell-v79\.js\?v=214/);
  assert.match(sw,/factory-digital-twin-v214-runtime-stability-20260925/);
});
