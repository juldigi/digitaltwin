import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {FactoryEngine} from '../frontend/src/engine.js';

// Browser UI resize events occur while the canvas is open, including an iPhone
// changing orientation, inspector opening, and the on-screen keyboard appearing.
// These tests exercise the real engine method without requiring a WebGL context.
for(const [name,position,target] of [
 ['OFFSET 5',[13,8,23],[0,1.4,0]],
 ['Sheeting Lexus',[-17,5,4],[1.2,1.1,0]],
 ['POLAR 115',[3,3,6],[.4,1.0,-.2]]
]){
 test(`${name}: viewport resize retains selected camera and target during simulation`,()=>{
  const camera=new THREE.PerspectiveCamera(38,1,.05,10000);
  camera.position.fromArray(position);
  const controls={target:new THREE.Vector3(...target)};
  const originalPosition=camera.position.clone(),originalTarget=controls.target.clone();
  const sizes=[],effects=[];
  const engine=Object.create(FactoryEngine.prototype);
  engine.container={clientWidth:390,clientHeight:780};
  engine.renderer={setSize(w,h){sizes.push([w,h]);}};
  engine.postProcessing={resize(w,h){effects.push([w,h]);}};
  engine.camera=camera;
  engine.controls=controls;
  engine.simulation={active:true,running:true};
  engine.view='machine';
  engine.fit=()=>{throw new Error('Resize must never reframe camera to ISO');};

  for(const [w,h] of [[390,780],[390,560],[844,390],[390,780]]){
   engine.container.clientWidth=w;
   engine.container.clientHeight=h;
   engine.resize();
   assert.equal(camera.aspect,w/h);
   assert.ok(camera.position.equals(originalPosition),'camera direction/zoom must be preserved');
   assert.ok(controls.target.equals(originalTarget),'selected component focus must be preserved');
  }
  assert.deepEqual(sizes,effects,'renderer and post-processing must share viewport dimensions');
  assert.equal(sizes.length,4);

  engine.simulation.active=false;
  engine.container.clientWidth=1024;
  engine.container.clientHeight=768;
  engine.resize();
  assert.equal(camera.aspect,1024/768);
  assert.ok(camera.position.equals(originalPosition));
  assert.ok(controls.target.equals(originalTarget));

  engine.container.clientWidth=0;
  engine.resize();
  assert.equal(sizes.length,5,'zero-width viewport must not allocate render targets');
 });
}
