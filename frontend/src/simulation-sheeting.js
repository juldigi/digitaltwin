import * as THREE from 'three';

export const SHEETING_SIMULATION_STAGES=Object.freeze([
  'Rollstand / Unwind','Feed & Tension / EPC','Flat-Bed Knife','Sheet Transport','Layboy / Stacker'
]);
export const SHEETING_PROCESS_STEPS=Object.freeze([
  'Paper reel unwinds from the RIGHT-side rollstand',
  'Web passes feed rollers, tension control and EPC',
  'Flat-bed knife cuts the continuous web to sheet length',
  'Cut sheets transfer through delivery rollers',
  'Layboy squares and accumulates sheets on the LEFT-side lift table'
]);

export class SheetingProcessSimulation{
  constructor(machine,template){
    this.machine=machine;this.template=template;this.group=new THREE.Group();this.group.name='SHEETING-PROCESS-SIMULATION';machine.add(this.group);
    this.active=false;this.running=false;this.speed=1;this.elapsed=0;this.lastNow=null;this.completed=0;this.pathVisible=true;this.inkFlowVisible=false;this.onUpdate=null;
    this.sheets=[];this.pile=[];this.cycle=4.2;this.sheetMaterial=new THREE.MeshStandardMaterial({color:0xf2eddf,roughness:.75,metalness:0,side:THREE.DoubleSide});
    this.pathMaterial=new THREE.LineBasicMaterial({color:0x2d7771,transparent:true,opacity:.55});
    this.buildPath();this.buildSheets();this.buildPile();
  }
  buildPath(){
    const pts=[new THREE.Vector3(6.05,1.28,0),new THREE.Vector3(4.75,1.00,0),new THREE.Vector3(2.0,1.00,0),new THREE.Vector3(.35,1.02,0),new THREE.Vector3(-1.3,.90,0),new THREE.Vector3(-3.2,.90,0),new THREE.Vector3(-4.8,.78,0),new THREE.Vector3(-6.38,.66,0)];
    this.curve=new THREE.CatmullRomCurve3(pts,false,'catmullrom',.08);
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(this.curve.getPoints(96)),this.pathMaterial);line.name='Sheeting process path';this.group.add(line);this.path=line;
  }
  buildSheets(){
    const geo=new THREE.BoxGeometry(.72,.018,1.36);
    for(let i=0;i<4;i++){const mesh=new THREE.Mesh(geo,this.sheetMaterial);mesh.visible=false;mesh.userData.offset=i/4;mesh.castShadow=true;mesh.receiveShadow=true;this.group.add(mesh);this.sheets.push(mesh);}
    this.sheetGeometry=geo;
  }
  buildPile(){
    const geo=new THREE.BoxGeometry(1.48,.012,2.00);this.pileGeometry=geo;
    for(let i=0;i<28;i++){const mesh=new THREE.Mesh(geo,this.sheetMaterial);mesh.visible=false;mesh.position.set(-6.38,.66+i*.012,0);this.group.add(mesh);this.pile.push(mesh);}
  }
  state(){
    const progress=(this.elapsed/this.cycle)%1,stageIndex=Math.min(SHEETING_SIMULATION_STAGES.length-1,Math.floor(progress*SHEETING_SIMULATION_STAGES.length));
    return {active:this.active,running:this.running,paused:this.active&&!this.running,speed:this.speed,stage:SHEETING_SIMULATION_STAGES[stageIndex],completed:this.completed,progress,sheetsVisible:this.sheets.filter(s=>s.visible).length,pileSheetsVisible:this.pile.filter(s=>s.visible).length,rotorCount:this.template.activeMeshes.length,oscillatorCount:2,mechanismCount:this.template.activeMeshes.length,inkFlowCount:0,uvLampCount:0,uvActive:false,pathVisible:this.pathVisible,inkFlowVisible:false};
  }
  start(){this.active=true;this.running=true;this.lastNow=null;this.group.visible=true;this.onUpdate?.(this.state());return this.state();}
  pause(){this.running=false;return this.state();}
  resume(){this.running=true;this.lastNow=null;return this.state();}
  stop(){this.active=false;this.running=false;this.elapsed=0;this.completed=0;this.lastNow=null;for(const s of this.sheets)s.visible=false;for(const s of this.pile)s.visible=false;this.restoreMechanisms();this.onUpdate?.(this.state());return this.state();}
  setSpeed(v){this.speed=Math.max(.35,Math.min(2,+v||1));return this.state();}
  setPathVisible(v){this.pathVisible=!!v;this.path.visible=this.pathVisible;return this.state();}
  setInkFlowVisible(){return this.state();}
  restoreMechanisms(){for(const m of this.template.meshes){if(m.userData.restPosition)m.position.copy(m.userData.restPosition);if(m.userData.restRotation)m.rotation.copy(m.userData.restRotation);}}
  updateMechanisms(dt,phase){
    for(const m of this.template.activeMeshes){
      const motion=m.userData.motion||'';
      if(/reel|roller|drive|chuck|accelerator/.test(motion))m.rotation.z-=dt*(motion==='reel'?1.1:3.4);
      if(motion==='knife-beam')m.position.y=m.userData.restPosition.y+Math.max(0,Math.sin(phase*Math.PI*2))*.14;
      if(motion==='knife-blade')m.position.y=m.userData.restPosition.y+Math.max(0,Math.sin(phase*Math.PI*2))*.12;
      if(motion==='lift-table')m.position.y=m.userData.restPosition.y+Math.min(.12,(this.completed%14)*.004);
    }
  }
  updateSheets(progress){
    for(const [i,s] of this.sheets.entries()){
      const t=(progress+i*.25)%1;s.visible=this.active;
      const p=this.curve.getPointAt(t),tangent=this.curve.getTangentAt(t);s.position.copy(p);s.rotation.y=-Math.atan2(tangent.z,tangent.x);
      const afterCut=t>.46;s.scale.x=afterCut?1:.55;s.scale.z=1;
    }
    const visible=Math.min(this.pile.length,this.completed);for(let i=0;i<this.pile.length;i++)this.pile[i].visible=i<visible;
  }
  update(now){
    if(!this.active||!this.running){this.lastNow=now;return;}
    if(this.lastNow==null){this.lastNow=now;return;}
    const dt=Math.min((now-this.lastNow)/1000,.05)*this.speed;this.lastNow=now;
    const before=Math.floor(this.elapsed/this.cycle);this.elapsed+=dt;const after=Math.floor(this.elapsed/this.cycle);if(after>before)this.completed+=(after-before);
    const progress=(this.elapsed/this.cycle)%1;this.updateMechanisms(dt,progress);this.updateSheets(progress);this.onUpdate?.(this.state());
  }
  dispose(){this.stop();this.sheetGeometry.dispose();this.pileGeometry.dispose();this.sheetMaterial.dispose();this.path.geometry.dispose();this.pathMaterial.dispose();this.group.removeFromParent();}
}
