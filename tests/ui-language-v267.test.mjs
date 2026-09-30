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
 assert.match(app,/Tutup editor\?/);
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
