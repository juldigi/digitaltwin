import * as THREE from 'three';
import {UniversalMachineTemplate} from './universal-machine.js';
import {V123_SOURCE_STATS} from './data/research-v123.js';

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
  this.root.name=this.cfg.machine.name+' · REFERENCE-GROUNDED';
  this.root.userData.referenceBuilder='V123_RESEARCH_GROUNDED_BUILDER';
  this.root.userData.engineeringDimensions=false;
  this.root.userData.referenceBoundary=this.cfg.profile?.unknowns||[];
  this.root.userData.researchVersion='V123';
  this.root.userData.researchSourceCount=V123_SOURCE_STATS.total;
  this.root.userData.newReviewedSources=V123_SOURCE_STATS.newReviewed;
  this.enrichV121();
  for(const n of this.nodes){
   if(!n.userData.rest)n.userData.rest=n.position.clone();
   if(!n.userData.restQuaternion)n.userData.restQuaternion=n.quaternion.clone();
  }
  for(const m of this.activeMeshes){
   m.userData.motionRestPosition=m.position.clone();
   m.userData.motionRestQuaternion=m.quaternion.clone();
  }
 }
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
   const blade=this.box(doc,[.035,.012,1.16],[-.15,1.00,0],'steel',.002);blade.rotation.z=-.18;this.tag(blade,'doctor-blade-edge','GRAVURE_DOCTOR_PATENT');
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
  for(let i=1;i<=7;i++){const a=this.activeGroup(i);if(!a)continue;for(const z of [-.62,.62])this.tag(this.box(a,[1.10,.035,.04],[0,.62,z],'steel',.004),'side-frame-rail');if(i>1&&i<7)for(const z of [-.45,-.15,.15,.45]){const p=this.motion(this.cyl(a,.048,.12,[.45,.78,z],'dark','z'),'spin','z',7,.01,z,i-1);this.tag(p,'transport-pulley');}}
  const glue=this.activeGroup(5);if(glue){this.tag(this.box(glue,[.48,.55,.42],[.42,.50,.78],'accent',.025),'glue-reservoir');this.tag(this.cyl(glue,.045,.62,[.18,.90,.66],'steel','y'),'glue-line');}
  const press=this.activeGroup(6);if(press)for(const z of [-.48,.48])this.tag(this.cyl(press,.045,.36,[.30,1.20,z],'steel','x'),'compression-pressure-cylinder');
 }
 enrichBlanker(){
  const xy=this.activeGroup(2),head=this.activeGroup(3),tool=this.activeGroup(4),sep=this.activeGroup(5),out=this.activeGroup(6),ctl=this.activeGroup(7);
  this.root.userData.detailPass='V123_R3_QF100CS_BOUNDED_FAMILY_RECONSTRUCTION';
  this.root.userData.blankerFamily='QF_LQF_1080_B_C_BS_CS_CLOSE_FAMILY';
  this.root.userData.exactModelPublicDocumentationFound=false;
  this.root.userData.installedBlankingHeadCountVerified=false;
  this.root.userData.installedCollectorStackerVerified=false;
  this.root.userData.localSupplierFamilyEvidence={source:'Jaya Makmur Mesindo',catalogue:['QF1080B','QF1080C'],bmjCustomerAssociation:true,installationProof:false,exactModelEquivalenceProof:false};
  this.root.userData.familyProcess={
   movingPlatformAxes:['X','Y'],
   stableHead:true,
   drive:'SERVO_BALL_SCREW_LINEAR_GUIDE',
   positionFeedback:'PHOTOELECTRIC_AND_POSITION_LIMIT_REFERENCE',
   tooling:'HONEYCOMB_PIN_BOARD_FAMILY_REFERENCE',
   control:'PLC_HMI',
   safetyInterlock:'PLATFORM_STOP_BEFORE_HYDRAULIC_STROKE',
   simulationBoundary:'FAMILY_PROCESS_ONLY__NOT_SERIAL_SPECIFIC'
  };
  const detail=(parent,id,name)=>parent?this.group(parent,id,name,[0,0,0],[0,.08,.08]):null;

  if(xy){
   const x=detail(xy,'qf100-x-axis-detail','X-axis drive detail');
   this.tag(this.cyl(x,.022,.96,[0,.49,-.48],'steel','x'),'x-axis-ball-screw','QF_LQF_FAMILY_PRIMARY');
   for(const z of [-.58,-.38])this.tag(this.box(x,[1.02,.035,.045],[0,.54,z],'steel',.004),'x-axis-linear-guide','QF_LQF_FAMILY_PRIMARY');
   const sx=this.active(this.cyl(x,.085,.18,[-.58,.49,-.48],'dark','x'));this.tag(sx,'x-axis-servo-motor','QF_LQF_FAMILY_PRIMARY');

   const y=detail(xy,'qf100-y-axis-detail','Y-axis drive detail');
   this.tag(this.cyl(y,.022,1.05,[.32,.46,0],'steel','z'),'y-axis-ball-screw','QF_LQF_FAMILY_PRIMARY');
   for(const x0 of [.22,.42])this.tag(this.box(y,[.045,.035,1.12],[x0,.51,0],'steel',.004),'y-axis-linear-guide','QF_LQF_FAMILY_PRIMARY');
   const sy=this.active(this.cyl(y,.085,.18,[.32,.46,.60],'dark','z'));this.tag(sy,'y-axis-servo-motor','QF_LQF_FAMILY_PRIMARY');

   const sensors=this.findNode('qf100-position-sensors');
   if(sensors){
    for(const p0 of [[-.48,.61,-.54],[.48,.61,-.54],[-.48,.61,.54],[.48,.61,.54]])this.tag(this.box(sensors,[.055,.09,.045],p0,'blue',.006),'photoelectric-position-sensor','QF_LQF_FAMILY_PRIMARY');
   }
  }

  if(head){
   const ram=this.findNode('qf100-head-ram');
   if(ram){
    this.tag(this.cyl(ram,.105,.56,[0,1.53,0],'dark','y'),'main-hydraulic-cylinder-reference','QF_LQF_FAMILY_PRIMARY');
    this.tag(this.cyl(ram,.047,.48,[0,1.24,0],'steel','y'),'hydraulic-ram-reference','QF_LQF_FAMILY_PRIMARY');
    const plate=this.active(this.box(ram,[.64,.10,1.02],[0,.98,0],'steel',.01));this.tag(plate,'blanking-pressure-plate','QF_LQF_FAMILY_PRIMARY');
   }
   const guides=this.findNode('qf100-head-guides');
   if(guides)for(const x0 of [-.27,.27]){this.tag(this.cyl(guides,.032,.58,[x0,1.24,0],'steel','y'),'ram-guide-post','CLOSE_FAMILY_MECHANISM');this.tag(this.cyl(guides,.052,.12,[x0,1.03,0],'dark','y'),'ram-guide-bushing','CLOSE_FAMILY_MECHANISM');}
  }

  if(tool){
   const board=this.findNode('qf100-pin-board');
   if(board){
    this.tag(this.box(board,[.70,.055,1.08],[0,.86,0],'steel',.006),'honeycomb-pin-board','QF_FAMILY_TECHNICAL_ARTICLE');
    for(let x0=-.28;x0<=.28;x0+=.14)for(let z=-.42;z<=.42;z+=.14)this.tag(this.cyl(board,.008,.035,[x0,.90,z],'dark','y'),'honeycomb-hole-reference','QF_FAMILY_TECHNICAL_ARTICLE');
   }
   const pins=this.findNode('qf100-tooling-pins');
   if(pins)for(const [x0,z] of [[-.21,-.28],[0,-.28],[.21,-.28],[-.21,0],[.21,0],[-.21,.28],[0,.28],[.21,.28]])this.tag(this.cyl(pins,.012,.18,[x0,.79,z],'accent','y'),'blanking-tool-pin','QF_FAMILY_TECHNICAL_ARTICLE');
   const lock=this.findNode('qf100-tooling-lock');
   if(lock)for(const z of [-.48,.48])this.tag(this.box(lock,[.12,.08,.08],[.31,.84,z],'dark',.006),'pin-board-locator-reference','CLOSE_FAMILY_MECHANISM');
  }

  if(sep){
   const interfaceNode=this.findNode('qf100-separation-interface');
   if(interfaceNode){
    this.tag(this.box(interfaceNode,[.68,.035,1.08],[0,.73,0],'paper',.003),'diecut-stack-reference','PROCESS_WORKPIECE_REFERENCE');
    interfaceNode.userData.noInventedForkOrConveyor=true;
   }
   const waste=this.findNode('qf100-waste-support');
   if(waste)for(const z of [-.52,.52])this.tag(this.box(waste,[.78,.045,.055],[0,.68,z],'steel',.005),'waste-frame-support-rail','CLOSE_FAMILY_PROCESS_REFERENCE');
  }

  if(out){
   const tray=this.findNode('qf100-receiving-tray');
   if(tray)this.tag(this.box(tray,[.72,.055,1.10],[0,.55,0],'steel',.008),'product-receiving-tray','MINIMUM_PROCESS_INTERFACE');
   const option=this.findNode('qf100-collector-option');
   if(option){
    option.userData.installedOptionVerified=false;
    option.userData.boundary='Collecting/stacker is documented on QF family variants but is not confirmed on BMJ QF-100CS.';
    const marker=this.box(option,[.55,.32,1.00],[0,.55,0],'glass',.018);marker.userData.optionReference=true;this.tag(marker,'collector-stacker-option-envelope','QF_FAMILY_OPTION_BOUNDARY');
   }
  }

  if(ctl){
   const hmi=this.findNode('qf100-hmi');
   if(hmi)this.tag(this.box(hmi,[.30,.22,.028],[0,1.55,-.73],'glass',.008),'operator-touchscreen','QF_LQF_FAMILY_PRIMARY');
   const hyd=this.findNode('qf100-hydraulic-unit');
   if(hyd){
    this.tag(this.box(hyd,[.42,.34,.42],[0,.43,.47],'accent',.02),'hydraulic-reservoir','QF_FAMILY_TECHNICAL_ARTICLE');
    this.tag(this.cyl(hyd,.085,.22,[-.13,.70,.47],'dark','x'),'hydraulic-pump','QF_FAMILY_TECHNICAL_ARTICLE');
    this.tag(this.box(hyd,[.18,.15,.18],[.16,.69,.47],'steel',.008),'hydraulic-manifold-reference','CLOSE_FAMILY_MECHANISM');
   }
   const plc=this.findNode('qf100-plc-cabinet');
   if(plc){
    this.tag(this.box(plc,[.38,.74,.48],[0,.72,0],'dark',.025),'plc-servo-cabinet','QF_LQF_FAMILY_PRIMARY');
    for(const y0 of [.54,.72,.90])this.tag(this.box(plc,[.22,.035,.30],[.02,y0,-.25],'steel',.003),'electrical-module-reference','CONTROL_FAMILY_REFERENCE');
   }
  }
 }
 enrichCollator(){
  const tower=this.activeGroup(1),vac=this.activeGroup(2),sense=this.activeGroup(3),gather=this.activeGroup(4),delivery=this.activeGroup(5),control=this.activeGroup(6);
  const part=(parent,id,name)=>parent?this.group(parent,id,name,[0,0,0],[0,.08,.08]):null;
  this.root.userData.detailPass='V123_R4_MULTI_VENDOR_SUCTION_COLLATOR_RECONSTRUCTION';
  this.root.userData.exactCollatorOemVerified=false;
  this.root.userData.exactCollatorModelVerified=false;
  this.root.userData.modeledReferenceBinCount=10;
  this.root.userData.installedBinCountVerified=false;
  this.root.userData.crossFamilyReferences=['HORIZON_VAC1000','HORIZON_VAC600H','DUPLO_DSC10_60I','VERTICAL_COLLATOR_PATENT'];
  this.root.userData.collatorProcessBoundary='TEN_BIN_DISPLAY_IS_CROSS_FAMILY_REFERENCE_NOT_BMJ_INSTALLED_COUNT';

  if(tower){
   const trays=this.findNode('collator-bin-trays');
   const feeds=this.findNode('collator-suction-feeds');
   const air=this.findNode('collator-bin-air');
   for(let b=0;b<10;b++){
    const y=.34+b*.145;
    if(trays){
     this.tag(this.box(trays,[.82,.025,1.02],[-.08,y,0],'steel',.004),'feed-bin-shelf','MULTI_VENDOR_COLLATOR_FAMILY');
     this.tag(this.box(trays,[.72,.018,.94],[-.12,y+.035,0],'paper',.003),'bin-sheet-stack-reference','PROCESS_WORKPIECE_REFERENCE');
     for(const z of [-.47,.47])this.tag(this.box(trays,[.06,.10,.035],[-.33,y+.06,z],'steel',.004),'bin-side-guide-reference','MULTI_VENDOR_COLLATOR_FAMILY');
    }
    if(feeds){
     const rotor=this.motion(this.cyl(feeds,.035,.82,[.30,y+.045,0],'dark','z'),'spin','z',8,.01,b*.17,0);this.tag(rotor,'suction-rotor','MULTI_VENDOR_COLLATOR_FAMILY');rotor.userData.binIndex=b;
     const nip=this.cyl(feeds,.024,.82,[.39,y+.045,0],'steel','z');this.tag(nip,'feed-nip-roller-reference','VERTICAL_COLLATOR_PATENT');nip.userData.binIndex=b;
    }
    if(air){
     for(const z of [-.32,.32]){const n=this.cyl(air,.010,.065,[.02,y+.075,z],'accent','x');this.tag(n,'bin-air-separation-nozzle','MULTI_VENDOR_COLLATOR_FAMILY');n.userData.binIndex=b;}
    }
   }
  }
  if(vac){
   const blower=this.findNode('collator-vacuum-blower');
   if(blower){const fan=this.motion(this.cyl(blower,.15,.28,[0,.42,.36],'dark','x'),'spin','x',11,.01,0,null);this.tag(fan,'vacuum-blower','MULTI_VENDOR_COLLATOR_FAMILY');}
   const manifold=this.findNode('collator-vacuum-manifold');
   if(manifold){this.tag(this.cyl(manifold,.030,1.30,[.04,.98,.44],'steel','y'),'vacuum-main-manifold','MULTI_VENDOR_COLLATOR_FAMILY');for(let b=0;b<10;b++){const y=.34+b*.145;const branch=this.cyl(manifold,.010,.42,[.04,y,.22],'steel','z');this.tag(branch,'vacuum-bin-branch','MULTI_VENDOR_COLLATOR_FAMILY');branch.userData.binIndex=b;}}
  }
  if(sense){
   const feed=this.findNode('collator-double-feed'),empty=this.findNode('collator-bin-empty');
   for(let b=0;b<10;b++){const y=.34+b*.145;
    if(feed){const s=this.box(feed,[.055,.065,.045],[.48,y+.045,-.47],'accent',.004);this.tag(s,'double-miss-feed-sensor-reference','MULTI_VENDOR_COLLATOR_FAMILY');s.userData.binIndex=b;}
    if(empty){const s=this.box(empty,[.050,.055,.040],[-.28,y+.055,-.48],'blue',.004);this.tag(s,'bin-empty-sheet-presence-sensor','MULTI_VENDOR_COLLATOR_FAMILY');s.userData.binIndex=b;}
   }
  }
  if(gather){
   const guide=this.findNode('collator-gather-guide');
   if(guide){for(const z of [-.40,.40])this.tag(this.box(guide,[.065,1.42,.055],[0,.92,z],'steel',.005),'vertical-gather-guide','VERTICAL_COLLATOR_PATENT');for(const y of [.40,.72,1.04,1.36])this.tag(this.box(guide,[.34,.022,.86],[-.02,y,0],'steel',.003),'gather-guide-plate','VERTICAL_COLLATOR_PATENT');}
   const drive=this.findNode('collator-gather-drive');
   if(drive)for(const y of [.42,.70,.98,1.26]){const r=this.motion(this.cyl(drive,.047,.82,[.03,y,0],'dark','z'),'spin','z',7,.01,y,3);this.tag(r,'gather-transport-roller','MULTI_VENDOR_COLLATOR_FAMILY');}
  }
  if(delivery){
   const belt=this.findNode('collator-delivery-belt');
   if(belt)for(const z of [-.36,-.12,.12,.36])this.tag(this.box(belt,[.68,.025,.07],[0,.59,z],'dark',.004),'delivery-belt','MULTI_VENDOR_COLLATOR_FAMILY');
   const jog=this.findNode('collator-set-jogger');
   if(jog){const j=this.motion(this.box(jog,[.42,.18,.045],[.16,.69,.46],'accent',.006),'oscillate','z',9,.025,0,4);this.tag(j,'set-jogger','MULTI_VENDOR_COLLATOR_FAMILY');}
   const boundary=this.findNode('collator-downstream-boundary');
   if(boundary){boundary.userData.installedDownstreamFinisherVerified=false;const marker=this.box(boundary,[.36,.22,.88],[.36,.60,0],'glass',.012);marker.userData.optionReference=true;this.tag(marker,'downstream-finisher-interface-boundary','OPTION_BOUNDARY');}
  }
  if(control){
   const hmi=this.findNode('collator-hmi');
   if(hmi)this.tag(this.box(hmi,[.27,.20,.025],[-.02,.89,-.34],'glass',.008),'collator-touchscreen-reference','MULTI_VENDOR_COLLATOR_FAMILY');
   const io=this.findNode('collator-control-io');
   if(io){this.tag(this.box(io,[.26,.48,.34],[.06,.53,.22],'dark',.016),'collator-control-io-cabinet','CONTROL_FAMILY_REFERENCE');for(let b=0;b<10;b++)this.tag(this.box(io,[.10,.025,.08],[-.03,.32+b*.035,.02],'accent',.002),'bin-control-io-reference','CONTROL_FAMILY_REFERENCE');}
  }
 }
 enrichCTP(){
  const load=this.activeGroup(1),transport=this.activeGroup(2),drumUnit=this.activeGroup(3),laserUnit=this.activeGroup(4),punchUnit=this.activeGroup(5),out=this.activeGroup(6);
  this.root.userData.detailPass='V123_R5_SUPRASETTER_MULTI_MODEL_FAMILY_RECONSTRUCTION';
  this.root.userData.exactSuprasetterModelVerified=false;
  this.root.userData.exactPlateFormatVerified=false;
  this.root.userData.suprasetterOptions={
   loader:'MODEL_DEPENDENT_NOT_INSTALLATION_CONFIRMED',
   internalPunch:'AVAILABLE_NOT_INSTALLATION_CONFIRMED',
   debrisRemoval:'AVAILABLE_NOT_INSTALLATION_CONFIRMED',
   temperatureStabilization:'MODEL_DEPENDENT_NOT_INSTALLATION_CONFIRMED',
   processorStacker:'NOT_INSTALLATION_CONFIRMED'
  };
  this.root.userData.commonVerifiedFamilyMechanisms=['EXTERNAL_IMAGING_DRUM','HEIDELBERG_THERMAL_LASER_FAMILY','INTELLIGENT_DIODE_SYSTEM','PLATE_TRANSPORT','PLATE_UNLOAD'];
  const part=(parent,id,name)=>parent?this.group(parent,id,name,[0,0,0],[0,.08,.08]):null;

  if(load){
   const manual=this.findNode('ctp-manual-entry');
   if(manual){this.tag(this.box(manual,[.72,.035,1.04],[-.12,.70,0],'steel',.005),'manual-plate-entry-bed','SUPRASETTER_FAMILY_PRIMARY');for(const z of [-.48,.48])this.tag(this.box(manual,[.50,.035,.035],[-.12,.77,z],'steel',.003),'manual-plate-side-guide','SUPRASETTER_FAMILY_PRIMARY');}
   const loader=this.findNode('ctp-loader-boundary');
   if(loader){loader.userData.installedOptionVerified=false;loader.userData.boundary='ATL/DTL are A52/A75 family options; ACL/DCL/APL belong to A106/106 families. Exact BMJ model and loader package are unknown.';const env=this.box(loader,[.66,.54,1.12],[-.34,1.20,0],'glass',.018);env.userData.optionReference=true;this.tag(env,'automatic-loader-family-envelope','SUPRASETTER_LOADER_OPTION_BOUNDARY');}
  }
  if(transport){
   const path=this.findNode('ctp-transport');
   if(path)for(const y of [.62,.82,.98]){const r=this.motion(this.cyl(path,.045,1.02,[0,y,0],'dark','z'),'spin','z',3.4,.01,y,1);this.tag(r,'plate-transport-roller','SUPRASETTER_FAMILY_PRIMARY');}
   const reg=this.findNode('ctp-register');
   if(reg){for(const z of [-.42,.42])this.tag(this.box(reg,[.075,.055,.055],[.24,.87,z],'accent',.005),'plate-position-sensor-reference','SUPRASETTER_FAMILY_PROCESS');this.tag(this.box(reg,[.06,.32,1.00],[-.24,.82,0],'steel',.004),'plate-register-stop-reference','SUPRASETTER_FAMILY_PROCESS');}
  }
  if(drumUnit){
   const drum=this.findNode('ctp-drum');
   if(drum){const d=this.motion(this.cyl(drum,.34,1.10,[0,.82,0],'dark','z'),'spin','z',2.8,.01,0,2);this.tag(d,'external-imaging-drum','SUPRASETTER_FAMILY_PRIMARY');d.userData.imagingDrum=true;for(const z of [-.57,.57])this.tag(this.cyl(drum,.060,.12,[0,.82,z],'steel','z'),'imaging-drum-bearing-reference','SUPRASETTER_FAMILY_PROCESS');}
   const clamp=this.findNode('ctp-drum-clamp');
   if(clamp){for(const z of [-.43,.43]){const bar=this.box(clamp,[.12,.055,.13],[-.23,.98,z],'accent',.005);this.tag(bar,'plate-clamp-reference','SUPRASETTER_FAMILY_PROCESS');}}
  }
  if(laserUnit){
   const rail=this.findNode('ctp-laser-rail');
   if(rail)this.tag(this.box(rail,[.055,.055,1.02],[0,1.23,0],'steel',.004),'laser-linear-rail','SUPRASETTER_FAMILY_PRIMARY');
   const module=this.findNode('ctp-laser-module');
   if(module){const carriage=this.motion(this.box(module,[.19,.17,.24],[0,1.23,0],'accent',.014),'oscillate','z',3.8,.38,0,3);this.tag(carriage,'heidelberg-laser-carriage','SUPRASETTER_FAMILY_PRIMARY');carriage.userData.installedLaserModuleCountVerified=false;for(const z of [-.07,.07])this.tag(this.box(module,[.055,.055,.065],[.08,1.22,z],'blue',.004),'heidelberg-laser-module-reference','SUPRASETTER_FAMILY_PRIMARY');}
   const ids=this.findNode('ctp-ids');
   if(ids){ids.userData.oemTechnology='INTELLIGENT_DIODE_SYSTEM';ids.userData.installedDiodeCountVerified=false;for(const z of [-.12,0,.12])this.tag(this.box(ids,[.04,.04,.055],[-.09,1.22,z],'accent',.003),'ids-diode-channel-reference','SUPRASETTER_FAMILY_PRIMARY');}
  }
  if(punchUnit){
   const punch=this.findNode('ctp-punch-option');
   if(punch){punch.userData.installedOptionVerified=false;punch.userData.simulationEnabled=false;punch.userData.boundary='Internal punch is an official Suprasetter option. Available punch-pair count depends on exact model; neither BMJ CTP installation is confirmed.';for(const z of [-.33,.33]){const pin=this.cyl(punch,.025,.18,[0,.84,z],'steel','y');pin.userData.optionReference=true;pin.userData.simulationEnabled=false;this.tag(pin,'internal-punch-option-reference','SUPRASETTER_OPTION_BOUNDARY');}}
  }
  if(out){
   const unload=this.findNode('ctp-unload');
   if(unload){for(const z of [-.42,.42])this.tag(this.box(unload,[.66,.025,.05],[.08,.66,z],'steel',.004),'plate-unload-guide','SUPRASETTER_FAMILY_PRIMARY');this.tag(this.box(unload,[.64,.025,.92],[.12,.69,0],'steel',.003),'plate-output-bed-reference','SUPRASETTER_FAMILY_PROCESS');}
   const processor=this.findNode('ctp-processor-boundary');
   if(processor){processor.userData.installedOptionVerified=false;const env=this.box(processor,[.44,.30,1.02],[.44,.54,0],'glass',.015);env.userData.optionReference=true;this.tag(env,'processor-stacker-interface-boundary','OPTION_BOUNDARY');}
   const debris=this.findNode('ctp-debris-option');
   if(debris){debris.userData.installedOptionVerified=false;debris.userData.simulationEnabled=false;const fan=this.cyl(debris,.10,.12,[-.34,.52,.42],'dark','x');fan.userData.optionReference=true;fan.userData.simulationEnabled=false;this.tag(fan,'debris-removal-vacuum-option','SUPRASETTER_OPTION_BOUNDARY');const filter=this.box(debris,[.20,.28,.20],[-.48,.40,.42],'filter',.012);filter.userData.optionReference=true;this.tag(filter,'debris-filter-option','SUPRASETTER_OPTION_BOUNDARY');}
   const temp=this.findNode('ctp-temp-stabilizer-option');
   if(temp){temp.userData.installedOptionVerified=false;const box=this.box(temp,[.26,.18,.22],[-.28,.50,-.42],'blue',.012);box.userData.optionReference=true;this.tag(box,'temperature-stabilizer-option','SUPRASETTER_MODEL_DEPENDENT_BOUNDARY');for(const z of [-.34,.34])this.tag(this.cyl(temp,.012,.42,[-.24,.47,z],'blue','y'),'temperature-control-line-option','SUPRASETTER_MODEL_DEPENDENT_BOUNDARY');}
  }
 }
 enrichImagesetter(){
  const supply=this.activeGroup(1),transport=this.activeGroup(2),scan=this.activeGroup(3),laser=this.activeGroup(4),cut=this.activeGroup(5),out=this.activeGroup(6);
  this.root.userData.detailPass='V123_R6_SCREEN_FTR_KATANA_MULTI_MODEL_RECONSTRUCTION';
  this.root.userData.exactScreenModelVerified=false;
  this.root.userData.familyCandidates=['FT-R3035','FT-R3050','Katana 5040','Katana 5055'];
  this.root.userData.exactLaserWavelengthVerified=false;
  this.root.userData.familyLaserWavelengthNm=[633,635];
  this.root.userData.katanaPolygonReference={facets:5,maxRpm:14400,installedApplicabilityVerified:false};
  this.root.userData.imagesetterOptions={punch:'NOT_INSTALLATION_CONFIRMED',inlineProcessor:'NOT_INSTALLATION_CONFIRMED',outputCassette:'NOT_INSTALLATION_CONFIRMED',ripInterface:'NOT_INSTALLATION_CONFIRMED'};
  this.root.userData.commonFamilyMechanisms=['ROLL_MEDIA_SUPPLY','AUTOMATIC_MEDIA_LOADING','CAPSTAN_TRANSPORT','SLACK_TENSION_CONTROL','POLYGON_MIRROR_FAST_SCAN','RED_LASER_OPTICS','MEDIA_CUT_OUTPUT'];
  this.root.userData.processArchitecture='CAPSTAN_FLATBED_SCAN__NOT_IMAGING_DRUM';

  if(supply){
   const cassette=this.findNode('ctf-media-cassette');
   if(cassette){
    const roll=this.motion(this.cyl(cassette,.21,.74,[-.18,.68,0],'dark','z'),'spin','z',2.2,.01,0,null);this.tag(roll,'media-supply-roll','SCREEN_FTR_KATANA_FAMILY');roll.userData.exactMediaWidthVerified=false;
    this.tag(this.cyl(cassette,.045,.86,[-.18,.68,0],'steel','z'),'media-cassette-spindle','SCREEN_FTR_KATANA_FAMILY');
    for(const z of [-.45,.45])this.tag(this.box(cassette,[.48,.56,.035],[-.18,.68,z],'dark',.012),'media-cassette-sideplate','SCREEN_FTR_KATANA_FAMILY');
   }
   const load=this.findNode('ctf-auto-load');
   if(load){
    load.userData.familyFunction='AUTOMATIC_MEDIA_LOADING';
    for(const y of [.60,.78]){const r=this.motion(this.cyl(load,.034,.82,[.19,y,0],'steel','z'),'spin','z',4.2,.01,y,null);this.tag(r,'automatic-load-roller','SCREEN_FTR_KATANA_FAMILY');}
    for(const z of [-.38,.38])this.tag(this.box(load,[.42,.025,.035],[.10,.70,z],'steel',.003),'media-entry-guide','SCREEN_FTR_KATANA_FAMILY');
   }
  }

  if(transport){
   const capstan=this.findNode('ctf-capstan');
   if(capstan){
    const drive=this.motion(this.cyl(capstan,.075,.86,[0,.79,0],'dark','z'),'spin','z',6.2,.01,0,null);this.tag(drive,'capstan-drive-roller','SCREEN_FTR_KATANA_FAMILY');
    const nip=this.motion(this.cyl(capstan,.046,.86,[.15,.79,0],'steel','z'),'spin','z',6.2,.01,.2,null);this.tag(nip,'capstan-nip-roller','SCREEN_FTR_KATANA_FAMILY');
    this.tag(this.box(capstan,[.42,.014,.78],[-.08,.87,0],'paper',.002),'media-web-reference','PROCESS_WORKPIECE_REFERENCE');
   }
   const front=this.findNode('ctf-front-slack');
   if(front){
    front.userData.slackZone='FRONT';
    for(const [x,y,a] of [[-.26,.73,-.35],[-.13,.53,-.16],[0,.45,0],[.13,.53,.16],[.26,.73,.35]]){const seg=this.box(front,[.16,.012,.74],[x,y,0],'paper',.001);seg.rotation.z=a;this.tag(seg,'front-slack-media-loop-reference','KATANA_OFFICIAL');}
    for(const x of [-.28,.28])this.tag(this.cyl(front,.028,.80,[x,.76,0],'steel','z'),'front-slack-guide-roller','KATANA_OFFICIAL');
   }
   const gravity=this.findNode('ctf-gravity-roller');
   if(gravity){
    const gr=this.motion(this.cyl(gravity,.052,.84,[0,.49,0],'steel','z'),'spin','z',4.4,.01,0,null);this.tag(gr,'gravity-tension-roller','KATANA_OFFICIAL');
    gr.userData.tensionRegulationReference=true;
   }
   const rear=this.findNode('ctf-rear-slack');
   if(rear){
    rear.userData.slackZone='REAR';
    for(const [x,y,a] of [[-.25,.72,-.32],[-.12,.55,-.15],[0,.48,0],[.12,.55,.15],[.25,.72,.32]]){const seg=this.box(rear,[.15,.012,.74],[x,y,0],'paper',.001);seg.rotation.z=a;this.tag(seg,'rear-slack-media-loop-reference','KATANA_OFFICIAL');}
    for(const x of [-.27,.27])this.tag(this.cyl(rear,.028,.80,[x,.75,0],'steel','z'),'rear-slack-guide-roller','KATANA_OFFICIAL');
   }
  }

  if(scan){
   const mirror=this.findNode('ctf-polygon-mirror');
   if(mirror){
    const poly=this.mesh(mirror,()=>new THREE.CylinderGeometry(.105,.105,.065,5),'ctf-polygon-five-facet','steel',[0,.82,0]);
    this.active(poly);this.motion(poly,'spin','y',14,.01,0,null);this.tag(poly,'five-facet-polygon-mirror-reference','KATANA_OFFICIAL');
    poly.userData.documentedKatanaFacetCount=5;poly.userData.installedFacetCountVerified=false;poly.userData.documentedKatanaMaxRpm=14400;poly.userData.installedRpmVerified=false;
    this.tag(this.box(mirror,[.34,.28,.34],[0,.82,0],'dark',.018),'polygon-scanner-housing','SCREEN_FTR_KATANA_FAMILY');
   }
   const drive=this.findNode('ctf-polygon-drive');
   if(drive){
    const motor=this.motion(this.cyl(drive,.075,.18,[0,.62,0],'dark','y'),'spin','y',14,.01,0,null);this.tag(motor,'polygon-drive-motor-reference','SCREEN_FTR_KATANA_FAMILY');
    motor.userData.actualMotorSpeedVerified=false;
   }
  }

  if(laser){
   const source=this.findNode('ctf-laser-source');
   if(source){
    const src=this.box(source,[.20,.16,.22],[-.20,.84,0],'accent',.012);this.tag(src,'red-laser-source-reference','SCREEN_FTR_KATANA_FAMILY');
    src.userData.familyWavelengthNm=[633,635];src.userData.installedWavelengthVerified=false;
   }
   const optics=this.findNode('ctf-optics');
   if(optics){
    const lens=this.cyl(optics,.048,.035,[.02,.84,0],'glass','x');this.tag(lens,'beam-focus-lens-reference','KATANA_OFFICIAL');
    const path1=this.box(optics,[.28,.012,.012],[-.05,.84,0],'glass',.001);this.tag(path1,'laser-beam-path-reference','PROCESS_VISUALIZATION');
    const path2=this.box(optics,[.012,.012,.52],[.09,.84,.25],'glass',.001);this.tag(path2,'laser-scan-path-reference','PROCESS_VISUALIZATION');
   }
   const mod=this.findNode('ctf-laser-modulator');
   if(mod)this.tag(this.box(mod,[.13,.11,.16],[-.08,1.02,.20],'dark',.008),'laser-modulator-reference','SCREEN_FTR_KATANA_FAMILY');
  }

  if(cut){
   const cutter=this.findNode('ctf-cutter');
   if(cutter){
    const blade=this.motion(this.box(cutter,[.10,.22,.78],[0,.78,0],'steel',.005),'press','y',2.4,.045,0,null);this.tag(blade,'media-cross-cutter','SCREEN_FTR_FAMILY');
    this.tag(this.box(cutter,[.08,.06,.82],[.03,.66,0],'dark',.004),'cutter-anvil-reference','SCREEN_FTR_FAMILY');
   }
   const punch=this.findNode('ctf-punch-option');
   if(punch){
    punch.userData.installedOptionVerified=false;punch.userData.simulationEnabled=false;punch.userData.boundary='Katana supports multiple punch formats and optional tail punch; BMJ installed punch package is not verified.';
    for(const z of [-.30,.30]){const pin=this.cyl(punch,.020,.16,[.18,.78,z],'steel','y');pin.userData.optionReference=true;pin.userData.simulationEnabled=false;this.tag(pin,'register-punch-option-reference','KATANA_OPTION_BOUNDARY');}
   }
  }

  if(out){
   const cassette=this.findNode('ctf-output-cassette');
   if(cassette){
    cassette.userData.installedOptionVerified=false;
    const tray=this.box(cassette,[.62,.08,.86],[.02,.48,0],'steel',.008);tray.userData.optionReference=true;this.tag(tray,'output-cassette-family-reference','KATANA_FAMILY_OPTION_BOUNDARY');
    for(const z of [-.40,.40])this.tag(this.box(cassette,[.54,.26,.035],[.06,.59,z],'dark',.008),'output-cassette-side-guide','KATANA_FAMILY_OPTION_BOUNDARY');
   }
   const processor=this.findNode('ctf-processor-boundary');
   if(processor){
    processor.userData.installedOptionVerified=false;processor.userData.simulationEnabled=false;
    const env=this.box(processor,[.42,.38,.90],[.34,.58,0],'glass',.016);env.userData.optionReference=true;this.tag(env,'inline-processor-interface-boundary','OPTION_BOUNDARY');
   }
   const control=this.findNode('ctf-control-boundary');
   if(control){
    control.userData.installedOptionVerified=false;
    const box=this.box(control,[.30,.38,.32],[-.34,.55,.36],'dark',.014);box.userData.optionReference=true;this.tag(box,'rip-control-interface-reference','SCREEN_FTR_KATANA_FAMILY');
    const port=this.box(control,[.08,.08,.08],[-.20,.58,.19],'accent',.004);port.userData.optionReference=true;this.tag(port,'data-interface-generation-boundary','OPTION_BOUNDARY');
   }
  }
 }
 enrichZund(){
  const table=this.activeGroup(1),beam=this.activeGroup(2),car=this.activeGroup(3),tools=this.activeGroup(4),cam=this.activeGroup(5),ctl=this.activeGroup(6);
  if(table){for(let x=-2.25;x<=2.25;x+=.45)for(let z=-.90;z<=.90;z+=.45){const port=this.cyl(table,.012,.015,[x,.635,z],'dark','y');this.tag(port,'vacuum-port');}for(const x of [-2.0,-1.0,0,1.0,2.0])this.tag(this.box(table,[.015,.02,2.15],[x,.63,0],'accent',.001),'vacuum-zone-divider');for(const x of [-1.5,-.5,.5,1.5])this.tag(this.box(table,[.08,.08,.12],[x,.46,1.02],'accent',.006),'vacuum-zone-valve','ZUND_G3_OEM');table.userData.individuallySwitchableVacuumZones=true;}
  if(beam){for(const z of [-1.15,1.15])this.tag(this.box(beam,[4.90,.04,.05],[0,.82,z],'steel',.005),'gantry-linear-guide');this.tag(this.box(beam,[4.60,.025,.035],[0,.77,-1.12],'dark',.003),'rack-reference');}
  if(car){this.tag(this.box(car,[.28,.12,.46],[0,1.05,0],'accent',.012),'module-carrier');for(const z of [-.14,.14])this.tag(this.cyl(car,.025,.36,[0,.96,z],'steel','y'),'z-axis-guide');}
  if(tools){for(const [z,role] of [[-.18,'crease-wheel'],[0,'oscillating-knife'],[.18,'router-tool']]){const t=this.motion(this.cyl(tools,.035,.24,[0,.91,z],role==='oscillating-knife'?'orange':'steel','y'),'press','y',6,.045,z,3);this.tag(t,role);}this.tag(this.box(tools,[.22,.06,.24],[.20,.72,.44],'accent',.008),'iti-initialization-pad','ZUND_G3_OEM');this.tag(this.cyl(tools,.020,.46,[.24,1.06,.34],'dark','y'),'router-dust-extraction-hose','ZUND_ROUTING_FAMILY');tools.userData.arcMagazineCapability='OPTIONAL_ON_G3_NOT_INSTALLED_ASSUMPTION';}
  if(cam){this.tag(this.cyl(cam,.060,.07,[-.12,1.34,-.82],'glass','y'),'icc-camera-lens','ZUND_ICC');this.tag(this.cyl(cam,.090,.025,[-.12,1.27,-.82],'accent','y'),'icc-led-ring','ZUND_ICC');this.tag(this.cyl(cam,.012,.20,[-.12,1.18,-.82],'orange','y'),'icc-laser-pointer-reference','ZUND_ICC');}
  if(ctl){this.tag(this.box(ctl,[.36,.24,.025],[-2.30,.92,-1.69],'glass',.008),'workstation-display');this.tag(this.box(ctl,[.42,.42,.35],[-2.10,.38,-1.30],'dark',.02),'vacuum-generator-interface');}
 }
 enrichCompressor(){
  for(let i=1;i<=7;i++){const a=this.activeGroup(i);if(a)for(const child of [...a.children])if(child.isMesh){child.visible=false;child.userData.referencePlaceholder=true;}}
  const no=this.cfg.machine.no;
  if([29,30,35].includes(no))return this.enrichAtlasCompressor();
  if([31,32,34].includes(no))return this.enrichKaeserCompressor();
  if(no===33)return this.enrichSwanCompressor();
 }
 compressorGroups(){return {
  intake:this.activeGroup(1),motor:this.activeGroup(2),airend:this.activeGroup(3),sep:this.activeGroup(4),
  circuit:this.activeGroup(5),cool:this.activeGroup(6),ctl:this.activeGroup(7)
 };}
 compressorPart(parent,id,name){return parent?this.group(parent,id,name,[0,0,0],[0,.08,.08]):null;}
 enrichAtlasCompressor(){
  const {intake,motor,airend,sep,circuit,cool,ctl}=this.compressorGroups(),E='ATLAS_GA_G_FAMILY_PRIMARY',P=(p,id,n)=>this.compressorPart(p,id,n);
  this.root.userData.detailPass='V123_R3_ATLAS_GA_G_BRAND_FAMILY';
  this.root.userData.referenceBrandFamily='Atlas Copco GA/G oil-injected screw family';
  this.root.userData.exactCompressorModelVerified=false;
  this.root.userData.brandEvidenceBoundary={brand:'ATLAS_COPCO',model:'UNVERIFIED',vsd:'UNVERIFIED',fullFeatureDryer:'UNVERIFIED',receiver:'UNVERIFIED'};
  if(intake){
   const filter=P(intake,'atlas-intake-filter-group','Atlas intake filter');this.tag(this.box(filter,[.28,.32,.28],[0,.78,0],'dark',.02),'atlas-intake-filter',E);
   const inlet=P(intake,'atlas-inlet-valve-group','Atlas load / unload inlet valve');this.tag(this.cyl(inlet,.07,.16,[.12,.58,0],'steel','x'),'atlas-load-unload-inlet-valve',E);
  }
  if(motor){
   const drive=P(motor,'atlas-drive-group','Atlas motor / drive interface');
   for(let x=-.18;x<=.18;x+=.06)this.tag(this.box(drive,[.018,.40,.50],[x,.68,0],'steel',.002),'atlas-motor-cooling-fin',E);
   const coupling=this.motion(this.cyl(drive,.045,.18,[.26,.68,0],'steel','x'),'spin','x',5,.01,0,null);this.tag(coupling,'atlas-drive-interface-reference',E);
  }
  if(airend){
   const ae=P(airend,'atlas-airend-group','Atlas oil-injected screw airend');
   this.tag(this.cyl(ae,.12,.40,[0,.70,-.10],'steel','x'),'atlas-oil-injected-screw-airend',E);
   const shaft=this.motion(this.cyl(ae,.045,.45,[0,.76,.05],'dark','x'),'spin','x',8,.01,0,null);this.tag(shaft,'atlas-airend-shaft-reference',E);
  }
  if(sep){
   const vessel=P(sep,'atlas-separator-group','Atlas oil / air separator');
   this.tag(this.cyl(vessel,.18,.62,[0,.72,0],'steel','y'),'atlas-oil-air-separator-vessel',E);
   this.tag(this.cyl(vessel,.11,.38,[0,.78,0],'filter','y'),'atlas-oil-separator-element',E);
   const mpv=P(sep,'atlas-mpv-group','Atlas minimum pressure valve');this.tag(this.cyl(mpv,.055,.16,[.16,1.05,0],'dark','y'),'atlas-minimum-pressure-valve',E);
  }
  if(circuit){
   const filter=P(circuit,'atlas-oil-filter-group','Atlas oil filter');this.tag(this.cyl(filter,.055,.28,[0,.64,.22],'dark','y'),'atlas-oil-filter',E);
   const thermo=P(circuit,'atlas-thermostat-group','Atlas thermostatic bypass');this.tag(this.box(thermo,[.24,.16,.18],[.12,.86,-.24],'accent',.015),'atlas-thermostatic-bypass-reference',E);
   const ret=P(circuit,'atlas-oil-return-group','Atlas oil return / piping');
   this.tag(this.cyl(ret,.010,.42,[-.10,.88,.18],'steel','y'),'atlas-oil-return-line-reference',E);
   for(const z of [-.28,.28])this.tag(this.cyl(ret,.018,.50,[0,.88,z],'steel','y'),'atlas-oil-air-pipe-reference',E);
  }
  if(cool){
   const ac=P(cool,'atlas-aftercooler-group','Atlas compressed-air aftercooler');this.tag(this.box(ac,[.18,.52,.32],[-.22,.80,-.20],'steel',.008),'atlas-compressed-air-aftercooler',E);
   const oc=P(cool,'atlas-oil-cooler-group','Atlas oil cooler');this.tag(this.box(oc,[.18,.52,.32],[.22,.80,-.20],'steel',.008),'atlas-oil-cooler',E);
   for(let y=.52;y<=1.06;y+=.09){this.tag(this.box(ac,[.025,.035,.34],[-.22,y,-.20],'steel',.002),'atlas-aftercooler-fin',E);this.tag(this.box(oc,[.025,.035,.34],[.22,y,-.20],'steel',.002),'atlas-oil-cooler-fin',E);}
   const cond=P(cool,'atlas-condensate-group','Atlas moisture separation / drain');
   this.tag(this.cyl(cond,.10,.20,[-.18,.48,.34],'steel','y'),'atlas-moisture-separator-reference',E);
   this.tag(this.box(cond,[.12,.18,.12],[.12,.46,.38],'accent',.008),'atlas-electronic-condensate-drain-reference',E);
   const fg=P(cool,'atlas-fan-group','Atlas cooling fan');const fan=this.motion(this.cyl(fg,.17,.08,[.12,1.18,0],'dark','z'),'spin','z',11,.01,0,null);this.tag(fan,'atlas-cooling-fan',E);
  }
  if(ctl){
   const cg=P(ctl,'atlas-controller-group','Atlas Elektronikon controller family');
   const screen=this.tag(this.box(cg,[.24,.18,.025],[-.02,1.02,-.62],'glass',.008),'atlas-elektronikon-controller-reference',E);screen.userData.controllerGenerationVerified=false;
  }
 }
 enrichKaeserCompressor(){
  const {intake,motor,airend,sep,circuit,cool,ctl}=this.compressorGroups(),E='KAESER_SIGMA_FAMILY_PRIMARY',P=(p,id,n)=>this.compressorPart(p,id,n);
  this.root.userData.detailPass='V123_R3_KAESER_SIGMA_BRAND_FAMILY';
  this.root.userData.referenceBrandFamily='KAESER SIGMA fluid-cooled screw family';
  this.root.userData.exactCompressorModelVerified=false;
  this.root.userData.kaeserDriveType='UNVERIFIED_BELT_OR_1_TO_1_DIRECT';
  this.root.userData.brandEvidenceBoundary={brand:'KAESER',model:'UNVERIFIED',drive:'BELT_OR_1_TO_1_DIRECT_UNVERIFIED',controllerGeneration:'UNVERIFIED',integratedDryer:'UNVERIFIED'};
  if(intake){
   const filter=P(intake,'kaeser-intake-filter-group','KAESER dry intake filter');this.tag(this.box(filter,[.28,.32,.28],[0,.78,0],'dark',.02),'kaeser-dry-intake-filter',E);
   const inlet=P(intake,'kaeser-inlet-valve-group','KAESER inlet / vent valve');this.tag(this.cyl(inlet,.07,.16,[.12,.58,0],'steel','x'),'kaeser-inlet-vent-valve-reference',E);
  }
  if(motor){
   const drive=P(motor,'kaeser-drive-group','KAESER motor / drive interface');
   for(let x=-.18;x<=.18;x+=.06)this.tag(this.box(drive,[.018,.40,.50],[x,.68,0],'steel',.002),'kaeser-motor-cooling-fin',E);
   const coupling=this.motion(this.cyl(drive,.055,.22,[.26,.68,0],'steel','x'),'spin','x',5,.01,0,null);this.tag(coupling,'kaeser-drive-interface-reference',E);coupling.userData.installedDriveTypeVerified=false;
  }
  if(airend){
   const ae=P(airend,'kaeser-airend-group','KAESER SIGMA PROFILE airend');
   this.tag(this.cyl(ae,.13,.42,[0,.70,-.08],'steel','x'),'kaeser-sigma-profile-airend',E);
   const shaft=this.motion(this.cyl(ae,.048,.46,[0,.76,.06],'dark','x'),'spin','x',8,.01,0,null);this.tag(shaft,'kaeser-airend-shaft-reference',E);
  }
  if(sep){
   const vessel=P(sep,'kaeser-separator-group','KAESER cooling-fluid separator');
   this.tag(this.cyl(vessel,.19,.64,[0,.72,0],'steel','y'),'kaeser-cooling-fluid-separator-tank',E);
   const cartridge=this.tag(this.cyl(vessel,.105,.34,[0,.80,0],'filter','y'),'kaeser-separator-cartridge-reference',E);cartridge.userData.separatorStageCountVerified=false;
   const mpv=P(sep,'kaeser-mpv-group','KAESER minimum-pressure check valve');this.tag(this.cyl(mpv,.058,.16,[.17,1.05,0],'dark','y'),'kaeser-minimum-pressure-check-valve',E);
  }
  if(circuit){
   const filter=P(circuit,'kaeser-fluid-filter-group','KAESER ECO fluid filter');this.tag(this.cyl(filter,.060,.28,[0,.64,.22],'dark','y'),'kaeser-eco-fluid-filter-reference',E);
   const thermo=P(circuit,'kaeser-thermostat-group','KAESER thermostatic fluid valve');this.tag(this.box(thermo,[.24,.16,.18],[.12,.86,-.24],'accent',.015),'kaeser-thermostatic-fluid-valve-reference',E);
   const lines=P(circuit,'kaeser-fluid-lines-group','KAESER fluid / air circuit');for(const z of [-.28,.28])this.tag(this.cyl(lines,.018,.50,[0,.88,z],'steel','y'),'kaeser-fluid-air-pipe-reference',E);
  }
  if(cool){
   const ac=P(cool,'kaeser-aftercooler-group','KAESER compressed-air aftercooler');this.tag(this.box(ac,[.18,.52,.32],[-.22,.80,-.20],'steel',.008),'kaeser-compressed-air-aftercooler',E);
   const fc=P(cool,'kaeser-fluid-cooler-group','KAESER cooling-fluid cooler');this.tag(this.box(fc,[.18,.52,.32],[.22,.80,-.20],'steel',.008),'kaeser-fluid-cooler',E);
   const cond=P(cool,'kaeser-condensate-group','KAESER centrifugal separator / ECO-DRAIN');
   this.tag(this.cyl(cond,.11,.20,[-.17,.48,.34],'steel','y'),'kaeser-centrifugal-separator-reference',E);
   this.tag(this.box(cond,[.12,.18,.12],[.12,.46,.38],'accent',.008),'kaeser-eco-drain-reference',E);
   const fg=P(cool,'kaeser-fan-group','KAESER cooling fan');const fan=this.motion(this.cyl(fg,.18,.08,[.12,1.18,0],'dark','z'),'spin','z',10,.01,0,null);this.tag(fan,'kaeser-cooling-fan-reference',E);
  }
  if(ctl){
   const cg=P(ctl,'kaeser-controller-group','KAESER SIGMA CONTROL family');
   const screen=this.tag(this.box(cg,[.25,.19,.025],[-.02,1.02,-.62],'glass',.008),'kaeser-sigma-control-family-reference',E);screen.userData.controllerGenerationVerified=false;
  }
 }
 enrichSwanCompressor(){
  const {intake,motor,airend,sep,circuit,cool,ctl}=this.compressorGroups(),E='SWAN_TS_AD_TMV_FAMILY_PRIMARY',P=(p,id,n)=>this.compressorPart(p,id,n);
  this.root.userData.detailPass='V123_R3_SWAN_TSAD_TMV_BRAND_FAMILY';
  this.root.userData.referenceBrandFamily='SWAN TS-AD / TMV screw family';
  this.root.userData.exactCompressorModelVerified=false;
  this.root.userData.installedSwanSeriesVerified=false;
  this.root.userData.brandEvidenceBoundary={brand:'SWAN',model:'UNVERIFIED',series:'TS_AD_OR_TMV_UNVERIFIED',drive:'COUPLING_OR_PM_DIRECT_UNVERIFIED',vfd:'UNVERIFIED'};
  if(intake){
   const filter=P(intake,'swan-intake-filter-group','SWAN air filter assembly');this.tag(this.box(filter,[.28,.32,.28],[0,.78,0],'dark',.02),'swan-air-filter-assembly',E);
   const inlet=P(intake,'swan-inlet-group','SWAN inlet interface');this.tag(this.cyl(inlet,.07,.16,[.12,.58,0],'steel','x'),'swan-inlet-interface-reference',E);
  }
  if(motor){
   const drive=P(motor,'swan-drive-group','SWAN drive interface');
   for(let x=-.18;x<=.18;x+=.06)this.tag(this.box(drive,[.018,.40,.50],[x,.68,0],'steel',.002),'swan-motor-cooling-reference',E);
   const coupling=this.motion(this.cyl(drive,.055,.22,[.26,.68,0],'steel','x'),'spin','x',5,.01,0,null);this.tag(coupling,'swan-drive-interface-reference',E);coupling.userData.installedDriveTypeVerified=false;
  }
  if(airend){
   const ae=P(airend,'swan-airend-group','SWAN screw airend');
   this.tag(this.cyl(ae,.13,.42,[0,.70,-.08],'steel','x'),'swan-screw-airend',E);
   const shaft=this.motion(this.cyl(ae,.048,.46,[0,.76,.06],'dark','x'),'spin','x',8,.01,0,null);this.tag(shaft,'swan-airend-shaft-reference',E);
  }
  if(sep){
   const sg=P(sep,'swan-separation-group','SWAN oil / air separation package boundary');
   const pkg=this.tag(this.cyl(sg,.18,.58,[0,.72,0],'steel','y'),'swan-oil-air-separation-package-reference','SWAN_BRAND_FAMILY_INTERNAL_BOUNDARY');pkg.userData.internalSeparatorTopologyVerified=false;
  }
  if(circuit){
   const cg=P(circuit,'swan-circuit-group','SWAN oil / air service circuit');
   this.tag(this.cyl(cg,.050,.27,[0,.64,.22],'dark','y'),'swan-oil-circuit-service-reference','SWAN_BRAND_FAMILY_INTERNAL_BOUNDARY');
   for(const z of [-.28,.28])this.tag(this.cyl(cg,.016,.48,[0,.88,z],'steel','y'),'swan-oil-air-line-reference','SWAN_BRAND_FAMILY_INTERNAL_BOUNDARY');
  }
  if(cool){
   const cooler=P(cool,'swan-cooler-group','SWAN built-in oil / air cooler');this.tag(this.box(cooler,[.34,.52,.34],[0,.80,-.20],'steel',.008),'swan-built-in-oil-air-cooler',E);
   const fg=P(cool,'swan-fan-group','SWAN cooling fan');const fan=this.motion(this.cyl(fg,.18,.08,[.12,1.18,0],'dark','z'),'spin','z',10,.01,0,null);this.tag(fan,'swan-cooling-fan-reference',E);
  }
  if(ctl){
   const cg=P(ctl,'swan-controller-group','SWAN smart control panel');this.tag(this.box(cg,[.25,.19,.025],[-.02,1.02,-.62],'glass',.008),'swan-smart-control-panel-reference',E);
   const vg=P(ctl,'swan-vfd-option-group','SWAN TMV VFD option boundary');
   const vfd=this.tag(this.box(vg,[.18,.30,.16],[.13,.62,.35],'accent',.012),'swan-vfd-controller-option-reference','SWAN_TMV_OPTION_BOUNDARY');
   vfd.userData.installedOptionVerified=false;vfd.userData.boundary='TMV variable-frequency family capability; BMJ Compressor No.7 series is not verified.';
  }
 }
 enrichSansin(){
  const inlet=this.activeGroup(1),filter=this.activeGroup(2),coil=this.activeGroup(3),supply=this.activeGroup(4),outdoor=this.activeGroup(5),circuit=this.activeGroup(6),ctl=this.activeGroup(7);
  this.root.userData.sansinBoundary='Brand-specific PT Sansin/NES family morphology only; exact YZKJ model/capacity is not asserted.';
  if(inlet)for(const y of [.58,.86,1.14,1.42]){const d=this.box(inlet,[.055,.055,1.30],[0,y,0],'steel',.004);d.rotation.z=-.18;this.tag(d,'return-inlet-damper');}
  if(filter)for(const x of [-.16,.16])this.tag(this.box(filter,[.055,1.38,1.30],[x,1.10,0],'filter',.004),'filter-bank');
  if(coil){for(let y=.54;y<=1.62;y+=.11)this.tag(this.box(coil,[.05,.025,1.24],[0,y,0],'blue',.002),'heat-exchange-fin');for(const z of [-.52,.52])this.tag(this.cyl(coil,.035,.18,[.25,1.06,z],'accent','z'),'coil-header');}
  if(supply){const w=this.motion(this.cyl(supply,.40,.22,[0,1.12,0],'dark','z'),'spin','z',7,.01,0,null);this.tag(w,'indoor-supply-fan');this.tag(this.cyl(supply,.10,.30,[.34,.76,.52],'dark','x'),'fan-motor');}
  if(outdoor){for(const z of [-.50,.50]){const cf=this.motion(this.cyl(outdoor,.25,.09,[0,1.46,z],'dark','z'),'spin','z',8,.01,z,null);this.tag(cf,'outdoor-condenser-fan');}this.tag(this.cyl(outdoor,.13,.48,[.20,.60,0],'dark','y'),'compressor-reference');for(let y=.46;y<=1.30;y+=.10)this.tag(this.box(outdoor,[.04,.025,1.22],[-.24,y,0],'steel',.002),'condenser-fin');}
  if(circuit){for(const z of [-.36,.36])this.tag(this.cyl(circuit,.020,.82,[0,.76,z],'blue','y'),'refrigerant-water-line-reference');this.tag(this.box(circuit,[.28,.20,.20],[.18,.56,.30],'accent',.015),'valve-manifold');}
  if(ctl){this.tag(this.box(ctl,[.32,.24,.025],[-.02,1.02,.31],'glass',.008),'cooling-controller');this.tag(this.box(ctl,[.38,.42,.30],[0,.56,.48],'dark',.02),'electrical-panel');}
 }
 enrichAHU(sansin=false){
  if(sansin)return this.enrichSansin();
  const intake=this.activeGroup(1),filter=this.activeGroup(2),coil=this.activeGroup(3),drain=this.activeGroup(4),fan=this.activeGroup(5),service=this.activeGroup(6),out=this.activeGroup(7);
  if(intake)for(const y of [.55,.80,1.05,1.30,1.55]){const d=this.box(intake,[.055,.055,1.34],[0,y,0],'steel',.004);d.rotation.z=-.18;this.tag(d,'opposed-blade-damper');}
  if(filter){for(const x of [-.20,0,.20]){const f=this.box(filter,[.055,1.38,1.38],[x,1.02,0],'filter',.004);f.rotation.y=x<0?.12:x>0?-.12:0;this.tag(f,'filter-bank');}}
  if(coil){for(let y=.48;y<=1.50;y+=.10)this.tag(this.box(coil,[.045,.025,1.30],[0,y,0],'steel',.002),'coil-fin');for(const z of [-.55,.55])this.tag(this.cyl(coil,.035,.16,[.26,.98,z],'accent','z'),'coil-header');}
  if(drain){this.tag(this.box(drain,[.72,.06,1.42],[0,.38,0],'steel',.008),'drain-pan');this.tag(this.cyl(drain,.025,.42,[.28,.25,.55],'dark','y'),'condensate-trap-reference');}
  if(fan){const wheel=this.motion(this.cyl(fan,.40,.22,[0,1.05,0],'dark','z'),'spin','z',7,.01,0,null);this.tag(wheel,'supply-fan-wheel');for(let k=0;k<10;k++){const blade=this.box(fan,[.30,.025,.07],[0,1.05,0],'steel',.003);blade.rotation.z=k*Math.PI/5;this.tag(blade,'fan-blade');}this.tag(this.cyl(fan,.10,.32,[.34,.75,.55],'dark','x'),'fan-motor');}
  if(service){this.tag(this.box(service,[.70,.92,.035],[0,1.02,-.92],'body',.018),'service-door');this.tag(this.cyl(service,.018,.30,[.27,1.02,-.95],'dark','y'),'door-handle');}
  if(out){this.tag(this.box(out,[.60,1.25,1.36],[.08,1.02,0],'accent',.015),'discharge-plenum');this.tag(this.box(out,[.24,.18,.025],[-.12,1.30,-.72],'glass',.008),'ahu-controller');}
 }

 build(){
  const no=this.cfg.machine.no;
  this.root.userData.geometryStatus='REFERENCE_GROUNDED_FAMILY__NOT_SERIAL_SPECIFIC';
  if(no===4)return this.buildGravure();
  if(no===17)return this.buildFolderGluer();
  if(no===21)return this.buildBlanker();
  if(no===23)return this.buildCollator();
  if(no===25||no===26)return this.buildCTP();
  if(no===27)return this.buildImagesetter();
  if(no===28)return this.buildZundReference();
  if(no>=29&&no<=35)return this.buildCompressorReference();
  if(no>=36&&no<=41)return this.buildAirHandlerReference(no===40);
  return super.build();
 }
 buildGravure(){
  this.palette.body=0xe7e8e4;this.palette.dark=0x1f2528;this.palette.accent=0x315e64;this.palette.orange=0xb45d36;
  this.base(7.25,2.45);
  // YA1A1A is exact identity; geometry follows documented YA1A1 sheetfed size class and later YA1B1 mechanical family.
  const m1=this.mod(1,[-3.0,0,0],[-.55,.15,0]);
  for(const x of [-.49,.49]){const post=this.cover(this.box(m1.g,[.18,1.42,2.00],[x,.88,0],'body',.035));post.userData.visualRole='YA1A1A_FEEDER_PORTAL_UPRIGHT';}
  const feederTop=this.cover(this.box(m1.g,[1.16,.28,2.00],[0,1.58,0],'body',.035));feederTop.userData.visualRole='YA1A1A_FEEDER_TOP_FASCIA';
  this.box(m1.g,[1.10,.12,1.96],[0,.22,0],'dark',.02);
  this.box(m1.a,[.82,.06,1.35],[-.08,.50,0],'paper',.006);
  for(const z of [-.50,-.18,.18,.50])this.motion(this.cyl(m1.a,.055,.72,[.35,.78,z],'steel','x'),'spin','x',7,.04,0,0);
  const m2=this.mod(2,[-2.05,0,0],[-.38,.18,0]);
  this.box(m2.g,[1.38,.10,1.55],[0,.68,0],'body',.02);
  for(const z of [-.56,.56])this.box(m2.a,[1.15,.05,.06],[0,.82,z],'steel',.008);
  this.motion(this.box(m2.a,[.18,.09,1.22],[.15,.87,0],'accent',.01),'oscillate','z',8,.10,0,1);
  const m3=this.mod(3,[-.65,0,0],[-.20,.24,.26]);
  m3.g.userData.coLocatedPrintingStation=true;
  const pan=this.box(m3.a,[.88,.18,1.30],[0,.50,0],'dark',.02);pan.userData.inkPan=true;
  this.motion(this.cyl(m3.a,.25,1.38,[0,.89,0],'orange','z'),'spin','z',3.8,.05,0,2);
  this.cyl(m3.a,.045,.95,[.40,.58,.70],'steel','y');
  const m4=this.mod(4,[-.65,0,0],[0,.28,.28]);
  m4.g.userData.printingStationFrame=true;
  for(const z of [-1.03,1.03]){
   for(const x of [-.63,.63]){const column=this.cover(this.box(m4.g,[.25,1.68,.12],[x,1.15,z],'body',.025));column.userData.visualRole='YA1A1A_PRINT_PORTAL_COLUMN';}
   const sideTop=this.cover(this.box(m4.g,[1.50,.30,.12],[0,2.00,z],'body',.025));sideTop.userData.visualRole='YA1A1A_PRINT_TOP_SIDE_FASCIA';
   const lower=this.cover(this.box(m4.g,[1.50,.38,.12],[0,.46,z],'dark',.02));lower.userData.visualRole='YA1A1A_PRINT_LOWER_SIDE_GUARD';
  }
  const printTop=this.cover(this.box(m4.g,[1.52,.28,2.02],[0,2.04,0],'body',.03));printTop.userData.visualRole='YA1A1A_PRINT_TOP_BRIDGE';
  const grav=this.motion(this.cyl(m4.a,.30,1.42,[0,.88,0],'orange','z'),'spin','z',4.4,.06,0,3);
  grav.userData.gravureCylinder=true;
  const blade=this.motion(this.box(m4.a,[.62,.045,1.46],[.18,1.16,0],'steel',.008),'oscillate','z',10,.035,0,3);blade.rotation.z=-.20;blade.userData.doctorBlade=true;
  const m5=this.mod(5,[-.65,0,0],[.20,.28,.25]);
  m5.g.userData.coLocatedPrintingStation=true;
  const imp=this.motion(this.cyl(m5.a,.31,1.42,[0,1.18,0],'steel','z'),'spin','z',-4.4,.06,0,4);imp.userData.impressionCylinder=true;
  this.motion(this.cyl(m5.a,.11,1.48,[.10,.68,0],'dark','z'),'spin','z',5.6,.03,0,4);
  const m6=this.mod(6,[.85,0,0],[.32,.25,0]);
  const dryerTop=this.cover(this.box(m6.g,[1.18,.52,2.12],[0,1.88,0],'body',.035));dryerTop.userData.visualRole='YA1A1A_DRYER_CANOPY';
  for(const z of [-1.00,1.00]){const side=this.cover(this.box(m6.g,[1.10,1.30,.12],[0,1.05,z],'body',.025));side.userData.visualRole='YA1A1A_DRYER_SIDE_PANEL';}
  for(const y of [.72,1.05,1.38,1.72]){const heater=this.box(m6.a,[.74,.035,1.25],[0,y,0],'orange',.005);heater.userData.dryerElement=true;}
  for(const z of [-.56,.56])this.motion(this.cyl(m6.a,.16,.10,[.25,1.95,z],'dark','z'),'spin','z',9,.02,0,5);
  const m7=this.mod(7,[2.20,0,0],[.50,.16,0]);
  for(const x of [-.45,.45]){const post=this.cover(this.box(m7.g,[.18,1.46,1.92],[x,.88,0],'body',.03));post.userData.visualRole='YA1A1A_DELIVERY_PORTAL_UPRIGHT';}
  const deliveryTop=this.cover(this.box(m7.g,[1.05,.28,1.92],[0,1.58,0],'body',.03));deliveryTop.userData.visualRole='YA1A1A_DELIVERY_TOP_FASCIA';
  for(const y of [.62,.88,1.15])this.motion(this.cyl(m7.a,.075,1.35,[-.10,y,0],'steel','z'),'spin','z',5,.02,0,6);
  this.box(m7.a,[.76,.035,1.18],[.18,.52,0],'paper',.004);
  const m8=this.mod(8,[-.35,0,0],[.62,.15,0]);
  this.box(m8.g,[.54,1.45,.78],[0,.80,.78],'dark',.04);this.box(m8.a,[.32,.22,.025],[-.05,1.12,.38],'glass',.01);
  this.motion(this.cyl(m8.a,.10,.34,[0,.48,.70],'steel','x'),'spin','x',4,.02,0,null);
  this.root.userData.exteriorMorphology='YA1A1A_650x920_VISUAL_REFERENCE__YA1A1C_YA1B1_SUCCESSOR_FAMILY';
  this.root.userData.visualBoundary='Third-party exact-model photo and OEM successor-family images guide silhouette only. Color, service hoist, duct routing and installed covers on the BMJ asset remain unverified.';
  this.root.userData.referenceNote='YA1A1A identity is exact to the BMJ registry and independent equipment references. The exterior is rebuilt from a YA1A1A 650×920 installed-machine photo plus YA1A1C/YA1B1 successor-family OEM morphology; internal mechanics use sheet-fed gravure primary references. No serial-specific BMJ option is invented.';
 }
 buildFolderGluer(){
  this.palette.body=0xe8e8e3;this.palette.accent=0x3d735d;this.palette.dark=0x273034;
  this.base(11.7,1.95);
  const xs=[-5.0,-3.45,-1.75,0,1.75,3.55,5.0];
  for(let i=1;i<=7;i++){
   const {g,a}=this.mod(i,[xs[i-1],0,0],[Math.sign(xs[i-1]||1)*.45,.20,0]);
   for(const z of [-.72,.72]){this.box(g,[1.35,.08,.08],[0,.65,z],'steel',.012);this.box(g,[.08,.72,.08],[-.54,.62,z],'steel',.012);}
   if(i===1){this.shell(g,[1.35,.65,1.72],[0,.54,0]);for(const z of [-.52,-.26,0,.26,.52])this.motion(this.cyl(a,.055,.18,[.26,.72,z],'dark','z'),'spin','z',8,.02,0,0);}
   else if(i<=4){for(const z of [-.52,-.18,.18,.52]){const belt=this.box(a,[1.35,.035,.09],[0,.78,z],'dark',.005);belt.userData.transportBelt=true;}for(const z of [-.58,.58]){const rail=this.box(a,[1.28,.045,.045],[0,1.03,z],'steel',.006);rail.rotation.z=z<0?.12:-.12;}if(i===3)this.motion(this.box(a,[.28,.20,.08],[.32,1.02,.48],'accent',.015),'oscillate','z',5,.12,0,2);}
   else if(i===5){this.box(a,[1.34,.05,.05],[0,1.20,0],'steel',.006);for(const z of [-.45,.45]){const d=this.motion(this.cyl(a,.12,.055,[-.18,.86,z],'orange','z'),'spin','z',5,.02,0,4);d.userData.glueDisc=true;}}
   else if(i===6){for(const y of [.76,1.01])for(const z of [-.50,-.16,.16,.50])this.box(a,[1.38,.04,.09],[0,y,z],'dark',.005);}
   else {for(const z of [-.50,-.16,.16,.50])this.motion(this.cyl(a,.06,.14,[0,.80,z],'dark','z'),'spin','z',6,.02,0,6);this.shell(g,[1.30,.58,1.70],[0,.62,0]);}
  }
  this.root.userData.referenceNote='FGM-2 model is absent from the BMJ registry; morphology follows the nearest installed MEDIA 100 II family used by FGM-1 and FGM-3, not an exact-model claim.';
 }
 buildBlanker(){
  this.palette.body=0xf2f1ed;this.palette.dark=0x34393b;this.palette.accent=0x4b7782;this.palette.orange=0xc56d38;this.palette.blue=0x477b9a;
  this.base(4.31,1.75);

  const m1=this.mod(1,[-1.55,0,0],[-.42,.16,0]);
  const table=this.group(m1.a,'qf100-stack-table','Stack support table',[0,0,0],[0,.08,.10]);
  this.box(table,[.95,.10,1.25],[0,.54,0],'steel',.012);
  for(const z of [-.56,.56])this.box(table,[.92,.045,.055],[0,.64,z],'dark',.005);
  const guides=this.group(m1.a,'qf100-stack-guides','Stack guides',[0,0,0],[0,.10,.12]);
  for(const z of [-.50,.50])this.box(guides,[.08,.42,.06],[-.24,.84,z],'steel',.006);
  const ss=this.group(m1.a,'qf100-stack-sensors','Stack sensing',[0,0,0],[0,.10,.12]);
  for(const z of [-.46,.46])this.box(ss,[.055,.10,.055],[.34,.72,z],'blue',.006);

  const m2=this.mod(2,[0,0,0],[0,.22,.20]);
  const platform=this.group(m2.a,'qf100-platform','X/Y moving work platform',[0,0,0],[0,.12,.12]);
  const platformPlate=this.active(this.box(platform,[1.65,.10,1.28],[0,.72,0],'steel',.012));platformPlate.userData.servoPlatform=true;
  for(const z of [-.56,.56])this.box(platform,[1.55,.055,.055],[0,.63,z],'dark',.005);
  const xAxis=this.group(m2.a,'qf100-x-axis','X-axis drive',[0,0,0],[.12,.08,.10]);
  const yAxis=this.group(m2.a,'qf100-y-axis','Y-axis drive',[0,0,0],[-.12,.08,.10]);
  const posSense=this.group(m2.a,'qf100-position-sensors','Position feedback',[0,0,0],[0,.10,.12]);
  xAxis.userData.familyMechanism='SERVO_BALL_SCREW_LINEAR_GUIDE';yAxis.userData.familyMechanism='SERVO_BALL_SCREW_LINEAR_GUIDE';posSense.userData.familyMechanism='PHOTOELECTRIC_POSITION_LIMIT';

  const m3=this.mod(3,[0,0,0],[0,.32,.20]);
  const frame=this.group(m3.g,'qf100-head-frame','Fixed gantry head frame',[0,0,0],[0,.18,.12]);
  for(const x0 of [-1.72,1.72]){const col=this.cover(this.box(frame,[.22,1.55,.18],[x0,1.02,0],'body',.025));col.userData.visualRole='QF_FAMILY_GANTRY_COLUMN';}
  const beam=this.cover(this.box(frame,[3.65,.54,1.62],[0,1.76,0],'body',.035));beam.userData.visualRole='QF_FAMILY_GANTRY_TOP_BEAM';
  for(const z of [-.77,.77]){const rail=this.cover(this.box(frame,[3.55,.16,.08],[0,1.42,z],'body',.018));rail.userData.visualRole='QF_FAMILY_OPEN_WORKING_BAY_RAIL';}
  const ram=this.group(m3.a,'qf100-head-ram','Fixed hydraulic blanking ram',[0,0,0],[0,.18,.12]);
  const headGuides=this.group(m3.a,'qf100-head-guides','Hydraulic ram guidance',[0,0,0],[0,.18,.12]);
  ram.userData.modeledReferenceHeadCount=1;ram.userData.installedHeadCountVerified=false;

  const m4=this.mod(4,[0,0,0],[0,.28,.26]);
  const board=this.group(m4.a,'qf100-pin-board','Honeycomb pin-board',[0,0,0],[0,.15,.16]);
  const pins=this.group(m4.a,'qf100-tooling-pins','Blanking pins',[0,0,0],[0,.16,.18]);
  const lock=this.group(m4.a,'qf100-tooling-lock','Pin-board retention',[0,0,0],[0,.15,.18]);
  board.userData.installedPatternVerified=false;pins.userData.installedPatternVerified=false;

  const m5=this.mod(5,[0,0,0],[0,.24,.24]);
  const sep=this.group(m5.a,'qf100-separation-interface','Blank / waste separation interface',[0,0,0],[0,.13,.16]);
  const waste=this.group(m5.a,'qf100-waste-support','Waste-frame support',[0,0,0],[0,.13,.16]);

  const m6=this.mod(6,[1.58,0,0],[.38,.16,0]);
  const tray=this.group(m6.a,'qf100-receiving-tray','Product receiving interface',[0,0,0],[.12,.10,0]);
  const collector=this.group(m6.a,'qf100-collector-option','Automatic collector / stacker option boundary',[0,0,0],[.18,.12,0]);
  collector.userData.installedOptionVerified=false;

  const m7=this.mod(7,[-1.73,0,.58],[-.38,.16,.12]);
  const hmi=this.group(m7.a,'qf100-hmi','Operator HMI',[0,0,0],[0,.12,.12]);
  const hyd=this.group(m7.a,'qf100-hydraulic-unit','Hydraulic power unit',[0,0,0],[0,.12,.12]);
  const plc=this.group(m7.a,'qf100-plc-cabinet','PLC / servo cabinet',[0,0,0],[0,.12,.12]);
  this.cover(this.box(m7.g,[.52,1.52,.62],[0,.86,0],'body',.035));

  this.root.userData.familyVisualEnvelope=[4.31,1.75,1.95];
  this.root.userData.familyVisualEnvelopeSource='LQF-1080CS_CLOSE_FAMILY_ONLY';
  this.root.userData.engineeringDimensions=false;
  this.root.userData.simulationBinding={
   type:'XY_PLATFORM_FIXED_HYDRAULIC_HEAD',
   platform:'qf100-platform',ram:'qf100-head-ram',separation:'qf100-separation-interface',
   receiving:'qf100-receiving-tray',xAxis:'qf100-x-axis',yAxis:'qf100-y-axis'
  };
  this.root.userData.referenceNote='ABM-2 remains identified as QF-100CS from the BMJ registry. Public exact-model documentation is not available. The reconstructed silhouette and mechanisms follow QF/LQF-1080 family sources: long open gantry working bay, X/Y servo platform, stable hydraulic head, configurable pin-board tooling and PLC/HMI. Dual-head and automatic collector/stacker remain explicit option boundaries.';
 }
 buildCollator(){
  this.palette.body=0xe9e8e2;this.palette.dark=0x282f34;this.palette.accent=0x3e7c8b;this.palette.blue=0x4d7f9a;
  this.base(2.15,1.45);

  const m1=this.mod(1,[-.62,0,0],[-.35,.20,0]);
  for(const z of [-.61,.61]){this.cover(this.box(m1.g,[.12,1.92,.10],[-.48,1.02,z],'body',.016));this.cover(this.box(m1.g,[.12,1.92,.10],[.48,1.02,z],'body',.016));}
  this.cover(this.box(m1.g,[1.08,.12,1.30],[0,1.95,0],'body',.02));
  this.cover(this.box(m1.g,[1.08,.12,1.30],[0,.16,0],'dark',.02));
  this.group(m1.a,'collator-bin-trays','Feed bin trays',[0,0,0],[0,.10,.10]);
  this.group(m1.a,'collator-suction-feeds','Suction rotor feed modules',[0,0,0],[0,.12,.12]);
  this.group(m1.a,'collator-bin-air','Per-bin air separation',[0,0,0],[0,.12,.12]);

  const m2=this.mod(2,[.10,0,.44],[0,.22,.20]);
  this.cover(this.box(m2.g,[.46,1.52,.48],[0,.82,0],'body',.026));
  this.group(m2.a,'collator-vacuum-blower','Vacuum blower',[0,0,0],[0,.10,.12]);
  this.group(m2.a,'collator-vacuum-manifold','Vacuum distribution manifold',[0,0,0],[0,.10,.12]);

  const m3=this.mod(3,[.28,0,0],[.18,.20,0]);
  this.group(m3.a,'collator-double-feed','Double / miss feed detection',[0,0,0],[0,.10,.12]);
  this.group(m3.a,'collator-bin-empty','Bin-empty / sheet-presence detection',[0,0,0],[0,.10,.12]);

  const m4=this.mod(4,[.58,0,0],[.28,.18,0]);
  this.cover(this.box(m4.g,[.48,1.56,1.10],[0,.86,0],'body',.025));
  this.group(m4.a,'collator-gather-guide','Vertical gathering guide',[0,0,0],[0,.12,.12]);
  this.group(m4.a,'collator-gather-drive','Gathering transport drive',[0,0,0],[0,.12,.12]);

  const m5=this.mod(5,[1.10,0,0],[.38,.15,0]);
  this.cover(this.box(m5.g,[.82,.42,1.14],[0,.36,0],'body',.025));
  this.group(m5.a,'collator-delivery-belt','Set delivery conveyor',[0,0,0],[.10,.10,0]);
  this.group(m5.a,'collator-set-jogger','Set jogger',[0,0,0],[.12,.10,.10]);
  this.group(m5.a,'collator-downstream-boundary','Downstream finisher boundary',[0,0,0],[.16,.10,0]);

  const m6=this.mod(6,[1.60,0,.44],[.46,.16,.12]);
  this.cover(this.box(m6.g,[.52,1.06,.62],[0,.61,0],'dark',.035));
  this.group(m6.a,'collator-hmi','Operator touchscreen',[0,0,0],[0,.12,.10]);
  this.group(m6.a,'collator-control-io','Bin control / I-O',[0,0,0],[0,.12,.10]);

  this.root.userData.modeledReferenceBinCount=10;
  this.root.userData.installedBinCountVerified=false;
  this.root.userData.exactCollatorOemVerified=false;
  this.root.userData.exactCollatorModelVerified=false;
  this.root.userData.referenceNote='BMJ registry provides no collator OEM/model/serial/bin count. Geometry is a multi-vendor process intersection: Horizon VAC and Duplo suction-collator families plus vertical-collator mechanism patents. Ten displayed bins are a modeled cross-family reference, not an installed BMJ claim.';
 }
 buildCTP(){
  this.palette.body=0xe4e6e4;this.palette.dark=0x292f33;this.palette.accent=0x607784;this.palette.blue=0x4f809a;
  this.base(2.65,1.72);
  const shell=this.group(this.root,'ctp-family-envelope','Suprasetter family basic-unit envelope',[0,0,0],[0,.18,0]);
  this.cover(this.box(shell,[2.52,1.30,1.58],[0,.80,0],'body',.08));
  this.cover(this.box(shell,[2.20,.38,1.50],[-.05,1.47,0],'body',.07));
  this.cover(this.box(shell,[1.36,.48,1.62],[-.35,.42,0],'dark',.05));
  shell.userData.visualBoundary='MULTI_MODEL_SUPRASETTER_FAMILY_SILHOUETTE_NOT_MODEL_IDENTIFICATION';

  const m1=this.mod(1,[-.84,0,0],[-.34,.18,0]);
  this.group(m1.a,'ctp-manual-entry','Manual plate entry',[0,0,0],[0,.10,.10]);
  const loader=this.group(m1.a,'ctp-loader-boundary','Automatic loader family boundary',[0,0,0],[-.16,.12,0]);loader.userData.installedOptionVerified=false;

  const m2=this.mod(2,[-.42,0,0],[-.20,.18,0]);
  this.group(m2.a,'ctp-transport','Plate transport',[0,0,0],[0,.10,.12]);
  this.group(m2.a,'ctp-register','Plate registration / sensing',[0,0,0],[0,.10,.12]);

  const m3=this.mod(3,[.08,0,0],[0,.24,.20]);
  this.group(m3.a,'ctp-drum','External imaging drum',[0,0,0],[0,.14,.16]);
  this.group(m3.a,'ctp-drum-clamp','Plate clamp system',[0,0,0],[0,.14,.16]);

  const m4=this.mod(4,[.08,0,0],[0,.30,.25]);
  this.group(m4.a,'ctp-laser-rail','Laser carriage rail',[0,0,0],[0,.16,.20]);
  this.group(m4.a,'ctp-laser-module','HEIDELBERG laser module family',[0,0,0],[0,.18,.22]);
  this.group(m4.a,'ctp-ids','Intelligent Diode System',[0,0,0],[0,.18,.22]);

  const m5=this.mod(5,[.08,0,0],[0,.32,-.22]);
  const punch=this.group(m5.a,'ctp-punch-option','Internal punch option boundary',[0,0,0],[0,.20,-.22]);punch.userData.installedOptionVerified=false;

  const m6=this.mod(6,[.86,0,0],[.34,.18,0]);
  this.group(m6.a,'ctp-unload','Plate unload path',[0,0,0],[.12,.10,0]);
  const processor=this.group(m6.a,'ctp-processor-boundary','Processor / stacker boundary',[0,0,0],[.18,.12,0]);processor.userData.installedOptionVerified=false;
  const debris=this.group(m6.a,'ctp-debris-option','Debris removal option',[0,0,0],[.14,.16,.16]);debris.userData.installedOptionVerified=false;
  const temp=this.group(m6.a,'ctp-temp-stabilizer-option','Temperature stabilization capability',[0,0,0],[.14,.16,-.16]);temp.userData.installedOptionVerified=false;

  this.root.userData.exactSuprasetterModelVerified=false;
  this.root.userData.familyCandidates=['A52','A75','A106','106'];
  this.root.userData.installedLoaderTypeVerified=false;
  this.root.userData.referenceNote='BMJ records Heidelberg CTP but not exact Suprasetter model. Exterior is deliberately a multi-model family silhouette, while internal selectable mechanics distinguish verified-common Suprasetter process elements from model-dependent or optional loader, punch, debris-removal and temperature-stabilization capabilities.';
 }
 buildImagesetter(){
  this.palette.body=0xe7e7e3;this.palette.dark=0x33383c;this.palette.accent=0x497f9b;this.palette.blue=0x577f9a;
  this.base(2.20,1.18);

  const shell=this.group(this.root,'ctf-family-envelope','SCREEN FT-R / Katana family envelope',[0,0,0],[0,.18,0]);
  this.cover(this.box(shell,[2.05,1.05,1.10],[0,.69,0],'body',.07));
  this.cover(this.box(shell,[1.72,.24,1.05],[.04,1.28,0],'body',.05));
  shell.userData.visualBoundary='MULTI_MODEL_SCREEN_FTR_KATANA_SILHOUETTE_NOT_MODEL_IDENTIFICATION';

  const m1=this.mod(1,[-.72,0,0],[-.32,.18,0]);
  this.group(m1.a,'ctf-media-cassette','Media supply cassette',[0,0,0],[-.12,.10,0]);
  this.group(m1.a,'ctf-auto-load','Automatic media loading',[0,0,0],[0,.10,.12]);

  const m2=this.mod(2,[-.30,0,0],[-.20,.18,0]);
  this.group(m2.a,'ctf-capstan','Capstan transport',[0,0,0],[0,.12,.12]);
  this.group(m2.a,'ctf-front-slack','Front slack zone',[0,0,0],[0,.14,.16]);
  this.group(m2.a,'ctf-gravity-roller','Gravity tension roller',[0,0,0],[0,.14,.16]);
  this.group(m2.a,'ctf-rear-slack','Rear slack zone',[0,0,0],[0,.14,.16]);

  const m3=this.mod(3,[.10,0,0],[0,.24,.20]);
  this.group(m3.a,'ctf-polygon-mirror','Polygon mirror scanner',[0,0,0],[0,.16,.18]);
  this.group(m3.a,'ctf-polygon-drive','Polygon scanner drive',[0,0,0],[0,.16,.18]);

  const m4=this.mod(4,[.10,0,0],[0,.30,-.20]);
  this.group(m4.a,'ctf-laser-source','Laser source',[0,0,0],[0,.18,-.18]);
  this.group(m4.a,'ctf-optics','Beam shaping / focus optics',[0,0,0],[0,.18,.20]);
  this.group(m4.a,'ctf-laser-modulator','Laser modulation',[0,0,0],[0,.18,.20]);

  const m5=this.mod(5,[.50,0,0],[.22,.18,0]);
  this.group(m5.a,'ctf-cutter','Media cutter',[0,0,0],[.12,.12,0]);
  const punch=this.group(m5.a,'ctf-punch-option','Punch option boundary',[0,0,0],[.14,.14,.12]);punch.userData.installedOptionVerified=false;

  const m6=this.mod(6,[.82,0,0],[.34,.18,0]);
  const cassette=this.group(m6.a,'ctf-output-cassette','Output cassette family reference',[0,0,0],[.12,.10,0]);cassette.userData.installedOptionVerified=false;
  const processor=this.group(m6.a,'ctf-processor-boundary','Inline processor boundary',[0,0,0],[.18,.12,0]);processor.userData.installedOptionVerified=false;
  const control=this.group(m6.a,'ctf-control-boundary','RIP / control boundary',[0,0,0],[.16,.12,.12]);control.userData.installedOptionVerified=false;

  this.root.userData.exactScreenModelVerified=false;
  this.root.userData.familyCandidates=['FT-R3035','FT-R3050','Katana 5040','Katana 5055'];
  this.root.userData.installedPunchVerified=false;
  this.root.userData.installedProcessorVerified=false;
  this.root.userData.referenceNote='BMJ identifies a SCREEN CTF imagesetter but not its exact model. Geometry is a bounded FT-R/Katana multi-model process twin using capstan transport, slack/tension control, polygon-mirror scanning and red-laser optics. Katana 5-facet/14,400-rpm values are retained as reference metadata only; model-specific width, wavelength, punch, output cassette, processor and RIP/interface are not asserted.';
 }
 buildZundReference(){
  this.palette.body=0xdfe3e2;this.palette.dark=0x20272b;this.palette.accent=0x365b68;this.palette.orange=0xe26a2c;
  this.base(5.6,2.65);
  const m1=this.mod(1,[0,0,0],[0,.15,0]);this.box(m1.g,[5.45,.38,2.55],[0,.38,0],'dark',.04);this.box(m1.a,[5.22,.055,2.35],[0,.60,0],'body',.006);
  const m2=this.mod(2,[0,0,0],[0,.28,.30]);for(const z of [-1.17,1.17])this.box(m2.g,[5.30,.18,.12],[0,.86,z],'steel',.018);const gantry=this.motion(this.box(m2.a,[.16,.90,2.62],[0,1.16,0],'accent',.025),'oscillate','x',.55,2.25,0,2);gantry.userData.gantry=true;
  const m3=this.mod(3,[0,0,0],[0,.35,.36]);const carriage=this.motion(this.box(m3.a,[.38,.42,.52],[0,1.22,0],'dark',.035),'oscillate','z',1.15,1.00,.8,3);carriage.userData.toolCarriage=true;
  const m4=this.mod(4,[0,0,0],[0,.42,.42]);for(const z of [-.16,0,.16]){const tool=this.motion(this.cyl(m4.a,.045,.26,[0,.90,z],z===0?'orange':'steel','y'),'press','y',5,.06,z,3);tool.userData.toolModule=true;}
  const m5=this.mod(5,[0,0,0],[0,.38,-.40]);this.box(m5.g,[.34,.56,.36],[-.12,1.56,-.82],'dark',.025);this.motion(this.cyl(m5.a,.055,.12,[-.12,1.36,-.82],'glass','y'),'oscillate','z',1,.08,0,1);
  const m6=this.mod(6,[0,0,0],[.45,.18,0]);this.box(m6.g,[.72,1.12,.52],[-2.25,.72,-1.42],'dark',.04);this.box(m6.a,[.46,.28,.025],[-2.30,.92,-1.69],'glass',.012);
  this.root.userData.referenceNote='Exact Zünd model/table size is unknown. Geometry follows G3/S3 modular flatbed architecture: zoned vacuum bed, travelling beam, tool carriage, modular cutting/creasing/routing heads and registration camera.';
 }
 buildCompressorReference(){
  const name=this.cfg.machine.name.toUpperCase(),atlas=name.includes('ATLAS'),kaeser=name.includes('KAESER'),swan=name.includes('SWAN');
  this.palette.body=atlas?0xd9dedf:kaeser?0xe4bd38:swan?0xe8e9e6:0xdfe2df;this.palette.dark=0x252b2e;this.palette.accent=swan?0x3d7861:atlas?0xd0ad2f:0x444a4c;
  const L=swan?2.10:2.55;this.base(L,1.35);
  const xs=[-L*.36,-L*.23,-L*.08,L*.08,L*.22,L*.35,L*.44];
  for(let i=1;i<=7;i++){
   const {g,a}=this.mod(i,[xs[i-1],0,0],[Math.sign(xs[i-1]||1)*.30,.20,0]);
   if(i===1){this.shell(g,[.42,1.35,1.20],[0,.76,0]);this.cyl(a,.12,.36,[0,.58,0],'dark','x');}
   else if(i===2){this.shell(g,[.55,1.42,1.20],[0,.80,0]);this.motion(this.cyl(a,.24,.46,[0,.68,0],'dark','x'),'spin','x',5,.02,0,null);}
   else if(i===3){this.shell(g,[.55,1.42,1.20],[0,.80,0]);const ae=this.motion(this.cyl(a,.20,.42,[0,.70,0],'steel','x'),'spin','x',8,.02,0,null);ae.userData.airEnd=true;}
   else if(i===4){this.shell(g,[.46,1.45,1.20],[0,.82,0]);this.cyl(a,.18,.58,[0,.72,0],'steel','y');}
   else if(i===5){this.shell(g,[.42,1.40,1.20],[0,.80,0]);for(const y of [.58,.72,.86])this.cyl(a,.035,.72,[0,y,0],'steel','z');}
   else if(i===6){this.shell(g,[.48,1.45,1.20],[0,.82,0]);for(const z of [-.30,-.10,.10,.30])this.box(a,[.06,.72,.035],[0,.80,z],'steel',.004);this.motion(this.cyl(a,.18,.14,[0,1.12,0],'dark','z'),'spin','z',10,.02,0,null);}
   else {this.shell(g,[.40,1.40,1.20],[0,.80,0]);this.box(a,[.24,.18,.025],[-.02,1.02,-.62],'glass',.008);}
  }
  this.root.userData.referenceBrandFamily=atlas?'Atlas Copco GA/G family':kaeser?'KAESER SIGMA screw family':swan?'SWAN TS-AD/TMV family':'rotary screw family';
  this.root.userData.brandVisualBoundary='BRAND_FAMILY_SILHOUETTE_ONLY__EXACT_MODEL_UNVERIFIED';
  this.root.userData.referenceNote=atlas?'Atlas Copco brand is confirmed; exact model is absent. Exterior and internals follow GA/G oil-injected family references without asserting VSD, Full Feature dryer, receiver or power rating.':kaeser?'KAESER brand is confirmed; exact model is absent. Exterior and internals follow SIGMA fluid-cooled screw family references; belt versus 1:1 direct drive and SIGMA CONTROL generation remain unverified.':swan?'SWAN brand is confirmed; exact model is absent. Exterior and internals follow TS-AD/TMV family references; exact series, coupling versus PM direct drive and VFD installation remain unverified.':'Rotary screw family reference only.';
 }
 buildAirHandlerReference(sansin=false){
  if(sansin)return this.buildSansinCooling();
  this.palette.body=0xdde3e2;this.palette.dark=0x30383b;this.palette.accent=0x4b7480;this.palette.filter=0xc7b783;
  this.base(7.10,2.02);
  const xs=[-3.02,-2.02,-1.02,0,1.03,2.08,3.05];
  for(let i=1;i<=7;i++){
   const {g,a}=this.mod(i,[xs[i-1],0,0],[Math.sign(xs[i-1]||1)*.42,.18,0]);this.shell(g,[.94,1.88,1.88],[0,1.02,0]);
   if(i===1){for(const y of [.55,.80,1.05,1.30]){const d=this.box(a,[.08,.07,1.45],[0,y,0],'steel',.005);d.rotation.z=-.18;}}
   else if(i===2){for(const x of [-.18,0,.18])this.box(a,[.055,1.38,1.42],[x,1.02,0],'filter',.005);}
   else if(i===3||i===4){for(let y=.48;y<=1.48;y+=.14)this.box(a,[.055,.035,1.32],[0,y,0],'steel',.003);this.cyl(a,.025,1.30,[.25,1.02,0],'accent','z');}
   else if(i===5){this.box(a,[.72,.08,1.40],[0,.42,0],'steel',.01);this.cyl(a,.035,1.10,[.25,.34,0],'dark','z');}
   else if(i===6){const fan=this.motion(this.cyl(a,.48,.24,[0,1.04,0],'dark','z'),'spin','z',6,.02,0,null);fan.userData.supplyFan=true;for(let k=0;k<8;k++){const blade=this.box(a,[.38,.04,.07],[0,1.04,0],'steel',.004);blade.rotation.z=k*Math.PI/4;}}
   else {this.box(a,[.20,1.35,1.50],[.22,1.02,0],'accent',.015);}
  }
  this.root.userData.referenceNote='AHU model/section order is unknown. Geometry is a serviceable double-skin AHU family reference with damper, filter bank, cooling/heat-exchange coil, drain pan, supply fan and discharge/control sections.';
 }
 buildSansinCooling(){
  this.palette.body=0xe3e6e3;this.palette.dark=0x273034;this.palette.accent=0x437563;this.palette.blue=0x497e9d;
  this.base(5.0,2.30);
  const xs=[-2.05,-1.40,-.72,.05,.85,1.62,2.20];
  for(let i=1;i<=7;i++){
   const {g,a}=this.mod(i,[xs[i-1],0,0],[Math.sign(xs[i-1]||1)*.38,.20,0]);
   if(i<=4){this.shell(g,[.70,2.05,1.70],[0,1.10,0]);if(i===1)for(const y of [.58,.88,1.18,1.48]){const d=this.box(a,[.06,.06,1.30],[0,y,0],'steel',.005);d.rotation.z=-.16;}if(i===2)for(const x of [-.14,.14])this.box(a,[.045,1.45,1.30],[x,1.10,0],'filter',.004);if(i===3)for(let y=.55;y<1.65;y+=.15)this.box(a,[.05,.04,1.25],[0,y,0],'blue',.003);if(i===4)this.motion(this.cyl(a,.46,.22,[0,1.12,0],'dark','z'),'spin','z',6,.02,0,null);}
   else if(i===5){this.shell(g,[1.00,1.75,1.65],[0,.98,0]);for(const z of [-.52,.52])this.motion(this.cyl(a,.28,.10,[0,1.45,z],'dark','z'),'spin','z',7,.02,z,null);for(let y=.45;y<1.35;y+=.13)this.box(a,[.05,.03,1.25],[0,y,0],'steel',.003);}
   else if(i===6){this.box(g,[.75,.75,1.10],[0,.50,0],'dark',.04);this.cyl(a,.11,.60,[0,.62,0],'steel','x');this.cyl(a,.035,1.18,[0,.78,0],'blue','z');}
   else {this.box(g,[.60,1.28,.58],[0,.78,.62],'dark',.04);this.box(a,[.36,.23,.025],[-.02,1.02,.31],'glass',.008);}
  }
  this.root.userData.referenceBrandFamily='PT Sansin Indonesia / NES industrial central cooling family';
  this.root.userData.referenceNote='Registry identifies AHU 7 as SANSIN but not the model. Geometry therefore follows the PT Sansin/NES YZKJ industrial central-cooling family as a nearest brand-specific reference, not a YZKJ-45N installation claim.';
 }
}

export class ReferenceProcessSimulation{
 constructor(root,template){
  this.root=root;this.template=template;this.active=false;this.running=false;this.paused=false;this.speed=1;this.elapsed=0;this.lastNow=null;this.completed=0;this.onUpdate=null;
  this.blocked=template.cfg.evidence.simulation==='BLOCKED';this.blockedReason=this.blocked?template.cfg.evidence.reason:null;
  this.family=template.cfg.family;
  this.stages=template.cfg.profile?.process||template.cfg.modules;if(this.family==='ctp')this.stages=this.stages.filter((_,i)=>i!==4);this.cycle=Math.max(8,this.stages.length*1.35);
  this.motions=this.blocked?[]:template.activeMeshes.filter(m=>m.userData.motion&&!m.userData.referencePlaceholder&&m.userData.simulationEnabled!==false).map(mesh=>({mesh,motion:mesh.userData.motion,position:mesh.position.clone(),quaternion:mesh.quaternion.clone()}));
 this.pathVisible=false;this.inkFlowVisible=false;this.processPiece=null;this.processMaterial=null;this.processGeometry=null;this.blanker=null;this.collator=null;this.collatorSheets=[];this.collatorSheetGeometry=null;this.collatorSheetMaterial=null;if(!this.blocked)this.buildProcessPiece();if(!this.blocked&&this.family==='blanker')this.bindBlanker();if(!this.blocked&&this.family==='collator')this.bindCollator();
 }
 buildProcessPiece(){
  const family=this.family;if(['compressor','ahu','collator'].includes(family))return;
  const bounds=new THREE.Box3().setFromObject(this.root),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  const metal=['ctp','imagesetter','zund'].includes(family);
  const blanker=family==='blanker';
  this.processGeometry=new THREE.BoxGeometry(blanker?.72:Math.max(.28,Math.min(.75,size.x*.09)),blanker?.055:.025,blanker?.92:Math.max(.42,Math.min(1.0,size.z*.55)));
  this.processMaterial=new THREE.MeshStandardMaterial({color:metal?0xb5bcc0:0xe8dfc8,roughness:metal?.42:.88,metalness:metal?.18:0});
  this.processPiece=new THREE.Mesh(this.processGeometry,this.processMaterial);this.processPiece.name='REFERENCE-PROCESS-WORKPIECE';this.processPiece.visible=false;this.processPiece.position.set(bounds.min.x+.30,Math.max(.68,bounds.min.y+.66),center.z);this.processPiece.userData.startX=bounds.min.x+.30;this.processPiece.userData.endX=bounds.max.x-.30;this.root.add(this.processPiece);
 }
 bindBlanker(){
  const find=id=>this.template.findNode(id);
  const platform=find('qf100-platform'),ram=find('qf100-head-ram');
  this.blanker={platform,ram,separation:find('qf100-separation-interface'),receiving:find('qf100-receiving-tray'),
   xAxis:find('qf100-x-axis'),yAxis:find('qf100-y-axis'),
   platformRest:platform?.position.clone()||new THREE.Vector3(),ramRest:ram?.position.clone()||new THREE.Vector3()};
  if(this.processPiece){this.processPiece.position.set(-.55,.81,0);this.processPiece.userData.blankerRest=this.processPiece.position.clone();}
 }
 blankerStatus(){
  const p=this.active?(this.elapsed%this.cycle)/this.cycle:0;
  let idx=0,indexing=false,pressing=false;
  if(p<.15)idx=0;
  else if(p<.35){idx=1;indexing=true;}
  else if(p<.50){idx=2;indexing=true;}
  else if(p<.62)idx=2;
  else if(p<.75){idx=3;pressing=true;}
  else if(p<.86)idx=4;
  else {idx=6;indexing=true;}
  return {p,idx,indexing,pressing,interlockSafe:!(indexing&&pressing)};
 }
 updateBlanker(){
  if(!this.blanker)return;
  const {p,indexing,pressing}=this.blankerStatus(),b=this.blanker;
  const smooth=t=>t*t*(3-2*t);
  let x=-.55,z=0,ramDrop=0,sepDrop=0;
  if(p>=.15&&p<.35)x=THREE.MathUtils.lerp(-.55,0,smooth((p-.15)/.20));
  else if(p>=.35&&p<.50){x=0;z=THREE.MathUtils.lerp(0,.18,smooth((p-.35)/.15));}
  else if(p>=.50&&p<.86){x=0;z=.18;}
  else if(p>=.86){const t=smooth((p-.86)/.14);x=THREE.MathUtils.lerp(0,-.55,t);z=THREE.MathUtils.lerp(.18,0,t);}
  if(pressing){const t=(p-.62)/.13;ramDrop=Math.sin(Math.PI*THREE.MathUtils.clamp(t,0,1))*.16;}
  if(p>=.75&&p<.86)sepDrop=.035*smooth((p-.75)/.11);
  if(b.platform){b.platform.position.copy(b.platformRest);b.platform.position.x+=x+.55;b.platform.position.z+=z;}
  if(b.ram){b.ram.position.copy(b.ramRest);b.ram.position.y-=ramDrop;}
  if(this.processPiece){
   this.processPiece.visible=this.active;
   this.processPiece.position.set(x,.81-sepDrop,z);
  }
  const spin=indexing?this.elapsed*10:0;
  for(const m of this.template.activeMeshes){
   if(!['x-axis-servo-motor','y-axis-servo-motor'].includes(m.userData.mechanismRole))continue;
   if(!m.userData.motionRestQuaternion)m.userData.motionRestQuaternion=m.quaternion.clone();
   m.quaternion.copy(m.userData.motionRestQuaternion);
   if(indexing){const axis=m.userData.mechanismRole==='y-axis-servo-motor'?AXIS.z:AXIS.x;m.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(axis,spin));}
  }
 }
 bindCollator(){
  const binCount=this.template.root.userData.modeledReferenceBinCount||10;
  const rotors=[],sensors=[];
  this.template.root.traverse(o=>{if(o.userData?.mechanismRole==='suction-rotor')rotors.push(o);if(o.userData?.mechanismRole==='double-miss-feed-sensor-reference')sensors.push(o);});
  this.collator={binCount,rotors,sensors,installedBinCountVerified:this.template.root.userData.installedBinCountVerified===true};
  this.collatorSheetGeometry=new THREE.BoxGeometry(.42,.012,.58);
  this.collatorSheetMaterial=new THREE.MeshStandardMaterial({color:0xe8dfc8,roughness:.90,metalness:0});
  for(let b=0;b<binCount;b++){
   const mesh=new THREE.Mesh(this.collatorSheetGeometry,this.collatorSheetMaterial);
   mesh.name='COLLATOR-BIN-'+(b+1)+'-PROCESS-SHEET';mesh.visible=false;mesh.userData.binIndex=b;this.root.add(mesh);
   this.collatorSheets.push({mesh,bin:b,start:new THREE.Vector3(-.70,.34+b*.145,0)});
  }
 }
 collatorStatus(){
  const p=this.active?(this.elapsed%this.cycle)/this.cycle:0;
  const idx=Math.min(this.stages.length-1,Math.floor(p*this.stages.length));
  return {p,idx,modeledBinCount:this.collator?.binCount||0,installedBinCountVerified:this.collator?.installedBinCountVerified??false};
 }
 updateCollator(){
  if(!this.collator)return;
  const p=(this.elapsed%this.cycle)/this.cycle,binCount=this.collator.binCount;
  let activeFeedCount=0,completedInSet=0;
  const smooth01=v=>{v=THREE.MathUtils.clamp(v,0,1);return v*v*(3-2*v);};
  for(const item of this.collatorSheets){
   const b=item.bin,start=.04+b*.025,end=start+.46,q=(p-start)/(end-start),mesh=item.mesh;
   mesh.visible=this.active;
   if(q<=0){mesh.position.copy(item.start);continue;}
   if(q>=1){mesh.position.set(1.06,.62+b*.012,0);completedInSet++;continue;}
   activeFeedCount++;
   if(q<.36){
    const t=smooth01(q/.36);mesh.position.set(THREE.MathUtils.lerp(item.start.x,.18,t),item.start.y,0);
   }else if(q<.76){
    const t=smooth01((q-.36)/.40);mesh.position.set(.18,THREE.MathUtils.lerp(item.start.y,.62,t),0);
   }else{
    const t=smooth01((q-.76)/.24);mesh.position.set(THREE.MathUtils.lerp(.18,1.06,t),.62+b*.012,0);
   }
  }
  this.collator.activeFeedCount=activeFeedCount;this.collator.completedSheetsInSet=completedInSet;
 }
 stageIndex(){const p=this.active?(this.elapsed%this.cycle)/this.cycle:0;return Math.min(this.stages.length-1,Math.floor(p*this.stages.length));}
 state(){
  const progress=this.active?(this.elapsed%this.cycle)/this.cycle:0,blankerState=this.family==='blanker'?this.blankerStatus():null,collatorState=this.family==='collator'?this.collatorStatus():null,idx=blankerState?.idx??collatorState?.idx??this.stageIndex();
  return {available:!this.blocked,blocked:this.blocked,blockedReason:this.blockedReason,referenceModel:true,evidenceGrade:this.template.cfg.evidence.grade,geometryStatus:this.template.cfg.evidence.geometry,
   active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:this.blocked?'Simulasi belum tervalidasi':(this.stages[idx]||'Reference process'),completed:this.completed,progress,
   sheetsVisible:this.family==='collator'?this.collatorSheets.filter(s=>s.mesh.visible).length:(this.processPiece?.visible?1:0),pileSheetsVisible:0,rotorCount:this.motions.filter(x=>x.motion.type==='spin').length,
   oscillatorCount:this.motions.filter(x=>x.motion.type!=='spin').length,mechanismCount:this.family==='blanker'?this.template.activeMeshes.length:this.motions.length,inkFlowCount:0,uvLampCount:0,uvActive:false,pathVisible:false,inkFlowVisible:false,
   platformIndexing:blankerState?.indexing??false,blankingHeadPressing:blankerState?.pressing??false,mechanicalInterlockSafe:blankerState?.interlockSafe??true,
   modeledBinCount:collatorState?.modeledBinCount??null,installedBinCountVerified:collatorState?.installedBinCountVerified??null,activeBinFeeds:this.collator?.activeFeedCount??0,completedSheetsInSet:this.collator?.completedSheetsInSet??0,
   simulationBoundary:this.family==='blanker'?'QF_LQF_1080_FAMILY_PROCESS_ONLY':this.family==='collator'?'MULTI_VENDOR_SUCTION_COLLATOR_PROCESS_ONLY__TEN_BIN_REFERENCE_NOT_INSTALLATION_CLAIM':this.family==='ctp'?'SUPRASETTER_COMMON_PROCESS_ONLY__PUNCH_LOADER_DEBRIS_TEMP_OPTIONS_NOT_SIMULATED':null,referenceBoundary:this.template.cfg.profile?.unknowns||[]};
 }
 start(){if(this.blocked){this.active=false;this.running=false;this.paused=false;this.onUpdate?.(this.state());return this.state();}this.active=true;this.running=true;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;if(this.processPiece)this.processPiece.visible=true;for(const s of this.collatorSheets)s.mesh.visible=true;this.resetMotion();this.onUpdate?.(this.state());return this.state();}
 pause(){this.running=false;this.paused=this.active;this.onUpdate?.(this.state());return this.state();}
 resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;}this.onUpdate?.(this.state());return this.state();}
 setSpeed(v){this.speed=Math.max(.25,Math.min(3,Number(v)||1));return this.state();}
 setPathVisible(){this.pathVisible=false;return this.state();}
 setInkFlowVisible(){this.inkFlowVisible=false;return this.state();}
 resetMotion(){for(const item of this.motions){item.mesh.position.copy(item.position);item.mesh.quaternion.copy(item.quaternion);}if(this.blanker){if(this.blanker.platform)this.blanker.platform.position.copy(this.blanker.platformRest);if(this.blanker.ram)this.blanker.ram.position.copy(this.blanker.ramRest);}if(this.processPiece){if(this.family==='blanker'&&this.processPiece.userData.blankerRest)this.processPiece.position.copy(this.processPiece.userData.blankerRest);else this.processPiece.position.x=this.processPiece.userData.startX;this.processPiece.visible=this.active;}for(const s of this.collatorSheets){s.mesh.position.copy(s.start);s.mesh.visible=this.active;}if(this.collator){this.collator.activeFeedCount=0;this.collator.completedSheetsInSet=0;}}
 update(now){
  if(!this.active||!this.running){this.lastNow=now;return;}
  if(this.lastNow===null){this.lastNow=now;return;}
  const dt=Math.min(.12,Math.max(0,(now-this.lastNow)/1000))*this.speed;this.lastNow=now;this.elapsed+=dt;
  const phase=(this.elapsed%this.cycle)/this.cycle,idx=this.stageIndex();
  if(this.family==='blanker'){this.updateBlanker();this.completed=Math.floor(this.elapsed/this.cycle);this.onUpdate?.(this.state());return;}
  for(const item of this.motions){
   const {mesh,motion,position,quaternion}=item;mesh.position.copy(position);mesh.quaternion.copy(quaternion);
   const enabled=motion.stage===null||motion.stage===undefined||Math.abs(idx-motion.stage)<=1;if(!enabled)continue;
   const axis=AXIS[motion.axis]||AXIS.z,t=this.elapsed*motion.rate+motion.phase;
   if(motion.type==='spin')mesh.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(axis,t));
   else if(motion.type==='oscillate'||motion.type==='slide')mesh.position.addScaledVector(axis,Math.sin(t)*motion.amp);
   else if(motion.type==='press')mesh.position.addScaledVector(axis,-Math.abs(Math.sin(t))*motion.amp);
  }
  if(this.family==='collator')this.updateCollator();
  if(this.processPiece){this.processPiece.position.x=THREE.MathUtils.lerp(this.processPiece.userData.startX,this.processPiece.userData.endX,phase);this.processPiece.visible=true;}
  this.completed=Math.floor(this.elapsed/this.cycle);this.onUpdate?.(this.state());
 }
 stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.resetMotion();if(this.processPiece)this.processPiece.visible=false;for(const s of this.collatorSheets)s.mesh.visible=false;this.onUpdate?.(this.state());return this.state();}
 dispose(){this.stop();this.processPiece?.removeFromParent();this.processGeometry?.dispose();this.processMaterial?.dispose();for(const s of this.collatorSheets)s.mesh.removeFromParent();this.collatorSheetGeometry?.dispose();this.collatorSheetMaterial?.dispose();}
}
