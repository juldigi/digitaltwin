import * as THREE from 'three';
import {OFFSET9_MODULE_SEQUENCE,OFFSET9_CENTERS} from './data/dimensions-offset9.js';

export const OFFSET9_SIMULATION_STAGES=Object.freeze(['Pile separation','Central suction-tape feeder','Front and side register',...OFFSET9_MODULE_SEQUENCE.map(m=>m.label),'Gripper-chain delivery','Delivery sheet guidance · option-bounded','Sheet brake','Delivery pile']);
const Y_AXIS=new THREE.Vector3(0,1,0);
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(v,a,b)=>THREE.MathUtils.smoothstep(v,a,b);
function arcPoints(cx,cy,r,fromDeg,toDeg,steps=12){const pts=[];for(let i=0;i<=steps;i++){const a=THREE.MathUtils.degToRad(fromDeg+(toDeg-fromDeg)*(i/steps));pts.push(new THREE.Vector3(cx+Math.cos(a)*r,cy+Math.sin(a)*r,0));}return pts;}
function appendUnique(dst,points){for(const p of points){const q=dst[dst.length-1];if(!q||q.distanceToSquared(p)>1e-10)dst.push(p);}return dst;}
function polylineCurve(points){const path=new THREE.CurvePath();for(let i=1;i<points.length;i++)path.add(new THREE.LineCurve3(points[i-1],points[i]));return path;}
function sheetPathPoints(){
 const pts=[new THREE.Vector3(-4.22,1.18,0),new THREE.Vector3(-3.10,1.18,0),new THREE.Vector3(-2.39,1.18,0)];
 for(const m of OFFSET9_MODULE_SEQUENCE){
  const x=OFFSET9_CENTERS[m.key];
  if(m.type==='print'){
   // Represented local centers: impression (-.08,.88,r=.215), blanket (.04,1.31,r=.194), transfer (.33,.52,r=.215).
   appendUnique(pts,arcPoints(x-.08,.88,.226,205,20,25));
   appendUnique(pts,arcPoints(x+.33,.52,.226,110,35,11));
  }else{
   // Coating impression (-.08,.91,r=.215) to coating form (.04,1.35,r=.195).
   appendUnique(pts,arcPoints(x-.08,.91,.226,205,20,25));
  }
 }
 appendUnique(pts,[new THREE.Vector3(3.76,1.70,0),new THREE.Vector3(4.62,1.18,0),new THREE.Vector3(5.50,.91,0),new THREE.Vector3(5.39,.99,0)]);
 return pts;
}

export class Offset9PrintingSimulation{
 constructor(root,template){
  this.root=root;this.template=template;this.active=false;this.running=false;this.paused=false;this.speed=1;this.completed=0;this.elapsed=0;this.lastNow=null;
  this.rotors=[];this.nozzles=[];this.feederNozzles=[];this.deliveryNozzles=[];this.coatingElements=[];this.suckers=[];this.deliveryBars=[];this.sheets=[];this.stack=[];this.inkVisible=false;this.pathVisible=false;this.onUpdate=null;
  this.feederSuctionActive=false;this.feederVenturiActive=false;this.coatingActive=false;this.chamberBladeActive=false;this.airGuidanceActive=false;this.deliveryBrakeActive=false;
  root.traverse(o=>{if(o.isMesh&&o.userData.rotor)this.rotors.push(o);if(o.userData.airNozzle){this.nozzles.push(o);(o.userData.feederAirNozzle?this.feederNozzles:this.deliveryNozzles).push(o);}if(/^(doctor-blade-metering-edge|doctor-blade-sealing-edge|coating-chamber-body|chamber-end-seal-reference)$/.test(String(o.userData.mechanismRole||'')))this.coatingElements.push(o);if(o.userData.reciprocator)this.suckers.push(o);if(o.userData.deliveryGripperBar)this.deliveryBars.push(o);});
  this.rotorRest=this.rotors.map(o=>o.quaternion.clone());this.suckerRest=this.suckers.map(o=>o.position.clone());this.deliveryBarRest=this.deliveryBars.map(o=>o.position.clone());
  this.feederHead=template.findNode('offset9-feeder-head');this.feederHeadRest=this.feederHead?.position.clone()||null;this.deliveryGuide=template.findNode('offset9-delivery-guide');this.deliveryVenturiInstalledVerified=this.deliveryGuide?.userData.installedOptionVerified===true;
  this.points=sheetPathPoints();this.curve=polylineCurve(this.points);
  const pathGeo=new THREE.BufferGeometry().setFromPoints(this.curve.getPoints(220)),pathMat=new THREE.LineDashedMaterial({color:0x40899f,dashSize:.055,gapSize:.035,transparent:true,opacity:.58});
  this.pathLine=new THREE.Line(pathGeo,pathMat);this.pathLine.name='OFFSET9-EVIDENCE-BOUNDED-SHEET-PATH';this.pathLine.computeLineDistances();this.pathLine.visible=false;root.add(this.pathLine);
  const material=new THREE.MeshStandardMaterial({color:0xf4efdc,roughness:.88,side:THREE.DoubleSide});
  for(let i=0;i<8;i++){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.37,.52),material.clone());mesh.rotation.x=-Math.PI/2;mesh.visible=false;mesh.userData.simSheet=true;root.add(mesh);this.sheets.push({mesh,phase:i/8,lap:-1});}
  for(let i=0;i<18;i++){const mesh=new THREE.Mesh(new THREE.BoxGeometry(.37,.006,.52),material.clone());mesh.visible=false;root.add(mesh);this.stack.push(mesh);}
 }
 state(){
  const progress=this.active?(this.elapsed/12)%1:0,index=Math.min(OFFSET9_SIMULATION_STAGES.length-1,Math.floor(progress*OFFSET9_SIMULATION_STAGES.length));
  return {available:true,blocked:false,active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:OFFSET9_SIMULATION_STAGES[index],completed:this.completed,progress,
   sheetsVisible:this.sheets.filter(s=>s.mesh.visible).length,pileSheetsVisible:this.stack.filter(s=>s.visible).length,rotorCount:this.rotors.length,oscillatorCount:this.suckers.length,
   mechanismCount:this.rotors.length+this.suckers.length+this.nozzles.length+this.deliveryBars.length+this.coatingElements.length,inkFlowCount:0,uvLampCount:0,uvActive:false,pathVisible:this.pathVisible,inkFlowVisible:false,
   feederSuctionActive:this.feederSuctionActive,feederVenturiActive:this.feederVenturiActive,coatingActive:this.coatingActive,chamberBladeActive:this.chamberBladeActive,airGuidanceActive:this.airGuidanceActive,deliveryVenturiInstalledVerified:this.deliveryVenturiInstalledVerified,deliveryBrakeActive:this.deliveryBrakeActive,deliveryGripperActive:this.active&&this.running,
   simulationBoundary:'SX52_4L_PROCESS__OPTIONS_NOT_INFERRED'};
 }
 start(){this.active=true;this.running=true;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;for(const s of this.sheets)s.lap=-1;this.resetMechanisms();this.onUpdate?.(this.state());return this.state();}
 pause(){this.running=false;this.paused=this.active;this.onUpdate?.(this.state());return this.state();}
 resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;}this.onUpdate?.(this.state());return this.state();}
 setSpeed(value){this.speed=Math.max(.25,Math.min(4,Number(value)||1));return this.state();}
 setPathVisible(value){this.pathVisible=!!value;this.pathLine.visible=this.pathVisible;return this.state();}
 setInkFlowVisible(){this.inkVisible=false;return this.state();}
 resetMechanisms(){
  this.rotors.forEach((r,i)=>r.quaternion.copy(this.rotorRest[i]));this.suckers.forEach((s,i)=>s.position.copy(this.suckerRest[i]));this.deliveryBars.forEach((b,i)=>b.position.copy(this.deliveryBarRest[i]));
  if(this.feederHead&&this.feederHeadRest)this.feederHead.position.copy(this.feederHeadRest);
  for(const n of this.nozzles){n.material.emissive?.setHex(0);n.material.emissiveIntensity=0;}
  for(const e of this.coatingElements){e.material.emissive?.setHex(0);e.material.emissiveIntensity=0;}
  this.feederSuctionActive=this.feederVenturiActive=this.coatingActive=this.chamberBladeActive=this.airGuidanceActive=this.deliveryBrakeActive=false;
 }
 spinRotors(dt){
  for(const r of this.rotors){const role=r.userData.rollerRole||'',dir=r.userData.spinDirection||1,rate=/^(plate|blanket|impression|transfer)$/.test(role)?6.4:/^(chain-sprocket|sheet-brake)$/.test(role)?7.0:/^(suction-belt-wheel)$/.test(role)?7.4:/^(anilox|coating-)/.test(role)?5.2:4.9;const q=new THREE.Quaternion().setFromAxisAngle(Y_AXIS,dir*rate*dt);r.quaternion.multiply(q).normalize();}
 }
 updateFeeder(){
  const cadence=12/this.sheets.length,phase=(this.elapsed%cadence)/cadence,pick=phase<.34,venturi=phase>=.24&&phase<.72;this.feederSuctionActive=pick;this.feederVenturiActive=venturi;
  if(this.feederHead&&this.feederHeadRest){this.feederHead.position.copy(this.feederHeadRest);this.feederHead.position.y-=pick?.045*Math.sin(Math.PI*clamp(phase/.34)):0;this.feederHead.position.x+=phase<.34?smooth(phase,0,.34)*.045:(1-smooth(phase,.34,1))*.045;}
  this.suckers.forEach((s,i)=>{s.position.copy(this.suckerRest[i]);if(pick)s.position.y-=.014*Math.sin(Math.PI*clamp(phase/.34));});
  for(const n of this.feederNozzles){n.material.emissive?.setHex(venturi?0x2fabc3:0);n.material.emissiveIntensity=venturi?1.15:0;}
 }
 updateDeliveryBars(){
  for(const bar of this.deliveryBars){const t=(this.elapsed/2.0+(bar.userData.barPhase||0))%1;let x,y;if(t<.40){const q=t/.40;x=THREE.MathUtils.lerp(-.96,.92,q);y=1.72;}else if(t<.50){const q=(t-.40)/.10;x=.92;y=THREE.MathUtils.lerp(1.72,1.43,q);}else if(t<.90){const q=(t-.50)/.40;x=THREE.MathUtils.lerp(.92,-.96,q);y=1.43;}else{const q=(t-.90)/.10;x=-.96;y=THREE.MathUtils.lerp(1.43,1.72,q);}bar.position.set(x,y,0);}
 }
 updateSheets(){
  let coat=false,air=false,brake=false;const coatX=OFFSET9_CENTERS.L;
  for(const sheet of this.sheets){const raw=this.elapsed/12+sheet.phase,t=raw%1,pos=this.curve.getPointAt(t),next=this.curve.getPointAt(Math.min(.9999,t+.0025));sheet.mesh.visible=this.active;sheet.mesh.position.copy(pos);sheet.mesh.rotation.set(-Math.PI/2,0,-Math.atan2(next.y-pos.y,Math.max(.001,next.x-pos.x)));
   if(Math.abs(pos.x-coatX)<.48){coat=true;sheet.mesh.material.roughness=.70;}else sheet.mesh.material.roughness=.88;
   if(this.deliveryVenturiInstalledVerified&&pos.x>4.05&&pos.x<5.25)air=true;if(pos.x>5.18&&pos.x<5.62)brake=true;
   const lap=Math.floor(raw);if(lap>sheet.lap){if(sheet.lap>=0){this.completed++;const pile=this.stack[(this.completed-1)%this.stack.length];pile.visible=true;pile.position.set(5.39,.985+((this.completed-1)%this.stack.length)*.0065,0);}sheet.lap=lap;}
  }
  this.coatingActive=coat;this.chamberBladeActive=coat;this.airGuidanceActive=air;this.deliveryBrakeActive=brake;
  for(const e of this.coatingElements){e.material.emissive?.setHex(coat?0x365b2f:0);e.material.emissiveIntensity=coat?.48:0;}
  for(const nozzle of this.deliveryNozzles){const world=new THREE.Vector3();nozzle.getWorldPosition(world);const active=this.sheets.some(s=>s.mesh.visible&&Math.abs(s.mesh.position.x-world.x)<.38);nozzle.material.emissive?.setHex(active?0x2fabc3:0);nozzle.material.emissiveIntensity=active?1.25:0;}
 }
 update(now){if(!this.active||!this.running){this.lastNow=now;return;}if(this.lastNow===null){this.lastNow=now;return;}const dt=Math.min(.12,Math.max(0,(now-this.lastNow)/1000))*this.speed;this.lastNow=now;this.elapsed+=dt;this.spinRotors(dt);this.updateFeeder();this.updateDeliveryBars();this.updateSheets();this.onUpdate?.(this.state());}
 stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;for(const s of this.sheets){s.mesh.visible=false;s.lap=-1;}for(const p of this.stack)p.visible=false;this.pathLine.visible=false;this.resetMechanisms();this.onUpdate?.(this.state());return this.state();}
 dispose(){this.stop();for(const s of this.sheets){this.root.remove(s.mesh);s.mesh.geometry.dispose();s.mesh.material.dispose();}for(const p of this.stack){this.root.remove(p);p.geometry.dispose();p.material.dispose();}this.root.remove(this.pathLine);this.pathLine.geometry.dispose();this.pathLine.material.dispose();}
}
