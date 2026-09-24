import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const state=fs.readFileSync(new URL('../frontend/src/state/app-state.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../frontend/src/ui-v5.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');

test('V194 primary navigation exposes only the three product domains plus contextual help/settings',()=>{
 for(const [id,label] of [['nav-machine','Pabrik'],['nav-assets','Mesin'],['nav-systems','Sistem'],['nav-view','Tampilan'],['nav-help','Bantuan']]){
  assert.match(html,new RegExp(`id="${id}"[\\s\\S]*?<small>${label}<\\/small>`));
 }
 assert.match(html,/id="settings"/);
 for(const retired of ['nav-simulation-mode','nav-sources','nav-layout','nav-components','nav-exterior','nav-view-panels'])assert.doesNotMatch(html,new RegExp(`id="${retired}"`));
 assert.match(html,/data-tab="simulation"/);
 assert.match(html,/data-tab="sources"/);
});

test('V149 state foundation exposes the complete single-state contract',()=>{
 for(const key of ['bootState','activeSection','selectedArea','selectedAsset','selectedNode','selectedSystem','viewMode','cameraPreset','visibleLayers','inspectionMode','simulationState','searchState','referenceState','inspectorState','preferences','activeReference','deviceMode']){
  assert.match(state,new RegExp(`\\b${key}:`));
 }
 assert.match(state,/window\.BMJAppState=/);
 assert.doesNotMatch(shell,/bmj:domainstate/);
 assert.match(app,/function emitDomainState\(detail\)\{return setDomainState\(detail\);\}/);
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
 assert.match(shell,/if\(getState\(\)\.inspectorState\?\.open\)closeInspector\(\)/);
 assert.match(shell,/if\(overlay==='modal'/);
});

test('2D is a first-class workspace surface with no engineering workbench dependency',()=>{
 assert.match(shell,/#mode-2d/);
 assert.match(shell,/function applyViewModeDom\(state=getState\(\)\)/);
 assert.match(html,/id="plant-plan-2d"/);
 assert.match(css,/\.workspace-2d \.plant-plan-2d\{display:block!important\}/);
 assert.doesNotMatch(html,/engineering-workbench/);
 assert.doesNotMatch(shell,/data-workbench/);
});

test('canonical layer manager drives real FactoryEngine layers through an adapter',()=>{
 for(const layer of ['building','roof','machines','labels','landscape','reference','unidentified','compressedAir','ahuPiping','ducting','utilityAnchors']){
  assert.match(shell,new RegExp(`['"]${layer}['"]`));
 }
 assert.match(shell,/bmj:layerchange/);
 assert.match(app,/window\.addEventListener\('bmj:layerchange'/);
 assert.match(app,/engine\.setFactoryLayer\(layer,Boolean\(visible\)\)/);
});

test('simulation is contextual to the selected asset and reuses the existing simulation engine controls',()=>{
 assert.doesNotMatch(html,/id="nav-simulation-mode"/);
 assert.match(html,/data-tab="simulation"/);
 assert.match(shell,/simulation:'simulation'/);
 assert.match(app,/sim-start/);
 assert.match(app,/sim-pause/);
 assert.match(app,/sim-stop/);
 assert.match(app,/data-sim-speed/);
 assert.match(app,/function startPrintingSimulation/);
 assert.match(app,/function pausePrintingSimulation/);
 assert.match(app,/function stopPrintingSimulation/);
});

test('mobile navigation is canonical and limited to three domains plus More',()=>{
 for(const key of ['factory','asset','system','more'])assert.match(html,new RegExp(`data-mobile-nav="${key}"`));
 for(const old of ['simulation','machine','layout','assets','components','menu'])assert.doesNotMatch(html,new RegExp(`data-mobile-nav="${old}"`));
 assert.match(css,/env\(safe-area-inset-bottom\)/);
 assert.match(css,/orientation:landscape/);
});

test('visible product copy removes prototype and test-mode terms',()=>{
 assert.doesNotMatch(html,/Mode uji/);
 assert.doesNotMatch(html,/Siap diuji/);
 assert.doesNotMatch(html,/Printing Test/);
 assert.match(html,/Buka Interior/);
 assert.match(html,/Fokus di 3D/);
});

test('V194 inspector exposes contextual tabs and keeps Interior only as a direct inspection action',()=>{
 for(const tab of ['overview','structure','simulation','data','sources'])assert.match(html,new RegExp(`data-tab="${tab}"`));
 assert.match(html,/id="tool-interior"/);
 assert.doesNotMatch(html,/data-tab="exterior"/);
 assert.match(app,/renderPanel\('exterior'\)/);
 assert.doesNotMatch(app,/Printing Test/);
});

test('V149 universal search covers machines areas components systems documents and photos',()=>{
 for(const token of ['universalSearchResults','searchableTaxonomy','searchableSources','searchablePhotos','bmj:searchrequest','bmj:searchselect'])assert.match(app,new RegExp(token));
 for(const group of ["'MESIN'","'KOMPONEN'","'AREA'","'DOKUMEN'","'FOTO'"])assert.match(app,new RegExp(group));
 assert.doesNotMatch(app,/group:'SISTEM'/);
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
 assert.match(app,/inspectionMode:\{explode:level>0,explodeLevel:level\}/);
 assert.match(app,/setDomainState\(\{inspectionMode:\{isolate:isolated\}\}\)/);
 assert.match(app,/setDomainState\(\{inspectionMode:\{interior:true\}\}\)/);\n assert.match(app,/setDomainState\(\{inspectionMode:\{interior:false\}\}\)/);
 assert.match(app,/canonicalFactoryLayer=/);
 assert.match(app,/visibleLayers:\{\[canonical\]:visible\}/);
 assert.match(app,/cameraPreset:/);
});

test('V149 deep links preserve machine asset node and workspace view without navigation reload',()=>{
 assert.match(state,/const map=\{asset:state\.selectedAsset,node:state\.selectedNode,view:state\.viewMode\}/);
 assert.match(state,/params\.set\(key,value\)/);
 assert.match(app,/node=params\.get\('node'\)/);
 assert.match(app,/legacyMachine=params\.get\('machine'\),route=legacyMachine\|\|params\.get\('asset'\)\|\|null/);
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
 assert.match(shell,/if\(name!=='inspector'&&getState\(\)\.inspectorState\?\.open\)closeInspector\(\{restoreFocus:false\}\)/);
 assert.match(shell,/current==='modal'/);
});

test('V149 universal search never forces unverified machine geometry',()=>{
 assert.match(app,/has3D:scopedRegistryHas3D\(machine\)/);
 assert.match(app,/item\.type==='machine'&&!item\.has3D/);
 assert.match(app,/await openAssetContext\(record\)/);
 assert.match(app,/focusFoundationPlaceholder/);
 assert.match(app,/selectedArea:item\.title/);
});

test('V149 taxonomy linkage uses parent relationships and a clickable contextual breadcrumb',()=>{
 assert.match(html,/id="context-breadcrumb"/);
 assert.match(app,/function taxonomyPath/);
 assert.match(app,/meta\.parentId\?TAXONOMY_BY_ID\.get\(meta\.parentId\)/);
 assert.match(app,/selectedPath\.has\(n\.id\)/);
 assert.doesNotMatch(app,/selectedTaxonomyId\.startsWith\(n\.id\)/);
 assert.match(app,/data-breadcrumb-node/);
 assert.match(app,/selectTaxonomy\(id,\{revealPanel:true,historyMode:'push'\}\)/);
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


test('system browser and display layers are distinct canonical surfaces',()=>{
 assert.match(shell,/function ensureSystemBrowser\(\)/);
 assert.match(shell,/function ensureLayerManager\(\)/);
 assert.match(shell,/q\('#nav-systems'\).*openSystemBrowser/);
 assert.match(shell,/q\('#nav-view'\).*openLayerManager/);
 assert.match(shell,/overlay==='systems'/);
});
