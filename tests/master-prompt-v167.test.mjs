import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const css=read('../frontend/app-shell-v79.css');
const shell=read('../frontend/src/app-shell-v79.js');
const ui=read('../frontend/src/ui-v5.js');
const sw=read('../frontend/sw.js');

test('V167 navigation has one close-state owner',()=>{
 assert.doesNotMatch(ui,/e\.target\.closest\('\.rail'\)/);
 assert.match(shell,/function closeDrawer\(\)[\s\S]*data-mobile-nav="more"[\s\S]*aria-expanded','false'/);
 assert.match(shell,/menu\.setAttribute\('aria-label',open\?'Tutup navigasi':'Buka navigasi'\)/);
 assert.match(shell,/button\.setAttribute\('aria-expanded','true'\)/);
});

test('V167 visible toggles expose canonical expanded and pressed state',()=>{
 assert.match(html,/id="ui-menu-toggle"[^>]+aria-controls="main-navigation"/);
 assert.match(html,/id="panel-toggle"[^>]+aria-expanded="false"[^>]+aria-controls="detail-panel"/);
 assert.match(html,/id="mode-2d" aria-pressed="false"/);
 assert.match(html,/id="mode-3d" class="active" aria-pressed="true"/);
 assert.match(html,/id="tool-explode" aria-pressed="false"/);
 assert.match(html,/id="tool-isolate" aria-pressed="false"/);
 assert.match(html,/id="tool-interior" aria-pressed="false"/);
 assert.match(html,/id="labels"[^>]+aria-pressed="true"/);
 assert.match(shell,/function syncAccessibleControls/);
 assert.match(shell,/function syncPressedTools/);
 assert.match(shell,/Tutup detail mesin/);
});

test('V167 mobile detail remains navigable instead of keyboard-modal',()=>{
 assert.doesNotMatch(shell,/overlay==='inspector'.*q\('#detail-panel'\)/);
 assert.match(shell,/if\(w>=768&&getState\(\)\.overlay==='navigation'\)\{closeDrawer\(\);closeOverlay\(\)\}/);
});

test('V167 overlay and toast layers avoid mobile navigation collisions',()=>{
 assert.match(css,/\/\* V167 interaction-state polish \*\//);
 assert.match(css,/\.ui-backdrop\{z-index:88\}/);
 assert.match(css,/\.scene-heading #panel-toggle\{width:44px;height:44px;min-width:44px;min-height:44px\}/);
 assert.match(css,/#toast\{bottom:calc\(80px \+ env\(safe-area-inset-bottom\)\)\}/);
});

test('V167 interaction assets are cache-busted',()=>{
 assert.match(html,/app-shell-v79\.css\?v=168/);
 assert.match(html,/src\/ui-v5\.js\?v=167/);
 assert.match(html,/src\/app-shell-v79\.js\?v=177/);
 assert.match(sw,/factory-digital-twin-v178-factory-context-reset-20260923/);
});
