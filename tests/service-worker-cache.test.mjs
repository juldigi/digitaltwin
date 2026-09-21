import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const frontend=resolve(dirname(fileURLToPath(import.meta.url)),'../frontend');
const sw=readFileSync(resolve(frontend,'sw.js'),'utf8');

test('service-worker shell cache references only real frontend files',()=>{
 const paths=[...sw.matchAll(/['"]\.\/([^'"]+)['"]/g)].map(m=>m[1]);
 assert.ok(paths.includes('src/machine-runtime.js'));
 assert.ok(paths.includes('src/upg-ly300.js'));
 assert.ok(paths.includes('src/diana-eye55.js'));
 assert.equal(new Set(paths).size,paths.length,'service-worker shell cache should not contain duplicate asset paths');
 for(const path of paths)assert.ok(existsSync(resolve(frontend,path)),path+' is listed in sw.js but does not exist');
});

test('service-worker cache version advances with the centralized runtime release',()=>{
 assert.match(sw,/factory-digital-twin-v94-runtime-registry-20260921/);
});
