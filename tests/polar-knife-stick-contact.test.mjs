import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Polar115MachineTemplate} from '../frontend/src/polar115.js';
import {Polar115ProcessSimulation} from '../frontend/src/simulation-polar115.js';

test('POLAR cutting stick is flush with the table and remains stationary during a cut',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);m.root.updateMatrixWorld(true);
 const stickBox=new THREE.Box3().setFromObject(s.knifeStick),stockBottom=s.stockRestY-s.stockThickness/2;
 assert.ok(Math.abs(stickBox.max.y-s.tableSurfaceY)<1e-9,'cutting stick projects above the table');
 assert.ok(stockBottom>=stickBox.max.y+s.stockSurfaceClearance-1e-9,'paper pile intersects the cutting stick');
 const assemblyRest=s.knifeAssembly.position.clone(),stickRest=s.knifeStick.position.clone(),driveRest=s.knifeDrive.position.clone(),sensorRest=s.knifeTopSense.position.clone();
 s.start();let now=1000,sawCut=false,minGap=Infinity;s.update(now);
 for(let i=0;i<760;i++){
  now+=10;s.update(now);minGap=Math.min(minGap,s.knifeGap);
  assert.ok(s.knifeAssembly.position.distanceTo(assemblyRest)<1e-10,'whole knife assembly moves');
  assert.ok(s.knifeStick.position.distanceTo(stickRest)<1e-10,'cutting stick follows the blade');
  assert.ok(s.knifeDrive.position.distanceTo(driveRest)<1e-10,'drive interface follows the blade');
  assert.ok(s.knifeTopSense.position.distanceTo(sensorRest)<1e-10,'top sensor follows the blade');
  if(s.knifeAtCutLine){sawCut=true;assert.ok(s.knifeGap<=s.knifeContactTolerance+1e-9);}
 }
 assert.ok(sawCut);assert.ok(minGap>=-1e-9,'blade penetrates through the represented cutting-stick surface');
 assert.ok(Math.abs(s.knifeStroke-(s.bladeTrailingBottomRest-s.knifeStickTop))<1e-12);
 s.dispose();m.dispose();
});

test('POLAR blade and carrier share one stroke and clear the clamped pile',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);s.start();let now=1000,maxDrop=0;s.update(now);
 for(let i=0;i<650;i++){
  now+=10;s.update(now);const bladeDrop=s.rest.knife.y-s.knife.position.y,carrierDrop=s.rest.knifeCarrier.y-s.knifeCarrier.position.y;
  assert.ok(Math.abs(bladeDrop-carrierDrop)<1e-10,'carrier and blade stroke are not synchronized');maxDrop=Math.max(maxDrop,bladeDrop);
  if(s.knifeAtCutLine){m.root.updateMatrixWorld(true);const carrier=new THREE.Box3().setFromObject(s.knifeCarrier),stock=new THREE.Box3().setFromObject(s.stock);assert.ok(carrier.min.y>=stock.max.y+.001,'carrier collides with the pile');}
 }
 assert.ok(maxDrop>.35);
 for(const low of [false,true])for(const interior of [false,true]){m.setExteriorOpen(interior);m.setLow(low);assert.equal(s.knife.children.some(x=>x.isMesh&&x.visible),true);assert.equal(s.knifeStick.children.some(x=>x.isMesh&&x.visible),true);}
 s.stop();assert.ok(s.knife.position.distanceTo(s.rest.knife)<1e-10);assert.ok(s.knifeCarrier.position.distanceTo(s.rest.knifeCarrier)<1e-10);
 s.dispose();m.dispose();
});
