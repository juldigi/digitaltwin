import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createMachineTemplate} from '../frontend/src/machine-runtime.js';

const offset9src=readFileSync(resolve('frontend/src/offset9.js'),'utf8');
const fzsrc=readFileSync(resolve('frontend/src/fz1200.js'),'utf8');
const ly300src=readFileSync(resolve('frontend/src/upg-ly300.js'),'utf8');
const refsrc=readFileSync(resolve('frontend/src/reference-machines.js'),'utf8');
const sw=readFileSync(resolve('frontend/sw.js'),'utf8');

const withMachine=(id,fn)=>{const m=createMachineTemplate(id);try{fn(m);}finally{m.dispose();}};
const finiteBox=m=>{m.root.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(m.root),s=b.getSize(new THREE.Vector3());return [s,b];};

test('V232 SX52 uses open feeder and portal delivery instead of sealed cuboid envelopes',()=>{
 assert.match(offset9src,/keep the pile\/head area visually open/);
 assert.match(offset9src,/portal\/canopy delivery silhouette/);
 assert.doesNotMatch(offset9src,/\[2\.05,1\.42,1\.92\],\[0,1\.16,0\]/);
 assert.doesNotMatch(offset9src,/\[2\.78,1\.70,2\.02\],\[0,1\.27,0\]/);
 withMachine('BMJ-MCH-0006',m=>{
  assert.equal(m.root.userData.visualRefinement,'V232_SX52_4L_FAMILY_EXTERIOR_POLISH');
  const feeder=m.findNode('offset9-feeder');
  const delivery=m.findNode('offset9-delivery');
  assert.ok(feeder&&delivery);
  const service=m.meshes.find(x=>x.userData?.mechanismRole==='feeder-service-handle');
  assert.ok(service?.userData.detail);
  m.setLow(true);assert.equal(service.visible,false);
 });
});

test('V232 FZ1200 keeps an open cradle silhouette with yoke gussets and service powerpack',()=>{
 assert.match(fzsrc,/V232_FZ1200_OPEN_CRADLE_SERVICE_POLISH/);
 withMachine('BMJ-MCH-0007',m=>{
  assert.match(m.root.userData.visualRefinement,/FZ1200/);
  const gusset=m.meshes.find(x=>x.userData?.mechanismRole==='yoke-diagonal-gusset-reference');
  const guard=m.meshes.find(x=>x.userData?.mechanismRole==='hydraulic-powerpack-service-cover-reference');
  assert.ok(gusset?.userData.silhouetteCritical);
  assert.ok(guard?.userData.silhouetteCritical);
  const [size]=finiteBox(m);assert.ok(size.x>2&&size.y>1.8&&size.z>1.7);
 });
});

test('V232 UPG LY300 preserves OEM-published long-low envelope and process silhouette',()=>{
 assert.match(ly300src,/V232_UPG_LY300_OEM_MODEL_EXTERIOR_POLISH/);
 withMachine('BMJ-MCH-0024',m=>{
  assert.deepEqual(m.root.userData.oemPublishedEnvelopeMm,[4230,720,1700]);
  assert.ok(m.root.userData.oemPublishedProcess.includes('Ricoh G5 printhead'));
  const hood=m.meshes.find(x=>x.userData?.mechanismRole==='printhead-service-hood-reference');
  const rail=m.meshes.find(x=>x.userData?.mechanismRole==='conveyor-edge-guide-reference');
  assert.ok(hood?.userData.silhouetteCritical&&rail?.userData.silhouetteCritical);
  const [size]=finiteBox(m);assert.ok(size.x>4&&size.x<5.2,'LY300 should remain long-low, not expand into a generic plant machine');
 });
});

test('V232 YA1A1A gravure adds conservative sheetfed-gravure exterior without unblocking speculative motion',()=>{
 assert.match(refsrc,/V232_YA1A1A_SHEETFED_GRAVURE_EXTERIOR_POLISH/);
 withMachine('BMJ-MCH-0004',m=>{
  assert.equal(m.root.userData.visualRefinement,'V232_YA1A1A_SHEETFED_GRAVURE_EXTERIOR_POLISH');
  assert.match(m.root.userData.familyEvidenceBoundary,/BMJ_INSTALLED_ENCLOSURE_UNVERIFIED/);
  assert.match(m.root.userData.simulationStatus,/BLOCKED/);
  const plinth=m.meshes.find(x=>x.userData?.mechanismRole==='gravure-main-plinth-reference');
  const pillar=m.meshes.find(x=>x.userData?.mechanismRole==='gravure-process-bay-pillar-reference');
  assert.ok(plinth?.userData.silhouetteCritical&&pillar?.userData.silhouetteCritical);
  m.setLow(true);assert.equal(plinth.visible,true);assert.equal(pillar.visible,true);
 });
});

test('V232 priority machines remain finite and non-degenerate in world space',()=>{
 for(const id of ['BMJ-MCH-0004','BMJ-MCH-0006','BMJ-MCH-0007','BMJ-MCH-0008','BMJ-MCH-0022','BMJ-MCH-0024'])withMachine(id,m=>{
  const [size,box]=finiteBox(m);
  for(const v of [...size.toArray(),...box.min.toArray(),...box.max.toArray()])assert.ok(Number.isFinite(v),id+' has non-finite geometry');
  assert.ok(size.x>.5&&size.y>.5&&size.z>.4,id+' degenerate envelope');
 });
});

test('V232 shell recache marker changes while public V222 query/cache contract remains stable',()=>{
 assert.match(sw,/V232 priority remaining machine polish/);
 assert.match(sw,/factory-digital-twin-v222-overlay-state-ssot-20260925/);
 assert.match(sw,/const RELEASE='222'/);
});
