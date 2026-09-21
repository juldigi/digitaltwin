import * as THREE from 'three';

export const DIANA_EYE55_SIMULATION_STAGES=Object.freeze([
 'Blank feed','Suction-belt transport','LED illumination + camera capture','Image processing demo',
 'Tracked pass / reject decision demo','Reject actuation demo','Accepted blank delivery','Output collection'
]);
const Y_AXIS=new THREE.Vector3(0,1,0);
const clamp=v=>Math.max(0,Math.min(1,v));

export class DianaEye55ProcessSimulation{
 constructor(root,template){
  this.root=root;this.template=template;this.active=false;this.running=false;this.paused=false;this.speed=1;this.completed=0;this.rejected=0;this.inspectedDemoCount=0;this.elapsed=0;this.lastNow=null;this.onUpdate=null;
  this.rotors=[];this.lights=[];this.airNozzles=[];this.blanks=[];this.goodStack=[];this.rejectStack=[];this.pathVisible=false;
  this.gate=template.findNode('diana55-reject-gate');this.gateRest=this.gate?.rotation.z||0;
  root.traverse(o=>{if(o.isMesh&&o.userData.rotor)this.rotors.push(o);if(o.isMesh&&o.userData.inspectionLight)this.lights.push(o);if(o.isMesh&&o.userData.rejectAirNozzle)this.airNozzles.push(o);});
  this.rotorRest=this.rotors.map(r=>r.quaternion.clone());
  this.points=[[-3.82,.82,0],[-3.02,.80,0],[-2.10,.80,0],[-.80,.80,0],[.45,.80,0],[1.45,.80,0],[2.42,.80,0],[3.62,.80,0],[4.20,.78,0]].map(p=>new THREE.Vector3(...p));
  this.curve=new THREE.CatmullRomCurve3(this.points,false,'centripetal');
  const pathGeo=new THREE.BufferGeometry().setFromPoints(this.curve.getPoints(220)),pathMat=new THREE.LineDashedMaterial({color:0x527c8a,dashSize:.055,gapSize:.035,transparent:true,opacity:.55});
  this.pathLine=new THREE.Line(pathGeo,pathMat);this.pathLine.computeLineDistances();this.pathLine.visible=false;this.pathLine.name='DIANA55-TRACKED-INSPECTION-PATH';root.add(this.pathLine);
  for(let i=0;i<7;i++){
   const mat=new THREE.MeshStandardMaterial({color:0xe1cca2,roughness:.88,side:THREE.DoubleSide}),mesh=new THREE.Mesh(new THREE.PlaneGeometry(.48,.36),mat);mesh.rotation.x=-Math.PI/2;mesh.visible=false;root.add(mesh);
   this.blanks.push({mesh,index:i,phase:i/7,lap:-1,result:null,inspectedLap:-1,lastT:0});
  }
  for(let i=0;i<18;i++){for(const [arr,z] of [[this.goodStack,0],[this.rejectStack,.62]]){const m=new THREE.Mesh(new THREE.BoxGeometry(.48,.006,.36),new THREE.MeshStandardMaterial({color:0xe1cca2,roughness:.9}));m.visible=false;m.userData.stackZ=z;root.add(m);arr.push(m);}}
  this.resetFlags();this.updateOptics(false);
 }
 resetFlags(){this.scanActive=false;this.imageProcessingActive=false;this.demoRejectActive=false;this.rejectTrackingActive=false;this.acceptedDeliveryActive=false;this.demoRejectOnly=true;this.demoRejectActuator='MECHANICAL_REFERENCE';}
 state(){
  const p=this.active?(this.elapsed/7.8)%1:0,index=Math.min(DIANA_EYE55_SIMULATION_STAGES.length-1,Math.floor(p*DIANA_EYE55_SIMULATION_STAGES.length));
  return {available:true,blocked:false,active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:DIANA_EYE55_SIMULATION_STAGES[index],completed:this.completed,rejectedDemo:this.rejected,inspectedDemoCount:this.inspectedDemoCount,progress:p,
   sheetsVisible:this.blanks.filter(b=>b.mesh.visible).length,pileSheetsVisible:this.goodStack.filter(p=>p.visible).length,rejectSheetsVisible:this.rejectStack.filter(p=>p.visible).length,
   rotorCount:this.rotors.length,mechanismCount:this.rotors.length+this.lights.length+1,pathVisible:this.pathVisible,inkFlowVisible:false,inkFlowCount:0,uvLampCount:0,uvActive:false,
   scanActive:this.scanActive,imageProcessingActive:this.imageProcessingActive,demoRejectActive:this.demoRejectActive,rejectTrackingActive:this.rejectTrackingActive,acceptedDeliveryActive:this.acceptedDeliveryActive,
   demoRejectOnly:true,demoRejectActuator:this.demoRejectActuator,installedRejectActuationVerified:false,installedCameraCountVerified:false,
   trackedResults:{pass:this.blanks.filter(b=>b.result==='PASS_DEMO').length,reject:this.blanks.filter(b=>b.result==='REJECT_DEMO').length,pending:this.blanks.filter(b=>!b.result).length}};
 }
 start(){this.active=true;this.running=true;this.paused=false;this.completed=0;this.rejected=0;this.inspectedDemoCount=0;this.elapsed=0;this.lastNow=null;for(const b of this.blanks){b.lap=-1;b.result=null;b.inspectedLap=-1;b.lastT=0;}this.resetMechanisms();this.onUpdate?.(this.state());return this.state();}
 pause(){this.running=false;this.paused=this.active;this.onUpdate?.(this.state());return this.state();}
 resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;}this.onUpdate?.(this.state());return this.state();}
 setSpeed(v){this.speed=Math.max(.25,Math.min(4,Number(v)||1));return this.state();}
 setPathVisible(v){this.pathVisible=!!v;this.pathLine.visible=this.pathVisible;return this.state();}
 setInkFlowVisible(){return this.state();}
 spin(r,dt,rate){const q=new THREE.Quaternion().setFromAxisAngle(Y_AXIS,(r.userData.spinDirection||1)*rate*dt);r.quaternion.multiply(q).normalize();}
 updateRotors(dt){for(const r of this.rotors){const role=String(r.userData.mechanismRole||'');const rate=role==='vacuum-blower'?8.4:role==='feed-pulley'?6.1:role==='transport-pulley'?5.8:5.2;this.spin(r,dt,rate);}}
 updateOptics(active){for(const l of this.lights){l.material.emissive?.setHex(active?0xfff0b0:0x302d21);l.material.emissiveIntensity=active?2.25:.14;}}
 assignInspectionResult(blank,lap){
  const seq=lap*this.blanks.length+blank.index;blank.result=(seq%5===0)?'REJECT_DEMO':'PASS_DEMO';blank.inspectedLap=lap;this.inspectedDemoCount++;
 }
 outputPreviousResult(blank){
  if(blank.result==='REJECT_DEMO'){this.rejected++;const m=this.rejectStack[(this.rejected-1)%this.rejectStack.length];m.visible=true;m.position.set(3.05,.39+((this.rejected-1)%this.rejectStack.length)*.007,.62);}
  else if(blank.result==='PASS_DEMO'){this.completed++;const m=this.goodStack[(this.completed-1)%this.goodStack.length];m.visible=true;m.position.set(4.20,.48+((this.completed-1)%this.goodStack.length)*.007,0);}
 }
 updateBlanks(){
  let scanCount=0,processCount=0,rejectAtGate=false,trackedReject=false,accepted=false;
  const base=this.elapsed/7.8;
  for(const b of this.blanks){
   const raw=base+b.phase,lap=Math.floor(raw),t=((raw%1)+1)%1;
   if(lap>b.lap){if(b.lap>=0)this.outputPreviousResult(b);b.lap=lap;b.result=null;b.inspectedLap=-1;}
   if(t>=.30&&t<.57){scanCount++;if(b.inspectedLap!==lap)this.assignInspectionResult(b,lap);}
   if(t>=.52&&t<.69&&b.result)processCount++;
   b.mesh.visible=this.active;const p=this.curve.getPointAt(Math.min(.999,t));b.mesh.position.copy(p);
   const reject=b.result==='REJECT_DEMO';
   if(reject&&t>=.69&&t<.90){trackedReject=true;const q=clamp((t-.69)/.18);b.mesh.position.z=THREE.MathUtils.lerp(0,.62,q);if(t>=.73&&t<.88)rejectAtGate=true;}
   else if(b.result==='PASS_DEMO'&&t>=.80)accepted=true;
   b.mesh.material.emissive?.setHex((t>=.30&&t<.57)?0x365e6f:reject&&t>=.60?0x6d2d23:0);b.mesh.material.emissiveIntensity=(t>=.30&&t<.57)?.8:reject&&t>=.60?.45:0;b.lastT=t;
  }
  this.scanActive=scanCount>0;this.imageProcessingActive=processCount>0;this.rejectTrackingActive=trackedReject;this.demoRejectActive=rejectAtGate;this.acceptedDeliveryActive=accepted;
  this.updateOptics(this.scanActive);
  if(this.gate)this.gate.rotation.z=this.gateRest+(rejectAtGate?.42:0);
  for(const n of this.airNozzles){n.material.emissive?.setHex(0x000000);n.material.emissiveIntensity=0;}
 }
 update(now){
  if(!this.active||!this.running){this.lastNow=now;return;}if(this.lastNow===null){this.lastNow=now;return;}
  const dt=Math.min(.12,Math.max(0,(now-this.lastNow)/1000))*this.speed;this.lastNow=now;this.elapsed+=dt;this.updateRotors(dt);this.updateBlanks();this.onUpdate?.(this.state());
 }
 resetMechanisms(){
  if(this.gate)this.gate.rotation.z=this.gateRest;this.rotors.forEach((r,i)=>r.quaternion.copy(this.rotorRest[i]));this.updateOptics(false);for(const n of this.airNozzles){n.material.emissive?.setHex(0);n.material.emissiveIntensity=0;}for(const b of this.blanks){b.mesh.visible=false;b.mesh.material.emissive?.setHex(0);b.mesh.material.emissiveIntensity=0;}this.resetFlags();
 }
 stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.rejected=0;this.inspectedDemoCount=0;this.resetMechanisms();for(const m of [...this.goodStack,...this.rejectStack])m.visible=false;this.pathLine.visible=false;this.onUpdate?.(this.state());return this.state();}
 dispose(){this.stop();for(const b of this.blanks){this.root.remove(b.mesh);b.mesh.geometry.dispose();b.mesh.material.dispose();}for(const m of [...this.goodStack,...this.rejectStack]){this.root.remove(m);m.geometry.dispose();m.material.dispose();}this.root.remove(this.pathLine);this.pathLine.geometry.dispose();this.pathLine.material.dispose();}
}
