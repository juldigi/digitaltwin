import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {SheetingMachineTemplate,SHEETING_VISUAL_REFERENCE,SHEETING_ACTUAL_LAYOUT} from '../frontend/src/sheeting.js';
import {SheetingProcessSimulation,SHEETING_SIMULATION_STAGES,SHEETING_PROCESS_STEPS} from '../frontend/src/simulation-sheeting.js';
import {SHEETING_TAXONOMY} from '../frontend/src/data/taxonomy-sheeting.js';
import {SHEETING_PHOTO_REGISTRY,SHEETING_TECHNICAL_SOURCES,sheetingPhotoStats,SHEETING_ORIENTATION,SHEETING_VISUAL_ANCHORS} from '../frontend/src/data/sources-sheeting.js';

const boxOf=o=>new THREE.Box3().setFromObject(o);
const roleCount=(m,r)=>m.meshes.filter(x=>x.userData.role===r).length;
const roleMeshes=(m,r)=>m.meshes.filter(x=>x.userData.role===r);
const advance=(sim,now,seconds,step=.02)=>{
  let left=seconds;
  while(left>1e-9){const dt=Math.min(step,left);now+=dt*1000;sim.update(now);left-=dt;}
  return now;
};

test('V197 keeps BMJ photos primary and refuses to hard-model hidden cutter internals',()=>{
  assert.equal(SHEETING_VISUAL_REFERENCE.plantModel,'HSM-CTM7');
  assert.equal(SHEETING_VISUAL_REFERENCE.visualRevision,'V197_BMJ_MATERIAL_STATE_AND_GEOMETRY_TRUTH');
  assert.equal(SHEETING_ACTUAL_LAYOUT.revision,'V197');
  assert.equal(SHEETING_ACTUAL_LAYOUT.direction,'RIGHT_TO_LEFT');
  assert.deepEqual(sheetingPhotoStats(),{unique:9,total:9});
  assert.equal(SHEETING_PHOTO_REGISTRY.length,9);
  assert.match(SHEETING_ORIENTATION.unwindArchitecture,/one loaded reel|left\/right hydraulic arm pair/i);
  assert.match(SHEETING_ORIENTATION.cutterArchitecture,/does not hard-model|material separation/i);
  assert.match(SHEETING_ORIENTATION.processKinematics,/web velocity|trailing edge at the cut point/i);
  assert.ok(SHEETING_VISUAL_ANCHORS.simulation.some(x=>/no invented blade/i.test(x)));

  const hsm=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-HSM56-BW-PDF');
  const msp=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-MAXSON-MSP-PDF');
  const pinch=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-MAXSON-TAKEAWAY-PINCH');
  assert.match(hsm.note,/flat[- ]bed knife/i);
  assert.match(msp.note,/NOT use|not use/i);
  assert.match(pinch.note,/does not instantiate/i);
});

test('V197 corrects the unwind to one reel supported by one left/right arm pair',()=>{
  const m=new SheetingMachineTemplate();
  assert.equal(m.root.userData.researchVersion,'V197');
  assert.equal(roleCount(m,'single-reel-arm-inner'),2);
  assert.equal(roleCount(m,'single-reel-arm-outer'),2);
  assert.equal(roleCount(m,'single-reel-chuck-housing'),2);
  assert.equal(roleCount(m,'single-rollstand-main-pivot'),2);
  assert.equal(roleCount(m,'single-rollstand-hydraulic-cylinder'),2);
  assert.equal(roleCount(m,'single-rollstand-hydraulic-rod'),2);
  assert.equal(roleCount(m,'rollstand-arm-hydraulic-hose'),2);

  for(const old of [
    'loaded-reel-arm-inner','loaded-reel-arm-outer','parked-reel-arm-inner','parked-reel-arm-outer',
    'standby-reel-arm-inner','standby-reel-arm-outer','vertical-hydraulic-cylinder','hydraulic-piston-rod'
  ])assert.equal(roleCount(m,old),0,old+' must not return');

  assert.equal(m.activeMeshes.filter(x=>x.userData.motion==='reel').length,1);
  assert.match(m.root.userData.processFlow.unwindArchitecture,/ONE_LOADED_REEL/);
  assert.match(m.root.userData.processFlow.unwindArchitecture,/NO_LONGITUDINAL_SECOND_STATION/);
  m.dispose();
});

test('V197 retains the deep threaded web carrier and photo-grounded roller path',()=>{
  const m=new SheetingMachineTemplate();
  assert.equal(roleCount(m,'web-carrier-longitudinal-beam'),2);
  assert.equal(roleCount(m,'web-carrier-cross-tie'),5);
  assert.equal(roleCount(m,'web-carrier-hanger-bracket'),8);
  assert.equal(roleCount(m,'loop-frame-upright'),8);
  assert.equal(roleCount(m,'loop-frame-longitudinal-rail'),6);

  const rollers=m.activeMeshes.filter(x=>x.userData.motion==='guide-roller');
  assert.equal(rollers.length,8);
  assert.equal(roleCount(m,'low-entry-guide-roll'),1);
  assert.equal(roleCount(m,'guide-tension-roller'),7);
  assert.deepEqual([...new Set(rollers.map(x=>x.userData.layoutId))].sort(),['G1','G2','G3','G4','G5','G6','G7','LOW']);
  assert.ok(new Set(rollers.map(x=>x.userData.rotationSign)).size===2);
  m.dispose();
});

test('V197 removes the speculative Maxson fly-knife and pinch-roll geometry completely',()=>{
  const m=new SheetingMachineTemplate();
  assert.equal(m.findNode('sheeting-flatbed-cutter-family')?.children.length||0,0);
  assert.equal(m.findNode('sheeting-cut-takeaway-pinch')?.children.length||0,0);
  for(const role of [
    'stationary-bed-knife','fly-knife-revolver','fly-knife-blade','fly-knife-cutting-edge',
    'fly-knife-revolver-bearing','cutter-takeaway-pinch-roll'
  ])assert.equal(roleCount(m,role),0,role+' is not BMJ-verified');

  const knife=m.findNode('sheeting-knife');
  assert.ok(knife);
  assert.equal(knife.userData.visibleKnifeGeometry,false);
  assert.match(knife.userData.evidenceBoundary,/does not establish the exact BMJ|does not invent internal blade geometry/i);
  m.setExteriorOpen(true);
  assert.equal(roleCount(m,'fly-knife-blade'),0);
  m.setExteriorOpen(false);
  m.dispose();
});

test('V197 deepens photo-visible cutter, delivery and stack structures without adding hidden mechanisms',()=>{
  const m=new SheetingMachineTemplate();
  assert.equal(roleCount(m,'draw-section-side-cheek'),2);
  assert.equal(roleCount(m,'draw-section-top-bearing-carrier'),2);
  assert.equal(roleCount(m,'draw-section-front-cross-tie'),1);
  assert.equal(roleCount(m,'delivery-upper-datum-rail'),2);
  assert.equal(roleCount(m,'delivery-crossbar-support'),10);
  assert.equal(roleCount(m,'stack-white-guide-panel'),2);
  assert.equal(roleCount(m,'stack-green-guide-head'),2);
  assert.equal(roleCount(m,'stack-guide-contact-roller'),2);
  assert.equal(roleCount(m,'stack-guide-vertical-screw'),2);
  assert.equal(roleCount(m,'stack-guide-screw-cap'),2);
  m.dispose();
});

test('V197 taxonomy remains six levels without invented blade-part nodes',()=>{
  assert.deepEqual([...new Set(SHEETING_TAXONOMY.map(n=>n.level))].sort(),[1,2,3,4,5,6]);
  assert.equal(new Set(SHEETING_TAXONOMY.map(n=>n.id)).size,SHEETING_TAXONOMY.length);
  assert.equal(SHEETING_TAXONOMY.some(n=>/BEDKNIFE|FLYKNIFE|TAKEAWAY/.test(n.id)),false);

  const m=new SheetingMachineTemplate();
  for(const n of SHEETING_TAXONOMY){
    if(n.level>1)assert.ok(SHEETING_TAXONOMY.some(p=>p.id===n.parentId),n.id);
    assert.ok((n.meshRefs||[]).some(ref=>m.findNode(ref))||n.id==='SH',n.id);
  }
  assert.equal(m.resolveTaxonomyNode('SH.HEAD.SUB.BLOCK.PART.KNIFE').userData.nodeId,'sheeting-knife');
  m.dispose();
});

test('V197 simulation models continuous web, forming sheet and separation as different material states',()=>{
  const m=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(m.root,m);
  assert.equal(sim.group.name,'SHEETING-PROCESS-SIMULATION-V197');
  assert.deepEqual(SHEETING_SIMULATION_STAGES,[
    'Unwind / Web Tension','Draw Roll / Sheet-Length Feed','Guarded Cross-Cut / Material Separation',
    'Take-Away Acceleration / Gap','Slow-Speed Overlap / Shingling','Stack Entry / Pile'
  ]);
  assert.ok(SHEETING_PROCESS_STEPS.some(x=>/still physically connected to the web/i.test(x)));
  assert.ok(SHEETING_PROCESS_STEPS.some(x=>/does not animate a guessed blade/i.test(x)));
  assert.equal(sim.state().bladeVisible,false);
  assert.equal(sim.state().bladeCount,0);
  assert.equal(sim.state().visibleKnifeGeometry,false);
  assert.equal(sim.state().cutterMode,'GUARDED_CROSS_CUT__INTERNAL_MECHANISM_UNRESOLVED');
  assert.equal(sim.state().transportMode,'CONTINUOUS_WEB__FORMING_SHEET__GUARDED_CUT__SMOOTH_TAKEAWAY_ACCEL__SLOW_SHINGLE__STACK_SETTLE');

  sim.start();let now=1000;sim.update(now);
  now=advance(sim,now,sim.cutInterval*.50);
  assert.equal(sim.cutCount,0);
  assert.equal(sim.sheets.filter(x=>x.visible).length,0);
  assert.ok(Math.abs(sim.pendingLeaderLength-sim.targetCutLength*.50)<.03);
  assert.ok(sim.pendingLeaderSegments.some(x=>x.visible),'forming attached sheet must already extend downstream');

  now=advance(sim,now,sim.cutInterval*.49);
  assert.equal(sim.cutCount,0);
  assert.ok(sim.pendingLeaderLength>sim.targetCutLength*.96);
  assert.equal(sim.cutEdge.visible,false);

  now=advance(sim,now,sim.cutInterval*.02,.005);
  assert.equal(sim.cutCount,1);
  assert.ok(sim.pendingLeaderLength<sim.targetCutLength*.06);
  const detached=sim.sheets.find(x=>x.visible&&x.userData.cutId===1);
  assert.ok(detached);
  assert.equal(detached.userData.transportZone,'TAKEAWAY_GAP');
  assert.equal(detached.userData.detachedAtWebSpeed,true);
  assert.equal(sim.cutEdge.userData.notABlade,true);
  assert.equal(sim.cutEdge.visible,true);
  assert.equal(sim.state().cuttingNow,true);

  now=advance(sim,now,sim.cutEdgeDuration+.03,.005);
  assert.equal(sim.cutEdge.visible,false);
  assert.equal(sim.state().cuttingNow,false);
  sim.dispose();m.dispose();
});

test('V197 detached sheet starts at web velocity then accelerates smoothly instead of teleporting',()=>{
  const m=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(m.root,m);
  const dt=.001;
  const s0=sim.transportDistanceForAge(0);
  const s1=sim.transportDistanceForAge(dt);
  const initialVelocity=(s1-s0)/dt;
  assert.ok(Math.abs(initialVelocity-sim.webLinearSpeed)<.01,'detachment velocity must equal web speed');

  const t=sim.takeawayAccelTime;
  const sa=sim.transportDistanceForAge(t-dt);
  const sb=sim.transportDistanceForAge(t);
  const endAccelVelocity=(sb-sa)/dt;
  assert.ok(Math.abs(endAccelVelocity-sim.fastTapeSpeed)<.02,'take-away acceleration must finish near belt speed');
  assert.ok(sim.fastTapeSpeed>sim.webLinearSpeed);
  assert.ok(sim.takeawayAccelDistance>sim.webLinearSpeed*t);
  assert.ok(sim.takeawayAccelDistance<sim.fastTapeSpeed*t);
  assert.equal(sim.state().detachmentLinearSpeed,sim.webLinearSpeed);
  assert.equal(sim.state().takeawayAccelTime,sim.takeawayAccelTime);
  sim.dispose();m.dispose();
});

test('V197 separated sheet is born downstream with its trailing edge at the cut point',()=>{
  const m=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(m.root,m);
  const pose=sim.poseAtDistance(sim.sheetCenterStartS);
  const trail=pose.p.clone().addScaledVector(pose.tan,-sim.sheetLength/2);
  const cut=new THREE.Vector3(sim.cutX,sim.cutY,0);
  assert.ok(trail.distanceTo(cut)<.06);
  assert.ok(pose.p.x<sim.cutX-.60);
  assert.equal(sim.state().detachedSheetStartsWithTrailingEdgeAtCutPoint,true);
  sim.dispose();m.dispose();
});

test('V197 take-away opens a real gap while the following sheet is still attached',()=>{
  const m=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(m.root,m);
  sim.start();let now=1000;sim.update(now);
  now=advance(sim,now,sim.cutInterval+.45);
  const sheet=sim.sheets.find(x=>x.visible&&x.userData.cutId===1);
  assert.ok(sheet);
  const age=sim.elapsed-sim.cutInterval;
  const centerS=sim.transportDistanceForAge(age);
  const trailingS=centerS-sim.sheetLength/2;
  assert.ok(trailingS>sim.pendingLeaderLength+.08,'take-away must open gap from the still-attached following web');
  assert.ok(sim.nominalFastGap>0);
  sim.dispose();m.dispose();
});

test('V197 slow delivery creates physical shingling rather than equal-card spacing',()=>{
  const m=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(m.root,m);
  assert.ok(sim.slowTapeSpeed<sim.webLinearSpeed);
  assert.ok(sim.slowPitch<sim.sheetLength);
  assert.ok(sim.nominalOverlap>.45);

  sim.start();let now=1000;sim.update(now);
  for(let i=0;i<220;i++){now+=30;sim.update(now);}
  const active=sim.sheets.filter(x=>x.visible&&['SLOW_TRANSFER','OVERLAP_SHINGLE'].includes(x.userData.transportZone));
  assert.ok(active.length>=2,'shingled delivery needs simultaneous overlapping sheets');
  const xs=active.map(x=>x.position.x).sort((a,b)=>b-a);
  assert.ok(Math.abs(xs[0]-xs[1])<sim.sheetLength,'slow-zone pitch must be shorter than the sheet');
  sim.dispose();m.dispose();
});

test('V197 upstream web wraps roller contact surfaces without penetrating roller cores',()=>{
  const m=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(m.root,m);
  const low=SHEETING_ACTUAL_LAYOUT.lowEntryRoll;
  for(const p of sim.lowEntryContactPoints){
    const d=Math.hypot(p.x-low.center[0],p.y-low.center[1]);
    assert.ok(Math.abs(d-(low.radius+.018))<1e-9);
  }
  for(const spec of SHEETING_ACTUAL_LAYOUT.feedRollers){
    const pts=sim.guideRollContactPoints.get(spec.id);
    assert.equal(pts.length,13);
    for(const p of pts){
      const d=Math.hypot(p.x-spec.center[0],p.y-spec.center[1]);
      assert.ok(Math.abs(d-(spec.radius+.016))<1e-9,spec.id);
    }
    let min=Infinity;
    for(const p of sim.preCutCurve.getPoints(1800))min=Math.min(min,Math.hypot(p.x-spec.center[0],p.y-spec.center[1]));
    assert.ok(min>=spec.radius*.86,spec.id+' spline penetrates roller core');
  }
  sim.dispose();m.dispose();
});

test('V197 pile/lift stays grounded and manual guide hardware remains static',()=>{
  const m=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(m.root,m);
  const manual=roleMeshes(m,'stack-guide-handwheel');
  const manualRest=manual.map(x=>x.quaternion.clone());
  const lifts=m.activeMeshes.filter(x=>x.userData.motion==='lift-table');
  const liftRest=lifts.map(x=>x.position.y);
  const reference=m.meshes.filter(x=>x.userData.referenceStack);

  sim.start();let now=1000;sim.update(now);
  for(let i=0;i<850;i++){now+=30;sim.update(now);}
  assert.ok(sim.completed>=1);
  assert.ok(sim.pile.some(x=>x.visible));
  assert.equal(sim.state().manualStackGuidesStatic,true);
  for(let i=0;i<manual.length;i++)assert.ok(manual[i].quaternion.angleTo(manualRest[i])<1e-9);

  sim.stop();
  assert.ok(reference.every(x=>x.visible));
  for(let i=0;i<lifts.length;i++)assert.equal(lifts[i].position.y,liftRest[i]);
  sim.dispose();m.dispose();
});

test('V197 keeps speculative option modules out and all geometry finite/grounded',()=>{
  const m=new SheetingMachineTemplate();m.root.updateMatrixWorld(true);
  for(const id of [
    'sheeting-slitter-v122','sheeting-knife-drive-v122','sheeting-overlap-vacuum-v122','sheeting-stack-level-v122'
  ])assert.equal(m.findNode(id),null,id);
  for(const mesh of m.meshes){
    const b=boxOf(mesh);
    for(const v of [b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z])assert.ok(Number.isFinite(v),mesh.userData.role||mesh.name);
  }
  const size=boxOf(m.root).getSize(new THREE.Vector3());
  assert.ok(size.x>15&&size.x<20);
  assert.ok(size.y>2.9&&size.y<4.3);
  assert.ok(size.z>4.0&&size.z<5.8);
  assert.ok(boxOf(m.root).min.y>-.10);
  assert.match(m.root.userData.installedOptionBoundary,/removes the incorrect longitudinal second reel station/i);
  m.dispose();
});
