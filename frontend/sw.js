// V237 dedicated machine realism pass; V249 shell recache without rotating public query identifiers; V255 UI SSOT repair recaches the corrected canonical shell through the build fingerprint; V262 rotates the internal shell cache for mobile-first parity; V263 recaches the simplified editor; V264 recaches hardened editor controls; V265 locks editor async transactions; V266 recaches the EYD user-language audit; V267 recaches the deep language consistency pass; V268 localizes simulation-stage presentation and clarifies the mobile explode control; V269 adds adaptive non-obstructive factory labels; V270 adds the consolidated flagship UI system and real theme surfaces; V271/V272 harden full-fleet simulation state; V273 rotates public release identity so clients cannot remain pinned to the V222 query namespace.
const LEGACY_VERSION='factory-digital-twin-v270-flagship-ui-20260930';
const VERSION='factory-digital-twin-v273-release-freshness-20261001';
const RELEASE='273';
const BUILD_FINGERPRINT='SOURCE';
const FLEET_CHUNK_COUNT=10;
const ENTRYPOINTS=[
 './app-shell-v79.css','./flagship-v270.css','./src/app.js','./src/ui-v5.js','./src/experience-v37.js','./src/app-shell-v79.js'
];
const SHELL=[
 './','./index.html','./config.json','./assets/favicon.svg','./assets/splash-industrial-v79.webp',
 './style.css','./runtime-fallback.css','./ui-v5.css','./responsive-v5.css','./experience-v37.css',
 ...ENTRYPOINTS,
 './src/state/app-state.js','./src/render/render-config.js','./src/render/lighting-system.js','./src/render/material-library.js','./src/render/adaptive-quality.js','./src/render/environment-system.js','./src/render/post-processing.js','./src/render/shadow-manager.js','./src/render/render-diagnostics.js','./src/render/camera-director.js',
 './src/model.js','./src/scene-editor-state.js','./src/engine.js','./src/machine-visibility.js','./src/simulation-mode.js','./src/display-language.js','./src/offset5.js','./src/simulation.js',
 './src/data/foundation-scope.js','./src/data/truth-status.js','./src/data/dwg-fidelity.js',
 './src/data/dimensions-offset5.js','./src/data/confidence.js','./src/data/sources-offset5.js','./src/data/taxonomy-offset5.js',
 './src/data/plant-layout-data.js','./src/data/plant-layout-deep.js','./src/data/plant-actual.js','./src/data/plant-actual-data.js',
 './src/data/machine-registry.js','./src/factory-building.js','./src/utility-routing.js',
 './src/data/compressed-air-routes.js','./src/data/ahu-pipe-routes.js','./src/data/ahu-duct-routes.js',
 './src/data/factory-fleet-data.js','./src/data/ipal-photo-evidence-v206.js',
 ...Array.from({length:FLEET_CHUNK_COUNT},(_,i)=>`./src/data/factory-fleet-chunk-${i}.js`),
 './vendor/three/build/three.module.js','./vendor/three/build/three.core.js',
 './vendor/three/addons/controls/OrbitControls.js','./vendor/three/addons/controls/TransformControls.js',
 './vendor/three/addons/utils/BufferGeometryUtils.js','./vendor/three/addons/geometries/RoundedBoxGeometry.js'

];
const PRECACHE=[...SHELL,...ENTRYPOINTS.map(path=>path+'?v='+RELEASE)];
const cachedFallback=request=>caches.match(request).then(cached=>cached||caches.match(request,{ignoreSearch:true})).then(cached=>cached||new Response('Tidak tersambung: berkas belum tersimpan di perangkat.',{status:503}));
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(PRECACHE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([
 caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION&&(k.startsWith('offset5-')||k.startsWith('factory-digital-twin-'))).map(k=>caches.delete(k)))),
 self.clients.claim()
])));
self.addEventListener('fetch',event=>{
 const u=new URL(event.request.url);
 if(event.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.includes('/api/'))return;
 event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
   if(response.ok){const copy=response.clone();event.waitUntil(caches.open(VERSION).then(cache=>cache.put(event.request,copy)));return response;}
   if(response.status>=500)return cachedFallback(event.request);
   return response;
 }).catch(()=>cachedFallback(event.request)));
});
