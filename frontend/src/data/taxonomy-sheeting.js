const add=(nodes,id,parentId,level,levelName,name,meshRefs=[],description='',confidence='FAMILY_REFERENCE')=>nodes.push(Object.freeze({
  id,parentId,level,levelName,name,machineZone:name,meshRefs,sourceRefs:['BMJ-MACHINE-DATABASE','SHEETING-HSM56-BW','SHEETING-RECOVERED-REFERENCE'],
  confidence,verified:confidence==='VERIFIED',explodeVector:[level===2?.65:.15,level<4?.16:.08,0],explodeDistance:level===2?.85:level===3?.52:level===4?.32:level===5?.20:.12,focusCamera:null,description,maintenanceTag:null
}));
const nodes=[];
add(nodes,'SH',null,1,'Mesin','SHEETING LEXUS · HSM-CTM7',['MACHINE-SHEETING'],'Identitas mesin berasal dari database BMJ. Geometry khusus mempertahankan orientasi proses dan silhouette yang sebelumnya dikonfirmasi pengguna.','VERIFIED');

const chains=[
 ['ROLL','Rollstand / Unwind','sheeting-rollstand','Fixed-position two-sided rollstand','Reel support / drive','Reel shaft & chucks','Paper reel / brake / drive'],
 ['FEED','Feed / Tension / EPC','sheeting-feed','Elevated feed bridge','Tension & guide train','Guide roller / EPC sensor','Web edge sensing & guide roller'],
 ['CUT','Flat-Bed Knife / Cutter','sheeting-cutter','Main cutter housing','Knife / pull-roll assembly','sheeting-knife','Upper knife beam / blade / counter-bed'],
 ['DEL','Delivery / Layboy','sheeting-delivery','Sheet transport / delivery','Layboy stacking assembly','sheeting-layboy','Flat-plate lift table / sheet pile'],
 ['CTRL','Control / Utilities','sheeting-control','Electrical / hydraulic cabinet','Operator control assembly','Control panel / safety','HMI / E-stop / hydraulic utility'],
 ['ACCESS','Access / Structure','sheeting-access','Operator catwalk','Guardrail / service access','sheeting-structure','Main base / feet / access structure']
];
for(const [key,l2,mesh,l3,l4,l5name,l6] of chains){
 const a='SH.'+key;add(nodes,a,'SH',2,'Unit Utama',l2,[mesh]);
 const b=a+'.SUB';add(nodes,b,a,3,'Sub',l3,[mesh]);
 const c=b+'.BLOCK';add(nodes,c,b,4,'Block',l4,[mesh]);
 const d=c+'.PART';const specificMesh=l5name.startsWith('sheeting-')?l5name:mesh;add(nodes,d,c,5,'Part',l5name.replace(/^sheeting-/,'').replaceAll('-',' '),[specificMesh]);
 add(nodes,d+'.SPEC',d,6,'Spesifik Part',l6,[specificMesh]);
}
add(nodes,'SH.CUT.SUB.BLOCK.PART.KNIFE','SH.CUT.SUB.BLOCK.PART',6,'Spesifik Part','Knife Beam / Blade / Counter-Knife',['sheeting-knife'],'Flat-bed knife architecture is supported by the HSM 56 family reference.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.LIFT','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Flat-Plate Lift Table',['sheeting-layboy'],'Lift-table architecture is supported by the HSM 56 family reference.');

export const SHEETING_TAXONOMY=Object.freeze(nodes);
export const SHEETING_TAXONOMY_BY_ID=new Map(SHEETING_TAXONOMY.map(n=>[n.id,n]));
export const sheetingTaxonomyChildren=id=>SHEETING_TAXONOMY.filter(n=>n.parentId===id);
export const sheetingTaxonomyStats=()=>({total:SHEETING_TAXONOMY.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,SHEETING_TAXONOMY.filter(n=>n.level===level).length]))});
