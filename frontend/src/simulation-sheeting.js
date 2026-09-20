import * as THREE from 'three';

export const SHEETING_SIMULATION_STAGES=Object.freeze([
  'Unwind / Continuous Web',
  'Guide / Tension',
  'Cross-Cut Event',
  'Fast Tape Separation',
  'Slow Tape / Overlap',
  'Lift Table / Stacker'
]);

export const SHEETING_PROCESS_STEPS=Object.freeze([
  'Continuous web peels from the RIGHT-side reel and remains unbroken through the guide/tension section',
  'The web follows a supported roller path; visual routing is offset around roller surfaces instead of passing through roller centers',
  'A cut event creates one sheet at the cross-cut reference while the upstream web remains continuous',
  'The new sheet accelerates across the fast-tape zone so a visible gap opens behind it',
  'The sheet transfers to the slower tape/overlap zone; reduced downstream spacing visually produces overlap before stacking',
  'The sheet enters the stacker, settles on the pallet/pile, and the lift table lowers only as pile height approaches delivery level'
]);

const LOCAL_Y=new THREE.Vector3(0,1,0);
const clamp01=v=>Math.max(0,Math.min(1,v));

export class SheetingProcessSimulation{
  constructor(machine,template){
    this.machine=machine;this.template=template;
    this.group=new THREE.Group();this.group.name='SHEETING-PROCESS-SIMULATION-V66';machine.add(this.group);

    this.active=false;this.running=false;this.speed=1;this.elapsed=0;this.lastNow=null;
    this.completed=0;this.cutCount=0;this.pathVisible=true;this.inkFlowVisible=false;this.onUpdate=null;

    // Normalized visual process values. They represent process relationships, not engineering speed calibration.
    this.webLinearSpeed=1.58;
    this.cutInterval=.96;
    this.fastDuration=.92;
    this.slowDuration=1.02;
    this.overlapDuration=.86;
    this.landingDuration=.62;
    this.sheetTravel=this.fastDuration+this.slowDuration+this.overlapDuration+this.landingDuration;
    this.processCycle=this.cutInterval*6;

    this.webWidth=2.02;
    this.webThickness=.010;
    this.sheetLength=1.54;
    this.sheetWidth=2.04;
    this.sheetThickness=.012;
    this.pileSheetThickness=.012;
    this.stackX=-4.82;
    this.palletTopY=.585;
    this.targetStackTopY=.72;
    this.maxLiftDrop=.42;

    this.sheets=[];this.pile=[];this.webFlowMarks=[];this.webRibbonSegments=[];

    this.sheetMaterial=new THREE.MeshStandardMaterial({color:0xf2eddf,roughness:.76,metalness:0,side:THREE.DoubleSide});
    this.webMaterial=new THREE.MeshStandardMaterial({color:0xe7e1d3,roughness:.72,metalness:0,side:THREE.DoubleSide});
    this.flowMaterial=new THREE.MeshStandardMaterial({color:0xbcae91,roughness:.62,metalness:0,transparent:true,opacity:.82});
    this.pathMaterial=new THREE.LineBasicMaterial({color:0x2d7771,transparent:true,opacity:.30});
    this.cutMaterial=new THREE.MeshStandardMaterial({color:0xd8f0eb,emissive:0x2fa78f,emissiveIntensity:.55,transparent:true,opacity:.76});

    this.referenceStackMeshes=this.template.meshes.filter(m=>m.userData.referenceStack);

    this.buildPaths();
    this.buildContinuousWeb();
    this.buildFlowMarkers();
    this.buildCutIndicator();
    this.buildSheets();
    this.buildPile();
  }

  buildPaths(){
    // Surface-clearing route: points are intentionally offset from roller centers.
    const pre=[
      new THREE.Vector3(7.18,1.61,0), // reel top
      new THREE.Vector3(6.42,1.62,0),
      new THREE.Vector3(6.04,1.65,0), // over guide roller 1
      new THREE.Vector3(5.68,1.84,0), // over guide roller 2
      new THREE.Vector3(5.30,1.42,0), // under tension roller
      new THREE.Vector3(4.92,1.34,0), // over exit guide
      new THREE.Vector3(4.25,1.18,0),
      new THREE.Vector3(3.51,.90,0),  // under head infeed roller
      new THREE.Vector3(3.15,.88,0),
      new THREE.Vector3(2.72,.89,0),
      new THREE.Vector3(2.36,.88,0),
      new THREE.Vector3(2.12,.88,0)   // cut reference
    ];
    this.preCutCurve=new THREE.CatmullRomCurve3(pre,false,'centripetal',.05);

    const fast=[
      new THREE.Vector3(2.12,.88,0),
      new THREE.Vector3(1.73,.80,0),  // below/through head transfer gap, not roller center
      new THREE.Vector3(1.24,.84,0),
      new THREE.Vector3(.73,.89,0),   // delivery entry roller surface
      new THREE.Vector3(.18,.84,0),
      new THREE.Vector3(-.45,.84,0)
    ];
    const slow=[
      new THREE.Vector3(-.45,.84,0),
      new THREE.Vector3(-.90,.83,0),
      new THREE.Vector3(-1.42,.83,0),
      new THREE.Vector3(-1.95,.83,0)
    ];
    const overlap=[
      new THREE.Vector3(-1.95,.83,0),
      new THREE.Vector3(-2.45,.82,0),
      new THREE.Vector3(-2.95,.82,0),
      new THREE.Vector3(-3.45,.81,0),
      new THREE.Vector3(-3.78,.80,0)
    ];
    const landing=[
      new THREE.Vector3(-3.78,.80,0),
      new THREE.Vector3(-4.05,.79,0),
      new THREE.Vector3(-4.28,.76,0),
      new THREE.Vector3(-4.55,.71,0),
      new THREE.Vector3(this.stackX,this.targetStackTopY,0)
    ];

    this.fastCurve=new THREE.CatmullRomCurve3(fast,false,'centripetal',.05);
    this.slowCurve=new THREE.CatmullRomCurve3(slow,false,'centripetal',.05);
    this.overlapCurve=new THREE.CatmullRomCurve3(overlap,false,'centripetal',.05);
    this.landingCurve=new THREE.CatmullRomCurve3(landing,false,'centripetal',.05);

    const debugPts=[
      ...this.preCutCurve.getPoints(72),
      ...this.fastCurve.getPoints(24).slice(1),
      ...this.slowCurve.getPoints(18).slice(1),
      ...this.overlapCurve.getPoints(26).slice(1),
      ...this.landingCurve.getPoints(20).slice(1)
    ];
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(debugPts),this.pathMaterial);
    line.name='Sheeting V66 process centerline reference';
    line.visible=this.pathVisible;
    this.group.add(line);this.path=line;
  }

  makeRibbonSegment(a,b,index){
    const mid=a.clone().add(b).multiplyScalar(.5);
    const d=b.clone().sub(a),len=Math.max(.02,Math.hypot(d.x,d.y));
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(len+.015,this.webThickness,this.webWidth),this.webMaterial);
    mesh.position.copy(mid);
    mesh.rotation.z=Math.atan2(d.y,d.x);
    mesh.name='Continuous web ribbon '+index;
    mesh.userData={webRibbon:true};
    mesh.castShadow=false;mesh.receiveShadow=true;
    this.group.add(mesh);this.webRibbonSegments.push(mesh);
  }

  buildContinuousWeb(){
    const pts=this.preCutCurve.getPoints(54);
    for(let i=0;i<pts.length-1;i++)this.makeRibbonSegment(pts[i],pts[i+1],i);
    for(const m of this.webRibbonSegments)m.visible=false;
  }

  buildFlowMarkers(){
    const geo=new THREE.BoxGeometry(.055,.016,this.webWidth*1.01);this.webFlowGeometry=geo;
    for(let i=0;i<7;i++){
      const mark=new THREE.Mesh(geo,this.flowMaterial);
      mark.visible=false;mark.name='Web travel stripe';mark.userData.webMarker=true;
      this.group.add(mark);this.webFlowMarks.push(mark);
    }
  }

  buildCutIndicator(){
    const geo=new THREE.BoxGeometry(.055,.055,this.sheetWidth*1.03);this.cutIndicatorGeometry=geo;
    this.cutIndicator=new THREE.Mesh(geo,this.cutMaterial);
    this.cutIndicator.position.set(2.11,.91,0);
    this.cutIndicator.name='Cross-cut event indicator';
    this.cutIndicator.visible=false;
    this.group.add(this.cutIndicator);
  }

  buildSheets(){
    this.sheetGeometry=new THREE.BoxGeometry(this.sheetLength,this.sheetThickness,this.sheetWidth);
    for(let i=0;i<12;i++){
      const mesh=new THREE.Mesh(this.sheetGeometry,this.sheetMaterial);
      mesh.visible=false;mesh.name='Separated cut sheet';
      mesh.userData={cutSheet:true,cutId:0};
      mesh.castShadow=true;mesh.receiveShadow=true;
      this.group.add(mesh);this.sheets.push(mesh);
    }
  }

  buildPile(){
    this.pileGeometry=new THREE.BoxGeometry(this.sheetLength*.985,this.pileSheetThickness,this.sheetWidth*.985);
    for(let i=0;i<48;i++){
      const mesh=new THREE.Mesh(this.pileGeometry,this.sheetMaterial);
      mesh.visible=false;mesh.name='Finished stacked sheet';
      mesh.userData={finishedSheet:true};
      mesh.position.set(this.stackX,this.palletTopY,0);
      mesh.castShadow=false;mesh.receiveShadow=true;
      this.group.add(mesh);this.pile.push(mesh);
    }
  }

  state(){
    const leadAge=this.cutCount>0?Math.max(0,this.elapsed-this.cutCount*this.cutInterval):0;
    let stageIndex=0;
    if(this.cutCount===0)stageIndex=this.elapsed<this.cutInterval*.45?0:1;
    else if(leadAge<.12)stageIndex=2;
    else if(leadAge<this.fastDuration)stageIndex=3;
    else if(leadAge<this.fastDuration+this.slowDuration+this.overlapDuration)stageIndex=4;
    else stageIndex=5;

    return {
      active:this.active,running:this.running,paused:this.active&&!this.running,speed:this.speed,
      stage:SHEETING_SIMULATION_STAGES[stageIndex],completed:this.completed,cutCount:this.cutCount,
      progress:(this.elapsed/this.processCycle)%1,
      sheetsVisible:this.sheets.filter(s=>s.visible).length,
      webFlowMarksVisible:this.webFlowMarks.filter(s=>s.visible).length,
      webRibbonSegmentsVisible:this.webRibbonSegments.filter(s=>s.visible).length,
      pileSheetsVisible:this.pile.filter(s=>s.visible).length,
      rotorCount:this.template.activeMeshes.filter(m=>/reel|chuck|roller/.test(m.userData.motion||'')).length,
      oscillatorCount:0,
      mechanismCount:this.template.activeMeshes.length,
      inkFlowCount:0,uvLampCount:0,uvActive:false,
      pathVisible:this.pathVisible,inkFlowVisible:false,
      transportMode:'FAST_TO_SLOW_TO_OVERLAP',
      cutPulseVisible:this.cutIndicator.visible
    };
  }

  setReferenceStackVisible(v){for(const m of this.referenceStackMeshes)m.visible=!!v;}

  start(){
    this.active=true;this.running=true;this.lastNow=null;this.group.visible=true;
    this.setReferenceStackVisible(false);
    for(const m of this.webRibbonSegments)m.visible=true;
    for(const m of this.webFlowMarks)m.visible=true;
    this.onUpdate?.(this.state());return this.state();
  }
  pause(){this.running=false;return this.state();}
  resume(){this.running=true;this.lastNow=null;return this.state();}
  stop(){
    this.active=false;this.running=false;this.elapsed=0;this.completed=0;this.cutCount=0;this.lastNow=null;
    for(const s of this.sheets)s.visible=false;
    for(const s of this.webFlowMarks)s.visible=false;
    for(const s of this.webRibbonSegments)s.visible=false;
    for(const s of this.pile)s.visible=false;
    this.cutIndicator.visible=false;
    this.restoreMechanisms();this.setReferenceStackVisible(true);
    this.onUpdate?.(this.state());return this.state();
  }
  setSpeed(v){this.speed=Math.max(.35,Math.min(2,+v||1));return this.state();}
  setPathVisible(v){this.pathVisible=!!v;this.path.visible=this.pathVisible;return this.state();}
  setInkFlowVisible(){return this.state();}

  restoreMechanisms(){
    for(const m of this.template.meshes){
      if(m.userData.restPosition)m.position.copy(m.userData.restPosition);
      if(m.userData.restRotation)m.rotation.copy(m.userData.restRotation);
    }
  }

  spinFromRest(mesh,angle){
    if(!mesh.userData.restRotation)return;
    const base=new THREE.Quaternion().setFromEuler(mesh.userData.restRotation);
    const spin=new THREE.Quaternion().setFromAxisAngle(LOCAL_Y,angle);
    mesh.quaternion.copy(base).multiply(spin);
  }

  currentPileMetrics(){
    const visible=Math.min(this.pile.length,this.completed);
    const rawTop=this.palletTopY+visible*this.pileSheetThickness;
    const liftDrop=Math.min(this.maxLiftDrop,Math.max(0,rawTop-this.targetStackTopY));
    const top=Math.min(this.targetStackTopY,rawTop-liftDrop);
    return {visible,liftDrop,top};
  }

  updateMechanisms(){
    const {liftDrop}=this.currentPileMetrics();
    for(const m of this.template.activeMeshes){
      const motion=m.userData.motion||'';
      if(/reel|chuck|roller/.test(motion)){
        let rate=4.6;
        if(/reel|chuck/.test(motion))rate=1.12;
        else if(motion==='process-roller')rate=2.55;
        else if(motion==='delivery-roller')rate=5.35;
        else if(motion==='pull-roller')rate=4.85;
        else if(motion==='tension-roller')rate=4.35;
        this.spinFromRest(m,-this.elapsed*rate);
      }
      if(motion==='lift-table')m.position.y=m.userData.restPosition.y-liftDrop;
    }
  }

  updateWeb(){
    const phase=(this.elapsed*this.webLinearSpeed*.18)%1;
    for(const [i,mark] of this.webFlowMarks.entries()){
      const t=(phase+i/this.webFlowMarks.length)%1;
      const p=this.preCutCurve.getPointAt(t),tangent=this.preCutCurve.getTangentAt(t);
      mark.position.copy(p);mark.position.y+=.016;
      mark.rotation.set(0,0,Math.atan2(tangent.y,tangent.x));
      mark.visible=this.active;
    }
  }

  curvePose(curve,t){
    const p=curve.getPointAt(clamp01(t)),tan=curve.getTangentAt(clamp01(t));
    return {p,tan,angle:Math.atan2(tan.y,tan.x)};
  }

  sheetPoseForAge(age,pileTop){
    if(age<0||age>=this.sheetTravel)return null;
    if(age<this.fastDuration){
      const k=age/this.fastDuration,{p,tan,angle}=this.curvePose(this.fastCurve,k);
      return {p,tan,angle,zone:'FAST'};
    }
    age-=this.fastDuration;
    if(age<this.slowDuration){
      const k=age/this.slowDuration,{p,tan,angle}=this.curvePose(this.slowCurve,k);
      return {p,tan,angle,zone:'SLOW'};
    }
    age-=this.slowDuration;
    if(age<this.overlapDuration){
      const k=age/this.overlapDuration,{p,tan,angle}=this.curvePose(this.overlapCurve,k);
      return {p,tan,angle,zone:'OVERLAP'};
    }
    age-=this.overlapDuration;
    const k=age/this.landingDuration,{p,tan,angle}=this.curvePose(this.landingCurve,k);
    // During landing, blend the final Y to the live pile top so sheets do not teleport.
    if(k>.45){
      const q=clamp01((k-.45)/.55);
      p.y=THREE.MathUtils.lerp(p.y,pileTop+this.pileSheetThickness*.65,q);
    }
    return {p,tan,angle,zone:'LANDING'};
  }

  updateSheets(){
    this.cutCount=Math.floor(this.elapsed/this.cutInterval);
    this.completed=Math.max(0,Math.floor((this.elapsed-this.sheetTravel)/this.cutInterval));
    const pileMetrics=this.currentPileMetrics();

    for(const [slot,s] of this.sheets.entries()){
      const cutId=this.cutCount-slot;
      if(cutId<=0){s.visible=false;continue;}
      const birth=cutId*this.cutInterval;
      const age=this.elapsed-birth;
      const pose=this.sheetPoseForAge(age,pileMetrics.top);
      if(!pose){s.visible=false;continue;}
      s.visible=this.active;s.userData.cutId=cutId;s.userData.transportZone=pose.zone;
      s.position.copy(pose.p);s.rotation.set(0,0,pose.angle);
    }

    const {visible,liftDrop}=pileMetrics;
    for(let i=0;i<this.pile.length;i++){
      const sheet=this.pile[i];sheet.visible=i<visible;
      if(sheet.visible){
        sheet.position.set(
          this.stackX,
          this.palletTopY-liftDrop+(i+.5)*this.pileSheetThickness,
          0
        );
      }
    }

    const phaseSinceCut=this.cutCount>0?this.elapsed-this.cutCount*this.cutInterval:Infinity;
    this.cutIndicator.visible=this.active&&phaseSinceCut>=0&&phaseSinceCut<.115;
    if(this.cutIndicator.visible){
      const pulse=1+Math.sin((phaseSinceCut/.115)*Math.PI)*.45;
      this.cutIndicator.scale.set(pulse,1,pulse);
    }else this.cutIndicator.scale.set(1,1,1);
  }

  update(now){
    if(!this.active||!this.running){this.lastNow=now;return;}
    if(this.lastNow==null){this.lastNow=now;return;}
    const dt=Math.min((now-this.lastNow)/1000,.05)*this.speed;
    this.lastNow=now;this.elapsed+=dt;
    this.updateMechanisms();this.updateWeb();this.updateSheets();
    this.onUpdate?.(this.state());
  }

  dispose(){
    this.stop();
    this.sheetGeometry.dispose();this.pileGeometry.dispose();this.webFlowGeometry.dispose();this.cutIndicatorGeometry.dispose();
    for(const m of this.webRibbonSegments)m.geometry.dispose();
    this.sheetMaterial.dispose();this.webMaterial.dispose();this.flowMaterial.dispose();this.cutMaterial.dispose();
    this.path.geometry.dispose();this.pathMaterial.dispose();this.group.removeFromParent();
  }
}
