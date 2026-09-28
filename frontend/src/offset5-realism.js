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
import {OFFSET5_DIMENSIONS,OFFSET5_UNIT_CENTERS} from './data/dimensions-offset5.js';

export const OFFSET5_FINAL_REFINEMENT=Object.freeze({
  id:'OFFSET5_CD102_8L_CUSTOM_INSTALLED_REALITY_R5',
  machine:'Heidelberg Speedmaster CD 102-8+L',
  asset:'MACHINE-OFFSET5',
  sap:'OFU-1',
  serial:'550415',
  policy:'PRESERVE_BMJ_CUSTOM_INSTALLED_DIMENSIONS__ENRICH_EXISTING_NODES_ONLY__NO_DUPLICATE_PROCESS_HARDWARE',
  sourcePriority:[
    'BMJ Offset 5 photos + calibrated DXF',
    'supplied CD102 OEM service/roller documentation',
    'HEIDELBERG CD102 family product information',
    'USER-CONFIRMED BMJ custom installed dimensions and inter-unit access take precedence over generic family dimensions',
    'HEIDELBERG 102-format family references are used only for component topology and silhouette cross-checks'
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
    this.refineTransferSupports();
    this.refineExteriorIdentityV237();
    this.refineInstalledRealityV253();
    this.refineDeliveryDynamicsV254();
    this.refinePhotoDeliveryFaceV255();
    this.refineInternalFrameSupportsV256();
  }

  refineExteriorIdentityV237(){
    this.root.userData.visualRefinement='V237_CD102_8L_PHOTO_SERVICE_IDENTITY';
    this.root.userData.homeDetailGeometryPolicy='SAME_LIVE_CD102_TEMPLATE__PHOTO_VISIBLE_SERVICE_DNA_RETAINED';
    this.root.userData.visualEvidenceBoundary='BMJ_OFFSET5_PHOTOS_DXF_AND_CD102_FAMILY__NO_NEW_INSTALLED_PROCESS_HARDWARE';
    for(let i=0;i<8;i++){
      const unit=this.node(`press-${i+1}`);if(!unit)continue;
      const trim=this.db(unit,[.60,.075,.020],[0,.67,1.305],'black',.006,'operator-side-lower-service-trim',{coverMounted:true,silhouette:true});
      trim.userData.unitIndex=i+1;
      const plate=this.realismMeshes.find(m=>m.userData?.realismRole==='unit-identification-plate'&&m.userData?.label===`PU${i+1}`);
      if(plate)plate.userData.silhouetteCritical=true;
      for(const x of [-.34,.34]){
        const hinge=this.dc(unit,.012,.10,[x,1.58,1.315],'steel','y','operator-service-door-hinge',{coverMounted:true,service:true});
        hinge.userData.unitIndex=i+1;
      }
    }
    const feeder=this.node('feeder-frame');
    if(feeder){
      const sill=this.db(feeder,[.82,.08,.024],[-.05,.72,-1.175],'black',.006,'feeder-open-rear-service-sill',{coverMounted:true,silhouette:true});
      sill.userData.rearRemainsOpen=true;
    }
    const delivery=this.node('delivery-frame');
    if(delivery)this.db(delivery,[.72,.08,.022],[.08,.70,1.12],'black',.006,'delivery-service-fascia-reference',{coverMounted:true,silhouette:true});
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
      const plate=this.db(unit,[.22,.085,.012],[.33,2.31,1.302],'black',.005,'unit-identification-plate',{coverMounted:true});
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

  refineTransferSupports(){
    // In cutaway, every inter-unit transfer drum must still read as physically mounted.
    // Tie the journal center directly into the inner face of the adjacent PU frames.
    // The tie lengths are derived from the locked BMJ custom pitch/frame widths; no PU is moved.
    const d=OFFSET5_DIMENSIONS.layout,pitch=d.printingUnitPitch;
    for(let bay=1;bay<8;bay++){
      const transfer=this.node(`transfer-pu${bay}-pu${bay+1}`);
      if(!transfer)continue;
      const leftWidth=bay===1?d.pu1FrameWidth:d.printingUnitFrameWidth;
      const rightWidth=d.printingUnitFrameWidth;
      const leftInner=-(pitch/2-leftWidth/2),rightInner=pitch/2-rightWidth/2;
      transfer.userData.frameMountPolicy='JOURNAL_TO_ADJACENT_PU_INNER_FRAME_FACES';
      transfer.userData.lockedFrameMountEdges=[leftInner,rightInner];
      for(const z of [-.76,.76]){
        for(const innerX of [leftInner,rightInner]){
          const span=Math.abs(innerX),centerX=innerX/2;
          const tie=this.db(transfer,[span+.055,.070,.075],[centerX,.70,z],'graphite',.008,'interunit-drum-frame-tie',{service:true,confidence:'FUNCTIONAL_MOUNT_REFERENCE'});
          tie.userData.transferBay=bay;tie.userData.attachedFrameInnerX=innerX;
          const saddle=this.db(transfer,[.095,.38,.15],[innerX,.515,z],'graphite',.010,'interunit-frame-bearing-saddle',{service:true,confidence:'FUNCTIONAL_MOUNT_REFERENCE'});
          saddle.userData.transferBay=bay;saddle.userData.attachedFrameInnerX=innerX;
          const cap=this.db(transfer,[.14,.055,.18],[innerX,.705,z],'steel',.007,'interunit-bearing-saddle-cap',{service:true,confidence:'FUNCTIONAL_MOUNT_REFERENCE'});
          cap.userData.transferBay=bay;
          for(const boltZ of [-.045,.045])this.dc(transfer,.010,.020,[innerX,.715,z+boltZ],'steel','z','interunit-saddle-fastener',{service:true,confidence:'FUNCTIONAL_MOUNT_REFERENCE'});
        }
        const retainer=this.dc(transfer,.068,.030,[0,.70,z],'steel','z','interunit-drum-bearing-retainer',{service:true,confidence:'FUNCTIONAL_MOUNT_REFERENCE'});
        retainer.userData.transferBay=bay;
      }
    }
  }

  refineInstalledRealityV253(){
    // Dimension-neutral realism pass. Nothing here changes root/module positions, pitch, machine envelope or height.
    this.root.userData.dimensionLock='BMJ_CUSTOM_INSTALLED_DIMENSIONS_DO_NOT_NORMALIZE_TO_GENERIC_CD102';
    this.root.userData.visualRefinement='V253_CUSTOM_INSTALLED_DIMENSION_LOCK_PLUS_OEM_COMPONENT_REALISM';
    this.root.userData.referenceBoundary='PUBLIC_CD102_FAMILY_SOURCES_FOR_COMPONENT_TOPOLOGY_ONLY__BMJ_SITE_DIMENSIONS_OVERRIDE_GENERIC_FAMILY';

    // Preset Plus feeder: fixed/movable guard hardware, suction-head carrier service details and the
    // documented 15-front-lay register arrangement remain inside the existing feeder envelope.
    const feeder=this.node('feeder-frame');
    if(feeder){
      for(const z of [-.92,.92]){
        const guard=this.db(feeder,[.055,.52,.10],[.62,1.34,z],'graphite',.010,'preset-plus-movable-guard-edge',{coverMounted:true,silhouette:true});
        guard.userData.source='HEIDELBERG_PRESET_PLUS_GUARD_REFERENCE';
        this.dc(feeder,.016,.11,[.64,1.58,z],'steel','y','preset-plus-guard-hinge',{coverMounted:true,service:true});
      }
    }
    const lays=this.node('feedboard-front-lays');
    if(lays){lays.userData.verifiedFrontLayCount=15;lays.userData.source='HEIDELBERG_CD102_PRESET_PLUS_MANUAL';}

    // Printing-unit exterior/service DNA: compact control strips, guard interlock targets and
    // inspection windows only. The custom BMJ unit spacing and unit height are intentionally untouched.
    for(let i=0;i<8;i++){
      const unit=this.node(`press-${i+1}`);if(!unit)continue;
      // The base photo-alignment mirrors each top-level machine module on Z; local +Z is world operator side (-Z).
      const osZ=1.315;
      const eStop=this.dc(unit,.032,.028,[.43,1.12,osZ-.018],'red','z','printing-unit-emergency-stop-reference',{coverMounted:true,silhouette:true});
      eStop.userData.controlFunction='EMERGENCY_STOP_VISUAL_REFERENCE';
      const label=this.db(unit,[.18,.055,.012],[-.18,.88,osZ-.018],'light',.004,'printing-unit-service-label',{coverMounted:true});
      label.userData.text=`PU${i+1}`;label.userData.renderTextInGeometry=false;
    }

    // Coater: chamber-blade end hardware and quick-connect circulation points, without adding a second process train.
    const chamber=this.node('coater-chamber');
    if(chamber){
      for(const z of [-.70,.70]){
        this.dc(chamber,.048,.032,[-.20,1.90,z],'steel','z','coater-chamber-end-seal-reference',{service:true});
        this.db(chamber,[.075,.045,.055],[-.25,1.84,z],'graphite',.008,'coater-chamber-clamp-reference',{service:true});
      }
    }
    const supply=this.node('coater-supply');
    if(supply){
      for(const z of [-.66,.66]){
        const q=this.dc(supply,.024,.040,[-.34,1.30,z],'steel','z','coating-circulation-quick-coupler',{service:true});
        q.userData.flowSettingAsserted=false;
      }
    }

    // Delivery: preserve the custom long/high installed delivery while clarifying sheet-brake, chain and pile hardware.
    const brake=this.node('delivery-sheet-brake');
    if(brake){
      for(const z of [-.54,0,.54]){
        this.db(brake,[.13,.075,.34],[-.54,1.34,z],'graphite',.010,'sheet-brake-vacuum-housing-reference',{service:true});
      }
    }
    const gate=this.node('delivery-gate');
    if(gate){
      for(const z of [-.72,-.36,0,.36,.72])this.db(gate,[.055,.045,.035],[.93,1.42,z],'steel',.006,'delivery-pile-stop-finger-reference',{service:true});
    }
    const chain=this.node('delivery-chain-path');
    if(chain){
      for(const z of [-.78,.78])this.db(chain,[1.36,.045,.035],[-.04,1.68,z],'graphite',.006,'delivery-chain-guard-strip',{coverMounted:true,service:true});
    }
  }

  refineDeliveryDynamicsV254(){
    // Correct the post-alignment handedness of new micro-details and add only brochure-backed
    // Preset Plus delivery/coater hardware. The BMJ custom machine envelope and module pitch remain untouched.
    this.root.userData.visualRefinement='V254_OPERATOR_SIDE_CORRECTION_PLUS_PRESET_PLUS_DELIVERY_DNA';
    this.root.userData.operatorSideDetailPolicy='TOP_LEVEL_MODULES_ARE_Z_MIRRORED__LOCAL_POSITIVE_Z_MAPS_TO_WORLD_NEGATIVE_Z';
    this.root.userData.deliveryEvidence='HEIDELBERG_SPEEDMASTER_CD102_PRODUCT_INFORMATION_MAR_2020';

    const frame=this.node('delivery-frame');
    if(frame){
      const console=this.db(frame,[.28,.34,.060],[.48,2.18,1.095],'graphite',.022,'preset-plus-delivery-touch-console',{coverMounted:true,silhouette:true,confidence:'HEIDELBERG_CD102_BROCHURE'});
      console.userData.controlFunction='PRESET_PLUS_DELIVERY_LOCAL_CONTROL';
      const display=this.db(frame,[.19,.20,.014],[.48,2.22,1.132],'glass',.010,'preset-plus-delivery-touch-display',{coverMounted:true,confidence:'HEIDELBERG_CD102_BROCHURE'});
      display.userData.displayFunction='INTUITIVE_NAVIGATION_VISUAL_REFERENCE';
      const jog=this.dc(frame,.050,.030,[.48,2.055,1.136],'steel','z','preset-plus-delivery-jogwheel',{coverMounted:true,service:true,confidence:'HEIDELBERG_CD102_BROCHURE'});
      jog.userData.controlFunction='JOGWHEEL_VISUAL_REFERENCE';
    }

    const brake=this.node('delivery-sheet-brake');
    if(brake){
      // CD102 literature describes positionable sheet brakes. A continuous support rail makes the
      // three existing brake heads read as mounted/adjustable hardware rather than floating rollers.
      const rail=this.dc(brake,.020,1.54,[-.54,1.385,0],'steel','z','sheet-brake-positioning-rail',{service:true,confidence:'HEIDELBERG_CD102_BROCHURE'});
      rail.userData.adjustment='TRANSVERSE_POSITION_REFERENCE_ONLY';
      for(const z of [-.54,0,.54]){
        const shoe=this.db(brake,[.12,.055,.070],[-.54,1.385,z],'graphite',.008,'sheet-brake-slide-carriage',{service:true,confidence:'HEIDELBERG_CD102_BROCHURE'});
        shoe.userData.adjustment='POSITIONABLE_SHEET_BRAKE_VISUAL_REFERENCE';
      }
    }

    const chain=this.node('delivery-chain-path');
    if(chain){
      // StaticStar is documented directly for CD102 delivery. Keep this as an attached antistatic
      // reference bar, with no invented electrical rating or ionization setpoint.
      const bar=this.dc(chain,.018,1.46,[-.31,1.535,0],'steel','z','staticstar-antistatic-bar',{service:true,confidence:'HEIDELBERG_CD102_BROCHURE'});
      bar.userData.function='ANTISTATIC_SHEET_TRAVEL_REFERENCE';
      for(const z of [-.60,-.40,-.20,0,.20,.40,.60]){
        const pin=this.dc(chain,.005,.055,[-.31,1.505,z],'steel','y','staticstar-electrode-reference',{service:true,confidence:'HEIDELBERG_CD102_BROCHURE'});
        pin.userData.electricalSettingAsserted=false;
      }
    }

    const locks=this.node('coater-chamber-locks');
    if(locks){
      // The CD102 brochure identifies combination clamps on the chamber-blade coating unit.
      for(const z of [-.77,.77]){
        const clamp=this.db(locks,[.090,.045,.070],[-.04,1.84,z],'graphite',.008,'coater-combination-clamp-reference',{service:true,confidence:'HEIDELBERG_CD102_BROCHURE'});
        clamp.userData.function='SPOT_FULL_AREA_CHANGEOVER_VISUAL_REFERENCE';
        const lever=this.db(locks,[.13,.026,.030],[.02,1.90,z],'steel',.006,'coater-combination-clamp-lever',{service:true,confidence:'HEIDELBERG_CD102_BROCHURE'});
        lever.rotation.z=z<0?-.18:.18;
      }
    }
  }

  refinePhotoDeliveryFaceV255(){
    // IMG_2312 is the clearest installed-machine reference for the delivery end face.
    // Add only thin exterior/readability details to the existing delivery shell: no module
    // position, BMJ custom dimension, process hardware, control function or service setting changes.
    this.root.userData.visualRefinement='V255_BMJ_PHOTO_DELIVERY_FACE_AND_SUPPORTED_GATE';
    this.root.userData.photoDeliveryEvidence='IMG_2312.jpeg';
    this.root.userData.photoDeliveryPolicy='EXTERIOR_FACE_ONLY__NO_CONTROL_FUNCTION_OR_SERVICE_SETTING_INFERRED';

    const hood=this.node('delivery-hood');
    if(hood){
      const evidence={coverMounted:true,confidence:'BMJ_PHOTO_IMG_2312'};
      const fascia=this.db(hood,[.020,.18,1.78],[.972,2.335,0],'light',.005,'delivery-photo-upper-control-fascia',{...evidence,silhouette:true});
      fascia.userData.photoFeature='BROAD_PALE_END_FACE_CONTROL_BAND';
      for(const z of [-.62,0,.62]){
        const seam=this.db(hood,[.022,.155,.008],[.984,2.335,z],'graphite',.001,'delivery-photo-fascia-seam',evidence);
        seam.userData.photoFeature='CONTROL_FASCIA_PANEL_BREAK';
      }
      for(const z of [-.76,-.62,-.48,-.34]){
        const knob=this.dc(hood,.025,.020,[.994,2.365,z],'black','x','delivery-photo-control-knob',{...evidence,service:true});
        knob.userData.controlFunctionAsserted=false;
      }
      for(const z of [-.76,-.62,-.48,-.34,-.20]){
        const indicator=this.db(hood,[.018,.044,.060],[.994,2.235,z],'black',.004,'delivery-photo-status-window',evidence);
        indicator.userData.statusMeaningAsserted=false;
      }
      this.db(hood,[.020,.035,1.44],[.974,2.315,0],'graphite',.004,'delivery-photo-window-bezel-top',evidence);
      this.db(hood,[.020,.035,1.44],[.974,1.765,0],'graphite',.004,'delivery-photo-window-bezel-bottom',evidence);
      for(const z of [-.72,.72])this.db(hood,[.020,.55,.035],[.974,2.04,z],'graphite',.004,'delivery-photo-window-bezel-side',evidence);
      for(const z of [-.76,.76]){
        const mount=this.dc(hood,.012,.080,[.960,1.70,z],'steel','x','delivery-front-rail-standoff',{coverMounted:true,service:true,confidence:'BMJ_PHOTO_IMG_2312'});
        mount.userData.attachment='END_FACE_TO_EXISTING_FRONT_RAIL';
      }
    }

    const gate=this.node('delivery-gate');
    if(gate){
      for(const y of [.30,1.53])for(const z of [-.94,.94]){
        const bracket=this.db(gate,[.095,.085,.075],[.96,y,z],'graphite',.008,'delivery-gate-end-anchor',{service:true,confidence:'BMJ_PHOTO_IMG_2312'});
        bracket.userData.attachment='PILE_GATE_CROSSMEMBER_END_SUPPORT';
      }
      gate.userData.photoMountPolicy='IMG_2312_GATE_RODS_TERMINATE_IN_SUPPORTED_CROSSMEMBERS';
    }
    this.root.userData.dimensionLock='BMJ_CUSTOM_INSTALLED_DIMENSIONS_DO_NOT_NORMALIZE_TO_GENERIC_CD102';
  }

  refineInternalFrameSupportsV256(){
    // The CD102 roller service procedure explicitly references journal boxes and recesses
    // in the D.S./O.S. side frames. Keep the cutaway open, but make the existing cylinder
    // journals visibly terminate in structural frame rails instead of floating in space.
    this.root.userData.visualRefinement='V256_BMJ_CUTAWAY_JOURNAL_FRAME_SUPPORTS';
    this.root.userData.internalFrameEvidence='CD102_SERVICE_PROCEDURE_SIDE_FRAME_RECESS_AND_JOURNAL_BOX';
    this.root.userData.internalFramePolicy='OPEN_RAIL_STRUCTURE_ONLY__NO_NEW_PROCESS_HARDWARE__NO_DIMENSION_CHANGE';

    const bearingRows=[
      ['plate',1.79],['blanket',1.39],['impression',.95],['transfer',.55]
    ];
    for(let i=0;i<8;i++){
      const unit=this.node(`press-${i+1}`);if(!unit)continue;
      for(const z of [-.82,.82]){
        for(const x of [-.40,.40]){
          const post=this.db(unit,[.10,1.86,.10],[x,1.43,z],'graphite',.014,'printing-unit-inner-frame-post',{service:false,confidence:'OEM_SIDE_FRAME_JOURNAL_TOPOLOGY'});
          post.userData.unitIndex=i+1;
          post.userData.structuralCutaway=true;
          post.userData.frameSide=z<0?'LOCAL_NEGATIVE_Z':'LOCAL_POSITIVE_Z';
        }
        for(const [cylinderType,y] of bearingRows){
          const rail=this.db(unit,[.76,.085,.11],[.02,y,z],'graphite',.010,'printing-unit-journal-bearing-rail',{service:false,confidence:'OEM_SIDE_FRAME_JOURNAL_TOPOLOGY'});
          rail.userData.unitIndex=i+1;
          rail.userData.cylinderType=cylinderType;
          rail.userData.structuralCutaway=true;
          rail.userData.journalPlaneZ=z;
        }
      }
    }
    this.root.userData.dimensionLock='BMJ_CUSTOM_INSTALLED_DIMENSIONS_DO_NOT_NORMALIZE_TO_GENERIC_CD102';
  }

  setExteriorOpen(on=true){
    if(typeof OffsetMachineTemplate.prototype.setExteriorOpen==='function')OffsetMachineTemplate.prototype.setExteriorOpen.call(this,on);
    for(const m of this.realismMeshes)if(m.userData.coverMountedDetail)m.visible=!on;
    return this;
  }
  setLow(on){
    if(typeof OffsetMachineTemplate.prototype.setLow==='function')OffsetMachineTemplate.prototype.setLow.call(this,on);
    for(const m of this.realismMeshes)m.visible=(!on||Boolean(m.userData.silhouetteCritical))&&(!this.exteriorOpen||!m.userData.coverMountedDetail);
    return this;
  }
}

export class Offset5CD102RealismSimulation extends PrintingSimulation{
  clearDeliveredSheets(){
    super.clearDeliveredSheets();
    if(this.deliveryTableMesh&&Number.isFinite(this.deliveryTableInitialY))this.deliveryTableMesh.position.y=this.deliveryTableInitialY;
    this.deliveryTableDrop=0;
  }
  relayoutPileSheets(){
    const visible=this.pileSheets.filter(sheet=>sheet.userData.serial>=0).sort((a,b)=>a.userData.serial-b.userData.serial);
    const count=visible.length,drop=Math.max(0,count-1)*this.pileSheetThickness;
    this.deliveryTableDrop=drop;
    if(this.deliveryTableMesh)this.deliveryTableMesh.position.y=this.deliveryTableInitialY-drop;
    visible.forEach((sheet,rank)=>{
      const pos=sheet.mesh.geometry.attributes.position,w=this.sheetWidthSegments,l=this.sheetLengthSegments;
      const y=this.pileAnchor.y-(count-1-rank)*this.pileSheetThickness;
      for(let i=0;i<=l;i++){
        const x=this.pileAnchor.x-this.sheetLength/2+(i/l)*this.sheetLength;
        for(let j=0;j<=w;j++){
          const z=this.pileAnchor.z-this.sheetWidth/2+(j/w)*this.sheetWidth,index=i*(w+1)+j;
          pos.setXYZ(index,x,y,z);
        }
      }
      pos.needsUpdate=true;sheet.mesh.visible=true;
    });
  }
  setSheetColors(sheet,printed){
    if(sheet.userData.printed===printed)return;
    // Each PU adds one cross-press colour band (parallel to the roller axis).
    // This is an explanatory colour target, not the installed job artwork.
    const attr=sheet.mesh.geometry.attributes.color;
    const l=this.sheetLengthSegments,w=this.sheetWidthSegments;
    const count=Math.max(0,Math.min(8,printed|0));
    const centers=[.13,.235,.34,.445,.55,.655,.76,.865];
    for(let i=0;i<=l;i++)for(let j=0;j<=w;j++){
      const u=i/l,color=sheet.paperColor.clone();
      for(let k=0;k<count;k++){
        const distance=Math.abs(u-centers[k]);
        const coverage=Math.max(0,Math.min(1,(.048-distance)/.015));
        color.lerp(sheet.bandColors[k],coverage*.88);
      }
      attr.setXYZ(i*(w+1)+j,color.r,color.g,color.b);
    }
    attr.needsUpdate=true;
    sheet.userData.printed=count;
    sheet.userData.contactColorRevision=-1;
    sheet.userData.printRepresentation='PROGRESSIVE_TRANSVERSE_COLOUR_BANDS_PER_PU_DEMO';
  }
  updateSheet(sheet,leadDistance){
    const newSheetPass=leadDistance<(sheet.userData.leadDistance??0);
    const visible=super.updateSheet(sheet,leadDistance);
    if(visible){
      // Delivery pile elevator keeps the top receiving plane approximately constant while
      // the table lowers with accumulated sheets. Compensate the base settling target,
      // which otherwise rises by one sheet thickness for every deposited sheet.
      const pileCount=this.pileSheets.filter(item=>item.mesh.visible).length;
      const releaseProgress=THREE.MathUtils.clamp((sheet.userData.leadPosition.x-this.deliveryReleaseX)/(this.deliverySettleX-this.deliveryReleaseX),0,1);
      const easedRelease=releaseProgress*releaseProgress*(3-2*releaseProgress);
      if(easedRelease>0&&pileCount>0){
        const shift=easedRelease*pileCount*this.pileSheetThickness;
        const deliveryPos=sheet.mesh.geometry.attributes.position;
        for(let idx=0;idx<deliveryPos.count;idx++)deliveryPos.setY(idx,deliveryPos.getY(idx)-shift);
        deliveryPos.needsUpdate=true;
        sheet.userData.leadPosition.y-=shift;
        sheet.userData.trailPosition.y-=shift;
      }

      // Each section gains ink only after that section reaches the PU impression nip.
      // The leading edge may already be at the next PU while the trailing edge is still blank.
      const pos=sheet.mesh.geometry.attributes.position,attr=sheet.mesh.geometry.attributes.color;
      const l=this.sheetLengthSegments,w=this.sheetWidthSegments,centers=[.13,.235,.34,.445,.55,.655,.76,.865];
      let changed=sheet.userData.contactColorRevision!==sheet.userData.printed;
      const rowMasks=sheet.userData.contactRowMasks??(sheet.userData.contactRowMasks=new Uint8Array(l+1));
      if(newSheetPass)rowMasks.fill(0);
      for(let i=0;i<=l;i++){
        const x=pos.getX(i*(w+1));let mask=0;
        for(let k=0;k<8;k++)if(x>OFFSET5_UNIT_CENTERS[k]+.22)mask|=1<<k;
        if(!newSheetPass)mask|=rowMasks[i];
        if(!changed&&rowMasks[i]===mask)continue;
        rowMasks[i]=mask;changed=true;
        const u=i/l,color=sheet.paperColor.clone();
        for(let k=0;k<8;k++)if(mask&(1<<k)){
          const coverage=Math.max(0,Math.min(1,(.048-Math.abs(u-centers[k]))/.015));
          color.lerp(sheet.bandColors[k],coverage*.88);
        }
        for(let j=0;j<=w;j++)attr.setXYZ(i*(w+1)+j,color.r,color.g,color.b);
      }
      if(changed)attr.needsUpdate=true;
      sheet.userData.contactColorRevision=sheet.userData.printed;
    }
    // Full-width dark bars between visible sheets were a demo gripper proxy.
    // The actual transfer grippers remain modeled inside the press assemblies.
    sheet.gripper.visible=false;
    return visible;
  }
  start(){
    if(!this.active)for(const sheet of this.sheets){
      sheet.userData.contactRowMasks?.fill(0);
      sheet.userData.contactColorRevision=-1;
      this.setSheetColors(sheet,0);
    }
    return super.start();
  }
  stop(){
    super.stop();
    for(const sheet of this.sheets){
      sheet.userData.contactRowMasks?.fill(0);
      sheet.userData.contactColorRevision=-1;
    }
    // The simulated pile is cleared by stop; do not swap a prebuilt full pile back in.
    if(this.staticDeliveryStack)this.staticDeliveryStack.visible=false;
    for(const item of this.gripperMotions){
      item.object.rotation.z=item.initialRotationZ??0;
      item.currentOrbitAngle=null;
    }
    this.setInspectionIllumination(false);
    return this.state();
  }
  // Offset lithography transfers thin films at roller contacts. The legacy
  // floating droplets/tubes read as leaking ink and are not part of the press.
  buildFluidFlows(){this.fluidFlows=[];}
  collectInkSurfaces(){
    super.collectInkSurfaces();
    const rollerMaterials=new Set();
    for(let i=0;i<8;i++){
      for(const id of [`press-${i}-ink-fountain-roller-body`,...['13','2','1','14','3','4','5','6','7','8','9','10','11','12','15'].map(code=>`press-${i}-ink-roller-${code}-body`)]){
        this.template.findNode(id)?.traverse(mesh=>{if(mesh.isMesh&&mesh.material)rollerMaterials.add(mesh.material);});
      }
    }
    this.inkSurfaces=this.inkSurfaces.filter(surface=>rollerMaterials.has(surface.material));
  }
  collectMechanicalMotion(){
    super.collectMechanicalMotion();

    // The suction/separator assemblies translate with the feeder cycle; their stems and cups do not
    // spin like transport rollers. Remove the inherited generic cylinder-rotation fallback while
    // retaining the group oscillation already created by the base simulation.
    const nonRotatingFeederOwners=new Set(['feeder-suction-cups','feeder-separation','feeder-head-linkage']);
    this.rotors=this.rotors.filter(item=>!nonRotatingFeederOwners.has(item.mesh?.userData?.ownerId));

    // Register/feed-table transport must read as one sheet-moving system, not alternating generic
    // cylinders. Keep only the documented tape/pressure roller contacts and drive them toward PU1.
    this.rotors=this.rotors.filter(item=>{
      const owner=item.mesh?.userData?.ownerId,r=item.mesh?.geometry?.parameters?.radiusTop;
      if(owner==='feedboard-transport')return Math.abs((r||0)-.034)<1e-6;
      if(owner==='vacuum-table')return Math.abs((r||0)-.055)<1e-6;
      return true;
    });
    for(const rotor of this.rotors){
      const owner=rotor.mesh?.userData?.ownerId,radius=rotor.mesh?.geometry?.parameters?.radiusTop;
      if(!radius)continue;
      if(owner==='feedboard-transport'||owner==='vacuum-table'){
        rotor.sign=-1;
        rotor.rate=this.baseMetersPerSecond/(Math.PI*2*this.sheetCyclesPerSecond*radius);
        rotor.role=owner==='feedboard-transport'?'register-pressure-transport-roller':'vacuum-table-tape-drive-roller';
        rotor.source='REGISTER_SHEET_TRANSPORT_SURFACE_SPEED_REFERENCE';
        rotor.visualSpeedRatio=1;
      }
    }
    // Suction head, separator, linkage and front lays all belong to the same sheet cycle.
    // Preserve the conservative amplitudes, but remove the legacy 1.15x phase drift.
    for(const item of this.oscillators){
      if(['feeder-suction-cups','feeder-separation','feeder-head-linkage','feedboard-front-lays'].includes(item.object?.userData?.nodeId))item.frequency=1;
    }
    const infeed=this.template.findNode('feedboard-infeed-gripper');
    if(infeed&&!this.oscillators.some(item=>item.object===infeed))this.addOscillator(infeed,'x',.022,1,.30);

    // Every straight-printing unit has the same installed handedness. The legacy simulator flipped
    // the ink/dampening train by PU parity, making PU2/4/6/8 visibly run backwards. Preserve the
    // existing relative roller pattern but normalize it identically across all eight PUs.
    const inkCodes=['13','2','1','14','3','4','5','6','7','8','9','10','11','12','15'];
    const dampCodes=['16','17','FR','19','18'];
    const rotorFor=id=>this.rotors.find(item=>item.mesh?.userData?.ownerId===id);
    for(let i=0;i<8;i++){
      const fountain=rotorFor(`press-${i}-ink-fountain-roller-body`);
      if(fountain){fountain.sign=1;fountain.role=`PU${i+1}-ink-fountain-roller`;fountain.source='SAME_HANDED_STRAIGHT_PRINT_UNIT_VISUAL_KINEMATICS';}
      inkCodes.forEach((code,index)=>{
        const rotor=rotorFor(`press-${i}-ink-roller-${code}-body`);if(!rotor)return;
        rotor.sign=index%2?-1:1;rotor.role=`PU${i+1}-ink-roller-${code}`;rotor.source='SAME_HANDED_STRAIGHT_PRINT_UNIT_VISUAL_KINEMATICS';
      });
      for(const code of ['A','B','C','D']){
        const rotor=rotorFor(`press-${i}-ink-distributor-${code}-body`);if(!rotor)continue;
        rotor.sign=code.charCodeAt(0)%2?-1:1;rotor.role=`PU${i+1}-ink-distributor-${code}`;rotor.source='SAME_HANDED_STRAIGHT_PRINT_UNIT_VISUAL_KINEMATICS';
      }
      dampCodes.forEach((code,index)=>{
        const rotor=rotorFor(`press-${i}-damp-roller-${code}-body`);if(!rotor)return;
        rotor.sign=index%2?-1:1;rotor.role=`PU${i+1}-damp-roller-${code}`;rotor.source='SAME_HANDED_STRAIGHT_PRINT_UNIT_VISUAL_KINEMATICS';
      });
    }
    // The sheet runs left to right across the upper transfer arc at every bay.
    // Both transfer drum and gripper orbit therefore turn clockwise in this view.
    for(let bay=1;bay<8;bay++){
      const drum=this.template.findNode(`transfer-pu${bay}-pu${bay+1}`)?.children.find(child=>child.isMesh&&child.geometry?.type==='CylinderGeometry');
      const rotor=this.rotors.find(item=>item.mesh===drum);
      if(rotor){rotor.sign=-1;rotor.rate=this.baseMetersPerSecond/(Math.PI*2*this.sheetCyclesPerSecond*drum.geometry.parameters.radiusTop);rotor.role=`PU${bay}-PU${bay+1}-transfer-drum`;}
    }
    // Delivery is one forward-moving chain loop: both drive/return sprocket references rotate
    // in the same sense so the upper span travels toward the pile. The sheet brake is deliberately
    // slower as a visual deceleration reference; neither ratio is a service setting.
    for(const rotor of this.rotors){
      const radius=rotor.mesh?.geometry?.parameters?.radiusTop;
      if(!radius)continue;
      if(rotor.role==='delivery-chain-sprocket'){
        rotor.sign=-1;
        rotor.rate=this.baseMetersPerSecond/(Math.PI*2*this.sheetCyclesPerSecond*radius);
        rotor.source='PRESET_PLUS_DELIVERY_FORWARD_CHAIN_VISUAL_REFERENCE';
        rotor.visualSpeedRatio=1;
      }else if(rotor.role==='sheet-brake-roller'){
        rotor.sign=-1;
        rotor.rate=.82*this.baseMetersPerSecond/(Math.PI*2*this.sheetCyclesPerSecond*radius);
        rotor.source='POSITIONABLE_SHEET_BRAKE_CONTROLLED_DECELERATION_VISUAL_REFERENCE';
        rotor.visualSpeedRatio=.82;
      }
    }

    // Dryer/extension transport rollers are existing modeled hardware and should not stay
    // visually frozen while sheets pass above them. Drive only those six contact rollers.
    const dryerPath=this.template.findNode('dryer-sheet-path');
    dryerPath?.traverse(mesh=>{
      if(!mesh.isMesh||mesh.geometry?.type!=='CylinderGeometry')return;
      const radius=mesh.geometry.parameters.radiusTop;
      this.addRotor(mesh,-1,this.baseMetersPerSecond/(Math.PI*2*this.sheetCyclesPerSecond*radius),{
        role:'dryer-sheet-transport-roller',
        source:'DRYER_CONTACT_SURFACE_SPEED_MATCHED_TO_SHEET_REFERENCE'
      });
    });

    // Coating contact train: keep the existing chamber/coating/impression hardware,
    // but drive each contact surface at the same sheet surface speed. This removes the
    // legacy arbitrary RPM multipliers while preserving the documented counter-rotation.
    const coaterRotors=this.rotors.filter(item=>item.role==='coater-process-roller')
      .sort((a,b)=>(a.mesh.position.y||0)-(b.mesh.position.y||0));
    const coaterRoles=['coater-impression-cylinder','coater-transfer-cylinder','coater-chamber-metering-roller'];
    for(let i=0;i<coaterRotors.length;i++){
      const rotor=coaterRotors[i],radius=rotor.mesh?.geometry?.parameters?.radiusTop;
      if(!radius)continue;
      rotor.rate=this.baseMetersPerSecond/(Math.PI*2*this.sheetCyclesPerSecond*radius);
      rotor.role=coaterRoles[i]||`coater-process-roller-${i+1}`;
      rotor.source='COATER_CONTACT_SURFACE_SPEED_MATCHED_TO_SHEET_REFERENCE';
      rotor.visualSpeedRatio=1;
    }

    // Each straight-printing PU carries the sheet in the same direction. Adjacent
    // contacting cylinders counter-rotate; their surface speed, not their RPM,
    // follows the sheet. The visible radii are reference geometry, not CAD.
    const cylinderSigns={plate:1,blanket:-1,impression:1,transfer:-1};
    for(let i=0;i<8;i++)for(const [type,sign] of Object.entries(cylinderSigns)){
      const node=this.template.findNode(`press-${i}-cylinder-${type}-body`);
      const mesh=node?.children.find(child=>child.isMesh&&child.geometry?.type==='CylinderGeometry');
      const rotor=this.rotors.find(item=>item.mesh===mesh);
      if(!rotor)continue;
      const radius=mesh.geometry.parameters.radiusTop;
      rotor.sign=sign;
      rotor.rate=this.baseMetersPerSecond/(Math.PI*2*this.sheetCyclesPerSecond*radius);
      rotor.role=`PU${i+1}-${type}-cylinder`;
      rotor.source='CONTACTING_CYLINDER_SURFACE_SPEED_REFERENCE';
    }
  }
  collectInspectionIllumination(){
    this.inspectionIllumination=[];
    const seen=new Set(),node=this.template.findNode('inspection-lighting');
    node?.traverse(mesh=>{
      const material=mesh.isMesh?mesh.material:null;
      if(!material?.emissive||seen.has(material))return;
      seen.add(material);
      this.inspectionIllumination.push({
        material,
        initialEmissive:material.emissive.clone(),
        initialIntensity:material.emissiveIntensity
      });
    });
    this.inspectionIlluminationActive=false;
  }
  setInspectionIllumination(on){
    this.inspectionIlluminationActive=!!on;
    for(const item of this.inspectionIllumination||[]){
      if(this.inspectionIlluminationActive){
        item.material.emissive.setHex(0xc9efff);
        item.material.emissiveIntensity=.42;
      }else{
        item.material.emissive.copy(item.initialEmissive);
        item.material.emissiveIntensity=item.initialIntensity;
      }
      item.material.needsUpdate=true;
    }
  }
  update(now){
    super.update(now);
    if(!this.active)return;
    // Keep each inter-unit gripper assembly rigidly attached to its drum orbit.
    // The base simulator already moves the bar center around the correct shaft; here we also
    // rotate the merged finger assembly about that bar center so the fingers do not stay
    // unnaturally world-horizontal while orbiting.
    for(const item of this.gripperMotions){
      if(!item.orbit)continue;
      const angle=item.phase-this.elapsed*this.baseMetersPerSecond/item.radius;
      const cos=Math.cos(angle),sin=Math.sin(angle);
      const localX=item.barX,localY=item.barY;
      const rotatedX=cos*localX-sin*localY,rotatedY=sin*localX+cos*localY;
      item.object.rotation.z=angle;
      item.object.position.x=item.radius*cos-rotatedX;
      item.object.position.y=item.drumY+item.radius*sin-rotatedY;
      item.currentOrbitAngle=angle;
    }
    const inspectionX=OFFSET5_DIMENSIONS.layout.inspectionCenterX;
    const inspectionOccupied=this.sheets.some(sheet=>
      sheet.mesh.visible&&
      sheet.userData.leadPosition.x>=inspectionX-.22&&
      sheet.userData.trailPosition.x<=inspectionX+.22
    );
    this.setInspectionIllumination(inspectionOccupied);
  }
  applyInkFilm(on){
    for(const surface of this.inkSurfaces){
      surface.material.emissive.copy(on&&this.inkFlowVisible?surface.color:surface.initialEmissive);
      surface.material.emissiveIntensity=(on&&this.inkFlowVisible)? .055:surface.initialIntensity;
      surface.material.needsUpdate=true;
    }
  }
  setInkFlowVisible(on){
    super.setInkFlowVisible(on);
    this.applyInkFilm(this.active);
    return this.state();
  }
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
    for(const item of this.gripperMotions)item.initialRotationZ=item.object.rotation.z;
    this.collectInspectionIllumination();
    this.deliveryTableMesh=this.template.findNode('delivery-pile')?.children.find(o=>o.isMesh)||null;
    this.deliveryTableInitialY=this.deliveryTableMesh?.position.y;
    this.deliveryTableDrop=0;
  }
  state(){
    return {
      ...super.state(),
      realismPack:this.realismPack,
      motionPolicy:'ROLE_TAGGED_PROCESS_PARTS_ONLY',
      duplicateProcessHardwareAdded:false,
      focusightLocationPolicy:'DOWNSTREAM_AFTER_COATING_DRYING',
      feederRearPolicy:'OPEN_SERVICE_SPACE',
      processPitchM:OFFSET5_UNIT_CENTERS[1]-OFFSET5_UNIT_CENTERS[0],
      dimensionPolicy:'USER_CONFIRMED_CUSTOM_INSTALLED_GEOMETRY_OVERRIDES_GENERIC_FAMILY_DIMENSIONS',
      nominalSheetsPerHour:15000,
      deliveryReleasePolicy:'GRIPPER_RELEASE_THEN_FLAT_SHEET_SETTLING_TO_PILE',
      interUnitAccessPolicy:'BMJ_CUSTOM_BROAD_INTERUNIT_ACCESS_AND_OS_DS_STEPS_PRESERVED',
      inkRepresentation:'THIN_ROLLER_FILM_ONLY_NO_FREE_FLOATING_DROPLETS',
      inkRollerCount:this.inkSurfaces.length,
      printRepresentation:'PROGRESSIVE_TRANSVERSE_COLOUR_BANDS_PER_PU_DEMO',
      cylinderMotionPolicy:'SAME_STRAIGHT_PRINT_DIRECTION_ALL_PU_CONTACT_PAIRS_COUNTER_ROTATE',
      sheetVisualPolicy:'NO_EXTERNAL_FULL_WIDTH_DEMO_GRIPPER_BAR',
      deliveryPilePolicy:'START_EMPTY_STACK_TO_CAPACITY_THEN_CLEAR_AND_REPEAT',
      operatorSideMicrodetailPolicy:'WORLD_NEGATIVE_Z_AFTER_TOP_LEVEL_PHOTO_MIRROR',
      presetPlusDeliveryDetailPolicy:'TOUCH_DISPLAY_JOGWHEEL_STATICSTAR_AND_POSITIONABLE_SHEET_BRAKE_REFERENCES',
      deliveryChainMotionPolicy:'SINGLE_FORWARD_LOOP_SPROCKETS_SHARE_ROTATION_DIRECTION',
      sheetBrakeMotionPolicy:'CONTROLLED_DECELERATION_VISUAL_REFERENCE_NOT_SERVICE_SETPOINT',
      feederMotionPolicy:'SUCTION_SEPARATOR_LINKAGE_FRONT_LAYS_AND_INFEED_GRIPPER_SHARE_ONE_SHEET_CYCLE',
      registerTransportPolicy:'ONLY_CONTACT_ROLLERS_ROTATE_AND_MATCH_SHEET_SURFACE_SPEED_TOWARD_PU1',
      rollerHandednessPolicy:'IDENTICAL_STRAIGHT_PRINT_KINEMATIC_SIGN_PATTERN_ACROSS_ALL_EIGHT_PU',
      interUnitGripperPolicy:'RIGID_FINGER_ASSEMBLY_ROTATES_WITH_TRANSFER_DRUM_ORBIT',
      inspectionIlluminationActive:this.inspectionIlluminationActive,
      inspectionIlluminationPolicy:'SHEET_OCCUPANCY_TRIGGERED_EXISTING_FOCUSIGHT_LIGHTING_ONLY',
      coaterMotionPolicy:'EXISTING_THREE_ROLL_CONTACT_TRAIN_MATCHES_SHEET_SURFACE_SPEED',
      dryerTransportPolicy:'SIX_EXISTING_EXTENSION_ROLLERS_ROTATE_AT_SHEET_SURFACE_SPEED',
      deliveryPileElevatorPolicy:'TOP_RECEIVING_PLANE_HELD_CONSTANT_WHILE_TABLE_LOWERS_WITH_STACK',
      deliveryTableDropM:this.deliveryTableDrop||0
    };
  }
}

export default Offset5CD102RealismTemplate;
