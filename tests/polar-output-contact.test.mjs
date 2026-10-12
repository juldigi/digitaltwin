import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Polar115MachineTemplate} from '../frontend/src/polar115.js';
import {Polar115ProcessSimulation} from '../frontend/src/simulation-polar115.js';

test('POLAR separated stock remains on the cutting-table support plane',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m),deck=m.findNode('polar-feed-center').children.find(o=>o.isMesh&&o.material.userData.surfaceKind==='tableDark');
 m.root.updateMatrixWorld(true);const deckBox=new THREE.Box3().setFromObject(deck);s.start();let now=1000,sawOutput=false,minSupport=Infinity;s.update(now);
 for(let i=0;i<890;i++){
  now+=10;s.update(now);if(!s.cutPiece.visible)continue;sawOutput=true;m.root.updateMatrixWorld(true);
  const front=new THREE.Box3().setFromObject(s.cutPiece),rear=new THREE.Box3().setFromObject(s.stock);
  assert.ok(Math.abs(front.min.y-(deckBox.max.y+s.stockSurfaceClearance))<1e-6,'removed stock floats above or penetrates the table');
  assert.ok(Math.abs(rear.min.y-(deckBox.max.y+s.stockSurfaceClearance))<1e-6,'rear remainder leaves the audited support plane');
  const supportedDepth=Math.max(0,Math.min(front.max.z,deckBox.max.z)-Math.max(front.min.z,deckBox.min.z));minSupport=Math.min(minSupport,supportedDepth/front.getSize(new THREE.Vector3()).z);
 }
 assert.ok(sawOutput);assert.ok(minSupport>.88,'removed stock loses adequate table support');
 s.dispose();m.dispose();
});

test('POLAR output motion waits for full clamp release and follows the operator-side table',()=>{
 const m=new Polar115MachineTemplate(),s=new Polar115ProcessSimulation(m.root,m);s.start();let now=1000,sawMove=false,sawReady=false,lastZ=Infinity;s.update(now);
 for(let i=0;i<890;i++){
  now+=10;s.update(now);const st=s.state();
  if(st.outputMoving){sawMove=true;assert.ok(s.clampHoldAmount<1e-9,'stock moves while clamp pressure remains applied');assert.equal(st.knifeDownstroke,false);assert.ok(s.cutPiece.position.z<=lastZ+1e-10,'output reverses toward the knife');}
  if(st.outputReady){sawReady=true;assert.ok(Math.abs(s.cutPiece.position.z+.56)<1e-9);}
  if(s.cutPiece.visible)lastZ=s.cutPiece.position.z;
 }
 assert.ok(sawMove&&sawReady);assert.equal(s.state().materialSplit.conserved,true);
 s.stop();assert.equal(s.cutPiece.visible,false);assert.ok(s.cutPiece.position.distanceTo(new THREE.Vector3(0,s.stockRestY,s.frontPieceCenterZ))<1e-10);
 s.dispose();m.dispose();
});

test('POLAR output uses the existing material-handling taxonomy without invented delivery hardware',()=>{
 const m=new Polar115MachineTemplate();const table=m.resolveTaxonomyNode('P115.FEED.CENTER.BLOCK.PART.X');assert.equal(table?.userData.nodeId,'polar-feed-center');
 assert.equal(m.findNode('polar-delivery'),null);assert.equal(m.findNode('polar-output-conveyor'),null);
 for(const low of [false,true])for(const interior of [false,true]){m.setExteriorOpen(interior);m.setLow(low);assert.equal(m.findNode('polar-feed-center').children.some(x=>x.isMesh&&x.visible),true);}
 m.dispose();
});
