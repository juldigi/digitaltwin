import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
const ids=['BMJ-MCH-0033','BMJ-MCH-0034','BMJ-MCH-0035'];
const effective=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};

test('batch33 cabinet controls louvres stripe and grille contact actual support triangles through explode',()=>{
 for(const id of ids){const t=createPolishedMachineTemplate(id);
  try{t.setExteriorOpen(false);
   const role=r=>t.meshes.filter(m=>m.userData.mechanismRole===r);
   const cab=t.findNode('compressor-package-cabinet'),service=t.findNode('compressor-service-v236-'+t.cfg.machine.no);
   assert.equal(service.parent,cab);assert.equal(service.userData.explode.length(),0);
   const doors=role('compressor-service-door-reference'),rear=role('compressor-cabinet-rear-panel-reference'),top=role('compressor-cabinet-top-panel-reference'),bezel=role('compressor-controller-bezel-reference');
   const check=(m,support,axis,side)=>{
    const b=new T.Box3().setFromObject(m),point=m.getWorldPosition(new T.Vector3());point[axis]=side>0?b.max[axis]:b.min[axis];
    const d=new T.Vector3();d[axis]=side;
    const hit=new T.Raycaster(point.clone().addScaledVector(d,-.04),d).intersectObjects(support)[0];
    assert.ok(hit,id+':'+m.userData.mechanismRole+' missing support triangle');assert.ok(hit.point.distanceTo(point)<1e-6,id+':'+m.userData.mechanismRole+' detached/penetrating');
   };
   for(const fraction of [0,.3,1]){t.explode(fraction);t.root.updateMatrixWorld(true);
    check(bezel[0],doors,'z',1);check(role('compressor-controller-display-reference')[0],bezel,'z',1);check(role('compressor-brand-family-accent-reference')[0],doors,'z',1);
    for(const m of role('compressor-intake-louvre-reference'))check(m,rear,'z',-1);
    for(const m of role('compressor-top-exhaust-grille-reference'))check(m,top,'y',-1);
   }
  }finally{t.dispose();}
 }
});

test('batch33 duplicate skins stay retired and scoped taxonomy inspection preserves modes and lifecycle',()=>{
 for(const id of ids){const t=createPolishedMachineTemplate(id),s=createMachineSimulation(id,t.root,t);
  try{
   const retired=t.meshes.filter(m=>m.userData.replacedByUnifiedCabinet);assert.equal(retired.length,13);
   const check=()=>assert.ok(retired.every(m=>!effective(m)),id);
   for(const order of [0,1]){
    s.start();if(order){t.setLow(true);t.setExteriorOpen(true);}else{t.setExteriorOpen(true);t.setLow(true);}check();
    t.setExteriorOpen(false);t.setLow(false);check();
    for(const node of t.taxonomy){
     for(const ref of node.meshRefs||[])assert.ok(t.findNode(ref),id+':'+ref);
     const target=t.resolveTaxonomyNode(node.id);t.isolate(target);t.highlight(target);t.ghost(true,target);t.showOnly([target],true);check();
     t.reset();check();
    }
    s.update(1000);s.pause();const elapsed=s.elapsed;s.update(4000);assert.equal(s.elapsed,elapsed);s.resume();s.update(5000);s.update(5200);check();s.stop();check();s.start();check();s.stop();
   }
   assert.equal(t.root.userData.exactCompressorModelVerified,false);assert.equal(t.root.userData.plantCompressedAirRouteVerified,false);
  }finally{s.dispose();t.dispose();}
 }
});

test('batch33 every air oil and distribution branch keeps inherited continuous family routes and evidence boundaries',()=>{
 for(const id of ids){const t=createPolishedMachineTemplate(id),s=createMachineSimulation(id,t.root,t);
  try{s.start();t.setExteriorOpen(true);s.setPathVisible(true);
   for(const item of s.compressorParticles){
    if(item.kind==='air'||item.kind==='oil')for(const q of item.kind==='oil'?[.25,.50,.75]:[.12,.28,.45,.58,.70]){
     const at=phase=>{s.elapsed=((phase-item.phase+1)%1)*s.cycle;s.updateCompressor();return item.mesh.getWorldPosition(new T.Vector3());};t.root.updateMatrixWorld(true);assert.ok(at(q-1e-7).distanceTo(at(q+1e-7))<1e-5,id+':'+item.kind);
    }
    if(item.kind==='distribution'){
     assert.equal(item.mesh.parent,t.findNode('compressor-ring-main-reference'));
     for(const phase of [.10,.20,.31,.33,.50,.90]){s.elapsed=((phase-item.phase+1)%1)*s.cycle;s.updateCompressor();s.setPathVisible(false);s.setPathVisible(true);assert.equal(item.mesh.visible,phase>=.32);}
    }
   }
   const profile=s.state().compressorPressureProfile;assert.equal(t.root.userData.pressureValuesAreNormalized,true);assert.ok(profile);
  }finally{s.dispose();t.dispose();}
 }
});
