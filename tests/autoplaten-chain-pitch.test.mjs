import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {MK920MachineTemplate} from '../frontend/src/mk920.js';
import {MK920StampingSimulation} from '../frontend/src/simulation-mk920.js';
import {MK1060MachineTemplate} from '../frontend/src/mk1060.js';
import {MK1060ProcessSimulation} from '../frontend/src/simulation-mk1060.js';
import {Promatrix106MachineTemplate} from '../frontend/src/promatrix106.js';
import {Promatrix106ProcessSimulation} from '../frontend/src/simulation-promatrix106.js';

for(const [label,Model,Simulation,args] of [
 ['APM-5/6 MK 920',MK920MachineTemplate,MK920StampingSimulation,[]],
 ['APM-7 MK 1060',MK1060MachineTemplate,MK1060ProcessSimulation,[]],
 ['APM-8/9 Promatrix 106',Promatrix106MachineTemplate,Promatrix106ProcessSimulation,[]]
])test(`${label}: each process cycle indexes grippers by one bar pitch and restart clears output`,()=>{
 const model=new Model(...args),sim=new Simulation(model.root,model);
 assert.ok(sim.gripperBars.length>1);
 sim.updateGrippers(0);
 const first=sim.gripperBars.map(b=>b.position.clone());
 sim.updateGrippers(1);
 for(let i=0;i<first.length;i++){
  const next=first[(i+1)%first.length];
  assert.ok(sim.gripperBars[i].position.distanceTo(next)<1e-9,`bar ${i} should advance exactly one pitch`);
 }
 sim.start();
 for(const p of sim.stack||sim.blankStack||sim.productStack)p.visible=true;
 for(const p of sim.wastePieces||sim.waste||[])p.visible=true;
 for(const p of sim.tieSheets||[])p.visible=true;
 sim.start();
 assert.equal(sim.state().pileSheetsVisible,0);
 assert.equal(sim.state().wastePiecesVisible||0,0);
 assert.equal(sim.state().tieSheetsVisible||0,0);
 sim.dispose();model.dispose();
});

for(const [label,Model,feederId,internalIds] of [
 ['MK 920',MK920MachineTemplate,'mk920-feeder',['mk920-feeder-pile','mk920-feeder-head']],
 ['MK 1060',MK1060MachineTemplate,'mk1060-feeder',['mk1060-feeder-pile','mk1060-feeder-head']],
 ['Promatrix 106',Promatrix106MachineTemplate,'pm106-feeder',['pm106-feeder-pile','pm106-feeder-head']]
])test(`${label}: feeder shell clears the pile and suction head`,()=>{
 const model=new Model(),feeder=model.findNode(feederId),covers=[];
 feeder.traverse(o=>{if(o.isMesh&&o.userData.exteriorCover)covers.push(new THREE.Box3().setFromObject(o));});
 assert.ok(covers.length>=6,'feeder retains a supported exterior frame');
 for(const id of internalIds){const box=new THREE.Box3().setFromObject(model.findNode(id));
  assert.ok(covers.every(cover=>!cover.intersectsBox(box)),`${id} intersects the exterior cover`);
 }
 model.dispose();
});
