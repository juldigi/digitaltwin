import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {SheetingMachineTemplate,SHEETING_VISUAL_REFERENCE,SHEETING_ACTUAL_LAYOUT} from '../frontend/src/sheeting.js';
import {SheetingProcessSimulation,SHEETING_SIMULATION_STAGES,SHEETING_PROCESS_STEPS} from '../frontend/src/simulation-sheeting.js';
import {SHEETING_TAXONOMY} from '../frontend/src/data/taxonomy-sheeting.js';
import {SHEETING_PHOTO_REGISTRY,SHEETING_TECHNICAL_SOURCES,sheetingPhotoStats,SHEETING_ORIENTATION,SHEETING_VISUAL_ANCHORS} from '../frontend/src/data/sources-sheeting.js';

const boxOf=o=>new THREE.Box3().setFromObject(o);
const roleCount=(m,r)=>m.meshes.filter(x=>x.userData.role===r).length;

test('V195 keeps the nine actual BMJ photos primary and narrows uncertain connection claims',()=>{
 assert.equal(SHEETING_VISUAL_REFERENCE.plantModel,'HSM-CTM7');
 assert.equal(SHEETING_VISUAL_REFERENCE.visualRevision,'V195_BMJ_PHOTO_TRUTH_CORRECTION');
 assert.equal(SHEETING_ACTUAL_LAYOUT.revision,'V195');
 assert.equal(SHEETING_ACTUAL_LAYOUT.direction,'RIGHT_TO_LEFT');
 assert.equal(SHEETING_PHOTO_REGISTRY.length,9);
 assert.deepEqual(sheetingPhotoStats(),{unique:9,total:9});
 assert.equal(SHEETING_ORIENTATION.input,'RIGHT');assert.equal(SHEETING_ORIENTATION.output,'LEFT');
 assert.match(SHEETING_ORIENTATION.unwindArchitecture,/does not claim.*rigidly connect/i);
 assert.match(SHEETING_ORIENTATION.feedArchitecture,/separate open assembly/i);
 assert.match(SHEETING_ORIENTATION.cutterArchitecture,/large black exterior draw roll/i);
 assert.match(SHEETING_ORIENTATION.stackerArchitecture,/spring-return/i);
 assert.ok(SHEETING_VISUAL_ANCHORS.rollstand.includes('second photo-visible arm set with function unresolved'));
 const actual=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-BMJ-PHOTOSET-20260922');
 assert.equal(actual.confidence,'VERIFIED_VISUAL');
});

test('V195 removes the fabricated unwind-to-feed bridge and grounds both assemblies independently',()=>{
 const m=new SheetingMachineTemplate();
 assert.equal(m.root.userData.researchVersion,'V195');
 assert.equal(roleCount(m,'overhead-longitudinal-beam'),0);
 assert.equal(roleCount(m,'overhead-green-link'),0);
 assert.equal(roleCount(m,'overhead-cross-tie'),0);
 assert.equal(roleCount(m,'rollstand-upper-longitudinal-member'),2);
 assert.equal(roleCount(m,'rollstand-upper-diagonal-brace'),2);
 assert.equal(roleCount(m,'rollstand-upper-end-brace'),2);
 assert.equal(roleCount(m,'rollstand-upper-cross-tie'),3);
 assert.equal(roleCount(m,'feed-upper-longitudinal-rail'),2);
 assert.equal(roleCount(m,'feed-upper-entry-brace'),2);
 assert.equal(roleCount(m,'feed-upper-end-cross-tie'),1);
 assert.match(m.root.userData.processFlow.geometryBoundary,/AMBIGUOUS_ARM_SET/i);
 assert.match(m.root.userData.processFlow.unwindArchitecture,/NO_FABRICATED_FEED_FRAME_BRIDGE/);
 const gap=boxOf(m.findNode('sheeting-unwind-bridge')).min.x-boxOf(m.findNode('sheeting-feed-frame')).max.x;
 assert.ok(gap>.02,'rollstand upper structure must preserve a visible service gap from the feed frame');
 m.dispose();
});

test('V195 preserves photo-visible arm hardware without falsely naming an independent standby station',()=>{
 const m=new SheetingMachineTemplate();
 assert.equal(roleCount(m,'loaded-reel-arm-inner'),2);
 assert.equal(roleCount(m,'loaded-reel-arm-outer'),2);
 assert.equal(roleCount(m,'parked-reel-arm-inner'),2);
 assert.equal(roleCount(m,'parked-reel-arm-outer'),2);
 assert.equal(roleCount(m,'standby-reel-arm-inner'),0);
 assert.equal(roleCount(m,'standby-reel-arm-outer'),0);
 assert.equal(roleCount(m,'vertical-hydraulic-cylinder'),4);
 assert.equal(roleCount(m,'hydraulic-piston-rod'),4);
 assert.equal(roleCount(m,'rollstand-front-control-cabinet'),1);
 assert.equal(roleCount(m,'rollstand-front-control-button'),8);
 m.dispose();
});

test('V195 unwind manifold and pressure controls retain the actual dense service hardware',()=>{
 const m=new SheetingMachineTemplate();
 assert.equal(roleCount(m,'unwind-pressure-gauge-face'),6);
 assert.equal(roleCount(m,'unwind-blue-regulator'),6);
 assert.equal(roleCount(m,'hydraulic-valve-block'),15);
 assert.equal(roleCount(m,'hydraulic-hose'),5);
 assert.equal(roleCount(m,'unwind-start-button'),1);
 assert.equal(roleCount(m,'unwind-stop-button'),1);
 assert.ok(m.findNode('sheeting-rollstand-manifold'));
 assert.ok(m.findNode('sheeting-unwind-panel'));
 assert.ok(m.findNode('sheeting-rollstand-front-controls'));
 m.dispose();
});

test('V195 adds the low turquoise entry guide roll before seven elevated guide rollers',()=>{
 const m=new SheetingMachineTemplate();
 const rollers=m.activeMeshes.filter(x=>x.userData.motion==='guide-roller');
 assert.equal(rollers.length,8);
 assert.equal(roleCount(m,'low-entry-guide-roll'),1);
 assert.equal(roleCount(m,'low-entry-roll-bearing'),2);
 assert.equal(roleCount(m,'guide-tension-roller'),7);
 const ids=new Set(rollers.map(r=>r.userData.layoutId));
 assert.deepEqual([...ids].sort(),['G1','G2','G3','G4','G5','G6','G7','LOW']);
 assert.ok(new Set(rollers.map(r=>r.userData.rotationSign)).has(-1));
 assert.ok(new Set(rollers.map(r=>r.userData.rotationSign)).has(1));
 assert.equal(roleCount(m,'roller-bearing-block'),14);
 assert.equal(roleCount(m,'feed-meter-case'),2);
 assert.equal(roleCount(m,'electrical-cabinet-body'),1);
 m.dispose();
});

test('V195 deepens the asymmetric LEXUS cutter without exposing undocumented blade geometry',()=>{
 const m=new SheetingMachineTemplate();
 assert.equal(roleCount(m,'main-cutter-cabinet'),1);
 assert.equal(roleCount(m,'intake-projecting-guard'),1);
 assert.equal(roleCount(m,'large-black-draw-roll'),1);
 assert.equal(roleCount(m,'lower-polished-entry-roll'),1);
 assert.equal(roleCount(m,'snubber-wheel'),9);
 assert.equal(roleCount(m,'top-drive-motor'),2);
 assert.equal(roleCount(m,'cutter-pressure-gauge-face'),4);
 assert.equal(roleCount(m,'cutter-blue-regulator'),4);
 assert.equal(roleCount(m,'cutter-door-hinge'),3);
 assert.equal(roleCount(m,'machine-name-plate'),1);
 assert.equal(roleCount(m,'machine-name-plaque-face'),1);
 assert.equal(roleCount(m,'cutter-side-emergency-stop'),1);
 assert.equal(roleCount(m,'cutter-warning-placard'),1);
 assert.equal(roleCount(m,'draw-roll-end-band'),2);
 assert.equal(roleCount(m,'draw-roll-service-band'),4);
 assert.equal(roleCount(m,'visible-flat-bed-blade'),0);
 assert.equal(m.findNode('sheeting-knife').userData.visibleKnifeGeometry,false);
 m.dispose();
});

test('V195 delivery grounds hold-down wheels on visible green pivot hardware',()=>{
 const m=new SheetingMachineTemplate();
 assert.ok(roleCount(m,'fast-transport-belt')>=16);
 assert.ok(roleCount(m,'slow-transport-belt')>=16);
 assert.ok(roleCount(m,'overlap-transport-belt')>=16);
 assert.equal(roleCount(m,'transport-roller'),7);
 assert.equal(roleCount(m,'hold-down-cross-shaft'),3);
 assert.equal(roleCount(m,'white-hold-down-wheel'),18);
 assert.equal(roleCount(m,'hold-down-wheel-holder'),18);
 assert.equal(roleCount(m,'hold-down-pivot-arm'),18);
 assert.equal(roleCount(m,'hold-down-pivot-pin'),18);
 assert.equal(roleCount(m,'adjustment-crossrail'),4);
 assert.equal(roleCount(m,'diamond-plate-cross-cover'),2);
 assert.ok(boxOf(m.findNode('sheeting-delivery')).getSize(new THREE.Vector3()).x>5.3);
 m.dispose();
});

test('V195 stacker carries rack scale threaded posts spring returns handwheels and end controls',()=>{
 const m=new SheetingMachineTemplate();
 assert.equal(roleCount(m,'stack-rack-bar'),2);
 assert.equal(roleCount(m,'stack-rack-tooth'),68);
 assert.equal(roleCount(m,'stack-ruler-tick'),46);
 assert.equal(roleCount(m,'stack-guide-carriage'),2);
 assert.equal(roleCount(m,'stack-guide-handwheel'),2);
 assert.equal(roleCount(m,'stack-guide-handwheel-spoke'),6);
 assert.equal(roleCount(m,'stack-guide-threaded-post'),2);
 assert.equal(roleCount(m,'stack-guide-post-cap'),2);
 assert.equal(roleCount(m,'stack-return-spring-loop'),20);
 assert.equal(roleCount(m,'stack-end-control-box'),1);
 assert.equal(roleCount(m,'stack-end-stop-button'),1);
 assert.equal(roleCount(m,'stack-end-start-button'),1);
 assert.equal(roleCount(m,'stack-light-segment'),3);
 assert.equal(m.activeMeshes.filter(x=>/^stack-jogger-/.test(x.userData.motion||'')).length,0);
 m.dispose();
});

test('V195 taxonomy remains six levels and resolves the newly verified details',()=>{
 assert.deepEqual([...new Set(SHEETING_TAXONOMY.map(n=>n.level))].sort(),[1,2,3,4,5,6]);
 const m=new SheetingMachineTemplate();
 for(const n of SHEETING_TAXONOMY){
  if(n.level>1)assert.ok(SHEETING_TAXONOMY.some(p=>p.id===n.parentId),n.id);
  assert.ok((n.meshRefs||[]).some(ref=>m.findNode(ref))||n.id==='SH',n.id);
 }
 for(const [id,node] of Object.entries({
  'SH.ROLL.SUB.BLOCK.PART.BRIDGE':'sheeting-unwind-bridge',
  'SH.ROLL.SUB.BLOCK.PART.FRONTCTRL':'sheeting-rollstand-front-controls',
  'SH.FEED.SUB.BLOCK.PART.LOW':'sheeting-feed-rollers',
  'SH.HEAD.SUB.BLOCK.PART.SERVICE':'sheeting-cutter-service-detail',
  'SH.STACK.SUB.BLOCK.PART.RACK':'sheeting-stacker-joggers',
  'SH.STACK.SUB.BLOCK.PART.ENDCTRL':'sheeting-stack-end-controls'
 }))assert.equal(m.resolveTaxonomyNode(id).userData.nodeId,node,id);
 m.dispose();
});

test('V195 simulation routes the web through low entry roll then alternating elevated rollers and draw-roll wrap',()=>{
 const m=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(m.root,m);
 assert.equal(sim.group.name,'SHEETING-PROCESS-SIMULATION-V195');
 assert.ok(SHEETING_PROCESS_STEPS.some(s=>/low entry guide roll/i.test(s)));
 assert.equal(sim.state().bladeVisible,false);
 assert.equal(sim.state().cutPulseVisible,false);
 assert.equal(sim.state().drawRollFunctional,true);
 assert.ok(sim.state().drawRollWrapDegrees>140);
 assert.ok(sim.drawRollContactPoints.length>=25);
 assert.equal(sim.state().transportMode,'V195_LOW_ENTRY_PLUS_ALTERNATING_ROLLER_WRAP_TO_MULTI_LEVEL_BELT_STACK');

 assert.equal(sim.lowEntryContactPoints.length,15);
 const low=SHEETING_ACTUAL_LAYOUT.lowEntryRoll;
 for(const p of sim.lowEntryContactPoints){
  const d=Math.hypot(p.x-low.center[0],p.y-low.center[1]);
  assert.ok(Math.abs(d-(low.radius+.018))<1e-9,'low-entry wrap must stay on contact radius');
 }
 assert.equal(sim.guideRollContactPoints.size,7);
 for(const spec of SHEETING_ACTUAL_LAYOUT.feedRollers){
  const pts=sim.guideRollContactPoints.get(spec.id);
  assert.equal(pts.length,11,spec.id+' contact arc');
  for(const p of pts){
   const d=Math.hypot(p.x-spec.center[0],p.y-spec.center[1]);
   assert.ok(Math.abs(d-(spec.radius+.016))<1e-9,spec.id+' explicit wrap must remain on roller surface');
  }
  let min=Infinity;
  for(const p of sim.preCutCurve.getPoints(1400))min=Math.min(min,Math.hypot(p.x-spec.center[0],p.y-spec.center[1]));
  assert.ok(min>=spec.radius*.88,spec.id+' spline still penetrates roller core');
 }

 const drawD=sim.preCutCurve.getPoints(900).map(p=>Math.hypot(p.x-SHEETING_ACTUAL_LAYOUT.drawRoll.center[0],p.y-SHEETING_ACTUAL_LAYOUT.drawRoll.center[1]));
 assert.ok(Math.abs(Math.min(...drawD)-sim.webContactRadius)<.040);

 const guide=m.activeMeshes.filter(x=>x.userData.motion==='guide-roller');
 const rest=guide.map(x=>x.quaternion.clone());
 const reference=m.meshes.filter(x=>x.userData.referenceStack);
 const lift=m.activeMeshes.filter(x=>x.userData.motion==='lift-table');
 const liftRest=lift.map(x=>x.position.y);
 sim.start();let now=1000;sim.update(now);
 for(let i=0;i<360;i++){now+=40;sim.update(now);}
 assert.ok(sim.state().completed>=1);
 assert.ok(guide.every((x,i)=>x.quaternion.angleTo(rest[i])>.001));
 assert.equal(sim.state().manualStackGuidesStatic,true);
 assert.equal(sim.state().cutCount,Math.floor(sim.state().webAdvance/sim.state().targetCutLength));
 sim.stop();
 assert.ok(reference.every(x=>x.visible));
 for(let i=0;i<lift.length;i++)assert.equal(lift[i].position.y,liftRest[i]);
 sim.dispose();m.dispose();
});

test('V195 keeps speculative V122 option geometry out and remains finite/grounded',()=>{
 const m=new SheetingMachineTemplate();m.root.updateMatrixWorld(true);
 for(const id of ['sheeting-slitter-v122','sheeting-knife-drive-v122','sheeting-overlap-vacuum-v122','sheeting-stack-level-v122'])assert.equal(m.findNode(id),null,id);
 for(const mesh of m.meshes){
  const b=boxOf(mesh);
  for(const v of [b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z])assert.ok(Number.isFinite(v),mesh.userData.role||mesh.name);
 }
 const sz=boxOf(m.root).getSize(new THREE.Vector3());
 assert.ok(sz.x>15&&sz.x<20);
 assert.ok(sz.y>2.9&&sz.y<4.0);
 assert.ok(sz.z>4.0&&sz.z<5.7);
 assert.ok(boxOf(m.root).min.y>-.10);
 assert.match(m.root.userData.installedOptionBoundary,/removes the unsupported rigid unwind-to-feed bridge claim/i);
 m.dispose();
});
