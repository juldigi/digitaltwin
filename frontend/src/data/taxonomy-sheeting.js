const SOURCE_REFS=Object.freeze(['SHEETING-BMJ-DATABASE','SHEETING-HSM56-BW','SHEETING-MEGAMACH-HSM-FAMILY','SHEETING-LEXUS-INDONESIA','SHEETING-HSM56-NEAR-SERIAL','SHEETING-GREATWALL-SYNCHRO-VISUAL','SHEETING-RECOVERED-REFERENCE']);
const add=(nodes,id,parentId,level,levelName,name,meshRefs=[],description='',confidence='FAMILY_REFERENCE')=>nodes.push(Object.freeze({id,parentId,level,levelName,name,machineZone:name,meshRefs,sourceRefs:SOURCE_REFS,confidence,verified:confidence==='VERIFIED',explodeVector:[level===2?.65:.15,level<4?.16:.08,0],explodeDistance:level===2?.85:level===3?.52:level===4?.32:level===5?.20:.12,focusCamera:null,description,maintenanceTag:null}));
const nodes=[];
add(nodes,'SH',null,1,'Mesin','SHEETING LEXUS · HSM-CTM7',['MACHINE-SHEETING'],'Identitas BMJ verified. V63 menggunakan anchor visual yang benar-benar terlihat pada brochure HSM 56 2014 dan mempertahankan RIGHT→LEFT dari konfirmasi pengguna; exact HSM-CTM7 tetap tidak diklaim tanpa foto/drawing spesifik.','VERIFIED');
const chains=[
 ['ROLL','Unwind / Rollstand','sheeting-rollstand','Low fixed-position rollstand','Reel / opposed chuck / swing-arm support','sheeting-reel','Single low reel with opposed chuck and two-sided support visual anchor'],
 ['FEED','Web Guide / Tension / EPC','sheeting-feed','Raised web-handling frame','Guide/tension roller path + EPC reference','sheeting-feed-rollers','Four visible supported guide/tension rollers in a tall frame'],
 ['CUT','Main Head / Cross-Cut Zone','sheeting-cutter','Windowed teal/gray main head','Large photographed cylindrical process elements + cross-cut zone','sheeting-main-rollers','Panoramic-window process cylinders; exact knife function unresolved'],
 ['DEL','Outfeed / Overlap','sheeting-delivery','Long narrow-belt outfeed','Entry/exit rollers + transverse adjustment rods','sheeting-overlap','Multiple longitudinal belts with transverse adjustment rods/collars'],
 ['STACK','Lift-Table Stacker','sheeting-layboy','Tower-like stacker enclosure','Flat lift table / pallet / side guards','sheeting-stack-lift','Rigid stacker tower with lift table and pallet'],
 ['CTRL','Operator Controls','sheeting-control','Compact low console','Buttons / E-stop / sloped face','sheeting-control','Low console attached to outfeed-side operating position'],
 ['ACCESS','Access / Structure','sheeting-access','Localized stacker steps','Short grounded steps / landing','sheeting-structure','Grounded main chassis with localized access only']
];
for(const [key,l2,mesh,l3,l4,l5name,l6] of chains){
 const a='SH.'+key;add(nodes,a,'SH',2,'Unit Utama',l2,[mesh]);
 const b=a+'.SUB';add(nodes,b,a,3,'Sub',l3,[mesh]);
 const c=b+'.BLOCK';add(nodes,c,b,4,'Block',l4,[mesh]);
 const d=c+'.PART';const specific=l5name.startsWith('sheeting-')?l5name:mesh;add(nodes,d,c,5,'Part',l5name.replace(/^sheeting-/,'').replaceAll('-',' '),[specific]);
 add(nodes,d+'.SPEC',d,6,'Spesifik Part',l6,[specific]);
}
add(nodes,'SH.ROLL.SUB.BLOCK.PART.CHUCK','SH.ROLL.SUB.BLOCK.PART',6,'Spesifik Part','Opposed Chuck / Reel Support',['sheeting-reel'],'Photographed HSM56 family anchor: one low reel with side support. Exact BMJ HSM-CTM7 chuck type remains unverified.');
add(nodes,'SH.FEED.SUB.BLOCK.PART.EPC','SH.FEED.SUB.BLOCK.PART',6,'Spesifik Part','EPC Edge Sensor / Web Guide',['sheeting-epc'],'EPC is supported by Indonesian Lexus process documentation; exact sensor geometry/position remains reconstructed.');
add(nodes,'SH.CUT.SUB.BLOCK.PART.CYL','SH.CUT.SUB.BLOCK.PART',6,'Spesifik Part','Large Window Process Cylinders',['sheeting-main-rollers'],'Large transverse cylinders are directly visible behind the panoramic window in the BW HSM56 photo. Their exact cutter/feed function is unresolved because public sources conflict.');
add(nodes,'SH.CUT.SUB.BLOCK.PART.KNIFE','SH.CUT.SUB.BLOCK.PART',6,'Spesifik Part','Cross-Cut Zone Reference',['sheeting-knife'],'Cross-cut function is certain for the sheeter, but V63 intentionally keeps the exact knife representation visually subordinate and unverified.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.ROLLERS','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Outfeed Entry / Exit Rollers',['sheeting-delivery-rollers'],'Only two prominent transverse outfeed rollers are retained to avoid the excessive roller clutter in earlier builds.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.ADJ','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Adjustment Rods / Collars',['sheeting-overlap'],'Multiple transverse rods, knobs and collars are directly visible over the belt bed in the HSM56 brochure photo.');
add(nodes,'SH.STACK.SUB.BLOCK.PART.LIFT','SH.STACK.SUB.BLOCK.PART',6,'Spesifik Part','Flat Lift Table / Pallet',['sheeting-stack-lift'],'Flat plate lift table is specified by BW and visibly shown inside the tower-like stacker.');
export const SHEETING_TAXONOMY=Object.freeze(nodes);
export const SHEETING_TAXONOMY_BY_ID=new Map(SHEETING_TAXONOMY.map(n=>[n.id,n]));
export const sheetingTaxonomyChildren=id=>SHEETING_TAXONOMY.filter(n=>n.parentId===id);
export const sheetingTaxonomyStats=()=>({total:SHEETING_TAXONOMY.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,SHEETING_TAXONOMY.filter(n=>n.level===level).length]))});
