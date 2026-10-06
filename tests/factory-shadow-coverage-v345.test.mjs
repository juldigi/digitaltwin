import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {ShadowManager,visibleShadowBounds} from '../frontend/src/render/shadow-manager.js';
import {createIndustrialLighting} from '../frontend/src/render/lighting-system.js';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';
import {MACHINE_PLACEMENTS,loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {buildActualFactory} from '../frontend/src/factory-building.js';

function covered(light,bounds){
 light.updateMatrixWorld();light.target.updateMatrixWorld();light.shadow.updateMatrices(light);
 const camera=light.shadow.camera;
 for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
  const p=new T.Vector3(x,y,z).project(camera);
  assert.ok(Math.max(Math.abs(p.x),Math.abs(p.y),Math.abs(p.z))<=1+1e-6,'shadow frustum clips '+[x,y,z]);
 }
}

test('all 41 visible machine envelopes remain inside the shadow camera at actual placement scale',()=>{
 const scene=new T.Scene(),lighting=createIndustrialLighting(scene),manager=new ShadowManager(lighting.key);
 for(const placement of MACHINE_PLACEMENTS){
  const template=createPolishedMachineTemplate(placement.machineId);
  try{scene.add(template.root);const bounds=visibleShadowBounds(template.root);assert.ok(!bounds.isEmpty());manager.focusBounds(bounds);covered(lighting.key,bounds);}
  finally{scene.remove(template.root);template.dispose();}
 }
 lighting.dispose();assert.equal(scene.children.length,0);
});

test('hidden optical references and translucent process films do not inflate shadow bounds',()=>{
 const root=new T.Group(),g=new T.BoxGeometry(2,2,2),m=new T.MeshStandardMaterial(),mesh=new T.Mesh(g,m);root.add(mesh);
 const hidden=new T.Group();hidden.visible=false;root.add(hidden);const far=mesh.clone();far.position.x=10000;hidden.add(far);
 const glass=new T.Mesh(g,new T.MeshStandardMaterial({transparent:true,opacity:.4}));glass.position.z=10000;root.add(glass);
 assert.deepEqual(visibleShadowBounds(root).getSize(new T.Vector3()).toArray(),[2,2,2]);g.dispose();m.dispose();glass.material.dispose();
});

test('real factory and active IPAL are covered beyond the former 80 metre radius cap',async()=>{
 const built=buildActualFactory(await loadActualPlantLayout(),[]),scene=new T.Scene(),lighting=createIndustrialLighting(scene),manager=new ShadowManager(lighting.key);scene.add(built.root);
 try{
  const bounds=visibleShadowBounds(built.root);manager.focusBounds(bounds);covered(lighting.key,bounds);assert.ok(lighting.key.shadow.camera.right>80);
  assert.ok(lighting.key.target.position.distanceTo(bounds.getCenter(new T.Vector3()))<1e-6);
  let vessels=0,structures=0;built.root.traverseVisible(o=>{if(!o.isMesh||o.userData.evidenceLayer!=='PHOTO_ACTUAL')return;const semantic=o.userData.semantic||'';if(/HOPPER_CONE_VESSEL/.test(semantic)){assert.equal(o.castShadow,true);vessels++;}if(/CANOPY_COLUMN$/.test(semantic)){assert.equal(o.castShadow,true);structures++;}});
  assert.ok(vessels>0&&structures>0);
 }finally{built.disposeSurfaceDetails();const resources=new Set();built.root.traverse(o=>{if(o.geometry)resources.add(o.geometry);for(const m of [].concat(o.material||[]))resources.add(m);});for(const resource of resources)resource.dispose();lighting.dispose();}
});
