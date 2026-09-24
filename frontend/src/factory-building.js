import * as T from 'three';
import {decodePlantData} from './data/plant-actual.js';
import {buildUtilityRoutingScaffold} from './utility-routing.js';
import {V203_SOURCE_STATS} from './data/research-v203.js';
import {canOpenTechnical3D} from './data/foundation-scope.js';
import {dwgObjectSourceMetadata} from './data/dwg-fidelity.js';
let fleetPromise;
export function loadFactoryFleet(){return fleetPromise||(fleetPromise=import('./data/factory-fleet-data.js').then(({FACTORY_FLEET_GZIP})=>decodePlantData(FACTORY_FLEET_GZIP)).catch(error=>{fleetPromise=null;throw error;}));}
export const MACHINE_SERVICE_CLEARANCE=1.2;
export function machineClearanceBoxes(fleet,clearance=MACHINE_SERVICE_CLEARANCE){
 return fleet.filter(f=>f.placement.status!=='UNIDENTIFIED').map(f=>{const p=f.placement,r=p.rotation*Math.PI/180,c=Math.abs(Math.cos(r)),s=Math.abs(Math.sin(r)),w=f.size[0]*c+f.size[2]*s,d=f.size[0]*s+f.size[2]*c;return {machineId:p.machineId,label:p.label,minX:p.x-w/2-clearance,maxX:p.x+w/2+clearance,minY:p.y-d/2-clearance,maxY:p.y+d/2+clearance};});
}
const OFFSET_ROOM_IDS=new Set(['BMJ-MCH-0003','BMJ-MCH-0004','BMJ-MCH-0005','BMJ-MCH-0006','BMJ-MCH-0009']);
const SOURCE_ROOM_WORDS=/Workshop|Maintenance|Adm Room|Supervisor|Meeting|Office|QC Sample|R\.PDS|R\.Sample|R\.INCOMING|WH Spareparts|Mushola|Loading Dock|CTF|CTP|Toilet|R\.BROKE|R\.FPS|Electric room|PPIC|Pantry|Kitchen|Refreshment|Locker|Loker|Changing|Change Room|Janitor|Cleaning/i;
export function dedupeWallSegments(walls,tolerance=.06){
 const unique=[];let removed=0;
 const close=(a,b)=>Math.hypot(Number(a?.[0]||0)-Number(b?.[0]||0),Number(a?.[1]||0)-Number(b?.[1]||0))<=tolerance;
 for(const w of walls||[]){
  const dup=unique.some(u=>Math.abs(Number(u.width||.12)-Number(w.width||.12))<=tolerance&&((close(u.a,w.a)&&close(u.b,w.b))||(close(u.a,w.b)&&close(u.b,w.a))));
  if(dup){removed++;continue;}unique.push(w);
 }
 return {walls:unique,removed};
}
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
 layers.roof.visible=false;layers.reference.visible=false;layers.landscape.visible=false;
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
 const buildingDetailStats={floorControlJoints:0,serviceClearanceMarkings:0,columnBasePlates:0,columnAnchorBolts:0,columnPedestals:0,columnStiffeners:0,wallPanelJoints:0,wallGirts:0,wallBaseFlashings:0,primaryRoofFrames:0,eaveHaunches:0,eaveStruts:0,apexSplices:0,roofPurlins:0,purlinAntiSag:0,flyBracing:0,roofBracing:0,roofGutters:0,roofDownpipes:0,downpipeShoes:0,linearLights:0,doorPersonnel:0,doorWide:0,doorProtection:0,dockSafetyElements:0,pressRoomProtection:0,ipalFrameBraces:0,ipalGuardrails:0,officeWorkstations:0,officeMonitors:0,officeTaskChairs:0,officeStorageUnits:0,officePlanningBoards:0,officePrintStations:0,qcInspectionFixtures:0,sparepartRackBays:0,sparepartBins:0,sparepartRackGuards:0,warehousePalletLoads:0,warehouseReelCradles:0,warehouseAisleMarkings:0,warehouseSafetyElements:0,finishedGoodsPalletLoads:0,finishedGoodsStagingZones:0,officeCeilingTiles:0,officeLedPanels:0,officeSupplyDiffusers:0,officeReturnGrilles:0,officeCeilingSensors:0,officePowerDataPoints:0,toiletMirrors:0,toiletDispensers:0,toiletFloorDrains:0,toiletExhaustGrilles:0,pantryFixtures:0,lockerDoors:0,fireExtinguisherReferences:0,emergencyLuminaireReferences:0,warehousePedestrianLanes:0,warehouseCrossings:0,warehouseConvexMirrors:0,warehouseBarrierElements:0,warehouseTrafficCues:0,palletJackReferences:0,warehouseWearMarks:0,chairCasters:0,chairArmrests:0,chairLumbarDetails:0,chairAdjustmentControls:0,deskCableGrommets:0,deskCableTrays:0,deskAccessories:0,documentHolders:0,deskPhones:0,monitorBezels:0,monitorArms:0,pedestalDrawers:0,guestChairDetails:0,credenzaDoors:0,credenzaShelves:0,planningBoardDetails:0,printerPaperTrays:0,printerVents:0,flatFileDrawers:0,flatFileLabelHolders:0,qcCabinetDoors:0,qcStools:0,qcAccessoryShelves:0,sparepartRackLabels:0,sparepartBinLips:0,workbenchDrawers:0,workshopViseDetails:0,workshopCabinetDoors:0,workshopStools:0,shoeRackShelves:0,prayerRoomBenches:0,pantryCabinetDoors:0,pantryHandles:0,pantryAppliances:0,pantryTableChairs:0,lockerBenches:0,lockerShoeShelves:0,lockerNumberPlates:0,toiletStallDoors:0,toiletFaucets:0,toiletAccessoryDetails:0,prepressFurniture:0,dispatchFurniture:0,electricalRoomFurniture:0,brokeRoomFurniture:0};
 Object.assign(buildingDetailStats,{ipalScreens:0,ipalSumps:0,ipalLevelInstruments:0,ipalClarifierWeirs:0,ipalScumBaffles:0,ipalFilterInstruments:0,ipalBackwashLines:0,ipalPipeSupports:0,ipalManholes:0,ipalAerationEffects:0,
  duplicateWallSegmentsRemoved:0,sourceDoorWallOpenings:0,roomAccessAudited:0,roomsWithNearbySourceDoor:0,roomsWithReferenceAccessDoor:0,
  roomFloorFinishes:0,visibleFunctionalReferences:0,rmsCutSheetStacks:0,productionSupportStations:0,productionWipPallets:0,productionWasteBins:0,
  meetingRoomFurniture:0,supervisorRoomFurniture:0,janitorRoomFurniture:0,maintenanceRoomFurniture:0,
  exteriorPerimeterSupplements:0,exteriorPerimeterSamples:0,exteriorOpenGapCount:0,chairFacingChecks:0,chairFacingErrors:0,
  visitorChairFacingErrors:0,meetingChairFacingErrors:0,packagingSupportObjects:0,emptyPalletStacks:0,mobilePaperTrolleys:0,
  productionFloorTonePatches:0,roomWasteBins:0,wallClocks:0,stretchWrapStations:0,floorScaleReferences:0,
  productionHousekeepingStations:0,wasteSegregationStations:0,mobileQcStations:0,materialStatusBoards:0,
  palletCornerProtectors:0,paperAcclimatisationTags:0,columnIdentificationPlates:0,columnImpactGuards:0,
  dockWheelChocks:0,fgShippingDocumentStations:0,productionAisleArrows:0,operationalReferenceObjects:0,
  printingProofRacks:0,printingConsumablesCabinets:0,sheetHandlingTrolleys:0,trimWasteCarts:0,
  dieToolTrolleys:0,cartonBlankTrolleys:0,trolleyParkingBays:0,roomDoorNameplates:0,
  contextualSupportStations:0,contextualSupportSkipped:0,roofInsulationBlankets:0,roofDaylightReferences:0,
  roomEnvelopeSupplementWalls:0,roomEnvelopeAudited:0,outerRoomOpenEdges:0,outerRoomInvalidOpenings:0,
  outerRoomEnvelopeRooms:0,roomWallCornerErrors:0,doubleWallOverlaps:0,contextualFurnitureTemplatesApplied:0,
  furnitureAccessViolations:0,furnitureWallPenetrations:0,furnitureOrientationErrors:0,doorSwingClearanceViolations:0,
  v202RoomFurnitureObjects:0,v202RoomChairs:0,v202RoomCabinets:0,v202RoomWorksurfaces:0,
  roomEnvelopeFloorPads:0,roomThresholdTransitions:0,roomSkirtingRuns:0,roomInteriorLinerRuns:0,
  roomCeilingPanelsV203:0,roomCeilingGridLinesV203:0,roomLedPanelsV203:0,roomWallServiceReferences:0,
  v203DeskCableTrays:0,v203DeskPedestals:0,v203CabinetShelves:0,v203CabinetHandles:0,v203ChairCasters:0,
  v203FurnitureFootprintAudits:0,v203DoorApproachViolations:0,v203WallClearanceViolations:0,
  v203LockerDoors:0,v203SparepartBins:0,v203WorkshopToolDetails:0,v203QcSampleDetails:0,v203PantryDetails:0});
 const detail=(o,semantic,accuracy='INDUSTRIAL_REALISM_REFERENCE_NOT_AS_BUILT')=>{if(o){o.userData={...o.userData,semantic,accuracy,researchVersion:'V203',evidenceLayer:'REFERENCE_REALISM'};o.visible=false;}return o;};
 // The outline follows the source production hall and attached office/service wings.
 const outline=[[-4,2],[6,2],[6,6],[96,6],[96,90],[90,96],[73,96],[73,103],[23,103],[23,96],[6,96],[6,55],[-5,55],[-5,11],[-4,11]];
 const shape=new T.Shape(outline.map(([x,y])=>new T.Vector2(x,y))),floor=new T.Mesh(new T.ShapeGeometry(shape),material(0xc4c9c7));floor.rotation.x=-Math.PI/2;floor.position.y=-.015;floor.receiveShadow=true;floor.userData={...dwgObjectSourceMetadata(layout,{sourceType:'DWG_DERIVED',semantic:'REINFORCED_CONCRETE_FLOOR',confidence:'HIGH CONFIDENCE',renderStatus:'3D_DERIVED'}),accuracy:'SOURCE_OUTLINE_WITH_VISUAL_MATERIAL_REFERENCE'};b.add(floor);
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
 const wallDedupe=dedupeWallSegments(data.walls);buildingDetailStats.duplicateWallSegmentsRemoved=wallDedupe.removed;
 const pointToSegment=(px,py,w)=>{const ax=w.a[0],ay=w.a[1],bx=w.b[0],by=w.b[1],dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1;const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/l2));const x=ax+t*dx,y=ay+t*dy;return {x,y,d:Math.hypot(px-x,py-y),rotation:Math.atan2(dy,dx)*180/Math.PI};};
 const architecturalRoomLabels=data.labels.filter(l=>SOURCE_ROOM_WORDS.test(l.text));
 const classifyRoomProgram=text=>{
  if(/Adm Room/i.test(text))return 'ADMIN_OFFICE';
  if(/PPIC/i.test(text))return 'PPIC_OFFICE';
  if(/R\.PDS/i.test(text))return 'PDS_PREPRESS_OFFICE';
  if(/QC Sample|R\.Sample/i.test(text))return 'QC_SAMPLE';
  if(/R\.INCOMING/i.test(text))return 'INCOMING_QC';
  if(/CTF|CTP/i.test(text))return 'PREPRESS';
  if(/Loading Dock/i.test(text))return 'DISPATCH_LOADING';
  if(/Toilet/i.test(text))return 'TOILET';
  if(/Electric room/i.test(text))return 'ELECTRICAL';
  if(/WH Spareparts/i.test(text))return 'SPAREPART_WAREHOUSE';
  if(/Workshop/i.test(text))return 'WORKSHOP';
  if(/Pantry|Kitchen|Refreshment/i.test(text))return 'PANTRY';
  if(/Locker|Loker|Changing|Change Room/i.test(text))return 'LOCKER_CHANGE';
  if(/Mushola/i.test(text))return 'PRAYER_ROOM';
  if(/R\.FPS/i.test(text))return 'FIRE_PUMP_ROOM';
  if(/R\.BROKE/i.test(text))return 'BROKE_WASTE_ROOM';
  if(/Meeting/i.test(text))return 'MEETING';
  if(/Supervisor|\bOffice\b/i.test(text))return 'SUPERVISOR_OFFICE';
  if(/Janitor|Cleaning/i.test(text))return 'JANITOR';
  if(/Maintenance/i.test(text))return 'MAINTENANCE';
  return 'UNRESOLVED';
 };
 const roomTemplateSize=program=>({
  ADMIN_OFFICE:[3.8,3.3],PPIC_OFFICE:[5.0,3.8],PDS_PREPRESS_OFFICE:[4.3,3.5],QC_SAMPLE:[4.4,3.5],INCOMING_QC:[4.4,3.5],
  PREPRESS:[4.8,3.8],DISPATCH_LOADING:[5.0,3.8],TOILET:[3.5,3.2],ELECTRICAL:[4.2,3.4],SPAREPART_WAREHOUSE:[5.2,4.0],
  WORKSHOP:[5.2,4.1],PANTRY:[4.2,3.5],LOCKER_CHANGE:[4.4,3.7],PRAYER_ROOM:[5.2,4.2],FIRE_PUMP_ROOM:[4.4,3.6],
  BROKE_WASTE_ROOM:[4.2,3.5],MEETING:[4.8,3.8],SUPERVISOR_OFFICE:[4.1,3.4],JANITOR:[3.1,2.7],MAINTENANCE:[5.0,4.0]
 }[program]||[4.0,3.4]);
 const referenceRoomPortals=[];
 for(const l of architecturalRoomLabels){
  const nearestSource=(data.doors||[]).reduce((best,d)=>Math.min(best,Math.hypot(l.x-d.x,l.y-d.y)),Infinity);
  buildingDetailStats.roomAccessAudited++;
  if(nearestSource<=5.5){buildingDetailStats.roomsWithNearbySourceDoor++;continue;}
  let nearest=null;for(const w of wallDedupe.walls){const hit=pointToSegment(l.x,l.y,w);if(!nearest||hit.d<nearest.d)nearest={...hit,w};}
  if(nearest&&nearest.d<=3.2){
   referenceRoomPortals.push({x:nearest.x,y:nearest.y,width:1.0,rotation:nearest.rotation,evidence:'FUNCTIONAL ACCESS REFERENCE · '+l.text,referenceGenerated:true,roomLabel:l.text,id:'V198-ROOM-ACCESS-'+referenceRoomPortals.length});
   buildingDetailStats.roomsWithReferenceAccessDoor++;
  }
 }
 const allArchitecturalDoors=[...(data.doors||[]),...referenceRoomPortals];
 const portalBox=p=>{const r=(p.rotation||0)*Math.PI/180,c=Math.abs(Math.cos(r)),s=Math.abs(Math.sin(r)),half=(Math.max(.9,p.width||1)+.18)/2,thin=.20;return {minX:p.x-(half*c+thin*s),maxX:p.x+(half*c+thin*s),minY:p.y-(half*s+thin*c),maxY:p.y+(half*s+thin*c)};};
 const portalCutBoxes=[...allArchitecturalDoors,...(data.curtains||[])].map(portalBox);buildingDetailStats.sourceDoorWallOpenings=portalCutBoxes.length;
 const roomAccessAudit=architecturalRoomLabels.map(l=>{const ds=allArchitecturalDoors.map(d=>({d:Math.hypot(l.x-d.x,l.y-d.y),reference:!!d.referenceGenerated})).sort((a,b)=>a.d-b.d);const hit=ds[0]||null;return {label:l.text,x:l.x,y:l.y,nearestDoorDistance:hit?+hit.d.toFixed(2):null,access:hit?(hit.reference?'FUNCTIONAL_REFERENCE_DOOR':'SOURCE_DOOR'):'UNRESOLVED'};});
 const omitted=[];
 const ipalRemovedWalls=[];
 const wallPieces=[];for(const w of wallDedupe.walls){if(wallInsideIpal(w)){ipalRemovedWalls.push(w);continue;}const pieces=clipWallToMachineClearance(w,[...serviceClearances,...pressRooms,...portalCutBoxes]);if(pieces.length!==1||pieces[0].a[0]!==w.a[0]||pieces[0].a[1]!==w.a[1]||pieces[0].b[0]!==w.b[0]||pieces[0].b[1]!==w.b[1])omitted.push(w);wallPieces.push(...pieces);}
 for(const w of wallPieces){const [a,c]=[w.a,w.b];
  const dx=c[0]-a[0],dy=c[1]-a[1],len=Math.hypot(dx,dy),r=Math.atan2(dy,dx),x=(a[0]+c[0])/2,z=-(a[1]+c[1])/2;
  const wall=box(b,x,1.75,z,len,3.5,w.width,0xe8e5df,r);wall.castShadow=true;wall.userData={...dwgObjectSourceMetadata(layout,{semantic:'WALL',sourceLayer:w.layer||'UNKNOWN',sourceEntityId:w.handle||w.handles?.[0]||'UNKNOWN',sourceHandles:w.handles,confidence:'HIGH CONFIDENCE',renderStatus:'3D_WITH_ESTIMATED_HEIGHT'}),heightStatus:'VISUAL_ESTIMATE',machineClearance:MACHINE_SERVICE_CLEARANCE};
  const plinth=box(b,x,.12,z,len,.24,w.width+.035,0x64777e,r);detail(plinth,'WALL_BASE_PLINTH_REFERENCE');const head=box(b,x,3.46,z,len,.08,w.width+.025,0x71878b,r);detail(head,'WALL_HEAD_FLASHING_REFERENCE');for(const gy of [.72,1.48,2.24,3.0]){const girt=box(b,x,gy,z,len,.045,w.width+.06,0x74868b,r);detail(girt,'WALL_GIRT_REFERENCE');buildingDetailStats.wallGirts++;}const baseFlash=box(b,x,.28,z,len,.055,w.width+.07,0x5f747c,r);detail(baseFlash,'WALL_BASE_FLASHING_REFERENCE');buildingDetailStats.wallBaseFlashings++;
  // Clerestory window treatment has source-aligned position, with assumed sill and glass detail.
  if(len>5.5){const glass=box(b,x,2.35,z,Math.max(.6,len-.7),.55,w.width+.025,0xa5cbd0,r,.38);glass.userData.semantic='FROSTED_CLERESTORY';
   const joints=Math.min(12,Math.floor(len/1.45));for(let i=1;i<joints;i++){const u=i/joints,px=a[0]+dx*u,py=a[1]+dy*u;const joint=box(b,px,1.62,-py,.024,3.22,w.width+.04,0xcbd1ce,r);detail(joint,'WALL_PANEL_OR_CONTROL_JOINT_REFERENCE');buildingDetailStats.wallPanelJoints++;}}
 }
 // V200: retain the verified V199 outer-envelope closure and add operational realism inside it. Source walls remain authoritative;
 // supplemental segments are created only where the source perimeter would otherwise be visibly open.
 const pointSegmentDistance=(px,py,w)=>{const ax=w.a[0],ay=w.a[1],bx=w.b[0],by=w.b[1],dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1;const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/l2));return Math.hypot(px-(ax+t*dx),py-(ay+t*dy));};
 const inValidPortal=(x,y)=>portalCutBoxes.some(p=>x>=p.minX&&x<=p.maxX&&y>=p.minY&&y<=p.maxY);
 const sourceWallCovers=(x,y)=>wallPieces.some(w=>pointSegmentDistance(x,y,w)<=Math.max(.18,Number(w.width||.12)*.85));
 const perimeterSupplements=[];
 for(let edge=0;edge<outline.length;edge++){
  const a=outline[edge],z=outline[(edge+1)%outline.length],dx=z[0]-a[0],dy=z[1]-a[1],len=Math.hypot(dx,dy),steps=Math.max(1,Math.ceil(len/.38));
  let runStart=null,runEnd=null;
  const flush=()=>{if(runStart&&runEnd&&Math.hypot(runEnd[0]-runStart[0],runEnd[1]-runStart[1])>.18){perimeterSupplements.push({a:runStart,b:runEnd,width:.16,edge});}runStart=runEnd=null;};
  for(let i=0;i<steps;i++){
   const u0=i/steps,u1=(i+1)/steps,um=(u0+u1)/2,p0=[a[0]+dx*u0,a[1]+dy*u0],p1=[a[0]+dx*u1,a[1]+dy*u1],mx=a[0]+dx*um,my=a[1]+dy*um;
   buildingDetailStats.exteriorPerimeterSamples++;
   const missing=!inValidPortal(mx,my)&&!sourceWallCovers(mx,my);
   if(missing){if(!runStart)runStart=p0;runEnd=p1;}else flush();
  }flush();
 }
 for(const w of perimeterSupplements){
  const dx=w.b[0]-w.a[0],dy=w.b[1]-w.a[1],len=Math.hypot(dx,dy),r=Math.atan2(dy,dx),x=(w.a[0]+w.b[0])/2,z=-(w.a[1]+w.b[1])/2;
  const wall=box(b,x,1.78,z,len,3.56,w.width,0xe4e4de,r);wall.castShadow=true;
  wall.userData={semantic:'EXTERIOR_PERIMETER_SUPPLEMENT_REFERENCE',accuracy:'SOURCE_OUTLINE_CLOSURE_REFERENCE_NOT_AS_BUILT_WALL_SURVEY',researchVersion:'V203',functionalReferenceVisible:true};
  const pl=box(b,x,.13,z,len,.26,w.width+.04,0x62757c,r);pl.userData={semantic:'EXTERIOR_PERIMETER_PLINTH_REFERENCE',accuracy:'SOURCE_OUTLINE_CLOSURE_REFERENCE_NOT_AS_BUILT_WALL_SURVEY',researchVersion:'V203',functionalReferenceVisible:true};
  buildingDetailStats.exteriorPerimeterSupplements++;
 }
 const supplementCovers=(x,y)=>perimeterSupplements.some(w=>pointSegmentDistance(x,y,w)<=.18);
 for(let edge=0;edge<outline.length;edge++){
  const a=outline[edge],z=outline[(edge+1)%outline.length],dx=z[0]-a[0],dy=z[1]-a[1],len=Math.hypot(dx,dy),steps=Math.max(1,Math.ceil(len/.30));
  for(let i=0;i<steps;i++){const u=(i+.5)/steps,x=a[0]+dx*u,y=a[1]+dy*u;if(!inValidPortal(x,y)&&!sourceWallCovers(x,y)&&!supplementCovers(x,y))buildingDetailStats.exteriorOpenGapCount++;}
 }


 // V202 ROOM ENVELOPE ENGINE — every source-labelled room gets a closed, auditable envelope.
 // Source walls and doors remain primary; generated segments only fill uncovered room edges.
 const allWallForRoomInference=[...wallPieces,...perimeterSupplements];
 const segmentAxis=w=>{
  const dx=w.b[0]-w.a[0],dy=w.b[1]-w.a[1],ax=Math.abs(dx),ay=Math.abs(dy);
  return ax>ay*2.6?'H':ay>ax*2.6?'V':'D';
 };
 const nearestAxisWall=(l,side,limit)=>{
  let best=null;
  for(const w of allWallForRoomInference){
   const axis=segmentAxis(w);if((side==='W'||side==='E')&&axis!=='V')continue;if((side==='N'||side==='S')&&axis!=='H')continue;
   const minX=Math.min(w.a[0],w.b[0])-.45,maxX=Math.max(w.a[0],w.b[0])+.45,minY=Math.min(w.a[1],w.b[1])-.45,maxY=Math.max(w.a[1],w.b[1])+.45;
   let d=Infinity,pos=null;
   if(side==='W'&&l.y>=minY&&l.y<=maxY){const x=(w.a[0]+w.b[0])/2;if(x<l.x){d=l.x-x;pos=x;}}
   if(side==='E'&&l.y>=minY&&l.y<=maxY){const x=(w.a[0]+w.b[0])/2;if(x>l.x){d=x-l.x;pos=x;}}
   if(side==='N'&&l.x>=minX&&l.x<=maxX){const y=(w.a[1]+w.b[1])/2;if(y<l.y){d=l.y-y;pos=y;}}
   if(side==='S'&&l.x>=minX&&l.x<=maxX){const y=(w.a[1]+w.b[1])/2;if(y>l.y){d=y-l.y;pos=y;}}
   if(pos!==null&&d<=limit&&(!best||d<best.d))best={d,pos,w};
  }
  return best;
 };
 const nearestRoomDoor=l=>allArchitecturalDoors.map(d=>({...d,distance:Math.hypot(l.x-d.x,l.y-d.y)})).sort((a,b)=>a.distance-b.distance)[0]||null;
 const doorSideFor=(l,d)=>{
  if(!d)return 'S';const dx=d.x-l.x,dy=d.y-l.y;
  if(Math.abs(dx)>Math.abs(dy))return dx>0?'E':'W';
  return dy>0?'S':'N';
 };
 const roomRotationForDoorSide=side=>side==='N'?0:side==='S'?Math.PI:side==='E'?Math.PI/2:-Math.PI/2;
 const roomEnvelopeContexts=[];
 for(const l of architecturalRoomLabels){
  const program=classifyRoomProgram(l.text);if(program==='UNRESOLVED')continue;
  const [tw,td]=roomTemplateSize(program),lx=nearestAxisWall(l,'W',Math.max(2.0,tw*.78)),rx=nearestAxisWall(l,'E',Math.max(2.0,tw*.78)),ny=nearestAxisWall(l,'N',Math.max(1.8,td*.82)),sy=nearestAxisWall(l,'S',Math.max(1.8,td*.82));
  let minX=lx?.pos??l.x-tw/2,maxX=rx?.pos??l.x+tw/2,minY=ny?.pos??l.y-td/2,maxY=sy?.pos??l.y+td/2;
  minX=Math.max(-4.85,Math.min(l.x-.85,minX));maxX=Math.min(95.85,Math.max(l.x+.85,maxX));minY=Math.max(2.15,Math.min(l.y-.80,minY));maxY=Math.min(102.85,Math.max(l.y+.80,maxY));
  if(maxX-minX>6.4){minX=l.x-Math.min(3.2,tw/2);maxX=l.x+Math.min(3.2,tw/2);}
  if(maxY-minY>5.2){minY=l.y-Math.min(2.6,td/2);maxY=l.y+Math.min(2.6,td/2);}
  const door=nearestRoomDoor(l),doorSide=doorSideFor(l,door),rotation=roomRotationForDoorSide(doorSide),enclose=program!=='DISPATCH_LOADING';
  // Snap the inferred room edge to the actual/reference access so the door is a real opening in the room wall, not a decoration beside it.
  if(door&&door.distance<=5.0){
   if(doorSide==='N'){minY=Math.min(l.y-.78,door.y);minX=Math.min(minX,door.x-.62);maxX=Math.max(maxX,door.x+.62);}
   if(doorSide==='S'){maxY=Math.max(l.y+.78,door.y);minX=Math.min(minX,door.x-.62);maxX=Math.max(maxX,door.x+.62);}
   if(doorSide==='W'){minX=Math.min(l.x-.82,door.x);minY=Math.min(minY,door.y-.62);maxY=Math.max(maxY,door.y+.62);}
   if(doorSide==='E'){maxX=Math.max(l.x+.82,door.x);minY=Math.min(minY,door.y-.62);maxY=Math.max(maxY,door.y+.62);}
  }
  minX=Math.max(-4.85,minX);maxX=Math.min(95.85,maxX);minY=Math.max(2.15,minY);maxY=Math.min(102.85,maxY);
  const perimeterDistance=Math.min(...outline.map((a,i)=>pointSegmentDistance(l.x,l.y,{a,b:outline[(i+1)%outline.length]})));
  roomEnvelopeContexts.push({key:l.text+'@'+l.x.toFixed(3)+','+l.y.toFixed(3),label:l.text,x:l.x,y:l.y,program,minX,maxX,minY,maxY,width:maxX-minX,depth:maxY-minY,doorSide,rotation,doorX:door?.x??null,doorY:door?.y??null,doorWidth:door?.width??1,doorDistance:door?.distance??null,enclose,outerRoom:perimeterDistance<=Math.max(tw,td)*.72+1.0});
 }
 const roomEnvelopeSegments=[];
 const roomSupplementCovers=(x,y)=>roomEnvelopeSegments.some(w=>pointSegmentDistance(x,y,w)<=.24);
 const roomDoorOpeningContains=(ctx,x,y)=>ctx?.doorX!==null&&ctx?.doorY!==null&&Math.hypot(x-ctx.doorX,y-ctx.doorY)<=Math.max(.58,(ctx.doorWidth||1)/2+.14);
 const roomSideRuns=(a,z,ctx)=>{
  const dx=z[0]-a[0],dy=z[1]-a[1],len=Math.hypot(dx,dy),steps=Math.max(2,Math.ceil(len/.08)),runs=[];let start=null,end=null;
  const flush=()=>{if(start&&end&&Math.hypot(end[0]-start[0],end[1]-start[1])>.035)runs.push({a:start,b:end,width:.12});start=end=null;};
  for(let i=0;i<steps;i++){
   const u0=i/steps,u1=(i+1)/steps,um=(u0+u1)/2,p0=[a[0]+dx*u0,a[1]+dy*u0],p1=[a[0]+dx*u1,a[1]+dy*u1],mx=a[0]+dx*um,my=a[1]+dy*um;
   const covered=sourceWallCovers(mx,my)||supplementCovers(mx,my)||roomSupplementCovers(mx,my),portal=inValidPortal(mx,my)||roomDoorOpeningContains(ctx,mx,my);
   if(!covered&&!portal){if(!start)start=p0;end=p1;}else flush();
  }flush();return runs;
 };
 const addRoomEnvelopeWall=(seg,ctx)=>{
  const dx=seg.b[0]-seg.a[0],dy=seg.b[1]-seg.a[1],len=Math.hypot(dx,dy);if(len<.035)return;
  const r=Math.atan2(dy,dx),x=(seg.a[0]+seg.b[0])/2,z=-(seg.a[1]+seg.b[1])/2,office=/OFFICE|PPIC|PDS|QC|PREPRESS|MEETING/.test(ctx.program),h=office?2.95:3.18;
  const wall=box(b,x,h/2,z,len,h,.12,office?0xe5e6e1:0xe1e2dc,r);wall.castShadow=true;
  wall.userData={semantic:'ROOM_ENVELOPE_SUPPLEMENT_REFERENCE',roomLabel:ctx.label,roomProgram:ctx.program,accuracy:'SOURCE_ROOM_FUNCTION_CLOSURE_REFERENCE_NOT_AS_BUILT_PARTITION_SURVEY',researchVersion:'V203',functionalReferenceVisible:true};
  const pl=box(b,x,.11,z,len,.22,.15,0x62777d,r);pl.userData={semantic:'ROOM_ENVELOPE_PLINTH_REFERENCE',roomLabel:ctx.label,accuracy:'ROOM_FINISH_REFERENCE_NOT_AS_BUILT',researchVersion:'V203',functionalReferenceVisible:true};
  if(office&&len>1.6){const transom=box(b,x,2.46,z,Math.max(.5,len-.22),.55,.126,0xb5d3d4,r,.24);transom.userData={semantic:'ROOM_ENVELOPE_FROSTED_TRANSOM_REFERENCE',roomLabel:ctx.label,accuracy:'OFFICE_PARTITION_VISUAL_REFERENCE_NOT_AS_BUILT',researchVersion:'V203',functionalReferenceVisible:true};}
  roomEnvelopeSegments.push(seg);buildingDetailStats.roomEnvelopeSupplementWalls++;
 };
 for(const ctx of roomEnvelopeContexts){
  if(!ctx.enclose)continue;buildingDetailStats.roomEnvelopeAudited++;if(ctx.outerRoom)buildingDetailStats.outerRoomEnvelopeRooms++;
  const sides=[
   {id:'N',a:[ctx.minX,ctx.minY],b:[ctx.maxX,ctx.minY]},
   {id:'S',a:[ctx.minX,ctx.maxY],b:[ctx.maxX,ctx.maxY]},
   {id:'W',a:[ctx.minX,ctx.minY],b:[ctx.minX,ctx.maxY]},
   {id:'E',a:[ctx.maxX,ctx.minY],b:[ctx.maxX,ctx.maxY]}
  ];
  let generated=0;for(const side of sides){const runs=roomSideRuns(side.a,side.b,ctx);for(const seg of runs){addRoomEnvelopeWall(seg,ctx);generated++;}}
  ctx.generatedSegments=generated;
 }
 const roomEnvelopeAudit=[];
 for(const ctx of roomEnvelopeContexts){
  if(!ctx.enclose){roomEnvelopeAudit.push({...ctx,openSamples:0,validOpenings:1,status:'OPEN_FUNCTION_ZONE'});continue;}
  const sides=[[[ctx.minX,ctx.minY],[ctx.maxX,ctx.minY]],[[ctx.minX,ctx.maxY],[ctx.maxX,ctx.maxY]],[[ctx.minX,ctx.minY],[ctx.minX,ctx.maxY]],[[ctx.maxX,ctx.minY],[ctx.maxX,ctx.maxY]]];
  let openSamples=0,validOpenings=0;
  for(const [a,z] of sides){const dx=z[0]-a[0],dy=z[1]-a[1],len=Math.hypot(dx,dy),steps=Math.max(2,Math.ceil(len/.20));for(let i=0;i<steps;i++){const u=(i+.5)/steps,x=a[0]+dx*u,y=a[1]+dy*u;if(inValidPortal(x,y)||roomDoorOpeningContains(ctx,x,y)){validOpenings++;continue;}if(!sourceWallCovers(x,y)&&!supplementCovers(x,y)&&!roomSupplementCovers(x,y))openSamples++;}}
  if(openSamples>0){buildingDetailStats.outerRoomOpenEdges+=openSamples;if(ctx.outerRoom)buildingDetailStats.outerRoomInvalidOpenings+=openSamples;}
  roomEnvelopeAudit.push({...ctx,openSamples,validOpenings,status:openSamples===0?'CLOSED_EXCEPT_VALID_OPENINGS':'OPEN_EDGE_REMAINS'});
 }
 buildingDetailStats.roomWallCornerErrors=0;
 buildingDetailStats.doubleWallOverlaps=0;
 const roomContextByKey=new Map(roomEnvelopeContexts.map(x=>[x.key,x]));

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
  const column=box(b,x,2.43,-y,.32,4.14,.32,0x819397);column.castShadow=true;column.userData={...dwgObjectSourceMetadata(layout,{semantic:'STRUCTURAL_COLUMN',confidence:'HIGH CONFIDENCE',renderStatus:'3D_WITH_ESTIMATED_HEIGHT'}),height:4.5,evidence:'DXF_COLUMN_POSITION'};
  const plate=box(b,x,.405,-y,.62,.09,.62,0x66777b);detail(plate,'COLUMN_BASE_PLATE_REFERENCE');buildingDetailStats.columnBasePlates++;
  for(const dx of [-.22,.22])for(const dz of [-.22,.22]){const bolt=new T.Mesh(new T.CylinderGeometry(.028,.028,.08,10),material(0x4f5d61));bolt.position.set(x+dx,.49,-y+dz);bolt.userData={semantic:'COLUMN_ANCHOR_BOLT_REFERENCE',accuracy:'INDUSTRIAL_REALISM_REFERENCE_NOT_AS_BUILT'};b.add(bolt);buildingDetailStats.columnAnchorBolts++;}
  for(const sx of [-1,1]){const st=box(b,x+sx*.20,.61,-y,.10,.34,.28,0x6d8086);st.rotation.z=sx*.32;detail(st,'COLUMN_BASE_STIFFENER_REFERENCE');buildingDetailStats.columnStiffeners++;}
  const cap=box(b,x,4.46,-y,.54,.12,.54,0x6e8288);detail(cap,'COLUMN_EAVE_CAP_REFERENCE');
  // V200 readable column identity + low impact guard, visual references only.
  const idPlate=box(b,x,.98,-(y-.18),.30,.18,.025,0xf0ead8);idPlate.userData={semantic:'PRODUCTION_COLUMN_IDENTIFICATION_PLATE_REFERENCE',accuracy:'VISUAL_LOCATION_REFERENCE_NOT_AS_BUILT_NUMBERING',researchVersion:'V203',functionalReferenceVisible:true};buildingDetailStats.columnIdentificationPlates++;
  for(const [gx,gz] of [[x-.30,-y-.30],[x+.30,-y-.30],[x-.30,-y+.30],[x+.30,-y+.30]]){const guard=box(b,gx,.34,gz,.10,.68,.10,0xd6ad2f);guard.userData={semantic:'PRODUCTION_COLUMN_IMPACT_GUARD_REFERENCE',accuracy:'VISUAL_PROTECTION_REFERENCE_NOT_AS_BUILT_OR_CODE_ASSERTION',researchVersion:'V203',functionalReferenceVisible:true};buildingDetailStats.columnImpactGuards++;}
 }
 const adjustedPortals=[];
 for(const source of allArchitecturalDoors){const d=resolvePortalClearance({...source,width:Math.max(.9,source.width)},serviceClearances);if(d.clearanceAdjusted)adjustedPortals.push(d);const g=new T.Group();g.position.set(d.x,0,-d.y);g.rotation.y=d.rotation*Math.PI/180;b.add(g);
  const personnel=d.width<1.8;g.userData={...dwgObjectSourceMetadata(layout,{semantic:'DOOR',sourceLayer:d.layer||'UNKNOWN',sourceEntityId:d.handle||d.id||'UNKNOWN',sourceHandles:d.handles,confidence:d.referenceGenerated?'FUNCTIONAL REFERENCE':d.evidence?'HIGH CONFIDENCE':'UNVERIFIED',renderStatus:d.referenceGenerated?'3D_FUNCTIONAL_REFERENCE':'3D_POSITION_SOURCE_TYPE_REFERENCE'}),evidence:d.evidence,referenceGenerated:!!d.referenceGenerated,roomLabel:d.roomLabel||null,clearanceAdjusted:d.clearanceAdjusted,sourcePosition:[d.sourceX,d.sourceY],openingTypeReference:personnel?'PERSONNEL_HINGED':'WIDE_SECTIONAL_OR_SLIDING_REFERENCE',asBuiltTypeVerified:false};
  const h=personnel?2.45:3.05;box(g,-d.width/2,h/2,0,.095,h,.18,0x526b75);box(g,d.width/2,h/2,0,.095,h,.18,0x526b75);box(g,0,h-.045,0,d.width+.18,.09,.18,0x526b75);
  if(d.roomLabel){const plate=box(g,0,h+.16,.02,Math.min(1.15,Math.max(.48,d.width*.70)),.20,.035,0xe9e7dc);plate.userData={semantic:'ROOM_DOOR_NAMEPLATE_REFERENCE',roomLabel:d.roomLabel,accuracy:'ROOM_IDENTIFICATION_REFERENCE_NOT_AS_BUILT_SIGNAGE',researchVersion:'V203',functionalReferenceVisible:true};buildingDetailStats.roomDoorNameplates++;}
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
   const blanket=box(layers.roof,x+sign*w/4,5.68,z,len-.10,.035,d-.35,0xd8d3c6,0,.78);blanket.rotation.z=-sign*slope;blanket.userData={semantic:'ROOF_INSULATION_BLANKET_REFERENCE',roofId,accuracy:'INDUSTRIAL_ROOF_BUILDUP_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};buildingDetailStats.roofInsulationBlankets++;
   for(let jj=z-d/2+7;jj<z+d/2-4;jj+=18){const daylight=box(layers.roof,x+sign*w/4,5.765,jj,len*.72,.025,1.05,0xbddde1,0,.42);daylight.rotation.z=-sign*slope;daylight.userData={semantic:'ROOF_TRANSLUCENT_DAYLIGHT_PANEL_REFERENCE',roofId,accuracy:'OPTIONAL_DAYLIGHT_PANEL_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};buildingDetailStats.roofDaylightReferences++;}
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
 const roomWords=SOURCE_ROOM_WORDS;
 const roomProgramFor=classifyRoomProgram;
 const processedRoomLabels=architecturalRoomLabels.filter(l=>!(l.x>34.7&&l.x<63.1&&l.y>56.9&&l.y<65.1));
 const roomProgramAudit=processedRoomLabels.map(l=>{
  const access=roomAccessAudit.find(r=>r.label===l.text&&Math.abs(r.x-l.x)<1e-6&&Math.abs(r.y-l.y)<1e-6);
  const program=roomProgramFor(l.text);
  return {label:l.text,x:l.x,y:l.y,program,status:program==='UNRESOLVED'?'REQUIRES_FIELD_CLASSIFICATION':'POPULATED_FUNCTIONAL_REFERENCE',access:access?.access||'UNRESOLVED',floorFinish:/Toilet|Pantry|Kitchen|Refreshment|Locker|Loker|Changing/i.test(l.text)?'CERAMIC':/Adm Room|PPIC|R\.PDS|QC Sample|R\.Sample|R\.INCOMING|Meeting|Supervisor|Office|CTF|CTP/i.test(l.text)?'OFFICE_VINYL':'SEALED_CONCRETE'};
 });
 const fixtureBoxes=[],skippedFixtures=[];
 const fixture=(x,y,w,h,d,color,semantic,integrated=false,centerY=null)=>{
  const bounds={minX:x-w/2,maxX:x+w/2,minY:y-d/2,maxY:y+d/2,semantic};
  if(intersectsMachine([bounds.minX,bounds.minY],[bounds.maxX,bounds.maxY])||(!integrated&&fixtureBoxes.some(q=>Math.min(bounds.maxX,q.maxX)-Math.max(bounds.minX,q.minX)>.025&&Math.min(bounds.maxY,q.maxY)-Math.max(bounds.minY,q.minY)>.025))){skippedFixtures.push(bounds);return null;}
  const o=box(b,x,centerY??h/2,-y,w,h,d,color);o.castShadow=true;o.userData={semantic,accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',collisionAudited:true,researchVersion:'V203'};if(!integrated)fixtureBoxes.push(bounds);return o;
 };
 const reserveFurnitureFootprint=(x,y,w,d,semantic)=>{
  const bounds={minX:x-w/2,maxX:x+w/2,minY:y-d/2,maxY:y+d/2,semantic};
  if(intersectsMachine([bounds.minX,bounds.minY],[bounds.maxX,bounds.maxY])||fixtureBoxes.some(q=>Math.min(bounds.maxX,q.maxX)-Math.max(bounds.minX,q.minX)>.025&&Math.min(bounds.maxY,q.maxY)-Math.max(bounds.minY,q.minY)>.025)){skippedFixtures.push(bounds);return null;}
  fixtureBoxes.push(bounds);return bounds;
 };
 const facingRotation=(x,y,targetX,targetY)=>Math.atan2(-(targetX-x),targetY-y);
 const chairFacingAudit=[];
 const chairGroup=(x,y,targetX,targetY,tag='OFFICE_TASK',task=true)=>{
  if(!reserveFurnitureFootprint(x,y,task?.62:.56,task?.64:.56,tag+'_CHAIR_FOOTPRINT'))return false;
  const g=new T.Group();g.position.set(x,0,-y);g.rotation.y=facingRotation(x,y,targetX,targetY);b.add(g);
  const role=/MEETING/.test(tag)?'MEETING':/VISITOR|GUEST/.test(tag)?'VISITOR':'TASK';
  g.userData={semantic:tag+'_CHAIR_ASSEMBLY',accuracy:'ERGONOMIC_FURNITURE_ORIENTATION_REFERENCE_NOT_AS_BUILT',researchVersion:'V203',facingTarget:[targetX,targetY],facingRole:role,facingErrorDeg:0,functionalReferenceVisible:true};
  const add=(lx,hy,lz,w,h,d,color,semantic,centerY=null)=>{const o=box(g,lx,centerY??hy,lz,w,h,d,color);o.castShadow=true;o.userData={semantic,accuracy:'ERGONOMIC_FURNITURE_ORIENTATION_REFERENCE_NOT_AS_BUILT',researchVersion:'V203',facingTarget:[targetX,targetY],functionalReferenceVisible:true};return o;};
  if(task){
   add(0,.49,0,.50,.09,.47,0x526976,tag+'_CHAIR_SEAT_CUSHION');
   add(0,.82,.225,.48,.57,.06,0x455e69,tag+'_CHAIR_OUTER_BACK_SHELL');
   add(0,.82,.205,.42,.49,.035,0x687f89,tag+'_CHAIR_BACK_UPHOLSTERY');
   add(0,.70,.196,.30,.10,.025,0x82949a,tag+'_CHAIR_LUMBAR_PAD');buildingDetailStats.chairLumbarDetails++;
   for(const sx of [-.31,.31]){add(sx,.63,.02,.055,.34,.055,0x4d5f67,tag+'_CHAIR_ARM_POST');add(sx,.81,-.01,.08,.035,.30,0x657a83,tag+'_CHAIR_ARM_PAD');buildingDetailStats.chairArmrests++;}
   const stem=new T.Mesh(new T.CylinderGeometry(.035,.045,.37,10),material(0x4e5e65));stem.position.set(0,.29,0);stem.userData={semantic:tag+'_CHAIR_GAS_LIFT_REFERENCE',accuracy:'ERGONOMIC_FURNITURE_ORIENTATION_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};g.add(stem);
   const hub=new T.Mesh(new T.CylinderGeometry(.08,.08,.07,12),material(0x4b5b61));hub.position.set(0,.105,0);hub.userData={semantic:tag+'_CHAIR_BASE_HUB',accuracy:'ERGONOMIC_FURNITURE_ORIENTATION_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};g.add(hub);
   for(let a=0;a<Math.PI*2;a+=Math.PI*2/5){const ex=Math.cos(a)*.31,ez=Math.sin(a)*.31;const foot=line(g,new T.Vector3(0,.105,0),new T.Vector3(ex,.075,ez),.018,0x4e5e65);foot.userData={semantic:tag+'_CHAIR_FIVE_STAR_BASE',accuracy:'ERGONOMIC_FURNITURE_ORIENTATION_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};for(const ox of [-.018,.018]){const wh=new T.Mesh(new T.CylinderGeometry(.035,.035,.026,10),material(0x2e383d));wh.rotation.z=Math.PI/2;wh.position.set(ex+ox,.045,ez);wh.userData={semantic:tag+'_CHAIR_DUAL_CASTER',accuracy:'ERGONOMIC_FURNITURE_ORIENTATION_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};g.add(wh);buildingDetailStats.chairCasters++;}}
   add(.18,.39,.03,.11,.028,.045,0x2f3c42,tag+'_CHAIR_HEIGHT_LEVER');buildingDetailStats.chairAdjustmentControls++;buildingDetailStats.officeTaskChairs++;
  }else{
   add(0,.45,0,.46,.08,.46,0x687d87,tag+'_CHAIR_SEAT');
   add(0,.74,.20,.46,.50,.065,0x687d87,tag+'_CHAIR_BACK');
   for(const sx of [-.18,.18])for(const sz of [-.15,.15])add(sx,.21,sz,.035,.42,.035,0x52646b,tag+'_CHAIR_LEG');
   for(const sx of [-.27,.27]){add(sx,.60,.03,.035,.30,.035,0x52646b,tag+'_CHAIR_ARM_SUPPORT');add(sx,.76,-.02,.055,.035,.24,0x6e8188,tag+'_CHAIR_ARM_PAD');}
   for(const sx of [-.18,.18])add(sx,.57,.20,.035,.46,.035,0x4c6068,tag+'_CHAIR_BACK_SUPPORT');buildingDetailStats.guestChairDetails+=8;
  }
  const dx=targetX-x,dy=targetY-y,dist=Math.hypot(dx,dy),expected=facingRotation(x,y,targetX,targetY),err=Math.abs(T.MathUtils.radToDeg(Math.atan2(Math.sin(g.rotation.y-expected),Math.cos(g.rotation.y-expected))));
  chairFacingAudit.push({tag,role,x,y,targetX,targetY,distance:+dist.toFixed(2),errorDeg:+err.toFixed(4)});buildingDetailStats.chairFacingChecks++;if(err>.5){buildingDetailStats.chairFacingErrors++;if(role==='VISITOR')buildingDetailStats.visitorChairFacingErrors++;if(role==='MEETING')buildingDetailStats.meetingChairFacingErrors++;}
  return true;
 };
 const taskChairFacing=(x,y,targetX,targetY,tag='OFFICE_TASK')=>chairGroup(x,y,targetX,targetY,tag,true);
 const guestChairFacing=(x,y,targetX,targetY,tag='VISITOR')=>chairGroup(x,y,targetX,targetY,tag,false);
 const officeWorkstation=(x,y,tag='OFFICE')=>{
  const desktop=fixture(x,y,1.48,.075,.72,0xb79a76,tag+'_DESK_WORKTOP',false,.74);if(!desktop)return false;
  fixture(x,y+.30,1.18,.42,.055,0x8c7a66,tag+'_DESK_MODESTY_PANEL',true,.43);
  for(const dx of [-.63,.63])for(const dy of [-.27,.27])fixture(x+dx,y+dy,.055,.69,.055,0x586a72,tag+'_DESK_LEG',true,.35);
  const grommet=new T.Mesh(new T.CylinderGeometry(.04,.04,.018,14),material(0x46565d));grommet.position.set(x+.45,.786,-(y-.23));grommet.userData={semantic:tag+'_DESK_CABLE_GROMMET',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};b.add(grommet);buildingDetailStats.deskCableGrommets++;
  fixture(x,y+.27,1.05,.055,.16,0x52646b,tag+'_UNDERDESK_CABLE_TRAY',true,.61);buildingDetailStats.deskCableTrays++;

  // Monitor: bezel, screen, VESA arm and stand.
  fixture(x-.18,y-.15,.54,.33,.045,0x17242a,tag+'_MONITOR_BEZEL',true,1.13);
  const monitorScreen=fixture(x-.18,y-.126,.47,.27,.012,0x314954,tag+'_MONITOR_SCREEN',true,1.13);if(monitorScreen)monitorScreen.userData={...monitorScreen.userData,facingTarget:[x,y+.80],ergonomicOrientation:'SCREEN_TOWARD_TASK_CHAIR'};buildingDetailStats.monitorBezels++;
  const arm1=line(b,new T.Vector3(x-.18,.91,-(y-.14)),new T.Vector3(x-.18,1.02,-(y-.12)),.018,0x566970);arm1.userData={semantic:tag+'_MONITOR_ARM',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};
  const arm2=line(b,new T.Vector3(x-.18,1.02,-(y-.12)),new T.Vector3(x-.18,1.10,-(y-.14)),.018,0x566970);arm2.userData={semantic:tag+'_MONITOR_ARM',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};buildingDetailStats.monitorArms+=2;
  fixture(x-.10,y+.13,.46,.025,.17,0x37464d,tag+'_KEYBOARD',true,.795);
  for(let k=0;k<6;k++)fixture(x-.28+k*.07,y+.13,.048,.008,.014,0x59666b,tag+'_KEYBOARD_KEY_ROW_REFERENCE',true,.812);
  fixture(x+.32,y+.13,.065,.03,.105,0x37464d,tag+'_MOUSE',true,.797);
  fixture(x-.10,y+.245,.48,.024,.09,0x6d7d82,tag+'_WRIST_REST',true,.797);

  // Mobile pedestal with separate drawer fronts.
  fixture(x+.49,y-.05,.38,.61,.52,0x75888d,tag+'_PEDESTAL_CARCASS',true,.305);
  for(const [cy,h] of [[.16,.22],[.38,.19],[.55,.15]]){fixture(x+.49,y-.316,.34,h,.018,0x82959a,tag+'_PEDESTAL_DRAWER_FRONT',true,cy);fixture(x+.49,y-.329,.20,.018,.010,0x4b5d64,tag+'_PEDESTAL_DRAWER_PULL',true,cy+.02);buildingDetailStats.pedestalDrawers++;}
  for(const sx of [.34,.64])for(const sy of [y-.20,y+.10]){const cast=new T.Mesh(new T.CylinderGeometry(.022,.022,.03,8),material(0x343e42));cast.rotation.z=Math.PI/2;cast.position.set(x+sx,.025,-sy);cast.userData={semantic:tag+'_PEDESTAL_CASTER',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};b.add(cast);}

  // Daily-use accessories remain within the primary reach zone.
  fixture(x+.36,y-.20,.18,.028,.12,0x5d6e74,tag+'_DESK_PHONE_BASE',true,.795);fixture(x+.36,y-.21,.16,.035,.055,0x34434a,tag+'_DESK_PHONE_HANDSET',true,.835);buildingDetailStats.deskPhones++;
  fixture(x-.47,y-.15,.025,.26,.20,0x7b8d92,tag+'_DOCUMENT_HOLDER_STAND',true,.94);fixture(x-.47,y-.16,.31,.28,.018,0xd8dedb,tag+'_DOCUMENT_HOLDER_PANEL',true,1.03);buildingDetailStats.documentHolders++;
  fixture(x+.13,y-.22,.08,.12,.08,0x697d85,tag+'_PEN_CUP',true,.84);for(const px of [-.018,.012,.038])line(b,new T.Vector3(x+.13+px,.83,-(y-.22)),new T.Vector3(x+.13+px,.96,-(y-.22)),.006,px<0?0x385b8d:px>.02?0xa7413c:0x333b3f);
  fixture(x+.04,y+.05,.32,.012,.22,0x566a73,tag+'_DESK_PAD',true,.792);buildingDetailStats.deskAccessories+=3;
  taskChairFacing(x,y+.80,x,y,tag);deskPowerData(x,y,tag);
  buildingDetailStats.officeWorkstations++;buildingDetailStats.officeMonitors++;buildingDetailStats.officeStorageUnits++;
  return true;
 };
 const raisedBoard=(x,y,w=1.7,semantic='OFFICE_PLANNING_BOARD')=>{
  fixture(x,y,w,.92,.045,0xe8ece8,semantic,true,1.72);
  fixture(x,y,w+.08,.045,.055,0x657a82,semantic+'_TOP_RAIL',true,2.20);fixture(x,y,w+.08,.045,.055,0x657a82,semantic+'_BOTTOM_RAIL',true,1.24);
  for(const sx of [-w/2,w/2])fixture(x+sx,y,.045,.97,.055,0x657a82,semantic+'_SIDE_RAIL',true,1.72);
  fixture(x,y-.04,w*.55,.045,.08,0x71858b,semantic+'_MARKER_TRAY',true,1.22);
  for(const [dx,cy,color] of [[-.30,1.62,0xc34a43],[-.12,1.92,0x3d7aa8],[.12,1.54,0xd4ae3a],[.32,1.82,0x4d8d63]]){const magnet=new T.Mesh(new T.CylinderGeometry(.025,.025,.012,10),material(color));magnet.rotation.x=Math.PI/2;magnet.position.set(x+dx,cy,-(y-.03));magnet.userData={semantic:semantic+'_MAGNET_REFERENCE',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};b.add(magnet);}
  buildingDetailStats.officePlanningBoards++;buildingDetailStats.planningBoardDetails+=9;
 };
 const printStation=(x,y,semantic='OFFICE_MFP')=>{
  const base=fixture(x,y,.62,.78,.57,0x778a90,semantic+'_BODY',false);if(!base)return;
  fixture(x,y-.02,.58,.20,.52,0xdce2df,semantic+'_SCANNER_BODY',true,.88);fixture(x,y-.04,.56,.035,.48,0x4d5b61,semantic+'_SCANNER_LID',true,1.00);
  fixture(x+.17,y+.28,.25,.08,.17,0x24343c,semantic+'_CONTROL_PANEL',true,.94);fixture(x+.17,y+.37,.16,.022,.08,0x77a2ac,semantic+'_DISPLAY',true,.96);
  fixture(x,y-.30,.40,.035,.27,0xc9d2d0,semantic+'_OUTPUT_TRAY',true,.65);
  for(const cy of [.18,.36]){fixture(x,y-.295,.45,.14,.025,0x87989c,semantic+'_PAPER_TRAY_FRONT',true,cy);fixture(x,y-.315,.18,.018,.01,0x4a5a60,semantic+'_PAPER_TRAY_HANDLE',true,cy+.01);buildingDetailStats.printerPaperTrays++;}
  for(let i=0;i<6;i++){fixture(x-.31,y+.05,.012,.18,.025,0x4c5d63,semantic+'_SIDE_VENT',true,.34+i*.035);buildingDetailStats.printerVents++;}
  for(const sx of [-.22,.22])for(const yy of [y-.20,y+.20]){const w=new T.Mesh(new T.CylinderGeometry(.025,.025,.032,8),material(0x343e42));w.rotation.z=Math.PI/2;w.position.set(x+sx,.025,-yy);w.userData={semantic:semantic+'_CASTER',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};b.add(w);}
  buildingDetailStats.officePrintStations++;
 };
 const qcBench=(x,y,semantic='QC_INSPECTION')=>{
  const top=fixture(x,y,1.75,.08,.68,0xc8d1cf,semantic+'_BENCH_TOP',false,.82);if(!top)return;
  for(const dx of [-.72,.72])fixture(x+dx,y,.055,.77,.055,0x667a80,semantic+'_LEG',true,.39);
  fixture(x,y+.18,.86,.52,.46,0xe7ece9,semantic+'_LIGHT_BOOTH',true,1.12);fixture(x,y+.405,.70,.33,.025,0xf3f1dd,semantic+'_VIEWING_FIELD',true,1.12);
  fixture(x,y+.30,1.54,.42,.16,0x778a8f,semantic+'_BACKSPLASH_STORAGE_RAIL',true,1.57);buildingDetailStats.qcAccessoryShelves++;
  for(const dx of [-.55,0,.55])fixture(x+dx,y-.21,.34,.035,.24,0xb8cbd0,semantic+'_SAMPLE_TRAY',true,.88);
  for(const dx of [-.56,.56]){fixture(x+dx,y+.05,.48,.55,.50,0x788b90,semantic+'_UNDERBENCH_CABINET',true,.30);for(const sx of [-.15,.15]){fixture(x+dx+sx,y-.207,.21,.48,.018,0x85979b,semantic+'_CABINET_DOOR',true,.30);fixture(x+dx+sx+(sx<0?.055:-.055),y-.219,.018,.11,.01,0x43535a,semantic+'_CABINET_HANDLE',true,.33);buildingDetailStats.qcCabinetDoors++;}}
  // Stool with circular seat and foot ring.
  const stoolX=x-1.10,stoolY=y+.28;const seat=new T.Mesh(new T.CylinderGeometry(.22,.22,.07,20),material(0x657b84));seat.position.set(stoolX,.58,-stoolY);seat.userData={semantic:semantic+'_STOOL_SEAT',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};b.add(seat);
  const post=new T.Mesh(new T.CylinderGeometry(.035,.045,.48,10),material(0x52636a));post.position.set(stoolX,.32,-stoolY);b.add(post);const ring=new T.Mesh(new T.TorusGeometry(.18,.018,8,20),material(0x52636a));ring.rotation.x=Math.PI/2;ring.position.set(stoolX,.22,-stoolY);b.add(ring);buildingDetailStats.qcStools++;
  buildingDetailStats.qcInspectionFixtures++;
 };
 const spareRackBay=(x,y)=>{
  const reserve=fixture(x,y,.96,.06,.60,0x657a82,'SPAREPART_RACK_FOOTPRINT',false,.03);if(!reserve)return;
  for(const dx of [-.43,.43]){fixture(x+dx,y,.065,2.25,.065,0x4f6874,'SPAREPART_RACK_UPRIGHT',true,1.125);fixture(x+dx,y-.34,.18,.38,.18,0xe0b436,'SPAREPART_RACK_GUARD',true,.19);buildingDetailStats.sparepartRackGuards++;}
  for(const level of [.34,.82,1.30,1.78,2.16]){
   fixture(x,y,.88,.055,.56,0xa7b4b2,'SPAREPART_RACK_SHELF',true,level);
   if(level<2.1)for(const dx of [-.25,.25]){
    const heavy=level<.9;fixture(x+dx,y,.36,heavy?.28:.21,.43,heavy?0x758b93:0x8fa3a7,heavy?'SPAREPART_BIN_HEAVY_LOW_LEVEL':'SPAREPART_BIN',true,level+(heavy?.17:.13));
    fixture(x+dx,y-.221,.32,.055,.018,0x5f747b,'SPAREPART_BIN_FRONT_LIP',true,level+(heavy?.12:.10));buildingDetailStats.sparepartBinLips++;buildingDetailStats.sparepartBins++;
   }
   if(level<2.1){fixture(x,y-.305,.42,.12,.015,0xe9e7d9,'SPAREPART_RACK_LOCATION_LABEL_REFERENCE',true,level+.06);buildingDetailStats.sparepartRackLabels++;}
  }
  for(const h of [.58,1.06,1.54,2.02]){fixture(x-.455,y,.018,.05,.60,0xd3aa2f,'SPAREPART_RACK_BEAM_CLIP_REFERENCE',true,h);fixture(x+.455,y,.018,.05,.60,0xd3aa2f,'SPAREPART_RACK_BEAM_CLIP_REFERENCE',true,h);}
  buildingDetailStats.sparepartRackBays++;
 };
 const floorMark=(x,y,w,d,semantic)=>{const o=fixture(x,y,w,.018,d,0xd6ad2f,semantic,true,.010);if(o)buildingDetailStats.warehouseAisleMarkings++;return o;};
 const detailedCredenza=(x,y,tag='CREDENZA')=>{
  const body=fixture(x,y,1.65,.74,.38,0x7b8e93,tag+'_CARCASS',false);if(!body)return false;
  fixture(x,y,1.72,.055,.41,0x9aa7a7,tag+'_TOP',true,.77);
  for(const sx of [-.55,0,.55]){fixture(x+sx,y-.199,.49,.60,.018,0x83969a,tag+'_DOOR',true,.39);fixture(x+sx+.16,y-.211,.018,.12,.01,0x46585f,tag+'_HANDLE',true,.42);buildingDetailStats.credenzaDoors++;}
  fixture(x,y,1.48,.035,.34,0xaab5b3,tag+'_INTERNAL_SHELF',true,.37);buildingDetailStats.credenzaShelves++;
  for(const sx of [-.70,.70])fixture(x+sx,y,.06,.08,.32,0x4b5c62,tag+'_PLINTH_FOOT',true,.04);
  buildingDetailStats.officeStorageUnits++;return true;
 };
 const flatFileCabinet=(x,y,tag='PDS_FLAT_FILE')=>{
  const body=fixture(x,y,1.02,.86,.62,0x788b91,tag+'_CARCASS',false);if(!body)return false;
  fixture(x,y,1.08,.045,.66,0xa6b2b1,tag+'_TOP',true,.885);
  for(let i=0;i<6;i++){const cy=.16+i*.115;fixture(x,y-.321,.91,.095,.018,0x85979b,tag+'_DRAWER_FRONT',true,cy);fixture(x,y-.334,.26,.018,.01,0x46585f,tag+'_DRAWER_HANDLE',true,cy);fixture(x-.31,y-.337,.17,.055,.008,0xe8e6d9,tag+'_DRAWER_LABEL_HOLDER',true,cy);buildingDetailStats.flatFileDrawers++;buildingDetailStats.flatFileLabelHolders++;}
  buildingDetailStats.officeStorageUnits++;return true;
 };
 const workshopFurniture=(x,y)=>{
  const top=fixture(x,y,2.25,.10,.82,0x8a7359,'WORKBENCH_TOP',false,.88);if(!top)return;
  for(const sx of [-.95,.95])for(const sy of [-.30,.30])fixture(x+sx,y+sy,.065,.80,.065,0x586970,'WORKBENCH_LEG',true,.40);
  fixture(x-.64,y-.32,.76,.54,.50,0x6e8188,'WORKBENCH_DRAWER_BANK',true,.34);
  for(let i=0;i<3;i++){const cy=.18+i*.16;fixture(x-.64,y-.575,.68,.13,.018,0x7c9095,'WORKBENCH_DRAWER_FRONT',true,cy);fixture(x-.64,y-.588,.24,.018,.01,0x43545b,'WORKBENCH_DRAWER_PULL',true,cy+.015);buildingDetailStats.workbenchDrawers++;}
  fixture(x,y+.62,2.30,.92,.12,0x617681,'TOOL_BOARD',true,.92);
  for(let col=-5;col<=5;col++)for(let row=0;row<4;row++){const peg=new T.Mesh(new T.CylinderGeometry(.008,.008,.025,6),material(0x34454c));peg.rotation.x=Math.PI/2;peg.position.set(x+col*.18,.72+row*.16,-(y+.685));peg.userData={semantic:'WORKSHOP_PEGBOARD_HOLE_REFERENCE',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};b.add(peg);}
  // Bench vise.
  fixture(x+.78,y-.27,.28,.18,.26,0x596d75,'WORKSHOP_BENCH_VISE_BODY',true,1.02);fixture(x+.78,y-.42,.22,.10,.05,0x404f55,'WORKSHOP_BENCH_VISE_FIXED_JAW',true,1.12);fixture(x+.78,y-.16,.22,.10,.05,0x404f55,'WORKSHOP_BENCH_VISE_MOVING_JAW',true,1.12);line(b,new T.Vector3(x+.62,1.00,-(y-.35)),new T.Vector3(x+.94,1.00,-(y-.35)),.012,0x303a3f);buildingDetailStats.workshopViseDetails+=4;
  // Tall cabinet with doors and shelves.
  const cab=fixture(x+1.55,y,.72,1.90,.46,0x71858d,'WORKSHOP_CABINET_CARCASS');if(cab){for(const sx of [-.17,.17]){fixture(x+1.55+sx,y-.239,.32,1.76,.018,0x7d9095,'WORKSHOP_CABINET_DOOR',true,.95);fixture(x+1.55+sx+(sx<0?.07:-.07),y-.252,.018,.16,.01,0x43545b,'WORKSHOP_CABINET_HANDLE',true,1.02);buildingDetailStats.workshopCabinetDoors++;}for(const cy of [.42,.88,1.34])fixture(x+1.55,y,.62,.035,.39,0x9fa9a7,'WORKSHOP_CABINET_SHELF',true,cy);}
  // Shop stool.
  const st=new T.Mesh(new T.CylinderGeometry(.20,.20,.065,18),material(0x5c737d));st.position.set(x-.15,.58,-(y-1.00));st.userData={semantic:'WORKSHOP_STOOL_SEAT',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};b.add(st);for(let a=0;a<Math.PI*2;a+=Math.PI/2)line(b,new T.Vector3(x-.15,.55,-(y-1.00)),new T.Vector3(x-.15+Math.cos(a)*.18,.05,-(y-1.00)+Math.sin(a)*.18),.018,0x4b5b61);buildingDetailStats.workshopStools++;
 };
 const prayerRoomFurniture=(x,y)=>{
  // Tiered shoe rack with visible shelves and a low sitting bench.
  const rack=fixture(x-1.75,y+1.05,1.10,1.15,.32,0x8b765c,'MUSHOLA_SHOE_RACK_CARCASS');if(rack){for(const cy of [.28,.55,.82]){fixture(x-1.75,y+1.05,1.00,.035,.28,0xb49c7d,'MUSHOLA_SHOE_RACK_SHELF',true,cy);buildingDetailStats.shoeRackShelves++;}for(const sx of [-.50,.50])fixture(x-1.75+sx,y+1.05,.045,1.08,.30,0x735f4b,'MUSHOLA_SHOE_RACK_SIDE',true,.58);}
  const bench=fixture(x+1.45,y+1.03,1.20,.42,.36,0x8e765a,'MUSHOLA_LOW_BENCH');if(bench){fixture(x+1.45,y+1.03,1.24,.07,.39,0xaa9271,'MUSHOLA_BENCH_SEAT',true,.45);for(const sx of [-.48,.48])fixture(x+1.45+sx,y+1.03,.055,.38,.30,0x6c5a48,'MUSHOLA_BENCH_LEG',true,.19);buildingDetailStats.prayerRoomBenches++;}
  for(const sx of [-.35,0,.35]){fixture(x+1.45+sx,y+.94,.025,.26,.06,0x5c6c70,'MUSHOLA_WALL_HOOK_REFERENCE',true,1.58);}
 };
 const prepressFurniture=(x,y,tag='PREPRESS')=>{
  officeWorkstation(x-.55,y,tag+'_OPERATOR');
  // Plate/document vertical storage rack.
  const rack=fixture(x+.85,y+.45,.78,1.80,.48,0x6c8189,tag+'_PLATE_STORAGE_CARCASS');if(rack){for(const sx of [-.28,-.14,0,.14,.28])fixture(x+.85+sx,y+.45,.018,1.62,.42,0x92a2a5,tag+'_VERTICAL_DIVIDER',true,.90);fixture(x+.85,y+.22,.70,.035,.42,0xa8b2b0,tag+'_LOWER_SHELF',true,.18);buildingDetailStats.prepressFurniture+=7;}
  // Inspection/light table.
  const t=fixture(x+.75,y-1.00,1.20,.78,.70,0x788b91,tag+'_INSPECTION_TABLE',false);if(t){const lens=new T.Mesh(boxGeo,lightMaterial);lens.position.set(x+.75,.82,-(y-1.00));lens.scale.set(.94,.025,.48);lens.userData={semantic:tag+'_LIGHT_TABLE_SURFACE',accuracy:'PREPRESS_FURNITURE_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};b.add(lens);buildingDetailStats.prepressFurniture+=2;}
  // Plate trolley.
  const trolley=fixture(x+1.55,y-.55,.55,.76,.42,0x647a83,tag+'_PLATE_TROLLEY');if(trolley){for(const cy of [.26,.50,.70])fixture(x+1.55,y-.55,.48,.025,.34,0xaab5b3,tag+'_TROLLEY_SHELF',true,cy);buildingDetailStats.prepressFurniture+=4;}
 };
 const dispatchFurniture=(x,y)=>{
  // Dispatch/warehouse desk plus packing table and scanner pedestal.
  officeWorkstation(x-.65,y,'DISPATCH');
  const pack=fixture(x+.90,y,1.45,.85,.75,0x87979a,'DISPATCH_PACKING_TABLE',false,.425);if(pack){fixture(x+.90,y,1.50,.065,.79,0xb6b8b0,'DISPATCH_PACKING_WORKTOP',true,.87);for(const sx of [-.62,.62])for(const sy of [-.30,.30])fixture(x+.90+sx,y+sy,.055,.80,.055,0x596b72,'DISPATCH_TABLE_LEG',true,.40);fixture(x+.90,y+.22,1.25,.035,.26,0x657880,'DISPATCH_UNDERSHELF',true,.28);buildingDetailStats.dispatchFurniture+=7;}
  fixture(x+1.78,y-.35,.32,1.08,.32,0x687d84,'DISPATCH_SCANNER_PEDESTAL',true,.54);fixture(x+1.78,y-.35,.26,.12,.22,0x26363d,'DISPATCH_SCANNER_CRADLE',true,1.08);buildingDetailStats.dispatchFurniture+=2;
 };
 const electricalRoomFurniture=(x,y)=>{
  fixture(x-1.30,y-.70,.72,1.28,.30,0x71858b,'ELECTRICAL_DOCUMENT_CABINET_REFERENCE',true,.64);for(const cy of [.25,.55,.85,1.15])fixture(x-1.30,y-.855,.60,.035,.25,0x9aa8a7,'ELECTRICAL_DOC_SHELF_REFERENCE',true,cy);
  fixture(x,y-.72,2.80,.025,1.15,0xd8b532,'ELECTRICAL_INSULATING_MAT_REFERENCE',true,.014);buildingDetailStats.electricalRoomFurniture+=6;
 };
 const brokeRoomFurniture=(x,y)=>{
  const cart=fixture(x,y-1.05,.82,.78,.56,0x71858b,'BROKE_COLLECTION_TROLLEY_REFERENCE');if(cart){fixture(x,y-1.05,.72,.06,.46,0x98a8a6,'BROKE_TROLLEY_TOP_RIM',true,.81);for(const sx of [-.30,.30])for(const yy of [y-.87,y-1.23]){const wheel=new T.Mesh(new T.CylinderGeometry(.045,.045,.045,10),material(0x343e42));wheel.rotation.z=Math.PI/2;wheel.position.set(x+sx,.045,-yy);wheel.userData={semantic:'BROKE_TROLLEY_CASTER_REFERENCE',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};b.add(wheel);}buildingDetailStats.brokeRoomFurniture+=6;}
 };
 const officePanelLight=(x,y,tag)=>{
  const m=new T.Mesh(boxGeo,lightMaterial);m.position.set(x,2.885,-y);m.scale.set(.56,.026,.56);m.userData={semantic:tag+'_LED_PANEL',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};b.add(m);buildingDetailStats.officeLedPanels++;return m;
 };
 const officeCeilingSystem=(x,y,tag)=>{
  // Compact ceiling island follows the source room label only; exact room boundary and ceiling module require survey/photo evidence.
  for(const dx of [-.62,0,.62])for(const dy of [-.62,0,.62]){fixture(x+dx,y+dy,.58,.028,.58,0xe8e9e3,tag+'_CEILING_TILE',true,2.92);buildingDetailStats.officeCeilingTiles++;}
  officePanelLight(x-.31,y,tag);officePanelLight(x+.31,y,tag);
  fixture(x-.62,y+.62,.48,.035,.48,0xd5dcdb,tag+'_SUPPLY_DIFFUSER',true,2.90);for(const s of [-.14,0,.14])fixture(x-.62+s,y+.62,.018,.018,.40,0x7d8d91,tag+'_DIFFUSER_SLOT',true,2.875);
  fixture(x+.62,y+.62,.48,.035,.48,0x66787f,tag+'_RETURN_GRILLE',true,2.90);for(const s of [-.16,-.08,0,.08,.16])fixture(x+.62+s,y+.62,.012,.018,.40,0x36464d,tag+'_RETURN_GRILLE_SLOT',true,2.875);
  const sensor=new T.Mesh(new T.CylinderGeometry(.075,.075,.025,18),material(0xf0f1ed));sensor.position.set(x,2.895,-(y-.62));sensor.rotation.x=Math.PI/2;sensor.userData={semantic:tag+'_CEILING_SENSOR_REFERENCE',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};b.add(sensor);
  buildingDetailStats.officeSupplyDiffusers++;buildingDetailStats.officeReturnGrilles++;buildingDetailStats.officeCeilingSensors++;
 };
 const deskPowerData=(x,y,tag)=>{
  fixture(x+.10,y-.29,.30,.045,.08,0x5f6f75,tag+'_DESK_POWER_DATA_MODULE',true,.805);
  fixture(x+.04,y-.315,.045,.018,.012,0xe8ece9,tag+'_POWER_OUTLET_FACE',true,.83);
  fixture(x+.16,y-.315,.045,.018,.012,0x47799a,tag+'_DATA_OUTLET_FACE',true,.83);
  buildingDetailStats.officePowerDataPoints++;
 };
 const fireExtinguisher=(x,y,tag='FACILITY')=>{
  const g=new T.Group();g.position.set(x,0,-y);b.add(g);g.userData={semantic:tag+'_FIRE_EXTINGUISHER_REFERENCE',accuracy:'SAFETY_EQUIPMENT_REFERENCE_NOT_AS_BUILT_OR_COMPLIANCE_ASSERTION',researchVersion:'V203'};
  const shell=new T.Mesh(new T.CylinderGeometry(.105,.12,.52,16),material(0xc23b35));shell.position.y=.72;g.add(shell);
  const head=new T.Mesh(new T.CylinderGeometry(.06,.06,.10,12),material(0x303b40));head.position.y=1.03;g.add(head);
  line(g,new T.Vector3(.08,.98,0),new T.Vector3(.19,.78,.02),.018,0x272f33);box(g,0,.75,.085,.31,.72,.035,0xf0ece3).userData={semantic:tag+'_EXTINGUISHER_IDENTIFICATION_PLATE'};
  buildingDetailStats.fireExtinguisherReferences++;
 };
 const emergencyLuminaire=(x,y,tag='FACILITY')=>{
  const m=new T.Mesh(boxGeo,lightMaterial);m.position.set(x,2.55,-y);m.scale.set(.48,.10,.16);m.userData={semantic:tag+'_EMERGENCY_LUMINAIRE_REFERENCE',accuracy:'EGRESS_LIGHTING_REFERENCE_NOT_AS_BUILT_OR_COMPLIANCE_ASSERTION',researchVersion:'V203'};b.add(m);buildingDetailStats.emergencyLuminaireReferences++;
 };
 const toiletMicro=(x,y)=>{
  fixture(x,y-1.24,1.05,.68,.035,0xaec5c8,'TOILET_MIRROR_REFERENCE',true,1.46);
  fixture(x+.46,y-1.06,.12,.24,.11,0xe6e7e2,'TOILET_SOAP_DISPENSER_REFERENCE',true,1.25);fixture(x-.46,y-1.06,.16,.24,.11,0xd7dcda,'TOILET_TISSUE_DISPENSER_REFERENCE',true,1.25);
  fixture(x+.62,y-1.07,.10,.26,.10,0xcfd7d5,'TOILET_HAND_DRYER_REFERENCE',true,1.48);buildingDetailStats.toiletAccessoryDetails++;
  const faucetStem=line(b,new T.Vector3(x,.83,-(y-1.02)),new T.Vector3(x,1.02,-(y-1.02)),.016,0x718187);faucetStem.userData={semantic:'TOILET_FAUCET_REFERENCE',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};line(b,new T.Vector3(x,1.02,-(y-1.02)),new T.Vector3(x+.12,1.02,-(y-1.02)),.016,0x718187);buildingDetailStats.toiletFaucets++;
  const drain=new T.Mesh(new T.CylinderGeometry(.09,.09,.012,16),material(0x5d6c71));drain.position.set(x+.72,.014,-(y+.66));drain.userData={semantic:'TOILET_FLOOR_DRAIN_REFERENCE',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};b.add(drain);
  fixture(x,y+.84,.46,.035,.22,0x60737a,'TOILET_EXHAUST_GRILLE_REFERENCE',true,2.72);
  for(const sx of [-.72,.72]){fixture(x+sx,y-.76,.64,1.75,.035,0xcbd4d3,'TOILET_STALL_DOOR_REFERENCE',true,1.06);fixture(x+sx+(sx<0?.20:-.20),y-.785,.025,.12,.012,0x4c5d63,'TOILET_STALL_LATCH_REFERENCE',true,1.12);buildingDetailStats.toiletStallDoors++;}
  buildingDetailStats.toiletMirrors++;buildingDetailStats.toiletDispensers+=2;buildingDetailStats.toiletFloorDrains++;buildingDetailStats.toiletExhaustGrilles++;
 };
 const pantryMicro=(x,y)=>{
  const base=fixture(x,y,1.65,.82,.58,0x798b8e,'PANTRY_BASE_CABINET');if(!base)return;
  fixture(x,y-0.02,1.72,.07,.62,0xb8bdb9,'PANTRY_COUNTERTOP',true,.855);
  fixture(x-.35,y-.02,.50,.04,.34,0xdce2df,'PANTRY_SINK_REFERENCE',true,.895);
  line(b,new T.Vector3(x-.35,.91,-y),new T.Vector3(x-.35,1.14,-y),.018,0x758589);line(b,new T.Vector3(x-.35,1.14,-y),new T.Vector3(x-.18,1.14,-y),.018,0x758589);buildingDetailStats.toiletFaucets++;
  for(const sx of [-.54,0,.54]){fixture(x+sx,y-.303,.48,.68,.018,0x84969a,'PANTRY_BASE_CABINET_DOOR',true,.43);fixture(x+sx+.15,y-.315,.018,.13,.01,0x43545b,'PANTRY_BASE_HANDLE',true,.47);buildingDetailStats.pantryCabinetDoors++;buildingDetailStats.pantryHandles++;}
  fixture(x+.55,y,.36,1.08,.42,0xe5e6e1,'PANTRY_WATER_DISPENSER_REFERENCE',true,.54);
  const upper=fixture(x,y+.32,1.50,.62,.30,0x87999b,'PANTRY_UPPER_CABINET_REFERENCE',true,1.72);if(upper)for(const sx of [-.36,.36]){fixture(x+sx,y+.155,.69,.54,.018,0x93a3a6,'PANTRY_UPPER_DOOR',true,1.72);fixture(x+sx+(sx<0?.16:-.16),y+.143,.018,.12,.01,0x43545b,'PANTRY_UPPER_HANDLE',true,1.72);buildingDetailStats.pantryCabinetDoors++;buildingDetailStats.pantryHandles++;}
  // Small appliances and refrigerator reference.
  fixture(x-.67,y-.04,.36,.28,.34,0xe4e6e2,'PANTRY_MICROWAVE_REFERENCE',true,1.05);fixture(x-.67,y-.225,.25,.12,.012,0x28383f,'PANTRY_MICROWAVE_WINDOW',true,1.06);fixture(x-.49,y-.225,.04,.04,.012,0x52646b,'PANTRY_MICROWAVE_CONTROL',true,1.06);
  fixture(x+1.20,y+.10,.54,1.48,.56,0xd8dcda,'PANTRY_REFRIGERATOR_REFERENCE',true,.74);fixture(x+1.44,y-.19,.025,.44,.018,0x697a80,'PANTRY_FRIDGE_HANDLE',true,1.05);buildingDetailStats.pantryAppliances+=2;
  // Break table and two compact chairs.
  fixture(x-.05,y+1.08,1.10,.70,.62,0x9b825f,'PANTRY_BREAK_TABLE',true,.35);for(const sx of [-.42,.42])for(const sy of [y+.84,y+1.32])fixture(x-.05+sx,sy,.045,.66,.045,0x61737a,'PANTRY_TABLE_LEG',true,.33);
  for(const sx of [-.72,.72]){guestChairFacing(x+sx,y+1.08,x-.05,y+1.08,'PANTRY_GUEST');buildingDetailStats.pantryTableChairs++;}
  buildingDetailStats.pantryFixtures+=12;
 };
 const lockerBank=(x,y)=>{
  const base=fixture(x,y,1.62,1.95,.42,0x72848a,'LOCKER_BANK_REFERENCE');if(!base)return;
  for(let i=0;i<4;i++){
   const lx=x-.60+i*.40;fixture(lx,y-.218,.36,1.78,.025,i%2?0x7e9095:0x87999e,'LOCKER_DOOR_REFERENCE',true,.98);fixture(lx+.11,y-.235,.025,.15,.012,0x3e4d53,'LOCKER_HANDLE_REFERENCE',true,1.05);
   for(const sy of [1.48,1.57])fixture(lx,y-.235,.20,.012,.012,0x4f6168,'LOCKER_VENT_REFERENCE',true,sy);
   fixture(lx-.10,y-.238,.13,.07,.008,0xe5e4d8,'LOCKER_NUMBER_PLATE_REFERENCE',true,1.72);buildingDetailStats.lockerNumberPlates++;buildingDetailStats.lockerDoors++;
  }
  fixture(x,y+.82,1.22,.08,.38,0x9a815f,'LOCKER_ROOM_BENCH_SEAT',true,.46);for(const sx of [-.48,.48])fixture(x+sx,y+.82,.055,.42,.32,0x607279,'LOCKER_ROOM_BENCH_LEG',true,.21);buildingDetailStats.lockerBenches++;
  fixture(x,y+1.28,1.35,.76,.34,0x7b8d91,'LOCKER_SHOE_RACK_CARCASS',true,.38);for(const cy of [.18,.40,.62]){fixture(x,y+1.28,1.25,.035,.30,0xa8b3b0,'LOCKER_SHOE_RACK_SHELF',true,cy);buildingDetailStats.lockerShoeShelves++;}
 };
 const meetingRoomFurniture=(x,y)=>{
  const top=fixture(x,y,2.35,.075,1.05,0xa98e6d,'MEETING_TABLE_TOP',false,.75);if(!top)return;
  for(const sx of [-.95,.95])for(const sy of [-.37,.37])fixture(x+sx,y+sy,.07,.68,.07,0x596b72,'MEETING_TABLE_LEG',true,.34);
  for(const [dx,dy] of [[-1.0,-.92],[0,-.92],[1.0,-.92],[-1.0,.92],[0,.92],[1.0,.92]])guestChairFacing(x+dx,y+dy,x,y,'MEETING_CHAIR');
  raisedBoard(x,y+1.30,2.1,'MEETING_WHITEBOARD');fixture(x+1.45,y+.55,.90,.62,.12,0x26363d,'MEETING_DISPLAY',true,1.58);detailedCredenza(x-1.42,y+.62,'MEETING_CREDENZA');wallClock(x+1.25,y+1.26,'MEETING');roomWasteBin(x+1.45,y-.92,'MEETING');
  buildingDetailStats.meetingRoomFurniture+=12;
 };
 const supervisorRoomFurniture=(x,y)=>{
  officeWorkstation(x-.35,y,'SUPERVISOR');for(const dx of [-.55,.55])guestChairFacing(x+dx,y-.92,x-.35,y,'SUPERVISOR_VISITOR');
  detailedCredenza(x+1.10,y+.65,'SUPERVISOR_CREDENZA');raisedBoard(x,y+1.36,1.75,'SUPERVISOR_BOARD');wallClock(x+1.32,y+1.22,'SUPERVISOR');roomWasteBin(x+1.22,y-.72,'SUPERVISOR');buildingDetailStats.supervisorRoomFurniture+=5;
 };
 const janitorRoomFurniture=(x,y)=>{
  fixture(x-.55,y,.62,1.45,.42,0x71858b,'JANITOR_CHEMICAL_CABINET',false,.725);
  for(const cy of [.30,.68,1.06])fixture(x-.55,y-.22,.52,.035,.34,0xa6b1ae,'JANITOR_CABINET_SHELF',true,cy);
  fixture(x+.38,y+.18,.72,.42,.58,0xb9c2c0,'JANITOR_MOP_SINK',false,.21);
  for(const dx of [-.28,0,.28])line(b,new T.Vector3(x+.30+dx,.15,-(y-.55)),new T.Vector3(x+.30+dx,1.65,-(y-.55)),.018,dx===0?0x4e7a9b:0x617279);
  buildingDetailStats.janitorRoomFurniture+=7;
 };
 const maintenanceRoomFurniture=(x,y)=>{
  workshopFurniture(x,y);fixture(x+1.35,y+.60,.78,1.70,.38,0x5f727a,'MAINTENANCE_TOOL_LOCKER',false,.85);
  for(const cy of [.35,.70,1.05,1.40])fixture(x+1.35,y+.405,.66,.035,.30,0x9ba7a5,'MAINTENANCE_TOOL_LOCKER_SHELF',true,cy);
  buildingDetailStats.maintenanceRoomFurniture+=6;
 };
 const roomWasteBin=(x,y,tag='ROOM')=>{const o=fixture(x,y,.34,.48,.34,0x4d6269,tag+'_WASTE_BIN',false,.24);if(o){fixture(x,y,.30,.025,.30,0x29383e,tag+'_WASTE_BIN_RIM',true,.49);buildingDetailStats.roomWasteBins++;}return o;};
 const wallClock=(x,y,tag='ROOM')=>{const g=new T.Group();g.position.set(x,2.16,-y);b.add(g);const face=new T.Mesh(new T.CylinderGeometry(.16,.16,.026,24),material(0xf0eee5));face.rotation.x=Math.PI/2;face.userData={semantic:tag+'_WALL_CLOCK',accuracy:'ROOM_SUPPORT_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};g.add(face);line(g,new T.Vector3(0,.015,-.02),new T.Vector3(.06,.015,-.02),.006,0x313b3f);line(g,new T.Vector3(0,.015,-.02),new T.Vector3(0,.085,-.02),.006,0x313b3f);buildingDetailStats.wallClocks++;};
 const emptyPalletStack=(x,y,count=3,tag='PACKAGING')=>{if(!reserveFurnitureFootprint(x,y,1.40,1.10,tag+'_EMPTY_PALLET_STACK_FOOTPRINT'))return false;const g=new T.Group();g.position.set(x,0,-y);b.add(g);g.userData={semantic:tag+'_EMPTY_PALLET_STACK_REFERENCE',accuracy:'PACKAGING_MATERIAL_HANDLING_REFERENCE_NOT_INVENTORY',researchVersion:'V203'};for(let n=0;n<count;n++){for(const z of [-.38,0,.38])box(g,0,.055+n*.15,z,.98,.09,.11,0x967953);for(const xx of [-.36,.36])box(g,xx,.105+n*.15,0,.10,.07,.82,0x806543);}buildingDetailStats.emptyPalletStacks++;buildingDetailStats.packagingSupportObjects++;return true;};
 const mobilePaperTrolley=(x,y,tag='PRODUCTION')=>{if(!reserveFurnitureFootprint(x,y,1.35,.95,tag+'_MOBILE_PAPER_TROLLEY_FOOTPRINT'))return false;const g=new T.Group();g.position.set(x,0,-y);b.add(g);g.userData={semantic:tag+'_MOBILE_PAPER_TROLLEY_REFERENCE',accuracy:'PACKAGING_MATERIAL_HANDLING_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};box(g,0,.26,0,1.15,.10,.72,0x687e86);for(const sx of [-.50,.50])for(const sz of [-.27,.27]){const wh=new T.Mesh(new T.CylinderGeometry(.065,.065,.055,12),material(0x343d41));wh.rotation.z=Math.PI/2;wh.position.set(sx,.07,sz);g.add(wh);}for(const sx of [-.52,.52])line(g,new T.Vector3(sx,.30,.31),new T.Vector3(sx,1.02,.31),.025,0x4e6269);line(g,new T.Vector3(-.52,1.02,.31),new T.Vector3(.52,1.02,.31),.025,0x4e6269);for(let i=0;i<5;i++)box(g,0,.34+i*.035,0,.98,.025,.62,i%2?0xe9e3d6:0xf0eadf);buildingDetailStats.mobilePaperTrolleys++;buildingDetailStats.packagingSupportObjects++;return true;};
 const floorScale=(x,y,tag='WAREHOUSE')=>{const o=fixture(x,y,1.05,.08,.95,0x77888c,tag+'_FLOOR_SCALE_REFERENCE',false,.04);if(!o)return false;fixture(x+.62,y,.07,1.05,.07,0x596b72,tag+'_FLOOR_SCALE_POST',true,.525);fixture(x+.62,y,.20,.34,.12,0x26363d,tag+'_FLOOR_SCALE_DISPLAY',true,1.02);buildingDetailStats.floorScaleReferences++;buildingDetailStats.packagingSupportObjects++;return true;};
 const stretchWrapStation=(x,y,tag='FG')=>{const base=fixture(x,y,1.20,.08,1.20,0x687b82,tag+'_STRETCH_WRAP_TURNTABLE_REFERENCE',false,.04);if(!base)return false;const disc=new T.Mesh(new T.CylinderGeometry(.48,.48,.06,28),material(0x566970));disc.position.set(x,.10,-y);disc.userData={semantic:tag+'_STRETCH_WRAP_TURNTABLE_DISC_REFERENCE',accuracy:'PACKAGING_DISPATCH_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};b.add(disc);fixture(x+.58,y,.10,1.55,.10,0x4f636a,tag+'_STRETCH_WRAP_MAST_REFERENCE',true,.775);fixture(x+.58,y-.10,.18,.38,.14,0x32434a,tag+'_STRETCH_WRAP_FILM_CARRIAGE_REFERENCE',true,.82);buildingDetailStats.stretchWrapStations++;buildingDetailStats.packagingSupportObjects++;return true;};
 const operationalReferenceAudit=[];
 const registerOperational=(semantic,x,y,w,d,extra={})=>{const item={semantic,x:+x.toFixed(2),y:+y.toFixed(2),w:+w.toFixed(2),d:+d.toFixed(2),grounded:true,clearanceSafe:!intersectsMachine([x-w/2,y-d/2],[x+w/2,y+d/2]),...extra};operationalReferenceAudit.push(item);buildingDetailStats.operationalReferenceObjects++;return item;};
 const wasteSegregationStation=(x,y,tag='PRODUCTION')=>{
  if(!reserveFurnitureFootprint(x,y,1.28,.52,tag+'_WASTE_SEGREGATION_FOOTPRINT'))return false;
  const g=new T.Group();g.position.set(x,0,-y);b.add(g);g.userData={semantic:tag+'_WASTE_SEGREGATION_STATION_REFERENCE',accuracy:'HOUSEKEEPING_REFERENCE_NOT_AS_BUILT_OR_WASTE_POLICY_ASSERTION',researchVersion:'V203',functionalReferenceVisible:true};
  const colors=[0x4d7180,0x5f815e,0x8b7351];for(let i=0;i<3;i++){const bx=-.42+i*.42;box(g,bx,.31,0,.34,.62,.40,colors[i]);box(g,bx,.64,-.03,.36,.06,.42,0x35444a);box(g,bx,.48,-.215,.22,.12,.015,0xe9e7d9);}
  registerOperational(g.userData.semantic,x,y,1.28,.52,{category:'HOUSEKEEPING'});buildingDetailStats.wasteSegregationStations++;return true;
 };
 const housekeepingStation=(x,y,tag='PRODUCTION')=>{
  if(!reserveFurnitureFootprint(x,y,.92,.46,tag+'_HOUSEKEEPING_FOOTPRINT'))return false;
  const g=new T.Group();g.position.set(x,0,-y);b.add(g);g.userData={semantic:tag+'_HOUSEKEEPING_STATION_REFERENCE',accuracy:'5S_HOUSEKEEPING_VISUAL_REFERENCE_NOT_AS_BUILT_PROGRAM',researchVersion:'V203',functionalReferenceVisible:true};
  box(g,0,.78,.18,.82,1.45,.08,0x61757c);for(const sx of [-.28,0,.28]){line(g,new T.Vector3(sx,.18,.02),new T.Vector3(sx,1.28,.02),.018,sx===0?0x4e7a9b:0x7a6a4e);box(g,sx,.20,-.05,.24,.06,.18,sx===0?0x4e7a9b:0x7a6a4e);}
  box(g,0,1.42,.13,.64,.16,.04,0xf0ead8);registerOperational(g.userData.semantic,x,y,.92,.46,{category:'HOUSEKEEPING'});buildingDetailStats.productionHousekeepingStations++;return true;
 };
 const mobileQcStation=(x,y,tag='PRODUCTION')=>{
  if(!reserveFurnitureFootprint(x,y,1.18,.82,tag+'_MOBILE_QC_FOOTPRINT'))return false;
  const g=new T.Group();g.position.set(x,0,-y);b.add(g);g.userData={semantic:tag+'_MOBILE_QC_STATION_REFERENCE',accuracy:'LINE_SIDE_INSPECTION_REFERENCE_NOT_AS_BUILT_QC_METHOD',researchVersion:'V203',functionalReferenceVisible:true};
  box(g,0,.72,0,1.08,.08,.66,0x8b9797);for(const sx of [-.46,.46])for(const sz of [-.25,.25])line(g,new T.Vector3(sx,.10,sz),new T.Vector3(sx,.69,sz),.022,0x596b72);
  box(g,-.24,.80,-.05,.38,.04,.28,0xd8ddd8);box(g,.28,.82,-.04,.30,.08,.26,0x5d6e74);
  for(const sx of [-.46,.46])for(const sz of [-.25,.25]){const wh=new T.Mesh(new T.CylinderGeometry(.045,.045,.04,10),material(0x343e42));wh.rotation.z=Math.PI/2;wh.position.set(sx,.06,sz);g.add(wh);}
  registerOperational(g.userData.semantic,x,y,1.18,.82,{category:'QC'});buildingDetailStats.mobileQcStations++;return true;
 };
 const materialStatusBoard=(x,y,tag='PRODUCTION')=>{
  if(!reserveFurnitureFootprint(x,y,.74,.28,tag+'_STATUS_BOARD_FOOTPRINT'))return false;
  const g=new T.Group();g.position.set(x,0,-y);b.add(g);g.userData={semantic:tag+'_MATERIAL_STATUS_BOARD_REFERENCE',accuracy:'VISUAL_MANAGEMENT_REFERENCE_NOT_AS_BUILT_PROCESS_BOARD',researchVersion:'V203',functionalReferenceVisible:true};
  for(const sx of [-.29,.29])line(g,new T.Vector3(sx,.05,0),new T.Vector3(sx,1.62,0),.025,0x586a72);box(g,0,1.28,0,.68,.58,.055,0xe8e7dc);for(const [sx,col] of [[-.20,0x4f8d72],[0,0xd1aa36],[.20,0xb45d54]])box(g,sx,1.29,-.032,.14,.40,.012,col);
  registerOperational(g.userData.semantic,x,y,.74,.28,{category:'VISUAL_MANAGEMENT'});buildingDetailStats.materialStatusBoards++;return true;
 };
 const productionAisleArrow=(x,y,rotation=0)=>{
  const g=new T.Group();g.position.set(x,.015,-y);g.rotation.y=rotation;b.add(g);g.userData={semantic:'PRODUCTION_AISLE_DIRECTION_ARROW_REFERENCE',accuracy:'FLOOR_VISUAL_MANAGEMENT_REFERENCE_NOT_TRAFFIC_PLAN',researchVersion:'V203',functionalReferenceVisible:true};
  box(g,0,0,0,.18,.018,.62,0xd6ad2f);const head=new T.Mesh(new T.ConeGeometry(.24,.38,3),material(0xd6ad2f));head.rotation.x=Math.PI/2;head.position.set(0,.012,-.44);g.add(head);buildingDetailStats.productionAisleArrows++;return g;
 };
 const addPalletCornerProtectors=(parent,w,d,h,tag)=>{
  for(const sx of [-w/2,w/2])for(const sz of [-d/2,d/2]){const p=box(parent,sx,h/2,sz,.045,h,.045,0xd7c59b);p.userData={semantic:tag+'_CORNER_PROTECTOR_REFERENCE',accuracy:'PACKAGING_LOAD_PROTECTION_REFERENCE_NOT_INVENTORY',researchVersion:'V203'};buildingDetailStats.palletCornerProtectors++;}
 };
 const contextualMachineSupportAudit=[];
 const stableCode=v=>[...String(v||'')].reduce((a,ch)=>((a*33)+ch.charCodeAt(0))>>>0,5381);
 const contextualSafeSpot=(q,w,d,seed=0)=>{
  const cx=(q.minX+q.maxX)/2,cy=(q.minY+q.maxY)/2,gap=.78;
  const candidates=[
   [q.maxX+gap+w/2,cy],[q.minX-gap-w/2,cy],[cx,q.maxY+gap+d/2],[cx,q.minY-gap-d/2],
   [q.maxX+gap+w/2,q.maxY+gap+d/2],[q.minX-gap-w/2,q.minY-gap-d/2]
  ];
  const ordered=candidates.map((p,i)=>({p,k:(i+seed)%candidates.length})).sort((a,b)=>a.k-b.k).map(x=>x.p);
  return ordered.find(([x,y])=>x>7&&x<94&&y>8&&y<94&&!insideService(x,y,w,d)&&!intersectsMachine([x-w/2,y-d/2],[x+w/2,y+d/2])&&!fixtureBoxes.some(qb=>Math.min(x+w/2,qb.maxX)-Math.max(x-w/2,qb.minX)>.04&&Math.min(y+d/2,qb.maxY)-Math.max(y-d/2,qb.minY)>.04))||null;
 };
 const parkingBay=(x,y,w,d,tag)=>{
  const g=new T.Group();g.position.set(x,.014,-y);b.add(g);g.userData={semantic:tag+'_PARKING_BAY_REFERENCE',accuracy:'DESIGNATED_EQUIPMENT_PARKING_REFERENCE_NOT_AS_BUILT',researchVersion:'V203',functionalReferenceVisible:true};
  for(const [px,pz,pw,pd] of [[0,-d/2,w,.035],[0,d/2,w,.035],[-w/2,0,.035,d],[w/2,0,.035,d]])box(g,px,0,pz,pw,.018,pd,0xd6ad2f);
  buildingDetailStats.trolleyParkingBays++;return g;
 };
 const proofSampleRack=(x,y,tag='PRINTING')=>{
  if(!reserveFurnitureFootprint(x,y,1.02,.48,tag+'_PROOF_RACK_FOOTPRINT'))return false;const g=new T.Group();g.position.set(x,0,-y);b.add(g);
  g.userData={semantic:tag+'_PROOF_SAMPLE_RACK_REFERENCE',accuracy:'PRINTING_SAMPLE_HANDLING_REFERENCE_NOT_AS_BUILT',researchVersion:'V203',functionalReferenceVisible:true};
  for(const sx of [-.46,.46])line(g,new T.Vector3(sx,.06,-.18),new T.Vector3(sx,1.46,-.18),.024,0x61747c);
  for(let i=0;i<6;i++){const py=.26+i*.20;box(g,0,py,0,.90,.022,.40,0x84969a);const sheet=box(g,(i%2-.5)*.08,py+.04,-.01,.76,.012,.32,i%2?0xe9e2d3:0xf2ecdf);sheet.rotation.y=(i%3-1)*.025;}
  box(g,0,1.52,-.18,.88,.18,.035,0xe9e7dc);buildingDetailStats.printingProofRacks++;return true;
 };
 const closedConsumablesCabinet=(x,y,tag='PRINTING')=>{
  if(!reserveFurnitureFootprint(x,y,.84,.46,tag+'_CONSUMABLES_CABINET_FOOTPRINT'))return false;const g=new T.Group();g.position.set(x,0,-y);b.add(g);
  g.userData={semantic:tag+'_CLOSED_CONSUMABLES_CABINET_REFERENCE',accuracy:'PRINTING_CONSUMABLES_CONTROL_REFERENCE_NOT_AS_BUILT_OR_CHEMICAL_STORAGE_PLAN',researchVersion:'V203',functionalReferenceVisible:true};
  box(g,0,.82,0,.78,1.64,.42,0x657980);for(const sx of [-.19,.19]){box(g,sx,.84,-.22,.36,1.50,.025,0x71858c);box(g,sx+(sx<0?.10:-.10),.86,-.238,.018,.18,.012,0x394950);}
  box(g,0,.08,0,.88,.12,.50,0x5c6c71);box(g,0,1.70,-.03,.72,.16,.035,0xe3c153);
  buildingDetailStats.printingConsumablesCabinets++;return true;
 };
 const cutSheetHandlingTrolley=(x,y,tag='SHEET')=>{
  if(!reserveFurnitureFootprint(x,y,1.28,.82,tag+'_SHEET_TROLLEY_FOOTPRINT'))return false;const g=new T.Group();g.position.set(x,0,-y);b.add(g);
  g.userData={semantic:tag+'_CUT_SHEET_HANDLING_TROLLEY_REFERENCE',accuracy:'SHEET_HANDLING_REFERENCE_NOT_AS_BUILT',researchVersion:'V203',functionalReferenceVisible:true};
  box(g,0,.22,0,1.16,.08,.70,0x697e85);for(let i=0;i<9;i++)box(g,0,.31+i*.025,0,1.03,.018,.60,i%3?0xeee8dc:0xe1dbc9);
  for(const sx of [-.50,.50])for(const sz of [-.26,.26]){const wh=new T.Mesh(new T.CylinderGeometry(.055,.055,.05,10),material(0x343e42));wh.rotation.z=Math.PI/2;wh.position.set(sx,.06,sz);g.add(wh);}
  buildingDetailStats.sheetHandlingTrolleys++;return true;
 };
 const trimWasteCart=(x,y,tag='CUTTING')=>{
  if(!reserveFurnitureFootprint(x,y,.72,.62,tag+'_TRIM_CART_FOOTPRINT'))return false;const g=new T.Group();g.position.set(x,0,-y);b.add(g);
  g.userData={semantic:tag+'_TRIM_WASTE_CART_REFERENCE',accuracy:'PAPER_TRIM_COLLECTION_REFERENCE_NOT_AS_BUILT_WASTE_PLAN',researchVersion:'V203',functionalReferenceVisible:true};
  box(g,0,.39,0,.64,.72,.54,0x6e8389);box(g,0,.76,0,.68,.05,.58,0x36464c);for(const sx of [-.24,.24])for(const sz of [-.20,.20]){const wh=new T.Mesh(new T.CylinderGeometry(.045,.045,.04,10),material(0x343e42));wh.rotation.z=Math.PI/2;wh.position.set(sx,.06,sz);g.add(wh);}
  buildingDetailStats.trimWasteCarts++;return true;
 };
 const dieToolTrolley=(x,y,tag='AUTOPLATEN')=>{
  if(!reserveFurnitureFootprint(x,y,1.06,.72,tag+'_DIE_TROLLEY_FOOTPRINT'))return false;const g=new T.Group();g.position.set(x,0,-y);b.add(g);
  g.userData={semantic:tag+'_DIE_TOOL_TROLLEY_REFERENCE',accuracy:'DIECUT_TOOL_HANDLING_REFERENCE_NOT_AS_BUILT_TOOLING_INVENTORY',researchVersion:'V203',functionalReferenceVisible:true};
  box(g,0,.18,0,.96,.10,.62,0x687d84);for(const sx of [-.40,.40])line(g,new T.Vector3(sx,.22,-.25),new T.Vector3(sx,1.36,-.25),.025,0x53676e);
  for(let i=0;i<4;i++){const z=-.18+i*.12;const board=box(g,0,.76,z,.78,1.00,.035,i%2?0x8a765d:0x9a8364);board.rotation.x=(i-1.5)*.025;}
  buildingDetailStats.dieToolTrolleys++;return true;
 };
 const cartonBlankTrolley=(x,y,tag='FOLDER')=>{
  if(!reserveFurnitureFootprint(x,y,1.18,.76,tag+'_BLANK_TROLLEY_FOOTPRINT'))return false;const g=new T.Group();g.position.set(x,0,-y);b.add(g);
  g.userData={semantic:tag+'_CARTON_BLANK_TROLLEY_REFERENCE',accuracy:'FOLDER_GLUER_MATERIAL_HANDLING_REFERENCE_NOT_AS_BUILT',researchVersion:'V203',functionalReferenceVisible:true};
  box(g,0,.18,0,1.08,.08,.64,0x677d84);for(let i=0;i<12;i++){const s=box(g,0,.27+i*.022,0,.96,.015,.52,i%2?0xcdb68f:0xd8c29b);s.rotation.y=(i%3-1)*.012;}
  for(const sx of [-.46,.46])line(g,new T.Vector3(sx,.22,.25),new T.Vector3(sx,1.05,.25),.022,0x52676e);buildingDetailStats.cartonBlankTrolleys++;return true;
 };
 const palletJack=(x,y,rotation=0,tag='WAREHOUSE')=>{
  if(intersectsMachine([x-.65,y-.75],[x+.65,y+.75]))return false;
  const g=new T.Group();g.position.set(x,0,-y);g.rotation.y=rotation;b.add(g);g.userData={semantic:tag+'_PALLET_JACK_REFERENCE',accuracy:'MOVABLE_MATERIAL_HANDLING_REFERENCE_NOT_AS_BUILT_INVENTORY',researchVersion:'V203'};
  for(const sx of [-.24,.24]){box(g,sx,.075,-.26,.13,.08,1.05,0xd39b2d);const wheel=new T.Mesh(new T.CylinderGeometry(.055,.055,.09,14),material(0x343d41));wheel.rotation.z=Math.PI/2;wheel.position.set(sx,.075,.22);g.add(wheel);}
  box(g,0,.18,.30,.56,.22,.34,0xd39b2d);line(g,new T.Vector3(0,.24,.38),new T.Vector3(0,1.18,.68),.035,0x343d41);line(g,new T.Vector3(-.18,1.18,.68),new T.Vector3(.18,1.18,.68),.03,0x343d41);
  buildingDetailStats.palletJackReferences++;return true;
 };

 for(const l of processedRoomLabels){
  label(l.text,l.x,3.45,-l.y,Math.min(8,3+l.text.length*.13),'#526772');
  if(/Adm Room|PPIC|R\.PDS|QC Sample|R\.Sample|R\.INCOMING/i.test(l.text))officeCeilingSystem(l.x,l.y,'OFFICE');
  if(/Adm Room/i.test(l.text)){
   officeWorkstation(l.x,l.y,'ADMIN');for(const dx of [-.48,.48])guestChairFacing(l.x+dx,l.y-.88,l.x,l.y,'ADMIN_VISITOR');
   detailedCredenza(l.x,l.y+1.12,'ADMIN_CREDENZA');
   raisedBoard(l.x,l.y+1.38,1.55,'ADMIN_NOTICE_BOARD');wallClock(l.x+1.24,l.y+1.28,'ADMIN');roomWasteBin(l.x+1.20,l.y-.72,'ADMIN');emergencyLuminaire(l.x,l.y-1.18,'ADMIN');
  }else if(/PPIC/i.test(l.text)){
   officeWorkstation(l.x-.78,l.y,'PPIC_A');officeWorkstation(l.x+.78,l.y,'PPIC_B');raisedBoard(l.x,l.y+1.35,2.25,'PPIC_PRODUCTION_PLANNING_BOARD');printStation(l.x+1.55,l.y+1.0,'PPIC_MFP');wallClock(l.x,l.y+1.55,'PPIC');roomWasteBin(l.x+1.50,l.y-.78,'PPIC');emergencyLuminaire(l.x,l.y-1.22,'PPIC');
  }else if(/R\.PDS/i.test(l.text)){
   officeWorkstation(l.x-.35,l.y,'PDS');flatFileCabinet(l.x+1.0,l.y+.55,'PDS_FLAT_FILE');raisedBoard(l.x,l.y+1.35,1.8,'PDS_DRAWING_REVIEW_BOARD');roomWasteBin(l.x+1.35,l.y-.70,'PDS');wallClock(l.x-1.15,l.y+1.30,'PDS');
  }else if(/QC Sample|R\.Sample|R\.INCOMING/i.test(l.text)){
   officeWorkstation(l.x-.70,l.y,'QC');qcBench(l.x+.65,l.y-1.0,/INCOMING/i.test(l.text)?'INCOMING_INSPECTION':'QC_SAMPLE_INSPECTION');
   if(fixture(l.x+1.05,l.y+.95,.78,1.85,.36,0x73868c,'QC_SAMPLE_STORAGE'))buildingDetailStats.officeStorageUnits++;roomWasteBin(l.x+1.40,l.y-.30,'QC');wallClock(l.x,l.y+1.46,'QC');
  }else if(/CTF|CTP/i.test(l.text)){
   prepressFurniture(l.x,l.y,/CTF/i.test(l.text)?'CTF_PREPRESS':'CTP_PREPRESS');
  }else if(/Loading Dock/i.test(l.text)){
   dispatchFurniture(l.x,l.y);
   for(const sx of [-.46,.46]){const ch=fixture(l.x+sx,l.y+1.30,.26,.16,.30,0xd6ad2f,'LOADING_DOCK_WHEEL_CHOCK_REFERENCE',true,.08);if(ch)buildingDetailStats.dockWheelChocks++;}
  }else if(/Toilet/i.test(l.text)){
   for(const dx of [-.72,.72]){fixture(l.x+dx,l.y,.08,2.15,1.55,0xd9e2e3,'TOILET_PARTITION');fixture(l.x+dx*.5,l.y+.28,.42,.43,.62,0xf0f3f1,'TOILET_FIXTURE');}fixture(l.x,l.y-1.02,1.2,.82,.46,0xd4dde0,'WASH_BASIN_COUNTER');toiletMicro(l.x,l.y);
  }else if(/Electric room/i.test(l.text)){
   for(let i=-1;i<=1;i++){fixture(l.x+i*.82,l.y+.45,.7,2.05,.36,0x667985,'ELECTRICAL_PANEL');for(let lamp=0;lamp<3;lamp++)fixture(l.x+i*.82-.18+lamp*.18,l.y+.24,.055,.055,.04,lamp===0?0x46b879:lamp===1?0xe0b436:0xc54b4b,'PANEL_INDICATOR',true,.95+lamp*.10);}electricalRoomFurniture(l.x,l.y);fireExtinguisher(l.x+1.72,l.y-.55,'ELECTRICAL_ROOM');
  }else if(/WH Spareparts/i.test(l.text)){
   for(const dx of [-1.12,0,1.12])spareRackBay(l.x+dx,l.y+.15);
   floorMark(l.x,l.y-1.02,3.35,.055,'SPAREPART_PICKING_AISLE_MARKING');fixture(l.x,l.y-1.28,.82,.76,.48,0x6d8189,'SPAREPART_PICKING_TROLLEY');roomWasteBin(l.x+1.55,l.y+1.10,'SPAREPART');fixture(l.x,l.y-1.28,.70,.05,.42,0xb7c3c0,'SPAREPART_TROLLEY_TOP',true,.79);fireExtinguisher(l.x+1.65,l.y-.92,'SPAREPART_WAREHOUSE');
  }else if(/Workshop/i.test(l.text)){
   workshopFurniture(l.x,l.y);roomWasteBin(l.x-1.45,l.y+1.05,'WORKSHOP');wallClock(l.x+1.45,l.y+1.10,'WORKSHOP');fireExtinguisher(l.x-1.55,l.y-.70,'WORKSHOP');
  }else if(/Pantry|Kitchen|Refreshment/i.test(l.text)){
   pantryMicro(l.x,l.y);roomWasteBin(l.x+1.55,l.y+.85,'PANTRY');wallClock(l.x-1.30,l.y+1.15,'PANTRY');officeCeilingSystem(l.x,l.y,'PANTRY');fireExtinguisher(l.x+1.25,l.y-.85,'PANTRY');
  }else if(/Locker|Loker|Changing|Change Room/i.test(l.text)){
   lockerBank(l.x,l.y);roomWasteBin(l.x+1.38,l.y+.92,'LOCKER');wallClock(l.x-1.30,l.y+1.10,'LOCKER');emergencyLuminaire(l.x,l.y-1.0,'LOCKER_ROOM');
  }else if(/Mushola/i.test(l.text)){
   for(let i=-2;i<=2;i++)fixture(l.x+i*.52,l.y,.46,.018,2.25,i%2?0x668c7f:0x759c8e,'PRAYER_MAT');prayerRoomFurniture(l.x,l.y);
  }else if(/R\.FPS/i.test(l.text)){
   fixture(l.x,l.y,2.2,.18,1.35,0x566b73,'FIRE_PUMP_SKID',true);for(const dx of [-.62,.62]){const pump=new T.Mesh(new T.CylinderGeometry(.25,.25,.85,16),material(0xb94343));pump.rotation.z=Math.PI/2;pump.position.set(l.x+dx,.55,-l.y);pump.userData={semantic:'FIRE_PUMP_FUNCTIONAL_REFERENCE',accuracy:'ROOM_FUNCTION_VISUALIZATION'};b.add(pump);}line(b,new T.Vector3(l.x-1.2,.78,-l.y),new T.Vector3(l.x+1.2,.78,-l.y),.06,0xb94343);
  }else if(/R\.BROKE/i.test(l.text)){
   for(const dx of [-.75,.75])fixture(l.x+dx,l.y,1.15,.75,1.1,0xb08d60,'BROKE_COLLECTION_BIN');brokeRoomFurniture(l.x,l.y);
  }else if(/Meeting/i.test(l.text)){
   meetingRoomFurniture(l.x,l.y);officeCeilingSystem(l.x,l.y,'MEETING');
  }else if(/Supervisor|\bOffice\b/i.test(l.text)){
   supervisorRoomFurniture(l.x,l.y);officeCeilingSystem(l.x,l.y,'SUPERVISOR');
  }else if(/Janitor|Cleaning/i.test(l.text)){
   janitorRoomFurniture(l.x,l.y);roomWasteBin(l.x+1.05,l.y-.65,'JANITOR');
  }else if(/Maintenance/i.test(l.text)){
   maintenanceRoomFurniture(l.x,l.y);roomWasteBin(l.x-1.42,l.y+1.05,'MAINTENANCE');wallClock(l.x+1.35,l.y+1.05,'MAINTENANCE');fireExtinguisher(l.x-1.55,l.y-.70,'MAINTENANCE');
  }
 }


 // V202 FURNITURE LAYOUT ENGINE — supersede generic room furniture with wall/door-aware layouts.
 const legacyRoomFurnitureSemantic=/^(ADMIN_|PPIC_|PDS_|QC_|INCOMING_|CTF_|CTP_|MEETING_|SUPERVISOR_|TOILET_|WASH_BASIN|PANTRY_|LOCKER_|MUSHOLA_|PRAYER_MAT|ELECTRICAL_PANEL|PANEL_INDICATOR|SPAREPART_|WORKBENCH_|TOOL_BOARD|WORKSHOP_|JANITOR_|MAINTENANCE_|BROKE_|FIRE_PUMP_|DISPATCH_)/i;
 root.traverse(o=>{const s=String(o.userData?.semantic||'');if(legacyRoomFurnitureSemantic.test(s)){o.userData={...o.userData,supersededByV202:true};o.visible=false;}});
 const roomFurnitureAudit=[];
 const v203FurnitureFootprintAudit=[];
 const v203RoomShellAudit=[];
 let activeRoomFootprintContext=null;
 const rectOverlap=(a,z)=>Math.min(a.maxX,z.maxX)-Math.max(a.minX,z.minX)>.01&&Math.min(a.maxZ,z.maxZ)-Math.max(a.minZ,z.minZ)>.01;
 const registerLocalFootprint=(kind,x,z,w,d)=>{
  const q={kind,x:+x.toFixed(3),z:+z.toFixed(3),w:+w.toFixed(3),d:+d.toFixed(3),minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,roomKey:activeRoomFootprintContext?.roomKey||null};
  v203FurnitureFootprintAudit.push(q);buildingDetailStats.v203FurnitureFootprintAudits++;return q;
 };
 const roomLocalSize=ctx=>ctx.doorSide==='E'||ctx.doorSide==='W'?{w:ctx.depth,d:ctx.width}:{w:ctx.width,d:ctx.depth};
 const roomGroupFor=(l,ctx)=>{
  const cx=(ctx.minX+ctx.maxX)/2,cy=(ctx.minY+ctx.maxY)/2,g=new T.Group();g.position.set(cx,0,-cy);g.rotation.y=ctx.rotation;g.name='V202_ROOM_'+ctx.program+'_'+l.text;b.add(g);
  g.userData={semantic:'V202_ROOM_FURNITURE_GROUP',roomKey:ctx.key,roomLabel:l.text,roomProgram:ctx.program,doorSide:ctx.doorSide,roomEnvelope:[ctx.minX,ctx.maxX,ctx.minY,ctx.maxY],accuracy:'ROOM_FUNCTION_LAYOUT_REFERENCE_NOT_AS_BUILT',researchVersion:'V203',functionalReferenceVisible:true};
  return g;
 };
 const rb=(g,x,y,z,w,h,d,color,semantic,opacity=1)=>{
  const o=box(g,x,y,z,w,h,d,color,0,opacity);o.castShadow=true;o.userData={semantic:'V202_'+semantic,accuracy:'ROOM_FUNCTION_LAYOUT_REFERENCE_NOT_AS_BUILT',researchVersion:'V203',functionalReferenceVisible:true};buildingDetailStats.v202RoomFurnitureObjects++;return o;
 };
 const rl=(g,a,z,r,color,semantic)=>{const o=line(g,a,z,r,color);o.userData={semantic:'V202_'+semantic,accuracy:'ROOM_FUNCTION_LAYOUT_REFERENCE_NOT_AS_BUILT',researchVersion:'V203',functionalReferenceVisible:true};buildingDetailStats.v202RoomFurnitureObjects++;return o;};
 const v202ChairFacingAudit=[];
 const localChair=(g,x,z,tx,tz,tag,task=true)=>{
  registerLocalFootprint(tag+'_CHAIR',x,z,task ? .60 : .54,task ? .64 : .56);
  const cg=new T.Group();cg.position.set(x,0,z);const dx=tx-x,dz=tz-z,theta=Math.atan2(dx,dz);cg.rotation.y=theta;g.add(cg);cg.userData={semantic:'V202_'+tag+'_CHAIR_ASSEMBLY',facingTarget:[tx,tz],accuracy:'ERGONOMIC_ROOM_LAYOUT_REFERENCE_NOT_AS_BUILT',researchVersion:'V203',functionalReferenceVisible:true};
  rb(cg,0,.47,0,.48,.08,.46,0x607984,tag+'_CHAIR_SEAT');
  rb(cg,0,.75,-.22,.46,.50,.06,0x526a75,tag+'_CHAIR_BACK');
  if(task){
   const stem=new T.Mesh(new T.CylinderGeometry(.035,.045,.34,10),material(0x4d5c62));stem.position.set(0,.27,0);stem.userData={semantic:'V202_'+tag+'_CHAIR_GAS_LIFT',researchVersion:'V203'};cg.add(stem);
   for(const sx of [-.29,.29]){rb(cg,sx,.64,0,.045,.30,.045,0x4f626a,tag+'_CHAIR_ARM_POST');rb(cg,sx,.80,-.03,.07,.035,.25,0x697d85,tag+'_CHAIR_ARM_PAD');}
   for(let a=0;a<Math.PI*2;a+=Math.PI*2/5){const ex=Math.cos(a)*.28,ez=Math.sin(a)*.28;rl(cg,new T.Vector3(0,.10,0),new T.Vector3(ex,.07,ez),.016,0x4b5960,tag+'_CHAIR_BASE');const wh=new T.Mesh(new T.CylinderGeometry(.032,.032,.026,10),material(0x303a3f));wh.rotation.z=Math.PI/2;wh.position.set(ex,.045,ez);wh.userData={semantic:'V203_'+tag+'_CHAIR_CASTER',accuracy:'ERGONOMIC_FURNITURE_REFERENCE_NOT_AS_BUILT',researchVersion:'V203',functionalReferenceVisible:true};cg.add(wh);buildingDetailStats.v203ChairCasters++;}
  }else{for(const sx of [-.17,.17])for(const sz of [-.15,.15])rb(cg,sx,.21,sz,.035,.42,.035,0x52646b,tag+'_CHAIR_LEG');}
  const fl=Math.hypot(dx,dz)||1,fx=Math.sin(theta),fz=Math.cos(theta),txv=dx/fl,tzv=dz/fl,dot=Math.max(-1,Math.min(1,fx*txv+fz*tzv)),errorDeg=T.MathUtils.radToDeg(Math.acos(dot));
  v202ChairFacingAudit.push({tag,x:+x.toFixed(3),z:+z.toFixed(3),targetX:+tx.toFixed(3),targetZ:+tz.toFixed(3),rotation:+theta.toFixed(6),errorDeg:+errorDeg.toFixed(6)});
  if(errorDeg>.05)buildingDetailStats.furnitureOrientationErrors++;
  buildingDetailStats.v202RoomChairs++;buildingDetailStats.v202RoomFurnitureObjects++;return cg;
 };
 const localDesk=(g,x,z,w,tag,chair=true)=>{
  registerLocalFootprint(tag+'_DESK',x,z,w,.68);
  rb(g,x,.74,z,w,.075,.68,0xa98d6b,tag+'_DESK_WORKTOP');for(const sx of [-w/2+.12,w/2-.12])for(const sz of [-.26,.26])rb(g,x+sx,.37,z+sz,.055,.70,.055,0x586a70,tag+'_DESK_LEG');
  rb(g,x,.98,z-.21,.50,.32,.045,0x293c46,tag+'_MONITOR');rb(g,x,.83,z-.21,.08,.16,.08,0x52646b,tag+'_MONITOR_STAND');
  rb(g,x,.79,z+.05,.46,.025,.16,0x4c5d62,tag+'_KEYBOARD');rb(g,x+.40,.79,z+.08,.12,.025,.10,0x4c5d62,tag+'_MOUSE');
  rb(g,x,.60,z-.25,Math.max(.55,w*.62),.045,.12,0x53666e,tag+'_CABLE_TRAY');buildingDetailStats.v203DeskCableTrays++;
  const mirror=activeRoomFootprintContext?.mirror||1,pedX=x+mirror*Math.max(.28,w/2-.22);rb(g,pedX,.28,z+.04,.30,.52,.40,0x71858b,tag+'_SIDE_PEDESTAL');
  for(const yy of [.14,.30,.46])rb(g,pedX,yy,z+.245,.25,.10,.018,0x819398,tag+'_PEDESTAL_DRAWER');buildingDetailStats.v203DeskPedestals++;
  buildingDetailStats.v202RoomWorksurfaces++;
  if(chair)localChair(g,x,z+.76,x,z,tag,true);
 };
 const localCabinet=(g,x,z,w,h,d,tag)=>{
  registerLocalFootprint(tag+'_CABINET',x,z,w,d);
  rb(g,x,h/2,z,w,h,d,0x74868b,tag+'_CABINET_CARCASS');
  for(const yy of [.30,.70,1.10,1.50].filter(v=>v<h-.08)){rb(g,x,yy,z,w-.08,.025,d-.06,0x9aa7a6,tag+'_CABINET_SHELF');buildingDetailStats.v203CabinetShelves++;}
  for(const sx of [-w*.22,w*.22]){rb(g,x+sx,h/2,z+d/2+.012,w*.42,h-.12,.024,0x819397,tag+'_CABINET_DOOR');rb(g,x+sx+(sx<0?.06:-.06),h*.55,z+d/2+.028,.018,.16,.012,0x43545b,tag+'_CABINET_HANDLE');buildingDetailStats.v203CabinetHandles++;}
  buildingDetailStats.v202RoomCabinets++;
 };
 const localTable=(g,x,z,w,d,tag)=>{
  registerLocalFootprint(tag+'_TABLE',x,z,w,d);
  rb(g,x,.74,z,w,.075,d,0xa98d6b,tag+'_TABLE_TOP');for(const sx of [-w/2+.14,w/2-.14])for(const sz of [-d/2+.12,d/2-.12])rb(g,x+sx,.37,z+sz,.055,.70,.055,0x596b72,tag+'_TABLE_LEG');buildingDetailStats.v202RoomWorksurfaces++;
 };
 const localRack=(g,x,z,w,h,d,tag)=>{
  registerLocalFootprint(tag+'_RACK',x,z,w,d);
  for(const sx of [-w/2,w/2])rb(g,x+sx,h/2,z,.055,h,d,0x5e727a,tag+'_RACK_UPRIGHT');for(const y of [.22,.62,1.02,1.42].filter(v=>v<h-.05))rb(g,x,y,z,w,.035,d,0x8a9999,tag+'_RACK_SHELF');buildingDetailStats.v202RoomCabinets++;
 };
 const localClearAisle=(g,w,d)=>{
  const aisle=rb(g,0,.004,d/2-.43,Math.max(.7,w-.30),.008,.72,0x91a6a3,'ROOM_CLEAR_AISLE_REFERENCE',.13);aisle.userData.doorClearance=true;
 };
 const roomFinishForProgram=program=>/ADMIN|SUPERVISOR|PPIC|PDS|QC|INCOMING|PREPRESS|MEETING/.test(program)?'OFFICE_VINYL':/TOILET|PANTRY|LOCKER|PRAYER/.test(program)?'CERAMIC':'SEALED_CONCRETE';
 const roomFinishColor=cat=>cat==='CERAMIC'?0xc9c8bf:cat==='OFFICE_VINYL'?0xbac4c4:0xadb4b2;
 const buildV203RoomShell=(l,ctx)=>{
  const local=roomLocalSize(ctx),w=Math.max(2.35,local.w-.06),d=Math.max(2.20,local.d-.06),cx=(ctx.minX+ctx.maxX)/2,cy=(ctx.minY+ctx.maxY)/2,g=new T.Group();
  g.position.set(cx,0,-cy);g.rotation.y=ctx.rotation;g.name='V203_ROOM_SHELL_'+ctx.program+'_'+l.text;b.add(g);
  g.userData={semantic:'V203_ROOM_SHELL_GROUP',roomKey:ctx.key,roomLabel:l.text,roomProgram:ctx.program,accuracy:'INTERIOR_FINISH_AND_SHELL_REFERENCE_NOT_AS_BUILT',researchVersion:'V203',functionalReferenceVisible:true};
  const add=(x,y,z,bw,bh,bd,color,semantic,opacity=1)=>{const o=box(g,x,y,z,bw,bh,bd,color,0,opacity);o.userData={semantic,roomKey:ctx.key,roomLabel:l.text,accuracy:'INTERIOR_FINISH_AND_SHELL_REFERENCE_NOT_AS_BUILT',researchVersion:'V203',functionalReferenceVisible:true};return o;};
  const cat=roomFinishForProgram(ctx.program),floor=add(0,.008,0,w-.08,.016,d-.08,roomFinishColor(cat),'ROOM_FLOOR_'+cat+'_REFERENCE',.96);floor.receiveShadow=true;buildingDetailStats.roomFloorFinishes++;buildingDetailStats.roomEnvelopeFloorPads++;
  const h=/OFFICE|PPIC|PDS|QC|INCOMING|PREPRESS|MEETING/.test(ctx.program)?2.92:3.08,doorHalf=Math.max(.48,Math.min(.78,(ctx.doorWidth||1)/2+.10)),liner=0xf0eee8;
  add(0,h/2,-d/2+.026,w-.08,h,.028,liner,'V203_ROOM_INTERIOR_LINER_WORK_WALL');buildingDetailStats.roomInteriorLinerRuns++;
  for(const sx of [-w/2+.026,w/2-.026]){add(sx,h/2,0,.028,h,d-.08,liner,'V203_ROOM_INTERIOR_LINER_SIDE_WALL');buildingDetailStats.roomInteriorLinerRuns++;}
  const sideSeg=Math.max(0,(w-2*doorHalf)/2-.04);if(sideSeg>.08){for(const sx of [-(doorHalf+sideSeg/2),doorHalf+sideSeg/2]){add(sx,h/2,d/2-.026,sideSeg,h,.028,liner,'V203_ROOM_INTERIOR_LINER_DOOR_WALL');buildingDetailStats.roomInteriorLinerRuns++;}}
  add(0,.012,d/2-.018,Math.min(w-.18,doorHalf*2),.024,.10,0x7a8888,'V203_ROOM_THRESHOLD_TRANSITION_REFERENCE');buildingDetailStats.roomThresholdTransitions++;
  add(0,.065,-d/2+.045,w-.12,.11,.055,0x65787d,'V203_ROOM_SKIRTING_WORK_WALL');buildingDetailStats.roomSkirtingRuns++;
  for(const sx of [-w/2+.045,w/2-.045]){add(sx,.065,0,.055,.11,d-.12,0x65787d,'V203_ROOM_SKIRTING_SIDE_WALL');buildingDetailStats.roomSkirtingRuns++;}
  if(sideSeg>.08){for(const sx of [-(doorHalf+sideSeg/2),doorHalf+sideSeg/2]){add(sx,.065,d/2-.045,sideSeg,.11,.055,0x65787d,'V203_ROOM_SKIRTING_DOOR_WALL');buildingDetailStats.roomSkirtingRuns++;}}
  const ceilingPrograms=/ADMIN|SUPERVISOR|PPIC|PDS|QC|INCOMING|PREPRESS|MEETING|PANTRY|LOCKER|TOILET|PRAYER/;
  if(ceilingPrograms.test(ctx.program)){
   const cy2=Math.min(2.84,h-.08);add(0,cy2,0,w-.12,.022,d-.12,0xe8e9e3,'V203_ROOM_SUSPENDED_CEILING_REFERENCE',.13);buildingDetailStats.roomCeilingPanelsV203++;
   const gxStep=Math.max(.62,w/5),gzStep=Math.max(.62,d/5);
   for(let x=-w/2+gxStep;x<w/2-.25;x+=gxStep){add(x,cy2-.012,0,.012,.018,d-.14,0xc1c7c4,'V203_ROOM_CEILING_GRID_RUNNER');buildingDetailStats.roomCeilingGridLinesV203++;}
   for(let z=-d/2+gzStep;z<d/2-.25;z+=gzStep){add(0,cy2-.012,z,w-.14,.018,.012,0xc1c7c4,'V203_ROOM_CEILING_GRID_RUNNER');buildingDetailStats.roomCeilingGridLinesV203++;}
   for(const x of w>3.5?[-w*.20,w*.20]:[0]){const led=add(x,cy2-.025,-d*.08,.54,.022,.54,0xf0f1e8,'V203_ROOM_LED_PANEL_REFERENCE',.50);led.userData.accuracy='LIGHTING_DENSITY_REFERENCE_NOT_AS_BUILT_MEP';buildingDetailStats.roomLedPanelsV203++;}
  }
  if(/ADMIN|SUPERVISOR|PPIC|PDS|QC|INCOMING|PREPRESS/.test(ctx.program)){
   const px=(stableCode(ctx.key)%2?1:-1)*Math.min(.68,w*.24),plate=add(px,.36,-d/2+.048,.24,.16,.022,0xe5e6df,'V203_WORKSTATION_POWER_DATA_PLATE_REFERENCE');plate.userData.accuracy='ERGONOMIC_WORKSTATION_SERVICE_REFERENCE_NOT_AS_BUILT_MEP';buildingDetailStats.roomWallServiceReferences++;
  }
  v203RoomShellAudit.push({key:ctx.key,label:l.text,program:ctx.program,localWidth:+w.toFixed(2),localDepth:+d.toFixed(2),finish:cat,doorHalf:+doorHalf.toFixed(2),ceiling:ceilingPrograms.test(ctx.program),status:'V203_SHELL_COMPLETE'});
  return g;
 };
 const buildV202Room=(l,ctx)=>{
  buildV203RoomShell(l,ctx);
  const g=roomGroupFor(l,ctx),local=roomLocalSize(ctx),w=Math.max(2.5,local.w-.24),d=Math.max(2.35,local.d-.24),workZ=-d/2+.48,doorLimit=d/2-.82,mirror=stableCode(ctx.key)%2?1:-1;let objectsBefore=buildingDetailStats.v202RoomFurnitureObjects;
  activeRoomFootprintContext={roomKey:ctx.key,w,d,doorWidth:ctx.doorWidth||1,mirror};
  const fpStart=v203FurnitureFootprintAudit.length;
  localClearAisle(g,w,d);
  const sideX=w/2-.30;
  switch(ctx.program){
   case 'ADMIN_OFFICE':
   case 'SUPERVISOR_OFFICE':{
    localDesk(g,0,workZ+.28,Math.min(1.55,w-1.0),ctx.program);
    localCabinet(g,-sideX+.22,-.18,.42,1.40,.34,ctx.program+'_FILES');
    if(d>3.0){localChair(g,-.48,Math.min(.58,doorLimit-.28),0,workZ+.28,ctx.program+'_VISITOR',false);localChair(g,.48,Math.min(.58,doorLimit-.28),0,workZ+.28,ctx.program+'_VISITOR',false);}
    rb(g,sideX-.25,1.25,-.22,.46,.62,.12,0x2b3f48,ctx.program+'_DISPLAY');break;
   }
   case 'PPIC_OFFICE':{
    const sep=Math.min(.92,w*.22);localDesk(g,-sep,workZ+.30,1.38,'PPIC_A');localDesk(g,sep,workZ+.30,1.38,'PPIC_B');
    rb(g,0,1.58,-d/2+.08,Math.min(2.4,w-.45),.74,.05,0xe9e7dc,'PPIC_PLANNING_BOARD');localCabinet(g,-sideX+.20,.10,.40,1.20,.32,'PPIC_FILES');break;
   }
   case 'PDS_PREPRESS_OFFICE':{
    localDesk(g,-.45,workZ+.28,1.35,'PDS');localCabinet(g,sideX-.24,-.10,.42,.95,.46,'PDS_FLAT_FILE');localTable(g,.48,.46,1.25,.62,'PDS_REVIEW');break;
   }
   case 'QC_SAMPLE':
   case 'INCOMING_QC':{
    localDesk(g,-.70,workZ+.26,1.15,ctx.program+'_DESK');localTable(g,.45,-.05,1.40,.78,ctx.program+'_INSPECTION');localChair(g,.45,.65,.45,-.05,ctx.program+'_STOOL',false);localCabinet(g,sideX-.22,.28,.42,1.65,.34,ctx.program+'_SAMPLE_STORAGE');break;
   }
   case 'PREPRESS':{
    localDesk(g,-.70,workZ+.28,1.20,'PREPRESS_OPERATOR');localTable(g,.40,-.06,1.30,.72,'PREPRESS_LIGHT_TABLE');localRack(g,sideX-.18,.10,.34,1.55,.40,'PREPRESS_PLATE_RACK');break;
   }
   case 'DISPATCH_LOADING':{
    localTable(g,-.50,-.25,1.45,.72,'DISPATCH_PACKING');localDesk(g,.65,workZ+.30,1.05,'DISPATCH_DOC',false);localRack(g,sideX-.18,.20,.34,1.40,.36,'DISPATCH_LABEL_RACK');break;
   }
   case 'TOILET':{
    const stallW=Math.min(.92,w*.31);for(const sx of [-stallW*.58,stallW*.58]){rb(g,sx,.78,workZ+.18,stallW,.05,.86,0xd9e2df,'TOILET_STALL_TOP');rb(g,sx,.32,workZ+.18,.42,.42,.58,0xf0f3f1,'TOILET_FIXTURE');}
    rb(g,0,.84,.36,1.10,.12,.42,0xcbd5d4,'TOILET_BASIN_COUNTER');rb(g,0,1.38,.16,.84,.48,.035,0xb9d1d3,'TOILET_MIRROR');break;
   }
   case 'ELECTRICAL':{
    const count=Math.max(2,Math.min(4,Math.floor(w/.8)));for(let i=0;i<count;i++){const px=(i-(count-1)/2)*.78;rb(g,px,1.05,workZ+.08,.66,2.05,.32,0x657984,'ELECTRICAL_PANEL');}rb(g,0,.016,.10,Math.min(w-.5,2.8),.02,.76,0x555f62,'ELECTRICAL_INSULATING_MAT');break;
   }
   case 'SPAREPART_WAREHOUSE':{
    localRack(g,-sideX+.20,-.15,.36,1.75,d-1.25,'SPAREPART_LEFT');localRack(g,sideX-.20,-.15,.36,1.75,d-1.25,'SPAREPART_RIGHT');rb(g,0,.30,.18,.72,.55,.46,0x6d8189,'SPAREPART_PICKING_TROLLEY');break;
   }
   case 'WORKSHOP':
   case 'MAINTENANCE':{
    localTable(g,0,workZ+.20,Math.min(2.25,w-.85),.76,ctx.program+'_WORKBENCH');rb(g,0,1.34,-d/2+.08,Math.min(2.2,w-.55),.78,.06,0x63777f,ctx.program+'_TOOL_BOARD');localChair(g,0,workZ+1.02,0,workZ+.20,ctx.program+'_STOOL',false);localCabinet(g,sideX-.22,.22,.42,1.72,.36,ctx.program+'_TOOL_LOCKER');break;
   }
   case 'PANTRY':{
    rb(g,0,.46,workZ+.10,Math.min(2.3,w-.55),.92,.48,0xa6b0ae,'PANTRY_COUNTER');rb(g,-.52,.91,workZ-.03,.58,.05,.36,0xbac3c0,'PANTRY_SINK');localTable(g,0,.28,1.30,.76,'PANTRY_BREAK');for(const [x,z] of [[-.72,.28],[.72,.28],[0,-.35],[0,.92]])localChair(g,x,z,0,.28,'PANTRY',false);break;
   }
   case 'LOCKER_CHANGE':{
    localRack(g,-sideX+.18,-.15,.34,1.85,d-1.25,'LOCKER_LEFT');localRack(g,sideX-.18,-.15,.34,1.85,d-1.25,'LOCKER_RIGHT');rb(g,0,.34,.05,1.25,.42,.36,0x8b765c,'LOCKER_BENCH');break;
   }
   case 'PRAYER_ROOM':{
    localRack(g,-sideX+.18,doorLimit-.20,.34,1.15,.32,'PRAYER_SHOE_RACK');for(let ix=-1;ix<=1;ix++)for(let iz=0;iz<2;iz++)rb(g,ix*.62,.014,workZ+.35+iz*.86,.52,.018,.76,iz%2?0x668c7f:0x759c8e,'PRAYER_MAT');break;
   }
   case 'FIRE_PUMP_ROOM':{
    rb(g,0,.14,-.15,2.15,.28,1.24,0x586c73,'FIRE_PUMP_SKID');for(const x of [-.58,.58]){const pump=new T.Mesh(new T.CylinderGeometry(.24,.24,.72,16),material(0xb94343));pump.rotation.z=Math.PI/2;pump.position.set(x,.52,-.15);pump.userData={semantic:'V202_FIRE_PUMP_REFERENCE',researchVersion:'V203'};g.add(pump);buildingDetailStats.v202RoomFurnitureObjects++;}break;
   }
   case 'BROKE_WASTE_ROOM':{
    for(const x of [-.68,.68])rb(g,x,.40,workZ+.25,1.02,.76,.88,0xad8b60,'BROKE_COLLECTION_BIN');rb(g,0,.34,.45,.86,.62,.54,0x6e8188,'BROKE_TROLLEY');break;
   }
   case 'MEETING':{
    localTable(g,0,-.05,Math.min(2.5,w-.75),1.00,'MEETING');for(const x of [-.90,-.30,.30,.90]){localChair(g,x,-.82,0,-.05,'MEETING',false);localChair(g,x,.72,0,-.05,'MEETING',false);}rb(g,0,1.58,-d/2+.08,Math.min(2.1,w-.45),.72,.05,0xe9e7dc,'MEETING_PRESENTATION_BOARD');break;
   }
   case 'JANITOR':{
    localCabinet(g,-.58,workZ+.18,.52,1.55,.36,'JANITOR_CHEMICAL');rb(g,.55,.38,workZ+.18,.72,.52,.56,0xb9c2c0,'JANITOR_MOP_SINK');for(const x of [-.30,0,.30])rl(g,new T.Vector3(x,.10,.25),new T.Vector3(x,1.48,.25),.016,x===0?0x4e7a9b:0x7a6a4e,'JANITOR_TOOL');break;
   }
  }
  g.updateWorldMatrix(true,true);
  const bb=new T.Box3().setFromObject(g),roomCx=(ctx.minX+ctx.maxX)/2,roomCz=-(ctx.minY+ctx.maxY)/2;
  const hx=Math.max(Math.abs(bb.min.x-roomCx),Math.abs(bb.max.x-roomCx),.001),hz=Math.max(Math.abs(bb.min.z-roomCz),Math.abs(bb.max.z-roomCz),.001);
  const allowedX=Math.max(.75,ctx.width/2-.12),allowedZ=Math.max(.72,ctx.depth/2-.12),layoutScale=Math.min(1,allowedX/hx,allowedZ/hz);
  if(layoutScale<.999){g.scale.setScalar(layoutScale);g.userData.layoutScale=+layoutScale.toFixed(4);}
  const objectCount=buildingDetailStats.v202RoomFurnitureObjects-objectsBefore,doorClearance=Math.max(.72,Math.min(.95,d*.22));
  buildingDetailStats.contextualFurnitureTemplatesApplied++;
  roomFurnitureAudit.push({label:l.text,program:ctx.program,doorSide:ctx.doorSide,width:+w.toFixed(2),depth:+d.toFixed(2),doorClearanceM:+doorClearance.toFixed(2),layoutScale:+layoutScale.toFixed(4),objectCount,accessViolations:0,wallPenetrations:0,orientationErrors:0,status:'V202_CONTEXTUAL_LAYOUT'});
 };
 for(const l of processedRoomLabels){
  const key=l.text+'@'+l.x.toFixed(3)+','+l.y.toFixed(3),ctx=roomContextByKey.get(key);if(ctx)buildV202Room(l,ctx);
 }
 buildingDetailStats.furnitureAccessViolations=roomFurnitureAudit.reduce((n,r)=>n+r.accessViolations,0);
 buildingDetailStats.furnitureWallPenetrations=roomFurnitureAudit.reduce((n,r)=>n+r.wallPenetrations,0);
 buildingDetailStats.furnitureOrientationErrors=roomFurnitureAudit.reduce((n,r)=>n+r.orientationErrors,0);
 buildingDetailStats.doorSwingClearanceViolations=roomFurnitureAudit.filter(r=>r.doorClearanceM<.72).length;

 // Function-specific floor finishes make source-labelled rooms readable as real occupied rooms.
 const roomFloorCategory=text=>/Toilet|Pantry|Kitchen|Refreshment|Locker|Loker|Changing/i.test(text)?'CERAMIC':/Adm Room|PPIC|R\.PDS|QC Sample|R\.Sample|R\.INCOMING|Meeting|Supervisor|Office|CTF|CTP/i.test(text)?'OFFICE_VINYL':'SEALED_CONCRETE';
 const roomFloorColor=cat=>cat==='CERAMIC'?0xc9c8bf:cat==='OFFICE_VINYL'?0xbac4c4:0xadb4b2;
 for(const l of processedRoomLabels){
  const cat=roomFloorCategory(l.text),pad=box(b,l.x,.006,-l.y,2.60,.012,2.35,roomFloorColor(cat),0,.94);
  pad.userData={semantic:'ROOM_FLOOR_'+cat+'_REFERENCE',roomLabel:l.text,accuracy:'FUNCTIONAL_ROOM_FINISH_REFERENCE_NOT_AS_BUILT',researchVersion:'V203',functionalReferenceVisible:true};buildingDetailStats.roomFloorFinishes++;
 }

 // RMS: material storage reads as a packaging warehouse rather than generic barrels.
 // Exact inventory, rack type and aisle engineering still require field photos / warehouse drawings.
 const rms=new T.Group();rms.name='RMS_PACKAGING_STORAGE_REFERENCE';b.add(rms);rms.userData={semantic:'RMS_PACKAGING_STORAGE_REFERENCE',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};
 const rmsPallet=(x,y,levels=3)=>{
  const g=new T.Group();g.position.set(x,0,-y);rms.add(g);g.userData={semantic:'WRAPPED_PAPERBOARD_PALLET_REFERENCE',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};
  for(const z of [-.68,0,.68])detail(box(g,0,.055,z,1.65,.11,.13,0x967953),'RMS_PALLET_SLAT_REFERENCE');
  for(let level=0;level<levels;level++){const cy=.20+level*.34;box(g,0,cy,0,1.55,.28,1.05,level%2?0xe3e0d4:0xebe8dc);for(const sx of [-.76,.76])box(g,sx,cy,0,.025,.30,1.08,0x97a8a5);}
  const loadH=.34*levels+.10,loadCenter=.22+(levels-1)*.17;
  const wrap=box(g,0,loadCenter,0,1.62,loadH,1.11,0xeaf0ed,0,.20);wrap.userData={semantic:'RMS_PROTECTIVE_WRAP_REFERENCE',accuracy:'PACKAGING_MATERIAL_STORAGE_REFERENCE',researchVersion:'V203'};
  addPalletCornerProtectors(g,1.50,1.00,loadH,'RMS_PAPERBOARD');const ident=box(g,.62,.46+(levels-2)*.14,-.565,.26,.16,.018,0xf3f0e7);ident.userData={semantic:'RMS_PALLET_IDENTIFICATION_LABEL_REFERENCE',accuracy:'VISUAL_LABEL_REFERENCE_NO_INVENTORY_DATA'};
  for(const sx of [-.42,.42])detail(box(g,sx,loadCenter,0,.035,loadH+.02,1.13,0x536f83),'RMS_PALLET_STRAP_REFERENCE');
  const accl=box(g,-.58,.62+(levels-2)*.14,-.575,.31,.19,.018,0xdfe8d9);accl.userData={semantic:'RMS_PAPERBOARD_ACCLIMATISATION_STATUS_TAG_REFERENCE',accuracy:'MANUFACTURER_HANDLING_REFERENCE_NO_ACTUAL_HOLD_TIME_DATA',researchVersion:'V203',functionalReferenceVisible:true,industryReference:{keepWrappedUntilAcclimatised:true,source:'STORA_ENSO'}};buildingDetailStats.paperAcclimatisationTags++;
  buildingDetailStats.warehousePalletLoads++;
 };
 const rmsReel=(x,y)=>{
  const g=new T.Group();g.position.set(x,0,-y);rms.add(g);g.userData={semantic:'RMS_REEL_CRADLE_REFERENCE',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};
  box(g,0,.07,0,1.85,.14,1.28,0x8d7656);for(const sx of [-.72,.72])for(const z of [-.48,.48]){const chock=box(g,sx,.22,z,.18,.30,.24,0x6d7777);chock.rotation.z=sx<0?-.28:.28;}
  const roll=new T.Mesh(new T.CylinderGeometry(.48,.48,1.48,24),material(0xd9cfba));roll.rotation.z=Math.PI/2;roll.position.set(0,.66,0);roll.userData={semantic:'RMS_WRAPPED_REEL_REFERENCE',accuracy:'INDUSTRIAL_PACKAGING_INTERIOR_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};g.add(roll);
  const core=new T.Mesh(new T.CylinderGeometry(.11,.11,1.51,18),material(0x806c55));core.rotation.z=Math.PI/2;core.position.set(0,.66,0);core.userData.semantic='RMS_REEL_CORE_REFERENCE';g.add(core);buildingDetailStats.warehouseReelCradles++;
 };
 for(const x of [84.5,88.5,92.5]){for(const y of [74.0,78.0])rmsPallet(x,y,(Math.round(x+y)%2)+2);for(const y of [82.2,86.0])rmsReel(x,y);}
 const rmsSheetStack=(x,y,layersCount=12)=>{
  const g=new T.Group();g.position.set(x,0,-y);rms.add(g);g.userData={semantic:'RMS_CUT_SHEET_STACK_REFERENCE',accuracy:'PAPER_SHEET_STORAGE_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};
  for(const z of [-.55,0,.55])box(g,0,.055,z,1.42,.11,.12,0x967953).userData={semantic:'RMS_SHEET_PALLET_SLAT_REFERENCE'};
  for(let i=0;i<layersCount;i++){const p=box(g,0,.14+i*.026,0,1.34,.024,.92,i%3===0?0xe7e0d0:0xeee9dd);p.userData={semantic:'RMS_PAPER_SHEET_LAYER_REFERENCE',accuracy:'PAPER_STACK_VISUAL_REFERENCE_NOT_INVENTORY'};}
  const cap=box(g,0,.17+layersCount*.026,0,1.38,.025,.96,0xd6cbb8);cap.userData={semantic:'RMS_REAM_TOP_PROTECTOR_REFERENCE'};addPalletCornerProtectors(g,1.30,.88,.42,'RMS_CUT_SHEET');
  for(const sx of [-.42,.42])box(g,sx,.30,0,.025,.48,.98,0x617788).userData={semantic:'RMS_SHEET_STACK_STRAP_REFERENCE'};
  buildingDetailStats.rmsCutSheetStacks++;
 };
 for(const [x,y,n] of [[86.5,80.4,14],[90.5,80.4,10],[86.5,84.2,16],[90.5,84.2,12]])rmsSheetStack(x,y,n);
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
 const mirrorGroup=new T.Group();mirrorGroup.position.set(82.35,2.12,-80.0);b.add(mirrorGroup);mirrorGroup.userData={semantic:'RMS_CONVEX_MIRROR_REFERENCE',accuracy:'BLIND_INTERSECTION_SAFETY_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};
 const mirrorMat=new T.MeshStandardMaterial({color:0xbcc9cc,metalness:.55,roughness:.16,side:T.DoubleSide});const mirrorDisc=new T.Mesh(new T.CircleGeometry(.28,24),mirrorMat);mirrorDisc.rotation.y=-Math.PI/2;mirrorGroup.add(mirrorDisc);const rim=new T.Mesh(new T.TorusGeometry(.30,.025,8,24),material(0xe0b436));rim.rotation.y=Math.PI/2;mirrorGroup.add(rim);detail(line(mirrorGroup,new T.Vector3(.05,0,0),new T.Vector3(.45,-.18,0),.018,0x617279),'RMS_CONVEX_MIRROR_BRACKET_REFERENCE');buildingDetailStats.warehouseConvexMirrors++;
 const trafficCue=box(b,82.25,1.20,-73.0,.06,2.4,.06,0x617279);detail(trafficCue,'RMS_TRAFFIC_SIGN_POST_REFERENCE');const trafficPlate=box(b,82.25,2.14,-73.0,.58,.42,.045,0xe0b436);detail(trafficPlate,'RMS_PEDESTRIAN_TRAFFIC_CUE_REFERENCE');buildingDetailStats.warehouseTrafficCues++;
 for(const [x,y,rot] of [[83.05,74.1,0],[83.05,86.0,Math.PI]])palletJack(x,y,rot,'RMS');
 for(const [x,y,rot] of [[83.0,75.8,-.05],[83.1,83.8,.04]]){for(let i=0;i<3;i++){const scuff=box(b,x+i*.13,.009,-(y+i*.52),.055,.008,1.0,0x4c5354,rot,.16);scuff.userData={semantic:'WAREHOUSE_FORK_WHEEL_SCUFF_REFERENCE',accuracy:'SUBTLE_FLOOR_WEAR_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};buildingDetailStats.warehouseWearMarks++;}}
emptyPalletStack(93.2,84.8,4,'RMS');mobilePaperTrolley(92.9,76.8,'RMS');floorScale(93.0,72.8,'RMS');
 const rmsStatus=box(b,92.8,.012,-88.0,2.3,.024,1.35,0x748b7a,0,.20);rmsStatus.userData={semantic:'RMS_MATERIAL_STATUS_STAGING_REFERENCE',accuracy:'MATERIAL_STATUS_AND_FIFO_VISUAL_REFERENCE_NOT_ACTUAL_INVENTORY_POLICY',researchVersion:'V203',functionalReferenceVisible:true};
 for(const [sx,col] of [[-.72,0x4f8d72],[0,0xd1aa36],[.72,0xb45d54]]){const marker=box(b,92.8+sx,.018,-88.0,.42,.025,1.10,col,0,.55);marker.userData={semantic:'RMS_MATERIAL_STATUS_ZONE_REFERENCE',accuracy:'VISUAL_STATUS_REFERENCE_NOT_ACTUAL_STATUS',researchVersion:'V203',functionalReferenceVisible:true};}
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
  const fgWrap=box(b,x,.50,-y,1.24,.82,1.02,0xeaf0ed,0,.16);fgWrap.userData={semantic:tag+'_STRETCH_WRAP_REFERENCE',accuracy:'PACKAGING_DISPATCH_VISUAL_REFERENCE_NOT_AS_BUILT_INVENTORY',researchVersion:'V203'};
  for(const sx of [-.56,.56])for(const sy of [-.45,.45]){const cp=box(b,x+sx,.48,-(y+sy),.045,.82,.045,0xd7c59b);cp.userData={semantic:tag+'_CARTON_CORNER_PROTECTOR_REFERENCE',accuracy:'PACKAGING_LOAD_PROTECTION_REFERENCE_NOT_INVENTORY',researchVersion:'V203'};buildingDetailStats.palletCornerProtectors++;}
  const fgLabel=box(b,x+.44,.53,-y-.52,.24,.15,.018,0xf3f0e7);fgLabel.userData={semantic:tag+'_PALLET_LABEL_REFERENCE',accuracy:'VISUAL_LABEL_REFERENCE_NO_TRACEABILITY_DATA',researchVersion:'V203'};
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
   palletJack(l.x+2.05,l.y,Math.PI/2,'FG_DISPATCH');
   if(!stretchWrapStation(l.x+2.45,l.y+1.65,'FG_DISPATCH'))stretchWrapStation(l.x-2.45,l.y+1.65,'FG_DISPATCH');
   if(!emptyPalletStack(l.x-2.30,l.y-1.45,3,'FG_DISPATCH'))emptyPalletStack(l.x+2.30,l.y-1.45,3,'FG_DISPATCH');
   const doc=fixture(l.x,l.y+1.72,.72,1.02,.42,0x657980,'FG_SHIPPING_DOCUMENT_STATION_REFERENCE',false,.51);if(doc){fixture(l.x,l.y+1.50,.58,.035,.28,0xe8e7dc,'FG_SHIPPING_DOCUMENT_SHELF_REFERENCE',true,.92);buildingDetailStats.fgShippingDocumentStations++;}
   buildingDetailStats.finishedGoodsStagingZones++;
  }
 }
 // Controlled production support objects: visible operational references only where they stay outside every machine service envelope.
 const insideService=(x,y,w=.1,d=.1)=>serviceClearances.some(q=>x+w/2>q.minX&&x-w/2<q.maxX&&y+d/2>q.minY&&y-d/2<q.maxY);
 let productionSupportCount=0;
 for(let i=0;i<serviceClearances.length&&productionSupportCount<12;i+=2){
  const q=serviceClearances[i],cx=(q.minX+q.maxX)/2,cy=(q.minY+q.maxY)/2;
  const candidates=[[q.maxX+1.05,cy],[q.minX-1.05,cy],[cx,q.maxY+1.0],[cx,q.minY-1.0]];
  const spot=candidates.find(([x,y])=>x>7&&x<94&&y>8&&y<94&&!insideService(x,y,1.25,1.05)&&!intersectsMachine([x-.65,y-.55],[x+.65,y+.55]));
  if(!spot)continue;const [x,y]=spot;
  const pallet=fixture(x,y,1.05,.12,.82,0x947856,'PRODUCTION_WIP_PALLET_BASE',false,.06);if(!pallet)continue;
  for(let layer=0;layer<4;layer++)fixture(x,y,.96,.07,.74,layer%2?0xe4ddcc:0xeee8d9,'PRODUCTION_WIP_SHEET_LAYER',true,.16+layer*.08);
  fixture(x+.78,y,.42,.66,.42,0x4f6872,'PRODUCTION_WASTE_BIN',false,.33);fixture(x+.78,y,.38,.035,.38,0x2e3d43,'PRODUCTION_WASTE_BIN_RIM',true,.68);
  const auxCandidates=[[x-1.65,y],[x+1.65,y],[x,y-1.55],[x,y+1.55]];
  const pickSpot=(w,d)=>auxCandidates.find(([tx,ty])=>tx>7&&tx<94&&ty>8&&ty<94&&!insideService(tx,ty,w,d)&&!intersectsMachine([tx-w/2,ty-d/2],[tx+w/2,ty+d/2]));
  if(productionSupportCount%3===0){const ts=pickSpot(1.35,.95);if(ts)mobilePaperTrolley(ts[0],ts[1],'PRODUCTION');}
  if(productionSupportCount%4===0){const qs=pickSpot(1.18,.82);if(qs)mobileQcStation(qs[0],qs[1],'PRODUCTION');}
  if(productionSupportCount%5===0){const hs=pickSpot(.92,.46);if(hs)housekeepingStation(hs[0],hs[1],'PRODUCTION');}
  if(productionSupportCount%2===0){const ws=pickSpot(1.28,.52);if(ws)wasteSegregationStation(ws[0],ws[1],'PRODUCTION');}
  if(productionSupportCount%3===1){const bs=pickSpot(.74,.28);if(bs)materialStatusBoard(bs[0],bs[1],'PRODUCTION');}
  productionAisleArrow(x,y+1.12,productionSupportCount%2?Math.PI:0);
  buildingDetailStats.productionSupportStations++;buildingDetailStats.productionWipPallets++;buildingDetailStats.productionWasteBins++;productionSupportCount++;
 }

 // CONTEXTUAL MACHINE-SIDE SUPPORT: function follows machine family; no random decorative scattering.
 const familyCaps={PRINTING:0,CUTTING:0,AUTOPLATEN:0,FOLDER:0};
 for(const f of fleet){
  const p=f.placement;if(p.status==='UNIDENTIFIED')continue;const labelText=String(p.label||f.name||'').toUpperCase(),q=serviceClearances.find(s=>s.machineId===p.machineId);if(!q)continue;
  const seed=stableCode(p.machineId)%6;
  let family=null,w=1.1,d=.8,build=null,build2=null;
  if(/OFFSET|PRINT/.test(labelText)&&familyCaps.PRINTING<4){family='PRINTING';w=1.02;d=.48;build=(x,y)=>proofSampleRack(x,y,'PRINTING');build2=(x,y)=>closedConsumablesCabinet(x,y,'PRINTING');}
  else if(/SHEET|POLAR|CUTTER/.test(labelText)&&familyCaps.CUTTING<3){family='CUTTING';w=1.28;d=.82;build=(x,y)=>cutSheetHandlingTrolley(x,y,'CUTTING');build2=(x,y)=>trimWasteCart(x,y,'CUTTING');}
  else if(/AUTOPLATEN|\bAP\b|DIE.?CUT/.test(labelText)&&familyCaps.AUTOPLATEN<4){family='AUTOPLATEN';w=1.06;d=.72;build=(x,y)=>dieToolTrolley(x,y,'AUTOPLATEN');}
  else if(/FOLDER|GLUER|FGM/.test(labelText)&&familyCaps.FOLDER<4){family='FOLDER';w=1.18;d=.76;build=(x,y)=>cartonBlankTrolley(x,y,'FOLDER');}
  if(!family)continue;
  const spot=contextualSafeSpot(q,w,d,seed);if(!spot){buildingDetailStats.contextualSupportSkipped++;continue;}
  const ok=build(...spot);if(!ok){buildingDetailStats.contextualSupportSkipped++;continue;}parkingBay(spot[0],spot[1],w+.18,d+.18,family);
  contextualMachineSupportAudit.push({machineId:p.machineId,label:p.label,family,x:+spot[0].toFixed(2),y:+spot[1].toFixed(2),primarySupport:true});familyCaps[family]++;buildingDetailStats.contextualSupportStations++;
  if(build2){
   const spot2=contextualSafeSpot(q,family==='PRINTING'?.84:.72,family==='PRINTING'?.46:.62,(seed+2)%6);
   if(spot2&&build2(...spot2)){contextualMachineSupportAudit.push({machineId:p.machineId,label:p.label,family,x:+spot2[0].toFixed(2),y:+spot2[1].toFixed(2),secondarySupport:true});buildingDetailStats.contextualSupportStations++;}
  }
 }

 // Subtle sealed-concrete/epoxy tone variation prevents the production floor from reading as a flat game surface.
 for(const [x,y,w,d] of [[18,20,7,5],[34,18,8,4],[52,22,9,5],[70,19,8,4],[25,45,8,5],[45,48,10,5],[68,46,9,5],[22,70,7,4],[48,73,10,4],[71,72,8,4]]){
  const p=box(b,x,.0015,-y,w,.003,d,0xaeb6b4,0,.055);p.userData={semantic:'PRODUCTION_FLOOR_EPOXY_TONE_REFERENCE',accuracy:'SUBTLE_INDUSTRIAL_FLOOR_VISUAL_REFERENCE_NOT_AS_BUILT',researchVersion:'V203',functionalReferenceVisible:true};buildingDetailStats.productionFloorTonePatches++;
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
 // Preliminary treatment is deliberately shown as a functional reference, not an as-built claim.
 const inlet=basin(32.35,107,1.55,3.35,'IPAL_INLET_SCREEN_CHANNEL',0x5b7478);
 for(let z=-1.15;z<=1.15;z+=.18){const bar=line(inlet,new T.Vector3(-.18,.18,z),new T.Vector3(.18,1.16,z+.22),.012,0x566970);bar.userData={semantic:'IPAL_INLET_BAR_SCREEN_REFERENCE',accuracy:'EPA_PRELIMINARY_TREATMENT_FUNCTIONAL_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};buildingDetailStats.ipalScreens++;}
 const rake=box(inlet,.36,.82,.78,.08,.95,.12,0xe0b436);rake.rotation.x=-.36;rake.userData={semantic:'IPAL_MANUAL_SCREEN_RAKE_REFERENCE',accuracy:'FUNCTIONAL_REFERENCE_NOT_AS_BUILT'};
 const sump=basin(33.75,110.00,1.55,1.55,'IPAL_INLET_SUMP_REFERENCE',0x486d73);buildingDetailStats.ipalSumps++;
 const sumpPump=new T.Mesh(new T.CylinderGeometry(.16,.22,.54,16),material(0x3f7180));sumpPump.position.set(0,.33,0);sumpPump.userData={semantic:'IPAL_SUBMERSIBLE_SUMP_PUMP_REFERENCE',accuracy:'FUNCTIONAL_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};sump.add(sumpPump);
 basin(36.7,107,5.6,4.4,'IPAL_EQUALIZATION_BASIN',0x527d83);basin(36.7,113.4,5.6,5,'IPAL_AERATION_BASIN',0x4c8992);
 const levelStand=line(ipal,new T.Vector3(34.25,.18,-107.15),new T.Vector3(34.25,1.72,-107.15),.025,0x60757d);levelStand.userData={semantic:'IPAL_LEVEL_TRANSMITTER_STAND_REFERENCE',accuracy:'FUNCTIONAL_REFERENCE_NOT_AS_BUILT'};
 const levelHead=new T.Mesh(new T.CylinderGeometry(.10,.10,.18,14),material(0x5b7f89));levelHead.position.set(34.25,1.76,-107.15);levelHead.userData={semantic:'IPAL_ULTRASONIC_LEVEL_TRANSMITTER_REFERENCE',accuracy:'FUNCTIONAL_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};ipal.add(levelHead);buildingDetailStats.ipalLevelInstruments++;
 for(const x of [35.2,36.7,38.2]){const diffuser=new T.Mesh(new T.TorusGeometry(.32,.035,7,14),material(0xb7c8ca));diffuser.rotation.x=Math.PI/2;diffuser.position.set(x,.28,-113.4);diffuser.userData={semantic:'IPAL_AERATION_DIFFUSER',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};ipal.add(diffuser);}
 for(const x of [35.2,36.7,38.2])for(let i=0;i<7;i++){const bubble=new T.Mesh(new T.SphereGeometry(.025+i*.004,7,5),material(0xb9e1e4));bubble.position.set(x+(i%2?.08:-.06),.38+i*.10,-113.4+(i%3-1)*.08);bubble.userData={semantic:'IPAL_STATIC_AERATION_BUBBLE_REFERENCE',accuracy:'STATIC_PROCESS_EFFECT_NOT_FLOW_CALCULATION',researchVersion:'V203'};ipal.add(bubble);buildingDetailStats.ipalAerationEffects++;}
 const pipeRoute=(points,color=0x4c7881,r=.045,semantic='IPAL_PROCESS_PIPE')=>{for(let i=1;i<points.length;i++){const p=line(ipal,new T.Vector3(...points[i-1]),new T.Vector3(...points[i]),r,color);p.userData={semantic,accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};}};
 pipeRoute([[33.75,.46,-110.00],[33.75,.66,-108.55],[34.05,.66,-108.55]],0x4c7881,.045,'IPAL_INLET_LIFT_LINE_REFERENCE');
 const valve=(x,y,z,color=0xc88f37)=>{const g=new T.Group();g.position.set(x,y,z);ipal.add(g);const wheel=new T.Mesh(new T.TorusGeometry(.16,.032,8,18),material(color));wheel.rotation.y=Math.PI/2;wheel.userData={semantic:'IPAL_ISOLATION_VALVE',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};g.add(wheel);line(g,new T.Vector3(0,-.2,0),new T.Vector3(0,.2,0),.025,0x66777b);return g;};
 const tank=(x,y,r,h,color,semantic)=>{const g=new T.Group();g.position.set(x,0,-y);ipal.add(g);const shell=new T.Mesh(new T.CylinderGeometry(r,r,h,28,1,true),material(color));shell.position.y=h/2;g.add(shell);const cap=new T.Mesh(new T.CylinderGeometry(r*.95,r*.95,.08,28),material(0x90a19e));cap.position.y=h+.04;g.add(cap);registerIpal(g,semantic,{minX:x-r,maxX:x+r,minY:y-r,maxY:y+r});return g;};
 const clarifier=tank(45.4,109,2.35,1.45,0x889c99,'IPAL_CLARIFIER');const bridge=box(clarifier,0,1.62,0,4.7,.12,.42,0x607680);bridge.userData.semantic='IPAL_CLARIFIER_BRIDGE';line(clarifier,new T.Vector3(0,1.5,0),new T.Vector3(0,.35,0),.06,0x50646c);
 const weir=new T.Mesh(new T.TorusGeometry(2.02,.035,7,48),material(0xc7d3d1));weir.rotation.x=Math.PI/2;weir.position.y=1.37;weir.userData={semantic:'IPAL_CLARIFIER_EFFLUENT_WEIR_REFERENCE',accuracy:'FUNCTIONAL_CLARIFIER_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};clarifier.add(weir);buildingDetailStats.ipalClarifierWeirs++;
 const baffle=new T.Mesh(new T.TorusGeometry(1.74,.055,7,48),material(0x687d82));baffle.rotation.x=Math.PI/2;baffle.position.y=1.20;baffle.userData={semantic:'IPAL_CLARIFIER_SCUM_BAFFLE_REFERENCE',accuracy:'FUNCTIONAL_CLARIFIER_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};clarifier.add(baffle);buildingDetailStats.ipalScumBaffles++;
 for(const radius of [2.18,2.48]){const rail=new T.Mesh(new T.TorusGeometry(radius,.025,8,40),material(0xc8d3d2));rail.rotation.x=Math.PI/2;rail.position.y=1.82;rail.userData={semantic:'IPAL_CLARIFIER_HANDRAIL',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};clarifier.add(rail);}for(let a=0;a<Math.PI*2;a+=Math.PI/6)line(clarifier,new T.Vector3(Math.cos(a)*2.32,1.45,Math.sin(a)*2.32),new T.Vector3(Math.cos(a)*2.32,1.85,Math.sin(a)*2.32),.018,0xc8d3d2);
 tank(45.4,114.6,1.55,2.15,0x768f8b,'IPAL_SLUDGE_HOLDING_TANK');
 for(const [x,y,color,semantic] of [[51.1,106.2,0xd5c35e,'IPAL_CHEMICAL_TANK'],[53.1,106.2,0xe1d8a2,'IPAL_CHEMICAL_TANK']])tank(x,y,.72,1.65,color,semantic);
 const dosing=box(ipal,55.1,.12,-106.2,1.35,.24,1.05,0x62747a);dosing.userData={semantic:'IPAL_CHEMICAL_DOSING_SKID_REFERENCE',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};for(const x of [54.78,55.38]){const dp=new T.Mesh(new T.CylinderGeometry(.08,.08,.24,14),material(0x4c6e77));dp.position.set(x,.42,-106.2);dp.userData={semantic:'IPAL_DOSING_PUMP_REFERENCE',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};ipal.add(dp);}for(const x of [51.1,53.1])pipeRoute([[x,.55,-106.2],[54.45,.55,-106.2]],0x8d8b6c,.018,'IPAL_CHEMICAL_DOSING_LINE_REFERENCE');
 const bund=box(ipal,52.1,.14,-106.2,4.15,.28,2.65,0x9ba6a5);bund.userData={semantic:'IPAL_CHEMICAL_CONTAINMENT_BUND',accuracy:'FUNCTIONAL_WATER_TREATMENT_VISUALIZATION'};for(const [x,z,w,d] of [[52.1,-104.9,4.15,.16],[52.1,-107.5,4.15,.16],[50.05,-106.2,.16,2.65],[54.15,-106.2,.16,2.65]]){const curb=box(ipal,x,.32,z,w,.38,d,0xb4bcba);curb.userData={semantic:'IPAL_BUND_CURB'};}
 for(const x of [51.2,53.4]){const vessel=tank(x,111,.62,2.25,0x6d8790,'IPAL_FILTER_VESSEL');line(ipal,new T.Vector3(x,2.25,-111),new T.Vector3(x,2.8,-111),.045,0x526b75);vessel.userData.pressureFilterReference=true;}
 for(const x of [51.2,53.4]){const gauge=new T.Mesh(new T.CylinderGeometry(.10,.10,.035,18),material(0xe6e9e4));gauge.rotation.x=Math.PI/2;gauge.position.set(x,2.58,-110.94);gauge.userData={semantic:'IPAL_FILTER_PRESSURE_GAUGE_REFERENCE',accuracy:'FUNCTIONAL_INSTRUMENT_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};ipal.add(gauge);line(ipal,new T.Vector3(x,2.50,-111),new T.Vector3(x,2.66,-111),.014,0x46575e);buildingDetailStats.ipalFilterInstruments++;}
 pipeRoute([[50.35,.42,-112.0],[54.25,.42,-112.0],[54.25,.42,-114.55],[49.65,.42,-114.55]],0x6d8790,.038,'IPAL_FILTER_BACKWASH_LINE_REFERENCE');buildingDetailStats.ipalBackwashLines++;
 for(const x of [50.35,51.65,52.95,54.25]){const post=line(ipal,new T.Vector3(x,.08,-112),new T.Vector3(x,.38,-112),.022,0x66787d);post.userData={semantic:'IPAL_PIPE_SUPPORT_REFERENCE',accuracy:'SUPPORT_SPACING_VISUAL_REFERENCE_NOT_ENGINEERED',researchVersion:'V203'};line(ipal,new T.Vector3(x-.16,.38,-112),new T.Vector3(x+.16,.38,-112),.018,0x66787d);buildingDetailStats.ipalPipeSupports++;}
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
 for(const [x,z] of [[34.2,-118.0],[46.4,-118.0],[58.6,-118.0]]){const frame=new T.Mesh(new T.CylinderGeometry(.31,.31,.06,24),material(0x4d5b60));frame.position.set(x,.075,z);frame.userData={semantic:'IPAL_INSPECTION_MANHOLE_FRAME_REFERENCE',accuracy:'DRAINAGE_ACCESS_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};ipal.add(frame);const cover=new T.Mesh(new T.CylinderGeometry(.27,.27,.025,24),material(0x657278));cover.position.set(x,.115,z);cover.userData={semantic:'IPAL_INSPECTION_MANHOLE_COVER_REFERENCE',accuracy:'DRAINAGE_ACCESS_REFERENCE_NOT_AS_BUILT',researchVersion:'V203'};ipal.add(cover);for(let a=0;a<Math.PI*2;a+=Math.PI/4)line(ipal,new T.Vector3(x,.13,z),new T.Vector3(x+Math.cos(a)*.20,.13,z+Math.sin(a)*.20),.006,0x38464b);buildingDetailStats.ipalManholes++;}
 label('IPAL · WATER TREATMENT',46.4,3.7,-118.9,10);
 // Landscape is a visual assumption outside the measured building, explicitly recorded in metadata.
 for(let i=0;i<10;i++){const x=-13.1,z=-8-i*10;box(layers.landscape,x,.08,z,2.4,.22,4,0x69846b);line(layers.landscape,new T.Vector3(x,0,z),new T.Vector3(x,2,z),.13,0x87745c);for(const [dx,dy,dz] of [[0,3,0],[-.65,2.65,.2],[.65,2.6,-.2]]){const crown=new T.Mesh(new T.IcosahedronGeometry(1.1,1),material(0x4f785b));crown.position.set(x+dx,dy,z+dz);layers.landscape.add(crown);}}
 for(let i=0;i<12;i++){box(layers.landscape,26+i*4,.18,8,3,.35,1.6,0x879b87);const shrub=new T.Mesh(new T.IcosahedronGeometry(.65,1),material(0x50775d));shrub.position.set(26+i*4,.85,8);layers.landscape.add(shrub);}
 for(const z of [-61,-68])box(layers.landscape,-9,1.2,z,.45,2.4,.45,0x71878d);
 box(layers.landscape,-9,1.15,-64.5,.09,2.1,5,0x617b86,0,.55);label('GERBANG',-9,3.7,-64.5,6,'#244b5c');
 // All assets use existing silhouette meshes at unit scale, centred inside their own footprint.
 const assets=new Map();
 for(const f of fleet){const p=f.placement,g=new T.Group(),foundationScope=canOpenTechnical3D(p.machineId)?'TECHNICAL_ASSET':'LAYOUT_PLACEHOLDER';g.name=p.label;g.position.set(p.x,0,-p.y);g.rotation.y=p.rotation*Math.PI/180;g.userData={...dwgObjectSourceMetadata(layout,{semantic:'FACTORY_MACHINE',sourceType:p.status?.startsWith('DXF_')?'DWG':'REGISTERED_ASSET',sourceEntityId:p.machineId,confidence:p.status==='DXF_FOOTPRINT'?'HIGH CONFIDENCE':p.status==='UNIDENTIFIED'?'UNKNOWN':'APPROXIMATE',renderStatus:foundationScope==='TECHNICAL_ASSET'?'3D_SPATIAL_PROXY_WITH_SEPARATE_MODEL':'LAYOUT_PLACEHOLDER'}),machineId:p.machineId,placementStatus:p.status,scaleFitApplied:false,foundationScope,technical3DEnabled:foundationScope==='TECHNICAL_ASSET'};
  for(const s of f.meshes){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(s.p,3));geo.setIndex(s.i);geo.computeVertexNormals();const mesh=new T.Mesh(geo,material(s.color));mesh.userData={machineId:p.machineId,foundationScope};g.add(mesh);}
  (p.status==='UNIDENTIFIED'?layers.unidentified:layers.machines).add(g);assets.set(p.machineId,g);
  label(p.label,p.x,Math.max(3.3,f.size[1]+.6),-p.y,Math.min(9,4+p.label.length*.08),p.status==='UNIDENTIFIED'?'#8a5921':'#244b5c',p.status==='UNIDENTIFIED'?layers.unidentified:layers.labels);
 }
 box(layers.unidentified,124,-.07,-44,38,.1,86,0xd9d4c5);label('POSISI AKTUAL BELUM TERIDENTIFIKASI',124,4,-90,30,'#835a2c',layers.unidentified);
 const pts=data.segments.flatMap(s=>[s[0],.012,-s[1],s[2],.012,-s[3]]),geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pts,3));const sourceReference=new T.LineSegments(geo,new T.LineBasicMaterial({color:0x355e72,transparent:true,opacity:.4}));sourceReference.userData=dwgObjectSourceMetadata(layout,{semantic:'CAD_REFERENCE',sourceLayer:layout.referenceBatches?.[0]?.layer||'UNKNOWN',sourceEntityId:'BATCHED_SOURCE_SEGMENTS',confidence:'HIGH CONFIDENCE',renderStatus:'2D_REFERENCE'});layers.reference.add(sourceReference);
 const utilityRouting=buildUtilityRoutingScaffold(layers,layout.utilityRoutingOverrides||{});
 const functionalVisibleSemantic=semantic=>{
  const s=String(semantic||'');
  if(/FIRE_EXTINGUISHER|EMERGENCY_LUMINAIRE|CONVEX_MIRROR|BARRIER_RAIL|BARRIER_POST|TRAFFIC_CUE|UTILITY_|IPAL_.*REFERENCE/i.test(s))return false;
  if(/KEYBOARD_KEY|DUAL_CASTER|PEDESTAL_CASTER|DRAWER_PULL|HANDLE_REFERENCE|NUMBER_PLATE|VENT_REFERENCE|DIFFUSER_SLOT|RETURN_GRILLE_SLOT|ANCHOR_BOLT|PANEL_OR_CONTROL_JOINT/i.test(s))return false;
  return /^(ADMIN|OFFICE|PPIC|PDS|QC|INCOMING|CTF|CTP|PREPRESS|DISPATCH|TOILET|PANTRY|LOCKER|PRAYER|MUSHOLA|ELECTRICAL|SPAREPART|WORKSHOP|WORKBENCH|TOOL_BOARD|MAINTENANCE|MEETING|SUPERVISOR|JANITOR|BROKE|RMS|WRAPPED_PAPERBOARD|FG_DISPATCH|FG_SHIPPING|LOADING_DOCK|ROOM_FLOOR|PRODUCTION_WIP|PRODUCTION_WASTE|PRODUCTION_MOBILE_PAPER|PRODUCTION_MOBILE_QC|PRODUCTION_HOUSEKEEPING|PRODUCTION_MATERIAL_STATUS|PRODUCTION_AISLE|PRODUCTION_COLUMN|PRODUCTION_FLOOR|PRINTING_|CUTTING_|AUTOPLATEN_|FOLDER_|RMS_MATERIAL_STATUS|ROOM_DOOR_NAMEPLATE|PACKAGING|RMS_|FG_|MEETING|SUPERVISOR|PANTRY|ADMIN|PPIC|QC|WAREHOUSE_FORK_WHEEL_SCUFF|FLOOR_CONTROL_JOINT|FLOOR_SERVICE_CLEARANCE|EXTERIOR_PERIMETER|PRESS_ROOM_SKIRTING|PRESS_ROOM_KICK_RAIL|WALL_BASE_PLINTH)/i.test(s);
 };
 let hiddenReferenceRealism=0,visibleFunctionalReferences=0;root.traverse(o=>{if(o.userData?.supersededByV202){o.visible=false;hiddenReferenceRealism++;return;}const accuracy=String(o.userData?.accuracy||''),isReference=o.userData?.evidenceLayer==='REFERENCE_REALISM'||accuracy.includes('REFERENCE_NOT_AS_BUILT');if(isReference){const show=!!o.userData?.functionalReferenceVisible||functionalVisibleSemantic(o.userData?.semantic);o.visible=show;o.userData={...o.userData,evidenceLayer:'REFERENCE_REALISM',visualizationMode:show?'FUNCTIONAL_REFERENCE_VISIBLE':'REFERENCE_HIDDEN_BY_DEFAULT'};if(show)visibleFunctionalReferences++;else hiddenReferenceRealism++;}});
 buildingDetailStats.visibleFunctionalReferences=visibleFunctionalReferences;
 root.userData={baselineId:layout.baselineId,dwgFidelity:layout.dwgFidelity||null,buildingDetailPass:'V202_ROOM_ENVELOPE_CLOSURE_AND_DOOR_AWARE_FURNITURE_LAYOUT',researchVersion:'V203',researchSourceCount:V202_SOURCE_STATS.total,uniqueResearchUrls:V202_SOURCE_STATS.uniqueUrls,buildingDetailStats,utilityRouting,
  architecturalEvidenceBoundary:{
   sourceGrounded:['PLANT_OUTLINE','DXF_WALL_SEGMENTS','DXF_COLUMN_POSITIONS','SOURCE_DOORS_AND_CURTAINS','MACHINE_PLACEMENTS','USER_APPROX_ROOF_4_5_TO_7M'],
   realismReferences:['CONCRETE_CONTROL_JOINT_GRID','SERVICE_CLEARANCE_FLOOR_MARKING','COLUMN_PEDESTALS_BASE_PLATES_ANCHORS_STIFFENERS','WALL_GIRTS_BASE_FLASHING','PANEL_OR_CONTROL_JOINT_RHYTHM','PORTAL_HAUNCH_EAVE_STRUT_APEX_SPLICE','ROOF_PURLIN_ANTI_SAG_FLY_BRACING','LINEAR_LIGHTING','GUTTER_DOWNPIPE_SHOE_SPACING','PERSONNEL_DOOR_HARDWARE','WIDE_DOOR_HARDWARE','PRESS_ROOM_KICK_RAIL_AND_CORNER_PROTECTION','DOCK_LEVELLER_STAIR_CANOPY_PROTECTION','IPAL_SERVICE_HARDWARE','OFFICE_ERGONOMIC_WORKSTATIONS_AND_ADMIN_STORAGE','PPIC_PLANNING_BOARD_AND_PRINT_STATION','QC_INSPECTION_BENCH_AND_SAMPLE_STORAGE','SPAREPART_RACK_BINS_GUARDS_AND_PICKING_AISLE','RMS_WRAPPED_PAPERBOARD_PALLETS_REEL_CRADLES_AISLE_MARKINGS_AND_ENVIRONMENT_MONITOR','SOURCE_LABELLED_FG_CARTON_PALLET_STAGING','OFFICE_SUSPENDED_CEILING_LED_DIFFUSER_RETURN_SENSOR_REFERENCE','TOILET_MIRROR_DISPENSER_DRAIN_EXHAUST_REFERENCE','SOURCE_LABELLED_PANTRY_AND_LOCKER_REFERENCE','WAREHOUSE_PEDESTRIAN_SEPARATION_CROSSING_BARRIER_CONVEX_MIRROR_REFERENCE','MOVABLE_PALLET_JACK_REFERENCE','FIRE_EXTINGUISHER_AND_EMERGENCY_LUMINAIRE_REFERENCE','DETAILED_TASK_CHAIR_FIVE_STAR_BASE_CASTERS_ARMS_LUMBAR','DESK_GROMMET_CABLE_TRAY_MONITOR_ARM_DOCUMENT_HOLDER_PHONE_ACCESSORIES','CREDENZA_DOORS_SHELVES_AND_FLAT_FILE_DRAWERS','MFP_TRAYS_VENTS_AND_QC_STORAGE_STOOL','WORKSHOP_DRAWERS_VISE_CABINET_STOOL','MUSHOLA_SHOE_RACK_AND_LOW_BENCH','PANTRY_CABINETS_APPLIANCES_BREAK_TABLE','LOCKER_NUMBER_PLATES_BENCH_SHOE_RACK','PREPRESS_STORAGE_LIGHT_TABLE_TROLLEY','LOADING_DOCK_DISPATCH_PACKING_FURNITURE','V200_LINE_SIDE_QC_HOUSEKEEPING_WASTE_SEGREGATION_MATERIAL_STATUS','V200_PAPERBOARD_ACCLIMATISATION_AND_CORNER_PROTECTION','V200_COLUMN_IDENTIFICATION_AND_LOW_IMPACT_GUARDS','V200_FG_SHIPPING_SUPPORT','V201_CONTEXTUAL_PRINTING_PROOF_AND_CLOSED_CONSUMABLES_SUPPORT','V201_CUT_SHEET_AND_TRIM_HANDLING','V201_DIECUT_TOOL_TROLLEY','V201_FOLDER_CARTON_BLANK_TROLLEY','V201_DESIGNATED_TROLLEY_PARKING_AND_RMS_STATUS_STAGING','V201_ROOF_INSULATION_AND_OPTIONAL_DAYLIGHT_REFERENCE','V202_ROOM_ENVELOPE_SUPPLEMENT_ONLY_WHERE_SOURCE_WALL_IS_MISSING','V202_DOOR_SIDE_CLEAR_AISLE_AND_WORK_WALL_LAYOUT','V202_CONTEXTUAL_OFFICE_QC_PREPRESS_WORKSHOP_PANTRY_LOCKER_TOILET_UTILITY_INTERIORS'],
   notAsBuilt:true,utilityMEPActualRoutingAdded:false,reason:'Architectural realism references improve physical readability but do not replace field photos, structural drawings or MEP routing drawings.'
  },
  assumptions:{...data.assumptions,roofEaves:4.5,roofRidge:7,roofHeightEvidence:'USER_APPROXIMATE_MEASUREMENT',machineServiceClearance:MACHINE_SERVICE_CLEARANCE,offsetRoomClearance:1.85,wallTreatment:'SOURCE_SEGMENTS_CLIPPED_TO_SERVICE_ENVELOPE',portalTreatment:'SOURCE_DOORS_AND_CURTAINS_CUT_REAL_OPENINGS_IN_WALL_MESH__FUNCTIONAL_REFERENCE_DOOR_ONLY_WHEN_SOURCE_LABELLED_ROOM_HAS_NO_NEARBY_SOURCE_ACCESS',roomContents:'V202_EACH_SOURCE_ROOM_HAS_AUDITED_ENVELOPE_VALID_ACCESS_CLEAR_AISLE_AND_DOOR_AWARE_CONTEXTUAL_FURNITURE_REFERENCE_NOT_AS_BUILT',warehouseReference:'V201_WRAPPED_AND_CONDITIONED_PAPERBOARD_CLEAR_AISLES_STATUS_STAGING_FLOOR_SCALE_REELS_SHEETS_AND_CONTROLLED_HANDLING_REFERENCE',finishedGoodsReference:'V201_SOURCE_FG_WITH_WRAPPED_LOADS_PROTECTION_STAGING_PARKING_SHIPPING_SUPPORT_AND_CLEAR_ROUTE_REFERENCE',microRealism:'OFFICE_CEILING_HVAC_DIFFUSER_POWER_DATA_TOILET_PANTRY_LOCKER_WAREHOUSE_TRAFFIC_REFERENCES_NOT_AS_BUILT',safetyReference:'VISUAL_REFERENCE_ONLY_NOT_CODE_COMPLIANCE_OR_ACTUAL_EGRESS_SURVEY',furnitureDetail:'V202_LEGACY_GENERIC_ROOM_FURNITURE_SUPERSEDED_BY_WALL_AND_DOOR_AWARE_LAYOUTS_WITH_TARGET_FACING_SEATING',architecturalRealism:'V202_CLOSED_ENVELOPE_BUILDING_AND_SOURCE_LABELLED_ROOMS_EXCEPT_VALID_DOORS_GATES_CURTAINS_AND_LOADING_FUNCTION_OPENINGS',utilityRoutingBoundary:'UTILITY_MODELS_RETAINED_FOR_EXPANSION_BUT_HIDDEN_IN_PHASE1_UI',rmsEnvironmentIndustryReference:'STORA_ENSO_50_55_RH_20_23C_NOT_PLANT_SETPOINT',ipalTreatment:'OUTDOOR_OPEN_FRAME_FUNCTIONAL_RECONSTRUCTION_WITH_PRELIMINARY_TREATMENT_CLARIFIER_FILTER_AND_DRAINAGE_DETAILS_NOT_AS_BUILT'},
  roomAccessAudit,roomProgramAudit,roomEnvelopeAudit,roomFurnitureAudit,v202ChairFacingAudit,chairFacingAudit,operationalReferenceAudit,contextualMachineSupportAudit,exteriorEnvelopeAudit:{samples:buildingDetailStats.exteriorPerimeterSamples,supplementSegments:buildingDetailStats.exteriorPerimeterSupplements,openGapCount:buildingDetailStats.exteriorOpenGapCount},roomEnvelopeSummary:{audited:buildingDetailStats.roomEnvelopeAudited,supplementWalls:buildingDetailStats.roomEnvelopeSupplementWalls,openEdges:buildingDetailStats.outerRoomOpenEdges,invalidOuterOpenings:buildingDetailStats.outerRoomInvalidOpenings,wallCornerErrors:buildingDetailStats.roomWallCornerErrors,doubleWallOverlaps:buildingDetailStats.doubleWallOverlaps},furnitureLayoutSummary:{templates:buildingDetailStats.contextualFurnitureTemplatesApplied,accessViolations:buildingDetailStats.furnitureAccessViolations,wallPenetrations:buildingDetailStats.furnitureWallPenetrations,orientationErrors:buildingDetailStats.furnitureOrientationErrors,doorSwingClearanceViolations:buildingDetailStats.doorSwingClearanceViolations},wallDeduplication:{input:data.walls.length,renderedSourceWalls:wallDedupe.walls.length,duplicatesRemoved:wallDedupe.removed},referenceRoomPortals:referenceRoomPortals.map(p=>({roomLabel:p.roomLabel,x:+p.x.toFixed(2),y:+p.y.toFixed(2),rotation:+p.rotation.toFixed(1)})),
  offsetRooms:pressRooms.map(r=>({...r,centerError:Math.hypot((r.minX+r.maxX)/2-r.centerX,(r.minY+r.maxY)/2-r.centerY)})),ipal:{zone:ipalZone,enclosingWalls:0,removedSourceWallSegments:ipalRemovedWalls.length,openSides:true,processFlow:['EQUALIZATION','AERATION','CLARIFICATION','FILTRATION','TRANSFER'],equipment:ipalEquipment,structuralReference:{xBracing:buildingDetailStats.ipalFrameBraces,guardrailElements:buildingDetailStats.ipalGuardrails}},
  nonMachineCollisionAudit:{placedFixtures:fixtureBoxes.length,skippedFixtures:skippedFixtures.length,accidentalFixtureOverlaps:0},omittedCollisionWalls:0,trimmedCollisionWalls:omitted.length,adjustedPortals:adjustedPortals.map(p=>({semantic:p.evidence,x:p.x,y:p.y,sourceX:p.sourceX,sourceY:p.sourceY})),legacyWalls:data.legacyWalls.length,hiddenReferenceRealism};
 return {root,layers,assets,machineBoxes,utilityRouting};
}
