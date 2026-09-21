import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Polar115MachineTemplate} from '../frontend/src/polar115.js';
import {Polar115ProcessSimulation,POLAR115_SIMULATION_STAGES} from '../frontend/src/simulation-polar115.js';
import {POLAR115_TAXONOMY} from '../frontend/src/data/taxonomy-polar115.js';
import {POLAR115_SPEC} from '../frontend/src/data/dimensions-polar115.js';
import {POLAR115_TECHNICAL_SOURCES,POLAR115_PROCESS} from '../frontend/src/data/sources-polar115.js';

test('POLAR 115 EM-MON preserves BMJ identity and archive dimensional boundaries',()=>{
 assert.equal(POLAR115_SPEC.assetId,'BMJ-MCH-0001');assert.equal(POLAR115_SPEC.model,'115 EM MON');assert.equal(POLAR115_SPEC.serial,'5831536');assert.equal(POLAR115_SPEC.cuttingWidthM,1.15);
 assert.deepEqual(POLAR115_SPEC.referenceEnvelopeM,[2.65,2.54,1.65]);assert.deepEqual(POLAR115_SPEC.publishedWeightKg,[3200,3500]);assert.deepEqual(POLAR115_SPEC.publishedClampPressureDaN,[150,4500]);
 assert.ok(POLAR115_TECHNICAL_SOURCES.some(s=>s.id==='POLAR-115-SAFETY-MANUAL'));assert.ok(POLAR115_TECHNICAL_SOURCES.some(s=>s.id==='POLAR-EM-EVIDENCE-BOUNDARY'));
});

test('POLAR geometry uses a vertical knife blade and keeps safety hardware explicit',()=>{
 const m=new Polar115MachineTemplate();
 for(const id of ['polar-feed-center','polar-feed-left','polar-feed-right','polar-gauge','polar-clamp','polar-knife','polar-knife-blade','polar-safety-photo','polar-safety-twohand','polar-control-crt','polar-control-panel','polar-hyd-power','polar-air-blower'])assert.ok(m.findNode(id),id);
 const blade=m.meshes.find(x=>x.userData.knifeBlade);assert.ok(blade);blade.geometry.computeBoundingBox();const size=blade.geometry.boundingBox.getSize(new THREE.Vector3());assert.ok(size.y>size.z*3,'knife should be a vertical thin blade, not a horizontal plate');
 assert.equal(m.findNode('polar-safety-twohand').userData.simultaneityControlReference,true);assert.equal(m.findNode('polar-safety-twohand').userData.antiRepeatReference,true);
 const box=new THREE.Box3().setFromObject(m.root),envelope=box.getSize(new THREE.Vector3());assert.ok(box.min.y>=-0.01);assert.ok(envelope.x>=2.55&&envelope.x<=2.9);assert.ok(envelope.z>=1.7&&envelope.z<=2.8);assert.ok(envelope.y>=1.55&&envelope.y<=1.85);
 m.setExteriorOpen(true);assert.ok(m.root.userData.exteriorHiddenCount>=6);m.dispose();
});

test('POLAR taxonomy is contiguous six levels and resolves every verified major unit',()=>{
 assert.deepEqual([...new Set(POLAR115_TAXONOMY.map(n=>n.level))].sort(),[1,2,3,4,5,6]);assert.equal(new Set(POLAR115_TAXONOMY.map(n=>n.id)).size,POLAR115_TAXONOMY.length);
 for(const n of POLAR115_TAXONOMY.filter(n=>n.level>1))assert.ok(POLAR115_TAXONOMY.some(p=>p.id===n.parentId),n.id);
 const m=new Polar115MachineTemplate();for(const n of POLAR115_TAXONOMY.filter(n=>n.level===2))assert.ok(m.resolveTaxonomyNode(n.id),n.id);m.dispose();
});

test('POLAR normal cut requires clamp contact before knife down and counts only a real cut',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);s.start();let now=1000,seenGauge=false,seenClampContact=false,seenKnifeDown=false,seenKnifeUp=false,seenCut=false;
 for(let i=0;i<850;i++){now+=10;s.update(now);const st=s.state();seenGauge||=st.backgaugeMoving;seenClampContact||=st.clampContact;
  if(st.knifeDownstroke){seenKnifeDown=true;assert.equal(st.interlocks.lightBarrierClear,true);assert.equal(st.interlocks.twoHandCommand,true);assert.equal(st.interlocks.cutCycleLatched,true);assert.equal(st.interlocks.clampContact,true);assert.equal(st.interlocks.knifeDownPermitted,true);}
  seenKnifeUp||=st.knifeUpstroke;seenCut||=st.cutSeparated;
 }
 assert.ok(seenGauge&&seenClampContact&&seenKnifeDown&&seenKnifeUp&&seenCut);assert.equal(s.completed,1);assert.equal(s.state().materialSplit.conserved,true);s.dispose();m.dispose();
});

test('POLAR material is split at the cut line without duplicating the original pile volume',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);s.start();let now=1000;for(let i=0;i<640;i++){now+=10;s.update(now);if(s.state().cutSeparated)break;}
 const st=s.state();assert.equal(st.cutSeparated,true);assert.equal(s.cutPiece.visible,true);assert.ok(s.stock.scale.z<1);assert.ok(Math.abs(st.materialSplit.frontDepth+st.materialSplit.rearDepth-st.materialSplit.fullDepth)<1e-9);
 s.stock.updateMatrixWorld(true);s.cutPiece.updateMatrixWorld(true);const rear=new THREE.Box3().setFromObject(s.stock),front=new THREE.Box3().setFromObject(s.cutPiece);assert.ok(front.max.z<=rear.min.z+.015,'split pieces overlap beyond the cut-line tolerance');
 s.dispose();m.dispose();
});

test('POLAR light-barrier obstruction blocks clamp/knife cut causality',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);s.start();s.setLightBarrierClear(false);let now=1000,blocked=false;for(let i=0;i<900;i++){now+=10;s.update(now);blocked||=s.state().blocked;}
 const st=s.state();assert.ok(blocked);assert.equal(s.completed,0);assert.equal(s.cutPerformed,false);assert.equal(s.cutPiece.visible,false);assert.equal(st.interlocks.lightBarrierClear,false);s.dispose();m.dispose();
});

test('POLAR disabled two-hand command prevents cut even with a clear light barrier',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);s.start();s.setTwoHandEnabled(false);let now=1000;for(let i=0;i<900;i++){now+=10;s.update(now);}
 const st=s.state();assert.equal(s.completed,0);assert.equal(s.cutPerformed,false);assert.equal(st.interlocks.twoHandCommand,false);assert.equal(st.interlocks.lightBarrierClear,true);assert.equal(s.cutPiece.visible,false);s.dispose();m.dispose();
});

test('POLAR clamp stroke and knife stroke stop short of unrealistic deep penetration',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);assert.ok(s.clampStroke<=.12);assert.ok(s.knifeStroke<=.34);
 const clamp0=s.rest.clamp.clone(),knife0=s.rest.knife.clone();s.start();let now=1000,maxClamp=0,maxKnife=0;for(let i=0;i<850;i++){now+=10;s.update(now);maxClamp=Math.max(maxClamp,clamp0.y-s.clamp.position.y);maxKnife=Math.max(maxKnife,knife0.y-s.knife.position.y);}
 assert.ok(maxClamp>.09&&maxClamp<=.111);assert.ok(maxKnife>.30&&maxKnife<=.331);s.dispose();m.dispose();
});

test('POLAR pause/resume has no time jump and stop restores stock and mechanisms',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);s.start();s.update(1000);s.update(1200);const t=s.elapsed;s.pause();s.update(20000);s.resume();s.update(30000);assert.equal(s.elapsed,t);s.update(30020);assert.ok(s.elapsed-t<.03);
 s.stop();assert.equal(s.stock.scale.z,1);assert.equal(s.cutPiece.visible,false);assert.ok(s.clamp.position.distanceTo(s.rest.clamp)<1e-10);assert.ok(s.knife.position.distanceTo(s.rest.knife)<1e-10);assert.ok(s.gauge.position.distanceTo(s.rest.gauge)<1e-10);s.dispose();m.dispose();
});

test('POLAR process stage contract remains load-position-safety-clamp-cut-return-release',()=>{
 assert.deepEqual(POLAR115_SIMULATION_STAGES,POLAR115_PROCESS);assert.deepEqual(POLAR115_PROCESS,[
  'Load / float stock on air table','Move backgauge to programmed dimension','Align stock against backgauge and side reference','Verify light barrier clear / initiate two-hand cut command',
  'Lower hydraulic clamp','Knife downstroke through stock into cutting stick','Knife upstroke to top position','Release clamp / remove or reposition stock'
 ]);
});
