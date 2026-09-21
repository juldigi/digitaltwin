import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Offset9MachineTemplate} from '../frontend/src/offset9.js';
import {Offset9PrintingSimulation,OFFSET9_SIMULATION_STAGES} from '../frontend/src/simulation-offset9.js';
import {OFFSET9_MODULE_SEQUENCE,OFFSET9_SPEC} from '../frontend/src/data/dimensions-offset9.js';
import {OFFSET9_TAXONOMY} from '../frontend/src/data/taxonomy-offset9.js';
import {OFFSET9_TECHNICAL_SOURCES} from '../frontend/src/data/sources-offset9.js';

test('Offset 9 uses the BMJ SX 52-4+L identity and official format limits without inventing installed options',()=>{
 assert.equal(OFFSET9_SPEC.assetId,'BMJ-MCH-0006');assert.equal(OFFSET9_SPEC.serial,'GS001804');assert.equal(OFFSET9_SPEC.configuration,'4 PU + L');
 assert.deepEqual(OFFSET9_SPEC.maxSheet,[.370,.520]);assert.deepEqual(OFFSET9_SPEC.maxPrint,[.360,.520]);assert.equal(OFFSET9_SPEC.maxSpeed,15000);
 assert.equal(OFFSET9_MODULE_SEQUENCE.filter(m=>m.type==='print').length,4);assert.equal(OFFSET9_MODULE_SEQUENCE.filter(m=>m.type==='coat').length,1);
 assert.equal(OFFSET9_SPEC.deliveryPileOptionVerified,false);assert.equal(OFFSET9_SPEC.dryerInstalledVerified,false);assert.equal(OFFSET9_SPEC.perfectorInstalledVerified,false);
 assert.equal(OFFSET9_SPEC.inkingRollerCountVerified,false);assert.equal(OFFSET9_SPEC.dampeningRollerCountVerified,false);
 assert.ok(OFFSET9_TECHNICAL_SOURCES.some(s=>s.authority==='primary'));assert.ok(OFFSET9_TECHNICAL_SOURCES.some(s=>s.id==='SX52-CONFIGURATION-BOUNDARY'));
});

test('Offset 9 specialized geometry contains all evidence-grounded process stations and no high-pile installation claim',()=>{
 const model=new Offset9MachineTemplate(),box=new THREE.Box3().setFromObject(model.root);assert.ok(!box.isEmpty());assert.ok(box.min.y>=-0.01);assert.equal(model.root.userData.assetId,'BMJ-MCH-0006');
 for(const id of ['offset9-feeder','offset9-register','offset9-pu1','offset9-pu2','offset9-pu3','offset9-pu4','offset9-l','offset9-delivery','offset9-delivery-grippers','offset9-console'])assert.ok(model.findNode(id),id);
 assert.equal(model.findNode('offset9-delivery').userData.pileHeightOptionVerified,false);assert.match(model.findNode('offset9-delivery').name,/option unverified/i);
 assert.ok(model.meshes.filter(m=>m.userData.exteriorCover).length>=12);model.setExteriorOpen(true);assert.ok(model.root.userData.exteriorHiddenCount>=12);model.reset();model.dispose();
});

test('Offset 9 rotates only real rollers and cylinders on their local axes',()=>{
 const model=new Offset9MachineTemplate(),sim=new Offset9PrintingSimulation(model.root,model),allowed=/^(suction-belt-wheel|plate|blanket|impression|transfer|ink-transfer|ink-form-\d+|damp-\d+|anilox|coating-form|coating-impression|chain-sprocket|sheet-brake)$/;
 assert.equal(sim.rotors.length,85);assert.equal(sim.rotors.some(r=>!allowed.test(r.userData.rollerRole||'')),false);
 assert.equal(sim.rotors.some(r=>['guard-rail','pile-chain','suction-foot','venturi-nozzle'].includes(r.userData.rollerRole)),false);assert.equal(sim.suckers.length,4);assert.equal(sim.deliveryBars.length,6);
 sim.start();let now=1000;for(let i=0;i<100;i++){now+=20;sim.update(now);}assert.ok(sim.rotors.some((r,i)=>r.quaternion.angleTo(sim.rotorRest[i])>.01));assert.ok(sim.deliveryBars.some((b,i)=>b.position.distanceTo(sim.deliveryBarRest[i])>.04));
 sim.stop();assert.equal(sim.rotors.every((r,i)=>r.quaternion.angleTo(sim.rotorRest[i])<1e-9),true);assert.equal(sim.deliveryBars.every((b,i)=>b.position.distanceTo(sim.deliveryBarRest[i])<1e-10),true);sim.dispose();model.dispose();
});

test('Offset 9 sheet path follows impression/transfer surfaces instead of crossing cylinder cores',()=>{
 const model=new Offset9MachineTemplate(),sim=new Offset9PrintingSimulation(model.root,model),critical=[];model.root.updateMatrixWorld(true);
 model.root.traverse(o=>{if(o.isMesh&&['plate','blanket','impression','transfer','anilox','coating-form','coating-impression'].includes(o.userData.rollerRole)){const p=new THREE.Vector3();o.getWorldPosition(p);critical.push({p,r:o.userData.radius,role:o.userData.rollerRole});}});
 let minimum=Infinity;for(const p of sim.curve.getPoints(800))for(const q of critical){const d=Math.hypot(p.x-q.p.x,p.y-q.p.y);minimum=Math.min(minimum,d);assert.ok(d>q.r*.98,`${q.role} core penetration d=${d.toFixed(3)} r=${q.r}`);}
 assert.ok(minimum<.29);sim.dispose();model.dispose();
});

test('Offset 9 taxonomy is a contiguous six-level tree mapped to real geometry',()=>{
 assert.deepEqual([...new Set(OFFSET9_TAXONOMY.map(n=>n.level))].sort(),[1,2,3,4,5,6]);assert.equal(new Set(OFFSET9_TAXONOMY.map(n=>n.id)).size,OFFSET9_TAXONOMY.length);
 for(const node of OFFSET9_TAXONOMY.filter(n=>n.level>1))assert.ok(OFFSET9_TAXONOMY.some(parent=>parent.id===node.parentId),node.id);
 const model=new Offset9MachineTemplate();for(const node of OFFSET9_TAXONOMY.filter(n=>n.verified&&n.meshRefs.length))assert.ok(model.resolveTaxonomyNode(node.id),node.id);model.dispose();
});

test('Offset 9 process cycle drives feeder coating Venturi brake grippers and stacked delivery',()=>{
 const model=new Offset9MachineTemplate(),sim=new Offset9PrintingSimulation(model.root,model);assert.ok(OFFSET9_SIMULATION_STAGES.includes('Printing Unit 4'));assert.ok(OFFSET9_SIMULATION_STAGES.includes('Inline Coating Unit'));
 sim.start();let now=1000,feed=false,coat=false,air=false,brake=false,grip=false;for(let i=0;i<1800;i++){now+=10;sim.update(now);const state=sim.state();feed||=state.feederSuctionActive;coat||=state.coatingActive;air||=state.airGuidanceActive;brake||=state.deliveryBrakeActive;grip||=state.deliveryGripperActive;}
 const state=sim.state();assert.ok(feed&&coat&&brake&&grip);assert.equal(air,false,'high-pile delivery Venturi must remain inactive until BMJ option is verified');assert.ok(state.sheetsVisible>0);assert.ok(state.completed>0);assert.ok(state.pileSheetsVisible>0);assert.ok(sim.stack.filter(x=>x.visible).every(x=>x.position.y>=.985));
 sim.stop();sim.dispose();model.dispose();
});
