import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../frontend/src/ui-v5.js',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V159 STATUS control is visible, reachable, and backed by live truth sources',()=>{
 assert.match(html,/id="panel-launcher"[^>]+title="Status fondasi"[^>]+aria-label="Buka status fondasi"/);
 assert.match(ui,/panel-launcher[^\n]+bmj:foundationstatusrequest/);
 assert.doesNotMatch(ui,/panel-launcher[^\n]+toggleLauncher\(\)/);
 assert.match(app,/function foundationStatusDialog\(\)/);
 assert.match(app,/addEventListener\('bmj:foundationstatusrequest',foundationStatusDialog\)/);
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

test('Map Editor exposes source provenance and both DWG and Three.js coordinates',()=>{
 assert.match(app,/Status sumber posisi/);
 assert.match(app,/DWG-VERIFIED hanya berasal dari geometri atau anchor sumber/);
 assert.match(app,/Status perubahan manual/);
 assert.match(app,/id="cad-coordinates"/);
 assert.match(app,/id="three-coordinates"/);
 assert.match(app,/DWG: X/);
 assert.match(app,/THREE: X/);
 assert.match(app,/USER-CONFIRMED/);
 assert.match(app,/APPROXIMATE/);
});

test('V159 preserves V158 camera and selection interaction contract',()=>{
 assert.match(app,/currentFactoryTarget\(\)/);
 assert.match(app,/selectFactoryAssetContext/);
 assert.match(app,/clearFactorySelection\(\)/);
 assert.match(app,/requestFullscreen\(\)/);
 assert.match(app,/document\.exitFullscreen\(\)/);
 for(const token of ['data-camera="iso"','data-camera="top"','data-camera="fit"','data-camera="reset"','id="fullscreen"','id="global-search"','id="nav-assets"','id="panel-launcher"'])assert.ok(html.includes(token),token+' missing');
});

test('V159 search promise matches strict Phase-1 scope and cache identifiers are coherent',()=>{
 assert.match(shell,/Cari mesin, area, komponen, sistem, atau sumber/);
  assert.match(html,/app-shell-v79\.css\?v=192/);
 assert.match(html,/src\/app\.js\?v=192/);
 assert.match(html,/src\/ui-v5\.js\?v=167/);
 assert.match(html,/src\/app-shell-v79\.js\?v=192/);
 assert.match(shell,/v193-three-domain-contextual/);
 assert.match(sw,/factory-digital-twin-v207-superadmin-editor-20260924/);
});
