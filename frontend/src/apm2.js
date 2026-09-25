import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {APM2_DIMENSIONS,apm2DimensionAudit} from './data/dimensions-apm2.js';
import {APM2_ORIENTATION,APM2_TECHNICAL_SOURCES} from './data/sources-apm2.js';
import {APM2_TAXONOMY,APM2_TAXONOMY_BY_ID} from './data/taxonomy-apm2.js';

const V=a=>new THREE.Vector3(...a);
const D=APM2_DIMENSIONS.layout;

export class APM2MachineTemplate{
  constructor(){
    this.root=new THREE.Group();this.root.name='MACHINE-APM2';
    this.root.userData={
      assetId:'MACHINE-APM2',
      orientation:APM2_ORIENTATION,
      taxonomyVersion:'apm2-taxonomy-v2',
      machineEnvelope:APM2_DIMENSIONS,
      dimensionAudit:apm2DimensionAudit(),
      sources:APM2_TECHNICAL_SOURCES,
      bmjAssetId:'BMJ-MCH-0010',geometryStatus:'LEGACY_SP102_FAMILY_PROCESS_REFERENCE__SUFFIX_UNCONFIRMED',engineeringDimensions:false
    };
    this.parts=[];this.nodes=[];this.meshes=[];this.geometries=new Map();this.materials=new Map();this.exteriorOpen=false;this.ghosted=false;
    this.palette={
      graphite:0x343a3d,dark:0x22282b,black:0x101416,light:0xe7e5dd,cream:0xe9e6db,
      steel:0x8b9598,silver:0xbac1c0,green:0x3a774a,orange:0xc96f43,paper:0xf2ecda,
      rubber:0x242729,glass:0x6b9dac,red:0xb73932,yellow:0xd5b23c,blue:0x416f91
    };
    this.build();
    this.taxonomy=APM2_TAXONOMY;this.taxonomyById=APM2_TAXONOMY_BY_ID;
    for(const n of this.nodes){n.userData.rest=n.position.clone();n.userData.restQuaternion=n.quaternion.clone();}
    this.original=this.parts.map(p=>p.position.clone());this.root.updateMatrixWorld(true);
  }
  group(parent,id,name,pos=[0,0,0],explode=[0,0,0],sources=['APM2-BMJ-DATABASE'],note=''){
    const g=new THREE.Group();g.name=name;g.position.set(...pos);
    g.userData={assetId:'MACHINE-APM2',nodeId:id,selectable:true,confidence:'REFERENCE_FAMILY',sourceFiles:sources,note,explode:V(explode)};
    parent.add(g);this.nodes.push(g);if(parent===this.root)this.parts.push(g);return g;
  }
  material(kind,owner){
    const key=(owner?.userData?.nodeId||'root')+':'+kind;
    if(!this.materials.has(key)){
      const glass=kind==='glass';
      this.materials.set(key,new THREE.MeshStandardMaterial({
        color:this.palette[kind]??this.palette.graphite,
        metalness:['steel','silver'].includes(kind)?.58:.16,
        roughness:kind==='paper'?.9:glass?.2:.52,
        transparent:glass,opacity:glass?.34:1
      }));
    }
    return this.materials.get(key);
  }
  mesh(parent,geo,key,kind='graphite',pos=[0,0,0],rotation=null){
    if(!this.geometries.has(key))this.geometries.set(key,geo());
    const m=new THREE.Mesh(this.geometries.get(key),this.material(kind,parent));
    m.position.set(...pos);if(rotation)m.rotation.set(...rotation);m.castShadow=kind!=='glass';m.receiveShadow=true;
    m.userData={assetId:'MACHINE-APM2',ownerId:parent.userData.nodeId};parent.add(m);this.meshes.push(m);return m;
  }
  box(g,size,pos,kind='graphite',radius=0){return this.mesh(g,()=>radius?new RoundedBoxGeometry(...size,2,radius):new THREE.BoxGeometry(...size),'box:'+size+':'+radius,kind,pos);}
  cylinder(g,r,len,pos,kind='steel',axis='z'){return this.mesh(g,()=>new THREE.CylinderGeometry(r,r,len,18),'cyl:'+r+':'+len,kind,pos,axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:[0,0,0]);}
  torus(g,major,minor,pos,kind='steel',rot=[0,0,0]){return this.mesh(g,()=>new THREE.TorusGeometry(major,minor,8,28),'torus:'+major+':'+minor,kind,pos,rot);}
  cover(o){if(o)o.userData.exteriorCover=true;return o;}
  detail(o){if(o)o.userData.detail=true;return o;}
  build(){
    this.buildFrameAndPlatform();
    this.buildFeeder();
    this.buildRegister();
    this.buildTransport();
    this.buildPlaten();
    this.buildStripping();
    this.buildDelivery();
    this.buildDrive();
    this.buildControl();
    this.buildSafety();
  }
  buildFrameAndPlatform(){
    const base=this.group(this.root,'apm2-base','Machine Base / Support',[0,0,0],[0,-.18,.35],['APM2-SP102-E-VISUAL','APM2-SP102-DIM']);
    this.box(base,[5.82,.22,1.84],[0,.11,0],'dark',.035);
    for(const x of [-2.55,-1.55,-.55,.55,1.55,2.55])for(const z of [-.82,.82])this.box(base,[.16,.28,.16],[x,.28,z],'steel',.018);
    const platform=this.group(this.root,'apm2-platform','Operator Service Platform',[0,0,0],[0,-.1,-.65],['APM2-SP102-E-VISUAL']);
    this.box(platform,[4.95,.08,.50],[.20,.31,-1.30],'steel',.018);
    for(const x of [-2.15,-.45,1.25,2.45])this.cylinder(platform,.021,.72,[x,.68,-1.53],'steel','y');
    this.cylinder(platform,.020,4.65,[.15,1.02,-1.53],'steel','x');
  }
  buildFeeder(){
    const g=this.group(this.root,'apm2-feeder','Pile Feeder / Sheet Separation',[D.feederCenterX,0,0],[-.9,.1,0],['APM2-SP102-1994','APM2-SP102-E-VISUAL']);
    const structure=this.group(g,'apm2-feeder-structure','Feeder Structure',[0,0,0],[0,.1,.2]);
    for(const z of [-.83,.83])for(const x of [-.57,.57])this.box(structure,[.10,1.62,.10],[x,1.05,z],'steel',.015);
    this.box(structure,[1.28,.12,1.76],[0,1.84,0],'steel',.015);
    const housing=this.group(g,'apm2-feeder-housing','Feeder Exterior Housing',[0,0,0],[0,.15,-.25],['APM2-SP102-E-VISUAL']);
    this.cover(this.box(housing,[1.34,.86,.10],[-.02,1.50,-.94],'cream',.025));
    this.cover(this.box(housing,[1.34,.86,.10],[-.02,1.50,.84],'cream',.025));
    this.cover(this.box(housing,[1.34,.28,1.86],[-.02,1.91,0],'cream',.035));
    this.cover(this.box(housing,[1.30,.16,.18],[-.02,.62,-1.00],'green',.02));

    const pile=this.group(g,'apm2-feeder-pile','Pile / Lift',[0,0,0],[-.3,.08,0]);
    const table=this.group(pile,'apm2-feeder-pile-table','Pile Table',[0,0,0],[-.1,.05,0]);
    this.box(table,[1.02,.08,1.30],[-.18,.50,0],'steel',.012);
    const stack=this.box(table,[.92,.82,1.18],[-.18,.95,0],'paper',.006);stack.userData.paperPile=true;
    const lift=this.group(pile,'apm2-feeder-lift','Pile Lift',[0,0,0],[-.1,.1,.2]);
    for(const z of [-.68,.68]){this.cylinder(lift,.025,1.18,[-.58,1.00,z],'steel','y');this.cylinder(lift,.025,1.18,[.20,1.00,z],'steel','y');}
    for(const x of [-.58,.20])this.box(lift,[.04,1.16,.05],[x,1.00,0],'dark',.005);

    const nonStop=this.group(g,'apm2-feeder-nonstop','Manual Non-stop Feeder Reference',[0,0,0],[-.2,.18,0],['APM2-SP102-1994']);
    for(const z of [-.42,.42])this.box(nonStop,[.78,.035,.075],[-.08,1.44,z],'steel',.005);

    const head=this.group(g,'apm2-feeder-head','Suction Head',[0,0,0],[-.15,.3,0]);
    this.box(head,[.72,.20,1.28],[.28,1.71,0],'graphite',.035);
    const liftS=this.group(head,'apm2-feeder-lift-suckers','Lifting Suckers',[0,0,0],[0,.15,0]);
    const fwdS=this.group(head,'apm2-feeder-forward-suckers','Forwarding Suckers',[0,0,0],[0,.12,0]);
    for(const z of [-.34,.34]){
      const stem=this.cylinder(liftS,.018,.16,[.10,1.55,z],'steel','y');stem.userData.feederSucker=true;
      const cup=this.cylinder(liftS,.040,.025,[.10,1.46,z],'rubber','y');cup.userData.feederSucker=true;
      this.cylinder(fwdS,.016,.14,[.42,1.52,z],'steel','y').userData.feederSucker=true;
      this.cylinder(fwdS,.036,.022,[.42,1.44,z],'rubber','y').userData.feederSucker=true;
    }
    // Feed belts/rollers/air raised (+.31) to be level with the nonstop feeder guide rails
    // (y≈1.44) and the forwarding suckers (y≈1.44–1.52) already just above them, instead of
    // sitting ~30cm lower: a sheet just released by the suckers can't plausibly drop that far
    // before the next mechanism grips it. Each group is shifted as a whole, so the rollers/belts
    // keep their own internal spacing.
    const air=this.group(g,'apm2-feeder-air','Feeder Air / Side Blowers',[0,.31,0],[-.1,.12,.2]);
    this.cylinder(air,.027,1.18,[.18,1.31,0],'steel','z');
    for(const z of [-.48,-.16,.16,.48])this.cylinder(air,.010,.16,[.18,1.24,z],'blue','y');

    const belts=this.group(g,'apm2-feeder-belts','Feed Belts / Slow-down',[0,.31,0],[.15,.1,0]);
    for(const z of [-.42,-.14,.14,.42])this.box(belts,[.82,.018,.055],[.68,1.13,z],'rubber',.006);
    const rollers=this.group(g,'apm2-feeder-infeed-rollers','Infeed Rollers',[0,.31,0],[.1,.1,0]);
    {const a=this.cylinder(rollers,.045,1.12,[.35,1.14,0],'rubber','z');a.userData.driveRotor=true;a.userData.mechanismRole='feed-roller';const b=this.cylinder(rollers,.035,1.12,[.78,1.14,0],'steel','z');b.userData.driveRotor=true;b.userData.mechanismRole='feed-roller';}
  }
  buildRegister(){
    // Group y-offset (.43) raises the whole feed-table/register/side-lay assembly so the
    // sheet the front lays stop and the gripper closes on sits at the sheet transport plane
    // (D.sheetPlaneY, see gripperLoopPosition's top run in simulation-apm2.js) instead of ~43cm
    // below it. Every child keeps its original relative position, so internal proportions and
    // the side-lay drive/linkage geometry are unchanged.
    const g=this.group(this.root,'apm2-register','Feed Table / Register & Side Lay',[D.registerCenterX,.43,0],[-.55,.15,-.25],['APM2-SP102-1994','APM2-BMJ-Q2']);
    const table=this.group(g,'apm2-register-table','Stainless Feed Table',[0,0,0],[-.2,.12,0]);
    this.box(table,[1.10,.055,1.38],[0,1.07,0],'silver',.008);
    for(const z of [-.48,-.16,.16,.48])this.box(table,[1.04,.012,.045],[0,1.105,z],'rubber',.004);
    const front=this.group(g,'apm2-register-frontlays','Four Front Lays',[0,0,0],[.15,.15,0]);
    for(let i=0;i<4;i++){
      const z=-.48+i*.32,lay=this.group(front,'apm2-front-lay-'+(i+1),'Front Lay '+(i+1),[0,0,0],[0,.08,0]);
      this.box(lay,[.065,.12,.055],[.49,1.16,z],'steel',.006);
    }
    const side=this.group(g,'apm2-register-sidelay','Operator-side Side Lay',[0,0,0],[.1,.2,-.28],['APM2-BMJ-Q2','APM2-SP102-1994']);
    this.box(side,[.28,.10,.10],[.14,1.19,-.68],'steel',.012);
    this.cylinder(side,.035,.16,[.08,1.19,-.65],'rubber','z');
    const drive=this.group(g,'apm2-sidelay-drive','Side Lay Drive / Motor',[0,0,0],[.12,.2,-.34],['APM2-BMJ-Q2','APM2-SP102-PARTS']);
    const motor=this.cylinder(drive,.095,.24,[.02,.82,-.73],'graphite','x');motor.userData.sideLayMotor=true;
    this.cylinder(drive,.028,.34,[.18,.83,-.72],'steel','x');this.box(drive,[.22,.06,.08],[.32,.88,-.72],'steel',.006);

    const sensors=this.group(g,'apm2-register-sensors','Register Sensors',[0,0,0],[.18,.18,0]);
    const dbl=this.group(sensors,'apm2-register-double-sheet','Double-sheet Detector',[0,0,0],[0,.1,0]);
    this.box(dbl,[.07,.08,.08],[-.31,1.19,.58],'black',.008);
    const arrival=this.group(sensors,'apm2-register-arrival','Sheet Arrival Sensors',[0,0,0],[0,.1,0]);
    for(const z of [-.34,.34])this.box(arrival,[.055,.07,.055],[.43,1.19,z],'black',.006);
  }
  buildTransport(){
    const g=this.group(this.root,'apm2-transport','Gripper Chain Sheet Transport',[0,0,0],[0,.28,.35],['APM2-SP102-PARTS']);
    const chain=this.group(g,'apm2-gripper-chain','Twin Gripper Chains',[0,0,0],[0,.15,.3]);
    const os=this.group(chain,'apm2-gripper-chain-os','Operator-side Chain',[0,0,0],[0,.08,-.2]);
    const ds=this.group(chain,'apm2-gripper-chain-ds','Drive-side Chain',[0,0,0],[0,.08,.2]);
    for(const [parent,z] of [[os,-.72],[ds,.72]]){
      this.box(parent,[4.26,.035,.045],[.18,1.00,z],'dark',.004);
      this.box(parent,[4.26,.035,.045],[.18,1.57,z],'dark',.004);
      this.box(parent,[.035,.57,.045],[-1.95,1.285,z],'dark',.004);
      this.box(parent,[.035,.57,.045],[2.31,1.285,z],'dark',.004);
    }
    const sprockets=this.group(g,'apm2-chain-sprockets','Chain Sprockets',[0,0,0],[0,.12,.25]);
    const drive=this.group(sprockets,'apm2-chain-drive-sprocket','Drive Sprocket',[0,0,0],[.1,.1,.2]);
    const ret=this.group(sprockets,'apm2-chain-return-sprocket','Return Sprocket',[0,0,0],[-.1,.1,.2]);
    for(const z of [-.72,.72]){const a=this.torus(drive,.18,.026,[2.31,1.285,z],'steel',[Math.PI/2,0,0]);a.userData.driveRotor=true;a.userData.mechanismRole='chain-sprocket';const b=this.torus(ret,.18,.026,[-1.95,1.285,z],'steel',[Math.PI/2,0,0]);b.userData.driveRotor=true;b.userData.mechanismRole='chain-sprocket';}
    const bars=this.group(g,'apm2-gripper-bars','14 Gripper Bars',[0,0,0],[0,.15,0],['APM2-SP102-PARTS']);
    for(let i=0;i<14;i++){
      const id='apm2-gripper-bar-'+(i+1),bar=this.group(bars,id,'Gripper Bar '+(i+1),[0,0,0],[0,.08,0]);bar.userData.gripperBar=true;bar.userData.barPhase=i/14;bar.userData.familyCountReference=14;
      // Bar geometry lives in bar-local coordinates. The simulation positions the
      // entire bar on the chain loop; absolute child coordinates displaced it twice.
      const shaft=this.cylinder(bar,.022,1.46,[0,0,0],'steel','z');shaft.userData.gripperShaft=true;shaft.userData.gripperIndex=i+1;
      for(const z of [-.48,-.16,.16,.48]){this.box(bar,[.09,.025,.05],[0,-.035,z],'graphite',.004).userData.gripperFinger=true;}
    }
  }
  buildPlaten(){
    const g=this.group(this.root,'apm2-platen','Flatbed Die-Cutting Platen',[D.platenCenterX,0,0],[0,.45,0],['APM2-SP102-1994','APM2-SP102-E-VISUAL']);
    const frame=this.group(g,'apm2-platen-frame','Heavy Platen Frame',[0,0,0],[0,.1,.25]);
    for(const z of [-.83,.83])for(const x of [-.48,.48])this.box(frame,[.13,1.72,.13],[x,1.07,z],'steel',.018);
    this.box(frame,[1.10,.18,1.82],[0,1.96,0],'steel',.022);
    this.box(frame,[1.10,.22,1.82],[0,.36,0],'dark',.022);

    const housing=this.group(g,'apm2-platen-housing','Platen Exterior Housing',[0,0,0],[0,.22,-.35],['APM2-SP102-E-VISUAL']);
    this.cover(this.box(housing,[1.16,.58,.10],[0,1.00,-.94],'cream',.018));this.cover(this.box(housing,[1.16,.32,.10],[0,1.83,-.94],'cream',.018));this.cover(this.box(housing,[.45,.38,.10],[-.355,1.48,-.94],'cream',.012));this.cover(this.box(housing,[.21,.38,.10],[.475,1.48,-.94],'cream',.012));
    this.cover(this.box(housing,[1.16,1.28,.10],[0,1.35,.84],'cream',.03));
    this.cover(this.box(housing,[1.16,.28,1.86],[0,2.02,0],'cream',.035));
    this.cover(this.box(housing,[1.12,.17,.18],[0,.66,-1.00],'green',.02));
    const window=this.cover(this.box(housing,[.50,.38,.018],[.12,1.48,-.997],'glass',.018));window.userData.safetyWindow=true;

    // The chase/cutting-plate/micrometric stack is the tooling that actually contacts the
    // sheet at press time. It is deliberately nested under 'apm2-moving-platen' (not a sibling
    // of it) so that when the simulation drives the press stroke on that one node, the whole
    // rigid tool-and-bed assembly closes together — previously the animated node was an
    // unrelated structural block and the visible cutting tooling never moved during the stroke.
    // Which specific plate is fixed vs. moving in the real BMJ unit is not photo/manual-verified
    // (see APM2_DIMENSIONS.familyReference.suffix:'UNCONFIRMED'), so this models the press as one
    // rigid module rather than asserting an unconfirmed upper/lower kinematic split.
    const moving=this.group(g,'apm2-moving-platen','Platen Press Assembly (Chase + Bed, Rigid)',[0,0,0],[0,.28,0]);
    const platen=this.box(moving,[.90,.16,1.30],[-.04,1.14,0],'graphite',.014);platen.userData.plateBed=true;
    const tooling=this.group(moving,'apm2-platen-tooling','Die-Cutting Tooling',[0,0,0],[0,.3,0]);
    const chase=this.group(tooling,'apm2-cutting-chase','Die-Cutting Chase',[0,0,0],[0,.16,0]);
    this.box(chase,[.82,.055,1.20],[-.04,1.51,0],'steel',.006);
    const cut=this.group(tooling,'apm2-cutting-plate','Cutting Plate',[0,0,0],[0,.12,0]);
    this.box(cut,[.84,.025,1.22],[-.04,1.40,0],'silver',.004);
    const micro=this.group(tooling,'apm2-micrometric','Micrometric / Compensation System',[0,0,0],[0,.12,-.2]);
    this.box(micro,[.88,.035,1.26],[-.04,1.34,0],'steel',.004);
    for(const x of [-.38,.38])for(const z of [-.55,.55])this.cylinder(micro,.018,.08,[x,1.30,z],'steel','y');
    const toggle=this.group(g,'apm2-platen-toggle','Toggle / Eccentric Pressure Drive',[0,0,0],[0,.18,.28]);
    for(const z of [-.52,.52]){
      const a=this.box(toggle,[.40,.06,.07],[-.20,.78,z],'steel',.008);a.rotation.z=.45;a.userData.platenLink=true;
      const b=this.box(toggle,[.40,.06,.07],[.18,.78,z],'steel',.008);b.rotation.z=-.45;b.userData.platenLink=true;
      this.cylinder(toggle,.055,.10,[0,.70,z],'steel','z');
    }
  }
  buildStripping(){
    const g=this.group(this.root,'apm2-stripping','Waste Stripping Station',[D.strippingCenterX,0,0],[.5,.3,0],['APM2-SP102-1994','APM2-SP102-PARTS']);
    const frame=this.group(g,'apm2-stripping-frame','Stripping Frame Structure',[0,0,0],[0,.12,.2]);
    for(const z of [-.82,.82])for(const x of [-.38,.38])this.box(frame,[.10,1.55,.10],[x,1.06,z],'steel',.014);
    this.box(frame,[.86,.12,1.76],[0,1.86,0],'steel',.015);
    const housing=this.group(g,'apm2-stripping-housing','Stripping Exterior Housing',[0,0,0],[0,.2,-.3],['APM2-SP102-E-VISUAL']);
    this.cover(this.box(housing,[.92,1.12,.10],[0,1.38,-.94],'cream',.028));
    this.cover(this.box(housing,[.92,1.12,.10],[0,1.38,.84],'cream',.028));
    this.cover(this.box(housing,[.92,.26,1.86],[0,1.96,0],'cream',.03));
    this.cover(this.box(housing,[.88,.16,.18],[0,.68,-1.00],'green',.018));

    const upper=this.group(g,'apm2-stripping-upper','Upper Stripping Frame',[0,0,0],[0,.28,0]);
    this.box(upper,[.76,.055,1.18],[0,1.48,0],'steel',.006).userData.stripUpper=true;
    for(const x of [-.28,0,.28])for(const z of [-.42,0,.42])this.cylinder(upper,.010,.10,[x,1.41,z],'steel','y');
    // Raised (+.08) to preserve its original .12 gap to the stripping board now that the board
    // itself was raised .08 (see below) — otherwise this counter-fixture would end up .20 below
    // the board instead of the .12 its pins/needle-relief geometry was originally spaced for.
    const lower=this.group(g,'apm2-stripping-lower','Lower Stripping Frame',[0,.08,0],[0,.18,0]);
    this.box(lower,[.76,.055,1.18],[0,1.18,0],'steel',.006).userData.stripLower=true;
    // Raised (+.08) so the board sits just under the upper stripping frame's needle tips at
    // rest (pins at local y=1.41 vs. plate at 1.48) instead of ~24cm below — close enough that
    // the sheet it supports is in plausible reach of the needles once the upper frame strokes
    // down, without the board clipping through the needles at rest.
    const board=this.group(g,'apm2-stripping-board','Central Stripping Board',[0,.08,0],[0,.16,0]);
    this.box(board,[.70,.035,1.10],[0,1.30,0],'dark',.004);
    const chute=this.group(g,'apm2-waste-chute','Waste Chute / Curtain',[0,0,0],[.15,.1,.15]);
    this.box(chute,[.64,.52,1.04],[.05,.72,0],'graphite',.018);
    this.box(chute,[.56,.10,.94],[.05,.45,0],'black',.01);
  }
  buildDelivery(){
    const g=this.group(this.root,'apm2-delivery','Delivery / Pile Formation',[D.deliveryCenterX,0,0],[.9,.1,0],['APM2-SP102-1994','APM2-SP102-E-VISUAL']);
    const structure=this.group(g,'apm2-delivery-structure','Delivery Structure',[0,0,0],[0,.1,.2]);
    for(const z of [-.82,.82])for(const x of [-.50,.50])this.box(structure,[.10,1.45,.10],[x,1.00,z],'steel',.014);
    this.box(structure,[1.12,.12,1.76],[0,1.74,0],'steel',.014);
    const housing=this.group(g,'apm2-delivery-housing','Delivery Exterior Housing',[0,0,0],[.15,.18,-.3],['APM2-SP102-E-VISUAL']);
    this.cover(this.box(housing,[1.16,.82,.10],[0,1.44,-.94],'cream',.028));
    this.cover(this.box(housing,[1.16,.82,.10],[0,1.44,.84],'cream',.028));
    this.cover(this.box(housing,[1.16,.22,1.86],[0,1.87,0],'cream',.03));
    this.cover(this.box(housing,[1.12,.16,.18],[0,.66,-1.00],'green',.018));

    const hand=this.group(g,'apm2-delivery-handover','Gripper Release / Sheet Handover',[0,0,0],[.18,.18,0]);
    const open=this.group(hand,'apm2-delivery-gripper-open','Gripper Reopening Mechanism',[0,0,0],[.12,.12,0]);
    this.cylinder(open,.11,.10,[-.36,1.45,.74],'steel','z');this.box(open,[.32,.05,.06],[-.20,1.38,.74],'steel',.006).rotation.z=-.28;

    const pile=this.group(g,'apm2-delivery-pile','Delivery Pile',[0,0,0],[.35,.08,0]);
    const table=this.group(pile,'apm2-delivery-pile-table','Delivery Pile Table',[0,0,0],[.15,.05,0]);
    this.box(table,[.94,.08,1.30],[.26,.48,0],'steel',.012);
    const paper=this.group(pile,'apm2-delivery-paper-stack','Converted Sheet Stack',[0,0,0],[.18,.08,0]);
    this.box(paper,[.86,.62,1.18],[.26,.83,0],'paper',.006);
    for(let i=0;i<12;i++)this.box(paper,[.865,.003,1.185],[.26,.54+i*.045,0],'light');
    const jog=this.group(pile,'apm2-delivery-joggers','Pile Joggers',[0,0,0],[.18,.1,0]);
    this.box(jog,[.06,.48,1.10],[.74,.87,0],'steel',.006);
    for(const z of [-.62,.62])this.box(jog,[.86,.48,.045],[.26,.87,z],'steel',.006);

    const nonstop=this.group(g,'apm2-delivery-nonstop','Non-stop Delivery Reference',[0,0,0],[.35,.12,0],['APM2-SP102-1994']);
    for(const z of [-.45,-.15,.15,.45])this.box(nonstop,[.78,.025,.045],[.05,1.16,z],'steel',.004);
  }
  buildDrive(){
    const g=this.group(this.root,'apm2-drive','Main Drive / Transmission',[0,0,0],[0,.25,.65],['APM2-SP102-PARTS']);
    const main=this.group(g,'apm2-main-drive','Main Motor / Flywheel',[0,0,0],[0,.16,.35]);
    const motor=this.group(main,'apm2-main-motor','Main Drive Motor',[0,0,0],[0,.12,.3]);
    {const r=this.cylinder(motor,.22,.56,[-.28,.58,.92],'graphite','x');r.userData.mainMotor=true;r.userData.driveRotor=true;r.userData.mechanismRole='main-motor';}
    const fly=this.group(main,'apm2-flywheel','Flywheel',[0,0,0],[0,.1,.25]);
    {const r=this.cylinder(fly,.34,.10,[.10,.64,.95],'steel','x');r.userData.flywheel=true;r.userData.driveRotor=true;r.userData.mechanismRole='flywheel';}
    const clutch=this.group(main,'apm2-clutch-brake','Clutch / Brake',[0,0,0],[0,.1,.25]);
    {const r=this.cylinder(clutch,.24,.12,[.22,.64,.95],'dark','x');r.userData.clutch=true;r.userData.driveRotor=true;r.userData.mechanismRole='clutch-brake';}

    const trans=this.group(g,'apm2-drive-transmission','Mechanical Transmission',[0,0,0],[.1,.16,.3]);
    const shaft=this.group(trans,'apm2-main-shaft','Main Shaft',[0,0,0],[0,.1,.2]);
    {const r=this.cylinder(shaft,.045,2.00,[0,.64,0],'steel','z');r.userData.driveRotor=true;r.userData.mechanismRole='main-shaft';}
    const gears=this.group(trans,'apm2-drive-gears','Drive Gears / Sprockets',[0,0,0],[0,.1,.25]);
    for(const [x,radius] of [[-.42,.19],[-.10,.15],[.18,.20]]){const q=this.cylinder(gears,radius,.08,[x,.65,.92],'steel','x');q.userData.driveRotor=true;q.userData.mechanismRole='drive-gear';}

    const lube=this.group(g,'apm2-lubrication','Lubrication System',[0,0,0],[0,.16,.25]);
    const pump=this.group(lube,'apm2-lube-pump','Lubrication Pump',[0,0,0],[0,.08,.15]);
    this.box(pump,[.24,.30,.20],[-.78,.45,.78],'graphite',.025);
    const brush=this.group(lube,'apm2-lube-brush','Chain / Gear Lubrication',[0,0,0],[0,.08,.12]);
    this.cylinder(brush,.05,.10,[.48,.70,.84],'rubber','z');
  }
  buildControl(){
    const g=this.group(this.root,'apm2-control','Controls / Electrical',[0,0,0],[0,.42,-.52],['APM2-SP102-1994','APM2-SP102-E-VISUAL']);
    const cab=this.group(g,'apm2-control-cabinet','Electrical Control Cabinet',[0,0,0],[0,.2,-.3]);
    this.box(cab,[.62,1.32,.42],[-1.72,1.05,.96],'graphite',.045);
    this.box(cab,[.45,.18,.018],[-1.72,1.45,.74],'light',.006);
    const panel=this.group(g,'apm2-operator-panel','Operator Panel',[0,0,0],[.15,.25,-.4]);
    this.box(panel,[.40,.56,.22],[-.25,1.62,-1.14],'cream',.04);
    for(let i=0;i<5;i++)this.cylinder(panel,.025,.015,[-.39+i*.07,1.72,-1.255],i===0?'red':i===1?'green':'black','z');
    const display=this.group(panel,'apm2-operator-display','Machine Status Display',[0,0,0],[0,.12,0]);
    this.box(display,[.20,.12,.012],[-.25,1.88,-1.258],'glass',.006);
  }
  buildSafety(){
    const g=this.group(this.root,'apm2-safety','Safety Guards / Interlocks',[0,0,0],[0,.22,-.7],['APM2-SP102-E-VISUAL']);
    const os=this.group(g,'apm2-cover-os','Operator-side Guards',[0,0,0],[0,.12,-.4]);
    const ds=this.group(g,'apm2-cover-ds','Drive-side Guards',[0,0,0],[0,.12,.4]);
    for(const [parent,z] of [[os,-1.02],[ds,1.02]]){
      for(const [x,w] of [[-2.10,1.25],[-.22,1.08],[.95,.86],[2.08,1.08]])this.cover(this.box(parent,[w,.72,.06],[x,.82,z],'graphite',.018));
    }
    const inter=this.group(g,'apm2-safety-interlocks','Guard / Emergency Interlocks',[0,0,0],[0,.15,-.3]);
    for(const x of [-2.45,-.55,.65,1.70,2.55])this.box(inter,[.06,.09,.06],[x,1.10,-1.06],'black',.006);
  }
  resolvePart(object){let p=object;while(p&&p!==this.root){if(p.userData.selectable)return p;p=p.parent;}return null;}
  findNode(nodeId){return nodeId==='MACHINE-APM2'?this.root:this.nodes.find(n=>n.userData.nodeId===nodeId)||null;}
  resolveTaxonomyNode(taxonomyId){
    let meta=this.taxonomyById.get(taxonomyId);
    while(meta){for(const ref of meta.meshRefs||[]){const node=this.findNode(ref);if(node)return node;}meta=meta.parentId?this.taxonomyById.get(meta.parentId):null;}
    return taxonomyId==='APM2'?this.root:null;
  }
  contains(parent,node){for(let p=node;p;p=p.parent)if(p===parent)return true;return false;}
  explode(t,selected=null){
    const amount=THREE.MathUtils.clamp(Number(t)||0,0,1);
    for(const n of this.nodes)n.position.copy(n.userData.rest);
    const children=selected?.children.filter(c=>c.userData.selectable),targets=selected?(children?.length?children:[selected]):this.parts;
    if(amount)for(const n of targets)n.position.addScaledVector(n.userData.explode,amount);
    this.root.updateMatrixWorld(true);
  }
  highlight(part){for(const m of this.meshes){m.material.emissive?.setHex(part&&this.contains(part,m)?0x18494a:0);if(m.material.emissive)m.material.emissiveIntensity=.28;}}
  highlightMany(parts=[]){for(const m of this.meshes){const on=parts.some(part=>this.contains(part,m));m.material.emissive?.setHex(on?0x18494a:0);if(m.material.emissive)m.material.emissiveIntensity=.28;}}
  ghost(on,except=null){this.ghosted=on;for(const m of this.meshes){const faded=on&&(!except||!this.contains(except,m)),glass=m.material.color?.getHex()===this.palette.glass;m.material.transparent=faded||glass;m.material.opacity=faded?.14:glass?.34:1;m.material.depthWrite=!faded;m.material.needsUpdate=true;}}
  isolate(part,on=true){for(const n of this.nodes)n.visible=!on||!part||this.contains(part,n)||this.contains(n,part);}
  showOnly(parts=[],on=true){for(const n of this.nodes)n.visible=!on||!parts.length||parts.some(part=>n===part||this.contains(n,part));}
  setExteriorOpen(on=true){
    this.exteriorOpen=!!on;let hidden=0;
    for(const n of this.nodes)if(n.userData.exteriorCover){n.visible=!this.exteriorOpen;if(this.exteriorOpen)hidden++;}
    for(const m of this.meshes)if(m.userData.exteriorCover){m.visible=!this.exteriorOpen;if(this.exteriorOpen)hidden++;}
    this.root.userData.exteriorHiddenCount=this.exteriorOpen?hidden:0;
    this.root.userData.interiorCutawayVisible=this.exteriorOpen;
    this.root.updateMatrixWorld(true);
  }
  setLow(on){for(const m of this.meshes)if(m.userData.detail)m.visible=!on;}
  reset(){const open=this.exteriorOpen;this.explode(0);this.highlight(null);this.isolate(null,false);this.ghost(false);for(const n of this.nodes)n.quaternion.copy(n.userData.restQuaternion);if(open)this.setExteriorOpen(true);}
  dispose(){this.geometries.forEach(g=>g.dispose());this.materials.forEach(m=>m.dispose());this.geometries.clear();this.materials.clear();}
}
