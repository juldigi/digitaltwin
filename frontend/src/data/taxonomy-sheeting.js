const SOURCE_REFS=Object.freeze([
  'SHEETING-BMJ-PHOTOSET-20260922','SHEETING-BMJ-DATABASE','SHEETING-RECOVERED-REFERENCE',
  'SHEETING-HSM56-BW-PDF','SHEETING-BW-HSM56-PRODUCT-PAGE','SHEETING-UNICO-SHEETER-CONTROL',
  'SHEETING-PASABAN-PROCESS-MAP','SHEETING-MAXSON-MSP-PDF'
]);
const add=(nodes,id,parentId,level,levelName,name,meshRefs=[],description='',confidence='VERIFIED_VISUAL')=>nodes.push(Object.freeze({
  id,parentId,level,levelName,name,machineZone:name,meshRefs,sourceRefs:SOURCE_REFS,confidence,
  verified:['VERIFIED','VERIFIED_VISUAL'].includes(confidence),
  explodeVector:[level===2?.65:.15,level<4?.16:.08,0],
  explodeDistance:level===2?.85:level===3?.52:level===4?.32:level===5?.20:.12,
  focusCamera:null,description,maintenanceTag:null
}));

const nodes=[];
add(nodes,'SH',null,1,'Mesin','SHEETING LEXUS · HSM-CTM7',['MACHINE-SHEETING'],
  'Identitas BMJ verified. V193 memakai foto aktual BMJ IMG_2479–IMG_2487 sebagai sumber primer untuk exterior/placement. RIGHT→LEFT tetap mengikuti konfirmasi pengguna. Sumber HSM family hanya mengisi hubungan proses yang tidak terlihat di balik guard.','VERIFIED');

const chains=[
  ['ROLL','Unwind / Rollstand','sheeting-rollstand','Two-Sided Fixed Rollstand','Swept arms / chuck positions / hydraulic actuators','sheeting-reel','Loaded reel, opposed chuck and alternate empty station captured in BMJ photos'],
  ['FEED','Web Guide / Tension','sheeting-feed','Open Multi-Roller Bridge','Long frame / roller bank / edge-guide reference','sheeting-feed-rollers','Actual open roller bridge replaces the old compact inclined four-roller reference'],
  ['HEAD','Main Cutter / Drive','sheeting-cutter','Enclosed LEXUS Cutter Cabinet','Inspection window / nip roller train / guarded cut zone','sheeting-main-rollers','Actual large turquoise cabinet with long LEXUS inspection window and exposed entry/nip rollers'],
  ['DEL','Delivery / Alignment','sheeting-delivery','Open Green-Belt Table','Belt field / polished shafts / crossrails / hold-down wheels','sheeting-overlap','Actual open delivery table with dense green belts and adjustable hardware'],
  ['STACK','Stack / Lay Table','sheeting-layboy','Open Adjustable Stack Table','Manual guides / stack surface / paper pile','sheeting-stack-lift','Actual open output table; V68 tall mesh tower is removed'],
  ['CTRL','Operator Controls','sheeting-control','Broad Sloped Console','Display / selectors / pushbuttons','sheeting-control','Actual delivery-side physical console captured in BMJ photos'],
  ['ACCESS','Access / Structure','sheeting-access','Catwalk / Steps','Diamond plate / stairs / chassis','sheeting-structure','Actual operator access and grounded open chassis']
];

for(const [key,l2,mesh,l3,l4,l5name,l6] of chains){
  const a='SH.'+key;add(nodes,a,'SH',2,'Unit Utama',l2,[mesh]);
  const b=a+'.SUB';add(nodes,b,a,3,'Sub',l3,[mesh]);
  const c=b+'.BLOCK';add(nodes,c,b,4,'Block',l4,[mesh]);
  const d=c+'.PART';const specific=l5name.startsWith('sheeting-')?l5name:mesh;
  add(nodes,d,c,5,'Part',l5name.replace(/^sheeting-/,'').replaceAll('-',' '),[specific]);
  add(nodes,d+'.SPEC',d,6,'Spesifik Part',l6,[specific]);
}

add(nodes,'SH.ROLL.SUB.BLOCK.PART.HUB','SH.ROLL.SUB.BLOCK.PART',6,'Spesifik Part','Loaded Chuck / Core Assembly',['sheeting-reel'],
  'Loaded paper reel and turquoise opposed chuck geometry are directly anchored to IMG_2479/2480/2485.');
add(nodes,'SH.ROLL.SUB.BLOCK.PART.MANIFOLD','SH.ROLL.SUB.BLOCK.PART',6,'Spesifik Part','Hydraulic Hose / Valve Manifold',['sheeting-rollstand-manifold'],
  'Tall hose/manifold cluster beside the unwind arms is visible in the actual BMJ photo set.');
add(nodes,'SH.ROLL.SUB.BLOCK.PART.PANEL','SH.ROLL.SUB.BLOCK.PART',6,'Spesifik Part','Unwind Control Pedestal',['sheeting-unwind-panel'],
  'Narrow turquoise pedestal with multiple round controls is photo anchored.');

add(nodes,'SH.FEED.SUB.BLOCK.PART.FRAME','SH.FEED.SUB.BLOCK.PART',6,'Spesifik Part','Long Open Roller Frame',['sheeting-feed-frame'],
  'Two-sided long open structure with tall posts/top beams follows the actual BMJ machine.');
add(nodes,'SH.FEED.SUB.BLOCK.PART.EPC','SH.FEED.SUB.BLOCK.PART',6,'Spesifik Part','Edge Guide Reference',['sheeting-epc'],
  'Position is photo/process anchored; exact sensor internals remain unresolved.','PROCESS_FAMILY_REFERENCE');

add(nodes,'SH.HEAD.SUB.BLOCK.PART.WINDOW','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','LEXUS Long Inspection Window',['sheeting-window'],
  'Long silver inspection-panel frame, transparent viewing strip and LEXUS plate follow IMG_2486/2487.');
add(nodes,'SH.HEAD.SUB.BLOCK.PART.CYL','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','Infeed / Draw / Nip Roller Train',['sheeting-main-rollers'],
  'Only photo-visible rollers around the guarded cutter cabinet are rendered and animated as web-contact surfaces.');
add(nodes,'SH.HEAD.SUB.BLOCK.PART.KNIFE','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','Guarded Internal Cross-Cut Zone',['sheeting-knife'],
  'No blade mesh is shown in V193: actual BMJ photos do not expose blade type, stroke or actuation.','VERIFIED_VISUAL__INTERNAL_MECHANISM_UNRESOLVED');
add(nodes,'SH.HEAD.SUB.BLOCK.PART.BED','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','Cutter Entry / Exit Apron',['sheeting-cutter-transport'],
  'Low guarded transport/apron geometry around the main cutter body.');

add(nodes,'SH.DEL.SUB.BLOCK.PART.ROLLERS','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Delivery Roller / Shaft Set',['sheeting-delivery-rollers'],
  'Multiple polished transverse shafts/rollers are visible across the delivery table.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.ADJ','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Crossrail / Hold-Down Wheel Assemblies',['sheeting-overlap'],
  'Photo-visible adjustable crossrails, white wheels and holders.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.FAST','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Upstream Green Belt Zone',['sheeting-fast-belts'],
  'Geometry is photo anchored; the fast-zone timing remains a folio-sheeter process relationship rather than an OEM ratio claim.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.SLOW','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Mid Delivery Belt Zone',['sheeting-slow-belts'],
  'Dense green longitudinal belt field follows the BMJ photos; relative speed is simulation-only process normalization.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.OVERLAP','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Downstream Alignment Belt Zone',['sheeting-overlap-belts'],
  'Downstream belt field and open alignment layout follow the actual machine.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.HANDWHEEL','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Delivery Adjustment Handwheels',['sheeting-outfeed-handwheel'],
  'V193 renders three prominent black handwheels rather than one generic reference wheel.');

add(nodes,'SH.STACK.SUB.BLOCK.PART.LIFT','SH.STACK.SUB.BLOCK.PART',6,'Spesifik Part','Flat Stack Surface / Lift Reference',['sheeting-stack-lift'],
  'Open stack-table position is photo anchored; lift behavior remains supported by Lexus HSM family specification.','FAMILY_PROCESS_REFERENCE__PHOTO_POSITION_ANCHORED');
add(nodes,'SH.STACK.SUB.BLOCK.PART.JOG','SH.STACK.SUB.BLOCK.PART',6,'Spesifik Part','Manual Guide / Backstop Assemblies',['sheeting-stacker-joggers'],
  'Actual guide rails/backstop and large black adjustment wheels are modeled as manual hardware; they are not artificially oscillated.');
add(nodes,'SH.STACK.SUB.BLOCK.PART.LOAD','SH.STACK.SUB.BLOCK.PART',6,'Spesifik Part','Captured Paper Pile',['sheeting-reference-stack'],
  'Reference pile is photo anchored and is hidden when live process simulation starts.');

export const SHEETING_TAXONOMY=Object.freeze(nodes);
export const SHEETING_TAXONOMY_BY_ID=new Map(SHEETING_TAXONOMY.map(n=>[n.id,n]));
export const sheetingTaxonomyChildren=id=>SHEETING_TAXONOMY.filter(n=>n.parentId===id);
export const sheetingTaxonomyStats=()=>({
  total:SHEETING_TAXONOMY.length,
  byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,SHEETING_TAXONOMY.filter(n=>n.level===level).length]))
});
