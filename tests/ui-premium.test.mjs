import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const css=fs.readFileSync(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V158 loads one unified adaptive shell after the stable base styles',()=>{
  assert.match(html,/style\.css[\s\S]*runtime-fallback\.css[\s\S]*app-shell-v79\.css\?v=192/);
  assert.match(html,/app\.js\?v=192[\s\S]*ui-v5\.js\?v=167[\s\S]*experience-v37\.js\?v=164[\s\S]*app-shell-v79\.js\?v=192/);
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
  assert.match(js,/function closeDrawer\(\)/);
  assert.match(js,/data-mobile-nav/);
  assert.match(js,/aria-expanded/);
});

test('premium generated splash is bounded and cannot get stuck',()=>{
  assert.match(css,/splash-industrial-v79\.webp/);
  assert.match(css,/\.app-splash\.is-done/);
  assert.match(js,/sessionStorage\.getItem\('bmj-splash-seen'\)/);
  assert.match(js,/if\(!documentLoaded\|\|!appReadyStatus\)return/);
  assert.match(js,/if\(!appReadyStatus\)document\.documentElement\.dataset\.appReady='timeout';finishSplash\(\)\},12000\)/);
  assert.doesNotMatch(js,/setTimeout\(finishSplash,5000\)/);
  assert.match(sw,/assets\/splash-industrial-v79\.webp/);
});

test('splash recovery is independent of module execution and document load',()=>{
  const script=html.match(/<script id="splash-recovery">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script,'recovery must be classic inline script before modules');
  assert.ok(html.indexOf('id="splash-recovery"')<html.indexOf('src="./src/app.js'));
  assert.match(script,/splash\.remove\(\)/);
  assert.match(script,/if\(!document\.documentElement\.dataset\.appReady\)/);
  assert.match(script,/12500/);
  for(const ready of [false,true]){
    let removed=false,scheduled=0;
    const boot={hidden:true,innerHTML:'',querySelector:()=>({onclick:null})};
    const splash={classList:{contains:()=>false},remove:()=>{removed=true}};
    const document={documentElement:{dataset:ready?{appReady:'ready'}:{}},querySelector:()=>splash,getElementById:()=>boot};
    vm.runInNewContext(script,{document,window:{setTimeout:(fn,ms)=>{scheduled=ms;fn()}},location:{reload(){}}});
    assert.equal(scheduled,12500);assert.equal(removed,true);
    assert.equal(boot.hidden,ready);
    if(!ready)assert.match(boot.innerHTML,/Aplikasi belum berhasil dimuat/);
  }
});

test('icons use one accessible vector family without emoji runtime controls',()=>{
  assert.match(js,/<symbol id="i-factory"/);
  assert.match(js,/<symbol id="i-settings"/);
  assert.match(js,/aria-hidden="true"/);
  assert.match(js,/viewBox="0 0 24 24"/);
});

test('service worker owns the current OEM-deep-detail shell assets',()=>{
 assert.match(sw,/factory-digital-twin-v192-mobile-camera-framing-20260923/);
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
