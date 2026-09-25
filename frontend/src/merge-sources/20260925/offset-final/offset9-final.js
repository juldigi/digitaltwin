// BMJ Packaging Offset Digital Twin — dedicated machine module
// Standalone candidate module. Does not modify the live application.
// THREE.js geometry is visual/functional reconstruction, not OEM CAD.
// Dimensions marked VERIFIED come from cited/OEM-family technical data; installed-only details remain explicit estimates.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const OFFSET9_FINAL_META=Object.freeze({
 assetId:'BMJ-MCH-0006',code:'OFS-9',name:'OFFSET - 9 MACHINE',manufacturer:'HEIDELBERG',
 model:'Speedmaster SX 52-4+L',serial:'GS001804',process:'COMPACT_B3_SHEETFED_OFFSET_4C_PLUS_COATING',
 familyReference:{maxSheetMM:[370,520],speedSPH:15000,stockMM:[0.03,0.40],optionalStockMM:0.60},
 sequence:['FEEDER','REGISTER','PU1','PU2','PU3','PU4','COATER_L','DRYING_DELIVERY'],
 sourceBasis:['HEIDELBERG Speedmaster SX 52 product brochure','HEIDELBERG sheetfed press technical overview','machine-market visual references'],
 confidence:'MODEL_IDENTITY_CONFIRMED__INSTALLED_OPTION_DETAILS_PARTLY_FAMILY_REFERENCE'
});
const C={light:0xdedfdc,graph:0x30383d,dark:0x171c20,steel:0x919ba0,silver:0xc5ccce,rubber:0x1e2326,paper:0xf1eddf,amber:0xd2a14a,glass:0x709daa};
export class Offset9Final{
 constructor(){this.root=new THREE.Group();this.root.name='OFS-9 · Speedmaster SX 52-4+L';this.root.userData={...OFFSET9_FINAL_META,taxonomyLevels:6};this.nodes=[];this.rotors=[];this.sheets=[];this.gc=new Map();this.mc=new Map();this.elapsed=0;this.running=false;this.x={F:-4.70,R:-3.63,P1:-2.65,P2:-1.60,P3:-.55,P4:.50,L:1.72,D:3.35};this.build();this.buildSheets()}
 mat(k){if(!this.mc.has(k))this.mc.set(k,new THREE.MeshStandardMaterial({color:C[k]??0x888888,metalness:['steel','silver'].includes(k)?.58:.12,roughness:k==='paper'?.9:.45,transparent:k==='glass',opacity:k==='glass'?.34:1}));return this.mc.get(k)}
 geo(k,f){if(!this.gc.has(k))this.gc.set(k,f());return this.gc.get(k)}
 group(p,id,name,pos=[0,0,0],ex=[0,.15,0],lvl=2){const g=new THREE.Group();g.name=name;g.position.set(...pos);g.userData={assetId:OFFSET9_FINAL_META.assetId,nodeId:id,name,explode:new THREE.Vector3(...ex),taxonomyLevel:lvl,selectable:true};p.add(g);this.nodes.push(g);return g}
 mesh(g,f,key,k,p=[0,0,0],rot=[0,0,0],ud={}){const m=new THREE.Mesh(this.geo(key,f),this.mat(k));m.position.set(...p);m.rotation.set(...rot);m.castShadow=k!=='glass';m.receiveShadow=true;m.userData={ownerId:g.userData.nodeId,...ud};g.add(m);return m}
 box(g,s,p,k='light',r=.02,ud={}){return this.mesh(g,()=>r?new RoundedBoxGeometry(...s,2,r):new THREE.BoxGeometry(...s),'b'+s+r,k,p,[0,0,0],ud)}
 cyl(g,r,l,p,k='steel',axis='z',ud={}){const rot=axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:[0,0,0];const m=this.mesh(g,()=>new THREE.CylinderGeometry(r,r,l,20),'c'+r+l+axis,k,p,rot,ud);if(ud.rotor)this.rotors.push(m);return m}
 cover(m){m.userData.exteriorCover=true;return m}
 shell(g,label){for(const z of [-.84,.84]){this.cover(this.box(g,[.78,1.26,.12],[0,1.20,z],'light',.055));this.cover(this.box(g,[.60,.18,.022],[0,1.82,z+(z<0?-.07:.07)],'graph',.018));}this.cover(this.box(g,[.80,.18,1.58],[0,1.90,0],'graph',.035));this.box(g,[.30,.11,.02],[.15,1.36,-.91],'dark',.01,{label})}
 feeder(){const g=this.group(this.root,'o9-feeder','SX52 feeder',[this.x.F,0,0],[-.7,.15,0],2);this.cover(this.box(g,[1.55,1.30,1.84],[0,1.13,0],'graph',.07));this.box(g,[.92,.06,1.12],[-.32,.47,0],'steel');this.box(g,[.88,.68,1.08],[-.32,.84,0],'paper');const h=this.group(g,'o9-suction','Feeder suction head',[.30,0,0],[0,.2,0],4);this.box(h,[.52,.22,.98],[0,1.74,0],'dark',.025);for(const z of [-.35,-.12,.12,.35])this.cyl(h,.023,.12,[.14,1.58,z],'rubber','y',{reciprocator:true})}
 register(){const g=this.group(this.root,'o9-register','Central suction tape + register',[this.x.R,0,0],[-.4,.1,0],3);this.box(g,[1.02,.32,1.44],[0,.92,0],'graph',.04);this.box(g,[.96,.025,.18],[0,1.11,0],'rubber',.004,{centralSuctionTape:true});for(const z of [-.44,.44])this.box(g,[.10,.08,.10],[.38,1.12,z],'silver',.006,{lay:true});for(const z of [-.32,0,.32])this.cyl(g,.024,.78,[-.10,1.12,z],'rubber','x',{rotor:true,spin:1})}
 pu(i){const g=this.group(this.root,'o9-pu'+i,'Printing Unit '+i,[this.x['P'+i],0,0],[0,.18,i%2?.23:-.23],2);this.shell(g,'PU'+i);const c=this.group(g,'o9-pu'+i+'-cyl','Compact offset cylinder train',[0,0,0],[0,.15,0],4);[['plate',.145,-.08,1.42,'steel',1],['blanket',.16,.05,1.12,'rubber',-1],['impression',.18,-.07,.78,'steel',1],['transfer',.18,.24,.47,'dark',-1]].forEach(d=>this.cyl(c,d[1],1.42,[d[2],d[3],0],d[4],'z',{rotor:true,role:d[0],spin:d[5]}));
  const ink=this.group(g,'o9-pu'+i+'-ink','Inking + dampening',[0,0,0],[0,.22,0],4);this.box(ink,[.58,.14,1.24],[-.18,1.95,0],'dark',.015,{inkFountain:true});[[-.24,1.72,.047],[-.10,1.78,.043],[.06,1.78,.047],[.20,1.70,.043],[-.15,1.59,.040],[.02,1.61,.039]].forEach((d,j)=>this.cyl(ink,d[2],1.20,[d[0],d[1],0],j%2?'rubber':'steel','z',{rotor:true,spin:j%2?-1:1}));this.cyl(ink,.038,1.20,[-.26,1.49,0],'steel','z',{rotor:true,spin:1,role:'Alcolor'});this.cyl(ink,.035,1.20,[-.13,1.52,0],'rubber','z',{rotor:true,spin:-1,role:'dampForm'})}
 coater(){const g=this.group(this.root,'o9-coater','Chamber blade coating unit L',[this.x.L,0,0],[0,.18,.25],2);this.shell(g,'L');this.cyl(g,.085,1.30,[-.14,1.48,0],'silver','z',{rotor:true,spin:-1,role:'anilox'});this.box(g,[.14,.08,1.18],[-.28,1.50,0],'dark',.01,{role:'chamberBlade'});this.cyl(g,.165,1.42,[.02,1.12,0],'rubber','z',{rotor:true,spin:1,role:'coatingBlanket'});this.cyl(g,.18,1.42,[-.06,.79,0],'steel','z',{rotor:true,spin:-1,role:'impression'})}
 delivery(){const g=this.group(this.root,'o9-delivery','SX52 delivery + DryStar family zone',[this.x.D,0,0],[.7,.15,0],2);this.cover(this.box(g,[1.95,1.48,1.90],[.05,1.18,0],'graph',.08));this.box(g,[.92,.13,1.50],[-.20,1.34,0],'dark',.02,{dryingZone:true});for(const z of [-.45,0,.45])this.cyl(g,.052,.16,[.45,.91,z],'rubber','z',{rotor:true,spin:-1,role:'sheetBrake'});this.box(g,[1.02,.06,1.18],[.25,.42,0],'steel');for(let i=0;i<22;i++)this.box(g,[.98,.005,1.14],[.25,.49+i*.0055,0],'paper',.001)}
 build(){const b=this.group(this.root,'o9-base','SX52 compact common base',[0,0,0],[0,-.2,0],1);this.box(b,[9.4,.19,1.98],[-.3,.14,0],'dark',.03);this.feeder();this.register();for(let i=1;i<=4;i++)this.pu(i);this.coater();this.delivery();for(const n of this.nodes)n.userData.rest=n.position.clone()}
 buildSheets(){const pts=[[this.x.F-.4,1.16,0],[this.x.R,1.10,0],...Array.from({length:4},(_,i)=>[this.x['P'+(i+1)],.80,0]),[this.x.L,.80,0],[this.x.D+.5,.67,0]].map(p=>new THREE.Vector3(...p));this.curve=new THREE.CatmullRomCurve3(pts,false,'catmullrom',.2);const geo=new THREE.BoxGeometry(.40,.012,.54);for(let i=0;i<14;i++){const m=new THREE.Mesh(geo,this.mat('paper').clone());m.userData.phase=i/14;m.visible=false;this.root.add(m);this.sheets.push(m)}}
 setCutaway(on){this.root.traverse(o=>{if(o.isMesh&&o.userData.exteriorCover)o.visible=!on})}start(){this.running=true}pause(){this.running=false}reset(){this.running=false;this.elapsed=0;this.sheets.forEach(s=>s.visible=false)}
 update(dt){if(!this.running)return;dt=Math.min(.05,Math.max(0,dt));this.elapsed+=dt;for(const r of this.rotors)r.rotation.z+=dt*7*(r.userData.spin||1);for(const [i,s] of this.sheets.entries()){const t=(this.elapsed/9+i/this.sheets.length)%1,p=this.curve.getPointAt(t),q=this.curve.getPointAt(Math.min(.999,t+.002));s.visible=true;s.position.copy(p);s.rotation.set(-Math.PI/2,0,-Math.atan2(q.y-p.y,Math.max(.001,q.x-p.x)));}}
}
export const createOffset9Final=()=>new Offset9Final();