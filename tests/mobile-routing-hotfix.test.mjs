import test from'node:test';
import assert from'node:assert/strict';
import fs from'node:fs';
const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');
const engine=fs.readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');

test('mobile factory detail binds every routing action through the collection selector',()=>{
 assert.doesNotMatch(app,/data-routing-focus/);
 assert.match(app,/Scope berbasis bukti/);
});

test('user toast never exposes raw JavaScript exception text',()=>{
 assert.match(app,/console\.error\('\[Digital Twin UI\]',e\)/);
 assert.match(app,/Tindakan belum dapat dijalankan\. Silakan coba kembali\./);
 assert.doesNotMatch(app,/const safe=fn=>[\s\S]{0,140}toast\(e\.message,true\)/);
});

test('HTML requests the cache-busted fixed controller',()=>{
 assert.match(html,/src\/app\.js\?v=217/);
});


test('mobile 2D/3D switch remains compact without restoring the full-height strip',()=>{
 assert.match(css,/V215 runtime recovery/);
 assert.match(css,/\.viewport-mode-switch\{[\s\S]{0,320}top:8px!important;right:8px!important;bottom:auto!important/);
 assert.match(css,/max-height:44px!important/);
});

test('mobile renderer uses a lightweight factory proxy and disables interactive taxonomy overlays',()=>{
 assert.match(engine,/function buildLowDetailFactory\(layout,fleet\)/);
 assert.match(engine,/this\.actualFactory=this\.low\?buildLowDetailFactory\(l,l\.fleet\):buildActualFactory\(l,l\.fleet\)/);
 assert.match(engine,/matchMedia\('\(max-width:767px\)'\)\.matches/);
 assert.match(engine,/antialias:!mobileRender/);
 assert.match(engine,/this\.renderFaulted=true/);
 assert.match(css,/\.part-label-layer\{display:none!important;pointer-events:none!important\}/);
});
