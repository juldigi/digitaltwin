import * as THREE from 'three';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';
import {cameraFrame} from '../frontend/src/render/camera-director.js';

const finiteVec=v=>v&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&Number.isFinite(v.z);
const corners=box=>{
 const {min,max}=box;
 return [
  [min.x,min.y,min.z],[max.x,min.y,min.z],[min.x,max.y,min.z],[max.x,max.y,min.z],
  [min.x,min.y,max.z],[max.x,min.y,max.z],[min.x,max.y,max.z],[max.x,max.y,max.z]
 ].map(([x,y,z])=>new THREE.Vector3(x,y,z));
};

function inspectFrame(box,{aspect,padding,mode='iso',direction=null}){
 const camera=new THREE.PerspectiveCamera(38,aspect,.05,1e7);
 const frame=cameraFrame(camera,box,{mode,direction,padding,minDistance:.4,maxDistance:1e7});
 if(!frame)return {ok:false,reason:'NO_FRAME'};
 camera.position.copy(frame.position);camera.lookAt(frame.center);camera.updateMatrixWorld(true);camera.updateProjectionMatrix();
 const ndc=corners(box).map(point=>point.clone().project(camera));
 const maxX=Math.max(...ndc.map(p=>Math.abs(p.x))),maxY=Math.max(...ndc.map(p=>Math.abs(p.y)));
 return {
  ok:finiteVec(frame.center)&&finiteVec(frame.position)&&Number.isFinite(maxX)&&Number.isFinite(maxY),
  center:frame.center.toArray(),position:frame.position.toArray(),
  distance:frame.position.distanceTo(frame.center),maxX,maxY,minCameraY:frame.position.y
 };
}

export function auditFleetCameraFraming(){
 const rows=[],failures=[];
 for(const asset of MACHINE_REGISTRY){
  let template;
  try{
   template=createPolishedMachineTemplate(asset.machineId);
   template.root.updateMatrixWorld(true);
   const box=new THREE.Box3().setFromObject(template.root),size=box.getSize(new THREE.Vector3());
   const operatorDirection=new THREE.Vector3(0,.38,-1).applyQuaternion(template.root.getWorldQuaternion(new THREE.Quaternion())).setY(.38);
   const desktop=inspectFrame(box,{aspect:1440/900,padding:1.18});
   const portrait=inspectFrame(box,{aspect:390/844,padding:1.06});
   const operator=inspectFrame(box,{aspect:1440/900,padding:1.18,mode:'operator',direction:operatorDirection});
   const problems=[];
   if(box.isEmpty()||!finiteVec(box.min)||!finiteVec(box.max))problems.push('INVALID_BOUNDS');
   if(Math.min(size.x,size.y,size.z)<=0)problems.push('DEGENERATE_BOUNDS');
   for(const [name,frame] of Object.entries({desktop,portrait,operator})){
    if(!frame.ok)problems.push(name.toUpperCase()+'_FRAME_INVALID');
    if(!(frame.distance>=.4&&frame.distance<=1e7))problems.push(name.toUpperCase()+'_DISTANCE_OUT_OF_RANGE');
    if(frame.maxX>1.001||frame.maxY>1.001)problems.push(name.toUpperCase()+'_CLIPS_VISIBLE_BOUNDS');
    if(frame.minCameraY<.149)problems.push(name.toUpperCase()+'_CAMERA_BELOW_FLOOR');
   }
   if(!finiteVec(operatorDirection)||operatorDirection.lengthSq()<.1)problems.push('INVALID_OPERATOR_DIRECTION');
   const row={machineId:asset.machineId,name:asset.name,size:size.toArray().map(v=>+v.toFixed(3)),desktop,portrait,operator,problems:[...new Set(problems)]};
   rows.push(row);if(row.problems.length)failures.push(row);
  }catch(error){
   const row={machineId:asset.machineId,name:asset.name,problems:['EXCEPTION'],error:String(error?.stack||error)};
   rows.push(row);failures.push(row);
  }finally{template?.dispose?.();}
 }
 return {total:rows.length,passed:rows.length-failures.length,failed:failures.length,machines:rows,failures};
}
