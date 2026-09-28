import * as THREE from 'three';
import {progressAtX} from './inspection-path.js';

export const DIANA_EYE55_SIMULATION_STAGES=Object.freeze([
 'Pengumpanan blank','Suction-belt transport','LED illumination + camera capture','Pemrosesan citra demo',
 'Pelacakan keputusan pass / reject','Ejection demo','Delivery accepted / reject recovery','Pengumpulan output'
]);
const Y_AXIS=new THREE.Vector3(0,1,0);
const clamp=v=>Math.max(0,Math.min(1,v));

export class DianaEye55ProcessSimulation{
 constructor(root,template){
  this.root=root;this.template=template;this.active=false;this.running=false;this.paused=false;this.speed=1;this.completed=0;this.rejected=0;this.inspectedDemoCount=0;this.elapsed=0;this.lastNow=null;this.onUpdate=null;
  this.rotors=[];this.lights=[];this.airNozzles=[];this.blanks=[];this.goodStack=[];this.rejectStack=[];this.pathVisible=false;
  this.gateMount=template.findNode('diana55-reject-gate');this.gate=this.gateMount?.children.find(o=>o.isMesh&&o.userData.rejectGate)||null;this.gateRest=this.gate?.rotation.z||0;
  root.traverse(o=>{if(o.isMesh&&o.userData.rotor)this.rotors.push(o);if(o.isMesh&&o.userData.inspectionLight)this.lights.push(o);if(o.isMesh&&o.userData.rejectAirNozzle)this.airNozzles.push(o);});
  this.scanWindows=template.meshes.filter(m=>m.userData.scanWindow);
  this.scanWindowRest=this.scanWindows.map(m=>({emissive:m.material.emissive?.clone(),intensity:m.material.emissiveIntensity||0}));
  this.rotorRest=this.rotors.map(r=>r.quaternion.clone());
  this.feederKnife=template.meshes.find(m=>m.userData.mechanismRole==='patented-feeding-knife-reference')||null;
  this.feederKnifeRest=this.feederKnife?.position.clone()||null;
  this.points=[[-3.58,.74,0],[-3.12,.73,0],[-2.42,.73,0],[-1.45,.73,0],[-.55,.73,0],[.35,.73,0],[1.30,.73,0],[1.82,.70,0],[2.55,.70,0],[3.62,.70,0]].map(p=>new THREE.Vector3(...p));
  this.curve=new THREE.CatmullRomCurve3(this.points,false,'centripetal');
  this.scanStart=progressAtX(this.curve,-.24-.48/2);
  this.scanEnd=progressAtX(this.curve,-.24+.48/2);
  this.decisionAt=this.scanEnd+.12;
  this.rejectBranchStartT=.69;
  this.rejectBranchEndT=.90;
  this.rejectBranchStart=this.curve.getPointAt(this.rejectBranchStartT).clone();
  this.rejectTrayEntry=new THREE.Vector3(2.04,.44,.50);
  this.goodBranchStartT=.76;
  this.goodBranchEndT=.92;
  this.goodBranchStart=this.curve.getPointAt(this.goodBranchStartT).clone();
  this.goodLaneEntry=new THREE.Vector3(2.30,.755,-.25);
  this.staticDeliveryReferences=template.meshes.filter(m=>m.userData.fishScaleReference&&!m.userData.supersededByV254);
  this.staticDeliveryVisibility=this.staticDeliveryReferences.map(m=>m.visible);
  const pathGeo=new THREE.BufferGeometry().setFromPoints(this.curve.getPoints(220)),pathMat=new THREE.LineDashedMaterial({color:0x527c8a,dashSize:.055,gapSize:.035,transparent:true,opacity:.55});
  this.pathLine=new THREE.Line(pathGeo,pathMat);this.pathLine.computeLineDistances();this.pathLine.visible=false;this.pathLine.name='DIANA55-TRACKED-INSPECTION-PATH';root.add(this.pathLine);
  for(let i=0;i<7;i++){
   const mat=new THREE.MeshStandardMaterial({color:0xe1cca2,roughness:.88,side:THREE.DoubleSide}),mesh=new THREE.Mesh(new THREE.PlaneGeometry(.48,.36),mat);mesh.rotation.x=-Math.PI/2;mesh.visible=false;root.add(mesh);
   this.blanks.push({mesh,index:i,phase:i/7,lap:-1,result:null,captured:false,processed:false,decisionReady:false,inspectedLap:-1,lastT:0,trackingId:null,decisionSequence:null});
  }
  for(let i=0;i<18;i++){for(const [arr,z,route] of [[this.goodStack,0,'FISH_SCALE_ACCEPT'],[this.rejectStack,.52,'REJECT_CHUTE']]){const m=new THREE.Mesh(new THREE.BoxGeometry(.48,.006,.36),new THREE.MeshStandardMaterial({color:0xe1cca2,roughness:.9}));m.visible=false;m.userData.stackZ=z;m.userData.deliveryRoute=route;root.add(m);arr.push(m);}}
  this.resetFlags();this.updateOptics(false);
 }
 resetFlags(){
  this.feederDriveActive=false;this.feederKnifeActive=false;this.feederKnifeStrokeM=0;this.feederAirAssistActive=false;this.transportDriveActive=false;this.deliveryDriveActive=false;
  this.blankPresenceTrigger=false;this.transportEncoderActive=false;this.vacuumHoldActive=false;
  this.illuminationReady=false;this.cameraTriggerActive=false;this.captureComplete=false;
  this.scanActive=false;this.imageProcessingActive=false;this.processingComplete=false;this.decisionReady=false;
  this.rejectPermit=false;this.rejectConfirmed=false;this.outputCountActive=false;this.interlockSafe=true;
  this.demoRejectActive=false;this.rejectTrackingActive=false;this.acceptedDeliveryActive=false;this.wasteDeliveryActive=false;this.fishScaleDeliveryActive=false;
  this.demoRejectOnly=true;this.demoRejectActuator='NEUTRAL_DAMAGE_FREE_EJECTION_REFERENCE__INSTALLED_ACTUATOR_UNVERIFIED';
  this.goodLaneZ=-.25;this.wasteLaneZ=.28;this.paperJam=false;this.activeRejectTrackingIds=[];this.activePassTrackingIds=[];
 }
 state(){
  const p=this.active?(this.elapsed/7.8)%1:0;
  let index=0;
  if(this.transportDriveActive)index=1;
  if(this.scanActive)index=2;
  if(this.imageProcessingActive)index=3;
  if(this.decisionReady)index=4;
  if(this.demoRejectActive)index=5;
  if(this.acceptedDeliveryActive||this.wasteDeliveryActive)index=6;
  if(!this.deliveryDriveActive&&(this.completed>0||this.rejected>0)&&!this.scanActive&&!this.imageProcessingActive&&!this.demoRejectActive)index=7;
  return {available:true,blocked:false,active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:DIANA_EYE55_SIMULATION_STAGES[index],stageIndex:index,stagePolicy:'MECHANISM_STATE_DRIVEN_DOWNSTREAM_PRIORITY',completed:this.completed,rejectedDemo:this.rejected,inspectedDemoCount:this.inspectedDemoCount,progress:p,
   sheetsVisible:this.blanks.filter(b=>b.mesh.visible).length,pileSheetsVisible:this.goodStack.filter(p=>p.visible).length,rejectSheetsVisible:this.rejectStack.filter(p=>p.visible).length,
   rotorCount:this.rotors.length,mechanismCount:this.rotors.length+this.lights.length+1,pathVisible:this.pathVisible,inkFlowVisible:false,inkFlowCount:0,uvLampCount:0,uvActive:false,
   feederDriveActive:this.feederDriveActive,feederKnifeActive:this.feederKnifeActive,feederKnifeStrokeM:this.feederKnifeStrokeM,feederAirAssistActive:this.feederAirAssistActive,feederMotionPolicy:'OEM_FEEDING_KNIFE_SUBTLE_VIBRATION_AND_AIR_ASSIST_STATE__AMPLITUDE_VISUAL_ONLY',transportDriveActive:this.transportDriveActive,deliveryDriveActive:this.deliveryDriveActive,blankPresenceTrigger:this.blankPresenceTrigger,transportEncoderActive:this.transportEncoderActive,vacuumHoldActive:this.vacuumHoldActive,illuminationReady:this.illuminationReady,cameraTriggerActive:this.cameraTriggerActive,captureComplete:this.captureComplete,scanActive:this.scanActive,imageProcessingActive:this.imageProcessingActive,processingComplete:this.processingComplete,decisionReady:this.decisionReady,rejectPermit:this.rejectPermit,rejectConfirmed:this.rejectConfirmed,outputCountActive:this.outputCountActive,interlockSafe:this.interlockSafe,demoRejectActive:this.demoRejectActive,rejectTrackingActive:this.rejectTrackingActive,acceptedDeliveryActive:this.acceptedDeliveryActive,wasteDeliveryActive:this.wasteDeliveryActive,rejectRecoveryActive:this.wasteDeliveryActive,fishScaleDeliveryActive:this.fishScaleDeliveryActive,deliveryMode:'ACCEPTED_FISH_SCALE_PLUS_RECOVERABLE_REJECT_COLLECTION',paperJam:this.paperJam,rejectSafetyCoverReference:true,deliveryMonitoringCameraReference:true,
   demoRejectOnly:true,demoRejectActuator:this.demoRejectActuator,installedRejectActuationVerified:false,installedCameraCountVerified:false,installedCameraPopulationRendered:false,deterministicDefectInjection:'EVERY_5TH_INSPECTED_BLANK_DEMO_ONLY',scanWindow:[this.scanStart,this.scanEnd],scanPositionPolicy:'BLANK_OCCUPIES_OPTICAL_CELL',opticalAxisPolicy:this.template.root.userData.opticalAxisPolicy,scanPlaneY:this.template.root.userData.scanPlaneY,cameraPopulationPolicy:this.template.root.userData.cameraPopulationPolicy,scanWindowActive:this.scanActive,scanWindowPolicy:'DARK_VIEWING_WINDOW_SUBTLE_OCCUPANCY_GLOW_ONLY',rejectedOutputPolicy:'DAMAGE_FREE_RECOVERABLE_COLLECTION_FOR_RESORT_OR_REINSPECTION_REFERENCE',rejectBranchPolicy:'TRACKED_BLANK_BRANCHES_DIRECTLY_FROM_GATE_TO_RECOVERY_TRAY',acceptedBranchPolicy:'TRACKED_ACCEPTED_BLANK_BRANCHES_TO_FISH_SCALE_ENTRY_WITHOUT_TELEPORT',acceptedStackPolicy:'BOUNDED_FISH_SCALE_8_SLOTS_THEN_VERTICAL_LAYER',
   activeRejectTrackingIds:[...this.activeRejectTrackingIds],activePassTrackingIds:[...this.activePassTrackingIds],trackedResults:{pass:this.blanks.filter(b=>b.result==='PASS_DEMO').length,reject:this.blanks.filter(b=>b.result==='REJECT_DEMO').length,pending:this.blanks.filter(b=>!b.result).length}};
 }
 start(){this.active=true;this.running=true;this.paused=false;this.completed=0;this.rejected=0;this.inspectedDemoCount=0;this.elapsed=0;this.lastNow=null;for(const b of this.blanks){b.lap=-1;b.result=null;b.captured=false;b.processed=false;b.decisionReady=false;b.outputDeposited=false;b.inspectedLap=-1;b.lastT=0;b.trackingId=null;b.decisionSequence=null;b.mesh.visible=false;}this.resetMechanisms();this.staticDeliveryReferences.forEach(m=>m.visible=false);this.onUpdate?.(this.state());return this.state();}
 pause(){this.running=false;this.paused=this.active;this.onUpdate?.(this.state());return this.state();}
 resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;}this.onUpdate?.(this.state());return this.state();}
 setSpeed(v){this.speed=Math.max(.25,Math.min(4,Number(v)||1));return this.state();}
 setPathVisible(v){this.pathVisible=!!v;this.pathLine.visible=this.pathVisible;return this.state();}
 setInkFlowVisible(){return this.state();}
 spin(r,dt,rate){const axis=Y_AXIS,q=new THREE.Quaternion().setFromAxisAngle(axis,(r.userData.spinDirection||1)*rate*dt);r.quaternion.multiply(q).normalize();}
 updateRotors(dt){for(const r of this.rotors){const role=String(r.userData.mechanismRole||''),feed=role==='feed-pulley'&&this.feederDriveActive,transport=['transport-pulley','transport-drive-motor','transport-encoder'].includes(role)&&this.transportDriveActive,vac=role==='vacuum-blower'&&this.vacuumHoldActive,delivery=role==='delivery-pulley'&&this.deliveryDriveActive;if(!(feed||transport||vac||delivery))continue;const rate=vac?8.4:feed?6.1:transport?5.8:5.2;this.spin(r,dt,rate);}}
 updateOptics(active){
  for(const l of this.lights){l.material.emissive?.setHex(active?0xfff0b0:0x302d21);l.material.emissiveIntensity=active?2.25:.14;}
  this.scanWindows.forEach((w,i)=>{
   if(w.material.emissive){
    if(active)w.material.emissive.setHex(0x6b8791);
    else if(this.scanWindowRest[i]?.emissive)w.material.emissive.copy(this.scanWindowRest[i].emissive);
   }
   w.material.emissiveIntensity=active?.18:(this.scanWindowRest[i]?.intensity??0);
   w.material.needsUpdate=true;
  });
 }
 assignInspectionResult(blank,lap){
  const seq=lap*this.blanks.length+blank.index;blank.result=(seq%5===0)?'REJECT_DEMO':'PASS_DEMO';blank.inspectedLap=lap;blank.decisionSequence=seq;blank.trackingId='DIANA-DEMO-'+String(seq).padStart(5,'0');this.inspectedDemoCount++;
 }
 relayoutAcceptedFishScale(){
  const visible=this.goodStack.filter(m=>m.visible).sort((a,b)=>(a.userData.outputSerial??0)-(b.userData.outputSerial??0));
  const count=visible.length,capacity=8;
  visible.forEach((m,index)=>{
   const age=count-1-index,slot=age%capacity,layer=Math.floor(age/capacity);
   m.position.set(this.goodLaneEntry.x+slot*.115,this.goodLaneEntry.y+.003*(slot%3)+layer*.007,this.goodLaneEntry.z);
   m.rotation.y=0;
  });
 }
 outputPreviousResult(blank){
  if(blank.result==='REJECT_DEMO'){
   this.rejected++;const slot=(this.rejected-1)%this.rejectStack.length,m=this.rejectStack[slot];m.visible=true;
   m.position.set(1.78+(slot%7)*.075,.42+.008*(slot%5),.50);m.rotation.y=0;
  }else if(blank.result==='PASS_DEMO'){
   this.completed++;const slot=(this.completed-1)%this.goodStack.length,m=this.goodStack[slot];m.visible=true;m.userData.outputSerial=this.completed;
   m.position.copy(this.goodLaneEntry);this.relayoutAcceptedFishScale();
  }
 }
 updateBlanks(){
  let trigger=false,scanCount=0,processCount=0,processedCount=0,decisionCount=0,rejectAtGate=false,rejectConfirmed=false,trackedReject=false,accepted=false,waste=false,outputCount=false;const rejectIds=[],passIds=[];
  const base=this.elapsed/7.8;
  for(const b of this.blanks){
   const raw=base-b.phase;if(raw<0){b.mesh.visible=false;continue;}const lap=Math.floor(raw),t=((raw%1)+1)%1;
   if(lap>b.lap){if(b.lap>=0&&!b.outputDeposited)this.outputPreviousResult(b);b.lap=lap;b.result=null;b.captured=false;b.processed=false;b.decisionReady=false;b.outputDeposited=false;b.inspectedLap=-1;}
   if(t>=this.scanStart-.025&&t<this.scanStart+.015)trigger=true;
   if(t>=this.scanStart&&t<this.scanEnd)scanCount++;
   if(t>=this.scanEnd)b.captured=true;
   if(t>=this.scanEnd&&t<this.decisionAt&&b.captured){processCount++;if(t>=this.decisionAt-.035)b.processed=true;}
   if(b.processed&&!b.decisionReady&&t>=this.decisionAt){this.assignInspectionResult(b,lap);b.decisionReady=true;}
   if(b.processed)processedCount++;if(b.decisionReady)decisionCount++;
   b.mesh.visible=this.active;const p=this.curve.getPointAt(Math.min(.999,t));b.mesh.position.copy(p);
   const reject=b.result==='REJECT_DEMO';
   if(reject&&b.decisionReady&&t>=this.rejectBranchStartT&&t<.96){
    trackedReject=true;if(b.trackingId)rejectIds.push(b.trackingId);
    const q=clamp((t-this.rejectBranchStartT)/(this.rejectBranchEndT-this.rejectBranchStartT));
    const eased=q*q*(3-2*q),lift=Math.sin(eased*Math.PI)*.045;
    b.mesh.position.lerpVectors(this.rejectBranchStart,this.rejectTrayEntry,eased);
    b.mesh.position.y+=lift;
    if(t>=.72&&t<.86)rejectAtGate=true;
    if(t>=.84){rejectConfirmed=true;waste=true;}
   }
   else if(b.result==='PASS_DEMO'&&b.decisionReady&&t>=this.goodBranchStartT){
    accepted=true;if(b.trackingId)passIds.push(b.trackingId);
    const q=clamp((t-this.goodBranchStartT)/(this.goodBranchEndT-this.goodBranchStartT)),eased=q*q*(3-2*q);
    b.mesh.position.lerpVectors(this.goodBranchStart,this.goodLaneEntry,eased);
    if(t>=.90)outputCount=true;
   }
   if(t>=.96){if(!b.outputDeposited){this.outputPreviousResult(b);b.outputDeposited=true;}b.mesh.visible=false;}
   b.mesh.material.emissive?.setHex((t>=this.scanStart&&t<this.scanEnd)?0x365e6f:reject&&t>=this.decisionAt?0x6d2d23:0);b.mesh.material.emissiveIntensity=(t>=this.scanStart&&t<this.scanEnd)?.8:reject&&t>=this.decisionAt?.45:0;b.lastT=t;
  }
  this.feederDriveActive=this.blanks.some(b=>b.mesh.visible&&b.lastT<.24);this.transportDriveActive=this.blanks.some(b=>b.mesh.visible&&b.lastT>=.18&&b.lastT<.90);this.wasteDeliveryActive=waste;this.deliveryDriveActive=accepted;this.blankPresenceTrigger=trigger;this.transportEncoderActive=this.transportDriveActive;this.vacuumHoldActive=this.transportDriveActive;this.illuminationReady=scanCount>0;this.cameraTriggerActive=trigger;this.captureComplete=this.blanks.some(b=>b.captured);this.scanActive=scanCount>0;this.imageProcessingActive=processCount>0;this.processingComplete=processedCount>0;this.decisionReady=decisionCount>0;this.rejectPermit=rejectAtGate&&decisionCount>0;this.rejectConfirmed=rejectConfirmed;this.outputCountActive=outputCount;this.rejectTrackingActive=trackedReject;this.demoRejectActive=this.rejectPermit;this.acceptedDeliveryActive=accepted;this.fishScaleDeliveryActive=accepted;this.activeRejectTrackingIds=rejectIds;this.activePassTrackingIds=passIds;
  this.interlockSafe=(!this.demoRejectActive||this.rejectPermit)&&(!this.imageProcessingActive||this.captureComplete);
  this.updateOptics(this.scanActive);
  if(this.gate)this.gate.rotation.z=this.gateRest+(this.rejectPermit?.42:0);
  for(const n of this.airNozzles){n.material.emissive?.setHex(0);n.material.emissiveIntensity=0;}
 }
 updateFeederMotion(){
  this.feederKnifeActive=!!(this.feederDriveActive&&this.feederKnife&&this.feederKnifeRest);
  this.feederAirAssistActive=this.feederDriveActive;
  if(!this.feederKnife||!this.feederKnifeRest)return;
  this.feederKnife.position.copy(this.feederKnifeRest);
  if(this.feederKnifeActive){
   const stroke=.006*Math.sin(this.elapsed*13.5);
   this.feederKnife.position.y+=stroke;
   this.feederKnifeStrokeM=stroke;
  }else this.feederKnifeStrokeM=0;
 }
 update(now){
  if(!this.active||!this.running){this.lastNow=now;return;}if(this.lastNow===null){this.lastNow=now;return;}
  const dt=Math.min(.12,Math.max(0,(now-this.lastNow)/1000))*this.speed;this.lastNow=now;this.elapsed+=dt;this.updateBlanks();this.updateFeederMotion();this.updateRotors(dt);this.onUpdate?.(this.state());
 }
 resetMechanisms(){
  if(this.gate)this.gate.rotation.z=this.gateRest;this.rotors.forEach((r,i)=>r.quaternion.copy(this.rotorRest[i]));if(this.feederKnife&&this.feederKnifeRest)this.feederKnife.position.copy(this.feederKnifeRest);this.updateOptics(false);for(const n of this.airNozzles){n.material.emissive?.setHex(0);n.material.emissiveIntensity=0;}for(const b of this.blanks){b.mesh.visible=false;b.mesh.material.emissive?.setHex(0);b.mesh.material.emissiveIntensity=0;}this.resetFlags();
 }
 stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.rejected=0;this.inspectedDemoCount=0;this.resetMechanisms();for(const m of [...this.goodStack,...this.rejectStack])m.visible=false;this.staticDeliveryReferences.forEach((m,i)=>m.visible=this.staticDeliveryVisibility[i]);this.pathVisible=false;this.pathLine.visible=false;this.onUpdate?.(this.state());return this.state();}
 dispose(){this.stop();for(const b of this.blanks){this.root.remove(b.mesh);b.mesh.geometry.dispose();b.mesh.material.dispose();}for(const m of [...this.goodStack,...this.rejectStack]){this.root.remove(m);m.geometry.dispose();m.material.dispose();}this.root.remove(this.pathLine);this.pathLine.geometry.dispose();this.pathLine.material.dispose();}
}
