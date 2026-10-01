import test from 'node:test';
import assert from 'node:assert/strict';
import {auditDedicatedDimensionEnvelopes} from '../scripts/audit-dedicated-dimensions.mjs';

test('V292 documented/model-reference dedicated envelopes stay within evidence-aware scale bounds',()=>{
 const report=auditDedicatedDimensionEnvelopes();
 assert.equal(report.total,10);
 assert.equal(report.failed,0,JSON.stringify(report.failures,null,2));
 assert.equal(report.passed,10);
 const shark=report.machines.find(row=>row.id==='BMJ-MCH-0020');
 const upg=report.machines.find(row=>row.id==='BMJ-MCH-0024');
 assert.ok(shark&&upg);
 assert.ok(shark.ratios.every(r=>r>=.60&&r<=1.55),JSON.stringify(shark,null,2));
 assert.ok(upg.ratios.every(r=>r>=.70&&r<=1.45),JSON.stringify(upg,null,2));
});
