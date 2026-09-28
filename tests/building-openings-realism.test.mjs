import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';

test('room and source walls have no painted-on glazing, and personnel leaves remain hinged to jambs',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const {root,layers}=buildActualFactory(layout,fleet);
 const fakeGlass=[];root.traverse(o=>{if(['FROSTED_CLERESTORY','ROOM_ENVELOPE_FROSTED_TRANSOM_REFERENCE'].includes(o.userData?.semantic))fakeGlass.push(o);});
 assert.equal(fakeGlass.length,0);
 const doors=layers.doors.children.filter(d=>d.userData.openingTypeReference==='PERSONNEL_HINGED');
 assert.ok(doors.length>0);
 for(const door of doors){
  const pivot=door.children.find(c=>c.isGroup&&c.children.some(m=>m.userData?.semantic==='PERSONNEL_DOOR_LEAF_REFERENCE'));
  assert.ok(pivot,door.name);
  const leaf=pivot.children.find(c=>c.userData?.semantic==='PERSONNEL_DOOR_LEAF_REFERENCE');
  const hinge=new THREE.Vector3(-Math.abs(door.children[0].position.x)+.055,0,0);
  assert.ok(Math.abs(pivot.position.x-hinge.x)<.11);
  assert.ok(leaf.position.x>0);
  assert.ok(pivot.children.some(c=>c.userData?.semantic==='PERSONNEL_DOOR_HANDLE_REFERENCE'));
 }
});
