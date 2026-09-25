import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const app=read('../frontend/src/app.js');
const shell=read('../frontend/src/app-shell-v79.js');
const state=read('../frontend/src/state/app-state.js');
const sw=read('../frontend/sw.js');

test('Stage 6 URL state distinguishes factory asset selection from machine scene',()=>{
 assert.match(state,/sceneMode:'factory'/);
 assert.match(state,/sceneMode:params\.get\('scene'\)==='machine'\|\|Boolean\(selectedNode\)\|\|Boolean\(legacyMachine\)\?'machine':'factory'/);
 assert.match(state,/if\(sceneMode==='machine'\)params\.set\('scene','machine'\)/);
 assert.match(state,/else if\(selectedAsset\)params\.set\('scene','factory'\)/);
 assert.match(state,/params\.delete\('machine'\)/);
 assert.match(state,/export function buildContextUrl/);
});

test('Stage 6 empty URL restores Home instead of silently opening the primary machine',()=>{
 const body=app.slice(app.indexOf('async function restoreHistoryContext'),app.indexOf("addEventListener('popstate'"));
 assert.match(body,/const restored=readUrlState\(\),route=restored\.selectedAsset/);
 assert.match(body,/if\(!route\)\{[\s\S]*showHome\(\{historyMode:'none'\}\)/);
 assert.doesNotMatch(body,/FOUNDATION_SCOPE\.primaryRoute/);
});

test('factory selection and technical model navigation create distinct browser entries',()=>{
 assert.match(app,/function pushContextHistory\(/);
 assert.match(app,/const url=buildContextUrl\(snapshot\)/);
 assert.match(app,/history\.pushState\(snapshot,'',url\)/);
 assert.match(app,/selectFactoryAssetContext\(machine,\{historyMode='none'[\s\S]*historyMode==='push'[\s\S]*scene:'factory'/);
 assert.match(app,/async function switchActiveMachine[\s\S]*historyMode==='push'\)pushContextHistory\(\{asset:assetId,node:null,scene:'machine'/);
});

test('first load and browser Back use one deterministic restore path',()=>{
 assert.match(app,/await restoreHistoryContext\(\);/);
 assert.equal((app.match(/addEventListener\('popstate'/g)||[]).length,1);
 assert.match(app,/addEventListener\('popstate',\(\)=>\{restoreHistoryContext\(\)/);
 const restoreBody=app.slice(app.indexOf('async function restoreHistoryContext'),app.indexOf("addEventListener('popstate'"));
 assert.doesNotMatch(restoreBody,/location\.(?:reload|assign|replace)\(/);
});

test('restore preserves camera preset and resets stale inspection state on machine entry',()=>{
 assert.match(state,/cameraPreset:params\.get\('camera'\)==='top'\?'top':'iso'/);
 assert.match(app,/function applyRestoredCamera\(preset='iso'\)/);
 assert.match(app,/function resetMachineInspectionContext\(\)/);
 assert.match(app,/setDomainState\(\{inspectionMode:\{isolate:false,interiorFocus:null\}\}\);selectedPart=null;setActiveTaxonomyId\(ACTIVE_ROOT\);setExplodeLevel\(0\);simulationOwnsExterior=false;setDomainState\(\{inspectorState:\{tab:'overview'\}\}\)/);
 assert.match(shell,/getState\(\)\.sceneMode==='machine'\?'asset':'factory'/);
});

test('view-mode transitions preserve factory mode and enter technical 3D canonically',()=>{
 assert.match(app,/scene:'factory',view:currentViewMode\(\),camera:'iso'/);
 assert.match(app,/threeMode=\$\('#mode-3d'\),targetView=threeMode\?\.disabled\?'2d':'3d'/);
 assert.match(app,/historyMode==='push'&&targetView==='3d'\)threeMode\?\.click\(\)/);
});

test('in-place navigation never reloads the page to switch machine context',()=>{
 const switchBody=app.slice(app.indexOf('async function switchActiveMachine'),app.indexOf('function qStaticFallbackClear'));
 assert.match(switchBody,/engine\.switchMachine\(MACHINE_KEY\)/);
 assert.doesNotMatch(switchBody,/location\.(?:reload|assign|replace|href)/);
});

test('Stage 6 runtime files and service worker are cache-busted',()=>{
 assert.match(html,/src\/app\.js\?v=222/);
 assert.match(html,/src\/app-shell-v79\.js\?v=222/);
 assert.match(sw,/factory-digital-twin-v222-overlay-state-ssot-20260925/);
});
