import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {OFFSET8_MODULE_SEQUENCE,OFFSET8_CENTERS,OFFSET8_SPEC} from './data/dimensions-offset8.js';
import {OFFSET8_TAXONOMY,OFFSET8_TAXONOMY_BY_ID} from './data/taxonomy-offset8.js';
import {OFFSET8_ORIENTATION,OFFSET8_TECHNICAL_SOURCES} from './data/sources-offset8.js';
import {V123_SOURCE_STATS} from './data/research-v123.js';
const V=a=>new THREE.Vector3(...a);
export class Offset8MachineTemplate{
 constructor(){this.root=new THREE.Group();this.root.name='CX 104-8+LYYL';this.root.userData={assetId:'BMJ-MCH-0005',nodeId:'offset8-root',spec:OFFSET8_SPEC,sources:OFFSET8_TECHNICAL_SOURCES,orientation:OFFSET8_ORIENTATION,taxonomyVersion:'offset8-v1'};this.parts=[];this.nodes=[];this.meshes=[];this.geometries=new Map();this.materials=new Map();this.exteriorOpen=false;this.build();this.enrichV123();this.taxonomy=OFFSET8_TAXONOMY;this.taxonomyById=OFFSET8_TAXONOMY_BY_ID;for(const n of this.nodes){n.userData.rest=n.position.clone();n.userData.restQuaternion=n.quaternion.clone();}this.root.updateMatrixWorld(true);}
 group(parent,id,name,pos=[0,0,0],explode=[0,0,0]){const g=new THREE.Group();g.name=name;g.position.set(...pos);g.userData={assetId:'BMJ-MCH-0005',nodeId:id,selectable:true,confidence:'DOCUMENT_GROUNDED',explode:V(explode)};parent.add(g);this.nodes.push(g);if(parent===this.root)this.parts.push(g);return g;}
 mat(k){if(!this.materials.has(k)){const c={light:0xe8e8e2,graphite:0x273238,black:0x11181c,steel:0x8d999e,silver:0xc0c8ca,rubber:0x20262a,paper:0xf2ecda,blue:0x2874a6,cyan:0x3fb7c5,amber:0xe2a83c,coat:0xb7d7d0,glass:0x73b7c9}[k]||0x888888;this.materials.set(k,new THREE.MeshStandardMaterial({color:c,metalness:['steel','silver'].includes(k)?.6:.15,roughness:k==='paper'?.9:.48,transparent:k==='glass',opacity:k==='glass'?.35:1}));}return this.materials.get(k);}
 mesh(g,geo,key,k='graphite',pos=[0,0,0],rot=null){if(!this.geometries.has(key))this.geometries.set(key,geo());const m=new THREE.Mesh(this.geometries.get(key),this.mat(k));m.position.set(...pos);if(rot)m.rotation.set(...rot);m.castShadow=k!=='glass';m.receiveShadow=true;m.userData.ownerId=g.userData.nodeId;g.add(m);this.meshes.push(m);return m;}
 box(g,s,p,k='graphite',r=.02){return this.mesh(g,()=>r?new RoundedBoxGeometry(...s,2,r):new THREE.BoxGeometry(...s),'b'+s+r,k,p);}
 cyl(g,r,l,p,k='steel',role='',axis='z'){
  const rot=axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:null;
  const m=this.mesh(g,()=>new THREE.CylinderGeometry(r,r,l,20),'c'+r+l+axis,k,p,rot);
  const rotating=/^(plate|blanket|impression|transfer|distributor-\d+|form-\d+|transfer-ink|damp-\d+|feed-wheel|anilox|coating-blanket|coating-impression|chain-sprocket|sheet-brake)$/.test(role);
  m.userData.rollerRole=role;m.userData.rotor=rotating;m.userData.rotorAxis=axis;m.userData.radius=r;m.userData.reciprocator=role==='sucker';
  if(rotating){
   if(/^blanket$/.test(role)||/^transfer$/.test(role)||/^form-/.test(role)||/^transfer-ink$/.test(role)||/^anilox$/.test(role)||/^chain-sprocket$/.test(role))m.userData.spinDirection=-1;
   else m.userData.spinDirection=1;
  }
  return m;
 }
 cover(m){m.userData.exteriorCover=true;return m;}
 build(){const access=this.group(this.root,'offset8-access','Elevated access and paired side frames');this.box(access,[19,.16,3.35],[1.2,.42,0],'black');for(const z of [-1.82,1.82]){this.box(access,[18,.08,.48],[1.2,.62,z],'steel');for(let x=-7;x<10;x+=2)this.cyl(access,.022,.62,[x,1.03,z],'steel','rail','y');}
 this.buildFeeder();const pg=this.group(this.root,'offset8-print','Eight printing units');const fg=this.group(this.root,'offset8-finish','LYYL inline finishing');
 for(const [i,m] of OFFSET8_MODULE_SEQUENCE.entries()){if(m.type==='print')this.printUnit(pg,m,i);else if(m.type==='coat')this.coater(fg,m);else this.dryer(fg,m);}this.buildDelivery();}
 buildFeeder(){const g=this.group(this.root,'offset8-feeder','Preset Plus feeder',[-6.95,0,0],[-1,.2,0]);
 // Preset Plus feeder is an open process frame with side cladding, not a solid cuboid.
 for(const z of [-1.37,1.37])this.cover(this.box(g,[2.30,1.78,.16],[0,1.48,z],'light',.075));
 this.cover(this.box(g,[2.30,.28,2.90],[0,2.26,0],'graphite',.055));
 for(const z of [-1.37,1.37])this.cover(this.box(g,[.24,.34,.18],[-1.02,.73,z],'graphite',.035));
 const pile=this.group(g,'offset8-feeder-pile','Pile lift');this.box(pile,[1.35,.08,1.78],[-.62,.61,0],'steel');this.box(pile,[1.30,1.02,1.72],[-.62,1.16,0],'paper');
 const head=this.group(g,'offset8-feeder-head','Suction head');this.box(head,[.74,.30,1.65],[.28,2.34,0],'graphite');for(const z of [-.58,-.2,.2,.58]){this.cyl(head,.032,.18,[.45,2.13,z],'rubber','sucker','y');this.box(head,[.04,.26,.04],[.45,2.23,z],'steel');}
 const reg=this.group(g,'offset8-register','Stream feeder and register',[1.55,0,0]);this.box(reg,[1.45,.56,2.42],[0,1.03,0],'graphite',.05);this.box(reg,[1.4,.035,2.2],[0,1.34,0],'steel');for(const z of [-.62,0,.62])this.cyl(reg,.028,1.24,[0,1.40,z],'rubber','feed-wheel');for(const z of [-.73,.73])this.box(reg,[.12,.10,.12],[.58,1.43,z],'silver');}
 side(g){
 for(const z of [-1.38,1.26]){
  this.cover(this.box(g,[.94,1.78,.13],[0,1.70,z],'light',.07));
  this.cover(this.box(g,[.72,.25,.02],[0,2.42,z+(z<0?-.07:.07)],'graphite'));
 }
 // Dark lower plinth and operator-side vertical trim establish the real CX104 modular rhythm.
 this.cover(this.box(g,[.98,.44,2.58],[0,.66,0],'graphite',.045));
 this.cover(this.box(g,[.075,1.52,.028],[-.31,1.78,-1.462],'black',.008));
 this.cover(this.box(g,[.98,.25,2.58],[0,2.56,0],'graphite',.05));
}
 printUnit(parent,m,index){const id='offset8-'+m.key.toLowerCase(),g=this.group(parent,id,m.label,[OFFSET8_CENTERS[m.key],0,0],[0,.2,(index%2?1:-1)*.3]);g.userData.moduleType='print';g.userData.moduleKey=m.key;this.side(g);const frame=this.group(g,id+'-frame','Paired side frames');for(const z of [-1.18,1.18])for(const x of [-.38,.38])this.box(frame,[.10,1.75,.10],[x,1.53,z],'steel');
 const ct=this.group(g,id+'-cylinders','Offset cylinder train');for(const [n,r,x,y,k] of [['plate',.20,-.12,1.92,'steel'],['blanket',.22,.05,1.51,'rubber'],['impression',.27,-.10,1.02,'steel'],['transfer',.27,.34,.58,'graphite']]){const q=this.group(ct,id+'-'+n,n+' cylinder');this.cyl(q,r,2.55,[x,y,0],k,n);}
 const ink=this.group(g,id+'-inking','Inking roller train · visualization reference');ink.userData.exactRollerCountVerified=false;this.box(ink,[.62,.20,2.14],[-.25,2.75,0],'graphite');for(const [j,p] of [[0,[-.31,2.34]],[1,[-.10,2.43]],[2,[.12,2.43]],[3,[.33,2.33]]])this.cyl(ink,.063,2.06,[...p,0],j%2?'steel':'silver','distributor-'+(j+1));for(const [j,p] of [[0,[-.24,2.15]],[1,[-.08,2.22]],[2,[.10,2.22]],[3,[.25,2.14]]])this.cyl(ink,.058+j*.003,2.06,[...p,0],'rubber','form-'+(j+1));for(const [j,p] of [[0,[-.42,2.52]],[1,[-.22,2.57]],[2,[0,2.58]],[3,[.22,2.56]],[4,[.41,2.49]]])this.cyl(ink,.048,2.04,[...p,0],j%2?'rubber':'steel','transfer-ink');
 const damp=this.group(g,id+'-dampening','Alcolor dampening · visualization reference');damp.userData.exactRollerCountVerified=false;for(const [j,p] of [[0,[.28,1.95]],[1,[.41,2.05]],[2,[.47,1.88]],[3,[.43,1.70]],[4,[.34,1.55]]])this.cyl(damp,.052+(j>2?.01:0),2.02,[...p,0],j%2?'rubber':'steel','damp-'+(j+1));this.box(damp,[.38,.08,2.08],[.34,1.44,0],'steel');
 const sheet=this.group(g,id+'-sheet','Gripper transfer and AirTransfer Venturi guidance');for(const z of [-.82,-.41,0,.41,.82])this.box(sheet,[.13,.035,.055],[.25,.79,z],'steel');this.cyl(sheet,.018,2.06,[.38,.88,0],'silver','air-bar');const venturi=this.group(sheet,id+'-venturi','Venturi nozzle reference');for(const z of [-.82,-.55,-.27,0,.27,.55,.82]){const n=this.box(venturi,[.12,.022,.08],[.08,.91,z],'silver',.008);n.userData.airTransferNozzle=true;}}
 coater(parent,m){const id='offset8-'+m.key.toLowerCase(),g=this.group(parent,id,m.label,[OFFSET8_CENTERS[m.key],0,0],[.2,.25,0]);g.userData.moduleType='coat';g.userData.moduleKey=m.key;this.side(g);
 const chamber=this.group(g,id+'-chamber','Pressurized chamber doctor blade');this.box(chamber,[.50,.20,2.10],[-.28,2.27,0],'coat');this.box(chamber,[.12,.12,2.18],[-.02,2.15,0],'steel');
 const an=this.group(g,id+'-anilox','Exchangeable anilox metering roller');this.cyl(an,.13,2.10,[.08,2.05,0],'silver','anilox');
 const drip=this.group(g,id+'-drip','Coating drip tray and level sensing');this.box(drip,[.50,.07,2.20],[-.02,1.88,0],'coat',.018);for(const z of [-.83,.83]){const s=this.cyl(drip,.018,.08,[.19,1.96,z],'steel','level-sensor','y');s.userData.levelSensor=true;}
 const supply=this.group(g,id+'-supply','Coating supply interface reference');this.box(supply,[.24,.28,.34],[-.36,1.88,1.02],'graphite',.025);this.cyl(supply,.025,.42,[-.25,2.02,.90],'steel','coat-line','z');
 const apply=this.group(g,id+'-apply','Coating blanket and impression');this.cyl(apply,.23,2.55,[.05,1.57,0],'rubber','coating-blanket');this.cyl(apply,.27,2.55,[-.08,1.08,0],'steel','coating-impression');}
 dryer(parent,m){const id='offset8-'+m.key.toLowerCase(),g=this.group(parent,id,m.label,[OFFSET8_CENTERS[m.key],0,0],[.2,.5,0]);g.userData.moduleType='dryer';g.userData.moduleKey=m.key;g.userData.energyTechnologyVerified=false;this.cover(this.box(g,[1.02,1.94,2.72],[0,1.58,0],'graphite',.08));
 const air=this.group(g,id+'-air','Dryer process cassette bank');for(const z of [-.70,0,.70]){const q=this.box(air,[.58,.14,.48],[0,1.88,z],'amber');q.userData.dryerEmitter=true;q.userData.energyType='UNASSERTED';q.material=q.material.clone();}
 const guide=this.group(g,id+'-guide','Sheet guide and process clearance');this.box(guide,[.92,.04,2.16],[0,1.03,0],'silver');
 const recirc=this.group(g,id+'-recirc','Recirculated-air plenum reference');for(const z of [-1.12,1.12])this.box(recirc,[.18,.98,.16],[.31,1.70,z],'steel',.025);this.box(recirc,[.52,.14,2.32],[.30,2.08,0],'steel',.025);
 const ex=this.group(g,id+'-exhaust','Extraction manifold');this.cyl(ex,.12,2.12,[.2,2.30,0],'steel','exhaust');}
 buildDelivery(){const g=this.group(this.root,'offset8-delivery','Preset Plus extended delivery',[11.2,0,0],[1,.2,0]);
 // Delivery envelope follows the portal/canopy architecture visible on Preset Plus deliveries.
 for(const z of [-1.39,1.39])this.cover(this.box(g,[3.70,2.10,.17],[0,1.60,z],'light',.08));
 this.cover(this.box(g,[3.70,.30,2.95],[0,2.53,0],'graphite',.06));
 for(const x of [-1.72,1.72])for(const z of [-1.39,1.39])this.cover(this.box(g,[.18,1.72,.20],[x,1.38,z],'graphite',.035));
 const chain=this.group(g,'offset8-delivery-chain','Gripper-chain delivery');for(const z of [-1.02,1.02]){this.cyl(chain,.24,.10,[-1.35,1.72,z],'steel','chain-sprocket');this.cyl(chain,.24,.10,[1.28,1.72,z],'steel','chain-sprocket');this.box(chain,[2.63,.045,.045],[0,1.94,z],'black');}
 const grippers=this.group(g,'offset8-delivery-grippers','Delivery gripper bars · loop reference');for(let i=0;i<8;i++){const bar=this.group(grippers,'offset8-delivery-gripper-'+(i+1),'Delivery gripper bar '+(i+1),[-1.35+i*(2.63/7),1.72,0]);bar.userData.deliveryGripperBar=true;bar.userData.barPhase=i/8;this.box(bar,[.045,.045,2.10],[0,0,0],'steel',.008);for(const z of [-.84,-.56,-.28,0,.28,.56,.84])this.box(bar,[.06,.045,.035],[.025,-.04,z],'dark',.004);}
 const brake=this.group(g,'offset8-delivery-brake','Dynamic sheet brake');const brakeBed=this.box(brake,[.56,.055,1.92],[1.03,1.13,0],'graphite',.018);brakeBed.userData.dynamicBrakeBed=true;for(const z of [-.68,-.23,.23,.68])this.cyl(brake,.065,.18,[1.03,1.22,z],'rubber','sheet-brake');
 const stack=this.group(g,'offset8-delivery-stack','Delivery pile');this.box(stack,[1.34,.08,1.78],[.82,.61,0],'steel');this.box(stack,[1.30,.65,1.72],[.82,.96,0],'paper');}
 enrichV123(){this.root.userData.researchVersion='V123';this.root.userData.researchSourceCount=V123_SOURCE_STATS.total;this.root.userData.detailPass='V123_CX104_LYYL_OEM_PROCESS_DETAIL';
 const tag=(m,role,evidence='HEIDELBERG_CX104_OEM')=>{if(m){m.userData.mechanismRole=role;m.userData.evidence=evidence;m.userData.detail=true;}return m;};
 for(const key of ['L1','L2']){const id='offset8-'+key.toLowerCase(),ch=this.findNode(id+'-chamber'),an=this.findNode(id+'-anilox'),drip=this.findNode(id+'-drip');
  if(ch){tag(this.box(ch,[.42,.016,1.98],[-.28,2.36,0],'steel',.003),'doctor-blade-metering-edge');tag(this.box(ch,[.42,.016,1.98],[-.28,2.18,0],'steel',.003),'doctor-blade-sealing-edge');ch.userData.oemArchitecture='CHAMBER_DOCTOR_BLADE';}
  if(an)for(const z of [-1.10,1.10])tag(this.box(an,[.16,.16,.10],[.08,2.05,z],'graphite',.010),'compact-anilox-bearing-unit');
  if(drip){drip.userData.oemFunction='DRIP_TRAY_LEVEL_SENSING';for(const z of [-.83,.83]){const s=drip.children.find(o=>o.isMesh&&o.userData.levelSensor&&Math.sign(o.position.z)===Math.sign(z));if(s)tag(s,'coating-level-sensor');}}
 }
 for(let i=1;i<=8;i++){const air=this.findNode('offset8-pu'+i+'-sheet');if(air){air.userData.oemFunction='AIRTRANSFER_CONTACT_FREE_SHEET_GUIDANCE';const vent=this.findNode('offset8-pu'+i+'-venturi');if(vent)for(const m of vent.children.filter(o=>o.isMesh)){m.userData.mechanismRole='airtransfer-venturi-nozzle';m.userData.evidence='HEIDELBERG_CX104_OEM';}}}
 const brake=this.findNode('offset8-delivery-brake');if(brake){brake.userData.oemFunction='PRESETTABLE_DYNAMIC_SHEET_BRAKE';for(const z of [-.82,0,.82])tag(this.box(brake,[.30,.022,.07],[.82,1.10,z],'black',.004),'sheet-brake-belt-reference');for(const z of [-.90,.90])tag(this.box(brake,[.07,.14,.07],[1.26,1.12,z],'blue',.006),'sheet-brake-position-sensor');}
 const stack=this.findNode('offset8-delivery-stack');if(stack)for(const z of [-.72,.72])tag(this.box(stack,[.055,.16,.055],[1.48,1.04,z],'blue',.006),'delivery-pile-height-sensor');
 }
 findNode(id){return this.nodes.find(n=>n.userData.nodeId===id)||null;} resolvePart(o){for(let p=o;p&&p!==this.root;p=p.parent)if(p.userData?.selectable)return p;return null;}resolveTaxonomyNode(id){const n=this.taxonomyById.get(id);return n?.meshRefs.map(r=>this.findNode(r)).find(Boolean)||null;}
 setExteriorOpen(on){this.exteriorOpen=!!on;let n=0;this.root.traverse(o=>{if(o.isMesh&&o.userData.exteriorCover){o.visible=!on;n++;}});this.root.userData.interiorCutawayVisible=!!on;this.root.userData.exteriorHiddenCount=on?n:0;}
 explode(on){for(const n of this.parts)n.position.copy(n.userData.rest).add(on?n.userData.explode:new THREE.Vector3());} reset(){this.explode(false);this.setExteriorOpen(false);} setLow(){} dispose(){for(const g of this.geometries.values())g.dispose();for(const m of this.materials.values())m.dispose();}
}