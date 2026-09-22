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
  this.rotors=[];this.nozzles=[];this.joggers=[];this.paperLayers=[];this.turnLockPin=null;this.turnLockSensor=null;this.guardSensors=[];
  root.traverse(o=>{if(o.isMesh&&o.userData.rotor)this.rotors.push(o);if(o.isMesh&&o.userData.airNozzle)this.nozzles.push(o);if(o.isMesh&&o.userData.jogger)this.joggers.push(o);if(o.isMesh&&o.userData.paperLayer)this.paperLayers.push(o);if(o.isMesh&&o.userData.turnLockPin)this.turnLockPin=o;if(o.isMesh&&o.userData.turnLockSensor)this.turnLockSensor=o;if(o.isMesh&&o.userData.mechanismRole==='guard-interlock-sensor-reference')this.guardSensors.push(o);});
  this.rest={
   clampPosition:this.clamp?.position.clone(),clampQuaternion:this.clamp?.quaternion.clone(),
   yokePosition:this.yoke?.position.clone(),yokeQuaternion:this.yoke?.quaternion.clone(),
   upperPosition:this.upper?.position.clone(),
   rotorQuaternion:this.rotors.map(r=>r.quaternion.clone()),
   joggerPosition:this.joggers.map(j=>j.position.clone()),
   paperLayerPosition:this.paperLayers.map(p=>p.position.clone()),
   turnLockPinPosition:this.turnLockPin?.position.clone()
  };
  this.pathVisible=false;this.inkFlowVisible=false;this.turnAngleDeg=0;this.pileLoaded=false;this.clamped=false;this.clampCommand=false;this.clampConfirmed=false;this.liftActive=false;this.liftClearance=false;this.turnPermitted=false;this.turningActive=false;this.turnComplete=false;this.turnLockCommand=false;this.turnLockConfirmed=false;this.airPermitted=false;this.airPressureReady=false;this.airingActive=false;this.joggingActive=false;this.alignmentComplete=false;this.loweringActive=false;this.releasePermit=false;this.unloadReady=false;this.guardInterlockSafe=true;this.interlockSafe=true;this.hydraulicActive=false;
  this.buildAirJets();
 }
 buildAirJets(){
  this.airJetGroup=new THREE.Group();this.airJetGroup.name='FZ1200-AIR-JETS-REFERENCE';this.root.add(this.airJetGroup);this.airJets=[];
  this.jetGeometry=new THREE.ConeGeometry(.035,.46,12,1,true);this.jetMaterial=new THREE.MeshStandardMaterial({color:0x7ac5df,emissive:0x3d7e96,emissiveIntensity:.4,transparent:true,opacity:.26,depthWrite:false});
  for(const z of [-.44,-.22,0,.22,.44]){const jet=new THREE.Mesh(this.jetGeometry,this.jetMaterial.clone());jet.rotation.z=-Math.PI/2;jet.position.set(-.48,1.28,z);jet.visible=false;jet.userData.processReference='air-separation';this.airJetGroup.add(jet);this.airJets.push(jet);}
 }
 state(){
  const progress=this.active?(this.elapsed%14)/14:0,index=Math.min(FZ1200_SIMULATION_STAGES.length-1,Math.floor(progress*FZ1200_SIMULATION_STAGES.length));
  return {available:true,blocked:false,active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:FZ1200_SIMULATION_STAGES[index],completed:this.completed,progress,
   mechanismCount:this.rotors.length+this.joggers.length+this.airJets.length+3,rotorCount:this.rotors.length,oscillatorCount:this.joggers.length,airJetCount:this.airJets.filter(j=>j.visible).length,
   pileLoaded:this.pileLoaded,clamped:this.clamped,clampCommand:this.clampCommand,clampConfirmed:this.clampConfirmed,liftActive:this.liftActive,liftClearance:this.liftClearance,turnPermitted:this.turnPermitted,turningActive:this.turningActive,turnComplete:this.turnComplete,turnAngleDeg:this.turnAngleDeg,turnLockCommand:this.turnLockCommand,turnLockConfirmed:this.turnLockConfirmed,airPermitted:this.airPermitted,airPressureReady:this.airPressureReady,airingActive:this.airingActive,joggingActive:this.joggingActive,alignmentComplete:this.alignmentComplete,loweringActive:this.loweringActive,releasePermit:this.releasePermit,unloadReady:this.unloadReady,guardInterlockSafe:this.guardInterlockSafe,interlockSafe:this.interlockSafe,hydraulicActive:this.hydraulicActive,interlocks:{clampSecured:!!this.clampConfirmed,liftClearance:!!this.liftClearance,turnPermitted:!!this.turnPermitted,turnLocked:!!this.turnLockConfirmed,airPermitted:!!this.airPermitted,releasePermitted:!!this.releasePermit},
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
  this.rotors.forEach((r,i)=>r.quaternion.copy(this.rest.rotorQuaternion[i]));this.joggers.forEach((j,i)=>j.position.copy(this.rest.joggerPosition[i]));this.paperLayers.forEach((p,i)=>p.position.copy(this.rest.paperLayerPosition[i]));if(this.turnLockPin&&this.rest.turnLockPinPosition)this.turnLockPin.position.copy(this.rest.turnLockPinPosition);
  for(const jet of this.airJets){jet.visible=false;jet.material.opacity=.26;}
  this.turnAngleDeg=0;this.pileLoaded=false;this.clamped=false;this.clampCommand=false;this.clampConfirmed=false;this.liftActive=false;this.liftClearance=false;this.turnPermitted=false;this.turningActive=false;this.turnComplete=false;this.turnLockCommand=false;this.turnLockConfirmed=false;this.airPermitted=false;this.airPressureReady=false;this.airingActive=false;this.joggingActive=false;this.alignmentComplete=false;this.loweringActive=false;this.releasePermit=false;this.unloadReady=false;this.guardInterlockSafe=true;this.interlockSafe=true;this.hydraulicActive=false;
 }
 spinActiveRotors(dt,phase,air,jog,hyd){
  const liftDrive=(phase>.18&&phase<.30)||(phase>.84&&phase<.95);
  for(const r of this.rotors){
   const role=String(r.userData.mechanismRole||''),turnDrive=/^(trunnion-shaft|rotation-gear)$/.test(role)&&phase>.29&&phase<.49;
   const blowerDrive=/^(blower|blower-motor)$/.test(role)&&air,hydDrive=/^(hyd-pump|hyd-pump-motor)$/.test(role)&&hyd,chainDrive=role==='lift-chain-sprocket'&&liftDrive,move=turnDrive||blowerDrive||role==='vibration'&&jog||hydDrive||chainDrive;
   if(!move)continue;
   const dir=r.userData.spinDirection||1,rate=blowerDrive?9:role==='vibration'?11:hydDrive?6:chainDrive?5.5:4.4,axis=r.userData.rotorAxis==='x'?new THREE.Vector3(1,0,0):r.userData.rotorAxis==='z'?Z_AXIS:Y_AXIS,q=new THREE.Quaternion().setFromAxisAngle(axis,dir*rate*dt);r.quaternion.multiply(q).normalize();
  }
 }
 update(now){
  if(!this.active||!this.running){this.lastNow=now;return;}if(this.lastNow===null){this.lastNow=now;return;}
  const dt=Math.min(.12,Math.max(0,(now-this.lastNow)/1000))*this.speed;this.lastNow=now;this.elapsed+=dt;
  const cycle=14,cycleIndex=Math.floor(this.elapsed/cycle),phase=(this.elapsed%cycle)/cycle;
  const pileLoaded=phase>=.02;
  const clampProfile=smooth(phase,.08,.17)*(1-smooth(phase,.94,.985));
  const clampCommand=phase>=.08&&phase<.985,clampConfirmed=clampProfile>.94;
  const liftUp=smooth(phase,.18,.28),liftDown=smooth(phase,.85,.94),lift=liftUp*(1-liftDown);
  const liftClearance=lift>.82,guardSafe=true,turnPermitted=clampConfirmed&&liftClearance&&guardSafe;
  const requestedTurn=smooth(phase,.29,.48),turn=turnPermitted?requestedTurn:0,turnComplete=turn>.985;
  const turnLockCommand=turnComplete&&phase>=.49&&phase<.84,turnLockConfirmed=turnLockCommand&&phase>=.515;
  const airPermitted=clampConfirmed&&liftClearance&&turnComplete&&turnLockConfirmed;
  const air=airPermitted&&phase>=.54&&phase<.72,airPressureReady=airPermitted&&phase>=.565;
  const jog=airPressureReady&&phase>=.62&&phase<.78,alignmentComplete=phase>=.80&&turnComplete;
  const lowering=alignmentComplete&&phase>=.85&&phase<.94&&!air&&!turnLockCommand;
  const releasePermit=alignmentComplete&&phase>=.94&&lift<.08&&!turnLockCommand,unloadReady=releasePermit&&phase>=.975;
  const hyd=clampCommand||lift>.02||(turn>0&&turn<.999)||lowering;
  const totalTurn=(cycleIndex+turn)*Math.PI,qTurn=new THREE.Quaternion().setFromAxisAngle(Z_AXIS,totalTurn);
  if(this.upper)this.upper.position.y=this.rest.upperPosition.y-.47*clampProfile;
  if(this.clamp){this.clamp.position.copy(this.rest.clampPosition);this.clamp.position.y+=.15*lift;this.clamp.quaternion.copy(this.rest.clampQuaternion).multiply(qTurn);}
  if(this.yoke){this.yoke.position.copy(this.rest.yokePosition);this.yoke.position.y+=.15*lift;this.yoke.quaternion.copy(this.rest.yokeQuaternion).multiply(qTurn);}
  if(this.turnLockPin&&this.rest.turnLockPinPosition){this.turnLockPin.position.copy(this.rest.turnLockPinPosition);if(turnLockConfirmed)this.turnLockPin.position.x+=.09;}
  const pulse=(Math.sin(this.elapsed*24)+1)*.5*.025;
  this.joggers.forEach((j,i)=>{const r=this.rest.joggerPosition[i];j.position.copy(r);if(jog){if(j.userData.jogAxis==='z')j.position.z=r.z-Math.sign(r.z||1)*pulse;else j.position.x=r.x-Math.sign(r.x||1)*pulse;}});
  this.paperLayers.forEach((layer,i)=>{const r=this.rest.paperLayerPosition[i];layer.position.copy(r);if(airPressureReady){const centered=i-(this.paperLayers.length-1)/2,gap=centered*.0019*(air?1:.35),flutter=air?Math.sin(this.elapsed*10+i*.65)*.004:0;layer.position.y=r.y+gap;layer.position.z=r.z+flutter;}if(jog)layer.position.x=r.x+Math.sin(this.elapsed*23+i*.3)*.0025;});
  for(const [i,jet] of this.airJets.entries()){jet.visible=airPressureReady&&air;if(jet.visible)jet.material.opacity=.18+.16*(.5+.5*Math.sin(this.elapsed*11+i*.7));}
  this.spinActiveRotors(dt,phase,air,jog,hyd);
  const interlockSafe=(!(turn>0&&turn<.999)||turnPermitted)&&(!air||airPermitted)&&(!jog||airPressureReady)&&(!releasePermit||(!turnLockCommand&&lift<.08));
  this.completed=cycleIndex;this.pileLoaded=pileLoaded;this.clampCommand=clampCommand;this.clamped=clampConfirmed;this.clampConfirmed=clampConfirmed;this.liftActive=lift>.02;this.liftClearance=liftClearance;this.turnPermitted=turnPermitted;this.turningActive=turn>0&&turn<.999;this.turnComplete=turnComplete;this.turnAngleDeg=turn*180;this.turnLockCommand=turnLockCommand;this.turnLockConfirmed=turnLockConfirmed;this.airPermitted=airPermitted;this.airPressureReady=airPressureReady;this.airingActive=air;this.joggingActive=jog;this.alignmentComplete=alignmentComplete;this.loweringActive=lowering;this.releasePermit=releasePermit;this.unloadReady=unloadReady;this.guardInterlockSafe=guardSafe;this.interlockSafe=interlockSafe;this.hydraulicActive=hyd;
  this.onUpdate?.(this.state());
 }
 stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.resetMechanisms();this.onUpdate?.(this.state());return this.state();}
 dispose(){this.stop();for(const jet of this.airJets)jet.material.dispose();this.jetGeometry.dispose();this.airJetGroup.removeFromParent();}
}
