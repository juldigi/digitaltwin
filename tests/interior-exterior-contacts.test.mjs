import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {inspectArchitecture} from '../scripts/audit-interior-exterior.mjs';
const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);

test('room and storage contacts meet actual transformed support surfaces',()=>{
 const {root,layers}=buildActualFactory(layout,fleet),a=inspectArchitecture(root,layers);
 assert.equal(a.invalidVertices,0);assert.equal(a.rooms.length,20);assert.ok(a.inventory.length>10000);
 assert.equal(a.contacts.length,249,'contact coverage changed; inspect rather than silently dropping objects');
 for(const c of a.contacts){if(c.kind==='BASIN_COUNTER_OCCLUSION')assert.ok(c.excess<0,JSON.stringify(c));else assert.ok(Math.abs(c.gap)<1e-6,JSON.stringify(c));}
});

test('layer routing retains pallet, trolley and rack assembly scopes and source machine placement',()=>{
 const {root,layers,assets}=buildActualFactory(layout,fleet);let stacks=0;
 root.traverse(o=>{if(o.userData?.semantic==='RMS_CUT_SHEET_STACK_REFERENCE'){
  stacks++;assert.ok(o.children.length>10);assert.ok(o.children.some(p=>p.userData.semantic==='RMS_REAM_TOP_PROTECTOR_REFERENCE'));
  let p=o;while(p&&p!==layers.furniture)p=p.parent;assert.equal(p,layers.furniture);
 }});assert.equal(stacks,4);
 for(const p of layout.placements.filter(p=>p.status!=='UNIDENTIFIED')){const a=assets.get(p.machineId);if(a){assert.equal(a.position.x,p.x);assert.equal(a.position.z,-p.y);}}
});

test('closed exterior gate spans the actual inner post faces while retaining its ground clearance',()=>{
 const {root,layers}=buildActualFactory(layout,fleet);root.updateMatrixWorld(true);
 const posts=[],leaves=[];layers.landscape.traverse(o=>{if(o.userData.semantic==='EXTERIOR_GATE_POST_REFERENCE')posts.push(new T.Box3().setFromObject(o));if(o.userData.semantic==='EXTERIOR_GATE_LEAF_REFERENCE')leaves.push(new T.Box3().setFromObject(o));});
 assert.equal(posts.length,2);assert.equal(leaves.length,1);posts.sort((a,b)=>a.min.z-b.min.z);
 assert.ok(Math.abs(posts[0].max.z-leaves[0].min.z)<1e-6);assert.ok(Math.abs(posts[1].min.z-leaves[0].max.z)<1e-6);
 assert.ok(Math.abs(leaves[0].min.y-.10)<1e-6);
});

test('photo-derived secondary canopy supports follow the actual sloping roof underside',()=>{
 const {root}=buildActualFactory(layout,fleet);root.updateMatrixWorld(true);const objects=[];root.traverse(o=>{if(o.isMesh&&/^IPAL_PHOTO_SECONDARY_CANOPY_/.test(o.userData.semantic||''))objects.push(o);});
 const panels=objects.filter(o=>o.userData.semantic.endsWith('CORRUGATED_PANEL')),purlins=objects.filter(o=>o.userData.semantic.endsWith('PURLIN'));
 assert.equal(panels.length,8);assert.ok(purlins.length>5);assert.ok(panels.every(o=>o.rotation.z>0));
 const panel=panels[0],inverse=panel.matrixWorld.clone().invert(),half=.5;
 let closest=-Infinity;
 for(const purlin of purlins){const a=purlin.geometry.attributes.position;for(let i=0;i<a.count;i++){
  const v=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(purlin.matrixWorld).applyMatrix4(inverse);
  // Shared unit box: y=-.5 is its actual underside, including rotation and thickness.
  assert.ok(v.y<=-half+1e-4,`purlin protrudes through roof by ${(v.y+half)*.055} m`);closest=Math.max(closest,v.y);
 }}assert.ok(closest>-.55,'support is separated from the roof');
 const gutter=objects.find(o=>o.userData.semantic.endsWith('GUTTER')),down=objects.find(o=>o.userData.semantic.endsWith('DOWNPIPE'));
 const gb=new T.Box3().setFromObject(gutter),db=new T.Box3().setFromObject(down);assert.ok(gb.intersectsBox(db));
 const columns=objects.filter(o=>o.userData.semantic.endsWith('GREEN_COLUMN'));assert.equal(columns.length,2);
 for(const column of columns){const cb=new T.Box3().setFromObject(column),beam=purlins.find(o=>Math.abs(o.getWorldPosition(new T.Vector3()).z-column.getWorldPosition(new T.Vector3()).z)<1e-6);assert.ok(beam,'column must meet an existing purlin');assert.ok(Math.abs(cb.max.y-new T.Box3().setFromObject(beam).min.y)<1e-6);}
 const light=objects.find(o=>o.userData.semantic.endsWith('LINEAR_LIGHT')),lb=new T.Box3().setFromObject(light),beam=purlins.slice().sort((a,b)=>Math.abs(a.position.z-light.position.z)-Math.abs(b.position.z-light.position.z))[0];
 const ray=new T.Raycaster(new T.Vector3(lb.min.x,lb.max.y-.0001,beam.position.z),new T.Vector3(0,1,0)),hits=ray.intersectObject(beam);assert.ok(hits.length>0);assert.ok(Math.abs(hits[0].point.y-lb.max.y)<1e-5,'light must contact an actual beam triangle');
});
