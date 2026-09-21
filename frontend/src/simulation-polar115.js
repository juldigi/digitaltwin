import * as THREE from 'three';
import {POLAR115_PROCESS} from './data/sources-polar115.js';

export const POLAR115_SIMULATION_STAGES=POLAR115_PROCESS;
const smooth=(v,a,b)=>THREE.MathUtils.smoothstep(v,a,b);

export class Polar115ProcessSimulation{
 constructor(machine,template){
  this.machine=machine;this.template=template;this.group=new THREE.Group();this.group.name='POLAR-115-SAFETY-INTERLOCKED-CUT-CYCLE';machine.add(this.group);
  this.active=false;this.running=false;this.paused=false;this.speed=1;this.elapsed=0;this.lastNow=null;this.completed=0;this.pathVisible=true;this.inkFlowVisible=false;this.onUpdate=null;
  this.cycleSeconds=9;this.cycleIndex=0;this.lightBarrierClear=true;this.twoHandEnabled=true;this.cutCycleLatched=false;this.cutPerformed=false;this.cutCounted=false;this.clampHoldAmount=0;this.knifeHoldAmount=0;
  this.clamp=this.template.findNode('polar-clamp');this.knife=this.template.findNode('polar-knife');this.gauge=this.template.findNode('polar-gauge');
  this.rest={clamp:this.clamp?.position.clone(),knife:this.knife?.position.clone(),gauge:this.gauge?.position.clone()};
  this.stock=null;this.cutPiece=null;this.path=null;this.airIndicators=[];
  this.stockDepth=.68;this.frontPieceDepth=.42;this.rearPieceDepth=.26;this.stockStartCenterZ=-.34;this.stockFinalCenterZ=-.08;this.cutLineZ=0;this.frontPieceCenterZ=-.21;this.rearPieceCenterZ=.13;
  this.clampStroke=.11;this.knifeStroke=.33;this.resetRuntime();this.build();
 }
 build(){
  const mat=new THREE.MeshStandardMaterial({color:0xf0e7d4,roughness:.84,side:THREE.DoubleSide});
  this.stock=new THREE.Mesh(new THREE.BoxGeometry(1.08,.085,this.stockDepth),mat);this.stock.name='Reference paper pile / rear remainder';this.stock.position.set(0,1.005,this.stockStartCenterZ);
  this.cutPiece=new THREE.Mesh(new THREE.BoxGeometry(1.08,.088,this.frontPieceDepth),mat.clone());this.cutPiece.name='Front cut piece / offcut reference';this.cutPiece.position.set(0,1.006,this.frontPieceCenterZ);this.cutPiece.visible=false;
  const points=[new THREE.Vector3(0,1.06,-.74),new THREE.Vector3(0,1.06,-.34),new THREE.Vector3(0,1.06,-.04)];
  const geo=new THREE.BufferGeometry().setFromPoints(points),lineMat=new THREE.LineDashedMaterial({color:0x4e8299,dashSize:.05,gapSize:.035,transparent:true,opacity:.55});
  this.path=new THREE.Line(geo,lineMat);this.path.computeLineDistances();
  for(const x of [-.42,-.14,.14,.42])for(const z of [-.55,-.32,-.09]){const a=new THREE.Mesh(new THREE.CylinderGeometry(.007,.018,.08,10),new THREE.MeshStandardMaterial({color:0x8bbad0,transparent:true,opacity:.55,emissive:0x3d7189,emissiveIntensity:.35}));a.position.set(x,.965,z);a.visible=false;this.group.add(a);this.airIndicators.push(a);}
  this.group.add(this.stock,this.cutPiece,this.path);this.group.visible=false;
 }
 resetRuntime(){
  this.airTableActive=false;this.backgaugeMoving=false;this.twoHandCommand=false;this.clampActive=false;this.clampContact=false;this.knifeDownstroke=false;this.knifeUpstroke=false;this.knifeAtCutLine=false;this.cutSeparated=false;this.safetyBlocked=false;
 }
 phase(){return this.active?(this.elapsed%this.cycleSeconds)/this.cycleSeconds:0;}
 stage(){const p=this.phase();return POLAR115_PROCESS[Math.min(POLAR115_PROCESS.length-1,Math.floor(p*POLAR115_PROCESS.length))];}
 state(){
  return {available:true,blocked:this.safetyBlocked,active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:this.stage(),completed:this.completed,progress:this.phase(),sheetsVisible:this.active?1+(this.cutPiece?.visible?1:0):0,pileSheetsVisible:0,rotorCount:0,oscillatorCount:0,mechanismCount:5,inkFlowCount:0,uvLampCount:0,uvActive:false,pathVisible:this.pathVisible,inkFlowVisible:false,
   airTableActive:this.airTableActive,backgaugeMoving:this.backgaugeMoving,clampActive:this.clampActive,clampContact:this.clampContact,knifeDownstroke:this.knifeDownstroke,knifeUpstroke:this.knifeUpstroke,knifeAtCutLine:this.knifeAtCutLine,cutSeparated:this.cutSeparated,
   interlocks:{lightBarrierClear:this.lightBarrierClear,twoHandCommand:this.twoHandCommand,cutCycleLatched:this.cutCycleLatched,clampContact:this.clampContact,knifeDownPermitted:this.lightBarrierClear&&this.twoHandCommand&&this.cutCycleLatched&&this.clampContact},
   safetyReference:{twoHandSimultaneity:true,antiRepeat:true,lightBarrierStopsClampAndKnife:true},materialSplit:{fullDepth:this.stockDepth,frontDepth:this.frontPieceDepth,rearDepth:this.rearPieceDepth,conserved:Math.abs(this.frontPieceDepth+this.rearPieceDepth-this.stockDepth)<1e-9}
  };
 }
 setLightBarrierClear(v){this.lightBarrierClear=!!v;return this.state();}
 setTwoHandEnabled(v){this.twoHandEnabled=!!v;return this.state();}
 start(){this.active=true;this.running=true;this.paused=false;this.lastNow=null;this.group.visible=true;this.elapsed=0;this.completed=0;this.cycleIndex=0;this.lightBarrierClear=true;this.twoHandEnabled=true;this.resetCycle();this.onUpdate?.(this.state());return this.state();}
 pause(){this.running=false;this.paused=this.active;this.lastNow=null;this.onUpdate?.(this.state());return this.state();}
 resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;}this.onUpdate?.(this.state());return this.state();}
 stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.cycleIndex=0;this.group.visible=false;this.lightBarrierClear=true;this.twoHandEnabled=true;this.resetCycle();this.onUpdate?.(this.state());return this.state();}
 setSpeed(v){this.speed=Math.max(.35,Math.min(2,+v||1));return this.state();}
 setPathVisible(on){this.pathVisible=!!on;if(this.path)this.path.visible=this.pathVisible;return this.state();}
 setInkFlowVisible(){return this.state();}
 resetCycle(){
  this.cutCycleLatched=false;this.cutPerformed=false;this.cutCounted=false;this.clampHoldAmount=0;this.knifeHoldAmount=0;this.resetRuntime();
  if(this.clamp&&this.rest.clamp)this.clamp.position.copy(this.rest.clamp);if(this.knife&&this.rest.knife)this.knife.position.copy(this.rest.knife);if(this.gauge&&this.rest.gauge)this.gauge.position.copy(this.rest.gauge);
  if(this.stock){this.stock.position.set(0,1.005,this.stockStartCenterZ);this.stock.scale.set(1,1,1);this.stock.rotation.set(0,0,0);this.stock.visible=true;}
  if(this.cutPiece){this.cutPiece.position.set(0,1.006,this.frontPieceCenterZ);this.cutPiece.scale.set(1,1,1);this.cutPiece.visible=false;}
  for(const a of this.airIndicators)a.visible=false;
 }
 updateStock(p){
  const advance=smooth(p,.12,.32),air=this.airTableActive,float=air?.006*Math.sin(this.elapsed*5):0;
  if(!this.cutPerformed){
   this.stock.scale.set(1,1,1);this.stock.position.z=THREE.MathUtils.lerp(this.stockStartCenterZ,this.stockFinalCenterZ,advance);this.stock.position.y=1.005+float;this.cutPiece.visible=false;
  }else{
   this.stock.scale.set(1,1,this.rearPieceDepth/this.stockDepth);this.stock.position.set(0,1.005,this.rearPieceCenterZ);
   this.cutPiece.visible=true;const out=smooth(p,.74,.94);this.cutPiece.position.set(0,1.006,THREE.MathUtils.lerp(this.frontPieceCenterZ,-.56,out));
  }
 }
 update(now){
  if(!this.active||!this.running){this.lastNow=now;return;}if(this.lastNow===null){this.lastNow=now;return;}
  const dt=Math.min(.1,Math.max(0,(now-this.lastNow)/1000))*this.speed;this.lastNow=now;this.elapsed+=dt;
  const cycleIndex=Math.floor(this.elapsed/this.cycleSeconds);if(cycleIndex!==this.cycleIndex){this.cycleIndex=cycleIndex;this.resetCycle();}
  const p=this.phase();this.resetRuntime();
  this.airTableActive=p<.34||p>.86;this.backgaugeMoving=p>=.10&&p<.30;this.twoHandCommand=this.twoHandEnabled&&p>=.38&&p<.67;
  if(this.gauge&&this.rest.gauge){this.gauge.position.copy(this.rest.gauge);this.gauge.position.z=this.rest.gauge.z-.26*smooth(p,.10,.28);}
  if(p>=.38&&p<.56&&this.lightBarrierClear&&this.twoHandCommand)this.cutCycleLatched=true;
  const clampDesired=this.cutCycleLatched?smooth(p,.43,.50)*(1-smooth(p,.76,.84)):0;
  if(this.lightBarrierClear||p<.43||p>.84)this.clampHoldAmount=clampDesired;
  this.clampActive=this.clampHoldAmount>.02;this.clampContact=this.clampHoldAmount>.90;
  if(this.clamp&&this.rest.clamp){this.clamp.position.copy(this.rest.clamp);this.clamp.position.y-=this.clampStroke*this.clampHoldAmount;}
  const downWindow=p>=.56&&p<.64,knifePermission=this.lightBarrierClear&&this.twoHandCommand&&this.cutCycleLatched&&this.clampContact;
  if(!this.cutPerformed){
   if(downWindow&&knifePermission)this.knifeHoldAmount=smooth(p,.56,.64);
   this.knifeDownstroke=downWindow&&knifePermission&&this.knifeHoldAmount>0;
   if(this.knifeHoldAmount>.97){this.cutPerformed=true;this.knifeAtCutLine=true;if(!this.cutCounted){this.completed++;this.cutCounted=true;}}
  }
  if(this.cutPerformed){
   if(p>=.64&&p<.74){this.knifeUpstroke=true;this.knifeHoldAmount=1-smooth(p,.64,.74);}
   else if(p>=.74)this.knifeHoldAmount=0;
  }
  if(this.knife&&this.rest.knife){this.knife.position.copy(this.rest.knife);this.knife.position.y-=this.knifeStroke*this.knifeHoldAmount;}
  this.cutSeparated=this.cutPerformed;this.safetyBlocked=p>=.38&&p<.64&&(!this.lightBarrierClear||!this.twoHandEnabled);
  for(const [i,a] of this.airIndicators.entries()){a.visible=this.airTableActive;a.scale.y=.55+.45*Math.sin(this.elapsed*8+i*.6)**2;}
  this.updateStock(p);this.onUpdate?.(this.state());
 }
 dispose(){this.stop();this.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});this.group.removeFromParent();}
}
