import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {prepareD1} from '../scripts/prepare-d1.mjs';

test('deploy config binds the existing D1 database without replacing unrelated settings',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'digitaltwin-d1-')),config=join(dir,'wrangler.toml');
 try{
  await writeFile(config,'name = "digitaltwin"\n[assets]\nbinding = "ASSETS"\n');
  const calls=[];
  const fetcher=async(url,options)=>{calls.push([url,options.method]);return {ok:true,json:async()=>({success:true,result:[{name:'digitaltwin-db',uuid:'123e4567-e89b-12d3-a456-426614174000'}]})};};
  await prepareD1({accountId:'account',token:'test',fetcher,config});
  const text=await readFile(config,'utf8');
  assert.match(text,/binding = "ASSETS"/);assert.match(text,/binding = "DB"/);
  assert.match(text,/database_id = "123e4567-e89b-12d3-a456-426614174000"/);
  assert.deepEqual(calls.map(([,method])=>method),['GET']);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('D1 binding failures stop deployment with an actionable error',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'digitaltwin-d1-')),config=join(dir,'wrangler.toml');
 try{
  await writeFile(config,'name = "digitaltwin"\n');
  await assert.rejects(prepareD1({accountId:'account',token:'test',config,fetcher:async()=>({ok:false,status:403,json:async()=>({success:false,errors:[{message:'Permission denied'}]})})}),/D1 Read dan D1 Write/);
  assert.doesNotMatch(await readFile(config,'utf8'),/d1_databases/);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('2D plan is a canonical workspace surface with the 3D switch kept reachable',async()=>{
 const css=await readFile(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');
 const shell=await readFile(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
 const html=await readFile(new URL('../frontend/index.html',import.meta.url),'utf8');
 assert.match(html,/id="plant-plan-2d"/);
 assert.match(css,/\.workspace-2d \.plant-plan-2d\{display:block!important\}/);
 assert.match(css,/\.workspace-2d \.viewport-mode-switch\{z-index:40!important;visibility:visible!important;pointer-events:auto!important\}/);
 assert.match(shell,/function applyViewModeDom\(state=getState\(\)\)/);
 assert.match(shell,/if\(modeSwitch&&centerStack\)centerStack\.append\(modeSwitch\)/);
});


test('Cloudflare workflow uses supported D1 migration syntax',async()=>{
 const workflow=await readFile(new URL('../.github/workflows/worker.yml',import.meta.url),'utf8');
 assert.match(workflow,/command:\s*d1 migrations apply DB --remote(?:\r?\n|$)/);
 assert.doesNotMatch(workflow,/d1 migrations apply DB --remote --yes/);
});
