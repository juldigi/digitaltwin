import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {machineEvidenceNote} from '../frontend/src/data/machine-evidence-note.js';

test('V300 evidence note claims actual photos only when photos are actually registered',()=>{
 const withPhotos=machineEvidenceNote({dedicated:true,simulationAvailable:true,photoCount:4,sourceCount:3});
 assert.match(withPhotos,/4 foto aktual/);
 const withoutPhotos=machineEvidenceNote({dedicated:true,simulationAvailable:true,photoCount:0,sourceCount:5});
 assert.doesNotMatch(withoutPhotos,/menggunakan .*foto aktual/);
 assert.match(withoutPhotos,/Foto aktual tidak diklaim tersedia/);
});

test('V300 family-reference and blocked notes do not imply serial-specific geometry',()=>{
 const family=machineEvidenceNote({dedicated:false,simulationAvailable:true,photoCount:0,sourceCount:2});
 assert.match(family,/acuan/);assert.match(family,/bukan klaim geometri serial-spesifik/);
 const blocked=machineEvidenceNote({dedicated:false,simulationAvailable:false,photoCount:0,sourceCount:1});
 assert.match(blocked,/Simulasi belum diaktifkan karena bukti proses belum cukup/);
 assert.match(blocked,/detail serial-spesifik tidak diasumsikan/);
});

test('V300 app replaces the generic photo-and-document overclaim with evidence-aware note',()=>{
 const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
 assert.match(app,/machineEvidenceNote\(\{dedicated:genericTruth\.dedicated,simulationAvailable:genericTruth\.simulationAvailable,photoCount:PHOTO_REGISTRY\.length,sourceCount:TECHNICAL_SOURCES\.length\}\)/);
 assert.doesNotMatch(app,/'Model dibuat berdasarkan foto dan dokumen mesin yang tersedia\.'/);
});
