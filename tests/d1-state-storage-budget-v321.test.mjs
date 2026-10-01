import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {D1_STATE_STORAGE_BUDGET,serializeStateForD1} from '../backend/state-storage-budget.js';

const worker=readFileSync(new URL('../backend/worker.js',import.meta.url),'utf8');

test('V321 keeps persisted twin state below the D1 safety budget by trimming oldest scene revisions first',()=>{
 const state={
  revision:12,
  sceneOverrides:{current:{value:'current'}},
  sceneRevisions:Array.from({length:6},(_,index)=>({id:'r'+index,at:String(index),overrides:{blob:'x'.repeat(520)}}))
 };
 const result=serializeStateForD1(state,{budget:1900});
 assert.ok(result.bytes<=1900);
 assert.ok(result.trimmedRevisions>0);
 assert.equal(state.sceneRevisions.at(-1).id,'r5');
 assert.equal(state.sceneRevisions[0].id,'r'+result.trimmedRevisions);
 assert.deepEqual(state.sceneOverrides,{current:{value:'current'}});
 assert.equal(Buffer.byteLength(result.payload,'utf8'),result.bytes);
});

test('V321 never truncates the current scene or layout to force an oversized state into D1',()=>{
 const state={sceneOverrides:{blob:'x'.repeat(3000)},sceneRevisions:[]};
 assert.throws(
  ()=>serializeStateForD1(state,{budget:1000}),
  error=>error?.status===413&&error?.code==='D1_STATE_TOO_LARGE'&&/terlalu besar/.test(error.message)
 );
 assert.equal(state.sceneOverrides.blob.length,3000);
});

test('V321 counts UTF-8 bytes rather than JavaScript character count',()=>{
 const state={label:'é'.repeat(300),sceneRevisions:[]};
 const result=serializeStateForD1(state,{budget:1000});
 assert.ok(result.bytes>JSON.stringify(state).length);
 assert.equal(Buffer.byteLength(result.payload,'utf8'),result.bytes);
});

test('V321 production budget retains safety headroom below the D1 two-million-byte row ceiling',()=>{
 assert.equal(D1_STATE_STORAGE_BUDGET,1_800_000);
 assert.ok(D1_STATE_STORAGE_BUDGET<2_000_000);
});

test('V321 worker persists the budgeted payload, not an unchecked JSON.stringify(state)',()=>{
 assert.match(worker,/import \{serializeStateForD1\} from '\.\/state-storage-budget\.js'/);
 assert.match(worker,/const storage=serializeStateForD1\(state\)/);
 assert.match(worker,/\.bind\(storage\.payload,state\.revision,old\)\.run\(\)/);
 assert.doesNotMatch(worker,/\.bind\(JSON\.stringify\(state\),state\.revision,old\)\.run\(\)/);
});
