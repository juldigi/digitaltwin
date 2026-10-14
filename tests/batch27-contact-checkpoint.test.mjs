import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

test('SCREEN output lands on existing reference tray and unproved rigid film route stays hidden',()=>{
 const t=createMachineTemplate('BMJ-MCH-0027'),s=createMachineSimulation('BMJ-MCH-0027',t.root,t);
 try{
  s.start();assert.equal(s.imagesetterMedia.visible,false);
  for(const p of [.05,.2,.45,.7,.8]){s.elapsed=p*s.cycle;s.updateImagesetter();assert.equal(s.imagesetterMedia.visible,false);assert.equal(s.imagesetter.interlockSafe,true);}
  s.elapsed=.99*s.cycle;s.updateImagesetter();t.root.updateMatrixWorld(true);
  let tray;t.root.traverse(m=>{if(m.userData.mechanismRole==='output-cassette-family-reference')tray=m;});
  const support=new T.Box3().setFromObject(tray),film=new T.Box3().setFromObject(s.imagesetterMedia);
  assert.ok(Math.abs(film.min.y-support.max.y)<1e-6);
  const point=s.imagesetterMedia.getWorldPosition(new T.Vector3());point.y=film.min.y;
  const hit=new T.Raycaster(point.clone().add(new T.Vector3(0,.05,0)),new T.Vector3(0,-1,0)).intersectObject(tray)[0];
  assert.ok(hit&&hit.point.distanceTo(point)<1e-6,'output must contact an actual tray triangle');
  assert.ok(film.min.x>=support.min.x&&film.max.x<=support.max.x);
  assert.equal(s.imagesetterMedia.visible,true);s.stop();assert.equal(s.imagesetterMedia.visible,false);
 }finally{s.dispose();t.dispose();}
});

test('Zund ports stay flush and module carrier follows carriage throughout XY travel and reset',()=>{
 const t=createMachineTemplate('BMJ-MCH-0028'),s=createMachineSimulation('BMJ-MCH-0028',t.root,t);
 try{
  s.start();t.root.updateMatrixWorld(true);
  const bed=t.findNode('zund-vacuum-bed'),support=new T.Box3().setFromObject(bed);
  assert.ok(Math.abs(support.max.y-.6475)<1e-6);
  assert.ok(Math.abs(new T.Box3().setFromObject(s.zundMaterial).min.y-support.max.y)<1e-6);
  const point=s.zundMaterial.getWorldPosition(new T.Vector3());point.y-=.009;
  const hit=new T.Raycaster(point.clone().add(new T.Vector3(0,.05,0)),new T.Vector3(0,-1,0)).intersectObject(bed,true)[0];
  assert.ok(hit&&hit.point.distanceTo(point)<1e-6,'material must contact a bed triangle');
  const relative=s.zund.slots.position.clone().sub(s.zund.carriage.position);
  for(let p=.22;p<.82;p+=.025){s.elapsed=p*s.cycle;s.updateZund();assert.ok(s.zund.slots.position.clone().sub(s.zund.carriage.position).distanceTo(relative)<1e-8);assert.equal(s.zund.toolActionActive,false);}
  s.stop();assert.ok(s.zund.slots.position.distanceTo(s.zund.slotsRest)<1e-8);
 }finally{s.dispose();t.dispose();}
});

test('Compressor distribution toggle cannot reveal an unverified plant network in normal mode',()=>{
 for(const id of ['BMJ-MCH-0029','BMJ-MCH-0030','BMJ-MCH-0031','BMJ-MCH-0032','BMJ-MCH-0033','BMJ-MCH-0034','BMJ-MCH-0035']){
  const t=createMachineTemplate(id),s=createMachineSimulation(id,t.root,t),g=t.findNode('compressor-air-distribution');
  try{
   s.setPathVisible(true);assert.equal(g.visible,false);
   s.start();s.elapsed=.6*s.cycle;s.updateCompressor();
   assert.equal(s.state().distributionAirParticleCount,0);
   assert.ok(s.compressorParticles.filter(p=>p.kind==='distribution').every(p=>!s.compressorParticleVisible(p)));
   t.setExteriorOpen(true);assert.equal(g.visible,true);assert.equal(s.state().distributionAirParticleCount,s.compressorParticles.filter(p=>p.kind==='distribution'&&p.mesh.visible).length);
   s.setPathVisible(false);t.setLow(true);t.setExteriorOpen(false);t.setExteriorOpen(true);assert.equal(g.visible,false);
   s.setPathVisible(true);t.setLow(false);assert.equal(g.visible,true);
   t.setExteriorOpen(false);s.setPathVisible(true);assert.equal(g.visible,false);
  }finally{s.dispose();t.dispose();}
 }
});

test('Batch27 specific-part highlight ghost and showOnly preserve descendants without material bleed',()=>{
 for(const id of ['BMJ-MCH-0027','BMJ-MCH-0028','BMJ-MCH-0029']){
  const t=createMachineTemplate(id);
  try{
   const chosen=t.meshes.find(m=>m.material.userData.surfaceKind==='steel'&&!m.userData.exteriorCover);
   t.highlight(chosen);assert.notEqual(chosen.material.emissive.getHex(),0);
   assert.ok(t.meshes.filter(m=>m!==chosen).every(m=>m.material.emissive.getHex()===0));
   t.ghost(true,chosen);assert.equal(chosen.material.opacity,1);assert.ok(t.meshes.filter(m=>m!==chosen).every(m=>m.material.opacity===.14));
   t.reset();const unit=t.findNode('universal-module-1');t.showOnly([unit],true);
   assert.ok(t.nodes.filter(n=>t.contains(unit,n)).every(n=>n.visible));
  }finally{t.dispose();}
 }
});
