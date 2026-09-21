import * as THREE from 'three';
import {OFFSET8_MODULE_SEQUENCE,OFFSET8_CENTERS} from './data/dimensions-offset8.js';

export const OFFSET8_SIMULATION_STAGES=['Preset Plus Feeder','Register',...OFFSET8_MODULE_SEQUENCE.map(m=>m.label),'Gripper-chain Delivery','Dynamic Sheet Brake','Delivery Pile'];
const Y_AXIS=new THREE.Vector3(0,1,0);
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(v,a,b)=>THREE.MathUtils.smoothstep(v,a,b);

function sheetPathPoints(){
 const pts=[new THREE.Vector3(-7.65,1.30,0),new THREE.Vector3(-6.55,1.37,0),new THREE.Vector3(-5.45,1.38,0)];
 for(const m of OFFSET8_MODULE_SEQUENCE){
  const x=OFFSET8_CENTERS[m.key];
  if(m.type==='print'){
   // Impression center (-.10,1.02), r=.27; blanket center (.05,1.51), r=.22.
   // The middle point lies at their tangency region instead of through either cylinder center.
   pts.push(new THREE.Vector3(x-.44,.86,0),new THREE.Vector3(x-.021,1.278,0),new THREE.Vector3(x+.34,.86,0));
  }else if(m.type==='coat'){
   // Coating blanket (.05,1.57,r=.23) against impression (-.08,1.08,r=.27).
   pts.push(new THREE.Vector3(x-.40,.91,0),new THREE.Vector3(x-.011,1.341,0),new THREE.Vector3(x+.38,.93,0));
  }else{
   // Dryer guide plane is represented at y≈1.03; keep stock clear of the cassette bodies.
   pts.push(new THREE.Vector3(x-.42,1.06,0),new THREE.Vector3(x,1.07,0),new THREE.Vector3(x+.42,1.06,0));
  }
 }
 // Preset Plus delivery: gripper-chain elevation -> dynamic sheet brake -> pile surface.
 pts.push(new THREE.Vector3(9.85,1.70,0),new THREE.Vector3(11.55,1.70,0),new THREE.Vector3(12.23,1.24,0),new THREE.Vector3(12.02,1.30,0));
 return pts;
}

export class Offset8PrintingSimulation{
 constructor(root,template){
  this.root=root;this.template=template;this.active=false;this.running=false;this.paused=false;this.speed=1;this.completed=0;this.elapsed=0;this.lastNow=null;
  this.rotors=[];this.emitters=[];this.suckers=[];this.sheets=[];this.stack=[];this.pathVisible=false;this.inkVisible=false;this.onUpdate=null;
  this.coatingActive=false;this.dryerActive=false;this.deliveryBrakeActive=false;this.feederSuctionActive=false;
  root.traverse(o=>{if(o.isMesh&&o.userData.rotor)this.rotors.push(o);if(o.userData.dryerEmitter)this.emitters.push(o);if(o.userData.reciprocator)this.suckers.push(o);});
  this.rotorRest=this.rotors.map(o=>o.quaternion.clone());this.suckerRest=this.suckers.map(o=>o.position.clone());
  this.feederHead=template.findNode('offset8-feeder-head');this.feederHeadRest=this.feederHead?.position.clone()||null;
  this.points=sheetPathPoints();this.curve=new THREE.CatmullRomCurve3(this.points,false,'centripetal',.45);this.pathLength=this.curve.getLength();
  const pathGeo=new THREE.BufferGeometry().setFromPoints(this.curve.getPoints(220)),pathMat=new THREE.LineDashedMaterial({color:0x3f7f9a,dashSize:.08,gapSize:.05,transparent:true,opacity:.55});
  this.pathLine=new THREE.Line(pathGeo,pathMat);this.pathLine.name='OFFSET8-EVIDENCE-BOUNDED-SHEET-PATH';this.pathLine.computeLineDistances();this.pathLine.visible=false;root.add(this.pathLine);
  const mat=new THREE.MeshStandardMaterial({color:0xf5f0dd,roughness:.86,side:THREE.DoubleSide});
  for(let i=0;i<9;i++){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.72,1.04),mat.clone());mesh.rotation.x=-Math.PI/2;mesh.visible=false;mesh.userData.simSheet=true;mesh.userData.printPasses=0;root.add(mesh);this.sheets.push({mesh,phase:i/9,lap:-1});}
  for(let i=0;i<18;i++){const mesh=new THREE.Mesh(new THREE.BoxGeometry(.72,.007,1.04),mat.clone());mesh.visible=false;mesh.userData.deliverySheet=true;root.add(mesh);this.stack.push(mesh);}
 }
 state(){
  const t=this.active?(this.elapsed/15)%1:0,idx=Math.min(OFFSET8_SIMULATION_STAGES.length-1,Math.floor(t*OFFSET8_SIMULATION_STAGES.length));
  return {available:true,blocked:false,active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:OFFSET8_SIMULATION_STAGES[idx],completed:this.completed,progress:t,
   sheetsVisible:this.sheets.filter(s=>s.mesh.visible).length,pileSheetsVisible:this.stack.filter(s=>s.visible).length,rotorCount:this.rotors.length,oscillatorCount:this.suckers.length,
   mechanismCount:this.rotors.length+this.suckers.length+this.emitters.length,inkFlowCount:0,uvLampCount:0,uvActive:false,pathVisible:this.pathVisible,inkFlowVisible:false,
   feederSuctionActive:this.feederSuctionActive,coatingActive:this.coatingActive,dryerActive:this.dryerActive,deliveryBrakeActive:this.deliveryBrakeActive};
 }
 start(){this.active=true;this.running=true;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;for(const s of this.sheets)s.lap=-1;this.resetMechanisms();this.onUpdate?.(this.state());return this.state();}
 pause(){this.running=false;this.paused=this.active;this.onUpdate?.(this.state());return this.state();}
 resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;}this.onUpdate?.(this.state());return this.state();}
 setSpeed(v){this.speed=Math.max(.25,Math.min(4,Number(v)||1));return this.state();}
 setPathVisible(v){this.pathVisible=!!v;this.pathLine.visible=this.pathVisible;return this.state();}
 setInkFlowVisible(){this.inkVisible=false;return this.state();}
 resetMechanisms(){
  this.rotors.forEach((r,i)=>r.quaternion.copy(this.rotorRest[i]));
  this.suckers.forEach((s,i)=>s.position.copy(this.suckerRest[i]));
  if(this.feederHead&&this.feederHeadRest)this.feederHead.position.copy(this.feederHeadRest);
  for(const e of this.emitters){e.material.emissive?.setHex(0);e.material.emissiveIntensity=0;}
  this.feederSuctionActive=this.coatingActive=this.dryerActive=this.deliveryBrakeActive=false;
 }
 spinRotors(dt){
  for(const [i,r] of this.rotors.entries()){
   const role=r.userData.rollerRole||'',dir=r.userData.spinDirection||1;
   const rate=/^(plate|blanket|impression|transfer)$/.test(role)?5.8:/^(chain-sprocket|sheet-brake)$/.test(role)?6.8:/^(anilox|coating-)/.test(role)?5.1:/^(feed-wheel)$/.test(role)?7.2:4.6;
   const q=new THREE.Quaternion().setFromAxisAngle(Y_AXIS,dir*rate*dt);
   r.quaternion.multiply(q).normalize();
  }
 }
 updateFeeder(){
  const cadence=15/this.sheets.length,phase=(this.elapsed%cadence)/cadence,pick=phase<.34;
  this.feederSuctionActive=pick;
  if(this.feederHead&&this.feederHeadRest){
   const lift=Math.sin(Math.PI*clamp(phase/.34))*-.055,advance=phase<.34?smooth(phase,0,.34)*.055:(1-smooth(phase,.34,1))*.055;
   this.feederHead.position.copy(this.feederHeadRest);this.feederHead.position.y+=lift;this.feederHead.position.x+=advance;
  }
  this.suckers.forEach((s,i)=>{s.position.copy(this.suckerRest[i]);if(pick)s.position.y-=.018*Math.sin(Math.PI*clamp(phase/.34));});
 }
 sheetProgress(sheet){return (this.elapsed/15+sheet.phase)%1;}
 updateSheets(){
  let coat=false,dry=false,brake=false;
  const printCenters=OFFSET8_MODULE_SEQUENCE.filter(m=>m.type==='print').map(m=>OFFSET8_CENTERS[m.key]);
  const coatCenters=OFFSET8_MODULE_SEQUENCE.filter(m=>m.type==='coat').map(m=>OFFSET8_CENTERS[m.key]);
  const dryCenters=OFFSET8_MODULE_SEQUENCE.filter(m=>m.type==='dryer').map(m=>OFFSET8_CENTERS[m.key]);
  for(const s of this.sheets){
   const raw=this.elapsed/15+s.phase,t=raw%1,pos=this.curve.getPointAt(t),next=this.curve.getPointAt(Math.min(.9999,t+.0025));
   s.mesh.visible=this.active;s.mesh.position.copy(pos);
   const pitch=-Math.atan2(next.y-pos.y,Math.max(.001,next.x-pos.x));s.mesh.rotation.set(-Math.PI/2,0,pitch);
   const passes=printCenters.filter(x=>pos.x>x+.34).length;s.mesh.userData.printPasses=passes;
   const shade=0xf5f0dd-(Math.min(8,passes)*0x010101);s.mesh.material.color.setHex(shade);
   if(coatCenters.some(x=>Math.abs(pos.x-x)<.55)){coat=true;s.mesh.material.roughness=.70;}
   else s.mesh.material.roughness=.86;
   if(dryCenters.some(x=>Math.abs(pos.x-x)<.58))dry=true;
   if(pos.x>11.72&&pos.x<12.40)brake=true;
   const lap=Math.floor(raw);if(lap>s.lap){if(s.lap>=0){this.completed++;const q=this.stack[(this.completed-1)%this.stack.length];q.visible=true;q.position.set(12.02,1.292+((this.completed-1)%this.stack.length)*.0075,0);}s.lap=lap;}
  }
  this.coatingActive=coat;this.dryerActive=dry;this.deliveryBrakeActive=brake;
  for(const e of this.emitters){const wp=new THREE.Vector3();e.getWorldPosition(wp);const active=this.sheets.some(s=>s.mesh.visible&&Math.abs(s.mesh.position.x-wp.x)<.62);e.material.emissive?.setHex(active?0xff9c32:0x000000);e.material.emissiveIntensity=active?1.6:0;}
 }
 update(now){
  if(!this.active||!this.running){this.lastNow=now;return;}
  if(this.lastNow===null){this.lastNow=now;return;}
  const dt=Math.min(.12,Math.max(0,(now-this.lastNow)/1000))*this.speed;this.lastNow=now;this.elapsed+=dt;
  this.spinRotors(dt);this.updateFeeder();this.updateSheets();this.onUpdate?.(this.state());
 }
 stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;for(const s of this.sheets){s.mesh.visible=false;s.lap=-1;}for(const s of this.stack)s.visible=false;this.pathLine.visible=false;this.resetMechanisms();this.onUpdate?.(this.state());return this.state();}
 dispose(){this.stop();for(const s of this.sheets){this.root.remove(s.mesh);s.mesh.geometry.dispose();s.mesh.material.dispose();}for(const s of this.stack){this.root.remove(s);s.geometry.dispose();s.material.dispose();}this.root.remove(this.pathLine);this.pathLine.geometry.dispose();this.pathLine.material.dispose();}
}
