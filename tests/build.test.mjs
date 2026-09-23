import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {execFileSync} from 'node:child_process';

test('production HTML resolves the complete local module graph at a GitHub Pages subpath',()=>{
  execFileSync(process.execPath,['scripts/build.mjs']);
  const root=resolve('dist'), html=readFileSync(resolve(root,'index.html'),'utf8');
  assert.match(html,/<script type="module" src="\.\/src\/app\.js\?v=174"><\/script>/);
  const seen=new Set();
  function visit(file){
    assert.ok(existsSync(file),`Missing production module: ${file}`);
    if(seen.has(file))return;
    seen.add(file);
    const source=readFileSync(file,'utf8');
    for(const [,specifier] of source.matchAll(/(?:\bfrom\s*|\bimport\s*)['"]([^'"]+)['"]/g)){
      const next=specifier==='three'?resolve(root,'vendor/three/build/three.module.js'):
        specifier.startsWith('three/addons/')?resolve(root,'vendor/three/addons',specifier.slice(13)):
        specifier.startsWith('.')?resolve(dirname(file),specifier):null;
      assert.ok(next,`Unmapped module ${specifier} in ${file}`);
      visit(next);
    }
  }
  for(const [,src] of html.matchAll(/<script type="module" src="([^"]+)"/g))visit(resolve(root,src.split('?')[0]));
  assert.ok(seen.has(resolve(root,'src/engine.js')));
  assert.ok(seen.has(resolve(root,'src/data/dimensions-offset5.js')));
  assert.ok(seen.has(resolve(root,'src/offset5.js')));
  assert.ok(seen.has(resolve(root,'src/simulation.js')));
  assert.ok(seen.has(resolve(root,'src/app-shell-v79.js')));
  for(const excluded of [
    'src/machine-runtime.js','src/universal-machine.js','src/offset10.js','src/simulation-offset10.js',
    'src/apm2.js','src/simulation-apm2.js','src/sheeting.js','src/simulation-sheeting.js',
    'src/offset8.js','src/offset9.js','src/mk920.js','src/mk1060.js'
  ])assert.ok(!seen.has(resolve(root,excluded)),excluded+' must stay out of the Phase-1 startup module graph');
});
