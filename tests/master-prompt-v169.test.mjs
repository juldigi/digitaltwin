import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const app=read('../frontend/src/app.js');
const sw=read('../frontend/sw.js');

test('V169 reference-card activation always uses the collection selector',()=>{
 assert.match(app,/const activateReferenceCard=card=>[\s\S]*?\$\$\('\[data-reference-card\]'\)\.forEach/);
 assert.match(app,/\n \$\$\('\[data-reference-card\]'\)\.forEach\(card=>/);
 assert.doesNotMatch(app,/^\s*\$\([^)]*\)\.forEach/m);
});

test('V169 preserves keyboard reference interaction after the selector hotfix',()=>{
 assert.match(app,/card\.onkeydown=event=>/);
 assert.match(app,/event\.key==='Enter'\|\|event\.key===' '/);
 assert.match(app,/x\.setAttribute\('aria-pressed',String\(active\)\)/);
});

test('V169 runtime is cache-busted on previously loaded V168 clients',()=>{
 assert.match(html,/src\/app\.js\?v=169/);
 assert.match(sw,/factory-digital-twin-v169-reference-card-selector-20260923/);
});
