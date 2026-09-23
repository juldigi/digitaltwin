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
  'Identitas BMJ verified. V196 memakai IMG_2479–IMG_2487 sebagai visual source of truth dan mempertahankan RIGHT→LEFT. Referensi HSM-family hanya digunakan untuk proses/specification yang tersembunyi.','VERIFIED');

const chains=[
 ['ROLL','Hydraulic Unwind / Rollstand','sheeting-rollstand','Fixed-Position Rollstand Assembly','Reel arms / hydraulic stand / upper support structure','sheeting-reel','Loaded reel plus second photo-visible arm set whose independent station function is not claimed'],
 ['FEED','Web Carrier / Guide-Tension Section','sheeting-feed','Overhead Carrier + Deep Roller Loop','Low entry roll / deep alternating loop / meters / electrical cabinet','sheeting-feed-rollers','IMG_2479/2480 show a long upper carrier and deep threaded web loops before the cutter'],
 ['HEAD','LEXUS Cutter / Main Drive','sheeting-cutter','Asymmetric Guarded Cutter Cabinet','Draw roll / snubbers / pressure panel / guarded cut zone','sheeting-main-rollers','Actual turquoise LEXUS cabinet with photo-visible exterior transport hardware'],
 ['DEL','Delivery / Alignment','sheeting-delivery','Multi-Level Open Belt Table','Belts / shafts / hold-down wheels / crossrails','sheeting-overlap','Actual open delivery mechanism from IMG_2482–IMG_2483'],
 ['STACK','Stack / Lay Table','sheeting-layboy','Rack-Adjusted Open Stacker','Rack bars / handwheels / guide carriages / lift support','sheeting-stacker-joggers','Actual rack-and-handwheel stack table from IMG_2484'],
 ['CTRL','Operator Controls','sheeting-control','Broad Sloped Console','HMI / selectors / pushbuttons','sheeting-control','Actual delivery-side operator console'],
 ['ACCESS','Operator Access','sheeting-access','Continuous Catwalk / Steps','Diamond plate / steps / railings','sheeting-access','Actual operator-side catwalk and railings']
];
for(const [key,l2,mesh,l3,l4,l5ref,l6] of chains){
 const a='SH.'+key;add(nodes,a,'SH',2,'Unit Utama',l2,[mesh]);
 const b=a+'.SUB';add(nodes,b,a,3,'Sub',l3,[mesh]);
 const c=b+'.BLOCK';add(nodes,c,b,4,'Block',l4,[mesh]);
 const d=c+'.PART';add(nodes,d,c,5,'Part',l4,[l5ref]);
 add(nodes,d+'.SPEC',d,6,'Spesifik Part',l6,[l5ref]);
}

add(nodes,'SH.ROLL.SUB.BLOCK.PART.BRIDGE','SH.ROLL.SUB.BLOCK.PART',6,'Spesifik Part','Upper Web Carrier Structure',['sheeting-unwind-bridge'],'V196 reclassifies this as the independent photo-visible upper web-carrier assembly spanning above the unwind/feed path, not as a rollstand bridge.');
add(nodes,'SH.ROLL.SUB.BLOCK.PART.MANIFOLD','SH.ROLL.SUB.BLOCK.PART',6,'Spesifik Part','Hydraulic Valve Manifold / Hose Tower',['sheeting-rollstand-manifold'],'Tall manifold cabinet, dense valve blocks and routed black hoses follow IMG_2485.');
add(nodes,'SH.ROLL.SUB.BLOCK.PART.PANEL','SH.ROLL.SUB.BLOCK.PART',6,'Spesifik Part','Unwind Pressure / Regulator Pedestal',['sheeting-unwind-panel'],'Pressure gauges and blue regulators follow IMG_2479.');
add(nodes,'SH.ROLL.SUB.BLOCK.PART.FRONTCTRL','SH.ROLL.SUB.BLOCK.PART',6,'Spesifik Part','Rollstand Front Control Pedestal',['sheeting-rollstand-front-controls'],'Turquoise front pedestal with discrete controls is photo anchored.');

add(nodes,'SH.FEED.SUB.BLOCK.PART.FRAME','SH.FEED.SUB.BLOCK.PART',6,'Spesifik Part','Open Loop-Roller Support Frame',['sheeting-feed-frame'],'Open rectangular uprights and rails support the deep alternating web loop visible in IMG_2479/2480.');
add(nodes,'SH.FEED.SUB.BLOCK.PART.CARRIER','SH.FEED.SUB.BLOCK.PART',6,'Spesifik Part','Long Overhead Web Carrier',['sheeting-unwind-bridge'],'Long gray beam/cross-tie/hanger structure is photo anchored and carries the threaded web path above the unwind/feed section.');
add(nodes,'SH.FEED.SUB.BLOCK.PART.LOW','SH.FEED.SUB.BLOCK.PART',6,'Spesifik Part','Low Entry Guide Roll',['sheeting-feed-rollers'],'Photo-visible turquoise low guide roll is modeled before the elevated roller bank.');
add(nodes,'SH.FEED.SUB.BLOCK.PART.METERS','SH.FEED.SUB.BLOCK.PART',6,'Spesifik Part','Feed Digital Meter Pair',['sheeting-feed-meters'],'Two stacked digital meter housings are visible on the operator-side upright.');
add(nodes,'SH.FEED.SUB.BLOCK.PART.ELECTRICAL','SH.FEED.SUB.BLOCK.PART',6,'Spesifik Part','Feed / Drive Electrical Cabinet',['sheeting-electrical-cabinet'],'Freestanding gray electrical cabinet beside the roller frame is photo anchored.');
add(nodes,'SH.FEED.SUB.BLOCK.PART.EPC','SH.FEED.SUB.BLOCK.PART',6,'Spesifik Part','Web Alignment / Edge Guide Reference',['sheeting-epc'],'Exact sensor internals remain family/process reference.','PROCESS_FAMILY_REFERENCE');

add(nodes,'SH.HEAD.SUB.BLOCK.PART.WINDOW','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','LEXUS Silver Inspection Panel / Window',['sheeting-window'],'Silver inspection-panel frame, narrow transparent window and LEXUS plate follow IMG_2486–IMG_2487.');
add(nodes,'SH.HEAD.SUB.BLOCK.PART.DRAW','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','Large Black Exterior Draw Roll',['sheeting-main-rollers'],'The actual black exterior draw/contact roll replaces the old family-reference turquoise drum.');
add(nodes,'SH.HEAD.SUB.BLOCK.PART.SNUB','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','Top Snubber / Guide Wheel Bank',['sheeting-snubber-wheels'],'Nine small wheels and their transverse shaft are photo visible above the draw roll.');
add(nodes,'SH.HEAD.SUB.BLOCK.PART.DRIVE','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','Top Roll Drive / Motor Pair',['sheeting-top-drive'],'Two angled drive units are reconstructed from the actual cutter entrance.');
add(nodes,'SH.HEAD.SUB.BLOCK.PART.PNEU','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','Cutter Pneumatic Pressure Panel',['sheeting-cutter-pneumatic-panel'],'Four gauges and blue regulator controls are visible on the cutter side.');
add(nodes,'SH.HEAD.SUB.BLOCK.PART.DISPLAY','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','Top Sheet-Length / Status Display',['sheeting-length-display'],'Top rectangular enclosure and support post are photo anchored.');
add(nodes,'SH.HEAD.SUB.BLOCK.PART.KNIFE','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','Guarded Flat-Bed Cross-Cut Zone',['sheeting-knife'],'BMJ exterior remains enclosed; HSM 56 family specifies Flat Bed Knife. Internal mechanism is shown only in cutaway as family-grounded process reference.','FAMILY_REFERENCE__BMJ_EXTERIOR_VERIFIED');
add(nodes,'SH.HEAD.SUB.BLOCK.PART.BEDKNIFE','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','Stationary Bed Knife · Cutaway Only',['sheeting-flatbed-cutter-family'],'Stationary bed knife is process-family evidence from flat-bed sheeter references; exact BMJ blade geometry remains unresolved.','PROCESS_FAMILY_REFERENCE__CUTAWAY_ONLY');
add(nodes,'SH.HEAD.SUB.BLOCK.PART.FLYKNIFE','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','Rotary Fly-Knife Revolver · Cutaway Only',['sheeting-flatbed-cutter-family'],'Rotary revolver with tangential fly blade represents the documented stationary-bed-knife sheeter principle; exact HSM-CTM7 helix/dimensions remain unresolved.','PROCESS_FAMILY_REFERENCE__CUTAWAY_ONLY');
add(nodes,'SH.HEAD.SUB.BLOCK.PART.TAKEAWAY','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','Cutter Take-Away Pinch · Cutaway Only',['sheeting-cut-takeaway-pinch'],'Generic stationary-bed-knife references require take-away pinch to hold the web taut during cut.','PROCESS_FAMILY_REFERENCE__CUTAWAY_ONLY');
add(nodes,'SH.HEAD.SUB.BLOCK.PART.BED','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','Guarded Cut / Exit Bed',['sheeting-cutter-transport'],'Low internal transport bed remains subordinate to the verified exterior.');
add(nodes,'SH.HEAD.SUB.BLOCK.PART.SERVICE','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','Cutter Door / Safety / Nameplate Details',['sheeting-cutter-service-detail'],'Door hinges, machine-name plate, warning placard and exterior E-stop are photo anchored.');
add(nodes,'SH.HEAD.SUB.BLOCK.PART.EXTRACT','SH.HEAD.SUB.BLOCK.PART',6,'Spesifik Part','Trim / Dust Extraction Bag Accessory',['sheeting-trim-extraction'],'Photo-visible accessory; exact internal connection is not claimed.','PHOTO_VISIBLE_ACCESSORY');

add(nodes,'SH.DEL.SUB.BLOCK.PART.ROLLERS','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Seven Delivery Rollers / Shafts',['sheeting-delivery-rollers'],'Photo-matched transverse roller/shaft set.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.FAST','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','High-Speed Take-Away / Gap Zone',['sheeting-fast-belts'],'Green belt geometry is photo anchored; V196 uses process-reference fast take-away after the cut to open a physical gap from the still-attached next web.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.SLOW','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Slow-Speed Deceleration Zone',['sheeting-slow-belts'],'Slow-speed tapes decelerate detached sheets after the high-speed section; exact BMJ speed ratio is not claimed.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.ALIGN','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Overlap / Shingling Zone',['sheeting-overlap-belts'],'Successive sheets run at a pitch shorter than sheet length so controlled overlap/shingling forms before stack entry.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.WHEELS','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Hold-Down Wheel / Cross-Shaft Assemblies',['sheeting-overlap'],'Three rows / eighteen white wheels plus crossrails and clamps are modeled.');
add(nodes,'SH.DEL.SUB.BLOCK.PART.HANDWHEEL','SH.DEL.SUB.BLOCK.PART',6,'Spesifik Part','Delivery Adjustment Handwheels',['sheeting-outfeed-handwheel'],'Photo-visible black adjustment handwheels remain manual/static.');

add(nodes,'SH.STACK.SUB.BLOCK.PART.RACK','SH.STACK.SUB.BLOCK.PART',6,'Spesifik Part','Rack Bars / Teeth / Guide Carriages',['sheeting-stacker-joggers'],'Long side racks, repeated teeth and sliding guide carriages follow IMG_2484.');
add(nodes,'SH.STACK.SUB.BLOCK.PART.LIFT','SH.STACK.SUB.BLOCK.PART',6,'Spesifik Part','Flat Plate Lift / Pallet Support',['sheeting-stack-lift'],'Position is photo anchored; vertical compensation remains HSM-family process supported.','FAMILY_PROCESS_REFERENCE__PHOTO_POSITION_ANCHORED');
add(nodes,'SH.STACK.SUB.BLOCK.PART.LOAD','SH.STACK.SUB.BLOCK.PART',6,'Spesifik Part','Captured Paper Stack',['sheeting-reference-stack'],'Reference pile follows the actual photo and hides during live simulation.');
add(nodes,'SH.STACK.SUB.BLOCK.PART.LIGHT','SH.STACK.SUB.BLOCK.PART',6,'Spesifik Part','Stacker Signal Tower',['sheeting-stack-light'],'Three-segment tower at the output frame is photo anchored.');
add(nodes,'SH.STACK.SUB.BLOCK.PART.ENDCTRL','SH.STACK.SUB.BLOCK.PART',6,'Spesifik Part','Stacker End Control Block',['sheeting-stack-end-controls'],'Output-end control block with start/stop hardware is photo anchored.');

export const SHEETING_TAXONOMY=Object.freeze(nodes);
export const SHEETING_TAXONOMY_BY_ID=new Map(SHEETING_TAXONOMY.map(n=>[n.id,n]));
export const sheetingTaxonomyChildren=id=>SHEETING_TAXONOMY.filter(n=>n.parentId===id);
export const sheetingTaxonomyStats=()=>({total:SHEETING_TAXONOMY.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,SHEETING_TAXONOMY.filter(n=>n.level===level).length]))});
