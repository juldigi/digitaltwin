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
  }
 }
 const result=Object.freeze({valid:errors.length===0,errors:Object.freeze(errors),contract:OFFSET5_PILOT_RUNTIME_CONTRACT});
 if(root)root.userData.offset5RuntimeTruthLock=result.valid?'PASS':'FAIL',root.userData.offset5RuntimeTruthErrors=errors.map(e=>e.code+':'+e.detail).join('|');
 if(throwOnError&&!result.valid)throw new Error('Offset 5 pilot runtime truth-lock failed: '+root?.userData?.offset5RuntimeTruthErrors);
 return result;
}

export function createMachineTemplate(key){
 const k=normalizeMachineKey(key);
 if(!k)throw new Error('Identitas mesin belum tersedia.');
 if(k==='offset5'){const template=new Offset5CD102RealismTemplate();validateOffset5PilotTemplate(template,{throwOnError:true});return template;}
 if(k==='sheeting')return new SheetingMachineTemplate();
 if(k==='offset10')return new Offset10CX104SpecialRealismTemplate();
 if(k==='apm2')return new APM2MachineTemplate();
 if(k==='BMJ-MCH-0001')return new Polar115MachineTemplate();
 if(k==='BMJ-MCH-0005')return new Offset8CX104RealismTemplate();
 if(k==='BMJ-MCH-0006')return new Offset9MachineTemplate();
 if(['BMJ-MCH-0007','BMJ-MCH-0008','BMJ-MCH-0022'].includes(k))return new FZ1200MachineTemplate(k);
 if(['BMJ-MCH-0011','BMJ-MCH-0012'].includes(k))return new MK920MachineTemplate(k);
 if(k==='BMJ-MCH-0013')return new MK1060MachineTemplate();
 if(['BMJ-MCH-0014','BMJ-MCH-0015'].includes(k))return new Promatrix106MachineTemplate(k);
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
 return template;
}

export function createMachineSimulation(key,machine,template){
 const k=normalizeMachineKey(key);
 if(!k)throw new Error('Identitas mesin belum tersedia.');
 if(k==='offset5')return new Offset5CD102RealismSimulation(machine,template);
 if(k==='sheeting')return new SheetingProcessSimulation(machine,template);
 if(k==='offset10')return new Offset10CX104SpecialRealismSimulation(machine,template);
 if(k==='apm2')return new APM2ProcessSimulation(machine,template);
 if(k==='BMJ-MCH-0001')return new Polar115ProcessSimulation(machine,template);
 if(k==='BMJ-MCH-0005')return new Offset8CX104RealismSimulation(machine,template);
 if(k==='BMJ-MCH-0006')return new Offset9PrintingSimulation(machine,template);
 if(['BMJ-MCH-0007','BMJ-MCH-0008','BMJ-MCH-0022'].includes(k))return new FZ1200ProcessSimulation(machine,template);
 if(['BMJ-MCH-0011','BMJ-MCH-0012'].includes(k))return new MK920StampingSimulation(machine,template);
 if(k==='BMJ-MCH-0013')return new MK1060ProcessSimulation(machine,template);
 if(['BMJ-MCH-0014','BMJ-MCH-0015'].includes(k))return new Promatrix106ProcessSimulation(machine,template);
 if(['BMJ-MCH-0016','BMJ-MCH-0018'].includes(k))return new Media100ProcessSimulation(machine,template);
 if(k==='BMJ-MCH-0019')return new DianaEye55ProcessSimulation(machine,template);
 if(k==='BMJ-MCH-0020')return new SharkN650ProcessSimulation(machine,template);
 if(k==='BMJ-MCH-0024')return new UpgLy300ProcessSimulation(machine,template);
 if(isReferenceMachineKey(k))return new ReferenceProcessSimulation(machine,template);
 if(universalMachineConfig(k))return new UniversalProcessSimulation(machine,template);
 throw new Error(`Simulasi untuk ${k} belum tersedia.`);
}
