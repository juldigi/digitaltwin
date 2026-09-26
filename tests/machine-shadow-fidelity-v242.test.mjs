import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {ShadowManager} from '../frontend/src/render/shadow-manager.js';
import {FactoryEngine} from '../frontend/src/engine.js';

test('shadow coverage scales to compact machines and preserves large machine envelopes',()=>{
 const key=new THREE.DirectionalLight(),manager=new ShadowManager(key);
 for(const width of [2.7,12,38]){
  const bounds=new THREE.Box3(new THREE.Vector3(-width/2,0,-1),new THREE.Vector3(width/2,2,1));
  manager.focusBounds(bounds);
  const radius=key.shadow.camera.right;
  assert.ok(radius>=width/2,`machine width ${width} clipped`);
  if(width<3)assert.ok(radius<5,'compact machine shadow resolution is wasted');
  if(width>30)assert.ok(radius>width/2,'long machine shadow coverage is insufficient');
  assert.equal(key.target.position.x,0);
 }
 manager.reset();
 assert.equal(key.shadow.camera.right,12);
});

test('all fleet machines retain finite shadow focus after low detail is applied',()=>{
 const key=new THREE.DirectionalLight(),manager=new ShadowManager(key);
 for(const asset of MACHINE_REGISTRY){
  const template=createPolishedMachineTemplate(asset.machineId);
  try{
   template.setLow?.(true);
   manager.focus(template.root);
   const c=key.shadow.camera;
   assert.ok([c.left,c.right,c.top,c.bottom,c.near,c.far,...key.target.position.toArray()].every(Number.isFinite),asset.machineId);
   assert.ok(c.left<0&&c.right>0&&c.near<c.far,asset.machineId);
  }finally{template.dispose();}
 }
});

test('utility shadow coverage follows the equipment instead of the remote distribution route',()=>{
 const template=createPolishedMachineTemplate('BMJ-MCH-0034');
 const simulation=createMachineSimulation('BMJ-MCH-0034',template.root,template);
 try{
  simulation.setPathVisible(false);
  const context={template,machine:template.root,isObjectVisible:FactoryEngine.prototype.isObjectVisible};
  const box=FactoryEngine.prototype.machineFocusBounds.call(context);
  const key=new THREE.DirectionalLight(),manager=new ShadowManager(key);
  manager.focusBounds(box);
  assert.ok(key.shadow.camera.right<5);
  assert.ok(Math.abs(key.target.position.x)<1);
 }finally{simulation.dispose();template.dispose();}
});
