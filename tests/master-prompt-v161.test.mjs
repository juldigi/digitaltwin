import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const scope=fs.readFileSync(new URL('../frontend/src/data/foundation-scope.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V162 restores factory-first startup even when WebGL falls back',()=>{
 const start=app.indexOf("function showHome({historyMode='none'}={}){");
 const end=app.indexOf('function connectionDialog',start);
 const home=app.slice(start,end);
 assert.match(home,/qStaticFallbackClear\(\)/);
 assert.match(home,/setView\('factory'\)/);
 assert.match(home,/document\.title='Packaging Offset Factory Digital Twin'/);
 assert.match(home,/selectedAsset:null/);
 assert.match(home,/inspectorState:\{open:false,tab:'overview'\}/);
});

test('V162 restores evidence-bounded Systems navigation without unlocking unverified machine 3D',()=>{
 assert.match(scope,/expansionMode:'EVIDENCE_GATED_CONTEXT'/);
 assert.match(scope,/showUtilitySystems:true/);
 assert.match(scope,/indexUtilitySystemsInSearch:true/);
 assert.match(scope,/export function canOpenTechnical3D\(value\)\{\s*const id=foundationMachineId\(value\);[\s\S]*MACHINE_REGISTRY_BY_ID\.get\(id\)\?\.has3D/);
});

test('V162 exposes Systems in both navigation surfaces and keeps identifiers coherent',()=>{
 assert.match(html,/id="nav-systems" data-section="system"/);
 assert.match(html,/data-mobile-nav="system" aria-label="Sistem utilitas"/);
 assert.match(html,/app-shell-v79\.css\?v=197/);
 assert.match(html,/src\/app\.js\?v=197/);
 assert.match(html,/src\/app-shell-v79\.js\?v=197/);
 assert.match(shell,/v197-architecture-convergence/);
 assert.match(sw,/factory-digital-twin-v209-architecture-convergence-20260925/);
});

test('asset navigation opens an empty search instead of serializing the click event',()=>{
 assert.match(app,/on\('#nav-assets',\(\)=>\{stopSimulationBeforeNavigation\(\);emitDomainState\(\{activeSection:'asset'\}\);assetDialog\(\);\}\)/);
 assert.doesNotMatch(app,/on\('#nav-assets',assetDialog\)/);
 assert.match(app,/const stopSimulationBeforeNavigation=.*bmj:simulationstoprequest/);
 assert.match(app,/if\(machine\)\{closeModal\(\);if\(simulationIntent\)[\s\S]*await openAssetContext\(machine\);\}/);
 assert.match(app,/function closeModal\(\)\{modalBackHandler=null;[\s\S]*dialog\?\.open\)dialog\.close\(\);\}/);
 assert.match(app,/focusFoundationPlaceholder\(machine,\{historyMode:'push',openDialog:false\}\);machineDetailDialog\(machine\)/);
 assert.match(app,/const primaryData=primary\?pair\('Machine ID'/);
 assert.doesNotMatch(app,/emitDomainState\(\{activeSection:'factory',viewMode:'3d'\}\)/);
});
