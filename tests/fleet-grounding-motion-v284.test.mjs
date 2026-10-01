import test from 'node:test';
import assert from 'node:assert/strict';
import {auditMachineGroundingAndMotion} from '../scripts/audit-machine-grounding.mjs';

test('V284 all 41 machines stay grounded and simulation motion remains inside a bounded machine envelope',()=>{
 const report=auditMachineGroundingAndMotion();
 assert.equal(report.total,41);
 assert.equal(report.machines.length,41);
 assert.equal(report.failed,0,JSON.stringify(report.failures,null,2));
 assert.equal(report.passed,41);
 assert.ok(report.machines.every(row=>row.staticMinY<=.25&&row.staticMinY>=-.5));
 assert.ok(report.machines.filter(row=>!row.blocked).every(row=>row.maxOverflow<=.001));
 assert.ok(report.machines.every(row=>row.maxBelow<=.55));
});
