import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';

const sw=readFileSync(resolve('frontend/sw.js'),'utf8');
const withMachine=(id,fn)=>{const m=createPolishedMachineTemplate(id);try{fn(m);}finally{m.dispose();}};
const roles=m=>m.meshes.map(x=>String(x.userData?.mechanismRole||''));

test('V238 priority repolish reaches gravure SX52 FZ1200 and LY300',()=>{
 const expected=new Map([
  ['BMJ-MCH-0004','V238_YA1A1A_SERVICE_PROCESS_REPOLISH'],
  ['BMJ-MCH-0006','V238_SX52_4L_SERVICE_ACCESS_REPOLISH'],
  ['BMJ-MCH-0007','V238_FZ1200_OPEN_CRADLE_MECHANICAL_REPOLISH'],
  ['BMJ-MCH-0008','V238_FZ1200_OPEN_CRADLE_MECHANICAL_REPOLISH'],
  ['BMJ-MCH-0022','V238_FZ1200_OPEN_CRADLE_MECHANICAL_REPOLISH'],
  ['BMJ-MCH-0024','V238_UPG_LY300_MODEL_SERVICE_REPOLISH']
 ]);
 for(const [id,revision] of expected)withMachine(id,m=>{
  assert.equal(m.root.userData.visualRefinement,revision,id);
  assert.equal(m.root.userData.repolishRevision,'V238',id);
  assert.ok(String(m.root.userData.visualEvidenceBoundary||m.root.userData.familyEvidenceBoundary||'').length>12,id);
 });
});

test('V238 SX52 gains station identity access hardware and grounded chassis without asserting options',()=>{
 withMachine('BMJ-MCH-0006',m=>{
  const r=roles(m);
  assert.equal(r.filter(x=>x==='sx52-operator-lower-service-band').length,5);
  assert.ok(r.filter(x=>x==='sx52-service-door-handle').length>=5);
  assert.ok(r.includes('sx52-feeder-service-sill'));
  assert.ok(r.includes('sx52-delivery-service-window'));
  assert.ok(r.filter(x=>x==='sx52-leveling-foot-pad').length>=12);
  assert.ok(r.includes('sx52-console-display-bezel'));
  assert.match(m.root.userData.visualEvidenceBoundary,/OPTION_PACKAGE_UNVERIFIED/);
 });
});

test('V238 FZ1200 reads as a heavy installed pile-turner with supported trunnions hydraulics and anchors',()=>{
 for(const id of ['BMJ-MCH-0007','BMJ-MCH-0008','BMJ-MCH-0022'])withMachine(id,m=>{
  const r=roles(m);
  assert.equal(r.filter(x=>x==='fz1200-trunnion-bearing-bolster').length,2);
  assert.equal(r.filter(x=>x==='fz1200-trunnion-bearing-cap').length,2);
  assert.ok(r.includes('fz1200-hydraulic-hose-retainer'));
  assert.ok(r.includes('fz1200-powerpack-cover-latch'));
  assert.ok(r.includes('fz1200-hmi-display-bezel'));
  assert.equal(r.filter(x=>x==='fz1200-floor-anchor-pad').length,4);
  assert.match(m.root.userData.visualEvidenceBoundary,/BMJ_OEM_SERIAL_GUARD_LAYOUT_UNVERIFIED/);
 });
});

test('V238 LY300 keeps OEM long-low envelope while adding physically serviceable modules',()=>{
 withMachine('BMJ-MCH-0024',m=>{
  assert.deepEqual(m.root.userData.oemPublishedEnvelopeMm,[4230,720,1700]);
  const r=roles(m);
  assert.ok(r.filter(x=>x==='ly300-service-door-latch').length>=5);
  assert.ok(r.includes('ly300-cable-tray-reference'));
  assert.ok(r.includes('ly300-print-zone-window-bezel'));
  assert.ok(r.includes('ly300-uv-hood-latch'));
  assert.ok(r.includes('ly300-hmi-bezel'));
  assert.ok(r.filter(x=>x==='ly300-leveling-foot-pad').length>=10);
  const strap=m.findNode('ly300-collect-strap');
  assert.equal(strap?.userData.installedStrapperVerified,false);
 });
});

test('V238 YA1A1A gets service realism while transport-drive simulation remains blocked',()=>{
 withMachine('BMJ-MCH-0004',m=>{
  const r=roles(m);
  assert.ok(r.filter(x=>x==='gravure-end-cabinet-vent-louvre').length>=8);
  assert.ok(r.includes('gravure-cylinder-bearing-service-cap'));
  assert.ok(r.includes('gravure-ink-pan-drain-reference'));
  assert.ok(r.includes('gravure-doctor-pressure-adjuster-reference'));
  assert.ok(r.includes('gravure-dryer-exhaust-flange-reference'));
  assert.ok(r.includes('gravure-operator-console-family-reference'));
  assert.match(m.root.userData.simulationStatus,/BLOCKED_PENDING_YA1A1A_TRANSPORT_DRIVE_VERIFICATION/);
  assert.match(m.root.userData.familyEvidenceBoundary,/BMJ_INSTALLED_ENCLOSURE_TRANSFER_DRIVE_DRYER_UNVERIFIED/);
  assert.equal(m.findNode('o7-dryer-exhaust')?.userData.installedDryerTechnologyVerified,false);
 });
});

test('V238 priority repolish remains finite and keeps home/detail silhouettes locked',()=>{
 const ids=['BMJ-MCH-0004','BMJ-MCH-0006','BMJ-MCH-0007','BMJ-MCH-0008','BMJ-MCH-0022','BMJ-MCH-0024'];
 for(const id of ids)withMachine(id,m=>{
  m.setExteriorOpen?.(false);m.setLow?.(false);m.root.updateMatrixWorld(true);
  const full=new THREE.Box3().setFromObject(m.root),fs=full.getSize(new THREE.Vector3()),fc=full.getCenter(new THREE.Vector3());
  m.setLow?.(true);m.root.updateMatrixWorld(true);
  const low=new THREE.Box3().setFromObject(m.root),ls=low.getSize(new THREE.Vector3()),lc=low.getCenter(new THREE.Vector3());
  for(const v of [...full.min.toArray(),...full.max.toArray(),...fs.toArray()])assert.ok(Number.isFinite(v),id);
  const ratios=fs.toArray().map((v,i)=>v>1e-6?ls.getComponent(i)/v:1);
  const drift=fc.distanceTo(lc)/Math.max(...fs.toArray(),1e-6);
  assert.ok(ratios.every(v=>v>=.86&&v<=1.14),id+' ratios '+ratios.join(','));
  assert.ok(drift<=.10,id+' drift '+drift);
 });
});

test('V238 refreshes shell bytes without rotating V222 public cache identifiers',()=>{
 assert.match(sw,/V238 priority machine repolish pass 2/);
 assert.match(sw,/factory-digital-twin-v222-overlay-state-ssot-20260925/);
 assert.match(sw,/const RELEASE='222'/);
});
