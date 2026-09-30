import test from 'node:test';
import assert from 'node:assert/strict';
import {plantPlanProjection,pickPlantPlanAsset} from '../frontend/src/data/plant-layout-data.js';
const layout={bounds:{minX:100,maxX:300,minY:50,maxY:150},placements:[
 {machineId:'a',x:150,y:75,status:'IDENTIFIED'},
 {machineId:'b',x:250,y:125,status:'IDENTIFIED'},
 {machineId:'unknown',x:200,y:100,status:'UNIDENTIFIED'}]};
for(const [width,height] of [[1000,500],[320,640],[640,320]]){
 test(`plan picking matches rendered coordinates at ${width}x${height}`,()=>{
  const rect={left:42,top:83,width,height};const canvas={getBoundingClientRect:()=>rect};
  const pt=plantPlanProjection(rect,layout);
  for(const m of layout.placements.slice(0,2)){
   const [x,y]=pt(m.x,m.y);
   assert.equal(pickPlantPlanAsset(canvas,layout,x+42,y+83),m.machineId);
   assert.equal(pickPlantPlanAsset(canvas,layout,x+42+15,y+83),m.machineId);
   assert.equal(pickPlantPlanAsset(canvas,layout,x+42+17,y+83),null);
  }
  const [x,y]=pt(200,100);assert.equal(pickPlantPlanAsset(canvas,layout,x+42,y+83),null);
  assert.equal(pickPlantPlanAsset(canvas,layout,41,83),null);
 });
}
test('plan picking chooses the closest identified marker and rejects invalid layouts',()=>{
 const rect={left:0,top:0,width:220,height:120},canvas={getBoundingClientRect:()=>rect};
 const crowded={...layout,placements:[{machineId:'a',x:150,y:75},{machineId:'b',x:155,y:75}]};
 const [x,y]=plantPlanProjection(rect,layout)(155,75);
 assert.equal(pickPlantPlanAsset(canvas,crowded,x,y),'b');
 assert.equal(pickPlantPlanAsset(canvas,layout,NaN,y),null);
 assert.equal(plantPlanProjection({width:0,height:0},layout),null);
 assert.equal(plantPlanProjection(rect,{bounds:{minX:0,maxX:0,minY:0,maxY:1}}),null);
});
