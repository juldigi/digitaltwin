import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {POLAR115_PHOTO_REGISTRY,POLAR115_TECHNICAL_SOURCES,polar115PhotoStats} from '../frontend/src/data/sources-polar115.js';
import {SHEETING_PHOTO_REGISTRY} from '../frontend/src/data/sources-sheeting.js';
import {normalizePhotoRegistry} from '../frontend/src/data/photo-evidence.js';

test('V276 registers all four actual BMJ POLAR photographs and keeps them aligned with source provenance',()=>{
 assert.equal(POLAR115_PHOTO_REGISTRY.length,4);
 assert.deepEqual(POLAR115_PHOTO_REGISTRY.map(photo=>photo.filename),['IMG_2488.jpeg','IMG_2489.jpeg','IMG_2490.jpeg','IMG_2491.jpeg']);
 assert.deepEqual(POLAR115_PHOTO_REGISTRY.map(photo=>photo.viewDirection),['Front','Oblique front','Rear drive','Rear feed']);
 assert.ok(POLAR115_PHOTO_REGISTRY.every(photo=>photo.confidence==='VERIFIED_VISUAL'));
 const source=POLAR115_TECHNICAL_SOURCES.find(item=>item.id==='BMJ-POLAR-PHOTOS-2026-09');
 assert.ok(source);
 assert.deepEqual(source.photoFiles,POLAR115_PHOTO_REGISTRY.map(photo=>photo.filename));
 assert.deepEqual(polar115PhotoStats(),{unique:4,total:4});
});

test('V276 normalizes legacy and current photo-registry field names for the common reference panel',()=>{
 const normalized=normalizePhotoRegistry(SHEETING_PHOTO_REGISTRY);
 assert.equal(normalized.length,9);
 assert.equal(normalized[0].filename,'IMG_2479.HEIC');
 assert.equal(normalized[0].machineZone,'rollstand-wide');
 assert.equal(normalized[0].viewDirection,'Sudut aktual BMJ');
 assert.equal(normalized[0].category,'active_geometry_reference');
 assert.equal(normalized[0].confidence,'PRIMARY_ACTUAL');
});

test('V276 app routes POLAR actual photos into the same normalized photo evidence channel as other machines',()=>{
 const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
 assert.match(app,/POLAR115_PHOTO_REGISTRY,polar115PhotoStats/);
 assert.match(app,/normalizePhotoRegistry/);
 assert.match(app,/IS_GENERIC&&MACHINE_KEY==='BMJ-MCH-0001'\?POLAR115_PHOTO_REGISTRY/);
 assert.match(app,/IS_GENERIC&&MACHINE_KEY==='BMJ-MCH-0001'\?polar115PhotoStats/);
});
