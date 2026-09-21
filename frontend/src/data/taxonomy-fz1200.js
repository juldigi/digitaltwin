const SRC=Object.freeze(['BMJ-ASSET-REGISTRY-FZ','UANCHOR-FZ1200-EXACT-MODEL','JMM-FZ1200-BMJ','FZ1200-EVIDENCE-BOUNDARY']);
const NAMES=Object.freeze({
 'BMJ-MCH-0007':'PLT 1 · PILE TURNER 01 · FZ 1200',
 'BMJ-MCH-0008':'PLT 3 · PILE TURNER 03 · FZ 1200',
 'BMJ-MCH-0022':'PLT 1 · PILE TURNER 2 · FZ 1200'
});
const COMPONENTS=Object.freeze({
 BASE:Object.freeze([
  ['FRAME','Floor Base Frame','fz1200-base-frame','Main floor base / longitudinal support rails'],
  ['LIFT','Vertical Lift Carriage','fz1200-base-lift','Lift columns / carriage guiding the pile assembly vertically'],
  ['PALLET','Lower Pallet Platform','fz1200-base-pallet','Lower pile/pallet support platform']
 ]),
 CLAMP:Object.freeze([
  ['UPPER','Upper Clamp Plate','fz1200-clamp-upper','Movable upper pile-clamping plate'],
  ['LOWER','Lower Clamp / Pallet Plate','fz1200-clamp-lower','Lower clamp/support plate'],
  ['COLUMN','Clamp Guide Columns','fz1200-clamp-column','Clamp guide columns / sliding supports']
 ]),
 TURN:Object.freeze([
  ['YOKE','Turning Yoke','fz1200-turn-yoke','Rotating structure carrying the clamped pile'],
  ['TRUNNION','Trunnion Bearings & Shaft','fz1200-turn-trunnion','Horizontal turning pivot / bearing supports'],
  ['DRIVE','Rotation Drive Interface','fz1200-turn-drive','Rotation motor/gear interface reference']
 ]),
 AIR:Object.freeze([
  ['BLOWER','High-Pressure Air Blower','fz1200-air-blower','High-pressure air source for airing / separation'],
  ['NOZZLE','Air-Jet Manifold','fz1200-air-nozzle','Air manifold / nozzle bank; installed nozzle count unverified'],
  ['DUST','Dust / Powder Removal Path','fz1200-air-dust','Dust extraction / collection path reference']
 ]),
 JOG:Object.freeze([
  ['SIDE','Side Jogger Plates','fz1200-jog-side','Side alignment plates acting across pile width'],
  ['FRONT','Front / Back Alignment Plates','fz1200-jog-front','Longitudinal alignment plates'],
  ['VIB','Vibration Tray / Drive','fz1200-jog-vibration','Vibration source used with airing for separation/alignment'],
  ['GAUGE','Gauge Block Reference','fz1200-jog-gauge','Gauge block / pile positioning reference documented on exact-model product page']
 ]),
 HYD:Object.freeze([
  ['CYL','Hydraulic Cylinders','fz1200-hyd-cylinder','Hydraulic lift / clamp cylinder reference; installed cylinder count unverified'],
  ['POWER','Hydraulic Station / Power Pack','fz1200-hyd-power','Hydraulic pump, motor and reservoir station reference'],
  ['HOSE','Hydraulic Hose Routing','fz1200-hyd-hose','Hydraulic hose / line routing interface']
 ]),
 CONTROL:Object.freeze([
  ['HMI','Operator Control Panel','fz1200-control-hmi','Operator control / status panel'],
  ['SAFETY','Safety Interlock / E-Stop','fz1200-control-safety','Emergency-stop and safety-interlock architecture'],
  ['GUARD','Perimeter Guard','fz1200-control-guard','Machine perimeter / access guarding reference']
 ])
});
const buildRows=(assetId='BMJ-MCH-0007')=>{
 const rows=[],root='FZ1200';
 const add=(id,parentId,level,levelName,name,meshRefs,description,confidence='FZ1200_EXACT_MODEL_REFERENCE__BMJ_OEM_UNVERIFIED',verified=false)=>rows.push(Object.freeze({
  id,parentId,level,levelName,name,machineZone:name,meshRefs:Object.freeze(meshRefs||[]),sourceRefs:SRC,
  confidence,verified,explodeVector:[level===2?.58:.12,level<4?.18:.08,0],
  explodeDistance:level===2?.76:level===3?.46:level===4?.29:level===5?.18:.11,focusCamera:null,description,maintenanceTag:null
 }));
 add(root,null,1,'Mesin',NAMES[assetId]||NAMES['BMJ-MCH-0007'],['fz1200-root'],'BMJ registry verifies model FZ 1200 and asset identity. Public exact-model references ground process and component names; installed OEM/spec values still require nameplate/manual verification.','BMJ_MODEL_IDENTITY_VERIFIED',true);
 const units=[
  ['BASE','Base & Lift','fz1200-base','Base structure, lift carriage and pallet support.'],
  ['CLAMP','Pile Clamp Assembly','fz1200-clamp','Hydraulic pile clamping structure.'],
  ['TURN','Turning Yoke / Trunnion','fz1200-turn','180-degree pile-turning structure and pivot.'],
  ['AIR','Air Separation / Dust Removal','fz1200-air','High-pressure airing, sheet separation and dust-removal path.'],
  ['JOG','Jogging / Alignment','fz1200-jog','Vibration and alignment mechanisms.'],
  ['HYD','Hydraulic Drive','fz1200-hydraulic','Hydraulic actuation and power station.'],
  ['CONTROL','Safety & Control','fz1200-control','Operator controls, interlocks and guard boundary.']
 ];
 for(const [code,name,mesh,desc] of units){
  const u=root+'.'+code;add(u,root,2,'Unit Utama',name,[mesh],desc);
  for(const [sid,sname,ref,sdesc] of COMPONENTS[code]){
   const a=u+'.'+sid,b=a+'.BLOCK',d=b+'.PART',e=d+'.SPEC';
   add(a,u,3,'Sub',sname,[ref],sdesc);
   add(b,a,4,'Block',sname+' Functional Block',[ref],sdesc);
   add(d,b,5,'Part',sname+' Service Group',[ref],sdesc);
   add(e,d,6,'Spesifik Part',sname,[ref],sdesc);
  }
 }
 return Object.freeze(rows);
};
export const FZ1200_TAXONOMY=buildRows('BMJ-MCH-0007');
export function fz1200TaxonomyFor(assetId='BMJ-MCH-0007'){return buildRows(assetId);}
export const fz1200TaxonomyStats=(assetId='BMJ-MCH-0007')=>{const rows=fz1200TaxonomyFor(assetId);return{total:rows.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,rows.filter(n=>n.level===level).length]))};};
