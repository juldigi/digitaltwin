import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readableEvidenceConfidence,readablePhotoCategory} from '../frontend/src/display-language.js';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');

test('V280 translates the complete source-confidence vocabulary without flattening evidence nuance',()=>{
 const cases=new Map([
  ['VERIFIED','Terverifikasi'],
  ['VERIFIED_VISUAL','Terverifikasi secara visual'],
  ['PRIMARY_ACTUAL','Foto aktual BMJ · sumber utama'],
  ['VERIFIED_BOUNDARY','Batas verifikasi terdokumentasi'],
  ['CORROBORATED','Dikuatkan oleh sumber pembanding'],
  ['MODEL_REFERENCE','Referensi model'],
  ['FAMILY_REFERENCE','Referensi keluarga mesin'],
  ['MODEL_FAMILY_REFERENCE','Referensi keluarga model'],
  ['HIGH-FAMILY / LOW-EXACT','Kecocokan keluarga tinggi · ketepatan model spesifik rendah'],
  ['MEDIUM-FAMILY / LOW-EXACT','Kecocokan keluarga sedang · ketepatan model spesifik rendah'],
  ['MEDIUM-FAMILY','Kecocokan keluarga sedang'],
  ['LOW-FAMILY / NO-GEOMETRY','Kecocokan keluarga rendah · bukan sumber geometri'],
  ['LOW-VISUAL-FOR-HSM_CTM7','Referensi visual lemah untuk HSM-CTM7'],
  ['PROCESS-GENERIC','Referensi proses umum'],
  ['PROCESS-GENERIC / NOT BMJ CUTTER PROOF','Referensi proses umum · bukan bukti cutter BMJ'],
  ['USER-CONFIRMED','Dikonfirmasi oleh pengguna']
 ]);
 for(const [raw,label] of cases)assert.equal(readableEvidenceConfidence(raw),label,raw);
});

test('V280 presents photo categories as readable labels while preserving technical category identity in data',()=>{
 assert.equal(readablePhotoCategory('active_geometry_reference'),'Acuan geometri aktif');
 assert.equal(readablePhotoCategory('supplementary_reference'),'Referensi tambahan');
 assert.equal(readablePhotoCategory('orientation_reference'),'Referensi orientasi');
 assert.equal(readablePhotoCategory('detail_reference'),'Referensi detail');
 assert.equal(readablePhotoCategory('custom_evidence'),'custom evidence');
});

test('V280 reference cards use evidence-specific presentation instead of generic truth coercion',()=>{
 assert.match(app,/readableEvidenceConfidence\(p\.confidence\)/);
 assert.match(app,/readableEvidenceConfidence\(src\.confidence\)/);
 assert.match(app,/readablePhotoCategory\(p\.category\)/);
 assert.doesNotMatch(app,/truthStatus\(src\.confidence/);
 assert.doesNotMatch(app,/truthStatus\(p\.confidence/);
});
