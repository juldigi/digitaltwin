import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';
import {searchCorpusForMachine} from '../frontend/src/data/search-corpus.js';

const routeFor=machine=>({
 'BMJ-MCH-0002':'sheeting',
 'BMJ-MCH-0003':'offset5',
 'BMJ-MCH-0009':'offset10',
 'BMJ-MCH-0010':'apm2'
}[machine.machineId]||machine.machineId);

export function auditTaxonomyClickResolution(){
 const machines=[],failures=[];
 for(const machine of MACHINE_REGISTRY){
  let template;
  try{
   template=createPolishedMachineTemplate(machine.machineId);
   const taxonomy=searchCorpusForMachine(machine,routeFor(machine)).taxonomy;
   const mappedNodes=taxonomy.filter(node=>Array.isArray(node.meshRefs)&&node.meshRefs.length);
   let resolvable=0,deepResolvable=0;
   const problems=[];
   for(const node of mappedNodes){
    const actualRefs=node.meshRefs.filter(ref=>template.findNode?.(ref));
    for(const ref of node.meshRefs)if(!template.findNode?.(ref))problems.push('MISSING_TAXONOMY_MESH_REF:'+node.id+':'+ref);
    const resolved=template.resolveTaxonomyNode?.(node.id)||null;
    if(actualRefs.length){
     resolvable++;
     if(node.level>=5)deepResolvable++;
     if(!resolved)problems.push('RESOLVABLE_TAXONOMY_NODE_FAILED:'+node.id);
     else{
      const part=template.resolvePart?.(resolved)||resolved;
      const nodeId=part?.userData?.nodeId||resolved?.userData?.nodeId||null;
      const candidate=taxonomy.filter(item=>(item.meshRefs||[]).includes(nodeId)).sort((a,b)=>Math.abs(a.level-5)-Math.abs(b.level-5))[0]||null;
      if(nodeId&&!candidate)problems.push('CLICKED_NODE_HAS_NO_TAXONOMY:'+nodeId);
     }
    }
   }
   const level2=taxonomy.filter(node=>node.level===2&&(node.meshRefs||[]).length);
   for(const node of level2)if(!node.meshRefs.some(ref=>template.findNode?.(ref)))problems.push('LEVEL2_UNIT_HAS_NO_GEOMETRY:'+node.id);
   if(!resolvable)problems.push('NO_RESOLVABLE_TAXONOMY_GEOMETRY');
   const row={machineId:machine.machineId,name:machine.name,taxonomyNodes:taxonomy.length,mappedNodes:mappedNodes.length,resolvable,deepResolvable,problems:[...new Set(problems)]};
   machines.push(row);if(row.problems.length)failures.push(row);
  }catch(error){
   const row={machineId:machine.machineId,name:machine.name,problems:['EXCEPTION'],error:String(error?.stack||error)};
   machines.push(row);failures.push(row);
  }finally{template?.dispose?.();}
 }
 return {total:machines.length,passed:machines.length-failures.length,failed:failures.length,machines,failures};
}
