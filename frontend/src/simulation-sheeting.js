import * as THREE from 'three';

export const SHEETING_SIMULATION_STAGES=Object.freeze([
  'Rollstand / Unwind','Inclined Guide / Tension','Windowed Main Head / Cut Event','Belt Outfeed / Adjustment','Lift Table / Stacker'
]);
export const SHEETING_PROCESS_STEPS=Object.freeze([
  'Paper reel unwinds from the RIGHT-side low fixed-position rollstand; reel core and opposed hubs rotate together',
  'The continuous web rises through the inclined supported guide/tension roller set and compact EPC reference',
  'The web enters the windowed main head; the photographed banded process cylinder and lower transport rollers rotate while the cross-cut event separates sheets',
  'Only individual cut sheets travel LEFT across the long belt outfeed beneath the static transverse adjustment hardware',
  'Sheets settle inside the stacker tower while the flat lift table and pallet lower to keep the pile top near delivery height'
]);

const LOCAL_Y=new THREE.Vector3(0,1,0);

export class SheetingProcessSimulation{
  constructor(machine,template){
    this.machine=machine;this.template=template;this.group=new THREE.Group();this.group.name='SHEETING-PROCESS-SIMULATION';machine.add(this.group);
    this.active=false;this.running=false;this.speed=1;this.elapsed=0;this.lastNow=null;this.completed=0;this.cutCount=0;this.pathVisible=true;this.inkFlowVisible=false;this.onUpdate=null;
    this.sheets=[];this.pile=[];this.webFlowMarks=[];this.processCycle=4.2;this.cutInterval=.86;this.sheetTravel=3.15;
    this.sheetMaterial=new THREE.MeshStandardMaterial({color:0xf2eddf,roughness:.75,metalness:0,side:THREE.DoubleSide});
    this.flowMaterial=new THREE.MeshStandardMaterial({color:0xd6d1c3,roughness:.68,metalness:0,transparent:true,opacity:.86});
    this.pathMaterial=new THREE.LineBasicMaterial({color:0x2d7771,transparent:true,opacity:.38});
    this.referenceStackMeshes=this.template.meshes.filter(m=>m.userData.referenceStack);
    this.buildPath();this.buildWebFlow();this.buildSheets();this.buildPile();
  }
  buildPath(){
    const pre=[
      new THREE.Vector3(7.18,1.62,0),
      new THREE.Vector3(6.28,1.55,0),
      new THREE.Vector3(6.04,1.53,0),
      new THREE.Vector3(5.68,1.72,0),
      new THREE.Vector3(5.30,1.55,0),
      new THREE.Vector3(4.92,1.22,0),
      new THREE.Vector3(4.20,1.08,0),
      new THREE.Vector3(3.51,1.02,0),
      new THREE.Vector3(3.15,1.14,0),
      new THREE.Vector3(2.72,1.20,0),
      new THREE.Vector3(2.30,.92,0)
    ];
    const post=[
      new THREE.Vector3(2.12,.84,0),
      new THREE.Vector3(1.42,.82,0),
      new THREE.Vector3(.73,.82,0),
      new THREE.Vector3(.08,.82,0),
      new THREE.Vector3(-.82,.82,0),
      new THREE.Vector3(-1.82,.82,0),
      new THREE.Vector3(-2.78,.80,0),
      new THREE.Vector3(-3.34,.78,0),
      new THREE.Vector3(-3.92,.76,0),
      new THREE.Vector3(-4.82,.72,0)
    ];
    this.preCutCurve=new THREE.CatmullRomCurve3(pre,false,'catmullrom',.05);
    this.postCutCurve=new THREE.CatmullRomCurve3(post,false,'catmullrom',.05);
    const pts=[...this.preCutCurve.getPoints(68),...this.postCutCurve.getPoints(64).slice(1)];
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),this.pathMaterial);
    line.name='Sheeting V64 process path';this.group.add(line);this.path=line;
  }
  buildWebFlow(){
    const geo=new THREE.BoxGeometry(.14,.010,1.34);this.webFlowGeometry=geo;
    for(let i=0;i<9;i++){const mark=new THREE.Mesh(geo,this.flowMaterial);mark.visible=false;mark.name='Continuous web motion marker';mark.userData.webMarker=true;this.group.add(mark);this.webFlowMarks.push(mark);}
  }
  buildSheets(){
    const geo=new THREE.BoxGeometry(.74,.016,1.34);this.sheetGeometry=geo;
    for(let i=0;i<9;i++){const mesh=new THREE.Mesh(geo,this.sheetMaterial);mesh.visible=false;mesh.name='Cut sheet downstream of main head';mesh.userData.cutSheet=true;mesh.castShadow=true;mesh.receiveShadow=true;this.group.add(mesh);this.sheets.push(mesh);}
  }
  buildPile(){
    const geo=new THREE.BoxGeometry(1.50,.010,2.04);this.pileGeometry=geo;
    for(let i=0;i<36;i++){const mesh=new THREE.Mesh(geo,this.sheetMaterial);mesh.visible=false;mesh.name='Finished sheet pile';mesh.userData.finishedSheet=true;mesh.position.set(-4.82,.72,0);this.group.add(mesh);this.pile.push(mesh);}
  }
  state(){
    const progress=(this.elapsed/this.processCycle)%1,stageIndex=Math.min(SHEETING_SIMULATION_STAGES.length-1,Math.floor(progress*SHEETING_SIMULATION_STAGES.length));
    return {active:this.active,running:this.running,paused:this.active&&!this.running,speed:this.speed,stage:SHEETING_SIMULATION_STAGES[stageIndex],completed:this.completed,cutCount:this.cutCount,progress,
      sheetsVisible:this.sheets.filter(s=>s.visible).length,webFlowMarksVisible:this.webFlowMarks.filter(s=>s.visible).length,pileSheetsVisible:this.pile.filter(s=>s.visible).length,
      rotorCount:this.template.activeMeshes.length,oscillatorCount:0,mechanismCount:this.template.activeMeshes.length,inkFlowCount:0,uvLampCount:0,uvActive:false,pathVisible:this.pathVisible,inkFlowVisible:false};
  }
  setReferenceStackVisible(v){for(const m of this.referenceStackMeshes)m.visible=!!v;}
  start(){this.active=true;this.running=true;this.lastNow=null;this.group.visible=true;this.setReferenceStackVisible(false);this.onUpdate?.(this.state());return this.state();}
  pause(){this.running=false;return this.state();}
  resume(){this.running=true;this.lastNow=null;return this.state();}
  stop(){this.active=false;this.running=false;this.elapsed=0;this.completed=0;this.cutCount=0;this.lastNow=null;for(const s of this.sheets)s.visible=false;for(const s of this.webFlowMarks)s.visible=false;for(const s of this.pile)s.visible=false;this.restoreMechanisms();this.setReferenceStackVisible(true);this.onUpdate?.(this.state());return this.state();}
  setSpeed(v){this.speed=Math.max(.35,Math.min(2,+v||1));return this.state();}
  setPathVisible(v){this.pathVisible=!!v;this.path.visible=this.pathVisible;return this.state();}
  setInkFlowVisible(){return this.state();}
  restoreMechanisms(){for(const m of this.template.meshes){if(m.userData.restPosition)m.position.copy(m.userData.restPosition);if(m.userData.restRotation)m.rotation.copy(m.userData.restRotation);}}
  spinFromRest(mesh,angle){if(!mesh.userData.restRotation)return;const base=new THREE.Quaternion().setFromEuler(mesh.userData.restRotation),spin=new THREE.Quaternion().setFromAxisAngle(LOCAL_Y,angle);mesh.quaternion.copy(base).multiply(spin);}
  updateMechanisms(){
    const pileCount=Math.min(this.pile.length,this.completed),liftDrop=Math.min(.36,pileCount*.010);
    for(const m of this.template.activeMeshes){
      const motion=m.userData.motion||'';
      if(/reel|chuck|roller/.test(motion)){
        const rate=/reel|chuck/.test(motion)?1.05:motion==='process-roller'?2.25:3.9;
        this.spinFromRest(m,-this.elapsed*rate);
      }
      if(motion==='lift-table')m.position.y=m.userData.restPosition.y-liftDrop;
    }
  }
  updateWebFlow(){
    const flow=(this.elapsed*.34)%1;
    for(const [i,mark] of this.webFlowMarks.entries()){
      const t=(flow+i/this.webFlowMarks.length)%1,p=this.preCutCurve.getPointAt(t),tangent=this.preCutCurve.getTangentAt(t);
      mark.position.copy(p);mark.position.y+=.018;mark.rotation.set(0,-Math.atan2(tangent.z,tangent.x),0);mark.visible=this.active&&this.pathVisible;
    }
  }
  updateSheets(){
    const fleetPeriod=this.cutInterval*this.sheets.length;
    for(const [i,s] of this.sheets.entries()){
      const local=this.elapsed-i*this.cutInterval;
      if(local<0){s.visible=false;continue;}
      const cycleTime=((local%fleetPeriod)+fleetPeriod)%fleetPeriod,t=cycleTime/this.sheetTravel;
      if(t<0||t>=1){s.visible=false;continue;}
      s.visible=this.active;
      const p=this.postCutCurve.getPointAt(t),tangent=this.postCutCurve.getTangentAt(t);
      s.position.copy(p);s.rotation.set(0,-Math.atan2(tangent.z,tangent.x),0);
    }
    const visible=Math.min(this.pile.length,this.completed),topY=.72,thickness=.010;
    for(let i=0;i<this.pile.length;i++){
      const sheet=this.pile[i];sheet.visible=i<visible;
      if(sheet.visible)sheet.position.set(-4.82,topY-(visible-1-i)*thickness,0);
    }
  }
  update(now){
    if(!this.active||!this.running){this.lastNow=now;return;}
    if(this.lastNow==null){this.lastNow=now;return;}
    const dt=Math.min((now-this.lastNow)/1000,.05)*this.speed;this.lastNow=now;this.elapsed+=dt;
    this.cutCount=Math.floor(this.elapsed/this.cutInterval);
    this.completed=Math.max(0,Math.floor((this.elapsed-this.sheetTravel)/this.cutInterval)+1);
    this.updateMechanisms();this.updateWebFlow();this.updateSheets();this.onUpdate?.(this.state());
  }
  dispose(){this.stop();this.sheetGeometry.dispose();this.pileGeometry.dispose();this.webFlowGeometry.dispose();this.sheetMaterial.dispose();this.flowMaterial.dispose();this.path.geometry.dispose();this.pathMaterial.dispose();this.group.removeFromParent();}
}
