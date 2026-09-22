// V135 AHU duct scaffold. Preview geometry is deliberately not positioned in the production hall.
const ahuIds=['BMJ-MCH-0036','BMJ-MCH-0037','BMJ-MCH-0038','BMJ-MCH-0039','BMJ-MCH-0040','BMJ-MCH-0041'];
const equipmentAnchors=[];
for(const machineId of ahuIds)for(const port of ['SUPPLY_AIR','RETURN_AIR','OUTDOOR_AIR','EXHAUST_AIR_OPTION'])equipmentAnchors.push(Object.freeze({id:'AHUD-'+machineId+'-'+port,machineId,port,status:port.includes('OPTION')?'OPTION_BOUNDARY_UNPLACED':'UNPLACED_EQUIPMENT_ANCHOR',futureFields:Object.freeze(['x','y','z','direction','widthMm','heightMm','elevationBottomM'])}));
export const AHU_DUCT_ROUTING_TEMPLATE=Object.freeze({
 id:'BMJ-UTILITY-AHU-DUCTING-V1',system:'AHU_DUCTING',layerKey:'utility_ahu_ducting',status:'TEMPLATE_ONLY',schemaVersion:1,
 previewOrigin:Object.freeze([108,0,-66]),equipmentAnchors:Object.freeze(equipmentAnchors),
 engineeringBoundary:Object.freeze({actualRouteVerified:false,actualDuctSizeVerified:false,actualInsulationVerified:false,fireDamperLocationsVerified:false,note:'Supply/return/outdoor-air geometry is a reusable duct-routing scaffold only.'}),
 componentCatalog:Object.freeze(['RECT_STRAIGHT','ROUND_STRAIGHT','HORIZONTAL_ELBOW','VERTICAL_ELBOW','TRANSITION','TEE','WYE','REDUCER','FLEX_CONNECTOR','VOLUME_DAMPER','FIRE_DAMPER_OPTION','ACCESS_DOOR','PLENUM','DIFFUSER','RETURN_GRILLE','OUTDOOR_LOUVER']),
 nodes:Object.freeze([
  {id:'AD-AHU-SA',p:[0,2.20,0],kind:'FLEX_CONNECTOR'},{id:'AD-SA-TRANS',p:[1.2,2.20,0],kind:'TRANSITION'},{id:'AD-SA-RISER',p:[2.0,4.10,0],kind:'VERTICAL_ELBOW'},
  {id:'AD-SA-T1',p:[4.3,4.10,0],kind:'TEE'},{id:'AD-SA-T2',p:[7.0,4.10,0],kind:'TEE'},{id:'AD-SA-END',p:[10.5,4.10,0],kind:'FUTURE_CAP'},
  {id:'AD-DIFF-1',p:[4.3,2.75,-2.0],kind:'DIFFUSER'},{id:'AD-DIFF-2',p:[7.0,2.75,-2.0],kind:'DIFFUSER'},{id:'AD-DIFF-3',p:[9.4,2.75,2.0],kind:'DIFFUSER'},
  {id:'AD-RET-G1',p:[4.8,2.75,3.0],kind:'RETURN_GRILLE'},{id:'AD-RET-G2',p:[8.2,2.75,3.0],kind:'RETURN_GRILLE'},
  {id:'AD-RA-T1',p:[4.8,4.45,2.0],kind:'TEE'},{id:'AD-RA-T2',p:[8.2,4.45,2.0],kind:'TEE'},{id:'AD-AHU-RA',p:[.3,2.35,2.0],kind:'FLEX_CONNECTOR'},
  {id:'AD-OA-LOUVER',p:[-1.8,2.7,-2.6],kind:'OUTDOOR_LOUVER'},{id:'AD-OA-MIX',p:[-.2,2.35,-1.0],kind:'VOLUME_DAMPER'}
 ].map(n=>Object.freeze({...n,p:Object.freeze(n.p),status:'TEMPLATE_ONLY'}))),
 segments:Object.freeze([
  ['AD-S01','AD-AHU-SA','AD-SA-TRANS','SUPPLY',.90,.62],['AD-S02','AD-SA-TRANS','AD-SA-RISER','SUPPLY',.82,.56],['AD-S03','AD-SA-RISER','AD-SA-T1','SUPPLY',.76,.50],
  ['AD-S04','AD-SA-T1','AD-SA-T2','SUPPLY',.68,.46],['AD-S05','AD-SA-T2','AD-SA-END','SUPPLY',.58,.42],
  ['AD-S06','AD-SA-T1','AD-DIFF-1','SUPPLY_BRANCH',.38,.28],['AD-S07','AD-SA-T2','AD-DIFF-2','SUPPLY_BRANCH',.38,.28],['AD-S08','AD-SA-END','AD-DIFF-3','SUPPLY_BRANCH',.34,.26],
  ['AD-R01','AD-RET-G1','AD-RA-T1','RETURN_BRANCH',.42,.30],['AD-R02','AD-RET-G2','AD-RA-T2','RETURN_BRANCH',.42,.30],['AD-R03','AD-RA-T2','AD-RA-T1','RETURN',.70,.48],['AD-R04','AD-RA-T1','AD-AHU-RA','RETURN',.78,.52],
  ['AD-O01','AD-OA-LOUVER','AD-OA-MIX','OUTDOOR_AIR',.56,.40],['AD-O02','AD-OA-MIX','AD-AHU-RA','OUTDOOR_AIR',.48,.36]
 ].map(([id,from,to,kind,width,height])=>Object.freeze({id,from,to,kind,shape:'duct',width,height,status:'TEMPLATE_ONLY',insulated:null})))
});
