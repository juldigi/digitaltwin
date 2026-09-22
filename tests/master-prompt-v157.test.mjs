import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../frontend/src/ui-v5.js',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V157 replaces the dead panel launcher with a working source-backed STATUS control',()=>{
  assert.match(html,/id="panel-launcher"[^>]+title="Status fondasi"[^>]+aria-label="Buka status fondasi"/);
  assert.match(ui,/panel-launcher[^\n]+bmj:foundationstatusrequest/);
  assert.doesNotMatch(ui,/panel-launcher[^\n]+toggleLauncher\(\)/);
  assert.match(app,/function foundationStatusDialog\(\)/);
  assert.match(app,/layoutTruth\(l\)/);
  assert.match(app,/buildDwgFidelityLedger/);
  assert.match(app,/assetTruth\(state\?\.asset/);
  assert.match(app,/connectionTruth/);
  assert.match(app,/addEventListener\('bmj:foundationstatusrequest',foundationStatusDialog\)/);
});

test('OFFSET 5 overview exposes mandatory master-prompt truth fields without inventing operation data',()=>{
  for(const label of ["Nama aset","Model","Kategori","Subkategori","Pabrikan","Spesifikasi","Lokasi","Status operasi","Health score","3D source","3D detail","Data confidence","Posisi","Source count"]){
    assert.ok(app.includes("pair('"+label+"'"),label+" missing from detail panel");
  }
  assert.match(app,/PROCEDURAL \/ RECONSTRUCTED/);
  assert.match(app,/PARTIAL \/ APPROXIMATE/);
  assert.match(app,/primaryTruth\.operatingStatus/);
  assert.match(app,/primaryTruth\.healthScore/);
});

test('admin map editor distinguishes source position from manual edits and shows DWG plus Three.js coordinates',()=>{
  assert.match(app,/Status sumber posisi/);
  assert.match(app,/DWG-VERIFIED hanya berasal dari geometri\/anchor sumber/);
  assert.match(app,/Status perubahan manual/);
  assert.match(app,/id="cad-coordinates"/);
  assert.match(app,/id="three-coordinates"/);
  assert.match(app,/DWG: X/);
  assert.match(app,/THREE: X/);
  assert.match(app,/USER-CONFIRMED/);
  assert.match(app,/APPROXIMATE/);
});

test('Phase-1 primary controls remain real: top, isometric, fit, reset, fullscreen, search, assets, status',()=>{
  assert.match(html,/data-camera="iso"/);
  assert.match(html,/data-camera="top"/);
  assert.match(html,/data-camera="fit"/);
  assert.match(html,/data-camera="reset"/);
  assert.match(html,/id="fullscreen"/);
  assert.match(html,/id="global-search"/);
  assert.match(html,/id="nav-assets"/);
  assert.match(html,/id="panel-launcher"/);
  assert.match(app,/requestFullscreen\(\)/);
  assert.match(app,/document\.exitFullscreen\(\)/);
});

test('search language no longer promises gated Phase-1 systems and V157 cache is coherent',()=>{
  assert.match(shell,/Cari OFFSET 5, komponen, area, atau dokumen/);
  assert.doesNotMatch(shell,/Cari mesin, area, komponen, sistem, atau dokumen/);
  assert.match(html,/app-shell-v79\.css\?v=157/);
  assert.match(html,/src\/app\.js\?v=157/);
  assert.match(html,/src\/ui-v5\.js\?v=157/);
  assert.match(html,/src\/app-shell-v79\.js\?v=157/);
  assert.match(shell,/v157-phase1-interaction-integrity/);
  assert.match(sw,/factory-digital-twin-v157-interaction-integrity-20260922/);
});
