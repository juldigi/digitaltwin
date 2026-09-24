import test from 'node:test';
import assert from 'node:assert/strict';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {V145_SOURCE_LEDGER,V145_SOURCE_STATS} from '../frontend/src/data/research-v145.js';

test('V145 micro-realism adds office ceiling, HVAC and warehouse traffic references without moving machines',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),meta=built.root.userData,stats=meta.buildingDetailStats;
 assert.equal(meta.baselineId,'BMJ-250804-RED-20260921');
 assert.equal(meta.researchVersion,'V202');
 assert.equal(meta.buildingDetailPass,'V202_ROOM_ENVELOPE_CLOSURE_AND_DOOR_AWARE_FURNITURE_LAYOUT');
 assert.equal(meta.architecturalEvidenceBoundary.notAsBuilt,true);
 assert.match(meta.assumptions.microRealism,/NOT_AS_BUILT/);
 assert.match(meta.assumptions.safetyReference,/NOT_CODE_COMPLIANCE/);
 for(const p of layout.placements.filter(p=>p.status!=='UNIDENTIFIED')){
  const g=built.assets.get(p.machineId);if(!g)continue;
  assert.ok(Math.abs(g.position.x-p.x)<1e-9,p.machineId+' x shifted');
  assert.ok(Math.abs(g.position.z+p.y)<1e-9,p.machineId+' y/z shifted');
  assert.ok(Math.abs(g.rotation.y-p.rotation*Math.PI/180)<1e-9,p.machineId+' rotation shifted');
 }
 const labels=layout.actual.labels.map(l=>l.text);
 if(labels.some(t=>/Adm Room|PPIC|R\.PDS|QC Sample|R\.Sample|R\.INCOMING/i.test(t))){
  for(const key of ['officeCeilingTiles','officeLedPanels','officeSupplyDiffusers','officeReturnGrilles','officeCeilingSensors','officePowerDataPoints'])assert.ok(stats[key]>0,key+' should be populated');
 }
 for(const key of ['warehousePedestrianLanes','warehouseCrossings','warehouseConvexMirrors','warehouseBarrierElements','warehouseTrafficCues','palletJackReferences','warehouseWearMarks'])assert.ok(stats[key]>0,key+' should be populated');
});

test('V145 room micro-details remain source-label gated and safety equipment is explicitly reference-only',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),stats=built.root.userData.buildingDetailStats;
 const labels=layout.actual.labels.map(l=>l.text),semantics=new Map(),nodes=[];
 built.root.traverse(o=>{const k=o.userData?.semantic;if(k){semantics.set(k,(semantics.get(k)||0)+1);nodes.push(o);}});
 for(const key of ['RMS_PEDESTRIAN_WALKWAY_REFERENCE','RMS_CONVEX_MIRROR_REFERENCE','RMS_PEDESTRIAN_TRAFFIC_CUE_REFERENCE','WAREHOUSE_FORK_WHEEL_SCUFF_REFERENCE'])assert.ok((semantics.get(key)||0)>0,key);
 const safetyNodes=nodes.filter(o=>/FIRE_EXTINGUISHER_REFERENCE|EMERGENCY_LUMINAIRE_REFERENCE/.test(o.userData?.semantic||''));
 for(const node of safetyNodes)assert.match(node.userData.accuracy||'',/REFERENCE_NOT_AS_BUILT|NOT_AS_BUILT_OR_COMPLIANCE_ASSERTION/);
 if(labels.some(t=>/Toilet/i.test(t))){
  assert.ok(stats.toiletMirrors>0);assert.ok(stats.toiletDispensers>0);assert.ok(stats.toiletFloorDrains>0);assert.ok(stats.toiletExhaustGrilles>0);
 }
 if(labels.some(t=>/Pantry|Kitchen|Refreshment/i.test(t)))assert.ok(stats.pantryFixtures>0);
 if(labels.some(t=>/Locker|Loker|Changing|Change Room/i.test(t)))assert.ok(stats.lockerDoors>0);
 if(labels.some(t=>/Electric room|Workshop|WH Spareparts/i.test(t)))assert.ok(stats.fireExtinguisherReferences>0);
 assert.equal(built.root.userData.nonMachineCollisionAudit.accidentalFixtureOverlaps,0);
 assert.equal(built.layers.utility_compressed_air.visible,false);
 assert.equal(built.layers.utility_ahu_piping.visible,false);
 assert.equal(built.layers.utility_ahu_ducting.visible,false);
});

test('V145 research ledger extends V144 with unique authoritative safety and environment references',()=>{
 assert.ok(V145_SOURCE_STATS.newReviewed>=8);
 assert.equal(V145_SOURCE_STATS.total,V145_SOURCE_LEDGER.length);
 assert.equal(V145_SOURCE_STATS.uniqueUrls,V145_SOURCE_LEDGER.length);
 for(const id of ['V145-OSHA-WH-PEDESTRIAN','V145-OSHA-OFFICE-ENV','V145-OSHA-EXIT-ROUTES','V145-OSHA-EXTINGUISHERS','V145-STORA-BOARD-STORAGE'])assert.ok(V145_SOURCE_LEDGER.some(s=>s.id===id),id);
});
