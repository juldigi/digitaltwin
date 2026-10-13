import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Promatrix106MachineTemplate} from '../frontend/src/promatrix106.js';
import {Promatrix106ProcessSimulation,PROMATRIX106_SIMULATION_STAGES} from '../frontend/src/simulation-promatrix106.js';
import {PROMATRIX106_SPEC,PROMATRIX106_SPEC_APM9} from '../frontend/src/data/dimensions-promatrix106.js';
import {promatrix106TaxonomyFor} from '../frontend/src/data/taxonomy-promatrix106.js';
import {PROMATRIX106_TECHNICAL_SOURCES} from '../frontend/src/data/sources-promatrix106.js';

test('Promatrix waste is collected under stripping before the first product reaches delivery',()=>{
 const model=new Promatrix106MachineTemplate(),sim=new Promatrix106ProcessSimulation(model.root,model);
 try{
  const collection=model.findNode('pm106-strip-waste-reference');
  assert.equal(collection.userData.installedGeometryVerified,false);
  sim.start();let now=1000;sim.update(now);
  while(sim.elapsed<7.5){now+=20;sim.update(now);}
  assert.ok(sim.wasteCompleted>0);
  assert.equal(sim.completed,0);
  const piece=sim.waste.find(p=>p.visible),support=sim.wasteSupport;
  assert.ok(piece&&support);
  const bounds=new THREE.Box3().setFromObject(support),position=piece.getWorldPosition(new THREE.Vector3());
  assert.ok(Math.abs(position.y-.006-bounds.max.y)<.002,'stripping waste rests in its collection tray');
  assert.ok(position.x>=bounds.min.x&&position.x<=bounds.max.x);
  assert.ok(position.z>=bounds.min.z&&position.z<=bounds.max.z);
  sim.stop();assert.equal(sim.wasteCompleted,0);assert.equal(sim.waste.some(p=>p.visible),false);
 }finally{sim.dispose();model.dispose();}
});

test('Promatrix tie sheets sit between product layers without intersecting the next blank',()=>{
 const model=new Promatrix106MachineTemplate(),sim=new Promatrix106ProcessSimulation(model.root,model);
 try{
  sim.start();for(let i=0;i<13;i++)sim.outputSheet();
  for(const index of [5,11]){
   const lower=new THREE.Box3().setFromObject(sim.productStack[index]);
   const tie=new THREE.Box3().setFromObject(sim.tieSheets[index]);
   const upper=new THREE.Box3().setFromObject(sim.productStack[index+1]);
   assert.ok(sim.tieSheets[index].visible);
   assert.ok(tie.min.y>=lower.max.y-1e-6);
   assert.ok(upper.min.y>=tie.max.y-1e-6);
  }
 }finally{sim.dispose();model.dispose();}
});

test('Promatrix cover windows and spine fittings leave with the exterior in cutaway',()=>{
 for(const id of ['BMJ-MCH-0014','BMJ-MCH-0015']){
  const model=new Promatrix106MachineTemplate(id);
  try{
   const windows=model.meshes.filter(m=>m.userData.mechanismRole==='promatrix-process-window-reference');
   const display=model.meshes.find(m=>m.userData.mechanismRole==='promatrix-integrated-display-reference');
   const plate=model.meshes.find(m=>m.userData.identityPlacard);
   assert.equal(windows.length,6);assert.ok(display&&plate);
   model.setLow(true);model.setExteriorOpen(true);
   assert.ok([...windows,display,plate].every(m=>!m.visible));
   model.setLow(false);model.setExteriorOpen(false);
   assert.ok([...windows,display,plate].every(m=>m.visible));
  }finally{model.dispose();}
 }
});

test('Promatrix 106 CSB keeps both BMJ identities and OEM generation boundaries explicit',()=>{
 assert.equal(PROMATRIX106_SPEC.assetId,'BMJ-MCH-0014');assert.equal(PROMATRIX106_SPEC.serial,'MP.DBE0-00100');assert.equal(PROMATRIX106_SPEC_APM9.assetId,'BMJ-MCH-0015');assert.equal(PROMATRIX106_SPEC_APM9.serial,'MP.DBE0-00115');
 assert.deepEqual(PROMATRIX106_SPEC.sheetMax,[.760,1.060]);assert.equal(PROMATRIX106_SPEC.cuttingPressureMN,2.6);assert.equal(PROMATRIX106_SPEC.cuttingPressureTonnes,260);
 assert.equal(PROMATRIX106_SPEC.oemGripperBarCount,7);assert.equal(PROMATRIX106_SPEC.registeredGripperStopVerified,true);
 assert.equal(PROMATRIX106_SPEC.publishedMaxSpeed,8000);assert.equal(PROMATRIX106_SPEC.brochure2020CSBMaxSpeed,7500);
 assert.ok(PROMATRIX106_TECHNICAL_SOURCES.some(s=>s.authority==='primary'));assert.ok(PROMATRIX106_TECHNICAL_SOURCES.some(s=>s.id==='PROMATRIX-EVIDENCE-BOUNDARY'));
});

test('both BMJ Promatrix assets instantiate the CSB station train with OEM-bounded metadata',()=>{
 for(const assetId of ['BMJ-MCH-0014','BMJ-MCH-0015']){const model=new Promatrix106MachineTemplate(assetId),box=new THREE.Box3().setFromObject(model.root);assert.equal(model.root.userData.assetId,assetId);assert.equal(model.root.userData.engineeringDimensions,false);assert.match(model.root.userData.geometryStatus,/OEM_PROCESS_REFERENCE/);assert.ok(!box.isEmpty());assert.ok(box.min.y>=-0.01);
  for(const id of ['pm106-feeder','pm106-feedtable','pm106-transport','pm106-cutting','pm106-stripping','pm106-blanking','pm106-delivery','pm106-drive','pm106-access'])assert.ok(model.findNode(id),id);
  model.setExteriorOpen(true);assert.ok(model.root.userData.exteriorHiddenCount>=8);model.dispose();}
});

test('Promatrix uses exactly seven moving gripper bars and only functional rotor roles',()=>{
 const model=new Promatrix106MachineTemplate(),sim=new Promatrix106ProcessSimulation(model.root,model),allowed=/^(pile-lift|feed-brush|chain-sprocket|pressure-eccentric|pallet-lift|main-motor|flywheel)$/;
 assert.equal(sim.gripperBars.length,7);assert.equal(sim.rotors.length,17);assert.equal(sim.rotors.some(r=>!allowed.test(r.userData.mechanismRole||'')),false);
 assert.equal(model.meshes.some(m=>m.userData.rotor&&['suction-cup','pneumatic-lock','strip-pin','vacuum-port','air-regulator','button'].includes(m.userData.mechanismRole)),false);
 assert.equal(sim.suckers.length,4);sim.dispose();model.dispose();
});

test('Promatrix registered gripper transport freezes through cutting dwell and resumes on index',()=>{
 const model=new Promatrix106MachineTemplate(),sim=new Promatrix106ProcessSimulation(model.root,model);sim.start();let now=1000;const advanceTo=t=>{while(sim.elapsed<t){now+=20;sim.update(now);}};
 advanceTo(4.20);let state=sim.state();assert.equal(state.cuttingActive,true);assert.equal(state.transportStopped,true);assert.equal(state.interlocks.cutRequiresRegisteredStop,true);
 const sheets=sim.sheets.map(s=>s.mesh.position.clone()),bars=sim.gripperBars.map(b=>b.position.clone());
 advanceTo(4.65);assert.equal(sim.sheets.every((s,i)=>s.mesh.position.distanceTo(sheets[i])<1e-10),true);assert.equal(sim.gripperBars.every((b,i)=>b.position.distanceTo(bars[i])<1e-10),true);
 advanceTo(5.65);state=sim.state();assert.equal(state.transportIndexing,true);assert.ok(sim.sheets.some((s,i)=>s.mesh.position.distanceTo(sheets[i])>.05));assert.ok(sim.gripperBars.some((b,i)=>b.position.distanceTo(bars[i])>.05));sim.dispose();model.dispose();
});

test('Promatrix stripping and blanking execute only at registered stops',()=>{
 const model=new Promatrix106MachineTemplate(),sim=new Promatrix106ProcessSimulation(model.root,model);sim.start();let now=1000;const advanceTo=t=>{while(sim.elapsed<t){now+=20;sim.update(now);}};
 advanceTo(6.70);let state=sim.state();assert.equal(state.strippingActive,true);assert.equal(state.transportStopped,true);assert.equal(state.interlocks.strippingRequiresRegisteredStop,true);
 advanceTo(9.05);state=sim.state();assert.equal(state.blankingActive,true);assert.equal(state.transportStopped,true);assert.equal(state.interlocks.blankingRequiresRegisteredStop,true);
 sim.dispose();model.dispose();
});

test('Promatrix CSB output includes product, waste, non-stop rake and explicitly demo-only tie sheets',()=>{
 const model=new Promatrix106MachineTemplate(),sim=new Promatrix106ProcessSimulation(model.root,model),rake0=sim.rake.position.clone();sim.start();let now=1000,seenRake=false,seenTie=false;
 for(let i=0;i<1500;i++){now+=20;sim.update(now);const s=sim.state();seenRake||=s.deliveryRakeActive;seenTie||=s.tieSheetActive;}
 const state=sim.state();assert.ok(sim.completed>=6);assert.ok(state.pileSheetsVisible>0);assert.ok(state.wastePiecesVisible>0);assert.ok(seenRake);assert.ok(seenTie);assert.equal(state.tieSheetDemoOnly,true);assert.ok(sim.tieSheets.some(t=>t.visible&&t.userData.demoTieSheet));
 sim.stop();assert.ok(sim.rake.position.distanceTo(rake0)<1e-10);assert.equal(sim.tieSheets.every(t=>!t.visible),true);sim.dispose();model.dispose();
});

test('Promatrix pause and resume do not jump the process clock',()=>{
 const model=new Promatrix106MachineTemplate(),sim=new Promatrix106ProcessSimulation(model.root,model);sim.start();sim.update(1000);sim.update(1200);const t=sim.elapsed;sim.pause();sim.update(20000);sim.resume();sim.update(30000);assert.equal(sim.elapsed,t);sim.update(30020);assert.ok(sim.elapsed-t<.03);sim.dispose();model.dispose();
});

test('Promatrix taxonomy is a six-level mapped tree for APM 8 and APM 9',()=>{
 for(const assetId of ['BMJ-MCH-0014','BMJ-MCH-0015']){const taxonomy=promatrix106TaxonomyFor(assetId);assert.deepEqual([...new Set(taxonomy.map(n=>n.level))].sort(),[1,2,3,4,5,6]);assert.equal(new Set(taxonomy.map(n=>n.id)).size,taxonomy.length);for(const n of taxonomy.filter(n=>n.level>1))assert.ok(taxonomy.some(p=>p.id===n.parentId),n.id);const model=new Promatrix106MachineTemplate(assetId);for(const n of taxonomy.filter(n=>n.verified&&n.meshRefs.length))assert.ok(model.resolveTaxonomyNode(n.id),n.id);model.dispose();}
});

test('Promatrix stage sequence makes index and dwell phases explicit',()=>{
 assert.deepEqual(PROMATRIX106_SIMULATION_STAGES,['Pemisahan tumpukan','Meja isap / register','Indeks gripper terdaftar ke pemotongan','Dwell tekanan pemotongan','Indeks menuju stripping','Proses stripping','Indeks menuju pemotongan pola','Pemotongan pola / demo lembar pemisah','Indeks menuju delivery','Delivery Auto-Non-Stop']);
});

test('Promatrix feeder cups descend vertically to the pile surface and reset',()=>{
 const model=new Promatrix106MachineTemplate('BMJ-MCH-0015'),sim=new Promatrix106ProcessSimulation(model.root,model),pile=model.findNode('pm106-feeder-pile'),cups=sim.suckers;
 assert.equal(cups.every(c=>c.userData.rotorAxis==='y'),true);model.root.updateMatrixWorld(true);
 const pileTop=new THREE.Box3().setFromObject(pile).max.y,rest=cups.map(c=>c.getWorldPosition(new THREE.Vector3()).y-.085);
 sim.start();let now=1000;sim.update(now);while(sim.elapsed<1.08){now+=10;sim.update(now);}model.root.updateMatrixWorld(true);
 const activeBottom=cups.map(c=>c.getWorldPosition(new THREE.Vector3()).y-.085);assert.ok(activeBottom.every(y=>Math.abs(y-pileTop)<.002));
 sim.stop();model.root.updateMatrixWorld(true);assert.equal(cups.every((c,i)=>Math.abs(c.getWorldPosition(new THREE.Vector3()).y-.085-rest[i])<1e-9),true);sim.dispose();model.dispose();
});

test('Promatrix cutting stripping and blanking strokes close represented contact surfaces',()=>{
 const model=new Promatrix106MachineTemplate('BMJ-MCH-0015'),sim=new Promatrix106ProcessSimulation(model.root,model);sim.start();let now=1000;sim.update(now);const advanceTo=t=>{while(sim.elapsed<t){now+=10;sim.update(now);}};
 advanceTo(4.20);assert.ok(Math.abs((sim.cutPlate.position.y-sim.rest.cut.y)-.2925)<.001);const cut=sim.sheets.find(s=>s.blanks.visible);assert.ok(cut);assert.ok(Math.abs(cut.mesh.position.y-sim.curve.getPointAt(.34).y-.1825)<.003);
 advanceTo(6.70);assert.ok(Math.abs((sim.rest.st.y-sim.stripTop.position.y)-.055)<.001);assert.ok(Math.abs((sim.stripMiddle.position.y-sim.rest.sm.y)-.035)<.001);assert.ok(Math.abs((sim.stripBottom.position.y-sim.rest.sb.y)-.235)<.001);
 advanceTo(9.05);assert.ok(Math.abs((sim.rest.bt.y-sim.blankTop.position.y)-.20)<.001);assert.ok(Math.abs((sim.blankBottom.position.y-sim.rest.bb.y)-.20)<.001);sim.dispose();model.dispose();
});

test('Promatrix cut and stripping output require their actual process dwells',()=>{
 const model=new Promatrix106MachineTemplate('BMJ-MCH-0015'),sim=new Promatrix106ProcessSimulation(model.root,model);sim.start();let now=1000;sim.update(now);const advanceTo=t=>{while(sim.elapsed<t){now+=10;sim.update(now);}};
 advanceTo(3.15);assert.equal(sim.sheets.some(s=>s.blanks.visible),false);assert.equal(sim.wasteCompleted,0);advanceTo(4.20);assert.equal(sim.sheets.some(s=>s.blanks.visible),true);advanceTo(5.95);assert.equal(sim.wasteCompleted,0);advanceTo(6.70);assert.ok(sim.wasteCompleted>0);
 sim.stop();assert.equal(sim.sheets.some(s=>s.blanks.visible||s.cutLap>=0||s.stripLap>=0),false);sim.dispose();model.dispose();
});

test('Promatrix navigation preserves selected descendants and material state is assembly-scoped',()=>{
 const model=new Promatrix106MachineTemplate('BMJ-MCH-0015'),feeder=model.findNode('pm106-feeder'),head=model.findNode('pm106-feeder-head'),delivery=model.findNode('pm106-delivery');
 model.showOnly([feeder],true);assert.equal(head.visible,true);assert.equal(delivery.visible,false);model.showOnly([],false);
 const a=model.meshes.find(m=>model.contains(head,m)),b=model.meshes.find(m=>!model.contains(head,m)&&m.material.color.getHex()===a.material.color.getHex());assert.ok(a&&b);assert.notEqual(a.material,b.material);model.highlight(head);assert.ok(a.material.emissive.getHex()>0);assert.equal(b.material.emissive.getHex(),0);model.dispose();
});

test('APM 9 simulation state preserves its installed asset identity',()=>{
 const model=new Promatrix106MachineTemplate('BMJ-MCH-0015'),sim=new Promatrix106ProcessSimulation(model.root,model),state=sim.state();
 assert.deepEqual({assetId:state.assetId,sap:state.sap,serial:state.serial,year:state.year},{assetId:'BMJ-MCH-0015',sap:'APM-9',serial:'MP.DBE0-00115',year:2024});
 sim.dispose();model.dispose();
});
