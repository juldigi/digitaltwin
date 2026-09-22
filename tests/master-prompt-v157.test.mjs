import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const engine=fs.readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V157 factory asset selection is a UI overlay, not a geometry mutation',()=>{
  assert.match(engine,/factorySelectionId=null/);
  assert.match(engine,/new THREE\.BoxHelper\(object,0x1677d2\)/);
  assert.match(engine,/semantic:'SELECTION_OVERLAY'/);
  assert.match(engine,/sourceType:'UI_STATE_NOT_FACTORY_GEOMETRY'/);
  assert.match(engine,/clearFactorySelection\(\)/);
  assert.match(engine,/selectFactoryAsset\(id,\{focus=false,mode='iso'\}=\{\}\)/);
});

test('V157 selected asset becomes the canonical camera target for fit top and isometric views',()=>{
  assert.match(engine,/currentFactoryTarget\(\)/);
  assert.match(engine,/focusFactorySelection\(mode='iso'\)/);
  assert.match(app,/target=isFactory\?engine\.currentFactoryTarget\(\):\(selectedPart\|\|engine\.machine\)/);
  assert.match(app,/if\(mode==='fit'\)\{engine\.fit\(target,'iso'\)/);
  assert.match(app,/const preset=mode==='top'\?'top':'iso'/);
});

test('scene click and factory selector share one selection context',()=>{
  assert.match(app,/function selectFactoryAssetContext\(machine/);
  assert.match(app,/engine\?\.focusFactoryAsset\(machine\.machineId\)/);
  assert.match(app,/engine\.onFactorySelect=id=>/);
  assert.match(app,/selectFactoryAssetContext\(m,\{historyMode:'none',openDialog:false,focus:true\}\)/);
  assert.match(app,/factory-asset-focus/);
});

test('Phase-1 placeholders remain spatial-only while exposing honest 3D implementation status',()=>{
  const detail=app.slice(app.indexOf('function machineDetailDialog(machine){'),app.indexOf('async function switchActiveMachine',app.indexOf('function machineDetailDialog(machine){')));
  assert.match(detail,/const placeholderData=pair\('ID posisi',machine\.machineId\)\+pair\('Area',machine\.area\)/);
  assert.match(detail,/pair\('3D source','NOT_IMPLEMENTED · LAYOUT PLACEHOLDER'\)/);
  assert.match(detail,/pair\('3D detail','NOT_IMPLEMENTED'\)/);
  assert.match(detail,/pair\('Status detail','Belum dibuka pada fase fondasi'\)/);
  assert.doesNotMatch(detail,/placeholderData=.*Serial Number/);
  assert.doesNotMatch(detail,/placeholderData=.*SAP Code/);
});

test('OFFSET 5 contextual dialog exposes source detail confidence and position truth',()=>{
  const detail=app.slice(app.indexOf('function machineDetailDialog(machine){'),app.indexOf('async function switchActiveMachine',app.indexOf('function machineDetailDialog(machine){')));
  assert.match(detail,/assetTruth\(state\?\.asset,\{placement,sourceCount:TECHNICAL_SOURCES\.length\}\)/);
  assert.match(detail,/pair\('3D source',truth\.source3D\)/);
  assert.match(detail,/pair\('3D detail',truth\.detail3D\)/);
  assert.match(detail,/pair\('Data confidence',truth\.dataConfidence\)/);
  assert.match(detail,/pair\('Posisi',truth\.position\)/);
});

test('returning to the factory overview clears the selection and restores whole-factory focus',()=>{
  assert.match(app,/function showHome\(\)[\s\S]*clearFactorySelection\(\)[\s\S]*fit\(engine\.factory,'iso'\)/);
  assert.match(app,/factory-overview[\s\S]*clearFactorySelection\(\)[\s\S]*fit\(engine\.factory,'iso'\)/);
  assert.match(app,/selectedAsset:null/);
});

test('V157 release keys preserve the strict Phase-1 cache while advancing interaction code',()=>{
  assert.match(html,/app-shell-v79\.css\?v=157/);
  assert.match(html,/src\/app\.js\?v=157/);
  assert.match(html,/src\/app-shell-v79\.js\?v=157/);
  assert.match(app,/pair\('Versi aplikasi','V157'\)/);
  assert.match(shell,/v157-phase3-interaction/);
  assert.match(sw,/factory-digital-twin-v157-phase3-interaction-20260922/);
  assert.doesNotMatch(sw,/src\/offset10\.js/);
  assert.doesNotMatch(sw,/src\/apm2\.js/);
  assert.doesNotMatch(sw,/src\/sheeting\.js/);
});
