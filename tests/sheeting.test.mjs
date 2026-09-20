import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {SheetingMachineTemplate,SHEETING_VISUAL_REFERENCE} from '../frontend/src/sheeting.js';
import {SheetingProcessSimulation,SHEETING_SIMULATION_STAGES} from '../frontend/src/simulation-sheeting.js';
import {SHEETING_TAXONOMY} from '../frontend/src/data/taxonomy-sheeting.js';
import {SHEETING_TECHNICAL_SOURCES,SHEETING_ORIENTATION} from '../frontend/src/data/sources-sheeting.js';

test('V62 preserves verified BMJ identity while prioritizing HSM56 2014 visual evidence only at family level',()=>{
  assert.equal(SHEETING_VISUAL_REFERENCE.plantModel,'HSM-CTM7');
  assert.match(SHEETING_VISUAL_REFERENCE.referenceFamily,/HSM 56/);
  assert.equal(SHEETING_VISUAL_REFERENCE.processDirection,'RIGHT_TO_LEFT');
  assert.equal(SHEETING_VISUAL_REFERENCE.visualRevision,'V62_HSM56_LED_RECONSTRUCTION');
  assert.equal(SHEETING_ORIENTATION.input,'RIGHT');assert.equal(SHEETING_ORIENTATION.output,'LEFT');
  const bmj=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-BMJ-DATABASE'),bw=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-HSM56-BW'),indonesia=SHEETING_TECHNICAL_SOURCES.find(s=>s.id==='SHEETING-LEXUS-INDONESIA');
  assert.equal(bmj.confidence,'VERIFIED');assert.match(bw.type,/PRIMARY_VISUAL_FAMILY/);assert.match(bw.note,/fixed-position two-sided rollstand/i);assert.match(bw.note,/flat-bed knife/i);assert.match(indonesia.note,/conflicts with the 2014 HSM 56 fixed-rollstand brochure/i);
  assert.match(SHEETING_ORIENTATION.unwindArchitecture,/exact HSM-CTM7.*unresolved/i);assert.match(SHEETING_ORIENTATION.cutterArchitecture,/exact HSM-CTM7.*unresolved/i);
});

test('V62 Sheeting geometry follows the user-confirmed right-to-left process order',()=>{
  const model=new SheetingMachineTemplate(),ids=['sheeting-rollstand','sheeting-feed','sheeting-cutter','sheeting-delivery','sheeting-layboy'],nodes=ids.map(id=>model.findNode(id));assert.ok(nodes.every(Boolean));model.root.updateMatrixWorld(true);
  const wx=o=>o.getWorldPosition(new THREE.Vector3()).x;for(let i=1;i<nodes.length;i++)assert.ok(wx(nodes[i-1])>wx(nodes[i]),ids[i-1]+' must remain upstream of '+ids[i]);assert.equal(model.root.userData.processFlow.direction,'RIGHT_TO_LEFT');model.dispose();
});

test('V62 replaces the tandem-unwind silhouette with one fixed-position reel family reference',()=>{
  const model=new SheetingMachineTemplate(),reels=model.activeMeshes.filter(m=>m.userData.motion==='reel'),chucks=model.activeMeshes.filter(m=>m.userData.motion==='chuck');
  assert.equal(reels.length,1,'HSM56-led V62 should show one reel position, not a speculative tandem pair');assert.equal(chucks.length,2,'single reel should be held by two opposed chuck references');
  assert.ok(model.findNode('sheeting-reel'));assert.ok(model.findNode('sheeting-unwind-guide'));assert.match(model.root.userData.processFlow.unwindArchitecture,/SINGLE_FIXED_POSITION_TWO_SIDED/);model.dispose();
});

test('V62 visual anchors include enclosed cutter, narrow-belt bed and portal lift-table stacker',()=>{
  const model=new SheetingMachineTemplate();model.root.updateMatrixWorld(true);
  for(const id of ['sheeting-feed-frame','sheeting-feed-rollers','sheeting-epc','sheeting-cutter','sheeting-knife','sheeting-cutter-transport','sheeting-delivery-rollers','sheeting-overlap','sheeting-layboy'])assert.ok(model.findNode(id),id);
  const cutter=new THREE.Box3().setFromObject(model.findNode('sheeting-cutter')),delivery=new THREE.Box3().setFromObject(model.findNode('sheeting-delivery')),layboy=new THREE.Box3().setFromObject(model.findNode('sheeting-layboy'));
  assert.ok(cutter.getSize(new THREE.Vector3()).y>2.0);assert.ok(delivery.getSize(new THREE.Vector3()).x>7.0);assert.ok(layboy.getSize(new THREE.Vector3()).y>2.2);
  assert.ok(model.meshes.filter(m=>m.userData.role==='transport-belt').length>=6);assert.equal(model.meshes.filter(m=>m.userData.role==='stacker-column').length,4);model.dispose();
});

test('V62 process rollers are sparse and helper-built rollers terminate in explicit bearings',()=>{
  const model=new SheetingMachineTemplate(),processRollers=model.meshes.filter(m=>m.userData.role==='roller'),bearings=model.meshes.filter(m=>m.userData.role==='bearing');
  assert.ok(processRollers.length>=6&&processRollers.length<=12);assert.equal(bearings.length,processRollers.length*2);assert.equal(model.meshes.filter(m=>m.geometry?.type==='CylinderGeometry'&&m.userData.role==='roller'&&!m.userData.motion).length,0);model.dispose();
});

test('V62 primary module envelopes maintain service clearance and HMI does not cut through access deck',()=>{
  const model=new SheetingMachineTemplate();model.root.updateMatrixWorld(true);const box=id=>new THREE.Box3().setFromObject(model.findNode(id)),sequence=['sheeting-rollstand','sheeting-feed','sheeting-cutter'];
  for(let i=0;i<sequence.length-1;i++){const right=box(sequence[i]),left=box(sequence[i+1]);assert.equal(right.intersectsBox(left),false,sequence[i]+' collides with '+sequence[i+1]);assert.ok(right.min.x-left.max.x>=.05,sequence[i]+' needs visible X clearance from '+sequence[i+1]);}
  assert.equal(box('sheeting-access').intersectsBox(box('sheeting-control')),false);assert.ok(box('sheeting-structure').min.y>=-.001);model.dispose();
});

test('Sheeting taxonomy remains contiguous through six levels and resolves V62 physical nodes',()=>{
  assert.deepEqual([...new Set(SHEETING_TAXONOMY.map(n=>n.level))].sort(),[1,2,3,4,5,6]);assert.equal(new Set(SHEETING_TAXONOMY.map(n=>n.id)).size,SHEETING_TAXONOMY.length);
  const model=new SheetingMachineTemplate();for(const node of SHEETING_TAXONOMY){if(node.level>1)assert.ok(SHEETING_TAXONOMY.some(p=>p.id===node.parentId),node.id);assert.ok((node.meshRefs||[]).some(ref=>model.findNode(ref))||node.id==='SH',node.id+' has no mapped geometry');}
  for(const id of ['SH.ROLL.SUB.BLOCK.PART.GUIDE','SH.FEED.SUB.BLOCK.PART.EPC','SH.CUT.SUB.BLOCK.PART.KNIFE','SH.DEL.SUB.BLOCK.PART.ROLLERS','SH.DEL.SUB.BLOCK.PART.LIFT'])assert.ok(model.resolveTaxonomyNode(id),id);model.dispose();
});

test('Sheeting cutaway hides exterior covers but retains functional mechanisms',()=>{
  const model=new SheetingMachineTemplate(),covers=model.meshes.filter(m=>m.userData.exteriorCover);assert.ok(covers.length>=8);model.setExteriorOpen(true);assert.ok(covers.every(m=>m.visible===false));assert.ok(model.activeMeshes.some(m=>m.visible===true));assert.equal(model.findNode('sheeting-knife').visible,true);model.setExteriorOpen(false);assert.ok(covers.every(m=>m.visible===true));model.dispose();
});

test('V62 simulation keeps web upstream of the knife and sheets downstream to the portal stacker',()=>{
  const model=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(model.root,model);
  assert.deepEqual(SHEETING_SIMULATION_STAGES,['Fixed Rollstand / Unwind','Feed / Tension / EPC','Cross-Cut Knife','Transport / Overlap','Lift Table / Stacker']);
  const lifts=model.activeMeshes.filter(m=>m.userData.motion==='lift-table');assert.equal(lifts.length,2);const rest=lifts.map(m=>m.position.y);sim.start();let now=1000;sim.update(now);for(let i=0;i<165;i++){now+=50;sim.update(now);}
  const state=sim.state();assert.equal(state.active,true);assert.ok(state.cutCount>state.completed);assert.ok(state.completed>=1);assert.ok(state.pileSheetsVisible>=1);assert.ok(state.sheetsVisible>0);assert.ok(state.webFlowMarksVisible>0);
  assert.ok(sim.sheets.filter(s=>s.visible).every(s=>s.position.x<=1.50));assert.ok(sim.webFlowMarks.filter(s=>s.visible).every(s=>s.position.x>=1.68));
  for(let i=0;i<lifts.length;i++)assert.ok(lifts[i].position.y<rest[i]);sim.stop();for(let i=0;i<lifts.length;i++)assert.equal(lifts[i].position.y,rest[i]);sim.dispose();model.dispose();
});

test('V62 deep mesh audit rejects accidental cross-module penetration and moving/static collision',()=>{
  const model=new SheetingMachineTemplate();model.root.updateMatrixWorld(true);
  const entries=model.meshes.map(m=>{const b=new THREE.Box3().setFromObject(m),s=b.getSize(new THREE.Vector3());return {m,b,s,owner:m.userData.ownerId||'',motion:m.userData.motion||'',detail:!!m.userData.detail,role:m.userData.role||''};});
  const pair=(a,b)=>[a,b].sort().join('|'),mounted=new Set([
    pair('sheeting-feed-frame','sheeting-feed-rollers'),pair('sheeting-feed-frame','sheeting-epc'),pair('sheeting-cutter','sheeting-cutter-transport'),pair('sheeting-cutter','sheeting-knife'),
    pair('sheeting-delivery','sheeting-delivery-rollers'),pair('sheeting-delivery','sheeting-layboy'),pair('sheeting-delivery','sheeting-overlap'),pair('sheeting-rollstand','sheeting-reel'),pair('sheeting-rollstand','sheeting-unwind-guide')
  ]);
  const depth=(a,b)=>{if(!a.b.intersectsBox(b.b))return null;const min=new THREE.Vector3(Math.max(a.b.min.x,b.b.min.x),Math.max(a.b.min.y,b.b.min.y),Math.max(a.b.min.z,b.b.min.z)),max=new THREE.Vector3(Math.min(a.b.max.x,b.b.max.x),Math.min(a.b.max.y,b.b.max.y),Math.min(a.b.max.z,b.b.max.z));return max.sub(min);};
  const overlaps=[];for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){const a=entries[i],b=entries[j];if(a.owner===b.owner||a.owner==='sheeting-structure'||b.owner==='sheeting-structure'||mounted.has(pair(a.owner,b.owner)))continue;const d=depth(a,b);if(d&&d.x>.025&&d.y>.025&&d.z>.025)overlaps.push({a:a.owner,b:b.owner,roleA:a.role,roleB:b.role});}
  const activeVsStatic=[];for(const a of entries.filter(e=>!!e.motion))for(const b of entries.filter(e=>!e.motion&&e.owner!=='sheeting-structure')){if(a.m===b.m||a.owner===b.owner||mounted.has(pair(a.owner,b.owner)))continue;const d=depth(a,b);if(d&&d.x>.02&&d.y>.02&&d.z>.02)activeVsStatic.push({moving:a.owner,motion:a.motion,static:b.owner});}
  assert.deepEqual(overlaps,[]);assert.deepEqual(activeVsStatic,[]);model.dispose();
});

test('V62 low-detail and reset preserve rebuilt geometry state',()=>{
  const model=new SheetingMachineTemplate(),cutter=model.findNode('sheeting-cutter'),knife=model.findNode('sheeting-knife'),rest=cutter.position.clone(),knifeRest=knife.position.clone();
  model.setLow(true);assert.ok(model.detailMeshes.every(m=>!m.visible));model.setLow(false);assert.ok(model.detailMeshes.every(m=>m.visible));model.explode(.8,cutter);assert.deepEqual(cutter.position.toArray(),rest.toArray());assert.notDeepEqual(knife.position.toArray(),knifeRest.toArray());model.reset();assert.deepEqual(cutter.position.toArray(),rest.toArray());assert.deepEqual(knife.position.toArray(),knifeRest.toArray());model.dispose();
});
