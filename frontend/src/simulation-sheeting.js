import * as THREE from 'three';
import {SHEETING_ACTUAL_LAYOUT} from './sheeting.js';

export const SHEETING_SIMULATION_STAGES=Object.freeze([
  'Unwind / Web Tension',
  'Draw Roll / Sheet-Length Feed',
  'Stationary Bed Knife Cross-Cut',
  'High-Speed Take-Away / Gap',
  'Slow-Speed Overlap / Shingling',
  'Stack Entry / Pile'
]);

export const SHEETING_PROCESS_STEPS=Object.freeze([
  'The continuous web unwinds from the loaded RIGHT-side reel and remains one continuous strip while it travels through the low entry roll, deep alternating guide loops and the photo-visible black draw roll',
  'The draw roll meters sheet length continuously. The portion downstream of the knife is still attached to the web and grows from zero to one full cut length before each cross-cut',
  'HSM 56 family literature identifies a Flat Bed Knife. In V196 the guarded cutter is represented, only in cutaway, by a stationary bed knife and a rotary fly-knife/revolver; the fly knife is phase-locked to the measured web length and crosses the bed knife once per sheet',
  'At the cut instant the downstream strip does not appear magically at the knife: it already occupies one full sheet length downstream, with its trailing edge exactly at the cut point. Once detached, high-speed take-away belts accelerate it away from the still-attached next web, opening a real gap',
  'The detached sheet is then decelerated onto the slow-speed delivery. Because slow-tape pitch is shorter than sheet length, successive sheets overlap naturally into a shingled stream rather than moving as equally spaced rigid cards',
  'The overlapped sheets approach the rack-adjusted lay table at reduced speed and settle onto the pile. Manual guides and handwheels stay fixed; only the lift support compensates for pile height'
]);

const LOCAL_Y=new THREE.Vector3(0,1,0);
const TAU=Math.PI*2;
const clamp01=v=>Math.max(0,Math.min(1,v));

export class SheetingProcessSimulation{
  constructor(machine,template){
    this.machine=machine;this.template=template;this.layout=SHEETING_ACTUAL_LAYOUT;
    this.group=new THREE.Group();this.group.name='SHEETING-PROCESS-SIMULATION-V196';machine.add(this.group);

    this.active=false;this.running=false;this.speed=1;this.elapsed=0;this.lastNow=null;
    this.completed=0;this.cutCount=0;this.pathVisible=false;this.inkFlowVisible=false;this.onUpdate=null;

    // V196 uses normalized process speeds, not an engineering calibration of BMJ line speed.
    // Ratios are chosen to reproduce the documented sheeter behavior:
    // web metering -> faster take-away gap -> slower overlap/shingling -> slow stack entry.
    this.webLinearSpeed=1.42;
    this.targetCutLength=1.54;
    this.cutInterval=this.targetCutLength/this.webLinearSpeed;
    this.fastTapeSpeed=1.92;
    this.slowTapeSpeed=.82;
    this.stackApproachSpeed=.44;
    this.fastToSlowDecelTime=.22;
    this.slowToStackDecelTime=.32;
    this.stackSettleDuration=.24;
    this.webAdvance=0;

    this.reelReferenceRadius=this.layout.reel.radius;
    this.reelAngularSpeed=this.webLinearSpeed/this.reelReferenceRadius;
    this.webWidth=this.layout.webWidth;this.webThickness=.010;
    this.sheetLength=this.targetCutLength;this.sheetWidth=this.layout.webWidth;
    this.sheetThickness=.012;this.pileSheetThickness=.012;
    this.cutX=this.layout.cutPoint[0];this.cutY=this.layout.cutPoint[1];
    this.stackX=this.layout.stack.centerX;
    this.palletTopY=.66;this.targetStackTopY=.80;this.maxLiftDrop=.38;

    this.sheets=[];this.pile=[];this.webFlowMarks=[];this.webRibbonSegments=[];this.pendingLeaderSegments=[];
    this.sheetMaterial=new THREE.MeshStandardMaterial({color:0xf2eddf,roughness:.76,metalness:0,side:THREE.DoubleSide});
    this.webMaterial=new THREE.MeshStandardMaterial({color:0xe7e1d3,roughness:.72,metalness:0,side:THREE.DoubleSide});
    this.flowMaterial=new THREE.MeshStandardMaterial({color:0xbcae91,roughness:.62,metalness:0,transparent:true,opacity:.72});
    this.pathMaterial=new THREE.LineBasicMaterial({color:0x2d7771,transparent:true,opacity:.30});
    this.referenceStackMeshes=this.template.meshes.filter(m=>m.userData.referenceStack);

    this.buildPaths();
    this.buildContinuousWeb();
    this.buildPendingLeader();
    this.buildFlowMarkers();
    this.buildSheets();
    this.buildPile();
    this.configureTransportTiming();
  }

  surfacePoint(spec,clearance=.018){
    const [x,y,z]=spec.center,sign=spec.contact==='BOTTOM'?-1:1;
    return new THREE.Vector3(x,y+sign*(spec.radius+clearance),z);
  }

  buildPaths(){
    const reel=this.layout.reel;
    const pre=[new THREE.Vector3(reel.loadedCenter[0]-.46,reel.loadedCenter[1]+reel.radius*.72,0)];

    const low=this.layout.lowEntryRoll,lc=new THREE.Vector3(...low.center),lowR=low.radius+.018;
    this.lowEntryContactPoints=[];
    for(let i=0;i<=16;i++){
      const a=THREE.MathUtils.lerp(THREE.MathUtils.degToRad(-22),THREE.MathUtils.degToRad(-158),i/16);
      const p=new THREE.Vector3(lc.x+Math.cos(a)*lowR,lc.y+Math.sin(a)*lowR,0);
      this.lowEntryContactPoints.push(p);pre.push(p);
    }

    this.guideRollContactPoints=new Map();
    for(const spec of this.layout.feedRollers){
      const cc=new THREE.Vector3(...spec.center),rr=spec.radius+.016;
      const top=spec.contact==='TOP',a0=THREE.MathUtils.degToRad(top?22:-22),a1=THREE.MathUtils.degToRad(top?158:-158);
      const pts=[];
      for(let i=0;i<=12;i++){
        const a=THREE.MathUtils.lerp(a0,a1,i/12);
        const p=new THREE.Vector3(cc.x+Math.cos(a)*rr,cc.y+Math.sin(a)*rr,0);
        pts.push(p);pre.push(p);
      }
      this.guideRollContactPoints.set(spec.id,pts);
    }

    const draw=this.layout.drawRoll,dc=new THREE.Vector3(...draw.center),contactR=draw.radius+.018;
    const arc=[],start=THREE.MathUtils.degToRad(draw.wrapStartDeg),end=THREE.MathUtils.degToRad(draw.wrapEndDeg);
    for(let i=0;i<=30;i++){
      const a=THREE.MathUtils.lerp(start,end,i/30);
      arc.push(new THREE.Vector3(dc.x+Math.cos(a)*contactR,dc.y+Math.sin(a)*contactR,0));
    }
    this.drawRollCenter=new THREE.Vector2(dc.x,dc.y);
    this.drawRollRadius=draw.radius;this.webContactRadius=contactR;
    this.drawRollWrapAngle=Math.abs(end-start);this.drawRollContactPoints=arc.map(p=>p.clone());
    pre.push(...arc,new THREE.Vector3(this.cutX,this.cutY,0));
    this.preCutCurve=new THREE.CatmullRomCurve3(pre,false,'centripetal',.02);

    // A single continuous delivery centerline is used for detached sheets.
    // Sheet center starts at sheetLength/2 at the cut instant, so its trailing edge is at the knife.
    const out=[
      new THREE.Vector3(this.cutX,this.cutY,0),
      new THREE.Vector3(1.08,.855,0),
      new THREE.Vector3(.55,.85,0),
      new THREE.Vector3(0,.845,0),
      new THREE.Vector3(-.62,.84,0),
      new THREE.Vector3(-1.20,.835,0),
      new THREE.Vector3(-1.82,.830,0),
      new THREE.Vector3(-2.45,.825,0),
      new THREE.Vector3(-3.05,.820,0),
      new THREE.Vector3(-3.65,.812,0),
      new THREE.Vector3(-4.25,.802,0),
      new THREE.Vector3(-4.72,.792,0),
      new THREE.Vector3(-5.12,.782,0),
      new THREE.Vector3(-5.46,.775,0),
      new THREE.Vector3(this.stackX,.780,0)
    ];
    this.outputCurve=new THREE.CatmullRomCurve3(out,false,'centripetal',.02);
    this.outputLength=this.outputCurve.getLength();

    const pts=[...this.preCutCurve.getPoints(150),...this.outputCurve.getPoints(120).slice(1)];
    this.path=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),this.pathMaterial);
    this.path.name='Sheeting V196 web + detached-sheet process centerline';this.path.visible=this.pathVisible;this.group.add(this.path);
  }

  distanceAtNearestX(x){
    let bestS=0,best=Infinity;
    for(let i=0;i<=1000;i++){
      const u=i/1000,p=this.outputCurve.getPointAt(u),d=Math.abs(p.x-x);
      if(d<best){best=d;bestS=u*this.outputLength;}
    }
    return bestS;
  }

  configureTransportTiming(){
    this.sheetCenterStartS=this.sheetLength/2;
    this.fastZoneEndS=this.distanceAtNearestX(-1.20);
    this.slowZoneEndS=this.distanceAtNearestX(-3.05);
    this.overlapZoneEndS=this.distanceAtNearestX(-4.25);
    this.stackApproachStartS=Math.max(this.overlapZoneEndS,this.outputLength-1.28);
    this.stackSettleS=Math.max(this.sheetCenterStartS,this.outputLength-.10);

    this.fastRunDistance=Math.max(0,this.fastZoneEndS-this.sheetCenterStartS);
    this.fastRunTime=this.fastRunDistance/this.fastTapeSpeed;

    this.fastToSlowDecelA=(this.fastTapeSpeed-this.slowTapeSpeed)/this.fastToSlowDecelTime;
    this.fastToSlowDecelDistance=(this.fastTapeSpeed+this.slowTapeSpeed)*.5*this.fastToSlowDecelTime;
    this.afterFastDecelS=this.fastZoneEndS+this.fastToSlowDecelDistance;

    this.slowRunDistance=Math.max(0,this.stackApproachStartS-this.afterFastDecelS);
    this.slowRunTime=this.slowRunDistance/this.slowTapeSpeed;

    this.slowToStackDecelA=(this.slowTapeSpeed-this.stackApproachSpeed)/this.slowToStackDecelTime;
    this.slowToStackDecelDistance=(this.slowTapeSpeed+this.stackApproachSpeed)*.5*this.slowToStackDecelTime;
    this.afterStackDecelS=this.stackApproachStartS+this.slowToStackDecelDistance;

    this.stackRunDistance=Math.max(0,this.stackSettleS-this.afterStackDecelS);
    this.stackRunTime=this.stackRunDistance/this.stackApproachSpeed;

    this.motionTime=this.fastRunTime+this.fastToSlowDecelTime+this.slowRunTime+this.slowToStackDecelTime+this.stackRunTime;
    this.sheetTotalAge=this.motionTime+this.stackSettleDuration;

    this.slowPitch=this.slowTapeSpeed*this.cutInterval;
    this.nominalOverlap=Math.max(0,this.sheetLength-this.slowPitch);
    this.fastPitch=this.fastTapeSpeed*this.cutInterval;
    this.nominalFastGap=Math.max(0,this.fastPitch-this.sheetLength);
    this.processCycle=this.cutInterval*6;
  }

  makeRibbonSegment(a,b,index){
    const mid=a.clone().add(b).multiplyScalar(.5),d=b.clone().sub(a),len=Math.max(.02,Math.hypot(d.x,d.y));
    const m=new THREE.Mesh(new THREE.BoxGeometry(len+.010,this.webThickness,this.webWidth),this.webMaterial);
    m.position.copy(mid);m.rotation.z=Math.atan2(d.y,d.x);m.name='Continuous upstream web '+index;m.userData={webRibbon:true};
    m.castShadow=false;m.receiveShadow=true;this.group.add(m);this.webRibbonSegments.push(m);
  }

  buildContinuousWeb(){
    const pts=this.preCutCurve.getPoints(160);
    for(let i=0;i<pts.length-1;i++)this.makeRibbonSegment(pts[i],pts[i+1],i);
    this.webRibbonSegments.forEach(m=>m.visible=false);
  }

  buildPendingLeader(){
    this.pendingLeaderGeometry=new THREE.BoxGeometry(1,this.webThickness,this.webWidth);
    this.pendingLeaderSegmentLength=this.targetCutLength/14;
    for(let i=0;i<14;i++){
      const m=new THREE.Mesh(this.pendingLeaderGeometry,this.webMaterial);
      m.visible=false;m.name='Attached downstream web segment';m.userData={attachedLeader:true,index:i};
      m.castShadow=false;m.receiveShadow=true;this.group.add(m);this.pendingLeaderSegments.push(m);
    }
    this.pendingLeaderLength=0;
  }

  buildFlowMarkers(){
    this.webFlowGeometry=new THREE.BoxGeometry(.050,.014,this.webWidth*1.01);
    for(let i=0;i<10;i++){
      const m=new THREE.Mesh(this.webFlowGeometry,this.flowMaterial);
      m.visible=false;m.name='Web travel stripe';m.userData.webMarker=true;
      this.group.add(m);this.webFlowMarks.push(m);
    }
  }

  buildSheets(){
    this.sheetGeometry=new THREE.BoxGeometry(this.sheetLength,this.sheetThickness,this.sheetWidth);
    for(let i=0;i<16;i++){
      const m=new THREE.Mesh(this.sheetGeometry,this.sheetMaterial);
      m.visible=false;m.name='Detached cut sheet';m.userData={cutSheet:true,cutId:0,transportZone:null};
      m.castShadow=true;m.receiveShadow=true;this.group.add(m);this.sheets.push(m);
    }
  }

  buildPile(){
    this.pileGeometry=new THREE.BoxGeometry(this.sheetLength*.985,this.pileSheetThickness,this.sheetWidth*.985);
    for(let i=0;i<56;i++){
      const m=new THREE.Mesh(this.pileGeometry,this.sheetMaterial);
      m.visible=false;m.name='Finished stacked sheet';m.userData={finishedSheet:true};
      m.position.set(this.stackX,this.palletTopY,0);m.receiveShadow=true;this.group.add(m);this.pile.push(m);
    }
  }

  poseAtDistance(s){
    const u=clamp01(s/Math.max(.001,this.outputLength));
    const p=this.outputCurve.getPointAt(u),tan=this.outputCurve.getTangentAt(u);
    return {p,tan,angle:Math.atan2(tan.y,tan.x),s};
  }

  transportDistanceForAge(age){
    if(age<=0)return this.sheetCenterStartS;
    if(age<=this.fastRunTime)return this.sheetCenterStartS+this.fastTapeSpeed*age;

    age-=this.fastRunTime;
    if(age<=this.fastToSlowDecelTime){
      return this.fastZoneEndS+this.fastTapeSpeed*age-.5*this.fastToSlowDecelA*age*age;
    }

    age-=this.fastToSlowDecelTime;
    if(age<=this.slowRunTime)return this.afterFastDecelS+this.slowTapeSpeed*age;

    age-=this.slowRunTime;
    if(age<=this.slowToStackDecelTime){
      return this.stackApproachStartS+this.slowTapeSpeed*age-.5*this.slowToStackDecelA*age*age;
    }

    age-=this.slowToStackDecelTime;
    if(age<=this.stackRunTime)return this.afterStackDecelS+this.stackApproachSpeed*age;
    return this.stackSettleS;
  }

  zoneAtDistance(s,age){
    if(age>=this.motionTime)return 'LANDING';
    if(s<this.fastZoneEndS)return 'FAST_GAP';
    if(s<this.slowZoneEndS)return 'SLOW_TRANSFER';
    if(s<this.overlapZoneEndS)return 'OVERLAP_SHINGLE';
    return 'STACK_APPROACH';
  }

  sheetPoseForAge(age,pileTop){
    if(age<0||age>=this.sheetTotalAge)return null;
    const s=this.transportDistanceForAge(age),pose=this.poseAtDistance(s),zone=this.zoneAtDistance(s,age);
    if(zone==='SLOW_TRANSFER'||zone==='OVERLAP_SHINGLE')pose.p.y+=.0025;
    if(zone==='LANDING'){
      const k=clamp01((age-this.motionTime)/this.stackSettleDuration),smooth=k*k*(3-2*k);
      pose.p.y=THREE.MathUtils.lerp(pose.p.y,pileTop+this.pileSheetThickness*.65,smooth);
      pose.angle=THREE.MathUtils.lerp(pose.angle,0,smooth);
    }
    return {...pose,zone};
  }

  currentCutPhase(){
    const q=this.webAdvance/this.targetCutLength;
    return q-Math.floor(q);
  }

  currentPileMetrics(){
    const visible=Math.min(this.pile.length,this.completed),rawTop=this.palletTopY+visible*this.pileSheetThickness;
    const liftDrop=Math.min(this.maxLiftDrop,Math.max(0,rawTop-this.targetStackTopY));
    return {visible,liftDrop,top:Math.min(this.targetStackTopY,rawTop-liftDrop)};
  }

  state(){
    const phase=this.currentCutPhase(),window=Math.min(.06/this.cutInterval,.12);
    const cuttingNow=this.active&&(phase<window||phase>1-window);
    const leadingSheet=this.sheets.find(s=>s.visible);
    const leadZone=leadingSheet?.userData.transportZone||null;
    let stageIndex=0;
    if(!this.cutCount)stageIndex=phase<.55?0:1;
    else if(cuttingNow)stageIndex=2;
    else if(leadZone==='FAST_GAP')stageIndex=3;
    else if(leadZone==='SLOW_TRANSFER'||leadZone==='OVERLAP_SHINGLE')stageIndex=4;
    else if(leadZone==='STACK_APPROACH'||leadZone==='LANDING')stageIndex=5;
    else stageIndex=1;

    return {
      available:true,blocked:false,active:this.active,running:this.running,paused:this.active&&!this.running,speed:this.speed,
      stage:SHEETING_SIMULATION_STAGES[stageIndex],completed:this.completed,cutCount:this.cutCount,
      progress:(this.elapsed/this.processCycle)%1,
      sheetsVisible:this.sheets.filter(s=>s.visible).length,pileSheetsVisible:this.pile.filter(s=>s.visible).length,
      webFlowMarksVisible:this.webFlowMarks.filter(s=>s.visible).length,webRibbonSegmentsVisible:this.webRibbonSegments.filter(s=>s.visible).length,
      attachedLeaderSegmentsVisible:this.pendingLeaderSegments.filter(s=>s.visible).length,
      attachedLeaderLength:this.pendingLeaderLength,
      rotorCount:this.template.activeMeshes.filter(m=>/reel|chuck|roller|wheel|revolver/.test(m.userData.motion||'')).length,
      oscillatorCount:0,mechanismCount:this.template.activeMeshes.length,inkFlowCount:0,uvLampCount:0,uvActive:false,
      pathVisible:this.pathVisible,inkFlowVisible:false,
      transportMode:'ATTACHED_WEB__BED_KNIFE_CUT__FAST_GAP__SLOW_SHINGLE__STACK_SETTLE',
      cutterMode:'STATIONARY_BED_KNIFE_PLUS_ROTARY_FLY_KNIFE_FAMILY_REFERENCE',
      cuttingNow,cutPhase:phase,
      bladeVisible:!!this.template.exteriorOpen&&this.template.meshes.some(m=>m.userData.role==='fly-knife-blade'&&m.visible),
      bladeCount:this.template.meshes.filter(m=>['stationary-bed-knife','fly-knife-blade'].includes(m.userData.role)).length,
      visibleKnifeGeometry:'CUTAWAY_ONLY_FAMILY_REFERENCE',
      cutterMechanismEvidence:'HSM56_FLAT_BED_KNIFE__MAXSON_STATIONARY_BED_KNIFE_ROTARY_REVOLVER',
      webAdvance:this.webAdvance,targetCutLength:this.targetCutLength,
      drawRollFunctional:true,drawRollSurfaceSpeed:this.webLinearSpeed,drawRollAngularSpeed:this.webLinearSpeed/this.drawRollRadius,
      drawRollWrapDegrees:THREE.MathUtils.radToDeg(this.drawRollWrapAngle),
      drawRollContactPointCount:this.drawRollContactPoints.length,
      lowEntryWrapPointCount:this.lowEntryContactPoints.length,
      guideRollWrapPointCount:[...this.guideRollContactPoints.values()].reduce((n,a)=>n+a.length,0),
      reelFunctional:true,reelReferenceRadius:this.reelReferenceRadius,reelAngularSpeed:this.reelAngularSpeed,
      reelSurfaceSpeed:this.reelAngularSpeed*this.reelReferenceRadius,
      fastTapeLinearSpeed:this.fastTapeSpeed,slowTapeLinearSpeed:this.slowTapeSpeed,stackApproachLinearSpeed:this.stackApproachSpeed,
      nominalFastGap:this.nominalFastGap,nominalSlowPitch:this.slowPitch,nominalOverlap:this.nominalOverlap,
      detachedSheetStartsWithTrailingEdgeAtCutPoint:true,
      manualStackGuidesStatic:true
    };
  }

  setReferenceStackVisible(v){for(const m of this.referenceStackMeshes)m.visible=!!v;}
  start(){
    this.active=true;this.running=true;this.lastNow=null;this.group.visible=true;
    this.setReferenceStackVisible(false);
    this.webRibbonSegments.forEach(m=>m.visible=true);this.webFlowMarks.forEach(m=>m.visible=true);
    this.onUpdate?.(this.state());return this.state();
  }
  pause(){if(this.active){this.running=false;this.lastNow=null;this.onUpdate?.(this.state());}return this.state();}
  resume(){if(this.active){this.running=true;this.lastNow=null;this.onUpdate?.(this.state());}return this.state();}
  stop(){
    this.active=false;this.running=false;this.elapsed=0;this.webAdvance=0;this.completed=0;this.cutCount=0;this.lastNow=null;this.pendingLeaderLength=0;
    this.sheets.forEach(s=>s.visible=false);this.webFlowMarks.forEach(s=>s.visible=false);this.webRibbonSegments.forEach(s=>s.visible=false);
    this.pendingLeaderSegments.forEach(s=>s.visible=false);this.pile.forEach(s=>s.visible=false);
    this.restoreMechanisms();this.setReferenceStackVisible(true);this.onUpdate?.(this.state());return this.state();
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

  updateMechanisms(){
    const {liftDrop}=this.currentPileMetrics(),cutPhase=this.currentCutPhase();
    for(const m of this.template.activeMeshes){
      const motion=m.userData.motion||'',sign=Number.isFinite(m.userData.rotationSign)?m.userData.rotationSign:1;
      if(m.userData.kinematicGroup==='UNWIND_REEL'){
        this.spinFromRest(m,-this.elapsed*this.reelAngularSpeed);
      }else if(m.userData.kinematicGroup==='WEB_CONTACT'){
        const r=Math.max(.001,m.userData.surfaceRadius||.1);
        this.spinFromRest(m,sign*this.elapsed*(this.webLinearSpeed/r));
      }else if(m.userData.kinematicGroup==='CUT_SHEET_TRANSPORT'){
        const r=Math.max(.001,m.userData.surfaceRadius||.082);
        let linear=this.slowTapeSpeed;
        if(m.userData.transportZone==='FAST')linear=this.fastTapeSpeed;
        else if(m.userData.transportZone==='OVERLAP')linear=this.slowTapeSpeed;
        this.spinFromRest(m,sign*this.elapsed*(linear/r));
      }else if(m.userData.kinematicGroup==='CUTTER_TAKEAWAY'){
        const r=Math.max(.001,m.userData.surfaceRadius||.055);
        this.spinFromRest(m,sign*this.elapsed*(this.webLinearSpeed/r));
      }else if(m.userData.kinematicGroup==='CUTTER_SYNC'){
        // One revolver turn per cut. At phase 0 the tangential blade is aligned with the bed knife.
        this.spinFromRest(m,-TAU*cutPhase+(m.userData.cutPhaseOffset||0));
      }
      if(motion==='lift-table')m.position.y=m.userData.restPosition.y-liftDrop;
    }
  }

  updateWeb(){
    this.webAdvance=this.elapsed*this.webLinearSpeed;
    const len=Math.max(.001,this.preCutCurve.getLength()),phase=(this.webAdvance/len)%1;
    for(const [i,m] of this.webFlowMarks.entries()){
      const t=(phase+i/this.webFlowMarks.length)%1,p=this.preCutCurve.getPointAt(t),tan=this.preCutCurve.getTangentAt(t);
      m.position.copy(p);m.position.y+=.015;m.rotation.set(0,0,Math.atan2(tan.y,tan.x));m.visible=this.active;
    }
    this.updatePendingLeader();
  }

  updatePendingLeader(){
    const fullCuts=Math.floor(this.webAdvance/this.targetCutLength);
    this.pendingLeaderLength=Math.max(0,this.webAdvance-fullCuts*this.targetCutLength);
    const seg=this.pendingLeaderSegmentLength;
    for(const [i,m] of this.pendingLeaderSegments.entries()){
      const s0=i*seg,s1=Math.min(this.pendingLeaderLength,(i+1)*seg);
      if(!this.active||s1<=s0+.0001){m.visible=false;continue;}
      const mid=(s0+s1)/2,pose=this.poseAtDistance(mid),len=s1-s0;
      m.visible=true;m.position.copy(pose.p);m.position.y+=.004;m.rotation.set(0,0,pose.angle);m.scale.set(len,1,1);
    }
  }

  updateSheets(){
    this.cutCount=Math.floor(this.webAdvance/this.targetCutLength);
    this.completed=Math.max(0,Math.floor((this.elapsed-this.sheetTotalAge)/this.cutInterval));
    const pile=this.currentPileMetrics();

    for(const [slot,s] of this.sheets.entries()){
      const cutId=this.cutCount-slot;
      if(cutId<=0){s.visible=false;continue;}
      const birth=cutId*this.cutInterval,age=this.elapsed-birth,pose=this.sheetPoseForAge(age,pile.top);
      if(!pose){s.visible=false;continue;}
      s.visible=this.active;s.userData.cutId=cutId;s.userData.transportZone=pose.zone;
      s.position.copy(pose.p);
      if(pose.zone==='SLOW_TRANSFER'||pose.zone==='OVERLAP_SHINGLE')s.position.y+=(slot%5)*.0012;
      s.rotation.set(0,0,pose.angle);
    }

    for(let i=0;i<this.pile.length;i++){
      const s=this.pile[i];s.visible=i<pile.visible;
      if(s.visible)s.position.set(this.stackX,this.palletTopY-pile.liftDrop+(i+.5)*this.pileSheetThickness,0);
    }
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
    this.sheetGeometry.dispose();this.pileGeometry.dispose();this.webFlowGeometry.dispose();this.pendingLeaderGeometry.dispose();
    for(const m of this.webRibbonSegments)m.geometry.dispose();
    this.sheetMaterial.dispose();this.webMaterial.dispose();this.flowMaterial.dispose();
    this.path.geometry.dispose();this.pathMaterial.dispose();this.group.removeFromParent();
  }
}
