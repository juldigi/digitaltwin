import * as T from 'three';
import {
  buildFurnitureAssetV2,
  buildIndustrialLockerDetailed,buildLockerBenchDetailed,buildJanitorServiceSinkDetailed,buildCompactHousekeepingCartDetailed,buildJanitorChemicalShelfDetailed,
  buildHeavyIndustrialCabinetDetailed,buildFlammableSafetyCabinetReference,buildMaintenanceShadowBoardDetailed,buildSparePartBinWallDetailed,buildDrawerPartsCabinetDetailed,
  buildQCSampleCabinetDetailed,buildQCInstrumentSideTableDetailed,buildPrepressPlateRackAFrame,buildPlateCassetteRackDetailed,
  buildBreakroomCabinetRunDetailed,buildCommercialRefrigeratorDetailed,buildMicrowaveShelfTowerDetailed,
  buildCommercialToiletDetailed,buildRestroomCubicleDetailed,buildRestroomVanityDetailed,buildRestroomAccessoryBankDetailed,
  buildElectricalInsulatingMatRun,buildElectricalDocumentStationDetailed,
  buildIndustrialPackingStationDetailed,buildDockBumperDetailed,buildDockWheelChockStationDetailed,buildDockGuardRailDetailed,
  buildSelectivePalletRackBayDetailed,buildWrappedPaperboardPalletDetailed,buildWheeledWasteBinDetailed,buildMaterialHandlingBarrierDetailed,
  buildLineSideSupportStationDetailed,buildColumnImpactGuardDetailed,buildWeatherproofOutdoorBinDetailed,
  buildOfficeDesk,buildTaskChair,buildVisitorChair,buildMFP,buildCredenza,buildPlanningBoard,buildQCBench,buildLabStool,buildFlatFileCabinet,
  buildWorkshopWorkbench,buildToolCabinet,buildMobileToolCart,buildShoeRack,buildPrayerMat,buildMeetingTable,buildBreakTable,buildBreakChair,
  buildLightInspectionTable,buildFloorScale,buildPalletJack,buildStretchWrapper,buildMaterialStatusBoard,buildPlatformTrolley,buildWasteSegregationStation,
  buildProofRack,buildConsumablesCabinet,buildSheetTrolley,buildDieToolTrolley,buildCartonBlankTrolley,buildHoseReelCabinet,buildSafetyBollard
} from './furniture-realism-kit-v2.js';
import {ROOM_REALISM_REQUIREMENTS,REALISM_POLICY} from './furniture-realism-research-v2.js';

export const ROOM_FURNITURE_PLAN_VERSION='RFP-V2-2026-09-25';

function add(g,o,x=0,z=0,rot=0,y=0){o.position.set(x,y,z);o.rotation.y=rot;g.add(o);return o;}
function face(o,targetX,targetZ){const dx=targetX-o.position.x,dz=targetZ-o.position.z;o.rotation.y=Math.atan2(dx,dz);return o;}
function group(program,w,d){const g=new T.Group();g.name=`ROOM_${program}_V2`;g.userData={semantic:`ROOM_${program}_FURNITURE_REFERENCE`,accuracy:REALISM_POLICY.status,version:ROOM_FURNITURE_PLAN_VERSION,program,width:w,depth:d,requirements:ROOM_REALISM_REQUIREMENTS[program]||[]};return g;}
function doorKeepout(w=1.0,d=1.1){return {w,d,rule:'NO_FIXED_FURNITURE_IN_DOOR_APPROACH'};}
function wallClearance(min=.08){return {min,rule:'KEEP_FURNITURE_OFF_WALL_LINER_AND_SKIRTING'};}
function serviceClearance(min=.72){return {min,rule:'PRESERVE_OPERATOR_ACCESS_AND_CHAIR_PULLBACK'};}

export const ROOM_LAYOUT_RULES=Object.freeze({
  global:{doorApproach:doorKeepout(),wall:wallClearance(),'chair/service':serviceClearance(),noRandomScatter:true,noFloating:true,noWallPenetration:true,noMachineServiceOverlap:true},
  office:{deskRearWallGap:.10,chairPullback:.85,visitorGap:.60,screenFacesChair:true},
  qc:{benchRearGap:.10,stoolPullback:.65,lightBoothOnStableBench:true,sampleStorageClosedPreferred:true},
  workshop:{benchRearGap:.10,frontWorkingAisle:1.0,toolCabinetDoorSweep:.75,mobileCartParking:true},
  warehouse:{pedestrianAisleMinReference:1.0,palletHandlingRoute:'KEEP_CLEAR',rackGuardAtAisleFace:true},
  janitor:{wetZoneAroundSink:true,chemicalIdentityUnverified:true,cartParkingBay:true},
  electrical:{panelWorkingSpace:'DO_NOT_OCCUPY_WITH_FURNITURE',insulatingMatClass:'VERIFY_FIELD_RATING'},
  dock:{dockEdgeProtection:'REFERENCE_ONLY_VERIFY_FIELD',chockLocation:'TRUCK_WHEEL_ZONE',packingStationInboard:true}
});

export const ROOM_TEMPLATE_ENVELOPES=Object.freeze({
  ADMIN_OFFICE:[4.2,3.6],PPIC_OFFICE:[5.2,4.0],PDS_PREPRESS_OFFICE:[4.8,3.8],QC_SAMPLE:[5.0,4.0],INCOMING_QC:[4.8,3.8],PREPRESS:[5.4,4.3],DISPATCH_LOADING:[6.0,4.5],
  TOILET:[4.0,3.4],ELECTRICAL:[4.6,3.6],SPAREPART_WAREHOUSE:[6.0,4.8],WORKSHOP:[6.0,4.8],PANTRY:[5.0,4.0],LOCKER_CHANGE:[5.4,4.4],PRAYER_ROOM:[5.6,4.5],
  FIRE_PUMP_ROOM:[4.6,3.8],BROKE_WASTE_ROOM:[5.0,4.0],MEETING:[5.6,4.2],SUPERVISOR_OFFICE:[4.4,3.6],JANITOR:[3.8,3.2],MAINTENANCE:[6.2,4.8],RMS:[9.0,8.0],FINISHED_GOODS:[8.0,6.5],PRODUCTION:[5.0,4.0],EXTERIOR:[5.0,3.0]
});

function adminOffice(program='ADMIN_OFFICE',w=4.2,d=3.6){
  const g=group(program,w,d), desk=buildOfficeDesk({semantic:`${program}_DESK`});add(g,desk,0,d*.12,Math.PI);
  const chair=buildTaskChair({semantic:`${program}_TASK_CHAIR`});add(g,chair,0,-.72,0);face(chair,0,d*.12);
  for(const x of [-.72,.72]){const c=buildVisitorChair({semantic:`${program}_VISITOR_CHAIR`});add(g,c,x,.88,Math.PI);face(c,0,d*.12);}
  add(g,buildCredenza({semantic:`${program}_CREDENZA`}),-w*.34,d*.38,Math.PI/2);add(g,buildPlanningBoard({semantic:`${program}_BOARD`}),w*.36,d*.30,-Math.PI/2);add(g,buildMFP({semantic:`${program}_MFP`}),w*.34,-d*.27,-Math.PI/2);
  return g;
}
function ppicOffice(w=5.2,d=4.0){const g=adminOffice('PPIC_OFFICE',w,d);add(g,buildMaterialStatusBoard({semantic:'PPIC_MATERIAL_STATUS_BOARD'}),-w*.35,-d*.30,Math.PI/2);return g;}
function supervisorOffice(w=4.4,d=3.6){const g=adminOffice('SUPERVISOR_OFFICE',w,d);return g;}
function meetingRoom(w=5.6,d=4.2){const g=group('MEETING',w,d),table=buildMeetingTable({semantic:'MEETING_TABLE'});add(g,table,0,0,0);for(const x of [-.90,0,.90])for(const z of [-.85,.85]){const c=buildVisitorChair({semantic:'MEETING_CHAIR'});add(g,c,x,z,z>0?Math.PI:0);face(c,0,0);}add(g,buildPlanningBoard({semantic:'MEETING_PRESENTATION_BOARD'}),0,d*.43,Math.PI);add(g,buildCredenza({semantic:'MEETING_CREDENZA'}),-w*.38,0,Math.PI/2);return g;}

function qcRoom(program='QC_SAMPLE',w=5.0,d=4.0){const g=group(program,w,d);add(g,buildQCBench({semantic:`${program}_BENCH`}),0,d*.29,Math.PI);add(g,buildQCSampleCabinetDetailed({semantic:`${program}_SAMPLE_CABINET`}),-w*.36,d*.26,Math.PI);add(g,buildQCInstrumentSideTableDetailed({semantic:`${program}_INSTRUMENT_TABLE`}),w*.30,d*.17,Math.PI);const st=buildLabStool({semantic:`${program}_STOOL`});add(g,st,-.85,.20,0);add(g,buildMaterialStatusBoard({semantic:`${program}_STATUS_BOARD`}),w*.39,-d*.25,-Math.PI/2);return g;}
function incomingQc(w=4.8,d=3.8){const g=qcRoom('INCOMING_QC',w,d);add(g,buildPlatformTrolley({semantic:'INCOMING_QC_SAMPLE_TROLLEY'}),-w*.30,-d*.28,0);return g;}
function pdsOffice(w=4.8,d=3.8){const g=group('PDS_PREPRESS_OFFICE',w,d);add(g,buildOfficeDesk({semantic:'PDS_WORKSTATION'}),-1.0,d*.25,Math.PI);const chair=buildTaskChair({semantic:'PDS_TASK_CHAIR'});add(g,chair,-1.0,-.40,0);face(chair,-1.0,d*.25);add(g,buildFlatFileCabinet({semantic:'PDS_FLAT_FILE'}),w*.31,d*.26,Math.PI);add(g,buildPlateCassetteRackDetailed({semantic:'PDS_PLATE_CASSETTE'}),w*.33,-d*.21,Math.PI);add(g,buildLightInspectionTable({semantic:'PDS_LIGHT_INSPECTION_TABLE'}),-.20,-d*.25,0);return g;}
function prepress(w=5.4,d=4.3){const g=group('PREPRESS',w,d);add(g,buildPrepressPlateRackAFrame({semantic:'PREPRESS_AFRAME_PLATE_RACK'}),-w*.26,0,0);add(g,buildPlateCassetteRackDetailed({semantic:'PREPRESS_CASSETTE_RACK'}),w*.34,d*.22,Math.PI);add(g,buildLightInspectionTable({semantic:'PREPRESS_LIGHT_TABLE'}),.45,-d*.25,0);add(g,buildOfficeDesk({semantic:'PREPRESS_OPERATOR_DESK'}),-w*.22,d*.31,Math.PI);const c=buildTaskChair({semantic:'PREPRESS_OPERATOR_CHAIR'});add(g,c,-w*.22,d*.06,0);face(c,-w*.22,d*.31);return g;}

function workshop(program='WORKSHOP',w=6.0,d=4.8){const g=group(program,w,d);add(g,buildWorkshopWorkbench({semantic:`${program}_WORKBENCH`}),0,d*.32,Math.PI);add(g,buildMaintenanceShadowBoardDetailed({semantic:`${program}_SHADOW_BOARD`}),0,d*.46,Math.PI);add(g,buildHeavyIndustrialCabinetDetailed({semantic:`${program}_HEAVY_CABINET`,width:1.22,height:1.90,depth:.60}),-w*.37,d*.25,Math.PI);add(g,buildToolCabinet({semantic:`${program}_TOOL_CABINET`}),w*.36,d*.25,Math.PI);add(g,buildMobileToolCart({semantic:`${program}_MOBILE_TOOL_CART`}),w*.27,-d*.25,0);add(g,buildSparePartBinWallDetailed({semantic:`${program}_PARTS_BIN_WALL`,cols:5,rows:6}),-w*.37,-d*.18,Math.PI/2);return g;}
function maintenance(w=6.2,d=4.8){const g=workshop('MAINTENANCE',w,d);add(g,buildDrawerPartsCabinetDetailed({semantic:'MAINTENANCE_DRAWER_PARTS_CABINET'}),0,-d*.33,0);return g;}
function spareparts(w=6.0,d=4.8){const g=group('SPAREPART_WAREHOUSE',w,d);for(const x of [-1.55,0,1.55])add(g,buildSparePartBinWallDetailed({semantic:'SPAREPART_BIN_RACK',cols:5,rows:7}),x,d*.32,Math.PI);add(g,buildDrawerPartsCabinetDetailed({semantic:'SPAREPART_DRAWER_CABINET'}),-w*.36,-d*.25,Math.PI/2);add(g,buildHeavyIndustrialCabinetDetailed({semantic:'SPAREPART_HEAVY_CABINET',width:1.20,height:1.90,depth:.60}),w*.36,-d*.22,-Math.PI/2);return g;}

function pantry(w=5.0,d=4.0){const g=group('PANTRY',w,d);add(g,buildBreakroomCabinetRunDetailed({semantic:'PANTRY_CABINET_RUN',length:w*.78}),0,d*.39,Math.PI);add(g,buildCommercialRefrigeratorDetailed({semantic:'PANTRY_REFRIGERATOR'}),-w*.39,d*.22,Math.PI);add(g,buildMicrowaveShelfTowerDetailed({semantic:'PANTRY_MICROWAVE_TOWER'}),w*.38,d*.21,Math.PI);const table=buildBreakTable({semantic:'PANTRY_BREAK_TABLE'});add(g,table,0,-d*.18,0);for(const [x,z] of [[-.65,-.70],[.65,-.70],[-.65,.30],[.65,.30]]){const c=buildBreakChair({semantic:'PANTRY_BREAK_CHAIR'});add(g,c,x,z,0);face(c,0,-d*.18);}return g;}
function locker(w=5.4,d=4.4){const g=group('LOCKER_CHANGE',w,d);add(g,buildIndustrialLockerDetailed({semantic:'LOCKER_BANK_A',modules:6}),-w*.18,d*.39,Math.PI);add(g,buildIndustrialLockerDetailed({semantic:'LOCKER_BANK_B',modules:6}),w*.27,d*.39,Math.PI);add(g,buildLockerBenchDetailed({semantic:'LOCKER_BENCH',length:2.4}),0,-.25,0);add(g,buildShoeRack({semantic:'LOCKER_SHOE_RACK'}),-w*.38,-d*.28,Math.PI/2);return g;}
function prayer(w=5.6,d=4.5){const g=group('PRAYER_ROOM',w,d);add(g,buildShoeRack({semantic:'PRAYER_SHOE_RACK'}),-w*.40,d*.27,Math.PI/2);add(g,buildLockerBenchDetailed({semantic:'PRAYER_LOW_BENCH',length:1.4}),w*.28,d*.30,0);for(let row=0;row<2;row++)for(let col=-2;col<=2;col++)add(g,buildPrayerMat({semantic:'PRAYER_MAT'}),col*.65,-.95+row*.90,0);return g;}
function janitor(w=3.8,d=3.2){const g=group('JANITOR',w,d);add(g,buildJanitorServiceSinkDetailed({semantic:'JANITOR_SERVICE_SINK'}),-w*.23,d*.36,Math.PI);add(g,buildJanitorChemicalShelfDetailed({semantic:'JANITOR_CHEMICAL_SHELF',width:1.1}),w*.27,d*.31,Math.PI);add(g,buildCompactHousekeepingCartDetailed({semantic:'JANITOR_HOUSEKEEPING_CART'}),0,-d*.25,0);return g;}

function restroom(w=4.0,d=3.4){const g=group('TOILET',w,d);add(g,buildRestroomCubicleDetailed({semantic:'TOILET_CUBICLE_A'}),-w*.25,d*.17,Math.PI);add(g,buildRestroomCubicleDetailed({semantic:'TOILET_CUBICLE_B'}),w*.25,d*.17,Math.PI);add(g,buildRestroomVanityDetailed({semantic:'RESTROOM_VANITY'}),0,-d*.37,0);add(g,buildRestroomAccessoryBankDetailed({semantic:'RESTROOM_ACCESSORIES'}),w*.38,-d*.06,-Math.PI/2,0);return g;}
function electrical(w=4.6,d=3.6){const g=group('ELECTRICAL',w,d);add(g,buildElectricalInsulatingMatRun({semantic:'ELECTRICAL_INSULATING_MAT',length:w*.70,width:1.0}),0,0,0);add(g,buildElectricalDocumentStationDetailed({semantic:'ELECTRICAL_DOCUMENT_STATION'}),-w*.39,d*.25,Math.PI/2);add(g,buildHeavyIndustrialCabinetDetailed({semantic:'ELECTRICAL_MAINTENANCE_CABINET',width:.90,height:1.80,depth:.50}),w*.38,d*.24,-Math.PI/2);return g;}
function firePump(w=4.6,d=3.8){const g=group('FIRE_PUMP_ROOM',w,d);add(g,buildElectricalDocumentStationDetailed({semantic:'FIRE_PUMP_LOG_DOCUMENT_STATION'}),-w*.38,d*.28,Math.PI/2);add(g,buildHeavyIndustrialCabinetDetailed({semantic:'FIRE_PUMP_MAINTENANCE_CABINET',width:.90,height:1.75,depth:.50}),w*.37,d*.25,-Math.PI/2);return g;}
function brokeWaste(w=5.0,d=4.0){const g=group('BROKE_WASTE_ROOM',w,d);for(const x of [-1.0,0,1.0])add(g,buildWheeledWasteBinDetailed({semantic:'BROKE_WHEELED_BIN'}),x,d*.18,Math.PI);add(g,buildPlatformTrolley({semantic:'BROKE_PLATFORM_TROLLEY'}),0,-d*.30,0);add(g,buildWasteSegregationStation({semantic:'BROKE_WASTE_SEGREGATION'}),-w*.35,-d*.25,Math.PI/2);return g;}

function dispatch(w=6.0,d=4.5){const g=group('DISPATCH_LOADING',w,d);add(g,buildIndustrialPackingStationDetailed({semantic:'DISPATCH_PACKING_STATION'}),0,d*.28,Math.PI);add(g,buildPlatformTrolley({semantic:'DISPATCH_PLATFORM_TROLLEY'}),-w*.29,-d*.18,0);add(g,buildPalletJack({semantic:'DISPATCH_PALLET_JACK'}),w*.28,-d*.23,Math.PI/2);add(g,buildDockWheelChockStationDetailed({semantic:'DISPATCH_WHEEL_CHOCK_STATION'}),-w*.40,d*.35,Math.PI/2);add(g,buildDockBumperDetailed({semantic:'DISPATCH_DOCK_BUMPER_A'}),-1.0,d*.49,Math.PI);add(g,buildDockBumperDetailed({semantic:'DISPATCH_DOCK_BUMPER_B'}),1.0,d*.49,Math.PI);add(g,buildDockGuardRailDetailed({semantic:'DISPATCH_DOCK_GUARDRAIL',length:2.2}),w*.37,d*.40,-Math.PI/2);return g;}

function rms(w=9.0,d=8.0){const g=group('RMS',w,d);for(const x of [-2.8,0,2.8]){add(g,buildSelectivePalletRackBayDetailed({semantic:'RMS_PALLET_RACK'}),x,d*.26,Math.PI);for(const dx of [-.62,.62])add(g,buildWrappedPaperboardPalletDetailed({semantic:'RMS_PAPERBOARD_PALLET'}),x+dx,d*.15,Math.PI);}add(g,buildFloorScale({semantic:'RMS_FLOOR_SCALE'}),w*.36,-d*.32,0);add(g,buildPalletJack({semantic:'RMS_PALLET_JACK'}),-w*.36,-d*.30,Math.PI/2);add(g,buildMaterialStatusBoard({semantic:'RMS_MATERIAL_STATUS_BOARD'}),w*.43,0,-Math.PI/2);add(g,buildMaterialHandlingBarrierDetailed({semantic:'RMS_PEDESTRIAN_BARRIER',length:2.6}),-w*.40,0,Math.PI/2);return g;}
function fg(w=8.0,d=6.5){const g=group('FINISHED_GOODS',w,d);for(const x of [-2.0,0,2.0])for(const z of [-1.2,.4])add(g,buildWrappedPaperboardPalletDetailed({semantic:'FG_WRAPPED_LOAD',loadHeight:1.15}),x,z,0);add(g,buildPalletJack({semantic:'FG_PALLET_JACK'}),w*.36,-d*.32,Math.PI/2);add(g,buildStretchWrapper({semantic:'FG_STRETCH_WRAPPER'}),-w*.35,-d*.28,0);add(g,buildIndustrialPackingStationDetailed({semantic:'FG_SHIPPING_DOCUMENT_STATION',width:1.2,depth:.55}),0,d*.37,Math.PI);return g;}
function production(w=5.0,d=4.0){const g=group('PRODUCTION',w,d);add(g,buildLineSideSupportStationDetailed({semantic:'PRODUCTION_LINE_SIDE_STATION'}),0,d*.22,Math.PI);add(g,buildWheeledWasteBinDetailed({semantic:'PRODUCTION_WASTE_BIN'}),w*.33,-d*.10,-Math.PI/2);add(g,buildMaterialStatusBoard({semantic:'PRODUCTION_STATUS_BOARD'}),-w*.39,0,Math.PI/2);return g;}
function exterior(w=5.0,d=3.0){const g=group('EXTERIOR',w,d);add(g,buildWeatherproofOutdoorBinDetailed({semantic:'EXTERIOR_WEATHERPROOF_BIN'}),-1.2,0,0);add(g,buildHoseReelCabinet({semantic:'EXTERIOR_HOSE_REEL_CABINET'}),1.1,.20,0);for(const x of [-2.0,2.0])add(g,buildSafetyBollard({semantic:'EXTERIOR_BOLLARD'}),x,-.65,0);return g;}

export const ROOM_BUILDERS_V2=Object.freeze({
  ADMIN_OFFICE:()=>adminOffice(),PPIC_OFFICE:()=>ppicOffice(),PDS_PREPRESS_OFFICE:()=>pdsOffice(),QC_SAMPLE:()=>qcRoom(),INCOMING_QC:()=>incomingQc(),PREPRESS:()=>prepress(),DISPATCH_LOADING:()=>dispatch(),TOILET:()=>restroom(),ELECTRICAL:()=>electrical(),SPAREPART_WAREHOUSE:()=>spareparts(),WORKSHOP:()=>workshop(),PANTRY:()=>pantry(),LOCKER_CHANGE:()=>locker(),PRAYER_ROOM:()=>prayer(),FIRE_PUMP_ROOM:()=>firePump(),BROKE_WASTE_ROOM:()=>brokeWaste(),MEETING:()=>meetingRoom(),SUPERVISOR_OFFICE:()=>supervisorOffice(),JANITOR:()=>janitor(),MAINTENANCE:()=>maintenance(),RMS:()=>rms(),FINISHED_GOODS:()=>fg(),PRODUCTION:()=>production(),EXTERIOR:()=>exterior()
});

export function buildRoomFurnitureReferenceV2(program,{width,depth}={}){
  const base=ROOM_TEMPLATE_ENVELOPES[program]||[4,3.5],w=width??base[0],d=depth??base[1];
  // custom dimensions are recorded for later placement solver; reference builders remain proportionally curated
  const builder=ROOM_BUILDERS_V2[program];if(!builder)throw new Error(`Unsupported room program: ${program}`);const g=builder();g.userData.requestedEnvelope={width:w,depth:d};return g;
}

export function roomFurnitureSemanticAuditV2(root){
  const objects=[];root.traverse(o=>{if(o.userData?.semantic)objects.push(o.userData.semantic);});const dupes=objects.filter((v,i,a)=>a.indexOf(v)!==i);return {objectSemanticCount:objects.length,duplicateSemanticNames:[...new Set(dupes)],hasUnverifiedAccuracy:root.userData?.accuracy===REALISM_POLICY.status};
}

export function roomFurnitureBoundsAuditV2(root,{width,depth,padding=.05}={}){
  const b=new T.Box3().setFromObject(root),W=width??root.userData?.width??Infinity,D=depth??root.userData?.depth??Infinity;const violations=[];if(b.min.x<-W/2-padding||b.max.x>W/2+padding)violations.push('X_OUTSIDE_ROOM_TEMPLATE');if(b.min.z<-D/2-padding||b.max.z>D/2+padding)violations.push('Z_OUTSIDE_ROOM_TEMPLATE');if(b.min.y<-.015)violations.push('BELOW_FLOOR');return {bounds:{min:b.min.toArray(),max:b.max.toArray()},room:[W,D],violations,pass:violations.length===0};
}