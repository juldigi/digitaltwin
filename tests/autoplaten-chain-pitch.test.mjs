import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {MK920MachineTemplate} from '../frontend/src/mk920.js';
import {MK920StampingSimulation} from '../frontend/src/simulation-mk920.js';
import {MK1060MachineTemplate} from '../frontend/src/mk1060.js';
import {MK1060ProcessSimulation} from '../frontend/src/simulation-mk1060.js';
import {Promatrix106MachineTemplate} from '../frontend/src/promatrix106.js';
import {Promatrix106ProcessSimulation} from '../frontend/src/simulation-promatrix106.js';
import {APM2MachineTemplate} from '../frontend/src/apm2.js';

for(const [label,Model,Simulation,args] of [
 ['APM-5/6 MK 920',MK920MachineTemplate,MK920StampingSimulation,[]],
 ['APM-7 MK 1060',MK1060MachineTemplate,MK1060ProcessSimulation,[]],
 ['APM-8/9 Promatrix 106',Promatrix106MachineTemplate,Promatrix106ProcessSimulation,[]]
])test(`${label}: each process cycle indexes grippers by one bar pitch and restart clears output`,()=>{
 const model=new Model(...args),sim=new Simulation(model.root,model);
 assert.ok(sim.gripperBars.length>1);
 sim.updateGrippers(0);
 const first=sim.gripperBars.map(b=>b.position.clone());
 sim.updateGrippers(1);
 for(let i=0;i<first.length;i++){
  const next=first[(i+1)%first.length];
  assert.ok(sim.gripperBars[i].position.distanceTo(next)<1e-9,`bar ${i} should advance exactly one pitch`);
 }
 sim.start();
 for(const p of sim.stack||sim.blankStack||sim.productStack)p.visible=true;
 for(const p of sim.wastePieces||sim.waste||[])p.visible=true;
 for(const p of sim.tieSheets||[])p.visible=true;
 sim.start();
 assert.equal(sim.state().pileSheetsVisible,0);
 assert.equal(sim.state().wastePiecesVisible||0,0);
 assert.equal(sim.state().tieSheetsVisible||0,0);
 sim.dispose();model.dispose();
});

for(const [label,Model,feederId,internalIds] of [
 ['MK 920',MK920MachineTemplate,'mk920-feeder',['mk920-feeder-pile','mk920-feeder-head']],
 ['MK 1060',MK1060MachineTemplate,'mk1060-feeder',['mk1060-feeder-pile','mk1060-feeder-head']],
 ['Promatrix 106',Promatrix106MachineTemplate,'pm106-feeder',['pm106-feeder-pile','pm106-feeder-head']]
])test(`${label}: feeder shell clears the pile and suction head`,()=>{
 const model=new Model(),feeder=model.findNode(feederId),covers=[];
 feeder.traverse(o=>{if(o.isMesh&&o.userData.exteriorCover)covers.push(new THREE.Box3().setFromObject(o));});
 assert.ok(covers.length>=6,'feeder retains a supported exterior frame');
 for(const id of internalIds){const box=new THREE.Box3().setFromObject(model.findNode(id));
  assert.ok(covers.every(cover=>!cover.intersectsBox(box)),`${id} intersects the exterior cover`);
 }
 model.dispose();
});

for(const [label,Model,nodeId,x,y,z] of [
 ['APM-2',APM2MachineTemplate,'apm2-platen-housing',-.08,1.48,-1],
 ['APM-5/6',MK920MachineTemplate,'mk920-access',.21,1.705,-1],
 ['APM-7',MK1060MachineTemplate,'mk1060-access',-.82,1.65,-1],
 ['APM-8/9',Promatrix106MachineTemplate,'pm106-access',-.72,1.65,-1]
])test(`${label}: operator window is a real opening in the exterior`,()=>{
 const model=new Model(),meshes=[];
 model.findNode(nodeId).traverse(o=>{if(o.isMesh)meshes.push(o);});
 model.root.updateMatrixWorld(true);
 const hits=new THREE.Raycaster(new THREE.Vector3(x,y,z*2.2),new THREE.Vector3(0,0,-z)).intersectObjects(meshes);
 assert.ok(hits.length>0&&hits[0].object.material.transparent,'operator-facing window must be glass');
 assert.ok(hits.filter(h=>h.point.z<-.5).every(h=>h.object.material.transparent),'opaque panel must not sit behind glass');
 model.dispose();
});

test('APM-7 delivery cover leaves the product conveyor visible',()=>{
 const model=new MK1060MachineTemplate(),delivery=model.findNode('mk1060-waste'),product=model.findNode('mk1060-product-delivery');
 const covers=[];delivery.traverse(o=>{if(o.isMesh&&o.userData.exteriorCover)covers.push(new THREE.Box3().setFromObject(o));});
 const productBox=new THREE.Box3().setFromObject(product);
 assert.ok(covers.length>=6);
 assert.ok(covers.every(c=>!c.intersectsBox(productBox)));
 model.dispose();
});

test('APM-5/6 foil reels and rewind have carriers tied into the upper frame',()=>{
 const model=new MK920MachineTemplate(),unwind=model.findNode('mk920-foil-unwind'),waste=model.findNode('mk920-foil-waste');
 const carrier=[];for(const node of [unwind,waste])node.traverse(o=>{if(o.isMesh&&o.userData.foilCarrier)carrier.push(o);});
 assert.ok(carrier.length>=15);
 const frame=new THREE.Box3().setFromObject(model.findNode('mk920-access-frame'));
 assert.ok(carrier.some(o=>new THREE.Box3().setFromObject(o).intersectsBox(frame)));
 for(const z of [-.78,0,.78])for(const node of [unwind,waste]){
  const supports=carrier.filter(o=>o.parent===node&&Math.abs(o.position.z-z)<.25&&o.position.y>2.60);
  assert.ok(supports.length>=2,`${node.name} reel ${z} needs paired shaft supports`);
 }
 assert.equal(model.resolveTaxonomyNode('MK920.FOIL.UNWIND'),unwind);
 assert.equal(model.resolveTaxonomyNode('MK920.FOIL.WASTE'),waste);
 for(const [id,label] of [['MK920.FOIL.UNWIND.A1','Removable foil carrier rail'],['MK920.FOIL.WASTE.A2','Rewind spindle supports'],['MK920.ACCESS.GUARD.A2','Glazed inspection aperture']]){
  assert.equal(model.taxonomyById.get(id)?.name,label);
 }
 model.dispose();
});
