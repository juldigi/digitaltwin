// DigitalTwin BMJ — Offset 9 final realism refinement
// Target: HEIDELBERG Speedmaster SX 52-4+L / OFS-9 / GS001804 / 2024
//
// The current offset9.js already contains the functional SX52 architecture.
// This file enriches those nodes only and never creates a second feeder,
// printing unit, coater or delivery.
//
// Installed-option discipline:
// 4 printing units + inline coating = asserted.
// Perfecting, Anicolor, UV/LE-UV/LED-UV, DryStar and high-pile delivery = not asserted.

import {Offset9MachineTemplate} from './offset9.js';
import {Offset9PrintingSimulation} from './simulation-offset9.js';
import {OFFSET9_SPEC} from './data/dimensions-offset9.js';

export const OFFSET9_FINAL_REFINEMENT=Object.freeze({
 id:'OFFSET9_SX52_4L_FINAL_REFINEMENT_R2',
 machine:'Speedmaster SX 52-4+L',serial:'GS001804',sap:'OFS-9',
 policy:'EXISTING_NODE_ENRICHMENT__NO_UNVERIFIED_OPTION_GEOMETRY'
});

export class Offset9SX52RealismTemplate extends Offset9MachineTemplate{
 constructor(){
  super();this.realismMeshes=[];
  this.root.userData.realismPack=OFFSET9_FINAL_REFINEMENT.id;
  this.root.userData.realismPolicy=OFFSET9_FINAL_REFINEMENT.policy;
  this.refineExistingModel();this.root.updateMatrixWorld(true);
 }
 tag(m,role,{coverMounted=false,service=false,confidence='SX52_OFFICIAL_FAMILY'}={}){
  if(!m)return m;m.userData.realismMicroDetail=true;m.userData.realismRole=role;m.userData.coverMountedDetail=coverMounted;
  m.userData.serviceDetail=m.userData.serviceDetail||service;m.userData.confidence=confidence;m.userData.detail=true;this.realismMeshes.push(m);return m;
 }
 db(p,s,x,k='graphite',r=.004,role='micro-detail',opts={}){return this.tag(this.box(p,s,x,k,r),role,opts);}
 dc(p,r,l,x,k='steel',role='micro-detail',axis='z',opts={}){return this.tag(this.cyl(p,r,l,x,k,role,axis),role,opts);}
 node(id){return this.findNode(id);}

 refineExistingModel(){
  this.refineFeeder();
  for(let i=1;i<=4;i++)this.refinePrintUnit(i);
  this.refineCoater();this.refineDelivery();this.refineConsole();
 }
 refineFeeder(){
  const g=this.node('offset9-feeder');if(!g)return;
  for(const z of [-.98,.98]){
   for(const y of [.92,1.28,1.64,1.96]){
    this.dc(g,.008,.014,[-.78,y,z],'steel','cover-fastener','z',{coverMounted:true});
    this.dc(g,.008,.014,[ .68,y,z],'steel','cover-fastener','z',{coverMounted:true});
   }
   this.db(g,[.026,.22,.020],[.72,1.48,z+(z<0?-.022:.022)],'black',.003,'service-door-handle',{coverMounted:true});
  }
  const tape=this.node('offset9-register-suction-tape');
  if(tape){
   // Tiny perforation markers sit on the existing central tape, not a duplicate belt.
   for(let x=-.44;x<=.44;x+=.11)for(const z of [-.045,0,.045]){
    const hole=this.dc(tape,.004,.005,[x,1.236,z],'black','suction-tape-perforation','y',{service:true});
    hole.userData.representativePattern=true;
   }
  }
  const head=this.node('offset9-feeder-head');
  if(head)for(const z of [-.42,-.14,.14,.42])this.db(head,[.035,.016,.045],[.37,1.78,z],'steel',.003,'suction-stem-retainer',{service:true});
 }
 refinePrintUnit(index){
  const id='offset9-pu'+index,g=this.node(id);if(!g)return;
  for(const z of [-1.04,1.04]){
   for(const x of [-.31,.31])for(const y of [1.02,1.38,1.74,2.06])this.dc(g,.008,.014,[x,y,z],'steel','cover-fastener','z',{coverMounted:true});
   this.db(g,[.026,.22,.020],[.30,1.48,z+(z<0?-.022:.022)],'black',.003,'service-door-handle',{coverMounted:true});
   this.db(g,[.60,.007,.010],[0,1.28,z+(z<0?-.018:.018)],'black',.001,'panel-seam',{coverMounted:true});
  }
  const cyl=this.node(id+'-cylinders');
  if(cyl){
   const caps=[[-.08,.88,'impression'],[.04,1.31,'blanket'],[.33,.52,'transfer']];
   for(const [x,y,r] of caps)for(const z of [-.875,.875])this.dc(cyl,.034,.016,[x,y,z],'graphite',r+'-bearing-cap','z',{service:true});
  }
  const ink=this.node(id+'-inking');
  if(ink)for(const z of [-.60,.60])this.db(ink,[.040,.022,.030],[-.18,2.26,z],'steel',.003,'ink-fountain-retainer',{service:true});
  const damp=this.node(id+'-dampening');
  if(damp)for(const z of [-.58,.58])this.db(damp,[.040,.022,.030],[.28,1.46,z],'steel',.003,'dampening-retainer',{service:true});
  const label=this.db(g,[.15,.065,.010],[.26,2.14,-1.06],'black',.004,'unit-identification-plate',{coverMounted:true});label.userData.label='PU'+index;
 }
 refineCoater(){
  const chamber=this.node('offset9-l-chamber');
  if(chamber){
   for(const z of [-.62,-.31,0,.31,.62]){
    this.dc(chamber,.007,.012,[-.22,1.91,z],'steel','doctor-blade-clamp-fastener','z',{service:true});
    this.dc(chamber,.007,.012,[-.22,1.75,z],'steel','doctor-blade-clamp-fastener','z',{service:true});
   }
  }
  const an=this.node('offset9-l-meter');
  if(an)for(const z of [-.77,.77])this.dc(an,.030,.014,[.05,1.68,z],'graphite','anilox-bearing-end-cap','z',{service:true});
  const supply=this.node('offset9-l-supply');
  if(supply)for(const z of [-.60,.60])this.db(supply,[.040,.024,.034],[-.28,1.55,z],'steel',.003,'coating-line-retainer',{service:true});
 }
 refineDelivery(){
  const g=this.node('offset9-delivery');if(!g)return;
  for(const z of [-.98,.98])for(const y of [1.08,1.42,1.78,2.02])this.dc(g,.008,.014,[-.90,y,z],'steel','delivery-cover-fastener','z',{coverMounted:true});
  const chain=this.node('offset9-delivery-chain');
  if(chain)for(const z of [-.82,.82])for(const x of [-.58,0,.58])this.dc(chain,.009,.035,[x,1.74,z],'steel','chain-lubrication-nozzle','y',{service:true});
  const brake=this.node('offset9-delivery-brake');
  if(brake)for(const z of [-.58,-.20,.20,.58])this.db(brake,[.035,.030,.024],[.72,1.20,z],'steel',.003,'sheet-brake-stop',{service:true});
 }
 refineConsole(){
  const g=this.node('offset9-console');if(!g)return;
  for(const x of [-.30,.30])this.dc(g,.008,.014,[x,1.04,-.02],'steel','console-panel-fastener','z',{coverMounted:true});
  const plate=this.db(g,[.26,.075,.010],[0,.60,-.25],'black',.004,'console-identification-plate',{coverMounted:true});
  plate.userData.label='SX 52-4+L';plate.userData.installedConsoleVariantVerified=false;
 }
 setExteriorOpen(on=true){
  if(typeof Offset9MachineTemplate.prototype.setExteriorOpen==='function')Offset9MachineTemplate.prototype.setExteriorOpen.call(this,on);
  for(const m of this.realismMeshes)if(m.userData.coverMountedDetail)m.visible=!on;return this;
 }
 setLow(on){
  if(typeof Offset9MachineTemplate.prototype.setLow==='function')Offset9MachineTemplate.prototype.setLow.call(this,on);
  for(const m of this.realismMeshes)m.visible=!on;return this;
 }
}

export class Offset9SX52RealismSimulation extends Offset9PrintingSimulation{
 constructor(root,template){
  super(root,template);this.realismPack=OFFSET9_FINAL_REFINEMENT.id;
  this.rotors=this.rotors.filter(m=>!m.userData?.exteriorCover&&!m.userData?.coverMountedDetail&&!m.userData?.serviceDetail);
  this.suckers=this.suckers.filter(m=>!m.userData?.exteriorCover);
  this.deliveryBars=this.deliveryBars.filter(g=>!g.userData?.exteriorCover);
 }
 state(){
  return {...super.state(),realismPack:this.realismPack,installedConfiguration:OFFSET9_SPEC.configuration,
   duplicateProcessHardwareAdded:false,
   forbiddenInstalledAssumptions:['perfecting','Anicolor','UV/LE-UV/LED-UV','DryStar','high-pile delivery'],
   motionPolicy:'INSTALLED_4_PLUS_L_MECHANISMS_ONLY'};
 }
}

export default Offset9SX52RealismTemplate;