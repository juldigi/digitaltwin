import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditSemanticCanvasClickResolution} from '../scripts/audit-semantic-canvas-click-v313.mjs';

const engine=readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');
const semantic=readFileSync(new URL('../frontend/src/semantic-selection.js',import.meta.url),'utf8');

test('V313 all 41 machines expose taxonomy-backed semantic click targets and no active mechanism becomes click-through',()=>{
 const report=auditSemanticCanvasClickResolution();
 assert.equal(report.total,41);
 assert.equal(report.failed,0,JSON.stringify(report.failures,null,2));
 assert.equal(report.passed,41);
 assert.ok(report.machines.every(row=>row.semanticTargets>0));
 assert.ok(report.machines.every(row=>row.activeClickThrough===0));
});

test('V313 semantic resolver only returns ancestors explicitly referenced by taxonomy',()=>{
 assert.match(semantic,/new Set\(\(template\.taxonomy\|\|\[\]\)\.flatMap\(node=>node\.meshRefs\|\|\[\]\)\.filter\(Boolean\)\)/);
 assert.match(semantic,/for\(let node=object;node&&node!==template\.root;node=node\.parent\)/);
 assert.match(semantic,/if\(id&&refs\.has\(id\)\)return node/);
});

test('V313 machine canvas raycast skips visual-only overlays and selects the first semantic hit behind them',()=>{
 assert.match(engine,/const hits=this\.ray\.intersectObject\(this\.machine,true\)\.filter/);
 assert.match(engine,/for\(const hit of hits\)\{const part=resolveSemanticMachinePart\(this\.template,hit\.object\);if\(part\)\{this\.onSelect\(part\);break;\}\}/);
 assert.doesNotMatch(engine,/const part=this\.template\.resolvePart\(hit\.object\);if\(part\)this\.onSelect\(part\)/);
});
