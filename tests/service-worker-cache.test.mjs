import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const repoRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const frontend=resolve(repoRoot,'frontend');
const sw=readFileSync(resolve(frontend,'sw.js'),'utf8');

function cacheSourceExists(path){
 if(path.startsWith('vendor/three/build/'))return existsSync(resolve(repoRoot,'node_modules/three/build',path.slice('vendor/three/build/'.length)));
 if(path.startsWith('vendor/three/addons/'))return existsSync(resolve(repoRoot,'node_modules/three/examples/jsm',path.slice('vendor/three/addons/'.length)));
 return existsSync(resolve(frontend,path));
}

test('service-worker Phase-1 shell cache references only deployable frontend files',()=>{
 const paths=[...sw.matchAll(/['"]\.\/([^'"]+)['"]/g)].map(m=>m[1]);
 for(const required of [
  'src/app.js','src/app-shell-v79.js','src/state/app-state.js','src/engine.js','src/offset5.js','src/simulation.js',
  'src/data/foundation-scope.js','src/data/truth-status.js','src/data/dwg-fidelity.js','src/data/taxonomy-offset5.js',
  'src/factory-building.js','src/factory-ipal-photo-v205.js','src/data/ipal-photo-evidence-v205.js','src/utility-routing.js','src/data/plant-actual.js','src/data/factory-fleet-data.js'
 ])assert.ok(paths.includes(required),required+' missing from Phase-1 offline shell');
 assert.equal(new Set(paths).size,paths.length,'service-worker shell cache should not contain duplicate asset paths');
 for(const path of paths)assert.ok(cacheSourceExists(path),path+' is listed in sw.js but is neither a frontend source nor a build-generated Three.js asset');
});

test('service-worker cache version advances with the Phase-1 foundation release',()=>{
 assert.match(sw,/factory-digital-twin-v205-ipal-photo-actual-20260924/);
});

test('service-worker does not pre-cache technical expansion machine modules',()=>{
 for(const excluded of [
  'src/machine-runtime.js','src/reference-machines.js','src/offset10.js','src/apm2.js','src/sheeting.js',
  'src/offset8.js','src/offset9.js','src/mk920.js','src/mk1060.js','src/promatrix106.js',
  'src/data/taxonomy-compressors.js','src/data/taxonomy-ahu.js','src/data/research-v147.js'
 ])assert.ok(!sw.includes("'./"+excluded+"'"),excluded+' must remain out of Phase-1 offline precache');
});
