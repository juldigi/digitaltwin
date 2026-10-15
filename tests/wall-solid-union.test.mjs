import test from 'node:test';
import assert from 'node:assert/strict';
import {removeCoveredWallRuns,buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';

test('wall union preserves wider solid and uncovered ends without closing openings',()=>{
 const walls=[{a:[0,0],b:[10,0],width:.1,handle:'thin'},{a:[7,0],b:[3,0],width:.2,handle:'wide'},{a:[0,.01],b:[10,.01],width:.1,handle:'offset'}];
 const result=removeCoveredWallRuns(walls);
 assert.deepEqual(result.walls.filter(w=>w.handle==='thin').map(w=>[w.a,w.b]),[[[0,0],[3,0]],[[7,0],[10,0]]]);
 assert.equal(result.removed.reduce((s,r)=>s+r.length,0),4);
 assert.equal(result.walls.find(w=>w.handle==='offset'),walls[2]);
 assert.deepEqual(walls[0].b,[10,0]);
 const gaps=removeCoveredWallRuns([{a:[0,0],b:[2,0],width:.1},{a:[3,0],b:[4,0],width:.1}]);
 assert.equal(gaps.walls.length,2);assert.equal(gaps.removed.length,0);
});

test('all opaque room panels follow wall visibility and door headers retain the opening',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const {root,layers}=buildActualFactory(layout,fleet);let panels=0,headers=0;
 root.traverse(o=>{const s=o.userData?.semantic||'';
  if(/^(ROOM_ENVELOPE_SUPPLEMENT_REFERENCE|PRESS_ROOM_LOWER_PARTITION|V203_ROOM_INTERIOR_LINER_DOOR_HEADER)$/.test(s)){
   panels++;let p=o;while(p&&p!==layers.walls)p=p.parent;assert.equal(p,layers.walls,s);
  }
  if(s==='V203_ROOM_INTERIOR_LINER_DOOR_HEADER'){headers++;assert.ok(o.geometry.parameters.height>0);}
 });
 assert.ok(panels>20);assert.equal(headers,17);
 assert.equal(root.userData.wallSolidUnionAudit.removedIntervals.length,9);
 assert.ok(root.userData.wallSolidUnionAudit.removedLength>13);
});
