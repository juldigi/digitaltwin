import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';
import {PostProcessing,cinematicResolution,createOpaqueContactPass} from '../frontend/src/render/post-processing.js';

function dependencies({fail=false}={}){
 class Pass{constructor(){this.disposals=0;}dispose(){this.disposals++;}setSize(w,h){this.size=[w,h];}}
 class Composer extends Pass{constructor(){super();this.passes=[];}addPass(p){this.passes.push(p);}setPixelRatio(r){this.ratio=r;}render(){if(fail)throw Error('GPU unavailable');}}
 return {EffectComposer:Composer,RenderPass:class Render extends Pass{},GTAOPass:class AO extends Pass{},UnrealBloomPass:class Bloom extends Pass{},SMAAPass:class AA extends Pass{},OutputPass:class Output extends Pass{},Vector2:T.Vector2};
}
const renderer={domElement:{clientWidth:800,clientHeight:600},getPixelRatio:()=>2,setRenderTarget(){}};

test('cinematic targets stay bounded on phone desktop and large presentation displays',()=>{
 for(const [w,h] of [[390,844],[1920,1080],[3840,2160],[7680,4320]]){
  const s=cinematicResolution(w,h,3);assert.ok(w*h*s.pixelRatio**2<=2000000+1e-6);assert.ok(s.aoWidth*s.aoHeight<=510000);
  assert.ok(s.pixelRatio<=2);assert.ok(s.aoWidth>0&&s.aoHeight>0);
 }
});
test('single cinematic pipeline uses depth then subtle glow then edge smoothing then output and releases every pass',async()=>{
 let loads=0;const effects=new PostProcessing(renderer,new T.Scene(),new T.PerspectiveCamera(),{load:async()=>{loads++;return dependencies();}});
 await Promise.all([effects.setEnabled(true),effects.setEnabled(true)]);assert.equal(loads,1);
 const c=effects.composer;assert.deepEqual(c.passes.map(p=>p.constructor.name),['Render','AO','Bloom','AA','Output']);assert.equal(effects.ao.blendIntensity,.35);
 assert.deepEqual(effects.ao.size,[800,600]);assert.equal(effects.render(),true);
 await effects.setEnabled(false);assert.equal(effects.render(),false);assert.equal(effects.composer,null);assert.ok(c.passes.every(p=>p.disposals===1));assert.equal(c.disposals,1);
 await effects.setEnabled(true);const next=effects.composer;assert.notEqual(next,c);
 effects.dispose();effects.dispose();assert.ok(next.passes.every(p=>p.disposals===1));assert.equal(next.disposals,1);
});
test('disabled or disposed during lazy imports never allocates a stale composer',async()=>{
 for(const dispose of [false,true]){
  let resolve;const effects=new PostProcessing(renderer,new T.Scene(),new T.PerspectiveCamera(),{load:()=>new Promise(r=>resolve=r)});
  const pending=effects.setEnabled(true);if(dispose)effects.dispose();else await effects.setEnabled(false);resolve(dependencies());await pending;
  assert.equal(effects.composer,null);assert.equal(effects.render(),false);
 }
});
test('GPU render failure restores direct-render target and scene visibility instead of faulting the 3D engine',async()=>{
 const scene=new T.Scene(),line=new T.Line();scene.add(line);const effects=new PostProcessing(renderer,scene,new T.PerspectiveCamera(),{load:async()=>dependencies({fail:true})});await effects.setEnabled(true);
 effects.composer.render=()=>{line.visible=false;scene.overrideMaterial={};throw Error('GPU unavailable');};assert.equal(effects.render(),false);assert.equal(line.visible,true);assert.equal(scene.overrideMaterial,null);effects.dispose();
});
test('installed GTAO implementation accepts bounded world-space contact settings and denoise targets',()=>{
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(),pass=new GTAOPass(scene,camera,64,64,undefined,{radius:.22,thickness:.06,samples:8,screenSpaceRadius:false},{radius:4,samples:8});
 assert.equal(pass.gtaoMaterial.uniforms.radius.value,.22);assert.equal(pass.gtaoMaterial.defines.SAMPLES,8);assert.equal(pass.gtaoMaterial.defines.SCREEN_SPACE_RADIUS,0);pass.setSize(128,96);assert.equal(pass.width,128);assert.equal(pass.height,96);pass.dispose();
});
test('glass and ghosted guards cannot darken interior contact buffers and visibility restores after normal-buffer failure',()=>{
 const scene=new T.Scene(),g=new T.BoxGeometry(),glass=new T.Mesh(g,new T.MeshStandardMaterial({transparent:true,opacity:.2})),solid=new T.Mesh(g,new T.MeshStandardMaterial());scene.add(glass,solid);
 const hidden=glass.clone();hidden.visible=false;scene.add(hidden);
 const pass=createOpaqueContactPass(GTAOPass,scene,new T.PerspectiveCamera(),32,32);
 pass._overrideVisibility();assert.equal(glass.visible,false);assert.equal(solid.visible,true);pass._restoreVisibility();assert.equal(glass.visible,true);assert.equal(hidden.visible,false);
 pass._overrideVisibility();assert.throws(()=>pass._renderOverride({},null,null),TypeError);assert.equal(glass.visible,true);assert.equal(hidden.visible,false);
 pass.dispose();pass.gtaoMaterial.dispose();g.dispose();glass.material.dispose();solid.material.dispose();
});
