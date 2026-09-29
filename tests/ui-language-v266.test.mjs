import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const index=read('../frontend/index.html');
const shell=read('../frontend/src/app-shell-v79.js');
const app=read('../frontend/src/app.js');
const engine=read('../frontend/src/engine.js');
const model=read('../frontend/src/model.js');
const runtimeModule=read('../frontend/src/machine-runtime.js');
const render=read('../frontend/src/render/render-config.js');
const display=read('../frontend/src/display-language.js');
const confidence=read('../frontend/src/data/confidence.js');
const runtime=[index,shell,app,engine,model,runtimeModule,render,display,confidence].join('\n');

test('V266 uses clear Indonesian for navigation controls editor and settings',()=>{
 for(const copy of [
  'KONTROL SELULER','Kualitas dan lapisan','Hanya objek ini','Buka interior','Kembalikan kamera',
  'Data dan sumber','Status data dan sumber','Gerakkan bertahap saat diseret',
  'Thread CPU yang terdeteksi','MESIN DAN PERALATAN','Bandingkan sebelum dan sesudah',
  'Posisi relatif terhadap induk (meter)','Kejelasan status data'
 ])assert.ok(runtime.includes(copy),copy);
});

test('V266 removes legacy mixed-language UI wording while preserving useful technical terms',()=>{
 for(const oldCopy of [
  'VERSI MOBILE','VERSI SELULER','Kualitas & lapisan','Zoom masuk','Zoom keluar','Reset kamera',
  'Tampilkan Sendiri','Tampilkan sendiri','Buka Interior','Gerak bertahap saat drag',
  'Gerak bertahap saat diseret','tidak dilaporkan browser','Thread CPU browser','Thread CPU yang dilaporkan peramban',
  'Status Data & Sumber','Sambungkan Data','Bersihkan Data Tersimpan','Informasi Sistem',
  'Ganti Kata Sandi','Simpan Kata Sandi','Buka Semua Cover','Tutup Interior',
  'Anchor tidak valid','Unit CAD tidak valid','harus angka finite',"'Running'",'MESIN & PERALATAN',
  'Offline: berkas belum tersimpan.','Penampil 3D belum tersedia','menu Aset','RIGHT → LEFT','BMJ Machine Database','ditemukan pada registry.','Buka semua cover luar','Tutup kembali cover','tampilan cover'
 ])assert.equal(runtime.includes(oldCopy),false,oldCopy);
 for(const technicalTerm of ['DWG','CAD','GPU','WebGL','UV','Superadmin','shadow map','environment lighting','SideLay','gripper'])assert.ok(runtime.includes(technicalTerm),technicalTerm);
});

test('V266 presents hierarchy and factory controls in human-readable wording',()=>{
 for(const copy of [
  'Tingkat ${n.level}','Tingkat ${node.level}','Lantai dan jalur','Jendela dan kaca',
  'Taman, jalan, dan gerbang','Cari posisi mesin atau peralatan','Data mesin atau peralatan'
 ])assert.ok(app.includes(copy),copy);
 assert.equal(app.includes('· L${n.level}'),false);
 assert.equal(app.includes('<small>L${node.level}'),false);
});

test('V266 translates generic status labels without rewriting OEM process terminology',()=>{
 for(const copy of [
  'Transport berhenti','Pemrosesan gambar','Pengambilan gambar selesai','Keputusan siap',
  'Penghitung output','Tidak ada lembar ganda','Tekanan udara siap','Penyelarasan selesai',
  'Pembuangan kondensat','Pemuatan tumpukan','Tekanan hidraulik','Lipatan akhir'
 ])assert.ok(app.includes(copy),copy);
 for(const preserved of ['Gripper indexing','Feeder suction','Pressure dwell','SideLay','UV curing','Screw compression','Laser exposure'])assert.ok(app.includes(preserved),preserved);
});

test('V266 localizes connection fallback and runtime failures',()=>{
 assert.match(runtime,/Tidak tersambung: berkas belum tersimpan di perangkat\./);
 assert.match(runtimeModule,/Kunci mesin wajib tersedia/);
 assert.match(runtimeModule,/Model 3D belum terdaftar/);
 assert.match(runtimeModule,/Simulasi belum terdaftar/);
 assert.match(engine,/Pilih mesin atau peralatan sebelum membuka model 3D/);
});

test('V266 presents validation confidence and routing status in standard Indonesian',()=>{
 for(const copy of [
  'Titik acuan tidak valid.','Satuan CAD tidak valid.','Koordinat, rotasi, dan skala harus berupa angka yang valid.',
  'Nilai posisi, rotasi, atau skala berada di luar rentang yang didukung.',
  'Referensi dan foto','Posisi hasil inferensi','Dikonfirmasi oleh pengguna',
  'Kondisi terpasang terkonfirmasi','Belum ditempatkan; menunggu gambar aktual'
 ])assert.ok(runtime.includes(copy),copy);
 assert.match(shell,/readableStatus\(detail\.routeMode\|\|'UNKNOWN'\)/);
});

test('V266 removes implementation-version jargon from primary Sheeting explanation',()=>{
 assert.equal(app.includes('Exterior V68 mempertahankan'),false);
 assert.equal(app.includes('detail V65'),false);
 assert.match(app,/Model mempertahankan bukaan inspeksi yang terlihat pada referensi/);
 assert.match(app,/KANAN → KIRI/);
});

test('V266 keeps render-quality technical terms but explains them in Indonesian',()=>{
 assert.match(render,/profil kualitas/);
 assert.match(render,/perangkat keras/);
 assert.match(render,/shadow map 512 hanya disiapkan sebagai cadangan/);
 assert.match(render,/environment lighting \(pencahayaan lingkungan\)/);
 assert.match(render,/tangkapan layar/);
 assert.match(render,/ponsel atau perangkat seluler/);
});


test('V266 finishes interior fallback and mapping wording in Indonesian',()=>{
 assert.match(app,/KANAN → KIRI · Rollstand/);
 assert.match(app,/Pilih posisi mesin atau peralatan melalui menu Mesin atau denah 2D\./);
 assert.match(app,/Database Mesin BMJ/);
 assert.match(app,/Identitas mesin aktif tidak ditemukan pada daftar mesin\./);
 assert.match(app,/Buka semua penutup luar/);
 assert.match(app,/Tutup kembali penutup/);
 assert.match(app,/Interior, rangka, dan penyangga/);
 assert.match(app,/u==='UNKNOWN'\?'Belum diketahui':u/);
});
