import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {searchCorpusForMachine} from '../frontend/src/data/search-corpus.js';

const routeFor=machine=>({
 'BMJ-MCH-0002':'sheeting',
 'BMJ-MCH-0003':'offset5',
 'BMJ-MCH-0009':'offset10',
 'BMJ-MCH-0010':'apm2'
}[machine.machineId]||machine.machineId);

test('V277 global search corpus covers taxonomy and technical sources for all 41 assets without active-machine state',()=>{
 let taxonomyCount=0,sourceCount=0;
 for(const machine of MACHINE_REGISTRY){
  const corpus=searchCorpusForMachine(machine,routeFor(machine));
  assert.ok(corpus.taxonomy.length>0,machine.machineId+' has no searchable taxonomy');
  assert.ok(corpus.sources.length>0,machine.machineId+' has no searchable technical source');
  assert.ok(corpus.taxonomy.every(node=>node.id&&node.name),machine.machineId+' has malformed taxonomy search data');
  assert.ok(corpus.sources.every(source=>source.id||source.title),machine.machineId+' has malformed source search data');
  taxonomyCount+=corpus.taxonomy.length;sourceCount+=corpus.sources.length;
 }
 assert.ok(taxonomyCount>41,'fleet corpus is not component-level');
 assert.ok(taxonomyCount<10000,'fleet taxonomy index grew beyond the intended client-side search budget');
 assert.ok(sourceCount>=41,'fleet corpus should expose at least one evidence source per asset');
});

test('V277 global photo corpus exposes actual evidence with one normalized schema',()=>{
 const byId=new Map(MACHINE_REGISTRY.map(machine=>[machine.machineId,machine]));
 const offset5=searchCorpusForMachine(byId.get('BMJ-MCH-0003'),'offset5');
 const sheeting=searchCorpusForMachine(byId.get('BMJ-MCH-0002'),'sheeting');
 const polar=searchCorpusForMachine(byId.get('BMJ-MCH-0001'),'BMJ-MCH-0001');
 assert.ok(offset5.photos.length>0);
 assert.equal(sheeting.photos.length,9);
 assert.equal(polar.photos.length,4);
 for(const photo of [...offset5.photos,...sheeting.photos,...polar.photos]){
  assert.ok(photo.id);
  assert.ok(photo.filename);
  assert.ok(photo.machineZone);
  assert.ok(photo.viewDirection);
  assert.ok(photo.category);
  assert.ok(photo.confidence);
 }
});

test('V277 app builds search from machine-independent corpus and opens selected references with canonical state first',()=>{
 const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
 assert.match(app,/searchCorpusForMachine\(machine,route\)/);
 assert.doesNotMatch(app,/function searchableTaxonomy\(/);
 assert.doesNotMatch(app,/function searchableSources\(/);
 assert.doesNotMatch(app,/function searchablePhotos\(/);
 assert.match(app,/referenceId:photo\.id\|\|photo\.filename/);
 assert.match(app,/const selectedAssetId=activeMachineAssetId\(\)/);
 const referenceBlock=app.match(/else if\(item\.type==='reference'\)\{([\s\S]*?)\n  \}else\{/);
 assert.ok(referenceBlock);
 assert.ok(referenceBlock[1].indexOf('emitDomainState')<referenceBlock[1].indexOf("renderPanel('sources')"),'reference state must be committed before rendering the reference panel');
 assert.match(referenceBlock[1],/inspectorState:\{open:true,tab:'sources'\}/);
});
