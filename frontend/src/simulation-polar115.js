import * as THREE from 'three';
import {POLAR115_PROCESS} from './data/sources-polar115.js';
export const POLAR115_SIMULATION_STAGES=POLAR115_PROCESS;
export class Polar115ProcessSimulation{
 constructor(machine,template){
  this.machine=machine;this.template=template;this.group=new THREE.Group();this.group.name='POLAR-115-CUT-CYCLE';machine.add(this.group);
  this.active=false;this.running=false;this.paused=false;this.speed=1;this.elapsed=0;this.lastNow=null;this.completed=0;this.pathVisible=true;this.inkFlowVisible=false;this.onUpdate=null;
  this.stock=null;this.cutPiece=null;this.path=null;this.airIndicators=[];this.build();
 }
 build(){
  const mat=new THREE.MeshStandardMaterial({color:0xf0e7d4,roughness:.84,side:THREE.DoubleSide});
  this.stock=new THREE.Mesh(new THREE.BoxGeometry(1.08,.085,.68),mat);this.stock.name='Reference paper pile';this.stock.position.set(0,1.005,-.34);
  this.cutPiece=new THREE.Mesh(new THREE.BoxGeometry(1.08,.088,.18),mat.clone());this.cutPiece.name='Cut offcut';this.cutPiece.position.set(0,1.006,-.70);this.cutPiece.visible=false;
  const points=[new THREE.Vector3(0,1.06,-.74),new THREE.Vector3(0,1.06,-.34),new THREE.Vector3(0,1.06,-.04)];
  const geo=new THREE.BufferGeometry().setFromPoints(points),lineMat=new THREE.LineDashedMaterial({color:0x4e8299,dashSize:.05,gapSize:.035,transparent:true,opacity:.55});
  this.path=new THREE.Line(geo,lineMat);this.path.computeLineDistances();
  for(const x of [-.42,-.14,.14,.42])for(const z of [-.55,-.32,-.09]){const a=new THREE.Mesh(new THREE.CylinderGeometry(.007,.018,.08,10),new THREE.MeshStandardMaterial({color:0x8bbad0,transparent:true,opacity:.55,emissive:0x3d7189,emissiveIntensity:.35}));a.position.set(x,.965,z);a.visible=false;this.group.add(a);this.airIndicators.push(a);}
  this.group.add(this.stock,this.cutPiece,this.path);this.group.visible=false;
 }
 phase(){return this.active?(this.elapsed%9)/9:0;}
 state(){
  const p=this.phase(),stage=Math.min(POLAR115_PROCESS.length-1,Math.floor(p*POLAR115_PROCESS.length));
  const lightBarrierClear=true,twoHandCommand=p>=.38&&p<=.72,clampDown=p>=.45&&p<=.80,knifePermitted=lightBarrierClear&&twoHandCommand&&clampDown&&p>=.56&&p<=.70;
  return {available:true,blocked:false,active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:POLAR115_PROCESS[stage],completed:this.completed,progress:p,sheetsVisible:this.active?1:0,pileSheetsVisible:0,rotorCount:0,oscillatorCount:0,mechanismCount:5,inkFlowCount:0,uvLampCount:0,uvActive:false,pathVisible:this.pathVisible,inkFlowVisible:false,
   airTableActive:p<.34||p>.86,backgaugeMoving:p>=.10&&p<.30,clampActive:clampDown,knifeDownstroke:p>=.56&&p<.64,knifeUpstroke:p>=.64&&p<.74,cutSeparated:p>=.64,
   interlocks:{lightBarrierClear,twoHandCommand,clampDown,knifePermitted}};
 }
 start(){this.active=true;this.running=true;this.paused=false;this.lastNow=null;this.group.visible=true;this.elapsed=0;this.completed=0;this.resetMechanisms();this.onUpdate?.(this.state());return this.state();}
 pause(){this.running=false;this.paused=this.active;return this.state();}
 resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;}return this.state();}
 stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;this.group.visible=false;this.resetMechanisms();return this.state();}
 setSpeed(v){this.speed=Math.max(.35,Math.min(2,+v||1));return this.state();}
 setPathVisible(on){this.pathVisible=!!on;if(this.path)this.path.visible=this.pathVisible;return this.state();}
 setInkFlowVisible(){return this.state();}
 resetMechanisms(){
  const clamp=this.template.findNode('polar-clamp'),knife=this.template.findNode('polar-knife'),gauge=this.template.findNode('polar-gauge');
  if(clamp)clamp.position.copy(clamp.userData.rest);if(knife)knife.position.copy(knife.userData.rest);if(gauge)gauge.position.copy(gauge.userData.rest);
  if(this.stock){this.stock.position.set(0,1.005,-.34);this.stock.rotation.set(0,0,0);this.stock.visible=true;}
  if(this.cutPiece){this.cutPiece.position.set(0,1.006,-.70);this.cutPiece.visible=false;}
  for(const a of this.airIndicators)a.visible=false;
 }
 update(now){
  if(!this.active||!this.running){this.lastNow=now;return;}if(this.lastNow===null){this.lastNow=now;return;}
  const dt=Math.min(.1,(now-this.lastNow)/1000)*this.speed;this.lastNow=now;const before=Math.floor(this.elapsed/9);this.elapsed+=dt;if(Math.floor(this.elapsed/9)>before)this.completed++;
  const p=this.phase(),clamp=this.template.findNode('polar-clamp'),knife=this.template.findNode('polar-knife'),gauge=this.template.findNode('polar-gauge');
  this.resetMechanisms();
  const air=p<.34||p>.86;for(const [i,a] of this.airIndicators.entries()){a.visible=air;a.scale.y=.55+.45*Math.sin(this.elapsed*8+i*.6)**2;}
  if(gauge){const move=THREE.MathUtils.smoothstep(p,.10,.28);gauge.position.z=gauge.userData.rest.z-0.26*move;}
  if(this.stock){const advance=THREE.MathUtils.smoothstep(p,.12,.32),float=air?.006*Math.sin(this.elapsed*5):0;this.stock.position.z=-.34+.26*advance;this.stock.position.y=1.005+float;}
  if(clamp&&p>=.43&&p<=.84){const down=THREE.MathUtils.smoothstep(p,.43,.50)*(1-THREE.MathUtils.smoothstep(p,.76,.84));clamp.position.y=clamp.userData.rest.y-.20*down;}
  if(knife&&p>=.55&&p<=.76){const down=THREE.MathUtils.smoothstep(p,.55,.64),up=THREE.MathUtils.smoothstep(p,.64,.76);knife.position.y=knife.userData.rest.y-.48*Math.max(0,down-up);}
  if(this.cutPiece&&p>=.64){this.cutPiece.visible=true;const out=THREE.MathUtils.smoothstep(p,.70,.94);this.cutPiece.position.z=-.70-.22*out;}
  this.onUpdate?.(this.state());
 }
 dispose(){this.stop();this.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});this.group.removeFromParent();}
}
