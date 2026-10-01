import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

const rounded=value=>Number.isFinite(value)?Math.round(value*10000)/10000:null;
const signature=root=>{
 const rows=[];let meshIndex=0;
 root.traverse(object=>{
  if(!object.isMesh)return;
  const material=Array.isArray(object.material)?object.material[0]:object.material;
  rows.push([
   meshIndex++,object.name||object.userData?.semantic||'',
   rounded(object.position.x),rounded(object.position.y),rounded(object.position.z),
   rounded(object.quaternion.x),rounded(object.quaternion.y),rounded(object.quaternion.z),rounded(object.quaternion.w),
   rounded(object.scale.x),rounded(object.scale.y),rounded(object.scale.z),
   object.visible!==false,
   material?.color?.getHex?.()??null,rounded(material?.opacity??1)
  ]);
 });
 return JSON.stringify(rows);
};

export function auditSimulationVisualStageSemantics(){
 const machines=[],failures=[];
 for(const machine of MACHINE_REGISTRY){
  let template,simulation;
  try{
   template=createPolishedMachineTemplate(machine.machineId);
   simulation=createMachineSimulation(machine.machineId,template.root,template);
   const initial=simulation.start(),blocked=initial?.blocked===true;
   const stageSignatures=new Map(),transitionSequence=[];
   let currentStage=null,stageFrames=0,now=0;
   if(!blocked){
    for(let frame=0;frame<=1800;frame++){
     now=frame*1000/60;simulation.update(now);
     const state=simulation.state?.(),stage=String(state?.stage||'').trim();
     if(stage!==currentStage){currentStage=stage;stageFrames=0;if(stage&&transitionSequence.at(-1)!==stage)transitionSequence.push(stage);}
     else stageFrames++;
     if(stage&&stageFrames===4&&!stageSignatures.has(stage)){template.root.updateMatrixWorld(true);stageSignatures.set(stage,signature(template.root));}
     if(stageSignatures.size>=2&&(state?.completed??0)>0)break;
    }
   }
   const visualSignatures=new Set(stageSignatures.values()),problems=[];
   if(blocked){
    if(machine.machineId!=='BMJ-MCH-0004')problems.push('UNEXPECTED_BLOCKED_SIMULATION');
   }else{
    if(stageSignatures.size<2)problems.push('INSUFFICIENT_STAGE_SAMPLES');
    if(visualSignatures.size<2)problems.push('STAGE_VISUALS_STAGNANT');
   }
   const row={machineId:machine.machineId,name:machine.name,blocked,stageSamples:stageSignatures.size,visualSignatures:visualSignatures.size,transitionSequence:transitionSequence.slice(0,32),problems};
   machines.push(row);if(problems.length)failures.push(row);
  }catch(error){
   const row={machineId:machine.machineId,name:machine.name,problems:['EXCEPTION'],error:String(error?.stack||error)};
   machines.push(row);failures.push(row);
  }finally{simulation?.dispose?.();template?.dispose?.();}
 }
 return {total:MACHINE_REGISTRY.length,runnable:machines.filter(row=>!row.blocked).length,blocked:machines.filter(row=>row.blocked).length,passed:machines.length-failures.length,failed:failures.length,machines,failures};
}
