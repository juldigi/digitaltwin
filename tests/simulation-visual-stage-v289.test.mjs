import test from 'node:test';
import assert from 'node:assert/strict';
import {auditSimulationVisualStageSemantics} from '../scripts/audit-simulation-visual-stages.mjs';

test('V289 every runnable simulation changes the rendered machine state across process stages',()=>{
 const report=auditSimulationVisualStageSemantics();
 assert.equal(report.total,41);
 assert.equal(report.runnable,40);
 assert.equal(report.blocked,1);
 assert.equal(report.failed,0,JSON.stringify(report.failures,null,2));
 assert.equal(report.passed,41);
 assert.ok(report.machines.filter(row=>!row.blocked).every(row=>row.stageSamples>=2));
 assert.ok(report.machines.filter(row=>!row.blocked).every(row=>row.visualSignatures>=2));
});
