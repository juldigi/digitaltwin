import * as THREE from 'three';
import {POLAR115_PROCESS} from './data/sources-polar115.js';
export const POLAR115_SIMULATION_STAGES=POLAR115_PROCESS;
export class Polar115ProcessSimulation{
 constructor(machine,template){this.machine=machine;this.template=template;this.group=new THREE.Group();this.group.name='POLAR-115-CUT-CYCLE';machine.add(this.group);this.active=false;this.running=false;this.paused=false;this.speed=1;this.elapsed=0;this.lastNow=null;this.completed=0;this.pathVisible=true;this.inkFlowVisible=false;this.onUpdate=null;this.sheet=null;this.cutPiece=null;this.build();}
 build(){const mat=new THREE.MeshStandardMaterial({color:0xf1ead7,roughness:.82,side:THREE.DoubleSide});this.sheet=new THREE.Mesh(new THREE.BoxGeometry(1.55,.025,.88),mat);this.sheet.position.set(0,.945,-.57);this.cutPiece=new THREE.Mesh(new THREE.BoxGeometry(1.55,.027,.24),mat.clone());this.cutPiece.position.set(0,.946,-1.02);this.cutPiece.visible=false;this.group.add(this.sheet,this.cutPiece);}
 state(){const p=this.active?(this.elapsed%8)/8:0,stage=Math.min(POLAR115_PROCESS.length-1,Math.floor(p*POLAR115_PROCESS.length));return {available:true,blocked:false,active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:POLAR115_PROCESS[stage],completed:this.completed,progress:p,sheetsVisible:this.active?1:0,pileSheetsVisible:0,rotorCount:0,oscillatorCount:0,mechanismCount:3,inkFlowCount:0,uvLampCount:0,uvActive:false,pathVisible:this.pathVisible,inkFlowVisible:false,interlocks:{lightBarrierClear:true,twoHandCommand:stage>=3,clampDown:stage>=4&&stage<=6,knifePermitted:stage===5}};}
 start(){this.active=true;this.running=true;this.paused=false;this.lastNow=null;this.group.visible=true;this.onUpdate?.(this.state());return this.state();}pause(){this.running=false;this.paused=this.active;return this.state();}resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;}return this.state();}stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;this.group.visible=false;this.resetMechanisms();return this.state();}setSpeed(v){this.speed=Math.max(.35,Math.min(2,+v||1));return this.state();}setPathVisible(on){this.pathVisible=!!on;this.group.visible=this.active&&this.pathVisible;return this.state();}setInkFlowVisible(){return this.state();}
 resetMechanisms(){const clamp=this.template.findNode('polar-clamp'),knife=this.template.findNode('polar-knife'),gauge=this.template.findNode('polar-gauge');if(clamp)clamp.position.y=clamp.userData.rest.y;if(knife)knife.position.y=knife.userData.rest.y;if(gauge)gauge.position.z=gauge.userData.rest.z;if(this.sheet){this.sheet.position.set(0,.945,-.57);this.sheet.visible=true;}if(this.cutPiece)this.cutPiece.visible=false;}
 update(now){if(!this.active||!this.running){this.lastNow=now;return;}if(this.lastNow===null){this.lastNow=now;return;}const dt=Math.min(.1,(now-this.lastNow)/1000)*this.speed;this.lastNow=now;const before=Math.floor(this.elapsed/8);this.elapsed+=dt;if(Math.floor(this.elapsed/8)>before)this.completed++;const p=(this.elapsed%8)/8,clamp=this.template.findNode('polar-clamp'),knife=this.template.findNode('polar-knife'),gauge=this.template.findNode('polar-gauge');
  this.resetMechanisms();
  if(gauge){const target=.12+.34*Math.sin(Math.min(p/.24,1)*Math.PI/2);gauge.position.z=gauge.userData.rest.z+target;}
  if(this.sheet){const advance=Math.min(p/.28,1);this.sheet.position.z=-.57+.34*advance;}
  if(clamp&&p>.40&&p<.82){const q=p<.52?(p-.40)/.12:p>.72?(.82-p)/.10:1;clamp.position.y=clamp.userData.rest.y-.24*Math.max(0,Math.min(1,q));}
  if(knife&&p>.54&&p<.74){const q=p<.64?(p-.54)/.10:(.74-p)/.10;knife.position.y=knife.userData.rest.y-.62*Math.max(0,Math.min(1,q));}
  if(p>.64){this.cutPiece.visible=true;this.cutPiece.position.z=-1.02-(p-.64)*.34;}
  this.onUpdate?.(this.state());
 }
 dispose(){this.stop();this.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});this.group.removeFromParent();}
}
