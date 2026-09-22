import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {FOUNDATION_ASSETS,FOUNDATION_ASSETS_BY_ID,FOUNDATION_ASSET_STATS} from '../frontend/src/data/foundation-assets.js';

const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const plant=fs.readFileSync(new URL('../frontend/src/data/plant-actual.js',import.meta.url),'utf8');
const fullRegistry=fs.readFileSync(new URL('../frontend/src/data/machine-registry.js',import.meta.url),'utf8');
const scope=fs.readFileSync(new URL('../frontend/src/data/foundation-scope.js',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');

test('V158 Phase-1 spatial registry retains 41 asset identities with exactly one technical record',()=>{
 assert.equal(FOUNDATION_ASSETS.length,41);
 assert.equal(FOUNDATION_ASSET_STATS.total,41);
 assert.equal(FOUNDATION_ASSET_STATS.technical3D,1);
 assert.equal(FOUNDATION_ASSET_STATS.placeholders,40);
 const primary=FOUNDATION_ASSETS_BY_ID.get('BMJ-MCH-0003');
 assert.equal(primary.name,'OFFSET UV INK - 5 MACHINE + INLINE INS');
 assert.equal(primary.model,'CD 102-8+L');
 assert.equal(primary.serial,'550415');
 assert.equal(primary.sapCode,'OFU-1');
 assert.equal(primary.has3D,true);
});

test('every non-primary Phase-1 asset is spatial-only and contains no technical inventory metadata',()=>{
 for(const asset of FOUNDATION_ASSETS.filter(asset=>asset.machineId!=='BMJ-MCH-0003')){
  assert.equal(asset.has3D,false,asset.machineId);
  assert.equal(asset.model,null,asset.machineId);
  assert.equal(asset.serial,null,asset.machineId);
  assert.equal(asset.functionalLocation,null,asset.machineId);
  assert.equal(asset.sapCode,null,asset.machineId);
  assert.equal(asset.year,null,asset.machineId);
  assert.equal(asset.source,'DWG_LAYOUT_PLACEHOLDER',asset.machineId);
 }
});

test('production app and DWG placement loader consume the spatial registry, not the full technical registry',()=>{
 assert.match(app,/from '\.\/data\/foundation-assets\.js'/);
 assert.doesNotMatch(app,/from '\.\/data\/machine-registry\.js'/);
 assert.match(plant,/from '\.\/foundation-assets\.js'/);
 assert.doesNotMatch(plant,/from '\.\/machine-registry\.js'/);
 assert.match(plant,/FOUNDATION_ASSETS\.map/);
});

test('full technical registry remains retained for future expansion but is not part of the Phase-1 offline shell',()=>{
 assert.match(fullRegistry,/export const MACHINE_REGISTRY=/);
 assert.match(fullRegistry,/BMJ-MCH-0041/);
 assert.match(sw,/src\/data\/foundation-assets\.js/);
 assert.doesNotMatch(sw,/src\/data\/machine-registry\.js/);
});

test('V158 release identifiers describe the spatial-registry foundation runtime',()=>{
 assert.match(scope,/release:'V158'/);
 assert.match(shell,/v158-spatial-registry/);
 assert.match(html,/app-shell-v79\.css\?v=158/);
 assert.match(html,/src\/app\.js\?v=158/);
 assert.match(html,/src\/app-shell-v79\.js\?v=158/);
 assert.match(sw,/factory-digital-twin-v158-spatial-registry-20260922/);
});
