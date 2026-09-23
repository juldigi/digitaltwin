import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const app=read('../frontend/src/app.js');
const html=read('../frontend/index.html');
const sw=read('../frontend/sw.js');

test('WebGL failure falls back to the actual 2D plant drawing with honest guidance',()=>{
 const start=app.indexOf("function showHome({historyMode='none'}={}){");
 const end=app.indexOf('function connectionDialog',start);
 assert.ok(start>=0&&end>start);
 const home=app.slice(start,end);
 assert.match(home,/if\(!engine\)\{/);
 assert.match(home,/document\.body\.classList\.add\('workspace-2d'\)/);
 assert.match(home,/three\.disabled=true/);
 assert.match(home,/Denah 2D tetap dapat digunakan/);
 assert.match(home,/params\.set\('view','2d'\)/);
 assert.match(home,/emitDomainState\(\{viewMode:'2d'\}\)/);
 assert.match(app,/redrawPlantPlan\(\)/);
});

test('new app controller is cache-busted on existing devices',()=>{
 assert.match(html,/src\/app\.js\?v=184/);
 assert.match(sw,/factory-digital-twin-v184-simulation-overlay-hardening-20260923/);
});
