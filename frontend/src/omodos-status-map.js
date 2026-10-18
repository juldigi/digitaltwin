const normalizeCode=value=>String(value??'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'');
const normalizeName=value=>String(value??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\b(machine|mesin)\b/g,' ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');

/**
 * Resolve one OMODOS status row to one DigitalTwin machine without guessing.
 * Duplicate SAP codes are resolved by an exact normalized name; ambiguous
 * records deliberately return null so the UI can show "Belum tertaut".
 */
export function mapOmodosMachineStatus(machine,statuses=[],twinMachines=[],placementLabel=''){
  if(!machine||!Array.isArray(statuses))return null;
  const rows=statuses.filter(row=>row&&typeof row==='object');
  const machineId=normalizeCode(machine.machineId);
  const direct=rows.filter(row=>normalizeCode(row.twinMachineId||row.machineId)===machineId);
  if(direct.length===1)return direct[0];
  const targetCode=normalizeCode(machine.sapCode);
  const matchingCode=targetCode?rows.filter(row=>normalizeCode(row.code)===targetCode):[];
  const duplicateTwinCode=targetCode&&Array.isArray(twinMachines)
    ?twinMachines.filter(row=>normalizeCode(row.sapCode)===targetCode).length>1
    :false;
  if(matchingCode.length===1&&!duplicateTwinCode)return matchingCode[0];
  const targetNames=new Set([machine.name,placementLabel,machine.sapCode,machine.machineId].map(normalizeName).filter(Boolean));
  const exactName=rows.filter(row=>targetNames.has(normalizeName(row.name)));
  if(exactName.length===1)return exactName[0];
  const exactCodeAndName=matchingCode.filter(row=>targetNames.has(normalizeName(row.name)));
  if(exactCodeAndName.length===1)return exactCodeAndName[0];
  return null;
}
