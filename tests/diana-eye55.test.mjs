import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {DianaEye55MachineTemplate} from '../frontend/src/diana-eye55.js';
import {DianaEye55ProcessSimulation,DIANA_EYE55_SIMULATION_STAGES} from '../frontend/src/simulation-diana-eye55.js';
import {DIANA_EYE55_SPEC} from '../frontend/src/data/dimensions-diana-eye55.js';
import {DIANA_EYE55_TAXONOMY} from '../frontend/src/data/taxonomy-diana-eye55.js';
import {DIANA_EYE55_TECHNICAL_SOURCES} from '../frontend/src/data/sources-diana-eye55.js';

test('DIANA EYE 55 preserves BMJ identity and capability-vs-installed boundaries',()=>{
 assert.equal(DIANA_EYE55_SPEC.assetId,'BMJ-MCH-0019');assert.equal(DIANA_EYE55_SPEC.serial,'MP.FBA0-00058');assert.equal(DIANA_EYE55_SPEC.year,2023);
 assert.equal(DIANA_EYE55_SPEC.maxSpeedMMin,300);assert.deepEqual(DIANA_EYE55_SPEC.materialGsm,[90,650]);assert.deepEqual(DIANA_EYE55_SPEC.maxSheetM,[.550,.500]);
 assert.deepEqual(DIANA_EYE55_SPEC.minSheetHeidelbergM,[.070,.070]);assert.deepEqual(DIANA_EYE55_SPEC.minSheetMasterworkCurrentM,[.090,.090]);
 assert.deepEqual(DIANA_EYE55_SPEC.cameraCapacity,{top:4,area:2,rear:1});assert.deepEqual(DIANA_EYE55_SPEC.rejectActuationOptions,['mechanical','air-nozzle']);
 assert.equal(DIANA_EYE55_SPEC.installedCameraCountVerified,false);assert.equal(DIANA_EYE55_SPEC.installedCameraMixVerified,false);assert.equal(DIANA_EYE55_SPEC.installedRejectActuationVerified,false);assert.equal(DIANA_EYE55_SPEC.installedStackerVerified,false);
 assert.deepEqual(DIANA_EYE55_SPEC.officialCurrentEnvelopeM.standardFeederFishScaleDelivery,[7.472,2.900,2.025]);assert.equal(DIANA_EYE55_SPEC.modeledEnvelopeMode,'STANDARD_FEEDER_FISH_SCALE_DELIVERY_REFERENCE');
 assert.ok(DIANA_EYE55_TECHNICAL_SOURCES.filter(s=>s.authority==='primary').length>=4);assert.ok(DIANA_EYE55_TECHNICAL_SOURCES.some(s=>s.id==='DIANA-MASTERWORK-CURRENT-V252'));assert.ok(DIANA_EYE55_TECHNICAL_SOURCES.some(s=>s.id==='DIANA-EVIDENCE-BOUNDARY'));
});

test('DIANA geometry follows low feeder, single white inspection cell and fish-scale delivery without claiming option population',()=>{
 const model=new DianaEye55MachineTemplate(),box=new THREE.Box3().setFromObject(model.root);assert.ok(!box.isEmpty());assert.ok(box.min.y>=-0.01);assert.equal(model.root.userData.engineeringDimensions,false);assert.match(model.root.userData.geometryStatus,/BMJ_INSTALLED_OPTIONS_BOUNDED/);assert.equal(model.root.userData.modeledEnvelopeMode,'STANDARD_FEEDER_FISH_SCALE_DELIVERY_REFERENCE');
 for(const id of ['diana55-feeder','diana55-transport','diana55-inspection','diana55-camera','diana55-light','diana55-processing','diana55-reject','diana55-reject-gate','diana55-reject-air','diana55-delivery','diana55-access'])assert.ok(model.findNode(id),id);
 assert.equal(model.findNode('diana55-camera-top').userData.capacity,4);assert.equal(model.findNode('diana55-camera-top').userData.installedCountVerified,false);
 assert.equal(model.findNode('diana55-camera-rear').userData.capacity,1);assert.equal(model.findNode('diana55-camera-area').userData.capacity,2);
 assert.equal(model.findNode('diana55-reject').userData.installedRejectActuationVerified,false);assert.equal(model.findNode('diana55-reject-gate').userData.rejectReference,'neutral-diverter');assert.equal(model.findNode('diana55-reject-air').visible,false);assert.equal(model.findNode('diana55-reject-air').userData.capabilityOnly,true);
 assert.equal(model.meshes.filter(m=>m.userData.cameraBay).length,4);assert.equal(model.meshes.filter(m=>m.userData.cameraPopulationReference).length,1);assert.equal(model.meshes.filter(m=>m.userData.rejectAirNozzle).length,4);assert.ok(model.meshes.filter(m=>m.userData.inspectionLight).length>=8);assert.equal(model.findNode('diana55-delivery-stack').userData.deliveryMode,'FISH_SCALE_STANDARD_REFERENCE');
 model.setExteriorOpen(true);assert.ok(model.root.userData.exteriorHiddenCount>=6);model.dispose();
});

test('DIANA rotor whitelist rotates only feeder transport vacuum and delivery mechanisms',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model),allowed=/^(feed-pulley|transport-pulley|transport-drive-motor|transport-encoder|vacuum-blower|delivery-pulley)$/;
 assert.ok(sim.rotors.length>=24);assert.equal(sim.rotors.some(r=>!allowed.test(r.userData.mechanismRole||'')),false);
 assert.equal(model.meshes.some(m=>m.userData.rotor&&['camera-lens','rear-camera','area-camera','reject-air-nozzle'].includes(m.userData.mechanismRole)),false);
 sim.dispose();model.dispose();
});

test('DIANA does not assign a pass/reject decision before a blank reaches the inspection zone',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);sim.start();sim.update(1000);sim.update(1010);
 const pending=sim.blanks.filter(b=>b.lastT<.30);assert.ok(pending.length>0);assert.equal(pending.every(b=>b.result===null&&b.trackingId===null),true);
 sim.dispose();model.dispose();
});

test('DIANA deterministic demo assigns stable tracking IDs at inspection and carries the same reject blank to the gate',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);sim.start();let now=1000,seenRejectId=null,seenGateId=null;
 for(let i=0;i<1200;i++){now+=10;sim.update(now);const state=sim.state();
  const reject=sim.blanks.find(b=>b.result==='REJECT_DEMO'&&b.trackingId);if(reject&&!seenRejectId)seenRejectId=reject.trackingId;
  if(state.demoRejectActive&&state.activeRejectTrackingIds.length){seenGateId=state.activeRejectTrackingIds[0];break;}
 }
 assert.ok(seenRejectId);assert.ok(seenGateId);assert.equal(seenGateId,seenRejectId);assert.match(seenGateId,/^DIANA-DEMO-\d{5}$/);
 const state=sim.state();assert.equal(state.demoRejectOnly,true);assert.equal(state.deterministicDefectInjection,'EVERY_5TH_INSPECTED_BLANK_DEMO_ONLY');assert.equal(state.installedRejectActuationVerified,false);assert.equal(state.installedCameraCountVerified,false);
 sim.dispose();model.dispose();
});

test('DIANA rejects only tracked reject blanks and accepted blanks remain on the main delivery path',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);sim.start();let now=1000,seenReject=false,seenPass=false;
 for(let i=0;i<1500;i++){now+=10;sim.update(now);const state=sim.state();seenReject||=state.rejectTrackingActive&&state.activeRejectTrackingIds.length>0;seenPass||=state.acceptedDeliveryActive&&state.activePassTrackingIds.length>0;}
 const state=sim.state();assert.ok(seenReject&&seenPass);assert.ok(state.inspectedDemoCount>0);assert.ok(state.completed+state.rejectedDemo>0);assert.ok(state.pileSheetsVisible+state.rejectSheetsVisible>0);assert.equal(state.deliveryMode,'DUAL_FISH_SCALE_FINISHED_AND_WASTE_REFERENCE');
 assert.equal(sim.blanks.every(b=>!b.result||b.inspectedLap===b.lap),true);
 sim.dispose();model.dispose();
});

test('DIANA optical illumination follows scan occupancy and resets cleanly',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);sim.start();let now=1000,seenScan=false;
 for(let i=0;i<600;i++){now+=10;sim.update(now);if(sim.state().scanActive){seenScan=true;assert.ok(sim.lights.every(l=>l.material.emissiveIntensity>1));break;}}
 assert.ok(seenScan);sim.stop();assert.equal(sim.lights.every(l=>l.material.emissiveIntensity<.2),true);assert.equal(sim.rotors.every((r,i)=>r.quaternion.angleTo(sim.rotorRest[i])<1e-9),true);sim.dispose();model.dispose();
});

test('DIANA feeds blanks progressively, scans at the cell, and deposits each output once',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);
 assert.ok(sim.staticDeliveryReferences.length>0);sim.start();assert.equal(sim.staticDeliveryReferences.every(m=>!m.visible),true);
 let now=1000;sim.update(now);now+=10;sim.update(now);assert.equal(sim.state().sheetsVisible,1);
 let sawScan=false,sawOutput=false;
 for(let i=0;i<1100;i++){now+=10;sim.update(now);const first=sim.blanks[0],s=sim.state();
  if(s.scanActive){sawScan=true;assert.ok(sim.blanks.some(b=>b.mesh.visible&&b.lastT>=sim.scanStart&&b.lastT<sim.scanEnd));}
  if(first.result)assert.ok(first.lastT>=sim.decisionAt);
  if(s.completed+s.rejectedDemo>0){sawOutput=true;assert.ok(s.pileSheetsVisible+s.rejectSheetsVisible>0);}
 }
 assert.ok(sawScan&&sawOutput);assert.equal(sim.completed+sim.rejected,sim.goodStack.filter(m=>m.visible).length+sim.rejectStack.filter(m=>m.visible).length);
 sim.stop();assert.deepEqual(sim.staticDeliveryReferences.map(m=>m.visible),sim.staticDeliveryVisibility);sim.dispose();model.dispose();
});

test('DIANA pause/resume does not create a process-clock jump',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);sim.start();sim.update(1000);sim.update(1200);const t=sim.elapsed;sim.pause();sim.update(20000);sim.resume();sim.update(30000);assert.equal(sim.elapsed,t);sim.update(30020);assert.ok(sim.elapsed-t<.03);sim.dispose();model.dispose();
});

test('DIANA taxonomy is a mapped six-level tree including both reject actuator references',()=>{
 assert.deepEqual([...new Set(DIANA_EYE55_TAXONOMY.map(n=>n.level))].sort(),[1,2,3,4,5,6]);assert.equal(new Set(DIANA_EYE55_TAXONOMY.map(n=>n.id)).size,DIANA_EYE55_TAXONOMY.length);
 for(const n of DIANA_EYE55_TAXONOMY.filter(n=>n.level>1))assert.ok(DIANA_EYE55_TAXONOMY.some(p=>p.id===n.parentId),n.id);
 const model=new DianaEye55MachineTemplate();for(const n of DIANA_EYE55_TAXONOMY.filter(n=>n.verified&&n.meshRefs.length))assert.ok(model.resolveTaxonomyNode(n.id),n.id);assert.ok(DIANA_EYE55_TAXONOMY.some(n=>n.meshRefs.includes('diana55-reject-air')));model.dispose();
});

test('DIANA stage order preserves inspection decision tracking and fish-scale delivery',()=>{
 assert.deepEqual(DIANA_EYE55_SIMULATION_STAGES,['Pengumpanan blank','Suction-belt transport','LED illumination + camera capture','Pemrosesan citra demo','Pelacakan keputusan pass / reject','Ejection demo','Fish-scale delivery','Pengumpulan output']);
});


test('V254 DIANA routes accepted and rejected blanks to separate fish-scale lanes without an invented actuator claim',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);sim.start();let now=1000,goodZ=null,badZ=null,sawWaste=false;
 for(let i=0;i<1600;i++){now+=10;sim.update(now);const st=sim.state();sawWaste||=st.wasteDeliveryActive;for(const b of sim.blanks){if(b.result==='PASS_DEMO'&&b.mesh.visible&&b.lastT>.84)goodZ=b.mesh.position.z;if(b.result==='REJECT_DEMO'&&b.mesh.visible&&b.lastT>.84)badZ=b.mesh.position.z;}if(sawWaste&&goodZ!==null&&badZ!==null)break;}
 assert.ok(sawWaste);assert.ok(goodZ<0);assert.ok(badZ>0);assert.ok(Math.abs(goodZ-badZ)>.25);
 assert.equal(sim.state().demoRejectActuator,'NEUTRAL_DAMAGE_FREE_EJECTION_REFERENCE__INSTALLED_ACTUATOR_UNVERIFIED');
 sim.dispose();model.dispose();
});
