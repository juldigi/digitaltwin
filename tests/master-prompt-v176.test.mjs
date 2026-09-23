import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const app=read('../frontend/src/app.js');
const sw=read('../frontend/sw.js');

test('V176 all forEach workbench bindings use collection selectors',()=>{
 assert.match(app,/\$\$\('\[data-workbench="dwg"\]'\)\.forEach/);
 assert.doesNotMatch(app,/\$\('\[data-workbench="dwg"\]'\)\.forEach/);
});

test('V176 blocks single-element query helpers from being iterated with forEach',()=>{
 assert.doesNotMatch(app,/(^|[^$])\$\([^\n;]+\)\.forEach/gm);
});

test('V176 keeps V175 2D selection redraw behavior intact',()=>{
 assert.match(app,/addEventListener\('bmj:statechange',event=>\{if\(document\.body\.classList\.contains\('workspace-2d'\)\)redrawPlantPlan\(event\.detail\?\.selectedAsset\|\|null\);\}\)/);
 assert.match(app,/drawPlantPlan\(\$\('#dwg-canvas'\),bundledLayout,\{selectedAsset:selectedMachineId\}\)/);
});

test('V176 fixed runtime and service worker are cache-busted',()=>{
 assert.match(html,/src\/app\.js\?v=176/);
 assert.match(html,/src\/app-shell-v79\.js\?v=174/);
 assert.match(sw,/factory-digital-twin-v176-workbench-selector-hotfix-20260923/);
});
