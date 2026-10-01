import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {searchCorpusForMachine} from '../frontend/src/data/search-corpus.js';
import {buildContextUrl,readUrlState} from '../frontend/src/state/app-state.js';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const routeFor=machine=>({
 'BMJ-MCH-0002':'sheeting',
 'BMJ-MCH-0003':'offset5',
 'BMJ-MCH-0009':'offset10',
 'BMJ-MCH-0010':'apm2'
}[machine.machineId]||machine.machineId);

test('V310 deepest semantic component ids round-trip through URL state for all 41 assets',()=>{
 for(const machine of MACHINE_REGISTRY){
  const taxonomy=searchCorpusForMachine(machine,routeFor(machine)).taxonomy;
  const deepest=taxonomy.filter(node=>node.id&&node.level>1).sort((a,b)=>b.level-a.level)[0];
  assert.ok(deepest,machine.machineId+' has no component context');
  const base='https://digitaltwin.test/';
  const url=buildContextUrl({selectedAsset:machine.machineId,selectedNode:deepest.id,sceneMode:'machine',viewMode:'3d',cameraPreset:'iso'},base);
  const restored=readUrlState(url.href);
  assert.equal(restored.selectedAsset,machine.machineId);
  assert.equal(restored.selectedNode,deepest.id,machine.machineId+' changed semantic node during URL round-trip');
  assert.equal(restored.sceneMode,'machine');
 }
});

test('V310 history restore uses the exact validated taxonomy node instead of climbing to a parent unit',()=>{
 const body=app.slice(app.indexOf('async function restoreHistoryContext()'),app.indexOf("addEventListener('popstate'"));
 assert.match(body,/const restoredNode=node&&TAXONOMY_BY_ID\.has\(node\)\?node:null/);
 assert.match(body,/if\(restoredNode\)\{setView\('machine'\);selectTaxonomy\(restoredNode,\{revealPanel:true,historyMode:'none'\}\);\}/);
 assert.doesNotMatch(body,/taxonomyPath\(restoredNode\)/);
 assert.doesNotMatch(body,/level===2/);
 assert.doesNotMatch(body,/meshRef|nodeId/);
});

test('V310 semantic restore reopens Structure inspector and fits resolved taxonomy geometry',()=>{
 const select=app.slice(app.indexOf("function selectTaxonomy(id"),app.indexOf("function navigateContextParent"));
 assert.match(select,/const part=engine\?\.template\.resolveTaxonomyNode\(meta\.id\)/);
 assert.match(select,/if\(part\)choosePart\(part\)/);
 assert.match(select,/if\(revealPanel\)showPanel\(\)/);
 assert.match(select,/renderPanel\('structure'\)/);
 const choose=app.slice(app.indexOf('function choosePart(part)'),app.indexOf('function selectPartFromCanvas'));
 assert.match(choose,/engine\.fit\(part\)/);
 assert.match(choose,/inspectorState:\{open:true,tab:'structure'\}/);
});
