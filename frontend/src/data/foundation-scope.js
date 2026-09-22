// Master-prompt foundation scope.
// Phase-1 keeps the complete CAD-derived factory context, but only OFFSET 5 is
// exposed as a full technical 3D asset. Other registered assets remain searchable
// and selectable as spatial/layout placeholders until the expansion phase is unlocked.
export const FOUNDATION_SCOPE=Object.freeze({
  release:'V158',
  phase:'DWG_FACTORY_FOUNDATION',
  primaryMachineId:'BMJ-MCH-0003',
  primaryRoute:'offset5',
  primaryAssetName:'OFFSET 5',
  expansionMode:'LAYOUT_PLACEHOLDERS_ONLY',
  showUtilitySystems:false,
  exposePlaceholderTechnicalMetadata:false,
  indexUtilitySystemsInSearch:false
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
  if(!key)return FOUNDATION_SCOPE.primaryMachineId;
  return LEGACY_ROUTE_TO_ID[key]||key;
}

export function isFoundationPrimary(value){
  return foundationMachineId(value)===FOUNDATION_SCOPE.primaryMachineId;
}

export function canOpenTechnical3D(value){
  return isFoundationPrimary(value);
}

export function scopedRegistryHas3D(machine){
  return Boolean(machine?.has3D)&&isFoundationPrimary(machine);
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
  const primary=isFoundationPrimary(machine);
  return Object.freeze({
    machineId:foundationMachineId(machine),
    mode:primary?'PRIMARY_TECHNICAL_ASSET':'LAYOUT_PLACEHOLDER',
    canOpenTechnical3D:primary,
    canUseSimulation:primary,
    canBrowseComponents:primary,
    positionStatus:foundationPositionStatus(placement),
    detailStatus:primary?'TECHNICAL_3D_ENABLED':'TECHNICAL_3D_LOCKED_UNTIL_EXPANSION'
  });
}
