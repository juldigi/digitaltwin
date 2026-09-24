import * as T from 'three';
import {IPAL_PHOTO_EVIDENCE_V205} from './data/ipal-photo-evidence-v205.js';

const ACCURACY='PHOTO_ACTUAL_VISUAL_RECONSTRUCTION_RELATIVE_PLACEMENT';
const matCache=new Map();
function mat(color,roughness=.72,metalness=.08,opacity=1){
 const key=[color,roughness,metalness,opacity].join(':');
 if(!matCache.has(key))matCache.set(key,new T.MeshStandardMaterial({color,roughness,metalness,transparent:opacity<1,opacity,depthWrite:opacity>=.98,side:T.DoubleSide}));
 return matCache.get(key);
}
function tag(o,semantic,extra={}){if(o)o.userData={...o.userData,semantic,accuracy:ACCURACY,evidenceLayer:'PHOTO_ACTUAL_20260924',evidenceVersion:IPAL_PHOTO_EVIDENCE_V205.version,sourcePhotos:extra.sourcePhotos||IPAL_PHOTO_EVIDENCE_V205.sourcePhotos,...extra};return o;}
function meshBox(parent,x,y,z,w,h,d,color,opts={}){const o=new T.Mesh(new T.BoxGeometry(w,h,d),mat(color,opts.roughness??.78,opts.metalness??.05,opts.opacity??1));o.position.set(x,y,z);if(opts.rx)o.rotation.x=opts.rx;if(opts.ry)o.rotation.y=opts.ry;if(opts.rz)o.rotation.z=opts.rz;o.castShadow=opts.castShadow!==false;o.receiveShadow=true;parent.add(o);return o;}
function rod(parent,a,b,r,color,semantic,extra={}){const delta=new T.Vector3().subVectors(b,a),o=new T.Mesh(new T.CylinderGeometry(r,r,delta.length(),8),mat(color,.58,.22));o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.clone().normalize());parent.add(o);return tag(o,semantic,extra);}
function cyl(parent,x,y,z,r,h,color,semantic,opts={}){const o=new T.Mesh(new T.CylinderGeometry(opts.rTop??r,opts.rBottom??r,h,opts.segments??28,opts.heightSegments??1,!!opts.openEnded),mat(color,opts.roughness??.55,opts.metalness??.35,opts.opacity??1));o.position.set(x,y,z);if(opts.rx)o.rotation.x=opts.rx;if(opts.ry)o.rotation.y=opts.ry;if(opts.rz)o.rotation.z=opts.rz;parent.add(o);return tag(o,semantic,opts.meta||{});}
function torus(parent,x,y,z,r,tube,color,semantic,opts={}){const o=new T.Mesh(new T.TorusGeometry(r,tube,8,opts.segments??36),mat(color,opts.roughness??.48,opts.metalness??.30,opts.opacity??1));o.position.set(x,y,z);o.rotation.x=opts.rx??Math.PI/2;if(opts.ry)o.rotation.y=opts.ry;if(opts.rz)o.rotation.z=opts.rz;parent.add(o);return tag(o,semantic,opts.meta||{});}
function sphere(parent,x,y,z,r,color,semantic,opts={}){const o=new T.Mesh(new T.SphereGeometry(r,opts.segments??10,opts.rows??7),mat(color,opts.roughness??.8,opts.metalness??0,opts.opacity??1));o.position.set(x,y,z);parent.add(o);return tag(o,semantic,opts.meta||{});}
function pipe(parent,pts,color=0xd7dedb,r=.04,semantic='IPAL_PHOTO_PIPE_ROUTE_VISUAL',extra={}){let count=0;for(let i=1;i<pts.length;i++){rod(parent,new T.Vector3(...pts[i-1]),new T.Vector3(...pts[i]),r,color,semantic,{processFunction:'UNVERIFIED_FROM_PHOTOS',...extra});count++;}return count;}
function flange(parent,x,y,z,r=.12,color=0x6d7a7d,rotation='z'){const o=new T.Mesh(new T.TorusGeometry(r,.025,8,18),mat(color,.42,.48));o.position.set(x,y,z);if(rotation==='z')o.rotation.y=Math.PI/2;else o.rotation.x=Math.PI/2;parent.add(o);return tag(o,'IPAL_PHOTO_PIPE_FLANGE',{processFunction:'UNVERIFIED_FROM_PHOTOS'});}
function valve(parent,x,y,z,rot=0){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rot;parent.add(g);torus(g,0,.15,0,.14,.025,0xd5aa24,'IPAL_PHOTO_MANUAL_VALVE_WHEEL',{rx:Math.PI/2});rod(g,new T.Vector3(0,-.08,0),new T.Vector3(0,.16,0),.018,0x65767a,'IPAL_PHOTO_VALVE_STEM');tag(g,'IPAL_PHOTO_MANUAL_VALVE',{processFunction:'UNVERIFIED_FROM_PHOTOS'});return g;}
function railRun(parent,a,b,baseY=0,height=.92,color=0xd4aa20){const dir=new T.Vector3().subVectors(b,a),len=dir.length(),n=Math.max(2,Math.round(len/.85)),top=baseY+height,mid=baseY+height*.55;rod(parent,new T.Vector3(a.x,top,a.z),new T.Vector3(b.x,top,b.z),.025,color,'IPAL_PHOTO_HANDRAIL_TOP');rod(parent,new T.Vector3(a.x,mid,a.z),new T.Vector3(b.x,mid,b.z),.018,color,'IPAL_PHOTO_HANDRAIL_MID');for(let i=0;i<=n;i++){const p=a.clone().lerp(b,i/n);rod(parent,new T.Vector3(p.x,baseY,p.z),new T.Vector3(p.x,top,p.z),.018,color,'IPAL_PHOTO_HANDRAIL_POST');}}
function stair(parent,start,end,steps=12,width=.72,color=0xd4aa20){const a=new T.Vector3(...start),b=new T.Vector3(...end),g=new T.Group();parent.add(g);for(let i=0;i<steps;i++){const t=(i+.5)/steps,p=a.clone().lerp(b,t);meshBox(g,p.x,p.y,p.z,width,.055,.24,0x6f7c7d,{metalness:.35,roughness:.58});}const side=.38;for(const s of [-1,1]){rod(g,new T.Vector3(a.x+s*side,a.y,a.z),new T.Vector3(b.x+s*side,b.y,b.z),.035,color,'IPAL_PHOTO_STAIR_STRINGER');rod(g,new T.Vector3(a.x+s*side,a.y+.90,a.z),new T.Vector3(b.x+s*side,b.y+.90,b.z),.025,color,'IPAL_PHOTO_STAIR_HANDRAIL');}tag(g,'IPAL_PHOTO_ACCESS_STAIR',{stepCount:steps});return g;}
function register(equipment,semantic,bounds,confidence='PHOTO_VERIFIED_OBJECT_RELATIVE_POSITION'){equipment.push({semantic,...bounds,confidence,evidenceVersion:IPAL_PHOTO_EVIDENCE_V205.version});}

export function upgradeIpalFromPhotoEvidence({ipal,roofLayer,label,buildingDetailStats,ipalEquipment}){
 const legacy=[...ipal.children];for(const o of legacy){o.visible=false;o.userData={...o.userData,supersededByPhotoActualV205:true,visualizationMode:'LEGACY_REFERENCE_SUPERSEDED_BY_PHOTO_ACTUAL'};}
 roofLayer?.traverse?.(o=>{if(/^IPAL_/i.test(String(o.userData?.semantic||''))){o.visible=false;o.userData={...o.userData,supersededByPhotoActualV205:true};}});
 ipalEquipment.length=0;
 const g=new T.Group();g.name='IPAL_PHOTO_ACTUAL_V205';ipal.add(g);tag(g,'IPAL_PHOTO_ACTUAL_ROOT',{sourcePhotos:IPAL_PHOTO_EVIDENCE_V205.sourcePhotos,coreProcess:true});
 const stats={objects:0,canopyMembers:0,pipeSegments:0,safetyElements:0,landscapeElements:0,verifiedLabels:0,legacyChildrenSuperseded:legacy.length};
 const add=(o)=>{stats.objects++;return o;};

 // Ground / civil: pavers, concrete pads, drains and subtle field wear.
 add(tag(meshBox(g,46.4,.055,-110.9,26.4,.11,14.1,0x9ba4a2,{roughness:.94,metalness:0}),'IPAL_PHOTO_PAVED_PROCESS_YARD',{sourcePhotos:['IMG_2515','IMG_2517','IMG_2523','IMG_2525']}));
 for(let x=34;x<=59;x+=1.05){add(tag(meshBox(g,x,.112,-110.9,.015,.01,13.4,0x7f8987,{roughness:.98}),'IPAL_PHOTO_PAVER_JOINT'));}
 for(let z=-104.6;z>=-117.3;z-=.72){add(tag(meshBox(g,46.4,.113,z,25.4,.01,.012,0x7f8987,{roughness:.98}),'IPAL_PHOTO_PAVER_JOINT'));}
 for(const [x,z,w,d] of [[46.4,-117.72,25.8,.28],[59.42,-110.9,.28,13.6]]){add(tag(meshBox(g,x,.09,z,w,.08,d,0x53646a,{metalness:.18}),'IPAL_PHOTO_OPEN_DRAIN'));}
 for(let x=34.2;x<59;x+=1.0)add(tag(meshBox(g,x,.145,-117.72,.68,.025,.30,0x394b52,{metalness:.55}),'IPAL_PHOTO_DRAIN_GRATING'));

 // Main open-sided canopy. Geometry follows the visible shallow curved roof rather than the former generic gable.
 const xs=[33.5,38.7,43.9,49.1,54.3,59.3],z0=-104.05,z1=-117.75,eave=4.45,rise=1.10,archSteps=12;
 for(const x of xs)for(const z of [z0,z1]){add(tag(meshBox(g,x,2.25,z,.19,4.5,.19,0x46575d,{roughness:.58,metalness:.42}),'IPAL_PHOTO_CANOPY_COLUMN',{sourcePhotos:['IMG_2516','IMG_2518']}));add(tag(meshBox(g,x,.12,z,.52,.20,.52,0x7c8584,{roughness:.86}),'IPAL_PHOTO_COLUMN_BASE'));stats.canopyMembers+=2;}
 for(const x of xs){let prev=null;for(let i=0;i<=archSteps;i++){const t=i/archSteps,z=z0+(z1-z0)*t,y=eave+rise*Math.sin(Math.PI*t),p=new T.Vector3(x,y,z);if(prev){add(rod(g,prev,p,.052,0x42565d,'IPAL_PHOTO_CURVED_ROOF_TRUSS',{sourcePhotos:['IMG_2516','IMG_2518']}));stats.canopyMembers++;}prev=p;}}
 for(let i=1;i<archSteps;i++){const t=i/archSteps,z=z0+(z1-z0)*t,y=eave+rise*Math.sin(Math.PI*t);add(rod(g,new T.Vector3(xs[0],y,z),new T.Vector3(xs.at(-1),y,z),.032,0x586a70,'IPAL_PHOTO_ROOF_PURLIN'));stats.canopyMembers++;}
 for(let i=0;i<archSteps;i++){
  const ta=i/archSteps,tb=(i+1)/archSteps,za=z0+(z1-z0)*ta,zb=z0+(z1-z0)*tb,ya=eave+rise*Math.sin(Math.PI*ta),yb=eave+rise*Math.sin(Math.PI*tb),dz=zb-za,dy=yb-ya,len=Math.hypot(dz,dy),translucent=i===3||i===8;
  const panel=new T.Mesh(new T.BoxGeometry(26.55,.055,len+.035),mat(translucent?0xdde5d9:0x788d91,translucent?.56:.72,translucent?.03:.28,translucent?.62:1));panel.position.set(46.4,(ya+yb)/2,(za+zb)/2);panel.rotation.x=-Math.atan2(dy,dz);tag(panel,translucent?'IPAL_PHOTO_TRANSLUCENT_ROOF_STRIP':'IPAL_PHOTO_CORRUGATED_ROOF_PANEL',{sourcePhotos:['IMG_2516','IMG_2518']});roofLayer.add(panel);stats.objects++;
 }
 for(let i=0;i<=archSteps;i+=2){const t=i/archSteps,z=z0+(z1-z0)*t,y=eave+rise*Math.sin(Math.PI*t)+.055;add(rod(roofLayer,new T.Vector3(33.2,y,z),new T.Vector3(59.6,y,z),.012,0x61747a,'IPAL_PHOTO_ROOF_CORRUGATION_RIB'));}
 for(let i=0;i<xs.length-1;i+=2)for(const z of [z0,z1]){add(rod(g,new T.Vector3(xs[i],.65,z),new T.Vector3(xs[i+1],4.0,z),.022,0x607278,'IPAL_PHOTO_CANOPY_X_BRACE'));add(rod(g,new T.Vector3(xs[i+1],.65,z),new T.Vector3(xs[i],4.0,z),.022,0x607278,'IPAL_PHOTO_CANOPY_X_BRACE'));stats.canopyMembers+=2;}
 for(const z of [z0,z1])add(rod(roofLayer,new T.Vector3(33.15,4.35,z),new T.Vector3(59.65,4.35,z),.055,0x53666c,'IPAL_PHOTO_ROOF_GUTTER'));
 for(const [x,z] of [[33.5,z0],[59.3,z1]])add(rod(g,new T.Vector3(x,4.35,z),new T.Vector3(x,.18,z),.045,0x53666c,'IPAL_PHOTO_ROOF_DOWNPIPE'));

 // Small enclosed operator/service building visible beneath a lower secondary canopy.
 const ob=new T.Group();ob.name='IPAL_OPERATOR_SERVICE_BUILDING';g.add(ob);tag(ob,'IPAL_PHOTO_OPERATOR_BUILDING',{sourcePhotos:['IMG_2513','IMG_2514','IMG_2524']});
 const ox=35.35,oz=-105.55,ow=4.1,od=2.45,oh=2.55;
 add(tag(meshBox(ob,ox,oh/2,oz+od/2,ow,oh,.14,0xe9e8e0,{roughness:.90}),'IPAL_PHOTO_OPERATOR_REAR_WALL'));
 add(tag(meshBox(ob,ox-ow/2,oh/2,oz,.14,oh,od,0xe9e8e0,{roughness:.90}),'IPAL_PHOTO_OPERATOR_SIDE_WALL'));
 add(tag(meshBox(ob,ox+ow/2,oh/2,oz,.14,oh,od,0xe9e8e0,{roughness:.90}),'IPAL_PHOTO_OPERATOR_SIDE_WALL'));
 // Front wall segmented around a door and a wide dark window.
 for(const [x,w] of [[33.66,.72],[35.12,.62],[37.03,.74]])add(tag(meshBox(ob,x,1.28,oz-od/2,w,2.55,.14,0xe9e8e0,{roughness:.90}),'IPAL_PHOTO_OPERATOR_FRONT_WALL_SEGMENT'));
 add(tag(meshBox(ob,34.42,1.05,oz-od/2-.075,.82,2.08,.055,0x4b5558,{roughness:.62,metalness:.22}),'IPAL_PHOTO_OPERATOR_DOOR'));
 add(tag(meshBox(ob,36.10,1.37,oz-od/2-.08,1.34,1.05,.045,0x25353b,{roughness:.28,metalness:.18,opacity:.78}),'IPAL_PHOTO_OPERATOR_DARK_WINDOW'));
 add(tag(meshBox(ob,36.10,1.37,oz-od/2-.115,1.44,.055,.055,0x202a2e,{metalness:.45}),'IPAL_PHOTO_WINDOW_FRAME'));
 add(tag(meshBox(ob,36.10,.86,oz-od/2-.115,1.44,.045,.055,0x202a2e,{metalness:.45}),'IPAL_PHOTO_WINDOW_FRAME'));
 for(const x of [35.43,36.77])add(tag(meshBox(ob,x,1.37,oz-od/2-.115,.045,1.05,.055,0x202a2e,{metalness:.45}),'IPAL_PHOTO_WINDOW_FRAME'));
 add(tag(meshBox(ob,ox,2.63,oz,4.35,.16,2.68,0xc6cbc5,{roughness:.68,metalness:.18}),'IPAL_PHOTO_OPERATOR_FLAT_ROOF'));
 // Secondary translucent canopy and posts.
 const scz=oz-2.05;add(tag(meshBox(g,ox,2.82,scz,5.15,.08,1.85,0xcdd8ce,{roughness:.46,metalness:.05,opacity:.68,rx:-.055}),'IPAL_PHOTO_SECONDARY_CANOPY',{sourcePhotos:['IMG_2513','IMG_2514','IMG_2524']}));for(const x of [33.0,37.7])add(tag(meshBox(g,x,1.38,scz-.72,.10,2.76,.10,0x65766d,{roughness:.62,metalness:.38}),'IPAL_PHOTO_SECONDARY_CANOPY_COLUMN'));
 add(tag(meshBox(g,34.00,.88,oz-od/2-.20,.28,.70,.14,0xc23b35,{roughness:.52,metalness:.12}),'IPAL_PHOTO_FIRE_EXTINGUISHER',{sourcePhotos:['IMG_2514','IMG_2524']}));stats.safetyElements++;

 // Blue equalization basin with facade segmentation and visible level reference scale.
 const eq=new T.Group();eq.position.set(39.25,0,-107.05);g.add(eq);tag(eq,'IPAL_PHOTO_BAK_EKUALISASI',{sourcePhotos:['IMG_2519','IMG_2520']});
 const ew=4.9,ed=3.35,eh=1.62,blue=0x3b7185;
 for(const [x,y,z,w,h,d] of [[0,eh/2,-ed/2,ew,eh,.18],[0,eh/2,ed/2,ew,eh,.18],[-ew/2,eh/2,0,.18,eh,ed],[ew/2,eh/2,0,.18,eh,ed]])add(tag(meshBox(eq,x,y,z,w,h,d,blue,{roughness:.82}),'IPAL_PHOTO_EQUALIZATION_BASIN_WALL'));
 const eqWater=add(tag(meshBox(eq,0,1.20,0,ew-.34,.035,ed-.34,0x557c82,{roughness:.22,metalness:0,opacity:.76}),'IPAL_PHOTO_EQUALIZATION_WATER_SURFACE'));eqWater.userData.baseY=eqWater.position.y;eqWater.userData.ambientWater=true;
 for(const y of [.36,.72,1.08,1.44])add(tag(meshBox(eq,0,y,-ed/2-.105,ew-.18,.035,.035,0x2e6174,{roughness:.80}),'IPAL_PHOTO_EQUALIZATION_PANEL_RIB'));
 for(let i=0;i<=10;i++){const y=.18+i*.125;add(tag(meshBox(eq,-ew/2-.11,y,-ed/2-.12,.16,.018,.025,i===10?0xe2bc38:0xe1dfd2,{roughness:.78}),'IPAL_PHOTO_EQUALIZATION_LEVEL_MARK'));}
 label?.('BAK EKUALISASI',39.25,2.15,-108.86,4.1,'#173f52');stats.verifiedLabels++;
 register(ipalEquipment,'IPAL_PHOTO_BAK_EKUALISASI',{minX:36.8,maxX:41.7,minY:105.38,maxY:108.72});

 // Temporary holding basin observed adjacent to the main tank and access stair.
 const hold=new T.Group();hold.position.set(42.6,0,-112.55);g.add(hold);tag(hold,'IPAL_PHOTO_BAK_PENAMPUNGAN_SEMENTARA',{sourcePhotos:['IMG_2519','IMG_2523']});
 const hw=3.2,hd=2.5,hh=1.18;for(const [x,z,w,d] of [[0,-hd/2,hw,.16],[0,hd/2,hw,.16],[-hw/2,0,.16,hd],[hw/2,0,.16,hd]])add(tag(meshBox(hold,x,hh/2,z,w,hh,d,0x3f7588,{roughness:.82}),'IPAL_PHOTO_TEMP_HOLDING_BASIN_WALL'));
 const holdWater=add(tag(meshBox(hold,0,.82,0,hw-.28,.03,hd-.28,0x557c82,{roughness:.22,opacity:.74}),'IPAL_PHOTO_TEMP_HOLDING_WATER'));holdWater.userData.baseY=holdWater.position.y;holdWater.userData.ambientWater=true;
 label?.('BAK PENAMPUNGAN SEMENTARA',42.6,1.75,-113.88,4.7,'#173f52');stats.verifiedLabels++;
 register(ipalEquipment,'IPAL_PHOTO_BAK_PENAMPUNGAN_SEMENTARA',{minX:41,maxX:44.2,minY:111.3,maxY:113.8});

 // Large photographed metal tank. Keep the literal visible wording; do not silently infer process chemistry.
 const tx=45.75,tz=-107.0,tr=1.98,th=4.05,tank=new T.Group();g.add(tank);tag(tank,'IPAL_PHOTO_LARGE_TANK_AN_AEROBIK_LABEL_VISIBLE',{sourcePhotos:['IMG_2519','IMG_2523'],literalVisibleLabel:'TANGKI AN AEROBIK',normalizedProcessName:'UNVERIFIED'});
 add(cyl(tank,tx,th/2,tz,tr,th,0xb1b9b6,'IPAL_PHOTO_LARGE_METAL_TANK_SHELL',{roughness:.38,metalness:.62,segments:40,heightSegments:5,openEnded:true}));
 for(const y of [.68,1.35,2.02,2.69,3.36,4.02])add(torus(tank,tx,y,tz,tr+.025,.035,0x778482,'IPAL_PHOTO_TANK_CIRCUMFERENTIAL_RING',{roughness:.42,metalness:.58}));
 for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])add(rod(tank,new T.Vector3(tx+Math.cos(a)*tr,.08,tz+Math.sin(a)*tr),new T.Vector3(tx+Math.cos(a)*tr,th-.08,tz+Math.sin(a)*tr),.014,0x7f8987,'IPAL_PHOTO_TANK_VERTICAL_SEAM'));
 add(cyl(tank,tx,th+.035,tz,tr*.97,.07,0xa5afac,'IPAL_PHOTO_LARGE_TANK_TOP',{roughness:.42,metalness:.58,segments:40}));
 // Yellow top guardrail.
 for(const rr of [tr+.16]){add(torus(tank,tx,th+.82,tz,rr,.025,0xd4aa20,'IPAL_PHOTO_TANK_TOP_RAIL',{roughness:.48,metalness:.30}));add(torus(tank,tx,th+.43,tz,rr,.018,0xd4aa20,'IPAL_PHOTO_TANK_MID_RAIL',{roughness:.48,metalness:.30}));for(let a=0;a<Math.PI*2;a+=Math.PI/6)add(rod(tank,new T.Vector3(tx+Math.cos(a)*rr,th+.04,tz+Math.sin(a)*rr),new T.Vector3(tx+Math.cos(a)*rr,th+.85,tz+Math.sin(a)*rr),.018,0xd4aa20,'IPAL_PHOTO_TANK_GUARD_POST'));}
 stair(tank,[43.2,.05,-108.8],[44.3,4.10,-108.35],15,.72,0xd4aa20);stats.safetyElements+=34;
 add(tag(meshBox(tank,tx,2.30,tz-tr-.045,.82,.48,.035,0xf0e7ca,{roughness:.78}),'IPAL_PHOTO_CONFINED_SPACE_WARNING_PLATE',{literalVisibleText:'BAHAYA! RUANG TERBATAS DILARANG MASUK'}));label?.('BAHAYA · RUANG TERBATAS',tx,2.30,tz-tr-.10,2.25,'#8a2e2e');stats.verifiedLabels++;
 label?.('TANGKI AN AEROBIK',tx,3.18,tz-tr-.13,3.4,'#173f52');stats.verifiedLabels++;
 register(ipalEquipment,'IPAL_PHOTO_LARGE_TANK_AN_AEROBIK_LABEL_VISIBLE',{minX:tx-tr,maxX:tx+tr,minY:107-tr,maxY:107+tr});

 // Cone-bottom metal vessel on yellow braced frame.
 const hx=49.7,hz=-112.1,hr=1.48,frameTop=1.55,bodyH=2.65;
 const hopper=new T.Group();g.add(hopper);tag(hopper,'IPAL_PHOTO_CONE_BOTTOM_PROCESS_VESSEL',{sourcePhotos:['IMG_2515','IMG_2517','IMG_2525'],processFunction:'UNVERIFIED_FROM_PHOTOS'});
 add(cyl(hopper,hx,frameTop+bodyH/2,hz,hr,bodyH,0xaab4b1,'IPAL_PHOTO_HOPPER_VESSEL_CYLINDER',{roughness:.40,metalness:.60,segments:36,heightSegments:4,openEnded:true}));
 const cone=new T.Mesh(new T.ConeGeometry(hr,1.55,36,1,true),mat(0xaab4b1,.40,.60));cone.position.set(hx,frameTop+.775,hz);cone.rotation.z=Math.PI;hopper.add(cone);add(tag(cone,'IPAL_PHOTO_HOPPER_VESSEL_CONE_BOTTOM'));
 add(rod(hopper,new T.Vector3(hx,.08,hz),new T.Vector3(hx,frameTop-.03,hz),.09,0x69787b,'IPAL_PHOTO_HOPPER_BOTTOM_OUTLET'));
 for(const [dx,dz] of [[-1.65,-1.05],[1.65,-1.05],[-1.65,1.05],[1.65,1.05]]){add(rod(hopper,new T.Vector3(hx+dx,.05,hz+dz),new T.Vector3(hx+dx,4.42,hz+dz),.055,0xd4aa20,'IPAL_PHOTO_HOPPER_SUPPORT_LEG'));}
 for(const zoff of [-1.05,1.05]){add(rod(hopper,new T.Vector3(hx-1.65,.18,hz+zoff),new T.Vector3(hx+1.65,2.10,hz+zoff),.025,0xd4aa20,'IPAL_PHOTO_HOPPER_FRAME_X_BRACE'));add(rod(hopper,new T.Vector3(hx+1.65,.18,hz+zoff),new T.Vector3(hx-1.65,2.10,hz+zoff),.025,0xd4aa20,'IPAL_PHOTO_HOPPER_FRAME_X_BRACE'));}
 add(tag(meshBox(hopper,hx,4.35,hz,3.45,.10,2.3,0x66777b,{roughness:.58,metalness:.42}),'IPAL_PHOTO_HOPPER_TOP_PLATFORM'));
 railRun(hopper,new T.Vector3(hx-1.7,0,hz-1.15),new T.Vector3(hx+1.7,0,hz-1.15),4.35,.82,0xd4aa20);railRun(hopper,new T.Vector3(hx-1.7,0,hz+1.15),new T.Vector3(hx+1.7,0,hz+1.15),4.35,.82,0xd4aa20);
 register(ipalEquipment,'IPAL_PHOTO_CONE_BOTTOM_PROCESS_VESSEL',{minX:hx-1.7,maxX:hx+1.7,minY:110.9,maxY:113.3});

 // Two-level yellow chemical/mixing rack with photographed red polyethylene tanks.
 const rack=new T.Group();g.add(rack);tag(rack,'IPAL_PHOTO_CHEMICAL_RACK',{sourcePhotos:['IMG_2515','IMG_2517','IMG_2525'],chemicalIdentity:'UNVERIFIED_FROM_PHOTOS'});
 const rx=54.9,rz=-107.45,rw=5.0,rd=3.25;
 for(const dx of [-rw/2,0,rw/2])for(const dz of [-rd/2,rd/2])add(rod(rack,new T.Vector3(rx+dx,.05,rz+dz),new T.Vector3(rx+dx,4.55,rz+dz),.055,0xd4aa20,'IPAL_PHOTO_CHEMICAL_RACK_COLUMN'));
 for(const y of [1.55,3.18]){for(const z of [rz-rd/2,rz+rd/2])add(rod(rack,new T.Vector3(rx-rw/2,y,z),new T.Vector3(rx+rw/2,y,z),.05,0xd4aa20,'IPAL_PHOTO_CHEMICAL_RACK_BEAM'));add(tag(meshBox(rack,rx,y+.03,rz,rw,.075,rd,0x69787b,{roughness:.55,metalness:.45}),'IPAL_PHOTO_CHEMICAL_RACK_GRATING'));
 }
 const red=0xb64a33;for(const [x,z,y,r,h] of [[53.35,-107.3,.82,.54,1.28],[54.75,-107.3,.82,.54,1.28],[56.15,-107.3,.82,.54,1.28],[53.45,-107.55,2.47,.52,1.30],[54.9,-107.55,2.47,.52,1.30],[56.35,-107.55,2.47,.52,1.30]]){
  add(cyl(rack,x,y,z,r,h,red,'IPAL_PHOTO_RED_CHEMICAL_OR_MIXING_TANK',{roughness:.74,metalness:.01,segments:28,meta:{chemicalIdentity:'UNVERIFIED_FROM_PHOTOS'}}));add(cyl(rack,x,y+h/2+.08,z,r*.72,.12,0x983f31,'IPAL_PHOTO_RED_TANK_LID',{roughness:.75,metalness:.01,segments:24}));
 }
 // Visible drive/gear motor details on upper process tanks.
 const agitatorShafts=[];for(const x of [54.9,56.35]){add(cyl(rack,x,3.42,-107.55,.16,.30,0x66777b,'IPAL_PHOTO_AGITATOR_GEAR_MOTOR',{roughness:.48,metalness:.38,segments:16}));const s=add(cyl(rack,x,2.70,-107.55,.035,.92,0x59696d,'IPAL_PHOTO_AGITATOR_SHAFT',{roughness:.35,metalness:.62,segments:12,meta:{processMotionDefault:false}}));agitatorShafts.push(s);}
 railRun(rack,new T.Vector3(rx-rw/2,0,rz-rd/2),new T.Vector3(rx+rw/2,0,rz-rd/2),3.18,.90,0xd4aa20);railRun(rack,new T.Vector3(rx-rw/2,0,rz+rd/2),new T.Vector3(rx+rw/2,0,rz+rd/2),3.18,.90,0xd4aa20);stats.safetyElements+=18;
 stair(rack,[52.0,.05,-109.2],[52.4,3.20,-108.85],12,.68,0xd4aa20);
 register(ipalEquipment,'IPAL_PHOTO_CHEMICAL_RACK',{minX:52.2,maxX:57.6,minY:105.5,maxY:109.3});

 // Sludge bag drying unit: blue enclosure, suspended white filter bags and hose manifold.
 const sludge=new T.Group();g.add(sludge);tag(sludge,'IPAL_PHOTO_SLUDGE_BAG_DRYING_UNIT',{sourcePhotos:['IMG_2515','IMG_2517','IMG_2525'],literalVisibleLabel:'UNIT (KARUNG) PENGERING LUMPUR'});
 const sx=35.65,sz=-113.55,sw=4.0,sd=2.45;
 add(tag(meshBox(sludge,sx,.55,sz+sd/2,sw,1.10,.18,0x477d8c,{roughness:.84}),'IPAL_PHOTO_SLUDGE_UNIT_WALL'));add(tag(meshBox(sludge,sx-sw/2,.55,sz,.18,1.10,sd,0x477d8c,{roughness:.84}),'IPAL_PHOTO_SLUDGE_UNIT_WALL'));add(tag(meshBox(sludge,sx+sw/2,.55,sz,.18,1.10,sd,0x477d8c,{roughness:.84}),'IPAL_PHOTO_SLUDGE_UNIT_WALL'));
 for(const x of [34.2,34.95,35.7,36.45,37.2]){add(cyl(sludge,x,1.20,sz-.22,.24,.76,0xe1e0d7,'IPAL_PHOTO_SLUDGE_FILTER_BAG',{rTop:.16,rBottom:.27,roughness:.94,metalness:0,segments:14,meta:{flexibleTextileVisual:true}}));stats.pipeSegments+=pipe(sludge,[[x,1.63,sz-.22],[x,1.92,sz-.22],[33.9,1.92,sz-.22]],0x7f8788,.028,'IPAL_PHOTO_SLUDGE_BAG_FEED_HOSE');}
 add(rod(sludge,new T.Vector3(33.9,1.92,sz-.22),new T.Vector3(37.55,1.92,sz-.22),.045,0x68777b,'IPAL_PHOTO_SLUDGE_MANIFOLD'));stats.pipeSegments++;
 label?.('UNIT (KARUNG) PENGERING LUMPUR',sx,2.42,sz+sd/2+.10,4.2,'#173f52');stats.verifiedLabels++;
 add(tag(meshBox(sludge,37.05,.70,sz+sd/2+.11,.44,.44,.025,0xe0bd37,{roughness:.75}),'IPAL_PHOTO_TOXIC_WARNING_PLATE',{literalVisibleText:'BERACUN'}));stats.safetyElements++;
 register(ipalEquipment,'IPAL_PHOTO_SLUDGE_BAG_DRYING_UNIT',{minX:33.6,maxX:37.7,minY:112.3,maxY:114.8});

 // Pump/motor references visible at floor level; process duty remains unverified.
 for(const [x,z,rot] of [[55.1,-112.0,0],[57.0,-112.0,0],[51.7,-114.65,Math.PI/2]]){const pg=new T.Group();g.add(pg);tag(pg,'IPAL_PHOTO_PUMP_MOTOR_ASSEMBLY',{processDuty:'UNVERIFIED_FROM_PHOTOS'});add(cyl(pg,x,.48,z,.23,.62,0x527b88,'IPAL_PHOTO_PUMP_BODY',{rx:Math.PI/2,roughness:.48,metalness:.38,segments:18}));add(cyl(pg,x-.48*Math.cos(rot),.48,z+.48*Math.sin(rot),.20,.50,0x5c6c70,'IPAL_PHOTO_PUMP_MOTOR',{rx:Math.PI/2,roughness:.52,metalness:.32,segments:18}));}

 // Photo-visible PVC/metal pipe routing. Connections use visible nozzles/flanges but do not assert P&ID direction or service.
 const routes=[
  [[41.65,1.05,-107.0],[43.35,1.05,-107.0],[43.35,1.42,-105.6],[44.0,1.42,-105.6]],
  [[47.75,1.12,-107.0],[49.25,1.12,-107.0],[49.25,2.10,-109.55]],
  [[50.0,.72,-110.62],[52.0,.72,-110.62],[52.0,1.05,-109.1],[53.3,1.05,-109.1]],
  [[54.0,.62,-109.1],[54.0,.62,-111.4],[55.1,.62,-111.4]],
  [[37.6,1.18,-113.55],[39.2,1.18,-113.55],[39.2,.82,-111.6],[41.0,.82,-111.6]],
  [[57.25,.92,-109.05],[58.25,.92,-109.05],[58.25,.55,-113.5],[56.9,.55,-113.5]]
 ];
 routes.forEach((pts,i)=>{stats.pipeSegments+=pipe(g,pts,i%3===0?0xe1e1d9:i%3===1?0x747f82:0xaab0aa,i%2===0?.045:.035,'IPAL_PHOTO_PIPE_ROUTE_VISUAL',{routeIndex:i});const a=pts[0],b=pts.at(-1);add(flange(g,...a,.11,0x67767a));add(flange(g,...b,.11,0x67767a));});
 for(const [x,y,z] of [[43.35,1.42,-105.6],[52.0,1.05,-109.1],[54.0,.82,-111.4],[58.25,.80,-113.5]]){valve(g,x,y,z);stats.safetyElements++;}
 for(const [x,z] of [[43.35,-107.0],[49.25,-108.6],[52.0,-110.62],[54.0,-110.1],[58.25,-112.0]]){add(rod(g,new T.Vector3(x,.08,z),new T.Vector3(x,.58,z),.022,0x68777b,'IPAL_PHOTO_PIPE_SUPPORT_POST'));add(rod(g,new T.Vector3(x-.17,.58,z),new T.Vector3(x+.17,.58,z),.018,0x68777b,'IPAL_PHOTO_PIPE_SUPPORT_CROSS'));}

 // Vertical garden with individual pots and varied foliage, not a billboard texture.
 const garden=new T.Group();g.add(garden);tag(garden,'IPAL_PHOTO_VERTICAL_GARDEN',{sourcePhotos:['IMG_2516','IMG_2518']});
 add(tag(meshBox(garden,40.1,.30,-117.26,10.3,.55,.46,0x6f7566,{roughness:.94}),'IPAL_PHOTO_VERTICAL_GARDEN_PLANTER_BASE'));
 let pi=0;for(let row=0;row<3;row++)for(let col=0;col<11;col++){const x=35.15+col*.99,y=.72+row*.54,z=-117.42;add(cyl(garden,x,y,z,.12,.18,0x7b6047,'IPAL_PHOTO_GARDEN_POT',{rTop:.10,rBottom:.14,roughness:.9,metalness:0,segments:10}));const foliageColor=[0x527b53,0x6c8a4d,0x416e58,0x755879][pi++%4];add(sphere(garden,x+(col%2?.04:-.03),y+.23,z-.02,.16+(row%2)*.035,foliageColor,'IPAL_PHOTO_GARDEN_FOLIAGE',{segments:8,rows:6}));stats.landscapeElements+=2;}

 // Narrow ornamental pond visible at the process-yard edge, including fish and aquatic plants.
 const pond=new T.Group();g.add(pond);tag(pond,'IPAL_PHOTO_ORNAMENTAL_POND',{sourcePhotos:['IMG_2523'],coreProcess:false});
 const px=53.7,pz=-116.45,pw=8.7,pd=1.25;add(tag(meshBox(pond,px,.18,pz,pw,.34,pd,0x343f3e,{roughness:.88}),'IPAL_PHOTO_POND_CASING'));
 const pondWater=add(tag(meshBox(pond,px,.365,pz,pw-.24,.035,pd-.20,0x476d67,{roughness:.16,opacity:.73}),'IPAL_PHOTO_POND_WATER'));pondWater.userData.baseY=pondWater.position.y;pondWater.userData.ambientWater=true;
 const fish=[];for(let i=0;i<6;i++){const f=new T.Mesh(new T.SphereGeometry(.09,8,5),mat(i%2?0xdf8d38:0xb8a46b,.62,.02));f.scale.set(1.8,.55,.65);f.position.set(px-pw*.35+i*1.15,.405,pz+(i%2?.18:-.16));tag(f,'IPAL_PHOTO_POND_FISH',{coreProcess:false,ambientMotion:true,fishIndex:i});pond.add(f);fish.push(f);stats.landscapeElements++;}
 for(let i=0;i<9;i++){const x=px-pw*.4+i*.95;add(rod(pond,new T.Vector3(x,.39,pz+.35),new T.Vector3(x+(i%2?.05:-.04),.82+(i%3)*.08,pz+.32),.018,0x4c7655,'IPAL_PHOTO_AQUATIC_PLANT_STEM',{coreProcess:false}));add(sphere(pond,x,.76+(i%3)*.08,pz+.32,.10,0x4f7a51,'IPAL_PHOTO_AQUATIC_PLANT_FOLIAGE',{segments:7,rows:5,meta:{coreProcess:false}}));stats.landscapeElements+=2;}

 // Adjacent utility equipment is kept visually separate from the core wastewater process.
 const adjacent=new T.Group();g.add(adjacent);tag(adjacent,'IPAL_PHOTO_ADJACENT_UTILITY_EQUIPMENT',{sourcePhotos:['IMG_2511','IMG_2512','IMG_2520','IMG_2521','IMG_2522'],coreProcess:false,systemLinkage:'NOT_ASSERTED'});
 for(let i=0;i<4;i++){const x=60.55+(i%2)*1.25,z=-106.0-Math.floor(i/2)*2.1;add(tag(meshBox(adjacent,x,.72,z,1.02,1.42,.72,0xd8dedc,{roughness:.68,metalness:.18}),'IPAL_PHOTO_ADJACENT_OUTDOOR_UTILITY_CABINET',{coreProcess:false}));torus(adjacent,x,1.02,z-.37,.28,.028,0x5d696d,'IPAL_PHOTO_ADJACENT_AXIAL_FAN_RING',{rx:0,ry:0,meta:{coreProcess:false}});for(let a=0;a<Math.PI*2;a+=Math.PI/4)add(rod(adjacent,new T.Vector3(x,1.02,z-.39),new T.Vector3(x+Math.cos(a)*.23,1.02+Math.sin(a)*.23,z-.39),.012,0x566267,'IPAL_PHOTO_ADJACENT_FAN_BLADE',{coreProcess:false}));}

 // Small realism details: bollards, weeds and subtle base wear without inventing engineering dimensions.
 for(const [x,z] of [[33.6,-117.2],[59.0,-117.2],[57.9,-111.1]]){add(tag(meshBox(g,x,.46,z,.18,.92,.18,0xd7aa22,{roughness:.72,metalness:.18}),'IPAL_PHOTO_SAFETY_BOLLARD'));stats.safetyElements++;}
 for(const [x,z] of [[34.1,-116.9],[41.4,-117.1],[58.7,-116.8],[59.0,-104.5]]){add(rod(g,new T.Vector3(x,.11,z),new T.Vector3(x+.04,.28,z+.03),.013,0x53734d,'IPAL_PHOTO_PAVER_WEED',{coreProcess:false}));stats.landscapeElements++;}

 const animatedWater=[];g.traverse(o=>{if(o.userData?.ambientWater)animatedWater.push(o);});
 let processMotion=false;
 const update=now=>{const t=(Number(now)||0)*.001;for(let i=0;i<animatedWater.length;i++){const o=animatedWater[i],base=o.userData.baseY??o.position.y;o.position.y=base+Math.sin(t*.55+i*1.7)*.004;}for(let i=0;i<fish.length;i++){const f=fish[i];f.position.x+=Math.sin(t*.38+i)*.0008;f.position.z+=Math.cos(t*.31+i)*.0005;f.rotation.y=Math.sin(t*.22+i)*.24;}if(processMotion)for(const s of agitatorShafts)s.rotation.y=t*.85;};
 const setProcessMotion=on=>{processMotion=!!on;g.userData.processMotion=processMotion;return processMotion;};
 let objectCount=0;g.traverse(o=>{if(o!==g)objectCount++;});stats.objects=objectCount;
 Object.assign(buildingDetailStats,{ipalPhotoActualObjects:stats.objects,ipalPhotoCanopyMembers:stats.canopyMembers,ipalPhotoPipeSegments:stats.pipeSegments,ipalPhotoSafetyElements:stats.safetyElements,ipalPhotoLandscapeElements:stats.landscapeElements,ipalPhotoVerifiedLabels:stats.verifiedLabels,ipalLegacyChildrenSuperseded:stats.legacyChildrenSuperseded});
 const metadata={evidenceVersion:IPAL_PHOTO_EVIDENCE_V205.version,sourceArchive:IPAL_PHOTO_EVIDENCE_V205.sourceArchive,sourcePhotoCount:IPAL_PHOTO_EVIDENCE_V205.sourcePhotos.length,sourcePhotos:IPAL_PHOTO_EVIDENCE_V205.sourcePhotos,dimensionalStatus:IPAL_PHOTO_EVIDENCE_V205.dimensionalStatus,processStatus:IPAL_PHOTO_EVIDENCE_V205.processStatus,verified:IPAL_PHOTO_EVIDENCE_V205.verified,unresolved:IPAL_PHOTO_EVIDENCE_V205.unresolved,openSides:true,enclosingWalls:0,legacyFunctionalReferenceSuperseded:true,processMotionDefault:false,ambientMotion:['WATER_SURFACE_MICRO_MOTION','ORNAMENTAL_POND_FISH'],stats};
 g.userData={...g.userData,...metadata};
 return {group:g,metadata,update,setProcessMotion};
}
