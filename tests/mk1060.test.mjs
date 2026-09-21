import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {MK1060MachineTemplate} from '../frontend/src/mk1060.js';
import {MK1060ProcessSimulation,MK1060_SIMULATION_STAGES} from '../frontend/src/simulation-mk1060.js';
import {MK1060_SPEC} from '../frontend/src/data/dimensions-mk1060.js';
import {MK1060_TAXONOMY} from '../frontend/src/data/taxonomy-mk1060.js';
import {MK1060_TECHNICAL_SOURCES} from '../frontend/src/data/sources-mk1060.js';

test('MK1060ER identity and model limits retain manual/current manufacturer variants separately',()=>{
 assert.equal(MK1060_SPEC.assetId,'BMJ-MCH-0013');assert.equal(MK1060_SPEC.serial,'20130830062');
 assert.deepEqual(MK1060_SPEC.maxSheet,[1.060,.760]);assert.deepEqual(MK1060_SPEC.minSheet,[.400,.350]);assert.deepEqual(MK1060_SPEC.maxDieCut,[1.060,.745]);assert.deepEqual(MK1060_SPEC.chase,[1.096,.770]);
 assert.deepEqual(MK1060_SPEC.gripperMarginMm,[9,17]);assert.equal(MK1060_SPEC.maxSpeed,6500);assert.equal(MK1060_SPEC.maxCuttingForceTonnes,260);assert.equal(MK1060_SPEC.feederPileMaxM,1.55);assert.equal(MK1060_SPEC.deliveryPileMaxM,1.20);
 assert.deepEqual(MK1060_SPEC.manual2013Reference.envelopeM,[7.05,4.5,2.4]);assert.deepEqual(MK1060_SPEC.masterworkUSAReference.envelopeM,[7.05,4.5,2.6]);
 assert.notEqual(MK1060_SPEC.manual2013Reference.fullLoadKw,MK1060_SPEC.masterworkUSAReference.fullLoadKw);assert.equal(MK1060_SPEC.installedElectricalVariantVerified,false);
 assert.ok(MK1060_TECHNICAL_SOURCES.some(s=>s.id==='MK1060-MANUAL-2013'));assert.ok(MK1060_TECHNICAL_SOURCES.some(s=>s.id==='MK1060-MASTERWORK-USA'));assert.ok(MK1060_TECHNICAL_SOURCES.some(s=>s.id==='MK1060-EVIDENCE-BOUNDARY'));
});

test('MK1060ER geometry is normalized near the manufacturer model length and preserves process stations',()=>{
 const model=new MK1060MachineTemplate(),box=new THREE.Box3().setFromObject(model.root),size=box.getSize(new THREE.Vector3());
 assert.ok(!box.isEmpty());assert.ok(box.min.y>=-0.01);assert.ok(size.x>6.5&&size.x<7.8,`normalized flow length ${size.x}`);
 assert.equal(model.root.userData.engineeringDimensions,false);assert.match(model.root.userData.geometryStatus,/MODEL_ENVELOPE_PROCESS_REFERENCE/);
 for(const id of ['mk1060-feeder','mk1060-register','mk1060-transport','mk1060-platen','mk1060-stripping','mk1060-blanking','mk1060-waste','mk1060-drive','mk1060-access'])assert.ok(model.findNode(id),id);
 model.setExteriorOpen(true);assert.ok(model.root.userData.exteriorHiddenCount>=8);model.dispose();
});

test('MK1060ER rotor whitelist excludes static cylinders and exposes nine intermittent gripper bars',()=>{
 const model=new MK1060MachineTemplate(),sim=new MK1060ProcessSimulation(model.root,model);
 const allowed=/^(pile-lift|feed-wheel|chain-sprocket|torque-limiter|clutch|pressure-eccentric|strip-cam|waste-release|waste-conveyor|main-motor|flywheel)$/;
 assert.equal(sim.rotors.length,25);assert.equal(sim.rotors.some(r=>!allowed.test(r.userData.mechanismRole||'')),false);
 assert.equal(model.meshes.some(m=>m.userData.rotor&&['suction-cup','upper-strip-pin','button'].includes(m.userData.mechanismRole)),false);
 assert.equal(sim.suckers.length,4);assert.equal(sim.gripperBars.length,9);sim.dispose();model.dispose();
});

test('MK1060ER transport truly stops through platen dwell and restarts during index',()=>{
 const model=new MK1060MachineTemplate(),sim=new MK1060ProcessSimulation(model.root,model);sim.start();let now=1000;const advanceTo=t=>{while(sim.elapsed<t){now+=20;sim.update(now);}};
 advanceTo(4.45);let state=sim.state();assert.equal(state.platenClosed,true);assert.equal(state.transportIndexing,false);assert.equal(state.transportStopped,true);assert.equal(state.interlocks.platenDwellRequiresStoppedTransport,true);
 const sheet0=sim.sheets.map(s=>s.mesh.position.clone()),bars0=sim.gripperBars.map(b=>b.position.clone());
 advanceTo(4.80);assert.equal(sim.sheets.every((s,i)=>s.mesh.position.distanceTo(sheet0[i])<1e-10),true);assert.equal(sim.gripperBars.every((b,i)=>b.position.distanceTo(bars0[i])<1e-10),true);
 advanceTo(6.15);state=sim.state();assert.equal(state.transportIndexing,true);assert.ok(sim.sheets.some((s,i)=>s.mesh.position.distanceTo(sheet0[i])>.05));assert.ok(sim.gripperBars.some((b,i)=>b.position.distanceTo(bars0[i])>.05));
 sim.dispose();model.dispose();
});

test('MK1060ER stripping and blanking also occur only while transport is stopped',()=>{
 const model=new MK1060MachineTemplate(),sim=new MK1060ProcessSimulation(model.root,model);sim.start();let now=1000;const advanceTo=t=>{while(sim.elapsed<t){now+=20;sim.update(now);}};
 advanceTo(7.25);let state=sim.state();assert.equal(state.strippingActive,true);assert.equal(state.transportStopped,true);assert.equal(state.interlocks.strippingRequiresStoppedTransport,true);
 advanceTo(9.80);state=sim.state();assert.equal(state.blankingActive,true);assert.equal(state.transportStopped,true);assert.equal(state.interlocks.blankingRequiresStoppedTransport,true);
 advanceTo(12.1);state=sim.state();assert.ok(state.completed>0);assert.ok(state.pileSheetsVisible>0);assert.ok(state.wastePiecesVisible>0);sim.dispose();model.dispose();
});

test('MK1060ER pause/resume does not create a time jump and stop restores mechanisms exactly',()=>{
 const model=new MK1060MachineTemplate(),sim=new MK1060ProcessSimulation(model.root,model),q0=sim.rotors.map(r=>r.quaternion.clone()),bars0=sim.gripperBars.map(b=>b.position.clone());
 sim.start();sim.update(1000);sim.update(1200);const before=sim.elapsed;sim.pause();sim.update(20000);sim.resume();sim.update(30000);assert.equal(sim.elapsed,before);sim.update(30020);assert.ok(sim.elapsed-before<.03);
 sim.stop();assert.equal(sim.rotors.every((r,i)=>r.quaternion.angleTo(q0[i])<1e-9),true);assert.equal(sim.gripperBars.every((b,i)=>b.position.distanceTo(bars0[i])<1e-10),true);sim.dispose();model.dispose();
});

test('MK1060ER taxonomy remains a complete six-level tree mapped to real geometry',()=>{
 assert.deepEqual([...new Set(MK1060_TAXONOMY.map(n=>n.level))].sort(),[1,2,3,4,5,6]);assert.equal(new Set(MK1060_TAXONOMY.map(n=>n.id)).size,MK1060_TAXONOMY.length);
 for(const n of MK1060_TAXONOMY.filter(n=>n.level>1))assert.ok(MK1060_TAXONOMY.some(p=>p.id===n.parentId),n.id);
 const model=new MK1060MachineTemplate();for(const n of MK1060_TAXONOMY.filter(n=>n.verified&&n.meshRefs.length))assert.ok(model.resolveTaxonomyNode(n.id),n.id);model.dispose();
});

test('MK1060ER stage list explicitly separates index and dwell operations',()=>{
 assert.deepEqual(MK1060_SIMULATION_STAGES,['Pile separation','Feed table / registration','Intermittent gripper index to platen','Platen close and pressure dwell','Index to stripping','Double-action stripping','Index to blanking','Blank separation','Index to delivery','Edge-waste / product delivery']);
});
