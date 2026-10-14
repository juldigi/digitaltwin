import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

test('CTP wrapped triangle midpoints contact the actual drum facets throughout rotation',()=>{
 for(const id of ['BMJ-MCH-0025','BMJ-MCH-0026']){
  const t=createMachineTemplate(id),s=createMachineSimulation(id,t.root,t);
  try{ s.start();
   assert.ok(Math.abs(new T.Box3().setFromObject(s.ctpFlatPlate).min.y-.7175)<1e-6);
   for(const p of [.34,.45,.60,.75]){
    s.elapsed=s.cycle*p;s.updateCTP();t.root.updateMatrixWorld(true);
    const attr=s.ctpWrappedGeometry.attributes.position,indices=s.ctpWrappedGeometry.index;
    const center=s.ctp.drum.getWorldPosition(new T.Vector3());
    for(let i=0;i<indices.count;i+=3){
     const point=new T.Vector3();for(let j=0;j<3;j++)point.add(new T.Vector3().fromBufferAttribute(attr,indices.getX(i+j)));point.divideScalar(3).applyMatrix4(s.ctpWrappedPlate.matrixWorld);
     const radial=point.clone().sub(center);radial.z=0;radial.normalize();
     const ray=new T.Raycaster(point.clone().addScaledVector(radial,.05),radial.clone().negate());
     const hit=ray.intersectObject(s.ctp.drum,false)[0];assert.ok(hit,'drum side triangle missing');assert.ok(hit.point.distanceTo(point)<1e-6,'plate triangle must contact drum surface');
    }
   }
   s.elapsed=s.cycle*.99;s.updateCTP();t.root.updateMatrixWorld(true);assert.ok(Math.abs(new T.Box3().setFromObject(s.ctpFlatPlate).min.y-.7025)<1e-6);
  }finally{s.dispose();t.dispose();}
 }
});

test('LY300 timed print UV and camera passage stays in belt contact and restart clears output',()=>{
 const t=createMachineTemplate('BMJ-MCH-0024'),s=createMachineSimulation('BMJ-MCH-0024',t.root,t);
 try{ s.start();
  const card=s.items[0];
  for(const p of [.18,.30,.40,.45,.54,.57,.66,.70,.75]){
   s.elapsed=p*6.8;s.updateItems();t.root.updateMatrixWorld(true);
   const box=new T.Box3().setFromObject(card.group.children[0]);assert.ok(Math.abs(box.min.y-.6175)<1e-6);assert.ok(box.min.x>=-1.82-1e-6);assert.ok(box.max.x<=1.51+1e-6);
  }
  const selected=t.findNode('ly300-print'),other=t.findNode('ly300-transport');
  t.highlight(selected);let unrelated=0;other.traverse(m=>{if(m.isMesh){unrelated++;assert.equal(m.material.emissive.getHex(),0);}});assert.ok(unrelated>0);
  t.showOnly([selected],true);assert.equal(t.findNode('ly300-print-head').visible,true);t.showOnly([],false);
  s.outputPrevious({result:'PASS_DEMO'});s.outputPrevious({result:'REJECT_DEMO'});s.start();assert.equal(s.goodStack.some(m=>m.visible),false);assert.equal(s.badStack.some(m=>m.visible),false);
 }finally{s.dispose();t.dispose();}
});

test('Three-machine second pass preserves modes scoped inspection hidden options and lifecycle',()=>{
 for(const id of ['BMJ-MCH-0024','BMJ-MCH-0025','BMJ-MCH-0026']){
  const t=createMachineTemplate(id),s=createMachineSimulation(id,t.root,t);
  try{
   const target=t.findNode(id.endsWith('24')?'ly300-print':'ctp-drum');
   t.highlight(target);for(const m of t.meshes)if(!t.contains(target,m))assert.equal(m.material.emissive.getHex(),0);
   t.ghost(true,target);for(const m of t.meshes)if(t.contains(target,m))assert.equal(m.material.opacity,m.material.userData.baseOpacity??1);
   t.ghost(false);t.showOnly([target],true);t.showOnly([],false);t.explode(.5,target);t.explode(0);t.reset();
   for(const order of [0,1]){
    if(order){t.setLow(true);t.setExteriorOpen(true);}else{t.setExteriorOpen(true);t.setLow(true);}
    t.setExteriorOpen(false);t.setLow(false);t.reset();
    for(const m of t.meshes.filter(m=>m.userData.ctpUnverifiedMount))assert.equal(m.visible,false);
   }
   for(const n of t.taxonomy.filter(n=>n.level===6))for(const ref of n.meshRefs)assert.ok(t.findNode(ref),ref);
   s.start();s.update(1000);s.update(1100);s.pause();const before=s.elapsed;s.update(9000);assert.equal(s.elapsed,before);s.resume();s.update(10000);assert.equal(s.elapsed,before);s.stop();assert.equal(s.state().active,false);
  }finally{s.dispose();t.dispose();}
 }
});
