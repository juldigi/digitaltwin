import * as THREE from 'three';

export const MK1060_SIMULATION_STAGES=Object.freeze([
 'Pile separation','Feed table / registration','Intermittent gripper index to platen',
 'Platen close and pressure dwell','Index to stripping','Double-action stripping',
 'Index to blanking','Blank separation','Index to delivery','Edge-waste / product delivery'
]);
const Y_AXIS=new THREE.Vector3(0,1,0);
const smooth=(v,a,b)=>THREE.MathUtils.smoothstep(v,a,b);
const lerp=(a,b,t)=>THREE.MathUtils.lerp(a,b,Math.max(0,Math.min(1,t)));

function transportProgress(p){
 if(p<.20)return lerp(0,.18,p/.20);
 if(p<.31)return lerp(.18,.34,(p-.20)/.11);
 if(p<.48)return .34;
 if(p<.57)return lerp(.34,.55,(p-.48)/.09);
 if(p<.71)return .55;
 if(p<.79)return lerp(.55,.75,(p-.71)/.08);
 if(p<.93)return .75;
 return lerp(.75,1,(p-.93)/.07);
}
function transportIsIndexing(p){return p<.31||(p>=.48&&p<.57)||(p>=.71&&p<.79)||p>=.93;}
function gripperLoopPosition(t){
 t=((t%1)+1)%1;
 if(t<.42)return {x:lerp(-2.25,2.55,t/.42),y:1.35};
 if(t<.52)return {x:2.55,y:lerp(1.35,1.02,(t-.42)/.10)};
 if(t<.90)return {x:lerp(2.55,-2.25,(t-.52)/.38),y:1.02};
 return {x:-2.25,y:lerp(1.02,1.35,(t-.90)/.10)};
}

export class MK1060ProcessSimulation{
 constructor(root,template){
  this.root=root;this.template=template;this.active=false;this.running=false;this.paused=false;this.speed=1;this.completed=0;this.elapsed=0;this.lastNow=null;this.onUpdate=null;
  this.rotors=[];this.suckers=[];this.gripperBars=[];this.sheets=[];this.blankStack=[];this.wastePieces=[];
  this.lower=template.findNode('mk1060-platen-lower');this.stripUpper=template.findNode('mk1060-strip-upper');this.stripLower=template.findNode('mk1060-strip-lower');
  this.blankUpper=template.findNode('mk1060-blank-upper');this.blankLower=template.findNode('mk1060-blank-lower');this.feederHead=template.findNode('mk1060-feeder-head');
  this.restY={lower:this.lower?.position.y||0,su:this.stripUpper?.position.y||0,sl:this.stripLower?.position.y||0,bu:this.blankUpper?.position.y||0,bl:this.blankLower?.position.y||0};
  root.traverse(o=>{if(o.isMesh&&o.userData.rotor)this.rotors.push(o);if(o.isMesh&&o.userData.reciprocator)this.suckers.push(o);if(o.userData.gripperBar)this.gripperBars.push(o);});
  this.rotorRest=this.rotors.map(r=>r.quaternion.clone());this.suckerRest=this.suckers.map(s=>s.position.clone());this.barRest=this.gripperBars.map(b=>b.position.clone());this.headRest=this.feederHead?.position.clone()||null;
  this.points=[[-3.26,1.34,0],[-2.35,1.15,0],[-1.55,1.17,0],[-.75,1.48,0],[.65,1.46,0],[1.75,1.46,0],[2.62,.84,0],[3.08,.78,0]].map(p=>new THREE.Vector3(...p));
  this.curve=new THREE.CatmullRomCurve3(this.points,false,'centripetal');
  const pathGeo=new THREE.BufferGeometry().setFromPoints(this.curve.getPoints(180)),pathMat=new THREE.LineDashedMaterial({color:0x528a9d,dashSize:.065,gapSize:.045,transparent:true,opacity:.55});
  this.pathLine=new THREE.Line(pathGeo,pathMat);this.pathLine.computeLineDistances();this.pathLine.visible=false;this.pathLine.name='MK1060-INTERMITTENT-SHEET-PATH';root.add(this.pathLine);
  const mat=new THREE.MeshStandardMaterial({color:0xefe8d3,roughness:.88,side:THREE.DoubleSide});
  for(let i=0;i<7;i++){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.02,.72),mat.clone());mesh.rotation.x=-Math.PI/2;mesh.visible=false;root.add(mesh);this.sheets.push({mesh,phase:i/7,lap:-1});}
  for(let i=0;i<20;i++){const blank=new THREE.Mesh(new THREE.BoxGeometry(.50,.006,.30),mat.clone());blank.visible=false;root.add(blank);this.blankStack.push(blank);const waste=new THREE.Mesh(new THREE.BoxGeometry(.98,.012,.07),new THREE.MeshStandardMaterial({color:0xb4966d,roughness:.9}));waste.visible=false;root.add(waste);this.wastePieces.push(waste);}
  this.pathVisible=false;this.inkFlowVisible=false;this.resetStateFlags();
 }
 resetStateFlags(){this.transportIndexing=false;this.transportStopped=false;this.feederSuctionActive=false;this.platenClosed=false;this.pressureDwell=false;this.strippingActive=false;this.blankingActive=false;this.wasteConveyorActive=false;}
 state(){
  const p=this.active?(this.elapsed%11.5)/11.5:0,index=Math.min(MK1060_SIMULATION_STAGES.length-1,Math.floor(p*MK1060_SIMULATION_STAGES.length));
  return {available:true,blocked:false,active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:MK1060_SIMULATION_STAGES[index],completed:this.completed,progress:p,
   sheetsVisible:this.sheets.filter(s=>s.mesh.visible).length,pileSheetsVisible:this.blankStack.filter(s=>s.visible).length,wastePiecesVisible:this.wastePieces.filter(s=>s.visible).length,
   rotorCount:this.rotors.length,oscillatorCount:this.suckers.length,mechanismCount:this.rotors.length+this.suckers.length+this.gripperBars.length+5,pathVisible:this.pathVisible,inkFlowVisible:false,inkFlowCount:0,uvLampCount:0,uvActive:false,
   transportIndexing:this.transportIndexing,transportStopped:this.transportStopped,feederSuctionActive:this.feederSuctionActive,platenClosed:this.platenClosed,pressureDwell:this.pressureDwell,
   strippingActive:this.strippingActive,blankingActive:this.blankingActive,wasteConveyorActive:this.wasteConveyorActive,
   interlocks:{platenDwellRequiresStoppedTransport:this.platenClosed?!this.transportIndexing:true,strippingRequiresStoppedTransport:this.strippingActive?!this.transportIndexing:true,blankingRequiresStoppedTransport:this.blankingActive?!this.transportIndexing:true}};
 }
 start(){this.active=true;this.running=true;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;for(const s of this.sheets)s.lap=-1;this.resetMechanisms();this.onUpdate?.(this.state());return this.state();}
 pause(){this.running=false;this.paused=this.active;this.onUpdate?.(this.state());return this.state();}
 resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;}this.onUpdate?.(this.state());return this.state();}
 setSpeed(v){this.speed=Math.max(.25,Math.min(4,Number(v)||1));return this.state();}
 setPathVisible(v){this.pathVisible=!!v;this.pathLine.visible=this.pathVisible;return this.state();}
 setInkFlowVisible(){return this.state();}
 resetMechanisms(){
  if(this.lower)this.lower.position.y=this.restY.lower;if(this.stripUpper)this.stripUpper.position.y=this.restY.su;if(this.stripLower)this.stripLower.position.y=this.restY.sl;
  if(this.blankUpper)this.blankUpper.position.y=this.restY.bu;if(this.blankLower)this.blankLower.position.y=this.restY.bl;if(this.feederHead&&this.headRest)this.feederHead.position.copy(this.headRest);
  this.rotors.forEach((r,i)=>r.quaternion.copy(this.rotorRest[i]));this.suckers.forEach((s,i)=>s.position.copy(this.suckerRest[i]));this.gripperBars.forEach((b,i)=>b.position.copy(this.barRest[i]));this.resetStateFlags();
 }
 spinRotor(r,dt,rate){const q=new THREE.Quaternion().setFromAxisAngle(Y_AXIS,(r.userData.spinDirection||1)*rate*dt);r.quaternion.multiply(q).normalize();}
 updateRotors(dt,p,indexing,cut,strip,waste){
  for(const r of this.rotors){const role=String(r.userData.mechanismRole||'');let move=false,rate=4.2;
   if(role==='main-motor'||role==='flywheel'){move=true;rate=6.2;}else if(['chain-sprocket','torque-limiter','clutch','feed-wheel'].includes(role)){move=indexing;rate=5.6;}else if(role==='pressure-eccentric'){move=cut>.02;rate=3.4;}else if(role==='strip-cam'){move=strip>.02;rate=3.8;}else if(role==='waste-release'||role==='waste-conveyor'){move=waste;rate=4.8;}else if(role==='pile-lift'){move=p<.16;rate=2.4;}
   if(move)this.spinRotor(r,dt,rate);
  }
 }
 updateFeeder(p){
  const active=p<.20,local=Math.min(1,p/.20);this.feederSuctionActive=active;
  if(this.feederHead&&this.headRest){this.feederHead.position.copy(this.headRest);if(active){this.feederHead.position.y-=.045*Math.sin(Math.PI*local);this.feederHead.position.x+=.035*Math.sin(Math.PI*local);}}
  this.suckers.forEach((s,i)=>{s.position.copy(this.suckerRest[i]);if(active)s.position.y-=.018*Math.sin(Math.PI*local);});
 }
 updateGrippers(globalTransport){
  for(const bar of this.gripperBars){const q=gripperLoopPosition(globalTransport+(bar.userData.barPhase||0));bar.position.set(q.x,q.y,0);}
 }
 updateSheets(cycleIndex,transport){
  const global=cycleIndex+transport;
  for(const s of this.sheets){const raw=global+s.phase,t=((raw%1)+1)%1;s.mesh.visible=true;s.mesh.position.copy(this.curve.getPointAt(Math.min(.999,t)));s.mesh.rotation.set(-Math.PI/2,0,0);
   if(t>.52&&t<.72)s.mesh.material.color.setHex(this.strippingActive?0xd6c29b:0xe9dfc7);else if(t>.72)s.mesh.material.color.setHex(0xdcc79e);else s.mesh.material.color.setHex(0xefe8d3);
   const lap=Math.floor(raw);if(lap>s.lap){if(s.lap>=0){this.completed++;const idx=(this.completed-1)%this.blankStack.length,b=this.blankStack[idx],w=this.wastePieces[idx];b.visible=true;b.position.set(3.04,.47+idx*.007,-.24);w.visible=true;w.position.set(2.62,.58+idx*.003,.56);}s.lap=lap;}
  }
 }
 update(now){
  if(!this.active||!this.running){this.lastNow=now;return;}if(this.lastNow===null){this.lastNow=now;return;}
  const dt=Math.min(.12,Math.max(0,(now-this.lastNow)/1000))*this.speed;this.lastNow=now;this.elapsed+=dt;
  const cycle=11.5,cycleIndex=Math.floor(this.elapsed/cycle),p=(this.elapsed%cycle)/cycle;
  const cut=smooth(p,.31,.37)*(1-smooth(p,.43,.48)),strip=smooth(p,.57,.61)*(1-smooth(p,.67,.71)),blank=smooth(p,.79,.83)*(1-smooth(p,.89,.93));
  const indexing=transportIsIndexing(p),transport=transportProgress(p),waste=p>.93||p<.08,dwell=p>=.37&&p<=.43;
  if(this.lower)this.lower.position.y=this.restY.lower+cut*.25;if(this.stripUpper)this.stripUpper.position.y=this.restY.su-strip*.12;if(this.stripLower)this.stripLower.position.y=this.restY.sl+strip*.10;
  if(this.blankUpper)this.blankUpper.position.y=this.restY.bu-blank*.14;if(this.blankLower)this.blankLower.position.y=this.restY.bl+blank*.08;
  this.transportIndexing=indexing;this.transportStopped=!indexing;this.platenClosed=cut>.82;this.pressureDwell=dwell;this.strippingActive=strip>.32;this.blankingActive=blank>.32;this.wasteConveyorActive=waste;
  this.updateRotors(dt,p,indexing,cut,strip,waste);this.updateFeeder(p);this.updateGrippers(transport);this.updateSheets(cycleIndex,transport);this.onUpdate?.(this.state());
 }
 stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.resetMechanisms();for(const s of this.sheets){s.mesh.visible=false;s.lap=-1;}for(const b of this.blankStack)b.visible=false;for(const w of this.wastePieces)w.visible=false;this.pathLine.visible=false;this.onUpdate?.(this.state());return this.state();}
 dispose(){this.stop();for(const s of this.sheets){this.root.remove(s.mesh);s.mesh.geometry.dispose();s.mesh.material.dispose();}for(const b of this.blankStack){this.root.remove(b);b.geometry.dispose();b.material.dispose();}for(const w of this.wastePieces){this.root.remove(w);w.geometry.dispose();w.material.dispose();}this.root.remove(this.pathLine);this.pathLine.geometry.dispose();this.pathLine.material.dispose();}
}
