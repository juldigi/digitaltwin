import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {OFFSET5_INKING_ROLLERS,OFFSET5_INK_DISTRIBUTORS} from '../frontend/src/data/sources-offset5.js';
import {OFFSET5_DIMENSIONS} from '../frontend/src/data/dimensions-offset5.js';

test('uploaded-photo fountain stays recessed, dark and clear of the numbered interior rollers',()=>{
 const t=createPolishedMachineTemplate('offset5');
 try{
  for(let i=0;i<8;i++){
   const duct=t.findNode(`press-${i}-ink-fountain-roller-body`).children.find(o=>o.isMesh);
   assert.equal(duct.material.color.getHex(),t.palette.rubber);
   assert.ok(duct.position.y+duct.geometry.parameters.radiusTop<2.58,'roller below silver cabinet shoulder');
   for(const spec of [...OFFSET5_INKING_ROLLERS,...OFFSET5_INK_DISTRIBUTORS]){
    const [x,y]=spec.sectionCenter,clearance=Math.hypot(x-duct.position.x,y-duct.position.y)-spec.diameterMM*.00073-duct.geometry.parameters.radiusTop;
    assert.ok(clearance>0,`PU${i+1} duct intersects numbered roller ${spec.code}`);
   }
  }
 }finally{t.dispose();}
});

test('photo feedboard slopes toward the unchanged PU1 throat, with simulation above its surface',()=>{
 const t=createPolishedMachineTemplate('offset5');let sim;
 try{
  const board=t.findNode('feed-board'),D=OFFSET5_DIMENSIONS.layout;
  assert.ok(board.userData.photoRampRise>.3);
  const points=[];board.children.forEach(o=>{if(!o.isMesh||!o.userData.photoFeedboardRamp)return;const p=o.geometry.attributes.position;o.updateWorldMatrix(true,false);for(let i=0;i<p.count;i++)points.push(new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));});
  const at=x=>Math.max(...points.filter(p=>Math.abs(p.x-x)<.025).map(p=>p.y));
  const left=D.feedBoardCenterX-D.feedBoardLength/2,right=D.feedBoardCenterX+D.feedBoardLength/2;
  assert.ok(at(left)-at(right)>.35,'inclined receiving table');
  assert.equal(t.findNode('feedboard-pu1-throat').userData.deckHeight,1.30);
  sim=createMachineSimulation('offset5',t.root,t);
  for(const p of sim.points.filter(p=>p.x>left&&p.x<right))assert.ok(p.y>1.39+.42*(.5-(p.x-D.feedBoardCenterX)/board.scale.x),'sheet clears inclined suction tape');
  sim.start();for(let i=0;i<120;i++)sim.update(1/60);
  assert.ok(t.root.userData.actualPhotoShapeSources.length===16);
 }finally{sim?.dispose();t.dispose();}
});

test('clipped approach tread corners and photo hardware survive quality and exterior cycles',()=>{
 const t=createPolishedMachineTemplate('offset5');
 try{
  for(let i=0;i<7;i++){
   const stair=t.findNode(`press-${i}-steps`);let clipped=0;
   stair.traverse(o=>{if(o.isMesh&&o.userData.photoTreadChamfer){clipped+=o.userData.photoTreadCount||1;assert.ok(o.userData.photoTreadChamfer>.05);}});
   assert.equal(clipped,2);
  }
  for(const low of [true,false])for(const interior of [true,false]){
   t.setLow(low);t.setExteriorOpen(interior);
   for(let i=0;i<8;i++)assert.equal(t.findNode(`press-${i}-top-deck`).visible,!interior);
  }
 }finally{t.dispose();}
});
