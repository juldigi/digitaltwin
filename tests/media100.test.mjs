import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Media100MachineTemplate} from '../frontend/src/media100.js';
import {Media100ProcessSimulation,MEDIA100_SIMULATION_STAGES} from '../frontend/src/simulation-media100.js';
import {MEDIA100_SPEC,MEDIA100_SPEC_FGM3} from '../frontend/src/data/dimensions-media100.js';
import {media100TaxonomyFor} from '../frontend/src/data/taxonomy-media100.js';
import {MEDIA100_TECHNICAL_SOURCES,media100TechnicalSourcesFor} from '../frontend/src/data/sources-media100.js';

test('MEDIA100 keeps BMJ identities separate and optional kits evidence bounded',()=>{
 assert.equal(MEDIA100_SPEC.assetId,'BMJ-MCH-0016');assert.equal(MEDIA100_SPEC.serial,'0341 06903');assert.equal(MEDIA100_SPEC_FGM3.assetId,'BMJ-MCH-0018');assert.equal(MEDIA100_SPEC_FGM3.serial,'0341 142 07');
 assert.equal(MEDIA100_SPEC.workingWidthM,1);assert.equal(MEDIA100_SPEC.nominalRunSpeedMMin,300);assert.equal(MEDIA100_SPEC.inchingSpeedMMin,20);assert.equal(MEDIA100_SPEC.motorKw,11);
 assert.deepEqual(MEDIA100_SPEC.marketMinWorkingWidthReferencesM,[.056,.126]);assert.equal(MEDIA100_SPEC.installedMinWorkingWidthVerified,false);assert.equal(MEDIA100_SPEC.installedA1A2SuffixVerified,false);
 assert.equal(MEDIA100_SPEC.installedGlueHeadCountVerified,false);assert.equal(MEDIA100_SPEC.installedCornerServoPackageVerified,false);assert.equal(MEDIA100_SPEC.installedKickerVerified,false);assert.equal(MEDIA100_SPEC.installedEjectorVerified,false);assert.equal(MEDIA100_SPEC.installedControlGenerationVerified,false);
 assert.ok(MEDIA100_TECHNICAL_SOURCES.some(s=>s.authority==='primary-archive'));assert.ok(MEDIA100_TECHNICAL_SOURCES.some(s=>s.id==='MEDIA100-EVIDENCE-BOUNDARY'));
});

test('MEDIA100 BMJ site records stay isolated to the selected asset',()=>{
 for(const [assetId,expected,rejected] of [['BMJ-MCH-0016','BMJ-ASSET-REGISTRY-FGM1','BMJ-ASSET-REGISTRY-FGM3'],['BMJ-MCH-0018','BMJ-ASSET-REGISTRY-FGM3','BMJ-ASSET-REGISTRY-FGM1']]){
  const sources=media100TechnicalSourcesFor(assetId),model=new Media100MachineTemplate(assetId);
  assert.ok(sources.some(source=>source.id===expected),assetId);
  assert.equal(sources.some(source=>source.id===rejected),false,assetId);
  assert.deepEqual(model.root.userData.sources,sources,assetId);
  model.dispose();
 }
});

test('both MEDIA100 BMJ assets instantiate the family process train without claiming installation CAD',()=>{
 for(const assetId of ['BMJ-MCH-0016','BMJ-MCH-0018']){const model=new Media100MachineTemplate(assetId),box=new THREE.Box3().setFromObject(model.root);assert.equal(model.root.userData.assetId,assetId);assert.equal(model.root.userData.engineeringDimensions,false);assert.match(model.root.userData.geometryStatus,/INSTALLED_KITS_BOUNDED/);assert.ok(!box.isEmpty());assert.ok(box.min.y>=-0.01);
  for(const id of ['media100-feeder','media100-prefold','media100-forming','media100-glue','media100-final','media100-compression','media100-drive','media100-access'])assert.ok(model.findNode(id),id);
  const placards=[];model.root.traverse(o=>{if(o.userData?.identityPlacard)placards.push(o);});assert.equal(placards.length,1);assert.equal(placards[0].userData.identityPlacard.serial,model.spec.serial);
  assert.equal(model.findNode('media100-form-servo').userData.installedCornerServoPackageVerified,false);assert.equal(model.findNode('media100-glue-upper').userData.installedGlueHeadCountVerified,false);assert.equal(model.findNode('media100-final-kicker').userData.installedKickerVerified,false);assert.equal(model.findNode('media100-drive-control').userData.installedControlGenerationVerified,false);model.dispose();}
});

test('unverified MEDIA100 conversion hardware stays out of the installed silhouette',()=>{
 const model=new Media100MachineTemplate();for(const id of ['media100-form-servo','media100-form-bottom','media100-glue-lower','media100-glue-pump','media100-final-kicker'])model.findNode(id).traverse(o=>{if(o.isMesh){assert.equal(o.visible,false,id);assert.equal(o.userData.capabilityOnly,true,id);}});
 const upper=model.findNode('media100-glue-upper'),heads=upper.children.filter(o=>o.userData.glueHeadPosition);assert.equal(heads.length,3);assert.ok(heads.every(o=>!o.visible&&o.userData.capabilityOnly));
 model.reset();assert.ok(heads.every(o=>!o.visible));model.dispose();
});

test('MEDIA100 selection effects are mesh-local and preserve capability-hidden hardware',()=>{
 const model=new Media100MachineTemplate(),feed=model.findNode('media100-feeder'),press=model.findNode('media100-compression');
 assert.equal(new Set(model.meshes.map(m=>m.material)).size,model.meshes.length,'mutable display materials must not leak between parts');
 model.highlight(feed);const feedMesh=model.meshes.find(m=>model.contains(feed,m)),pressMesh=model.meshes.find(m=>model.contains(press,m));
 assert.ok(feedMesh.material.emissiveIntensity>0);assert.equal(pressMesh.material.emissiveIntensity,0);
 model.ghost(true,feed);assert.equal(feedMesh.material.opacity,1);assert.equal(pressMesh.material.opacity,.14);model.ghost(false);
 model.isolate(feed,true);assert.equal(feed.visible,true);assert.equal(press.visible,false);model.isolate(null,false);
 model.setLow(true);model.setExteriorOpen(true);model.setLow(false);model.setExteriorOpen(false);
 for(const id of ['media100-form-bottom','media100-glue-lower','media100-glue-pump'])model.findNode(id).traverse(o=>{if(o.isMesh)assert.equal(o.visible,false,id);});
 model.dispose();
});

test('MEDIA100 carton route maintains functional contact from pile through belts, compression and exit',()=>{
 const model=new Media100MachineTemplate(),sim=new Media100ProcessSimulation(model.root,model);
 assert.ok(sim.points[0].y<=.76&&sim.points[1].y<.80,'pickup route must not float above the feeder pile and belt');
 for(const i of [2,3,4])assert.ok(sim.points[i].y>=.782&&sim.points[i].y<=.795,`belt contact ${i}`);
 const lower=[],upper=[],upperNode=model.findNode('media100-press-upper');model.findNode('media100-press-belts').traverse(o=>{if(o.isMesh&&o.userData.compressionBelt)(model.contains(upperNode,o)?upper:lower).push(o);});
 const lowerTop=Math.max(...lower.map(m=>new THREE.Box3().setFromObject(m).max.y)),upperBottom=Math.min(...upper.map(m=>new THREE.Box3().setFromObject(m).min.y));
 assert.ok(sim.points[6].y-.009<=lowerTop+.006,'carton bottom must meet lower compression belt');
 assert.ok(sim.points[6].y+.009>=upperBottom-.006,'carton top must meet upper compression belt');
 assert.ok(sim.points[7].y>=.93&&sim.points[7].y<=.95,'exit route must follow exit roller crown');
 sim.dispose();model.dispose();
});

test('MEDIA100 rotor whitelist excludes static crossbars servo housings pressure cylinders and buttons',()=>{
 const model=new Media100MachineTemplate(),sim=new Media100ProcessSimulation(model.root,model),allowed=/^(feeder-pulley|glue-disc|glue-pump|trombone-pulley|exit-roller|main-motor|line-drive|line-shaft)$/;
 assert.equal(sim.rotors.length,26);assert.equal(sim.rotors.some(r=>!allowed.test(r.userData.mechanismRole||'')),false);
 assert.equal(model.meshes.some(m=>m.userData.rotor&&['crossbar','forming-servo','pressure-cylinder','button'].includes(m.userData.mechanismRole)),false);sim.dispose();model.dispose();
});

test('MEDIA100 continuous line supports multiple carton stages simultaneously',()=>{
 const model=new Media100MachineTemplate(),sim=new Media100ProcessSimulation(model.root,model);sim.start();sim.update(1000);sim.update(1100);assert.equal(sim.completed,0);assert.equal(sim.exitStack.some(p=>p.visible),false);for(let now=1200;now<=8500;now+=100)sim.update(now);const state=sim.state(),active=Object.entries(state.activeByStage).filter(([,n])=>n>0);
 assert.ok(active.length>=5,JSON.stringify(state.activeByStage));assert.equal(state.referenceJobDemoOnly,true);assert.ok(state.preBreakActive);assert.ok(state.formingActive);assert.ok(state.foldingActive);assert.ok(state.compressionActive);sim.dispose();model.dispose();
});

test('MEDIA100 folding is carton-position based rather than globally synchronized',()=>{
 const model=new Media100MachineTemplate(),sim=new Media100ProcessSimulation(model.root,model);sim.start();sim.update(1000);for(let now=1100;now<=8200;now+=100)sim.update(now);
 const leftAngles=sim.cartons.map(c=>Number(c.left.rotation.x.toFixed(4))),frontAngles=sim.cartons.map(c=>Number(c.front.rotation.z.toFixed(4)));
 assert.ok(new Set(leftAngles).size>=4,leftAngles.join(','));assert.ok(frontAngles.every(a=>a===0),frontAngles.join(','));assert.ok(sim.cartons.every(c=>c.rear.rotation.z===0));
 for(const c of sim.cartons){const stage=c.lastStage;assert.equal(c.glue.visible,['GLUE','FINAL','PRESS','DELIVERY'].includes(stage));assert.equal(c.group.scale.z,1);}
 sim.dispose();model.dispose();
});

test('MEDIA100 glue stays on the blank after application and can be hidden independently',()=>{
 const model=new Media100MachineTemplate(),sim=new Media100ProcessSimulation(model.root,model);sim.start();sim.update(1000);for(let now=1100;now<=6200;now+=100)sim.update(now);
 assert.ok(sim.cartons.some(c=>c.glue.visible));assert.equal(sim.cartons.every(c=>!c.glue.visible||['GLUE','FINAL','PRESS','DELIVERY'].includes(c.lastStage)),true);
 sim.setInkFlowVisible(false);sim.update(6220);assert.equal(sim.cartons.every(c=>!c.glue.visible),true);sim.dispose();model.dispose();
});

test('MEDIA100 delivers cartons at the exit level and pause/resume does not jump time',()=>{
 const model=new Media100MachineTemplate(),sim=new Media100ProcessSimulation(model.root,model);sim.start();let now=1000;for(let i=0;i<520;i++){now+=20;sim.update(now);}assert.ok(sim.completed>0);assert.ok(sim.exitStack.some(p=>p.visible));assert.ok(sim.exitStack.filter(p=>p.visible).every(p=>p.position.y>=.945));
 const t=sim.elapsed;sim.pause();sim.update(20000);sim.resume();sim.update(30000);assert.equal(sim.elapsed,t);sim.update(30020);assert.ok(sim.elapsed-t<.03);
 assert.ok(sim.exitStack.filter(p=>p.visible).every(p=>p.position.y<=1.15),'completed cartons should stay in compact delivery lanes');
 sim.stop();assert.equal(sim.exitStack.every(p=>!p.visible),true);sim.dispose();model.dispose();
});

test('MEDIA100 carton panels hinge at score lines and compression acts on belts',()=>{
 const model=new Media100MachineTemplate(),sim=new Media100ProcessSimulation(model.root,model),carton=sim.cartons[0];
 assert.equal(carton.left.position.z,-.21);assert.equal(carton.right.position.z,.21);
 assert.equal(carton.front.position.x,.31);assert.equal(carton.rear.position.x,-.31);
 const upper=model.findNode('media100-press-upper'),rest=upper.position.y;
 sim.start();sim.update(1000);for(let now=1100;now<=9400;now+=100)sim.update(now);
 assert.ok(upper.position.y<rest,'upper belt carriage must descend onto cartons');
 assert.ok(sim.cartons.every(c=>c.group.scale.equals(new THREE.Vector3(1,1,1))));
 sim.exitStack[0].visible=true;sim.start();assert.equal(sim.exitStack[0].visible,false);
 sim.stop();assert.equal(upper.position.y,rest);sim.dispose();model.dispose();
});

test('MEDIA100 taxonomy is a complete six-level mapped tree for FGM1 and FGM3',()=>{
 for(const assetId of ['BMJ-MCH-0016','BMJ-MCH-0018']){const taxonomy=media100TaxonomyFor(assetId);assert.deepEqual([...new Set(taxonomy.map(n=>n.level))].sort(),[1,2,3,4,5,6]);assert.equal(new Set(taxonomy.map(n=>n.id)).size,taxonomy.length);for(const n of taxonomy.filter(n=>n.level>1))assert.ok(taxonomy.some(p=>p.id===n.parentId),n.id);const model=new Media100MachineTemplate(assetId);for(const n of taxonomy.filter(n=>n.verified&&n.meshRefs.length))assert.ok(model.resolveTaxonomyNode(n.id),n.id);model.dispose();}
});

test('MEDIA100 stage order follows continuous folder-gluer process',()=>{
 assert.deepEqual(MEDIA100_SIMULATION_STAGES,['Blank separation','Feeder transport','Alignment / pre-break','Straight-line folding reference','Glue application reference','Final fold / trombone','Compression dwell','Delivery']);
});
