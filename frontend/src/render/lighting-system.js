import * as THREE from 'three';

export function createIndustrialLighting(scene){
 const sky=new THREE.HemisphereLight(0xffffff,0x87979f,2.7);
 const key=new THREE.DirectionalLight(0xfffaf1,3.3);
 key.position.set(-5,12,7);key.castShadow=true;
 key.shadow.mapSize.set(1024,1024);
 Object.assign(key.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:.5,far:50});
 key.shadow.bias=-.001;key.shadow.normalBias=.035;
 scene.add(sky,key);
 return {key,sky,dispose(){scene.remove(sky,key);key.shadow.map?.dispose();}};
}
