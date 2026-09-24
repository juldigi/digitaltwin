import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');

test('Stage 6 opens factory asset detail in the canonical contextual inspector',()=>{
 const start=app.indexOf('function machineDetailDialog(machine){');
 const end=app.indexOf('async function switchActiveMachine',start);
 const detail=app.slice(start,end);
 assert.match(detail,/setDomainState\(\{inspectorState:\{tab:'overview'\}\}\);showPanel\(\)/);
 assert.match(detail,/inspectorState:\{open:true,tab:'overview'\}/);
 assert.match(detail,/renderContextBreadcrumb\(\)/);
 assert.doesNotMatch(detail,/modal\(machine\.name/);
});

test('factory selector opens the same inspector context instead of a duplicate surface',()=>{
 assert.match(app,/factory-asset-focus'[\s\S]*openDialog:true/);
 assert.match(app,/on\('#context-back',navigateContextParent\)/);
 assert.doesNotMatch(app,/factory-inspector-back/);
});
