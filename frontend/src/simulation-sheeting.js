import * as THREE from 'three';
import {SHEETING_ACTUAL_LAYOUT} from './sheeting.js';

export const SHEETING_SIMULATION_STAGES=Object.freeze([
  'Unwind / Loaded Reel',
  'Alternating Guide / Tension Rollers',
  'Exterior Draw Roll / Guarded Cut',
  'Fast Delivery Belts',
  'Slow Alignment Belts',
  'Rack-Adjusted Stack Table'
]);

export const SHEETING_PROCESS_STEPS=Object.freeze([
  'The loaded RIGHT-side reel rotates on the actual two-station hydraulic rollstand while the alternate station remains mechanically idle',
  'The continuous web snakes across the photo-matched open roller bank; rollers contacted from opposite sides rotate in opposite directions according to the web path',
  'The web wraps the large black exterior draw roll visible at the LEXUS cutter entry, then enters the guarded cabinet. Cut timing is derived from accumulated web travel; no undocumented blade is rendered',
  'A separated sheet exits onto the upstream green belt field and gains spacing on the fast delivery section',
  'The sheet transfers through the slower multi-level belt/shaft alignment section beneath the photo-visible hold-down wheels and crossrails',
  'The sheet lands inside the open rack-adjusted stack table; only the flat plate lift support moves vertically while manual rack handwheels and guides remain stationary'
]);

const LOCAL_Y=new THREE.Vector3(0,1,0);
const clamp01=v=>Math.max(0,Math.min(1,v));

export class SheetingProcessSimulation{
  constructor(machine,template){
    this.machine=machine;this.template=template;this.layout=SHEETING_ACTUAL_LAYOUT;
    this.group=new THREE.Group();this.group.name='SHEETING-PROCESS-SIMULATION-V194';machine.add(this.group);
    this.active=false;this.running=false;this.speed=1;this.elapsed=0;this.lastNow=null;
    this.completed=0;this.cutCount=0;this.pathVisible=false;this.inkFlowVisible=false;this.onUpdate=null;

    this.webLinearSpeed=1.42;
    this.targetCutLength=1.54;
    this.cutInterval=this.targetCutLength/this.webLinearSpeed;
    this.webAdvance=0;
    this.cutReleaseDelay=.07;
    this.fastDuration=.88;this.slowDuration=1.02;this.overlapDuration=.92;this.landingDuration=.72;
    this.sheetTravel=this.fastDuration+this.slowDuration+this.overlapDuration+this.landingDuration;
    this.processCycle=this.cutInterval*6;

    this.reelReferenceRadius=this.layout.reel.radius;
    this.reelAngularSpeed=this.webLinearSpeed/this.reelReferenceRadius;
    this.webWidth=this.layout.webWidth;this.webThickness=.010;
    this.sheetLength=this.targetCutLength;this.sheetWidth=this.layout.webWidth;this.sheetThickness=.012;this.pileSheetThickness=.012;

    this.cutX=this.layout.cutPoint[0];this.cutY=this.layout.cutPoint[1];
    this.stackX=this.layout.stack.centerX;
    this.palletTopY=.66;this.targetStackTopY=.80;this.maxLiftDrop=.38;

    this.sheets=[];this.pile=[];this.webFlowMarks=[];this.webRibbonSegments=[];
    this.sheetMaterial=new THREE.MeshStandardMaterial({color:0xf2eddf,roughness:.76,metalness:0,side:THREE.DoubleSide});
    this.webMaterial=new THREE.MeshStandardMaterial({color:0xe7e1d3,roughness:.72,metalness:0,side:THREE.DoubleSide});
    this.flowMaterial=new THREE.MeshStandardMaterial({color:0xbcae91,roughness:.62,metalness:0,transparent:true,opacity:.72});
    this.pathMaterial=new THREE.LineBasicMaterial({color:0x2d7771,transparent:true,opacity:.30});
    this.referenceStackMeshes=this.template.meshes.filter(m=>m.userData.referenceStack);

    this.buildPaths();this.buildContinuousWeb();this.buildFlowMarkers();this.buildSheets();this.buildPile();
  }

  surfacePoint(spec,clearance=.018){
    const [x,y,z]=spec.center;
    const sign=spec.contact==='BOTTOM'?-1:1;
    return new THREE.Vector3(x,y+sign*(spec.radius+clearance),z);
  }

  buildPaths(){
    const reel=this.layout.reel;
    const pre=[new THREE.Vector3(reel.loadedCenter[0]-.12,reel.loadedCenter[1]+reel.radius+.025,0)];
    for(const spec of this.layout.feedRollers)pre.push(this.surfacePoint(spec));

    const draw=this.layout.drawRoll;
    const dc=new THREE.Vector3(...draw.center),contactR=draw.radius+.018;
    const arc=[];
    const start=THREE.MathUtils.degToRad(draw.wrapStartDeg),end=THREE.MathUtils.degToRad(draw.wrapEndDeg);
    for(let i=0;i<=26;i++){
      const a=THREE.MathUtils.lerp(start,end,i/26);
      arc.push(new THREE.Vector3(dc.x+Math.cos(a)*contactR,dc.y+Math.sin(a)*contactR,0));
    }
    this.drawRollCenter=new THREE.Vector2(dc.x,dc.y);
    this.drawRollRadius=draw.radius;this.webContactRadius=contactR;
    this.drawRollWrapAngle=Math.abs(end-start);
    this.drawRollContactPoints=arc.map(p=>p.clone());
    pre.push(...arc,new THREE.Vector3(this.cutX,this.cutY,0));
    this.preCutCurve=new THREE.CatmullRomCurve3(pre,false,'centripetal',.03);

    const fast=[
      new THREE.Vector3(this.cutX,this.cutY,0),new THREE.Vector3(1.05,.86,0),
      new THREE.Vector3(.62,.85,0),new THREE.Vector3(.15,.84,0),new THREE.Vector3(-.28,.84,0)
    ];
    const slow=[
      new THREE.Vector3(-.28,.84,0),new THREE.Vector3(-.78,.84,0),
      new THREE.Vector3(-1.30,.83,0),new THREE.Vector3(-1.82,.83,0)
    ];
    const overlap=[
      new THREE.Vector3(-1.82,.83,0),new THREE.Vector3(-2.35,.82,0),
      new THREE.Vector3(-2.90,.82,0),new THREE.Vector3(-3.45,.81,0),new THREE.Vector3(-4.05,.80,0)
    ];
    const landing=[
      new THREE.Vector3(-4.05,.80,0),new THREE.Vector3(-4.45,.79,0),
      new THREE.Vector3(-4.86,.77,0),new THREE.Vector3(-5.28,.75,0),
      new THREE.Vector3(this.stackX,this.targetStackTopY,0)
    ];
    this.fastCurve=new THREE.CatmullRomCurve3(fast,false,'centripetal',.03);
    this.slowCurve=new THREE.CatmullRomCurve3(slow,false,'centripetal',.03);
    this.overlapCurve=new THREE.CatmullRomCurve3(overlap,false,'centripetal',.03);
    this.landingCurve=new THREE.CatmullRomCurve3(landing,false,'centripetal',.03);

    const pts=[...this.preCutCurve.getPoints(120),...this.fastCurve.getPoints(26).slice(1),...this.slowCurve.getPoints(22).slice(1),...this.overlapCurve.getPoints(28).slice(1),...this.landingCurve.getPoints(22).slice(1)];
    this.path=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),this.pathMaterial);
    this.path.name='Sheeting V194 verified process centerline';this.path.visible=this.pathVisible;this.group.add(this.path);
  }

  makeRibbonSegment(a,b,index){
    const mid=a.clone().add(b).multiplyScalar(.5),d=b.clone().sub(a);
    const len=Math.max(.02,Math.hypot(d.x,d.y));
    const m=new THREE.Mesh(new THREE.BoxGeometry(len+.010,this.webThickness,this.webWidth),this.webMaterial);
    m.position.copy(mid);m.rotation.z=Math.atan2(d.y,d.x);m.name='Continuous web ribbon '+index;m.userData={webRibbon:true};
    m.castShadow=false;m.receiveShadow=true;this.group.add(m);this.webRibbonSegments.push(m);
  }
  buildContinuousWeb(){
    const pts=this.preCutCurve.getPoints(126);
    for(let i=0;i<pts.length-1;i++)this.makeRibbonSegment(pts[i],pts[i+1],i);
    this.webRibbonSegments.forEach(m=>m.visible=false);
  }
  buildFlowMarkers(){
    this.webFlowGeometry=new THREE.BoxGeometry(.050,.014,this.webWidth*1.01);
    for(let i=0;i<9;i++){const m=new THREE.Mesh(this.webFlowGeometry,this.flowMaterial);m.visible=false;m.name='Web travel stripe';m.userData.webMarker=true;this.group.add(m);this.webFlowMarks.push(m);}
  }
  buildSheets(){
    this.sheetGeometry=new THREE.BoxGeometry(this.sheetLength,this.sheetThickness,this.sheetWidth);
    for(let i=0;i<12;i++){const m=new THREE.Mesh(this.sheetGeometry,this.sheetMaterial);m.visible=false;m.name='Separated cut sheet';m.userData={cutSheet:true,cutId:0};m.castShadow=true;m.receiveShadow=true;this.group.add(m);this.sheets.push(m);}
  }
  buildPile(){
    this.pileGeometry=new THREE.BoxGeometry(this.sheetLength*.985,this.pileSheetThickness,this.sheetWidth*.985);
    for(let i=0;i<48;i++){const m=new THREE.Mesh(this.pileGeometry,this.sheetMaterial);m.visible=false;m.name='Finished stacked sheet';m.userData={finishedSheet:true};m.position.set(this.stackX,this.palletTopY,0);this.group.add(m);this.pile.push(m);}
  }

  state(){
    const leadAge=this.cutCount>0?Math.max(0,this.elapsed-this.cutCount*this.cutInterval):0;
    let stageIndex=0;
    if(this.cutCount===0)stageIndex=this.elapsed<this.cutInterval*.50?0:1;
    else if(leadAge<this.cutReleaseDelay+.10)stageIndex=2;
    else if(leadAge<this.fastDuration)stageIndex=3;
    else if(leadAge<this.fastDuration+this.slowDuration+this.overlapDuration)stageIndex=4;
    else stageIndex=5;
    return {
      available:true,blocked:false,active:this.active,running:this.running,paused:this.active&&!this.running,speed:this.speed,
      stage:SHEETING_SIMULATION_STAGES[stageIndex],completed:this.completed,cutCount:this.cutCount,progress:(this.elapsed/this.processCycle)%1,
      sheetsVisible:this.sheets.filter(s=>s.visible).length,webFlowMarksVisible:this.webFlowMarks.filter(s=>s.visible).length,
      webRibbonSegmentsVisible:this.webRibbonSegments.filter(s=>s.visible).length,pileSheetsVisible:this.pile.filter(s=>s.visible).length,
      rotorCount:this.template.activeMeshes.filter(m=>/reel|chuck|roller|wheel/.test(m.userData.motion||'')).length,
      oscillatorCount:0,mechanismCount:this.template.activeMeshes.length,inkFlowCount:0,uvLampCount:0,uvActive:false,
      pathVisible:this.pathVisible,inkFlowVisible:false,transportMode:'PHOTO_MATCHED_ROLLER_WRAP_TO_MULTI_LEVEL_BELT_STACK',
      cutPulseVisible:false,bladeVisible:false,bladeCount:0,bladeStroke:0,visibleKnifeGeometry:false,cutterMechanismEvidence:'GUARDED_INTERNAL_UNRESOLVED',
      webAdvance:this.webAdvance,targetCutLength:this.targetCutLength,
      drawRollFunctional:true,drawRollSurfaceSpeed:this.webLinearSpeed,drawRollAngularSpeed:this.webLinearSpeed/this.drawRollRadius,
      drawRollWrapDegrees:THREE.MathUtils.radToDeg(this.drawRollWrapAngle),drawRollContactPointCount:this.drawRollContactPoints.length,
      reelFunctional:true,reelReferenceRadius:this.reelReferenceRadius,reelAngularSpeed:this.reelAngularSpeed,reelSurfaceSpeed:this.reelAngularSpeed*this.reelReferenceRadius,
      cutReleaseDelay:this.cutReleaseDelay,fastTapeLinearSpeed:this.fastCurve.getLength()/this.fastDuration,
      slowTapeLinearSpeed:this.slowCurve.getLength()/this.slowDuration,overlapTapeLinearSpeed:this.overlapCurve.getLength()/this.overlapDuration,
      manualStackGuidesStatic:true
    };
  }

  setReferenceStackVisible(v){for(const m of this.referenceStackMeshes)m.visible=!!v;}
  start(){this.active=true;this.running=true;this.lastNow=null;this.group.visible=true;this.setReferenceStackVisible(false);this.webRibbonSegments.forEach(m=>m.visible=true);this.webFlowMarks.forEach(m=>m.visible=true);this.onUpdate?.(this.state());return this.state();}
  pause(){if(this.active){this.running=false;this.lastNow=null;this.onUpdate?.(this.state());}return this.state();}
  resume(){if(this.active){this.running=true;this.lastNow=null;this.onUpdate?.(this.state());}return this.state();}
  stop(){this.active=false;this.running=false;this.elapsed=0;this.webAdvance=0;this.completed=0;this.cutCount=0;this.lastNow=null;this.sheets.forEach(s=>s.visible=false);this.webFlowMarks.forEach(s=>s.visible=false);this.webRibbonSegments.forEach(s=>s.visible=false);this.pile.forEach(s=>s.visible=false);this.restoreMechanisms();this.setReferenceStackVisible(true);this.onUpdate?.(this.state());return this.state();}
  setSpeed(v){this.speed=Math.max(.35,Math.min(2,+v||1));this.onUpdate?.(this.state());return this.state();}
  setPathVisible(v){this.pathVisible=!!v;this.path.visible=this.pathVisible;this.onUpdate?.(this.state());return this.state();}
  setInkFlowVisible(){return this.state();}

  restoreMechanisms(){
    for(const m of this.template.meshes){if(m.userData.restPosition)m.position.copy(m.userData.restPosition);if(m.userData.restRotation)m.rotation.copy(m.userData.restRotation);}
  }
  spinFromRest(mesh,angle){
    if(!mesh.userData.restRotation)return;
    const base=new THREE.Quaternion().setFromEuler(mesh.userData.restRotation),spin=new THREE.Quaternion().setFromAxisAngle(LOCAL_Y,angle);
    mesh.quaternion.copy(base).multiply(spin);
  }
  currentPileMetrics(){
    const visible=Math.min(this.pile.length,this.completed),rawTop=this.palletTopY+visible*this.pileSheetThickness;
    const liftDrop=Math.min(this.maxLiftDrop,Math.max(0,rawTop-this.targetStackTopY));
    return {visible,liftDrop,top:Math.min(this.targetStackTopY,rawTop-liftDrop)};
  }
  updateMechanisms(){
    const {liftDrop}=this.currentPileMetrics();
    for(const m of this.template.activeMeshes){
      const motion=m.userData.motion||'',sign=Number.isFinite(m.userData.rotationSign)?m.userData.rotationSign:1;
      if(m.userData.kinematicGroup==='UNWIND_REEL'){
        this.spinFromRest(m,-this.elapsed*this.reelAngularSpeed);
      }else if(m.userData.kinematicGroup==='WEB_CONTACT'){
        const r=Math.max(.001,m.userData.surfaceRadius||.1);
        this.spinFromRest(m,sign*this.elapsed*(this.webLinearSpeed/r));
      }else if(m.userData.kinematicGroup==='CUT_SHEET_TRANSPORT'){
        const r=Math.max(.001,m.userData.surfaceRadius||.082);
        let linear=this.slowCurve.getLength()/this.slowDuration;
        if(m.userData.transportZone==='FAST')linear=this.fastCurve.getLength()/this.fastDuration;
        else if(m.userData.transportZone==='OVERLAP')linear=this.overlapCurve.getLength()/this.overlapDuration;
        this.spinFromRest(m,sign*this.elapsed*(linear/r));
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
  }
  curvePose(curve,t){const p=curve.getPointAt(clamp01(t)),tan=curve.getTangentAt(clamp01(t));return {p,tan,angle:Math.atan2(tan.y,tan.x)};}
  sheetPoseForAge(age,pileTop){
    if(age<0||age>=this.sheetTravel)return null;
    if(age<this.fastDuration){const q=this.curvePose(this.fastCurve,age/this.fastDuration);return {...q,zone:'FAST'};}
    age-=this.fastDuration;
    if(age<this.slowDuration){const q=this.curvePose(this.slowCurve,age/this.slowDuration);return {...q,zone:'SLOW'};}
    age-=this.slowDuration;
    if(age<this.overlapDuration){const k=age/this.overlapDuration,q=this.curvePose(this.overlapCurve,k);q.p.y+=.007*(1-k);return {...q,zone:'ALIGNMENT'};}
    age-=this.overlapDuration;
    const k=age/this.landingDuration,q=this.curvePose(this.landingCurve,k);
    if(k>.35){const t=clamp01((k-.35)/.65),smooth=t*t*(3-2*t);q.p.y=THREE.MathUtils.lerp(q.p.y,pileTop+this.pileSheetThickness*.65,smooth);q.angle=THREE.MathUtils.lerp(q.angle,0,smooth);}
    return {...q,zone:'LANDING'};
  }
  updateSheets(){
    this.cutCount=Math.floor(this.webAdvance/this.targetCutLength);
    this.completed=Math.max(0,Math.floor((this.elapsed-this.sheetTravel-this.cutReleaseDelay)/this.cutInterval));
    const pile=this.currentPileMetrics();
    for(const [slot,s] of this.sheets.entries()){
      const cutId=this.cutCount-slot;if(cutId<=0){s.visible=false;continue;}
      const age=this.elapsed-(cutId*this.cutInterval+this.cutReleaseDelay),pose=this.sheetPoseForAge(age,pile.top);
      if(!pose){s.visible=false;continue;}
      s.visible=this.active;s.userData.cutId=cutId;s.userData.transportZone=pose.zone;s.position.copy(pose.p);s.rotation.set(0,0,pose.angle);
    }
    for(let i=0;i<this.pile.length;i++){
      const s=this.pile[i];s.visible=i<pile.visible;
      if(s.visible)s.position.set(this.stackX,this.palletTopY-pile.liftDrop+(i+.5)*this.pileSheetThickness,0);
    }
  }
  update(now){
    if(!this.active||!this.running){this.lastNow=now;return;}
    if(this.lastNow==null){this.lastNow=now;return;}
    const dt=Math.min((now-this.lastNow)/1000,.05)*this.speed;this.lastNow=now;this.elapsed+=dt;
    this.updateWeb();this.updateSheets();this.updateMechanisms();this.onUpdate?.(this.state());
  }
  dispose(){
    this.stop();this.sheetGeometry.dispose();this.pileGeometry.dispose();this.webFlowGeometry.dispose();for(const m of this.webRibbonSegments)m.geometry.dispose();
    this.sheetMaterial.dispose();this.webMaterial.dispose();this.flowMaterial.dispose();this.path.geometry.dispose();this.pathMaterial.dispose();this.group.removeFromParent();
  }
}
