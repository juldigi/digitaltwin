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
 assert.match(css,/\.legacy-nav-entry,[^{]*\.legacy-tool-entry[^{]*\{display:none!important\}/);
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
 assert.doesNotMatch(shell,/rail\.innerHTML\s*=/);
 assert.doesNotMatch(shell,/location\.(?:href|assign|replace)\s*=/);
 assert.doesNotMatch(app,/location\.href=.*machine=/);
 assert.match(app,/history\.pushState/);
});

test('one canonical Escape owner closes only the top-most shell context',()=>{
 const activeSources=[shell,ui];
 const escapeOwners=activeSources.reduce((count,src)=>count+(src.match(/document\.addEventListener\('keydown'/g)||[]).length,0);
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

test('V149 inspector exposes five canonical tabs and keeps interior as an inspection action',()=>{
 for(const tab of ['overview','structure','simulation','data','sources'])assert.match(html,new RegExp(`data-tab="${tab}"`));
 assert.match(html,/id="tool-interior"/);
 assert.match(html,/class="legacy-inspector-tab"[^>]*data-tab="exterior"/);
 assert.match(css,/\.legacy-inspector-tab\{display:none!important\}/);
 assert.doesNotMatch(app,/Printing Test/);
});

test('V149 universal search covers machines areas components systems documents and photos',()=>{
 for(const token of ['universalSearchResults','searchableTaxonomy','searchableSources','searchablePhotos','bmj:searchrequest','bmj:searchselect'])assert.match(app,new RegExp(token));
 for(const group of ["'MESIN'","'KOMPONEN'","'AREA'","'SISTEM'","'DOKUMEN'","'FOTO'"])assert.match(app,new RegExp(group));
 assert.match(shell,/universal-search-panel/);
 assert.match(shell,/bmj:searchresults/);
 assert.match(shell,/mobile-search-toggle/);
 assert.match(html,/id="mobile-search-toggle"/);
 assert.doesNotMatch(ui,/global-search[\s\S]{0,160}nav-assets/);
});

test('V149 Systems is a real network context without invented Water or Electrical routes',()=>{
 assert.match(shell,/data-system-focus="hvac"/);
 assert.match(shell,/data-system-focus="compressedAir"/);
 assert.match(shell,/data-system-focus="routing"/);
 assert.match(shell,/Air \/ IPAL[\s\S]*Jalur terpisah belum tersedia/);
 assert.match(shell,/Kelistrikan[\s\S]*Jalur terpisah belum tersedia/);
 assert.match(shell,/bmj:systemfocus/);
 assert.match(app,/window\.addEventListener\('bmj:systemfocus'/);
 assert.match(app,/utility_ahu_ducting/);
 assert.match(app,/utility_compressed_air/);
 assert.match(css,/\.canonical-system-grid/);
});

test('V149 inspection and legacy factory layer actions synchronize into centralized state',()=>{
 assert.match(app,/inspectionMode:\{explode:explode>0\}/);
 assert.match(app,/inspectionMode:\{isolate:engine\.isolated\}/);
 assert.match(app,/inspectionMode:\{interior:exteriorMode\}/);
 assert.match(app,/canonicalFactoryLayer=/);
 assert.match(app,/visibleLayers:\{\[canonical\]:visible\}/);
 assert.match(app,/cameraPreset:/);
});

test('V149 deep links preserve machine asset node and workspace view without navigation reload',()=>{
 assert.match(state,/const map=\{asset:state\.selectedAsset,node:state\.selectedNode,view:state\.viewMode\}/);
 assert.match(state,/params\.set\(key,value\)/);
 assert.match(app,/INITIAL_URL_STATE\.get\('node'\)/);
 assert.match(app,/INITIAL_URL_STATE\.get\('machine'\)\|\|INITIAL_URL_STATE\.get\('asset'\)/);
 assert.match(app,/history\.pushState/);
 assert.doesNotMatch(app,/location\.(?:href|assign|replace)\s*=/);
});

test('V149 mobile Lainnya keeps primary viewport actions limited and preserves contextual inspection access',()=>{
 assert.match(css,/\.mobile-context-tools\{display:none\}/);
 assert.match(css,/@media\(max-width:767px\)[\s\S]*\.mobile-context-tools\{display:grid/);
 for(const action of ['top','interior','labels','home','fullscreen'])assert.match(shell,new RegExp(`data-mobile-tool="${action}"`));
 assert.match(shell,/tool-interior/);
 assert.match(shell,/data-camera="reset"/);
 assert.match(shell,/#fullscreen/);
});

test('V149 one-major-overlay policy explicitly closes the current major surface before opening another',()=>{
 assert.match(shell,/if\(current==='search'\)closeSearch\(\)/);
 assert.match(shell,/else if\(current==='layers'\)closeLayerManager\(\)/);
 assert.match(shell,/else if\(current==='navigation'\)closeDrawer\(\)/);
 assert.match(shell,/else if\(current==='inspector'\)closeInspector\(\)/);
 assert.match(shell,/current==='modal'/);
});

test('V149 universal search never forces unverified machine geometry',()=>{
 assert.match(app,/has3D:scopedRegistryHas3D\(machine\)/);
 assert.match(app,/item\.type==='machine'&&!item\.has3D/);
 assert.match(app,/await openAssetContext\(record\)/);\n assert.match(app,/focusFoundationPlaceholder/);
 assert.match(app,/selectedArea:item\.title/);
});

test('V149 taxonomy linkage uses parent relationships and a clickable contextual breadcrumb',()=>{
 assert.match(html,/id="context-breadcrumb"/);
 assert.match(app,/function taxonomyPath/);
 assert.match(app,/meta\.parentId\?TAXONOMY_BY_ID\.get\(meta\.parentId\)/);
 assert.match(app,/selectedPath\.has\(n\.id\)/);
 assert.doesNotMatch(app,/selectedTaxonomyId\.startsWith\(n\.id\)/);
 assert.match(app,/data-breadcrumb-node/);
 assert.match(app,/selectTaxonomy\(id,\{revealPanel:true\}\)/);
 assert.match(css,/\.context-breadcrumb/);
});

test('V149 evidence status is progressive and source-derived rather than a permanent static confidence card',()=>{
 assert.doesNotMatch(html,/class="confidence-panel"/);
 assert.match(html,/class="evidence-status"/);
 assert.match(app,/function updateEvidenceStatus/);
 assert.match(app,/Array\.isArray\(PHOTO_REGISTRY\)/);
 assert.match(app,/Array\.isArray\(TECHNICAL_SOURCES\)/);
 assert.match(css,/\.evidence-status/);
});

test('V149 taxonomy level names are human-first with L1-L6 only as secondary technical indicators',()=>{
 for(const label of ['Mesin','Unit Utama','Sub','Block','Part','Spesifik Part'])assert.match(app,new RegExp(label));
 assert.match(app,/<small>L\$\{level\}<\/small>/);
 assert.match(css,/\.stage-strip button small/);
});
