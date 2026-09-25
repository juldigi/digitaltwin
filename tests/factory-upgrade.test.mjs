import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {FactoryEngine} from '../frontend/src/engine.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {loadFactoryFleet} from '../frontend/src/factory-building.js';

test('factory keeps complete detail on normal phones and reserves proxy for severely limited memory',async()=>{
 const layout=await loadActualPlantLayout();
 delete layout.fleet;

 const mobile={low:true,capabilities:{memory:2},factory:new THREE.Group(),clearFactory(){this.factory.clear();this.actualFactory=null;}};
 FactoryEngine.prototype.loadLayout.call(mobile,layout);
 assert.ok(mobile.factory.children.length>0);
 assert.equal(mobile.actualFactory,null);

 layout.fleet=await loadFactoryFleet();
 FactoryEngine.prototype.loadLayout.call(mobile,layout);
 assert.equal(mobile.loadedFleet,layout.fleet);
 assert.equal(mobile.actualFactory.assets.size,layout.fleet.length);
 assert.equal(mobile.actualFactory.root.userData.mobileLowDetail,true);
 assert.equal(mobile.actualFactory.root.userData.renderStatus,'MOBILE_LOW_DETAIL_FACTORY_PROXY');
 let mobileMeshes=0;mobile.actualFactory.root.traverse(o=>{if(o.isMesh)mobileMeshes++;});
 assert.ok(mobileMeshes<500,'low-detail mobile factory must stay lightweight');
 const mobileRoot=mobile.actualFactory.root;
 FactoryEngine.prototype.loadLayout.call(mobile,layout);
 assert.equal(mobile.actualFactory.root,mobileRoot,'unchanged mobile proxy must not rebuild on navigation');

 const desktop={low:true,capabilities:{memory:4},factory:new THREE.Group(),clearFactory(){this.factory.clear();this.actualFactory=null;}};
 FactoryEngine.prototype.loadLayout.call(desktop,layout);
 assert.equal(desktop.actualFactory.assets.size,layout.fleet.length);
 assert.ok(desktop.actualFactory.root.userData.buildingDetailPass);
 let desktopMeshes=0;desktop.actualFactory.root.traverse(o=>{if(o.isMesh)desktopMeshes++;});
 assert.ok(desktopMeshes>6000,'desktop/full mode must keep the complete factory');
});
