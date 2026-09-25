import * as T from 'three';
export * from './factory-room-furniture-plan-v2.js';
import {buildRoomFurnitureReferenceV2} from './factory-room-furniture-plan-v2.js';
import {
 buildErgonomicTaskChairV3,buildOfficeWorkstationV3,buildDocumentSorterV3,buildWallClockV3,buildOfficeWasteBinV3,buildQCLightBoothV3,buildQCReferenceTileRackV3,
 buildIndustrialShelfUnitV3,buildPartsPickingCartV3,buildWorkbenchPowerRailV3,buildMaintenancePPEStationV3,buildLockerHookRailV3,buildShoeBenchComboV3,buildPantrySinkModuleV3,
 buildRestroomHandDryStationV3,buildSafetyCabinetV3,buildDrumSpillPalletV3,buildWarehouseEndGuardV3,buildRackUprightProtectorV3,buildReelStopCradleV3,buildMaterialStatusTotemV3,
 buildLineSideKanbanRackV3,buildMobileQCStationV3,buildPackingConsumablesRackV3,buildDockDocumentPedestalV3,
 buildFurnitureAssetV3,applyMicroWearV3,assetConstructionAuditV3
} from './furniture-realism-kit-v3.js';
import {V3_ROOM_MICRODETAILS,V3_QUALITY_GATES,REALISM_POLICY_V3} from './furniture-realism-research-v3.js';

export const ROOM_FURNITURE_PLAN_VERSION_V3='RFP-V3-2026-09-25';
function add(g,o,x=0,z=0,ry=0,y=0){o.position.set(x,y,z);o.rotation.y=ry;g.add(o);return o;}
function facing(o,x,z){const dx=x-o.position.x,dz=z-o.position.z;o.rotation.y=Math.atan2(dx,dz);return o;}
function meta(g,p){g.userData={...(g.userData||{}),v3:true,version:ROOM_FURNITURE_PLAN_VERSION_V3,accuracy:REALISM_POLICY_V3.status,microDetails:V3_ROOM_MICRODETAILS[p]||[],qualityGates:V3_QUALITY_GATES};return g;}
function decorateBase(program,base){meta(base,program);return base;}

function enhanceOffice(program,base){decorateBase(program,base);add(base,buildDocumentSorterV3({semantic:program+'_DOCUMENT_SORTER'}),-1.55,1.15,Math.PI);add(base,buildWallClockV3({semantic:program+'_WALL_CLOCK'}),0,1.55,Math.PI,1.75);add(base,buildOfficeWasteBinV3({semantic:program+'_WASTE_BIN'}),1.42,-.90,0);return base;}
function admin(){return enhanceOffice('ADMIN_OFFICE',buildRoomFurnitureReferenceV2('ADMIN_OFFICE'));}
function ppic(){const g=enhanceOffice('PPIC_OFFICE',buildRoomFurnitureReferenceV2('PPIC_OFFICE'));add(g,buildDocumentSorterV3({semantic:'PPIC_SCHEDULE_DOCUMENT_CUBBIES',cols:4,rows:5}),1.70,.95,Math.PI);return g;}
function supervisor(){return enhanceOffice('SUPERVISOR_OFFICE',buildRoomFurnitureReferenceV2('SUPERVISOR_OFFICE'));}
function meeting(){const g=decorateBase('MEETING',buildRoomFurnitureReferenceV2('MEETING'));add(g,buildWallClockV3({semantic:'MEETING_WALL_CLOCK'}),0,1.45,Math.PI,1.75);add(g,buildOfficeWasteBinV3({semantic:'MEETING_WASTE_BIN'}),1.65,-1.10,0);return g;}
function qc(program='QC_SAMPLE'){const g=decorateBase(program,buildRoomFurnitureReferenceV2(program));add(g,buildQCLightBoothV3({semantic:program+'_REFERENCE_LIGHT_BOOTH'}),0,.95,Math.PI);add(g,buildQCReferenceTileRackV3({semantic:program+'_SAMPLE_TILE_RACK'}),1.55,.85,Math.PI);add(g,buildMobileQCStationV3({semantic:program+'_MOBILE_QC_STATION'}),-1.45,-1.0,0);add(g,buildWallClockV3({semantic:program+'_CLOCK'}),0,1.55,Math.PI,1.75);return g;}
function pds(){const g=decorateBase('PDS_PREPRESS_OFFICE',buildRoomFurnitureReferenceV2('PDS_PREPRESS_OFFICE'));add(g,buildDocumentSorterV3({semantic:'PDS_DOCUMENT_SORTER'}),1.55,1.05,Math.PI);return g;}
function prepress(){const g=decorateBase('PREPRESS',buildRoomFurnitureReferenceV2('PREPRESS'));add(g,buildPartsPickingCartV3({semantic:'PREPRESS_PLATE_PARTS_CART'}),-1.65,-1.15,0);return g;}
function workshop(program){const g=decorateBase(program,buildRoomFurnitureReferenceV2(program));add(g,buildWorkbenchPowerRailV3({semantic:program+'_WORKBENCH_POWER_RAIL',width:1.5}),0,1.55,Math.PI,1.15);add(g,buildMaintenancePPEStationV3({semantic:program+'_PPE_STATION'}),-2.05,.95,Math.PI,0);add(g,buildPartsPickingCartV3({semantic:program+'_PARTS_CART'}),1.75,-1.15,0);return g;}
function spare(){const g=decorateBase('SPAREPART_WAREHOUSE',buildRoomFurnitureReferenceV2('SPAREPART_WAREHOUSE'));add(g,buildIndustrialShelfUnitV3({semantic:'SPAREPART_BULK_SHELF',width:1.3,height:2.0}),0,-1.55,0);add(g,buildPartsPickingCartV3({semantic:'SPAREPART_PICKING_CART'}),1.9,-1.20,Math.PI/2);return g;}
function pantry(){const g=decorateBase('PANTRY',buildRoomFurnitureReferenceV2('PANTRY'));add(g,buildPantrySinkModuleV3({semantic:'PANTRY_SINK_MODULE'}),0,1.55,Math.PI);add(g,buildOfficeWasteBinV3({semantic:'PANTRY_WASTE_BIN'}),1.75,-1.15,0);return g;}
function locker(){const g=decorateBase('LOCKER_CHANGE',buildRoomFurnitureReferenceV2('LOCKER_CHANGE'));add(g,buildLockerHookRailV3({semantic:'LOCKER_COAT_HOOK_RAIL',width:1.3}),-1.70,-1.25,0,1.55);add(g,buildShoeBenchComboV3({semantic:'LOCKER_SHOE_BENCH_COMBO',width:1.6}),1.25,-1.20,0);return g;}
function prayer(){const g=decorateBase('PRAYER_ROOM',buildRoomFurnitureReferenceV2('PRAYER_ROOM'));add(g,buildWallClockV3({semantic:'PRAYER_ROOM_CLOCK'}),0,1.75,Math.PI,1.8);return g;}
function toilet(){const g=decorateBase('TOILET',buildRoomFurnitureReferenceV2('TOILET'));add(g,buildRestroomHandDryStationV3({semantic:'TOILET_HAND_DRY_STATION'}),1.65,-.30,-Math.PI/2,1.05);return g;}
function janitor(){const g=decorateBase('JANITOR',buildRoomFurnitureReferenceV2('JANITOR'));add(g,buildDrumSpillPalletV3({semantic:'JANITOR_CHEMICAL_SPILL_TRAY_REFERENCE'}),1.05,.75,Math.PI);return g;}
function electrical(){return decorateBase('ELECTRICAL',buildRoomFurnitureReferenceV2('ELECTRICAL'));}
function firePump(){return decorateBase('FIRE_PUMP_ROOM',buildRoomFurnitureReferenceV2('FIRE_PUMP_ROOM'));}
function broke(){const g=decorateBase('BROKE_WASTE_ROOM',buildRoomFurnitureReferenceV2('BROKE_WASTE_ROOM'));add(g,buildIndustrialShelfUnitV3({semantic:'BROKE_HOUSEKEEPING_SHELF',width:1.0,height:1.8}),1.55,1.10,Math.PI);return g;}
function dispatch(){const g=decorateBase('DISPATCH_LOADING',buildRoomFurnitureReferenceV2('DISPATCH_LOADING'));add(g,buildPackingConsumablesRackV3({semantic:'DISPATCH_PACKING_CONSUMABLES'}),-1.75,1.15,Math.PI);add(g,buildDockDocumentPedestalV3({semantic:'DISPATCH_DOCUMENT_PEDESTAL'}),1.8,.80,-Math.PI/2);return g;}
function rms(){const g=decorateBase('RMS',buildRoomFurnitureReferenceV2('RMS'));for(const x of [-3.25,0,3.25])add(g,buildWarehouseEndGuardV3({semantic:'RMS_RACK_END_GUARD'}),x,2.7,Math.PI);for(const [x,z] of [[-3.8,2.1],[-2.7,2.1],[-.55,2.1],[.55,2.1],[2.7,2.1],[3.8,2.1]])add(g,buildRackUprightProtectorV3({semantic:'RMS_UPRIGHT_PROTECTOR'}),x,z,0);add(g,buildMaterialStatusTotemV3({semantic:'RMS_STATUS_TOTEM'}),3.9,-2.9,-Math.PI/2);add(g,buildReelStopCradleV3({semantic:'RMS_REEL_CRADLE_A'}),-2.7,-2.3,0);add(g,buildReelStopCradleV3({semantic:'RMS_REEL_CRADLE_B'}),-.6,-2.3,0);return g;}
function fg(){const g=decorateBase('FINISHED_GOODS',buildRoomFurnitureReferenceV2('FINISHED_GOODS'));add(g,buildPackingConsumablesRackV3({semantic:'FG_PACKING_CONSUMABLES'}),2.8,2.3,Math.PI);add(g,buildDockDocumentPedestalV3({semantic:'FG_SHIPPING_DOCUMENT_PEDESTAL'}),-2.8,2.2,Math.PI);return g;}
function production(){const g=decorateBase('PRODUCTION',buildRoomFurnitureReferenceV2('PRODUCTION'));add(g,buildLineSideKanbanRackV3({semantic:'PRODUCTION_KANBAN_RACK'}),-1.55,.95,Math.PI);add(g,buildMobileQCStationV3({semantic:'PRODUCTION_MOBILE_QC'}),1.45,-.95,0);return g;}
function exterior(){return decorateBase('EXTERIOR',buildRoomFurnitureReferenceV2('EXTERIOR'));}

export const ROOM_BUILDERS_V3=Object.freeze({ADMIN_OFFICE:admin,PPIC_OFFICE:ppic,SUPERVISOR_OFFICE:supervisor,MEETING:meeting,QC_SAMPLE:()=>qc('QC_SAMPLE'),INCOMING_QC:()=>qc('INCOMING_QC'),PDS_PREPRESS_OFFICE:pds,PREPRESS:prepress,WORKSHOP:()=>workshop('WORKSHOP'),MAINTENANCE:()=>workshop('MAINTENANCE'),SPAREPART_WAREHOUSE:spare,PANTRY:pantry,LOCKER_CHANGE:locker,PRAYER_ROOM:prayer,TOILET:toilet,JANITOR:janitor,ELECTRICAL:electrical,FIRE_PUMP_ROOM:firePump,BROKE_WASTE_ROOM:broke,DISPATCH_LOADING:dispatch,RMS:rms,FINISHED_GOODS:fg,PRODUCTION:production,EXTERIOR:exterior});

export function buildRoomFurnitureReferenceV3(program,opts={}){const f=ROOM_BUILDERS_V3[program];if(!f)throw new Error(`Unsupported V3 room program: ${program}`);const g=f();if(opts.microWear!==false)applyMicroWearV3(g,{intensity:opts.microWearIntensity??.08,seed:opts.seed??1});g.userData.requestedEnvelope=opts.width||opts.depth?{width:opts.width,depth:opts.depth}:g.userData.requestedEnvelope;g.userData.constructionAudit=assetConstructionAuditV3(g);return g;}

export function roomReadinessAuditV3(program,root){const sem=[];root.traverse(o=>{if(o.userData?.semantic)sem.push(String(o.userData.semantic));});const required=V3_ROOM_MICRODETAILS[program]||[];const cues={clock:sem.some(s=>/CLOCK/.test(s)),waste:sem.some(s=>/WASTE|BIN/.test(s)),storage:sem.some(s=>/CABINET|RACK|SHELF|SORTER|CREDENZA/.test(s)),mobility:sem.some(s=>/CASTER|TROLLEY|CART|PALLET_JACK/.test(s)),labeling:sem.some(s=>/LABEL|STATUS|BOARD/.test(s))};return {program,requiredConcepts:required,semanticCount:sem.length,cues,pass:sem.length>=8};}