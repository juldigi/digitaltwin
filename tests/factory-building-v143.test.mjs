import test from 'node:test';
import assert from 'node:assert/strict';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';

test('V143 structural baseline survives V145 micro-realism pass',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),meta=built.root.userData,stats=meta.buildingDetailStats;
 assert.equal(meta.baselineId,'BMJ-250804-RED-20260921');
 assert.equal(meta.researchVersion,'V199');
 assert.equal(meta.buildingDetailPass,'V199_SUPER_REALISTIC_ENVELOPE_FURNITURE_ORIENTATION_AND_PACKAGING_SUPPORT');
 assert.equal(meta.assumptions.roofEaves,4.5);
 assert.equal(meta.assumptions.roofRidge,7);
 assert.equal(meta.ipal.enclosingWalls,0);
 assert.equal(meta.ipal.openSides,true);
 assert.equal(meta.utilityRouting.actualRoutingApplied,false);
 assert.equal(meta.architecturalEvidenceBoundary.notAsBuilt,true);
 for(const key of ['serviceClearanceMarkings','columnPedestals','columnStiffeners','wallGirts','wallBaseFlashings','eaveHaunches','eaveStruts','apexSplices','roofPurlins','purlinAntiSag','flyBracing','roofGutters','roofDownpipes','downpipeShoes','pressRoomProtection'])assert.ok(stats[key]>0,key+' should be populated');
 for(const p of layout.placements.filter(p=>p.status!=='UNIDENTIFIED')){
  const g=built.assets.get(p.machineId);if(!g)continue;
  assert.ok(Math.abs(g.position.x-p.x)<1e-9,p.machineId+' x shifted');
  assert.ok(Math.abs(g.position.z+p.y)<1e-9,p.machineId+' y/z shifted');
 }
 built.root.traverse(o=>{if(o.userData?.accuracy==='INDUSTRIAL_REALISM_REFERENCE_NOT_AS_BUILT'&&o.userData.researchVersion)assert.match(o.userData.researchVersion,/^V1\d+$/);});
});

test('V143 open IPAL and utility-routing boundary survive V145',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet);
 const semantics=new Map();
 built.root.traverse(o=>{const k=o.userData?.semantic;if(k)semantics.set(k,(semantics.get(k)||0)+1);});
 for(const key of ['IPAL_OPEN_FRAME_COLUMN','IPAL_X_BRACE_REFERENCE','IPAL_SERVICE_WALKWAY','PORTAL_EAVE_HAUNCH_REFERENCE','EAVE_STRUT_REFERENCE','PORTAL_APEX_SPLICE_REFERENCE','WALL_GIRT_REFERENCE','COLUMN_CONCRETE_PEDESTAL_REFERENCE'])assert.ok((semantics.get(key)||0)>0,key);
 assert.equal(built.layers.utility_compressed_air.visible,false);
 assert.equal(built.layers.utility_ahu_piping.visible,false);
 assert.equal(built.layers.utility_ahu_ducting.visible,false);
});
