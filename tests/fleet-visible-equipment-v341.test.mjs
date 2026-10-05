import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {visibleMachineBounds,auditMachineFleet} from '../scripts/audit-machine-fleet.mjs';
import {auditTaxonomyClickResolution} from '../scripts/audit-taxonomy-click-resolution.mjs';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {buildIpalPhotoDerivedV3,updateIpalPhotoDerivedV3} from '../frontend/src/merge-sources/20260925/utility-building-v4/utility/ipal/ipal-photo-derived-v3.js';
import {DIANA_EYE55_TAXONOMY} from '../frontend/src/data/taxonomy-diana-eye55.js';
import {SHARK_N650_TAXONOMY} from '../frontend/src/data/taxonomy-shark-n650.js';
import {QF100CS_TAXONOMY} from '../frontend/src/data/taxonomy-qf100cs.js';

test('visible bounds exclude hidden ancestors rather than certifying invisible geometry',()=>{
 const root=new THREE.Group(),hidden=new THREE.Group();root.add(hidden);hidden.visible=false;
 root.add(new THREE.Mesh(new THREE.BoxGeometry(2,2,2)));
 hidden.add(new THREE.Mesh(new THREE.BoxGeometry(100,100,100)));
 assert.deepEqual(visibleMachineBounds(root).getSize(new THREE.Vector3()).toArray(),[2,2,2]);
});

test('all 41 machines preserve their actually visible equipment silhouette at home LOD',()=>{
 const report=auditMachineFleet();assert.equal(report.passed,41,JSON.stringify(report.failures));
});

test('all taxonomy mesh references exist, including partially mapped nodes',()=>{
 const report=auditTaxonomyClickResolution();assert.equal(report.failed,0,JSON.stringify(report.failures));
});

test('inspection recipe logic is software and physical controls resolve to actual geometry',()=>{
 for(const taxonomy of [DIANA_EYE55_TAXONOMY,SHARK_N650_TAXONOMY])for(const node of taxonomy.filter(n=>n.id.includes('.RECIPE'))){
  assert.equal(node.kind,'software');assert.deepEqual(node.meshRefs,[]);
  assert.doesNotMatch(node.name,/bearing|fastener|bracket|mechanical/i);
 }
 for(const [id,taxonomy,pattern] of [['BMJ-MCH-0019',DIANA_EYE55_TAXONOMY,/\.HMI(?:\.|$)/],['BMJ-MCH-0021',QF100CS_TAXONOMY,/\.XY\.[XY](?:\.|$)/]]){
  const template=createPolishedMachineTemplate(id);
  try{for(const node of taxonomy.filter(n=>pattern.test(n.id))){let meshes=0;for(const ref of node.meshRefs)template.findNode(ref)?.traverse(o=>{if(o.isMesh)meshes++;});assert.ok(meshes>0,node.id);}}
  finally{template.dispose();}
 }
});

test('unverified factory distribution belongs to interior study and round-trips through LOD',()=>{
 for(const [id,refs] of [['BMJ-MCH-0029',['compressor-air-distribution']],['BMJ-MCH-0036',['ahu-supply-duct','ahu-return-duct','ahu-outdoor-intake']],['BMJ-MCH-0040',['sansin-indoor-outdoor-interconnect','sansin-return-duct']]]){
  const t=createPolishedMachineTemplate(id);
  try{for(const low of [false,true,false]){
   t.setLow(low);t.setExteriorOpen(false);for(const ref of refs)assert.equal(t.findNode(ref).visible,false,ref);
   t.isolate(null,false);t.showOnly([],false);t.reset();for(const ref of refs)assert.equal(t.findNode(ref).visible,false,ref+' after selection reset');
   t.setExteriorOpen(true);for(const ref of refs)assert.equal(t.findNode(ref).visible,true,ref);
  }}finally{t.dispose();}
 }
});

test('photo-derived IPAL stairs are connected and pump flange aligns with the shaft',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),found={};
 built.root.traverse(o=>{const sem=o.userData.semantic;if(sem)(found[sem]??=[]).push(o);});
 assert.equal(found.IPAL_PHOTO_TANK_STAIR_STRINGER.length,20);
 assert.equal(found.IPAL_PHOTO_TANK_STAIR_CONTINUOUS_HANDRAIL.length,10);
 for(const flange of found.IPAL_PHOTO_PUMP_FLANGE){
  const axis=new THREE.Vector3(0,1,0).applyQuaternion(flange.quaternion);
  assert.ok(Math.abs(axis.x)>.999);
 }
 assert.equal(found.IPAL_PHOTO_PUMP_MOUNTING_FOOT.length,6);
});

test('IPAL utility source rotates only its coupling and narrows hopper cones towards the outlet',()=>{
 const root=buildIpalPhotoDerivedV3({includeCanopy:false,includePaving:false});let motor,cone,legs=[];
 root.traverse(o=>{if(o.userData.semantic==='PUMP_MOTOR_REFERENCE')motor=o;if(o.userData.semantic==='IPAL_HOPPER_VESSEL_1_HOPPER_CONE')cone=o;if(o.userData.semantic==='IPAL_HOPPER_VESSEL_1_LEG')legs.push(o);});
 const q=motor.quaternion.clone(),rotor=root.userData.animation.pumpRotor;
 for(let i=0;i<90;i++)updateIpalPhotoDerivedV3(root,1/60,{localPumpRunning:true});
 assert.ok(motor.quaternion.equals(q));assert.ok(rotor.rotation.x>0);
 assert.ok(cone.geometry.parameters.radiusTop>cone.geometry.parameters.radiusBottom);
 for(const leg of legs)assert.ok(leg.position.y+leg.geometry.parameters.height/2>=cone.position.y+cone.geometry.parameters.height/2);
});
