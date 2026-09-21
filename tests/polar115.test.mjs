import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Polar115MachineTemplate} from '../frontend/src/polar115.js';
import {Polar115ProcessSimulation} from '../frontend/src/simulation-polar115.js';
import {POLAR115_TAXONOMY} from '../frontend/src/data/taxonomy-polar115.js';
import {POLAR115_SPEC} from '../frontend/src/data/dimensions-polar115.js';
import {POLAR115_TECHNICAL_SOURCES} from '../frontend/src/data/sources-polar115.js';

test('POLAR 115 EM-MON preserves BMJ identity and archive dimensional boundaries',()=>{
 assert.equal(POLAR115_SPEC.assetId,'BMJ-MCH-0001');assert.equal(POLAR115_SPEC.serial,'5831536');assert.equal(POLAR115_SPEC.cuttingWidthM,1.15);
 assert.deepEqual(POLAR115_SPEC.referenceEnvelopeM,[2.65,2.54,1.65]);assert.deepEqual(POLAR115_SPEC.publishedWeightKg,[3200,3500]);
 assert.ok(POLAR115_TECHNICAL_SOURCES.some(s=>s.id==='POLAR-EM-EVIDENCE-BOUNDARY'));
});

test('POLAR geometry matches the EM-MON visual architecture without the old over-wide side tables',()=>{
 const m=new Polar115MachineTemplate();
 for(const id of ['polar-feed-center','polar-feed-left','polar-feed-right','polar-gauge','polar-clamp','polar-knife','polar-safety-photo','polar-safety-twohand','polar-control-crt','polar-control-panel','polar-hyd-power','polar-air-blower'])assert.ok(m.findNode(id),id);
 assert.ok(m.meshes.some(x=>x.name==='1150 mm Knife'));assert.ok(m.meshes.some(x=>x.name==='CRT Monitor'));
 const box=new THREE.Box3().setFromObject(m.root),size=box.getSize(new THREE.Vector3());
 assert.ok(box.min.y>=-0.01);assert.ok(size.x>=2.55&&size.x<=2.9,`width ${size.x}`);assert.ok(size.z>=1.7&&size.z<=2.8,`depth ${size.z}`);assert.ok(size.y>=1.55&&size.y<=1.85,`height ${size.y}`);
 assert.ok(m.meshes.filter(x=>x.userData.photoCell).length>=10);
 m.setExteriorOpen(true);assert.ok(m.root.userData.exteriorHiddenCount>=6);m.dispose();
});

test('POLAR taxonomy is contiguous six levels and resolves every verified major unit',()=>{
 assert.deepEqual([...new Set(POLAR115_TAXONOMY.map(n=>n.level))].sort(),[1,2,3,4,5,6]);
 assert.equal(new Set(POLAR115_TAXONOMY.map(n=>n.id)).size,POLAR115_TAXONOMY.length);
 for(const n of POLAR115_TAXONOMY.filter(n=>n.level>1))assert.ok(POLAR115_TAXONOMY.some(p=>p.id===n.parentId),n.id);
 const m=new Polar115MachineTemplate();for(const n of POLAR115_TAXONOMY.filter(n=>n.level===2))assert.ok(m.resolveTaxonomyNode(n.id),n.id);m.dispose();
});

test('POLAR cut cycle uses air table, backgauge, clamp, interlock and knife in process order',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);s.start();let now=0,seenGauge=false,seenClamp=false,seenKnifeDown=false,seenKnifeUp=false,seenCut=false;
 for(let i=0;i<1100;i++){now+=10;s.update(now);const state=s.state();if(state.backgaugeMoving)seenGauge=true;if(state.clampActive)seenClamp=true;if(state.knifeDownstroke){seenKnifeDown=true;assert.equal(state.interlocks.clampDown,true);assert.equal(state.interlocks.twoHandCommand,true);assert.equal(state.interlocks.lightBarrierClear,true);}if(state.knifeUpstroke)seenKnifeUp=true;if(state.cutSeparated)seenCut=true;}
 assert.ok(seenGauge&&seenClamp&&seenKnifeDown&&seenKnifeUp&&seenCut);assert.ok(s.completed>=1);s.dispose();m.dispose();
});
