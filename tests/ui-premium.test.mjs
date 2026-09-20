import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const corporateCss=fs.readFileSync(new URL('../frontend/ui-corporate-v74.css',import.meta.url),'utf8');
const mobileCss=fs.readFileSync(new URL('../frontend/mobile-flagship-v75.css',import.meta.url),'utf8');
const referenceCss=fs.readFileSync(new URL('../frontend/reference-v76.css',import.meta.url),'utf8');
const referenceJs=fs.readFileSync(new URL('../frontend/src/reference-v76.js',import.meta.url),'utf8');
const mobileJs=fs.readFileSync(new URL('../frontend/src/mobile-v75.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V76 BMJ reference stylesheet is the final cascade layer',()=>{
  assert.match(html,/ui-corporate-v74\.css[\s\S]*mobile-flagship-v75\.css[\s\S]*reference-v76\.css/);
  assert.match(html,/reference-v76\.js\?v=76/);
});
test('desktop shell matches the supplied left-nav center-stage right-inspector composition',()=>{
  assert.match(referenceCss,/--v76-sidebar:174px/);
  assert.match(referenceCss,/--v76-inspector:370px/);
  assert.match(referenceCss,/\.top-kpis/);
  assert.match(referenceCss,/\.v76-selection-card/);
  assert.match(referenceCss,/#detail-panel/);
});
test('reference navigation exposes only real application features',()=>{
  assert.match(referenceJs,/Peta Pabrik/);
  assert.match(referenceJs,/v76-nav-simulation/);
  assert.match(referenceJs,/Referensi/);
  assert.match(referenceJs,/Exterior/);
  assert.doesNotMatch(referenceJs,/OEE|kWh|42\.6|12\.000/);
});
test('reference action grid delegates to existing 3D controls instead of duplicating engine logic',()=>{
  assert.match(referenceJs,/focus:'#focus-machine'/);
  assert.match(referenceJs,/explode:'#tool-explode'/);
  assert.match(referenceJs,/simulation:'#tool-simulation'/);
  assert.match(referenceJs,/reset:'\[data-camera="reset"\]'/);
});
test('mobile reference shell follows the supplied phone DNA without sacrificing safe areas',()=>{
  assert.match(referenceCss,/@media \(max-width:767px\)/);
  assert.match(referenceCss,/--v76-mobile-nav:62px/);
  assert.match(referenceCss,/env\(safe-area-inset-bottom/);
  assert.match(referenceCss,/grid-template-columns:repeat\(4,1fr\)/);
  assert.match(referenceCss,/\.v76-mobile-detail/);
});
test('legacy accessibility protections remain available under V76',()=>{
  assert.match(corporateCss,/:focus-visible/);
  assert.match(corporateCss,/@media \(prefers-reduced-motion:reduce\)/);
  assert.match(corporateCss,/@media \(prefers-contrast:more\)/);
  assert.match(mobileJs,/aria-current/);
});
test('service worker cache is bumped and includes V76 reference assets',()=>{
  assert.match(sw,/factory-digital-twin-v76-20260921/);
  assert.match(sw,/reference-v76\.css/);
  assert.match(sw,/src\/reference-v76\.js/);
});
