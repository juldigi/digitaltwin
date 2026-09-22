import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const state=fs.readFileSync(new URL('../frontend/src/state/app-state.js',import.meta.url),'utf8');

test('V151 browser history restores machine component and workspace view without reload',()=>{
  assert.match(app,/async function restoreHistoryContext\(\)/);
  assert.match(app,/params\.get\('machine'\)\|\|params\.get\('asset'\)\|\|FOUNDATION_SCOPE\.primaryRoute/);
  assert.match(app,/params\.get\('node'\)/);
  assert.match(app,/params\.get\('view'\)==='2d'\?'2d':'3d'/);
  assert.match(app,/await switchActiveMachine\(FOUNDATION_SCOPE\.primaryRoute,\{historyMode:'none'\}\)/);\n  assert.match(app,/focusFoundationPlaceholder\(record,\{historyMode:'none',openDialog:false\}\)/);
  assert.match(app,/selectTaxonomy\(node,\{revealPanel:true\}\)/);
  assert.match(app,/bmj:historyrestore/);
  assert.doesNotMatch(app,/location\.(?:reload|assign|replace)\(/);
});

test('V151 shell applies restored 2D or 3D mode through canonical controls',()=>{
  assert.match(shell,/addEventListener\('bmj:historyrestore'/);
  assert.match(shell,/viewMode=detail\.viewMode==='2d'\?'2d':'3d'/);
  assert.match(shell,/setState\(\{selectedAsset:detail\.selectedAsset\|\|null,selectedNode:detail\.selectedNode\|\|null,viewMode\},\{url:false\}\)/);
  assert.match(shell,/viewMode==='2d'\)q\('#mode-2d'\)\?\.click\(\);else q\('#mode-3d'\)\?\.click\(\)/);
});

test('V151 deep-link state contract remains asset node view and browser-safe',()=>{
  assert.match(state,/const map=\{asset:state\.selectedAsset,node:state\.selectedNode,view:state\.viewMode\}/);
  assert.match(state,/history\.replaceState/);
  assert.match(app,/history\.pushState/);
  assert.equal((app.match(/addEventListener\('popstate'/g)||[]).length,1);
});
