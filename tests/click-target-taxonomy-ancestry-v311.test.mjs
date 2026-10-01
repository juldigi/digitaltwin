import test from 'node:test';
import assert from 'node:assert/strict';
import {auditClickTargetTaxonomyAncestry} from '../scripts/audit-click-target-taxonomy-ancestry.mjs';

test('V311 every selectable 3D click target has an exact or ancestor taxonomy context across all 41 machines',()=>{
 const report=auditClickTargetTaxonomyAncestry();
 assert.equal(report.total,41);
 assert.equal(report.failed,0,JSON.stringify(report.failures,null,2));
 assert.equal(report.passed,41);
 assert.ok(report.machines.every(row=>row.clickTargets>0));
});
