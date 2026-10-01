import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';
import {searchCorpusForMachine} from '../frontend/src/data/search-corpus.js';

const routeFor=machine=>({
 'BMJ-MCH-0002':'sheeting',
 'BMJ-MCH-0003':'offset5',
 'BMJ-MCH-0009':'offset10',
 'BMJ-MCH-0010':'apm2'
}[machine.machineId]||machine.machineId);

const bestMeta=(taxonomy,nodeId)=>taxonomy.filter(node=>(node.meshRefs||[]).includes(nodeId)).sort((a,b)=>Math.abs(a.level-5)-Math.abs(b.level-5))[0]||null;
const mappedAncestor=(part,taxonomy,root)=>{
 for(let node=part;node&&node!==root;node=node.parent){
  const id=node.userData?.nodeId;if(!id)continue;
  const meta=bestMeta(taxonomy,id);if(meta)return {meta,nodeId:id,exact:node===part};
 }
 return null;
};

export function auditClickTargetTaxonomyAncestry(){
 const machines=[],failures=[];
 for(const machine of MACHINE_REGISTRY){
  let template;
  try{
   template=createPolishedMachineTemplate(machine.machineId);
   const taxonomy=searchCorpusForMachine(machine,routeFor(machine)).taxonomy;
   const targets=new Set(),unresolved=[];
   for(const mesh of template.meshes||[]){
    const part=template.resolvePart?.(mesh);if(!part||targets.has(part))continue;targets.add(part);
    const mapping=mappedAncestor(part,taxonomy,template.root);
    if(!mapping)unresolved.push({nodeId:part.userData?.nodeId||null,name:part.name||null});
   }
   const row={machineId:machine.machineId,name:machine.name,clickTargets:targets.size,unresolved,problems:[]};
   if(!targets.size)row.problems.push('NO_CLICK_TARGETS');
   if(unresolved.length)row.problems.push('CLICK_TARGET_WITHOUT_TAXONOMY_ANCESTOR');
   machines.push(row);if(row.problems.length)failures.push(row);
  }catch(error){
   const row={machineId:machine.machineId,name:machine.name,problems:['EXCEPTION'],error:String(error?.stack||error)};
   machines.push(row);failures.push(row);
  }finally{template?.dispose?.();}
 }
 return {total:machines.length,passed:machines.length-failures.length,failed:failures.length,machines,failures};
}
