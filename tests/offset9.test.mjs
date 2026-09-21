import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Offset9MachineTemplate} from '../frontend/src/offset9.js';
import {Offset9PrintingSimulation,OFFSET9_SIMULATION_STAGES} from '../frontend/src/simulation-offset9.js';
import {OFFSET9_MODULE_SEQUENCE,OFFSET9_SPEC} from '../frontend/src/data/dimensions-offset9.js';
import {OFFSET9_TAXONOMY} from '../frontend/src/data/taxonomy-offset9.js';
import {OFFSET9_TECHNICAL_SOURCES} from '../frontend/src/data/sources-offset9.js';

test('Offset 9 uses the BMJ SX 52-4+L identity and official format limits',()=>{
 assert.equal(OFFSET9_SPEC.assetId,'BMJ-MCH-0006');assert.equal(OFFSET9_SPEC.serial,'GS001804');assert.equal(OFFSET9_SPEC.configuration,'4 PU + L');
 assert.deepEqual(OFFSET9_SPEC.maxSheet,[.370,.520]);assert.deepEqual(OFFSET9_SPEC.maxPrint,[.360,.520]);assert.equal(OFFSET9_SPEC.maxSpeed,15000);
 assert.equal(OFFSET9_MODULE_SEQUENCE.filter(m=>m.type==='print').length,4);assert.equal(OFFSET9_MODULE_SEQUENCE.filter(m=>m.type==='coat').length,1);
 assert.ok(OFFSET9_TECHNICAL_SOURCES.some(s=>s.authority==='primary'));assert.ok(OFFSET9_TECHNICAL_SOURCES.some(s=>s.id==='SX52-CONFIGURATION-BOUNDARY'));
});

test('Offset 9 specialized geometry is grounded, selectable and contains all verified process stations',()=>{
 const model=new Offset9MachineTemplate(),box=new THREE.Box3().setFromObject(model.root);assert.ok(!box.isEmpty());assert.ok(box.min.y>=-0.01);assert.equal(model.root.userData.assetId,'BMJ-MCH-0006');
 for(const id of ['offset9-feeder','offset9-register','offset9-pu1','offset9-pu2','offset9-pu3','offset9-pu4','offset9-l','offset9-delivery','offset9-console'])assert.ok(model.findNode(id),id);
 assert.ok(model.meshes.filter(m=>m.userData.rotor).length>=55);assert.ok(model.meshes.filter(m=>m.userData.exteriorCover).length>=12);
 model.setExteriorOpen(true);assert.ok(model.root.userData.exteriorHiddenCount>=12);model.reset();model.dispose();
});

test('Offset 9 taxonomy is a contiguous six-level tree mapped to real geometry',()=>{
 assert.deepEqual([...new Set(OFFSET9_TAXONOMY.map(n=>n.level))].sort(),[1,2,3,4,5,6]);assert.equal(new Set(OFFSET9_TAXONOMY.map(n=>n.id)).size,OFFSET9_TAXONOMY.length);
 for(const node of OFFSET9_TAXONOMY.filter(n=>n.level>1))assert.ok(OFFSET9_TAXONOMY.some(parent=>parent.id===node.parentId),node.id);
 const model=new Offset9MachineTemplate();for(const node of OFFSET9_TAXONOMY.filter(n=>n.verified&&n.meshRefs.length))assert.ok(model.resolveTaxonomyNode(node.id),node.id);model.dispose();
});

test('Offset 9 simulation follows feeder, four impressions, coating and stacked delivery',()=>{
 const model=new Offset9MachineTemplate(),sim=new Offset9PrintingSimulation(model.root,model);assert.ok(OFFSET9_SIMULATION_STAGES.includes('Printing Unit 4'));assert.ok(OFFSET9_SIMULATION_STAGES.includes('Inline Coating Unit'));
 sim.start();sim.update(sim.startAt+13000);const state=sim.state();assert.equal(state.active,true);assert.ok(state.rotorCount>=55);assert.ok(state.sheetsVisible>0);assert.ok(state.completed>0);assert.ok(state.pileSheetsVisible>0);sim.stop();sim.dispose();model.dispose();
});
