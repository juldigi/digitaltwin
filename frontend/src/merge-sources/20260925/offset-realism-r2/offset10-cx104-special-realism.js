// DigitalTwin BMJ — Offset 10 final realism refinement
// Target: HEIDELBERG CX104-2-LY-8-LY-1-LX3 custom BMJ press.
//
// The existing offset10.js already contains the project-specific 11 print units,
// 3 coating units, 2 Y/UV sections, FoilStar on PU2, X3 delivery, documented
// peripherals and project UV topology. This file therefore NEVER recreates them.
// It only adds micro-detail directly to existing nodes and hardens the simulation
// against decorative-cover motion.
//
// Project documents remain the geometry/configuration source of truth.

import {Offset10MachineTemplate} from './offset10.js';
import {Offset10PrintingSimulation} from './simulation-offset10.js';
import {
 OFFSET10_DIMENSIONS,OFFSET10_MODULE_SEQUENCE,OFFSET10_MODULE_CENTERS,
 OFFSET10_PRINTING_UNIT_KEYS,OFFSET10_COATING_UNIT_KEYS,OFFSET10_Y_UNIT_KEYS
} from './data/dimensions-offset10.js';

export const OFFSET10_FINAL_REFINEMENT=Object.freeze({
 id:'OFFSET10_CX104_SPECIAL_FINAL_REFINEMENT_R2',
 configuration:'CX104-2-LY-8-LY-1-LX3',
 policy:'PROJECT_DOCUMENT_FIRST__EXISTING_NODE_ENRICHMENT_ONLY',
 verified:{
  modulePitch:OFFSET10_DIMENSIONS.verified.modulePitch,
  elevation:OFFSET10_DIMENSIONS.verified.pressElevation,
  printingUnits:OFFSET10_DIMENSIONS.verified.printingUnitCount,
  coatingUnits:OFFSET10_DIMENSIONS.verified.coatingUnitCount,
  yUnits:OFFSET10_DIMENSIONS.verified.yUnitCount,
  interdeckUV:OFFSET10_DIMENSIONS.verified.interdeckUvLampCount,
  eopUV:OFFSET10_DIMENSIONS.verified.endOfPressUvLampCount,
  foilRollCapacity:OFFSET10_DIMENSIONS.verified.foilStarRollCapacity,
  deliveryExtensions:OFFSET10_DIMENSIONS.verified.deliveryExtensionModules
 }
});

export class Offset10CX104SpecialRealismTemplate extends Offset10MachineTemplate{
 constructor(){
  super();this.realismMeshes=[];
  this.root.userData.realismPack=OFFSET10_FINAL_REFINEMENT.id;
  this.root.userData.realismPolicy=OFFSET10_FINAL_REFINEMENT.policy;
  this.refineExistingModel();this.root.updateMatrixWorld(true);
 }
 tag(m,role,{coverMounted=false,service=false,confidence='O10_PROJECT_PLUS_OEM_FAMILY'}={}){
  if(!m)return m;m.userData.realismMicroDetail=true;m.userData.realismRole=role;m.userData.coverMountedDetail=coverMounted;
  m.userData.serviceDetail=m.userData.serviceDetail||service;m.userData.confidence=confidence;m.userData.detail=true;this.realismMeshes.push(m);return m;
 }
 db(p,s,x,k='graphite',r=.004,role='micro-detail',opts={}){return this.tag(this.box(p,s,x,k,r),role,opts);}
 dc(p,r,l,x,k='steel',axis='z',role='micro-detail',opts={}){return this.tag(this.cylinder(p,r,l,x,k,axis),role,opts);}
 node(id){return this.findNode(id);}

 refineExistingModel(){
  this.refineFeeder();
  OFFSET10_PRINTING_UNIT_KEYS.forEach(k=>this.refinePrintUnit(k));
  OFFSET10_COATING_UNIT_KEYS.forEach(k=>this.refineCoater(k));
  OFFSET10_Y_UNIT_KEYS.forEach(k=>this.refineYUnit(k));
  this.refineFoilStar();this.refineDelivery();this.refinePeripherals();
 }
 refineFeeder(){
  const g=this.node('o10-feeder');if(!g)return;
  for(const z of [-1.48,1.48]){
   for(const y of [1.04,1.46,1.88,2.26]){
    this.dc(g,.009,.016,[-1.10,y,z],'steel','z','cover-fastener',{coverMounted:true});
    this.dc(g,.009,.016,[ .95,y,z],'steel','z','cover-fastener',{coverMounted:true});
   }
   this.db(g,[.030,.28,.022],[1.00,1.60,z+(z<0?-.025:.025)],'black',.004,'feeder-service-handle',{coverMounted:true});
  }
  const head=this.node('o10-feeder-head');
  if(head)for(const z of [-.68,-.34,0,.34,.68])this.db(head,[.045,.018,.050],[.45,2.20,z],'steel',.003,'suction-stem-retainer',{service:true});
  const air=this.node('o10-feeder-air');
  if(air)for(const z of [-.75,-.50,-.25,0,.25,.50,.75])this.db(air,[.040,.022,.040],[.50,1.75,z],'steel',.003,'air-nozzle-retainer',{service:true});
 }
 refinePrintUnit(key){
  const id='o10-'+key.toLowerCase(),g=this.node(id);if(!g)return;
  for(const z of [-1.48,1.36]){
   for(const x of [-.34,.34])for(const y of [1.06,1.46,1.88,2.28])this.dc(g,.009,.016,[x,y,z],'steel','z','cover-fastener',{coverMounted:true});
   this.db(g,[.030,.27,.022],[.34,1.62,z+(z<0?-.025:.025)],'black',.004,'service-door-handle',{coverMounted:true});
   this.db(g,[.68,.008,.010],[0,1.34,z+(z<0?-.020:.020)],'black',.001,'panel-seam',{coverMounted:true});
   this.db(g,[.60,.008,.010],[0,2.10,z+(z<0?-.020:.020)],'black',.001,'panel-seam',{coverMounted:true});
  }
  const air=this.node(id+'-airtransfer');
  if(air)for(const z of [-.72,0,.72])this.db(air,[.045,.018,.050],[.42,.87,z],'steel',.003,'airtransfer-manifold-clip',{service:true});
  const ink=this.node(id+'-inking');
  if(ink)for(const z of [-.90,.90])this.db(ink,[.045,.024,.035],[-.32,2.67,z],'steel',.003,'ink-fountain-retainer',{service:true});
  const label=this.db(g,[.18,.075,.012],[.31,2.38,-1.49],'black',.004,'unit-identification-plate',{coverMounted:true});
  label.userData.label=key;
 }
 refineCoater(key){
  const id='o10-'+key.toLowerCase();
  const chamber=this.node(id+'-chamber');
  if(chamber){
   for(const z of [-.90,-.45,0,.45,.90]){
    this.dc(chamber,.008,.014,[-.27,2.285,z],'steel','z','doctor-blade-clamp-fastener',{service:true});
    this.dc(chamber,.008,.014,[-.27,2.155,z],'steel','z','doctor-blade-clamp-fastener',{service:true});
   }
  }
  const an=this.node(id+'-anilox');
  if(an)for(const z of [-1.15,1.15])this.dc(an,.034,.016,[-.10,2.01,z],'graphite','z','anilox-bearing-end-cap',{service:true});
  const supply=this.node(id+'-supply');
  if(supply)for(const y of [1.30,1.62,1.94])this.db(supply,[.045,.026,.038],[-.43,y,.91],'steel',.003,'coating-hose-retainer',{service:true});
 }
 refineYUnit(key){
  const id='o10-'+key.toLowerCase(),g=this.node(id);if(!g)return;
  // Do not create lamps: the base model already has the three documented cassettes.
  for(const z of [-1.40,1.26]){
   for(const y of [1.45,1.82,2.16])this.dc(g,.009,.016,[.34,y,z],'steel','z','uv-housing-fastener',{coverMounted:true,confidence:'O10_UV_LAYOUT'});
   this.db(g,[.030,.24,.022],[.36,1.80,z+(z<0?-.024:.024)],'black',.004,'uv-service-handle',{coverMounted:true,confidence:'O10_UV_LAYOUT'});
  }
  const uv=this.node(id+'-uv');
  if(uv){
   // Cooling couplings / cable glands around the existing cassette bank.
   for(const z of [-.92,.92]){
    const c=this.dc(uv,.016,.040,[.31,1.98,z],'blue','z','uv-cooling-coupling',{service:true,confidence:'O10_UV_LAYOUT'});
    c.userData.flowSettingAsserted=false;
    this.dc(uv,.014,.035,[-.31,2.04,z],'graphite','z','uv-cassette-cable-gland',{service:true,confidence:'O10_UV_LAYOUT'});
   }
  }
 }
 refineFoilStar(){
  const rolls=this.node('o10-foilstar-rolls');
  if(rolls){
   // End caps / core retainers on existing 6 unwind + rewind positions.
   const zPositions=[-.90,-.54,-.18,.18,.54,.90];
   for(const z of zPositions){
    this.dc(rolls,.052,.022,[-.08,3.82,z+.12],'graphite','z','foil-unwind-core-retainer',{service:true,confidence:'O10_PROPOSAL'});
    this.dc(rolls,.045,.022,[ .17,3.27,z+.12],'graphite','z','foil-rewind-core-retainer',{service:true,confidence:'O10_PROPOSAL'});
   }
  }
  const sensors=this.node('o10-foilstar-sensors');
  if(sensors){
   for(const z of [-.90,-.54,-.18,.18,.54,.90]){
    const edge=this.db(sensors,[.045,.070,.025],[-.03,3.49,z],'blue',.004,'foil-web-edge-sensor-reference',{service:true,confidence:'FOILSTAR_FAMILY_REFERENCE'});
    edge.userData.exactSensorCountAsserted=false;
   }
  }
  const ctrl=this.node('o10-foilstar-control');
  if(ctrl){
   const plate=this.db(ctrl,[.18,.065,.010],[.52,2.66,-1.475],'black',.004,'foilstar-identification-plate',{coverMounted:true});
   plate.userData.label='FoilStar · PU2';plate.userData.generation='GEN3_PROJECT_RECORD';
  }
 }
 refineDelivery(){
  const g=this.node('o10-delivery');if(!g)return;
  const x3=this.node('o10-delivery-x3');
  if(x3){
   for(const x of [-1.28,-.05,1.18])for(const z of [-1.42,1.26])for(const y of [1.62,2.02,2.42]){
    this.dc(x3,.009,.016,[x+.40,y,z],'steel','z','x3-cover-fastener',{coverMounted:true,confidence:'O10_FINAL_DRAWING'});
   }
  }
  const chain=this.node('o10-delivery-chain');
  if(chain)for(const z of [-1.00,1.00])for(const x of [-1.20,-.40,.40,1.20])this.dc(chain,.010,.040,[x,1.50,z],'steel','y','chain-lubrication-nozzle',{service:true});
  const brake=this.node('o10-delivery-sheet-brake');
  if(brake)for(const z of [-.62,0,.62])this.db(brake,[.045,.035,.028],[1.42,1.36,z],'steel',.003,'sheet-brake-bearing-stop',{service:true});
  const pile=this.node('o10-delivery-pile');
  if(pile)for(const z of [-.78,.78])this.db(pile,[.045,.035,.030],[1.64,1.18,z],'steel',.003,'pile-guide-stop',{service:true});
 }
 refinePeripherals(){
  // Identification/connection microdetail follows each existing cabinet body's actual
  // local bounding box, preventing labels/glands from floating at a shared origin.
  for(const id of ['o10-central-cabinet','o10-airstar','o10-combistar','o10-filterstar','o10-scrollstar','o10-lvg600','o10-coatingstar','o10-uv-xlc','o10-uv-exhaust']){
   const g=this.node(id);if(!g)continue;
   const body=g.children.find(o=>o.isMesh);if(!body)continue;
   body.geometry.computeBoundingBox();const bb=body.geometry.boundingBox;
   const sx=bb.max.x-bb.min.x,sy=bb.max.y-bb.min.y,sz=bb.max.z-bb.min.z;
   const x=body.position.x,y=body.position.y,z=body.position.z;
   const name=g.name||id;
   const plate=this.db(g,[Math.min(.28,sx*.55),.075,.012],[x,y+sy*.18,z-sz/2-.010],'black',.004,'peripheral-identification-plate',{coverMounted:true,confidence:'O10_TECH_DATA'});
   plate.userData.label=name;plate.userData.renderTextInGeometry=false;
   for(const dx of [-.18,0,.18].map(v=>v*Math.min(1,sx/.72)))this.dc(g,.012,.035,[x+dx,y-sy*.36,z-sz/2-.018],'graphite','z','cabinet-cable-gland',{service:true,confidence:'VISUAL_SERVICE_DETAIL'});
  }
 }
 setExteriorOpen(on=true){
  if(typeof Offset10MachineTemplate.prototype.setExteriorOpen==='function')Offset10MachineTemplate.prototype.setExteriorOpen.call(this,on);
  for(const m of this.realismMeshes)if(m.userData.coverMountedDetail)m.visible=!on;return this;
 }
 setLow(on){
  if(typeof Offset10MachineTemplate.prototype.setLow==='function')Offset10MachineTemplate.prototype.setLow.call(this,on);
  for(const m of this.realismMeshes)m.visible=!on;return this;
 }
}

export class Offset10CX104SpecialRealismSimulation extends Offset10PrintingSimulation{
 constructor(machine,template){
  super(machine,template);this.realismPack=OFFSET10_FINAL_REFINEMENT.id;
  this.rotors=this.rotors.filter(r=>!r.mesh?.userData?.exteriorCover&&!r.mesh?.userData?.coverMountedDetail&&!r.mesh?.userData?.serviceDetail);
  this.oscillators=this.oscillators.filter(o=>!o.object?.userData?.exteriorCover&&!o.object?.userData?.coverMountedDetail);
  this.foil=this.foil.filter(f=>!f.mesh?.userData?.exteriorCover&&!f.mesh?.userData?.coverMountedDetail);
 }
 state(){
  return {...super.state(),realismPack:this.realismPack,
   projectConfiguration:OFFSET10_FINAL_REFINEMENT.configuration,
   verifiedCounts:OFFSET10_FINAL_REFINEMENT.verified,
   duplicateProcessHardwareAdded:false,
   motionPolicy:'PROJECT_DOCUMENTED_MOVING_PARTS_ONLY__NO_COVER_OR_SERVICE_MOTION',
   occupancyPolicy:'FULL_SHEET_LOCAL_PROCESS_OCCUPANCY_FROM_BASE_SIMULATION'};
 }
}

export default Offset10CX104SpecialRealismTemplate;