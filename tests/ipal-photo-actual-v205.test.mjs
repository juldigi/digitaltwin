import test from 'node:test';
import assert from 'node:assert/strict';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {IPAL_PHOTO_EVIDENCE_V205} from '../frontend/src/data/ipal-photo-evidence-v205.js';

const collect=(root,re)=>{
 const out=[];root.traverse(o=>{if(re.test(String(o.userData?.semantic||'')))out.push(o);});return out;
};

test('V205 makes the 15 actual IPAL photos the dominant visible evidence layer',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),meta=built.root.userData,s=meta.buildingDetailStats;
 assert.equal(meta.ipal.enclosingWalls,0);
 assert.equal(meta.ipal.openSides,true);
 assert.equal(meta.ipal.photoActual.version,'V205');
 assert.equal(meta.ipal.photoActual.sourceArchive,'IPAL.zip');
 assert.equal(meta.ipal.photoActual.photoCount,15);
 assert.equal(meta.ipal.photoActual.files.length,15);
 assert.ok(s.v205IpalPhotoObjects>100,'photo actual reconstruction should be materially detailed');
 assert.ok(s.v205IpalLegacyHidden>0,'generic IPAL references should be superseded');
 assert.ok(s.v205IpalPipingRuns>0);
 assert.ok(s.v205IpalSafetyDetails>0);
 assert.ok(s.v205IpalVegetationObjects>0);
});

test('V205 exposes photo-confirmed IPAL equipment without inventing survey dimensions or chemistry',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const root=buildActualFactory(layout,fleet).root;
 for(const semantic of [
  'IPAL_PHOTO_BAK_EKUALISASI_WALL',
  'IPAL_PHOTO_BAK_PENAMPUNGAN_SEMENTARA_WALL',
  'IPAL_PHOTO_TANGKI_AN_AEROBIK',
  'IPAL_PHOTO_HOPPER_CONE_VESSEL',
  'IPAL_PHOTO_RED_CHEMICAL_TANK',
  'IPAL_PHOTO_SLUDGE_DEWATERING_BAG',
  'IPAL_PHOTO_OPERATOR_ROOM_WALL',
  'IPAL_PHOTO_VERTICAL_GARDEN_PLANT',
  'IPAL_PHOTO_ORNAMENTAL_POND_WATER'
 ]){
  const found=collect(root,new RegExp('^'+semantic+'$'));
  assert.ok(found.length>0,semantic);
  assert.ok(found.every(o=>o.userData.evidenceLayer==='PHOTO_ACTUAL'),semantic+' evidence layer');
  assert.ok(found.every(o=>/NOT_SURVEYED/.test(String(o.userData.accuracy||''))),semantic+' dimension boundary');
 }
 const chemical=collect(root,/^IPAL_PHOTO_(?:RED|UPPER_RED)_CHEMICAL_TANK$/);
 assert.ok(chemical.length>=5);
 assert.ok(chemical.every(o=>o.userData.contents==='UNVERIFIED_FROM_PHOTO'));
});

test('V205 hides process-generic objects contradicted or overstated by the photographic evidence',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const root=buildActualFactory(layout,fleet).root;
 for(const semantic of ['IPAL_CLARIFIER','IPAL_FILTER_VESSEL','IPAL_AERATION_BASIN','IPAL_EQUALIZATION_BASIN']){
  const objects=collect(root,new RegExp('^'+semantic+'$'));
  assert.ok(objects.length>0,semantic+' legacy object should remain for provenance');
  assert.ok(objects.every(o=>o.visible===false),semantic+' should not render over photo actual geometry');
  assert.ok(objects.every(o=>o.userData.supersededByV205===true),semantic+' should be marked superseded');
 }
});

test('V205 preserves every machine placement and does not close the outdoor IPAL yard',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet);
 for(const p of layout.placements.filter(p=>p.status!=='UNIDENTIFIED')){
  const g=built.assets.get(p.machineId);if(!g)continue;
  assert.equal(g.position.x,p.x,p.machineId+' x moved');
  assert.equal(g.position.z,-p.y,p.machineId+' y moved');
  assert.equal(g.rotation.y,p.rotation*Math.PI/180,p.machineId+' rotation changed');
 }
 assert.equal(built.root.userData.ipal.enclosingWalls,0);
 assert.equal(built.root.userData.ipal.openSides,true);
});

test('V205 records photo-derived labels, topology and P&ID boundary explicitly',()=>{
 assert.equal(IPAL_PHOTO_EVIDENCE_V205.photoCount,15);
 assert.deepEqual(IPAL_PHOTO_EVIDENCE_V205.files[0],'IMG_2511.HEIC');
 assert.deepEqual(IPAL_PHOTO_EVIDENCE_V205.files.at(-1),'IMG_2525.HEIC');
 for(const label of ['BAK EKUALISASI','BAK PENAMPUNGAN SEMENTARA','TANGKI AN AEROBIK','UNIT (KARUNG) PENGERING LUMPUR'])assert.ok(IPAL_PHOTO_EVIDENCE_V205.confirmedLabels.includes(label),label);
 assert.match(IPAL_PHOTO_EVIDENCE_V205.confidencePolicy.dimensions,/NOT_SURVEYED/);
 assert.match(IPAL_PHOTO_EVIDENCE_V205.confidencePolicy.piping,/NOT_PID/);
 assert.match(IPAL_PHOTO_EVIDENCE_V205.confidencePolicy.processNames,/ONLY_WHEN_LABEL/);
});
