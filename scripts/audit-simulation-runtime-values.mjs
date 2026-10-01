import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {readableSimulationValue} from '../frontend/src/display-language.js';

const TARGETS=Object.freeze([
 {machineId:'BMJ-MCH-0025',field:'ctpMaterialContact'},
 {machineId:'BMJ-MCH-0026',field:'ctpMaterialContact'},
 {machineId:'BMJ-MCH-0027',field:'imagesetterMediaContactStage'},
 {machineId:'BMJ-MCH-0028',field:'zundVacuumMode'}
]);

export function auditRuntimeSimulationValuePresentation(){
 const rows=[],issues=[];
 for(const target of TARGETS){
  let template,simulation;
  try{
   template=createPolishedMachineTemplate(target.machineId);
   simulation=createMachineSimulation(target.machineId,template.root,template);
   simulation.start();
   const values=new Set();
   for(let frame=0;frame<=1800;frame++){
    simulation.update(frame*1000/60);
    if(frame%15)continue;
    const state=simulation.state?.(),value=state?.[target.field];
    if(value!=null&&String(value).trim())values.add(String(value));
    if((state?.completed??0)>0&&values.size>=2)break;
   }
   for(const value of values){
    const shown=readableSimulationValue(value),tokenLike=/^[A-Z0-9_]+$/.test(value);
    const row={...target,value,shown,tokenLike,translated:shown!==value};
    rows.push(row);
    if(tokenLike&&!row.translated)issues.push(row);
   }
  }finally{simulation?.dispose?.();template?.dispose?.();}
 }
 return {targets:TARGETS.length,rows,issues,issueCount:issues.length};
}
