import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {SheetingMachineTemplate,SHEETING_VISUAL_REFERENCE} from '../frontend/src/sheeting.js';
import {SheetingProcessSimulation,SHEETING_SIMULATION_STAGES} from '../frontend/src/simulation-sheeting.js';
import {SHEETING_TAXONOMY} from '../frontend/src/data/taxonomy-sheeting.js';
import {SHEETING_TECHNICAL_SOURCES,SHEETING_ORIENTATION} from '../frontend/src/data/sources-sheeting.js';

test('Sheeting identity preserves BMJ HSM-CTM7 data without promoting HSM 56 to exact variant',()=>{
  assert.equal(SHEETING_VISUAL_REFERENCE.plantModel,'HSM-CTM7');
  assert.equal(SHEETING_VISUAL_REFERENCE.referenceFamily,'LEXUS HSM 56');
  assert.equal(SHEETING_VISUAL_REFERENCE.processDirection,'RIGHT_TO_LEFT');
  assert.equal(SHEETING_ORIENTATION.input,'RIGHT');
  assert.equal(SHEETING_ORIENTATION.output,'LEFT');
  assert.ok(SHEETING_TECHNICAL_SOURCES.some(s=>s.id==='SHEETING-BMJ-DATABASE'&&s.confidence==='VERIFIED'));
  assert.ok(SHEETING_TECHNICAL_SOURCES.some(s=>s.id==='SHEETING-HSM56-BW'&&/FAMILY/i.test(s.type)));
  assert.ok(SHEETING_TECHNICAL_SOURCES.some(s=>s.id==='SHEETING-LEXUS-INDONESIA'));
  assert.ok(SHEETING_TECHNICAL_SOURCES.some(s=>s.id==='SHEETING-GREATWALL-SYNCHRO-VISUAL'));
  assert.ok(SHEETING_TECHNICAL_SOURCES.some(s=>s.id==='SHEETING-HSM56-NEAR-SERIAL'&&/00962/.test(s.note)));
  assert.match(SHEETING_ORIENTATION.cutterArchitecture,/UNRESOLVED|CONFLICT/i);
});

test('Sheeting geometry follows confirmed right-to-left process order',()=>{
  const model=new SheetingMachineTemplate();
  const roll=model.findNode('sheeting-rollstand'),feed=model.findNode('sheeting-feed'),cutter=model.findNode('sheeting-cutter'),delivery=model.findNode('sheeting-delivery'),layboy=model.findNode('sheeting-layboy');
  assert.ok(roll&&feed&&cutter&&delivery&&layboy);
  const wx=o=>o.getWorldPosition(new THREE.Vector3()).x;
  model.root.updateMatrixWorld(true);
  assert.ok(wx(roll)>wx(feed));
  assert.ok(wx(feed)>wx(cutter));
  assert.ok(wx(cutter)>wx(delivery));
  assert.ok(wx(delivery)>wx(layboy));
  assert.equal(model.root.userData.processFlow.direction,'RIGHT_TO_LEFT');
  model.dispose();
});

test('Sheeting dedicated geometry is finite, grounded and includes HSM visual anchors',()=>{
  const model=new SheetingMachineTemplate(),box=new THREE.Box3().setFromObject(model.root);
  assert.ok(!box.isEmpty());
  for(const v of [...box.min.toArray(),...box.max.toArray()])assert.ok(Number.isFinite(v));
  assert.ok(box.min.y>=-0.01,'machine geometry must remain on the floor');
  for(const id of ['sheeting-rollstand','sheeting-feed','sheeting-cutter','sheeting-knife','sheeting-cutter-transport','sheeting-delivery','sheeting-layboy','sheeting-control','sheeting-access'])assert.ok(model.findNode(id),id);
  assert.ok(model.activeMeshes.length>=20,'reel, feed, knife and delivery mechanisms should be animated');
  model.dispose();
});

test('V59 Sheeting silhouette uses double shaftless unwind, open feed bridge and compact cutter head',()=>{
  const model=new SheetingMachineTemplate();
  const roll=model.findNode('sheeting-rollstand'),feed=model.findNode('sheeting-feed'),cutter=model.findNode('sheeting-cutter'),delivery=model.findNode('sheeting-delivery'),overlap=model.findNode('sheeting-overlap');
  assert.ok(roll&&feed&&cutter&&delivery&&overlap);
  const reels=model.activeMeshes.filter(m=>m.userData.motion==='reel');
  const chucks=model.activeMeshes.filter(m=>m.userData.motion==='chuck');
  assert.equal(reels.length,2,'double unwind reference should show two reel positions');
  assert.ok(chucks.length>=4,'shaftless unwind should use opposed short chucks');
  const cutterBox=new THREE.Box3().setFromObject(cutter),feedBox=new THREE.Box3().setFromObject(feed),deliveryBox=new THREE.Box3().setFromObject(delivery);
  assert.ok((cutterBox.max.x-cutterBox.min.x)<3.0,'cutter head must remain compact, not the former oversized box');
  assert.ok((feedBox.max.y-feedBox.min.y)>1.8,'feed bridge must be visibly elevated/open');
  assert.ok((deliveryBox.max.x-deliveryBox.min.x)>5.5,'delivery/overlap section should be long and open');
  assert.equal(model.root.userData.processFlow.cutterArchitecture,'EXACT_HSM_CTM7_UNRESOLVED_PUBLIC_SOURCES_CONFLICT');
  model.dispose();
});

test('Sheeting taxonomy is contiguous through six levels and maps to physical nodes',()=>{
  assert.deepEqual([...new Set(SHEETING_TAXONOMY.map(n=>n.level))].sort(),[1,2,3,4,5,6]);
  assert.equal(new Set(SHEETING_TAXONOMY.map(n=>n.id)).size,SHEETING_TAXONOMY.length);
  const model=new SheetingMachineTemplate();
  for(const node of SHEETING_TAXONOMY){
    if(node.level>1)assert.ok(SHEETING_TAXONOMY.some(p=>p.id===node.parentId),node.id);
    assert.ok((node.meshRefs||[]).some(ref=>model.findNode(ref))||node.id==='SH',node.id+' has no mapped geometry');
  }
  model.dispose();
});

test('Sheeting cutaway hides exterior covers but retains process mechanisms',()=>{
  const model=new SheetingMachineTemplate();
  const covers=model.meshes.filter(m=>m.userData.exteriorCover);
  assert.ok(covers.length>8);
  model.setExteriorOpen(true);
  assert.ok(covers.every(m=>m.visible===false));
  assert.ok(model.activeMeshes.some(m=>m.visible===true));
  assert.equal(model.findNode('sheeting-knife').visible,true);
  model.setExteriorOpen(false);
  assert.ok(covers.every(m=>m.visible===true));
  model.dispose();
});

test('Sheeting simulation keeps web continuous before the knife and creates sheets only after cutting',()=>{
  const model=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(model.root,model);
  assert.deepEqual(SHEETING_SIMULATION_STAGES,['Double Shaftless Unwind','Open Feed / Tension / EPC','Cross-Cut Cutter','Overlap / Sheet Transport','Layboy / Stacker']);
  const lift=model.activeMeshes.find(m=>m.userData.motion==='lift-table');
  assert.ok(lift,'layboy lift table must be animated');
  const liftRest=lift.position.y;
  sim.start();
  let now=1000;sim.update(now);
  for(let i=0;i<150;i++){now+=50;sim.update(now);}
  const state=sim.state();
  assert.equal(state.active,true);
  assert.ok(state.cutCount>state.completed,'cut count should lead stack completion because sheets need travel time');
  assert.ok(state.completed>=1);
  assert.ok(state.pileSheetsVisible>=1);
  assert.ok(state.sheetsVisible>0);
  assert.ok(state.webFlowMarksVisible>0);
  const sheetPositions=sim.sheets.filter(s=>s.visible).map(s=>s.position.x);
  assert.ok(sheetPositions.every(x=>x<=.72),'individual sheets must exist only downstream of the compact cutter');
  const webPositions=sim.webFlowMarks.filter(s=>s.visible).map(s=>s.position.x);
  assert.ok(webPositions.every(x=>x>=.90),'continuous-web motion markers must stay upstream of the cutter');
  assert.ok(lift.position.y<liftRest,'lift table must lower as the pile grows to preserve receiving height');
  sim.stop();assert.equal(sim.state().active,false);
  assert.equal(lift.position.y,liftRest,'stopping simulation must restore the lift table');
  sim.dispose();model.dispose();
});

test('Sheeting low-detail and reset preserve dedicated geometry state',()=>{
  const model=new SheetingMachineTemplate(),cutter=model.findNode('sheeting-cutter'),knife=model.findNode('sheeting-knife');
  const rest=cutter.position.clone(),knifeRest=knife.position.clone();
  model.setLow(true);assert.ok(model.detailMeshes.every(m=>!m.visible));
  model.setLow(false);assert.ok(model.detailMeshes.every(m=>m.visible));
  model.explode(.8,cutter);assert.deepEqual(cutter.position.toArray(),rest.toArray());assert.notDeepEqual(knife.position.toArray(),knifeRest.toArray());
  model.reset();assert.deepEqual(cutter.position.toArray(),rest.toArray());assert.deepEqual(knife.position.toArray(),knifeRest.toArray());
  model.dispose();
});
