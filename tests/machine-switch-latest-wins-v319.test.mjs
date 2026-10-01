import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const engine=readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');

test('V319 every machine request invalidates older app and engine switch transactions',()=>{
 assert.match(app,/cachedDataActive=false,machineSwitchEpoch=0/);
 assert.match(app,/const switchEpoch=\+\+machineSwitchEpoch,isCurrentSwitch=\(\)=>switchEpoch===machineSwitchEpoch/);
 assert.match(app,/engine\?\.cancelMachineSwitch\?\.\(\);resyncActiveMachineDescriptorFromEngine\(\);document\.body\.classList\.remove\('scene-switching'\)/);
 assert.ok(app.indexOf('engine?.cancelMachineSwitch?.()')<app.indexOf("if(!canOpenTechnical3D(route))"));
 assert.match(app,/function resyncActiveMachineDescriptorFromEngine\(\)\{[\s\S]*?if\(!engine\|\|MACHINE_KEY===engine\.machineKey\)return false;[\s\S]*?configureActiveMachine\(engine\.machineKey\)[\s\S]*?clearActiveMachineDescriptor\(\)/);
});

test('V319 stale requests cannot configure or finish the application context after asynchronous waits',()=>{
 const fn=app.slice(app.indexOf('async function switchActiveMachine'),app.indexOf("window.addEventListener('bmj:simulateselectedmachine'"));
 assert.match(fn,/await new Promise\(resolve=>requestAnimationFrame\(\(\)=>requestAnimationFrame\(resolve\)\)\);\n if\(!isCurrentSwitch\(\)\)return false;/);
 assert.match(fn,/const switched=await engine\.switchMachine\(MACHINE_KEY\);if\(!isCurrentSwitch\(\)\)return false;if\(!switched\)throw new Error/);
 const catchIndex=fn.indexOf('}catch(error){'),rollbackIndex=fn.indexOf('state=previousState;',catchIndex);
 assert.ok(catchIndex>=0&&rollbackIndex>catchIndex);
 assert.ok(fn.indexOf('if(!isCurrentSwitch())return false;',catchIndex)<rollbackIndex);
 assert.match(fn,/finally\{if\(isCurrentSwitch\(\)\)\{if\(boot\)boot\.hidden=true;document\.body\.classList\.remove\('scene-switching'\);\}\}/);
});

test('V319 engine rejects a stale dynamic import before constructing or swapping templates',()=>{
 assert.match(engine,/this\.machineSwitchGeneration=0/);
 assert.match(engine,/cancelMachineSwitch\(\)\{this\.machineSwitchGeneration\+\+;return this\.machineSwitchGeneration;\}/);
 const fn=engine.slice(engine.indexOf('async switchMachine(key)'),engine.indexOf('dispose(){',engine.indexOf('async switchMachine(key)')));
 assert.match(fn,/const generation=\+\+this\.machineSwitchGeneration,requested=/);
 const importIndex=fn.indexOf("await import('./machine-runtime.js')"),guardIndex=fn.indexOf('if(generation!==this.machineSwitchGeneration)return false;'),constructIndex=fn.indexOf('createPolishedMachineTemplate(requested)');
 assert.ok(importIndex>=0&&guardIndex>importIndex&&constructIndex>guardIndex);
});

test('V319 clearing or disposing the engine also cancels any pending machine import',()=>{
 assert.match(engine,/clearMachineContext\(\)\{\n    this\.cancelMachineSwitch\(\)/);
 assert.match(engine,/dispose\(\)\{this\.cancelMachineSwitch\(\);cancelAnimationFrame/);
});

test('V319 failed rollback stays transaction-owned after its own async machine restore',()=>{
 const fn=app.slice(app.indexOf('async function switchActiveMachine'),app.indexOf("window.addEventListener('bmj:simulateselectedmachine'"));
 assert.match(fn,/if\(engine\?\.machineKey!==previousRoute\)\{try\{await engine\.switchMachine\(previousRoute\);\}catch\{\}\}\n   if\(!isCurrentSwitch\(\)\)return false;/);
});
