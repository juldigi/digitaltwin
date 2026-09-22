import * as T from 'three';
import {FACTORY_FLEET_GZIP} from './data/factory-fleet-data.js';
import {decodePlantData} from './data/plant-actual.js';
import {buildUtilityRoutingScaffold} from './utility-routing.js';
import {V145_SOURCE_STATS} from './data/research-v145.js';
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
 for(const name of ['building','roof','machines','labels','landscape','reference','unidentified','utility_compressed_air','utility_ahu_piping','utility_ahu_ducting','utility_anchors']){layers[name]=new T.Group();layers[name].name=name;root.add(layers[name]);}
 layers.roof.visible=false;layers.reference.visible=false;
 for(const name of ['utility_compressed_air','utility_ahu_piping','utility_ahu_ducting','utility_anchors'])layers[name].visible=false;
 const mats=new Map();const material=(color,opacity=1)=>{const k=color+':'+opacity;if(!mats.has(k))mats.set(k,new T.MeshStandardMaterial({color,roughness:.82,metalness:.04,transparent:opacity<1,opacity,depthWrite:opacity===1,side:T.DoubleSide}));return mats.get(k);};
 const lightMaterial=new T.MeshStandardMaterial({color:0xe8eee9,emissive:0xe7f1dd,emissiveIntensity:1.15,roughness:.48,metalness:.02});
 const boxGeo=new T.BoxGeometry(1,1,1);
 const box=(parent,x,y,z,w,h,d,color,rot=0,opacity=1)=>{const o=new T.Mesh(boxGeo,material(color,opacity));o.position.set(x,y,z);o.scale.set(w,h,d);o.rotation.y=rot;o.receiveShadow=true;parent.add(o);return o;};
 const line=(parent,a,b,r,color)=>{const delta=new T.Vector3().subVectors(b,a),o=new T.Mesh(new T.CylinderGeometry(r,r,delta.length(),6),material(color));o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());parent.add(o);return o;};
 const label=(text,x,y,z,width=7,color='#20394c',parent=layers.labels)=>{
  if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=512;c.height=80;const ctx=c.getContext('2d');if(!ctx)return;
  ctx.fillStyle='rgba(250,253,255,.92)';ctx.fillRect(0,0,512,80);ctx.fillStyle=color;ctx.font='600 27px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,49,490);
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const s=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:false}));s.position.set(x,y,z);s.scale.set(width,width*80/512,1);parent.add(s);return s;
 };
 const data=layout.actual,b=layers.building;
 const buildingDetailStats={floorControlJoints:0,serviceClearanceMarkings:0,columnBasePlates:0,columnAnchorBolts:0,columnPedestals:0,columnStiffeners:0,wallPanelJoints:0,wallGirts:0,wallBaseFlashings:0,primaryRoofFrames:0,eaveHaunches:0,eaveStruts:0,apexSplices:0,roofPurlins:0,purlinAntiSag:0,flyBracing:0,roofBracing:0,roofGutters:0,roofDownpipes:0,downpipeShoes:0,linearLights:0,doorPersonnel:0,doorWide:0,doorProtection:0,dockSafetyElements:0,pressRoomProtection:0,ipalFrameBraces:0,ipalGuardrails:0,officeWorkstations:0,officeMonitors:0,officeTaskChairs:0,officeStorageUnits:0,officePlanningBoards:0,officePrintStations:0,qcInspectionFixtures:0,sparepartRackBays:0,sparepartBins:0,sparepartRackGuards:0,warehousePalletLoads:0,warehouseReelCradles:0,warehouseAisleMarkings:0,warehouseSafetyElements:0,finishedGoodsPalletLoads:0,finishedGoodsStagingZones:0,officeCeilingTiles:0,officeLedPanels:0,officeSupplyDiffusers:0,officeReturnGrilles:0,officeCeilingSensors:0,officePowerDataPoints:0,toiletMirrors:0,toiletDispensers:0,toiletFloorDrains:0,toiletExhaustGrilles:0,pantryFixtures:0,lockerDoors:0,fireExtinguisherReferences:0,emergencyLuminaireReferences:0,warehousePedestrianLanes:0,warehouseCrossings:0,warehouseConvexMirrors:0,warehouseBarrierElements:0,warehouseTrafficCues:0,palletJackReferences:0,warehouseWearMarks:0};
 const detail=(o,semantic,accuracy='INDUSTRIAL_REALISM_REFERENCE_NOT_AS_BUILT')=>{if(o)o.userData={...o.userData,semantic,accuracy,researchVersion:'V145'};return o;};
 // The outline follows the source production hall and attached office/service wings.
 const outline=[[-4,2],[6,2],[6,6],[96,6],[96,90],[90,96],[73,96],[73,103],[23,103],[23,96],[6,96],[6,55],[-5,55],[-5,11],[-4,11]];
 const shape=new T.Shape(outline.map(([x,y])=>new T.Vector2(x,y))),floor=new T.Mesh(new T.ShapeGeometry(shape),material(0xd8dcda));floor.rotation.x=-Math.PI/2;floor.position.y=-.015;floor.receiveShadow=true;floor.userData={semantic:'REINFORCED_CONCRETE_FLOOR',accuracy:'SOURCE_OUTLINE_WITH_VISUAL_MATERIAL_REFERENCE'};b.add(floor);
 // Concrete control-joint grid is a subdued realism reference, not an as-built joint survey.
 for(let x=10;x<=94;x+=8){const j=box(b,x,.002,-49,.018,.004,82,0x7f8987);detail(j,'FLOOR_CONTROL_JOINT_REFERENCE');buildingDetailStats.floorControlJoints++;}
 for(let y=10;y<=90;y+=8){const j=box(b,51,.002,-y,86,.004,.018,0x7f8987);detail(j,'FLOOR_CONTROL_JOINT_REFERENCE');buildingDetailStats.floorControlJoints++;}
 box(layers.landscape,47,-.25,-57,117,.35,137,0x9ea9a5);
 box(layers.landscape,47,-.06,1.8,110,.04,7.5,0x626d73);
 box(layers.landscape,-9,-.06,-53,5,.04,110,0x626d73);
 const machineBoxes=[];
 for(const f of fleet){const p=f.placement,r=p.rotation*Math.PI/180,c=Math.abs(Math.cos(r)),s=Math.abs(Math.sin(r));machineBoxes.push({p,minX:p.x-(f.size[0]*c+f.size[2]*s)/2,maxX:p.x+(f.size[0]*c+f.size[2]*s)/2,minY:p.y-(f.size[0]*s+f.size[2]*c)/2,maxY:p.y+(f.size[0]*s+f.size[2]*c)/2});}
 const serviceClearances=machineClearanceBoxes(fleet);
 const ringLine=(x,z,w,d,color=0xb59b3d)=>{for(const [px,pz,pw,pd] of [[x,z-d/2,w,.025],[x,z+d/2,w,.025],[x-w/2,z,.025,d],[x+w/2,z,.025,d]])detail(box(b,px,.008,pz,pw,.016,pd,color),'FLOOR_SERVICE_CLEARANCE_MARKING_REFERENCE');};
 for(const c of serviceClearances){ringLine((c.minX+c.maxX)/2,-(c.minY+c.maxY)/2,c.maxX-c.minX,c.maxY-c.minY);buildingDetailStats.serviceClearanceMarkings+=4;}
 const pressRooms=pressRoomEnvelopes(fleet);
 const ipalZone={minX:32.8,maxX:60,minY:103.45,maxY:118.4};
 const wallInsideIpal=w=>{const x=(w.a[0]+w.b[0])/2,y=(w.a[1]+w.b[1])/2;return x>=ipalZone.minX&&x<=ipalZone.maxX&&y>=ipalZone.minY&&y<=ipalZone.maxY;};
 const intersectsMachine=(a,c)=>machineBoxes.some(m=>m.p.status!=='UNIDENTIFIED'&&Math.max(a[0],c[0])>m.minX+.05&&Math.min(a[0],c[0])<m.maxX-.05&&Math.max(a[1],c[1])>m.minY+.05&&Math.min(a[1],c[1])<m.maxY-.05);
 const omitted=[];
 const ipalRemovedWalls=[];
 const wallPieces=[];for(const w of data.walls){if(wallInsideIpal(w)){ipalRemovedWalls.push(w);continue;}const pieces=clipWallToMachineClearance(w,[...serviceClearances,...pressRooms]);if(pieces.length!==1||pieces[0].a[0]!==w.a[0]||pieces[0].a[1]!==w.a[1]||pieces[0].b[0]!==w.b[0]||pieces[0].b[1]!==w.b[1])omitted.push(w);wallPieces.push(...pieces);}
 for(const w of wallPieces){const [a,c]=[w.a,w.b];
  const dx=c[0]-a[0],dy=c[1]-a[1],len=Math.hypot(dx,dy),r=Math.atan2(dy,dx),x=(a[0]+c[0])/2,z=-(a[1]+c[1])/2;
  const wall=box(b,x,1.75,z,len,3.5,w.width,0xe8e5df,r);wall.castShadow=true;wall.userData={semantic:'WALL',sourceHandles:w.handles,heightStatus:'VISUAL_ESTIMATE',machineClearance:MACHINE_SERVICE_CLEARANCE};
  const plinth=box(b,x,.12,z,len,.24,w.width+.035,0x64777e,r);detail(plinth,'WALL_BASE_PLINTH_REFERENCE');const head=box(b,x,3.46,z,len,.08,w.width+.025,0x71878b,r);detail(head,'WALL_HEAD_FLASHING_REFERENCE');for(const gy of [.72,1.48,2.24,3.0]){const girt=box(b,x,gy,z,len,.045,w.width+.06,0x74868b,r);detail(girt,'WALL_GIRT_REFERENCE');buildingDetailStats.wallGirts++;}const baseFlash=box(b,x,.28,z,len,.055,w.width+.07,0x5f747c,r);detail(baseFlash,'WALL_BASE_FLASHING_REFERENCE');buildingDetailStats.wallBaseFlashings++;
  // Clerestory window treatment has source-aligned position, with assumed sill and glass detail.
  if(len>5.5){const glass=box(b,x,2.35,z,Math.max(.6,len-.7),.55,w.width+.025,0xa5cbd0,r,.38);glass.userData.semantic='FROSTED_CLERESTORY';
   const joints=Math.min(12,Math.floor(len/1.45));for(let i=1;i<joints;i++){const u=i/joints,px=a[0]+dx*u,py=a[1]+dy*u;const joint=box(b,px,1.62,-py,.024,3.22,w.width+.04,0xcbd1ce,r);detail(joint,'WALL_PANEL_OR_CONTROL_JOINT_REFERENCE');buildingDetailStats.wallPanelJoints++;}}
 }
 const roomWall=(a,c,room)=>{const dx=c[0]-a[0],dy=c[1]-a[1],len=Math.hypot(dx,dy);if(len<.25)return;const r=Math.atan2(dy,dx),x=(a[0]+c[0])/2,z=-(a[1]+c[1])/2;
  const lower=box(b,x,1.05,z,len,2.10,.13,0xe4e7e3,r,.96);lower.castShadow=true;lower.userData={semantic:'PRESS_ROOM_LOWER_PARTITION',machineId:room.machineId,roomCentered:true,accuracy:'FUNCTIONAL_PARTITION_VISUALIZATION'};
  const skirting=box(b,x,.11,z,len,.22,.17,0x60757d,r);detail(skirting,'PRESS_ROOM_SKIRTING_REFERENCE');const kick=box(b,x,.48,z,len,.055,.18,0x7c8f94,r);detail(kick,'PRESS_ROOM_KICK_RAIL_REFERENCE');
  const glass=box(b,x,2.66,z,Math.max(.2,len-.12),1.12,.115,0xaed8dc,r,.28);glass.userData={semantic:'PRESS_ROOM_UPPER_GLAZING',machineId:room.machineId,accuracy:'FUNCTIONAL_PARTITION_VISUALIZATION'};
  const top=box(b,x,3.25,z,len,.10,.16,0x60757d,r);top.userData={semantic:'PRESS_ROOM_GLAZING_HEAD',machineId:room.machineId};
  const mullions=Math.max(1,Math.floor(len/1.5));for(let i=1;i<mullions;i++){const u=i/mullions,px=a[0]+dx*u,py=a[1]+dy*u;const m=box(b,px,2.66,-py,.045,1.12,.16,0x6f858a,r);m.userData={semantic:'PRESS_ROOM_GLAZING_MULLION',machineId:room.machineId};}
 };
 for(const room of pressRooms){
  const gap=room.curtainWidth/2,leftEnd=room.centerX-gap,rightStart=room.centerX+gap;
  roomWall([room.minX,room.minY],[leftEnd,room.minY],room);roomWall([rightStart,room.minY],[room.maxX,room.minY],room);
  roomWall([room.minX,room.maxY],[room.maxX,room.maxY],room);roomWall([room.minX,room.minY],[room.minX,room.maxY],room);roomWall([room.maxX,room.minY],[room.maxX,room.maxY],room);
  const zone=box(b,room.centerX,.006,-room.centerY,room.maxX-room.minX,.012,room.maxY-room.minY,0xdde6e4,0,.18);zone.userData={semantic:'PRESS_ROOM_FLOOR',machineId:room.machineId,roomCentered:true};
  for(const [cx,cz] of [[room.minX+.22,-room.minY-.22],[room.maxX-.22,-room.minY-.22],[room.minX+.22,-room.maxY+.22],[room.maxX-.22,-room.maxY+.22]]){const guard=box(b,cx,.38,cz,.12,.76,.12,0xe3b52e);detail(guard,'PRESS_ROOM_CORNER_PROTECTION_REFERENCE');buildingDetailStats.pressRoomProtection++;}
 }
 for(const [x,y] of data.columns){if(intersectsMachine([x-.3,y-.3],[x+.3,y+.3]))continue;const pedestal=box(b,x,.18,-y,.72,.36,.72,0x9aa4a1);detail(pedestal,'COLUMN_CONCRETE_PEDESTAL_REFERENCE');buildingDetailStats.columnPedestals++;
  const column=box(b,x,2.43,-y,.32,4.14,.32,0x819397);column.castShadow=true;column.userData={semantic:'STRUCTURAL_COLUMN',height:4.5,evidence:'DXF_COLUMN_POSITION'};
  const plate=box(b,x,.405,-y,.62,.09,.62,0x66777b);detail(plate,'COLUMN_BASE_PLATE_REFERENCE');buildingDetailStats.columnBasePlates++;
  for(const dx of [-.22,.22])for(const dz of [-.22,.22]){const bolt=new T.Mesh(new T.CylinderGeometry(.028,.028,.08,10),material(0x4f5d61));bolt.position.set(x+dx,.49,-y+dz);bolt.userData={semantic:'COLUMN_ANCHOR_BOLT_REFERENCE',accuracy:'INDUSTRIAL_REALISM_REFERENCE_NOT_AS_BUILT'};b.add(bolt);buildingDetailStats.columnAnchorBolts++;}
  for(const sx of [-1,1]){const st=box(b,x+sx*.20,.61,-y,.10,.34,.28,0x6d8086);st.rotation.z=sx*.32;detail(st,'COLUMN_BASE_STIFFENER_REFERENCE');buildingDetailStats.columnStiffeners++;}
  const cap=box(b,x,4.46,-y,.54,.12,.54,0x6e8288);detail(cap,'COLUMN_EAVE_CAP_REFERENCE');
 }
 const adjustedPortals=[];
 for(const source of data.doors){const d=resolvePortalClearance({...source,width:Math.max(.9,source.width)},serviceClearances);if(d.clearanceAdjusted)adjustedPortals.push(d);const g=new T.Group();g.position.set(d.x,0,-d.y);g.rotation.y=d.rotation*Math.PI/180;b.add(g);
  const personnel=d.width<1.8;g.userData={semantic:'DOOR',evidence:d.evidence,clearanceAdjusted:d.clearanceAdjusted,sourcePosition:[d.sourceX,d.sourceY],openingTypeReference:personnel?'PERSONNEL_HINGED':'WIDE_SECTIONAL_OR_SLIDING_REFERENCE',asBuiltTypeVerified:false};
  const h=personnel?2.45:3.05;box(g,-d.width/2,h/2,0,.095,h,.18,0x526b75);box(g,d.width/2,h/2,0,.095,h,.18,0x526b75);box(g,0,h-.045,0,d.width+.18,.09,.18,0x526b75);
  if(personnel){buildingDetailStats.doorPersonnel++;const leaf=box(g,-d.width/2+.08,1.16,-d.width*.43,d.width*.96,2.30,.052,0x9db5bd,Math.PI/2.35);leaf.castShadow=true;detail(leaf,'PERSONNEL_DOOR_LEAF_REFERENCE');const handle=new T.Mesh(new T.SphereGeometry(.035,8,6),material(0xd5c6a2));handle.position.set(d.width*.34,1.08,-.055);leaf.add(handle);const kick=box(leaf,0,-.88,.028,d.width*.78,.24,.018,0x71858b);detail(kick,'PERSONNEL_DOOR_KICK_PLATE_REFERENCE');const closer=box(leaf,0,.98,.03,.32,.07,.06,0x5a6d74);detail(closer,'PERSONNEL_DOOR_CLOSER_REFERENCE');const threshold=box(g,0,.025,-.01,d.width-.08,.05,.16,0x6a7779);detail(threshold,'DOOR_THRESHOLD_REFERENCE');}
  else{buildingDetailStats.doorWide++;for(let yy=.22;yy<h-.18;yy+=.22){const slat=box(g,0,yy,.035,d.width-.12,.19,.045,yy>h*.58?0x8299a1:0x9caeb3);detail(slat,'WIDE_DOOR_SECTIONAL_SLAT_REFERENCE');}for(const sx of [-d.width/2+.10,d.width/2-.10])detail(box(g,sx,h/2,.08,.055,h-.18,.055,0x42565f),'WIDE_DOOR_GUIDE_TRACK_REFERENCE');for(const sx of [-d.width/2-.25,d.width/2+.25]){detail(box(g,sx,.46,-.28,.17,.92,.17,0xe2b428),'WIDE_DOOR_BOLLARD_REFERENCE');detail(box(g,sx,.61,-.28,.18,.10,.18,0x303b42),'WIDE_DOOR_BOLLARD_CAP_REFERENCE');buildingDetailStats.doorProtection++;}}
 }
 const addCurtain=(d,semantic='PVC_CURTAIN',machineId=null)=>{const g=new T.Group();g.position.set(d.x,0,-d.y);g.rotation.y=d.rotation*Math.PI/180;b.add(g);g.userData={semantic,evidence:d.evidence,clearanceAdjusted:d.clearanceAdjusted,sourcePosition:[d.sourceX,d.sourceY],machineId};
  box(g,0,3.12,0,d.width+.32,.18,.2,0x526e7c);box(g,-d.width/2-.12,1.55,0,.14,3.1,.2,0x526e7c);box(g,d.width/2+.12,1.55,0,.14,3.1,.2,0x526e7c);
  const n=Math.ceil(d.width/.2);for(let i=0;i<n;i++){const strip=box(g,-d.width/2+(i+.5)*d.width/n,1.52,.012*(i%2),d.width/n+.035,2.95,.014,i%2?0xaddde1:0xc4eaec,0,.26);strip.userData.semantic='PVC_STRIP';}
  for(const x of [-d.width/2-.42,d.width/2+.42]){box(g,x,.48,-.28,.18,.96,.18,0xe2b428);box(g,x,.48,-.28,.19,.18,.19,0x313b40);}
  return g;
 };
 for(const source of data.curtains){const d=resolvePortalClearance({...source,width:Math.max(2.6,source.width)},serviceClearances);if(d.clearanceAdjusted)adjustedPortals.push(d);addCurtain(d);}
 for(const room of pressRooms)addCurtain({x:room.centerX,y:room.minY,width:room.curtainWidth,rotation:0,evidence:'CENTERED OFFSET ROOM ACCESS',sourceX:room.centerX,sourceY:room.minY,clearanceAdjusted:false},'PRESS_ROOM_CURTAIN',room.machineId);
 // Open loading dock: source location retained; leveller, guards and protection are functional visual references.
 const dock=box(b,84,.42,-4.1,7.5,.85,3.2,0x8d9798);dock.userData={semantic:'LOADING_DOCK_PLATFORM',accuracy:'SOURCE_LOCATION_WITH_FUNCTIONAL_DETAIL'};
 for(const x of [81,83,85,87]){detail(box(b,x,.75,-2.45,.32,.6,.18,0x303b42),'DOCK_RUBBER_BUMPER_REFERENCE');buildingDetailStats.dockSafetyElements++;}
 const leveller=box(b,84,.86,-3.08,3.1,.10,1.22,0x586970);leveller.rotation.x=-.055;detail(leveller,'DOCK_LEVELLER_REFERENCE');buildingDetailStats.dockSafetyElements++;
 const dockStair=new T.Group();dockStair.position.set(88.7,0,-4.85);b.add(dockStair);for(let i=0;i<4;i++){const step=box(dockStair,i*.22,.11+i*.18,0,.42,.18,.95,0x78868a);detail(step,'DOCK_ACCESS_STAIR_TREAD_REFERENCE');}for(const z of [-.42,.42]){const rail=line(dockStair,new T.Vector3(-.15,.25,z),new T.Vector3(.82,1.15,z),.025,0xbac4c2);detail(rail,'DOCK_STAIR_HANDRAIL_REFERENCE');for(let i=0;i<4;i++)detail(line(dockStair,new T.Vector3(i*.22,.18+i*.18,z),new T.Vector3(i*.22,.82+i*.18,z),.018,0xbac4c2),'DOCK_STAIR_GUARD_POST_REFERENCE');}buildingDetailStats.dockSafetyElements+=10;
 for(const x of [80.35,87.65]){detail(box(b,x,.55,-4.55,.18,1.10,.18,0xe2b428),'DOCK_BOLLARD_REFERENCE');detail(box(b,x,.95,-4.55,.19,.12,.19,0x27343a),'DOCK_BOLLARD_CAP_REFERENCE');buildingDetailStats.dockSafetyElements++;}
 for(const x of [82.3,85.7]){const guide=box(layers.landscape,x,.14,-.75,.18,.28,3.3,0xe2b428);guide.rotation.y=x<84?-.10:.10;detail(guide,'TRUCK_WHEEL_GUIDE_REFERENCE');buildingDetailStats.dockSafetyElements++;}
 const drain=box(layers.landscape,84,.035,-2.05,7.3,.07,.22,0x46565d);detail(drain,'DOCK_TRENCH_DRAIN_REFERENCE');for(let x=80.6;x<87.5;x+=.42)detail(box(layers.landscape,x,.075,-2.05,.28,.025,.24,0x26343a),'DOCK_DRAIN_GRATE_REFERENCE');
 box(b,84,4.5,-4.2,9,.15,5,0x536e7a);for(const x of [80,88])box(b,x,2.25,-2.3,.18,4.5,.18,0x526b75);for(const x of [80.5,82.5,84.5,86.5,87.5]){const brace=line(b,new T.Vector3(x,4.42,-6.45),new T.Vector3(x+.55,3.92,-4.0),.025,0x60747c);detail(brace,'DOCK_CANOPY_BRACE_REFERENCE');}
 const dockGutter=line(b,new T.Vector3(79.7,4.39,-6.55),new T.Vector3(88.3,4.39,-6.55),.045,0x526b75);detail(dockGutter,'DOCK_CANOPY_GUTTER_REFERENCE');for(const x of [80,88]){const down=line(b,new T.Vector3(x,4.38,-6.5),new T.Vector3(x,.18,-6.5),.038,0x526b75);detail(down,'DOCK_CANOPY_DOWNPIPE_REFERENCE');}
 box(b,14,1.25,-2.2,4.5,2.5,.09,0x8a9da3,0,.6);
 // User-confirmed vertical envelope: 4.5 m eaves and approximately 7 m ridge.
 const roofSections=[[51,90,-51,90,'MAIN_HALL'],[47.5,51,-99.5,7,'NORTH_WING'],[.5,11,-33,44,'WEST_WING']];
 for(const [x,w,z,d,roofId] of roofSections){
  const half=w/2,rise=2.5,slope=Math.atan2(rise,half),len=Math.hypot(half,rise),roofY=rx=>6.93-rise*Math.abs(rx)/half;
  for(const sign of [-1,1]){
   const roof=box(layers.roof,x+sign*w/4,5.75,z,len,.16,d,0x6e8790);roof.rotation.z=-sign*slope;roof.userData={semantic:'ROOF_PANEL',roofId,eavesHeight:4.5,ridgeHeight:7,heightEvidence:'USER_APPROXIMATE_MEASUREMENT'};
   // Sheet rib / standing-seam visual rhythm.
   for(let j=-d/2+1;j<d/2;j+=2){const rib=line(layers.roof,new T.Vector3(x,6.93,z+j),new T.Vector3(x+sign*w/2,4.43,z+j),.024,0xa7b8bc);detail(rib,'ROOF_PANEL_RIB_REFERENCE');}
  }
  // Portal rafters / transverse frames.
  for(let zz=z-d/2+3;zz<z+d/2;zz+=6){
   const eave=line(b,new T.Vector3(x-w/2,4.35,zz),new T.Vector3(x+w/2,4.35,zz),.055,0x4d6570);detail(eave,'PORTAL_EAVE_TIE_REFERENCE');
   const r1=line(b,new T.Vector3(x-w/2,4.35,zz),new T.Vector3(x,6.85,zz),.075,0x4d6570);detail(r1,'PORTAL_RAFTER_REFERENCE');
   const r2=line(b,new T.Vector3(x,6.85,zz),new T.Vector3(x+w/2,4.35,zz),.075,0x4d6570);detail(r2,'PORTAL_RAFTER_REFERENCE');buildingDetailStats.primaryRoofFrames++;
   for(const sign of [-1,1]){const hx=x+sign*(half-.72),hy=4.63;const haunch=line(b,new T.Vector3(x+sign*half,4.35,zz),new T.Vector3(hx,hy,zz),.105,0x465e68);detail(haunch,'PORTAL_EAVE_HAUNCH_REFERENCE');buildingDetailStats.eaveHaunches++;const es=line(b,new T.Vector3(x+sign*half,4.28,zz-.22),new T.Vector3(x+sign*half,4.28,zz+.22),.06,0x5d737c);detail(es,'EAVE_STRUT_REFERENCE');buildingDetailStats.eaveStruts++;}
   const apex=box(b,x,6.82,zz,.52,.18,.16,0x596f78);detail(apex,'PORTAL_APEX_SPLICE_REFERENCE');buildingDetailStats.apexSplices++;
  }
  // Longitudinal purlins sit below the cladding and make the roof read as a real industrial frame.
  const purlinStep=Math.max(2.6,Math.min(5,half/5));const purlinXs=[];for(let rx=-half+purlinStep;rx<half;rx+=purlinStep){purlinXs.push(rx);const py=roofY(rx)-.12;const p=line(layers.roof,new T.Vector3(x+rx,py,z-d/2+.35),new T.Vector3(x+rx,py,z+d/2-.35),.028,0x6f858c);detail(p,'ROOF_PURLIN_REFERENCE');buildingDetailStats.roofPurlins++;}
  for(let i=0;i<purlinXs.length-1;i+=2){const xa=x+purlinXs[i],xb=x+purlinXs[i+1],ya=roofY(purlinXs[i])-.20,yb=roofY(purlinXs[i+1])-.20;for(let zz=z-d/2+5;zz<z+d/2-3;zz+=12){const rod=line(layers.roof,new T.Vector3(xa,ya,zz),new T.Vector3(xb,yb,zz),.010,0x7a8c91);detail(rod,'PURLIN_ANTI_SAG_ROD_REFERENCE');buildingDetailStats.purlinAntiSag++;}}
  for(const sign of [-1,1])for(let zz=z-d/2+6;zz<z+d/2-3;zz+=12){const fb=line(b,new T.Vector3(x+sign*(half-.4),4.18,zz),new T.Vector3(x+sign*(half-2.0),roofY(sign*(half-2.0))-.20,zz),.016,0x6c8087);detail(fb,'RAFTER_FLY_BRACING_REFERENCE');buildingDetailStats.flyBracing++;}
  const ridge=line(layers.roof,new T.Vector3(x,7.02,z-d/2),new T.Vector3(x,7.02,z+d/2),.045,0x9aabad);detail(ridge,'ROOF_RIDGE_CAP_REFERENCE');
  // Roof-plane X bracing at the first and last frame bays.
  if(d>10)for(const zz of [z-d/2+4.5,z+d/2-4.5]){const a1=new T.Vector3(x-half*.72,roofY(-half*.72)-.16,zz-2.2),a2=new T.Vector3(x+half*.72,roofY(half*.72)-.16,zz+2.2),a3=new T.Vector3(x+half*.72,roofY(half*.72)-.16,zz-2.2),a4=new T.Vector3(x-half*.72,roofY(-half*.72)-.16,zz+2.2);detail(line(layers.roof,a1,a2,.018,0x72858a),'ROOF_X_BRACING_REFERENCE');detail(line(layers.roof,a3,a4,.018,0x72858a),'ROOF_X_BRACING_REFERENCE');buildingDetailStats.roofBracing+=2;}
  // Eave gutters and approximate downpipe spacing are reference-only until facade photos/as-built MEP are supplied.
  for(const sign of [-1,1]){const ex=x+sign*half;const gutter=line(layers.roof,new T.Vector3(ex,4.43,z-d/2),new T.Vector3(ex,4.43,z+d/2),.042,0x536b73);detail(gutter,'MAIN_ROOF_GUTTER_REFERENCE');buildingDetailStats.roofGutters++;
   for(let zz=z-d/2+4;zz<z+d/2-2;zz+=18){const down=line(b,new T.Vector3(ex,4.40,zz),new T.Vector3(ex,.16,zz),.035,0x536b73);detail(down,'MAIN_ROOF_DOWNPIPE_REFERENCE');buildingDetailStats.roofDownpipes++;const shoe=line(b,new T.Vector3(ex,.16,zz),new T.Vector3(ex-sign*.38,.08,zz),.04,0x536b73);detail(shoe,'DOWNPIPE_SHOE_REFERENCE');buildingDetailStats.downpipeShoes++;}}
 }
 // Suspended linear lighting: functional density reference from industrial print halls, not an as-built fixture survey.
 const addLinearLight=(x,z,len=1.6)=>{const g=new T.Group();g.position.set(x,0,z);b.add(g);const rod1=line(g,new T.Vector3(-len*.35,4.42,0),new T.Vector3(-len*.35,4.08,0),.008,0x718087),rod2=line(g,new T.Vector3(len*.35,4.42,0),new T.Vector3(len*.35,4.08,0),.008,0x718087);detail(rod1,'LIGHT_SUSPENSION_REFERENCE');detail(rod2,'LIGHT_SUSPENSION_REFERENCE');const fixture=new T.Mesh(boxGeo,lightMaterial);fixture.position.set(0,4.04,0);fixture.scale.set(len,.055,.12);fixture.userData={semantic:'SUSPENDED_LINEAR_LED_REFERENCE',accuracy:'INDUSTRIAL_REALISM_REFERENCE_NOT_AS_BUILT'};g.add(fixture);buildingDetailStats.linearLights++;};
 for(const x of [14,29,44,59,74,89])for(let y=12;y<=86;y+=8)addLinearLight(x,-y,1.65);

 // Source-labelled rooms receive function-specific, non-OEM interiors.
 // DXF labels define room function/position only. Furniture, storage equipment and inventory below are
 // ergonomic/industrial references and remain explicitly NOT-AS-BUILT until field photos are supplied.
 const roomWords=/Workshop|Adm Room|QC Sample|R\.PDS|R\.Sample|R\.INCOMING|WH Spareparts|Mushola|Loading Dock|CTF|CTP|Toilet|R\.BROKE|R\.FPS|Electric room|PPIC|Pantry|Kitchen|Refreshment|Locker|Loker|Changing|Change Room/i;
 const fixtureBoxes=[],skippedFixtures=[];
 const fixture=(x,y,w,h,d,color,semantic,integrated=false,centerY=null)=>{
  const bounds={minX:x-w/2,maxX:x+w/2,minY:y-d/2,maxY:y+d/2,semantic};
  if(intersectsMachine([bounds.minX,bounds.minY],[bounds.maxX,bounds.maxY])||(!integrated&&fixtureBoxes.some(q=>Math.min(bounds.maxX,q.maxX)-Math.max(bounds.minX,q.minX)>.025&&Math.min(bounds.maxY,q.maxY)-Math.max(bounds.minY,q.minY)>.025))){skippedFixtures.push(bounds);return null;}
  const o=box(b,x,centerY??h/2,-y,w,h,d,color);o.castShadow=true;o.userData={semantic,accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',collisionAudited:true,researchVersion:'V145'};if(!integrated)fixtureBoxes.push(bounds);return o;
 };
 const taskChair=(x,y)=>{
  fixture(x,y,.48,.09,.48,0x526976,'OFFICE_TASK_CHAIR_SEAT',true,.48);
  fixture(x,y+.18,.48,.54,.075,0x526976,'OFFICE_TASK_CHAIR_BACK',true,.80);
  const stem=new T.Mesh(new T.CylinderGeometry(.035,.045,.36,10),material(0x4e5e65));stem.position.set(x,.27,-y);stem.userData={semantic:'OFFICE_TASK_CHAIR_GAS_LIFT_REFERENCE',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V145'};b.add(stem);
  for(let a=0;a<Math.PI*2;a+=Math.PI*2/5){const foot=line(b,new T.Vector3(x,.09,-y),new T.Vector3(x+Math.cos(a)*.27,.07,-y+Math.sin(a)*.27),.018,0x4e5e65);foot.userData={semantic:'OFFICE_TASK_CHAIR_BASE_REFERENCE',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V145'};}
  buildingDetailStats.officeTaskChairs++;
 };
 const officeWorkstation=(x,y,tag='OFFICE')=>{
  const desktop=fixture(x,y,1.48,.075,.72,0xb79a76,tag+'_DESK',false,.74);if(!desktop)return false;
  fixture(x,y+.30,1.18,.42,.055,0x8c7a66,tag+'_MODESTY_PANEL',true,.43);
  for(const dx of [-.63,.63])for(const dy of [-.27,.27])fixture(x+dx,y+dy,.055,.69,.055,0x586a72,tag+'_DESK_LEG',true,.35);
  fixture(x-.18,y-.15,.52,.315,.035,0x1e2c33,tag+'_MONITOR',true,1.12);
  fixture(x-.18,y-.15,.12,.20,.10,0x566970,tag+'_MONITOR_STAND',true,.91);
  fixture(x-.10,y+.13,.46,.025,.17,0x37464d,tag+'_KEYBOARD',true,.795);
  fixture(x+.32,y+.13,.06,.025,.10,0x37464d,tag+'_MOUSE',true,.795);
  fixture(x+.49,y-.05,.36,.60,.52,0x75888d,tag+'_PEDESTAL_DRAWER',true,.30);
  fixture(x+.50,y-.05,.27,.018,.012,0x566970,tag+'_DRAWER_PULL',true,.43);
  fixture(x+.50,y-.05,.27,.018,.012,0x566970,tag+'_DRAWER_PULL',true,.28);
  taskChair(x,y+.80);deskPowerData(x,y,tag);
  buildingDetailStats.officeWorkstations++;buildingDetailStats.officeMonitors++;buildingDetailStats.officeStorageUnits++;
  return true;
 };
 const guestChair=(x,y,tag='VISITOR')=>{fixture(x,y,.46,.08,.46,0x687d87,tag+'_CHAIR_SEAT',true,.45);fixture(x,y+.17,.46,.50,.065,0x687d87,tag+'_CHAIR_BACK',true,.74);for(const dx of [-.18,.18])for(const dy of [-.15,.15])fixture(x+dx,y+dy,.035,.42,.035,0x52646b,tag+'_CHAIR_LEG',true,.21);};
 const raisedBoard=(x,y,w=1.7,semantic='OFFICE_PLANNING_BOARD')=>{fixture(x,y,w,.92,.045,0xe8ece8,semantic,true,1.72);fixture(x,y,w+.08,.045,.055,0x657a82,semantic+'_TOP_RAIL',true,2.20);fixture(x,y,w+.08,.045,.055,0x657a82,semantic+'_BOTTOM_RAIL',true,1.24);buildingDetailStats.officePlanningBoards++;};
 const printStation=(x,y,semantic='OFFICE_MFP')=>{const base=fixture(x,y,.60,.76,.55,0x778a90,semantic,false);if(!base)return;fixture(x,y-.02,.56,.22,.50,0xdce2df,semantic+'_SCANNER',true,.87);fixture(x,y+.17,.44,.08,.17,0x24343c,semantic+'_CONTROL',true,.93);fixture(x,y-.30,.38,.035,.25,0xc9d2d0,semantic+'_OUTPUT_TRAY',true,.64);buildingDetailStats.officePrintStations++;};
 const qcBench=(x,y,semantic='QC_INSPECTION')=>{const top=fixture(x,y,1.75,.08,.68,0xc8d1cf,semantic+'_BENCH',false,.82);if(!top)return;for(const dx of [-.72,.72])fixture(x+dx,y,.055,.77,.055,0x667a80,semantic+'_LEG',true,.39);fixture(x,y+.18,.86,.52,.46,0xe7ece9,semantic+'_LIGHT_BOOTH',true,1.12);fixture(x,y+.405,.70,.33,.025,0xf3f1dd,semantic+'_VIEWING_FIELD',true,1.12);for(const dx of [-.55,0,.55])fixture(x+dx,y-.21,.34,.035,.24,0xb8cbd0,semantic+'_SAMPLE_TRAY',true,.88);buildingDetailStats.qcInspectionFixtures++;};
 const spareRackBay=(x,y)=>{
  const reserve=fixture(x,y,.96,.06,.60,0x657a82,'SPAREPART_RACK_FOOTPRINT',false,.03);if(!reserve)return;
  for(const dx of [-.43,.43]){fixture(x+dx,y,.065,2.25,.065,0x4f6874,'SPAREPART_RACK_UPRIGHT',true,1.125);fixture(x+dx,y-.34,.18,.38,.18,0xe0b436,'SPAREPART_RACK_GUARD',true,.19);buildingDetailStats.sparepartRackGuards++;}
  for(const level of [.34,.82,1.30,1.78,2.16]){fixture(x,y,.88,.055,.56,0xa7b4b2,'SPAREPART_RACK_SHELF',true,level);if(level<2.1)for(const dx of [-.25,.25]){const heavy=level<.9;fixture(x+dx,y,.36,heavy?.28:.21,.43,heavy?0x758b93:0x8fa3a7,heavy?'SPAREPART_BIN_HEAVY_LOW_LEVEL':'SPAREPART_BIN',true,level+(heavy?.17:.13));buildingDetailStats.sparepartBins++;}}
  buildingDetailStats.sparepartRackBays++;
 };
 const floorMark=(x,y,w,d,semantic)=>{const o=fixture(x,y,w,.018,d,0xd6ad2f,semantic,true,.010);if(o)buildingDetailStats.warehouseAisleMarkings++;return o;};
 const officePanelLight=(x,y,tag)=>{
  const m=new T.Mesh(boxGeo,lightMaterial);m.position.set(x,2.885,-y);m.scale.set(.56,.026,.56);m.userData={semantic:tag+'_LED_PANEL',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V145'};b.add(m);buildingDetailStats.officeLedPanels++;return m;
 };
 const officeCeilingSystem=(x,y,tag)=>{
  // Compact ceiling island follows the source room label only; exact room boundary and ceiling module require survey/photo evidence.
  for(const dx of [-.62,0,.62])for(const dy of [-.62,0,.62]){fixture(x+dx,y+dy,.58,.028,.58,0xe8e9e3,tag+'_CEILING_TILE',true,2.92);buildingDetailStats.officeCeilingTiles++;}
  officePanelLight(x-.31,y,tag);officePanelLight(x+.31,y,tag);
  fixture(x-.62,y+.62,.48,.035,.48,0xd5dcdb,tag+'_SUPPLY_DIFFUSER',true,2.90);for(const s of [-.14,0,.14])fixture(x-.62+s,y+.62,.018,.018,.40,0x7d8d91,tag+'_DIFFUSER_SLOT',true,2.875);
  fixture(x+.62,y+.62,.48,.035,.48,0x66787f,tag+'_RETURN_GRILLE',true,2.90);for(const s of [-.16,-.08,0,.08,.16])fixture(x+.62+s,y+.62,.012,.018,.40,0x36464d,tag+'_RETURN_GRILLE_SLOT',true,2.875);
  const sensor=new T.Mesh(new T.CylinderGeometry(.075,.075,.025,18),material(0xf0f1ed));sensor.position.set(x,y-.62?2.895:2.895,-(y-.62));sensor.rotation.x=Math.PI/2;sensor.userData={semantic:tag+'_CEILING_SENSOR_REFERENCE',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V145'};b.add(sensor);
  buildingDetailStats.officeSupplyDiffusers++;buildingDetailStats.officeReturnGrilles++;buildingDetailStats.officeCeilingSensors++;
 };
 const deskPowerData=(x,y,tag)=>{
  fixture(x+.10,y-.29,.30,.045,.08,0x5f6f75,tag+'_DESK_POWER_DATA_MODULE',true,.805);
  fixture(x+.04,y-.315,.045,.018,.012,0xe8ece9,tag+'_POWER_OUTLET_FACE',true,.83);
  fixture(x+.16,y-.315,.045,.018,.012,0x47799a,tag+'_DATA_OUTLET_FACE',true,.83);
  buildingDetailStats.officePowerDataPoints++;
 };
 const fireExtinguisher=(x,y,tag='FACILITY')=>{
  const g=new T.Group();g.position.set(x,0,-y);b.add(g);g.userData={semantic:tag+'_FIRE_EXTINGUISHER_REFERENCE',accuracy:'SAFETY_EQUIPMENT_REFERENCE_NOT_AS_BUILT_OR_COMPLIANCE_ASSERTION',researchVersion:'V145'};
  const shell=new T.Mesh(new T.CylinderGeometry(.105,.12,.52,16),material(0xc23b35));shell.position.y=.72;g.add(shell);
  const head=new T.Mesh(new T.CylinderGeometry(.06,.06,.10,12),material(0x303b40));head.position.y=1.03;g.add(head);
  line(g,new T.Vector3(.08,.98,0),new T.Vector3(.19,.78,.02),.018,0x272f33);box(g,0,.75,.085,.31,.72,.035,0xf0ece3).userData={semantic:tag+'_EXTINGUISHER_IDENTIFICATION_PLATE'};
  buildingDetailStats.fireExtinguisherReferences++;
 };
 const emergencyLuminaire=(x,y,tag='FACILITY')=>{
  const m=new T.Mesh(boxGeo,lightMaterial);m.position.set(x,2.55,-y);m.scale.set(.48,.10,.16);m.userData={semantic:tag+'_EMERGENCY_LUMINAIRE_REFERENCE',accuracy:'EGRESS_LIGHTING_REFERENCE_NOT_AS_BUILT_OR_COMPLIANCE_ASSERTION',researchVersion:'V145'};b.add(m);buildingDetailStats.emergencyLuminaireReferences++;
 };
 const toiletMicro=(x,y)=>{
  fixture(x,y-1.24,1.05,.68,.035,0xaec5c8,'TOILET_MIRROR_REFERENCE',true,1.46);
  fixture(x+.46,y-1.06,.12,.24,.11,0xe6e7e2,'TOILET_SOAP_DISPENSER_REFERENCE',true,1.25);
  fixture(x-.46,y-1.06,.16,.24,.11,0xd7dcda,'TOILET_TISSUE_DISPENSER_REFERENCE',true,1.25);
  const drain=new T.Mesh(new T.CylinderGeometry(.09,.09,.012,16),material(0x5d6c71));drain.position.set(x+.72,.014,-(y+.66));drain.userData={semantic:'TOILET_FLOOR_DRAIN_REFERENCE',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V145'};b.add(drain);
  fixture(x,y+.84,.46,.035,.22,0x60737a,'TOILET_EXHAUST_GRILLE_REFERENCE',true,2.72);
  buildingDetailStats.toiletMirrors++;buildingDetailStats.toiletDispensers+=2;buildingDetailStats.toiletFloorDrains++;buildingDetailStats.toiletExhaustGrilles++;
 };
 const pantryMicro=(x,y)=>{
  const base=fixture(x,y,1.65,.82,.58,0x798b8e,'PANTRY_BASE_CABINET');if(!base)return;
  fixture(x,y-0.02,1.72,.07,.62,0xb8bdb9,'PANTRY_COUNTERTOP',true,.855);
  fixture(x-.35,y-.02,.50,.04,.34,0xdce2df,'PANTRY_SINK_REFERENCE',true,.895);
  line(b,new T.Vector3(x-.35,.91,-y),new T.Vector3(x-.35,1.14,-y),.018,0x758589);line(b,new T.Vector3(x-.35,1.14,-y),new T.Vector3(x-.18,1.14,-y),.018,0x758589);
  fixture(x+.55,y,.36,1.08,.42,0xe5e6e1,'PANTRY_WATER_DISPENSER_REFERENCE',true,.54);
  fixture(x,y+.32,1.5,.62,.30,0x87999b,'PANTRY_UPPER_CABINET_REFERENCE',true,1.72);
  buildingDetailStats.pantryFixtures+=5;
 };
 const lockerBank=(x,y)=>{
  const base=fixture(x,y,1.62,1.95,.42,0x72848a,'LOCKER_BANK_REFERENCE');if(!base)return;
  for(let i=0;i<4;i++){const lx=x-.60+i*.40;fixture(lx,y-.218,.36,1.78,.025,i%2?0x7e9095:0x87999e,'LOCKER_DOOR_REFERENCE',true,.98);fixture(lx+.11,y-.235,.025,.15,.012,0x3e4d53,'LOCKER_HANDLE_REFERENCE',true,1.05);for(const sy of [1.48,1.57])fixture(lx,y-.235,.20,.012,.012,0x4f6168,'LOCKER_VENT_REFERENCE',true,sy);buildingDetailStats.lockerDoors++;}
 };
 const palletJack=(x,y,rotation=0,tag='WAREHOUSE')=>{
  if(intersectsMachine([x-.65,y-.75],[x+.65,y+.75]))return false;
  const g=new T.Group();g.position.set(x,0,-y);g.rotation.y=rotation;b.add(g);g.userData={semantic:tag+'_PALLET_JACK_REFERENCE',accuracy:'MOVABLE_MATERIAL_HANDLING_REFERENCE_NOT_AS_BUILT_INVENTORY',researchVersion:'V145'};
  for(const sx of [-.24,.24]){box(g,sx,.075,-.26,.13,.08,1.05,0xd39b2d);const wheel=new T.Mesh(new T.CylinderGeometry(.055,.055,.09,14),material(0x343d41));wheel.rotation.z=Math.PI/2;wheel.position.set(sx,.075,.22);g.add(wheel);}
  box(g,0,.18,.30,.56,.22,.34,0xd39b2d);line(g,new T.Vector3(0,.24,.38),new T.Vector3(0,1.18,.68),.035,0x343d41);line(g,new T.Vector3(-.18,1.18,.68),new T.Vector3(.18,1.18,.68),.03,0x343d41);
  buildingDetailStats.palletJackReferences++;return true;
 };

 for(const l of data.labels){if(!roomWords.test(l.text))continue;if(l.x>34.7&&l.x<63.1&&l.y>56.9&&l.y<65.1)continue;
  label(l.text,l.x,3.45,-l.y,Math.min(8,3+l.text.length*.13),'#526772');
  if(/Adm Room|PPIC|R\.PDS|QC Sample|R\.Sample|R\.INCOMING/i.test(l.text))officeCeilingSystem(l.x,l.y,'OFFICE');
  if(/Adm Room/i.test(l.text)){
   officeWorkstation(l.x,l.y,'ADMIN');for(const dx of [-.48,.48])guestChair(l.x+dx,l.y-.88,'ADMIN_VISITOR');
   if(fixture(l.x,l.y+1.12,1.65,.74,.38,0x7b8e93,'ADMIN_CREDENZA'))buildingDetailStats.officeStorageUnits++;
   raisedBoard(l.x,l.y+1.38,1.55,'ADMIN_NOTICE_BOARD');emergencyLuminaire(l.x,l.y-1.18,'ADMIN');
  }else if(/PPIC/i.test(l.text)){
   officeWorkstation(l.x-.78,l.y,'PPIC_A');officeWorkstation(l.x+.78,l.y,'PPIC_B');raisedBoard(l.x,l.y+1.35,2.25,'PPIC_PRODUCTION_PLANNING_BOARD');printStation(l.x+1.55,l.y+1.0,'PPIC_MFP');emergencyLuminaire(l.x,l.y-1.22,'PPIC');
  }else if(/R\.PDS/i.test(l.text)){
   officeWorkstation(l.x-.35,l.y,'PDS');if(fixture(l.x+1.0,l.y+.55,1.00,.86,.62,0x788b91,'PDS_FLAT_FILE_CABINET'))buildingDetailStats.officeStorageUnits++;raisedBoard(l.x,l.y+1.35,1.8,'PDS_DRAWING_REVIEW_BOARD');
  }else if(/QC Sample|R\.Sample|R\.INCOMING/i.test(l.text)){
   officeWorkstation(l.x-.70,l.y,'QC');qcBench(l.x+.65,l.y-1.0,/INCOMING/i.test(l.text)?'INCOMING_INSPECTION':'QC_SAMPLE_INSPECTION');
   if(fixture(l.x+1.05,l.y+.95,.78,1.85,.36,0x73868c,'QC_SAMPLE_STORAGE'))buildingDetailStats.officeStorageUnits++;
  }else if(/Toilet/i.test(l.text)){
   for(const dx of [-.72,.72]){fixture(l.x+dx,l.y,.08,2.15,1.55,0xd9e2e3,'TOILET_PARTITION');fixture(l.x+dx*.5,l.y+.28,.42,.43,.62,0xf0f3f1,'TOILET_FIXTURE');}fixture(l.x,l.y-1.02,1.2,.82,.46,0xd4dde0,'WASH_BASIN_COUNTER');toiletMicro(l.x,l.y);
  }else if(/Electric room/i.test(l.text)){
   for(let i=-1;i<=1;i++){fixture(l.x+i*.82,l.y+.45,.7,2.05,.36,0x667985,'ELECTRICAL_PANEL');for(let lamp=0;lamp<3;lamp++)fixture(l.x+i*.82-.18+lamp*.18,l.y+.24,.055,.055,.04,lamp===0?0x46b879:lamp===1?0xe0b436:0xc54b4b,'PANEL_INDICATOR',true,.95+lamp*.10);}fixture(l.x,l.y-.72,2.8,.025,1.15,0xd8b532,'ELECTRICAL_CLEARANCE_ZONE',true,.014);fireExtinguisher(l.x+1.72,l.y-.55,'ELECTRICAL_ROOM');
  }else if(/WH Spareparts/i.test(l.text)){
   for(const dx of [-1.12,0,1.12])spareRackBay(l.x+dx,l.y+.15);
   floorMark(l.x,l.y-1.02,3.35,.055,'SPAREPART_PICKING_AISLE_MARKING');fixture(l.x,l.y-1.28,.82,.76,.48,0x6d8189,'SPAREPART_PICKING_TROLLEY');fixture(l.x,l.y-1.28,.70,.05,.42,0xb7c3c0,'SPAREPART_TROLLEY_TOP',true,.79);fireExtinguisher(l.x+1.65,l.y-.92,'SPAREPART_WAREHOUSE');
  }else if(/Workshop/i.test(l.text)){
   fixture(l.x,l.y,2.25,.88,.82,0x8a7359,'WORKBENCH');fixture(l.x,l.y+.62,2.3,.92,.12,0x617681,'TOOL_BOARD');for(const dx of [-.78,0,.78])fixture(l.x+dx,l.y+.55,.18,.18,.09,0xe0b436,'WORKSHOP_TOOL',true,.95);fixture(l.x+1.55,l.y,0.72,1.9,.46,0x71858d,'WORKSHOP_CABINET');fireExtinguisher(l.x-1.55,l.y-.70,'WORKSHOP');
  }else if(/Pantry|Kitchen|Refreshment/i.test(l.text)){
   pantryMicro(l.x,l.y);officeCeilingSystem(l.x,l.y,'PANTRY');fireExtinguisher(l.x+1.25,l.y-.85,'PANTRY');
  }else if(/Locker|Loker|Changing|Change Room/i.test(l.text)){
   lockerBank(l.x,l.y);emergencyLuminaire(l.x,l.y-1.0,'LOCKER_ROOM');
  }else if(/Mushola/i.test(l.text)){
   for(let i=-2;i<=2;i++)fixture(l.x+i*.52,l.y,.46,.018,2.25,i%2?0x668c7f:0x759c8e,'PRAYER_MAT');fixture(l.x-1.75,l.y+1.05,1.1,1.15,.32,0x8b765c,'SHOE_RACK');
  }else if(/R\.FPS/i.test(l.text)){
   fixture(l.x,l.y,2.2,.18,1.35,0x566b73,'FIRE_PUMP_SKID',true);for(const dx of [-.62,.62]){const pump=new T.Mesh(new T.CylinderGeometry(.25,.25,.85,16),material(0xb94343));pump.rotation.z=Math.PI/2;pump.position.set(l.x+dx,.55,-l.y);pump.userData={semantic:'FIRE_PUMP_FUNCTIONAL_REFERENCE',accuracy:'ROOM_FUNCTION_VISUALIZATION'};b.add(pump);}line(b,new T.Vector3(l.x-1.2,.78,-l.y),new T.Vector3(l.x+1.2,.78,-l.y),.06,0xb94343);
  }else if(/R\.BROKE/i.test(l.text)){
   for(const dx of [-.75,.75])fixture(l.x+dx,l.y,1.15,.75,1.1,0xb08d60,'BROKE_COLLECTION_BIN');
  }
 }

 // RMS: material storage reads as a packaging warehouse rather than generic barrels.
 // Exact inventory, rack type and aisle engineering still require field photos / warehouse drawings.
 const rms=new T.Group();rms.name='RMS_PACKAGING_STORAGE_REFERENCE';b.add(rms);rms.userData={semantic:'RMS_PACKAGING_STORAGE_REFERENCE',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V145'};
 const rmsPallet=(x,y,levels=3)=>{
  const g=new T.Group();g.position.set(x,0,-y);rms.add(g);g.userData={semantic:'WRAPPED_PAPERBOARD_PALLET_REFERENCE',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V145'};
  for(const z of [-.68,0,.68])detail(box(g,0,.055,z,1.65,.11,.13,0x967953),'RMS_PALLET_SLAT_REFERENCE');
  for(let level=0;level<levels;level++){const cy=.20+level*.34;box(g,0,cy,0,1.55,.28,1.05,level%2?0xe3e0d4:0xebe8dc);for(const sx of [-.76,.76])box(g,sx,cy,0,.025,.30,1.08,0x97a8a5);}
  const wrap=box(g,0,.22+(levels-1)*.17,0,1.62,.34*levels+.10,1.11,0xeaf0ed,0,.20);wrap.userData={semantic:'RMS_PROTECTIVE_WRAP_REFERENCE',accuracy:'PACKAGING_MATERIAL_STORAGE_REFERENCE',researchVersion:'V145'};const ident=box(g,.62,.46+(levels-2)*.14,-.565,.26,.16,.018,0xf3f0e7);ident.userData={semantic:'RMS_PALLET_IDENTIFICATION_LABEL_REFERENCE',accuracy:'VISUAL_LABEL_REFERENCE_NO_INVENTORY_DATA'};
  for(const sx of [-.42,.42])detail(box(g,sx,.22+(levels-1)*.17,0,.035,.34*levels+.12,1.13,0x536f83),'RMS_PALLET_STRAP_REFERENCE');
  buildingDetailStats.warehousePalletLoads++;
 };
 const rmsReel=(x,y)=>{
  const g=new T.Group();g.position.set(x,0,-y);rms.add(g);g.userData={semantic:'RMS_REEL_CRADLE_REFERENCE',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V145'};
  box(g,0,.07,0,1.85,.14,1.28,0x8d7656);for(const sx of [-.72,.72])for(const z of [-.48,.48]){const chock=box(g,sx,.22,z,.18,.30,.24,0x6d7777);chock.rotation.z=sx<0?-.28:.28;}
  const roll=new T.Mesh(new T.CylinderGeometry(.48,.48,1.48,24),material(0xd9cfba));roll.rotation.z=Math.PI/2;roll.position.set(0,.66,0);roll.userData={semantic:'RMS_WRAPPED_REEL_REFERENCE',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V145'};g.add(roll);
  const core=new T.Mesh(new T.CylinderGeometry(.11,.11,1.51,18),material(0x806c55));core.rotation.z=Math.PI/2;core.position.set(0,.66,0);core.userData.semantic='RMS_REEL_CORE_REFERENCE';g.add(core);buildingDetailStats.warehouseReelCradles++;
 };
 for(const x of [84.5,88.5,92.5]){for(const y of [74.0,78.0])rmsPallet(x,y,(Math.round(x+y)%2)+2);for(const y of [82.2,86.0])rmsReel(x,y);}
 for(const x of [82.7,94.3]){const aisle=box(b,x,.012,-80.0,.055,.024,15.4,0xd6ad2f);detail(aisle,'RMS_AISLE_BOUNDARY_REFERENCE');buildingDetailStats.warehouseAisleMarkings++;}
 for(const y of [72.6,87.4]){const cross=box(b,88.5,.012,-y,11.7,.024,.055,0xd6ad2f);detail(cross,'RMS_STAGING_BOUNDARY_REFERENCE');buildingDetailStats.warehouseAisleMarkings++;}
 for(const [x,y] of [[82.7,72.6],[94.3,72.6],[82.7,87.4],[94.3,87.4]]){const guard=box(b,x,.46,-y,.20,.92,.20,0xe0b436);detail(guard,'RMS_RACK_OR_ZONE_GUARD_REFERENCE');buildingDetailStats.warehouseSafetyElements++;}
 const envPanel=box(b,93.5,1.72,-71.8,.62,.42,.08,0x506771);detail(envPanel,'RMS_TEMPERATURE_HUMIDITY_MONITOR_REFERENCE');envPanel.userData.industryReference={paperboardRH:[50,55],paperboardTemperatureC:[20,23],source:'STORA_ENSO_PAPERBOARD_GUIDE',plantSetpoint:false};buildingDetailStats.warehouseSafetyElements++;
 const pedLane=fixture(81.45,80.0,1.05,.016,14.0,0x4f8d72,'RMS_PEDESTRIAN_WALKWAY_REFERENCE',false,.012);
 if(pedLane){
  for(const x of [80.90,82.00])fixture(x,80.0,.045,.024,14.0,0xe0b436,'RMS_PEDESTRIAN_BOUNDARY_LINE_REFERENCE',true,.016);
  for(let yy=75.0;yy<=85.0;yy+=5){for(let i=0;i<5;i++)fixture(81.45,yy-.44+i*.22,.88,.025,.10,i%2?0xe9ece7:0xe0b436,'RMS_PEDESTRIAN_CROSSING_REFERENCE',true,.018);buildingDetailStats.warehouseCrossings++;}
  for(const yy of [73.5,86.5]){for(const h of [.52,1.02])detail(line(b,new T.Vector3(82.20,h,-(yy-1.0)),new T.Vector3(82.20,h,-(yy+1.0)),.025,0xe0b436),'RMS_PEDESTRIAN_BARRIER_RAIL_REFERENCE');for(const z of [yy-1.0,yy+1.0])detail(line(b,new T.Vector3(82.20,.10,-z),new T.Vector3(82.20,1.05,-z),.028,0x697b80),'RMS_PEDESTRIAN_BARRIER_POST_REFERENCE');buildingDetailStats.warehouseBarrierElements+=4;}
  buildingDetailStats.warehousePedestrianLanes++;
 }
 const mirrorGroup=new T.Group();mirrorGroup.position.set(82.35,2.12,-80.0);b.add(mirrorGroup);mirrorGroup.userData={semantic:'RMS_CONVEX_MIRROR_REFERENCE',accuracy:'BLIND_INTERSECTION_SAFETY_REFERENCE_NOT_AS_BUILT',researchVersion:'V145'};
 const mirrorMat=new T.MeshStandardMaterial({color:0xbcc9cc,metalness:.55,roughness:.16,side:T.DoubleSide});const mirrorDisc=new T.Mesh(new T.CircleGeometry(.28,24),mirrorMat);mirrorDisc.rotation.y=-Math.PI/2;mirrorGroup.add(mirrorDisc);const rim=new T.Mesh(new T.TorusGeometry(.30,.025,8,24),material(0xe0b436));rim.rotation.y=Math.PI/2;mirrorGroup.add(rim);detail(line(mirrorGroup,new T.Vector3(.05,0,0),new T.Vector3(.45,-.18,0),.018,0x617279),'RMS_CONVEX_MIRROR_BRACKET_REFERENCE');buildingDetailStats.warehouseConvexMirrors++;
 const trafficCue=box(b,82.25,1.20,-73.0,.06,2.4,.06,0x617279);detail(trafficCue,'RMS_TRAFFIC_SIGN_POST_REFERENCE');const trafficPlate=box(b,82.25,2.14,-73.0,.58,.42,.045,0xe0b436);detail(trafficPlate,'RMS_PEDESTRIAN_TRAFFIC_CUE_REFERENCE');buildingDetailStats.warehouseTrafficCues++;
 for(const [x,y,rot] of [[83.05,74.1,0],[83.05,86.0,Math.PI]])palletJack(x,y,rot,'RMS');
 for(const [x,y,rot] of [[83.0,75.8,-.05],[83.1,83.8,.04]]){for(let i=0;i<3;i++){const scuff=box(b,x+i*.13,.009,-(y+i*.52),.055,.008,1.0,0x4c5354,rot,.16);scuff.userData={semantic:'WAREHOUSE_FORK_WHEEL_SCuff_REFERENCE',accuracy:'SUBTLE_FLOOR_WEAR_REFERENCE_NOT_AS_BUILT',researchVersion:'V145'};buildingDetailStats.warehouseWearMarks++;}}
 label('RMS',88.5,3.8,-81,5);

 // Finished-goods areas are populated only when an FG label exists in the source layout.
 // The stacks are packaging-dispatch references, not an inventory snapshot.
 const finishedGoodsLoad=(x,y,tag)=>{
  const pallet=fixture(x,y,1.18,.12,.96,0x967953,tag+'_PALLET',false,.06);if(!pallet)return false;
  for(let level=0;level<3;level++)for(const dx of [-.27,.27]){
   fixture(x+dx,y,.50,.25,.84,level%2?0xc8b18e:0xd5bf9c,tag+'_CARTON_CASE',true,.23+level*.26);
  }
  fixture(x,y,.045,.82,.98,0x607b8a,tag+'_VERTICAL_STRAP',true,.48);
  fixture(x,y,1.20,.035,.98,0x607b8a,tag+'_TOP_STRAP',true,.88);
  const fgWrap=box(b,x,.50,-y,1.24,.82,1.02,0xeaf0ed,0,.16);fgWrap.userData={semantic:tag+'_STRETCH_WRAP_REFERENCE',accuracy:'PACKAGING_DISPATCH_VISUAL_REFERENCE_NOT_AS_BUILT_INVENTORY',researchVersion:'V145'};
  const fgLabel=box(b,x+.44,.53,-y-.52,.24,.15,.018,0xf3f0e7);fgLabel.userData={semantic:tag+'_PALLET_LABEL_REFERENCE',accuracy:'VISUAL_LABEL_REFERENCE_NO_TRACEABILITY_DATA',researchVersion:'V145'};
  buildingDetailStats.finishedGoodsPalletLoads++;return true;
 };
 const fgLabels=data.labels.filter(l=>/\bFG\s*[-.]?\s*[123]\b|FINISH(?:ED)?\s*GOODS/i.test(l.text));
 for(const l of fgLabels){
  label(l.text,l.x,3.35,-l.y,Math.min(6.5,3.2+l.text.length*.12),'#526772');
  let placed=0;for(const [dx,dy] of [[-.72,-.58],[.72,-.58],[-.72,.58],[.72,.58]])if(finishedGoodsLoad(l.x+dx,l.y+dy,'FG_DISPATCH'))placed++;
  if(placed){
   floorMark(l.x,l.y-1.30,3.05,.055,'FG_STAGING_AISLE_MARKING');
   floorMark(l.x,l.y+1.30,3.05,.055,'FG_STAGING_AISLE_MARKING');
   floorMark(l.x-1.55,l.y,.055,2.65,'FG_STAGING_SIDE_MARKING');
   floorMark(l.x+1.55,l.y,.055,2.65,'FG_STAGING_SIDE_MARKING');
   palletJack(l.x+2.05,l.y,Math.PI/2,'FG_DISPATCH');buildingDetailStats.finishedGoodsStagingZones++;
  }
 }
 // IPAL is an outdoor process yard: concrete slab + open steel frame + roof, with no enclosing walls.
 const ipal=new T.Group();ipal.name='IPAL_OPEN_AIR_WATER_TREATMENT';b.add(ipal);
 box(ipal,46.4,.08,-110.9,26.4,.16,14.1,0xaeb7b5).userData={semantic:'IPAL_CONCRETE_SLAB'};
 const ipalEquipment=[];
 const registerIpal=(o,semantic,bounds)=>{o.userData={...o.userData,semantic,accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};ipalEquipment.push({semantic,...bounds});return o;};
 for(const x of [33.5,38.7,43.9,49.1,54.3,59.3])for(const y of [104,117.8]){const post=box(ipal,x,2.25,-y,.18,4.5,.18,0x526b75);post.userData={semantic:'IPAL_OPEN_FRAME_COLUMN'};box(ipal,x,.12,-y,.48,.24,.48,0x7c898a);}
 const ridge=5.65,eave=4.5,half=7.15,slope=Math.atan2(ridge-eave,half),roofLen=Math.hypot(half,ridge-eave);
 for(const sign of [-1,1]){const roof=box(layers.roof,46.4,(ridge+eave)/2,-110.9-sign*half/2,26.7,.12,roofLen,0x78929a);roof.rotation.x=sign*slope;roof.userData={semantic:'IPAL_CANOPY_ROOF',openSides:true,eavesHeight:eave,ridgeHeight:ridge};}
 for(const x of [33.5,38.7,43.9,49.1,54.3,59.3]){line(ipal,new T.Vector3(x,4.5,-104),new T.Vector3(x,ridge,-110.9),.055,0x465f69);line(ipal,new T.Vector3(x,ridge,-110.9),new T.Vector3(x,4.5,-117.8),.055,0x465f69);}
 // Open-frame wall-plane X bracing: structural reference only, sides remain fully open.
 const ipalXs=[33.5,38.7,43.9,49.1,54.3,59.3];for(let i=1;i<ipalXs.length;i+=2){const xa=ipalXs[i-1],xb=ipalXs[i];for(const z of [-104,-117.8]){detail(line(ipal,new T.Vector3(xa,.55,z),new T.Vector3(xb,4.05,z),.022,0x60757d),'IPAL_X_BRACE_REFERENCE');detail(line(ipal,new T.Vector3(xb,.55,z),new T.Vector3(xa,4.05,z),.022,0x60757d),'IPAL_X_BRACE_REFERENCE');buildingDetailStats.ipalFrameBraces+=2;}}
 const basin=(x,y,w,d,semantic,waterColor)=>{const g=new T.Group();g.position.set(x,0,-y);ipal.add(g);box(g,0,.06,0,w,.12,d,0x899695);box(g,0,.28,-d/2,w,.55,.16,0x9ba6a5);box(g,0,.28,d/2,w,.55,.16,0x9ba6a5);box(g,-w/2,.28,0,.16,.55,d,0x9ba6a5);box(g,w/2,.28,0,.16,.55,d,0x9ba6a5);const water=box(g,0,.2,0,w-.28,.035,d-.28,waterColor,0,.72);registerIpal(g,semantic,{minX:x-w/2,maxX:x+w/2,minY:y-d/2,maxY:y+d/2});water.userData.semantic='IPAL_WATER_SURFACE';for(const xx of [-w/2,w/2])for(let zz=-d/2;zz<=d/2;zz+=1.25)line(g,new T.Vector3(xx,.58,zz),new T.Vector3(xx,1.25,zz),.025,0xc8d3d2);return g;};
 basin(36.7,107,5.6,4.4,'IPAL_EQUALIZATION_BASIN',0x527d83);basin(36.7,113.4,5.6,5,'IPAL_AERATION_BASIN',0x4c8992);
 for(const x of [35.2,36.7,38.2]){const diffuser=new T.Mesh(new T.TorusGeometry(.32,.035,7,14),material(0xb7c8ca));diffuser.rotation.x=Math.PI/2;diffuser.position.set(x,.28,-113.4);diffuser.userData={semantic:'IPAL_AERATION_DIFFUSER',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};ipal.add(diffuser);}
 const pipeRoute=(points,color=0x4c7881,r=.045,semantic='IPAL_PROCESS_PIPE')=>{for(let i=1;i<points.length;i++){const p=line(ipal,new T.Vector3(...points[i-1]),new T.Vector3(...points[i]),r,color);p.userData={semantic,accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};}};
 const valve=(x,y,z,color=0xc88f37)=>{const g=new T.Group();g.position.set(x,y,z);ipal.add(g);const wheel=new T.Mesh(new T.TorusGeometry(.16,.032,8,18),material(color));wheel.rotation.y=Math.PI/2;wheel.userData={semantic:'IPAL_ISOLATION_VALVE',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};g.add(wheel);line(g,new T.Vector3(0,-.2,0),new T.Vector3(0,.2,0),.025,0x66777b);return g;};
 const tank=(x,y,r,h,color,semantic)=>{const g=new T.Group();g.position.set(x,0,-y);ipal.add(g);const shell=new T.Mesh(new T.CylinderGeometry(r,r,h,28,1,true),material(color));shell.position.y=h/2;g.add(shell);const cap=new T.Mesh(new T.CylinderGeometry(r*.95,r*.95,.08,28),material(0x90a19e));cap.position.y=h+.04;g.add(cap);registerIpal(g,semantic,{minX:x-r,maxX:x+r,minY:y-r,maxY:y+r});return g;};
 const clarifier=tank(45.4,109,2.35,1.45,0x889c99,'IPAL_CLARIFIER');const bridge=box(clarifier,0,1.62,0,4.7,.12,.42,0x607680);bridge.userData.semantic='IPAL_CLARIFIER_BRIDGE';line(clarifier,new T.Vector3(0,1.5,0),new T.Vector3(0,.35,0),.06,0x50646c);
 for(const radius of [2.18,2.48]){const rail=new T.Mesh(new T.TorusGeometry(radius,.025,8,40),material(0xc8d3d2));rail.rotation.x=Math.PI/2;rail.position.y=1.82;rail.userData={semantic:'IPAL_CLARIFIER_HANDRAIL',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};clarifier.add(rail);}for(let a=0;a<Math.PI*2;a+=Math.PI/6)line(clarifier,new T.Vector3(Math.cos(a)*2.32,1.45,Math.sin(a)*2.32),new T.Vector3(Math.cos(a)*2.32,1.85,Math.sin(a)*2.32),.018,0xc8d3d2);
 tank(45.4,114.6,1.55,2.15,0x768f8b,'IPAL_SLUDGE_HOLDING_TANK');
 for(const [x,y,color,semantic] of [[51.1,106.2,0xd5c35e,'IPAL_CHEMICAL_TANK'],[53.1,106.2,0xe1d8a2,'IPAL_CHEMICAL_TANK']])tank(x,y,.72,1.65,color,semantic);
 const dosing=box(ipal,55.1,.12,-106.2,1.35,.24,1.05,0x62747a);dosing.userData={semantic:'IPAL_CHEMICAL_DOSING_SKID_REFERENCE',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};for(const x of [54.78,55.38]){const dp=new T.Mesh(new T.CylinderGeometry(.08,.08,.24,14),material(0x4c6e77));dp.position.set(x,.42,-106.2);dp.userData={semantic:'IPAL_DOSING_PUMP_REFERENCE',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};ipal.add(dp);}for(const x of [51.1,53.1])pipeRoute([[x,.55,-106.2],[54.45,.55,-106.2]],0x8d8b6c,.018,'IPAL_CHEMICAL_DOSING_LINE_REFERENCE');
 const bund=box(ipal,52.1,.14,-106.2,4.15,.28,2.65,0x9ba6a5);bund.userData={semantic:'IPAL_CHEMICAL_CONTAINMENT_BUND',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};for(const [x,z,w,d] of [[52.1,-104.9,4.15,.16],[52.1,-107.5,4.15,.16],[50.05,-106.2,.16,2.65],[54.15,-106.2,.16,2.65]]){const curb=box(ipal,x,.32,z,w,.38,d,0xb4bcba);curb.userData={semantic:'IPAL_BUND_CURB'};}
 for(const x of [51.2,53.4]){const vessel=tank(x,111,.62,2.25,0x6d8790,'IPAL_FILTER_VESSEL');line(ipal,new T.Vector3(x,2.25,-111),new T.Vector3(x,2.8,-111),.045,0x526b75);vessel.userData.pressureFilterReference=true;}
 const skid=box(ipal,56.7,.16,-114.2,3.7,.32,2.2,0x586b72);registerIpal(skid,'IPAL_PUMP_SKID',{minX:54.85,maxX:58.55,minY:113.1,maxY:115.3});for(const x of [55.8,57.5]){const pump=new T.Mesh(new T.CylinderGeometry(.25,.25,.72,16),material(0x3f7180));pump.rotation.z=Math.PI/2;pump.position.set(x,.62,-114.2);pump.userData={semantic:'IPAL_TRANSFER_PUMP',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};ipal.add(pump);const motor=new T.Mesh(new T.CylinderGeometry(.20,.20,.48,16),material(0x596b70));motor.rotation.z=Math.PI/2;motor.position.set(x-.52,.62,-114.2);motor.userData={semantic:'IPAL_PUMP_MOTOR_REFERENCE',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};ipal.add(motor);detail(line(ipal,new T.Vector3(x-.26,.62,-114.2),new T.Vector3(x-.34,.62,-114.2),.045,0x3f4f55),'IPAL_PUMP_COUPLING_REFERENCE');}
 const blowerBase=box(ipal,41.15,.12,-114.35,1.55,.24,1.25,0x65767b);registerIpal(blowerBase,'IPAL_BLOWER_SKID',{minX:40.375,maxX:41.925,minY:113.725,maxY:114.975});for(const x of [40.75,41.55]){const blower=new T.Mesh(new T.CylinderGeometry(.25,.25,.58,16),material(0x5b7f89));blower.rotation.z=Math.PI/2;blower.position.set(x,.53,-114.35);blower.userData={semantic:'IPAL_AERATION_BLOWER',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};ipal.add(blower);const inlet=new T.Mesh(new T.CylinderGeometry(.14,.20,.34,16),material(0x6d7d81));inlet.rotation.z=Math.PI/2;inlet.position.set(x-.42,.53,-114.35);inlet.userData={semantic:'IPAL_BLOWER_INLET_SILENCER_REFERENCE',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};ipal.add(inlet);}
 pipeRoute([[41.15,.72,-114.35],[41.15,.72,-116.25],[38.2,.72,-116.25],[38.2,.42,-114.8]],0x5b8fa0,.04,'IPAL_AIR_HEADER');
 pipeRoute([[39.5,.48,-107],[41.3,.48,-107],[41.3,.65,-109],[43.05,.65,-109]]);pipeRoute([[47.75,.62,-109],[49.3,.62,-109],[49.3,.62,-111],[50.55,.62,-111]]);pipeRoute([[54.05,.62,-111],[56.7,.62,-111],[56.7,.62,-113.1]]);pipeRoute([[45.4,.62,-111.35],[45.4,.62,-113.05]],0x6f6260,.05,'IPAL_SLUDGE_PIPE');
 for(const [x,y,z] of [[41.3,.86,-107],[49.3,.86,-109],[56.7,.86,-111],[45.4,.86,-112.2]])valve(x,y,z);
 const ladder=(x,z,h,rotation=0)=>{const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotation;ipal.add(g);for(const sx of [-.28,.28])line(g,new T.Vector3(sx,.05,0),new T.Vector3(sx,h,0),.025,0xd3d8d3);for(let y=.2;y<h;y+=.28)line(g,new T.Vector3(-.28,y,0),new T.Vector3(.28,y,0),.018,0xd3d8d3);g.userData={semantic:'IPAL_SERVICE_LADDER',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};return g;};
 ladder(47.78,-109,1.65,Math.PI/2);ladder(46.98,-114.6,2.18,Math.PI/2);
 const path=box(ipal,48.2,.11,-114.5,2.1,.22,6.2,0x778486);path.userData={semantic:'IPAL_SERVICE_WALKWAY'};
 for(const sx of [47.18,49.22]){detail(line(ipal,new T.Vector3(sx,.28,-117.45),new T.Vector3(sx,.28,-111.55),.025,0xc6d0cf),'IPAL_WALKWAY_TOE_RAIL_REFERENCE');detail(line(ipal,new T.Vector3(sx,1.05,-117.45),new T.Vector3(sx,1.05,-111.55),.028,0xc6d0cf),'IPAL_WALKWAY_HANDRAIL_REFERENCE');buildingDetailStats.ipalGuardrails+=2;for(let z=-117.35;z<=-111.65;z+=.9){detail(line(ipal,new T.Vector3(sx,.22,z),new T.Vector3(sx,1.08,z),.018,0xc6d0cf),'IPAL_WALKWAY_GUARD_POST_REFERENCE');buildingDetailStats.ipalGuardrails++;}}
 for(const [a,c] of [[[39.5,.72,-110],[43,.72,-110]],[[47.8,.72,-109],[50.1,.72,-109]],[[53.6,.72,-111],[56.7,.72,-113.1]]])line(ipal,new T.Vector3(...a),new T.Vector3(...c),.055,0x4c7881);
 for(const [x,z,w,d] of [[46.4,-103.72,26.4,.24],[46.4,-118.05,26.4,.24],[33.18,-110.9,.24,14.1],[59.62,-110.9,.24,14.1]]){const drain=box(ipal,x,.035,z,w,.07,d,0x53646a);drain.userData={semantic:'IPAL_PERIMETER_DRAIN'};}
 for(let x=34;x<59;x+=1){const grate=box(ipal,x,.08,-118.05,.68,.035,.3,0x394b52);grate.userData={semantic:'IPAL_DRAIN_GRATING'};}
 const panel=box(ipal,57.8,1.02,-106.2,1.3,2.04,.38,0x65777d);panel.userData={semantic:'IPAL_CONTROL_PANEL',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};for(const dx of [-.3,0,.3]){const lamp=new T.Mesh(new T.SphereGeometry(.045,8,6),material(dx<0?0x46b879:dx===0?0xe0b436:0xc54b4b));lamp.position.set(57.8+dx,1.45,-105.99);lamp.userData={semantic:'IPAL_PANEL_INDICATOR'};ipal.add(lamp);}
 const sample=box(ipal,57.75,.48,-109.25,1.05,.96,.62,0x71858a);sample.userData={semantic:'IPAL_SAMPLING_STATION',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};box(ipal,57.75,.93,-109.25,.7,.08,.48,0xd7e1df).userData={semantic:'IPAL_SAMPLE_SINK'};pipeRoute([[57.45,1.12,-109.25],[57.45,1.42,-109.25],[57.75,1.42,-109.25]],0x7a8788,.025,'IPAL_SAMPLE_TAP');
 const flowArrow=(x,y,z,rotation=0)=>{const cone=new T.Mesh(new T.ConeGeometry(.13,.38,10),material(0x3ba5b0));cone.position.set(x,y,z);cone.rotation.z=-Math.PI/2;cone.rotation.y=rotation;cone.userData={semantic:'IPAL_FLOW_DIRECTION',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};ipal.add(cone);};for(const p of [[40.5,.72,-107,0],[48.6,.82,-109,0],[55.3,.82,-111,0]])flowArrow(...p);
 for(const [x,z] of [[33.7,-117.45],[59.05,-117.45],[54.55,-113]]){const bollard=box(ipal,x,.45,z,.18,.9,.18,0xe2b428);bollard.userData={semantic:'IPAL_SAFETY_BOLLARD'};box(ipal,x,.58,z,.19,.12,.19,0x27343a);}
 for(const x of [38.7,49.1,59.3]){const fixture=box(ipal,x,4.18,-110.9,1.15,.09,.38,0xd8e3df);fixture.userData={semantic:'IPAL_WORK_LIGHT'};const glow=box(ipal,x,4.12,-110.9,.92,.025,.28,0xeaf4cf,0,.8);glow.userData={semantic:'IPAL_WORK_LIGHT_LENS'};}
 for(const z of [-103.9,-117.9]){const gutter=line(layers.roof,new T.Vector3(33.1,4.42,z),new T.Vector3(59.7,4.42,z),.055,0x526b75);gutter.userData={semantic:'IPAL_ROOF_GUTTER'};}for(const [x,z] of [[33.5,-103.9],[59.3,-117.9]]){const down=line(ipal,new T.Vector3(x,4.42,z),new T.Vector3(x,.18,z),.045,0x526b75);down.userData={semantic:'IPAL_ROOF_DOWNPIPE'};}
 label('IPAL · WATER TREATMENT',46.4,3.7,-118.9,10);
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
 const utilityRouting=buildUtilityRoutingScaffold(layers,layout.utilityRoutingOverrides||{});
 root.userData={baselineId:layout.baselineId,buildingDetailPass:'V145_MICRO_REALISM_OFFICE_WAREHOUSE_AND_SAFETY',researchVersion:'V145',researchSourceCount:V145_SOURCE_STATS.total,uniqueResearchUrls:V145_SOURCE_STATS.uniqueUrls,buildingDetailStats,utilityRouting,
  architecturalEvidenceBoundary:{
   sourceGrounded:['PLANT_OUTLINE','DXF_WALL_SEGMENTS','DXF_COLUMN_POSITIONS','SOURCE_DOORS_AND_CURTAINS','MACHINE_PLACEMENTS','USER_APPROX_ROOF_4_5_TO_7M'],
   realismReferences:['CONCRETE_CONTROL_JOINT_GRID','SERVICE_CLEARANCE_FLOOR_MARKING','COLUMN_PEDESTALS_BASE_PLATES_ANCHORS_STIFFENERS','WALL_GIRTS_BASE_FLASHING','PANEL_OR_CONTROL_JOINT_RHYTHM','PORTAL_HAUNCH_EAVE_STRUT_APEX_SPLICE','ROOF_PURLIN_ANTI_SAG_FLY_BRACING','LINEAR_LIGHTING','GUTTER_DOWNPIPE_SHOE_SPACING','PERSONNEL_DOOR_HARDWARE','WIDE_DOOR_HARDWARE','PRESS_ROOM_KICK_RAIL_AND_CORNER_PROTECTION','DOCK_LEVELLER_STAIR_CANOPY_PROTECTION','IPAL_SERVICE_HARDWARE','OFFICE_ERGONOMIC_WORKSTATIONS_AND_ADMIN_STORAGE','PPIC_PLANNING_BOARD_AND_PRINT_STATION','QC_INSPECTION_BENCH_AND_SAMPLE_STORAGE','SPAREPART_RACK_BINS_GUARDS_AND_PICKING_AISLE','RMS_WRAPPED_PAPERBOARD_PALLETS_REEL_CRADLES_AISLE_MARKINGS_AND_ENVIRONMENT_MONITOR','SOURCE_LABELLED_FG_CARTON_PALLET_STAGING','OFFICE_SUSPENDED_CEILING_LED_DIFFUSER_RETURN_SENSOR_REFERENCE','TOILET_MIRROR_DISPENSER_DRAIN_EXHAUST_REFERENCE','SOURCE_LABELLED_PANTRY_AND_LOCKER_REFERENCE','WAREHOUSE_PEDESTRIAN_SEPARATION_CROSSING_BARRIER_CONVEX_MIRROR_REFERENCE','MOVABLE_PALLET_JACK_REFERENCE','FIRE_EXTINGUISHER_AND_EMERGENCY_LUMINAIRE_REFERENCE'],
   notAsBuilt:true,utilityMEPActualRoutingAdded:false,reason:'Architectural realism references improve physical readability but do not replace field photos, structural drawings or MEP routing drawings.'
  },
  assumptions:{...data.assumptions,roofEaves:4.5,roofRidge:7,roofHeightEvidence:'USER_APPROXIMATE_MEASUREMENT',machineServiceClearance:MACHINE_SERVICE_CLEARANCE,offsetRoomClearance:1.85,wallTreatment:'SOURCE_SEGMENTS_CLIPPED_TO_SERVICE_ENVELOPE',portalTreatment:'SOURCE_PORTALS_SHIFTED_ONLY_WHEN_CLEARANCE_CONFLICTS',roomContents:'FUNCTION_SPECIFIC_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT_INVENTORY',warehouseReference:'PAPERBOARD_WRAPPED_PALLETS_PLUS_REEL_CRADLES_WITH_CLEAR_AISLES_AND_GUARDS_NOT_AS_BUILT',finishedGoodsReference:'ONLY_SOURCE_LABELLED_FG_AREAS_GET_CARTON_PALLET_STAGING_NOT_INVENTORY_SNAPSHOT',microRealism:'OFFICE_CEILING_HVAC_DIFFUSER_POWER_DATA_TOILET_PANTRY_LOCKER_WAREHOUSE_TRAFFIC_REFERENCES_NOT_AS_BUILT',safetyReference:'VISUAL_REFERENCE_ONLY_NOT_CODE_COMPLIANCE_OR_ACTUAL_EGRESS_SURVEY',architecturalRealism:'V145_MICRO_REALISM_REFERENCE_NOT_AS_BUILT',utilityRoutingBoundary:'COMPRESSED_AIR_AHU_PIPE_AHU_DUCT_REMAIN_TEMPLATE_ONLY_UNTIL_ROUTING_DRAWING',rmsEnvironmentIndustryReference:'STORA_ENSO_50_55_RH_20_23C_NOT_PLANT_SETPOINT',ipalTreatment:'OUTDOOR_OPEN_FRAME_FUNCTIONAL_RECONSTRUCTION'},
  offsetRooms:pressRooms.map(r=>({...r,centerError:Math.hypot((r.minX+r.maxX)/2-r.centerX,(r.minY+r.maxY)/2-r.centerY)})),ipal:{zone:ipalZone,enclosingWalls:0,removedSourceWallSegments:ipalRemovedWalls.length,openSides:true,processFlow:['EQUALIZATION','AERATION','CLARIFICATION','FILTRATION','TRANSFER'],equipment:ipalEquipment,structuralReference:{xBracing:buildingDetailStats.ipalFrameBraces,guardrailElements:buildingDetailStats.ipalGuardrails}},
  nonMachineCollisionAudit:{placedFixtures:fixtureBoxes.length,skippedFixtures:skippedFixtures.length,accidentalFixtureOverlaps:0},omittedCollisionWalls:0,trimmedCollisionWalls:omitted.length,adjustedPortals:adjustedPortals.map(p=>({semantic:p.evidence,x:p.x,y:p.y,sourceX:p.sourceX,sourceY:p.sourceY})),legacyWalls:data.legacyWalls.length};
 return {root,layers,assets,machineBoxes,utilityRouting};
}
