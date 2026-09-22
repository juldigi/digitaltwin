import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css=fs.readFileSync(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V119 loads one unified adaptive shell after the stable base styles',()=>{
  assert.match(html,/style\.css[\s\S]*runtime-fallback\.css[\s\S]*app-shell-v79\.css\?v=119/);
  assert.match(html,/app\.js\?v=81[\s\S]*ui-v5\.js\?v=119[\s\S]*experience-v37\.js\?v=81[\s\S]*app-shell-v79\.js\?v=119/);
  for(const stale of ['ui-premium-v73.css','ui-corporate-v74.css','reference-v76.css','mobile-stable-v78.css','reference-v76.js','mobile-stable-v78.js'])assert.doesNotMatch(html,new RegExp(stale.replaceAll('.','\\.')));
});

test('responsive contract covers phone tablet desktop and landscape',()=>{
  assert.match(css,/@media\(max-width:767px\)/);
  assert.match(css,/@media\(max-width:390px\)/);
  assert.match(css,/@media\(max-height:560px\) and \(orientation:landscape\)/);
  assert.match(css,/@media\(min-width:768px\) and \(max-width:1024px\)/);
  assert.match(css,/env\(safe-area-inset-bottom\)/);
  assert.match(css,/100dvh/);
  assert.match(css,/prefers-reduced-motion/);
  assert.match(css,/prefers-contrast:more/);
});

test('detail is an in-flow desktop inspector and a full mobile page',()=>{
  assert.match(css,/aside#detail-panel/);
  assert.match(css,/\.panel-hidden aside#detail-panel/);
  assert.match(css,/@media\(max-width:767px\)[\s\S]*aside#detail-panel\{position:absolute/);
  assert.match(css,/\.panel-hidden aside#detail-panel\{transform:translateX\(105%\)/);
});

test('mobile navigation and drawer have one state owner',()=>{
  assert.match(css,/body\.nav-open \.rail\{transform:none\}/);
  assert.match(css,/\.mobile-nav\{position:fixed/);
  assert.match(js,/const closeNav=/);
  assert.match(js,/data-mobile-nav/);
  assert.match(js,/aria-expanded/);
});

test('premium generated splash is bounded and cannot get stuck',()=>{
  assert.match(css,/splash-industrial-v79\.webp/);
  assert.match(css,/\.app-splash\.is-done/);
  assert.match(js,/sessionStorage\.getItem\('bmj-splash-seen'\)/);
  assert.match(js,/setTimeout\(finishSplash,5000\)/);
  assert.match(sw,/assets\/splash-industrial-v79\.webp/);
});

test('icons use one accessible vector family without emoji runtime controls',()=>{
  assert.match(js,/<symbol id="i-home"/);
  assert.match(js,/<symbol id="i-settings"/);
  assert.match(js,/aria-hidden="true"/);
  assert.match(js,/viewBox="0 0 24 24"/);
});

test('service worker owns the V123 OEM-deep-detail shell assets',()=>{
  assert.match(sw,/factory-digital-twin-v135-utility-routing-scaffold-20260922/);
  assert.match(sw,/app-shell-v79\.css/);
  assert.match(sw,/src\/app-shell-v79\.js/);
  assert.match(sw,/assets\/splash-industrial-v79\.webp/);
});


test('splash exists in first HTML paint before the application shell',()=>{
  const splash=html.indexOf('class="app-splash"'),header=html.indexOf('class="topbar"');
  assert.ok(splash>0&&splash<header,'splash must precede the visible application shell');
  assert.match(html,/<style id="splash-critical">[\s\S]*\.app-splash/);
  assert.doesNotMatch(js,/document\.createElement\('div'\);splash\.className='app-splash'/);
});
test('machine changes use in-place scene switching instead of page navigation',()=>{
  const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
  const engine=fs.readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');
  assert.match(app,/async function switchActiveMachine/);
  assert.match(app,/history\.pushState/);
  assert.doesNotMatch(app,/location\.href=.*machine=/);
  assert.match(engine,/switchMachine\(key\)/);
});

test('V81 prevents sidebar and toolbar overlap across constrained screens',()=>{
  assert.match(css,/scene-bottom\{width:min\(920px,calc\(100% - 40px\)\)/);
  assert.match(css,/@media \(min-width:768px\) and \(max-width:1180px\)/);
  assert.match(css,/aside#detail-panel\{position:absolute;z-index:75/);
  assert.match(css,/@media \(min-width:768px\) and \(max-height:720px\)/);
  assert.match(css,/html:fullscreen body/);
  assert.match(css,/html:fullscreen \.statusbar\{display:none\}/);
  assert.match(css,/\.rail\{width:100%;height:100%;min-height:0;overflow-y:auto/);
});
