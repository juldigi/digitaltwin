import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const index=read('../frontend/index.html');
const shell=read('../frontend/src/app-shell-v79.js');
const app=read('../frontend/src/app.js');
const runtime=read('../frontend/src/machine-runtime.js');
const confidence=read('../frontend/src/data/confidence.js');
const display=read('../frontend/src/display-language.js');
const render=read('../frontend/src/render/render-config.js');
const universal=read('../frontend/src/universal-machine.js');
const dwg=read('../frontend/src/data/dwg-fidelity.js');
const editorState=read('../frontend/src/scene-editor-state.js');

test('V267 refines initial shell and mobile wording in standard Indonesian',()=>{
 assert.match(index,/<h1 id="view-title">Pabrik Packaging Offset<\/h1>/);
 assert.match(index,/<span>Daftar mesin<\/span>/);
 assert.match(index,/<span>Siap digunakan<\/span>/);
 assert.match(shell,/KONTROL PONSEL/);
 assert.match(shell,/navigator\.onLine\?'Jaringan tersedia':'Tidak tersambung'/);
 assert.doesNotMatch(shell,/navigator\.onLine\?'Data tersedia':'Tidak tersambung'/);
});

test('V267 keeps connection wording factual instead of implying data availability',()=>{
 const onlineLabels=[...shell.matchAll(/navigator\.onLine\?'([^']+)':'Tidak tersambung'/g)].map(match=>match[1]);
 assert.ok(onlineLabels.length>=2,'all shell connection indicators should share one factual wording');
 assert.ok(onlineLabels.every(label=>label==='Jaringan tersedia'));
});

test('V267 removes residual database jargon from ordinary editor and system copy',()=>{
 for(const copy of [
  'Semua mesin dari data BMJ',
  'Mesin dari data BMJ',
  'Mesin tersedia pada data BMJ, tetapi belum memiliki objek yang dapat digeser.',
  'Data mesin BMJ dan acuan jalur udara bertekanan',
  'Data AHU BMJ dan acuan pipa serta ducting AHU',
  'Acuan jalur utilitas dan data peralatan BMJ'
 ])assert.ok(app.includes(copy),copy);
 for(const oldCopy of [
  'Semua mesin dari database BMJ',
  'Mesin dari database',
  'Mesin tersedia di database, tetapi belum memiliki objek yang dapat digeser.',
  'Database mesin BMJ dan acuan jalur udara bertekanan',
  'Database AHU BMJ dan acuan pipa serta ducting AHU',
  'Acuan jalur utilitas dan database peralatan BMJ'
 ])assert.equal(app.includes(oldCopy),false,oldCopy);
});

test('V267 presents runtime errors as user-facing availability messages',()=>{
 assert.match(runtime,/Identitas mesin belum tersedia\./);
 assert.match(runtime,/Model 3D untuk \$\{k\} belum tersedia\./);
 assert.match(runtime,/Simulasi untuk \$\{k\} belum tersedia\./);
 assert.doesNotMatch(runtime,/Kunci mesin wajib tersedia/);
 assert.doesNotMatch(runtime,/belum terdaftar untuk/);
 assert.doesNotMatch(app,/new Error\('3D renderer unavailable'\)/);
 assert.match(app,/new Error\('Render 3D belum tersedia'\)/);
});

test('V267 improves editor settings and confidence copy without changing technical terminology',()=>{
 assert.match(app,/Tutup editor tanpa menyimpan\?/);
 assert.match(app,/Thread CPU terdeteksi/);
 assert.match(app,/Kualitas yang direkomendasikan/);
 assert.match(app,/Penyimpanan di perangkat/);
 assert.match(confidence,/Terverifikasi dari foto/);
 assert.match(confidence,/Posisi diperkirakan dari data yang tersedia/);
 assert.match(confidence,/Hanya berdasarkan referensi/);
 assert.match(display,/Model 3D dibuat dari data BMJ dan referensi lama keluarga mesin/);
 assert.match(display,/'3D renderer unavailable':'Render 3D belum tersedia'/);
});

test('V267 explains render terminology while preserving the technical terms',()=>{
 assert.match(render,/shadow map \(peta bayangan\)/);
 assert.match(render,/interval frame \(jeda antarframe\)/);
 assert.match(render,/exposure \(tingkat pencahayaan\)/);
 assert.match(render,/post-processing \(pemrosesan akhir visual\)/);
 assert.match(render,/laju frame \(FPS\)/);
 for(const term of ['GPU','shadow map','environment lighting','post-processing','FPS'])assert.ok(render.includes(term),term);
});


test('V267 keeps the factory view title Indonesian on every runtime path',()=>{
 assert.match(app,/\$\('#view-title'\)\.textContent='Pabrik Packaging Offset'/);
 assert.doesNotMatch(app,/\$\('#view-title'\)\.textContent='Packaging Offset Factory'/);
});

test('V267 presents universal machine evidence without leaking raw engineering codes',()=>{
 assert.match(universal,/const DISPLAY_REASON_BY_NO=new Map/);
 assert.match(universal,/gradeLabel:EVIDENCE_GRADE_LABELS\[evidence\.grade\]/);
 assert.match(universal,/geometryLabel:EVIDENCE_GEOMETRY_LABELS\[evidence\.geometry\]/);
 assert.match(universal,/simulationLabel:EVIDENCE_SIMULATION_LABELS\[evidence\.simulation\]/);
 assert.match(universal,/Data BMJ mengidentifikasi Atlas Copco, tetapi model tepat belum tersedia/);
 assert.match(universal,/Bukti khusus mesin belum cukup untuk membuat geometri atau simulasi mekanis/);
 assert.match(universal,/Assembly \(rakitan\)/);
 assert.match(universal,/Functional Block \(blok fungsi\)/);
 assert.match(universal,/Service Group \(grup servis\)/);
 assert.match(universal,/Active Element \(elemen aktif\)/);
 assert.match(app,/e\.displayReason\|\|e\.reason/);
 assert.match(app,/e\.gradeLabel\|\|readableStatus\(e\.grade\)/);
 assert.match(app,/e\.geometryLabel\|\|readableStatus\(e\.geometry\)/);
 assert.doesNotMatch(app,/<p>\$\{esc\(e\.reason\)\}<\/p><span class="tag">\$\{esc\(e\.grade\)\}/);
});

test('V267 localizes raw universal evidence status codes in the shared presentation layer',()=>{
 for(const raw of [
  'MODEL_FAMILY_PROCESS_GROUNDED',
  'FUNCTIONAL_MULTI_VENDOR_REFERENCE',
  'ATLAS_COPCO_GA_G_OIL_INJECTED_FAMILY_REFERENCE',
  'EUROVENT_SECTIONAL_AHU_FUNCTIONAL_REFERENCE',
  'VERIFIED_PROCESS_MODEL','FAMILY_PROCESS_MODEL','BLOCKED'
 ])assert.ok(display.includes("'"+raw+"':"),raw);
 assert.match(display,/const procedural=\/\^\(DEDICATED \)\?PROCEDURAL/);
});

test('V267 keeps DWG audit internals out of the user-facing fidelity popup',()=>{
 assert.match(dwg,/Denah DWG belum dimuat\./);
 assert.match(dwg,/Jenis entitas tetap dicatat dalam audit ekstraksi/);
 assert.match(dwg,/KELAS ENTITAS SUMBER BELUM DIRINCI OLEH EKSTRAKTOR/);
 assert.doesNotMatch(dwg,/DWG layout is not loaded\./);
 assert.doesNotMatch(dwg,/Entity type is retained in the extraction audit/);
 assert.match(app,/readableStatus\(item\.semanticType\)/);
 assert.match(app,/readableStatus\(item\.threeDStatus\)/);
 assert.match(display,/PARTIAL \/ NORMALIZED EXTRACTION/);
 assert.match(dwg,/DWG X → THREE X · DWG Y → THREE Z · THREE Y → ELEVATION/);
 assert.match(display,/DWG X → sumbu X 3D · DWG Y → sumbu Z 3D · sumbu Y 3D → elevasi/);
});

test('V267 replaces developer-facing editor import validation wording',()=>{
 assert.match(editorState,/Data perubahan 3D tidak valid/);
 assert.match(editorState,/Posisi, rotasi, atau skala objek tidak valid\./);
 assert.match(editorState,/Sumber objek salinan tidak valid\./);
 assert.match(editorState,/versi model 3D saat ini/);
 assert.doesNotMatch(editorState,/Override scene tidak valid/);
 assert.doesNotMatch(editorState,/Transform objek tidak valid/);
 assert.doesNotMatch(editorState,/versi scene saat ini/);
});

test('V267 puts Indonesian first in machine and simulation explanations',()=>{
 for(const copy of [
  'Lokasi fungsional (Functional Location)',
  'Mesin die-cutting flatbed otomatis (automatic flatbed die cutter)',
  'Pemotong reel menjadi lembar (roll-to-sheet sheeter)',
  '600 g/m² (600 gsm)','300 m/menit',
  'Mekanisme fan dan aktuator',
  'Alur imaging (pencitraan) external-drum',
  'Alur media dan exposure (penyinaran)',
  'Alur vacuum (vakum) dan toolpath XY (jalur gerak alat)',
  'Alur suction (hisap) dan gathering (pengumpulan)'
 ])assert.ok(app.includes(copy),copy);
 for(const oldCopy of [
  'Functional Location (lokasi fungsional)',
  'Automatic flatbed die cutter (mesin die-cutting flatbed otomatis)',
  'Roll-to-sheet sheeter (pemotong reel menjadi lembar)',
  '300 m/min','Mekanisme fan dan actuator'
 ])assert.equal(app.includes(oldCopy),false,oldCopy);
});
