import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const app=read('../frontend/src/app.js');
const shell=read('../frontend/src/app-shell-v79.js');
const sw=read('../frontend/sw.js');

test('Stage 6 app readiness writes canonical boot state only after scene restoration',()=>{
 assert.match(app,/function signalAppReady\(status='ready'\)/);
 assert.match(app,/setAppBoot\(normalized/);
 assert.doesNotMatch(app,/bmj:appready/);
 const startup=app.slice(app.indexOf('try{\n bundledLayout='),app.indexOf('function scrollInspectorToTabStart'));
 assert.match(startup,/await restoreHistoryContext\(\);[\s\S]*signalAppReady\('ready'\)/);
 assert.match(startup,/catch\(e\)\{[\s\S]*signalAppReady\('error'\)/);
});

test('Stage 6 splash derives exclusively from bootState and document readiness',()=>{
 assert.match(shell,/syncSplashFromState=state=>/);
 assert.match(shell,/bootState\?\.phase\|\|'booting'/);
 assert.match(shell,/if\(!documentLoaded\|\|!\['ready','error','timeout'\]\.includes\(phase\)\)return/);
 assert.doesNotMatch(shell,/bmj:appready/);
 assert.doesNotMatch(html,/splash-recovery/);
});

test('Stage 6 readiness has one bounded fail-safe',()=>{
 assert.match(shell,/const BOOT_TIMEOUT_MS=12500/);
 assert.match(shell,/if\(current\.bootState\?\.phase!=='booting'\)return/);
 assert.match(shell,/bootState:\{phase:'timeout',message:'Aplikasi belum berhasil dimuat'\}/);
});

test('V172 runtime files and service worker are cache-busted',()=>{
 assert.match(html,/src\/app\.js\?v=216/);
 assert.match(html,/src\/app-shell-v79\.js\?v=216/);
 assert.match(sw,/factory-digital-twin-v216-ui-boot-20260925/);
});
