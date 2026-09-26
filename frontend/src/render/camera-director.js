import * as THREE from 'three';

const UP=new THREE.Vector3(0,1,.0001);
const ISOMETRIC=new THREE.Vector3(.85,.7,-1.25).normalize();

// Frame the actual visible bounds, including a group of selected parts.
// The same calculation serves the factory, machines, and selected components.
export function cameraFrame(camera,box,{mode='iso',direction:operatingDirection=null,padding=1.18,targetLift=0,minDistance=.4,maxDistance=1e7}={}){
 if(box.isEmpty())return null;
 const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
 center.y+=size.y*targetLift;
 const radius=Math.max(size.length()*.5,.5);
 const vertical=camera.fov*Math.PI/360;
 const horizontal=Math.atan(Math.tan(vertical)*camera.aspect);
 const distance=THREE.MathUtils.clamp(radius/Math.sin(Math.min(vertical,horizontal))*padding,minDistance,maxDistance);
 const direction=mode==='top'?UP:operatingDirection?.isVector3?operatingDirection.clone().normalize():ISOMETRIC;
 const position=center.clone().addScaledVector(direction,distance);
 // A low camera angle must never pass through the inspection floor.
 position.y=Math.max(position.y,.15);
 return {center,position};
}

export function applyCameraFrame(camera,controls,frame,{animate=true,reduceMotion=false,now=performance.now()}={}){
 if(!frame)return null;
 if(!animate||reduceMotion){controls.target.copy(frame.center);camera.position.copy(frame.position);controls.update();return null;}
 return {start:now,from:camera.position.clone(),to:frame.position,fromTarget:controls.target.clone(),target:frame.center};
}

export function updateCameraTransition(camera,controls,transition,now,duration){
 if(!transition)return null;
 const t=THREE.MathUtils.clamp((now-transition.start)/Math.max(duration,1),0,1);
 const eased=t*t*(3-2*t);
 camera.position.lerpVectors(transition.from,transition.to,eased);
 controls.target.lerpVectors(transition.fromTarget,transition.target,eased);
 return t>=1?null:transition;
}
