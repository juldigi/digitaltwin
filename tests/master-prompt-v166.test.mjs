import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const css=read('../frontend/app-shell-v79.css');
const shell=read('../frontend/src/app-shell-v79.js');
const ui=read('../frontend/src/ui-v5.js');
const sw=read('../frontend/sw.js');

test('V166 keeps drawer and inspector state under the canonical shell controller',()=>{
 assert.match(shell,/q\('#close-panel'\)\?\.addEventListener\('click'/);
 assert.match(shell,/function closeInspector\(restoreFocus=true\)/);
 assert.match(shell,/restoreOverlayFocus\('inspector','#panel-toggle'\)/);
 assert.match(shell,/\[data-mobile-nav="more"\].*aria-expanded/s);
 assert.doesNotMatch(ui,/e\.target\.closest\('\.rail'\)/);
});

test('V166 exposes meaningful expanded and pressed states',()=>{
 assert.match(html,/id="ui-menu-toggle"[^>]+aria-controls="main-navigation"/);
 assert.match(html,/id="panel-toggle"[^>]+aria-expanded="false"[^>]+aria-controls="detail-panel"/);
 assert.match(html,/id="mode-2d" aria-pressed="false"/);
 assert.match(html,/id="mode-3d" class="active" aria-pressed="true"/);
 assert.match(html,/id="tool-explode" aria-pressed="false"/);
 assert.match(html,/id="labels"[^>]+aria-pressed="true"/);
 assert.match(shell,/syncAccessibleControls/);
 assert.match(shell,/syncPressedTools/);
});

test('V166 protects touch targets, modal scrolling, toast placement, and modal overlays',()=>{
 assert.match(css,/\/\* V166 comfort, touch, and overlay hardening \*\//);
 assert.match(css,/@media \(pointer:coarse\)[\s\S]*min-height:44px/);
 assert.match(css,/\.header-actions \.icon-btn\{width:44px;height:44px/);
 assert.match(css,/\.panel-footer button\{min-height:48px\}/);
 assert.match(css,/dialog#modal\[open\]\{display:grid;grid-template-rows:auto minmax\(0,1fr\)\}/);
 assert.match(css,/body\[data-overlay="search"\] \.ui-backdrop/);
 assert.match(css,/#toast\{bottom:calc\(80px \+ env\(safe-area-inset-bottom\)\)\}/);
});

test('V166 does not trap keyboard focus inside the mobile inspector page',()=>{
 assert.doesNotMatch(shell,/overlay==='inspector'.*q\('#detail-panel'\)/);
});

test('V166 assets are cache-busted for existing devices',()=>{
 assert.match(html,/app-shell-v79\.css\?v=166/);
 assert.match(html,/src\/ui-v5\.js\?v=166/);
 assert.match(html,/src\/app-shell-v79\.js\?v=166/);
 assert.match(sw,/factory-digital-twin-v166-usability-hardening-20260923/);
});
