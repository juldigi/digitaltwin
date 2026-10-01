import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';

export function auditSemanticClickThrough(){
 const machines=[],failures=[];
 for(const machine of MACHINE_REGISTRY){
  let template;
  try{
   template=createPolishedMachineTemplate(machine.machineId);
   const semanticParts=new Set(),visualClickThrough=new Set(),activeMissing=[];
   for(const mesh of template.meshes||[]){
    const part=template.resolvePart?.(mesh)||null;
    if(part)semanticParts.add(part);
    else{
     let raw=mesh.parent;while(raw&&raw!==template.root&&!raw.userData?.selectable)raw=raw.parent;
     if(raw&&raw!==template.root)visualClickThrough.add(raw);
     if(mesh.userData?.activeElement)activeMissing.push(mesh.userData?.mechanismRole||mesh.name||'UNKNOWN');
    }
   }
   const problems=[];
   if(!semanticParts.size)problems.push('NO_SEMANTIC_CLICK_TARGETS');
   if(activeMissing.length)problems.push('ACTIVE_MECHANISM_CLICK_THROUGH');
   const row={machineId:machine.machineId,name:machine.name,semanticTargets:semanticParts.size,visualClickThrough:visualClickThrough.size,activeMissing:[...new Set(activeMissing)],problems};
   machines.push(row);if(problems.length)failures.push(row);
  }catch(error){
   const row={machineId:machine.machineId,name:machine.name,problems:['EXCEPTION'],error:String(error?.stack||error)};
   machines.push(row);failures.push(row);
  }finally{template?.dispose?.();}
 }
 return {total:machines.length,passed:machines.length-failures.length,failed:failures.length,machines,failures};
}
