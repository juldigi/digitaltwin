import test from 'node:test';
import assert from 'node:assert/strict';
import {sceneIdentity,validateSceneOverrides,validateSceneImport,createSceneIsolationGuard} from '../frontend/src/scene-editor-state.js';
import {FactoryEngine} from '../frontend/src/engine.js';
import * as THREE from 'three';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';

const original={position:[1,0,2],rotation:[0,0,0],scale:[1,1,1],visible:false,locked:true,deleted:true,identity:'["Mesh","Tank","IPAL_TANK","A1","IPAL","CylinderGeometry",0]'};

test('scene import accepts generated primitives and valid copies but rejects stale sources',()=>{
 const generated='new:123e4567-e89b-12d3-a456-426614174000',copy='copy:123e4567-e89b-12d3-a456-426614174001';
 const imported={[generated]:{shape:'box',position:[0,0,0],rotation:[0,0,0],scale:[1,1,1],visible:true},[copy]:{...original,sourceId:'wall:W1'}};
 const resolver={hasObject:id=>id==='wall:W1',identityFor:()=>original.identity};
 assert.equal(validateSceneImport(imported,resolver),imported);
 assert.throws(()=>validateSceneImport(imported,{...resolver,hasObject:()=>false}),/tidak sesuai/);
 assert.throws(()=>validateSceneImport(imported,{...resolver,identityFor:()=>''}),/tidak sesuai/);
});

test('scene overrides preserve reversible delete and lock, with strict bounded transforms',()=>{
 assert.deepEqual(validateSceneOverrides({'node:0.1':original}),{'node:0.1':original});
 assert.throws(()=>validateSceneOverrides({'node:0.1':{...original,position:[Infinity,0,0]}}),/Transform/);
 assert.throws(()=>validateSceneOverrides({'node:0.1':{...original,scale:[0,1,1]}}),/Skala/);
 assert.throws(()=>validateSceneOverrides({'node:0.1':{...original,unexpected:true}}),/tidak dikenal/);
 assert.throws(()=>validateSceneOverrides({'node:0.1':{...original,identity:'x'.repeat(301)}}),/Identitas/);
});

test('source fingerprint changes when a path is reused by another semantic object',()=>{
 const tank={type:'Mesh',name:'Tank',userData:{semantic:'IPAL_TANK',sourceEntityId:'A1',sourceLayer:'IPAL'},geometry:{type:'CylinderGeometry'},children:[]};
 const wall={...tank,userData:{...tank.userData,semantic:'WALL'}};
 assert.notEqual(sceneIdentity(tank),sceneIdentity(wall));
 assert.equal(sceneIdentity(tank),sceneIdentity({...tank}));
});

test('duplicate replays without accumulating copies or changing the source geometry',()=>{
 const factory=new THREE.Group(),root=new THREE.Group(),source=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial());
 source.name='Source';root.add(source);factory.add(root);
 const engine={factory,actualFactory:{assets:new Map()},sceneBase:new WeakMap(),registerSceneObjects:FactoryEngine.prototype.registerSceneObjects};
 engine.registerSceneObjects();
 const id='copy:123e4567-e89b-12d3-a456-426614174000',value={sourceId:'node:0.0',position:[2,0,0],rotation:[0,0,0],scale:[1,1,1],visible:true,identity:sceneIdentity(source)};
 validateSceneOverrides({[id]:value});
 FactoryEngine.prototype.applySceneOverrides.call(engine,{[id]:value});
 assert.equal(root.children.length,2);assert.equal(engine.sceneObjects.get(id).position.x,2);assert.equal(source.position.x,0);
 FactoryEngine.prototype.applySceneOverrides.call(engine,{[id]:{...value,deleted:true}});
 assert.equal(root.children.length,2);assert.equal(engine.sceneObjects.get(id).visible,false);
 FactoryEngine.prototype.applySceneOverrides.call(engine,{});
 assert.equal(root.children.length,1);assert.equal(engine.sceneObjects.has(id),false);
});

test('machine hierarchy IDs preserve parent and child transforms independently',()=>{
 const factory=new THREE.Group(),machine=new THREE.Group(),unit=new THREE.Group(),part=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial());
 machine.add(unit);unit.add(part);const engine={factory,machine,machineKey:'offset5',actualFactory:{assets:new Map()},sceneBase:new WeakMap(),registerSceneObjects:FactoryEngine.prototype.registerSceneObjects};
 engine.registerSceneObjects();assert.equal(engine.sceneObjects.get('machine:offset5:root'),machine);assert.equal(engine.sceneObjects.get('machine:offset5:0.0'),part);
 const value={position:[.2,0,0],rotation:[0,0,0],scale:[1,1,1],visible:true,identity:sceneIdentity(part)};
 validateSceneOverrides({'machine:offset5:0.0':value});FactoryEngine.prototype.applySceneOverrides.call(engine,{'machine:offset5:0.0':value});
 assert.equal(part.position.x,.2);assert.equal(machine.position.x,0);assert.equal(unit.position.x,0);
});

test('source wall and machine part IDs survive sibling insertion',()=>{
 const factory=new THREE.Group(),root=new THREE.Group(),wall=new THREE.Group(),machine=new THREE.Group(),part=new THREE.Group();wall.userData={editorStableId:'wall:SOURCE-A-10-20-30-40',editorWall:true};part.userData={nodeId:'PU3-gripper'};root.add(wall);factory.add(root);machine.add(part);
 const engine={factory,machine,machineKey:'offset5',actualFactory:{assets:new Map()},sceneBase:new WeakMap(),registerSceneObjects:FactoryEngine.prototype.registerSceneObjects};engine.registerSceneObjects();
 const wallId=wall.userData.editorStableId,partId='part:offset5:PU3-gripper';assert.equal(engine.sceneObjects.get(wallId),wall);assert.equal(engine.sceneObjects.get(partId),part);
 root.add(new THREE.Group());root.children.unshift(root.children.pop());machine.add(new THREE.Group());machine.children.unshift(machine.children.pop());engine.registerSceneObjects();
 assert.equal(engine.sceneObjects.get(wallId),wall);assert.equal(engine.sceneObjects.get(partId),part);
 assert.deepEqual(validateSceneOverrides({[partId]:{position:[0,0,0],rotation:[0,0,0],scale:[1,1,1],visible:true}})[partId].scale,[1,1,1]);
});

test('duplicating a machine part does not steal the original stable part ID',()=>{
 const factory=new THREE.Group(),machine=new THREE.Group(),part=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial());part.userData={nodeId:'PU1-body'};machine.add(part);
 const engine={factory,machine,machineKey:'offset5',actualFactory:{assets:new Map()},sceneBase:new WeakMap(),registerSceneObjects:FactoryEngine.prototype.registerSceneObjects};engine.registerSceneObjects();
 const id='copy:123e4567-e89b-12d3-a456-426614174000',override={[id]:{sourceId:'part:offset5:PU1-body',position:[1,0,0],rotation:[0,0,0],scale:[1,1,1],visible:true,identity:sceneIdentity(part)}};
 FactoryEngine.prototype.applySceneOverrides.call(engine,override);engine.registerSceneObjects();
 assert.equal(engine.sceneObjects.get('part:offset5:PU1-body'),part);assert.equal(engine.sceneObjects.get(id),engine.sceneCopies.get(id));
});

test('replay resets edited objects while preserving independent layer visibility',()=>{
 const factory=new THREE.Group(),layer=new THREE.Group(),object=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial());factory.add(layer);layer.add(object);
 const engine={factory,actualFactory:{assets:new Map()},sceneBase:new WeakMap(),registerSceneObjects:FactoryEngine.prototype.registerSceneObjects};engine.registerSceneObjects();
 const value={position:[3,0,0],rotation:[0,0,0],scale:[1,1,1],visible:true};FactoryEngine.prototype.applySceneOverrides.call(engine,{'node:0.0':value});
 layer.visible=false;FactoryEngine.prototype.applySceneOverrides.call(engine,{});
 assert.equal(object.position.x,0);assert.equal(layer.visible,false);
});

test('created primitive persists by ID and is disposed when removed',()=>{
 const factory=new THREE.Group(),engine={factory,actualFactory:{assets:new Map()},sceneBase:new WeakMap(),registerSceneObjects:FactoryEngine.prototype.registerSceneObjects};
 const id='new:123e4567-e89b-12d3-a456-426614174000',value={shape:'box',position:[4,.5,8],rotation:[0,0,0],scale:[2,1,3],visible:true};
 validateSceneOverrides({[id]:value});FactoryEngine.prototype.applySceneOverrides.call(engine,{[id]:value});
 const first=engine.sceneObjects.get(id);assert.equal(first.position.x,4);assert.equal(first.scale.z,3);
 FactoryEngine.prototype.applySceneOverrides.call(engine,{[id]:{...value,deleted:true}});
 assert.equal(factory.children.length,1);assert.equal(engine.sceneObjects.get(id).visible,false);
 FactoryEngine.prototype.applySceneOverrides.call(engine,{});
 assert.equal(factory.children.length,0);
 assert.throws(()=>validateSceneOverrides({[id]:{...value,shape:'script'}}),/Bentuk/);
});

test('source wall endpoint editing carries the entire finish assembly',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const actualFactory=buildActualFactory(layout,fleet),factory=new THREE.Group();factory.add(actualFactory.root);
 const engine={factory,actualFactory,sceneBase:new WeakMap(),registerSceneObjects:FactoryEngine.prototype.registerSceneObjects,sceneWallEndpoints:FactoryEngine.prototype.sceneWallEndpoints};
 engine.registerSceneObjects();const [id,wall]=[...engine.sceneObjects].find(([,node])=>node.userData.editorWall);
 assert.ok(wall.children.length>=7);const before=FactoryEngine.prototype.sceneWallEndpoints.call(engine,id),child=wall.children[0];child.updateWorldMatrix(true,false);const childBefore=child.getWorldPosition(new THREE.Vector3());
 assert.equal(FactoryEngine.prototype.setSceneWallEndpoints.call(engine,id,[[before[0][0]+1,before[0][1]],[before[1][0]+2,before[1][1]]]),true);
 const after=FactoryEngine.prototype.sceneWallEndpoints.call(engine,id);assert.ok(Math.abs(after[0][0]-(before[0][0]+1))<1e-5);assert.ok(Math.abs(after[1][0]-(before[1][0]+2))<1e-5);
 child.updateWorldMatrix(true,false);assert.ok(child.getWorldPosition(new THREE.Vector3()).distanceTo(childBefore)>.1);
});


test('scene isolation is reversible and stays inside its editor scope',()=>{
 const scene=new THREE.Group(),factory=new THREE.Group(),machine=new THREE.Group(),part=new THREE.Group(),otherPart=new THREE.Group(),hiddenPart=new THREE.Group();
 hiddenPart.visible=false;machine.add(part,otherPart,hiddenPart);scene.add(factory,machine);
 const guard=createSceneIsolationGuard();
 assert.equal(guard.isolate(part,machine),2);
 assert.equal(otherPart.visible,false);
 assert.equal(hiddenPart.visible,false);
 assert.equal(factory.visible,true);
 assert.equal(guard.size,2);
 assert.equal(guard.restore(),2);
 assert.equal(otherPart.visible,true);
 assert.equal(hiddenPart.visible,false);
 assert.equal(factory.visible,true);
 assert.equal(guard.size,0);
});

test('scene isolation refuses to leak outside a mismatched scope',()=>{
 const scene=new THREE.Group(),factory=new THREE.Group(),machine=new THREE.Group(),part=new THREE.Group(),factorySibling=new THREE.Group();
 machine.add(part);factory.add(factorySibling);scene.add(factory,machine);
 const guard=createSceneIsolationGuard();
 assert.equal(guard.isolate(part,factory),0);
 assert.equal(factory.visible,true);
 assert.equal(machine.visible,true);
 assert.equal(factorySibling.visible,true);
 assert.equal(guard.size,0);
});
