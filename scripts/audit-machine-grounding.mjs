import * as THREE from 'three';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

const finiteVec=v=>v&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&Number.isFinite(v.z);

export function auditMachineGroundingAndMotion(){
 const machines=[],failures=[];
 for(const asset of MACHINE_REGISTRY){
  let template,simulation;
  try{
   template=createPolishedMachineTemplate(asset.machineId);
   const root=template.root;root.updateMatrixWorld(true);
   const staticBox=new THREE.Box3().setFromObject(root),staticSize=staticBox.getSize(new THREE.Vector3());
   simulation=createMachineSimulation(asset.machineId,root,template);
   root.updateMatrixWorld(true);
   const baselineBox=new THREE.Box3().setFromObject(root),baselineSize=baselineBox.getSize(new THREE.Vector3());
   const margin=new THREE.Vector3(
    Math.max(.5,baselineSize.x*.12),
    Math.max(.5,baselineSize.y*.22),
    Math.max(.5,baselineSize.z*.12)
   );
   const allowed=baselineBox.clone().expandByVector(margin);
   const problems=[];
   if(!finiteVec(staticBox.min)||!finiteVec(staticBox.max))problems.push('NON_FINITE_STATIC_BOUNDS');
   if(staticBox.min.y>.25)problems.push('WHOLE_MACHINE_FLOATING');
   if(staticBox.min.y<-.5)problems.push('WHOLE_MACHINE_SUNK');
   const start=simulation.start();
   let maxBelow=0,maxOverflow=0,maxGrowth=1,maxOverflowAxis=null,maxOverflowBox=null,maxOverflowFrame=null;
   for(let frame=0;frame<=720;frame++){
    simulation.update(frame*1000/60);
    if(frame%60)continue;
    root.updateMatrixWorld(true);
    const dynamicBox=new THREE.Box3().setFromObject(root),dynamicSize=dynamicBox.getSize(new THREE.Vector3());
    if(!finiteVec(dynamicBox.min)||!finiteVec(dynamicBox.max)){problems.push('NON_FINITE_DYNAMIC_BOUNDS');break;}
    maxBelow=Math.max(maxBelow,Math.max(0,-dynamicBox.min.y));
    const overflowByAxis={
     minX:Math.max(0,allowed.min.x-dynamicBox.min.x),minY:Math.max(0,allowed.min.y-dynamicBox.min.y),minZ:Math.max(0,allowed.min.z-dynamicBox.min.z),
     maxX:Math.max(0,dynamicBox.max.x-allowed.max.x),maxY:Math.max(0,dynamicBox.max.y-allowed.max.y),maxZ:Math.max(0,dynamicBox.max.z-allowed.max.z)
    };
    const [overflowAxis,overflow]=Object.entries(overflowByAxis).sort((a,b)=>b[1]-a[1])[0];
    if(overflow>maxOverflow){maxOverflow=overflow;maxOverflowAxis=overflowAxis;maxOverflowFrame=frame;maxOverflowBox={min:dynamicBox.min.toArray(),max:dynamicBox.max.toArray()};}
    const growth=Math.max(...dynamicSize.toArray().map((v,i)=>baselineSize.getComponent(i)>.05?v/baselineSize.getComponent(i):1));
    maxGrowth=Math.max(maxGrowth,growth);
   }
   simulation.stop();
   if(start?.blocked!==true&&maxOverflow>.001)problems.push('SIMULATION_ESCAPES_MACHINE_ENVELOPE');
   if(maxBelow>.55)problems.push('SIMULATION_BELOW_FLOOR');
   const row={
    machineId:asset.machineId,name:asset.name,
    staticMinY:+staticBox.min.y.toFixed(4),
    staticSize:staticSize.toArray().map(v=>+v.toFixed(3)),
    baselineSize:baselineSize.toArray().map(v=>+v.toFixed(3)),
    maxBelow:+maxBelow.toFixed(4),maxOverflow:+maxOverflow.toFixed(4),maxOverflowAxis,maxOverflowFrame,maxOverflowBox,maxGrowth:+maxGrowth.toFixed(4),
    blocked:start?.blocked===true,problems:[...new Set(problems)]
   };
   machines.push(row);if(row.problems.length)failures.push(row);
  }catch(error){
   const row={machineId:asset.machineId,name:asset.name,problems:['EXCEPTION'],error:String(error?.stack||error)};
   machines.push(row);failures.push(row);
  }finally{simulation?.dispose?.();template?.dispose?.();}
 }
 return {total:MACHINE_REGISTRY.length,passed:MACHINE_REGISTRY.length-failures.length,failed:failures.length,machines,failures};
}
