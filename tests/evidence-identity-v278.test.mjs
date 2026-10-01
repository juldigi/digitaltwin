import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MACHINE_REGISTRY_BY_ID} from '../frontend/src/data/machine-registry.js';
import {universalMachineConfig} from '../frontend/src/universal-machine.js';
import {normalizePhotoRegistry} from '../frontend/src/data/photo-evidence.js';
import {SHEETING_PHOTO_REGISTRY} from '../frontend/src/data/sources-sheeting.js';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');

test('V278 separates simulation availability from dedicated-model truth',()=>{
 const dedicated=universalMachineConfig('BMJ-MCH-0001');
 const family=universalMachineConfig('BMJ-MCH-0017');
 const blocked=universalMachineConfig('BMJ-MCH-0004');
 assert.equal(dedicated.evidence.simulation,'VERIFIED_PROCESS_MODEL');
 assert.equal(family.evidence.simulation,'FAMILY_PROCESS_MODEL');
 assert.equal(blocked.evidence.simulation,'BLOCKED');
 assert.match(app,/IS_DEDICATED_REGISTRY_MODEL=IS_GENERIC&&GENERIC_CONFIG\.evidence\.simulation==='VERIFIED_PROCESS_MODEL'/);
 assert.match(app,/IS_VERIFIED_REGISTRY_SIM=IS_GENERIC&&\['VERIFIED_PROCESS_MODEL','FAMILY_PROCESS_MODEL'\]\.includes\(GENERIC_CONFIG\.evidence\.simulation\)/);
 assert.match(app,/const modelTruth=machineTruthProfile\(registry\)/);
 assert.match(app,/'3d_status':modelTruth\.source3D/);
 assert.match(app,/IS_DEDICATED_REGISTRY_MODEL\?'Model khusus berbasis sumber':IS_VERIFIED_REGISTRY_SIM\?'Model acuan proses keluarga'/);
});

test('V278 keeps family-reference simulations available without presenting them as serial-specific models',()=>{
 assert.match(app,/else if\(IS_GENERIC&&IS_VERIFIED_REGISTRY_SIM\)/);
 assert.match(app,/discovery_status:modelTruth\.discoveryStatus/);
});

test('V278 fills manufacturer only from identifiable registry/model evidence and separates registry identity from actual photos',()=>{
 for(const id of ['BMJ-MCH-0005','BMJ-MCH-0019','BMJ-MCH-0025','BMJ-MCH-0029','BMJ-MCH-0031','BMJ-MCH-0040'])assert.ok(MACHINE_REGISTRY_BY_ID.get(id));
 assert.match(app,/const registryMaker=registryBrand\(registry\),verifiedMaker=registryMaker==='Belum teridentifikasi'\?null:registryMaker/);
 assert.match(app,/manufacturer:verifiedMaker/);
 assert.match(app,/pair\('Identitas daftar mesin',state\?\.asset\?\.asset_id\?'Tersedia':'Belum tersedia'\)/);
 assert.match(app,/pair\('Foto aktual',photos\?photos\+' foto':'Belum tersedia'\)/);
 assert.doesNotMatch(app,/Foto aktual atau daftar mesin/);
});

test('V278 presents actual-photo labels in readable Indonesian while preserving technical terms',()=>{
 const photos=normalizePhotoRegistry(SHEETING_PHOTO_REGISTRY);
 assert.equal(photos[0].machineZone,'Rollstand · tampak lebar');
 assert.equal(photos[1].machineZone,'Rollstand menuju cutter');
 assert.equal(photos[8].machineZone,'LEXUS inspection window dan nip');
 assert.equal(photos[0].view,'rollstand-wide','source slug must remain intact for provenance');
});
