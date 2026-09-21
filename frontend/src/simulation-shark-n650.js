import * as THREE from 'three';

export const SHARK_N650_SIMULATION_STAGES=Object.freeze([
 'Automatic blank feed','Full-suction transfer','Controlled lighting + camera capture','Vision processing demo',
 'Tracked pass / reject decision demo','Reject actuation demo','Good / bad return routing','Collection'
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
  this.points=[[-3.30,.83,0],[-2.65,.80,0],[-1.65,.80,0],[-.72,.80,0],[.28,.80,0],[1.60,.80,0],[2.40,.77,0],[3.38,.77,0]].map(p=>new THREE.Vector3(...p));
  this.curve=new THREE.CatmullRomCurve3(this.points,false,'centripetal');
  const pathGeo=new THREE.BufferGeometry().setFromPoints(this.curve.getPoints(210)),pathMat=new THREE.LineDashedMaterial({color:0x3d84a6,dashSize:.055,gapSize:.035,transparent:true,opacity:.54});
  this.pathLine=new THREE.Line(pathGeo,pathMat);this.pathLine.computeLineDistances();this.pathLine.visible=false;this.pathLine.name='SHARK650-TRACKED-INSPECTION-PATH';root.add(this.pathLine);
  for(let i=0;i<7;i++){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.54,.36),new THREE.MeshStandardMaterial({color:0xdec89f,roughness:.88,side:THREE.DoubleSide}));mesh.rotation.x=-Math.PI/2;mesh.visible=false;root.add(mesh);this.blanks.push({mesh,index:i,phase:i/7,lap:-1,result:null,inspectedLap:-1,trackingId:null,decisionSequence:null});}
  for(let i=0;i<18;i++){const good=new THREE.Mesh(new THREE.BoxGeometry(.54,.006,.36),new THREE.MeshStandardMaterial({color:0xdec89f,roughness:.9})),bad=good.clone();bad.material=good.material.clone();good.visible=bad.visible=false;root.add(good,bad);this.goodStack.push(good);this.badStack.push(bad);}
  this.resetFlags();this.updateOptics(false);
 }
 resetFlags(){this.feederSuctionActive=false;this.scanActive=false;this.processingActive=false;this.rejectTrackingActive=false;this.demoRejectActive=false;this.goodRoutingActive=false;this.badRoutingActive=false;this.demoRejectOnly=true;this.demoRejectActuator='PLATE_REFERENCE';this.activeRejectTrackingIds=[];this.activePassTrackingIds=[];}
 state(){
  const p=this.active?(this.elapsed/7.2)%1:0,index=Math.min(SHARK_N650_SIMULATION_STAGES.length-1,Math.floor(p*SHARK_N650_SIMULATION_STAGES.length));
  return {available:true,blocked:false,active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:SHARK_N650_SIMULATION_STAGES[index],completed:this.completed,rejectedDemo:this.rejected,inspectedDemoCount:this.inspectedDemoCount,progress:p,
   sheetsVisible:this.blanks.filter(b=>b.mesh.visible).length,pileSheetsVisible:this.goodStack.filter(p=>p.visible).length,rejectSheetsVisible:this.badStack.filter(p=>p.visible).length,
   rotorCount:this.rotors.length,oscillatorCount:this.suckers.length,mechanismCount:this.rotors.length+this.suckers.length+this.lights.length+1,pathVisible:this.pathVisible,inkFlowVisible:false,inkFlowCount:0,uvLampCount:0,uvActive:false,
   feederSuctionActive:this.feederSuctionActive,scanActive:this.scanActive,processingActive:this.processingActive,rejectTrackingActive:this.rejectTrackingActive,demoRejectActive:this.demoRejectActive,goodRoutingActive:this.goodRoutingActive,badRoutingActive:this.badRoutingActive,
   demoRejectOnly:true,demoRejectActuator:this.demoRejectActuator,suffixDecoded:false,installedFeederModeVerified:false,installedCameraPackageVerified:false,installedRejectTypeVerified:false,installedCollectionModeVerified:false,deterministicDefectInjection:'EVERY_6TH_INSPECTED_BLANK_DEMO_ONLY',
   activeRejectTrackingIds:[...this.activeRejectTrackingIds],activePassTrackingIds:[...this.activePassTrackingIds],trackedResults:{pass:this.blanks.filter(b=>b.result==='PASS_DEMO').length,reject:this.blanks.filter(b=>b.result==='REJECT_DEMO').length,pending:this.blanks.filter(b=>!b.result).length}};
 }
 start(){this.active=true;this.running=true;this.paused=false;this.completed=0;this.rejected=0;this.inspectedDemoCount=0;this.elapsed=0;this.lastNow=null;for(const b of this.blanks){b.lap=-1;b.result=null;b.inspectedLap=-1;b.trackingId=null;b.decisionSequence=null;}this.resetMechanisms();this.onUpdate?.(this.state());return this.state();}
 pause(){this.running=false;this.paused=this.active;this.onUpdate?.(this.state());return this.state();}
 resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;}this.onUpdate?.(this.state());return this.state();}
 setSpeed(v){this.speed=Math.max(.25,Math.min(4,Number(v)||1));return this.state();}
 setPathVisible(v){this.pathVisible=!!v;this.pathLine.visible=this.pathVisible;return this.state();}
 setInkFlowVisible(){return this.state();}
 spin(r,dt,rate){const q=new THREE.Quaternion().setFromAxisAngle(Y_AXIS,(r.userData.spinDirection||1)*rate*dt);r.quaternion.multiply(q).normalize();}
 updateRotors(dt){for(const r of this.rotors){const role=String(r.userData.mechanismRole||'');const rate=role==='vacuum-blower'?8.6:role==='transport-pulley'?6.0:role==='good-return'||role==='bad-return'?5.4:5;this.spin(r,dt,rate);}}
 updateOptics(active){for(const l of this.lights){l.material.emissive?.setHex(active?0xe8f7ff:0x25323a);l.material.emissiveIntensity=active?2.25:.15;}}
 updateSuckers(active){this.feederSuctionActive=active;const pulse=.016*Math.sin(this.elapsed*9);this.suckers.forEach((s,i)=>{s.position.copy(this.suckerRest[i]);if(active)s.position.y-=Math.abs(pulse);});}
 assignInspectionResult(blank,lap){const seq=lap*this.blanks.length+blank.index;blank.result=(seq%6===0)?'REJECT_DEMO':'PASS_DEMO';blank.inspectedLap=lap;blank.decisionSequence=seq;blank.trackingId='SHARK-DEMO-'+String(seq).padStart(5,'0');this.inspectedDemoCount++;}
 outputPreviousResult(blank){if(blank.result==='REJECT_DEMO'){this.rejected++;const m=this.badStack[(this.rejected-1)%this.badStack.length];m.visible=true;m.position.set(3.34,.35+((this.rejected-1)%this.badStack.length)*.007,.62);}else if(blank.result==='PASS_DEMO'){this.completed++;const m=this.goodStack[(this.completed-1)%this.goodStack.length];m.visible=true;m.position.set(3.48,.42+((this.completed-1)%this.goodStack.length)*.007,-.18);}}
 updateBlanks(){
  let scan=0,processing=0,rejectTracked=false,rejectAtGate=false,goodRoute=false,badRoute=false,feed=false;const rejectIds=[],passIds=[];const base=this.elapsed/7.2;
  for(const b of this.blanks){
   const raw=base+b.phase,lap=Math.floor(raw),t=((raw%1)+1)%1;if(lap>b.lap){if(b.lap>=0)this.outputPreviousResult(b);b.lap=lap;b.result=null;b.inspectedLap=-1;}
   if(t<.16)feed=true;if(t>=.31&&t<.57){scan++;if(b.inspectedLap!==lap)this.assignInspectionResult(b,lap);}if(t>=.50&&t<.68&&b.result)processing++;
   b.mesh.visible=this.active;b.mesh.position.copy(this.curve.getPointAt(Math.min(.999,t)));
   if(t>=.70&&b.result){const q=clamp((t-.70)/.18);if(b.result==='REJECT_DEMO'){b.mesh.position.z=THREE.MathUtils.lerp(0,.62,q);rejectTracked=true;badRoute=true;if(b.trackingId)rejectIds.push(b.trackingId);if(t>=.74&&t<.88)rejectAtGate=true;}else{b.mesh.position.z=THREE.MathUtils.lerp(0,-.18,q);goodRoute=true;if(b.trackingId)passIds.push(b.trackingId);}}
   b.mesh.material.emissive?.setHex(t>=.31&&t<.57?0x2f7a9d:b.result==='REJECT_DEMO'&&t>=.60?0x6e2d27:0);b.mesh.material.emissiveIntensity=t>=.31&&t<.57?.78:b.result==='REJECT_DEMO'&&t>=.60?.42:0;
  }
  this.scanActive=scan>0;this.processingActive=processing>0;this.rejectTrackingActive=rejectTracked;this.demoRejectActive=rejectAtGate;this.goodRoutingActive=goodRoute;this.badRoutingActive=badRoute;this.activeRejectTrackingIds=rejectIds;this.activePassTrackingIds=passIds;this.updateOptics(this.scanActive);this.updateSuckers(feed);
  if(this.gate)this.gate.rotation.z=this.gateRest+(rejectAtGate?.40:0);for(const n of this.airNozzles){n.material.emissive?.setHex(0);n.material.emissiveIntensity=0;}
 }
 update(now){if(!this.active||!this.running){this.lastNow=now;return;}if(this.lastNow===null){this.lastNow=now;return;}const dt=Math.min(.12,Math.max(0,(now-this.lastNow)/1000))*this.speed;this.lastNow=now;this.elapsed+=dt;this.updateRotors(dt);this.updateBlanks();this.onUpdate?.(this.state());}
 resetMechanisms(){if(this.gate)this.gate.rotation.z=this.gateRest;this.rotors.forEach((r,i)=>r.quaternion.copy(this.rotorRest[i]));this.suckers.forEach((s,i)=>s.position.copy(this.suckerRest[i]));this.updateOptics(false);for(const n of this.airNozzles){n.material.emissive?.setHex(0);n.material.emissiveIntensity=0;}for(const b of this.blanks){b.mesh.visible=false;b.mesh.material.emissive?.setHex(0);b.mesh.material.emissiveIntensity=0;}this.resetFlags();}
 stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.rejected=0;this.inspectedDemoCount=0;this.resetMechanisms();for(const m of [...this.goodStack,...this.badStack])m.visible=false;this.pathLine.visible=false;this.onUpdate?.(this.state());return this.state();}
 dispose(){this.stop();for(const b of this.blanks){this.root.remove(b.mesh);b.mesh.geometry.dispose();b.mesh.material.dispose();}for(const m of [...this.goodStack,...this.badStack]){this.root.remove(m);m.geometry.dispose();m.material.dispose();}this.root.remove(this.pathLine);this.pathLine.geometry.dispose();this.pathLine.material.dispose();}
}
