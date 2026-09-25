import * as THREE from 'three';import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {MK1060_SPEC,MK1060_STATIONS} from './data/dimensions-mk1060.js';import {MK1060_TAXONOMY,MK1060_TAXONOMY_BY_ID} from './data/taxonomy-mk1060.js';import {MK1060_ORIENTATION,MK1060_TECHNICAL_SOURCES} from './data/sources-mk1060.js';import {V122_SOURCE_STATS} from './data/research-v122.js';
const V=a=>new THREE.Vector3(...a);
export class MK1060MachineTemplate{
 constructor(){this.spec=MK1060_SPEC;this.root=new THREE.Group();this.root.name='APM 7 · MK 1060 ER';this.root.userData={assetId:this.spec.assetId,nodeId:'mk1060-root',spec:this.spec,sources:MK1060_TECHNICAL_SOURCES,orientation:MK1060_ORIENTATION,taxonomyVersion:'mk1060-v2',evidenceGrade:'MODEL_MANUAL_PROCESS_GROUNDED',geometryStatus:'MODEL_ENVELOPE_PROCESS_REFERENCE__NOT_INSTALLATION_CAD',engineeringDimensions:false};this.parts=[];this.nodes=[];this.meshes=[];this.geometries=new Map();this.materials=new Map();this.build();this.enrichV122();this.taxonomy=MK1060_TAXONOMY;this.taxonomyById=MK1060_TAXONOMY_BY_ID;for(const n of this.nodes){n.userData.rest=n.position.clone();n.userData.restQuaternion=n.quaternion.clone();}this.root.updateMatrixWorld(true);}
 group(parent,id,name,pos=[0,0,0],explode=[0,0,0]){const g=new THREE.Group();g.name=name;g.position.set(...pos);g.userData={assetId:this.spec.assetId,nodeId:id,selectable:true,explode:V(explode),confidence:'MANUAL_PROCESS_GROUNDED'};parent.add(g);this.nodes.push(g);if(parent===this.root)this.parts.push(g);return g;}
 mat(k){if(!this.materials.has(k)){const c={ivory:0xe8e9e5,red:0xa82f2b,dark:0x242c30,black:0x111719,steel:0x879398,silver:0xc3cacc,rubber:0x262b2d,paper:0xefe8d3,board:0xd9c39c,gold:0xc49a42,blue:0x416f82,glass:0x6fa8b7,waste:0xb4966d}[k]||0x888888;const m=new THREE.MeshStandardMaterial({color:c,metalness:['steel','silver'].includes(k)?.55:.12,roughness:(k==='paper'||k==='board') ? .88 : .46,transparent:k==='glass',opacity:k==='glass'?.30:1});m.userData.baseOpacity=m.opacity;this.materials.set(k,m);}return this.materials.get(k);}
 mesh(g,geo,key,k='dark',p=[0,0,0],r=null){if(!this.geometries.has(key))this.geometries.set(key,geo());const m=new THREE.Mesh(this.geometries.get(key),this.mat(k));m.position.set(...p);if(r)m.rotation.set(...r);m.castShadow=k!=='glass';m.receiveShadow=true;m.userData.ownerId=g.userData.nodeId;g.add(m);this.meshes.push(m);return m;}
 box(g,s,p,k='dark',rad=.02){return this.mesh(g,()=>rad?new RoundedBoxGeometry(...s,2,rad):new THREE.BoxGeometry(...s),'b'+s+rad,k,p);}
 cyl(g,r,l,p,k='steel',role='',axis='z'){
  const rot=axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:null,m=this.mesh(g,()=>new THREE.CylinderGeometry(r,r,l,24),'c'+r+l+axis,k,p,rot);
  const rotating=/^(pile-lift|feed-wheel|chain-sprocket|torque-limiter|clutch|pressure-eccentric|strip-cam|waste-release|waste-conveyor|main-motor|flywheel)$/.test(role);
  m.userData.rotor=rotating;m.userData.mechanismRole=role;m.userData.rotorAxis=axis;m.userData.radius=r;m.userData.reciprocator=role==='suction-cup';
  if(rotating)m.userData.spinDirection=/^(chain-sprocket|clutch|strip-cam|waste-conveyor|flywheel)$/.test(role)?-1:1;
  return m;
 }cover(m){m.userData.exteriorCover=true;return m;}
 build(){this.buildAccess();this.buildFeeder();this.buildRegister();this.buildTransport();this.buildPlaten();this.buildStripping();this.buildBlanking();this.buildWaste();this.buildDrive();this.buildExteriorIdentity();}
 buildAccess(){const g=this.group(this.root,'mk1060-access','Frame, guards and operator access');const frame=this.group(g,'mk1060-access-frame','Main side frames');for(const z of [-1.42,1.42]){this.box(frame,[6.25,.30,.18],[.05,.38,z],'red',.04);for(const x of [-2.98,-1.59,-.06,1.47,3.05])this.box(frame,[.18,2.18,.18],[x,1.42,z],'red',.035);}const guard=this.group(g,'mk1060-access-guard','Interlocked safety guards');for(const z of [-1.50,1.50])for(const [x,w] of [[-2.38,1.18],[-.82,1.30],[.70,1.18],[2.22,1.18]]){this.cover(this.box(guard,[w,.50,.08],[x,1.06,z],'ivory',.025));this.cover(this.box(guard,[w,.40,.08],[x,2.19,z],'ivory',.025));for(const side of [-1,1])this.cover(this.box(guard,[w*.13,.68,.08],[x+side*w*.435,1.65,z],'ivory',.018));this.cover(this.box(guard,[w*.74,.68,.026],[x,1.65,z+(z<0?-.05:.05)],'glass',.014));}const platform=this.group(g,'mk1060-access-platform','Elevated operator platform and stairs');this.box(platform,[6.15,.14,.64],[.15,.30,-1.83],'dark');for(let x=-2.55;x<2.85;x+=.52)this.box(platform,[.34,.025,.60],[x,.39,-1.83],'steel',0);for(let i=0;i<4;i++)this.box(platform,[.64,.10,.78],[-3.05+i*.18,.08+i*.10,-1.83],'steel',.01);}
 buildFeeder(){const g=this.group(this.root,'mk1060-feeder','Non-stop pile feeder',[MK1060_STATIONS[0].x,0,0],[-.85,.15,0]);for(const z of [-1.14,1.14])this.cover(this.box(g,[1.62,.19,.12],[0,1.94,z],'ivory',.025));for(const x of [-.76,.76])for(const z of [-1.14,1.14])this.cover(this.box(g,[.10,1.54,.10],[x,1.16,z],'ivory',.018));for(const z of [-1.17,1.17])this.cover(this.box(g,[1.52,.37,.055],[0,1.69,z],'ivory',.012));const pile=this.group(g,'mk1060-feeder-pile','Pile lift');this.box(pile,[1.05,.08,1.42],[-.20,.42,0],'steel');this.box(pile,[1.02,.82,1.38],[-.20,.87,0],'paper');for(const z of [-.58,.58]){this.cyl(pile,.05,.10,[-.64,.42,z],'black','pile-lift');this.cyl(pile,.05,.10,[.22,.42,z],'black','pile-lift');}const head=this.group(g,'mk1060-feeder-head','Suction head');this.box(head,[.72,.28,1.34],[.34,2.03,0],'dark');for(const z of [-.48,-.16,.16,.48]){this.cyl(head,.035,.16,[.54,1.81,z],'rubber','suction-cup');this.box(head,[.04,.23,.04],[.54,1.91,z],'steel');}const ns=this.group(g,'mk1060-feeder-nonstop','Non-stop rack');for(const z of [-.54,-.27,0,.27,.54])this.box(ns,[.86,.035,.035],[-.32,1.06,z],'steel');}
 buildRegister(){const g=this.group(this.root,'mk1060-register','Feed table and register',[MK1060_STATIONS[1].x,0,0],[-.35,.15,0]);const table=this.group(g,'mk1060-register-table','Feed table');this.box(table,[1.34,.11,1.60],[0,1.03,0],'steel');for(const z of [-.56,-.28,0,.28,.56])this.cyl(table,.032,1.05,[0,1.12,z],'rubber','feed-wheel');const front=this.group(g,'mk1060-register-front','Front lays');for(const z of [-.43,.43])this.box(front,[.065,.15,.12],[.52,1.17,z],'gold');const side=this.group(g,'mk1060-register-side','Operator-side pull guide');this.box(side,[.24,.10,.18],[.20,1.17,-.72],'gold');this.box(g,[1.42,.55,1.82],[0,.67,0],'dark',.035);}
 buildTransport(){const g=this.group(this.root,'mk1060-transport','Gripper-bar chain transport',[0,0,0],[0,.18,.42]);const chain=this.group(g,'mk1060-transport-chain','Gripper chains');for(const z of [-.98,.98]){for(const x of [-2.25,2.55])this.cyl(chain,.20,.10,[x,1.20,z],'steel','chain-sprocket');this.box(chain,[4.80,.035,.035],[.15,1.37,z],'black');}const bars=this.group(g,'mk1060-transport-bar','Intermittent gripper bars');for(let i=0;i<9;i++){const x=-2.08+i*(4.38/8),bar=this.group(bars,'mk1060-transport-gripper-'+(i+1),'Gripper bar '+(i+1),[x,1.35,0]);bar.userData.gripperBar=true;bar.userData.barPhase=i/9;this.box(bar,[.055,.045,1.90],[0,0,0],'steel');for(const z of [-.72,-.36,0,.36,.72])this.box(bar,[.10,.032,.055],[0,-.06,z],'gold');}const torque=this.group(g,'mk1060-transport-torque','Gripper-chain torque limiter');this.cyl(torque,.27,.16,[-1.82,.64,1.16],'dark','torque-limiter');this.cyl(torque,.13,.20,[-1.82,.64,1.16],'steel','clutch');}
 buildPlaten(){const g=this.group(this.root,'mk1060-platen','Flatbed die-cutting platen',[MK1060_STATIONS[2].x,0,0],[0,.28,.40]);const chase=this.group(g,'mk1060-platen-chase','Upper cutting chase');this.box(chase,[1.42,.16,1.88],[0,1.80,0],'steel');this.box(chase,[1.25,.055,1.70],[0,1.68,0],'dark');const lower=this.group(g,'mk1060-platen-lower','Moving lower platen');this.box(lower,[1.44,.22,1.90],[0,1.28,0],'steel');lower.userData.platenMoving=true;const drive=this.group(g,'mk1060-platen-drive','Pressure drive');for(const z of [-.64,.64]){const a=this.box(drive,[.11,.76,.13],[-.34,.83,z],'steel');a.rotation.z=.42;const b=this.box(drive,[.11,.76,.13],[.34,.83,z],'steel');b.rotation.z=-.42;}this.cyl(drive,.22,1.54,[0,.53,0],'dark','pressure-eccentric');}
 buildStripping(){const g=this.group(this.root,'mk1060-stripping','Double-action stripping',[MK1060_STATIONS[3].x,0,0],[0,.32,.48]);const up=this.group(g,'mk1060-strip-upper','Upper stripping frame');this.box(up,[1.38,.10,1.82],[0,1.78,0],'steel');for(let x=-.48;x<=.48;x+=.24)for(const z of [-.55,-.18,.18,.55]){const p=this.cyl(up,.022,.16,[x,1.66,z],'gold','upper-strip-pin','z');p.userData.strippingUpper=true;}const low=this.group(g,'mk1060-strip-lower','Lower stripping frame');this.box(low,[1.40,.10,1.84],[0,1.20,0],'steel');for(const z of [-.62,.62])this.box(low,[1.16,.05,.08],[0,1.28,z],'dark');const action=this.group(g,'mk1060-strip-action','Double-action stripping mechanism');for(const z of [-.70,.70]){this.cyl(action,.10,.18,[-.46,.76,z],'dark','strip-cam');this.cyl(action,.10,.18,[.46,.76,z],'dark','strip-cam');}up.userData.stripUpperMoving=true;low.userData.stripLowerMoving=true;}
 buildBlanking(){const g=this.group(this.root,'mk1060-blanking','Blanking and product separation',[MK1060_STATIONS[4].x,0,0],[0,.35,.52]);const up=this.group(g,'mk1060-blank-upper','Upper blanking frame');this.box(up,[1.38,.11,1.82],[0,1.78,0],'steel');for(const z of [-.55,-.18,.18,.55]){const p=this.box(up,[.64,.08,.14],[0,1.66,z],'gold',.01);p.userData.blankingTool=true;}const low=this.group(g,'mk1060-blank-lower','Lower blanking support frame');this.box(low,[1.40,.10,1.84],[0,1.20,0],'steel');const stack=this.group(g,'mk1060-blank-stack','Blank stacking plate');this.box(stack,[1.05,.07,1.36],[.24,.51,0],'steel');up.userData.blankUpperMoving=true;low.userData.blankLowerMoving=true;}
 buildWaste(){const g=this.group(this.root,'mk1060-waste','Waste and product delivery',[MK1060_STATIONS[5].x,0,0],[.72,.18,0]);const edge=this.group(g,'mk1060-waste-edge','Sheet-edge waste release');this.cyl(edge,.12,1.55,[-.46,1.45,0],'steel','waste-release');const wc=this.group(g,'mk1060-waste-conveyor','Waste conveyor');for(const x of [-.25,.52])this.cyl(wc,.10,1.30,[x,.62,.56],'rubber','waste-conveyor');this.box(wc,[1.05,.045,1.26],[.13,.71,.56],'waste');const product=this.group(g,'mk1060-product-delivery','Product conveyor / delivery');for(const z of [-.48,-.16,.16,.48])this.box(product,[1.34,.045,.11],[.38,.78,z],'rubber',.01);this.box(product,[1.42,.10,1.34],[.40,.66,0],'dark',.02);this.cover(this.box(g,[1.95,.18,2.40],[.25,2.06,0],'ivory',.035));for(const x of [-.67,1.17])for(const z of [-1.14,1.14])this.cover(this.box(g,[.10,1.52,.10],[x,1.20,z],'ivory',.018));for(const z of [-1.17,1.17])this.cover(this.box(g,[1.84,.38,.055],[.25,1.76,z],'ivory',.012));}
 buildExteriorIdentity(){
  const g=this.group(this.root,'mk1060-exterior-v230','MK1060ER exterior silhouette refinement');
  g.userData.visualRefinement='V230_MK1060ER_MODEL_FAMILY_SILHOUETTE';
  g.userData.sourceBoundary='MK1060ER_MANUAL_ARCHIVE__INSTALLED_GUARD_PACKAGE_BOUNDED';
  for(const z of [-1.44,1.44]){
   this.cover(this.box(g,[5.55,.54,.11],[.18,.58,z],'dark',.035));
   this.cover(this.box(g,[5.40,.13,.12],[.12,2.52,z],'red',.025));
   for(const x of [-1.52,.02,1.54]){
    this.cover(this.box(g,[.13,1.34,.12],[x-.55,1.70,z],'ivory',.020));
    this.cover(this.box(g,[.13,1.34,.12],[x+.55,1.70,z],'ivory',.020));
   }
  }
  for(const x of [-1.52,.02,1.54])this.cover(this.box(g,[1.28,.20,2.66],[x,2.44,0],'ivory',.035));
  const identity=this.group(g,'mk1060-model-band-v230','Model-family red identification band');
  this.cover(this.box(identity,[2.25,.12,.035],[.10,2.28,-1.515],'red',.010));
  const stairs=this.group(g,'mk1060-os-stairs-v230','Operator side access stair');
  for(let i=0;i<4;i++)this.box(stairs,[.66,.10,.72],[-3.48+i*.18,.08+i*.10,-1.82],'steel',.010);
 }
 buildDrive(){const g=this.group(this.root,'mk1060-drive','Drive, electrical and controls',[.10,0,0],[0,.18,.62]);const motor=this.group(g,'mk1060-drive-motor','Main motor and flywheel');this.cyl(motor,.25,.60,[-.65,.45,1.58],'dark','main-motor','x');this.cyl(motor,.43,.18,[.02,.62,1.58],'steel','flywheel');const cab=this.group(g,'mk1060-drive-cabinet','Electric cabinet');this.box(cab,[.82,1.55,.52],[2.72,1.12,1.64],'dark',.05);const control=this.group(g,'mk1060-drive-control','Touchscreen and station controls');this.box(control,[.88,.64,.50],[-2.15,.74,-1.73],'dark',.05);this.box(control,[.52,.34,.025],[-2.23,1.13,-1.88],'glass',.025);for(const x of [-1.92,-1.78,-1.64])this.cyl(control,.035,.03,[x,.91,-1.99],x===-1.64?'red':'gold','button','z');}
 enrichV122(){this.root.userData.researchVersion='V122';this.root.userData.researchSourceCount=V122_SOURCE_STATS.total;this.root.userData.detailPass='V122_MODEL_MANUAL_COMPONENT_LEVEL';
  const tag=(m,role,evidence='MK1060ER_OPERATOR_MANUAL')=>{if(!m)return m;m.userData.detail=true;m.userData.mechanismRole=role;m.userData.evidence=evidence;return m;};

  const torque=this.findNode('mk1060-transport-torque');if(torque){
   tag(this.box(torque,[.10,.12,.08],[-1.57,.69,1.16],'red',.008),'torque-limiter-proximity-switch');
   tag(this.box(torque,[.22,.035,.035],[-1.69,.69,1.16],'steel',.004),'proximity-switch-bracket');
   tag(this.cyl(torque,.055,.18,[-1.98,.64,1.16],'steel','','z'),'torque-limiter-adjuster');
  }
  const chain=this.findNode('mk1060-transport-chain');if(chain){
   for(const z of [-.98,.98]){
    tag(this.box(chain,[4.55,.06,.08],[.15,1.22,z],'dark',.006),'gripper-chain-guide');
    for(const x of [-1.72,1.98]){const t=tag(this.cyl(chain,.105,.10,[x,1.08,z],'steel',''),'chain-tensioner-sprocket');t.userData.tensioner=true;}
   }
  }

  const platen=this.findNode('mk1060-platen-drive');if(platen){
   for(const z of [-.64,.64]){
    tag(this.cyl(platen,.085,.16,[0,.78,z],'steel','','z'),'platen-eccentric-bearing');
    tag(this.box(platen,[.18,.24,.12],[.58,.80,z],'dark',.012),'cutting-force-adjuster');
    tag(this.cyl(platen,.035,.22,[.58,.94,z],'steel','','y'),'cutting-force-adjusting-screw');
   }
   tag(this.cyl(platen,.12,1.42,[0,.44,0],'dark','','z'),'platen-main-drive-shaft');
  }

  const strip=this.findNode('mk1060-stripping');if(strip){
   const mid=this.group(strip,'mk1060-strip-middle-v122','Fixed female stripping board',[0,0,0],[0,.18,.20]);
   tag(this.box(mid,[1.34,.075,1.76],[0,1.49,0],'dark',.008),'female-stripping-board');
   for(const z of [-.58,-.20,.20,.58])tag(this.box(mid,[1.10,.035,.045],[0,1.45,z],'steel',.004),'female-board-support-bar');
   const up=this.findNode('mk1060-strip-upper');if(up){for(const z of [-.55,-.18,.18,.55])tag(this.box(up,[1.08,.035,.05],[0,1.61,z],'rubber',.003),'upper-stripping-rubber');}
   const low=this.findNode('mk1060-strip-lower');if(low){for(let x=-.48;x<=.48;x+=.24)for(const z of [-.55,-.18,.18,.55])tag(this.cyl(low,.018,.13,[x,1.34,z],'gold','upper-strip-pin','z'),'lower-stripping-needle');}
  }

  const blank=this.findNode('mk1060-blanking');if(blank){
   const upper=this.findNode('mk1060-blank-upper'),lower=this.findNode('mk1060-blank-lower'),stack=this.findNode('mk1060-blank-stack');
   if(upper){tag(this.box(upper,[1.18,.055,1.58],[0,1.61,0],'rubber',.004),'upper-carton-separation-rubber');for(const z of [-.48,0,.48])tag(this.box(upper,[.74,.035,.055],[0,1.57,z],'steel',.004),'upper-separation-beam');}
   if(lower){tag(this.box(lower,[1.18,.055,1.58],[0,1.30,0],'dark',.004),'lower-carton-separation-frame');for(const z of [-.50,-.17,.17,.50])tag(this.box(lower,[.96,.025,.05],[0,1.34,z],'steel',.003),'lower-separation-support');}
   if(stack){for(const z of [-.48,.48]){const j=tag(this.box(stack,[.48,.16,.045],[.24,.62,z],'steel',.006),'blank-sorting-jogger');j.userData.blankDelivery=true;}tag(this.box(stack,[.82,.035,1.12],[.24,.58,0],'dark',.004),'complete-blank-delivery-frame');}
  }

  const waste=this.findNode('mk1060-waste');if(waste){
   const sensor=this.group(waste,'mk1060-waste-sensor-v122','Waste / delivery photoelectric monitoring',[0,0,0],[.18,.16,.24]);
   for(const z of [-.52,.52])tag(this.box(sensor,[.07,.08,.055],[.58,.92,z],'blue',.006),'delivery-photocell');
  }

  const drive=this.findNode('mk1060-drive');if(drive){
   const lube=this.group(drive,'mk1060-lubrication-v122','Automatic circulating / intermittent lubrication',[0,0,0],[0,.15,.35]);
   tag(this.box(lube,[.34,.40,.30],[1.65,.38,1.42],'dark',.025),'lubrication-reservoir');
   tag(this.cyl(lube,.075,.18,[1.65,.64,1.42],'steel','','y'),'lubrication-pump');
   tag(this.box(lube,[.26,.16,.12],[1.30,.58,1.42],'steel',.010),'lubrication-distribution-manifold');
   for(const z of [1.28,1.42,1.56])tag(this.cyl(lube,.010,1.35,[.58,.58,z],'steel','button','x'),'lubrication-line-reference','MODEL_MANUAL_TOPOLOGY__ROUTING_VISUAL');
   lube.userData.installedRoutingBoundary='Lubrication classes are model-manual confirmed; exact tube routing and metering-point count are visual references.';
   const driveChain=this.group(drive,'mk1060-drive-chain-v122','Main drive chain / tension reference',[0,0,0],[0,.18,.30]);
   for(const x of [-.15,.45])tag(this.cyl(driveChain,.15,.10,[x,.56,1.48],'steel','','z'),'main-drive-chain-sprocket');
   tag(this.box(driveChain,[.72,.035,.06],[.15,.72,1.48],'black',.004),'main-drive-chain-reference');
   tag(this.cyl(driveChain,.07,.10,[.15,.86,1.48],'steel','','z'),'drive-chain-tensioner');
  }
 }
 findNode(id){return id==='mk1060-root'?this.root:this.nodes.find(n=>n.userData.nodeId===id)||null;}resolvePart(o){for(let p=o;p&&p!==this.root;p=p.parent)if(p.userData?.selectable)return p;return null;}resolveTaxonomyNode(id){return this.taxonomyById.get(id)?.meshRefs.map(ref=>this.findNode(ref)).find(Boolean)||null;}contains(a,b){for(let p=b;p;p=p.parent)if(p===a)return true;return false;}
 highlight(p){for(const m of this.meshes){m.material.emissive?.setHex(p&&this.contains(p,m)?0x17494a:0);m.material.emissiveIntensity=.3;}}highlightMany(ps=[]){for(const m of this.meshes){m.material.emissive?.setHex(ps.some(p=>this.contains(p,m))?0x17494a:0);m.material.emissiveIntensity=.3;}}ghost(on,except=null){this.ghosted=!!on;for(const m of this.meshes){const fade=on&&(!except||!this.contains(except,m)),natural=m.material.userData?.baseOpacity??1;m.material.transparent=fade||natural<1;m.material.opacity=fade?.14:natural;m.material.depthWrite=!fade;}}isolate(p,on=true){for(const n of this.nodes)n.visible=!on||!p||this.contains(p,n)||this.contains(n,p);}showOnly(ps=[],on=true){for(const n of this.nodes)n.visible=!on||!ps.length||ps.some(p=>n===p||this.contains(n,p));}
 setExteriorOpen(on=true){this.exteriorOpen=!!on;let count=0;for(const m of this.meshes)if(m.userData.exteriorCover){m.visible=!on;count++;}this.root.userData.interiorCutawayVisible=!!on;this.root.userData.exteriorHiddenCount=on?count:0;}explode(t,s=null){for(const n of this.nodes)n.position.copy(n.userData.rest);const targets=s?(s.children.filter(c=>c.userData.selectable).length?s.children.filter(c=>c.userData.selectable):[s]):this.parts;for(const n of targets)n.position.addScaledVector(n.userData.explode,THREE.MathUtils.clamp(+t||0,0,1));}setLow(){}reset(){const open=this.exteriorOpen;this.explode(0);this.highlight(null);this.isolate(null,false);this.ghost(false);for(const n of this.nodes)n.quaternion.copy(n.userData.restQuaternion);this.setExteriorOpen(open);}dispose(){for(const g of this.geometries.values())g.dispose();for(const m of this.materials.values())m.dispose();}
}
