import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const scope=fs.readFileSync(new URL('../frontend/src/data/foundation-scope.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V161 restores factory-first startup even when WebGL falls back',()=>{
 const start=app.indexOf('function showHome(){');
 const end=app.indexOf('function connectionDialog',start);
 const home=app.slice(start,end);
 assert.match(home,/qStaticFallbackClear\(\)/);
 assert.match(home,/setView\('factory'\)/);
 assert.match(home,/document\.title='Packaging Offset Factory Digital Twin'/);
 assert.match(home,/selectedAsset:null/);
 assert.match(home,/inspectorState:\{open:false,tab:'overview'\}/);
});

test('V161 restores evidence-bounded Systems navigation without unlocking unverified machine 3D',()=>{
 assert.match(scope,/expansionMode:'EVIDENCE_GATED_CONTEXT'/);
 assert.match(scope,/showUtilitySystems:true/);
 assert.match(scope,/indexUtilitySystemsInSearch:true/);
 assert.match(scope,/export function canOpenTechnical3D\(value\)\{\s*return isFoundationPrimary\(value\)/);
});

test('V161 cache and shell identifiers are coherent',()=>{
 assert.match(html,/app-shell-v79\.css\?v=161/);
 assert.match(html,/src\/app\.js\?v=161/);
 assert.match(html,/src\/app-shell-v79\.js\?v=161/);
 assert.match(shell,/v161-factory-first-systems/);
 assert.match(sw,/factory-digital-twin-v161-factory-first-systems-20260922/);
});
