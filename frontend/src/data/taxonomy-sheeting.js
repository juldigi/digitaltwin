const SOURCE_REFS=Object.freeze(['SHEETING-BMJ-DATABASE','SHEETING-HSM56-BW-PDF','SHEETING-HSM56-BW-FULLIMAGE','SHEETING-BW-HSM56-PRODUCT-PAGE','SHEETING-MEGAMACH-HSM-FAMILY','SHEETING-LEXUS-INDONESIA','SHEETING-PASABAN-PROCESS-MAP','SHEETING-UNICO-SHEETER-CONTROL','SHEETING-MAXSON-STACKER-SEQUENCE','SHEETING-CASEPAPER-STACKER-AIR','SHEETING-CUTMARK-PROCESS-COMPARISON','SHEETING-HSM56-NEAR-SERIAL','SHEETING-GREATWALL-SYNCHRO-VISUAL','SHEETING-RECOVERED-REFERENCE']);
const add=(nodes,id,parentId,level,levelName,name,meshRefs=[],description='',confidence='FAMILY_REFERENCE')=>nodes.push(Object.freeze({id,parentId,level,levelName,name,machineZone:name,meshRefs,sourceRefs:SOURCE_REFS,confidence,verified:confidence==='VERIFIED',explodeVector:[level===2?.65:.15,level<4?.16:.08,0],explodeDistance:level===2?.85:level===3?.52:level===4?.32:level===5?.20:.12,focusCamera:null,description,maintenanceTag:null}));
const nodes=[];
add(nodes,'SH',null,1,'Mesin','SHEETING LEXUS · HSM-CTM7',['MACHINE-SHEETING'],'Identitas BMJ verified. V66 memakai anchor visual komponen dari brochure/foto resmi HSM 56 2014 dan mempertahankan RIGHT→LEFT dari konfirmasi pengguna. Exact internal HSM-CTM7 tidak dinaikkan menjadi verified tanpa foto/drawing spesifik.','VERIFIED');
const chains=[
 ['ROLL','Unwind / Rollstand','sheeting-rollstand','Low fixed-position rollstand','Reel / chuck hub / swing-hydraulic support','sheeting-reel','Single low reel with exposed opposed hub and supported side arms'],
 ['FEED','Web Guide / Tension / EPC','sheeting-feed','Inclined two-sided guide frame','Four guide/tension rollers + compact EPC reference','sheeting-feed-rollers','Inclined supported roller path from reel toward main head'],
 ['HEAD','Main Head / Cross-Cut Zone','sheeting-cutter','Windowed gray/teal head','Hollow inspection window + dominant banded process cylinder + unresolved cut zone','sheeting-main-rollers','True aperture exposes the photo-anchored banded process cylinder without an opaque panel behind the glass'],
 ['DEL','Outfeed / Adjustment','sheeting-delivery','Long tape/belt outfeed','Belts / entry-exit rollers / transverse adjustment assemblies','sheeting-overlap','Longitudinal belt field with sparse transverse rods, supports, collars, knobs and operator handwheel'],
 ['STACK','Lift-Table Stacker','sheeting-layboy','Rigid open-front stacker tower','Lift rails / flat table / pallet / supported skid load','sheeting-stack-lift','Flat lift table and pallet within rigid guarded tower'],
 ['CTRL','Operator Controls','sheeting-control','Integrated low console','Sloped control face / pushbuttons / lever','sheeting-control','Compact low operator console beside outfeed/main head'],
 ['ACCESS','Access / Structure','sheeting-access','Grounded stacker side steps','Steps / landing / main chassis','sheeting-structure','Localized grounded access plus continuous structural chassis']
];
for(const [key,l2,mesh,l3,l4,l5name,l6] of chains){
 const a='SH.'+key;add(nodes,a,'SH',2,'Unit Utama',l2,[mesh]);
 const b=a+'.SUB';add(nodes,b,a,3,'Sub',l3,[mesh]);
 const c=b+'.BLOCK';add(nodes,c,b,4,'Block',l4,[mesh]);
 const d=c+'.PART';const specific=l5name.startsWith('sheeting-')?l5name:mesh;add(nodes,d,c,5,'Part',l5name.replace(/^sheeting-/,'').replaceAll('-',' '),[specific]);
 add(nodes,d+'.SPEC',d,6,'Spesifik Part',l6,[specific]);
}
add(nodes,'SH.ROLL.SUB.BLOCK.PART.HUB','SH.ROLL.SUB.BLOCK.PART',6,'Spesifik Part','Chuck Hub / Bolt Circle',['sheeting-reel'],'Exposed turquoise hub face, center and bolt circle are derived from the BW rollstand inset.');
add(nodes,'SH.FEED.SUB.BLOCK.PART.FRAME','SH.FEED.SUB.BLOCK.PART',6,'Spesifik Part','Inclined Guide Frame',['sheeting-feed-frame'],'Two-sided inclined rails replace the earlier generic tall tower.');
add(nodes,'SH.FEED.SUB.BLOCK.PART.EPC','SH.FEED.SUB.BLOCK.PART',6,'Spesifik Part','Compact EPC Edge Sensor',['sheeting-epc'],'Process-function reference only; exact HSM-CTM7 sensor shape/position remains reconstructed.');
add(nodes,'SH.HEAD.SUB.BLOCK.PART.WINDOW','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','Panoramic Window Assembly',['sheeting-window'],'V66 makes this a selectable true aperture: glass, frame and handles have no opaque side slab directly behind them.');
add(nodes,'SH.HEAD.SUB.BLOCK.PART.CYL','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','Banded Main Process Cylinder',['sheeting-main-rollers'],'One visually dominant turquoise cylinder with four bright circumferential bands is directly photo-anchored.');
add(nodes,'SH.HEAD.SUB.BLOCK.PART.KNIFE','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','Cross-Cut Zone Reference',['sheeting-knife'],'Exact knife architecture deliberately remains unresolved because public family sources conflict.');
add(nodes,'SH.HEAD.SUB.BLOCK.PART.BED','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','Integrated Bed / Service Plate',['sheeting-cutter-transport'],'Lower belt bed and metal service plate are derived from the official BW main photo.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.ROLLERS','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Outfeed Entry / Exit Rollers',['sheeting-delivery-rollers'],'Only the two main transverse transport rollers are modeled as rotating outfeed rollers.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.ADJ','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Adjustment Rod / Bracket / Collar / Knob',['sheeting-overlap'],'Three dominant transverse assemblies with photo-visible supports, collars and knobs.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.FAST','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Fast Tape Separation Zone',['sheeting-fast-belts'],'V66 process-zone geometry; exact Lexus drive ratios are not claimed.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.SLOW','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Slow Tape Transfer Zone',['sheeting-slow-belts'],'V66 process-zone geometry based on generic folio-sheeter transport architecture.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.OVERLAP','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Overlap Tape Zone',['sheeting-overlap-belts'],'V66 process-zone geometry used to make downstream sheet overlap coherent.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.HANDWHEEL','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Operator Outfeed Handwheel',['sheeting-outfeed-handwheel'],'Prominent operator-side adjustment handwheel derived from the official BW main/outfeed image.');
add(nodes,'SH.STACK.SUB.BLOCK.PART.LIFT','SH.STACK.SUB.BLOCK.PART',6,'Spesifik Part','Flat Lift Table / Blue Pallet',['sheeting-stack-lift'],'Flat lift table is family-spec supported; blue pallet and tower arrangement are photo anchored.');
add(nodes,'SH.STACK.SUB.BLOCK.PART.LOAD','SH.STACK.SUB.BLOCK.PART',6,'Spesifik Part','Reference Skid Paper Load',['sheeting-reference-stack'],'A substantial supported reference stack replaces the earlier unrealistically thin six-sheet-looking pile and is hidden automatically during live process simulation.');
export const SHEETING_TAXONOMY=Object.freeze(nodes);
export const SHEETING_TAXONOMY_BY_ID=new Map(SHEETING_TAXONOMY.map(n=>[n.id,n]));
export const sheetingTaxonomyChildren=id=>SHEETING_TAXONOMY.filter(n=>n.parentId===id);
export const sheetingTaxonomyStats=()=>({total:SHEETING_TAXONOMY.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,SHEETING_TAXONOMY.filter(n=>n.level===level).length]))});
