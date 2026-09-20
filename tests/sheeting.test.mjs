import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {SheetingMachineTemplate,SHEETING_VISUAL_REFERENCE} from '../frontend/src/sheeting.js';
import {SheetingProcessSimulation,SHEETING_SIMULATION_STAGES} from '../frontend/src/simulation-sheeting.js';
import {SHEETING_TAXONOMY} from '../frontend/src/data/taxonomy-sheeting.js';
import {SHEETING_TECHNICAL_SOURCES,SHEETING_ORIENTATION} from '../frontend/src/data/sources-sheeting.js';

test('V63 preserves BMJ identity and separates exact facts from family geometry evidence',()=>{
  assert.equal(SHEETING_VISUAL_REFERENCE.plantModel,'HSM-CTM7');
  assert.equal(SHEETING_VISUAL_REFERENCE.visualRevision,'V63_BWPHOTO_ANCHOR_RECONSTRUCTION');
  assert.equal(SHEETING_VISUAL_REFERENCE.processDirection,'RIGHT_TO_LEFT');
  assert.equal(SHEETING_ORIENTATION.input,'RIGHT');assert.equal(SHEETING_ORIENTATION.output,'LEFT');
  const bmj=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-BMJ-DATABASE');
  const bw=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-HSM56-BW');
  const mega=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-MEGAMACH-HSM-FAMILY');
  const indo=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-LEXUS-INDONESIA');
  assert.equal(bmj.confidence,'VERIFIED');
  assert.match(bw.type,/PRIMARY_VISUAL_FAMILY/);assert.match(bw.note,/panoramic window/i);assert.match(bw.note,/narrow-belt outfeed/i);
  assert.match(mega.note,/rotary/i);assert.match(mega.note,/conflicts/i);
  assert.match(indo.note,/exact model is not stated/i);
  assert.match(SHEETING_ORIENTATION.cutterArchitecture,/conflict/i);
});

test('V63 process order is right-to-left from reel to stacker',()=>{
  const model=new SheetingMachineTemplate();
  const ids=['sheeting-rollstand','sheeting-feed','sheeting-cutter','sheeting-delivery','sheeting-layboy'];
  const nodes=ids.map(id=>model.findNode(id));assert.ok(nodes.every(Boolean));model.root.updateMatrixWorld(true);
  const wx=o=>o.getWorldPosition(new THREE.Vector3()).x;
  for(let i=1;i<nodes.length;i++)assert.ok(wx(nodes[i-1])>wx(nodes[i]),ids[i-1]+' must remain upstream of '+ids[i]);
  assert.equal(model.root.userData.processFlow.direction,'RIGHT_TO_LEFT');
  model.dispose();
});

test('V63 rollstand matches the brochure anchor: one low reel, two opposed chucks and no tandem reel',()=>{
  const model=new SheetingMachineTemplate();
  const reels=model.activeMeshes.filter(m=>m.userData.motion==='reel');
  const chucks=model.activeMeshes.filter(m=>m.userData.motion==='chuck');
  assert.equal(reels.length,1);assert.equal(chucks.length,2);
  const reelBox=new THREE.Box3().setFromObject(model.findNode('sheeting-reel'));
  assert.ok(reelBox.min.y<.12,'paper reel should sit low, not float high above the chassis');
  assert.ok(reelBox.max.y<1.70,'paper reel is vertically exaggerated');
  assert.ok(model.meshes.filter(m=>m.userData.role==='swing-arm').length===2);
  assert.ok(model.meshes.filter(m=>m.userData.sourceAnchor==='BW-HSM56-ROLLSTAND-PHOTO').length>=3);
  model.dispose();
});

test('V63 raised web frame is sparse, supported and visually separated from the main head',()=>{
  const model=new SheetingMachineTemplate();model.root.updateMatrixWorld(true);
  assert.ok(model.findNode('sheeting-feed-frame'));assert.ok(model.findNode('sheeting-feed-rollers'));assert.ok(model.findNode('sheeting-epc'));
  const rollers=model.findNode('sheeting-feed-rollers');
  const processRollers=[];rollers.traverse(o=>{if(o.isMesh&&o.userData.role==='roller')processRollers.push(o);});
  assert.equal(processRollers.length,4,'V63 feed path should not regress to excessive random rollers');
  const bearings=[];rollers.traverse(o=>{if(o.isMesh&&o.userData.role==='bearing')bearings.push(o);});
  assert.equal(bearings.length,8);
  const feedBox=new THREE.Box3().setFromObject(model.findNode('sheeting-feed'));
  const headBox=new THREE.Box3().setFromObject(model.findNode('sheeting-cutter'));
  assert.ok(feedBox.min.x-headBox.max.x>=.04,'feed frame and main head are still visually crowded');
  model.dispose();
});

test('V63 main head reproduces the photographed panoramic window and large cylindrical process elements',()=>{
  const model=new SheetingMachineTemplate(),head=model.findNode('sheeting-cutter'),process=model.findNode('sheeting-main-rollers');
  assert.ok(head&&process);
  assert.equal(model.meshes.filter(m=>m.userData.role==='panoramic-window').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='window-process-cylinder').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='window-process-cylinder-dark').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='process-cylinder-ring').length,4);
  const cylinders=model.meshes.filter(m=>/window-process-cylinder/.test(m.userData.role||''));
  assert.ok(cylinders.every(m=>m.userData.sourceAnchor==='BW-HSM56-MAIN-HEAD-PHOTO'));
  const headBox=new THREE.Box3().setFromObject(head);
  assert.ok(headBox.getSize(new THREE.Vector3()).y>2.0);
  assert.match(model.root.userData.processFlow.cutterArchitecture,/UNRESOLVED/);
  model.dispose();
});

test('V63 outfeed uses many longitudinal belts but only two prominent transverse transport rollers',()=>{
  const model=new SheetingMachineTemplate();
  assert.ok(model.findNode('sheeting-delivery'));assert.ok(model.findNode('sheeting-delivery-rollers'));assert.ok(model.findNode('sheeting-overlap'));
  assert.equal(model.meshes.filter(m=>m.userData.role==='transport-belt').length,9);
  assert.equal(model.meshes.filter(m=>m.userData.role==='transport-roller').length,2);
  assert.equal(model.meshes.filter(m=>m.userData.role==='adjustment-rod').length,5);
  assert.equal(model.meshes.filter(m=>m.userData.role==='adjustment-collar').length,15);
  const outfeed=new THREE.Box3().setFromObject(model.findNode('sheeting-delivery'));
  assert.ok(outfeed.getSize(new THREE.Vector3()).x>4.3);
  model.dispose();
});

test('V63 stacker is a rigid tower with flat lift table and pallet, not a detached open portal',()=>{
  const model=new SheetingMachineTemplate(),tower=model.findNode('sheeting-layboy'),lift=model.findNode('sheeting-stack-lift');
  assert.ok(tower&&lift);
  assert.equal(model.meshes.filter(m=>m.userData.role==='stacker-column').length,4);
  assert.equal(model.meshes.filter(m=>m.userData.role==='stacker-upper-housing').length,2);
  assert.ok(model.meshes.filter(m=>m.userData.role==='stacker-guard-horizontal').length>=10);
  assert.equal(model.meshes.filter(m=>m.userData.role==='lift-table').length,1);
  assert.equal(model.meshes.filter(m=>m.userData.role==='pallet').length,1);
  const towerBox=new THREE.Box3().setFromObject(tower),liftBox=new THREE.Box3().setFromObject(lift);
  assert.ok(towerBox.getSize(new THREE.Vector3()).y>2.4);
  assert.ok(liftBox.min.x>towerBox.min.x&&liftBox.max.x<towerBox.max.x);
  assert.ok(liftBox.min.z>towerBox.min.z&&liftBox.max.z<towerBox.max.z);
  model.dispose();
});

test('V63 operator controls are a compact low console and access is localized',()=>{
  const model=new SheetingMachineTemplate(),control=new THREE.Box3().setFromObject(model.findNode('sheeting-control')),access=new THREE.Box3().setFromObject(model.findNode('sheeting-access'));
  assert.ok(control.max.y<.90,'old detached tall HMI pedestal has returned');
  assert.ok(access.getSize(new THREE.Vector3()).x<1.6,'operator access regressed into an unsupported long catwalk');
  assert.ok(access.min.y>=-.001);
  assert.equal(model.meshes.filter(m=>m.userData.role==='control-console-face').length,1);
  model.dispose();
});

test('V63 main unit envelopes retain explicit physical clearance',()=>{
  const model=new SheetingMachineTemplate();model.root.updateMatrixWorld(true);
  const box=id=>new THREE.Box3().setFromObject(model.findNode(id));
  const sequence=['sheeting-rollstand','sheeting-feed','sheeting-cutter','sheeting-delivery','sheeting-layboy'];
  for(let i=0;i<sequence.length-1;i++){
    const right=box(sequence[i]),left=box(sequence[i+1]);
    assert.equal(right.intersectsBox(left),false,sequence[i]+' collides with '+sequence[i+1]);
    assert.ok(right.min.x-left.max.x>=.04,sequence[i]+' lacks visible X clearance from '+sequence[i+1]);
  }
  const control=box('sheeting-control'),head=box('sheeting-cutter');
  assert.equal(control.intersectsBox(head),false,'compact control console penetrates the main head');
  model.dispose();
});

test('V63 taxonomy stays contiguous through six levels and maps every branch to real geometry',()=>{
  assert.deepEqual([...new Set(SHEETING_TAXONOMY.map(n=>n.level))].sort(),[1,2,3,4,5,6]);
  assert.equal(new Set(SHEETING_TAXONOMY.map(n=>n.id)).size,SHEETING_TAXONOMY.length);
  const model=new SheetingMachineTemplate();
  for(const node of SHEETING_TAXONOMY){
    if(node.level>1)assert.ok(SHEETING_TAXONOMY.some(p=>p.id===node.parentId),node.id);
    assert.ok((node.meshRefs||[]).some(ref=>model.findNode(ref))||node.id==='SH',node.id+' has no mapped geometry');
  }
  for(const id of ['SH.CUT.SUB.BLOCK.PART.CYL','SH.DEL.SUB.BLOCK.PART.ADJ','SH.STACK.SUB.BLOCK.PART.LIFT'])assert.ok(model.resolveTaxonomyNode(id),id);
  model.dispose();
});

test('V63 cutaway removes housings/windows but keeps photographed process cylinders and lift mechanisms',()=>{
  const model=new SheetingMachineTemplate(),covers=model.meshes.filter(m=>m.userData.exteriorCover);
  assert.ok(covers.length>=8);
  model.setExteriorOpen(true);assert.ok(covers.every(m=>m.visible===false));
  assert.ok(model.meshes.filter(m=>/window-process-cylinder/.test(m.userData.role||'')).every(m=>m.visible));
  assert.equal(model.findNode('sheeting-stack-lift').visible,true);
  model.setExteriorOpen(false);assert.ok(covers.every(m=>m.visible===true));
  model.dispose();
});

test('V63 simulation follows the rebuilt web path and deposits sheets inside the stacker tower',()=>{
  const model=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(model.root,model);
  assert.deepEqual(SHEETING_SIMULATION_STAGES,['Fixed Rollstand / Unwind','Raised Web Guide / Tension','Windowed Main Head / Cross-Cut','Belt Outfeed / Adjustment','Lift Table / Stacker']);
  const lifts=model.activeMeshes.filter(m=>m.userData.motion==='lift-table');assert.equal(lifts.length,2);
  const rest=lifts.map(m=>m.position.y);sim.start();let now=1000;sim.update(now);for(let i=0;i<165;i++){now+=50;sim.update(now);}
  const state=sim.state();assert.equal(state.active,true);assert.ok(state.cutCount>state.completed);assert.ok(state.completed>=1);assert.ok(state.pileSheetsVisible>=1);assert.ok(state.sheetsVisible>0);assert.ok(state.webFlowMarksVisible>0);
  assert.ok(sim.sheets.filter(s=>s.visible).every(s=>s.position.x<=2.15),'cut sheets appear upstream of the cross-cut zone');
  assert.ok(sim.webFlowMarks.filter(s=>s.visible).every(s=>s.position.x>=2.25),'continuous web appears downstream of the cross-cut zone');
  const pileX=sim.pile.find(s=>s.visible)?.position.x;assert.ok(Math.abs(pileX+4.72)<.001);
  for(let i=0;i<lifts.length;i++)assert.ok(lifts[i].position.y<rest[i]);
  sim.stop();for(let i=0;i<lifts.length;i++)assert.equal(lifts[i].position.y,rest[i]);
  sim.dispose();model.dispose();
});

test('V63 rejects significant accidental cross-owner mesh penetration outside intentional mounted relationships',()=>{
  const model=new SheetingMachineTemplate();model.root.updateMatrixWorld(true);
  const entries=model.meshes.map(m=>({m,b:new THREE.Box3().setFromObject(m),owner:m.userData.ownerId||'',role:m.userData.role||'',motion:m.userData.motion||''}));
  const key=(a,b)=>[a,b].sort().join('|');
  const mounted=new Set([
    key('sheeting-rollstand','sheeting-reel'),
    key('sheeting-feed-frame','sheeting-feed-rollers'),
    key('sheeting-feed-frame','sheeting-epc'),
    key('sheeting-cutter','sheeting-main-rollers'),
    key('sheeting-cutter','sheeting-knife'),
    key('sheeting-cutter','sheeting-cutter-transport'),
    key('sheeting-main-rollers','sheeting-knife'),
    key('sheeting-main-rollers','sheeting-cutter-transport'),
    key('sheeting-delivery','sheeting-delivery-rollers'),
    key('sheeting-delivery','sheeting-overlap'),
    key('sheeting-layboy','sheeting-stack-lift')
  ]);
  const depth=(a,b)=>{
    if(!a.b.intersectsBox(b.b))return null;
    const min=new THREE.Vector3(Math.max(a.b.min.x,b.b.min.x),Math.max(a.b.min.y,b.b.min.y),Math.max(a.b.min.z,b.b.min.z));
    const max=new THREE.Vector3(Math.min(a.b.max.x,b.b.max.x),Math.min(a.b.max.y,b.b.max.y),Math.min(a.b.max.z,b.b.max.z));
    return max.sub(min);
  };
  const overlaps=[];
  for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
    const a=entries[i],b=entries[j];
    if(a.owner===b.owner||a.owner==='sheeting-structure'||b.owner==='sheeting-structure'||mounted.has(key(a.owner,b.owner)))continue;
    const d=depth(a,b);if(d&&d.x>.025&&d.y>.025&&d.z>.025)overlaps.push({a:a.owner,b:b.owner,roleA:a.role,roleB:b.role,penetration:d.toArray().map(v=>+v.toFixed(3))});
  }
  assert.deepEqual(overlaps,[]);
  model.dispose();
});

test('V63 low-detail and reset preserve photo-anchored geometry state',()=>{
  const model=new SheetingMachineTemplate(),head=model.findNode('sheeting-cutter'),process=model.findNode('sheeting-main-rollers'),rest=head.position.clone(),processRest=process.position.clone();
  model.setLow(true);assert.ok(model.detailMeshes.every(m=>!m.visible));
  model.setLow(false);assert.ok(model.detailMeshes.every(m=>m.visible));
  model.explode(.8,head);assert.deepEqual(head.position.toArray(),rest.toArray());assert.notDeepEqual(process.position.toArray(),processRest.toArray());
  model.reset();assert.deepEqual(head.position.toArray(),rest.toArray());assert.deepEqual(process.position.toArray(),processRest.toArray());
  model.dispose();
});
