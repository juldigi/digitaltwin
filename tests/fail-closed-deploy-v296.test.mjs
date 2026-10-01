import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const workflow=readFileSync(new URL('../.github/workflows/worker.yml',import.meta.url),'utf8');

test('V296 Cloudflare deployment never replaces production Worker when D1 preparation fails',()=>{
 const prepare=workflow.indexOf('name: Connect or create Digital Twin D1');
 const migrate=workflow.indexOf('name: Apply D1 migrations');
 const deploy=workflow.indexOf('name: Deploy current application to Cloudflare Workers');
 const report=workflow.indexOf('name: Report D1 permission failure');
 assert.ok(prepare>=0&&migrate>prepare&&deploy>migrate&&report>deploy);
 const deployBlock=workflow.slice(deploy,report);
 assert.match(deployBlock,/if: steps\.prepare_d1\.outcome == 'success'/);
 assert.match(workflow,/name: Apply D1 migrations[\s\S]*?if: steps\.prepare_d1\.outcome == 'success'/);
});

test('V296 D1 failure message states that deployment was cancelled and previous production remains',()=>{
 assert.match(workflow,/Deployment dibatalkan: D1 belum siap, sehingga Worker produksi sebelumnya tetap dipertahankan/);
 assert.doesNotMatch(workflow,/Worker terdeploy untuk perbaikan UI, tetapi D1 belum terhubung/);
});
