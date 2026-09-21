const ASSET=Object.freeze({
 'BMJ-MCH-0029':{no:29,brand:'ATLAS',label:'COMPRESSOR ATLAS COPCO NO.2'},
 'BMJ-MCH-0030':{no:30,brand:'ATLAS',label:'COMPRESSOR ATLAS COPCO NO.3'},
 'BMJ-MCH-0031':{no:31,brand:'KAESER',label:'COMPRESSOR KAESER NO.4'},
 'BMJ-MCH-0032':{no:32,brand:'KAESER',label:'COMPRESSOR KAESER NO.6'},
 'BMJ-MCH-0033':{no:33,brand:'SWAN',label:'COMPRESSOR SWAN NO.7'},
 'BMJ-MCH-0034':{no:34,brand:'KAESER',label:'COMPRESSOR KAESER NO.8'},
 'BMJ-MCH-0035':{no:35,brand:'ATLAS',label:'COMPRESSOR ATLAS COPCO NO.9'}
});
const SRC=Object.freeze({
 ATLAS:Object.freeze(['BMJ-MACHINE-DATABASE','V123-ATLAS-MANUALS','V123-ATLAS-GA26','V123-ATLAS-GA11-30']),
 KAESER:Object.freeze(['BMJ-MACHINE-DATABASE','V123-KAESER-DIRECT','V123-KAESER-BELT','V123-KAESER-FLOW']),
 SWAN:Object.freeze(['BMJ-MACHINE-DATABASE','V123-SWAN-TSAD','V123-SWAN-TMV','V123-SWAN-CATALOG'])
});
const UNITS=Object.freeze([
 'Air Intake / Filter','Electric Drive Motor','Rotary Screw Airend','Oil / Fluid Separator Vessel','Oil / Air Circuit','Aftercooler / Fan','Controller / Electrical Cabinet'
]);
const COMPONENTS=Object.freeze({
 ATLAS:Object.freeze([
  [1,'INTAKE_FILTER','Intake Filter','atlas-intake-filter-group','Dry-air intake filtration before the load/unload valve.'],
  [1,'INLET_VALVE','Load / Unload Inlet Valve','atlas-inlet-valve-group','GA/G family inlet/load-unload valve reference.'],
  [2,'DRIVE','Motor / Drive Interface','atlas-drive-group','Motor and drive interface; exact drive/VSD variant remains unverified.'],
  [3,'AIREND','Oil-Injected Screw Airend','atlas-airend-group','Oil-injected rotary screw compression element family reference.'],
  [4,'SEPARATOR','Oil / Air Separator Vessel & Element','atlas-separator-group','Separator vessel and replaceable separator-element architecture.'],
  [4,'MPV','Minimum Pressure Valve','atlas-mpv-group','Minimum-pressure path downstream of separation.'],
  [5,'OIL_FILTER','Oil Filter','atlas-oil-filter-group','Oil filtration in the injected-oil circuit.'],
  [5,'THERMOSTAT','Thermostatic Bypass','atlas-thermostat-group','Oil temperature/bypass control reference.'],
  [5,'OIL_RETURN','Oil Return / Piping','atlas-oil-return-group','Oil-return and oil/air piping family reference.'],
  [6,'AFTERCOOLER','Compressed-Air Aftercooler','atlas-aftercooler-group','Compressed-air cooling downstream of compression.'],
  [6,'OIL_COOLER','Oil Cooler','atlas-oil-cooler-group','Injected-oil cooler family reference.'],
  [6,'CONDENSATE','Moisture Separator / Drain','atlas-condensate-group','Moisture separation and electronic drain family reference.'],
  [6,'FAN','Cooling Fan','atlas-fan-group','Package cooling fan reference.'],
  [7,'CONTROL','Elektronikon Controller Family','atlas-controller-group','Elektronikon-family HMI/control reference; generation unverified.']
 ]),
 KAESER:Object.freeze([
  [1,'INTAKE_FILTER','Dry Intake Filter','kaeser-intake-filter-group','Dry intake filtration ahead of inlet/vent valve.'],
  [1,'INLET_VALVE','Inlet / Vent Valve','kaeser-inlet-valve-group','KAESER inlet/vent valve family reference.'],
  [2,'DRIVE','Motor / Drive Interface','kaeser-drive-group','Drive interface with belt versus 1:1 direct drive intentionally unresolved.'],
  [3,'AIREND','SIGMA PROFILE Airend','kaeser-airend-group','KAESER SIGMA PROFILE screw airend family reference.'],
  [4,'SEPARATOR','Cooling-Fluid Separator Tank / Cartridge','kaeser-separator-group','Fluid separator tank and cartridge; exact separator generation/stage count unverified.'],
  [4,'MPV','Minimum-Pressure Check Valve','kaeser-mpv-group','Minimum-pressure check-valve family reference.'],
  [5,'FLUID_FILTER','ECO Fluid Filter','kaeser-fluid-filter-group','Cooling-fluid filtration family reference.'],
  [5,'THERMOSTAT','Thermostatic Fluid Valve','kaeser-thermostat-group','Thermostatic fluid-circuit control reference.'],
  [5,'FLUID_LINES','Fluid / Air Circuit','kaeser-fluid-lines-group','Internal fluid and compressed-air routing reference.'],
  [6,'AFTERCOOLER','Compressed-Air Aftercooler','kaeser-aftercooler-group','Compressed-air aftercooler family reference.'],
  [6,'FLUID_COOLER','Cooling-Fluid Cooler','kaeser-fluid-cooler-group','Cooling-fluid cooler family reference.'],
  [6,'SEPARATOR_DRAIN','Centrifugal Separator / ECO-DRAIN','kaeser-condensate-group','Condensate separation and electronic drain family reference.'],
  [6,'FAN','Cooling Fan','kaeser-fan-group','Package cooling fan family reference.'],
  [7,'CONTROL','SIGMA CONTROL Family','kaeser-controller-group','SIGMA CONTROL family HMI; installed generation unverified.']
 ]),
 SWAN:Object.freeze([
  [1,'INTAKE_FILTER','Air Filter Assembly','swan-intake-filter-group','SWAN family air-filter assembly.'],
  [1,'INLET','Inlet Interface','swan-inlet-group','Inlet interface reference; exact valve package not asserted.'],
  [2,'DRIVE','Drive Interface','swan-drive-group','TS-AD coupling versus TMV PM-direct drive remains unresolved.'],
  [3,'AIREND','Screw Airend','swan-airend-group','SWAN screw airend family reference.'],
  [4,'SEPARATION','Oil / Air Separation Package Boundary','swan-separation-group','Package-level separation reference only; internal separator topology is not claimed.'],
  [5,'OIL_CIRCUIT','Oil / Air Service Circuit','swan-circuit-group','Conservative service-circuit representation; detailed internal routing unverified.'],
  [6,'COOLER','Built-In Oil / Air Cooler','swan-cooler-group','SWAN built-in oil/air cooler family reference.'],
  [6,'FAN','Cooling Fan','swan-fan-group','SWAN cooling-fan family reference.'],
  [7,'CONTROL','Smart Control Panel','swan-controller-group','SWAN smart control-panel family reference.'],
  [7,'VFD_OPTION','TMV VFD Controller Option','swan-vfd-option-group','TMV variable-frequency capability only; installed series/options are unverified.']
 ])
});
export function compressorTaxonomyFor(machineId){
 const asset=ASSET[machineId];if(!asset)return [];
 const root='C'+asset.no,nodes=[],src=SRC[asset.brand],confidence=asset.brand+'_BRAND_FAMILY_REFERENCE';
 const add=(id,parentId,level,levelName,name,meshRefs,description,conf=confidence)=>nodes.push(Object.freeze({
  id,parentId,level,levelName,name,machineZone:name,meshRefs:Object.freeze(meshRefs||[]),sourceRefs:src,
  confidence:conf,verified:false,explodeVector:[level===2?.64:.12,level<4?.18:.08,0],
  explodeDistance:level===2?.84:level===3?.50:level===4?.32:level===5?.20:.12,
  focusCamera:null,description,maintenanceTag:null
 }));
 add(root,null,1,'Mesin',asset.label,['MACHINE-UNIVERSAL'],'Brand identity comes from the BMJ registry. Exact compressor model remains unverified; geometry and taxonomy are brand-family references.');
 for(let i=0;i<7;i++)add(root+'.M'+(i+1),root,2,'Unit Utama',UNITS[i],['universal-module-'+(i+1)],'Brand-family functional section; exact installed layout remains model-specific.');
 for(const [unit,code,name,mesh,desc] of COMPONENTS[asset.brand]){
  const parent=root+'.M'+unit,a=parent+'.'+code,b=a+'.BLOCK',d=b+'.PART',e=d+'.SPEC';
  add(a,parent,3,'Sub',name,[mesh],desc);
  add(b,a,4,'Block',name+' Functional Block',[mesh],desc);
  add(d,b,5,'Part',name+' Service Group',[mesh],desc);
  add(e,d,6,'Spesifik Part',name,[mesh],desc,code.includes('OPTION')?'OPTION_BOUNDARY':confidence);
 }
 return nodes;
}
export function compressorTaxonomyById(machineId){return new Map(compressorTaxonomyFor(machineId).map(n=>[n.id,n]));}
