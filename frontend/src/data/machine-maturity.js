export const LEGACY_MACHINE_ID_BY_ROUTE=Object.freeze({
 offset5:'BMJ-MCH-0003',
 sheeting:'BMJ-MCH-0002',
 offset10:'BMJ-MCH-0009',
 apm2:'BMJ-MCH-0010'
});

export const DEDICATED_MACHINE_IDS=Object.freeze([
 'BMJ-MCH-0001','BMJ-MCH-0002','BMJ-MCH-0003','BMJ-MCH-0005','BMJ-MCH-0006',
 'BMJ-MCH-0007','BMJ-MCH-0008','BMJ-MCH-0009','BMJ-MCH-0010','BMJ-MCH-0011',
 'BMJ-MCH-0012','BMJ-MCH-0013','BMJ-MCH-0014','BMJ-MCH-0015','BMJ-MCH-0016',
 'BMJ-MCH-0018','BMJ-MCH-0019','BMJ-MCH-0020','BMJ-MCH-0022','BMJ-MCH-0024'
]);

const DEDICATED_SET=new Set(DEDICATED_MACHINE_IDS);

export function canonicalMachineId(value){
 const raw=typeof value==='object'?value?.machineId:String(value??'').trim();
 return raw?(LEGACY_MACHINE_ID_BY_ROUTE[raw]||raw):null;
}

export function isDedicatedMachineMaturity(value){
 const id=canonicalMachineId(value);
 return Boolean(id&&DEDICATED_SET.has(id));
}
