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
 assert.ok(paths.includes('src/reference-machines.js'));
 assert.ok(paths.includes('src/utility-routing.js'));
 assert.ok(paths.includes('src/data/compressed-air-routes.js'));
 assert.ok(paths.includes('src/data/ahu-pipe-routes.js'));
 assert.ok(paths.includes('src/data/ahu-duct-routes.js'));
 assert.ok(paths.includes('src/data/research-v121.js'));
 assert.ok(paths.includes('src/data/research-v122.js'));
 assert.ok(paths.includes('src/data/research-v123.js'));
 assert.ok(paths.includes('src/data/research-v136.js'));
 assert.ok(paths.includes('src/data/taxonomy-offset7.js'));
 assert.ok(paths.includes('src/data/taxonomy-qf100cs.js'));
 assert.ok(paths.includes('src/data/taxonomy-compressors.js'));
 assert.ok(paths.includes('src/data/taxonomy-collator.js'));
 assert.ok(paths.includes('src/data/taxonomy-suprasetter.js'));
 assert.ok(paths.includes('src/data/taxonomy-imagesetter.js'));
 assert.ok(paths.includes('src/data/taxonomy-zund.js'));
 assert.ok(paths.includes('src/data/taxonomy-ahu.js'));
 assert.ok(paths.includes('src/data/taxonomy-fgm2.js'));
 assert.ok(paths.includes('src/upg-ly300.js'));
 assert.ok(paths.includes('src/diana-eye55.js'));
 assert.equal(new Set(paths).size,paths.length,'service-worker shell cache should not contain duplicate asset paths');
 for(const path of paths)assert.ok(cacheSourceExists(path),path+' is listed in sw.js but is neither a frontend source nor a build-generated Three.js asset');
});

test('service-worker cache version advances with the centralized runtime release',()=>{
 assert.match(sw,/factory-digital-twin-v136-reference-mechanics-r1-20260922/);
});



test('machine-runtime dependencies are all present in the service-worker shell cache',()=>{
 const runtime=readFileSync(resolve(frontend,'src/machine-runtime.js'),'utf8');
 const imports=[...runtime.matchAll(/from\s+['"]\.\/([^'"]+)['"]/g)].map(m=>'src/'+m[1]);
 const cached=new Set([...sw.matchAll(/['"]\.\/([^'"]+)['"]/g)].map(m=>m[1]));
 for(const dependency of imports)assert.ok(cached.has(dependency),'machine-runtime dependency missing from service-worker cache: '+dependency);
});
