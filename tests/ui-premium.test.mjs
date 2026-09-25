import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const css=fs.readFileSync(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V158 loads one unified adaptive shell after the stable base styles',()=>{
  assert.match(html,/style\.css[\s\S]*runtime-fallback\.css[\s\S]*app-shell-v79\.css\?v=213/);
  assert.match(html,/app\.js\?v=213[\s\S]*ui-v5\.js\?v=213[\s\S]*experience-v37\.js\?v=213[\s\S]*app-shell-v79\.js\?v=213/);
  for(const stale of ['ui-premium-v73.css','ui-corporate-v74.css','reference-v76.css','mobile-stable-v78.css','reference-v76.js','mobile-stable-v78.js'])assert.doesNotMatch(html,new RegExp(stale.replaceAll('.','\\.')));
});

test('responsive contract covers phone tablet desktop and landscape',()=>{
  assert.match(css,/@media\(max-width:767px\)/);
  assert.match(css,/@media\(max-width:390px\)/);
  assert.match(css,/@media\(max-height:560px\) and \(orientation:landscape\)/);
  assert.match(css,/@media\(min-width:768px\) and \(max-width:1024px\)/);
  assert.match(css,/env\(safe-area-inset-bottom\)/);
  assert.match(css,/100dvh/);
  assert.match(css,/prefers-reduced-motion/);
  assert.match(css,/prefers-contrast:more/);
});

test('detail is an in-flow desktop inspector and a contextual mobile bottom sheet',()=>{
  assert.match(css,/aside#detail-panel/);
  assert.match(css,/\.panel-hidden aside#detail-panel/);
  assert.match(css,/@media\(max-width:767px\)[\s\S]*aside#detail-panel\{[\s\S]*position:fixed!important/);
  assert.match(css,/height:min\(58dvh,620px\)!important/);
  assert.match(css,/\.panel-hidden aside#detail-panel\{[\s\S]*translateY/);
});

test('mobile navigation and drawer have one state owner',()=>{
  assert.match(css,/body\.nav-open \.rail\{transform:none\}/);
  assert.match(css,/\.mobile-nav\{position:fixed/);
  assert.match(js,/function closeDrawer\(\)/);
  assert.match(js,/data-mobile-nav/);
  assert.match(js,/aria-expanded/);
});

test('premium generated splash is bounded by canonical boot state',()=>{
  assert.match(css,/splash-industrial-v79\.webp/);
  assert.match(css,/\.app-splash\.is-done/);
  assert.match(js,/sessionStorage\.getItem\('bmj-splash-seen'\)/);
  assert.match(js,/syncSplashFromState=state=>/);
  assert.match(js,/state\?\.bootState\?\.phase\|\|'booting'/);
  assert.match(js,/const BOOT_TIMEOUT_MS=12500/);
  assert.match(js,/bootState:\{phase:'timeout',message:'Aplikasi belum berhasil dimuat'\}/);
  assert.doesNotMatch(js,/bmj:appready/);
  assert.match(sw,/assets\/splash-industrial-v79\.webp/);
});

test('boot recovery has one owner instead of competing inline timers',()=>{
  assert.doesNotMatch(html,/id="splash-recovery"/);
  assert.doesNotMatch(html,/setTimeout\(\(\)=>\{const b=document\.getElementById\('boot'\)/);
  assert.match(js,/showBootFailure=/);
  assert.match(js,/id="boot-retry"/);
});

test('large factory fleet loads after the first usable app state',()=>{
  const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
  const factory=fs.readFileSync(new URL('../frontend/src/factory-building.js',import.meta.url),'utf8');
  const startup=app.slice(app.indexOf('bundledLayout=await loadBundledPlantLayout()'),app.indexOf('function scrollInspectorToTabStart'));
  assert.ok(startup.indexOf("signalAppReady('ready')")<startup.indexOf('loadFactoryFleet()'));
  assert.match(factory,/import\('\.\/data\/factory-fleet-data\.js'\)/);
  assert.doesNotMatch(factory,/^import \{FACTORY_FLEET_GZIP\}/m);
});

test('opening the root URL without an asset does not abort the app module',()=>{
  const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
  assert.match(app,/clearActiveMachineDescriptor\(\);/);
});

test('icons use one accessible vector family without emoji runtime controls',()=>{
  assert.match(js,/<symbol id="i-factory"/);
  assert.match(js,/<symbol id="i-settings"/);
  assert.match(js,/aria-hidden="true"/);
  assert.match(js,/viewBox="0 0 24 24"/);
});

test('service worker owns the current OEM-deep-detail shell assets',()=>{
 assert.match(sw,/factory-digital-twin-v213-mobile-layout-20260925/);
  assert.match(sw,/app-shell-v79\.css/);
  assert.match(sw,/src\/app-shell-v79\.js/);
  assert.match(sw,/assets\/splash-industrial-v79\.webp/);
});


test('splash exists in first HTML paint before the application shell',()=>{
  const splash=html.indexOf('class="app-splash"'),header=html.indexOf('class="topbar"');
  assert.ok(splash>0&&splash<header,'splash must precede the visible application shell');
  assert.match(html,/<style id="splash-critical">[\s\S]*\.app-splash/);
  assert.doesNotMatch(js,/document\.createElement\('div'\);splash\.className='app-splash'/);
});
test('machine changes use in-place scene switching instead of page navigation',()=>{
  const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
  const engine=fs.readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');
  assert.match(app,/async function switchActiveMachine/);
  assert.match(app,/history\.pushState/);
  assert.doesNotMatch(app,/location\.href=.*machine=/);
  assert.match(engine,/switchMachine\(key\)/);
});

test('V81 prevents sidebar and toolbar overlap across constrained screens',()=>{
  assert.match(css,/scene-bottom\{width:min\(920px,calc\(100% - 40px\)\)/);
  assert.match(css,/@media \(min-width:768px\) and \(max-width:1180px\)/);
  assert.match(css,/aside#detail-panel\{position:absolute;z-index:75/);
  assert.match(css,/@media \(min-width:768px\) and \(max-height:720px\)/);
  assert.match(css,/html:fullscreen body/);
  assert.match(css,/html:fullscreen \.statusbar\{display:none\}/);
  assert.match(css,/\.rail\{width:100%;height:100%;min-height:0;overflow-y:auto/);
});


test('V193 uses three global domains and keeps simulation/reference contextual to the selected asset',()=>{
  const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
  assert.match(html,/id="nav-machine"[\s\S]*id="nav-assets"[\s\S]*id="nav-systems"/);
  assert.doesNotMatch(html,/id="nav-simulation-mode"/);
  assert.doesNotMatch(html,/id="nav-sources"/);
  assert.match(js,/const SECTION_BUTTONS=\{factory:'nav-machine',asset:'nav-assets',system:'nav-systems'\}/);
  assert.match(js,/return section==='simulation'\|\|section==='reference'\?'asset':section/);
  assert.match(html,/data-tab="simulation"/);
  assert.match(html,/data-tab="sources"/);
  assert.match(app,/emitDomainState\(\{activeSection:'asset'\}\);assetDialog\(\)/);
});

test('V193 mobile inspector is a bottom sheet that preserves the 3D context and bottom navigation',()=>{
  assert.match(css,/\/\* V193 UX architecture reset/);
  assert.match(css,/aside#detail-panel\{[\s\S]*?position:fixed!important[\s\S]*?bottom:calc\(72px \+ env\(safe-area-inset-bottom\)\)!important[\s\S]*?height:min\(58dvh,620px\)!important/);
  assert.match(css,/body:not\(\.panel-hidden\) \.mobile-nav\{visibility:visible!important;pointer-events:auto!important\}/);
  assert.match(css,/\.panel-hidden aside#detail-panel\{[\s\S]*?translateY/);
});

test('V193 removes internal machine identifiers from the normal asset browser copy',()=>{
  const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
  assert.match(app,/\[machine\.sapCode,machine\.model\]\.filter\(Boolean\)\.join\(' · '\)/);
  assert.doesNotMatch(app,/<small>\$\{esc\(machine\.machineId\)\}<\/small>/);
  assert.match(app,/Edit Pabrik 3D/);
});


test('V195 visual hierarchy is state-driven and contextual',()=>{
  const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
  assert.match(js,/function syncVisualHierarchy\(state\)/);
  assert.match(js,/body\.dataset\.sceneMode=state\.sceneMode==='machine'\?'machine':'factory'/);
  assert.match(js,/body\.dataset\.hasSelection=String\(hasSelection\)/);
  assert.match(js,/uiArchitecture='v212-ui-ssot'/);
  assert.match(css,/\/\* V195 visual hierarchy reset/);
  assert.match(css,/body\[data-scene-mode="factory"\] \.inspect-tool\{display:none!important\}/);
  assert.match(css,/body\[data-has-selection="false"\] \.context-tool\{display:none!important\}/);
  assert.match(html,/class="inspect-tool"/);
  assert.match(html,/class="camera-tool context-tool"/);
  assert.doesNotMatch(css,/view-switch button:nth-child\([^)]*\)[^{]*\{display:none\}/);
  assert.match(app,/class="technical-details"/);
  assert.match(app,/<summary>Informasi teknis<\/summary>/);
});

test('V195 keeps the canvas visually dominant across desktop and mobile',()=>{
  assert.match(css,/\.asset-preview\{display:none!important\}/);
  assert.match(css,/--v195-panel:360px/);
  assert.match(css,/height:min\(54dvh,590px\)!important/);
  assert.match(css,/body\[data-scene-mode="factory"\] \.view-switch button\.camera-tool\{flex:1 1 0;min-width:0\}/);
  assert.match(css,/\.context-primary-actions\{display:grid;grid-template-columns:1fr 1fr/);
  assert.match(css,/@media\(max-width:767px\)[\s\S]*\.context-primary-actions\{grid-template-columns:1fr\}/);
});


test('V196 interaction flow preserves semantic hierarchy and explicit parent navigation',()=>{
  const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
  assert.match(html,/id="context-back"[^>]+aria-label="Kembali satu tingkat"/);
  assert.match(js,/uiArchitecture='v212-ui-ssot'/);
  assert.match(js,/function syncVisualHierarchy\(state\)[\s\S]*context-back/);
  assert.match(app,/function pushMachineContextHistory\(node=null/);
  assert.match(app,/function navigateContextParent\(\)/);
  assert.match(app,/selectTaxonomy\(parent,\{revealPanel:true,historyMode:'push'\}\)/);
  assert.match(app,/resetTaxonomyRoot\(\{historyMode:'push'\}\)/);
  assert.match(app,/on\('#context-back',navigateContextParent\)/);
  assert.match(app,/selectTaxonomy\(item\.nodeId,\{revealPanel:true,historyMode:'push'\}\)/);
  assert.match(app,/selectTaxonomy\(button\.dataset\.componentId,\{revealPanel:true,historyMode:'push'\}\)/);
});

test('V196 camera reset changes only camera framing and never clears semantic selection',()=>{
  const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
  const start=app.indexOf("if(mode==='reset')");
  const end=app.indexOf("if(mode==='fit')",start);
  const reset=app.slice(start,end);
  assert.match(reset,/engine\.fit\(isFactory\?engine\.factory:engine\.machine,'iso'\)/);
  assert.doesNotMatch(reset,/showHome/);
  assert.doesNotMatch(reset,/selectedPart=null/);
  assert.doesNotMatch(reset,/template\.reset/);
  assert.doesNotMatch(reset,/selectedNode:null/);
  assert.doesNotMatch(reset,/engine\.isolated=false/);
});


test('V196 modal subflows return to their parent instead of stacking surfaces',()=>{
  const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
  assert.match(html,/id="modal-back"[^>]+aria-label="Kembali ke dialog sebelumnya"/);
  assert.match(app,/let modalBackHandler=null/);
  assert.match(app,/function modal\(title,html,\{back=null\}=\{\}\)/);
  assert.match(app,/function goModalBack\(\)/);
  assert.match(app,/on\('#modal-back',goModalBack\)/);
  assert.match(app,/foundationStatusDialog\(\{back:settingsDialog\}\)/);
  assert.match(app,/connectionDialog\(\{back:settingsDialog\}\)/);
  assert.match(app,/\{back:settingsDialog\}\);\$\('#change-password-form'\)/);
  assert.match(app,/\{back:\(\)=>connectionDialog\(\{back\}\)\}/);
});

test('V196 close and back have distinct semantics',()=>{
  const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
  assert.match(app,/function closeModal\(\)\{modalBackHandler=null/);
  assert.match(app,/function navigateContextParent\(\)/);
  assert.doesNotMatch(app,/factory-inspector-back/);
  assert.match(css,/\/\* V196 interaction flow/);
  assert.match(css,/\.context-back/);
  assert.match(css,/\.modal-back/);
});


test('V197 starts from a neutral factory context instead of loading OFFSET 5 implicitly',()=>{
  const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
  const engine=fs.readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');
  const scope=fs.readFileSync(new URL('../frontend/src/data/foundation-scope.js',import.meta.url),'utf8');
  const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');
  assert.match(app,/MACHINE_KEY=null/);
  assert.match(app,/clearActiveMachineDescriptor\(\);/);
  assert.doesNotMatch(app,/FOUNDATION_SCOPE\.primaryRoute/);
  assert.match(engine,/this\.machineKey=null/);
  assert.match(engine,/this\.view='factory'/);
  assert.match(engine,/neutralTemplate\(\)/);
  assert.match(engine,/clearMachineContext\(\)/);
  assert.match(scope,/defaultMachineId:null/);
  assert.match(scope,/referenceMachineId:'BMJ-MCH-0003'/);
  assert.match(html,/id="geometry-caption">Pabrik · Seluruh Area</);
  assert.doesNotMatch(html,/id="geometry-caption">Model Offset 5</);
  assert.match(sw,/factory-digital-twin-v213-mobile-layout-20260925/);
});

test('V197 navigation uses factory, machine, and system language',()=>{
  assert.match(html,/id="nav-machine"[\s\S]*<small>Pabrik<\/small>/);
  assert.match(html,/id="nav-assets"[\s\S]*<small>Mesin<\/small>/);
  assert.match(html,/data-mobile-nav="asset" aria-label="Mesin"[\s\S]*<small>Mesin<\/small>/);
  assert.match(js,/uiArchitecture='v212-ui-ssot'/);
  assert.doesNotMatch(js,/bmj:domainstate/);
});

test('V197 system browsing keeps display layers secondary',()=>{
  assert.match(js,/function ensureSystemBrowser\(\)/);
  assert.match(js,/function ensureLayerManager\(\)/);
  assert.match(js,/SISTEM PABRIK/);
  assert.match(js,/TAMPILAN/);
});


test('Stage 5 separates Systems from Display layers',()=>{
  assert.match(html,/id="nav-systems"[\s\S]*?<small>Sistem<\/small>/);
  assert.match(html,/id="nav-view"[\s\S]*?<small>Tampilan<\/small>/);
  assert.match(js,/function openSystemBrowser\(\)/);
  assert.match(js,/function openLayerManager\(\)/);
  assert.match(js,/id='system-browser'|panel\.id='system-browser'/);
  assert.match(js,/panel\.id='layer-manager'/);
  assert.match(js,/openOverlay\('systems'\)/);
  assert.match(css,/body\.system-open \.ui-backdrop/);
});
