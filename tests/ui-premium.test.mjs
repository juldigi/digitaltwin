import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css=fs.readFileSync(new URL('../frontend/ui-corporate-v74.css',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V74 corporate stylesheet is the final cascade layer',()=>{
  assert.match(html,/experience-v37\.css[\s\S]*ui-corporate-v74\.css/);
  assert.match(html,/BMJ Digital Twin/);
});
test('phone shell reserves safe header and bottom navigation',()=>{
  assert.match(css,/@media \(max-width:767px\)/);
  assert.match(css,/--v74-bottom-nav:64px/);
  assert.match(css,/env\(safe-area-inset-bottom/);
  assert.match(css,/bottom:calc\(var\(--v74-bottom-nav\)/);
});
test('mobile primary navigation is intentionally reduced',()=>{
  assert.match(css,/#nav-exterior,#nav-sources,#nav-view-panels\{display:none!important\}/);
  assert.match(css,/body\.nav-open #nav-exterior/);
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});
test('mobile action dock exposes only four core actions',()=>{
  assert.match(css,/\.view-switch \[data-camera="fit"\]/);
  assert.match(css,/\.view-switch #tool-explode/);
  assert.match(css,/\.view-switch #tool-simulation/);
  assert.match(css,/\.view-switch \[data-camera="reset"\]/);
});
test('portrait sheets and landscape side sheets are explicit',()=>{
  assert.match(css,/border-radius:22px 22px 0 0/);
  assert.match(css,/@media \(max-width:767px\) and \(orientation:landscape\)/);
  assert.match(css,/width:min\(430px,62vw\)/);
});
test('touch and accessibility safeguards remain explicit',()=>{
  assert.match(css,/min-width:44px/);
  assert.match(css,/:focus-visible/);
  assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
  assert.match(css,/@media \(prefers-contrast:more\)/);
});
test('service worker cache is bumped and includes V74 UI',()=>{
  assert.match(sw,/factory-digital-twin-v74-20260921/);
  assert.match(sw,/ui-corporate-v74\.css/);
});
