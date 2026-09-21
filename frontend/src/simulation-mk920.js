import * as THREE from 'three';

export const MK920_SIMULATION_STAGES=Object.freeze([
 'Pile separation','Feed-table registration','Intermittent gripper index to platen',
 'Platen close','Pressure / hot-foil dwell','Platen open',
 'Foil advance + waste rewind','Gripper index to delivery','Gripper release','Delivery pile'
]);
const Y_AXIS=new THREE.Vector3(0,1,0);
const smooth=(v,a,b)=>THREE.MathUtils.smoothstep(v,a,b);
const lerp=(a,b,t)=>THREE.MathUtils.lerp(a,b,Math.max(0,Math.min(1,t)));

function transportProgress(p){
 if(p<.18)return lerp(0,.18,p/.18);
 if(p<.30)return lerp(.18,.42,(p-.18)/.12);
 if(p<.70)return .42;
 if(p<.90)return lerp(.42,.86,(p-.70)/.20);
 return lerp(.86,1,(p-.90)/.10);
}
function transportIsIndexing(p){return p<.30||(p>=.70&&p<.90)||p>=.90;}
function gripperLoopPosition(t){
 t=((t%1)+1)%1;
 if(t<.42)return {x:lerp(-1.60,1.72,t/.42),y:1.30};
 if(t<.52)return {x:1.72,y:lerp(1.30,1.02,(t-.42)/.10)};
 if(t<.90)return {x:lerp(1.72,-1.60,(t-.52)/.38),y:1.02};
 return {x:-1.60,y:lerp(1.02,1.30,(t-.90)/.10)};
}

export class MK920StampingSimulation{
 constructor(root,template){
  this.root=root;this.template=template;this.active=false;this.running=false;this.paused=false;this.speed=1;this.completed=0;this.elapsed=0;this.lastNow=null;this.onUpdate=null;
  this.rotors=[];this.suckers=[];this.gripperBars=[];this.heaters=[];this.foilAxes=[];this.foilWebs=[];this.sheets=[];this.stack=[];
  this.lower=template.findNode('mk920-platen-lower');this.feederHead=template.findNode('mk920-feeder-head');
  this.lowerRest=this.lower?.position.clone()||null;this.headRest=this.feederHead?.position.clone()||null;
  root.traverse(o=>{if(o.isMesh&&o.userData.rotor)this.rotors.push(o);if(o.isMesh&&o.userData.reciprocator)this.suckers.push(o);if(o.userData.gripperBar)this.gripperBars.push(o);if(o.isMesh&&o.userData.heater)this.heaters.push(o);if(o.userData.foilPullAxis)this.foilAxes.push(o);if(o.userData.foilWeb)this.foilWebs.push(o);});
  this.rotorRest=this.rotors.map(r=>r.quaternion.clone());this.suckerRest=this.suckers.map(s=>s.position.clone());this.barRest=this.gripperBars.map(b=>b.position.clone());
  this.points=[[-3.44,1.35,0],[-2.33,1.15,0],[-1.42,1.14,0],[-.15,1.46,0],[1.20,1.25,0],[2.98,1.15,0]].map(p=>new THREE.Vector3(...p));
  this.curve=new THREE.CatmullRomCurve3(this.points,false,'centripetal');
  const pathGeo=new THREE.BufferGeometry().setFromPoints(this.curve.getPoints(160)),pathMat=new THREE.LineDashedMaterial({color:0x8b7650,dashSize:.06,gapSize:.04,transparent:true,opacity:.52});
  this.pathLine=new THREE.Line(pathGeo,pathMat);this.pathLine.computeLineDistances();this.pathLine.visible=false;this.pathLine.name='MK920-INTERMITTENT-STAMPING-PATH';root.add(this.pathLine);
  const mat=new THREE.MeshStandardMaterial({color:0xf1ead7,roughness:.88,side:THREE.DoubleSide});
  for(let i=0;i<6;i++){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.92,.65),mat.clone());mesh.rotation.x=-Math.PI/2;mesh.visible=false;root.add(mesh);this.sheets.push({mesh,phase:i/6,lap:-1});}
  for(let i=0;i<16;i++){const mesh=new THREE.Mesh(new THREE.BoxGeometry(.92,.006,.65),mat.clone());mesh.visible=false;root.add(mesh);this.stack.push(mesh);}
  this.pathVisible=false;this.foilVisible=true;this.resetFlags();
 }
 resetFlags(){this.transportIndexing=false;this.transportStopped=false;this.feederSuctionActive=false;this.platenClosing=false;this.platenClosed=false;this.pressureDwell=false;this.platenOpening=false;this.heaterReady=false;this.stampingContact=false;this.foilAdvancing=false;this.wasteRewinding=false;this.gripperReleaseActive=false;}
 state(){
  const p=this.active?(this.elapsed%10)/10:0,index=Math.min(MK920_SIMULATION_STAGES.length-1,Math.floor(p*MK920_SIMULATION_STAGES.length));
  return {available:true,blocked:false,active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:MK920_SIMULATION_STAGES[index],completed:this.completed,progress:p,
   sheetsVisible:this.sheets.filter(s=>s.mesh.visible).length,pileSheetsVisible:this.stack.filter(s=>s.visible).length,rotorCount:this.rotors.length,oscillatorCount:this.suckers.length,
   mechanismCount:this.rotors.length+this.suckers.length+this.gripperBars.length+this.heaters.length,pathVisible:this.pathVisible,inkFlowVisible:this.foilVisible,inkFlowCount:this.foilAxes.length,uvLampCount:0,uvActive:false,
   transportIndexing:this.transportIndexing,transportStopped:this.transportStopped,feederSuctionActive:this.feederSuctionActive,
   platenClosing:this.platenClosing,platenClosed:this.platenClosed,pressureDwell:this.pressureDwell,platenOpening:this.platenOpening,heaterReady:this.heaterReady,stampingContact:this.stampingContact,
   foilAdvancing:this.foilAdvancing,wasteRewinding:this.wasteRewinding,foilAxisCount:this.foilAxes.length,foilWebCount:this.foilWebs.length,gripperReleaseActive:this.gripperReleaseActive,
   interlocks:{pressureRequiresStoppedTransport:this.pressureDwell?!this.transportIndexing:true,foilAdvanceRequiresOpenPlaten:this.foilAdvancing?!this.platenClosed&&!this.platenClosing:true,foilAdvanceForbiddenDuringDwell:!(this.foilAdvancing&&this.pressureDwell)}};
 }
 start(){this.active=true;this.running=true;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;for(const s of this.sheets)s.lap=-1;this.resetMechanisms();this.heaterReady=true;this.updateHeaters();this.onUpdate?.(this.state());return this.state();}
 pause(){this.running=false;this.paused=this.active;this.onUpdate?.(this.state());return this.state();}
 resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;}this.onUpdate?.(this.state());return this.state();}
 setSpeed(v){this.speed=Math.max(.25,Math.min(4,Number(v)||1));return this.state();}
 setPathVisible(v){this.pathVisible=!!v;this.pathLine.visible=this.pathVisible;return this.state();}
 setInkFlowVisible(v){this.foilVisible=!!v;for(const w of this.foilWebs)w.visible=this.foilVisible;return this.state();}
 resetMechanisms(){
  if(this.lower&&this.lowerRest)this.lower.position.copy(this.lowerRest);if(this.feederHead&&this.headRest)this.feederHead.position.copy(this.headRest);
  this.rotors.forEach((r,i)=>r.quaternion.copy(this.rotorRest[i]));this.suckers.forEach((s,i)=>s.position.copy(this.suckerRest[i]));this.gripperBars.forEach((b,i)=>b.position.copy(this.barRest[i]));
  this.resetFlags();this.updateHeaters();
 }
 updateHeaters(){for(const h of this.heaters){h.material.emissive?.setHex(this.heaterReady?0x8f3415:0x000000);h.material.emissiveIntensity=this.heaterReady?1.0:0;}}
 spin(r,dt,rate){const q=new THREE.Quaternion().setFromAxisAngle(Y_AXIS,(r.userData.spinDirection||1)*rate*dt);r.quaternion.multiply(q).normalize();}
 updateRotors(dt,p,indexing,platenMotion,foilAdvance){
  for(const r of this.rotors){const role=String(r.userData.mechanismRole||'');let move=false,rate=4;
   if(role==='main-motor'||role==='flywheel'||role==='clutch'){move=true;rate=6;}else if(role==='chain-sprocket'||role==='index-cam'||role==='feed-wheel'){move=indexing;rate=5.7;}
   else if(role==='eccentric'){move=platenMotion;rate=3.5;}else if(role==='foil-pull-1'||role==='foil-pull-2'||role==='foil-pull-3'||role==='foil-reel'||role==='reel-shaft'||role==='foil-idler'||role==='foil-guide'||role==='waste-rewind'){move=foilAdvance;rate=/foil-pull|waste-rewind/.test(role)?5.4:3.2;}
   else if(role==='blower'){move=p<.18;rate=8;}else if(role==='lift-chain'){move=p<.14;rate=2.5;}else if(role==='release-cam'){move=p>.88;rate=4.4;}
   if(move)this.spin(r,dt,rate);
  }
 }
 updateFeeder(p){const active=p<.18,local=Math.min(1,p/.18);this.feederSuctionActive=active;if(this.feederHead&&this.headRest){this.feederHead.position.copy(this.headRest);if(active){this.feederHead.position.y-=.04*Math.sin(Math.PI*local);this.feederHead.position.x+=.03*Math.sin(Math.PI*local);}}this.suckers.forEach((s,i)=>{s.position.copy(this.suckerRest[i]);if(active)s.position.y-=.016*Math.sin(Math.PI*local);});}
 updateGrippers(globalTransport){for(const bar of this.gripperBars){const q=gripperLoopPosition(globalTransport+(bar.userData.barPhase||0));bar.position.set(q.x,q.y,0);}}
 outputSheet(){this.completed++;const p=this.stack[(this.completed-1)%this.stack.length];p.visible=true;p.position.set(2.98,1.125+((this.completed-1)%this.stack.length)*.007,0);}
 updateSheets(cycleIndex,transport){
  const global=cycleIndex+transport;
  for(const s of this.sheets){const raw=global+s.phase,t=((raw%1)+1)%1;s.mesh.visible=true;s.mesh.position.copy(this.curve.getPointAt(Math.min(.999,t)));s.mesh.rotation.set(-Math.PI/2,0,0);s.mesh.material.color.setHex(this.stampingContact&&t>.40&&t<.60?0xe1c06a:t>.55?0xead9a8:0xf1ead7);
   const lap=Math.floor(raw);if(lap>s.lap){if(s.lap>=0)this.outputSheet();s.lap=lap;}
  }
 }
 update(now){
  if(!this.active||!this.running){this.lastNow=now;return;}if(this.lastNow===null){this.lastNow=now;return;}
  const dt=Math.min(.12,Math.max(0,(now-this.lastNow)/1000))*this.speed;this.lastNow=now;this.elapsed+=dt;
  const cycle=10,cycleIndex=Math.floor(this.elapsed/cycle),p=(this.elapsed%cycle)/cycle;
  const close=smooth(p,.30,.39),open=smooth(p,.61,.70),platenAmount=Math.max(0,close-open),dwell=p>=.39&&p<=.61;
  const indexing=transportIsIndexing(p),transport=transportProgress(p),foilAdvance=p>.72&&p<.88,platenMotion=(p>.30&&p<.39)||(p>.61&&p<.70);
  if(this.lower&&this.lowerRest)this.lower.position.y=this.lowerRest.y+platenAmount*.25;
  this.transportIndexing=indexing;this.transportStopped=!indexing;this.platenClosing=p>.30&&p<.39;this.platenClosed=platenAmount>.92;this.pressureDwell=dwell;this.platenOpening=p>.61&&p<.70;this.heaterReady=true;this.stampingContact=dwell&&this.platenClosed;this.foilAdvancing=foilAdvance;this.wasteRewinding=foilAdvance;this.gripperReleaseActive=p>.88;
  this.updateHeaters();this.updateRotors(dt,p,indexing,platenMotion,foilAdvance);this.updateFeeder(p);this.updateGrippers(transport);this.updateSheets(cycleIndex,transport);this.onUpdate?.(this.state());
 }
 stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.heaterReady=false;this.resetMechanisms();for(const s of this.sheets){s.mesh.visible=false;s.lap=-1;}for(const p of this.stack)p.visible=false;this.pathLine.visible=false;this.onUpdate?.(this.state());return this.state();}
 dispose(){this.stop();for(const s of this.sheets){this.root.remove(s.mesh);s.mesh.geometry.dispose();s.mesh.material.dispose();}for(const p of this.stack){this.root.remove(p);p.geometry.dispose();p.material.dispose();}this.root.remove(this.pathLine);this.pathLine.geometry.dispose();this.pathLine.material.dispose();}
}
