import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const state=fs.readFileSync(new URL('../frontend/src/state/app-state.js',import.meta.url),'utf8');

test('Stage 6 browser history restores home factory asset and machine component without reload',()=>{
  assert.match(app,/async function restoreHistoryContext\(\)/);
  assert.match(app,/const restored=readUrlState\(\),route=restored\.selectedAsset,node=restored\.selectedNode/);
  assert.match(app,/sceneMode=restored\.sceneMode/);
  assert.match(app,/if\(!route\)\{[\s\S]*showHome\(\{historyMode:'none'\}\)/);
  assert.match(app,/selectFactoryAssetContext\(record,\{historyMode:'none',openDialog:false,focus:true\}\);machineDetailDialog\(record\)/);
  assert.match(app,/await switchActiveMachine\(machineRoute\(record\),\{historyMode:'none'\}\)/);
  assert.match(app,/const restoredNode=node&&TAXONOMY_BY_ID\.has\(node\)\?node:null/);
  assert.doesNotMatch(app,/bmj:historyrestore/);
  const restoreBody=app.slice(app.indexOf('async function restoreHistoryContext'),app.indexOf("addEventListener('popstate'"));
  assert.doesNotMatch(restoreBody,/location\.(?:reload|assign|replace)\(/);
});

test('Stage 6 shell consumes canonical state instead of a history relay event',()=>{
  assert.doesNotMatch(shell,/addEventListener\('bmj:historyrestore'/);
  assert.match(shell,/subscribe\(state=>\{[\s\S]*applyViewModeDom\(state\)[\s\S]*syncSimulationTransport\(state\)/);
  assert.match(shell,/markSection\(state\.activeSection\)/);
});

test('Stage 6 deep-link contract has one parser and one serializer',()=>{
  assert.match(state,/export function readUrlState/);
  assert.match(state,/legacyMachine=params\.get\('machine'\)/);
  assert.match(state,/const selectedAsset=params\.get\('asset'\)\|\|legacyMachine\|\|null/);
  assert.match(state,/sceneMode:params\.get\('scene'\)==='machine'\|\|Boolean\(selectedNode\)\|\|Boolean\(legacyMachine\)\?'machine':'factory'/);
  assert.match(state,/export function buildContextUrl/);
  assert.match(state,/params\.delete\('machine'\)/);
  assert.match(state,/if\(sceneMode==='machine'\)params\.set\('scene','machine'\)/);
  assert.match(state,/if\(cameraPreset==='top'\)params\.set\('camera','top'\)/);
  assert.match(state,/history\.replaceState/);
  assert.match(app,/buildContextUrl\(snapshot\)/);
  assert.match(app,/history\.pushState/);
  assert.equal((app.match(/addEventListener\('popstate'/g)||[]).length,1);
});
