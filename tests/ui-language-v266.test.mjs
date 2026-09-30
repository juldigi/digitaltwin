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
const sw=read('../frontend/sw.js');
const runtime=[index,shell,app,engine,model,runtimeModule,render,display,confidence].join('\n');

test('V266 uses clear Indonesian for navigation controls editor and settings',()=>{
 for(const copy of [
  'KONTROL PONSEL','Kualitas dan lapisan','Hanya objek ini','Buka interior','Kembalikan kamera',
  'Data dan sumber','Status data dan sumber','Gerakkan bertahap saat diseret',
  'Thread CPU terdeteksi','MESIN DAN PERALATAN','Bandingkan sebelum dan sesudah',
  'Posisi relatif terhadap induk (meter)','Rotasi relatif terhadap induk (derajat)','Kejelasan status data'
 ])assert.ok(runtime.includes(copy),copy);
});

test('V266 removes legacy mixed-language UI wording while preserving useful technical terms',()=>{
 for(const oldCopy of [
  'VERSI MOBILE','VERSI SELULER','Kualitas & lapisan','Zoom masuk','Zoom keluar','Reset kamera',
  'Tampilkan Sendiri','Tampilkan sendiri','Buka Interior','Gerak bertahap saat drag',
  'Gerak bertahap saat diseret','Rotasi relatif induk (derajat)','tidak dilaporkan browser','Thread CPU browser','Thread CPU yang dilaporkan peramban',
  'Status Data & Sumber','Sambungkan Data','Bersihkan Data Tersimpan','Informasi Sistem',
  'Ganti Kata Sandi','Simpan Kata Sandi','Buka Semua Cover','Tutup Interior',
  'Anchor tidak valid','Unit CAD tidak valid','harus angka finite',"'Running'",'MESIN & PERALATAN','MESIN / PERALATAN TERPILIH',
  'Offline: berkas belum tersimpan.','Penampil 3D belum tersedia','menu Aset','RIGHT → LEFT','BMJ Machine Database','ditemukan pada registry.','Buka semua cover luar','Tutup kembali cover','tampilan cover','Identitas aset','Posisi aset','Penanda posisi aset','Nama area dan aset','Sejajarkan dengan aset lain','Pilih aset acuan','posisi aset pada denah','Aset belum memiliki konteks tata letak','Aset dipilih','Aset pabrik','Aset pada tautan','Simulasi proses untuk aset ini','Pilih satu aset','aset dapat dipilih','Kategori aset','Nama aset','Profil cover','Denah 2D · Aset terpilih','Objek terpilih ditandai pada denah','Fallback mesin aktif:','Registry mesin','Alur media & exposure','Jumlah thread CPU yang terdeteksi'
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
 assert.match(sw,/Tidak tersambung: berkas belum tersimpan di perangkat\./);
 assert.match(runtimeModule,/Identitas mesin belum tersedia\./);
 assert.match(runtimeModule,/Model 3D untuk \$\{k\} belum tersedia\./);
 assert.match(runtimeModule,/Simulasi untuk \$\{k\} belum tersedia\./);
 assert.match(engine,/Pilih mesin atau peralatan sebelum membuka model 3D/);
});

test('V266 presents validation confidence and routing status in standard Indonesian',()=>{
 for(const copy of [
  'Titik acuan tidak valid.','Satuan CAD tidak valid.','Koordinat, rotasi, dan skala harus berupa angka yang valid.',
  'Nilai posisi, rotasi, atau skala berada di luar rentang yang didukung.',
  'Referensi dan foto','Posisi diperkirakan dari data yang tersedia','Dikonfirmasi oleh pengguna',
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
 assert.match(render,/shadow map \(peta bayangan\) 512 hanya disiapkan sebagai cadangan/);
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

test('V266 replaces generic asset jargon with object and machine wording',()=>{
 for(const copy of [
  'Identitas mesin atau peralatan','Posisi mesin dan peralatan','Penanda posisi mesin dan peralatan','Nama area, mesin, dan peralatan',
  'Sejajarkan dengan objek lain','Pilih objek acuan',
  'posisi mesin atau peralatan pada denah',
  'Mesin atau peralatan ini belum memiliki posisi tata letak yang dapat dibuka.','Model 3D belum tersedia untuk mesin atau peralatan ini.'
 ])assert.ok(runtime.includes(copy),copy);
});

test('V266 uses machine or equipment wording across chooser status and fallbacks',()=>{
 for(const copy of [
  'Mesin atau peralatan dipilih · buka detail untuk melihat model 3D',
  'Mesin atau peralatan pabrik',
  'Mesin atau peralatan pada tautan ini tidak ditemukan.',
  'Simulasi proses untuk mesin atau peralatan ini belum tersedia.',
  'Pilih mesin atau peralatan untuk menyorot posisinya di pabrik.',
  'model 3D tersedia',
  'Kategori mesin atau peralatan',
  'Nama mesin atau peralatan',
  'Profil penutup dan jalur mekanisme','MESIN ATAU PERALATAN TERPILIH','Buka model 3D','Pusatkan di pabrik'
 ])assert.ok(app.includes(copy),copy);
});


test('V266 resumed audit removes remaining mixed language from machine detail panels',()=>{
 for(const copy of [
  'Pilih mesin dari daftar mesin','TUMPUKAN HASIL','REEL MASUK',
  'Batas dimensi referensi','Batas dimensi struktur','Batas dimensi termasuk area servis',
  'Jarak antarunit (pitch)','Jarak modul berulang (pitch)',
  'KELUARGA SP 102','AKHIRAN MODEL BELUM TERKONFIRMASI',
  'Lokasi fungsional (Functional Location)','ID mesin (Machine ID)',
  'Troli','Palet','Sistem udara bertekanan'
 ])assert.ok(runtime.includes(copy),copy);
 for(const oldCopy of [
  'Pilih mesin dari daftar aset','Envelope referensi','Envelope struktur','Envelope termasuk area servis',
  'Pitch modul','referensi legacy','suffix mesin','baseline visual','OUTPUT / STACKER','INPUT REEL',
  'Trolley','Pallet','SP 102 FAMILY','SUFFIX BELUM TERKONFIRMASI','LEXUS HSM56 VISUAL REF'
 ])assert.equal(runtime.includes(oldCopy),false,oldCopy);
});

test('V266 presentation layer localizes internal evidence and model status codes',()=>{
 for(const copy of [
  'Model 3D dibuat dari foto aktual dan dokumen yang tersedia',
  'Model 3D dibuat berdasarkan dokumen teknis yang tersedia',
  'Model 3D dibuat dari data BMJ dan referensi lama keluarga mesin',
  'Model 3D khusus dibuat dari rekonstruksi foto aktual BMJ',
  'Bukti aktual BMJ tersedia','Dokumen resmi tersedia','Referensi keluarga SP 102 tersedia',
  'Foto aktual BMJ menjadi sumber utama; referensi proses keluarga HSM menjadi sumber pendukung',
  'Mesin produksi','Printing offset','Render 3D belum tersedia','Anotasi sumber; perlu ditinjau'
 ])assert.ok(display.includes(copy),copy);
});

test('V266 editor-facing source labels do not leak internal English scene names',()=>{
 for(const copy of [
  'Konteks pabrik','Studio inspeksi — bukan pabrik','Lantai pabrik DXF',
  'Batas analisis OFU-1 termasuk area servis','Kandidat badan struktur OFU-1',
  'detail Digital Twin pabrik','Instruksi utama yang diberikan pengguna','Kode nama mesin dari pengguna'
 ])assert.ok(runtime.includes(copy),copy);
 for(const oldCopy of [
  'Factory context','Inspection studio — not factory','DXF factory floor',
  'service-inclusive analysis envelope','structural body candidate','detailed factory twin',
  'Master prompt yang diberikan pengguna','Kode nama aset dari pengguna'
 ])assert.equal(runtime.includes(oldCopy),false,oldCopy);
});

test('V266 keeps localized simulation markup valid and explanatory',()=>{
 assert.equal(app.includes('<div<b>'),false);
 assert.match(app,/<div><b>UV Curing System \(sistem curing UV\)<\/b>/);
 assert.match(app,/Mulai simulasi Sheeting/);
 assert.match(app,/Tampilkan garis acuan jalur proses/);
 assert.match(app,/Simulasi kompresor memperlihatkan udara masuk/);
 assert.match(app,/cooling coil \(koil pendingin\)/);
 assert.match(app,/vakum \(vacuum\) menahan material/);
 assert.match(app,/bagian keluaran \(delivery\)/);
 assert.match(app,/Model acuan tetap dapat diputar, difokuskan, dan dibuka strukturnya/);
});

test('V266 keeps machine terminology when translation would reduce technical accuracy',()=>{
 for(const technicalTerm of [
  'SideLay','gripper','rollstand','opposed chuck','lift-table stacker',
  'Functional Location','DWG','CAD','WebGL','UV','shadow map','environment lighting'
 ])assert.ok(runtime.includes(technicalTerm),technicalTerm);
});


test('V266 presentation separators read naturally without changing technical identifiers',()=>{
 for(const copy of [
  'Feeder dan pemisahan lembar','Register dan SideLay','Penggerak utama dan transmisi',
  'Kontrol dan kelistrikan','Pengaman dan pelindung','Sistem UV dan pengering',
  'Platform dan jalur akses','Guide miring, tension, dan EPC','Main head dan zona potong',
  'Fast · Slow · Overlap · Stacker','Catwalk dan struktur','Ukuran atau skala',
  'Titik awal X dan Y','Roll dan penggerak aktif','Jogging (penyelarasan)'
 ])assert.ok(app.includes(copy),copy);
 for(const oldCopy of [
  'Feeder / pemisahan lembar','Register / SideLay','Penggerak utama / transmisi',
  'Kontrol / kelistrikan','Pengaman / pelindung','Sistem UV / pengering',
  'Platform / jalur akses','Guide miring / tension / EPC','Main head / zona potong',
  'Fast / Slow / Overlap / Stacker','Catwalk / struktur','Ukuran / skala','Titik awal X / Y'
 ])assert.equal(app.includes(oldCopy),false,oldCopy);
});

test('V266 placeholder machine details translate internal availability codes at presentation time',()=>{
 assert.match(app,/pair\('Dasar model 3D',readableStatus\('NOT_IMPLEMENTED · LAYOUT PLACEHOLDER'\)\)/);
 assert.match(app,/pair\('Detail model 3D',readableStatus\('NOT_IMPLEMENTED'\)\)/);
 assert.doesNotMatch(app,/pair\('Dasar model 3D','NOT_IMPLEMENTED · LAYOUT PLACEHOLDER'\)/);
});
