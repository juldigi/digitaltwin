const buildRows=(assetId='BMJ-MCH-0014')=>{const rows=[];const rootName=assetId==='BMJ-MCH-0015'?'APM 9 · Promatrix 106 CSB':'APM 8 · Promatrix 106 CSB';const add=(id,name,level,parentId,meshRefs=[],kind='assembly',verified=false)=>rows.push(Object.freeze({id,name,level,parentId,meshRefs,kind,verified,confidence:verified?'OEM_PROCESS_VERIFIED':'FAMILY_SERVICE_REFERENCE'}));
add('PM106',rootName,1,null,['pm106-root'],'machine',true);
for(const [id,name,ref] of [
 ['FEED','Non-stop feeder','pm106-feeder'],['TABLE','Suction-belt feed table and register','pm106-feedtable'],['TRANSPORT','Gripper-bar transport','pm106-transport'],
 ['CUT','Cutting / creasing station','pm106-cutting'],['STRIP','Stripping station','pm106-stripping'],['BLANK','Blanking station','pm106-blanking'],
 ['DELIVERY','CSB non-stop delivery','pm106-delivery'],['DRIVE','Drive, controls and pneumatics','pm106-drive'],['ACCESS','Frame, guards and operator access','pm106-access']
])add(`PM106.${id}`,name,2,'PM106',[ref],'unit',true);
const branches={
 FEED:[['PILE','Pile platform and lift','pm106-feeder-pile'],['HEAD','Motorized suction head architecture','pm106-feeder-head'],['NONSTOP','Non-stop support rack','pm106-feeder-nonstop']],
 TABLE:[['BELT','Suction belt table','pm106-table-belt'],['FRONT','Front register system','pm106-table-front'],['SIDE','Pull / push side lays','pm106-table-side'],['BRUSH','Roller and brush bridge','pm106-table-brush']],
 TRANSPORT:[['CHAIN','Gripper chains and sprockets','pm106-transport-chain'],['BAR','Gripper bars','pm106-transport-bar'],['REGISTER','Station register references','pm106-transport-register']],
 CUT:[['CHASE','Quick-lock cutting chase','pm106-cut-chase'],['PLATE','Fine-adjust cutting plate','pm106-cut-plate'],['PRESS','Motorized pressure drive','pm106-cut-pressure']],
 STRIP:[['TOP','Top stripping tool frame','pm106-strip-top'],['MID','Middle stripping tool frame','pm106-strip-middle'],['BOTTOM','Bottom stripping tool frame','pm106-strip-bottom'],['MONITOR','Electronic sheet monitoring','pm106-strip-monitor']],
 BLANK:[['TOP','Top blanking tooling','pm106-blank-top'],['BOTTOM','Bottom blanking tooling','pm106-blank-bottom'],['VAC','Vacuum bar','pm106-blank-vacuum'],['TIE','Tie-sheet cassette','pm106-blank-tie']],
 DELIVERY:[['RAKE','Non-stop rake system','pm106-delivery-rake'],['PALLET','Automatic pallet handling architecture','pm106-delivery-pallet'],['SAMPLE','Sample-sheet removal path','pm106-delivery-sample']],
 DRIVE:[['MOTOR','Main drive','pm106-drive-motor'],['PNEU','Pneumatic locking supply','pm106-drive-pneumatic'],['CONTROL','Touchscreen and station controls','pm106-drive-control']],
 ACCESS:[['FRAME','Elevated structural frames','pm106-access-frame'],['GUARD','Interlocked guard modules','pm106-access-guard'],['PLATFORM','Operator platform and stairs','pm106-access-platform']]
};
for(const [branch,systems] of Object.entries(branches))for(const [sid,name,ref] of systems){const l3=`PM106.${branch}.${sid}`;add(l3,name,3,`PM106.${branch}`,[ref],'system',['BELT','CHASE','TOP','MID','BOTTOM','RAKE'].includes(sid));for(const [i,component,part] of [[1,'Drive-side support','Bearing / shaft / fastener group'],[2,'Operator-side setting','Adjustment / sensor group'],[3,'Working interface','Tool / wear / contact group']]){const l4=`${l3}.B${i}`;add(l4,component,4,l3,[ref]);const l5=`${l4}.C`;add(l5,`${name} component ${i}`,5,l4,[ref],'component');add(`${l5}.P`,part,6,l5,[ref],'part');}}
return Object.freeze(rows);};
export const PROMATRIX106_TAXONOMY=buildRows('BMJ-MCH-0014');
export const PROMATRIX106_TAXONOMY_APM9=buildRows('BMJ-MCH-0015');
export function promatrix106TaxonomyFor(assetId='BMJ-MCH-0014'){return assetId==='BMJ-MCH-0015'?PROMATRIX106_TAXONOMY_APM9:PROMATRIX106_TAXONOMY;}
export const promatrix106TaxonomyStats=(assetId='BMJ-MCH-0014')=>{const rows=promatrix106TaxonomyFor(assetId);return{total:rows.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,rows.filter(n=>n.level===level).length]))};};
