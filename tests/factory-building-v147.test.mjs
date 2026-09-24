import test from 'node:test';
import assert from 'node:assert/strict';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {V147_SOURCE_LEDGER,V147_SOURCE_STATS} from '../frontend/src/data/research-v147.js';

test('V147 completes IPAL process references without moving machines or enclosing the outdoor yard',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),meta=built.root.userData,stats=meta.buildingDetailStats;
 assert.equal(meta.baselineId,'BMJ-250804-RED-20260921');
 assert.equal(meta.researchVersion,'V201');
 assert.equal(meta.buildingDetailPass,'V201_CONTEXTUAL_MACHINE_SIDE_SUPPORT_AND_ARCHITECTURAL_MICRODETAIL');
 assert.equal(meta.ipal.enclosingWalls,0);assert.equal(meta.ipal.openSides,true);
 for(const key of ['ipalScreens','ipalSumps','ipalLevelInstruments','ipalClarifierWeirs','ipalScumBaffles','ipalFilterInstruments','ipalBackwashLines','ipalPipeSupports','ipalManholes','ipalAerationEffects'])assert.ok(stats[key]>0,key);
 for(const p of layout.placements.filter(p=>p.status!=='UNIDENTIFIED')){const g=built.assets.get(p.machineId);if(!g)continue;assert.equal(g.position.x,p.x,p.machineId+' x');assert.equal(g.position.z,-p.y,p.machineId+' z');assert.equal(g.rotation.y,p.rotation*Math.PI/180,p.machineId+' rotation');}
});

test('V147 new IPAL objects remain explicitly functional references, not as-built claims',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);const built=buildActualFactory(layout,fleet),found=new Map();
 built.root.traverse(o=>{if(o.userData?.semantic)found.set(o.userData.semantic,o);});
 for(const key of ['IPAL_INLET_BAR_SCREEN_REFERENCE','IPAL_SUBMERSIBLE_SUMP_PUMP_REFERENCE','IPAL_ULTRASONIC_LEVEL_TRANSMITTER_REFERENCE','IPAL_CLARIFIER_EFFLUENT_WEIR_REFERENCE','IPAL_CLARIFIER_SCUM_BAFFLE_REFERENCE','IPAL_FILTER_PRESSURE_GAUGE_REFERENCE','IPAL_FILTER_BACKWASH_LINE_REFERENCE','IPAL_PIPE_SUPPORT_REFERENCE','IPAL_INSPECTION_MANHOLE_COVER_REFERENCE','IPAL_STATIC_AERATION_BUBBLE_REFERENCE'])assert.ok(found.has(key),key);
 for(const key of ['IPAL_INLET_BAR_SCREEN_REFERENCE','IPAL_CLARIFIER_EFFLUENT_WEIR_REFERENCE','IPAL_FILTER_PRESSURE_GAUGE_REFERENCE','IPAL_INSPECTION_MANHOLE_COVER_REFERENCE'])assert.match(found.get(key).userData.accuracy,/REFERENCE|NOT_AS_BUILT/);
 assert.match(built.root.userData.assumptions.ipalTreatment,/NOT_AS_BUILT/);
});

test('V147 evidence ledger extends V146 with unique authoritative process and safety references',()=>{
 assert.ok(V147_SOURCE_STATS.newReviewed>=7);assert.equal(V147_SOURCE_STATS.total,V147_SOURCE_LEDGER.length);assert.equal(V147_SOURCE_STATS.uniqueUrls,V147_SOURCE_LEDGER.length);
 for(const id of ['V147-EPA-PRELIMINARY','V147-EPA-SCREENING','V147-EPA-CLARIFIER','V147-EPA-BACKWASH','V147-OSHA-CONFINED'])assert.ok(V147_SOURCE_LEDGER.some(s=>s.id===id),id);
});
