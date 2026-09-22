const GENERIC_IDS=new Set(['BMJ-MCH-0036','BMJ-MCH-0037','BMJ-MCH-0038','BMJ-MCH-0039','BMJ-MCH-0041']);
const SRC_GENERIC=Object.freeze(['BMJ-MACHINE-DATABASE','V123-EUROVENT-AHU','V123-EUROVENT-AHU-QUALITY']);
const SRC_SANSIN=Object.freeze(['BMJ-MACHINE-DATABASE','V123-NES-SANSIN-ID','V123-NES-YZKJ','V123-NES-YZKJ-DUST','V123-EUROVENT-AHU-QUALITY']);
const rowsFor=(machineId)=>{
 const generic=GENERIC_IDS.has(machineId),sansin=machineId==='BMJ-MCH-0040';if(!generic&&!sansin)return [];
 const root=sansin?'AHU40':'AHU'+Number(machineId.slice(-2)),rows=[],src=sansin?SRC_SANSIN:SRC_GENERIC;
 const add=(id,parentId,level,levelName,name,meshRefs,description,confidence=sansin?'SANSIN_NES_YZKJ_FAMILY_REFERENCE':'SECTIONAL_AHU_FUNCTIONAL_REFERENCE')=>rows.push(Object.freeze({
  id,parentId,level,levelName,name,machineZone:name,meshRefs:Object.freeze(meshRefs||[]),sourceRefs:src,
  confidence,verified:false,explodeVector:[level===2?.60:.12,level<4?.18:.08,0],
  explodeDistance:level===2?.78:level===3?.46:level===4?.29:level===5?.18:.11,focusCamera:null,description,maintenanceTag:null
 }));
 const unit=(code,name,mesh,desc)=>{const id=root+'.'+code;add(id,root,2,'Unit Utama',name,[mesh],desc);return id;};
 const chain=(u,code,n3,n4,n5,n6,mesh,desc,conf)=>{const a=u+'.'+code,b=a+'.BLOCK',c=b+'.PART',d=c+'.SPEC';add(a,u,3,'Sub',n3,[mesh],desc,conf);add(b,a,4,'Block',n4,[mesh],desc,conf);add(c,b,5,'Part',n5,[mesh],desc,conf);add(d,c,6,'Spesifik Part',n6,[mesh],desc,conf);};
 add(root,null,1,'Mesin',sansin?'AHU 7 (SANSIN)':'AHU '+({36:'3',37:'4',38:'5',39:'6',41:'8'}[String(Number(machineId.slice(-2)))]||''),['MACHINE-UNIVERSAL'],
  sansin?'Brand SANSIN is recorded by BMJ. Exact NES/YZKJ model and capacity are unverified.':'BMJ registry provides AHU identity only; OEM/model/section order and airflow direction are unverified.',
  sansin?'BMJ_BRAND_IDENTITY_ONLY':'BMJ_FUNCTION_IDENTITY_ONLY');

 if(generic){
  let u=unit('INLET','Intake / Damper','universal-module-1','Functional inlet/damper reference; exact outdoor/return/mixing arrangement is unknown.');
  chain(u,'DAMPER','Inlet Damper Bank','Damper Block','Damper Service Group','Opposed-Blade Damper / Linkage','ahu-inlet-damper','Common AHU airflow-control function.');
  chain(u,'MIX','Outdoor / Return Mixing Boundary','Mixing Configuration Block','Mixing Configuration Group','Mixing / Return-Air Interface Boundary','ahu-mixing-boundary','Mixing/return-air arrangement is project-specific and not verified on BMJ assets.','CONFIGURATION_BOUNDARY');
  u=unit('FILTER','Filter Bank','universal-module-2','Air filtration before thermal sections.');
  chain(u,'BANK','Filter Bank','Filter Rack Block','Filter Service Group','Panel / Bag Filter Family Reference','ahu-filter-bank','Filter type/class and stage count are unverified.');
  chain(u,'DP','Filter Differential Pressure','Filter Monitoring Block','Filter Monitoring Group','Differential-Pressure Tap / Sensor Reference','ahu-filter-dp','Pressure-drop monitoring is a functional maintenance reference; installed sensor type is unknown.');
  u=unit('COIL','Cooling / Heat-Exchange Coil','universal-module-3','Finned heat-exchange coil; chilled-water versus DX configuration is unverified.');
  chain(u,'FACE','Finned Cooling Coil','Coil Face Block','Cooling Coil Service Group','Coil Fins / Tubes','ahu-cooling-coil','Eurovent functional reference; exact rows, fin spacing, fluid and capacity unverified.');
  chain(u,'HDR','Coil Headers / Connections','Coil Connection Block','Coil Header Group','Supply / Return Header Reference','ahu-coil-headers','Water versus refrigerant circuit and connection size unverified.');
  u=unit('DRAIN','Moisture / Drain Section','universal-module-4','Condensate drainage reference for dehumidifying cooling operation.');
  chain(u,'PAN','Condensate Drain Pan','Drain Pan Block','Condensate Service Group','Sloped Drain Pan','ahu-drain-pan','Eurovent quality guidance requires corrosion-resistant draining pan for cooling coils producing condensate.');
  chain(u,'TRAP','Drain Trap','Drain Trap Block','Drain Service Group','Trapped Drain / Outlet Reference','ahu-drain-trap','Drain outlet/trap represented functionally; exact site piping unverified.');
  chain(u,'DROP','Droplet Eliminator Capability','Droplet Control Block','Droplet Control Group','Droplet Eliminator Boundary','ahu-droplet-option','May be required depending on coil velocity; BMJ installation unverified.','OPTION_BOUNDARY');
  u=unit('FAN','Supply Fan','universal-module-5','Supply-air fan assembly; fan type and drive unverified.');
  chain(u,'WHEEL','Supply Fan Wheel','Fan Wheel Block','Fan Service Group','Fan Impeller / Wheel','ahu-supply-fan','Fan type is functional reference only.');
  chain(u,'DRIVE','Fan Motor / Drive','Fan Drive Block','Fan Drive Group','Motor / Coupling / Belt Boundary','ahu-fan-drive','Direct-drive versus belt-drive and motor rating unverified.','CONFIGURATION_BOUNDARY');
  u=unit('SERVICE','Access / Service Section','universal-module-6','Maintenance access and inspection section.');
  chain(u,'DOOR','Service Door','Access Door Block','Service Access Group','Door / Handle / Seal Reference','ahu-service-door','Service access representation, not engineering door dimension.');
  u=unit('OUT','Discharge / Control','universal-module-7','Supply discharge and controller/sensor boundary.');
  chain(u,'PLENUM','Discharge Plenum','Supply Plenum Block','Discharge Service Group','Supply Plenum / Duct Interface','ahu-discharge-plenum','Duct connection dimensions and airflow direction are unverified.');
  chain(u,'CTRL','AHU Control / Sensors','Control Block','Control & Sensor Group','Controller / Temperature / Pressure Reference','ahu-controller','Control system and sensor package are unverified.');
  u=unit('DUCT','Supply / Return Air Distribution','ahu-air-distribution','Functional duct network extends the AHU discharge to branch/diffuser references and returns air to the inlet boundary. Plant routing is not as-built because AHU coordinates and duct drawings are not verified.');
  chain(u,'SUPPLY','Supply Duct Network','Supply Duct Block','Supply Distribution Group','Flexible Connector / Trunk / Branch / Diffuser Reference','ahu-supply-duct','Unit-level functional routing reference only; installed dimensions, route, balancing devices and diffuser count are unverified.','AIR_DISTRIBUTION_FUNCTIONAL_REFERENCE');
  chain(u,'RETURN','Return-Air Duct Network','Return Duct Block','Return Distribution Group','Return Grille / Trunk / Mixing Interface Reference','ahu-return-duct','Return/mixing arrangement is configuration-specific and remains an explicit boundary.','CONFIGURATION_BOUNDARY');
  chain(u,'OA','Outdoor-Air Intake Termination','Outdoor Intake Block','Weather Intake Group','Weather Hood / Louvre / Screen Reference','ahu-outdoor-intake','Outdoor-air termination is a functional reference; no outdoor condensing unit is inferred for generic AHU 3/4/5/6/8.','EUROVENT_OUTDOOR_AIR_REFERENCE');
 }else{
  let u=unit('INLET','Indoor Return / Inlet Section','universal-module-1','Return/outdoor air inlet of NES/YZKJ family; exact site duct routing unknown.');
  chain(u,'DAMPER','Return / Outdoor Air Damper','Inlet Damper Block','Air Inlet Service Group','Damper / Return-Air Interface','sansin-inlet-damper','Brand-family airflow inlet reference.');
  u=unit('FILTER','Filter / Mixing Section','universal-module-2','NES/YZKJ family describes multi-stage dust filtration.');
  chain(u,'NET','Double Filter Net','Filter Net Block','Filter Service Group','Dual Filter-Net Reference','sansin-filter-net','Product literature describes double-layer filter net as part of three-layer dust filtration.');
  chain(u,'MIX','Air Mixing / Distribution','Mixing Block','Air Distribution Group','Return-Air Distribution Reference','sansin-mixing','Functional airflow distribution reference; exact damper/mixing topology unverified.');
  u=unit('EVAP','Evaporative / Heat-Exchange Section','universal-module-3','Two-stage pre-cool/cooling concept using wet curtain then fin evaporator.');
  chain(u,'PAD','Honeycomb Wet Curtain','Evaporative Pad Block','Wet Curtain Service Group','Honeycomb Wet-Curtain Media','sansin-wet-curtain','Product family describes return-air pre-cooling through honeycomb wet curtain.');
  chain(u,'COIL','Low-Temperature Fin Evaporator','Evaporator Coil Block','Evaporator Service Group','Fin Evaporator / DX Coil Reference','sansin-evaporator','Second cooling stage is a low-temperature fin evaporator; exact coil rows/capacity unverified.');
  u=unit('FAN','Supply Fan / Plenum','universal-module-4','Indoor supply fan and conditioned-air discharge.');
  chain(u,'WHEEL','Supply Fan','Supply Fan Block','Fan Service Group','Supply Fan Wheel','sansin-supply-fan','Family functional reference; exact fan geometry/rating depends on model.');
  chain(u,'PLENUM','Supply Plenum','Supply Plenum Block','Discharge Group','Conditioned-Air Plenum','sansin-supply-plenum','Supply-air interface reference.');
  u=unit('OUTDOOR','Outdoor Cooling / Compressor Module','universal-module-5','Outdoor refrigeration and evaporative-condenser module.');
  chain(u,'COMP','Refrigeration Compressor','Compressor Block','Compressor Service Group','Compressor Package Reference','sansin-compressor','YZKJ family uses refrigeration compressor; exact compressor count/model unverified.');
  chain(u,'COND','Evaporative Condenser','Condenser Block','Condenser Service Group','Condenser Coil / Wet Heat-Rejection Reference','sansin-condenser','Family architecture uses evaporative condenser for heat rejection.');
  chain(u,'FAN','Outdoor Condenser Fan','Outdoor Fan Block','Condenser Fan Group','Condenser Fan Reference','sansin-outdoor-fan','Outdoor fan count differs by model and is unverified.');
  u=unit('CIRCUIT','Refrigerant / Water Circuit','universal-module-6','Refrigerant plus evaporative-water recirculation services.');
  chain(u,'REF','Refrigerant Circuit','Refrigerant Circuit Block','Refrigerant Service Group','Refrigerant Line / Service Interface','sansin-refrigerant','Family uses R410A in published YZKJ-45N/90N data; exact BMJ model/refrigerant charge unverified.');
  chain(u,'WATER','Water Recirculation','Water Circuit Block','Water Service Group','Water Tank / Pump / Filter Reference','sansin-water-circuit','Wet-curtain/condenser water is recirculated; exact tank/pump arrangement unverified.');
  u=unit('CTRL','Control / Electrical','universal-module-7','Controller and electrical package.');
  chain(u,'HMI','Operator Controller','Control HMI Block','Control Service Group','Controller / Display Reference','sansin-controller','Exact controller generation and BMS interface unverified.');
  chain(u,'ELEC','Electrical Cabinet','Electrical Cabinet Block','Electrical Service Group','Electrical / Protection Package','sansin-electrical','Functional electrical enclosure reference.');
  u=unit('DUCT','Indoor Air Distribution / Outdoor Interface','sansin-air-distribution','Family-reference duct network connects the indoor supply/return path while the outdoor heat-rejection module remains physically distinct. Exact BMJ duct routing and indoor/outdoor spacing are unverified.');
  chain(u,'SUPPLY','Conditioned-Air Supply Duct','Supply Duct Block','Indoor Distribution Group','Flexible Connector / Trunk / Branch / Diffuser Reference','sansin-supply-duct','Family-reference supply-air distribution only; installed trunk size, branch count and diffuser count are unverified.','AIR_DISTRIBUTION_FUNCTIONAL_REFERENCE');
  chain(u,'RETURN','Return / Outdoor-Air Duct','Return Duct Block','Return-Air Distribution Group','Return Trunk / Drop / Inlet Interface Reference','sansin-return-duct','Return/outdoor-air topology remains installation-specific.','CONFIGURATION_BOUNDARY');
  chain(u,'OUTAIR','Outdoor Heat-Rejection Air Interface','Outdoor Airflow Block','Condenser Airflow Group','Fan Guard / Vertical Heat-Rejection Airflow Reference','sansin-outdoor-interface','The YZKJ family supports a distinct outdoor heat-rejection module; installed fan count and spacing remain unverified.','SANSIN_NES_YZKJ_FAMILY_REFERENCE');
 }
 return rows;
};
export const ahuTaxonomyFor=machineId=>Object.freeze(rowsFor(machineId));
export const ahuTaxonomyById=machineId=>new Map(ahuTaxonomyFor(machineId).map(n=>[n.id,n]));
