import * as THREE from 'three';

const finiteNumber=v=>Number.isFinite(v);
const finiteVector=v=>v&&finiteNumber(v.x)&&finiteNumber(v.y)&&finiteNumber(v.z);
const finiteQuaternion=q=>q&&finiteNumber(q.x)&&finiteNumber(q.y)&&finiteNumber(q.z)&&finiteNumber(q.w);
const movingMesh=o=>Boolean(
 o?.userData?.rotor||o?.userData?.driveRotor||o?.userData?.motion||o?.userData?.reciprocator||
 o?.userData?.platenMoving||o?.userData?.clampMoving||o?.userData?.rotatingAssembly||
 o?.userData?.gripperBar||o?.userData?.deliveryGripperBar||o?.userData?.jogger||o?.userData?.rejectPlate
);

function tuneMaterial(material){
 if(!material?.isMaterial||material.userData?.bmjPresentationV233)return;
 material.userData={...(material.userData||{}),bmjPresentationV233:true,baseOpacity:material.userData?.baseOpacity??material.opacity};
 if('roughness' in material&&'metalness' in material){
  if(material.transparent||material.opacity<.94){
   material.metalness=0;
   material.roughness=THREE.MathUtils.clamp(material.roughness,.12,.42);
   material.depthWrite=false;
  }else if(material.metalness>=.30){
   material.metalness=THREE.MathUtils.clamp(material.metalness,.45,.72);
   material.roughness=THREE.MathUtils.clamp(material.roughness,.28,.52);
  }else if(material.roughness>=.72){
   material.metalness=0;
   material.roughness=THREE.MathUtils.clamp(material.roughness,.72,.92);
  }else{
   material.metalness=THREE.MathUtils.clamp(material.metalness,0,.18);
   material.roughness=THREE.MathUtils.clamp(material.roughness,.36,.66);
  }
  if('envMapIntensity' in material)material.envMapIntensity=Math.max(.9,material.envMapIntensity||1);
 }
 material.dithering=true;
 material.needsUpdate=true;
}

function tuneProcessLight(mesh){
 if(!mesh?.material||Array.isArray(mesh.material))return false;
 if(!(mesh.userData?.uvLamp||mesh.userData?.inspectionLight))return false;
 const material=mesh.material;
 if(!('emissive' in material))return false;
 material.emissive.copy(material.color);
 material.emissiveIntensity=Math.max(Number(material.emissiveIntensity)||0,.22);
 material.toneMapped=true;
 material.needsUpdate=true;
 mesh.castShadow=false;
 return true;
}

export function applyMachinePresentationPolish(template,key=''){
 if(!template?.root)return template;
 const root=template.root;
 if(root.userData?.presentationPolishRevision==='V233')return template;

 const uniqueMaterials=new Set();
 const stats={
  key:String(key||root.userData?.assetId||''),
  meshes:0,opaqueMeshes:0,transparentMeshes:0,processLights:0,
  invalidTransforms:0,invalidGeometryBounds:0,coverMotionConflicts:0,zeroScaleMeshes:0
 };

 root.updateMatrixWorld(true);
 root.traverse(object=>{
  if(!object.isMesh)return;
  stats.meshes++;
  if(!finiteVector(object.position)||!finiteVector(object.scale)||!finiteQuaternion(object.quaternion))stats.invalidTransforms++;
  if(Math.abs(object.scale.x)<1e-7||Math.abs(object.scale.y)<1e-7||Math.abs(object.scale.z)<1e-7)stats.zeroScaleMeshes++;

  const geometry=object.geometry;
  if(geometry?.attributes?.position){
   if(!geometry.boundingBox)geometry.computeBoundingBox();
   if(!geometry.boundingSphere)geometry.computeBoundingSphere();
   const b=geometry.boundingBox;
   if(!b||!finiteVector(b.min)||!finiteVector(b.max))stats.invalidGeometryBounds++;
  }

  const materials=Array.isArray(object.material)?object.material:[object.material];
  let transparent=false;
  for(const material of materials){
   if(!material)continue;
   uniqueMaterials.add(material);
   tuneMaterial(material);
   if(material.transparent||material.opacity<.94)transparent=true;
  }
  if(transparent){
   stats.transparentMeshes++;
   object.castShadow=false;
   object.receiveShadow=false;
   object.renderOrder=Math.max(object.renderOrder||0,2);
  }else{
   stats.opaqueMeshes++;
   object.castShadow=true;
   object.receiveShadow=true;
  }

  if(tuneProcessLight(object))stats.processLights++;
  if(object.userData?.exteriorCover&&movingMesh(object))stats.coverMotionConflicts++;
 });

 root.updateMatrixWorld(true);
 const box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3());
 if(!finiteVector(box.min)||!finiteVector(box.max)||!finiteVector(size))stats.invalidTransforms++;

 stats.materials=uniqueMaterials.size;
 stats.envelope=size.toArray();
 stats.bounds={min:box.min.toArray(),max:box.max.toArray()};
 stats.valid=stats.meshes>0&&stats.invalidTransforms===0&&stats.invalidGeometryBounds===0&&stats.zeroScaleMeshes===0&&stats.coverMotionConflicts===0;

 root.userData.presentationPolishRevision='V233';
 root.userData.presentationPolish='PHYSICALLY_PLAUSIBLE_SURFACE_SHADOW_AND_GLASS_PASS';
 root.userData.presentationGeometryPolicy='NO_GENERIC_GEOMETRY_REPLACEMENT__PRESERVE_MACHINE_SPECIFIC_TEMPLATE';
 root.userData.presentationAudit=Object.freeze(stats);
 return template;
}
