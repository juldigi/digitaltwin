const buildRows=(assetId='BMJ-MCH-0011')=>{const rows=[];const rootName=assetId==='BMJ-MCH-0012'?'APM 6 · MK 920 YMI - II':'APM 5 · MK 920 YMI';const add=(id,name,level,parentId,meshRefs=[],kind='assembly',verified=false)=>rows.push(Object.freeze({id,name,level,parentId,meshRefs,kind,verified,confidence:verified?'SITE_OR_MODEL_IDENTIFIED':'FAMILY_PROCESS_REFERENCE'}));
add('MK920',rootName,1,null,['mk920-root'],'machine',true);
for(const [id,name,ref] of [['FEED','Pile feeding','mk920-feeder'],['REGISTER','Sheet registration','mk920-register'],['FOIL','Foil unwind and advance','mk920-foil'],['PLATEN','Hot-foil and die-cutting platen','mk920-platen'],['TRANSPORT','Gripper transport','mk920-transport'],['DELIVERY','Delivery and pile lift','mk920-delivery'],['DRIVE','Main drive and control','mk920-drive'],['ACCESS','Frame, guards and access','mk920-access']])add(`MK920.${id}`,name,2,'MK920',[ref],'unit',true);
const branches={
 FEED:[['PILE','Pile lift','mk920-feeder-pile'],['HEAD','Suction feeding head','mk920-feeder-head'],['AIR','Blower and air manifold','mk920-feeder-air']],
 REGISTER:[['TABLE','Feed table','mk920-register-table'],['FRONT','Front lays','mk920-register-front'],['SIDE','Side lay','mk920-register-side']],
 FOIL:[['UNWIND','Foil reel supports','mk920-foil-unwind'],['PULL','Three precision foil-pull axes','mk920-foil-pull'],['GUIDE','Foil guides and tension','mk920-foil-guide'],['WASTE','Spent foil rewind','mk920-foil-waste']],
 PLATEN:[['UPPER','Heated upper chase','mk920-platen-upper'],['LOWER','Moving lower platen','mk920-platen-lower'],['TOGGLE','Toggle and pressure drive','mk920-platen-toggle'],['CHASE','Die and foil chase interface','mk920-platen-chase']],
 TRANSPORT:[['CHAIN','Intermittent gripper chain','mk920-transport-chain'],['BAR','Gripper bars','mk920-transport-bar'],['CAM','Indexing cam and rails','mk920-transport-cam']],
 DELIVERY:[['RELEASE','Gripper release','mk920-delivery-release'],['PILE','Delivery pile lift','mk920-delivery-pile'],['JOG','Sheet joggers','mk920-delivery-jog']],
 DRIVE:[['MOTOR','Main motor','mk920-drive-motor'],['FLYWHEEL','Flywheel and clutch','mk920-drive-flywheel'],['CONTROL','Operator console and safety circuit','mk920-drive-control']],
 ACCESS:[['FRAME','Monobloc side frames','mk920-access-frame'],['GUARD','Interlocked guarding','mk920-access-guard'],['PLATFORM','Operator platform','mk920-access-platform']]
};
for(const [branch,systems] of Object.entries(branches))for(const [sid,name,ref] of systems){const l3=`MK920.${branch}.${sid}`;add(l3,name,3,`MK920.${branch}`,[ref],'system',sid==='PULL');for(const [i,component,part] of [[1,'Drive-side assembly','Bearing / seal / fastener set'],[2,'Operator-side adjustment','Adjustment / sensor set'],[3,'Working element','Contact / wear element']]){const l4=`${l3}.A${i}`;add(l4,component,4,l3,[ref]);const l5=`${l4}.C`;add(l5,`${name} component ${i}`,5,l4,[ref],'component');add(`${l5}.P`,part,6,l5,[ref],'part');}}
return Object.freeze(rows);};
export const MK920_TAXONOMY=buildRows('BMJ-MCH-0011');
export const MK920_TAXONOMY_APM6=buildRows('BMJ-MCH-0012');
export function mk920TaxonomyFor(assetId='BMJ-MCH-0011'){return assetId==='BMJ-MCH-0012'?MK920_TAXONOMY_APM6:MK920_TAXONOMY;}
export const MK920_TAXONOMY_BY_ID=new Map(MK920_TAXONOMY.map(n=>[n.id,n]));
export const mk920TaxonomyStats=(assetId='BMJ-MCH-0011')=>{const rows=mk920TaxonomyFor(assetId);return{total:rows.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,rows.filter(n=>n.level===level).length]))};};
