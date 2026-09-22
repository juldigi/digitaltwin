import * as T from 'three';
import {FACTORY_FLEET_GZIP} from './data/factory-fleet-data.js';
import {decodePlantData} from './data/plant-actual.js';
let fleetCache;
export async function loadFactoryFleet(){return fleetCache||(fleetCache=await decodePlantData(FACTORY_FLEET_GZIP));}
export const MACHINE_SERVICE_CLEARANCE=1.2;
export function machineClearanceBoxes(fleet,clearance=MACHINE_SERVICE_CLEARANCE){
 return fleet.filter(f=>f.placement.status!=='UNIDENTIFIED').map(f=>{const p=f.placement,r=p.rotation*Math.PI/180,c=Math.abs(Math.cos(r)),s=Math.abs(Math.sin(r)),w=f.size[0]*c+f.size[2]*s,d=f.size[0]*s+f.size[2]*c;return {machineId:p.machineId,label:p.label,minX:p.x-w/2-clearance,maxX:p.x+w/2+clearance,minY:p.y-d/2-clearance,maxY:p.y+d/2+clearance};});
}
const OFFSET_ROOM_IDS=new Set(['BMJ-MCH-0003','BMJ-MCH-0004','BMJ-MCH-0005','BMJ-MCH-0006','BMJ-MCH-0009']);
export function pressRoomEnvelopes(fleet,clearance=1.85){
 return fleet.filter(f=>OFFSET_ROOM_IDS.has(f.placement.machineId)).map(f=>{const p=f.placement,r=p.rotation*Math.PI/180,c=Math.abs(Math.cos(r)),s=Math.abs(Math.sin(r)),w=f.size[0]*c+f.size[2]*s,d=f.size[0]*s+f.size[2]*c;return {machineId:p.machineId,label:p.label,centerX:p.x,centerY:p.y,minX:p.x-w/2-clearance,maxX:p.x+w/2+clearance,minY:p.y-d/2-clearance,maxY:p.y+d/2+clearance,clearance,curtainWidth:3.2};});
}
function intervalInBox(a,c,b){
 const dx=c[0]-a[0],dy=c[1]-a[1];let lo=0,hi=1;
 for(const [p,q] of [[-dx,a[0]-b.minX],[dx,b.maxX-a[0]],[-dy,a[1]-b.minY],[dy,b.maxY-a[1]]]){
  if(Math.abs(p)<1e-9){if(q<0)return null;continue;}const t=q/p;if(p<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);if(lo>hi)return null;
 }
 return [Math.max(0,lo),Math.min(1,hi)];
}
export function clipWallToMachineClearance(w,clearances,minLength=.28){
 const [a,c]=[w.a,w.b],dx=c[0]-a[0],dy=c[1]-a[1],blocked=clearances.map(b=>intervalInBox(a,c,b)).filter(Boolean).sort((u,v)=>u[0]-v[0]);
 const merged=[];for(const i of blocked){const last=merged.at(-1);if(last&&i[0]<=last[1]+1e-6)last[1]=Math.max(last[1],i[1]);else merged.push([...i]);}
 const visible=[];let cursor=0;for(const [lo,hi] of merged){if(lo>cursor)visible.push([cursor,lo]);cursor=Math.max(cursor,hi);}if(cursor<1)visible.push([cursor,1]);
 return visible.map(([u,v])=>({...w,a:[a[0]+dx*u,a[1]+dy*u],b:[a[0]+dx*v,a[1]+dy*v]})).filter(s=>Math.hypot(s.b[0]-s.a[0],s.b[1]-s.a[1])>=minLength);
}
export function resolvePortalClearance(portal,clearances,margin=.35){
 const p={...portal,sourceX:portal.x,sourceY:portal.y,clearanceAdjusted:false};
 for(let pass=0;pass<clearances.length;pass++){
  const hit=clearances.find(b=>p.x>b.minX&&p.x<b.maxX&&p.y>b.minY&&p.y<b.maxY);if(!hit)break;
  if(Math.abs((p.rotation||0)%180)===90){const left=hit.minX-p.x-margin,right=hit.maxX-p.x+margin;p.x+=Math.abs(left)<=Math.abs(right)?left:right;}
  else{const down=hit.minY-p.y-margin,up=hit.maxY-p.y+margin;p.y+=Math.abs(down)<=Math.abs(up)?down:up;}
  p.clearanceAdjusted=true;
 }
 return p;
}
export function buildActualFactory(layout,fleet){
 const root=new T.Group();root.name='BMJ · baseline 250804 + revisi';const layers={};
 for(const name of ['building','roof','machines','labels','landscape','reference','unidentified']){layers[name]=new T.Group();layers[name].name=name;root.add(layers[name]);}
 layers.roof.visible=false;layers.reference.visible=false;
 const mats=new Map();const material=(color,opacity=1)=>{const k=color+':'+opacity;if(!mats.has(k))mats.set(k,new T.MeshStandardMaterial({color,roughness:.82,metalness:.04,transparent:opacity<1,opacity,depthWrite:opacity===1,side:T.DoubleSide}));return mats.get(k);};
 const boxGeo=new T.BoxGeometry(1,1,1);
 const box=(parent,x,y,z,w,h,d,color,rot=0,opacity=1)=>{const o=new T.Mesh(boxGeo,material(color,opacity));o.position.set(x,y,z);o.scale.set(w,h,d);o.rotation.y=rot;o.receiveShadow=true;parent.add(o);return o;};
 const line=(parent,a,b,r,color)=>{const delta=new T.Vector3().subVectors(b,a),o=new T.Mesh(new T.CylinderGeometry(r,r,delta.length(),6),material(color));o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());parent.add(o);return o;};
 const label=(text,x,y,z,width=7,color='#20394c',parent=layers.labels)=>{
  if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=512;c.height=80;const ctx=c.getContext('2d');if(!ctx)return;
  ctx.fillStyle='rgba(250,253,255,.92)';ctx.fillRect(0,0,512,80);ctx.fillStyle=color;ctx.font='600 27px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,49,490);
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const s=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:false}));s.position.set(x,y,z);s.scale.set(width,width*80/512,1);parent.add(s);return s;
 };
 const data=layout.actual,b=layers.building;
 // The outline follows the source production hall and attached office/service wings.
 const outline=[[-4,2],[6,2],[6,6],[96,6],[96,90],[90,96],[73,96],[73,103],[23,103],[23,96],[6,96],[6,55],[-5,55],[-5,11],[-4,11]];
 const shape=new T.Shape(outline.map(([x,y])=>new T.Vector2(x,y))),floor=new T.Mesh(new T.ShapeGeometry(shape),material(0xd8dcda));floor.rotation.x=-Math.PI/2;floor.position.y=-.015;floor.receiveShadow=true;b.add(floor);
 box(layers.landscape,47,-.25,-57,117,.35,137,0x9ea9a5);
 box(layers.landscape,47,-.06,1.8,110,.04,7.5,0x626d73);
 box(layers.landscape,-9,-.06,-53,5,.04,110,0x626d73);
 const machineBoxes=[];
 for(const f of fleet){const p=f.placement,r=p.rotation*Math.PI/180,c=Math.abs(Math.cos(r)),s=Math.abs(Math.sin(r));machineBoxes.push({p,minX:p.x-(f.size[0]*c+f.size[2]*s)/2,maxX:p.x+(f.size[0]*c+f.size[2]*s)/2,minY:p.y-(f.size[0]*s+f.size[2]*c)/2,maxY:p.y+(f.size[0]*s+f.size[2]*c)/2});}
 const serviceClearances=machineClearanceBoxes(fleet);
 const pressRooms=pressRoomEnvelopes(fleet);
 const intersectsMachine=(a,c)=>machineBoxes.some(m=>m.p.status!=='UNIDENTIFIED'&&Math.max(a[0],c[0])>m.minX+.05&&Math.min(a[0],c[0])<m.maxX-.05&&Math.max(a[1],c[1])>m.minY+.05&&Math.min(a[1],c[1])<m.maxY-.05);
 const omitted=[];
 const wallPieces=[];for(const w of data.walls){const pieces=clipWallToMachineClearance(w,[...serviceClearances,...pressRooms]);if(pieces.length!==1||pieces[0].a[0]!==w.a[0]||pieces[0].a[1]!==w.a[1]||pieces[0].b[0]!==w.b[0]||pieces[0].b[1]!==w.b[1])omitted.push(w);wallPieces.push(...pieces);}
 for(const w of wallPieces){const [a,c]=[w.a,w.b];
  const dx=c[0]-a[0],dy=c[1]-a[1],len=Math.hypot(dx,dy),r=Math.atan2(dy,dx),x=(a[0]+c[0])/2,z=-(a[1]+c[1])/2;
  const wall=box(b,x,1.75,z,len,3.5,w.width,0xe8e5df,r);wall.castShadow=true;wall.userData={semantic:'WALL',sourceHandles:w.handles,heightStatus:'VISUAL_ESTIMATE',machineClearance:MACHINE_SERVICE_CLEARANCE};
  box(b,x,.12,z,len,.24,w.width+.035,0x64777e,r);box(b,x,3.46,z,len,.08,w.width+.025,0x71878b,r);
  // Clerestory window treatment has source-aligned position, with assumed sill and glass detail.
  if(len>5.5){const glass=box(b,x,2.35,z,Math.max(.6,len-.7),.55,w.width+.025,0xa5cbd0,r,.38);glass.userData.semantic='FROSTED_CLERESTORY';}
 }
 const roomWall=(a,c,room)=>{const dx=c[0]-a[0],dy=c[1]-a[1],len=Math.hypot(dx,dy);if(len<.25)return;const r=Math.atan2(dy,dx),x=(a[0]+c[0])/2,z=-(a[1]+c[1])/2,g=box(b,x,1.82,z,len,3.64,.13,0xe4e7e3,r,.92);g.castShadow=true;g.userData={semantic:'PRESS_ROOM_WALL',machineId:room.machineId,roomCentered:true};box(b,x,.11,z,len,.22,.17,0x60757d,r);const glass=box(b,x,2.58,z,Math.max(.2,len-.16),.72,.145,0xaed8dc,r,.32);glass.userData={semantic:'PRESS_ROOM_CLERESTORY',machineId:room.machineId};};
 for(const room of pressRooms){
  const gap=room.curtainWidth/2,leftEnd=room.centerX-gap,rightStart=room.centerX+gap;
  roomWall([room.minX,room.minY],[leftEnd,room.minY],room);roomWall([rightStart,room.minY],[room.maxX,room.minY],room);
  roomWall([room.minX,room.maxY],[room.maxX,room.maxY],room);roomWall([room.minX,room.minY],[room.minX,room.maxY],room);roomWall([room.maxX,room.minY],[room.maxX,room.maxY],room);
  const zone=box(b,room.centerX,.006,-room.centerY,room.maxX-room.minX,.012,room.maxY-room.minY,0xdde6e4,0,.18);zone.userData={semantic:'PRESS_ROOM_FLOOR',machineId:room.machineId,roomCentered:true};
 }
 for(const [x,y] of data.columns){if(intersectsMachine([x-.3,y-.3],[x+.3,y+.3]))continue;const column=box(b,x,2.25,-y,.32,4.5,.32,0x819397);column.castShadow=true;column.userData={semantic:'STRUCTURAL_COLUMN',height:4.5};box(b,x,.18,-y,.55,.36,.55,0xa1aaa8);}
 const adjustedPortals=[];
 for(const source of data.doors){const d=resolvePortalClearance({...source,width:Math.max(.9,source.width)},serviceClearances);if(d.clearanceAdjusted)adjustedPortals.push(d);const g=new T.Group();g.position.set(d.x,0,-d.y);g.rotation.y=d.rotation*Math.PI/180;b.add(g);g.userData={semantic:'DOOR',evidence:d.evidence,clearanceAdjusted:d.clearanceAdjusted,sourcePosition:[d.sourceX,d.sourceY]};
  box(g,-d.width/2,1.25,0,.085,2.5,.16,0x526b75);box(g,d.width/2,1.25,0,.085,2.5,.16,0x526b75);box(g,0,2.47,0,d.width+.17,.09,.16,0x526b75);
  const leaf=box(g,-d.width/2+.08,1.18,-d.width*.43,d.width*.96,2.34,.052,0x9db5bd,Math.PI/2.35);leaf.castShadow=true;leaf.userData.semantic='OPEN_DOOR_LEAF';
  const handle=new T.Mesh(new T.SphereGeometry(.035,8,6),material(0xd5c6a2));handle.position.set(d.width*.34,1.08,-.055);leaf.add(handle);
 }
 const addCurtain=(d,semantic='PVC_CURTAIN',machineId=null)=>{const g=new T.Group();g.position.set(d.x,0,-d.y);g.rotation.y=d.rotation*Math.PI/180;b.add(g);g.userData={semantic,evidence:d.evidence,clearanceAdjusted:d.clearanceAdjusted,sourcePosition:[d.sourceX,d.sourceY],machineId};
  box(g,0,3.12,0,d.width+.32,.18,.2,0x526e7c);box(g,-d.width/2-.12,1.55,0,.14,3.1,.2,0x526e7c);box(g,d.width/2+.12,1.55,0,.14,3.1,.2,0x526e7c);
  const n=Math.ceil(d.width/.2);for(let i=0;i<n;i++){const strip=box(g,-d.width/2+(i+.5)*d.width/n,1.52,.012*(i%2),d.width/n+.035,2.95,.014,i%2?0xaddde1:0xc4eaec,0,.26);strip.userData.semantic='PVC_STRIP';}
  for(const x of [-d.width/2-.42,d.width/2+.42]){box(g,x,.48,-.28,.18,.96,.18,0xe2b428);box(g,x,.48,-.28,.19,.18,.19,0x313b40);}
  return g;
 };
 for(const source of data.curtains){const d=resolvePortalClearance({...source,width:Math.max(2.6,source.width)},serviceClearances);if(d.clearanceAdjusted)adjustedPortals.push(d);addCurtain(d);}
 for(const room of pressRooms)addCurtain({x:room.centerX,y:room.minY,width:room.curtainWidth,rotation:0,evidence:'CENTERED OFFSET ROOM ACCESS',sourceX:room.centerX,sourceY:room.minY,clearanceAdjusted:false},'PRESS_ROOM_CURTAIN',room.machineId);
 // Open loading dock, bumpers, canopy and source folding-gate entrance.
 box(b,84,.42,-4.1,7.5,.85,3.2,0x8d9798);for(const x of [81,83,85,87])box(b,x,.75,-2.45,.32,.6,.18,0x303b42);
 box(b,84,4.5,-4.2,9,.15,5,0x536e7a);for(const x of [80,88])box(b,x,2.25,-2.3,.18,4.5,.18,0x526b75);box(b,14,1.25,-2.2,4.5,2.5,.09,0x8a9da3,0,.6);
 // User-confirmed vertical envelope: 4.5 m eaves and approximately 7 m ridge.
 for(const [x,w,z,d] of [[51,90,-51,90],[47.5,51,-99.5,7],[.5,11,-33,44]]){
  const half=w/2,rise=2.5,slope=Math.atan2(rise,half),len=Math.hypot(half,rise);
  for(const sign of [-1,1]){const roof=box(layers.roof,x+sign*w/4,5.75,z,len,.16,d,0x6e8790);roof.rotation.z=-sign*slope;roof.userData={semantic:'ROOF_PANEL',eavesHeight:4.5,ridgeHeight:7};
   for(let j=-d/2+1;j<d/2;j+=2)line(layers.roof,new T.Vector3(x,6.93,z+j),new T.Vector3(x+sign*w/2,4.43,z+j),.035,0xa7b8bc);
  }
  for(let zz=z-d/2+3;zz<z+d/2;zz+=6){line(layers.roof,new T.Vector3(x-w/2,4.35,zz),new T.Vector3(x+w/2,4.35,zz),.07,0x4d6570);line(layers.roof,new T.Vector3(x-w/2,4.35,zz),new T.Vector3(x,6.85,zz),.07,0x4d6570);line(layers.roof,new T.Vector3(x,6.85,zz),new T.Vector3(x+w/2,4.35,zz),.07,0x4d6570);}
 }
 // Source-labelled rooms receive function-specific, non-OEM interior silhouettes.
 const roomWords=/Workshop|Adm Room|QC Sample|R\.PDS|R\.Sample|R\.INCOMING|WH Spareparts|Mushola|Loading Dock|CTF|CTP|Toilet|R\.BROKE|R\.FPS|Electric room|PPIC/i;
 const fixtureBoxes=[],skippedFixtures=[];
 const fixture=(x,y,w,h,d,color,semantic,integrated=false)=>{const bounds={minX:x-w/2,maxX:x+w/2,minY:y-d/2,maxY:y+d/2,semantic};if(intersectsMachine([bounds.minX,bounds.minY],[bounds.maxX,bounds.maxY])||(!integrated&&fixtureBoxes.some(q=>Math.min(bounds.maxX,q.maxX)-Math.max(bounds.minX,q.minX)>.025&&Math.min(bounds.maxY,q.maxY)-Math.max(bounds.minY,q.minY)>.025))){skippedFixtures.push(bounds);return null;}const o=box(b,x,h/2,-y,w,h,d,color);o.castShadow=true;o.userData={semantic,accuracy:'FUNCTIONAL_ROOM_VISUALIZATION',collisionAudited:true};if(!integrated)fixtureBoxes.push(bounds);return o;};
 for(const l of data.labels){if(!roomWords.test(l.text))continue;if(l.x>34.7&&l.x<63.1&&l.y>56.9&&l.y<65.1)continue;
  label(l.text,l.x,3.45,-l.y,Math.min(8,3+l.text.length*.13),'#526772');
  if(/Adm Room|PPIC|R\.PDS|QC Sample|R\.Sample|R\.INCOMING/i.test(l.text)){
   fixture(l.x,l.y,1.5,.76,.72,0xb89d78,'ROOM_DESK');fixture(l.x-1.05,l.y,.55,.9,.55,0x647985,'OFFICE_CHAIR');fixture(l.x+1.05,l.y,.55,.9,.55,0x647985,'OFFICE_CHAIR');fixture(l.x,l.y+.9,1.8,1.85,.38,0x7d9195,'ROOM_STORAGE');
   if(/QC|Sample|INCOMING/i.test(l.text)){fixture(l.x,l.y-1.05,1.8,.9,.62,0xd5d9d5,'QC_BENCH');fixture(l.x-.55,l.y-1.05,.38,.22,.32,0xd7e6ec,'QC_SAMPLE_TRAY');}
  }else if(/Toilet/i.test(l.text)){
   for(const dx of [-.72,.72]){fixture(l.x+dx,l.y,.08,2.15,1.55,0xd9e2e3,'TOILET_PARTITION');fixture(l.x+dx*.5,l.y+.28,.42,.43,.62,0xf0f3f1,'TOILET_FIXTURE');}fixture(l.x,l.y-1.02,1.2,.82,.46,0xd4dde0,'WASH_BASIN_COUNTER');
  }else if(/Electric room/i.test(l.text)){
   for(let i=-1;i<=1;i++){fixture(l.x+i*.82,l.y+.45,.7,2.05,.36,0x667985,'ELECTRICAL_PANEL');for(let lamp=0;lamp<3;lamp++)fixture(l.x+i*.82-.18+lamp*.18,l.y+.24,.055,.055,.04,lamp===0?0x46b879:lamp===1?0xe0b436:0xc54b4b,'PANEL_INDICATOR',true);}fixture(l.x,l.y-.72,2.8,.025,1.15,0xd8b532,'ELECTRICAL_CLEARANCE_ZONE',true);
  }else if(/WH Spareparts/i.test(l.text)){
   for(const dx of [-1.05,0,1.05]){fixture(l.x+dx,l.y,.82,2.15,.52,0x72868d,'SPAREPART_RACK');for(let shelf=.42;shelf<1.9;shelf+=.48)fixture(l.x+dx,l.y-.02,.78,.055,.56,0xaeb9b6,'RACK_SHELF',true);}
  }else if(/Workshop/i.test(l.text)){
   fixture(l.x,l.y,2.25,.88,.82,0x8a7359,'WORKBENCH');fixture(l.x,l.y+.62,2.3,.92,.12,0x617681,'TOOL_BOARD');for(const dx of [-.78,0,.78])fixture(l.x+dx,l.y+.55,.18,.18,.09,0xe0b436,'WORKSHOP_TOOL',true);fixture(l.x+1.55,l.y,0.72,1.9,.46,0x71858d,'WORKSHOP_CABINET');
  }else if(/Mushola/i.test(l.text)){
   for(let i=-2;i<=2;i++)fixture(l.x+i*.52,l.y,.46,.018,2.25,i%2?0x668c7f:0x759c8e,'PRAYER_MAT');fixture(l.x-1.75,l.y+1.05,1.1,1.15,.32,0x8b765c,'SHOE_RACK');
  }else if(/R\.FPS/i.test(l.text)){
   fixture(l.x,l.y,2.2,.18,1.35,0x566b73,'FIRE_PUMP_SKID',true);for(const dx of [-.62,.62]){const pump=new T.Mesh(new T.CylinderGeometry(.25,.25,.85,16),material(0xb94343));pump.rotation.z=Math.PI/2;pump.position.set(l.x+dx,.55,-l.y);pump.userData={semantic:'FIRE_PUMP_FUNCTIONAL_REFERENCE',accuracy:'ROOM_FUNCTION_VISUALIZATION'};b.add(pump);}line(b,new T.Vector3(l.x-1.2,.78,-l.y),new T.Vector3(l.x+1.2,.78,-l.y),.06,0xb94343);
  }else if(/R\.BROKE/i.test(l.text)){
   for(const dx of [-.75,.75])fixture(l.x+dx,l.y,1.15,.75,1.1,0xb08d60,'BROKE_COLLECTION_BIN');
  }
 }
 // Raw-material racks stay in the northern RMS zone; Sheeting is below it, never on it.
 for(const x of [85,88.5,92])for(const y of [73,78,83]){box(b,x,.12,-y,1.8,.24,2.4,0x9b7c55);for(let n=0;n<3;n++){const roll=new T.Mesh(new T.CylinderGeometry(.48,.48,1.4,12),material(0xd9cbb0));roll.position.set(x+(n-1)*.55,.93,-y);b.add(roll);}}
 label('RMS',88.5,3.8,-81,5);
 // IPAL / utilities follow the northern service yard, not the machine registry.
 for(const [x,y,r,h] of [[55.5,112,2.7,2.1],[46,113,1.1,2],[46,108,1.1,2],[59.5,106.5,1,1.7]]){const tank=new T.Mesh(new T.CylinderGeometry(r,r,h,24),material(0x8fa59b));tank.position.set(x,h/2,-y);b.add(tank);}
 label('IPAL',52,3.5,-116,5);
 // Landscape is a visual assumption outside the measured building, explicitly recorded in metadata.
 for(let i=0;i<10;i++){const x=-13.1,z=-8-i*10;box(layers.landscape,x,.08,z,2.4,.22,4,0x69846b);line(layers.landscape,new T.Vector3(x,0,z),new T.Vector3(x,2,z),.13,0x87745c);for(const [dx,dy,dz] of [[0,3,0],[-.65,2.65,.2],[.65,2.6,-.2]]){const crown=new T.Mesh(new T.IcosahedronGeometry(1.1,1),material(0x4f785b));crown.position.set(x+dx,dy,z+dz);layers.landscape.add(crown);}}
 for(let i=0;i<12;i++){box(layers.landscape,26+i*4,.18,8,3,.35,1.6,0x879b87);const shrub=new T.Mesh(new T.IcosahedronGeometry(.65,1),material(0x50775d));shrub.position.set(26+i*4,.85,8);layers.landscape.add(shrub);}
 for(const z of [-61,-68])box(layers.landscape,-9,1.2,z,.45,2.4,.45,0x71878d);
 box(layers.landscape,-9,1.15,-64.5,.09,2.1,5,0x617b86,0,.55);label('GERBANG',-9,3.7,-64.5,6,'#244b5c');
 // All assets use existing silhouette meshes at unit scale, centred inside their own footprint.
 const assets=new Map();
 for(const f of fleet){const p=f.placement,g=new T.Group();g.name=p.label;g.position.set(p.x,0,-p.y);g.rotation.y=p.rotation*Math.PI/180;g.userData={machineId:p.machineId,placementStatus:p.status,semantic:'FACTORY_MACHINE',scaleFitApplied:false};
  for(const s of f.meshes){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(s.p,3));geo.setIndex(s.i);geo.computeVertexNormals();const mesh=new T.Mesh(geo,material(s.color));mesh.userData.machineId=p.machineId;g.add(mesh);}
  (p.status==='UNIDENTIFIED'?layers.unidentified:layers.machines).add(g);assets.set(p.machineId,g);
  label(p.label,p.x,Math.max(3.3,f.size[1]+.6),-p.y,Math.min(9,4+p.label.length*.08),p.status==='UNIDENTIFIED'?'#8a5921':'#244b5c',p.status==='UNIDENTIFIED'?layers.unidentified:layers.labels);
 }
 box(layers.unidentified,124,-.07,-44,38,.1,86,0xd9d4c5);label('POSISI AKTUAL BELUM TERIDENTIFIKASI',124,4,-90,30,'#835a2c',layers.unidentified);
 const pts=data.segments.flatMap(s=>[s[0],.012,-s[1],s[2],.012,-s[3]]),geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pts,3));layers.reference.add(new T.LineSegments(geo,new T.LineBasicMaterial({color:0x355e72,transparent:true,opacity:.4})));
 root.userData={baselineId:layout.baselineId,assumptions:{...data.assumptions,roofEaves:4.5,roofRidge:7,roofHeightEvidence:'USER_APPROXIMATE_MEASUREMENT',machineServiceClearance:MACHINE_SERVICE_CLEARANCE,offsetRoomClearance:1.85,wallTreatment:'SOURCE_SEGMENTS_CLIPPED_TO_SERVICE_ENVELOPE',portalTreatment:'SOURCE_PORTALS_SHIFTED_ONLY_WHEN_CLEARANCE_CONFLICTS',roomContents:'FUNCTION_SPECIFIC_VISUALIZATION_NOT_AS_BUILT_INVENTORY'},offsetRooms:pressRooms.map(r=>({...r,centerError:Math.hypot((r.minX+r.maxX)/2-r.centerX,(r.minY+r.maxY)/2-r.centerY)})),nonMachineCollisionAudit:{placedFixtures:fixtureBoxes.length,skippedFixtures:skippedFixtures.length,accidentalFixtureOverlaps:0},omittedCollisionWalls:0,trimmedCollisionWalls:omitted.length,adjustedPortals:adjustedPortals.map(p=>({semantic:p.evidence,x:p.x,y:p.y,sourceX:p.sourceX,sourceY:p.sourceY})),legacyWalls:data.legacyWalls.length};
 return {root,layers,assets,machineBoxes};
}
