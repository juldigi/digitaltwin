import {Offset5CD102RealismTemplate,Offset5CD102RealismSimulation} from './offset5-realism.js';
import {Offset10CX104SpecialRealismTemplate,Offset10CX104SpecialRealismSimulation} from './offset10-realism.js';
import {APM2MachineTemplate} from './apm2.js';
import {APM2ProcessSimulation} from './simulation-apm2.js';
import {SheetingMachineTemplate} from './sheeting.js';
import {SheetingProcessSimulation} from './simulation-sheeting.js';
import {UniversalMachineTemplate,UniversalProcessSimulation,universalMachineConfig} from './universal-machine.js';
import {Polar115MachineTemplate} from './polar115.js';
import {Polar115ProcessSimulation} from './simulation-polar115.js';
import {Offset8CX104RealismTemplate,Offset8CX104RealismSimulation} from './offset8-realism.js';
import {Offset9MachineTemplate} from './offset9.js';
import {Offset9PrintingSimulation} from './simulation-offset9.js';
import {MK920MachineTemplate} from './mk920.js';
import {MK920StampingSimulation} from './simulation-mk920.js';
import {MK1060MachineTemplate} from './mk1060.js';
import {MK1060ProcessSimulation} from './simulation-mk1060.js';
import {Promatrix106MachineTemplate} from './promatrix106.js';
import {Promatrix106ProcessSimulation} from './simulation-promatrix106.js';
import {Media100MachineTemplate} from './media100.js';
import {Media100ProcessSimulation} from './simulation-media100.js';
import {DianaEye55MachineTemplate} from './diana-eye55.js';
import {DianaEye55ProcessSimulation} from './simulation-diana-eye55.js';
import {SharkN650MachineTemplate} from './shark-n650.js';
import {SharkN650ProcessSimulation} from './simulation-shark-n650.js';
import {FZ1200MachineTemplate} from './fz1200.js';
import {FZ1200ProcessSimulation} from './simulation-fz1200.js';
import {UpgLy300MachineTemplate} from './upg-ly300.js';
import {UpgLy300ProcessSimulation} from './simulation-upg-ly300.js';
import {ReferenceMachineTemplate,ReferenceProcessSimulation,isReferenceMachineKey} from './reference-machines.js';
import {applyMachinePresentationPolish} from './machine-presentation-polish.js';
import {DEDICATED_MACHINE_IDS,isDedicatedMachineMaturity} from './data/machine-maturity.js';
import {OFFSET5_INKING_ROLLERS,OFFSET5_INK_DISTRIBUTORS,OFFSET5_DAMPENING_ROLLERS} from './data/sources-offset5.js';

export const LEGACY_MACHINE_ROUTE=Object.freeze({
 'BMJ-MCH-0002':'sheeting',
 'BMJ-MCH-0003':'offset5',
 'BMJ-MCH-0009':'offset10',
 'BMJ-MCH-0010':'apm2'
});
export const normalizeMachineKey=key=>{const raw=String(key??'').trim();return raw?(LEGACY_MACHINE_ROUTE[raw]||raw):null;};

export const DEDICATED_MACHINE_KEYS=Object.freeze([
 'offset5','sheeting','offset10','apm2',
 ...DEDICATED_MACHINE_IDS.filter(id=>!Object.hasOwn(LEGACY_MACHINE_ROUTE,id))
]);
export const isDedicatedMachineKey=key=>isDedicatedMachineMaturity(key);

export const OFFSET5_PILOT_RUNTIME_CONTRACT=Object.freeze({
 version:'offset5-photo-pdf-v319',
 taxonomyVersion:'offset5-taxonomy-v18',
 realityRevision:'offset5-print-unit-reality-v319',
 realismPack:'OFFSET5_CD102_8L_CUSTOM_INSTALLED_REALITY_R6_ACTUAL_PU_DIAGRAM',
 dimensionLock:'BMJ_CUSTOM_INSTALLED_DIMENSIONS_DO_NOT_NORMALIZE_TO_GENERIC_CD102',
 printingUnitCount:8,
 openTopPolicy:'V404_V408_OPEN_UPPER_DECK__ROUNDED_OPERATOR_CABINET__SAME_PHOTO_GROUNDED_SHELL_ALL_EIGHT_PU'
});

export function validateOffset5PilotTemplate(template,{throwOnError=false}={}){
 const root=template?.root,errors=[];
 const fail=(code,detail)=>errors.push({code,detail});
 if(!root)fail('ROOT_MISSING','Offset 5 root scene is unavailable.');
 else{
  const u=root.userData||{},contract=OFFSET5_PILOT_RUNTIME_CONTRACT;
  if(u.assetId!=='MACHINE-OFFSET5')fail('ASSET_ID',u.assetId);
  if(u.version!==contract.version)fail('VERSION',u.version);
  if(u.taxonomyVersion!==contract.taxonomyVersion)fail('TAXONOMY',u.taxonomyVersion);
  if(u.printingUnitReality?.revision!==contract.realityRevision)fail('ROLLER_REALITY',u.printingUnitReality?.revision);
  if(u.realismPack!==contract.realismPack)fail('REALISM_PACK',u.realismPack);
  if(u.dimensionLock!==contract.dimensionLock)fail('DIMENSION_LOCK',u.dimensionLock);
  if(u.printingUnitExteriorPolicy!==contract.openTopPolicy)fail('EXTERIOR_POLICY',u.printingUnitExteriorPolicy);
  if(u.openUpperDeck!==true||u.solidPrintingUnitTopCover!==false)fail('OPEN_TOP_ROOT',{openUpperDeck:u.openUpperDeck,solidPrintingUnitTopCover:u.solidPrintingUnitTopCover});
  for(let i=0;i<contract.printingUnitCount;i++){
   const prefix=`press-${i}`,frame=template.findNode?.(`${prefix}-frame`),top=template.findNode?.(`${prefix}-top-deck`),ink=template.findNode?.(`${prefix}-ink`),openBay=template.findNode?.(`${prefix}-open-ink-bay`),duct=template.findNode?.(`${prefix}-ink-fountain-roller-body`),brand=template.findNode?.(`${prefix}-operator-brand`);
   if(!frame||!top||!ink||!openBay||!duct||!brand){fail('PU_STRUCTURE',i+1);continue;}
   if(frame.userData?.openUpperFrame!==true||frame.userData?.fullDepthTopBeam!==false)fail('PU_FRAME_TOP',i+1);
   if(top.userData?.openUpperDeck!==true||top.userData?.solidTopCover!==false)fail('PU_TOP',i+1);
   if(ink.userData?.openInkBed!==true||ink.userData?.solidInkEnclosure!==false)fail('PU_INK_BAY',i+1);
   if(openBay.userData?.normalStateVisible!==true)fail('PU_OPEN_BAY_VISIBLE',i+1);
   if(brand.userData?.brandText!=='HEIDELBERG Speedmaster')fail('PU_BRAND',i+1);
   let green=false;duct.traverse?.(o=>{if(o.isMesh&&o.userData?.offset5InkDuctRollPhotoLocked)green=true;});
   if(!green)fail('PU_GREEN_DUCT_ROLL',i+1);
   const verifyRoller=(nodeId,spec,kind)=>{
    const node=template.findNode?.(nodeId),mesh=node?.children?.find?.(o=>o.isMesh);
    if(!node||!mesh){fail('PU_'+kind+'_ROLLER_MISSING',`${i+1}:${spec.code}`);return;}
    if(mesh.userData?.nominalDiameterMM!==spec.diameterMM)fail('PU_'+kind+'_DIAMETER',`${i+1}:${spec.code}:${mesh.userData?.nominalDiameterMM}`);
    if(mesh.userData?.rollerSurface!==spec.surface)fail('PU_'+kind+'_SURFACE',`${i+1}:${spec.code}:${mesh.userData?.rollerSurface}`);
    if(mesh.userData?.actualDiagramSource!=='IMG_2777.jpeg')fail('PU_'+kind+'_SOURCE',`${i+1}:${spec.code}`);
   };
   for(const spec of OFFSET5_INKING_ROLLERS)verifyRoller(`${prefix}-ink-roller-${spec.code}-body`,spec,'INK');
   for(const spec of OFFSET5_INK_DISTRIBUTORS)verifyRoller(`${prefix}-ink-distributor-${spec.code}-body`,spec,'DISTRIBUTOR');
   for(const spec of OFFSET5_DAMPENING_ROLLERS)verifyRoller(`${prefix}-damp-roller-${spec.code}-body`,spec,'DAMP');
  }
 }
 const result=Object.freeze({valid:errors.length===0,errors:Object.freeze(errors),contract:OFFSET5_PILOT_RUNTIME_CONTRACT});
 if(root)root.userData.offset5RuntimeTruthLock=result.valid?'PASS':'FAIL',root.userData.offset5RuntimeTruthErrors=errors.map(e=>e.code+':'+e.detail).join('|');
 if(throwOnError&&!result.valid)throw new Error('Offset 5 pilot runtime truth-lock failed: '+root?.userData?.offset5RuntimeTruthErrors);
 return result;
}


export const AUTOPLATEN_RUNTIME_CONTRACTS=Object.freeze({
 'BMJ-MCH-0010':Object.freeze({
  route:'apm2',taxonomyVersion:'apm2-taxonomy-v2',serial:'57115506',geometryBoundary:'SUFFIX_UNCONFIRMED',
  coreNodes:Object.freeze(['apm2-feeder','apm2-register','apm2-transport','apm2-platen','apm2-stripping','apm2-delivery','apm2-drive']),
  barNode:'apm2-gripper-bars',representedGripperBars:14,barEvidence:'SP102_FAMILY_14_BAR_CHAIN_REFERENCE',
  simulationTruth:Object.freeze(['platenRequiresStoppedTransport','strippingRequiresStoppedTransport'])
 }),
 'BMJ-MCH-0011':Object.freeze({
  route:'BMJ-MCH-0011',taxonomyVersion:'mk920-v3',serial:'20110509330',geometryBoundary:'INSTALLED_OPTIONS_BOUNDED',
  coreNodes:Object.freeze(['mk920-feeder','mk920-register','mk920-foil','mk920-platen','mk920-transport','mk920-delivery','mk920-drive','mk920-access']),
  barNode:'mk920-transport-bar',representedGripperBars:6,barEvidence:'REPRESENTATION_ONLY__INSTALLED_COUNT_UNVERIFIED',
  foilAxes:3,simulationTruth:Object.freeze(['pressureRequiresStoppedTransport','foilAdvanceRequiresOpenPlaten','foilAdvanceForbiddenDuringDwell'])
 }),
 'BMJ-MCH-0012':Object.freeze({
  route:'BMJ-MCH-0012',taxonomyVersion:'mk920-v3',serial:'20130529398A',geometryBoundary:'INSTALLED_OPTIONS_BOUNDED',
  coreNodes:Object.freeze(['mk920-feeder','mk920-register','mk920-foil','mk920-platen','mk920-transport','mk920-delivery','mk920-drive','mk920-access']),
  barNode:'mk920-transport-bar',representedGripperBars:6,barEvidence:'REPRESENTATION_ONLY__INSTALLED_COUNT_UNVERIFIED',
  foilAxes:3,simulationTruth:Object.freeze(['pressureRequiresStoppedTransport','foilAdvanceRequiresOpenPlaten','foilAdvanceForbiddenDuringDwell'])
 }),
 'BMJ-MCH-0013':Object.freeze({
  route:'BMJ-MCH-0013',taxonomyVersion:'mk1060-v2',serial:'20130830062',geometryBoundary:'NOT_INSTALLATION_CAD',
  coreNodes:Object.freeze(['mk1060-feeder','mk1060-register','mk1060-transport','mk1060-platen','mk1060-stripping','mk1060-blanking','mk1060-waste','mk1060-drive','mk1060-access']),
  barNode:'mk1060-transport-bar',representedGripperBars:9,barEvidence:'MODEL_PROCESS_REPRESENTATION',
  simulationTruth:Object.freeze(['platenDwellRequiresStoppedTransport','strippingRequiresStoppedTransport','blankingRequiresStoppedTransport'])
 }),
 'BMJ-MCH-0014':Object.freeze({
  route:'BMJ-MCH-0014',taxonomyVersion:'promatrix106-v2',serial:'MP.DBE0-00100',geometryBoundary:'INSTALLED_OPTIONS_BOUNDED',
  coreNodes:Object.freeze(['pm106-feeder','pm106-feedtable','pm106-transport','pm106-cutting','pm106-stripping','pm106-blanking','pm106-delivery','pm106-drive','pm106-access']),
  barNode:'pm106-transport-bar',representedGripperBars:7,barEvidence:'OEM_SEVEN_GRIPPER_BARS',
  simulationTruth:Object.freeze(['cutRequiresRegisteredStop','strippingRequiresRegisteredStop','blankingRequiresRegisteredStop'])
 }),
 'BMJ-MCH-0015':Object.freeze({
  route:'BMJ-MCH-0015',taxonomyVersion:'promatrix106-v2',serial:'MP.DBE0-00115',geometryBoundary:'INSTALLED_OPTIONS_BOUNDED',
  coreNodes:Object.freeze(['pm106-feeder','pm106-feedtable','pm106-transport','pm106-cutting','pm106-stripping','pm106-blanking','pm106-delivery','pm106-drive','pm106-access']),
  barNode:'pm106-transport-bar',representedGripperBars:7,barEvidence:'OEM_SEVEN_GRIPPER_BARS',
  simulationTruth:Object.freeze(['cutRequiresRegisteredStop','strippingRequiresRegisteredStop','blankingRequiresRegisteredStop'])
 })
});

const autoplatenActualAssetId=(normalized,template)=>normalized==='apm2'?(template?.root?.userData?.bmjAssetId||'BMJ-MCH-0010'):normalized;
const autoplatenContractFor=(normalized,template)=>AUTOPLATEN_RUNTIME_CONTRACTS[autoplatenActualAssetId(normalized,template)]||null;

export function validateAutoplatenTemplate(template,key,{throwOnError=false}={}){
 const normalized=normalizeMachineKey(key),assetId=autoplatenActualAssetId(normalized,template),contract=AUTOPLATEN_RUNTIME_CONTRACTS[assetId],root=template?.root,errors=[];
 const fail=(code,detail)=>errors.push({code,detail});
 if(!contract)return Object.freeze({valid:true,errors:Object.freeze([]),contract:null,assetId:null});
 if(!root)fail('ROOT_MISSING',assetId);
 else{
  const u=root.userData||{},runtimeAsset=u.bmjAssetId||u.assetId;
  if(runtimeAsset!==assetId)fail('ASSET_ID',runtimeAsset);
  if(u.taxonomyVersion!==contract.taxonomyVersion)fail('TAXONOMY_VERSION',u.taxonomyVersion);
  if(u.engineeringDimensions!==false)fail('ENGINEERING_DIMENSION_BOUNDARY',u.engineeringDimensions);
  if(!String(u.geometryStatus||'').includes(contract.geometryBoundary))fail('GEOMETRY_BOUNDARY',u.geometryStatus);
  for(const id of contract.coreNodes)if(!template.findNode?.(id))fail('CORE_NODE_MISSING',id);
  const taxonomy=template.taxonomy||[],levels=new Set(taxonomy.map(n=>n.level));
  for(let level=1;level<=6;level++)if(!levels.has(level))fail('TAXONOMY_LEVEL_MISSING',level);
  const plates=[];root.traverse?.(o=>{if(o.userData?.identityPlacard)plates.push(o.userData.identityPlacard);});
  if(plates.length!==1)fail('IDENTITY_PLACARD_COUNT',plates.length);
  else if(plates[0].serial!==contract.serial)fail('IDENTITY_SERIAL',plates[0].serial);
  const barNode=template.findNode?.(contract.barNode),bars=[];
  barNode?.traverse?.(o=>{if(o.userData?.gripperBar)bars.push(o);});
  if(bars.length!==contract.representedGripperBars)fail('GRIPPER_BAR_REPRESENTATION',bars.length);
  if(assetId==='BMJ-MCH-0010'&&!bars.every(b=>b.userData.familyCountReference===14))fail('SP102_BAR_EVIDENCE','familyCountReference');
  if(assetId==='BMJ-MCH-0011'||assetId==='BMJ-MCH-0012'){
   if(template.findNode?.('mk920-foil-unwind')?.userData?.installedReelCountVerified!==false)fail('MK920_REEL_COUNT_BOUNDARY','must remain unverified');
   if(barNode?.userData?.installedBarCountVerified!==false)fail('MK920_BAR_COUNT_BOUNDARY','must remain unverified');
   const axes=[];root.traverse?.(o=>{if(o.userData?.foilPullAxis)axes.push(o);});
   if(axes.length!==contract.foilAxes)fail('MK920_FOIL_AXIS_REFERENCE',axes.length);
  }
  if(assetId==='BMJ-MCH-0013'){
   const spec=u.spec||{};
   for(const k of ['installedEnvelopeHeightVerified','installedElectricalVariantVerified','installedPlatformGeometryVerified'])if(spec[k]!==false)fail('MK1060_OPTION_BOUNDARY',k);
  }
  if(assetId==='BMJ-MCH-0014'||assetId==='BMJ-MCH-0015'){
   if((u.spec||{}).oemGripperBarCount!==7)fail('PROMATRIX_OEM_BAR_COUNT',(u.spec||{}).oemGripperBarCount);
   if((u.spec||{}).registeredGripperStopVerified!==true)fail('PROMATRIX_REGISTER_TRUTH',(u.spec||{}).registeredGripperStopVerified);
  }
 }
 const result=Object.freeze({valid:errors.length===0,errors:Object.freeze(errors),contract,assetId});
 if(root){root.userData.autoplatenRuntimeTruthLock=result.valid?'PASS':'FAIL';root.userData.autoplatenRuntimeTruthErrors=errors.map(e=>e.code+':'+e.detail).join('|');root.userData.autoplatenContractEvidence=contract.barEvidence;}
 if(throwOnError&&!result.valid)throw new Error('Autoplaten runtime truth-lock failed for '+assetId+': '+root?.userData?.autoplatenRuntimeTruthErrors);
 return result;
}

export function validateAutoplatenSimulation(simulation,template,key,{throwOnError=false}={}){
 const normalized=normalizeMachineKey(key),assetId=autoplatenActualAssetId(normalized,template),contract=AUTOPLATEN_RUNTIME_CONTRACTS[assetId],errors=[];
 const fail=(code,detail)=>errors.push({code,detail});
 if(!contract)return Object.freeze({valid:true,errors:Object.freeze([]),contract:null,assetId:null});
 const state=simulation?.state?.();
 if(!state||state.available!==true||state.blocked===true)fail('SIMULATION_AVAILABILITY',state?.available);
 for(const name of contract.simulationTruth||[])if(state?.interlocks?.[name]!==true)fail('INTERLOCK_CONTRACT',name);
 if(assetId==='BMJ-MCH-0010'&&state?.strippingConfigurationVerified!==false)fail('SP102_STRIPPING_BOUNDARY',state?.strippingConfigurationVerified);
 if((assetId==='BMJ-MCH-0011'||assetId==='BMJ-MCH-0012')&&state?.foilAxisCount!==3)fail('MK920_FOIL_AXIS_STATE',state?.foilAxisCount);
 if((assetId==='BMJ-MCH-0014'||assetId==='BMJ-MCH-0015')&&state?.tieSheetDemoOnly!==true)fail('PROMATRIX_TIE_SHEET_BOUNDARY',state?.tieSheetDemoOnly);
 const result=Object.freeze({valid:errors.length===0,errors:Object.freeze(errors),contract,assetId});
 if(template?.root){template.root.userData.autoplatenSimulationTruthLock=result.valid?'PASS':'FAIL';template.root.userData.autoplatenSimulationTruthErrors=errors.map(e=>e.code+':'+e.detail).join('|');}
 if(throwOnError&&!result.valid)throw new Error('Autoplaten simulation truth-lock failed for '+assetId+': '+template?.root?.userData?.autoplatenSimulationTruthErrors);
 return result;
}

export function createMachineTemplate(key){
 const k=normalizeMachineKey(key);
 if(!k)throw new Error('Identitas mesin belum tersedia.');
 if(k==='offset5'){const template=new Offset5CD102RealismTemplate();validateOffset5PilotTemplate(template,{throwOnError:true});return template;}
 if(k==='sheeting')return new SheetingMachineTemplate();
 if(k==='offset10')return new Offset10CX104SpecialRealismTemplate();
 if(k==='apm2'){const template=new APM2MachineTemplate();validateAutoplatenTemplate(template,k,{throwOnError:true});return template;}
 if(k==='BMJ-MCH-0001')return new Polar115MachineTemplate();
 if(k==='BMJ-MCH-0005')return new Offset8CX104RealismTemplate();
 if(k==='BMJ-MCH-0006')return new Offset9MachineTemplate();
 if(['BMJ-MCH-0007','BMJ-MCH-0008','BMJ-MCH-0022'].includes(k))return new FZ1200MachineTemplate(k);
 if(['BMJ-MCH-0011','BMJ-MCH-0012'].includes(k)){const template=new MK920MachineTemplate(k);validateAutoplatenTemplate(template,k,{throwOnError:true});return template;}
 if(k==='BMJ-MCH-0013'){const template=new MK1060MachineTemplate();validateAutoplatenTemplate(template,k,{throwOnError:true});return template;}
 if(['BMJ-MCH-0014','BMJ-MCH-0015'].includes(k)){const template=new Promatrix106MachineTemplate(k);validateAutoplatenTemplate(template,k,{throwOnError:true});return template;}
 if(['BMJ-MCH-0016','BMJ-MCH-0018'].includes(k))return new Media100MachineTemplate(k);
 if(k==='BMJ-MCH-0019')return new DianaEye55MachineTemplate();
 if(k==='BMJ-MCH-0020')return new SharkN650MachineTemplate();
 if(k==='BMJ-MCH-0024')return new UpgLy300MachineTemplate();
 if(isReferenceMachineKey(k))return new ReferenceMachineTemplate(k);
 if(universalMachineConfig(k))return new UniversalMachineTemplate(k);
 throw new Error(`Model 3D untuk ${k} belum tersedia.`);
}

function enforceTaxonomyClickContract(template){
 const mapped=new Set((template.taxonomy||[]).flatMap(node=>node.meshRefs||[]).filter(Boolean));
 const original=typeof template.resolvePart==='function'?template.resolvePart.bind(template):null;
 if(!original||!mapped.size)return template;
 template.resolvePart=object=>{
  const resolved=original(object);
  for(let node=resolved;node&&node!==template.root;node=node.parent){
   const id=node.userData?.nodeId;
   if(id&&mapped.has(id))return node;
  }
  return null;
 };
 template.root.userData.clickSelectionPolicy='TAXONOMY_EXACT_OR_ANCESTOR_ONLY';
 return template;
}
export function createPolishedMachineTemplate(key){
 const normalized=normalizeMachineKey(key),template=enforceTaxonomyClickContract(applyMachinePresentationPolish(createMachineTemplate(key),normalized));
 if(normalized==='offset5')validateOffset5PilotTemplate(template,{throwOnError:true});
 if(autoplatenContractFor(normalized,template))validateAutoplatenTemplate(template,normalized,{throwOnError:true});
 return template;
}

export function createMachineSimulation(key,machine,template){
 const k=normalizeMachineKey(key);
 if(!k)throw new Error('Identitas mesin belum tersedia.');
 if(k==='offset5')return new Offset5CD102RealismSimulation(machine,template);
 if(k==='sheeting')return new SheetingProcessSimulation(machine,template);
 if(k==='offset10')return new Offset10CX104SpecialRealismSimulation(machine,template);
 if(k==='apm2'){const sim=new APM2ProcessSimulation(machine,template);validateAutoplatenSimulation(sim,template,k,{throwOnError:true});return sim;}
 if(k==='BMJ-MCH-0001')return new Polar115ProcessSimulation(machine,template);
 if(k==='BMJ-MCH-0005')return new Offset8CX104RealismSimulation(machine,template);
 if(k==='BMJ-MCH-0006')return new Offset9PrintingSimulation(machine,template);
 if(['BMJ-MCH-0007','BMJ-MCH-0008','BMJ-MCH-0022'].includes(k))return new FZ1200ProcessSimulation(machine,template);
 if(['BMJ-MCH-0011','BMJ-MCH-0012'].includes(k)){const sim=new MK920StampingSimulation(machine,template);validateAutoplatenSimulation(sim,template,k,{throwOnError:true});return sim;}
 if(k==='BMJ-MCH-0013'){const sim=new MK1060ProcessSimulation(machine,template);validateAutoplatenSimulation(sim,template,k,{throwOnError:true});return sim;}
 if(['BMJ-MCH-0014','BMJ-MCH-0015'].includes(k)){const sim=new Promatrix106ProcessSimulation(machine,template);validateAutoplatenSimulation(sim,template,k,{throwOnError:true});return sim;}
 if(['BMJ-MCH-0016','BMJ-MCH-0018'].includes(k))return new Media100ProcessSimulation(machine,template);
 if(k==='BMJ-MCH-0019')return new DianaEye55ProcessSimulation(machine,template);
 if(k==='BMJ-MCH-0020')return new SharkN650ProcessSimulation(machine,template);
 if(k==='BMJ-MCH-0024')return new UpgLy300ProcessSimulation(machine,template);
 if(isReferenceMachineKey(k))return new ReferenceProcessSimulation(machine,template);
 if(universalMachineConfig(k))return new UniversalProcessSimulation(machine,template);
 throw new Error(`Simulasi untuk ${k} belum tersedia.`);
}
