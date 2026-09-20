import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {MACHINE_REGISTRY_BY_ID} from './data/machine-registry.js';

const FAMILY_BY_NO=new Map([
 [1,'guillotine'],[2,'sheeter'],[4,'offset'],[5,'offset'],[6,'offset'],[7,'pileturner'],[8,'pileturner'],
 [11,'hotfoil'],[12,'hotfoil'],[13,'diecutter'],[14,'diecutter'],[15,'diecutter'],[16,'folder'],[17,'folder'],[18,'folder'],
 [19,'inspection'],[20,'inspection'],[21,'blanker'],[22,'pileturner'],[23,'collator'],[24,'inkjet'],[25,'ctp'],[26,'ctp'],
 [27,'imagesetter'],[28,'zund'],[29,'compressor'],[30,'compressor'],[31,'compressor'],[32,'compressor'],
 [33,'compressor'],[34,'compressor'],[35,'compressor'],[36,'ahu'],[37,'ahu'],[38,'ahu'],[39,'ahu'],[40,'ahu'],[41,'ahu']
]);
const LABELS={guillotine:'Guillotine Cutter',sheeter:'Roll / Sheet Converting',offset:'Sheetfed Offset Press',pileturner:'Pile Turner',hotfoil:'Hot Foil Stamping',diecutter:'Die Cutting & Stripping',folder:'Folder Gluer',inspection:'Offline Inspection',blanker:'Automatic Blanking',collator:'Sheet Collator',inkjet:'Digital Inkjet',ctp:'Computer to Plate',imagesetter:'CTF Imagesetter',zund:'Digital Cutting Table',compressor:'Rotary Air Compressor',ahu:'Air Handling Unit'};
const MODULES={
 guillotine:['Infeed Table','Backgauge','Cutting Station','Clamp','Knife Drive','Delivery / Side Tables','Hydraulic & Control'],
 sheeter:['Roll Stand','Web Tension','Infeed','Slitting','Cross Cutter','Overlap Conveyor','Sheet Stacker','Drive & Control'],
 offset:['Preset Feeder','Feedboard / Register','Printing Units','Coating / Dryer','Delivery','Drive & Control'],
 pileturner:['Base Frame','Turntable / Forks','Clamp','Aeration / Jogging','Hydraulic Drive','Safety & Control'],
 hotfoil:['Feeder','Register','Foil Unwind','Heating / Stamping Platen','Foil Advance','Stripping','Delivery','Drive & Control'],
 diecutter:['Feeder','Register','Gripper Transport','Die-Cutting Platen','Stripping','Blanking','Delivery','Drive & Control'],
 folder:['Feeder','Alignment','Pre-fold','Crash-lock / Folding','Glue System','Compression','Delivery','Drive & Control'],
 inspection:['Feeder','Alignment','Camera / Lighting','Image Processing','Reject Gate','Delivery','Control'],
 blanker:['Feeder','Transport','Stripping / Blanking','Blank Separation','Waste Removal','Delivery','Drive & Control'],
 collator:['Feed Stations','Sheet Detection','Gathering Conveyor','Alignment','Stacker','Delivery','Control'],
 inkjet:['Feeder','Cleaning / Corona','Transport','Printheads','UV / Drying','Inspection','Stacker','Ink & Control'],
 ctp:['Plate Loader','Transport','Imaging Drum','Laser Head','Punch','Processor / Unload','Vacuum & Control'],
 imagesetter:['Media Supply','Transport','Imaging Drum','Laser Optics','Film Processor','Output','Vacuum & Control'],
 zund:['Vacuum Table','Material Feed','Tool Carriage','Cutting / Creasing Tools','Camera Registration','Conveyor / Delivery','Vacuum & Control'],
 compressor:['Air Intake','Compression Element','Electric Motor','Oil Separator','Cooling','Air / Oil Circuit','Controller'],
 ahu:['Intake / Damper','Pre-filter','Cooling Coil','Heating Coil','Supply Fan','Drain / Humidification','Outlet / Control']
};
const FAMILY_SOURCES={
 guillotine:[['POLAR 115 EM archive reference','https://www.exapro.com/polar-115-em-monitor-p241022253/']],
 offset:[['Heidelberg CX 104 official','https://www.heidelberg.com/global/en/print_and_packaging/products/offset_printing/format_70_x_100/speedmaster_cx_104/product_information_5/product_information_cx_104.jsp'],['Heidelberg SX 52 brochure','https://www.heidelberg.com/tw/media/local_media/product/brochures/Speedmaster_SX_52.pdf']],
 hotfoil:[['MK 920 YMI archive','https://www.pressdepo.com/machine/en-133612/mk-920-ymi-foil-stamping-machine']],
 diecutter:[['Heidelberg Promatrix 106 CSB official','https://www.heidelberg.com/global/fr/print_and_packaging/finishing/die_cutting/die_cutting__machines/promatrix_106_csb/promatrix_106_csb_1.jsp']],
 folder:[['BOBST MEDIA 100 II archive','https://www.pressxchange.com/en/category/carton%20gluers/bobst/1998/germany/allaoui%20graphic%20machinery%20gmbh/media%20100%20ii%20-%20a2/machineid/71192/']],
 inspection:[['Masterwork inspection systems','https://www.masterworkgroup.com/inspection-machine/mk-550qmini-inspection-machine.html']],
 ctp:[['Heidelberg Suprasetter family official','https://www.heidelberg.com/global/en/print_and_packaging/products/prepress/platesetters/suprasetter_a52_a75/product_information_7/product_information_8.jsp']],
 imagesetter:[['SCREEN Graphic Solutions official','https://www.screen.co.jp/ga-products/en/ctp/thermal-plate-recorder/platerite-hd-8900n-zse']],
 zund:[['Zünd official','https://www.zund.com/en']],
 compressor:[['Atlas Copco compressor principles','https://www.atlascopco.com/en-us/compressors/wiki/compressed-air-articles/how-does-a-screw-compressor-work'],['KAESER compressor family','https://www.kaeser.com/ie-en/products/rotary-screw-compressors/'],['SWAN official','https://www.swan-aircompressor.com/']],
 ahu:[['Trane air handlers','https://www.trane.com/commercial/north-america/us/en/products-systems/air-handlers.html'],['ASHRAE standards','https://www.ashrae.org/technical-resources/standards-and-guidelines']]
};
const EVIDENCE_BY_NO=new Map([
 [1,{grade:'MODEL_IDENTIFIED',geometry:'FAMILY_REFERENCE',simulation:'BLOCKED',reason:'POLAR 115 EM MON identity is known, but installed guards, tables, hydraulics and knife-drive configuration still need BMJ photos/manual.'}],
 [4,{grade:'IDENTITY_ONLY',geometry:'PLACEHOLDER',simulation:'BLOCKED',reason:'Model code YA1A1A has no verified OEM/configuration evidence in the registry.'}],
 [5,{grade:'MODEL_IDENTIFIED',geometry:'OFFICIAL_FAMILY_REFERENCE',simulation:'BLOCKED',reason:'CX 104-8+LYYL identity is known; installed dryer/coating/delivery options still need serial-specific evidence.'}],
 [6,{grade:'MODEL_IDENTIFIED',geometry:'OFFICIAL_FAMILY_REFERENCE',simulation:'BLOCKED',reason:'SX 52-4+L identity is known; installed coating/dryer/delivery configuration still needs serial-specific evidence.'}],
 [7,{grade:'MODEL_IDENTIFIED',geometry:'FAMILY_REFERENCE',simulation:'BLOCKED',reason:'FZ 1200 identity is known but OEM and installed clamp/aeration arrangement are unresolved.'}],
 [8,{grade:'MODEL_IDENTIFIED',geometry:'FAMILY_REFERENCE',simulation:'BLOCKED',reason:'FZ 1200 identity is known but OEM and installed clamp/aeration arrangement are unresolved.'}],
 [11,{grade:'MODEL_IDENTIFIED',geometry:'FAMILY_REFERENCE',simulation:'BLOCKED',reason:'MK 920 YMI identity is known; foil paths, platen option and delivery configuration need machine-specific evidence.'}],
 [12,{grade:'MODEL_IDENTIFIED',geometry:'FAMILY_REFERENCE',simulation:'BLOCKED',reason:'MK 920 YMI-II identity is known; foil paths, platen option and delivery configuration need machine-specific evidence.'}],
 [13,{grade:'MODEL_IDENTIFIED',geometry:'FAMILY_REFERENCE',simulation:'BLOCKED',reason:'MK 1060 ER identity is known; stripping/blanking option configuration needs machine-specific evidence.'}],
 [14,{grade:'MODEL_IDENTIFIED',geometry:'OFFICIAL_FAMILY_REFERENCE',simulation:'BLOCKED',reason:'Promatrix 106 CSB identity is known; installed feeder, stripping and blanking details need serial-specific evidence.'}],
 [15,{grade:'MODEL_IDENTIFIED',geometry:'OFFICIAL_FAMILY_REFERENCE',simulation:'BLOCKED',reason:'Promatrix 106 CSB identity is known; installed feeder, stripping and blanking details need serial-specific evidence.'}],
 [16,{grade:'MODEL_IDENTIFIED',geometry:'FAMILY_REFERENCE',simulation:'BLOCKED',reason:'MEDIA 100 II identity is known; module train, glue heads and compression section need serial-specific evidence.'}],
 [17,{grade:'IDENTITY_ONLY',geometry:'PLACEHOLDER',simulation:'BLOCKED',reason:'Folder Gluer 2 has no model, serial or OEM in the BMJ registry.'}],
 [18,{grade:'MODEL_IDENTIFIED',geometry:'FAMILY_REFERENCE',simulation:'BLOCKED',reason:'MEDIA 100 II identity is known; module train, glue heads and compression section need serial-specific evidence.'}],
 [19,{grade:'MODEL_IDENTIFIED',geometry:'OFFICIAL_FAMILY_REFERENCE',simulation:'BLOCKED',reason:'DIANA EYE 55 identity is known; installed feeder/camera/reject configuration needs serial-specific evidence.'}],
 [20,{grade:'MODEL_IDENTIFIED',geometry:'FAMILY_REFERENCE',simulation:'BLOCKED',reason:'FS-SHARK-N650-P3N1 identity is known; exact transport, camera and reject layout needs primary documentation.'}],
 [21,{grade:'MODEL_IDENTIFIED',geometry:'FAMILY_REFERENCE',simulation:'BLOCKED',reason:'QF-100CS identity is known; stripping, blanking and waste-handling configuration needs primary documentation.'}],
 [22,{grade:'MODEL_IDENTIFIED',geometry:'FAMILY_REFERENCE',simulation:'BLOCKED',reason:'FZ 1200 identity is known but OEM and installed clamp/aeration arrangement are unresolved.'}],
 [23,{grade:'IDENTITY_ONLY',geometry:'PLACEHOLDER',simulation:'BLOCKED',reason:'Collator has no model, serial or OEM in the BMJ registry.'}],
 [24,{grade:'MODEL_IDENTIFIED',geometry:'FAMILY_REFERENCE',simulation:'BLOCKED',reason:'UPG-LY300 identity is recorded, but authoritative machine documentation and installed configuration are absent.'}],
 [25,{grade:'IDENTITY_ONLY',geometry:'PLACEHOLDER',simulation:'BLOCKED',reason:'CTP 1 has no Heidelberg model/serial in the BMJ registry.'}],
 [26,{grade:'IDENTITY_ONLY',geometry:'PLACEHOLDER',simulation:'BLOCKED',reason:'CTP 2 has no Heidelberg model/serial in the BMJ registry.'}],
 [27,{grade:'IDENTITY_ONLY',geometry:'PLACEHOLDER',simulation:'BLOCKED',reason:'SCREEN imagesetter model and serial are absent.'}],
 [28,{grade:'IDENTITY_ONLY',geometry:'PLACEHOLDER',simulation:'BLOCKED',reason:'Zünd cutter model, table size and tool configuration are absent.'}],
 ...[29,30,31,32,33,34,35].map(no=>[no,{grade:'IDENTITY_ONLY',geometry:'PLACEHOLDER',simulation:'BLOCKED',reason:'Compressor brand/number alone is insufficient to identify enclosure, air-end, motor, cooler and piping arrangement.'}]),
 ...[36,37,38,39,40,41].map(no=>[no,{grade:'IDENTITY_ONLY',geometry:'PLACEHOLDER',simulation:'BLOCKED',reason:'AHU number/brand alone is insufficient to identify casing sections, fan type, coil/filter arrangement and airflow direction.'}])
]);
const DEFAULT_EVIDENCE=Object.freeze({grade:'IDENTITY_ONLY',geometry:'PLACEHOLDER',simulation:'BLOCKED',reason:'Machine-specific evidence is insufficient for mechanically faithful geometry or simulation.'});
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function universalMachineConfig(machineId){const machine=MACHINE_REGISTRY_BY_ID.get(machineId);if(!machine)return null;const family=FAMILY_BY_NO.get(machine.no);if(!family)return null;return {machine,family,label:LABELS[family],modules:MODULES[family],evidence:Object.freeze(EVIDENCE_BY_NO.get(machine.no)||DEFAULT_EVIDENCE)};}
export function universalTechnicalSources(machineId){const cfg=universalMachineConfig(machineId);if(!cfg)return [];return (FAMILY_SOURCES[cfg.family]||[]).map(([title,url],i)=>({id:`FAMILY-${cfg.family.toUpperCase()}-${i+1}`,title,publisher:new URL(url).hostname.replace(/^www\./,''),url,type:'TECHNICAL_REFERENCE',confidence:cfg.machine.model?'MEDIUM CONFIDENCE':'REFERENCE ONLY'}));}

export function universalTaxonomy(machineId){
 const cfg=universalMachineConfig(machineId);if(!cfg)return [];
 const root='U'+String(cfg.machine.no).padStart(2,'0'),nodes=[];
 const add=(id,parentId,level,levelName,name,meshRefs=[],description='')=>nodes.push(Object.freeze({id,parentId,level,levelName,name,machineZone:name,meshRefs,sourceRefs:['BMJ-MACHINE-DATABASE',`FAMILY-${cfg.family.toUpperCase()}`],confidence:cfg.machine.model?'FAMILY_REFERENCE':'REFERENCE_ONLY',verified:false,explodeVector:[level===2?.7:.12,level<4?.18:.08,0],explodeDistance:level===2?.9:level===3?.55:level===4?.34:level===5?.22:.12,focusCamera:null,description,maintenanceTag:null}));
 add(root,null,1,'Mesin',`${cfg.machine.name} · ${cfg.machine.model||'model belum terverifikasi'}`,['MACHINE-UNIVERSAL'],`Identitas berasal dari database BMJ. Geometry ${cfg.label} berbasis arsitektur keluarga dan tidak mengklaim varian yang belum tercatat.`);
 cfg.modules.forEach((name,i)=>{const a=`${root}.M${i+1}`,mesh=`universal-module-${i+1}`;add(a,root,2,'Unit Utama',name,[mesh]);const b=a+'.SUB';add(b,a,3,'Sub',`${name} Assembly`,[mesh]);const c=b+'.BLOCK';add(c,b,4,'Block',`${name} Functional Block`,[mesh]);const d=c+'.PART';add(d,c,5,'Part',`${name} Service Group`,[mesh]);add(d+'.SPEC',d,6,'Spesifik Part',`${name} Active Element`,[`${mesh}-active`]);});
 return nodes;
}

export class UniversalMachineTemplate{
 constructor(machineId){
  this.cfg=universalMachineConfig(machineId);if(!this.cfg)throw new Error('Konfigurasi model 3D mesin tidak ditemukan.');
  this.root=new THREE.Group();this.root.name='MACHINE-UNIVERSAL';this.root.userData={assetId:machineId,family:this.cfg.family,confidence:this.cfg.evidence.geometry,evidenceGrade:this.cfg.evidence.grade,simulationStatus:this.cfg.evidence.simulation,evidenceReason:this.cfg.evidence.reason,geometryStatus:'NON_DEDICATED_REFERENCE__NOT_ACTUAL_BMJ_CONFIGURATION'};
  this.parts=[];this.nodes=[];this.meshes=[];this.geometries=new Map();this.materials=new Map();this.exteriorOpen=false;this.ghosted=false;this.activeMeshes=[];
  this.palette={body:0xe5e7e4,dark:0x283238,steel:0x8c999d,accent:0x2d6e72,orange:0xc86f42,paper:0xeee7d2,glass:0x68a3b5,blue:0x447899,filter:0xd5c7a5};
  this.build();this.taxonomy=universalTaxonomy(machineId);this.taxonomyById=new Map(this.taxonomy.map(n=>[n.id,n]));
  for(const n of this.nodes){n.userData.rest=n.position.clone();n.userData.restQuaternion=n.quaternion.clone();}this.root.updateMatrixWorld(true);
 }
 group(parent,id,name,pos=[0,0,0],explode=[0,.15,0]){const g=new THREE.Group();g.name=name;g.position.set(...pos);g.userData={assetId:this.cfg.machine.machineId,nodeId:id,selectable:true,confidence:this.cfg.machine.model?'FAMILY_REFERENCE':'REFERENCE_ONLY',explode:new THREE.Vector3(...explode)};parent.add(g);this.nodes.push(g);if(parent===this.root)this.parts.push(g);return g;}
 material(kind,owner){const k=(owner.userData.nodeId||'root')+kind;if(!this.materials.has(k)){const glass=kind==='glass';this.materials.set(k,new THREE.MeshStandardMaterial({color:this.palette[kind]??this.palette.dark,metalness:['steel','dark'].includes(kind)?.42:.08,roughness:glass?.18:.55,transparent:glass,opacity:glass?.35:1}));}return this.materials.get(k);}
 mesh(g,geo,key,kind,pos=[0,0,0],rot=null){if(!this.geometries.has(key))this.geometries.set(key,geo());const m=new THREE.Mesh(this.geometries.get(key),this.material(kind,g));m.position.set(...pos);if(rot)m.rotation.set(...rot);m.castShadow=kind!=='glass';m.receiveShadow=true;m.userData={ownerId:g.userData.nodeId};g.add(m);this.meshes.push(m);return m;}
 box(g,s,p,k='body',r=.025){return this.mesh(g,()=>r?new RoundedBoxGeometry(...s,2,r):new THREE.BoxGeometry(...s),'b'+s+r,k,p);}
 cyl(g,r,l,p,k='steel',axis='z'){return this.mesh(g,()=>new THREE.CylinderGeometry(r,r,l,18),'c'+r+l,k,p,axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:null);}
 active(o){o.userData.activeElement=true;this.activeMeshes.push(o);return o;}
 cover(o){o.userData.exteriorCover=true;return o;}
 build(){
  const f=this.cfg.family,mods=this.cfg.modules,n=mods.length,pitch=f==='offset'?1.05:f==='folder'?1.0:.92,total=Math.max(4.2,n*pitch+1.2),base=this.group(this.root,'universal-base','Base Frame',[0,0,0],[0,-.2,0]);this.box(base,[total,.22,1.9],[0,.11,0],'dark',.035);
  if(f==='ahu')return this.buildAHU(total);
  if(f==='compressor')return this.buildCompressor(total);
  if(f==='zund')return this.buildZund(total);
  mods.forEach((name,i)=>{const x=(i-(n-1)/2)*pitch,g=this.group(this.root,`universal-module-${i+1}`,name,[x,0,0],[Math.sign(x||1)*.45,.2,0]);
   const h=['offset','diecutter','hotfoil','blanker'].includes(f)?1.75:1.35,w=pitch*.86;
   this.cover(this.box(g,[w,h,.09],[0,.3+h/2,-.93],'body',.035));this.cover(this.box(g,[w,.20,1.75],[0,.3+h,0],'body',.03));
   for(const z of [-.72,.72]){this.box(g,[.07,h,.07],[-w*.35,.3+h/2,z],'steel',.01);this.box(g,[.07,h,.07],[w*.35,.3+h/2,z],'steel',.01);}
   const active=this.group(g,`universal-module-${i+1}-active`,name+' Active Element',[0,0,0],[0,.15,.15]);
   if(['folder','inspection','collator','inkjet','sheeter'].includes(f)){for(const z of [-.5,-.17,.17,.5])this.active(this.cyl(active,.07,w*.72,[0,.86,z],'steel','x'));this.box(active,[w*.82,.035,1.2],[0,.77,0],'paper',.005);}
   else if(f==='pileturner'){this.active(this.cyl(active,.48,.16,[0,1.0,0],'accent','z'));for(const z of [-.55,.55])this.box(active,[.72,.07,.12],[0,1.0,z],'steel',.01);}
   else if(f==='guillotine'){this.active(this.box(active,[w*.78,.10,1.2],[0,1.12,0],'orange',.01));this.box(active,[w*.82,.06,1.3],[0,.72,0],'steel',.01);}
   else {for(const y of [.72,1.02,1.32])this.active(this.cyl(active,.18,1.22,[0,y,0],i%3===0?'orange':'steel','z'));}
  });
 }
 buildCompressor(total){const g=this.group(this.root,'universal-module-1','Compressor Package',[0,0,0],[.5,.2,0]);this.cover(this.box(g,[3.4,1.75,1.65],[0,1.02,0],'body',.08));const a=this.group(g,'universal-module-1-active','Motor / Compression Element',[0,0,0]);this.active(this.cyl(a,.38,1.1,[-.55,.86,0],'accent','x'));this.active(this.cyl(a,.28,.9,[.55,.86,0],'steel','x'));this.box(a,[.48,1.0,.72],[1.16,1.1,0],'dark',.04);for(let i=1;i<this.cfg.modules.length;i++){const x=-1.4+i*.42,m=this.group(this.root,`universal-module-${i+1}`,this.cfg.modules[i],[x,0,0],[.3,.2,0]);this.box(m,[.28,.36,.42],[0,.48,.56],'steel',.02);}}
 buildAHU(total){this.cfg.modules.forEach((name,i)=>{const x=(i-(this.cfg.modules.length-1)/2)*1.08,g=this.group(this.root,`universal-module-${i+1}`,name,[x,0,0],[Math.sign(x||1)*.45,.2,0]);this.cover(this.box(g,[1.02,1.72,1.72],[0,1.02,0],'body',.035));const a=this.group(g,`universal-module-${i+1}-active`,name+' Active Element');if(i===4)this.active(this.cyl(a,.52,.18,[0,1.03,0],'accent','z'));else if(i===1)this.box(a,[.12,1.3,1.3],[0,1.03,0],'filter',.01);else this.active(this.cyl(a,.08,1.25,[0,1.02,0],'steel','z'));});}
 buildZund(total){const g=this.group(this.root,'universal-module-1','Vacuum Cutting Table',[0,0,0],[0,.2,0]);this.box(g,[5.8,.35,2.7],[0,.45,0],'dark',.05);this.box(g,[5.55,.06,2.45],[0,.65,0],'body',.01);for(let i=1;i<this.cfg.modules.length;i++){const x=-2.4+(i-1)*.8,m=this.group(this.root,`universal-module-${i+1}`,this.cfg.modules[i],[x,0,0],[.3,.25,0]),a=this.group(m,`universal-module-${i+1}-active`,this.cfg.modules[i]+' Active Element');this.active(this.box(a,[.28,.55,.32],[0,1.0,0],i===2?'orange':'steel',.025));}const rail=this.group(this.root,'zund-gantry','Tool Gantry');this.box(rail,[.18,1.05,2.9],[0,1.05,0],'accent',.025);}
 resolvePart(o){for(let p=o;p&&p!==this.root;p=p.parent)if(p.userData.selectable)return p;return null;}findNode(id){return id==='MACHINE-UNIVERSAL'?this.root:this.nodes.find(n=>n.userData.nodeId===id)||null;}
 resolveTaxonomyNode(id){let m=this.taxonomyById.get(id);while(m){for(const r of m.meshRefs||[]){const n=this.findNode(r);if(n)return n;}m=m.parentId?this.taxonomyById.get(m.parentId):null;}return this.root;}
 contains(a,b){for(let p=b;p;p=p.parent)if(p===a)return true;return false;}
 explode(t,s=null){for(const n of this.nodes)n.position.copy(n.userData.rest);const targets=s?(s.children.filter(c=>c.userData.selectable).length?s.children.filter(c=>c.userData.selectable):[s]):this.parts;for(const n of targets)n.position.addScaledVector(n.userData.explode,THREE.MathUtils.clamp(+t||0,0,1));}
 highlight(p){for(const m of this.meshes){m.material.emissive?.setHex(p&&this.contains(p,m)?0x17494a:0);m.material.emissiveIntensity=.3;}}highlightMany(ps=[]){for(const m of this.meshes){m.material.emissive?.setHex(ps.some(p=>this.contains(p,m))?0x17494a:0);m.material.emissiveIntensity=.3;}}
 ghost(on,except=null){this.ghosted=on;for(const m of this.meshes){const fade=on&&(!except||!this.contains(except,m));m.material.transparent=fade||m.userData.exteriorCover||m.material.transparent;m.material.opacity=fade?.14:(m.material.color?.getHex()===this.palette.glass?.35:1);m.material.depthWrite=!fade;}}
 isolate(p,on=true){for(const n of this.nodes)n.visible=!on||!p||this.contains(p,n)||this.contains(n,p);}showOnly(ps=[],on=true){for(const n of this.nodes)n.visible=!on||!ps.length||ps.some(p=>n===p||this.contains(n,p));}
 setExteriorOpen(on=true){this.exteriorOpen=!!on;for(const m of this.meshes)if(m.userData.exteriorCover)m.visible=!on;this.root.userData.interiorCutawayVisible=on;}
 setLow(on){for(const m of this.meshes)if(m.userData.detail)m.visible=!on;}reset(){const open=this.exteriorOpen;this.explode(0);this.highlight(null);this.isolate(null,false);this.ghost(false);for(const n of this.nodes)n.quaternion.copy(n.userData.restQuaternion);if(open)this.setExteriorOpen(true);}dispose(){this.geometries.forEach(g=>g.dispose());this.materials.forEach(m=>m.dispose());}
}

export class UniversalProcessSimulation{
 constructor(machine,template){this.machine=machine;this.template=template;this.group=new THREE.Group();this.group.name='UNIVERSAL-PROCESS-SIMULATION-BLOCKED';machine.add(this.group);this.active=false;this.running=false;this.speed=1;this.elapsed=0;this.lastNow=null;this.completed=0;this.pathVisible=false;this.inkFlowVisible=false;this.onUpdate=null;this.available=false;this.blockedReason=template.cfg.evidence.reason;}
 state(){return {available:false,blocked:true,blockedReason:this.blockedReason,evidenceGrade:this.template.cfg.evidence.grade,geometryStatus:this.template.cfg.evidence.geometry,active:false,running:false,paused:false,speed:this.speed,stage:'Simulasi belum tervalidasi',completed:0,progress:0,sheetsVisible:0,pileSheetsVisible:0,rotorCount:0,oscillatorCount:0,mechanismCount:0,inkFlowCount:0,uvLampCount:0,uvActive:false,pathVisible:false,inkFlowVisible:false};}
 start(){this.active=false;this.running=false;this.onUpdate?.(this.state());return this.state();}pause(){return this.state();}resume(){return this.start();}stop(){this.active=false;this.running=false;this.elapsed=0;this.completed=0;this.lastNow=null;return this.state();}setSpeed(v){this.speed=Math.max(.35,Math.min(2,+v||1));return this.state();}setPathVisible(){this.pathVisible=false;return this.state();}setInkFlowVisible(){return this.state();}
 update(now){this.lastNow=now;}
 dispose(){this.stop();this.group.removeFromParent();}
}