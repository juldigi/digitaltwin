import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const engine=readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');
const sheeting=readFileSync(new URL('../frontend/src/simulation-sheeting.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('missing simulation is explicit unavailable instead of fake feeder-ready state',()=>{
 assert.match(engine,/available:false,blocked:true,blockedReason:'Simulasi belum tersedia untuk aset ini\.'/);
 assert.match(engine,/stage:null/);
});
test('sheeting pause and resume cannot activate an inactive simulation',()=>{
 assert.match(sheeting,/pause\(\)\{if\(this\.active\)\{this\.running=false;this\.lastNow=null;/);
 assert.match(sheeting,/resume\(\)\{if\(this\.active\)\{this\.running=true;this\.lastNow=null;/);
});
test('sheeting control mutations publish state to the shell',()=>{
 assert.match(sheeting,/setSpeed\(v\).*this\.onUpdate\?\.\(this\.state\(\)\)/);
 assert.match(sheeting,/setPathVisible\(v\).*this\.onUpdate\?\.\(this\.state\(\)\)/);
});
test('V189 release identifiers are coherent',()=>{
 assert.match(index,/app-shell-v79\.css\?v=192/);
 assert.match(index,/src\/app\.js\?v=192/);
 assert.match(index,/src\/app-shell-v79\.js\?v=192/);
 assert.match(sw,/factory-digital-twin-v207-superadmin-editor-20260924/);
 assert.match(app,/pair\('Versi aplikasi','V192'\)/);
});
