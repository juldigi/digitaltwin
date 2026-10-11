import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Polar115MachineTemplate} from '../frontend/src/polar115.js';
import {Polar115ProcessSimulation} from '../frontend/src/simulation-polar115.js';

test('POLAR clamp face reaches the pile without penetration while cylinder housing remains fixed',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);s.start();let now=1000,sawContact=false,minGap=Infinity;s.update(now);
 const cylinderRest=s.clampCylinders.position.clone(),assemblyRest=s.clampAssembly.position.clone();
 for(let i=0;i<760;i++){
  now+=10;s.update(now);m.root.updateMatrixWorld(true);minGap=Math.min(minGap,s.state().clampGap??Infinity);
  assert.ok(s.clampCylinders.position.distanceTo(cylinderRest)<1e-10,'stationary cylinder housing follows pressure bar');
  assert.ok(s.clampAssembly.position.distanceTo(assemblyRest)<1e-10,'entire clamp assembly translates as one block');
  if(s.state().clampContact){
   sawContact=true;const face=new THREE.Box3().setFromObject(s.clampFace),stock=new THREE.Box3().setFromObject(s.stock);
   assert.ok(Math.abs(face.min.y-stock.max.y)<=s.clampContactTolerance+1e-6,'pressure face does not meet stock surface');
   assert.ok(s.state().clampGap>=-1e-7,'pressure face penetrates the stock');
  }
 }
 assert.ok(sawContact);assert.ok(minGap>=-1e-7);assert.ok(Math.abs(s.clampStroke-.1165)<1e-9,'stroke is not derived from represented contact surfaces');
 s.stop();assert.ok(s.clamp.position.distanceTo(s.rest.clamp)<1e-10);assert.ok(s.clampFace.position.distanceTo(s.rest.clampFace)<1e-10);
 s.dispose();m.dispose();
});

test('POLAR clamp moving beam and contact face stay synchronized in every display mode',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);s.start();let now=1000;s.update(now);
 while(s.phase()<.52){now+=10;s.update(now);}
 const beamDrop=s.rest.clamp.y-s.clamp.position.y,faceDrop=s.rest.clampFace.y-s.clampFace.position.y;
 assert.ok(beamDrop>0);assert.ok(Math.abs(beamDrop-faceDrop)<1e-10);
 for(const low of [false,true])for(const interior of [false,true]){m.setExteriorOpen(interior);m.setLow(low);assert.equal(s.clamp.children.some(x=>x.isMesh&&x.visible),true);assert.equal(s.clampFace.children.some(x=>x.isMesh&&x.visible),true);}
 s.dispose();m.dispose();
});
