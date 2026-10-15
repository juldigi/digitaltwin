import test from 'node:test';
import assert from 'node:assert/strict';
import {OffsetMachineTemplate} from '../frontend/src/offset5.js';
import {PrintingSimulation} from '../frontend/src/simulation.js';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

function checkPartialSheet(sheet,sim){
  const {start,count}=sheet.mesh.geometry.drawRange;
  const total=sim.sheetLengthSegments*sim.sheetWidthSegments*6;
  assert.equal(sheet.mesh.visible,true,'sheet should be visible as soon as its leading edge enters the path');
  assert.ok(start>0&&count>0&&start+count===total,'only fed rows should be rendered during pickup');
  assert.ok(sheet.userData.leadDistance>0&&sheet.userData.leadDistance<sim.sheetLength);
  const row=Math.floor(start/(sim.sheetWidthSegments*6));
  const leadIndex=sheet.mesh.geometry.index.getX(start);
  assert.equal(leadIndex,row*(sim.sheetWidthSegments+1),'clipped geometry must start at a full grid row');
}

test('OFFSET 5: the first sheet enters visibly without drawing the un-fed tail',()=>{
  const template=new OffsetMachineTemplate(),sim=new PrintingSimulation(template.root,template);
  try{
    sim.start();
    sim.update(0);
    assert.equal(sim.sheets[0].mesh.visible,false);
    sim.update(16);
    checkPartialSheet(sim.sheets[0],sim);
    assert.equal(sim.sheets[1].mesh.visible,false,'next sheet must not appear before its own pitch');

    // After a full sheet length, the first sheet is not clipped; the
    // second one appears as a partial sheet after one nominal pitch.
    // The engine caps frame deltas at 50 ms; advance in actual animation frames.
    for(let ms=32;ms<=320;ms+=16)sim.update(ms);
    const full=sim.sheets[0].mesh.geometry.drawRange;
    assert.equal(full.start,0);
    assert.equal(full.count,sim.sheetLengthSegments*sim.sheetWidthSegments*6);
    checkPartialSheet(sim.sheets[1],sim);
    assert.equal(sim.state().sheetsVisible,2);
    sim.stop();
    assert.equal(sim.sheets[0].mesh.visible,false);
    sim.start();sim.update(500);sim.update(516);
    checkPartialSheet(sim.sheets[0],sim);
  }finally{sim.dispose();template.dispose();}
});

test('OFFSET 5 realism: photo-grounded press keeps the same feeder entry and hidden gripper proxy',()=>{
  const template=createPolishedMachineTemplate('offset5');
  const sim=createMachineSimulation('offset5',template.root,template);
  try{
    sim.start();sim.update(0);sim.update(16);
    checkPartialSheet(sim.sheets[0],sim);
    assert.equal(sim.sheets[0].gripper.visible,false,'do not reintroduce the fake full-width gripper bar');
    assert.equal(template.exteriorOpen,false,'simulation must not open the press interior');
    assert.equal(sim.sheetLength,.72,'locked process reference sheet length remains unchanged');
  }finally{sim.dispose();template.dispose();}
});
