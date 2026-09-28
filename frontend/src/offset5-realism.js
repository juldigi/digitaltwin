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
  id:'OFFSET5_CD102_8L_CUSTOM_INSTALLED_REALITY_R4',
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

  refineTransferSupports(){
    // The inter-unit drum journals need visible mounts to the adjacent PU frames.
    // Place the mounts below the sheet arc and inside the existing custom access bays.
    for(let bay=1;bay<8;bay++){
      const transfer=this.node(`transfer-pu${bay}-pu${bay+1}`);
      if(!transfer)continue;
      for(const z of [-.76,.76]){
        for(const direction of [-1,1]){
          const bracket=this.db(transfer,[.82,.065,.060],[direction*.41,.70,z],'graphite',.008,'interunit-drum-frame-bracket',{service:true,confidence:'FUNCTIONAL_MOUNT_REFERENCE'});
          bracket.userData.transferBay=bay;
        }
        this.dc(transfer,.068,.026,[0,.70,z],'steel','z','interunit-drum-bearing-retainer',{service:true,confidence:'FUNCTIONAL_MOUNT_REFERENCE'});
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
      const osZ=-1.315;
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
    // The sheet runs left to right across the upper transfer arc at every bay.
    // Both transfer drum and gripper orbit therefore turn clockwise in this view.
    for(let bay=1;bay<8;bay++){
      const drum=this.template.findNode(`transfer-pu${bay}-pu${bay+1}`)?.children.find(child=>child.isMesh&&child.geometry?.type==='CylinderGeometry');
      const rotor=this.rotors.find(item=>item.mesh===drum);
      if(rotor){rotor.sign=-1;rotor.rate=this.baseMetersPerSecond/(Math.PI*2*this.sheetCyclesPerSecond*drum.geometry.parameters.radiusTop);rotor.role=`PU${bay}-PU${bay+1}-transfer-drum`;}
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
      deliveryPilePolicy:'START_EMPTY_STACK_TO_CAPACITY_THEN_CLEAR_AND_REPEAT'
    };
  }
}

export default Offset5CD102RealismTemplate;
