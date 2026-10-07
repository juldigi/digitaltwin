import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {refinedCylinder,applyRoundComponentFidelity} from '../frontend/src/geometry/round-components.js';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';
import {MACHINE_PLACEMENTS} from '../frontend/src/data/plant-actual.js';

test('round contour error decreases while physical cylinder dimensions and caps remain intact',()=>{
 const original=new THREE.CylinderGeometry(.4,.3,1.2,16,3,false,.2,Math.PI*2),g=refinedCylinder(original);
 assert.ok(g);
 for(const key of ['radiusTop','radiusBottom','height','heightSegments','openEnded','thetaStart','thetaLength'])assert.equal(g.parameters[key],original.parameters[key]);
 const deviation=n=>.4*(1-Math.cos(Math.PI/n));
 assert.ok(deviation(g.parameters.radialSegments)<deviation(16)/3);
 assert.deepEqual(g.groups.map(x=>x.materialIndex),original.groups.map(x=>x.materialIndex));
 assert.ok(g.attributes.normal.array.every(Number.isFinite));
 assert.equal(g.attributes.uv.count,g.attributes.position.count);
 original.dispose();g.dispose();
});

test('authored deformations, partial cylinders and polygonal fasteners are retained',()=>{
 const items=[new THREE.CylinderGeometry(.3,.3,1,6),new THREE.CylinderGeometry(.3,.3,1,16,1,false,0,Math.PI),new THREE.CylinderGeometry(.3,.3,1,16)];
 items[2].translate(.1,0,0);
 for(const g of items){assert.equal(refinedCylinder(g),null);g.dispose();}
});

test('shared round geometry retains economical originals and releases replacement exactly once',()=>{
 const root=new THREE.Group(),original=new THREE.CylinderGeometry(.3,.3,1,16),a=new THREE.Mesh(original),b=new THREE.Mesh(original);
 root.add(a,b);let originalDisposed=0,replacementDisposed=0;
 original.addEventListener('dispose',()=>originalDisposed++);
 const template={root,setLow(){},dispose(){assert.equal(a.geometry,original);original.dispose();}};
 applyRoundComponentFidelity(template);const replacement=a.geometry;
 assert.equal(b.geometry,replacement);replacement.addEventListener('dispose',()=>replacementDisposed++);
 template.setLow(true);assert.equal(a.geometry,original);assert.equal(b.geometry,original);
 template.setLow(false);assert.equal(a.geometry,replacement);
 template.dispose();template.dispose();assert.equal(originalDisposed,1);assert.equal(replacementDisposed,1);
});

test('all 41 machine templates preserve round-part transforms through detail switches',()=>{
 for(const p of MACHINE_PLACEMENTS){
  const t=createPolishedMachineTemplate(p.machineId),parts=[];
  try{
   t.root.traverse(o=>{if(o.geometry?.userData.roundComponentRevision==='V347')parts.push({o,g:o.geometry,m:o.matrix.clone(),parameters:{...o.geometry.parameters}});});
   assert.ok(parts.length>0,p.machineId);
   t.setLow(true);
   for(const {o,g,parameters} of parts){assert.notEqual(o.geometry,g);for(const k of ['radiusTop','radiusBottom','height','thetaLength'])assert.equal(o.geometry.parameters[k],parameters[k]);}
   t.setLow(false);
   for(const {o,g,m} of parts){assert.equal(o.geometry,g);assert.deepEqual(o.matrix.elements,m.elements);}
  }finally{t.dispose();}
 }
});
