import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const css=read('../frontend/app-shell-v79.css');
const shell=read('../frontend/src/app-shell-v79.js');
const app=read('../frontend/src/app.js');
const ui=read('../frontend/src/ui-v5.js');
const experience=read('../frontend/src/experience-v37.js');
const runtime=[shell,app,ui,experience].join('\n');

test('V166 narrow mobile header cannot collide with header actions',()=>{
  assert.match(css,/\.topbar \.brand\{min-width:0;overflow:hidden!important\}/);
  assert.match(css,/\.topbar \.brand-copy\{min-width:0;max-width:100%!important;overflow:hidden!important\}/);
  assert.match(css,/\.brand-copy strong\{[^}]*overflow:hidden;[^}]*text-overflow:ellipsis;[^}]*white-space:nowrap/);
  assert.match(css,/@media\(max-width:390px\)\{\s*\.brand-copy small\{display:none!important\}/);
  assert.match(css,/\.header-actions \.icon-btn,[^\n]*\{width:44px;height:44px;min-height:44px\}/);
});

test('V166 inspector and mobile More restore a predictable focus path',()=>{
  assert.match(shell,/const target=saved\?\.isConnected\?saved:\(fallback\?q\(fallback\):null\)/);
  assert.match(shell,/function openInspector\(tab=getState\(\)\.inspectorState\.tab\)[\s\S]*rememberOverlayFocus\('inspector'\)[\s\S]*focusOverlay\(q\('#detail-panel'\),'#close-panel'\)/);
  assert.match(shell,/key==='more'[\s\S]*rememberOverlayFocus\('navigation'\)[\s\S]*focusOverlay\(q\('\.rail'\),'\.rail button:not\(\[hidden\]\)'\)/);
  assert.match(shell,/q\('#close-panel'\)\?\.addEventListener\('click',\(\)=>closeInspector\(\)\)/);
  assert.match(shell,/function closeInspector\([\s\S]*restoreOverlayFocus\('inspector','#panel-toggle'\)/);
});

test('V166 modal and canonical overlays block accidental background interaction',()=>{
  assert.match(css,/body\.layer-open \.ui-backdrop,body\.system-open \.ui-backdrop\{display:block\}/);
  assert.match(shell,/document\.body\.classList\.add\('layer-open'\)/);
  assert.match(shell,/document\.body\.classList\.remove\('layer-open'\)/);
  assert.match(css,/\.canonical-layer-manager\{position:fixed;z-index:90/);
  assert.match(css,/dialog#modal\[open\]\{display:flex;flex-direction:column\}/);
  assert.match(css,/#modal-body\{min-height:0;overflow:auto;overscroll-behavior:contain\}/);
});

test('V166 simulation transport replaces rather than overlaps the scene toolbar',()=>{
  assert.match(shell,/document\.body\.classList\.toggle\('simulation-transport-open',transportOpen\)/);
  assert.match(css,/\.simulation-transport-open \.scene-bottom\{visibility:hidden;pointer-events:none\}/);
  assert.match(shell,/let lastSyncedSection=getState\(\)\.activeSection;subscribe\(state=>[\s\S]*state\.activeSection!==lastSyncedSection[\s\S]*syncSimulationTransport/);
});

test('V166 mobile information surfaces keep practical touch and reading sizes',()=>{
  assert.match(css,/\.tabs button,\.asset-category-tabs button,\.reference-filter-strip button,\.system-context-actions button,\.context-breadcrumb button\{min-height:44px\}/);
  assert.match(css,/\.asset-browser-copy small,\.asset-browser-copy span\{font-size:10px/);
  assert.match(css,/\.context-reference-card p,\.context-reference-card>a\{font-size:10px\}/);
  assert.match(css,/\.system-boundary p\{font-size:10px\}/);
  assert.match(css,/button:disabled,\[aria-disabled="true"\]\{opacity:\.52;cursor:not-allowed\}/);
  assert.match(css,/\.universal-search-field input,[\s\S]*?\.asset-filter-grid input,\.asset-filter-grid select\{min-height:44px;font-size:16px\}/);
});

test('V166 primary visible navigation and viewport controls remain wired',()=>{
  for(const id of [
    'nav-machine','nav-assets','nav-systems','nav-help','panel-toggle',
    'mode-2d','mode-3d','tool-explode','tool-isolate','tool-interior',
    'labels','fullscreen','focus-machine'
  ]){
    assert.match(html,new RegExp('id="'+id+'"'));
    assert.match(runtime,new RegExp('#'+id));
  }
  assert.doesNotMatch(html,/id="nav-simulation-mode"/);
  assert.doesNotMatch(html,/id="nav-sources"/);
  assert.match(html,/data-tab="simulation"/);
  assert.match(html,/data-tab="sources"/);
});
