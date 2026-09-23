import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {drawPlantPlan} from '../frontend/src/data/plant-layout-data.js';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../frontend/index.html');
const app=read('../frontend/src/app.js');
const renderer=read('../frontend/src/data/plant-layout-data.js');
const sw=read('../frontend/sw.js');

test('V175 2D renderer highlights selected asset with larger marker ring and label',()=>{
 const fills=[],arcs=[],texts=[];
 const ctx={
  beginPath(){},moveTo(){},lineTo(){},stroke(){},clearRect(){},setTransform(){},
  fillRect(x,y,w,h){fills.push([x,y,w,h])},arc(x,y,r){arcs.push([x,y,r])},
  fillText(text){texts.push(text)},strokeText(){},
  set strokeStyle(v){},set lineWidth(v){},set globalAlpha(v){},set font(v){},set fillStyle(v){}
 };
 const canvas={width:0,height:0,getBoundingClientRect(){return {width:480,height:320}},getContext(){return ctx}};
 const layout={bounds:{minX:0,maxX:100,minY:0,maxY:100},referenceBatches:[],identifiedLabels:[],placements:[
  {machineId:'A',label:'Mesin A',x:25,y:25,status:'ANNOTATION'},
  {machineId:'B',label:'Mesin B',x:75,y:75,status:'ANNOTATION'}
 ]};
 drawPlantPlan(canvas,layout,{selectedAsset:'A'});
 assert.ok(fills.some(([, ,w,h])=>w===10&&h===10),'selected marker should be 10px');
 assert.ok(fills.some(([, ,w,h])=>w===6&&h===6),'other assets should remain visible');
 assert.ok(arcs.some(([, ,r])=>r===9),'selected asset should have a focus ring');
 assert.ok(texts.includes('Mesin A'),'selected asset label should be drawn');
});

test('V175 2D source labels use readable adaptive text rather than the legacy 6px font',()=>{
 assert.match(renderer,/const sourceLabelSize=Math\.max\(8,Math\.min\(10\.5,rect\.width\/95\)\)/);
 assert.doesNotMatch(renderer,/ctx\.font='6px system-ui'/);
});

test('V175 app redraws the 2D plan when selection state changes',()=>{
 assert.match(app,/function redrawPlantPlan\(selectedAsset=window\.BMJAppState\?\.getState\?\.\(\)\.selectedAsset\|\|null\)/);
 assert.match(app,/drawPlantPlan\(\$\('#dwg-canvas'\),bundledLayout,\{selectedAsset:selectedMachineId\}\)/);
 assert.match(app,/addEventListener\('bmj:statechange',event=>\{if\(document\.body\.classList\.contains\('workspace-2d'\)\)redrawPlantPlan\(event\.detail\?\.selectedAsset\|\|null\);\}\)/);
 assert.match(app,/Pilihan aktif · /);
});

test('V175 app and service worker are cache-busted while shell remains V174',()=>{
 assert.match(html,/src\/app\.js\?v=183/);
 assert.match(html,/src\/app-shell-v79\.js\?v=183/);
 assert.match(sw,/factory-digital-twin-v183-simulation-system-navigation-20260923/);
});
