import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const lod=fs.readFileSync(new URL('../frontend/src/lod-manager.js',import.meta.url),'utf8');
const engine=fs.readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V159 implements semantic LOD 0 factory and LOD 1 sample machine',()=>{
 assert.match(lod,/level:0,key:'factory',label:'LOD 0 · Pabrik'/);
 assert.match(lod,/level:1,key:'sample-machine',label:'LOD 1 · OFFSET 5'/);
 assert.match(lod,/phaseImplementedLevels:\[0,1\]/);
 assert.match(lod,/implemented:Object\.freeze\(\[0,1\]\)/);
});

test('LOD 2 through 5 are prepared architecture and never advertised as implemented',()=>{
 for(const level of [2,3,4,5])assert.match(lod,new RegExp("level:"+level+".*implemented:false"));
 assert.match(lod,/futurePreparedLevels:\[2,3,4,5\]/);
 assert.match(lod,/prepared:Object\.freeze\(\[2,3,4,5\]\)/);
 assert.match(lod,/ZOOM DEEPER → REVEAL MORE VERIFIED KNOWLEDGE/);
});

test('engine view transitions own the active semantic LOD independently of low-performance mode',()=>{
 assert.match(engine,/new DetailLODManager\(\)/);
 assert.match(engine,/this\.lodManager\.setView\(view\)/);
 assert.match(engine,/getLODState\(\)/);
 assert.match(engine,/setPreparedLODHint\(taxonomyLevel\)/);
 assert.match(engine,/setLow\(on\)\{this\.low=on/);
 assert.doesNotMatch(lod,/setLow|pixelRatio|shadowMap/);
});

test('taxonomy depth only requests future prepared detail while active Phase-1 LOD stays machine level',()=>{
 assert.match(lod,/if\(this\.activeLevel!==1\)return this\.state\(\)/);
 assert.match(lod,/const requested=lodForTaxonomyLevel\(taxonomyLevel\)/);
 assert.match(lod,/const next=requested>1\?requested:null/);
 assert.match(app,/engine\.setPreparedLODHint\(meta\?\.level\|\|1\)/);
 assert.match(app,/engine\?\.setPreparedLODHint\(meta\.level\)/);
 assert.match(app,/engine\.clearPreparedLODHint\(\)/);
});

test('OFFSET 5 detail panel exposes all master-prompt truth fields without fabricating unknowns',()=>{
 const detail=app.slice(app.indexOf('function machineDetailDialog(machine){'),app.indexOf('async function switchActiveMachine',app.indexOf('function machineDetailDialog(machine){')));
 for(const field of ['Nama aset','Model','Kategori','Subkategori','Pabrikan','Spesifikasi','Lokasi','Status','3D source','3D detail','Data confidence','Source count']){
  assert.match(detail,new RegExp("pair\\('"+field+"'"));
 }
 assert.match(detail,/state\?\.asset\?\.location\|\|machine\.area\|\|'UNKNOWN'/);
 assert.match(detail,/state\?\.asset\?\.category\|\|'UNKNOWN'/);
 assert.match(detail,/state\?\.asset\?\.subcategory\|\|'UNKNOWN'/);
});

test('V159 diagnostics show active LOD and explicitly mark deeper levels as prepared only',()=>{
 assert.match(app,/pair\('Versi aplikasi','V159'\)/);
 assert.match(app,/pair\('Detail aktif',lod\?\.activeLabel\|\|'Belum tersedia'\)/);
 assert.match(app,/LOD 2–5 disiapkan untuk fase berikutnya/);
 assert.match(app,/Phase-1 hanya mengaktifkan LOD 0–1/);
});

test('V159 cache includes the LOD manager and keeps the foundation-only expansion boundary',()=>{
 assert.match(html,/app-shell-v79\.css\?v=159/);
 assert.match(html,/src\/app\.js\?v=159/);
 assert.match(html,/src\/app-shell-v79\.js\?v=159/);
 assert.match(shell,/v159-progressive-detail/);
 assert.match(sw,/factory-digital-twin-v159-progressive-detail-20260922/);
 assert.match(sw,/src\/lod-manager\.js/);
 for(const excluded of ['machine-runtime.js','universal-machine.js','offset10.js','apm2.js','sheeting.js'])assert.ok(!sw.includes(excluded),excluded+' must remain outside production precache');
});
