import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {UpgLy300MachineTemplate} from '../frontend/src/upg-ly300.js';
import {UpgLy300ProcessSimulation,UPG_LY300_SIMULATION_STAGES} from '../frontend/src/simulation-upg-ly300.js';
import {UPG_LY300_SPEC} from '../frontend/src/data/dimensions-upg-ly300.js';
import {UPG_LY300_TAXONOMY} from '../frontend/src/data/taxonomy-upg-ly300.js';
import {UPG_LY300_TECHNICAL_SOURCES} from '../frontend/src/data/sources-upg-ly300.js';

test('UPG LY300 OEM process data keeps line and print-speed references distinct',()=>{
 assert.equal(UPG_LY300_SPEC.assetId,'BMJ-MCH-0024');assert.equal(UPG_LY300_SPEC.oemReferenceModel,'LQ-UPG LY300');assert.deepEqual(UPG_LY300_SPEC.envelopeM,[4.230,.720,1.700]);assert.equal(UPG_LY300_SPEC.weightKg,800);
 assert.deepEqual(UPG_LY300_SPEC.materialWidthMm,[50,250]);assert.equal(UPG_LY300_SPEC.lineSpeedMaxMMin,70);assert.equal(UPG_LY300_SPEC.printSpeedReferenceMMin,114);assert.notEqual(UPG_LY300_SPEC.lineSpeedMaxMMin,UPG_LY300_SPEC.printSpeedReferenceMMin);
 assert.equal(UPG_LY300_SPEC.printhead,'Ricoh G5');assert.equal(UPG_LY300_SPEC.cameraInspection,'2K line scan');assert.equal(UPG_LY300_SPEC.uvDryingKw,1);assert.equal(UPG_LY300_SPEC.positioningAccuracyMm,.20);assert.equal(UPG_LY300_SPEC.feedReceiveMethod,'Air cylinder');
 assert.equal(UPG_LY300_SPEC.installedPrintheadCountVerified,false);assert.equal(UPG_LY300_SPEC.installedCoronaTreatmentVerified,false);assert.equal(UPG_LY300_SPEC.installedCollectionStrapperVerified,false);
 assert.ok(UPG_LY300_TECHNICAL_SOURCES.filter(s=>s.authority==='primary').length>=2);assert.ok(UPG_LY300_TECHNICAL_SOURCES.some(s=>s.id==='UPG-LY300-EVIDENCE-BOUNDARY'));
});

test('UPG LY300 geometry preserves exact OEM station train but bounds installed accessories',()=>{
 const model=new UpgLy300MachineTemplate(),box=new THREE.Box3().setFromObject(model.root);assert.ok(!box.isEmpty());assert.ok(box.min.y>=-0.01);assert.equal(model.root.userData.engineeringDimensions,false);assert.match(model.root.userData.geometryStatus,/ACCESSORIES_BOUNDED/);
 for(const id of ['ly300-feeder','ly300-transport','ly300-print','ly300-ink','ly300-uv','ly300-camera','ly300-reject','ly300-collect','ly300-control','ly300-access'])assert.ok(model.findNode(id),id);
 assert.equal(model.findNode('ly300-print-head').userData.installedPrintheadCountVerified,false);assert.equal(model.findNode('ly300-collect-strap').userData.installedStrapperVerified,false);assert.ok(model.meshes.some(m=>m.userData.nozzleArray));assert.ok(model.meshes.some(m=>m.userData.uvLamp));model.dispose();
});

test('UPG LY300 rotor whitelist excludes camera lens ink line and pneumatic reject cylinder',()=>{
 const model=new UpgLy300MachineTemplate(),sim=new UpgLy300ProcessSimulation(model.root,model),allowed=/^(pager-wheel|feeder-vfd-motor|belt-pulley|servo|encoder|negative-pump)$/;
 assert.equal(sim.rotors.length,9);assert.equal(sim.rotors.some(r=>!allowed.test(r.userData.mechanismRole||'')),false);
 assert.equal(model.meshes.some(m=>m.userData.rotor&&['camera-lens','ink-line','reject-cylinder'].includes(m.userData.mechanismRole)),false);assert.equal(sim.uvLamps.length,1);assert.equal(sim.inspectionLights.length,2);sim.dispose();model.dispose();
});

test('UPG LY300 target item must print then cure then inspect before reject routing',()=>{
 const model=new UpgLy300MachineTemplate(),sim=new UpgLy300ProcessSimulation(model.root,model),item=sim.items[0];sim.start();let now=1000;const advanceTo=t=>{while(sim.elapsed<t){now+=20;sim.update(now);}};
 advanceTo(1.0);assert.equal(item.printed,false);assert.equal(item.cured,false);assert.equal(item.inspected,false);assert.equal(item.result,null);
 advanceTo(2.9);assert.equal(item.printed,true);assert.equal(item.cured,false);assert.equal(item.inspected,false);assert.equal(item.code.visible,true);
 advanceTo(3.8);assert.equal(item.printed,true);assert.equal(item.cured,true);assert.equal(item.inspected,false);
 advanceTo(4.5);let state=sim.state();assert.equal(item.printed,true);assert.equal(item.cured,true);assert.equal(item.inspected,true);assert.equal(item.result,'REJECT_DEMO');assert.ok(state.inspectedDemoCount>0);
 advanceTo(5.65);state=sim.state();assert.equal(state.rejectTrackingActive,true);assert.equal(state.demoRejectActive,true);assert.ok(item.group.position.z>0);assert.equal(state.demoRejectOnly,true);
 sim.dispose();model.dispose();
});

test('UPG LY300 UV and camera activity are occupancy-driven and respect upstream prerequisites',()=>{
 const model=new UpgLy300MachineTemplate(),sim=new UpgLy300ProcessSimulation(model.root,model);sim.start();let now=1000,seenPrint=false,seenUv=false,seenCamera=false;for(let i=0;i<430;i++){now+=20;sim.update(now);const s=sim.state();seenPrint||=s.printingActive;seenUv||=s.uvActive;seenCamera||=s.cameraActive;if(s.uvActive)assert.ok(sim.items.some(i=>i.printed));if(s.cameraActive)assert.ok(sim.items.some(i=>i.cured));}
 const state=sim.state();assert.ok(seenPrint&&seenUv&&seenCamera);assert.ok(state.printedDemoCount>=state.curedDemoCount);assert.ok(state.curedDemoCount>=state.inspectedDemoCount);assert.equal(state.installedPrintheadCountVerified,false);sim.dispose();model.dispose();
});

test('UPG LY300 tracked demo produces accepted and rejected output only after inspection',()=>{
 const model=new UpgLy300MachineTemplate(),sim=new UpgLy300ProcessSimulation(model.root,model);sim.start();let now=1000;for(let i=0;i<1100;i++){now+=20;sim.update(now);}
 const state=sim.state();assert.ok(state.completed>0);assert.ok(state.rejectedDemo>0);assert.ok(state.pileSheetsVisible>0);assert.ok(state.rejectSheetsVisible>0);assert.equal(state.demoRejectOnly,true);assert.ok(state.inspectedDemoCount>=state.completed+state.rejectedDemo);
 sim.stop();assert.equal(sim.goodStack.every(m=>!m.visible),true);assert.equal(sim.badStack.every(m=>!m.visible),true);sim.dispose();model.dispose();
});

test('UPG LY300 pause/resume does not jump process time and reset restores rotors',()=>{
 const model=new UpgLy300MachineTemplate(),sim=new UpgLy300ProcessSimulation(model.root,model),q0=sim.rotors.map(r=>r.quaternion.clone());sim.start();sim.update(1000);sim.update(1200);const t=sim.elapsed;sim.pause();sim.update(20000);sim.resume();sim.update(30000);assert.equal(sim.elapsed,t);sim.update(30020);assert.ok(sim.elapsed-t<.03);sim.stop();assert.equal(sim.rotors.every((r,i)=>r.quaternion.angleTo(q0[i])<1e-9),true);sim.dispose();model.dispose();
});

test('UPG LY300 taxonomy is a mapped six-level tree',()=>{
 assert.deepEqual([...new Set(UPG_LY300_TAXONOMY.map(n=>n.level))].sort(),[1,2,3,4,5,6]);assert.equal(new Set(UPG_LY300_TAXONOMY.map(n=>n.id)).size,UPG_LY300_TAXONOMY.length);for(const n of UPG_LY300_TAXONOMY.filter(n=>n.level>1))assert.ok(UPG_LY300_TAXONOMY.some(p=>p.id===n.parentId),n.id);const model=new UpgLy300MachineTemplate();for(const n of UPG_LY300_TAXONOMY.filter(n=>n.verified&&n.meshRefs.length))assert.ok(model.resolveTaxonomyNode(n.id),n.id);model.dispose();
});

test('UPG LY300 process stage order explicitly preserves print cure inspect reject causality',()=>{
 assert.deepEqual(UPG_LY300_SIMULATION_STAGES,['Automatic paging','Servo positioning','Ricoh G5 variable-data print','LED UV curing','2K line-scan inspection','Tracked pass / reject decision demo','Plate-turn reject or accept routing','Collection / strapping interface']);
});
