import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TRUTH_STATUSES,truthStatus,positionVerification,layoutTruth,assetTruth,connectionTruth} from '../frontend/src/data/truth-status.js';

const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('truth layer preserves the master-prompt verification vocabulary',()=>{
  for(const value of ['VERIFIED','HIGH CONFIDENCE','MEDIUM CONFIDENCE','ESTIMATED','UNKNOWN','UNVERIFIED','APPROXIMATE','CONFLICTING'])assert.ok(TRUTH_STATUSES.includes(value));
  assert.equal(truthStatus('conflicting header'),'CONFLICTING');
  assert.equal(truthStatus('belum terverifikasi'),'UNVERIFIED');
  assert.equal(truthStatus(null),'UNKNOWN');
});

test('position truth distinguishes CAD footprints from weaker placement evidence',()=>{
  assert.equal(positionVerification({status:'DXF_FOOTPRINT'}),'DWG-VERIFIED');
  assert.equal(positionVerification({status:'USER-CONFIRMED'}),'USER-CONFIRMED');
  assert.equal(positionVerification({status:'DXF_LABEL'}),'APPROXIMATE');
  assert.equal(positionVerification({status:'DXF_ZONE'}),'APPROXIMATE');
  assert.equal(positionVerification({status:'UNIDENTIFIED'}),'UNKNOWN');
});

test('layout truth reports the current unit conflict and approximate elevation without hiding them',()=>{
  const truth=layoutTruth({
    baselineId:'BMJ-250804',
    source:{file:'250804 layout offset.dxf',unitStatus:'CONFLICTING HEADER / CALIBRATED TO mm'},
    transform:{sourceUnits:'drawing-unit',scale:.01},
    audit:{sourceFinding:'DXF source; elevasi dan lanskap perkiraan visual.'},
    positionStatus:'BASELINE REVISI PENGGUNA'
  });
  assert.equal(truth.source,'DWG');
  assert.equal(truth.scale,'CONFLICTING');
  assert.equal(truth.planGeometry,'HIGH CONFIDENCE');
  assert.equal(truth.elevation,'APPROXIMATE');
});

test('asset truth never converts unavailable operating or health data into fake values',()=>{
  const truth=assetTruth({status:'UNKNOWN',health_score:null,data_confidence:'UNVERIFIED',discovery_status:'DOCUMENTATION_REQUIRED'},{placement:{status:'DXF_FOOTPRINT'},sourceCount:8});
  assert.equal(truth.operatingStatus,'UNKNOWN');
  assert.equal(truth.healthScore,'UNKNOWN');
  assert.equal(truth.source3D,'PROCEDURAL / RECONSTRUCTED');
  assert.equal(truth.detail3D,'PARTIAL / APPROXIMATE');
  assert.equal(truth.position,'DWG-VERIFIED');
  assert.equal(truth.sourceCount,8);
});

test('offline state explicitly distinguishes cached data from local-only mode',()=>{
  assert.equal(connectionTruth({online:false,cached:true,connected:true}),'OFFLINE / CACHED DATA');
  assert.equal(connectionTruth({online:false,cached:false,connected:false}),'OFFLINE / MODE LOKAL');
  assert.equal(connectionTruth({online:true,cached:true,connected:false}),'CACHED DATA');
});

test('production UI exposes source confidence and explicit truth statuses',()=>{
  assert.match(app,/pair\('3D source',truth\.source3D\)/);
  assert.match(app,/pair\('3D detail',truth\.detail3D\)/);
  assert.match(app,/pair\('Data confidence',truth\.dataConfidence\)/);
  assert.match(app,/pair\('Health score',truth\.healthScore\)/);
  assert.match(app,/UNKNOWN, UNVERIFIED, APPROXIMATE, dan CONFLICTING/);
  assert.match(app,/reference-truth-row/);
  assert.match(app,/truthStatus\(src\.confidence,'UNVERIFIED'\)/);
  assert.match(app,/truthStatus\(p\.confidence,'UNVERIFIED'\)/);
  assert.match(app,/DWG · \$\{truth\.planGeometry\}/);
  assert.match(app,/Skala · \$\{truth\.scale\}/);
  assert.doesNotMatch(app,/\$\('#lod-status'\)\.textContent=view==='factory'\?'Denah siap':'Model siap'/);
  assert.match(css,/\.reference-truth-row/);
});

test('V154 cache and shell identifiers include the truth layer',()=>{
  assert.match(html,/app-shell-v79\.css\?v=157/);
  assert.match(html,/src\/app\.js\?v=157/);
  assert.match(html,/src\/app-shell-v79\.js\?v=157/);
  assert.match(shell,/uiArchitecture='v157-phase1-interaction-integrity'/);
  assert.match(sw,/factory-digital-twin-v157-interaction-integrity-20260922/);
  assert.match(sw,/src\/data\/truth-status\.js/);
});
