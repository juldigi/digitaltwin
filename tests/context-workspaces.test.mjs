import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');
const worker=fs.readFileSync(new URL('../.github/workflows/worker.yml',import.meta.url),'utf8');
const pages=fs.readFileSync(new URL('../.github/workflows/pages.yml',import.meta.url),'utf8');

test('Asset Browser exposes the master-prompt search and filter dimensions',()=>{
 for(const id of ['asset-search','asset-area','asset-type','asset-brand','asset-data-status','asset-results'])assert.match(app,new RegExp(id));
 assert.match(app,/function registryBrand\(machine\)/);
 assert.match(app,/function registryType\(machine\)/);
 assert.match(app,/function registryDataStatus\(machine\)/);
 assert.match(app,/Status data/);
 assert.match(app,/Machine ID|machineId/);
 assert.match(css,/\.asset-filter-grid/);
 assert.match(css,/\.asset-browser-row/);
 assert.match(css,/\.asset-thumbnail/);
});

test('Asset selection updates one digital-twin context without page reload',()=>{
 assert.match(app,/async function openAssetContext\(machine\)/);
 assert.match(app,/await switchActiveMachine\(route,\{historyMode:'push'\}\)/);
 assert.match(app,/selectedArea:machine\.area/);
 assert.match(app,/selectedAsset:normalizeMachineKey\(route\)/);
 assert.match(app,/showPanel\(\);renderPanel\('overview'\)/);
 assert.doesNotMatch(app,/location\.reload\(\)/);
});

test('Systems workspace exposes all required initial categories and network context',()=>{
 for(const system of ['hvac','compressedAir','routing','water','electrical'])assert.match(shell,new RegExp('data-system-focus="'+system+'"'));
 assert.match(shell,/id="system-context"/);
 assert.match(shell,/function renderSystemContext/);
 assert.match(shell,/Equipment terkait/);
 assert.match(shell,/Consumer/);
 assert.match(shell,/Evidence \/ source/);
 assert.match(css,/\.canonical-system-context/);
 assert.match(css,/\.system-network-row/);
 assert.match(css,/\.system-equipment-list/);
});

test('System context is sourced from real routing summaries and explicit data boundaries',()=>{
 assert.match(app,/engine\.actualFactory\.utilityRouting/);
 assert.match(app,/routing\?\.systems/);
 assert.match(app,/nodeCount:item\.nodeCount/);
 assert.match(app,/segmentCount:item\.segmentCount/);
 assert.match(app,/equipmentAnchorCount:item\.equipmentAnchorCount/);
 assert.match(app,/actualRouteVerified:item\.actualRouteVerified===true/);
 assert.match(app,/consumerText:/);
 assert.match(app,/sourceText:/);
 assert.match(app,/drawing as-built|routing drawing/i);
 assert.match(app,/bmj:systemassetselect/);
});

test('CI labels no longer claim obsolete UI versions',()=>{
 assert.doesNotMatch(worker,/Deploy V147/);
 assert.match(worker,/Deploy current application to Cloudflare Workers/);
 assert.doesNotMatch(pages,/V78/);
 assert.match(pages,/name: Verify frontend/);
});

test('References are categorized and prioritized from the active asset taxonomy context',()=>{
 assert.match(app,/function referenceKind\(source\)/);
 assert.match(app,/function referenceContextTokens\(\)/);
 assert.match(app,/function contextualReferenceData\(\)/);
 assert.match(app,/function renderReferencePanel\(\)/);
 for(const label of ['Foto','Dokumen','Manual','Drawing / Layout','Evidence / Source'])assert.match(app,new RegExp(label.replace('/','\\/')));
 assert.match(app,/source\.supports/);
 assert.match(app,/taxonomyPath\(\)/);
 assert.match(app,/activeReference/);
 assert.match(app,/Prioritas hanya dibuat bila istilah pada taxonomy terpilih benar-benar ditemukan/);
 assert.match(css,/\.reference-filter-strip/);
 assert.match(css,/\.context-reference-card\.is-priority/);
});

test('Asset Browser has explicit Mesin Peralatan Komponen categories without inventing a second component database',()=>{
 for(const key of ['machine','equipment','component'])assert.match(app,new RegExp('data-asset-category="'+key+'"'));
 for(const label of ['Mesin','Peralatan','Komponen'])assert.match(app,new RegExp('>'+label+'<'));
 assert.match(app,/ACTIVE_TAXONOMY\.filter/);
 assert.match(app,/data-component-id/);
 assert.match(app,/selectTaxonomy\(button\.dataset\.componentId/);
 assert.match(app,/machine\.area==='UTILITY'/);
 assert.match(css,/\.asset-category-tabs/);
});
