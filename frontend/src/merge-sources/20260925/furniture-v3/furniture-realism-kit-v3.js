import * as T from 'three';
export * from './furniture-realism-kit-v2.js';
import {REALISM_POLICY_V3,V3_QUALITY_GATES} from './furniture-realism-research-v3.js';
import {buildFurnitureAssetV2,furnitureMaterial,roundedBox,buildTaskChair,buildOfficeDesk,buildPlanningBoard,buildMaterialStatusBoard,buildPlatformTrolley,buildFloorScale,buildPalletJack} from './furniture-realism-kit-v2.js';

export const FURNITURE_REALISM_VERSION_V3='FRK-V3-2026-09-25';
const ACC=REALISM_POLICY_V3.status;
const M=(name,over={})=>furnitureMaterial(name,over);
function tag(o,semantic,extra={}){o.name=semantic;o.userData={...(o.userData||{}),semantic,accuracy:ACC,version:FURNITURE_REALISM_VERSION_V3,...extra};return o;}
function box(w,h,d,mat='powderSteel',r=.015){return roundedBox(w,h,d,Math.min(r,w*.2,h*.2,d*.2),M(mat));}
function add(g,o,x=0,y=0,z=0,rx=0,ry=0,rz=0){o.position.set(x,y,z);o.rotation.set(rx,ry,rz);g.add(o);return o;}
function cyl(r,h,mat='powderSteel',seg=16){return new T.Mesh(new T.CylinderGeometry(r,r,h,seg),M(mat));}
function rod(a,b,r=.01,mat='powderSteel'){const d=new T.Vector3().subVectors(b,a),m=new T.Mesh(new T.CylinderGeometry(r,r,d.length(),10),M(mat));m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize());return m;}
function caster(g,x,z,{wheelR=.035,wheelW=.022,y=.038,semantic='CASTER'}={}){const fork=box(.052,.07,.04,'darkMetal',.006);add(g,tag(fork,semantic+'_FORK'),x,y+.035,z);for(const sx of [-wheelW*.52,wheelW*.52]){const wh=cyl(wheelR,wheelW,'rubber',14);wh.rotation.z=Math.PI/2;add(g,tag(wh,semantic+'_WHEEL'),x+sx,y,z);}const pin=cyl(.009,.035,'chrome',10);add(g,tag(pin,semantic+'_KINGPIN'),x,y+.09,z);}
function foot(g,x,z,semantic='LEVELING_FOOT'){const stem=cyl(.009,.055,'chrome',10);add(g,tag(stem,semantic+'_STEM'),x,.045,z);const pad=cyl(.025,.012,'rubber',14);add(g,tag(pad,semantic+'_PAD'),x,.008,z);}
function screw(g,x,y,z,semantic='FASTENER'){const s=cyl(.008,.006,'chrome',10);s.rotation.x=Math.PI/2;add(g,tag(s,semantic),x,y,z);}
function labelPlate(g,x,y,z,w=.14,h=.055,semantic='LABEL'){add(g,tag(box(w,h,.006,'paper',.003),semantic+'_PLATE'),x,y,z);}
function handleBar(g,x,y,z,len=.18,semantic='HANDLE'){add(g,tag(rod(new T.Vector3(x-len/2,y,z),new T.Vector3(x+len/2,y,z),.008,'darkMetal'),semantic),0,0,0);}

export function buildErgonomicTaskChairV3(opts={}){
 const g=buildTaskChair({...opts,semantic:opts.semantic||'ERGONOMIC_TASK_CHAIR_V3'});tag(g,opts.semantic||'ERGONOMIC_TASK_CHAIR_V3',{constructionContract:'TASK_CHAIR'});
 // add independent caster forks/hubs and under-seat mechanism cue without duplicating main envelope
 const mech=box(.24,.065,.20,'darkMetal',.02);add(g,tag(mech,g.name+'_TILT_MECHANISM'),0,.40,.02);
 const lever=rod(new T.Vector3(.13,.41,.02),new T.Vector3(.29,.37,.04),.007,'darkMetal');add(g,tag(lever,g.name+'_TILT_LEVER'));
 const knob=cyl(.018,.025,'rubber',12);knob.rotation.z=Math.PI/2;add(g,tag(knob,g.name+'_TENSION_KNOB'),-.16,.395,.04);
 return g;
}

export function buildOfficeWorkstationV3(opts={}){
 const s=opts.semantic||'OFFICE_WORKSTATION_V3',g=new T.Group();tag(g,s,{constructionContract:'DESK'});const w=opts.width??1.5,d=opts.depth??.72,h=opts.height??.74;
 const top=box(w,.045,d,'laminateOak',.018);add(g,tag(top,s+'_WORKTOP'),0,h,0);const edge=box(w+.006,.018,d+.006,'darkWood',.006);add(g,tag(edge,s+'_EDGE_BAND'),0,h-.014,0);
 for(const x of [-w/2+.06,w/2-.06])for(const z of [-d/2+.06,d/2-.06]){const leg=box(.045,h-.08,.045,'powderSteel',.006);add(g,tag(leg,s+'_FRAME_LEG'),x,(h-.08)/2,z);foot(g,x,z,s+'_FOOT');}
 add(g,tag(box(w-.20,.06,.10,'powderSteel',.008),s+'_CABLE_TRAY'),0,h-.17,d*.27);
 const grom=cyl(.035,.012,'darkMetal',18);add(g,tag(grom,s+'_CABLE_GROMMET'),w*.32,h+.028,d*.25);
 add(g,tag(box(.38,.56,.50,'lightSteel',.015),s+'_MOBILE_PEDESTAL'),w*.30,.30,-d*.10);for(let i=0;i<3;i++){add(g,tag(box(.34,.14,.012,'powderSteel',.004),s+'_DRAWER_FRONT'),w*.30,.14+i*.17,-d*.36);handleBar(g,w*.30,.14+i*.17,-d*.37,.16,s+'_DRAWER_HANDLE');}
 // power/data rail + cable drop
 add(g,tag(box(.34,.055,.07,'darkMetal',.008),s+'_POWER_DATA_RAIL'),-w*.16,h-.12,d*.29);for(let i=0;i<3;i++){const p=cyl(.012,.008,'rubber',12);p.rotation.x=Math.PI/2;add(g,tag(p,s+'_POWER_DATA_PORT'),-w*.25+i*.09,h-.12,d*.335);}
 return g;
}

export function buildDocumentSorterV3(opts={}){const s=opts.semantic||'DOCUMENT_SORTER',g=new T.Group();tag(g,s);const w=opts.width??.86,h=opts.height??1.35,d=opts.depth??.36,cols=opts.cols??3,rows=opts.rows??5;add(g,tag(box(w,h,d,'lightSteel',.012),s+'_CARCASS'),0,h/2,0);for(let c=1;c<cols;c++)add(g,tag(box(.018,h-.08,d-.04,'powderSteel',.004),s+'_VERTICAL_DIVIDER'),-w/2+c*w/cols,h/2,0);for(let r=1;r<rows;r++)add(g,tag(box(w-.04,.018,d-.04,'powderSteel',.004),s+'_SHELF'),0,r*h/rows,0);for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)labelPlate(g,-w/2+(c+.5)*w/cols,(r+.5)*h/rows,-d/2-.005,w/cols*.45,.04,s+'_LOCATION_LABEL');return g;}

export function buildWallClockV3(opts={}){const s=opts.semantic||'WALL_CLOCK',g=new T.Group();tag(g,s);const r=opts.radius??.15;const face=new T.Mesh(new T.CircleGeometry(r,32),M('paper'));add(g,tag(face,s+'_FACE'),0,0,0);const rim=new T.Mesh(new T.TorusGeometry(r,.012,8,32),M('darkMetal'));add(g,tag(rim,s+'_RIM'));for(let i=0;i<12;i++){const a=i*Math.PI/6;add(g,tag(box(.006,.025,.006,'darkMetal',.002),s+'_INDEX'),Math.sin(a)*r*.80,Math.cos(a)*r*.80,.004);}add(g,tag(rod(new T.Vector3(0,0,.008),new T.Vector3(.055,.035,.008),.005,'darkMetal'),s+'_HOUR_HAND'));add(g,tag(rod(new T.Vector3(0,0,.01),new T.Vector3(-.02,.09,.01),.003,'darkMetal'),s+'_MINUTE_HAND'));return g;}

export function buildOfficeWasteBinV3(opts={}){const s=opts.semantic||'OFFICE_WASTE_BIN',g=new T.Group();tag(g,s);const body=new T.Mesh(new T.CylinderGeometry(.13,.11,.30,20,1,true),M('polymer'));add(g,tag(body,s+'_BODY'),0,.15,0);const rim=new T.Mesh(new T.TorusGeometry(.13,.009,8,24),M('darkPolymer'));rim.rotation.x=Math.PI/2;add(g,tag(rim,s+'_RIM'),0,.30,0);return g;}

export function buildQCLightBoothV3(opts={}){const s=opts.semantic||'QC_LIGHT_BOOTH_V3',g=new T.Group();tag(g,s,{reference:'XRITE_JUDGE_QC',nominalEnvelopeM:[.685,.545,.535]});const w=.685,h=.545,d=.535,t=.028;add(g,tag(box(w,t,d,'neutralGray',.008),s+'_BASE'),0,t/2,0);add(g,tag(box(t,h,d,'neutralGray',.008),s+'_LEFT'),-w/2+t/2,h/2,0);add(g,tag(box(t,h,d,'neutralGray',.008),s+'_RIGHT'),w/2-t/2,h/2,0);add(g,tag(box(w,h,t,'neutralGray',.008),s+'_BACK'),0,h/2,d/2-t/2);add(g,tag(box(w,.11,d,'neutralGray',.010),s+'_LAMP_HOOD'),0,h-.055,0);add(g,tag(box(w-.10,.018,d-.08,'lightDiffuser',.005),s+'_DIFFUSER'),0,h-.118,0);add(g,tag(box(.18,.055,.025,'darkMetal',.005),s+'_CONTROL_PANEL'),w*.24,h-.055,-d/2-.014);for(let i=0;i<5;i++){const b=cyl(.008,.008,i===4?'redPlastic':'greenPlastic',12);b.rotation.x=Math.PI/2;add(g,tag(b,s+'_CONTROL_INDICATOR'),w*.18+i*.025,h-.055,-d/2-.03);}return g;}

export function buildQCReferenceTileRackV3(opts={}){const s=opts.semantic||'QC_SAMPLE_TILE_RACK',g=new T.Group();tag(g,s);const w=opts.width??.80,h=opts.height??1.55,d=opts.depth??.36;add(g,tag(box(w,h,d,'lightSteel',.012),s+'_CARCASS'),0,h/2,0);for(let i=0;i<6;i++){const y=.18+i*.22;add(g,tag(box(w-.08,.018,d-.06,'powderSteel',.004),s+'_SHELF'),0,y,0);for(let j=0;j<4;j++){const sample=box(.12,.10,.012,j%2?'paper':'polymer',.002);add(g,tag(sample,s+'_SAMPLE_REFERENCE'),-w*.30+j*.20,y+.06,-d/2-.01);}}return g;}

export function buildIndustrialShelfUnitV3(opts={}){const s=opts.semantic||'INDUSTRIAL_SHELF',g=new T.Group();tag(g,s);const w=opts.width??1.20,d=opts.depth??.50,h=opts.height??2.0,levels=opts.levels??5;for(const x of [-w/2,w/2])for(const z of [-d/2,d/2]){const p=box(.045,h,.045,'galvanized',.004);add(g,tag(p,s+'_UPRIGHT'),x,h/2,z);foot(g,x,z,s+'_FOOT');}for(let i=0;i<levels;i++){const y=.12+i*(h-.18)/(levels-1);add(g,tag(box(w,.035,d,'galvanized',.004),s+'_SHELF'),0,y,0);add(g,tag(box(w,.055,.035,'powderSteel',.004),s+'_FRONT_LIP'),0,y+.025,-d/2);for(const x of [-w/2+.08,w/2-.08])screw(g,x,y+.03,-d/2-.02,s+'_FASTENER');}return g;}

export function buildPartsPickingCartV3(opts={}){const s=opts.semantic||'PARTS_PICKING_CART',g=new T.Group();tag(g,s);const w=.88,d=.54,h=1.15;add(g,tag(box(w,.08,d,'powderSteel',.01),s+'_BASE'),0,.10,0);for(const x of [-w/2+.04,w/2-.04])for(const z of [-d/2+.04,d/2-.04])add(g,tag(box(.035,h-.20,.035,'powderSteel',.004),s+'_UPRIGHT'),x,.10+(h-.20)/2,z);for(const y of [.36,.68,1.00])add(g,tag(box(w-.08,.035,d-.08,'galvanized',.004),s+'_SHELF'),0,y,0);for(const x of [-.30,.30])for(const z of [-.20,.20])caster(g,x,z,{semantic:s+'_CASTER'});const handle=rod(new T.Vector3(w/2,.72,-.18),new T.Vector3(w/2,.98,-.18),.015,'powderSteel');add(g,tag(handle,s+'_PUSH_HANDLE'));return g;}

export function buildWorkbenchPowerRailV3(opts={}){const s=opts.semantic||'WORKBENCH_POWER_RAIL',g=new T.Group();tag(g,s);const w=opts.width??1.4;add(g,tag(box(w,.09,.06,'darkMetal',.008),s+'_BODY'),0,.05,0);for(let i=0;i<6;i++){const socket=cyl(.016,.008,'rubber',14);socket.rotation.x=Math.PI/2;add(g,tag(socket,s+'_SOCKET'),-w*.38+i*w*.15,.05,-.035);}const e=cyl(.008,.008,'greenPlastic',10);e.rotation.x=Math.PI/2;add(g,tag(e,s+'_POWER_INDICATOR'),w*.43,.05,-.035);return g;}

export function buildMaintenancePPEStationV3(opts={}){const s=opts.semantic||'MAINTENANCE_PPE_STATION',g=new T.Group();tag(g,s);const w=.72,h=1.55;add(g,tag(box(w,h,.08,'lightSteel',.008),s+'_BACKBOARD'),0,h/2,0);for(let i=0;i<4;i++){const hk=rod(new T.Vector3(-.24+i*.16,.95,-.06),new T.Vector3(-.24+i*.16,.95,-.18),.008,'chrome');add(g,tag(hk,s+'_HOOK'));}for(let i=0;i<3;i++){const bin=box(.18,.16,.14,i===0?'yellowPlastic':i===1?'bluePlastic':'polymer',.015);add(g,tag(bin,s+'_DISPENSER_BIN'),-.22+i*.22,.50,-.12);}labelPlate(g,0,1.35,-.05,.38,.10,s+'_PPE_LABEL');return g;}

export function buildLockerHookRailV3(opts={}){const s=opts.semantic||'LOCKER_HOOK_RAIL',g=new T.Group();tag(g,s);const w=opts.width??1.2;add(g,tag(box(w,.06,.04,'powderSteel',.006),s+'_RAIL'),0,.03,0);for(let i=0;i<6;i++){const x=-w*.42+i*w*.168;const a=rod(new T.Vector3(x,.02,0),new T.Vector3(x,-.04,-.08),.007,'chrome');add(g,tag(a,s+'_HOOK'));}return g;}

export function buildShoeBenchComboV3(opts={}){const s=opts.semantic||'SHOE_BENCH_COMBO',g=new T.Group();tag(g,s);const w=opts.width??1.5,d=.42,h=.46;for(let i=0;i<4;i++)add(g,tag(box(w,.045,.065,'laminateOak',.006),s+'_BENCH_SLAT'),0,h,-d*.35+i*.09);for(const x of [-w/2+.12,w/2-.12])add(g,tag(box(.06,h-.06,.36,'powderSteel',.006),s+'_LEG_FRAME'),x,(h-.06)/2,0);for(const y of [.12,.25])add(g,tag(box(w-.18,.025,d-.08,'powderSteel',.004),s+'_SHOE_SHELF'),0,y,0);return g;}

export function buildPantrySinkModuleV3(opts={}){const s=opts.semantic||'PANTRY_SINK_MODULE',g=new T.Group();tag(g,s);const w=opts.width??1.2,d=.62,h=.90;add(g,tag(box(w,.06,d,'laminateLight',.012),s+'_COUNTERTOP'),0,h,0);for(const x of [-w*.26,w*.26])add(g,tag(box(w*.47,h-.08,d-.05,'lightSteel',.01),s+'_BASE_CABINET'),x,(h-.08)/2,0);add(g,tag(box(.52,.045,.40,'stainless',.012),s+'_SINK_RIM'),0,h+.025,0);add(g,tag(box(.44,.16,.32,'stainless',.012),s+'_SINK_BOWL'),0,h-.055,0);const spout=rod(new T.Vector3(0,h+.07,d*.20),new T.Vector3(0,h+.28,.06),.012,'chrome');add(g,tag(spout,s+'_FAUCET_NECK'));const outlet=rod(new T.Vector3(0,h+.28,.06),new T.Vector3(0,h+.24,-.04),.012,'chrome');add(g,tag(outlet,s+'_FAUCET_SPOUT'));return g;}

export function buildRestroomHandDryStationV3(opts={}){const s=opts.semantic||'RESTROOM_HAND_DRY_STATION',g=new T.Group();tag(g,s);add(g,tag(box(.30,.40,.16,'lightSteel',.035),s+'_DRYER_BODY'),0,.20,0);add(g,tag(box(.18,.045,.035,'darkMetal',.008),s+'_AIR_OUTLET'),0,.04,-.09);const sensor=box(.055,.025,.01,'darkMetal',.004);add(g,tag(sensor,s+'_SENSOR'),0,.20,-.085);return g;}

export function buildRestroomPartitionFootV3(opts={}){const s=opts.semantic||'PARTITION_FOOT',g=new T.Group();tag(g,s);add(g,tag(box(.05,.18,.05,'stainless',.006),s+'_POST'),0,.09,0);add(g,tag(box(.11,.012,.11,'stainless',.006),s+'_BASE_PLATE'),0,.006,0);for(const [x,z] of [[-.035,-.035],[.035,-.035],[-.035,.035],[.035,.035]])screw(g,x,.014,z,s+'_ANCHOR');return g;}

export function buildSafetyCabinetV3(opts={}){const s=opts.semantic||'SAFETY_CABINET_REFERENCE',g=new T.Group();tag(g,s,{referenceOnly:true,complianceNotAsserted:true});const w=opts.width??1.09,h=opts.height??1.12,d=opts.depth??.46;add(g,tag(box(w,h,d,'yellowSteel',.018),s+'_DOUBLE_WALL_BODY'),0,h/2,0);for(const x of [-w*.245,w*.245]){add(g,tag(box(w*.48,h-.12,.024,'yellowSteel',.008),s+'_DOOR'),x,h/2,-d/2-.014);for(let i=0;i<3;i++){const hinge=box(.025,.07,.025,'darkMetal',.004);add(g,tag(hinge,s+'_HINGE'),x+(x<0?-w*.23:w*.23),.25+i*.28,-d/2-.03);}}handleBar(g,0,h*.52,-d/2-.055,.18,s+'_HANDLE');for(const y of [.18,h-.18]){const vent=cyl(.025,.02,'darkMetal',16);vent.rotation.x=Math.PI/2;add(g,tag(vent,s+'_VENT'),w*.38,y,-d/2-.035);}labelPlate(g,0,h*.78,-d/2-.04,.44,.10,s+'_WARNING_LABEL_REFERENCE');return g;}

export function buildDrumSpillPalletV3(opts={}){const s=opts.semantic||'SPILL_PALLET_REFERENCE',g=new T.Group();tag(g,s,{referenceOnly:true});const w=1.30,d=.70,h=.18;add(g,tag(box(w,h,d,'yellowPlastic',.03),s+'_SUMP_BODY'),0,h/2,0);for(let i=0;i<8;i++)add(g,tag(box(w-.10,.025,.035,'darkPolymer',.004),s+'_GRATING_SLAT'),0,h+.015,-d*.38+i*d*.11);return g;}

export function buildWarehouseEndGuardV3(opts={}){const s=opts.semantic||'WAREHOUSE_END_GUARD',g=new T.Group();tag(g,s);const w=opts.width??1.10,h=.55;for(const x of [-w/2,w/2]){add(g,tag(box(.10,h,.10,'yellowSteel',.015),s+'_POST'),x,h/2,0);add(g,tag(box(.19,.018,.19,'yellowSteel',.005),s+'_BASE_PLATE'),x,.009,0);for(const z of [-.06,.06])screw(g,x,.02,z,s+'_ANCHOR');}for(const y of [.20,.46])add(g,tag(box(w-.10,.07,.07,'yellowSteel',.012),s+'_RAIL'),0,y,0);return g;}

export function buildRackUprightProtectorV3(opts={}){const s=opts.semantic||'RACK_UPRIGHT_PROTECTOR',g=new T.Group();tag(g,s);const h=opts.height??.45;add(g,tag(box(.20,h,.18,'yellowSteel',.018),s+'_BODY'),0,h/2,0);add(g,tag(box(.28,.015,.26,'yellowSteel',.006),s+'_BASE'),0,.008,0);for(const [x,z] of [[-.09,-.08],[.09,-.08],[-.09,.08],[.09,.08]])screw(g,x,.02,z,s+'_ANCHOR');return g;}

export function buildReelStopCradleV3(opts={}){const s=opts.semantic||'REEL_CRADLE_V3',g=new T.Group();tag(g,s);const w=opts.width??1.75,d=opts.depth??1.1;add(g,tag(box(w,.10,d,'powderSteel',.008),s+'_BASE_FRAME'),0,.05,0);for(const x of [-w*.34,w*.34])for(const z of [-d*.32,d*.32]){const ch=box(.16,.26,.20,'rubber',.02);ch.rotation.z=x<0?-.30:.30;add(g,tag(ch,s+'_CHOCK'),x,.18,z);}for(const x of [-w/2+.08,w/2-.08])foot(g,x,0,s+'_FOOT');return g;}

export function buildMaterialStatusTotemV3(opts={}){const s=opts.semantic||'MATERIAL_STATUS_TOTEM',g=new T.Group();tag(g,s);add(g,tag(box(.10,1.65,.10,'powderSteel',.008),s+'_POST'),0,.825,0);add(g,tag(box(.52,.82,.06,'lightSteel',.012),s+'_BOARD'),0,1.35,0);for(let i=0;i<3;i++){const p=box(.38,.16,.012,i===0?'greenPlastic':i===1?'yellowPlastic':'redPlastic',.008);add(g,tag(p,s+'_STATUS_PANEL'),0,1.08+i*.22,-.04);}add(g,tag(box(.26,.018,.26,'darkMetal',.006),s+'_BASE_PLATE'),0,.009,0);return g;}

export function buildLineSideKanbanRackV3(opts={}){const s=opts.semantic||'LINE_SIDE_KANBAN_RACK',g=new T.Group();tag(g,s);const w=1.10,h=1.45,d=.48;for(const x of [-w/2,w/2])for(const z of [-d/2,d/2])add(g,tag(box(.035,h,.035,'powderSteel',.004),s+'_UPRIGHT'),x,h/2,z);for(const y of [.32,.68,1.04,1.40]){const shelf=box(w,.035,d,'galvanized',.004);shelf.rotation.x=-.06;add(g,tag(shelf,s+'_GRAVITY_SHELF'),0,y,0);}labelPlate(g,0,1.54,-d/2-.01,.38,.08,s+'_KANBAN_LABEL');return g;}

export function buildMobileQCStationV3(opts={}){const s=opts.semantic||'MOBILE_QC_STATION',g=new T.Group();tag(g,s);const w=.86,d=.56,h=.92;add(g,tag(box(w,.06,d,'stainless',.01),s+'_WORKTOP'),0,h,0);for(const x of [-w/2+.05,w/2-.05])for(const z of [-d/2+.05,d/2-.05])add(g,tag(box(.035,h-.10,.035,'powderSteel',.004),s+'_FRAME'),x,(h-.10)/2,z);add(g,tag(box(w-.10,.035,d-.10,'galvanized',.004),s+'_LOWER_SHELF'),0,.38,0);for(const x of [-w*.38,w*.38])for(const z of [-d*.38,d*.38])caster(g,x,z,{semantic:s+'_CASTER'});add(g,tag(box(.32,.12,.22,'polymer',.012),s+'_SAMPLE_TRAY'),-w*.20,h+.09,0);add(g,tag(box(.22,.16,.16,'darkMetal',.012),s+'_INSTRUMENT_REFERENCE'),w*.24,h+.11,0);return g;}

export function buildPackingConsumablesRackV3(opts={}){const s=opts.semantic||'PACKING_CONSUMABLES_RACK',g=new T.Group();tag(g,s);const w=1.0,h=1.65,d=.40;for(const x of [-w/2,w/2])for(const z of [-d/2,d/2])add(g,tag(box(.035,h,.035,'powderSteel',.004),s+'_UPRIGHT'),x,h/2,z);for(const y of [.35,.70,1.05,1.40])add(g,tag(box(w,.035,d,'galvanized',.004),s+'_SHELF'),0,y,0);for(let i=0;i<3;i++){const roll=cyl(.11,.22,'paper',20);roll.rotation.z=Math.PI/2;add(g,tag(roll,s+'_TAPE_OR_LABEL_ROLL_REFERENCE'),-.28+i*.28,1.52,0);}return g;}

export function buildDockDocumentPedestalV3(opts={}){const s=opts.semantic||'DOCK_DOCUMENT_PEDESTAL',g=new T.Group();tag(g,s);add(g,tag(box(.48,.95,.38,'powderSteel',.012),s+'_BODY'),0,.475,0);add(g,tag(box(.50,.045,.40,'stainless',.006),s+'_TOP'),0,.975,0);add(g,tag(box(.30,.018,.24,'paper',.004),s+'_DOCUMENT_TRAY'),0,1.015,0);labelPlate(g,0,.78,-.20,.28,.08,s+'_LOCATION_LABEL');return g;}

export function buildOutdoorSmokingNotIncludedMarkerV3(){const g=new T.Group();tag(g,'EXCLUDED_SMOKING_FURNITURE_MARKER',{render:false,reason:'Do not invent smoking area furniture without source evidence.'});g.visible=false;return g;}

export const BUILDER_CATALOG_V3=Object.freeze({
 ergonomic_task_chair_v3:buildErgonomicTaskChairV3,office_workstation_v3:buildOfficeWorkstationV3,document_sorter_v3:buildDocumentSorterV3,wall_clock_v3:buildWallClockV3,office_waste_bin_v3:buildOfficeWasteBinV3,
 qc_light_booth_v3:buildQCLightBoothV3,qc_sample_tile_rack_v3:buildQCReferenceTileRackV3,industrial_shelf_v3:buildIndustrialShelfUnitV3,parts_picking_cart_v3:buildPartsPickingCartV3,workbench_power_rail_v3:buildWorkbenchPowerRailV3,
 maintenance_ppe_station_v3:buildMaintenancePPEStationV3,locker_hook_rail_v3:buildLockerHookRailV3,shoe_bench_combo_v3:buildShoeBenchComboV3,pantry_sink_module_v3:buildPantrySinkModuleV3,restroom_hand_dry_station_v3:buildRestroomHandDryStationV3,
 restroom_partition_foot_v3:buildRestroomPartitionFootV3,safety_cabinet_v3:buildSafetyCabinetV3,drum_spill_pallet_v3:buildDrumSpillPalletV3,warehouse_end_guard_v3:buildWarehouseEndGuardV3,rack_upright_protector_v3:buildRackUprightProtectorV3,
 reel_stop_cradle_v3:buildReelStopCradleV3,material_status_totem_v3:buildMaterialStatusTotemV3,line_side_kanban_rack_v3:buildLineSideKanbanRackV3,mobile_qc_station_v3:buildMobileQCStationV3,packing_consumables_rack_v3:buildPackingConsumablesRackV3,dock_document_pedestal_v3:buildDockDocumentPedestalV3
});

export function buildFurnitureAssetV3(kind,opts={}){const f=BUILDER_CATALOG_V3[kind];return f?f(opts):buildFurnitureAssetV2(kind,opts);}

export function applyMicroWearV3(root,{intensity=.10,seed=1}={}){
 // Deterministic, restrained wear metadata only; renderer may translate to decals/roughness variation later.
 let i=0;root.traverse(o=>{if(!o.isMesh)return;const s=String(o.userData?.semantic||'');if(/FLOOR|RUBBER|WORKTOP|HANDLE|CASTER|PALLET|RACK|TROLLEY|BIN/.test(s)){o.userData.microWear={intensity:Math.min(.22,intensity*(.65+((seed+i*17)%11)/20)),mode:/FLOOR/.test(s)?'SCUFF':/HANDLE|CASTER/.test(s)?'CONTACT_POLISH':'EDGE_AND_CONTACT'};i++;}});return root;
}

export function assetConstructionAuditV3(root){
 const sem=[];root.traverse(o=>{if(o.userData?.semantic)sem.push(String(o.userData.semantic));});const families={fastener:0,handle:0,hinge:0,caster:0,foot:0,label:0,frame:0,shelf:0,guard:0,cable:0};for(const s of sem){for(const k of Object.keys(families))if(s.toUpperCase().includes(k.toUpperCase()))families[k]++;}
 return {semanticCount:sem.length,families,detailScore:Object.values(families).reduce((a,b)=>a+Math.min(4,b),0),policy:ACC};
}

export function furnitureProximityAuditV3(root,{doorZones=[],machineServiceBoxes=[],roomBounds=null}={}){
 const violations=[];const tmp=new T.Box3();root.traverse(o=>{if(!o.isMesh)return;tmp.setFromObject(o);const s=o.userData?.semantic||o.name||'MESH';for(const z of doorZones){if(tmp.max.x>z.minX&&tmp.min.x<z.maxX&&tmp.max.z>z.minZ&&tmp.min.z<z.maxZ)violations.push({type:'DOOR_APPROACH',semantic:s});}for(const z of machineServiceBoxes){if(tmp.max.x>z.minX&&tmp.min.x<z.maxX&&tmp.max.z>z.minZ&&tmp.min.z<z.maxZ)violations.push({type:'MACHINE_SERVICE',semantic:s});}if(roomBounds&&(tmp.min.x<roomBounds.minX||tmp.max.x>roomBounds.maxX||tmp.min.z<roomBounds.minZ||tmp.max.z>roomBounds.maxZ))violations.push({type:'ROOM_BOUNDS',semantic:s});});return {violations,pass:violations.length===0,qualityGates:V3_QUALITY_GATES};
}