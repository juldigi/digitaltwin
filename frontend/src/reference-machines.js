import * as THREE from 'three';
import {UniversalMachineTemplate} from './universal-machine.js';

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
  this.root.userData.referenceBuilder='V120_REFERENCE_FAMILY_BUILDER';
  this.root.userData.engineeringDimensions=false;
  this.root.userData.referenceBoundary=this.cfg.profile?.unknowns||[];
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
