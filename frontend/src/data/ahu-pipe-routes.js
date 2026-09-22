// V135 AHU utility-pipe scaffold. All coordinates are preview-only.
const ahuIds=['BMJ-MCH-0036','BMJ-MCH-0037','BMJ-MCH-0038','BMJ-MCH-0039','BMJ-MCH-0040','BMJ-MCH-0041'];
const anchors=[];
for(const machineId of ahuIds){
 for(const port of ['CHWS_IN_OPTION','CHWR_OUT_OPTION','CONDENSATE_DRAIN'])anchors.push(Object.freeze({id:'AHUP-'+machineId+'-'+port,machineId,port,status:port==='CONDENSATE_DRAIN'?'UNPLACED_EQUIPMENT_ANCHOR':'OPTION_BOUNDARY_UNPLACED',futureFields:Object.freeze(['x','y','z','direction','connectionSizeMm','elevationM'])}));
}
for(const port of ['REFRIGERANT_LIQUID_OPTION','REFRIGERANT_SUCTION_OPTION'])anchors.push(Object.freeze({id:'AHUP-BMJ-MCH-0040-'+port,machineId:'BMJ-MCH-0040',port,status:'SANSIN_FAMILY_OPTION_BOUNDARY_UNPLACED',futureFields:Object.freeze(['x','y','z','direction','connectionSizeMm','elevationM'])}));
export const AHU_PIPE_ROUTING_TEMPLATE=Object.freeze({
 id:'BMJ-UTILITY-AHU-PIPING-V1',system:'AHU_PIPING',layerKey:'utility_ahu_piping',status:'TEMPLATE_ONLY',schemaVersion:1,
 previewOrigin:Object.freeze([108,0,-40]),equipmentAnchors:Object.freeze(anchors),
 engineeringBoundary:Object.freeze({actualRouteVerified:false,coilFluidTypeVerified:false,refrigerantRouteVerified:false,condensateDischargeVerified:false,note:'CHW and refrigerant paths are prepared capability templates, not installed-system claims.'}),
 componentCatalog:Object.freeze(['CHWS_MAIN','CHWR_MAIN','BRANCH','ISOLATION_VALVE','BALANCING_VALVE','CONTROL_VALVE','STRAINER','VENT','DRAIN','FLEXIBLE_CONNECTION','REFRIGERANT_LIQUID','REFRIGERANT_SUCTION','CONDENSATE_TRAP','CONDENSATE_SLOPED_DRAIN','CLEANOUT']),
 nodes:Object.freeze([
  {id:'AP-PLANT-CHWS',p:[0,3.80,-2.40],kind:'CHWS_MAIN'},{id:'AP-PLANT-CHWR',p:[0,3.45,-1.70],kind:'CHWR_MAIN'},
  {id:'AP-CHWS-END',p:[11.8,3.80,-2.40],kind:'FUTURE_CAP'},{id:'AP-CHWR-END',p:[11.8,3.45,-1.70],kind:'FUTURE_CAP'},
  {id:'AP-BRANCH-S',p:[5.0,3.80,-2.40],kind:'TEE'},{id:'AP-BRANCH-R',p:[5.0,3.45,-1.70],kind:'TEE'},
  {id:'AP-AHU-COIL-S',p:[7.1,1.45,-2.40],kind:'CONTROL_VALVE'},{id:'AP-AHU-COIL-R',p:[7.1,1.45,-1.70],kind:'BALANCING_VALVE'},
  {id:'AP-CD-IN',p:[7.5,.72,.20],kind:'CONDENSATE_TRAP'},{id:'AP-CD-MID',p:[9.2,.48,.20],kind:'CLEANOUT'},{id:'AP-CD-OUT',p:[11.4,.24,.20],kind:'CONDENSATE_DISCHARGE_BOUNDARY'},
  {id:'AP-REF-LIQ-A',p:[1.0,2.20,2.10],kind:'REFRIGERANT_LIQUID'},{id:'AP-REF-LIQ-B',p:[5.2,2.65,2.10],kind:'REFRIGERANT_LIQUID'},
  {id:'AP-REF-SUC-A',p:[1.0,2.00,2.70],kind:'REFRIGERANT_SUCTION'},{id:'AP-REF-SUC-B',p:[5.2,2.45,2.70],kind:'REFRIGERANT_SUCTION'}
 ].map(n=>Object.freeze({...n,p:Object.freeze(n.p),status:'TEMPLATE_ONLY'}))),
 segments:Object.freeze([
  ['AP-S01','AP-PLANT-CHWS','AP-CHWS-END','CHWS_MAIN',.052],['AP-S02','AP-PLANT-CHWR','AP-CHWR-END','CHWR_MAIN',.052],
  ['AP-S03','AP-BRANCH-S','AP-AHU-COIL-S','CHWS_BRANCH',.034],['AP-S04','AP-AHU-COIL-R','AP-BRANCH-R','CHWR_BRANCH',.034],
  ['AP-S05','AP-CD-IN','AP-CD-MID','CONDENSATE',.022],['AP-S06','AP-CD-MID','AP-CD-OUT','CONDENSATE',.022],
  ['AP-S07','AP-REF-LIQ-A','AP-REF-LIQ-B','REFRIGERANT_LIQUID',.018],['AP-S08','AP-REF-SUC-A','AP-REF-SUC-B','REFRIGERANT_SUCTION',.032]
 ].map(([id,from,to,kind,radius])=>Object.freeze({id,from,to,kind,shape:'pipe',radius,status:'TEMPLATE_ONLY',requiresSlope:kind==='CONDENSATE'})))
});
