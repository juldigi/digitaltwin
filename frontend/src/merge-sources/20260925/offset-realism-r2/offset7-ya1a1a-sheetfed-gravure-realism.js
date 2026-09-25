// DigitalTwin BMJ — Offset 7 / YA1A1A dedicated realism pack
// Asset: BMJ-MCH-0004 · "OFFSET - 7 MACHINE" · YA1A1A · WDB-13006 · OFS-7 · 2013
//
// IMPORTANT CLASSIFICATION:
// BMJ's operational name is preserved, but model-family evidence identifies YA1A1A
// as a sheet-fed GRAVURE machine. Therefore this file intentionally does NOT reuse
// Heidelberg sheetfed-offset geometry, cylinder topology, inking train or simulation.
//
// This is a dedicated, evidence-bounded reconstruction using:
// 1) the existing DigitalTwin exact-model/successor-family visual evidence,
// 2) YA1B1 sheet-fed gravure family documentation for mechanism topology,
// 3) general sheet-fed gravure process references.
// Serial-specific dimensions/settings are not fabricated.

import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));

export const OFFSET7_YA1A1A_SPEC=Object.freeze({
 assetId:'BMJ-MCH-0004',
 operationalName:'OFFSET - 7 MACHINE',
 model:'YA1A1A',
 serial:'WDB-13006',
 year:2013,
 sap:'OFS-7',
 processFamily:'SHEETFED_GRAVURE',
 exactModelVisualFormatReference:[.650,.920],
 exactModelVisualFormatEngineeringVerified:false,
 geometryEnvelopeStatus:'VISUAL_REFERENCE_NOT_INSTALLATION_DRAWING',
 sheetFlow:'-X to +X',
 operatorSide:'-Z',
 driveSide:'+Z'
});

export const OFFSET7_REALISM_SOURCES=Object.freeze([
 {id:'YA1A1A-CURRENT-EVIDENCE',authority:'existing-project-evidence',
  supports:['exact YA1A1A identity','650x920 visual reference','existing exact-model exterior photo match','successor-family morphology boundary']},
 {id:'EZGRAVTEK-YA1B1',authority:'oem-family',
  url:'https://en.ezgravtek.com/ProDetail.aspx?Proid=30',
  supports:['sheet-fed gravure family morphology only']},
 {id:'ZOMACHINE-YA1B1',authority:'family-reference',
  url:'https://zomachine.com/default.aspx?id=88&pageType=detail&pageid=14',
  supports:['pneumatic doctor blade','ink circulation','hot-air drying','IR family capability','sheet-fed transport family']},
 {id:'GRAVURE-PRINCIPLE',authority:'process-reference',
  url:'https://www.egyankosh.ac.in/bitstream/123456789/76357/1/UNIT-9.pdf',
  supports:['gravure cylinder','impression cylinder','doctor blade','ink trough','sheet path topology']},
 {id:'O7-BOUNDARY',authority:'engineering-control',
  note:'YA1B1/successor data is family reference only. Dimensions, UV option, exact dryer energy, exact delivery construction, exact ink viscosity/control and exact cylinder service settings are not transferred to YA1A1A.'}
]);

function makeSheetGeometry(lengthSegments=12,widthSegments=8){
 const positions=new Float32Array((lengthSegments+1)*(widthSegments+1)*3),indices=[];
 for(let i=0;i<lengthSegments;i++)for(let j=0;j<widthSegments;j++){
  const a=i*(widthSegments+1)+j,b=a+1,c=(i+1)*(widthSegments+1)+j,d=c+1;
  indices.push(a,c,b,b,c,d);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));g.setIndex(indices);g.computeBoundingSphere();return g;
}

export class Offset7YA1A1AMachineTemplate{
 constructor(){
  this.root=new THREE.Group();this.root.name='YA1A1A-SHEETFED-GRAVURE';
  this.root.userData={
   assetId:OFFSET7_YA1A1A_SPEC.assetId,nodeId:'offset7-root',spec:OFFSET7_YA1A1A_SPEC,
   sources:OFFSET7_REALISM_SOURCES,taxonomyVersion:'offset7-ya1a1a-dedicated-v1',
   realismPack:'OFFSET7_YA1A1A_GRAVURE_REALISM_R1',
   evidenceBoundary:'EXACT_IDENTITY__VISUAL_REFERENCE__FAMILY_MECHANISM__NO_SERIAL_SERVICE_SETTINGS'
  };
  this.nodes=[];this.parts=[];this.meshes=[];this.geometries=new Map();this.materials=new Map();this.exteriorOpen=false;
  this.palette={
   body:0xe5e5df,body2:0xf0f0eb,graphite:0x272e32,black:0x111719,steel:0x8e999d,silver:0xc3cbcc,
   rubber:0x252a2c,paper:0xf3eddb,ink:0x6e3146,blue:0x337a9b,cyan:0x4bb8c6,amber:0xd9a139,
   glass:0x75b8c8,red:0xb43b36
  };
  this.build();
  this.taxonomy=this.makeTaxonomy();this.taxonomyById=new Map(this.taxonomy.map(n=>[n.id,n]));
  for(const n of this.nodes){n.userData.rest=n.position.clone();n.userData.restQuaternion=n.quaternion.clone();}
  this.original=this.parts.map(p=>p.position.clone());this.root.updateMatrixWorld(true);
 }
 mat(key){
  if(!this.materials.has(key)){
   const glass=key==='glass',metal=['steel','silver'].includes(key);
   this.materials.set(key,new THREE.MeshStandardMaterial({
    color:this.palette[key]??0x888888,metalness:metal?.62:.12,roughness:key==='paper'?.90:glass?.18:.46,
    transparent:glass,opacity:glass?.34:1
   }));
  }return this.materials.get(key);
 }
 geo(key,factory){if(!this.geometries.has(key))this.geometries.set(key,factory());return this.geometries.get(key);}
 group(parent,id,name,pos=[0,0,0],explode=[0,0,0],confidence='FAMILY_REFERENCE'){
  const g=new THREE.Group();g.name=name;g.position.set(...pos);
  g.userData={assetId:OFFSET7_YA1A1A_SPEC.assetId,nodeId:id,selectable:true,confidence,explode:new THREE.Vector3(...explode)};
  parent.add(g);this.nodes.push(g);if(parent===this.root)this.parts.push(g);return g;
 }
 mesh(parent,geometry,key,material='graphite',pos=[0,0,0],rot=null){
  const m=new THREE.Mesh(this.geo(key,geometry),this.mat(material));m.position.set(...pos);if(rot)m.rotation.set(...rot);
  m.castShadow=material!=='glass';m.receiveShadow=true;m.userData.ownerId=parent.userData.nodeId;parent.add(m);this.meshes.push(m);return m;
 }
 box(g,size,pos,material='graphite',radius=.02){
  return this.mesh(g,()=>radius?new RoundedBoxGeometry(...size,2,radius):new THREE.BoxGeometry(...size),
   'b:'+size.join(':')+':'+radius,material,pos);
 }
 cyl(g,r,len,pos,material='steel',axis='z'){
  const rot=axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:null;
  return this.mesh(g,()=>new THREE.CylinderGeometry(r,r,len,24),'c:'+r+':'+len+':'+axis,material,pos,rot);
 }
 tube(g,points,r=.014,material='rubber'){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal',.5);
  return this.mesh(g,()=>new THREE.TubeGeometry(curve,28,r,7,false),'t:'+JSON.stringify(points)+':'+r,material,[0,0,0]);
 }
 tag(mesh,role,{rotor=false,sign=1,rate=1,cover=false,boundary='FAMILY_REFERENCE'}={}){
  if(!mesh)return mesh;mesh.userData.realismRole=role;mesh.userData.evidenceBoundary=boundary;
  mesh.userData.dynamicRotor=rotor;mesh.userData.rotorSign=sign;mesh.userData.rotorRate=rate;if(cover)mesh.userData.exteriorCover=true;return mesh;
 }
 screw(g,p){return this.tag(this.cyl(g,.009,.016,p,'steel','z'),'cover-fastener',{cover:true,boundary:'VISUAL_DETAIL'});}

 build(){
  this.buildBase();
  this.buildFeeder();
  this.buildRegister();
  this.buildPrintStation();
  this.buildDryer();
  this.buildDelivery();
  this.buildInkSystem();
  this.buildExhaust();
  this.buildControls();
  this.buildAccess();
 }
 buildBase(){
  const g=this.group(this.root,'o7-base','YA1A1A base and longitudinal frame',[0,0,0],[0,-.15,0],'VISUAL_REFERENCE');
  this.tag(this.box(g,[7.25,.18,2.30],[0,.18,0],'graphite',.025),'machine-base');
  for(const z of [-.98,.98]){
   this.tag(this.box(g,[7.00,.28,.14],[0,.37,z],'graphite',.018),'longitudinal-frame');
   for(let x=-3.1;x<=3.1;x+=1.03)this.tag(this.box(g,[.10,.34,.10],[x,.45,z],'steel',.008),'frame-foot');
  }
 }
 buildFeeder(){
  const g=this.group(this.root,'o7-feeder','YA1A1A feeder',[-2.82,0,0],[-.55,.12,0],'EXACT_MODEL_VISUAL_PLUS_FAMILY');
  // Open portal shape derived from exact/successor family visuals.
  for(const x of [-.48,.48]){
   for(const z of [-.99,.99])this.tag(this.box(g,[.18,1.42,.12],[x,.98,z],'body',.030),'feeder-portal-upright',{cover:true});
  }
  this.tag(this.box(g,[1.16,.28,2.06],[0,1.64,0],'body',.035),'feeder-top-fascia',{cover:true});
  this.tag(this.box(g,[1.10,.12,1.96],[0,.30,0],'graphite',.020),'feeder-lower-crossmember');
  const pile=this.group(g,'o7-feeder-pile','Feeder pile',[0,0,0],[-.16,.06,0]);
  this.tag(this.box(pile,[.95,.07,1.42],[-.24,.47,0],'steel',.010),'pile-table');
  this.tag(this.box(pile,[.92,.74,1.38],[-.24,.88,0],'paper',.006),'paper-pile',{boundary:'VISUAL_SHEET_REFERENCE'});
  for(const z of [-.60,.60])this.tag(this.box(pile,[.055,.64,.055],[-.65,.84,z],'steel',.006),'pile-side-guide');
  const head=this.group(g,'o7-feeder-head','Suction / separation head',[0,0,0],[.10,.12,0]);
  this.tag(this.box(head,[.72,.24,1.38],[.22,1.60,0],'graphite',.016),'suction-head');
  for(const z of [-.51,-.17,.17,.51]){
   const cup=this.cyl(head,.030,.10,[.40,1.43,z],'rubber','y');cup.userData.suctionCup=true;this.tag(cup,'feeder-suction-cup');
   this.tag(this.cyl(head,.011,.20,[.40,1.54,z],'steel','y'),'suction-stem');
  }
  for(const z of [-.62,.62]){
   const nozzle=this.cyl(head,.012,.055,[.40,1.34,z],'cyan','y');nozzle.userData.feederAirNozzle=true;this.tag(nozzle,'sheet-separation-air-nozzle');
  }
 }
 buildRegister(){
  const g=this.group(this.root,'o7-register','Feedboard and register',[-1.72,0,0],[-.22,.08,0],'FAMILY_MECHANISM');
  this.tag(this.box(g,[1.18,.48,1.66],[0,.88,0],'graphite',.045),'feedboard-housing',{cover:true});
  this.tag(this.box(g,[1.14,.025,1.48],[0,1.14,0],'steel',.005),'feedboard-sheet-plane');
  for(const z of [-.48,-.16,.16,.48]){
   const wheel=this.cyl(g,.032,.09,[.10,1.19,z],'rubber','z');this.tag(wheel,'feed-wheel',{rotor:true,rate:1.3,sign:-1});
  }
  for(const z of [-.60,.60]){
   const lay=this.box(g,[.08,.10,.05],[.50,1.20,z],'silver',.005);lay.userData.registerLay=true;this.tag(lay,'register-lay');
  }
  const sensor=this.box(g,[.06,.10,.05],[.38,1.27,-.70],'blue',.005);sensor.userData.sheetSensor=true;this.tag(sensor,'sheet-arrival-sensor');
 }
 buildPrintStation(){
  const g=this.group(this.root,'o7-print','Single-color sheet-fed gravure printing station',[-.32,0,0],[0,.20,.28],'PROCESS_REFERENCE');
  // Exterior portal: intentionally not a Heidelberg print unit.
  for(const z of [-1.03,1.03]){
   for(const x of [-.63,.63])this.tag(this.box(g,[.25,1.72,.12],[x,1.18,z],'body',.030),'print-portal-column',{cover:true});
   this.tag(this.box(g,[1.50,.30,.12],[0,2.04,z],'body',.030),'print-side-top-fascia',{cover:true});
   this.tag(this.box(g,[1.50,.38,.12],[0,.48,z],'graphite',.020),'print-lower-side-guard',{cover:true});
  }
  this.tag(this.box(g,[1.54,.28,2.04],[0,2.08,0],'body',.035),'print-top-bridge',{cover:true});

  const mech=this.group(g,'o7-print-mechanism','Gravure nip / doctor blade / ink pan',[0,0,0],[0,.18,0],'PROCESS_REFERENCE');
  // Tangent nip around y=1.26. The two principal cylinders counter-rotate.
  const grav=this.cyl(mech,.30,1.48,[0,.96,0],'silver','z');grav.userData.processCylinder='GRAVURE';this.tag(grav,'gravure-cylinder',{rotor:true,rate:1,sign:1});
  const imp=this.cyl(mech,.30,1.48,[0,1.56,0],'rubber','z');imp.userData.processCylinder='IMPRESSION';this.tag(imp,'impression-cylinder',{rotor:true,rate:1,sign:-1});
  for(const z of [-.77,.77]){
   this.tag(this.cyl(mech,.055,.10,[0,.96,z],'graphite','z'),'gravure-bearing');
   this.tag(this.cyl(mech,.055,.10,[0,1.56,z],'graphite','z'),'impression-bearing');
  }

  // Ink pan and applicator/doctoring architecture.
  const pan=this.box(mech,[.78,.20,1.58],[0,.58,0],'ink',.025);this.tag(pan,'gravure-ink-pan');
  const applicator=this.cyl(mech,.115,1.42,[-.16,.72,0],'rubber','z');this.tag(applicator,'ink-applicator-roller',{rotor:true,rate:.84,sign:-1});
  const bladeHolder=this.box(mech,[.52,.10,1.52],[.28,1.11,0],'graphite',.012);bladeHolder.rotation.z=-.14;this.tag(bladeHolder,'doctor-blade-holder');
  const blade=this.box(mech,[.48,.012,1.54],[.21,1.07,0],'steel',.002);blade.rotation.z=-.14;blade.userData.doctorBlade=true;this.tag(blade,'doctor-blade-edge');
  for(const z of [-.66,.66]){
   const actuator=this.cyl(mech,.035,.28,[.43,1.19,z],'steel','x');actuator.userData.doctorActuator=true;this.tag(actuator,'doctor-blade-pneumatic-actuator');
  }
  // Protective transparent inspection windows on both sides.
  for(const z of [-1.07,1.07]){
   const w=this.box(g,[.66,.58,.025],[0,1.30,z+(z<0?-.065:.065)],'glass',.018);this.tag(w,'print-station-inspection-window',{cover:true});
  }
 }
 buildDryer(){
  const g=this.group(this.root,'o7-dryer','Sheet-fed gravure dryer',[1.15,0,0],[.25,.28,0],'FAMILY_MECHANISM');
  this.tag(this.box(g,[1.45,.54,2.10],[0,1.94,0],'body',.035),'dryer-canopy',{cover:true});
  for(const z of [-1.00,1.00])this.tag(this.box(g,[1.34,1.28,.12],[0,1.14,z],'body',.025),'dryer-side-panel',{cover:true});
  const process=this.group(g,'o7-dryer-process','Drying-air chamber',[0,0,0],[0,.18,0],'FAMILY_MECHANISM');
  // Hot-air family architecture; no exact energy package claimed.
  for(const x of [-.46,-.15,.15,.46]){
   const nozzle=this.box(process,[.20,.055,1.34],[x,1.52,0],'steel',.009);nozzle.userData.hotAirNozzle=true;this.tag(nozzle,'dryer-hot-air-nozzle');
  }
  this.tag(this.box(process,[1.18,.035,1.46],[0,1.24,0],'steel',.006),'dryer-sheet-guide');
  for(const z of [-.66,.66]){
   const fan=this.cyl(process,.14,.08,[.30,2.12,z],'graphite','z');fan.userData.dryerFan=true;this.tag(fan,'dryer-circulation-fan',{rotor:true,rate:1.4,sign:z<0?1:-1});
  }
  this.tag(this.box(process,[.18,.82,.16],[.50,1.68,-.96],'steel',.020),'dryer-return-riser');
  this.tag(this.box(process,[.18,.82,.16],[.50,1.68,.96],'steel',.020),'dryer-return-riser');
  g.userData.exactEnergyPackageVerified=false;g.userData.uvInstalledVerified=false;
 }
 buildDelivery(){
  const g=this.group(this.root,'o7-delivery','Sheet delivery',[2.72,0,0],[.55,.12,0],'EXACT_MODEL_VISUAL_PLUS_FAMILY');
  for(const x of [-.45,.45]){
   for(const z of [-.96,.96])this.tag(this.box(g,[.18,1.46,.12],[x,.94,z],'body',.030),'delivery-portal-upright',{cover:true});
  }
  this.tag(this.box(g,[1.08,.28,1.94],[0,1.64,0],'body',.030),'delivery-top-fascia',{cover:true});
  const transport=this.group(g,'o7-delivery-transport','Delivery gripper/roller transport',[0,0,0],[.16,.10,0],'FAMILY_MECHANISM');
  for(const y of [.72,.98,1.24]){
   const r=this.cyl(transport,.072,1.38,[-.10,y,0],'steel','z');this.tag(r,'delivery-transfer-roller',{rotor:true,rate:1.1,sign:y>.8?-1:1});
  }
  // Visible gripper bars on a compact reference loop.
  for(let i=0;i<8;i++){
   const x=-.42+i*(.84/7);
   const bar=this.group(transport,`o7-delivery-gripper-${i+1}`,`Delivery gripper bar ${i+1}`,[x,1.46,0],[0,.04,0],'FAMILY_MECHANISM');
   bar.userData.deliveryGripperBar=true;bar.userData.barPhase=i/8;
   this.tag(this.box(bar,[.045,.045,1.34],[0,0,0],'steel',.006),'delivery-gripper-bar');
   for(const z of [-.50,-.25,0,.25,.50])this.tag(this.box(bar,[.05,.040,.030],[.02,-.05,z],'graphite',.004),'delivery-gripper-finger');
  }
  const pile=this.group(g,'o7-delivery-pile','Delivery pile',[0,0,0],[.12,.05,0],'VISUAL_REFERENCE');
  this.tag(this.box(pile,[.92,.07,1.42],[.16,.48,0],'steel',.010),'delivery-pile-table');
  this.tag(this.box(pile,[.90,.55,1.38],[.16,.79,0],'paper',.005),'delivery-paper-stack');
  for(const z of [-.60,.60])this.tag(this.box(pile,[.055,.58,.055],[.55,.80,z],'steel',.006),'delivery-pile-guide');
  for(const z of [-.56,.56]){
   const jog=this.box(pile,[.10,.28,.030],[.46,.92,z+(z<0?-.04:.04)],'graphite',.006);jog.userData.deliveryJogger=true;this.tag(jog,'delivery-jogger');
  }
 }
 buildInkSystem(){
  const g=this.group(this.root,'o7-ink-system','Ink circulation system',[-.15,0,1.42],[0,.08,.30],'FAMILY_MECHANISM');
  this.tag(this.box(g,[.44,.56,.38],[0,.60,0],'graphite',.025),'ink-circulation-tank');
  const pump=this.cyl(g,.095,.22,[.30,.54,0],'graphite','x');this.tag(pump,'ink-circulation-pump',{rotor:true,rate:1.25,sign:1});
  this.tag(this.tube(g,[[.25,.67,0],[.15,.83,-.08],[-.20,1.15,-.20],[-.28,1.48,-.45]],.018,'ink'),'ink-supply-hose');
  this.tag(this.tube(g,[[-.30,1.38,-.55],[-.42,1.08,-.36],[-.35,.72,-.10],[.10,.58,0]],.020,'rubber'),'ink-return-hose');
  g.userData.viscosityControlInstalledVerified=false;
 }
 buildExhaust(){
  const g=this.group(this.root,'o7-exhaust','Dryer exhaust reference',[1.38,0,0],[.15,.35,0],'EXACT_MODEL_VISUAL_PLUS_FAMILY');
  for(const z of [-.44,.44]){
   this.tag(this.cyl(g,.070,.88,[0,2.38,z],'steel','y'),'dryer-exhaust-stack');
   this.tag(this.cyl(g,.095,.12,[0,2.86,z],'graphite','y'),'dryer-exhaust-cap');
  }
  this.tag(this.box(g,[.78,.24,1.10],[-.12,2.16,0],'graphite',.025),'dryer-exhaust-plenum');
 }
 buildControls(){
  const g=this.group(this.root,'o7-control','YA1A1A local control',[2.46,0,-1.46],[.15,.06,-.22],'VISUAL_REFERENCE');
  this.tag(this.box(g,[.58,1.34,.48],[0,.82,0],'graphite',.035),'control-cabinet');
  const display=this.box(g,[.32,.22,.025],[-.03,1.18,-.255],'glass',.010);this.tag(display,'operator-display');
  this.tag(this.cyl(g,.030,.026,[.18,.88,-.26],'red','z'),'emergency-stop');
  for(let i=0;i<4;i++)this.tag(this.cyl(g,.020,.020,[-.17+i*.10,.82,-.26],i===0?'blue':'steel','z'),'control-pushbutton');
 }
 buildAccess(){
  const g=this.group(this.root,'o7-access','Operator / drive-side access',[0,0,0],[0,-.10,0],'VISUAL_REFERENCE');
  for(const z of [-1.14,1.14]){
   this.tag(this.box(g,[6.45,.07,.40],[.10,.42,z],'steel',.014),'side-access-deck');
   this.tag(this.box(g,[6.45,.06,.035],[.10,.48,z+(z<0?-.20:.20)],'graphite',.005),'toe-board');
  }
  for(const z of [-1.34,1.34]){
   for(let x=-2.7;x<3.0;x+=1.0)this.tag(this.cyl(g,.018,.48,[x,.78,z],'steel','y'),'guard-post');
   this.tag(this.cyl(g,.017,5.70,[.10,1.00,z],'steel','x'),'guard-rail');
  }
 }

 makeTaxonomy(){
  const rows=[];
  const add=(id,name,level,parentId,meshRefs=[],kind='assembly',description='')=>rows.push({
   id,name,level,parentId,meshRefs,kind,description,
   confidence:level===1?'BMJ_IDENTITY_VERIFIED':'FAMILY_REFERENCE',
   explodeVector:[level===2?.55:.10,level<4?.16:.07,level%2?.10:-.10],
   explodeDistance:level===2?.72:level===3?.46:level===4?.28:level===5?.17:.10
  });
  add('O7','Offset 7 · YA1A1A sheet-fed gravure',1,null,['offset7-root'],'machine',
   'BMJ operational name retained; mechanism classified as sheet-fed gravure from model-family evidence.');
  const sections=[
   ['FEED','Feeder and register',['o7-feeder','o7-register']],
   ['PRINT','Gravure printing station',['o7-print']],
   ['DRY','Drying section',['o7-dryer','o7-exhaust']],
   ['DEL','Delivery',['o7-delivery']],
   ['UTIL','Ink circulation and control',['o7-ink-system','o7-control']],
   ['ACCESS','Frame and access',['o7-base','o7-access']]
  ];
  sections.forEach(([k,n,refs])=>add('O7.'+k,n,2,'O7',refs,'section'));
  const chains=[
   ['FEED.PILE','Pile lift / table','o7-feeder-pile','Pile table and guides','Sheet stack / pile edge reference'],
   ['FEED.HEAD','Suction separation head','o7-feeder-head','Suction cups / air separation','Cup and stem reference'],
   ['FEED.REG','Feedboard and register','o7-register','Feed wheels / register lays','Sheet-arrival reference'],
   ['PRINT.NIP','Gravure-impression nip','o7-print-mechanism','Gravure + impression cylinders','Cylinder body / bearing reference'],
   ['PRINT.DOCTOR','Doctor blade system','o7-print-mechanism','Doctor blade holder / pneumatic actuation','Doctor edge reference'],
   ['PRINT.INK','Ink pan and applicator','o7-print-mechanism','Ink pan / applicator roller','Ink-contact reference'],
   ['DRY.AIR','Drying-air process','o7-dryer-process','Air nozzles / circulation fans','Airflow reference'],
   ['DRY.EXH','Dryer exhaust','o7-exhaust','Exhaust plenum / stacks','Exhaust outlet reference'],
   ['DEL.TRANS','Delivery transport','o7-delivery-transport','Transfer rollers / gripper bars','Gripper-finger reference'],
   ['DEL.PILE','Delivery pile','o7-delivery-pile','Pile table / guides / joggers','Pile alignment reference'],
   ['UTIL.INK','Ink circulation','o7-ink-system','Tank / pump / hoses','Supply-return reference'],
   ['UTIL.CTRL','Machine control','o7-control','Control cabinet / display','Operator-control reference'],
   ['ACCESS.FRAME','Machine frame and galleries','o7-access','Deck / rail / frame','Access inspection reference']
  ];
  for(const [suffix,name,ref,part,specific] of chains){
   const section=suffix.split('.')[0],l3='O7.'+suffix,l4=l3+'.SYS',l5=l4+'.PART',l6=l5+'.SPEC';
   add(l3,name,3,'O7.'+section,[ref],'subassembly');
   add(l4,name+' mechanism',4,l3,[ref],'system');
   add(l5,part,5,l4,[ref],'component');
   add(l6,specific,6,l5,[ref],'part');
  }
  return Object.freeze(rows.map(Object.freeze));
 }
 findNode(id){return this.nodes.find(n=>n.userData.nodeId===id)||null;}
 resolveTaxonomyNode(id){
  const n=this.taxonomyById.get(id);if(!n)return null;
  return n.meshRefs.map(ref=>ref==='offset7-root'?this.root:this.findNode(ref)).find(Boolean)||null;
 }
 resolvePart(object){for(let p=object;p&&p!==this.root;p=p.parent)if(p.userData?.selectable)return p;return null;}
 setExteriorOpen(on){
  this.exteriorOpen=!!on;let count=0;
  this.root.traverse(o=>{if(o.isMesh&&o.userData.exteriorCover){o.visible=!on;count++;}});
  this.root.userData.interiorCutawayVisible=!!on;this.root.userData.exteriorHiddenCount=on?count:0;
 }
 explode(on){
  this.parts.forEach(p=>{p.position.copy(p.userData.rest||new THREE.Vector3());if(on)p.position.add(p.userData.explode||new THREE.Vector3());});
 }
 reset(){this.explode(false);this.setExteriorOpen(false);}
 setLow(){}
 dispose(){for(const g of this.geometries.values())g.dispose();for(const m of this.materials.values())m.dispose();}
}

function sheetPath(){
 // Sheet path passes through the gravure/impression nip then through dryer and delivery.
 return new THREE.CatmullRomCurve3([
  new THREE.Vector3(-3.45,1.08,0),
  new THREE.Vector3(-2.55,1.12,0),
  new THREE.Vector3(-1.72,1.18,0),
  new THREE.Vector3(-.82,1.22,0),
  new THREE.Vector3(-.48,1.28,0),
  new THREE.Vector3(-.32,1.26,0),
  new THREE.Vector3(-.12,1.28,0),
  new THREE.Vector3(.42,1.28,0),
  new THREE.Vector3(1.15,1.27,0),
  new THREE.Vector3(1.82,1.24,0),
  new THREE.Vector3(2.50,1.30,0),
  new THREE.Vector3(3.12,1.12,0),
  new THREE.Vector3(3.28,.94,0)
 ],false,'centripetal',.5);
}

export class Offset7YA1A1ASimulation{
 constructor(machine,template){
  this.machine=machine;this.template=template;
  this.group=new THREE.Group();this.group.name='OFFSET7-YA1A1A-GRAVURE-SIMULATION';machine.add(this.group);
  this.curve=sheetPath();this.pathLength=this.curve.getLength();
  this.sheetLength=.58;this.sheetWidth=.84; // visual only; kept inside the 650x920 reference class
  this.sheetSegmentsL=12;this.sheetSegmentsW=8;
  this.sheetGap=.78;this.sheetCount=7;this.sheets=[];this.pile=[];this.rotors=[];this.suckers=[];this.nozzles=[];
  this.deliveryBars=[];this.joggers=[];this.materials=[];this.geometries=[];
  this.active=false;this.running=false;this.paused=false;this.speed=1;this.elapsed=0;this.lastNow=null;this.completed=0;
  this.pathVisible=false;this.inkFlowVisible=true;this.onUpdate=null;
  this.baseMetersPerSecond=1.30;this.cycleDistance=this.pathLength+this.sheetGap*2;
  this.printCenterX=-.32;this.dryerCenterX=1.15;this.deliveryX=3.18;
  machine.traverse(o=>{
   if(o.isMesh&&o.userData.dynamicRotor)this.rotors.push({mesh:o,sign:o.userData.rotorSign||1,rate:o.userData.rotorRate||1,rest:o.quaternion.clone()});
   if(o.isMesh&&o.userData.suctionCup)this.suckers.push({mesh:o,rest:o.position.clone()});
   if(o.isMesh&&(o.userData.feederAirNozzle||o.userData.hotAirNozzle))this.nozzles.push(o);
   if(o.userData.deliveryGripperBar)this.deliveryBars.push({group:o,rest:o.position.clone(),phase:o.userData.barPhase||0});
   if(o.isMesh&&o.userData.deliveryJogger)this.joggers.push({mesh:o,rest:o.position.clone()});
  });
  this.buildPath();this.buildSheets();this.buildPile();this.buildInkFlow();this.buildDryerAir();
 }
 mat(params){const m=params.basic?new THREE.MeshBasicMaterial(Object.fromEntries(Object.entries(params).filter(([k])=>k!=='basic'))):new THREE.MeshStandardMaterial(params);this.materials.push(m);return m;}
 geo(g){this.geometries.push(g);return g;}
 buildPath(){
  const pts=this.curve.getPoints(180),g=this.geo(new THREE.BufferGeometry().setFromPoints(pts));
  const m=new THREE.LineDashedMaterial({color:0x4bb8c6,dashSize:.06,gapSize:.04,transparent:true,opacity:.55});this.materials.push(m);
  this.pathLine=new THREE.Line(g,m);this.pathLine.computeLineDistances();this.pathLine.visible=false;this.group.add(this.pathLine);
 }
 buildSheets(){
  for(let i=0;i<this.sheetCount;i++){
   const geo=this.geo(makeSheetGeometry(this.sheetSegmentsL,this.sheetSegmentsW));
   const mat=this.mat({color:0xf3eddb,roughness:.90,metalness:0,side:THREE.DoubleSide});
   const mesh=new THREE.Mesh(geo,mat);mesh.visible=false;mesh.frustumCulled=false;mesh.userData.simSheet=true;this.group.add(mesh);
   const grip=new THREE.Mesh(this.geo(new THREE.BoxGeometry(.030,.020,.88)),this.mat({color:0x252d30,roughness:.50,metalness:.45}));
   grip.visible=false;this.group.add(grip);
   this.sheets.push({mesh,grip,phase:i/this.sheetCount,lastCycle:-1,printed:false,lead:new THREE.Vector3(),trail:new THREE.Vector3()});
  }
 }
 buildPile(){
  for(let i=0;i<20;i++){
   const mesh=new THREE.Mesh(this.geo(new THREE.BoxGeometry(.58,.003,.84)),this.mat({color:0xeee7d3,roughness:.92}));
   mesh.visible=false;this.group.add(mesh);this.pile.push(mesh);
  }
 }
 buildInkFlow(){
  const curve=new THREE.CatmullRomCurve3([
   new THREE.Vector3(-.05,.64,1.42),new THREE.Vector3(-.28,.78,1.20),new THREE.Vector3(-.34,.82,.72),
   new THREE.Vector3(-.32,.62,.28),new THREE.Vector3(-.12,.58,.10)
  ],false,'centripetal',.5);
  const tube=new THREE.Mesh(this.geo(new THREE.TubeGeometry(curve,36,.010,6,false)),this.mat({color:0x6e3146,roughness:.38,transparent:true,opacity:.62}));
  this.group.add(tube);this.inkCurve=curve;this.inkTube=tube;this.inkParticles=[];
  const pgeo=this.geo(new THREE.SphereGeometry(.018,7,5)),pmat=this.mat({color:0x79394f,emissive:0x35121f,emissiveIntensity:.25,roughness:.28});
  for(let i=0;i<7;i++){const p=new THREE.Mesh(pgeo,pmat);this.group.add(p);this.inkParticles.push(p);}
 }
 buildDryerAir(){
  this.airParticles=[];
  const g=this.geo(new THREE.SphereGeometry(.010,6,4)),m=this.mat({color:0x65b7c5,transparent:true,opacity:.30,roughness:.5});
  for(let i=0;i<16;i++){const p=new THREE.Mesh(g,m);p.visible=false;this.group.add(p);this.airParticles.push(p);}
 }
 resetMechanisms(){
  this.rotors.forEach(r=>r.mesh.quaternion.copy(r.rest));
  this.suckers.forEach(s=>s.mesh.position.copy(s.rest));
  this.deliveryBars.forEach(b=>b.group.position.copy(b.rest));
  this.joggers.forEach(j=>j.mesh.position.copy(j.rest));
  this.nozzles.forEach(n=>{if(n.material?.emissive){n.material.emissive.setHex(0);n.material.emissiveIntensity=0;}});
  this.airParticles.forEach(p=>p.visible=false);
 }
 updateSheet(s,leadDistance){
  const visible=leadDistance>=this.sheetLength&&leadDistance<=this.pathLength;
  s.mesh.visible=visible;s.grip.visible=visible;if(!visible)return false;
  const pos=s.mesh.geometry.attributes.position,w=this.sheetSegmentsW,l=this.sheetSegmentsL;
  let lead=null,trail=null;
  for(let i=0;i<=l;i++){
   const distance=leadDistance-this.sheetLength*(1-i/l),t=clamp(distance/this.pathLength,0,1),p=this.curve.getPointAt(t);
   if(i===0)trail=p.clone();if(i===l)lead=p.clone();
   for(let j=0;j<=w;j++)pos.setXYZ(i*(w+1)+j,p.x,p.y+.007,-this.sheetWidth/2+j/w*this.sheetWidth);
  }
  pos.needsUpdate=true;s.lead.copy(lead);s.trail.copy(trail);
  const t=clamp(leadDistance/this.pathLength,0,1),tan=this.curve.getTangentAt(t);
  s.grip.position.copy(lead);s.grip.position.y+=.018;s.grip.rotation.z=Math.atan2(tan.y,tan.x);
  if(!s.printed&&lead.x>this.printCenterX+.18){s.printed=true;s.mesh.material.color.setHex(0xe8ddc6);s.mesh.material.roughness=.72;}
  return true;
 }
 deposit(s,cycle){
  if(s.lastCycle===cycle)return;s.lastCycle=cycle;this.completed++;
  const slot=(this.completed-1)%this.pile.length,target=this.pile[slot];target.visible=true;
  const rank=Math.min(this.pile.length-1,this.completed-1);target.position.set(3.18,.58+rank*.004,0);
  s.mesh.visible=false;s.grip.visible=false;
 }
 updateDeliveryBars(){
  this.deliveryBars.forEach(b=>{
   const t=(this.elapsed/2.0+b.phase)%1;
   let x,y;
   if(t<.42){const q=t/.42;x=THREE.MathUtils.lerp(-.42,.42,q);y=1.46;}
   else if(t<.50){const q=(t-.42)/.08;x=.42;y=THREE.MathUtils.lerp(1.46,1.26,q);}
   else if(t<.92){const q=(t-.50)/.42;x=THREE.MathUtils.lerp(.42,-.42,q);y=1.26;}
   else{const q=(t-.92)/.08;x=-.42;y=THREE.MathUtils.lerp(1.26,1.46,q);}
   b.group.position.set(x,y,0);
  });
 }
 updateInk(){
  this.inkTube.visible=this.inkFlowVisible;
  this.inkParticles.forEach((p,i)=>{p.visible=this.inkFlowVisible;if(!p.visible)return;const t=(this.elapsed*.20+i/this.inkParticles.length)%1;p.position.copy(this.inkCurve.getPointAt(t));});
 }
 updateDryerAir(active){
  this.airParticles.forEach((p,i)=>{
   p.visible=active;if(!active)return;
   const phase=(this.elapsed*.52+i/this.airParticles.length)%1;
   const row=i%4,col=Math.floor(i/4);
   p.position.set(.68+phase*.95,1.34+.06*Math.sin(phase*TAU+row),-.54+row*.36);
   p.scale.setScalar(.7+.5*phase);
  });
 }
 update(now){
  if(!this.active||!this.running){this.lastNow=now;return this.state();}
  if(this.lastNow==null)this.lastNow=now;
  const dt=Math.min(.05,Math.max(0,(now-this.lastNow)/1000))*this.speed;this.lastNow=now;this.elapsed+=dt;
  const travelled=this.elapsed*this.baseMetersPerSecond;
  let dryerOccupied=false,printOccupied=false;

  this.rotors.forEach(r=>r.mesh.rotateY(r.sign*r.rate*dt*5.2));
  const cadence=.78,phase=(this.elapsed%cadence)/cadence,pick=phase<.34;
  this.suckers.forEach((s,i)=>{s.mesh.position.copy(s.rest);if(pick)s.mesh.position.y-=.016*Math.sin(Math.PI*clamp(phase/.34));});

  for(let i=0;i<this.sheets.length;i++){
   const absolute=travelled-i*this.sheetGap;
   if(absolute<this.sheetLength){this.sheets[i].mesh.visible=false;this.sheets[i].grip.visible=false;continue;}
   const cycle=Math.floor(absolute/this.cycleDistance),local=((absolute%this.cycleDistance)+this.cycleDistance)%this.cycleDistance;
   if(local>this.pathLength){this.deposit(this.sheets[i],cycle);continue;}
   if(!this.updateSheet(this.sheets[i],local))continue;
   const s=this.sheets[i],min=Math.min(s.lead.x,s.trail.x),max=Math.max(s.lead.x,s.trail.x);
   if(max>this.printCenterX-.45&&min<this.printCenterX+.45)printOccupied=true;
   if(max>this.dryerCenterX-.70&&min<this.dryerCenterX+.70)dryerOccupied=true;
  }

  this.nozzles.forEach(n=>{
   const on=n.userData.hotAirNozzle?dryerOccupied:pick;
   if(n.material?.emissive){n.material.emissive.setHex(on?0x3e9fb5:0);n.material.emissiveIntensity=on?.45:0;}
  });
  this.updateDryerAir(dryerOccupied);this.updateDeliveryBars();this.updateInk();
  const p=this.elapsed*TAU;
  this.joggers.forEach((j,i)=>{j.mesh.position.z=j.rest.z+Math.sin(p*1.6+i*Math.PI)*.008;});
  this.onUpdate?.(this.state());return this.state();
 }
 state(){
  const progress=this.active?(this.elapsed/10)%1:0;
  const stages=['Pile separation','Feedboard / register','Gravure cylinder + doctor blade nip','Hot-air drying','Delivery transport','Delivery pile'];
  return {
   available:true,blocked:false,active:this.active,running:this.running,paused:this.paused,speed:this.speed,
   stage:stages[Math.min(stages.length-1,Math.floor(progress*stages.length))],progress,completed:this.completed,
   sheetsVisible:this.sheets.filter(s=>s.mesh.visible).length,pileSheetsVisible:this.pile.filter(s=>s.visible).length,
   rotorCount:this.rotors.length,mechanismCount:this.rotors.length+this.suckers.length+this.nozzles.length+this.deliveryBars.length,
   inkFlowVisible:this.inkFlowVisible,pathVisible:this.pathVisible,
   processFamily:'SHEETFED_GRAVURE',doctorBladeEngaged:this.active&&this.running,
   uvActive:false,uvInstalledVerified:false,
   simulationBoundary:'YA1A1A_IDENTITY_EXACT__MECHANISM_FAMILY_BOUNDED__NO_HEIDELBERG_OFFSET_TOPOLOGY'
  };
 }
 start(){this.active=true;this.running=true;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.sheets.forEach(s=>{s.lastCycle=-1;s.printed=false;s.mesh.material.color.setHex(0xf3eddb);});this.pile.forEach(p=>p.visible=false);this.resetMechanisms();this.group.visible=true;return this.state();}
 pause(){this.running=false;this.paused=this.active;return this.state();}
 resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;}return this.state();}
 setSpeed(v){this.speed=Math.max(.25,Math.min(4,Number(v)||1));return this.state();}
 setPathVisible(v){this.pathVisible=!!v;this.pathLine.visible=this.pathVisible;return this.state();}
 setInkFlowVisible(v){this.inkFlowVisible=!!v;this.inkTube.visible=this.inkFlowVisible;return this.state();}
 stop(){
  this.active=false;this.running=false;this.paused=false;this.lastNow=null;this.group.visible=false;
  this.sheets.forEach(s=>{s.mesh.visible=false;s.grip.visible=false;});this.resetMechanisms();return this.state();
 }
 reset(){this.stop();this.elapsed=0;this.completed=0;this.pile.forEach(p=>p.visible=false);return this.state();}
 dispose(){
  this.machine.remove(this.group);for(const g of this.geometries)g.dispose();for(const m of this.materials)m.dispose();
 }
}

export default Offset7YA1A1AMachineTemplate;