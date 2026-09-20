import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {SheetingMachineTemplate,SHEETING_VISUAL_REFERENCE} from '../frontend/src/sheeting.js';
import {SheetingProcessSimulation,SHEETING_SIMULATION_STAGES} from '../frontend/src/simulation-sheeting.js';
import {SHEETING_TAXONOMY} from '../frontend/src/data/taxonomy-sheeting.js';
import {SHEETING_TECHNICAL_SOURCES,SHEETING_ORIENTATION,SHEETING_VISUAL_ANCHORS} from '../frontend/src/data/sources-sheeting.js';

const boxOf=o=>new THREE.Box3().setFromObject(o);
const worldX=o=>o.getWorldPosition(new THREE.Vector3()).x;

test('V67 keeps exact BMJ identity separate from HSM56 family-level geometry evidence',()=>{
  assert.equal(SHEETING_VISUAL_REFERENCE.plantModel,'HSM-CTM7');
  assert.equal(SHEETING_VISUAL_REFERENCE.visualRevision,'V67_VISIBLE_FLAT_BED_KNIFE_REFERENCE');
  assert.equal(SHEETING_VISUAL_REFERENCE.processDirection,'RIGHT_TO_LEFT');
  assert.equal(SHEETING_ORIENTATION.input,'RIGHT');assert.equal(SHEETING_ORIENTATION.output,'LEFT');
  const bmj=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-BMJ-DATABASE');
  const pdf=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-HSM56-BW-PDF');
  const image=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-HSM56-BW-FULLIMAGE');
  const mega=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-MEGAMACH-HSM-FAMILY');
  const generic=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-CUTMARK-PROCESS-COMPARISON');
  const vacuum=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-BW-VACUUM-OVERLAP');
  const maxson=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-MAXSON-MSP-PDF');
  const pasaban=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-PASABAN-CL165');
  assert.equal(bmj.confidence,'VERIFIED');
  assert.match(pdf.note,/fixed-position two-sided rollstand/i);
  assert.match(image.note,/hollow panoramic window/i);
  assert.match(image.note,/handwheel/i);
  assert.match(mega.note,/conflicts/i);
  assert.match(generic.note,/does NOT infer/i);
  assert.match(vacuum.note,/high-speed tapes/i);
  assert.match(vacuum.note,/low-speed tapes/i);
  assert.match(maxson.note,/side jogger/i);
  assert.match(maxson.note,/feed-down/i);
  assert.match(pasaban.note,/overlapping group/i);
  assert.match(SHEETING_ORIENTATION.exactModelStatus,/did not surface/i);
  assert.ok(SHEETING_VISUAL_ANCHORS.mainHead.includes('true hollow operator-side inspection aperture'));
});

test('V67 major machine sequence remains physically right-to-left with explicit gaps',()=>{
  const model=new SheetingMachineTemplate();model.root.updateMatrixWorld(true);
  const ids=['sheeting-rollstand','sheeting-feed','sheeting-cutter','sheeting-delivery','sheeting-layboy'];
  const nodes=ids.map(id=>model.findNode(id));assert.ok(nodes.every(Boolean));
  for(let i=1;i<nodes.length;i++)assert.ok(worldX(nodes[i-1])>worldX(nodes[i]),ids[i-1]+' must remain upstream of '+ids[i]);
  for(let i=0;i<nodes.length-1;i++){
    const right=boxOf(nodes[i]),left=boxOf(nodes[i+1]);
    assert.equal(right.intersectsBox(left),false,ids[i]+' collides with '+ids[i+1]);
    assert.ok(right.min.x-left.max.x>=.035,ids[i]+' lacks visible X clearance from '+ids[i+1]);
  }
  model.dispose();
});

test('V67 rollstand reproduces low reel, exposed hub and supported two-sided mechanics',()=>{
  const model=new SheetingMachineTemplate();
  assert.equal(model.activeMeshes.filter(m=>m.userData.motion==='reel').length,1);
  assert.equal(model.activeMeshes.filter(m=>m.userData.motion==='reel-core').length,1);
  assert.equal(model.activeMeshes.filter(m=>m.userData.motion==='chuck').length,2);
  assert.equal(model.meshes.filter(m=>m.userData.role==='chuck-hub').length,2);
  assert.equal(model.meshes.filter(m=>m.userData.role==='chuck-bolt').length,12);
  assert.equal(model.meshes.filter(m=>m.userData.role==='swing-arm').length,2);
  assert.equal(model.meshes.filter(m=>m.userData.role==='hydraulic-cylinder').length,2);
  assert.equal(model.meshes.filter(m=>m.userData.role==='hydraulic-rod').length,2);
  const reelBox=boxOf(model.findNode('sheeting-reel'));
  assert.ok(reelBox.min.y<=.045);
  assert.ok(reelBox.max.y<1.65);
  model.dispose();
});

test('V67 unwind guide stays inclined, sparse and fully supported',()=>{
  const model=new SheetingMachineTemplate(),frame=model.findNode('sheeting-feed-frame'),rollers=model.findNode('sheeting-feed-rollers');
  assert.ok(frame&&rollers);
  assert.equal(model.meshes.filter(m=>m.userData.role==='feed-right-post').length,2);
  assert.equal(model.meshes.filter(m=>m.userData.role==='feed-left-post').length,2);
  assert.equal(model.meshes.filter(m=>m.userData.role==='inclined-top-rail').length,2);
  assert.equal(model.meshes.filter(m=>m.userData.role==='inclined-bottom-rail').length,2);
  const rr=[];rollers.traverse(o=>{if(o.isMesh&&o.userData.role==='roller')rr.push(o);});
  assert.equal(rr.length,4);
  const bearings=[];rollers.traverse(o=>{if(o.isMesh&&o.userData.role==='bearing')bearings.push(o);});
  assert.equal(bearings.length,8);
  assert.ok(boxOf(frame).getSize(new THREE.Vector3()).y<2.25);
  model.dispose();
});

test('V67 operator-side inspection window is a real aperture instead of glass laid over a solid shell',()=>{
  const model=new SheetingMachineTemplate(),window=model.findNode('sheeting-window');
  assert.ok(window,'window must be a selectable geometry node');
  assert.equal(model.meshes.filter(m=>m.userData.role==='main-side-shell').length,0,'legacy full side shell must not return');
  assert.equal(model.meshes.filter(m=>m.userData.role==='drive-side-shell').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='operator-lower-housing').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='operator-window-jamb').length,2);
  assert.equal(model.meshes.filter(m=>m.userData.role==='operator-window-lower-sill').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='operator-window-upper-sill').length,1);
  const glass=model.meshes.filter(m=>m.userData.role==='panoramic-window');
  assert.equal(glass.length,1);assert.equal(glass[0].userData.ownerId,'sheeting-window');
  assert.equal(model.meshes.filter(m=>m.userData.role==='window-frame').length,4);
  assert.equal(model.meshes.filter(m=>m.userData.role==='window-handle').length,2);
  assert.equal(model.root.userData.processFlow.windowArchitecture,'TRUE_OPERATOR_SIDE_APERTURE__NO_OPAQUE_PANEL_BEHIND_GLASS');
  model.dispose();
});

test('V67 main head exposes a visible flat-bed knife family reference while exact HSM-CTM7 actuation remains unresolved',()=>{
  const model=new SheetingMachineTemplate();
  assert.equal(model.meshes.filter(m=>m.userData.role==='window-process-cylinder').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='process-cylinder-band').length,4);
  assert.equal(model.meshes.filter(m=>m.userData.role==='process-cylinder-endcap').length,2);
  assert.equal(model.meshes.filter(m=>m.userData.role==='window-guide-finger').length,10);
  assert.equal(model.meshes.filter(m=>m.userData.role==='diamond-service-plate').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='window-process-cylinder-dark').length,0);
  assert.match(model.root.userData.processFlow.cutterArchitecture,/FLAT_BED_KNIFE_FAMILY_REFERENCE/);
  assert.match(model.root.userData.processFlow.cutterArchitecture,/EXACT_HSM_CTM7.*UNRESOLVED/);
  const blade=model.activeMeshes.filter(m=>m.userData.motion==='flat-bed-blade-reference');
  assert.equal(blade.length,3,'carrier, blade and cutting edge must move together');
  assert.equal(model.meshes.filter(m=>m.userData.role==='visible-flat-bed-blade').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='knife-cutting-edge').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='knife-carrier').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='knife-anvil-reference').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='knife-guide-block').length,2);
  assert.equal(model.meshes.filter(m=>/cut.?to.?mark/i.test(m.userData.role||'')).length,0,'CTM acronym must not invent a sensor');
  model.dispose();
});

test('V67 outfeed exposes fast/slow/overlap transport zones plus the operator handwheel',()=>{
  const model=new SheetingMachineTemplate(),handwheel=model.findNode('sheeting-outfeed-handwheel');
  assert.ok(handwheel);
  assert.ok(model.findNode('sheeting-fast-belts'));
  assert.ok(model.findNode('sheeting-slow-belts'));
  assert.ok(model.findNode('sheeting-overlap-belts'));
  assert.equal(model.meshes.filter(m=>m.userData.role==='fast-transport-belt').length,13);
  assert.equal(model.meshes.filter(m=>m.userData.role==='slow-transport-belt').length,13);
  assert.equal(model.meshes.filter(m=>m.userData.role==='overlap-transport-belt').length,13);
  assert.equal(model.meshes.filter(m=>m.userData.role==='transport-belt').length,0);
  assert.equal(model.meshes.filter(m=>m.userData.role==='transport-roller').length,2);
  assert.equal(model.meshes.filter(m=>m.userData.role==='adjustment-rod').length,3);
  assert.equal(model.meshes.filter(m=>m.userData.role==='rod-pedestal').length,9);
  assert.equal(model.meshes.filter(m=>m.userData.role==='rod-triangular-brace').length,18);
  assert.equal(model.meshes.filter(m=>m.userData.role==='adjustment-collar').length,9);
  assert.equal(model.meshes.filter(m=>m.userData.role==='adjustment-knob').length,9);
  assert.equal(model.meshes.filter(m=>m.userData.role==='outfeed-handwheel').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='handwheel-hub').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='handwheel-spoke').length,4);
  assert.ok(boxOf(model.findNode('sheeting-delivery')).getSize(new THREE.Vector3()).x>4.3);
  model.dispose();
});

test('V67 console remains compact, low and clear of both main head and outfeed rail',()=>{
  const model=new SheetingMachineTemplate(),control=boxOf(model.findNode('sheeting-control'));
  assert.ok(control.max.y<.82);
  assert.equal(model.meshes.filter(m=>m.userData.role==='control-console-face').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='estop').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='control-button').length,2);
  assert.equal(model.meshes.filter(m=>m.userData.role==='control-lever').length,1);
  assert.equal(control.intersectsBox(boxOf(model.findNode('sheeting-cutter'))),false);
  assert.equal(control.intersectsBox(boxOf(model.findNode('sheeting-delivery'))),false);
  model.dispose();
});

test('V67 stacker reference load is a substantial supported skid stack, not a few sheet slabs',()=>{
  const model=new SheetingMachineTemplate(),tower=model.findNode('sheeting-layboy'),lift=model.findNode('sheeting-stack-lift'),reference=model.findNode('sheeting-reference-stack');
  assert.ok(tower&&lift&&reference);
  assert.equal(model.meshes.filter(m=>m.userData.role==='stacker-column').length,4);
  assert.equal(model.meshes.filter(m=>m.userData.role==='stacker-front-header').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='stacker-side-cabinet').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='lift-table').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='pallet').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='reference-paper-block').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='reference-paper-seam').length,12);
  assert.equal(model.meshes.filter(m=>m.userData.role==='reference-paper-top').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.referenceStack).length,14);
  const refBox=boxOf(reference),palletBox=boxOf(model.meshes.find(m=>m.userData.role==='pallet'));
  assert.ok(refBox.getSize(new THREE.Vector3()).y>.70);
  assert.ok(refBox.min.y>=palletBox.max.y-.02,'reference stack must sit on pallet rather than float below/above it');
  assert.ok(model.meshes.filter(m=>/stacker.*guard/.test(m.userData.role||'')).length>=20);
  assert.ok(model.findNode('sheeting-stacker-joggers'));
  assert.equal(model.meshes.filter(m=>m.userData.role==='front-stop-reference').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='back-jog-reference').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='side-jogger-reference').length,2);
  model.dispose();
});

test('V67 taxonomy stays six levels and maps window, handwheel and reference load to selectable geometry',()=>{
  assert.deepEqual([...new Set(SHEETING_TAXONOMY.map(n=>n.level))].sort(),[1,2,3,4,5,6]);
  assert.equal(new Set(SHEETING_TAXONOMY.map(n=>n.id)).size,SHEETING_TAXONOMY.length);
  const model=new SheetingMachineTemplate();
  for(const node of SHEETING_TAXONOMY){
    if(node.level>1)assert.ok(SHEETING_TAXONOMY.some(p=>p.id===node.parentId),node.id);
    assert.ok((node.meshRefs||[]).some(ref=>model.findNode(ref))||node.id==='SH',node.id+' has no mapped geometry');
  }
  for(const id of [
    'SH.HEAD.SUB.BLOCK.PART.WINDOW','SH.HEAD.SUB.BLOCK.PART.CYL',
    'SH.DEL.SUB.BLOCK.PART.FAST','SH.DEL.SUB.BLOCK.PART.SLOW','SH.DEL.SUB.BLOCK.PART.OVERLAP',
    'SH.DEL.SUB.BLOCK.PART.HANDWHEEL','SH.STACK.SUB.BLOCK.PART.JOG','SH.STACK.SUB.BLOCK.PART.LOAD'
  ])assert.ok(model.resolveTaxonomyNode(id),id);
  assert.equal(model.resolveTaxonomyNode('SH.DEL.SUB.BLOCK.PART.FAST').userData.nodeId,'sheeting-fast-belts');
  assert.equal(model.resolveTaxonomyNode('SH.DEL.SUB.BLOCK.PART.SLOW').userData.nodeId,'sheeting-slow-belts');
  assert.equal(model.resolveTaxonomyNode('SH.DEL.SUB.BLOCK.PART.OVERLAP').userData.nodeId,'sheeting-overlap-belts');
  assert.equal(model.resolveTaxonomyNode('SH.HEAD.SUB.BLOCK.PART.WINDOW').userData.nodeId,'sheeting-window');
  assert.equal(model.resolveTaxonomyNode('SH.DEL.SUB.BLOCK.PART.HANDWHEEL').userData.nodeId,'sheeting-outfeed-handwheel');
  model.dispose();
});

test('V67 cutaway opens real housings/window while retaining mechanics and stacker structure',()=>{
  const model=new SheetingMachineTemplate(),covers=model.meshes.filter(m=>m.userData.exteriorCover);
  assert.ok(covers.length>=10);
  model.setExteriorOpen(true);assert.ok(covers.every(m=>m.visible===false));
  assert.equal(model.meshes.find(m=>m.userData.role==='window-process-cylinder').visible,true);
  assert.equal(model.findNode('sheeting-overlap').visible,true);
  assert.equal(model.findNode('sheeting-stack-lift').visible,true);
  model.setExteriorOpen(false);assert.ok(covers.every(m=>m.visible===true));
  model.dispose();
});

test('V67 simulation is a continuous web -> cut -> fast/slow/overlap -> stack sequence without teleporting sheets',()=>{
  const model=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(model.root,model);
  assert.deepEqual(SHEETING_SIMULATION_STAGES,['Unwind / Continuous Web','Guide / Tension','Cross-Cut Event','Fast Tape Separation','Slow Tape / Overlap','Lift Table / Stacker']);
  const ref=model.meshes.filter(m=>m.userData.referenceStack);assert.equal(ref.length,14);assert.ok(ref.every(m=>m.visible));
  const lifts=model.activeMeshes.filter(m=>m.userData.motion==='lift-table');assert.equal(lifts.length,2);
  const process=model.activeMeshes.find(m=>m.userData.motion==='process-roller');assert.ok(process);
  const processRest=process.quaternion.clone(),liftRest=lifts.map(m=>m.position.y);
  const blades=model.activeMeshes.filter(m=>m.userData.motion==='flat-bed-blade-reference');
  assert.equal(blades.length,3);
  const bladeRest=blades.map(m=>m.position.y);
  let maxBladeStroke=0;
  const joggers=model.activeMeshes.filter(m=>/^stack-jogger-/.test(m.userData.motion||''));
  assert.equal(joggers.length,4);
  const joggerRest=joggers.map(m=>m.position.clone());
  assert.equal(sim.state().pathVisible,false,'debug centerline should be off by default');

  sim.start();assert.ok(ref.every(m=>!m.visible));
  assert.ok(sim.webRibbonSegments.length>=50);
  assert.ok(sim.webRibbonSegments.every(m=>m.visible),'continuous upstream web must be visible as a connected ribbon');
  assert.ok(sim.webFlowMarks.every(m=>m.visible),'motion stripes should remain visible independent of debug path');

  // Surface route must not pass through the centers of the four feed rollers.
  const expectedFeedClearance=[
    [6.04,1.53,.105],[5.68,1.72,.110],[5.30,1.55,.115],[4.92,1.22,.105]
  ];
  for(const [x,y,r] of expectedFeedClearance){
    let min=Infinity;
    for(const p of sim.preCutCurve.getPoints(150))min=Math.min(min,Math.hypot(p.x-x,p.y-y));
    assert.ok(min>=r*.82,'web route cuts through feed roller center at '+x);
  }

  let now=1000;sim.update(now);
  const history=new Map();
  for(let i=0;i<260;i++){
    now+=40;sim.update(now);
    maxBladeStroke=Math.max(maxBladeStroke,...blades.map((m,i)=>bladeRest[i]-m.position.y));
    for(const s of sim.sheets.filter(x=>x.visible)){
      const prev=history.get(s.userData.cutId);
      if(prev!==undefined)assert.ok(s.position.x<=prev+.035,'sheet moved backward/teleported toward input');
      history.set(s.userData.cutId,s.position.x);
      assert.ok(['FAST','SLOW','OVERLAP','LANDING'].includes(s.userData.transportZone));
    }
  }

  const state=sim.state();
  assert.equal(state.transportMode,'FAST_TO_SLOW_TO_OVERLAP');
  assert.ok(state.cutCount>state.completed);
  assert.ok(state.completed>=1);
  assert.ok(state.pileSheetsVisible>=1);
  assert.ok(state.sheetsVisible>0);
  assert.equal(state.webRibbonSegmentsVisible,sim.webRibbonSegments.length);
  assert.ok(Math.abs(sim.pile.find(s=>s.visible).position.x+4.82)<.001);
  assert.ok(process.quaternion.angleTo(processRest)>.001);
  assert.ok(maxBladeStroke>.055,'blade must visibly descend toward the web during a cut');
  assert.equal(state.bladeCount,3);
  assert.equal(state.bladeVisible,true);
  assert.ok(joggers.some((m,i)=>m.position.distanceTo(joggerRest[i])>.001),'stack alignment joggers must visibly actuate');

  // The first sheets build upward from the pallet; table lowers only after top approaches delivery target.
  const pileY=sim.pile.filter(s=>s.visible).map(s=>s.position.y);
  for(let i=1;i<pileY.length;i++)assert.ok(pileY[i]>pileY[i-1]);
  if(state.completed>12)for(let i=0;i<lifts.length;i++)assert.ok(lifts[i].position.y<liftRest[i]);

  sim.setPathVisible(false);
  assert.equal(sim.path.visible,false);
  assert.ok(sim.webRibbonSegments.every(m=>m.visible),'hiding debug path must not hide actual web');

  sim.stop();assert.ok(ref.every(m=>m.visible));
  for(let i=0;i<blades.length;i++)assert.equal(blades[i].position.y,bladeRest[i],'blade must reset after stop');
  assert.ok(sim.webRibbonSegments.every(m=>!m.visible));
  for(let i=0;i<lifts.length;i++)assert.equal(lifts[i].position.y,liftRest[i]);
  sim.dispose();model.dispose();
});

test('V67 rejects significant accidental cross-module penetration including new window and handwheel nodes',()=>{
  const model=new SheetingMachineTemplate();model.root.updateMatrixWorld(true);
  const entries=model.meshes.map(m=>({m,b:boxOf(m),owner:m.userData.ownerId||'',role:m.userData.role||''}));
  const key=(a,b)=>[a,b].sort().join('|');
  const mounted=new Set([
    key('sheeting-rollstand','sheeting-reel'),
    key('sheeting-feed-frame','sheeting-feed-rollers'),
    key('sheeting-feed-frame','sheeting-epc'),
    key('sheeting-cutter','sheeting-window'),
    key('sheeting-cutter','sheeting-main-rollers'),
    key('sheeting-window','sheeting-main-rollers'),
    key('sheeting-cutter','sheeting-knife'),
    key('sheeting-cutter','sheeting-cutter-transport'),
    key('sheeting-main-rollers','sheeting-knife'),
    key('sheeting-main-rollers','sheeting-cutter-transport'),
    key('sheeting-delivery','sheeting-fast-belts'),
    key('sheeting-delivery','sheeting-slow-belts'),
    key('sheeting-delivery','sheeting-overlap-belts'),
    key('sheeting-delivery','sheeting-delivery-rollers'),
    key('sheeting-delivery','sheeting-overlap'),
    key('sheeting-fast-belts','sheeting-delivery-rollers'),
    key('sheeting-slow-belts','sheeting-delivery-rollers'),
    key('sheeting-overlap-belts','sheeting-delivery-rollers'),
    key('sheeting-overlap-belts','sheeting-overlap'),
    key('sheeting-delivery','sheeting-outfeed-handwheel'),
    key('sheeting-layboy','sheeting-stacker-joggers'),
    key('sheeting-layboy','sheeting-stack-lift'),
    key('sheeting-stack-lift','sheeting-reference-stack'),
    key('sheeting-layboy','sheeting-reference-stack'),
    key('sheeting-layboy','sheeting-access')
  ]);
  const penetration=(a,b)=>{
    if(!a.b.intersectsBox(b.b))return null;
    const min=new THREE.Vector3(Math.max(a.b.min.x,b.b.min.x),Math.max(a.b.min.y,b.b.min.y),Math.max(a.b.min.z,b.b.min.z));
    const max=new THREE.Vector3(Math.min(a.b.max.x,b.b.max.x),Math.min(a.b.max.y,b.b.max.y),Math.min(a.b.max.z,b.b.max.z));
    return max.sub(min);
  };
  const overlaps=[];
  for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
    const a=entries[i],b=entries[j];
    if(a.owner===b.owner||a.owner==='sheeting-structure'||b.owner==='sheeting-structure'||mounted.has(key(a.owner,b.owner)))continue;
    const d=penetration(a,b);
    if(d&&d.x>.028&&d.y>.028&&d.z>.028)overlaps.push({a:a.owner,b:b.owner,roleA:a.role,roleB:b.role,penetration:d.toArray().map(v=>+v.toFixed(3))});
  }
  assert.deepEqual(overlaps,[]);
  model.dispose();
});

test('V67 low-detail, explode and reset restore selectable window/handwheel and supported reference load',()=>{
  const model=new SheetingMachineTemplate(),head=model.findNode('sheeting-cutter'),window=model.findNode('sheeting-window'),handwheel=model.findNode('sheeting-outfeed-handwheel');
  const windowRest=window.position.clone(),wheelRest=handwheel.position.clone();
  model.setLow(true);assert.ok(model.detailMeshes.every(m=>!m.visible));
  model.setLow(false);assert.ok(model.detailMeshes.every(m=>m.visible));
  model.explode(.8,head);assert.notDeepEqual(window.position.toArray(),windowRest.toArray());
  model.reset();assert.deepEqual(window.position.toArray(),windowRest.toArray());assert.deepEqual(handwheel.position.toArray(),wheelRest.toArray());
  assert.ok(model.meshes.filter(m=>m.userData.referenceStack).every(m=>m.visible));
  model.dispose();
});
