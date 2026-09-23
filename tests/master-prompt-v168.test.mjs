import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const css=read('../frontend/app-shell-v79.css');
const app=read('../frontend/src/app.js');
const sw=read('../frontend/sw.js');

test('V168 keeps inspector tabs visible and resets tab reading position',()=>{
 assert.match(css,/\/\* V168 reading flow, legibility, and state clarity \*\//);
 assert.match(css,/\.tabs\{position:sticky;top:var\(--panel-sticky-top\);z-index:3/);
 assert.match(app,/function scrollInspectorToTabStart\(\)/);
 assert.match(app,/panel\.scrollTo\(\{top:Math\.max\(0,content\.offsetTop-sticky\),behavior:'auto'\}\)/);
 assert.match(app,/renderPanel\(b\.dataset\.tab\);scrollInspectorToTabStart\(\)/);
});

test('V168 reference cards are keyboard-operable and expose selection state',()=>{
 assert.match(app,/data-reference-card=.*tabindex="0" role="button" aria-pressed=/);
 assert.match(app,/card\.onkeydown=event=>/);
 assert.match(app,/event\.key==='Enter'\|\|event\.key===' '/);
 assert.match(app,/x\.setAttribute\('aria-pressed',String\(active\)\)/);
 assert.match(css,/\.context-reference-card\[role="button"\]:focus-visible/);
});

test('V168 raises contextual reading sizes instead of relying on sub-10px desktop copy',()=>{
 assert.match(css,/\.asset-browser-copy small,\.asset-browser-copy span\{font-size:10px/);
 assert.match(css,/\.context-reference-card h4\{font-size:12px\}/);
 assert.match(css,/\.context-reference-card p,\.context-reference-card>a\{font-size:10px/);
 assert.match(css,/\.system-network-row strong,\.system-equipment-list button strong\{font-size:11px\}/);
 assert.match(css,/\.system-network-row small,\.system-network-row em,\.system-equipment-list button small,\.system-equipment-list button em\{font-size:9px/);
});

test('V168 has explicit initial loading and consistent empty/error treatment',()=>{
 assert.match(html,/ui-panel-state ui-panel-state-loading/);
 assert.match(html,/Menyiapkan detail…/);
 assert.match(css,/\.empty,\.universal-search-empty\{border:1px dashed/);
 assert.match(css,/\.inline-error\{padding:10px 12px;border:1px solid/);
 assert.match(css,/\.ui-state-spinner/);
});

test('V168 reading assets are cache-busted',()=>{
 assert.match(html,/app-shell-v79\.css\?v=168/);
 assert.match(html,/src\/app\.js\?v=176/);
 assert.match(sw,/factory-digital-twin-v176-workbench-selector-hotfix-20260923/);
});
