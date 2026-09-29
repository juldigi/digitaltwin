import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {buildActualFactory,loadFactoryFleet,machineClearanceBoxes} from '../frontend/src/factory-building.js';

let factory;
async function scene(){
 if(!factory)factory=buildActualFactory(await loadActualPlantLayout(),await loadFactoryFleet());
 return factory;
}
function matching(root,semantic){const result=[];root.traverse(o=>{if(o.userData?.semantic===semantic)result.push(o);});return result;}

test('photo-inspired floor finishes stay independent of structure and room contents',async()=>{
 const f=await scene();
 assert.equal(matching(f.layers.floor,'PHOTO_GREEN_EPOXY_WORK_ZONE_REFERENCE').length,3);
 assert.equal(matching(f.layers.floor,'PHOTO_YELLOW_AISLE_EDGE_REFERENCE').length,6);
 const clearances=machineClearanceBoxes(await loadFactoryFleet());
 for(const zone of matching(f.layers.floor,'PHOTO_GREEN_EPOXY_WORK_ZONE_REFERENCE')){
  const x=zone.position.x,y=-zone.position.z,w=zone.scale.x,d=zone.scale.z;
  assert.ok(clearances.every(q=>!(x+w/2>q.minX&&x-w/2<q.maxX&&y+d/2>q.minY&&y-d/2<q.maxY)),'floor marking must stay clear of machines');
 }
 assert.ok(matching(f.layers.furniture,'PRODUCTION_WIP_SHEET_LAYER').length>=120);
 assert.ok(matching(f.layers.furniture,'PRODUCTION_WIP_STRETCH_WRAP_REFERENCE').length>0);
 f.layers.furniture.visible=false;
 assert.equal(f.layers.floor.visible,true);
 f.layers.furniture.visible=true;
});

test('IPAL operator windows are openings in walls and mixer motors sit over actual upper tanks',async()=>{
 const f=await scene(),photos=f.root.userData.ipal.photoActual;
 assert.deepEqual(photos.equipmentEnvelopeCollisions,[]);
 assert.equal(photos.supportGroundingAudit.floatingLegs,0);
 const windows=matching(f.layers.ipal,'IPAL_PHOTO_OPERATOR_ROOM_FRONT_WINDOW');
 const piers=matching(f.layers.ipal,'IPAL_PHOTO_OPERATOR_ROOM_FRONT_PIER');
 const sill=matching(f.layers.ipal,'IPAL_PHOTO_OPERATOR_ROOM_FRONT_WALL')[0];
 const header=matching(f.layers.ipal,'IPAL_PHOTO_OPERATOR_ROOM_FRONT_HEADER_WALL')[0];
 assert.equal(windows.length,3);
 assert.equal(piers.length,4);
 const center=new THREE.Vector3();new THREE.Box3().setFromObject(windows[1]).getCenter(center);
 assert.ok(new THREE.Box3().setFromObject(sill).max.y<center.y);
 assert.ok(new THREE.Box3().setFromObject(header).min.y>center.y);
 for(const pier of piers)assert.equal(new THREE.Box3().setFromObject(pier).containsPoint(center),false);
 const tanks=matching(f.layers.ipal,'IPAL_PHOTO_UPPER_RED_CHEMICAL_TANK');
 const drives=matching(f.layers.ipal,'IPAL_PHOTO_CHEMICAL_MIXER_DRIVE');
 assert.equal(tanks.length,2);assert.equal(drives.length,2);
 for(const motor of drives){
  const below=tanks.find(t=>Math.hypot(t.position.x-motor.position.x,t.position.z-motor.position.z)<.01);
  assert.ok(below,'every mixer has a tank directly beneath it');
  assert.ok(new THREE.Box3().setFromObject(below).max.y<new THREE.Box3().setFromObject(motor).max.y);
 }
});
