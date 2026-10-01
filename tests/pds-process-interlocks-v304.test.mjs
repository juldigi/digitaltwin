import test from 'node:test';
import assert from 'node:assert/strict';
import {auditPdsProcessInterlocks} from '../scripts/audit-pds-process-interlocks.mjs';

test('V304 PDS and blanker process actions never outrun modeled permits and interlocks',()=>{
 const report=auditPdsProcessInterlocks();
 assert.equal(report.targets,5);
 assert.equal(report.violationCount,0,JSON.stringify(report.violations,null,2));
 const byId=new Map(report.rows.map(row=>[row.machineId,row]));
 assert.ok(byId.get('BMJ-MCH-0021').observed.includes('pressing'));
 assert.ok(byId.get('BMJ-MCH-0021').observed.includes('separation'));
 for(const id of ['BMJ-MCH-0025','BMJ-MCH-0026']){
  assert.ok(byId.get(id).observed.includes('exposure'),id);
  assert.ok(byId.get(id).observed.includes('unload'),id);
 }
 assert.ok(byId.get('BMJ-MCH-0027').observed.includes('exposure'));
 assert.ok(byId.get('BMJ-MCH-0027').observed.includes('cutting'));
 assert.ok(byId.get('BMJ-MCH-0028').observed.includes('vacuum'));
 assert.ok(byId.get('BMJ-MCH-0028').observed.includes('axis'));
});
