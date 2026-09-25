// DigitalTwin BMJ — Offset 8 final realism refinement
// Target: HEIDELBERG Speedmaster CX 104-8+LYYL / OFS-8 / XB001916 / 2022
//
// This refiner enriches the CURRENT offset8.js nodes only.
// It does NOT add a second feeder, printing cylinder train, coater, Y section,
// AirTransfer path, brake or delivery; therefore the refinement cannot create
// overlapping duplicate process hardware.
//
// Critical evidence boundary: "LYYL" is preserved as 8 PU + L + Y + Y + L.
// The installed energy technology of Y1/Y2 remains UNASSERTED.

import {Offset8MachineTemplate} from './offset8.js';
import {Offset8PrintingSimulation} from './simulation-offset8.js';
import {OFFSET8_CENTERS,OFFSET8_SPEC} from './data/dimensions-offset8.js';

export const OFFSET8_FINAL_REFINEMENT=Object.freeze({
 id:'OFFSET8_CX104_8LYYL_FINAL_REFINEMENT_R2',
 machine:'Speedmaster CX 104-8+LYYL',
 serial:'XB001916',sap:'OFS-8',
 policy:'ENRICH_EXISTING_NODES_ONLY__Y_ENERGY_TECH_UNASSERTED'
});

export class Offset8CX104RealismTemplate extends Offset8MachineTemplate{
 constructor(){
  super();this.realismMeshes=[];
  this.root.userData.realismPack=OFFSET8_FINAL_REFINEMENT.id;
  this.root.userData.realismPolicy=OFFSET8_FINAL_REFINEMENT.policy;
  this.root.userData.dryerEnergyTechnology='UNASSERTED';
  this.refineExistingModel();this.root.updateMatrixWorld(true);
 }
 tag(mesh,role,{coverMounted=false,service=false,confidence='HEIDELBERG_CX104_FAMILY'}={}){
  if(!mesh)return mesh;mesh.userData.realismMicroDetail=true;mesh.userData.realismRole=role;
  mesh.userData.coverMountedDetail=coverMounted;mesh.userData.serviceDetail=mesh.userData.serviceDetail||service;
  mesh.userData.confidence=confidence;mesh.userData.detail=true;this.realismMeshes.push(mesh);return mesh;
 }
 db(p,s,x,k='graphite',r=.004,role='micro-detail',opts={}){return this.tag(this.box(p,s,x,k,r),role,opts);}
 dc(p,r,l,x,k='steel',role='micro-detail',axis='z',opts={}){return this.tag(this.cyl(p,r,l,x,k,role,axis),role,opts);}
 node(id){return this.findNode(id);}

 refineExistingModel(){
  this.refineFeeder();
  for(let i=1;i<=8;i++)this.refinePrintUnit(i);
  for(const key of ['L1','L2'])this.refineCoater(key);
  for(const key of ['Y1','Y2'])this.refineDryer(key);
  this.refineDelivery();
 }

 refineFeeder(){
  const g=this.node('offset8-feeder');if(!g)return;
  for(const z of [-1.39,1.39]){
   for(const y of [1.05,1.45,1.86,2.20]){
    this.dc(g,.009,.016,[-.88,y,z],'steel','cover-fastener','z',{coverMounted:true});
    this.dc(g,.009,.016,[ .80,y,z],'steel','cover-fastener','z',{coverMounted:true});
   }
   this.db(g,[.030,.28,.022],[.86,1.62,z+(z<0?-.025:.025)],'black',.004,'service-door-handle',{coverMounted:true});
  }
  const head=this.node('offset8-feeder-head');
  if(head)for(const z of [-.58,-.20,.20,.58])this.db(head,[.040,.018,.055],[.45,2.21,z],'steel',.003,'suction-stem-retainer',{service:true});
  const reg=this.node('offset8-register');
  if(reg){
   for(const z of [-.73,.73]){
    const sensor=this.db(reg,[.050,.080,.040],[.52,1.52,z],'blue',.005,'register-edge-sensor',{service:true});
    sensor.userData.sensorModelAsserted=false;
   }
  }
 }

 refinePrintUnit(index){
  const key='PU'+index,id='offset8-'+key.toLowerCase(),g=this.node(id);if(!g)return;
  // CX104 cover language: seams, handles, fasteners only; base housing stays untouched.
  for(const z of [-1.40,1.40]){
   for(const x of [-.38,.38])for(const y of [1.08,1.48,1.88,2.24])this.dc(g,.009,.016,[x,y,z],'steel','cover-fastener','z',{coverMounted:true});
   this.db(g,[.030,.26,.022],[.36,1.63,z+(z<0?-.026:.026)],'black',.004,'service-door-handle',{coverMounted:true});
   this.db(g,[.72,.008,.010],[0,1.36,z+(z<0?-.020:.020)],'black',.001,'panel-seam',{coverMounted:true});
   this.db(g,[.62,.008,.010],[0,2.08,z+(z<0?-.020:.020)],'black',.001,'panel-seam',{coverMounted:true});
  }
  // Bearing-cap visual references on the existing cylinder assembly, not extra cylinders.
  const cylinders=this.node(id+'-cylinders');
  if(cylinders){
   const caps=[[-.12,1.92,'plate'],[.05,1.51,'blanket'],[-.10,1.02,'impression'],[.34,.58,'transfer']];
   for(const [x,y,role] of caps)for(const z of [-1.30,1.30])this.dc(cylinders,.042,.018,[x,y,z],'graphite',role+'-bearing-cap','z',{service:true});
  }
  const ink=this.node(id+'-inking');
  if(ink){
   for(const z of [-.92,.92])this.db(ink,[.050,.026,.038],[-.25,2.73,z],'steel',.004,'ink-fountain-retainer',{service:true});
  }
  const damp=this.node(id+'-dampening');
  if(damp){
   for(const z of [-.86,.86])this.db(damp,[.050,.026,.038],[.34,1.46,z],'steel',.004,'dampening-pan-retainer',{service:true});
  }
  const sheet=this.node(id+'-sheet');
  if(sheet){
   for(const z of [-.82,-.41,0,.41,.82]){
    const clip=this.db(sheet,[.045,.018,.055],[.38,.89,z],'steel',.003,'airtransfer-bar-clip',{service:true});
    clip.userData.moduleKey=key;
   }
  }
  const label=this.db(g,[.18,.075,.012],[.33,2.31,-1.412],'black',.004,'unit-identification-plate',{coverMounted:true});
  label.userData.label=key;label.userData.renderTextInGeometry=false;
 }

 refineCoater(key){
  const id='offset8-'+key.toLowerCase();
  const chamber=this.node(id+'-chamber');
  if(chamber){
   // Clamp screws on the already-existing chamber body/blades.
   for(const z of [-.90,-.45,0,.45,.90]){
    this.dc(chamber,.008,.014,[-.28,2.36,z],'steel','doctor-blade-clamp-fastener','z',{service:true});
    this.dc(chamber,.008,.014,[-.28,2.18,z],'steel','doctor-blade-clamp-fastener','z',{service:true});
   }
  }
  const an=this.node(id+'-anilox');
  if(an)for(const z of [-1.10,1.10])this.dc(an,.035,.018,[.08,2.05,z],'graphite','anilox-bearing-end-cap','z',{service:true});
  const supply=this.node(id+'-supply');
  if(supply){
   for(const z of [.86,1.02])this.db(supply,[.040,.025,.035],[-.28,1.96,z],'steel',.004,'coating-line-retainer',{service:true});
  }
 }

 refineDryer(key){
  const id='offset8-'+key.toLowerCase(),g=this.node(id);if(!g)return;
  // Access details only. No lamp, IR, LED or UV geometry is added.
  for(const z of [-1.30,1.30]){
   for(const y of [1.18,1.60,2.02])this.dc(g,.009,.016,[.36,y,z],'steel','dryer-cover-fastener','z',{coverMounted:true,confidence:'PROCESS_HOUSING_REFERENCE'});
   this.db(g,[.030,.24,.022],[.38,1.60,z+(z<0?-.024:.024)],'black',.004,'dryer-access-handle',{coverMounted:true,confidence:'PROCESS_HOUSING_REFERENCE'});
  }
  const recirc=this.node(id+'-recirc');
  if(recirc)for(const z of [-1.12,1.12])this.db(recirc,[.055,.030,.040],[.31,1.44,z],'steel',.004,'recirculation-plenum-clamp',{service:true});
  g.userData.energyTechnologyVerified=false;
 }

 refineDelivery(){
  const g=this.node('offset8-delivery');if(!g)return;
  for(const z of [-1.44,1.44]){
   for(const y of [1.10,1.52,1.96,2.34])this.dc(g,.009,.016,[-1.45,y,z],'steel','delivery-cover-fastener','z',{coverMounted:true});
  }
  const chain=this.node('offset8-delivery-chain');
  if(chain){
   for(const z of [-1.02,1.02])for(const x of [-.90,0,.90])this.dc(chain,.010,.040,[x,1.95,z],'steel','chain-lubrication-nozzle','y',{service:true});
  }
  const brake=this.node('offset8-delivery-brake');
  if(brake){
   for(const z of [-.68,-.23,.23,.68])this.db(brake,[.040,.035,.025],[1.03,1.31,z],'steel',.003,'sheet-brake-bearing-stop',{service:true});
  }
 }

 setExteriorOpen(on=true){
  if(typeof Offset8MachineTemplate.prototype.setExteriorOpen==='function')Offset8MachineTemplate.prototype.setExteriorOpen.call(this,on);
  for(const m of this.realismMeshes)if(m.userData.coverMountedDetail)m.visible=!on;
  return this;
 }
 setLow(on){
  if(typeof Offset8MachineTemplate.prototype.setLow==='function')Offset8MachineTemplate.prototype.setLow.call(this,on);
  for(const m of this.realismMeshes)m.visible=!on;return this;
 }
}

export class Offset8CX104RealismSimulation extends Offset8PrintingSimulation{
 constructor(root,template){
  super(root,template);this.realismPack=OFFSET8_FINAL_REFINEMENT.id;
  // Prevent decorative/cover details from becoming moving rotors even if a future merge
  // accidentally copies a motion tag onto them.
  this.rotors=this.rotors.filter(m=>!m.userData?.exteriorCover&&!m.userData?.coverMountedDetail&&!m.userData?.serviceDetail);
  this.suckers=this.suckers.filter(m=>!m.userData?.exteriorCover);
  this.deliveryBars=this.deliveryBars.filter(g=>!g.userData?.exteriorCover);
 }
 state(){
  return {...super.state(),
   realismPack:this.realismPack,
   duplicateProcessHardwareAdded:false,
   installedSequence:OFFSET8_SPEC.configuration,
   dryerEnergyTechnology:'UNASSERTED',
   motionPolicy:'BASE_CX104_PROCESS_MOTION__DECORATIVE_DETAILS_STATIC'};
 }
}

export default Offset8CX104RealismTemplate;