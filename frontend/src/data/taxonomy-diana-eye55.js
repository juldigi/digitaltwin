const rows=[];const add=(id,name,level,parentId,meshRefs=[],kind='assembly',verified=false)=>rows.push(Object.freeze({id,name,level,parentId,meshRefs,kind,verified,confidence:verified?'OEM_PROCESS_VERIFIED':'FAMILY_SERVICE_REFERENCE'}));
add('DIANA55','IPM 3 · DIANA EYE 55',1,null,['diana55-root'],'machine',true);
for(const [id,name,ref] of [
 ['FEED','Blank feeding and alignment','diana55-feeder'],['TRANSPORT','Suction-belt transport','diana55-transport'],['INSPECT','Inspection enclosure','diana55-inspection'],
 ['CAMERA','Camera system','diana55-camera'],['LIGHT','LED illumination','diana55-light'],['PROCESS','Image processing and operator interface','diana55-processing'],
 ['REJECT','Blank ejection / sorting','diana55-reject'],['DELIVERY','Accepted blank delivery','diana55-delivery'],['ACCESS','Frame and guarding','diana55-access']
])add(`DIANA55.${id}`,name,2,'DIANA55',[ref],'unit',true);
const branches={
 FEED:[['STACK','Blank stack support','diana55-feed-stack'],['FRICTION','Friction feeder belts','diana55-feed-friction'],['ALIGN','Blank aligning guides','diana55-feed-align'],['DOUBLE','Double-sheet sensing zone','diana55-feed-double']],
 TRANSPORT:[['BELT','Suction belt','diana55-transport-belt'],['VAC','Vacuum plenum','diana55-transport-vacuum'],['GUIDE','Transport guide rails','diana55-transport-guide']],
 INSPECT:[['WINDOW','Darkened inspection window','diana55-inspection-window'],['TUNNEL','Inspection tunnel / enclosure','diana55-inspection-tunnel'],['BED','Inspection belt bed','diana55-inspection-bed']],
 CAMERA:[['TOP','Upper camera mounting bays','diana55-camera-top'],['LOWANGLE','Low-angle mirror/camera path','diana55-camera-low'],['REAR','Rear-side camera bay','diana55-camera-rear'],['AREA','Area-camera mounting bays','diana55-camera-area']],
 LIGHT:[['DOME','Light-dome architecture','diana55-light-dome'],['LED','Adjustable LED arrays','diana55-light-led'],['LOW','Low-angle illumination','diana55-light-low']],
 PROCESS:[['GPU','GPU+CPU processing cabinet','diana55-process-compute'],['HMI','Operator terminal','diana55-process-hmi'],['RECIPE','Master / tolerance recipe storage interface','diana55-process-recipe']],
 REJECT:[['GATE','Mechanical reject gate reference','diana55-reject-gate'],['CHUTE','Reject collection path','diana55-reject-chute'],['SENSOR','Reject confirmation sensing','diana55-reject-sensor']],
 DELIVERY:[['BELT','Accepted-product belt','diana55-delivery-belt'],['STACK','Delivery stack / buffer interface','diana55-delivery-stack'],['COUNTER','Output sensing / counter','diana55-delivery-counter']],
 ACCESS:[['FRAME','Machine base and side frames','diana55-access-frame'],['GUARD','Inspection guards and panels','diana55-access-guard'],['DOOR','Service-access panels','diana55-access-door']]
};
for(const [branch,systems] of Object.entries(branches))for(const [sid,name,ref] of systems){const l3=`DIANA55.${branch}.${sid}`;add(l3,name,3,`DIANA55.${branch}`,[ref],'system',['BELT','TOP','DOME','GPU','GATE'].includes(sid));for(const [i,component,part] of [[1,'Drive / support assembly','Bearing / bracket / fastener group'],[2,'Adjustment / sensing assembly','Setting / sensor / cable group'],[3,'Working interface','Optical / belt / eject contact group']]){const l4=`${l3}.B${i}`;add(l4,component,4,l3,[ref]);const l5=`${l4}.C`;add(l5,`${name} component ${i}`,5,l4,[ref],'component');add(`${l5}.P`,part,6,l5,[ref],'part');}}
export const DIANA_EYE55_TAXONOMY=Object.freeze(rows);export const DIANA_EYE55_TAXONOMY_BY_ID=new Map(rows.map(n=>[n.id,n]));export const dianaEye55TaxonomyStats=()=>({total:rows.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,rows.filter(n=>n.level===level).length]))});
