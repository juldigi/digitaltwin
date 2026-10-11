import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
const fixture=()=>{const t=createPolishedMachineTemplate('offset5');return {t,s:createMachineSimulation('offset5',t.root,t)};};
test('delivery brake and sprocket triangles remain round while the sheet clears all brake surfaces',()=>{
 const {t,s}=fixture();try{const rollers=s.rotors.filter(r=>['sheet-brake-roller','delivery-chain-sprocket'].includes(r.role));assert.equal(rollers.length,7);const points=Array.from({length:18000},(_,i)=>s.curve.getPointAt(i/17999)),ray=new T.Raycaster();s.start();
 for(let f=0;f<28;f++){s.update(1000+f*33);t.root.updateMatrixWorld(true);for(const r of rollers){const m=r.mesh,c=m.getWorldPosition(new T.Vector3()),a=m.geometry.attributes.position,radius=m.geometry.parameters.radiusTop;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld),rad=Math.hypot(p.x-c.x,p.y-c.y);assert.ok(rad<1e-6||Math.abs(rad-radius)<1e-6,`oval ${r.role}`);}if(r.role==='sheet-brake-roller')for(const p of points){if(Math.abs(p.x-c.x)>radius+.002)continue;ray.set(new T.Vector3(p.x,2,c.z),new T.Vector3(0,-1,0));const hit=ray.intersectObject(m,false)[0];if(hit)assert.ok(p.y-hit.point.y>.0005,`brake penetration ${p.y-hit.point.y}`);}}}
 s.stop();for(const r of rollers)assert.ok(r.mesh.quaternion.angleTo(r.initial)<1e-8);
 }finally{s.dispose();t.dispose();}
});
test('delivery frame clears the sheet plane and joggers approach its sides without entering the table',()=>{
 const {t,s}=fixture();try{t.root.updateMatrixWorld(true);const frame=t.findNode('delivery-frame'),ray=new T.Raycaster();for(let i=0;i<=12000;i++){const p=s.curve.getPointAt(i/12000);if(p.x<14.75||p.x>15.5)continue;ray.set(p,new T.Vector3(0,1,0));const up=ray.intersectObject(frame,true)[0];assert.ok(!up||up.distance>.05,'crossmember obstructs sheet');}
 s.start();for(let f=0;f<450;f++){s.update(1000+f*25);t.root.updateMatrixWorld(true);for(const side of ['ds','os']){const node=t.findNode(`delivery-jogger-${side}`),b=new T.Box3().setFromObject(node);const gap=side==='ds'?b.min.z-.51:-.51-b.max.z;assert.ok(gap>=.0009&&gap<.014,'jogger gap');assert.ok(b.min.y>.2505&&b.min.y<.253,'jogger/table clearance');}}
 for(const low of [true,false]){t.setLow(low);t.setExteriorOpen(true);assert.equal(t.findNode('delivery-gripper-bar-reference').visible,false);for(const m of t.realismMeshes.filter(m=>m.userData.realismRole==='preset-plus-delivery-touch-console')){assert.equal(m.visible,false);assert.equal(m.userData.installedVerified,false);}}
 }finally{s.dispose();t.dispose();}
});
test('pile support shoes follow the table and the transport speed actually falls in the brake zone',()=>{
 const {t,s}=fixture();try{s.start();const sheet=s.sheets[0];s.updateSheet(sheet,s.pathLength);for(let i=0;i<15;i++)s.depositSheet(sheet,i);assert.ok(Math.abs(s.deliveryLiftShoes.position.y-s.deliveryLiftShoesInitialY+s.deliveryTableDrop)<1e-9);const profile=s.transportProfile;let min=1;for(let i=1;i<profile.length;i++){const a=profile[i-1],b=profile[i],ratio=(b.pathDistance-a.pathDistance)/(b.timeDistance-a.timeDistance);min=Math.min(min,ratio);}assert.ok(min>.819&&min<.821);assert.equal(s.state().installedDeliveryChainTopologyVerified,false);s.stop();assert.equal(s.deliveryLiftShoes.position.y,s.deliveryLiftShoesInitialY);
 }finally{s.dispose();t.dispose();}
});
