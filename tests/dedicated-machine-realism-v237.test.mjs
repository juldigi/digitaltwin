import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';

const sw=readFileSync(resolve('frontend/sw.js'),'utf8');
const withMachine=(id,fn)=>{const m=createPolishedMachineTemplate(id);try{fn(m);}finally{m.dispose();}};
const mechRoles=m=>m.meshes.map(x=>String(x.userData?.mechanismRole||''));
const visualRoles=m=>m.meshes.map(x=>String(x.userData?.role||''));
const realismRoles=m=>(m.realismMeshes||[]).map(x=>String(x.userData?.realismRole||''));

test('V237 priority dedicated machines advertise the dedicated realism pass and evidence boundary',()=>{
 const expected=new Map([
  ['BMJ-MCH-0003','V237_CD102_8L_PHOTO_SERVICE_IDENTITY'],
  ['BMJ-MCH-0005','V237_CX104_8LYYL_MODULAR_SERVICE_IDENTITY'],
  ['BMJ-MCH-0009','V237_CX104_SPECIAL_PROJECT_SERVICE_IDENTITY'],
  ['BMJ-MCH-0002','V237_HSM_CTM7_PHOTO_SERVICE_REALISM'],
  ['BMJ-MCH-0001','V237_POLAR115_EM_MON_LEGACY_SERVICE_IDENTITY'],
  ['BMJ-MCH-0010','V237_SP102_LEGACY_SERVICE_ACCESS_REALISM'],
  ['BMJ-MCH-0013','V237_MK1060ER_SERVICE_ACCESS_IDENTITY']
 ]);
 for(const [id,revision] of expected)withMachine(id,m=>{
  assert.equal(m.root.userData.visualRefinement,revision,id);
  assert.ok(String(m.root.userData.visualEvidenceBoundary||'').length>12,id);
 });
});

test('V237 Offset 5 retains photo-visible service identity in home LOD without adding process hardware',()=>{
 withMachine('BMJ-MCH-0003',m=>{
  const r=realismRoles(m);
  assert.ok(r.filter(x=>x==='operator-side-lower-service-trim').length===8);
  assert.ok(r.includes('feeder-open-rear-service-sill'));
  assert.ok(r.includes('delivery-service-fascia-reference'));
  const sill=(m.realismMeshes||[]).find(x=>x.userData?.realismRole==='feeder-open-rear-service-sill');
  assert.equal(sill?.userData.rearRemainsOpen,true);
  assert.match(m.root.userData.homeDetailGeometryPolicy,/SAME_LIVE_CD102_TEMPLATE/);
 });
});

test('V237 Offset 8 and Offset 10 keep CX104 modular/service rhythm visible in factory view',()=>{
 withMachine('BMJ-MCH-0005',m=>{
  const r=realismRoles(m);
  assert.equal(r.filter(x=>x==='cx104-operator-lower-service-band').length,8);
  assert.ok(r.includes('cx104-feeder-lower-service-band'));
  assert.ok(r.includes('cx104-delivery-lower-service-band'));
  assert.equal(m.root.userData.dryerEnergyTechnology,'UNASSERTED');
 });
 withMachine('BMJ-MCH-0009',m=>{
  const r=realismRoles(m);
  assert.ok(r.filter(x=>x==='o10-operator-lower-service-band').length>=10);
  assert.ok(r.includes('o10-feeder-service-band'));
  assert.ok(r.includes('o10-x3-delivery-service-band'));
  assert.match(m.root.userData.visualEvidenceBoundary,/NO_UNDOCUMENTED_MODULES/);
 });
});

test('V237 Sheeting adds only photo-visible service hardware and keeps cutter internals bounded',()=>{
 withMachine('BMJ-MCH-0002',m=>{
  const r=visualRoles(m);
  assert.ok(r.filter(x=>x==='main-head-service-panel-seam').length>=3);
  assert.ok(r.filter(x=>x==='main-head-service-door-handle').length>=4);
  assert.ok(r.includes('rollstand-chuck-bearing-cap'));
  assert.ok(r.includes('operator-hmi-bezel-v237'));
  assert.ok(r.filter(x=>x==='main-frame-floor-anchor-pad').length>=10);
  assert.match(m.root.userData.visualEvidenceBoundary,/NO_SPECULATIVE_INTERNAL_CUTTER/);
 });
});

test('V237 POLAR stays visibly EM-MON era and does not become a modern N115 console',()=>{
 withMachine('BMJ-MCH-0001',m=>{
  const r=mechRoles(m);
  assert.ok(r.includes('polar-em-monitor-display-bezel'));
  assert.ok(r.includes('polar-em-monitor-keypad-surround'));
  assert.ok(r.includes('polar-belt-housing-window-bezel'));
  assert.ok(r.filter(x=>x==='polar-side-table-floor-pad').length>=4);
  const bezel=m.meshes.find(x=>x.userData?.mechanismRole==='polar-em-monitor-display-bezel');
  assert.equal(bezel?.userData.modernTouchscreen,false);
  assert.match(m.root.userData.visualEvidenceBoundary,/NO_N115_TOUCHSCREEN_MODERNIZATION/);
 });
});

test('V237 SP102 adds legacy access/service cues while preserving unknown installed suffix',()=>{
 withMachine('BMJ-MCH-0010',m=>{
  const r=mechRoles(m);
  assert.ok(r.filter(x=>x==='sp102-operator-service-door-handle').length>=5);
  assert.ok(r.includes('sp102-status-display-bezel'));
  assert.ok(r.filter(x=>x==='sp102-leveling-foot-pad').length>=10);
  assert.ok(r.filter(x=>x==='sp102-operator-handrail-post').length>=4);
  assert.match(m.root.userData.visualEvidenceBoundary,/SUFFIX_UNCONFIRMED/);
 });
});

test('V237 MK1060ER gains station/service identity, guarded access and grounded chassis',()=>{
 withMachine('BMJ-MCH-0013',m=>{
  const r=mechRoles(m);
  assert.ok(r.filter(x=>x==='mk1060-guard-door-handle').length>=8);
  assert.ok(r.filter(x=>x==='mk1060-guard-window-mullion').length>=8);
  assert.ok(r.includes('mk1060-platform-handrail-top'));
  assert.ok(r.includes('mk1060-hmi-bezel'));
  assert.ok(r.filter(x=>x==='mk1060-leveling-foot-pad').length>=10);
  assert.match(m.root.userData.visualEvidenceBoundary,/NO_INSTALLATION_CAD_CLAIM/);
 });
});

test('V237 full/detail versus home low-LOD silhouettes remain tightly locked for dedicated targets',()=>{
 const ids=['BMJ-MCH-0001','BMJ-MCH-0002','BMJ-MCH-0003','BMJ-MCH-0005','BMJ-MCH-0009','BMJ-MCH-0010','BMJ-MCH-0013'];
 for(const id of ids)withMachine(id,m=>{
  m.setExteriorOpen?.(false);m.setLow?.(false);m.root.updateMatrixWorld(true);
  const full=new THREE.Box3().setFromObject(m.root),fs=full.getSize(new THREE.Vector3()),fc=full.getCenter(new THREE.Vector3());
  m.setLow?.(true);m.root.updateMatrixWorld(true);
  const low=new THREE.Box3().setFromObject(m.root),ls=low.getSize(new THREE.Vector3()),lc=low.getCenter(new THREE.Vector3());
  const ratios=fs.toArray().map((v,i)=>v>1e-6?ls.getComponent(i)/v:1);
  const drift=fc.distanceTo(lc)/Math.max(...fs.toArray(),1e-6);
  assert.ok(ratios.every(v=>v>=.86&&v<=1.14),id+' ratios '+ratios.join(','));
  assert.ok(drift<=.10,id+' drift '+drift);
 });
});

test('V237 critical wrapper details survive low LOD for the three priority offset presses',()=>{
 for(const id of ['BMJ-MCH-0003','BMJ-MCH-0005','BMJ-MCH-0009'])withMachine(id,m=>{
  const critical=(m.realismMeshes||[]).filter(x=>x.userData?.silhouetteCritical);
  assert.ok(critical.length>0,id);
  m.setLow?.(true);
  assert.ok(critical.every(x=>x.visible!==false),id);
 });
});

test('V237 refreshes shell bytes without rotating V222 public cache identifiers',()=>{
 assert.match(sw,/shell recache without rotating public query identifiers/);
 assert.match(sw,/factory-digital-twin-v222-overlay-state-ssot-20260925/);
 assert.match(sw,/const RELEASE='222'/);
});
