import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';
import {searchCorpusForMachine} from '../frontend/src/data/search-corpus.js';
import {resolveSemanticMachinePart} from '../frontend/src/semantic-selection.js';

const routeFor=machine=>({
 'BMJ-MCH-0002':'sheeting',
 'BMJ-MCH-0003':'offset5',
 'BMJ-MCH-0009':'offset10',
 'BMJ-MCH-0010':'apm2'
}[machine.machineId]||machine.machineId);

export function auditSemanticCanvasClickResolution(){
 const machines=[],failures=[];
 for(const machine of MACHINE_REGISTRY){
  let template;
  try{
   template=createPolishedMachineTemplate(machine.machineId);
   const taxonomy=searchCorpusForMachine(machine,routeFor(machine)).taxonomy;
   const refs=new Set(taxonomy.flatMap(node=>node.meshRefs||[]));
   const semanticParts=new Set(),clickThroughParts=new Set(),problems=[];
   let activeClickThrough=0;
   for(const mesh of template.meshes||[]){
    const semantic=resolveSemanticMachinePart(template,mesh);
    if(semantic){
     semanticParts.add(semantic);
     const id=semantic.userData?.nodeId;
     if(!id||!refs.has(id))problems.push('SEMANTIC_PART_WITHOUT_TAXONOMY_REF:'+(id||'UNKNOWN'));
     continue;
    }
    const raw=template.resolvePart?.(mesh)||null;
    if(raw)clickThroughParts.add(raw);
    if(mesh.userData?.activeElement){activeClickThrough++;problems.push('ACTIVE_MECHANISM_WITHOUT_SEMANTIC_CLICK:'+String(mesh.userData?.mechanismRole||raw?.userData?.nodeId||mesh.name||'UNKNOWN'));}
   }
   if(!semanticParts.size)problems.push('NO_SEMANTIC_CLICK_TARGETS');
   const row={
    machineId:machine.machineId,name:machine.name,
    meshCount:(template.meshes||[]).length,
    semanticTargets:semanticParts.size,
    clickThroughVisualGroups:clickThroughParts.size,
    activeClickThrough,
    problems:[...new Set(problems)]
   };
   machines.push(row);if(row.problems.length)failures.push(row);
  }catch(error){
   const row={machineId:machine.machineId,name:machine.name,problems:['EXCEPTION'],error:String(error?.stack||error)};
   machines.push(row);failures.push(row);
  }finally{template?.dispose?.();}
 }
 return {total:machines.length,passed:machines.length-failures.length,failed:failures.length,machines,failures};
}
