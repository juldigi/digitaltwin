import * as THREE from 'three';

export const INDUSTRIAL_SURFACES=Object.freeze({
 paintedSteel:Object.freeze({roughness:.48,metalness:.58}),
 stainlessSteel:Object.freeze({roughness:.3,metalness:.86}),
 galvanizedSteel:Object.freeze({roughness:.59,metalness:.65}),
 rubber:Object.freeze({roughness:.91,metalness:0}),
 safetyGlass:Object.freeze({roughness:.16,metalness:0,transparent:true,opacity:.45,depthWrite:false}),
 factoryConcrete:Object.freeze({roughness:.94,metalness:0})
});

export function createIndustrialMaterial(surface,{color=0xffffff,...overrides}={}){
 if(!Object.hasOwn(INDUSTRIAL_SURFACES,surface))throw new Error(`Unknown industrial surface: ${surface}`);
 return new THREE.MeshStandardMaterial({...INDUSTRIAL_SURFACES[surface],color,...overrides});
}
