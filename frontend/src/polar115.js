import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {POLAR115_TAXONOMY} from './data/taxonomy-polar115.js';
import {POLAR115_SPEC,POLAR115_REFERENCE_DIMENSIONS} from './data/dimensions-polar115.js';
import {POLAR115_TECHNICAL_SOURCES} from './data/sources-polar115.js';
import {V122_SOURCE_STATS} from './data/research-v122.js';

export class Polar115MachineTemplate{
 constructor(){
  this.root=new THREE.Group();this.root.name='POLAR-115-EM';this.parts=[];this.nodes=[];this.meshes=[];this.materials=[];this.geometries=[];this.activeMeshes=[];this.exteriorOpen=false;
  this.palette={body:0xb8bbb5,bodyDark:0x8f938f,dark:0x252b2e,table:0x6f787b,steel:0xa9b0b1,accent:0x405961,warning:0xd0a338,screen:0x173e34,red:0xb6302d,paper:0xece5d2,black:0x111517,air:0x8bbad0};
  this.build();this.enrichV122();this.taxonomy=POLAR115_TAXONOMY;this.taxonomyById=new Map(this.taxonomy.map(n=>[n.id,n]));
  for(const n of this.nodes){n.userData.rest=n.position.clone();n.userData.restQuaternion=n.quaternion.clone();}this.root.updateMatrixWorld(true);
  this.root.userData={assetId:POLAR115_SPEC.assetId,nodeId:'POLAR-115-EM',model:POLAR115_SPEC.model,serial:POLAR115_SPEC.serial,spec:POLAR115_SPEC,sources:POLAR115_TECHNICAL_SOURCES,machineEnvelope:{reference:POLAR115_REFERENCE_DIMENSIONS},geometryStatus:'DEDICATED_MODEL_REFERENCE__ARCHIVE_DIMENSIONS_NOT_INSTALLATION_CAD',engineeringDimensions:false,evidenceBoundary:POLAR115_SPEC.evidenceBoundary,researchVersion:'V122',researchSourceCount:V122_SOURCE_STATS.total,detailPass:'V122_POLAR115_SERVICE_COMPONENT_LEVEL'};
 }
 mat(kind,transparent=false){const m=new THREE.MeshStandardMaterial({color:this.palette[kind]??this.palette.body,metalness:['steel','table'].includes(kind)?.5:.08,roughness:kind==='screen'?.18:.52,transparent,opacity:transparent?.36:1});m.userData.baseOpacity=m.opacity;this.materials.push(m);return m;}
 group(parent,id,name,pos=[0,0,0],explode=[0,.18,0]){const g=new THREE.Group();g.name=name;g.position.set(...pos);g.userData={nodeId:id,selectable:true,explode:new THREE.Vector3(...explode)};parent.add(g);this.nodes.push(g);if(parent===this.root)this.parts.push(g);return g;}
 mesh(g,geo,kind,pos=[0,0,0],rot=null,id=null){const x=new THREE.Mesh(geo,this.mat(kind));x.position.set(...pos);if(rot)x.rotation.set(...rot);x.castShadow=!['screen','air'].includes(kind);x.receiveShadow=true;x.userData={ownerId:g.userData.nodeId};if(id)x.name=id;g.add(x);this.meshes.push(x);this.geometries.push(geo);return x;}
 box(g,s,p,k='body',r=.025,id=null){return this.mesh(g,r?new RoundedBoxGeometry(...s,2,r):new THREE.BoxGeometry(...s),k,p,null,id);}
 cyl(g,r,l,p,k='steel',axis='z',id=null){return this.mesh(g,new THREE.CylinderGeometry(r,r,l,24),k,p,axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:null,id);}
 cover(m){m.userData.exteriorCover=true;return m;}active(m,role=''){m.userData.activeElement=true;m.userData.mechanismRole=role;this.activeMeshes.push(m);return m;}
 holes(group,width,depth,y,zCenter,countX,countZ){const grid=this.group(group,'polar-feed-grid-'+group.userData.nodeId,'Air-nozzle grid');for(let ix=0;ix<countX;ix++)for(let iz=0;iz<countZ;iz++){const x=-width*.42+(width*.84)*(ix/Math.max(1,countX-1)),z=zCenter-depth*.38+(depth*.76)*(iz/Math.max(1,countZ-1));const h=this.cyl(grid,.009,.006,[x,y+.064,z],'black','y');h.userData.detail=true;h.userData.airNozzle=true;}return grid;}
 build(){
  const frame=this.group(this.root,'polar-frame','Base Cabinet');
  this.box(frame,[2.06,.56,1.24],[0,.28,.66],'dark',.035);
  for(const x of [-.55,.06,.60])this.box(frame,[.40,.02,.02],[x,.28,1.27],'bodyDark',.006);

  const feed=this.group(this.root,'polar-feed','Cutting Table & Material Handling',[0,0,0],[0,.16,-.35]);
  const center=this.group(feed,'polar-feed-center','Main cutting table (dark steel deck)');this.box(center,[1.42,.10,.715],[0,.90,-.37],'dark',.02);
  const bevel=this.box(center,[.42,.10,.42],[.62,.90,.02],'dark',.02);bevel.rotation.y=-Math.PI/4;bevel.userData.tableBevel=true;
  const left=this.group(feed,'polar-feed-left','Left removable air-float side table',[-1.015,0,0]);this.box(left,[.60,.06,.715],[0,.90,-.37],'table',.02);this.holes(left,.60,.715,.90,-.37,4,5);
  const right=this.group(feed,'polar-feed-right','Right removable air-float side table',[1.015,0,0]);this.box(right,[.60,.06,.715],[0,.90,-.37],'table',.02);this.holes(right,.60,.715,.90,-.37,4,5);
  for(const g of [left,right])for(const x of [-.22,.22])this.box(g,[.03,.42,.03],[x,.68,-.22],'dark',.006);
  const crank=this.group(right,'polar-feed-right-crank','Side-table height-adjust crank wheel');crank.userData.detail=true;this.cyl(crank,.075,.02,[.28,.64,-.66],'dark','x');this.cyl(crank,.012,.14,[.28,.64,-.66],'steel','x');
  const wingL=this.group(feed,'polar-feed-wing-left','Folding side wing (left)');const wl=this.box(wingL,[.05,.05,1.02],[-1.42,.72,-.37],'dark',.01);wl.rotation.x=-.25;wl.userData.foldingWing=true;
  const wingR=this.group(feed,'polar-feed-wing-right','Folding side wing (right)');const wr=this.box(wingR,[.05,.05,1.02],[1.42,.72,-.37],'dark',.01);wr.rotation.x=-.25;wr.userData.foldingWing=true;
  const rearTable=this.group(feed,'polar-feed-rear','Back table');this.box(rearTable,[1.44,.06,1.15],[0,.90,.565],'dark',.018);this.holes(rearTable,1.44,1.15,.90,.565,7,7);

  const gauge=this.group(this.root,'polar-gauge','Backgauge Positioning',[0,0,0],[0,.20,.36]);
  const beam=this.group(gauge,'polar-gauge-beam','Backgauge beam');this.box(beam,[1.20,.14,.13],[0,1.02,.70],'accent',.018);
  const rake=this.group(gauge,'polar-gauge-rake','Backgauge rake / fingers');for(const x of [-.48,-.24,0,.24,.48])this.active(this.box(rake,[.055,.20,.055],[x,.90,.625],'steel',.008),'backgauge');
  const guides=this.group(gauge,'polar-gauge-guides','Twin guideways');for(const x of [-.56,.56])this.cyl(guides,.022,1.02,[x,.80,.72],'steel','z');
  const drive=this.group(gauge,'polar-gauge-drive','Positioning screw / drive reference');this.active(this.cyl(drive,.035,1.02,[0,.77,.72],'steel','z'),'backgauge-drive');
  const enc=this.group(gauge,'polar-gauge-encoder','Length-measurement encoder reference');this.cyl(enc,.055,.10,[.70,.80,.72],'dark','z');

  const clamp=this.group(this.root,'polar-clamp','Hydraulic Clamp',[0,0,0],[0,.28,0]);
  const clampBeam=this.group(clamp,'polar-clamp-beam','Clamp beam');this.active(this.box(clampBeam,[1.28,.18,.16],[0,1.25,-.01],'warning',.018,'Clamp Beam'),'clamp');
  const clampCyl=this.group(clamp,'polar-clamp-cylinders','Clamp hydraulic actuation reference');for(const x of [-.48,.48])this.cyl(clampCyl,.055,.34,[x,1.45,.02],'steel','y');
  const contact=this.group(clamp,'polar-clamp-contact','Stock-contact face');this.box(contact,[1.23,.025,.10],[0,1.155,-.035],'dark',.004);

  const knife=this.group(this.root,'polar-knife','Knife Cutting System',[0,0,0],[0,.42,0]);
  const carrier=this.group(knife,'polar-knife-carrier','Knife carrier');this.active(this.box(carrier,[1.34,.18,.13],[0,1.47,.035],'dark',.014,'Knife Carrier'),'knife-carrier');
  const bladeGroup=this.group(knife,'polar-knife-blade','1150 mm knife');const blade=this.active(this.box(bladeGroup,[1.18,.13,.025],[0,1.37,-.005],'steel',.003,'1150 mm Knife'),'knife');blade.rotation.z=-.012;blade.userData.knifeBlade=true;blade.userData.geometryReference='VERTICAL_BLADE__EXACT_BEVEL_UNVERIFIED';
  const stick=this.group(knife,'polar-knife-stick','Cutting stick');this.box(stick,[1.20,.025,.055],[0,.965,-.018],'warning',.003,'Cutting Stick');
  const knifeDrive=this.group(knife,'polar-knife-drive','Hydraulic knife-drive interface');for(const x of [-.56,.56]){this.active(this.cyl(knifeDrive,.085,.13,[x,1.57,.08],'accent','z'),'knife-drive');this.box(knifeDrive,[.07,.30,.065],[x,1.42,.08],'steel',.008);}
  const topSense=this.group(knife,'polar-knife-top-sense','Top-position / cut-cycle sensing reference');this.box(topSense,[.08,.12,.06],[.68,1.50,.07],'red',.010);

  const safety=this.group(this.root,'polar-safety','Safety System',[0,0,0],[0,.24,-.45]);
  const photo=this.group(safety,'polar-safety-photo','Photoelectric light-barrier arms');
  for(const x of [-.82,.82]){const arm=this.box(photo,[.15,.17,.58],[x,1.03,-.36],'body',.04);arm.rotation.x=.08;for(let i=0;i<6;i++){const led=this.cyl(photo,.009,.012,[x+(x<0?.077:-.077),1.03,-.56+i*.08],'red','x');led.userData.detail=true;led.userData.photoCell=true;}}
  const twohand=this.group(safety,'polar-safety-twohand','Two-hand cut buttons · simultaneous cut release');twohand.userData.simultaneityControlReference=true;twohand.userData.antiRepeatReference=true;for(const x of [-.72,.72]){this.box(twohand,[.18,.08,.14],[x,.91,-.71],'dark',.025);const b=this.cyl(twohand,.035,.022,[x,.96,-.78],'red','z');b.userData.twoHandButton=true;}
  const estop=this.group(safety,'polar-safety-estop','Emergency-stop pedestal');this.box(estop,[.10,.42,.14],[-.66,1.11,-.18],'body',.02);this.cyl(estop,.043,.035,[-.66,1.32,-.11],'red','z');
  const rear=this.group(safety,'polar-safety-rear','Rear guard reference');this.cover(this.box(rear,[1.50,.50,.045],[0,1.12,1.18],'body',.025));

  const control=this.group(this.root,'polar-control','EM-MONITOR Control',[0,0,0],[0,.24,-.20]);
  const panel=this.group(control,'polar-control-panel','Central program / dimension keypad');this.cover(this.box(panel,[1.42,.31,.15],[0,1.36,-.11],'dark',.035));
  const crt=this.group(control,'polar-control-crt','Program display (small industrial screen)');this.box(crt,[.22,.20,.03],[-.18,1.38,-.185],'black',.012);this.box(crt,[.17,.15,.008],[-.18,1.38,-.202],'screen',.006,'Program Display');
  const keypad=this.group(control,'polar-control-keypad','Numeric / function keypad');for(let i=0;i<15;i++){const col=i%5,row=Math.floor(i/5);this.box(keypad,[.028,.028,.010],[-.48+col*.038,1.29-row*.038,-.195],col===4?'warning':'body',.003);}
  const keyswitch=this.group(control,'polar-control-keyswitch','Key-operated mode-select sub-panel');this.cover(this.box(keyswitch,[.22,.34,.16],[.86,1.32,-.10],'body',.03));this.cyl(keyswitch,.032,.03,[.86,1.40,-.185],'black','z');this.cyl(keyswitch,.014,.05,[.80,1.24,-.185],'dark','z');
  const papers=this.group(control,'polar-control-papers','Laminated instruction sheets taped to console');papers.userData.detail=true;this.box(papers,[.30,.24,.004],[.15,1.40,-.185],'paper',0);this.box(papers,[.16,.16,.004],[-.55,1.40,-.185],'paper',0);
  const memory=this.group(control,'polar-control-memory','Eltromat Memory / program interface');for(let i=0;i<30;i++){const col=i%10,row=Math.floor(i/10);this.box(memory,[.034,.025,.012],[-.50+col*.067,1.39-row*.055,-.195],i%7===0?'warning':'body',.003);}
  const corr=this.group(control,'polar-control-correction','Correction / pressure controls');for(const [x,k] of [[.48,'body'],[.61,'body'],[.76,'warning']])this.cyl(corr,.035,.022,[x,1.38,-.195],k,'z');
  const pressure=this.group(control,'polar-control-pressure','Clamp-pressure control interface');this.cyl(pressure,.060,.035,[.92,1.17,-.14],'dark','z');

  const utility=this.group(this.root,'polar-utility','Hydraulic & Air Utility',[-.55,0,.48],[-.32,.18,.30]);
  const hyd=this.group(utility,'polar-hyd-power','Hydraulic power-unit reference');this.active(this.box(hyd,[.48,.38,.38],[-.20,.37,.55],'accent',.035),'hydraulic-power');
  const valve=this.group(utility,'polar-hyd-valve','Valve / manifold reference');this.box(valve,[.30,.18,.24],[.25,.45,.55],'steel',.018);
  const blower=this.group(utility,'polar-air-blower','Air blower');this.active(this.cyl(blower,.14,.30,[.50,.32,.56],'dark','x'),'air-blower');
  const duct=this.group(utility,'polar-air-duct','Air-distribution duct reference');this.cyl(duct,.045,.72,[.10,.62,.42],'steel','x');

  const housing=this.group(this.root,'polar-housing','Main Housing');
  this.cover(this.box(housing,[2.10,1.00,.60],[0,.85,1.00],'bodyDark',.05));
  this.cover(this.cyl(housing,.30,2.10,[0,1.35,.72],'bodyDark','x'));
  const consoleFace=this.cover(this.box(housing,[2.06,.42,.10],[0,1.32,.71],'body',.04));consoleFace.userData.consoleBrow=true;
  const motorEnd=this.group(housing,'polar-housing-motor-end','Belt-drive housing with inspection window',[0,0,0],[.14,.06,0]);
  this.cover(this.box(motorEnd,[.42,1.00,.58],[1.15,.85,1.02],'bodyDark',.08));
  const window=this.cyl(motorEnd,.16,.02,[1.16,.90,1.30],'black','z');window.userData.detail=true;window.userData.inspectionWindow=true;
  this.cover(this.box(housing,[2.00,.55,.55],[0,.28,1.05],'dark',.03));
  const decal=this.group(housing,'polar-housing-decal','BAHAYA TERJEPIT pinch-point warning decal');decal.userData.detail=true;this.box(decal,[.20,.26,.006],[-.82,1.30,-.16],'red',0,'Pinch-Point Warning');
  const nameplate=this.group(housing,'polar-housing-nameplate','POLAR rating / serial nameplate');nameplate.userData.detail=true;this.box(nameplate,[.13,.09,.006],[-.95,1.55,.72],'warning',.004,'Rating Plate');
  const baseDecal=this.group(frame,'polar-frame-decal','High-voltage warning decal on base cabinet door');baseDecal.userData.detail=true;this.box(baseDecal,[.13,.13,.006],[.20,.36,1.27],'warning',0,'High-Voltage Warning');
  const pedal=this.group(frame,'polar-frame-pedal','Foot pedal (backgauge/clamp release reference)');this.active(this.box(pedal,[.16,.03,.28],[0,.02,1.55],'dark',.01),'foot-pedal');this.cyl(pedal,.018,.28,[0,.14,1.42],'steel','x');
 }
 enrichV122(){
  this.root.userData.researchVersion='V122';
  this.root.userData.researchSourceCount=V122_SOURCE_STATS.total;
  this.root.userData.detailPass='V122_POLAR115_SERVICE_COMPONENT_LEVEL';
  const tag=(m,role,evidence='POLAR_115_155_EMC_SERVICE_MANUAL')=>{if(!m)return m;m.userData.detail=true;m.userData.mechanismRole=role;m.userData.evidence=evidence;return m;};

  const gauge=this.findNode('polar-gauge');if(gauge){
   const sledge=this.group(gauge,'polar-gauge-sledge-v122','Backgauge sledge and nut',[0,0,0],[0,.12,.22]);
   tag(this.box(sledge,[.42,.12,.18],[0,.80,.73],'dark',.012),'backgauge-sledge');
   tag(this.cyl(sledge,.055,.20,[0,.78,.73],'steel','z'),'backgauge-lead-nut');
   for(const x of [-.56,.56])tag(this.box(sledge,[.16,.08,.18],[x,.80,.72],'steel',.006),'backgauge-guide-block');
   const encoder=this.findNode('polar-gauge-encoder');if(encoder){
    tag(this.cyl(encoder,.025,.18,[.68,.80,.65],'steel','x'),'backgauge-encoder-coupling');
    tag(this.box(encoder,[.12,.12,.08],[.74,.80,.61],'dark',.008),'position-encoder-body');
   }
  }

  const clamp=this.findNode('polar-clamp');if(clamp){
   const pressure=this.group(clamp,'polar-clamp-pressure-v122','Clamp pressure regulation',[0,0,0],[0,.12,.20]);
   tag(this.cyl(pressure,.055,.12,[.62,1.32,.14],'dark','z'),'clamp-pressure-adjuster');
   tag(this.box(pressure,[.16,.10,.08],[.62,1.20,.14],'steel',.008),'clamp-pressure-valve');
   tag(this.cyl(pressure,.035,.12,[.44,1.20,.14],'steel','x'),'clamp-pressure-line-reference');
   const cylinders=this.findNode('polar-clamp-cylinders');if(cylinders)for(const x of [-.48,.48])tag(this.cyl(cylinders,.025,.28,[x,1.28,.02],'steel','y'),'clamp-piston-rod');
  }

  const knife=this.findNode('polar-knife');if(knife){
   const linkage=this.group(knife,'polar-knife-linkage-v122','Knife carrier drive, clutch and top-stop reference',[0,0,0],[0,.16,.18]);
   for(const x of [-.56,.56]){
    tag(this.box(linkage,[.10,.34,.10],[x,1.34,.15],'steel',.007),'knife-carrier-guide');
    tag(this.cyl(linkage,.070,.12,[x,1.60,.15],'dark','z'),'knife-drive-pivot');
   }
   tag(this.cyl(linkage,.18,.14,[.78,.74,.50],'dark','z'),'knife-drive-clutch');
   tag(this.cyl(linkage,.24,.12,[.78,.74,.50],'steel','z'),'knife-drive-gear');
   tag(this.box(linkage,[.20,.20,.10],[.78,.98,.50],'accent',.010),'knife-top-position-stop');
   const change=this.group(knife,'polar-knife-change-v122','Knife-change handle / carrier support reference',[0,0,0],[0,.12,-.20]);
   tag(this.cyl(change,.025,.52,[-.82,1.34,-.12],'steel','y'),'knife-change-handle');
   tag(this.box(change,[.20,.12,.12],[-.82,1.08,-.12],'dark',.010),'knife-change-support');
   const rack=this.group(knife,'polar-knife-rack-v122','Drilled accessory bracket (gauge / spare-part storage)',[0,0,0],[0,.10,-.16]);rack.userData.detail=true;
   const rackPlate=tag(this.box(rack,[.05,.34,.22],[.90,1.10,.10],'body',.02),'accessory-rack-plate','BMJ_INSTALLATION_PHOTOGRAPH');rackPlate.rotation.y=-.5;
   for(let i=0;i<5;i++){const h=this.cyl(rack,.021,.06,[.92-i*.007,1.24-i*.075,.10+i*.03],'black','x');h.userData.detail=true;h.userData.evidence='BMJ_INSTALLATION_PHOTOGRAPH';}
  }

  const safety=this.findNode('polar-safety');if(safety){
   const line=this.group(safety,'polar-cut-line-v122','Optical/mechanical cutting-line indication',[0,0,0],[0,.08,-.30]);
   const emitter=tag(this.box(line,[.10,.10,.08],[-.70,1.02,-.44],'dark',.008),'cut-line-emitter');
   const receiver=tag(this.box(line,[.10,.10,.08],[.70,1.02,-.44],'dark',.008),'cut-line-receiver');
   emitter.userData.opticalReference=true;receiver.userData.opticalReference=true;
   const beam=this.box(line,[1.30,.008,.008],[0,.995,-.44],'air',0);beam.material.transparent=true;beam.material.opacity=.30;tag(beam,'cut-line-indicator-beam');
  }

  const utility=this.findNode('polar-utility');if(utility){
   const pump=this.findNode('polar-hyd-power');if(pump){
    tag(this.cyl(pump,.085,.24,[-.32,.42,.55],'dark','x'),'hydraulic-pump-motor');
    tag(this.box(pump,[.28,.20,.18],[-.08,.50,.55],'steel',.010),'hydraulic-reservoir-filter');
   }
   const manifold=this.findNode('polar-hyd-valve');if(manifold){
    for(const x of [.16,.25,.34])tag(this.cyl(manifold,.020,.10,[x,.52,.55],'steel','y'),'hydraulic-solenoid-valve');
    for(const z of [.46,.58,.70])tag(this.cyl(manifold,.012,.54,[.05,.60,z],'steel','x'),'hydraulic-line-reference','SERVICE_TOPOLOGY__ROUTING_VISUAL');
   }
  }
 }
 findNode(id){return id==='POLAR-115-EM'?this.root:this.nodes.find(n=>n.userData.nodeId===id)||null;}
 resolvePart(o){for(let p=o;p&&p!==this.root;p=p.parent)if(p.userData.selectable)return p;return null;}
 resolveTaxonomyNode(id){let m=this.taxonomyById.get(id);while(m){for(const r of m.meshRefs||[]){const n=this.findNode(r);if(n)return n;}m=m.parentId?this.taxonomyById.get(m.parentId):null;}return this.root;}
 contains(a,b){for(let p=b;p;p=p.parent)if(p===a)return true;return false;}
 explode(t,s=null){for(const n of this.nodes)n.position.copy(n.userData.rest);const targets=s?(s.children.filter(c=>c.userData?.selectable).length?s.children.filter(c=>c.userData.selectable):[s]):this.parts;for(const n of targets)n.position.addScaledVector(n.userData.explode,THREE.MathUtils.clamp(+t||0,0,1));}
 highlight(p){for(const m of this.meshes){m.material.emissive?.setHex(p&&this.contains(p,m)?0x17494a:0);m.material.emissiveIntensity=.3;}}
 highlightMany(ps=[]){for(const m of this.meshes){m.material.emissive?.setHex(ps.some(p=>this.contains(p,m))?0x17494a:0);m.material.emissiveIntensity=.3;}}
 ghost(on,except=null){this.ghosted=!!on;for(const m of this.meshes){const fade=on&&(!except||!this.contains(except,m)),base=m.material.userData.baseOpacity??1;m.material.transparent=fade||base<1;m.material.opacity=fade?.14:base;m.material.depthWrite=!fade;}}
 isolate(p,on=true){for(const n of this.nodes)n.visible=!on||!p||this.contains(p,n)||this.contains(n,p);}
 showOnly(ps=[],on=true){for(const n of this.nodes)n.visible=!on||!ps.length||ps.some(p=>n===p||this.contains(n,p));}
 setExteriorOpen(on=true){this.exteriorOpen=!!on;let hidden=0;for(const m of this.meshes)if(m.userData.exteriorCover){m.visible=!on;if(on)hidden++;}this.root.userData.interiorCutawayVisible=!!on;this.root.userData.exteriorHiddenCount=on?hidden:0;}
 setLow(on){for(const m of this.meshes)if(m.userData.detail)m.visible=!on;}
 reset(){this.explode(0);this.highlight(null);this.isolate(null,false);this.ghost(false);for(const n of this.nodes)n.quaternion.copy(n.userData.restQuaternion);if(this.exteriorOpen)this.setExteriorOpen(true);}
 dispose(){this.geometries.forEach(g=>g.dispose());this.materials.forEach(m=>m.dispose());}
}