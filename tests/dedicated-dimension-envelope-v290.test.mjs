import test from 'node:test';
import assert from 'node:assert/strict';
import {auditDedicatedDimensionEnvelopes} from '../scripts/audit-dedicated-dimensions.mjs';

test('V290 documented/model-reference dedicated envelopes stay within evidence-aware scale bounds',()=>{
 const report=auditDedicatedDimensionEnvelopes();
 assert.equal(report.total,10);
 assert.equal(report.failed,0,JSON.stringify(report.failures,null,2));
 assert.equal(report.passed,10);
 assert.ok(report.machines.every(row=>row.reference.length===3&&row.modeled.length===3&&row.ratios.length===3));
});
