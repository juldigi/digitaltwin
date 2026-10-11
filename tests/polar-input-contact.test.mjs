import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Polar115MachineTemplate} from '../frontend/src/polar115.js';
import {POLAR115_TAXONOMY} from '../frontend/src/data/taxonomy-polar115.js';
import {POLAR115_SPEC} from '../frontend/src/data/dimensions-polar115.js';

test('POLAR air ports are mounted in the photographed sole white side table',()=>{
 const m=new Polar115MachineTemplate();m.root.updateMatrixWorld(true);
 const deck=m.findNode('polar-feed-right').children.find(o=>o.isMesh&&o.userData.surfaceKind===undefined&&o.material.userData.surfaceKind==='table');
 const table=new THREE.Box3().setFromObject(deck),ports=m.meshes.filter(o=>o.userData.airNozzle);
 assert.equal(ports.length,88);
 const centers=[];
 for(const port of ports){const b=new THREE.Box3().setFromObject(port),c=b.getCenter(new THREE.Vector3());centers.push(c);
  assert.ok(b.min.y<table.max.y&&b.max.y<=table.max.y+.00401,'air port floats above or penetrates beyond tabletop');
  assert.ok(b.min.x>table.min.x&&b.max.x<table.max.x&&b.min.z>table.min.z&&b.max.z<table.max.z,'air grid extends outside tabletop');
 }
 const gridCenter=centers.reduce((v,c)=>v.add(c),new THREE.Vector3()).multiplyScalar(1/centers.length);
 assert.ok(Math.abs(gridCenter.x-table.getCenter(new THREE.Vector3()).x)<1e-6,'air grid is offset from side deck');
 for(const low of [true,false])for(const interior of [true,false]){m.setExteriorOpen(interior);m.setLow(low);assert.equal(deck.visible,true);}
 assert.ok(!POLAR115_TAXONOMY.find(n=>n.id==='P115.FEED.LEFT').name.includes('perforated'));
 assert.ok(!POLAR115_SPEC.verifiedFeatures.includes('left air side table'));
 m.dispose();
});
