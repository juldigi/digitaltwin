import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const css=fs.readFileSync(new URL('../frontend/ui-premium-v73.css',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
test('V73 flagship stylesheet is loaded last',()=>{assert.match(html,/responsive-v5\.css[\s\S]*ui-premium-v73\.css/);});
test('touch targets and dynamic viewport are explicit',()=>{assert.match(css,/button\{min-width:44px;min-height:44px/);assert.match(css,/100dvh/);assert.match(css,/env\(safe-area-inset-bottom/);});
test('phone portrait gets bottom navigation and scroll-safe controls',()=>{assert.match(css,/@media \(max-width:767px\)/);assert.match(css,/position:fixed;left:0;right:0;bottom:0/);assert.match(css,/overflow-x:auto/);});
test('phone landscape has a compact dedicated layout',()=>{assert.match(css,/@media \(max-width:767px\) and \(orientation:landscape\)/);});
test('accessibility modes are preserved',()=>{assert.match(css,/:focus-visible/);assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);assert.match(css,/@media \(prefers-contrast:more\)/);});