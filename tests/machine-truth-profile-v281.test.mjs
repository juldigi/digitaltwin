import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {machineTruthProfile} from '../frontend/src/data/machine-truth-profile.js';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');

test('V281 canonical truth profile covers all 41 registry assets with explicit maturity',()=>{
 const profiles=MACHINE_REGISTRY.map(machine=>({machine,profile:machineTruthProfile(machine)}));
 assert.equal(profiles.length,41);
 assert.ok(profiles.every(({profile})=>profile.source3D!=='UNKNOWN'));
 assert.ok(profiles.every(({profile})=>profile.dataConfidence&&profile.dataConfidence!=='UNVERIFIED'));
 assert.ok(profiles.every(({profile})=>profile.discoveryStatus&&profile.discoveryStatus!=='DOCUMENTATION_REQUIRED'));
 assert.equal(profiles.filter(({profile})=>profile.dedicated).length,20);
 assert.equal(profiles.filter(({profile})=>!profile.dedicated).length,21);
 assert.equal(profiles.filter(({profile})=>profile.simulationAvailable).length,40);
 const blocked=profiles.filter(({profile})=>profile.simulationStatus==='BLOCKED').map(({machine})=>machine.machineId);
 assert.deepEqual(blocked,['BMJ-MCH-0004']);
});

test('V281 preserves special machine truth without depending on active app state',()=>{
 assert.deepEqual(machineTruthProfile('BMJ-MCH-0003'),{
  source3D:'PROCEDURAL / PHOTO + DOCUMENT GROUNDED',
  dataConfidence:'HIGH CONFIDENCE',
  discoveryStatus:'BMJ_ACTUAL_EVIDENCE_AVAILABLE',
  simulationStatus:'VERIFIED_PROCESS_MODEL',
  dedicated:true,
  simulationAvailable:true
 });
 assert.equal(machineTruthProfile('BMJ-MCH-0002').discoveryStatus,'BMJ_ACTUAL_PHOTOSET_PRIMARY__HSM_FAMILY_PROCESS_SECONDARY');
 assert.equal(machineTruthProfile('BMJ-MCH-0009').discoveryStatus,'OFFICIAL_DOCUMENTS_AVAILABLE');
 assert.equal(machineTruthProfile('BMJ-MCH-0010').discoveryStatus,'SP102_FAMILY_REFERENCE_AVAILABLE');
});

test('V281 active-machine state and factory dialog use the same canonical truth source',()=>{
 assert.match(app,/import \{machineTruthProfile\} from '\.\/data\/machine-truth-profile\.js'/);
 assert.match(app,/const modelTruth=machineTruthProfile\(registry\)/);
 assert.match(app,/state\.asset=\{\.\.\.state\.asset,'3d_status':modelTruth\.source3D,data_confidence:modelTruth\.dataConfidence,discovery_status:modelTruth\.discoveryStatus\}/);
 assert.match(app,/const modelTruth=primary\?machineTruthProfile\(machine\):null,positionTruth=readableStatus\(positionVerification\(placement\)\)/);
 assert.match(app,/pair\('Dasar model 3D',readableStatus\(modelTruth\.source3D\)\)/);
 assert.match(app,/pair\('Detail model 3D',readableStatus\(modelTruth\.discoveryStatus\)\)/);
 assert.match(app,/pair\('Keandalan data',readableStatus\(modelTruth\.dataConfidence\)\)/);
 assert.doesNotMatch(app,/primary&&isFoundationPrimary\(machine\)\?assetTruth\(state\?\.asset/);
 assert.doesNotMatch(app,/pair\('Dasar model 3D',truth\?\.source3D\|\|machine\.source\)/);
});

test('V281 factory context localizes position and does not expose raw registry source tokens',()=>{
 assert.match(app,/pair\('Posisi',readableStatus\(positionVerification\(placement\)\)\)/);
 assert.match(app,/pair\('Sumber identitas',machine\.source==='USER_CONFIRMED'\?'Konfirmasi pengguna':'Daftar mesin BMJ'\)/);
});
