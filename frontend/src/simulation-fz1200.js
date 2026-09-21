import * as THREE from 'three';

export const FZ1200_SIMULATION_STAGES=Object.freeze([
 'Load pile','Clamp pile','Lift to turning clearance','Turn pile 180°',
 'Air separation / dust removal','Jog / align','Stabilize turned pile','Lower and release for unloading'
]);
const Y_AXIS=new THREE.Vector3(0,1,0),Z_AXIS=new THREE.Vector3(0,0,1);
const clamp01=v=>Math.max(0,Math.min(1,v));
const smooth=(v,a,b)=>THREE.MathUtils.smoothstep(v,a,b);

export class FZ1200ProcessSimulation{
 constructor(root,template){
  this.root=root;this.template=template;this.active=false;this.running=false;this.paused=false;this.speed=1;this.elapsed=0;this.lastNow=null;this.completed=0;this.onUpdate=null;
  this.clamp=template.findNode('fz1200-clamp');this.upper=template.findNode('fz1200-clamp-upper');this.yoke=template.findNode('fz1200-turn-yoke');this.pile=template.findNode('fz1200-pile');
  this.rotors=[];this.nozzles=[];this.joggers=[];root.traverse(o=>{if(o.isMesh&&o.userData.rotor)this.rotors.push(o);if(o.isMesh&&o.userData.airNozzle)this.nozzles.push(o);if(o.isMesh&&o.userData.jogger)this.joggers.push(o);});
  this.rest={
   clampPosition:this.clamp?.position.clone(),clampQuaternion:this.clamp?.quaternion.clone(),
   yokePosition:this.yoke?.position.clone(),yokeQuaternion:this.yoke?.quaternion.clone(),
   upperPosition:this.upper?.position.clone(),
   rotorQuaternion:this.rotors.map(r=>r.quaternion.clone()),
   joggerPosition:this.joggers.map(j=>j.position.clone())
  };
  this.pathVisible=false;this.inkFlowVisible=false;this.turnAngleDeg=0;this.clamped=false;this.liftActive=false;this.turningActive=false;this.airingActive=false;this.joggingActive=false;this.hydraulicActive=false;
  this.buildAirJets();
 }
 buildAirJets(){
  this.airJetGroup=new THREE.Group();this.airJetGroup.name='FZ1200-AIR-JETS-REFERENCE';this.root.add(this.airJetGroup);this.airJets=[];
  this.jetGeometry=new THREE.ConeGeometry(.035,.46,12,1,true);this.jetMaterial=new THREE.MeshStandardMaterial({color:0x7ac5df,emissive:0x3d7e96,emissiveIntensity:.4,transparent:true,opacity:.26,depthWrite:false});
  for(const z of [-.44,-.22,0,.22,.44]){const jet=new THREE.Mesh(this.jetGeometry,this.jetMaterial.clone());jet.rotation.z=-Math.PI/2;jet.position.set(-.48,1.28,z);jet.visible=false;jet.userData.processReference='air-separation';this.airJetGroup.add(jet);this.airJets.push(jet);}
 }
 state(){
  const progress=this.active?(this.elapsed%12)/12:0,index=Math.min(FZ1200_SIMULATION_STAGES.length-1,Math.floor(progress*FZ1200_SIMULATION_STAGES.length));
  return {available:true,blocked:false,active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:FZ1200_SIMULATION_STAGES[index],completed:this.completed,progress,
   mechanismCount:this.rotors.length+this.joggers.length+this.airJets.length+3,rotorCount:this.rotors.length,oscillatorCount:this.joggers.length,airJetCount:this.airJets.filter(j=>j.visible).length,
   clamped:this.clamped,liftActive:this.liftActive,turningActive:this.turningActive,turnAngleDeg:this.turnAngleDeg,airingActive:this.airingActive,joggingActive:this.joggingActive,hydraulicActive:this.hydraulicActive,interlocks:{clampSecured:!!this.clamped,liftClearance:!!this.liftClearance,turnPermitted:!!this.turnPermitted,airPermitted:!!this.airPermitted},
   sheetsVisible:this.active?1:0,pileSheetsVisible:this.active?1:0,pathVisible:false,inkFlowVisible:false,inkFlowCount:0,uvLampCount:0,uvActive:false};
 }
 start(){this.active=true;this.running=true;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.resetMechanisms();this.onUpdate?.(this.state());return this.state();}
 pause(){this.running=false;this.paused=this.active;this.onUpdate?.(this.state());return this.state();}
 resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;}this.onUpdate?.(this.state());return this.state();}
 setSpeed(v){this.speed=Math.max(.25,Math.min(3,Number(v)||1));return this.state();}
 setPathVisible(){this.pathVisible=false;return this.state();}
 setInkFlowVisible(){this.inkFlowVisible=false;return this.state();}
 resetMechanisms(){
  if(this.clamp){this.clamp.position.copy(this.rest.clampPosition);this.clamp.quaternion.copy(this.rest.clampQuaternion);}
  if(this.yoke){this.yoke.position.copy(this.rest.yokePosition);this.yoke.quaternion.copy(this.rest.yokeQuaternion);}
  if(this.upper)this.upper.position.copy(this.rest.upperPosition);
  this.rotors.forEach((r,i)=>r.quaternion.copy(this.rest.rotorQuaternion[i]));this.joggers.forEach((j,i)=>j.position.copy(this.rest.joggerPosition[i]));
  for(const jet of this.airJets){jet.visible=false;jet.material.opacity=.26;}
  this.turnAngleDeg=0;this.clamped=this.liftActive=this.turningActive=this.airingActive=this.joggingActive=this.hydraulicActive=this.liftClearance=this.turnPermitted=this.airPermitted=false;
 }
 spinActiveRotors(dt,phase,air,jog,hyd){
  for(const r of this.rotors){const role=String(r.userData.mechanismRole||''),turnDrive=/^(trunnion-shaft|rotation-gear)$/.test(role)&&phase>.28&&phase<.51,move=turnDrive||role==='blower'&&air||role==='vibration'&&jog||role==='hyd-pump'&&hyd;if(!move)continue;const dir=r.userData.spinDirection||1,rate=role==='blower'?9:role==='vibration'?11:role==='hyd-pump'?6:4.4,q=new THREE.Quaternion().setFromAxisAngle(Y_AXIS,dir*rate*dt);r.quaternion.multiply(q).normalize();}
 }
 update(now){
  if(!this.active||!this.running){this.lastNow=now;return;}if(this.lastNow===null){this.lastNow=now;return;}
  const dt=Math.min(.12,Math.max(0,(now-this.lastNow)/1000))*this.speed;this.lastNow=now;this.elapsed+=dt;
  const cycle=12,cycleIndex=Math.floor(this.elapsed/cycle),phase=(this.elapsed%cycle)/cycle;
  const clampProfile=smooth(phase,.10,.19)*(1-smooth(phase,.90,.98)),lift=smooth(phase,.20,.30)*(1-smooth(phase,.80,.91));
  const clampSecured=clampProfile>.94,liftClearance=lift>.82,turnPermitted=clampSecured&&liftClearance;
  const requestedTurn=smooth(phase,.31,.50),turn=turnPermitted?requestedTurn:0,turnComplete=turn>.985;
  const airPermitted=clampSecured&&turnComplete,air=airPermitted&&phase>.50&&phase<.69,jog=airPermitted&&phase>.59&&phase<.78,hyd=clampProfile>.02||lift>.02||turn>0;
  const totalTurn=(cycleIndex+turn)*Math.PI,qTurn=new THREE.Quaternion().setFromAxisAngle(Z_AXIS,totalTurn);
  if(this.upper)this.upper.position.y=this.rest.upperPosition.y-.47*clampProfile;
  if(this.clamp){this.clamp.position.copy(this.rest.clampPosition);this.clamp.position.y+=.15*lift;this.clamp.quaternion.copy(this.rest.clampQuaternion).multiply(qTurn);}
  if(this.yoke){this.yoke.position.copy(this.rest.yokePosition);this.yoke.position.y+=.15*lift;this.yoke.quaternion.copy(this.rest.yokeQuaternion).multiply(qTurn);}
  const pulse=(Math.sin(this.elapsed*24)+1)*.5*.028;
  this.joggers.forEach((j,i)=>{const r=this.rest.joggerPosition[i];j.position.copy(r);if(jog){if(j.userData.jogAxis==='z')j.position.z=r.z-Math.sign(r.z||1)*pulse;else j.position.x=r.x-Math.sign(r.x||1)*pulse;}});
  for(const [i,jet] of this.airJets.entries()){jet.visible=air;if(air)jet.material.opacity=.18+.16*(.5+.5*Math.sin(this.elapsed*11+i*.7));}
  this.spinActiveRotors(dt,phase,air,jog,hyd);
  this.completed=cycleIndex;this.clamped=clampSecured;this.liftActive=lift>.02;this.liftClearance=liftClearance;this.turnPermitted=turnPermitted;this.turningActive=turn>0&&turn<.999;this.turnAngleDeg=turn*180;this.airPermitted=airPermitted;this.airingActive=air;this.joggingActive=jog;this.hydraulicActive=hyd;
  this.onUpdate?.(this.state());
 }
 stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.resetMechanisms();this.onUpdate?.(this.state());return this.state();}
 dispose(){this.stop();for(const jet of this.airJets)jet.material.dispose();this.jetGeometry.dispose();this.airJetGroup.removeFromParent();}
}
