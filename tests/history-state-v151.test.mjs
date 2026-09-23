import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const state=fs.readFileSync(new URL('../frontend/src/state/app-state.js',import.meta.url),'utf8');

test('V171 browser history restores home factory asset and machine component without reload',()=>{
  assert.match(app,/async function restoreHistoryContext\(\)/);
  assert.match(app,/legacyMachine=params\.get\('machine'\),route=legacyMachine\|\|params\.get\('asset'\)\|\|null/);
  assert.match(app,/sceneMode=params\.get\('scene'\)==='machine'\|\|Boolean\(node\)\|\|Boolean\(legacyMachine\)\?'machine':'factory'/);
  assert.match(app,/if\(!route\)\{[\s\S]*showHome\(\{historyMode:'none'\}\)/);
  assert.match(app,/selectFactoryAssetContext\(record,\{historyMode:'none',openDialog:false,focus:true\}\);machineDetailDialog\(record\)/);
  assert.match(app,/await switchActiveMachine\(machineRoute\(record\),\{historyMode:'none'\}\)/);
  assert.match(app,/const restoredNode=node&&TAXONOMY_BY_ID\.has\(node\)\?node:null/);
  assert.match(app,/bmj:historyrestore/);
  const restoreBody=app.slice(app.indexOf('async function restoreHistoryContext'),app.indexOf("addEventListener('popstate'"));
  assert.doesNotMatch(restoreBody,/location\.(?:reload|assign|replace)\(/);
});

test('V171 shell applies restored scene view and camera through canonical controls',()=>{
  assert.match(shell,/addEventListener\('bmj:historyrestore'/);
  assert.match(shell,/viewMode=detail\.viewMode==='2d'\?'2d':'3d'/);
  assert.match(shell,/sceneMode=detail\.sceneMode==='machine'\?'machine':'factory'/);
  assert.match(shell,/cameraPreset=detail\.cameraPreset==='top'\?'top':'iso'/);
  assert.match(shell,/activeSection=viewMode==='3d'&&sceneMode==='machine'\?'asset':'factory'/);
  assert.match(shell,/setState\(\{selectedAsset:detail\.selectedAsset\|\|null,selectedNode:detail\.selectedNode\|\|null,sceneMode,viewMode,cameraPreset,activeSection\},\{url:false\}\)/);
  assert.match(shell,/viewMode==='2d'\)q\('#mode-2d'\)\?\.click\(\);else q\('#mode-3d'\)\?\.click\(\)/);
});

test('V171 deep-link state contract owns scene and camera while remaining browser-safe',()=>{
  assert.match(state,/sceneMode:'factory'/);
  assert.match(state,/selectedAsset=params\.get\('asset'\)\|\|params\.get\('machine'\)\|\|null/);
  assert.match(state,/sceneMode:sceneParam==='machine'\|\|Boolean\(selectedNode\)\?'machine':'factory'/);
  assert.match(state,/cameraPreset:params\.get\('camera'\)==='top'\?'top':'iso'/);
  assert.match(state,/params\.delete\('machine'\)/);
  assert.match(state,/if\(state\.sceneMode==='machine'\)params\.set\('scene','machine'\)/);
  assert.match(state,/if\(state\.cameraPreset&&state\.cameraPreset!=='iso'\)params\.set\('camera',state\.cameraPreset\)/);
  assert.match(state,/history\.replaceState/);
  assert.match(app,/history\.pushState/);
  assert.equal((app.match(/addEventListener\('popstate'/g)||[]).length,1);
});
