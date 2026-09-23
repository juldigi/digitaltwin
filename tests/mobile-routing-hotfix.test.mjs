import test from'node:test';
import assert from'node:assert/strict';
import fs from'node:fs';
const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');

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
 assert.match(html,/src\/app\.js\?v=192/);
});
