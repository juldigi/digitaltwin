import * as THREE from 'three';

// Reconstruct only untouched full-circle primitives. Grooved, translated,
// clipped, coloured or otherwise authored geometry remains authoritative.
export function refinedCylinder(geometry){
 const p=geometry?.parameters;
 if(geometry?.type!=='CylinderGeometry'||!p||geometry.morphAttributes?.position?.length||geometry.attributes.color)return null;
 const radius=Math.max(p.radiusTop,p.radiusBottom);
 if(radius<.05||p.radialSegments<12||p.radialSegments>=64||Math.abs(p.thetaLength-Math.PI*2)>1e-8)return null;
 if(radius<.07&&p.radialSegments>=24)return null;
 const values=[p.radiusTop,p.radiusBottom,p.height,p.radialSegments,p.heightSegments,p.openEnded,p.thetaStart,p.thetaLength];
 const reference=new THREE.CylinderGeometry(...values);
 const unchanged=['position','normal','uv'].every(name=>{
  const a=geometry.attributes[name]?.array,b=reference.attributes[name]?.array;
  return a&&b&&a.length===b.length&&a.every((v,i)=>Math.abs(v-b[i])<1e-7);
 });
 const sameIndex=geometry.index?.array.length===reference.index?.array.length&&geometry.index.array.every((v,i)=>v===reference.index.array[i]);
 reference.dispose();if(!unchanged||!sameIndex)return null;
 values[3]=Math.min(64,p.radialSegments*2);
 const result=new THREE.CylinderGeometry(...values);
 result.name=geometry.name;result.userData={...geometry.userData,roundComponentRevision:'V347',originalRadialSegments:p.radialSegments,dimensionPolicy:'PRESERVE_AUTHORED_RADIUS_HEIGHT_AND_ANGLE'};
 return result;
}

export function applyRoundComponentFidelity(template){
 if(!template?.root||template.root.userData.roundComponentRevision==='V347')return;
 const geometries=new Map(),meshes=[];
 template.root.traverse(o=>{
  if(!o.isMesh||o.isSkinnedMesh||o.isInstancedMesh)return;
  const original=o.geometry;if(!geometries.has(original))geometries.set(original,refinedCylinder(original));
  const refined=geometries.get(original);if(refined){o.geometry=refined;meshes.push({mesh:o,original,refined});}
 });
 const setLow=template.setLow?.bind(template),dispose=template.dispose?.bind(template);
 template.setLow=function(on){
  const result=setLow?.(on);
  for(const {mesh,original,refined} of meshes)if(mesh.geometry===original||mesh.geometry===refined)mesh.geometry=on?original:refined;
  return result;
 };
 let disposed=false;
 template.dispose=function(){
  if(disposed)return;disposed=true;
  for(const {mesh,original} of meshes)mesh.geometry=original;
  try{return dispose?.();}finally{for(const g of geometries.values())g?.dispose();}
 };
 template.root.userData.roundComponentRevision='V347';
 template.root.userData.roundComponentAudit={meshes:meshes.length,uniqueGeometries:[...geometries.values()].filter(Boolean).length,policy:'ANALYTIC_CIRCLES_ONLY__NO_MODULE_OR_DIMENSION_REDESIGN'};
}
