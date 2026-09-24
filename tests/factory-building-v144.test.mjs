import test from 'node:test';
import assert from 'node:assert/strict';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';

test('V144 packaging-office and warehouse baseline survives V145 without moving machines',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),meta=built.root.userData,stats=meta.buildingDetailStats;
 assert.equal(meta.baselineId,'BMJ-250804-RED-20260921');
 assert.equal(meta.researchVersion,'V204');
 assert.equal(meta.buildingDetailPass,'V204_CIRCULATION_FINISH_AND_FURNITURE_COLLISION_HARDENING');
 assert.equal(meta.architecturalEvidenceBoundary.notAsBuilt,true);
 assert.match(meta.assumptions.roomContents,/NOT_AS_BUILT/);
 assert.match(meta.assumptions.rmsEnvironmentIndustryReference,/NOT_PLANT_SETPOINT/);
 for(const key of ['warehousePalletLoads','warehouseReelCradles','warehouseAisleMarkings','warehouseSafetyElements'])assert.ok(stats[key]>0,key+' should be populated');
 for(const p of layout.placements.filter(p=>p.status!=='UNIDENTIFIED')){
  const g=built.assets.get(p.machineId);if(!g)continue;
  assert.ok(Math.abs(g.position.x-p.x)<1e-9,p.machineId+' x shifted');
  assert.ok(Math.abs(g.position.z+p.y)<1e-9,p.machineId+' y/z shifted');
  assert.ok(Math.abs(g.rotation.y-p.rotation*Math.PI/180)<1e-9,p.machineId+' rotation shifted');
 }
 const semantics=new Map(),nodes=[];
 built.root.traverse(o=>{const k=o.userData?.semantic;if(k){semantics.set(k,(semantics.get(k)||0)+1);nodes.push(o);}});
 for(const key of ['WRAPPED_PAPERBOARD_PALLET_REFERENCE','RMS_REEL_CRADLE_REFERENCE','RMS_WRAPPED_REEL_REFERENCE','RMS_AISLE_BOUNDARY_REFERENCE','RMS_TEMPERATURE_HUMIDITY_MONITOR_REFERENCE'])assert.ok((semantics.get(key)||0)>0,key);
 const reel=nodes.find(o=>o.userData?.semantic==='RMS_WRAPPED_REEL_REFERENCE');
 assert.ok(reel&&Math.abs(Math.abs(reel.rotation.z)-Math.PI/2)<1e-9,'stored reel should be horizontal on cradle');
 const monitor=nodes.find(o=>o.userData?.semantic==='RMS_TEMPERATURE_HUMIDITY_MONITOR_REFERENCE');
 assert.equal(monitor.userData.industryReference.plantSetpoint,false);
 assert.deepEqual(monitor.userData.industryReference.paperboardRH,[50,55]);
});

test('V144 room-interior rules survive V145 and remain source-label gated',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),stats=built.root.userData.buildingDetailStats;
 const labels=layout.actual.labels.map(l=>l.text);
 if(labels.some(t=>/Adm Room|PPIC|R\.PDS|QC Sample|R\.Sample|R\.INCOMING/i.test(t))){
  assert.ok(stats.officeWorkstations>0,'office workstations should be created for labelled office/admin rooms');
  assert.ok(stats.officeMonitors>0,'office monitors should be created');
  assert.ok(stats.officeTaskChairs>0,'task chairs should be created');
 }
 if(labels.some(t=>/WH Spareparts/i.test(t))){
  assert.ok(stats.sparepartRackBays>0,'sparepart rack bays should be created');
  assert.ok(stats.sparepartBins>0,'sparepart bins should be created');
  assert.ok(stats.sparepartRackGuards>0,'rack guards should be created');
 }
 const fgLabels=layout.actual.labels.filter(l=>/\\bFG\\s*[-.]?\\s*[123]\\b|FINISH(?:ED)?\\s*GOODS/i.test(l.text));
 if(fgLabels.length&&stats.finishedGoodsStagingZones>0)assert.ok(stats.finishedGoodsPalletLoads>0,'source-labelled FG staging should contain carton pallets');
 assert.equal(built.root.userData.nonMachineCollisionAudit.accidentalFixtureOverlaps,0);
 assert.equal(built.layers.utility_compressed_air.visible,false);
 assert.equal(built.layers.utility_ahu_piping.visible,false);
 assert.equal(built.layers.utility_ahu_ducting.visible,false);
});
