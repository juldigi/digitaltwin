import test from 'node:test';
import assert from 'node:assert/strict';
import {SimulationModeController,simulationModeOptions,simulationModePreset} from '../frontend/src/simulation-mode.js';

test('stage mode pauses once at the next stage boundary and resumes for the next one',()=>{
 const controller=new SimulationModeController();
 const simulation={running:true,stage:'Unwind',pauses:0,state(){return {running:this.running,stage:this.stage}},pause(){this.running=false;this.pauses++}};
 controller.setMode('stages',simulation.state());
 assert.equal(controller.observe(simulation),false);
 simulation.stage='Cutting';
 assert.equal(controller.observe(simulation),true);
 assert.equal(simulation.pauses,1);
 assert.equal(controller.observe(simulation),false);
 simulation.running=true;
 assert.equal(controller.observe(simulation),false);
 simulation.stage='Delivery';
 assert.equal(controller.observe(simulation),true);
 assert.equal(simulation.pauses,2);
 controller.setMode('continuous',simulation.state());
 simulation.running=true;simulation.stage='Unwind';
 assert.equal(controller.observe(simulation),false);
});

test('starting a different machine starts tracking its own stage',()=>{
 const controller=new SimulationModeController();
 controller.setMode('stages');
 const simulation={running:true,stage:'Feeder',paused:false,state(){return {running:this.running,stage:this.stage}},pause(){this.running=false;this.paused=true}};
 assert.equal(controller.observe(simulation),false);
 simulation.stage='Print unit';
 assert.equal(controller.observe(simulation),true);
 controller.reset();simulation.running=true;simulation.paused=false;simulation.stage='Air intake';
 assert.equal(controller.observe(simulation),false);
 simulation.stage='Compression';
 assert.equal(controller.observe(simulation),true);
});


test('training mode pauses at stage boundaries and exposes a deterministic safe preset',()=>{
 const controller=new SimulationModeController(),simulation={running:true,stage:'Feed',pauses:0,state(){return {running:this.running,stage:this.stage}},pause(){this.running=false;this.pauses++}};
 assert.equal(controller.setMode('training',simulation.state()),'training');
 assert.deepEqual(simulationModePreset('training'),{id:'training',pauseAtStage:true,lockSpeed:0.5,forcePathVisible:true});
 assert.equal(controller.observe(simulation),false);
 simulation.stage='Process';
 assert.equal(controller.observe(simulation),true);
 assert.equal(simulation.pauses,1);
});

test('training mode labels adapt to the selected machine family without changing mechanics',()=>{
 assert.match(simulationModeOptions({area:'OFFSET PRINTING',name:'OFFSET - 8 MACHINE'}).find(mode=>mode.id==='training').label,/alur cetak/);
 assert.match(simulationModeOptions({area:'OFFSET CONVERTING',name:'FOLDER GLUER - 1 MACHINE'}).find(mode=>mode.id==='training').label,/alur converting/);
 assert.match(simulationModeOptions({area:'PDS',name:'CTP 1'}).find(mode=>mode.id==='training').label,/alur prepress/);
 assert.match(simulationModeOptions({area:'UTILITY',name:'AHU 3'}).find(mode=>mode.id==='training').label,/aliran utilitas/);
 assert.ok(simulationModeOptions({area:'OFFSET CONVERTING',name:'OFFLINE INSPECTION 3 - MK'}).find(mode=>mode.id==='training').label.includes('alur inspeksi'));
});
