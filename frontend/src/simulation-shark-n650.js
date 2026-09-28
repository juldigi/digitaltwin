import * as THREE from 'three';
import {progressAtX} from './inspection-path.js';

export const SHARK_N650_SIMULATION_STAGES=Object.freeze([
 'Pengumpanan blank otomatis','Transfer suction negative-pitch','Pencahayaan terkontrol + camera capture','Pemrosesan vision demo',
 'Pelacakan keputusan pass / reject','Aktuasi reject demo','Rute return good / bad','Pengumpulan output'
]);
const Y_AXIS=new THREE.Vector3(0,1,0);
const clamp=v=>Math.max(0,Math.min(1,v));

export class SharkN650ProcessSimulation{
 constructor(root,template){
  this.root=root;this.template=template;this.active=false;this.running=false;this.paused=false;this.speed=1;this.completed=0;this.rejected=0;this.inspectedDemoCount=0;this.elapsed=0;this.lastNow=null;this.onUpdate=null;
  this.rotors=[];this.suckers=[];this.lights=[];this.airNozzles=[];this.blanks=[];this.goodStack=[];this.badStack=[];this.pathVisible=false;
  this.gate=template.findNode('shark650-reject-plate');this.gateRest=this.gate?.rotation.z||0;
  root.traverse(o=>{if(o.isMesh&&o.userData.rotor)this.rotors.push(o);if(o.isMesh&&o.userData.reciprocator)this.suckers.push(o);if(o.isMesh&&o.userData.inspectionLight)this.lights.push(o);if(o.isMesh&&o.userData.mechanismRole==='air-nozzle')this.airNozzles.push(o);});
  this.rotorRest=this.rotors.map(r=>r.quaternion.clone());this.suckerRest=this.suckers.map(s=>s.position.clone());
  this.points=[[-3.32,.75,0],[-2.72,.73,0],[-1.82,.73,0],[-.78,.73,0],[.20,.73,0],[1.38,.71,0],[2.25,.71,0],[3.36,.71,0]].map(p=>new THREE.Vector3(...p));
  this.curve=new THREE.CatmullRomCurve3(this.points,false,'centripetal');
  this.scanStart=progressAtX(this.curve,-.12-.54/2);
  this.scanEnd=progressAtX(this.curve,-.12+.54/2);
  this.decisionAt=this.scanEnd+.12;
  this.returnBranchStartT=.70;
  this.returnBranchEndT=.92;
  this.returnBranchStart=this.curve.getPointAt(this.returnBranchStartT).clone();
  this.goodLaneEntry=new THREE.Vector3(2.48,.755,-.18);
  this.badLaneEntry=new THREE.Vector3(2.48,.585,.52);
  this.staticDeliveryReferences=template.meshes.filter(m=>m.userData.returnReference);
  this.staticDeliveryVisibility=this.staticDeliveryReferences.map(m=>m.visible);
  const pathGeo=new THREE.BufferGeometry().setFromPoints(this.curve.getPoints(210)),pathMat=new THREE.LineDashedMaterial({color:0x3d84a6,dashSize:.055,gapSize:.035,transparent:true,opacity:.54});
  this.pathLine=new THREE.Line(pathGeo,pathMat);this.pathLine.computeLineDistances();this.pathLine.visible=false;this.pathLine.name='SHARK650-TRACKED-INSPECTION-PATH';root.add(this.pathLine);
  for(let i=0;i<14;i++){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.54,.36),new THREE.MeshStandardMaterial({color:0xdec89f,roughness:.88,side:THREE.DoubleSide}));mesh.rotation.x=-Math.PI/2;mesh.visible=false;root.add(mesh);this.blanks.push({mesh,index:i,phase:i/14,lap:-1,result:null,captured:false,processed:false,decisionReady:false,inspectedLap:-1,trackingId:null,decisionSequence:null});}
  for(let i=0;i<24;i++){const good=new THREE.Mesh(new THREE.BoxGeometry(.54,.006,.36),new THREE.MeshStandardMaterial({color:0xdec89f,roughness:.9})),bad=good.clone();bad.material=good.material.clone();good.visible=bad.visible=false;good.userData.route='GOOD_RETURN_FISH_SCALE';bad.userData.route='BAD_RETURN';root.add(good,bad);this.goodStack.push(good);this.badStack.push(bad);}
  this.resetFlags();this.updateOptics(false);
 }
 resetFlags(){this.feederSuctionActive=false;this.feederPickupPhase=null;this.feederPickupStroke=0;this.feederSuctionReferenceOnly=true;this.transferDriveActive=false;this.goodReturnDriveActive=false;this.badReturnDriveActive=false;this.transferVacuumReady=false;this.transportEncoderActive=false;this.blankPresenceTrigger=false;this.lightingProgramReady=false;this.cameraTriggerActive=false;this.captureComplete=false;this.scanActive=false;this.processingActive=false;this.processingComplete=false;this.decisionReady=false;this.rejectPermit=false;this.rejectConfirmed=false;this.goodReturnConfirmed=false;this.badReturnConfirmed=false;this.negativePitchCapabilityReference=true;this.negativePitchActive=false;this.negativePitchOverlapReference=.06;this.negativePitchPublishedCapacityGainPercent=30;this.goodLaneZ=-.18;this.badLaneZ=.52;this.interlockSafe=true;this.rejectTrackingActive=false;this.demoRejectActive=false;this.goodRoutingActive=false;this.badRoutingActive=false;this.demoRejectOnly=true;this.demoRejectActuator='NEUTRAL_KICK_OFF_REFERENCE__INSTALLED_ACTUATOR_UNVERIFIED';this.activeRejectTrackingIds=[];this.activePassTrackingIds=[];}
 state(){
  const p=this.active?(this.elapsed/7.2)%1:0;
  let index=0;
  if(this.transferDriveActive)index=1;
  if(this.scanActive)index=2;
  if(this.processingActive)index=3;
  if(this.decisionReady)index=4;
  if(this.demoRejectActive)index=5;
  if(this.goodRoutingActive||this.badRoutingActive)index=6;
  if(!this.goodReturnDriveActive&&!this.badReturnDriveActive&&(this.completed>0||this.rejected>0)&&!this.scanActive&&!this.processingActive&&!this.demoRejectActive)index=7;
  return {available:true,blocked:false,active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:SHARK_N650_SIMULATION_STAGES[index],stageIndex:index,stagePolicy:'MECHANISM_STATE_DRIVEN_DOWNSTREAM_PRIORITY',completed:this.completed,rejectedDemo:this.rejected,inspectedDemoCount:this.inspectedDemoCount,progress:p,
   sheetsVisible:this.blanks.filter(b=>b.mesh.visible).length,pileSheetsVisible:this.goodStack.filter(p=>p.visible).length,rejectSheetsVisible:this.badStack.filter(p=>p.visible).length,
   rotorCount:this.rotors.length,oscillatorCount:this.suckers.length,mechanismCount:this.rotors.length+this.suckers.length+this.lights.length+1,pathVisible:this.pathVisible,inkFlowVisible:false,inkFlowCount:0,uvLampCount:0,uvActive:false,
   feederSuctionActive:this.feederSuctionActive,feederPickupPhase:this.feederPickupPhase,feederPickupStrokeM:this.feederPickupStroke,feederSuctionReferenceOnly:this.feederSuctionReferenceOnly,transferDriveActive:this.transferDriveActive,goodReturnDriveActive:this.goodReturnDriveActive,badReturnDriveActive:this.badReturnDriveActive,transferVacuumReady:this.transferVacuumReady,transportEncoderActive:this.transportEncoderActive,blankPresenceTrigger:this.blankPresenceTrigger,lightingProgramReady:this.lightingProgramReady,cameraTriggerActive:this.cameraTriggerActive,captureComplete:this.captureComplete,scanActive:this.scanActive,processingActive:this.processingActive,processingComplete:this.processingComplete,decisionReady:this.decisionReady,rejectPermit:this.rejectPermit,rejectConfirmed:this.rejectConfirmed,goodReturnConfirmed:this.goodReturnConfirmed,badReturnConfirmed:this.badReturnConfirmed,negativePitchCapabilityReference:this.negativePitchCapabilityReference,negativePitchActive:this.negativePitchActive,negativePitchOverlapReference:this.negativePitchOverlapReference,negativePitchPublishedCapacityGainPercent:this.negativePitchPublishedCapacityGainPercent,transportMode:'NEGATIVE_PITCH_FULL_SUCTION_OFFLINE_DEMO_REFERENCE',goodBadReturnLineOfficial:true,interlockSafe:this.interlockSafe,rejectTrackingActive:this.rejectTrackingActive,demoRejectActive:this.demoRejectActive,goodRoutingActive:this.goodRoutingActive,badRoutingActive:this.badRoutingActive,
   demoRejectOnly:true,demoRejectActuator:this.demoRejectActuator,suffixDecoded:false,installedFeederModeVerified:false,installedCameraPackageVerified:false,installedRejectTypeVerified:false,installedCollectionModeVerified:false,deterministicDefectInjection:'EVERY_6TH_INSPECTED_BLANK_DEMO_ONLY',scanWindow:[this.scanStart,this.scanEnd],scanPositionPolicy:'BLANK_OCCUPIES_OPTICAL_TOWER',returnBranchPolicy:'TRACKED_BLANK_BRANCHES_FROM_DECISION_SPLIT_TO_GOOD_OR_BAD_RETURN_ENTRY',
   activeRejectTrackingIds:[...this.activeRejectTrackingIds],activePassTrackingIds:[...this.activePassTrackingIds],trackedResults:{pass:this.blanks.filter(b=>b.result==='PASS_DEMO').length,reject:this.blanks.filter(b=>b.result==='REJECT_DEMO').length,pending:this.blanks.filter(b=>!b.result).length}};
 }
 start(){this.active=true;this.running=true;this.paused=false;this.completed=0;this.rejected=0;this.inspectedDemoCount=0;this.elapsed=0;this.lastNow=null;for(const b of this.blanks){b.lap=-1;b.result=null;b.captured=false;b.processed=false;b.decisionReady=false;b.outputDeposited=false;b.inspectedLap=-1;b.lastT=0;b.trackingId=null;b.decisionSequence=null;b.mesh.visible=false;}this.resetMechanisms();this.staticDeliveryReferences.forEach(m=>m.visible=false);this.onUpdate?.(this.state());return this.state();}
 pause(){this.running=false;this.paused=this.active;this.onUpdate?.(this.state());return this.state();}
 resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;}this.onUpdate?.(this.state());return this.state();}
 setSpeed(v){this.speed=Math.max(.25,Math.min(4,Number(v)||1));return this.state();}
 setPathVisible(v){this.pathVisible=!!v;this.pathLine.visible=this.pathVisible;return this.state();}
 setInkFlowVisible(){return this.state();}
 spin(r,dt,rate){const axis=Y_AXIS,q=new THREE.Quaternion().setFromAxisAngle(axis,(r.userData.spinDirection||1)*rate*dt);r.quaternion.multiply(q).normalize();}
 updateRotors(dt){for(const r of this.rotors){const role=String(r.userData.mechanismRole||''),transfer=['transport-pulley','transfer-drive-motor','transfer-encoder'].includes(role)&&this.transferDriveActive,vac=role==='vacuum-blower'&&this.transferVacuumReady,inspect=role==='inspection-encoder-wheel'&&(this.blankPresenceTrigger||this.scanActive),good=['good-return','good-return-motor'].includes(role)&&this.goodReturnDriveActive,bad=['bad-return','bad-return-motor'].includes(role)&&this.badReturnDriveActive;if(!(transfer||vac||inspect||good||bad))continue;const rate=vac?8.6:transfer?6.0:good||bad?5.4:6.2;this.spin(r,dt,rate);}}
 updateOptics(active){for(const l of this.lights){l.material.emissive?.setHex(active?0xe8f7ff:0x25323a);l.material.emissiveIntensity=active?2.25:.15;}}
 updateSuckers(active,pickupPhase=null){
  this.feederSuctionActive=active;
  const phase=pickupPhase===null?0:clamp(pickupPhase/.22),stroke=Math.sin(phase*Math.PI),travel=.028*stroke;
  this.suckers.forEach((s,i)=>{s.position.copy(this.suckerRest[i]);if(active)s.position.y-=travel;});
  this.feederPickupPhase=pickupPhase;
  this.feederPickupStroke=active?travel:0;
 }
 assignInspectionResult(blank,lap){const seq=lap*this.blanks.length+blank.index;blank.result=(seq%6===0)?'REJECT_DEMO':'PASS_DEMO';blank.inspectedLap=lap;blank.decisionSequence=seq;blank.trackingId='SHARK-DEMO-'+String(seq).padStart(5,'0');this.inspectedDemoCount++;}
 relayoutReturnStack(stack,entry,step){
  const visible=stack.filter(m=>m.visible).sort((a,b)=>(a.userData.outputSerial??0)-(b.userData.outputSerial??0));
  const count=visible.length;
  visible.forEach((m,index)=>{
   const age=count-1-index;
   m.position.set(entry.x+age*step,entry.y+.003*(age%3),entry.z);
   m.rotation.y=0;
  });
 }
 outputPreviousResult(blank){
  if(blank.result==='REJECT_DEMO'){
   this.rejected++;const slot=(this.rejected-1)%this.badStack.length,m=this.badStack[slot];m.visible=true;m.userData.outputSerial=this.rejected;m.position.copy(this.badLaneEntry);this.relayoutReturnStack(this.badStack,this.badLaneEntry,.085);
  }else if(blank.result==='PASS_DEMO'){
   this.completed++;const slot=(this.completed-1)%this.goodStack.length,m=this.goodStack[slot];m.visible=true;m.userData.outputSerial=this.completed;m.position.copy(this.goodLaneEntry);this.relayoutReturnStack(this.goodStack,this.goodLaneEntry,.095);
  }
 }
 updateBlanks(){
  let scan=0,processing=0,processed=0,decisions=0,rejectTracked=false,rejectAtGate=false,rejectConfirmed=false,goodRoute=false,badRoute=false,goodConfirmed=false,badConfirmed=false,feed=false,feedCount=0,pickupPhase=null,pickupDistance=Infinity,trigger=false;const rejectIds=[],passIds=[];const base=this.elapsed/7.2;
  for(const b of this.blanks){
   const raw=base-b.phase;if(raw<0){b.mesh.visible=false;continue;}const lap=Math.floor(raw),t=((raw%1)+1)%1;if(lap>b.lap){if(b.lap>=0&&!b.outputDeposited)this.outputPreviousResult(b);b.lap=lap;b.result=null;b.captured=false;b.processed=false;b.decisionReady=false;b.outputDeposited=false;b.inspectedLap=-1;}
   if(t<.22){
    feed=true;feedCount++;
    const d=Math.abs(t-.06);if(d<pickupDistance){pickupDistance=d;pickupPhase=t;}
   }
   if(t>=this.scanStart-.025&&t<this.scanStart+.015)trigger=true;
   if(t>=this.scanStart&&t<this.scanEnd)scan++;
   if(t>=this.scanEnd)b.captured=true;
   if(t>=this.scanEnd&&t<this.decisionAt&&b.captured){processing++;if(t>=this.decisionAt-.035)b.processed=true;}
   if(b.processed&&!b.decisionReady&&t>=this.decisionAt){this.assignInspectionResult(b,lap);b.decisionReady=true;}
   if(b.processed)processed++;if(b.decisionReady)decisions++;
   b.mesh.visible=this.active;b.mesh.position.copy(this.curve.getPointAt(Math.min(.999,t)));if(t<.22){const compression=1-.12*(1-t/.22);b.mesh.position.x=-3.32+(b.mesh.position.x+3.32)*compression;}
   if(t>=this.returnBranchStartT&&b.decisionReady&&b.result){
    const q=clamp((t-this.returnBranchStartT)/(this.returnBranchEndT-this.returnBranchStartT)),eased=q*q*(3-2*q);
    const target=b.result==='REJECT_DEMO'?this.badLaneEntry:this.goodLaneEntry;
    b.mesh.position.lerpVectors(this.returnBranchStart,target,eased);
    if(b.result==='REJECT_DEMO'){
     b.mesh.position.y+=Math.sin(eased*Math.PI)*.045;rejectTracked=true;badRoute=true;
     if(b.trackingId)rejectIds.push(b.trackingId);if(t>=.74&&t<.88)rejectAtGate=true;if(t>=.86)rejectConfirmed=badConfirmed=true;
    }else{
     goodRoute=true;if(b.trackingId)passIds.push(b.trackingId);if(t>=.90)goodConfirmed=true;
    }
   }
   if(t>=.96){if(!b.outputDeposited){this.outputPreviousResult(b);b.outputDeposited=true;}b.mesh.visible=false;}
   b.mesh.material.emissive?.setHex(t>=this.scanStart&&t<this.scanEnd?0x2f7a9d:b.result==='REJECT_DEMO'&&t>=this.decisionAt?0x6e2d27:0);b.mesh.material.emissiveIntensity=t>=this.scanStart&&t<this.scanEnd?.78:b.result==='REJECT_DEMO'&&t>=this.decisionAt?.42:0;b.lastT=t;
  }
  this.feederSuctionActive=feed;this.transferDriveActive=this.blanks.some(b=>{const raw=base-b.phase;if(raw<0)return false;const t=((raw%1)+1)%1;return t>=.12&&t<.92;});this.transferVacuumReady=this.transferDriveActive;this.transportEncoderActive=this.transferDriveActive;this.blankPresenceTrigger=trigger;this.lightingProgramReady=scan>0;this.cameraTriggerActive=trigger;this.captureComplete=this.blanks.some(b=>b.captured);this.scanActive=scan>0;this.processingActive=processing>0;this.processingComplete=processed>0;this.decisionReady=decisions>0;this.rejectPermit=rejectAtGate&&decisions>0;this.rejectConfirmed=rejectConfirmed;this.goodReturnConfirmed=goodConfirmed;this.badReturnConfirmed=badConfirmed;this.negativePitchActive=feedCount>=2;this.rejectTrackingActive=rejectTracked;this.demoRejectActive=this.rejectPermit;this.goodRoutingActive=goodRoute;this.badRoutingActive=badRoute;this.goodReturnDriveActive=goodRoute;this.badReturnDriveActive=badRoute;this.interlockSafe=(!this.demoRejectActive||this.rejectPermit)&&(!this.processingActive||this.captureComplete);
  this.activeRejectTrackingIds=rejectIds;this.activePassTrackingIds=passIds;this.updateOptics(this.scanActive);this.updateSuckers(feed,pickupPhase);
  if(this.gate)this.gate.rotation.z=this.gateRest+(this.rejectPermit?.40:0);for(const n of this.airNozzles){n.material.emissive?.setHex(0);n.material.emissiveIntensity=0;}
 }
 update(now){if(!this.active||!this.running){this.lastNow=now;return;}if(this.lastNow===null){this.lastNow=now;return;}const dt=Math.min(.12,Math.max(0,(now-this.lastNow)/1000))*this.speed;this.lastNow=now;this.elapsed+=dt;this.updateBlanks();this.updateRotors(dt);this.onUpdate?.(this.state());}
 resetMechanisms(){if(this.gate)this.gate.rotation.z=this.gateRest;this.rotors.forEach((r,i)=>r.quaternion.copy(this.rotorRest[i]));this.suckers.forEach((s,i)=>s.position.copy(this.suckerRest[i]));this.updateOptics(false);for(const n of this.airNozzles){n.material.emissive?.setHex(0);n.material.emissiveIntensity=0;}for(const b of this.blanks){b.mesh.visible=false;b.mesh.material.emissive?.setHex(0);b.mesh.material.emissiveIntensity=0;}this.resetFlags();}
 stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.rejected=0;this.inspectedDemoCount=0;this.resetMechanisms();for(const m of [...this.goodStack,...this.badStack])m.visible=false;this.staticDeliveryReferences.forEach((m,i)=>m.visible=this.staticDeliveryVisibility[i]);this.pathVisible=false;this.pathLine.visible=false;this.onUpdate?.(this.state());return this.state();}
 dispose(){this.stop();for(const b of this.blanks){this.root.remove(b.mesh);b.mesh.geometry.dispose();b.mesh.material.dispose();}for(const m of [...this.goodStack,...this.badStack]){this.root.remove(m);m.geometry.dispose();m.material.dispose();}this.root.remove(this.pathLine);this.pathLine.geometry.dispose();this.pathLine.material.dispose();}
}
