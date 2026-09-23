import * as THREE from 'three';

export const PROMATRIX106_SIMULATION_STAGES=Object.freeze([
 'Pile separation','Suction-belt feed / registration','Registered gripper index to cutting',
 'Cutting pressure dwell','Index to stripping','Stripping action',
 'Index to blanking','Blanking / tie-sheet demo','Index to delivery','Auto-Non-Stop delivery'
]);
const Y_AXIS=new THREE.Vector3(0,1,0);
const smooth=(v,a,b)=>THREE.MathUtils.smoothstep(v,a,b);
const lerp=(a,b,t)=>THREE.MathUtils.lerp(a,b,Math.max(0,Math.min(1,t)));

function transportProgress(p){
 if(p<.20)return lerp(0,.18,p/.20);
 if(p<.31)return lerp(.18,.34,(p-.20)/.11);
 if(p<.48)return .34;
 if(p<.56)return lerp(.34,.55,(p-.48)/.08);
 if(p<.71)return .55;
 if(p<.78)return lerp(.55,.75,(p-.71)/.07);
 if(p<.93)return .75;
 return lerp(.75,1,(p-.93)/.07);
}
function transportIsIndexing(p){return p<.31||(p>=.48&&p<.56)||(p>=.71&&p<.78)||p>=.93;}
function gripperLoopPosition(t){
 t=((t%1)+1)%1;
 if(t<.42)return {x:lerp(-2.35,3.38,t/.42),y:1.37};
 if(t<.52)return {x:3.38,y:lerp(1.37,1.04,(t-.42)/.10)};
 if(t<.90)return {x:lerp(3.38,-2.35,(t-.52)/.38),y:1.04};
 return {x:-2.35,y:lerp(1.04,1.37,(t-.90)/.10)};
}

export class Promatrix106ProcessSimulation{
 constructor(root,template){
  this.root=root;this.template=template;this.active=false;this.running=false;this.paused=false;this.speed=1;this.completed=0;this.elapsed=0;this.lastNow=null;this.onUpdate=null;
  this.rotors=[];this.suckers=[];this.gripperBars=[];this.sheets=[];this.productStack=[];this.waste=[];this.tieSheets=[];
  this.cutPlate=template.findNode('pm106-cut-plate');this.stripTop=template.findNode('pm106-strip-top');this.stripMiddle=template.findNode('pm106-strip-middle');this.stripBottom=template.findNode('pm106-strip-bottom');
  this.blankTop=template.findNode('pm106-blank-top');this.blankBottom=template.findNode('pm106-blank-bottom');this.rake=template.findNode('pm106-delivery-rake');this.feederHead=template.findNode('pm106-feeder-head');this.deliveryPallet=template.findNode('pm106-delivery-pallet');
  this.rest={cut:this.cutPlate?.position.clone(),st:this.stripTop?.position.clone(),sm:this.stripMiddle?.position.clone(),sb:this.stripBottom?.position.clone(),bt:this.blankTop?.position.clone(),bb:this.blankBottom?.position.clone(),rake:this.rake?.position.clone(),head:this.feederHead?.position.clone()};
  root.traverse(o=>{if(o.isMesh&&o.userData.rotor)this.rotors.push(o);if(o.isMesh&&o.userData.reciprocator)this.suckers.push(o);if(o.userData.gripperBar)this.gripperBars.push(o);});
  this.rotorRest=this.rotors.map(r=>r.quaternion.clone());this.suckerRest=this.suckers.map(s=>s.position.clone());this.barRest=this.gripperBars.map(b=>b.position.clone());
  this.points=[[-4.48,1.37,0],[-3.55,1.17,0],[-2.63,1.18,0],[-1.38,1.49,0],[.42,1.48,0],[2.17,1.48,0],[3.66,.91,0]].map(p=>new THREE.Vector3(...p));
  this.curve=new THREE.CatmullRomCurve3(this.points,false,'centripetal');
  const pathGeo=new THREE.BufferGeometry().setFromPoints(this.curve.getPoints(180)),pathMat=new THREE.LineDashedMaterial({color:0x537f92,dashSize:.065,gapSize:.045,transparent:true,opacity:.55});
  this.pathLine=new THREE.Line(pathGeo,pathMat);this.pathLine.computeLineDistances();this.pathLine.visible=false;this.pathLine.name='PROMATRIX106-REGISTERED-INTERMITTENT-PATH';root.add(this.pathLine);
  const mat=new THREE.MeshStandardMaterial({color:0xeee7d3,roughness:.88,side:THREE.DoubleSide});
  for(let i=0;i<7;i++){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.02,.72),mat.clone());mesh.rotation.x=-Math.PI/2;mesh.visible=false;root.add(mesh);this.sheets.push({mesh,phase:i/7,lap:-1});}
  for(let i=0;i<18;i++){
   const prod=new THREE.Mesh(new THREE.BoxGeometry(.50,.006,.31),mat.clone());prod.visible=false;root.add(prod);this.productStack.push(prod);
   const waste=new THREE.Mesh(new THREE.BoxGeometry(.98,.012,.07),new THREE.MeshStandardMaterial({color:0xb69b73,roughness:.9}));waste.visible=false;root.add(waste);this.waste.push(waste);
   const tie=new THREE.Mesh(new THREE.BoxGeometry(.96,.004,.66),new THREE.MeshStandardMaterial({color:0xe8edf0,roughness:.75,transparent:true,opacity:.88}));tie.visible=false;tie.userData.demoTieSheet=true;root.add(tie);this.tieSheets.push(tie);
  }
  this.deliveryAnchor=new THREE.Vector3(3.96,.79,0);this.refreshDeliveryAnchor();this.pathVisible=false;this.inkFlowVisible=false;this.resetStateFlags();
 }
 refreshDeliveryAnchor(){if(!this.deliveryPallet)return;this.root.updateMatrixWorld(true);this.deliveryPallet.updateWorldMatrix(true,true);const box=new THREE.Box3().setFromObject(this.deliveryPallet);if(box.isEmpty())return;const p=new THREE.Vector3((box.min.x+box.max.x)/2,box.max.y,(box.min.z+box.max.z)/2);this.root.worldToLocal(p);this.deliveryAnchor.copy(p);}
 resetStateFlags(){this.transportIndexing=false;this.transportStopped=false;this.feederSuctionActive=false;this.cuttingActive=false;this.pressureDwell=false;this.strippingActive=false;this.blankingActive=false;this.deliveryRakeActive=false;this.tieSheetActive=false;}
 state(){
  const p=this.active?(this.elapsed%10.8)/10.8:0,index=Math.min(PROMATRIX106_SIMULATION_STAGES.length-1,Math.floor(p*PROMATRIX106_SIMULATION_STAGES.length));
  return {available:true,blocked:false,active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:PROMATRIX106_SIMULATION_STAGES[index],completed:this.completed,progress:p,
   sheetsVisible:this.sheets.filter(s=>s.mesh.visible).length,pileSheetsVisible:this.productStack.filter(s=>s.visible).length,wastePiecesVisible:this.waste.filter(s=>s.visible).length,
   rotorCount:this.rotors.length,oscillatorCount:this.suckers.length,mechanismCount:this.rotors.length+this.suckers.length+this.gripperBars.length+7,pathVisible:this.pathVisible,inkFlowVisible:false,inkFlowCount:0,uvLampCount:0,uvActive:false,
   transportIndexing:this.transportIndexing,transportStopped:this.transportStopped,feederSuctionActive:this.feederSuctionActive,cuttingActive:this.cuttingActive,pressureDwell:this.pressureDwell,
   strippingActive:this.strippingActive,blankingActive:this.blankingActive,deliveryRakeActive:this.deliveryRakeActive,tieSheetActive:this.tieSheetActive,tieSheetDemoOnly:true,tieSheetsVisible:this.tieSheets.filter(t=>t.visible).length,
   interlocks:{cutRequiresRegisteredStop:this.cuttingActive?!this.transportIndexing:true,strippingRequiresRegisteredStop:this.strippingActive?!this.transportIndexing:true,blankingRequiresRegisteredStop:this.blankingActive?!this.transportIndexing:true}};
 }
 start(){this.refreshDeliveryAnchor();this.active=true;this.running=true;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;for(const s of this.sheets)s.lap=-1;this.resetMechanisms();this.onUpdate?.(this.state());return this.state();}
 pause(){this.running=false;this.paused=this.active;this.onUpdate?.(this.state());return this.state();}
 resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;}this.onUpdate?.(this.state());return this.state();}
 setSpeed(v){this.speed=Math.max(.25,Math.min(4,Number(v)||1));return this.state();}
 setPathVisible(v){this.pathVisible=!!v;this.pathLine.visible=this.pathVisible;return this.state();}
 setInkFlowVisible(){return this.state();}
 resetMechanisms(){
  const copy=(o,p)=>{if(o&&p)o.position.copy(p);};copy(this.cutPlate,this.rest.cut);copy(this.stripTop,this.rest.st);copy(this.stripMiddle,this.rest.sm);copy(this.stripBottom,this.rest.sb);copy(this.blankTop,this.rest.bt);copy(this.blankBottom,this.rest.bb);copy(this.rake,this.rest.rake);copy(this.feederHead,this.rest.head);
  this.rotors.forEach((r,i)=>r.quaternion.copy(this.rotorRest[i]));this.suckers.forEach((s,i)=>s.position.copy(this.suckerRest[i]));this.gripperBars.forEach((b,i)=>b.position.copy(this.barRest[i]));this.resetStateFlags();
 }
 spin(r,dt,rate){const q=new THREE.Quaternion().setFromAxisAngle(Y_AXIS,(r.userData.spinDirection||1)*rate*dt);r.quaternion.multiply(q).normalize();}
 updateRotors(dt,p,indexing,cut,delivery){
  for(const r of this.rotors){const role=String(r.userData.mechanismRole||'');let move=false,rate=4.2;
   if(role==='main-motor'||role==='flywheel'){move=true;rate=6.3;}else if(role==='chain-sprocket'||role==='feed-brush'){move=indexing;rate=5.8;}else if(role==='pressure-eccentric'){move=cut>.02;rate=3.5;}else if(role==='pallet-lift'){move=delivery;rate=2.5;}else if(role==='pile-lift'){move=p<.16;rate=2.5;}
   if(move)this.spin(r,dt,rate);
  }
 }
 updateFeeder(p){const active=p<.20,local=Math.min(1,p/.20);this.feederSuctionActive=active;if(this.feederHead&&this.rest.head){this.feederHead.position.copy(this.rest.head);if(active){this.feederHead.position.y-=.045*Math.sin(Math.PI*local);this.feederHead.position.x+=.035*Math.sin(Math.PI*local);}}this.suckers.forEach((s,i)=>{s.position.copy(this.suckerRest[i]);if(active)s.position.y-=.018*Math.sin(Math.PI*local);});}
 updateGrippers(globalTransport){for(const bar of this.gripperBars){const q=gripperLoopPosition(globalTransport+(bar.userData.barPhase||0));bar.position.set(q.x,q.y,0);}}
 updateRake(p){const delivery=p>.93||p<.08;this.deliveryRakeActive=delivery;if(this.rake&&this.rest.rake){this.rake.position.copy(this.rest.rake);if(delivery){const local=p>.93?(p-.93)/.07:p/.08;this.rake.position.x+=.22*Math.sin(Math.PI*Math.min(1,local));}}return delivery;}
 outputSheet(){
  this.completed++;const idx=(this.completed-1)%this.productStack.length,p=this.productStack[idx],w=this.waste[idx];p.visible=true;p.position.set(this.deliveryAnchor.x,this.deliveryAnchor.y+idx*.007,this.deliveryAnchor.z);w.visible=true;w.position.set(this.deliveryAnchor.x-.46,this.deliveryAnchor.y+.12+idx*.003,this.deliveryAnchor.z+.58);
  if(this.completed%6===0){const tie=this.tieSheets[idx];tie.visible=true;tie.position.set(this.deliveryAnchor.x,this.deliveryAnchor.y+.005+idx*.007,this.deliveryAnchor.z);this.tieSheetActive=true;}
 }
 updateSheets(cycleIndex,transport){
  const global=cycleIndex+transport;
  for(const s of this.sheets){const raw=global+s.phase,t=((raw%1)+1)%1;s.mesh.visible=true;s.mesh.position.copy(this.curve.getPointAt(Math.min(.999,t)));s.mesh.rotation.set(-Math.PI/2,0,0);
   if(t>.52&&t<.74)s.mesh.material.color.setHex(this.strippingActive?0xd5c19a:0xeadfc6);else if(t>.74)s.mesh.material.color.setHex(0xdcc69b);else s.mesh.material.color.setHex(0xeee7d3);
   const lap=Math.floor(raw);if(lap>s.lap){if(s.lap>=0)this.outputSheet();s.lap=lap;}
  }
 }
 update(now){
  if(!this.active||!this.running){this.lastNow=now;return;}if(this.lastNow===null){this.lastNow=now;return;}
  const dt=Math.min(.12,Math.max(0,(now-this.lastNow)/1000))*this.speed;this.lastNow=now;this.elapsed+=dt;
  const cycle=10.8,cycleIndex=Math.floor(this.elapsed/cycle),p=(this.elapsed%cycle)/cycle;
  const cut=smooth(p,.31,.36)*(1-smooth(p,.43,.48)),strip=smooth(p,.56,.60)*(1-smooth(p,.67,.71)),blank=smooth(p,.78,.82)*(1-smooth(p,.89,.93));
  const indexing=transportIsIndexing(p),transport=transportProgress(p),delivery=this.updateRake(p);
  if(this.cutPlate)this.cutPlate.position.y=this.rest.cut.y+cut*.25;if(this.stripTop)this.stripTop.position.y=this.rest.st.y-strip*.12;if(this.stripMiddle)this.stripMiddle.position.y=this.rest.sm.y+strip*.035;if(this.stripBottom)this.stripBottom.position.y=this.rest.sb.y+strip*.09;
  if(this.blankTop)this.blankTop.position.y=this.rest.bt.y-blank*.14;if(this.blankBottom)this.blankBottom.position.y=this.rest.bb.y+blank*.08;
  this.transportIndexing=indexing;this.transportStopped=!indexing;this.cuttingActive=cut>.82;this.pressureDwell=p>=.36&&p<=.43;this.strippingActive=strip>.30;this.blankingActive=blank>.30;this.tieSheetActive=false;
  this.updateRotors(dt,p,indexing,cut,delivery);this.updateFeeder(p);this.updateGrippers(transport);this.updateSheets(cycleIndex,transport);this.onUpdate?.(this.state());
 }
 stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.resetMechanisms();for(const s of this.sheets){s.mesh.visible=false;s.lap=-1;}for(const p of this.productStack)p.visible=false;for(const w of this.waste)w.visible=false;for(const t of this.tieSheets)t.visible=false;this.pathLine.visible=false;this.onUpdate?.(this.state());return this.state();}
 dispose(){this.stop();for(const s of this.sheets){this.root.remove(s.mesh);s.mesh.geometry.dispose();s.mesh.material.dispose();}for(const p of this.productStack){this.root.remove(p);p.geometry.dispose();p.material.dispose();}for(const w of this.waste){this.root.remove(w);w.geometry.dispose();w.material.dispose();}for(const t of this.tieSheets){this.root.remove(t);t.geometry.dispose();t.material.dispose();}this.root.remove(this.pathLine);this.pathLine.geometry.dispose();this.pathLine.material.dispose();}
}
