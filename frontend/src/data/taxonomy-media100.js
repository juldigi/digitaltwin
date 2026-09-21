const buildRows=(assetId='BMJ-MCH-0016')=>{const rows=[];const rootName=assetId==='BMJ-MCH-0018'?'FGM 3 · BOBST MEDIA 100 II':'FGM 1 · BOBST MEDIA 100 II';const add=(id,name,level,parentId,meshRefs=[],kind='assembly',verified=false)=>rows.push(Object.freeze({id,name,level,parentId,meshRefs,kind,verified,confidence:verified?'MODEL_PROCESS_VERIFIED':'FAMILY_SERVICE_REFERENCE'}));
add('MEDIA100',rootName,1,null,['media100-root'],'machine',true);
for(const [id,name,ref] of [
 ['FEED','Blank feeding','media100-feeder'],['ALIGN','Alignment and pre-break','media100-prefold'],['FORM','Folding / lock-bottom conversion','media100-forming'],
 ['GLUE','Glue application','media100-glue'],['FINAL','Final fold / trombone','media100-final'],['PRESS','Compression delivery','media100-compression'],
 ['DRIVE','Main drive and controls','media100-drive'],['ACCESS','Frame, rails and guards','media100-access']
])add(`MEDIA100.${id}`,name,2,'MEDIA100',[ref],'unit',true);
const branches={
 FEED:[['STACK','Blank stack support','media100-feed-stack'],['BELT','Friction feeder belts','media100-feed-belts'],['VIB','Vibrator / separation','media100-feed-vibrator']],
 ALIGN:[['RAIL','Adjustable carton guides','media100-prefold-guides'],['PREBREAK','Left/right pre-break architecture','media100-prefold-break'],['BELT','Transport belts','media100-prefold-belts']],
 FORM:[['BOTTOM','Crash-lock folding architecture','media100-form-bottom'],['SERVO','Back-fold / corner-conversion mounting zone','media100-form-servo'],['BELT','Forming belts','media100-form-belts']],
 GLUE:[['LOWER','Lower disc-glue architecture','media100-glue-lower'],['UPPER','Upper glue-head mounting rail','media100-glue-upper'],['PUMP','Glue supply / pump interface','media100-glue-pump']],
 FINAL:[['TROMBONE','Trombone belts','media100-final-trombone'],['FOLD','Final folding rails','media100-final-fold'],['KICK','Kicker / spacing interface','media100-final-kicker']],
 PRESS:[['BELT','Compression belts','media100-press-belts'],['PRESS','Pneumatic pressure setting','media100-press-pressure'],['EXIT','Delivery / counter interface','media100-press-exit']],
 DRIVE:[['MOTOR','Main drive motor','media100-drive-motor'],['TRANSMISSION','Line shaft / transmission reference','media100-drive-transmission'],['CONTROL','CUBE-era control architecture','media100-drive-control']],
 ACCESS:[['FRAME','Modular side frames','media100-access-frame'],['RAIL','Crossbars and adjustment rails','media100-access-rail'],['GUARD','Safety guards / covers','media100-access-guard']]
};
for(const [branch,systems] of Object.entries(branches))for(const [sid,name,ref] of systems){const l3=`MEDIA100.${branch}.${sid}`;add(l3,name,3,`MEDIA100.${branch}`,[ref],'system',['BELT','PREBREAK','BOTTOM','LOWER','TROMBONE'].includes(sid));for(const [i,component,part] of [[1,'Drive-side support','Bearing / pulley / fastener group'],[2,'Operator-side setting','Handwheel / guide / sensor group'],[3,'Working interface','Belt / rail / glue-contact group']]){const l4=`${l3}.B${i}`;add(l4,component,4,l3,[ref]);const l5=`${l4}.C`;add(l5,`${name} component ${i}`,5,l4,[ref],'component');add(`${l5}.P`,part,6,l5,[ref],'part');}}
return Object.freeze(rows);};
export const MEDIA100_TAXONOMY=buildRows('BMJ-MCH-0016');
export const MEDIA100_TAXONOMY_FGM3=buildRows('BMJ-MCH-0018');
export function media100TaxonomyFor(assetId='BMJ-MCH-0016'){return assetId==='BMJ-MCH-0018'?MEDIA100_TAXONOMY_FGM3:MEDIA100_TAXONOMY;}
export const media100TaxonomyStats=(assetId='BMJ-MCH-0016')=>{const rows=media100TaxonomyFor(assetId);return{total:rows.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,rows.filter(n=>n.level===level).length]))};};
