import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Promatrix106MachineTemplate} from '../frontend/src/promatrix106.js';
import {Promatrix106ProcessSimulation,PROMATRIX106_SIMULATION_STAGES} from '../frontend/src/simulation-promatrix106.js';
import {PROMATRIX106_SPEC,PROMATRIX106_SPEC_APM9} from '../frontend/src/data/dimensions-promatrix106.js';
import {promatrix106TaxonomyFor} from '../frontend/src/data/taxonomy-promatrix106.js';
import {PROMATRIX106_TECHNICAL_SOURCES} from '../frontend/src/data/sources-promatrix106.js';

test('Promatrix 106 CSB keeps both BMJ identities and OEM generation boundaries explicit',()=>{
 assert.equal(PROMATRIX106_SPEC.assetId,'BMJ-MCH-0014');assert.equal(PROMATRIX106_SPEC.serial,'MP.DBE0-00100');assert.equal(PROMATRIX106_SPEC_APM9.assetId,'BMJ-MCH-0015');assert.equal(PROMATRIX106_SPEC_APM9.serial,'MP.DBE0-00115');
 assert.deepEqual(PROMATRIX106_SPEC.sheetMax,[.760,1.060]);assert.equal(PROMATRIX106_SPEC.cuttingPressureMN,2.6);assert.equal(PROMATRIX106_SPEC.cuttingPressureTonnes,260);
 assert.equal(PROMATRIX106_SPEC.oemGripperBarCount,7);assert.equal(PROMATRIX106_SPEC.registeredGripperStopVerified,true);
 assert.equal(PROMATRIX106_SPEC.publishedMaxSpeed,8000);assert.equal(PROMATRIX106_SPEC.brochure2020CSBMaxSpeed,7500);
 assert.ok(PROMATRIX106_TECHNICAL_SOURCES.some(s=>s.authority==='primary'));assert.ok(PROMATRIX106_TECHNICAL_SOURCES.some(s=>s.id==='PROMATRIX-EVIDENCE-BOUNDARY'));
});

test('both BMJ Promatrix assets instantiate the CSB station train with OEM-bounded metadata',()=>{
 for(const assetId of ['BMJ-MCH-0014','BMJ-MCH-0015']){const model=new Promatrix106MachineTemplate(assetId),box=new THREE.Box3().setFromObject(model.root);assert.equal(model.root.userData.assetId,assetId);assert.equal(model.root.userData.engineeringDimensions,false);assert.match(model.root.userData.geometryStatus,/OEM_PROCESS_REFERENCE/);assert.ok(!box.isEmpty());assert.ok(box.min.y>=-0.01);
  for(const id of ['pm106-feeder','pm106-feedtable','pm106-transport','pm106-cutting','pm106-stripping','pm106-blanking','pm106-delivery','pm106-drive','pm106-access'])assert.ok(model.findNode(id),id);
  model.setExteriorOpen(true);assert.ok(model.root.userData.exteriorHiddenCount>=8);model.dispose();}
});

test('Promatrix uses exactly seven moving gripper bars and only functional rotor roles',()=>{
 const model=new Promatrix106MachineTemplate(),sim=new Promatrix106ProcessSimulation(model.root,model),allowed=/^(pile-lift|feed-brush|chain-sprocket|pressure-eccentric|pallet-lift|main-motor|flywheel)$/;
 assert.equal(sim.gripperBars.length,7);assert.equal(sim.rotors.length,17);assert.equal(sim.rotors.some(r=>!allowed.test(r.userData.mechanismRole||'')),false);
 assert.equal(model.meshes.some(m=>m.userData.rotor&&['suction-cup','pneumatic-lock','strip-pin','vacuum-port','air-regulator','button'].includes(m.userData.mechanismRole)),false);
 assert.equal(sim.suckers.length,4);sim.dispose();model.dispose();
});

test('Promatrix registered gripper transport freezes through cutting dwell and resumes on index',()=>{
 const model=new Promatrix106MachineTemplate(),sim=new Promatrix106ProcessSimulation(model.root,model);sim.start();let now=1000;const advanceTo=t=>{while(sim.elapsed<t){now+=20;sim.update(now);}};
 advanceTo(4.20);let state=sim.state();assert.equal(state.cuttingActive,true);assert.equal(state.transportStopped,true);assert.equal(state.interlocks.cutRequiresRegisteredStop,true);
 const sheets=sim.sheets.map(s=>s.mesh.position.clone()),bars=sim.gripperBars.map(b=>b.position.clone());
 advanceTo(4.65);assert.equal(sim.sheets.every((s,i)=>s.mesh.position.distanceTo(sheets[i])<1e-10),true);assert.equal(sim.gripperBars.every((b,i)=>b.position.distanceTo(bars[i])<1e-10),true);
 advanceTo(5.65);state=sim.state();assert.equal(state.transportIndexing,true);assert.ok(sim.sheets.some((s,i)=>s.mesh.position.distanceTo(sheets[i])>.05));assert.ok(sim.gripperBars.some((b,i)=>b.position.distanceTo(bars[i])>.05));sim.dispose();model.dispose();
});

test('Promatrix stripping and blanking execute only at registered stops',()=>{
 const model=new Promatrix106MachineTemplate(),sim=new Promatrix106ProcessSimulation(model.root,model);sim.start();let now=1000;const advanceTo=t=>{while(sim.elapsed<t){now+=20;sim.update(now);}};
 advanceTo(6.70);let state=sim.state();assert.equal(state.strippingActive,true);assert.equal(state.transportStopped,true);assert.equal(state.interlocks.strippingRequiresRegisteredStop,true);
 advanceTo(9.05);state=sim.state();assert.equal(state.blankingActive,true);assert.equal(state.transportStopped,true);assert.equal(state.interlocks.blankingRequiresRegisteredStop,true);
 sim.dispose();model.dispose();
});

test('Promatrix CSB output includes product, waste, non-stop rake and explicitly demo-only tie sheets',()=>{
 const model=new Promatrix106MachineTemplate(),sim=new Promatrix106ProcessSimulation(model.root,model),rake0=sim.rake.position.clone();sim.start();let now=1000,seenRake=false,seenTie=false;
 for(let i=0;i<1500;i++){now+=20;sim.update(now);const s=sim.state();seenRake||=s.deliveryRakeActive;seenTie||=s.tieSheetActive;}
 const state=sim.state();assert.ok(sim.completed>=6);assert.ok(state.pileSheetsVisible>0);assert.ok(state.wastePiecesVisible>0);assert.ok(seenRake);assert.ok(seenTie);assert.equal(state.tieSheetDemoOnly,true);assert.ok(sim.tieSheets.some(t=>t.visible&&t.userData.demoTieSheet));
 sim.stop();assert.ok(sim.rake.position.distanceTo(rake0)<1e-10);assert.equal(sim.tieSheets.every(t=>!t.visible),true);sim.dispose();model.dispose();
});

test('Promatrix pause and resume do not jump the process clock',()=>{
 const model=new Promatrix106MachineTemplate(),sim=new Promatrix106ProcessSimulation(model.root,model);sim.start();sim.update(1000);sim.update(1200);const t=sim.elapsed;sim.pause();sim.update(20000);sim.resume();sim.update(30000);assert.equal(sim.elapsed,t);sim.update(30020);assert.ok(sim.elapsed-t<.03);sim.dispose();model.dispose();
});

test('Promatrix taxonomy is a six-level mapped tree for APM 8 and APM 9',()=>{
 for(const assetId of ['BMJ-MCH-0014','BMJ-MCH-0015']){const taxonomy=promatrix106TaxonomyFor(assetId);assert.deepEqual([...new Set(taxonomy.map(n=>n.level))].sort(),[1,2,3,4,5,6]);assert.equal(new Set(taxonomy.map(n=>n.id)).size,taxonomy.length);for(const n of taxonomy.filter(n=>n.level>1))assert.ok(taxonomy.some(p=>p.id===n.parentId),n.id);const model=new Promatrix106MachineTemplate(assetId);for(const n of taxonomy.filter(n=>n.verified&&n.meshRefs.length))assert.ok(model.resolveTaxonomyNode(n.id),n.id);model.dispose();}
});

test('Promatrix stage sequence makes index and dwell phases explicit',()=>{
 assert.deepEqual(PROMATRIX106_SIMULATION_STAGES,['Pile separation','Suction-belt feed / registration','Registered gripper index to cutting','Cutting pressure dwell','Index to stripping','Stripping action','Index to blanking','Blanking / tie-sheet demo','Index to delivery','Auto-Non-Stop delivery']);
});
