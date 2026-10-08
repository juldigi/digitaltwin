import test from 'node:test';
import assert from 'node:assert/strict';
import {FLEET_PHOTO_REVIEW,FLEET_PHOTO_COVERAGE,photoReviewForObject} from '../frontend/src/data/fleet-photo-review-v354.js';

test('fleet photo coverage never promotes family images or unresolved views to installed evidence',()=>{
 assert.equal(FLEET_PHOTO_COVERAGE.length,41);
 assert.equal(new Set(FLEET_PHOTO_COVERAGE.map(row=>row.objectId)).size,41);
 assert.deepEqual(FLEET_PHOTO_COVERAGE.filter(row=>row.uniqueActual).map(row=>row.objectId),['BMJ-MCH-0001','BMJ-MCH-0002','BMJ-MCH-0003']);
 for(const row of FLEET_PHOTO_COVERAGE.filter(row=>!row.uniqueActual))assert.equal(row.status,'NO_RESOLVED_ACTUAL_PHOTO');
 for(const row of FLEET_PHOTO_REVIEW.records.filter(row=>['external_family','generated_diagram','context_candidate'].includes(row.kind)))assert.equal(row.objectId,null);
});

test('photo aliases and the installed roller diagram do not inflate actual-photo coverage',()=>{
 const offset=photoReviewForObject('BMJ-MCH-0003');
 assert.equal(offset.actualFiles,46);
 assert.equal(offset.uniqueActual,45);
 assert.equal(offset.diagramCount,1);
 const records=FLEET_PHOTO_REVIEW.records;
 for(const alias of records.filter(row=>row.kind==='actual_alias')){
  const original=records.find(row=>row.filename===alias.duplicateOf);
  assert.ok(original);
  assert.equal(alias.sha256,original.sha256);
  assert.equal(alias.objectId,original.objectId);
 }
 const physical=records.filter(row=>row.kind==='actual');
 assert.equal(new Set(physical.map(row=>row.sha256)).size,73);
 assert.equal(photoReviewForObject('IPAL').uniqueActual,15);
});

test('context imagery and a partial IPAL view retain their evidence boundaries',()=>{
 const office=photoReviewForObject('OFFICE_EXTERIOR');
 assert.equal(office.uniqueActual,0);
 assert.equal(photoReviewForObject('PRODUCTION_STORAGE_CONTEXT').uniqueActual,0);
 assert.match(FLEET_PHOTO_REVIEW.records.find(row=>row.filename==='IMG_2518.HEIC').scope,/Partial decoded view/);
 assert.match(photoReviewForObject('BMJ-MCH-0003').boundary,/simulasi belum terverifikasi/);
});
