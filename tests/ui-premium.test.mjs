import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const corporateCss=fs.readFileSync(new URL('../frontend/ui-corporate-v74.css',import.meta.url),'utf8');
const mobileCss=fs.readFileSync(new URL('../frontend/mobile-flagship-v75.css',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const mobileJs=fs.readFileSync(new URL('../frontend/src/mobile-v75.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V75 mobile flagship stylesheet is the final cascade layer',()=>{
  assert.match(html,/experience-v37\.css[\s\S]*ui-corporate-v74\.css[\s\S]*mobile-flagship-v75\.css/);
  assert.match(html,/BMJ Digital Twin/);
});
test('phone shell reserves safe header and dedicated bottom navigation',()=>{
  assert.match(mobileCss,/@media \(max-width:767px\)/);
  assert.match(mobileCss,/--m75-nav:66px/);
  assert.match(mobileCss,/env\(safe-area-inset-bottom/);
  assert.match(mobileCss,/bottom:calc\(var\(--m75-nav\)/);
});
test('mobile navigation is independent from the desktop rail',()=>{
  assert.match(mobileCss,/\.rail\{display:none!important\}/);
  assert.match(mobileCss,/body\.nav-open \.rail/);
  assert.match(mobileCss,/\.mobile-nav/);
  assert.match(mobileCss,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
});
test('mobile action dock exposes only four core actions without horizontal scrolling',()=>{
  assert.match(mobileCss,/\.view-switch \[data-camera="fit"\]/);
  assert.match(mobileCss,/\.view-switch #tool-explode/);
  assert.match(mobileCss,/\.view-switch #tool-simulation/);
  assert.match(mobileCss,/\.view-switch \[data-camera="reset"\]/);
  assert.match(mobileCss,/overflow:visible!important/);
});
test('portrait bottom sheets and landscape side sheets are explicit',()=>{
  assert.match(mobileCss,/border-radius:24px 24px 0 0/);
  assert.match(mobileCss,/@media \(max-width:767px\) and \(orientation:landscape\)/);
  assert.match(mobileCss,/width:min\(440px,64vw\)/);
});
test('touch and accessibility safeguards remain explicit',()=>{
  assert.match(corporateCss,/min-width:44px/);
  assert.match(corporateCss,/:focus-visible/);
  assert.match(corporateCss,/@media \(prefers-reduced-motion:reduce\)/);
  assert.match(corporateCss,/@media \(prefers-contrast:more\)/);
  assert.match(mobileJs,/aria-current/);
});
test('service worker cache is bumped and includes V75 mobile UI',()=>{
  assert.match(sw,/factory-digital-twin-v75-20260921/);
  assert.match(sw,/ui-corporate-v74\.css/);
  assert.match(sw,/mobile-flagship-v75\.css/);
  assert.match(sw,/src\/mobile-v75\.js/);
});
