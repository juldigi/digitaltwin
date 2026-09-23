import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const app=read('../frontend/src/app.js');
const shell=read('../frontend/src/app-shell-v79.js');
const sw=read('../frontend/sw.js');

test('V174 setView uses the rail collection selector before iterating',()=>{
 const body=app.slice(app.indexOf("function setView(view)"),app.indexOf("function showHome"));
 assert.match(body,/\$\$\('\.rail>button'\)\.forEach\(b=>b\.classList\.remove\('active'\)\)/);
 assert.match(body,/\$\(view==='factory'\?'#nav-machine':'#nav-assets'\)\?\.classList\.add\('active'\)/);
 assert.doesNotMatch(body,/^\s*\$\([^)]*\)\.forEach/m);
});

test('V174 preserves the V173 Factory mode behavior while fixing selector safety',()=>{
 const marker="q('#nav-machine')?.addEventListener('click'";
 const start=shell.indexOf(marker);
 assert.notEqual(start,-1);
 const handler=shell.slice(start,shell.indexOf('\n',start));
 assert.doesNotMatch(handler,/setViewMode\('3d'\)/);
 assert.doesNotMatch(handler,/workspace-2d/);
 assert.match(handler,/setActiveSection\('factory'\)/);
});

test('V174 corrected app runtime is cache-busted without unnecessary shell churn',()=>{
 assert.match(html,/src\/app\.js\?v=174/);
 assert.match(html,/src\/app-shell-v79\.js\?v=173/);
 assert.match(sw,/factory-digital-twin-v174-navigation-selector-hotfix-20260923/);
});
