import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {universalMachineConfig,universalTaxonomy} from '../frontend/src/universal-machine.js';
import {mechanicalProfile} from '../frontend/src/data/mechanical-profiles.js';
import {isDedicatedMachineKey,createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {ReferenceMachineTemplate,ReferenceProcessSimulation,isReferenceMachineKey} from '../frontend/src/reference-machines.js';

const referenceAssets=MACHINE_REGISTRY.filter(m=>!isDedicatedMachineKey(m.machineId));
const blockedReferenceIds=new Set(['BMJ-MCH-0004']);

test('PDS service details remain attached to covers while family process internals stay visible',()=>{
 for(const id of ['BMJ-MCH-0025','BMJ-MCH-0026','BMJ-MCH-0027','BMJ-MCH-0028']){
  const model=createMachineTemplate(id);
  try{
   const attached=model.meshes.filter(mesh=>mesh.userData.coverMountedDetail);
   assert.ok(attached.length>=1,id);
   model.setExteriorOpen(true);model.setLow(true);
   assert.ok(attached.every(mesh=>!mesh.visible),`${id} left an exterior fitting floating in cutaway`);
   const core=model.activeMeshes.length?model.activeMeshes:model.findNode('zund-gantry-beam')?.children.filter(mesh=>mesh.isMesh)||[];
   assert.ok(core.some(mesh=>mesh.visible),`${id} interior became empty`);
   model.setLow(false);
   assert.ok(attached.every(mesh=>!mesh.visible),`${id} quality switch reopened exterior fittings`);
   model.setExteriorOpen(false);
   assert.ok(attached.every(mesh=>mesh.visible),`${id} failed to restore service details`);
  }finally{model.dispose();}
 }
});

test('Zünd family material remains seated on the vacuum bed before and during hold',()=>{
 const model=createMachineTemplate('BMJ-MCH-0028'),sim=createMachineSimulation('BMJ-MCH-0028',model.root,model);
 try{
  const bed=new THREE.Box3().setFromObject(model.findNode('zund-vacuum-bed'));
  const assertContact=()=>{
   const material=new THREE.Box3().setFromObject(sim.zundMaterial);
   assert.ok(Math.abs(material.min.y-bed.max.y)<.002,`material gap or penetration: ${material.min.y-bed.max.y}`);
  };
  sim.start();sim.update(1000);assertContact();
  for(let now=1020;now<4500;now+=20)sim.update(now);
  assert.equal(sim.zund.vacuumHoldActive,true);assertContact();
  sim.stop();sim.start();assertContact();
 }finally{sim.dispose();model.dispose();}
});

test('PDS drum and capstan rotate around their installed shaft axes',()=>{
 for(const [id,key,part] of [
  ['BMJ-MCH-0025','ctp','drum'],['BMJ-MCH-0026','ctp','drum'],['BMJ-MCH-0027','imagesetter','capstan']
 ]){
  const model=createMachineTemplate(id),sim=createMachineSimulation(id,model.root,model);
  try{
   const shaft=sim[key][part],initial=shaft.quaternion.clone();
   assert.ok(shaft,id);
   const initialAxis=new THREE.Vector3(0,1,0).applyQuaternion(initial).normalize();
   sim.start();let now=1000;sim.update(now);
   while(sim.elapsed<sim.cycle*.55){now+=20;sim.update(now);}
   const rotatedAxis=new THREE.Vector3(0,1,0).applyQuaternion(shaft.quaternion).normalize();
   assert.ok(initialAxis.dot(rotatedAxis)>.999,`${id} shaft wobbles off its installed axis`);
   assert.ok(shaft.quaternion.angleTo(initial)>.01,`${id} shaft did not rotate`);
  }finally{sim.dispose();model.dispose();}
 }
});

test('all utility reference covers remove attached exterior fittings without hiding process internals',()=>{
 for(let no=29;no<=41;no++){
  const id=`BMJ-MCH-${String(no).padStart(4,'0')}`,model=createMachineTemplate(id);
  try{
   const fittings=model.meshes.filter(mesh=>mesh.userData.coverMountedDetail);
   assert.ok(fittings.length>=3,`${id} needs cover attachment metadata`);
   model.setExteriorOpen(true);model.setLow(true);
   assert.ok(fittings.every(mesh=>!mesh.visible),`${id} has floating exterior fittings`);
   const core=model.activeMeshes.filter(mesh=>!mesh.userData.referencePlaceholder&&mesh.userData.simulationEnabled!==false);
   assert.ok(core.every(mesh=>mesh.visible),`${id} hides its working internals`);
   model.setLow(false);assert.ok(fittings.every(mesh=>!mesh.visible));
   model.setExteriorOpen(false);assert.ok(fittings.every(mesh=>mesh.visible));
  }finally{model.dispose();}
 }
});

test('all 21 formerly generic assets now route to evidence-grounded reference builders',()=>{
 assert.equal(referenceAssets.length,21);
 for(const machine of referenceAssets){
  const cfg=universalMachineConfig(machine.machineId);
  assert.ok(cfg,machine.machineId);
  assert.ok(cfg.profile?.architecture.length>=5,machine.machineId);
  assert.equal(cfg.evidence.simulation,blockedReferenceIds.has(machine.machineId)?'BLOCKED':'FAMILY_PROCESS_MODEL',machine.machineId);
  assert.equal(isReferenceMachineKey(machine.machineId),true,machine.machineId);
  const model=createMachineTemplate(machine.machineId);
  assert.ok(model instanceof ReferenceMachineTemplate,machine.machineId+' did not use the V120 reference builder');
  model.dispose();
 }
});

test('every reference machine has finite non-placeholder geometry and contiguous six-level taxonomy',()=>{
 for(const machine of referenceAssets){
  const model=createMachineTemplate(machine.machineId),box=new THREE.Box3().setFromObject(model.root),tax=universalTaxonomy(machine.machineId),cfg=universalMachineConfig(machine.machineId);
  assert.ok(!box.isEmpty(),machine.machineId);
  for(const v of [...box.min.toArray(),...box.max.toArray()])assert.ok(Number.isFinite(v),machine.machineId);
  assert.ok(box.min.y>=-0.011,`${machine.machineId} below floor: ${box.min.y}`);
  assert.ok(model.meshes.length>=12,machine.machineId+' geometry is too sparse');
  assert.ok(model.activeMeshes.length>0||cfg.family==='zund',machine.machineId+' has no mechanical active elements or explicit custom process geometry');
  assert.deepEqual([...new Set(tax.map(n=>n.level))].sort(),[1,2,3,4,5,6]);
  assert.equal(new Set(tax.map(n=>n.id)).size,tax.length);
  for(const node of tax.filter(n=>n.level>1))assert.ok(tax.some(p=>p.id===node.parentId),node.id);
  for(const node of tax.filter(n=>n.meshRefs?.length)){
   for(const ref of node.meshRefs){
    if(ref==='MACHINE-UNIVERSAL')continue;
    assert.ok(model.findNode(ref),machine.machineId+' taxonomy '+node.id+' missing geometry target '+ref);
   }
  }
  model.dispose();
 }
});

test('reference cutaway retains intentional internals and simulation follows each evidence boundary',()=>{
 for(const machine of referenceAssets){
  const model=createMachineTemplate(machine.machineId);model.setExteriorOpen(true);
  const intentional=model.activeMeshes.filter(m=>!m.userData.referencePlaceholder);
  assert.ok(intentional.every(m=>m.visible),machine.machineId);
  const sim=createMachineSimulation(machine.machineId,model.root,model);
  assert.ok(sim instanceof ReferenceProcessSimulation,machine.machineId);
  const before=sim.state(),blocked=blockedReferenceIds.has(machine.machineId);
  assert.equal(before.available,!blocked,machine.machineId);assert.equal(before.blocked,blocked,machine.machineId);
  sim.start();let now=0;for(let i=0;i<40;i++){now+=100;sim.update(now);}
  const after=sim.state();
  if(blocked){assert.equal(after.active,false,machine.machineId);assert.equal(after.progress,0,machine.machineId);}
  else {assert.equal(after.active,true,machine.machineId);assert.ok(after.mechanismCount>0,machine.machineId);assert.ok(after.progress>0,machine.machineId);}
  sim.dispose();model.dispose();
 }
});

test('reference mechanical profiles carry explicit unknowns instead of pretending serial-specific accuracy',()=>{
 for(const machine of referenceAssets){
  const profile=mechanicalProfile(machine.no),cfg=universalMachineConfig(machine.machineId);
  assert.ok(profile,machine.machineId);assert.equal(cfg.profile,profile);
  assert.ok(profile.architecture.length>=5,machine.machineId);assert.ok(profile.process.length>=5,machine.machineId);
  assert.equal(profile.footprint.length,3);assert.ok(profile.unknowns.length>=1,machine.machineId);
  assert.doesNotMatch(cfg.evidence.geometry,/^PLACEHOLDER$/,machine.machineId);
  const taxonomy=universalTaxonomy(machine.machineId);
  for(const component of profile.architecture){const words=String(component).toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>3);assert.ok(taxonomy.some(node=>{const text=(String(node.name)+' '+String(node.description||'')).toLowerCase();return text===String(component).toLowerCase()||words.some(w=>text.includes(w));}),machine.machineId+' '+component);}
 }
});

test('V123 research-grounded nearest-neighbour corrections preserve machine-family identity',()=>{
 const checks=[
  ['BMJ-MCH-0004','gravure','YA1A1'],
  ['BMJ-MCH-0021','blanker','QF_LQF'],
  ['BMJ-MCH-0025','ctp','SUPRASETTER'],
  ['BMJ-MCH-0027','imagesetter','SCREEN_FTR_KATANA'],
  ['BMJ-MCH-0028','zund','ZUND_G3_S3'],
  ['BMJ-MCH-0040','ahu','SANSIN_NES']
 ];
 for(const [id,family,token] of checks){const cfg=universalMachineConfig(id),model=createMachineTemplate(id);assert.equal(cfg.family,family,id);assert.ok(cfg.evidence.geometry.includes(token),id);assert.equal(model.root.userData.referenceBuilder,'V139_RESEARCH_GROUNDED_BUILDER',id);model.dispose();}
});


test('reference simulations never animate explicitly unverified option meshes',()=>{
 for(const machine of referenceAssets){
  const model=createMachineTemplate(machine.machineId);
  const sim=createMachineSimulation(machine.machineId,model.root,model);
  for(const item of sim.motions||[]){
   assert.notEqual(item.mesh.userData.simulationEnabled,false,machine.machineId+' animated simulation-disabled mesh '+(item.mesh.userData.mechanismRole||item.mesh.name));
   assert.notEqual(item.mesh.userData.referencePlaceholder,true,machine.machineId+' animated hidden placeholder '+(item.mesh.userData.mechanismRole||item.mesh.name));
   if(item.mesh.userData.optionReference===true)assert.equal(item.mesh.userData.installedOptionVerified,true,machine.machineId+' animated unverified option '+(item.mesh.userData.mechanismRole||item.mesh.name));
  }
  sim.dispose();model.dispose();
 }
});
