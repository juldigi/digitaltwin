import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

test('factory home initializes with no machine selected',()=>{
 const source=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
 const start=source.indexOf('function applyActiveMachineState(){');
 const end=source.indexOf('\napplyActiveMachineState();',start);
 assert.ok(start>=0&&end>start,'machine state initializer exists');
 const context={
  structuredClone:value=>JSON.parse(JSON.stringify(value)),
  initialState:{asset:{manufacturer:'previous machine'}},
  setReferenceFilter:()=>{},setAppSimulation:()=>{},MACHINE_KEY:null,IS_SHEETING:false
 };
 // Keep the real initializer intact so this covers its default home route.
 const result=runInNewContext(source.slice(start,end)+'\napplyActiveMachineState(); state.asset',context);
 assert.equal(result.asset_id,null);
 assert.equal(result.manufacturer,null);
 assert.equal(result.description,'Belum memilih mesin');
});
