import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {changedSceneOverrideIds,mergeSceneRevisionDraft} from '../frontend/src/data/scene-revision-merge.js';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');

const a={position:[1,0,0],rotation:[0,0,0],scale:[1,1,1],visible:true};
const b={position:[2,0,0],rotation:[0,0,0],scale:[1,1,1],visible:true};
const c={position:[3,0,0],rotation:[0,0,0],scale:[1,1,1],visible:true};

test('V293 changed scene IDs detect additions edits and deletions deterministically',()=>{
 const base={'asset:a':a,'asset:b':b};
 const next={'asset:a':a,'asset:b':c,'asset:c':b};
 assert.deepEqual(changedSceneOverrideIds(base,next),['asset:b','asset:c']);
 assert.deepEqual(changedSceneOverrideIds(next,base),['asset:b','asset:c']);
 assert.deepEqual(changedSceneOverrideIds(base,{'asset:a':a}),['asset:b']);
});

test('V293 non-overlapping local and remote changes merge without dropping either side',()=>{
 const base={'asset:a':a,'asset:b':b};
 const local={'asset:a':c,'asset:b':b,'asset:local':a};
 const remote={'asset:a':a,'asset:b':c,'asset:remote':b};
 const result=mergeSceneRevisionDraft({base,local,remote});
 assert.deepEqual(result.conflicts,[]);
 assert.deepEqual(result.localChanged,['asset:a','asset:local']);
 assert.deepEqual(result.remoteChanged,['asset:b','asset:remote']);
 assert.deepEqual(result.merged['asset:a'],c);
 assert.deepEqual(result.merged['asset:b'],c);
 assert.deepEqual(result.merged['asset:local'],a);
 assert.deepEqual(result.merged['asset:remote'],b);
});

test('V293 local deletion is preserved when the server changed a different object',()=>{
 const base={'asset:a':a,'asset:b':b};
 const local={'asset:b':b};
 const remote={'asset:a':a,'asset:b':c};
 const result=mergeSceneRevisionDraft({base,local,remote});
 assert.deepEqual(result.conflicts,[]);
 assert.equal('asset:a' in result.merged,false);
 assert.deepEqual(result.merged['asset:b'],c);
});

test('V293 same-object concurrent edits are explicit conflicts and never auto-merged',()=>{
 const base={'asset:a':a,'asset:b':b};
 const local={'asset:a':b,'asset:b':b};
 const remote={'asset:a':c,'asset:b':b};
 const result=mergeSceneRevisionDraft({base,local,remote});
 assert.equal(result.merged,null);
 assert.deepEqual(result.conflicts,['asset:a']);
});

test('V293 request exposes HTTP status and editor only retries revision 409 through three-way merge',()=>{
 assert.match(app,/error\.status=res\.status;error\.details=result;throw error/);
 assert.match(app,/if\(e\.status===409\)\{try\{const latest=await request\('\/api\/state'\),resolution=mergeSceneRevisionDraft\(\{base:savedOverrides,local:payload,remote:latest\.sceneOverrides\|\|\{\}\}\)/);
 assert.match(app,/if\(resolution\.conflicts\.length\)\{/);
 assert.match(app,/Draft lokal tetap ada; tinjau sebelum memuat ulang versi server/);
 assert.match(app,/state\.revision=latest\.revision;const next=await request\('\/api\/scene',\{method:'PUT',data:\{overrides:resolution\.merged\}\}\)/);
 assert.match(app,/Perubahan 3D digabung dengan revisi server terbaru dan berhasil disimpan/);
});
