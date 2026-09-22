// Master-prompt truth layer.
// Keeps source, confidence and verification language explicit so visual readiness
// is never confused with engineering verification.
export const TRUTH_STATUSES=Object.freeze([
  'VERIFIED',
  'HIGH CONFIDENCE',
  'MEDIUM CONFIDENCE',
  'ESTIMATED',
  'UNKNOWN',
  'UNVERIFIED',
  'APPROXIMATE',
  'CONFLICTING'
]);

const U=value=>String(value??'').trim().toUpperCase();

export function truthStatus(value,fallback='UNKNOWN'){
  const token=U(value);
  if(TRUTH_STATUSES.includes(token))return token;
  if(token.includes('CONFLICT'))return 'CONFLICTING';
  if(token.includes('APPROX'))return 'APPROXIMATE';
  if(token.includes('ESTIMAT'))return 'ESTIMATED';
  if(token.includes('UNVERIF')||token.includes('BELUM TERVERIFIKASI'))return 'UNVERIFIED';
  if(token.includes('HIGH'))return 'HIGH CONFIDENCE';
  if(token.includes('MEDIUM'))return 'MEDIUM CONFIDENCE';
  if(token.includes('VERIFIED')||token.includes('TERVERIFIKASI'))return 'VERIFIED';
  return fallback;
}

export function positionVerification(placement){
  const status=U(placement?.status);
  if(status==='DXF_FOOTPRINT')return 'DWG-VERIFIED';
  if(status==='USER-CONFIRMED')return 'USER-CONFIRMED';
  if(['DXF_LABEL','DXF_ZONE','DXF_ROOM','ANNOTATION'].includes(status))return 'APPROXIMATE';
  return 'UNKNOWN';
}

export function layoutTruth(layout){
  if(!layout)return Object.freeze({
    source:'UNKNOWN',sourceFile:'UNKNOWN',sourceUnits:'UNKNOWN',scale:'UNKNOWN',
    planGeometry:'UNKNOWN',elevation:'UNKNOWN',position:'UNKNOWN'
  });
  const source=layout.source||{},transform=layout.transform||{},audit=layout.audit||{};
  const unitEvidence=U(source.unitStatus||transform.sourceUnits);
  const scale=unitEvidence.includes('CONFLICT')?'CONFLICTING':transform.scale==null?'UNKNOWN':truthStatus(transform.calibration?.confidence,'HIGH CONFIDENCE');
  const sourceFile=source.file||source.derivedFile||'UNKNOWN';
  const planGeometry=layout.baselineId?'HIGH CONFIDENCE':'UNVERIFIED';
  const elevation=/elevasi.*perkiraan|height.*approx/i.test(String(audit.sourceFinding||''))?'APPROXIMATE':'UNKNOWN';
  return Object.freeze({
    source:sourceFile==='UNKNOWN'?'UNKNOWN':'DWG',
    sourceFile,
    sourceUnits:transform.sourceUnits||source.sourceUnits||'UNKNOWN',
    scale,
    planGeometry,
    elevation,
    position:layout.positionStatus||'UNKNOWN'
  });
}

export function assetTruth(asset,{placement=null,sourceCount=0}={}){
  const a=asset||{};
  return Object.freeze({
    operatingStatus:truthStatus(a.status,'UNKNOWN'),
    healthScore:Number.isFinite(a.health_score)?String(a.health_score):'UNKNOWN',
    source3D:'PROCEDURAL / RECONSTRUCTED',
    detail3D:'PARTIAL / APPROXIMATE',
    dataConfidence:truthStatus(a.data_confidence,'UNVERIFIED'),
    discoveryStatus:a.discovery_status||'UNKNOWN',
    position:positionVerification(placement),
    sourceCount:Number.isFinite(sourceCount)?sourceCount:0
  });
}

export function connectionTruth({online=true,cached=false,connected=false}={}){
  if(!online)return cached?'OFFLINE / CACHED DATA':'OFFLINE / MODE LOKAL';
  if(cached&&!connected)return 'CACHED DATA';
  return connected?'DATA TERSAMBUNG':'MODE LOKAL';
}
