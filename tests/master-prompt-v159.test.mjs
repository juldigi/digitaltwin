import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../frontend/src/ui-v5.js',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V194 data and source status is reachable from Settings without a floating launcher',()=>{
 assert.doesNotMatch(html,/id="panel-launcher"/);
 assert.match(app,/id="settings-status"/);
 assert.match(app,/on\('#settings-status',\(\)=>foundationStatusDialog\(\{back:settingsDialog\}\)\)/);
 assert.match(app,/function foundationStatusDialog\(\{back=null\}=\{\}\)/);
 assert.match(app,/layoutTruth\(l\)/);
 assert.match(app,/buildDwgFidelityLedger/);
 assert.match(app,/assetTruth\(state\?\.asset/);
 assert.match(app,/connectionTruth/);
});

test('OFFSET 5 overview carries all mandatory master-prompt truth fields',()=>{
 for(const label of ['Nama aset','Model','Kategori','Subkategori','Pabrikan','Spesifikasi','Lokasi','Status operasi','Health score','3D source','3D detail','Data confidence','Posisi','Source count']){
  assert.ok(app.includes("pair('"+label+"'"),label+' missing from OFFSET 5 overview');
 }
 assert.match(app,/PROCEDURAL \/ RECONSTRUCTED/);
 assert.match(app,/PARTIAL \/ APPROXIMATE/);
 assert.match(app,/primaryTruth\.operatingStatus/);
 assert.match(app,/primaryTruth\.healthScore/);
});

test('V194 retires the duplicate classic position editor in favor of Edit Pabrik 3D',()=>{
 assert.doesNotMatch(html,/id="edit-position"/);
 assert.doesNotMatch(app,/function editorPanel\(\)/);
 assert.match(app,/Edit Pabrik 3D/);
 assert.match(app,/openSceneEditor\(\)/);
 assert.match(app,/Posisi \(meter\)/);
 assert.match(app,/Rotasi \(derajat\)/);
});

test('V159 preserves V158 camera and selection interaction contract',()=>{
 assert.match(app,/currentFactoryTarget\(\)/);
 assert.match(app,/selectFactoryAssetContext/);
 assert.match(app,/clearFactorySelection\(\)/);
 assert.match(app,/requestFullscreen\(\)/);
 assert.match(app,/document\.exitFullscreen\(\)/);
 for(const token of ['data-camera="iso"','data-camera="top"','data-camera="fit"','data-camera="reset"','id="fullscreen"','id="global-search"','id="nav-assets"','id="settings"'])assert.ok(html.includes(token),token+' missing');
});

test('V159 search promise matches strict Phase-1 scope and cache identifiers are coherent',()=>{
 assert.match(shell,/Cari mesin, area, komponen, sistem, atau sumber/);
  assert.match(html,/app-shell-v79\.css\?v=211/);
 assert.match(html,/src\/app\.js\?v=211/);
 assert.match(html,/src\/ui-v5\.js\?v=211/);
 assert.match(html,/src\/app-shell-v79\.js\?v=211/);
 assert.match(shell,/v198-architecture-convergence/);
 assert.match(sw,/factory-digital-twin-v211-ui-ssot-stage6-20260925/);
});
