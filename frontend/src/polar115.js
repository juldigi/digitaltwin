import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {POLAR115_TAXONOMY} from './data/taxonomy-polar115.js';
import {POLAR115_SPEC,POLAR115_REFERENCE_DIMENSIONS} from './data/dimensions-polar115.js';
import {POLAR115_TECHNICAL_SOURCES} from './data/sources-polar115.js';
import {V122_SOURCE_STATS} from './data/research-v122.js';

export class Polar115MachineTemplate{
 constructor(){
  this.root=new THREE.Group();this.root.name='POLAR-115-EM';this.parts=[];this.nodes=[];this.meshes=[];this.materials=[];this.geometries=[];this.activeMeshes=[];this.exteriorOpen=false;
  this.palette={body:0xb8bbb5,bodyDark:0x8f938f,dark:0x252b2e,table:0xb6b8b2,tableDark:0x514a43,steel:0xa9b0b1,accent:0x405961,warning:0xd0a338,screen:0x173e34,red:0xb6302d,paper:0xece5d2,black:0x111517,air:0x8bbad0};
  this.build();this.enrichV122();this.taxonomy=POLAR115_TAXONOMY;this.taxonomyById=new Map(this.taxonomy.map(n=>[n.id,n]));
  for(const n of this.nodes){n.userData.rest=n.position.clone();n.userData.restQuaternion=n.quaternion.clone();}this.root.updateMatrixWorld(true);
  this.root.userData={assetId:POLAR115_SPEC.assetId,nodeId:'POLAR-115-EM',model:POLAR115_SPEC.model,serial:POLAR115_SPEC.serial,spec:POLAR115_SPEC,sources:POLAR115_TECHNICAL_SOURCES,machineEnvelope:{reference:POLAR115_REFERENCE_DIMENSIONS},geometryStatus:'DEDICATED_BMJ_PHOTO_MATCHED__ARCHIVE_DIMENSIONS_NOT_INSTALLATION_CAD',engineeringDimensions:false,evidenceBoundary:POLAR115_SPEC.evidenceBoundary,researchVersion:'V123_PHOTO_MATCHED',researchSourceCount:V122_SOURCE_STATS.total,detailPass:'V123_POLAR115_BMJ_PHOTO_MATCHED',actualPhotoEvidence:'BMJ-POLAR-PHOTOS-2026-09',mainHousingProfile:'RECTANGULAR_ROUNDED_HEAD__NO_HALF_CYLINDER_ROOF'};
 }
 mat(kind,transparent=false){const m=new THREE.MeshStandardMaterial({color:this.palette[kind]??this.palette.body,metalness:['steel','table','tableDark'].includes(kind)?.45:.08,roughness:kind==='screen'?.18:kind==='tableDark'?.42:.52,transparent,opacity:transparent?.36:1});m.userData.baseOpacity=m.opacity;this.materials.push(m);return m;}
 group(parent,id,name,pos=[0,0,0],explode=[0,.18,0]){const g=new THREE.Group();g.name=name;g.position.set(...pos);g.userData={nodeId:id,selectable:true,explode:new THREE.Vector3(...explode)};parent.add(g);this.nodes.push(g);if(parent===this.root)this.parts.push(g);return g;}
 mesh(g,geo,kind,pos=[0,0,0],rot=null,id=null){const x=new THREE.Mesh(geo,this.mat(kind));x.position.set(...pos);if(rot)x.rotation.set(...rot);x.castShadow=!['screen','air'].includes(kind);x.receiveShadow=true;x.userData={ownerId:g.userData.nodeId};if(id)x.name=id;g.add(x);this.meshes.push(x);this.geometries.push(geo);return x;}
 box(g,s,p,k='body',r=.025,id=null){return this.mesh(g,r?new RoundedBoxGeometry(...s,2,r):new THREE.BoxGeometry(...s),k,p,null,id);}
 cyl(g,r,l,p,k='steel',axis='z',id=null){return this.mesh(g,new THREE.CylinderGeometry(r,r,l,24),k,p,axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:null,id);}
 cover(m){m.userData.exteriorCover=true;return m;}active(m,role=''){m.userData.activeElement=true;m.userData.mechanismRole=role;this.activeMeshes.push(m);return m;}
 holes(group,width,depth,y,zCenter,countX,countZ){const grid=this.group(group,'polar-feed-grid-'+group.userData.nodeId,'Air-nozzle grid');for(let ix=0;ix<countX;ix++)for(let iz=0;iz<countZ;iz++){const x=-width*.42+(width*.84)*(ix/Math.max(1,countX-1)),z=zCenter-depth*.38+(depth*.76)*(iz/Math.max(1,countZ-1));const h=this.cyl(grid,.009,.006,[x,y+.064,z],'black','y');h.userData.detail=true;h.userData.airNozzle=true;}return grid;}
 build(){
  const photoEvidence='BMJ-POLAR-PHOTOS-2026-09';

  // BMJ actual machine: low base cabinet supporting a broad dark cutting deck.
  const frame=this.group(this.root,'polar-frame','Base Cabinet');
  frame.userData.evidence=photoEvidence;
  this.cover(this.box(frame,[2.06,.58,1.64],[0,.29,.25],'bodyDark',.055));
  for(const x of [-.58,0,.58]){
   const door=this.box(frame,[.46,.38,.018],[x,.31,-.58],'body',.018);door.userData.detail=true;door.userData.evidence=photoEvidence;
  }
  const basePlinth=this.box(frame,[2.10,.08,1.68],[0,.04,.25],'dark',.018);basePlinth.userData.evidence=photoEvidence;

  const feed=this.group(this.root,'polar-feed','Cutting Table & Material Handling',[0,0,0],[0,.16,-.35]);
  feed.userData.evidence=photoEvidence;
  const center=this.group(feed,'polar-feed-center','Main dark cutting table');
  const mainDeck=this.box(center,[1.48,.08,.74],[-.04,.90,-.36],'tableDark',.018);mainDeck.userData.evidence=photoEvidence;
  const bevel=this.box(center,[.34,.08,.34],[.56,.90,-.02],'tableDark',.018);bevel.rotation.y=-Math.PI/4;bevel.userData.tableBevel=true;bevel.userData.evidence=photoEvidence;

  const left=this.group(feed,'polar-feed-left','Left perforated air-float side table',[-1.015,0,0]);
  const leftDeck=this.box(left,[.60,.06,.72],[0,.90,-.36],'table',.018);leftDeck.userData.evidence=photoEvidence;this.holes(left,.60,.72,.90,-.36,5,6);
  const right=this.group(feed,'polar-feed-right','Right perforated air-float side table',[1.015,0,0]);
  const rightDeck=this.box(right,[.60,.06,.72],[0,.90,-.36],'table',.018);rightDeck.userData.evidence=photoEvidence;this.holes(right,.60,.72,.90,-.36,5,6);
  for(const g of [left,right])for(const x of [-.22,.22]){
   const leg=this.box(g,[.028,.82,.028],[x,.45,-.22],'dark',.006);leg.userData.evidence=photoEvidence;
  }
  const crank=this.group(right,'polar-feed-right-crank','Side-table height-adjust crank wheel');crank.userData.detail=true;crank.userData.evidence=photoEvidence;
  this.cyl(crank,.082,.025,[.28,.62,-.66],'dark','x');this.cyl(crank,.013,.16,[.28,.62,-.66],'steel','x');

  // Long back table and guides remain archive-dimension bounded; photo confirms the dark steel surface.
  const rearTable=this.group(feed,'polar-feed-rear','Back table');
  const rearDeck=this.box(rearTable,[1.44,.06,1.15],[0,.90,.565],'tableDark',.018);rearDeck.userData.evidence=photoEvidence;
  this.holes(rearTable,1.44,1.15,.90,.565,7,7);

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

  // Actual front opening has a deep dark recess with a dense vertical finger/guard field.
  const opening=this.group(this.root,'polar-opening','Cutting opening / finger field');
  opening.userData.evidence=photoEvidence;
  const recess=this.box(opening,[1.46,.46,.045],[0,1.18,.16],'black',.012);recess.userData.detail=true;recess.userData.evidence=photoEvidence;
  for(let i=0;i<23;i++){
   const finger=this.box(opening,[.018,.35,.028],[-.66+i*.06,1.12,.125],'dark',.003);finger.userData.detail=true;finger.userData.evidence=photoEvidence;
  }

  // BMJ photos show two projecting front arms, not generic freestanding light-barrier posts.
  const safety=this.group(this.root,'polar-safety','Safety System',[0,0,0],[0,.24,-.45]);
  const photo=this.group(safety,'polar-safety-photo','Front safety / control arms');photo.userData.evidence=photoEvidence;
  const leftArm=this.group(photo,'polar-safety-left-arm','Front-left safety/control arm');
  const la=this.cover(this.box(leftArm,[.24,.19,.56],[-.76,1.08,-.34],'body',.055));la.rotation.x=.045;la.userData.evidence=photoEvidence;
  const rightArm=this.group(photo,'polar-safety-right-arm','Front-right drilled safety arm');
  const ra=this.cover(this.box(rightArm,[.24,.19,.56],[.76,1.08,-.34],'body',.055));ra.rotation.x=.045;ra.userData.evidence=photoEvidence;
  for(let i=0;i<4;i++){const aperture=this.cyl(rightArm,.025,.015,[.885,1.09,-.52+i*.12],'black','x');aperture.userData.detail=true;aperture.userData.photoCell=true;aperture.userData.evidence=photoEvidence;}
  const twohand=this.group(safety,'polar-safety-twohand','Two-hand cut control reference');twohand.userData.simultaneityControlReference=true;twohand.userData.antiRepeatReference=true;
  for(const x of [-.76,.76]){const base=this.cyl(twohand,.035,.018,[x,1.185,-.49],'warning','y');base.userData.detail=true;const button=this.cyl(twohand,.022,.020,[x,1.202,-.49],'red','y');button.userData.twoHandButton=true;}
  const estop=this.group(safety,'polar-safety-estop','Front-left mushroom safety button');
  const estopBase=this.cyl(estop,.040,.018,[-.76,1.184,-.38],'warning','y');estopBase.userData.evidence=photoEvidence;
  const estopButton=this.cyl(estop,.027,.022,[-.76,1.204,-.38],'red','y');estopButton.userData.evidence=photoEvidence;
  const rear=this.group(safety,'polar-safety-rear','Rear guard reference');this.cover(this.box(rear,[1.48,.24,.035],[0,1.13,1.16],'body',.018));

  // Actual control face: small square display, keypad/controls and taped operating sheets.
  const control=this.group(this.root,'polar-control','EM-MONITOR Control',[0,0,0],[0,.24,-.20]);control.userData.evidence=photoEvidence;
  const panel=this.group(control,'polar-control-panel','Program / dimension console');
  const panelFace=this.cover(this.box(panel,[1.30,.30,.045],[0,1.47,.33],'bodyDark',.035));panelFace.userData.evidence=photoEvidence;
  const crt=this.group(control,'polar-control-crt','Industrial program display');
  const crtBody=this.box(crt,[.26,.22,.038],[.02,1.51,.295],'black',.012);crtBody.userData.evidence=photoEvidence;
  const crtScreen=this.box(crt,[.20,.16,.008],[.02,1.51,.272],'screen',.006,'Program Display');crtScreen.userData.evidence=photoEvidence;
  const keypad=this.group(control,'polar-control-keypad','Numeric / function keypad');
  for(let i=0;i<18;i++){const col=i%6,row=Math.floor(i/6);const key=this.box(keypad,[.030,.026,.010],[-.33+col*.045,1.39-row*.040,.270],i%6===5?'warning':'body',.003);key.userData.detail=true;}
  const keyswitch=this.group(control,'polar-control-keyswitch','Key-operated mode-select sub-panel');
  const keyPlate=this.cover(this.box(keyswitch,[.21,.28,.045],[.52,1.47,.33],'body',.025));keyPlate.userData.evidence=photoEvidence;
  this.cyl(keyswitch,.034,.026,[.52,1.51,.280],'black','z');this.cyl(keyswitch,.016,.045,[.46,1.40,.280],'dark','z');
  const papers=this.group(control,'polar-control-papers','Laminated instruction sheets on console');papers.userData.detail=true;papers.userData.evidence=photoEvidence;
  this.box(papers,[.28,.22,.006],[-.45,1.51,.268],'paper',0);this.box(papers,[.24,.20,.006],[.28,1.51,.268],'paper',0);
  const memory=this.group(control,'polar-control-memory','Eltromat Memory / program interface');for(let i=0;i<20;i++){const col=i%10,row=Math.floor(i/10);this.box(memory,[.030,.024,.010],[-.35+col*.055,1.34-row*.045,.269],i%8===0?'warning':'body',.003);}
  const corr=this.group(control,'polar-control-correction','Correction / pressure controls');for(const [x,k] of [[.45,'body'],[.58,'body'],[.70,'warning']])this.cyl(corr,.032,.020,[x,1.36,.270],k,'z');
  const pressure=this.group(control,'polar-control-pressure','Clamp-pressure control interface');this.cyl(pressure,.055,.030,[.77,1.28,.285],'dark','z');

  const utility=this.group(this.root,'polar-utility','Hydraulic & Air Utility',[-.55,0,.48],[-.32,.18,.30]);
  const hyd=this.group(utility,'polar-hyd-power','Hydraulic power-unit reference');this.active(this.box(hyd,[.48,.38,.38],[-.20,.37,.55],'accent',.035),'hydraulic-power');
  const valve=this.group(utility,'polar-hyd-valve','Valve / manifold reference');this.box(valve,[.30,.18,.24],[.25,.45,.55],'steel',.018);
  const blower=this.group(utility,'polar-air-blower','Air blower');this.active(this.cyl(blower,.14,.30,[.50,.32,.56],'dark','x'),'air-blower');
  const duct=this.group(utility,'polar-air-duct','Air-distribution duct reference');this.cyl(duct,.045,.72,[.10,.62,.42],'steel','x');

  // Photo-matched rectangular cutter head with rounded shoulders. No half-cylinder roof.
  const housing=this.group(this.root,'polar-housing','Main Housing');
  housing.userData.evidence=photoEvidence;
  const rearShell=this.cover(this.box(housing,[2.06,1.05,.28],[0,1.13,.83],'bodyDark',.12));rearShell.userData.evidence=photoEvidence;
  const leftPillar=this.cover(this.box(housing,[.34,.92,.54],[-.87,1.22,.42],'body',.11));leftPillar.userData.evidence=photoEvidence;
  const rightPillar=this.cover(this.box(housing,[.34,.92,.54],[.87,1.22,.42],'body',.11));rightPillar.userData.evidence=photoEvidence;
  const topBridge=this.cover(this.box(housing,[1.78,.40,.54],[0,1.58,.42],'body',.12));topBridge.userData.consoleBrow=true;topBridge.userData.evidence=photoEvidence;

  // Operator-right side belt-drive enclosure with circular inspection window, visible in rear-side photo.
  const motorEnd=this.group(housing,'polar-housing-motor-end','Side belt-drive housing with inspection window',[0,0,0],[.14,.06,0]);motorEnd.userData.evidence=photoEvidence;
  const motorCover=this.cover(this.box(motorEnd,[.42,1.10,.58],[1.20,.68,.78],'body',.13));motorCover.userData.evidence=photoEvidence;
  const windowRing=this.cyl(motorEnd,.16,.025,[1.415,.76,.78],'dark','x');windowRing.userData.detail=true;windowRing.userData.inspectionWindow=true;windowRing.userData.evidence=photoEvidence;
  const windowGlass=this.cyl(motorEnd,.12,.028,[1.425,.76,.78],'screen','x');windowGlass.userData.detail=true;windowGlass.userData.evidence=photoEvidence;
  const motor=this.active(this.cyl(motorEnd,.16,.42,[1.17,.20,.74],'dark','x'),'belt-drive-motor');motor.userData.evidence=photoEvidence;
  this.cyl(motorEnd,.07,.16,[1.17,.35,.74],'steel','x');

  const decal=this.group(housing,'polar-housing-decal','BAHAYA TERJEPIT pinch-point warning decal');decal.userData.detail=true;decal.userData.evidence=photoEvidence;
  this.box(decal,[.22,.12,.006],[-.72,1.49,.138],'red',0,'Pinch-Point Warning');this.box(decal,[.20,.07,.006],[-.72,1.43,.136],'paper',0);
  const nameplate=this.group(housing,'polar-housing-nameplate','POLAR rating / serial nameplate');nameplate.userData.detail=true;nameplate.userData.evidence=photoEvidence;this.box(nameplate,[.15,.10,.006],[-.93,1.56,.96],'warning',.004,'Rating Plate');
  const baseDecal=this.group(frame,'polar-frame-decal','High-voltage warning decal on base cabinet door');baseDecal.userData.detail=true;baseDecal.userData.evidence=photoEvidence;this.box(baseDecal,[.13,.13,.006],[.20,.32,-.595],'warning',0,'High-Voltage Warning');

  const pedal=this.group(frame,'polar-frame-pedal','Front foot pedal');pedal.userData.evidence=photoEvidence;
  this.active(this.box(pedal,[.18,.035,.30],[0,.035,-.78],'dark',.012),'foot-pedal');this.cyl(pedal,.018,.30,[0,.15,-.64],'steel','x');

  // Red optical cut line in the actual BMJ photo, aligned with the simulation cutLineZ=0.
  const cutLine=this.group(safety,'polar-cut-line-photo','Red optical cut-line mark');
  const redLine=this.box(cutLine,[1.34,.006,.010],[0,.948,-.015],'red',0);redLine.material.emissive?.setHex(0x7a1010);redLine.material.emissiveIntensity=.45;redLine.userData.evidence=photoEvidence;
 }
 enrichV122(){
  this.root.userData.researchVersion='V123_PHOTO_MATCHED';
  this.root.userData.researchSourceCount=V122_SOURCE_STATS.total;
  this.root.userData.detailPass='V123_POLAR115_BMJ_PHOTO_MATCHED';
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
