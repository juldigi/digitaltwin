const rows=[];const add=(id,name,level,parentId,meshRefs=[],kind='assembly',verified=false)=>rows.push(Object.freeze({id,name,level,parentId,meshRefs,kind,verified,confidence:verified?'FAMILY_PROCESS_VERIFIED':'CONFIGURATION_REFERENCE'}));
add('SHARKN650','IPM 4 · FS-SHARK-N650-P3N1',1,null,['shark650-root'],'machine',true);
for(const [id,name,ref] of [
 ['FEED','Automatic feeding','shark650-feeder'],['TRANSFER','Full-suction transfer','shark650-transfer'],['INSPECT','Inspection tower','shark650-inspection'],
 ['VISION','Camera and lighting system','shark650-vision'],['PROCESS','Vision processing and recipe control','shark650-processing'],
 ['REJECT','Reject separation','shark650-reject'],['RETURN','Good/bad product return and collection','shark650-return'],['ACCESS','Frame, platform and guarding','shark650-access']
])add(`SHARKN650.${id}`,name,2,'SHARKN650',[ref],'unit',true);
const branches={
 FEED:[['STACK','Input blank support','shark650-feed-stack'],['SUCTION','Suction-feeder architecture reference','shark650-feed-suction'],['FRICTION','Friction-feeder option reference','shark650-feed-friction'],['SEPARATE','Blank separation / air assist','shark650-feed-separate']],
 TRANSFER:[['BELT','Full-suction transport belts','shark650-transfer-belt'],['VAC','Vacuum plenum / blowers','shark650-transfer-vacuum'],['GUIDE','Adjustable transport guides','shark650-transfer-guide']],
 INSPECT:[['TOWER','Vision tower / enclosure','shark650-inspection-tower'],['WINDOW','Dark inspection aperture','shark650-inspection-window'],['BED','Inspection transport bed','shark650-inspection-bed']],
 VISION:[['CAMERA','Configurable camera mounting array · installed count unverified','shark650-vision-camera'],['LIGHT','Software-controlled lighting array','shark650-vision-light'],['TRIGGER','Inspection trigger / encoder sensing','shark650-vision-trigger']],
 PROCESS:[['COMPUTE','Industrial vision computer','shark650-process-compute'],['HMI','Operator HMI','shark650-process-hmi'],['RECIPE','Inspection template / tolerance logic','shark650-process-recipe']],
 REJECT:[['PLATE','Plate-reject family reference','shark650-reject-plate'],['AIR','Air-reject family reference','shark650-reject-air'],['TRACK','Reject tracking / confirmation','shark650-reject-track']],
 RETURN:[['GOOD','Accepted-product return belt','shark650-return-good'],['BAD','Rejected-product return belt','shark650-return-bad'],['STACK','Collection / palletizing interface','shark650-return-stack']],
 ACCESS:[['FRAME','Machine base frame','shark650-access-frame'],['PLATFORM','Operator platform','shark650-access-platform'],['GUARD','Interlocked covers / guarding','shark650-access-guard']]
};
for(const [branch,systems] of Object.entries(branches))for(const [sid,name,ref] of systems){const l3=`SHARKN650.${branch}.${sid}`;add(l3,name,3,`SHARKN650.${branch}`,[ref],'system',['SUCTION','BELT','CAMERA','LIGHT','PLATE','GOOD'].includes(sid));for(const [i,component,part] of [[1,'Mechanical support','Bearing / bracket / fastener group'],[2,'Adjustment / sensor assembly','Setting / sensor / cable group'],[3,'Working interface','Belt / optical / reject-contact group']]){const l4=`${l3}.B${i}`;add(l4,component,4,l3,[ref]);const l5=`${l4}.C`;add(l5,`${name} component ${i}`,5,l4,[ref],'component');add(`${l5}.P`,part,6,l5,[ref],'part');}}
export const SHARK_N650_TAXONOMY=Object.freeze(rows);export const SHARK_N650_TAXONOMY_BY_ID=new Map(rows.map(n=>[n.id,n]));export const sharkN650TaxonomyStats=()=>({total:rows.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,rows.filter(n=>n.level===level).length]))});
