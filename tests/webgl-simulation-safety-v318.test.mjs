import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const engine=readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');

test('V318 WebGL fault stops an active simulation before switching the UI to 2D',()=>{
 const match=app.match(/function handleEngineError\([^]*?\n\}/);
 assert.ok(match);
 const body=match[0];
 assert.match(body,/const simulationOwnedCutaway=simulationOwnsExterior/);
 assert.match(body,/if\(engine\?\.isPrintingSimulationActive\?\.\(\)\|\|currentSimulationState\(\)\.active\)stopPrintingSimulation\(\{restoreExterior:false\}\)/);
 assert.match(body,/if\(simulationOwnedCutaway\)exitExteriorMode\(\{restoreQuality:false\}\)/);
 assert.match(body,/commitSimulationState\(\{\.\.\.currentSimulationState\(\),active:false,running:false,paused:false,stage:null,progress:0\}\)/);
 assert.ok(body.indexOf('stopPrintingSimulation')<body.indexOf("classList.add('workspace-2d','webgl-unavailable')"));
 assert.match(app,/function exitExteriorMode\(\{restoreQuality=true\}=\{\}\)/);
 assert.match(app,/if\(restoreQuality&&exteriorPreviousLow!==null\)engine\.applyQualityProfile\(exteriorPreviousLow\)/);
});

test('V318 WebGL recovery re-enables 3D but never auto-resumes simulation',()=>{
 const match=app.match(/function handleEngineRecovered\(\)\{[^]*?\n\}/);
 assert.ok(match);
 assert.doesNotMatch(match[0],/resumePrintingSimulation|startPrintingSimulation|simulation\.resume/);
 assert.match(match[0],/three\.disabled=false/);
});

test('V318 renderer still owns explicit context-loss and context-restored hooks',()=>{
 assert.match(engine,/webglcontextlost/);
 assert.match(engine,/this\.renderFaulted=true/);
 assert.match(engine,/webglcontextrestored/);
 assert.match(engine,/this\.renderFaulted=false/);
});
