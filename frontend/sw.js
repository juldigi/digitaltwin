const VERSION='factory-digital-twin-v193-autoplaten-reality-pass-1-20260923';
const SHELL=[
 './','./index.html','./config.json','./assets/favicon.svg','./assets/splash-industrial-v79.webp',
 './style.css','./runtime-fallback.css','./app-shell-v79.css','./ui-v5.css','./responsive-v5.css','./experience-v37.css',
 './src/app.js','./src/app-shell-v79.js','./src/ui-v5.js','./src/experience-v37.js','./src/state/app-state.js',
 './src/model.js','./src/engine.js','./src/offset5.js','./src/simulation.js',
 './src/data/foundation-scope.js','./src/data/truth-status.js','./src/data/dwg-fidelity.js',
 './src/data/dimensions-offset5.js','./src/data/confidence.js','./src/data/sources-offset5.js','./src/data/taxonomy-offset5.js',
 './src/data/plant-layout-data.js','./src/data/plant-layout-deep.js','./src/data/plant-actual.js','./src/data/plant-actual-data.js',
 './src/data/machine-registry.js','./src/factory-building.js','./src/utility-routing.js',
 './src/data/compressed-air-routes.js','./src/data/ahu-pipe-routes.js','./src/data/ahu-duct-routes.js',
 './src/data/factory-fleet-data.js',
 ...Array.from({length:9},(_,i)=>`./src/data/factory-fleet-chunk-${i}.js`),
 './vendor/three/build/three.module.js','./vendor/three/build/three.core.js',
 './vendor/three/addons/controls/OrbitControls.js','./vendor/three/addons/controls/TransformControls.js',
 './vendor/three/addons/utils/BufferGeometryUtils.js','./vendor/three/addons/geometries/RoundedBoxGeometry.js'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION&&(k.startsWith('offset5-')||k.startsWith('factory-digital-twin-'))).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',event=>{const u=new URL(event.request.url);if(event.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.includes('/api/'))return;event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(VERSION).then(c=>c.put(event.request,copy)));}return response;}).catch(()=>caches.match(event.request).then(cached=>cached||new Response('Offline: berkas belum tersimpan.',{status:503}))));});
