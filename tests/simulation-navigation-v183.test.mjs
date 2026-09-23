import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

test('every registered model starts or explicitly blocks its process simulation',()=>{
 for(const machine of MACHINE_REGISTRY.filter(item=>item.has3D)){
  const model=createMachineTemplate(machine.machineId);
  const simulation=createMachineSimulation(machine.machineId,model.root,model);
  try{
   const result=simulation.start();
   simulation.update(0);
   simulation.update(100);
   assert.ok(result.running||result.blocked,machine.machineId);
   if(result.blocked)assert.ok(result.blockedReason,machine.machineId);
  }finally{simulation.dispose?.();model.dispose?.()}
 }
});

test('navigation opens selected machine before simulation and closes other overlays',()=>{
 const shell=readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
 const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
 const css=readFileSync(new URL('../frontend/app-shell-v79.css',import.meta.url),'utf8');
 assert.match(shell,/function enterSimulation\(\)\{\s*beforeMajorOverlay\('inspector'\)/);
 assert.match(shell,/bmj:simulateselectedmachine/);
 assert.match(app,/const opened=await switchActiveMachine\(machineRoute\(record\)\)/);
 assert.match(app,/if\(opened\)dispatchEvent\(new CustomEvent\('bmj:simulationcontextready'/);
 assert.match(shell,/nav-machine'\)\?\.addEventListener\('click',\(\)=>navigateSection\('factory'\)/);
 assert.doesNotMatch(css,/\.layer-open \.twin-shell\{z-index:89\}/);
 assert.match(css,/\.canonical-layer-manager\{position:fixed;z-index:90/);
 assert.match(shell,/document\.body\.append\(panel\)/);
});
