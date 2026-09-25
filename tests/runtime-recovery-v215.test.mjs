import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=file=>readFileSync(new URL('../frontend/'+file,import.meta.url),'utf8');
const html=read('index.html');
const sw=read('sw.js');
const app=read('src/app.js');
const shell=read('src/app-shell-v79.js');
const css=read('app-shell-v79.css');
const engine=read('src/engine.js');

test('V215 service worker bootstraps before application modules and self-heals stale controllers',()=>{
 const bootstrap=html.indexOf('id="sw-bootstrap"'),appModule=html.indexOf('src="./src/app.js?v=217"');
 assert.ok(bootstrap>0&&bootstrap<appModule);
 assert.match(html,/serviceWorker\.register\('\.\/sw\.js'\)/);
 assert.match(html,/controllerchange/);
 assert.match(html,/bmj-sw-v217-reloaded/);
 assert.doesNotMatch(app,/serviceWorker\.register\('\.\/sw\.js'\)/);
 assert.match(sw,/caches\.match\(request,\{ignoreSearch:true\}\)/);
});

test('V215 mobile navigation no longer proxies to hidden desktop navigation buttons',()=>{
 assert.match(shell,/dispatchEvent\(new CustomEvent\('bmj:mobilefactoryrequest'\)\)/);
 assert.match(shell,/dispatchEvent\(new CustomEvent\('bmj:mobileassetrequest'\)\)/);
 assert.doesNotMatch(shell,/const MOBILE_TARGET=/);
 assert.match(app,/window\.addEventListener\('bmj:mobilefactoryrequest'/);
 assert.match(app,/window\.addEventListener\('bmj:mobileassetrequest'/);
});

test('V215 mobile drawer owns a real fixed backdrop and leaves bottom navigation recoverable',()=>{
 assert.match(css,/\/\* V215 runtime recovery/);
 assert.match(css,/\.ui-backdrop\{\s*display:none;position:fixed;inset:0/);
 assert.match(css,/body\.nav-open \.mobile-nav\{z-index:111!important;pointer-events:auto!important\}/);
});

test('V215 renderer starts mobile in low-memory mode and degrades to 2D without killing navigation',()=>{
 assert.match(engine,/const mobileRender=matchMedia\('\(max-width:767px\)'\)\.matches\|\|matchMedia\('\(pointer:coarse\)'\)\.matches/);
 assert.match(engine,/antialias:!mobileRender/);
 assert.match(engine,/configureRenderer\(this\.renderer,\{profile:this\.qualityProfile,devicePixelRatio/);
 assert.match(engine,/configureRenderer\(this\.renderer,\{profile:this\.qualityProfile,devicePixelRatio/);
 assert.match(engine,/webglcontextlost/);
 assert.match(engine,/webglcontextrestored/);
 assert.match(app,/function handleEngineError/);
 assert.match(app,/classList\.add\('workspace-2d','webgl-unavailable'\)/);
 assert.match(app,/Denah 2D aktif · navigasi tetap tersedia/);
});

test('V215 factory upgrade refits the camera after swapping to the mobile proxy',()=>{
 assert.match(app,/engine\?\.loadLayout\(activeLayout\(\)\);if\(engine\?\.view==='factory'\)engine\.fit\(engine\.factory,'iso',false\)/);
});
