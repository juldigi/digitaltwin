import test from 'node:test';
import assert from 'node:assert/strict';
import {auditSimulationStageDiversity} from '../scripts/audit-simulation-stages.mjs';

test('V287 all runnable machine simulations expose real stage transitions',()=>{
 const report=auditSimulationStageDiversity();
 assert.equal(report.total,41);
 assert.equal(report.runnable,40);
 assert.equal(report.blocked,1);
 assert.equal(report.failed,0,JSON.stringify(report.failures,null,2));
 assert.equal(report.passed,41);
 assert.ok(report.machines.filter(row=>!row.blocked).every(row=>row.stageCount>=2));
});
