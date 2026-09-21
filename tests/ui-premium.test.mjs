import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const corporateCss=fs.readFileSync(new URL('../frontend/ui-corporate-v74.css',import.meta.url),'utf8');
const referenceCss=fs.readFileSync(new URL('../frontend/reference-v76.css',import.meta.url),'utf8');
const referenceJs=fs.readFileSync(new URL('../frontend/src/reference-v76.js',import.meta.url),'utf8');
const uiJs=fs.readFileSync(new URL('../frontend/src/ui-v5.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V77 runs one reference UI shell without the conflicting V75 runtime layer',()=>{
  assert.match(html,/ui-corporate-v74\.css[\s\S]*reference-v76\.css/);
  assert.doesNotMatch(html,/mobile-flagship-v75\.css/);
  assert.doesNotMatch(html,/src\/mobile-v75\.js/);
  assert.match(html,/reference-v76\.js\?v=77/);
});
test('hidden floating tools can never override the hidden attribute',()=>{
  assert.match(referenceCss,/\[hidden\]\{display:none!important\}/);
  assert.match(referenceCss,/\.floating-window\[hidden\]/);
});
test('opening machine detail does not trigger a full-screen blur backdrop',()=>{
  assert.match(referenceCss,/body\.mobile-panel-open \.ui-backdrop[\s\S]*display:none!important/);
  assert.match(referenceCss,/#detail-panel[\s\S]*z-index:520!important/);
  assert.match(referenceCss,/backdrop-filter:none!important/);
});
test('legacy phone toolbars are explicitly suppressed in V77',()=>{
  assert.match(referenceCss,/\.scene-bottom,.view-switch,.ui-mobile-actions,.telemetry-strip,.viewport-zoom,.compass,.asset-legend,.scene-caption/);
  assert.match(referenceCss,/body:not\(\.nav-open\) \.rail\{display:none!important\}/);
});
test('mobile navigation is handled by the V77 reference controller',()=>{
  assert.match(referenceJs,/v76BuildMobileNav/);
  assert.match(referenceJs,/targets=\{machine:'#nav-machine',layout:'#nav-layout',assets:'#nav-assets',components:'#nav-components'\}/);
  assert.match(referenceJs,/aria-current/);
});
test('detail state is separated from transient overlay state',()=>{
  assert.match(uiJs,/if\(matchMedia\('\(max-width:767px\)'\)\.matches\)document\.body\.classList\.add\('mobile-panel-open'\)/);
  assert.match(uiJs,/function closeTransientPanels\(\)[\s\S]*remove\('nav-open','ui-workbench-open'\)/);
});
test('desktop reference composition remains intact',()=>{
  assert.match(referenceCss,/--v76-sidebar:174px/);
  assert.match(referenceCss,/--v76-inspector:370px/);
  assert.match(referenceCss,/\.v76-selection-card/);
});
test('accessibility protections remain available',()=>{
  assert.match(corporateCss,/:focus-visible/);
  assert.match(corporateCss,/@media \(prefers-reduced-motion:reduce\)/);
  assert.match(corporateCss,/@media \(prefers-contrast:more\)/);
});
test('service worker uses a fresh V77 cache without obsolete V75 runtime assets',()=>{
  assert.match(sw,/factory-digital-twin-v77-stable-20260921/);
  assert.match(sw,/reference-v76\.css/);
  assert.match(sw,/src\/reference-v76\.js/);
  assert.doesNotMatch(sw,/mobile-flagship-v75\.css/);
  assert.doesNotMatch(sw,/src\/mobile-v75\.js/);
});
