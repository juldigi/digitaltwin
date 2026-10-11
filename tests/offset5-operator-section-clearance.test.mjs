import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {OFFSET5_INKING_ROLLERS,OFFSET5_INK_DISTRIBUTORS,OFFSET5_DAMPENING_ROLLERS} from '../frontend/src/data/sources-offset5.js';
const body=(t,id)=>t.findNode(id).children.find(o=>o.isMesh);
const center=m=>m.getWorldPosition(new THREE.Vector3());

test('all eight operator-view roller maps stay upright, preserve relative distances and fit their PU',()=>{
 const t=createPolishedMachineTemplate('offset5');try{
 for(let i=0;i<8;i++){
  const unit=t.findNode(`press-${i+1}`),plate=body(t,`press-${i}-cylinder-plate-body`),origin=center(plate);
  for(const [suffix,specs,prefix] of [['inking-train',OFFSET5_INKING_ROLLERS,'ink-roller'],['inking-distribution',OFFSET5_INK_DISTRIBUTORS,'ink-distributor'],['dampening-form',OFFSET5_DAMPENING_ROLLERS,'damp-roller']]){
   const section=t.findNode(`press-${i}-${suffix}`);assert.equal(section.rotation.z,0);
   for(const spec of specs){const m=body(t,`press-${i}-${prefix}-${spec.code}-body`),p=center(m);
    assert.ok(Math.abs(p.y-spec.sectionCenter[1])<1e-6,'section must not be tilted');
    assert.ok(Math.abs(p.x-origin.x+spec.sectionCenter[0]-.16)<1e-6,'mirror must pivot on the unchanged plate axis');
    const b=new THREE.Box3().setFromObject(m),half=i===0?.59:.61;assert.ok(b.min.x>=unit.position.x-half&&b.max.x<=unit.position.x+half);
   }
  }
  assert.ok(center(body(t,`press-${i}-damp-roller-18-body`)).x<origin.x,'water zone is to viewer right from operator side');
 }
 }finally{t.dispose();}
});

test('world-space fountain duct and inclined liner do not intersect the numbered roller bodies',()=>{
 const t=createPolishedMachineTemplate('offset5');try{
 for(let i=0;i<8;i++){
  const duct=body(t,`press-${i}-ink-fountain-roller-body`),d=center(duct),linerMeshes=[];
  for(const suffix of ['fountain-liner','top-deck','fountain-support'])t.findNode(`press-${i}-${suffix}`).traverse(m=>{if(m.isMesh)linerMeshes.push(m);});
  for(const spec of [...OFFSET5_INKING_ROLLERS,...OFFSET5_INK_DISTRIBUTORS]){
   const prefix=/^[A-D]$/.test(spec.code)?'ink-distributor':'ink-roller',m=body(t,`press-${i}-${prefix}-${spec.code}-body`),p=center(m),r=spec.diameterMM*.00073;
   assert.ok(Math.hypot(p.x-d.x,p.y-d.y)-r-duct.geometry.parameters.radiusTop>0,`${i} fountain vs ${spec.code}`);
   for(const liner of linerMeshes){const g=liner.geometry,a=g.attributes.position,idx=g.index;let distance=Infinity;const tri=new THREE.Triangle(),closest=new THREE.Vector3();
    for(let j=0;j<(idx?.count||a.count);j+=3){[tri.a,tri.b,tri.c].forEach((v,k)=>v.fromBufferAttribute(a,idx?idx.getX(j+k):j+k).applyMatrix4(liner.matrixWorld));tri.closestPointToPoint(p,closest);distance=Math.min(distance,p.distanceTo(closest));}
    assert.ok(distance>r+.003,`${i} liner intersects roller ${spec.code}: ${distance-r}`);
   }
  }
 }
 }finally{t.dispose();}
});

test('removable inking side plates stay hidden in cutaway after detail and reset changes',()=>{
 const t=createPolishedMachineTemplate('offset5');try{
 const covers=[];for(let i=0;i<8;i++)for(const suffix of ['inking-train','inking-distribution'])t.findNode(`press-${i}-${suffix}`).traverse(m=>{if(m.isMesh&&m.userData.exteriorCover)covers.push(m);});assert.equal(covers.length,16);
 for(const low of [true,false]){t.setExteriorOpen(true);t.setLow(low);t.reset();assert.ok(covers.every(m=>!m.visible&&!m.userData.puInteriorOnly));}
 for(let i=0;i<8;i++)assert.equal(t.findNode(`press-${i}-drive-gears`).userData.guardGeometry,'UNVERIFIED_INSTALLED_GUARD__NO_SOLID_PROXY');
 }finally{t.dispose();}
});

test('mirrored upper roller spin keeps the documented world rotation sense',()=>{
 const t=createPolishedMachineTemplate('offset5'),s=createMachineSimulation('offset5',t.root,t);try{
 const rotor=s.rotors.find(r=>r.role==='PU1-ink-roller-1');assert.ok(rotor);assert.equal(rotor.mesh.userData.sectionHandedness,-1);
 const q=rotor.mesh.quaternion.clone(),radial=new THREE.Vector3(.02,0,0);t.root.updateMatrixWorld(true);const before=rotor.mesh.localToWorld(radial.clone()).sub(center(rotor.mesh));s.start();s.update(1000);s.update(1040);t.root.updateMatrixWorld(true);const after=rotor.mesh.localToWorld(radial.clone()).sub(center(rotor.mesh));assert.equal(Math.sign(before.x*after.y-before.y*after.x),Math.sign(rotor.sign),'reflection must not reverse the documented visible rotation');assert.notDeepEqual(rotor.mesh.quaternion.toArray(),q.toArray());s.stop();assert.deepEqual(rotor.mesh.quaternion.toArray(),q.toArray());
 }finally{s.dispose();t.dispose();}
});

test('both inspection pods use the photographed inclined face without moving their optical mounts',()=>{
 const t=createPolishedMachineTemplate('offset5');try{
 for(const side of ['a','b']){
  const casing=t.findNode(`inspection-camera-${side}-casing`),pod=t.findNode(`inspection-camera-${side}`);let housing,face;casing.traverse(m=>{if(m.userData.photoAngledCameraCasing)housing=m;if(m.userData.photoInclinedCameraFace)face=m;});
  assert.ok(housing&&face);assert.equal(housing.geometry.type,'ExtrudeGeometry');assert.ok(Math.abs(face.rotation.z)>.4);const bounds=new THREE.Box3().setFromObject(casing),lens=t.findNode(`inspection-camera-${side}-lens`).children.find(m=>m.userData.inspectionLens);assert.ok(center(lens).y<bounds.min.y,'lens remains exposed below the supported housing');
 }
 }finally{t.dispose();}
});


test('oscillating ink vibrator remains clear of the liner over complete simulation cycles',()=>{
 const t=createPolishedMachineTemplate('offset5'),s=createMachineSimulation('offset5',t.root,t);try{
 const m=body(t,'press-0-ink-roller-15-body'),linerMeshes=[];t.findNode('press-0-fountain-liner').traverse(o=>{if(o.isMesh)linerMeshes.push(o);});s.start();
 for(let frame=0;frame<150;frame++){s.update(1000+frame*40);t.root.updateMatrixWorld(true);const p=center(m);
  for(const liner of linerMeshes){const g=liner.geometry,a=g.attributes.position,idx=g.index,tri=new THREE.Triangle(),closest=new THREE.Vector3();let distance=Infinity;
   for(let j=0;j<(idx?.count||a.count);j+=3){[tri.a,tri.b,tri.c].forEach((v,k)=>v.fromBufferAttribute(a,idx?idx.getX(j+k):j+k).applyMatrix4(liner.matrixWorld));tri.closestPointToPoint(p,closest);distance=Math.min(distance,p.distanceTo(closest));}
   assert.ok(distance-m.geometry.parameters.radiusTop>.008,`moving vibrator intersects liner at frame ${frame}`);
  }
 }
 assert.ok(s.elapsed>5,'test must advance simulation time rather than repeat a static timestamp');
 }finally{s.dispose();t.dispose();}
});
