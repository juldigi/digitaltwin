import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {SHEETING_TAXONOMY,SHEETING_TAXONOMY_BY_ID} from './data/taxonomy-sheeting.js';

export const SHEETING_VISUAL_REFERENCE=Object.freeze({
  machineId:'BMJ-MCH-0002',
  plantModel:'HSM-CTM7',
  referenceFamily:'LEXUS HSM 52/56/65 family · HSM 56 2014 visual anchor',
  year:2014,
  processDirection:'RIGHT_TO_LEFT',
  inputSide:'RIGHT',
  outputSide:'LEFT',
  evidence:'BMJ database + user-confirmed RIGHT_TO_LEFT orientation + BW Papersystems HSM 56 2014 brochure photos/specification + Mega Machinery HSM family listing + Indonesian Lexus process reference',
  dimensions:'PHOTO_ANCHORED_RECONSTRUCTION_NOT_ENGINEERING',
  visualFamily:'HSM56_TEAL_GRAY_REEL_WEB_TOWER_WINDOWED_MAIN_HEAD_BELT_OUTFEED_LIFT_STACKER',
  visualRevision:'V63_BWPHOTO_ANCHOR_RECONSTRUCTION'
});

export class SheetingMachineTemplate{
  constructor(){
    this.root=new THREE.Group();
    this.root.name='MACHINE-SHEETING';
    this.root.userData={
      assetId:'BMJ-MCH-0002',machine:'SHEETING LEXUS',model:'HSM-CTM7',
      referenceFamily:'LEXUS HSM 52/56/65 family · HSM 56 2014 visual anchor',
      processDirection:'RIGHT_TO_LEFT',confidence:'IDENTITY_VERIFIED__GEOMETRY_FAMILY_PHOTO_ANCHORED',
      visualRevision:'V63_BWPHOTO_ANCHOR_RECONSTRUCTION'
    };
    this.nodes=[];this.parts=[];this.meshes=[];this.geometries=new Map();this.materials=new Map();this.activeMeshes=[];this.detailMeshes=[];
    this.taxonomy=SHEETING_TAXONOMY;this.taxonomyById=SHEETING_TAXONOMY_BY_ID;this.exteriorOpen=false;this.ghosted=false;
    this.palette={body:0x17a48f,bodyDark:0x08786c,light:0xd7dad7,white:0xf0f1ec,dark:0x263238,steel:0x8e9798,chrome:0xc8cece,paper:0xe8ddc7,glass:0x80bbc0,black:0x1f2528,blue:0x2f67a1,red:0xc93434,green:0x4c9b4f};
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
        roughness:glass?.16:kind==='chrome'?.24:.55,
        transparent:glass,opacity:glass?.28:1
      }));
    }
    return this.materials.get(key);
  }
  mesh(g,geo,key,kind,pos=[0,0,0],rot=null,{cover=false,detail=false,active=false,motion=null,role=null,sourceAnchor=null}={}){
    if(!this.geometries.has(key))this.geometries.set(key,geo());
    const m=new THREE.Mesh(this.geometries.get(key),this.material(kind,g));m.position.set(...pos);if(rot)m.rotation.set(...rot);m.castShadow=kind!=='glass';m.receiveShadow=true;
    m.userData={ownerId:g.userData.nodeId,exteriorCover:cover,detail,motion,role,sourceAnchor,restPosition:m.position.clone(),restRotation:m.rotation.clone()};
    if(detail)this.detailMeshes.push(m);if(active){m.userData.activeElement=true;this.activeMeshes.push(m);}
    g.add(m);this.meshes.push(m);return m;
  }
  box(g,s,p,kind='body',r=.035,opts={},rot=null){return this.mesh(g,()=>r?new RoundedBoxGeometry(...s,2,r):new THREE.BoxGeometry(...s),'box:'+s.join(':')+':'+r,kind,p,rot,opts);}
  cyl(g,r,l,p,kind='steel',axis='z',opts={}){const rot=axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:null;return this.mesh(g,()=>new THREE.CylinderGeometry(r,r,l,28),'cyl:'+r+':'+l,kind,p,rot,opts);}
  torus(g,r,t,p,kind='bodyDark',opts={}){return this.mesh(g,()=>new THREE.TorusGeometry(r,t,10,28),'torus:'+r+':'+t,kind,p,null,opts);}
  roller(g,x,y,r=.1,{span=2.64,kind='chrome',motion='guide-roller',detail=false,active=true,bearings=true,supportBase=.48}={}){
    const m=this.cyl(g,r,span,[x,y,0],kind,'z',{active,motion,detail,role:'roller'});
    if(bearings){
      const half=span/2;
      for(const side of [-1,1]){
        const z=side*(half+.055);
        this.box(g,[.20,.22,.11],[x,y,z],'bodyDark',.016,{detail:true,role:'bearing'});
        const h=Math.max(.16,y-r-supportBase);
        if(h>.16)this.box(g,[.11,h,.11],[x,supportBase+h/2,side*(half+.05)],'steel',.010,{detail:true,role:'bearing-support'});
      }
    }
    return m;
  }
  build(){
    // V63 is driven by visible anchors in the BW Papersystems 2014 HSM 56 brochure:
    // 1) one low fixed-position roll with opposed side support,
    // 2) web rising into a tall guide/tension frame,
    // 3) a large gray/teal main head with a panoramic window and large transverse cylinders,
    // 4) a long narrow-belt outfeed with transverse adjustment rods/collars,
    // 5) an enclosed/tower-like flat lift-table stacker,
    // 6) a compact low operator console, not a detached tall HMI pedestal.
    // Exact HSM-CTM7 mechanism identity remains unresolved where sources conflict.

    const structure=this.group(this.root,'sheeting-structure','Grounded Main Chassis',[0,0,0],[0,-.22,0]);
    for(const z of [-1.46,1.46])this.box(structure,[16.20,.18,.18],[.20,.09,z],'dark',.022,{role:'main-rail'});
    for(const x of [-6.85,-5.60,-4.35,-3.10,-1.85,-.60,.65,1.90,3.15,4.40,5.65,6.90,8.05]){
      this.box(structure,[.14,.16,2.98],[x,.08,0],'steel',.014,{detail:true,role:'cross-member'});
      for(const z of [-1.48,1.48])this.box(structure,[.20,.08,.22],[x,.04,z],'dark',.012,{detail:true,role:'foot'});
    }

    const rollstand=this.group(this.root,'sheeting-rollstand','HSM Fixed Rollstand Visual Anchor',[7.25,0,0],[.72,.36,0]);
    const reel=this.group(rollstand,'sheeting-reel','Paper Reel / Opposed Chuck',[0,0,0],[.24,.20,0]);
    this.cyl(reel,.76,2.58,[-.10,.86,0],'paper','z',{active:true,motion:'reel',role:'reel',sourceAnchor:'BW-HSM56-ROLLSTAND-PHOTO'});
    for(const side of [-1,1]){
      const z=side*1.36;
      this.cyl(reel,.15,.18,[-.10,.86,z],'bodyDark','z',{active:true,motion:'chuck',detail:true,role:'chuck'});
      this.box(rollstand,[1.82,.24,.25],[.54,.64,side*1.43],'light',.025,{role:'swing-arm',sourceAnchor:'BW-HSM56-ROLLSTAND-PHOTO'},[0,0,.08]);
      this.box(rollstand,[.34,1.02,.30],[1.18,.57,side*1.43],'body',.034,{role:'rollstand-upright',sourceAnchor:'BW-HSM56-ROLLSTAND-PHOTO'});
      this.box(rollstand,[1.40,.20,.38],[.56,.12,side*1.43],'bodyDark',.024,{role:'rollstand-foot'});
      this.cyl(rollstand,.09,.64,[.92,.47,side*1.43],'steel','y',{detail:true,role:'hydraulic-reference'});
    }
    this.box(rollstand,[1.95,.13,3.04],[.48,.07,0],'dark',.020,{role:'rollstand-floor-tie'});

    const feed=this.group(this.root,'sheeting-feed','Raised Web Guide / Tension Frame',[5.18,0,0],[.44,.42,0]);
    const feedFrame=this.group(feed,'sheeting-feed-frame','Tall Web Guide Frame',[0,0,0],[.10,.12,0]);
    for(const z of [-1.42,1.42]){
      for(const x of [-.84,.84])this.box(feedFrame,[.17,2.30,.18],[x,1.15,z],'body',.025,{role:'feed-post',sourceAnchor:'BW-HSM56-ROLLSTAND-PHOTO'});
      this.box(feedFrame,[1.86,.17,.18],[0,2.26,z],'bodyDark',.020,{role:'feed-top-side'});
    }
    this.box(feedFrame,[.18,.17,3.00],[-.84,2.26,0],'light',.020,{role:'feed-top-cross'});
    const feedRollers=this.group(feed,'sheeting-feed-rollers','Visible Guide / Tension Roller Path',[0,0,0],[.06,.10,0]);
    this.roller(feedRollers,.56,1.48,.11,{motion:'guide-roller',kind:'chrome',supportBase:.48});
    this.roller(feedRollers,.18,1.82,.12,{motion:'tension-roller',kind:'black',supportBase:.48});
    this.roller(feedRollers,-.24,1.54,.11,{motion:'guide-roller',kind:'chrome',supportBase:.48});
    this.roller(feedRollers,-.58,1.95,.10,{motion:'guide-roller',kind:'chrome',supportBase:.48});
    const epc=this.group(feed,'sheeting-epc','EPC / Web Guide Reference',[-1.10,0,0],[.06,.08,0]);
    for(const side of [-1,1]){
      this.box(epc,[.09,.34,.11],[0,1.12,side*1.27],'steel',.010,{detail:true,role:'sensor-post'});
      this.box(epc,[.26,.08,.12],[-.11,1.25,side*1.21],'bodyDark',.010,{detail:true,role:'sensor-arm'});
      this.box(epc,[.09,.15,.14],[-.25,1.25,side*1.14],'black',.010,{detail:true,role:'epc-sensor'});
    }

    const head=this.group(this.root,'sheeting-cutter','Windowed Main Sheeting Head',[2.45,0,0],[0,.58,0]);
    // Base / side shells.
    for(const z of [-1.50,1.50]){
      this.box(head,[2.55,1.72,.28],[0,.92,z],'body',.050,{cover:true,role:'main-side-shell',sourceAnchor:'BW-HSM56-MAIN-HEAD-PHOTO'});
      this.box(head,[2.22,.24,.11],[-.04,.45,z+(z<0?-.18:.18)],'bodyDark',.020,{cover:true,role:'side-lower-trim'});
    }
    this.box(head,[2.62,.40,3.16],[0,1.94,0],'light',.050,{cover:true,role:'main-top-hood',sourceAnchor:'BW-HSM56-MAIN-HEAD-PHOTO'});
    this.box(head,[2.28,.72,.045],[-.02,1.60,-1.655],'glass',.020,{cover:true,role:'panoramic-window',sourceAnchor:'BW-HSM56-MAIN-HEAD-PHOTO'});
    // Window frame visible in the brochure.
    for(const x of [-1.12,1.08])this.box(head,[.09,.78,.08],[x,1.60,-1.69],'light',.010,{cover:true,role:'window-frame'});
    for(const y of [1.23,1.97])this.box(head,[2.28,.08,.08],[-.02,y,-1.69],'light',.010,{cover:true,role:'window-frame'});

    const process=this.group(head,'sheeting-main-rollers','Large Cylindrical Process Elements Behind Window',[0,0,0],[0,.22,0]);
    const large=this.cyl(process,.38,2.48,[.25,1.60,0],'body','z',{active:true,motion:'process-roller',role:'window-process-cylinder',sourceAnchor:'BW-HSM56-MAIN-HEAD-PHOTO'});
    for(const z of [-.90,-.30,.30,.90])this.torus(process,.385,.030,[.25,1.60,z],'bodyDark',{detail:true,active:true,motion:'process-roller-ring',role:'process-cylinder-ring'});
    this.cyl(process,.24,2.46,[-.54,1.48,0],'dark','z',{active:true,motion:'process-roller',role:'window-process-cylinder-dark',sourceAnchor:'BW-HSM56-MAIN-HEAD-PHOTO'});
    this.cyl(process,.11,2.52,[.84,1.10,0],'chrome','z',{active:true,motion:'pull-roller',role:'head-outfeed-roller'});
    this.cyl(process,.10,2.52,[-.88,1.02,0],'black','z',{active:true,motion:'pull-roller',role:'head-infeed-roller'});
    for(const x of [.84,-.88])for(const side of [-1,1])this.box(process,[.19,.20,.12],[x,x>0?1.10:1.02,side*1.30],'bodyDark',.014,{detail:true,role:'head-roller-bearing'});

    const knife=this.group(head,'sheeting-knife','Cross-Cut Zone Reference',[-.18,0,0],[0,.26,0],'UNRESOLVED_EXACT');
    this.box(knife,[.10,.10,2.34],[-.35,.92,0],'dark',.008,{active:true,motion:'knife-reference',detail:true,role:'cut-zone-reference'});
    this.box(knife,[.08,.08,2.28],[-.15,1.08,0],'chrome',.008,{active:true,motion:'knife-reference',detail:true,role:'cut-zone-reference'});
    const transport=this.group(head,'sheeting-cutter-transport','Integrated Head Infeed / Outfeed',[0,0,0],[0,.12,0]);
    this.box(transport,[2.18,.12,2.62],[0,.54,0],'light',.018,{role:'head-bed'});
    for(const z of [-.96,-.64,-.32,0,.32,.64,.96])this.box(transport,[2.04,.026,.050],[0,.62,z],'black',.003,{detail:true,role:'head-belt'});

    const delivery=this.group(this.root,'sheeting-delivery','Long Belt Outfeed / Overlap Bed',[-1.15,0,0],[-.58,.42,0]);
    for(const z of [-1.34,1.34]){
      this.box(delivery,[4.45,.24,.16],[0,.56,z],'body',.025,{role:'outfeed-side-rail',sourceAnchor:'BW-HSM56-OUTFEED-PHOTO'});
      for(const x of [-2.02,-1.05,-.08,.89,1.86])this.box(delivery,[.11,.56,.11],[x,.28,z],'steel',.010,{role:'outfeed-leg'});
    }
    this.box(delivery,[4.16,.10,2.64],[0,.76,0],'light',.018,{role:'outfeed-bed'});
    for(const z of [-1.02,-.78,-.54,-.30,-.06,.18,.42,.66,.90])this.box(delivery,[4.02,.026,.052],[0,.835,z],'black',.003,{detail:true,role:'transport-belt',sourceAnchor:'BW-HSM56-OUTFEED-PHOTO'});

    const deliveryRollers=this.group(delivery,'sheeting-delivery-rollers','Outfeed Entry / Exit Rollers',[0,0,0],[0,.08,0]);
    for(const x of [1.92,-2.02]){
      this.cyl(deliveryRollers,.085,2.54,[x,.87,0],'chrome','z',{active:true,motion:'delivery-roller',role:'transport-roller'});
      for(const side of [-1,1])this.box(deliveryRollers,[.18,.20,.12],[x,.87,side*1.30],'bodyDark',.012,{detail:true,role:'transport-bearing'});
    }

    const overlap=this.group(delivery,'sheeting-overlap','Transverse Adjustment / Hold-Down Rods',[0,0,0],[0,.14,0]);
    for(const [i,x] of [1.35,.62,-.12,-.86,-1.60].entries()){
      this.cyl(overlap,.035,2.72,[x,1.02,0],i===0?'chrome':'steel','z',{detail:true,role:'adjustment-rod',sourceAnchor:'BW-HSM56-OUTFEED-PHOTO'});
      for(const side of [-1,1]){
        this.box(overlap,[.13,.19,.11],[x,.96,side*1.39],'body',.010,{detail:true,role:'rod-support'});
        this.cyl(overlap,.060,.07,[x,1.08,side*.86],'black','y',{detail:true,role:'adjustment-knob'});
      }
      for(const z of [-.72,0,.72])this.torus(overlap,.060,.018,[x,1.02,z],i%2?'bodyDark':'body',{detail:true,role:'adjustment-collar'});
    }

    const layboy=this.group(this.root,'sheeting-layboy','Enclosed Lift-Table Stacker Tower',[-4.72,0,0],[-.42,.34,0]);
    // Four structural corner posts form the rigid tower seen in the lower brochure photo.
    for(const x of [-.96,.96])for(const z of [-1.40,1.40])this.box(layboy,[.20,2.46,.20],[x,1.23,z],'body',.028,{role:'stacker-column',sourceAnchor:'BW-HSM56-STACKER-PHOTO'});
    for(const z of [-1.40,1.40])this.box(layboy,[2.10,.34,.22],[0,2.38,z],'light',.030,{cover:true,role:'stacker-upper-housing',sourceAnchor:'BW-HSM56-STACKER-PHOTO'});
    for(const x of [-.96,.96])this.box(layboy,[.20,.26,3.00],[x,2.38,0],'bodyDark',.024,{role:'stacker-top-cross'});
    // Side safety mesh/rails: sparse and planar, not floating cylinders.
    for(const z of [-1.50,1.50]){
      for(const y of [.54,.82,1.10,1.38,1.66,1.94])this.box(layboy,[1.80,.032,.032],[-.06,y,z],'steel',.003,{detail:true,role:'stacker-guard-horizontal'});
      for(const x of [-.82,-.42,-.02,.38,.78])this.box(layboy,[.032,1.56,.032],[x,1.24,z],'steel',.003,{detail:true,role:'stacker-guard-vertical'});
    }
    const lift=this.group(layboy,'sheeting-stack-lift','Flat Lift Table / Pallet',[0,0,0],[0,.12,0]);
    this.box(lift,[1.86,.14,2.48],[0,.42,0],'steel',.016,{active:true,motion:'lift-table',role:'lift-table',sourceAnchor:'BW-HSM56-STACKER-PHOTO'});
    this.box(lift,[1.62,.08,2.18],[0,.53,0],'blue',.010,{active:true,motion:'lift-table',detail:true,role:'pallet',sourceAnchor:'BW-HSM56-STACKER-PHOTO'});
    for(const x of [-.72,.72])for(const z of [-1.22,1.22])this.box(lift,[.08,.72,.08],[x,.36,z],'steel',.008,{detail:true,role:'lift-guide'});
    this.box(layboy,[.11,1.72,2.58],[-1.05,1.02,0],'bodyDark',.016,{cover:true,role:'stacker-backstop-frame'});

    const access=this.group(this.root,'sheeting-access','Localized Operator Access / Stacker Steps',[-3.52,0,-1.76],[0,.26,-.30]);
    for(let i=0;i<3;i++){
      const h=.12+i*.13;
      this.box(access,[.56,h,.50],[-i*.19,h/2,-.02],'steel',.010,{detail:true,role:'access-step',sourceAnchor:'BW-HSM56-STACKER-PHOTO'});
    }
    this.box(access,[.72,.08,.54],[-.42,.39,-.02],'steel',.010,{detail:true,role:'access-landing'});

    const control=this.group(this.root,'sheeting-control','Low Operator Control Console',[.72,0,-1.78],[.18,.30,-.28]);
    this.box(control,[.68,.62,.48],[0,.31,0],'light',.035,{cover:true,role:'control-console-base',sourceAnchor:'BW-HSM56-OUTFEED-PHOTO'});
    this.box(control,[.58,.08,.40],[0,.66,-.02],'dark',.012,{detail:true,role:'control-console-face',sourceAnchor:'BW-HSM56-OUTFEED-PHOTO'},[-.38,0,0]);
    this.cyl(control,.045,.035,[-.18,.70,-.20],'red','z',{detail:true,role:'estop'});
    this.cyl(control,.038,.035,[-.02,.70,-.20],'green','z',{detail:true,role:'control-button'});
    this.cyl(control,.038,.035,[.13,.70,-.20],'black','z',{detail:true,role:'control-button'});

    this.root.userData.processFlow={
      input:'RIGHT · one low fixed-position rollstand visual anchor; exact HSM-CTM7 unwind mechanics unresolved',
      process:'RIGHT → LEFT · reel → raised guide/tension frame → windowed main head / cross-cut zone → long narrow-belt outfeed with transverse adjustment rods → enclosed lift-table stacker',
      output:'LEFT · flat lift-table / pallet stacker tower',
      idleWebGeometry:'HIDDEN_TO_AVOID_FALSE_FLOATING_SLABS',
      direction:'RIGHT_TO_LEFT',
      unwindArchitecture:'BW_HSM56_ONE_FIXED_POSITION_TWO_SIDED_PHOTO_ANCHOR__HSM_CTM7_EXACT_UNRESOLVED',
      cutterArchitecture:'VISIBLE_LARGE_CYLINDRICAL_ELEMENTS_PLUS_CROSS_CUT_ZONE__FUNCTION_EXACT_UNRESOLVED_DUE_SOURCE_CONFLICT',
      visualBasis:'BW_2014_HSM56_BROCHURE_PHOTO_ANCHORS_FIRST__MEGAMACH_HSM_FAMILY_SECONDARY__INDONESIAN_LEXUS_PROCESS_SECONDARY'
    };
  }
  findNode(id){return id==='MACHINE-SHEETING'?this.root:this.nodes.find(n=>n.userData.nodeId===id)||null;}
  resolvePart(o){for(let p=o;p&&p!==this.root;p=p.parent)if(p.userData.selectable)return p;return null;}
  resolveTaxonomyNode(id){let m=this.taxonomyById.get(id);while(m){for(const ref of m.meshRefs||[]){const n=this.findNode(ref);if(n)return n;}m=m.parentId?this.taxonomyById.get(m.parentId):null;}return this.root;}
  contains(a,b){for(let p=b;p;p=p.parent)if(p===a)return true;return false;}
  explode(t,s=null){for(const n of this.nodes)n.position.copy(n.userData.rest);const targets=s?(s.children.filter(c=>c.userData.selectable).length?s.children.filter(c=>c.userData.selectable):[s]):this.parts;for(const n of targets)n.position.addScaledVector(n.userData.explode,THREE.MathUtils.clamp(+t||0,0,1));}
  highlight(p){for(const m of this.meshes){m.material.emissive?.setHex(p&&this.contains(p,m)?0x124f49:0);m.material.emissiveIntensity=.32;}}
  highlightMany(ps=[]){for(const m of this.meshes){m.material.emissive?.setHex(ps.some(p=>this.contains(p,m))?0x124f49:0);m.material.emissiveIntensity=.32;}}
  ghost(on,except=null){this.ghosted=on;for(const m of this.meshes){const fade=on&&(!except||!this.contains(except,m));m.material.transparent=fade||m.userData.exteriorCover||m.material.transparent;m.material.opacity=fade?.14:(m.material.color?.getHex()===this.palette.glass?.28:1);m.material.depthWrite=!fade;}}
  isolate(p,on=true){for(const n of this.nodes)n.visible=!on||!p||this.contains(p,n)||this.contains(n,p);}
  showOnly(ps=[],on=true){for(const n of this.nodes)n.visible=!on||!ps.length||ps.some(p=>n===p||this.contains(n,p));}
  setExteriorOpen(on=true){this.exteriorOpen=!!on;for(const m of this.meshes)if(m.userData.exteriorCover)m.visible=!on;this.root.userData.interiorCutawayVisible=on;}
  setLow(on){for(const m of this.detailMeshes)m.visible=!on;}
  reset(){const open=this.exteriorOpen;this.explode(0);this.highlight(null);this.isolate(null,false);this.ghost(false);for(const n of this.nodes)n.quaternion.copy(n.userData.restQuaternion);for(const m of this.meshes){m.position.copy(m.userData.restPosition);m.rotation.copy(m.userData.restRotation);}if(open)this.setExteriorOpen(true);}
  dispose(){this.geometries.forEach(g=>g.dispose());this.materials.forEach(m=>m.dispose());}
}
