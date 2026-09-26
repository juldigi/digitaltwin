import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {loadFactoryFleet} from '../frontend/src/factory-building.js';
import {buildActualFactory} from '../frontend/src/factory-building.js';
import {cameraFrame} from '../frontend/src/render/camera-director.js';

test('dinding dan furnitur dapat disembunyikan tanpa menghilangkan isi ruangan',async()=>{
 const layout=await loadActualPlantLayout(),factory=buildActualFactory(layout,await loadFactoryFleet());
 const {building,walls,furniture}=factory.layers;
 let wallsCount=0,furnitureCount=0,roomFloors=0;
 walls.traverse(o=>{if(o.isMesh)wallsCount++;});
 furniture.traverse(o=>{if(o.isMesh)furnitureCount++;});
 building.traverse(o=>{if(o.userData?.semantic?.startsWith('ROOM_FLOOR_'))roomFloors++;});
 assert.ok(wallsCount>50,'dinding aktual dan liner ruangan tersedia');
 assert.ok(furnitureCount>50,'furnitur ruangan tersedia');
 assert.ok(roomFloors>0,'lantai ruangan terpisah dari dinding');
 walls.visible=false;
 assert.equal(furniture.visible,true);
 assert.equal(building.visible,true);
 furniture.visible=false;walls.visible=true;
 assert.equal(building.visible,true);
 factory.dispose?.();
});

test('kamera operating side mengikuti rotasi tiap aset',()=>{
 const camera=new THREE.PerspectiveCamera(38,1,.05,1000),box=new THREE.Box3(new THREE.Vector3(-2,0,-1),new THREE.Vector3(2,2,1));
 for(const rotation of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
  const local=new THREE.Vector3(0,.38,-1).applyAxisAngle(new THREE.Vector3(0,1,0),rotation).setY(.38);
  const frame=cameraFrame(camera,box,{mode:'operator',direction:local});
  const horizontal=frame.position.clone().sub(frame.center).setY(0).normalize();
  assert.ok(horizontal.dot(local.clone().setY(0).normalize())>.999);
 }
});
