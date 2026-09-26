import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');

test('V150 removes internal routing jargon from user-facing factory copy',()=>{
  for(const oldCopy of ['Routing scaffold siap dipasang','Future anchors','Preview pipa compressor','Preview pipa AHU','Preview ducting AHU','AHU & ducting plant','Compressed air & piping plant'])assert.equal(app.includes(oldCopy),false,oldCopy);
  for(const copy of ['Denah pabrik','Cakupan model dan sumber','Detail 3D bergantung pada sumber tiap mesin','Posisi belum teridentifikasi'])assert.equal(app.includes(copy),true,copy);
  for(const hiddenExpansionCopy of ['Jalur utilitas siap dilengkapi','Lihat pipa compressor','Lihat pipa AHU','Lihat ducting AHU'])assert.equal(app.includes(hiddenExpansionCopy),false,hiddenExpansionCopy);
});

test('V150 asset and reference copy is human-first without changing technical source data',()=>{
  assert.equal(app.includes('<small>MESIN & PERALATAN</small>'),true);
  assert.equal(app.includes('<small>ASSET BROWSER</small>'),false);
  assert.equal(app.includes('<span>Merek</span>'),false);
  assert.equal(app.includes("nodes.length+' komponen '+activeMachine.name+' ditampilkan'"),true);
  assert.equal(app.includes('Gambar / Denah'),true);
  assert.equal(app.includes('Bukti / Sumber'),true);
  assert.equal(app.includes('sisi operator'),true);
  assert.equal(app.includes('sisi penggerak'),true);
  assert.match(app,/TECHNICAL_SOURCES/);
  assert.match(app,/PHOTO_REGISTRY/);
});

test('V150 contextual help follows active workspace and avoids implementation jargon',()=>{
  assert.match(app,/function helpDialog\(\)/);
  assert.match(app,/activeSection\|\|'factory'/);
  for(const section of ['simulation','reference','asset'])assert.equal(app.includes("section==='"+section+"'"),true,section);
  assert.equal(app.includes("section==='system'"),false,'system help context must stay out of Phase-1');
  assert.match(app,/PANDUAN KONTEKSTUAL/);
  assert.match(app,/Kejujuran data/);
  assert.equal(app.includes('memakai simulation engine mesin yang sedang aktif'),false);
  assert.equal(app.includes('Klik node sampai enam tingkat'),false);
});

test('V150 settings expose only real controls and keep label state synchronized',()=>{
  assert.match(app,/modal\('Pengaturan'/);
  assert.match(app,/Optimasi untuk perangkat dengan performa terbatas/);
  assert.match(app,/Tampilkan nama mesin dan area/);
  assert.match(app,/engine\?\.setQualityProfile/);
  assert.match(app,/const labels=Boolean\(e\.target\.checked\);setDomainState\(\{visibleLayers:\{labels\}\}\);if\(engine\)engine\.labels=labels/);
  assert.match(app,/visibleLayers:\{labels\}/);
  assert.match(app,/cache\.clear\(\)/);
});

test('V150 help and settings remain compact and responsive',()=>{
  assert.match(css,/V150 human-language help and settings/);
  assert.match(css,/\.help-grid\{display:grid;grid-template-columns:1fr 1fr/);
  assert.match(css,/\.settings-section/);
  assert.match(css,/@media\(max-width:560px\)\{\.help-grid\{grid-template-columns:1fr\}/);
});
