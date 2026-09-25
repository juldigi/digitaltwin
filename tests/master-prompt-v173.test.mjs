import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const app=read('../frontend/src/app.js');
const shell=read('../frontend/src/app-shell-v79.js');
const sw=read('../frontend/sw.js');

test('V193 Factory navigation preserves view mode while business navigation is owned by app.js',()=>{
 const marker="const openFactoryNavigation=()=>";
 const start=app.indexOf(marker);
 assert.notEqual(start,-1);
 const handler=app.slice(start,app.indexOf(";const openAssetNavigation",start));
 assert.match(handler,/showHome\(\{historyMode:'push'\}\)/);
 assert.doesNotMatch(handler,/setViewMode\('3d'\)/);
 assert.doesNotMatch(handler,/workspace-2d/);
 assert.match(app,/on\('#nav-machine',openFactoryNavigation\)/);
 assert.match(app,/window\.addEventListener\('bmj:mobilefactoryrequest',safe\(openFactoryNavigation\)\)/);
 assert.doesNotMatch(shell,/q\('#nav-machine'\)\?\.addEventListener\('click'/);
 assert.match(shell,/function markSection\(section\)/);
});

test('V173 Home history snapshot keeps the active view mode',()=>{
 const body=app.slice(app.indexOf("function showHome"),app.indexOf("function connectionDialog"));
 assert.match(body,/historyMode==='push'\)pushContextHistory\(\{asset:null,node:null,scene:'factory',view:getAppState\(\)\.viewMode\|\|'3d',camera:'iso'\}\)/);
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
 assert.match(html,/src\/app\.js\?v=217/);
 assert.match(html,/src\/app-shell-v79\.js\?v=217/);
 assert.match(sw,/factory-digital-twin-v217-render-foundation-20260925/);
});
