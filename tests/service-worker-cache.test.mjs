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

test('service-worker shell cache references only deployable frontend files',()=>{
 const paths=[...sw.matchAll(/['"]\.\/([^'"]+)['"]/g)].map(m=>m[1]);
 assert.ok(paths.includes('src/machine-runtime.js'));
 assert.ok(paths.includes('src/upg-ly300.js'));
 assert.ok(paths.includes('src/diana-eye55.js'));
 assert.equal(new Set(paths).size,paths.length,'service-worker shell cache should not contain duplicate asset paths');
 for(const path of paths)assert.ok(cacheSourceExists(path),path+' is listed in sw.js but is neither a frontend source nor a build-generated Three.js asset');
});

test('service-worker cache version advances with the centralized runtime release',()=>{
 assert.match(sw,/factory-digital-twin-v112-apm2-intermittent-20260921/);
});
