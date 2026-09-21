import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {OFFSET9_MODULE_SEQUENCE,OFFSET9_CENTERS,OFFSET9_SPEC} from './data/dimensions-offset9.js';
import {OFFSET9_TAXONOMY,OFFSET9_TAXONOMY_BY_ID} from './data/taxonomy-offset9.js';
import {OFFSET9_ORIENTATION,OFFSET9_TECHNICAL_SOURCES} from './data/sources-offset9.js';
const V=value=>new THREE.Vector3(...value);

export class Offset9MachineTemplate{
 constructor(){
  this.root=new THREE.Group();this.root.name='Speedmaster SX 52-4+L';
  this.root.userData={assetId:'BMJ-MCH-0006',nodeId:'offset9-root',spec:OFFSET9_SPEC,sources:OFFSET9_TECHNICAL_SOURCES,orientation:OFFSET9_ORIENTATION,taxonomyVersion:'offset9-v1',evidenceGrade:'OFFICIAL_FAMILY_REFERENCE'};
  this.parts=[];this.nodes=[];this.meshes=[];this.geometries=new Map();this.materials=new Map();this.exteriorOpen=false;this.build();
  this.taxonomy=OFFSET9_TAXONOMY;this.taxonomyById=OFFSET9_TAXONOMY_BY_ID;
  for(const node of this.nodes){node.userData.rest=node.position.clone();node.userData.restQuaternion=node.quaternion.clone();}this.root.updateMatrixWorld(true);
 }
 group(parent,id,name,pos=[0,0,0],explode=[0,0,0]){const g=new THREE.Group();g.name=name;g.position.set(...pos);g.userData={assetId:'BMJ-MCH-0006',nodeId:id,selectable:true,confidence:'OFFICIAL_FAMILY_REFERENCE',explode:V(explode)};parent.add(g);this.nodes.push(g);if(parent===this.root)this.parts.push(g);return g;}
 mat(key){if(!this.materials.has(key)){const colors={ivory:0xe7e8e1,light:0xd7dbd8,graphite:0x252e32,black:0x101719,steel:0x89969b,silver:0xc3ccce,rubber:0x22282a,paper:0xf2ebd8,blue:0x257aa8,cyan:0x42b3be,amber:0xd7a338,green:0x668d78,glass:0x79bdd0};this.materials.set(key,new THREE.MeshStandardMaterial({color:colors[key]||0x888888,metalness:['steel','silver'].includes(key)?.62:.12,roughness:key==='paper'?.92:.46,transparent:key==='glass',opacity:key==='glass'?.32:1}));}return this.materials.get(key);}
 mesh(group,geometry,key,material='graphite',pos=[0,0,0],rotation=null){if(!this.geometries.has(key))this.geometries.set(key,geometry());const mesh=new THREE.Mesh(this.geometries.get(key),this.mat(material));mesh.position.set(...pos);if(rotation)mesh.rotation.set(...rotation);mesh.castShadow=material!=='glass';mesh.receiveShadow=true;mesh.userData.ownerId=group.userData.nodeId;group.add(mesh);this.meshes.push(mesh);return mesh;}
 box(g,size,pos,material='graphite',radius=.02){return this.mesh(g,()=>radius?new RoundedBoxGeometry(...size,2,radius):new THREE.BoxGeometry(...size),'b'+size.join('_')+'_'+radius,material,pos);}
 cyl(g,radius,length,pos,material='steel',role=''){const mesh=this.mesh(g,()=>new THREE.CylinderGeometry(radius,radius,length,24),'c'+radius+'_'+length,material,pos,[Math.PI/2,0,0]);mesh.userData.rotor=true;mesh.userData.rollerRole=role;return mesh;}
 cover(mesh){mesh.userData.exteriorCover=true;return mesh;}
 build(){
  const access=this.group(this.root,'offset9-access','Frames, safety guards and access');
  this.box(access,[8.65,.14,2.02],[.38,.34,0],'black');
  for(const z of [-1.11,1.11]){this.box(access,[7.75,.08,.36],[.42,.51,z],'steel');for(let x=-2.8;x<4.4;x+=1.25)this.cyl(access,.018,.44,[x,.82,z],'steel','guard-rail');}
  this.buildFeeder();
  const print=this.group(this.root,'offset9-print','Four offset printing units');
  const coat=this.group(this.root,'offset9-coat','Inline coating unit');
  for(const [index,module] of OFFSET9_MODULE_SEQUENCE.entries())module.type==='print'?this.printUnit(print,module,index):this.coatingUnit(coat,module);
  this.buildDelivery();this.buildConsole();
 }
 buildFeeder(){
  const g=this.group(this.root,'offset9-feeder','Central suction-belt feeder',[-3.82,0,0],[-.8,.18,0]);
  this.cover(this.box(g,[2.05,1.42,1.92],[0,1.16,0],'ivory',.10));this.cover(this.box(g,[.50,.50,1.98],[.78,1.90,0],'graphite',.07));
  const pile=this.group(g,'offset9-feeder-pile','Pile lift and pallet table');this.box(pile,[1.25,.07,1.22],[-.40,.49,0],'steel');this.box(pile,[1.20,.72,1.16],[-.40,.89,0],'paper');
  for(const z of [-.53,.53]){this.cyl(pile,.045,.10,[-.87,.45,z],'black','pile-chain');this.cyl(pile,.045,.10,[.05,.45,z],'black','pile-chain');}
  const head=this.group(g,'offset9-feeder-head','Suction head and sheet separation');this.box(head,[.72,.25,1.18],[.18,1.86,0],'graphite');for(const z of [-.42,-.14,.14,.42]){this.cyl(head,.026,.13,[.37,1.66,z],'rubber','suction-foot');this.box(head,[.035,.22,.035],[.37,1.76,z],'steel');}
  const reg=this.group(g,'offset9-register','Central suction-belt feedboard and register',[1.43,0,0]);this.box(reg,[1.23,.48,1.55],[0,.90,0],'graphite',.05);this.box(reg,[1.19,.025,1.43],[0,1.17,0],'steel');for(const z of [-.38,0,.38])this.cyl(reg,.025,1.02,[0,1.21,z],'rubber','suction-belt-wheel');for(const z of [-.48,.48])this.box(reg,[.10,.08,.10],[.47,1.25,z],'silver');
 }
 sideFrames(g){for(const z of [-.91,.91]){this.cover(this.box(g,[.92,1.49,.12],[0,1.43,z],'ivory',.07));this.cover(this.box(g,[.70,.23,.025],[0,2.10,z+(z<0?-.065:.065)],'graphite'));}this.cover(this.box(g,[.96,.23,1.70],[0,2.21,0],'graphite',.05));}
 printUnit(parent,module,index){
  const id='offset9-'+module.key.toLowerCase(),g=this.group(parent,id,module.label,[OFFSET9_CENTERS[module.key],0,0],[0,.18,(index%2?1:-1)*.24]);g.userData.moduleType='print';g.userData.moduleKey=module.key;this.sideFrames(g);
  const frame=this.group(g,id+'-frame','Paired side frames');for(const z of [-.78,.78])for(const x of [-.35,.35])this.box(frame,[.09,1.46,.09],[x,1.28,z],'steel');
  const train=this.group(g,id+'-cylinders','Offset cylinder train');
  const plate=this.group(train,id+'-plate','Plate cylinder and AutoPlate interface');this.cyl(plate,.178,1.72,[-.12,1.68,0],'steel','plate');this.box(plate,[.20,.09,1.80],[-.31,1.90,0],'blue');
  const blanket=this.group(train,id+'-blanket','Blanket cylinder and wash device');this.cyl(blanket,.194,1.72,[.04,1.31,0],'rubber','blanket');this.box(blanket,[.17,.08,1.78],[.30,1.43,0],'silver');
  const impression=this.group(train,id+'-impression','Impression cylinder and jacket');this.cyl(impression,.215,1.72,[-.08,.88,0],'silver','impression');
  const transfer=this.group(train,id+'-transfer','Transfer cylinder and gripper bridge');this.cyl(transfer,.215,1.72,[.33,.52,0],'graphite','transfer');for(const z of [-.57,-.28,0,.28,.57])this.box(transfer,[.12,.028,.04],[.24,.70,z],'steel');
  const ink=this.group(g,id+'-inking','Speed-compensated inking unit');this.box(ink,[.60,.18,1.47],[-.25,2.34,0],'graphite');for(const [j,x,y] of [[0,-.37,2.08],[1,-.20,2.13],[2,-.02,2.15],[3,.16,2.12],[4,.33,2.05]])this.cyl(ink,.047,1.41,[x,y,0],j%2?'rubber':'steel','ink-transfer');for(const [j,x,y] of [[0,-.22,1.94],[1,-.07,1.99],[2,.09,1.98],[3,.23,1.91]])this.cyl(ink,.052+j*.002,1.42,[x,y,0],'rubber','ink-form-'+(j+1));
  const damp=this.group(g,id+'-dampening','Alcolor continuous dampening');for(const [j,x,y] of [[0,.26,1.74],[1,.39,1.83],[2,.45,1.69],[3,.39,1.54],[4,.27,1.43]])this.cyl(damp,.044+(j>2?.007:0),1.40,[x,y,0],j%2?'rubber':'steel','damp-'+(j+1));this.box(damp,[.34,.07,1.46],[.34,1.34,0],'steel');
 }
 coatingUnit(parent,module){
  const id='offset9-l',g=this.group(parent,id,module.label,[OFFSET9_CENTERS.L,0,0],[.20,.22,0]);g.userData.moduleType='coat';g.userData.moduleKey='L';this.sideFrames(g);
  const supply=this.group(g,id+'-supply','Coating circulation and chamber');this.box(supply,[.48,.19,1.43],[-.27,1.98,0],'green');this.box(supply,[.11,.10,1.50],[-.02,1.88,0],'steel');
  const meter=this.group(g,id+'-meter','Chambered blade and anilox metering');this.cyl(meter,.105,1.43,[.10,1.78,0],'silver','anilox');this.box(meter,[.28,.08,1.48],[-.13,1.90,0],'graphite');
  const form=this.group(g,id+'-form','Coating plate or blanket cylinder');this.cyl(form,.195,1.72,[.04,1.35,0],'rubber','coating-form');
  const impression=this.group(g,id+'-impression','Coating impression cylinder');this.cyl(impression,.215,1.72,[-.08,.91,0],'silver','coating-impression');
 }
 buildDelivery(){
  const g=this.group(this.root,'offset9-delivery','High-pile delivery',[4.72,0,0],[.9,.18,0]);this.cover(this.box(g,[2.78,1.70,2.02],[0,1.27,0],'ivory',.10));this.cover(this.box(g,[2.28,.46,1.96],[-.15,2.10,0],'graphite',.07));
  const chain=this.group(g,'offset9-delivery-chain','Gripper-chain transport');for(const z of [-.72,.72]){this.cyl(chain,.20,.09,[-.96,1.52,z],'steel','chain-sprocket');this.cyl(chain,.20,.09,[.92,1.52,z],'steel','chain-sprocket');this.box(chain,[1.88,.035,.035],[-.02,1.72,z],'black');}for(let x=-.75;x<=.70;x+=.37)this.box(chain,[.06,.035,1.42],[x,1.69,0],'steel');
  const guide=this.group(g,'offset9-delivery-guide','Venturi non-contact sheet guidance');this.box(guide,[1.72,.035,1.44],[-.06,1.12,0],'silver');for(let x=-.68;x<=.68;x+=.34)for(const z of [-.48,0,.48]){const q=this.cyl(guide,.018,.025,[x,1.15,z],'cyan','venturi-nozzle');q.userData.airNozzle=true;}
  const brake=this.group(g,'offset9-delivery-brake','Sheet brake and release');for(const z of [-.47,-.16,.16,.47])this.cyl(brake,.055,.14,[.78,.88,z],'rubber','sheet-brake');
  const stack=this.group(g,'offset9-delivery-stack','Delivery pile lift');this.box(stack,[1.18,.07,1.24],[.67,.46,0],'steel');this.box(stack,[1.14,.48,1.18],[.67,.74,0],'paper');
 }
 buildConsole(){const g=this.group(this.root,'offset9-console','Prinect press console',[1.18,0,-1.83],[0,.15,-.35]);this.box(g,[1.25,.72,.54],[0,.72,0],'graphite',.06);this.box(g,[.76,.42,.025],[-.12,1.18,-.14],'glass',.03);this.box(g,[.55,.05,.36],[.20,1.00,.12],'silver');}
 findNode(id){return id===this.root.userData.nodeId?this.root:this.nodes.find(node=>node.userData.nodeId===id)||null;}
 resolvePart(object){for(let parent=object;parent&&parent!==this.root;parent=parent.parent)if(parent.userData?.selectable)return parent;return null;}
 resolveTaxonomyNode(id){const node=this.taxonomyById.get(id);return node?.meshRefs.map(ref=>this.findNode(ref)).find(Boolean)||null;}
 contains(parent,child){for(let node=child;node;node=node.parent)if(node===parent)return true;return false;}
 highlight(part){for(const mesh of this.meshes){mesh.material.emissive?.setHex(part&&this.contains(part,mesh)?0x17494a:0);mesh.material.emissiveIntensity=.30;}}
 highlightMany(parts=[]){for(const mesh of this.meshes){mesh.material.emissive?.setHex(parts.some(part=>this.contains(part,mesh))?0x17494a:0);mesh.material.emissiveIntensity=.30;}}
 ghost(on,except=null){this.ghosted=!!on;for(const mesh of this.meshes){const fade=on&&(!except||!this.contains(except,mesh));const naturalOpacity=mesh.material.userData?.baseOpacity??(mesh.material.opacity<1?mesh.material.opacity:1);mesh.material.transparent=fade||naturalOpacity<1;mesh.material.opacity=fade?.14:naturalOpacity;mesh.material.depthWrite=!fade;}}
 isolate(part,on=true){for(const node of this.nodes)node.visible=!on||!part||this.contains(part,node)||this.contains(node,part);}
 showOnly(parts=[],on=true){for(const node of this.nodes)node.visible=!on||!parts.length||parts.some(part=>node===part||this.contains(node,part));}
 setExteriorOpen(on){this.exteriorOpen=!!on;let hidden=0;this.root.traverse(object=>{if(object.isMesh&&object.userData.exteriorCover){object.visible=!on;hidden++;}});this.root.userData.interiorCutawayVisible=!!on;this.root.userData.exteriorHiddenCount=on?hidden:0;}
 explode(amount,selection=null){for(const node of this.nodes)node.position.copy(node.userData.rest);const targets=selection?(selection.children.filter(c=>c.userData.selectable).length?selection.children.filter(c=>c.userData.selectable):[selection]):this.parts;for(const node of targets)node.position.addScaledVector(node.userData.explode,THREE.MathUtils.clamp(+amount||0,0,1));}
 reset(){const open=this.exteriorOpen;this.explode(0);this.highlight(null);this.isolate(null,false);this.ghost(false);for(const node of this.nodes)node.quaternion.copy(node.userData.restQuaternion);this.setExteriorOpen(open);}setLow(){}
 dispose(){for(const geometry of this.geometries.values())geometry.dispose();for(const material of this.materials.values())material.dispose();}
}
