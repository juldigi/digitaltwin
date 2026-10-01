import test from 'node:test';
import assert from 'node:assert/strict';
import {auditMachineNodeIdentity} from '../scripts/audit-machine-node-identity.mjs';

test('V313 every machine has unique 3D node ids and unambiguous taxonomy mesh references',()=>{
 const report=auditMachineNodeIdentity();
 assert.equal(report.total,41);
 assert.equal(report.failed,0,JSON.stringify(report.failures,null,2));
 assert.equal(report.passed,41);
 assert.ok(report.machines.every(row=>row.nodeIds>0));
 assert.ok(report.machines.every(row=>row.duplicateIds.length===0));
 assert.ok(report.machines.every(row=>row.ambiguousMappedRefs.length===0));
 assert.ok(report.machines.every(row=>row.unresolvedMappedRefs.length===0));
});
