import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {OFFSET5_TAXONOMY} from '../frontend/src/data/taxonomy-offset5.js';
const fixture=()=>{const t=createPolishedMachineTemplate('offset5');return {t,s:createMachineSimulation('offset5',t.root,t)};};
test('all six dryer supports remain round and clear the actual sheet path during rotation',()=>{
 const {t,s}=fixture();try{const rollers=s.rotors.filter(r=>r.role==='dryer-sheet-transport-roller');assert.equal(rollers.length,6);s.start();const points=Array.from({length:12001},(_,i)=>s.curve.getPointAt(i/12000)),ray=new T.Raycaster();
 for(let f=0;f<24;f++){s.update(1000+f*31);t.root.updateMatrixWorld(true);for(const {mesh} of rollers){const c=mesh.getWorldPosition(new T.Vector3()),a=mesh.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(mesh.matrixWorld);assert.ok(Math.abs(Math.hypot(p.x-c.x,p.y-c.y)-.035)<1e-6||Math.hypot(p.x-c.x,p.y-c.y)<1e-6);}
 const sheet=points.reduce((best,p)=>Math.abs(p.x-c.x)<Math.abs(best.x-c.x)?p:best,points[0]);ray.set(new T.Vector3(c.x,2,0),new T.Vector3(0,-1,0));const hit=ray.intersectObject(mesh,false)[0];assert.ok(hit);assert.ok(sheet.y-hit.point.y>.0008&&sheet.y-hit.point.y<.0018,`roller gap ${sheet.y-hit.point.y}`);
 assert.ok(Math.abs(rollers.find(r=>r.mesh===mesh).visualSpeedRatio-1)<1e-8);
 }}s.stop();for(const r of rollers)assert.ok(r.mesh.quaternion.angleTo(r.initial)<1e-8);assert.equal(t.findNode('dryer-extension').userData.installedTransportVerified,false);
 }finally{s.dispose();t.dispose();}
});
test('both optical axes reach the sheet without crossing lighting or its supports',()=>{
 const {t,s}=fixture();try{t.root.updateMatrixWorld(true);for(const id of ['inspection-camera-a','inspection-camera-b']){const pod=t.findNode(id);let lens;pod.traverse(m=>{if(m.userData.inspectionLens)lens=m;});assert.ok(lens);const origin=lens.getWorldPosition(new T.Vector3()),dir=new T.Vector3(0,-1,0).transformDirection(lens.matrixWorld),ray=new T.Raycaster(origin,dir,0,(origin.y-1.29)/-dir.y);for(const group of ['inspection-lighting','inspection-light-mounts','inspection-cabling','inspection-calibration'])assert.equal(ray.intersectObject(t.findNode(group),true).length,0,`${id} blocked by ${group}`);assert.equal(pod.userData.installedOpticalTiltVerified,false);}
 for(const id of ['inspection-camera-a-lens','inspection-camera-b-lens','inspection-lighting-a','inspection-lighting-b','dryer-uv-optics-1','dryer-uv-optics-2','dryer-uv-optics-3','dryer-monitoring'])assert.ok(OFFSET5_TAXONOMY.some(n=>n.meshRefs?.includes(id)),id);
 }finally{s.dispose();t.dispose();}
});

test('dryer hood clears both inspection uprights and camera cables reach the enclosure',()=>{
 const {t,s}=fixture();try{t.root.updateMatrixWorld(true);const bridge=t.findNode('inspection-bridge'),origin=bridge.getWorldPosition(new T.Vector3());
 for(const z of [-.86,.86])for(const dx of [-.075,0,.075]){const ray=new T.Raycaster(new T.Vector3(origin.x+dx,1.31,z),new T.Vector3(0,1,0),0,1.05);assert.equal(ray.intersectObject(t.findNode('dryer-hood'),true).length,0,'hood crosses upright');}
 let enclosure;t.findNode('inspection-control').traverse(m=>{if(m.isMesh&&(!enclosure||new T.Box3().setFromObject(m).max.y>new T.Box3().setFromObject(enclosure).max.y))enclosure=m;});const box=new T.Box3().setFromObject(enclosure);const end=new T.Vector3(.42,1.96,.64).applyMatrix4(bridge.matrixWorld);assert.ok(box.containsPoint(end));
 }finally{s.dispose();t.dispose();}
});

test('UV cassette bodies stay below the sloped hood rather than intersecting it',()=>{
 const {t,s}=fixture();try{t.root.updateMatrixWorld(true);for(let i=1;i<=3;i++){const body=t.findNode(`dryer-uv-cassette-${i}`).children.find(m=>m.isMesh),b=new T.Box3().setFromObject(body);for(const x of [b.min.x,b.getCenter(new T.Vector3()).x,b.max.x])for(const z of [-.65,0,.65]){const ray=new T.Raycaster(new T.Vector3(x,1,z),new T.Vector3(0,1,0));const hit=ray.intersectObject(t.findNode('dryer-hood'),true)[0];if(hit)assert.ok(hit.point.y>b.max.y+.01,'cassette penetrates hood');}}
 }finally{s.dispose();t.dispose();}
});
