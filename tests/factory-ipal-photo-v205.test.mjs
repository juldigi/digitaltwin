import test from 'node:test';
import assert from 'node:assert/strict';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {IPAL_PHOTO_EVIDENCE_V205} from '../frontend/src/data/ipal-photo-evidence-v205.js';

const collect=(root,semantic)=>{const out=[];root.traverse(o=>{if(String(o.userData?.semantic||'')===semantic)out.push(o);});return out;};

test('V205 replaces the generic visible IPAL with the 15-photo actual reconstruction while keeping the yard open',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),meta=built.root.userData,photo=meta.ipal.photoActual;
 assert.equal(meta.ipal.enclosingWalls,0);assert.equal(meta.ipal.openSides,true);
 assert.equal(photo.evidenceVersion,'V205_IPAL_PHOTO_ACTUAL_20260924');
 assert.equal(photo.sourcePhotoCount,15);assert.deepEqual(photo.sourcePhotos,IPAL_PHOTO_EVIDENCE_V205.sourcePhotos);
 assert.match(photo.dimensionalStatus,/RELATIVE_VISUAL_RECONSTRUCTION_ONLY/);
 assert.match(photo.processStatus,/NO_UNVERIFIED_PID/);
 const root=built.root.getObjectByName('IPAL_PHOTO_ACTUAL_V205');assert.ok(root);assert.equal(root.visible,true);
 assert.ok(meta.buildingDetailStats.ipalPhotoActualObjects>150);
 assert.ok(meta.buildingDetailStats.ipalLegacyChildrenSuperseded>0);
});

test('V205 contains all major photo-verified IPAL landmarks instead of invented generic process identities',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);const built=buildActualFactory(layout,fleet),root=built.root;
 for(const semantic of [
  'IPAL_PHOTO_OPERATOR_BUILDING','IPAL_PHOTO_CURVED_ROOF_TRUSS','IPAL_PHOTO_TRANSLUCENT_ROOF_STRIP',
  'IPAL_PHOTO_BAK_EKUALISASI','IPAL_PHOTO_BAK_PENAMPUNGAN_SEMENTARA','IPAL_PHOTO_LARGE_TANK_AN_AEROBIK_LABEL_VISIBLE',
  'IPAL_PHOTO_CONE_BOTTOM_PROCESS_VESSEL','IPAL_PHOTO_CHEMICAL_RACK','IPAL_PHOTO_SLUDGE_BAG_DRYING_UNIT',
  'IPAL_PHOTO_VERTICAL_GARDEN','IPAL_PHOTO_ORNAMENTAL_POND','IPAL_PHOTO_ADJACENT_UTILITY_EQUIPMENT'
 ])assert.ok(collect(root,semantic).length>0,semantic);
 const literal=collect(root,'IPAL_PHOTO_LARGE_TANK_AN_AEROBIK_LABEL_VISIBLE')[0];
 assert.equal(literal.userData.literalVisibleLabel,'TANGKI AN AEROBIK');assert.equal(literal.userData.normalizedProcessName,'UNVERIFIED');
 const rack=collect(root,'IPAL_PHOTO_CHEMICAL_RACK')[0];assert.equal(rack.userData.chemicalIdentity,'UNVERIFIED_FROM_PHOTOS');
 const adjacent=collect(root,'IPAL_PHOTO_ADJACENT_UTILITY_EQUIPMENT')[0];assert.equal(adjacent.userData.coreProcess,false);assert.equal(adjacent.userData.systemLinkage,'NOT_ASSERTED');
});

test('V205 supersedes conflicting legacy generic IPAL geometry without deleting its audit history',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);const built=buildActualFactory(layout,fleet),root=built.root;
 for(const semantic of ['IPAL_CLARIFIER','IPAL_FILTER_VESSEL','IPAL_AERATION_BASIN','IPAL_INLET_SCREEN_CHANNEL']){
  const nodes=collect(root,semantic);assert.ok(nodes.length>0,semantic+' legacy node should remain auditable');
  assert.ok(nodes.every(o=>o.visible===false&&o.userData.supersededByPhotoActualV205===true),semantic+' must be visually superseded');
 }
 assert.equal(built.root.userData.ipal.photoActual.legacyFunctionalReferenceSuperseded,true);
});

test('V205 preserves all registered machine placements and adds only ambient motion by default',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);const built=buildActualFactory(layout,fleet);
 for(const p of layout.placements.filter(p=>p.status!=='UNIDENTIFIED')){const m=built.assets.get(p.machineId);if(!m)continue;assert.equal(m.position.x,p.x,p.machineId+' x moved');assert.equal(m.position.z,-p.y,p.machineId+' y moved');assert.equal(m.rotation.y,p.rotation*Math.PI/180,p.machineId+' rotation changed');}
 assert.equal(built.root.userData.ipal.photoActual.processMotionDefault,false);
 assert.deepEqual(built.root.userData.ipal.photoActual.ambientMotion,['WATER_SURFACE_MICRO_MOTION','ORNAMENTAL_POND_FISH']);
 assert.equal(built.setIpalProcessMotion(true),true);assert.equal(built.setIpalProcessMotion(false),false);
 assert.doesNotThrow(()=>built.update(12345));
});

test('V205 evidence boundary explicitly refuses dimensions, P&ID, chemistry and adjacent-utility linkage not proven by photos',()=>{
 const unresolved=new Set(IPAL_PHOTO_EVIDENCE_V205.unresolved);
 for(const key of ['ABSOLUTE_EQUIPMENT_DIMENSIONS_AND_ELEVATIONS','EXACT_PIPE_DIAMETERS_MATERIAL_SPECS_AND_ALL_ROUTING','COMPLETE_PID_AND_PROCESS_FLOW_DIRECTION','CHEMICAL_IDENTITIES_AND_DOSING_RATES','TANK_CAPACITIES_AND_INTERNALS','ADJACENT_UTILITY_SYSTEM_LINKAGE'])assert.ok(unresolved.has(key),key);
 assert.equal(IPAL_PHOTO_EVIDENCE_V205.verified.openSides,true);
 assert.equal(IPAL_PHOTO_EVIDENCE_V205.verified.equalizationVisibleLabel,'BAK EKUALISASI');
 assert.equal(IPAL_PHOTO_EVIDENCE_V205.verified.sludgeUnitLiteralVisibleLabel,'UNIT (KARUNG) PENGERING LUMPUR');
});
