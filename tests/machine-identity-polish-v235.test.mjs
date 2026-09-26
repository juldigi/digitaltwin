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

test('V235 Diana Eye 55 keeps white inspection cell and separate HMI pedestal',()=>{
 withMachine('BMJ-MCH-0019',m=>{
  assert.equal(m.root.userData.visualRefinement,'V235_DIANA_EYE55_WHITE_INSPECTION_CELL_WITH_HMI_PEDESTAL');
  assert.match(m.root.userData.visualEvidenceBoundary,/HEIDELBERG_MASTERWORK_DIANA_EYE_42_55_OFFICIAL/);
  assert.ok(findRole(m,/diana-eye-hmi-display-reference/));
  const aperture=m.meshes.find(x=>x.userData?.inspectionAperture);
  assert.ok(aperture?.userData.silhouetteCritical);
 });
});

test('V235 SHARK N650 keeps white tower dark base blue stripe and operator HMI',()=>{
 withMachine('BMJ-MCH-0020',m=>{
  assert.equal(m.root.userData.visualRefinement,'V235_SHARK_N650_WHITE_TOWER_DARK_BASE_BLUE_STRIPE_HMI');
  assert.match(m.root.userData.visualEvidenceBoundary,/FOCUSIGHT_N650_PRIMARY_PRODUCT_VISUALS/);
  assert.ok(findRole(m,/shark-hmi-display-reference/));
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
