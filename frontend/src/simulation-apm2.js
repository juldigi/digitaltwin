import * as THREE from 'three';
import {APM2_DIMENSIONS,APM2_PROCESS_SEQUENCE} from './data/dimensions-apm2.js';

const D=APM2_DIMENSIONS.layout;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mod=(v,m)=>((v%m)+m)%m;

export const APM2_SIMULATION_STAGES=Object.freeze([
  'Pile Feeder','Suction Head','Feed Table / Register','Gripper Chain Transport',
  'Flatbed Die-Cutting Platen','Stripping Station','Non-stop Delivery'
]);
export const APM2_PROCESS_STEPS=Object.freeze([
  'Pile lift & sheet separation',
  'Suction head pickup / forwarding',
  'Front lays + SideLay registration',
  'Gripper bar takeover',
  'Flatbed die-cutting impression',
  'Waste stripping',
  'Gripper release & pile delivery'
]);

function pathPoints(){
  return [
    new THREE.Vector3(-2.72,1.42,0),
    new THREE.Vector3(-2.30,1.42,0),
    new THREE.Vector3(-1.82,1.20,0),
    new THREE.Vector3(-1.20,1.12,0),
    new THREE.Vector3(-.72,1.22,0),
    new THREE.Vector3(-.20,1.35,0),
    new THREE.Vector3(.45,1.35,0),
    new THREE.Vector3(.96,1.34,0),
    new THREE.Vector3(1.55,1.36,0),
    new THREE.Vector3(2.02,1.32,0),
    new THREE.Vector3(2.36,1.18,0)
  ];
}
function stageForX(x){
  if(x<-2.35)return 'Pile Feeder';
  if(x<-1.75)return 'Suction Head';
  if(x<-.72)return 'Feed Table / Register';
  if(x<-.38)return 'Gripper Chain Transport';
  if(x<.46)return 'Flatbed Die-Cutting Platen';
  if(x<1.48)return 'Stripping Station';
  return 'Non-stop Delivery';
}
function sheetGeometry(){
  const g=new THREE.PlaneGeometry(.72,1.02,4,6);g.rotateX(-Math.PI/2);return g;
}
export class APM2ProcessSimulation{
  constructor(machine,template){
    this.machine=machine;this.template=template;
    this.group=new THREE.Group();this.group.name='APM2-CONVERTING-SIMULATION';this.group.visible=false;machine.add(this.group);
    this.points=pathPoints();this.curve=new THREE.CatmullRomCurve3(this.points,false,'centripetal',.5);this.pathLength=this.curve.getLength();
    this.sheetGap=.92;this.sheetCount=8;this.cycleDistance=this.pathLength+1.8;
    this.sheets=[];this.pileSheets=[];this.rotors=[];this.oscillators=[];this.materials=[];this.geometries=[];
    this.active=false;this.running=false;this.speed=1;this.elapsed=0;this.lastNow=null;this.completed=0;this.emitAt=0;this.pathVisible=true;this.inkFlowVisible=false;this.baseMetersPerSecond=1.32;this.onUpdate=null;
    this.pileAnchor=new THREE.Vector3(2.36,1.16,0);this.maxPileSheets=28;this.pileThickness=.004;
    this.buildPath();this.buildSheets();this.buildPileSheets();this.collectMotion();this.refreshPile();
  }
  material(params){const m=new THREE.MeshStandardMaterial(params);this.materials.push(m);return m;}
  geometry(g){this.geometries.push(g);return g;}
  buildPath(){
    const pts=[];for(let i=0;i<=180;i++)pts.push(this.curve.getPointAt(i/180));
    const geo=this.geometry(new THREE.BufferGeometry().setFromPoints(pts));
    const mat=new THREE.LineBasicMaterial({color:0x35a5b8,transparent:true,opacity:.38,depthWrite:false});this.materials.push(mat);
    this.pathLine=new THREE.Line(geo,mat);this.group.add(this.pathLine);
  }
  buildSheets(){
    const geo=this.geometry(sheetGeometry());
    for(let i=0;i<this.sheetCount;i++){
      const mat=this.material({color:0xf2ecda,roughness:.9,metalness:0,side:THREE.DoubleSide});
      const mesh=new THREE.Mesh(geo,mat);mesh.visible=false;mesh.frustumCulled=false;this.group.add(mesh);
      const cutMat=this.material({color:0x9b8b6a,roughness:.7,metalness:0});
      const cut=new THREE.LineSegments(
        this.geometry(new THREE.EdgesGeometry(new THREE.BoxGeometry(.56,.006,.78))),
        new THREE.LineBasicMaterial({color:0x6f6658,transparent:true,opacity:.65})
      );this.materials.push(cut.material);cut.visible=false;this.group.add(cut);
      this.sheets.push({mesh,cut,userData:{lastCycle:-1,progress:0,diecut:false}});
    }
  }
  buildPileSheets(){
    const geo=this.geometry(sheetGeometry());
    for(let i=0;i<this.maxPileSheets;i++){
      const mesh=new THREE.Mesh(geo,this.material({color:0xe9e2cc,roughness:.92,metalness:0,side:THREE.DoubleSide}));
      mesh.visible=false;mesh.frustumCulled=false;this.group.add(mesh);this.pileSheets.push({mesh,serial:-1});
    }
  }
  refreshPile(){
    const node=this.template.findNode('apm2-delivery-paper-stack');if(!node)return;
    this.machine.updateMatrixWorld(true);node.updateWorldMatrix(true,true);
    const box=new THREE.Box3().setFromObject(node),p=new THREE.Vector3((box.min.x+box.max.x)/2,box.max.y,(box.min.z+box.max.z)/2);
    this.machine.worldToLocal(p);this.pileAnchor.copy(p);this.pileAnchor.y+=.006;
  }
  layoutPile(){
    const list=this.pileSheets.filter(s=>s.serial>=0).sort((a,b)=>a.serial-b.serial);
    list.forEach((s,rank)=>{s.mesh.position.set(this.pileAnchor.x,this.pileAnchor.y+rank*this.pileThickness,this.pileAnchor.z);s.mesh.rotation.set(0,0,0);s.mesh.visible=true;});
  }
  deposit(sheet,cycle){
    if(sheet.userData.lastCycle===cycle)return;
    sheet.userData.lastCycle=cycle;this.completed++;
    const target=this.pileSheets[(this.completed-1)%this.maxPileSheets];target.serial=this.completed;this.layoutPile();
    sheet.mesh.visible=false;sheet.cut.visible=false;
  }
  collectMotion(){
    const addRotor=(nodeId,axis='z',speed=1)=>{
      const node=this.template.findNode(nodeId);node?.traverse(o=>{if(o.isMesh&&o.geometry?.type==='CylinderGeometry')this.rotors.push({mesh:o,axis,speed,initial:o.quaternion.clone()});});
    };
    addRotor('apm2-feeder-infeed-rollers','z',1.1);
    addRotor('apm2-chain-sprockets','z',.8);
    addRotor('apm2-drive-gears','x',1.0);
    addRotor('apm2-main-motor','x',.7);
    addRotor('apm2-main-shaft','z',.9);
    const suck=this.template.findNode('apm2-feeder-head');if(suck)this.oscillators.push({object:suck,axis:'y',amplitude:.055,speed:6.0,phase:0,initial:suck.position.clone(),kind:'suction'});
    const platen=this.template.findNode('apm2-moving-platen');if(platen)this.oscillators.push({object:platen,axis:'y',amplitude:.085,speed:4.0,phase:0,initial:platen.position.clone(),kind:'platen'});
    const upper=this.template.findNode('apm2-stripping-upper');if(upper)this.oscillators.push({object:upper,axis:'y',amplitude:.055,speed:4.0,phase:Math.PI*.55,initial:upper.position.clone(),kind:'strip'});
    const side=this.template.findNode('apm2-register-sidelay');if(side)this.oscillators.push({object:side,axis:'z',amplitude:.025,speed:4.0,phase:Math.PI*.35,initial:side.position.clone(),kind:'sidelay'});
  }
  updateSheet(sheet,distance){
    if(distance<0||distance>this.pathLength){sheet.mesh.visible=false;sheet.cut.visible=false;return false;}
    const t=clamp(distance/this.pathLength,0,1),p=this.curve.getPointAt(t),tan=this.curve.getTangentAt(t);
    sheet.mesh.position.copy(p);sheet.mesh.position.y+=.015;sheet.mesh.rotation.set(0,Math.atan2(-tan.z,tan.x),0);sheet.mesh.visible=true;
    sheet.userData.progress=t;sheet.userData.diecut=p.x>D.platenCenterX+.18;
    sheet.mesh.material.color.setHex(sheet.userData.diecut?0xe7dfc5:0xf2ecda);
    sheet.cut.position.copy(sheet.mesh.position);sheet.cut.position.y+=.008;sheet.cut.rotation.copy(sheet.mesh.rotation);sheet.cut.visible=sheet.userData.diecut;
    return true;
  }
  state(){
    const moving=this.sheets.filter(s=>s.mesh.visible),lead=[...moving].sort((a,b)=>b.userData.progress-a.userData.progress)[0];
    const x=lead?.mesh.position.x??this.points[0].x;
    return {
      active:this.active,running:this.running,paused:this.active&&!this.running,speed:this.speed,
      stage:stageForX(x),completed:this.completed,progress:lead?.userData.progress||0,
      sheetsVisible:moving.length,pileSheetsVisible:this.pileSheets.filter(s=>s.mesh.visible).length,
      rotorCount:this.rotors.length,oscillatorCount:this.oscillators.length,mechanismCount:this.rotors.length+this.oscillators.length,
      inkFlowCount:0,uvLampCount:0,uvActive:false,foilStarActive:false,pathVisible:this.pathVisible,inkFlowVisible:false
    };
  }
  emit(force=false){const now=performance?.now?.()||Date.now();if(!force&&now<this.emitAt)return;this.emitAt=now+120;this.onUpdate?.(this.state());}
  start(){
    if(!this.active){this.elapsed=0;this.completed=0;for(const p of this.pileSheets){p.mesh.visible=false;p.serial=-1;}for(const s of this.sheets)s.userData.lastCycle=-1;}
    this.refreshPile();this.active=true;this.running=true;this.lastNow=null;this.group.visible=true;this.emit(true);return this.state();
  }
  pause(){if(this.active){this.running=false;this.lastNow=null;this.emit(true);}return this.state();}
  resume(){if(this.active){this.running=true;this.lastNow=null;this.emit(true);}return this.state();}
  stop(){
    this.active=false;this.running=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.group.visible=false;
    for(const s of this.sheets){s.mesh.visible=false;s.cut.visible=false;s.userData.lastCycle=-1;s.userData.diecut=false;}
    for(const p of this.pileSheets){p.mesh.visible=false;p.serial=-1;}
    for(const r of this.rotors)r.mesh.quaternion.copy(r.initial);
    for(const o of this.oscillators)o.object.position.copy(o.initial);
    this.emit(true);return this.state();
  }
  setSpeed(v){this.speed=clamp(Number(v)||1,.35,2);this.emit(true);return this.state();}
  setPathVisible(on){this.pathVisible=!!on;this.pathLine.visible=this.pathVisible;this.emit(true);return this.state();}
  setInkFlowVisible(){this.inkFlowVisible=false;this.emit(true);return this.state();}
  update(now){
    if(!this.active)return;if(!this.running){this.lastNow=now;return;}if(this.lastNow==null){this.lastNow=now;return;}
    const dt=Math.min(Math.max((now-this.lastNow)/1000,0),.05),scaled=dt*this.speed;this.lastNow=now;this.elapsed+=scaled;
    const travelled=this.elapsed*this.baseMetersPerSecond,angular=scaled*5.2;
    for(const r of this.rotors){
      if(r.axis==='x')r.mesh.rotateX(angular*r.speed);else if(r.axis==='y')r.mesh.rotateY(angular*r.speed);else r.mesh.rotateZ(angular*r.speed);
    }
    for(const o of this.oscillators){
      const value=Math.sin(this.elapsed*o.speed+o.phase)*o.amplitude;
      o.object.position.copy(o.initial);o.object.position[o.axis]+=value;
    }
    for(let i=0;i<this.sheets.length;i++){
      const absolute=travelled-i*this.sheetGap;if(absolute<0){this.sheets[i].mesh.visible=false;this.sheets[i].cut.visible=false;continue;}
      const cycle=Math.floor(absolute/this.cycleDistance),local=mod(absolute,this.cycleDistance);
      if(local>this.pathLength){this.deposit(this.sheets[i],cycle);continue;}
      this.updateSheet(this.sheets[i],local);
    }
    this.emit();
  }
  dispose(){
    this.stop();this.group.removeFromParent();for(const g of this.geometries)g.dispose();for(const m of this.materials)m.dispose();
  }
}
