const rows=[];const add=(id,name,level,parentId,meshRefs=[],kind='assembly',verified=false)=>rows.push(Object.freeze({id,name,level,parentId,meshRefs,kind,verified,confidence:verified?'MODEL_PROCESS_VERIFIED':'FAMILY_SERVICE_REFERENCE'}));
add('MK1060','APM 7 · MK 1060 ER',1,null,['mk1060-root'],'machine',true);
for(const [id,name,ref] of [
 ['FEED','Non-stop pile feeding','mk1060-feeder'],['REGISTER','Sheet registration','mk1060-register'],['TRANSPORT','Gripper-bar transport','mk1060-transport'],
 ['PLATEN','Flatbed die-cutting platen','mk1060-platen'],['STRIP','Double-action stripping','mk1060-stripping'],['BLANK','Blanking and product separation','mk1060-blanking'],
 ['WASTE','Sheet-edge waste delivery','mk1060-waste'],['DRIVE','Drive, electrical and control','mk1060-drive'],['ACCESS','Frame, guards and operator access','mk1060-access']
])add(`MK1060.${id}`,name,2,'MK1060',[ref],'unit',true);
const branches={
 FEED:[['PILE','Pile lift','mk1060-feeder-pile'],['HEAD','Suction head','mk1060-feeder-head'],['NONSTOP','Non-stop rack','mk1060-feeder-nonstop']],
 REGISTER:[['TABLE','Feed table','mk1060-register-table'],['FRONT','Front lays','mk1060-register-front'],['SIDE','Operator-side pull guide','mk1060-register-side']],
 TRANSPORT:[['CHAIN','Gripper chains','mk1060-transport-chain'],['BAR','Gripper bars','mk1060-transport-bar'],['TORQUE','Chain torque limiter','mk1060-transport-torque']],
 PLATEN:[['CHASE','Upper cutting chase','mk1060-platen-chase'],['LOWER','Moving lower platen','mk1060-platen-lower'],['PRESS','Pressure drive','mk1060-platen-drive']],
 STRIP:[['UPPER','Upper stripping frame','mk1060-strip-upper'],['LOWER','Lower stripping frame','mk1060-strip-lower'],['ACTION','Double-action stripping mechanism','mk1060-strip-action']],
 BLANK:[['UPPER','Upper blanking frame','mk1060-blank-upper'],['LOWER','Lower blanking support frame','mk1060-blank-lower'],['STACK','Blank stacking plate','mk1060-blank-stack']],
 WASTE:[['EDGE','Sheet-edge waste release','mk1060-waste-edge'],['CONVEYOR','Waste conveyor','mk1060-waste-conveyor'],['PRODUCT','Product conveyor / delivery','mk1060-product-delivery']],
 DRIVE:[['MOTOR','Main motor and flywheel','mk1060-drive-motor'],['CABINET','Electric cabinet','mk1060-drive-cabinet'],['CONTROL','Touchscreen and station controls','mk1060-drive-control']],
 ACCESS:[['FRAME','Main side frames','mk1060-access-frame'],['GUARD','Interlocked safety guards','mk1060-access-guard'],['PLATFORM','Operator platform and stairs','mk1060-access-platform']]
};
for(const [branch,systems] of Object.entries(branches))for(const [sid,name,ref] of systems){const l3=`MK1060.${branch}.${sid}`;add(l3,name,3,`MK1060.${branch}`,[ref],'system',['CHAIN','BAR','CHASE','UPPER','LOWER'].includes(sid));for(const [i,component,part] of [[1,'Drive-side support','Bearing / shaft / fastener set'],[2,'Operator-side setting','Adjustment / sensor set'],[3,'Working interface','Wear / contact / tooling interface']]){const l4=`${l3}.B${i}`;add(l4,component,4,l3,[ref]);const l5=`${l4}.C`;add(l5,`${name} component ${i}`,5,l4,[ref],'component');add(`${l5}.P`,part,6,l5,[ref],'part');}}
export const MK1060_TAXONOMY=Object.freeze(rows);export const MK1060_TAXONOMY_BY_ID=new Map(rows.map(n=>[n.id,n]));export const mk1060TaxonomyStats=()=>({total:rows.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,rows.filter(n=>n.level===level).length]))});
