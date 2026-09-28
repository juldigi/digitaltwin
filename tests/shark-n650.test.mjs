import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {SharkN650MachineTemplate} from '../frontend/src/shark-n650.js';
import {SharkN650ProcessSimulation,SHARK_N650_SIMULATION_STAGES} from '../frontend/src/simulation-shark-n650.js';
import {SHARK_N650_SPEC} from '../frontend/src/data/dimensions-shark-n650.js';
import {SHARK_N650_TAXONOMY} from '../frontend/src/data/taxonomy-shark-n650.js';
import {SHARK_N650_TECHNICAL_SOURCES} from '../frontend/src/data/sources-shark-n650.js';

test('SHARK N650 preserves exact BMJ suffix and conflicting current official format references without guessing',()=>{
 assert.equal(SHARK_N650_SPEC.assetId,'BMJ-MCH-0020');assert.equal(SHARK_N650_SPEC.model,'FS-SHARK-N650-P3N1');assert.equal(SHARK_N650_SPEC.serial,'FPS241216001');assert.equal(SHARK_N650_SPEC.year,2025);
 assert.equal(SHARK_N650_SPEC.currentFamilyMaxSpeedMMin,400);assert.deepEqual(SHARK_N650_SPEC.currentFamilyMinInspectionM,[.070,.090]);
 assert.deepEqual(SHARK_N650_SPEC.currentPublishedMaxInspectionReferencesM.english,[.630,.300]);assert.deepEqual(SHARK_N650_SPEC.currentPublishedMaxInspectionReferencesM.chinese,[.630,.450]);
 assert.equal(SHARK_N650_SPEC.currentPageFormatDiscrepancyVerified,true);assert.equal(SHARK_N650_SPEC.installedMaxInspectionFormatVerified,false);
 assert.match(SHARK_N650_SPEC.currentPublishedPaperWeightRaw,/g\/mm²/);
 assert.equal(SHARK_N650_SPEC.suffixDecoded,false);assert.equal(SHARK_N650_SPEC.installedFeederModeVerified,false);assert.equal(SHARK_N650_SPEC.installedCameraPackageVerified,false);assert.equal(SHARK_N650_SPEC.installedRejectTypeVerified,false);assert.equal(SHARK_N650_SPEC.installedCollectionModeVerified,false);
 assert.deepEqual(SHARK_N650_SPEC.modeledEnvelopeReferenceM,{length:6.80,width:1.50,height:2.50,mode:'FISH_SCALE_OFFLINE',mapping:'L×H×W_FROM_OEM_RAW_ORDER'});assert.equal(SHARK_N650_SPEC.negativePitchOfficial,true);assert.equal(SHARK_N650_SPEC.goodBadReturnLineOfficial,true);
 assert.ok(SHARK_N650_TECHNICAL_SOURCES.some(s=>s.id==='FOCUSIGHT-N650-OFFICIAL'));assert.ok(SHARK_N650_TECHNICAL_SOURCES.some(s=>s.id==='FOCUSIGHT-N650-OFFICIAL-ZH'));assert.ok(SHARK_N650_TECHNICAL_SOURCES.some(s=>s.id==='SHARK-N650-EVIDENCE-BOUNDARY'));
});

test('SHARK geometry keeps feeder camera reject and collection alternatives as references',()=>{
 const model=new SharkN650MachineTemplate(),box=new THREE.Box3().setFromObject(model.root);assert.ok(!box.isEmpty());assert.ok(box.min.y>=-0.01);assert.equal(model.root.userData.engineeringDimensions,false);assert.match(model.root.userData.geometryStatus,/P3N1_OPTIONS_UNDECODED/);
 for(const id of ['shark650-feeder','shark650-transfer','shark650-inspection','shark650-vision','shark650-processing','shark650-reject','shark650-return','shark650-access'])assert.ok(model.findNode(id),id);
 assert.equal(model.findNode('shark650-feed-suction').userData.installedModeVerified,false);assert.equal(model.findNode('shark650-feed-friction').userData.installedModeVerified,false);assert.equal(model.findNode('shark650-feed-friction').visible,false);assert.equal(model.findNode('shark650-feed-friction').userData.capabilityOnly,true);
 assert.equal(model.findNode('shark650-vision-camera').userData.referenceBayCount,3);assert.equal(model.findNode('shark650-vision-camera').userData.installedCameraCountVerified,false);assert.equal(model.findNode('shark650-vision-camera').userData.p3SuffixDecoded,false);
 assert.equal(model.root.userData.visualRefinement,'V258_SHARK_N650_TOWER_OPEN_BAY_RETURN_REALISM');
 assert.equal(model.findNode('shark650-process-hmi').visible,false);assert.equal(model.findNode('shark650-access-platform').visible,false);
 for(const id of ['shark650-local-service-step-v254','shark650-feeder-hood-v254','shark650-reject-guard-v254','shark650-reject-confirm-v254','shark650-return-monitor-v254','shark650-dust-integration-capability-v254'])assert.ok(model.findNode(id),id);
 assert.equal(model.findNode('shark650-dust-integration-capability-v254').visible,false);assert.equal(model.findNode('shark650-dust-integration-capability-v254').userData.capabilityOnly,true);
 assert.ok(model.meshes.filter(m=>m.userData.returnReference==='GOOD_FISH_SCALE').length>=9);assert.ok(model.meshes.filter(m=>m.userData.returnReference==='BAD_RETURN').length>=9);
 assert.equal(model.findNode('shark650-reject').userData.installedRejectTypeVerified,false);assert.equal(model.findNode('shark650-reject-plate').userData.rejectReference,'NEUTRAL_KICK_OFF_PATH');assert.equal(model.findNode('shark650-reject-air').userData.rejectReference,'AIR_OPTION');assert.equal(model.findNode('shark650-reject-air').visible,false);assert.equal(model.findNode('shark650-return').userData.installedCollectionModeVerified,false);assert.equal(model.findNode('shark650-return').userData.officialGoodBadReturnLine,true);model.dispose();
});

test('V258 SHARK grounds the main chassis, points the neutral optic at the bed and structurally frames the reject bay',()=>{
 const model=new SharkN650MachineTemplate();
 try{
  assert.equal(model.root.userData.visualRefinement,'V258_SHARK_N650_TOWER_OPEN_BAY_RETURN_REALISM');
  assert.equal(model.root.userData.opticalAxisPolicy,'NEUTRAL_REFERENCE_HEAD_POINTS_DOWN_TO_INSPECTION_BED__P3N1_CAMERA_PACKAGE_UNDECODED');
  const camera=model.findNode('shark650-vision-camera'),lens=camera.children.find(o=>o.isMesh&&o.userData.mechanismRole==='camera-lens');
  assert.ok(lens);assert.equal(lens.userData.opticalAxis,'NEGATIVE_Y_TOWARD_INSPECTION_BED');assert.equal(lens.userData.opticalTargetY,.78);
  const feet=model.findNode('shark650-leveling-feet-v258');assert.ok(feet);
  const pads=[];feet.traverse(o=>{if(o.isMesh&&o.userData.floorContact)pads.push(o);});assert.equal(pads.length,12);assert.ok(pads.every(p=>Math.abs(p.position.y-.018)<1e-9));
  const tower=model.findNode('shark650-inspection-tower'),headers=[];tower.traverse(o=>{if(o.isMesh&&o.userData.towerIdentityHeader)headers.push(o);});assert.equal(headers.length,2);
  const bay=model.findNode('shark650-open-reject-bay-v258');assert.ok(bay);const structures=[];bay.traverse(o=>{if(o.isMesh&&o.userData.structuralOpenBay)structures.push(o);});assert.equal(structures.length,6);
  assert.equal(bay.userData.policy,'STRUCTURAL_FRAME_ONLY__EXACT_REJECT_ACTUATOR_REMAINS_UNVERIFIED');
  assert.equal(model.findNode('shark650-return').userData.v258ReturnPolicy,'OFFICIAL_GOOD_BAD_RETURN_LINE__LOW_CONTINUOUS_LANES__VERTICAL_PALLETIZER_CAPABILITY_ONLY');
 }finally{model.dispose();}
});

test('SHARK rotor whitelist excludes suction cups camera lenses and air nozzles',()=>{
 const model=new SharkN650MachineTemplate(),sim=new SharkN650ProcessSimulation(model.root,model),allowed=/^(transport-pulley|transfer-drive-motor|transfer-encoder|vacuum-blower|inspection-encoder-wheel|good-return|good-return-motor|bad-return|bad-return-motor)$/;
 assert.equal(sim.rotors.length,30);assert.equal(sim.rotors.some(r=>!allowed.test(r.userData.mechanismRole||'')),false);assert.equal(sim.suckers.length,4);assert.equal(sim.airNozzles.length,3);
 assert.equal(model.meshes.some(m=>m.userData.rotor&&['suction-cup','camera-lens','air-nozzle'].includes(m.userData.mechanismRole)),false);sim.dispose();model.dispose();
});

test('SHARK blank remains undecided before inspection and receives a stable tracking ID only after scan',()=>{
 const model=new SharkN650MachineTemplate(),sim=new SharkN650ProcessSimulation(model.root,model);sim.start();sim.update(1000);sim.update(1010);
 const pending=sim.blanks.filter(b=>((sim.elapsed/7.2+b.phase)%1)<.31);assert.ok(pending.length>0);assert.equal(pending.every(b=>b.result===null&&b.trackingId===null),true);
 let now=1010,id=null;for(let i=0;i<500;i++){now+=10;sim.update(now);const b=sim.blanks.find(x=>x.result&&x.trackingId);if(b){id=b.trackingId;break;}}
 assert.ok(id);assert.match(id,/^SHARK-DEMO-\d{5}$/);sim.dispose();model.dispose();
});

test('SHARK reject lane carries the same tracked blank that inspection classified as reject',()=>{
 const model=new SharkN650MachineTemplate(),sim=new SharkN650ProcessSimulation(model.root,model);sim.start();let now=1000,decisionId=null,gateId=null;
 for(let i=0;i<1200;i++){now+=10;sim.update(now);const rejected=sim.blanks.find(b=>b.result==='REJECT_DEMO'&&b.trackingId);if(rejected&&!decisionId)decisionId=rejected.trackingId;const st=sim.state();if(st.demoRejectActive&&st.activeRejectTrackingIds.length){gateId=st.activeRejectTrackingIds[0];break;}}
 assert.ok(decisionId&&gateId);assert.equal(gateId,decisionId);const st=sim.state();assert.equal(st.demoRejectOnly,true);assert.equal(st.deterministicDefectInjection,'EVERY_6TH_INSPECTED_BLANK_DEMO_ONLY');assert.equal(st.suffixDecoded,false);assert.equal(st.installedRejectTypeVerified,false);
 sim.dispose();model.dispose();
});

test('SHARK uses negative-pitch infeed and supports simultaneous tracked good and bad return lanes after decisions',()=>{
 const model=new SharkN650MachineTemplate(),sim=new SharkN650ProcessSimulation(model.root,model);sim.start();let now=1000,seenGood=false,seenBad=false;
 let seenNegativePitch=false;for(let i=0;i<800;i++){now+=10;sim.update(now);const s=sim.state();seenGood||=s.goodRoutingActive&&s.activePassTrackingIds.length>0;seenBad||=s.badRoutingActive&&s.activeRejectTrackingIds.length>0;seenNegativePitch||=s.negativePitchActive;}
 assert.ok(seenNegativePitch,'official negative-pitch transport never became visible');assert.ok(seenGood&&seenBad);const state=sim.state();assert.equal(state.negativePitchPublishedCapacityGainPercent,30);assert.equal(state.goodBadReturnLineOfficial,true);assert.equal(state.transportMode,'NEGATIVE_PITCH_FULL_SUCTION_OFFLINE_DEMO_REFERENCE');assert.ok(state.inspectedDemoCount>0);assert.equal(state.installedCameraPackageVerified,false);assert.equal(state.installedCollectionModeVerified,false);sim.dispose();model.dispose();
});

test('SHARK demo creates accepted and rejected collection and resets cleanly',()=>{
 const model=new SharkN650MachineTemplate(),sim=new SharkN650ProcessSimulation(model.root,model);sim.start();let now=1000;for(let i=0;i<1200;i++){now+=20;sim.update(now);}
 const state=sim.state();assert.ok(state.completed>0);assert.ok(state.rejectedDemo>0);assert.ok(state.pileSheetsVisible>0);assert.ok(state.rejectSheetsVisible>0);
 sim.stop();assert.equal(sim.goodStack.every(m=>!m.visible),true);assert.equal(sim.badStack.every(m=>!m.visible),true);assert.equal(sim.rotors.every((r,i)=>r.quaternion.angleTo(sim.rotorRest[i])<1e-9),true);sim.dispose();model.dispose();
});

test('SHARK feeds progressively, scans at the tower, and collects tracked outputs',()=>{
 const model=new SharkN650MachineTemplate(),sim=new SharkN650ProcessSimulation(model.root,model);
 assert.ok(sim.staticDeliveryReferences.length>0);sim.start();assert.equal(sim.staticDeliveryReferences.every(m=>!m.visible),true);
 let now=1000;sim.update(now);now+=10;sim.update(now);assert.equal(sim.state().sheetsVisible,1);
 let sawScan=false;
 for(let i=0;i<1100;i++){now+=10;sim.update(now);const first=sim.blanks[0],s=sim.state();
  if(s.scanActive){sawScan=true;assert.ok(sim.blanks.some(b=>b.mesh.visible&&b.lastT>=sim.scanStart&&b.lastT<sim.scanEnd));}
  if(first.result)assert.ok(first.lastT>=sim.decisionAt);
 }
 assert.ok(sawScan);assert.ok(sim.completed+sim.rejected>0);assert.equal(sim.completed+sim.rejected,sim.goodStack.filter(m=>m.visible).length+sim.badStack.filter(m=>m.visible).length);
 sim.stop();assert.deepEqual(sim.staticDeliveryReferences.map(m=>m.visible),sim.staticDeliveryVisibility);sim.dispose();model.dispose();
});

test('SHARK pause/resume does not jump process time',()=>{
 const model=new SharkN650MachineTemplate(),sim=new SharkN650ProcessSimulation(model.root,model);sim.start();sim.update(1000);sim.update(1200);const t=sim.elapsed;sim.pause();sim.update(20000);sim.resume();sim.update(30000);assert.equal(sim.elapsed,t);sim.update(30020);assert.ok(sim.elapsed-t<.03);sim.dispose();model.dispose();
});

test('SHARK N650 taxonomy is a mapped six-level tree',()=>{
 assert.deepEqual([...new Set(SHARK_N650_TAXONOMY.map(n=>n.level))].sort(),[1,2,3,4,5,6]);assert.equal(new Set(SHARK_N650_TAXONOMY.map(n=>n.id)).size,SHARK_N650_TAXONOMY.length);for(const n of SHARK_N650_TAXONOMY.filter(n=>n.level>1))assert.ok(SHARK_N650_TAXONOMY.some(p=>p.id===n.parentId),n.id);const model=new SharkN650MachineTemplate();for(const n of SHARK_N650_TAXONOMY.filter(n=>n.verified&&n.meshRefs.length))assert.ok(model.resolveTaxonomyNode(n.id),n.id);model.dispose();
});

test('SHARK process sequence preserves negative-pitch inspection before good/bad routing',()=>{
 assert.deepEqual(SHARK_N650_SIMULATION_STAGES,['Pengumpanan blank otomatis','Transfer suction negative-pitch','Pencahayaan terkontrol + camera capture','Pemrosesan vision demo','Pelacakan keputusan pass / reject','Aktuasi reject demo','Rute return good / bad','Pengumpulan output']);
});


test('V254 SHARK separates tracked good and bad return lanes while preserving undecoded P3N1 options',()=>{
 const model=new SharkN650MachineTemplate(),sim=new SharkN650ProcessSimulation(model.root,model);sim.start();let now=1000,goodZ=null,badZ=null;
 for(let i=0;i<1500;i++){now+=10;sim.update(now);for(const b of sim.blanks){if(b.result==='PASS_DEMO'&&b.decisionReady&&b.mesh.visible&&b.lastT>.82)goodZ=b.mesh.position.z;if(b.result==='REJECT_DEMO'&&b.decisionReady&&b.mesh.visible&&b.lastT>.82)badZ=b.mesh.position.z;}if(goodZ!==null&&badZ!==null)break;}
 assert.ok(goodZ<0);assert.ok(badZ>0);assert.ok(Math.abs(goodZ-badZ)>.30);
 const st=sim.state();assert.equal(st.suffixDecoded,false);assert.equal(st.installedCollectionModeVerified,false);assert.equal(st.demoRejectActuator,'NEUTRAL_KICK_OFF_REFERENCE__INSTALLED_ACTUATOR_UNVERIFIED');
 sim.dispose();model.dispose();
});
