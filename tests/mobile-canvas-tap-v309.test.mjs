import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const engine=readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');

test('V309 canvas selection uses a larger bounded tap tolerance for touch than mouse',()=>{
 assert.match(engine,/down\.pointerType==='touch'\?12:6/);
 assert.doesNotMatch(engine,/Math\.hypot\(e\.clientX-this\.down\[0\],e\.clientY-this\.down\[1\]\)>5/);
});

test('V309 multi-touch and mismatched pointers cannot become accidental part selections',()=>{
 assert.match(engine,/pointerdown',e=>\{if\(!e\.isPrimary\)\{this\.down=null;return;\}/);
 assert.match(engine,/pointerId:e\.pointerId/);
 assert.match(engine,/!e\.isPrimary\|\|e\.pointerId!==down\.pointerId/);
});

test('V309 pointer gesture state is cleared on cancel and before pointer-up selection work',()=>{
 assert.match(engine,/pointercancel',\(\)=>\{this\.down=null;\}/);
 assert.match(engine,/pointerup',e=>\{const down=this\.down;this\.down=null;/);
});

test('V309 tap hardening preserves simulation, gizmo and raycast selection guards',()=>{
 assert.match(engine,/this\.gizmo\.dragging\|\|this\.simulation\?\.active/);
 assert.match(engine,/this\.ray\.setFromCamera/);
 assert.match(engine,/const part=this\.template\.resolvePart\(hit\.object\);if\(part\)this\.onSelect\(part\)/);
});
