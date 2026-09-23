import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {SHEETING_TAXONOMY,SHEETING_TAXONOMY_BY_ID} from './data/taxonomy-sheeting.js';
import {V122_SOURCE_STATS} from './data/research-v122.js';

export const SHEETING_VISUAL_REFERENCE=Object.freeze({
  machineId:'BMJ-MCH-0002',
  plantModel:'HSM-CTM7',
  referenceFamily:'BMJ HSM-CTM7 actual photo set · Lexus HSM family process corroboration',
  year:2014,
  processDirection:'RIGHT_TO_LEFT',
  inputSide:'RIGHT',
  outputSide:'LEFT',
  evidence:'BMJ database + user-confirmed RIGHT_TO_LEFT + 9 user-provided actual BMJ machine photographs (22 Sep 2026) as primary exterior evidence + Lexus HSM family sources only for unresolved process/specification corroboration',
  dimensions:'BMJ_ACTUAL_PHOTO_ANCHORED_RECONSTRUCTION_NOT_ENGINEERING',
  visualFamily:'BMJ_ACTUAL_OPEN_TWO_SIDED_ROLLSTAND_MULTIROLLER_BRIDGE_LEXUS_CUTTER_CABINET_OPEN_BELT_TABLE_STACK_TABLE',
  visualRevision:'V196_BMJ_TRUE_WEB_CUT_DELIVERY_KINEMATICS'
});


export const SHEETING_ACTUAL_LAYOUT=Object.freeze({
  revision:'V196',
  direction:'RIGHT_TO_LEFT',
  operatorZ:-1.62,
  webWidth:2.24,
  reel:Object.freeze({loadedCenter:Object.freeze([8.12,1.02,0]),standbyCenter:Object.freeze([6.68,.96,0]),radius:.82,span:2.70}),
  lowEntryRoll:Object.freeze({id:'LOW',center:Object.freeze([7.58,.48,0]),radius:.145,contact:'BOTTOM',rotationSign:1}),
  feedRollers:Object.freeze([
    Object.freeze({id:'G1',center:Object.freeze([7.45,1.55,0]),radius:.10,contact:'TOP',rotationSign:-1}),
    Object.freeze({id:'G2',center:Object.freeze([6.88,.78,0]),radius:.105,contact:'BOTTOM',rotationSign:1}),
    Object.freeze({id:'G3',center:Object.freeze([6.34,1.76,0]),radius:.10,contact:'TOP',rotationSign:-1}),
    Object.freeze({id:'G4',center:Object.freeze([5.78,.82,0]),radius:.105,contact:'BOTTOM',rotationSign:1}),
    Object.freeze({id:'G5',center:Object.freeze([5.20,1.62,0]),radius:.105,contact:'TOP',rotationSign:-1}),
    Object.freeze({id:'G6',center:Object.freeze([4.62,.92,0]),radius:.10,contact:'BOTTOM',rotationSign:1}),
    Object.freeze({id:'G7',center:Object.freeze([4.08,1.44,0]),radius:.105,contact:'TOP',rotationSign:-1})
  ]),
  drawRoll:Object.freeze({center:Object.freeze([3.53,1.25,0]),radius:.29,rotationSign:-1,wrapStartDeg:34,wrapEndDeg:194}),
  lowerEntryRoll:Object.freeze({center:Object.freeze([3.52,.76,0]),radius:.12,rotationSign:1}),
  cutPoint:Object.freeze([1.42,.88,0]),
  delivery:Object.freeze({startX:1.18,endX:-4.18,surfaceY:.88}),
  stack:Object.freeze({startX:-4.10,endX:-7.26,centerX:-5.72,surfaceY:.76})
});

export class SheetingMachineTemplate{
  constructor(){
    this.root=new THREE.Group();
    this.root.name='MACHINE-SHEETING';
    this.root.userData={
      assetId:'BMJ-MCH-0002',machine:'SHEETING LEXUS',model:'HSM-CTM7',
      referenceFamily:'BMJ HSM-CTM7 actual photo set · Lexus HSM family process corroboration',
      processDirection:'RIGHT_TO_LEFT',confidence:'IDENTITY_VERIFIED__GEOMETRY_FAMILY_PHOTO_ANCHORED',
      visualRevision:'V196_BMJ_TRUE_WEB_CUT_DELIVERY_KINEMATICS'
    };
    this.nodes=[];this.parts=[];this.meshes=[];this.geometries=new Map();this.materials=new Map();this.activeMeshes=[];this.detailMeshes=[];
    this.taxonomy=SHEETING_TAXONOMY;this.taxonomyById=SHEETING_TAXONOMY_BY_ID;this.exteriorOpen=false;this.ghosted=false;
    this.palette={
      body:0x16a28d,bodyDark:0x08786b,aqua:0x66c9c8,light:0xd7dbd9,white:0xf0f1ec,
      dark:0x293236,steel:0x939b9b,chrome:0xcbd1d0,paper:0xe8dfcb,stackPaper:0xc9ae83,
      glass:0x78b6bb,black:0x20272a,blue:0x2f67a1,red:0xc93434,green:0x4c9b4f,bronze:0xb08b55
    };
    this.buildActualV194();this.refineActualV195();this.refineActualV196();this.enrichActualV196();
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
  mesh(g,geo,key,kind,pos=[0,0,0],rot=null,{cover=false,detail=false,active=false,motion=null,role=null,sourceAnchor=null,referenceStack=false,cutawayOnly=false}={}){
    if(!this.geometries.has(key))this.geometries.set(key,geo());
    const m=new THREE.Mesh(this.geometries.get(key),this.material(kind,g));m.position.set(...pos);if(rot)m.rotation.set(...rot);m.castShadow=kind!=='glass';m.receiveShadow=true;
    m.userData={ownerId:g.userData.nodeId,exteriorCover:cover,detail,motion,role,sourceAnchor,referenceStack,cutawayOnly,restPosition:m.position.clone(),restRotation:m.rotation.clone()};
    if(cutawayOnly)m.visible=false;
    if(detail)this.detailMeshes.push(m);if(active){m.userData.activeElement=true;this.activeMeshes.push(m);}
    g.add(m);this.meshes.push(m);return m;
  }
  box(g,s,p,kind='body',r=.035,opts={},rot=null){return this.mesh(g,()=>r?new RoundedBoxGeometry(...s,2,r):new THREE.BoxGeometry(...s),'box:'+s.join(':')+':'+r,kind,p,rot,opts);}
  cyl(g,r,l,p,kind='steel',axis='z',opts={}){
    const rot=axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:null,m=this.mesh(g,()=>new THREE.CylinderGeometry(r,r,l,32),'cyl:'+r+':'+l,kind,p,rot,opts);
    m.userData.surfaceRadius=r;m.userData.rotorAxis=axis;return m;
  }
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
    const m=this.cyl(g,r,span,[x,y,0],kind,'z',{active,motion,detail,role:'roller',sourceAnchor});m.userData.kinematicGroup='WEB_CONTACT';
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


  tube(g,points,r=.018,kind='black',opts={}){
    const pts=points.map(p=>new THREE.Vector3(...p));
    const key='tube:'+points.map(p=>p.map(v=>Number(v).toFixed(3)).join(',')).join('|')+':'+r;
    return this.mesh(g,()=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,false,'centripetal',.25),Math.max(12,pts.length*6),r,8,false),key,kind,[0,0,0],null,opts);
  }
  handwheel(g,x,y,z,r=.20,sourceAnchor=null,role='handwheel'){
    this.torus(g,r,.026,[x,y,z],'black',{detail:true,role,sourceAnchor});
    this.cyl(g,.040,.11,[x,y,z+.028],'dark','z',{detail:true,role:role+'-hub',sourceAnchor});
    for(let i=0;i<3;i++){
      const a=i*Math.PI*2/3;
      this.box(g,[r*1.56,.030,.026],[x+Math.cos(a)*r*.26,y+Math.sin(a)*r*.26,z],'dark',.002,{detail:true,role:role+'-spoke',sourceAnchor},[0,0,a]);
    }
  }


  buildActualV194(){
    const photo='BMJ-SHEETING-PHOTOSET-20260922';
    const L=SHEETING_ACTUAL_LAYOUT;

    // The actual machine is not a set of isolated boxes. The unwind, overhead beams and
    // roller bridge form one continuous mechanical frame visible in IMG_2479/2480/2485.
    const structure=this.group(this.root,'sheeting-structure','Integrated Grounded Main Frame',[0,0,0],[0,-.18,0],'VERIFIED_VISUAL');
    for(const z of [-1.48,1.48])this.box(structure,[16.55,.14,.16],[.45,.07,z],'dark',.014,{role:'main-floor-rail',sourceAnchor:photo});
    for(const x of [-7.0,-6.1,-5.2,-4.3,-3.4,-2.5,-1.6,-.7,.2,1.1,2.0,2.9,3.8,4.7,5.6,6.5,7.4,8.3]){
      this.box(structure,[.11,.12,2.92],[x,.06,0],'steel',.008,{detail:true,role:'floor-cross-member',sourceAnchor:photo});
      for(const z of [-1.51,1.51])this.box(structure,[.18,.06,.20],[x,.03,z],'dark',.006,{detail:true,role:'floor-anchor-foot',sourceAnchor:photo});
    }

    const rollstand=this.group(this.root,'sheeting-rollstand','Integrated Two-Station Fixed Rollstand',[0,0,0],[.66,.26,0],'VERIFIED_VISUAL');
    const reel=this.group(rollstand,'sheeting-reel','Loaded Reel / Expanding Chuck Station',[0,0,0],[.22,.16,0],'VERIFIED_VISUAL');
    const [rx,ry,rz]=L.reel.loadedCenter, reelR=L.reel.radius;
    const reelBody=this.cyl(reel,reelR,L.reel.span,[rx,ry,rz],'paper','z',{active:true,motion:'reel',role:'loaded-paper-reel',sourceAnchor:photo});
    reelBody.userData.kinematicGroup='UNWIND_REEL';reelBody.userData.referenceWebContactRadius=reelR;
    const reelCore=this.cyl(reel,.115,L.reel.span+.24,[rx,ry,rz],'dark','z',{active:true,motion:'reel-core',detail:true,role:'reel-core',sourceAnchor:photo});
    reelCore.userData.kinematicGroup='UNWIND_REEL';reelCore.userData.referenceWebContactRadius=reelR;
    for(const side of [-1,1]){
      const z=side*(L.reel.span/2+.10);
      const chuck=this.cyl(reel,.205,.17,[rx,ry,z],'body','z',{active:true,motion:'chuck',role:'loaded-expanding-chuck',sourceAnchor:photo});
      chuck.userData.kinematicGroup='UNWIND_REEL';chuck.userData.referenceWebContactRadius=reelR;
      this.cyl(reel,.072,.21,[rx,ry,z+side*.075],'dark','z',{detail:true,role:'chuck-center',sourceAnchor:photo});
      for(let i=0;i<6;i++){
        const a=i*Math.PI/3;
        this.cyl(reel,.015,.030,[rx+Math.cos(a)*.125,ry+Math.sin(a)*.125,z+side*.09],'dark','z',{detail:true,role:'chuck-face-bolt',sourceAnchor:photo});
      }
    }

    // Two longitudinal reel stations share the same grounded stand. The second station is empty
    // in the photo set and is represented by its opposed chuck arms only.
    const stationSpecs=[
      {x:L.reel.loadedCenter[0],y:L.reel.loadedCenter[1],label:'loaded'},
      {x:L.reel.standbyCenter[0],y:L.reel.standbyCenter[1],label:'standby'}
    ];
    for(const st of stationSpecs)for(const side of [-1,1]){
      const z=side*1.47,pivotX=st.x-.50,pivotY=.34;
      this.cyl(rollstand,.18,.23,[pivotX,pivotY,z],'body','z',{detail:true,role:'rollstand-main-pivot',sourceAnchor:photo});
      this.beamXY(rollstand,[pivotX,pivotY],[st.x-.28,.58],z,.27,.30,'light',{role:st.label+'-reel-arm-inner',sourceAnchor:photo});
      this.beamXY(rollstand,[st.x-.28,.58],[st.x,st.y],z,.25,.30,'light',{role:st.label+'-reel-arm-outer',sourceAnchor:photo});
      this.cyl(rollstand,.205,.17,[st.x,st.y,z],'body','z',{detail:true,role:st.label+'-chuck-housing',sourceAnchor:photo});
      this.box(rollstand,[.17,.83,.18],[st.x-.38,.47,side*1.60],'blue',.022,{detail:true,role:'vertical-hydraulic-cylinder',sourceAnchor:photo});
      this.cyl(rollstand,.036,.34,[st.x-.38,1.03,side*1.60],'chrome','y',{detail:true,role:'hydraulic-piston-rod',sourceAnchor:photo});
    }
    for(const side of [-1,1]){
      this.box(rollstand,[3.25,.16,.30],[7.36,.10,side*1.49],'light',.016,{role:'rollstand-common-base',sourceAnchor:photo});
      this.box(rollstand,[.26,.52,.28],[7.35,.30,side*1.49],'body',.020,{role:'rollstand-center-pedestal',sourceAnchor:photo});
    }

    // Central valve manifold visible in IMG_2485: tall body, dense top valve blocks and many hoses.
    const manifold=this.group(rollstand,'sheeting-rollstand-manifold','Hydraulic Valve Manifold / Hose Tower',[0,0,0],[.10,.10,0],'VERIFIED_VISUAL');
    this.box(manifold,[.78,1.22,.44],[7.34,1.03,.05],'body',.018,{cover:true,role:'hydraulic-manifold-cabinet',sourceAnchor:photo});
    for(let row=0;row<3;row++)for(let col=0;col<5;col++){
      const x=7.08+col*.13,y=1.73+row*.13;
      this.box(manifold,[.105,.105,.18],[x,y,-.02],'dark',.008,{detail:true,role:'hydraulic-valve-block',sourceAnchor:photo});
      this.cyl(manifold,.020,.05,[x,y,-.13],'chrome','z',{detail:true,role:'hydraulic-valve-fitting',sourceAnchor:photo});
    }
    const hoseStarts=[[7.10,1.70,-.04],[7.24,1.70,-.04],[7.38,1.70,-.04],[7.52,1.70,-.04],[7.66,1.70,-.04]];
    const hoseEnds=[[8.02,.98,-1.60],[7.60,.96,1.60],[6.82,.96,-1.60],[6.34,.94,1.60],[7.18,.55,-1.48]];
    hoseStarts.forEach((s,i)=>this.tube(manifold,[s,[s[0],1.35,(i-2)*.07],[7.35,.78,(i-2)*.12],hoseEnds[i]],.018,'black',{detail:true,role:'hydraulic-hose',sourceAnchor:photo}));

    // Actual front control pedestal: six pressure gauges across the upper face and blue regulators below.
    const unwindPanel=this.group(rollstand,'sheeting-unwind-panel','Unwind Pressure / Regulator Pedestal',[0,0,0],[.10,.12,-.18],'VERIFIED_VISUAL');
    this.box(unwindPanel,[.74,1.38,.42],[7.54,.75,-1.78],'body',.026,{cover:true,role:'unwind-pressure-cabinet',sourceAnchor:photo});
    for(let i=0;i<6;i++){
      const x=7.27+i*.11;
      this.cyl(unwindPanel,.052,.026,[x,1.16,-2.005],'steel','z',{detail:true,role:'unwind-pressure-gauge-bezel',sourceAnchor:photo});
      this.cyl(unwindPanel,.041,.028,[x,1.16,-2.025],'white','z',{detail:true,role:'unwind-pressure-gauge-face',sourceAnchor:photo});
      this.cyl(unwindPanel,.036,.050,[x, .91,-2.035],'blue','z',{detail:true,role:'unwind-blue-regulator',sourceAnchor:photo});
      this.box(unwindPanel,[.055,.018,.025],[x,.91,-2.067],'dark',.002,{detail:true,role:'unwind-regulator-handle',sourceAnchor:photo},[0,0,(i%2?-.45:.45)]);
    }
    this.cyl(unwindPanel,.035,.035,[7.30,.57,-2.03],'red','z',{detail:true,role:'unwind-stop-button',sourceAnchor:photo});
    this.cyl(unwindPanel,.035,.035,[7.47,.57,-2.03],'green','z',{detail:true,role:'unwind-start-button',sourceAnchor:photo});

    // Long overhead bridge ties the unwind to the open roller section; this is one of the strongest
    // silhouette cues missing from V193.
    const bridge=this.group(rollstand,'sheeting-unwind-bridge','Long Overhead Unwind / Roller Bridge',[0,0,0],[.16,.18,0],'VERIFIED_VISUAL');
    for(const z of [-1.38,1.38]){
      this.box(bridge,[5.15,.20,.22],[5.92,2.28,z],'light',.010,{role:'overhead-longitudinal-beam',sourceAnchor:photo});
      for(const x of [7.76,6.62,5.42,4.28])this.box(bridge,[.16,.58,.20],[x,1.98,z],'body',.012,{role:'overhead-green-link',sourceAnchor:photo},[0,0,(x===7.76?.16:x===4.28?-.12:0)]);
    }
    for(const x of [4.20,5.45,6.70,7.90])this.box(bridge,[.14,.16,2.92],[x,2.27,0],'steel',.008,{detail:true,role:'overhead-cross-tie',sourceAnchor:photo});

    const feed=this.group(this.root,'sheeting-feed','Integrated Open Multi-Roller Web Section',[0,0,0],[.45,.34,0],'VERIFIED_VISUAL');
    const feedFrame=this.group(feed,'sheeting-feed-frame','Open Two-Sided Roller Frame',[0,0,0],[.12,.10,0],'VERIFIED_VISUAL');
    for(const z of [-1.40,1.40]){
      for(const x of [3.82,5.00,6.18])this.box(feedFrame,[.18,2.06,.20],[x,1.08,z],'light',.014,{role:'roller-frame-upright',sourceAnchor:photo});
      this.box(feedFrame,[2.54,.16,.20],[5.00,.14,z],'steel',.010,{role:'roller-frame-lower-rail',sourceAnchor:photo});
      this.beamXY(feedFrame,[3.82,.36],[6.18,.62],z,.14,.20,'light',{role:'roller-frame-diagonal-base',sourceAnchor:photo});
    }
    for(const x of [3.82,5.00,6.18])this.box(feedFrame,[.16,.16,2.94],[x,2.05,0],'steel',.008,{role:'roller-frame-cross-member',sourceAnchor:photo});

    const feedRollers=this.group(feed,'sheeting-feed-rollers','Photo-Matched Guide / Tension Roller Bank',[0,0,0],[.06,.10,0],'VERIFIED_VISUAL');
    for(const spec of L.feedRollers){
      const [x,y]=spec.center;
      const rr=this.cyl(feedRollers,spec.radius,2.70,[x,y,0],'chrome','z',{active:true,motion:'guide-roller',role:'guide-tension-roller',sourceAnchor:photo});
      rr.userData.kinematicGroup='WEB_CONTACT';rr.userData.rotationSign=spec.rotationSign;rr.userData.webContactSide=spec.contact;rr.userData.layoutId=spec.id;
      for(const side of [-1,1]){
        this.box(feedRollers,[.18,.20,.13],[x,y,side*1.41],'bodyDark',.010,{detail:true,role:'roller-bearing-block',sourceAnchor:photo});
        this.cyl(feedRollers,.035,.055,[x,y,side*1.49],'dark','z',{detail:true,role:'roller-shaft-end',sourceAnchor:photo});
      }
    }

    // Small operator digital instruments on the near roller-frame upright.
    const feedMeters=this.group(feed,'sheeting-feed-meters','Feed Digital Meter Pair',[0,0,0],[.05,.06,-.12],'VERIFIED_VISUAL');
    for(const [i,y] of [1.32,1.02].entries()){
      this.box(feedMeters,[.25,.25,.07],[3.86,y,-1.53],'light',.008,{detail:true,role:'feed-meter-case',sourceAnchor:photo});
      this.box(feedMeters,[.15,.09,.025],[3.86,y+.035,-1.575],'dark',.004,{detail:true,role:'feed-meter-display',sourceAnchor:photo});
      this.cyl(feedMeters,.018,.020,[3.92,y-.065,-1.58],i?'red':'green','z',{detail:true,role:'feed-meter-button',sourceAnchor:photo});
    }

    // Freestanding gray electrical cabinet visible beside the roller bridge.
    const electrical=this.group(feed,'sheeting-electrical-cabinet','Feed / Drive Electrical Cabinet',[0,0,0],[.08,.08,.16],'VERIFIED_VISUAL');
    this.box(electrical,[.76,1.48,.52],[4.18,.76,1.80],'light',.018,{cover:true,role:'electrical-cabinet-body',sourceAnchor:photo});
    this.box(electrical,[.64,.55,.025],[4.18,.93,1.535],'steel',.006,{cover:true,detail:true,role:'electrical-cabinet-door',sourceAnchor:photo});
    for(const y of [.46,1.16])this.box(electrical,[.34,.025,.028],[4.18,y,1.52],'dark',.003,{detail:true,role:'electrical-vent',sourceAnchor:photo});

    const epc=this.group(feed,'sheeting-epc','Web Alignment / Edge Guide Reference',[0,0,0],[.05,.08,0],'PROCESS_FAMILY_REFERENCE');
    this.box(epc,[.62,.09,2.30],[4.02,.94,0],'steel',.006,{detail:true,role:'edge-guide-crossbar',sourceAnchor:photo});
    for(const side of [-1,1])this.box(epc,[.11,.26,.12],[4.02,.83,side*.96],'bodyDark',.008,{detail:true,role:'edge-guide-head',sourceAnchor:photo});

    // Main LEXUS cutter is asymmetric: a large enclosed cabinet plus a projecting intake roll guard.
    const head=this.group(this.root,'sheeting-cutter','LEXUS Enclosed Cutter / Main Drive',[0,0,0],[0,.50,0],'VERIFIED_VISUAL');
    this.box(head,[2.58,2.46,3.02],[2.18,1.24,0],'body',.034,{cover:true,role:'main-cutter-cabinet',sourceAnchor:photo});
    this.box(head,[2.42,.20,3.08],[2.18,2.49,0],'bodyDark',.018,{cover:true,role:'cutter-top-cap',sourceAnchor:photo});
    this.box(head,[1.90,1.86,.030],[2.10,1.18,1.525],'bodyDark',.008,{cover:true,role:'drive-side-main-access-door',sourceAnchor:photo});
    this.cyl(head,.055,.025,[2.85,1.24,1.555],'dark','z',{detail:true,role:'main-access-door-handle',sourceAnchor:photo});
    this.box(head,[.92,1.22,.36],[3.50,1.12,-1.49],'body',.024,{cover:true,role:'intake-projecting-guard',sourceAnchor:photo});
    this.box(head,[.42,.32,.025],[3.58,.82,-1.69],'white',.004,{cover:true,detail:true,role:'bend-warning-plate',sourceAnchor:photo});
    this.cyl(head,.050,.035,[3.64,1.26,-1.69],'red','z',{detail:true,role:'intake-emergency-stop',sourceAnchor:photo});

    const window=this.group(head,'sheeting-window','LEXUS Silver Inspection Panel / Window',[0,0,0],[0,.12,-.18],'VERIFIED_VISUAL');
    this.box(window,[1.82,.60,.060],[2.08,1.74,-1.555],'light',.008,{cover:true,role:'inspection-panel-frame',sourceAnchor:photo});
    this.box(window,[1.56,.32,.028],[2.08,1.75,-1.592],'glass',.004,{cover:true,role:'long-inspection-window',sourceAnchor:photo});
    const brand=this.box(window,[.52,.20,.030],[2.28,1.73,-1.625],'white',.003,{cover:true,detail:true,role:'lexus-brand-plate',sourceAnchor:photo});
    brand.userData.label='LEXUS';
    for(const x of [1.25,2.91])for(const y of [1.49,1.99])this.cyl(window,.018,.020,[x,y,-1.625],'dark','z',{detail:true,role:'inspection-panel-bolt',sourceAnchor:photo});

    // Dominant exterior transport roll visible in IMG_2487, plus lower polished roll.
    const process=this.group(head,'sheeting-main-rollers','Exterior Draw / Nip Roll Assembly',[0,0,0],[0,.20,0],'VERIFIED_VISUAL');
    const [dx,dy]=L.drawRoll.center;
    const draw=this.cyl(process,L.drawRoll.radius,2.58,[dx,dy,0],'black','z',{active:true,motion:'draw-roller',role:'large-black-draw-roll',sourceAnchor:photo});
    draw.userData.kinematicGroup='WEB_CONTACT';draw.userData.rotationSign=L.drawRoll.rotationSign;draw.userData.webContactSide='WRAP';
    const [lx,ly]=L.lowerEntryRoll.center;
    const lower=this.cyl(process,L.lowerEntryRoll.radius,2.62,[lx,ly,0],'chrome','z',{active:true,motion:'pull-roller',role:'lower-polished-entry-roll',sourceAnchor:photo});
    lower.userData.kinematicGroup='WEB_CONTACT';lower.userData.rotationSign=L.lowerEntryRoll.rotationSign;lower.userData.webContactSide='BOTTOM';
    for(const side of [-1,1]){
      this.cyl(process,.205,.080,[dx,dy,side*1.34],'body','z',{detail:true,role:'draw-roll-end-housing',sourceAnchor:photo});
      this.box(process,[.22,.24,.13],[lx,ly,side*1.38],'bodyDark',.010,{detail:true,role:'lower-roll-bearing-block',sourceAnchor:photo});
    }

    // Row of small top snubber/guide wheels and its transverse shaft.
    const snubbers=this.group(head,'sheeting-snubber-wheels','Top Snubber / Guide Wheel Bank',[0,0,0],[0,.12,0],'VERIFIED_VISUAL');
    this.cyl(snubbers,.030,2.32,[3.30,1.66,0],'chrome','z',{detail:true,role:'snubber-wheel-shaft',sourceAnchor:photo});
    for(let i=0;i<9;i++){
      const z=-1.02+i*.255;
      const w=this.cyl(snubbers,.078,.045,[3.30,1.66,z],'white','z',{active:true,motion:'snubber-wheel',detail:true,role:'snubber-wheel',sourceAnchor:photo});
      w.userData.kinematicGroup='WEB_CONTACT';w.userData.rotationSign=-1;w.userData.surfaceRadius=.078;
      this.box(snubbers,[.11,.20,.08],[3.30,1.78,z],'body',.006,{detail:true,role:'snubber-wheel-holder',sourceAnchor:photo});
    }

    // Two angled drive/motor units above the draw roll, photo-visible and asymmetric.
    const topDrive=this.group(head,'sheeting-top-drive','Top Roll Drive / Motor Pair',[0,0,0],[.12,.14,0],'VERIFIED_VISUAL');
    for(const z of [-.78,.72]){
      this.box(topDrive,[.38,.28,.28],[3.13,1.98,z],'steel',.025,{detail:true,role:'top-drive-motor',sourceAnchor:photo},[0,0,z<0?.34:-.34]);
      this.box(topDrive,[.42,.18,.20],[3.33,1.82,z],'body',.012,{detail:true,role:'top-drive-bracket',sourceAnchor:photo},[0,0,z<0?.34:-.34]);
      this.cyl(topDrive,.055,.16,[3.20,1.86,z],'dark','x',{detail:true,role:'top-drive-shaft',sourceAnchor:photo});
    }

    // External pressure/regulator panel on the cabinet side (IMG_2481).
    const pneu=this.group(head,'sheeting-cutter-pneumatic-panel','Cutter Pneumatic Pressure Panel',[0,0,0],[.12,.12,-.18],'VERIFIED_VISUAL');
    this.box(pneu,[.92,.83,.10],[1.12,1.13,-1.60],'body',.014,{cover:true,role:'cutter-pressure-panel-body',sourceAnchor:photo});
    for(let i=0;i<4;i++){
      const x=.84+(i%2)*.34,y=1.39-Math.floor(i/2)*.31;
      this.cyl(pneu,.065,.025,[x,y,-1.665],'steel','z',{detail:true,role:'cutter-pressure-gauge-bezel',sourceAnchor:photo});
      this.cyl(pneu,.052,.027,[x,y,-1.682],'white','z',{detail:true,role:'cutter-pressure-gauge-face',sourceAnchor:photo});
      this.cyl(pneu,.047,.050,[x,y-.14,-1.685],'blue','z',{detail:true,role:'cutter-blue-regulator',sourceAnchor:photo});
    }
    this.cyl(pneu,.030,.030,[1.42,.89,-1.68],'red','z',{detail:true,role:'cutter-panel-stop',sourceAnchor:photo});
    this.box(pneu,[.24,.025,.028],[1.18,.78,-1.69],'dark',.002,{detail:true,role:'cutter-panel-lever',sourceAnchor:photo},[0,0,.45]);

    // Top length/display enclosure and green support post.
    const display=this.group(head,'sheeting-length-display','Top Sheet-Length / Status Display',[0,0,0],[0,.16,0],'VERIFIED_VISUAL');
    this.box(display,[.10,.82,.10],[1.76,2.82,.28],'body',.008,{detail:true,role:'display-support-post',sourceAnchor:photo});
    this.box(display,[1.06,.34,.34],[2.10,3.02,.28],'light',.012,{cover:true,role:'top-display-enclosure',sourceAnchor:photo});
    this.box(display,[.18,.20,.030],[1.64,3.04,.095],'dark',.004,{detail:true,role:'top-digital-display',sourceAnchor:photo});

    const knife=this.group(head,'sheeting-knife','Internal Cross-Cut Zone · Guarded',[0,0,0],[0,.18,0],'VERIFIED_VISUAL__INTERNAL_MECHANISM_UNRESOLVED');
    knife.userData.visibleKnifeGeometry=false;
    knife.userData.evidenceBoundary='The user-provided BMJ photos show the cutter fully guarded inside the LEXUS enclosure. V194 models the verified exterior transport hardware but intentionally does not invent blade shape, stroke or actuation.';
    const transport=this.group(head,'sheeting-cutter-transport','Guarded Cut / Exit Bed',[0,0,0],[0,.10,0],'VERIFIED_VISUAL');
    this.box(transport,[2.08,.09,2.52],[2.00,.69,0],'steel',.010,{role:'guarded-cutter-bed',sourceAnchor:photo});
    for(const z of [-1.02,-.76,-.50,-.24,.02,.28,.54,.80,1.06])this.box(transport,[2.00,.020,.042],[2.00,.745,z],'black',.002,{detail:true,role:'guarded-bed-strip',sourceAnchor:photo});

    // Photo-visible trim extraction accessory. It is visually present but remains isolated from
    // the core process claims because the exact connection is not documented.
    const extraction=this.group(head,'sheeting-trim-extraction','Trim / Dust Extraction Bag Accessory',[0,0,0],[.12,.12,.24],'PHOTO_VISIBLE_ACCESSORY');
    this.mesh(extraction,()=>new THREE.CylinderGeometry(.24,.36,.88,18),'trim-bag-v194','light',[1.05,.62,1.78],null,{detail:true,role:'trim-extraction-bag',sourceAnchor:photo});
    this.cyl(extraction,.075,.52,[1.18,1.16,1.70],'steel','y',{detail:true,role:'trim-extraction-duct',sourceAnchor:photo});

    // Delivery is an open multi-level mechanism, not a flat slab.
    const delivery=this.group(this.root,'sheeting-delivery','Open Multi-Level Belt / Alignment Delivery',[0,0,0],[-.58,.34,0],'VERIFIED_VISUAL');
    for(const z of [-1.44,1.44]){
      this.box(delivery,[5.42,.22,.18],[-1.50,.55,z],'light',.014,{role:'delivery-side-frame',sourceAnchor:photo});
      for(const x of [1.05,.15,-.75,-1.65,-2.55,-3.45,-4.05])this.box(delivery,[.11,.54,.12],[x,.27,z],'steel',.007,{role:'delivery-leg',sourceAnchor:photo});
    }
    for(const x of [1.12,.25,-.62,-1.48,-2.35,-3.22,-4.10])this.box(delivery,[.10,.10,2.78],[x,.46,0],'steel',.006,{detail:true,role:'delivery-cross-member',sourceAnchor:photo});

    const fastBelts=this.group(delivery,'sheeting-fast-belts','Upstream Green Belt Field',[0,0,0],[0,.05,0],'VERIFIED_VISUAL');
    const slowBelts=this.group(delivery,'sheeting-slow-belts','Middle Green Belt Field',[0,0,0],[0,.05,0],'VERIFIED_VISUAL');
    const overlapBelts=this.group(delivery,'sheeting-overlap-belts','Downstream Alignment Belt Field',[0,0,0],[0,.05,0],'VERIFIED_VISUAL');
    const beltZ=[];for(let z=-1.20;z<=1.201;z+=.145)beltZ.push(+z.toFixed(3));
    for(const z of beltZ){
      this.box(fastBelts,[1.62,.020,.050],[.39,.835,z],'body',.001,{detail:true,role:'fast-transport-belt',sourceAnchor:photo});
      this.box(slowBelts,[1.70,.020,.050],[-1.27,.835,z],'body',.001,{detail:true,role:'slow-transport-belt',sourceAnchor:photo});
      this.box(overlapBelts,[2.06,.020,.050],[-3.15,.835,z],'body',.001,{detail:true,role:'overlap-transport-belt',sourceAnchor:photo});
    }

    const deliveryRollers=this.group(delivery,'sheeting-delivery-rollers','Transverse Delivery Shaft / Roller Set',[0,0,0],[0,.07,0],'VERIFIED_VISUAL');
    const delSpec=[
      [1.05,.105,'FAST',-1],[.30,.075,'FAST',-1],[-.55,.075,'SLOW',-1],[-1.42,.072,'SLOW',-1],[-2.35,.080,'OVERLAP',-1],[-3.30,.095,'OVERLAP',-1],[-4.02,.105,'OVERLAP',-1]
    ];
    for(const [x,r,zone,sign] of delSpec){
      const rr=this.cyl(deliveryRollers,r,2.68,[x,.89,0],'chrome','z',{active:true,motion:'delivery-roller',role:'transport-roller',sourceAnchor:photo});
      rr.userData.kinematicGroup='CUT_SHEET_TRANSPORT';rr.userData.transportZone=zone;rr.userData.rotationSign=sign;
      for(const side of [-1,1])this.box(deliveryRollers,[.16,.18,.12],[x,.89,side*1.40],'bodyDark',.009,{detail:true,role:'delivery-bearing-block',sourceAnchor:photo});
    }

    const overlap=this.group(delivery,'sheeting-overlap','Cross-Shaft / Snubber / Alignment Assemblies',[0,0,0],[0,.12,0],'VERIFIED_VISUAL');
    const wheelRows=[[.55,'FAST'],[-.55,'SLOW'],[-1.58,'SLOW']];
    for(const [x,zone] of wheelRows){
      this.cyl(overlap,.030,2.76,[x,1.02,0],'chrome','z',{detail:true,role:'hold-down-cross-shaft',sourceAnchor:photo});
      for(let i=0;i<6;i++){
        const z=-1.02+i*.40;
        const w=this.cyl(overlap,.090,.050,[x,.98,z],'white','z',{active:true,motion:'hold-down-wheel',detail:true,role:'white-hold-down-wheel',sourceAnchor:photo});
        w.userData.kinematicGroup='CUT_SHEET_TRANSPORT';w.userData.transportZone=zone;w.userData.rotationSign=-1;w.userData.surfaceRadius=.09;
        this.box(overlap,[.11,.18,.09],[x,1.10,z],'bodyDark',.006,{detail:true,role:'hold-down-wheel-holder',sourceAnchor:photo});
      }
    }
    for(const x of [.98,-.08,-2.12,-3.62]){
      this.cyl(overlap,.026,2.82,[x,1.18,0],'chrome','z',{detail:true,role:'adjustment-crossrail',sourceAnchor:photo});
      for(const z of [-.92,0,.92])this.cyl(overlap,.030,.10,[x,1.18,z],'dark','z',{detail:true,role:'crossrail-clamp',sourceAnchor:photo});
    }
    // Two photo-visible checker plate bridges/covers span the machine width.
    for(const x of [.02,-2.22])this.box(delivery,[.28,.055,2.82],[x,1.05,0],'steel',.004,{detail:true,role:'diamond-plate-cross-cover',sourceAnchor:photo});

    const handwheel=this.group(delivery,'sheeting-outfeed-handwheel','Delivery Adjustment Handwheels',[0,0,0],[0,.08,-.12],'VERIFIED_VISUAL');
    this.handwheel(handwheel,-.05,.72,-1.58,.19,photo,'delivery-handwheel');
    this.handwheel(handwheel,-3.84,1.18,-1.58,.18,photo,'delivery-handwheel');

    // Actual broad wedge console with an HMI and many discrete switches.
    const control=this.group(this.root,'sheeting-control','BMJ Delivery Operator Console',[0,0,0],[.18,.24,-.26],'VERIFIED_VISUAL');
    this.box(control,[1.92,.58,.54],[-.72,.36,-1.91],'light',.020,{cover:true,role:'operator-console-base',sourceAnchor:photo});
    this.box(control,[1.82,.075,.48],[-.72,.68,-2.00],'steel',.006,{cover:true,role:'operator-console-face',sourceAnchor:photo},[-.40,0,0]);
    this.box(control,[1.95,.055,.28],[-.72,.30,-2.17],'steel',.004,{detail:true,role:'operator-console-stainless-lip',sourceAnchor:photo});
    this.box(control,[.36,.038,.24],[-.45,.72,-2.24],'dark',.003,{detail:true,role:'operator-hmi-display',sourceAnchor:photo},[-.40,0,0]);
    const controlKinds=['green','black','black','red','black','green','black','black','green','black','red','black','black','green','black','black','red','black'];
    controlKinds.forEach((kind,i)=>{
      const row=Math.floor(i/9),col=i%9;
      this.cyl(control,.027,.028,[-1.44+col*.18,.74-row*.16,-2.245],kind,'z',{detail:true,role:'operator-button-selector',sourceAnchor:photo});
    });

    // Output stack/lay table: long side rails with rack teeth, two large handwheels, sliding
    // guide carriages, blue pallet blocks and a stack light. These details dominate IMG_2484.
    const layboy=this.group(this.root,'sheeting-layboy','Rack-Adjusted Open Stack / Lay Table',[0,0,0],[-.44,.28,0],'VERIFIED_VISUAL');
    const sx=L.stack.centerX, stackLen=L.stack.endX-L.stack.startX;
    for(const z of [-1.44,1.44]){
      this.box(layboy,[Math.abs(stackLen),.22,.18],[sx,.72,z],'light',.012,{role:'stack-side-rail',sourceAnchor:photo});
      for(const x of [L.stack.startX+.15,sx,L.stack.endX-.15])this.box(layboy,[.12,.72,.12],[x,.36,z],'steel',.007,{role:'stack-frame-leg',sourceAnchor:photo});
    }
    for(const x of [L.stack.startX,L.stack.endX])this.box(layboy,[.14,.18,2.92],[x,1.08,0],'light',.010,{role:'stack-end-crossbeam',sourceAnchor:photo});
    for(const z of [-1.57,1.57]){
      this.box(layboy,[2.92,.10,.08],[sx,1.00,z],'bronze',.003,{detail:true,role:'stack-rack-bar',sourceAnchor:photo});
      for(let i=0;i<34;i++){
        const x=L.stack.startX+.18+i*(Math.abs(stackLen)-.36)/33;
        this.box(layboy,[.045,.050,.045],[x,1.055,z],'dark',.001,{detail:true,role:'stack-rack-tooth',sourceAnchor:photo});
      }
    }
    const joggers=this.group(layboy,'sheeting-stacker-joggers','Manual Rack-Adjusted Stack Guides',[0,0,0],[0,.06,0],'VERIFIED_VISUAL');
    for(const x of [-5.18,-6.28]){
      this.box(joggers,[.34,.46,.20],[x,1.08,-1.48],'body',.010,{detail:true,role:'stack-guide-carriage',sourceAnchor:photo});
      this.handwheel(joggers,x,1.12,-1.68,.23,photo,'stack-guide-handwheel');
      this.box(joggers,[.12,.82,2.06],[x,1.18,0],'light',.008,{detail:true,role:'stack-guide-plate',sourceAnchor:photo});
    }
    this.box(joggers,[.12,.74,2.20],[L.stack.endX+.12,1.10,0],'light',.008,{detail:true,role:'fixed-output-backstop',sourceAnchor:photo});
    for(const side of [-1,1])this.box(joggers,[2.34,.46,.060],[sx,.92,side*1.06],'light',.006,{detail:true,role:'manual-side-guide',sourceAnchor:photo});

    const lift=this.group(layboy,'sheeting-stack-lift','Flat Plate Lift / Pallet Support',[0,0,0],[0,.10,0],'FAMILY_PROCESS_REFERENCE__PHOTO_POSITION_ANCHORED');
    this.box(lift,[2.36,.12,2.42],[sx,.60,0],'steel',.008,{active:true,motion:'lift-table',role:'lift-table',sourceAnchor:photo});
    for(const x of [sx-.70,sx+.70])for(const z of [-.78,.78])this.box(lift,[.34,.10,.28],[x,.52,z],'blue',.004,{active:true,motion:'lift-table',detail:true,role:'blue-pallet-block',sourceAnchor:photo});
    const refStack=this.group(lift,'sheeting-reference-stack','Captured Paper Stack',[0,0,0],[0,.06,0],'VERIFIED_VISUAL');
    this.box(refStack,[1.94,.44,2.08],[sx,.88,0],'stackPaper',.006,{role:'reference-paper-block',sourceAnchor:photo,referenceStack:true});
    for(let i=0;i<9;i++)this.box(refStack,[1.96,.010,2.10],[sx,.68+i*.045,0],'paper',.001,{detail:true,role:'reference-paper-seam',sourceAnchor:photo,referenceStack:true});
    this.box(refStack,[1.96,.022,2.10],[sx,1.105,0],'paper',.002,{detail:true,role:'reference-paper-top',sourceAnchor:photo,referenceStack:true});

    const stackLight=this.group(layboy,'sheeting-stack-light','Stacker Signal Tower',[0,0,0],[0,.12,.14],'VERIFIED_VISUAL');
    this.box(stackLight,[.07,1.22,.07],[L.stack.endX+.08,1.56,1.52],'dark',.004,{detail:true,role:'stack-light-pole',sourceAnchor:photo});
    for(const [i,kind] of ['green','bronze','red'].entries())this.cyl(stackLight,.065,.13,[L.stack.endX+.08,2.18+i*.13,1.52],kind,'y',{detail:true,role:'stack-light-segment',sourceAnchor:photo});

    // Continuous operator-side diamond-plate catwalk and railing from cutter through delivery.
    const access=this.group(this.root,'sheeting-access','Continuous Operator Catwalk / Steps',[0,0,0],[0,.20,.24],'VERIFIED_VISUAL');
    this.box(access,[7.15,.11,.78],[-.35,.47,-1.98],'steel',.008,{detail:true,role:'diamond-plate-catwalk',sourceAnchor:photo});
    for(let i=0;i<3;i++)this.box(access,[.76,.11,.74],[3.54-i*.22,.11+i*.13,-1.98],'steel',.006,{detail:true,role:'access-step',sourceAnchor:photo});
    for(const x of [-3.50,-2.30,-1.10,.10,1.30,2.50]){
      this.box(access,[.07,1.00,.07],[x,1.00,-2.37],'body',.006,{detail:true,role:'catwalk-railing-post',sourceAnchor:photo});
    }
    this.box(access,[6.25,.065,.065],[-.50,1.49,-2.37],'light',.004,{detail:true,role:'catwalk-top-rail',sourceAnchor:photo});
    this.box(access,[6.25,.055,.055],[-.50,1.05,-2.37],'light',.004,{detail:true,role:'catwalk-mid-rail',sourceAnchor:photo});

    this.root.userData.processFlow={
      input:'RIGHT · loaded reel on a fixed two-station/two-sided hydraulic rollstand integrated into the long roller bridge',
      process:'RIGHT → LEFT · reel → alternating open guide/tension rollers → large black exterior draw roll at LEXUS cutter entry → guarded internal cross-cut → open multi-level green belt delivery → rack-adjusted open stack table',
      output:'LEFT · rack-and-handwheel-adjusted open stack/lay table with flat plate lift support',
      idleWebGeometry:'REFERENCE_STACK_VISIBLE__MOVING_WEB_ONLY_DURING_SIMULATION',
      direction:'RIGHT_TO_LEFT',
      visualBasis:'BMJ_IMG_2479_TO_2487_PRIMARY__MODULE_PROPORTIONS_AND_ASYMMETRY_REBUILT_V194',
      cutterArchitecture:'GUARDED_INTERNAL_CUTTER__NO_VISIBLE_BLADE__EXTERIOR_DRAW_ROLL_SNUBBER_WHEELS_AND_PNEUMATIC_PANEL_PHOTO_VERIFIED',
      mainTransportFunction:'PHOTO_VERIFIED_ALTERNATING_ROLLER_BANK__LARGE_BLACK_DRAW_ROLL__OPEN_DELIVERY_SHAFTS',
      windowArchitecture:'ACTUAL_SILVER_LEXUS_INSPECTION_PANEL_WITH_NARROW_WINDOW',
      unwindArchitecture:'INTEGRATED_TWO_STATION_FIXED_ROLLSTAND__OVERHEAD_BEAMS__VERTICAL_HYDRAULICS__CENTRAL_VALVE_MANIFOLD',
      stackerArchitecture:'RACK_ADJUSTED_OPEN_LAY_TABLE__TWO_LARGE_HANDWHEELS__BLUE_PALLET_BLOCKS__SIGNAL_TOWER',
      operatorAccess:'CONTINUOUS_DIAMOND_PLATE_CATWALK_AND_RAILING',
      exactModelSearch:'HSM_CTM7_PUBLIC_ENGINEERING_DRAWING_NOT_FOUND__ACTUAL_BMJ_PHOTOS_ARE_VISUAL_SOURCE_OF_TRUTH'
    };
  }

  enrichActualV194(){
    this.root.userData.researchVersion='V194';
    this.root.userData.researchSourceCount=V122_SOURCE_STATS.total;
    this.root.userData.detailPass='V194_PHOTO_GEOMETRY_DEEP_PASS';
    this.root.userData.installedOptionBoundary='Actual BMJ photos control visible hardware. V194 removes family geometry that conflicts with IMG_2479–IMG_2487 and does not expose undocumented cutter internals.';
    this.root.userData.primaryVisualEvidence='BMJ_USER_PHOTOSET_20260922_IMG_2479_TO_IMG_2487';
    this.root.userData.familyEvidenceRole='HIDDEN_PROCESS_AND_SPEC_CORROBORATION_ONLY';
    this.root.userData.geometryCorrections=[
      'unwind and roller bridge physically integrated',
      'actual pressure gauges and blue regulators',
      'large black draw roll and snubber wheel bank',
      'asymmetric cutter guards and pneumatic panel',
      'multi-level belt/shaft delivery',
      'rack-and-pinion stack guide with two large handwheels',
      'continuous operator catwalk'
    ];
  }


  retireRoleGeometry(role){
    const doomed=this.meshes.filter(m=>m.userData.role===role);
    for(const m of doomed)m.removeFromParent();
    const set=new Set(doomed);
    this.meshes=this.meshes.filter(m=>!set.has(m));
    this.activeMeshes=this.activeMeshes.filter(m=>!set.has(m));
    this.detailMeshes=this.detailMeshes.filter(m=>!set.has(m));
    return doomed.length;
  }

  retireNodeGeometry(id){
    const node=this.findNode(id);if(!node)return null;
    const doomed=new Set();node.traverse(o=>{if(o?.isMesh)doomed.add(o);});
    this.meshes=this.meshes.filter(m=>!doomed.has(m));
    this.activeMeshes=this.activeMeshes.filter(m=>!doomed.has(m));
    this.detailMeshes=this.detailMeshes.filter(m=>!doomed.has(m));
    while(node.children.length)node.remove(node.children[0]);
    return node;
  }

  refineActualV195(){
    const photo='BMJ-SHEETING-PHOTOSET-20260922';
    const L=SHEETING_ACTUAL_LAYOUT;

    // V195 correction: IMG_2485/2479 and the BW HSM56 fixed-position rollstand reference
    // do NOT justify a fabricated rigid bridge physically tying the unwind to the feed frame.
    // Keep the visible long upper members local to each assembly and preserve an open service gap.
    const bridge=this.retireNodeGeometry('sheeting-unwind-bridge');
    if(bridge){
      bridge.name='Rollstand Upper Support / Parked Arm Structure';
      bridge.userData.confidence='VERIFIED_VISUAL__NO_FEED_FRAME_CONNECTION_CLAIM';
      for(const z of [-1.40,1.40]){
        this.box(bridge,[1.90,.20,.22],[7.55,2.17,z],'light',.010,{role:'rollstand-upper-longitudinal-member',sourceAnchor:photo});
        this.beamXY(bridge,[6.70,1.90],[6.84,2.17],z,.18,.22,'body',{role:'rollstand-upper-diagonal-brace',sourceAnchor:photo});
        this.beamXY(bridge,[8.30,1.86],[8.18,2.17],z,.18,.22,'body',{role:'rollstand-upper-end-brace',sourceAnchor:photo});
      }
      for(const x of [6.86,7.55,8.22])this.box(bridge,[.14,.16,2.92],[x,2.17,0],'steel',.008,{detail:true,role:'rollstand-upper-cross-tie',sourceAnchor:photo});
    }

    // The feed frame receives its own top rails; they end before the rollstand service gap.
    const feedFrame=this.findNode('sheeting-feed-frame');
    if(feedFrame){
      for(const z of [-1.40,1.40]){
        this.box(feedFrame,[2.62,.17,.20],[5.02,2.12,z],'light',.010,{role:'feed-upper-longitudinal-rail',sourceAnchor:photo});
        this.beamXY(feedFrame,[3.82,1.92],[4.16,2.12],z,.14,.20,'body',{role:'feed-upper-entry-brace',sourceAnchor:photo});
      }
      this.box(feedFrame,[.14,.16,2.94],[6.30,2.11,0],'steel',.008,{detail:true,role:'feed-upper-end-cross-tie',sourceAnchor:photo});
    }

    // Photo-visible low turquoise guide roller between reel and elevated guide bank.
    const feedRollers=this.findNode('sheeting-feed-rollers');
    if(feedRollers&&!this.meshes.some(m=>m.userData.role==='low-entry-guide-roll')){
      const spec=L.lowEntryRoll,[x,y]=spec.center;
      const low=this.cyl(feedRollers,spec.radius,2.72,[x,y,0],'body','z',{active:true,motion:'guide-roller',role:'low-entry-guide-roll',sourceAnchor:photo});
      low.userData.kinematicGroup='WEB_CONTACT';low.userData.rotationSign=spec.rotationSign;low.userData.webContactSide=spec.contact;low.userData.layoutId=spec.id;
      for(const side of [-1,1]){
        this.box(feedRollers,[.20,.23,.14],[x,y,side*1.43],'bodyDark',.010,{detail:true,role:'low-entry-roll-bearing',sourceAnchor:photo});
        this.cyl(feedRollers,.038,.055,[x,y,side*1.51],'dark','z',{detail:true,role:'low-entry-roll-shaft-end',sourceAnchor:photo});
      }
    }

    // Re-label the second photo-visible arm set conservatively. It is visible, but the photo set
    // does not prove an independently loadable second unwind station.
    for(const m of this.meshes){
      const role=m.userData.role||'';
      if(role.startsWith('standby-')){
        m.userData.role=role.replace('standby-','parked-');
        m.userData.confidence='PHOTO_VISIBLE_ARM_SET__FUNCTIONAL_STATION_UNRESOLVED';
      }
    }

    // Add the front turquoise operator/control pedestal actually visible beside the loaded roll.
    const rollstand=this.findNode('sheeting-rollstand');
    if(rollstand&&!this.findNode('sheeting-rollstand-front-controls')){
      const p=this.group(rollstand,'sheeting-rollstand-front-controls','Rollstand Front Control Pedestal',[0,0,0],[.10,.12,-.18],'VERIFIED_VISUAL');
      this.box(p,[.58,1.48,.40],[8.72,.79,-1.64],'body',.024,{cover:true,role:'rollstand-front-control-cabinet',sourceAnchor:photo});
      for(let row=0;row<2;row++)for(let col=0;col<4;col++){
        const x=8.54+col*.12,y=1.12-row*.20;
        this.cyl(p,.036,.028,[x,y,-1.855],col===0&&row===1?'red':col===1&&row===1?'green':'black','z',{detail:true,role:'rollstand-front-control-button',sourceAnchor:photo});
      }
      this.box(p,[.36,.11,.025],[8.72,.54,-1.865],'light',.002,{detail:true,role:'rollstand-front-control-label-plate',sourceAnchor:photo});
    }

    // Cutter exterior refinements from IMG_2486/2487: cabinet seams/hinges and machine-name plate.
    const head=this.findNode('sheeting-cutter');
    if(head&&!this.findNode('sheeting-cutter-service-detail')){
      const d=this.group(head,'sheeting-cutter-service-detail','Cutter Door / Safety / Nameplate Details',[0,0,0],[.08,.08,-.12],'VERIFIED_VISUAL');
      for(const y of [.64,1.32,2.02])this.box(d,[.015,.44,.055],[.90,y,1.545],'dark',.002,{detail:true,role:'cutter-door-hinge',sourceAnchor:photo});
      this.box(d,[.78,.24,.030],[1.62,2.16,-1.585],'bodyDark',.004,{cover:true,detail:true,role:'machine-name-plate',sourceAnchor:photo});
      const plaque=this.box(d,[.66,.14,.018],[1.62,2.16,-1.607],'light',.002,{cover:true,detail:true,role:'machine-name-plaque-face',sourceAnchor:photo});
      plaque.userData.label='MESIN SHEETING';
      this.cyl(d,.040,.028,[3.32,1.18,-1.70],'red','z',{detail:true,role:'cutter-side-emergency-stop',sourceAnchor:photo});
      this.box(d,[.46,.28,.024],[3.16,.88,-1.695],'white',.003,{detail:true,role:'cutter-warning-placard',sourceAnchor:photo});
    }

    // The large draw roll is not a featureless black cylinder: the actual photo shows a dark
    // working surface bounded by lighter end bands/covered web region.
    const draw=this.meshes.find(m=>m.userData.role==='large-black-draw-roll');
    const process=this.findNode('sheeting-main-rollers');
    if(draw&&process&&!this.meshes.some(m=>m.userData.role==='draw-roll-end-band')){
      for(const z of [-1.10,1.10])this.torus(process,L.drawRoll.radius+.004,.032,[L.drawRoll.center[0],L.drawRoll.center[1],z],'light',{detail:true,role:'draw-roll-end-band',sourceAnchor:photo});
      for(const z of [-.66,-.22,.22,.66])this.torus(process,L.drawRoll.radius+.005,.010,[L.drawRoll.center[0],L.drawRoll.center[1],z],'steel',{detail:true,role:'draw-roll-service-band',sourceAnchor:photo});
    }

    // Delivery wheel supports are green pivot arms in the actual photos, not floating white discs.
    const overlap=this.findNode('sheeting-overlap');
    if(overlap&&!this.meshes.some(m=>m.userData.role==='hold-down-pivot-arm')){
      for(const x of [.55,-.55,-1.58])for(let i=0;i<6;i++){
        const z=-1.02+i*.40;
        this.beamYZ(overlap,[z,1.08],[z,.99],x-.08,.055,.080,'body',{detail:true,role:'hold-down-pivot-arm',sourceAnchor:photo});
        this.cyl(overlap,.027,.10,[x-.08,1.09,z],'dark','z',{detail:true,role:'hold-down-pivot-pin',sourceAnchor:photo});
      }
    }

    // Stacker V195: scale/ruler, vertical screw posts, spring returns and end control block
    // are visible in IMG_2484 and remove the generic bare-frame appearance.
    const joggers=this.findNode('sheeting-stacker-joggers');
    const layboy=this.findNode('sheeting-layboy');
    if(joggers&&layboy&&!this.meshes.some(m=>m.userData.role==='stack-ruler-tick')){
      for(let i=0;i<46;i++){
        const x=L.stack.startX+.18+i*(Math.abs(L.stack.endX-L.stack.startX)-.36)/45;
        const major=i%5===0;
        this.box(joggers,[.012,major?.055:.035,.018],[x,1.135,-1.685],'dark',.001,{detail:true,role:'stack-ruler-tick',sourceAnchor:photo});
      }
      for(const x of [-5.18,-6.28]){
        this.cyl(joggers,.032,.62,[x,1.42,-1.50],'chrome','y',{detail:true,role:'stack-guide-threaded-post',sourceAnchor:photo});
        this.cyl(joggers,.055,.06,[x,1.75,-1.50],'steel','y',{detail:true,role:'stack-guide-post-cap',sourceAnchor:photo});
      }
      for(const [x,z] of [[-7.05,-1.58],[-4.32,1.58]]){
        for(let i=0;i<10;i++)this.torus(joggers,.050,.010,[x,.70+i*.055,z],'black',{detail:true,role:'stack-return-spring-loop',sourceAnchor:photo});
      }
      const end=this.group(layboy,'sheeting-stack-end-controls','Stacker End Control Block',[0,0,0],[.08,.10,-.12],'VERIFIED_VISUAL');
      this.box(end,[.20,.42,.18],[L.stack.endX+.18,1.02,-1.54],'body',.008,{detail:true,role:'stack-end-control-box',sourceAnchor:photo});
      this.cyl(end,.028,.030,[L.stack.endX+.18,1.11,-1.645],'red','z',{detail:true,role:'stack-end-stop-button',sourceAnchor:photo});
      this.cyl(end,.028,.030,[L.stack.endX+.18,.98,-1.645],'green','z',{detail:true,role:'stack-end-start-button',sourceAnchor:photo});
      this.box(end,[.08,.18,.030],[L.stack.endX+.18,.82,-1.645],'white',.002,{detail:true,role:'stack-end-warning-label',sourceAnchor:photo});
    }

    this.root.userData.processFlow={
      ...this.root.userData.processFlow,
      input:'RIGHT · photo-visible fixed-position hydraulic rollstand assembly, physically distinct from the downstream feed frame',
      process:'RIGHT → LEFT · loaded reel → low entry guide roll → elevated alternating guide/tension rollers → black exterior draw roll → guarded LEXUS cross-cut → open multi-level green belt delivery → rack-adjusted stack table',
      unwindArchitecture:'FIXED_POSITION_ROLLSTAND_ASSEMBLY__PHOTO_VISIBLE_SECOND_ARM_SET_FUNCTION_UNRESOLVED__NO_FABRICATED_FEED_FRAME_BRIDGE',
      feedArchitecture:'SEPARATE_OPEN_FEED_FRAME__LOW_ENTRY_ROLL__SEVEN_ELEVATED_GUIDE_TENSION_ROLLERS',
      stackerArchitecture:'RACK_ADJUSTED_OPEN_STACK_TABLE__RULER_SCALE__THREADED_GUIDE_POSTS__SPRING_RETURNS__END_CONTROLS',
      geometryBoundary:'ONLY_PHOTO_VISIBLE_CONNECTIONS_ARE_HARD_MODELED__AMBIGUOUS_ARM_SET_IS_NOT_CLAIMED_AS_SECOND_LOAD_STATION__ROLLSTAND_FEED_SERVICE_GAP_PRESERVED'
    };
  }

  enrichActualV195(){
    this.root.userData.researchVersion='V195';
    this.root.userData.researchSourceCount=V122_SOURCE_STATS.total;
    this.root.userData.detailPass='V195_PHOTO_TRUTH_CONNECTION_AND_SERVICE_DETAIL_CORRECTION';
    this.root.userData.installedOptionBoundary='Actual BMJ photos remain primary. V195 removes the unsupported rigid unwind-to-feed bridge claim, keeps the second visible arm set functionally unresolved, and adds only photo-visible service/detail hardware.';
    this.root.userData.primaryVisualEvidence='BMJ_USER_PHOTOSET_20260922_IMG_2479_TO_IMG_2487';
    this.root.userData.familyEvidenceRole='FIXED_POSITION_ROLLSTAND_AND_HIDDEN_PROCESS_CORROBORATION_ONLY';
    this.root.userData.geometryCorrections=[
      'rollstand and feed frame no longer asserted as one rigid assembly',
      'low entry guide roll added before elevated roller bank',
      'parked/second arm set no longer called an independently loadable station',
      'front rollstand control pedestal added',
      'cutter service hinges nameplate warning details added',
      'draw roll service/end bands added',
      'delivery hold-down pivot arms grounded',
      'stack ruler threaded posts spring returns and end controls added'
    ];
  }


  refineActualV196(){
    const photo='BMJ-SHEETING-PHOTOSET-20260922';
    const L=SHEETING_ACTUAL_LAYOUT;

    // IMG_2479/2480 show a long web-carrier structure spanning above the unwind/feed loop.
    // It is modeled as its own assembly: not a fabricated rollstand bridge, and not hidden inside the feed frame.
    for(const role of [
      'rollstand-upper-longitudinal-member','rollstand-upper-diagonal-brace','rollstand-upper-end-brace','rollstand-upper-cross-tie',
      'feed-upper-longitudinal-rail','feed-upper-entry-brace','feed-upper-end-cross-tie'
    ])this.retireRoleGeometry(role);

    const oldBridge=this.findNode('sheeting-unwind-bridge');
    if(oldBridge){
      oldBridge.name='Web Carrier / Upper Infeed Structure';
      oldBridge.userData.confidence='VERIFIED_VISUAL';
      const carrier=oldBridge;
      for(const z of [-1.38,1.38]){
        this.box(carrier,[4.92,.20,.22],[6.15,2.18,z],'light',.010,{role:'web-carrier-longitudinal-beam',sourceAnchor:photo});
        this.beamXY(carrier,[3.90,1.78],[4.15,2.18],z,.17,.22,'body',{role:'web-carrier-cutter-end-brace',sourceAnchor:photo});
        this.beamXY(carrier,[8.34,1.82],[8.18,2.18],z,.17,.22,'body',{role:'web-carrier-unwind-end-brace',sourceAnchor:photo});
      }
      for(const x of [4.05,5.22,6.38,7.50,8.23])this.box(carrier,[.15,.16,2.88],[x,2.18,0],'steel',.008,{detail:true,role:'web-carrier-cross-tie',sourceAnchor:photo});
      for(const [x,y] of [[7.46,1.77],[6.34,1.96],[5.20,1.82],[4.10,1.66]]){
        for(const z of [-1.39,1.39])this.beamXY(carrier,[x+.16,2.12],[x,y],z,.13,.18,'body',{detail:true,role:'web-carrier-hanger-bracket',sourceAnchor:photo});
      }
    }

    // Replace the V195 feed-frame roof with the open rectangular/stacked-roller support seen in IMG_2480.
    const frame=this.findNode('sheeting-feed-frame');
    if(frame){
      for(const x of [4.00,5.12,6.25,7.40])for(const z of [-1.42,1.42]){
        this.box(frame,[.16,1.68,.18],[x,1.03,z],'light',.010,{detail:true,role:'loop-frame-upright',sourceAnchor:photo});
      }
      for(const y of [.34,1.10,1.92])for(const z of [-1.42,1.42]){
        this.box(frame,[3.55,.13,.16],[5.72,y,z],'steel',.008,{detail:true,role:'loop-frame-longitudinal-rail',sourceAnchor:photo});
      }
    }

    // Family-grounded stationary-bed-knife / rotary-fly-knife internals.
    // HSM56 literature says "Flat Bed Knife"; Maxson documents the standard stationary-bed-knife
    // arrangement as a rotary revolver blade passing a fixed bed knife. These parts remain CUTAWAY ONLY.
    const knife=this.findNode('sheeting-knife');
    if(knife&&!this.findNode('sheeting-flatbed-cutter-family')){
      knife.userData.visibleKnifeGeometry='CUTAWAY_ONLY_FAMILY_REFERENCE';
      knife.userData.evidenceBoundary='BMJ photos keep the cross-cutter enclosed. HSM56 family literature verifies a Flat Bed Knife; the internal stationary-bed-knife + rotary fly-knife representation is family-grounded and only shown in cutaway.';
      const cut=this.group(knife,'sheeting-flatbed-cutter-family','Stationary Bed Knife / Rotary Fly Knife Family Mechanism',[0,0,0],[0,.12,0],'PROCESS_FAMILY_REFERENCE__CUTAWAY_ONLY');
      const bed=this.box(cut,[.055,.10,2.36],[L.cutPoint[0]-.015,L.cutPoint[1]-.045,0],'steel',.002,{detail:true,role:'stationary-bed-knife',sourceAnchor:'HSM56_FLAT_BED_KNIFE__MAXSON_STATIONARY_BED_KNIFE',cutawayOnly:true},[0,.018,0]);
      bed.userData.knifeType='STATIONARY_BED_KNIFE';
      const revolver=this.cyl(cut,.235,2.38,[L.cutPoint[0]+.235,L.cutPoint[1]+.095,0],'dark','z',{active:true,motion:'fly-knife-revolver',detail:true,role:'fly-knife-revolver',sourceAnchor:'HSM56_FLAT_BED_KNIFE__MAXSON_STATIONARY_BED_KNIFE',cutawayOnly:true});
      revolver.userData.kinematicGroup='CUTTER_SYNC';revolver.userData.cutsPerRevolution=1;revolver.userData.cutPhaseOffset=0;
      const blade=this.box(revolver,[.055,.10,2.30],[-.232,0,0],'steel',.002,{detail:true,role:'fly-knife-blade',sourceAnchor:'MAXSON_TANGENTIAL_REVOLVER_BLADE',cutawayOnly:true},[0,.018,0]);
      blade.userData.knifeType='ROTARY_FLY_KNIFE';
      this.box(revolver,[.028,.030,2.32],[-.258,-.045,0],'chrome',.001,{detail:true,role:'fly-knife-cutting-edge',sourceAnchor:'MAXSON_TANGENTIAL_REVOLVER_BLADE',cutawayOnly:true},[0,.018,0]);
      for(const side of [-1,1])this.cyl(cut,.075,.12,[L.cutPoint[0]+.235,L.cutPoint[1]+.095,side*1.24],'bodyDark','z',{detail:true,role:'fly-knife-revolver-bearing',sourceAnchor:'MAXSON_STATIONARY_BED_KNIFE',cutawayOnly:true});

      // Take-away pinch references keep the web taut through the shear and bridge to high-speed tapes.
      const pinch=this.group(knife,'sheeting-cut-takeaway-pinch','Cutter Take-Away Pinch Reference',[0,0,0],[0,.10,0],'PROCESS_FAMILY_REFERENCE__CUTAWAY_ONLY');
      for(const [y,sign] of [[L.cutPoint[1]+.075,-1],[L.cutPoint[1]-.075,1]]){
        const r=this.cyl(pinch,.055,2.30,[L.cutPoint[0]-.22,y,0],'chrome','z',{active:true,motion:'cutter-takeaway-pinch',detail:true,role:'cutter-takeaway-pinch-roll',sourceAnchor:'MAXSON_TAPE_TAKEAWAY_PINCH',cutawayOnly:true});
        r.userData.kinematicGroup='CUTTER_TAKEAWAY';r.userData.rotationSign=sign;
      }
    }

    this.root.userData.processFlow={
      ...this.root.userData.processFlow,
      process:'RIGHT → LEFT · reel → deep web-carrier loops → draw roll → guarded stationary-bed/fly-knife family cross-cut → high-speed take-away gap → slow-speed overlap/shingling → rack stacker',
      feedArchitecture:'PHOTO_VISIBLE_LONG_WEB_CARRIER__DEEP_ALTERNATING_LOOP_ROLLS__OPEN_RECTANGULAR_SUPPORT_FRAME',
      cutterArchitecture:'HSM56_FLAT_BED_KNIFE_FAMILY__STATIONARY_BED_KNIFE_PLUS_ROTARY_FLY_KNIFE_CUTAWAY_ONLY__BMJ_EXACT_INTERNAL_GEOMETRY_UNRESOLVED',
      deliveryKinematics:'ATTACHED_LEADER_AT_WEB_SPEED__DETACHED_SHEET_HIGH_SPEED_GAP__DECEL_TO_SLOW_TAPE__SHINGLED_OVERLAP__STACK_SETTLE',
      geometryBoundary:'BMJ_PHOTOS_PRIMARY_EXTERIOR__HSM56_MAXSON_ONLY_FOR_GUARDED_CUTTER_AND_DELIVERY_PROCESS'
    };
  }

  enrichActualV196(){
    this.root.userData.researchVersion='V196';
    this.root.userData.researchSourceCount=V122_SOURCE_STATS.total;
    this.root.userData.detailPass='V196_TRUE_WEB_CUT_GAP_OVERLAP_STACK_KINEMATICS';
    this.root.userData.installedOptionBoundary='BMJ photos remain primary for all exposed hardware. V196 adds a photo-visible overhead web carrier and uses HSM56/Maxson evidence only for guarded stationary-bed/fly-knife mechanics and high-speed-to-slow-speed delivery behavior.';
    this.root.userData.primaryVisualEvidence='BMJ_USER_PHOTOSET_20260922_IMG_2479_TO_IMG_2487';
    this.root.userData.familyEvidenceRole='GUARDED_FLAT_BED_KNIFE__TAKEAWAY_GAP__OVERLAP_KINEMATICS';
    this.root.userData.geometryCorrections=[
      'long photo-visible web carrier restored as independent assembly',
      'infeed roller loop made deeper to match actual threaded web',
      'open rectangular loop-frame uprights and rails added',
      'stationary bed knife and rotary fly knife added cutaway-only',
      'cutter take-away pinch reference added cutaway-only',
      'normal exterior still hides all undocumented cutter internals'
    ];
  }

  buildActualV193(){
    // V193 exterior truth hierarchy:
    // 1) user-provided BMJ HSM-CTM7 photos (22 Sep 2026) are PRIMARY for visible geometry;
    // 2) BMJ database/user-confirmed RIGHT->LEFT fixes identity and process orientation;
    // 3) HSM 56/OEM-family material is only used for process relationships hidden by guards.
    // No visible flat-bed blade, slitter bank, vacuum box or rigid tower is invented when it is absent from the BMJ photos.

    const photo='BMJ-SHEETING-PHOTOSET-20260922';
    const structure=this.group(this.root,'sheeting-structure','Grounded Open Main Chassis',[0,0,0],[0,-.18,0],'VERIFIED_VISUAL');
    for(const z of [-1.55,1.55])this.box(structure,[17.8,.15,.16],[.15,.075,z],'dark',.018,{role:'main-rail',sourceAnchor:photo});
    for(const x of [-7.8,-6.7,-5.6,-4.5,-3.4,-2.3,-1.2,-.1,1.0,2.1,3.2,4.3,5.4,6.5,7.6,8.5]){
      this.box(structure,[.12,.13,3.08],[x,.065,0],'steel',.010,{detail:true,role:'cross-member',sourceAnchor:photo});
      for(const z of [-1.57,1.57])this.box(structure,[.20,.07,.22],[x,.035,z],'dark',.008,{detail:true,role:'floor-foot',sourceAnchor:photo});
    }

    // RIGHT / input. Actual BMJ photos show a two-sided fixed stand with large swept arms:
    // one captured loaded station plus a second empty chuck position, vertical hydraulic actuators and a hose manifold.
    const rollstand=this.group(this.root,'sheeting-rollstand','BMJ Two-Sided Rollstand',[7.15,0,0],[.66,.30,0],'VERIFIED_VISUAL');
    const reel=this.group(rollstand,'sheeting-reel','Loaded Paper Reel / Expanding Chucks',[0,0,0],[.22,.16,0],'VERIFIED_VISUAL');
    const reelX=.58,reelY=.88,reelR=.82;
    const reelBody=this.cyl(reel,reelR,2.62,[reelX,reelY,0],'paper','z',{active:true,motion:'reel',role:'loaded-paper-reel',sourceAnchor:photo});
    reelBody.userData.kinematicGroup='UNWIND_REEL';reelBody.userData.referenceWebContactRadius=reelR;
    const reelCore=this.cyl(reel,.115,2.86,[reelX,reelY,0],'dark','z',{active:true,motion:'reel-core',detail:true,role:'reel-core',sourceAnchor:photo});
    reelCore.userData.kinematicGroup='UNWIND_REEL';reelCore.userData.referenceWebContactRadius=reelR;
    for(const side of [-1,1]){
      const z=side*1.45;
      const chuck=this.cyl(reel,.205,.18,[reelX,reelY,z],'body','z',{active:true,motion:'chuck',role:'loaded-chuck',sourceAnchor:photo});
      chuck.userData.kinematicGroup='UNWIND_REEL';chuck.userData.referenceWebContactRadius=reelR;
      this.cyl(reel,.075,.21,[reelX,reelY,z+side*.08],'dark','z',{detail:true,role:'chuck-center',sourceAnchor:photo});
    }
    const armPairs=[
      {x:.58,y:.88,label:'loaded'},
      {x:-1.00,y:.88,label:'empty'}
    ];
    for(const st of armPairs)for(const side of [-1,1]){
      const z=side*1.47;
      // Swept fabricated arm: lower pivot -> elbow -> chuck end.
      this.beamXY(rollstand,[-.12,.34],[st.x-.36,.57],z,.26,.28,'light',{role:st.label+'-swept-arm-lower',sourceAnchor:photo});
      this.beamXY(rollstand,[st.x-.36,.57],[st.x,st.y],z,.24,.28,'light',{role:st.label+'-swept-arm-upper',sourceAnchor:photo});
      this.cyl(rollstand,.20,.18,[st.x,st.y,z],'body','z',{detail:true,role:st.label+'-chuck-housing',sourceAnchor:photo});
      this.cyl(rollstand,.17,.25,[-.12,.34,z],'body','z',{detail:true,role:'rollstand-pivot',sourceAnchor:photo});
      // Blue vertical actuator clearly visible in the actual stand.
      this.box(rollstand,[.16,.78,.16],[st.x-.42,.42,side*1.57],'blue',.028,{detail:true,role:'vertical-hydraulic-cylinder',sourceAnchor:photo});
      this.cyl(rollstand,.035,.35,[st.x-.42,.96,side*1.57],'chrome','y',{detail:true,role:'hydraulic-rod',sourceAnchor:photo});
    }
    for(const side of [-1,1]){
      this.box(rollstand,[2.90,.16,.34],[-.20,.10,side*1.48],'light',.018,{role:'rollstand-side-base',sourceAnchor:photo});
      this.box(rollstand,[.30,.54,.30],[-.10,.31,side*1.48],'body',.022,{role:'pivot-pedestal',sourceAnchor:photo});
    }
    const manifold=this.group(rollstand,'sheeting-rollstand-manifold','Hydraulic Hose / Valve Manifold',[-.30,0,0],[.10,.10,0],'VERIFIED_VISUAL');
    this.box(manifold,[.72,.70,.40],[-.10,1.48,0],'body',.025,{cover:true,role:'hydraulic-manifold-box',sourceAnchor:photo});
    for(let i=0;i<8;i++)this.cyl(manifold,.042,.10,[-.38+i*.11,1.88,0],'dark','y',{detail:true,role:'hose-port',sourceAnchor:photo});
    for(let i=0;i<6;i++)this.torus(manifold,.10,.015,[-.28+i*.11,1.64,0],'black',{detail:true,role:'hose-loop',sourceAnchor:photo});

    // Tall narrow unwind control pedestal in the BMJ photos.
    const unwindPanel=this.group(rollstand,'sheeting-unwind-panel','Unwind Pneumatic / Hydraulic Control Pedestal',[-.48,0,-1.82],[.10,.12,-.18],'VERIFIED_VISUAL');
    this.box(unwindPanel,[.58,1.36,.36],[0,.73,0],'body',.030,{cover:true,role:'unwind-control-cabinet',sourceAnchor:photo});
    for(let i=0;i<6;i++){
      this.cyl(unwindPanel,.045,.025,[-.18+(i%2)*.22,1.08-Math.floor(i/2)*.22,-.20],i<2?'dark':'black','z',{detail:true,role:'unwind-selector',sourceAnchor:photo});
      this.cyl(unwindPanel,.028,.026,[-.18+(i%2)*.22,1.08-Math.floor(i/2)*.22,-.23],i%3===0?'red':'green','z',{detail:true,role:'unwind-indicator',sourceAnchor:photo});
    }

    // Actual open multi-roller bridge. This replaces V68's compact four-roller inclined frame.
    const feed=this.group(this.root,'sheeting-feed','Open Multi-Roller Web Guide Bridge',[4.95,0,0],[.45,.36,0],'VERIFIED_VISUAL');
    const feedFrame=this.group(feed,'sheeting-feed-frame','Long Open Two-Sided Roller Frame',[0,0,0],[.12,.10,0],'VERIFIED_VISUAL');
    for(const z of [-1.43,1.43]){
      for(const x of [-1.42,1.42])this.box(feedFrame,[.19,2.36,.20],[x,1.18,z],'light',.018,{role:'roller-frame-upright',sourceAnchor:photo});
      this.box(feedFrame,[3.05,.20,.22],[0,2.31,z],'light',.016,{role:'roller-frame-top-beam',sourceAnchor:photo});
      this.beamXY(feedFrame,[-1.42,.45],[1.42,1.08],z,.16,.20,'light',{role:'roller-frame-lower-brace',sourceAnchor:photo});
    }
    this.box(feedFrame,[.20,.18,3.00],[-1.42,2.28,0],'body',.014,{role:'bridge-cross-member',sourceAnchor:photo});
    this.box(feedFrame,[.20,.18,3.00],[1.42,2.28,0],'body',.014,{role:'bridge-cross-member',sourceAnchor:photo});

    const feedRollers=this.group(feed,'sheeting-feed-rollers','Actual Open Guide / Tension Roller Bank',[0,0,0],[.06,.10,0],'VERIFIED_VISUAL');
    const rollerSpec=[
      [1.30,1.55,.095],[.92,2.02,.105],[.48,1.73,.095],[.06,1.38,.105],
      [-.38,1.96,.095],[-.82,1.53,.110],[-1.18,1.10,.105]
    ];
    for(const [x,y,r] of rollerSpec){
      const rr=this.roller(feedRollers,x,y,r,{span:2.62,kind:'chrome',motion:'guide-roller',bearings:false,sourceAnchor:photo});
      rr.userData.kinematicGroup='WEB_CONTACT';
      for(const side of [-1,1])this.box(feedRollers,[.19,.21,.13],[x,y,side*1.38],'bodyDark',.012,{detail:true,role:'roller-bearing-block',sourceAnchor:photo});
    }
    // Visible low turquoise roller at floor level.
    const lowRoll=this.cyl(feedRollers,.145,2.66,[-.55,.42,0],'body','z',{active:true,motion:'guide-roller',role:'low-turquoise-guide-roller',sourceAnchor:photo});
    lowRoll.userData.kinematicGroup='WEB_CONTACT';

    const epc=this.group(feed,'sheeting-epc','Edge Guide Sensor / Web Alignment Reference',[-.92,0,0],[.05,.08,0],'PROCESS_FAMILY_REFERENCE');
    this.box(epc,[.72,.10,2.34],[0,.88,0],'steel',.008,{detail:true,role:'edge-guide-crossbar',sourceAnchor:photo});
    for(const side of [-1,1])this.box(epc,[.12,.28,.12],[0,.77,side*.92],'bodyDark',.009,{detail:true,role:'edge-guide-head',sourceAnchor:photo});

    // Enclosed LEXUS cutter/main-drive body exactly follows the BMJ exterior: large teal cabinet,
    // long silver viewing panel/window and exposed entry nip/roller train. Internal knife geometry is intentionally hidden.
    const head=this.group(this.root,'sheeting-cutter','LEXUS Enclosed Main Cutter / Drive Cabinet',[2.05,0,0],[0,.52,0],'VERIFIED_VISUAL');
    this.box(head,[2.45,2.40,3.02],[0,1.22,0],'body',.045,{cover:true,role:'main-cutter-cabinet',sourceAnchor:photo});
    this.box(head,[2.20,.25,3.10],[-.06,2.47,0],'bodyDark',.030,{cover:true,role:'cutter-top-cap',sourceAnchor:photo});
    this.box(head,[.62,1.52,.20],[1.45,1.08,-1.48],'body',.030,{cover:true,role:'input-side-guard-box',sourceAnchor:photo});
    this.box(head,[.60,1.34,.20],[-1.42,1.00,-1.48],'body',.030,{cover:true,role:'output-side-guard-box',sourceAnchor:photo});

    const window=this.group(head,'sheeting-window','LEXUS Long Inspection Window / Brand Panel',[0,0,0],[0,.12,-.18],'VERIFIED_VISUAL');
    this.box(window,[1.72,.62,.055],[-.10,1.69,-1.545],'light',.012,{cover:true,role:'inspection-panel-frame',sourceAnchor:photo});
    this.box(window,[1.48,.39,.025],[-.10,1.70,-1.585],'glass',.006,{cover:true,role:'long-inspection-window',sourceAnchor:photo});
    const brand=this.box(window,[.58,.22,.030],[.24,1.69,-1.625],'white',.005,{cover:true,detail:true,role:'lexus-brand-plate',sourceAnchor:photo});
    brand.userData.label='LEXUS';

    const process=this.group(head,'sheeting-main-rollers','Main Infeed / Draw / Nip Roller Train',[0,0,0],[0,.20,0],'VERIFIED_VISUAL');
    const headRolls=[
      [1.42,1.18,.17,'input-nip-roller'],
      [1.06,.88,.13,'lower-input-roller'],
      [.66,1.35,.16,'main-draw-roller'],
      [.15,.90,.12,'cutter-transfer-roller'],
      [-.92,.88,.11,'cutter-exit-roller']
    ];
    for(const [x,y,r,role] of headRolls){
      const rr=this.cyl(process,r,2.58,[x,y,0],role==='main-draw-roller'?'dark':'chrome','z',{active:true,motion:role==='main-draw-roller'?'draw-roller':'pull-roller',role,sourceAnchor:photo});
      rr.userData.kinematicGroup='WEB_CONTACT';
      for(const side of [-1,1])this.box(process,[.20,.22,.13],[x,y,side*1.36],'bodyDark',.014,{detail:true,role:'head-bearing-block',sourceAnchor:photo});
    }

    // Taxonomy keeps a selectable cut-zone node, but there is deliberately no visible blade mesh.
    const knife=this.group(head,'sheeting-knife','Internal Cross-Cut Zone · Guarded',[0,0,0],[0,.18,0],'VERIFIED_VISUAL__INTERNAL_MECHANISM_UNRESOLVED');
    knife.userData.visibleKnifeGeometry=false;
    knife.userData.evidenceBoundary='Actual BMJ photos show the cutter behind the LEXUS enclosure. Blade type/stroke is not exposed, therefore V193 does not render a fictional blade.';
    const transport=this.group(head,'sheeting-cutter-transport','Cutter Entry / Exit Apron',[0,0,0],[0,.10,0],'VERIFIED_VISUAL');
    this.box(transport,[2.32,.10,2.65],[-.05,.66,0],'steel',.012,{role:'cutter-apron',sourceAnchor:photo});
    for(const z of [-1.06,-.79,-.52,-.25,.02,.29,.56,.83,1.10])this.box(transport,[2.18,.022,.048],[-.05,.725,z],'black',.002,{detail:true,role:'cutter-apron-strip',sourceAnchor:photo});

    // Long open delivery table from actual photos: green belt field, polished shafts/rollers,
    // white hold-down wheels, multiple black handwheels and adjustable crossrails.
    const delivery=this.group(this.root,'sheeting-delivery','Open Belt Delivery / Alignment Table',[-1.05,0,0],[-.58,.36,0],'VERIFIED_VISUAL');
    for(const z of [-1.42,1.42]){
      this.box(delivery,[5.15,.22,.18],[0,.52,z],'light',.018,{role:'delivery-side-rail',sourceAnchor:photo});
      for(const x of [-2.35,-1.30,-.25,.80,1.85,2.35])this.box(delivery,[.12,.52,.12],[x,.25,z],'steel',.008,{role:'delivery-leg',sourceAnchor:photo});
    }
    this.box(delivery,[5.02,.08,2.68],[0,.76,0],'steel',.010,{role:'open-delivery-bed',sourceAnchor:photo});

    const fastBelts=this.group(delivery,'sheeting-fast-belts','Upstream Green Belt Zone',[0,0,0],[0,.05,0],'VERIFIED_VISUAL');
    const slowBelts=this.group(delivery,'sheeting-slow-belts','Mid Delivery Belt Zone',[0,0,0],[0,.05,0],'VERIFIED_VISUAL');
    const overlapBelts=this.group(delivery,'sheeting-overlap-belts','Downstream Alignment Belt Zone',[0,0,0],[0,.05,0],'VERIFIED_VISUAL');
    const beltZ=[];for(let z=-1.20;z<=1.201;z+=.16)beltZ.push(+z.toFixed(2));
    for(const z of beltZ){
      this.box(fastBelts,[1.60,.022,.052],[1.65,.815,z],'body',.002,{detail:true,role:'fast-transport-belt',sourceAnchor:photo});
      this.box(slowBelts,[1.45,.022,.052],[.12,.815,z],'body',.002,{detail:true,role:'slow-transport-belt',sourceAnchor:photo});
      this.box(overlapBelts,[1.80,.022,.052],[-1.58,.815,z],'body',.002,{detail:true,role:'overlap-transport-belt',sourceAnchor:photo});
    }

    const deliveryRollers=this.group(delivery,'sheeting-delivery-rollers','Delivery Roller / Shaft Set',[0,0,0],[0,.07,0],'VERIFIED_VISUAL');
    for(const [x,r,zone] of [[2.34,.10,'FAST'],[1.05,.075,'FAST'],[-.55,.075,'SLOW'],[-2.18,.10,'OVERLAP']]){
      const rr=this.cyl(deliveryRollers,r,2.66,[x,.86,0],'chrome','z',{active:true,motion:'delivery-roller',role:'transport-roller',sourceAnchor:photo});
      rr.userData.kinematicGroup='CUT_SHEET_TRANSPORT';rr.userData.transportZone=zone;
    }

    const overlap=this.group(delivery,'sheeting-overlap','Crossrail / Hold-Down Wheel Assemblies',[0,0,0],[0,.12,0],'VERIFIED_VISUAL');
    const railX=[1.55,.55,-.55,-1.60];
    for(const [i,x] of railX.entries()){
      this.cyl(overlap,.032,2.80,[x,1.04,0],'chrome','z',{detail:true,role:'adjustment-crossrail',sourceAnchor:photo});
      for(const z of [-.92,-.46,0,.46,.92]){
        this.cyl(overlap,.095,.045,[x,1.00,z],'white','z',{detail:true,role:'white-hold-down-wheel',sourceAnchor:photo});
        this.box(overlap,[.12,.20,.10],[x,1.13,z],'bodyDark',.006,{detail:true,role:'wheel-holder',sourceAnchor:photo});
      }
    }
    const handwheel=this.group(delivery,'sheeting-outfeed-handwheel','Actual Delivery Adjustment Handwheels',[0,0,-1.57],[0,.08,-.12],'VERIFIED_VISUAL');
    for(const [x,y,r] of [[1.55,.72,.17],[-.15,.73,.18],[-1.70,.76,.19]]){
      this.torus(handwheel,r,.025,[x,y,0],'black',{detail:true,role:'outfeed-handwheel',sourceAnchor:photo});
      this.cyl(handwheel,.035,.10,[x,y,.02],'dark','z',{detail:true,role:'handwheel-hub',sourceAnchor:photo});
      for(let i=0;i<3;i++){
        const a=i*Math.PI*2/3;
        this.box(handwheel,[r*1.55,.026,.022],[x+Math.cos(a)*r*.30,y+Math.sin(a)*r*.30,0],'dark',.002,{detail:true,role:'handwheel-spoke',sourceAnchor:photo},[0,0,a]);
      }
    }

    // Broad sloped operator console captured at the delivery side.
    const control=this.group(this.root,'sheeting-control','BMJ Delivery Operator Console',[-.35,0,-1.88],[.18,.24,-.26],'VERIFIED_VISUAL');
    this.box(control,[1.78,.62,.52],[0,.35,0],'light',.030,{cover:true,role:'operator-console-base',sourceAnchor:photo});
    this.box(control,[1.66,.08,.46],[0,.69,-.08],'steel',.010,{cover:true,role:'operator-console-face',sourceAnchor:photo},[-.42,0,0]);
    this.box(control,[.32,.035,.24],[.18,.735,-.28],'dark',.004,{detail:true,role:'operator-display',sourceAnchor:photo},[-.42,0,0]);
    const buttonKinds=['green','black','red','black','green','black','black','red','green','black','black','green'];
    buttonKinds.forEach((kind,i)=>{
      const row=Math.floor(i/6),col=i%6;
      this.cyl(control,.032,.030,[-.62+col*.22,.76-row*.16,-.295],kind,'z',{detail:true,role:'operator-button-selector',sourceAnchor:photo});
    });

    // LEFT/output: actual open stack/lay table, adjustable rails and pile. No invented tall mesh tower.
    const layboy=this.group(this.root,'sheeting-layboy','Open Stack / Lay Table',[-4.90,0,0],[-.44,.30,0],'VERIFIED_VISUAL');
    for(const z of [-1.42,1.42]){
      this.box(layboy,[2.55,.22,.18],[0,.50,z],'light',.016,{role:'stack-table-side-rail',sourceAnchor:photo});
      for(const x of [-1.05,0,1.05])this.box(layboy,[.12,.50,.12],[x,.25,z],'steel',.008,{role:'stack-table-leg',sourceAnchor:photo});
    }
    this.box(layboy,[2.44,.10,2.62],[0,.61,0],'steel',.010,{role:'stack-table-deck',sourceAnchor:photo});
    const joggers=this.group(layboy,'sheeting-stacker-joggers','Manual Stack Guide / Backstop Assemblies',[0,0,0],[0,.06,0],'VERIFIED_VISUAL');
    this.box(joggers,[.10,.74,2.25],[-1.00,.98,0],'light',.010,{detail:true,role:'fixed-front-stop',sourceAnchor:photo});
    this.box(joggers,[.10,.62,2.18],[1.00,.91,0],'light',.010,{detail:true,role:'adjustable-backstop',sourceAnchor:photo});
    for(const side of [-1,1])this.box(joggers,[1.70,.54,.065],[0,.88,side*1.08],'light',.008,{detail:true,role:'manual-side-guide',sourceAnchor:photo});
    for(const [x,z] of [[-.72,-1.54],[.72,-1.54]]){
      this.torus(joggers,.18,.026,[x,1.10,z],'black',{detail:true,role:'stack-guide-handwheel',sourceAnchor:photo});
      this.cyl(joggers,.035,.10,[x,1.10,z+.03],'dark','z',{detail:true,role:'stack-guide-handwheel-hub',sourceAnchor:photo});
    }

    const lift=this.group(layboy,'sheeting-stack-lift','Flat Plate Lift / Stack Surface',[0,0,0],[0,.10,0],'FAMILY_PROCESS_REFERENCE__PHOTO_POSITION_ANCHORED');
    for(const z of [-1.16,1.16])this.box(lift,[2.16,.10,.10],[0,.47,z],'dark',.008,{detail:true,role:'lift-support-rail',sourceAnchor:photo});
    this.box(lift,[2.12,.12,2.36],[0,.59,0],'steel',.010,{active:true,motion:'lift-table',role:'lift-table',sourceAnchor:photo});
    const refStack=this.group(lift,'sheeting-reference-stack','Captured Reference Paper Pile',[0,0,0],[0,.06,0],'VERIFIED_VISUAL');
    this.box(refStack,[1.80,.38,2.10],[0,.84,0],'stackPaper',.008,{role:'reference-paper-block',sourceAnchor:photo,referenceStack:true});
    for(let i=0;i<8;i++)this.box(refStack,[1.82,.010,2.12],[0,.66+i*.047,0],'paper',.001,{detail:true,role:'reference-paper-seam',sourceAnchor:photo,referenceStack:true});
    this.box(refStack,[1.82,.024,2.12],[0,1.04,0],'paper',.002,{detail:true,role:'reference-paper-top',sourceAnchor:photo,referenceStack:true});

    // Actual catwalk/steps beside the cutter and delivery.
    const access=this.group(this.root,'sheeting-access','Operator Catwalk / Tread Steps',[1.05,0,1.82],[0,.20,.24],'VERIFIED_VISUAL');
    this.box(access,[3.20,.13,.78],[-.25,.48,0],'steel',.012,{detail:true,role:'diamond-plate-catwalk',sourceAnchor:photo});
    for(let i=0;i<3;i++)this.box(access,[.72,.11,.72],[1.72-i*.18,.10+i*.13,0],'steel',.008,{detail:true,role:'access-step',sourceAnchor:photo});
    for(const x of [-1.70,1.10])this.box(access,[.08,1.05,.08],[x,1.00,.34],'body',.008,{detail:true,role:'catwalk-post',sourceAnchor:photo});
    this.box(access,[2.88,.07,.07],[-.30,1.52,.34],'body',.006,{detail:true,role:'catwalk-handrail',sourceAnchor:photo});

    this.root.userData.processFlow={
      input:'RIGHT · two-sided fixed rollstand captured in BMJ photos; one loaded reel and one empty chuck station are modeled',
      process:'RIGHT → LEFT · loaded reel → open multi-roller guide/tension bridge → guarded LEXUS cutter/main-drive cabinet → open green-belt delivery/alignment table → open stack/lay table',
      output:'LEFT · open adjustable stack/lay table with captured paper pile',
      idleWebGeometry:'REFERENCE_STACK_VISIBLE__MOVING_WEB_ONLY_DURING_SIMULATION',
      direction:'RIGHT_TO_LEFT',
      visualBasis:'BMJ_USER_PHOTOSET_20260922_PRIMARY__HSM_FAMILY_PROCESS_ONLY_WHERE_INTERNALS_ARE_GUARDED',
      cutterArchitecture:'INTERNAL_GUARDED__ACTUAL_BMJ_PHOTOS_DO_NOT_EXPOSE_BLADE_TYPE_OR_STROKE__NO_VISIBLE_BLADE_IN_V193',
      mainTransportFunction:'ACTUAL_OPEN_ROLLER_BANK_AND_NIP_ROLLS__WEB_PATH_PHOTO_ANCHORED',
      windowArchitecture:'ACTUAL_LONG_LEXUS_INSPECTION_WINDOW_IN_ENCLOSED_CABINET',
      unwindArchitecture:'ACTUAL_TWO_SIDED_FIXED_STAND__SWEPT_ARMS__VERTICAL_HYDRAULIC_ACTUATORS__ONE_CAPTURED_LOADED_STATION',
      exactModelSearch:'HSM_CTM7_EXACT_PUBLIC_OEM_DRAWING_NOT_FOUND__ACTUAL_BMJ_PHOTOS_OVERRIDE_FAMILY_SILHOUETTE',
      transportZones:'PHOTO_ANCHORED_OPEN_BELT_FIELD__PROCESS_TIMING_FAST_SLOW_ALIGNMENT_REMAINS_FAMILY_REFERENCE',
      stackerArchitecture:'ACTUAL_OPEN_LAY_TABLE__NO_V68_RIGID_TOWER'
    };
  }

  enrichActualV193(){
    this.root.userData.researchVersion='V193';
    this.root.userData.researchSourceCount=V122_SOURCE_STATS.total;
    this.root.userData.detailPass='V193_BMJ_ACTUAL_PHOTO_GEOMETRY_FIRST';
    this.root.userData.installedOptionBoundary='Visible geometry follows the 22 Sep 2026 BMJ photo set. Unseen cutter internals, slitter/vacuum options and automated jogger actuation are not rendered as installed hardware.';
    this.root.userData.primaryVisualEvidence='BMJ_USER_PHOTOSET_20260922_IMG_2479_TO_IMG_2487';
    this.root.userData.familyEvidenceRole='PROCESS_AND_SPEC_CORROBORATION_ONLY';
  }

  build(){
    // V68 keeps the photo-anchored HSM56 silhouette and makes the dominant turquoise drum functional in the simulated web path.
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
    const reelBody=this.cyl(reel,.78,2.58,[-.12,.82,0],'paper','z',{active:true,motion:'reel',role:'reel',sourceAnchor:'BW-HSM56-ROLLSTAND-INSET'});reelBody.userData.kinematicGroup='UNWIND_REEL';reelBody.userData.referenceWebContactRadius=.78;
    const reelCore=this.cyl(reel,.115,2.82,[-.12,.82,0],'dark','z',{active:true,motion:'reel-core',detail:true,role:'reel-core',sourceAnchor:'BW-HSM56-ROLLSTAND-INSET'});reelCore.userData.kinematicGroup='UNWIND_REEL';reelCore.userData.referenceWebContactRadius=.78;
    for(const side of [-1,1]){
      const z=side*1.38;
      {const chuck=this.cyl(reel,.215,.12,[-.12,.82,z],'body','z',{active:true,motion:'chuck',role:'chuck-hub',sourceAnchor:'BW-HSM56-ROLLSTAND-INSET'});chuck.userData.kinematicGroup='UNWIND_REEL';chuck.userData.referenceWebContactRadius=.78;}
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

    // Main head: the operator-side window is a true aperture. V64 incorrectly placed glass over a full opaque side slab.
    const head=this.group(this.root,'sheeting-cutter','Windowed Main Sheeting Head',[2.65,0,0],[0,.58,0]);
    // Drive side remains a full guarded shell.
    this.box(head,[2.72,1.76,.28],[0,.94,1.50],'body',.048,{cover:true,role:'drive-side-shell',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
    this.box(head,[2.44,.23,.11],[-.03,.43,1.68],'bodyDark',.018,{cover:true,role:'drive-lower-trim'});
    // Operator side is built as lower cabinet + jambs/sills, leaving the actual inspection opening hollow.
    this.box(head,[2.72,.74,.28],[0,.57,-1.50],'body',.045,{cover:true,role:'operator-lower-housing',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
    for(const x of [-1.29,1.21])this.box(head,[.20,.92,.28],[x,1.61,-1.50],'body',.026,{cover:true,role:'operator-window-jamb',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
    this.box(head,[2.48,.16,.28],[-.04,1.16,-1.50],'light',.018,{cover:true,role:'operator-window-lower-sill',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
    this.box(head,[2.48,.13,.28],[-.04,2.07,-1.50],'light',.018,{cover:true,role:'operator-window-upper-sill',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
    this.box(head,[2.44,.23,.11],[-.03,.31,-1.68],'bodyDark',.018,{cover:true,role:'operator-lower-trim'});
    this.box(head,[2.82,.40,3.16],[0,2.22,0],'light',.048,{cover:true,role:'main-top-hood',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
    // Glass sits in the aperture with no opaque backing and has its own selectable taxonomy node.
    const window=this.group(head,'sheeting-window','Panoramic Inspection Window Assembly',[0,0,0],[0,.18,-.22]);
    this.box(window,[2.42,.78,.035],[-.04,1.62,-1.655],'glass',.012,{cover:true,role:'panoramic-window',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
    for(const x of [-1.23,1.15])this.box(window,[.08,.84,.07],[x,1.62,-1.69],'light',.008,{cover:true,role:'window-frame'});
    for(const y of [1.21,2.03])this.box(window,[2.46,.07,.07],[-.04,y,-1.69],'light',.008,{cover:true,role:'window-frame'});
    for(const x of [-.62,.58])this.box(window,[.36,.06,.07],[x,1.16,-1.73],'black',.018,{cover:true,detail:true,role:'window-handle',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});

    const process=this.group(head,'sheeting-main-rollers','Main Draw / Traction Drum Family Reference',[0,0,0],[0,.22,0],'PROCESS_FAMILY_REFERENCE');
    // The drum silhouette/bands are directly photo-anchored. Its draw/traction function is a process-family inference:
    // BW sheeter controls document a draw-drum encoder tied to sheet length/squaring, while Unico/Maxson document draw-roll/drum coordination with cutter and tapes.
    {const drum=this.cyl(process,.425,2.56,[.12,1.64,0],'aqua','z',{active:true,motion:'draw-drum-reference',role:'main-draw-traction-drum',sourceAnchor:'BW-HSM56-MAIN-PHOTO__BW_UNICO_MAXSON_DRAW_DRUM_PROCESS_REFERENCE'});drum.userData.kinematicGroup='WEB_CONTACT';}
    for(const z of [-.90,-.30,.30,.90])this.torus(process,.428,.026,[.12,1.64,z],'white',{detail:true,role:'process-cylinder-band',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
    for(const side of [-1,1])this.cyl(process,.255,.065,[.12,1.64,side*1.31],'dark','z',{detail:true,role:'process-cylinder-endcap',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
    // Lower transport rollers are visible/mechanically required but deliberately subordinate.
    {const r=this.cyl(process,.105,2.52,[.86,1.02,0],'chrome','z',{active:true,motion:'pull-roller',role:'head-infeed-roller'});r.userData.kinematicGroup='WEB_CONTACT';}
    {const r=this.cyl(process,.105,2.52,[-.92,.92,0],'chrome','z',{active:true,motion:'pull-roller',role:'head-outfeed-roller'});r.userData.kinematicGroup='WEB_CONTACT';}
    for(const x of [.86,-.92])for(const side of [-1,1])this.box(process,[.19,.20,.12],[x,x>0?1.02:.92,side*1.30],'bodyDark',.013,{detail:true,role:'head-roller-bearing'});
    // Repeating guides/fingers are visible just under the window.
    for(const z of [-1.05,-.82,-.59,-.36,-.13,.10,.33,.56,.79,1.02])this.box(process,[.28,.045,.055],[-.28,1.13,z],'dark',.004,{detail:true,role:'window-guide-finger',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});

    const knife=this.group(head,'sheeting-knife','Flat-Bed Knife Family Reference',[-.30,0,0],[0,.24,0],'FAMILY_REFERENCE__EXACT_HSM_CTM7_UNRESOLVED');
    // BW's 2014 HSM 56 brochure explicitly states "Flat Bed Knife".
    // V67 therefore shows a visible reciprocating knife assembly during simulation,
    // while keeping its exact HSM-CTM7 stroke/actuation geometry unresolved.
    this.box(knife,[.16,.13,2.40],[-.12,1.52,0],'bodyDark',.010,{detail:true,active:true,motion:'flat-bed-blade-reference',role:'knife-carrier',sourceAnchor:'BW-HSM56-FLAT-BED-KNIFE'});
    this.box(knife,[.050,.55,2.30],[-.12,1.23,0],'steel',.004,{detail:true,active:true,motion:'flat-bed-blade-reference',role:'visible-flat-bed-blade',sourceAnchor:'BW-HSM56-FLAT-BED-KNIFE'});
    this.box(knife,[.062,.030,2.32],[-.12,.945,0],'chrome',.002,{detail:true,active:true,motion:'flat-bed-blade-reference',role:'knife-cutting-edge',sourceAnchor:'BW-HSM56-FLAT-BED-KNIFE'});
    this.box(knife,[.12,.085,2.34],[-.12,.835,0],'dark',.005,{detail:true,role:'knife-anvil-reference',sourceAnchor:'BW-HSM56-FLAT-BED-KNIFE'});
    for(const side of [-1,1])this.box(knife,[.24,.78,.16],[-.12,1.20,side*1.23],'bodyDark',.012,{detail:true,role:'knife-guide-block',sourceAnchor:'BW-HSM56-FLAT-BED-KNIFE'});

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
    // Generic sheeter process references consistently separate fast tape, slow tape and overlap zones.
    // V66 exposes those zones without changing the photo-anchored external silhouette.
    const fastBelts=this.group(delivery,'sheeting-fast-belts','Fast Tape Separation Zone',[0,0,0],[0,.06,0],'PROCESS_FAMILY_REFERENCE');
    const slowBelts=this.group(delivery,'sheeting-slow-belts','Slow Tape Transfer Zone',[0,0,0],[0,.06,0],'PROCESS_FAMILY_REFERENCE');
    const overlapBelts=this.group(delivery,'sheeting-overlap-belts','Overlap Tape Zone',[0,0,0],[0,.06,0],'PROCESS_FAMILY_REFERENCE');
    for(const z of beltZ){
      this.box(fastBelts,[1.25,.024,.045],[1.34,.817,z],'black',.002,{detail:true,role:'fast-transport-belt',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
      this.box(slowBelts,[.78,.024,.045],[.35,.817,z],'black',.002,{detail:true,role:'slow-transport-belt',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
      this.box(overlapBelts,[1.95,.024,.045],[-1.04,.817,z],'black',.002,{detail:true,role:'overlap-transport-belt',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
    }
    const deliveryRollers=this.group(delivery,'sheeting-delivery-rollers','Outfeed Entry / Exit Rollers',[0,0,0],[0,.08,0]);
    for(const x of [1.95,-1.95]){
      {const r=this.cyl(deliveryRollers,.082,2.54,[x,.86,0],'chrome','z',{active:true,motion:'delivery-roller',role:'transport-roller'});r.userData.kinematicGroup='CUT_SHEET_TRANSPORT';r.userData.transportZone=x>0?'FAST':'OVERLAP';}
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
    // Large operator-side handwheel/adjuster visible in the BW main photograph.
    const handwheel=this.group(delivery,'sheeting-outfeed-handwheel','Operator Outfeed Handwheel',[-.56,0,-1.56],[0,.08,-.12]);
    this.torus(handwheel,.145,.024,[0,.59,0],'chrome',{detail:true,role:'outfeed-handwheel',sourceAnchor:'BW-HSM56-MAIN-PHOTO'});
    this.cyl(handwheel,.036,.10,[0,.59,.025],'dark','z',{detail:true,role:'handwheel-hub'});
    for(let i=0;i<4;i++){
      const a=i*Math.PI/2;
      this.box(handwheel,[.19,.025,.020],[Math.cos(a)*.072,.59+Math.sin(a)*.072,0],'chrome',.003,{detail:true,role:'handwheel-spoke'},[0,0,a]);
    }

    // Compact sloped console integrated beside the outfeed/head transition.
    const control=this.group(this.root,'sheeting-control','Integrated Low Operator Console',[.55,0,-1.90],[.18,.28,-.28]);
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
    // Process-family stack alignment references: front/back stop and side jogger blades.
    // These are not claimed as exact HSM-CTM7 hardware; they exist to make the stacker process mechanically coherent.
    const joggers=this.group(layboy,'sheeting-stacker-joggers','Stack Alignment / Jogger Reference',[0,0,0],[0,.08,0],'PROCESS_FAMILY_REFERENCE');
    this.box(joggers,[.08,.54,2.18],[-.88,.92,0],'light',.010,{detail:true,active:true,motion:'stack-jogger-x',role:'front-stop-reference'});
    this.box(joggers,[.08,.42,2.08],[.88,.84,0],'steel',.010,{detail:true,active:true,motion:'stack-jogger-x',role:'back-jog-reference'});
    for(const side of [-1,1])this.box(joggers,[1.52,.42,.055],[0,.83,side*1.08],'steel',.008,{detail:true,active:true,motion:'stack-jogger-z',role:'side-jogger-reference'});
    // Internal lift rails, table and pallet.
    const lift=this.group(layboy,'sheeting-stack-lift','Flat Lift Table / Pallet',[0,0,0],[0,.12,0]);
    for(const x of [-.80,.80])for(const z of [-1.24,1.24])this.box(lift,[.075,1.12,.075],[x,.70,z],'steel',.007,{detail:true,role:'lift-guide-rail'});
    this.box(lift,[1.96,.14,2.58],[0,.42,0],'steel',.015,{active:true,motion:'lift-table',role:'lift-table',sourceAnchor:'BW-HSM56-STACKER-PHOTO'});
    this.box(lift,[1.72,.09,2.24],[0,.535,0],'blue',.009,{active:true,motion:'lift-table',detail:true,role:'pallet',sourceAnchor:'BW-HSM56-STACKER-PHOTO'});
    const refStack=this.group(lift,'sheeting-reference-stack','Reference Paper Stack',[0,0,0],[0,.08,0],'PHOTO_REFERENCE');
    // The brochure stack is a substantial skid load, not a few floating sheets.
    this.box(refStack,[1.58,.76,2.08],[0,.965,0],'stackPaper',.010,{role:'reference-paper-block',sourceAnchor:'BW-HSM56-STACKER-PHOTO',referenceStack:true});
    for(let i=0;i<12;i++){
      const y=.625+i*.062;
      this.box(refStack,[1.60,.012,2.10],[0,y,0],'paper',.002,{detail:true,role:'reference-paper-seam',sourceAnchor:'BW-HSM56-STACKER-PHOTO',referenceStack:true});
    }
    this.box(refStack,[1.60,.055,2.10],[0,1.36,0],'paper',.004,{detail:true,role:'reference-paper-top',sourceAnchor:'BW-HSM56-STACKER-PHOTO',referenceStack:true});
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
      cutterArchitecture:'BW_HSM56_FLAT_BED_KNIFE_FAMILY_REFERENCE_VISIBLE_IN_SIMULATION__EXACT_HSM_CTM7_STROKE_AND_ACTUATION_UNRESOLVED',
      mainDrumFunction:'PROCESS_FAMILY_INFERENCE__DRAW_TRACTION_REFERENCE__WEB_WRAP_AND_LENGTH_CONTROL__EXACT_HSM_CTM7_ROLE_UNVERIFIED',
      visualBasis:'BW_2014_HSM56_VISUAL_ANCHOR__PASABAN_FAST_SLOW_OVERLAP_PROCESS_MAP__UNICO_DRAW_ROLL_CUTTER_TAPES_CONTROL__MAXSON_STACKER_LIFT_SEQUENCE',
      windowArchitecture:'TRUE_OPERATOR_SIDE_APERTURE__NO_OPAQUE_PANEL_BEHIND_GLASS',
      exactModelSearch:'NO_PUBLIC_HSM_CTM7_SPECIFIC_DRAWING_OR_PHOTO_CONFIRMED',
      transportZones:'FAST_TAPE__SLOW_TAPE__OVERLAP__STACKER_PROCESS_REFERENCE'
    };
  }
  enrichV122(){
    this.root.userData.researchVersion='V122';
    this.root.userData.researchSourceCount=V122_SOURCE_STATS.total;
    this.root.userData.detailPass='V122_WEB_TENSION_SLITTER_CUTTER_OVERLAP_STACKER';
    this.root.userData.installedOptionBoundary='HSM-CTM7 exact public drawing remains unavailable; V122 option-level internals are visibly marked PROCESS_FAMILY_REFERENCE unless photo-anchored.';
    const tag=(m,role,source='SHEETER_PROCESS_FAMILY')=>{if(!m)return m;m.userData.detail=true;m.userData.role=role;m.userData.sourceAnchor=source;this.detailMeshes.includes(m)||this.detailMeshes.push(m);return m;};

    const rollstand=this.findNode('sheeting-rollstand');
    if(rollstand){
      const brake=this.group(rollstand,'sheeting-unwind-brake-v122','Unwind Brake / Tension Reference',[0,0,0],[.12,.10,.28],'PROCESS_FAMILY_REFERENCE');
      brake.userData.installedOptionUnknown=true;
      const disc=tag(this.cyl(brake,.225,.035,[-.12,.82,1.68],'steel','z',{detail:true,role:'unwind-brake-disc',sourceAnchor:'PASABAN_MAXSON_UNWIND_REFERENCE'}),'unwind-brake-disc','PASABAN_MAXSON_UNWIND_REFERENCE');
      disc.userData.installedOptionUnknown=true;
      const cal=tag(this.box(brake,[.18,.22,.12],[-.12,.76,1.72],'dark',.014,{detail:true,role:'unwind-brake-caliper',sourceAnchor:'PASABAN_MAXSON_UNWIND_REFERENCE'}),'unwind-brake-caliper','PASABAN_MAXSON_UNWIND_REFERENCE');
      cal.userData.installedOptionUnknown=true;
      tag(this.cyl(brake,.025,.18,[.02,.76,1.76],'chrome','x',{detail:true,role:'brake-actuator-reference'}),'brake-actuator-reference');
      for(const side of [-1,1]){
        const load=tag(this.box(brake,[.16,.08,.10],[.76,.42,side*1.43],'steel',.006,{detail:true,role:'rollstand-load-cell-reference'}),'rollstand-load-cell-reference','CLOSED_LOOP_TENSION_FAMILY');
        load.userData.installedOptionUnknown=true;
      }
    }

    const feed=this.findNode('sheeting-feed');
    if(feed){
      const tension=this.group(feed,'sheeting-tension-control-v122','Web Tension / Dancer Measurement Reference',[0,0,0],[.12,.14,.22],'PROCESS_FAMILY_REFERENCE');
      tension.userData.installedOptionUnknown=true;
      for(const side of [-1,1]){
        tag(this.cyl(tension,.055,.10,[-.18,1.55,side*1.52],'dark','z',{detail:true,role:'dancer-pivot-bearing'}),'dancer-pivot-bearing');
        tag(this.box(tension,[.18,.08,.12],[-.86,1.22,side*1.32],'steel',.006,{detail:true,role:'web-tension-load-cell-reference'}),'web-tension-load-cell-reference','CLOSED_LOOP_TENSION_FAMILY');
      }
      tag(this.box(tension,[.22,.18,.16],[-.64,.78,1.50],'bodyDark',.012,{detail:true,role:'epc-actuator-reference'}),'epc-actuator-reference','EPC_FAMILY_REFERENCE');
      tag(this.cyl(tension,.022,.40,[-.56,.94,1.50],'chrome','x',{detail:true,role:'epc-actuator-rod-reference'}),'epc-actuator-rod-reference','EPC_FAMILY_REFERENCE');
    }

    const cutter=this.findNode('sheeting-cutter');
    if(cutter){
      const slitter=this.group(cutter,'sheeting-slitter-v122','Slitter Knife Bank · Installed Option Unknown',[.70,0,0],[.16,.18,.32],'PROCESS_FAMILY_REFERENCE');
      slitter.userData.installedOptionUnknown=true;
      slitter.userData.evidenceBoundary='BW/Pasaban/Maxson folio-sheeter family supports slitting before cross cut; no public evidence confirms this exact bank on BMJ HSM-CTM7.';
      for(const z of [-.78,-.39,0,.39,.78]){
        const upper=tag(this.cyl(slitter,.070,.035,[.55,1.26,z],'steel','z',{detail:true,active:true,motion:'slitter-reference',role:'upper-slitter-knife-reference',sourceAnchor:'BW_PASABAN_MAXSON_SLITTER_FAMILY'}),'upper-slitter-knife-reference','BW_PASABAN_MAXSON_SLITTER_FAMILY');
        upper.userData.installedOptionUnknown=true;
        const lower=tag(this.cyl(slitter,.060,.035,[.55,1.12,z],'dark','z',{detail:true,active:true,motion:'slitter-reference',role:'lower-slitter-knife-reference',sourceAnchor:'BW_PASABAN_MAXSON_SLITTER_FAMILY'}),'lower-slitter-knife-reference','BW_PASABAN_MAXSON_SLITTER_FAMILY');
        lower.userData.installedOptionUnknown=true;
        tag(this.box(slitter,[.12,.18,.08],[.55,1.38,z],'bodyDark',.008,{detail:true,role:'slitter-holder-reference'}),'slitter-holder-reference');
      }
      tag(this.box(slitter,[.18,.08,2.12],[.55,1.43,0],'steel',.006,{detail:true,role:'slitter-crossrail-reference'}),'slitter-crossrail-reference');
    }

    const knife=this.findNode('sheeting-knife');
    if(knife){
      knife.userData.v122Boundary='Flat-bed knife wording is HSM56 family evidence; exact HSM-CTM7 crank/servo actuation is unresolved.';
      const drive=this.group(knife,'sheeting-knife-drive-v122','Knife Drive / Guide Reference',[0,0,0],[.12,.18,.25],'PROCESS_FAMILY_REFERENCE');
      drive.userData.installedActuationUnknown=true;
      for(const side of [-1,1]){
        tag(this.cyl(drive,.065,.12,[-.45,1.49,side*1.10],'dark','z',{detail:true,role:'knife-linear-guide-bearing'}),'knife-linear-guide-bearing','HSM56_FLAT_BED_KNIFE_FAMILY');
        tag(this.box(drive,[.16,.34,.12],[-.45,1.35,side*1.10],'steel',.008,{detail:true,role:'knife-slide-block-reference'}),'knife-slide-block-reference','HSM56_FLAT_BED_KNIFE_FAMILY');
      }
      drive.userData.installedActuationUnknown=true;
      drive.userData.serviceDetails=['knife drive motor','coupling','linkage'];
      drive.userData.evidenceBoundary='Exact HSM-CTM7 knife actuation is unresolved; motor/coupling/linkage are retained as metadata rather than speculative collision-prone geometry.';
    }

    const delivery=this.findNode('sheeting-delivery');
    if(delivery){
      const vacuum=this.group(delivery,'sheeting-overlap-vacuum-v122','Vacuum Overlap / Sheet Control Reference',[-.55,0,0],[.10,.12,.20],'PROCESS_FAMILY_REFERENCE');
      vacuum.userData.installedOptionUnknown=true;
      tag(this.box(vacuum,[.82,.10,2.12],[.18,.90,0],'dark',.010,{detail:true,role:'overlap-vacuum-box-reference',sourceAnchor:'BW_VACUUM_OVERLAP_FAMILY'}),'overlap-vacuum-box-reference','BW_VACUUM_OVERLAP_FAMILY');
      for(let ix=0;ix<8;ix++)for(let iz=0;iz<8;iz++)tag(this.cyl(vacuum,.006,.008,[-.12+ix*.085,.807,-.72+iz*.205],'black','y',{detail:true,role:'overlap-vacuum-port-reference'}),'overlap-vacuum-port-reference','BW_VACUUM_OVERLAP_FAMILY');
      const count=this.group(delivery,'sheeting-count-sensor-v122','Sheet Count / Jam Detection Reference',[0,0,0],[.12,.14,.18],'PROCESS_FAMILY_REFERENCE');
      for(const z of [-.92,.92])tag(this.box(count,[.08,.14,.08],[-1.82,1.02,z],'bodyDark',.008,{detail:true,role:'sheet-count-sensor-reference'}),'sheet-count-sensor-reference','PASABAN_SHEET_COUNT_JAM_DETECTION');
    }

    const layboy=this.findNode('sheeting-layboy');
    if(layboy){
      const level=this.group(layboy,'sheeting-stack-level-v122','Stack Height / Lift Drive Reference',[0,0,0],[0,.10,.22],'PROCESS_FAMILY_REFERENCE');
      for(const z of [-1.10,1.10])tag(this.box(level,[.08,.12,.08],[-.92,1.32,z],'bodyDark',.008,{detail:true,role:'stack-height-sensor-reference'}),'stack-height-sensor-reference','STACKER_FAMILY_REFERENCE');
      for(const z of [1.18]){
        tag(this.cyl(level,.055,.16,[1.02,.28,z],'dark','z',{detail:true,active:true,motion:'lift-drive-reference',role:'lift-drive-sprocket-reference'}),'lift-drive-sprocket-reference','STACKER_FAMILY_REFERENCE');
        tag(this.box(level,[.035,1.05,.05],[1.02,.88,z],'steel',.004,{detail:true,role:'lift-chain-reference'}),'lift-chain-reference','STACKER_FAMILY_REFERENCE');
      }
      tag(this.cyl(level,.12,.30,[1.20,.24,1.15],'dark','x',{detail:true,active:true,motion:'lift-motor-reference',role:'lift-motor-reference'}),'lift-motor-reference','STACKER_FAMILY_REFERENCE');
    }
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
  setExteriorOpen(on=true){this.exteriorOpen=!!on;for(const m of this.meshes){if(m.userData.exteriorCover)m.visible=!on;if(m.userData.cutawayOnly)m.visible=!!on;}this.root.userData.interiorCutawayVisible=on;}
  setLow(on){for(const m of this.detailMeshes)m.visible=!on;}
  reset(){const open=this.exteriorOpen;this.explode(0);this.highlight(null);this.isolate(null,false);this.ghost(false);for(const n of this.nodes)n.quaternion.copy(n.userData.restQuaternion);for(const m of this.meshes){m.position.copy(m.userData.restPosition);m.rotation.copy(m.userData.restRotation);m.visible=true;}this.setExteriorOpen(open);}
  dispose(){this.geometries.forEach(g=>g.dispose());this.materials.forEach(m=>m.dispose());}
}
