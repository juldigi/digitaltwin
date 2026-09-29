import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {RENDER_PROFILE_INFO,RENDER_PROFILE_ORDER,recommendedProfile} from '../frontend/src/render/render-config.js';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const engine=read('../frontend/src/engine.js');
const app=read('../frontend/src/app.js');

test('V259 factory mode hydrates the same polished machine templates used by machine view',()=>{
 assert.match(engine,/async hydrateFactoryDetailedMachines\(/);
 assert.match(engine,/createPolishedMachineTemplate\}=await import\('\.\/machine-runtime\.js'\)/);
 assert.match(engine,/template=createPolishedMachineTemplate\(id\)/);
 assert.match(engine,/renderSource:'SAME_POLISHED_TEMPLATE_AS_MACHINE_VIEW'/);
 assert.match(engine,/factoryMachineGeometryPolicy:'SAME_POLISHED_TEMPLATE_AS_MACHINE_VIEW__PROXY_ONLY_AS_PROGRESSIVE_FALLBACK'/);
 assert.match(engine,/factoryProxyFallbackRemoved:true/);
 assert.match(engine,/this\.actualFactory=this\.capabilities\?\.memory<=2\?buildLowDetailFactory\(l,l\.fleet\):buildActualFactory\(l,l\.fleet\)/);
 assert.match(engine,/void this\.hydrateFactoryDetailedMachines\?\.\(l,l\.fleet\)/);
});

test('V259 quality recommendation responds to device capability tiers',()=>{
 assert.equal(recommendedProfile({mobile:true,memory:2,cores:8,maxTextureSize:8192}),'hemat');
 assert.equal(recommendedProfile({mobile:false,memory:8,cores:8,maxTextureSize:8192}),'tinggi');
 assert.equal(recommendedProfile({mobile:true,memory:8,cores:8,maxTextureSize:8192}),'seimbang');
 assert.equal(recommendedProfile({mobile:false,memory:4,cores:4,maxTextureSize:4096}),'seimbang');
 assert.equal(recommendedProfile({mobile:false,memory:16,cores:16,maxTextureSize:2048}),'hemat');
});

test('V259 every quality option explains differences, advantages, and compromises',()=>{
 assert.deepEqual(RENDER_PROFILE_ORDER,['auto','hemat','seimbang','tinggi','engineering','cinematic']);
 for(const key of RENDER_PROFILE_ORDER){
  const info=RENDER_PROFILE_INFO[key];
  assert.ok(info?.label,key+' label');
  assert.ok(info?.difference,key+' difference');
  assert.ok(info?.pros,key+' pros');
  assert.ok(info?.cons,key+' cons');
 }
 assert.match(app,/Rekomendasi perangkat ini:/);
 assert.match(app,/Perbedaan utama:/);
 assert.match(app,/Kelebihan:/);
 assert.match(app,/Kompromi \/ kekurangan:/);
 assert.match(app,/Direkomendasikan/);
 assert.match(app,/Pilih kualitas/);
 assert.match(app,/qualityRecommendationProfile/);
});
