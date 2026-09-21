import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Media100MachineTemplate} from '../frontend/src/media100.js';
import {Media100ProcessSimulation,MEDIA100_SIMULATION_STAGES} from '../frontend/src/simulation-media100.js';
import {MEDIA100_SPEC,MEDIA100_SPEC_FGM3} from '../frontend/src/data/dimensions-media100.js';
import {media100TaxonomyFor} from '../frontend/src/data/taxonomy-media100.js';
import {MEDIA100_TECHNICAL_SOURCES} from '../frontend/src/data/sources-media100.js';

test('MEDIA100 keeps BMJ identities separate and optional kits evidence bounded',()=>{
 assert.equal(MEDIA100_SPEC.assetId,'BMJ-MCH-0016');assert.equal(MEDIA100_SPEC.serial,'0341 06903');assert.equal(MEDIA100_SPEC_FGM3.assetId,'BMJ-MCH-0018');assert.equal(MEDIA100_SPEC_FGM3.serial,'0341 142 07');
 assert.equal(MEDIA100_SPEC.workingWidthM,1);assert.equal(MEDIA100_SPEC.nominalRunSpeedMMin,300);assert.equal(MEDIA100_SPEC.inchingSpeedMMin,20);assert.equal(MEDIA100_SPEC.motorKw,11);
 assert.deepEqual(MEDIA100_SPEC.marketMinWorkingWidthReferencesM,[.056,.126]);assert.equal(MEDIA100_SPEC.installedMinWorkingWidthVerified,false);assert.equal(MEDIA100_SPEC.installedA1A2SuffixVerified,false);
 assert.equal(MEDIA100_SPEC.installedGlueHeadCountVerified,false);assert.equal(MEDIA100_SPEC.installedCornerServoPackageVerified,false);assert.equal(MEDIA100_SPEC.installedKickerVerified,false);assert.equal(MEDIA100_SPEC.installedEjectorVerified,false);assert.equal(MEDIA100_SPEC.installedControlGenerationVerified,false);
 assert.ok(MEDIA100_TECHNICAL_SOURCES.some(s=>s.authority==='primary-archive'));assert.ok(MEDIA100_TECHNICAL_SOURCES.some(s=>s.id==='MEDIA100-EVIDENCE-BOUNDARY'));
});

test('both MEDIA100 BMJ assets instantiate the family process train without claiming installation CAD',()=>{
 for(const assetId of ['BMJ-MCH-0016','BMJ-MCH-0018']){const model=new Media100MachineTemplate(assetId),box=new THREE.Box3().setFromObject(model.root);assert.equal(model.root.userData.assetId,assetId);assert.equal(model.root.userData.engineeringDimensions,false);assert.match(model.root.userData.geometryStatus,/INSTALLED_KITS_BOUNDED/);assert.ok(!box.isEmpty());assert.ok(box.min.y>=-0.01);
  for(const id of ['media100-feeder','media100-prefold','media100-forming','media100-glue','media100-final','media100-compression','media100-drive','media100-access'])assert.ok(model.findNode(id),id);
  assert.equal(model.findNode('media100-form-servo').userData.installedCornerServoPackageVerified,false);assert.equal(model.findNode('media100-glue-upper').userData.installedGlueHeadCountVerified,false);assert.equal(model.findNode('media100-final-kicker').userData.installedKickerVerified,false);assert.equal(model.findNode('media100-drive-control').userData.installedControlGenerationVerified,false);model.dispose();}
});

test('MEDIA100 rotor whitelist excludes static crossbars servo housings pressure cylinders and buttons',()=>{
 const model=new Media100MachineTemplate(),sim=new Media100ProcessSimulation(model.root,model),allowed=/^(feeder-pulley|glue-disc|glue-pump|trombone-pulley|exit-roller|main-motor|line-drive|line-shaft)$/;
 assert.equal(sim.rotors.length,26);assert.equal(sim.rotors.some(r=>!allowed.test(r.userData.mechanismRole||'')),false);
 assert.equal(model.meshes.some(m=>m.userData.rotor&&['crossbar','forming-servo','pressure-cylinder','button'].includes(m.userData.mechanismRole)),false);sim.dispose();model.dispose();
});

test('MEDIA100 continuous line supports multiple carton stages simultaneously',()=>{
 const model=new Media100MachineTemplate(),sim=new Media100ProcessSimulation(model.root,model);sim.start();sim.update(1000);sim.update(1100);const state=sim.state(),active=Object.entries(state.activeByStage).filter(([,n])=>n>0);
 assert.ok(active.length>=5,JSON.stringify(state.activeByStage));assert.equal(state.referenceJobDemoOnly,true);assert.ok(state.preBreakActive);assert.ok(state.formingActive);assert.ok(state.foldingActive);assert.ok(state.compressionActive);sim.dispose();model.dispose();
});

test('MEDIA100 folding is carton-position based rather than globally synchronized',()=>{
 const model=new Media100MachineTemplate(),sim=new Media100ProcessSimulation(model.root,model);sim.start();sim.update(1000);sim.update(1200);
 const leftAngles=sim.cartons.map(c=>Number(c.left.rotation.x.toFixed(4))),frontAngles=sim.cartons.map(c=>Number(c.front.rotation.z.toFixed(4)));
 assert.ok(new Set(leftAngles).size>=4,leftAngles.join(','));assert.ok(new Set(frontAngles).size>=3,frontAngles.join(','));
 for(const c of sim.cartons){const stage=c.lastStage;assert.equal(c.glue.visible,stage==='GLUE');if(stage==='PRESS')assert.ok(c.group.scale.z<1);}
 sim.dispose();model.dispose();
});

test('MEDIA100 glue appears only in the glue zone and can be hidden independently',()=>{
 const model=new Media100MachineTemplate(),sim=new Media100ProcessSimulation(model.root,model);sim.start();sim.update(1000);sim.update(1200);
 assert.ok(sim.cartons.some(c=>c.glue.visible));assert.equal(sim.cartons.every(c=>!c.glue.visible||c.lastStage==='GLUE'),true);
 sim.setInkFlowVisible(false);sim.update(1220);assert.equal(sim.cartons.every(c=>!c.glue.visible),true);sim.dispose();model.dispose();
});

test('MEDIA100 delivers cartons at the exit level and pause/resume does not jump time',()=>{
 const model=new Media100MachineTemplate(),sim=new Media100ProcessSimulation(model.root,model);sim.start();let now=1000;for(let i=0;i<520;i++){now+=20;sim.update(now);}assert.ok(sim.completed>0);assert.ok(sim.exitStack.some(p=>p.visible));assert.ok(sim.exitStack.filter(p=>p.visible).every(p=>p.position.y>=.83));
 const t=sim.elapsed;sim.pause();sim.update(20000);sim.resume();sim.update(30000);assert.equal(sim.elapsed,t);sim.update(30020);assert.ok(sim.elapsed-t<.03);
 sim.stop();assert.equal(sim.exitStack.every(p=>!p.visible),true);sim.dispose();model.dispose();
});

test('MEDIA100 taxonomy is a complete six-level mapped tree for FGM1 and FGM3',()=>{
 for(const assetId of ['BMJ-MCH-0016','BMJ-MCH-0018']){const taxonomy=media100TaxonomyFor(assetId);assert.deepEqual([...new Set(taxonomy.map(n=>n.level))].sort(),[1,2,3,4,5,6]);assert.equal(new Set(taxonomy.map(n=>n.id)).size,taxonomy.length);for(const n of taxonomy.filter(n=>n.level>1))assert.ok(taxonomy.some(p=>p.id===n.parentId),n.id);const model=new Media100MachineTemplate(assetId);for(const n of taxonomy.filter(n=>n.verified&&n.meshRefs.length))assert.ok(model.resolveTaxonomyNode(n.id),n.id);model.dispose();}
});

test('MEDIA100 stage order follows continuous folder-gluer process',()=>{
 assert.deepEqual(MEDIA100_SIMULATION_STAGES,['Blank separation','Feeder transport','Alignment / pre-break','Lock-bottom forming reference','Glue application reference','Final fold / trombone','Compression dwell','Delivery']);
});
