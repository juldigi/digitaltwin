import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {SHEETING_TAXONOMY,SHEETING_TAXONOMY_BY_ID} from './data/taxonomy-sheeting.js';

export const SHEETING_VISUAL_REFERENCE=Object.freeze({
  machineId:'BMJ-MCH-0002',
  plantModel:'HSM-CTM7',
  referenceFamily:'LEXUS HSM family · HSM 56 2014 BW visual anchors',
  year:2014,
  processDirection:'RIGHT_TO_LEFT',
  inputSide:'RIGHT',
  outputSide:'LEFT',
  evidence:'BMJ database + user-confirmed RIGHT_TO_LEFT + BW Papersystems 2014 HSM 56 brochure/page/full-resolution machine photo + historical Lexus/HSM family listing + Indonesian Lexus process reference',
  dimensions:'PHOTO_ANCHORED_RECONSTRUCTION_NOT_ENGINEERING',
  visualFamily:'HSM56_LOW_REEL_INCLINED_WEB_GUIDE_WINDOWED_HEAD_BANDED_PROCESS_CYLINDER_BELT_OUTFEED_TOWER_STACKER',
  visualRevision:'V64_HSM56_MECHANICAL_DETAIL'
});

export class SheetingMachineTemplate{
  constructor(){
    this.root=new THREE.Group();
    this.root.name='MACHINE-SHEETING';
    this.root.userData={
      assetId:'BMJ-MCH-0002',machine:'SHEETING LEXUS',model:'HSM-CTM7',
      referenceFamily:'LEXUS HSM family · HSM 56 2014 BW visual anchors',
      processDirection:'RIGHT_TO_LEFT',confidence:'IDENTITY_VERIFIED__GEOMETRY_FAMILY_PHOTO_ANCHORED',
      visualRevision:'V64_HSM56_MECHANICAL_DETAIL'
    };
    this.nodes=[];this.parts=[];this.meshes=[];this.geometries=new Map();this.materials=new Map();this.activeMeshes=[];this.detailMeshes=[];
    this.taxonomy=SHEETING_TAXONOMY;this.taxonomyById=SHEETING_TAXONOMY_BY_ID;this.exteriorOpen=false;this.ghosted=false;
    this.palette={
      body:0x16a28d,bodyDark:0x08786b,aqua:0x66c9c8,light:0xd7dbd9,white:0xf0f1ec,
      dark:0x293236,steel:0x939b9b,chrome:0xcbd1d0,paper:0xe8dfcb,stackPaper:0xc9ae83,
      glass:0x78b6bb,black:0x20272a,blue:0x2f67a1,red:0xc93434,green:0x4c9b4f,bronze:0xb08b55
    };
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
        metalness:['steel','chrome','dark','bronze'].includes(kind)?.44:.08,
        roughness:glass?.15:kind==='chrome'?.22:kind==='bronze'?.34:.55,
        transparent:glass,opacity:glass?.26:1
      }));
    }
    return this.materials.get(key);
  }
  mesh(g,geo,key,kind,pos=[0,0,0],rot=null,{cover=false,detail=false,active=false,motion=null,role=null,sourceAnchor=null,referenceStack=false}={}){
    if(!this.geometries.has(key))this.geometries.set(key,geo());
    const m=new THREE.Mesh(this.geometries.get(key),this.material(kind,g));m.position.set(...pos);if(rot)m.rotation.set(...rot);m.castShadow=kind!=='glass';m.receiveShadow=true;
    m.userData={ownerId:g.userData.nodeId,exteriorCover:cover,detail,motion,role,sourceAnchor,referenceStack,restPosition:m.position.clone(),restRotation:m.rotation.clone()};
    if(detail)this.detailMeshes.push(m);if(active){m.userData.activeElement=true;this.activeMeshes.push(m);}
    g.add(m);this.meshes.push(m);return m;
  }
  box(g,s,p,kind='body',r=.035,opts={},rot=null){return this.mesh(g,()=>r?new RoundedBoxGeometry(...s,2,r):new THREE.BoxGeometry(...s),'box:'+s.join(':')+':'+r,kind,p,rot,opts);}
  cyl(g,r,l,p,kind='steel',axis='z',opts={}){const rot=axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:null;return this.mesh(g,()=>new THREE.CylinderGeometry(r,r,l,32),'cyl:'+r+':'+l,kind,p,rot,opts);}
  torus(g,r,t,p,kind='bodyDark',opts={}){return this.mesh(g,()=>new THREE.TorusGeometry(r,t,12,32),'torus:'+r+':'+t,kind,p,null,opts);}
  sphere(g,r,p,kind='black',opts={}){return this.mesh(g,()=>new THREE.SphereGeometry(r,18,12),'sphere:'+r,kind,p,null,opts);}
  beamXY(g,a,b,z,thick=.12,depth=.16,kind='body',opts={}){
    const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),angle=Math.atan2(dy,dx);
    return this.box(g,[len,thick,depth],[(a[0]+b[0])/2,(a[1]+b[1])/2,z],kind,.012,opts,[0,0,angle]);
  }
  beamYZ(g,a,b,x,thick=.07,depth=.07,kind='body',opts={}){
    const dz=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dz,dy),angle=Math.atan2(dz,dy);
    return this.box(g,[depth,len,thick],[x,(a[1]+b[1])/2,(a[0]+b[0])/2],kind,.008,opts,[angle,0,0]);
  }
  roller(g,x,y,r=.1,{span=2.64,kind='chrome',motion='guide-roller',detail=false,active=true,bearings=true,supportBase=.48,sourceAnchor=null}={}){
    const m=this.cyl(g,r,span,[x,y,0],kind,'z',{active,motion,detail,role:'roller',sourceAnchor});
    if(bearings){
      const half=span/2;
      for(const side of [-1,1]){
        const z=side*(half+.055);
        this.box(g,[.20,.22,.11],[x,y,z],'bodyDark',.016,{detail:true,role:'bearing',sourceAnchor});
        const h=Math.max(.16,y-r-supportBase);
        if(h>.16)this.box(g,[.11,h,.11],[x,supportBase+h/2,side*(half+.05)],'steel',.010,{detail:true,role:'bearing-support',sourceAnchor});
      }
    }
    return m;
  }
  build(){
    // V64 follows visible brochure/photo anchors at component level, not a generic sheeter silhouette.
    // Exact HSM-CTM7 internal cutting mechanism is still unresolved where public sources conflict.

    const structure=this.group(this.root,'sheeting-structure','Grounded Main Chassis',[0,0,0],[0,-.22,0]);
    for(const z of [-1.47,1.47])this.box(structure,[16.60,.17,.17],[.05,.085,z],'dark',.020,{role:'main-rail'});
    for(const x of [-7.15,-5.95,-4.75,-3.55,-2.35,-1.15,.05,1.25,2.45,3.65,4.85,6.05,7.25,8.15]){
      this.box(structure,[.13,.15,3.00],[x,.075,0],'steel',.012,{detail:true,role:'cross-member'});
      for(const z of [-1.49,1.49])this.box(structure,[.20,.08,.22],[x,.04,z],'dark',.010,{detail:true,role:'foot'});
    }

    // RIGHT: low single roll, visible hub, two-sided support and hydraulic/swing structure.
    const rollstand=this.group(this.root,'sheeting-rollstand','Low Fixed-Position Rollstand',[7.30,0,0],[.72,.34,0]);
    const reel=this.group(rollstand,'sheeting-reel','Paper Reel / Opposed Chuck',[0,0,0],[.24,.18,0]);
    this.cyl(reel,.78,2.58,[-.12,.82,0],'paper','z',{active:true,motion:'reel',role:'reel',sourceAnchor:'BW-HSM56-ROLLSTAND-INSET'});
    this.cyl(reel,.115,2.82,[-.12,.82,0],'dark','z',{active:true,motion:'reel-core',detail:true,role:'reel-core',sourceAnchor:'BW-HSM56-ROLLSTAND-INSET'});
    for(const side of [-1,1]){
      const z=side*1.38;
      this.cyl(reel,.215,.12,[-.12,.82,z],'body','z',{active:true,motion:'chuck',role:'chuck-hub',sourceAnchor:'BW-HSM56-ROLLSTAND-INSET'});
      this.cyl(reel,.070,.15,[-.12,.84,z+side*.055],'dark','z',{detail:true,role:'chuck-center'});
      for(let i=0;i<6;i++){
        const a=i*Math.PI/3;
        this.cyl(reel,.018,.035,[-.12+Math.cos(a)*.125,.84+Math.sin(a)*.125,z+side*.078],'dark','z',{detail:true,role:'chuck-bolt'});
      }
      this.box(rollstand,[1.55,.23,.27],[.42,.62,side*1.43],'light',.022,{role:'swing-arm',sourceAnchor:'BW-HSM56-ROLLSTAND-INSET'},[0,0,.08]);
      this.box(rollstand,[.32,1.03,.31],[1.08,.56,side*1.43],'body',.032,{role:'rollstand-upright',sourceAnchor:'BW-HSM56-ROLLSTAND-INSET'});
      this.box(rollstand,[1.36,.18,.38],[.52,.11,side*1.43],'bodyDark',.020,{role:'rollstand-foot'});
      this.cyl(rollstand,.075,.72,[.69,.31,side*1.43],'body','x',{detail:true,role:'hydraulic-cylinder',sourceAnchor:'BW-HSM56-ROLLSTAND-INSET'});
      this.cyl(rollstand,.040,.80,[.60,.34,side*1.43],'chrome','x',{detail:true,role:'hydraulic-rod',sourceAnchor:'BW-HSM56-ROLLSTAND-INSET'});
    }
    this.box(rollstand,[1.86,.12,3.08],[.44,.065,0],'dark',.018,{role:'rollstand-floor-tie'});

    // The inset photo shows web climbing over an inclined roller frame rather than a generic four-post tower.
    const feed=this.group(this.root,'sheeting-feed','Inclined Web Guide / Tension Frame',[5.48,0,0],[.44,.40,0]);
    const feedFrame=this.group(feed,'sheeting-feed-frame','Inclined Two-Sided Guide Frame',[0,0,0],[.10,.12,0]);
    for(const z of [-1.34,1.34]){
      this.box(feedFrame,[.16,1.58,.18],[.68,.83,z],'body',.022,{role:'feed-right-post',sourceAnchor:'BW-HSM56-ROLLSTAND-INSET'});
      this.box(feedFrame,[.16,1.25,.18],[-.68,.67,z],'body',.022,{role:'feed-left-post',sourceAnchor:'BW-HSM56-ROLLSTAND-INSET'});
      this.beamXY(feedFrame,[.68,1.53],[-.68,1.92],z,.15,.18,'bodyDark',{role:'inclined-top-rail',sourceAnchor:'BW-HSM56-ROLLSTAND-INSET'});
      this.beamXY(feedFrame,[.68,.42],[-.68,.55],z,.12,.18,'light',{role:'inclined-bottom-rail',sourceAnchor:'BW-HSM56-ROLLSTAND-INSET'});
    }
    this.box(feedFrame,[.16,.15,2.86],[-.68,1.92,0],'light',.016,{role:'feed-top-cross',sourceAnchor:'BW-HSM56-ROLLSTAND-INSET'});
    const feedRollers=this.group(feed,'sheeting-feed-rollers','Inclined Guide / Tension Roller Set',[0,0,0],[.06,.10,0]);
    const guideSpec=[
      [.56,1.53,.105,'chrome','guide-roller'],
      [.20,1.72,.110,'chrome','guide-roller'],
      [-.18,1.55,.115,'black','tension-roller'],
      [-.56,1.22,.105,'chrome','guide-roller']
    ];
    for(const [x,y,r,kind,motion] of guideSpec){
      this.roller(feedRollers,x,y,r,{span:2.52,kind,motion,bearings:false,sourceAnchor:'BW-HSM56-ROLLSTAND-INSET'});
      for(const side of [-1,1])this.box(feedRollers,[.18,.20,.12],[x,y,side*1.31],'bodyDark',.014,{detail:true,role:'bearing',sourceAnchor:'BW-HSM56-ROLLSTAND-INSET'});
    }
    const epc=this.group(feed,'sheeting-epc','Compact EPC / Edge Sensor Reference',[-.67,0,0],[.05,.08,0],'PROCESS_FAMILY_REFERENCE');
    for(const side of [-1,1]){
      this.box(epc,[.08,.28,.10],[0,.93,side*1.19],'steel',.009,{detail:true,role:'sensor-post'});
      this.box(epc,[.22,.07,.11],[-.08,1.02,side*1.15],'bodyDark',.009,{detail:true,role:'sensor-arm'});
      this.box(epc,[.08,.13,.12],[-.20,1.02,side*1.10],'black',.009,{detail:true,role:'epc-sensor'});
    }

    // Main head: gray front/window frame with ONE visually dominant turquoise cylinder and banding.
    const head=this.group(this.root,'sheeting-cutter','Windowed Main Sheeting Head',[2.65,0,0],[0,.58,0]);
    for(const z of [-1.50,1.50]){
      this.box(head,[2.72,1.76,.28],[0,.94,z],'body',.048,{cover:true,role:'main-side-shell',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
      this.box(head,[2.44,.23,.11],[-.03,.43,z+(z<0?-.18:.18)],'bodyDark',.018,{cover:true,role:'side-lower-trim'});
    }
    this.box(head,[2.82,.40,3.16],[0,2.01,0],'light',.048,{cover:true,role:'main-top-hood',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
    this.box(head,[2.52,.83,.045],[-.04,1.62,-1.655],'glass',.018,{cover:true,role:'panoramic-window',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
    for(const x of [-1.26,1.18])this.box(head,[.09,.88,.08],[x,1.62,-1.69],'light',.009,{cover:true,role:'window-frame'});
    for(const y of [1.20,2.04])this.box(head,[2.54,.08,.08],[-.04,y,-1.69],'light',.009,{cover:true,role:'window-frame'});
    for(const x of [-.62,.58])this.box(head,[.36,.06,.07],[x,1.16,-1.73],'black',.018,{cover:true,detail:true,role:'window-handle',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});

    const process=this.group(head,'sheeting-main-rollers','Main Window Process Cylinder',[0,0,0],[0,.22,0]);
    this.cyl(process,.425,2.56,[.12,1.64,0],'aqua','z',{active:true,motion:'process-roller',role:'window-process-cylinder',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
    for(const z of [-.90,-.30,.30,.90])this.torus(process,.428,.026,[.12,1.64,z],'white',{detail:true,role:'process-cylinder-band',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
    for(const side of [-1,1])this.cyl(process,.255,.065,[.12,1.64,side*1.31],'dark','z',{detail:true,role:'process-cylinder-endcap',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
    // Lower transport rollers are visible/mechanically required but deliberately subordinate.
    this.cyl(process,.105,2.52,[.86,1.02,0],'chrome','z',{active:true,motion:'pull-roller',role:'head-infeed-roller'});
    this.cyl(process,.105,2.52,[-.92,.92,0],'chrome','z',{active:true,motion:'pull-roller',role:'head-outfeed-roller'});
    for(const x of [.86,-.92])for(const side of [-1,1])this.box(process,[.19,.20,.12],[x,x>0?1.02:.92,side*1.30],'bodyDark',.013,{detail:true,role:'head-roller-bearing'});
    // Repeating guides/fingers are visible just under the window.
    for(const z of [-1.05,-.82,-.59,-.36,-.13,.10,.33,.56,.79,1.02])this.box(process,[.28,.045,.055],[-.28,1.13,z],'dark',.004,{detail:true,role:'window-guide-finger',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});

    const knife=this.group(head,'sheeting-knife','Cross-Cut Zone Reference',[-.30,0,0],[0,.24,0],'UNRESOLVED_EXACT');
    this.box(knife,[.09,.08,2.30],[-.22,.86,0],'dark',.006,{active:true,motion:'knife-reference',detail:true,role:'cut-zone-reference'});
    this.box(knife,[.07,.07,2.22],[-.05,.98,0],'chrome',.006,{active:true,motion:'knife-reference',detail:true,role:'cut-zone-reference'});

    const transport=this.group(head,'sheeting-cutter-transport','Integrated Head Bed / Service Plate',[0,0,0],[0,.12,0]);
    this.box(transport,[2.40,.11,2.62],[-.02,.55,0],'light',.016,{role:'head-bed'});
    for(const z of [-1.08,-.84,-.60,-.36,-.12,.12,.36,.60,.84,1.08])this.box(transport,[2.28,.022,.044],[-.02,.625,z],'black',.002,{detail:true,role:'head-belt'});
    this.box(transport,[1.85,.055,2.18],[-.04,.77,0],'steel',.008,{detail:true,role:'diamond-service-plate',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});

    // LEFT of the head: long tape/belt transport, with sparse transverse rods and actual-looking supports.
    const delivery=this.group(this.root,'sheeting-delivery','Long Belt Outfeed / Overlap Bed',[-1.22,0,0],[-.58,.42,0]);
    for(const z of [-1.34,1.34]){
      this.box(delivery,[4.38,.22,.16],[0,.55,z],'body',.023,{role:'outfeed-side-rail',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
      for(const x of [-1.92,-.95,.02,.99,1.92])this.box(delivery,[.11,.54,.11],[x,.27,z],'steel',.009,{role:'outfeed-leg'});
    }
    this.box(delivery,[4.10,.085,2.62],[0,.75,0],'light',.015,{role:'outfeed-bed'});
    const beltZ=[-1.14,-.95,-.76,-.57,-.38,-.19,0,.19,.38,.57,.76,.95,1.14];
    for(const z of beltZ)this.box(delivery,[4.02,.024,.045],[0,.817,z],'black',.002,{detail:true,role:'transport-belt',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
    const deliveryRollers=this.group(delivery,'sheeting-delivery-rollers','Outfeed Entry / Exit Rollers',[0,0,0],[0,.08,0]);
    for(const x of [1.95,-1.95]){
      this.cyl(deliveryRollers,.082,2.54,[x,.86,0],'chrome','z',{active:true,motion:'delivery-roller',role:'transport-roller'});
      for(const side of [-1,1])this.box(deliveryRollers,[.17,.19,.12],[x,.86,side*1.30],'bodyDark',.011,{detail:true,role:'transport-bearing'});
    }

    const overlap=this.group(delivery,'sheeting-overlap','Transverse Adjustment Rod / Bracket Assemblies',[0,0,0],[0,.14,0]);
    const rodX=[1.25,.18,-1.02];
    for(const [i,x] of rodX.entries()){
      this.cyl(overlap,.036,2.72,[x,1.05,0],'chrome','z',{detail:true,role:'adjustment-rod',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
      for(const z of [-.78,0,.78]){
        // Green triangular support made from two braces plus a short pedestal.
        this.box(overlap,[.12,.16,.12],[x,.85,z],'body',.009,{detail:true,role:'rod-pedestal',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
        this.beamYZ(overlap,[z-.13,.86],[z,1.04],x,.060,.080,'body',{detail:true,role:'rod-triangular-brace',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
        this.beamYZ(overlap,[z+.13,.86],[z,1.04],x,.060,.080,'body',{detail:true,role:'rod-triangular-brace',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
        this.torus(overlap,.070,.019,[x,1.05,z],'bronze',{detail:true,role:'adjustment-collar',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
        this.cyl(overlap,.026,.15,[x,1.145,z],'dark','y',{detail:true,role:'adjustment-knob-stem'});
        this.sphere(overlap,.052,[x,1.235,z],'black',{detail:true,role:'adjustment-knob',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
      }
      for(const side of [-1,1])this.cyl(overlap,.095,.075,[x,1.05,side*1.39],'body','z',{detail:true,role:'rod-end-cap'});
    }
    this.box(delivery,[.12,.15,2.88],[-2.08,.93,0],'light',.010,{detail:true,role:'outfeed-front-crossbar',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});

    // Compact sloped console integrated beside the outfeed/head transition.
    const control=this.group(this.root,'sheeting-control','Integrated Low Operator Console',[.55,0,-1.72],[.18,.28,-.28]);
    this.box(control,[.68,.46,.48],[0,.25,0],'light',.030,{cover:true,role:'control-console-base',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
    this.box(control,[.58,.07,.42],[0,.52,-.08],'dark',.010,{detail:true,role:'control-console-face',sourceAnchor:'BW-HSM56-MAIN-PHOTO'},[-.46,0,0]);
    this.cyl(control,.042,.032,[-.19,.55,-.24],'red','z',{detail:true,role:'estop'});
    this.cyl(control,.034,.032,[-.04,.55,-.24],'green','z',{detail:true,role:'control-button'});
    this.cyl(control,.034,.032,[.09,.55,-.24],'black','z',{detail:true,role:'control-button'});
    this.cyl(control,.030,.22,[.24,.62,-.16],'chrome','y',{detail:true,role:'control-lever'});
    this.sphere(control,.050,[.24,.75,-.16],'black',{detail:true,role:'control-lever-knob'});

    // LEFT: rigid open-front tower, flat lift table, pallet, safety mesh and side cabinet/steps.
    const layboy=this.group(this.root,'sheeting-layboy','Rigid Lift-Table Stacker Tower',[-4.82,0,0],[-.42,.34,0]);
    for(const x of [-1.05,1.05])for(const z of [-1.44,1.44])this.box(layboy,[.21,2.55,.21],[x,1.275,z],'body',.028,{role:'stacker-column',sourceAnchor:'BW-HSM56-STACKER-PHOTO'});
    this.box(layboy,[2.30,.34,.25],[0,2.45,-1.44],'light',.030,{cover:true,role:'stacker-front-header',sourceAnchor:'BW-HSM56-STACKER-PHOTO'});
    this.box(layboy,[2.30,.30,.25],[0,2.43,1.44],'bodyDark',.028,{cover:true,role:'stacker-rear-header'});
    for(const x of [-1.05,1.05])this.box(layboy,[.21,.25,3.05],[x,2.44,0],'bodyDark',.022,{role:'stacker-top-cross'});
    // Rear and drive-side mesh guards; operator front remains open like the brochure photo.
    for(const y of [.56,.84,1.12,1.40,1.68,1.96]){
      this.box(layboy,[2.02,.030,.030],[-.02,y,1.50],'steel',.002,{detail:true,role:'stacker-guard-horizontal'});
      this.box(layboy,[.030,.030,2.64],[-1.13,y,.08],'steel',.002,{detail:true,role:'stacker-rear-guard-horizontal'});
    }
    for(const x of [-.88,-.44,0,.44,.88])this.box(layboy,[.030,1.58,.030],[x,1.26,1.50],'steel',.002,{detail:true,role:'stacker-guard-vertical'});
    for(const z of [-1.16,-.72,-.28,.16,.60,1.04])this.box(layboy,[.030,1.58,.030],[-1.13,1.26,z],'steel',.002,{detail:true,role:'stacker-rear-guard-vertical'});
    // Side cabinet visible at the tower/outfeed side.
    this.box(layboy,[.42,1.88,.40],[1.12,1.22,-1.20],'light',.030,{cover:true,role:'stacker-side-cabinet',sourceAnchor:'BW-HSM56-STACKER-PHOTO'});
    this.box(layboy,[.34,.78,.045],[1.12,1.36,-1.425],'bodyDark',.012,{cover:true,role:'stacker-cabinet-door'});
    // Internal lift rails, table and pallet.
    const lift=this.group(layboy,'sheeting-stack-lift','Flat Lift Table / Pallet',[0,0,0],[0,.12,0]);
    for(const x of [-.80,.80])for(const z of [-1.24,1.24])this.box(lift,[.075,1.12,.075],[x,.70,z],'steel',.007,{detail:true,role:'lift-guide-rail'});
    this.box(lift,[1.96,.14,2.58],[0,.42,0],'steel',.015,{active:true,motion:'lift-table',role:'lift-table',sourceAnchor:'BW-HSM56-STACKER-PHOTO'});
    this.box(lift,[1.72,.09,2.24],[0,.535,0],'blue',.009,{active:true,motion:'lift-table',detail:true,role:'pallet',sourceAnchor:'BW-HSM56-STACKER-PHOTO'});
    const refStack=this.group(lift,'sheeting-reference-stack','Reference Paper Stack',[0,0,0],[0,.08,0],'PHOTO_REFERENCE');
    for(let i=0;i<6;i++)this.box(refStack,[1.56,.075,2.08],[0,.625+i*.078,0],'stackPaper',.006,{detail:true,role:'reference-paper-layer',sourceAnchor:'BW-HSM56-STACKER-PHOTO',referenceStack:true});
    // Grounded lower base framing visible beneath the lift area.
    for(const z of [-1.31,1.31])this.box(layboy,[2.08,.12,.12],[0,.12,z],'dark',.010,{role:'stacker-base-rail'});
    for(const x of [-.92,0,.92])this.box(layboy,[.12,.12,2.66],[x,.12,0],'steel',.008,{detail:true,role:'stacker-base-cross'});

    const access=this.group(this.root,'sheeting-access','Grounded Stacker Side Steps',[-3.48,0,-1.78],[0,.24,-.28]);
    for(let i=0;i<3;i++){
      const h=.11+i*.13;
      this.box(access,[.56,h,.48],[-i*.20,h/2,-.01],'steel',.009,{detail:true,role:'access-step',sourceAnchor:'BW-HSM56-STACKER-PHOTO'});
    }
    this.box(access,[.74,.08,.52],[-.42,.39,-.01],'steel',.009,{detail:true,role:'access-landing'});

    this.root.userData.processFlow={
      input:'RIGHT · low single fixed-position rollstand visual anchor with opposed chuck and hydraulic/swing support',
      process:'RIGHT → LEFT · reel → inclined guide/tension roller frame + EPC reference → windowed main head with photographed banded process cylinder → long belt outfeed with transverse adjustment hardware → rigid lift-table stacker tower',
      output:'LEFT · flat lift-table / blue pallet inside open-front stacker tower',
      idleWebGeometry:'REFERENCE_STACK_VISIBLE__MOVING_WEB_ONLY_DURING_SIMULATION',
      direction:'RIGHT_TO_LEFT',
      unwindArchitecture:'BW_HSM56_LOW_REEL_PLUS_INCLINED_GUIDE_PHOTO_ANCHOR__HSM_CTM7_EXACT_UNRESOLVED',
      cutterArchitecture:'PHOTOGRAPHED_MAIN_PROCESS_CYLINDER_REPRODUCED__EXACT_HSM_CTM7_KNIFE_MECHANISM_UNRESOLVED',
      visualBasis:'BW_2014_HSM56_PDF_AND_FULL_RES_IMAGE_COMPONENT_ANCHORS_FIRST__MEGAMACH_HSM_FAMILY_SECONDARY__INDONESIAN_LEXUS_PROCESS_SECONDARY'
    };
  }
  findNode(id){return id==='MACHINE-SHEETING'?this.root:this.nodes.find(n=>n.userData.nodeId===id)||null;}
  resolvePart(o){for(let p=o;p&&p!==this.root;p=p.parent)if(p.userData.selectable)return p;return null;}
  resolveTaxonomyNode(id){let m=this.taxonomyById.get(id);while(m){for(const ref of m.meshRefs||[]){const n=this.findNode(ref);if(n)return n;}m=m.parentId?this.taxonomyById.get(m.parentId):null;}return this.root;}
  contains(a,b){for(let p=b;p;p=p.parent)if(p===a)return true;return false;}
  explode(t,s=null){for(const n of this.nodes)n.position.copy(n.userData.rest);const targets=s?(s.children.filter(c=>c.userData.selectable).length?s.children.filter(c=>c.userData.selectable):[s]):this.parts;for(const n of targets)n.position.addScaledVector(n.userData.explode,THREE.MathUtils.clamp(+t||0,0,1));}
  highlight(p){for(const m of this.meshes){m.material.emissive?.setHex(p&&this.contains(p,m)?0x124f49:0);m.material.emissiveIntensity=.32;}}
  highlightMany(ps=[]){for(const m of this.meshes){m.material.emissive?.setHex(ps.some(p=>this.contains(p,m))?0x124f49:0);m.material.emissiveIntensity=.32;}}
  ghost(on,except=null){this.ghosted=on;for(const m of this.meshes){const fade=on&&(!except||!this.contains(except,m));m.material.transparent=fade||m.userData.exteriorCover||m.material.transparent;m.material.opacity=fade?.14:(m.material.color?.getHex()===this.palette.glass?.26:1);m.material.depthWrite=!fade;}}
  isolate(p,on=true){for(const n of this.nodes)n.visible=!on||!p||this.contains(p,n)||this.contains(n,p);}
  showOnly(ps=[],on=true){for(const n of this.nodes)n.visible=!on||!ps.length||ps.some(p=>n===p||this.contains(n,p));}
  setExteriorOpen(on=true){this.exteriorOpen=!!on;for(const m of this.meshes)if(m.userData.exteriorCover)m.visible=!on;this.root.userData.interiorCutawayVisible=on;}
  setLow(on){for(const m of this.detailMeshes)m.visible=!on;}
  reset(){const open=this.exteriorOpen;this.explode(0);this.highlight(null);this.isolate(null,false);this.ghost(false);for(const n of this.nodes)n.quaternion.copy(n.userData.restQuaternion);for(const m of this.meshes){m.position.copy(m.userData.restPosition);m.rotation.copy(m.userData.restRotation);m.visible=true;}if(open)this.setExteriorOpen(true);}
  dispose(){this.geometries.forEach(g=>g.dispose());this.materials.forEach(m=>m.dispose());}
}
