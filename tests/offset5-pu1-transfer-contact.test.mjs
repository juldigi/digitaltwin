import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {OFFSET5_UNIT_CENTERS} from '../frontend/src/data/dimensions-offset5.js';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
const body=(t,i,k)=>t.findNode(`press-${i}-cylinder-${k}-body`).children.find(m=>m.geometry?.type==='CylinderGeometry');
test('All eight PU primary cylinders meet without overlap and bearing caps are concentric',()=>{
 const t=createPolishedMachineTemplate('offset5');try{t.root.updateMatrixWorld(true);
 for(let i=0;i<8;i++){
  for(const [a,b]of[['plate','blanket'],['blanket','impression'],['impression','transfer']]){
   const x=body(t,i,a),y=body(t,i,b),gap=x.getWorldPosition(new T.Vector3()).distanceTo(y.getWorldPosition(new T.Vector3()))-x.geometry.parameters.radiusTop-y.geometry.parameters.radiusTop;assert.ok(Math.abs(gap-(a==='blanket'?.004:.002))<1e-7,`${a}/${b}: ${gap}`);
  }
  for(const k of ['plate','blanket','impression','transfer']){const c=body(t,i,k).getWorldPosition(new T.Vector3());let count=0;t.findNode(`press-${i}-cylinder-${k}`).traverse(m=>{if(m.userData.detailRole===`${k}-bearing-cap-reference`||m.userData.realismRole===`${k}-bearing-cap-reference`){const p=m.getWorldPosition(new T.Vector3());assert.ok(Math.hypot(p.x-c.x,p.y-c.y)<1e-7);count++;}});assert.equal(count,2);}
 }
 }finally{t.dispose();}
});
test('All eight impression grippers follows the cylinder orbit, and unsupported transfer proxies stay hidden',()=>{
 const t=createPolishedMachineTemplate('offset5'),s=createMachineSimulation('offset5',t.root,t);try{
 s.start();for(let frame=0;frame<35;frame++){s.update(1000+frame*35);t.root.updateMatrixWorld(true);for(let i=0;i<8;i++){const g=t.findNode(`press-${i}-impression-gripper`),p=g.localToWorld(new T.Vector3(.13,1.21,0)),c=body(t,i,'impression').getWorldPosition(new T.Vector3());assert.ok(Math.abs(Math.hypot(p.x-c.x,p.y-c.y)-.26)<1e-7,`PU${i+1}`);}}
 const hiddenIds=Array.from({length:8},(_,i)=>`press-${i}-drive-gears`);for(let i=1;i<=7;i++)for(const part of ['shaft','spring'])hiddenIds.push(`transfer-pu${i}-pu${i+1}-gripper-${part}`);
 for(const low of [true,false]){t.setExteriorOpen(true);t.setLow(low);t.reset();t.root.traverse(m=>{if(m.userData.puAuditHidden)assert.equal(m.visible,false);});for(const id of hiddenIds){const node=t.findNode(id);let meshes=0;node.traverse(m=>{if(m.isMesh){meshes++;let visible=true;for(let p=m;p;p=p.parent)visible=visible&&p.visible;assert.equal(visible,false,`${id} must stay hidden after batching and reset`);}});assert.ok(meshes>0);}}
 for(let i=1;i<=7;i++)assert.equal(t.findNode(`transfer-pu${i}-pu${i+1}`).userData.installedTopologyVerified,false);
 s.stop();for(let i=0;i<8;i++)assert.equal(t.findNode(`press-${i}-impression-gripper`).rotation.z,0);
 }finally{s.dispose();t.dispose();}
});

test('audited sheet centerline does not penetrate all eight PU cylinders and follows the transfer reference surface',()=>{
 const t=createPolishedMachineTemplate('offset5'),s=createMachineSimulation('offset5',t.root,t);try{t.root.updateMatrixWorld(true);const contacts=new Array(7).fill(0);
 for(let i=0;i<=12000;i++){const p=s.curve.getPointAt(i/12000);if(p.x<OFFSET5_UNIT_CENTERS[0]-.6||p.x>OFFSET5_UNIT_CENTERS.at(-1)+.6)continue;
  for(let u=0;u<8;u++)for(const k of ['impression','blanket']){const m=body(t,u,k),c=m.getWorldPosition(new T.Vector3());assert.ok(Math.hypot(p.x-c.x,p.y-c.y)>=m.geometry.parameters.radiusTop+.0009);}
  for(let bay=0;bay<7;bay++){const cx=(OFFSET5_UNIT_CENTERS[bay]+OFFSET5_UNIT_CENTERS[bay+1])/2;if(Math.abs(p.x-cx)<.21){assert.ok(Math.abs(Math.hypot(p.x-cx,p.y-.70)-.237)<1e-7,`bay ${bay+1}`);contacts[bay]++;}}
 }assert.ok(contacts.every(count=>count>50),String(contacts));
 }finally{s.dispose();t.dispose();}
});
