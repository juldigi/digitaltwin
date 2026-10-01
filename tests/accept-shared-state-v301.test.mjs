import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mergeIncomingSharedTwinState} from '../frontend/src/data/shared-twin-state.js';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');

test('V301 incoming server state replaces shared roots but preserves the local active-machine presentation asset',()=>{
 const current={revision:4,asset:{asset_id:'BMJ-MCH-0024',description:'UPG-LY300 presentation'},layout:{old:true},sceneOverrides:{a:{position:[0,0,0]}}};
 const incoming={revision:9,asset:{asset_id:'MACHINE-OFFSET5',description:'legacy server asset'},layout:{new:true},sceneOverrides:{b:{position:[1,0,0]}},sceneRevisions:[{id:'r9'}]};
 const merged=mergeIncomingSharedTwinState(incoming,current);
 assert.equal(merged.revision,9);
 assert.deepEqual(merged.layout,{new:true});
 assert.deepEqual(merged.sceneOverrides,incoming.sceneOverrides);
 assert.deepEqual(merged.sceneRevisions,incoming.sceneRevisions);
 assert.deepEqual(merged.asset,current.asset);
 assert.notEqual(merged.asset,current.asset);
});

test('V301 incoming merge does not mutate server response or current presentation state',()=>{
 const current={asset:{asset_id:'BMJ-MCH-0019',nested:{a:1}}};
 const incoming={revision:2,layout:{zones:[1]},asset:{asset_id:'legacy'}};
 const merged=mergeIncomingSharedTwinState(incoming,current);
 merged.asset.nested.a=9;merged.layout.zones.push(2);
 assert.equal(current.asset.nested.a,1);
 assert.deepEqual(incoming.layout.zones,[1]);
});

test('V301 acceptState keeps privileged server state in memory but caches the sanitized incoming server snapshot',()=>{
 assert.match(app,/state=mergeIncomingSharedTwinState\(next,state\)/);
 assert.match(app,/engine\?\.applySceneOverrides\(next\.sceneOverrides\|\|\{\}\)/);
 assert.match(app,/cache\.set\(apiBase,\{state:publicCacheState\(next\),savedAt:/);
 assert.doesNotMatch(app,/cache\.set\(apiBase,\{state:publicCacheState\(state\),savedAt:/);
});

test('V301 cached shared state cannot overwrite the no-machine or active-machine presentation asset',()=>{
 assert.match(app,/state=mergeIncomingSharedTwinState\(safeState,state\)/);
 assert.doesNotMatch(app,/state=safeState;if\(hadPrivileged\)/);
});
