import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Polar115MachineTemplate} from '../frontend/src/polar115.js';
import {Polar115ProcessSimulation} from '../frontend/src/simulation-polar115.js';

const advance=(s,now,steps)=>{for(let i=0;i<steps;i++){now+=10;s.update(now);}return now;};

test('POLAR photographed safety arms remain mounted and guessed actuator locations stay suppressed',()=>{
 const m=new Polar115MachineTemplate();m.root.updateMatrixWorld(true);
 const guessed=m.meshes.filter(x=>x.userData.suppressedUnverifiedInstalledLocation),twohand=m.findNode('polar-safety-twohand');
 assert.equal(guessed.length,4);assert.equal(twohand.userData.installedActuatorLocationVerified,false);
 for(const id of ['polar-safety-left-arm','polar-safety-right-arm']){
  const arm=m.findNode(id),armBox=new THREE.Box3().setFromObject(arm);
  const shoe=m.meshes.find(x=>x.userData.mechanismRole==='polar-front-safety-arm-mount'&&new THREE.Box3().setFromObject(x).intersectsBox(armBox));
  assert.ok(shoe,`${id} floats without its photographed mounting shoe`);
 }
 for(const low of [false,true])for(const interior of [false,true]){m.setExteriorOpen(interior);m.setLow(low);for(const x of guessed)assert.equal(x.visible,false,'unverified duplicate button became visible');}
 m.dispose();
});

test('POLAR two-hand simultaneity and anti-repeat require independent release and repress',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);s.start();let now=1000;s.update(now);
 s.setTwoHandInputs(true,false,0);s.setTwoHandInputs(true,true,.7);now=advance(s,now,900);
 assert.equal(s.completed,0,'commands outside the 500 ms simultaneity window caused a cut');
 s.setTwoHandInputs(false,false,s.elapsed);now=advance(s,now,2);s.setTwoHandInputs(true,false,s.elapsed);s.setTwoHandInputs(true,true,s.elapsed+.2);
 now=advance(s,now,900);assert.equal(s.completed,1,'valid simultaneous command did not cause one cut');
 now=advance(s,now,900);assert.equal(s.completed,1,'held buttons repeated a cut without release');
 s.setTwoHandInputs(false,false,s.elapsed);now=advance(s,now,2);s.setTwoHandInputs(true,false,s.elapsed);s.setTwoHandInputs(true,true,s.elapsed+.2);
 now=advance(s,now,900);assert.equal(s.completed,2,'release and valid repress did not re-arm one subsequent cut');
 s.dispose();m.dispose();
});

test('POLAR releasing either hand during downstroke retracts uncommitted knife and clamp',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);s.start();let now=1000;s.update(now);
 s.setTwoHandInputs(true,false,0);s.setTwoHandInputs(true,true,.2);
 while(s.phase()<.59){now+=10;s.update(now);}
 assert.ok(s.knifeHoldAmount>0&&!s.cutPerformed);s.setTwoHandInputs(true,false,s.elapsed);now=advance(s,now,1);
 assert.equal(s.knifeHoldAmount,0);assert.equal(s.clampHoldAmount,0);assert.equal(s.cutPerformed,false);assert.equal(s.state().blocked,true);
 s.dispose();m.dispose();
});
