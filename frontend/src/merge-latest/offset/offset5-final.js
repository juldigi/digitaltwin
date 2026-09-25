// BMJ Packaging Offset Digital Twin — dedicated machine module
// Standalone candidate module. Does not modify the live application.
// THREE.js geometry is visual/functional reconstruction, not OEM CAD.
// Dimensions marked VERIFIED come from cited/OEM-family technical data; installed-only details remain explicit estimates.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const OFFSET5_FINAL_META = Object.freeze({
  assetId: 'BMJ-MCH-0003',
  code: 'OFU-1',
  name: 'OFFSET UV INK - 5 MACHINE + INLINE INS',
  manufacturer: 'HEIDELBERG',
  model: 'Speedmaster CD 102-8+L',
  serial: '550415',
  process: 'SHEETFED_OFFSET_8C_PLUS_COATING_INLINE_INSPECTION',
  flow: 'FEEDER_TO_DELIVERY_POSITIVE_X',
  operatorSide: 'NEGATIVE_Z',
  driveSide: 'POSITIVE_Z',
  sourceBasis: [
    'HEIDELBERG Speedmaster CD 102 family technical data',
    'HEIDELBERG Preset Plus feeder manual',
    'HEIDELBERG CD 102 packaging references',
    'BMJ confirmed configuration and prior machine-photo observations'
  ],
  verifiedFamily: { maxSheetMM:[720,1020], speedSPH:15000, stockMM:[0.03,1.0] },
  installedSequence: ['FEEDER','REGISTER','PU1','PU2','PU3','PU4','PU5','PU6','PU7','PU8','COATER_L','INLINE_INSPECTION','DELIVERY'],
  confidence: 'INSTALLED_CONFIGURATION_CONFIRMED__DETAILS_MIXED_PHOTO_AND_FAMILY_REFERENCE'
});

const C={body:0x343d42,body2:0x596268,dark:0x171d20,steel:0x8d999d,silver:0xc2c9ca,
  paper:0xf1ecdc,rubber:0x202426,red:0xb53a32,amber:0xd6a83b,blue:0x355f8c,
  glass:0x6f9aa8,ink:0x242424,uv:0xb98cff,white:0xe7e8e4};

export class Offset5Final {
  constructor({quality='high'}={}){
    this.root=new THREE.Group(); this.root.name='OFU-1 · Heidelberg CD 102-8+L';
    this.root.userData={...OFFSET5_FINAL_META,taxonomyLevels:6,quality};
    this.parts=[]; this.nodes=[]; this.rotors=[]; this.dynamic=[]; this.sheets=[];
    this._geo=new Map(); this._mat=new Map(); this.elapsed=0; this.running=false; this.speed=1;
    this.moduleX={FEEDER:-7.8,REGISTER:-6.1,PU1:-4.75,PU2:-3.45,PU3:-2.15,PU4:-.85,PU5:.45,PU6:1.75,PU7:3.05,PU8:4.35,COATER:5.78,INSPECTION:6.92,DELIVERY:8.25};
    this.buildMachine(); this.buildSheetSystem(); this.setCutaway(false); this.root.updateMatrixWorld(true);
  }
  mat(k){ if(!this._mat.has(k)) this._mat.set(k,new THREE.MeshStandardMaterial({
    color:C[k]??0x888888, metalness:['steel','silver'].includes(k)?.62:.18, roughness:k==='paper'?.88:k==='glass'?.18:.46,
    transparent:k==='glass', opacity:k==='glass'?.34:1, emissive:k==='uv'?0x341b56:0x000000, emissiveIntensity:k==='uv'?.4:0
  })); return this._mat.get(k); }
  geo(key,fn){ if(!this._geo.has(key))this._geo.set(key,fn()); return this._geo.get(key); }
  group(parent,id,name,pos=[0,0,0],explode=[0,.18,0],level=2){
    const g=new THREE.Group(); g.name=name; g.position.set(...pos);
    g.userData={assetId:OFFSET5_FINAL_META.assetId,nodeId:id,name,selectable:true,explode:new THREE.Vector3(...explode),taxonomyLevel:level,rest:null};
    parent.add(g); this.nodes.push(g); if(parent===this.root)this.parts.push(g); return g;
  }
  mesh(g,geo,key,kind,pos=[0,0,0],rot=[0,0,0],ud={}){
    const m=new THREE.Mesh(this.geo(key,geo),this.mat(kind));m.position.set(...pos);m.rotation.set(...rot);m.castShadow=kind!=='glass';m.receiveShadow=true;
    m.userData={ownerId:g.userData.nodeId,...ud}; g.add(m); return m;
  }
  box(g,s,p,k='body',r=.025,ud={}){return this.mesh(g,()=>r?new RoundedBoxGeometry(...s,2,r):new THREE.BoxGeometry(...s),'b:'+s.join(',')+':'+r,k,p,[0,0,0],ud)}
  cyl(g,r,l,p,k='steel',axis='z',ud={}){
    const rot=axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:[0,0,0];
    const m=this.mesh(g,()=>new THREE.CylinderGeometry(r,r,l,20),'c:'+r+':'+l+':'+axis,k,p,rot,ud); if(ud.rotor)this.rotors.push(m); return m;
  }
  cover(m){m.userData.exteriorCover=true;return m}
  labelPlate(g,text,p,scale=1){const q=this.box(g,[.48*scale,.18*scale,.018],p,'dark',.012,{idPlate:text});q.userData.label=text;return q}
  sideShell(g,width=1.0,height=1.72){
    for(const z of [-1.30,1.30]){
      this.cover(this.box(g,[width,height,.15],[0,1.53,z],'body2',.07));
      this.cover(this.box(g,[width*.82,.25,.025],[0,2.34,z+(z<0?-0.085:.085)],'dark',.025));
      this.box(g,[.20,.11,.035],[.27,1.66,z+(z<0?-0.095:.095)],'dark',.012,{serviceHandle:true});
    }
    this.cover(this.box(g,[width,.26,2.54],[0,2.47,0],'body',.05));
  }
  platform(g,x0,x1){
    const p=this.group(g,'o5-platform-'+x0,'OS service platform',[(x0+x1)/2,.46,-1.72],[0,0,-.4],3);
    this.box(p,[x1-x0,.10,.56],[0,0,0],'steel',.02);
    for(let x=-(x1-x0)/2+.25;x<(x1-x0)/2;x+=.55) this.box(p,[.018,.014,.46],[x,.058,0],'silver',.002);
    for(let x=-(x1-x0)/2+.2;x<(x1-x0)/2;x+=1.0)this.cyl(p,.018,.66,[x,.38,-.24],'steel','y');
    this.cyl(p,.018,x1-x0,[0,.70,-.24],'steel','x');
  }
  buildFeeder(){
    const g=this.group(this.root,'o5-feeder','Preset Plus feeder',[this.moduleX.FEEDER,0,0],[-1,.15,0],2);
    this.cover(this.box(g,[2.30,1.75,2.88],[-.05,1.46,0],'body',.09));
    const pile=this.group(g,'o5-feeder-pile','Feeder pile & lift',[-.55,0,0],[0,-.2,0],4);
    this.box(pile,[1.34,.07,1.78],[0,.58,0],'steel'); this.box(pile,[1.28,.96,1.70],[0,1.10,0],'paper',.012);
    const head=this.group(g,'o5-feeder-head','Suction head',[.32,0,0],[0,.25,0],4);
    this.box(head,[.70,.30,1.58],[0,2.26,0],'dark',.035);
    for(const z of [-.58,-.20,.20,.58]){const s=this.cyl(head,.032,.18,[.18,2.05,z],'rubber','y',{reciprocator:'feederSucker'});this.dynamic.push(s);}
    const air=this.group(g,'o5-feeder-air','Air / separator subsystem',[.15,0,0],[0,.18,.2],4);
    for(const z of [-.67,.67])this.cyl(air,.052,.20,[.02,1.95,z],'steel','x',{airNozzle:true});
    this.box(air,[.38,.26,.22],[-.42,2.03,.86],'dark',.025,{doubleSheetSensor:true});
    this.labelPlate(g,'HEIDELBERG / CD 102',[.10,1.83,-1.39],.9);
  }
  buildRegister(){
    const g=this.group(this.root,'o5-register','Feedboard + front/side lays',[this.moduleX.REGISTER,0,0],[-.6,.12,0],3);
    this.box(g,[1.50,.24,2.30],[0,1.20,0],'body',.035);
    this.box(g,[1.40,.035,2.12],[0,1.36,0],'steel',.004,{feedboard:true});
    for(let i=0;i<15;i++){const z=-.70+i*(1.40/14);this.box(g,[.045,.10,.035],[.47,1.425,z],'steel',.004,{frontLay:true});}
    for(const z of [-.78,.78])this.box(g,[.12,.11,.12],[.55,1.43,z],'silver',.01,{sideLay:true});
    for(const z of [-.62,0,.62])this.cyl(g,.030,1.10,[-.10,1.42,z],'rubber','x',{rotor:true,role:'feedWheel'});
  }
  buildPrintingUnit(i){
    const x=this.moduleX['PU'+i], g=this.group(this.root,'o5-pu'+i,'Printing Unit '+i,[x,0,0],[0,.22,(i%2?-.30:.30)],2);g.userData.unit=i;
    this.sideShell(g,1.04,1.78);
    const frame=this.group(g,'o5-pu'+i+'-frame','Side frames / bearer structure',[0,0,0],[0,.16,0],4);
    for(const z of [-1.15,1.15])for(const xx of [-.36,.36])this.box(frame,[.11,1.78,.11],[xx,1.50,z],'steel',.012);
    const train=this.group(g,'o5-pu'+i+'-cylinders','Plate / blanket / impression / transfer cylinder train',[0,0,0],[0,.2,0],4);
    const defs=[['plate',.205,-.10,1.88,'steel',1],['blanket',.225,.07,1.48,'rubber',-1],['impression',.275,-.08,1.02,'steel',1],['transfer',.275,.34,.58,'dark',-1]];
    for(const [role,r,xx,y,k,dir] of defs)this.cyl(train,r,2.44,[xx,y,0],k,'z',{rotor:true,role,spinDirection:dir,radius:r});
    const ink=this.group(g,'o5-pu'+i+'-inking','Inking + Alcolor dampening',[0,0,0],[0,.35,0],4);
    this.box(ink,[.76,.20,2.10],[-.22,2.66,0],'dark',.02,{inkFountain:true});
    const rollerDefs=[[-.34,2.31,.067,'steel'],[-.16,2.39,.060,'rubber'],[.04,2.40,.065,'steel'],[.24,2.30,.060,'rubber'],[-.24,2.16,.056,'rubber'],[-.02,2.20,.052,'steel'],[.19,2.14,.056,'rubber']];
    rollerDefs.forEach((d,j)=>this.cyl(ink,d[2],2.03,[d[0],d[1],0],d[3],'z',{rotor:true,role:'inkRoller'+(j+1),spinDirection:j%2?-1:1}));
    this.cyl(ink,.052,2.02,[-.34,2.02,0],'steel','z',{rotor:true,role:'dampeningPanRoller',spinDirection:1});
    this.cyl(ink,.047,2.02,[-.20,2.06,0],'rubber','z',{rotor:true,role:'dampeningFormRoller',spinDirection:-1});
    const access=this.group(g,'o5-pu'+i+'-access','Inter-unit access step',[.53,0,-1.56],[0,0,-.22],4);
    this.box(access,[.58,.15,.60],[0,.54,0],'steel',.025,{antiSlip:true});
    this.cyl(access,.018,.72,[.20,.98,-.25],'steel','y');this.cyl(access,.018,.72,[-.20,.98,-.25],'steel','y');this.cyl(access,.018,.40,[0,1.34,-.25],'steel','x');
    this.labelPlate(g,'PU '+i,[0,1.75,-1.39],.65);
  }
  buildCoater(){
    const g=this.group(this.root,'o5-coater','Inline coating unit L',[this.moduleX.COATER,0,0],[0,.2,.35],2);
    this.sideShell(g,1.18,1.86);
    const mech=this.group(g,'o5-coater-mech','Chamber blade / anilox / coating blanket',[0,0,0],[0,.25,0],4);
    this.cyl(mech,.11,2.18,[-.18,1.93,0],'silver','z',{rotor:true,role:'anilox',spinDirection:-1});
    this.box(mech,[.19,.11,2.00],[-.38,1.96,0],'dark',.015,{role:'chamberDoctorBlade'});
    this.cyl(mech,.235,2.40,[.02,1.46,0],'rubber','z',{rotor:true,role:'coatingBlanket',spinDirection:1});
    this.cyl(mech,.275,2.40,[-.08,1.00,0],'steel','z',{rotor:true,role:'coatingImpression',spinDirection:-1});
    this.box(mech,[.42,.34,.38],[-.42,.55,1.05],'body2',.035,{coatingPump:true});
  }
  buildInspection(){
    const g=this.group(this.root,'o5-inline-inspection','Inline inspection / Focusight position',[this.moduleX.INSPECTION,0,0],[0,.25,0],2);
    this.box(g,[.78,.20,2.38],[0,2.08,0],'dark',.025,{inspectionBridge:true});
    for(const z of [-.82,-.28,.28,.82])this.box(g,[.18,.12,.20],[0,1.90,z],'glass',.012,{cameraWindow:true});
    this.box(g,[.55,.16,.36],[.12,1.50,-1.30],'body2',.025,{inspectionController:true});
    g.userData.placementRule='AFTER_COATING_UNIT__NOT_AFTER_FEEDER';
  }
  buildDelivery(){
    const g=this.group(this.root,'o5-delivery','High-pile delivery',[this.moduleX.DELIVERY,0,0],[1,.15,0],2);
    this.cover(this.box(g,[2.25,2.05,2.92],[.15,1.55,0],'body',.09));
    const chain=this.group(g,'o5-delivery-chain','Gripper-chain delivery',[0,0,0],[.3,.2,0],4);
    for(const z of [-1.10,1.10]){this.box(chain,[1.66,.055,.055],[0,1.78,z],'dark',.004);for(const x of [-.62,-.20,.22,.64])this.box(chain,[.12,.07,.16],[x,1.73,z],'steel',.006,{gripper:true});}
    const brake=this.group(g,'o5-sheet-brake','Dynamic sheet brake',[0,0,0],[.2,.2,0],4);
    for(const z of [-.65,0,.65])this.cyl(brake,.07,.24,[.58,1.12,z],'rubber','z',{rotor:true,role:'sheetBrake',spinDirection:-1});
    const pile=this.group(g,'o5-delivery-pile','Delivery pile',[-.05,0,0],[0,-.2,0],4);
    this.box(pile,[1.48,.07,1.80],[.18,.47,0],'steel'); for(let i=0;i<26;i++)this.box(pile,[1.42,.006,1.73],[.18,.55+i*.0065,0],'paper',.001);
    this.box(g,[.86,.12,.28],[.65,1.55,-1.46],'white',.02,{deliveryConsole:true});
  }
  buildMachine(){
    const base=this.group(this.root,'o5-base','Machine bed / common base',[0,0,0],[0,-.3,0],1);
    this.box(base,[18.2,.22,3.02],[.2,.19,0],'dark',.035);
    this.platform(this.root,-5.25,5.2);
    this.buildFeeder();this.buildRegister();for(let i=1;i<=8;i++)this.buildPrintingUnit(i);this.buildCoater();this.buildInspection();this.buildDelivery();
    for(const n of this.nodes){n.userData.rest=n.position.clone();n.userData.restQuaternion=n.quaternion.clone();}
  }
  buildSheetSystem(){
    const pts=[
      [-8.38,1.63,0],[-7.35,1.54,0],[-6.10,1.41,0],
      ...Array.from({length:8},(_,i)=>[this.moduleX['PU'+(i+1)],1.03,0]),
      [5.78,1.03,0],[6.92,1.10,0],[8.00,1.22,0],[8.68,.83,0]
    ].map(p=>new THREE.Vector3(...p));
    this.sheetCurve=new THREE.CatmullRomCurve3(pts,false,'catmullrom',.25);
    const sheetGeo=new THREE.BoxGeometry(.62,.018,.96);
    for(let i=0;i<18;i++){const m=new THREE.Mesh(sheetGeo,this.mat('paper').clone());m.visible=false;m.userData={phase:i/18,lap:-1,printedUnits:0};this.root.add(m);this.sheets.push(m);}
  }
  setCutaway(on){this.cutaway=!!on;this.root.traverse(o=>{if(o.isMesh&&o.userData.exteriorCover)o.visible=!this.cutaway});}
  setExplodeLevel(level=0){for(const n of this.nodes){if(!n.userData.rest)continue;n.position.copy(n.userData.rest);if(level>=n.userData.taxonomyLevel)n.position.addScaledVector(n.userData.explode,Math.min(1,(level-n.userData.taxonomyLevel+1)/2));}}
  select(nodeId){this.root.traverse(o=>{if(!o.material)return;const owner=o.userData.ownerId; if(!this._selectionOriginal)o.userData._baseOpacity=o.material.opacity; o.material.transparent=nodeId?true:o.material.transparent; o.material.opacity=!nodeId||owner===nodeId?1:.13;});}
  start(){this.running=true} pause(){this.running=false}
  reset(){this.elapsed=0;this.running=false;this.sheets.forEach(s=>{s.visible=false;s.userData.lap=-1});}
  update(dt){
    if(!this.running)return; const d=Math.min(.05,Math.max(0,dt))*this.speed;this.elapsed+=d;
    for(const r of this.rotors){const a=r.userData.rotorAxis||'z',dir=r.userData.spinDirection||1;r.rotation[a]+=d*5.8*dir;}
    for(const s of this.dynamic){const phase=(this.elapsed*3.2+s.position.z)%1;s.position.y-=Math.sin(phase*Math.PI*2)*.0009;}
    for(const [i,s] of this.sheets.entries()){
      const raw=this.elapsed/12+i/this.sheets.length,t=raw%1,p=this.sheetCurve.getPointAt(t),q=this.sheetCurve.getPointAt(Math.min(.999,t+.002));
      s.visible=true;s.position.copy(p);s.rotation.set(-Math.PI/2,0,-Math.atan2(q.y-p.y,Math.max(.001,q.x-p.x)));
      s.userData.printedUnits=Object.values(this.moduleX).filter((x,idx)=>String(Object.keys(this.moduleX)[idx]).startsWith('PU')&&p.x>x+.25).length;
      if(raw>=1&&Math.floor(raw)>s.userData.lap)s.userData.lap=Math.floor(raw);
    }
  }
  dispose(){this.root.traverse(o=>{if(o.isMesh&&o.material&&!Object.values(this._mat).includes(o.material)&&o.material.dispose)o.material.dispose()});for(const g of this._geo.values())g.dispose();for(const m of this._mat.values())m.dispose();}
}
export const createOffset5Final=(opts)=>new Offset5Final(opts);