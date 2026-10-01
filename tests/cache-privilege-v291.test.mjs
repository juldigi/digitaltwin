import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {publicCacheState,cacheContainsPrivilegedState} from '../frontend/src/data/cache-policy.js';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');

test('V291 cached state preserves viewer-visible 3D state but strips privileged scene revision history',()=>{
 const source={
  revision:7,
  sceneOverrides:{'asset:BMJ-MCH-0003':{position:[1,0,2]}},
  sceneRevisions:[{id:'secret-revision',by:'Superadmin',overrides:{}}],
  asset:{asset_id:'BMJ-MCH-0003'}
 };
 const safe=publicCacheState(source);
 assert.equal('sceneRevisions' in safe,false);
 assert.deepEqual(safe.sceneOverrides,source.sceneOverrides);
 assert.deepEqual(safe.asset,source.asset);
 assert.equal(source.sceneRevisions.length,1,'sanitizing cache must not mutate live Superadmin state');
});

test('V291 legacy cached records with privileged history are detectable for safe rewrite',()=>{
 assert.equal(cacheContainsPrivilegedState({sceneRevisions:[]}),true);
 assert.equal(cacheContainsPrivilegedState({sceneOverrides:{}}),false);
 assert.equal(cacheContainsPrivilegedState(null),false);
});

test('V291 app sanitizes both cache writes and legacy cache reads',()=>{
 assert.match(app,/state:publicCacheState\(state\),savedAt:new Date\(\)\.toISOString\(\)/);
 assert.match(app,/const hadPrivileged=cacheContainsPrivilegedState\(cached\.state\),safeState=publicCacheState\(cached\.state\)/);
 assert.match(app,/if\(hadPrivileged\)await cache\.set\(apiBase,\{\.\.\.cached,state:safeState\}\)/);
 assert.match(app,/state=safeState/);
});
