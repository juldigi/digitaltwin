import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const mobileCss=fs.readFileSync(new URL('../frontend/mobile-stable-v78.css',import.meta.url),'utf8');
const mobileJs=fs.readFileSync(new URL('../frontend/src/mobile-stable-v78.js',import.meta.url),'utf8');
const referenceCss=fs.readFileSync(new URL('../frontend/reference-v76.css',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V78 fresh mobile shell is loaded last with cache-busting URLs',()=>{
  assert.match(html,/reference-v76\.css\?v=78[\s\S]*mobile-stable-v78\.css\?v=78/);
  assert.match(html,/reference-v76\.js\?v=78[\s\S]*mobile-stable-v78\.js\?v=78/);
});
test('detail is a full mobile page rather than an overlay sheet',()=>{
  assert.match(mobileCss,/body:not\(\.panel-hidden\) \.center-stack\{display:none!important\}/);
  assert.match(mobileCss,/#detail-panel[\s\S]*top:calc\(var\(--m78-head\)/);
  assert.match(mobileCss,/#detail-panel[\s\S]*border-radius:0!important/);
  assert.match(mobileCss,/#detail-panel[\s\S]*background:#fff!important/);
});
test('selected summary cannot overlap machine detail',()=>{
  assert.match(mobileCss,/body:not\(\.panel-hidden\) \.center-stack\{display:none!important\}/);
  assert.match(mobileCss,/\.v76-selection-card[\s\S]*z-index:40!important/);
  assert.match(mobileCss,/#detail-panel[\s\S]*z-index:650!important/);
});
test('2D and 3D are one horizontal segmented control',()=>{
  assert.match(mobileCss,/\.viewport-mode-switch[\s\S]*display:grid!important/);
  assert.match(mobileCss,/grid-template-columns:1fr 1fr!important/);
  assert.match(mobileCss,/grid-auto-flow:column!important/);
});
test('legacy toolbars and floating widgets cannot permanently cover phone screen',()=>{
  assert.match(mobileCss,/\.scene-heading,.scene-bottom,.view-switch,.ui-mobile-actions,.telemetry-strip,.asset-legend/);
  assert.match(mobileCss,/\.rail\{display:none!important\}/);
  assert.match(mobileCss,/body:not\(\.nav-open\) \.rail\{display:none!important\}/);
  assert.match(mobileCss,/\[hidden\]\{display:none!important\}/);
});
test('detail never activates blur backdrop',()=>{
  assert.match(mobileCss,/body:not\(\.panel-hidden\) \.ui-backdrop,body\.mobile-panel-open \.ui-backdrop\{display:none!important/);
  assert.match(mobileCss,/backdrop-filter:none!important/);
  assert.match(mobileJs,/m78CleanTransient/);
});
test('V78 forces the phone shell to the supplied light corporate DNA',()=>{
  assert.match(mobileCss,/\.topbar[\s\S]*background:#fff!important/);
  assert.match(mobileJs,/classList\.add\('light-mode'\)/);
});
test('service worker cache uses new V78 shell files',()=>{
  assert.match(sw,/factory-digital-twin-v78-mobile-clean-20260921/);
  assert.match(sw,/mobile-stable-v78\.css/);
  assert.match(sw,/src\/mobile-stable-v78\.js/);
});
