import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const state=fs.readFileSync(new URL('../frontend/src/state/app-state.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../frontend/src/ui-v5.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');

test('V149 primary navigation matches the master information architecture',()=>{
 for(const [id,label] of [
  ['nav-machine','Pabrik'],['nav-assets','Aset'],['nav-systems','Sistem'],
  ['nav-simulation-mode','Simulasi'],['nav-sources','Referensi'],
  ['nav-help','Bantuan'],['nav-settings','Pengaturan']
 ]){
  assert.match(html,new RegExp(`id="${id}"[\\s\\S]*?<small>${label}<\\/small>`));
 }
 for(const id of ['nav-layout','nav-components','nav-exterior','nav-view-panels']){
  assert.match(html,new RegExp(`id="${id}"[^>]*class="[^"]*legacy-nav-entry`));
 }
 assert.match(css,/\.legacy-nav-entry,\.legacy-tool-entry\{display:none!important\}/);
});

test('V149 state foundation exposes the complete single-state contract',()=>{
 for(const key of ['activeSection','selectedArea','selectedAsset','selectedNode','selectedSystem','viewMode','cameraPreset','visibleLayers','inspectionMode','simulationState','searchState','inspectorState','activeReference','deviceMode']){
  assert.match(state,new RegExp(`\\b${key}:`));
 }
 assert.match(state,/window\.BMJAppState=/);
 assert.match(shell,/bmj:domainstate/);
 assert.match(app,/emitDomainState/);
});

test('V149 shell does not repeat the destructive V148 DOM replacement pattern',()=>{
 assert.doesNotMatch(shell,/\.rail[\s\S]{0,120}innerHTML\s*=/);
 assert.doesNotMatch(shell,/rail\.innerHTML\s*=/);
 assert.doesNotMatch(shell,/location\.(?:href|assign|replace)\s*=/);
 assert.doesNotMatch(app,/location\.href=.*machine=/);
 assert.match(app,/history\.pushState/);
});

test('one canonical Escape owner closes only the top-most shell context',()=>{
 const activeSources=[shell,ui];
 const escapeOwners=activeSources.reduce((count,src)=>count+(src.match(/addEventListener\('keydown'/g)||[]).length,0);
 assert.equal(escapeOwners,1);
 assert.match(shell,/if\(overlay==='layers'\)/);
 assert.match(shell,/if\(overlay==='navigation'\)/);
 assert.match(shell,/if\(overlay==='inspector'\)/);
 assert.match(shell,/if\(overlay==='modal'/);
});

test('2D is a workspace mode and does not expose the engineering workbench chrome',()=>{
 assert.match(shell,/#mode-2d/);
 assert.match(shell,/workspace-2d/);
 assert.match(css,/\.workspace-2d \.engineering-workbench/);
 assert.match(css,/\.workspace-2d \.engineering-workbench \.wb-tabs[^}]*display:none!important/);
});

test('canonical layer manager drives real FactoryEngine layers through an adapter',()=>{
 for(const layer of ['building','roof','machines','labels','landscape','reference','unidentified','compressedAir','ahuPiping','ducting','utilityAnchors']){
  assert.match(shell,new RegExp(`['"]${layer}['"]`));
 }
 assert.match(shell,/bmj:layerchange/);
 assert.match(app,/window\.addEventListener\('bmj:layerchange'/);
 assert.match(app,/engine\.setFactoryLayer\(layer,Boolean\(visible\)\)/);
});

test('simulation entry point reuses the existing simulation engine controls',()=>{
 assert.match(shell,/nav-simulation-mode/);
 assert.match(shell,/tool-simulation/);
 assert.match(shell,/sim-start/);
 assert.match(shell,/sim-pause/);
 assert.match(shell,/sim-stop/);
 assert.match(shell,/data-sim-speed/);
 assert.match(app,/function startPrintingSimulation/);
 assert.match(app,/function pausePrintingSimulation/);
 assert.match(app,/function stopPrintingSimulation/);
});

test('mobile navigation is canonical and old global entries are not exposed',()=>{
 for(const key of ['factory','asset','system','simulation','more'])assert.match(html,new RegExp(`data-mobile-nav="${key}"`));
 for(const old of ['machine','layout','assets','components','menu'])assert.doesNotMatch(html,new RegExp(`data-mobile-nav="${old}"`));
 assert.match(css,/env\(safe-area-inset-bottom\)/);
 assert.match(css,/orientation:landscape/);
});

test('visible product copy removes prototype and test-mode terms',()=>{
 assert.doesNotMatch(html,/Mode uji/);
 assert.doesNotMatch(html,/Siap diuji/);
 assert.doesNotMatch(html,/Printing Test/);
 assert.match(html,/Buka Interior/);
 assert.match(html,/Pusatkan di 3D/);
});
