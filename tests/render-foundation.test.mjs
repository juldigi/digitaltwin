import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {RENDER_PROFILES,recommendedProfile,resolveProfile,configureRenderer} from '../frontend/src/render/render-config.js';
import {createIndustrialLighting} from '../frontend/src/render/lighting-system.js';
import {createIndustrialMaterial} from '../frontend/src/render/material-library.js';
import {AdaptiveQuality} from '../frontend/src/render/adaptive-quality.js';

test('quality choices use device capabilities and keep one renderer',()=>{
 assert.equal(recommendedProfile({mobile:true,memory:8,cores:8,maxTextureSize:8192}),'hemat');
 assert.equal(recommendedProfile({mobile:false,memory:8,cores:8,maxTextureSize:8192}),'tinggi');
 assert.equal(resolveProfile('cinematic',{maxTextureSize:2048}),'hemat');
 assert.equal(resolveProfile('cinematic',{mobile:true,maxTextureSize:8192}),'seimbang');
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
