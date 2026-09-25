import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const shell=readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');
const index=readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('simulation asset picker continues directly into the selected machine simulation',()=>{
 assert.match(app,/function assetDialog\(initialQuery='',\{intent='browse'\}=\{\}\)/);
 assert.match(app,/const simulationIntent=intent==='simulation'/);
 assert.match(app,/if\(!record\)\{assetDialog\('',\{intent:'simulation'\}\);return;\}/);
 assert.match(app,/if\(simulationIntent\)\{dispatchEvent\(new CustomEvent\('bmj:simulateselectedmachine'/);
});

test('simulation preserves device performance mode instead of forcing full detail',()=>{
 assert.match(app,/function enableExteriorOpen\(\{forceDetail=true\}=\{\}\)/);
 assert.match(app,/if\(forceDetail&&!engine\.mobileRender\)engine\.applyQualityProfile/);
 assert.match(app,/enableExteriorOpen\(\{forceDetail:false\}\)/);
});

test('system overlay is isolated above the backdrop without lifting the whole workspace',()=>{
 assert.match(shell,/document\.body\.append\(panel\)/);
 assert.match(css,/\.canonical-layer-manager\{position:fixed;z-index:90/);
 assert.doesNotMatch(css,/\.layer-open \.twin-shell\{z-index:89\}/);
});

test('V184 assets rotate browser and service-worker caches',()=>{
 assert.match(index,/app-shell-v79\.css\?v=222/);
 assert.match(index,/src\/app\.js\?v=222/);
 assert.match(index,/src\/app-shell-v79\.js\?v=222/);
 assert.match(sw,/factory-digital-twin-v222-overlay-state-ssot-20260925/);
 assert.match(app,/pair\('Versi aplikasi',APP_BUILD\)/);
});
