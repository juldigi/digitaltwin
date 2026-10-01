import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');

test('V286 contextual help explains every simulation run mode',()=>{
 assert.match(app,/Pilih Proses penuh untuk menjalankan tanpa jeda/);
 assert.match(app,/Tahap demi tahap untuk berhenti pada setiap pergantian tahap/);
 assert.match(app,/Mode Pelatihan untuk menjalankan lebih lambat pada 0,5× sambil menampilkan jalur proses dan berhenti otomatis tiap tahap/);
});
