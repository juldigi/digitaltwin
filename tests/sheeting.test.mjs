import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {SheetingMachineTemplate,SHEETING_VISUAL_REFERENCE,SHEETING_ACTUAL_LAYOUT} from '../frontend/src/sheeting.js';
import {SheetingProcessSimulation,SHEETING_SIMULATION_STAGES,SHEETING_PROCESS_STEPS} from '../frontend/src/simulation-sheeting.js';
import {SHEETING_TAXONOMY} from '../frontend/src/data/taxonomy-sheeting.js';
import {SHEETING_PHOTO_REGISTRY,SHEETING_TECHNICAL_SOURCES,sheetingPhotoStats,SHEETING_ORIENTATION,SHEETING_VISUAL_ANCHORS} from '../frontend/src/data/sources-sheeting.js';

const boxOf=o=>new THREE.Box3().setFromObject(o);
const roleCount=(m,r)=>m.meshes.filter(x=>x.userData.role===r).length;

test('V194 uses the nine actual BMJ photos as primary geometry evidence',()=>{
 assert.equal(SHEETING_VISUAL_REFERENCE.plantModel,'HSM-CTM7');
 assert.equal(SHEETING_VISUAL_REFERENCE.visualRevision,'V194_BMJ_PHOTO_GEOMETRY_DEEP_PASS');
 assert.equal(SHEETING_ACTUAL_LAYOUT.direction,'RIGHT_TO_LEFT');
 assert.equal(SHEETING_PHOTO_REGISTRY.length,9);
 assert.deepEqual(sheetingPhotoStats(),{unique:9,total:9});
 assert.equal(SHEETING_ORIENTATION.input,'RIGHT');assert.equal(SHEETING_ORIENTATION.output,'LEFT');
 assert.match(SHEETING_ORIENTATION.unwindArchitecture,/long overhead beams/i);
 assert.match(SHEETING_ORIENTATION.cutterArchitecture,/large black exterior draw roll/i);
 assert.match(SHEETING_ORIENTATION.stackerArchitecture,/rack teeth/i);
 const actual=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-BMJ-PHOTOSET-20260922');
 assert.equal(actual.confidence,'VERIFIED_VISUAL');
});

test('V194 integrates rollstand and feed frame instead of floating them as isolated modules',()=>{
 const m=new SheetingMachineTemplate();
 assert.equal(m.root.userData.researchVersion,'V194');
 assert.equal(roleCount(m,'overhead-longitudinal-beam'),2);
 assert.equal(roleCount(m,'overhead-green-link'),8);
 assert.equal(roleCount(m,'overhead-cross-tie'),4);
 assert.equal(roleCount(m,'loaded-reel-arm-inner'),2);
 assert.equal(roleCount(m,'loaded-reel-arm-outer'),2);
 assert.equal(roleCount(m,'standby-reel-arm-inner'),2);
 assert.equal(roleCount(m,'standby-reel-arm-outer'),2);
 assert.equal(roleCount(m,'vertical-hydraulic-cylinder'),4);
 assert.equal(roleCount(m,'hydraulic-piston-rod'),4);
 assert.ok(m.findNode('sheeting-unwind-bridge'));
 m.dispose();
});

test('V194 unwind controls reproduce gauges regulators manifold blocks and routed hoses',()=>{
 const m=new SheetingMachineTemplate();
 assert.equal(roleCount(m,'unwind-pressure-gauge-face'),6);
 assert.equal(roleCount(m,'unwind-blue-regulator'),6);
 assert.equal(roleCount(m,'hydraulic-valve-block'),15);
 assert.equal(roleCount(m,'hydraulic-hose'),5);
 assert.equal(roleCount(m,'unwind-start-button'),1);
 assert.equal(roleCount(m,'unwind-stop-button'),1);
 assert.ok(m.findNode('sheeting-rollstand-manifold'));
 assert.ok(m.findNode('sheeting-unwind-panel'));
 m.dispose();
});

test('V194 feed roller bank is photo-matched and carries alternating kinematic signs',()=>{
 const m=new SheetingMachineTemplate();
 const rollers=m.activeMeshes.filter(x=>x.userData.motion==='guide-roller');
 assert.equal(rollers.length,7);
 assert.deepEqual(rollers.map(r=>r.userData.layoutId),SHEETING_ACTUAL_LAYOUT.feedRollers.map(r=>r.id));
 assert.deepEqual(rollers.map(r=>r.userData.rotationSign),SHEETING_ACTUAL_LAYOUT.feedRollers.map(r=>r.rotationSign));
 assert.ok(new Set(rollers.map(r=>r.userData.rotationSign)).size===2);
 assert.equal(roleCount(m,'roller-bearing-block'),14);
 assert.equal(roleCount(m,'feed-meter-case'),2);
 assert.equal(roleCount(m,'electrical-cabinet-body'),1);
 m.dispose();
});

test('V194 cutter exterior is asymmetric and contains the actual black draw roll/snubber hardware',()=>{
 const m=new SheetingMachineTemplate();
 assert.equal(roleCount(m,'main-cutter-cabinet'),1);
 assert.equal(roleCount(m,'intake-projecting-guard'),1);
 assert.equal(roleCount(m,'bend-warning-plate'),1);
 assert.equal(roleCount(m,'intake-emergency-stop'),1);
 assert.equal(roleCount(m,'inspection-panel-frame'),1);
 assert.equal(roleCount(m,'long-inspection-window'),1);
 assert.equal(roleCount(m,'lexus-brand-plate'),1);
 assert.equal(roleCount(m,'large-black-draw-roll'),1);
 assert.equal(roleCount(m,'lower-polished-entry-roll'),1);
 assert.equal(roleCount(m,'snubber-wheel'),9);
 assert.equal(roleCount(m,'top-drive-motor'),2);
 assert.equal(roleCount(m,'cutter-pressure-gauge-face'),4);
 assert.equal(roleCount(m,'cutter-blue-regulator'),4);
 assert.equal(roleCount(m,'top-display-enclosure'),1);
 assert.equal(roleCount(m,'visible-flat-bed-blade'),0);
 assert.equal(m.findNode('sheeting-knife').userData.visibleKnifeGeometry,false);
 m.dispose();
});

test('V194 delivery is multi-level with dense belts rollers hold-down wheels and covers',()=>{
 const m=new SheetingMachineTemplate();
 assert.ok(roleCount(m,'fast-transport-belt')>=16);
 assert.ok(roleCount(m,'slow-transport-belt')>=16);
 assert.ok(roleCount(m,'overlap-transport-belt')>=16);
 assert.equal(roleCount(m,'transport-roller'),7);
 assert.equal(roleCount(m,'hold-down-cross-shaft'),3);
 assert.equal(roleCount(m,'white-hold-down-wheel'),18);
 assert.equal(roleCount(m,'hold-down-wheel-holder'),18);
 assert.equal(roleCount(m,'adjustment-crossrail'),4);
 assert.equal(roleCount(m,'diamond-plate-cross-cover'),2);
 assert.ok(boxOf(m.findNode('sheeting-delivery')).getSize(new THREE.Vector3()).x>5.3);
 m.dispose();
});

test('V194 operator console is broad and carries a dense real control layout',()=>{
 const m=new SheetingMachineTemplate(),c=m.findNode('sheeting-control');
 assert.ok(boxOf(c).getSize(new THREE.Vector3()).x>1.8);
 assert.equal(roleCount(m,'operator-hmi-display'),1);
 assert.equal(roleCount(m,'operator-button-selector'),18);
 assert.equal(roleCount(m,'operator-console-stainless-lip'),1);
 m.dispose();
});

test('V194 stacker reproduces rack teeth two large handwheels guide carriages and signal tower',()=>{
 const m=new SheetingMachineTemplate();
 assert.equal(roleCount(m,'stack-side-rail'),2);
 assert.equal(roleCount(m,'stack-rack-bar'),2);
 assert.equal(roleCount(m,'stack-rack-tooth'),68);
 assert.equal(roleCount(m,'stack-guide-carriage'),2);
 assert.equal(roleCount(m,'stack-guide-handwheel'),2);
 assert.equal(roleCount(m,'stack-guide-handwheel-spoke'),6);
 assert.equal(roleCount(m,'stack-guide-plate'),2);
 assert.equal(roleCount(m,'manual-side-guide'),2);
 assert.equal(roleCount(m,'blue-pallet-block'),4);
 assert.equal(roleCount(m,'stack-light-segment'),3);
 assert.equal(m.activeMeshes.filter(x=>/^stack-jogger-/.test(x.userData.motion||'')).length,0);
 m.dispose();
});

test('V194 operator access is a continuous catwalk rather than a small floating platform',()=>{
 const m=new SheetingMachineTemplate();
 assert.equal(roleCount(m,'diamond-plate-catwalk'),1);
 assert.equal(roleCount(m,'access-step'),3);
 assert.equal(roleCount(m,'catwalk-railing-post'),6);
 assert.equal(roleCount(m,'catwalk-top-rail'),1);
 assert.equal(roleCount(m,'catwalk-mid-rail'),1);
 assert.ok(boxOf(m.findNode('sheeting-access')).getSize(new THREE.Vector3()).x>7);
 m.dispose();
});

test('V194 taxonomy remains six levels and every mapped specific part resolves to geometry',()=>{
 assert.deepEqual([...new Set(SHEETING_TAXONOMY.map(n=>n.level))].sort(),[1,2,3,4,5,6]);
 const m=new SheetingMachineTemplate();
 for(const n of SHEETING_TAXONOMY){
  if(n.level>1)assert.ok(SHEETING_TAXONOMY.some(p=>p.id===n.parentId),n.id);
  assert.ok((n.meshRefs||[]).some(ref=>m.findNode(ref))||n.id==='SH',n.id);
 }
 for(const [id,node] of Object.entries({
  'SH.ROLL.SUB.BLOCK.PART.BRIDGE':'sheeting-unwind-bridge',
  'SH.FEED.SUB.BLOCK.PART.ELECTRICAL':'sheeting-electrical-cabinet',
  'SH.HEAD.SUB.BLOCK.PART.SNUB':'sheeting-snubber-wheels',
  'SH.HEAD.SUB.BLOCK.PART.PNEU':'sheeting-cutter-pneumatic-panel',
  'SH.STACK.SUB.BLOCK.PART.RACK':'sheeting-stacker-joggers',
  'SH.STACK.SUB.BLOCK.PART.LIGHT':'sheeting-stack-light'
 }))assert.equal(m.resolveTaxonomyNode(id).userData.nodeId,node,id);
 m.dispose();
});

test('V194 simulation wraps the actual black draw roll and alternates guide roller rotation',()=>{
 const m=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(m.root,m);
 assert.deepEqual(SHEETING_SIMULATION_STAGES,[
  'Unwind / Loaded Reel','Alternating Guide / Tension Rollers','Exterior Draw Roll / Guarded Cut',
  'Fast Delivery Belts','Slow Alignment Belts','Rack-Adjusted Stack Table'
 ]);
 assert.ok(SHEETING_PROCESS_STEPS.some(s=>/opposite directions/i.test(s)));
 assert.equal(sim.state().bladeVisible,false);
 assert.equal(sim.state().cutPulseVisible,false);
 assert.equal(sim.state().drawRollFunctional,true);
 assert.ok(sim.state().drawRollWrapDegrees>140);
 assert.ok(sim.drawRollContactPoints.length>=25);

 for(const spec of SHEETING_ACTUAL_LAYOUT.feedRollers){
  let min=Infinity;
  for(const p of sim.preCutCurve.getPoints(400))min=Math.min(min,Math.hypot(p.x-spec.center[0],p.y-spec.center[1]));
  assert.ok(min>=spec.radius*.80,spec.id+' web path cuts roller center');
 }
 const drawD=sim.preCutCurve.getPoints(600).map(p=>Math.hypot(p.x-SHEETING_ACTUAL_LAYOUT.drawRoll.center[0],p.y-SHEETING_ACTUAL_LAYOUT.drawRoll.center[1]));
 assert.ok(Math.abs(Math.min(...drawD)-sim.webContactRadius)<.035);

 const guide=m.activeMeshes.filter(x=>x.userData.motion==='guide-roller');
 const rest=guide.map(x=>x.quaternion.clone());
 const reference=m.meshes.filter(x=>x.userData.referenceStack);
 const lift=m.activeMeshes.filter(x=>x.userData.motion==='lift-table');
 assert.equal(lift.length,5);
 const liftRest=lift.map(x=>x.position.y);
 sim.start();let now=1000;sim.update(now);
 for(let i=0;i<340;i++){now+=40;sim.update(now);}
 assert.ok(sim.state().completed>=1);
 const signedMoves=guide.map((x,i)=>x.quaternion.angleTo(rest[i]));
 assert.ok(signedMoves.every(v=>v>.001));
 assert.equal(sim.state().manualStackGuidesStatic,true);
 assert.equal(sim.state().cutCount,Math.floor(sim.state().webAdvance/sim.state().targetCutLength));
 sim.stop();
 assert.ok(reference.every(x=>x.visible));
 for(let i=0;i<lift.length;i++)assert.equal(lift[i].position.y,liftRest[i]);
 sim.dispose();m.dispose();
});

test('V194 keeps old speculative option geometry out of the active build and stays finite/grounded',()=>{
 const m=new SheetingMachineTemplate();m.root.updateMatrixWorld(true);
 for(const id of ['sheeting-slitter-v122','sheeting-knife-drive-v122','sheeting-overlap-vacuum-v122','sheeting-stack-level-v122'])assert.equal(m.findNode(id),null,id);
 for(const mesh of m.meshes){
  const b=boxOf(mesh);
  for(const v of [b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z])assert.ok(Number.isFinite(v),mesh.userData.role||mesh.name);
 }
 const sz=boxOf(m.root).getSize(new THREE.Vector3());
 assert.ok(sz.x>15&&sz.x<20);
 assert.ok(sz.y>2.9&&sz.y<4.0);
 assert.ok(sz.z>4.0&&sz.z<5.5);
 assert.ok(boxOf(m.root).min.y>-.10);
 m.dispose();
});
