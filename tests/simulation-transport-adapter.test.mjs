import test from 'node:test';
import assert from 'node:assert/strict';
import {seekSimulationStage,createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {OffsetMachineTemplate} from '../frontend/src/offset5.js';
import {PrintingSimulation,PRINTING_SIMULATION_STAGES} from '../frontend/src/simulation.js';
import {APM2MachineTemplate} from '../frontend/src/apm2.js';
import {APM2ProcessSimulation,APM2_SIMULATION_STAGES} from '../frontend/src/simulation-apm2.js';
import {SheetingMachineTemplate} from '../frontend/src/sheeting.js';
import {SheetingProcessSimulation,SHEETING_SIMULATION_STAGES} from '../frontend/src/simulation-sheeting.js';

const verifySeek=(model,sim,target)=>{
 const result=seekSimulationStage(sim,target,{maxSteps:3200});
 assert.ok(result,'seek must return a state');
 assert.equal(result.seekTargetFound,true,'target stage must be reached through simulator updates');
 assert.equal(result.stage,target);
 assert.equal(result.active,true);
 assert.equal(result.running,false);
 assert.equal(result.paused,true);
 sim.dispose?.();model.dispose?.();
};

test('stage seek fast-forwards Offset 5 through its real process update loop',()=>{
 const model=new OffsetMachineTemplate(),sim=new PrintingSimulation(model.root,model);
 verifySeek(model,sim,PRINTING_SIMULATION_STAGES[2]);
});

test('stage seek preserves APM2 deterministic process state and pauses at target',()=>{
 const model=new APM2MachineTemplate(),sim=new APM2ProcessSimulation(model.root,model);
 verifySeek(model,sim,APM2_SIMULATION_STAGES[3]);
});

test('stage seek works for the Sheeting continuous-web simulator without editing geometry',()=>{
 const model=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(model.root,model);
 verifySeek(model,sim,SHEETING_SIMULATION_STAGES[3]);
});

test('stage seek works for evidence-gated reference simulations when available',()=>{
 const model=createMachineTemplate('BMJ-MCH-0031'),sim=createMachineSimulation('BMJ-MCH-0031',model.root,model),target=sim.stages?.[1];
 assert.ok(target);
 verifySeek(model,sim,target);
});

test('stage seek refuses blocked simulations instead of fabricating progress',()=>{
 const model=createMachineTemplate('BMJ-MCH-0004'),sim=createMachineSimulation('BMJ-MCH-0004',model.root,model),state=sim.state();
 assert.equal(state.blocked,true);
 const result=seekSimulationStage(sim,'Invented stage');
 assert.equal(result.stageSeekSupported,false);
 assert.equal(result.seekTargetFound,false);
 assert.equal(result.active,false);
 sim.dispose?.();model.dispose?.();
});
