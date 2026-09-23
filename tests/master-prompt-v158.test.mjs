import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const engine=fs.readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V158 selection highlight is UI-only and never mutates factory geometry',()=>{
 assert.match(engine,/factorySelectionId=null/);
 assert.match(engine,/new THREE\.BoxHelper\(object,0x1677d2\)/);
 assert.match(engine,/semantic:'SELECTION_OVERLAY'/);
 assert.match(engine,/sourceType:'UI_STATE_NOT_FACTORY_GEOMETRY'/);
 assert.match(engine,/clearFactorySelection\(\)/);
});

test('selected factory asset is the canonical camera target for fit top and isometric actions',()=>{
 assert.match(engine,/currentFactoryTarget\(\)/);
 assert.match(engine,/focusFactorySelection\(mode='iso'\)/);
 assert.match(app,/target=isFactory\?engine\.currentFactoryTarget\(\):\(selectedPart\|\|engine\.machine\)/);
 assert.match(app,/if\(mode==='fit'\)\{engine\.fit\(target,'iso'\)/);
 assert.match(app,/const preset=mode==='top'\?'top':'iso'/);
});

test('scene click and factory selector share one persistent asset context',()=>{
 assert.match(app,/function selectFactoryAssetContext\(machine/);
 assert.match(app,/engine\.onFactorySelect=id=>/);
 assert.match(app,/selectFactoryAssetContext\(m,\{historyMode:'push',openDialog:false,focus:true\}\)/);
 assert.match(app,/factory-asset-focus/);
});

test('Phase-1 placeholders stay spatial-only while exposing honest implementation truth',()=>{
 const detail=app.slice(app.indexOf('function machineDetailDialog(machine){'),app.indexOf('async function switchActiveMachine',app.indexOf('function machineDetailDialog(machine){')));
 assert.match(detail,/pair\('ID posisi',machine\.machineId\)\+pair\('Area',machine\.area\)/);
 assert.match(detail,/pair\('3D source','NOT_IMPLEMENTED · LAYOUT PLACEHOLDER'\)/);
 assert.match(detail,/pair\('3D detail','NOT_IMPLEMENTED'\)/);
 assert.match(detail,/pair\('Status detail','Belum dibuka pada fase fondasi'\)/);
 assert.ok(!/placeholderData=.*Serial Number/.test(detail));
 assert.ok(!/placeholderData=.*SAP Code/.test(detail));
});

test('OFFSET 5 contextual detail exposes source detail confidence and verified-position semantics',()=>{
 const detail=app.slice(app.indexOf('function machineDetailDialog(machine){'),app.indexOf('async function switchActiveMachine',app.indexOf('function machineDetailDialog(machine){')));
 assert.match(detail,/assetTruth\(state\?\.asset,\{placement,sourceCount:TECHNICAL_SOURCES\.length\}\)/);
 assert.match(detail,/pair\('3D source',truth\.source3D\)/);
 assert.match(detail,/pair\('3D detail',truth\.detail3D\)/);
 assert.match(detail,/pair\('Data confidence',truth\.dataConfidence\)/);
 assert.match(detail,/pair\('Posisi',truth\.position\)/);
});

test('returning to factory overview clears selection and restores whole-factory focus',()=>{
 assert.match(app,/function showHome\(\{historyMode='none'\}=\{\}\)[\s\S]*clearFactorySelection\(\)[\s\S]*fit\(engine\.factory,'iso'\)/);
 assert.match(app,/factory-overview[\s\S]*clearFactorySelection\(\)[\s\S]*fit\(engine\.factory,'iso'\)/);
 assert.match(app,/selectedAsset:null/);
});

test('V158 keeps the V157 foundation-only startup graph while advancing interaction code',()=>{
 for(const forbidden of ["from './machine-runtime.js'","from './offset10.js'","from './apm2.js'","from './sheeting.js'","from './universal-machine.js'"]){
  assert.ok(!app.includes(forbidden),forbidden+' must remain absent from app startup graph');
  assert.ok(!engine.includes(forbidden),forbidden+' must remain absent from engine startup graph');
 }
 assert.match(html,/app-shell-v79\.css\?v=168/);
 assert.match(html,/src\/app\.js\?v=174/);
 assert.match(html,/src\/app-shell-v79\.js\?v=173/);
 assert.match(app,/pair\('Versi aplikasi','V171'\)/);
 assert.match(shell,/v162-factory-first-systems/);
 assert.match(sw,/factory-digital-twin-v174-navigation-selector-hotfix-20260923/);
 for(const excluded of ['machine-runtime.js','universal-machine.js','offset10.js','apm2.js','sheeting.js'])assert.ok(!sw.includes(excluded),excluded+' must not be pre-cached');
});
