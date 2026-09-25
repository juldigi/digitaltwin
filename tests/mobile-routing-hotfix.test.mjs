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
 assert.match(html,/src\/app\.js\?v=213/);
});


test('mobile 2D/3D switch cannot stretch into a full-height white strip',()=>{
 assert.match(css,/V213 mobile viewport hotfix/);
 assert.match(css,/\.viewport-mode-switch\{[\s\S]{0,260}top:8px!important;bottom:auto!important/);
 assert.match(css,/max-height:44px!important/);
});

test('mobile taxonomy labels are styled overlays and bounded away from fixed controls',()=>{
 for(const selector of ['.part-label-layer{','.part-label{','.part-label-nav{'])assert.ok(css.includes(selector),selector);
 assert.match(engine,/limit=mobile\?4:16/);
 assert.match(engine,/topSafe=mobile\?112:52/);
 assert.match(engine,/bottomSafe=mobile\?118:16/);
});
