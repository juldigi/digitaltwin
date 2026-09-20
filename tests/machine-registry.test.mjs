import test from 'node:test';
import assert from 'node:assert/strict';
import {MACHINE_REGISTRY,MACHINE_REGISTRY_BY_ID,MACHINE_REGISTRY_STATS,searchMachines} from '../frontend/src/data/machine-registry.js';

test('machine master registry contains 41 unique equipment records',()=>{
  assert.equal(MACHINE_REGISTRY.length,41);
  assert.equal(new Set(MACHINE_REGISTRY.map(m=>m.machineId)).size,41);
  assert.equal(MACHINE_REGISTRY_BY_ID.size,41);
  assert.deepEqual(MACHINE_REGISTRY.map(m=>m.no),Array.from({length:41},(_,i)=>i+1));
});

test('machine master registry preserves the plant area totals',()=>{
  assert.equal(MACHINE_REGISTRY_STATS.total,41);
  assert.deepEqual(MACHINE_REGISTRY_STATS.byArea,{
    'OFFSET PRINTING':9,
    'OFFSET CONVERTING':15,
    PDS:4,
    UTILITY:13
  });
});

test('all database equipment have a confidence-aware 3D route while three flagship twins stay exact',()=>{
  const offset5=MACHINE_REGISTRY.find(m=>m.sapCode==='OFU-1');
  assert.ok(offset5);
  assert.equal(offset5.model,'CD 102-8+L');
  assert.equal(offset5.has3D,true);
  assert.equal(MACHINE_REGISTRY_STATS.modeled3D,41);

  const offset10=MACHINE_REGISTRY.find(m=>m.name==='OFFSET - 10 MACHINE');
  assert.ok(offset10);
  assert.equal(offset10.no,9);
  assert.equal(offset10.area,'OFFSET PRINTING');
  assert.equal(offset10.model,'CX104-2+LY-8+LY-1+L UV + FoilStar');
  assert.equal(offset10.has3D,true);
  assert.equal(offset10.serial,null);
  assert.equal(offset10.functionalLocation,null);
  assert.equal(offset10.sapCode,null);
  assert.equal(offset10.year,null);
  assert.equal(offset10.source,'OFFICIAL_DOCUMENTS');
  assert.match(offset10.note,/final drawing Heidelberg/i);

  const apm2=MACHINE_REGISTRY.find(m=>m.sapCode==='APM-2');
  assert.ok(apm2);
  assert.equal(apm2.no,10);
  assert.equal(apm2.area,'OFFSET CONVERTING');
  assert.equal(apm2.model,'SP 102');
  assert.equal(apm2.serial,'57115506');
  assert.equal(apm2.functionalLocation,'PC-PK2-CON-AUT-AUTOPLAT02');
  assert.equal(apm2.year,1994);
  assert.equal(apm2.has3D,true);
  assert.match(apm2.source,/EXCEL/);
  assert.match(apm2.note,/suffix E\/SE\/CER\/BMA/i);
});
test('source data quality issues are preserved rather than silently rewritten',()=>{
  const plt1=MACHINE_REGISTRY.filter(m=>m.sapCode==='PLT-1');
  assert.equal(plt1.length,2,'duplicate SAP Code PLT-1 must remain flagged until SAP is confirmed');
  assert.ok(plt1.every(m=>/validasi SAP/i.test(m.note)));
  const shared=MACHINE_REGISTRY.filter(m=>m.functionalLocation==='PC-PK2-CON-PLT');
  assert.equal(shared.length,3);
  assert.equal(MACHINE_REGISTRY.find(m=>m.name==='FOLDER GLUER - 2 MACHINE').sapCode,'FGM-2');
});

test('machine search covers name, code, model, functional location and area',()=>{
  assert.equal(searchMachines('offset 10')[0].name,'OFFSET - 10 MACHINE');
  assert.equal(searchMachines('APM-7')[0].name,'AUTOPLATEN - 7 STRIPPING & BLANKING');
  assert.equal(searchMachines('CX 104-8+LYYL')[0].name,'OFFSET - 8 MACHINE');
  assert.equal(searchMachines('00PREPRESS-CTP2')[0].sapCode,'CTP-2');
  assert.equal(searchMachines('UTILITY').length,13);
});
