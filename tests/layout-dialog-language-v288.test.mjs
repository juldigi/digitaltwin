import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');

test('V288 layout dialog does not expose raw UNKNOWN or position tokens',()=>{
 const start=app.indexOf("function layoutDialog()");
 const end=app.indexOf("function foundationStatusDialog",start);
 const body=app.slice(start,end);
 assert.match(body,/pair\('Posisi '\+FOUNDATION_SCOPE\.referenceAssetName,readableStatus\(positionVerification\(referencePlacement\)\)\)/);
 assert.doesNotMatch(body,/'UNKNOWN'/);
 assert.match(body,/Belum tersedia/);
});
