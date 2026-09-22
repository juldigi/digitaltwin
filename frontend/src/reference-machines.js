import * as THREE from 'three';
import {UniversalMachineTemplate} from './universal-machine.js';
import {V136_SOURCE_STATS} from './data/research-v136.js';

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
  this.root.userData.referenceBuilder='V136_RESEARCH_GROUNDED_BUILDER';
  this.root.userData.engineeringDimensions=false;
  this.root.userData.referenceBoundary=this.cfg.profile?.unknowns||[];
  this.root.userData.researchVersion='V136';
  this.root.userData.researchSourceCount=V136_SOURCE_STATS.total;
  this.root.userData.newReviewedSources=V136_SOURCE_STATS.newReviewed;this.root.userData.uniqueResearchUrls=V136_SOURCE_STATS.uniqueUrls;
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
  const feed=this.activeGroup(1),align=this.activeGroup(2),fold1=this.activeGroup(3),glue=this.activeGroup(4),fold2=this.activeGroup(5),press=this.activeGroup(6),out=this.activeGroup(7);
  this.root.userData.detailPass='V123_R9_FGM2_MULTI_VENDOR_PROCESS_RECONSTRUCTION';
  this.root.userData.exactFolderGluerOemVerified=false;
  this.root.userData.exactFolderGluerModelVerified=false;
  this.root.userData.neighborMedia100IdentityProof=false;
  this.root.userData.localSupplierFamilyEvidence={source:'Jaya Makmur Mesindo',bmjCustomerAssociation:true,folderGluerCatalogue:true,installationProof:false,modelProof:false};
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
    const stack=this.box(table,[.78,.035,1.14],[-.18,.68,0],'paper',.003);this.tag(stack,'carton-blank-stack-reference','PROCESS_WORKPIECE_REFERENCE');
   }
   const drive=this.findNode('fgm2-feed-drive');
   if(drive){
    for(const z of [-.45,-.15,.15,.45]){const belt=this.box(drive,[1.12,.025,.07],[.03,.75,z],'dark',.004);this.tag(belt,'feeder-transport-belt','MULTI_VENDOR_FOLDER_GLUER_PROCESS');}
    for(const x of [-.49,.49])for(const z of [-.45,-.15,.15,.45]){const r=this.motion(this.cyl(drive,.045,.07,[x,.75,z],'dark','z'),'spin','z',7,.01,z,0);this.tag(r,'feeder-drive-roller','MULTI_VENDOR_FOLDER_GLUER_PROCESS');}
   }
   const sep=this.findNode('fgm2-feed-separator');
   if(sep){
    for(const z of [-.42,0,.42])this.tag(this.box(sep,[.055,.20,.06],[-.48,.84,z],'accent',.004),'blank-separator-gate-reference','MULTI_VENDOR_FOLDER_GLUER_PROCESS');
    sep.userData.feederTechnologyVerified=false;
   }
  }

  if(align){
   const a=this.findNode('fgm2-aligner');
   if(a){
    for(const z of [-.56,.56]){const rail=this.box(a,[1.32,.045,.045],[0,.91,z],'steel',.005);rail.rotation.z=z<0?.035:-.035;this.tag(rail,'blank-aligner-rail','MULTI_VENDOR_FOLDER_GLUER_PROCESS');}
    for(const x of [-.48,0,.48]){const r=this.motion(this.cyl(a,.040,.10,[x,.76,-.43],'dark','z'),'spin','z',6,.01,x,1);this.tag(r,'aligner-transport-roller','MULTI_VENDOR_FOLDER_GLUER_PROCESS');}
   }
   const pre=this.findNode('fgm2-prebreaker');
   if(pre){
    for(const z of [-.52,.52]){const rail=this.box(pre,[1.25,.035,.055],[0,1.03,z],'steel',.005);rail.rotation.z=z<0?.14:-.14;rail.rotation.x=z<0?.10:-.10;this.tag(rail,'prebreaker-guide-rail','MULTI_VENDOR_FOLDER_GLUER_PROCESS');}
    for(const z of [-.46,.46]){const wheel=this.motion(this.cyl(pre,.055,.08,[.36,.88,z],'dark','z'),'spin','z',6.5,.01,z,1);this.tag(wheel,'prebreaker-wheel-reference','MULTI_VENDOR_FOLDER_GLUER_PROCESS');}
   }
  }

  if(fold1){
   const belts=this.findNode('fgm2-primary-fold');
   if(belts){
    for(const z of [-.52,-.20,.20,.52]){const b=this.box(belts,[1.40,.025,.075],[0,.77,z],'dark',.004);this.tag(b,'primary-fold-transport-belt','MULTI_VENDOR_FOLDER_GLUER_PROCESS');}
    for(const z of [-.58,.58]){const guide=this.box(belts,[1.32,.035,.045],[0,1.04,z],'steel',.004);guide.rotation.z=z<0?.18:-.18;guide.rotation.x=z<0?.18:-.18;this.tag(guide,'primary-fold-guide','MULTI_VENDOR_FOLDER_GLUER_PROCESS');}
   }
   const lock=this.findNode('fgm2-lockbottom-boundary');
   tagOption(lock,'Crash-lock bottom module is common in folder-gluer families but no evidence confirms installation on FGM-2.');
   if(lock){const env=this.box(lock,[.58,.40,1.08],[.16,.91,0],'glass',.014);env.userData.optionReference=true;this.tag(env,'crash-lock-module-capability-envelope','OPTION_BOUNDARY');}
   const corner=this.findNode('fgm2-corner-boundary');
   tagOption(corner,'4/6-corner devices are available on multiple folder-gluer families but FGM-2 installed configuration is unknown.');
   if(corner){for(const z of [-.34,.34]){const env=this.box(corner,[.22,.22,.24],[-.20,.98,z],'glass',.010);env.userData.optionReference=true;this.tag(env,'four-six-corner-device-capability','OPTION_BOUNDARY');}}
  }

  if(glue){
   const supply=this.findNode('fgm2-glue-supply');
   if(supply){
    this.tag(this.box(supply,[.38,.48,.36],[.43,.50,.64],'accent',.022),'glue-reservoir-reference','MULTI_VENDOR_FOLDER_GLUER_PROCESS');
    this.tag(this.cyl(supply,.075,.16,[.20,.48,.64],'dark','x'),'glue-pump-reference','MULTI_VENDOR_FOLDER_GLUER_PROCESS');
    this.tag(this.cyl(supply,.016,.82,[.10,.87,.58],'steel','y'),'glue-supply-line-reference','MULTI_VENDOR_FOLDER_GLUER_PROCESS');
   }
   const app=this.findNode('fgm2-glue-applicator-boundary');
   tagOption(app,'Actual FGM-2 adhesive application hardware may be gun/nozzle/disc/wheel and cold/hot-melt; no type is verified.');
   if(app){
    const manifold=this.box(app,[.20,.10,1.00],[-.04,1.08,0],'glass',.008);manifold.userData.optionReference=true;this.tag(manifold,'glue-applicator-capability-envelope','OPTION_BOUNDARY');
    for(const z of [-.34,.34]){const n=this.cyl(app,.025,.12,[-.04,.94,z],'glass','y');n.userData.optionReference=true;this.tag(n,'glue-nozzle-capability-reference','OPTION_BOUNDARY');}
   }
   const detect=this.findNode('fgm2-glue-detection-boundary');
   tagOption(detect,'Glue-line detection exists on some folder-gluer configurations; installation on FGM-2 is not confirmed.');
   if(detect){const s=this.box(detect,[.08,.12,.08],[.34,.89,-.54],'glass',.005);s.userData.optionReference=true;this.tag(s,'glue-line-sensor-capability','OPTION_BOUNDARY');}
  }

  if(fold2){
   const belts=this.findNode('fgm2-final-fold');
   if(belts){
    for(const y of [.75,.98])for(const z of [-.46,-.15,.15,.46]){const b=this.box(belts,[1.48,.025,.07],[0,y,z],'dark',.004);this.tag(b,y>.8?'upper-final-fold-belt':'lower-final-fold-belt','MULTI_VENDOR_FOLDER_GLUER_PROCESS');}
    for(const z of [-.56,.56]){const rail=this.box(belts,[1.34,.035,.045],[0,1.10,z],'steel',.004);rail.rotation.z=z<0?.12:-.12;this.tag(rail,'final-fold-guide-rail','MULTI_VENDOR_FOLDER_GLUER_PROCESS');}
   }
   const square=this.findNode('fgm2-squaring');
   if(square){for(const z of [-.58,.58])this.tag(this.box(square,[.72,.32,.035],[.30,.86,z],'steel',.006),'squaring-guide-plate','MULTI_VENDOR_FOLDER_GLUER_PROCESS');}
  }

  if(press){
   const belts=this.findNode('fgm2-compression-belts');
   if(belts){
    for(const y of [.74,1.02])for(const z of [-.48,-.16,.16,.48]){const b=this.box(belts,[1.42,.035,.08],[0,y,z],'dark',.004);this.tag(b,y>.8?'upper-compression-belt':'lower-compression-belt','MULTI_VENDOR_FOLDER_GLUER_PROCESS');}
    for(const x of [-.56,.56])for(const z of [-.48,.48]){const r=this.motion(this.cyl(belts,.052,.08,[x,.88,z],'dark','z'),'spin','z',6,.01,z,5);this.tag(r,'compression-belt-drive-roller','MULTI_VENDOR_FOLDER_GLUER_PROCESS');}
   }
   const pressure=this.findNode('fgm2-pressure-reference');
   if(pressure){
    pressure.userData.actuationTypeVerified=false;
    for(const z of [-.48,.48])this.tag(this.cyl(pressure,.040,.34,[.28,1.20,z],'steel','x'),'compression-pressure-actuator-reference','MULTI_VENDOR_FOLDER_GLUER_PROCESS');
   }
  }

  if(out){
   const delivery=this.findNode('fgm2-delivery');
   if(delivery){
    for(const z of [-.46,-.15,.15,.46]){const belt=this.box(delivery,[1.16,.028,.075],[-.04,.74,z],'dark',.004);this.tag(belt,'delivery-transport-belt','MULTI_VENDOR_FOLDER_GLUER_PROCESS');}
    for(const x of [-.46,.46])for(const z of [-.46,-.15,.15,.46]){const r=this.motion(this.cyl(delivery,.048,.075,[x,.74,z],'dark','z'),'spin','z',6,.01,z,6);this.tag(r,'delivery-drive-roller','MULTI_VENDOR_FOLDER_GLUER_PROCESS');}
   }
   const count=this.findNode('fgm2-counter-boundary');
   tagOption(count,'Counter/kicker hardware is common on many folder-gluers but is not verified on FGM-2.');
   if(count){const marker=this.box(count,[.28,.24,.72],[.22,.92,0],'glass',.012);marker.userData.optionReference=true;this.tag(marker,'counter-kicker-capability-envelope','OPTION_BOUNDARY');}
   const ctrl=this.findNode('fgm2-control');
   if(ctrl){
    this.tag(this.box(ctrl,[.46,.72,.42],[-.34,.62,.64],'dark',.024),'main-control-cabinet-reference','CONTROL_FAMILY_REFERENCE');
    this.tag(this.box(ctrl,[.28,.20,.025],[-.34,.86,.42],'glass',.008),'operator-hmi-reference','CONTROL_FAMILY_REFERENCE');
    ctrl.userData.controllerBrandVerified=false;
   }
   const downstream=this.findNode('fgm2-downstream-boundary');
   tagOption(downstream,'No packer/bundler is recorded as part of FGM-2 in the BMJ registry.');
   if(downstream){const env=this.box(downstream,[.54,.32,1.02],[.42,.58,0],'glass',.014);env.userData.optionReference=true;this.tag(env,'downstream-packing-interface-boundary','OPTION_BOUNDARY');}
  }
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
  const towerDetails=this.group(this.root,'collator-tower-detail','Collator tower service detail',[0,0,0],[0,.12,0]);
  for(let b=0;b<10;b++){const y=.34+b*.145;const lip=this.cover(this.box(towerDetails,[.68,.035,.045],[-.70,y+.09,-.57],'body',.004));this.tag(lip,'collator-bin-front-lip-reference','MULTI_VENDOR_COLLATOR_VISUAL');const knob=this.cover(this.cyl(towerDetails,.024,.028,[-.35,y+.09,-.60],'dark','z'));this.tag(knob,'collator-bin-adjustment-knob-reference','MULTI_VENDOR_COLLATOR_VISUAL');}
  const plenum=this.cover(this.box(towerDetails,[.28,1.55,.18],[-1.08,1.02,.48],'dark',.018));this.tag(plenum,'collator-bin-air-plenum-reference','MULTI_VENDOR_COLLATOR_VISUAL');
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
    const roll=this.motion(this.cyl(cassette,.21,.74,[-.18,.68,0],'dark','z'),'spin','z',2.2,.01,0,0);this.tag(roll,'media-supply-roll','SCREEN_FTR_KATANA_FAMILY');roll.userData.exactMediaWidthVerified=false;
    this.tag(this.cyl(cassette,.045,.86,[-.18,.68,0],'steel','z'),'media-cassette-spindle','SCREEN_FTR_KATANA_FAMILY');
    for(const z of [-.45,.45])this.tag(this.box(cassette,[.48,.56,.035],[-.18,.68,z],'dark',.012),'media-cassette-sideplate','SCREEN_FTR_KATANA_FAMILY');
   }
   const load=this.findNode('ctf-auto-load');
   if(load){
    load.userData.familyFunction='AUTOMATIC_MEDIA_LOADING';
    for(const y of [.60,.78]){const r=this.motion(this.cyl(load,.034,.82,[.19,y,0],'steel','z'),'spin','z',4.2,.01,y,0);this.tag(r,'automatic-load-roller','SCREEN_FTR_KATANA_FAMILY');}
    for(const z of [-.38,.38])this.tag(this.box(load,[.42,.025,.035],[.10,.70,z],'steel',.003),'media-entry-guide','SCREEN_FTR_KATANA_FAMILY');
   }
  }

  if(transport){
   const capstan=this.findNode('ctf-capstan');
   if(capstan){
    const drive=this.motion(this.cyl(capstan,.075,.86,[0,.79,0],'dark','z'),'spin','z',6.2,.01,0,1);this.tag(drive,'capstan-drive-roller','SCREEN_FTR_KATANA_FAMILY');
    const nip=this.motion(this.cyl(capstan,.046,.86,[.15,.79,0],'steel','z'),'spin','z',6.2,.01,.2,1);this.tag(nip,'capstan-nip-roller','SCREEN_FTR_KATANA_FAMILY');
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
    const gr=this.motion(this.cyl(gravity,.052,.84,[0,.49,0],'steel','z'),'spin','z',4.4,.01,0,1);this.tag(gr,'gravity-tension-roller','KATANA_OFFICIAL');
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
    const poly=this.motion(this.mesh(mirror,()=>new THREE.CylinderGeometry(.105,.105,.065,5),'ctf-polygon-five-facet','steel',[0,.82,0]),'spin','y',14,.01,0,2);this.tag(poly,'five-facet-polygon-mirror-reference','KATANA_OFFICIAL');
    poly.userData.documentedKatanaFacetCount=5;poly.userData.installedFacetCountVerified=false;poly.userData.documentedKatanaMaxRpm=14400;poly.userData.installedRpmVerified=false;
    this.tag(this.box(mirror,[.34,.28,.34],[0,.82,0],'dark',.018),'polygon-scanner-housing','SCREEN_FTR_KATANA_FAMILY');
   }
   const drive=this.findNode('ctf-polygon-drive');
   if(drive){
    const motor=this.motion(this.cyl(drive,.075,.18,[0,.62,0],'dark','y'),'spin','y',14,.01,0,2);this.tag(motor,'polygon-drive-motor-reference','SCREEN_FTR_KATANA_FAMILY');
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
    const blade=this.motion(this.box(cutter,[.10,.22,.78],[0,.78,0],'steel',.005),'press','y',2.4,.045,0,4);this.tag(blade,'media-cross-cutter','SCREEN_FTR_FAMILY');
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
  const table=this.activeGroup(1),beamUnit=this.activeGroup(2),carUnit=this.activeGroup(3),tools=this.activeGroup(4),sense=this.activeGroup(5),ctl=this.activeGroup(6);
  this.root.userData.detailPass='V123_R7_ZUND_MODULAR_PLATFORM_RECONSTRUCTION';
  const edge=this.group(this.root,'zund-table-edge-detail','Zünd flatbed edge / cable management',[0,0,0],[0,.12,0]);
  for(const z of [-1.27,1.27]){const rail=this.cover(this.box(edge,[5.45,.16,.10],[0,.55,z],'dark',.015));this.tag(rail,'zund-table-side-rail-reference','ZUND_G3_S3_VISUAL');}
  const chain=this.group(edge,'zund-cable-chain-reference','Travelling cable-chain reference',[0,0,0],[0,.12,0]);for(let x=-2.20;x<=2.20;x+=.20){const link=this.box(chain,[.14,.08,.12],[x,.80,1.18],'dark',.015);this.tag(link,'zund-cable-chain-link-reference','ZUND_FAMILY_VISUAL');}
  this.root.userData.exactZundModelVerified=false;
  this.root.userData.familyCandidates=['G3','S3'];
  this.root.userData.installedToolPackageVerified=false;
  this.root.userData.installedIccVerified=false;
  this.root.userData.installedItiVerified=false;
  this.root.userData.installedArcVerified=false;
  this.root.userData.installedMaterialHandlingVerified=false;
  this.root.userData.platformSimulationBoundary='XY_CARRIAGE_MOTION_ONLY__NO_TOOL_ACTION_WITHOUT_INSTALLED_TOOL_EVIDENCE';

  if(table){
   const bed=this.findNode('zund-vacuum-bed');
   if(bed){
    this.tag(this.box(bed,[5.18,.055,2.30],[0,.62,0],'body',.006),'vacuum-cutting-surface','ZUND_G3_S3_FAMILY');
    for(let x=-2.25;x<=2.25;x+=.45)for(let z=-.90;z<=.90;z+=.45){const port=this.cyl(bed,.010,.015,[x,.655,z],'dark','y');this.tag(port,'vacuum-port-reference','ZUND_G3_S3_FAMILY');}
   }
   const zones=this.findNode('zund-vacuum-zones');
   if(zones){
    zones.userData.individualZoneTopologyVerified=false;
    for(const x of [-1.75,-.85,0,.85,1.75])this.tag(this.box(zones,[.015,.018,2.15],[x,.65,0],'accent',.001),'vacuum-zone-divider-reference','ZUND_FAMILY_REFERENCE');
    for(const x of [-1.45,-.48,.48,1.45]){const valve=this.box(zones,[.08,.08,.12],[x,.46,1.04],'accent',.006);this.tag(valve,'vacuum-zone-valve-reference','ZUND_FAMILY_REFERENCE');valve.userData.installedZoneTopologyVerified=false;}
   }
  }

  if(beamUnit){
   const guide=this.findNode('zund-gantry-guide');
   if(guide){for(const z of [-1.16,1.16])this.tag(this.box(guide,[5.20,.045,.055],[0,.84,z],'steel',.005),'gantry-linear-guide-reference','ZUND_G3_S3_FAMILY');this.tag(this.box(guide,[4.95,.025,.035],[0,.79,-1.12],'dark',.003),'gantry-drive-rack-reference','ZUND_FAMILY_REFERENCE');}
   const beam=this.findNode('zund-gantry-beam');
   if(beam){this.tag(this.box(beam,[.17,.90,2.55],[0,1.18,0],'accent',.025),'travelling-beam-structure','ZUND_G3_S3_FAMILY');for(const z of [-1.08,1.08])this.tag(this.box(beam,[.26,.20,.16],[0,.86,z],'dark',.010),'beam-guide-carriage-reference','ZUND_FAMILY_REFERENCE');}
  }

  if(carUnit){
   const traverse=this.findNode('zund-carriage-y');
   if(traverse){this.tag(this.box(traverse,[.38,.42,.52],[0,1.22,0],'dark',.035),'tool-carriage-structure','ZUND_G3_S3_FAMILY');for(const z of [-.15,.15])this.tag(this.cyl(traverse,.025,.36,[0,.97,z],'steel','y'),'carriage-z-guide-reference','ZUND_G3_S3_FAMILY');}
   const slots=this.findNode('zund-module-slots');
   if(slots){
    slots.userData.installedModuleCountVerified=false;
    for(const z of [-.14,.14]){const holder=this.box(slots,[.18,.30,.17],[0,.92,z],'steel',.010);this.tag(holder,'universal-module-carrier-reference','ZUND_UM_PRIMARY');holder.userData.toolDetectionFamilyCapability=true;}
    this.tag(this.box(slots,[.12,.06,.36],[.17,1.04,0],'accent',.006),'module-bayonet-interface-reference','ZUND_UM_PRIMARY');
   }
  }

  if(tools){
   const options=[
    ['zund-cut-tool-option','cutting-tool-capability-envelope','UCT_EOT_POT_FAMILY'],
    ['zund-crease-option','creasing-tool-capability-envelope','CTT_FAMILY'],
    ['zund-router-option','routing-tool-capability-envelope','URT_RM_FAMILY'],
    ['zund-arc-option','arc-toolchanger-capability-envelope','ARC_FAMILY']
   ];
   for(const [id,role,evidence] of options){
    const g=this.findNode(id);if(!g)continue;g.userData.installedOptionVerified=false;g.userData.simulationEnabled=false;
    const env=this.box(g,[.16,.26,.18],[0,.88,(id.includes('cut')?-.30:id.includes('crease')?-.10:id.includes('router')?.10:.30)],'glass',.010);
    env.userData.optionReference=true;env.userData.simulationEnabled=false;this.tag(env,role,evidence);
   }
   const router=this.findNode('zund-router-option');
   if(router){router.userData.urtReference={powerW:300,maxRpm:80000,installedApplicabilityVerified:false};const hose=this.cyl(router,.018,.46,[.20,1.08,.12],'dark','y');hose.userData.optionReference=true;hose.userData.simulationEnabled=false;this.tag(hose,'router-dust-extraction-option-reference','ZUND_URT_PRIMARY');}
  }

  if(sense){
   const icc=this.findNode('zund-icc-option');
   if(icc){icc.userData.installedOptionVerified=false;icc.userData.simulationEnabled=false;const cam=this.cyl(icc,.055,.08,[-.10,1.32,-.35],'glass','y');cam.userData.optionReference=true;this.tag(cam,'icc-camera-option-reference','ZUND_FAMILY_OPTION');const ring=this.cyl(icc,.085,.025,[-.10,1.25,-.35],'accent','y');ring.userData.optionReference=true;this.tag(ring,'icc-lighting-option-reference','ZUND_FAMILY_OPTION');}
   const iti=this.findNode('zund-iti-option');
   if(iti){iti.userData.installedOptionVerified=false;iti.userData.simulationEnabled=false;const pad=this.box(iti,[.22,.06,.24],[.20,.72,.42],'accent',.008);pad.userData.optionReference=true;this.tag(pad,'tool-initialization-pad-option-reference','ZUND_S3_FAMILY_OPTION');}
  }

  if(ctl){
   const hmi=this.findNode('zund-control');
   if(hmi)this.tag(this.box(hmi,[.38,.24,.025],[-2.30,.92,-1.69],'glass',.008),'zund-control-display-reference','ZUND_FAMILY_REFERENCE');
   const vac=this.findNode('zund-vacuum-generator');
   if(vac){this.tag(this.box(vac,[.42,.42,.35],[-2.10,.38,-1.30],'dark',.02),'vacuum-generator-interface','ZUND_FAMILY_REFERENCE');this.tag(this.cyl(vac,.035,.48,[-1.95,.52,-1.08],'steel','y'),'vacuum-supply-duct-reference','ZUND_FAMILY_REFERENCE');}
   const handling=this.findNode('zund-handling-option');
   if(handling){handling.userData.installedOptionVerified=false;handling.userData.simulationEnabled=false;const env=this.box(handling,[1.20,.18,1.70],[2.52,.54,0],'glass',.012);env.userData.optionReference=true;this.tag(env,'material-handling-option-boundary','OPTION_BOUNDARY');}
  }
 }
 enrichCompressor(){
  for(let i=1;i<=7;i++){const a=this.activeGroup(i);if(a)for(const child of [...a.children])if(child.isMesh){child.visible=false;child.userData.referencePlaceholder=true;}}
  const no=this.cfg.machine.no;
  this.enrichCompressorCabinet();
  if([29,30,35].includes(no))this.enrichAtlasCompressor();
  else if([31,32,34].includes(no))this.enrichKaeserCompressor();
  else if(no===33)this.enrichSwanCompressor();
  this.enrichCompressedAirDistribution();
 }
 compressorGroups(){return {
  intake:this.activeGroup(1),motor:this.activeGroup(2),airend:this.activeGroup(3),sep:this.activeGroup(4),
  circuit:this.activeGroup(5),cool:this.activeGroup(6),ctl:this.activeGroup(7)
 };}
 compressorPart(parent,id,name){return parent?this.group(parent,id,name,[0,0,0],[0,.08,.08]):null;}
 addTwinScrewInternals(parent,prefix,evidence){
  if(!parent)return;
  const internals=this.compressorPart(parent,prefix+'-twin-screw-internals','Twin Screw Compression Element Internals');
  const male=this.motion(this.cyl(internals,.105,.46,[0,.74,-.105],'steel','x'),'spin','x',8,.01,0,null);this.tag(male,prefix+'-male-screw-rotor-reference',evidence);male.userData.installedRotorProfileVerified=false;
  const female=this.motion(this.cyl(internals,.118,.46,[0,.74,.105],'accent','x'),'spin','x',-6,.01,.35,null);this.tag(female,prefix+'-female-screw-rotor-reference',evidence);female.userData.installedRotorProfileVerified=false;
  for(const [z,role] of [[-.105,'male'],[.105,'female']]){
   for(const x of [-.25,.25]){const bearing=this.cyl(internals,.135,.055,[x,.74,z],'dark','x');this.tag(bearing,prefix+'-'+role+'-rotor-bearing-reference',evidence);bearing.userData.bearingTypeVerified=false;}
  }
  const inlet=this.box(internals,[.16,.24,.34],[-.30,.78,0],'dark',.015);this.tag(inlet,prefix+'-airend-inlet-port-reference',evidence);
  const discharge=this.box(internals,[.16,.20,.28],[.30,.88,0],'accent',.015);this.tag(discharge,prefix+'-airend-discharge-port-reference',evidence);
  for(const z of [-.16,0,.16]){const nozzle=this.cyl(internals,.010,.12,[.02,.58,z],'orange','y');this.tag(nozzle,prefix+'-oil-injection-nozzle-reference',evidence);nozzle.userData.installedNozzleCountVerified=false;}
  internals.userData.rotorGeometry='SCHEMATIC_TWIN_SCREW_MALE_FEMALE__PROFILE_NOT_ENGINEERING';
 }
 enrichCompressorCabinet(){
  const no=this.cfg.machine.no,swan=no===33,L=swan?2.10:2.55,H=1.48,D=1.30;
  for(let i=1;i<=7;i++){const g=this.findNode('universal-module-'+i);if(g)for(const child of g.children)if(child.isMesh&&child.userData.exteriorCover){child.visible=false;child.userData.replacedByUnifiedCabinet=true;}}
  const cab=this.group(this.root,'compressor-package-cabinet','Unified Compressor Cabinet',[0,0,0],[0,.16,0]);cab.userData.familyExteriorReference=true;
  const plinth=this.box(cab,[L+.12,.18,D+.08],[0,.12,0],'dark',.025);this.tag(plinth,'compressor-cabinet-plinth-reference','BRAND_FAMILY_VISUAL_REFERENCE');
  for(const x of [-L*.30,L*.30]){const pocket=this.box(cab,[.34,.09,D+.12],[x,.11,0],'dark',.006);this.tag(pocket,'compressor-fork-pocket-reference','INSTALLATION_VISUAL_REFERENCE');}
  const top=this.cover(this.box(cab,[L,.065,D],[0,H+.11,0],'body',.025));this.tag(top,'compressor-cabinet-top-panel-reference','BRAND_FAMILY_VISUAL_REFERENCE');
  for(const x of [-L/2,L/2]){const side=this.cover(this.box(cab,[.055,H,D],[x,.78,0],'body',.018));this.tag(side,'compressor-cabinet-side-panel-reference','BRAND_FAMILY_VISUAL_REFERENCE');}
  const rear=this.cover(this.box(cab,[L,H,.050],[0,.78,D/2],'body',.018));this.tag(rear,'compressor-cabinet-rear-panel-reference','BRAND_FAMILY_VISUAL_REFERENCE');
  const doorW=(L-.10)/3;
  for(let i=0;i<3;i++){
   const x=-L/2+.05+doorW/2+i*doorW,door=this.cover(this.box(cab,[doorW-.025,H-.16,.045],[x,.80,-D/2],'body',.015));this.tag(door,'compressor-service-door-reference','BRAND_FAMILY_VISUAL_REFERENCE');door.userData.serviceDoorIndex=i+1;
   const handle=this.cover(this.box(cab,[.025,.20,.025],[x+doorW*.34,.83,-D/2-.035],'dark',.004));this.tag(handle,'compressor-service-door-handle-reference','BRAND_FAMILY_VISUAL_REFERENCE');
  }
  for(let y=.42;y<=1.20;y+=.10){const louvre=this.cover(this.box(cab,[.025,.035,.46],[-L/2-.034,y,.25],'dark',.002));this.tag(louvre,'compressor-cooling-air-inlet-louvre-reference','BRAND_FAMILY_VISUAL_REFERENCE');}
  for(let x=-L*.24;x<=L*.24;x+=.10){const slot=this.cover(this.box(cab,[.045,.025,.50],[x,H+.15,.22],'dark',.002));this.tag(slot,'compressor-cooling-air-exhaust-grille-reference','BRAND_FAMILY_VISUAL_REFERENCE');}
  this.root.userData.unifiedCompressorCabinet=true;this.root.userData.exteriorVisualReference='BRAND_FAMILY_CABINET__MODEL_SPECIFIC_PANEL_LAYOUT_UNVERIFIED';
 }
 enrichCompressedAirDistribution(){
  this.root.userData.compressedAirDistributionVisualization='LOCAL_DISCHARGE_TREATMENT_RING_MAIN_FUNCTIONAL_REFERENCE';
  this.root.userData.plantCompressedAirRouteVerified=false;
  this.root.userData.airReceiverInstalledVerified=false;
  this.root.userData.airDryerInstalledVerified=false;
  this.root.userData.lineFilterPackageInstalledVerified=false;
  this.root.userData.ringMainInstalledVerified=false;
  this.root.userData.pressureValuesAreNormalized=true;
  this.root.userData.distributionDesignReference={ringMainPreferred:true,airMainPressureDropReferenceBar:.03,distributionPressureDropReferenceBar:.03,connectionPressureDropReferenceBar:.04,dryerPressureDropGuideBar:.20,fixedNetworkPressureDropReferenceMaxBar:.10,installedPressureDropMeasured:false,serviceTakeoffCondensatePractice:'SWAN_NECK_TOP_TAKEOFF_WHERE_CONDENSATION_RISK_EXISTS',pressureProfileMode:'NORMALIZED_VISUAL_ONLY'};
  const site=this.group(this.root,'compressor-air-distribution','Compressed-Air Discharge & Distribution Reference',[0,0,0],[.18,.10,0]);
  site.userData.installedRouteVerified=false;site.userData.visualizationOnly=true;
  const discharge=this.group(site,'compressor-discharge-piping','Compressor Discharge Piping',[0,0,0],[.12,.08,0]);
  const flex=this.cyl(discharge,.045,.62,[1.52,.80,0],'dark','x');this.tag(flex,'compressor-flexible-discharge-connector-reference','COMPRESSED_AIR_INSTALLATION_REFERENCE');flex.userData.installedGeometryVerified=false;
  const check=this.box(discharge,[.20,.16,.16],[1.86,.80,0],'steel',.015);this.tag(check,'compressor-discharge-check-valve-reference','COMPRESSED_AIR_INSTALLATION_REFERENCE');
  const iso=this.cyl(discharge,.075,.16,[2.08,.80,0],'accent','x');this.tag(iso,'compressor-discharge-isolation-valve-reference','COMPRESSED_AIR_INSTALLATION_REFERENCE');
  const handle=this.box(discharge,[.20,.025,.035],[2.08,.94,0],'dark',.003);this.tag(handle,'compressor-isolation-valve-handle-reference','FUNCTIONAL_REFERENCE');
  const gauge=this.cyl(discharge,.075,.035,[2.27,1.03,0],'glass','z');this.tag(gauge,'compressor-discharge-pressure-gauge-reference','FUNCTIONAL_REFERENCE');gauge.userData.pressureScaleVerified=false;

  const receiver=this.group(site,'compressor-air-receiver-boundary','Air Receiver Boundary',[0,0,0],[.10,.08,.10]);receiver.userData.installedOptionVerified=false;
  const vessel=this.cyl(receiver,.36,1.35,[2.48,.82,0],'steel','y');this.tag(vessel,'compressed-air-receiver-reference','SYSTEM_OPTION_BOUNDARY');vessel.userData.installedVolumeVerified=false;
  for(const y of [.25,1.39])this.tag(this.cyl(receiver,.20,.10,[2.48,y,0],'dark','y'),'receiver-end-reference','SYSTEM_OPTION_BOUNDARY');
  const relief=this.cyl(receiver,.035,.18,[2.48,1.61,0],'accent','y');this.tag(relief,'receiver-safety-relief-reference','SYSTEM_SAFETY_REFERENCE');
  const recvGauge=this.cyl(receiver,.070,.035,[2.80,1.18,0],'glass','z');this.tag(recvGauge,'receiver-pressure-gauge-reference','SYSTEM_OPTION_BOUNDARY');
  const drain=this.cyl(receiver,.022,.28,[2.48,.06,0],'dark','y');this.tag(drain,'receiver-condensate-drain-reference','CONDENSATE_MANAGEMENT_REFERENCE');

  const treatment=this.group(site,'compressor-air-treatment-boundary','Dryer / Filtration Boundary',[0,0,0],[.12,.08,.08]);treatment.userData.installedConfigurationVerified=false;
  const dryer=this.box(treatment,[.72,1.02,.82],[3.35,.64,0],'glass',.035);this.tag(dryer,'compressed-air-dryer-option-boundary','SYSTEM_OPTION_BOUNDARY');dryer.userData.installedOptionVerified=false;
  const pre=this.cyl(treatment,.095,.34,[2.95,.72,-.54],'filter','y');this.tag(pre,'compressed-air-prefilter-option-reference','SYSTEM_OPTION_BOUNDARY');pre.userData.installedOptionVerified=false;
  const post=this.cyl(treatment,.085,.34,[3.75,.72,-.54],'filter','y');this.tag(post,'compressed-air-postfilter-option-reference','SYSTEM_OPTION_BOUNDARY');post.userData.installedOptionVerified=false;
  const preLink=this.cyl(treatment,.032,.40,[3.15,.72,-.54],'blue','x');this.tag(preLink,'compressed-air-prefilter-to-dryer-reference','SYSTEM_OPTION_BOUNDARY');
  const postLink=this.cyl(treatment,.032,.40,[3.55,.72,-.54],'blue','x');this.tag(postLink,'compressed-air-dryer-to-postfilter-reference','SYSTEM_OPTION_BOUNDARY');
  const bypass=this.cyl(treatment,.026,.86,[3.35,1.30,-.54],'blue','x');this.tag(bypass,'compressed-air-dryer-bypass-reference','SYSTEM_OPTION_BOUNDARY');bypass.userData.installedOptionVerified=false;
  for(const x of [2.92,3.35,3.78]){const valve=this.cyl(treatment,.050,.11,[x,1.30,-.54],'accent','x');this.tag(valve,'compressed-air-dryer-bypass-valve-reference','SYSTEM_OPTION_BOUNDARY');valve.userData.installedOptionVerified=false;}
  const tDrain=this.cyl(treatment,.020,.24,[3.35,.08,.36],'dark','y');this.tag(tDrain,'air-treatment-condensate-drain-reference','CONDENSATE_MANAGEMENT_REFERENCE');

  const ring=this.group(site,'compressor-ring-main-reference','Closed-Loop Ring Main Reference',[0,0,0],[.14,.08,0]);ring.userData.installedRouteVerified=false;
  const y=1.48,x0=4.15,x1=7.05,z0=-1.10,z1=1.10;
  for(const z of [z0,z1]){const p=this.cyl(ring,.038,x1-x0,[(x0+x1)/2,y,z],'blue','x');this.tag(p,'compressed-air-ring-main-reference','DISTRIBUTION_FUNCTIONAL_REFERENCE');p.userData.installedDiameterVerified=false;}
  for(const x of [x0,x1]){const p=this.cyl(ring,.038,z1-z0,[x,y,0],'blue','z');this.tag(p,'compressed-air-ring-main-reference','DISTRIBUTION_FUNCTIONAL_REFERENCE');p.userData.installedDiameterVerified=false;}
  const feed=this.cyl(ring,.038,1.10,[4.05,1.15,0],'blue','y');this.tag(feed,'compressed-air-main-riser-reference','DISTRIBUTION_FUNCTIONAL_REFERENCE');
  const link=this.cyl(ring,.038,.84,[3.63,.80,0],'blue','x');this.tag(link,'compressed-air-treatment-to-riser-reference','DISTRIBUTION_FUNCTIONAL_REFERENCE');

  for(const [i,x,z] of [[1,4.65,z0],[2,5.60,z1],[3,6.55,z0]]){
   const neckRise=this.cyl(ring,.026,.34,[x,1.65,z],'blue','y');this.tag(neckRise,'compressed-air-swan-neck-rise-reference','DISTRIBUTION_FUNCTIONAL_REFERENCE');neckRise.userData.servicePointIndex=i;
   const neckCross=this.cyl(ring,.026,.32,[x+.16,1.82,z],'blue','x');this.tag(neckCross,'compressed-air-swan-neck-top-takeoff-reference','DISTRIBUTION_FUNCTIONAL_REFERENCE');
   const dropX=x+.32,drop=this.cyl(ring,.026,1.32,[dropX,1.16,z],'blue','y');this.tag(drop,'compressed-air-service-drop-reference','DISTRIBUTION_FUNCTIONAL_REFERENCE');drop.userData.servicePointIndex=i;
   const valve=this.cyl(ring,.055,.12,[dropX,.51,z],'accent','y');this.tag(valve,'compressed-air-service-isolation-valve-reference','DISTRIBUTION_FUNCTIONAL_REFERENCE');
   const offtake=this.cyl(ring,.026,.42,[dropX+.21,.46,z],'blue','x');this.tag(offtake,'compressed-air-service-offtake-reference','DISTRIBUTION_FUNCTIONAL_REFERENCE');
   const pointGauge=this.cyl(ring,.060,.030,[dropX+.10,.70,z-.06],'glass','z');this.tag(pointGauge,'compressed-air-point-pressure-gauge-reference','DISTRIBUTION_FUNCTIONAL_REFERENCE');pointGauge.userData.servicePointIndex=i;pointGauge.userData.pressureScaleVerified=false;
   const drip=this.cyl(ring,.018,.30,[dropX,.30,z],'dark','y');this.tag(drip,'compressed-air-drip-leg-reference','CONDENSATE_MANAGEMENT_REFERENCE');
  }
  const condensate=this.group(site,'compressor-condensate-treatment-boundary','Condensate Collection / Oil-Water Separation Boundary',[0,0,0],[.08,.06,.12]);condensate.userData.installedConfigurationVerified=false;
  const manifold=this.cyl(condensate,.018,2.28,[2.75,.08,.72],'dark','x');this.tag(manifold,'compressor-condensate-collection-manifold-reference','CONDENSATE_MANAGEMENT_REFERENCE');
  for(const x of [1.62,2.48,3.35,3.75]){const leg=this.cyl(condensate,.014,.64,[x,.40,.72],'dark','y');this.tag(leg,'compressor-condensate-collection-leg-reference','CONDENSATE_MANAGEMENT_REFERENCE');}
  const oilWater=this.box(condensate,[.58,.62,.48],[4.20,.34,.72],'glass',.025);this.tag(oilWater,'compressor-oil-water-separator-option-boundary','CONDENSATE_TREATMENT_OPTION_BOUNDARY');oilWater.userData.installedOptionVerified=false;
 }
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
   this.addTwinScrewInternals(ae,'atlas',E);
  }
  if(sep){
   const vessel=P(sep,'atlas-separator-group','Atlas oil / air separator');
   this.tag(this.cyl(vessel,.18,.62,[0,.72,0],'steel','y'),'atlas-oil-air-separator-vessel',E);
   this.tag(this.cyl(vessel,.11,.38,[0,.78,0],'filter','y'),'atlas-oil-separator-element',E);
   const nr=this.cyl(vessel,.050,.14,[-.18,.93,.24],'dark','x');this.tag(nr,'atlas-airend-non-return-valve-reference',E);
   const scavenge=this.cyl(vessel,.010,.46,[.15,.74,.24],'accent','y');this.tag(scavenge,'atlas-separator-scavenge-line-reference',E);
   const mpv=P(sep,'atlas-mpv-group','Atlas minimum pressure valve');this.tag(this.cyl(mpv,.055,.16,[.16,1.05,0],'dark','y'),'atlas-minimum-pressure-valve',E);
  }
  if(circuit){
   const filter=P(circuit,'atlas-oil-filter-group','Atlas oil filter');this.tag(this.cyl(filter,.055,.28,[0,.64,.22],'dark','y'),'atlas-oil-filter',E);
   const thermo=P(circuit,'atlas-thermostat-group','Atlas thermostatic bypass');this.tag(this.box(thermo,[.24,.16,.18],[.12,.86,-.24],'accent',.015),'atlas-thermostatic-bypass-reference',E);
   const ret=P(circuit,'atlas-oil-return-group','Atlas oil return / piping');
   this.tag(this.cyl(ret,.010,.42,[-.10,.88,.18],'steel','y'),'atlas-oil-return-line-reference',E);
   for(const z of [-.28,.28])this.tag(this.cyl(ret,.018,.50,[0,.88,z],'steel','y'),'atlas-oil-air-pipe-reference',E);
   this.tag(this.cyl(ret,.045,.15,[.24,.58,-.18],'dark','x'),'atlas-oil-stop-valve-reference',E);
  }
  if(cool){
   const ac=P(cool,'atlas-aftercooler-group','Atlas compressed-air aftercooler');this.tag(this.box(ac,[.18,.52,.32],[-.22,.80,-.20],'steel',.008),'atlas-compressed-air-aftercooler',E);
   const oc=P(cool,'atlas-oil-cooler-group','Atlas oil cooler');this.tag(this.box(oc,[.18,.52,.32],[.22,.80,-.20],'steel',.008),'atlas-oil-cooler',E);
   for(let y=.52;y<=1.06;y+=.09){this.tag(this.box(ac,[.025,.035,.34],[-.22,y,-.20],'steel',.002),'atlas-aftercooler-fin',E);this.tag(this.box(oc,[.025,.035,.34],[.22,y,-.20],'steel',.002),'atlas-oil-cooler-fin',E);}
   const cond=P(cool,'atlas-condensate-group','Atlas moisture separation / drain');
   this.tag(this.cyl(cond,.10,.20,[-.18,.48,.34],'steel','y'),'atlas-moisture-separator-reference',E);
   this.tag(this.box(cond,[.12,.18,.12],[.12,.46,.38],'accent',.008),'atlas-electronic-condensate-drain-reference',E);
   const outlet=this.cyl(cond,.040,.34,[.34,.72,.34],'blue','x');this.tag(outlet,'atlas-package-air-outlet-reference',E);outlet.userData.installedConnectionSizeVerified=false;
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
   this.addTwinScrewInternals(ae,'kaeser',E);
  }
  if(sep){
   const vessel=P(sep,'kaeser-separator-group','KAESER cooling-fluid separator');
   this.tag(this.cyl(vessel,.19,.64,[0,.72,0],'steel','y'),'kaeser-cooling-fluid-separator-tank',E);
   const cartridge=this.tag(this.cyl(vessel,.105,.34,[0,.80,0],'filter','y'),'kaeser-separator-cartridge-reference',E);cartridge.userData.separatorStageCountVerified=false;
   const cyclone=this.cyl(vessel,.145,.20,[0,.56,0],'dark','y');this.tag(cyclone,'kaeser-separator-preseparation-zone-reference',E);
   const mpv=P(sep,'kaeser-mpv-group','KAESER minimum-pressure check valve');this.tag(this.cyl(mpv,.058,.16,[.17,1.05,0],'dark','y'),'kaeser-minimum-pressure-check-valve',E);
  }
  if(circuit){
   const filter=P(circuit,'kaeser-fluid-filter-group','KAESER ECO fluid filter');this.tag(this.cyl(filter,.060,.28,[0,.64,.22],'dark','y'),'kaeser-eco-fluid-filter-reference',E);
   const thermo=P(circuit,'kaeser-thermostat-group','KAESER thermostatic fluid valve');this.tag(this.box(thermo,[.24,.16,.18],[.12,.86,-.24],'accent',.015),'kaeser-thermostatic-fluid-valve-reference',E);
   this.tag(this.box(thermo,[.11,.10,.10],[-.12,1.02,-.24],'glass',.006),'kaeser-etm-temperature-management-reference',E);
   const lines=P(circuit,'kaeser-fluid-lines-group','KAESER fluid / air circuit');for(const z of [-.28,.28])this.tag(this.cyl(lines,.018,.50,[0,.88,z],'steel','y'),'kaeser-fluid-air-pipe-reference',E);
  }
  if(cool){
   const ac=P(cool,'kaeser-aftercooler-group','KAESER compressed-air aftercooler');this.tag(this.box(ac,[.18,.52,.32],[-.22,.80,-.20],'steel',.008),'kaeser-compressed-air-aftercooler',E);
   const fc=P(cool,'kaeser-fluid-cooler-group','KAESER cooling-fluid cooler');this.tag(this.box(fc,[.18,.52,.32],[.22,.80,-.20],'steel',.008),'kaeser-fluid-cooler',E);
   const cond=P(cool,'kaeser-condensate-group','KAESER centrifugal separator / ECO-DRAIN');
   this.tag(this.cyl(cond,.11,.20,[-.17,.48,.34],'steel','y'),'kaeser-centrifugal-separator-reference',E);
   this.tag(this.box(cond,[.12,.18,.12],[.12,.46,.38],'accent',.008),'kaeser-eco-drain-reference',E);
   const outlet=this.cyl(cond,.040,.34,[.34,.72,.34],'blue','x');this.tag(outlet,'kaeser-package-air-outlet-reference',E);outlet.userData.installedConnectionSizeVerified=false;
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
   this.addTwinScrewInternals(ae,'swan',E);
  }
  if(sep){
   const sg=P(sep,'swan-separation-group','SWAN oil / air separation package boundary');
   const pkg=this.tag(this.cyl(sg,.18,.58,[0,.72,0],'steel','y'),'swan-oil-air-separation-package-reference','SWAN_BRAND_FAMILY_INTERNAL_BOUNDARY');pkg.userData.internalSeparatorTopologyVerified=false;
   const cyclone=this.tag(this.cyl(sg,.14,.18,[0,.56,0],'dark','y'),'swan-cyclonic-preseparator-family-reference','SWAN_TMV_FAMILY_OPTION');cyclone.userData.installedSeriesVerified=false;
   const element=this.tag(this.cyl(sg,.095,.30,[0,.84,0],'filter','y'),'swan-separator-element-family-reference','SWAN_SCREW_FAMILY');element.userData.installedSeriesVerified=false;
  }
  if(circuit){
   const cg=P(circuit,'swan-circuit-group','SWAN oil / air service circuit');
   this.tag(this.cyl(cg,.050,.27,[0,.64,.22],'dark','y'),'swan-oil-circuit-service-reference','SWAN_BRAND_FAMILY_INTERNAL_BOUNDARY');
   for(const z of [-.28,.28])this.tag(this.cyl(cg,.016,.48,[0,.88,z],'steel','y'),'swan-oil-air-line-reference','SWAN_BRAND_FAMILY_INTERNAL_BOUNDARY');
  }
  if(cool){
   const cooler=P(cool,'swan-cooler-group','SWAN built-in oil / air cooler');this.tag(this.box(cooler,[.34,.52,.34],[0,.80,-.20],'steel',.008),'swan-built-in-oil-air-cooler',E);
   for(let y=.56;y<=1.04;y+=.08)this.tag(this.box(cooler,[.025,.030,.36],[0,y,-.20],'steel',.002),'swan-air-oil-cooler-fin-reference',E);
   const outlet=this.cyl(cooler,.040,.32,[.32,.70,.08],'blue','x');this.tag(outlet,'swan-package-air-outlet-reference',E);outlet.userData.installedConnectionSizeVerified=false;
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
  const inlet=this.activeGroup(1),filter=this.activeGroup(2),evap=this.activeGroup(3),supply=this.activeGroup(4),outdoor=this.activeGroup(5),circuit=this.activeGroup(6),ctl=this.activeGroup(7);
  this.root.userData.detailPass='V132_SANSIN_INDOOR_OUTDOOR_DUCT_AIRFLOW_RECONSTRUCTION';
  this.root.userData.exactSansinModelVerified=false;
  this.root.userData.familyCandidates=['YZKJ-45N','YZKJ-90N'];
  this.root.userData.exactCoolingCapacityVerified=false;
  this.root.userData.familyPublishedCapacityKw=[50,100];
  this.root.userData.familyCapacityApplicabilityVerified=false;
  this.root.userData.sansinBoundary='Brand SANSIN is verified by BMJ; YZKJ family architecture is a reference, not an exact 45N/90N installation claim.';
  this.root.userData.airTreatmentSequence=['FILTER','HONEYCOMB_WET_CURTAIN_PRECOOL','LOW_TEMPERATURE_FIN_EVAPORATOR','SUPPLY_FAN'];
  this.root.userData.outdoorCircuitBoundary='REFRIGERATION_AND_EVAPORATIVE_CONDENSER_FAMILY_REFERENCE';
  this.root.userData.airDistributionVisualization='SANSIN_INDOOR_SUPPLY_RETURN_DUCT_FAMILY_REFERENCE';
  this.root.userData.plantDuctRouteVerified=false;
  this.root.userData.indoorOutdoorArrangementVerified=false;

  const site=this.group(this.root,'sansin-air-distribution','SANSIN Indoor / Outdoor Air Distribution Reference',[0,0,0],[0,.14,0]);
  site.userData.installedRouteVerified=false;site.userData.familyReference=true;
  const indoorBase=this.box(site,[3.00,.11,1.78],[-.68,.12,-.25],'dark',.018);this.tag(indoorBase,'sansin-indoor-unit-base-reference','SANSIN_NES_FAMILY');indoorBase.userData.engineeringDimensions=false;
  const outdoorBase=this.box(site,[1.42,.13,1.68],[1.45,.13,1.45],'dark',.018);this.tag(outdoorBase,'sansin-outdoor-unit-pad-reference','SANSIN_NES_FAMILY');outdoorBase.userData.installedPadVerified=false;outdoorBase.userData.engineeringDimensions=false;
  const supplyDuct=this.group(site,'sansin-supply-duct','SANSIN Conditioned-Air Supply Duct',[0,0,0],[.14,.08,0]);
  const flex=this.box(supplyDuct,[.42,1.18,1.28],[.76,1.10,-.25],'dark',.015);this.tag(flex,'sansin-supply-flexible-connector-reference','SANSIN_NES_FAMILY');
  for(const x of [.64,.75,.86])this.tag(this.box(supplyDuct,[.022,1.22,1.32],[x,1.10,-.25],'steel',.002),'sansin-supply-flex-rib-reference','FUNCTIONAL_REFERENCE');
  const trunk=this.box(supplyDuct,[2.85,.44,.70],[2.30,1.68,-.25],'steel',.012);this.tag(trunk,'sansin-supply-duct-trunk-reference','AIR_DISTRIBUTION_FUNCTIONAL_REFERENCE');trunk.userData.installedRouteVerified=false;
  const branch=this.box(supplyDuct,[.56,.38,2.15],[3.46,1.68,-.25],'steel',.010);this.tag(branch,'sansin-supply-branch-reference','AIR_DISTRIBUTION_FUNCTIONAL_REFERENCE');
  for(const z of [-1.00,.50]){const diffuser=this.box(supplyDuct,[.70,.055,.70],[3.55,1.28,z],'body',.006);this.tag(diffuser,'sansin-supply-diffuser-reference','AIR_DISTRIBUTION_FUNCTIONAL_REFERENCE');diffuser.userData.installedCountVerified=false;}
  const returnDuct=this.group(site,'sansin-return-duct','SANSIN Return / Outdoor-Air Duct Reference',[0,0,0],[-.12,.08,.08]);returnDuct.userData.installedRouteVerified=false;
  const ret=this.box(returnDuct,[5.65,.38,.50],[.55,2.25,1.52],'steel',.010);this.tag(ret,'sansin-return-duct-trunk-reference','CONFIGURATION_BOUNDARY');
  const retDrop=this.box(returnDuct,[.46,1.12,.50],[-2.18,1.70,1.52],'steel',.010);this.tag(retDrop,'sansin-return-drop-reference','CONFIGURATION_BOUNDARY');
  const retLink=this.box(returnDuct,[.46,.48,1.72],[-2.18,1.12,.66],'steel',.010);this.tag(retLink,'sansin-return-inlet-interface-reference','CONFIGURATION_BOUNDARY');
  const outdoorInterface=this.group(site,'sansin-outdoor-interface','Outdoor Heat-Rejection Air Interface',[0,0,0],[.10,.08,.10]);
  const guard=this.cyl(outdoorInterface,.38,.055,[1.45,1.48,1.45],'steel','y');this.tag(guard,'sansin-outdoor-fan-guard-reference','SANSIN_NES_FAMILY');guard.userData.installedFanCountVerified=false;

  if(inlet){
   const damper=this.findNode('sansin-inlet-damper');
   if(damper){for(const y of [.58,.86,1.14,1.42]){const d=this.box(damper,[.055,.055,1.28],[0,y,0],'steel',.004);d.rotation.z=-.18;this.tag(d,'sansin-return-inlet-damper','SANSIN_NES_FAMILY');}this.tag(this.box(damper,[.08,.18,.12],[.28,1.00,.58],'dark',.006),'sansin-damper-actuator-reference','SANSIN_NES_FAMILY');}
  }
  if(filter){
   const bank=this.findNode('sansin-filter-net');
   if(bank){for(const x of [-.11,.11]){const panel=this.box(bank,[.045,1.38,1.28],[x,1.10,0],'filter',.004);this.tag(panel,'sansin-filter-net-layer','NES_YZKJ_FAMILY');panel.userData.filterLayerReference=x<0?1:2;}}
   const mix=this.findNode('sansin-mixing');
   if(mix){for(const z of [-.42,0,.42])this.tag(this.box(mix,[.30,.035,.24],[.22,.78,z],'steel',.004),'sansin-air-distribution-baffle','FUNCTIONAL_REFERENCE');mix.userData.exactMixingTopologyVerified=false;}
  }
  if(evap){
   const pad=this.findNode('sansin-wet-curtain');
   if(pad){const wet=this.box(pad,[.12,1.42,1.28],[-.16,1.08,0],'accent',.006);this.tag(wet,'honeycomb-wet-curtain','NES_YZKJ_FAMILY');wet.userData.evapPrecoolStage=true;for(let y=.50;y<=1.60;y+=.11)this.tag(this.box(pad,[.014,.025,1.20],[-.10,y,0],'blue',.001),'wet-curtain-water-distribution-reference','NES_YZKJ_FAMILY');}
   const coil=this.findNode('sansin-evaporator');
   if(coil){for(let y=.52;y<=1.60;y+=.10)this.tag(this.box(coil,[.050,.025,1.24],[.16,y,0],'blue',.002),'sansin-evaporator-fin','NES_YZKJ_FAMILY');for(const z of [-.52,.52])this.tag(this.cyl(coil,.035,.18,[.28,1.06,z],'accent','z'),'sansin-evaporator-header-reference','NES_YZKJ_FAMILY');coil.userData.exactCoilRowsVerified=false;}
  }
  if(supply){
   const fan=this.findNode('sansin-supply-fan');
   if(fan){const wheel=this.motion(this.cyl(fan,.40,.22,[0,1.12,0],'dark','z'),'spin','z',7,.01,0,null);this.tag(wheel,'sansin-indoor-supply-fan','NES_YZKJ_FAMILY');wheel.userData.installedFanGeometryVerified=false;for(let k=0;k<8;k++){const b=this.box(fan,[.30,.025,.07],[0,1.12,0],'steel',.003);b.rotation.z=k*Math.PI/4;this.tag(b,'sansin-supply-fan-blade-reference','FUNCTIONAL_REFERENCE');}}
   const plenum=this.findNode('sansin-supply-plenum');
   if(plenum)this.tag(this.box(plenum,[.48,1.35,1.30],[.18,1.08,0],'accent',.015),'sansin-conditioned-air-plenum','NES_YZKJ_FAMILY');
  }
  if(outdoor){
   const comp=this.findNode('sansin-compressor');
   if(comp){const pkg=this.cyl(comp,.14,.52,[.18,.62,0],'dark','y');this.tag(pkg,'sansin-refrigeration-compressor-reference','NES_YZKJ_FAMILY');pkg.userData.installedCompressorModelVerified=false;}
   const cond=this.findNode('sansin-condenser');
   if(cond){for(let y=.48;y<=1.34;y+=.10)this.tag(this.box(cond,[.045,.025,1.20],[-.20,y,0],'steel',.002),'sansin-evaporative-condenser-fin-reference','NES_YZKJ_FAMILY');const wet=this.box(cond,[.10,.96,1.24],[-.31,.90,0],'blue',.004);this.tag(wet,'sansin-condenser-wet-section-reference','NES_YZKJ_FAMILY');}
   const fan=this.findNode('sansin-outdoor-fan');
   if(fan){fan.userData.installedFanCountVerified=false;const cf=this.motion(this.cyl(fan,.27,.10,[.14,1.45,0],'dark','z'),'spin','z',8,.01,0,null);this.tag(cf,'sansin-outdoor-condenser-fan-reference','NES_YZKJ_FAMILY');cf.userData.modeledReferenceFanCount=1;}
  }
  if(circuit){
   const ref=this.findNode('sansin-refrigerant');
   if(ref){for(const z of [-.30,.30]){const line=this.cyl(ref,.018,.84,[0,.76,z],'blue','y');this.tag(line,'sansin-refrigerant-line-reference','NES_YZKJ_FAMILY');line.userData.familyRefrigerant='R410A';line.userData.installedChargeVerified=false;}this.tag(this.box(ref,[.24,.16,.20],[.18,.55,.28],'accent',.012),'sansin-refrigerant-valve-manifold-reference','FUNCTIONAL_REFERENCE');}
   const water=this.findNode('sansin-water-circuit');
   if(water){this.tag(this.box(water,[.42,.28,.46],[-.15,.40,-.28],'accent',.018),'sansin-water-tank-reference','NES_YZKJ_FAMILY');this.tag(this.cyl(water,.075,.18,[.18,.46,-.28],'dark','x'),'sansin-water-pump-reference','NES_YZKJ_FAMILY');this.tag(this.cyl(water,.055,.22,[.30,.65,-.28],'filter','y'),'sansin-water-filter-reference','NES_YZKJ_FAMILY');for(const z of [-.34,.34])this.tag(this.cyl(water,.014,.72,[-.02,.82,z],'blue','y'),'sansin-water-recirculation-line','NES_YZKJ_FAMILY');}
   const inter=this.group(circuit,'sansin-indoor-outdoor-interconnect','Indoor / Outdoor Refrigerant Interconnect',[0,0,0],[.10,.06,.10]);inter.userData.installedRoutingVerified=false;
   for(const offset of [-.08,.08]){
    const runX=this.cyl(inter,.018,1.58,[.50,.82,.42+offset],'blue','x');this.tag(runX,'sansin-refrigerant-interconnect-reference','NES_YZKJ_FAMILY');runX.userData.familyRefrigerant='R410A';runX.userData.installedChargeVerified=false;
    const runZ=this.cyl(inter,.018,1.02,[1.29,.82,.93+offset],'blue','z');this.tag(runZ,'sansin-refrigerant-riser-reference','NES_YZKJ_FAMILY');runZ.userData.installedRoutingVerified=false;
    const outdoorDrop=this.cyl(inter,.018,.55,[1.29,.55,1.44+offset],'blue','y');this.tag(outdoorDrop,'sansin-outdoor-refrigerant-drop-reference','NES_YZKJ_FAMILY');outdoorDrop.userData.installedRoutingVerified=false;
   }
  }
  if(ctl){
   const hmi=this.findNode('sansin-controller');
   if(hmi)this.tag(this.box(hmi,[.32,.24,.025],[-.02,1.02,.31],'glass',.008),'sansin-cooling-controller-reference','SANSIN_NES_FAMILY');
   const elec=this.findNode('sansin-electrical');
   if(elec){this.tag(this.box(elec,[.38,.42,.30],[0,.56,.48],'dark',.02),'sansin-electrical-panel','SANSIN_NES_FAMILY');for(const y of [.47,.58,.69])this.tag(this.box(elec,[.18,.025,.18],[.02,y,.31],'steel',.002),'sansin-electrical-module-reference','CONTROL_REFERENCE');}
  }
 }
 enrichAHU(sansin=false){
  if(sansin)return this.enrichSansin();
  const intake=this.activeGroup(1),filter=this.activeGroup(2),coil=this.activeGroup(3),drain=this.activeGroup(4),fanUnit=this.activeGroup(5),service=this.activeGroup(6),out=this.activeGroup(7);
  this.root.userData.detailPass='V132_EUROVENT_SECTIONAL_AHU_DUCT_AIRFLOW_RECONSTRUCTION';
  this.root.userData.exactAhuModelVerified=false;
  this.root.userData.sectionOrderVerified=false;
  this.root.userData.airflowDirectionVerified=false;
  this.root.userData.filterClassVerified=false;
  this.root.userData.coilTypeVerified=false;
  this.root.userData.fanTypeVerified=false;
  this.root.userData.visualizedSectionOrder='CANONICAL_FUNCTIONAL_REFERENCE_ONLY';
  this.root.userData.airDistributionVisualization='SUPPLY_RETURN_DUCT_FUNCTIONAL_REFERENCE';
  this.root.userData.plantDuctRouteVerified=false;
  this.root.userData.outdoorCondensingUnitAssumed=false;
  this.root.userData.outdoorInterfaceBoundary='OUTDOOR_AIR_INTAKE_TERMINATION_ONLY__NO_CONDENSER_ASSUMED';

  // Unit-level ducting is intentionally a functional reference because plant routing and AHU placement are not yet verified.
  const airDist=this.group(this.root,'ahu-air-distribution','Supply / Return Ducting Reference',[0,0,0],[0,.14,0]);
  airDist.userData.installedRouteVerified=false;airDist.userData.visualizationOnly=true;
  const supplyDuct=this.group(airDist,'ahu-supply-duct','Supply Duct / Diffuser Reference',[0,0,0],[.16,.08,0]);
  const flex=this.box(supplyDuct,[.46,1.24,1.34],[3.58,1.04,0],'dark',.015);this.tag(flex,'ahu-flexible-supply-connector-reference','EUROVENT_FUNCTIONAL_REFERENCE');flex.userData.installedGeometryVerified=false;
  for(const x of [3.42,3.54,3.66,3.78]){const rib=this.box(supplyDuct,[.025,1.28,1.38],[x,1.04,0],'steel',.003);this.tag(rib,'ahu-flexible-connector-rib-reference','FUNCTIONAL_REFERENCE');}
  const trunk=this.box(supplyDuct,[2.95,.46,.74],[4.98,1.68,0],'steel',.012);this.tag(trunk,'ahu-supply-duct-trunk-reference','AIR_DISTRIBUTION_FUNCTIONAL_REFERENCE');trunk.userData.installedRouteVerified=false;
  const branch=this.box(supplyDuct,[.62,.40,2.25],[6.18,1.68,0],'steel',.010);this.tag(branch,'ahu-supply-branch-reference','AIR_DISTRIBUTION_FUNCTIONAL_REFERENCE');branch.userData.installedRouteVerified=false;
  for(const z of [-.86,.86]){const neck=this.box(supplyDuct,[.52,.38,.42],[6.32,1.45,z],'steel',.008);this.tag(neck,'ahu-supply-drop-reference','AIR_DISTRIBUTION_FUNCTIONAL_REFERENCE');const diffuser=this.box(supplyDuct,[.72,.055,.72],[6.36,1.23,z],'body',.006);this.tag(diffuser,'ahu-ceiling-diffuser-reference','AIR_DISTRIBUTION_FUNCTIONAL_REFERENCE');diffuser.userData.installedCountVerified=false;}
  const returnDuct=this.group(airDist,'ahu-return-duct','Return-Air Duct Reference',[0,0,0],[-.12,.08,.08]);returnDuct.userData.installedConfigurationVerified=false;
  const returnTrunk=this.box(returnDuct,[8.55,.38,.52],[.72,2.28,1.28],'steel',.010);this.tag(returnTrunk,'ahu-return-duct-trunk-reference','CONFIGURATION_BOUNDARY');returnTrunk.userData.installedRouteVerified=false;
  const returnDrop=this.box(returnDuct,[.48,1.18,.52],[-3.48,1.70,1.28],'steel',.010);this.tag(returnDrop,'ahu-return-drop-reference','CONFIGURATION_BOUNDARY');
  const returnLink=this.box(returnDuct,[.48,.52,1.32],[-3.48,1.10,.66],'steel',.010);this.tag(returnLink,'ahu-return-mixing-interface-reference','CONFIGURATION_BOUNDARY');
  for(const z of [-.84,.84]){const grille=this.box(returnDuct,[.08,.70,.54],[4.78,1.82,z],'body',.006);this.tag(grille,'ahu-return-grille-reference','CONFIGURATION_BOUNDARY');grille.userData.installedCountVerified=false;}
  const outdoorIntake=this.group(airDist,'ahu-outdoor-intake','Outdoor-Air Intake Termination',[0,0,0],[-.12,.08,0]);outdoorIntake.userData.installedTerminationVerified=false;
  const hood=this.box(outdoorIntake,[.68,1.32,1.46],[-3.76,1.06,0],'body',.018);this.tag(hood,'ahu-weather-hood-boundary','EUROVENT_OUTDOOR_AIR_REFERENCE');hood.userData.optionReference=true;
  for(let y=.58;y<=1.50;y+=.18){const louvre=this.box(outdoorIntake,[.055,.055,1.28],[-4.12,y,0],'steel',.003);louvre.rotation.z=-.20;this.tag(louvre,'ahu-outdoor-air-louvre-reference','EUROVENT_OUTDOOR_AIR_REFERENCE');}
  const bird=this.box(outdoorIntake,[.025,1.12,1.24],[-4.17,1.05,0],'filter',.002);this.tag(bird,'ahu-intake-screen-reference','FUNCTIONAL_REFERENCE');
  for(const x of [-3.15,-1.95,-.75,.75,1.95,3.15])for(const z of [-.72,.72]){const mount=this.box(airDist,[.16,.10,.16],[x,.13,z],'dark',.008);this.tag(mount,'ahu-vibration-isolator-reference','INSTALLATION_FUNCTION_REFERENCE');}

  if(intake){
   const damper=this.findNode('ahu-inlet-damper');
   if(damper){for(const y of [.55,.80,1.05,1.30,1.55]){const d=this.box(damper,[.055,.055,1.34],[0,y,0],'steel',.004);d.rotation.z=-.18;this.tag(d,'opposed-blade-damper-reference','EUROVENT_FUNCTIONAL_REFERENCE');}this.tag(this.box(damper,[.08,.18,.12],[.28,1.04,.62],'dark',.006),'damper-actuator-reference','FUNCTIONAL_REFERENCE');}
   const mix=this.findNode('ahu-mixing-boundary');
   if(mix){mix.userData.installedConfigurationVerified=false;const env=this.box(mix,[.40,.92,1.30],[-.20,1.02,0],'glass',.010);env.userData.optionReference=true;this.tag(env,'outdoor-return-mixing-boundary','CONFIGURATION_BOUNDARY');}
  }
  if(filter){
   const bank=this.findNode('ahu-filter-bank');
   if(bank){for(const x of [-.20,0,.20]){const fp=this.box(bank,[.055,1.38,1.38],[x,1.02,0],'filter',.004);fp.rotation.y=x<0?.12:x>0?-.12:0;this.tag(fp,'ahu-filter-panel-reference','EUROVENT_FUNCTIONAL_REFERENCE');}bank.userData.installedFilterClassVerified=false;}
   const dp=this.findNode('ahu-filter-dp');
   if(dp){for(const x of [-.28,.28])this.tag(this.cyl(dp,.012,.12,[x,1.26,-.70],'accent','z'),'filter-pressure-tap-reference','MAINTENANCE_FUNCTION_REFERENCE');this.tag(this.box(dp,[.12,.16,.05],[0,1.30,-.72],'glass',.004),'filter-differential-pressure-indicator-reference','MAINTENANCE_FUNCTION_REFERENCE');}
  }
  if(coil){
   const face=this.findNode('ahu-cooling-coil');
   if(face){for(let y=.48;y<=1.50;y+=.09)this.tag(this.box(face,[.045,.025,1.30],[0,y,0],'steel',.002),'cooling-coil-fin-reference','EUROVENT_FUNCTIONAL_REFERENCE');face.userData.installedCoilFluidVerified=false;face.userData.installedCoilRowsVerified=false;}
   const hdr=this.findNode('ahu-coil-headers');
   if(hdr){for(const z of [-.55,.55])this.tag(this.cyl(hdr,.035,.18,[.26,.98,z],'accent','z'),'cooling-coil-header-reference','EUROVENT_FUNCTIONAL_REFERENCE');for(const y of [.72,1.24])this.tag(this.cyl(hdr,.025,.24,[.31,y,.56],'accent','x'),'coil-connection-reference','FUNCTIONAL_REFERENCE');}
  }
  if(drain){
   const pan=this.findNode('ahu-drain-pan');
   if(pan){const p=this.box(pan,[.78,.055,1.42],[0,.38,0],'steel',.008);p.rotation.z=-.015;this.tag(p,'sloped-condensate-drain-pan','EUROVENT_6_18');}
   const trap=this.findNode('ahu-drain-trap');
   if(trap){this.tag(this.cyl(trap,.020,.24,[.28,.27,.56],'dark','y'),'condensate-drain-drop-reference','EUROVENT_6_18');this.tag(this.cyl(trap,.020,.22,[.38,.15,.56],'dark','x'),'condensate-trap-horizontal-reference','EUROVENT_6_18');this.tag(this.cyl(trap,.020,.18,[.49,.24,.56],'dark','y'),'condensate-trap-rise-reference','EUROVENT_6_18');}
   const drop=this.findNode('ahu-droplet-option');
   if(drop){drop.userData.installedOptionVerified=false;const env=this.box(drop,[.08,1.32,1.28],[.28,1.00,0],'glass',.006);env.userData.optionReference=true;this.tag(env,'droplet-eliminator-option-boundary','EUROVENT_OPTION_CRITERIA');}
  }
  if(fanUnit){
   const fan=this.findNode('ahu-supply-fan');
   if(fan){fan.userData.installedFanTypeVerified=false;const wheel=this.motion(this.cyl(fan,.40,.22,[0,1.05,0],'dark','z'),'spin','z',7,.01,0,null);this.tag(wheel,'supply-fan-wheel-reference','AHU_FUNCTIONAL_REFERENCE');for(let k=0;k<10;k++){const blade=this.box(fan,[.30,.025,.07],[0,1.05,0],'steel',.003);blade.rotation.z=k*Math.PI/5;this.tag(blade,'supply-fan-blade-reference','FUNCTIONAL_REFERENCE');}}
   const drive=this.findNode('ahu-fan-drive');
   if(drive){drive.userData.installedDriveTypeVerified=false;this.tag(this.cyl(drive,.10,.32,[.34,.75,.55],'dark','x'),'supply-fan-motor-reference','AHU_FUNCTIONAL_REFERENCE');const env=this.box(drive,[.28,.18,.22],[.16,.72,.38],'glass',.008);env.userData.optionReference=true;this.tag(env,'fan-drive-type-boundary','CONFIGURATION_BOUNDARY');}
  }
  if(service){
   const door=this.findNode('ahu-service-door');
   if(door){this.tag(this.box(door,[.70,.92,.035],[0,1.02,-.92],'body',.018),'ahu-service-door','AHU_FUNCTIONAL_REFERENCE');this.tag(this.cyl(door,.018,.30,[.27,1.02,-.95],'dark','y'),'service-door-handle','AHU_FUNCTIONAL_REFERENCE');}
  }
  if(out){
   const plenum=this.findNode('ahu-discharge-plenum');
   if(plenum){this.tag(this.box(plenum,[.60,1.25,1.36],[.08,1.02,0],'accent',.015),'ahu-discharge-plenum','AHU_FUNCTIONAL_REFERENCE');plenum.userData.installedDuctDirectionVerified=false;}
   const ctrl=this.findNode('ahu-controller');
   if(ctrl){this.tag(this.box(ctrl,[.24,.18,.025],[-.12,1.30,-.72],'glass',.008),'ahu-controller-reference','CONTROL_FUNCTION_REFERENCE');for(const y of [.84,1.10])this.tag(this.box(ctrl,[.06,.08,.05],[.24,y,-.70],'accent',.004),'ahu-temperature-pressure-sensor-reference','CONTROL_FUNCTION_REFERENCE');}
  }
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
  this.palette.body=0xe8e8e3;this.palette.accent=0x3d735d;this.palette.dark=0x273034;this.palette.orange=0xc77732;
  this.base(11.7,1.95);
  const xs=[-5.0,-3.45,-1.75,0,1.75,3.55,5.0];
  const widths=[1.32,1.46,1.52,1.40,1.52,1.48,1.26];
  for(let i=1;i<=7;i++){
   const {g,a}=this.mod(i,[xs[i-1],0,0],[Math.sign(xs[i-1]||1)*.45,.20,0]),w=widths[i-1];
   for(const z of [-.74,.74]){
    this.cover(this.box(g,[w,.07,.07],[0,.36,z],'dark',.010));
    for(const x of [-w*.43,w*.43])this.cover(this.box(g,[.07,.70,.07],[x,.67,z],'steel',.010));
   }
   this.cover(this.box(g,[w,.07,1.56],[0,.34,0],'dark',.012));

   if(i===1){
    this.group(a,'fgm2-feed-table','Blank stack / feeder table',[0,0,0],[0,.10,.10]);
    this.group(a,'fgm2-feed-drive','Feeder transport',[0,0,0],[0,.12,.12]);
    this.group(a,'fgm2-feed-separator','Blank separation',[0,0,0],[0,.12,.12]);
   }else if(i===2){
    this.group(a,'fgm2-aligner','Blank alignment',[0,0,0],[0,.12,.12]);
    this.group(a,'fgm2-prebreaker','Prebreaker',[0,0,0],[0,.14,.14]);
   }else if(i===3){
    this.group(a,'fgm2-primary-fold','Primary folding belts',[0,0,0],[0,.14,.14]);
    const lock=this.group(a,'fgm2-lockbottom-boundary','Crash-lock capability boundary',[0,0,0],[0,.18,.16]);lock.userData.installedOptionVerified=false;
    const corner=this.group(a,'fgm2-corner-boundary','4 / 6-corner capability boundary',[0,0,0],[0,.18,-.16]);corner.userData.installedOptionVerified=false;
   }else if(i===4){
    this.group(a,'fgm2-glue-supply','Glue supply',[0,0,0],[0,.12,.12]);
    const app=this.group(a,'fgm2-glue-applicator-boundary','Glue applicator capability boundary',[0,0,0],[0,.18,.16]);app.userData.installedOptionVerified=false;
    const detect=this.group(a,'fgm2-glue-detection-boundary','Glue detection capability boundary',[0,0,0],[0,.18,-.16]);detect.userData.installedOptionVerified=false;
   }else if(i===5){
    this.group(a,'fgm2-final-fold','Final folding belts',[0,0,0],[0,.14,.14]);
    this.group(a,'fgm2-squaring','Squaring / guides',[0,0,0],[0,.14,.14]);
   }else if(i===6){
    this.group(a,'fgm2-compression-belts','Compression conveyor',[0,0,0],[0,.14,.14]);
    this.group(a,'fgm2-pressure-reference','Pressure adjustment',[0,0,0],[0,.14,.14]);
   }else{
    this.group(a,'fgm2-delivery','Delivery conveyor',[0,0,0],[0,.12,.12]);
    const count=this.group(a,'fgm2-counter-boundary','Counter / kicker capability',[0,0,0],[0,.16,.14]);count.userData.installedOptionVerified=false;
    this.group(a,'fgm2-control','Operator control',[0,0,0],[0,.14,.14]);
    const downstream=this.group(a,'fgm2-downstream-boundary','Packing / bundling boundary',[0,0,0],[.18,.12,0]);downstream.userData.installedOptionVerified=false;
   }
  }
  this.root.userData.geometryStatus='MULTI_VENDOR_FOLDER_GLUER_PROCESS_REFERENCE__NOT_MEDIA100_IDENTITY';
  this.root.userData.exactFolderGluerOemVerified=false;
  this.root.userData.exactFolderGluerModelVerified=false;
  this.root.userData.referenceNote='FGM-2 has no OEM/model/serial in the BMJ registry. The former nearest-MEDIA-100-II morphology is removed. This geometry visualizes only common folder-gluer process functions; crash-lock, 4/6-corner, glue-applicator type, glue detection, counter/kicker and downstream packing are explicit unverified boundaries.';
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

  const lowerCab=this.group(this.root,'qf100-lower-cabinet','Lower service cabinet',[0,0,0],[0,.12,0]);
  for(const x of [-1.22,-.40,.42,1.24]){const door=this.cover(this.box(lowerCab,[.72,.58,.055],[x,.36,-.86],'body',.018));this.tag(door,'qf-lower-service-door-reference','QF_CLOSE_FAMILY_VISUAL');const latch=this.cover(this.box(lowerCab,[.035,.11,.026],[x+.25,.37,-.895],'dark',.004));this.tag(latch,'qf-service-door-latch-reference','QF_CLOSE_FAMILY_VISUAL');}
  const stripe=this.cover(this.box(lowerCab,[3.74,.065,.060],[0,.69,-.89],'orange',.006));this.tag(stripe,'qf-family-accent-stripe-reference','QF_CLOSE_FAMILY_VISUAL');
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
  const facade=this.group(this.root,'ctp-family-facade','Suprasetter family facade detail',[0,0,0],[0,.16,0]);
  const entrySlot=this.cover(this.box(facade,[.62,.095,.86],[-1.12,.67,-.82],'dark',.012));this.tag(entrySlot,'ctp-plate-entry-slot-reference','SUPRASETTER_FAMILY_VISUAL');
  const outputSlot=this.cover(this.box(facade,[.58,.085,.82],[1.03,.64,-.82],'dark',.012));this.tag(outputSlot,'ctp-plate-output-slot-reference','SUPRASETTER_FAMILY_VISUAL');
  for(const y of [.56,.68,.80,.92]){const vent=this.cover(this.box(facade,[.52,.030,.040],[.72,y,.81],'dark',.003));this.tag(vent,'ctp-cooling-vent-reference','SUPRASETTER_FAMILY_VISUAL');}
  const hmiPost=this.cover(this.box(facade,[.12,.72,.14],[-1.08,.76,-1.00],'dark',.018));this.tag(hmiPost,'ctp-hmi-post-reference','SUPRASETTER_FAMILY_VISUAL');
  const hmi=this.cover(this.box(facade,[.30,.22,.035],[-1.08,1.18,-1.00],'glass',.010));this.tag(hmi,'ctp-hmi-display-reference','SUPRASETTER_FAMILY_VISUAL');

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
  const facade=this.group(this.root,'ctf-family-facade','SCREEN imagesetter family facade detail',[0,0,0],[0,.16,0]);
  const cassetteDoor=this.cover(this.box(facade,[.64,.78,.055],[-.70,.58,-.58],'body',.030));this.tag(cassetteDoor,'ctf-media-cassette-door-reference','SCREEN_FTR_KATANA_VISUAL');
  const scanDoor=this.cover(this.box(facade,[.70,.82,.055],[.05,.65,-.58],'body',.030));this.tag(scanDoor,'ctf-scanner-service-door-reference','SCREEN_FTR_KATANA_VISUAL');
  const outDoor=this.cover(this.box(facade,[.44,.62,.055],[.72,.53,-.58],'body',.025));this.tag(outDoor,'ctf-output-service-door-reference','SCREEN_FTR_KATANA_VISUAL');
  const mediaSlot=this.cover(this.box(facade,[.42,.060,.060],[.88,.75,-.60],'dark',.008));this.tag(mediaSlot,'ctf-media-output-slot-reference','SCREEN_FTR_KATANA_VISUAL');
  const statusPanel=this.cover(this.box(facade,[.26,.14,.030],[-.64,1.10,-.61],'glass',.008));this.tag(statusPanel,'ctf-status-panel-reference','SCREEN_FTR_KATANA_VISUAL');

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
  this.palette.body=0xdfe3e2;this.palette.dark=0x20272b;this.palette.accent=0x365b68;this.palette.orange=0xe26a2c;this.palette.blue=0x507d92;
  this.base(5.6,2.65);

  const m1=this.mod(1,[0,0,0],[0,.15,0]);
  this.cover(this.box(m1.g,[5.45,.38,2.55],[0,.38,0],'dark',.04));
  this.group(m1.a,'zund-vacuum-bed','Vacuum cutting bed',[0,0,0],[0,.12,.10]);
  this.group(m1.a,'zund-vacuum-zones','Vacuum zone / distribution reference',[0,0,0],[0,.12,.10]);

  const m2=this.mod(2,[0,0,0],[0,.28,.30]);
  this.group(m2.a,'zund-gantry-guide','X-axis gantry guide',[0,0,0],[0,.18,.20]);
  this.group(m2.a,'zund-gantry-beam','Travelling beam',[0,0,0],[0,.20,.22]);

  const m3=this.mod(3,[0,0,0],[0,.35,.36]);
  this.group(m3.a,'zund-carriage-y','Y/Z tool carriage',[0,0,0],[0,.20,.24]);
  this.group(m3.a,'zund-module-slots','Module carrier slots',[0,0,0],[0,.22,.26]);

  const m4=this.mod(4,[0,0,0],[0,.42,.42]);
  for(const [id,name,z] of [
   ['zund-cut-tool-option','Knife / oscillating tool capability',-.30],
   ['zund-crease-option','Creasing capability',-.10],
   ['zund-router-option','Routing capability',.10],
   ['zund-arc-option','ARC toolchanger capability',.30]
  ]){const g=this.group(m4.a,id,name,[0,0,0],[0,.22,z]);g.userData.installedOptionVerified=false;g.userData.simulationEnabled=false;}

  const m5=this.mod(5,[0,0,0],[0,.38,-.40]);
  for(const [id,name,z] of [['zund-icc-option','ICC registration capability',-.20],['zund-iti-option','Tool initialization capability',.20]]){const g=this.group(m5.a,id,name,[0,0,0],[0,.18,z]);g.userData.installedOptionVerified=false;g.userData.simulationEnabled=false;}

  const m6=this.mod(6,[0,0,0],[.45,.18,0]);
  this.group(m6.a,'zund-control','Operator control',[0,0,0],[.14,.10,-.10]);
  this.group(m6.a,'zund-vacuum-generator','Vacuum generator interface',[0,0,0],[.14,.10,.10]);
  const handling=this.group(m6.a,'zund-handling-option','Material handling option boundary',[0,0,0],[.22,.12,0]);handling.userData.installedOptionVerified=false;handling.userData.simulationEnabled=false;

  this.root.userData.exactZundModelVerified=false;
  this.root.userData.familyCandidates=['G3','S3'];
  this.root.userData.installedToolPackageVerified=false;
  this.root.userData.installedCameraRegistrationVerified=false;
  this.root.userData.installedToolInitializationVerified=false;
  this.root.userData.familyVisualEnvelope=[5.6,2.65,1.65];
  this.root.userData.engineeringDimensions=false;
  this.root.userData.referenceNote='BMJ registry confirms Zünd but not exact model/table size/module/tool package. Geometry models the common modular flatbed platform only. Specific cutting, creasing, routing, ARC, ICC, ITI and material-handling equipment are represented solely as option boundaries until the installed configuration is verified.';
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
  this.palette.body=0xdde3e2;this.palette.dark=0x30383b;this.palette.accent=0x4b7480;this.palette.filter=0xc7b783;this.palette.blue=0x52839c;
  this.base(7.10,2.02);
  const xs=[-3.02,-2.02,-1.02,0,1.03,2.08,3.05];
  for(let i=1;i<=7;i++){
   const {g,a}=this.mod(i,[xs[i-1],0,0],[Math.sign(xs[i-1]||1)*.42,.18,0]);this.shell(g,[.94,1.88,1.88],[0,1.02,0]);
   if(i===1){this.group(a,'ahu-inlet-damper','Inlet damper bank');const mix=this.group(a,'ahu-mixing-boundary','Outdoor / return mixing boundary');mix.userData.installedConfigurationVerified=false;}
   else if(i===2){this.group(a,'ahu-filter-bank','Filter bank');this.group(a,'ahu-filter-dp','Filter differential pressure reference');}
   else if(i===3){this.group(a,'ahu-cooling-coil','Cooling / heat-exchange coil');this.group(a,'ahu-coil-headers','Coil headers / connections');}
   else if(i===4){this.group(a,'ahu-drain-pan','Condensate drain pan');this.group(a,'ahu-drain-trap','Condensate drain trap');const d=this.group(a,'ahu-droplet-option','Droplet eliminator capability');d.userData.installedOptionVerified=false;}
   else if(i===5){this.group(a,'ahu-supply-fan','Supply fan');const drive=this.group(a,'ahu-fan-drive','Fan motor / drive boundary');drive.userData.installedDriveTypeVerified=false;}
   else if(i===6)this.group(a,'ahu-service-door','Service access');
   else {this.group(a,'ahu-discharge-plenum','Discharge plenum');this.group(a,'ahu-controller','AHU control / sensors');}
  }
  this.root.userData.exactAhuModelVerified=false;
  this.root.userData.sectionOrderVerified=false;
  this.root.userData.airflowDirectionVerified=false;
  this.root.userData.familyVisualEnvelope=[7.10,2.02,2.10];
  this.root.userData.engineeringDimensions=false;
  this.root.userData.referenceNote='OEM/model and actual section order are unavailable. The displayed order is a Eurovent-neutral functional visualization of damper, filtration, thermal coil, condensate management, fan, service and discharge/control sections. It is not an as-built BMJ section sequence.';
 }
 buildSansinCooling(){
  this.palette.body=0xe3e6e3;this.palette.dark=0x273034;this.palette.accent=0x437563;this.palette.blue=0x497e9d;this.palette.filter=0xc7b783;
  this.base(5.0,2.50);
  const legacyBase=this.findNode('universal-base');if(legacyBase){legacyBase.userData.referencePlaceholder=true;legacyBase.userData.hiddenForIndoorOutdoorSeparation=true;for(const child of legacyBase.children)if(child.isMesh)child.visible=false;}
  // Functional family layout only: the indoor train and outdoor heat-rejection package are separated
  // so their envelopes do not intersect. Site spacing/orientation remains unverified.
  const pos=[[-1.72,0,-.25],[-1.05,0,-.25],[-.38,0,-.25],[.34,0,-.25],[1.45,0,1.45],[.55,0,1.55],[1.72,0,-.62]];
  for(let i=1;i<=7;i++){
   const {g,a}=this.mod(i,pos[i-1],[Math.sign(pos[i-1][0]||1)*.38,.20,0]);
   if(i<=4)this.shell(g,[.66,2.02,1.50],[0,1.10,0]);
   else if(i===5)this.shell(g,[1.08,1.88,1.35],[0,1.02,0]);
   else if(i===6)this.box(g,[.72,.82,.90],[0,.54,0],'dark',.035);
   else this.box(g,[.62,1.28,.58],[0,.78,0],'dark',.04);
   g.userData.packageZone=i<=4?'INDOOR_AIR_TREATMENT':i===5?'OUTDOOR_HEAT_REJECTION':i===6?'OUTDOOR_SERVICE_INTERFACE':'INDOOR_CONTROL';
   if(i===1)this.group(a,'sansin-inlet-damper','Return / outdoor air inlet');
   else if(i===2){this.group(a,'sansin-filter-net','Double filter net');this.group(a,'sansin-mixing','Air mixing / distribution');}
   else if(i===3){this.group(a,'sansin-wet-curtain','Honeycomb wet curtain');this.group(a,'sansin-evaporator','Low-temperature fin evaporator');}
   else if(i===4){this.group(a,'sansin-supply-fan','Indoor supply fan');this.group(a,'sansin-supply-plenum','Conditioned-air plenum');}
   else if(i===5){this.group(a,'sansin-compressor','Refrigeration compressor');this.group(a,'sansin-condenser','Evaporative condenser');const fan=this.group(a,'sansin-outdoor-fan','Outdoor condenser fan reference');fan.userData.installedFanCountVerified=false;}
   else if(i===6){this.group(a,'sansin-refrigerant','Refrigerant circuit');this.group(a,'sansin-water-circuit','Water recirculation circuit');}
   else {this.group(a,'sansin-controller','Cooling controller');this.group(a,'sansin-electrical','Electrical cabinet');}
  }
  this.root.userData.referenceBrandFamily='PT Sansin Indonesia / NES YZKJ industrial central cooling family';
  this.root.userData.exactSansinModelVerified=false;
  this.root.userData.familyCandidates=['YZKJ-45N','YZKJ-90N'];
  this.root.userData.familyCandidateDimensions={
   'YZKJ-45N':{indoor:[1.00,1.40,2.28],outdoor:[.95,1.56,2.16],indoorUnitCount:1},
   'YZKJ-90N':{indoor:[1.00,1.40,2.28],outdoor:[1.37,1.93,2.27],indoorUnitCount:2}
  };
  this.root.userData.familyDuctOptions=['PHENOLIC_DUCTING','BULL_EYE_FIXED_POINT_BLOWER','SOX_FIBRE_OVERALL_DUCTING','SOX_FIXED_POINT_DUCTING'];
  this.root.userData.installedDuctTypeVerified=false;
  this.root.userData.familyVisualEnvelope=[5.0,2.50,2.30];
  this.root.userData.engineeringDimensions=false;
  this.root.userData.referenceNote='Registry verifies SANSIN brand but not model. The twin follows the documented NES/YZKJ two-stage industrial cooling family: filtration, wet-curtain pre-cooling, fin evaporator, indoor supply fan, outdoor refrigeration/evaporative condenser, water/refrigerant services and controls. Public family dimensions and ducting options are stored only as candidate metadata; YZKJ-45N/90N identity, capacity, indoor-unit count and installed duct type are not assigned to the BMJ unit.';
 }

}

export class ReferenceProcessSimulation{
 constructor(root,template){
  this.root=root;this.template=template;this.active=false;this.running=false;this.paused=false;this.speed=1;this.elapsed=0;this.lastNow=null;this.completed=0;this.onUpdate=null;
  this.blocked=template.cfg.evidence.simulation==='BLOCKED';this.blockedReason=this.blocked?template.cfg.evidence.reason:null;
  this.family=template.cfg.family;
  this.stages=template.cfg.profile?.process||template.cfg.modules;if(this.family==='ctp')this.stages=this.stages.filter((_,i)=>i!==4);this.cycle=Math.max(8,this.stages.length*1.35);
  this.motions=this.blocked?[]:template.activeMeshes.filter(m=>m.userData.motion&&!m.userData.referencePlaceholder&&m.userData.simulationEnabled!==false).map(mesh=>({mesh,motion:mesh.userData.motion,position:mesh.position.clone(),quaternion:mesh.quaternion.clone()}));
 this.pathVisible=['compressor','ahu'].includes(this.family);this.inkFlowVisible=false;this.processPiece=null;this.processMaterial=null;this.processGeometry=null;this.blanker=null;this.collator=null;this.collatorSheets=[];this.collatorSheetGeometry=null;this.collatorSheetMaterial=null;this.ctp=null;this.ctpFlatPlate=null;this.ctpFlatGeometry=null;this.ctpWrappedGroup=null;this.ctpWrappedPlate=null;this.ctpWrappedGeometry=null;this.ctpPlateMaterial=null;this.imagesetter=null;this.imagesetterMedia=null;this.imagesetterMediaGeometry=null;this.imagesetterMediaMaterial=null;this.zund=null;this.zundMaterial=null;this.zundMaterialGeometry=null;this.zundMaterialMaterial=null;this.ahu=null;this.ahuParticles=[];this.ahuParticleGeometry=null;this.ahuParticleMaterial=null;this.ahuReturnParticleMaterial=null;this.ahuOutdoorParticleMaterial=null;this.compressor=null;this.compressorParticles=[];this.compressorParticleGeometry=null;this.compressorAmbientMaterial=null;this.compressorAirMaterial=null;this.compressorOilMaterial=null;this.compressorCondensateMaterial=null;this.folder=null;this.folderBlank=null;this.folderGeometries=[];this.folderMaterials=[];if(!this.blocked)this.buildProcessPiece();if(!this.blocked&&this.family==='blanker')this.bindBlanker();if(!this.blocked&&this.family==='collator')this.bindCollator();if(!this.blocked&&this.family==='ctp')this.bindCTP();if(!this.blocked&&this.family==='imagesetter')this.bindImagesetter();if(!this.blocked&&this.family==='zund')this.bindZund();if(!this.blocked&&this.family==='compressor')this.bindCompressor();if(!this.blocked&&this.family==='ahu')this.bindAHU();if(!this.blocked&&this.family==='folder')this.bindFolder();
 }
 buildProcessPiece(){
  const family=this.family;if(['compressor','ahu','collator','ctp','imagesetter','zund','folder'].includes(family))return;
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
  let idx=0,indexing=false,pressing=false,loading=false,separating=false,returning=false,platformAtPress=false,hydraulicPressure=false;
  if(p<.15){idx=0;loading=true;}
  else if(p<.32){idx=1;indexing=true;}
  else if(p<.48){idx=2;indexing=true;}
  else if(p<.58){idx=2;platformAtPress=true;}
  else if(p<.72){idx=3;pressing=true;platformAtPress=true;hydraulicPressure=true;}
  else if(p<.84){idx=4;platformAtPress=true;separating=true;}
  else {idx=6;indexing=true;returning=true;}
  return {p,idx,indexing,pressing,loading,separating,returning,platformAtPress,hydraulicPressure,interlockSafe:!(indexing&&pressing)};
 }
 updateBlanker(){
  if(!this.blanker)return;
  const {p,indexing,pressing,loading,separating}=this.blankerStatus(),b=this.blanker;
  const smooth=t=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t);};
  let x=-.55,z=0,ramDrop=0,sepDrop=0,pieceX=-.55,pieceZ=0;
  if(p<.15){const t=smooth(p/.15);pieceX=THREE.MathUtils.lerp(-1.48,-.55,t);}
  else if(p<.32){const t=smooth((p-.15)/.17);x=THREE.MathUtils.lerp(-.55,0,t);pieceX=x;}
  else if(p<.48){const t=smooth((p-.32)/.16);x=0;z=THREE.MathUtils.lerp(0,.18,t);pieceX=x;pieceZ=z;}
  else if(p<.84){x=0;z=.18;pieceX=x;pieceZ=z;}
  else {const t=smooth((p-.84)/.16);x=THREE.MathUtils.lerp(0,-.55,t);z=THREE.MathUtils.lerp(.18,0,t);pieceX=x;pieceZ=z;}
  if(pressing){const t=(p-.58)/.14;ramDrop=Math.sin(Math.PI*THREE.MathUtils.clamp(t,0,1))*.16;}
  if(separating)sepDrop=.045*smooth((p-.72)/.12);
  if(b.platform){b.platform.position.copy(b.platformRest);b.platform.position.x+=x+.55;b.platform.position.z+=z;}
  if(b.ram){b.ram.position.copy(b.ramRest);b.ram.position.y-=ramDrop;}
  if(this.processPiece){
   this.processPiece.visible=this.active;
   this.processPiece.position.set(pieceX,.81-sepDrop,pieceZ);
   this.processPiece.userData.loadingToPlatform=loading;
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
  rotors.forEach(r=>{if(!r.userData.collatorRestQuaternion)r.userData.collatorRestQuaternion=r.quaternion.clone();});
  this.collator={binCount,rotors,sensors,installedBinCountVerified:this.template.root.userData.installedBinCountVerified===true,activeFeedBins:[],doubleFeedCheckActive:false,gatherTransportActive:false};
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
  const p=(this.elapsed%this.cycle)/this.cycle;
  let activeFeedCount=0,completedInSet=0;
  const activeBins=[],smooth01=v=>{v=THREE.MathUtils.clamp(v,0,1);return v*v*(3-2*v);};
  for(const item of this.collatorSheets){
   const b=item.bin,start=.04+b*.030,end=start+.54,q=(p-start)/(end-start),mesh=item.mesh;
   mesh.visible=this.active;
   if(q<=0){mesh.position.copy(item.start);continue;}
   if(q>=1){mesh.position.set(1.08,.56+b*.010,0);completedInSet++;continue;}
   activeFeedCount++;
   if(q<.30){
    activeBins.push(b);
    const t=smooth01(q/.30);mesh.position.set(THREE.MathUtils.lerp(item.start.x,.48,t),item.start.y,0);
   }else if(q<.72){
    const t=smooth01((q-.30)/.42);mesh.position.set(.58,THREE.MathUtils.lerp(item.start.y,.58,t),0);
   }else{
    const t=smooth01((q-.72)/.28);mesh.position.set(THREE.MathUtils.lerp(.58,1.08,t),.58+b*.010,0);
   }
  }
  for(const rotor of this.collator.rotors){
   const b=rotor.userData.binIndex??-1;rotor.quaternion.copy(rotor.userData.collatorRestQuaternion||new THREE.Quaternion());
   if(activeBins.includes(b))rotor.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(AXIS.z,this.elapsed*11+b*.25));
  }
  this.collator.activeFeedBins=activeBins;this.collator.activeFeedCount=activeFeedCount;this.collator.completedSheetsInSet=completedInSet;
  this.collator.doubleFeedCheckActive=activeFeedCount>0;this.collator.gatherTransportActive=activeFeedCount>0||completedInSet>0;
 }
 bindCTP(){
  const role=target=>{let found=null;this.template.root.traverse(o=>{if(!found&&o.userData?.mechanismRole===target)found=o;});return found;};
  this.ctp={drum:role('external-imaging-drum'),laser:role('heidelberg-laser-carriage'),clamps:[],plateLoaded:false,plateClamped:false,exposureActive:false,laserTraverseActive:false,punchInstalledVerified:this.template.root.userData.suprasetterOptions?.internalPunch==='INSTALLED_VERIFIED'};if(this.ctp.drum)this.ctp.drumRestQuaternion=this.ctp.drum.quaternion.clone();if(this.ctp.laser)this.ctp.laserRestPosition=this.ctp.laser.position.clone();
  this.template.root.traverse(o=>{if(o.userData?.mechanismRole==='plate-clamp-reference')this.ctp.clamps.push(o);});
  this.ctpPlateMaterial=new THREE.MeshStandardMaterial({color:0xbac1c4,roughness:.38,metalness:.22,side:THREE.DoubleSide});
  this.ctpFlatGeometry=new THREE.BoxGeometry(.78,.012,1.00);
  this.ctpFlatPlate=new THREE.Mesh(this.ctpFlatGeometry,this.ctpPlateMaterial);this.ctpFlatPlate.name='SUPRASETTER-FLAT-PLATE-REFERENCE';this.ctpFlatPlate.visible=false;this.root.add(this.ctpFlatPlate);
  const seg=28,r=.355,w=1.00,a0=-Math.PI*.72,a1=Math.PI*.72,verts=[],idx=[];
  for(let i=0;i<=seg;i++){const a=THREE.MathUtils.lerp(a0,a1,i/seg),x=Math.cos(a)*r,y=Math.sin(a)*r;verts.push(x,y,-w/2,x,y,w/2);}
  for(let i=0;i<seg;i++){const j=i*2;idx.push(j,j+2,j+1,j+2,j+3,j+1);}
  this.ctpWrappedGeometry=new THREE.BufferGeometry();this.ctpWrappedGeometry.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));this.ctpWrappedGeometry.setIndex(idx);this.ctpWrappedGeometry.computeVertexNormals();
  this.ctpWrappedGroup=new THREE.Group();this.ctpWrappedGroup.position.set(0,.82,0);this.root.add(this.ctpWrappedGroup);
  this.ctpWrappedPlate=new THREE.Mesh(this.ctpWrappedGeometry,this.ctpPlateMaterial);this.ctpWrappedPlate.name='SUPRASETTER-WRAPPED-PLATE-REFERENCE';this.ctpWrappedPlate.visible=false;this.ctpWrappedGroup.add(this.ctpWrappedPlate);
 }
 ctpStatus(){
  const p=this.active?(this.elapsed%this.cycle)/this.cycle:0;
  let idx=0,loading=false,clamped=false,exposure=false,unloading=false;
  if(p<.20){idx=0;loading=true;}
  else if(p<.27){idx=1;loading=true;}
  else if(p<.34){idx=2;loading=true;clamped=true;}
  else if(p<.78){idx=3;clamped=true;exposure=true;}
  else {idx=4;unloading=true;}
  return {p,idx,loading,clamped,exposure,unloading,laserTraverse:exposure};
 }
 updateCTP(){
  if(!this.ctp)return;
  const s=this.ctpStatus(),smooth=v=>{v=THREE.MathUtils.clamp(v,0,1);return v*v*(3-2*v);},lerp=THREE.MathUtils.lerp;
  const flat=this.ctpFlatPlate,wrap=this.ctpWrappedPlate,group=this.ctpWrappedGroup;
  if(s.p<.30){
   const t=smooth(s.p/.30);flat.visible=this.active;wrap.visible=false;flat.position.set(lerp(-1.10,-.26,t),lerp(.68,.84,t),0);flat.rotation.set(0,0,lerp(0,.14,t));
  }else if(s.p<.78){
   flat.visible=false;wrap.visible=this.active;const t=(s.p-.30)/.48;group.rotation.z=t*Math.PI*5.6;
  }else{
   const t=smooth((s.p-.78)/.22);flat.visible=this.active;wrap.visible=false;flat.position.set(lerp(.28,1.06,t),lerp(.84,.66,t),0);flat.rotation.set(0,0,lerp(-.12,0,t));
  }
  if(this.ctp.drum){this.ctp.drum.quaternion.copy(this.ctp.drumRestQuaternion);if(s.exposure)this.ctp.drum.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(AXIS.z,this.elapsed*5.2));group.rotation.z=s.exposure?this.elapsed*5.2:0;}
  if(this.ctp.laser){this.ctp.laser.position.copy(this.ctp.laserRestPosition);if(s.exposure)this.ctp.laser.position.z+=THREE.MathUtils.lerp(-.38,.38,(Math.sin(this.elapsed*1.45)+1)/2);}
  if(this.ctp.laser?.material?.emissive){this.ctp.laser.material.emissive.setHex(s.exposure?0x4c1515:0);this.ctp.laser.material.emissiveIntensity=s.exposure?.65:0;}
  this.ctp.plateLoaded=s.p>=.18&&s.p<.96;this.ctp.plateClamped=s.clamped;this.ctp.exposureActive=s.exposure;this.ctp.laserTraverseActive=s.laserTraverse;
 }
 bindImagesetter(){
  const role=target=>{let found=null;this.template.root.traverse(o=>{if(!found&&o.userData?.mechanismRole===target)found=o;});return found;};
  this.imagesetter={
   polygon:role('five-facet-polygon-mirror-reference'),
   laser:role('red-laser-source-reference'),
   cutter:role('media-cross-cutter'),
   supplyRoll:role('media-supply-roll'),
   capstan:role('capstan-drive-roller'),
   gravityRoller:role('gravity-tension-roller'),
   punch:this.template.findNode('ctf-punch-option'),
   processor:this.template.findNode('ctf-processor-boundary'),
   outputCassette:this.template.findNode('ctf-output-cassette'),
   exposureActive:false,cuttingActive:false,capstanAdvanceActive:false,tensionRegulationActive:false,outputBoundaryActive:false
  };
  for(const key of ['polygon','supplyRoll','capstan','gravityRoller']){const o=this.imagesetter[key];if(o&&!o.userData.imagesetterRestQuaternion)o.userData.imagesetterRestQuaternion=o.quaternion.clone();}
  this.imagesetterMediaGeometry=new THREE.BoxGeometry(.38,.014,.68);
  this.imagesetterMediaMaterial=new THREE.MeshStandardMaterial({color:0xb9c1c2,roughness:.46,metalness:.05});
  this.imagesetterMedia=new THREE.Mesh(this.imagesetterMediaGeometry,this.imagesetterMediaMaterial);
  this.imagesetterMedia.name='SCREEN-CTF-PROCESS-MEDIA';this.imagesetterMedia.visible=false;this.root.add(this.imagesetterMedia);
 }
 imagesetterStatus(){
  const p=this.active?(this.elapsed%this.cycle)/this.cycle:0;
  let idx=0,exposure=false,cutting=false,output=false;
  if(p<.16)idx=0;
  else if(p<.38)idx=1;
  else if(p<.57){idx=2;exposure=true;}
  else if(p<.72){idx=3;exposure=true;}
  else if(p<.86){idx=4;cutting=true;}
  else {idx=5;output=true;}
  return {p,idx,exposure,cutting,output};
 }
 updateImagesetter(){
  if(!this.imagesetter||!this.imagesetterMedia)return;
  const s=this.imagesetterStatus(),p=s.p,m=this.imagesetterMedia,i=this.imagesetter;
  const lerp=THREE.MathUtils.lerp,smooth=t=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t);};
  let x=-.82,y=.68,rz=0;
  if(p<.16){const t=smooth(p/.16);x=lerp(-.82,-.48,t);y=lerp(.68,.78,t);}
  else if(p<.38){const t=smooth((p-.16)/.22);x=lerp(-.48,-.12,t);y=.78-.22*Math.sin(Math.PI*t);rz=.08*Math.sin(Math.PI*t);}
  else if(p<.72){const t=smooth((p-.38)/.34);x=lerp(-.12,.34,t);y=.80;}
  else if(p<.86){const t=smooth((p-.72)/.14);x=lerp(.34,.58,t);y=.78-.16*Math.sin(Math.PI*t);rz=-.07*Math.sin(Math.PI*t);}
  else {const t=smooth((p-.86)/.14);x=lerp(.58,.90,t);y=lerp(.76,.56,t);}
  m.position.set(x,y,0);m.rotation.set(0,0,rz);m.visible=this.active;
  const spin=(obj,rate,on)=>{if(!obj)return;obj.quaternion.copy(obj.userData.imagesetterRestQuaternion||new THREE.Quaternion());if(on)obj.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(AXIS.z,this.elapsed*rate));};
  spin(i.supplyRoll,2.1,p<.86);spin(i.capstan,6.2,p>=.12&&p<.86);spin(i.gravityRoller,4.4,p>=.16&&p<.80);
  if(i.polygon){i.polygon.quaternion.copy(i.polygon.userData.imagesetterRestQuaternion||new THREE.Quaternion());if(s.exposure)i.polygon.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(AXIS.y,this.elapsed*18));}
  i.exposureActive=s.exposure;i.cuttingActive=s.cutting;i.capstanAdvanceActive=p>=.12&&p<.86;i.tensionRegulationActive=p>=.16&&p<.80;i.outputBoundaryActive=p>=.86;
  if(i.laser?.material?.emissive){i.laser.material.emissive.setHex(s.exposure?0x7b1616:0);i.laser.material.emissiveIntensity=s.exposure?.85:0;}
 }
 bindZund(){
  const beam=this.template.findNode('zund-gantry-beam'),carriage=this.template.findNode('zund-carriage-y');
  this.zund={
   beam,carriage,
   beamRest:beam?.position.clone()||new THREE.Vector3(),
   carriageRest:carriage?.position.clone()||new THREE.Vector3(),
   installedToolPackageVerified:this.template.root.userData.installedToolPackageVerified===true,
   installedIccVerified:this.template.root.userData.installedIccVerified===true,
   installedItiVerified:this.template.root.userData.installedItiVerified===true,
   vacuumHoldActive:false,axisPathType:'SERPENTINE_REFERENCE_ONLY',toolActionActive:false,
   pathPoints:[[-1.90,-.80],[1.90,-.80],[1.90,-.28],[-1.90,-.28],[-1.90,.28],[1.90,.28],[1.90,.80],[-1.90,.80]]
  };
  this.zundMaterialGeometry=new THREE.BoxGeometry(2.6,.018,1.45);
  this.zundMaterialMaterial=new THREE.MeshStandardMaterial({color:0xc9b89b,roughness:.86,metalness:0});
  this.zundMaterial=new THREE.Mesh(this.zundMaterialGeometry,this.zundMaterialMaterial);
  this.zundMaterial.name='ZUND-PROCESS-MATERIAL-REFERENCE';this.zundMaterial.position.set(0,.69,0);this.zundMaterial.visible=false;this.root.add(this.zundMaterial);
 }
 zundStatus(){
  const p=this.active?(this.elapsed%this.cycle)/this.cycle:0;
  let idx=0;if(p<.14)idx=0;else if(p<.30)idx=1;else if(p<.68)idx=2;else if(p<.82)idx=3;else if(p<.92)idx=4;else idx=5;
  return {p,idx,vacuumHold:p>=.10&&p<.94,axisMotion:p>=.22&&p<.82};
 }
 updateZund(){
  if(!this.zund)return;
  const s=this.zundStatus(),z=this.zund;
  if(z.beam)z.beam.position.copy(z.beamRest);if(z.carriage)z.carriage.position.copy(z.carriageRest);
  if(s.axisMotion){
   const q=THREE.MathUtils.clamp((s.p-.22)/.60,0,1),pts=z.pathPoints,n=pts.length-1,scaled=q*n,k=Math.min(n-1,Math.floor(scaled)),t=scaled-k,a=pts[k],b=pts[k+1],x=THREE.MathUtils.lerp(a[0],b[0],t),zz=THREE.MathUtils.lerp(a[1],b[1],t);
   if(z.beam)z.beam.position.x+=x;if(z.carriage)z.carriage.position.z+=zz;
  }
  if(this.zundMaterial)this.zundMaterial.visible=this.active;
  z.vacuumHoldActive=s.vacuumHold;z.toolActionActive=s.axisMotion&&z.installedToolPackageVerified===true;
 }
 bindCompressor(){
  const no=this.template.cfg.machine.no,brand=[29,30,35].includes(no)?'ATLAS':[31,32,34].includes(no)?'KAESER':'SWAN';
  this.compressor={brand,exactModelVerified:false,plantRouteVerified:this.template.root.userData.plantCompressedAirRouteVerified===true,receiverInstalledVerified:this.template.root.userData.airReceiverInstalledVerified===true,dryerInstalledVerified:this.template.root.userData.airDryerInstalledVerified===true,ringMainInstalledVerified:this.template.root.userData.ringMainInstalledVerified===true,intakeActive:false,compressionActive:false,separationActive:false,aftercoolingActive:false,distributionActive:false,condensateDrainActive:false,oilCircuitActive:false,pressureNormalizedPct:0,pressureProfile:{package:0,receiver:0,afterTreatment:0,ringNear:0,ringFar:0,service:[0,0,0]}};
  this.compressorParticleGeometry=new THREE.SphereGeometry(.024,10,8);
  this.compressorAmbientMaterial=new THREE.MeshStandardMaterial({color:0xaebbc0,roughness:.50,metalness:0,transparent:true,opacity:.70});
  this.compressorAirMaterial=new THREE.MeshStandardMaterial({color:0x4d91b5,roughness:.38,metalness:0,transparent:true,opacity:.86});
  this.compressorOilMaterial=new THREE.MeshStandardMaterial({color:0xc18b47,roughness:.42,metalness:0,transparent:true,opacity:.80});
  this.compressorCondensateMaterial=new THREE.MeshStandardMaterial({color:0x68a9bf,roughness:.24,metalness:0,transparent:true,opacity:.76});
  const particle=(kind,i,count,material)=>{
   const mesh=new THREE.Mesh(this.compressorParticleGeometry,material);mesh.name='COMPRESSOR-'+kind.toUpperCase()+'-PARTICLE-'+(i+1);mesh.visible=false;mesh.userData={flowReference:true,flowKind:kind,installedRouteVerified:false};this.root.add(mesh);
   this.compressorParticles.push({mesh,kind,phase:i/count,lane:(i%3)-1,branch:i%3});
  };
  for(let i=0;i<26;i++)particle('air',i,26,i<6?this.compressorAmbientMaterial:this.compressorAirMaterial);
  for(let i=0;i<18;i++)particle('distribution',i,18,this.compressorAirMaterial);
  for(let i=0;i<10;i++)particle('oil',i,10,this.compressorOilMaterial);
  for(let i=0;i<6;i++)particle('condensate',i,6,this.compressorCondensateMaterial);
 }
 compressorStatus(){
  const p=this.active?(this.elapsed%this.cycle)/this.cycle:0,idx=Math.min(this.stages.length-1,Math.floor(p*this.stages.length));
  return {p,idx};
 }
 updateCompressor(){
  if(!this.compressor)return;
  const c=this.compressor,s=this.compressorStatus(),lerp=THREE.MathUtils.lerp,smooth=v=>{v=THREE.MathUtils.clamp(v,0,1);return v*v*(3-2*v);};
  for(const item of this.compressorParticles){
   const q=(s.p+item.phase)%1,m=item.mesh,lane=item.lane*.07;
   if(item.kind==='air'){
    m.material=q<.12?this.compressorAmbientMaterial:this.compressorAirMaterial;
    if(q<.12){const t=smooth(q/.12);m.position.set(lerp(-1.42,-1.02,t),.78+lane,0);}
    else if(q<.28){const t=smooth((q-.12)/.16),spin=t*Math.PI*5+item.phase*Math.PI*2;m.position.set(lerp(-1.02,-.28,t),.74+Math.sin(spin)*.085+lane*.35,Math.cos(spin)*.105);}
    else if(q<.45){const t=smooth((q-.28)/.17),spin=t*Math.PI*4+item.phase*Math.PI*2;m.position.set(lerp(-.28,.18,t),lerp(.74,.92,t)+Math.sin(spin)*.055+lane*.25,.10+Math.cos(spin)*.12);}
    else if(q<.58){const t=smooth((q-.45)/.13);m.position.set(lerp(.18,.88,t),.90+lane,lerp(.04,.22,t));}
    else if(q<.70){const t=smooth((q-.58)/.12);m.position.set(lerp(.88,1.84,t),lerp(.90,.80,t)+lane,lerp(.22,0,t));}
    else {const t=smooth((q-.70)/.30);m.position.set(lerp(1.84,2.48,t),lerp(.80,.98,t)+lane,0);}
   }else if(item.kind==='distribution'){
    if(q<.18){const t=smooth(q/.18);m.position.set(lerp(2.48,3.60,t),lerp(.98,.78,t)+lane,0);}
    else if(q<.32){const t=smooth((q-.18)/.14);m.position.set(lerp(3.60,4.15,t),lerp(.78,1.48,t)+lane,0);}
    else if(q<.66){const t=smooth((q-.32)/.34),z=item.branch===1?1.10:-1.10;m.position.set(lerp(4.15,6.72,t),1.48+lane,lerp(0,z,t));}
    else if(q<.84){const t=smooth((q-.66)/.18),x=[4.65,5.60,6.55][item.branch],z=item.branch===1?1.10:-1.10;m.position.set(lerp(6.72,x,t),1.48+lane,z);}
    else {
     const x=[4.65,5.60,6.55][item.branch],z=item.branch===1?1.10:-1.10,dropX=x+.32;
     if(q<.89){const t=smooth((q-.84)/.05);m.position.set(x,lerp(1.48,1.82,t)+lane,z);}
     else if(q<.94){const t=smooth((q-.89)/.05);m.position.set(lerp(x,dropX,t),1.82+lane,z);}
     else {const t=smooth((q-.94)/.06);m.position.set(lerp(dropX,dropX+.21,t),lerp(1.82,.46,t)+lane,z);}
    }
   }else if(item.kind==='oil'){
    if(q<.25){const t=smooth(q/.25);m.position.set(lerp(.18,.92,t),lerp(.68,.82,t),-.30);}
    else if(q<.50){const t=smooth((q-.25)/.25);m.position.set(lerp(.92,.45,t),lerp(.82,.58,t),-.30);}
    else if(q<.75){const t=smooth((q-.50)/.25);m.position.set(lerp(.45,-.28,t),lerp(.58,.64,t),-.20);}
    else {const t=smooth((q-.75)/.25);m.position.set(lerp(-.28,.18,t),lerp(.64,.68,t),lerp(-.20,-.30,t));}
   }else{
    const atReceiver=item.branch%2===0,x=atReceiver?2.48:.95,startY=atReceiver?.42:.58,endY=atReceiver?.04:.18;
    m.position.set(x,lerp(startY,endY,smooth(q)),atReceiver?0:.34+lane); 
   }
   m.visible=this.active;
  }
  c.intakeActive=this.active;c.compressionActive=this.active;c.separationActive=this.active;c.aftercoolingActive=this.active;c.distributionActive=this.active;c.oilCircuitActive=this.active;c.condensateDrainActive=this.active;
  const pulse=this.active?Math.sin(this.elapsed*.8):0,base=this.active?100:0;
  c.pressureProfile=this.active?{
   package:Math.round((base-1.0+pulse*.35)*10)/10,
   receiver:Math.round((base-1.6+pulse*.30)*10)/10,
   afterTreatment:Math.round((base-4.2+pulse*.25)*10)/10,
   ringNear:Math.round((base-5.0+pulse*.22)*10)/10,
   ringFar:Math.round((base-6.0+pulse*.20)*10)/10,
   service:[6.7,7.2,7.8].map((loss,i)=>Math.round((base-loss+pulse*(.18-i*.02))*10)/10)
  }:{package:0,receiver:0,afterTreatment:0,ringNear:0,ringFar:0,service:[0,0,0]};
  c.pressureNormalizedPct=c.pressureProfile.ringNear;
 }
 bindAHU(){
  const sansin=this.template.cfg.machine.no===40;
  this.ahu={
   sansin,
   sectionOrderVerified:sansin?false:(this.template.root.userData.sectionOrderVerified===true),
   exactModelVerified:sansin?this.template.root.userData.exactSansinModelVerified===true:this.template.root.userData.exactAhuModelVerified===true,
   flowStart:sansin?-2.05:-3.42,
   flowEnd:sansin?.72:3.48,
   supplyAirActive:false,
   returnAirReferenceActive:false,
   outdoorHeatRejectionActive:false,
   evaporativePrecoolActive:false,
   dxEvaporatorActive:false,
   genericCoilActive:false
  };
  this.ahuParticleGeometry=new THREE.SphereGeometry(.028,10,8);
  this.ahuParticleMaterial=new THREE.MeshStandardMaterial({color:0x73a9b5,roughness:.42,metalness:0,transparent:true,opacity:.82});
  this.ahuReturnParticleMaterial=new THREE.MeshStandardMaterial({color:0xb18a6a,roughness:.50,metalness:0,transparent:true,opacity:.62});
  this.ahuOutdoorParticleMaterial=new THREE.MeshStandardMaterial({color:0x8aa7ad,roughness:.44,metalness:0,transparent:true,opacity:.68});
  const particle=(kind,i,count,material)=>{
   const mesh=new THREE.Mesh(this.ahuParticleGeometry,material);mesh.name='AHU-'+kind.toUpperCase()+'-AIR-PARTICLE-'+(i+1);mesh.visible=false;
   mesh.userData={airflowReference:true,airflowKind:kind,installedRouteVerified:false};this.root.add(mesh);
   this.ahuParticles.push({mesh,kind,phase:i/count,branch:i%2?-1:1,lane:(i%3)-1});
  };
  for(let i=0;i<18;i++)particle('supply',i,18,this.ahuParticleMaterial);
  for(let i=0;i<10;i++)particle('return',i,10,this.ahuReturnParticleMaterial);
  if(sansin)for(let i=0;i<8;i++)particle('outdoor',i,8,this.ahuOutdoorParticleMaterial);
 }
 ahuStatus(){
  const p=this.active?(this.elapsed%this.cycle)/this.cycle:0,idx=Math.min(this.stages.length-1,Math.floor(p*this.stages.length));
  return {p,idx};
 }
 updateAHU(){
  if(!this.ahu)return;
  const a=this.ahu,s=this.ahuStatus(),lerp=THREE.MathUtils.lerp,smooth=v=>{v=THREE.MathUtils.clamp(v,0,1);return v*v*(3-2*v);};
  for(const item of this.ahuParticles){
   const q=(s.p+item.phase)%1,m=item.mesh,lane=item.lane*.16;
   if(item.kind==='supply'){
    if(!a.sansin){
     if(q<.58){const t=smooth(q/.58);m.position.set(lerp(a.flowStart,a.flowEnd,t),.94+lane*.22,lane);}
     else if(q<.80){const t=smooth((q-.58)/.22);m.position.set(lerp(a.flowEnd,5.38,t),lerp(.98,1.68,t),lane);}
     else {const t=smooth((q-.80)/.20);m.position.set(lerp(5.38,6.34,t),lerp(1.68,1.25,t),lerp(lane,item.branch*.86,t));}
    }else{
     if(q<.62){const t=smooth(q/.62);m.position.set(lerp(a.flowStart,a.flowEnd,t),1.02+lane*.20,-.25+lane);}
     else if(q<.82){const t=smooth((q-.62)/.20);m.position.set(lerp(a.flowEnd,3.42,t),lerp(1.08,1.68,t),-.25+lane);}
     else {const t=smooth((q-.82)/.18);m.position.set(lerp(3.42,3.56,t),lerp(1.68,1.28,t),lerp(-.25,item.branch>0?.50:-1.00,t));}
    }
   }else if(item.kind==='return'){
    if(!a.sansin){
     if(q<.24){const t=smooth(q/.24);m.position.set(lerp(4.80,5.05,t),lerp(1.82,2.28,t),lerp(item.branch*.84,1.28,t));}
     else if(q<.82){const t=smooth((q-.24)/.58);m.position.set(lerp(5.05,-3.48,t),2.28,1.28+lane*.22);}
     else {const t=smooth((q-.82)/.18);m.position.set(-3.48,lerp(2.28,1.08,t),lerp(1.28,.18,t));}
    }else{
     if(q<.28){const t=smooth(q/.28);m.position.set(lerp(3.35,3.10,t),lerp(1.72,2.25,t),lerp(item.branch>.0?.50:-1.00,1.52,t));}
     else if(q<.82){const t=smooth((q-.28)/.54);m.position.set(lerp(3.10,-2.18,t),2.25,1.52+lane*.18);}
     else {const t=smooth((q-.82)/.18);m.position.set(-2.18,lerp(2.25,1.10,t),lerp(1.52,-.15,t));}
    }
   }else{
    const t=smooth(q);m.position.set(1.45+Math.sin(q*Math.PI*2+item.phase*4)*.16,lerp(.38,1.78,t),1.45+Math.cos(q*Math.PI*2+item.phase*4)*.16);
   }
   m.visible=this.active;
  }
  a.supplyAirActive=this.active;
  a.returnAirReferenceActive=this.active;
  a.outdoorHeatRejectionActive=a.sansin&&this.active&&s.p>=.08&&s.p<.94;
  if(a.sansin){
   a.evaporativePrecoolActive=s.p>=.18&&s.p<.50;
   a.dxEvaporatorActive=s.p>=.32&&s.p<.68;
   a.genericCoilActive=false;
  }else{
   a.genericCoilActive=s.p>=.24&&s.p<.60;
   a.evaporativePrecoolActive=false;a.dxEvaporatorActive=false;
  }
 }
 bindFolder(){
  const g=new THREE.Group();g.name='FGM2-SCHEMATIC-CARTON-BLANK';g.visible=false;g.position.set(-5.20,.82,0);this.root.add(g);
  const paper=new THREE.MeshStandardMaterial({color:0xe8dfc8,roughness:.88,metalness:0}),glueMat=new THREE.MeshStandardMaterial({color:0x6a9a71,roughness:.55,metalness:0,transparent:true,opacity:.78});
  this.folderMaterials.push(paper,glueMat);
  const centerGeo=new THREE.BoxGeometry(.54,.018,.38),flapGeo=new THREE.BoxGeometry(.54,.016,.22),glueGeo=new THREE.BoxGeometry(.38,.010,.025);
  this.folderGeometries.push(centerGeo,flapGeo,glueGeo);
  const center=new THREE.Mesh(centerGeo,paper);center.name='FGM2-CENTER-PANEL';g.add(center);
  const leftPivot=new THREE.Group(),rightPivot=new THREE.Group();leftPivot.position.z=-.19;rightPivot.position.z=.19;g.add(leftPivot,rightPivot);
  const left=new THREE.Mesh(flapGeo,paper);left.position.z=-.11;left.name='FGM2-LEFT-FLAP';leftPivot.add(left);
  const right=new THREE.Mesh(flapGeo,paper);right.position.z=.11;right.name='FGM2-RIGHT-FLAP';rightPivot.add(right);
  const glueStrip=new THREE.Mesh(glueGeo,glueMat);glueStrip.position.set(.02,.018,.31);glueStrip.visible=false;glueStrip.name='FGM2-ADHESIVE-ZONE-VISUAL';g.add(glueStrip);
  this.folderBlank=g;
  this.folder={leftPivot,rightPivot,glueStrip,cartonBlankGeometryIsSchematic:true,installedCrashLockVerified:false,installedFourSixCornerVerified:false,glueApplicatorTypeVerified:false,foldingActive:false,prebreakActive:false,alignmentActive:false,glueZoneActive:false,finalFoldActive:false,compressionActive:false,deliveryActive:false,zonePositions:[-5.20,-3.45,-1.75,0,1.75,3.55,5.00,5.45]};
 }
 folderStatus(){
  const p=this.active?(this.elapsed%this.cycle)/this.cycle:0;
  let idx=0,folding=false,gluing=false,compressing=false,alignment=false,prebreak=false,finalFold=false,delivery=false;
  if(p<.14)idx=0;
  else if(p<.29){idx=1;alignment=true;prebreak=true;}
  else if(p<.46){idx=2;folding=true;}
  else if(p<.59){idx=3;gluing=true;}
  else if(p<.75){idx=4;folding=true;finalFold=true;}
  else if(p<.91){idx=5;compressing=true;}
  else {idx=6;delivery=true;}
  return {p,idx,folding,gluing,compressing,alignment,prebreak,finalFold,delivery};
 }
 updateFolder(){
  if(!this.folder||!this.folderBlank)return;
  const s=this.folderStatus(),f=this.folder,smooth=v=>{v=THREE.MathUtils.clamp(v,0,1);return v*v*(3-2*v);};
  this.folderBlank.visible=this.active;
  const cuts=[0,.14,.29,.46,.59,.75,.91,1],zones=f.zonePositions;
  let x=zones[0];
  for(let i=0;i<7;i++)if(s.p>=cuts[i]&&s.p<=cuts[i+1]){const t=smooth((s.p-cuts[i])/(cuts[i+1]-cuts[i]));x=THREE.MathUtils.lerp(zones[Math.min(i,zones.length-1)],zones[Math.min(i+1,zones.length-1)],t);break;}
  this.folderBlank.position.x=x;
  let angle=0;
  if(s.p>=.14&&s.p<.29)angle=THREE.MathUtils.lerp(0,.20,smooth((s.p-.14)/.15));
  else if(s.p>=.29&&s.p<.46)angle=THREE.MathUtils.lerp(.20,.66,smooth((s.p-.29)/.17));
  else if(s.p>=.46&&s.p<.59)angle=.66;
  else if(s.p>=.59&&s.p<.75)angle=THREE.MathUtils.lerp(.66,1.28,smooth((s.p-.59)/.16));
  else if(s.p>=.75)angle=1.28;
  this.folder.leftPivot.rotation.x=angle;this.folder.rightPivot.rotation.x=-angle;
  this.folder.glueStrip.visible=this.active&&s.p>=.46;
  this.folderBlank.position.y=s.compressing?THREE.MathUtils.lerp(.82,.775,smooth((s.p-.75)/.16)):.82;
  this.folderBlank.scale.y=s.compressing?THREE.MathUtils.lerp(1,.72,smooth((s.p-.75)/.16)):1;
  f.foldingActive=s.folding;f.prebreakActive=s.prebreak;f.alignmentActive=s.alignment;f.glueZoneActive=s.gluing;f.finalFoldActive=s.finalFold;f.compressionActive=s.compressing;f.deliveryActive=s.delivery;
 }
 stageIndex(){const p=this.active?(this.elapsed%this.cycle)/this.cycle:0;return Math.min(this.stages.length-1,Math.floor(p*this.stages.length));}
 state(){
  const progress=this.active?(this.elapsed%this.cycle)/this.cycle:0,blankerState=this.family==='blanker'?this.blankerStatus():null,collatorState=this.family==='collator'?this.collatorStatus():null,imagesetterState=this.family==='imagesetter'?this.imagesetterStatus():null,zundState=this.family==='zund'?this.zundStatus():null,ctpState=this.family==='ctp'?this.ctpStatus():null,compressorState=this.family==='compressor'?this.compressorStatus():null,ahuState=this.family==='ahu'?this.ahuStatus():null,folderState=this.family==='folder'?this.folderStatus():null,idx=blankerState?.idx??collatorState?.idx??imagesetterState?.idx??zundState?.idx??ctpState?.idx??compressorState?.idx??ahuState?.idx??folderState?.idx??this.stageIndex();
  return {available:!this.blocked,blocked:this.blocked,blockedReason:this.blockedReason,referenceModel:true,evidenceGrade:this.template.cfg.evidence.grade,geometryStatus:this.template.cfg.evidence.geometry,
   active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:this.blocked?'Simulasi belum tervalidasi':(this.stages[idx]||'Reference process'),completed:this.completed,progress,
   sheetsVisible:this.family==='collator'?this.collatorSheets.filter(s=>s.mesh.visible).length:this.family==='imagesetter'?(this.imagesetterMedia?.visible?1:0):this.family==='ctp'?((this.ctpFlatPlate?.visible||this.ctpWrappedPlate?.visible)?1:0):this.family==='zund'?(this.zundMaterial?.visible?1:0):this.family==='folder'?(this.folderBlank?.visible?1:0):(this.processPiece?.visible?1:0),pileSheetsVisible:0,airflowParticleCount:this.family==='ahu'?this.ahuParticles.filter(p=>p.mesh.visible).length:this.family==='compressor'?this.compressorParticles.filter(p=>['air','distribution'].includes(p.kind)&&p.mesh.visible).length:0,supplyAirflowParticleCount:this.family==='ahu'?this.ahuParticles.filter(p=>p.kind==='supply'&&p.mesh.visible).length:0,returnAirflowParticleCount:this.family==='ahu'?this.ahuParticles.filter(p=>p.kind==='return'&&p.mesh.visible).length:0,outdoorAirflowParticleCount:this.family==='ahu'?this.ahuParticles.filter(p=>p.kind==='outdoor'&&p.mesh.visible).length:0,compressedAirParticleCount:this.family==='compressor'?this.compressorParticles.filter(p=>p.kind==='air'&&p.mesh.visible).length:0,distributionAirParticleCount:this.family==='compressor'?this.compressorParticles.filter(p=>p.kind==='distribution'&&p.mesh.visible).length:0,oilFlowParticleCount:this.family==='compressor'?this.compressorParticles.filter(p=>p.kind==='oil'&&p.mesh.visible).length:0,condensateParticleCount:this.family==='compressor'?this.compressorParticles.filter(p=>p.kind==='condensate'&&p.mesh.visible).length:0,rotorCount:this.motions.filter(x=>x.motion.type==='spin').length,
   oscillatorCount:this.motions.filter(x=>x.motion.type!=='spin').length,mechanismCount:this.family==='blanker'?this.template.activeMeshes.length:this.family==='zund'?2:this.motions.length,inkFlowCount:0,uvLampCount:0,uvActive:false,pathVisible:false,inkFlowVisible:false,
   platformIndexing:blankerState?.indexing??false,blankerLoading:blankerState?.loading??false,blankerPlatformAtPress:blankerState?.platformAtPress??false,blankerHydraulicPressureActive:blankerState?.hydraulicPressure??false,blankerSeparationActive:blankerState?.separating??false,blankerReturning:blankerState?.returning??false,blankingHeadPressing:blankerState?.pressing??false,mechanicalInterlockSafe:blankerState?.interlockSafe??true,
   modeledBinCount:collatorState?.modeledBinCount??null,installedBinCountVerified:collatorState?.installedBinCountVerified??null,activeBinFeeds:this.collator?.activeFeedCount??0,activeFeedBinIndexes:this.collator?.activeFeedBins??[],doubleFeedCheckActive:this.family==='collator'?(this.collator?.doubleFeedCheckActive??false):false,gatherTransportActive:this.family==='collator'?(this.collator?.gatherTransportActive??false):false,completedSheetsInSet:this.collator?.completedSheetsInSet??0,
   exposureActive:imagesetterState?.exposure??false,cuttingActive:imagesetterState?.cutting??false,capstanAdvanceActive:this.family==='imagesetter'?(this.imagesetter?.capstanAdvanceActive??false):false,tensionRegulationActive:this.family==='imagesetter'?(this.imagesetter?.tensionRegulationActive??false):false,outputBoundaryActive:this.family==='imagesetter'?(this.imagesetter?.outputBoundaryActive??false):false,punchInstalledVerified:this.imagesetter?.punch?.userData.installedOptionVerified===true,processorInstalledVerified:this.imagesetter?.processor?.userData.installedOptionVerified===true,exactScreenModelVerified:this.family==='imagesetter'?this.template.root.userData.exactScreenModelVerified:null,
   vacuumHoldActive:zundState?.vacuumHold??false,zundAxisMotionActive:zundState?.axisMotion??false,zundAxisPathType:this.family==='zund'?(this.zund?.axisPathType??null):null,zundToolActionActive:this.family==='zund'?(this.zund?.toolActionActive??false):false,ctpPlateLoaded:this.family==='ctp'?(this.ctp?.plateLoaded??false):false,ctpPlateClamped:this.family==='ctp'?(this.ctp?.plateClamped??false):false,ctpExposureActive:this.family==='ctp'?(this.ctp?.exposureActive??false):false,ctpLaserTraverseActive:this.family==='ctp'?(this.ctp?.laserTraverseActive??false):false,ctpPunchInstalledVerified:this.family==='ctp'?(this.ctp?.punchInstalledVerified??false):null,installedToolPackageVerified:this.family==='zund'?(this.zund?.installedToolPackageVerified??false):null,toolActionEnabled:this.family==='zund'?(this.zund?.installedToolPackageVerified===true):null,registrationCameraInstalledVerified:this.family==='zund'?(this.zund?.installedIccVerified??false):null,toolInitializationInstalledVerified:this.family==='zund'?(this.zund?.installedItiVerified??false):null,
   compressorBrand:this.family==='compressor'?(this.compressor?.brand??null):null,compressorIntakeActive:this.family==='compressor'?(this.compressor?.intakeActive??false):false,compressorCompressionActive:this.family==='compressor'?(this.compressor?.compressionActive??false):false,compressorSeparationActive:this.family==='compressor'?(this.compressor?.separationActive??false):false,compressorAftercoolingActive:this.family==='compressor'?(this.compressor?.aftercoolingActive??false):false,compressorOilCircuitActive:this.family==='compressor'?(this.compressor?.oilCircuitActive??false):false,compressorCondensateDrainActive:this.family==='compressor'?(this.compressor?.condensateDrainActive??false):false,compressorDistributionActive:this.family==='compressor'?(this.compressor?.distributionActive??false):false,compressorPressureNormalizedPct:this.family==='compressor'?(this.compressor?.pressureNormalizedPct??0):null,compressorPressureProfile:this.family==='compressor'?(this.compressor?.pressureProfile??null):null,plantCompressedAirRouteVerified:this.family==='compressor'?(this.compressor?.plantRouteVerified??false):null,airReceiverInstalledVerified:this.family==='compressor'?(this.compressor?.receiverInstalledVerified??false):null,airDryerInstalledVerified:this.family==='compressor'?(this.compressor?.dryerInstalledVerified??false):null,ringMainInstalledVerified:this.family==='compressor'?(this.compressor?.ringMainInstalledVerified??false):null,
   ahuSectionOrderVerified:this.family==='ahu'?(this.ahu?.sectionOrderVerified??false):null,ahuExactModelVerified:this.family==='ahu'?(this.ahu?.exactModelVerified??false):null,supplyAirActive:this.family==='ahu'?(this.ahu?.supplyAirActive??false):false,returnAirReferenceActive:this.family==='ahu'?(this.ahu?.returnAirReferenceActive??false):false,outdoorHeatRejectionActive:this.family==='ahu'?(this.ahu?.outdoorHeatRejectionActive??false):false,plantDuctRouteVerified:this.family==='ahu'?(this.template.root.userData.plantDuctRouteVerified===true):null,evaporativePrecoolActive:this.family==='ahu'?(this.ahu?.evaporativePrecoolActive??false):false,dxEvaporatorActive:this.family==='ahu'?(this.ahu?.dxEvaporatorActive??false):false,genericCoilConditioningActive:this.family==='ahu'?(this.ahu?.genericCoilActive??false):false,
   cartonBlankGeometryIsSchematic:this.family==='folder'?(this.folder?.cartonBlankGeometryIsSchematic??true):null,alignmentActive:this.family==='folder'?(this.folder?.alignmentActive??false):false,preBreakActive:this.family==='folder'?(this.folder?.prebreakActive??false):false,foldingActive:folderState?.folding??false,glueZoneActive:folderState?.gluing??false,finalFoldActive:this.family==='folder'?(this.folder?.finalFoldActive??false):false,compressionActive:folderState?.compressing??false,folderDeliveryActive:this.family==='folder'?(this.folder?.deliveryActive??false):false,crashLockInstalledVerified:this.family==='folder'?(this.folder?.installedCrashLockVerified??false):null,fourSixCornerInstalledVerified:this.family==='folder'?(this.folder?.installedFourSixCornerVerified??false):null,glueApplicatorTypeVerified:this.family==='folder'?(this.folder?.glueApplicatorTypeVerified??false):null,
   simulationBoundary:this.family==='blanker'?'QF_LQF_1080_FAMILY_PROCESS_ONLY':this.family==='collator'?'MULTI_VENDOR_SUCTION_COLLATOR_PROCESS_ONLY__TEN_BIN_REFERENCE_NOT_INSTALLATION_CLAIM':this.family==='ctp'?'SUPRASETTER_COMMON_PROCESS_ONLY__PUNCH_LOADER_DEBRIS_TEMP_OPTIONS_NOT_SIMULATED':this.family==='imagesetter'?'SCREEN_FTR_KATANA_COMMON_PROCESS_ONLY__PUNCH_PROCESSOR_MODEL_OPTIONS_NOT_INFERRED':this.family==='ctp'?'SUPRASETTER_EXTERNAL_DRUM_LOAD_CLAMP_IMAGE_UNLOAD__MODEL_OPTIONS_NOT_INFERRED':this.family==='zund'?'ZUND_XY_PLATFORM_MOTION_ONLY__INSTALLED_TOOL_CAMERA_INIT_PACKAGE_NOT_INFERRED':this.family==='compressor'?'BRAND_FAMILY_OIL_INJECTED_SCREW_AIRFLOW__LOCAL_RING_MAIN_FUNCTIONAL_REFERENCE__PLANT_ROUTE_UNVERIFIED':this.family==='ahu'?(this.ahu?.sansin?'SANSIN_NES_YZKJ_INDOOR_AIR_PATH_FAMILY_REFERENCE__MODEL_CAPACITY_UNVERIFIED':'EUROVENT_CANONICAL_AHU_AIR_PATH_REFERENCE__SECTION_ORDER_DIRECTION_UNVERIFIED'):this.family==='folder'?'FGM2_MULTI_VENDOR_COMMON_FOLD_GLUE_PROCESS_ONLY__BOX_STYLE_GLUE_HARDWARE_OPTIONS_NOT_INFERRED':null,referenceBoundary:this.template.cfg.profile?.unknowns||[]};
 }
 start(){if(this.blocked){this.active=false;this.running=false;this.paused=false;this.onUpdate?.(this.state());return this.state();}this.active=true;this.running=true;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;if(this.processPiece)this.processPiece.visible=true;for(const s of this.collatorSheets)s.mesh.visible=true;if(this.imagesetterMedia)this.imagesetterMedia.visible=true;if(this.ctpFlatPlate)this.ctpFlatPlate.visible=true;if(this.ctpWrappedPlate)this.ctpWrappedPlate.visible=false;if(this.zundMaterial)this.zundMaterial.visible=true;for(const p of this.compressorParticles)p.mesh.visible=true;for(const p of this.ahuParticles)p.mesh.visible=true;if(this.folderBlank)this.folderBlank.visible=true;this.resetMotion();this.onUpdate?.(this.state());return this.state();}
 pause(){this.running=false;this.paused=this.active;this.onUpdate?.(this.state());return this.state();}
 resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;}this.onUpdate?.(this.state());return this.state();}
 setSpeed(v){this.speed=Math.max(.25,Math.min(3,Number(v)||1));return this.state();}
 setPathVisible(v){
  this.pathVisible=!!v;
  if(this.family==='compressor'){const g=this.template.findNode('compressor-air-distribution');if(g)g.visible=this.pathVisible;}
  if(this.family==='ahu'){const g=this.template.findNode(this.ahu?.sansin?'sansin-air-distribution':'ahu-air-distribution');if(g)g.visible=this.pathVisible;}
  return this.state();
 }
 setInkFlowVisible(){this.inkFlowVisible=false;return this.state();}
 resetMotion(){for(const item of this.motions){item.mesh.position.copy(item.position);item.mesh.quaternion.copy(item.quaternion);}if(this.blanker){if(this.blanker.platform)this.blanker.platform.position.copy(this.blanker.platformRest);if(this.blanker.ram)this.blanker.ram.position.copy(this.blanker.ramRest);}if(this.processPiece){if(this.family==='blanker'&&this.processPiece.userData.blankerRest)this.processPiece.position.copy(this.processPiece.userData.blankerRest);else this.processPiece.position.x=this.processPiece.userData.startX;this.processPiece.visible=this.active;}for(const s of this.collatorSheets){s.mesh.position.copy(s.start);s.mesh.visible=this.active;}if(this.collator){this.collator.activeFeedCount=0;this.collator.activeFeedBins=[];this.collator.doubleFeedCheckActive=false;this.collator.gatherTransportActive=false;this.collator.completedSheetsInSet=0;for(const rotor of this.collator.rotors)rotor.quaternion.copy(rotor.userData.collatorRestQuaternion||new THREE.Quaternion());}if(this.imagesetterMedia){this.imagesetterMedia.position.set(-.82,.68,0);this.imagesetterMedia.visible=this.active;}if(this.ctpFlatPlate){this.ctpFlatPlate.position.set(-1.10,.68,0);this.ctpFlatPlate.rotation.set(0,0,0);this.ctpFlatPlate.visible=this.active;}if(this.ctpWrappedGroup)this.ctpWrappedGroup.rotation.set(0,0,0);if(this.ctpWrappedPlate)this.ctpWrappedPlate.visible=false;if(this.ctp){this.ctp.plateLoaded=false;this.ctp.plateClamped=false;this.ctp.exposureActive=false;this.ctp.laserTraverseActive=false;if(this.ctp.laser?.material?.emissive){this.ctp.laser.material.emissive.setHex(0);this.ctp.laser.material.emissiveIntensity=0;}}if(this.imagesetter){this.imagesetter.exposureActive=false;this.imagesetter.cuttingActive=false;if(this.imagesetter.laser?.material?.emissive){this.imagesetter.laser.material.emissive.setHex(0);this.imagesetter.laser.material.emissiveIntensity=0;}}if(this.zund){if(this.zund.beam)this.zund.beam.position.copy(this.zund.beamRest);if(this.zund.carriage)this.zund.carriage.position.copy(this.zund.carriageRest);this.zund.vacuumHoldActive=false;}if(this.zundMaterial){this.zundMaterial.position.set(0,.69,0);this.zundMaterial.visible=this.active;}for(const p of this.compressorParticles)p.mesh.visible=this.active;if(this.compressor){this.compressor.intakeActive=this.active;this.compressor.compressionActive=this.active;this.compressor.separationActive=this.active;this.compressor.aftercoolingActive=this.active;this.compressor.distributionActive=this.active;this.compressor.oilCircuitActive=this.active;this.compressor.condensateDrainActive=this.active;this.compressor.pressureNormalizedPct=this.active?95:0;this.compressor.pressureProfile=this.active?{package:99,receiver:98.4,afterTreatment:95.8,ringNear:95,ringFar:94,service:[93.3,92.8,92.2]}:{package:0,receiver:0,afterTreatment:0,ringNear:0,ringFar:0,service:[0,0,0]};}for(const p of this.ahuParticles)p.mesh.visible=this.active;if(this.ahu){this.ahu.supplyAirActive=this.active;this.ahu.returnAirReferenceActive=this.active;this.ahu.outdoorHeatRejectionActive=false;this.ahu.evaporativePrecoolActive=false;this.ahu.dxEvaporatorActive=false;this.ahu.genericCoilActive=false;}if(this.folderBlank){this.folderBlank.position.set(-5.20,.82,0);this.folderBlank.visible=this.active;}if(this.folder){this.folder.leftPivot.rotation.x=0;this.folder.rightPivot.rotation.x=0;this.folder.glueStrip.visible=false;this.folderBlank.scale.set(1,1,1);this.folder.foldingActive=false;this.folder.prebreakActive=false;this.folder.alignmentActive=false;this.folder.glueZoneActive=false;this.folder.finalFoldActive=false;this.folder.compressionActive=false;this.folder.deliveryActive=false;}}
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
  if(this.family==='imagesetter')this.updateImagesetter();
  if(this.family==='ctp')this.updateCTP();
  if(this.family==='zund')this.updateZund();
  if(this.family==='compressor')this.updateCompressor();
  if(this.family==='ahu')this.updateAHU();
  if(this.family==='folder')this.updateFolder();
  if(this.processPiece){this.processPiece.position.x=THREE.MathUtils.lerp(this.processPiece.userData.startX,this.processPiece.userData.endX,phase);this.processPiece.visible=true;}
  this.completed=Math.floor(this.elapsed/this.cycle);this.onUpdate?.(this.state());
 }
 stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.resetMotion();if(this.processPiece)this.processPiece.visible=false;for(const s of this.collatorSheets)s.mesh.visible=false;if(this.imagesetterMedia)this.imagesetterMedia.visible=false;if(this.ctpFlatPlate)this.ctpFlatPlate.visible=false;if(this.ctpWrappedPlate)this.ctpWrappedPlate.visible=false;if(this.zundMaterial)this.zundMaterial.visible=false;for(const p of this.compressorParticles)p.mesh.visible=false;for(const p of this.ahuParticles)p.mesh.visible=false;if(this.folderBlank)this.folderBlank.visible=false;this.onUpdate?.(this.state());return this.state();}
 dispose(){this.stop();this.processPiece?.removeFromParent();this.processGeometry?.dispose();this.processMaterial?.dispose();for(const s of this.collatorSheets)s.mesh.removeFromParent();this.collatorSheetGeometry?.dispose();this.collatorSheetMaterial?.dispose();this.imagesetterMedia?.removeFromParent();this.imagesetterMediaGeometry?.dispose();this.imagesetterMediaMaterial?.dispose();this.ctpFlatPlate?.removeFromParent();this.ctpWrappedGroup?.removeFromParent();this.ctpFlatGeometry?.dispose();this.ctpWrappedGeometry?.dispose();this.ctpPlateMaterial?.dispose();this.zundMaterial?.removeFromParent();this.zundMaterialGeometry?.dispose();this.zundMaterialMaterial?.dispose();for(const p of this.compressorParticles)p.mesh.removeFromParent();this.compressorParticleGeometry?.dispose();this.compressorAmbientMaterial?.dispose();this.compressorAirMaterial?.dispose();this.compressorOilMaterial?.dispose();this.compressorCondensateMaterial?.dispose();for(const p of this.ahuParticles)p.mesh.removeFromParent();this.ahuParticleGeometry?.dispose();this.ahuParticleMaterial?.dispose();this.ahuReturnParticleMaterial?.dispose();this.ahuOutdoorParticleMaterial?.dispose();this.folderBlank?.removeFromParent();for(const g of this.folderGeometries)g.dispose();for(const m of this.folderMaterials)m.dispose();}
}
