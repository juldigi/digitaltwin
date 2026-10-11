import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

test('sheet curve stays within small clearance of the actual inclined tape triangles',()=>{
 const t=createPolishedMachineTemplate('offset5'),s=createMachineSimulation('offset5',t.root,t);try{
  t.root.updateMatrixWorld(true);const ray=new THREE.Raycaster(),vac=t.findNode('vacuum-table');let hits=0;
  for(let i=0;i<=2500;i++){
   const p=s.curve.getPointAt(i/2500);if(p.x<-7.18||p.x>-6.12)continue;
   ray.set(new THREE.Vector3(p.x,5,.035),new THREE.Vector3(0,-1,0));const hit=ray.intersectObject(vac,true)[0];
   assert.ok(hit,'central tape must exist beneath the sheet');
   assert.ok(Math.abs(p.y-hit.point.y-.002)<1e-5,`sheet clearance ${p.y-hit.point.y}`);hits++;
  }
  assert.ok(hits>30);
 }finally{s.dispose();t.dispose();}
});

test('both tape rollers remain circular while rotating under the scaled inclined table',()=>{
 const t=createPolishedMachineTemplate('offset5'),s=createMachineSimulation('offset5',t.root,t);try{
  const rollers=s.rotors.filter(r=>r.role==='vacuum-table-tape-drive-roller');assert.equal(rollers.length,2);
  const original=rollers.map(r=>r.mesh.quaternion.clone());s.start();
  for(let frame=0;frame<12;frame++){
   s.update(1000+frame*30);t.root.updateMatrixWorld(true);
   for(const {mesh} of rollers){const c=mesh.getWorldPosition(new THREE.Vector3()),a=mesh.geometry.attributes.position;let ringVertices=0;
    for(let i=0;i<a.count;i++){const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(mesh.matrixWorld);const radius=Math.hypot(p.x-c.x,p.y-c.y);if(radius<.01)continue;assert.ok(Math.abs(radius-.055)<1e-6,`distorted radius ${radius}`);ringVertices++;}
    assert.ok(ringVertices>20);
   }
  }
  assert.ok(rollers.every((r,i)=>r.mesh.quaternion.angleTo(original[i])>.001));s.stop();
  assert.ok(rollers.every((r,i)=>r.mesh.quaternion.angleTo(original[i])<1e-6));
 }finally{s.dispose();t.dispose();}
});

test('tape perforations are voids, with one reference detector bridge and no extra side belts',()=>{
 const t=createPolishedMachineTemplate('offset5');try{
  t.root.updateMatrixWorld(true);let tape;t.findNode('vacuum-table').traverse(m=>{if(m.userData.actualPerforatedGeometry)tape=m;});assert.ok(tape);
  const x=-6.65+1.4*(-.38+10*(.76/21)),ray=new THREE.Raycaster();
  ray.set(new THREE.Vector3(x,5,0),new THREE.Vector3(0,-1,0));assert.equal(ray.intersectObject(tape,false).length,0,'centre hole must pass through tape');
  ray.set(new THREE.Vector3(x,5,.035),new THREE.Vector3(0,-1,0));assert.ok(ray.intersectObject(tape,false).length>0,'solid belt must remain between holes');
  assert.equal(t.findNode('feedboard-front-lays').userData.installedFrontLayCountVerified,false);
  assert.match(t.findNode('feedboard-transport').userData.geometryPolicy,/SIDE_BELTS_REMOVED/);
  assert.equal(t.findNode('feedboard-gauge-fascia').userData.photoGaugeFascia,true);
  assert.match(t.findNode('feedboard-detection').userData.geometryPolicy,/SINGLE_DETECTOR_BRIDGE/);
 }finally{t.dispose();}
});
