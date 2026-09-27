import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const shell=readFileSync(resolve('frontend/src/app-shell-v79.js'),'utf8');
const css=readFileSync(resolve('frontend/app-shell-v79.css'),'utf8');
const sw=readFileSync(resolve('frontend/sw.js'),'utf8');
const html=readFileSync(resolve('frontend/index.html'),'utf8');

test('V224 runtime owns mobile navigation visibility instead of relying on hidden-attribute CSS leakage',()=>{
 assert.match(html,/<nav class="mobile-nav"[^>]*hidden>/);
 assert.match(shell,/const mobileNav=q\('\.mobile-nav'\)/);
 assert.match(shell,/const hidden=!mobile\|\|keyboardOpen;mobileNav\.hidden=hidden/);
 assert.match(shell,/mobileNav\.setAttribute\('aria-hidden',String\(hidden\)\)/);
});

test('V224 derives mobile keyboard state from visualViewport and keeps app height synchronized',()=>{
 assert.match(shell,/const viewport=window\.visualViewport,appHeight=viewport\?\.height\|\|innerHeight,w=innerWidth,mobile=w<768/);
 assert.match(shell,/Math\.max\(0,innerHeight-appHeight\)>160/);
 assert.match(shell,/document\.body\.classList\.toggle\('keyboard-open',keyboardOpen\)/);
 assert.match(shell,/document\.documentElement\.style\.setProperty\('--app-vh',/);
 assert.match(shell,/addEventListener\('orientationchange',syncViewport/);
});

test('V224 keyboard-open chrome never competes with active text inputs',()=>{
 assert.match(css,/body\.keyboard-open \.mobile-nav\{display:none!important;visibility:hidden!important;pointer-events:none!important\}/);
 assert.match(css,/body\.keyboard-open \.scene-bottom,[\s\S]*?body\.keyboard-open \.viewport-mode-switch,[\s\S]*?body\.keyboard-open \.viewport-zoom\{visibility:hidden!important;pointer-events:none!important\}/);
});

test('V224 mobile panels use the visual viewport height rather than raw dynamic viewport height',()=>{
 assert.match(css,/aside#detail-panel\{[\s\S]*?max-height:calc\(var\(--app-vh,100dvh\) - var\(--header-h\) - 92px/);
 assert.match(css,/#scene-editor-panel\{[\s\S]*?max-height:calc\(var\(--app-vh,100dvh\) - var\(--header-h,58px\) - 84px/);
 assert.match(css,/body\.keyboard-open \.universal-search-panel\{[\s\S]*?height:calc\(var\(--app-vh,100dvh\) - var\(--header-h\)\)!important/);
 assert.match(css,/body\.keyboard-open dialog#modal\[open\]\{[\s\S]*?max-height:calc\(var\(--app-vh,100dvh\) - 16px\)!important/);
});

test('V224 refreshes the service worker bytes without rotating the public V222 cache contract',()=>{
 assert.match(sw,/shell recache without rotating public query identifiers/);
 assert.match(sw,/factory-digital-twin-v222-overlay-state-ssot-20260925/);
 assert.match(sw,/const RELEASE='222'/);
});
