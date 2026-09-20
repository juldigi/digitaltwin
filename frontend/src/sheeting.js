import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {SHEETING_TAXONOMY,SHEETING_TAXONOMY_BY_ID} from './data/taxonomy-sheeting.js';

export const SHEETING_VISUAL_REFERENCE=Object.freeze({
  machineId:'BMJ-MCH-0002',
  plantModel:'HSM-CTM7',
  referenceFamily:'LEXUS HSM 56 · 2014 comparison',
  year:2014,
  processDirection:'RIGHT_TO_LEFT',
  inputSide:'RIGHT',
  outputSide:'LEFT',
  evidence:'BMJ database + user-confirmed RIGHT_TO_LEFT orientation + 2014 Lexus HSM 56 BW Papersystems brochure/photo + Indonesian Lexus sheeter process reference',
  dimensions:'SOURCE_GROUNDED_VISUAL_RECONSTRUCTION_NOT_ENGINEERING',
  visualFamily:'HSM56_TEAL_GRAY_FIXED_ROLLSTAND_TRANSPORT_BED_PORTAL_STACKER',
  visualRevision:'V62_HSM56_LED_RECONSTRUCTION'
});

export class SheetingMachineTemplate{
  constructor(){
    this.root=new THREE.Group();
    this.root.name='MACHINE-SHEETING';
    this.root.userData={
      assetId:'BMJ-MCH-0002',machine:'SHEETING LEXUS',model:'HSM-CTM7',referenceFamily:'LEXUS HSM 56 · 2014 comparison',
      processDirection:'RIGHT_TO_LEFT',confidence:'IDENTITY_VERIFIED_FAMILY_REFERENCE',visualRevision:'V62_HSM56_LED_RECONSTRUCTION'
    };
    this.nodes=[];this.parts=[];this.meshes=[];this.geometries=new Map();this.materials=new Map();this.activeMeshes=[];this.detailMeshes=[];
    this.taxonomy=SHEETING_TAXONOMY;this.taxonomyById=SHEETING_TAXONOMY_BY_ID;this.exteriorOpen=false;this.ghosted=false;
    this.palette={body:0x13a38f,bodyDark:0x08746a,light:0xd9ddda,white:0xeeeeea,dark:0x263238,steel:0x8f9898,chrome:0xc3cbcb,paper:0xeee7d4,glass:0x76b6bb,black:0x1f2528,blue:0x356ea8,red:0xc93434};
    this.build();
    for(const n of this.nodes){n.userData.rest=n.position.clone();n.userData.restQuaternion=n.quaternion.clone();}
    this.root.updateMatrixWorld(true);
  }
  group(parent,id,name,pos=[0,0,0],explode=[0,.15,0],confidence='FAMILY_REFERENCE'){
    const g=new THREE.Group();g.name=name;g.position.set(...pos);
    g.userData={assetId:'BMJ-MCH-0002',nodeId:id,selectable:true,confidence,explode:new THREE.Vector3(...explode)};
    parent.add(g);this.nodes.push(g);if(parent===this.root)this.parts.push(g);return g;
  }
  material(kind,owner){
    const key=(owner.userData.nodeId||'root')+':'+kind;
    if(!this.materials.has(key)){
      const glass=kind==='glass';
      this.materials.set(key,new THREE.MeshStandardMaterial({
        color:this.palette[kind]??this.palette.dark,
        metalness:['steel','chrome','dark'].includes(kind)?.42:.08,
        roughness:glass?.18:kind==='chrome'?.28:.55,
        transparent:glass,opacity:glass?.32:1
      }));
    }
    return this.materials.get(key);
  }
  mesh(g,geo,key,kind,pos=[0,0,0],rot=null,{cover=false,detail=false,active=false,motion=null,role=null}={}){
    if(!this.geometries.has(key))this.geometries.set(key,geo());
    const m=new THREE.Mesh(this.geometries.get(key),this.material(kind,g));m.position.set(...pos);if(rot)m.rotation.set(...rot);m.castShadow=kind!=='glass';m.receiveShadow=true;
    m.userData={ownerId:g.userData.nodeId,exteriorCover:cover,detail,motion,role,restPosition:m.position.clone(),restRotation:m.rotation.clone()};
    if(detail)this.detailMeshes.push(m);if(active){m.userData.activeElement=true;this.activeMeshes.push(m);}
    g.add(m);this.meshes.push(m);return m;
  }
  box(g,s,p,kind='body',r=.035,opts={}){return this.mesh(g,()=>r?new RoundedBoxGeometry(...s,2,r):new THREE.BoxGeometry(...s),'box:'+s.join(':')+':'+r,kind,p,null,opts);}
  cyl(g,r,l,p,kind='steel',axis='z',opts={}){const rot=axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:null;return this.mesh(g,()=>new THREE.CylinderGeometry(r,r,l,24),'cyl:'+r+':'+l,kind,p,rot,opts);}
  roller(g,x,y,r=0.1,{span=2.72,kind='chrome',motion='guide-roller',detail=false,active=true,frameZ=1.45}={}){
    const m=this.cyl(g,r,span,[x,y,0],kind,'z',{active,motion,detail,role:'roller'});
    const half=span/2;
    for(const side of [-1,1]){
      const z=side*(half+.055);
      this.box(g,[.22,.24,.11],[x,y,z],'bodyDark',.018,{detail:true,role:'bearing'});
      const supportH=Math.max(.18,y-r-.46);
      if(supportH>.18)this.box(g,[.12,supportH,.12],[x,(y-r-.02)-supportH/2,side*frameZ],'steel',.012,{detail:true,role:'bearing-support'});
    }
    return m;
  }
  build(){
    // V62: HSM56-led visual reconstruction. The official 2014 HSM 56 brochure photo is now
    // the dominant visual family reference (teal/gray fixed rollstand, enclosed knife head,
    // narrow-belt transport and tall portal lift-table stacker). HSM-CTM7 exact architecture
    // remains unresolved; unsupported generic sheeter structures are intentionally omitted.
    const structure=this.group(this.root,'sheeting-structure','Main Structural Rails',[0,0,0],[0,-.22,0]);
    for(const z of [-1.46,1.46])this.box(structure,[16.80,.18,.18],[0,.09,z],'dark',.025,{role:'main-rail'});
    for(const x of [-7.75,-6.45,-5.15,-3.85,-2.55,-1.25,.05,1.35,2.65,3.95,5.25,6.55,7.75]){
      this.box(structure,[.15,.18,3.02],[x,.09,0],'steel',.018,{detail:true,role:'cross-member'});
      for(const z of [-1.48,1.48])this.box(structure,[.22,.10,.24],[x,.05,z],'dark',.014,{detail:true,role:'foot'});
    }

    // 2014 HSM56 brochure shows one fixed roll position supported from both sides.
    // This replaces the visually incorrect tandem-reel interpretation used in V59-V61.
    const rollstand=this.group(this.root,'sheeting-rollstand','Fixed Two-Sided Rollstand Reference',[7.30,0,0],[.72,.40,0]);
    const reel=this.group(rollstand,'sheeting-reel','Paper Reel / Opposed Chuck Assembly',[0,0,0],[.26,.22,0]);
    this.cyl(reel,.72,2.56,[0,1.02,0],'paper','z',{active:true,motion:'reel',role:'reel'});
    for(const side of [-1,1]){
      const z=side*1.36;
      this.cyl(reel,.16,.16,[0,1.02,z],'dark','z',{active:true,motion:'chuck',detail:true,role:'chuck'});
      this.box(rollstand,[1.46,1.28,.28],[0,.64,side*1.58],'light',.035,{cover:true,role:'rollstand-pedestal'});
      this.box(rollstand,[1.34,.18,.36],[0,.18,side*1.58],'body',.025,{role:'rollstand-base'});
      this.box(rollstand,[.22,.78,.24],[.50,.67,side*1.45],'bodyDark',.025,{detail:true,role:'hydraulic-lift'});
      this.box(rollstand,[.22,.78,.24],[-.50,.67,side*1.45],'bodyDark',.025,{detail:true,role:'hydraulic-lift'});
    }
    this.box(rollstand,[1.64,.14,3.34],[0,.08,0],'dark',.025,{role:'rollstand-cross-base'});
    const unwindGuide=this.group(rollstand,'sheeting-unwind-guide','Unwind Take-Off / Guide Bridge',[-1.15,0,0],[.22,.22,0]);
    for(const z of [-1.45,1.45]){
      this.box(unwindGuide,[.18,2.02,.18],[0,1.01,z],'body',.024,{role:'guide-post'});
      this.box(unwindGuide,[1.05,.16,.18],[-.42,1.94,z],'body',.02,{role:'guide-top-rail'});
    }
    this.box(unwindGuide,[.16,.16,3.08],[-.92,1.94,0],'bodyDark',.02,{role:'guide-crossbeam'});
    this.roller(unwindGuide,-.02,1.72,.11,{span:2.72,kind:'chrome',motion:'guide-roller',frameZ:1.45});
    this.roller(unwindGuide,-.62,1.46,.12,{span:2.72,kind:'black',motion:'tension-roller',frameZ:1.45});

    const feed=this.group(this.root,'sheeting-feed','Feed / Tension / EPC Bridge',[4.05,0,0],[.48,.45,0]);
    const feedFrame=this.group(feed,'sheeting-feed-frame','Feed Bridge Frame',[0,0,0],[.12,.12,0]);
    for(const z of [-1.45,1.45]){
      for(const x of [-.92,.92])this.box(feedFrame,[.18,1.92,.18],[x,.96,z],'light',.025,{role:'feed-post'});
      this.box(feedFrame,[2.02,.16,.18],[0,1.84,z],'light',.02,{role:'feed-side-top'});
    }
    this.box(feedFrame,[.18,.16,3.08],[-.92,1.84,0],'body',.02,{role:'feed-crossbeam'});
    const feedRollers=this.group(feed,'sheeting-feed-rollers','Supported Feed / Tension Rollers',[0,0,0],[.08,.10,0]);
    this.roller(feedRollers,.68,1.55,.12,{motion:'guide-roller',kind:'chrome'});
    this.roller(feedRollers,.18,1.30,.13,{motion:'tension-roller',kind:'black'});
    this.roller(feedRollers,-.32,1.48,.11,{motion:'guide-roller',kind:'chrome'});
    this.roller(feedRollers,-.72,1.18,.12,{motion:'pull-roller',kind:'black'});
    const epc=this.group(feed,'sheeting-epc','EPC Edge Sensors / Web Guide',[-1.10,0,0],[.08,.10,0]);
    for(const side of [-1,1]){
      this.box(epc,[.10,.42,.12],[0,.88,side*1.34],'steel',.012,{detail:true,role:'sensor-post'});
      this.box(epc,[.30,.09,.14],[-.12,1.05,side*1.25],'bodyDark',.014,{detail:true,role:'sensor-arm'});
      this.box(epc,[.10,.18,.16],[-.27,1.05,side*1.17],'black',.012,{detail:true,role:'epc-sensor'});
    }

    const cutter=this.group(this.root,'sheeting-cutter','Enclosed Cross-Cut Head',[1.65,0,0],[0,.62,0]);
    for(const z of [-1.52,1.52]){
      this.box(cutter,[2.08,1.90,.30],[0,.95,z],'body',.055,{cover:true,role:'cutter-side-housing'});
      this.box(cutter,[1.72,.26,.10],[.02,1.22,z+(z<0?-.19:.19)],'bodyDark',.025,{cover:true,role:'cutter-side-cap'});
    }
    this.box(cutter,[2.10,.44,3.20],[0,1.86,0],'light',.055,{cover:true,role:'cutter-top-hood'});
    this.box(cutter,[1.38,.42,.035],[-.12,1.76,-1.665],'glass',.022,{cover:true,role:'inspection-window'});
    for(const x of [-.82,.82])for(const z of [-1.34,1.34])this.box(cutter,[.16,.88,.18],[x,.44,z],'steel',.018,{role:'cutter-leg'});

    const knife=this.group(cutter,'sheeting-knife','Cross-Cut Knife / Counterbar',[0,0,0],[0,.34,0]);
    this.box(knife,[.18,.14,2.72],[-.08,1.04,0],'dark',.012,{active:true,motion:'knife-counterbar',role:'counterbar'});
    this.box(knife,[.15,.12,2.60],[.14,1.34,0],'chrome',.010,{active:true,motion:'knife-beam',role:'knife-carriage'});
    this.box(knife,[.07,.18,2.48],[.14,1.22,0],'dark',.006,{active:true,motion:'knife-blade',role:'knife-blade'});
    const transport=this.group(cutter,'sheeting-cutter-transport','Cutter Infeed / Outfeed Rollers',[0,0,0],[0,.15,.16]);
    this.roller(transport,.72,1.04,.11,{motion:'pull-roller',kind:'black'});
    this.roller(transport,.42,.82,.10,{motion:'pull-roller',kind:'chrome'});
    this.roller(transport,-.64,.90,.10,{motion:'accelerator',kind:'black'});

    const delivery=this.group(this.root,'sheeting-delivery','Transport Bed / Overlap / Stacker',[-2.45,0,0],[-.62,.48,0]);
    for(const z of [-1.34,1.34]){
      this.box(delivery,[4.18,.24,.16],[0,.50,z],'bodyDark',.028,{role:'transport-side-rail'});
      for(const x of [-1.82,-.92,0,.92,1.82])this.box(delivery,[.12,.50,.12],[x,.25,z],'steel',.014,{role:'transport-leg'});
    }
    const deliveryRollers=this.group(delivery,'sheeting-delivery-rollers','Transport Bed Rollers',[0,0,0],[0,.08,0]);
    for(const [i,x] of [1.68,.98,.28,-.42,-1.12,-1.72].entries()){
      this.cyl(deliveryRollers,.075,2.52,[x,.84,0],i%2?'chrome':'black','z',{active:true,motion:'delivery-roller',role:'transport-roller'});
      for(const side of [-1,1]){
        this.box(deliveryRollers,[.18,.20,.14],[x,.84,side*1.30],'body',.014,{detail:true,role:'transport-bearing'});
        this.box(deliveryRollers,[.12,.25,.12],[x,.685,side*1.30],'steel',.010,{detail:true,role:'transport-bearing-support'});
      }
    }
    for(const z of [-.60,-.36,-.12,.12,.36,.60])this.box(delivery,[3.64,.025,.055],[-.06,.925,z],'black',.003,{detail:true,role:'transport-belt'});
    const overlap=this.group(delivery,'sheeting-overlap','Adjustment Rods / Overlap Hold-Down',[.15,0,0],[0,.16,0]);
    for(const x of [1.10,.32,-.46]){
      this.cyl(overlap,.038,2.84,[x,1.055,0],'chrome','z',{detail:true,role:'adjustment-rod'});
      for(const side of [-1,1]){
        this.box(overlap,[.16,.22,.12],[x,.99,side*1.42],'body',.012,{detail:true,role:'rod-support'});
        this.cyl(overlap,.065,.08,[x,1.12,side*.98],'black','y',{detail:true,role:'adjustment-knob'});
      }
    }
    for(const x of [-.86,-1.18,-1.50,-1.78])this.cyl(overlap,.060,2.24,[x,1.00,0],'black','z',{active:true,motion:'delivery-roller',detail:true,role:'hold-down-roller'});

    const layboy=this.group(delivery,'sheeting-layboy','Portal Stacker / Flat Lift Table',[-3.85,0,0],[-.38,.34,0]);
    for(const x of [-1.08,1.08])for(const z of [-1.46,1.46])this.box(layboy,[.20,2.34,.20],[x,1.17,z],'body',.032,{role:'stacker-column'});
    for(const z of [-1.46,1.46])this.box(layboy,[2.24,.18,.20],[0,2.25,z],'bodyDark',.024,{role:'stacker-top-side'});
    for(const x of [-1.08,1.08])this.box(layboy,[.20,.18,3.10],[x,2.25,0],'bodyDark',.024,{role:'stacker-top-cross'});
    for(const x of [-.78,.78])for(const z of [-1.32,1.32])this.box(layboy,[.10,.90,.10],[x,.45,z],'steel',.010,{detail:true,role:'lift-guide'});
    this.box(layboy,[1.88,.14,2.52],[0,.48,0],'steel',.018,{active:true,motion:'lift-table',role:'lift-table'});
    this.box(layboy,[1.66,.08,2.20],[0,.59,0],'blue',.010,{active:true,motion:'lift-table',detail:true,role:'pallet'});
    for(const z of [-1.37,1.37])this.box(layboy,[.12,1.96,.12],[-1.12,.98,z],'bodyDark',.022,{cover:true,role:'rear-guard-post'});
    this.box(layboy,[.12,.12,2.86],[-1.12,1.90,0],'bodyDark',.018,{cover:true,role:'rear-guard-top'});
    for(const y of [.42,.70,.98,1.26,1.54,1.82])this.box(layboy,[.035,.035,2.64],[-1.12,y,0],'steel',.004,{detail:true,role:'rear-guard-horizontal'});

    const access=this.group(this.root,'sheeting-access','Operator-Side Service Deck / Steps',[-.55,0,0],[0,.30,-.42]);
    this.box(access,[4.70,.10,.58],[-.15,.34,-1.98],'steel',.014,{detail:true,role:'service-deck'});
    for(const x of [-2.28,-1.20,-.10,.98,2.05])for(const z of [-2.19,-1.78])this.box(access,[.10,.34,.10],[x,.17,z],'steel',.010,{detail:true,role:'deck-leg'});
    for(const x of [-2.15,-.90,.35,1.60])this.box(access,[.34,.10,.18],[x,.34,-1.80],'bodyDark',.010,{detail:true,role:'deck-bridge'});
    for(let i=0;i<3;i++){
      const h=.12+i*.13;
      this.box(access,[.58,h,.56],[-2.34-i*.22,h/2,-1.98],'steel',.010,{detail:true,role:'access-step'});
    }

    const control=this.group(this.root,'sheeting-control','Operator HMI / Electrical Control',[2.35,0,-2.02],[.20,.38,-.30]);
    this.box(control,[.58,1.22,.50],[0,.61,0],'body',.040,{cover:true,role:'hmi-pedestal'});
    this.box(control,[.46,.40,.045],[0,.82,-.258],'glass',.016,{detail:true,role:'hmi-screen'});
    this.cyl(control,.055,.05,[-.16,.43,-.27],'red','z',{detail:true,role:'estop'});
    this.cyl(control,.046,.05,[.04,.43,-.27],'black','z',{detail:true,role:'control-button'});
    this.box(control,[.76,.30,.58],[.72,.15,.02],'bodyDark',.028,{cover:true,role:'electrical-base'});

    this.root.userData.processFlow={
      input:'RIGHT · fixed two-sided rollstand visual reference; exact HSM-CTM7 unwind configuration unresolved',
      process:'RIGHT → LEFT · unwind take-off → tension/EPC → enclosed cross-cut zone → narrow-belt transport / overlap → portal stacker',
      output:'LEFT · flat lift-table layboy / stacker',
      idleWebGeometry:'HIDDEN_TO_AVOID_FALSE_FLOATING_SLABS',
      direction:'RIGHT_TO_LEFT',
      unwindArchitecture:'HSM56_2014_SINGLE_FIXED_POSITION_TWO_SIDED_VISUAL_REFERENCE__HSM_CTM7_EXACT_UNRESOLVED',
      cutterArchitecture:'HSM56_FLAT_BED_FAMILY_REFERENCE__HSM_CTM7_EXACT_UNRESOLVED',
      visualBasis:'OFFICIAL_2014_HSM56_BROCHURE_PHOTOS_PRIORITY_OVER_GENERIC_SHEETER_SILHOUETTES'
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
