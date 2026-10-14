import * as THREE from 'three';
import {UniversalMachineTemplate} from './universal-machine.js';
import {V139_SOURCE_STATS} from './data/research-v139.js';

const AXIS={x:new THREE.Vector3(1,0,0),y:new THREE.Vector3(0,1,0),z:new THREE.Vector3(0,0,1)};
export const REFERENCE_MACHINE_IDS=Object.freeze([
 'BMJ-MCH-0004','BMJ-MCH-0017','BMJ-MCH-0021','BMJ-MCH-0023','BMJ-MCH-0025','BMJ-MCH-0026','BMJ-MCH-0027','BMJ-MCH-0028',
 'BMJ-MCH-0029','BMJ-MCH-0030','BMJ-MCH-0031','BMJ-MCH-0032','BMJ-MCH-0033','BMJ-MCH-0034','BMJ-MCH-0035',
 'BMJ-MCH-0036','BMJ-MCH-0037','BMJ-MCH-0038','BMJ-MCH-0039','BMJ-MCH-0040','BMJ-MCH-0041'
]);
const REFERENCE_SET=new Set(REFERENCE_MACHINE_IDS);
export const isReferenceMachineKey=key=>REFERENCE_SET.has(key);

export class ReferenceMachineTemplate extends UniversalMachineTemplate{
 constructor(machineId){
  super(machineId);
  // Reference templates used shared palette materials. Interactive highlight,
  // ghost and depth-write changes must be local to one mesh; otherwise
  // selecting a part mutates visually unrelated assemblies that share it.
  this.referenceDynamicMaterials=[];
  for(const mesh of this.meshes){
   if(!mesh.isMesh||!mesh.material)continue;
   const source=mesh.material,cloned=source.clone();
   cloned.userData={...(source.userData||{})};
   mesh.material=cloned;this.referenceDynamicMaterials.push(cloned);
   mesh.userData.restVisible=mesh.visible;
  }
  this.root.name=this.cfg.machine.name+' Â· REFERENCE-GROUNDED';
  this.root.userData.referenceBuilder='V139_RESEARCH_GROUNDED_BUILDER';
  this.root.userData.engineeringDimensions=false;
  this.root.userData.referenceBoundary=this.cfg.profile?.unknowns||[];
  this.root.userData.researchVersion='V139';
  this.root.userData.researchSourceCount=V139_SOURCE_STATS.total;
  this.root.userData.newReviewedSources=V139_SOURCE_STATS.newReviewed;this.root.userData.uniqueResearchUrls=V139_SOURCE_STATS.uniqueUrls;
  this.enrichV121();
  this.refineV231VisualParity();
  this.refineV232PriorityPolish();
  this.refineV236MechanicalRealism();
  this.refineV238PriorityRepolish();
  this.refineV341EquipmentBoundary();
  for(const n of this.nodes){
   if(!n.userData.rest)n.userData.rest=n.position.clone();
   if(!n.userData.restQuaternion)n.userData.restQuaternion=n.quaternion.clone();
  }
  for(const m of this.activeMeshes){
   m.userData.motionRestPosition=m.position.clone();
   m.userData.motionRestQuaternion=m.quaternion.clone();
  }
 }
 setExteriorOpen(on=true){
  super.setExteriorOpen(on);
  for(const n of this.nodes)if(n.userData.functionalDiagramOnly)n.visible=!!on;
  for(const mesh of this.meshes)if(mesh.userData.coverMountedDetail)mesh.visible=!this.exteriorOpen;
  if(['PDS','UTILITY'].includes(this.cfg.machine.area))for(const mesh of this.meshes)if(mesh.userData.coverMountedDetail)mesh.visible=!this.exteriorOpen;
  return this;
 }
 setLow(on){
  super.setLow(on);
  for(const n of this.nodes)if(n.userData.functionalDiagramOnly)n.visible=this.exteriorOpen;
  if(this.exteriorOpen)for(const mesh of this.meshes)if(mesh.userData.coverMountedDetail)mesh.visible=false;
  if(['PDS','UTILITY'].includes(this.cfg.machine.area)){
   // Keep the actual family-process mechanism readable when the shell is opened
   // on a phone; low LOD may remove microdetail, not the only moving internals.
   for(const mesh of this.activeMeshes)if(!mesh.userData.referencePlaceholder&&mesh.userData.simulationEnabled!==false)mesh.visible=true;
   if(this.exteriorOpen)for(const mesh of this.meshes)if(mesh.userData.coverMountedDetail)mesh.visible=false;
  }
  return this;
 }
 refineV341EquipmentBoundary(){
  // Distribution schematics describe a system, not the installed machine's
  // physical envelope. Keep their taxonomy selectable for interior study,
  // without attaching an unverified factory network to every cabinet.
  for(const id of ['compressor-air-distribution','ahu-supply-duct','ahu-return-duct','ahu-outdoor-intake','sansin-indoor-outdoor-interconnect','sansin-return-duct']){
   const n=this.findNode(id);if(!n)continue;
   n.userData.functionalDiagramOnly=true;
   n.visible=!!this.exteriorOpen;
   n.traverse(o=>{if(o.isMesh)o.userData.silhouetteCritical=true;});
  }
  const hydraulic=this.findNode('qf100-hydraulic-unit');
  hydraulic?.traverse(o=>{if(o.isMesh)o.userData.silhouetteCritical=true;});
  this.root.userData.equipmentBoundaryRevision='V341';
 }
 enforceV341EquipmentBoundary(){
  if(!this.exteriorOpen)for(const n of this.nodes)if(n.userData.functionalDiagramOnly)n.visible=false;
 }
 restoreReferenceVisibility(){
  for(const mesh of this.meshes)if(mesh.userData.restVisible===false)mesh.visible=false;
 }
 isolate(part,on=true){super.isolate(part,on);this.restoreReferenceVisibility();this.enforceV341EquipmentBoundary();}
 showOnly(parts=[],on=true){super.showOnly(parts,on);this.restoreReferenceVisibility();this.enforceV341EquipmentBoundary();}
 reset(){super.reset();this.enforceV341EquipmentBoundary();}
 dispose(){super.dispose();this.referenceDynamicMaterials?.forEach(m=>m.dispose());}
 motion(mesh,type='spin',axis='z',rate=4,amp=.08,phase=0,stage=null){
  mesh.userData.motion={type,axis,rate,amp,phase,stage};
  return this.active(mesh);
 }
 mod(index,pos=[0,0,0],explode=[0,.18,0]){
  const name=(this.cfg.profile?.architecture||this.cfg.modules)[index-1]||('Module '+index);
  const g=this.group(this.root,'universal-module-'+index,name,pos,explode);
  const a=this.group(g,'universal-module-'+index+'-active',name+' Active Element',[0,0,0],[0,.12,.12]);
  return {g,a,name};
 }
 base(length,width=2.0){
  const b=this.group(this.root,'universal-base','Machine base',[0,0,0],[0,-.2,0]);
  this.box(b,[length,.16,width],[0,.08,0],'dark',.025);
  return b;
 }
 shell(g,size,pos=[0,0,0],kind='body',radius=.04){
  const m=this.cover(this.box(g,size,pos,kind,radius));m.userData.referenceShell=true;return m;
 }
 enrichV121(){
  const no=this.cfg.machine.no;
  this.root.userData.detailPass='V123_COMPONENT_LEVEL_ENRICHMENT';
  if(no===4)return this.enrichGravure();
  if(no===17)return this.enrichFolder();
  if(no===21)return this.enrichBlanker();
  if(no===23)return this.enrichCollator();
  if(no===25||no===26)return this.enrichCTP();
  if(no===27)return this.enrichImagesetter();
  if(no===28)return this.enrichZund();
  if(no>=29&&no<=35)return this.enrichCompressor();
  if(no>=36&&no<=41)return this.enrichAHU(no===40);
 }
 activeGroup(i){return this.findNode('universal-module-'+i+'-active');}
 tag(mesh,role,evidence='FAMILY_REFERENCE'){mesh.userData.mechanismRole=role;mesh.userData.evidence=evidence;mesh.userData.detail=true;return mesh;}
 refineV238PriorityRepolish(){
  const no=this.cfg.machine.no;
  if(no!==4)return;
  this.root.userData.visualRefinement='V238_YA1A1A_SERVICE_PROCESS_REPOLISH';
  this.root.userData.repolishRevision='V238';
  this.root.userData.familyEvidenceBoundary='YA1A1A_EXACT_IDENTITY__YA1B1_AND_SHEETFED_GRAVURE_FAMILY_REFERENCE__BMJ_INSTALLED_ENCLOSURE_TRANSFER_DRIVE_DRYER_UNVERIFIED';
  this.root.userData.simulationStatus='BLOCKED_PENDING_YA1A1A_TRANSPORT_DRIVE_VERIFICATION';
  const g=this.group(this.root,'o7-service-v238','YA1A1A family service and installation repolish',[0,0,0],[0,.15,0]);
  g.userData.installedExteriorGeometryVerified=false;
  const mark=(m,role,evidence='SHEETFED_GRAVURE_FAMILY',critical=false)=>{
   if(!m)return m;this.tag(m,role,evidence);if(/^gravure-(?:end-cabinet-|dryer-service-latch-reference)/.test(role))m.userData.coverMountedDetail=true;if(critical)m.userData.silhouetteCritical=true;return m;
  };

  // End cabinets: ventilation, hinges and latches make the exterior read as a serviceable press.
  for(const [x,w] of [[-2.58,1.18],[2.55,1.24]]){
   for(const z of [-1.085,1.085]){
    for(const y of [.78,.90,1.02,1.14,1.26]){
     const l=this.box(g,[w*.48,.012,.018],[x,y,z],'dark',0);mark(l,'gravure-end-cabinet-vent-louvre','YA1A1A_YA1B1_FAMILY_VISUAL');
    }
    for(const y of [.82,1.52])mark(this.cyl(g,.012,.085,[x-w*.34,y,z],'steel','y'),'gravure-end-cabinet-door-hinge','YA1A1A_YA1B1_FAMILY_VISUAL');
    mark(this.box(g,[.026,.20,.020],[x+w*.27,1.18,z],'steel',.004),'gravure-end-cabinet-door-handle','YA1A1A_YA1B1_FAMILY_VISUAL',true);
   }
  }

  // Main plinth / floor interfaces keep the press visibly grounded.
  for(const x of [-2.90,-1.75,-.60,.60,1.75,2.90])for(const z of [-.88,.88]){
   const pad=this.cyl(g,.060,.025,[x,.025,z],'dark','y');mark(pad,'gravure-leveling-foot-pad','SHEETFED_PRESS_FAMILY',true);pad.userData.floorInterface=true;
   mark(this.cyl(g,.010,.028,[x,.052,z],'steel','y'),'gravure-floor-anchor-bolt','SHEETFED_PRESS_FAMILY');
  }

  // Operator platform gains toe-board / rail posts so it no longer reads as a floating strip.
  const platform=this.findNode('o7-operator-platform-v232');
  if(platform){
   for(const z of [-1.01,-.82]){
    const toe=this.box(platform,[4.70,.075,.025],[.12,.42,z],'dark',.004);mark(toe,'gravure-platform-toe-board-reference','SHEETFED_GRAVURE_FAMILY',true);
   }
   for(let x=-2.02;x<=2.20;x+=.70){
    const post=this.cyl(platform,.020,.66,[x,.76,-1.01],'steel','y');mark(post,'gravure-platform-handrail-post-reference','SHEETFED_GRAVURE_FAMILY',true);
   }
  }

  // Gravure/impression bearing service points remain process-family references, not installed bearing-model claims.
  const grav=this.findNode('o7-gravure-cylinder');
  if(grav)for(const z of [-.70,.70]){
   const cap=this.cyl(grav,.080,.030,[0,.84,z],'dark','z');mark(cap,'gravure-cylinder-bearing-service-cap','SHEETFED_GRAVURE_PRIMARY',true);cap.userData.installedBearingModelVerified=false;
   mark(this.cyl(grav,.010,.055,[.07,.96,z],'steel','y'),'gravure-cylinder-grease-point-reference','SHEETFED_GRAVURE_PRIMARY');
  }
  const imp=this.findNode('o7-impression-cylinder');
  if(imp)for(const z of [-.70,.70]){
   const cap=this.cyl(imp,.082,.030,[0,1.43,z],'dark','z');mark(cap,'impression-bearing-service-cap','SHEETFED_GRAVURE_PATENT',true);cap.userData.installedBearingModelVerified=false;
  }

  // Ink-pan drain/service hardware is supported by the circulation architecture but exact installed routing remains bounded.
  const pan=this.findNode('o7-ink-pan');
  if(pan){
   const drain=this.cyl(pan,.018,.22,[.22,.35,.45],'steel','x');mark(drain,'gravure-ink-pan-drain-reference','SHEETFED_GRAVURE_FAMILY');
   const valve=this.cyl(pan,.035,.045,[.34,.35,.45],'accent','z');mark(valve,'gravure-ink-drain-valve-reference','SHEETFED_GRAVURE_FAMILY');
   valve.userData.installedRoutingVerified=false;
  }
  const circ=this.findNode('o7-ink-circulation');
  if(circ){
   for(const z of [-.42,.42])mark(this.box(circ,[.045,.025,.040],[.06,.72,z],'steel',.004),'gravure-ink-line-retainer-reference','FAMILY_REFERENCE');
  }

  // Doctor service adjusters are family/patent grounded; installed actuator topology remains unverified.
  const doctor=this.findNode('o7-doctor');
  if(doctor){
   for(const z of [-.48,.48]){
    const adj=this.cyl(doctor,.035,.12,[-.36,1.20,z],'steel','y');mark(adj,'gravure-doctor-pressure-adjuster-reference','GRAVURE_DOCTOR_PATENT');
    adj.userData.installedActuatorVerified=false;
   }
  }

  // Dryer exhaust stack gets flange/latch service detail only. Dryer energy technology remains explicitly unverified.
  const exh=this.findNode('o7-dryer-exhaust');
  if(exh){
   for(const z of [-.42,.42]){
    const flange=this.cyl(exh,.115,.025,[.18,2.52,z],'dark','y');mark(flange,'gravure-dryer-exhaust-flange-reference','SHEETFED_GRAVURE_FAMILY',true);
    for(const dx of [-.07,.07])for(const dz of [-.07,.07])mark(this.cyl(exh,.009,.025,[.18+dx,2.52,z+dz],'steel','y'),'gravure-dryer-flange-bolt-reference','SHEETFED_GRAVURE_FAMILY');
   }
   const latch=this.box(exh,[.030,.18,.025],[-.02,1.45,.61],'steel',.004);mark(latch,'gravure-dryer-service-latch-reference','SHEETFED_GRAVURE_FAMILY');
   exh.userData.installedDryerTechnologyVerified=false;
  }

  // Bounded family control pedestal: improves human-operable scale without asserting a specific controller generation.
  const drive=this.activeGroup(8);
  if(drive){
   const post=this.box(drive,[.08,.72,.08],[.46,.74,-.78],'steel',.012);mark(post,'gravure-operator-console-post-reference','SHEETFED_PRESS_FAMILY',true);
   // A fixed operator station is not a removable machine cover. Keep the
   // pedestal and display mounted when the process bay is opened for study.
   const console=this.box(drive,[.44,.34,.12],[.46,1.18,-.78],'body',.035);mark(console,'gravure-operator-console-family-reference','SHEETFED_PRESS_FAMILY',true);
   const screen=this.box(drive,[.30,.20,.020],[.46,1.20,-.85],'glass',.014);mark(screen,'gravure-operator-display-family-reference','SHEETFED_PRESS_FAMILY',true);
   console.userData.installedControllerGenerationVerified=false;
  }

  let retained=0;
  for(const mesh of this.meshes){
   const role=String(mesh.userData?.mechanismRole||'');
   if(/gravure-(?:leveling-foot|platform|end-cabinet-door-handle|cylinder-bearing-service-cap|dryer-exhaust-flange|operator-console)/.test(role)){
    mesh.userData.silhouetteCritical=true;retained++;
   }
  }
  this.root.userData.homeSilhouetteCriticalCount=(this.root.userData.homeSilhouetteCriticalCount||0)+retained;
 }
 refineV231VisualParity(){
  const no=this.cfg.machine.no;
  this.root.userData.visualParityRevision='V231';
  this.root.userData.homeDetailGeometryPolicy='SAME_LIVE_TEMPLATE__MICRODETAIL_CULLED__SILHOUETTE_DNA_RETAINED';
  const patterns=new Map([
   [17,/blank-feed-table|feeder-transport-belt|blank-aligner-rail|prebreaker-guide-rail|primary-fold-transport-belt|final-fold|compression|delivery-conveyor|fgm-feeder-section-motor|folder-gluer-bearing-block/],
   [21,/qf-lower-service-door|qf-family-accent-stripe|blanking-pressure-plate|product-receiving-tray|x-axis-linear-guide|y-axis-linear-guide/],
   [23,/collator-bin-front-lip|feed-bin-shelf|collator-bin-air-plenum|vertical-gather-guide|set-delivery/],
   [25,/ctp-plate-entry-slot|ctp-plate-output-slot|ctp-cooling-vent|ctp-hmi-post|ctp-hmi-display/],
   [26,/ctp-plate-entry-slot|ctp-plate-output-slot|ctp-cooling-vent|ctp-hmi-post|ctp-hmi-display/],
   [27,/ctf-media-cassette-door|ctf-scanner-service-door|ctf-output-service-door|ctf-media-output-slot|ctf-status-panel/],
   [28,/vacuum-cutting-surface|travelling-beam-structure|tool-carriage-structure|gantry-linear-guide|beam-guide-carriage/]
  ]);
  const compressor=/compressor-cabinet-plinth|compressor-cabinet-top-panel|compressor-cabinet-side-panel|compressor-cabinet-rear-panel|compressor-service-door|compressor-service-door-handle|compressor-cooling-air-inlet-louvre|compressor-cooling-air-exhaust-grille/;
  const pattern=no>=29&&no<=35?compressor:patterns.get(no);
  let retained=0;
  if(pattern)for(const mesh of this.meshes){
   const role=String(mesh.userData?.mechanismRole||'');
   if(pattern.test(role)){mesh.userData.silhouetteCritical=true;retained++;}
  }
  this.root.userData.homeSilhouetteCriticalCount=retained;
  if(no===17)this.root.userData.visualParityFamily='FGM2_OPEN_FRAME_PROCESS_INTERSECTION';
  else if(no===21)this.root.userData.visualParityFamily='QF100CS_QF_LQF1080_FAMILY_BLANKER';
  else if(no===23)this.root.userData.visualParityFamily='VERTICAL_SUCTION_COLLATOR_TOWER';
  else if(no===25||no===26)this.root.userData.visualParityFamily='HEIDELBERG_SUPRASETTER_MULTI_MODEL';
  else if(no===27)this.root.userData.visualParityFamily='SCREEN_FTR_KATANA_MULTI_MODEL';
  else if(no===28)this.root.userData.visualParityFamily='ZUND_G3_S3_MODULAR_FLATBED';
  else if(no>=29&&no<=35)this.root.userData.visualParityFamily='BRAND_SPECIFIC_ROTARY_SCREW_COMPRESSOR';
  else if(no>=36&&no<=41)this.root.userData.visualParityFamily=no===40?'SANSIN_NES_YZKJ_FAMILY':'DOUBLE_SKIN_AHU_FAMILY';
 }
 refineV232PriorityPolish(){
  const no=this.cfg.machine.no;
  if(no!==4)return;
  this.root.userData.visualRefinement='V232_YA1A1A_SHEETFED_GRAVURE_EXTERIOR_POLISH';
  this.root.userData.homeDetailGeometryPolicy='SAME_LIVE_TEMPLATE__OPEN_PRINT_BAY_AND_GRAVURE_PROCESS_DNA_RETAINED';
  this.root.userData.familyEvidenceBoundary='YA1A1A_EXACT_IDENTITY__YA1B1_AND_SHEETFED_GRAVURE_FAMILY_EXTERIOR_REFERENCE__BMJ_INSTALLED_ENCLOSURE_UNVERIFIED';

  const shell=this.group(this.root,'o7-exterior-v232','YA1A1A sheet-fed gravure exterior family refinement',[0,0,0],[0,.18,0]);
  shell.userData.installedExteriorGeometryVerified=false;

  // Conservative family silhouette: low dark plinth, broad end cabinets and an open central process bay.
  const plinth=this.box(shell,[6.65,.30,2.18],[0,.27,0],'dark',.035);
  plinth.userData.silhouetteCritical=true;plinth.userData.mechanismRole='gravure-main-plinth-reference';

  for(const [x,w] of [[-2.58,1.18],[2.55,1.24]]){
    for(const z of [-1.02,1.02]){
      const side=this.cover(this.box(shell,[w,1.52,.10],[x,1.18,z],'body',.055));
      side.userData.silhouetteCritical=true;side.userData.mechanismRole='gravure-end-cabinet-side-reference';
    }
    const top=this.cover(this.box(shell,[w,.18,2.04],[x,1.92,0],'body',.045));
    top.userData.silhouetteCritical=true;top.userData.mechanismRole='gravure-end-cabinet-top-reference';
  }

  // Central side housings frame the cylinder/doctor zone without sealing it.
  for(const z of [-1.02,1.02]){
    for(const x of [-1.12,.12,1.12]){
      const pillar=this.cover(this.box(shell,[.28,1.45,.10],[x,1.22,z],'body',.035));
      pillar.userData.silhouetteCritical=true;pillar.userData.mechanismRole='gravure-process-bay-pillar-reference';
    }
    const crown=this.cover(this.box(shell,[3.00,.18,.10],[0,1.92,z],'dark',.030));
    crown.userData.silhouetteCritical=true;crown.userData.mechanismRole='gravure-process-bay-crown-reference';
  }

  const platform=this.group(shell,'o7-operator-platform-v232','Operator platform / service access family reference');
  const deck=this.box(platform,[4.90,.10,.24],[.15,.33,-.91],'steel',.012);
  deck.userData.silhouetteCritical=true;deck.userData.mechanismRole='gravure-operator-platform-reference';
  for(let x=-2.0;x<=2.15;x+=.55){
    const tread=this.box(platform,[.34,.020,.20],[x,.39,-.91],'steel',0);
    tread.userData.detail=true;tread.userData.mechanismRole='platform-grating-reference';
  }
  for(const x of [-2.12,2.24])this.cyl(platform,.020,.72,[x,.74,-1.01],'steel','y');
  this.cyl(platform,.020,4.36,[.06,1.08,-1.01],'steel','x').userData.mechanismRole='platform-handrail-reference';

  // Service-door seams/handles read as industrial panels; these are not installation-specific internals.
  for(const [x,w] of [[-2.58,1.18],[2.55,1.24]])for(const z of [-1.075,1.075]){
    const seam=this.box(shell,[w*.72,.010,.012],[x,1.18,z],'dark',.001);seam.userData.detail=true;seam.userData.mechanismRole='gravure-service-door-seam-reference';seam.userData.coverMountedDetail=true;
  }

  let retained=0;
  for(const m of this.meshes){
    const role=String(m.userData?.mechanismRole||'');
    if(/gravure-main-plinth|gravure-end-cabinet|gravure-process-bay|gravure-operator-platform|platform-handrail/.test(role)){m.userData.silhouetteCritical=true;retained++;}
  }
  this.root.userData.homeSilhouetteCriticalCount=(this.root.userData.homeSilhouetteCriticalCount||0)+retained;
 }
 refineV236MechanicalRealism(){
  const no=this.cfg.machine.no;
  if(no===4)return;
  this.root.userData.mechanicalRealismRevision='V236';
  this.root.userData.mechanicalRealismPolicy='FAMILY_OR_MODEL_EVIDENCE_ONLY__NO_UNVERIFIED_INSTALLED_OPTION_ASSERTION';
  const mark=(mesh,role,evidence='FAMILY_VISUAL_REFERENCE',silhouette=false)=>{
   if(!mesh)return mesh;
   this.tag(mesh,role,evidence);
   if(silhouette)mesh.userData.silhouetteCritical=true;
   return mesh;
  };
  const serviceDoor=(g,x,y,z,w,h,kind='body',role='service-door-reference')=>{
   const panel=this.cover(this.box(g,[w,h,.032],[x,y,z],kind,.018));mark(panel,role,'FAMILY_SERVICE_REFERENCE',true);
   const seam=this.box(g,[w*.82,.010,.012],[x,y,z+(z<0?-.020:.020)],'dark',.001);mark(seam,role+'-seam','FAMILY_SERVICE_REFERENCE');seam.userData.coverMountedDetail=true;
   const handle=this.box(g,[.026,.18,.018],[x+w*.30,y,z+(z<0?-.030:.030)],'steel',.004);mark(handle,role+'-handle','FAMILY_SERVICE_REFERENCE');handle.userData.coverMountedDetail=true;
   return panel;
  };
  const foot=(g,x,z)=>{
   const stem=this.cyl(g,.032,.16,[x,.10,z],'steel','y');mark(stem,'leveling-foot-stem','FAMILY_SERVICE_REFERENCE');
   const pad=this.cyl(g,.075,.025,[x,.022,z],'dark','y');mark(pad,'leveling-foot-pad','FAMILY_SERVICE_REFERENCE',true);
  };

  if(no===17){
   this.root.userData.visualRefinement='V236_FGM2_OPEN_FRAME_SERVICE_REALISM';
   const g=this.group(this.root,'fgm2-service-v236','FGM-2 service-access and folding-rail realism');
   g.userData.installedIdentityVerified=false;
   for(const z of [-.79,.79]){
    const rail=this.box(g,[10.25,.055,.055],[0,1.16,z],'steel',.008);mark(rail,'folder-gluer-longitudinal-service-rail','MULTI_VENDOR_FOLDER_GLUER_PROCESS',true);
    for(let x=-4.8;x<=4.8;x+=1.20){
     const post=this.box(g,[.055,.48,.055],[x,.92,z],'steel',.008);mark(post,'folder-gluer-service-rail-post');
    }
   }
   for(const x of [-4.35,-2.70,-1.00,.75,2.45,4.15]){
    const bridge=this.box(g,[.055,.50,1.62],[x,1.06,0],'steel',.008);mark(bridge,'folder-gluer-section-bridge-reference','MULTI_VENDOR_FOLDER_GLUER_PROCESS',true);
    for(const z of [-.66,.66]){
     const wheel=this.cyl(g,.070,.030,[x,.86,z],'dark','z');mark(wheel,'folder-gluer-adjustment-handwheel-reference','FOLDER_GLUER_SERVICE_REFERENCE');
     const shaft=this.cyl(g,.016,.20,[x,.98,z],'steel','y');mark(shaft,'folder-gluer-adjustment-screw-reference','FOLDER_GLUER_SERVICE_REFERENCE');
    }
   }
   serviceDoor(g,4.62,.72,-.90,.72,.62,'body','folder-gluer-control-service-door');
   serviceDoor(g,-4.72,.64,-.90,.58,.52,'body','folder-gluer-feeder-service-door');
   for(const x of [-4.85,4.85])for(const z of [-.68,.68])foot(g,x,z);
  }else if(no===21){
   this.root.userData.visualRefinement='V236_QF100CS_HYDRAULIC_BLANKER_SERVICE_REALISM';
   const g=this.group(this.root,'qf100-service-v236','QF/LQF family hydraulic blanker exterior service realism');
   g.userData.exactModelEquivalenceVerified=false;
   serviceDoor(g,-1.63,.84,-.92,.62,.92,'body','blanker-hydraulic-service-door');
   serviceDoor(g,1.58,.84,-.92,.60,.92,'body','blanker-electrical-service-door');
   const tank=this.cover(this.box(g,[.74,.46,.56],[-1.62,.36,.50],'dark',.030));mark(tank,'blanker-hydraulic-reservoir-family-reference','QF_LQF_FAMILY_PRIMARY',true);
   const pump=this.cyl(g,.12,.30,[-1.55,.62,.50],'steel','x');mark(pump,'blanker-hydraulic-pump-reference','QF_LQF_FAMILY_PRIMARY');
   const cable=this.group(g,'qf-cable-chain-v236','Servo cable-carrier reference');
   for(let i=0;i<18;i++){const link=this.box(cable,[.08,.045,.18],[-.95+i*.10,.70,.62],'dark',.006);mark(link,'blanker-servo-cable-carrier-link','QF_LQF_FAMILY_PRIMARY');}
   const estopPost=this.box(g,[.09,.78,.09],[1.93,.55,-1.02],'steel',.012);mark(estopPost,'blanker-operator-post-reference','FAMILY_CONTROL_REFERENCE',true);
   const estop=this.cyl(g,.055,.055,[1.93,.96,-1.02],'red','y');mark(estop,'blanker-emergency-stop-reference','FAMILY_CONTROL_REFERENCE');
   for(const x of [-1.82,1.82])for(const z of [-.72,.72])foot(g,x,z);
  }else if(no===23){
   this.root.userData.visualRefinement='V236_COLLATOR_TOWER_SERVICE_REALISM';
   const g=this.group(this.root,'collator-service-v236','Vertical suction collator exterior service realism');
   g.userData.referenceBinCount=10;g.userData.installedBinCountVerified=false;
   for(let i=0;i<10;i++){
    const y=.40+i*.155;
    const lip=this.box(g,[1.22,.045,.08],[-.18,y,-.58],'steel',.006);mark(lip,'collator-bin-front-lip-reference','MULTI_VENDOR_COLLATOR_REFERENCE',true);
    const stop=this.box(g,[.035,.10,.74],[-.70,y+.02,0],'dark',.004);mark(stop,'collator-bin-side-stop-reference','MULTI_VENDOR_COLLATOR_REFERENCE');
   }
   const manifold=this.cyl(g,.055,1.48,[.62,1.08,.62],'dark','y');mark(manifold,'collator-vacuum-manifold-reference','MULTI_VENDOR_COLLATOR_REFERENCE',true);
   for(let i=0;i<10;i++){const hose=this.cyl(g,.012,.38,[.53,.42+i*.155,.48],'dark','x');mark(hose,'collator-vacuum-hose-reference','MULTI_VENDOR_COLLATOR_REFERENCE');}
   const arm=this.box(g,[.42,.045,.045],[.58,1.72,-.72],'steel',.006);arm.rotation.z=-.18;mark(arm,'collator-hmi-swing-arm-reference','CONTROL_FAMILY_REFERENCE',true);
   const hmi=this.cover(this.box(g,[.34,.27,.045],[.77,1.78,-.75],'dark',.018));mark(hmi,'collator-hmi-reference','CONTROL_FAMILY_REFERENCE',true);
   const tray=this.box(g,[1.08,.08,.78],[.28,.28,-.70],'dark',.018);mark(tray,'collator-set-delivery-tray-reference','MULTI_VENDOR_COLLATOR_REFERENCE',true);
   for(const z of [-.32,.32]){const guide=this.box(g,[1.00,.16,.035],[.28,.42,-.70+z],'steel',.005);mark(guide,'collator-delivery-side-guide-reference','MULTI_VENDOR_COLLATOR_REFERENCE');}
  }else if(no===25||no===26){
   this.root.userData.visualRefinement='V236_SUPRASETTER_SERVICE_PANEL_REALISM';
   const g=this.group(this.root,`ctp-service-v236-${no}`,'Suprasetter family enclosure service realism');
   g.userData.exactModelVerified=false;
   for(const z of [-.83,.83]){
    serviceDoor(g,-.42,.82,z,1.10,.88,'body','ctp-main-service-door-reference');
    for(let y=.48;y<=1.18;y+=.10){const vent=this.box(g,[.52,.020,.035],[.70,y,z+(z<0?-.025:.025)],'dark',.002);mark(vent,'ctp-cooling-vent-bank-reference','SUPRASETTER_FAMILY_VISUAL');vent.userData.coverMountedDetail=true;}
   }
   const entryBezel=this.cover(this.box(g,[.74,.12,.08],[-1.08,.70,-.86],'dark',.012));mark(entryBezel,'ctp-entry-slot-bezel-reference','SUPRASETTER_FAMILY_VISUAL',true);
   const outputBezel=this.cover(this.box(g,[.70,.12,.08],[1.02,.68,-.86],'dark',.012));mark(outputBezel,'ctp-output-slot-bezel-reference','SUPRASETTER_FAMILY_VISUAL',true);
   const post=this.box(g,[.08,.72,.08],[-1.18,.88,-1.02],'dark',.010);mark(post,'ctp-hmi-support-post-reference','SUPRASETTER_FAMILY_VISUAL',true);post.userData.coverMountedDetail=true;
   const hmi=this.cover(this.box(g,[.32,.24,.04],[-1.18,1.28,-1.02],'dark',.014));mark(hmi,'ctp-hmi-bezel-reference','SUPRASETTER_FAMILY_VISUAL',true);
   for(const x of [-1.02,1.02])for(const z of [-.62,.62])foot(g,x,z);
  }else if(no===27){
   this.root.userData.visualRefinement='V236_SCREEN_IMAGESETTER_SERVICE_REALISM';
   const g=this.group(this.root,'ctf-service-v236','SCREEN imagesetter enclosure service realism');
   g.userData.exactScreenModelVerified=false;
   serviceDoor(g,-.55,.77,-.63,.72,.72,'body','ctf-media-cassette-service-door');
   serviceDoor(g,.18,.83,-.63,.62,.82,'body','ctf-scanner-service-door');
   serviceDoor(g,.76,.66,-.63,.42,.54,'body','ctf-output-service-door');
   for(let y=.48;y<=1.05;y+=.09){const vent=this.box(g,[.38,.018,.030],[.76,y,.62],'dark',.002);mark(vent,'ctf-cooling-vent-reference','SCREEN_FTR_KATANA_FAMILY');vent.userData.coverMountedDetail=true;}
   const slot=this.cover(this.box(g,[.52,.09,.060],[.78,.72,-.66],'dark',.010));mark(slot,'ctf-media-output-slot-bezel','SCREEN_FTR_KATANA_FAMILY',true);
   const tower=this.box(g,[.035,.40,.035],[-.92,1.36,-.66],'steel',.004);mark(tower,'ctf-status-tower-post-reference','CONTROL_FAMILY_REFERENCE');tower.userData.coverMountedDetail=true;
   for(const [dy,k] of [[.18,'green'],[.10,'yellow'],[.02,'red']]){const lamp=this.cyl(g,.035,.05,[-.92,1.36+dy,-.66],k,'y');mark(lamp,'ctf-status-lamp-reference','CONTROL_FAMILY_REFERENCE');lamp.userData.coverMountedDetail=true;}
   for(const x of [-.90,.90])for(const z of [-.46,.46])foot(g,x,z);
  }else if(no===28){
   this.root.userData.visualRefinement='V236_ZUND_FLATBED_SERVICE_REALISM';
   const g=this.group(this.root,'zund-service-v236','ZÃ¼nd modular flatbed service realism');
   g.userData.exactModelVerified=false;
   const rail1=this.box(g,[5.25,.055,.055],[0,.73,-1.18],'steel',.006);mark(rail1,'zund-x-linear-guide-reference','ZUND_G3_S3_FAMILY',true);
   const rail2=this.box(g,[5.25,.055,.055],[0,.73,1.18],'steel',.006);mark(rail2,'zund-x-linear-guide-reference','ZUND_G3_S3_FAMILY',true);
   const chain=this.group(g,'zund-cable-chain-v236','Travelling cable-chain reference');
   for(let i=0;i<34;i++){const link=this.box(chain,[.10,.035,.12],[-2.35+i*.14,.78,1.34],'dark',.004);mark(link,'zund-cable-chain-link-reference','ZUND_G3_S3_FAMILY');}
   const console=this.cover(this.box(g,[.48,.88,.42],[2.45,.80,-1.48],'body',.040));mark(console,'zund-operator-console-reference','ZUND_PLATFORM_FAMILY',true);
   const screen=this.cover(this.box(g,[.34,.24,.025],[2.45,1.04,-1.70],'glass',.014));mark(screen,'zund-control-display-reference','ZUND_PLATFORM_FAMILY',true);
   for(let x=-2.45;x<=2.45;x+=.70){const zone=this.box(g,[.55,.006,2.18],[x,.69,0],'dark',0);mark(zone,'zund-vacuum-zone-seam-reference','ZUND_PLATFORM_FAMILY');}
   for(const x of [-2.55,2.55])for(const z of [-1.10,1.10])foot(g,x,z);
  }else if(no>=29&&no<=35){
   const atlas=[29,30,35].includes(no),kaeser=[31,32,34].includes(no),swan=no===33;
   this.root.userData.visualRefinement=atlas?'V236_ATLAS_GA_G_EXTERIOR_SERVICE_REALISM':kaeser?'V236_KAESER_SIGMA_EXTERIOR_SERVICE_REALISM':'V236_SWAN_SCREW_EXTERIOR_SERVICE_REALISM';
   const g=this.group(this.root,`compressor-service-v236-${no}`,'Rotary screw compressor exterior service realism');
   g.userData.exactModelVerified=false;
   const w=2.42;
   const accent=atlas?'blue':kaeser?'yellow':'blue';
   serviceDoor(g,-.52,.88,-.84,.92,1.02,'body','compressor-main-service-door');
   serviceDoor(g,.52,.88,-.84,.84,1.02,'body','compressor-control-service-door');
   for(let y=.48;y<=1.28;y+=.10){const l=this.box(g,[.64,.022,.038],[-.58,y,.84],'dark',.002);mark(l,'compressor-intake-louvre-reference','BRAND_FAMILY_VISUAL');l.userData.coverMountedDetail=true;}
   for(let x=-.45;x<=.45;x+=.11){const l=this.box(g,[.045,.022,.60],[x,1.66,.08],'dark',.002);mark(l,'compressor-top-exhaust-grille-reference','BRAND_FAMILY_VISUAL');l.userData.coverMountedDetail=true;}
   const stripe=this.cover(this.box(g,[.08,1.20,.025],[.16,.92,-.87],accent,.006));mark(stripe,'compressor-brand-family-accent-reference','BRAND_FAMILY_VISUAL',true);
   const ctrl=this.cover(this.box(g,[.34,.28,.030],[.70,1.13,-.88],'dark',.012));mark(ctrl,'compressor-controller-bezel-reference','BRAND_FAMILY_VISUAL',true);
   const display=this.cover(this.box(g,[.23,.13,.014],[.70,1.16,-.90],'glass',.008));mark(display,'compressor-controller-display-reference','BRAND_FAMILY_VISUAL');
   for(const x of [-w*.40,w*.40])for(const z of [-.60,.60])foot(g,x,z);
   this.root.userData.brandFamilyVisual=atlas?'ATLAS_COPCO_GA_G':kaeser?'KAESER_SIGMA':swan?'SWAN_TS_AD_TMV':'ROTARY_SCREW';
  }else if(no>=36&&no<=41){
   const sansin=no===40;
   this.root.userData.visualRefinement=sansin?'V236_SANSIN_NES_AHU_SERVICE_REALISM':'V236_DOUBLE_SKIN_AHU_SERVICE_REALISM';
   const g=this.group(this.root,`ahu-service-v236-${no}`,'AHU sectional exterior service realism');
   g.userData.sectionOrderVerified=false;
   const length=sansin?4.72:6.72;
   const sectionCount=sansin?4:7;
   const pitch=length/sectionCount;
   for(let i=0;i<sectionCount;i++){
    const x=-length/2+pitch*(i+.5);
    const seam=this.box(g,[.020,1.72,.020],[x+pitch*.47,1.02,-1.02],'dark',.001);mark(seam,'ahu-panel-seam-reference','DOUBLE_SKIN_AHU_FAMILY');seam.userData.coverMountedDetail=true;
    const handle=this.box(g,[.025,.20,.025],[x+pitch*.20,1.02,-1.04],'dark',.004);mark(handle,'ahu-service-door-handle-reference','DOUBLE_SKIN_AHU_FAMILY');handle.userData.coverMountedDetail=true;
    for(const dy of [-.42,.42]){const hinge=this.box(g,[.035,.10,.025],[x-pitch*.33,1.02+dy,-1.04],'steel',.004);mark(hinge,'ahu-service-door-hinge-reference','DOUBLE_SKIN_AHU_FAMILY');hinge.userData.coverMountedDetail=true;}
   }
   for(const x of [-length/2+.18,length/2-.18])for(const z of [-.84,.84]){const rail=this.box(g,[.18,.16,.18],[x,.10,z],'dark',.010);mark(rail,'ahu-base-rail-foot-reference','DOUBLE_SKIN_AHU_FAMILY',true);}
   const drain=this.cyl(g,.025,.48,[0,.18,-1.18],'steel','x');mark(drain,'ahu-condensate-drain-trap-reference','AHU_FUNCTIONAL_REFERENCE',true);
   if(sansin){
    const outdoor=this.cover(this.box(g,[1.30,1.35,.72],[2.62,.82,.16],'body',.050));mark(outdoor,'sansin-outdoor-module-family-reference','SANSIN_NES_YZKJ_FAMILY',true);outdoor.userData.installedArrangementVerified=false;
    for(const y of [.54,.80,1.06]){const grille=this.box(g,[.90,.025,.50],[2.62,y,-.22],'dark',.003);mark(grille,'sansin-outdoor-coil-grille-reference','SANSIN_NES_YZKJ_FAMILY');grille.userData.coverMountedDetail=true;}
   }else{
    const window=this.cover(this.box(g,[.34,.34,.025],[length*.18,1.18,-1.045],'glass',.018));mark(window,'ahu-service-observation-window-reference','DOUBLE_SKIN_AHU_FAMILY');
   }
  }
  let retained=0;
  for(const mesh of this.meshes){
   if(mesh.userData?.silhouetteCritical&&mesh.userData?.detail)retained++;
  }
  this.root.userData.homeSilhouetteCriticalCount=Math.max(this.root.userData.homeSilhouetteCriticalCount||0,retained);
 }
 enrichGravure(){
  const f=this.activeGroup(1),reg=this.activeGroup(2),ink=this.activeGroup(3),print=this.activeGroup(4),imp=this.activeGroup(5),dryer=this.activeGroup(6),delivery=this.activeGroup(7),drive=this.activeGroup(8);
  const sections=[f,reg,ink,print,imp,dryer,delivery,drive].filter(Boolean);
  for(const section of sections)for(const child of [...section.children])if(child.isMesh){child.visible=false;child.userData.referencePlaceholder=true;}
  const part=(parent,id,name,explode=[0,.08,.08])=>parent?this.group(parent,id,name,[0,0,0],explode):null;
  this.root.userData.detailPass='V123_R2_YA1A1A_SHEETFED_GRAVURE_COMPONENT_RECONSTRUCTION';
  this.root.userData.simulationStatus='BLOCKED_PENDING_YA1A1A_TRANSPORT_DRIVE_VERIFICATION';
  this.root.userData.printingNip={x:-.65,y:1.128,z:0,relation:'GRAVURE_CYLINDER_TO_IMPRESSION_CYLINDER',verifiedGeometry:false};
  this.root.userData.gravureMechanismBoundary={
   exactIdentity:'YA1A1A',
   processFamily:'SHEET_FED_SINGLE_COLOR_GRAVURE',
   verifiedMechanisms:['sheet feeding','impression-cylinder gripper principle','gravure cylinder','doctor blade','ink pan / drop-feed architectures','drying/exhaust functional section','sheet delivery'],
   unresolvedInstalledDetails:['exact feeder transfer geometry','ink-feed mode on BMJ asset','cylinder diameters','doctor actuation hardware','dryer technology','main-drive topology','high-pile non-stop option']
  };

  if(f){
   const suction=part(f,'o7-feeder-suction','Suction feeder head');
   this.tag(this.box(suction,[.52,.05,1.16],[-.08,1.24,0],'steel',.008),'suction-head-rail','SHEETFED_FAMILY');
   for(const z of [-.42,-.14,.14,.42])this.tag(this.cyl(suction,.026,.18,[-.08,1.14,z],'dark','y'),'feeder-sucker','SHEETFED_FAMILY');
   const swing=part(f,'o7-feeder-swing-gripper','Swing-pawl sheet transfer');
   this.tag(this.cyl(swing,.034,1.18,[.17,.91,0],'steel','z'),'swing-gripper-shaft','SHEETFED_GRAVURE_PATENT');
   for(const z of [-.43,-.14,.14,.43]){const pawl=this.box(swing,[.12,.035,.055],[.11,.96,z],'dark',.004);pawl.rotation.z=-.22;this.tag(pawl,'swing-pawl-gripper','SHEETFED_GRAVURE_PATENT');}
   const vac=part(f,'o7-feeder-vacuum','Feeder vacuum supply');
   this.tag(this.cyl(vac,.105,.26,[-.18,.45,.57],'dark','x'),'feeder-vacuum-pump','SHEETFED_FAMILY');
   this.tag(this.cyl(vac,.018,.72,[-.05,.72,.56],'steel','y'),'feeder-vacuum-manifold','SHEETFED_FAMILY');
  }

  if(reg){
   const lays=part(reg,'o7-register-lays','Register lays');
   for(const z of [-.42,.42])this.tag(this.box(lays,[.11,.10,.09],[.05,.82,z],'accent',.008),'side-lay-reference','SHEETFED_FAMILY');
   for(const z of [-.28,.28])this.tag(this.box(lays,[.075,.12,.08],[.22,.86,z],'steel',.006),'front-lay-reference','SHEETFED_FAMILY');
   const transfer=part(reg,'o7-register-transfer','Register transfer gripper');
   this.tag(this.cyl(transfer,.032,1.18,[.15,.95,0],'steel','z'),'register-transfer-shaft','SHEETFED_FAMILY');
   const bar=this.box(transfer,[.065,.055,1.12],[.20,1.00,0],'dark',.005);this.tag(bar,'register-gripper-bar','SHEETFED_FAMILY');
  }

  if(ink){
   const pan=part(ink,'o7-ink-pan','Adjustable ink pan');
   this.tag(this.box(pan,[.54,.045,1.16],[0,.48,0],'accent',.006),'ink-pan-bottom','SHEETFED_GRAVURE_PATENT');
   for(const z of [-.56,.56])this.tag(this.box(pan,[.54,.16,.035],[0,.55,z],'accent',.004),'ink-pan-sidewall','SHEETFED_GRAVURE_PATENT');
   for(const z of [-.46,.46])this.tag(this.cyl(pan,.022,.38,[-.20,.31,z],'steel','y'),'ink-pan-lift-screw','SHEETFED_GRAVURE_PATENT');
   const circ=part(ink,'o7-ink-circulation','Ink circulation');
   this.tag(this.box(circ,[.28,.30,.34],[.18,.38,.48],'accent',.018),'ink-reservoir','FAMILY_REFERENCE');
   this.tag(this.cyl(circ,.085,.18,[-.18,.39,.48],'dark','x'),'ink-circulation-pump','FAMILY_REFERENCE');
   for(const z of [-.42,.42])this.tag(this.cyl(circ,.014,.60,[.06,.74,z],'steel','y'),'ink-return-line','FAMILY_REFERENCE');
   const drop=part(ink,'o7-ink-drop-option','Drop-feed ink reference');
   drop.userData.installedOptionVerified=false;drop.userData.boundary='Patent-supported alternative architecture; BMJ YA1A1A installed ink-feed mode is not confirmed.';
   this.tag(this.cyl(drop,.018,1.02,[-.24,1.26,0],'steel','z'),'ink-drop-manifold','SHEETFED_GRAVURE_PATENT');
   for(const z of [-.40,-.20,0,.20,.40]){const n=this.cyl(drop,.010,.12,[-.24,1.17,z],'accent','y');this.tag(n,'ink-drop-nozzle-reference','SHEETFED_GRAVURE_PATENT');}
  }

  if(print){
   const cyl=part(print,'o7-gravure-cylinder','Gravure printing cylinder');
   this.tag(this.cyl(cyl,.285,1.24,[0,.84,0],'accent','z'),'engraved-gravure-cylinder','SHEETFED_GRAVURE_PRIMARY');cyl.userData.printingNipPartner='o7-impression-cylinder';
   for(const z of [-.68,.68]){this.tag(this.cyl(cyl,.055,.16,[0,.84,z],'steel','z'),'gravure-cylinder-journal','SHEETFED_GRAVURE_PRIMARY');this.tag(this.box(cyl,[.16,.18,.10],[0,.84,z],'dark',.008),'gravure-side-bearing','SHEETFED_GRAVURE_PRIMARY');}
   const doc=part(print,'o7-doctor','Doctor blade assembly');
   this.tag(this.cyl(doc,.035,1.34,[-.30,1.12,0],'steel','z'),'doctor-pivot-shaft','GRAVURE_DOCTOR_PATENT');
   const holder=this.box(doc,[.16,.09,1.20],[-.24,1.04,0],'dark',.008);holder.rotation.z=-.18;this.tag(holder,'doctor-blade-holder','GRAVURE_DOCTOR_PATENT');
   // Keep the doctor edge tangent to the 285 mm reference cylinder. The old
   // centre (-.15, 1.00) buried the edge about 66 mm into the cylinder body.
   const blade=this.box(doc,[.035,.012,1.16],[-.20,1.04,0],'steel',.002);blade.rotation.z=-.18;this.tag(blade,'doctor-blade-edge','GRAVURE_DOCTOR_PATENT');
   blade.userData.contactRelation='TANGENT_TO_GRAVURE_CYLINDER__FAMILY_REFERENCE';
   this.tag(this.cyl(doc,.050,.17,[-.30,1.18,.58],'accent','x'),'doctor-axial-oscillator','GRAVURE_DOCTOR_PATENT');
   this.tag(this.cyl(doc,.044,.14,[-.30,1.18,-.58],'dark','x'),'doctor-oscillation-damper','GRAVURE_DOCTOR_PATENT');
  }

  if(imp){
   const ic=part(imp,'o7-impression-cylinder','Impression cylinder');
   this.tag(this.cyl(ic,.30,1.24,[0,1.43,0],'steel','z'),'impression-cylinder','SHEETFED_GRAVURE_PATENT');ic.userData.printingNipPartner='o7-gravure-cylinder';
   for(const z of [-.68,.68]){this.tag(this.cyl(ic,.058,.15,[0,1.43,z],'steel','z'),'impression-cylinder-journal','SHEETFED_GRAVURE_PATENT');this.tag(this.box(ic,[.16,.18,.10],[0,1.43,z],'dark',.008),'impression-bearing','SHEETFED_GRAVURE_PATENT');}
   this.tag(this.box(ic,[.055,.045,1.10],[-.16,1.68,0],'dark',.004),'impression-cylinder-gripper-bar','SHEETFED_GRAVURE_PATENT');
   for(const z of [-.42,-.14,.14,.42])this.tag(this.box(ic,[.10,.025,.045],[-.20,1.70,z],'steel',.003),'impression-gripper-finger','SHEETFED_GRAVURE_PATENT');
   const sc=part(imp,'o7-impression-sheet-control','Pre-nip sheet control');
   this.tag(this.cyl(sc,.060,1.10,[-.40,1.16,0],'dark','z'),'slack-suppression-press-roller','SHEETFED_GRAVURE_PATENT');
   for(const z of [-.54,.54])this.tag(this.box(sc,[.11,.20,.06],[-.40,1.16,z],'steel',.006),'press-roller-support','SHEETFED_GRAVURE_PATENT');
  }

  if(dryer){
   dryer.userData.installedDryerTechnologyVerified=false;
   const air=part(dryer,'o7-dryer-air','Drying air section');
   this.tag(this.box(air,[.50,.42,1.18],[0,1.05,0],'body',.018),'dryer-plenum','SHEETFED_GRAVURE_FAMILY');
   for(const y of [.88,1.04,1.20])this.tag(this.box(air,[.42,.022,1.05],[.03,y,0],'steel',.003),'air-knife-reference','MOOG_FAMILY_OPTION');
   const exh=part(dryer,'o7-dryer-exhaust','Dryer exhaust');
   this.tag(this.box(exh,[.18,.52,.34],[-.15,1.42,.43],'dark',.012),'exhaust-duct-reference','SHEETFED_GRAVURE_FAMILY');
   const fan=this.cyl(exh,.13,.08,[-.15,1.62,.43],'dark','z');this.tag(fan,'dryer-exhaust-fan','SHEETFED_GRAVURE_FAMILY');
   this.tag(this.box(exh,[.22,.12,.30],[-.15,1.78,.43],'steel',.008),'exhaust-outlet-reference','SHEETFED_GRAVURE_FAMILY');
   for(const z of [-.42,.42]){this.tag(this.cyl(exh,.070,.92,[.18,2.08,z],'steel','y'),'dryer-exhaust-stack-reference','YA1A1A_VISUAL_REFERENCE');this.tag(this.cyl(exh,.095,.12,[.18,2.55,z],'dark','y'),'dryer-exhaust-stack-cap','YA1A1A_VISUAL_REFERENCE');}
  }

  if(delivery){
   const chain=part(delivery,'o7-delivery-chain','Delivery gripper transport');
   for(const z of [-.62,.62]){this.tag(this.box(chain,[.58,.035,.035],[0,1.34,z],'dark',.003),'delivery-chain-guide','SHEETFED_GRAVURE_FAMILY');for(const x of [-.22,0,.22])this.tag(this.box(chain,[.05,.07,.11],[x,1.31,z],'steel',.004),'delivery-gripper-reference','SHEETFED_GRAVURE_FAMILY');}
   const pile=part(delivery,'o7-delivery-pile','High-pile delivery');
   this.tag(this.box(pile,[.52,.055,1.10],[0,.39,0],'steel',.006),'delivery-pile-platform','MOOG_SHEETFED_GRAVURE');
   for(const z of [-.54,.54])this.tag(this.box(pile,[.40,.22,.045],[.08,.63,z],'accent',.006),'pile-side-jogger','MOOG_SHEETFED_GRAVURE');
   for(const z of [-.42,.42])this.tag(this.box(pile,[.06,.16,.06],[.22,.92,z],'blue',.006),'pile-height-sensor-reference','FAMILY_REFERENCE');
  }

  if(drive){
   const motor=part(drive,'o7-main-drive','Main drive motor');
   this.tag(this.cyl(motor,.13,.34,[-.08,.48,.52],'dark','x'),'main-drive-motor-reference','FAMILY_REFERENCE');
   for(let x=-.16;x<=.16;x+=.08)this.tag(this.box(motor,[.018,.28,.34],[x-.08,.48,.52],'steel',.002),'motor-cooling-fin','FAMILY_REFERENCE');
   const tr=part(drive,'o7-transmission','Mechanical transmission');
   this.tag(this.cyl(tr,.045,1.16,[.08,.55,0],'steel','z'),'transmission-line-shaft-reference','OPTION_BOUNDARY');
   for(const [x,y,r] of [[-.18,.78,.12],[.04,.72,.16],[.24,.84,.09]])this.tag(this.cyl(tr,r,.055,[x,y,.58],'steel','z'),'side-gear-reference','OPTION_BOUNDARY');
   tr.userData.installedTopologyVerified=false;
  }
 }
 enrichFolder(){
  const feed=this.activeGroup(1),align=this.activeGroup(2),fold1=this.activeGroup(3),glue=this.activeGroup(4),fold2=this.activeGroup(5),press=this.activeGroup(6),out=this.activeGroup(7);
  this.root.userData.detailPass='V138_FGM2_SECTIONAL_DRIVE_TRANSMISSION_AND_CONTACT';
  this.root.userData.exactFolderGluerOemVerified=false;
  this.root.userData.exactFolderGluerModelVerified=false;
  this.root.userData.neighborMedia100IdentityProof=false;
  this.root.userData.installedIdentityBoundary='OEM_MODEL_SERIAL_UNKNOWN__NO_MEDIA100_IDENTITY_ASSUMED';
  this.root.userData.localSupplierFamilyEvidence={source:'Jaya Makmur Mesindo',bmjCustomerAssociation:true,folderGluerCatalogue:true,installationProof:false,modelProof:false};
  this.root.userData.fgm2DriveArchitecture={installedArchitectureVerified:false,reference:'SECTIONAL_DRIVE_CAPABILITY',notes:'Independent/sectional drives are supported by BOBST family references; exact FGM-2 motor/gearbox topology remains unverified.'};
  this.root.userData.fgm2Capabilities={
   crashLock:'UNVERIFIED',
   fourSixCorner:'UNVERIFIED',
   glueApplicatorType:'UNVERIFIED',
   glueDetection:'UNVERIFIED',
   counterKicker:'UNVERIFIED',
   downstreamPacking:'UNVERIFIED'
  };
  this.root.userData.commonProcessMechanisms=['BLANK_FEED','ALIGNMENT','PREBREAK','FOLDING_BELTS','ADHESIVE_APPLICATION_ZONE','FINAL_FOLD','COMPRESSION','DELIVERY'];
  const tagOption=(node,boundary)=>{if(!node)return;node.userData.installedOptionVerified=false;node.userData.simulationEnabled=false;node.userData.boundary=boundary;};

  if(feed){
   const table=this.findNode('fgm2-feed-table');
   if(table){
    this.tag(this.box(table,[1.22,.04,1.42],[0,.61,0],'steel',.006),'blank-feed-table','MULTI_VENDOR_FOLDER_GLUER_PROCESS');
    for(const z of [-.64,.64])this.tag(this.box(table,[1.08,.18,.035],[-.05,.72,z],'steel',.004),'blank-side-guide','MULTI_VENDOR_FOLDER_GLUER_PROCESS');
    con}µßn»¶‰žËkºwµçE¹‘½Ý¹ÍÑÉ•…´ÑÉ…¹Í™•Èˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½½™™Í•ÐÄÀµàÄÀÐµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰ATÜ…¹‘½Ý¹ÍÑÉ•…´ÑÉ…¹Í™•Èˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½½™™Í•ÐÄÀµàÄÀÐµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰ATà…¹‘½Ý¹ÍÑÉ•…´ÑÉ…¹Í™•Èˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½½™™Í•ÐÄÀµàÄÀÐµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰ATä…¹‘½Ý¹ÍÑÉ•…´ÑÉ…¹Í™•Èˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½½™™Í•ÐÄÀµàÄÀÐµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰ATÄÀ…¹‘½Ý¹ÍÑÉ•…´ÑÉ…¹Í™•Èˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½½™™Í•ÐÄÀµàÄÀÐµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰ATÄÄ…¹‘½Ý¹ÍÑÉ•…´ÑÉ…¹Í™•Èˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½½™™Í•ÐÄÀµàÄÀÐµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰TÈ½…Ñ¥¹œ…¹‘½Ý¹ÍÑÉ•…´ÑÉ…¹Í™•Èˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½½™™Í•ÐÄÀµàÄÀÐµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰dÈ¥¹Ñ•É‘•¬UX…¹‘½Ý¹ÍÑÉ•…´ÑÉ…¹Í™•Èˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½½™™Í•ÐÄÀµàÄÀÐµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰ATÄÐ…¹‘½Ý¹ÍÑÉ•…´ÑÉ…¹Í™•Èˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½½™™Í•ÐÄÀµàÄÀÐµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰U™¥¹…°½…Ñ¥¹œˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½½™™Í•ÐÄÀµàÄÀÐµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰`Ì‘Éå¥¹œ…¹‘•±¥Ù•ÉäÑÉ…¹ÍÁ½ÉÐˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½½™™Í•ÐÄÀµàÄÀÐµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰‘•±¥Ù•ÉäÁ¥±”…¹½ÕÑÁÕÐˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½½™™Í•ÐÄÀµàÄÀÐµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰¡½ÕÍ¥¹œ°½¹ÑÉ½±Ì°…•ÍÌ…¹ÕÑ¥±¥Ñ¥•Ìˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½½™™Í•ÐÄÀµàÄÀÐµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô(€€€€€t°(€€€€€€‰É•Á½ÉÑÌˆèl(€€€€€€€€‰‘½Ì½½™™Í•ÐÄÀµàÄÀÐµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€t°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€‰ˆØå˜ØÝˆÄá‘…‘‰ŒØÜÔÜÌÁ„ØÅá„Á‘…ÌÈÀäÌá”àˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€ÌàÈàÌÔÐÈÐØØ°(€€€€€€€€€€ÌàÈàÌÔÐÈÐÜä°(€€€€€€€€€€ÌàÈàÌÔÐÈØäÔ(€€€€€€€t°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔØä°(€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÀˆ°(€€€€€€‰¹…µ”ˆè€‰UQ=A1Q8€´€È5!%9ˆ°(€€€€€€‰µ½‘•°ˆè€‰M@€ÄÀÈˆ°(€€€€€€‰…É•„ˆè€‰=MP=9YIQ%9ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰Á…ÉÑÌˆèl(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰Á¥±”™••‘•È°±¥™Ð°Í•Á…É…Ñ¥½¸¡•……¹™••‰•±ÑÌˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´ÈµÍÀÄÀÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€€€€€‰½µµ¥Ðˆè€ˆØàá…ŒÈÔØÐå‘ˆÍŒäÕˆÑå•ˆàÑ˜å”ÔÉˆÑ™‰”äÕˆÙ˜Àˆ°(€€€€€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€€€€€ÌàÈàäÐÜÌàÌÈ°(€€€€€€€€€€€€€€ÌàÈàäÐÜÌäÜä°(€€€€€€€€€€€€€€ÌàÈàäÐÜÌàÔÄ(€€€€€€€€€€€t°(€€€€€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÜÈ°(€€€€€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ(€€€€€€€€€ô(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰É•¥ÍÑ•ÈÑ…‰±”°™É½¹Ð±…åÌ…¹M¥‘•1…äˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰9=}!9}IEU%Iˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´ÈµÍÀÄÀÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€€€€€‰½µµ¥Ðˆè€ˆØàá…ŒÈÔØÐå‘ˆÍŒäÕˆÑå•ˆàÑ˜å”ÔÉˆÑ™‰”äÕˆÙ˜Àˆ°(€€€€€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€€€€€ÌàÈàäÐÜÌàÌÈ°(€€€€€€€€€€€€€€ÌàÈàäÐÜÌäÜä°(€€€€€€€€€€€€€€ÌàÈàäÐÜÌàÔÄ(€€€€€€€€€€€t°(€€€€€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÜÈ°(€€€€€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ(€€€€€€€€€ô(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰ÑÝ¥¸µ¡…¥¸É¥ÁÁ•ÈÑÉ…¹ÍÁ½ÉÐˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰9=}!9}IEU%Iˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´ÈµÍÀÄÀÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€€€€€‰½µµ¥Ðˆè€ˆØàá…ŒÈÔØÐå‘ˆÍŒäÕˆÑå•ˆàÑ˜å”ÔÉˆÑ™‰”äÕˆÙ˜Àˆ°(€€€€€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€€€€€ÌàÈàäÐÜÌàÌÈ°(€€€€€€€€€€€€€€ÌàÈàäÐÜÌäÜä°(€€€€€€€€€€€€€€ÌàÈàäÐÜÌàÔÄ(€€€€€€€€€€€t°(€€€€€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÜÈ°(€€€€€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ(€€€€€€€€€ô(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰Á±…Ñ•¸ÕÑÑ¥¹œ…¹É•…Í¥¹œ½¹Ñ…Ðˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´ÈµÍÀÄÀÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€€€€€‰½µµ¥Ðˆè€ˆØàá…ŒÈÔØÐå‘ˆÍŒäÕˆÑå•ˆàÑ˜å”ÔÉˆÑ™‰”äÕˆÙ˜Àˆ°(€€€€€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€€€€€ÌàÈàäÐÜÌàÌÈ°(€€€€€€€€€€€€€€ÌàÈàäÐÜÌäÜä°(€€€€€€€€€€€€€€ÌàÈàäÐÜÌàÔÄ(€€€€€€€€€€€t°(€€€€€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÜÈ°(€€€€€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ(€€€€€€€€€ô(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰ÍÑÉ¥ÁÁ¥¹œÍÑ…Ñ¥½¸™…µ¥±äÉ•™•É•¹”ˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´ÈµÍÀÄÀÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€€€€€‰½µµ¥Ðˆè€ˆØàá…ŒÈÔØÐå‘ˆÍŒäÕˆÑå•ˆàÑ˜å”ÔÉˆÑ™‰”äÕˆÙ˜Àˆ°(€€€€€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€€€€€ÌàÈàäÐÜÌàÌÈ°(€€€€€€€€€€€€€€ÌàÈàäÐÜÌäÜä°(€€€€€€€€€€€€€€ÌàÈàäÐÜÌàÔÄ(€€€€€€€€€€€t°(€€€€€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÜÈ°(€€€€€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ(€€€€€€€€€ô(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰‘•±¥Ù•ÉäÉ•±•…Í”°Á¥±”™½Éµ…Ñ¥½¸…¹½ÕÑÁÕÐˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰9=}!9}IEU%Iˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´ÈµÍÀÄÀÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€€€€€‰½µµ¥Ðˆè€ˆØàá…ŒÈÔØÐå‘ˆÍŒäÕˆÑå•ˆàÑ˜å”ÔÉˆÑ™‰”äÕˆÙ˜Àˆ°(€€€€€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€€€€€ÌàÈàäÐÜÌàÌÈ°(€€€€€€€€€€€€€€ÌàÈàäÐÜÌäÜä°(€€€€€€€€€€€€€€ÌàÈàäÐÜÌàÔÄ(€€€€€€€€€€€t°(€€€€€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÜÈ°(€€€€€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ(€€€€€€€€€ô(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰‘É¥Ù”°½¹ÑÉ½±Ì°Õ…É‘Ì…¹Í•ÉÙ¥”…•ÍÌˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´ÈµÍÀÄÀÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€€€€€‰½µµ¥Ðˆè€ˆØàá…ŒÈÔØÐå‘ˆÍŒäÕˆÑå•ˆàÑ˜å”ÔÉˆÑ™‰”äÕˆÙ˜Àˆ°(€€€€€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€€€€€ÌàÈàäÐÜÌàÌÈ°(€€€€€€€€€€€€€€ÌàÈàäÐÜÌäÜä°(€€€€€€€€€€€€€€ÌàÈàäÐÜÌàÔÄ(€€€€€€€€€€€t°(€€€€€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÜÈ°(€€€€€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ(€€€€€€€€€ô(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰Í¥µÕ±…Ñ¥½¸±¥™•å±”°¥¹Ñ•É¥½È°1=…¹Ñ…á½¹½µä¹…Ù¥…Ñ¥½¸ˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´ÈµÍÀÄÀÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€€€€€‰½µµ¥Ðˆè€ˆØàá…ŒÈÔØÐå‘ˆÍŒäÕˆÑå•ˆàÑ˜å”ÔÉˆÑ™‰”äÕˆÙ˜Àˆ°(€€€€€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€€€€€ÌàÈàäÐÜÌàÌÈ°(€€€€€€€€€€€€€€ÌàÈàäÐÜÌäÜä°(€€€€€€€€€€€€€€ÌàÈàäÐÜÌàÔÄ(€€€€€€€€€€€t°(€€€€€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÜÈ°(€€€€€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ(€€€€€€€€€ô(€€€€€€€ô(€€€€€t°(€€€€€€‰É•Á½ÉÑÌˆèl(€€€€€€€€‰‘½Ì½…Á´ÈµÍÀÄÀÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€t°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€ˆØàá…ŒÈÔØÐå‘ˆÍŒäÕˆÑå•ˆàÑ˜å”ÔÉˆÑ™‰”äÕˆÙ˜Àˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€ÌàÈàäÐÜÌàÌÈ°(€€€€€€€€€€ÌàÈàäÐÜÌäÜä°(€€€€€€€€€€ÌàÈàäÐÜÌàÔÄ(€€€€€€€t°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÜÈ°(€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÄˆ°(€€€€€€‰¹…µ”ˆè€‰UQ=A1Q8€´€ÔMQ5A%9ˆ°(€€€€€€‰µ½‘•°ˆè€‰5,€äÈÀe5$ˆ°(€€€€€€‰…É•„ˆè€‰=MP=9YIQ%9ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰Á…ÉÑÌˆèl(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰Á¥±”™••‘•È°±¥™Ð…¹ÍÕÑ¥½¸Á¥­ÕÀˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Ôµµ¬äÈÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰É•¥ÍÑÉ…Ñ¥½¸Ñ…‰±”…¹±…åÌˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰9=}!9}IEU%Iˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Ôµµ¬äÈÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰¥¹Ñ•Éµ¥ÑÑ•¹ÐÉ¥ÁÁ•ÈÑÉ…¹ÍÁ½ÉÐˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Ôµµ¬äÈÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰¡•…Ñ•Á±…Ñ•¸…¹¡…Í”½¹Ñ…Ðˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Ôµµ¬äÈÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰¡½Ðµ™½¥°Õ¹Ý¥¹°ÁÕ±°…¹Ý…ÍÑ”É•Ý¥¹ˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Ôµµ¬äÈÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰É¥ÁÁ•ÈÉ•±•…Í”…¹‘•±¥Ù•ÉäÁ¥±”ˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰9=}!9}IEU%Iˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Ôµµ¬äÈÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰‘É¥Ù”°½¹ÑÉ½±Ì°Õ…É‘¥¹œ…¹…•ÍÌˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Ôµµ¬äÈÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰Í¥µÕ±…Ñ¥½¸±¥™•å±”°‘¥ÍÁ±…äµ½‘•Ì…¹Ñ…á½¹½µäˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Ôµµ¬äÈÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô(€€€€€t°(€€€€€€‰É•Á½ÉÑÌˆèl(€€€€€€€€‰‘½Ì½…Á´Ôµµ¬äÈÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€t°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€‰‰ˆÌå”ÈÄÔÜÑ‰™ÄÙ”ÜÐÙ…ˆäÙ™ˆÌÐÈÁ™‘ŒØÄÐÈÅ•ˆÄˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€ÌàÌÄÔÌàààäØ°(€€€€€€€€€€ÌàÌÄÔÌàààäà°(€€€€€€€€€€ÌàÌÄÔÌààäÈÔ(€€€€€€€t°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÜÔ°(€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÈˆ°(€€€€€€‰¹…µ”ˆè€‰UQ=A1Q8€´€ØMQ5A%9ˆ°(€€€€€€‰µ½‘•°ˆè€‰5,€äÈÀe5$€´%$ˆ°(€€€€€€‰…É•„ˆè€‰=MP=9YIQ%9ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰Á…ÉÑÌˆèl(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰Á¥±”™••‘•È°±¥™Ð…¹ÍÕÑ¥½¸Á¥­ÕÀˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰9=}!9}IEU%Iˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Øµµ¬äÈÁåµ¥¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰É•¥ÍÑÉ…Ñ¥½¸Ñ…‰±”…¹±…åÌˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰9=}!9}IEU%Iˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Øµµ¬äÈÁåµ¥¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰¥¹Ñ•Éµ¥ÑÑ•¹ÐÉ¥ÁÁ•ÈÑÉ…¹ÍÁ½ÉÐˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Øµµ¬äÈÁåµ¥¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰¡•…Ñ•Á±…Ñ•¸…¹¡…Í”½¹Ñ…Ðˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰9=}!9}IEU%Iˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Øµµ¬äÈÁåµ¥¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰™½¥°Õ¹Ý¥¹°…‘Ù…¹”…¹Ý…ÍÑ”É•Ý¥¹ˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Øµµ¬äÈÁåµ¥¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰É¥ÁÁ•ÈÉ•±•…Í”…¹‘•±¥Ù•ÉäÁ¥±”ˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰9=}!9}IEU%Iˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Øµµ¬äÈÁåµ¥¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰‘É¥Ù”°½¹ÑÉ½±Ì°Õ…É‘¥¹œ…¹…•ÍÌˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Øµµ¬äÈÁåµ¥¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰Í¥µÕ±…Ñ¥½¸°™…±±‰…¬°‘¥ÍÁ±…äµ½‘•Ì…¹Ñ…á½¹½µäˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Øµµ¬äÈÁåµ¥¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô(€€€€€t°(€€€€€€‰É•Á½ÉÑÌˆèl(€€€€€€€€‰‘½Ì½…Á´Øµµ¬äÈÁåµ¥¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€t°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€ˆÀÕ„Ñ”Í„ÈÌÌÙ™‰•ˆäÌÁ…”äÔá„å”ÙˆÅ„ÌÄÀå™ˆØØÜˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€ÌàÌÈÄÌàäàäà°(€€€€€€€€€€ÌàÌÈÄÌàäàÄÀ°(€€€€€€€€€€ÌàÌÈÄÌàäÜÜÄ(€€€€€€€t°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÜØ°(€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ°(€€€€€€€€‰Ù¥ÍÕ…±…±±‰…­Y•É¥™¥•ˆèÑÉÕ”(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÌˆ°(€€€€€€‰¹…µ”ˆè€‰UQ=A1Q8€´€ÜMQI%AA%9€˜	19-%9ˆ°(€€€€€€‰µ½‘•°ˆè€‰5,€ÄÀØÀHˆ°(€€€€€€‰…É•„ˆè€‰=MP=9YIQ%9ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰Á…ÉÑÌˆèl(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰¹½¸µÍÑ½ÀÁ¥±”™••‘•È…¹ÍÕÑ¥½¸Á¥­ÕÀˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Üµµ¬ÄÀØÁ•ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰™••Ñ…‰±”…¹É•¥ÍÑÉ…Ñ¥½¸ˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Üµµ¬ÄÀØÁ•ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰¥¹Ñ•Éµ¥ÑÑ•¹ÐÉ¥ÁÁ•Èµ¡…¥¸ÑÉ…¹ÍÁ½ÉÐˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Üµµ¬ÄÀØÁ•ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰™±…Ñ‰•Á±…Ñ•¸…¹¡…Í”½¹Ñ…Ðˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Üµµ¬ÄÀØÁ•ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰‘½Õ‰±”µ…Ñ¥½¸ÍÑÉ¥ÁÁ¥¹œˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Üµµ¬ÄÀØÁ•ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰‰±…¹­¥¹œ…¹ÁÉ½‘ÕÐÍ•Á…É…Ñ¥½¸ˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Üµµ¬ÄÀØÁ•ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰•‘”µÝ…ÍÑ”…¹ÁÉ½‘ÕÐ‘•±¥Ù•Éäˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Üµµ¬ÄÀØÁ•ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰‘É¥Ù”°±Õ‰É¥…Ñ¥½¸°½¹ÑÉ½±Ì°Õ…É‘Ì…¹…•ÍÌˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Üµµ¬ÄÀØÁ•ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰Í¥µÕ±…Ñ¥½¸°‘¥ÍÁ±…äµ½‘•Ì…¹Ñ…á½¹½µäˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Üµµ¬ÄÀØÁ•ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô(€€€€€t°(€€€€€€‰É•Á½ÉÑÌˆèl(€€€€€€€€‰‘½Ì½…Á´Üµµ¬ÄÀØÁ•ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€t°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€ˆÉ„ÉˆÜÜÜÀá…˜äÑ„ÌÐÙ˜ÐÜÑ˜àÔá”äÜÙŒàäÐàÍ”ØØÑ˜ˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€ÌàÌÈØÐÌàØÐÌ°(€€€€€€€€€€ÌàÌÈØÐÌàØÐÄ°(€€€€€€€€€€ÌàÌÈØÐÌàØØÈ(€€€€€€€t°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔàÀ°(€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ°(€€€€€€€€‰Ù¥ÍÕ…±…±±‰…­Y•É¥™¥•ˆèÑÉÕ”(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÐˆ°(€€€€€€‰¹…µ”ˆè€‰UQ=A1Q8€´€àMQI%AA%9€˜	19-%9ˆ°(€€€€€€‰µ½‘•°ˆè€‰AÉ½µ…ÑÉ¥à€ÄÀÙMˆ°(€€€€€€‰…É•„ˆè€‰=MP=9YIQ%9ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰Á…ÉÑÌˆèl(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰¹½¸µÍÑ½À™••‘•È…¹ÍÕÑ¥½¸Á¥­ÕÀˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´àµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰ÍÕÑ¥½¸µ‰•±ÐÑ…‰±”…¹É•¥ÍÑ•Èˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´àµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰Í•Ù•¸µ‰…ÈÉ•¥ÍÑ•É•É¥ÁÁ•ÈÑÉ…¹ÍÁ½ÉÐˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´àµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰ÕÑÑ¥¹œ…¹É•…Í¥¹œÍÑ…Ñ¥½¸ˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´àµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰Ñ¡É•”µÑ½½°ÍÑÉ¥ÁÁ¥¹œÍÑ…Ñ¥½¸ˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´àµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰‰±…¹­¥¹œ…¹Ñ¥”µÍ¡••ÐÁÉ½•ÍÌˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´àµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰¹½¸µÍÑ½À‘•±¥Ù•Éä…¹½ÕÑÁÕÐˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´àµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰‘É¥Ù”°Á¹•Õµ…Ñ¥Ì°½¹ÑÉ½±Ì°Õ…É‘Ì…¹…•ÍÌˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´àµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰Í¥µÕ±…Ñ¥½¸°‘¥ÍÁ±…äµ½‘•Ì…¹Ñ…á½¹½µäˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´àµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô(€€€€€t°(€€€€€€‰É•Á½ÉÑÌˆèl(€€€€€€€€‰‘½Ì½…Á´àµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€t°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€‰‰äÔÍŒÔÜÝ˜ÄàØÄÑ„äÐääÄÈØØÝ‘˜àÐÐÑ™”ÔÀØÈÉ…ˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€ÌàÌØÀÜÔÜØÔÔ°(€€€€€€€€€€ÌàÌØÀÜÔÜÜäÌ°(€€€€€€€€€€ÌàÌØÀÜÔÜàÜÐ(€€€€€€€t°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔàÐ°(€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ°(€€€€€€€€‰Ù¥ÍÕ…±…±±‰…­Y•É¥™¥•ˆèÑÉÕ”(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÔˆ°(€€€€€€‰¹…µ”ˆè€‰UQ=A1Q8€´€äMQI%AA%9€˜	19-%9ˆ°(€€€€€€‰µ½‘•°ˆè€‰AÉ½µ…ÑÉ¥à€ÄÀÙMˆ°(€€€€€€‰…É•„ˆè€‰=MP=9YIQ%9ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰Á…ÉÑÌˆèl(€€€€€€€ì‰Á…ÉÐˆè€‰¹½¸µÍÑ½À™••‘•È…¹ÍÕÑ¥½¸Á¥­ÕÀˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´äµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰ÍÕÑ¥½¸µ‰•±ÐÑ…‰±”…¹É•¥ÍÑ•Èˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´äµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰Í•Ù•¸µ‰…ÈÉ•¥ÍÑ•É•É¥ÁÁ•ÈÑÉ…¹ÍÁ½ÉÐˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´äµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰ÕÑÑ¥¹œ…¹É•…Í¥¹œÍÑ…Ñ¥½¸ˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´äµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰Ñ¡É•”µÑ½½°ÍÑÉ¥ÁÁ¥¹œÍÑ…Ñ¥½¸ˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´äµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰‰±…¹­¥¹œ…¹Ñ¥”µÍ¡••ÐÁÉ½•ÍÌˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´äµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰¹½¸µÍÑ½À‘•±¥Ù•Éä…¹½ÕÑÁÕÐˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´äµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰‘É¥Ù”°Á¹•Õµ…Ñ¥Ì°½¹ÑÉ½±Ì°Õ…É‘Ì…¹…•ÍÌˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´äµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰Í¥µÕ±…Ñ¥½¸°‘¥ÍÁ±…äµ½‘•Ì…¹Ñ…á½¹½µäˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´äµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô(€€€€€t°(€€€€€€‰É•Á½ÉÑÌˆèl(€€€€€€€€‰‘½Ì½…Á´äµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€t°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€ˆäääÑäÅ„Ý”Á•…„É„ÝÝ”ÙŒÐÜÕ„Í•‘”Å…”á„àå‰…˜ˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€ÌàÌØÜäØÄäÌÌ°(€€€€€€€€€€ÌàÌØÜäØÄäÐÌ°(€€€€€€€€€€ÌàÌØÜäØÄäÄÌ(€€€€€€€t°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔàÔ°(€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ°(€€€€€€€€‰Ù¥ÍÕ…±…±±‰…­Y•É¥™¥•ˆèÑÉÕ”(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄØˆ°(€€€€€€‰¹…µ”ˆè€‰=1H1UH€´€Ä5!%9ˆ°(€€€€€€‰µ½‘•°ˆè€‰5%€ÄÀÀ%$ˆ°(€€€€€€‰…É•„ˆè€‰=MP=9YIQ%9ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰Á…ÉÑÌˆèl(€€€€€€€ì‰Á…ÉÐˆè€‰‰±…¹¬™••‘•È…¹¥¹ÁÕÐˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´Äµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰…±¥¹µ•¹Ð…¹ÁÉ”µ‰É•…¬ˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´Äµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰™½Éµ¥¹œ…¹½¹Ù•ÉÍ¥½¸ˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´Äµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰±Õ”…ÁÁ±¥…Ñ¥½¸ˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´Äµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰™¥¹…°™½±…¹ÑÉ½µ‰½¹”ˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´Äµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰½µÁÉ•ÍÍ¥½¸ˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´Äµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰‘•±¥Ù•Éä…¹½ÕÑÁÕÐˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´Äµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰‘É¥Ù”°½¹ÑÉ½°°™É…µ”…¹…•ÍÌˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´Äµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰Í¥µÕ±…Ñ¥½¸°‘¥ÍÁ±…äµ½‘•Ì…¹Ñ…á½¹½µäˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´Äµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô(€€€€€t°(€€€€€€‰É•Á½ÉÑÌˆèl(€€€€€€€€‰‘½Ì½™´Äµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€t°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€‰ŒÔå™”ààÑˆå•Ù˜àÀÈÌÔÄÍ…Í„ÄÄàÍ”ÐÑ…„åŒÌÝŒˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€ÌàÌàäÀÀÜäÌÀ°(€€€€€€€€€€ÌàÌàäÀÀÜÜØÄ°(€€€€€€€€€€ÌàÌàäÀÀàÀØÌ(€€€€€€€t°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔàÜ°(€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ°(€€€€€€€€‰Ù¥ÍÕ…±…±±‰…­Y•É¥™¥•ˆèÑÉÕ”(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÜˆ°(€€€€€€‰¹…µ”ˆè€‰=1H1UH€´€È5!%9ˆ°(€€€€€€‰µ½‘•°ˆè¹Õ±°°(€€€€€€‰…É•„ˆè€‰=MP=9YIQ%9ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰Á…ÉÑÌˆèl(€€€€€€€ì‰Á…ÉÐˆè€‰‰±…¹¬™••‘•È…¹Í•Á…É…Ñ¥½¸ˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰…±¥¹µ•¹Ð…¹ÁÉ•‰É•…¬ˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰ÁÉ¥µ…Éä™½±‘¥¹œˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰…‘¡•Í¥Ù”…ÁÁ±¥…Ñ¥½¸‰½Õ¹‘…Éäˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰™¥¹…°™½±‘¥¹œ…¹ÍÅÕ…É¥¹œˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰½µÁÉ•ÍÍ¥½¸ˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰‘•±¥Ù•Éä…¹½ÕÑÁÕÐˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰‘É¥Ù”°½¹ÑÉ½°°™É…µ”…¹…•ÍÌˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰Í¥µÕ±…Ñ¥½¸°‘¥ÍÁ±…äµ½‘•Ì…¹Ñ…á½¹½µäˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô(€€€€€t°(€€€€€€‰É•Á½ÉÑÌˆèl(€€€€€€€€‰‘½Ì½™´ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€t(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄàˆ°(€€€€€€‰¹…µ”ˆè€‰=1H1UH€´€Ì5!%9ˆ°(€€€€€€‰µ½‘•°ˆè€‰5%€ÄÀÀ%$ˆ°(€€€€€€‰…É•„ˆè€‰=MP=9YIQ%9ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰Á…ÉÑÌˆèl(€€€€€€€ì‰Á…ÉÐˆè€‰‰±…¹¬™••‘•È…¹Í•Á…É…Ñ¥½¸ˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´Ìµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰…±¥¹µ•¹Ð…¹ÁÉ•‰É•…¬ˆ°€‰ÍÑ…ÑÕÌˆè€‰9=}!9}IEU%Iˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´Ìµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰™½Éµ¥¹œ…¹½¹Ù•ÉÍ¥½¸‰½Õ¹‘…Éäˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´Ìµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰…‘¡•Í¥Ù”…ÁÁ±¥…Ñ¥½¸‰½Õ¹‘…Éäˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´Ìµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰™¥¹…°™½±‘¥¹œ…¹ÑÉ½µ‰½¹”ˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´Ìµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰½µÁÉ•ÍÍ¥½¸ˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´Ìµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰‘•±¥Ù•Éä…¹½ÕÑÁÕÐˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´Ìµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰‘É¥Ù”½¹ÑÉ½°™É…µ”…¹…•ÍÌˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´Ìµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰¥‘•¹Ñ¥Ñä•Ù¥‘•¹”‘¥ÍÁ±…äÍ¥µÕ±…Ñ¥½¸…¹Ñ…á½¹½µäˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½™´Ìµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô(€€€€€t°(€€€€€€‰É•Á½ÉÑÌˆèl‰‘½Ì½™´Ìµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰t(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄäˆ°(€€€€€€‰¹…µ”ˆè€‰=1%9%9MAQ%=8€Ì€´5,ˆ°(€€€€€€‰µ½‘•°ˆè€‰%9e€ÔÔˆ°(€€€€€€‰…É•„ˆè€‰=MP=9YIQ%9ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰Á…ÉÑÌˆèl(€€€€€€€ì‰Á…ÉÐˆè€‰‰±…¹¬™••‘•È…¹…±¥¹µ•¹Ðˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½‘¥…¹„µ•å”ÔÔµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰ÍÕÑ¥½¸µ‰•±ÐÑÉ…¹ÍÁ½ÉÐˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½‘¥…¹„µ•å”ÔÔµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰¥¹ÍÁ•Ñ¥½¸•±°…µ•É„…¹1ˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½‘¥…¹„µ•å”ÔÔµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰¥µ…”ÁÉ½•ÍÍ¥¹œ…¹É•¥Á”±½¥Œˆ°€‰ÍÑ…ÑÕÌˆè€‰9=}!9}IEU%Iˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½‘¥…¹„µ•å”ÔÔµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰É•©•Ð‘•¥Í¥½¸•©•Ñ¥½¸…¹É•½Ù•Éäˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½‘¥…¹„µ•å”ÔÔµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰…•ÁÑ•™¥Í µÍ…±”‘•±¥Ù•Éäˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½‘¥…¹„µ•å”ÔÔµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰™É…µ”Õ…É‘¥¹œ…•ÍÌ…¹!5$ˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½‘¥…¹„µ•å”ÔÔµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰¥‘•¹Ñ¥Ñä•Ù¥‘•¹”‘¥ÍÁ±…äÍ¥µÕ±…Ñ¥½¸…¹Ñ…á½¹½µäˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½‘¥…¹„µ•å”ÔÔµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô(€€€€€t°(€€€€€€‰É•Á½ÉÑÌˆèl‰‘½Ì½‘¥…¹„µ•å”ÔÔµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰t(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÈÀˆ°(€€€€€€‰¹…µ”ˆè€‰=1%9%9MAQ%=8€Ð€´=UM%!Pˆ°(€€€€€€‰µ½‘•°ˆè€‰LµM!I,µ8ØÔÀµ@Í8Äˆ°(€€€€€€‰…É•„ˆè€‰=MP=9YIQ%9ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰Á…ÉÑÌˆèl(€€€€€€€ì‰Á…ÉÐˆè€‰Á¥±”¥¹ÁÕÐ…¹ÍÕÑ¥½¸Á¥­ÕÀˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½Í¡…É¬µ¸ØÔÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰¹•…Ñ¥Ù”µÁ¥Ñ ™Õ±°µÍÕÑ¥½¸ÑÉ…¹Í™•Èˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½Í¡…É¬µ¸ØÔÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰¥¹ÍÁ•Ñ¥½¸Ñ½Ý•È…µ•É„…¹½¹ÑÉ½±±•±¥¡Ñ¥¹œˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½Í¡…É¬µ¸ØÔÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰Ù¥Í¥½¸ÁÉ½•ÍÍ¥¹œ…¹É•¥Á”±½¥Œˆ°€‰ÍÑ…ÑÕÌˆè€‰9=}!9}IEU%Iˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½Í¡…É¬µ¸ØÔÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰É•©•Ð‘•¥Í¥½¸Í•Á…É…Ñ¥½¸…¹ÑÉ…­¥¹œˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½Í¡…É¬µ¸ØÔÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰½½…¹‰…É•ÑÕÉ¸½±±•Ñ¥½¸ˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½Í¡…É¬µ¸ØÔÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰™É…µ”Õ…É‘¥¹œ…•ÍÌ…¹!5$ˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½Í¡…É¬µ¸ØÔÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰¥‘•¹Ñ¥Ñä•Ù¥‘•¹”‘¥ÍÁ±…äÍ¥µÕ±…Ñ¥½¸…¹Ñ…á½¹½µäˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°€‰É•Á½ÉÐˆè€‰‘½Ì½Í¡…É¬µ¸ØÔÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰ô(€€€€€t°(€€€€€€‰É•Á½ÉÑÌˆèl‰‘½Ì½Í¡…É¬µ¸ØÔÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰t(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÈÄˆ°(€€€€€€‰¹…µ”ˆè€‰UQ=	19-%95!%9€Èˆ°(€€€€€€‰µ½‘•°ˆè€‰E´ÄÀÁLˆ°(€€€€€€‰…É•„ˆè€‰=MP=9YIQ%9ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰…Õ‘¥ÑMÑ…ÑÕÌˆè€‰=5A1Q}]%Q!}	1=-}Y%9ˆ°(€€€€€€‰Á•¹‘¥¹Õ‘¥Ñ½µÁ±•Ñ¥½¸ˆè™…±Í”°(€€€€€€‰Ù•É¥™¥•‘AÉ•Ù¥½ÕÍI•±•…Í”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€‰ŒÕ•ÀÔàÌÜÉ”ÐÈÔäÕ•ŒÈÜÔÀÑ˜Ý‘”ÙˆÑŒÕŒàÄääÌÜˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèlÌàÐääÔÐÌÜÜÀ°€ÌàÐääÔÐÌÜÔÐ°€ÌàÐääÔÐÌÜÌåt°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ù¥ÍÕ…±…±±‰…­Y•É¥™¥•ˆèÑÉÕ”°(€€€€€€€€‰Ù¥ÍÕ…°ÍY•É¥™¥•ˆè™…±Í”(€€€€€ô°(€€€€€€‰Á…ÉÑÌˆèl(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰ÍÑ…¬ÍÑ…¥¹œ…¹±½…‘¥¹œˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½Å˜ÄÀÁÌµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰`½dÁ±…Ñ™½É´¥¹‘•á¥¹œ…¹µ…Ñ•É¥…°ÍÕÁÁ½ÉÐˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½Å˜ÄÀÁÌµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰™¥á•¡å‘É…Õ±¥Œ¡•……¹½¹Ñ…ÐÍÑÉ½­”ˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½Å˜ÄÀÁÌµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰¡½¹•å½µˆ‰½…ÉÁ¥¹Ì…¹Ñ½½±¥¹œÉ•Ñ•¹Ñ¥½¸ˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½Å˜ÄÀÁÌµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰Í•Á…É…Ñ¥½¸…¹Ý…ÍÑ”ÍÕÁÁ½ÉÐˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½Å˜ÄÀÁÌµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰ÁÉ½‘ÕÐÉ••¥Ù¥¹œ…¹½±±•Ñ½È‰½Õ¹‘…Éäˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½Å˜ÄÀÁÌµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰¡å‘É…Õ±¥Œ½¹ÑÉ½°Õ…É‘¥¹œ…¹ÕÑ¥±¥Ñäˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½Å˜ÄÀÁÌµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô°(€€€€€€€ì(€€€€€€€€€€‰Á…ÉÐˆè€‰‘¥ÍÁ±…äÑ…á½¹½µä…¹™…Ñ½ÉäÁ…É¥Ñäˆ°(€€€€€€€€€€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9ˆ°(€€€€€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½Å˜ÄÀÁÌµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€€€ô(€€€€€t°(€€€€€€‰É•Á½ÉÑÌˆèl(€€€€€€€€‰‘½Ì½Å˜ÄÀÁÌµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ(€€€€€t(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÈÈˆ°(€€€€€€‰¹…µ”ˆè€‰A%1QUI9H€Èˆ°(€€€€€€‰µ½‘•°ˆè€‰h€ÄÈÀÀˆ°(€€€€€€‰…É•„ˆè€‰=MP=9YIQ%9ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€ˆÝ˜äÀÙˆäØÔÜØØå”ØàåÁ‘‰‰„ÝŒÅŒÅ„ÜÁˆÅ‰™˜äÜÉ”ˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèlÌàÔÀÔÄÀäÈàÌ°ÌàÔÀÔÄÀäÌÌÈ°ÌàÔÀÔÄÀäÈàÉt°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄØÀÀ°(€€€€€€€€‰Ù¥ÍÕ…±…±±‰…­Y•É¥™¥•ˆèÑÉÕ”°(€€€€€€€€‰Ù¥ÍÕ…°ÍY•É¥™¥•ˆè™…±Í”(€€€€€ô°(€€€€€€‰Á…ÉÑÌˆèl(€€€€€€€ì‰Á…ÉÐˆè€‰±½…‘¥¹œ…¹±½Ý•ÈÍÕÁÁ½ÉÐˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Q‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰±…µÀÁÉ•ÍÍÕÉ”½¹Ñ…Ðˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Q‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰±¥™ÐÑÕÉ¹¥¹œ±•…É…¹”ˆ°€‰ÍÑ…ÑÕÌˆè€‰9=}!9}IEU%I‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰ÑÕÉ¸…¹Á½Í¥Ñ¥½¸±½¬ˆ°€‰ÍÑ…ÑÕÌˆè€‰9=}!9}IEU%I‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰…¥ÈÍ•Á…É…Ñ¥½¸‘ÕÍÐÉ•µ½Ù…°ˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰©½œ…±¥¹µ•¹ÐÍ•ÑÑ±¥¹œˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Q‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰±½Ý•ÈÉ•±•…Í”…¹Õ¹±½…ˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Q‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰¡å‘É…Õ±¥Œ…¥ÈÕÑ¥±¥Ñä…¹Õ…É½¹ÑÉ½°ˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰‘¥ÍÁ±…äÑ…á½¹½µä…¹Í¥µÕ±…Ñ¥½¸ÍÑ…•Ìˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Q‰ô(€€€€€t°(€€€€€€‰É•Á½ÉÑÌˆèl‰‘½Ì½Á¥±”µÑÕÉ¹•ÈÀÈµ™èÄÈÀÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰t(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÈÌˆ°(€€€€€€‰¹…µ”ˆè€‰=11Q=H5!%9ˆ°(€€€€€€‰µ½‘•°ˆè¹Õ±°°(€€€€€€‰…É•„ˆè€‰=MP=9YIQ%9ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰I1M}A9%9ˆ°(€€€€€€‰Á…ÉÑÌˆèl(€€€€€€€ì‰Á…ÉÐˆè€‰™••µ‰¥¸Ñ½Ý•È…¹Í¡••ÐÍÑ…­Ìˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Q‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰Á•Èµ‰¥¸…¥ÈÍ•Á…É…Ñ¥½¸…¹ÍÕÑ¥½¸É½Ñ½Èˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰™••¥¹Ñ•É¥Ñä…¹‰¥¸Í•¹Í¥¹œˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰Ù•ÉÑ¥…°…Ñ¡•É¥¹œÑÉ…¹ÍÁ½ÉÐˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Q‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰Í•Ð‘•±¥Ù•Éä½¹Ù•å½È…¹©½œˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Q‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰‘½Ý¹ÍÑÉ•…´™¥¹¥Í¡•È¡…¹‘½™˜ˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰!5$‰¥¸$µ<Õ…É…¹¥¹ÍÑ…±±•¥¹Ñ•É±½­Ìˆ°€‰ÍÑ…ÑÕÌˆè€‰	1=-}Y%9‰ô°(€€€€€€€ì‰Á…ÉÐˆè€‰‘¥ÍÁ±…äÑ…á½¹½µä±¥™•å±”¥¹Ñ•É¥½È…¹1=ˆ°€‰ÍÑ…ÑÕÌˆè€‰=5A1Q‰ô(€€€€€t°(€€€€€€‰É•Á½ÉÑÌˆèl‰‘½Ì½½±±…Ñ½ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µ‰t(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÈÐˆ°(€€€€€€‰¹…µ”ˆè€‰%%Q0%9-)Pˆ°(€€€€€€‰µ½‘•°ˆè€‰UAµ1dÌÀÀˆ°(€€€€€€‰…É•„ˆè€‰=MP=9YIQ%9ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰A9%9ˆ°(€€€€€€‰Á…ÉÑÌˆèmt°(€€€€€€‰É•Á½ÉÑÌˆèmt(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÈÔˆ°(€€€€€€‰¹…µ”ˆè€‰Q@!%1	I5!%9ˆ°(€€€€€€‰µ½‘•°ˆè¹Õ±°°(€€€€€€‰…É•„ˆè€‰ALˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰A9%9ˆ°(€€€€€€‰Á…ÉÑÌˆèmt°(€€€€€€‰É•Á½ÉÑÌˆèmt(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÈØˆ°(€€€€€€‰¹…µ”ˆè€‰Q@!%1	I5!%9ˆ°(€€€€€€‰µ½‘•°ˆè¹Õ±°°(€€€€€€‰…É•„ˆè€‰ALˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰A9%9ˆ°(€€€€€€‰Á…ÉÑÌˆèmt°(€€€€€€‰É•Á½ÉÑÌˆèmt(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÈÜˆ°(€€€€€€‰¹…µ”ˆè€‰Q%5MQQHMI85!%9ˆ°(€€€€€€‰µ½‘•°ˆè¹Õ±°°(€€€€€€‰…É•„ˆè€‰ALˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰A9%9ˆ°(€€€€€€‰Á…ÉÑÌˆèmt°(€€€€€€‰É•Á½ÉÑÌˆèmt(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÈàˆ°(€€€€€€‰¹…µ”ˆè€‰iU95!%9ˆ°(€€€€€€‰µ½‘•°ˆè¹Õ±°°(€€€€€€‰…É•„ˆè€‰ALˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰A9%9ˆ°(€€€€€€‰Á…ÉÑÌˆèmt°(€€€€€€‰É•Á½ÉÑÌˆèmt(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÈäˆ°(€€€€€€‰¹…µ”ˆè€‰=5AIMM=HQ1L=A<9<¸Èˆ°(€€€€€€‰µ½‘•°ˆè¹Õ±°°(€€€€€€‰…É•„ˆè€‰UQ%1%Qdˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰A9%9ˆ°(€€€€€€‰Á…ÉÑÌˆèmt°(€€€€€€‰É•Á½ÉÑÌˆèmt(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÌÀˆ°(€€€€€€‰¹…µ”ˆè€‰=5AIMM=HQ1L=A<9<¸Ìˆ°(€€€€€€‰µ½‘•°ˆè¹Õ±°°(€€€€€€‰…É•„ˆè€‰UQ%1%Qdˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰A9%9ˆ°(€€€€€€‰Á…ÉÑÌˆèmt°(€€€€€€‰É•Á½ÉÑÌˆèmt(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÌÄˆ°(€€€€€€‰¹…µ”ˆè€‰=5AIMM=H-MH9<¸Ðˆ°(€€€€€€‰µ½‘•°ˆè¹Õ±°°(€€€€€€‰…É•„ˆè€‰UQ%1%Qdˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰A9%9ˆ°(€€€€€€‰Á…ÉÑÌˆèmt°(€€€€€€‰É•Á½ÉÑÌˆèmt(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÌÈˆ°(€€€€€€‰¹…µ”ˆè€‰=5AIMM=H-MH9<¸Øˆ°(€€€€€€‰µ½‘•°ˆè¹Õ±°°(€€€€€€‰…É•„ˆè€‰UQ%1%Qdˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰A9%9ˆ°(€€€€€€‰Á…ÉÑÌˆèmt°(€€€€€€‰É•Á½ÉÑÌˆèmt(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÌÌˆ°(€€€€€€‰¹…µ”ˆè€‰=5AIMM=HM]89<¸Üˆ°(€€€€€€‰µ½‘•°ˆè¹Õ±°°(€€€€€€‰…É•„ˆè€‰UQ%1%Qdˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰A9%9ˆ°(€€€€€€‰Á…ÉÑÌˆèmt°(€€€€€€‰É•Á½ÉÑÌˆèmt(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÌÐˆ°(€€€€€€‰¹…µ”ˆè€‰=5AIMM=H-MH9<¸àˆ°(€€€€€€‰µ½‘•°ˆè¹Õ±°°(€€€€€€‰…É•„ˆè€‰UQ%1%Qdˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰A9%9ˆ°(€€€€€€‰Á…ÉÑÌˆèmt°(€€€€€€‰É•Á½ÉÑÌˆèmt(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÌÔˆ°(€€€€€€‰¹…µ”ˆè€‰=5AIMM=HQ1L=A<9<¸äˆ°(€€€€€€‰µ½‘•°ˆè¹Õ±°°(€€€€€€‰…É•„ˆè€‰UQ%1%Qdˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰A9%9ˆ°(€€€€€€‰Á…ÉÑÌˆèmt°(€€€€€€‰É•Á½ÉÑÌˆèmt(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÌØˆ°(€€€€€€‰¹…µ”ˆè€‰!T€Ìˆ°(€€€€€€‰µ½‘•°ˆè¹Õ±°°(€€€€€€‰…É•„ˆè€‰UQ%1%Qdˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰A9%9ˆ°(€€€€€€‰Á…ÉÑÌˆèmt°(€€€€€€‰É•Á½ÉÑÌˆèmt(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÌÜˆ°(€€€€€€‰¹…µ”ˆè€‰!T€Ðˆ°(€€€€€€‰µ½‘•°ˆè¹Õ±°°(€€€€€€‰…É•„ˆè€‰UQ%1%Qdˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰A9%9ˆ°(€€€€€€‰Á…ÉÑÌˆèmt°(€€€€€€‰É•Á½ÉÑÌˆèmt(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÌàˆ°(€€€€€€‰¹…µ”ˆè€‰!T€Ôˆ°(€€€€€€‰µ½‘•°ˆè¹Õ±°°(€€€€€€‰…É•„ˆè€‰UQ%1%Qdˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰A9%9ˆ°(€€€€€€‰Á…ÉÑÌˆèmt°(€€€€€€‰É•Á½ÉÑÌˆèmt(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÌäˆ°(€€€€€€‰¹…µ”ˆè€‰!T€Øˆ°(€€€€€€‰µ½‘•°ˆè¹Õ±°°(€€€€€€‰…É•„ˆè€‰UQ%1%Qdˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰A9%9ˆ°(€€€€€€‰Á…ÉÑÌˆèmt°(€€€€€€‰É•Á½ÉÑÌˆèmt(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÐÀˆ°(€€€€€€‰¹…µ”ˆè€‰!T€Ü€¡M9M%8¤ˆ°(€€€€€€‰µ½‘•°ˆè¹Õ±°°(€€€€€€‰…É•„ˆè€‰UQ%1%Qdˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰A9%9ˆ°(€€€€€€‰Á…ÉÑÌˆèmt°(€€€€€€‰É•Á½ÉÑÌˆèmt(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÐÄˆ°(€€€€€€‰¹…µ”ˆè€‰!T€àˆ°(€€€€€€‰µ½‘•°ˆè¹Õ±°°(€€€€€€‰…É•„ˆè€‰UQ%1%Qdˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰A9%9ˆ°(€€€€€€‰Á…ÉÑÌˆèmt°(€€€€€€‰É•Á½ÉÑÌˆèmt(€€€ô(€t°(€€‰¡¥ÍÑ½Éäˆèl(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÀÌˆ°(€€€€€€‰Á…ÉÐˆè€‰‘•±¥Ù•Éäˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½½™™Í•ÐÔµ‘•±¥Ù•Éäµ½¹Ñ…Ð¹µˆ(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÀÄˆ°(€€€€€€‰Á…ÉÐˆè€‰¥¹ÁÕÐÑ…‰±•Ì…¹…¥ÈµÁ½ÉÐÉ¥ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½Á½±…ÈÄÄÔµ¥¹ÁÕÐµÑ…‰±”µ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑA…ÉÑ%¹‘•àˆè€Ä°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€‰‘˜ÕÁ”ÌÝ”ØÜÔÉ”ÈÉ‘”ÀÝ˜ÐØäÌá”É…„ÀØÐÜÌÄÄÈˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€ˆÉ„àÀÍ‰ˆÌÝ˜ÀÜÅ…‘•ŒÜÁŒÌÈÄÝäÈÄÍ”Ý•”ÀÀÉ…™™„ˆ°(€€€€€€€€‰Ý½É­™±½Üˆè€ÌàÄÜÀÜÄÐäÄÀ°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÐÌ(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÀÄˆ°(€€€€€€‰Á…ÉÐˆè€‰ÍÑ½¬ÑÉ…¹ÍÁ½ÉÐ…¹‰…­…Õ”É•¥ÍÑÉ…Ñ¥½¸ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½Á½±…ÈÄÄÔµÑÉ…¹ÍÁ½ÉÐµÉ•¥ÍÑÉ…Ñ¥½¸µ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑA…ÉÑ%¹‘•àˆè€È°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€ˆÉ„àÀÍ‰ˆÌÝ˜ÀÜÅ…‘•ŒÜÁŒÌÈÄÝäÈÄÍ”Ý•”ÀÀÉ…™™„ˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€‰ŒÌÁäÐÙŒÙ‰‰”ÐäÜÄÔÐÈàÜÀÕ•ŒÜÜÈÐå™„Ù”Õ„ÔÈÔˆ°(€€€€€€€€‰Ý½É­™±½Üˆè€ÌàÄÜÐäÜÐÈàÀ°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÐÔ(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÀÄˆ°(€€€€€€‰Á…ÉÐˆè€‰Í…™•Ñä…ÉµÌ…¹ÕÐ¥¹Ñ•É±½­Ìˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½Á½±…ÈÄÄÔµÍ…™•Ñäµ¥¹Ñ•É±½¬µ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑA…ÉÑ%¹‘•àˆè€Ì°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€‰ŒÌÁäÐÙŒÙ‰‰”ÐäÜÄÔÐÈàÜÀÕ•ŒÜÜÈÐå™„Ù”Õ„ÔÈÔˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€‰ˆàäåˆÜÍ‰™™”ÑˆÌÅ˜ÐÄÜÈÍ™ŒÌÀàÉ™™ŒÄÈÌÑ‰™ŒÄÈˆ°(€€€€€€€€‰Ý½É­™±½Üˆè€ÌàÄÜäÀØÌàÐÈ°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÐà(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÀÄˆ°(€€€€€€‰Á…ÉÐˆè€‰±…µÀ…¹ÁÉ•ÍÍÕÉ”½¹Ñ…Ðˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½Á½±…ÈÄÄÔµ±…µÀµ½¹Ñ…Ðµ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑA…ÉÑ%¹‘•àˆè€Ð°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€‰ˆàäåˆÜÍ‰™™”ÑˆÌÅ˜ÐÄÜÈÍ™ŒÌÀàÉ™™ŒÄÈÌÑ‰™ŒÄÈˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€ˆäÝ•ÔäÄÔåÐÝ”ÙÐÉÈàÈÉ„ÌÐÌÝ™ˆÜØÄÄØÜØàÈˆ°(€€€€€€€€‰Ý½É­™±½Üˆè€ÌàÄàÈäàÌÄÐÀ°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÔÀ(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÀÄˆ°(€€€€€€‰Á…ÉÐˆè€‰­¹¥™”…¹ÕÑÑ¥¹œÍÑ¥¬ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½Á½±…ÈÄÄÔµ­¹¥™”µÍÑ¥¬µ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑA…ÉÑ%¹‘•àˆè€Ô°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€ˆäÝ•ÔäÄÔåÐÝ”ÙÐÉÈàÈÉ„ÌÐÌÝ™ˆÜØÄÄØÜØàÈˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€‰Èå™˜ÜÀäÀÜäÌÐàå„åŒå…ˆäÐÁ”äÍ„ÌÌÔÕ…ŒÄÉ˜Ôˆ°(€€€€€€€€‰Ý½É­™±½Üˆè€ÌàÄàÜÈÜÔÌàÈ°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÔÈ(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÀÄˆ°(€€€€€€‰Á…ÉÐˆè€‰ÍÑ½¬É•µ½Ù…°…¹½ÕÑÁÕÐˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½Á½±…ÈÄÄÔµ½ÕÑÁÕÐµ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑA…ÉÑ%¹‘•àˆè€Ø°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€‰Èå™˜ÜÀäÀÜäÌÐàå„åŒå…ˆäÐÁ”äÍ„ÌÌÔÕ…ŒÄÉ˜Ôˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€ˆÙ™”å˜ÙŒÄÔØàá„Í„ÐÄÜÕŒÝ‰ŒÀá‰˜ØÀÈäÔØÙŒÐÜÀÄØˆ°(€€€€€€€€‰Ý½É­™±½Üˆè€ÌàÄäÄÌÌÌØÈÔ°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÔÔ(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÀÄˆ°(€€€€€€‰Á…ÉÐˆè€‰¡½ÕÍ¥¹œ…¹½¹ÑÉ½°ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½Á½±…ÈÄÄÔµ¡½ÕÍ¥¹œµ½¹ÑÉ½°µ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑA…ÉÑ%¹‘•àˆè€Ü°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€ˆÙ™”å˜ÙŒÄÔØàá„Í„ÐÄÜÕŒÝ‰ŒÀá‰˜ØÀÈäÔØÙŒÐÜÀÄØˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€ˆÍŒÉˆÉÄÜá‘™„ààäÈÀÝÐÐäÅŒÔØÔØÜäÈØÅ‘”ØÁÈˆ°(€€€€€€€€‰Ý½É­™±½Üˆè€ÌàÄäÐàÀÈÌää°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÔÜ(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÀÄˆ°(€€€€€€‰Á…ÉÐˆè€‰¡å‘É…Õ±¥Œ…¹…¥ÈÕÑ¥±¥Ñäˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½Á½±…ÈÄÄÔµÕÑ¥±¥Ñäµ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑA…ÉÑ%¹‘•àˆè€à°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€ˆÙ™”å˜ÙŒÄÔØàá„Í„ÐÄÜÕŒÝ‰ŒÀá‰˜ØÀÈäÔØÙŒÐÜÀÄØˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€ˆÍŒÉˆÉÄÜá‘™„ààäÈÀÝÐÐäÅŒÔØÔØÜäÈØÅ‘”ØÁÈˆ°(€€€€€€€€‰Ý½É­™±½Üˆè€ÌàÄäÐàÀÈÌää°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÔÜ(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÀÈˆ°(€€€€€€‰Á…ÉÐˆè€‰Ý¡½±”µ…¡¥¹”èÕ¹Ý¥¹Ñ¡É½Õ ÍÑ…¬½ÕÑÁÕÐˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½Í¡••Ñ¥¹œµ±•áÕÌµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑ5…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÀÐˆ°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€ˆÍŒÉˆÉÄÜá‘™„ààäÈÀÝÐÐäÅŒÔØÔØÜäÈØÅ‘”ØÁÈˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€ˆÅ…ˆÝ„àÜå•‰ÀÀÍ™˜å„äÜÉÉ‘„åˆàåˆàÑˆÑ„Í„Ìˆ°(€€€€€€€€‰Ý½É­™±½Üˆè€ÌàÄäàäÐÈäÔÀ°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÔä(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÀÐˆ°(€€€€€€‰Á…ÉÐˆè€‰Ý¡½±”µ…¡¥¹”èÍ¡••Ð™••‘•ÈÑ¡É½Õ ¡¥ µÁ¥±”‘•±¥Ù•Éäˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½½™™Í•ÐÜµå„Å„Å„µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑ5…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÀÔˆ°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€ˆÔÙÍ•”ÜÝˆÀÕ™•ŒÉ‰ˆØÐÑ•‘ˆàÔÈÀàå‰˜äÌÈÍ„Å˜åˆˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€ˆÐàá˜Õ˜ÜÅÍŒÈÐÜÅ‰ŒÔÑàÙ„å„áŒá˜ÜÀÜØÍÜÐÙ˜äˆ°(€€€€€€€€‰Ý½É­™±½Üˆè€ÌàÈÀÜÄÔàØÀà°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔØÄ(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÀˆ°(€€€€€€‰Á…ÉÐˆè€‰Ý¡½±”µ…¡¥¹”èÁ¥±”™••‘•ÈÑ¡É½Õ ‘•±¥Ù•Éä½ÕÑÁÕÐˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´ÈµÍÀÄÀÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑ5…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÄˆ°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€ˆÄÌÈá”Õ…„ÀÌÀÈá”ÄÁ™„äáˆÔÝ•‘”ØÅ‰ŒÁˆÄÔá•Œààˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€ˆØàá…ŒÈÔØÐå‘ˆÍŒäÕˆÑå•ˆàÑ˜å”ÔÉˆÑ™‰”äÕˆÙ˜Àˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€ÌàÈàäÐÜÌàÌÈ°(€€€€€€€€€€ÌàÈàäÐÜÌäÜä°(€€€€€€€€€€ÌàÈàäÐÜÌàÔÄ(€€€€€€€t°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÜÈ°(€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÄˆ°(€€€€€€‰Á…ÉÐˆè€‰Ý¡½±”µ…¡¥¹”èÁ¥±”™••‘•ÈÑ¡É½Õ ¡½Ðµ™½¥°ÍÑ…µÁ¥¹œ…¹‘•±¥Ù•Éäˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Ôµµ¬äÈÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑ5…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÈˆ°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€‰˜ÌÜÅ”å™á™”å…ŒÝ˜ÌÜÐÐÈÀÁÄÝ„ÈÈÈØÉ‰‰„ÈÁŒÔäˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€‰‰ˆÌå”ÈÄÔÜÑ‰™ÄÙ”ÜÐÙ…ˆäÙ™ˆÌÐÈÁ™‘ŒØÄÐÈÅ•ˆÄˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€ÌàÌÄÔÌàààäØ°(€€€€€€€€€€ÌàÌÄÔÌàààäà°(€€€€€€€€€€ÌàÌÄÔÌààäÈÔ(€€€€€€€t°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÜÔ°(€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÈˆ°(€€€€€€‰Á…ÉÐˆè€‰Ý¡½±”µ…¡¥¹”èÁ¥±”™••‘•ÈÑ¡É½Õ ¡½Ðµ™½¥°ÍÑ…µÁ¥¹œ…¹‘•±¥Ù•Éäˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Øµµ¬äÈÁåµ¥¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑ5…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÌˆ°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€ˆÄå˜ÈÍ•‘ÜäÜÅ„ÄÜÀàÁŒÑ‘ˆÐÈÁ‘ˆäá˜ÍÅÔÜÙŒáŒˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€ˆÀÕ„Ñ”Í„ÈÌÌÙ™‰•ˆäÌÁ…”äÔá„å”ÙˆÅ„ÌÄÀå™ˆØØÜˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€ÌàÌÈÄÌàäàäà°(€€€€€€€€€€ÌàÌÈÄÌàäàÄÀ°(€€€€€€€€€€ÌàÌÈÄÌàäÜÜÄ(€€€€€€€t°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔÜØ°(€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ°(€€€€€€€€‰Ù¥ÍÕ…±…±±‰…­Y•É¥™¥•ˆèÑÉÕ”(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÌˆ°(€€€€€€‰Á…ÉÐˆè€‰Ý¡½±”µ…¡¥¹”èÁ¥±”™••‘•ÈÑ¡É½Õ ÍÑÉ¥ÁÁ¥¹œ°‰±…¹­¥¹œ…¹Í•Á…É…Ñ•‘•±¥Ù•Éäˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´Üµµ¬ÄÀØÁ•ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑ5…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÐˆ°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€‰•ŒÌÈØÅÔÈå‰‘àÕ˜ÜÐÈÌÝ…˜ÌÅ™‘”åääÁ™•ØÀå˜ˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€ˆÉ„ÉˆÜÜÜÀá…˜äÑ„ÌÐÙ˜ÐÜÑ˜àÔá”äÜÙŒàäÐàÍ”ØØÑ˜ˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€ÌàÌÈØÐÌàØÐÌ°(€€€€€€€€€€ÌàÌÈØÐÌàØÐÄ°(€€€€€€€€€€ÌàÌÈØÐÌàØØÈ(€€€€€€€t°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔàÀ°(€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ°(€€€€€€€€‰Ù¥ÍÕ…±…±±‰…­Y•É¥™¥•ˆèÑÉÕ”(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÐˆ°(€€€€€€‰Á…ÉÐˆè€‰Ý¡½±”µ…¡¥¹”è¹½¸µÍÑ½À™••‘•ÈÑ¡É½Õ ÕÑÑ¥¹œ°ÍÑÉ¥ÁÁ¥¹œ°‰±…¹­¥¹œ…¹‘•±¥Ù•Éäˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´àµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑ5…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÔˆ°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€‰…‘”Õ”Õ”ÌÜÄÅ…”äÌÍ„ÈÐÐÐààÌÔÙ„Ù‘”ÑŒÝˆÔÔÐäØˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€‰‰äÔÍŒÔÜÝ˜ÄàØÄÑ„äÐääÄÈØØÝ‘˜àÐÐÑ™”ÔÀØÈÉ…ˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€ÌàÌØÀÜÔÜØÔÔ°(€€€€€€€€€€ÌàÌØÀÜÔÜÜäÌ°(€€€€€€€€€€ÌàÌØÀÜÔÜàÜÐ(€€€€€€€t°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔàÐ°(€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ°(€€€€€€€€‰Ù¥ÍÕ…±…±±‰…­Y•É¥™¥•ˆèÑÉÕ”(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÔˆ°(€€€€€€‰Á…ÉÐˆè€‰Ý¡½±”µ…¡¥¹”è¹½¸µÍÑ½À™••‘•ÈÑ¡É½Õ ÕÑÑ¥¹œ°ÍÑÉ¥ÁÁ¥¹œ°‰±…¹­¥¹œ…¹‘•±¥Ù•Éäˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½…Á´äµÁÉ½µ…ÑÉ¥àÄÀÙÍˆµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑ5…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄØˆ°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€ˆÀÔÔÀÅ”å‘…ŒàØàÔÄàÙ™ŒÈÐÐÁˆÐÑ˜á•™ˆÜØÉ•ÀÔˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€ˆäääÑäÅ„Ý”Á•…„É„ÝÝ”ÙŒÐÜÕ„Í•‘”Å…”á„àå‰…˜ˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€ÌàÌØÜäØÄäÌÌ°(€€€€€€€€€€ÌàÌØÜäØÄäÐÌ°(€€€€€€€€€€ÌàÌØÜäØÄäÄÌ(€€€€€€€t°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔàÔ°(€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ°(€€€€€€€€‰Ù¥ÍÕ…±…±±‰…­Y•É¥™¥•ˆèÑÉÕ”(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄØˆ°(€€€€€€‰Á…ÉÐˆè€‰Ý¡½±”µ…¡¥¹”è‰±…¹¬™••‘•ÈÑ¡É½Õ ™½±‘¥¹œ°±Õ”°½µÁÉ•ÍÍ¥½¸…¹‘•±¥Ù•Éäˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½™´Äµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑ5…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÜˆ°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€‰˜ÀÜØÑ”å„äàÀÜÄäÍˆÁˆÁˆÑ‘ˆå”ÔÕ„ààÝ˜ÕŒå„á‘˜Øˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€‰ŒÔå™”ààÑˆå•Ù˜àÀÈÌÔÄÍ…Í„ÄÄàÍ”ÐÑ…„åŒÌÝŒˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€ÌàÌàäÀÀÜäÌÀ°(€€€€€€€€€€ÌàÌàäÀÀÜÜØÄ°(€€€€€€€€€€ÌàÌàäÀÀàÀØÌ(€€€€€€€t°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔàÜ°(€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ°(€€€€€€€€‰Ù¥ÍÕ…±…±±‰…­Y•É¥™¥•ˆèÑÉÕ”(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄÜˆ°(€€€€€€‰Á…ÉÐˆè€‰Ý¡½±”µ…¡¥¹”è‰±…¹¬™••‘•ÈÑ¡É½Õ ™½±‘¥¹œ°…‘¡•Í¥Ù”‰½Õ¹‘…Éä°½µÁÉ•ÍÍ¥½¸…¹‘•±¥Ù•Éäˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½™´ÈµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑ5…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄàˆ°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€‰™˜Ý‘„ÀÌàÅŒÌäÔÈÑ‘„ÈäÑˆÌàåá˜ÌÑ„Å‰‰ˆÉˆÁ‰”Üˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€ˆÅ„ÌÐÔå”É•ŒÐÈØÁ˜á‰‰ÈÀÌÐØÑ‰‘…™ÔÈá”åˆÔÀÀÄˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€ÌàÌäÔØÐÜÌÌÔ°(€€€€€€€€€€ÌàÌäÔØÐÜÌÄä°(€€€€€€€€€€ÌàÌäÔØÐÜÌØà(€€€€€€€t°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔàä°(€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ°(€€€€€€€€‰Ù¥ÍÕ…±…±±‰…­Y•É¥™¥•ˆèÑÉÕ”(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄàˆ°(€€€€€€‰Á…ÉÐˆè€‰Ý¡½±”µ…¡¥¹”è‰±…¹¬™••‘•ÈÑ¡É½Õ ™½Éµ¥¹œ°…‘¡•Í¥Ù”‰½Õ¹‘…Éä°½µÁÉ•ÍÍ¥½¸…¹‘•±¥Ù•Éäˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½™´Ìµµ•‘¥„ÄÀÁ¥¤µÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑ5…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄäˆ°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€‰ÈàÁ‘˜ÀØÉ…á…Å˜Ñ”ÄÈÝˆàÀÌÐÀÀá…ÔäÝˆÝ„Èˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€ˆÐÁˆÑŒÀÄàÈÈÐÅŒÐÐØÉ”ÄÐØÍ•˜àÄÍ”Ñ”ÀÈÈÔÉ‰…„áˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€ÌàÐÀÌÌÐÈÐÀÌ°(€€€€€€€€€€ÌàÐÀÌÌÐÈÐÌà°(€€€€€€€€€€ÌàÐÀÌÌÐÈÐÐÀ(€€€€€€€t°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔäÀ°(€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ°(€€€€€€€€‰Ù¥ÍÕ…±…±±‰…­Y•É¥™¥•ˆèÑÉÕ”(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÄäˆ°(€€€€€€‰Á…ÉÐˆè€‰Ý¡½±”µ…¡¥¹”è‰±…¹¬™••‘•ÈÑ¡É½Õ ¥¹ÍÁ•Ñ¥½¸‘•¥Í¥½¸É•©•ÐÉ•½Ù•Éä…¹…•ÁÑ•™¥Í µÍ…±”‘•±¥Ù•Éäˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½‘¥…¹„µ•å”ÔÔµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑ5…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÈÀˆ°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€ˆÔØØÕ…•……ŒÈáÅˆÐÉ™˜á„ÔÀÐÐÑ”ÌÜÌàäÉ•”ÈäÑˆÈÜˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€‰„å”ÌÔÄØÝ”ÀÁ•‘„Ù„Ðå••…ÜØÁ„Áˆá•”ÝˆàäàÝ„ˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€ÌàÐÌÜÐÀäØàÀ°(€€€€€€€€€€ÌàÐÌÜÐÀääÜÌ°(€€€€€€€€€€ÌàÐÌÜÐÀääÜä(€€€€€€€t°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔäÈ°(€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ°(€€€€€€€€‰Ù¥ÍÕ…±…±±‰…­Y•É¥™¥•ˆèÑÉÕ”(€€€€€ô(€€€ô°(€€€ì(€€€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÈÀˆ°(€€€€€€‰Á…ÉÐˆè€‰Ý¡½±”µ…¡¥¹”èÁ¥±”¥¹ÁÕÐÑ¡É½Õ ÍÕÑ¥½¸ÑÉ…¹Í™•È¥¹ÍÁ•Ñ¥½¸‘•¥Í¥½¸…¹½½½‰…É•ÑÕÉ¸½±±•Ñ¥½¸ˆ°(€€€€€€‰ÍÑ…ÑÕÌˆè€‰=5A1Qˆ°(€€€€€€‰É•Á½ÉÐˆè€‰‘½Ì½Í¡…É¬µ¸ØÔÀµÝ¡½±”µµ…¡¥¹”µ…Õ‘¥Ð¹µˆ°(€€€€€€‰¹•áÑ5…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÈÄˆ°(€€€€€€‰Á…É•¹Ñ½µµ¥Ðˆè€ˆäÄÍ„ÌÑ˜ÀÈÔÈäÜÕÔÌÈÑ˜Å˜ÐäÄÍŒÉäÔÀá”ÅˆÜÈØÌˆ°(€€€€€€‰É•±•…Í•Ù¥‘•¹”ˆèì(€€€€€€€€‰½µµ¥Ðˆè€‰ŒÔÌÉàÝ”àÁŒÐÐäÈÄÕ”ÜåÈÔÍÌäÁŒÔÔÙ˜àÀáØäÀˆ°(€€€€€€€€‰Ý½É­™±½ÝÌˆèl(€€€€€€€€€€ÌàÐÐÐØÈäÜÜÈ°(€€€€€€€€€€ÌàÐÐÐØÈäØàÐ°(€€€€€€€€€€ÌàÐÐÐØÈäØàà(€€€€€€€t°(€€€€€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€€€€€‰Ñ•ÍÑÌˆè€ÄÔäÔ°(€€€€€€€€‰ÁÉ½‘ÕÑ¥½¹!ÑÑÀˆè€ÈÀÀ°(€€€€€€€€‰Ù¥ÍÕ…±…±±‰…­Y•É¥™¥•ˆèÑÉÕ”(€€€€€ô(€€€ô(€t°(€€‰ÕÁ‘…Ñ•‘Ðˆè€ˆÈÀÈØ´ÄÀ´ÄÑPÀÈèÈÀèÀÁhˆ°(€€‰±…ÍÑÕ‘¥ÑI•±•…Í”ˆèì(€€€€‰µ…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÈÄˆ°(€€€€‰½µµ¥Ðˆè€‰ŒÕ•ÀÔàÌÜÉ”ÐÈÔäÕ•ŒÈÜÔÀÑ˜Ý‘”ÙˆÑŒÕŒàÄääÌÜˆ°(€€€€‰Ý½É­™±½ÝÌˆèlÌàÐääÔÐÌÜÜÀ°€ÌàÐääÔÐÌÜÔÐ°€ÌàÐääÔÐÌÜÌåt°(€€€€‰½¹±ÕÍ¥½¸ˆè€‰ÍÕ•ÍÌˆ°(€€€€‰Ñ•ÍÑÌˆè€ÄÔäà°(€€€€‰¹•áÑ5…¡¥¹•%ˆè€‰	5(µ5 ´ÀÀÈÈˆ°(€€€€‰Ù¥ÍÕ…±…±±‰…­Y•É¥™¥•ˆèÑÉÕ”°(€€€€‰Ù¥ÍÕ…°ÍY•É¥™¥•ˆè™…±Í”(€ô)ô(