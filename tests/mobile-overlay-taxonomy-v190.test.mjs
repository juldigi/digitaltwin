import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const shell=readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');
const index=readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('taxonomy rows separate hierarchy metadata from the component name',()=>{
 assert.match(app,/class="taxonomy-copy"/);
 assert.match(app,/class="tax-level">\$\{mapped\?'Model 3D':'Referensi'\}/);
 assert.match(css,/\.geometry-node>button\{width:100%;min-height:44px;display:flex/);
 assert.match(css,/\.taxonomy-copy strong\{[^}]*white-space:normal/);
});
test('mobile navigation drawer uses opaque panel and non-blurring backdrop',()=>{
 assert.match(css,/body\.nav-open \.rail\{z-index:110\}/);
 assert.match(css,/body\.nav-open \.ui-backdrop\{z-index:109;[^}]*backdrop-filter:none/);
 assert.match(css,/\.rail\{background:#fff\}/);
});
test('drawer transition marker is always cleared',()=>{
 assert.match(shell,/classList\.add\('drawer-transitioning'\)/);
 assert.match(shell,/requestAnimationFrame\(\(\)=>document\.body\.classList\.remove\('drawer-transitioning'\)\)/);
 assert.match(shell,/closeDrawer\(\)\{document\.body\.classList\.remove\('nav-open'\);document\.body\.classList\.remove\('drawer-transitioning'\)/);
});
test('V190 release identifiers are coherent',()=>{
 assert.match(index,/app-shell-v79\.css\?v=211/);
 assert.match(index,/src\/app\.js\?v=211/);
 assert.match(sw,/factory-digital-twin-v211-ui-ssot-stage6-20260925/);
 assert.match(app,/pair\('Versi aplikasi','2026\.09\.25'\)/);
});
