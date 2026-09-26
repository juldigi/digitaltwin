import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {RENDER_PROFILES,recommendedProfile,resolveProfile,configureRenderer} from '../frontend/src/render/render-config.js';
import {createIndustrialLighting} from '../frontend/src/render/lighting-system.js';
import {createIndustrialMaterial} from '../frontend/src/render/material-library.js';
import {AdaptiveQuality} from '../frontend/src/render/adaptive-quality.js';
import {ShadowManager} from '../frontend/src/render/shadow-manager.js';
import {EnvironmentSystem} from '../frontend/src/render/environment-system.js';
import {PostProcessing} from '../frontend/src/render/post-processing.js';
import {cameraFrame,applyCameraFrame,updateCameraTransition} from '../frontend/src/render/camera-director.js';

test('camera director frames actual bounds and settles without passing through the floor',()=>{
 const camera=new THREE.PerspectiveCamera(38,1,.05,1000),controls={target:new THREE.Vector3(),update(){this.updated=true}};
 const box=new THREE.Box3(new THREE.Vector3(10,0,-4),new THREE.Vector3(14,3,2));
 const frame=cameraFrame(camera,box,{mode:'iso'});
 assert.equal(frame.center.x,12);
 assert.ok(frame.position.y>=.15);
 const transition=applyCameraFrame(camera,controls,frame,{now:1000});
 assert.equal(updateCameraTransition(camera,controls,transition,1500,1000),transition);
 assert.equal(updateCameraTransition(camera,controls,transition,2000,1000),null);
 assert.ok(camera.position.distanceTo(frame.position)<1e-9);
 assert.ok(controls.target.distanceTo(frame.center)<1e-9);
 applyCameraFrame(camera,controls,cameraFrame(camera,box,{mode:'top'}),{reduceMotion:true});
 assert.equal(controls.updated,true);
});

test('quality choices use device capabilities and keep one renderer',()=>{
 assert.equal(recommendedProfile({mobile:true,memory:8,cores:8,maxTextureSize:8192}),'seimbang');
 assert.equal(recommendedProfile({mobile:true,memory:4,cores:6,maxTextureSize:8192}),'seimbang');
 assert.equal(recommendedProfile({mobile:true,memory:2,cores:6,maxTextureSize:8192}),'hemat');
 assert.equal(recommendedProfile({mobile:false,memory:8,cores:8,maxTextureSize:8192}),'tinggi');
 assert.equal(resolveProfile('cinematic',{maxTextureSize:2048}),'hemat');
 assert.equal(resolveProfile('cinematic',{mobile:true,maxTextureSize:8192}),'cinematic');
 const renderer={shadowMap:{},capabilities:{},setPixelRatio(value){this.pixelRatio=value}};
 const shadowLight={shadow:{mapSize:{x:1024,set(x,y){this.x=x;this.y=y}},map:null}};
 configureRenderer(renderer,{profile:'cinematic',devicePixelRatio:3,shadowLight});
 assert.equal(renderer.pixelRatio,RENDER_PROFILES.cinematic.pixelRatio);
 assert.equal(renderer.shadowMap.enabled,true);
 assert.equal(shadowLight.shadow.mapSize.x,2048);
 assert.equal(renderer.outputColorSpace,THREE.SRGBColorSpace);
});

test('industrial lighting and materials own and release their resources',()=>{
 const scene=new THREE.Scene(),lighting=createIndustrialLighting(scene);
 assert.equal(scene.children.filter(o=>o.isLight).length,2);
 assert.equal(scene.children.filter(o=>o.castShadow).length,1);
 const steel=createIndustrialMaterial('stainlessSteel',{color:0xaabbcc});
 const rubber=createIndustrialMaterial('rubber');
 assert.ok(steel.metalness>rubber.metalness);
 steel.dispose();rubber.dispose();lighting.dispose();
 assert.equal(scene.children.length,0);
});

test('automatic quality drops only after sustained slow frames',()=>{
 let drops=0;const quality=new AdaptiveQuality(()=>drops++);
 for(let t=100;t<=12100;t+=100)quality.frame(t);
 assert.equal(drops,1);
 for(let t=12200;t<=25000;t+=100)quality.frame(t);
 assert.equal(drops,1);
 quality.reset();assert.equal(quality.downgraded,false);
});

test('shadow focus follows the selected machine and resets for the factory',()=>{
 const scene=new THREE.Scene(),{key,dispose}=createIndustrialLighting(scene);
 const shadows=new ShadowManager(key),machine=new THREE.Mesh(new THREE.BoxGeometry(12,3,4));
 machine.position.x=25;scene.add(machine);
 shadows.focus(machine);
 assert.ok(key.target.position.x>20);
 assert.ok(key.shadow.camera.right>=12);
 shadows.reset();assert.equal(key.target.position.x,0);
 machine.geometry.dispose();dispose();
});

test('optional effects stay dormant in factory view and release safely',async()=>{
 const scene=new THREE.Scene(),environment=new EnvironmentSystem({},scene);
 await environment.setEnabled(false);assert.equal(scene.environment,null);
 environment.dispose();
 const effects=new PostProcessing({},scene,new THREE.PerspectiveCamera());
 await effects.setEnabled(false);assert.equal(effects.render(),false);
 effects.dispose();
});

test('optional Three.js effect dependencies resolve without changing the core renderer',async()=>{
 const modules=await Promise.all([
  import('three/addons/environments/RoomEnvironment.js'),
  import('three/addons/postprocessing/EffectComposer.js'),
  import('three/addons/postprocessing/RenderPass.js'),
  import('three/addons/postprocessing/UnrealBloomPass.js'),
  import('three/addons/postprocessing/OutputPass.js')
 ]);
 assert.ok(modules.every(module=>Object.keys(module).length));
});
