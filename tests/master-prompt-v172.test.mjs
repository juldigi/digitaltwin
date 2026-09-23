import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const app=read('../frontend/src/app.js');
const shell=read('../frontend/src/app-shell-v79.js');
const sw=read('../frontend/sw.js');

test('V172 pauses an active simulation before rendering a non-simulation tab',()=>{
 assert.match(app,/const previousTab=activeTab/);
 assert.match(app,/previousTab==='simulation'&&tab!=='simulation'&&simulationState\?\.running&&engine\?\.isPrintingSimulationActive\?\.\(\)/);
 assert.match(app,/simulationState=engine\.pausePrintingSimulation\(\);updateSimulationPanel\(simulationState\)/);
 assert.match(app,/Simulasi dijeda saat Anda berpindah dari tab Simulasi/);
});

test('V172 clears stale reference context outside the References tab',()=>{
 assert.match(app,/if\(tab!=='sources'&&window\.BMJAppState\?\.getState\?\.\(\)\.activeReference\)emitDomainState\(\{activeReference:null\}\)/);
 assert.match(app,/choosePart\(part\)[\s\S]*selectedSystem:null,activeReference:null,sceneMode:'machine'/);
 assert.match(app,/activateReferenceCard=card=>\{emitDomainState\(\{activeReference:card\.dataset\.referenceCard,selectedSystem:null,activeSection:'reference'\}\)/);
});

test('V172 resets simulation and inspection ownership when machine context changes',()=>{
 assert.match(app,/function resetMachineInspectionContext\(\)/);
 assert.match(app,/simulationState=engine\?\.getPrintingSimulationState\?\.\(\)\|\|simulationState/);
 assert.match(app,/if\(simulationState\)updateSimulationPanel\(simulationState\)/);
 assert.match(app,/emitDomainState\(\{selectedSystem:null,activeReference:null,inspectionMode:\{explode:false,isolate:false,section:false,interior:false\}\}\)/);
});

test('V172 returning to factory cannot leave hidden simulation or inspector state behind',()=>{
 assert.match(app,/if\(view==='factory'&&engine\?\.isPrintingSimulationActive\(\)\)[\s\S]*updateSimulationPanel\(simulationState\)/);
 assert.match(app,/if\(view==='factory'\)activeTab='overview'/);
 assert.match(app,/activeSection:'factory',sceneMode:'factory',activeReference:null,inspectionMode:\{explode:false,isolate:false,section:false,interior:false\}/);
 assert.match(app,/factory-overview[\s\S]*selectedSystem:null,activeReference:null[\s\S]*inspectionMode:\{explode:false,isolate:false,section:false,interior:false\}/);
});

test('V172 asset and global navigation entry points clear incompatible context',()=>{
 assert.match(app,/selectedAsset:machine\.machineId[\s\S]*selectedSystem:null,activeReference:null[\s\S]*inspectionMode:\{explode:false,isolate:false,section:false,interior:false\}/);
 assert.match(shell,/nav-assets[\s\S]*setState\(\{selectedSystem:null,activeReference:null\},\{url:false\}\)/);
 assert.match(shell,/nav-sources[\s\S]*setState\(\{selectedSystem:null\},\{url:false\}\)/);
 assert.match(shell,/function enterSimulation\(\)[\s\S]*setState\(\{selectedSystem:null,activeReference:null\},\{url:false\}\)/);
});

test('V172 simulation entry resolves the technical machine scene before opening controls',()=>{
 assert.match(app,/on\('#tool-simulation',async\(\)=>\{if\(engine\?\.view!=='machine'\)await switchActiveMachine\(FOUNDATION_SCOPE\.primaryRoute,\{historyMode:'push'\}\)/);
 assert.match(app,/activeSection:'simulation',sceneMode:'machine'/);
});

test('V172 runtime assets are cache-busted',()=>{
 assert.match(html,/src\/app\.js\?v=172/);
 assert.match(html,/src\/app-shell-v79\.js\?v=172/);
 assert.match(sw,/factory-digital-twin-v172-context-state-hygiene-20260923/);
 assert.match(app,/pair\('Versi aplikasi','V172'\)/);
});
