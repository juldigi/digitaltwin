import test from 'node:test';
import assert from 'node:assert/strict';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';

test('roof equipment stays on the main roof and remains an unverified visual reference',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet);
 const modules=[],fans=[];
 built.layers.roof.traverse(object=>{
  if(object.userData?.semantic==='ROOF_SOLAR_MODULE_REFERENCE')modules.push(object);
  if(object.userData?.semantic==='ROOF_EXHAUST_FAN_REFERENCE')fans.push(object);
 });
 assert.equal(modules.length,24);
 assert.equal(fans.length,2);
 assert.equal(built.root.userData.buildingDetailStats.roofSolarModules,modules.length);
 assert.equal(built.root.userData.buildingDetailStats.roofExhaustFans,fans.length);
 for(const object of [...modules,...fans]){
  assert.equal(object.userData.roofId,'MAIN_HALL');
  assert.equal(object.userData.accuracy,'DESIGN_REFERENCE_NOT_AS_BUILT');
 }
 assert.ok(modules.every(object=>object.position.y>4.5&&object.position.y<7));
 assert.ok(fans.every(object=>object.position.y>6&&object.position.y+.44<7));
 assert.equal(built.layers.roof.visible,false);
});
