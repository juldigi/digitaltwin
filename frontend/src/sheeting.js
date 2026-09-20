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
  evidence:'BMJ database + user-confirmed RIGHT_TO_LEFT orientation + Indonesian Lexus sheeter process reference + Great Wall/Accura visual family + Lexus HSM 56 comparison reference',
  dimensions:'SOURCE_GROUNDED_VISUAL_RECONSTRUCTION_NOT_ENGINEERING',
  visualFamily:'OPEN_FRAME_DOUBLE_SHAFTLESS_UNWIND_COMPACT_CUTTER_LONG_DELIVERY'
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
    // V59 source-grounded reconstruction.
    // The exact HSM-CTM7 OEM drawing is not publicly available. Exterior architecture therefore follows:
    // 1) BMJ verified identity + user-confirmed RIGHT -> LEFT orientation,
    // 2) Indonesian Lexus sheeter references: servo high-speed sheeter, double hydraulic shaftless unwind, auto tension/EPC,
    // 3) Great Wall/Accura open-frame sheeter imagery for visual proportions only.
    // Conflicting HSM 56 flat-bed/fixed-rollstand data is retained as a comparison source, not forced onto HSM-CTM7.
    const L=17.2,W=4.85;
    const structure=this.group(this.root,'sheeting-structure','Main Chassis / Structural Rails',[0,0,0],[0,-.25,0]);
    // Long open chassis rather than the previous monolithic dark floor slab.
    for(const z of [-1.63,1.63])this.box(structure,[L,.20,.18],[0,.16,z],'dark',.025);
    for(const x of [-7.55,-6.15,-4.60,-2.80,-.95,1.05,2.95,4.85,6.55,7.55]){
      this.box(structure,[.16,.32,3.42],[x,.18,0],'steel',.018,{detail:true});
      for(const z of [-1.68,1.68])this.box(structure,[.18,.16,.24],[x,.08,z],'dark',.015,{detail:true});
    }

    // Operator-side catwalk only. Reference imagery does not support a full-width mirrored deck on both sides.
    const access=this.group(this.root,'sheeting-access','Operator Catwalk / Service Access',[-.35,0,0],[0,.38,-.55]);
    this.box(access,[9.10,.10,.82],[-.45,.55,-2.06],'steel',.015,{detail:true});
    this.rail(access,-4.95,4.05,-2.47,1.38);
    // Compact access stair at cutter/delivery transition.
    for(let i=0;i<3;i++)this.box(access,[.76,.12,.52],[-1.05-i*.20,.15+i*.15,-2.05],'steel',.01,{detail:true});

    // DOUBLE HYDRAULIC SHAFTLESS UNWIND FAMILY REFERENCE.
    // Two reel positions are arranged longitudinally; each reel is held by opposed short chucks, not a through-shaft.
    const rollstand=this.group(this.root,'sheeting-rollstand','Double Hydraulic Shaftless Unwind',[6.80,0,0],[.8,.5,0]);
    this.box(rollstand,[2.95,.16,3.52],[0,.18,0],'dark',.025,{detail:true});
    for(const z of [-1.62,1.62]){
      this.box(rollstand,[3.00,.26,.26],[0,.28,z],'bodyDark',.025,{cover:true});
      this.box(rollstand,[.34,1.10,.46],[.90,.72,z],'body',.045,{cover:true});
      this.box(rollstand,[.34,1.10,.46],[-.90,.72,z],'body',.045,{cover:true});
    }
    const reelStations=[
      {x:.88,r:.72,name:'active',paper:'paper'},
      {x:-.88,r:.58,name:'standby',paper:'paper'}
    ];
    for(const station of reelStations){
      this.cyl(rollstand,station.r,2.64,[station.x,1.10,0],station.paper,'z',{active:true,motion:'reel'});
      for(const z of [-1.48,1.48]){
        this.cyl(rollstand,.16,.34,[station.x,1.10,z],'dark','z',{detail:true,active:true,motion:'chuck'});
        // Hydraulic pickup arm / chuck carriage.
        this.box(rollstand,[.16,.72,.20],[station.x,.76,z],'steel',.018,{detail:true});
        this.box(rollstand,[.52,.16,.20],[station.x+(station.x>0?-.18:.18),.49,z],'bodyDark',.018,{detail:true});
      }
    }
    // Local unwind controls seen beside the reel stand on comparable machines.
    this.box(rollstand,[.56,1.02,.54],[1.28,.61,-2.25],'body',.04,{cover:true});
    this.box(rollstand,[.42,.34,.04],[1.28,.82,-2.54],'glass',.012,{detail:true});

    // OPEN FEED / TENSION / EPC BRIDGE.
    const feed=this.group(this.root,'sheeting-feed','Open Feed Bridge / Tension / EPC',[3.62,0,0],[.55,.5,0]);
    for(const z of [-1.54,1.54]){
      this.box(feed,[.18,2.02,.18],[1.28,1.08,z],'white',.025,{detail:true});
      this.box(feed,[.18,1.72,.18],[-1.28,.93,z],'white',.025,{detail:true});
      this.box(feed,[2.74,.18,.18],[0,2.00,z],'white',.02,{detail:true});
    }
    this.box(feed,[2.74,.16,3.22],[0,2.08,0],'white',.025,{detail:true});
    // Sparse, large functional rollers matching the open-frame appearance.
    const bridgeRollers=[
      [.98,1.58,.13,'chrome','guide-roller'],
      [.52,1.34,.12,'steel','tension-roller'],
      [.08,1.63,.12,'chrome','guide-roller'],
      [-.42,1.32,.14,'black','tension-roller'],
      [-.92,1.12,.13,'chrome','feed-roller']
    ];
    for(const [x,y,r,kind,motion] of bridgeRollers)this.cyl(feed,r,2.68,[x,y,0],kind,'z',{active:true,motion});
    // Dancer/tension pair and EPC edge sensors.
    this.cyl(feed,.16,2.58,[.34,.93,0],'chrome','z',{detail:true,active:true,motion:'tension-roller'});
    this.cyl(feed,.16,2.58,[-.16,.82,0],'black','z',{detail:true,active:true,motion:'tension-roller'});
    for(const z of [-.82,.82]){
      this.box(feed,[.08,.18,.10],[-.92,1.28,z],'yellow',.01,{detail:true});
      this.box(feed,[.10,.38,.10],[-.92,1.48,z],'steel',.01,{detail:true});
    }
    this.box(feed,[2.96,.018,1.40],[.02,1.42,0],'paper',.004);

    // COMPACT CUTTER HEAD.
    // Exact HSM-CTM7 knife architecture is unresolved; keep a compact cross-cut module instead of the old oversized flat-bed box.
    const cutter=this.group(this.root,'sheeting-cutter','Compact Cross-Cut Cutter Head',[.42,0,0],[0,.72,0]);
    // Structural legs remain visible during cutaway.
    for(const z of [-1.55,1.55])for(const x of [-.82,.82])this.box(cutter,[.18,1.32,.20],[x,.72,z],'steel',.02,{detail:true});
    // Low teal side housings and top hood, visually closer to the Great Wall/Accura family.
    for(const z of [-1.76,1.76]){
      this.box(cutter,[2.18,1.18,.22],[0,1.30,z],'body',.05,{cover:true});
      this.box(cutter,[1.26,.42,.08],[.18,1.48,z+(z<0?-.13:.13)],'bodyDark',.02,{cover:true});
    }
    this.box(cutter,[2.24,.38,3.54],[0,1.84,0],'body',.055,{cover:true});
    this.box(cutter,[.34,.88,3.36],[1.02,1.18,0],'bodyDark',.04,{cover:true});
    this.box(cutter,[.32,.82,3.36],[-1.03,1.15,0],'white',.04,{cover:true});
    // Small inspection windows on operator-side housing.
    for(const x of [-.48,.24,.74])this.box(cutter,[.42,.26,.035],[x,1.56,-1.89],'glass',.02,{cover:true});

    const knife=this.group(cutter,'sheeting-knife','Cross-Cut Knife Mechanism',[0,0,0],[0,.4,0]);
    // Two compact cutter shafts + blade carrier. Kept confidence-aware because public references conflict on exact knife type.
    this.cyl(knife,.21,2.78,[.18,1.36,0],'dark','z',{active:true,motion:'knife-drive'});
    this.cyl(knife,.18,2.78,[-.18,1.02,0],'chrome','z',{active:true,motion:'knife-drive'});
    this.box(knife,[.12,.10,2.62],[.12,1.47,0],'chrome',.008,{detail:true,active:true,motion:'knife-beam'});
    this.box(knife,[.08,.20,2.52],[-.08,1.15,0],'dark',.008,{detail:true,active:true,motion:'knife-blade'});
    this.box(knife,[1.62,.12,2.92],[-.08,.78,0],'steel',.015,{detail:true});

    const internal=this.group(cutter,'sheeting-cutter-transport','Pull / Accelerator / Knife Outfeed',[0,0,0],[0,.22,.25]);
    for(const [x,y,r,kind,motion] of [
      [.84,.86,.12,'black','pull-roller'],
      [.50,.96,.12,'chrome','pull-roller'],
      [-.52,.88,.11,'black','accelerator'],
      [-.84,.84,.10,'chrome','accelerator']
    ])this.cyl(internal,r,2.90,[x,y,0],kind,'z',{detail:true,active:true,motion});

    // LONG, OPEN DELIVERY / OVERLAP / LAYBOY.
    const delivery=this.group(this.root,'sheeting-delivery','Knife Outfeed / Overlap / Layboy',[-4.05,0,0],[-.72,.55,0]);
    for(const z of [-1.34,1.34])this.box(delivery,[6.12,.22,.16],[0,.38,z],'dark',.025);
    // Lower tape-bed rollers.
    for(let i=0;i<7;i++)this.cyl(delivery,.075,2.52,[2.55-i*.72,.80+(i<3?.06:0),0],i%2?'chrome':'black','z',{active:true,motion:'delivery-roller'});
    // Multiple narrow transport tapes rather than a continuous paper-colored slab.
    for(const z of [-.58,-.29,0,.29,.58])this.box(delivery,[4.85,.025,.065],[.28,.93,z],'black',.004,{detail:true});
    // Upper overlap/shingling belt frame.
    const overlap=this.group(delivery,'sheeting-overlap','Overlap / Shingling Belt Section',[.58,0,0],[0,.20,0]);
    for(const z of [-.68,.68])this.box(overlap,[2.22,.08,.08],[.15,1.26,z],'white',.012,{detail:true});
    for(const x of [-.72,-.12,.48,.92])this.cyl(overlap,.07,1.62,[x,1.18,0],'black','z',{detail:true,active:true,motion:'delivery-roller'});
    for(const z of [-.46,-.15,.15,.46])this.box(overlap,[1.78,.022,.055],[.10,1.11,z],'black',.003,{detail:true});
    // Low removable side guards, not tall solid walls.
    for(const z of [-1.45,1.45])for(const x of [-1.55,.35,1.85])this.box(delivery,[1.48,.42,.08],[x,.62,z],'body',.02,{cover:true});

    const layboy=this.group(delivery,'sheeting-layboy','Flat Lift Table / Jogger / Sheet Pile',[-2.40,0,0],[-.4,.3,0]);
    this.box(layboy,[1.78,.12,2.28],[0,.49,0],'steel',.018,{active:true,motion:'lift-table'});
    this.box(layboy,[1.66,.045,2.10],[0,.565,0],'dark',.008,{detail:true});
    // Four lift guides and overhead jogger frame.
    for(const z of [-1.05,1.05])for(const x of [-.76,.76])this.box(layboy,[.08,1.10,.08],[x,.92,z],'steel',.01,{detail:true});
    for(const z of [-1.12,1.12])this.box(layboy,[1.92,.09,.09],[0,1.48,z],'body',.015,{detail:true});
    this.box(layboy,[.10,.10,2.34],[-.86,1.48,0],'body',.015,{detail:true});
    this.box(layboy,[.10,.10,2.34],[.86,1.48,0],'body',.015,{detail:true});
    // Rear jogger face / safety enclosure.
    this.box(layboy,[.18,1.42,2.54],[-1.04,.88,0],'bodyDark',.035,{cover:true});

    // Compact operator HMI near cutter, plus electrical cabinet kept separate from unwind.
    const control=this.group(this.root,'sheeting-control','HMI / Electrical / Hydraulic Controls',[1.25,0,-2.88],[.25,.45,-.4]);
    this.box(control,[.72,1.12,.60],[0,.70,0],'body',.045,{cover:true});
    this.box(control,[.56,.44,.055],[0,.91,-.33],'glass',.02,{detail:true});
    this.cyl(control,.065,.05,[-.23,.55,-.35],'yellow','z',{detail:true});
    this.cyl(control,.050,.05,[.02,.55,-.35],'black','z',{detail:true});
    this.box(control,[.80,.32,.66],[.86,.28,.03],'bodyDark',.03,{cover:true});

    // Continuous web is explicitly routed only up to the cutter.
    const web=this.group(this.root,'sheeting-web-path','Continuous Web Path Before Cutter',[0,0,0],[0,.18,0]);
    this.box(web,[1.80,.016,1.38],[6.18,1.42,0],'paper',.003);
    this.box(web,[1.52,.016,1.38],[4.62,1.51,0],'paper',.003);
    this.box(web,[1.72,.016,1.38],[3.02,1.43,0],'paper',.003);
    this.box(web,[1.18,.016,1.38],[1.55,1.34,0],'paper',.003);

    this.root.userData.processFlow={
      input:'RIGHT · double hydraulic shaftless unwind reference',
      process:'RIGHT → LEFT · open feed bridge → tension/EPC → compact cross-cut cutter → overlap/tape delivery',
      output:'LEFT · lift-table layboy / jogger / pile',
      direction:'RIGHT_TO_LEFT',
      cutterArchitecture:'EXACT_HSM_CTM7_UNRESOLVED_PUBLIC_SOURCES_CONFLICT'
    };
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
