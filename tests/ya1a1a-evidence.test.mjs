import test from 'node:test';
import assert from 'node:assert/strict';
import {MACHINE_REGISTRY_BY_ID} from '../frontend/src/data/machine-registry.js';
import {mechanicalProfile} from '../frontend/src/data/mechanical-profiles.js';
import {universalMachineConfig,universalTechnicalSources,universalTaxonomy} from '../frontend/src/universal-machine.js';
import {createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {ReferenceMachineTemplate,ReferenceProcessSimulation} from '../frontend/src/reference-machines.js';
import * as THREE from 'three';

test('YA1A1A keeps the BMJ master name but uses sheet-fed gravure rather than offset mechanics',()=>{
 const m=MACHINE_REGISTRY_BY_ID.get('BMJ-MCH-0004'),cfg=universalMachineConfig(m.machineId),profile=mechanicalProfile(m.no);
 assert.equal(m.name,'OFFSET - 7 MACHINE');
 assert.equal(m.model,'YA1A1A');
 assert.match(m.note,/single gravure press/i);
 assert.equal(cfg.family,'gravure');
 assert.equal(cfg.label,'Single-Unit Gravure Press');
 assert.equal(cfg.evidence.grade,'MODEL_IDENTIFIED_PROCESS_GROUNDED');
 assert.match(cfg.evidence.geometry,/YA1A1A_EXACT_IDENTITY/);
 assert.equal(cfg.evidence.simulation,'BLOCKED');
 assert.equal(profile.family,'gravure');
 for(const part of ['Sheet Feeder','Feedboard / Register','Ink Pan & Circulation','Gravure Cylinder / Doctor Blade','Impression Cylinder / Gripper','Dryer / Exhaust','High-Pile Delivery'])assert.ok(profile.architecture.includes(part),part);
 assert.ok(!profile.architecture.some(x=>/plate|blanket|dampening/i.test(x)));
});

test('YA1A1A source map separates exact identity/size-class evidence from later family mechanics',()=>{
 const sources=universalTechnicalSources('BMJ-MCH-0004');
 assert.ok(sources.some(s=>/wlzp\.vip/.test(s.url)&&/YA1A1A/.test(s.title)));
 assert.ok(sources.some(s=>/sohu\.com/.test(s.url)&&/YA1A1/.test(s.title)));
 assert.ok(sources.some(s=>/ezgravtek\.com/.test(s.url)&&/family/i.test(s.title)));
 const taxonomy=universalTaxonomy('BMJ-MCH-0004');
 assert.deepEqual([...new Set(taxonomy.map(n=>n.level))].sort(),[1,2,3,4,5,6]);
 assert.ok(taxonomy.some(n=>n.name==='Gravure Cylinder / Doctor'));
 assert.ok(taxonomy.some(n=>n.name==='Impression Cylinder / Sheet Control'));
});

test('YA1A1A reference simulation uses only tagged gravure-family mechanisms and remains explicitly non-CAD',()=>{
 const model=createMachineTemplate('BMJ-MCH-0004');
 const sim=createMachineSimulation('BMJ-MCH-0004',model.root,model);
 assert.ok(model instanceof ReferenceMachineTemplate);
 assert.ok(sim instanceof ReferenceProcessSimulation);
 assert.equal(model.root.userData.engineeringDimensions,false);
 assert.match(model.root.userData.referenceNote||'',/YA1A1A|QF|reference/i);
 const before=sim.state();assert.equal(before.available,false);assert.equal(before.blocked,true);
 const started=sim.start();assert.equal(started.active,false);assert.equal(started.progress,0);assert.match(started.blockedReason||'',/YA1A1A|transport|drive|dryer/i);
 sim.dispose();model.dispose();
});

test('YA1A1A doctor edge reaches the gravure surface without entering the cylinder core',()=>{
 const model=createMachineTemplate('BMJ-MCH-0004');model.root.updateMatrixWorld(true);
 const grav=model.meshes.find(x=>x.userData?.mechanismRole==='engraved-gravure-cylinder');
 const blade=model.meshes.find(x=>x.userData?.mechanismRole==='doctor-blade-edge');
 assert.ok(grav&&blade);
 const gp=new THREE.Vector3(),bp=new THREE.Vector3();grav.getWorldPosition(gp);blade.getWorldPosition(bp);
 const radial=Math.hypot(bp.x-gp.x,bp.y-gp.y);
 assert.ok(radial>=.278&&radial<=.292,`doctor radial contact ${radial}`);
 assert.equal(blade.userData.contactRelation,'TANGENT_TO_GRAVURE_CYLINDER__FAMILY_REFERENCE');
 model.dispose();
});

test('YA1A1A fixed controls remain mounted while cover details leave in interior mode',()=>{
 const model=createMachineTemplate('BMJ-MCH-0004');
 const console=model.meshes.find(x=>x.userData?.mechanismRole==='gravure-operator-console-family-reference');
 const display=model.meshes.find(x=>x.userData?.mechanismRole==='gravure-operator-display-family-reference');
 const seam=model.meshes.find(x=>x.userData?.mechanismRole==='gravure-service-door-seam-reference');
 assert.ok(console&&display&&seam);
 assert.notEqual(console.userData.exteriorCover,true);assert.notEqual(display.userData.exteriorCover,true);
 model.setExteriorOpen(true);
 assert.equal(console.visible,true);assert.equal(display.visible,true);assert.equal(seam.visible,false);
 assert.equal(model.meshes.some(x=>x.userData?.mechanismRole==='gravure-service-door-handle-reference'),false);
 model.setLow(true);assert.equal(console.visible,true);assert.equal(display.visible,true);
 model.dispose();
});
