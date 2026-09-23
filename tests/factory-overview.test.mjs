import test from 'node:test';
import assert from 'node:assert/strict';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {FACTORY_OVERVIEW_FLEET} from '../frontend/src/data/factory-overview-data.js';
import {buildFactoryOverview} from '../frontend/src/factory-overview.js';
import {FactoryEngine} from '../frontend/src/engine.js';
import * as THREE from 'three';

test('mobile factory preserves surveyed machine positions with bounded scene geometry',async()=>{
 const layout=await loadActualPlantLayout(),built=buildFactoryOverview(layout,FACTORY_OVERVIEW_FLEET);
 let meshes=0;built.root.traverse(o=>{if(o.isMesh)meshes++;});
 assert.ok(meshes<60,`overview contains ${meshes} meshes`);
 assert.ok(built.layers.building.children.some(o=>o.userData.semantic==='CAD_WALL_SEGMENTS'));
 for(const f of FACTORY_OVERVIEW_FLEET){const p=f.placement;if(!Number.isFinite(p.x)||!Number.isFinite(p.y))continue;const g=built.assets.get(p.machineId);assert.ok(g,p.machineId);assert.equal(g.position.x,p.x);assert.equal(g.position.z,-p.y);assert.equal(g.children[0].userData.machineId,p.machineId);}
 assert.equal(built.root.userData.mobileOptimized,true);
});

test('low detail engine selects the surveyed overview without decoding the full fleet',async()=>{
 const layout=await loadActualPlantLayout();layout.fleetOverview=FACTORY_OVERVIEW_FLEET;
 const engine={low:true,factory:new THREE.Group(),clearFactory(){this.factory.clear();this.actualFactory=null;}};
 FactoryEngine.prototype.loadLayout.call(engine,layout);
 assert.equal(engine.actualFactory.root.userData.mobileOptimized,true);
 assert.equal(engine.actualFactory.assets.get('BMJ-MCH-0017').position.x,layout.placements.find(p=>p.machineId==='BMJ-MCH-0017').x);
});
