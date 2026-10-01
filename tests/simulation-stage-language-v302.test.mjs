import test from 'node:test';
import assert from 'node:assert/strict';
import {auditSimulationStageLanguage} from '../scripts/audit-simulation-stage-language.mjs';
import {readableSimulationStage} from '../frontend/src/display-language.js';

test('V302 all runtime simulation stages are user-facing Indonesian or accepted technical wording',()=>{
 const report=auditSimulationStageLanguage();
 assert.equal(report.machines,40);
 assert.ok(report.stages>=80,'expected at least two runtime stages per runnable machine');
 assert.equal(report.issueCount,0,JSON.stringify(report.issues,null,2));
});


test('V302 representative corrected stages stay Indonesia-first while retaining technical terms',()=>{
 assert.equal(readableSimulationStage('Load / float stock on air table'),'Memuat material dan mengapungkan tumpukan di air table');
 assert.match(readableSimulationStage('synchronize drum encoder and permit HEIDELBERG thermal-laser exposure only after register/clamp interlocks are true'),/^Menyinkronkan encoder drum/);
 assert.match(readableSimulationStage('load roll media while supply-roll braking establishes controlled web feed'),/^Memuat roll media/);
 assert.match(readableSimulationStage('apply vacuum hold-down using model-specific zone/distribution system'),/^Mengaktifkan vacuum hold-down/);
 assert.match(readableSimulationStage('admit / mix return and outdoor air'),/^Memasukkan dan mencampur/);
 assert.match(readableSimulationStage('distribute conditioned supply air / return reference while outdoor condenser rejects heat'),/^Mendistribusikan udara supply terkondisi/);
});
