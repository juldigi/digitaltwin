import * as THREE from 'three';

export const INDUSTRIAL_SURFACES=Object.freeze({
 paintedSteel:Object.freeze({roughness:.46,metalness:0}),
 stainlessSteel:Object.freeze({roughness:.32,metalness:.95}),
 galvanizedSteel:Object.freeze({roughness:.59,metalness:.9}),
 rubber:Object.freeze({roughness:.91,metalness:0}),
 safetyGlass:Object.freeze({roughness:.16,metalness:0,transparent:true,opacity:.45,depthWrite:false}),
 factoryConcrete:Object.freeze({roughness:.94,metalness:0})
});

export function createIndustrialMaterial(surface,{color=0xffffff,...overrides}={}){
 if(!Object.hasOwn(INDUSTRIAL_SURFACES,surface))throw new Error(`Unknown industrial surface: ${surface}`);
 const material=new THREE.MeshStandardMaterial({...INDUSTRIAL_SURFACES[surface],color,...overrides});
 material.userData.industrialSurface=surface;
 return material;
}

// Classify authored material names, never infer metal from a grey pixel.
export function authoredSurface(kind){
 if(['steel','silver','chrome','chromium','bronze','gold','copper','foil'].includes(kind)||/^foil/.test(kind))return 'stainlessSteel';
 if(kind==='rubber'||/^roller(White|Red|Yellow|Blue)$/.test(kind)||kind==='photoRollerGreen')return 'rubber';
 if(['paper','board','waste'].includes(kind))return 'paper';
 if(kind==='glass')return 'safetyGlass';
 if(['screen','led','uv','air','water','ink','glue','coat'].includes(kind)||/^inkFilm/.test(kind))return null;
 if(['body','bodyDark','table','tableDark','graphite','charcoal','dark','black','light','cream','ivory','white','gray','accent','warning','orange','red','yellow','blue','cyan','amber','green','magenta','plastic'].includes(kind))return 'paintedSteel';
 return null;
}

export function applyAuthoredSurface(material,kind){
 const surface=authoredSurface(kind);
 if(!surface||!material?.isMeshStandardMaterial)return;
 // Preserve authored glazing opacity and process films; classify opaque surfaces only.
 if(material.transparent||material.opacity<.94)return;
 const values=surface==='paper'?{roughness:.9,metalness:0}:INDUSTRIAL_SURFACES[surface];
 material.roughness=['chrome','chromium'].includes(kind)?.19:values.roughness;material.metalness=values.metalness;
 material.userData={...material.userData,industrialSurface:surface,surfaceKind:kind,surfaceRevision:'V343'};
 material.needsUpdate=true;
}
