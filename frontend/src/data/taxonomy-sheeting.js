const SOURCE_REFS=Object.freeze([
  'SHEETING-BMJ-DATABASE',
  'SHEETING-LEXUS-INDONESIA',
  'SHEETING-GREATWALL-SYNCHRO-VISUAL',
  'SHEETING-GREATWALL-SRV56-TRADE',
  'SHEETING-HSM56-NEAR-SERIAL',
  'SHEETING-HSM56-BW',
  'SHEETING-RECOVERED-REFERENCE'
]);
const add=(nodes,id,parentId,level,levelName,name,meshRefs=[],description='',confidence='FAMILY_REFERENCE')=>nodes.push(Object.freeze({
  id,parentId,level,levelName,name,machineZone:name,meshRefs,sourceRefs:SOURCE_REFS,
  confidence,verified:confidence==='VERIFIED',explodeVector:[level===2?.65:.15,level<4?.16:.08,0],explodeDistance:level===2?.85:level===3?.52:level===4?.32:level===5?.20:.12,focusCamera:null,description,maintenanceTag:null
}));
const nodes=[];
add(nodes,'SH',null,1,'Mesin','SHEETING LEXUS · HSM-CTM7',['MACHINE-SHEETING'],'Identitas HSM-CTM7, serial, tahun dan SAP code berasal dari database BMJ. Exterior V59 direkonstruksi dari referensi Lexus Indonesia dan visual keluarga Great Wall/Accura sambil mempertahankan orientasi proses yang dikonfirmasi pengguna.','VERIFIED');

const chains=[
 ['ROLL','Unwind / Rollstand','sheeting-rollstand','Double hydraulic shaftless unwind reference','Hydraulic chuck & pickup structure','Reel station / chuck carriage','Two-position shaftless unwind / reel / chuck / pickup arm'],
 ['FEED','Feed / Tension / EPC','sheeting-feed','Open feed bridge','Tension / dancer / EPC train','Guide & tension rollers','Open guide bridge / dancer rollers / EPC edge sensors'],
 ['CUT','Cross-Cut Cutter','sheeting-cutter','Compact cutter head','Cross-cut mechanism / pull-roll assembly','sheeting-knife','Compact knife shafts / blade carrier / counter structure'],
 ['DEL','Delivery / Layboy','sheeting-delivery','Knife outfeed / overlap delivery','Tape transport / shingling / stacker','sheeting-layboy','Flat lift table / jogger frame / sheet pile'],
 ['CTRL','Control / Utilities','sheeting-control','Operator HMI / electrical','Computerized control assembly','Control panel / safety','HMI / E-stop / electrical-hydraulic control'],
 ['ACCESS','Access / Structure','sheeting-access','Operator-side catwalk','Guardrail / service access','sheeting-structure','Open chassis rails / feet / operator access structure']
];
for(const [key,l2,mesh,l3,l4,l5name,l6] of chains){
 const a='SH.'+key;add(nodes,a,'SH',2,'Unit Utama',l2,[mesh]);
 const b=a+'.SUB';add(nodes,b,a,3,'Sub',l3,[mesh]);
 const c=b+'.BLOCK';add(nodes,c,b,4,'Block',l4,[mesh]);
 const d=c+'.PART';const specificMesh=l5name.startsWith('sheeting-')?l5name:mesh;add(nodes,d,c,5,'Part',l5name.replace(/^sheeting-/,'').replaceAll('-',' '),[specificMesh]);
 add(nodes,d+'.SPEC',d,6,'Spesifik Part',l6,[specificMesh]);
}
add(nodes,'SH.ROLL.SUB.BLOCK.PART.CHUCK','SH.ROLL.SUB.BLOCK.PART',6,'Spesifik Part','Shaftless Chuck / Hydraulic Pickup',['sheeting-rollstand'],'Architecture is supported by Indonesian Lexus and regional Great Wall/Accura family references; exact HSM-CTM7 dimensions remain unverified.');
add(nodes,'SH.FEED.SUB.BLOCK.PART.EPC','SH.FEED.SUB.BLOCK.PART',6,'Spesifik Part','EPC Edge Sensor / Web Guide',['sheeting-feed'],'Automatic tension and EPC are explicitly described in the Indonesian Lexus Sheeter reference.');
add(nodes,'SH.CUT.SUB.BLOCK.PART.KNIFE','SH.CUT.SUB.BLOCK.PART',6,'Spesifik Part','Cross-Cut Knife Mechanism',['sheeting-knife'],'Exact HSM-CTM7 knife architecture is unresolved because public Lexus-family sources conflict between flat-bed and servo-rotary descriptions.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.OVERLAP','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Overlap / Shingling Belt Section',['sheeting-overlap'],'Long tape/overlap delivery is visually consistent with comparable high-speed folio sheeters and Great Wall/Accura family imagery.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.LIFT','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Flat Lift Table / Jogger',['sheeting-layboy'],'Flat lift-table architecture is supported by the HSM 56 comparison source and comparable folio sheeter references.');

export const SHEETING_TAXONOMY=Object.freeze(nodes);
export const SHEETING_TAXONOMY_BY_ID=new Map(SHEETING_TAXONOMY.map(n=>[n.id,n]));
export const sheetingTaxonomyChildren=id=>SHEETING_TAXONOMY.filter(n=>n.parentId===id);
export const sheetingTaxonomyStats=()=>({total:SHEETING_TAXONOMY.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,SHEETING_TAXONOMY.filter(n=>n.level===level).length]))});
