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
 assert.ok(POLAR115_TECHNICAL_SOURCES.some(s=>s.id==='POLAR-115-SAFETY-MANUAL'));assert.ok(POLAR115_TECHNICAL_SOURCES.some(s=>s.id==='POLAR-EM-EVIDENCE-BOUNDARY'));const photos=POLAR115_TECHNICAL_SOURCES.find(s=>s.id==='BMJ-POLAR-PHOTOS-2026-09');assert.equal(photos?.confidence,'VERIFIED_VISUAL');assert.deepEqual(photos?.photoFiles,['IMG_2488.jpeg','IMG_2489.jpeg','IMG_2490.jpeg','IMG_2491.jpeg']);
});

test('four BMJ photo angles place the white air table and rear drive on the photographed side',()=>{
 const m=new Polar115MachineTemplate();m.root.updateMatrixWorld(true);
 const left=m.findNode('polar-feed-left'),right=m.findNode('polar-feed-right');
 const holeMeshes=m.meshes.filter(x=>x.userData.airNozzle);
 assert.equal(holeMeshes.length,88,'the broad single perforated table carries the full nozzle grid');
 assert.ok(holeMeshes.every(x=>m.contains(right,x)));
 assert.ok(!m.meshes.some(x=>x.userData.airNozzle&&m.contains(left,x)));
 const white=right.localToWorld(new THREE.Vector3()),drive=m.findNode('polar-housing-motor-end').localToWorld(new THREE.Vector3(1.2,0,0));
 assert.ok(white.x<0&&drive.x<0,'white table and side drive must appear on the same photographed machine side');
 m.root.scale.setScalar(1);m.root.updateMatrixWorld(true);
 assert.ok(right.localToWorld(new THREE.Vector3()).x<0,'factory engine resetting the machine root must not flip the photographed air-table side');
 assert.ok(m.findNode('polar-housing-motor-end').localToWorld(new THREE.Vector3(1.2,0,0)).x<0,'rear drive keeps its photographed side after a machine view switch');
 const whiteDeck=right.children.find(x=>x.isMesh&&x.userData.evidence==='IMG_2488_2489_FRONT_RIGHT_WHITE_PERFORATED');
 const centerDeck=m.findNode('polar-feed-center').children.find(x=>x.isMesh);
 assert.ok(new THREE.Box3().setFromObject(whiteDeck).min.z<new THREE.Box3().setFromObject(centerDeck).min.z-.3,'white air table must project toward the operator beyond the center table');
 const airWidth=new THREE.Box3().setFromObject(whiteDeck).getSize(new THREE.Vector3()).x;
 assert.ok(airWidth>.8,'the photographed air table is broad, not a narrow wing');
 assert.equal(right.children.filter(x=>x.isMesh&&x.userData.evidence==='IMG_2488_2489_AIR_TABLE_CORNER_LEGS').length,4);
 const frame=m.findNode('polar-frame').children.find(x=>x.isMesh&&x.userData.exteriorCover);
 const apron=m.findNode('polar-feed-center').children.find(x=>x.isMesh&&x.userData.evidence==='IMG_2488_THICK_FRONT_TABLE_APRON_AND_RECESSED_RIGHT_UNDERSIDE');
 assert.ok(new THREE.Box3().setFromObject(frame).max.y<new THREE.Box3().setFromObject(centerDeck).min.y-.15,'cabinet is lower than the front cutting table, leaving the photographed recess');
 assert.ok(new THREE.Box3().setFromObject(apron).min.y<new THREE.Box3().setFromObject(centerDeck).min.y-.1,'dark cutting surface has the photographed thick front apron');
 assert.ok(m.root.userData.photoOrientation.includes('PERFORATED_TABLE_FRONT_RIGHT'));
 const rearSlot=m.meshes.find(x=>x.userData.evidence==='IMG_2490_2491_REAR_TABLE_GUIDE_SLOT');assert.ok(rearSlot);
 const rearFingers=m.findNode('polar-housing-rear-fingers');
 assert.ok(rearFingers.children.filter(x=>x.userData.evidence==='IMG_2490_2491_REAR_FINGER_FIELD').length>=25,'rear throat presents the dense finger field visible from both rear angles');
 const driveCover=m.findNode('polar-housing-motor-end').children.find(x=>x.userData.evidence==='IMG_2490_REAR_LEFT_SIDE_DRIVE_NO_REAR_BULGE');
 const driveBounds=new THREE.Box3().setFromObject(driveCover);
 assert.ok(driveBounds.max.z<.9&&driveBounds.getSize(new THREE.Vector3()).y<.7,'side drive must not become a large white bulge at the rear end');
 m.dispose();
});

test('rear housing leaves the photographed backgauge opening and table unobstructed',()=>{
 const m=new Polar115MachineTemplate();m.root.updateMatrixWorld(true);
 const housing=m.findNode('polar-housing'),rearTable=m.findNode('polar-feed-rear');
 const rearTop=rearTable.children.find(x=>x.isMesh&&x.userData.evidence==='BMJ-POLAR-PHOTOS-2026-09');
 assert.ok(rearTop);
 for(const shell of housing.children.filter(x=>x.isMesh)){
  const shellBox=new THREE.Box3().setFromObject(shell);
  assert.ok(!shellBox.containsPoint(m.root.localToWorld(new THREE.Vector3(0,.90,.84))),'rear shell cuts through the center of the back table');
  assert.ok(!shellBox.containsPoint(m.root.localToWorld(new THREE.Vector3(0,1.15,.84))),'rear shell closes the finger opening');
 }
 m.dispose();
});

test('POLAR simulation transfers the stock from the sole air table before gauge and cut',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);s.start();let now=1000;s.update(now);
 assert.equal(s.stock.position.x,s.stockStartCenterX);
 m.root.scale.setScalar(1);m.root.updateMatrixWorld(true);
 assert.equal(s.group.parent,m.photoFrame,'paper simulation uses the same persistent photo orientation as the machine');
 assert.ok(s.stock.getWorldPosition(new THREE.Vector3()).x<0,'paper begins on the photographed white table side in the live machine view');
 for(let i=0;i<120;i++){now+=10;s.update(now);}
 assert.ok(Math.abs(s.stock.position.x)<.001);assert.equal(s.cutPerformed,false);
 assert.equal(s.stock.visible,true);s.dispose();m.dispose();
});

test('POLAR photographed red cut guide rides above the positioned stock until separation',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);s.start();let now=1000;s.update(now);
 while(s.phase()<.34){now+=10;s.update(now);}
 assert.equal(s.stockCutGuide.visible,true);
 assert.ok(s.stockCutGuide.position.y>s.stock.position.y+.04);
 assert.equal(s.stockCutGuide.position.z,s.cutLineZ);
 while(!s.cutPerformed){now+=10;s.update(now);}
 assert.equal(s.stockCutGuide.visible,false);
 s.dispose();m.dispose();
});

test('POLAR geometry uses a vertical knife blade and keeps safety hardware explicit',()=>{
 const m=new Polar115MachineTemplate();
 for(const id of ['polar-feed-center','polar-feed-left','polar-feed-right','polar-gauge','polar-clamp','polar-knife','polar-knife-blade','polar-safety-photo','polar-safety-left-arm','polar-safety-right-arm','polar-safety-twohand','polar-control-crt','polar-control-panel','polar-housing','polar-housing-motor-end','polar-hyd-power','polar-air-blower'])assert.ok(m.findNode(id),id);assert.equal(m.root.userData.mainHousingProfile,'RECTANGULAR_ROUNDED_HEAD__NO_HALF_CYLINDER_ROOF');
 const blade=m.meshes.find(x=>x.userData.knifeBlade);assert.ok(blade);blade.geometry.computeBoundingBox();const size=blade.geometry.boundingBox.getSize(new THREE.Vector3());assert.ok(size.y>size.z*3,'knife should be a vertical thin blade, not a horizontal plate');
 assert.equal(m.findNode('polar-safety-twohand').userData.simultaneityControlReference,true);assert.equal(m.findNode('polar-safety-twohand').userData.antiRepeatReference,true);
 const box=new THREE.Box3().setFromObject(m.root),envelope=box.getSize(new THREE.Vector3());assert.ok(box.min.y>=-0.01);assert.ok(envelope.x>=2.55&&envelope.x<=2.9);assert.ok(envelope.z>=1.7&&envelope.z<=2.8);assert.ok(envelope.y>=1.55&&envelope.y<=1.85);
 m.setExteriorOpen(true);assert.ok(m.root.userData.exteriorHiddenCount>=6);m.dispose();
});

test('front console faces the operator while the blade remains inside the cutter throat',()=>{
 const m=new Polar115MachineTemplate();m.root.updateMatrixWorld(true);
 const display=m.findNode('polar-control-crt').children.find(x=>x.name==='Program Display');
 const blade=m.meshes.find(x=>x.userData.knifeBlade);
 const controlZ=display.getWorldPosition(new THREE.Vector3()).z,knifeZ=blade.getWorldPosition(new THREE.Vector3()).z;
 assert.ok(controlZ<knifeZ-.1,'display must be operator-side of the knife, not behind it');
 assert.ok(display.getWorldPosition(new THREE.Vector3()).y>blade.getWorldPosition(new THREE.Vector3()).y,'display sits above the cutting aperture');
 assert.equal(m.findNode('polar-housing').children.filter(x=>x.isMesh&&x.userData.evidence==='IMG_2490_2491_OPEN_REAR_JAMB').length,0,'rear shell has no freestanding end pillars');
 m.dispose();
});

test('POLAR pressure bar remains ahead of the knife plane throughout the cut stroke',()=>{
 const m=new Polar115MachineTemplate(),sim=new Polar115ProcessSimulation(m.root,m);
 const beam=m.findNode('polar-clamp-beam').children.find(o=>o.isMesh);
 const blade=m.meshes.find(o=>o.userData.knifeBlade);
 for(const [clampDrop,knifeDrop] of [[0,0],[sim.clampStroke,sim.knifeStroke]]){
  sim.clamp.position.y=sim.rest.clamp.y-clampDrop;
  sim.knife.position.y=sim.rest.knife.y-knifeDrop;
  m.root.updateMatrixWorld(true);
  const pressure=new THREE.Box3().setFromObject(beam),cutting=new THREE.Box3().setFromObject(blade);
  assert.ok(pressure.max.z<cutting.min.z-.02,'clamp and knife intersect in the cutting slot');
 }
 sim.dispose();m.dispose();
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

test('POLAR obstruction during clamp approach releases clamp and retracts uncommitted knife',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);s.start();let now=1000;s.update(now);
 while(s.phase()<.53){now+=10;s.update(now);}
 assert.ok(s.clampHoldAmount>.9);
 s.setLightBarrierClear(false);now+=10;s.update(now);
 assert.equal(s.clampHoldAmount,0);assert.equal(s.knifeHoldAmount,0);
 assert.equal(s.clamp.position.y,s.rest.clamp.y);assert.equal(s.knife.position.y,s.rest.knife.y);
 assert.equal(s.cutPerformed,false);s.dispose();m.dispose();
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
