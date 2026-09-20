import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {SHEETING_TAXONOMY,SHEETING_TAXONOMY_BY_ID} from './data/taxonomy-sheeting.js';

export const SHEETING_VISUAL_REFERENCE=Object.freeze({
  machineId:'BMJ-MCH-0002',
  plantModel:'HSM-CTM7',
  referenceFamily:'LEXUS HSM 56',
  year:2014,
  processDirection:'RIGHT_TO_LEFT',
  inputSide:'RIGHT',
  outputSide:'LEFT',
  evidence:'BMJ database + recovered user-confirmed orientation/silhouette + Lexus HSM 56 family reference',
  dimensions:'VISUAL_RECONSTRUCTION_NOT_ENGINEERING'
});

export class SheetingMachineTemplate{
  constructor(){
    this.root=new THREE.Group();
    this.root.name='MACHINE-SHEETING';
    this.root.userData={assetId:'BMJ-MCH-0002',machine:'SHEETING LEXUS',model:'HSM-CTM7',referenceFamily:'HSM 56',processDirection:'RIGHT_TO_LEFT',confidence:'IDENTITY_VERIFIED_FAMILY_REFERENCE'};
    this.nodes=[];this.parts=[];this.meshes=[];this.geometries=new Map();this.materials=new Map();this.activeMeshes=[];this.detailMeshes=[];
    this.taxonomy=SHEETING_TAXONOMY;this.taxonomyById=SHEETING_TAXONOMY_BY_ID;this.exteriorOpen=false;this.ghosted=false;
    this.palette={body:0x16a596,bodyDark:0x0e6964,white:0xe7e8e3,dark:0x263238,steel:0x8d999c,chrome:0xb9c3c6,paper:0xeee7d4,glass:0x6aa6b2,yellow:0xf0bc2f,black:0x20272b};
    this.build();
    for(const n of this.nodes){n.userData.rest=n.position.clone();n.userData.restQuaternion=n.quaternion.clone();}
    this.root.updateMatrixWorld(true);
  }
  group(parent,id,name,pos=[0,0,0],explode=[0,.15,0]){
    const g=new THREE.Group();g.name=name;g.position.set(...pos);
    g.userData={assetId:'BMJ-MCH-0002',nodeId:id,selectable:true,confidence:'FAMILY_REFERENCE',explode:new THREE.Vector3(...explode)};
    parent.add(g);this.nodes.push(g);if(parent===this.root)this.parts.push(g);return g;
  }
  material(kind,owner){
    const key=(owner.userData.nodeId||'root')+':'+kind;
    if(!this.materials.has(key)){
      const glass=kind==='glass';
      this.materials.set(key,new THREE.MeshStandardMaterial({color:this.palette[kind]??this.palette.dark,metalness:['steel','chrome','dark'].includes(kind)?.42:.08,roughness:glass?.18:kind==='chrome'?.28:.55,transparent:glass,opacity:glass?.32:1}));
    }
    return this.materials.get(key);
  }
  mesh(g,geo,key,kind,pos=[0,0,0],rot=null,{cover=false,detail=false,active=false,motion=null}={}){
    if(!this.geometries.has(key))this.geometries.set(key,geo());
    const m=new THREE.Mesh(this.geometries.get(key),this.material(kind,g));m.position.set(...pos);if(rot)m.rotation.set(...rot);m.castShadow=kind!=='glass';m.receiveShadow=true;
    m.userData={ownerId:g.userData.nodeId,exteriorCover:cover,detail,motion,restPosition:m.position.clone(),restRotation:m.rotation.clone()};
    if(cover)m.userData.exteriorCover=true;if(detail)this.detailMeshes.push(m);if(active){m.userData.activeElement=true;this.activeMeshes.push(m);}
    g.add(m);this.meshes.push(m);return m;
  }
  box(g,s,p,kind='body',r=.035,opts={}){return this.mesh(g,()=>r?new RoundedBoxGeometry(...s,2,r):new THREE.BoxGeometry(...s),'box:'+s.join(':')+':'+r,kind,p,null,opts);}
  cyl(g,r,l,p,kind='steel',axis='z',opts={}){const rot=axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:null;return this.mesh(g,()=>new THREE.CylinderGeometry(r,r,l,20),'cyl:'+r+':'+l,kind,p,rot,opts);}
  rail(g,x0,x1,z,y=.95){this.box(g,[x1-x0,.055,.055],[(x0+x1)/2,y,z],'yellow',.01,{detail:true});for(let x=x0;x<=x1+.01;x+=1.0)this.box(g,[.055,.82,.055],[Math.min(x,x1),y-.38,z],'yellow',.01,{detail:true});}
  build(){
    // Recovered BMJ visual baseline: roll input at RIGHT, finished sheet pile at LEFT.
    const L=15.8,W=4.65;
    const structure=this.group(this.root,'sheeting-structure','Main Frame / Access',[0,0,0],[0,-.25,0]);
    this.box(structure,[L,.22,W],[0,.11,0],'dark',.035);
    for(const x of [-7.3,-5.4,-3.2,-1,1.2,3.4,5.6,7.3])for(const z of [-1.95,1.95])this.box(structure,[.12,.28,.12],[x,.14,z],'steel',.018,{detail:true});
    const access=this.group(this.root,'sheeting-access','Operator Catwalk / Guardrails',[.2,0,0],[0,.38,-.55]);
    this.box(access,[10.6,.09,.78],[-.2,.61,-2.24],'steel',.015,{detail:true});
    this.rail(access,-5.5,4.9,-2.61,1.43);
    this.rail(access,-4.2,4.9,2.26,1.43);

    const rollstand=this.group(this.root,'sheeting-rollstand','Fixed-Position Two-Sided Rollstand',[6.05,0,0],[.8,.5,0]);
    this.box(rollstand,[1.12,.20,3.55],[0,.18,0],'bodyDark',.03,{detail:true});
    for(const z of [-1.56,1.56])this.box(rollstand,[.22,2.72,.34],[0,1.48,z],'body',.035,{cover:true});
    this.box(rollstand,[.30,.26,3.55],[0,2.78,0],'white',.03,{cover:true});
    this.cyl(rollstand,.82,2.62,[0,1.28,0],'paper','z',{active:true,motion:'reel'});
    this.cyl(rollstand,.12,3.12,[0,1.28,0],'chrome','z',{active:true,motion:'reel-shaft'});
    for(const z of [-1.42,1.42]){
      this.cyl(rollstand,.20,.18,[0,1.28,z],'bodyDark','z',{detail:true,active:true,motion:'chuck'});
      this.cyl(rollstand,.31,.34,[0,1.28,z+(z<0?-.25:.25)],'dark','z',{detail:true,active:true,motion:'reel-drive'});
    }
    this.box(rollstand,[.62,.86,.78],[-.18,.64,-1.90],'bodyDark',.035,{cover:true});
    this.box(rollstand,[.50,.56,.62],[.12,.42,1.89],'steel',.025,{detail:true});

    const feed=this.group(this.root,'sheeting-feed','Feed / Tension / EPC',[3.50,0,0],[.55,.5,0]);
    for(const z of [-1.62,1.62])this.box(feed,[.16,2.05,.16],[1.18,1.12,z],'body',.018,{detail:true});
    this.box(feed,[.24,.18,3.48],[1.18,2.08,0],'body',.02,{detail:true});
    this.box(feed,[3.95,.10,2.88],[0,.84,0],'steel',.015);
    // Keep the web train readable: fewer rollers, grouped by function instead of a dense decorative roller field.
    for(let i=0;i<6;i++)this.cyl(feed,.090,2.68,[-1.32+i*.49,.98+(i%2)*.045,0],i%2?'chrome':'steel','z',{active:true,motion:'feed-roller'});
    for(let i=0;i<3;i++)this.cyl(feed,.125,2.58,[-.48+i*.52,.76+(i%2)*.18,0],'chrome','z',{detail:true,active:true,motion:'tension-roller'});
    this.cyl(feed,.155,2.62,[.82,.91,0],'black','z',{detail:true,active:true,motion:'pull-roller'});
    this.cyl(feed,.155,2.62,[1.04,1.08,0],'chrome','z',{detail:true,active:true,motion:'pull-roller'});
    for(const z of [-1.30,1.30])this.box(feed,[.07,.14,.08],[.45,1.13,z],'yellow',.01,{detail:true});
    this.box(feed,[3.60,.018,1.38],[-.05,1.00,0],'paper',.004);

    const cutter=this.group(this.root,'sheeting-cutter','Flat-Bed Knife / Main Cutter Housing',[.05,0,0],[0,.72,0]);
    for(const z of [-2.01,2.01])this.box(cutter,[3.12,2.20,.20],[0,1.40,z],'body',.045,{cover:true});
    this.box(cutter,[.22,2.22,4.08],[1.46,1.40,0],'body',.04,{cover:true});
    this.box(cutter,[.18,1.92,4.08],[-1.50,1.25,0],'bodyDark',.035,{cover:true});
    this.box(cutter,[3.24,.18,4.12],[0,2.48,0],'body',.03,{cover:true});
    for(const z of [-1.08,1.08])this.box(cutter,[.06,.42,.98],[1.60,1.80,z],'glass',.01,{cover:true});
    this.box(cutter,[.08,.10,1.96],[1.60,1.28,0],'black',.01,{cover:true});
    const knife=this.group(cutter,'sheeting-knife','Knife / Counter-Knife Assembly',[0,0,0],[0,.4,0]);
    this.box(knife,[.18,.20,2.48],[.05,1.49,0],'chrome',.015,{active:true,motion:'knife-beam'});
    this.box(knife,[.07,.46,2.30],[.05,1.22,0],'dark',.008,{detail:true,active:true,motion:'knife-blade'});
    this.box(knife,[1.24,.12,2.72],[-.10,.88,0],'steel',.015,{detail:true});
    this.cyl(knife,.16,.64,[.48,1.24,0],'dark','x',{detail:true,active:true,motion:'knife-drive'});
    const internal=this.group(cutter,'sheeting-cutter-transport','Internal Pull / Accelerator Rollers',[0,0,0],[0,.22,.25]);
    for(let i=0;i<8;i++)this.cyl(internal,.105,2.96,[1.02-i*.29,.73+(i%2)*.13,0],i%2?'black':'chrome','z',{detail:true,active:true,motion:'pull-roller'});
    this.cyl(internal,.14,2.90,[-.84,1.12,0],'black','z',{detail:true,active:true,motion:'accelerator'});

    const delivery=this.group(this.root,'sheeting-delivery','Delivery / Layboy / Stacker',[-4.60,0,0],[-.72,.55,0]);
    this.box(delivery,[5.25,.18,2.72],[0,.30,0],'dark',.025);
    // Delivery is a belt/overlap section, not a second forest of rollers.
    for(let i=0;i<7;i++)this.cyl(delivery,.078,2.50,[2.12-i*.66,.78+(i%2)*.035,0],i%2?'chrome':'black','z',{active:true,motion:'delivery-roller'});
    for(const z of [-.54,-.18,.18,.54])this.box(delivery,[4.66,.026,.075],[.06,.895,z],'black',.004,{detail:true});
    for(const z of [-1.23,1.23])this.box(delivery,[5.12,.34,.09],[0,.62,z],'white',.02,{cover:true});
    const layboy=this.group(delivery,'sheeting-layboy','Flat-Plate Lift Table / Sheet Pile',[-1.78,0,0],[-.4,.3,0]);
    this.box(layboy,[1.65,.12,2.20],[0,.52,0],'steel',.018,{active:true,motion:'lift-table'});
    for(const z of [-.95,.95])for(const x of [-.68,.68])this.box(layboy,[.07,.76,.07],[x,.78,z],'steel',.01,{detail:true});
    // Empty skid / receiving plate only. Finished sheets are created by simulation after the cutter.
    this.box(layboy,[1.54,.050,2.06],[0,.595,0],'dark',.010,{detail:true});
    for(const z of [-1.08,1.08])this.box(layboy,[.06,.52,.06],[0,.84,z],'yellow',.01,{detail:true});
    this.box(delivery,[1.14,1.60,.70],[-2.82,.95,-1.56],'bodyDark',.04,{cover:true});

    const control=this.group(this.root,'sheeting-control','Control / Electrical / Hydraulic',[3.98,0,-2.05],[.25,.45,-.4]);
    this.box(control,[1.18,1.58,.74],[0,.90,0],'bodyDark',.045,{cover:true});
    this.box(control,[.88,1.07,.06],[0,.94,-.40],'body',.025,{cover:true});
    this.box(control,[.66,.58,.08],[0,1.40,-.46],'glass',.018,{detail:true});
    this.cyl(control,.07,.05,[-.28,.62,-.47],'yellow','z',{detail:true});
    this.box(control,[.48,.56,.62],[.72,.42,.06],'steel',.025,{detail:true});

    // Continuous stock exists only upstream of the knife. Downstream material is individual sheet stock.
    const web=this.group(this.root,'sheeting-web-path','Continuous Web Path Before Knife',[0,0,0],[0,.18,0]);
    this.box(web,[2.55,.016,1.36],[4.75,1.00,0],'paper',.003);
    this.box(web,[2.85,.016,1.36],[2.02,1.00,0],'paper',.003);
    this.box(web,[1.16,.016,1.36],[.82,1.01,0],'paper',.003);

    this.root.userData.processFlow={input:'RIGHT · paper reel / rollstand',process:'RIGHT → LEFT · feed → tension/EPC → flat-bed knife → delivery',output:'LEFT · layboy / flat-plate lift table / pile',direction:'RIGHT_TO_LEFT'};
  }
  findNode(id){return id==='MACHINE-SHEETING'?this.root:this.nodes.find(n=>n.userData.nodeId===id)||null;}
  resolvePart(o){for(let p=o;p&&p!==this.root;p=p.parent)if(p.userData.selectable)return p;return null;}
  resolveTaxonomyNode(id){let m=this.taxonomyById.get(id);while(m){for(const ref of m.meshRefs||[]){const n=this.findNode(ref);if(n)return n;}m=m.parentId?this.taxonomyById.get(m.parentId):null;}return this.root;}
  contains(a,b){for(let p=b;p;p=p.parent)if(p===a)return true;return false;}
  explode(t,s=null){for(const n of this.nodes)n.position.copy(n.userData.rest);const targets=s?(s.children.filter(c=>c.userData.selectable).length?s.children.filter(c=>c.userData.selectable):[s]):this.parts;for(const n of targets)n.position.addScaledVector(n.userData.explode,THREE.MathUtils.clamp(+t||0,0,1));}
  highlight(p){for(const m of this.meshes){m.material.emissive?.setHex(p&&this.contains(p,m)?0x124f49:0);m.material.emissiveIntensity=.32;}}
  highlightMany(ps=[]){for(const m of this.meshes){m.material.emissive?.setHex(ps.some(p=>this.contains(p,m))?0x124f49:0);m.material.emissiveIntensity=.32;}}
  ghost(on,except=null){this.ghosted=on;for(const m of this.meshes){const fade=on&&(!except||!this.contains(except,m));m.material.transparent=fade||m.userData.exteriorCover||m.material.transparent;m.material.opacity=fade?.14:(m.material.color?.getHex()===this.palette.glass?.32:1);m.material.depthWrite=!fade;}}
  isolate(p,on=true){for(const n of this.nodes)n.visible=!on||!p||this.contains(p,n)||this.contains(n,p);}
  showOnly(ps=[],on=true){for(const n of this.nodes)n.visible=!on||!ps.length||ps.some(p=>n===p||this.contains(n,p));}
  setExteriorOpen(on=true){this.exteriorOpen=!!on;for(const m of this.meshes)if(m.userData.exteriorCover)m.visible=!on;this.root.userData.interiorCutawayVisible=on;}
  setLow(on){for(const m of this.detailMeshes)m.visible=!on;}
  reset(){const open=this.exteriorOpen;this.explode(0);this.highlight(null);this.isolate(null,false);this.ghost(false);for(const n of this.nodes)n.quaternion.copy(n.userData.restQuaternion);for(const m of this.meshes){m.position.copy(m.userData.restPosition);m.rotation.copy(m.userData.restRotation);}if(open)this.setExteriorOpen(true);}
  dispose(){this.geometries.forEach(g=>g.dispose());this.materials.forEach(m=>m.dispose());}
}
