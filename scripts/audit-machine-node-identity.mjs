import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';
import {searchCorpusForMachine} from '../frontend/src/data/search-corpus.js';

const routeFor=machine=>({
 'BMJ-MCH-0002':'sheeting',
 'BMJ-MCH-0003':'offset5',
 'BMJ-MCH-0009':'offset10',
 'BMJ-MCH-0010':'apm2'
}[machine.machineId]||machine.machineId);

export function auditMachineNodeIdentity(){
 const machines=[],failures=[];
 for(const machine of MACHINE_REGISTRY){
  let template;
  try{
   template=createPolishedMachineTemplate(machine.machineId);
   const byId=new Map();
   template.root.traverse(object=>{
    const id=object.userData?.nodeId;
    if(typeof id!=='string'||!id.trim())return;
    const list=byId.get(id)||[];list.push(object);byId.set(id,list);
   });
   const duplicateIds=[...byId.entries()].filter(([,objects])=>objects.length>1).map(([id,objects])=>({id,count:objects.length,names:objects.map(object=>object.name||null)}));
   const taxonomy=searchCorpusForMachine(machine,routeFor(machine)).taxonomy;
   const mappedRefs=[...new Set(taxonomy.flatMap(node=>node.meshRefs||[]).filter(Boolean))];
   const ambiguousMappedRefs=mappedRefs.filter(ref=>(byId.get(ref)?.length||0)>1).map(ref=>({ref,count:byId.get(ref).length}));
   const unresolvedMappedRefs=mappedRefs.filter(ref=>!template.findNode?.(ref));
   const problems=[];
   if(duplicateIds.length)problems.push('DUPLICATE_NODE_ID');
   if(ambiguousMappedRefs.length)problems.push('AMBIGUOUS_TAXONOMY_MESH_REF');
   if(unresolvedMappedRefs.length)problems.push('UNRESOLVED_TAXONOMY_MESH_REF');
   const row={machineId:machine.machineId,name:machine.name,nodeIds:byId.size,duplicateIds,ambiguousMappedRefs,unresolvedMappedRefs,problems};
   machines.push(row);if(problems.length)failures.push(row);
  }catch(error){
   const row={machineId:machine.machineId,name:machine.name,problems:['EXCEPTION'],error:String(error?.stack||error)};
   machines.push(row);failures.push(row);
  }finally{template?.dispose?.();}
 }
 return {total:machines.length,passed:machines.length-failures.length,failed:failures.length,machines,failures};
}
