import test from 'node:test';
import assert from 'node:assert/strict';
import {APM2MachineTemplate} from '../frontend/src/apm2.js';
import {MK920MachineTemplate} from '../frontend/src/mk920.js';
import {MK1060MachineTemplate} from '../frontend/src/mk1060.js';
import {Promatrix106MachineTemplate} from '../frontend/src/promatrix106.js';
import {MK920StampingSimulation} from '../frontend/src/simulation-mk920.js';
import {MK1060ProcessSimulation} from '../frontend/src/simulation-mk1060.js';
import {Promatrix106ProcessSimulation} from '../frontend/src/simulation-promatrix106.js';

for(const [id,Model,Simulation,processedKey,stackKey,seconds] of [
 ['BMJ-MCH-0011',MK920MachineTemplate,MK920StampingSimulation,'foil','stack',10],
 ['BMJ-MCH-0013',MK1060MachineTemplate,MK1060ProcessSimulation,'cutMarks','blankStack',11.5],
 ['BMJ-MCH-0014',Promatrix106MachineTemplate,Promatrix106ProcessSimulation,'blanks','productStack',10.8]
])test(`${id} feeds sequential blanks, marks the processed sheet, and deposits only at delivery`,()=>{
 const model=new Model(id),sim=new Simulation(model.root,model);
 try{
  sim.start();assert.equal(sim.state().sheetsVisible,0);assert.equal(sim.state().pileSheetsVisible,0);
  let now=1000;sim.update(now);sim.update(now+=20);
  assert.equal(sim.state().sheetsVisible,1,'only the first blank may enter from the feeder');
  assert.equal(sim.sheets[0][processedKey].visible,false,'the input blank has not passed the process station');
  assert.equal(sim.state().completed,0);
  while(sim.elapsed<seconds*.55){now+=20;sim.update(now);}
  assert.ok(sim.sheets[0][processedKey].visible,'the first sheet carries a model-specific process mark');
  assert.equal(sim.state().pileSheetsVisible,0,'delivery stays empty while the first sheet remains upstream');
  while(sim.elapsed<seconds+0.1){now+=20;sim.update(now);}
  assert.ok(sim.state().completed>=1);
  assert.ok(sim[stackKey].some(sheet=>sheet.visible));
  sim.stop();assert.equal(sim.state().pileSheetsVisible,0);
 }finally{sim.dispose();model.dispose();}
});

test('BMJ autoplaten identity plates preserve the actual asset, model and serial',()=>{
 for(const [Model,id,serial] of [
  [APM2MachineTemplate,'BMJ-MCH-0010','57115506'],
  [MK920MachineTemplate,'BMJ-MCH-0011','20110509330'],
  [MK920MachineTemplate,'BMJ-MCH-0012','20130529398A'],
  [MK1060MachineTemplate,'BMJ-MCH-0013','20130830062'],
  [Promatrix106MachineTemplate,'BMJ-MCH-0014','MP.DBE0-00100'],
  [Promatrix106MachineTemplate,'BMJ-MCH-0015','MP.DBE0-00115']
 ]){
  const model=new Model(id),plates=[];model.root.traverse(node=>{if(node.userData.identityPlacard)plates.push(node.userData.identityPlacard)});
  assert.equal(plates.length,1,id);assert.equal(plates[0].serial,serial,id);assert.equal(plates[0].source,'BMJ_ASSET_REGISTRY');model.dispose();
 }
});
