import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const css=readFileSync(resolve('frontend/app-shell-v79.css'),'utf8');
const shell=readFileSync(resolve('frontend/src/app-shell-v79.js'),'utf8');
const html=readFileSync(resolve('frontend/index.html'),'utf8');

test('v221 view and system overlays stay above the dimmer',()=>{
  assert.match(css,/body\.layer-open \.ui-backdrop,body\.system-open \.ui-backdrop,[\s\S]*?z-index:88!important/);
  assert.match(css,/body\.layer-open \.canonical-layer-manager,body\.system-open \.canonical-system-browser,[\s\S]*?z-index:120!important/);
  assert.match(css,/backdrop-filter:none!important/);
});

test('v221 2D switch does not leak through overlays and selector is valid',()=>{
  assert.doesNotMatch(css,/\.workspace-2d \.workspace-2d \.viewport-mode-switch/);
  assert.match(css,/\.workspace-2d \.viewport-mode-switch\{z-index:40\}/);
  assert.match(css,/body\.layer-open \.viewport-mode-switch,[\s\S]*?visibility:hidden!important/);
});

test('v221 mobile bottom navigation matches the four rendered actions',()=>{
  assert.match(html,/data-mobile-nav="factory"/);
  assert.match(html,/data-mobile-nav="asset"/);
  assert.match(html,/data-mobile-nav="system"/);
  assert.match(html,/data-mobile-nav="more"/);
  assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
});

test('v221 display overlay restores focus to Tampilan',()=>{
  assert.match(shell,/restoreOverlayFocus\('layers','#nav-view'\)/);
  assert.doesNotMatch(shell,/restoreOverlayFocus\('layers',PHASE1_FOUNDATION\?'#nav-machine':'#nav-systems'\)/);
});

test('v221 cache-busted shell is served',()=>{
  assert.match(html,/app-shell-v79\.css\?v=221/);
  assert.match(html,/src\/app-shell-v79\.js\?v=221/);
  assert.match(html,/bmj-sw-v221-reloaded/);
});
