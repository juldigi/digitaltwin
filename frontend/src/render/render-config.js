import * as THREE from 'three';

export const RENDER_PROFILES=Object.freeze({
 hemat:Object.freeze({pixelRatio:1,shadows:false,shadowSize:512,exposure:1.1,frameInterval:32,cameraMs:500}),
 seimbang:Object.freeze({pixelRatio:1.35,shadows:true,shadowSize:1024,exposure:1.15,frameInterval:16,cameraMs:650}),
 tinggi:Object.freeze({pixelRatio:1.75,shadows:true,shadowSize:1536,exposure:1.17,frameInterval:16,cameraMs:700}),
 cinematic:Object.freeze({pixelRatio:2,shadows:true,shadowSize:2048,exposure:1.18,frameInterval:16,cameraMs:850})
});

export function recommendedProfile({mobile=false,memory=4,cores=4,maxTextureSize=4096}={}){
 if(mobile||memory<=2||cores<=2||maxTextureSize<4096)return 'hemat';
 if(memory>=8&&cores>=8&&maxTextureSize>=8192)return 'tinggi';
 return 'seimbang';
}

export function resolveProfile(requested,capabilities={}){
 const name=requested==='auto'||!RENDER_PROFILES[requested]?recommendedProfile(capabilities):requested;
 // A coarse pointer is a hint, but available GPU texture limits are authoritative.
 if(capabilities.maxTextureSize&&capabilities.maxTextureSize<4096)return 'hemat';
 if(capabilities.mobile&&['tinggi','cinematic'].includes(name))return 'seimbang';
 return name;
}

export function configureRenderer(renderer,{profile,devicePixelRatio=1,shadowLight}={}){
 const settings=RENDER_PROFILES[profile]||RENDER_PROFILES.seimbang;
 renderer.setPixelRatio(Math.min(Math.max(1,devicePixelRatio||1),settings.pixelRatio));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=settings.exposure;
 renderer.shadowMap.enabled=settings.shadows;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 if(shadowLight&&shadowLight.shadow.mapSize.x!==settings.shadowSize){
  shadowLight.shadow.mapSize.set(settings.shadowSize,settings.shadowSize);
  shadowLight.shadow.map?.dispose();shadowLight.shadow.map=null;
 }
 return settings;
}
