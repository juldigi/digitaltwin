import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {DianaEye55MachineTemplate} from '../frontend/src/diana-eye55.js';
import {DianaEye55ProcessSimulation,DIANA_EYE55_SIMULATION_STAGES} from '../frontend/src/simulation-diana-eye55.js';
import {DIANA_EYE55_SPEC,DIANA_EYE55_STATIONS} from '../frontend/src/data/dimensions-diana-eye55.js';
import {DIANA_EYE55_TAXONOMY} from '../frontend/src/data/taxonomy-diana-eye55.js';
import {DIANA_EYE55_TECHNICAL_SOURCES} from '../frontend/src/data/sources-diana-eye55.js';

test('DIANA station labels use clear Indonesian while preserving technical terms',()=>{
 assert.deepEqual(DIANA_EYE55_STATIONS.map(s=>s.label),[
  'Friction feeder / alignment blank','Transport suction-belt','Enclosure inspeksi camera + LED','Pemrosesan citra','Ejection / sorting blank','Delivery blank accepted'
 ]);
});

test('DIANA user-facing taxonomy and selectable node names use Indonesian-first labels',()=>{
 const model=new DianaEye55MachineTemplate();
 try{
  assert.equal(model.root.userData.uiLanguage,'id-ID');
  assert.equal(model.findNode('diana55-feeder').name,'Pengumpanan blank & alignment');
  assert.equal(model.findNode('diana55-processing').name,'Pemrosesan citra & interface operator');
  assert.equal(model.findNode('diana55-front-aperture-bezel-v259').name,'Bezel aperture inspeksi sisi operator');
  const l2=DIANA_EYE55_TAXONOMY.filter(n=>n.level===2).map(n=>n.name);
  assert.ok(l2.includes('Pengumpanan blank & alignment'));
  assert.ok(l2.includes('Pemrosesan citra & interface operator'));
  assert.ok(DIANA_EYE55_TAXONOMY.some(n=>n.level===4&&n.name==='Assembly drive / support'));
 }finally{model.dispose();}
});

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

test('V255 DIANA neutral optical head points down to the suction-belt scan plane without claiming installed camera count',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);
 try{
  assert.equal(model.root.userData.opticalAxisPolicy,'NEUTRAL_REFERENCE_HEAD_POINTS_DOWN_TO_SUCTION_BELT__INSTALLED_CAMERA_POPULATION_UNVERIFIED');
  assert.equal(model.root.userData.scanPlaneY,.73);
  const head=model.meshes.find(m=>m.userData.cameraPopulationReference);
  const barrel=model.meshes.find(m=>m.userData.mechanismRole==='camera-optical-barrel');
  const lens=model.meshes.find(m=>m.userData.mechanismRole==='line-scan-camera-lens');
  assert.ok(head&&barrel&&lens);
  assert.equal(head.userData.installedCountAsserted,false);
  assert.equal(barrel.userData.opticalAxis,'NEGATIVE_Y_TOWARD_SUCTION_BELT');
  assert.equal(lens.userData.opticalAxis,'NEGATIVE_Y_TOWARD_SUCTION_BELT');
  assert.equal(lens.userData.scanPlaneY,.73);
  const hp=head.getWorldPosition(new THREE.Vector3()),lp=lens.getWorldPosition(new THREE.Vector3());
  assert.ok(lp.y<hp.y&&lp.y>.73,'lens must sit below the reference head and above the scan plane');
  assert.equal(model.meshes.filter(m=>m.userData.cameraPopulationReference).length,1);
  assert.equal(model.meshes.filter(m=>m.userData.cameraBay).length,4);
  const st=sim.state();
  assert.equal(st.opticalAxisPolicy,model.root.userData.opticalAxisPolicy);
  assert.equal(st.scanPlaneY,.73);
  assert.match(st.cameraPopulationPolicy,/UP_TO_FOUR_TOP_CAMERAS_CAPABILITY_ONLY/);
 }finally{sim.dispose();model.dispose();}
});

test('V258 DIANA matches the low feeder / white cell silhouette and keeps reject recovery separate from accepted fish-scale output',()=>{
 const model=new DianaEye55MachineTemplate();
 try{
  assert.equal(model.root.userData.rejectOutputPolicy,'DAMAGE_FREE_EJECTION_TO_RECOVERABLE_REJECT_COLLECTION__NOT_SECOND_ACCEPTED_FISHSCALE_LANE');
  const feeder=model.findNode('diana55-feeder-console-v258'),mag=model.findNode('diana55-feeder-magazine-v258'),crown=model.findNode('diana55-cell-crown-v258'),recovery=model.findNode('diana55-reject-recovery-v258');
  assert.ok(feeder&&mag&&crown&&recovery);
  const hmi=model.findNode('diana55-hmi-pedestal-v251'),screen=hmi.children.find(o=>o.isMesh&&o.userData.mechanismRole==='diana-eye-hmi-display-reference');
  const body=hmi.children.find(o=>o.isMesh&&o.userData.v258PedestalProfile==='SLANTED_OPERATOR_TERMINAL_REFERENCE');
  assert.ok(body&&screen);assert.ok(Math.abs(body.rotation.z+.10)<1e-9);assert.ok(Math.abs(screen.rotation.z+.10)<1e-9);
  assert.ok(hmi.children.some(o=>o.isMesh&&o.userData.operatorWorkShelf));
  const controls=model.findNode('diana55-cell-controls-v258');assert.ok(controls);assert.equal(controls.children.filter(o=>o.isMesh&&o.userData.cellControlButton).length,6);
  const signal=model.findNode('diana55-signal-tower-v259'),signalVisible=signal?.visible;
  if(signal)signal.visible=false;
  const envelope=new THREE.Box3().setFromObject(model.root);assert.ok(envelope.max.y<=2.05,`V258 Diana body height exceeded family reference envelope: ${envelope.max.y}`);
  if(signal)signal.visible=signalVisible;
  assert.equal(model.findNode('diana55-delivery-waste-v254').visible,false);
  assert.equal(model.findNode('diana55-delivery-waste-v254').userData.supersededByV258,true);
  const tray=model.meshes.find(m=>m.userData.rejectRecoveryTray),guard=model.meshes.find(m=>m.userData.rejectRecoveryGuard);
  assert.ok(tray&&guard);
  assert.equal(recovery.userData.flow,'DAMAGE_FREE_REJECT_COLLECTION_FOR_RESORT_OR_REINSPECTION_REFERENCE');
  assert.equal(model.findNode('diana55-delivery').userData.v258DeliveryPolicy,'ONE_ACCEPTED_FISH_SCALE_LANE_PLUS_SEPARATE_RECOVERABLE_REJECT_COLLECTION');
 }finally{model.dispose();}
});

test('DIANA adaptive low-detail hides micro-detail but preserves silhouette-critical geometry',()=>{
 const model=new DianaEye55MachineTemplate();
 try{
  const detail=model.meshes.filter(m=>m.userData.detail),silhouette=model.meshes.filter(m=>m.userData.silhouetteCritical);
  assert.ok(detail.length>10);const before=detail.filter(m=>m.visible).length;assert.ok(before>0);
  model.setLow(true);assert.equal(model.root.userData.lowDetailActive,true);assert.ok(detail.filter(m=>m.visible).length<before);assert.ok(silhouette.every(m=>m.visible));
  model.setExteriorOpen(true);model.setExteriorOpen(false);assert.equal(detail.filter(m=>m.visible).length,0,'cutaway toggle must not leak low-detail meshes back on');
  model.setLow(false);assert.equal(model.root.userData.lowDetailActive,false);assert.equal(detail.filter(m=>m.visible).length,before);
 }finally{model.dispose();}
});

test('Diana recipe logic remains addressable but is not rendered as floating physical hardware',()=>{
 const model=new DianaEye55MachineTemplate();
 try{
  const recipe=model.findNode('diana55-process-recipe');assert.ok(recipe);assert.equal(recipe.userData.logicalOnly,true);assert.equal(recipe.userData.renderPolicy,'SOFTWARE_LOGIC_NOT_PHYSICAL_HARDWARE');assert.equal(recipe.visible,false);assert.equal(recipe.children.length,0);
 }finally{model.dispose();}
});

test('DIANA node-scoped materials prevent highlight and ghost state from leaking between assemblies',()=>{
 const model=new DianaEye55MachineTemplate();
 try{
  const feeder=model.findNode('diana55-feeder'),inspection=model.findNode('diana55-inspection');
  const feederMeshes=model.meshes.filter(m=>model.contains(feeder,m)&&m.material);
  const inspectionMeshes=model.meshes.filter(m=>model.contains(inspection,m)&&m.material);
  let feederMesh=null,inspectionMesh=null;
  for(const fm of feederMeshes){
   const match=inspectionMeshes.find(im=>im.material.color.getHex()===fm.material.color.getHex());
   if(match){feederMesh=fm;inspectionMesh=match;break;}
  }
  assert.ok(feederMesh&&inspectionMesh,'need same-color meshes in different Diana nodes');
  assert.notEqual(feederMesh.material,inspectionMesh.material,'different Diana selectable nodes must not share one material instance');
  model.highlight(feeder);
  assert.ok(feederMesh.material.emissiveIntensity>.2);
  assert.equal(inspectionMesh.material.emissiveIntensity,0,'Diana highlight leaked into unrelated assembly');
  model.ghost(true,feeder);
  assert.ok(feederMesh.material.opacity>.9,'selected Diana assembly was ghosted');
  assert.ok(inspectionMesh.material.opacity<.2,'unrelated Diana assembly did not ghost independently');
  model.ghost(false);
 }finally{model.dispose();}
});

test('V259 DIANA keeps feeder, inspection aperture and HMI physically attached without inferring installed options',()=>{
 const model=new DianaEye55MachineTemplate();
 try{
  assert.equal(model.root.userData.visualRefinement,'V259_DIANA_EYE55_ATTACHED_FEEDER_APERTURE_HMI_REALISM');
  assert.equal(model.root.userData.v259Policy,'EXTERIOR_ATTACHMENT_AND_SCAN_WINDOW_ONLY__NO_INSTALLED_OPTION_POPULATION_INFERRED__NO_ENVELOPE_CHANGE');
  const supports=model.findNode('diana55-feeder-supports-v259');
  assert.ok(supports);
  const bearings=supports.children.filter(o=>o.isMesh&&o.userData.bearingSupport);
  assert.equal(bearings.length,2);
  assert.ok(bearings.every(o=>o.userData.pulleyBodyClearanceM>=.04));
  assert.equal(supports.children.filter(o=>o.isMesh&&o.userData.floorFrameAttachment).length,2);
  assert.ok(supports.children.filter(o=>o.isMesh&&o.userData.structuralAttachment).length>=5);
  const serviceDoor=model.findNode('diana55-access-door');assert.ok(serviceDoor);
  const servicePanels=serviceDoor.children.filter(o=>o.isMesh&&o.userData.serviceDoor);
  assert.ok(servicePanels.every(o=>o.userData.v259Placement==='BELOW_OPERATOR_VIEWING_APERTURE'&&o.position.y<.90));
  const guard=model.findNode('diana55-access-guard');assert.equal(guard.userData.v259SkinPolicy,'PRIMARY_INSPECTION_TUNNEL_SKIN_ONLY__RED_IDENTITY_STRIPE_RETAINED');
  const hiddenGuard=guard.children.filter(o=>o.isMesh&&o.userData.supersededByV259);
  assert.ok(hiddenGuard.every(o=>o.visible===false&&o.userData.permanentlyHidden===true));
  model.setExteriorOpen(true);model.setExteriorOpen(false);
  assert.ok(hiddenGuard.every(o=>o.visible===false),'Diana duplicate guard skin reappeared after cutaway toggle');
  const aperture=model.findNode('diana55-inspection-window');assert.equal(aperture.children.filter(o=>o.isMesh&&o.userData.apertureBacking).length,2);
  const bezel=model.findNode('diana55-front-aperture-bezel-v259');
  assert.ok(bezel);
  assert.equal(bezel.children.filter(o=>o.isMesh&&o.userData.apertureBezel).length,5);
  const hmi=model.findNode('diana55-hmi-pedestal-v251');
  assert.equal(hmi.userData.v259AttachmentPolicy,'DISPLAY_HEAD_TO_SLANTED_NECK_TO_FLOOR_BASE');
  const floorContacts=hmi.children.filter(o=>o.isMesh&&o.userData.floorContact);assert.ok(floorContacts.length>=3);
  assert.ok(floorContacts.every(o=>o.position.y>=.028-.03),'Diana HMI floor support penetrates below floor tolerance');
  assert.equal(model.findNode('diana55-camera-top').userData.installedCountVerified,false);
  assert.equal(model.findNode('diana55-reject').userData.installedRejectActuationVerified,false);
 }finally{model.dispose();}
});

test('V259 DIANA viewing window follows active scan occupancy and restores after stop',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);
 try{
  assert.equal(sim.scanWindows.length,2);
  const initial=sim.scanWindowRest.map(x=>x.intensity);
  sim.start();let now=1000;sim.update(now);let seen=false;
  for(let i=0;i<700;i++){now+=10;sim.update(now);if(sim.state().scanWindowActive){seen=true;break;}}
  assert.equal(seen,true);
  assert.ok(sim.scanWindows.every(w=>w.material.emissiveIntensity>=.18));
  assert.equal(sim.state().scanWindowPolicy,'DARK_VIEWING_WINDOW_SUBTLE_OCCUPANCY_GLOW_ONLY');
  sim.stop();
  assert.deepEqual(sim.scanWindows.map(w=>w.material.emissiveIntensity),initial);
 }finally{sim.dispose();model.dispose();}
});

test('DIANA isolate, showOnly and reset preserve intentionally hidden capability nodes',()=>{
 const model=new DianaEye55MachineTemplate();
 try{
  const ids=['diana55-camera-rear','diana55-camera-area','diana55-reject-air','diana55-side-stacker-capability-v254','diana55-process-recipe','diana55-delivery-waste-v254'];
  const hidden=ids.map(id=>model.findNode(id));assert.ok(hidden.every(Boolean));assert.ok(hidden.every(n=>n.visible===false));
  const feeder=model.findNode('diana55-feeder');
  model.isolate(feeder,true);model.isolate(null,false);assert.ok(hidden.every(n=>n.visible===false),'DIANA isolate exit resurrected hidden capability node');
  model.showOnly([feeder],true);model.showOnly([],false);assert.ok(hidden.every(n=>n.visible===false),'DIANA showOnly exit resurrected hidden capability node');
  model.reset();assert.ok(hidden.every(n=>n.visible===false),'DIANA reset resurrected hidden capability node');
 }finally{model.dispose();}
});

test('DIANA rotor whitelist rotates only feeder transport vacuum and delivery mechanisms',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model),allowed=/^(feed-pulley|transport-pulley|transport-drive-motor|transport-encoder|vacuum-blower|delivery-pulley)$/;
 assert.ok(sim.rotors.length>=24);assert.equal(sim.rotors.some(r=>!allowed.test(r.userData.mechanismRole||'')),false);
 assert.equal(model.meshes.some(m=>m.userData.rotor&&['camera-lens','rear-camera','area-camera','reject-air-nozzle'].includes(m.userData.mechanismRole)),false);
 sim.dispose();model.dispose();
});

test('DIANA feeder knife and air-assist state follow live blank feeding and reset exactly',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);
 try{
  assert.ok(sim.feederKnife&&sim.feederKnifeRest);
  sim.start();let now=1000,seen=false,maxStroke=0;sim.update(now);
  for(let i=0;i<500;i++){
   now+=10;sim.update(now);const st=sim.state();
   if(st.feederKnifeActive){
    seen=true;maxStroke=Math.max(maxStroke,Math.abs(st.feederKnifeStrokeM));
    assert.equal(st.feederAirAssistActive,true);
    assert.ok(sim.feederKnife.position.distanceTo(sim.feederKnifeRest)<=.0061);
   }
  }
  assert.ok(seen);assert.ok(maxStroke>.001&&maxStroke<=.0061);
  assert.equal(sim.state().feederMotionPolicy,'OEM_FEEDING_KNIFE_SUBTLE_VIBRATION_AND_AIR_ASSIST_STATE__AMPLITUDE_VISUAL_ONLY');
  sim.stop();
  assert.equal(sim.state().feederKnifeActive,false);assert.equal(sim.state().feederAirAssistActive,false);assert.equal(sim.state().feederKnifeStrokeM,0);
  assert.ok(sim.feederKnife.position.distanceTo(sim.feederKnifeRest)<1e-12);
 }finally{sim.dispose();model.dispose();}
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

test('Diana reject actuation rotates only the diverter blade while the fixed home sensor stays on the frame',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);const fixed=sim.gateMount.children.find(o=>o!==sim.gate);const fixedQ=fixed.quaternion.clone();sim.start();let now=1000,seen=false;
 try{
  for(let i=0;i<1400;i++){now+=10;sim.update(now);if(sim.state().demoRejectActive){seen=true;break;}}
  assert.ok(seen);assert.ok(Math.abs(sim.gate.rotation.z-sim.gateRest)>.1);assert.ok(Math.abs(sim.gateMount.rotation.z)<1e-12);assert.ok(fixed.quaternion.angleTo(fixedQ)<1e-12);
  sim.stop();assert.ok(Math.abs(sim.gate.rotation.z-sim.gateRest)<1e-12);
 }finally{sim.dispose();model.dispose();}
});

test('DIANA rejects only tracked reject blanks and accepted blanks remain on the main delivery path',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);sim.start();let now=1000,seenReject=false,seenPass=false;
 for(let i=0;i<1500;i++){now+=10;sim.update(now);const state=sim.state();seenReject||=state.rejectTrackingActive&&state.activeRejectTrackingIds.length>0;seenPass||=state.acceptedDeliveryActive&&state.activePassTrackingIds.length>0;}
 const state=sim.state();assert.ok(seenReject&&seenPass);assert.ok(state.inspectedDemoCount>0);assert.ok(state.completed+state.rejectedDemo>0);assert.ok(state.pileSheetsVisible+state.rejectSheetsVisible>0);assert.equal(state.deliveryMode,'ACCEPTED_FISH_SCALE_PLUS_RECOVERABLE_REJECT_COLLECTION');assert.equal(state.rejectedOutputPolicy,'DAMAGE_FREE_RECOVERABLE_COLLECTION_FOR_RESORT_OR_REINSPECTION_REFERENCE');
 assert.equal(sim.blanks.every(b=>!b.result||b.inspectedLap===b.lap),true);
 sim.dispose();model.dispose();
});

test('Diana reject recovery does not spin the accepted fish-scale delivery drive',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);sim.start();let now=1000,seen=false;
 try{
  for(let i=0;i<1800;i++){
   now+=10;sim.update(now);const st=sim.state();
   if(st.rejectRecoveryActive&&!st.acceptedDeliveryActive){
    seen=true;assert.equal(st.deliveryDriveActive,false);assert.equal(st.fishScaleDeliveryActive,false);break;
   }
  }
  assert.ok(seen,'reject recovery-only state was never observed');
 }finally{sim.dispose();model.dispose();}
});

test('Diana Eye 55 reject branch leaves the main path continuously and reaches the recovery tray without teleporting backward',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);sim.start();let now=1000,lastX=null,seen=false,finished=false,id=null;
 try{
  for(let i=0;i<1800;i++){
   now+=10;sim.update(now);
   const b=sim.blanks.find(x=>x.result==='REJECT_DEMO'&&x.decisionReady&&x.mesh.visible&&x.lastT>=sim.rejectBranchStartT);
   if(!b)continue;
   if(!id)id=b.trackingId;
   if(b.trackingId!==id)continue;
   seen=true;
   if(lastX!==null)assert.ok(b.mesh.position.x>=lastX-.015,'reject blank moved backward while branching to recovery tray');
   lastX=b.mesh.position.x;
   if(b.lastT>=sim.rejectBranchEndT){
    assert.ok(b.mesh.position.distanceTo(sim.rejectTrayEntry)<.055,'reject blank did not reach recovery tray entry');
    finished=true;break;
   }
  }
  assert.ok(seen&&finished);assert.equal(sim.state().rejectBranchPolicy,'TRACKED_BLANK_BRANCHES_DIRECTLY_FROM_GATE_TO_RECOVERY_TRAY');
 }finally{sim.dispose();model.dispose();}
});

test('Diana accepted branch reaches fish-scale entry continuously and relayout keeps newest output at the infeed point',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);sim.start();let now=1000,seen=false;
 try{
  for(let i=0;i<1800;i++){
   now+=10;sim.update(now);
   const b=sim.blanks.find(x=>x.result==='PASS_DEMO'&&x.decisionReady&&x.mesh.visible&&x.lastT>=sim.goodBranchEndT);
   if(b){assert.ok(b.mesh.position.distanceTo(sim.goodLaneEntry)<.04);seen=true;break;}
  }
  assert.ok(seen);assert.equal(sim.state().acceptedBranchPolicy,'TRACKED_ACCEPTED_BLANK_BRANCHES_TO_FISH_SCALE_ENTRY_WITHOUT_TELEPORT');
  for(let i=0;i<800;i++){now+=10;sim.update(now);}
  const visible=sim.goodStack.filter(m=>m.visible).sort((a,b)=>(a.userData.outputSerial??0)-(b.userData.outputSerial??0));
  assert.ok(visible.length>1);
  const newest=visible.at(-1),oldest=visible[0];
  assert.ok(newest.position.distanceTo(sim.goodLaneEntry)<.01);
  assert.ok(oldest.position.x>newest.position.x,'older fish-scale outputs must move downstream from the entry');
 }finally{sim.dispose();model.dispose();}
});

test('DIANA signal tower remains a visual reference with unverified status meanings',()=>{
 const model=new DianaEye55MachineTemplate();
 try{
  const node=model.findNode('diana55-signal-tower-v259');assert.ok(node);assert.equal(node.userData.familyPhotoReference,true);assert.equal(node.userData.installedVerified,false);
  const refs=node.children.filter(o=>o.isMesh&&o.userData.signalTowerReference);
  assert.equal(refs.length,4);
  assert.ok(refs.every(o=>o.userData.statusMeaningVerified===false));
  assert.equal(model.findNode('diana55-inspection').userData.v258CellPolicy,'SINGLE_WHITE_DARK_WINDOW_INSPECTION_CELL_WITH_SIGNAL_TOWER_REFERENCE__NO_EXTRA_CAMERA_TOWERS_INFERRED');
 }finally{model.dispose();}
});

test('DIANA operator pedestal retains the official red vertical identity accent',()=>{
 const model=new DianaEye55MachineTemplate();
 try{
  const hmi=model.findNode('diana55-hmi-pedestal-v251');assert.ok(hmi);
  const accent=hmi.children.find(o=>o.isMesh&&o.userData.pedestalIdentityAccent);
  assert.ok(accent);assert.equal(accent.userData.sourceBoundary,'MASTERWORK_DIANA_EYE55_OFFICIAL_PRODUCT_IMAGE');
  assert.ok(Math.abs(accent.rotation.z+.10)<1e-9);
  assert.equal(hmi.userData.v258OperatorInterface,'SLANTED_PEDESTAL_WITH_RED_IDENTITY_ACCENT_AND_WORK_SHELF__DISPLAY_SIZE_NOT_ASSERTED');
 }finally{model.dispose();}
});

test('DIANA delivery monitoring camera is structurally grounded to the delivery bed',()=>{
 const model=new DianaEye55MachineTemplate();
 try{
  const node=model.findNode('diana55-delivery-monitor-v254');assert.ok(node);
  const mast=node.children.find(o=>o.isMesh&&o.userData.deliveryMonitoringMast);
  const cam=node.children.find(o=>o.isMesh&&o.userData.mechanismRole==='delivery-monitoring-camera-reference');
  assert.ok(mast&&cam);
  assert.equal(mast.userData.mountPolicy,'DELIVERY_BED_TO_CAMERA_HEAD_STRUCTURAL_REFERENCE');
  const mastBottom=mast.position.y-.72/2,mastTop=mast.position.y+.72/2;
  assert.ok(mastBottom<=.71,'Diana monitoring mast must reach the delivery bed');
  assert.ok(cam.position.y<=mastTop+.02,'Diana monitoring camera must remain attached to the mast top');
 }finally{model.dispose();}
});

test('DIANA optical illumination follows scan occupancy and resets cleanly',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);sim.start();let now=1000,seenScan=false;
 for(let i=0;i<600;i++){now+=10;sim.update(now);if(sim.state().scanActive){seenScan=true;assert.ok(sim.lights.every(l=>l.material.emissiveIntensity>1));break;}}
 assert.ok(seenScan);sim.stop();assert.equal(sim.lights.every(l=>l.material.emissiveIntensity<.2),true);assert.equal(sim.rotors.every((r,i)=>r.quaternion.angleTo(sim.rotorRest[i])<1e-9),true);sim.dispose();model.dispose();
});

test('DIANA accepted fish-scale stack remains bounded inside the delivery lane',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);
 try{
  for(let i=0;i<sim.goodStack.length;i++){const m=sim.goodStack[i];m.visible=true;m.userData.outputSerial=i+1;}
  sim.relayoutAcceptedFishScale();
  assert.ok(Math.max(...sim.goodStack.map(m=>m.position.x))<=sim.goodLaneEntry.x+7*.115+1e-9);
  assert.ok(Math.max(...sim.goodStack.map(m=>m.position.y))>sim.goodLaneEntry.y,'accepted output should layer vertically after one fish-scale span');
  assert.equal(sim.state().acceptedStackPolicy,'BOUNDED_FISH_SCALE_8_SLOTS_THEN_VERTICAL_LAYER');
 }finally{sim.dispose();model.dispose();}
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

test('DIANA Stop & Reset clears every live process/interlock state',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);sim.start();sim.setPathVisible(true);let now=1000;
 for(let i=0;i<900;i++){now+=10;sim.update(now);}
 sim.stop();const s=sim.state();assert.equal(s.pathVisible,false);assert.equal(sim.pathLine.visible,false);
 for(const key of ['feederDriveActive','transportDriveActive','deliveryDriveActive','blankPresenceTrigger','transportEncoderActive','vacuumHoldActive','illuminationReady','cameraTriggerActive','captureComplete','scanActive','imageProcessingActive','processingComplete','decisionReady','rejectPermit','rejectConfirmed','outputCountActive','demoRejectActive','rejectTrackingActive','acceptedDeliveryActive','wasteDeliveryActive','fishScaleDeliveryActive'])assert.equal(s[key],false,key);
 assert.equal(s.interlockSafe,true);
 assert.equal(s.stageIndex,0);
 assert.equal(s.stagePolicy,'MECHANISM_STATE_DRIVEN_DOWNSTREAM_PRIORITY');
 sim.dispose();model.dispose();
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
 assert.deepEqual(DIANA_EYE55_SIMULATION_STAGES,['Pengumpanan blank','Suction-belt transport','LED illumination + camera capture','Pemrosesan citra demo','Pelacakan keputusan pass / reject','Ejection demo','Delivery accepted / reject recovery','Pengumpulan output']);
});


test('V258 DIANA keeps accepted blanks on fish-scale delivery and sends rejected blanks down to recoverable collection',()=>{
 const model=new DianaEye55MachineTemplate(),sim=new DianaEye55ProcessSimulation(model.root,model);sim.start();let now=1000,goodZ=null,badZ=null,badY=null,sawRejectRecovery=false;
 for(let i=0;i<1600;i++){
  now+=10;sim.update(now);const st=sim.state();sawRejectRecovery||=st.rejectRecoveryActive;
  for(const b of sim.blanks){
   if(b.result==='PASS_DEMO'&&b.mesh.visible&&b.lastT>.84)goodZ=b.mesh.position.z;
   if(b.result==='REJECT_DEMO'&&b.mesh.visible&&b.lastT>.84){badZ=b.mesh.position.z;badY=b.mesh.position.y;}
  }
  if(sawRejectRecovery&&goodZ!==null&&badZ!==null&&badY!==null)break;
 }
 assert.ok(sawRejectRecovery);assert.ok(goodZ<0);assert.ok(badZ>.30);assert.ok(badY<.62);assert.ok(Math.abs(goodZ-badZ)>.40);
 assert.equal(sim.state().deliveryMode,'ACCEPTED_FISH_SCALE_PLUS_RECOVERABLE_REJECT_COLLECTION');
 assert.equal(sim.state().demoRejectActuator,'NEUTRAL_DAMAGE_FREE_EJECTION_REFERENCE__INSTALLED_ACTUATOR_UNVERIFIED');
 sim.dispose();model.dispose();
});
