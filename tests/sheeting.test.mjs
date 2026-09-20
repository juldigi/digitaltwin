import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {SheetingMachineTemplate,SHEETING_VISUAL_REFERENCE} from '../frontend/src/sheeting.js';
import {SheetingProcessSimulation,SHEETING_SIMULATION_STAGES} from '../frontend/src/simulation-sheeting.js';
import {SHEETING_TAXONOMY} from '../frontend/src/data/taxonomy-sheeting.js';
import {SHEETING_TECHNICAL_SOURCES,SHEETING_ORIENTATION} from '../frontend/src/data/sources-sheeting.js';

test('Sheeting identity preserves BMJ HSM-CTM7 data without promoting HSM 56 to exact variant',()=>{
  assert.equal(SHEETING_VISUAL_REFERENCE.plantModel,'HSM-CTM7');
  assert.equal(SHEETING_VISUAL_REFERENCE.referenceFamily,'LEXUS HSM 56');
  assert.equal(SHEETING_VISUAL_REFERENCE.processDirection,'RIGHT_TO_LEFT');
  assert.equal(SHEETING_ORIENTATION.input,'RIGHT');
  assert.equal(SHEETING_ORIENTATION.output,'LEFT');
  assert.ok(SHEETING_TECHNICAL_SOURCES.some(s=>s.id==='SHEETING-BMJ-DATABASE'&&s.confidence==='VERIFIED'));
  assert.ok(SHEETING_TECHNICAL_SOURCES.some(s=>s.id==='SHEETING-HSM56-BW'&&/FAMILY/i.test(s.type)));
  assert.ok(SHEETING_TECHNICAL_SOURCES.some(s=>s.id==='SHEETING-LEXUS-INDONESIA'));
  assert.ok(SHEETING_TECHNICAL_SOURCES.some(s=>s.id==='SHEETING-GREATWALL-SYNCHRO-VISUAL'));
  assert.ok(SHEETING_TECHNICAL_SOURCES.some(s=>s.id==='SHEETING-HSM56-NEAR-SERIAL'&&/00962/.test(s.note)));
  assert.match(SHEETING_ORIENTATION.cutterArchitecture,/UNRESOLVED|CONFLICT/i);
});

test('Sheeting geometry follows confirmed right-to-left process order',()=>{
  const model=new SheetingMachineTemplate();
  const roll=model.findNode('sheeting-rollstand'),feed=model.findNode('sheeting-feed'),cutter=model.findNode('sheeting-cutter'),delivery=model.findNode('sheeting-delivery'),layboy=model.findNode('sheeting-layboy');
  assert.ok(roll&&feed&&cutter&&delivery&&layboy);
  const wx=o=>o.getWorldPosition(new THREE.Vector3()).x;
  model.root.updateMatrixWorld(true);
  assert.ok(wx(roll)>wx(feed));
  assert.ok(wx(feed)>wx(cutter));
  assert.ok(wx(cutter)>wx(delivery));
  assert.ok(wx(delivery)>wx(layboy));
  assert.equal(model.root.userData.processFlow.direction,'RIGHT_TO_LEFT');
  model.dispose();
});

test('Sheeting dedicated geometry is finite, grounded and includes HSM visual anchors',()=>{
  const model=new SheetingMachineTemplate(),box=new THREE.Box3().setFromObject(model.root);
  assert.ok(!box.isEmpty());
  for(const v of [...box.min.toArray(),...box.max.toArray()])assert.ok(Number.isFinite(v));
  assert.ok(box.min.y>=-0.01,'machine geometry must remain on the floor');
  for(const id of ['sheeting-rollstand','sheeting-feed','sheeting-cutter','sheeting-knife','sheeting-cutter-transport','sheeting-delivery','sheeting-layboy','sheeting-control','sheeting-access'])assert.ok(model.findNode(id),id);
  assert.ok(model.activeMeshes.length>=20,'reel, feed, knife and delivery mechanisms should be animated');
  model.dispose();
});

test('V59 Sheeting silhouette uses double shaftless unwind, open feed bridge and compact cutter head',()=>{
  const model=new SheetingMachineTemplate();
  const roll=model.findNode('sheeting-rollstand'),feed=model.findNode('sheeting-feed'),cutter=model.findNode('sheeting-cutter'),delivery=model.findNode('sheeting-delivery'),overlap=model.findNode('sheeting-overlap');
  assert.ok(roll&&feed&&cutter&&delivery&&overlap);
  const reels=model.activeMeshes.filter(m=>m.userData.motion==='reel');
  const chucks=model.activeMeshes.filter(m=>m.userData.motion==='chuck');
  assert.equal(reels.length,2,'double unwind reference should show two reel positions');
  assert.ok(chucks.length>=4,'shaftless unwind should use opposed short chucks');
  const cutterBox=new THREE.Box3().setFromObject(cutter),feedBox=new THREE.Box3().setFromObject(feed),deliveryBox=new THREE.Box3().setFromObject(delivery);
  assert.ok((cutterBox.max.x-cutterBox.min.x)<3.0,'cutter head must remain compact, not the former oversized box');
  assert.ok((feedBox.max.y-feedBox.min.y)>1.8,'feed bridge must be visibly elevated/open');
  assert.ok((deliveryBox.max.x-deliveryBox.min.x)>5.5,'delivery/overlap section should be long and open');
  assert.equal(model.root.userData.processFlow.cutterArchitecture,'EXACT_HSM_CTM7_UNRESOLVED_PUBLIC_SOURCES_CONFLICT');
  model.dispose();
});

test('Sheeting primary unit envelopes keep physical clearance and do not overlap',()=>{
  const model=new SheetingMachineTemplate();
  model.root.updateMatrixWorld(true);
  const box=id=>new THREE.Box3().setFromObject(model.findNode(id));
  const sequence=['sheeting-rollstand','sheeting-feed','sheeting-cutter','sheeting-delivery'];
  for(let i=0;i<sequence.length-1;i++){
    const right=box(sequence[i]),left=box(sequence[i+1]);
    assert.equal(right.intersectsBox(left),false,sequence[i]+' collides with '+sequence[i+1]);
    assert.ok(right.min.x-left.max.x>=.05,sequence[i]+' needs a visible X clearance from '+sequence[i+1]);
  }
  const access=box('sheeting-access'),control=box('sheeting-control');
  assert.equal(access.intersectsBox(control),false,'HMI/control must not intersect the operator catwalk volume');
  const reels=model.activeMeshes.filter(m=>m.userData.motion==='reel').sort((a,b)=>a.position.x-b.position.x);
  assert.equal(reels.length,2);
  const r0=reels[0].geometry.parameters.radiusTop,r1=reels[1].geometry.parameters.radiusTop;
  const centerGap=Math.abs(reels[1].position.x-reels[0].position.x);
  assert.ok(centerGap-(r0+r1)>=.30,'tandem unwind reels need visible longitudinal clearance');
  model.dispose();
});

test('Sheeting taxonomy is contiguous through six levels and maps to physical nodes',()=>{
  assert.deepEqual([...new Set(SHEETING_TAXONOMY.map(n=>n.level))].sort(),[1,2,3,4,5,6]);
  assert.equal(new Set(SHEETING_TAXONOMY.map(n=>n.id)).size,SHEETING_TAXONOMY.length);
  const model=new SheetingMachineTemplate();
  for(const node of SHEETING_TAXONOMY){
    if(node.level>1)assert.ok(SHEETING_TAXONOMY.some(p=>p.id===node.parentId),node.id);
    assert.ok((node.meshRefs||[]).some(ref=>model.findNode(ref))||node.id==='SH',node.id+' has no mapped geometry');
  }
  model.dispose();
});

test('Sheeting cutaway hides exterior covers but retains process mechanisms',()=>{
  const model=new SheetingMachineTemplate();
  const covers=model.meshes.filter(m=>m.userData.exteriorCover);
  assert.ok(covers.length>8);
  model.setExteriorOpen(true);
  assert.ok(covers.every(m=>m.visible===false));
  assert.ok(model.activeMeshes.some(m=>m.visible===true));
  assert.equal(model.findNode('sheeting-knife').visible,true);
  model.setExteriorOpen(false);
  assert.ok(covers.every(m=>m.visible===true));
  model.dispose();
});

test('Sheeting simulation keeps web continuous before the knife and creates sheets only after cutting',()=>{
  const model=new SheetingMachineTemplate(),sim=new SheetingProcessSimulation(model.root,model);
  assert.deepEqual(SHEETING_SIMULATION_STAGES,['Double Shaftless Unwind','Open Feed / Tension / EPC','Cross-Cut Cutter','Overlap / Sheet Transport','Layboy / Stacker']);
  const lift=model.activeMeshes.find(m=>m.userData.motion==='lift-table');
  assert.ok(lift,'layboy lift table must be animated');
  const liftRest=lift.position.y;
  sim.start();
  let now=1000;sim.update(now);
  for(let i=0;i<150;i++){now+=50;sim.update(now);}
  const state=sim.state();
  assert.equal(state.active,true);
  assert.ok(state.cutCount>state.completed,'cut count should lead stack completion because sheets need travel time');
  assert.ok(state.completed>=1);
  assert.ok(state.pileSheetsVisible>=1);
  assert.ok(state.sheetsVisible>0);
  assert.ok(state.webFlowMarksVisible>0);
  const sheetPositions=sim.sheets.filter(s=>s.visible).map(s=>s.position.x);
  assert.ok(sheetPositions.every(x=>x<=.72),'individual sheets must exist only downstream of the compact cutter');
  const webPositions=sim.webFlowMarks.filter(s=>s.visible).map(s=>s.position.x);
  assert.ok(webPositions.every(x=>x>=.90),'continuous-web motion markers must stay upstream of the cutter');
  assert.ok(lift.position.y<liftRest,'lift table must lower as the pile grows to preserve receiving height');
  sim.stop();assert.equal(sim.state().active,false);
  assert.equal(lift.position.y,liftRest,'stopping simulation must restore the lift table');
  sim.dispose();model.dispose();
});


test('diagnostic: Sheeting mesh collision and support report',()=>{
  const model=new SheetingMachineTemplate();
  model.root.updateMatrixWorld(true);
  const entries=model.meshes.map((m,index)=>{
    const b=new THREE.Box3().setFromObject(m);
    const s=b.getSize(new THREE.Vector3());
    return {index,m,b,s,owner:m.userData.ownerId||'',motion:m.userData.motion||'',cover:!!m.userData.exteriorCover,detail:!!m.userData.detail};
  });
  const ignorePair=(a,b)=>{
    if(a.owner===b.owner)return true;
    const owners=[a.owner,b.owner].sort().join('|');
    if(owners.includes('sheeting-web-path'))return true;
    if(owners.includes('sheeting-structure'))return true;
    if(owners==='sheeting-cutter|sheeting-cutter-transport')return true;
    if(owners==='sheeting-cutter|sheeting-knife')return true;
    if(owners==='sheeting-delivery|sheeting-layboy')return true;
    if(owners==='sheeting-delivery|sheeting-overlap')return true;
    return false;
  };
  const overlaps=[];
  for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
    const a=entries[i],b=entries[j];
    if(ignorePair(a,b)||!a.b.intersectsBox(b.b))continue;
    const min=new THREE.Vector3(Math.max(a.b.min.x,b.b.min.x),Math.max(a.b.min.y,b.b.min.y),Math.max(a.b.min.z,b.b.min.z));
    const max=new THREE.Vector3(Math.min(a.b.max.x,b.b.max.x),Math.min(a.b.max.y,b.b.max.y),Math.min(a.b.max.z,b.b.max.z));
    const d=max.sub(min);
    if(d.x>.025&&d.y>.025&&d.z>.025)overlaps.push({
      a:a.owner,b:b.owner,motionA:a.motion,motionB:b.motion,
      penetration:d.toArray().map(v=>+v.toFixed(3)),
      centerA:a.b.getCenter(new THREE.Vector3()).toArray().map(v=>+v.toFixed(3)),
      centerB:b.b.getCenter(new THREE.Vector3()).toArray().map(v=>+v.toFixed(3))
    });
  }
  const floating=entries.filter(e=>{
    if(e.motion||e.owner==='sheeting-web-path')return false;
    const thin=e.s.y<.08;
    if(thin)return false;
    return e.b.min.y>.12;
  }).map(e=>({owner:e.owner,minY:+e.b.min.y.toFixed(3),size:e.s.toArray().map(v=>+v.toFixed(3)),center:e.b.getCenter(new THREE.Vector3()).toArray().map(v=>+v.toFixed(3))}));
  console.log('SHEETING_AUDIT_OVERLAPS='+JSON.stringify(overlaps.slice(0,120)));
  console.log('SHEETING_AUDIT_FLOATING='+JSON.stringify(floating.slice(0,120)));
  const activeVsStatic=[];
  for(const a of entries.filter(e=>!!e.motion)){
    for(const b of entries.filter(e=>!e.motion&&e.owner!=='sheeting-web-path')){
      if(a.m===b.m||!a.b.intersectsBox(b.b))continue;
      const min=new THREE.Vector3(Math.max(a.b.min.x,b.b.min.x),Math.max(a.b.min.y,b.b.min.y),Math.max(a.b.min.z,b.b.min.z));
      const max=new THREE.Vector3(Math.min(a.b.max.x,b.b.max.x),Math.min(a.b.max.y,b.b.max.y),Math.min(a.b.max.z,b.b.max.z));
      const d=max.sub(min);
      if(d.x>.02&&d.y>.02&&d.z>.02)activeVsStatic.push({
        movingOwner:a.owner,motion:a.motion,staticOwner:b.owner,
        penetration:d.toArray().map(v=>+v.toFixed(3)),
        movingCenter:a.b.getCenter(new THREE.Vector3()).toArray().map(v=>+v.toFixed(3)),
        staticCenter:b.b.getCenter(new THREE.Vector3()).toArray().map(v=>+v.toFixed(3))
      });
    }
  }
  const unsupported=[];
  const statics=entries.filter(e=>!e.motion&&e.owner!=='sheeting-web-path');
  for(const e of statics){
    if(e.b.min.y<=.08||e.s.y<.06||(e.detail&&e.s.y<.35))continue;
    const supported=statics.some(o=>{
      if(o===e||o.b.getCenter(new THREE.Vector3()).y>=e.b.getCenter(new THREE.Vector3()).y)return false;
      const ox=Math.min(e.b.max.x,o.b.max.x)-Math.max(e.b.min.x,o.b.min.x);
      const oz=Math.min(e.b.max.z,o.b.max.z)-Math.max(e.b.min.z,o.b.min.z);
      const vertical=o.b.max.y>=e.b.min.y-.035&&o.b.min.y<e.b.min.y;
      return ox>.018&&oz>.018&&vertical;
    });
    if(!supported)unsupported.push({
      owner:e.owner,minY:+e.b.min.y.toFixed(3),size:e.s.toArray().map(v=>+v.toFixed(3)),
      center:e.b.getCenter(new THREE.Vector3()).toArray().map(v=>+v.toFixed(3))
    });
  }
  console.log('SHEETING_AUDIT_ACTIVE_COLLISIONS='+JSON.stringify(activeVsStatic.slice(0,160)));
  console.log('SHEETING_AUDIT_UNSUPPORTED='+JSON.stringify(unsupported.slice(0,160)));
  assert.equal(overlaps.length,0,'Sheeting must have zero significant cross-owner mesh penetrations');
  assert.equal(activeVsStatic.length,0,'Sheeting moving mechanisms must not penetrate static geometry');
  assert.equal(unsupported.length,0,'Sheeting structural/detail geometry must be grounded or physically supported');
  model.dispose();
});

test('Sheeting low-detail and reset preserve dedicated geometry state',()=>{
  const model=new SheetingMachineTemplate(),cutter=model.findNode('sheeting-cutter'),knife=model.findNode('sheeting-knife');
  const rest=cutter.position.clone(),knifeRest=knife.position.clone();
  model.setLow(true);assert.ok(model.detailMeshes.every(m=>!m.visible));
  model.setLow(false);assert.ok(model.detailMeshes.every(m=>m.visible));
  model.explode(.8,cutter);assert.deepEqual(cutter.position.toArray(),rest.toArray());assert.notDeepEqual(knife.position.toArray(),knifeRest.toArray());
  model.reset();assert.deepEqual(cutter.position.toArray(),rest.toArray());assert.deepEqual(knife.position.toArray(),knifeRest.toArray());
  model.dispose();
});
