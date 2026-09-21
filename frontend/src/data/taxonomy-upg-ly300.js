const rows=[];const add=(id,name,level,parentId,meshRefs=[],kind='assembly',verified=false)=>rows.push(Object.freeze({id,name,level,parentId,meshRefs,kind,verified,confidence:verified?'OEM_MODEL_VERIFIED':'CONFIGURATION_REFERENCE'}));
add('LY300','DIGITAL INKJET · UPG-LY300',1,null,['ly300-root'],'machine',true);
for(const [id,name,ref] of [
 ['FEED','Automatic paging / feeding','ly300-feeder'],['TRANSPORT','Servo transport and positioning','ly300-transport'],['PRINT','UV piezo print system','ly300-print'],
 ['INK','Ink / negative-pressure system','ly300-ink'],['UV','LED UV curing','ly300-uv'],['CAMERA','2K camera inspection','ly300-camera'],
 ['REJECT','Plate-turn reject','ly300-reject'],['COLLECT','Collection / strapping interface','ly300-collect'],['CONTROL','PLC / servo electrical control','ly300-control'],['ACCESS','Enclosure and service access','ly300-access']
])add(`LY300.${id}`,name,2,'LY300',[ref],'unit',true);
const branches={
 FEED:[['STACK','Input pile support','ly300-feed-stack'],['BAFFLE','Baffle feeder','ly300-feed-baffle'],['PAGER','Automatic paging mechanism','ly300-feed-pager'],['DOUBLE','Double-sheet sensing zone','ly300-feed-double']],
 TRANSPORT:[['BELT','High-temperature PU conveyor belt','ly300-transport-belt'],['SERVO','Servo transport drive','ly300-transport-servo'],['ENCODER','Encoder / positioning reference','ly300-transport-encoder']],
 PRINT:[['HEAD','Ricoh G5 printhead module','ly300-print-head'],['NOZZLE','Nozzle / jetting interface','ly300-print-nozzle'],['HEIGHT','Printhead mounting / height interface','ly300-print-height']],
 INK:[['TANK','UV ink reservoir','ly300-ink-tank'],['NEGATIVE','Negative-pressure system','ly300-ink-negative'],['TUBE','Ink tube / connector routing','ly300-ink-tube']],
 UV:[['LED','LED UV curing head','ly300-uv-led'],['SHIELD','UV lamp shield','ly300-uv-shield'],['POWER','UV power interface','ly300-uv-power']],
 CAMERA:[['LINE','2K line-scan camera','ly300-camera-line'],['LIGHT','Inspection illumination','ly300-camera-light'],['TRACE','Detection / traceability interface','ly300-camera-trace']],
 REJECT:[['PLATE','Plate-turn reject actuator','ly300-reject-plate'],['CYL','Air-cylinder actuation','ly300-reject-cylinder'],['BIN','Rejected-product path','ly300-reject-bin']],
 COLLECT:[['STACK','Output collection','ly300-collect-stack'],['ALIGN','Collection alignment','ly300-collect-align'],['STRAP','Strapping-machine interface','ly300-collect-strap']],
 CONTROL:[['PLC','PLC control cabinet','ly300-control-plc'],['HMI','Touchscreen / industrial-PC interface','ly300-control-hmi'],['DRIVE','Servo and VFD drive electronics','ly300-control-drive']],
 ACCESS:[['FRAME','4230 mm machine base reference','ly300-access-frame'],['COVER','Service enclosure panels','ly300-access-cover'],['DOOR','Service doors / ventilation','ly300-access-door']]
};
for(const [branch,systems] of Object.entries(branches))for(const [sid,name,ref] of systems){const l3=`LY300.${branch}.${sid}`;add(l3,name,3,`LY300.${branch}`,[ref],'system',['BELT','HEAD','LED','LINE','PLATE'].includes(sid));for(const [i,component,part] of [[1,'Mechanical support','Bearing / bracket / fastener group'],[2,'Electrical / sensing interface','Cable / sensor / drive group'],[3,'Working interface','Belt / nozzle / optical / reject-contact group']]){const l4=`${l3}.B${i}`;add(l4,component,4,l3,[ref]);const l5=`${l4}.C`;add(l5,`${name} component ${i}`,5,l4,[ref],'component');add(`${l5}.P`,part,6,l5,[ref],'part');}}
export const UPG_LY300_TAXONOMY=Object.freeze(rows);export const UPG_LY300_TAXONOMY_BY_ID=new Map(rows.map(n=>[n.id,n]));export const upgLy300TaxonomyStats=()=>({total:rows.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,rows.filter(n=>n.level===level).length]))});
