import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';

const sw=readFileSync(resolve('frontend/sw.js'),'utf8');
const withMachine=(id,fn)=>{const m=createPolishedMachineTemplate(id);try{fn(m);}finally{m.dispose();}};
const roles=m=>m.meshes.map(x=>String(x.userData?.mechanismRole||''));

test('V236 remaining reference machines receive a third mechanical realism pass',()=>{
 const ids=['BMJ-MCH-0017','BMJ-MCH-0021','BMJ-MCH-0023','BMJ-MCH-0025','BMJ-MCH-0026','BMJ-MCH-0027','BMJ-MCH-0028',
  'BMJ-MCH-0029','BMJ-MCH-0030','BMJ-MCH-0031','BMJ-MCH-0032','BMJ-MCH-0033','BMJ-MCH-0034','BMJ-MCH-0035',
  'BMJ-MCH-0036','BMJ-MCH-0037','BMJ-MCH-0038','BMJ-MCH-0039','BMJ-MCH-0040','BMJ-MCH-0041'];
 for(const id of ids)withMachine(id,m=>{
  assert.equal(m.root.userData.mechanicalRealismRevision,'V236',id);
  assert.match(m.root.userData.mechanicalRealismPolicy,/NO_UNVERIFIED_INSTALLED_OPTION_ASSERTION/,id);
 });
});

test('V236 FGM-2 reads as a long open-frame folder gluer with service rails and repeated adjustments',()=>{
 withMachine('BMJ-MCH-0017',m=>{
  assert.equal(m.root.userData.visualRefinement,'V236_FGM2_OPEN_FRAME_SERVICE_REALISM');
  const r=roles(m);
  assert.ok(r.filter(x=>x==='folder-gluer-longitudinal-service-rail').length>=2);
  assert.ok(r.filter(x=>x==='folder-gluer-section-bridge-reference').length>=5);
  assert.ok(r.filter(x=>x==='folder-gluer-adjustment-handwheel-reference').length>=8);
  assert.ok(r.includes('folder-gluer-control-service-door'));
  const b=new THREE.Box3().setFromObject(m.root),s=b.getSize(new THREE.Vector3());
  assert.ok(s.x>8&&s.x/s.z>3.5,'FGM-2 must remain a long narrow machine');
 });
});

test('V236 QF blanker gains hydraulic service equipment, servo cable carrier and operator station without asserting exact model',()=>{
 withMachine('BMJ-MCH-0021',m=>{
  assert.equal(m.root.userData.visualRefinement,'V236_QF100CS_HYDRAULIC_BLANKER_SERVICE_REALISM');
  const r=roles(m);
  assert.ok(r.includes('blanker-hydraulic-reservoir-family-reference'));
  assert.ok(r.includes('blanker-hydraulic-pump-reference'));
  assert.ok(r.filter(x=>x==='blanker-servo-cable-carrier-link').length>=12);
  assert.ok(r.includes('blanker-emergency-stop-reference'));
 });
});

test('V236 collator preserves unknown installed bin count while adding tower-level suction and control realism',()=>{
 withMachine('BMJ-MCH-0023',m=>{
  assert.equal(m.root.userData.visualRefinement,'V236_COLLATOR_TOWER_SERVICE_REALISM');
  const g=m.findNode('collator-service-v236');
  assert.equal(g?.userData.referenceBinCount,10);
  assert.equal(g?.userData.installedBinCountVerified,false);
  const r=roles(m);
  assert.ok(r.filter(x=>x==='collator-bin-front-lip-reference').length>=10);
  assert.ok(r.includes('collator-vacuum-manifold-reference'));
  assert.ok(r.includes('collator-hmi-reference'));
 });
});

test('V236 Suprasetter and SCREEN references look like serviceable prepress cabinets, not generic module boxes',()=>{
 for(const id of ['BMJ-MCH-0025','BMJ-MCH-0026'])withMachine(id,m=>{
  assert.equal(m.root.userData.visualRefinement,'V236_SUPRASETTER_SERVICE_PANEL_REALISM');
  const r=roles(m);
  assert.ok(r.filter(x=>x==='ctp-cooling-vent-bank-reference').length>=8);
  assert.ok(r.includes('ctp-entry-slot-bezel-reference'));
  assert.ok(r.includes('ctp-hmi-bezel-reference'));
 });
 withMachine('BMJ-MCH-0027',m=>{
  assert.equal(m.root.userData.visualRefinement,'V236_SCREEN_IMAGESETTER_SERVICE_REALISM');
  const r=roles(m);
  assert.ok(r.includes('ctf-media-cassette-service-door'));
  assert.ok(r.includes('ctf-scanner-service-door'));
  assert.ok(r.includes('ctf-media-output-slot-bezel'));
  assert.ok(r.filter(x=>x==='ctf-status-lamp-reference').length===3);
 });
});

test('V236 Zund keeps modular flatbed identity with visible X guides, cable chain and control console',()=>{
 withMachine('BMJ-MCH-0028',m=>{
  assert.equal(m.root.userData.visualRefinement,'V236_ZUND_FLATBED_SERVICE_REALISM');
  const r=roles(m);
  assert.ok(r.filter(x=>x==='zund-x-linear-guide-reference').length===2);
  assert.ok(r.filter(x=>x==='zund-cable-chain-link-reference').length>=30);
  assert.ok(r.includes('zund-operator-console-reference'));
  assert.ok(r.includes('zund-control-display-reference'));
 });
});

test('V236 compressor brand families remain visually distinct while exact model remains bounded',()=>{
 const expected=new Map([
  ['BMJ-MCH-0029',['V236_ATLAS_GA_G_EXTERIOR_SERVICE_REALISM','ATLAS_COPCO_GA_G']],
  ['BMJ-MCH-0031',['V236_KAESER_SIGMA_EXTERIOR_SERVICE_REALISM','KAESER_SIGMA']],
  ['BMJ-MCH-0033',['V236_SWAN_SCREW_EXTERIOR_SERVICE_REALISM','SWAN_TS_AD_TMV']]
 ]);
 for(const [id,[revision,family]] of expected)withMachine(id,m=>{
  assert.equal(m.root.userData.visualRefinement,revision);
  assert.equal(m.root.userData.brandFamilyVisual,family);
  const r=roles(m);
  assert.ok(r.includes('compressor-main-service-door'));
  assert.ok(r.includes('compressor-intake-louvre-reference'));
  assert.ok(r.includes('compressor-controller-bezel-reference'));
  assert.ok(r.includes('compressor-top-exhaust-grille-reference'));
 });
});

test('V236 AHUs gain sectional service cues and Sansin stays visibly different',()=>{
 for(const id of ['BMJ-MCH-0036','BMJ-MCH-0037','BMJ-MCH-0038','BMJ-MCH-0039','BMJ-MCH-0041'])withMachine(id,m=>{
  assert.equal(m.root.userData.visualRefinement,'V236_DOUBLE_SKIN_AHU_SERVICE_REALISM');
  const r=roles(m);
  assert.ok(r.includes('ahu-service-door-handle-reference'));
  assert.ok(r.includes('ahu-service-door-hinge-reference'));
  assert.ok(r.includes('ahu-condensate-drain-trap-reference'));
  assert.ok(r.includes('ahu-service-observation-window-reference'));
 });
 withMachine('BMJ-MCH-0040',m=>{
  assert.equal(m.root.userData.visualRefinement,'V236_SANSIN_NES_AHU_SERVICE_REALISM');
  const r=roles(m);
  assert.ok(r.includes('sansin-outdoor-module-family-reference'));
  assert.ok(r.includes('sansin-outdoor-coil-grille-reference'));
  const outdoor=m.meshes.find(x=>x.userData?.mechanismRole==='sansin-outdoor-module-family-reference');
  assert.equal(outdoor?.userData.installedArrangementVerified,false);
 });
});

test('V236 reference-machine full versus low-LOD silhouettes remain locked',()=>{
 const ids=['BMJ-MCH-0017','BMJ-MCH-0021','BMJ-MCH-0023','BMJ-MCH-0025','BMJ-MCH-0027','BMJ-MCH-0028','BMJ-MCH-0029','BMJ-MCH-0031','BMJ-MCH-0033','BMJ-MCH-0036','BMJ-MCH-0040'];
 for(const id of ids)withMachine(id,m=>{
  m.root.updateMatrixWorld(true);
  const full=new THREE.Box3().setFromObject(m.root),fs=full.getSize(new THREE.Vector3()),fc=full.getCenter(new THREE.Vector3());
  m.setLow?.(true);m.root.updateMatrixWorld(true);
  const low=new THREE.Box3().setFromObject(m.root),ls=low.getSize(new THREE.Vector3()),lc=low.getCenter(new THREE.Vector3());
  const ratios=fs.toArray().map((v,i)=>v>1e-6?ls.getComponent(i)/v:1);
  const drift=fc.distanceTo(lc)/Math.max(...fs.toArray(),1e-6);
  assert.ok(ratios.every(v=>v>=.84&&v<=1.16),id+' '+ratios.join(','));
  assert.ok(drift<=.12,id+' drift '+drift);
 });
});

test('V236 refreshes shell bytes without rotating the V222 public cache contract',()=>{
 assert.match(sw,/shell recache without rotating public query identifiers/);
 assert.match(sw,/factory-digital-twin-v222-overlay-state-ssot-20260925/);
 assert.match(sw,/const RELEASE='222'/);
});
