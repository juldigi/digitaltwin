import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {OFFSET5_DIMENSIONS,OFFSET5_UNIT_CENTERS,offset5DimensionAudit} from '../frontend/src/data/dimensions-offset5.js';
import {Offset5CD102RealismTemplate,Offset5CD102RealismSimulation} from '../frontend/src/offset5-realism.js';

test('V253 preserves the user-confirmed custom installed Offset 5 dimensions',()=>{
 const d=OFFSET5_DIMENSIONS,a=offset5DimensionAudit();
 assert.equal(d.revision,'offset5-dimensional-contract-v36');
 assert.equal(d.structuralBody.length,26.00);
 assert.equal(d.structuralBody.width,3.92);
 assert.equal(d.serviceInclusive.length,27.00);
 assert.equal(d.serviceInclusive.width,4.60);
 assert.equal(d.repeatedPitch.value,1.95);
 assert.equal(d.layout.printingUnitPitch,1.95);
 assert.equal(OFFSET5_UNIT_CENTERS.length,8);
 for(let i=1;i<OFFSET5_UNIT_CENTERS.length;i++)assert.ok(Math.abs(OFFSET5_UNIT_CENTERS[i]-OFFSET5_UNIT_CENTERS[i-1]-1.95)<1e-9);
 assert.ok(a.puGap>=.72,'custom inter-PU access bay must remain broad');
 assert.ok(a.pu1ToPU2Gap>=.74,'custom PU1-PU2 access bay must remain broad');
 assert.ok(a.pu8ToCoaterGap>=.74,'custom PU8/coater access must remain broad');
 assert.ok(a.coaterToDryerGap>=.64,'custom coater/dryer transition must remain broad');
 assert.ok(a.dryerToDeliveryGap>=.69,'custom dryer/delivery transition must remain broad');
});

test('V253 keeps BMJ OS/DS orientation and broad custom inter-unit access',()=>{
 const m=new Offset5CD102RealismTemplate();
 try{
  assert.equal(m.root.userData.sideAlignment,'PHOTO_VERIFIED_OPERATOR_NEGATIVE_Z');
  assert.equal(m.root.userData.driveSideAlignment,'PHOTO_VERIFIED_DRIVE_POSITIVE_Z');
  assert.equal(m.root.userData.realismPack,'OFFSET5_CD102_8L_CUSTOM_INSTALLED_REALITY_R5');
  assert.equal(m.root.userData.dimensionLock,'BMJ_CUSTOM_INSTALLED_DIMENSIONS_DO_NOT_NORMALIZE_TO_GENERIC_CD102');
  for(let i=0;i<7;i++){
   const frameA=new THREE.Box3().setFromObject(m.findNode(`press-${i}-frame`));
   const frameB=new THREE.Box3().setFromObject(m.findNode(`press-${i+1}-frame`));
   const landing=new THREE.Box3().setFromObject(m.findNode(`press-${i}-gap-footplate`));
   const transfer=new THREE.Box3().setFromObject(m.findNode(`transfer-pu${i+1}-pu${i+2}`));
   assert.ok(frameB.min.x-frameA.max.x>=.72,`PU${i+1}/PU${i+2} custom access gap was compacted`);
   assert.ok(landing.min.x<=frameA.max.x+.01&&landing.max.x>=frameB.min.x-.01,`PU${i+1}/PU${i+2} landing no longer spans the custom access bay`);
   assert.ok(landing.max.y>=transfer.max.y+.15,`PU${i+1}/PU${i+2} landing is not above the gripper transfer`);
  }
 }finally{m.dispose();}
});

test('V254 keeps newly added operator-side micro-details on the photo-verified world -Z side',()=>{
 const m=new Offset5CD102RealismTemplate();
 try{
  m.root.updateMatrixWorld(true);
  const roles=['operator-side-lower-service-trim','printing-unit-emergency-stop-reference','preset-plus-delivery-touch-console'];
  for(const role of roles){
   const mesh=m.realismMeshes.find(item=>item.userData.realismRole===role);
   assert.ok(mesh,`missing ${role}`);
   const world=mesh.getWorldPosition(new THREE.Vector3());
   assert.ok(world.z<0,`${role} leaked onto drive side after the top-level Z mirror`);
  }
  assert.equal(m.root.userData.operatorSideDetailPolicy,'TOP_LEVEL_MODULES_ARE_Z_MIRRORED__LOCAL_POSITIVE_Z_MAPS_TO_WORLD_NEGATIVE_Z');
 }finally{m.dispose();}
});

test('V255 matches the BMJ delivery end-face photo with attached fascia, controls, rail mounts and gate anchors',()=>{
 const m=new Offset5CD102RealismTemplate();
 try{
  const count=role=>m.realismMeshes.filter(item=>item.userData.realismRole===role).length;
  assert.equal(m.root.userData.visualRefinement,'V256_BMJ_CUTAWAY_JOURNAL_FRAME_SUPPORTS');
  assert.equal(m.root.userData.photoDeliveryEvidence,'IMG_2312.jpeg');
  assert.equal(m.root.userData.photoDeliveryPolicy,'EXTERIOR_FACE_ONLY__NO_CONTROL_FUNCTION_OR_SERVICE_SETTING_INFERRED');
  assert.equal(count('delivery-photo-upper-control-fascia'),1);
  assert.equal(count('delivery-photo-fascia-seam'),3);
  assert.equal(count('delivery-photo-control-knob'),4);
  assert.equal(count('delivery-photo-status-window'),5);
  assert.equal(count('delivery-photo-window-bezel-top'),1);
  assert.equal(count('delivery-photo-window-bezel-bottom'),1);
  assert.equal(count('delivery-photo-window-bezel-side'),2);
  assert.equal(count('delivery-front-rail-standoff'),2);
  assert.equal(count('delivery-gate-end-anchor'),4);
  const gate=m.findNode('delivery-gate');
  assert.equal(gate.userData.photoMountPolicy,'IMG_2312_GATE_RODS_TERMINATE_IN_SUPPORTED_CROSSMEMBERS');
  assert.ok(m.realismMeshes.filter(item=>item.userData.realismRole==='delivery-front-rail-standoff').every(item=>item.userData.attachment==='END_FACE_TO_EXISTING_FRONT_RAIL'));
  assert.equal(m.root.userData.dimensionLock,'BMJ_CUSTOM_INSTALLED_DIMENSIONS_DO_NOT_NORMALIZE_TO_GENERIC_CD102');
  assert.equal(m.root.userData.machineEnvelope.structuralBody.length,26.00);
  assert.equal(m.root.userData.machineEnvelope.structuralBody.width,3.92);
 }finally{m.dispose();}
});

test('V254 adds attached Preset Plus delivery and coater references without changing machine dimensions',()=>{
 const m=new Offset5CD102RealismTemplate();
 try{
  const roleCount=role=>m.realismMeshes.filter(item=>item.userData.realismRole===role).length;
  assert.equal(roleCount('preset-plus-delivery-touch-console'),1);
  assert.equal(roleCount('preset-plus-delivery-touch-display'),1);
  assert.equal(roleCount('preset-plus-delivery-jogwheel'),1);
  assert.equal(roleCount('sheet-brake-positioning-rail'),1);
  assert.equal(roleCount('sheet-brake-slide-carriage'),3);
  assert.equal(roleCount('staticstar-antistatic-bar'),1);
  assert.equal(roleCount('staticstar-electrode-reference'),7);
  assert.equal(roleCount('coater-combination-clamp-reference'),2);
  assert.equal(m.root.userData.dimensionLock,'BMJ_CUSTOM_INSTALLED_DIMENSIONS_DO_NOT_NORMALIZE_TO_GENERIC_CD102');
  assert.equal(m.root.userData.machineEnvelope.structuralBody.length,26.00);
  assert.equal(m.root.userData.machineEnvelope.structuralBody.width,3.92);
 }finally{m.dispose();}
});

test('V256 grounds all PU cylinder journals into open side-frame rails without changing BMJ dimensions',()=>{
 const m=new Offset5CD102RealismTemplate();
 try{
  assert.equal(m.root.userData.visualRefinement,'V256_BMJ_CUTAWAY_JOURNAL_FRAME_SUPPORTS');
  assert.equal(m.root.userData.internalFramePolicy,'OPEN_RAIL_STRUCTURE_ONLY__NO_NEW_PROCESS_HARDWARE__NO_DIMENSION_CHANGE');
  assert.equal(m.root.userData.dimensionLock,'BMJ_CUSTOM_INSTALLED_DIMENSIONS_DO_NOT_NORMALIZE_TO_GENERIC_CD102');
  for(let unit=1;unit<=8;unit++){
   const u=m.findNode(`press-${unit}`);
   const posts=u.children.filter(x=>x.userData.realismRole==='printing-unit-inner-frame-post');
   const rails=u.children.filter(x=>x.userData.realismRole==='printing-unit-journal-bearing-rail');
   assert.equal(posts.length,4,`PU${unit} must have four open inner-frame posts`);
   assert.equal(rails.length,8,`PU${unit} must have eight side-frame bearing rails`);
   for(const type of ['plate','blanket','impression','transfer']){
    assert.equal(rails.filter(x=>x.userData.cylinderType===type).length,2,`PU${unit} missing ${type} journal support on both sides`);
   }
  }
  m.setExteriorOpen(true);
  assert.ok(m.realismMeshes.filter(x=>x.userData.structuralCutaway).every(x=>x.visible),'cutaway structural rails must remain visible when covers open');
  assert.equal(m.root.userData.machineEnvelope.structuralBody.length,26.00);
  assert.equal(m.root.userData.machineEnvelope.serviceInclusive.length,27.00);
 }finally{m.dispose();}
});

test('Offset 5 feeds separate 720 mm sheets with a visible gap and releases them at delivery',()=>{
 const m=new Offset5CD102RealismTemplate(),sim=new Offset5CD102RealismSimulation(m.root,m);
 try{
  assert.equal(sim.nominalSheetsPerHour,15000);
  assert.deepEqual([sim.sheetLength,sim.sheetWidth],[.72,1.02]);
  assert.equal(sim.sheetPitchMeters,.82);
  assert.ok(sim.sheetPitchMeters-sim.sheetLength>=.10-1e-9);
  assert.ok(Math.abs(sim.baseMetersPerSecond-.82*15000/3600)<1e-9);
  const st=sim.state();
  assert.equal(st.customMachineDimensionsPreserved,true);
  assert.equal(st.printRepresentation,'PROGRESSIVE_TRANSVERSE_COLOUR_BANDS_PER_PU_DEMO');
  assert.equal(st.dimensionPolicy,'USER_CONFIRMED_CUSTOM_INSTALLED_GEOMETRY_OVERRIDES_GENERIC_FAMILY_DIMENSIONS');
  assert.equal(st.focusightLocationPolicy,'DOWNSTREAM_AFTER_COATING_DRYING');
  assert.equal(st.interUnitAccessPolicy,'BMJ_CUSTOM_BROAD_INTERUNIT_ACCESS_AND_OS_DS_STEPS_PRESERVED');
  sim.start();sim.update(0);
  let sawRelease=false,sawInspection=false;
  for(let ms=16;ms<=14000;ms+=16){
   sim.update(ms);const s=sim.state();
   sawRelease ||= s.deliveryReleaseActive;
   sawInspection ||= s.inspectionTriggerActive;
  }
  assert.equal(sawInspection,true);
  assert.equal(sawRelease,true);
  assert.ok(sim.completed>0);
  assert.ok(sim.sheets.every(sheet=>sheet.userData.printRepresentation==='PROGRESSIVE_TRANSVERSE_COLOUR_BANDS_PER_PU_DEMO'));
 }finally{sim.dispose();m.dispose();}
});

test('Offset 5 adds transverse colour lines one PU at a time and stacks on an initially empty delivery',()=>{
 const m=new Offset5CD102RealismTemplate(),sim=new Offset5CD102RealismSimulation(m.root,m);
 try{
  const sheet=sim.sheets[0],attr=sheet.mesh.geometry.attributes.color,index=4*(sim.sheetWidthSegments+1)+4;
  sim.setSheetColors(sheet,0);
  const blank=[attr.getX(index),attr.getY(index),attr.getZ(index)];
  sim.setSheetColors(sheet,1);
  const afterPU1=[attr.getX(index),attr.getY(index),attr.getZ(index)];
  const secondBand=8*(sim.sheetWidthSegments+1)+4;
  const beforePU2=[attr.getX(secondBand),attr.getY(secondBand),attr.getZ(secondBand)];
  sim.setSheetColors(sheet,2);
  const afterPU2=[attr.getX(secondBand),attr.getY(secondBand),attr.getZ(secondBand)];
  assert.ok(Math.hypot(...blank.map((v,i)=>v-afterPU1[i]))>.08,'PU1 must visibly ink the sheet');
  assert.ok(Math.hypot(...beforePU2.map((v,i)=>v-afterPU2[i]))>.08,'PU2 must add its own band');
  assert.ok(Math.abs(attr.getX(index)-attr.getX(index+4))<1e-8,'colour band spans the roller axis');
  sim.setSheetColors(sheet,8);
  for(let unit=0;unit<8;unit++){
   const stripe=Math.round((.13+unit*.105)*sim.sheetLengthSegments)*(sim.sheetWidthSegments+1)+4;
   const off=stripe+3*(sim.sheetWidthSegments+1);
   assert.ok(Math.hypot(attr.getX(stripe)-attr.getX(off),attr.getY(stripe)-attr.getY(off),attr.getZ(stripe)-attr.getZ(off))>.07,`PU${unit+1} band must be a distinct transverse line`);
  }
  assert.ok(sim.pileAnchor.y<.5,'receiving surface begins at the empty pile table');
  sim.start();sim.update(0);
  assert.equal(sim.staticDeliveryStack.visible,false);
  assert.equal(sim.state().pileSheetsVisible,0);
  for(let ms=16;ms<=13000;ms+=16)sim.update(ms);
  assert.equal(sim.staticDeliveryStack.visible,false);
  assert.ok(sim.completed>0&&sim.state().pileSheetsVisible>0);
  const visiblePile=sim.pileSheets.filter(item=>item.mesh.visible).sort((a,b)=>a.userData.serial-b.userData.serial);
  assert.ok(visiblePile.length>0);
  const topY=visiblePile.at(-1).mesh.geometry.attributes.position.getY(0);
  const bottomY=visiblePile[0].mesh.geometry.attributes.position.getY(0);
  assert.ok(Math.abs(topY-sim.pileAnchor.y)<1e-8,'delivery top receiving plane must stay fixed');
  assert.ok(bottomY<=topY,'older delivered sheets must sit below the newest sheet as the table lowers');
  assert.ok(sim.state().deliveryTableDropM>=0);
  assert.ok(sim.sheets.every(item=>!item.gripper.visible),'demo gripper blocks remain visible between sheets');
  assert.equal(sim.state().deliveryPilePolicy,'START_EMPTY_STACK_TO_CAPACITY_THEN_CLEAR_AND_REPEAT');
  sim.stop();assert.equal(sim.state().pileSheetsVisible,0);assert.equal(sim.staticDeliveryStack.visible,false,'stop returns to an empty delivery rather than a prebuilt full pile');
 }finally{sim.dispose();m.dispose();}
});

test('Offset 5 clears a full delivery pile before starting a new pile',()=>{
 const m=new Offset5CD102RealismTemplate(),sim=new Offset5CD102RealismSimulation(m.root,m);
 try{
  sim.start();const sheet=sim.sheets[0];
  for(let cycle=0;cycle<sim.maxPileSheets;cycle++)sim.depositSheet(sheet,cycle);
  assert.equal(sim.state().pileSheetsVisible,sim.maxPileSheets);
  const first=sim.pileSheets[0].mesh.geometry.attributes.position.getY(0);
  const last=sim.pileSheets.at(-1).mesh.geometry.attributes.position.getY(0);
  assert.ok(first<last,'older sheets must be lowered with the delivery table');
  assert.ok(Math.abs(last-sim.pileAnchor.y)<1e-8,'newest sheet stays at the fixed receiving plane');
  assert.ok(Math.abs(sim.state().deliveryTableDropM-(sim.maxPileSheets-1)*sim.pileSheetThickness)<1e-9);
  sim.depositSheet(sheet,sim.maxPileSheets);
  assert.equal(sim.completed,sim.maxPileSheets+1);
  assert.equal(sim.state().pileSheetsVisible,1);
  assert.ok(Math.abs(sim.pileSheets[0].mesh.geometry.attributes.position.getY(0)-sim.pileAnchor.y)<1e-8);
  assert.equal(sim.state().deliveryTableDropM,0);
  sim.updateSheet(sim.sheets[1],sim.pathLength);
  const incoming=sim.sheets[1].mesh.geometry.attributes.position;
  assert.ok(Math.abs(incoming.getY(0)-(sim.pileAnchor.y+.008))<1e-6,'incoming sheet settles at the fixed delivery receiving plane');
  assert.ok(Math.abs(incoming.getY(0)-incoming.getY(sim.sheetLengthSegments*(sim.sheetWidthSegments+1)))<1e-8,'released sheet remains flat');
  sim.depositSheet(sheet,sim.maxPileSheets);assert.equal(sim.completed,sim.maxPileSheets+1,'one sheet cannot deposit twice');
  sim.stop();
  assert.equal(sim.state().pileSheetsVisible,0);
  assert.equal(sim.state().deliveryTableDropM,0);
  assert.ok(Math.abs(sim.deliveryTableMesh.position.y-sim.deliveryTableInitialY)<1e-12);
 }finally{sim.dispose();m.dispose();}
});

test('Offset 5 Focusight optical heads are attached and face the sheet plane',()=>{
 const m=new Offset5CD102RealismTemplate();
 try{
  for(const side of ['a','b']){
   const pod=m.findNode(`inspection-camera-${side}`);
   assert.ok(pod,`missing Focusight camera pod ${side}`);
   assert.equal(pod.userData.opticalAxisPolicy,'PHOTO_VERIFIED_DOWNWARD_TO_SHEET_PLANE');
   const barrel=pod.children.find(o=>o.isMesh&&o.userData.inspectionOpticalBarrel);
   const lens=pod.children.find(o=>o.isMesh&&o.userData.inspectionLens);
   assert.ok(barrel&&lens,`camera pod ${side} is missing attached optical barrel/lens`);
   assert.equal(lens.userData.opticalAxis,'DOWNWARD_TOWARD_SHEET_PLANE_WITH_SMALL_PROCESS_DIRECTION_TILT');
   const barrelY=barrel.userData.opticalBarrelCenter?.[1]??barrel.position.y;
   const barrelTilt=barrel.userData.opticalTiltZ??barrel.rotation.z;
   assert.ok(lens.position.y<barrelY,'lens must sit below its barrel toward the sheet');
   assert.ok(barrelY<2.88,'barrel must sit below the camera body center');
   assert.ok(Math.abs(lens.rotation.z+.15)<1e-9&&Math.abs(barrelTilt+.15)<1e-9,'optics must share the camera body process-direction tilt');
  }
  assert.equal(m.root.userData.machineEnvelope.structuralBody.length,26.00);
 }finally{m.dispose();}
});

test('Offset 5 Focusight illumination follows sheet occupancy and restores after stop',()=>{
 const m=new Offset5CD102RealismTemplate(),sim=new Offset5CD102RealismSimulation(m.root,m);
 try{
  assert.ok(sim.inspectionIllumination.length>0,'inspection lighting material was not collected');
  const initial=sim.inspectionIllumination.map(x=>x.initialIntensity);
  sim.start();sim.update(0);
  let seen=false;
  for(let ms=16;ms<=14000;ms+=16){
   sim.update(ms);
   if(sim.state().inspectionIlluminationActive){seen=true;break;}
  }
  assert.equal(seen,true,'Focusight illumination never followed a passing sheet');
  assert.ok(sim.inspectionIllumination.every(x=>x.material.emissiveIntensity>=.42));
  assert.equal(sim.state().inspectionIlluminationPolicy,'SHEET_OCCUPANCY_TRIGGERED_EXISTING_FOCUSIGHT_LIGHTING_ONLY');
  sim.stop();
  assert.equal(sim.state().inspectionIlluminationActive,false);
  assert.deepEqual(sim.inspectionIllumination.map(x=>x.material.emissiveIntensity),initial);
 }finally{sim.dispose();m.dispose();}
});

test('Offset 5 first delivered sheet immediately joins the empty pile',()=>{
 const m=new Offset5CD102RealismTemplate(),sim=new Offset5CD102RealismSimulation(m.root,m);
 try{
  sim.start();sim.update(0);let firstTime=null;
  for(let ms=16;ms<=16000;ms+=16){
   sim.update(ms);
   if(sim.completed){firstTime=ms;break;}
  }
  assert.ok(firstTime!==null,'first sheet never reached delivery');
  assert.equal(sim.completed,1);
  assert.equal(sim.state().pileSheetsVisible,1,'first sheet must appear on the same frame as its release');
  assert.equal(sim.pileSheets[0].mesh.visible,true);
 }finally{sim.dispose();m.dispose();}
});

test('Offset 5 restart resets every reused sheet before it enters PU1',()=>{
 const m=new Offset5CD102RealismTemplate(),sim=new Offset5CD102RealismSimulation(m.root,m);
 try{
  sim.start();const sheet=sim.sheets[0],w=sim.sheetWidthSegments,index=Math.round(.13*sim.sheetLengthSegments)*(w+1)+4;
  sim.updateSheet(sheet,sim.pathLength*.75);
  assert.ok(sheet.userData.contactRowMasks?.some(mask=>mask!==0));
  sim.stop();
  assert.equal(sim.staticDeliveryStack.visible,false);
  sim.start();sim.updateSheet(sheet,sim.sheetLength+.02);
  const attr=sheet.mesh.geometry.attributes.color,blank=new THREE.Color(0xf4f0df);
  assert.ok(Math.abs(attr.getX(index)-blank.r)<.001,'first sheet must reenter blank, without ink from the prior run');
  assert.equal(sim.state().pileSheetsVisible,0);
 }finally{sim.dispose();m.dispose();}
});

test('Offset 5 path clears impression, blanket and inter-unit drums; grippers orbit their shaft',()=>{
 const m=new Offset5CD102RealismTemplate(),sim=new Offset5CD102RealismSimulation(m.root,m);
 try{
  m.root.updateMatrixWorld(true);
  const samples=Array.from({length:1101},(_,i)=>sim.curve.getPointAt(i/1100));
  for(let unit=0;unit<8;unit++)for(const type of ['impression','blanket']){
   const box=new THREE.Box3().setFromObject(m.findNode(`press-${unit}-cylinder-${type}-body`));
   const center=box.getCenter(new THREE.Vector3()),radius=box.getSize(new THREE.Vector3()).x/2;
   const clearance=Math.min(...samples.map(p=>Math.hypot(p.x-center.x,p.y-center.y)-radius));
   assert.ok(clearance>.005,`PU${unit+1} sheet penetrates ${type} cylinder`);
  }
  for(let unit=1;unit<8;unit++){
   const drum=m.findNode(`transfer-pu${unit}-pu${unit+1}`).children.find(o=>o.isMesh&&o.geometry.type==='CylinderGeometry');
   const center=drum.getWorldPosition(new THREE.Vector3()),radius=drum.geometry.parameters.radiusTop;
   const clearance=Math.min(...samples.map(p=>Math.hypot(p.x-center.x,p.y-center.y)-radius));
   assert.ok(clearance>.012,`PU${unit} to PU${unit+1} sheet intersects transfer drum`);
   assert.equal(sim.rotors.find(item=>item.role===`PU${unit}-PU${unit+1}-transfer-drum`)?.sign,-1,'transfer surface must move toward delivery above the shaft');
  }
  sim.start();sim.update(0);sim.update(250);
  assert.equal(sim.gripperMotions.length,14);
  for(const item of sim.gripperMotions){
   const a=item.object.rotation.z,cos=Math.cos(a),sin=Math.sin(a);
   const anchorX=item.object.position.x+cos*item.barX-sin*item.barY;
   const anchorY=item.object.position.y+sin*item.barX+cos*item.barY;
   const radius=Math.hypot(anchorX,anchorY-item.drumY);
   assert.ok(Math.abs(radius-item.radius)<1e-7,'gripper must orbit the transfer shaft');
   assert.ok(Math.abs(item.currentOrbitAngle-a)<1e-10,'gripper fingers must rotate with the drum orbit');
  }
  assert.equal(sim.state().interUnitGripperPolicy,'RIGID_FINGER_ASSEMBLY_ROTATES_WITH_TRANSFER_DRUM_ORBIT');
 }finally{sim.dispose();m.dispose();}
});

test('Offset 5 inks each section only after that section passes the PU nip',()=>{
 const m=new Offset5CD102RealismTemplate(),sim=new Offset5CD102RealismSimulation(m.root,m);
 try{
  const sheet=sim.sheets[0],w=sim.sheetWidthSegments,attr=sheet.mesh.geometry.attributes.color;
  const firstBand=Math.round(.13*sim.sheetLengthSegments),center=firstBand*(w+1)+Math.floor(w/2);
  const blank=new THREE.Color(0xf4f0df);
  let candidate=null;
  for(let distance=sim.sheetLength;distance<sim.pathLength*.38;distance+=.008){
   sim.updateSheet(sheet,distance);
   const pos=sheet.mesh.geometry.attributes.position;
   const leadX=pos.getX(sim.sheetLengthSegments*(w+1)),rowX=pos.getX(center);
   if(leadX>OFFSET5_UNIT_CENTERS[0]+.22&&rowX<OFFSET5_UNIT_CENTERS[0]+.22){candidate=distance;break;}
  }
  assert.ok(candidate,'a sheet must straddle the PU1 ink nip during transport');
  assert.ok(Math.abs(attr.getX(center)-blank.r)<.001,'section upstream of PU1 remains unprinted');
  sim.updateSheet(sheet,candidate+.65);
  assert.ok(Math.abs(attr.getX(center)-blank.r)>.08,'same section is inked after passing the impression nip');
  const transfer=m.findNode('transfer-pu1-pu2');
  assert.equal(transfer.children.filter(o=>o.userData.realismRole==='interunit-drum-frame-tie').length,4);
  assert.equal(transfer.children.filter(o=>o.userData.realismRole==='interunit-frame-bearing-saddle').length,4);
  assert.equal(transfer.children.filter(o=>o.userData.realismRole==='interunit-bearing-saddle-cap').length,4);
  assert.equal(transfer.children.filter(o=>o.userData.realismRole==='interunit-drum-bearing-retainer').length,2);
  assert.equal(transfer.userData.frameMountPolicy,'JOURNAL_TO_ADJACENT_PU_INNER_FRAME_FACES');
  assert.ok(Math.abs(transfer.userData.lockedFrameMountEdges[0]+.385)<1e-9);
  assert.ok(Math.abs(transfer.userData.lockedFrameMountEdges[1]-.365)<1e-9);
  for(const tie of transfer.children.filter(o=>o.userData.realismRole==='interunit-drum-frame-tie')){
   const side=Math.sign(tie.userData.attachedFrameInnerX);
   const box=new THREE.Box3().setFromObject(tie);
   const bearingX=transfer.getWorldPosition(new THREE.Vector3()).x;
   assert.ok(side<0?box.max.x>=bearingX-.01:box.min.x<=bearingX+.01,'frame tie must overlap the transfer journal center');
  }
  const coverDetail=m.realismMeshes.find(o=>o.userData.coverMountedDetail&&o.userData.silhouetteCritical);
  m.setExteriorOpen(true);m.setLow(true);
  assert.equal(coverDetail.visible,false,'low-detail mode must not leave detached cover trim in the cutaway');
  m.setExteriorOpen(false);
 }finally{sim.dispose();m.dispose();}
});

test('Offset 5 dryer keeps transport rollers batched while sheet and UV carry visible process motion',()=>{
 const m=new Offset5CD102RealismTemplate(),sim=new Offset5CD102RealismSimulation(m.root,m);
 try{
  assert.equal(sim.rotors.filter(item=>item.role==='dryer-sheet-transport-roller').length,0);
  const ref=m.findNode('dryer-sheet-path');
  const referenceMeshes=[];
  ref?.traverse(o=>{if(o.isMesh&&o.userData.rotorRoleReference==='dryer-transport-roller')referenceMeshes.push(o);});
  assert.ok(referenceMeshes.reduce((sum,o)=>sum+(o.userData.rotorElementCount||1),0)>=6);
  assert.equal(sim.state().dryerTransportPolicy,'MOBILE_BATCHED_STATIC_REFERENCE__UV_AND_SHEET_PATH_CARRY_VISIBLE_DRYER_MOTION');
 }finally{sim.dispose();m.dispose();}
});

test('Offset 5 coater contact train counter-rotates at sheet surface speed',()=>{
 const m=new Offset5CD102RealismTemplate(),sim=new Offset5CD102RealismSimulation(m.root,m);
 try{
  const roles=['coater-impression-cylinder','coater-transfer-cylinder','coater-chamber-metering-roller'];
  const rotors=roles.map(role=>sim.rotors.find(item=>item.role===role));
  assert.ok(rotors.every(Boolean),'coater process rotors must remain available');
  assert.deepEqual(rotors.map(r=>r.sign),[1,-1,1]);
  for(const rotor of rotors){
   const radius=rotor.mesh.geometry.parameters.radiusTop;
   const surfaceSpeed=rotor.rate*radius*2*Math.PI*sim.sheetCyclesPerSecond;
   assert.ok(Math.abs(surfaceSpeed-sim.baseMetersPerSecond)<1e-9);
   assert.equal(rotor.source,'COATER_CONTACT_SURFACE_SPEED_MATCHED_TO_SHEET_REFERENCE');
  }
  assert.equal(sim.state().coaterMotionPolicy,'EXISTING_THREE_ROLL_CONTACT_TRAIN_MATCHES_SHEET_SURFACE_SPEED');
 }finally{sim.dispose();m.dispose();}
});

test('Offset 5 shows ink only as subtle roller film without floating droplets or glowing impression cylinders',()=>{
 const m=new Offset5CD102RealismTemplate(),sim=new Offset5CD102RealismSimulation(m.root,m);
 try{
  const impression=m.findNode('press-0-cylinder-impression-body');
  const impressionMaterials=[];
  impression.traverse(o=>{if(o.isMesh)impressionMaterials.push(o.material);});
  const before=impressionMaterials.map(material=>material.emissiveIntensity);
  assert.equal(sim.fluidFlows.length,0);
  assert.ok(sim.inkSurfaces.length>8);
  assert.equal(sim.state().inkRepresentation,'THIN_ROLLER_FILM_ONLY_NO_FREE_FLOATING_DROPLETS');
  sim.start();
  assert.ok(sim.inkSurfaces.every(({material})=>material.emissiveIntensity<=.055));
  assert.deepEqual(impressionMaterials.map(material=>material.emissiveIntensity),before);
  sim.setInkFlowVisible(false);
  assert.ok(sim.inkSurfaces.every(({material,initialIntensity})=>material.emissiveIntensity===initialIntensity));
  sim.stop();
 }finally{sim.dispose();m.dispose();}
});

test('Offset 5 feeder suction and register transport share one sheet cycle without fake rotor spin',()=>{
 const m=new Offset5CD102RealismTemplate(),sim=new Offset5CD102RealismSimulation(m.root,m);
 try{
  const blockedOwners=new Set(['feeder-suction-cups','feeder-separation','feeder-head-linkage']);
  assert.ok(sim.rotors.every(item=>!blockedOwners.has(item.mesh?.userData?.ownerId)),'feeder suction/linkage hardware must not be treated as spinning transport rollers');
  for(const id of ['feeder-suction-cups','feeder-separation','feeder-head-linkage','feedboard-front-lays','feedboard-infeed-gripper']){
   const oscillator=sim.oscillators.find(item=>item.object===m.findNode(id));
   assert.ok(oscillator,`missing cyclic motion for ${id}`);
   assert.equal(oscillator.frequency,1,`${id} must share one press-sheet cycle`);
  }
  assert.equal(sim.rotors.filter(item=>item.role==='register-pressure-transport-roller').length,0);
  assert.equal(sim.rotors.filter(item=>item.role==='vacuum-table-tape-drive-roller').length,0);
  assert.equal(sim.state().registerTransportPolicy,'MOBILE_BATCHED_CONTACT_REFERENCE__SHEET_PATH_AND_INFEED_GRIPPER_CARRY_VISIBLE_MOTION');
  for(const code of ['13','2','1','14','3','4','5','6','7','8','9','10','11','12','15']){
   const a=sim.rotors.find(item=>item.role===`PU1-ink-roller-${code}`);
   const b=sim.rotors.find(item=>item.role===`PU2-ink-roller-${code}`);
   assert.ok(a&&b,`missing PU1/PU2 ink roller ${code}`);
   assert.equal(a.sign,b.sign,`ink roller ${code} reverses handedness between adjacent identical PUs`);
  }
  for(const code of ['16','17','FR','19','18']){
   const a=sim.rotors.find(item=>item.role===`PU1-damp-roller-${code}`);
   const b=sim.rotors.find(item=>item.role===`PU2-damp-roller-${code}`);
   assert.ok(a&&b,`missing PU1/PU2 damp roller ${code}`);
   assert.equal(a.sign,b.sign,`damp roller ${code} reverses handedness between adjacent identical PUs`);
  }
  assert.equal(sim.state().feederMotionPolicy,'SUCTION_SEPARATOR_LINKAGE_FRONT_LAYS_AND_INFEED_GRIPPER_SHARE_ONE_SHEET_CYCLE');
  assert.equal(sim.state().rollerHandednessPolicy,'IDENTICAL_STRAIGHT_PRINT_KINEMATIC_SIGN_PATTERN_ACROSS_ALL_EIGHT_PU');
 }finally{sim.dispose();m.dispose();}
});

test('Offset 5 delivery chain shares one forward rotation sense and the sheet brake visibly decelerates',()=>{
 const m=new Offset5CD102RealismTemplate(),sim=new Offset5CD102RealismSimulation(m.root,m);
 try{
  const chain=sim.rotors.filter(item=>item.role==='delivery-chain-sprocket');
  const brakes=sim.rotors.filter(item=>item.role==='sheet-brake-roller');
  assert.equal(chain.length,4);
  assert.equal(brakes.length,3);
  assert.ok(chain.every(item=>item.sign===-1&&item.visualSpeedRatio===1));
  assert.ok(brakes.every(item=>item.sign===-1&&item.visualSpeedRatio===.82));
  for(const item of chain){
   const r=item.mesh.geometry.parameters.radiusTop;
   const surface=item.rate*r*2*Math.PI*sim.sheetCyclesPerSecond;
   assert.ok(Math.abs(surface-sim.baseMetersPerSecond)<1e-9);
  }
  for(const item of brakes){
   const r=item.mesh.geometry.parameters.radiusTop;
   const surface=item.rate*r*2*Math.PI*sim.sheetCyclesPerSecond;
   assert.ok(Math.abs(surface-.82*sim.baseMetersPerSecond)<1e-9);
  }
  const st=sim.state();
  assert.equal(st.deliveryChainMotionPolicy,'SINGLE_FORWARD_LOOP_SPROCKETS_SHARE_ROTATION_DIRECTION');
  assert.equal(st.sheetBrakeMotionPolicy,'CONTROLLED_DECELERATION_VISUAL_REFERENCE_NOT_SERVICE_SETPOINT');
 }finally{sim.dispose();m.dispose();}
});

test('Offset 5 cylinder contacts keep one straight-print direction across all eight custom-spaced units',()=>{
 const m=new Offset5CD102RealismTemplate(),sim=new Offset5CD102RealismSimulation(m.root,m);
 try{
  const expected={plate:1,blanket:-1,impression:1,transfer:-1};
  for(let unit=1;unit<=8;unit++)for(const [type,sign] of Object.entries(expected)){
   const rotor=sim.rotors.find(item=>item.role===`PU${unit}-${type}-cylinder`);
   assert.ok(rotor,`PU${unit} missing ${type} cylinder motion`);
   assert.equal(rotor.sign,sign);
   const surfaceSpeed=rotor.rate*rotor.mesh.geometry.parameters.radiusTop*2*Math.PI*sim.sheetCyclesPerSecond;
   assert.ok(Math.abs(surfaceSpeed-sim.baseMetersPerSecond)<1e-9);
  }
  assert.equal(sim.state().cylinderMotionPolicy,'SAME_STRAIGHT_PRINT_DIRECTION_ALL_PU_CONTACT_PAIRS_COUNTER_ROTATE');
 }finally{sim.dispose();m.dispose();}
});
