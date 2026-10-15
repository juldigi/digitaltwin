import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
const built=buildActualFactory(layout,fleet);built.root.updateMatrixWorld(true);
const objects=s=>{const a=[];built.root.traverse(o=>{if(o.userData?.semantic===s)a.push(o);});return a;};
const roofs=objects('ROOF_PANEL');
const roofAt=p=>new T.Raycaster(new T.Vector3(p.x,12,p.z),new T.Vector3(0,-1,0)).intersectObjects(roofs)[0];
test('roof exhaust curb corners contact actual roof triangles and all solid faces point outward',()=>{
 for(const curb of objects('ROOF_EXHAUST_CURB_REFERENCE')){
  const pos=curb.geometry.attributes.position,idx=curb.geometry.index,center=new T.Vector3(0,.14,0);
  for(let i=0;i<4;i++){const p=curb.localToWorld(new T.Vector3().fromBufferAttribute(pos,i)),h=roofAt(p);assert.ok(h);assert.ok(Math.abs(p.y-h.point.y)<1e-6,'curb buried or floating');}
  for(let i=0;i<idx.count;i+=3){const a=new T.Vector3().fromBufferAttribute(pos,idx.getX(i)),b=new T.Vector3().fromBufferAttribute(pos,idx.getX(i+1)),c=new T.Vector3().fromBufferAttribute(pos,idx.getX(i+2)),n=new T.Vector3().crossVectors(b.clone().sub(a),c.clone().sub(a)),mid=a.clone().add(b).add(c).divideScalar(3);assert.ok(n.dot(mid.sub(center))>0,'inward face');}
  const cowl=curb.parent.children.find(o=>o.geometry?.type==='CylinderGeometry');assert.ok(Math.abs(new T.Box3().setFromObject(cowl).min.y-(curb.parent.position.y+.28))<1e-6);
 }
});
test('all solar underside corners clear real roof triangles by 25mm along the roof normal',()=>{
 const modules=objects('ROOF_SOLAR_MODULE_REFERENCE');assert.equal(modules.length,24);
 for(const m of modules)for(const x of [-.5,.5])for(const z of [-.5,.5]){const p=m.localToWorld(new T.Vector3(x,-.5,z)),h=roofAt(p);assert.ok(h);const n=h.face.normal.clone().transformDirection(h.object.matrixWorld);assert.ok(Math.abs(Math.abs(p.clone().sub(h.point).dot(n))-.025)<1e-6);assert.ok(p.y>h.point.y);}
});
test('drain shoes discharge away from the roof centre and downpipes meet their gutters',()=>{
 const shoes=objects('DOWNPIPE_SHOE_REFERENCE');assert.ok(shoes.length>0);
 for(const s of shoes){const a=s.localToWorld(new T.Vector3(0,-s.geometry.parameters.height/2,0)),b=s.localToWorld(new T.Vector3(0,s.geometry.parameters.height/2,0)),lo=a.y<b.y?a:b,hi=a.y>b.y?a:b;assert.ok(Math.abs(lo.x-s.userData.roofCenterX)>Math.abs(hi.x-s.userData.roofCenterX));}
 for(const down of objects('MAIN_ROOF_DOWNPIPE_REFERENCE'))assert.ok(Math.abs(new T.Box3().setFromObject(down).max.y-4.43)<1e-6);
});
test('whole-building second pass preserves source layout, all finite surfaces, room access, IPAL and layer boundaries',()=>{
 let meshes=0;built.root.traverse(o=>{if(o.isMesh){meshes++;assert.ok(o.matrixWorld.elements.every(Number.isFinite));}});assert.ok(meshes>11000);
 const runners=objects('PRODUCTION_WIP_PLASTIC_PALLET_RUNNER'),keys=runners.map(o=>o.getWorldPosition(new T.Vector3()).toArray().join(','));assert.equal(new Set(keys).size,runners.length);assert.equal(runners.length,20);
 for(const p of layout.placements.filter(p=>p.status!=='UNIDENTIFIED')){const a=built.assets.get(p.machineId);if(a){assert.equal(a.position.x,p.x);assert.equal(a.position.z,-p.y);assert.equal(a.rotation.y,p.rotation*Math.PI/180);}}
 assert.equal(built.root.userData.roomEnvelopeSummary.openEdges,0);assert.equal(built.root.userData.furnitureLayoutSummary.pairOverlapViolations,0);assert.equal(built.root.userData.ipal.openSides,true);assert.equal(built.root.userData.ipal.enclosingWalls,0);
 for(const k of ['roof','reference','utility_compressed_air','utility_ahu_piping','utility_ahu_ducting','utility_anchors'])assert.equal(built.layers[k].visible,false);
});
test('all production floor arrows are planar paint above the slab, not subterranean cones',()=>{
 const arrows=objects('PRODUCTION_AISLE_DIRECTION_ARROW_REFERENCE');assert.equal(arrows.length,10);
 for(const a of arrows){assert.equal(a.parent,built.layers.floor);const b=new T.Box3().setFromObject(a);assert.ok(b.min.y>=0);assert.ok(b.max.y<.03);assert.ok(a.children.every(o=>o.geometry?.type!=='ConeGeometry'));const head=a.children.find(o=>o.userData.semantic==='PRODUCTION_DIRECTION_PAINT_HEAD_REFERENCE');assert.ok(head);assert.ok(head.geometry.attributes.normal.getY(0)>.99);}
});
