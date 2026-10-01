import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {preserveSharedTwinState} from '../frontend/src/data/shared-twin-state.js';
import {initialState} from '../frontend/src/model.js';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');

test('V298 machine presentation reset preserves every shared root field but rebuilds asset state',()=>{
 const current={
  revision:17,
  asset:{asset_id:'BMJ-MCH-0024',description:'temporary active-machine presentation'},
  layout:{source:'DWG'},
  sceneOverrides:{'asset:a':{position:[1,0,2]}},
  sceneRevisions:[{id:'r1'}],
  futureSharedField:{enabled:true}
 };
 const next=preserveSharedTwinState(current,initialState);
 assert.equal(next.revision,17);
 assert.deepEqual(next.layout,{source:'DWG'});
 assert.deepEqual(next.sceneOverrides,current.sceneOverrides);
 assert.deepEqual(next.sceneRevisions,current.sceneRevisions);
 assert.deepEqual(next.futureSharedField,{enabled:true});
 assert.equal(next.asset.asset_id,initialState.asset.asset_id);
 assert.notEqual(next.asset,current.asset);
});

test('V298 preservation is deep-cloned so machine presentation edits cannot mutate cached/server snapshots',()=>{
 const current={revision:3,asset:{asset_id:'x'},sceneOverrides:{a:{position:[1,2,3]}},future:{list:[1,2]}};
 const next=preserveSharedTwinState(current,initialState);
 next.sceneOverrides.a.position[0]=99;next.future.list.push(3);
 assert.equal(current.sceneOverrides.a.position[0],1);
 assert.deepEqual(current.future.list,[1,2]);
});

test('V298 initial boot still starts from baseline when there is no shared state',()=>{
 assert.deepEqual(preserveSharedTwinState(undefined,initialState),structuredClone(initialState));
});

test('V298 app preserves shared server state only for machine presentation switches while disconnect remains a full reset',()=>{
 assert.match(app,/import \{preserveSharedTwinState\} from '\.\/data\/shared-twin-state\.js'/);
 assert.match(app,/function applyActiveMachineState\(\)\{\n state=preserveSharedTwinState\(state,initialState\);setReferenceFilter\('all'\);/);
 assert.match(app,/on\('#disconnect',[\s\S]*?state=structuredClone\(initialState\)/);
 assert.doesNotMatch(app,/function applyActiveMachineState\(\)\{\n state=structuredClone\(initialState\)/);
});
