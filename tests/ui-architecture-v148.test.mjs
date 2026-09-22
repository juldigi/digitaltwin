import test from'node:test';
import assert from'node:assert/strict';
import fs from'node:fs';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const tokens=read('../frontend/styles/tokens.css');
const shell=read('../frontend/styles/shell.css');
const responsive=read('../frontend/styles/responsive.css');
const state=read('../frontend/src/state/app-state.js');
const ui=read('../frontend/src/ui/flagship-shell.js');
const sw=read('../frontend/sw.js');

test('V148 uses one centralized digital twin state contract',()=>{
 for(const key of ['activeSection','selectedArea','selectedAsset','selectedNode','selectedSystem','viewMode','cameraPreset','visibleLayers','inspectionMode','simulationState','searchState','inspectorState','activeReference','deviceMode'])assert.match(state,new RegExp(key));
 assert.match(state,/window\.BMJAppState/);
 assert.match(ui,/selectContext/);
});

test('V148 exposes canonical Indonesian navigation without legacy primary entries',()=>{
 for(const label of ['Pabrik','Aset','Sistem','Simulasi','Referensi','Bantuan','Pengaturan'])assert.match(ui,new RegExp(label));
 assert.doesNotMatch(ui,/>Home</);
 assert.doesNotMatch(ui,/>Panel</);
 assert.doesNotMatch(ui,/>Exterior</);
});

test('V148 separates inspection, layers, search and simulation transport',()=>{
 assert.match(ui,/setInspection/);
 assert.match(ui,/layer-manager/);
 assert.match(ui,/universal-search-results/);
 assert.match(ui,/simulation-transport/);
 assert.match(ui,/Tahap sebelumnya/);
 assert.match(ui,/Kecepatan/);
 assert.match(ui,/Stop/);
});

test('V148 responsive contract covers phone tablet landscape and accessibility',()=>{
 assert.match(responsive,/@media\(max-width:767px\)/);
 assert.match(responsive,/@media\(max-width:1180px\) and \(min-width:768px\)/);
 assert.match(responsive,/orientation:landscape/);
 assert.match(responsive,/env\(safe-area-inset-bottom\)/);
 assert.match(tokens,/:focus-visible/);
 assert.match(tokens,/prefers-reduced-motion/);
 assert.match(ui,/aria-label/);
 assert.match(ui,/Escape/);
});

test('V148 preserves legacy engine through adapters and does not navigate for switching',()=>{
 assert.match(ui,/dispatchLegacy/);
 assert.doesNotMatch(ui,/location\.href/);
 assert.doesNotMatch(ui,/location\.reload/);
 assert.match(state,/history\.replaceState/);
});

test('V148 assets load after stable engine styles and are available offline',()=>{
 assert.match(html,/app-shell-v79\.css\?v=148[\s\S]*styles\/tokens\.css\?v=148[\s\S]*styles\/shell\.css\?v=148[\s\S]*styles\/responsive\.css\?v=148/);
 assert.match(html,/src\/ui\/flagship-shell\.js\?v=148/);
 for(const asset of ['styles/tokens.css','styles/shell.css','styles/responsive.css','src/state/app-state.js','src/ui/flagship-shell.js'])assert.match(sw,new RegExp(asset.replaceAll('/','\\/')));
 assert.match(sw,/factory-digital-twin-v148-flagship-ui-architecture-20260922/);
});

test('V148 hides legacy duplicate workbench surfaces from the user shell',()=>{
 assert.match(shell,/engineering-workbench[\s\S]*display:none!important/);
 assert.match(shell,/#tool-pan[\s\S]*display:none!important/);
 assert.match(shell,/\.statusbar\{display:none\}/);
});
