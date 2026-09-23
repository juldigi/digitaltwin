const buildRows=(assetId='BMJ-MCH-0011')=>{const rows=[];const rootName=assetId==='BMJ-MCH-0012'?'APM 6 · MK 920 YMI - II':'APM 5 · MK 920 YMI';const add=(id,name,level,parentId,meshRefs=[],kind='assembly',verified=false)=>rows.push(Object.freeze({id,name,level,parentId,meshRefs,kind,verified,confidence:verified?'SITE_OR_MODEL_IDENTIFIED':'FAMILY_PROCESS_REFERENCE'}));
add('MK920',rootName,1,null,['mk920-root'],'machine',true);
for(const [id,name,ref] of [['FEED','Pile feeding','mk920-feeder'],['REGISTER','Sheet registration','mk920-register'],['FOIL','Foil unwind and advance','mk920-foil'],['PLATEN','Hot-foil and die-cutting platen','mk920-platen'],['TRANSPORT','Gripper transport','mk920-transport'],['DELIVERY','Delivery and pile lift','mk920-delivery'],['DRIVE','Main drive and control','mk920-drive'],['ACCESS','Frame, guards and access','mk920-access']])add(`MK920.${id}`,name,2,'MK920',[ref],'unit',true);
const branches={
 FEED:[['PILE','Pile lift','mk920-feeder-pile'],['HEAD','Suction feeding head','mk920-feeder-head'],['AIR','Blower and air manifold','mk920-feeder-air']],
 REGISTER:[['TABLE','Feed table','mk920-register-table'],['FRONT','Front lays','mk920-register-front'],['SIDE','Side lay','mk920-register-side']],
 FOIL:[['UNWIND','Foil reel supports · installed count unverified','mk920-foil-unwind'],['PULL','Three precision foil-pull axes','mk920-foil-pull'],['GUIDE','Foil guides and tension','mk920-foil-guide'],['WEB','Three longitudinal foil-web functional references','mk920-foil-web'],['WASTE','Spent foil rewind','mk920-foil-waste']],
 PLATEN:[['UPPER','Heated upper chase','mk920-platen-upper'],['LOWER','Moving lower platen','mk920-platen-lower'],['TOGGLE','Toggle and pressure drive','mk920-platen-toggle'],['CHASE','Die and foil chase interface','mk920-platen-chase']],
 TRANSPORT:[['CHAIN','Intermittent gripper chain','mk920-transport-chain'],['BAR','Gripper bars · represented count unverified','mk920-transport-bar'],['CAM','Indexing cam and rails','mk920-transport-cam']],
 DELIVERY:[['RELEASE','Gripper release','mk920-delivery-release'],['PILE','Delivery pile lift','mk920-delivery-pile'],['JOG','Sheet joggers','mk920-delivery-jog']],
 DRIVE:[['MOTOR','Main motor','mk920-drive-motor'],['FLYWHEEL','Flywheel and clutch','mk920-drive-flywheel'],['CONTROL','Operator console and safety circuit','mk920-drive-control']],
 ACCESS:[['FRAME','Monobloc side frames','mk920-access-frame'],['GUARD','Interlocked guarding','mk920-access-guard'],['PLATFORM','Operator platform','mk920-access-platform']]
};
const exteriorDetails={
 'FOIL.UNWIND':[['Removable foil carrier rail','Frame mounting bracket'],['Reel spindle supports','Bearing block and retainer'],['Foil reel and shaft','Core locking collar']],
 'FOIL.WASTE':[['Spent foil carrier rail','Frame mounting bracket'],['Rewind spindle supports','Bearing block and retainer'],['Spent foil winding shaft','Core locking collar']],
 'ACCESS.FRAME':[['Upper structural beam','Frame joint'],['Vertical support posts','Post base anchor'],['Lower side rail','Frame base connection']],
 'ACCESS.GUARD':[['Lower guard kickplate','Panel fastener'],['Glazed inspection aperture','Window seal'],['Guard stiles and header','Interlocked panel joint']],
 'DELIVERY.PILE':[['Pile support table','Pile deck'],['Lift guidance','Guide rail'],['Pile height control','Height sensing reference']]
};
for(const [branch,systems] of Object.entries(branches))for(const [sid,name,ref] of systems){const l3=`MK920.${branch}.${sid}`;add(l3,name,3,`MK920.${branch}`,[ref],'system',sid==='PULL');const components=exteriorDetails[`${branch}.${sid}`]||[['Drive-side assembly','Bearing / seal / fastener set'],['Operator-side adjustment','Adjustment / sensor set'],['Working element','Contact / wear element']];for(const [index,[component,part]] of components.entries()){const i=index+1,l4=`${l3}.A${i}`;add(l4,component,4,l3,[ref]);const l5=`${l4}.C`;add(l5,`${component} component`,5,l4,[ref],'component');add(`${l5}.P`,part,6,l5,[ref],'part');}}
return Object.freeze(rows);};
export const MK920_TAXONOMY=buildRows('BMJ-MCH-0011');
export const MK920_TAXONOMY_APM6=buildRows('BMJ-MCH-0012');
export function mk920TaxonomyFor(assetId='BMJ-MCH-0011'){return assetId==='BMJ-MCH-0012'?MK920_TAXONOMY_APM6:MK920_TAXONOMY;}
export const MK920_TAXONOMY_BY_ID=new Map(MK920_TAXONOMY.map(n=>[n.id,n]));
export const mk920TaxonomyStats=(assetId='BMJ-MCH-0011')=>{const rows=mk920TaxonomyFor(assetId);return{total:rows.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,rows.filter(n=>n.level===level).length]))};};
