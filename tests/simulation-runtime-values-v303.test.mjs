import test from 'node:test';
import assert from 'node:assert/strict';
import {readableSimulationValue} from '../frontend/src/display-language.js';
import {auditRuntimeSimulationValuePresentation} from '../scripts/audit-simulation-runtime-values.mjs';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');

test('V303 live CtP CtF and Zünd runtime tokens have presentation labels',()=>{
 const report=auditRuntimeSimulationValuePresentation();
 assert.equal(report.targets,4);
 assert.ok(report.rows.length>=8,JSON.stringify(report.rows,null,2));
 assert.equal(report.issueCount,0,JSON.stringify(report.issues,null,2));
});

test('V303 known contact and vacuum states read naturally without mutating technical state IDs',()=>{
 const expected={
  NONE:'Belum ada kontak material',
  ENTRY_TRANSPORT:'Kontak pada transport masuk',
  REGISTER_STOPS:'Kontak pada register stop',
  CLAMP_LOAD_POSITION:'Kontak pada posisi load dan clamp',
  DRUM_SURFACE:'Kontak pada permukaan drum',
  OUTPUT_GUIDE:'Kontak pada guide keluaran',
  SUPPLY_ROLL:'Kontak pada supply roll',
  FRONT_SLACK_TENSION:'Front slack dan pengaturan tension',
  CAPSTAN_NIP_AND_EXPOSURE:'Nip capstan dan area exposure',
  REAR_SLACK_AND_CUTTER:'Rear slack dan area cutter',
  OUTPUT_HANDOFF:'Serah terima ke keluaran',
  RELEASE:'Vacuum dilepas',
  HOLD:'Vacuum menahan material'
 };
 for(const [raw,label] of Object.entries(expected))assert.equal(readableSimulationValue(raw),label,raw);
});

test('V303 generic simulation panel never writes raw PDS contact or vacuum tokens directly',()=>{
 assert.match(app,/pair\('Kontak plate \(pelat\)',readableSimulationValue\(s\.ctpMaterialContact\)\)/);
 assert.match(app,/pair\('Kontak media',readableSimulationValue\(s\.imagesetterMediaContactStage\)\)/);
 assert.match(app,/pair\('Mode vacuum \(vakum\)',readableSimulationValue\(s\.zundVacuumMode\)\)/);
});
