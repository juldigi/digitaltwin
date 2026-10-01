import test from 'node:test';
import assert from 'node:assert/strict';
import {auditSimulationStageLanguage} from '../scripts/audit-simulation-stage-language.mjs';

test('V302 all runtime simulation stages are user-facing Indonesian or accepted technical wording',()=>{
 const report=auditSimulationStageLanguage();
 assert.equal(report.machines,40);
 assert.ok(report.stages>=80,'expected at least two runtime stages per runnable machine');
 assert.equal(report.issueCount,0,JSON.stringify(report.issues,null,2));
});
