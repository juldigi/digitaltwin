import * as THREE from 'three';

export const RENDER_PROFILE_ORDER=Object.freeze(['auto','hemat','seimbang','tinggi','engineering','cinematic']);

export const RENDER_PROFILE_INFO=Object.freeze({
 auto:Object.freeze({
  label:'Otomatis',
  difference:'Aplikasi memilih profil kualitas yang paling sesuai dengan kemampuan perangkat saat ini.',
  pros:'Praktis untuk penggunaan harian dan menyesuaikan kemampuan perangkat secara otomatis.',
  cons:'Hasil dapat berbeda antarperangkat karena profil yang digunakan mengikuti kemampuan perangkat keras.'
 }),
 hemat:Object.freeze({
  label:'Hemat',
  difference:'Resolusi render 1,0×. Bayangan dinamis dinonaktifkan, shadow map (peta bayangan) 512 hanya disiapkan sebagai cadangan, dan interval frame (jeda antarframe) dibuat lebih longgar.',
  pros:'Paling ringan untuk GPU, lebih hemat baterai, suhu perangkat lebih rendah, dan paling stabil untuk perangkat lama atau memori terbatas.',
  cons:'Ketajaman lebih rendah dan kedalaman visual berkurang karena bayangan dinamis tidak aktif.'
 }),
 seimbang:Object.freeze({
  label:'Seimbang',
  difference:'Resolusi render hingga 1,35× dengan bayangan lunak 1024 dan respons interaksi normal.',
  pros:'Kompromi terbaik antara detail, kelancaran, konsumsi daya, dan kestabilan untuk mayoritas perangkat.',
  cons:'Tidak setajam mode Tinggi atau Sinematik dan masih memakai GPU lebih besar daripada Hemat.'
 }),
 tinggi:Object.freeze({
  label:'Tinggi',
  difference:'Resolusi render hingga 1,75×, bayangan 1536, dan environment lighting (pencahayaan lingkungan) aktif saat membuka model mesin.',
  pros:'Detail permukaan, tepi geometri, dan bayangan lebih tajam untuk inspeksi visual.',
  cons:'Lebih berat untuk GPU dan baterai; pada ponsel atau perangkat seluler dapat meningkatkan suhu dan menurunkan laju frame (FPS).'
 }),
 engineering:Object.freeze({
  label:'Teknis',
  difference:'Resolusi render hingga 1,50× dengan bayangan 1024, exposure (tingkat pencahayaan) yang lebih netral, dan perpindahan kamera lebih cepat untuk inspeksi teknis.',
  pros:'Geometri tetap jelas dan respons navigasi cepat tanpa beban efek visual Sinematik.',
  cons:'Tampilan kurang dramatis dibanding mode Tinggi atau Sinematik dan bukan mode paling ringan.'
 }),
 cinematic:Object.freeze({
  label:'Sinematik',
  difference:'Resolusi render hingga 2,0×, bayangan 2048, environment lighting (pencahayaan lingkungan), dan post-processing (pemrosesan akhir visual) saat membuka model mesin.',
  pros:'Kualitas visual tertinggi untuk presentasi, tangkapan layar, dan pemeriksaan estetika.',
  cons:'Paling berat untuk GPU, memori, baterai, dan suhu perangkat; tidak ideal untuk perangkat dengan performa terbatas.'
 })
});

export const RENDER_PROFILES=Object.freeze({
 hemat:Object.freeze({pixelRatio:1,shadows:false,shadowSize:512,exposure:1.1,frameInterval:32,cameraMs:500}),
 seimbang:Object.freeze({pixelRatio:1.35,shadows:true,shadowSize:1024,exposure:1.15,frameInterval:16,cameraMs:650}),
 tinggi:Object.freeze({pixelRatio:1.75,shadows:true,shadowSize:1536,exposure:1.17,frameInterval:16,cameraMs:700}),
 engineering:Object.freeze({pixelRatio:1.5,shadows:true,shadowSize:1024,exposure:1.12,frameInterval:16,cameraMs:520}),
 cinematic:Object.freeze({pixelRatio:2,shadows:true,shadowSize:2048,exposure:1.18,frameInterval:16,cameraMs:850})
});

export function recommendedProfile({mobile=false,memory=4,cores=4,maxTextureSize=4096}={}){
 if(memory<=2||cores<=2||maxTextureSize<4096)return 'hemat';
 if(memory>=8&&cores>=8&&maxTextureSize>=8192)return mobile?'seimbang':'tinggi';
 return 'seimbang';
}

export function renderProfileInfo(name='auto'){
 return RENDER_PROFILE_INFO[name]||RENDER_PROFILE_INFO.auto;
}

export function resolveProfile(requested,capabilities={}){
 const name=requested==='auto'||!RENDER_PROFILES[requested]?recommendedProfile(capabilities):requested;
 // A coarse pointer is a hint, but available GPU texture limits are authoritative.
 if(capabilities.maxTextureSize&&capabilities.maxTextureSize<4096)return 'hemat';
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
