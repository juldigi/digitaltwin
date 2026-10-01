import test from 'node:test';
import assert from 'node:assert/strict';
import {auditTaxonomyClickResolution} from '../scripts/audit-taxonomy-click-resolution.mjs';

test('V307 all 41 machine taxonomies resolve modeled units and clickable mapped geometry consistently',()=>{
 const report=auditTaxonomyClickResolution();
 assert.equal(report.total,41);
 assert.equal(report.failed,0,JSON.stringify(report.failures,null,2));
 assert.equal(report.passed,41);
 assert.ok(report.machines.every(row=>row.resolvable>0));
});
