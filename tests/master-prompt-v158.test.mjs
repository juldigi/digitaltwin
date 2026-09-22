import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../frontend/src/ui-v5.js',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V158 replaces the visible dead panel launcher with a real foundation STATUS control',()=>{
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

test('OFFSET 5 overview exposes mandatory Phase-1 truth fields',()=>{
 for(const label of ['Nama aset','Model','Kategori','Subkategori','Pabrikan','Spesifikasi','Lokasi','Status operasi','Health score','3D source','3D detail','Data confidence','Posisi','Source count']){
  assert.ok(app.includes("pair('"+label+"'"),label+' missing from OFFSET 5 overview');
 }
 assert.match(app,/PROCEDURAL \/ RECONSTRUCTED/);
 assert.match(app,/PARTIAL \/ APPROXIMATE/);
 assert.match(app,/primaryTruth\.operatingStatus/);
 assert.match(app,/primaryTruth\.healthScore/);
});

test('admin map editor exposes source provenance plus DWG and Three.js coordinates',()=>{
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

test('required Phase-1 controls remain real and fullscreen has implemented behavior',()=>{
 for(const token of ['data-camera="iso"','data-camera="top"','data-camera="fit"','data-camera="reset"','id="fullscreen"','id="global-search"','id="nav-assets"','id="panel-launcher"'])assert.ok(html.includes(token),token+' missing');
 assert.match(app,/requestFullscreen\(\)/);
 assert.match(app,/document\.exitFullscreen\(\)/);
});

test('Phase-1 search copy does not promise gated Systems and V158 cache identifiers are coherent',()=>{
 assert.match(shell,/Cari OFFSET 5, komponen, area, atau dokumen/);
 assert.doesNotMatch(shell,/Cari mesin, area, komponen, sistem, atau dokumen/);
 assert.match(html,/app-shell-v79\.css\?v=158/);
 assert.match(html,/src\/app\.js\?v=158/);
 assert.match(html,/src\/ui-v5\.js\?v=158/);
 assert.match(html,/src\/app-shell-v79\.js\?v=158/);
 assert.match(shell,/v158-phase1-interaction-integrity/);
 assert.match(sw,/factory-digital-twin-v158-interaction-integrity-20260922/);
});
