import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createMachineTemplate} from '../frontend/src/machine-runtime.js';

const bake=readFileSync(resolve('scripts/bake-factory-fleet.mjs'),'utf8');
const sw=readFileSync(resolve('frontend/sw.js'),'utf8');
const universal=readFileSync(resolve('frontend/src/universal-machine.js'),'utf8');

const withMachine=(id,fn)=>{const m=createMachineTemplate(id);try{fn(m);}finally{m.dispose();}};
const roleOf=m=>String(m.userData?.mechanismRole||'');
const critical=(m,re)=>m.meshes.find(x=>x.userData?.silhouetteCritical&&re.test(roleOf(x)));

test('V231 live reference machines use home/detail parity metadata instead of fallback-only geometry',()=>{
 for(const id of ['BMJ-MCH-0017','BMJ-MCH-0021','BMJ-MCH-0023','BMJ-MCH-0025','BMJ-MCH-0027','BMJ-MCH-0028','BMJ-MCH-0029','BMJ-MCH-0036']){
  withMachine(id,m=>{
   assert.equal(m.root.userData.referenceBuilder,'V139_RESEARCH_GROUNDED_BUILDER');
   assert.equal(m.root.userData.visualParityRevision,'V231');
   assert.equal(m.root.userData.homeDetailGeometryPolicy,'SAME_LIVE_TEMPLATE__MICRODETAIL_CULLED__SILHOUETTE_DNA_RETAINED');
  });
 }
});

test('V231 low LOD preserves silhouette-critical meshes while still culling ordinary detail',()=>{
 assert.match(universal,/if\(m\.userData\.detail&&!m\.userData\.silhouetteCritical\)m\.visible=!on/);
 withMachine('BMJ-MCH-0029',m=>{
  const keep=critical(m,/compressor-cabinet-top-panel/);
  const micro=m.meshes.find(x=>x.userData?.detail&&!x.userData?.silhouetteCritical&&x.visible);
  assert.ok(keep,'expected compressor cabinet silhouette mesh');
  assert.ok(micro,'expected noncritical microdetail');
  m.setLow(true);
  assert.equal(keep.visible,true);
  assert.equal(micro.visible,false);
 });
});

test('V231 FGM-2 stays an open multi-vendor process intersection and retains its folding DNA at home',()=>{
 withMachine('BMJ-MCH-0017',m=>{
  assert.equal(m.root.userData.geometryStatus,'MULTI_VENDOR_FOLDER_GLUER_PROCESS_REFERENCE__NOT_MEDIA100_IDENTITY');
  assert.equal(m.root.userData.exactFolderGluerOemVerified,false);
  assert.equal(m.root.userData.exactFolderGluerModelVerified,false);
  assert.match(m.root.userData.visualParityFamily,/FGM2_OPEN_FRAME/);
  assert.ok(m.findNode('fgm2-feed-table'));
  assert.ok(m.findNode('fgm2-primary-fold'));
  assert.ok(m.findNode('fgm2-compression-belts'));
  const keep=critical(m,/primary-fold-transport-belt|prebreaker-guide-rail/);
  assert.ok(keep);
  m.setLow(true);assert.equal(keep.visible,true);
 });
});

test('V231 QF-100CS preserves the family gantry, XY table and fixed blanking head without exact-model claims',()=>{
 withMachine('BMJ-MCH-0021',m=>{
  assert.match(m.root.userData.visualParityFamily,/QF100CS/);
  assert.equal(m.root.userData.exactModelPublicDocumentationFound,false);
  assert.ok(m.findNode('qf100-platform'));
  assert.ok(m.findNode('qf100-head-ram'));
  const keep=critical(m,/blanking-pressure-plate|qf-family-accent-stripe/);
  assert.ok(keep);
  m.setLow(true);assert.equal(keep.visible,true);
 });
});

test('V231 collator remains a vertical suction-bin tower in factory overview',()=>{
 withMachine('BMJ-MCH-0023',m=>{
  assert.equal(m.root.userData.modeledReferenceBinCount,10);
  assert.equal(m.root.userData.installedBinCountVerified,false);
  assert.match(m.root.userData.visualParityFamily,/VERTICAL_SUCTION_COLLATOR_TOWER/);
  const keep=critical(m,/collator-bin-front-lip|feed-bin-shelf/);
  assert.ok(keep);
  m.setLow(true);assert.equal(keep.visible,true);
 });
});

test('V231 Suprasetter family keeps the sloped hood and facade identity in home LOD',()=>{
 withMachine('BMJ-MCH-0025',m=>{
  assert.equal(m.root.userData.exactSuprasetterModelVerified,false);
  assert.match(m.root.userData.visualParityFamily,/SUPRASETTER/);
  let hood=null;m.findNode('ctp-family-envelope')?.traverse(o=>{if(o.userData?.visualRole==='SUPRASETTER_FAMILY_SLOPED_TOP')hood=o;});
  assert.ok(hood);assert.ok(Math.abs(hood.rotation.z)>.05);
  const facade=critical(m,/ctp-plate-entry-slot|ctp-hmi-display/);
  assert.ok(facade);
  m.setLow(true);assert.equal(hood.visible,true);assert.equal(facade.visible,true);
 });
});

test('V231 SCREEN CTF family retains cassette/scanner facade without asserting the exact model',()=>{
 withMachine('BMJ-MCH-0027',m=>{
  assert.equal(m.root.userData.exactScreenModelVerified,false);
  assert.match(m.root.userData.visualParityFamily,/SCREEN_FTR_KATANA/);
  const keep=critical(m,/ctf-media-cassette-door|ctf-scanner-service-door/);
  assert.ok(keep);
  m.setLow(true);assert.equal(keep.visible,true);
 });
});

test('V231 Zund overview keeps the vacuum table, bridge and tool-carriage silhouette',()=>{
 withMachine('BMJ-MCH-0028',m=>{
  assert.equal(m.root.userData.exactZundModelVerified,false);
  assert.match(m.root.userData.visualParityFamily,/ZUND_G3_S3/);
  const beam=critical(m,/travelling-beam-structure/),carriage=critical(m,/tool-carriage-structure/);
  assert.ok(beam&&carriage);
  m.setLow(true);assert.equal(beam.visible,true);assert.equal(carriage.visible,true);
 });
});

test('V231 Atlas Copco, KAESER and SWAN overview keeps the unified brand-family cabinet',()=>{
 for(const [id,brand] of [['BMJ-MCH-0029','Atlas Copco'],['BMJ-MCH-0031','KAESER'],['BMJ-MCH-0033','SWAN']])withMachine(id,m=>{
  assert.equal(m.root.userData.unifiedCompressorCabinet,true);
  assert.match(m.root.userData.referenceBrandFamily,new RegExp(brand,'i'));
  const top=critical(m,/compressor-cabinet-top-panel/),door=critical(m,/compressor-service-door-reference/);
  assert.ok(top&&door);
  m.setLow(true);assert.equal(top.visible,true);assert.equal(door.visible,true);
 });
});

test('V231 AHU/Sansin overview retains its major non-microdetail section shells',()=>{
 for(const id of ['BMJ-MCH-0036','BMJ-MCH-0040'])withMachine(id,m=>{
  assert.match(m.root.userData.visualParityFamily,/AHU|SANSIN/);
  const section=m.findNode('universal-module-1');
  const shell=section?.children.find(o=>o.isMesh&&o.userData?.exteriorCover);
  assert.ok(shell);
  const before=shell.visible;m.setLow(true);
  assert.equal(before,true);assert.equal(shell.visible,true);
 });
});

test('V231 factory/home still bakes live templates and keeps cache contract stable',()=>{
 assert.match(bake,/const t=createMachineTemplate\(place\.machineId\)/);
 assert.match(bake,/t\.setLow\?\.\(true\)/);
 assert.match(sw,/shell recache without rotating public query identifiers/);
 assert.match(sw,/factory-digital-twin-v222-overlay-state-ssot-20260925/);
 assert.match(sw,/const RELEASE='222'/);
});
