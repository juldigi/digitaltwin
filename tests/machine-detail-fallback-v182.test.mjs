import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {positionVerification} from '../frontend/src/data/truth-status.js';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');

test('machine detail can report an unknown position without a primary truth record',()=>{
  assert.equal(positionVerification(null),'UNKNOWN');
  const detail=app.slice(app.indexOf('function machineDetailDialog(machine){'),app.indexOf("window.addEventListener('bmj:machinecontextrequest'"));
  assert.match(detail,/pair\('Posisi',truth\?\.position\|\|positionVerification\(placement\)\)/);
});

test('asset selection keeps factory context when 3D cannot open',()=>{
  const open=app.slice(app.indexOf('async function openAssetContext(machine){'),app.indexOf('function foundationAssetMatches'));
  assert.match(open,/const opened=await switchActiveMachine\(route,\{historyMode:'push'\}\)/);
  assert.match(open,/if\(opened\)emitDomainState\(\{selectedAsset:machine\.machineId[\s\S]*sceneMode:'machine'/);
});
