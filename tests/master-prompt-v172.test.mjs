import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const app=read('../frontend/src/app.js');
const shell=read('../frontend/src/app-shell-v79.js');
const sw=read('../frontend/sw.js');

test('V172 app readiness is emitted only after scene restoration resolves or fails visibly',()=>{
 assert.match(app,/function signalAppReady\(status='ready'\)/);
 assert.match(app,/document\.documentElement\.dataset\.appReady=normalized/);
 assert.match(app,/window\.dispatchEvent\(new CustomEvent\('bmj:appready'/);
 const startup=app.slice(app.indexOf('try{\n bundledLayout='),app.indexOf('function scrollInspectorToTabStart'));
 assert.match(startup,/await restoreHistoryContext\(\);[\s\S]*signalAppReady\('ready'\)/);
 assert.match(startup,/catch\(e\)\{[\s\S]*signalAppReady\('error'\)/);
});

test('V172 splash waits for both document load and restored app readiness',()=>{
 assert.match(shell,/let documentLoaded=document\.readyState==='complete',appReadyStatus=document\.documentElement\.dataset\.appReady\|\|null/);
 assert.match(shell,/const maybeFinishSplash=\(\)=>\{if\(!documentLoaded\|\|!appReadyStatus\)return/);
 assert.match(shell,/addEventListener\('bmj:appready'/);
 assert.match(shell,/if\(documentLoaded\)maybeFinishSplash\(\);else addEventListener\('load'/);
 assert.doesNotMatch(shell,/addEventListener\('load',\(\)=>setTimeout\(finishSplash/);
});

test('V172 readiness survives module-order races and has a bounded fail-safe',()=>{
 assert.match(shell,/appReadyStatus=document\.documentElement\.dataset\.appReady\|\|null/);
 assert.match(shell,/if\(appReadyStatus\)maybeFinishSplash\(\)/);
 assert.match(shell,/setTimeout\(\(\)=>\{if\(!appReadyStatus\)\{document\.documentElement\.dataset\.appReady='timeout';finishSplash\(\)\}\},12000\)/);
});

test('V172 runtime files and service worker are cache-busted',()=>{
 assert.match(html,/src\/app\.js\?v=174/);
 assert.match(html,/src\/app-shell-v79\.js\?v=173/);
 assert.match(sw,/factory-digital-twin-v174-navigation-selector-hotfix-20260923/);
});
