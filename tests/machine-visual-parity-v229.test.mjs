import test from 'node:test';
import assert from 'node:assert/strict';
import {SheetingMachineTemplate} from '../frontend/src/sheeting.js';
import {Polar115MachineTemplate} from '../frontend/src/polar115.js';
import {SHEETING_TECHNICAL_SOURCES} from '../frontend/src/data/sources-sheeting.js';
import {POLAR115_TECHNICAL_SOURCES} from '../frontend/src/data/sources-polar115.js';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const sw=readFileSync(resolve('frontend/sw.js'),'utf8');
const build=readFileSync(resolve('scripts/build.mjs'),'utf8');

test('V229 Sheeting home silhouette keeps actual-photo machine DNA while hiding microdetail',()=>{
 const m=new SheetingMachineTemplate();
 assert.equal(m.root.userData.lowLodSilhouette?.revision,'V229');
 assert.match(m.root.userData.lowLodSilhouette?.policy||'',/PHOTO_VISIBLE_MACHINE_DNA/);
 const guide=m.meshes.find(x=>x.userData.role==='stack-white-guide-panel');
 const ruler=m.meshes.find(x=>x.userData.role==='stack-ruler-tick');
 const carrier=m.meshes.find(x=>x.userData.role==='web-carrier-longitudinal-beam');
 assert.ok(guide&&guide.userData.detail&&guide.userData.silhouetteCritical);
 assert.ok(ruler&&ruler.userData.detail&&!ruler.userData.silhouetteCritical);
 assert.ok(carrier&&carrier.userData.silhouetteCritical);
 m.setLow(true);
 assert.equal(guide.visible,true);
 assert.equal(carrier.visible,true);
 assert.equal(ruler.visible,false);
 m.setLow(false);
 assert.equal(ruler.visible,true);
 m.dispose();
});

test('V229 Sheeting keeps exact-family evidence separate from unresolved HSM-CTM7 cutter internals',()=>{
 const hsm=SHEETING_TECHNICAL_SOURCES.find(x=>x.id==='SHEETING-HSM56-BW-PDF');
 assert.ok(hsm);
 assert.match(hsm.note,/flat[- ]bed knife/i);
 assert.match(hsm.note,/fixed-position two-sided rollstand/i);
 const m=new SheetingMachineTemplate();
 assert.match(m.root.userData.lowLodSilhouette?.familyEvidence||'',/FLAT_BED_KNIFE/);
 assert.match(m.root.userData.lowLodSilhouette?.exactMachineBoundary||'',/NO_SPECULATIVE_INTERNAL_BLADE/);
 assert.equal(m.findNode('sheeting-knife')?.userData.visibleKnifeGeometry,false);
 m.dispose();
});

test('V229 POLAR home silhouette retains old EM-MON identity instead of a modern N115 control face',()=>{
 const m=new Polar115MachineTemplate();
 assert.equal(m.root.userData.lowLodSilhouette?.revision,'V229');
 assert.match(m.root.userData.lowLodSilhouette?.modernizationBoundary||'',/EM_MONITOR_SQUARE_DISPLAY_KEYPAD/);
 const motorEnd=m.findNode('polar-housing-motor-end');
 const motorWindow=m.meshes.find(x=>x.userData.detail&&m.contains(motorEnd,x));
 const keypad=m.findNode('polar-control-keypad');
 const keypadDetail=m.meshes.find(x=>x.userData.detail&&m.contains(keypad,x));
 assert.ok(motorWindow?.userData.silhouetteCritical);
 assert.ok(keypadDetail&&!keypadDetail.userData.silhouetteCritical);
 m.setLow(true);
 assert.equal(motorWindow.visible,true);
 assert.equal(keypadDetail.visible,false);
 m.setLow(false);
 assert.equal(keypadDetail.visible,true);
 m.dispose();
});

test('V229 POLAR remains bounded to verified EM-MON features and archive dimensions',()=>{
 const photos=POLAR115_TECHNICAL_SOURCES.find(x=>x.id==='BMJ-POLAR-PHOTOS-2026-09');
 const boundary=POLAR115_TECHNICAL_SOURCES.find(x=>x.id==='POLAR-EM-EVIDENCE-BOUNDARY');
 assert.equal(photos?.confidence,'VERIFIED_VISUAL');
 assert.ok(photos?.supports?.some(x=>/small square industrial program display/i.test(x)));
 assert.ok(photos?.supports?.some(x=>/side tables/i.test(x)));
 assert.ok(boundary);
 const m=new Polar115MachineTemplate();
 assert.equal(m.root.userData.mainHousingProfile,'RECTANGULAR_ROUNDED_HEAD__NO_HALF_CYLINDER_ROOF');
 assert.match(m.root.userData.lowLodSilhouette?.archiveFamily||'',/LEFT_RIGHT_SIDE_TABLES/);
 m.dispose();
});

test('V229 build continues to regenerate factory/home geometry from the live templates',()=>{
 assert.match(build,/scripts\/bake-factory-fleet\.mjs/);
 assert.match(sw,/shell recache without rotating public query identifiers/);
 assert.match(sw,/factory-digital-twin-v222-overlay-state-ssot-20260925/);
 assert.match(sw,/const RELEASE='222'/);
});
