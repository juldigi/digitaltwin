import {CONFIDENCE} from './confidence.js';

const nodes=[];
const add=(id,parentId,level,levelName,name,{meshRefs=[],sourceRefs=['APM2-BMJ-DATABASE'],confidence=CONFIDENCE.HIGH,explodeVector=[0,0,0],description='',maintenanceTag=null}={})=>{
  const node={id,parentId,level,levelName,name,machineZone:name,meshRefs,sourceRefs,confidence,verified:confidence===CONFIDENCE.VERIFIED,explodeVector,explodeDistance:level===2?1.15:level===3?.72:level===4?.46:level===5?.28:.18,focusCamera:null,description,maintenanceTag};
  nodes.push(Object.freeze(node));return id;
};
const sub=(parent,key,name,refs=[],sources=['APM2-SP102-1994'],vec=[0,.18,0],confidence=CONFIDENCE.HIGH,description='')=>{
  const id=parent+'.'+key;add(id,parent,3,'Sub',name,{meshRefs:refs,sourceRefs:sources,explodeVector:vec,confidence,description});return id;
};
const block=(parent,key,name,refs=[],sources=['APM2-SP102-1994'],vec=[0,.12,0],confidence=CONFIDENCE.HIGH)=>{
  const id=parent+'.'+key;add(id,parent,4,'Block',name,{meshRefs:refs,sourceRefs:sources,explodeVector:vec,confidence});return id;
};
const part=(parent,key,name,refs=[],specifics=[],sources=['APM2-SP102-1994'],confidence=CONFIDENCE.HIGH,description='')=>{
  const id=parent+'.'+key;add(id,parent,5,'Part',name,{meshRefs:refs,sourceRefs:sources,confidence,explodeVector:[.07,.08,.10],description});
  specifics.forEach((spec,i)=>{
    const s=typeof spec==='string'?{name:spec}:spec;
    add(id+'.S'+(i+1),id,6,'Spesifik Part',s.name,{meshRefs:s.refs||[],sourceRefs:s.sources||sources,confidence:s.confidence||confidence,explodeVector:[.03,.04,.06],description:s.description||'',maintenanceTag:s.maintenanceTag||null});
  });
  return id;
};

add('APM2',null,1,'Mesin','APM 2 · BOBST SP 102 family · Automatic Flatbed Die Cutter',{
  meshRefs:['MACHINE-APM2'],
  sourceRefs:['APM2-BMJ-DATABASE','APM2-BMJ-Q2','APM2-SP102-1994','APM2-SP102-TECH','APM2-SP102-E-VISUAL','APM2-SP102-PARTS','APM2-SP102-DIM'],
  confidence:CONFIDENCE.HIGH,
  description:'BMJ database confirms SP 102, S/N 57115506, APM-2, year 1994. Variant suffix is not present in the source workbook, so E/SE/CER/BMA is intentionally not asserted.'
});

const l2=[
 ['FEEDER','Pile Feeder & Sheet Separation',['apm2-feeder'],[-1.0,.15,0]],
 ['REGISTER','Feed Table / Register & Side Lay',['apm2-register'],[-.65,.18,-.25]],
 ['TRANSPORT','14-bar intermittent gripper-chain transport',['apm2-transport'],[-.1,.28,.35]],
 ['PLATEN','Flatbed Die-Cutting Platen',['apm2-platen'],[0,.45,0]],
 ['STRIP','Stripping Station',['apm2-stripping'],[.55,.32,0]],
 ['DELIVERY','Delivery & Pile Formation',['apm2-delivery'],[1.0,.15,0]],
 ['DRIVE','Main Drive / Clutch / Transmission',['apm2-drive'],[0,.25,.65]],
 ['CONTROL','Controls / Electrical',['apm2-control'],[0,.45,-.55]],
 ['SAFETY','Safety Guards / Interlocks',['apm2-safety'],[0,.25,-.75]]
];
for(const [k,n,r,v] of l2)add('APM2.'+k,'APM2',2,'Unit Utama',n,{meshRefs:r,sourceRefs:['APM2-SP102-1994','APM2-SP102-PARTS'],explodeVector:v});

/* FEEDER */
{
 const pile=sub('APM2.FEEDER','PILE','Pile Table / Lift',['apm2-feeder-pile']);
 const pb=block(pile,'LIFT','Pile lifting system',['apm2-feeder-pile']);
 part(pb,'TABLE','Pile table',['apm2-feeder-pile-table'],['Pile support deck','Lateral pile correction handle','Pile guide rails']);
 part(pb,'CHAINS','Pile lift / suspension',['apm2-feeder-lift'],['Lift chain OS','Lift chain DS','Pile height reference']);
 const ns=sub('APM2.FEEDER','NONSTOP','Manual Non-stop Feeder',['apm2-feeder-nonstop'],['APM2-SP102-1994'],[-.18,.15,0],CONFIDENCE.REFERENCE_ONLY,'Common on 1994 SP102 references; exact installed arrangement on BMJ APM-2 has not been photo-verified.');
 const nb=block(ns,'SWORDS','Non-stop support',['apm2-feeder-nonstop'],['APM2-SP102-1994'],[0,.10,0],CONFIDENCE.REFERENCE_ONLY);
 part(nb,'RACK','Support swords / rack',['apm2-feeder-nonstop'],['Non-stop support sword 1','Non-stop support sword 2','Apron / temporary pile support'],['APM2-SP102-1994'],CONFIDENCE.REFERENCE_ONLY);
 const head=sub('APM2.FEEDER','HEAD','Suction Head / Sheet Separation',['apm2-feeder-head'],['APM2-SP102-1994','APM2-SP102-PARTS']);
 const hb=block(head,'SUCTION','Suction & forwarding',['apm2-feeder-head']);
 part(hb,'LIFT','Lifting suckers',['apm2-feeder-lift-suckers'],['Lifting suction cup OS','Lifting suction cup DS','Sucker height linkage']);
 part(hb,'FORWARD','Forwarding suckers',['apm2-feeder-forward-suckers'],['Carrier suction cup OS','Carrier suction cup DS','Forwarding linkage']);
 part(hb,'AIR','Side / separating air',['apm2-feeder-air'],['Side blower OS','Side blower OOS','Air manifold','Sheet separation nozzles']);
 const belts=sub('APM2.FEEDER','BELT','Infeed Belts / Slow-down',['apm2-feeder-belts']);
 const bb=block(belts,'TRANSPORT','Infeed transport',['apm2-feeder-belts']);
 part(bb,'BELTS','Feed belts',['apm2-feeder-belts'],['Feed belt 1','Feed belt 2','Feed belt 3','Feed belt 4']);
 part(bb,'ROLLER','Infeed rollers',['apm2-feeder-infeed-rollers'],['Vulcanised infeed roller','Knurled roller','Belt slow-down drive']);
}

/* REGISTER / SIDELAY */
{
 const table=sub('APM2.REGISTER','TABLE','Stainless Feed Table',['apm2-register-table']);
 const tb=block(table,'GUIDE','Sheet guide table',['apm2-register-table']);
 part(tb,'PLATE','Antistatic feed plate',['apm2-register-table'],['Stainless feed plate','Sheet hold-down guide','Side guide rails']);
 const front=sub('APM2.REGISTER','FRONT','Front Lay Register',['apm2-register-frontlays']);
 const fb=block(front,'LAYS','Four front lays',['apm2-register-frontlays']);
 for(let i=1;i<=4;i++)part(fb,'LAY'+i,'Front Lay '+i,['apm2-front-lay-'+i],['Lay tip','Adjustment clamp','Sheet-present reference']);
 const side=sub('APM2.REGISTER','SIDE','Side Lay / Pull Lay',['apm2-register-sidelay'],['APM2-BMJ-Q2','APM2-SP102-1994','APM2-SP102-PARTS'],[0,.18,-.24]);
 const sb=block(side,'DRIVE','Side lay positioning drive',['apm2-register-sidelay','apm2-sidelay-drive'],['APM2-BMJ-Q2','APM2-SP102-PARTS']);
 part(sb,'GUIDE','Operator-side side lay guide',['apm2-register-sidelay'],['Side lay blade / guide','Pull roller / pressure element','Centerline adjustment reference'],['APM2-SP102-1994','APM2-SP102-PARTS']);
 part(sb,'MOTOR','Side lay drive / motor',['apm2-sidelay-drive'],[
   {name:'SideLay drive motor · maintenance focus',maintenanceTag:'BMJ_Q2_2026_SIDELAY_MOTOR'},
   'Drive coupling','Cam / lever linkage'
 ],['APM2-BMJ-Q2','APM2-SP102-PARTS']);
 const monitor=sub('APM2.REGISTER','MONITOR','Sheet Arrival / Double-sheet Control',['apm2-register-sensors']);
 const mb=block(monitor,'SENSORS','Register sensors',['apm2-register-sensors']);
 part(mb,'DOUBLE','Double-sheet detector',['apm2-register-double-sheet'],['Double-sheet sensor','Sensor bracket']);
 part(mb,'ARRIVAL','Sheet arrival / presence',['apm2-register-arrival'],['Front-lay sheet presence sensor','Timing reference']);
}

/* GRIPPER TRANSPORT */
{
 const chain=sub('APM2.TRANSPORT','CHAIN','Twin Gripper Chains',['apm2-gripper-chain'],['APM2-SP102-PARTS','APM2-SP102-CHAIN14','APM2-BOBST-GRIPPER-PATENT']);
 const cb=block(chain,'LOOP','Chain loop / guides',['apm2-gripper-chain']);
 part(cb,'OS','Operator-side chain',['apm2-gripper-chain-os'],['Chain links','Chain guide','Tension reference']);
 part(cb,'DS','Drive-side chain',['apm2-gripper-chain-ds'],['Chain links','Chain guide','Tension reference']);
 const bars=sub('APM2.TRANSPORT','BARS','14 Gripper Bars · family chain-set reference',['apm2-gripper-bars'],['APM2-SP102-CHAIN14','APM2-SP102-PARTS']);
 const bb=block(bars,'SET','14-bar intermittent transport set',['apm2-gripper-bars'],['APM2-SP102-CHAIN14','APM2-BOBST-GRIPPER-PATENT']);
 for(let i=1;i<=14;i++)part(bb,'BAR'+i,'Gripper Bar '+i,['apm2-gripper-bar-'+i],['Bar shell','Gripper holders','Movable grippers','Stationary grippers','Return springs'],['APM2-SP102-CHAIN14','APM2-BOBST-GRIPPER-PATENT']);
 const sprocket=sub('APM2.TRANSPORT','SPROCKET','Drive / Return Sprockets',['apm2-chain-sprockets'],['APM2-SP102-PARTS']);
 const spb=block(sprocket,'PAIR','Chain sprocket system',['apm2-chain-sprockets']);
 part(spb,'DRIVE','Drive sprocket',['apm2-chain-drive-sprocket'],['Sprocket wheel','Hub','Shaft support bearing']);
 part(spb,'RETURN','Return sprocket',['apm2-chain-return-sprocket'],['Sprocket wheel','Return shaft','Chain guide']);
}

/* PLATEN */
{
 const body=sub('APM2.PLATEN','BODY','Die-Cutting Press Frame',['apm2-platen-frame']);
 const bb=block(body,'FRAME','Heavy platen frame',['apm2-platen-frame']);
 part(bb,'COLUMNS','Side columns / upper beam',['apm2-platen-frame'],['Operator-side column','Drive-side column','Upper reaction beam','Lower base frame']);
 const tooling=sub('APM2.PLATEN','TOOLING','Die-Cutting Tooling',['apm2-platen-tooling'],['APM2-SP102-1994','APM2-SP102-PARTS']);
 const tb=block(tooling,'CHASE','Chase / plate stack',['apm2-platen-tooling']);
 part(tb,'CHASE','Die-cutting chase',['apm2-cutting-chase'],['Chase centering','Chase locking']);
 part(tb,'CUTPLATE','Cutting plate',['apm2-cutting-plate'],['1040 × 720 family cutting plate','Thin cutting sheet reference','Makeready protection plate']);
 part(tb,'COMP','Compensation / micrometric system',['apm2-micrometric'],['Compensating plate','Micrometric adjustment screws','Centerline reference']);
 const motion=sub('APM2.PLATEN','MOTION','Platen Press Assembly / Impression Motion',['apm2-moving-platen'],['APM2-SP102-1994'],[0,.18,0],CONFIDENCE.HIGH,'Chase, cutting plate and bed are modeled as one rigid assembly that closes together during the press stroke; which specific plate is fixed vs. moving on this BMJ unit is not photo/manual-verified, so no upper/lower kinematic split is asserted.');
 const mb=block(motion,'PRESS','Platen pressure mechanism',['apm2-moving-platen','apm2-platen-toggle']);
 part(mb,'PLATEN','Platen bed (rigid with chase/cutting-plate stack)',['apm2-moving-platen'],['Platen bed','Pressure face','Platen guide blocks']);
 part(mb,'TOGGLE','Toggle / eccentric drive',['apm2-platen-toggle'],['Toggle links','Eccentric shaft','Pressure rollers','Main connecting rods']);
 part(mb,'FORCE','Impression / pressure reference',[],['Family reference up to 250 t'],['APM2-SP102-1994'],CONFIDENCE.REFERENCE_ONLY);
}

/* STRIPPING */
{
 const station=sub('APM2.STRIP','STATION','Waste Stripping Station',['apm2-stripping'],['APM2-SP102-1994','APM2-SP102-PARTS'],[.25,.28,0],CONFIDENCE.REFERENCE_ONLY,'SP102 family references include stripping; installed BMJ tool configuration is not photo-verified.');
 const fb=block(station,'FRAMES','Upper / Lower Stripping Frames',['apm2-stripping-upper','apm2-stripping-lower'],['APM2-SP102-1994'],[0,.20,0],CONFIDENCE.REFERENCE_ONLY);
 part(fb,'UPPER','Upper stripping frame',['apm2-stripping-upper'],['Pullout frame','Crossbars','Quick-lock stripping pins'],['APM2-SP102-1994','APM2-SP102-PARTS'],CONFIDENCE.REFERENCE_ONLY);
 part(fb,'LOWER','Lower stripping frame',['apm2-stripping-lower'],['Lower support frame','Stripping counterpart tools'],['APM2-SP102-1994','APM2-SP102-PARTS'],CONFIDENCE.REFERENCE_ONLY);
 part(fb,'CENTRAL','Central stripping board',['apm2-stripping-board'],['Central board','Waste apertures'],['APM2-SP102-PARTS'],CONFIDENCE.REFERENCE_ONLY);
 const waste=sub('APM2.STRIP','WASTE','Waste Collection',['apm2-waste-chute'],['APM2-SP102-PARTS'],[.18,.12,.15],CONFIDENCE.REFERENCE_ONLY);
 const wb=block(waste,'CHUTE','Waste path',['apm2-waste-chute'],['APM2-SP102-PARTS'],[0,.10,0],CONFIDENCE.REFERENCE_ONLY);
 part(wb,'CHUTE','Waste chute / curtain',['apm2-waste-chute'],['Stripping curtain','Waste drop opening'],['APM2-SP102-PARTS'],CONFIDENCE.REFERENCE_ONLY);
}

/* DELIVERY */
{
 const hand=sub('APM2.DELIVERY','HANDOVER','Gripper Release / Sheet Handover',['apm2-delivery-handover']);
 const hb=block(hand,'OPEN','Gripper reopening',['apm2-delivery-handover']);
 part(hb,'CAM','Gripper reopening mechanism',['apm2-delivery-gripper-open'],['Opening cam','Follower / lever','Release timing reference']);
 const pile=sub('APM2.DELIVERY','PILE','Delivery Pile / Jogging',['apm2-delivery-pile']);
 const pb=block(pile,'STACK','Pile formation',['apm2-delivery-pile','apm2-delivery-paper-stack']);
 part(pb,'TABLE','Delivery pile table',['apm2-delivery-pile-table'],['Pile platform','Pile lift','Lateral pile guides']);
 part(pb,'STACK','Converted sheet stack',['apm2-delivery-paper-stack'],['Receiving stack','Sheet settling reference']);
 part(pb,'JOGGER','Pile joggers',['apm2-delivery-joggers'],['Rear jogger','Side jogger OS','Side jogger OOS']);
 const ns=sub('APM2.DELIVERY','NONSTOP','Non-stop Delivery Reference',['apm2-delivery-nonstop'],['APM2-SP102-1994'],[.22,.15,0],CONFIDENCE.REFERENCE_ONLY);
 const nb=block(ns,'RACK','Temporary pile support',['apm2-delivery-nonstop'],['APM2-SP102-1994'],[0,.10,0],CONFIDENCE.REFERENCE_ONLY);
 part(nb,'GRID','Non-stop delivery rack / grill',['apm2-delivery-nonstop'],['Support bars','Insertion linkage'],['APM2-SP102-1994'],CONFIDENCE.REFERENCE_ONLY);
}

/* DRIVE */
{
 const main=sub('APM2.DRIVE','MAIN','Main Motor / Flywheel',['apm2-main-drive'],['APM2-SP102-1994','APM2-SP102-PARTS']);
 const mb=block(main,'POWER','Main drive train',['apm2-main-drive']);
 part(mb,'MOTOR','Main drive motor',['apm2-main-motor'],['Motor body','Cooling fan','Motor mount']);
 part(mb,'FLYWHEEL','Flywheel / clutch-brake',['apm2-flywheel','apm2-clutch-brake'],['Flywheel','Clutch disc','Brake disc','Drive hub']);
 const trans=sub('APM2.DRIVE','TRANSMISSION','Mechanical Transmission',['apm2-drive-transmission']);
 const tb=block(trans,'GEAR','Gear / shaft train',['apm2-drive-transmission']);
 part(tb,'SHAFT','Main shaft',['apm2-main-shaft'],['Main shaft','Support bearings']);
 part(tb,'GEAR','Gear / sprocket train',['apm2-drive-gears'],['Drive gear','Intermediate gear','Chain sprocket']);
 const lube=sub('APM2.DRIVE','LUBE','Lubrication System',['apm2-lubrication'],['APM2-SP102-PARTS']);
 const lb=block(lube,'CIRCUIT','Lubrication circuit',['apm2-lubrication']);
 part(lb,'PUMP','Lubrication pump',['apm2-lube-pump'],['Pump','Reservoir','Distribution manifold']);
 part(lb,'BRUSH','Chain / gear lubrication',['apm2-lube-brush'],['Rotary lubrication brush','Oil line']);
}

/* CONTROL */
{
 const elec=sub('APM2.CONTROL','ELECTRICAL','Electrical / Machine Control',['apm2-control-cabinet']);
 const eb=block(elec,'CABINET','Control cabinet',['apm2-control-cabinet']);
 part(eb,'CAB','Electrical cabinet',['apm2-control-cabinet'],['Main disconnect','Drive controls','Relay / contactor section','Cooling / ventilation reference']);
 const op=sub('APM2.CONTROL','OPERATOR','Operator Controls',['apm2-operator-panel']);
 const ob=block(op,'PANEL','Operator panel',['apm2-operator-panel']);
 part(ob,'BUTTONS','Machine controls',['apm2-operator-panel'],['Start','Stop','Emergency stop','Feeder controls','Pile controls']);
 part(ob,'DISPLAY','Bobst electronic display reference',['apm2-operator-display'],['Machine status display','Sheet counter / speed reference'],['APM2-SP102-1994'],CONFIDENCE.REFERENCE_ONLY);
}

/* SAFETY */
{
 const guards=sub('APM2.SAFETY','GUARDS','Machine Guards / Access Covers',['apm2-safety']);
 const gb=block(guards,'COVERS','Exterior protection',['apm2-safety']);
 part(gb,'OS','Operator-side covers',['apm2-cover-os'],['Feeder guard','Platen guard','Stripping guard','Delivery guard']);
 part(gb,'DS','Drive-side covers',['apm2-cover-ds'],['Drive guard','Chain guard','Motor guard']);
 const inter=sub('APM2.SAFETY','INTERLOCK','Safety Interlocks',['apm2-safety-interlocks']);
 const ib=block(inter,'SWITCH','Guard / access monitoring',['apm2-safety-interlocks']);
 part(ib,'GUARD','Guard interlocks',['apm2-safety-interlocks'],['Door switch','Cover switch','Emergency-stop circuit reference']);
}

export const APM2_TAXONOMY=Object.freeze(nodes);
export const APM2_TAXONOMY_BY_ID=new Map(APM2_TAXONOMY.map(n=>[n.id,n]));
export const apm2TaxonomyChildren=id=>APM2_TAXONOMY.filter(n=>n.parentId===id);
export const apm2TaxonomyStats=()=>({
  total:APM2_TAXONOMY.length,
  mapped:APM2_TAXONOMY.filter(n=>n.meshRefs?.length).length,
  byLevel:Object.fromEntries([1,2,3,4,5,6].map(level=>[level,APM2_TAXONOMY.filter(n=>n.level===level).length]))
});