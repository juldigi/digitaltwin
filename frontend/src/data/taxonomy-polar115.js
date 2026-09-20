const LEVELS=['Mesin','Unit Utama','Sub','Block','Part','Spesifik Part'];
const units=[
 ['FEED','Material Handling',['Left Air Side Table','Center Air Table','Right Air Side Table','Air Nozzle Grid','Front Support']],
 ['GAUGE','Backgauge Positioning',['Backgauge Beam','Gauge Rake','Twin Guideways','Lead Screw / Drive','Length Measurement Encoder']],
 ['CLAMP','Hydraulic Clamp',['Clamp Beam','Clamp Pressure Circuit','Clamp Pedal Control','False Clamp Plate']],
 ['KNIFE','Knife Cutting System',['Knife Carrier','1150 mm Knife','Eccentric / Link Drive','Knife Change Fixtures','Cutting Stick']],
 ['SAFETY','Safety System',['Photoelectric Light Barrier','Two-Hand Cut Buttons','Rear Guard','Knife Brake / Top Position Monitor']],
 ['CONTROL','EM Monitor Control',['CRT Monitor Console','Program Memory','Dimension Keypad','Main Control Cabinet','Position Controller']],
 ['HYD','Hydraulic / Air Supply',['Hydraulic Power Unit','Oil Reservoir','Valve Manifold','Air Blower','Distribution Duct']]
];
const nodes=[],root='P115';
const add=(id,parentId,level,name,meshRefs=[],description='',confidence='MODEL_REFERENCE')=>nodes.push(Object.freeze({id,parentId,level,levelName:LEVELS[level-1],name,machineZone:name,meshRefs,sourceRefs:['BMJ-MACHINE-DATABASE','POLAR-115-EM-SOURCE-DOSSIER'],confidence,verified:false,explodeVector:[level===2?.7:.15,level<4?.18:.08,0],explodeDistance:level===2?.9:level===3?.55:level===4?.34:level===5?.22:.12,focusCamera:null,description,maintenanceTag:null}));
add(root,null,1,'POLAR 115 EM MON · Serial 5831536',['POLAR-115-EM'],'Identitas model dan serial berasal dari database BMJ. Opsi terpasang mengikuti bukti publik yang konsisten; ukuran enclosure non-engineering.');
for(const [code,name,parts] of units){const u=root+'.'+code;add(u,root,2,name,['polar-'+code.toLowerCase()]);parts.forEach((part,i)=>{const s=u+'.S'+(i+1),mesh='polar-'+code.toLowerCase()+'-'+(i+1);add(s,u,3,part+' Assembly',[mesh]);add(s+'.B',s,4,part+' Functional Block',[mesh]);add(s+'.B.P',s+'.B',5,part,[mesh]);add(s+'.B.P.X',s+'.B.P',6,part+' Service Element',[mesh],i===0?'Primary serviceable element represented in geometry.':'Functional element; serial-specific part number not claimed.');});}
export const POLAR115_TAXONOMY=Object.freeze(nodes);
export const POLAR115_TAXONOMY_BY_ID=new Map(nodes.map(n=>[n.id,n]));
