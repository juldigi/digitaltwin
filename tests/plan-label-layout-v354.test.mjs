import test from 'node:test';
import assert from 'node:assert/strict';
import {layoutPlantPlanLabels} from '../frontend/src/data/plant-layout-data.js';

test('dense 2D overview labels do not overlap and selected asset identity is always retained',()=>{
 const layout={bounds:{minX:0,maxX:100,minY:0,maxY:100},placements:[{machineId:'selected',label:'OFFSET 5',x:50,y:50,status:'VERIFIED'}],identifiedLabels:Array.from({length:30},(_,i)=>({text:'Room '+i,x:45+i/2,y:45+i/2}))};
 const original=JSON.stringify(layout);
 for(const rect of [{width:320,height:240},{width:1360,height:860}]){
  const labels=layoutPlantPlanLabels(rect,layout,{selectedAsset:'selected'});
  assert.equal(labels.filter(label=>label.selected).length,1);
  assert.equal(labels[0].text,'OFFSET 5');
  assert.ok(labels.length<31);
  for(let i=0;i<labels.length;i++){
   const a=labels[i].box;
   for(const label of labels.slice(i+1)){const b=label.box;assert.ok(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom);}
   assert.ok(labels[i].x>=8&&labels[i].y<=rect.height-8);
  }
 }
 assert.equal(JSON.stringify(layout),original,'label placement must not mutate measured layout');
});

test('unidentified assets cannot gain a selected label and invalid viewports remain empty',()=>{
 const layout={bounds:{minX:0,maxX:100,minY:0,maxY:100},placements:[{machineId:'unknown',label:'Unverified',x:50,y:50,status:'UNIDENTIFIED'}],identifiedLabels:[]};
 assert.deepEqual(layoutPlantPlanLabels({width:390,height:800},layout,{selectedAsset:'unknown'}),[]);
 assert.deepEqual(layoutPlantPlanLabels({width:0,height:0},layout),[]);
});
