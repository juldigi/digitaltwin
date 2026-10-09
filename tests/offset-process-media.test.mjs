import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
for(const key of ['offset5','offset10','BMJ-MCH-0005','BMJ-MCH-0006'])test(`${key}: attached ink water and air markers follow simulation lifecycle`,()=>{
 const t=createPolishedMachineTemplate(key),s=createMachineSimulation(key,t.root,t),flows=s.processMedia.flows;
 assert.ok(flows.length>0);for(const kind of ['ink','dampening-water','air'])assert.ok(flows.some(f=>f.kind===kind));
 assert.ok(flows.every(f=>!f.points.visible));t.setExteriorOpen(true);s.start();s.update(1000);s.update(1100);
 assert.ok(flows.every(f=>f.points.visible));
 const before=Array.from(flows[0].points.geometry.attributes.position.array);s.pause();s.update(1200);assert.deepEqual(Array.from(flows[0].points.geometry.attributes.position.array),before);
 s.setInkFlowVisible(false);assert.ok(flows.every(f=>!f.points.visible));s.setInkFlowVisible(true);s.stop();assert.ok(flows.every(f=>!f.points.visible));
 s.dispose();assert.ok(flows.every(f=>!f.points.parent));t.dispose();
});
test('Offset 5 upper roller bodies stay within every locked PU during interior and simulation',()=>{
 const t=createPolishedMachineTemplate('offset5'),s=createMachineSimulation('offset5',t.root,t);
 t.setExteriorOpen(true);s.start();for(let frame=0;frame<12;frame++){s.update(1000+frame*40);t.root.updateMatrixWorld(true);
 for(let i=0;i<8;i++){const unit=t.findNode(`press-${i+1}`),half=i===0?.59:.61;
 for(const suffix of ['inking-train','inking-distribution','dampening-form'])t.findNode(`press-${i}-${suffix}`).traverse(o=>{
 if(!o.isMesh||!o.userData.actualDiagramSource)return;const b=new THREE.Box3().setFromObject(o,true);
 assert.ok(b.min.x>=unit.position.x-half-.001,`${i} ${o.userData.ownerId} before PU`);assert.ok(b.max.x<=unit.position.x+half+.001,`${i} ${o.userData.ownerId} after PU`);
 });}}
 s.dispose();t.dispose();
});
