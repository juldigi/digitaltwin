import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const index=read('../frontend/index.html');
const shell=read('../frontend/src/app-shell-v79.js');
const app=read('../frontend/src/app.js');
const engine=read('../frontend/src/engine.js');
const model=read('../frontend/src/model.js');
const render=read('../frontend/src/render/render-config.js');
const display=read('../frontend/src/display-language.js');
const confidence=read('../frontend/src/data/confidence.js');
const runtime=[index,shell,app,engine,model,render,display,confidence].join('\n');

test('V266 uses clear Indonesian for primary navigation, controls and settings',()=>{
 for(const copy of [
  'VERSI SELULER','Kualitas dan lapisan','Tampilkan sendiri','Buka interior','Kembalikan kamera',
  'Data dan sumber','Status data dan sumber','Gerak bertahap saat diseret',
  'Thread CPU yang dilaporkan peramban','MESIN DAN PERALATAN'
 ])assert.ok(runtime.includes(copy),copy);
});

test('V266 removes legacy mixed-language UI wording while preserving technical identifiers',()=>{
 for(const oldCopy of [
  'VERSI MOBILE','Kualitas & lapisan','Zoom masuk','Zoom keluar','Reset kamera','Tampilkan Sendiri',
  'Buka Interior','Gerak bertahap saat drag','tidak dilaporkan browser','Thread CPU browser',
  'Status Data & Sumber','Sambungkan Data','Bersihkan Data Tersimpan','Informasi Sistem',
  'Ganti Kata Sandi','Simpan Kata Sandi','Buka Semua Cover','Tutup Interior',
  'Anchor tidak valid','Unit CAD tidak valid','harus angka finite',"'Running'",'MESIN & PERALATAN'
 ])assert.equal(runtime.includes(oldCopy),false,oldCopy);
 for(const technicalTerm of ['DWG','CAD','GPU','WebGL','UV','Superadmin','shadow map','environment lighting'])assert.ok(runtime.includes(technicalTerm),technicalTerm);
});

test('V266 translates generic status labels without rewriting OEM process terminology',()=>{
 for(const copy of [
  'Transport berhenti','Pemrosesan gambar','Pengambilan gambar selesai','Keputusan siap',
  'Penghitung output','Tidak ada lembar ganda','Tekanan udara siap','Penyelarasan selesai',
  'Pembuangan kondensat','Pemuatan tumpukan','Tekanan hidraulik','Lipatan akhir'
 ])assert.ok(app.includes(copy),copy);
 for(const preserved of ['Gripper indexing','Feeder suction','Pressure dwell','SideLay','UV curing','Screw compression','Laser exposure'])assert.ok(app.includes(preserved),preserved);
});

test('V266 presents validation and confidence language in standard Indonesian',()=>{
 for(const copy of [
  'Titik acuan tidak valid.','Satuan CAD tidak valid.','Koordinat, rotasi, dan skala harus berupa angka yang valid.',
  'Referensi dan foto','Posisi hasil inferensi','Dikonfirmasi oleh pengguna'
 ])assert.ok(runtime.includes(copy),copy);
});

test('V266 keeps render-quality technical terms but explains them in Indonesian',()=>{
 assert.match(render,/perangkat keras/);
 assert.match(render,/shadow map 512 disiapkan sebagai cadangan/);
 assert.match(render,/environment lighting \(pencahayaan lingkungan\)/);
 assert.match(render,/tangkapan layar/);
 assert.match(render,/ponsel atau perangkat seluler/);
});
