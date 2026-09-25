const LEVELS=['Mesin','Unit Utama','Sub','Block','Part','Spesifik Part'];
const units=[
 ['FEED','Cutting Table & Material Handling',[
  ['CENTER','Main dark cutting table','polar-feed-center'],['LEFT','Left perforated air-float side table','polar-feed-left'],['RIGHT','Right perforated air-float side table','polar-feed-right'],
  ['GRID','Air-nozzle grid','polar-feed-grid'],['BLOWER','Air-table blower reference','polar-air-blower']
 ]],
 ['GAUGE','Backgauge Positioning',[
  ['BEAM','Backgauge beam','polar-gauge-beam'],['RAKE','Backgauge rake / fingers','polar-gauge-rake'],['GUIDE','Twin guideways','polar-gauge-guides'],
  ['SCREW','Positioning screw / drive reference','polar-gauge-drive'],['ENC','Length-measurement encoder reference','polar-gauge-encoder']
 ]],
 ['CLAMP','Hydraulic Clamp',[
  ['BEAM','Clamp beam','polar-clamp-beam'],['CYL','Clamp hydraulic actuation reference','polar-clamp-cylinders'],
  ['PRESS','Clamp-pressure control interface','polar-control-pressure'],['CONTACT','Stock-contact face','polar-clamp-contact']
 ]],
 ['KNIFE','Knife Cutting System',[
  ['CARRIER','Knife carrier','polar-knife-carrier'],['BLADE','1150 mm knife','polar-knife-blade'],['DRIVE','Hydraulic knife-drive interface','polar-knife-drive'],
  ['STICK','Cutting stick','polar-knife-stick'],['TOP','Top-position / cut-cycle sensing reference','polar-knife-top-sense']
 ]],
 ['SAFETY','Safety System',[
  ['PHOTO','Front safety / control arms','polar-safety-photo'],['TWOHAND','Two-hand cut control reference','polar-safety-twohand'],
  ['ESTOP','Front-left mushroom safety button','polar-safety-estop'],['REAR','Rear guard reference','polar-safety-rear']
 ]],
 ['CONTROL','EM-MONITOR Control',[
  ['CRT','Industrial program display','polar-control-crt'],['PANEL','Program / dimension console','polar-control-panel'],
  ['MEM','Eltromat Memory / program interface','polar-control-memory'],['CORR','Correction / pressure controls','polar-control-correction']
 ]],
 ['HOUSING','Main Housing & Base',[
  ['HEAD','Rounded rectangular cutter head','polar-housing'],['BASE','Base cabinet','polar-frame'],['MOTOR','Side belt-drive housing','polar-housing-motor-end']
 ]],
 ['UTILITY','Hydraulic & Air Utility',[
  ['HYD','Hydraulic power-unit reference','polar-hyd-power'],['VALVE','Valve / manifold reference','polar-hyd-valve'],
  ['AIR','Air blower','polar-air-blower'],['DUCT','Air-distribution duct reference','polar-air-duct']
 ]]
];
const nodes=[],root='P115';
const add=(id,parentId,level,name,meshRefs=[],description='',confidence='MODEL_REFERENCE')=>nodes.push(Object.freeze({id,parentId,level,levelName:LEVELS[level-1],name,machineZone:name,meshRefs,sourceRefs:['BMJ-POLAR-ID','BMJ-POLAR-PHOTOS-2026-09','POLAR-EM-SPEC-KITMONDO','POLAR-EM-OP-MANUAL'],confidence,verified:level<=2,explodeVector:[level===2?.6:.14,level<4?.16:.07,0],explodeDistance:level===2?.8:level===3?.5:level===4?.3:level===5?.2:.11,focusCamera:null,description,maintenanceTag:null}));
add(root,null,1,'POLAR 115 EM MON · Serial 5831536',['POLAR-115-EM'],'BMJ identity plus evidence-bounded 115 EM/EM-MONITOR architecture. Archive dimensions are not treated as BMJ installation measurements.','BMJ_ID_VERIFIED');
for(const [code,name,parts] of units){const u=root+'.'+code;add(u,root,2,name,['polar-'+code.toLowerCase()],'',code==='UTILITY'?'MODEL_FAMILY_REFERENCE':'MODEL_REFERENCE');for(const [i,[pcode,part,mesh]] of parts.entries()){const s=u+'.'+pcode;add(s,u,3,part+' Assembly',[mesh]);add(s+'.BLOCK',s,4,part+' Functional Block',[mesh]);add(s+'.BLOCK.PART',s+'.BLOCK',5,part,[mesh]);add(s+'.BLOCK.PART.X',s+'.BLOCK.PART',6,part+' Service Element',[mesh],i===0?'Primary represented element; serial-specific spare-part number is not claimed.':'Functional element represented only to the level supported by model/family evidence.');}}
export const POLAR115_TAXONOMY=Object.freeze(nodes);
export const POLAR115_TAXONOMY_BY_ID=new Map(nodes.map(n=>[n.id,n]));
export const polar115TaxonomyStats=()=>({total:nodes.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,nodes.filter(n=>n.level===level).length]))});
