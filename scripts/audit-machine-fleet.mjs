import * as THREE from 'three';
import {pathToFileURL} from 'node:url';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';

const finite=v=>Number.isFinite(v);
const finiteVec=v=>v&&finite(v.x)&&finite(v.y)&&finite(v.z);

export function auditMachineFleet(){
 const machines=[],failures=[];
 for(const asset of MACHINE_REGISTRY){
  let template;
  try{
   template=createPolishedMachineTemplate(asset.machineId);
   const root=template.root;root.updateMatrixWorld(true);
   const box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3());
   let meshCount=0,visibleBefore=0,invalidVertices=0,invalidMaterials=0,coverMotionConflicts=0;
   root.traverse(o=>{
    if(!o.isMesh)return;meshCount++;if(o.visible)visibleBefore++;
    const arr=o.geometry?.attributes?.position?.array;
    if(arr)for(let i=0;i<arr.length;i++)if(!finite(arr[i])){invalidVertices++;break;}
    const mats=Array.isArray(o.material)?o.material:[o.material];
    for(const m of mats){
     if(!m)continue;
     for(const value of [m.opacity,m.roughness,m.metalness].filter(v=>v!==undefined))if(!finite(value))invalidMaterials++;
    }
    const moving=Boolean(o.userData?.rotor||o.userData?.driveRotor||o.userData?.motion||o.userData?.reciprocator||o.userData?.platenMoving||o.userData?.clampMoving||o.userData?.rotatingAssembly||o.userData?.gripperBar||o.userData?.deliveryGripperBar||o.userData?.jogger||o.userData?.rejectPlate);
    if(o.userData?.exteriorCover&&moving)coverMotionConflicts++;
   });

   template.setLow?.(true);template.setExteriorOpen?.(false);root.updateMatrixWorld(true);
   let lowVisible=0;root.traverse(o=>{if(o.isMesh&&o.visible)lowVisible++;});
   const lowBox=new THREE.Box3().setFromObject(root),lowSize=lowBox.getSize(new THREE.Vector3());
   template.setLow?.(false);

   const presentation=root.userData.presentationAudit||{};
   const problems=[];
   if(meshCount<1)problems.push('NO_MESHES');
   if(!finiteVec(box.min)||!finiteVec(box.max)||!finiteVec(size))problems.push('NON_FINITE_ENVELOPE');
   if(Math.min(...size.toArray())<=.05||Math.max(...size.toArray())>80)problems.push('IMPLAUSIBLE_ENVELOPE');
   if(invalidVertices)problems.push('NON_FINITE_VERTICES');
   if(invalidMaterials)problems.push('NON_FINITE_MATERIAL');
   if(lowVisible<1||!finiteVec(lowSize)||Math.min(...lowSize.toArray())<=.03)problems.push('LOW_LOD_COLLAPSED');
   if(coverMotionConflicts)problems.push('MOVING_EXTERIOR_COVER');
   if(presentation.invalidTransforms||presentation.invalidGeometryBounds||presentation.zeroScaleMeshes||presentation.coverMotionConflicts)problems.push('PRESENTATION_AUDIT_FAILED');
   if(root.userData.presentationPolishRevision!=='V233')problems.push('V233_NOT_APPLIED');

   const row={
    machineId:asset.machineId,no:asset.no,name:asset.name,
    meshes:meshCount,visibleBefore,visibleLow:lowVisible,
    size:size.toArray().map(v=>+v.toFixed(3)),
    presentationValid:presentation.valid===true,
    problems
   };
   machines.push(row);
   if(problems.length)failures.push(row);
  }catch(error){
   const row={machineId:asset.machineId,no:asset.no,name:asset.name,problems:['EXCEPTION'],error:String(error?.stack||error)};
   machines.push(row);failures.push(row);
  }finally{template?.dispose?.();}
 }
 return {total:MACHINE_REGISTRY.length,audited:machines.length,passed:machines.length-failures.length,failed:failures.length,failures,machines};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const report=auditMachineFleet();
 console.log(JSON.stringify({total:report.total,audited:report.audited,passed:report.passed,failed:report.failed,failures:report.failures},null,2));
 if(report.failed)process.exitCode=1;
}
