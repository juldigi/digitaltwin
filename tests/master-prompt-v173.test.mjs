import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const app=read('../frontend/src/app.js');
const shell=read('../frontend/src/app-shell-v79.js');
const sw=read('../frontend/sw.js');

test('V173 Factory navigation preserves the current 2D or 3D view mode',()=>{
 const marker="q('#nav-machine')?.addEventListener('click'";
 const start=shell.indexOf(marker);
 assert.notEqual(start,-1);
 const handler=shell.slice(start,shell.indexOf('\n',start));
 assert.match(handler,/navigateSection\('factory'\)/);
 assert.match(shell,/function navigateSection\(section,[\s\S]*setActiveSection\(section\);markSection\(section\)/);
 assert.doesNotMatch(handler,/setViewMode\('3d'\)/);
 assert.doesNotMatch(handler,/workspace-2d/);
});

test('V173 Home history snapshot keeps the active view mode',()=>{
 const body=app.slice(app.indexOf("function showHome"),app.indexOf("function connectionDialog"));
 assert.match(body,/historyMode==='push'\)pushContextHistory\(\{asset:null,node:null,scene:'factory',view:window\.BMJAppState\?\.getState\?\.\(\)\.viewMode\|\|'3d',camera:'iso'\}\)/);
 assert.match(body,/setView\('factory'\)/);
});

test('V173 setView immediately highlights the matching global navigation item',()=>{
 const body=app.slice(app.indexOf("function setView(view)"),app.indexOf("function showHome"));
 assert.match(body,/\$\$\('\.rail>button'\)\.forEach\(b=>b\.classList\.remove\('active'\)\)/);
 assert.match(body,/\$\(view==='factory'\?'#nav-machine':'#nav-assets'\)\?\.classList\.add\('active'\)/);
 assert.doesNotMatch(body,/\n \$\('#nav-machine'\)\?\.classList\.add\('active'\);/);
});

test('V173 dedicated mode buttons remain the only controls that intentionally change view mode',()=>{
 assert.match(shell,/q\('#mode-2d'\)\?\.addEventListener\('click',[\s\S]*?setViewMode\('2d'\)/);
 assert.match(shell,/q\('#mode-3d'\)\?\.addEventListener\('click',[\s\S]*?setViewMode\('3d'\)/);
});

test('V173 runtime files and service worker are cache-busted',()=>{
 assert.match(html,/src\/app\.js\?v=192/);
 assert.match(html,/src\/app-shell-v79\.js\?v=192/);
 assert.match(sw,/factory-digital-twin-v192-mobile-camera-framing-20260923/);
});
