import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {APM2MachineTemplate} from '../frontend/src/apm2.js';
import {APM2ProcessSimulation,APM2_SIMULATION_STAGES,APM2_PROCESS_STEPS} from '../frontend/src/simulation-apm2.js';
import {APM2_DIMENSIONS,APM2_PROCESS_SEQUENCE} from '../frontend/src/data/dimensions-apm2.js';
import {APM2_TAXONOMY,APM2_TAXONOMY_BY_ID,apm2TaxonomyStats} from '../frontend/src/data/taxonomy-apm2.js';

test('APM2 identity stays faithful to the BMJ database and does not invent a suffix',()=>{
  assert.equal(APM2_DIMENSIONS.verified.assetCode,'APM-2');
  assert.equal(APM2_DIMENSIONS.verified.model,'SP 102');
  assert.equal(APM2_DIMENSIONS.verified.serial,'57115506');
  assert.equal(APM2_DIMENSIONS.verified.functionalLocation,'PC-PK2-CON-AUT-AUTOPLAT02');
  assert.equal(APM2_DIMENSIONS.verified.year,1994);
  assert.equal(APM2_DIMENSIONS.familyReference.suffix,'UNCONFIRMED');
  assert.equal(APM2_DIMENSIONS.verified.maxSheetWidth,1.020);
  assert.equal(APM2_DIMENSIONS.verified.maxSheetLength,.720);
  assert.equal(APM2_DIMENSIONS.familyReference.maxSpeedSph,7500);
  assert.equal(APM2_DIMENSIONS.familyReference.maxCuttingForceT,250);
});

test('APM2 builds the complete SP102 process line and remains within a mobile geometry budget',()=>{
  const machine=new APM2MachineTemplate();
  for(const id of [
    'apm2-feeder','apm2-register','apm2-transport','apm2-platen','apm2-stripping','apm2-delivery',
    'apm2-drive','apm2-control','apm2-safety','apm2-register-sidelay','apm2-sidelay-drive',
    'apm2-gripper-bars','apm2-moving-platen','apm2-stripping-upper','apm2-delivery-paper-stack'
  ])assert.ok(machine.findNode(id),'missing '+id);
  assert.ok(machine.meshes.length>130,'APM2 geometry is unexpectedly sparse');
  assert.ok(machine.meshes.length<1000,'APM2 geometry exceeds mobile budget');
  assert.equal(machine.root.userData.assetId,'MACHINE-APM2');
  assert.equal(machine.root.userData.dimensionAudit.serial,'57115506');
  assert.equal(machine.root.userData.dimensionAudit.variantSuffix,'UNCONFIRMED');
  machine.dispose();
});

test('APM2 maps four front lays, a SideLay maintenance focus and fourteen gripper bars',()=>{
  const machine=new APM2MachineTemplate();
  for(let i=1;i<=4;i++)assert.ok(machine.findNode('apm2-front-lay-'+i),'missing front lay '+i);
  for(let i=1;i<=14;i++)assert.ok(machine.findNode('apm2-gripper-bar-'+i),'missing gripper bar '+i);
  const motor=machine.findNode('apm2-sidelay-drive');
  let tagged=false;motor.traverse(o=>{if(o.userData?.sideLayMotor)tagged=true;});
  assert.equal(tagged,true,'SideLay drive motor is not tagged in geometry');
  assert.ok(APM2_TAXONOMY.some(n=>n.maintenanceTag==='BMJ_Q2_2026_SIDELAY_MOTOR'),'Q2 SideLay maintenance focus missing from taxonomy');
  machine.dispose();
});

test('APM2 six-level taxonomy resolves process-critical assemblies without claiming variant-specific items as verified',()=>{
  const machine=new APM2MachineTemplate(),stats=apm2TaxonomyStats();
  assert.ok(stats.total>190,'APM2 taxonomy lacks detailed six-level coverage');
  for(let level=1;level<=6;level++)assert.ok(stats.byLevel[level]>0,'empty taxonomy level '+level);
  for(const id of [
    'APM2','APM2.FEEDER','APM2.REGISTER','APM2.TRANSPORT','APM2.PLATEN','APM2.STRIP','APM2.DELIVERY',
    'APM2.DRIVE','APM2.CONTROL','APM2.SAFETY','APM2.REGISTER.SIDE','APM2.TRANSPORT.BARS','APM2.PLATEN.MOTION'
  ])assert.ok(APM2_TAXONOMY_BY_ID.has(id),'missing taxonomy '+id);
  for(const id of [
    'APM2.REGISTER.SIDE.DRIVE','APM2.TRANSPORT.BARS.SET','APM2.PLATEN.TOOLING.CHASE',
    'APM2.STRIP.STATION.FRAMES','APM2.DELIVERY.PILE.STACK','APM2.DRIVE.MAIN.POWER'
  ])assert.ok(machine.resolveTaxonomyNode(id),'unmapped taxonomy '+id);
  const strip=APM2_TAXONOMY_BY_ID.get('APM2.STRIP.STATION');
  assert.equal(strip.confidence,'REFERENCE_ONLY','variant-specific stripping must remain reference-only');
  assert.ok(!APM2_TAXONOMY.some(n=>/SP 102 (SE|E|CER|BMA)/i.test(n.name)),'an unconfirmed SP102 suffix leaked into taxonomy');
  machine.dispose();
});

test('APM2 exterior cutaway removes guards and housings while retaining mechanism geometry',()=>{
  const machine=new APM2MachineTemplate(),covers=[];
  machine.root.traverse(o=>{if(o.isMesh&&o.userData.exteriorCover)covers.push(o);});
  assert.ok(covers.length>=15,'too few removable APM2 cover elements');
  machine.setExteriorOpen(true);
  assert.ok(covers.every(m=>!m.visible),'some exterior cover remains visible');
  for(const id of [
    'apm2-register-sidelay','apm2-gripper-bars','apm2-cutting-chase','apm2-moving-platen',
    'apm2-platen-toggle','apm2-stripping-upper','apm2-delivery-pile','apm2-main-drive'
  ])assert.equal(machine.findNode(id)?.visible,true,id+' disappeared with cutaway');
  assert.equal(machine.root.userData.interiorCutawayVisible,true);
  machine.setExteriorOpen(false);
  assert.ok(covers.every(m=>m.visible),'exterior did not restore');
  machine.dispose();
});

test('APM2 geometry is finite, grounded and does not contain floating process modules',()=>{
  const machine=new APM2MachineTemplate();machine.root.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(machine.root),size=box.getSize(new THREE.Vector3());
  assert.ok(size.x>5.5&&size.x<7.2,'unexpected APM2 length '+size.x);
  assert.ok(size.y>1.9&&size.y<2.6,'unexpected APM2 height '+size.y);
  assert.ok(size.z>2.0&&size.z<3.5,'unexpected APM2 width '+size.z);
  for(const mesh of machine.meshes){
    const b=new THREE.Box3().setFromObject(mesh);
    for(const value of [b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z])assert.ok(Number.isFinite(value),'non-finite APM2 geometry');
    assert.ok(b.min.y>-.05,'geometry floats below machine floor: '+(mesh.userData.ownerId||mesh.name));
  }
  const platen=new THREE.Box3().setFromObject(machine.findNode('apm2-platen-frame'));
  const moving=new THREE.Box3().setFromObject(machine.findNode('apm2-moving-platen'));
  assert.ok(moving.min.x>=platen.min.x-.05&&moving.max.x<=platen.max.x+.05,'moving platen leaves platen frame envelope');
  assert.ok(moving.min.z>=platen.min.z-.05&&moving.max.z<=platen.max.z+.05,'moving platen floats outside side frames');
  machine.dispose();
});

test('APM2 simulation runs feeder, SideLay, platen, stripping and delivery pile accumulation',()=>{
  const machine=new APM2MachineTemplate(),sim=new APM2ProcessSimulation(machine.root,machine);
  assert.deepEqual(APM2_PROCESS_SEQUENCE.map(x=>x.key),['FEEDER','REGISTER','TRANSPORT','PLATEN','STRIP','DELIVERY']);
  assert.equal(APM2_SIMULATION_STAGES[0],'Pile Feeder');
  assert.equal(APM2_SIMULATION_STAGES.at(-1),'Non-stop Delivery');
  assert.equal(APM2_PROCESS_STEPS.length,7);
  assert.ok(sim.rotors.length>=5,'too few APM2 rotating mechanisms');
  assert.ok(sim.oscillators.length>=4,'SideLay/platen/stripping/suction motion missing');

  const side=machine.findNode('apm2-register-sidelay'),platen=machine.findNode('apm2-moving-platen'),strip=machine.findNode('apm2-stripping-upper');
  const side0=side.position.clone(),platen0=platen.position.clone(),strip0=strip.position.clone();

  sim.start();sim.update(0);
  let pileSeen=false,sideMoved=false,platenMoved=false,stripMoved=false;
  for(let ms=16;ms<=18000;ms+=16){
    sim.update(ms);
    pileSeen ||= sim.state().pileSheetsVisible>0;
    sideMoved ||= side.position.distanceTo(side0)>.001;
    platenMoved ||= platen.position.distanceTo(platen0)>.001;
    stripMoved ||= strip.position.distanceTo(strip0)>.001;
  }
  assert.equal(sideMoved,true,'SideLay never moved');
  assert.equal(platenMoved,true,'platen pressure stroke never moved');
  assert.equal(stripMoved,true,'stripping frame never moved');
  assert.equal(pileSeen,true,'delivery pile never accumulated sheets');
  assert.ok(sim.state().completed>0,'no APM2 sheet completed a cycle');
  assert.equal(sim.state().uvLampCount,0);
  assert.equal(sim.state().inkFlowCount,0);
  sim.stop();assert.equal(sim.state().pileSheetsVisible,0);
  assert.ok(side.position.distanceTo(side0)<1e-9);
  assert.ok(platen.position.distanceTo(platen0)<1e-9);
  assert.ok(strip.position.distanceTo(strip0)<1e-9);
  sim.dispose();machine.dispose();
});
