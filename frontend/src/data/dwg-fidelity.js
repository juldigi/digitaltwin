// DWG fidelity ledger for the master-prompt factory foundation.
// The ledger is intentionally conservative: normalized extraction counts are not
// treated as a one-to-one copy of raw CAD entities unless the source proves that.
const list=value=>Array.isArray(value)?value:[];
const finite=value=>Number.isFinite(value)?value:null;
const countBatchSegments=batches=>list(batches).reduce((sum,batch)=>sum+(Array.isArray(batch?.points)?Math.floor(batch.points.length/4):0),0);

export function buildDwgFidelityLedger(layout){
  if(!layout)return Object.freeze({
    status:'SOURCE_MISSING',
    sourceFile:'UNKNOWN',
    sourceEntityCount:null,
    sourceLayerCount:null,
    referenceSegmentCount:0,
    semantic3DCounts:Object.freeze({floor:0,walls:0,columns:0,doors:0,openings:0,labels:0}),
    preservation:'UNKNOWN',
    reviewRequired:true,
    unimplemented:Object.freeze([{entityType:'UNKNOWN',semanticType:'UNKNOWN',threeDStatus:'NOT_IMPLEMENTED',count:null,reason:'DWG layout is not loaded.'}])
  });

  const source=layout.source||{},actual=layout.actual||{},audit=layout.audit||{};
  const sourceFile=source.file||source.derivedFile||'UNKNOWN';
  const sourceEntityCount=finite(source.entityCount);
  const sourceLayerCount=finite(source.layerCount);
  const referenceSegmentCount=countBatchSegments(layout.referenceBatches);
  const semantic3DCounts=Object.freeze({
    floor:actual&&Object.keys(actual).length?1:0,
    walls:list(actual.walls).length,
    columns:list(actual.columns).length,
    doors:list(actual.doors).length,
    openings:list(actual.openings).length+list(actual.curtains).length,
    labels:list(actual.labels).length
  });

  const unsupported=[...new Set([
    ...list(source.unsupportedEntityTypes),
    ...list(audit.deepDiveUnsupportedTypes)
  ].map(String).filter(Boolean))];

  const unimplemented=unsupported.length
    ?unsupported.map(entityType=>Object.freeze({
      entityType,
      semanticType:'UNKNOWN',
      threeDStatus:'NOT_IMPLEMENTED',
      count:null,
      reason:'Entity type is retained in the extraction audit but is not promoted to physical 3D geometry without semantic evidence.'
    }))
    :[Object.freeze({
      entityType:'SOURCE ENTITY CLASSES NOT ENUMERATED BY PACKED EXTRACTOR',
      semanticType:'UNKNOWN',
      threeDStatus:'NOT_IMPLEMENTED',
      count:null,
      reason:'The packed factory baseline contains normalized geometry, labels and source identity, but does not expose a complete per-type raw-entity ledger. Coverage must not be interpreted as 100%.'
    })];

  const transform=Object.freeze({
    sourceUnits:layout.transform?.sourceUnits||source.sourceUnits||'UNKNOWN',
    targetUnits:'meter',
    scale:finite(layout.transform?.scale),
    rotation:finite(layout.transform?.rotation),
    originX:finite(layout.transform?.originX),
    originY:finite(layout.transform?.originY),
    axisMap:'DWG X → THREE X · DWG Y → THREE Z · THREE Y → ELEVATION',
    displayFlipY:layout.displayTransform?.flipY===true
  });

  const preservation=sourceEntityCount===null
    ?'PARTIAL / SOURCE COUNT UNKNOWN'
    :'PARTIAL / NORMALIZED EXTRACTION';

  return Object.freeze({
    status:'AUDITABLE_PARTIAL',
    sourceFile,
    derivedFile:source.derivedFile||'UNKNOWN',
    sourceHash:source.sha256||'UNKNOWN',
    derivedHash:source.derivedSha256||'UNKNOWN',
    sourceEntityCount,
    sourceLayerCount,
    sourceBlockCount:finite(source.blockCount),
    referenceSegmentCount,
    semantic3DCounts,
    transform,
    preservation,
    reviewRequired:true,
    sourcePreserved:true,
    rawEntityParityClaim:false,
    unimplemented:Object.freeze(unimplemented),
    note:'DWG remains the spatial source of truth. Normalized extraction is auditable, but raw CAD entity parity is not claimed unless explicitly proven.'
  });
}

export function dwgObjectSourceMetadata(layout,{sourceType='DWG',semantic='UNKNOWN',sourceLayer='UNKNOWN',sourceEntityId='UNKNOWN',sourceHandles=null,confidence='UNVERIFIED',renderStatus='3D'}={}){
  const sourceFile=layout?.source?.file||layout?.source?.derivedFile||'UNKNOWN';
  const handles=list(sourceHandles).filter(Boolean);
  return Object.freeze({
    sourceType:sourceType||'DWG',
    sourceLayer:sourceLayer||'UNKNOWN',
    sourceEntityId:sourceEntityId||handles[0]||'UNKNOWN',
    sourceHandles:handles,
    sourceFile,
    confidence:confidence||'UNVERIFIED',
    semantic,
    renderStatus
  });
}
