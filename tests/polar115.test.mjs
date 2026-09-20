import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Polar115MachineTemplate} from '../frontend/src/polar115.js';
import {Polar115ProcessSimulation} from '../frontend/src/simulation-polar115.js';
import {POLAR115_TAXONOMY} from '../frontend/src/data/taxonomy-polar115.js';

test('POLAR 115 dedicated model carries air tables, backgauge, clamp, visible knife and safety barrier',()=>{
 const m=new Polar115MachineTemplate();
 for(const id of ['polar-feed','polar-gauge','polar-clamp','polar-knife','polar-safety','polar-control','polar-hyd'])assert.ok(m.findNode(id),id);
 assert.ok(m.meshes.some(x=>x.name==='1150 mm Knife'));
 const box=new THREE.Box3().setFromObject(m.root);assert.ok(box.min.y>=-0.01);assert.ok(box.max.x-box.min.x>4.5);assert.ok(box.max.z-box.min.z>1.5);
 m.dispose();
});
test('POLAR taxonomy is contiguous six levels and resolves primary geometry',()=>{
 assert.deepEqual([...new Set(POLAR115_TAXONOMY.map(n=>n.level))],[1,2,3,4,5,6]);
 for(const n of POLAR115_TAXONOMY.filter(n=>n.level>1))assert.ok(POLAR115_TAXONOMY.some(p=>p.id===n.parentId),n.id);
 const m=new Polar115MachineTemplate();for(const n of POLAR115_TAXONOMY.filter(n=>n.level===2))assert.ok(m.resolveTaxonomyNode(n.id),n.id);m.dispose();
});
test('POLAR cut cycle clamps before knife and never cuts without interlock stage',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);s.start();let now=0,seenClamp=false,seenKnife=false;
 for(let i=0;i<900;i++){now+=10;s.update(now);const state=s.state();if(state.interlocks.clampDown)seenClamp=true;if(state.interlocks.knifePermitted){seenKnife=true;assert.equal(state.interlocks.clampDown,true);assert.equal(state.interlocks.lightBarrierClear,true);assert.equal(state.interlocks.twoHandCommand,true);}}
 assert.ok(seenClamp);assert.ok(seenKnife);assert.ok(s.completed>=1);s.dispose();m.dispose();
});
