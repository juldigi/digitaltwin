import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
const body=(t,i,k)=>t.findNode(`press-${i}-cylinder-${k}-body`).children.find(m=>m.geometry?.type==='CylinderGeometry');
test('PU1 and PU2 primary cylinders meet without overlap and bearing caps are concentric',()=>{
 const t=createPolishedMachineTemplate('offset5');try{t.root.updateMatrixWorld(true);
 for(const i of [0,1]){
  for(const [a,b]of[['plate','blanket'],['blanket','impression'],['impression','transfer']]){
   const x=body(t,i,a),y=body(t,i,b),gap=x.getWorldPosition(new T.Vector3()).distanceTo(y.getWorldPosition(new T.Vector3()))-x.geometry.parameters.radiusTop-y.geometry.parameters.radiusTop;assert.ok(Math.abs(gap-(a==='blanket'?.004:.002))<1e-7,`${a}/${b}: ${gap}`);
  }
  for(const k of ['plate','blanket','impression','transfer']){const c=body(t,i,k).getWorldPosition(new T.Vector3());let count=0;t.findNode(`press-${i}-cylinder-${k}`).traverse(m=>{if(m.userData.detailRole===`${k}-bearing-cap-reference`||m.userData.realismRole===`${k}-bearing-cap-reference`){const p=m.getWorldPosition(new T.Vector3());assert.ok(Math.hypot(p.x-c.x,p.y-c.y)<1e-7);count++;}});assert.equal(count,2);}
 }
 }finally{t.dispose();}
});
test('PU1 impression gripper follows the cylinder orbit, and unsupported transfer proxies stay hidden',()=>{
 const t=createPolishedMachineTemplate('offset5'),s=createMachineSimulation('offset5',t.root,t);try{
 s.start();for(let frame=0;frame<35;frame++){s.update(1000+frame*35);t.root.updateMatrixWorld(true);const g=t.findNode('press-0-impression-gripper'),p=g.localToWorld(new T.Vector3(.13,1.21,0)),c=body(t,0,'impression').getWorldPosition(new T.Vector3());assert.ok(Math.abs(Math.hypot(p.x-c.x,p.y-c.y)-.26)<1e-7);}
 for(const low of [true,false]){t.setExteriorOpen(true);t.setLow(low);t.reset();t.root.traverse(m=>{if(m.userData.puAuditHidden)assert.equal(m.visible,false);});for(const id of ['press-0-drive-gears','press-1-drive-gears','transfer-pu1-pu2-gripper-shaft','transfer-pu1-pu2-gripper-spring']){const node=t.findNode(id);let meshes=0;node.traverse(m=>{if(m.isMesh){meshes++;let visible=true;for(let p=m;p;p=p.parent)visible=visible&&p.visible;assert.equal(visible,false,`${id} must stay hidden after batching and reset`);}});assert.ok(meshes>0);}}
 assert.equal(t.findNode('transfer-pu1-pu2').userData.installedTopologyVerified,false);
 s.stop();assert.equal(t.findNode('press-0-impression-gripper').rotation.z,0);
 }finally{s.dispose();t.dispose();}
});

test('audited sheet centerline does not penetrate PU1/PU2 cylinders and follows the transfer reference surface',()=>{
 const t=createPolishedMachineTemplate('offset5'),s=createMachineSimulation('offset5',t.root,t);try{t.root.updateMatrixWorld(true);let contacts=0;
 for(let i=0;i<=12000;i++){const p=s.curve.getPointAt(i/12000);if(p.x< -5.6||p.x> -2.6)continue;
  for(const u of [0,1])for(const k of ['impression','blanket']){const m=body(t,u,k),c=m.getWorldPosition(new T.Vector3());assert.ok(Math.hypot(p.x-c.x,p.y-c.y)>=m.geometry.parameters.radiusTop+.0009);}
  if(Math.abs(p.x+4.125)<.21){assert.ok(Math.abs(Math.hypot(p.x+4.125,p.y-.70)-.237)<1e-7);contacts++;}
 }assert.ok(contacts>50);
 }finally{s.dispose();t.dispose();}
});
