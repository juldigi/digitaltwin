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
 assert.equal(model.findNode('shark650-reject').userData.installedRejectTypeVerified,false);assert.equal(model.findNode('shark650-reject-plate').userData.rejectReference,'NEUTRAL_KICK_OFF_PATH');assert.equal(model.findNode('shark650-reject-air').userData.rejectReference,'AIR_OPTION');assert.equal(model.findNode('shark650-reject-air').visible,false);assert.equal(model.findNode('shark650-return').userData.installedCollectionModeVerified,false);assert.equal(model.findNode('shark650-return').userData.officialGoodBadReturnLine,true);
 const palletizer=model.findNode('shark650-return-stack');assert.equal(palletizer.userData.verticalPalletizingCapability,true);assert.equal(palletizer.userData.installedVerticalPalletizerVerified,false);assert.equal(palletizer.userData.capabilityOnly,true);assert.equal(palletizer.visible,false);
 model.dispose();
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

test('SHARK automatic feeder suction cups point vertically toward the blank pickup plane',()=>{
 const model=new SharkN650MachineTemplate();
 try{
  const cups=model.findNode('shark650-feed-suction').children.filter(o=>o.isMesh&&o.userData.mechanismRole==='suction-cup');
  assert.equal(cups.length,4);
  assert.ok(cups.every(c=>c.userData.pickupAxis==='NEGATIVE_Y_TOWARD_BLANK'));
  assert.ok(cups.every(c=>Math.abs(c.rotation.x)<1e-12&&Math.abs(c.rotation.z)<1e-12),'suction cups must use cylinder Y axis, not lie horizontally across the feeder');
 }finally{model.dispose();}
});

test('SHARK adaptive low-detail hides service micro-detail while preserving tower and monitor silhouette',()=>{
 const model=new SharkN650MachineTemplate();
 try{
  const detail=model.meshes.filter(m=>m.userData.detail),silhouette=model.meshes.filter(m=>m.userData.silhouetteCritical);
  assert.ok(detail.length>=12);const before=detail.filter(m=>m.visible).length;assert.ok(before>0);
  model.setLow(true);assert.equal(model.root.userData.lowDetailActive,true);assert.ok(detail.filter(m=>m.visible).length<before);assert.ok(silhouette.every(m=>m.visible));
  model.setExteriorOpen(true);model.setExteriorOpen(false);assert.equal(detail.filter(m=>m.visible).length,0,'cutaway toggle must not leak low-detail meshes back on');
  model.setLow(false);assert.equal(model.root.userData.lowDetailActive,false);assert.equal(detail.filter(m=>m.visible).length,before);
 }finally{model.dispose();}
});

test('SHARK recipe logic remains addressable but is not rendered as floating physical hardware',()=>{
 const model=new SharkN650MachineTemplate();
 try{
  const recipe=model.findNode('shark650-process-recipe');assert.ok(recipe);assert.equal(recipe.userData.logicalOnly,true);assert.equal(recipe.userData.renderPolicy,'SOFTWARE_LOGIC_NOT_PHYSICAL_HARDWARE');assert.equal(recipe.visible,false);assert.equal(recipe.children.length,0);
 }finally{model.dispose();}
});

test('SHARK node-scoped materials prevent highlight and ghost state from leaking between assemblies',()=>{
 const model=new SharkN650MachineTemplate();
 try{
  const feeder=model.findNode('shark650-feeder'),inspection=model.findNode('shark650-inspection');
  const feederMeshes=model.meshes.filter(m=>model.contains(feeder,m)&&m.material);
  const inspectionMeshes=model.meshes.filter(m=>model.contains(inspection,m)&&m.material);
  let feederMesh=null,inspectionMesh=null;
  for(const fm of feederMeshes){
   const match=inspectionMeshes.find(im=>im.material.color.getHex()===fm.material.color.getHex());
   if(match){feederMesh=fm;inspectionMesh=match;break;}
  }
  assert.ok(feederMesh&&inspectionMesh,'need same-color meshes in different selectable nodes');
  assert.notEqual(feederMesh.material,inspectionMesh.material,'different selectable nodes must not share one material instance');
  model.highlight(feeder);
  assert.ok(feederMesh.material.emissiveIntensity>.2);
  assert.ok(inspectionMesh.material.emissiveIntensity===0,'highlight leaked into unrelated SHARK assembly');
  model.ghost(true,feeder);
  assert.ok(feederMesh.material.opacity>.9,'selected SHARK assembly was ghosted');
  assert.ok(inspectionMesh.material.opacity<.2,'unrelated SHARK assembly did not ghost independently');
  model.ghost(false);
 }finally{model.dispose();}
});

test('SHARK rotor whitelist excludes suction cups camera lenses and air nozzles',()=>{
 const model=new SharkN650MachineTemplate(),sim=new SharkN650ProcessSimulation(model.root,model),allowed=/^(transport-pulley|transfer-drive-motor|transfer-encoder|vacuum-blower|inspection-encoder-wheel|good-return|good-return-motor|bad-return|bad-return-motor)$/;
 assert.equal(sim.rotors.length,30);assert.equal(sim.rotors.some(r=>!allowed.test(r.userData.mechanismRole||'')),false);assert.equal(sim.suckers.length,4);assert.equal(sim.airNozzles.length,3);
 assert.equal(model.meshes.some(m=>m.userData.rotor&&['suction-cup','camera-lens','air-nozzle'].includes(m.userData.mechanismRole)),false);sim.dispose();model.dispose();
});

test('SHARK suction stroke follows live blank pickup phase and resets exactly',()=>{
 const model=new SharkN650MachineTemplate(),sim=new SharkN650ProcessSimulation(model.root,model);sim.start();let now=1000,seenStroke=false,maxStroke=0;
 try{
  for(let i=0;i<500;i++){
   now+=10;sim.update(now);const st=sim.state();
   if(st.feederSuctionActive&&st.feederPickupStrokeM>0){
    seenStroke=true;maxStroke=Math.max(maxStroke,st.feederPickupStrokeM);
    assert.ok(st.feederPickupPhase!==null&&st.feederPickupPhase>=0&&st.feederPickupPhase<.22);
    assert.ok(sim.suckers.some((s,j)=>s.position.y<sim.suckerRest[j].y));
   }
  }
  assert.ok(seenStroke);assert.ok(maxStroke<=.028+1e-9&&maxStroke>.010);
  sim.stop();assert.equal(sim.state().feederPickupStrokeM,0);assert.equal(sim.state().feederPickupPhase,null);
  assert.ok(sim.suckers.every((s,j)=>s.position.distanceTo(sim.suckerRest[j])<1e-12));
 }finally{sim.dispose();model.dispose();}
});

test('SHARK blank remains undecided before inspection and receives a stable tracking ID only after scan',()=>{
 const model=new SharkN650MachineTemplate(),sim=new SharkN650ProcessSimulation(model.root,model);sim.start();sim.update(1000);sim.update(1010);
 const pending=sim.blanks.filter(b=>((sim.elapsed/7.2+b.phase)%1)<.31);assert.ok(pending.length>0);assert.equal(pending.every(b=>b.result===null&&b.trackingId===null),true);
 let now=1010,id=null;for(let i=0;i<500;i++){now+=10;sim.update(now);const b=sim.blanks.find(x=>x.result&&x.trackingId);if(b){id=b.trackingId;break;}}
 assert.ok(id);assert.match(id,/^SHARK-DEMO-\d{5}$/);sim.dispose();model.dispose();
});

test('SHARK reject actuation rotates only the diverter blade while actuator housing remains fixed',()=>{
 const model=new SharkN650MachineTemplate(),sim=new SharkN650ProcessSimulation(model.root,model);const fixed=sim.gateMount.children.find(o=>o!==sim.gate);const fixedQ=fixed.quaternion.clone();sim.start();let now=1000,seen=false;
 try{
  for(let i=0;i<1400;i++){now+=10;sim.update(now);if(sim.state().demoRejectActive){seen=true;break;}}
  assert.ok(seen);assert.ok(Math.abs(sim.gate.rotation.z-sim.gateRest)>.1);assert.ok(Math.abs(sim.gateMount.rotation.z)<1e-12);assert.ok(fixed.quaternion.angleTo(fixedQ)<1e-12);
  sim.stop();assert.ok(Math.abs(sim.gate.rotation.z-sim.gateRest)<1e-12);
 }finally{sim.dispose();model.dispose();}
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

test('SHARK N650 branches tracked blanks continuously into good and bad return entries without teleport',()=>{
 const model=new SharkN650MachineTemplate(),sim=new SharkN650ProcessSimulation(model.root,model);sim.start();let now=1000,goodDone=false,badDone=false;
 try{
  for(let i=0;i<1800&&(!goodDone||!badDone);i++){
   now+=10;sim.update(now);
   for(const b of sim.blanks){
    if(!b.mesh.visible||!b.decisionReady||b.lastT<sim.returnBranchStartT)continue;
    if(b.result==='PASS_DEMO'&&b.lastT>=sim.returnBranchEndT){
     assert.ok(b.mesh.position.distanceTo(sim.goodLaneEntry)<.04,'accepted blank missed good return entry');goodDone=true;
    }
    if(b.result==='REJECT_DEMO'&&b.lastT>=sim.returnBranchEndT){
     assert.ok(b.mesh.position.distanceTo(sim.badLaneEntry)<.055,'rejected blank missed bad return entry');badDone=true;
    }
   }
  }
  assert.ok(goodDone&&badDone);assert.equal(sim.state().returnBranchPolicy,'TRACKED_BLANK_BRANCHES_FROM_DECISION_SPLIT_TO_GOOD_OR_BAD_RETURN_ENTRY');
  for(let i=0;i<500;i++){now+=10;sim.update(now);}
  const good=sim.goodStack.filter(m=>m.visible),bad=sim.badStack.filter(m=>m.visible);
  assert.ok(good.length>0&&bad.length>0);
  assert.ok(good.some(m=>Math.abs(m.position.z-sim.goodLaneEntry.z)<1e-9));
  assert.ok(bad.some(m=>Math.abs(m.position.z-sim.badLaneEntry.z)<1e-9));
 }finally{sim.dispose();model.dispose();}
});

test('SHARK demo creates accepted and rejected collection and resets cleanly',()=>{
 const model=new SharkN650MachineTemplate(),sim=new SharkN650ProcessSimulation(model.root,model);sim.start();sim.setPathVisible(true);let now=1000;for(let i=0;i<1200;i++){now+=20;sim.update(now);}
 const state=sim.state();assert.ok(state.completed>0);assert.ok(state.rejectedDemo>0);assert.ok(state.pileSheetsVisible>0);assert.ok(state.rejectSheetsVisible>0);
 sim.stop();assert.equal(sim.state().pathVisible,false);assert.equal(sim.pathLine.visible,false);assert.equal(sim.goodStack.every(m=>!m.visible),true);assert.equal(sim.badStack.every(m=>!m.visible),true);assert.equal(sim.rotors.every((r,i)=>r.quaternion.angleTo(sim.rotorRest[i])<1e-9),true);sim.dispose();model.dispose();
});

test('SHARK good and bad return stacks remain bounded inside the physical return lanes',()=>{
 const model=new SharkN650MachineTemplate(),sim=new SharkN650ProcessSimulation(model.root,model);
 try{
  for(let i=0;i<sim.goodStack.length;i++){const m=sim.goodStack[i];m.visible=true;m.userData.outputSerial=i+1;}
  for(let i=0;i<sim.badStack.length;i++){const m=sim.badStack[i];m.visible=true;m.userData.outputSerial=i+1;}
  sim.relayoutReturnStack(sim.goodStack,sim.goodLaneEntry,.095);
  sim.relayoutReturnStack(sim.badStack,sim.badLaneEntry,.085);
  assert.ok(Math.max(...sim.goodStack.map(m=>m.position.x))<=sim.goodLaneEntry.x+8*.095+1e-9);
  assert.ok(Math.max(...sim.badStack.map(m=>m.position.x))<=sim.badLaneEntry.x+8*.085+1e-9);
  assert.ok(Math.max(...sim.goodStack.map(m=>m.position.y))>sim.goodLaneEntry.y,'good return should layer vertically after one fish-scale span');
  assert.ok(Math.max(...sim.badStack.map(m=>m.position.y))>sim.badLaneEntry.y,'bad return should layer vertically after one fish-scale span');
  assert.equal(sim.state().returnStackPolicy,'BOUNDED_FISH_SCALE_9_SLOTS_THEN_VERTICAL_LAYER');
 }finally{sim.dispose();model.dispose();}
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
