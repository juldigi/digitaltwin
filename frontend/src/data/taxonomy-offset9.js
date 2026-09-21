import {OFFSET9_MODULE_SEQUENCE} from './dimensions-offset9.js';
const rows=[];
const add=(id,name,level,parentId,meshRefs=[],kind='assembly',description='')=>rows.push(Object.freeze({id,name,level,parentId,meshRefs,kind,description,confidence:'OFFICIAL_FAMILY_REFERENCE',verified:id==='O9'||id.startsWith('O9.PRINT.PU')||id==='O9.COAT.L'}));
add('O9','Offset 9 · Speedmaster SX 52-4+L',1,null,['offset9-root'],'machine','BMJ identity and installed 4+L sequence.');
for(const [id,name,ref] of [['FEED','Feeder and sheet register','offset9-feeder'],['PRINT','Four offset printing units','offset9-print'],['COAT','Inline coating','offset9-coat'],['DELIVERY','High-pile delivery','offset9-delivery'],['ACCESS','Frames, guards and access','offset9-access']])add(`O9.${id}`,name,2,'O9',[ref]);
for(const m of OFFSET9_MODULE_SEQUENCE){
 const branch=m.type==='print'?'PRINT':'COAT',base=`O9.${branch}.${m.key}`,ref=`offset9-${m.key.toLowerCase()}`;
 add(base,m.label,3,`O9.${branch}`,[ref],`${m.type}-unit`);
 const systems=m.type==='print'?
  [['INK','Ink fountain and speed-compensated inking','inking'],['DAMP','Alcolor continuous dampening','dampening'],['PLATE','Plate cylinder and AutoPlate interface','plate'],['BLANKET','Blanket cylinder and wash device','blanket'],['IMPRESSION','Impression cylinder and jacket','impression'],['TRANSFER','Sheet grippers and transfer','transfer']]:
  [['SUPPLY','Coating circulation and chamber','supply'],['METER','Chambered blade and anilox metering','meter'],['FORM','Coating plate or blanket cylinder','form'],['IMPRESSION','Coating impression cylinder','impression']];
 for(const [sid,name,suffix] of systems){const l4=`${base}.${sid}`,mesh=`${ref}-${suffix}`;add(l4,name,4,base,[mesh],'system');
  for(const [j,component,part] of [[1,'Drive-side bearing and gear','Bearing / seal set'],[2,'Operator-side support and adjustment','Adjustment / fastener set'],[3,'Working element and contact surface','Working surface / wear item']]){const l5=`${l4}.C${j}`;add(l5,component,5,l4,[mesh],'component');add(`${l5}.P`,part,6,l5,[mesh],'part');}}
}
for(const [branch,id,name,ref,items] of [
 ['FEED','PILE','Pile lift and pallet table','offset9-feeder-pile',['Lift chain','Pile board','Height sensor']],
 ['FEED','HEAD','Suction head','offset9-feeder-head',['Suction foot','Blower manifold','Sheet separator']],
 ['FEED','BOARD','Central suction-belt feedboard and register','offset9-register',['Suction belt','Front lay','Side lay']],
 ['DELIVERY','CHAIN','Gripper-chain transport','offset9-delivery-chain',['Gripper bar','Chain rail','Sprocket']],
 ['DELIVERY','GUIDE','Venturi sheet guidance','offset9-delivery-guide',['Venturi nozzle','Guide plate','Air manifold']],
 ['DELIVERY','BRAKE','Sheet brake and release','offset9-delivery-brake',['Suction belt','Brake wheel','Release cam']],
 ['DELIVERY','PILE','Delivery pile lift','offset9-delivery-stack',['Pile board','Lift chain','Pile sensor']]
]){const l3=`O9.${branch}.${id}`;add(l3,name,3,`O9.${branch}`,[ref]);for(let i=0;i<items.length;i++){const l4=`${l3}.S${i+1}`;add(l4,items[i],4,l3,[ref],'system');const l5=`${l4}.C`;add(l5,`${items[i]} assembly`,5,l4,[ref],'component');add(`${l5}.P`,`${items[i]} service part`,6,l5,[ref],'part');}}
export const OFFSET9_TAXONOMY=Object.freeze(rows);
export const OFFSET9_TAXONOMY_BY_ID=new Map(rows.map(node=>[node.id,node]));
export const offset9TaxonomyStats=()=>({total:rows.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,rows.filter(node=>node.level===level).length]))});
