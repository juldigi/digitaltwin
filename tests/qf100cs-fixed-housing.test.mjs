import test from 'node:test';
import assert from 'node:assert/strict';
import {createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

test('QF hydraulic housing stays fixed while rod and pressure plate stroke and reset',()=>{
 const m=createMachineTemplate('BMJ-MCH-0021'),s=createMachineSimulation('BMJ-MCH-0021',m.root,m);
 try{
  const role=r=>m.meshes.find(x=>x.userData.mechanismRole===r);
  const housing=role('main-hydraulic-cylinder-reference'),rod=role('hydraulic-ram-reference'),plate=role('blanking-pressure-plate');
  const h= housing.position.clone(),r=rod.position.clone(),p=plate.position.clone();
  s.start();s.elapsed=s.cycle*.65;s.updateBlanker();
  assert.ok(housing.position.distanceTo(h)<1e-12);
  assert.ok(rod.position.y<r.y);assert.ok(plate.position.y<p.y);
  assert.ok(Math.abs((r.y-rod.position.y)-(p.y-plate.position.y))<1e-12);
  s.pause();const held=plate.position.clone();s.update(100000);assert.ok(plate.position.distanceTo(held)<1e-12);
  s.stop();assert.ok(rod.position.distanceTo(r)<1e-12);assert.ok(plate.position.distanceTo(p)<1e-12);
  s.start();assert.ok(plate.position.distanceTo(p)<1e-12);
 }finally{s.dispose();m.dispose();}
});
