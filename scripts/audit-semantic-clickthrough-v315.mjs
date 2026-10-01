import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';
import {searchCorpusForMachine} from '../frontend/src/data/search-corpus.js';

const routeFor=machine=>({
 'BMJ-MCH-0002':'sheeting',
 'BMJ-MCH-0003':'offset5',
 'BMJ-MCH-0009':'offset10',
 'BMJ-MCH-0010':'apm2'
}[machine.machineId]||machine.machineId);

export function auditSemanticClickThrough(){
 const machines=[],failures=[];
 for(const machine of MACHINE_REGISTRY){
  let template;
  try{
   template=createPolishedMachineTemplate(machine.machineId);
   const refs=new Set(searchCorpusForMachine(machine,routeFor(machine)).taxonomy.flatMap(node=>node.meshRefs||[]).filter(Boolean));
   const semantic=new Set(),unmappedActive=[],problems=[];let visualOnly=0;
   for(const mesh of template.meshes||[]){
    const part=template.resolvePart?.(mesh)||null;
    if(part){
     semantic.add(part);
     const id=part.userData?.nodeId;
     if(!id||!refs.has(id))problems.push('RESOLVED_PART_WITHOUT_TAXONOMY:'+String(id||'UNKNOWN'));
    }else{
     visualOnly++;
     if(mesh.userData?.activeElement)unmappedActive.push(mesh.userData?.mechanismRole||mesh.name||'UNKNOWN');
    }
   }
   if(!semantic.size)problems.push('NO_SEMANTIC_TARGETS');
   if(unmappedActive.length)problems.push('ACTIVE_MECHANISM_WITHOUT_SEMANTIC_TARGET');
   const row={machineId:machine.machineId,name:machine.name,semanticTargets:semantic.size,visualOnlyMeshes:visualOnly,unmappedActive:[...new Set(unmappedActive)],problems:[...new Set(problems)]};
   machines.push(row);if(row.problems.length)failures.push(row);
  }catch(error){
   const row={machineId:machine.machineId,name:machine.name,problems:['EXCEPTION'],error:String(error?.stack||error)};
   machines.push(row);failures.push(row);
  }finally{template?.dispose?.();}
 }
 return {total:machines.length,passed:machines.length-failures.length,failed:failures.length,machines,failures};
}
