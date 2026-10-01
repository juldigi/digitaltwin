import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditSemanticClickThrough} from '../scripts/audit-semantic-clickthrough-v313.mjs';

const engine=readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');

test('V313 all 41 machines retain semantic click targets and active mechanisms never become click-through',()=>{
 const report=auditSemanticClickThrough();
 assert.equal(report.total,41);
 assert.equal(report.failed,0,JSON.stringify(report.failures,null,2));
 assert.equal(report.passed,41);
 assert.ok(report.machines.every(row=>row.semanticTargets>0));
 assert.ok(report.machines.every(row=>row.activeMissing.length===0));
});

test('V313 machine canvas walks visible ray hits until taxonomy-safe resolvePart returns a component',()=>{
 assert.match(engine,/const hits=this\.ray\.intersectObject\(this\.machine,true\)\.filter/);
 assert.match(engine,/for\(const hit of hits\)\{const part=this\.template\.resolvePart\(hit\.object\);if\(part\)\{this\.onSelect\(part\);break;\}\}/);
 assert.doesNotMatch(engine,/const hit=this\.ray\.intersectObject\(this\.machine,true\)\.find/);
});
