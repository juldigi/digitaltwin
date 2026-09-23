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

test('V196 keeps BMJ photos primary and uses family sources only for guarded cutter/delivery kinematics',()=>{
  assert.equal(SHEETING_VISUAL_REFERENCE.plantModel,'HSM-CTM7');
  assert.equal(SHEETING_VISUAL_REFERENCE.visualRevision,'V196_BMJ_TRUE_WEB_CUT_DELIVERY_KINEMATICS');
  assert.equal(SHEETING_ACTUAL_LAYOUT.revision,'V196');
  assert.equal(SHEETING_ACTUAL_LAYOUT.direction,'RIGHT_TO_LEFT');
  assert.deepEqual(sheetingPhotoStats(),{unique:9,total:9});
  assert.equal(SHEETING_PHOTO_REGISTRY.length,9);
  assert.match(SHEETING_ORIENTATION.feedArchitecture,/long gray upper carrier/i);
  assert.match(SHEETING_ORIENTATION.cutterArchitecture,/stationary bed knife plus rotary fly-knife/i);
  assert.match(SHEETING_ORIENTATION.deliveryArchitecture,/still attached to the continuous web until cross-cut/i);
  assert.match(SHEETING_ORIENTATION.processKinematics,/trailing edge at the cut point/i);
  assert.ok(SHEETING_VISUAL_ANCHORS.simulation.some(x=>/attached downstream leader/i.test(x)));

  const hsm=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-HSM56-BW-PDF');
  const msp=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-MAXSON-MSP-PDF');
  const pinch=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-MAXSON-TAKEAWAY-PINCH');
  const overlap=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-MAXSON-OVERLAP-ROLL');
  assert.match(hsm.note,/Flat Bed Knife/i);
  assert.match(msp.note,/stationary bed knife/i);
  assert.match(pinch.note,/still attached|continuous web|taut/i);
  assert.match(overlap.note,/slow-speed tapes|shingling/i);
});

test('V196 restores the actual long overhead web carrier as an independent assembly',()=>{
  const m=new SheetingMachineTemplate();
  assert.equal(m.root.userData.researchVersion,'V196');
  assert.equal(roleCount(m,'web-carrier-longitudinal-beam'),2);
  assert.equal(roleCount(m,'web-carrier-cross-tie'),5);
  assert.equal(roleCount(m,'web-carrier-hanger-bracket'),8);
  assert.equal(roleCount(m,'web-carrier-cutter-end-brace'),2);
  assert.equal(roleCount(m,'web-carrier-unwind-end-brace'),2);
  assert.equal(roleCount(m,'rollstand-upper-longitudinal-member'),0);
  assert.equal(roleCount(m,'feed-upper-longitudinal-rail'),0);
  const carrier=m.findNode('sheeting-unwind-bridge');
  assert.ok(carrier);
  assert.match(carrier.name,/Web Carrier/i);
  assert.ok(boxOf(carrier).getSize(new THREE.Vector3()).x>4.7);
  m.dispose();
});

test('V196 deepens the visible threaded web loop and open infeed support frame',()=>{
  const m=new SheetingMachineTemplate();
  const rollers=m.activeMeshes.filter(x=>x.userData.motion==='guide-roller');
  assert.equal(rollers.length,8);
  assert.equal(roleCount(m,'low-entry-guide-roll'),1);
  assert.equal(roleCount(m,'guide-tension-roller'),7);
  const ys=rollers.map(x=>x.position.y);
  assert.ok(Math.max(...ys)-Math.min(...ys)>1.20,'roller loop must have real high/low travel');
  assert.equal(roleCount(m,'loop-frame-upright'),8);
  assert.equal(roleCount(m,'loop-frame-longitudinal-rail'),6);
  assert.deepEqual([...new Set(rollers.map(x=>x.userData.layoutId))].sort(),['G1','G2','G3','G4','G5','G6','G7','LOW']);
  assert.ok(new Set(rollers.map(x=>x.userData.rotationSign)).size===2);
  m.dispose();
});

test('V196 flat-bed cutter internals are cutaway-only and mechanically coherent',()=>{
  const m=new SheetingMachineTemplate();
  assert.equal(roleCount(m,'stationary-bed-knife'),1);
  assert.equal(roleCount(m,'fly-knife-revolver'),1);
  assert.equal(roleCount(m,'fly-knife-blade'),1);
  assert.equal(roleCount(m,'fly-knife-cutting-edge'),1);
  assert.equal(roleCount(m,'fly-knife-revolver-bearing'),2);
  assert.equal(roleCount(m,'cutter-takeaway-pinch-roll'),2);

  const bed=roleMeshes(m,'stationary-bed-knife')[0],blade=roleMeshes(m,'fly-knife-blade')[0],revolver=roleMeshes(m,'fly-knife-revolver')[0];
  assert.equal(bed.userData.cutawayOnly,true);
  assert.equal(blade.userData.cutawayOnly,true);
  assert.equal(revolver.userData.kinematicGroup,'CUTTER_SYNC');
  assert.equal(m.findNode('sheeting-knife').userData.visibleKnifeGeometry,'CUTAWAY_ONLY_FAMILY_REFERENCE');
  assert.ok(!bed.visible&&!blade.visible&&!revolver.visible,'internal cutter must stay hidden with exterior closed');

  m.setExteriorOpen(true);
  assert.ok(bed.visible&&blade.visible&&revolver.visible,'cutaway must reveal family-reference cutter');
  m.setExteriorOpen(false);
  assert.ok(!bed.visible&&!blade.visible&&!revolver.visible,'closing cutaway must hide internals again');
  m.reset();
  assert.ok(!bed.visible&&!blade.visible&&!revolver.visible,'reset must not leak hidden cutter geometry');
  m.dispose();
});

test('V196 taxonomy maps web carrier, bed knife, fly knife and take-away references',()=>{
  assert.deepEqual([...new Set(SHEETING_TAXONOMY.map(n=>n.level))].sort(),[1,2,3,4,5,6]);
  const m=new SheetingMachineTemplate();
  for(const n of SHEETING_TAXONOMY){
    if(n.level>1)assert.ok(SHEETING_TAXONOMY.some(p=>p.id===n.parentId),n.id);
    assert.ok((n.meshRefs||[]).some(ref=>m.findNode(ref))||n.id==='SH',n.id);
  }
  const cases={
    'SH.FEED.SUB.BLOCK.PART.CARRIER':'sheeting-unwind-bridge',
    'SH.HEAD.SUB.BLOCK.PART.BEDKNIFE':'sheeting-flatbed-cutter-family',
    'SH.HEAD.SUB.BLOCK.PART.FLYKNIFE':'sheeting-flatbed-cutter-family',
    'SH.HEAD.SUB.BLOCK.PART.TAKEAWAY':'sheeting-cut-takeaway-pinch'
  };
  for(const [id,node] of Object.entries(cases))assert.equal(m.resolveTaxonomyNode(id).userData.nodeId,node,id);
  m.dispose();
});

test('V196 simulation keeps a continuous attached leader until the actual cut instant',()=>{
  const m=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(m.root,m);
  assert.equal(sim.group.name,'SHEETING-PROCESS-SIMULATION-V196');
  assert.ok(SHEETING_PROCESS_STEPS.some(x=>/still attached to the web/i.test(x)));
  assert.equal(sim.state().detachedSheetStartsWithTrailingEdgeAtCutPoint,true);
  assert.equal(sim.state().transportMode,'ATTACHED_WEB__BED_KNIFE_CUT__FAST_GAP__SLOW_SHINGLE__STACK_SETTLE');

  sim.start();
  let now=1000;sim.update(now);

  // Halfway to first cut: no detached sheet yet; downstream leader is half a cut length.
  const half=sim.cutInterval*.5;
  now+=half*1000;sim.update(now);
  assert.equal(sim.cutCount,0);
  assert.equal(sim.sheets.filter(x=>x.visible).length,0);
  assert.ok(Math.abs(sim.pendingLeaderLength-sim.targetCutLength*.5)<.03);
  assert.ok(sim.pendingLeaderSegments.some(x=>x.visible));

  // Just before first cut the attached leader approaches one full sheet length.
  now+=(sim.cutInterval*.49)*1000;sim.update(now);
  assert.equal(sim.cutCount,0);
  assert.ok(sim.pendingLeaderLength>sim.targetCutLength*.96);

  // Cross the cut event: leader resets and sheet 1 becomes detached.
  now+=(sim.cutInterval*.02)*1000;sim.update(now);
  assert.equal(sim.cutCount,1);
  assert.ok(sim.pendingLeaderLength<sim.targetCutLength*.05);
  const sheet=sim.sheets.find(x=>x.visible&&x.userData.cutId===1);
  assert.ok(sheet,'first detached sheet must exist immediately after cut');
  assert.equal(sheet.userData.transportZone,'FAST_GAP');

  sim.dispose();m.dispose();
});

test('V196 detached sheet is born with trailing edge at the knife, not centered on the knife',()=>{
  const m=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(m.root,m);
  const pose=sim.poseAtDistance(sim.sheetCenterStartS);
  const trail=pose.p.clone().addScaledVector(pose.tan,-sim.sheetLength/2);
  const cut=new THREE.Vector3(sim.cutX,sim.cutY,0);
  assert.ok(trail.distanceTo(cut)<.06,'trailing edge must coincide with the cut point at separation');

  // The center must already be downstream by roughly half a sheet length.
  assert.ok(pose.p.x<sim.cutX-.60);
  sim.dispose();m.dispose();
});

test('V196 high-speed take-away creates a real gap from the next attached web',()=>{
  const m=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(m.root,m);
  sim.start();
  let now=1000;sim.update(now);

  // Move to 0.45 s after first cut.
  now+=(sim.cutInterval+.45)*1000;sim.update(now);
  const sheet=sim.sheets.find(x=>x.visible&&x.userData.cutId===1);
  assert.ok(sheet);
  const age=sim.elapsed-sim.cutInterval;
  const centerS=sim.transportDistanceForAge(age);
  const trailingS=centerS-sim.sheetLength/2;
  const attachedLeadingS=sim.pendingLeaderLength;
  assert.ok(trailingS>attachedLeadingS+.10,'detached sheet must pull ahead and open a physical gap');
  assert.ok(sim.fastTapeSpeed>sim.webLinearSpeed);
  assert.ok(sim.nominalFastGap>0);
  sim.dispose();m.dispose();
});

test('V196 slow delivery produces shingled overlap instead of equal card spacing',()=>{
  const m=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(m.root,m);
  assert.ok(sim.slowTapeSpeed<sim.webLinearSpeed);
  assert.ok(sim.nominalOverlap>.45);
  assert.ok(sim.slowPitch<sim.sheetLength);

  sim.start();
  let now=1000;sim.update(now);
  // Run long enough for several sheets to enter slow/overlap zones.
  for(let i=0;i<170;i++){now+=40;sim.update(now);}
  const active=sim.sheets.filter(x=>x.visible&&['SLOW_TRANSFER','OVERLAP_SHINGLE'].includes(x.userData.transportZone));
  assert.ok(active.length>=2,'at least two sheets should coexist in shingled delivery');
  const xs=active.map(x=>x.position.x).sort((a,b)=>b-a);
  const spacing=Math.abs(xs[0]-xs[1]);
  assert.ok(spacing<sim.sheetLength,'successive slow-zone sheets must overlap longitudinally');
  sim.dispose();m.dispose();
});

test('V196 fly-knife revolver is web-length phase locked and only one cut occurs per sheet length',()=>{
  const m=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(m.root,m);
  const rotor=roleMeshes(m,'fly-knife-revolver')[0],rest=rotor.quaternion.clone();
  sim.start();
  let now=1000;sim.update(now);

  now+=(sim.cutInterval*.25)*1000;sim.update(now);
  const q25=rotor.quaternion.clone();
  assert.ok(q25.angleTo(rest)>.2);

  now+=(sim.cutInterval*.25)*1000;sim.update(now);
  const q50=rotor.quaternion.clone();
  assert.ok(q50.angleTo(q25)>.2);

  now+=(sim.cutInterval*.50)*1000;sim.update(now);
  assert.equal(sim.cutCount,1);
  assert.ok(rotor.quaternion.angleTo(rest)<.08,'one revolution should return cutter to cut orientation at next cut');
  assert.ok(sim.state().bladeCount===2);
  assert.equal(sim.state().visibleKnifeGeometry,'CUTAWAY_ONLY_FAMILY_REFERENCE');
  sim.dispose();m.dispose();
});

test('V196 upstream web wraps every roller surface without penetrating roller cores',()=>{
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

test('V196 pile/lift behavior stays grounded while manual stack hardware remains static',()=>{
  const m=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(m.root,m);
  const manual=roleMeshes(m,'stack-guide-handwheel');
  const manualRest=manual.map(x=>x.quaternion.clone());
  const lifts=m.activeMeshes.filter(x=>x.userData.motion==='lift-table');
  const liftRest=lifts.map(x=>x.position.y);
  const reference=m.meshes.filter(x=>x.userData.referenceStack);

  sim.start();let now=1000;sim.update(now);
  for(let i=0;i<650;i++){now+=40;sim.update(now);}
  assert.ok(sim.completed>=1);
  assert.equal(sim.state().manualStackGuidesStatic,true);
  for(let i=0;i<manual.length;i++)assert.ok(manual[i].quaternion.angleTo(manualRest[i])<1e-9);
  assert.ok(sim.pile.some(x=>x.visible));

  sim.stop();
  assert.ok(reference.every(x=>x.visible));
  for(let i=0;i<lifts.length;i++)assert.equal(lifts[i].position.y,liftRest[i]);
  sim.dispose();m.dispose();
});

test('V196 keeps speculative option modules out and all generated geometry finite/grounded',()=>{
  const m=new SheetingMachineTemplate();m.root.updateMatrixWorld(true);
  for(const id of ['sheeting-slitter-v122','sheeting-knife-drive-v122','sheeting-overlap-vacuum-v122','sheeting-stack-level-v122'])assert.equal(m.findNode(id),null,id);
  for(const mesh of m.meshes){
    const b=boxOf(mesh);
    for(const v of [b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z])assert.ok(Number.isFinite(v),mesh.userData.role||mesh.name);
  }
  const size=boxOf(m.root).getSize(new THREE.Vector3());
  assert.ok(size.x>15&&size.x<20);
  assert.ok(size.y>2.9&&size.y<4.2);
  assert.ok(size.z>4.0&&size.z<5.8);
  assert.ok(boxOf(m.root).min.y>-.10);
  assert.match(m.root.userData.installedOptionBoundary,/HSM56\/Maxson evidence/i);
  m.dispose();
});
