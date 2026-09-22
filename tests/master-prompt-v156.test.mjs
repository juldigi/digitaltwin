import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const engine=fs.readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V156 factory selection uses a non-destructive UI overlay instead of mutating asset geometry',()=>{
  assert.match(engine,/factorySelectionId=null/);
  assert.match(engine,/new THREE\.BoxHelper\(object,0x1677d2\)/);
  assert.match(engine,/semantic:'SELECTION_OVERLAY'/);
  assert.match(engine,/sourceType:'UI_STATE_NOT_FACTORY_GEOMETRY'/);
  assert.match(engine,/clearFactorySelection\(\)/);
  assert.match(engine,/selectFactoryAsset\(id,\{focus=false,mode='iso'\}=\{\}\)/);
});

test('selected factory asset is the canonical focus target for fit top and isometric camera actions',()=>{
  assert.match(engine,/currentFactoryTarget\(\)/);
  assert.match(engine,/focusFactorySelection\(mode='iso'\)/);
  assert.match(app,/target=isFactory\?engine\.currentFactoryTarget\(\):\(selectedPart\|\|engine\.machine\)/);
  assert.match(app,/if\(mode==='fit'\)\{engine\.fit\(target,'iso'\)/);
  assert.match(app,/const preset=mode==='top'\?'top':'iso'/);
});

test('factory click and asset browser share one persistent selection context',()=>{
  assert.match(app,/function selectFactoryAssetContext\(machine/);
  assert.match(app,/engine\?\.focusFactoryAsset\(machine\.machineId\)/);
  assert.match(app,/engine\.onFactorySelect=id=>/);
  assert.match(app,/selectFactoryAssetContext\(m,\{historyMode:'none',openDialog:false,focus:true\}\)/);
  assert.match(app,/factory-asset-focus/);
  assert.match(app,/selectFactoryAssetContext\(m,\{historyMode:'none',openDialog:false,focus:true\}\)/);
});

test('asset context reports technical 3D truth instead of presenting placeholders as implemented models',()=>{
  assert.match(app,/source3D=primary\?truth\.source3D:'NOT_IMPLEMENTED · LAYOUT PLACEHOLDER'/);
  assert.match(app,/detail3D=primary\?truth\.detail3D:'NOT_IMPLEMENTED'/);
  assert.match(app,/pair\('3D source',source3D\)/);
  assert.match(app,/pair\('3D detail',detail3D\)/);
  assert.match(app,/pair\('Data confidence',dataConfidence\)/);
  assert.match(app,/pair\('Posisi',positionTruth\)/);
});

test('returning to factory overview clears selection and restores the full factory target',()=>{
  assert.match(app,/function showHome\(\)[\s\S]*engine\?\.clearFactorySelection\(\)[\s\S]*engine\?\.fit\(engine\.factory,'iso'\)/);
  assert.match(app,/factory-overview[\s\S]*engine\.clearFactorySelection\(\)[\s\S]*engine\.fit\(engine\.factory,'iso'\)/);
  assert.match(app,/selectedAsset:null/);
});

test('V156 release cache and diagnostics are synchronized',()=>{
  assert.match(html,/app-shell-v79\.css\?v=156/);
  assert.match(html,/src\/app\.js\?v=156/);
  assert.match(html,/src\/app-shell-v79\.js\?v=156/);
  assert.match(app,/pair\('Versi aplikasi','V156'\)/);
  assert.match(shell,/v156-master-prompt/);
  assert.match(sw,/factory-digital-twin-v156-phase3-interaction-20260922/);
});
