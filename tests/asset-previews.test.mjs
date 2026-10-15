import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';

test('every registered asset has a compact, nonempty preview that decodes without WebGL',()=>{
 execFileSync(process.execPath,['scripts/bake-asset-previews.mjs']);let bytes=0;
 for(const m of MACHINE_REGISTRY){
  const png=readFileSync(`frontend/assets/machines/${m.machineId}.png`);bytes+=png.length;
  assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10]);
  assert.equal(png.readUInt32BE(16),640);assert.equal(png.readUInt32BE(20),320);
  const chunks=[];for(let i=8;i<png.length;){const n=png.readUInt32BE(i),type=png.toString('ascii',i+4,i+8);if(type==='IDAT')chunks.push(png.subarray(i+8,i+8+n));i+=n+12;}
  const raw=inflateSync(Buffer.concat(chunks));assert.equal(raw.length,320*(640*4+1));let painted=0;
  for(let y=0;y<320;y++)for(let x=0;x<640;x++)if(raw[y*(640*4+1)+1+x*4+3])painted++;
  assert.ok(painted>500,m.machineId+' blank preview');assert.ok(painted<640*320*.8,m.machineId+' clipped preview');
 }
 assert.ok(bytes<1024*1024,'preview payload must remain bounded for mobile');
});
