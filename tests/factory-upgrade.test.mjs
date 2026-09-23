import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {FactoryEngine} from '../frontend/src/engine.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {loadFactoryFleet} from '../frontend/src/factory-building.js';

test('factory upgrades the same layout from the initial CAD scene to every complete machine',async()=>{
 const layout=await loadActualPlantLayout(),engine={low:true,factory:new THREE.Group(),clearFactory(){this.factory.clear();this.actualFactory=null;}};
 delete layout.fleet;
 FactoryEngine.prototype.loadLayout.call(engine,layout);
 assert.ok(engine.factory.children.length>0);
 assert.equal(engine.actualFactory,null);
 layout.fleet=await loadFactoryFleet();
 FactoryEngine.prototype.loadLayout.call(engine,layout);
 assert.equal(engine.loadedFleet,layout.fleet);
 assert.equal(engine.actualFactory.assets.size,layout.fleet.length);
 assert.ok(engine.actualFactory.root.userData.buildingDetailPass);
 let meshes=0;engine.actualFactory.root.traverse(o=>{if(o.isMesh)meshes++;});
 assert.ok(meshes>6000,'the complete factory should be present even in low GPU mode');
 const root=engine.actualFactory.root;
 FactoryEngine.prototype.loadLayout.call(engine,layout);
 assert.equal(engine.actualFactory.root,root,'unchanged full scenes must not rebuild on navigation');
});
