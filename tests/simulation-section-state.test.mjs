import test from 'node:test';
import assert from 'node:assert/strict';

test('simulation lifecycle preserves navigation until the user changes section',async()=>{
 globalThis.window={dispatchEvent(){}};
 globalThis.CustomEvent??=class CustomEvent{constructor(type,options){this.type=type;this.detail=options?.detail}};
 const {getState,setActiveSection,setSimulation}=await import('../frontend/src/state/app-state.js');
 setActiveSection('simulation');
 setSimulation({active:false,playing:false,stage:'Siap',progress:0});
 assert.equal(getState().activeSection,'simulation','ready panel stays in Simulasi');
 setSimulation({active:true,playing:true,stage:'Feeder',progress:10});
 setSimulation({active:true,playing:false,stage:'Feeder',progress:10});
 setSimulation({active:false,playing:false,stage:'Siap',progress:0});
 assert.equal(getState().activeSection,'simulation','stop leaves controls available to start again');
 setActiveSection('factory');
 assert.equal(getState().activeSection,'factory','explicit navigation still changes section');
 await new Promise(resolve=>setImmediate(resolve));
});
