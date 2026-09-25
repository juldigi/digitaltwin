import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const sw=read('../frontend/sw.js');
const runtimeFiles=[
  '../frontend/src/app.js',
  '../frontend/src/app-shell-v79.js',
  '../frontend/src/ui-v5.js',
  '../frontend/src/experience-v37.js'
];

test('V194 removes retired workbench bindings from the runtime',()=>{
  const app=read('../frontend/src/app.js');
  const ui=read('../frontend/src/ui-v5.js');
  assert.doesNotMatch(app,/data-workbench/);
  assert.doesNotMatch(ui,/workbench/i);
  assert.match(html,/id="plant-plan-2d"/);
  assert.match(html,/id="dwg-canvas"/);
});

test('V176 runtime forbids direct forEach on the single-element selector helper',()=>{
  const unsafe=/(^|[^$])\$\([^\n;]*?\)\.forEach\s*\(/gm;
  const offenders=[];
  for(const file of runtimeFiles){
    const source=read(file);
    let match;
    while((match=unsafe.exec(source))){
      const line=source.slice(0,match.index).split('\n').length;
      offenders.push({file,line,excerpt:match[0]});
    }
  }
  assert.deepEqual(offenders,[]);
});

test('V176 repaired runtime is cache-busted for already deployed V175 clients',()=>{
  assert.match(html,/src\/app\.js\?v=219/);
  assert.match(sw,/factory-digital-twin-v219-cinematic-focus-20260925/);
});
