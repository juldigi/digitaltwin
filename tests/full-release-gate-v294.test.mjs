import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const workflow=readFileSync(new URL('../.github/workflows/worker.yml',import.meta.url),'utf8');

test('V294 production release gate delegates to the complete npm test suite',()=>{
 assert.equal(pkg.scripts['test:release'],'npm test');
 assert.match(pkg.scripts.test,/tests\/\*\.test\.mjs/);
 assert.match(workflow,/Run Cloudflare release gate[\s\S]*?npm run test:release/);
});

test('V294 deploy still builds before tests and deploys only after the release gate',()=>{
 const build=workflow.indexOf('npm run build');
 const gate=workflow.indexOf('npm run test:release');
 const deploy=workflow.indexOf('command: deploy');
 assert.ok(build>=0&&gate>build&&deploy>gate);
});
