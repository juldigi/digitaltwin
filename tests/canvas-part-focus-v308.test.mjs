import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');

test('V308 direct canvas selection keeps the most specific mapped taxonomy node',()=>{
 const block=app.match(/function selectPartFromCanvas\(part\)\{([\s\S]*?)\n\}/);
 assert.ok(block,'selectPartFromCanvas missing');
 assert.doesNotMatch(block[1],/path\.find\(node=>node\.level===2\)/);
 assert.doesNotMatch(block[1],/selectTaxonomy\(first\.id\)/);
 assert.match(block[1],/setActiveTaxonomyId\(meta\.id\)/);
 assert.match(block[1],/choosePart\(part\)/);
 assert.match(block[1],/renderPanel\('structure'\)/);
 assert.match(block[1],/pushMachineContextHistory\(meta\.id\)/);
});

test('V308 clicked part focus still clears isolate and explode before exact geometry fit',()=>{
 const block=app.match(/function choosePart\(part\)\{([^\n]*)\}/);
 assert.ok(block,'choosePart missing');
 assert.match(block[1],/inspectionMode:\{isolate:false\}/);
 assert.match(block[1],/setExplodeLevel\(0\)/);
 assert.match(block[1],/engine\.fit\(part\)/);
 assert.doesNotMatch(block[1],/ghost\(true/);
});

test('V308 taxonomyForPart still prefers the most specific mapped level near level 5',()=>{
 assert.match(app,/ACTIVE_TAXONOMY\.filter\(n=>\(n\.meshRefs\|\|\[\]\)\.includes\(id\)\)\.sort\(\(a,b\)=>Math\.abs\(a\.level-5\)-Math\.abs\(b\.level-5\)\)\[0\]/);
});
