import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assetTruth} from '../frontend/src/data/truth-status.js';
import {readableStatus} from '../frontend/src/display-language.js';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');

test('V279 asset truth preserves machine-specific 3D maturity and evidence grade instead of flattening everything',()=>{
 const dedicated=assetTruth({
  '3d_status':'DEDICATED PROCEDURAL / DEDICATED_OFFICIAL_FAMILY_REFERENCE',
  data_confidence:'DOCUMENT_GROUNDED',
  discovery_status:'DEDICATED_EVIDENCE_AVAILABLE'
 });
 assert.equal(dedicated.source3D,'DEDICATED PROCEDURAL / DEDICATED_OFFICIAL_FAMILY_REFERENCE');
 assert.equal(dedicated.detail3D,'DEDICATED_EVIDENCE_AVAILABLE');
 assert.equal(dedicated.dataConfidence,'DOCUMENT_GROUNDED');

 const family=assetTruth({
  '3d_status':'REFERENCE PROCEDURAL / HEIDELBERG_SUPRASETTER_MULTI_MODEL_FAMILY_REFERENCE',
  data_confidence:'OEM_MULTI_MODEL_FAMILY_REFERENCE',
  discovery_status:'FAMILY_REFERENCE_AVAILABLE'
 });
 assert.equal(family.source3D,'REFERENCE PROCEDURAL / HEIDELBERG_SUPRASETTER_MULTI_MODEL_FAMILY_REFERENCE');
 assert.equal(family.detail3D,'FAMILY_REFERENCE_AVAILABLE');
 assert.equal(family.dataConfidence,'OEM_MULTI_MODEL_FAMILY_REFERENCE');

 const blocked=assetTruth({
  '3d_status':'PROCEDURAL / YA1A1A_EXACT_IDENTITY__SHEETFED_GRAVURE_MECHANISM_REFERENCE',
  data_confidence:'MODEL_IDENTIFIED_PROCESS_GROUNDED',
  discovery_status:'EVIDENCE_BOUNDED_REFERENCE'
 });
 assert.equal(blocked.detail3D,'EVIDENCE_BOUNDED_REFERENCE');
});

test('V279 readable status clearly distinguishes dedicated, family-reference and evidence-bounded models in Indonesian',()=>{
 assert.equal(readableStatus('DEDICATED PROCEDURAL / DEDICATED_OFFICIAL_FAMILY_REFERENCE'),'Model 3D khusus; Model khusus berdasarkan referensi resmi keluarga mesin');
 assert.equal(readableStatus('REFERENCE PROCEDURAL / HEIDELBERG_SUPRASETTER_MULTI_MODEL_FAMILY_REFERENCE'),'Model 3D acuan; Model keluarga Heidelberg Suprasetter');
 assert.equal(readableStatus('EVIDENCE_BOUNDED_REFERENCE'),'Model acuan; bukti masih dibatasi sumber yang tersedia');
});

test('V279 evidence and data panels localize truth-layer values before presenting them',()=>{
 assert.match(app,/pair\('Status operasi',readableStatus\(truth\.operatingStatus\)\)/);
 assert.match(app,/pair\('Dasar model 3D',readableStatus\(truth\.source3D\)\)/);
 assert.match(app,/pair\('Detail model 3D',readableStatus\(truth\.detail3D\)\)/);
 assert.match(app,/pair\('Keandalan data',readableStatus\(truth\.dataConfidence\)\)/);
 assert.match(app,/pair\('Posisi',readableStatus\(truth\.position\)\)/);
 assert.match(app,/\['Sumber model 3D',readableStatus\(truth\.source3D\)\]/);
 assert.match(app,/\['Status penelusuran',readableStatus\(truth\.discoveryStatus\)\]/);
});
