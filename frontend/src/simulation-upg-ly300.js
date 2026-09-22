import * as THREE from 'three';

export const UPG_LY300_SIMULATION_STAGES=Object.freeze([
 'Automatic paging','Servo positioning','Ricoh G5 variable-data print','LED UV curing',
 '2K line-scan inspection','Tracked pass / reject decision demo','Plate-turn reject or accept routing','Collection / strapping interface'
]);
const Y_AXIS=new THREE.Vector3(0,1,0);
const clamp=v=>Math.max(0,Math.min(1,v));

export class UpgLy300ProcessSimulation{
 constructor(root,template){
  this.root=root;this.template=template;this.active=false;this.running=false;this.paused=false;this.speed=1;this.completed=0;this.rejected=0;this.printedDemoCount=0;this.curedDemoCount=0;this.inspectedDemoCount=0;this.elapsed=0;this.lastNow=null;this.onUpdate=null;
  this.rotors=[];this.uvLamps=[];this.inspectionLights=[];this.items=[];this.goodStack=[];this.badStack=[];this.pathVisible=false;this.printVisible=true;
  this.reject=template.findNode('ly300-reject-plate');this.rejectRest=this.reject?.rotation.z||0;
  root.traverse(o=>{if(o.isMesh&&o.userData.rotor)this.rotors.push(o);if(o.isMesh&&o.userData.uvLamp)this.uvLamps.push(o);if(o.isMesh&&o.userData.inspectionLight)this.inspectionLights.push(o);});
  this.rotorRest=this.rotors.map(r=>r.quaternion.clone());
  this.points=[[-1.95,.66,0],[-1.55,.62,0],[-.95,.62,0],[-.25,.62,0],[.48,.62,0],[.95,.62,0],[1.34,.62,0],[1.90,.62,0]].map(p=>new THREE.Vector3(...p));
  this.curve=new THREE.CatmullRomCurve3(this.points,false,'centripetal');
  const pathGeo=new THREE.BufferGeometry().setFromPoints(this.curve.getPoints(190)),pathMat=new THREE.LineDashedMaterial({color:0x3e86a7,dashSize:.045,gapSize:.03,transparent:true,opacity:.56});
  this.pathLine=new THREE.Line(pathGeo,pathMat);this.pathLine.computeLineDistances();this.pathLine.visible=false;this.pathLine.name='LY300-CAUSAL-PRINT-CURE-INSPECT-PATH';root.add(this.pathLine);
  for(let i=0;i<7;i++)this.items.push(this.createItem(i,i/7));
  for(let i=0;i<16;i++){for(const [arr,z] of [[this.goodStack,0],[this.badStack,.34]]){const m=new THREE.Mesh(new THREE.BoxGeometry(.34,.012,.22),new THREE.MeshStandardMaterial({color:0xe0cba2,roughness:.9}));m.visible=false;root.add(m);arr.push(m);}}
  this.resetFlags();this.updateLights(false,false);
 }
 createItem(index,phase){
  const group=new THREE.Group(),mat=new THREE.MeshStandardMaterial({color:0xe0cba2,roughness:.87}),card=new THREE.Mesh(new THREE.BoxGeometry(.34,.012,.22),mat);group.add(card);
  const code=new THREE.Group();for(let b=0;b<7;b++){const bar=new THREE.Mesh(new THREE.BoxGeometry(.018,.006,.09),new THREE.MeshStandardMaterial({color:0x111315,roughness:.65}));bar.position.set(-.075+b*.025,.010,0);code.add(bar);}code.visible=false;group.add(code);
  group.visible=false;group.userData.demoOnly=true;this.root.add(group);
  return {group,code,index,phase,lap:-1,printed:false,cured:false,inspected:false,result:null,inspectionLap:-1};
 }
 resetFlags(){this.pagingActive=false;this.materialPresent=false;this.doubleSheetClear=true;this.positioningActive=false;this.encoderSync=false;this.printTrigger=false;this.negativePressureReady=false;this.printPermit=false;this.printingActive=false;this.printComplete=false;this.uvPowerReady=false;this.uvPermit=false;this.uvActive=false;this.cureComplete=false;this.cameraTrigger=false;this.cameraActive=false;this.processingActive=false;this.inspectionComplete=false;this.decisionReady=false;this.rejectPermit=false;this.rejectConfirmed=false;this.collectionDetected=false;this.interlockSafe=true;this.rejectTrackingActive=false;this.demoRejectActive=false;this.acceptRoutingActive=false;this.demoRejectOnly=true;}
 state(){
  const p=this.active?(this.elapsed/6.8)%1:0,index=Math.min(UPG_LY300_SIMULATION_STAGES.length-1,Math.floor(p*UPG_LY300_SIMULATION_STAGES.length));
  return {available:true,blocked:false,active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:UPG_LY300_SIMULATION_STAGES[index],completed:this.completed,rejectedDemo:this.rejected,progress:p,
   printedDemoCount:this.printedDemoCount,curedDemoCount:this.curedDemoCount,inspectedDemoCount:this.inspectedDemoCount,sheetsVisible:this.items.filter(i=>i.group.visible).length,pileSheetsVisible:this.goodStack.filter(p=>p.visible).length,rejectSheetsVisible:this.badStack.filter(p=>p.visible).length,
   rotorCount:this.rotors.length,mechanismCount:this.rotors.length+this.uvLamps.length+this.inspectionLights.length+1,pathVisible:this.pathVisible,inkFlowVisible:this.printVisible,inkFlowCount:this.items.filter(i=>i.code.visible).length,uvLampCount:this.uvLamps.length,
   pagingActive:this.pagingActive,materialPresent:this.materialPresent,doubleSheetClear:this.doubleSheetClear,positioningActive:this.positioningActive,encoderSync:this.encoderSync,printTrigger:this.printTrigger,negativePressureReady:this.negativePressureReady,printPermit:this.printPermit,printingActive:this.printingActive,printComplete:this.printComplete,uvPowerReady:this.uvPowerReady,uvPermit:this.uvPermit,uvActive:this.uvActive,cureComplete:this.cureComplete,cameraTrigger:this.cameraTrigger,cameraActive:this.cameraActive,processingActive:this.processingActive,inspectionComplete:this.inspectionComplete,decisionReady:this.decisionReady,rejectPermit:this.rejectPermit,rejectConfirmed:this.rejectConfirmed,collectionDetected:this.collectionDetected,interlockSafe:this.interlockSafe,rejectTrackingActive:this.rejectTrackingActive,demoRejectActive:this.demoRejectActive,acceptRoutingActive:this.acceptRoutingActive,
   demoRejectOnly:true,installedPrintheadCountVerified:false,trackedResults:{pass:this.items.filter(i=>i.result==='PASS_DEMO').length,reject:this.items.filter(i=>i.result==='REJECT_DEMO').length,pending:this.items.filter(i=>!i.result).length}};
 }
 start(){this.active=true;this.running=true;this.paused=false;this.completed=0;this.rejected=0;this.printedDemoCount=0;this.curedDemoCount=0;this.inspectedDemoCount=0;this.elapsed=0;this.lastNow=null;for(const i of this.items){i.lap=-1;i.printed=i.cured=i.inspected=false;i.result=null;i.inspectionLap=-1;}this.resetMechanisms();this.onUpdate?.(this.state());return this.state();}
 pause(){this.running=false;this.paused=this.active;this.onUpdate?.(this.state());return this.state();}
 resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;}this.onUpdate?.(this.state());return this.state();}
 setSpeed(v){this.speed=Math.max(.25,Math.min(4,Number(v)||1));return this.state();}
 setPathVisible(v){this.pathVisible=!!v;this.pathLine.visible=this.pathVisible;return this.state();}
 setInkFlowVisible(v){this.printVisible=!!v;for(const i of this.items)i.code.visible=this.printVisible&&i.printed;return this.state();}
 spin(r,dt,rate){const axis=r.userData.rotorAxis==='x'?new THREE.Vector3(1,0,0):r.userData.rotorAxis==='z'?new THREE.Vector3(0,0,1):Y_AXIS,q=new THREE.Quaternion().setFromAxisAngle(axis,(r.userData.spinDirection||1)*rate*dt);r.quaternion.multiply(q).normalize();}
 updateRotors(dt){for(const r of this.rotors){const role=String(r.userData.mechanismRole||'');const rate=role==='pager-wheel'?6.4:role==='belt-pulley'?5.8:role==='servo'?6.0:role==='encoder'?7.0:4.6;this.spin(r,dt,rate);}}
 updateLights(uvOn,inspectOn){for(const l of this.uvLamps){l.material.emissive?.setHex(uvOn?0xaabfff:0x1b2230);l.material.emissiveIntensity=uvOn?2.5:.12;}for(const l of this.inspectionLights){l.material.emissive?.setHex(inspectOn?0xdff8ff:0x20272b);l.material.emissiveIntensity=inspectOn?2.1:.15;}}
 assignResult(item,lap){const seq=lap*this.items.length+item.index;item.result=(seq%6===0)?'REJECT_DEMO':'PASS_DEMO';item.inspected=true;item.inspectionLap=lap;this.inspectedDemoCount++;}
 outputPrevious(item){if(item.result==='REJECT_DEMO'){this.rejected++;const m=this.badStack[(this.rejected-1)%this.badStack.length];m.visible=true;m.position.set(1.62,.35+((this.rejected-1)%this.badStack.length)*.014,.34);}else if(item.result==='PASS_DEMO'){this.completed++;const m=this.goodStack[(this.completed-1)%this.goodStack.length];m.visible=true;m.position.set(1.98,.36+((this.completed-1)%this.goodStack.length)*.014,0);}}
 resetItemCycle(item){item.printed=false;item.cured=false;item.inspected=false;item.result=null;item.inspectionLap=-1;item.code.visible=false;}
 updateItems(){
  let paging=false,material=false,positioning=false,encoder=false,printTrig=false,printing=false,printed=false,uv=false,cured=false,camera=false,processing=false,inspected=false,decision=false,rejectTracked=false,rejectAtGate=false,rejectConfirmed=false,acceptRoute=false,collection=false;const base=this.elapsed/6.8;
  for(const item of this.items){
   const raw=base+item.phase,lap=Math.floor(raw),t=((raw%1)+1)%1;if(lap>item.lap){if(item.lap>=0)this.outputPrevious(item);item.lap=lap;this.resetItemCycle(item);}
   item.group.visible=this.active;item.group.position.copy(this.curve.getPointAt(Math.min(.999,t)));
   if(t<.18){paging=true;material=true;}
   if(t>=.18&&t<.30){positioning=true;material=true;encoder=true;}
   const printPermit=t>=.30&&t<.45&&material===true&&encoder===true;
   if(t>=.28&&t<.34)printTrig=true;
   if(t>=.30&&t<.45){printing=true;if(!item.printed){item.printed=true;this.printedDemoCount++;}item.code.visible=this.printVisible;}
   if(item.printed)printed=true;
   if(t>=.45&&t<.57&&item.printed){uv=true;if(!item.cured){item.cured=true;this.curedDemoCount++;}}
   if(item.cured)cured=true;
   if(t>=.57&&t<.70&&item.cured){camera=true;processing=true;if(!item.inspected||item.inspectionLap!==lap)this.assignResult(item,lap);}
   if(item.inspected){inspected=true;decision=true;}
   if(t>=.76&&item.result){const q=clamp((t-.76)/.15);if(item.result==='REJECT_DEMO'){item.group.position.z=THREE.MathUtils.lerp(0,.34,q);rejectTracked=true;if(t>=.80&&t<.91)rejectAtGate=true;if(t>=.88)rejectConfirmed=true;}else{acceptRoute=true;if(t>=.92)collection=true;}}
  }
  this.pagingActive=paging;this.materialPresent=material;this.doubleSheetClear=true;this.positioningActive=positioning;this.encoderSync=encoder;this.printTrigger=printTrig;this.negativePressureReady=this.active;this.printPermit=printing&&this.negativePressureReady;this.printingActive=printing&&this.printPermit;this.printComplete=printed;this.uvPowerReady=this.active;this.uvPermit=uv&&printed&&this.uvPowerReady;this.uvActive=uv&&this.uvPermit;this.cureComplete=cured;this.cameraTrigger=camera&&cured;this.cameraActive=camera&&cured;this.processingActive=processing&&cured;this.inspectionComplete=inspected;this.decisionReady=decision;this.rejectPermit=rejectAtGate&&decision;this.rejectConfirmed=rejectConfirmed;this.collectionDetected=collection;this.rejectTrackingActive=rejectTracked;this.demoRejectActive=this.rejectPermit;this.acceptRoutingActive=acceptRoute;this.interlockSafe=(!this.printingActive||this.printPermit)&&(!this.uvActive||this.uvPermit)&&(!this.cameraActive||this.cureComplete)&&(!this.demoRejectActive||this.rejectPermit);
  this.updateLights(this.uvActive,this.cameraActive);if(this.reject)this.reject.rotation.z=this.rejectRest+(this.rejectPermit?.72:0);
 }
 update(now){if(!this.active||!this.running){this.lastNow=now;return;}if(this.lastNow===null){this.lastNow=now;return;}const dt=Math.min(.12,Math.max(0,(now-this.lastNow)/1000))*this.speed;this.lastNow=now;this.elapsed+=dt;this.updateRotors(dt);this.updateItems();this.onUpdate?.(this.state());}
 resetMechanisms(){if(this.reject)this.reject.rotation.z=this.rejectRest;this.rotors.forEach((r,i)=>r.quaternion.copy(this.rotorRest[i]));this.updateLights(false,false);for(const item of this.items){item.group.visible=false;item.code.visible=false;}this.resetFlags();}
 stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.rejected=0;this.printedDemoCount=0;this.curedDemoCount=0;this.inspectedDemoCount=0;this.resetMechanisms();for(const m of [...this.goodStack,...this.badStack])m.visible=false;this.pathLine.visible=false;this.onUpdate?.(this.state());return this.state();}
 dispose(){this.stop();for(const item of this.items){this.root.remove(item.group);item.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}for(const m of [...this.goodStack,...this.badStack]){this.root.remove(m);m.geometry.dispose();m.material.dispose();}this.root.remove(this.pathLine);this.pathLine.geometry.dispose();this.pathLine.material.dispose();}
}
