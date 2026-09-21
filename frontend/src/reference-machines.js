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
  for(const section of sections)for(const child of [...section.children])if(child.isMesh&&child.userData.activeElement)child.visible=false;
  const part=(parent,id,name,explode=[0,.08,.08])=>parent?this.group(parent,id,name,[0,0,0],explode):null;
  this.root.userData.detailPass='V123_R2_YA1A1A_SHEETFED_GRAVURE_COMPONENT_RECONSTRUCTION';
  this.root.userData.simulationStatus='BLOCKED_PENDING_YA1A1A_TRANSPORT_DRIVE_VERIFICATION';
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
   this.tag(this.cyl(drop,.018,1.02,[.08,1.28,0],'steel','z'),'ink-drop-manifold','SHEETFED_GRAVURE_PATENT');
   for(const z of [-.40,-.20,0,.20,.40]){const n=this.cyl(drop,.010,.12,[.08,1.19,z],'accent','y');this.tag(n,'ink-drop-nozzle-reference','SHEETFED_GRAVURE_PATENT');}
  }

  if(print){
   const cyl=part(print,'o7-gravure-cylinder','Gravure printing cylinder');
   this.tag(this.cyl(cyl,.285,1.24,[0,.86,0],'accent','z'),'engraved-gravure-cylinder','SHEETFED_GRAVURE_PRIMARY');
   for(const z of [-.68,.68]){this.tag(this.cyl(cyl,.055,.16,[0,.86,z],'steel','z'),'gravure-cylinder-journal','SHEETFED_GRAVURE_PRIMARY');this.tag(this.box(cyl,[.16,.18,.10],[0,.86,z],'dark',.008),'gravure-side-bearing','SHEETFED_GRAVURE_PRIMARY');}
   const doc=part(print,'o7-doctor','Doctor blade assembly');
   this.tag(this.cyl(doc,.035,1.34,[.23,1.16,0],'steel','z'),'doctor-pivot-shaft','GRAVURE_DOCTOR_PATENT');
   const holder=this.box(doc,[.16,.09,1.20],[.16,1.08,0],'dark',.008);holder.rotation.z=-.18;this.tag(holder,'doctor-blade-holder','GRAVURE_DOCTOR_PATENT');
   const blade=this.box(doc,[.035,.012,1.16],[.08,1.00,0],'steel',.002);blade.rotation.z=-.18;this.tag(blade,'doctor-blade-edge','GRAVURE_DOCTOR_PATENT');
   this.tag(this.cyl(doc,.050,.17,[.24,1.22,.58],'accent','x'),'doctor-axial-oscillator','GRAVURE_DOCTOR_PATENT');
   this.tag(this.cyl(doc,.044,.14,[.24,1.22,-.58],'dark','x'),'doctor-oscillation-damper','GRAVURE_DOCTOR_PATENT');
  }

  if(imp){
   const ic=part(imp,'o7-impression-cylinder','Impression cylinder');
   this.tag(this.cyl(ic,.30,1.24,[0,1.05,0],'steel','z'),'impression-cylinder','SHEETFED_GRAVURE_PATENT');
   for(const z of [-.68,.68]){this.tag(this.cyl(ic,.058,.15,[0,1.05,z],'steel','z'),'impression-cylinder-journal','SHEETFED_GRAVURE_PATENT');this.tag(this.box(ic,[.16,.18,.10],[0,1.05,z],'dark',.008),'impression-bearing','SHEETFED_GRAVURE_PATENT');}
   this.tag(this.box(ic,[.055,.045,1.10],[-.16,1.30,0],'dark',.004),'impression-cylinder-gripper-bar','SHEETFED_GRAVURE_PATENT');
   for(const z of [-.42,-.14,.14,.42])this.tag(this.box(ic,[.10,.025,.045],[-.20,1.33,z],'steel',.003),'impression-gripper-finger','SHEETFED_GRAVURE_PATENT');
   const sc=part(imp,'o7-impression-sheet-control','Pre-nip sheet control');
   this.tag(this.cyl(sc,.060,1.10,[-.22,.76,0],'dark','z'),'slack-suppression-press-roller','SHEETFED_GRAVURE_PATENT');
   for(const z of [-.54,.54])this.tag(this.box(sc,[.11,.20,.06],[-.22,.78,z],'steel',.006),'press-roller-support','SHEETFED_GRAVURE_PATENT');
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
  if(xy){for(const z of [-.46,.46])this.tag(this.box(xy,[.78,.045,.045],[0,.62,z],'steel',.005),'linear-guide');this.tag(this.cyl(xy,.035,.72,[0,.58,0],'steel','x'),'ball-screw-x');this.tag(this.cyl(xy,.035,.88,[0,.52,0],'steel','z'),'ball-screw-y');for(const p of [[-.38,.55,.55],[.38,.55,.55]]){const servo=this.motion(this.cyl(xy,.09,.18,p,'dark','x'),'spin','x',8,.01,p[0],1);this.tag(servo,'servo-drive');}}
  if(head){for(const x of [-.26,.26]){this.tag(this.cyl(head,.075,.72,[x,1.42,0],'steel','y'),'hydraulic-cylinder');this.tag(this.cyl(head,.035,.78,[x,1.10,.54],'dark','y'),'hydraulic-rod');}this.tag(this.box(head,[.70,.10,1.20],[0,1.02,0],'steel',.012),'blanking-pressure-plate');}
  if(tool){for(const z of [-.46,-.23,0,.23,.46])for(const x of [-.22,0,.22])this.tag(this.cyl(tool,.012,.20,[x,.88,z],'steel','y'),'tooling-pin');}
  if(sep){for(const z of [-.42,0,.42]){const fork=this.motion(this.box(sep,[.46,.055,.065],[0,.88,z],'steel',.006),'oscillate','y',4,.05,z,4);this.tag(fork,'separator-fork');}}
  if(out){for(const z of [-.42,-.14,.14,.42]){const r=this.motion(this.cyl(out,.045,.13,[0,.78,z],'dark','z'),'spin','z',6,.01,z,5);this.tag(r,'waste-output-roller');}}
  if(ctl){this.tag(this.box(ctl,[.34,.42,.28],[0,.48,-.20],'accent',.02),'hydraulic-power-pack');this.tag(this.cyl(ctl,.08,.20,[0,.78,-.20],'dark','x'),'hydraulic-pump');}
 }
 enrichCollator(){
  const bins=this.activeGroup(1),vac=this.activeGroup(2),sense=this.activeGroup(3),gather=this.activeGroup(4),delivery=this.activeGroup(5),control=this.activeGroup(6);
  if(bins){for(let b=0;b<10;b++){const y=.30+b*.155;this.tag(this.box(bins,[.90,.025,1.14],[-.06,y,0],'steel',.004),'feed-bin-shelf');this.tag(this.box(bins,[.06,.10,.06],[.35,y+.045,-.52],'accent',.004),'bin-sheet-sensor');}}
  if(vac){const blower=this.motion(this.cyl(vac,.16,.28,[0,.42,.36],'dark','x'),'spin','x',12,.01,0,1);this.tag(blower,'vacuum-blower');for(let b=0;b<10;b++)this.tag(this.cyl(vac,.012,.46,[.08,.30+b*.135,0],'steel','z'),'vacuum-manifold-branch');}
  if(sense)for(let b=0;b<10;b++)this.tag(this.box(sense,[.07,.06,.05],[-.04,.34+b*.14,-.50],'accent',.004),'double-miss-detector');
  if(gather){for(const z of [-.36,.36])this.tag(this.box(gather,[.06,1.18,.06],[0,.94,z],'steel',.005),'gather-guide');for(const y of [.42,.70,.98,1.26]){const r=this.motion(this.cyl(gather,.05,.80,[0,y,0],'dark','z'),'spin','z',7,.01,y,3);this.tag(r,'gather-transport-roller');}}
  if(delivery){for(const z of [-.42,-.14,.14,.42])this.tag(this.box(delivery,[.62,.025,.08],[0,.62,z],'dark',.004),'delivery-belt');const jog=this.motion(this.box(delivery,[.42,.18,.04],[.20,.72,.50],'accent',.006),'oscillate','z',10,.025,0,4);this.tag(jog,'set-jogger');}
  if(control)this.tag(this.box(control,[.26,.20,.025],[-.02,.86,-.33],'glass',.008),'operator-display');
 }
 enrichCTP(){
  const load=this.activeGroup(1),transport=this.activeGroup(2),drum=this.activeGroup(3),laser=this.activeGroup(4),punch=this.activeGroup(5),unload=this.activeGroup(6);
  if(load){for(const z of [-.45,.45])this.tag(this.box(load,[.58,.025,.04],[0,.55,z],'steel',.004),'plate-side-guide');this.tag(this.box(load,[.52,.04,.95],[0,.72,0],'steel',.005),'manual-loader-bed');}
  if(transport){for(const y of [.48,.64,.80,.96]){const r=this.motion(this.cyl(transport,.045,.92,[0,y,0],'dark','z'),'spin','z',4,.01,y,1);this.tag(r,'plate-transport-roller');}}
  if(drum){for(const z of [-.48,.48])this.tag(this.box(drum,[.10,.06,.08],[0,.80,z],'accent',.006),'plate-clamp-bar');for(const z of [-.52,.52])this.tag(this.cyl(drum,.06,.12,[0,.80,z],'steel','z'),'drum-bearing');this.tag(this.box(drum,[.38,.06,.16],[.16,.50,.54],'dark',.008),'vacuum-manifold');}
  if(laser){this.tag(this.box(laser,[.05,.05,.96],[0,1.12,0],'steel',.004),'laser-linear-rail');for(const z of [-.22,0,.22])this.tag(this.box(laser,[.09,.09,.11],[0,1.12,z],'accent',.008),'laser-diode-module');}
  if(punch){for(const z of [-.34,.34]){const p=this.motion(this.cyl(punch,.025,.18,[0,.84,z],'steel','y'),'press','y',3,.045,z,4);this.tag(p,'internal-punch-pin','SUPRASETTER_OPTION_BOUNDARY');}}
  if(unload){for(const z of [-.42,.42])this.tag(this.box(unload,[.62,.025,.05],[.08,.64,z],'steel',.004),'plate-unload-guide');this.tag(this.box(unload,[.34,.30,.34],[-.28,.42,.48],'dark',.02),'debris-filter-interface');const fan=this.motion(this.cyl(unload,.10,.12,[-.42,.54,.48],'dark','x'),'spin','x',8,.01,0,5);this.tag(fan,'debris-removal-vacuum-fan','SUPRASETTER_OEM');this.tag(this.box(unload,[.20,.28,.20],[-.52,.38,.48],'filter',.012),'debris-filter-cartridge','SUPRASETTER_OEM');}
  if(drum){this.tag(this.box(drum,[.26,.18,.22],[-.32,.48,.52],'blue',.012),'temperature-stabilizer-interface','SUPRASETTER_OEM');for(const z of [-.42,.42])this.tag(this.cyl(drum,.012,.54,[-.28,.44,z],'blue','y'),'temperature-control-line-reference','SUPRASETTER_OEM');}
  this.root.userData.suprasetterOptions={internalPunch:'AVAILABLE_NOT_INSTALLATION_CONFIRMED',debrisRemoval:'AVAILABLE_NOT_INSTALLATION_CONFIRMED',aplAcl:'MODEL_CAPABILITY_ONLY'};
 }
 enrichImagesetter(){
  const supply=this.activeGroup(1),capstan=this.activeGroup(2),scan=this.activeGroup(3),laser=this.activeGroup(4),cut=this.activeGroup(5),out=this.activeGroup(6);
  if(supply){for(const z of [-.34,.34])this.tag(this.box(supply,[.08,.74,.06],[0,.72,z],'steel',.006),'film-cassette-guide');}
  if(capstan){for(const y of [.46,.64,.82,1.00]){const r=this.motion(this.cyl(capstan,.055,.76,[0,y,0],'dark','z'),'spin','z',7,.01,y,1);this.tag(r,'capstan-transport-roller');}this.tag(this.cyl(capstan,.032,.70,[.18,1.08,0],'steel','z'),'tension-dancer');}
  if(scan){this.tag(this.box(scan,[.30,.28,.32],[0,.78,0],'dark',.02),'polygon-scanner-housing');for(let k=0;k<8;k++){const facet=this.box(scan,[.10,.015,.12],[0,.78,0],'steel',.002);facet.rotation.y=k*Math.PI/4;this.tag(facet,'polygon-facet');}}
  if(laser){this.tag(this.box(laser,[.20,.18,.20],[-.18,.78,0],'accent',.012),'laser-modulator');this.tag(this.cyl(laser,.025,.50,[.12,.78,0],'glass','z'),'optical-path-reference');}
  if(cut){const blade=this.motion(this.box(cut,[.08,.22,.76],[0,.78,0],'steel',.005),'press','y',4,.055,0,4);this.tag(blade,'film-cutter');}
  if(out){for(const y of [.48,.66]){const r=this.motion(this.cyl(out,.045,.70,[0,y,0],'dark','z'),'spin','z',5,.01,y,5);this.tag(r,'processor-interface-roller');}}
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
  const intake=this.activeGroup(1),motor=this.activeGroup(2),airend=this.activeGroup(3),sep=this.activeGroup(4),circuit=this.activeGroup(5),cool=this.activeGroup(6),ctl=this.activeGroup(7);
  if(intake){this.tag(this.box(intake,[.28,.32,.28],[0,.78,0],'dark',.02),'intake-filter');this.tag(this.cyl(intake,.07,.16,[.12,.58,0],'steel','x'),'inlet-valve');}
  if(motor){for(let x=-.18;x<=.18;x+=.06)this.tag(this.box(motor,[.018,.40,.50],[x,.68,0],'steel',.002),'motor-cooling-fin');this.tag(this.cyl(motor,.045,.18,[.26,.68,0],'steel','x'),'motor-coupling');}
  if(airend){this.tag(this.cyl(airend,.12,.40,[0,.70,-.10],'steel','x'),'screw-airend-housing');this.tag(this.cyl(airend,.045,.45,[0,.76,.05],'dark','x'),'airend-shaft');}
  if(sep){this.tag(this.cyl(sep,.18,.62,[0,.72,0],'steel','y'),'separator-vessel');this.tag(this.cyl(sep,.11,.38,[0,.78,0],'filter','y'),'oil-separator-element','ATLAS_GA26_FLOW_REFERENCE');this.tag(this.cyl(sep,.055,.16,[.16,1.05,0],'dark','y'),'minimum-pressure-valve');this.tag(this.cyl(sep,.010,.42,[-.10,.88,.18],'steel','y'),'oil-scavenge-line','ATLAS_GA26_FLOW_REFERENCE');}
  if(circuit){this.tag(this.cyl(circuit,.055,.28,[0,.64,.22],'dark','y'),'oil-filter');this.tag(this.box(circuit,[.24,.16,.18],[.12,.86,-.24],'accent',.015),'thermostatic-valve');for(const z of [-.28,.28])this.tag(this.cyl(circuit,.018,.50,[0,.88,z],'steel','y'),'oil-air-pipe-reference');}
  if(cool){for(let y=.52;y<=1.06;y+=.09)this.tag(this.box(cool,[.025,.035,.72],[0,y,0],'steel',.002),'cooler-fin');this.tag(this.box(cool,[.18,.52,.32],[-.22,.80,-.20],'steel',.008),'air-cooler-core','ATLAS_GA26_FLOW_REFERENCE');this.tag(this.box(cool,[.18,.52,.32],[.22,.80,-.20],'steel',.008),'oil-cooler-core','ATLAS_GA26_FLOW_REFERENCE');const fan=this.motion(this.cyl(cool,.17,.08,[.12,1.18,0],'dark','z'),'spin','z',11,.01,0,null);this.tag(fan,'cooling-fan');this.tag(this.box(cool,[.22,.12,.16],[-.16,.48,.35],'dark',.012),'condensate-drain');this.tag(this.box(cool,[.12,.18,.12],[.12,.46,.38],'accent',.008),'condensate-trap','ATLAS_GA26_FLOW_REFERENCE');}
  if(ctl)this.tag(this.box(ctl,[.24,.18,.025],[-.02,1.02,-.62],'glass',.008),'compressor-controller');
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
  this.shell(m1.g,[1.20,1.55,2.10],[0,.86,0]);
  this.box(m1.a,[.82,.06,1.35],[-.08,.50,0],'paper',.006);
  for(const z of [-.50,-.18,.18,.50])this.motion(this.cyl(m1.a,.055,.72,[.35,.78,z],'steel','x'),'spin','x',7,.04,0,0);
  const m2=this.mod(2,[-2.05,0,0],[-.38,.18,0]);
  this.box(m2.g,[1.38,.10,1.55],[0,.68,0],'body',.02);
  for(const z of [-.56,.56])this.box(m2.a,[1.15,.05,.06],[0,.82,z],'steel',.008);
  this.motion(this.box(m2.a,[.18,.09,1.22],[.15,.87,0],'accent',.01),'oscillate','z',8,.10,0,1);
  const m3=this.mod(3,[-.92,0,0],[-.20,.24,.26]);
  this.shell(m3.g,[1.25,1.88,2.18],[0,1.02,0]);
  const pan=this.box(m3.a,[.88,.18,1.30],[0,.50,0],'dark',.02);pan.userData.inkPan=true;
  this.motion(this.cyl(m3.a,.25,1.38,[0,.89,0],'orange','z'),'spin','z',3.8,.05,0,2);
  this.cyl(m3.a,.045,.95,[.40,.58,.70],'steel','y');
  const m4=this.mod(4,[.08,0,0],[0,.28,.28]);
  this.shell(m4.g,[1.08,1.98,2.18],[0,1.05,0]);
  const grav=this.motion(this.cyl(m4.a,.30,1.42,[0,.88,0],'orange','z'),'spin','z',4.4,.06,0,3);
  grav.userData.gravureCylinder=true;
  const blade=this.motion(this.box(m4.a,[.62,.045,1.46],[.18,1.16,0],'steel',.008),'oscillate','z',10,.035,0,3);blade.rotation.z=-.20;blade.userData.doctorBlade=true;
  const m5=this.mod(5,[1.06,0,0],[.20,.28,.25]);
  this.shell(m5.g,[1.08,1.98,2.18],[0,1.05,0]);
  const imp=this.motion(this.cyl(m5.a,.31,1.42,[0,1.18,0],'steel','z'),'spin','z',-4.4,.06,0,4);imp.userData.impressionCylinder=true;
  this.motion(this.cyl(m5.a,.11,1.48,[.10,.68,0],'dark','z'),'spin','z',5.6,.03,0,4);
  const m6=this.mod(6,[2.05,0,0],[.32,.25,0]);
  this.shell(m6.g,[1.15,2.30,2.16],[0,1.18,0]);
  for(const y of [.72,1.05,1.38,1.72]){const heater=this.box(m6.a,[.74,.035,1.25],[0,y,0],'orange',.005);heater.userData.dryerElement=true;}
  for(const z of [-.56,.56])this.motion(this.cyl(m6.a,.16,.10,[.25,1.95,z],'dark','z'),'spin','z',9,.02,0,5);
  const m7=this.mod(7,[2.95,0,0],[.50,.16,0]);
  this.shell(m7.g,[1.12,1.70,2.05],[0,.92,0]);
  for(const y of [.62,.88,1.15])this.motion(this.cyl(m7.a,.075,1.35,[-.10,y,0],'steel','z'),'spin','z',5,.02,0,6);
  this.box(m7.a,[.76,.035,1.18],[.18,.52,0],'paper',.004);
  const m8=this.mod(8,[3.55,0,0],[.62,.15,0]);
  this.box(m8.g,[.54,1.45,.78],[0,.80,.78],'dark',.04);this.box(m8.a,[.32,.22,.025],[-.05,1.12,.38],'glass',.01);
  this.motion(this.cyl(m8.a,.10,.34,[0,.48,.70],'steel','x'),'spin','x',4,.02,0,null);
  this.root.userData.referenceNote='YA1A1A identity is exact to the BMJ registry and external installed-machine evidence. Envelope/throughput class uses YA1A1 evidence; doctor-blade, ink-system, dryer and delivery morphology use the later YA1B1 family only where the older YA1A1A documentation is unavailable.';
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
  this.palette.body=0xf0eee8;this.palette.dark=0x3a3b3a;this.palette.accent=0x4c7484;this.palette.orange=0xc7723e;
  this.base(4.31,1.75);
  const xs=[-1.78,-1.16,-.50,.20,.82,1.40,1.82];
  for(let i=1;i<=7;i++){
   const {g,a}=this.mod(i,[xs[i-1],0,0],[Math.sign(xs[i-1]||1)*.40,.20,0]);
   if(i===1){this.box(g,[.75,.78,1.55],[0,.52,0],'body',.035);this.box(a,[.62,.05,1.25],[0,.86,0],'paper',.004);}
   else if(i===2){this.box(g,[.86,.52,1.52],[0,.40,0],'body',.03);const platform=this.motion(this.box(a,[.72,.08,1.18],[0,.78,0],'steel',.012),'slide','x',1.6,.22,0,1);platform.userData.servoPlatform=true;for(const z of [-.48,.48])this.cyl(a,.025,.68,[0,.68,z],'steel','x');}
   else if(i===3){this.box(g,[.90,1.75,1.64],[0,1.00,0],'body',.035);this.shell(g,[.86,.55,1.58],[0,1.82,0]);for(const x of [-.20,.20]){const head=this.motion(this.box(a,[.34,.22,1.18],[x,1.18,0],'dark',.02),'press','y',2.2,.15,x,2);head.userData.hydraulicBlankingHead=true;}}
   else if(i===4){this.box(g,[.74,.55,1.52],[0,.42,0],'body',.03);for(const z of [-.42,0,.42])this.box(a,[.55,.08,.05],[0,.82,z],'steel',.006);}
   else if(i===5){this.box(g,[.70,.58,1.52],[0,.44,0],'body',.03);const sep=this.motion(this.box(a,[.50,.10,1.10],[0,.84,0],'accent',.012),'oscillate','y',3,.10,0,4);sep.userData.separator=true;}
   else if(i===6){this.box(g,[.72,.60,1.52],[0,.45,0],'body',.03);for(const z of [-.42,0,.42])this.motion(this.cyl(a,.055,.14,[0,.82,z],'dark','z'),'spin','z',5,.02,0,5);}
   else {this.box(g,[.55,1.55,1.00],[0,.88,.22],'dark',.04);this.box(a,[.30,.24,.025],[-.04,1.20,-.30],'glass',.01);this.motion(this.cyl(a,.09,.30,[0,.50,.30],'steel','x'),'spin','x',4,.02,0,null);}
  }
  this.root.userData.referenceNote='QF-100CS exact documentation was not found. Geometry uses the closest QF/LQF 1080 C/CS family: moving X/Y platform, stable hydraulic blanking head, servo ball-screw/linear-guide motion and PLC cabinet.';
 }
 buildCollator(){
  this.palette.body=0xe9e8e2;this.palette.dark=0x282f34;this.palette.accent=0x3e7c8b;
  this.base(2.15,1.45);
  const m1=this.mod(1,[-.62,0,0],[-.35,.20,0]);this.shell(m1.g,[1.05,1.95,1.30],[0,1.05,0]);
  for(let b=0;b<10;b++){const y=.28+b*.155;this.box(m1.a,[.76,.025,1.08],[0,y,0],'paper',.003);const rotor=this.motion(this.cyl(m1.a,.035,.85,[.28,y+.05,0],'dark','z'),'spin','z',8,.01,b*.2,0);rotor.userData.suctionRotor=true;}
  const m2=this.mod(2,[.15,0,0],[0,.22,.20]);this.box(m2.g,[.40,1.72,1.20],[0,.94,0],'body',.03);this.motion(this.cyl(m2.a,.15,.34,[0,.40,.48],'dark','x'),'spin','x',10,.02,0,1);
  const m3=this.mod(3,[.54,0,0],[.20,.20,0]);this.box(m3.g,[.30,1.70,1.18],[0,.94,0],'body',.025);for(let b=0;b<10;b++)this.box(m3.a,[.16,.035,.05],[-.08,.32+b*.145,-.52],'accent',.005);
  const m4=this.mod(4,[.90,0,0],[.30,.18,0]);for(const y of [.44,.72,1.00,1.28])this.motion(this.cyl(m4.a,.045,.82,[0,y,0],'steel','z'),'spin','z',6,.01,0,3);this.shell(m4.g,[.48,1.50,1.14],[0,.84,0]);
  const m5=this.mod(5,[1.35,0,0],[.40,.15,0]);this.box(m5.g,[.72,.42,1.15],[0,.38,0],'body',.025);for(const z of [-.38,-.12,.12,.38])this.box(m5.a,[.65,.03,.08],[0,.62,z],'dark',.004);
  const m6=this.mod(6,[1.72,0,0],[.48,.16,0]);this.box(m6.g,[.48,1.05,.62],[0,.62,.54],'dark',.04);this.box(m6.a,[.30,.22,.025],[-.02,.82,.20],'glass',.01);
  this.root.userData.referenceNote='Collator OEM/model is absent. Geometry intentionally uses a generic vertical 10-bin suction-collator architecture comparable to Horizon VAC family, without claiming Horizon installation.';
 }
 buildCTP(){
  this.palette.body=0xe4e6e4;this.palette.dark=0x292f33;this.palette.accent=0x607784;
  this.base(3.25,1.72);
  const xs=[-1.32,-.78,-.15,.52,1.08,1.48];
  for(let i=1;i<=6;i++){
   const {g,a}=this.mod(i,[xs[i-1],0,0],[Math.sign(xs[i-1]||1)*.38,.20,0]);
   if(i===1){this.shell(g,[.78,1.28,1.55],[0,.76,0]);for(let p=0;p<5;p++)this.box(a,[.60,.012,1.05],[0,.46+p*.05,0],'steel',.002);}
   else if(i===2){this.shell(g,[.72,1.32,1.55],[0,.78,0]);for(const y of [.55,.82])this.motion(this.cyl(a,.06,1.05,[0,y,0],'steel','z'),'spin','z',3,.01,0,1);}
   else if(i===3){this.shell(g,[1.00,1.52,1.58],[0,.88,0]);const drum=this.motion(this.cyl(a,.34,1.10,[0,.80,0],'dark','z'),'spin','z',2.8,.02,0,2);drum.userData.imagingDrum=true;}
   else if(i===4){this.shell(g,[.72,1.44,1.55],[0,.84,0]);const laser=this.motion(this.box(a,[.16,.16,.20],[0,1.12,0],'accent',.015),'oscillate','z',4,.40,0,3);laser.userData.laserCarriage=true;this.box(a,[.05,.05,1.00],[0,1.12,0],'steel',.006);}
   else if(i===5){this.shell(g,[.48,1.22,1.50],[0,.72,0]);for(const z of [-.34,.34])this.motion(this.box(a,[.14,.18,.12],[0,.82,z],'steel',.012),'press','y',2,.04,z,4);}
   else {this.box(g,[.76,.50,1.38],[0,.40,0],'body',.025);this.box(a,[.68,.025,1.15],[.08,.66,0],'steel',.004);}
  }
  this.root.userData.referenceNote='Heidelberg model is unknown; geometry follows the Suprasetter family language: enclosed thermal imaging engine, plate transport, imaging drum, modular laser carriage, optional internal punch and unload.';
 }
 buildImagesetter(){
  this.palette.body=0xe7e7e3;this.palette.dark=0x33383c;this.palette.accent=0x497f9b;
  this.base(2.20,1.18);
  const xs=[-.85,-.50,-.12,.28,.62,.92];
  for(let i=1;i<=6;i++){
   const {g,a}=this.mod(i,[xs[i-1],0,0],[Math.sign(xs[i-1]||1)*.30,.18,0]);
   if(i===1){this.shell(g,[.62,1.05,1.08],[0,.62,0]);this.cyl(a,.22,.72,[0,.72,0],'dark','z');}
   else if(i===2){this.shell(g,[.56,1.12,1.08],[0,.66,0]);for(const y of [.52,.78])this.motion(this.cyl(a,.055,.76,[0,y,0],'steel','z'),'spin','z',6,.01,0,1);}
   else if(i===3){this.shell(g,[.64,1.18,1.08],[0,.69,0]);const mirror=this.motion(this.cyl(a,.07,.20,[0,.78,0],'accent','y'),'spin','y',14,.01,0,2);mirror.userData.polygonMirror=true;}
   else if(i===4){this.shell(g,[.52,1.12,1.08],[0,.66,0]);const optics=this.motion(this.box(a,[.12,.12,.22],[0,.78,0],'accent',.012),'oscillate','z',3.5,.26,0,3);optics.userData.laserOptics=true;this.box(a,[.035,.035,.74],[0,.78,0],'glass',.002);}
   else if(i===5){this.shell(g,[.44,.94,1.05],[0,.58,0]);this.motion(this.box(a,[.18,.09,.70],[0,.72,0],'steel',.008),'press','y',2,.035,0,4);}
   else {this.box(g,[.62,.45,1.04],[0,.36,0],'body',.025);this.box(a,[.52,.025,.78],[.05,.60,0],'paper',.003);}
  }
  this.root.userData.referenceNote='SCREEN model is unknown. The internal reference follows FT-R/Katana capstan transport and high-speed polygon-mirror laser scanning; it does not use the incorrect generic vacuum-drum representation.';
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
  this.palette.body=atlas?0xd7c04c:kaeser?0xe4bd38:swan?0xe5e7e5:0xdfe2df;this.palette.dark=0x252b2e;this.palette.accent=swan?0x3d7861:atlas?0x3e525c:0x444a4c;
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
  this.root.userData.referenceNote='Brand is known but exact model is not. Cabinet proportions and internal component topology are family references only; airend, motor power, dryer/receiver and piping options are not claimed as installed.';
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
  this.stages=template.cfg.profile?.process||template.cfg.modules;this.cycle=Math.max(8,this.stages.length*1.35);
  this.motions=template.activeMeshes.filter(m=>m.userData.motion).map(mesh=>({mesh,motion:mesh.userData.motion,position:mesh.position.clone(),quaternion:mesh.quaternion.clone()}));
  this.family=template.cfg.family;this.pathVisible=false;this.inkFlowVisible=false;this.processPiece=null;this.processMaterial=null;this.processGeometry=null;this.buildProcessPiece();
 }
 buildProcessPiece(){
  const family=this.family;if(['compressor','ahu'].includes(family))return;
  const bounds=new THREE.Box3().setFromObject(this.root),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  const metal=['ctp','imagesetter','zund'].includes(family);
  this.processGeometry=new THREE.BoxGeometry(Math.max(.28,Math.min(.75,size.x*.09)),.025,Math.max(.42,Math.min(1.0,size.z*.55)));
  this.processMaterial=new THREE.MeshStandardMaterial({color:metal?0xb5bcc0:0xe8dfc8,roughness:metal?.42:.88,metalness:metal?.18:0});
  this.processPiece=new THREE.Mesh(this.processGeometry,this.processMaterial);this.processPiece.name='REFERENCE-PROCESS-WORKPIECE';this.processPiece.visible=false;this.processPiece.position.set(bounds.min.x+.30,Math.max(.68,bounds.min.y+.66),center.z);this.processPiece.userData.startX=bounds.min.x+.30;this.processPiece.userData.endX=bounds.max.x-.30;this.root.add(this.processPiece);
 }
 stageIndex(){const p=this.active?(this.elapsed%this.cycle)/this.cycle:0;return Math.min(this.stages.length-1,Math.floor(p*this.stages.length));}
 state(){
  const progress=this.active?(this.elapsed%this.cycle)/this.cycle:0,idx=this.stageIndex();
  return {available:true,blocked:false,referenceModel:true,evidenceGrade:this.template.cfg.evidence.grade,geometryStatus:this.template.cfg.evidence.geometry,
   active:this.active,running:this.running,paused:this.paused,speed:this.speed,stage:this.stages[idx]||'Reference process',completed:this.completed,progress,
   sheetsVisible:this.processPiece?.visible?1:0,pileSheetsVisible:0,rotorCount:this.motions.filter(x=>x.motion.type==='spin').length,
   oscillatorCount:this.motions.filter(x=>x.motion.type!=='spin').length,mechanismCount:this.motions.length,inkFlowCount:0,uvLampCount:0,uvActive:false,pathVisible:false,inkFlowVisible:false,
   referenceBoundary:this.template.cfg.profile?.unknowns||[]};
 }
 start(){this.active=true;this.running=true;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;if(this.processPiece)this.processPiece.visible=true;this.resetMotion();this.onUpdate?.(this.state());return this.state();}
 pause(){this.running=false;this.paused=this.active;this.onUpdate?.(this.state());return this.state();}
 resume(){if(this.active){this.running=true;this.paused=false;this.lastNow=null;}this.onUpdate?.(this.state());return this.state();}
 setSpeed(v){this.speed=Math.max(.25,Math.min(3,Number(v)||1));return this.state();}
 setPathVisible(){this.pathVisible=false;return this.state();}
 setInkFlowVisible(){this.inkFlowVisible=false;return this.state();}
 resetMotion(){for(const item of this.motions){item.mesh.position.copy(item.position);item.mesh.quaternion.copy(item.quaternion);}if(this.processPiece){this.processPiece.position.x=this.processPiece.userData.startX;this.processPiece.visible=this.active;}}
 update(now){
  if(!this.active||!this.running){this.lastNow=now;return;}
  if(this.lastNow===null){this.lastNow=now;return;}
  const dt=Math.min(.12,Math.max(0,(now-this.lastNow)/1000))*this.speed;this.lastNow=now;this.elapsed+=dt;
  const phase=(this.elapsed%this.cycle)/this.cycle,idx=this.stageIndex();
  for(const item of this.motions){
   const {mesh,motion,position,quaternion}=item;mesh.position.copy(position);mesh.quaternion.copy(quaternion);
   const enabled=motion.stage===null||motion.stage===undefined||Math.abs(idx-motion.stage)<=1;if(!enabled)continue;
   const axis=AXIS[motion.axis]||AXIS.z,t=this.elapsed*motion.rate+motion.phase;
   if(motion.type==='spin')mesh.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(axis,t));
   else if(motion.type==='oscillate'||motion.type==='slide')mesh.position.addScaledVector(axis,Math.sin(t)*motion.amp);
   else if(motion.type==='press')mesh.position.addScaledVector(axis,-Math.abs(Math.sin(t))*motion.amp);
  }
  if(this.processPiece){this.processPiece.position.x=THREE.MathUtils.lerp(this.processPiece.userData.startX,this.processPiece.userData.endX,phase);this.processPiece.visible=true;}
  this.completed=Math.floor(this.elapsed/this.cycle);this.onUpdate?.(this.state());
 }
 stop(){this.active=false;this.running=false;this.paused=false;this.elapsed=0;this.lastNow=null;this.completed=0;this.resetMotion();if(this.processPiece)this.processPiece.visible=false;this.onUpdate?.(this.state());return this.state();}
 dispose(){this.stop();this.processPiece?.removeFromParent();this.processGeometry?.dispose();this.processMaterial?.dispose();}
}
