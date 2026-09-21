import {OFFSET8_MODULE_SEQUENCE} from './dimensions-offset8.js';
const rows=[];const add=(id,name,level,parentId,meshRefs=[],kind='assembly')=>rows.push({id,name,level,parentId,meshRefs,kind});
add('O8','Offset 8 · CX 104-8+LYYL',1,null,['offset8-root'],'machine');
for(const [id,name,ref] of [['FEED','Preset Plus feeder and register','offset8-feeder'],['PRINT','Eight offset printing units','offset8-print'],['FINISH','LYYL inline finishing','offset8-finish'],['DELIVERY','Preset Plus extended delivery','offset8-delivery'],['ACCESS','Frames, guards and access','offset8-access']])add('O8.'+id,name,2,'O8',[ref]);
for(const m of OFFSET8_MODULE_SEQUENCE){
 const branch=m.type==='print'?'PRINT':'FINISH',base='O8.'+branch+'.'+m.key,ref='offset8-'+m.key.toLowerCase();
 add(base,m.label,3,'O8.'+branch,[ref],m.type+'-unit');
 const systems=m.type==='print'?
 [['CYL','Plate, blanket, impression and transfer',[ref+'-cylinders']],['INK','Ink fountain and represented inking roller train · exact installed count unverified',[ref+'-inking']],['DAMP','Alcolor dampening system · represented roller train, exact installed count unverified',[ref+'-dampening']],['SHEET','Gripper transfer and AirTransfer Venturi guidance',[ref+'-sheet']]]:
 m.type==='coat'?
 [['CHAMBER','Pressurized chamber doctor blade',[ref+'-chamber']],['ANILOX','Exchangeable anilox metering roller',[ref+'-anilox']],['DRIP','Coating drip tray and level sensing',[ref+'-drip']],['SUPPLY','Coating supply interface reference',[ref+'-supply']],['APPLY','Coating blanket and impression cylinders',[ref+'-apply']]]:
 [['AIR','Dryer process cassette bank · installed energy type unasserted',[ref+'-air']],['GUIDE','Sheet guide and clearance path',[ref+'-guide']],['RECIRC','Recirculated-air plenum reference',[ref+'-recirc']],['EXHAUST','Extraction manifold',[ref+'-exhaust']]];
 for(const [s,n,refs] of systems){add(base+'.'+s,n,4,base,refs);for(let i=1;i<=3;i++){const c=base+'.'+s+'.C'+i;add(c,n+' · component '+i,5,base+'.'+s,refs,'component');add(c+'.P',n+' · maintainable part '+i,6,c,refs,'part');}}
}
for(const [id,name,ref] of [['PILE','Feeder pile and lift','offset8-feeder-pile'],['HEAD','Suction head and air manifold','offset8-feeder-head'],['BOARD','Stream feedboard, front/side lays','offset8-register'],['CHAIN','Delivery gripper-chain loop','offset8-delivery-chain'],['GRIPPER','Delivery gripper bars','offset8-delivery-grippers'],['BRAKE','Dynamic sheet brake','offset8-delivery-brake'],['STACK','Delivery pile table','offset8-delivery-stack']]){const parent=['CHAIN','GRIPPER','BRAKE','STACK'].includes(id)?'O8.DELIVERY':'O8.FEED';add(parent+'.'+id,name,3,parent,[ref]);for(let i=1;i<=3;i++){const c=parent+'.'+id+'.C'+i;add(c,name+' · component '+i,4,parent+'.'+id,[ref]);add(c+'.A',name+' · assembly '+i,5,c,[ref]);add(c+'.A.P',name+' · service part '+i,6,c+'.A',[ref]);}}
export const OFFSET8_TAXONOMY=rows;
export const OFFSET8_TAXONOMY_BY_ID=new Map(rows.map(n=>[n.id,n]));
export const offset8TaxonomyStats=()=>({total:rows.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(l=>[l,rows.filter(n=>n.level===l).length]))});