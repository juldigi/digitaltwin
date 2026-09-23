import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {SheetingMachineTemplate,SHEETING_VISUAL_REFERENCE} from '../frontend/src/sheeting.js';
import {SheetingProcessSimulation,SHEETING_SIMULATION_STAGES,SHEETING_PROCESS_STEPS} from '../frontend/src/simulation-sheeting.js';
import {SHEETING_TAXONOMY} from '../frontend/src/data/taxonomy-sheeting.js';
import {SHEETING_PHOTO_REGISTRY,SHEETING_TECHNICAL_SOURCES,SHEETING_ORIENTATION,SHEETING_VISUAL_ANCHORS} from '../frontend/src/data/sources-sheeting.js';

const boxOf=o=>new THREE.Box3().setFromObject(o);
const worldX=o=>o.getWorldPosition(new THREE.Vector3()).x;
const roleCount=(model,role)=>model.meshes.filter(m=>m.userData.role===role).length;

test('V193 makes the actual BMJ photo set primary while keeping family sources secondary',()=>{
  assert.equal(SHEETING_VISUAL_REFERENCE.plantModel,'HSM-CTM7');
  assert.equal(SHEETING_VISUAL_REFERENCE.visualRevision,'V193_BMJ_ACTUAL_PHOTO_RECONSTRUCTION');
  assert.equal(SHEETING_VISUAL_REFERENCE.processDirection,'RIGHT_TO_LEFT');
  assert.equal(SHEETING_ORIENTATION.input,'RIGHT');
  assert.equal(SHEETING_ORIENTATION.output,'LEFT');
  assert.equal(SHEETING_PHOTO_REGISTRY.length,9);
  assert.deepEqual(SHEETING_PHOTO_REGISTRY.map(p=>p.fileName),[
    'IMG_2479.HEIC','IMG_2480.HEIC','IMG_2481.HEIC','IMG_2482.HEIC','IMG_2483.HEIC',
    'IMG_2484.HEIC','IMG_2485.HEIC','IMG_2486.HEIC','IMG_2487.HEIC'
  ]);
  assert.ok(SHEETING_PHOTO_REGISTRY.every(p=>p.confidence==='PRIMARY_ACTUAL'));
  const actual=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-BMJ-PHOTOSET-20260922');
  const bmj=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-BMJ-DATABASE');
  const family=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-HSM56-BW-PDF');
  assert.equal(actual.confidence,'VERIFIED_VISUAL');
  assert.equal(bmj.confidence,'VERIFIED');
  assert.match(actual.note,/primary exterior source/i);
  assert.match(actual.note,/open multi-roller/i);
  assert.match(family.note,/family anchor/i);
  assert.match(SHEETING_ORIENTATION.cutterArchitecture,/does not expose a blade/i);
  assert.match(SHEETING_ORIENTATION.exactModelStatus,/photo set is therefore the visual source of truth/i);
  assert.ok(SHEETING_VISUAL_ANCHORS.rollstand.includes('large swept gray arms'));
  assert.ok(SHEETING_VISUAL_ANCHORS.outfeed.includes('three prominent black handwheels'));
  assert.ok(SHEETING_VISUAL_ANCHORS.stacker.includes('no invented tall mesh tower'));
});

test('V193 preserves the actual RIGHT to LEFT machine sequence without reverting to Offset-family assumptions',()=>{
  const model=new SheetingMachineTemplate();model.root.updateMatrixWorld(true);
  const ids=['sheeting-rollstand','sheeting-feed','sheeting-cutter','sheeting-delivery','sheeting-layboy'];
  const nodes=ids.map(id=>model.findNode(id));
  assert.ok(nodes.every(Boolean));
  for(let i=1;i<nodes.length;i++)assert.ok(worldX(nodes[i-1])>worldX(nodes[i]),ids[i-1]+' must remain upstream of '+ids[i]);
  assert.equal(model.root.userData.processFlow.direction,'RIGHT_TO_LEFT');
  assert.match(model.root.userData.processFlow.visualBasis,/BMJ_USER_PHOTOSET_20260922_PRIMARY/);
  assert.equal(model.root.userData.processFlow.stackerArchitecture,'ACTUAL_OPEN_LAY_TABLE__NO_V68_RIGID_TOWER');
  assert.equal(model.root.userData.primaryVisualEvidence,'BMJ_USER_PHOTOSET_20260922_IMG_2479_TO_IMG_2487');
  model.dispose();
});

test('V193 rollstand matches the actual swept-arm hydraulic architecture and alternate empty station',()=>{
  const model=new SheetingMachineTemplate();
  assert.equal(model.activeMeshes.filter(m=>m.userData.motion==='reel').length,1);
  assert.equal(model.activeMeshes.filter(m=>m.userData.motion==='reel-core').length,1);
  assert.equal(model.activeMeshes.filter(m=>m.userData.motion==='chuck').length,2);
  assert.equal(roleCount(model,'loaded-swept-arm-lower'),2);
  assert.equal(roleCount(model,'loaded-swept-arm-upper'),2);
  assert.equal(roleCount(model,'empty-swept-arm-lower'),2);
  assert.equal(roleCount(model,'empty-swept-arm-upper'),2);
  assert.equal(roleCount(model,'vertical-hydraulic-cylinder'),4);
  assert.equal(roleCount(model,'hydraulic-rod'),4);
  assert.equal(roleCount(model,'loaded-chuck-housing'),2);
  assert.equal(roleCount(model,'empty-chuck-housing'),2);
  assert.ok(model.findNode('sheeting-rollstand-manifold'));
  assert.ok(model.findNode('sheeting-unwind-panel'));
  assert.equal(roleCount(model,'unwind-control-cabinet'),1);
  assert.equal(roleCount(model,'unwind-selector'),6);
  assert.equal(roleCount(model,'unwind-indicator'),6);
  model.dispose();
});

test('V193 replaces the compact four-roller reference with the actual long open multi-roller bridge',()=>{
  const model=new SheetingMachineTemplate();
  const frame=model.findNode('sheeting-feed-frame'),rollers=model.findNode('sheeting-feed-rollers');
  assert.ok(frame&&rollers);
  assert.equal(roleCount(model,'roller-frame-upright'),4);
  assert.equal(roleCount(model,'roller-frame-top-beam'),2);
  assert.equal(roleCount(model,'roller-frame-lower-brace'),2);
  assert.equal(roleCount(model,'bridge-cross-member'),2);
  const visibleRollers=model.activeMeshes.filter(m=>m.userData.motion==='guide-roller');
  assert.equal(visibleRollers.length,8,'seven transverse rollers plus the low turquoise roller');
  assert.equal(roleCount(model,'roller-bearing-block'),14);
  assert.equal(roleCount(model,'low-turquoise-guide-roller'),1);
  const sz=boxOf(frame).getSize(new THREE.Vector3());
  assert.ok(sz.x>2.9&&sz.y>2.2,'actual roller bridge must read long and tall');
  model.dispose();
});

test('V193 cutter exterior follows the actual LEXUS cabinet and does not invent a visible knife',()=>{
  const model=new SheetingMachineTemplate();
  assert.equal(roleCount(model,'main-cutter-cabinet'),1);
  assert.equal(roleCount(model,'cutter-top-cap'),1);
  assert.equal(roleCount(model,'inspection-panel-frame'),1);
  assert.equal(roleCount(model,'long-inspection-window'),1);
  assert.equal(roleCount(model,'lexus-brand-plate'),1);
  assert.ok(model.findNode('sheeting-window'));
  assert.ok(model.findNode('sheeting-knife'));
  assert.equal(model.findNode('sheeting-knife').userData.visibleKnifeGeometry,false);
  assert.match(model.findNode('sheeting-knife').userData.evidenceBoundary,/does not render a fictional blade/i);
  assert.equal(model.activeMeshes.filter(m=>m.userData.motion==='flat-bed-blade-reference').length,0);
  assert.equal(roleCount(model,'visible-flat-bed-blade'),0);
  assert.equal(roleCount(model,'knife-cutting-edge'),0);
  assert.equal(roleCount(model,'main-draw-traction-drum'),0);
  assert.equal(roleCount(model,'main-draw-roller'),1);
  assert.ok(model.activeMeshes.filter(m=>['draw-roller','pull-roller'].includes(m.userData.motion)).length>=5);
  model.dispose();
});

test('V193 delivery reproduces dense green belts, hold-down wheels and multiple actual handwheels',()=>{
  const model=new SheetingMachineTemplate();
  assert.ok(model.findNode('sheeting-fast-belts'));
  assert.ok(model.findNode('sheeting-slow-belts'));
  assert.ok(model.findNode('sheeting-overlap-belts'));
  assert.ok(roleCount(model,'fast-transport-belt')>=15);
  assert.ok(roleCount(model,'slow-transport-belt')>=15);
  assert.ok(roleCount(model,'overlap-transport-belt')>=15);
  assert.equal(roleCount(model,'transport-roller'),4);
  assert.equal(roleCount(model,'adjustment-crossrail'),4);
  assert.equal(roleCount(model,'white-hold-down-wheel'),20);
  assert.equal(roleCount(model,'wheel-holder'),20);
  assert.equal(roleCount(model,'outfeed-handwheel'),3);
  assert.equal(roleCount(model,'handwheel-hub'),3);
  assert.equal(roleCount(model,'handwheel-spoke'),9);
  assert.ok(boxOf(model.findNode('sheeting-delivery')).getSize(new THREE.Vector3()).x>5.0);
  model.dispose();
});

test('V193 uses the broad actual delivery console instead of the old compact generic console',()=>{
  const model=new SheetingMachineTemplate(),control=model.findNode('sheeting-control');
  assert.ok(control);
  const sz=boxOf(control).getSize(new THREE.Vector3());
  assert.ok(sz.x>1.6);
  assert.equal(roleCount(model,'operator-console-face'),1);
  assert.equal(roleCount(model,'operator-display'),1);
  assert.equal(roleCount(model,'operator-button-selector'),12);
  assert.equal(roleCount(model,'control-console-face'),0);
  model.dispose();
});

test('V193 output is an open stack lay table with manual guides, not a fabricated rigid mesh tower',()=>{
  const model=new SheetingMachineTemplate();
  assert.ok(model.findNode('sheeting-layboy'));
  assert.ok(model.findNode('sheeting-stacker-joggers'));
  assert.ok(model.findNode('sheeting-stack-lift'));
  assert.ok(model.findNode('sheeting-reference-stack'));
  assert.equal(roleCount(model,'stack-table-side-rail'),2);
  assert.equal(roleCount(model,'stack-table-leg'),6);
  assert.equal(roleCount(model,'fixed-front-stop'),1);
  assert.equal(roleCount(model,'adjustable-backstop'),1);
  assert.equal(roleCount(model,'manual-side-guide'),2);
  assert.equal(roleCount(model,'stack-guide-handwheel'),2);
  assert.equal(roleCount(model,'stacker-column'),0);
  assert.equal(roleCount(model,'stacker-front-header'),0);
  assert.equal(model.meshes.filter(m=>/stacker.*guard/.test(m.userData.role||'')).length,0);
  assert.equal(model.activeMeshes.filter(m=>/^stack-jogger-/.test(m.userData.motion||'')).length,0,'manual guides must not wiggle during simulation');
  const reference=model.meshes.filter(m=>m.userData.referenceStack);
  assert.equal(reference.length,10);
  model.dispose();
});

test('V193 does not instantiate old speculative option geometry by default',()=>{
  const model=new SheetingMachineTemplate();
  for(const id of [
    'sheeting-unwind-brake-v122','sheeting-tension-control-v122','sheeting-slitter-v122',
    'sheeting-knife-drive-v122','sheeting-overlap-vacuum-v122','sheeting-count-sensor-v122','sheeting-stack-level-v122'
  ])assert.equal(model.findNode(id),null,id+' must not be visible installed hardware in V193');
  assert.match(model.root.userData.installedOptionBoundary,/not rendered as installed hardware/i);
  model.dispose();
});

test('V193 six-level taxonomy maps all specific rows to actual/selectable geometry',()=>{
  assert.deepEqual([...new Set(SHEETING_TAXONOMY.map(n=>n.level))].sort(),[1,2,3,4,5,6]);
  assert.equal(new Set(SHEETING_TAXONOMY.map(n=>n.id)).size,SHEETING_TAXONOMY.length);
  const model=new SheetingMachineTemplate();
  for(const node of SHEETING_TAXONOMY){
    if(node.level>1)assert.ok(SHEETING_TAXONOMY.some(p=>p.id===node.parentId),node.id);
    assert.ok((node.meshRefs||[]).some(ref=>model.findNode(ref))||node.id==='SH',node.id+' has no mapped geometry');
  }
  const cases={
    'SH.ROLL.SUB.BLOCK.PART.MANIFOLD':'sheeting-rollstand-manifold',
    'SH.ROLL.SUB.BLOCK.PART.PANEL':'sheeting-unwind-panel',
    'SH.HEAD.SUB.BLOCK.PART.WINDOW':'sheeting-window',
    'SH.HEAD.SUB.BLOCK.PART.KNIFE':'sheeting-knife',
    'SH.DEL.SUB.BLOCK.PART.HANDWHEEL':'sheeting-outfeed-handwheel',
    'SH.STACK.SUB.BLOCK.PART.JOG':'sheeting-stacker-joggers'
  };
  for(const [id,nodeId] of Object.entries(cases))assert.equal(model.resolveTaxonomyNode(id).userData.nodeId,nodeId,id);
  model.dispose();
});

test('V193 cutaway reveals mechanics but normal exterior retains actual cabinet guards',()=>{
  const model=new SheetingMachineTemplate(),covers=model.meshes.filter(m=>m.userData.exteriorCover);
  assert.ok(covers.length>=8);
  model.setExteriorOpen(true);
  assert.ok(covers.every(m=>m.visible===false));
  assert.equal(model.meshes.find(m=>m.userData.role==='main-draw-roller').visible,true);
  assert.equal(model.findNode('sheeting-feed-rollers').visible,true);
  assert.equal(model.findNode('sheeting-delivery-rollers').visible,true);
  model.setExteriorOpen(false);
  assert.ok(covers.every(m=>m.visible===true));
  model.dispose();
});

test('V193 simulation uses actual visible rollers and guarded cut timing without a fake blade',()=>{
  const model=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(model.root,model);
  assert.deepEqual(SHEETING_SIMULATION_STAGES,[
    'Unwind / Continuous Web','Open Roller Bank / Tension','Guarded Cross-Cut Zone',
    'Fast Belt Transport','Slow Belt / Alignment','Open Stack / Lay Table'
  ]);
  assert.ok(SHEETING_PROCESS_STEPS.some(s=>/does not expose or animate a fictional blade/i.test(s)));
  assert.equal(sim.state().bladeVisible,false);
  assert.equal(sim.state().bladeCount,0);
  assert.equal(sim.state().visibleKnifeGeometry,false);
  assert.equal(sim.state().drawDrumFunctional,false);
  assert.equal(sim.state().drawRollFunctional,true);
  assert.equal(sim.state().pathVisible,false);

  const ref=model.meshes.filter(m=>m.userData.referenceStack);
  assert.equal(ref.length,10);assert.ok(ref.every(m=>m.visible));
  const reel=model.activeMeshes.find(m=>m.userData.motion==='reel');
  const reelRest=reel.quaternion.clone();
  const contactRollers=model.activeMeshes.filter(m=>m.userData.kinematicGroup==='WEB_CONTACT');
  assert.ok(contactRollers.length>=13);
  const contactRest=contactRollers.map(m=>m.quaternion.clone());
  const lifts=model.activeMeshes.filter(m=>m.userData.motion==='lift-table');
  assert.equal(lifts.length,1);const liftRest=lifts[0].position.y;

  sim.start();
  assert.ok(ref.every(m=>!m.visible));
  assert.ok(sim.webRibbonSegments.length>=90);
  assert.ok(sim.webRibbonSegments.every(m=>m.visible));
  assert.ok(sim.webFlowMarks.every(m=>m.visible));

  let now=1000;sim.update(now);
  const history=new Map();
  for(let i=0;i<300;i++){
    now+=40;sim.update(now);
    for(const s of sim.sheets.filter(x=>x.visible)){
      const prev=history.get(s.userData.cutId);
      if(prev!==undefined)assert.ok(s.position.x<=prev+.04,'cut sheet moved backward toward input');
      history.set(s.userData.cutId,s.position.x);
      assert.ok(['FAST','SLOW','ALIGNMENT','LANDING'].includes(s.userData.transportZone));
    }
  }

  const state=sim.state();
  assert.equal(state.transportMode,'ACTUAL_OPEN_ROLLER_TO_FAST_SLOW_ALIGNMENT_STACK');
  assert.ok(state.cutCount>=1);
  assert.ok(state.completed>=1);
  assert.ok(state.pileSheetsVisible>=1);
  assert.equal(state.cutCount,Math.floor(state.webAdvance/state.targetCutLength));
  assert.ok(reel.quaternion.angleTo(reelRest)>.001);
  assert.ok(contactRollers.some((m,i)=>m.quaternion.angleTo(contactRest[i])>.001),'web-contact rollers must rotate');
  assert.ok(Math.abs(state.reelSurfaceSpeed-sim.webLinearSpeed)<1e-9);
  assert.equal(model.activeMeshes.filter(m=>m.userData.motion==='flat-bed-blade-reference').length,0);

  if(state.completed>12)assert.ok(lifts[0].position.y<liftRest);
  sim.setPathVisible(true);assert.equal(sim.path.visible,true);
  sim.setPathVisible(false);assert.equal(sim.path.visible,false);
  assert.ok(sim.webRibbonSegments.every(m=>m.visible),'debug centerline toggle must not hide actual moving web');

  sim.stop();
  assert.ok(ref.every(m=>m.visible));
  assert.ok(sim.webRibbonSegments.every(m=>!m.visible));
  assert.equal(lifts[0].position.y,liftRest);
  sim.dispose();model.dispose();
});

test('V193 all generated meshes remain finite and the actual machine silhouette stays grounded',()=>{
  const model=new SheetingMachineTemplate();model.root.updateMatrixWorld(true);
  for(const m of model.meshes){
    const b=boxOf(m);
    for(const v of [b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z])assert.ok(Number.isFinite(v),m.userData.role||m.name);
  }
  const whole=boxOf(model.root),size=whole.getSize(new THREE.Vector3());
  assert.ok(size.x>16&&size.x<22);
  assert.ok(size.z>3&&size.z<5.5);
  assert.ok(size.y>2.4&&size.y<4.0,'V68 tower-like excessive height must not return');
  assert.ok(whole.min.y>-.08,'no visible module should float far below the floor');
  model.dispose();
});
