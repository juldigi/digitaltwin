// DigitalTwin BMJ — Offset 5 final realism refinement
// Target: HEIDELBERG Speedmaster CD 102-8+L / OFU-1 / serial 550415
//
// LIVE MERGE POLICY:
// - This file DOES NOT replace the current photo/DXF/OEM-grounded geometry.
// - It deliberately reuses and enriches existing nodes in offset5.js.
// - No second coater, dryer, Focusight bridge, feeder, delivery, cylinder train or
//   printing unit is created; this prevents duplicate/overlapping hardware.
// - Added geometry is micro-detail only: fasteners, hinges, interlock bodies,
//   cable/hose retainers, labels and small service hardware.
// - Simulation hardening removes any accidental cover/service mesh from the moving
//   rotor/oscillator lists, while leaving the current detailed process simulation intact.

import {OffsetMachineTemplate} from './offset5.js';
import {PrintingSimulation} from './simulation.js';
import {OFFSET5_UNIT_CENTERS} from './data/dimensions-offset5.js';

export const OFFSET5_FINAL_REFINEMENT=Object.freeze({
  id:'OFFSET5_CD102_8L_FINAL_REFINEMENT_R2',
  machine:'Heidelberg Speedmaster CD 102-8+L',
  asset:'MACHINE-OFFSET5',
  sap:'OFU-1',
  serial:'550415',
  policy:'ENRICH_EXISTING_NODES_ONLY__NO_DUPLICATE_PROCESS_HARDWARE',
  sourcePriority:[
    'BMJ Offset 5 photos + calibrated DXF',
    'supplied CD102 OEM service/roller documentation',
    'HEIDELBERG CD102 family product information'
  ]
});

export class Offset5CD102RealismTemplate extends OffsetMachineTemplate{
  constructor(){
    super();
    this.realismMeshes=[];
    this.root.userData.realismPack=OFFSET5_FINAL_REFINEMENT.id;
    this.root.userData.realismPolicy=OFFSET5_FINAL_REFINEMENT.policy;
    this.refineExistingModel();
    this.root.updateMatrixWorld(true);
  }

  tag(mesh,role,{coverMounted=false,service=false,silhouette=false,confidence='PHOTO_OEM_REFERENCE'}={}){
    if(!mesh)return mesh;
    mesh.userData.realismMicroDetail=true;
    mesh.userData.realismRole=role;
    mesh.userData.confidence=confidence;
    mesh.userData.coverMountedDetail=coverMounted;
    mesh.userData.serviceDetail=mesh.userData.serviceDetail||service;
    mesh.userData.detail=true;
    if(silhouette)mesh.userData.silhouetteCritical=true;
    this.realismMeshes.push(mesh);
    return mesh;
  }
  db(parent,size,pos,kind='graphite',radius=.004,role='micro-detail',opts={}){
    return this.tag(this.box(parent,size,pos,kind,radius),role,opts);
  }
  dc(parent,r,len,pos,kind='steel',axis='z',role='micro-detail',opts={}){
    return this.tag(this.cylinder(parent,r,len,pos,kind,axis),role,opts);
  }
  node(id){return this.findNode(id);}

  refineExistingModel(){
    this.refinePrintingUnits();
    this.refineFeeder();
    this.refineCoater();
    this.refineInspection();
    this.refineDelivery();
    this.refineExteriorIdentityV237();
  }

  refineExteriorIdentityV237(){
    this.root.userData.visualRefinement='V237_CD102_8L_PHOTO_SERVICE_IDENTITY';
    this.root.userData.homeDetailGeometryPolicy='SAME_LIVE_CD102_TEMPLATE__PHOTO_VISIBLE_SERVICE_DNA_RETAINED';
    this.root.userData.visualEvidenceBoundary='BMJ_OFFSET5_PHOTOS_DXF_AND_CD102_FAMILY__NO_NEW_INSTALLED_PROCESS_HARDWARE';
    for(let i=0;i<8;i++){
      const unit=this.node(`press-${i+1}`);if(!unit)continue;
      const trim=this.db(unit,[.60,.075,.020],[0,.67,-1.305],'black',.006,'operator-side-lower-service-trim',{coverMounted:true,silhouette:true});
      trim.userData.unitIndex=i+1;
      const plate=this.realismMeshes.find(m=>m.userData?.realismRole==='unit-identification-plate'&&m.userData?.label===`PU${i+1}`);
      if(plate)plate.userData.silhouetteCritical=true;
      for(const x of [-.34,.34]){
        const hinge=this.dc(unit,.012,.10,[x,1.58,-1.315],'steel','y','operator-service-door-hinge',{coverMounted:true,service:true});
        hinge.userData.unitIndex=i+1;
      }
    }
    const feeder=this.node('feeder-frame');
    if(feeder){
      const sill=this.db(feeder,[.82,.08,.024],[-.05,.72,-1.175],'black',.006,'feeder-open-rear-service-sill',{coverMounted:true,silhouette:true});
      sill.userData.rearRemainsOpen=true;
    }
    const delivery=this.node('delivery-frame');
    if(delivery)this.db(delivery,[.72,.08,.022],[.08,.70,-1.12],'black',.006,'delivery-service-fascia-reference',{coverMounted:true,silhouette:true});
  }
  refinePrintingUnits(){
    for(let i=0;i<8;i++){
      const unit=this.node(`press-${i+1}`);
      if(!unit)continue;

      // Cover seams / quarter-turn fasteners on the existing housing.
      for(const z of [-1.285,1.285]){
        for(const y of [1.02,1.42,1.82,2.18]){
          this.dc(unit,.010,.016,[-.40,y,z+(z<0?-.012:.012)],'steel','z','cover-fastener',{coverMounted:true});
          this.dc(unit,.010,.016,[ .40,y,z+(z<0?-.012:.012)],'steel','z','cover-fastener',{coverMounted:true});
        }
        this.db(unit,[.030,.245,.022],[.43,1.62,z+(z<0?-.020:.020)],'black',.004,'service-door-handle',{coverMounted:true});
        this.db(unit,[.70,.008,.010],[0,1.31,z+(z<0?-.018:.018)],'black',.001,'panel-seam',{coverMounted:true});
        this.db(unit,[.70,.008,.010],[0,1.96,z+(z<0?-.018:.018)],'black',.001,'panel-seam',{coverMounted:true});
      }

      // Door hinges + safety interlock target on the existing service-access node.
      const access=this.node(`press-${i}-service-access`);
      if(access){
        for(const z of [-.75,.75]){
          this.dc(access,.012,.11,[.37,1.26,z],'steel','y','service-door-hinge',{coverMounted:true});
          this.dc(access,.012,.11,[.37,1.68,z],'steel','y','service-door-hinge',{coverMounted:true});
        }
        const sw=this.db(access,[.055,.090,.035],[.47,1.20,-.77],'graphite',.006,'guard-interlock-body',{coverMounted:true});
        sw.userData.safetyFunction='GUARD_INTERLOCK_VISUAL_REFERENCE';
      }

      // Small retainers on the already-existing lubrication and pneumatic systems.
      const lube=this.node(`press-${i}-lubrication`);
      if(lube){
        for(let n=0;n<4;n++){
          this.db(lube,[.040,.018,.026],[-.41+n*.048,.62,-.995],'steel',.003,'lubrication-line-retainer',{service:true});
        }
      }
      const pneu=this.node(`press-${i}-pneumatic-service`);
      if(pneu){
        for(let n=0;n<4;n++){
          this.dc(pneu,.012,.030,[-.30+n*.058,1.055,-1.00],n%2?'blue':'steel','z','pneumatic-pushfit-collar',{service:true});
        }
        const silencer=this.dc(pneu,.018,.055,[-.06,1.16,-1.035],'steel','z','pneumatic-exhaust-silencer',{service:true});
        silencer.userData.flowSettingAsserted=false;
      }

      // Bearing inspection rings at the ends of the already-existing main cylinder nodes.
      for(const slug of ['plate','blanket','impression','transfer']){
        const cyl=this.node(`press-${i}-cylinder-${slug}`);
        if(!cyl)continue;
        for(const z of [-.73,.73]){
          this.dc(cyl,.040,.018,[slug==='transfer'?.34:slug==='impression'?.16:slug==='blanket'?.11:.17,
            slug==='plate'?1.995:slug==='blanket'?1.55:slug==='impression'?1.04:.70,z],
            'graphite','z',`${slug}-bearing-cap-reference`,{service:true,confidence:'OEM_FUNCTIONAL_REFERENCE'});
        }
      }

      // Visual machine/unit plate on OS; text is metadata so renderer/UI may draw it later.
      const plate=this.db(unit,[.22,.085,.012],[.33,2.31,-1.302],'black',.005,'unit-identification-plate',{coverMounted:true});
      plate.userData.label=`PU${i+1}`;
      plate.userData.renderTextInGeometry=false;
    }
  }

  refineFeeder(){
    const head=this.node('feeder-head');
    if(head){
      for(const z of [-.58,-.29,0,.29,.58]){
        this.db(head,[.055,.018,.040],[.18,1.91,z],'steel',.003,'suction-bar-clamp',{service:true});
      }
    }
    const air=this.node('feeder-air');
    if(air){
      for(const z of [-.60,-.30,0,.30,.60]){
        this.db(air,[.035,.024,.055],[-.42,1.50,z],'graphite',.003,'air-nozzle-retainer',{service:true});
      }
    }
    const frame=this.node('feeder-frame');
    if(frame){
      // Frame ID plate makes the open rear service space read as intentional,
      // without creating a fake rear cover.
      const id=this.db(frame,[.34,.12,.014],[-.05,2.55,-1.17],'black',.006,'feeder-identification-plate',{coverMounted:true});
      id.userData.label='CD 102 FEEDER';id.userData.rearRemainsOpen=true;
    }
  }

  refineCoater(){
    const locks=this.node('coater-chamber-locks');
    if(locks){
      for(const z of [-.77,.77]){
        for(const y of [1.76,1.84,1.92]){
          this.dc(locks,.009,.018,[-.10,y,z],'steel','z','coater-bearing-cover-fastener',{service:true});
        }
      }
    }
    const supply=this.node('coater-supply');
    if(supply){
      for(const z of [-.66,.66]){
        this.db(supply,[.050,.028,.040],[-.29,1.46,z],'steel',.004,'coating-hose-retainer',{service:true});
      }
    }
  }

  refineInspection(){
    // Existing Focusight/FA-Swan bridge remains the only inspection bridge.
    const cable=this.node('inspection-cabling');
    if(cable){
      for(const z of [-.56,.56])for(const y of [2.15,2.38,2.61]){
        this.db(cable,[.055,.025,.045],[.36,y,z],'graphite',.004,'inspection-cable-clip',{service:true});
      }
    }
    for(const side of ['a','b']){
      const camera=this.node(`inspection-camera-${side}`);
      if(!camera)continue;
      for(const dz of [-.12,.12])this.dc(camera,.008,.014,[.11,2.98,(side==='a'?-.50:.50)+dz],'steel','z','camera-shroud-fastener',{service:true});
    }
  }

  refineDelivery(){
    const chain=this.node('delivery-chain-path');
    if(chain){
      for(const z of [-.78,.78])for(const x of [-.52,0,.52]){
        const nozzle=this.dc(chain,.010,.040,[x,1.66,z],'steel','y','delivery-chain-lubrication-nozzle',{service:true});
        nozzle.userData.flowRateAsserted=false;
      }
    }
    const jog=this.node('delivery-joggers');
    if(jog){
      for(const z of [-.86,.86]){
        this.db(jog,[.050,.040,.030],[.37,1.10,z],'steel',.004,'jogger-position-stop',{service:true});
      }
    }
  }

  setExteriorOpen(on=true){
    if(typeof OffsetMachineTemplate.prototype.setExteriorOpen==='function')OffsetMachineTemplate.prototype.setExteriorOpen.call(this,on);
    for(const m of this.realismMeshes)if(m.userData.coverMountedDetail)m.visible=!on;
    return this;
  }
  setLow(on){
    if(typeof OffsetMachineTemplate.prototype.setLow==='function')OffsetMachineTemplate.prototype.setLow.call(this,on);
    for(const m of this.realismMeshes)m.visible=!on||Boolean(m.userData.silhouetteCritical);
    return this;
  }
}

export class Offset5CD102RealismSimulation extends PrintingSimulation{
  constructor(machine,template){
    super(machine,template);
    this.realismPack=OFFSET5_FINAL_REFINEMENT.id;
    // Hard rule: covers, guards and service-only decorative meshes must never enter
    // the moving mechanism collections.
    this.rotors=this.rotors.filter(r=>!r.mesh?.userData?.exteriorCover&&!r.mesh?.userData?.coverMountedDetail&&!r.mesh?.userData?.serviceDetail);
    this.oscillators=this.oscillators.filter(o=>!o.object?.userData?.exteriorCover&&!o.object?.userData?.coverMountedDetail);
    this.levers=this.levers.filter(o=>!o.object?.userData?.exteriorCover&&!o.object?.userData?.coverMountedDetail);
    this.gripperMotions=this.gripperMotions.filter(o=>!o.object?.userData?.exteriorCover);
    this.joggerMotions=this.joggerMotions.filter(o=>!o.object?.userData?.exteriorCover);
  }
  state(){
    return {
      ...super.state(),
      realismPack:this.realismPack,
      motionPolicy:'ROLE_TAGGED_PROCESS_PARTS_ONLY',
      duplicateProcessHardwareAdded:false,
      focusightLocationPolicy:'DOWNSTREAM_AFTER_COATING_DRYING',
      feederRearPolicy:'OPEN_SERVICE_SPACE'
    };
  }
}

export default Offset5CD102RealismTemplate;