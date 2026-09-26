import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {MK920MachineTemplate} from '../frontend/src/mk920.js';
import {MK920StampingSimulation,MK920_SIMULATION_STAGES} from '../frontend/src/simulation-mk920.js';
import {MK920_SPEC,MK920_SPEC_APM6} from '../frontend/src/data/dimensions-mk920.js';
import {mk920TaxonomyFor} from '../frontend/src/data/taxonomy-mk920.js';
import {MK920_TECHNICAL_SOURCES} from '../frontend/src/data/sources-mk920.js';

test('MK920 YMI identities stay exact while related YM details remain reference-only',()=>{
 assert.equal(MK920_SPEC.assetId,'BMJ-MCH-0011');assert.equal(MK920_SPEC.serial,'20110509330');assert.equal(MK920_SPEC_APM6.assetId,'BMJ-MCH-0012');assert.equal(MK920_SPEC_APM6.serial,'20130529398A');assert.equal(MK920_SPEC_APM6.sap,'APM-6');
 assert.deepEqual(MK920_SPEC.maxSheet,[.920,.650]);assert.equal(MK920_SPEC.maxStampingSpeed,6500);assert.equal(MK920_SPEC.foilPullAxes,3);assert.equal(MK920_SPEC.foilAdvanceIncrementMm,1);
 assert.equal(MK920_SPEC.installedReelCountVerified,false);assert.equal(MK920_SPEC.installedHeatingZoneCountVerified,false);assert.equal(MK920_SPEC.installedPlatenForceVerified,false);assert.equal(MK920_SPEC.installedEnvelopeVerified,false);assert.equal(MK920_SPEC.installedTransverseFoilAxesVerified,false);
 assert.deepEqual(MK920_SPEC.relatedYMMarketReference.minSheet,[.360,.320]);assert.equal(MK920_SPEC.relatedYMMarketReference.heatingZones,20);assert.equal(MK920_SPEC.relatedYMMarketReference.foilPullTransverse,2);
 assert.ok(MK920_TECHNICAL_SOURCES.some(s=>s.id==='MK-OEM-SPARES'));assert.ok(MK920_TECHNICAL_SOURCES.some(s=>s.id==='MK920-YM-RELATED-REFERENCE'));assert.ok(MK920_TECHNICAL_SOURCES.some(s=>s.id==='MK920-EVIDENCE-BOUNDARY'));
});

test('both BMJ MK920 assets instantiate dedicated process geometry without claiming exact installation dimensions',()=>{
 for(const assetId of ['BMJ-MCH-0011','BMJ-MCH-0012']){const model=new MK920MachineTemplate(assetId),box=new THREE.Box3().setFromObject(model.root);assert.equal(model.root.userData.assetId,assetId);assert.equal(model.root.userData.engineeringDimensions,false);assert.match(model.root.userData.geometryStatus,/INSTALLED_OPTIONS_BOUNDED/);assert.ok(!box.isEmpty());assert.ok(box.min.y>=-0.01);
  for(const id of ['mk920-feeder','mk920-register','mk920-foil','mk920-foil-web','mk920-platen','mk920-transport','mk920-delivery','mk920-drive','mk920-access'])assert.ok(model.findNode(id),id);
  assert.equal(model.findNode('mk920-foil-unwind').userData.installedReelCountVerified,false);assert.equal(model.findNode('mk920-transport-bar').userData.installedBarCountVerified,false);
  model.setExteriorOpen(true);assert.ok(model.root.userData.exteriorHiddenCount>=6);model.dispose();}
});

test('MK920 rotor whitelist excludes static suction and guard hardware while preserving three foil pull axes',()=>{
 const model=new MK920MachineTemplate(),sim=new MK920StampingSimulation(model.root,model);
 const allowed=/^(lift-chain|blower|feed-wheel|eccentric|foil-reel|reel-shaft|foil-pull-\d+|foil-idler|foil-guide|waste-rewind|chain-sprocket|index-cam|release-cam|main-motor|flywheel|clutch)$/;
 assert.equal(sim.rotors.length,37);assert.equal(sim.rotors.some(r=>!allowed.test(r.userData.mechanismRole||'')),false);assert.equal(model.meshes.some(m=>m.userData.rotor&&m.userData.mechanismRole==='sucker'),false);
 assert.equal(sim.suckers.length,4);assert.equal(sim.foilAxes.length,3);assert.equal(sim.foilWebs.length,3);assert.equal(sim.gripperBars.length,6);sim.dispose();model.dispose();
});

test('MK920 heater stays ready while pressure contact is cyclic and transport is stopped',()=>{
 const model=new MK920MachineTemplate(),sim=new MK920StampingSimulation(model.root,model);sim.start();let now=1000;const advanceTo=t=>{while(sim.elapsed<t){now+=20;sim.update(now);}};
 advanceTo(4.5);let state=sim.state();assert.equal(state.heaterReady,true);assert.equal(state.pressureDwell,true);assert.equal(state.stampingContact,true);assert.equal(state.transportStopped,true);assert.equal(state.foilAdvancing,false);assert.equal(state.interlocks.pressureRequiresStoppedTransport,true);
 assert.ok(sim.heaters.every(h=>h.material.emissiveIntensity>0));
 const sheets=sim.sheets.map(s=>s.mesh.position.clone()),bars=sim.gripperBars.map(b=>b.position.clone());
 advanceTo(5.8);assert.equal(sim.sheets.every((s,i)=>s.mesh.position.distanceTo(sheets[i])<1e-10),true);assert.equal(sim.gripperBars.every((b,i)=>b.position.distanceTo(bars[i])<1e-10),true);
 sim.dispose();model.dispose();
});

test('MK920 foil pull and waste rewind cannot run during platen dwell and start only after platen opens',()=>{
 const model=new MK920MachineTemplate(),sim=new MK920StampingSimulation(model.root,model);sim.start();let now=1000;const advanceTo=t=>{while(sim.elapsed<t){now+=20;sim.update(now);}};
 advanceTo(5.0);let state=sim.state();assert.equal(state.pressureDwell,true);assert.equal(state.foilAdvancing,false);assert.equal(state.wasteRewinding,false);assert.equal(state.interlocks.foilAdvanceForbiddenDuringDwell,true);
 const foilQ=sim.foilAxes.map(r=>r.quaternion.clone());
 advanceTo(7.6);state=sim.state();assert.equal(state.platenClosed,false);assert.equal(state.foilAdvancing,true);assert.equal(state.wasteRewinding,true);assert.equal(state.interlocks.foilAdvanceRequiresOpenPlaten,true);assert.ok(sim.foilAxes.some((r,i)=>r.quaternion.angleTo(foilQ[i])>.01));
 sim.dispose();model.dispose();
});

test('MK920 gripper indexing resumes after platen opens and delivery sheets settle onto an empty pile table',()=>{
 const model=new MK920MachineTemplate(),sim=new MK920StampingSimulation(model.root,model);sim.start();let now=1000,seenRelease=false;for(let i=0;i<900;i++){now+=20;sim.update(now);seenRelease||=sim.state().gripperReleaseActive;}
 const state=sim.state();assert.ok(sim.completed>0);assert.ok(state.pileSheetsVisible>0);assert.ok(seenRelease);assert.equal(sim.staticDeliveryStack.visible,false);assert.ok(sim.stack.filter(p=>p.visible).every(p=>p.position.y>=.466));
 sim.stop();assert.equal(sim.stack.every(p=>!p.visible),true);assert.equal(sim.heaters.every(h=>h.material.emissiveIntensity===0),true);sim.dispose();model.dispose();
});

test('MK920 pause/resume does not create a process time jump and reset restores rotor/bar state',()=>{
 const model=new MK920MachineTemplate(),sim=new MK920StampingSimulation(model.root,model),q0=sim.rotors.map(r=>r.quaternion.clone()),b0=sim.gripperBars.map(b=>b.position.clone());sim.start();sim.update(1000);sim.update(1200);const t=sim.elapsed;sim.pause();sim.update(20000);sim.resume();sim.update(30000);assert.equal(sim.elapsed,t);sim.update(30020);assert.ok(sim.elapsed-t<.03);
 sim.stop();assert.equal(sim.rotors.every((r,i)=>r.quaternion.angleTo(q0[i])<1e-9),true);assert.equal(sim.gripperBars.every((b,i)=>b.position.distanceTo(b0[i])<1e-10),true);sim.dispose();model.dispose();
});

test('MK920 taxonomy remains a valid six-level tree for APM5 and APM6',()=>{
 for(const assetId of ['BMJ-MCH-0011','BMJ-MCH-0012']){const taxonomy=mk920TaxonomyFor(assetId);assert.deepEqual([...new Set(taxonomy.map(n=>n.level))].sort(),[1,2,3,4,5,6]);assert.equal(new Set(taxonomy.map(n=>n.id)).size,taxonomy.length);for(const n of taxonomy.filter(n=>n.level>1))assert.ok(taxonomy.some(p=>p.id===n.parentId),n.id);const model=new MK920MachineTemplate(assetId);for(const n of taxonomy.filter(n=>n.verified&&n.meshRefs.length))assert.ok(model.resolveTaxonomyNode(n.id),n.id);model.dispose();}
});

test('MK920 stage list explicitly separates platen pressure from foil advance',()=>{
 assert.deepEqual(MK920_SIMULATION_STAGES,['Pile separation','Feed-table registration','Intermittent gripper index to platen','Platen close','Pressure / hot-foil dwell','Platen open','Foil advance + waste rewind','Gripper index to delivery','Gripper release','Delivery pile']);
});
