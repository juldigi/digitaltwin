import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildDwgFidelityLedger,dwgObjectSourceMetadata} from '../frontend/src/data/dwg-fidelity.js';

const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const building=fs.readFileSync(new URL('../frontend/src/factory-building.js',import.meta.url),'utf8');
const plant=fs.readFileSync(new URL('../frontend/src/data/plant-actual.js',import.meta.url),'utf8');
const legacy=fs.readFileSync(new URL('../frontend/src/data/plant-layout-data.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../frontend/index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../frontend/sw.js',import.meta.url),'utf8');
const shell=fs.readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');

const sampleLayout={
 source:{file:'factory.dwg',derivedFile:'factory.dxf',sha256:'abc',derivedSha256:'def',entityCount:1000,layerCount:23,blockCount:54},
 transform:{sourceUnits:'mm',scale:.001,rotation:0,originX:12,originY:34},
 displayTransform:{flipY:true},
 referenceBatches:[{layer:'WALLS',points:[0,0,1,0,1,0,1,1]}],
 actual:{segments:[[0,0,1,0],[1,0,1,1]],walls:[{a:[0,0],b:[1,0]}],columns:[[.5,.5]],doors:[{x:.2,y:.1}],openings:[{}],curtains:[{}],labels:[{text:'ROOM'}]},
 audit:{deepDiveUnsupportedTypes:['HATCH','SPLINE']}
};

test('V155 fidelity ledger never claims raw CAD parity from normalized extraction',()=>{
 const ledger=buildDwgFidelityLedger(sampleLayout);
 assert.equal(ledger.status,'AUDITABLE_PARTIAL');
 assert.equal(ledger.sourceFile,'factory.dwg');
 assert.equal(ledger.sourceEntityCount,1000);
 assert.equal(ledger.referenceSegmentCount,2);
 assert.equal(ledger.preservation,'PARTIAL / NORMALIZED EXTRACTION');
 assert.equal(ledger.rawEntityParityClaim,false);
 assert.equal(ledger.reviewRequired,true);
 assert.equal(ledger.semantic3DCounts.walls,1);
 assert.equal(ledger.semantic3DCounts.columns,1);
 assert.equal(ledger.semantic3DCounts.doors,1);
 assert.equal(ledger.semantic3DCounts.openings,2);
 assert.equal(ledger.transform.axisMap,'DWG X → THREE X · DWG Y → THREE Z · THREE Y → ELEVATION');
});

test('unsupported CAD classes remain explicit UNKNOWN / NOT_IMPLEMENTED records',()=>{
 const ledger=buildDwgFidelityLedger(sampleLayout);
 assert.deepEqual(ledger.unimplemented.map(x=>x.entityType),['HATCH','SPLINE']);
 for(const item of ledger.unimplemented){
  assert.equal(item.semanticType,'UNKNOWN');
  assert.equal(item.threeDStatus,'NOT_IMPLEMENTED');
  assert.equal(item.count,null);
 }
});

test('source-backed scene metadata contains the master-prompt provenance fields',()=>{
 const meta=dwgObjectSourceMetadata(sampleLayout,{semantic:'WALL',sourceLayer:'WALLS',sourceEntityId:'ABC123',sourceHandles:['ABC123'],confidence:'HIGH CONFIDENCE',renderStatus:'3D_WITH_ESTIMATED_HEIGHT'});
 assert.equal(meta.sourceType,'DWG');
 assert.equal(meta.sourceLayer,'WALLS');
 assert.equal(meta.sourceEntityId,'ABC123');
 assert.equal(meta.sourceFile,'factory.dwg');
 assert.equal(meta.confidence,'HIGH CONFIDENCE');
 assert.equal(meta.semantic,'WALL');
 assert.equal(meta.renderStatus,'3D_WITH_ESTIMATED_HEIGHT');
});

test('active and legacy DWG loaders attach the fidelity ledger',()=>{
 assert.match(plant,/cache\.dwgFidelity=buildDwgFidelityLedger\(cache\)/);
 assert.match(legacy,/cache\.dwgFidelity=buildDwgFidelityLedger\(cache\)/);
});

test('factory scene graph stamps provenance on core DWG objects and preserves ledger at root',()=>{
 assert.match(building,/dwgObjectSourceMetadata\(layout,\{sourceType:'DWG_DERIVED',semantic:'REINFORCED_CONCRETE_FLOOR'/);
 assert.match(building,/dwgObjectSourceMetadata\(layout,\{semantic:'WALL'/);
 assert.match(building,/dwgObjectSourceMetadata\(layout,\{semantic:'STRUCTURAL_COLUMN'/);
 assert.match(building,/dwgObjectSourceMetadata\(layout,\{semantic:'DOOR'/);
 assert.match(building,/semantic:'CAD_REFERENCE'/);
 assert.match(building,/dwgFidelity:layout\.dwgFidelity\|\|null/);
});

test('Denah Pabrik exposes an auditable fidelity ledger and NOT_IMPLEMENTED rows',()=>{
 assert.match(app,/Fidelity DWG/);
 assert.match(app,/Raw entity parity tidak diklaim/);
 assert.match(app,/Belum diimplementasikan sebagai 3D fisik/);
 assert.match(app,/item\.threeDStatus/);
 assert.match(app,/buildDwgFidelityLedger\(l\)/);
 assert.match(css,/\.dwg-fidelity-ledger/);
 assert.match(css,/\.dwg-unimplemented-row/);
});

test('V155 release cache ships the DWG fidelity module',()=>{
 assert.match(html,/app-shell-v79\.css\?v=168/);
 assert.match(html,/src\/app\.js\?v=178/);
 assert.match(html,/src\/app-shell-v79\.js\?v=177/);
 assert.match(shell,/v162-factory-first-systems/);
 assert.match(sw,/factory-digital-twin-v178-factory-context-reset-20260923/);
 assert.match(sw,/src\/data\/dwg-fidelity\.js/);
});
