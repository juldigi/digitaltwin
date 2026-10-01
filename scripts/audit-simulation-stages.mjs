import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

export function auditSimulationStageDiversity(){
 const machines=[],failures=[];
 for(const machine of MACHINE_REGISTRY){
  let template,simulation;
  try{
   template=createPolishedMachineTemplate(machine.machineId);
   simulation=createMachineSimulation(machine.machineId,template.root,template);
   const initial=simulation.start(),stages=new Set(),samples=[];
   if(initial?.stage)stages.add(String(initial.stage));
   if(!initial?.blocked){
    let now=0;
    for(let frame=0;frame<=1800;frame++){
     now=frame*1000/60;simulation.update(now);
     if(frame%15)continue;
     const state=simulation.state?.();
     const stage=String(state?.stage||'').trim();
     if(stage){stages.add(stage);if(samples.at(-1)!==stage)samples.push(stage);}
     if(stages.size>=2&&(state?.completed??0)>0)break;
    }
   }
   const final=simulation.state?.(),blocked=initial?.blocked===true;
   const problems=[];
   if(blocked){
    if(machine.machineId!=='BMJ-MCH-0004')problems.push('UNEXPECTED_BLOCKED_SIMULATION');
   }else{
    if(stages.size<2)problems.push('STAGE_STAGNANT');
    if([...stages].some(stage=>/^(ready|siap|unknown|undefined|null)$/i.test(stage)))problems.push('GENERIC_OR_EMPTY_STAGE');
    if(!(final?.completed>0))problems.push('NO_COMPLETED_CYCLE');
   }
   const row={machineId:machine.machineId,name:machine.name,blocked,stageCount:stages.size,stages:[...stages],transitionSequence:samples.slice(0,32),completed:final?.completed??0,problems};
   machines.push(row);if(problems.length)failures.push(row);
  }catch(error){
   const row={machineId:machine.machineId,name:machine.name,problems:['EXCEPTION'],error:String(error?.stack||error)};
   machines.push(row);failures.push(row);
  }finally{simulation?.dispose?.();template?.dispose?.();}
 }
 return {total:MACHINE_REGISTRY.length,runnable:machines.filter(row=>!row.blocked).length,blocked:machines.filter(row=>row.blocked).length,failed:failures.length,passed:machines.length-failures.length,machines,failures};
}
