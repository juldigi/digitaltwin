import * as THREE from 'three';

export const SHEETING_SIMULATION_STAGES=Object.freeze([
  'Unwind / Continuous Web',
  'Open Roller Bank / Tension',
  'Guarded Cross-Cut Zone',
  'Fast Belt Transport',
  'Slow Belt / Alignment',
  'Open Stack / Lay Table'
]);

export const SHEETING_PROCESS_STEPS=Object.freeze([
  'The active RIGHT-side reel turns while a continuous web peels from the captured two-sided BMJ rollstand',
  'The web travels through the actual open multi-roller bridge; visible guide and nip rollers rotate from web surface speed rather than decorative fixed RPM values',
  'The web enters the enclosed LEXUS cutter cabinet. A cut event is timed from accumulated web travel, but V193 does not expose or animate a fictional blade because the BMJ photos do not reveal the internal cutter mechanism',
  'The separated sheet leaves the cabinet onto the upstream green belt field and opens a controlled gap behind the next sheet',
  'The sheet transfers through the slower open delivery/alignment table with the photo-visible shafts, crossrails, hold-down wheels and manual handwheels',
  'The sheet lands on the open stack/lay table; the flat plate lift reference lowers only as the modeled pile approaches the delivery height'
]);

const LOCAL_Y=new THREE.Vector3(0,1,0);
const clamp01=v=>Math.max(0,Math.min(1,v));

export class SheetingProcessSimulation{
  constructor(machine,template){
    this.machine=machine;this.template=template;
    this.group=new THREE.Group();this.group.name='SHEETING-PROCESS-SIMULATION-V193';machine.add(this.group);

    this.active=false;this.running=false;this.speed=1;this.elapsed=0;this.lastNow=null;
    this.completed=0;this.cutCount=0;this.pathVisible=false;this.inkFlowVisible=false;this.onUpdate=null;

    // These are normalized visual process values, not engineering calibration.
    this.webLinearSpeed=1.46;
    this.targetCutLength=1.54;
    this.cutInterval=this.targetCutLength/this.webLinearSpeed;
    this.webAdvance=0;
    this.cutReleaseDelay=.07;
    this.fastDuration=.86;
    this.slowDuration=.98;
    this.overlapDuration=.88;
    this.landingDuration=.70;
    this.sheetTravel=this.fastDuration+this.slowDuration+this.overlapDuration+this.landingDuration;
    this.processCycle=this.cutInterval*6;

    this.reelReferenceRadius=.82;
    this.reelAngularSpeed=this.webLinearSpeed/this.reelReferenceRadius;
    this.webWidth=2.04;
    this.webThickness=.010;
    this.sheetLength=this.targetCutLength;
    this.sheetWidth=2.06;
    this.sheetThickness=.012;
    this.pileSheetThickness=.012;

    this.cutX=1.25;
    this.cutY=.88;
    this.stackX=-4.90;
    this.palletTopY=.65;
    this.targetStackTopY=.79;
    this.maxLiftDrop=.38;

    this.sheets=[];this.pile=[];this.webFlowMarks=[];this.webRibbonSegments=[];
    this.sheetMaterial=new THREE.MeshStandardMaterial({color:0xf2eddf,roughness:.76,metalness:0,side:THREE.DoubleSide});
    this.webMaterial=new THREE.MeshStandardMaterial({color:0xe7e1d3,roughness:.72,metalness:0,side:THREE.DoubleSide});
    this.flowMaterial=new THREE.MeshStandardMaterial({color:0xbcae91,roughness:.62,metalness:0,transparent:true,opacity:.82});
    this.pathMaterial=new THREE.LineBasicMaterial({color:0x2d7771,transparent:true,opacity:.30});
    this.cutMaterial=new THREE.MeshStandardMaterial({color:0xd8f0eb,emissive:0x2fa78f,emissiveIntensity:.45,transparent:true,opacity:.58});

    this.referenceStackMeshes=this.template.meshes.filter(m=>m.userData.referenceStack);
    this.bladeMeshes=[];

    this.buildPaths();
    this.buildContinuousWeb();
    this.buildFlowMarkers();
    this.buildCutIndicator();
    this.buildSheets();
    this.buildPile();
  }

  buildPaths(){
    // Photo-anchored centerline through the BMJ open roller bank and guarded LEXUS head.
    // Points intentionally alternate above/below roller surfaces to make the web visibly use the roller train.
    const pre=[
      new THREE.Vector3(7.73,1.70,0),
      new THREE.Vector3(6.72,1.68,0),
      new THREE.Vector3(6.25,1.66,0),
      new THREE.Vector3(5.87,2.14,0),
      new THREE.Vector3(5.43,1.60,0),
      new THREE.Vector3(5.01,1.51,0),
      new THREE.Vector3(4.57,2.08,0),
      new THREE.Vector3(4.13,1.40,0),
      new THREE.Vector3(3.77,1.22,0),
      new THREE.Vector3(3.47,1.36,0),
      new THREE.Vector3(3.11,.73,0),
      new THREE.Vector3(2.71,1.18,0),
      new THREE.Vector3(2.20,.76,0),
      new THREE.Vector3(this.cutX,this.cutY,0)
    ];
    this.preCutCurve=new THREE.CatmullRomCurve3(pre,false,'centripetal',.03);

    const fast=[
      new THREE.Vector3(this.cutX,this.cutY,0),
      new THREE.Vector3(.96,.85,0),
      new THREE.Vector3(.58,.84,0),
      new THREE.Vector3(.18,.83,0),
      new THREE.Vector3(-.20,.82,0)
    ];
    const slow=[
      new THREE.Vector3(-.20,.82,0),
      new THREE.Vector3(-.64,.82,0),
      new THREE.Vector3(-1.08,.82,0),
      new THREE.Vector3(-1.56,.81,0),
      new THREE.Vector3(-1.78,.81,0)
    ];
    const overlap=[
      new THREE.Vector3(-1.78,.81,0),
      new THREE.Vector3(-2.20,.80,0),
      new THREE.Vector3(-2.65,.80,0),
      new THREE.Vector3(-3.10,.79,0),
      new THREE.Vector3(-3.55,.78,0)
    ];
    const landing=[
      new THREE.Vector3(-3.55,.78,0),
      new THREE.Vector3(-3.90,.77,0),
      new THREE.Vector3(-4.22,.75,0),
      new THREE.Vector3(-4.55,.72,0),
      new THREE.Vector3(this.stackX,this.targetStackTopY,0)
    ];

    this.fastCurve=new THREE.CatmullRomCurve3(fast,false,'centripetal',.03);
    this.slowCurve=new THREE.CatmullRomCurve3(slow,false,'centripetal',.03);
    this.overlapCurve=new THREE.CatmullRomCurve3(overlap,false,'centripetal',.03);
    this.landingCurve=new THREE.CatmullRomCurve3(landing,false,'centripetal',.03);

    const debugPts=[
      ...this.preCutCurve.getPoints(88),
      ...this.fastCurve.getPoints(24).slice(1),
      ...this.slowCurve.getPoints(20).slice(1),
      ...this.overlapCurve.getPoints(24).slice(1),
      ...this.landingCurve.getPoints(20).slice(1)
    ];
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(debugPts),this.pathMaterial);
    line.name='Sheeting V193 BMJ process centerline';line.visible=this.pathVisible;
    this.group.add(line);this.path=line;
  }

  makeRibbonSegment(a,b,index){
    const mid=a.clone().add(b).multiplyScalar(.5);
    const d=b.clone().sub(a),len=Math.max(.02,Math.hypot(d.x,d.y));
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(len+.012,this.webThickness,this.webWidth),this.webMaterial);
    mesh.position.copy(mid);mesh.rotation.z=Math.atan2(d.y,d.x);
    mesh.name='Continuous web ribbon '+index;mesh.userData={webRibbon:true};
    mesh.castShadow=false;mesh.receiveShadow=true;this.group.add(mesh);this.webRibbonSegments.push(mesh);
  }

  buildContinuousWeb(){
    const pts=this.preCutCurve.getPoints(96);
    for(let i=0;i<pts.length-1;i++)this.makeRibbonSegment(pts[i],pts[i+1],i);
    for(const m of this.webRibbonSegments)m.visible=false;
  }

  buildFlowMarkers(){
    this.webFlowGeometry=new THREE.BoxGeometry(.055,.016,this.webWidth*1.01);
    for(let i=0;i<8;i++){
      const mark=new THREE.Mesh(this.webFlowGeometry,this.flowMaterial);
      mark.visible=false;mark.name='Web travel stripe';mark.userData.webMarker=true;
      this.group.add(mark);this.webFlowMarks.push(mark);
    }
  }

  buildCutIndicator(){
    // Diagnostic event marker lives inside the guarded cabinet. It only becomes visible when cutaway is open.
    this.cutIndicatorGeometry=new THREE.BoxGeometry(.045,.045,this.sheetWidth*1.02);
    this.cutIndicator=new THREE.Mesh(this.cutIndicatorGeometry,this.cutMaterial);
    this.cutIndicator.position.set(this.cutX,this.cutY,0);
    this.cutIndicator.name='Guarded cross-cut event marker';this.cutIndicator.visible=false;
    this.group.add(this.cutIndicator);
  }

  buildSheets(){
    this.sheetGeometry=new THREE.BoxGeometry(this.sheetLength,this.sheetThickness,this.sheetWidth);
    for(let i=0;i<12;i++){
      const mesh=new THREE.Mesh(this.sheetGeometry,this.sheetMaterial);
      mesh.visible=false;mesh.name='Separated cut sheet';mesh.userData={cutSheet:true,cutId:0};
      mesh.castShadow=true;mesh.receiveShadow=true;this.group.add(mesh);this.sheets.push(mesh);
    }
  }

  buildPile(){
    this.pileGeometry=new THREE.BoxGeometry(this.sheetLength*.985,this.pileSheetThickness,this.sheetWidth*.985);
    for(let i=0;i<48;i++){
      const mesh=new THREE.Mesh(this.pileGeometry,this.sheetMaterial);
      mesh.visible=false;mesh.name='Finished stacked sheet';mesh.userData={finishedSheet:true};
      mesh.position.set(this.stackX,this.palletTopY,0);mesh.castShadow=false;mesh.receiveShadow=true;
      this.group.add(mesh);this.pile.push(mesh);
    }
  }

  state(){
    const leadAge=this.cutCount>0?Math.max(0,this.elapsed-this.cutCount*this.cutInterval):0;
    let stageIndex=0;
    if(this.cutCount===0)stageIndex=this.elapsed<this.cutInterval*.48?0:1;
    else if(leadAge<this.cutReleaseDelay+.09)stageIndex=2;
    else if(leadAge<this.fastDuration)stageIndex=3;
    else if(leadAge<this.fastDuration+this.slowDuration+this.overlapDuration)stageIndex=4;
    else stageIndex=5;
    const eventWindow=.14,phaseSinceCut=this.cutCount>0?this.elapsed-this.cutCount*this.cutInterval:Infinity;
    return {
      available:true,blocked:false,active:this.active,running:this.running,paused:this.active&&!this.running,speed:this.speed,
      stage:SHEETING_SIMULATION_STAGES[stageIndex],completed:this.completed,cutCount:this.cutCount,
      progress:(this.elapsed/this.processCycle)%1,
      sheetsVisible:this.sheets.filter(s=>s.visible).length,
      webFlowMarksVisible:this.webFlowMarks.filter(s=>s.visible).length,
      webRibbonSegmentsVisible:this.webRibbonSegments.filter(s=>s.visible).length,
      pileSheetsVisible:this.pile.filter(s=>s.visible).length,
      rotorCount:this.template.activeMeshes.filter(m=>/reel|chuck|roller/.test(m.userData.motion||'')).length,
      oscillatorCount:0,mechanismCount:this.template.activeMeshes.length,
      inkFlowCount:0,uvLampCount:0,uvActive:false,pathVisible:this.pathVisible,inkFlowVisible:false,
      transportMode:'ACTUAL_OPEN_ROLLER_TO_FAST_SLOW_ALIGNMENT_STACK',
      cutPulseVisible:this.active&&phaseSinceCut>=0&&phaseSinceCut<eventWindow,
      bladeVisible:false,bladeCount:0,bladeStroke:0,visibleKnifeGeometry:false,
      cutterMechanismEvidence:'GUARDED_INTERNAL_UNRESOLVED',
      webAdvance:this.webAdvance,targetCutLength:this.targetCutLength,
      drawDrumFunctional:false,drawDrumSurfaceSpeed:0,drawDrumAngularSpeed:0,drawDrumWrapDegrees:0,drawDrumContactPointCount:0,
      drawRollFunctional:true,drawRollSurfaceSpeed:this.webLinearSpeed,
      reelFunctional:true,reelReferenceRadius:this.reelReferenceRadius,reelAngularSpeed:this.reelAngularSpeed,
      reelSurfaceSpeed:this.reelAngularSpeed*this.reelReferenceRadius,
      cutReleaseDelay:this.cutReleaseDelay,
      fastTapeLinearSpeed:this.fastCurve.getLength()/this.fastDuration,
      slowTapeLinearSpeed:this.slowCurve.getLength()/this.slowDuration,
      overlapTapeLinearSpeed:this.overlapCurve.getLength()/this.overlapDuration
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
  pause(){if(this.active){this.running=false;this.lastNow=null;this.onUpdate?.(this.state());}return this.state();}
  resume(){if(this.active){this.running=true;this.lastNow=null;this.onUpdate?.(this.state());}return this.state();}
  stop(){
    this.active=false;this.running=false;this.elapsed=0;this.webAdvance=0;this.completed=0;this.cutCount=0;this.lastNow=null;
    for(const s of this.sheets)s.visible=false;
    for(const s of this.webFlowMarks)s.visible=false;
    for(const s of this.webRibbonSegments)s.visible=false;
    for(const s of this.pile)s.visible=false;
    this.cutIndicator.visible=false;this.restoreMechanisms();this.setReferenceStackVisible(true);
    this.onUpdate?.(this.state());return this.state();
  }
  setSpeed(v){this.speed=Math.max(.35,Math.min(2,+v||1));this.onUpdate?.(this.state());return this.state();}
  setPathVisible(v){this.pathVisible=!!v;this.path.visible=this.pathVisible;this.onUpdate?.(this.state());return this.state();}
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
      if(m.userData.kinematicGroup==='UNWIND_REEL'){
        this.spinFromRest(m,-this.elapsed*this.reelAngularSpeed);
      }else if(m.userData.kinematicGroup==='WEB_CONTACT'){
        const radius=Math.max(.001,m.userData.surfaceRadius||.1);
        this.spinFromRest(m,-this.elapsed*(this.webLinearSpeed/radius));
      }else if(m.userData.kinematicGroup==='CUT_SHEET_TRANSPORT'){
        const radius=Math.max(.001,m.userData.surfaceRadius||.082);
        let linear=this.slowCurve.getLength()/this.slowDuration;
        if(m.userData.transportZone==='FAST')linear=this.fastCurve.getLength()/this.fastDuration;
        else if(m.userData.transportZone==='OVERLAP')linear=this.overlapCurve.getLength()/this.overlapDuration;
        this.spinFromRest(m,-this.elapsed*(linear/radius));
      }else if(/reel|chuck|roller/.test(motion)){
        const radius=Math.max(.001,m.userData.surfaceRadius||.1);
        this.spinFromRest(m,-this.elapsed*(this.webLinearSpeed/radius));
      }
      if(motion==='lift-table')m.position.y=m.userData.restPosition.y-liftDrop;
    }
  }

  updateWeb(){
    this.webAdvance=this.elapsed*this.webLinearSpeed;
    const pathLength=Math.max(.001,this.preCutCurve.getLength());
    const phase=(this.webAdvance/pathLength)%1;
    for(const [i,mark] of this.webFlowMarks.entries()){
      const t=(phase+i/this.webFlowMarks.length)%1;
      const p=this.preCutCurve.getPointAt(t),tangent=this.preCutCurve.getTangentAt(t);
      mark.position.copy(p);mark.position.y+=.016;
      mark.rotation.set(0,0,Math.atan2(tangent.y,tangent.x));mark.visible=this.active;
    }
  }

  curvePose(curve,t){
    const p=curve.getPointAt(clamp01(t)),tan=curve.getTangentAt(clamp01(t));
    return {p,tan,angle:Math.atan2(tan.y,tan.x)};
  }

  sheetPoseForAge(age,pileTop){
    if(age<0||age>=this.sheetTravel)return null;
    if(age<this.fastDuration){
      const {p,tan,angle}=this.curvePose(this.fastCurve,age/this.fastDuration);
      return {p,tan,angle,zone:'FAST'};
    }
    age-=this.fastDuration;
    if(age<this.slowDuration){
      const {p,tan,angle}=this.curvePose(this.slowCurve,age/this.slowDuration);
      return {p,tan,angle,zone:'SLOW'};
    }
    age-=this.slowDuration;
    if(age<this.overlapDuration){
      const k=age/this.overlapDuration,{p,tan,angle}=this.curvePose(this.overlapCurve,k);
      p.y+=.008*(1-k);return {p,tan,angle,zone:'ALIGNMENT'};
    }
    age-=this.overlapDuration;
    const k=age/this.landingDuration;let {p,tan,angle}=this.curvePose(this.landingCurve,k);
    if(k>.35){
      const q=clamp01((k-.35)/.65),smooth=q*q*(3-2*q);
      p.y=THREE.MathUtils.lerp(p.y,pileTop+this.pileSheetThickness*.65,smooth);
      angle=THREE.MathUtils.lerp(angle,0,smooth);
    }
    return {p,tan,angle,zone:'LANDING'};
  }

  updateSheets(){
    this.cutCount=Math.floor(this.webAdvance/this.targetCutLength);
    this.completed=Math.max(0,Math.floor((this.elapsed-this.sheetTravel-this.cutReleaseDelay)/this.cutInterval));
    const pileMetrics=this.currentPileMetrics();

    for(const [slot,s] of this.sheets.entries()){
      const cutId=this.cutCount-slot;
      if(cutId<=0){s.visible=false;continue;}
      const birth=cutId*this.cutInterval+this.cutReleaseDelay;
      const age=this.elapsed-birth,pose=this.sheetPoseForAge(age,pileMetrics.top);
      if(!pose){s.visible=false;continue;}
      s.visible=this.active;s.userData.cutId=cutId;s.userData.transportZone=pose.zone;
      s.position.copy(pose.p);s.rotation.set(0,0,pose.angle);
    }

    const {visible,liftDrop}=pileMetrics;
    for(let i=0;i<this.pile.length;i++){
      const sheet=this.pile[i];sheet.visible=i<visible;
      if(sheet.visible)sheet.position.set(this.stackX,this.palletTopY-liftDrop+(i+.5)*this.pileSheetThickness,0);
    }

    const phaseSinceCut=this.cutCount>0?this.elapsed-this.cutCount*this.cutInterval:Infinity;
    this.cutIndicator.visible=!!this.template.exteriorOpen&&this.active&&phaseSinceCut>=0&&phaseSinceCut<.14;
    if(this.cutIndicator.visible){
      const pulse=1+Math.sin((phaseSinceCut/.14)*Math.PI)*.22;
      this.cutIndicator.scale.set(pulse,1,pulse);
    }else this.cutIndicator.scale.set(1,1,1);
  }

  update(now){
    if(!this.active||!this.running){this.lastNow=now;return;}
    if(this.lastNow==null){this.lastNow=now;return;}
    const dt=Math.min((now-this.lastNow)/1000,.05)*this.speed;
    this.lastNow=now;this.elapsed+=dt;
    this.updateWeb();this.updateSheets();this.updateMechanisms();this.onUpdate?.(this.state());
  }

  dispose(){
    this.stop();
    this.sheetGeometry.dispose();this.pileGeometry.dispose();this.webFlowGeometry.dispose();this.cutIndicatorGeometry.dispose();
    for(const m of this.webRibbonSegments)m.geometry.dispose();
    this.sheetMaterial.dispose();this.webMaterial.dispose();this.flowMaterial.dispose();this.cutMaterial.dispose();
    this.path.geometry.dispose();this.pathMaterial.dispose();this.group.removeFromParent();
  }
}
