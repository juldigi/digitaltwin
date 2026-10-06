import * as THREE from 'three';

const PROFILES=Object.freeze({
 paintedSteel:{min:240,repeat:12},stainlessSteel:{min:232,repeat:16},
 galvanizedSteel:{min:226,repeat:10},rubber:{min:244,repeat:12},
 paper:{min:242,repeat:14},factoryConcrete:{min:224,repeat:10}
});

// Optical finish only: no colour map, displacement, stains or invented damage.
export function createSurfaceDetailTexture(surface){
 const profile=PROFILES[surface];if(!profile)return null;
 const size=32,data=new Uint8Array(size*size*4);
 let seed=0x51f15e;
 for(const c of surface)seed=(Math.imul(seed,31)+c.charCodeAt(0))>>>0;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  const noise=(seed>>>0)/4294967295;
  const v=Math.round(profile.min+(255-profile.min)*noise),at=(y*size+x)*4;
  data[at]=255;data[at+1]=v;data[at+2]=255;data[at+3]=255;
 }
 const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);
 texture.name='BMJ-'+surface+'-optical-microfinish-V344';
 texture.colorSpace=THREE.NoColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
 texture.repeat.set(profile.repeat,profile.repeat);
 texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;
 texture.generateMipmaps=true;texture.needsUpdate=true;
 texture.userData={surfaceDetailRevision:'V344',surface,finishEvidence:'PROCEDURAL_OPTICAL_REFERENCE_NOT_MEASURED_BMJ_FINISH',displacement:false};
 return texture;
}

export class SurfaceDetailPool{
 constructor(){this.entries=new Map();this.materials=new Map();this.disposed=false;}
 attach(mesh){
  if(this.disposed||!mesh?.isMesh||!mesh.geometry?.attributes?.uv)return;
  if(mesh.userData?.flowReference||mesh.userData?.uvLamp||mesh.userData?.inspectionLight)return;
  for(const material of [].concat(mesh.material||[])){
   const surface=material.userData?.industrialSurface;
   if(!PROFILES[surface]||!material.isMeshStandardMaterial||material.transparent||material.opacity<.94||material.roughnessMap||this.materials.has(material))continue;
   if(['chrome','chromium'].includes(material.userData.surfaceKind))continue;
   let entry=this.entries.get(surface);
   if(!entry){entry={texture:createSurfaceDetailTexture(surface),refs:0};this.entries.set(surface,entry);}
   entry.refs++;material.roughnessMap=entry.texture;material.needsUpdate=true;
   material.userData={...material.userData,surfaceDetailRevision:'V344'};
   const release=()=>{
    material.removeEventListener('dispose',release);this.materials.delete(material);
    if(this.disposed)return;
    if(--entry.refs===0){entry.texture.dispose();this.entries.delete(surface);}
   };
   material.addEventListener('dispose',release);this.materials.set(material,release);
  }
 }
 dispose(){
  if(this.disposed)return;this.disposed=true;
  for(const [material,release] of this.materials)material.removeEventListener('dispose',release);
  this.materials.clear();for(const e of this.entries.values())e.texture.dispose();this.entries.clear();
 }
}

export function applyMachineSurfaceDetail(template){
 if(!template?.root||template.root.userData.surfaceDetailRevision==='V344')return;
 const pool=new SurfaceDetailPool();template.root.traverse(o=>pool.attach(o));
 const dispose=template.dispose?.bind(template);
 template.dispose=function(){try{return dispose?.();}finally{pool.dispose();}};
 template.root.userData.surfaceDetailRevision='V344';
 template.root.userData.surfaceDetailPolicy='OPTICAL_ONLY__COLOUR_GEOMETRY_AND_EVIDENCE_UNCHANGED';
 template.root.userData.surfaceDetailTextureCount=pool.entries.size;
}
