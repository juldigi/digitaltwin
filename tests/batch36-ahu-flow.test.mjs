import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
const ids=['BMJ-MCH-0036','BMJ-MCH-0037','BMJ-MCH-0038','BMJ-MCH-0039','BMJ-MCH-0041'];
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
test('batch36 AHU route handoffs follow existing rectangular duct surfaces rather than diagonal shortcuts',()=>{
 for(const id of ids){const t=createPolishedMachineTemplate(id),s=createMachineSimulation(id,t.root,t);
  try{t.setExteriorOpen(true);s.start();s.setPathVisible(true);
   const ducts=t.meshes.filter(m=>/ahu-(flexible-supply-connector|supply-duct-trunk|supply-branch|supply-drop|return-duct-trunk|return-drop|return-mixing-interface)-reference/.test(m.userData.mechanismRole||''));
   for(const kind of ['supply','return'])for(const item of s.ahuParticles.filter(p=>p.kind===kind)){
    const at=q=>{s.elapsed=((q-item.phase+1)%1)*s.cycle;s.updateAHU();return item.mesh.getWorldPosition(new T.Vector3());};
    for(const q of kind==='supply'?[.58,.62,.68,.80,.92]:[.82,.94])assert.ok(at(q-1e-7).distanceTo(at(q+1e-7))<1e-5,id+':handoff'+q);
    for(const q of kind==='supply'?[.60,.65,.72,.86,.96]:[.50,.88,.97]){
     const point=at(q);t.root.updateMatrixWorld(true);
     const support=ducts.find(m=>{const b=new T.Box3().setFromObject(m);return ['x','y','z'].every(a=>point[a]-b.min[a]>=.028-1e-6&&b.max[a]-point[a]>=.028-1e-6);});assert.ok(support,id+':outside duct'+q);
     const hit=new T.Raycaster(point.clone().add(new T.Vector3(0,1,0)),new T.Vector3(0,-1,0)).intersectObject(support)[0];assert.ok(hit&&hit.point.distanceTo(point)>=.028-1e-6);
    }
   }
  }finally{s.dispose();t.dispose();}
 }
});
test('batch36 normal mode hides duct particles and both toggle orders preserve taxonomy lifecycle and unknowns',()=>{
 for(const id of ids){const t=createPolishedMachineTemplate(id),s=createMachineSimulation(id,t.root,t);
  try{s.start();
   for(const order of [0,1]){if(order){t.setLow(true);t.setExteriorOpen(true);}else{t.setExteriorOpen(true);t.setLow(true);}s.setPathVisible(true);s.updateAHU();
    for(const n of t.taxonomy){for(const ref of n.meshRefs||[])assert.ok(t.findNode(ref));const target=t.resolveTaxonomyNode(n.id);t.isolate(target);t.highlight(target);t.ghost(true,target);t.showOnly([target]);t.reset();}
    t.setExteriorOpen(false);t.setLow(false);s.updateAHU();assert.ok(s.ahuParticles.filter(p=>p.kind==='return'||p.mesh.parent===t.findNode('ahu-supply-duct')).every(p=>!visible(p.mesh)));
    assert.equal(s.state().airflowParticleCount,s.ahuParticles.filter(p=>visible(p.mesh)).length);
   }
   const item=s.ahuParticles.find(p=>p.kind==='return');s.elapsed=.1*s.cycle;s.updateAHU();s.setPathVisible(false);s.setPathVisible(true);assert.equal(item.mesh.visible,false);
   t.setExteriorOpen(true);s.elapsed=.5*s.cycle;s.updateAHU();t.root.updateMatrixWorld(true);const before=item.mesh.getWorldPosition(new T.Vector3());t.findNode('ahu-return-duct').position.x+=.3;t.root.updateMatrixWorld(true);assert.ok(item.mesh.getWorldPosition(new T.Vector3()).sub(before).distanceTo(new T.Vector3(.3,0,0))<1e-8);
   s.pause();const elapsed=s.elapsed;s.update(9000);assert.equal(s.elapsed,elapsed);s.resume();s.update(9100);s.stop();assert.ok(s.ahuParticles.every(p=>!p.mesh.visible));s.start();s.stop();
   assert.equal(t.root.userData.sectionOrderVerified,false);assert.equal(t.root.userData.airflowDirectionVerified,false);assert.equal(t.root.userData.plantDuctRouteVerified,false);
  }finally{s.dispose();t.dispose();}
 }
});
