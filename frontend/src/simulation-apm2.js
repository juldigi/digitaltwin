import * as THREE from 'three';
import {APM2_DIMENSIONS} from './data/dimensions-apm2.js';

const D=APM2_DIMENSIONS.layout;
const Y_AXIS=new THREE.Vector3(0,1,0);
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(v,a,b)=>THREE.MathUtils.smoothstep(v,a,b);
const lerp=(a,b,t)=>THREE.MathUtils.lerp(a,b,clamp(t));

export const APM2_SIMULATION_STAGES=Object.freeze([
 'Pile separation / suction pickup',
 'Front lays + SideLay registration',
 'Gripper index to platen',
 'Flatbed die-cut pressure dwell',
 'Gripper index to stripping',
 'Stripping dwell · family reference',
 'Gripper index to delivery',
 'Gripper release / pile formation'
]);
export const APM2_PROCESS_STEPS=Object.freeze([
 'Prepare next sheet while gripper-chain transport is stopped',
 'Register against front lays and operator-side SideLay',
 'Close grippers and index the intermittent chain to the platen station',
 'Stop chain and execute flatbed die-cutting impression',
 'Index sheet to stripping station',
 'Stop chain and execute upper/lower stripping reference cycle',
 'Index sheet to delivery',
 'Open grippers and settle converted sheet on the delivery pile'
]);

function pathPoints(){
 return [
  new THREE.Vector3(-2.72,1.42,0),new THREE.Vector3(-2.30,1.42,0),new THREE.Vector3(-1.82,1.20,0),
  new THREE.Vector3(-1.20,1.12,0),new THREE.Vector3(-.72,1.22,0),new THREE.Vector3(-.20,1.35,0),
  new THREE.Vector3(.45,1.35,0),new THREE.Vector3(.96,1.34,0),new THREE.Vector3(1.55,1.36,0),
  new THREE.Vector3(2.02,1.32,0),new THREE.Vector3(2.36,1.18,0)
 ];
}
function transportProgress(p){
 if(p<.24)return 0;
 if(p<.34)return lerp(0,.36,(p-.24)/.10);
 if(p<.52)return .36;
 if(p<.62)return lerp(.36,.62,(p-.52)/.10);
 if(p<.78)return .62;
 if(p<.94)return lerp(.62,.90,(p-.78)/.16);
 return lerp(.90,1,(p-.94)/.06);
}
function transportIsIndexing(p){return (p>=.24&&p<.34)||(p>=.52&&p<.62)||p>=.78;}
function gripperLoopPosition(t){
 t=((t%1)+1)%1;
 if(t<.46)return {x:lerp(-1.95,2.31,t/.46),y:1.57};
 if(t<.52)return {x:2.31,y:lerp(1.57,1.00,(t-.46)/.06)};
 if(t<.94)return {x:lerp(2.31,-1.95,(t-.52)/.42),y:1.00};
 return {x:-1.95,y:lerp(1.00,1.57,(t-.94)/.06)};
}
function stageIndex(p){return p<.12?0:p<.24?1:p<.34?2:p<.52?3:p<.62?4:p<.78?5:p<.94?6:7;}

export class APM2ProcessSimulation{
 constructor(machine,template){
  this.machine=machine;this.template=template;this.group=new THREE.Group();this.group.name='APM2-INTERMITTENT-CONVERTING-SIMULATION';this.group.visible=false;machine.add(this.group);
  this.points=pathPoints();this.curve=new THREE.CatmullRomCurve3(this.points,false,'centripetal',.5);
  this.active=false;this.running=false;this.paused=false;this.speed=1;this.elapsed=0;this.lastNow=null;this.completed=0;this.onUpdate=null;this.pathVisible=true;this.inkFlowVisible=false;
  this.cycleSeconds=8.4;this.visualTimeScaledDemo=true;this.sheets=[];this.pileSheets=[];this.rotors=[];this.gripperBars=[];this.materials=[];this.geometries=[];
  this.feederHead=template.findNode('apm2-feeder-head');this.sideLay=template.findNode('apm2-register-sidelay');this.platen=template.findNode('apm2-moving-platen');this.stripUpper=template.findNode('apm2-stripping-upper');this.stripLower=template.findNode('apm2-stripping-lower');
  this.rest={head:this.feederHead?.position.clone(),side:this.sideLay?.position.clone(),platen:this.platen?.position.clone(),upper:this.stripUpper?.position.clone(),lower:this.stripLower?.position.clone()};
  machine.traverse(o=>{if(o.isMesh&&o.userData.driveRotor)this.rotors.push(o);if(o.userData.gripperBar)this.gripperBars.push(o);});
  this.rotorRest=this.rotors.map(r=>r.quaternion.clone());this.barRest=this.gripperBars.map(b=>b.position.clone());
  this.pileAnchor=new THREE.Vector3(2.36,1.16,0);this.maxPileSheets=28;this.pileThickness=.004;
  this.buildPath();this.buildSheets();this.buildPileSheets();this.refreshPile();this.resetFlags();
 }
 material(params){const m=new THREE.MeshStandardMaterial(params);this.materials.push(m);return m;}
 geometry(g){this.geometries.push(g);return g;}
 buildPath(){const pts=[];for(let i=0;i<=180;i++)pts.push(this.curve.getPointAt(i/180));const geo=this.geometry(new THREE.BufferGeometry().setFromPoints(pts)),mat=new THREE.LineDashedMaterial({color:0x35a5b8,dashSize:.06,gapSize:.04,transparent:true,opacity:.38,depthWrite:false});this.materials.push(mat);this.pathLine=new THREE.Line(geo,mat);this.pathLine.computeLineDistances();this.pathLine.visible=this.pathVisible;this.group.add(this.pathLine);}
 buildSheets(){
  const geo=this.geometry(new THREE.PlaneGeometry(.72,1.02,4,6));geo.rotateX(-Math.PI/2);
  for(let i=0;i<8;i++){const mat=this.material({color:0xf2ecda,roughness:.9,metalness:0,side:THREE.DoubleSide}),mesh=new THREE.Mesh(geo,mat);mesh.visible=false;mesh.frustumCulled=false;this.group.add(mesh);
   const cut=new THREE.LineSegments(this.geometry(new THREE.EdgesGeometry(new THREE.BoxGeometry(.56,.006,.78))),new THREE.LineBasicMaterial({color:0x6f6658,transparent:true,opacity:.65}));this.materials.push(cut.material);cut.visible=false;this.group.add(cut);
   this.sheets.push({mesh,cut,phase:i/8,lap:-1,diecut:false,stripped:false});
  }
 }
 buildPileSheets(){const geo=this.geometry(new THREE.PlaneGeometry(.72,1.02,4,6));geo.rotateX(-Math.PI/2);for(let i=0;i<this.maxPileSheets;i++){const mesh=new THREE.Mesh(geo,this.material({color:0xe9e2cc,roughness:.92,metalness:0,side:THREE.DoubleSide}));mesh.visible=false;mesh.frustumCulled=false;this.group.add(mesh);this.pileSheets.push({mesh,serial:-1});}}
 refreshPile(){const node=this.template.findNode('apm2-delivery-paper-stack');if(!node)return;this.machine.updateMatrixWorld(true);node.updateWorldMatrix(true,true);const box=new THREE.Box3().setFromObject(node),p=new THREE.Vector3((box.min.x+box.max.x)/2,box.max.y,(box.min.z+box.max.z)/2);this.machine.worldToLocal(p);this.pileAnchor.copy(p);this.pileAnchor.y+=.006;}
 layoutPile(){const list=this.pileSheets.filter(s=>s.serial>=0).sort((a,b)=>a.serial-b.serial);list.forEach((s,rank)=>{s.mesh.position.set(this.pileAnchor.x,this.pileAnchor.y+rank*this.pileThickness,this.pileAnchor.z);s.mesh.rotation.set(0,0,0);s.mesh.visible=true;});}
 deposit(){this.completed++;const target=this.pileSheets[(this.completed-1)%this.maxPileSheets];target.serial=this.completed;this.layoutPile();}
 resetFlags(){this.feederSuctionActive=false;this.registrationActive=false;this.sideLayActive=false;this.transportIndexing=false;this.transportStopped=true;this.platenClosing=false;this.platenClosed=false;this.pressureDwell=false;this.strippingActive=false;this.deliveryReleaseActive=false;}
 state(){
  const p=this.active?(this.elapsed%this.cycleSeconds)/this.cycleSeconds:0;
  return {available:true,blocked:false,active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:APM2_SIMULATION_STAGES[stageIndex(p)],completed:this.completed,progress:p,
   sheetsVisible:this.sheets.filter(s=>s.mesh.visible).length,pileSheetsVisible:this.pileSheets.filter(s=>s.mesh.visible).length,rotorCount:this.rotors.length,oscillatorCount:5,mechanismCount:this.rotors.length+this.gripperBars.length+5,
   inkFlowCount:0,uvLampCount:0,uvActive:false,foilStarActive:false,pathVisible:this.pathVisible,inkFlowVisible:false,visualTimeScaledDemo:true,familyProductionReferenceSph:APM2_DIMENSIONS.familyReference.maxSpeedSph,
   feederSuctionActive:this.feederSuctionActive,registrationActive:this.registrationActive,sideLayActive:this.sideLayActive,transportIndexing:this.transportIndexing,transportStopped:this.transportStopped,
   platenClosing:this.platenClosing,platenClosed:this.platenClosed,pressureDwell:this.pressureDwell,strippingActive:this.strippingActive,deliveryReleaseActive:this.deliveryReleaseActive,
   strippingConfigurationVerified:false,variantSuffix:APM2_DIMENSIONS.familyReference.suffix,
   interlocks:{platenRequiresStoppedTransport:this.platenClosed?!this.transportIndexing:true,strippingRequiresStoppedTransport:this.strippingActive?!this.transportIndexing:true}
  };
 }
 spin(r,dt,rate){const axis=r.userData.mechanismRole==='main-shaft'||r.userData.mechanismRole==='feed-roller'||r.userData.mechanismRole==='chain-sprocket'?Y_AXIS:new THREE.Vector3(1,0,0);const q=new THREE.Quaternion().setFromAxisAngle(axis,rate*dt);r.quaternion.multiply(q).normalize();}
 updateRotors(dt,p,indexing,platenMotion){
  for(const r of this.rotors){const role=String(r.userData.mechanismRole||'');let move=false,rate=4;
   if(role==='main-motor'||role==='flywheel'||role==='main-shaft'||role==='drive-gear'){move=true;rate=5.2;}
   else if(role==='clutch-brake'||role==='chain-sprocket'){move=indexing;rate=5.6;}
   else if(role==='feed-roller'){move=p<.24;rate=5.8;}
   if(move)this.spin(r,dt,rate);
  }
 }
 updateMechanisms(p){
  this.feederSuctionActive=p<.12;this.registrationActive=p>=.12&&p<.24;this.sideLayActive=this.registrationActive;
  this.transportIndexing=transportIsIndexing(p);this.transportStopped=!this.transportIndexing;
  const platenStroke=smooth(p,.34,.40)*(1-smooth(p,.47,.52)),stripStroke=smooth(p,.62,.67)*(1-smooth(p,.73,.78));
  this.platenClosing=p>=.34&&p<.40;this.platenClosed=platenStroke>.90;this.pressureDwell=p>=.40&&p<.47;this.strippingActive=stripStroke>.20;this.deliveryReleaseActive=p>=.94;
  if(this.feederHead&&this.rest.head){this.feederHead.position.copy(this.rest.head);if(this.feederSuctionActive){const q=p/.12;this.feederHead.position.y-=.05*Math.sin(Math.PI*q);this.feederHead.position.x+=.035*Math.sin(Math.PI*q);}}
  if(this.sideLay&&this.rest.side){this.sideLay.position.copy(this.rest.side);if(this.sideLayActive){const q=(p-.12)/.12;this.sideLay.position.z-=.025*Math.sin(Math.PI*clamp(q));}}
  if(this.platen&&this.rest.platen){this.platen.position.copy(this.rest.platen);this.platen.position.y+=.085*platenStroke;}
  if(this.stripUpper&&this.rest.upper){this.stripUpper.position.copy(this.rest.upper);this.stripUpper.position.y-=.055*stripStroke;}
  if(this.stripLower&&this.rest.lower){this.stripLower.position.copy(this.rest.lower);this.stripLower.position.y+=.035*stripStroke;}
 }
 updateGripperBars(globalTransport){for(const bar of this.gripperBars){const q=gripperLoopPosition(globalTransport+(bar.userData.barPhase||0));bar.position.set(q.x-(bar.children[0]?.position.x||0),q.y-(bar.children[0]?.position.y||0),0);}}
 updateSheets(cycleIndex,transport,p){
  const global=cycleIndex+transport;
  for(const s of this.sheets){const raw=global+s.phase,t=((raw%1)+1)%1,lap=Math.floor(raw),pos=this.curve.getPointAt(Math.min(.999,t));s.mesh.visible=this.active;s.mesh.position.copy(pos);s.mesh.position.y+=.015;s.mesh.rotation.set(0,0,0);
   if(this.platenClosed&&Math.abs(pos.x-D.platenCenterX)<.48)s.diecut=true;if(this.strippingActive&&s.diecut&&Math.abs(pos.x-D.strippingCenterX)<.46)s.stripped=true;
   s.mesh.material.color.setHex(s.stripped?0xddd2b4:s.diecut?0xe7dfc5:0xf2ecda);s.cut.position.copy(s.mesh.position);s.cut.position.y+=.008;s.cut.rotation.copy(s.mesh.rotation);s.cut.visible=s.diecut;
   if(lap>s.lap){if(s.lap>=0)this.deposit();s.lap=lap;s.diecut=false;s.stripped=false;}
  }
 }
 start(){if(!this.active){this.elapsed=0;this.completed=0;for(const p of this.pileSheets){p.mesh.visible=false;p.serial=-1;}for(const s of this.sheets){s.lap=-1;s.diecut=false;s.stripped=false;}}this.refreshPile();this.active=true;this.running=true;this.paused=false;this.lastNow=null;this.group.visible=true;this.resetMechanisms();this.onUpdate?.(this.state());return this.state();}
 pause(){if(this.active){this.running=false;this.paused=true;this.lastNow=null;this.onUpdate?.(this.state());}return this.state();}
 resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;this.onUpdate?.(this.state());}return this.state();}
 stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.group.visible=false;this.resetMechanisms();for(const s of this.sheets){s.mesh.visible=false;s.cut.visible=false;s.lap=-1;s.diecut=false;s.stripped=false;}for(const p of this.pileSheets){p.mesh.visible=false;p.serial=-1;}this.onUpdate?.(this.state());return this.state();}
 resetMechanisms(){if(this.feederHead&&this.rest.head)this.feederHead.position.copy(this.rest.head);if(this.sideLay&&this.rest.side)this.sideLay.position.copy(this.rest.side);if(this.platen&&this.rest.platen)this.platen.position.copy(this.rest.platen);if(this.stripUpper&&this.rest.upper)this.stripUpper.position.copy(this.rest.upper);if(this.stripLower&&this.rest.lower)this.stripLower.position.copy(this.rest.lower);this.rotors.forEach((r,i)=>r.quaternion.copy(this.rotorRest[i]));this.gripperBars.forEach((b,i)=>b.position.copy(this.barRest[i]));this.resetFlags();}
 setSpeed(v){this.speed=clamp(Number(v)||1,.35,2);return this.state();}
 setPathVisible(on){this.pathVisible=!!on;this.pathLine.visible=this.pathVisible;return this.state();}
 setInkFlowVisible(){return this.state();}
 update(now){if(!this.active||!this.running){this.lastNow=now;return;}if(this.lastNow==null){this.lastNow=now;return;}const dt=Math.min(Math.max((now-this.lastNow)/1000,0),.05)*this.speed;this.lastNow=now;this.elapsed+=dt;const cycleIndex=Math.floor(this.elapsed/this.cycleSeconds),p=(this.elapsed%this.cycleSeconds)/this.cycleSeconds,transport=transportProgress(p),indexing=transportIsIndexing(p);this.updateMechanisms(p);this.updateRotors(dt,p,indexing,this.platenClosing||this.pressureDwell);this.updateGripperBars(transport);this.updateSheets(cycleIndex,transport,p);this.onUpdate?.(this.state());}
 dispose(){this.stop();this.group.removeFromParent();for(const g of this.geometries)g.dispose();for(const m of this.materials)m.dispose();}
}
