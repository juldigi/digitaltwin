// Keep the CAD-derived factory context and expose registry-backed 3D models.
// Their evidence limits remain attached to each machine record and model.
import {MACHINE_REGISTRY_BY_ID} from './machine-registry.js';
export const FOUNDATION_SCOPE=Object.freeze({
  release:'V162',
  phase:'DWG_FACTORY_FOUNDATION',
  defaultMachineId:null,
  defaultRoute:null,
  referenceMachineId:'BMJ-MCH-0003',
  referenceRoute:'offset5',
  referenceAssetName:'OFFSET 5',
  expansionMode:'EVIDENCE_GATED_CONTEXT',
  showUtilitySystems:true,
  exposePlaceholderTechnicalMetadata:false,
  indexUtilitySystemsInSearch:true
});

const LEGACY_ROUTE_TO_ID=Object.freeze({
  offset5:'BMJ-MCH-0003',
  sheeting:'BMJ-MCH-0002',
  offset10:'BMJ-MCH-0009',
  apm2:'BMJ-MCH-0010'
});

export function foundationMachineId(value){
  if(value&&typeof value==='object')return value.machineId||value.asset_id||value.assetId||null;
  const key=String(value??'').trim();
  if(!key)return FOUNDATION_SCOPE.defaultMachineId;
  return LEGACY_ROUTE_TO_ID[key]||key;
}

export function isFoundationPrimary(value){
  return foundationMachineId(value)===FOUNDATION_SCOPE.referenceMachineId;
}

export function canOpenTechnical3D(value){
  const id=foundationMachineId(value);
  return Boolean(MACHINE_REGISTRY_BY_ID.get(id)?.has3D);
}

export function scopedRegistryHas3D(machine){
  return Boolean(machine?.has3D);
}

export function foundationPositionStatus(placement){
  const status=String(placement?.status||'UNIDENTIFIED').toUpperCase();
  if(status==='UNIDENTIFIED')return 'POSITION REVIEW REQUIRED';
  if(status==='DXF_FOOTPRINT')return 'CAD FOOTPRINT';
  if(status==='DXF_LABEL')return 'CAD LABEL';
  if(status==='DXF_ZONE')return 'CAD ZONE';
  if(status==='DXF_ROOM')return 'CAD ROOM';
  if(status==='ANNOTATION')return 'SOURCE ANNOTATION / REVIEW';
  return status||'POSITION REVIEW REQUIRED';
}

export function foundationAssetPolicy(machine,placement=null){
  const primary=canOpenTechnical3D(machine);
  return Object.freeze({
    machineId:foundationMachineId(machine),
    mode:primary?'TECHNICAL_ASSET':'LAYOUT_PLACEHOLDER',
    canOpenTechnical3D:primary,
    canUseSimulation:primary,
    canBrowseComponents:primary,
    positionStatus:foundationPositionStatus(placement),
    detailStatus:primary?'TECHNICAL_3D_ENABLED':'TECHNICAL_3D_UNAVAILABLE'
  });
}
