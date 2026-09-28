import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';

const sw=readFileSync(resolve('frontend/sw.js'),'utf8');
const withMachine=(id,fn)=>{const m=createPolishedMachineTemplate(id);try{fn(m);}finally{m.dispose();}};
const findRole=(m,re)=>m.meshes.find(x=>re.test(String(x.userData?.mechanismRole||'')));

test('V235 MK920 YMI uses archive-consistent white gray body with magenta identity stripe',()=>{
 withMachine('BMJ-MCH-0011',m=>{
  assert.equal(m.root.userData.visualRefinement,'V235_MK920YMI_WHITE_GRAY_MAGENTA_ARCHIVE_IDENTITY');
  assert.match(m.root.userData.visualEvidenceBoundary,/MK920YMI_PUBLIC_MACHINE_IMAGES/);
  const stripe=findRole(m,/mk920-magenta-family-stripe/);
  const aperture=findRole(m,/mk920-operator-service-aperture/);
  assert.ok(stripe?.userData.silhouetteCritical);
  assert.ok(aperture?.userData.silhouetteCritical);
 });
});

test('V235 Promatrix 106 CSB carries official-family process windows control spine and wide access stairs',()=>{
 withMachine('BMJ-MCH-0014',m=>{
  assert.equal(m.root.userData.visualRefinement,'V235_PROMATRIX106_CSB_OFFICIAL_VISUAL_IDENTITY');
  assert.match(m.root.userData.visualEvidenceBoundary,/HEIDELBERG_PROMATRIX106_CSB_OFFICIAL_MACHINE_IMAGES/);
  assert.ok(findRole(m,/promatrix-process-window-reference/)?.userData.silhouetteCritical);
  assert.ok(findRole(m,/promatrix-control-spine-reference/)?.userData.silhouetteCritical);
  assert.ok(findRole(m,/promatrix-access-step-reference/)?.userData.silhouetteCritical);
 });
});

test('V235 MEDIA 100 II remains long open-frame and keeps repeated adjustment hardware',()=>{
 withMachine('BMJ-MCH-0016',m=>{
  assert.equal(m.root.userData.visualRefinement,'V235_MEDIA100II_OPEN_WHITE_RAIL_BLACK_HANDWHEEL_IDENTITY');
  assert.match(m.root.userData.visualEvidenceBoundary,/MEDIA100II_USED_MACHINE_VISUALS/);
  const wheels=m.meshes.filter(x=>String(x.userData?.mechanismRole||'')==='adjustment-handwheel');
  assert.ok(wheels.length>=6);
  const b=new THREE.Box3().setFromObject(m.root),s=b.getSize(new THREE.Vector3());
  assert.ok(s.x>9&&s.z<3.5,'MEDIA 100 II should remain a long narrow folder-gluer');
 });
});

test('V255 Diana Eye 55 keeps the OEM low-feeder inspection-cell and separate HMI identity',()=>{
 withMachine('BMJ-MCH-0019',m=>{
  assert.match(m.root.userData.visualEvidenceBoundary,/MASTERWORK_HEIDELBERG_CURRENT_DIANA_EYE55/);
  assert.ok(findRole(m,/diana-eye-hmi-display-reference/));
  assert.equal(m.findNode('diana55-delivery-stack')?.userData.deliveryMode,'FISH_SCALE_STANDARD_REFERENCE');
  const aperture=m.meshes.find(x=>x.userData?.inspectionAperture);
  assert.ok(aperture?.userData.silhouetteCritical);
 });
});

test('V254 SHARK N650 keeps its long low chassis, single vision tower, blue stripe and operator HMI',()=>{
 withMachine('BMJ-MCH-0020',m=>{
  assert.match(m.root.userData.visualEvidenceBoundary,/FOCUSIGHT_N650_PRIMARY/);
  assert.ok(findRole(m,/shark-hmi-display-reference/));
  assert.equal(m.findNode('shark650-process-hmi')?.visible,false);
  assert.equal(m.findNode('shark650-access-platform')?.visible,false);
  assert.ok(m.findNode('shark650-local-service-step-v254'));
  assert.equal(m.findNode('shark650-return')?.userData.officialGoodBadReturnLine,true);
  const stripes=m.meshes.filter(x=>x.userData?.familyAccent&&x.userData?.silhouetteCritical);
  assert.ok(stripes.length>=2);
 });
});

test('V235 identity-polished machines remain finite and home/detail silhouette lock still holds',()=>{
 for(const id of ['BMJ-MCH-0011','BMJ-MCH-0012','BMJ-MCH-0014','BMJ-MCH-0015','BMJ-MCH-0016','BMJ-MCH-0018','BMJ-MCH-0019','BMJ-MCH-0020'])withMachine(id,m=>{
  m.root.updateMatrixWorld(true);const full=new THREE.Box3().setFromObject(m.root),fs=full.getSize(new THREE.Vector3()),fc=full.getCenter(new THREE.Vector3());
  m.setLow?.(true);m.root.updateMatrixWorld(true);const low=new THREE.Box3().setFromObject(m.root),ls=low.getSize(new THREE.Vector3()),lc=low.getCenter(new THREE.Vector3());
  const ratios=fs.toArray().map((v,i)=>v>1e-6?ls.getComponent(i)/v:1);
  const drift=fc.distanceTo(lc)/Math.max(...fs.toArray(),1e-6);
  assert.ok(ratios.every(v=>v>=.86&&v<=1.14),id+' '+ratios.join(','));
  assert.ok(drift<=.10,id+' drift '+drift);
  for(const v of [...full.min.toArray(),...full.max.toArray(),...fs.toArray()])assert.ok(Number.isFinite(v),id);
 });
});

test('V235 shell marker changes without rotating V222 public cache identifiers',()=>{
 assert.match(sw,/shell recache without rotating public query identifiers/);
 assert.match(sw,/factory-digital-twin-v222-overlay-state-ssot-20260925/);
 assert.match(sw,/const RELEASE='222'/);
});
