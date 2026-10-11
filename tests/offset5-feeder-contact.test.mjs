import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

test('feeder air outlets and rear separator feet remain outside the paper volume',()=>{
 const t=createPolishedMachineTemplate('offset5');try{
  t.root.updateMatrixWorld(true);
  const paper=new THREE.Box3(new THREE.Vector3(-8.82,.24,-.77),new THREE.Vector3(-7.64,1.40,.77));
  for(const id of ['feeder-air','feeder-rear-edge'])t.findNode(id).traverse(m=>{
   if(m.isMesh)assert.ok(!new THREE.Box3().setFromObject(m).intersectsBox(paper),`${id} intersects main pile`);
  });
  const nonstop=t.findNode('feeder-nonstop');let count=0;nonstop.traverse(o=>{if(o.isMesh)count++;});
  assert.equal(count,0,'unverified deployed rake must not penetrate the pile');
  assert.equal(nonstop.userData.installedConfigurationVerified,false);
 }finally{t.dispose();}
});

test('feeder sucker cycle approaches the pile without penetration, lifts and forwards, and resets',()=>{
 const t=createPolishedMachineTemplate('offset5'),s=createMachineSimulation('offset5',t.root,t);try{
  const cups=t.findNode('feeder-suction-cups'),rest=cups.position.clone();let min=Infinity,max=-Infinity,forward=0;
  s.start();for(let i=0;i<200;i++){
   s.update(1000+i*10);t.root.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(cups);
   min=Math.min(min,b.min.y);max=Math.max(max,b.min.y);forward=Math.max(forward,cups.position.x-rest.x);
   assert.ok(b.min.y>=1.40,'sucker must not enter the paper pile');
  }
  assert.ok(min>=1.401&&min<1.405,'sucker must reach the pile surface with small visual clearance');
  assert.ok(max-min>.085,'pickup must visibly lift');assert.ok(forward>.065,'pickup must forward');
  assert.ok(s.curve.getPointAt(0).y>=1.40,'sheet must originate above the pile');
  const held=cups.position.clone();s.pause();s.update(4000);assert.deepEqual(cups.position.toArray(),held.toArray());
  t.root.updateMatrixWorld(true);const stack=t.findNode('feeder-paper-stack'),platform=t.findNode('feeder-pile-platform');
  const paperBounds=new THREE.Box3().setFromObject(stack);
  assert.ok(stack.scale.y<1,'pile must reduce as sheets are consumed');
  assert.ok(Math.abs(paperBounds.max.y-1.40)<1e-5,'automatic lift must hold the pickup surface constant');
  assert.ok(Math.abs(paperBounds.min.y-(.24+platform.position.y))<1e-5,'lift platform must support the remaining pile');
  assert.equal(t.findNode('feeder-lift-forks').position.y,platform.position.y);
  s.stop();assert.deepEqual(cups.position.toArray(),rest.toArray());
  assert.equal(stack.scale.y,1);assert.equal(platform.position.y,0);
 }finally{s.dispose();t.dispose();}
});

test('feeder preserves photo head profile and marks unverified installed configuration',()=>{
 const t=createPolishedMachineTemplate('offset5');try{
  let housing;t.findNode('feeder-head').traverse(m=>{if(m.userData.photoFeederHeadProfile)housing=m;});
  assert.ok(housing);assert.equal(housing.geometry.type,'ExtrudeGeometry');
  assert.equal(t.findNode('feeder-suction-cups').userData.installedCupCountVerified,false);
  assert.equal(t.findNode('feeder-adjustment-drives').userData.installedConfigurationVerified,false);
  assert.equal(t.findNode('feeder-separation').userData.duplicateCupGeometryRemoved,true);
 }finally{t.dispose();}
});
