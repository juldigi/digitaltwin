import * as THREE from 'three';

export const MEDIA100_SIMULATION_STAGES=Object.freeze([
 'Blank separation','Feeder transport','Alignment / pre-break','Lock-bottom forming reference',
 'Glue application reference','Final fold / trombone','Compression dwell','Delivery'
]);
const Y_AXIS=new THREE.Vector3(0,1,0);
const smooth=(v,a,b)=>THREE.MathUtils.smoothstep(v,a,b);
const clamp=v=>Math.max(0,Math.min(1,v));
const stageFor=t=>t<.12?'FEED':t<.30?'PREFOLD':t<.48?'FORM':t<.60?'GLUE':t<.82?'FINAL':t<.96?'PRESS':'DELIVERY';

export class Media100ProcessSimulation{
 constructor(root,template){
  this.root=root;this.template=template;this.active=false;this.running=false;this.paused=false;this.speed=1;this.completed=0;this.elapsed=0;this.lastNow=null;this.onUpdate=null;
  this.rotors=[];this.cartons=[];this.exitStack=[];this.pathVisible=false;this.glueVisible=true;
  root.traverse(o=>{if(o.isMesh&&o.userData.rotor)this.rotors.push(o);});
  this.rotorRest=this.rotors.map(r=>r.quaternion.clone());
  this.points=[[-5.15,.84,0],[-4.25,.80,0],[-3.15,.80,0],[-1.30,.80,0],[.50,.80,0],[2.35,.91,0],[4.45,.88,0],[5.25,.84,0]].map(p=>new THREE.Vector3(...p));
  this.curve=new THREE.CatmullRomCurve3(this.points,false,'centripetal');
  const pathGeo=new THREE.BufferGeometry().setFromPoints(this.curve.getPoints(220)),pathMat=new THREE.LineDashedMaterial({color:0x667f8b,dashSize:.08,gapSize:.05,transparent:true,opacity:.50});
  this.pathLine=new THREE.Line(pathGeo,pathMat);this.pathLine.computeLineDistances();this.pathLine.visible=false;this.pathLine.name='MEDIA100-CONTINUOUS-CARTON-PATH';root.add(this.pathLine);
  for(let i=0;i<8;i++)this.cartons.push(this.createCarton(i/8));
  for(let i=0;i<24;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(.66,.026,.22),new THREE.MeshStandardMaterial({color:0xd8c59d,roughness:.9}));p.visible=false;root.add(p);this.exitStack.push(p);}
  this.resetFlags();
 }
 createCarton(phase){
  const group=new THREE.Group(),mat=new THREE.MeshStandardMaterial({color:0xd8c59d,roughness:.88}),base=new THREE.Mesh(new THREE.BoxGeometry(.62,.018,.42),mat);group.add(base);
  const left=new THREE.Mesh(new THREE.BoxGeometry(.62,.016,.15),mat.clone()),right=new THREE.Mesh(new THREE.BoxGeometry(.62,.016,.15),mat.clone());left.position.z=-.285;right.position.z=.285;group.add(left,right);
  const front=new THREE.Mesh(new THREE.BoxGeometry(.16,.016,.36),mat.clone()),rear=new THREE.Mesh(new THREE.BoxGeometry(.16,.016,.36),mat.clone());front.position.x=.39;rear.position.x=-.39;group.add(front,rear);
  const glue=new THREE.Mesh(new THREE.BoxGeometry(.34,.009,.018),new THREE.MeshStandardMaterial({color:0xd3ab46,roughness:.48,emissive:0x5a3c00,emissiveIntensity:.2}));glue.position.set(.05,.018,.20);glue.visible=false;group.add(glue);
  const datum=new THREE.Mesh(new THREE.BoxGeometry(.04,.01,.04),new THREE.MeshBasicMaterial({color:0x467b93,transparent:true,opacity:.55}));datum.position.set(-.23,.024,-.16);datum.visible=false;group.add(datum);
  group.visible=false;group.userData.referenceJob='LOCK_BOTTOM_VISUALIZATION_DEMO';group.userData.demoOnly=true;this.root.add(group);
  return {group,left,right,front,rear,glue,datum,phase,lap:-1,lastStage:'FEED'};
 }
 resetFlags(){this.feedingActive=false;this.preBreakActive=false;this.formingActive=false;this.glueApplying=false;this.foldingActive=false;this.compressionActive=false;this.deliveryActive=false;this.referenceJobDemoOnly=true;this.activeByStage={FEED:0,PREFOLD:0,FORM:0,GLUE:0,FINAL:0,PRESS:0,DELIVERY:0};}
 state(){
  const phase=this.active?(this.elapsed/8.8)%1:0,index=Math.min(MEDIA100_SIMULATION_STAGES.length-1,Math.floor(phase*MEDIA100_SIMULATION_STAGES.length));
  return {available:true,blocked:false,active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:MEDIA100_SIMULATION_STAGES[index],completed:this.completed,progress:phase,
   sheetsVisible:this.cartons.filter(c=>c.group.visible).length,pileSheetsVisible:this.exitStack.filter(p=>p.visible).length,rotorCount:this.rotors.length,mechanismCount:this.rotors.length+this.cartons.length*5,
   pathVisible:this.pathVisible,inkFlowVisible:this.glueVisible,inkFlowCount:this.cartons.filter(c=>c.glue.visible).length,uvLampCount:0,uvActive:false,
   feedingActive:this.feedingActive,preBreakActive:this.preBreakActive,formingActive:this.formingActive,glueApplying:this.glueApplying,foldingActive:this.foldingActive,compressionActive:this.compressionActive,deliveryActive:this.deliveryActive,
   referenceJobDemoOnly:true,activeByStage:{...this.activeByStage}};
 }
 start(){this.active=true;this.running=true;this.paused=false;this.completed=0;this.elapsed=0;this.lastNow=null;for(const c of this.cartons)c.lap=-1;this.resetMechanisms();this.onUpdate?.(this.state());return this.state();}
 pause(){this.running=false;this.paused=this.active;this.onUpdate?.(this.state());return this.state();}
 resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;}this.onUpdate?.(this.state());return this.state();}
 setSpeed(v){this.speed=Math.max(.25,Math.min(4,Number(v)||1));return this.state();}
 setPathVisible(v){this.pathVisible=!!v;this.pathLine.visible=this.pathVisible;return this.state();}
 setInkFlowVisible(v){this.glueVisible=!!v;return this.state();}
 spin(r,dt,rate){const q=new THREE.Quaternion().setFromAxisAngle(Y_AXIS,(r.userData.spinDirection||1)*rate*dt);r.quaternion.multiply(q).normalize();}
 updateRotors(dt){
  for(const r of this.rotors){const role=String(r.userData.mechanismRole||'');let rate=4.8;
   if(role==='main-motor'||role==='line-shaft')rate=6.0;else if(role==='line-drive')rate=5.6;else if(role==='feeder-pulley')rate=6.3;else if(role==='glue-disc'||role==='glue-pump')rate=4.2;else if(role==='trombone-pulley')rate=5.5;else if(role==='exit-roller')rate=5.0;
   this.spin(r,dt,rate);
  }
 }
 updateCarton(c,raw){
  const t=((raw%1)+1)%1,stage=stageFor(t);c.lastStage=stage;this.activeByStage[stage]++;c.group.visible=this.active;c.group.position.copy(this.curve.getPointAt(Math.min(.999,t)));
  const next=this.curve.getPointAt(Math.min(.999,t+.002));c.group.rotation.y=-Math.atan2(next.z-c.group.position.z,Math.max(.001,next.x-c.group.position.x));
  const pre=smooth(t,.12,.30),bottom=smooth(t,.30,.48),final=smooth(t,.60,.82),compression=smooth(t,.82,.96);
  c.left.rotation.x=.28*pre+.38*bottom+.70*final;c.right.rotation.x=-(.28*pre+.38*bottom+.70*final);
  c.front.rotation.z=-.55*bottom-.42*final;c.rear.rotation.z=.55*bottom+.42*final;
  c.glue.visible=this.glueVisible&&t>=.48&&t<.61;c.glue.material.emissiveIntensity=c.glue.visible?1.2:.2;
  c.datum.visible=false;
  c.group.scale.set(1,1,1-0.40*compression);
  const lap=Math.floor(raw);if(lap>c.lap){if(c.lap>=0)this.outputCarton();c.lap=lap;}
 }
 outputCarton(){this.completed++;const idx=(this.completed-1)%this.exitStack.length,p=this.exitStack[idx];p.visible=true;p.position.set(5.30,.47+(idx*.028),0);}
 update(now){
  if(!this.active||!this.running){this.lastNow=now;return;}if(this.lastNow===null){this.lastNow=now;return;}
  const dt=Math.min(.12,Math.max(0,(now-this.lastNow)/1000))*this.speed;this.lastNow=now;this.elapsed+=dt;this.updateRotors(dt);
  this.activeByStage={FEED:0,PREFOLD:0,FORM:0,GLUE:0,FINAL:0,PRESS:0,DELIVERY:0};
  const base=this.elapsed/8.8;for(const c of this.cartons)this.updateCarton(c,base+c.phase);
  this.feedingActive=this.activeByStage.FEED>0;this.preBreakActive=this.activeByStage.PREFOLD>0;this.formingActive=this.activeByStage.FORM>0;this.glueApplying=this.activeByStage.GLUE>0;this.foldingActive=this.activeByStage.FINAL>0;this.compressionActive=this.activeByStage.PRESS>0;this.deliveryActive=this.activeByStage.DELIVERY>0;
  this.onUpdate?.(this.state());
 }
 resetMechanisms(){
  this.rotors.forEach((r,i)=>r.quaternion.copy(this.rotorRest[i]));for(const c of this.cartons){c.group.visible=false;c.group.scale.set(1,1,1);c.left.rotation.x=0;c.right.rotation.x=0;c.front.rotation.z=0;c.rear.rotation.z=0;c.glue.visible=false;c.datum.visible=false;}this.resetFlags();
 }
 stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.resetMechanisms();for(const p of this.exitStack)p.visible=false;this.pathLine.visible=false;this.onUpdate?.(this.state());return this.state();}
 dispose(){this.stop();for(const c of this.cartons){this.root.remove(c.group);c.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}for(const p of this.exitStack){this.root.remove(p);p.geometry.dispose();p.material.dispose();}this.root.remove(this.pathLine);this.pathLine.geometry.dispose();this.pathLine.material.dispose();}
}
