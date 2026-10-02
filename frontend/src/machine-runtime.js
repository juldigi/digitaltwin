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
  for(const id of contract.coreNodes){
   const node=template.findNode?.(id);
   if(!node){fail('CORE_NODE_MISSING',id);continue;}
   let attached=false;for(let p=node;p;p=p.parent)if(p===root){attached=true;break;}
   if(!attached)fail('CORE_NODE_DETACHED',id);
  }
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


export const FOLDER_RUNTIME_CONTRACTS=Object.freeze({
 'BMJ-MCH-0016':Object.freeze({
  taxonomyVersion:'media100-v2',serial:'0341 06903',geometryBoundary:'INSTALLED_KITS_BOUNDED',identity:'MEDIA100_EXACT_MODEL_FAMILY_PROCESS',
  coreNodes:Object.freeze(['media100-feeder','media100-prefold','media100-forming','media100-glue','media100-final','media100-compression','media100-drive','media100-access']),
  unverifiedSpecFlags:Object.freeze(['installedMinWorkingWidthVerified','installedA1A2SuffixVerified','installedGlueHeadCountVerified','installedCornerServoPackageVerified','installedKickerVerified','installedEjectorVerified','installedControlGenerationVerified'])
 }),
 'BMJ-MCH-0017':Object.freeze({
  serial:null,geometryBoundary:'MULTI_VENDOR_FOLDER_GLUER_PROCESS_REFERENCE__NOT_MEDIA100_IDENTITY',identity:'OEM_MODEL_SERIAL_UNKNOWN__NO_MEDIA100_IDENTITY_ASSUMED',
  coreNodes:Object.freeze(['fgm2-open-frame','fgm2-feed-table','fgm2-aligner','fgm2-primary-fold','fgm2-glue-supply','fgm2-final-fold','fgm2-compression-belts','fgm2-delivery','fgm2-control']),
  capabilityNodes:Object.freeze(['fgm2-lockbottom-boundary','fgm2-corner-boundary','fgm2-glue-applicator-boundary','fgm2-glue-detection-boundary','fgm2-counter-boundary','fgm2-downstream-boundary'])
 }),
 'BMJ-MCH-0018':Object.freeze({
  taxonomyVersion:'media100-v2',serial:'0341 142 07',geometryBoundary:'INSTALLED_KITS_BOUNDED',identity:'MEDIA100_EXACT_MODEL_FAMILY_PROCESS',
  coreNodes:Object.freeze(['media100-feeder','media100-prefold','media100-forming','media100-glue','media100-final','media100-compression','media100-drive','media100-access']),
  unverifiedSpecFlags:Object.freeze(['installedMinWorkingWidthVerified','installedA1A2SuffixVerified','installedGlueHeadCountVerified','installedCornerServoPackageVerified','installedKickerVerified','installedEjectorVerified','installedControlGenerationVerified'])
 })
});
const folderContractFor=(normalized,template)=>FOLDER_RUNTIME_CONTRACTS[normalized]||FOLDER_RUNTIME_CONTRACTS[template?.root?.userData?.assetId]||null;

export function validateFolderTemplate(template,key,{throwOnError=false}={}){
 const normalized=normalizeMachineKey(key),root=template?.root,assetId=normalized,contract=FOLDER_RUNTIME_CONTRACTS[assetId],errors=[];
 const fail=(code,detail)=>errors.push({code,detail});
 if(!contract)return Object.freeze({valid:true,errors:Object.freeze([]),contract:null,assetId:null});
 if(!root)fail('ROOT_MISSING',assetId);
 else{
  const u=root.userData||{};
  if(u.assetId!==assetId)fail('ASSET_ID',u.assetId);
  if(u.engineeringDimensions!==false)fail('ENGINEERING_DIMENSION_BOUNDARY',u.engineeringDimensions);
  if(!String(u.geometryStatus||'').includes(contract.geometryBoundary))fail('GEOMETRY_BOUNDARY',u.geometryStatus);
  if(contract.taxonomyVersion&&u.taxonomyVersion!==contract.taxonomyVersion)fail('TAXONOMY_VERSION',u.taxonomyVersion);
  for(const id of contract.coreNodes){
   const node=template.findNode?.(id);
   if(!node){fail('CORE_NODE_MISSING',id);continue;}
   let attached=false;for(let p=node;p;p=p.parent)if(p===root){attached=true;break;}
   if(!attached)fail('CORE_NODE_DETACHED',id);
  }
  const taxonomy=template.taxonomy||[],levels=new Set(taxonomy.map(n=>n.level));
  for(let level=1;level<=6;level++)if(!levels.has(level))fail('TAXONOMY_LEVEL_MISSING',level);
  if(assetId==='BMJ-MCH-0016'||assetId==='BMJ-MCH-0018'){
   const plates=[];root.traverse?.(o=>{if(o.userData?.identityPlacard)plates.push(o.userData.identityPlacard);});
   if(plates.length!==1)fail('IDENTITY_PLACARD_COUNT',plates.length);
   else if(plates[0].serial!==contract.serial)fail('IDENTITY_SERIAL',plates[0].serial);
   const spec=u.spec||{};
   for(const flag of contract.unverifiedSpecFlags)if(spec[flag]!==false)fail('MEDIA100_OPTION_BOUNDARY',flag);
   for(const id of ['media100-form-servo','media100-final-kicker']){
    const node=template.findNode?.(id),visible=[];node?.traverse?.(o=>{if(o.isMesh)visible.push(o);});
    if(!visible.length||visible.some(m=>m.userData.capabilityOnly!==true||m.visible!==false))fail('MEDIA100_CAPABILITY_SILHOUETTE',id);
   }
   const heads=[];template.findNode?.('media100-glue-upper')?.traverse?.(o=>{if(o.isMesh&&o.userData.glueHeadPosition)heads.push(o);});
   if(!heads.length||heads.some(m=>m.userData.capabilityOnly!==true||m.visible!==false))fail('MEDIA100_GLUE_HEAD_BOUNDARY',heads.length);
  }else{
   if(u.exactFolderGluerOemVerified!==false)fail('FGM2_OEM_BOUNDARY',u.exactFolderGluerOemVerified);
   if(u.exactFolderGluerModelVerified!==false)fail('FGM2_MODEL_BOUNDARY',u.exactFolderGluerModelVerified);
   if(u.installedIdentityBoundary!==contract.identity)fail('FGM2_IDENTITY_BOUNDARY',u.installedIdentityBoundary);
   if(u.neighborMedia100IdentityProof!==false)fail('FGM2_MEDIA100_IDENTITY_PROOF',u.neighborMedia100IdentityProof);
   for(const id of contract.capabilityNodes){
    const node=template.findNode?.(id),meshes=[];node?.traverse?.(o=>{if(o.isMesh)meshes.push(o);});
    if(!node||node.userData?.installedOptionVerified!==false)fail('FGM2_OPTION_BOUNDARY',id);
    if(meshes.some(m=>m.userData.capabilityOnly!==true||m.visible!==false))fail('FGM2_OPTION_SILHOUETTE',id);
   }
  }
 }
 const result=Object.freeze({valid:errors.length===0,errors:Object.freeze(errors),contract,assetId});
 if(root){root.userData.folderRuntimeTruthLock=result.valid?'PASS':'FAIL';root.userData.folderRuntimeTruthErrors=errors.map(e=>e.code+':'+e.detail).join('|');}
 if(throwOnError&&!result.valid)throw new Error('Folder Gluer runtime truth-lock failed for '+assetId+': '+root?.userData?.folderRuntimeTruthErrors);
 return result;
}

export function validateFolderSimulation(simulation,template,key,{throwOnError=false}={}){
 const normalized=normalizeMachineKey(key),contract=FOLDER_RUNTIME_CONTRACTS[normalized],errors=[],state=simulation?.state?.();
 const fail=(code,detail)=>errors.push({code,detail});
 if(!contract)return Object.freeze({valid:true,errors:Object.freeze([]),contract:null,assetId:null});
 if(!state||state.available!==true||state.blocked===true)fail('SIMULATION_AVAILABILITY',state?.available);
 if(normalized==='BMJ-MCH-0016'||normalized==='BMJ-MCH-0018'){
  if(state?.referenceJobDemoOnly!==true)fail('MEDIA100_DEMO_JOB_BOUNDARY',state?.referenceJobDemoOnly);
 }else{
  if(state?.simulationBoundary!=='FGM2_MULTI_VENDOR_COMMON_FOLD_GLUE_PROCESS_ONLY__BOX_STYLE_GLUE_HARDWARE_OPTIONS_NOT_INFERRED')fail('FGM2_SIMULATION_BOUNDARY',state?.simulationBoundary);
  for(const [name,value] of [['cartonBlankGeometryIsSchematic',true],['crashLockInstalledVerified',false],['fourSixCornerInstalledVerified',false],['glueApplicatorTypeVerified',false]])if(state?.[name]!==value)fail('FGM2_SIMULATION_TRUTH',name+':'+state?.[name]);
 }
 const result=Object.freeze({valid:errors.length===0,errors:Object.freeze(errors),contract,assetId:normalized});
 if(template?.root){template.root.userData.folderSimulationTruthLock=result.valid?'PASS':'FAIL';template.root.userData.folderSimulationTruthErrors=errors.map(e=>e.code+':'+e.detail).join('|');}
 if(throwOnError&&!result.valid)throw new Error('Folder Gluer simulation truth-lock failed for '+normalized+': '+template?.root?.userData?.folderSimulationTruthErrors);
 return result;
}


export const INSPECTION_RUNTIME_CONTRACTS=Object.freeze({
 'BMJ-MCH-0019':Object.freeze({
  taxonomyVersion:'diana55-v252-oem-flow',serial:'MP.FBA0-00058',model:'DIANA EYE 55',
  geometryBoundary:'BMJ_INSTALLED_OPTIONS_BOUNDED',modeledMode:'STANDARD_FEEDER_FISH_SCALE_DELIVERY_REFERENCE',
  coreNodes:Object.freeze(['diana55-access','diana55-feeder','diana55-transport','diana55-inspection','diana55-camera','diana55-light','diana55-processing','diana55-reject','diana55-delivery','diana55-reject-pivot-v260','diana55-reject-recovery-v258']),
  hiddenNodes:Object.freeze(['diana55-camera-rear','diana55-camera-area','diana55-reject-air','diana55-side-stacker-capability-v254','diana55-process-recipe','diana55-delivery-waste-v254']),
  unverifiedSpecFlags:Object.freeze(['installedCameraCountVerified','installedCameraMixVerified','installedRejectActuationVerified','installedStackerVerified']),
  deterministicDefectInjection:'EVERY_5TH_INSPECTED_BLANK_DEMO_ONLY'
 }),
 'BMJ-MCH-0020':Object.freeze({
  taxonomyVersion:'shark650-v252-n650-offline-flow',serial:'FPS241216001',model:'FS-SHARK-N650-P3N1',
  geometryBoundary:'P3N1_OPTIONS_UNDECODED',modeledMode:'FISH_SCALE_OFFLINE_REFERENCE',
  coreNodes:Object.freeze(['shark650-access','shark650-feeder','shark650-transfer','shark650-inspection','shark650-vision','shark650-processing','shark650-reject','shark650-return','shark650-reject-pivot-v260','shark650-return-side-frame-v260']),
  hiddenNodes:Object.freeze(['shark650-feed-friction','shark650-process-hmi','shark650-access-platform','shark650-reject-air','shark650-return-stack','shark650-dust-integration-capability-v254','shark650-process-recipe']),
  unverifiedSpecFlags:Object.freeze(['installedMaxInspectionFormatVerified','suffixDecoded','installedFeederModeVerified','installedCameraPackageVerified','installedLightingPackageVerified','installedRejectTypeVerified','installedCollectionModeVerified']),
  deterministicDefectInjection:'EVERY_6TH_INSPECTED_BLANK_DEMO_ONLY'
 })
});
const inspectionContractFor=normalized=>INSPECTION_RUNTIME_CONTRACTS[normalized]||null;

export function validateInspectionTemplate(template,key,{throwOnError=false}={}){
 const assetId=normalizeMachineKey(key),contract=INSPECTION_RUNTIME_CONTRACTS[assetId],root=template?.root,errors=[];
 const fail=(code,detail)=>errors.push({code,detail});
 if(!contract)return Object.freeze({valid:true,errors:Object.freeze([]),contract:null,assetId:null});
 if(!root)fail('ROOT_MISSING',assetId);
 else{
  const u=root.userData||{},spec=u.spec||{};
  if(u.assetId!==assetId)fail('ASSET_ID',u.assetId);
  if(spec.serial!==contract.serial)fail('SERIAL',spec.serial);
  if(spec.model!==contract.model)fail('MODEL',spec.model);
  if(u.taxonomyVersion!==contract.taxonomyVersion)fail('TAXONOMY_VERSION',u.taxonomyVersion);
  if(u.engineeringDimensions!==false)fail('ENGINEERING_DIMENSION_BOUNDARY',u.engineeringDimensions);
  if(!String(u.geometryStatus||'').includes(contract.geometryBoundary))fail('GEOMETRY_BOUNDARY',u.geometryStatus);
  const modeledMode=u.modeledEnvelopeMode||u.modeledMode;
  if(modeledMode!==contract.modeledMode)fail('MODELED_MODE',modeledMode);
  for(const id of contract.coreNodes){
   const node=template.findNode?.(id);
   if(!node){fail('CORE_NODE_MISSING',id);continue;}
   let attached=false;for(let p=node;p;p=p.parent)if(p===root){attached=true;break;}
   if(!attached)fail('CORE_NODE_DETACHED',id);
  }
  const taxonomy=template.taxonomy||[],levels=new Set(taxonomy.map(n=>n.level));
  for(let level=1;level<=6;level++)if(!levels.has(level))fail('TAXONOMY_LEVEL_MISSING',level);
  for(const flag of contract.unverifiedSpecFlags)if(spec[flag]!==false)fail('INSTALLED_OPTION_BOUNDARY',flag+':'+spec[flag]);
  for(const id of contract.hiddenNodes){
   const node=template.findNode?.(id);
   if(!node)fail('HIDDEN_BOUNDARY_NODE_MISSING',id);
   else if(node.visible!==false)fail('HIDDEN_BOUNDARY_LEAK',id);
  }
  if(assetId==='BMJ-MCH-0019'){
   const cam=template.findNode?.('diana55-camera-top'),area=template.findNode?.('diana55-camera-area'),rear=template.findNode?.('diana55-camera-rear'),reject=template.findNode?.('diana55-reject');
   if(cam?.userData?.capacity!==4||cam?.userData?.installedCountVerified!==false)fail('DIANA_TOP_CAMERA_BOUNDARY',cam?.userData?.capacity);
   if(area?.userData?.capacity!==2||area?.userData?.installedCountVerified!==false)fail('DIANA_AREA_CAMERA_BOUNDARY',area?.userData?.capacity);
   if(rear?.userData?.capacity!==1||rear?.userData?.installedCountVerified!==false)fail('DIANA_REAR_CAMERA_BOUNDARY',rear?.userData?.capacity);
   if(reject?.userData?.installedRejectActuationVerified!==false)fail('DIANA_REJECT_BOUNDARY',reject?.userData?.installedRejectActuationVerified);
   if(u.opticalAxisPolicy!=='NEUTRAL_REFERENCE_HEAD_POINTS_DOWN_TO_SUCTION_BELT__INSTALLED_CAMERA_POPULATION_UNVERIFIED')fail('DIANA_OPTICAL_AXIS_BOUNDARY',u.opticalAxisPolicy);
  }else{
   if(spec.currentPageFormatDiscrepancyVerified!==true)fail('SHARK_FORMAT_DISCREPANCY_BOUNDARY',spec.currentPageFormatDiscrepancyVerified);
   if(u.suffixBoundary!=='P3N1_PRESERVED_VERBATIM__NOT_DECODED')fail('SHARK_SUFFIX_BOUNDARY',u.suffixBoundary);
   const camera=template.findNode?.('shark650-vision-camera'),reject=template.findNode?.('shark650-reject'),ret=template.findNode?.('shark650-return');
   if(camera?.userData?.installedCameraCountVerified!==false||camera?.userData?.p3SuffixDecoded!==false)fail('SHARK_CAMERA_SUFFIX_BOUNDARY',camera?.userData?.p3SuffixDecoded);
   if(reject?.userData?.installedRejectTypeVerified!==false)fail('SHARK_REJECT_BOUNDARY',reject?.userData?.installedRejectTypeVerified);
   if(ret?.userData?.installedCollectionModeVerified!==false||ret?.userData?.officialGoodBadReturnLine!==true)fail('SHARK_RETURN_BOUNDARY',ret?.userData?.installedCollectionModeVerified);
  }
 }
 const result=Object.freeze({valid:errors.length===0,errors:Object.freeze(errors),contract,assetId});
 if(root){root.userData.inspectionRuntimeTruthVersion='V323';root.userData.inspectionRuntimeTruthLock=result.valid?'PASS':'FAIL';root.userData.inspectionRuntimeTruthErrors=errors.map(e=>e.code+':'+e.detail).join('|');}
 if(throwOnError&&!result.valid)throw new Error('Inspection runtime truth-lock failed for '+assetId+': '+root?.userData?.inspectionRuntimeTruthErrors);
 return result;
}

export function validateInspectionSimulation(simulation,template,key,{throwOnError=false}={}){
 const assetId=normalizeMachineKey(key),contract=INSPECTION_RUNTIME_CONTRACTS[assetId],state=simulation?.state?.(),errors=[];
 const fail=(code,detail)=>errors.push({code,detail});
 if(!contract)return Object.freeze({valid:true,errors:Object.freeze([]),contract:null,assetId:null});
 if(!state||state.available!==true||state.blocked===true)fail('SIMULATION_AVAILABILITY',state?.available);
 if(state?.demoRejectOnly!==true)fail('DEMO_REJECT_BOUNDARY',state?.demoRejectOnly);
 if(state?.interlockSafe!==true)fail('INTERLOCK_STATE',state?.interlockSafe);
 if(state?.deterministicDefectInjection!==contract.deterministicDefectInjection)fail('DETERMINISTIC_DEMO_POLICY',state?.deterministicDefectInjection);
 if(assetId==='BMJ-MCH-0019'){
  if(state?.installedRejectActuationVerified!==false)fail('DIANA_INSTALLED_REJECT_BOUNDARY',state?.installedRejectActuationVerified);
  if(state?.installedCameraCountVerified!==false||state?.installedCameraPopulationRendered!==false)fail('DIANA_CAMERA_POPULATION_BOUNDARY',state?.installedCameraCountVerified);
  if(state?.deliveryMode!=='ACCEPTED_FISH_SCALE_PLUS_RECOVERABLE_REJECT_COLLECTION')fail('DIANA_DELIVERY_MODE',state?.deliveryMode);
  if(state?.rejectBranchPolicy!=='TRACKED_BLANK_BRANCHES_DIRECTLY_FROM_GATE_TO_RECOVERY_TRAY')fail('DIANA_REJECT_TRACKING_POLICY',state?.rejectBranchPolicy);
  if(state?.acceptedBranchPolicy!=='TRACKED_ACCEPTED_BLANK_BRANCHES_TO_FISH_SCALE_ENTRY_WITHOUT_TELEPORT')fail('DIANA_ACCEPT_TRACKING_POLICY',state?.acceptedBranchPolicy);
 }else{
  for(const flag of ['suffixDecoded','installedFeederModeVerified','installedCameraPackageVerified','installedRejectTypeVerified','installedCollectionModeVerified'])if(state?.[flag]!==false)fail('SHARK_SIM_OPTION_BOUNDARY',flag+':'+state?.[flag]);
  if(state?.goodBadReturnLineOfficial!==true)fail('SHARK_RETURN_LINE_TRUTH',state?.goodBadReturnLineOfficial);
  if(state?.transportMode!=='NEGATIVE_PITCH_FULL_SUCTION_OFFLINE_DEMO_REFERENCE')fail('SHARK_TRANSPORT_MODE',state?.transportMode);
  if(state?.returnBranchPolicy!=='TRACKED_BLANK_BRANCHES_FROM_DECISION_SPLIT_TO_GOOD_OR_BAD_RETURN_ENTRY')fail('SHARK_TRACKING_POLICY',state?.returnBranchPolicy);
 }
 const result=Object.freeze({valid:errors.length===0,errors:Object.freeze(errors),contract,assetId});
 if(template?.root){template.root.userData.inspectionSimulationTruthVersion='V323';template.root.userData.inspectionSimulationTruthLock=result.valid?'PASS':'FAIL';template.root.userData.inspectionSimulationTruthErrors=errors.map(e=>e.code+':'+e.detail).join('|');}
 if(throwOnError&&!result.valid)throw new Error('Inspection simulation truth-lock failed for '+assetId+': '+template?.root?.userData?.inspectionSimulationTruthErrors);
 return result;
}


export const PDS_RUNTIME_CONTRACTS=Object.freeze({
 'BMJ-MCH-0025':Object.freeze({
  family:'ctp',brandBoundary:'HEIDELBERG_SUPRASETTER_MULTI_MODEL_FAMILY_REFERENCE',
  coreNodes:Object.freeze(['ctp-family-envelope','ctp-manual-entry','ctp-transport','ctp-register','ctp-drum','ctp-drum-clamp','ctp-laser-rail','ctp-laser-module','ctp-ids','ctp-unload']),
  optionNodes:Object.freeze(['ctp-loader-boundary','ctp-punch-option','ctp-processor-boundary','ctp-debris-option','ctp-temp-stabilizer-option']),
  simulationBoundary:'SUPRASETTER_EXTERNAL_DRUM_LOAD_CLAMP_IMAGE_UNLOAD__MODEL_OPTIONS_NOT_INFERRED'
 }),
 'BMJ-MCH-0026':Object.freeze({
  family:'ctp',brandBoundary:'HEIDELBERG_SUPRASETTER_MULTI_MODEL_FAMILY_REFERENCE',
  coreNodes:Object.freeze(['ctp-family-envelope','ctp-manual-entry','ctp-transport','ctp-register','ctp-drum','ctp-drum-clamp','ctp-laser-rail','ctp-laser-module','ctp-ids','ctp-unload']),
  optionNodes:Object.freeze(['ctp-loader-boundary','ctp-punch-option','ctp-processor-boundary','ctp-debris-option','ctp-temp-stabilizer-option']),
  simulationBoundary:'SUPRASETTER_EXTERNAL_DRUM_LOAD_CLAMP_IMAGE_UNLOAD__MODEL_OPTIONS_NOT_INFERRED'
 }),
 'BMJ-MCH-0027':Object.freeze({
  family:'imagesetter',brandBoundary:'SCREEN_FTR_KATANA_MULTI_MODEL_FAMILY_REFERENCE',
  coreNodes:Object.freeze(['ctf-family-envelope','ctf-media-cassette','ctf-auto-load','ctf-capstan','ctf-front-slack','ctf-gravity-roller','ctf-rear-slack','ctf-polygon-mirror','ctf-polygon-drive','ctf-laser-source','ctf-optics','ctf-laser-modulator','ctf-cutter']),
  optionNodes:Object.freeze(['ctf-punch-option','ctf-output-cassette','ctf-processor-boundary','ctf-control-boundary']),
  simulationBoundary:'SCREEN_FTR_KATANA_COMMON_PROCESS_ONLY__PUNCH_PROCESSOR_MODEL_OPTIONS_NOT_INFERRED'
 }),
 'BMJ-MCH-0028':Object.freeze({
  family:'zund',brandBoundary:'ZUND_G3_S3_MODULAR_PLATFORM_REFERENCE',
  coreNodes:Object.freeze(['zund-vacuum-bed','zund-vacuum-zones','zund-gantry-guide','zund-gantry-beam','zund-carriage-y','zund-module-slots','zund-control','zund-vacuum-generator']),
  optionNodes:Object.freeze(['zund-cut-tool-option','zund-crease-option','zund-router-option','zund-arc-option','zund-icc-option','zund-iti-option','zund-handling-option']),
  simulationBoundary:'ZUND_XY_PLATFORM_MOTION_ONLY__INSTALLED_TOOL_CAMERA_INIT_PACKAGE_NOT_INFERRED'
 })
});
const pdsContractFor=normalized=>PDS_RUNTIME_CONTRACTS[normalized]||null;

export function validatePdsTemplate(template,key,{throwOnError=false}={}){
 const assetId=normalizeMachineKey(key),contract=PDS_RUNTIME_CONTRACTS[assetId],root=template?.root,errors=[];
 const fail=(code,detail)=>errors.push({code,detail});
 if(!contract)return Object.freeze({valid:true,errors:Object.freeze([]),contract:null,assetId:null});
 if(!root)fail('ROOT_MISSING',assetId);
 else{
  const u=root.userData||{};
  if(u.assetId!==assetId)fail('ASSET_ID',u.assetId);
  if(u.engineeringDimensions!==false)fail('ENGINEERING_DIMENSION_BOUNDARY',u.engineeringDimensions);
  if(u.referenceBuilder!=='V139_RESEARCH_GROUNDED_BUILDER')fail('REFERENCE_BUILDER',u.referenceBuilder);
  if(u.geometryStatus!=='REFERENCE_GROUNDED_FAMILY__NOT_SERIAL_SPECIFIC')fail('GEOMETRY_BOUNDARY',u.geometryStatus);
  if(template.cfg?.family!==contract.family)fail('FAMILY_ROUTE',template.cfg?.family);
  if(template.cfg?.evidence?.geometry!==contract.brandBoundary)fail('EVIDENCE_GEOMETRY',template.cfg?.evidence?.geometry);
  for(const id of contract.coreNodes){
   const node=template.findNode?.(id);
   if(!node){fail('CORE_NODE_MISSING',id);continue;}
   let attached=false;for(let p=node;p;p=p.parent)if(p===root){attached=true;break;}
   if(!attached)fail('CORE_NODE_DETACHED',id);
  }
  const taxonomy=template.taxonomy||[],levels=new Set(taxonomy.map(n=>n.level));
  for(let level=1;level<=6;level++)if(!levels.has(level))fail('TAXONOMY_LEVEL_MISSING',level);
  for(const id of contract.optionNodes){
   const node=template.findNode?.(id);
   if(!node)fail('OPTION_NODE_MISSING',id);
   else if(node.userData?.installedOptionVerified!==false)fail('OPTION_BOUNDARY_PROMOTED',id);
  }
  if(contract.family==='ctp'){
   if(u.exactSuprasetterModelVerified!==false)fail('CTP_MODEL_BOUNDARY',u.exactSuprasetterModelVerified);
   if(u.exactPlateFormatVerified!==false)fail('CTP_FORMAT_BOUNDARY',u.exactPlateFormatVerified);
   if(u.installedLoaderTypeVerified!==false)fail('CTP_LOADER_BOUNDARY',u.installedLoaderTypeVerified);
   const module=template.findNode?.('ctp-laser-module'),ids=template.findNode?.('ctp-ids');
   const laserMeshes=[];module?.traverse?.(o=>{if(o.isMesh&&o.userData?.installedLaserModuleCountVerified===false)laserMeshes.push(o);});
   if(!laserMeshes.length)fail('CTP_LASER_COUNT_BOUNDARY','missing');
   if(ids?.userData?.installedDiodeCountVerified!==false)fail('CTP_IDS_COUNT_BOUNDARY',ids?.userData?.installedDiodeCountVerified);
  }else if(contract.family==='imagesetter'){
   if(u.exactScreenModelVerified!==false)fail('CTF_MODEL_BOUNDARY',u.exactScreenModelVerified);
   if(u.exactLaserWavelengthVerified!==false)fail('CTF_WAVELENGTH_BOUNDARY',u.exactLaserWavelengthVerified);
   if(u.processArchitecture!=='CAPSTAN_FLATBED_SCAN__NOT_IMAGING_DRUM')fail('CTF_PROCESS_ARCHITECTURE',u.processArchitecture);
   if(u.katanaPolygonReference?.installedApplicabilityVerified!==false)fail('CTF_POLYGON_APPLICABILITY_BOUNDARY',u.katanaPolygonReference?.installedApplicabilityVerified);
  }else{
   for(const [field,expected] of [
    ['exactZundModelVerified',false],['installedToolPackageVerified',false],['installedIccVerified',false],
    ['installedItiVerified',false],['installedArcVerified',false],['installedMaterialHandlingVerified',false]
   ])if(u[field]!==expected)fail('ZUND_OPTION_BOUNDARY',field+':'+u[field]);
   if(u.platformSimulationBoundary!=='XY_CARRIAGE_MOTION_ONLY__NO_TOOL_ACTION_WITHOUT_INSTALLED_TOOL_EVIDENCE')fail('ZUND_SIMULATION_PLATFORM_BOUNDARY',u.platformSimulationBoundary);
  }
 }
 const result=Object.freeze({valid:errors.length===0,errors:Object.freeze(errors),contract,assetId});
 if(root){root.userData.pdsRuntimeTruthVersion='V324';root.userData.pdsRuntimeTruthLock=result.valid?'PASS':'FAIL';root.userData.pdsRuntimeTruthErrors=errors.map(e=>e.code+':'+e.detail).join('|');}
 if(throwOnError&&!result.valid)throw new Error('PDS runtime truth-lock failed for '+assetId+': '+root?.userData?.pdsRuntimeTruthErrors);
 return result;
}

export function validatePdsSimulation(simulation,template,key,{throwOnError=false}={}){
 const assetId=normalizeMachineKey(key),contract=PDS_RUNTIME_CONTRACTS[assetId],state=simulation?.state?.(),errors=[];
 const fail=(code,detail)=>errors.push({code,detail});
 if(!contract)return Object.freeze({valid:true,errors:Object.freeze([]),contract:null,assetId:null});
 if(!state||state.available!==true||state.blocked===true)fail('SIMULATION_AVAILABILITY',state?.available);
 if(state?.simulationBoundary!==contract.simulationBoundary)fail('SIMULATION_BOUNDARY',state?.simulationBoundary);
 if(contract.family==='ctp'){
  if(state?.ctpPunchInstalledVerified!==false)fail('CTP_PUNCH_BOUNDARY',state?.ctpPunchInstalledVerified);
  if(state?.ctpInterlockSafe!==true)fail('CTP_INTERLOCK_STATE',state?.ctpInterlockSafe);
 }else if(contract.family==='imagesetter'){
  if(state?.punchInstalledVerified!==false)fail('CTF_PUNCH_BOUNDARY',state?.punchInstalledVerified);
  if(state?.processorInstalledVerified!==false)fail('CTF_PROCESSOR_BOUNDARY',state?.processorInstalledVerified);
  if(state?.exactScreenModelVerified!==false)fail('CTF_MODEL_BOUNDARY',state?.exactScreenModelVerified);
  if(state?.imagesetterInterlockSafe!==true)fail('CTF_INTERLOCK_STATE',state?.imagesetterInterlockSafe);
 }else{
  if(state?.installedToolPackageVerified!==false||state?.toolActionEnabled!==false||state?.zundToolActionActive!==false)fail('ZUND_TOOL_ACTION_BOUNDARY',state?.zundToolActionActive);
  if(state?.registrationCameraInstalledVerified!==false)fail('ZUND_ICC_BOUNDARY',state?.registrationCameraInstalledVerified);
  if(state?.toolInitializationInstalledVerified!==false)fail('ZUND_ITI_BOUNDARY',state?.toolInitializationInstalledVerified);
  if(state?.zundAxisPathType!=='SERPENTINE_REFERENCE_ONLY')fail('ZUND_AXIS_PATH_BOUNDARY',state?.zundAxisPathType);
 }
 const result=Object.freeze({valid:errors.length===0,errors:Object.freeze(errors),contract,assetId});
 if(template?.root){template.root.userData.pdsSimulationTruthVersion='V324';template.root.userData.pdsSimulationTruthLock=result.valid?'PASS':'FAIL';template.root.userData.pdsSimulationTruthErrors=errors.map(e=>e.code+':'+e.detail).join('|');}
 if(throwOnError&&!result.valid)throw new Error('PDS simulation truth-lock failed for '+assetId+': '+template?.root?.userData?.pdsSimulationTruthErrors);
 return result;
}


const COMPRESSOR_UTILITY_PROFILE=Object.freeze({
 'BMJ-MCH-0029':Object.freeze({brand:'ATLAS',brandEvidence:'ATLAS_COPCO',geometry:'ATLAS_COPCO_GA_G_OIL_INJECTED_FAMILY_REFERENCE',prefix:'atlas'}),
 'BMJ-MCH-0030':Object.freeze({brand:'ATLAS',brandEvidence:'ATLAS_COPCO',geometry:'ATLAS_COPCO_GA_G_OIL_INJECTED_FAMILY_REFERENCE',prefix:'atlas'}),
 'BMJ-MCH-0031':Object.freeze({brand:'KAESER',brandEvidence:'KAESER',geometry:'KAESER_SIGMA_FLUID_COOLED_FAMILY_REFERENCE',prefix:'kaeser'}),
 'BMJ-MCH-0032':Object.freeze({brand:'KAESER',brandEvidence:'KAESER',geometry:'KAESER_SIGMA_FLUID_COOLED_FAMILY_REFERENCE',prefix:'kaeser'}),
 'BMJ-MCH-0033':Object.freeze({brand:'SWAN',brandEvidence:'SWAN',geometry:'SWAN_TS_AD_TMV_SCREW_FAMILY_REFERENCE',prefix:'swan'}),
 'BMJ-MCH-0034':Object.freeze({brand:'KAESER',brandEvidence:'KAESER',geometry:'KAESER_SIGMA_FLUID_COOLED_FAMILY_REFERENCE',prefix:'kaeser'}),
 'BMJ-MCH-0035':Object.freeze({brand:'ATLAS',brandEvidence:'ATLAS_COPCO',geometry:'ATLAS_COPCO_GA_G_OIL_INJECTED_FAMILY_REFERENCE',prefix:'atlas'})
});
const GENERIC_AHU_IDS=Object.freeze(['BMJ-MCH-0036','BMJ-MCH-0037','BMJ-MCH-0038','BMJ-MCH-0039','BMJ-MCH-0041']);
export const UTILITY_RUNTIME_CONTRACTS=Object.freeze({
 ...Object.fromEntries(Object.entries(COMPRESSOR_UTILITY_PROFILE).map(([id,p])=>[id,Object.freeze({
  family:'compressor',...p,
  coreNodes:Object.freeze([p.prefix+'-intake-filter-group',p.prefix+'-airend-group','compressor-air-distribution','compressor-discharge-piping','compressor-air-receiver-boundary','compressor-air-treatment-boundary','compressor-ring-main-reference','compressor-condensate-treatment-boundary']),
  simulationBoundary:'BRAND_FAMILY_OIL_INJECTED_SCREW_AIRFLOW__LOCAL_RING_MAIN_FUNCTIONAL_REFERENCE__PLANT_ROUTE_UNVERIFIED'
 })])),
 ...Object.fromEntries(GENERIC_AHU_IDS.map(id=>[id,Object.freeze({
  family:'ahu',kind:'GENERIC',geometry:'EUROVENT_SECTIONAL_AHU_FUNCTIONAL_REFERENCE',
  coreNodes:Object.freeze(['ahu-inlet-damper','ahu-filter-bank','ahu-cooling-coil','ahu-drain-pan','ahu-supply-fan','ahu-service-door','ahu-discharge-plenum','ahu-air-distribution','ahu-supply-duct','ahu-return-duct','ahu-outdoor-intake']),
  simulationBoundary:'EUROVENT_CANONICAL_AHU_AIR_PATH_REFERENCE__SECTION_ORDER_DIRECTION_UNVERIFIED'
 })])),
 'BMJ-MCH-0040':Object.freeze({
  family:'ahu',kind:'SANSIN',geometry:'SANSIN_NES_YZKJ_INDOOR_OUTDOOR_REFERENCE',
  coreNodes:Object.freeze(['sansin-inlet-damper','sansin-filter-net','sansin-wet-curtain','sansin-evaporator','sansin-supply-fan','sansin-compressor','sansin-condenser','sansin-outdoor-fan','sansin-refrigerant','sansin-water-circuit','sansin-controller','sansin-electrical','sansin-air-distribution','sansin-supply-duct','sansin-return-duct']),
  simulationBoundary:'SANSIN_NES_YZKJ_INDOOR_AIR_PATH_FAMILY_REFERENCE__MODEL_CAPACITY_UNVERIFIED'
 })
});
const utilityContractFor=normalized=>UTILITY_RUNTIME_CONTRACTS[normalized]||null;

export function validateUtilityTemplate(template,key,{throwOnError=false}={}){
 const assetId=normalizeMachineKey(key),contract=UTILITY_RUNTIME_CONTRACTS[assetId],root=template?.root,errors=[];
 const fail=(code,detail)=>errors.push({code,detail});
 if(!contract)return Object.freeze({valid:true,errors:Object.freeze([]),contract:null,assetId:null});
 if(!root)fail('ROOT_MISSING',assetId);
 else{
  const u=root.userData||{};
  if(u.assetId!==assetId)fail('ASSET_ID',u.assetId);
  if(u.engineeringDimensions!==false)fail('ENGINEERING_DIMENSION_BOUNDARY',u.engineeringDimensions);
  if(u.referenceBuilder!=='V139_RESEARCH_GROUNDED_BUILDER')fail('REFERENCE_BUILDER',u.referenceBuilder);
  if(u.geometryStatus!=='REFERENCE_GROUNDED_FAMILY__NOT_SERIAL_SPECIFIC')fail('GEOMETRY_BOUNDARY',u.geometryStatus);
  if(template.cfg?.family!==contract.family)fail('FAMILY_ROUTE',template.cfg?.family);
  if(template.cfg?.evidence?.geometry!==contract.geometry)fail('EVIDENCE_GEOMETRY',template.cfg?.evidence?.geometry);
  for(const id of contract.coreNodes){
   const node=template.findNode?.(id);
   if(!node){fail('CORE_NODE_MISSING',id);continue;}
   let attached=false;for(let p=node;p;p=p.parent)if(p===root){attached=true;break;}
   if(!attached)fail('CORE_NODE_DETACHED',id);
  }
  const taxonomy=template.taxonomy||[],levels=new Set(taxonomy.map(n=>n.level));
  for(let level=1;level<=6;level++)if(!levels.has(level))fail('TAXONOMY_LEVEL_MISSING',level);
  if(contract.family==='compressor'){
   if(u.exactCompressorModelVerified!==false)fail('COMPRESSOR_MODEL_BOUNDARY',u.exactCompressorModelVerified);
   if(u.unifiedCompressorCabinet!==true)fail('COMPRESSOR_CABINET_POLICY',u.unifiedCompressorCabinet);
   if(u.brandEvidenceBoundary?.brand!==contract.brandEvidence)fail('COMPRESSOR_BRAND_BOUNDARY',u.brandEvidenceBoundary?.brand);
   for(const field of ['plantCompressedAirRouteVerified','airReceiverInstalledVerified','airDryerInstalledVerified','lineFilterPackageInstalledVerified','ringMainInstalledVerified'])if(u[field]!==false)fail('COMPRESSED_AIR_INSTALLATION_BOUNDARY',field+':'+u[field]);
   if(template.findNode?.('compressor-air-receiver-boundary')?.userData?.installedOptionVerified!==false)fail('RECEIVER_BOUNDARY','promoted');
   if(template.findNode?.('compressor-air-treatment-boundary')?.userData?.installedConfigurationVerified!==false)fail('AIR_TREATMENT_BOUNDARY','promoted');
   if(template.findNode?.('compressor-ring-main-reference')?.userData?.installedRouteVerified!==false)fail('RING_MAIN_BOUNDARY','promoted');
   if(template.findNode?.('compressor-condensate-treatment-boundary')?.userData?.installedConfigurationVerified!==false)fail('CONDENSATE_TREATMENT_BOUNDARY','promoted');
   if(contract.brand==='KAESER'&&u.kaeserDriveType!=='UNVERIFIED_BELT_OR_1_TO_1_DIRECT')fail('KAESER_DRIVE_BOUNDARY',u.kaeserDriveType);
   if(contract.brand==='SWAN'&&u.installedSwanSeriesVerified!==false)fail('SWAN_SERIES_BOUNDARY',u.installedSwanSeriesVerified);
  }else if(contract.kind==='GENERIC'){
   for(const field of ['exactAhuModelVerified','sectionOrderVerified','airflowDirectionVerified','filterClassVerified','coilTypeVerified','fanTypeVerified','plantDuctRouteVerified'])if(u[field]!==false)fail('AHU_CONFIGURATION_BOUNDARY',field+':'+u[field]);
   if(u.outdoorCondensingUnitAssumed!==false)fail('AHU_OUTDOOR_CONDENSER_BOUNDARY',u.outdoorCondensingUnitAssumed);
   if(template.findNode?.('ahu-mixing-boundary')?.userData?.installedConfigurationVerified!==false)fail('AHU_MIXING_BOUNDARY','promoted');
   if(template.findNode?.('ahu-droplet-option')?.userData?.installedOptionVerified!==false)fail('AHU_DROPLET_BOUNDARY','promoted');
   if(template.findNode?.('ahu-fan-drive')?.userData?.installedDriveTypeVerified!==false)fail('AHU_FAN_DRIVE_BOUNDARY','promoted');
  }else{
   if(u.exactSansinModelVerified!==false)fail('SANSIN_MODEL_BOUNDARY',u.exactSansinModelVerified);
   if(u.installedDuctTypeVerified!==false)fail('SANSIN_DUCT_TYPE_BOUNDARY',u.installedDuctTypeVerified);
   if(u.plantDuctRouteVerified!==false)fail('SANSIN_DUCT_ROUTE_BOUNDARY',u.plantDuctRouteVerified);
   if(template.findNode?.('sansin-outdoor-fan')?.userData?.installedFanCountVerified!==false)fail('SANSIN_FAN_COUNT_BOUNDARY','promoted');
   if(!Array.isArray(u.familyCandidates)||!u.familyCandidates.includes('YZKJ-45N')||!u.familyCandidates.includes('YZKJ-90N'))fail('SANSIN_FAMILY_CANDIDATES',u.familyCandidates);
  }
 }
 const result=Object.freeze({valid:errors.length===0,errors:Object.freeze(errors),contract,assetId});
 if(root){root.userData.utilityRuntimeTruthVersion='V325';root.userData.utilityRuntimeTruthLock=result.valid?'PASS':'FAIL';root.userData.utilityRuntimeTruthErrors=errors.map(e=>e.code+':'+e.detail).join('|');}
 if(throwOnError&&!result.valid)throw new Error('Utility runtime truth-lock failed for '+assetId+': '+root?.userData?.utilityRuntimeTruthErrors);
 return result;
}

export function validateUtilitySimulation(simulation,template,key,{throwOnError=false}={}){
 const assetId=normalizeMachineKey(key),contract=UTILITY_RUNTIME_CONTRACTS[assetId],state=simulation?.state?.(),errors=[];
 const fail=(code,detail)=>errors.push({code,detail});
 if(!contract)return Object.freeze({valid:true,errors:Object.freeze([]),contract:null,assetId:null});
 if(!state||state.available!==true||state.blocked===true)fail('SIMULATION_AVAILABILITY',state?.available);
 if(state?.simulationBoundary!==contract.simulationBoundary)fail('SIMULATION_BOUNDARY',state?.simulationBoundary);
 if(contract.family==='compressor'){
  if(state?.compressorBrand!==contract.brand)fail('COMPRESSOR_BRAND_STATE',state?.compressorBrand);
  for(const field of ['plantCompressedAirRouteVerified','airReceiverInstalledVerified','airDryerInstalledVerified','ringMainInstalledVerified'])if(state?.[field]!==false)fail('COMPRESSOR_SIM_INSTALLATION_BOUNDARY',field+':'+state?.[field]);
 }else{
  if(state?.ahuExactModelVerified!==false)fail('AHU_MODEL_STATE',state?.ahuExactModelVerified);
  if(state?.ahuSectionOrderVerified!==false)fail('AHU_SECTION_ORDER_STATE',state?.ahuSectionOrderVerified);
  if(state?.plantDuctRouteVerified!==false)fail('AHU_DUCT_ROUTE_STATE',state?.plantDuctRouteVerified);
  if(contract.kind==='GENERIC'&&state?.outdoorHeatRejectionActive!==false)fail('GENERIC_AHU_OUTDOOR_HEAT_REJECTION',state?.outdoorHeatRejectionActive);
 }
 const result=Object.freeze({valid:errors.length===0,errors:Object.freeze(errors),contract,assetId});
 if(template?.root){template.root.userData.utilitySimulationTruthVersion='V325';template.root.userData.utilitySimulationTruthLock=result.valid?'PASS':'FAIL';template.root.userData.utilitySimulationTruthErrors=errors.map(e=>e.code+':'+e.detail).join('|');}
 if(throwOnError&&!result.valid)throw new Error('Utility simulation truth-lock failed for '+assetId+': '+template?.root?.userData?.utilitySimulationTruthErrors);
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
 if(['BMJ-MCH-0016','BMJ-MCH-0018'].includes(k)){const template=new Media100MachineTemplate(k);validateFolderTemplate(template,k,{throwOnError:true});return template;}
 if(k==='BMJ-MCH-0019'){const template=new DianaEye55MachineTemplate();validateInspectionTemplate(template,k,{throwOnError:true});return template;}
 if(k==='BMJ-MCH-0020'){const template=new SharkN650MachineTemplate();validateInspectionTemplate(template,k,{throwOnError:true});return template;}
 if(k==='BMJ-MCH-0024')return new UpgLy300MachineTemplate();
 if(k==='BMJ-MCH-0017'){const template=new ReferenceMachineTemplate(k);validateFolderTemplate(template,k,{throwOnError:true});return template;}
 if(pdsContractFor(k)){const template=new ReferenceMachineTemplate(k);validatePdsTemplate(template,k,{throwOnError:true});return template;}
 if(utilityContractFor(k)){const template=new ReferenceMachineTemplate(k);validateUtilityTemplate(template,k,{throwOnError:true});return template;}
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
 if(folderContractFor(normalized,template))validateFolderTemplate(template,normalized,{throwOnError:true});
 if(inspectionContractFor(normalized))validateInspectionTemplate(template,normalized,{throwOnError:true});
 if(pdsContractFor(normalized))validatePdsTemplate(template,normalized,{throwOnError:true});
 if(utilityContractFor(normalized))validateUtilityTemplate(template,normalized,{throwOnError:true});
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
 if(['BMJ-MCH-0016','BMJ-MCH-0018'].includes(k)){const sim=new Media100ProcessSimulation(machine,template);validateFolderSimulation(sim,template,k,{throwOnError:true});return sim;}
 if(k==='BMJ-MCH-0019'){const sim=new DianaEye55ProcessSimulation(machine,template);validateInspectionSimulation(sim,template,k,{throwOnError:true});return sim;}
 if(k==='BMJ-MCH-0020'){const sim=new SharkN650ProcessSimulation(machine,template);validateInspectionSimulation(sim,template,k,{throwOnError:true});return sim;}
 if(k==='BMJ-MCH-0024')return new UpgLy300ProcessSimulation(machine,template);
 if(k==='BMJ-MCH-0017'){const sim=new ReferenceProcessSimulation(machine,template);validateFolderSimulation(sim,template,k,{throwOnError:true});return sim;}
 if(pdsContractFor(k)){const sim=new ReferenceProcessSimulation(machine,template);validatePdsSimulation(sim,template,k,{throwOnError:true});return sim;}
 if(utilityContractFor(k)){const sim=new ReferenceProcessSimulation(machine,template);validateUtilitySimulation(sim,template,k,{throwOnError:true});return sim;}
 if(isReferenceMachineKey(k))return new ReferenceProcessSimulation(machine,template);
 if(universalMachineConfig(k))return new UniversalProcessSimulation(machine,template);
 throw new Error(`Simulasi untuk ${k} belum tersedia.`);
}
