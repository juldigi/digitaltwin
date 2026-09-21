import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {DianaEye55MachineTemplate} from '../frontend/src/diana-eye55.js';
import {DianaEye55ProcessSimulation,DIANA_EYE55_SIMULATION_STAGES} from '../frontend/src/simulation-diana-eye55.js';
import {DIANA_EYE55_SPEC} from '../frontend/src/data/dimensions-diana-eye55.js';
import {DIANA_EYE55_TAXONOMY} from '../frontend/src/data/taxonomy-diana-eye55.js';
import {DIANA_EYE55_TECHNICAL_SOURCES} from '../frontend/src/data/sources-diana-eye55.js';

test('Diana Eye 55 preserves current OEM capability data and installed-option boundaries',()=>{
 assert.equal(DIANA_EYE55_SPEC.assetId,'BMJ-MCH-0019');assert.equal(DIANA_EYE55_SPEC.serial,'MP.FBA0-00058');assert.equal(DIANA_EYE55_SPEC.year,2023);
 assert.equal(DIANA_EYE55_SPEC.maxSpeedMMin,300);assert.deepEqual(DIANA_EYE55_SPEC.materialGsm,[90,650]);assert.deepEqual(DIANA_EYE55_SPEC.maxSheetM,[.550,.500]);
 assert.deepEqual(DIANA_EYE55_SPEC.minSheetHeidelbergM,[.070,.070]);assert.deepEqual(DIANA_EYE55_SPEC.minSheetMasterworkCurrentM,[.090,.090]);
 assert.deepEqual(DIANA_EYE55_SPEC.cameraCapacity,{top:4,area:2,rear:1});assert.ok(DIANA_EYE55_SPEC.cameraFamilies.includes('7.3K RGB line-scan'));
 assert.deepEqual(DIANA_EYE55_SPEC.rejectActuationOptions,['mechanical','air-nozzle']);assert.equal(DIANA_EYE55_SPEC.installedCameraCountVerified,false);assert.equal(DIANA_EYE55_SPEC.installedCameraMixVerified,false);assert.equal(DIANA_EYE55_SPEC.installedRejectActuationVerified,false);assert.equal(DIANA_EYE55_SPEC.installedStackerVerified,false);
 assert.ok(DIANA_EYE55_TECHNICAL_SOURCES.filter(s=>s.authority==='primary').length>=3);assert.ok(DIANA_EYE55_TECHNICAL_SOURCES.some(s=>s.id==='DIANA-EVIDENCE-BOUNDARY'));
});

test('Diana geometry separates camera capacity references from installed population and shows both reject options as references',()=>{
 const model=new DianaEye55MachineTemplate(),box=new THREE.Box3().setFromObject(model.root);assert.ok(!box.isEmpty());assert.ok(box.min.y>=-0.01);assert.equal(model.root.userData.engineeringDimensions,false);assert.match(model.root.userData.geometryStatus,/INSTALLED_CAMERA_REJECT_OPTIONS_BOUNDED/);
 for(const id of ['diana55-feeder','diana55-transport','diana55-inspection','diana55-camera','diana55-light','diana55-processing','diana55-reject','diana55-reject-gate','diana55-reject-air','diana55-delivery','diana55-access'])assert.ok(model.findNode(id),id);
 assert.equal(model.findNode('diana55-camera-top').userData.capacity,4);assert.equal(model.findNode('diana55-camera-top').userData.installedCountVerified,false);assert.equal(model.findNode('diana55-camera-rear').userData.installedCountVerified,false);assert.equal(model.findNode('diana55-camera-area').userData.capacity,2);
 assert.equal(model.findNode('diana55-reject').userData.installedRejectActuationVerified,false);assert.equal(model.findNode('diana55-reject-gate').userData.rejectReference,'mechanical');assert.equal(model.findNode('diana55-reject-air').userData.rejectReference,'air-nozzle');model.dispose();
});

test('Diana rotor whitelist contains only feeder transport vacuum and delivery rotating hardware',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model),allowed=/^(feed-pulley|transport-pulley|vacuum-blower|delivery-pulley)$/;
 assert.equal(sim.rotors.length,25);assert.equal(sim.rotors.some(r=>!allowed.test(r.userData.mechanismRole||'')),false);
 assert.equal(model.meshes.some(m=>m.userData.rotor&&['camera-lens','rear-camera','area-camera','reject-air-nozzle'].includes(m.userData.mechanismRole)),false);assert.equal(sim.airNozzles.length,4);sim.dispose();model.dispose();
});

test('Diana reject demo is causally downstream of a stored inspection result',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model),b0=sim.blanks[0];sim.start();let now=1000;const advanceTo=t=>{while(sim.elapsed<t){now+=20;sim.update(now);}};
 advanceTo(.6);let state=sim.state();assert.equal(state.inspectedDemoCount,0);assert.equal(state.demoRejectActive,false);assert.equal(b0.result,null);
 advanceTo(3.2);state=sim.state();assert.ok(state.inspectedDemoCount>0);assert.equal(b0.result,'REJECT_DEMO');assert.equal(state.demoRejectActive,false);
 advanceTo(5.8);state=sim.state();assert.equal(b0.result,'REJECT_DEMO');assert.equal(state.rejectTrackingActive,true);assert.equal(state.demoRejectActive,true);assert.equal(state.demoRejectOnly,true);assert.equal(state.demoRejectActuator,'MECHANICAL_REFERENCE');
 sim.dispose();model.dispose();
});

test('Diana scan lights follow inspection occupancy and result tracking remains demo-only',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);sim.start();let now=1000,seenScan=false,seenProcessing=false,seenReject=false,seenAccepted=false;
 for(let i=0;i<450;i++){now+=20;sim.update(now);const s=sim.state();seenScan||=s.scanActive;seenProcessing||=s.imageProcessingActive;seenReject||=s.rejectTrackingActive;seenAccepted||=s.acceptedDeliveryActive;if(s.scanActive)assert.ok(sim.lights.some(l=>l.material.emissiveIntensity>1));}
 assert.ok(seenScan&&seenProcessing&&seenReject&&seenAccepted);const s=sim.state();assert.equal(s.installedCameraCountVerified,false);assert.equal(s.installedRejectActuationVerified,false);assert.ok(s.inspectedDemoCount>0);sim.dispose();model.dispose();
});

test('Diana tracked demo produces both accepted and rejected collection without claiming a defect rate',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);sim.start();let now=1000;for(let i=0;i<1200;i++){now+=20;sim.update(now);}
 const state=sim.state();assert.ok(state.completed>0);assert.ok(state.rejectedDemo>0);assert.ok(state.pileSheetsVisible>0);assert.ok(state.rejectSheetsVisible>0);assert.equal(state.demoRejectOnly,true);
 sim.stop();assert.equal(sim.goodStack.every(m=>!m.visible),true);assert.equal(sim.rejectStack.every(m=>!m.visible),true);assert.equal(sim.lights.every(l=>l.material.emissiveIntensity<=.14),true);sim.dispose();model.dispose();
});

test('Diana pause/resume does not create a process-clock jump',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);sim.start();sim.update(1000);sim.update(1200);const t=sim.elapsed;sim.pause();sim.update(20000);sim.resume();sim.update(30000);assert.equal(sim.elapsed,t);sim.update(30020);assert.ok(sim.elapsed-t<.03);sim.dispose();model.dispose();
});

test('Diana taxonomy is a mapped six-level tree',()=>{
 assert.deepEqual([...new Set(DIANA_EYE55_TAXONOMY.map(n=>n.level))].sort(),[1,2,3,4,5,6]);assert.equal(new Set(DIANA_EYE55_TAXONOMY.map(n=>n.id)).size,DIANA_EYE55_TAXONOMY.length);for(const n of DIANA_EYE55_TAXONOMY.filter(n=>n.level>1))assert.ok(DIANA_EYE55_TAXONOMY.some(p=>p.id===n.parentId),n.id);const model=new DianaEye55MachineTemplate();for(const n of DIANA_EYE55_TAXONOMY.filter(n=>n.verified&&n.meshRefs.length))assert.ok(model.resolveTaxonomyNode(n.id),n.id);model.dispose();
});

test('Diana process stages explicitly preserve inspection before tracked reject',()=>{
 assert.deepEqual(DIANA_EYE55_SIMULATION_STAGES,['Blank feed','Suction-belt transport','LED illumination + camera capture','Image processing demo','Tracked pass / reject decision demo','Reject actuation demo','Accepted blank delivery','Output collection']);
});
