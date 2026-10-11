import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Polar115MachineTemplate} from '../frontend/src/polar115.js';
import {Polar115ProcessSimulation} from '../frontend/src/simulation-polar115.js';

test('POLAR stock stays supported, clears the side-table stop and meets the backgauge',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);s.start();
 const mainDeck=m.findNode('polar-feed-center').children.find(o=>o.isMesh&&o.material.userData.surfaceKind==='tableDark');
 const sideStop=m.findNode('polar-feed-right').children.find(o=>o.isMesh&&o.userData.evidence==='IMG_2489_FRONT_RIGHT_AIR_TABLE_BACKSTOP');
 m.root.updateMatrixWorld(true);
 const tableTop=new THREE.Box3().setFromObject(mainDeck).max.y;
 let now=1000;s.update(now);let minBottom=Infinity,minStopGap=Infinity,registered=false;
 for(let i=0;i<580;i++){
  now+=10;s.update(now);m.root.updateMatrixWorld(true);
  const stockBox=new THREE.Box3().setFromObject(s.stock),stopBox=new THREE.Box3().setFromObject(sideStop);
  minBottom=Math.min(minBottom,stockBox.min.y);
  const separatedX=stockBox.max.x<stopBox.min.x||stockBox.min.x>stopBox.max.x;
  const separatedZ=stockBox.max.z<stopBox.min.z||stockBox.min.z>stopBox.max.z;
  assert.ok(separatedX||separatedZ,'stock intersects the installed side-table stop during transfer');
  const dx=Math.max(stopBox.min.x-stockBox.max.x,stockBox.min.x-stopBox.max.x,0),dz=Math.max(stopBox.min.z-stockBox.max.z,stockBox.min.z-stopBox.max.z,0);
  minStopGap=Math.min(minStopGap,Math.hypot(dx,dz));
  if(s.phase()>=.32&&s.phase()<.56){
   assert.ok(Math.abs(s.state().registrationGap-s.registrationClearance)<1e-9);
   assert.equal(s.state().backgaugeContact,true);registered=true;
  }
 }
 assert.ok(minBottom>=tableTop+s.stockSurfaceClearance-1e-6,'stock sinks into the main cutting table');
 assert.ok(minStopGap>0,'stock has no positive clearance from side-table stop');
 assert.ok(registered,'backgauge never registers the stock before clamp phase');
 assert.equal(s.stockStartCenterZ,-.72,'loading position must remain forward of the side-table stop');
 s.dispose();m.dispose();
});

test('POLAR air float is unilateral and reset restores contact-safe registration geometry',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);s.start();let now=1000;s.update(now);
 let minY=Infinity,maxY=-Infinity;
 for(let i=0;i<300;i++){now+=10;s.update(now);minY=Math.min(minY,s.stock.position.y);maxY=Math.max(maxY,s.stock.position.y);}
 assert.ok(minY>=s.stockRestY-1e-9,'air animation drives stock through the table');
 assert.ok(maxY<=s.stockRestY+.006+1e-9,'air animation exceeds its declared visual lift');
 s.stop();assert.equal(s.stock.position.y,s.stockRestY);assert.equal(s.stock.position.z,s.stockStartCenterZ);assert.equal(s.gauge.position.z,s.rest.gauge.z);
 s.dispose();m.dispose();
});
