import * as THREE from 'three';

export class ShadowManager{
 constructor(light){this.light=light;}
 focus(object){
  const box=new THREE.Box3().setFromObject(object);
  if(box.isEmpty())return;
  const center=box.getCenter(new THREE.Vector3());
  const radius=Math.min(80,Math.max(12,box.getSize(new THREE.Vector3()).length()*.75));
  const camera=this.light.shadow.camera;
  this.light.target.position.copy(center);
  this.light.position.copy(center).add(new THREE.Vector3(-.42,1,.58).normalize().multiplyScalar(radius*2));
  camera.left=-radius;camera.right=radius;camera.top=radius;camera.bottom=-radius;
  camera.near=.5;camera.far=radius*5;camera.updateProjectionMatrix();
  this.light.target.updateMatrixWorld();this.light.shadow.needsUpdate=true;
 }
 reset(){
  this.light.position.set(-5,12,7);this.light.target.position.set(0,0,0);
  const camera=this.light.shadow.camera;
  Object.assign(camera,{left:-12,right:12,top:12,bottom:-12,near:.5,far:50});
  camera.updateProjectionMatrix();this.light.target.updateMatrixWorld();this.light.shadow.needsUpdate=true;
 }
}
