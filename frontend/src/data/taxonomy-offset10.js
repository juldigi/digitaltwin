import {CONFIDENCE} from './confidence.js';
import {OFFSET10_PRINTING_UNIT_KEYS,OFFSET10_COATING_UNIT_KEYS,OFFSET10_Y_UNIT_KEYS} from './dimensions-offset10.js';

const nodes=[];
const add=(id,parentId,level,levelName,name,{meshRefs=[],sourceRefs=['O10-PROPOSAL'],confidence=CONFIDENCE.HIGH,explodeVector=[0,0,0],description='',maintenanceTag=null}={})=>{
  const node={id,parentId,level,levelName,name,machineZone:name,meshRefs,sourceRefs,confidence,verified:confidence===CONFIDENCE.VERIFIED,explodeVector,explodeDistance:level===2?1.35:level===3?.78:level===4?.48:level===5?.28:.18,focusCamera:null,description,maintenanceTag};
  nodes.push(Object.freeze(node));return id;
};
const part=(parent,key,name,refs=[],specifics=[],sourceRefs=['O10-PROPOSAL'],description='')=>{
  const id=parent+'.'+key;
  add(id,parent,5,'Part',name,{meshRefs:refs,sourceRefs,confidence:CONFIDENCE.HIGH,explodeVector:[.07,.09,.10],description});
  specifics.forEach((s,i)=>{
    const spec=typeof s==='string'?{name:s}:s;
    add(id+'.S'+(i+1),id,6,'Spesifik Part',spec.name,{meshRefs:spec.refs||[],sourceRefs:spec.sources||sourceRefs,confidence:spec.confidence||CONFIDENCE.HIGH,explodeVector:[.035,.045,.06],description:spec.description||'',maintenanceTag:spec.maintenanceTag||null});
  });
  return id;
};
const block=(parent,key,name,refs=[],sourceRefs=['O10-PROPOSAL'],vec=[0,.12,0])=>{
  const id=parent+'.'+key;add(id,parent,4,'Block',name,{meshRefs:refs,sourceRefs,explodeVector:vec});return id;
};
const sub=(parent,key,name,refs=[],sourceRefs=['O10-PROPOSAL'],vec=[0,.2,0],description='')=>{
  const id=parent+'.'+key;add(id,parent,3,'Sub',name,{meshRefs:refs,sourceRefs,explodeVector:vec,description});return id;
};

add('O10',null,1,'Mesin','OFFSET 10 · Heidelberg Speedmaster CX 104-2+LY-8+LY-1+L UV + FoilStar',{
  meshRefs:['MACHINE-OFFSET10'],
  sourceRefs:['O10-FINAL-DRAWING','O10-PROPOSAL','O10-UV-LAYOUT','O10-PREINSTALL','O10-SYSTEM','O10-TECH-DATA','O10-CX104-OFFICIAL','O10-FOILSTAR-OFFICIAL'],
  description:'Konfigurasi proyek BMJ: elevated 564 mm, water cooled, Full UV, FoilStar, tiga coating unit dan Preset Plus X3 delivery.'
});

const l2=[
 ['FEEDER','Feeder & Sheet Alignment',['o10-feeder','o10-feedboard'],[-1.1,.1,0]],
 ['PRINT','Printing & Sheet Transfer',['o10-printing-units'],[0,.28,.62]],
 ['FOIL','FoilStar Cold Transfer',['o10-foilstar'],[-.15,.65,-.45]],
 ['COAT','Coating System',['o10-coating-units'],[.45,.28,-.42]],
 ['UV','UV / Drying System',['o10-uv-system','o10-eop-uv'],[.55,.6,0]],
 ['DELIVERY','Preset Plus X3 Delivery',['o10-delivery'],[1.1,.1,0]],
 ['ACCESS','Elevated Platform / Access',['o10-platform'],[0,-.30,.78]],
 ['AUX','Peripheral / Utility Systems',['o10-peripherals','o10-prinect-center'],[0,.55,-.9]]
];
for(const [k,n,r,v] of l2)add('O10.'+k,'O10',2,'Unit Utama',n,{meshRefs:r,sourceRefs:['O10-FINAL-DRAWING','O10-PROPOSAL','O10-TECH-DATA'],explodeVector:v});

/* FEEDER + REGISTER */
{
 const p=sub('O10.FEEDER','PILE','Pile & Non-stop Feeder',['o10-feeder-pile']);
 const b=block(p,'MECH','Pile handling',['o10-feeder-pile']);
 part(b,'TABLE','Pile table / carriage',['o10-feeder-pile'],['Pile support table','Guide-rail carriage']);
 part(b,'NONSTOP','Manual non-stop feeder',['o10-feeder-pile'],['Non-stop support system','Attached preloading device','Laterally adjustable pile stops']);

 const h=sub('O10.FEEDER','HEAD','Preset Plus Feeding Head',['o10-feeder-head']);
 const hb=block(h,'SEPARATION','Sheet separation & forwarding',['o10-feeder-head']);
 part(hb,'SUCTION','Suction system',['o10-feeder-head'],['Separating suckers','Forwarding suckers','Suction brush system']);
 part(hb,'AIR','Separation air',['o10-feeder-air'],['Blast-air manifold','Air nozzles']);

 const a=sub('O10.FEEDER','ALIGN','XL Sheet Alignment',['o10-feedboard','o10-feedboard-align']);
 const ab=block(a,'REGISTER','Front / side register',['o10-feedboard-align']);
 part(ab,'FRONT','Front lays',['o10-feedboard-align'],['Remote front-lay adjustment ±1.0 mm','Front-lay shaft bowing']);
 part(ab,'SIDE','Pneumatic pull lay',['o10-feedboard-align'],['Preset-capable lateral alignment','Self-cleaning function']);
 part(ab,'ARRIVAL','Sheet arrival control',['o10-feedboard-align'],['Sheet-arrival sensors','Automatic arrival-time optimization']);
 part(ab,'DOUBLE','Double-sheet monitoring',['o10-feedboard-align'],['Ultrasonic double-sheet detector','Pull-lay monitor']);
}

/* PRINTING UNITS */
for(const key of OFFSET10_PRINTING_UNIT_KEYS){
 const id='o10-'+key.toLowerCase(),pu=sub('O10.PRINT',key,key.replace('PU','Printing Unit '),[id],['O10-FINAL-DRAWING','O10-PROPOSAL'],[.08,.18,0]);

 const frame=block(pu,'FRAME','Paired Side Frames & Housing',[id+'-frame'],['O10-PROPOSAL','O10-CX104-OFFICIAL']);
 part(frame,'STRUCTURE','Structural side frames / crossmembers',[id+'-frame-structure'],['Paired precision side frames','Compact cylinder-bearing supports']);
 part(frame,'HOUSING','Operator / drive-side ergonomic housing',[id+'-frame-side-housing'],['Removable side cover','Operator-side Intelliline status strip'],['O10-PROPOSAL','O10-CX104-OFFICIAL']);

 const cyl=block(pu,'CYL','Cylinder Train & Sheet Handover',[id+'-cylinders'],['O10-PROPOSAL']);
 part(cyl,'PLATE','Plate cylinder',[id+'-plate'],['Remote circumferential register','Remote lateral register','Remote diagonal register']);
 part(cyl,'BLANKET','Blanket cylinder',[id+'-blanket'],['Blanket clamping bars','Blanket-underlay support rails']);
 part(cyl,'IMPRESSION','Double-diameter impression cylinder',[id+'-impression'],['Presettable impression-pressure adjustment','Corrosion-resistant cylinder surface']);
 part(cyl,'TRANSFER','Triple-diameter AirTransfer system',[id+'-transfer'],['Universal gripper system','Forced gripper closure','Venturi-supported sheet travel']);
 part(cyl,'GRIPPER','Universal gripper / handover',[id+'-gripper'],['Gripper pads','Gripper bar / shaft','Forced-closing mechanism']);

 const ink=block(pu,'INK','High-performance Inking Unit',[id+'-inking'],['O10-PROPOSAL'],[0,.42,.12]);
 part(ink,'FOUNTAIN','Foil-protected ink fountain',[id+'-ink-fountain'],['Removable ink-fountain foil','Maintenance-free ink zones','500-step ink metering']);
 part(ink,'FOUNTAINROLL','Ink fountain roller',[id+'-ink-fountain-roll'],['Wear-resistant fountain-roller surface','Temperature-control interface']);
 part(ink,'DISTRIBUTORS','Four ink distributors',[id+'-ink-distributors'],['Distributor pair A/B','Distributor pair C/D','Phase-shifted oscillation']);
 part(ink,'FORM','Four different-sized inking form rollers',[id+'-ink-form'],['Form roller 1','Form roller 2','Form roller 3','Form roller 4']);
 part(ink,'TRANSFER','Ink transfer roller cluster',[id+'-ink-transfer'],['Intermediate transfer rollers','Ink-film handover path']);
 part(ink,'AUX','Ink agitator / mist extraction',[id+'-ink-aux'],['Ink agitator guide','Ink-mist extraction duct']);

 const damp=block(pu,'DAMP','Alcolor Continuous Dampening',[id+'-dampening'],['O10-PROPOSAL'],[.18,.30,-.16]);
 part(damp,'ROLLERGROUP','Five-roller Alcolor system',[id+'-damp-rolls'],['Dampening form roller','Intermediate roller','Dampening distributor','Metering roller','Water-pan roller']);
 part(damp,'PAN','Dampening solution pan',[id+'-damp-pan'],['Solution pan','Pan-level / flow reference']);
 part(damp,'VARIO','Vario function',[id+'-damp-vario'],['Intermediate-roller distribution function','Hickey-prevention function']);
 part(damp,'BLOWER','Dampening blower bar',[id+'-damp-blower'],['Blower bar','Air-distribution reference']);

 const service=block(pu,'SERVICE','Plate Change & Washup',[id+'-autoplate',id+'-washup'],['O10-PROPOSAL']);
 part(service,'AUTOPLATE','AutoPlate plate changer',[id+'-autoplate'],['Pneumatic plate clamping bars','Automatic positioning run']);
 part(service,'WASH','Program-controlled washup',[id+'-washup'],['Blanket washup cloth module','Impression-cylinder washup','Inking-unit washup']);
 const sheet=block(pu,'SHEET','Sheet Guidance & Monitoring',[id+'-airtransfer',id+'-sheet-monitor'],['O10-PROPOSAL']);
 part(sheet,'VENTURI','AirTransfer Venturi sheet guide',[id+'-airtransfer'],['Venturi guide bar','Printing-nip blowing device']);
 part(sheet,'MONITOR','Sheet travel monitoring',[id+'-sheet-monitor'],['Inter-unit sheet sensor OS','Inter-unit sheet sensor DS']);
}

/* FOILSTAR — source-derived process, not a floating independent machine */
{
 const adhesive=sub('O10.FOIL','ADHESIVE','Adhesive Application · PU1',['o10-pu1'],['O10-PROPOSAL','O10-FOILSTAR-OFFICIAL'],[-.18,.18,0],'Cold-transfer adhesive is applied by offset in the upstream printing unit.');
 const ab=block(adhesive,'OFFSET','Offset adhesive application',['o10-pu1-plate','o10-pu1-blanket']);
 part(ab,'FORM','Adhesive printing form',['o10-pu1-plate'],['Offset plate / adhesive image']);
 part(ab,'TRANSFER','Adhesive transfer to sheet',['o10-pu1-blanket'],['Blanket-to-sheet adhesive transfer']);

 const transfer=sub('O10.FOIL','TRANSFER','Foil Transfer Superstructure · PU2',['o10-foilstar','o10-foilstar-superstructure'],['O10-PROPOSAL','O10-FOILSTAR-OFFICIAL'],[0,.55,-.25]);
 const tb=block(transfer,'MOUNT','PU2-mounted superstructure',['o10-foilstar-superstructure']);
 part(tb,'FRAME','Mounting frame',['o10-foilstar-superstructure'],['PU2 side-frame mounts','Upper crossbeam']);
 part(tb,'NIP','Foil transfer nip',['o10-foilstar-transfer-nip'],['Foil-to-sheet pressure zone','PU2 blanket / impression interface']);

 const reels=sub('O10.FOIL','REELS','Multi-reel Unwind / Rewind',['o10-foilstar-rolls'],['O10-PROPOSAL','O10-FOILSTAR-OFFICIAL'],[0,.48,-.18]);
 const rb=block(reels,'SHAFTS','Two friction-shaft lines',['o10-foilstar-unwinder','o10-foilstar-rewinder']);
 part(rb,'UNWIND','Unwinder friction shaft',['o10-foilstar-unwinder'],['Up to 6 narrow foil reels','Servo gear motor','Automatic web-tension control']);
 part(rb,'REWIND','Rewinder friction shaft',['o10-foilstar-rewinder'],['Carrier-foil rewind','Servo gear motor','Speed-compensated ionizing device']);
 part(rb,'REELS','Multi-web reel positions',['o10-foilstar-unwinder'],['Reel position 1','Reel position 2','Reel position 3','Reel position 4','Reel position 5','Reel position 6']);

 const idx=sub('O10.FOIL','INDEX','Indexing / Dancer System',['o10-foilstar-dancer'],['O10-PROPOSAL','O10-FOILSTAR-OFFICIAL'],[0,.42,.16]);
 const ib=block(idx,'BUFFER','Web-path / tension compensation',['o10-foilstar-dancer']);
 part(ib,'DANCER','Dancer roller group',['o10-foilstar-dancer'],['Double-loop web buffer','Indexing path compensation','Machine-speed synchronization']);

 const web=sub('O10.FOIL','WEB','Foil Web Guidance',['o10-foilstar-web'],['O10-PROPOSAL'],[0,.34,.15]);
 const wb=block(web,'PATH','Web guide to / from PU2',['o10-foilstar-web']);
 part(wb,'GUIDE','Foil guide path',['o10-foilstar-web'],['Incoming foil web','PU2 nip path','Return carrier web']);
 part(wb,'SENSOR','Web monitoring',['o10-foilstar-sensors'],['Motorized ultrasonic minimum-diameter sensors','Splice warning','End-of-film warning','Mechanical web-tear control','Optical side-edge positioning aid']);

 const ctrl=sub('O10.FOIL','CONTROL','FoilStar Control & Handling',['o10-foilstar-control','o10-foilstar-loading'],['O10-PROPOSAL'],[0,.30,-.20]);
 const cb=block(ctrl,'OPERATOR','Operator / loading equipment',['o10-foilstar-control','o10-foilstar-loading']);
 part(cb,'TOUCH','Operator-side touchscreen',['o10-foilstar-control'],['FoilStar touchscreen','Intellistart / Wallscreen integration','Remote-maintenance router']);
 part(cb,'LOAD','Reel loading / unloading device',['o10-foilstar-loading'],['Loading arm','Reel handling shaft']);
}

/* COATING */
for(const key of OFFSET10_COATING_UNIT_KEYS){
 const id='o10-'+key.toLowerCase(),label=key==='CUF'?'Final Coating Unit':key.replace('CU','Coating Unit '),cu=sub('O10.COAT',key,label,[id],['O10-FINAL-DRAWING','O10-PROPOSAL'],[.20,.18,-.16]);
 const apply=block(cu,'APPLY','Coating Application',[id+'-chamber',id+'-anilox',id+'-form'],['O10-PROPOSAL','O10-CX104-OFFICIAL']);
 part(apply,'CHAMBER','Pressurized chamber doctor blade',[id+'-chamber'],['Doctor-blade chamber','Quick-change blade system']);
 part(apply,'ANILOX','Exchangeable Saphira PLP anilox roller',[id+'-anilox'],['Ceramic-coated anilox surface','Quick-change screen-roller support']);
 part(apply,'DRIP','Coating drip tray',[id+'-drip-tray'],['Drip tray','Level sensor']);
 part(apply,'FORM','Coating plate / blanket cylinder',[id+'-form'],['Central coating-plate clamping','Coating blanket / plate']);
 const sheet=block(cu,'SHEET','Sheet Transfer',[id+'-impression',id+'-transfer']);
 part(sheet,'IMP','Coating impression cylinder',[id+'-impression'],['Sheet support through coating nip']);
 part(sheet,'TRANSFER','AirTransfer handover',[id+'-transfer'],['Transfer cylinder','Contact-free sheet guidance']);
 const supply=block(cu,'SUPPLY','Coating Supply',[id+'-supply'],['O10-PROPOSAL','O10-TECH-DATA']);
 part(supply,'COATINGSTAR','CoatingStar interface',[id+'-supply'],['Supply line','Return line','Coating circuit interface']);
}

/* UV / DRYING */
for(const key of OFFSET10_Y_UNIT_KEYS){
 const id='o10-'+key.toLowerCase(),y=sub('O10.UV',key,key.replace('Y','Interdeck UV Y'),[id],['O10-FINAL-DRAWING','O10-UV-LAYOUT','O10-PROPOSAL'],[.18,.40,0]);
 const cass=block(y,'CASSETTES','Three Slide-in UV Cassettes',[id+'-uv'],['O10-UV-LAYOUT','O10-PROPOSAL']);
 for(let i=1;i<=3;i++)part(cass,'C'+i,'UV Cassette '+i,[id+'-uv-cassette-'+i],['Slide-in cassette','UV lamp / reflector','Water-cooling interface'],['O10-UV-LAYOUT']);
 const guide=block(y,'GUIDE','Sheet Guide / Radiation Protection',[id+'-sheet-guide'],['O10-PROPOSAL']);
 part(guide,'PATH','Adjustable sheet guide',[id+'-sheet-guide'],['Guide straps','Radiation shielding','Cable / hose protection']);
}
{
 const e=sub('O10.UV','EOP','End-of-Press UV · 3 Cassettes',['o10-eop-uv'],['O10-PROPOSAL','O10-UV-LAYOUT'],[.45,.42,0]);
 const eb=block(e,'CASSETTES','Three EOP UV cassettes',['o10-eop-uv']);
 for(let i=1;i<=3;i++)part(eb,'C'+i,'EOP UV Cassette '+i,['o10-eop-uv-cassette-'+i],['Slide-out cassette','UV lamp / reflector']);
 const ds=sub('O10.UV','DRYSTAR','DryStar Air / Combination',['o10-drystar-combination','o10-drystar-coldair'],['O10-TECH-DATA','O10-CX104-OFFICIAL']);
 const db=block(ds,'AIR','Drying air modules',['o10-drystar-combination','o10-drystar-coldair']);
 part(db,'COMBI','DryStar Combination CAN 2E',['o10-drystar-combination'],['Infrared module','Hot-air module','Recirculated-air module']);
 part(db,'COLD','DryStar ColdAir 18°C',['o10-drystar-coldair'],['Cold-air module','Water-cooling interface']);
}

/* DELIVERY */
{
 const ext=sub('O10.DELIVERY','X3','X3 Delivery Extension',['o10-delivery-x3'],['O10-FINAL-DRAWING','O10-PROPOSAL'],[.42,.20,0]);
 const eb=block(ext,'MODULES','Three extension modules',['o10-delivery-x3']);
 for(let i=1;i<=3;i++)part(eb,'X'+i,'Extension Module X'+i,['o10-delivery-x'+i],['Side hood','Sheet-guide deck']);

 const sheet=sub('O10.DELIVERY','SHEET','Sheet Deceleration & Guidance',['o10-delivery-chain','o10-delivery-sheet-brake','o10-delivery-air'],['O10-PROPOSAL','O10-CX104-OFFICIAL']);
 const sb=block(sheet,'BRAKE','Delivery transport',['o10-delivery-chain','o10-delivery-sheet-brake']);
 part(sb,'CHAIN','Delivery gripper chain / rails',['o10-delivery-chain'],['Gripper-chain rail OS','Gripper-chain rail DS']);
 part(sb,'BRAKE','Presettable dynamic sheet brake',['o10-delivery-sheet-brake'],['Brake modules','Controlled deceleration']);
 part(sb,'AIR','Venturi / delivery air guidance',['o10-delivery-air'],['Air guide bar','Sheet stabilization']);

 const pile=sub('O10.DELIVERY','PILE','Automatic Non-stop Pile',['o10-delivery-pile','o10-delivery-paper-stack'],['O10-PROPOSAL']);
 const pb=block(pile,'STACK','Pile formation',['o10-delivery-pile','o10-delivery-paper-stack']);
 part(pb,'TABLE','Delivery pile table',['o10-delivery-pile'],['Pile lift','Pile stops / joggers']);
 part(pb,'PAPER','Receiving sheet stack',['o10-delivery-paper-stack'],['High-precision pile formation','Automatic non-stop pile change']);

 const control=sub('O10.DELIVERY','CONTROL','Delivery Control / Static Management',['o10-delivery-control'],['O10-PROPOSAL']);
 const cb=block(control,'LOCAL','Delivery local functions',['o10-delivery-control']);
 part(cb,'PANEL','Local delivery controls',['o10-delivery-control'],['Paper-run settings','Sheet-brake settings','Pile-stop / non-stop functions']);
 part(cb,'STATIC','StaticStar Advanced',[],['Feeder / delivery ionizers','Powder ionization bar']);
}

/* ACCESS */
{
 const a=sub('O10.ACCESS','GALLERY','564 mm Elevated Gallery',['o10-platform'],['O10-PROPOSAL','O10-FINAL-DRAWING']);
 const b=block(a,'WALK','Operator / drive-side access',['o10-platform-os','o10-platform-ds']);
 part(b,'OS','Operator-side gallery',['o10-platform-os'],['Walk-on deck','Handrail']);
 part(b,'DS','Drive-side gallery / front stairs',['o10-platform-ds'],['Drive-side walkway','Front-offset 564 mm stairs']);
}

/* PERIPHERALS */
const aux=[
 ['PCC','Prinect Press Center XL 3','o10-prinect-center','O10-PROPOSAL',['Wallscreen / Intellistart 3','Axis Control interface']],
 ['CAB','Central Control Cabinet','o10-central-cabinet','O10-TECH-DATA',['184 kW main cabinet','Main electrical distribution']],
 ['AIRSTAR','AirStar Pro A1-R3-W','o10-airstar','O10-TECH-DATA',['Press pneumatic supply','Cooling-water interface']],
 ['COMBISTAR','beta.c 340 G / CombiStar','o10-combistar','O10-TECH-DATA',['Dampening / temperature-control circuit','Osmosis-water interface']],
 ['FILTER','FilterStar Compact','o10-filterstar','O10-TECH-DATA',['Filtration module']],
 ['SCROLL','ScrollStar Plus','o10-scrollstar','O10-TECH-DATA',['Oil-free compressed-air module']],
 ['LVG','LVG-600 Varnish Supply','o10-lvg600','O10-TECH-DATA',['Varnish supply module','Varnish drums']],
 ['COATSTAR','CoatingStar Compact','o10-coatingstar','O10-TECH-DATA',['Coating circuit 1','Coating circuit 2']],
 ['UVXLC','UV XLC Control','o10-uv-xlc','O10-FINAL-DRAWING',['UV system control','Capacity up to 12 lamps']],
 ['UVEX','UV Exhaust / Magic Cube','o10-uv-exhaust','O10-TECH-DATA',['UV exhaust 1','UV exhaust 2']],
 ['COOL','Technotrans Cooling System','o10-cooling','O10-SYSTEM',['Cooling-water supply','Return manifold','Free-cooler interface']]
];
for(const [key,name,ref,source,specifics] of aux){
 const s=sub('O10.AUX',key,name,[ref],[source],[0,.26,-.30]);
 const b=block(s,'SYSTEM',name,[ref],[source]);
 part(b,'DEVICE',name,[ref],specifics,[source]);
}

export const OFFSET10_TAXONOMY=Object.freeze(nodes);
export const OFFSET10_TAXONOMY_BY_ID=new Map(OFFSET10_TAXONOMY.map(node=>[node.id,node]));
export const offset10TaxonomyChildren=id=>OFFSET10_TAXONOMY.filter(node=>node.parentId===id);
export const offset10TaxonomyStats=()=>({
  total:OFFSET10_TAXONOMY.length,
  mapped:OFFSET10_TAXONOMY.filter(node=>node.meshRefs?.length).length,
  byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,OFFSET10_TAXONOMY.filter(node=>node.level===level).length]))
});
