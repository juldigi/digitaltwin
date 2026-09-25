// BMJ Packaging Offset Digital Twin — dedicated machine module
// Standalone candidate module. Does not modify the live application.
// THREE.js geometry is visual/functional reconstruction, not OEM CAD.
// Dimensions marked VERIFIED come from cited/OEM-family technical data; installed-only details remain explicit estimates.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const OFFSET8_FINAL_META=Object.freeze({
 assetId:'BMJ-MCH-0005',code:'OFS-8',name:'OFFSET - 8 MACHINE',manufacturer:'HEIDELBERG',
 model:'Speedmaster CX 104-8+LYYL',serial:'XB001916',process:'SHEETFED_OFFSET_8C_INLINE_FINISHING',
 operatorSide:'NEGATIVE_Z',driveSide:'POSITIVE_Z',
 verifiedFamily:{maxSheetMM:[720,1040],maxPrintMM:[710,1020],stockMM:[0.03,1.0],speedSPH:{standard:15000,option:16500},pileMM:{feeder:1320,delivery:1295}},
 installedSequence:['FEEDER','REGISTER','PU1','PU2','PU3','PU4','PU5','PU6','PU7','PU8','L1','Y1','Y2','L2','DELIVERY'],
 semanticBoundary:'Y1/Y2 ARE INSTALLED CONFIGURATION TOKENS; THIS MODULE DOES NOT CLAIM THEIR EXACT DRYER TECHNOLOGY WITHOUT BMJ/OEM CONFIGURATION PROOF.'
});
const P={body:0xe2e2dd,dark:0x20282d,graphite:0x38434a,steel:0x909da2,silver:0xc4ccce,rubber:0x1c2327,paper:0xf3eedf,blue:0x2f6d98,amber:0xd5a03e,glass:0x6aa5b5,coat:0x88a9a5};
export class Offset8Final{
 constructor(){this.root=new THREE.Group();this.root.name='OFS-8 · CX 104-8+LYYL';this.root.userData={...OFFSET8_FINAL_META,taxonomyLevels:6};this.nodes=[];this.rotors=[];this.sheets=[];this.geoCache=new Map();this.matCache=new Map();this.elapsed=0;this.running=false;
  this.x={F:-8.6,R:-7.0,P1:-5.7,P2:-4.35,P3:-3.0,P4:-1.65,P5:-.30,P6:1.05,P7:2.40,P8:3.75,L1:5.15,Y1:6.38,Y2:7.55,L2:8.78,D:10.35};this.build();this.buildSheets();}
 mat(k){if(!this.matCache.has(k))this.matCache.set(k,new THREE.MeshStandardMaterial({color:P[k]??0x888888,metalness:['steel','silver'].includes(k)?.6:.12,roughness:k==='paper'?.9:.44,transparent:k==='glass',opacity:k==='glass'?.32:1}));return this.matCache.get(k)}
 geo(k,f){if(!this.geoCache.has(k))this.geoCache.set(k,f());return this.geoCache.get(k)}
 group(p,id,name,pos=[0,0,0],ex=[0,.2,0],lvl=2){const g=new THREE.Group();g.name=name;g.position.set(...pos);g.userData={assetId:OFFSET8_FINAL_META.assetId,nodeId:id,name,explode:new THREE.Vector3(...ex),taxonomyLevel:lvl,selectable:true};p.add(g);this.nodes.push(g);return g}
 mesh(g,f,key,k,p=[0,0,0],r=[0,0,0],ud={}){const m=new THREE.Mesh(this.geo(key,f),this.mat(k));m.position.set(...p);m.rotation.set(...r);m.castShadow=k!=='glass';m.receiveShadow=true;m.userData={ownerId:g.userData.nodeId,...ud};g.add(m);return m}
 box(g,s,p,k='body',r=.025,ud={}){return this.mesh(g,()=>r?new RoundedBoxGeometry(...s,2,r):new THREE.BoxGeometry(...s),'b'+s+r,k,p,[0,0,0],ud)}
 cyl(g,r,l,p,k='steel',axis='z',ud={}){const rot=axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:[0,0,0];const m=this.mesh(g,()=>new THREE.CylinderGeometry(r,r,l,24),'c'+r+l+axis,k,p,rot,ud);if(ud.rotor)this.rotors.push(m);return m}
 cover(m){m.userData.exteriorCover=true;return m}
 shell(g,label){for(const z of [-1.42,1.42]){this.cover(this.box(g,[1.05,1.84,.16],[0,1.58,z],'body',.075));this.cover(this.box(g,[.84,.27,.025],[0,2.40,z+(z<0?-.09:.09)],'dark',.02));}this.cover(this.box(g,[1.08,.26,2.70],[0,2.55,0],'graphite',.04));this.box(g,[.42,.14,.025],[.18,1.72,-1.515],'dark',.012,{idPlate:label})}
 feeder(){const g=this.group(this.root,'o8-feeder','Preset Plus feeder',[this.x.F,0,0],[-1,.2,0],2);this.cover(this.box(g,[2.3,1.86,3.05],[0,1.52,0],'body',.10));this.box(g,[1.45,.07,1.88],[-.58,.56,0],'steel');this.box(g,[1.39,1.04,1.82],[-.58,1.12,0],'paper');
  const h=this.group(g,'o8-suction','Suction head',[.3,0,0],[0,.25,0],4);this.box(h,[.72,.30,1.70],[0,2.38,0],'dark',.03);for(const z of [-.62,-.22,.22,.62])this.cyl(h,.032,.20,[.18,2.16,z],'rubber','y',{reciprocator:true});
 }
 register(){const g=this.group(this.root,'o8-register','Stream feeder + register',[this.x.R,0,0],[-.6,.15,0],3);this.box(g,[1.50,.54,2.48],[0,1.10,0],'graphite',.05);this.box(g,[1.44,.035,2.30],[0,1.41,0],'steel',.004);for(const z of [-.7,0,.7])this.cyl(g,.03,1.28,[-.06,1.46,z],'rubber','x',{rotor:true,spin:1});for(const z of [-.80,.80])this.box(g,[.12,.10,.12],[.60,1.46,z],'silver',.008,{lay:true})}
 pu(i){const g=this.group(this.root,'o8-pu'+i,'Printing Unit '+i,[this.x['P'+i],0,0],[0,.22,i%2?.34:-.34],2);this.shell(g,'PU '+i);
  const c=this.group(g,'o8-pu'+i+'-cyl','Offset cylinder train',[0,0,0],[0,.2,0],4);[['plate',.20,-.10,1.92,'steel',1],['blanket',.22,.06,1.52,'rubber',-1],['impression',.28,-.10,1.03,'steel',1],['transfer',.28,.34,.58,'dark',-1]].forEach(d=>this.cyl(c,d[1],2.60,[d[2],d[3],0],d[4],'z',{rotor:true,role:d[0],spin:d[5]}));
  const ink=this.group(g,'o8-pu'+i+'-ink','Inking + Alcolor dampening',[0,0,0],[0,.32,0],4);this.box(ink,[.76,.20,2.20],[-.24,2.72,0],'dark',.02,{inkFountain:true});[[-.34,2.38,.067],[-.15,2.46,.058],[.05,2.46,.064],[.25,2.36,.058],[-.22,2.20,.055],[0,2.22,.052],[.20,2.18,.055]].forEach((d,j)=>this.cyl(ink,d[2],2.12,[d[0],d[1],0],j%2?'rubber':'steel','z',{rotor:true,spin:j%2?-1:1,role:'ink'+j}));
  this.cyl(ink,.052,2.10,[-.34,2.06,0],'steel','z',{rotor:true,spin:1,role:'dampPan'});this.cyl(ink,.047,2.10,[-.18,2.10,0],'rubber','z',{rotor:true,spin:-1,role:'dampForm'});
 }
 coater(key,x){const g=this.group(this.root,'o8-'+key.toLowerCase(),'Coating unit '+key,[x,0,0],[0,.25,.34],2);this.shell(g,key);this.cyl(g,.12,2.30,[-.18,1.96,0],'silver','z',{rotor:true,spin:-1,role:'anilox'});this.box(g,[.20,.11,2.12],[-.40,1.98,0],'dark',.012,{role:'chamberDoctorBlade'});this.cyl(g,.24,2.58,[.02,1.50,0],'rubber','z',{rotor:true,spin:1,role:'coatingBlanket'});this.cyl(g,.28,2.58,[-.08,1.03,0],'steel','z',{rotor:true,spin:-1,role:'impression'})}
 dryer(key,x){const g=this.group(this.root,'o8-'+key.toLowerCase(),'Inline dryer module '+key,[x,0,0],[0,.22,0],2);this.cover(this.box(g,[1.05,1.75,3.0],[0,1.55,0],'graphite',.08));this.box(g,[.78,.18,2.46],[0,1.42,0],'dark',.02,{dryerEmitter:true,technology:'UNVERIFIED'});for(const z of [-.95,-.48,0,.48,.95])this.box(g,[.55,.05,.16],[0,1.28,z],'amber',.008,{airOrEmitterSlot:true});g.userData.technology='UNVERIFIED_INSTALLED_Y_MODULE'}
 delivery(){const g=this.group(this.root,'o8-delivery','Preset Plus delivery',[this.x.D,0,0],[1,.2,0],2);this.cover(this.box(g,[2.6,2.22,3.12],[.05,1.62,0],'body',.10));for(const z of [-1.14,1.14])this.box(g,[1.95,.055,.055],[0,1.90,z],'dark',.004,{chainGuide:true});for(const z of [-.72,0,.72])this.cyl(g,.075,.26,[.66,1.20,z],'rubber','z',{rotor:true,spin:-1,role:'dynamicSheetBrake'});this.box(g,[1.55,.07,1.92],[.18,.46,0],'steel');for(let i=0;i<30;i++)this.box(g,[1.48,.006,1.84],[.18,.54+i*.006,0],'paper',.001)}
 build(){const b=this.group(this.root,'o8-base','CX104 machine base',[0,0,0],[0,-.3,0],1);this.box(b,[21.8,.24,3.22],[.8,.18,0],'dark',.04);this.feeder();this.register();for(let i=1;i<=8;i++)this.pu(i);this.coater('L1',this.x.L1);this.dryer('Y1',this.x.Y1);this.dryer('Y2',this.x.Y2);this.coater('L2',this.x.L2);this.delivery();for(const n of this.nodes)n.userData.rest=n.position.clone()}
 buildSheets(){const pts=[[this.x.F-.7,1.65,0],[this.x.R,1.46,0],...Array.from({length:8},(_,i)=>[this.x['P'+(i+1)],1.04,0]),[this.x.L1,1.05,0],[this.x.Y1,1.08,0],[this.x.Y2,1.10,0],[this.x.L2,1.05,0],[this.x.D+.7,.82,0]].map(p=>new THREE.Vector3(...p));this.curve=new THREE.CatmullRomCurve3(pts,false,'catmullrom',.25);const g=new THREE.BoxGeometry(.66,.018,1.00);for(let i=0;i<20;i++){const m=new THREE.Mesh(g,this.mat('paper').clone());m.userData.phase=i/20;m.visible=false;this.root.add(m);this.sheets.push(m)}}
 setCutaway(on){this.root.traverse(o=>{if(o.isMesh&&o.userData.exteriorCover)o.visible=!on})}
 start(){this.running=true}pause(){this.running=false}reset(){this.elapsed=0;this.running=false;this.sheets.forEach(s=>s.visible=false)}
 update(dt){if(!this.running)return;dt=Math.min(.05,Math.max(0,dt));this.elapsed+=dt;for(const r of this.rotors)r.rotation.z+=dt*6*(r.userData.spin||1);for(const [i,s] of this.sheets.entries()){const t=(this.elapsed/13+s.userData.phase)%1,p=this.curve.getPointAt(t),q=this.curve.getPointAt(Math.min(.999,t+.002));s.visible=true;s.position.copy(p);s.rotation.set(-Math.PI/2,0,-Math.atan2(q.y-p.y,Math.max(.001,q.x-p.x)));}}
}
export const createOffset8Final=()=>new Offset8Final();