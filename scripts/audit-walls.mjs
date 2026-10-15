import fs from 'node:fs';
import * as T from 'three';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
const {root,layers}=buildActualFactory(layout,fleet);root.updateMatrixWorld(true);
const records=[],counts={},invalid=[];let triangles=0;
root.traverse(o=>{
 if(!o.isMesh)return;
 const semantic=o.userData?.semantic||'';let p=o,wallLayer=false,visible=true,source=null;
 while(p){if(p===layers.walls)wallLayer=true;if(!p.visible)visible=false;if(p.userData?.semantic==='SOURCE_WALL_SEGMENT')source=p.userData;p=p.parent;}
 if(!wallLayer&&!/WALL|PARTITION|INTERIOR_LINER/.test(semantic))return;
 const position=o.geometry.attributes.position,indices=o.geometry.index;const bounds=new T.Box3();let bad=0;
 for(let i=0;i<position.count;i++){const v=new T.Vector3().fromBufferAttribute(position,i).applyMatrix4(o.matrixWorld);if(![v.x,v.y,v.z].every(Number.isFinite))bad++;else bounds.expandByPoint(v);}
 const n=(indices?indices.count:position.count)/3;triangles+=n;if(bad)invalid.push({semantic,bad});
 counts[semantic]=(counts[semantic]||0)+1;
 records.push({id:records.length+1,semantic,visible,wallLayer,sourceEntityId:source?.sourceEntityId||null,room:o.userData.roomLabel||null,machineId:o.userData.machineId||null,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},triangles:n,sourceWidth:source?.sourceWidth||null,sourceHeight:source?.sourceHeight||null,sourceShiftM:source?.sourceShiftM||null,sourceCoordinates:source?.sourceCoordinates||null,evidence:source?'DXF_PLAN_HEIGHT_VISUAL_ESTIMATE':o.userData.accuracy||'REFERENCE_GEOMETRY_NOT_AS_BUILT'});
});
const segments=layers.walls.children.filter(o=>o.userData.semantic==='SOURCE_WALL_SEGMENT').map(o=>{const u=o.userData,l=u.sourceLength,c=Math.cos(o.rotation.y),s=Math.sin(o.rotation.y);return {handle:u.sourceEntityId,width:u.sourceWidth,a:[o.position.x-c*l/2,-o.position.z-s*l/2],b:[o.position.x+c*l/2,-o.position.z+s*l/2]};});
const overlaps=[];
for(let i=0;i<segments.length;i++)for(let j=0;j<i;j++){
 const a=segments[i],b=segments[j],dx=a.b[0]-a.a[0],dy=a.b[1]-a.a[1],len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
 if(Math.abs(ux*(b.b[1]-b.a[1])-uy*(b.b[0]-b.a[0]))>1e-7||Math.abs((b.a[0]-a.a[0])*uy-(b.a[1]-a.a[1])*ux)>1e-6)continue;
 const t0=(b.a[0]-a.a[0])*ux+(b.a[1]-a.a[1])*uy,t1=(b.b[0]-a.a[0])*ux+(b.b[1]-a.a[1])*uy,overlap=Math.min(len,Math.max(t0,t1))-Math.max(0,Math.min(t0,t1));
 if(overlap>1e-6)overlaps.push({a:a.handle,b:b.handle,overlap});
}
const report={baseCommit:'d480f2ceff3b316c50a6c7f09431d97bd4f0a669',scope:'Every mesh in wall layer plus wall/partition/liner semantics in all other layers; every transformed vertex and triangle count; exact source-centreline overlap second pass',sourceWalls:root.userData.wallDeduplication.input,renderedSourceSegments:segments.length,meshCount:records.length,triangles,invalid,remainingExactSourceOverlaps:overlaps,solidUnion:root.userData.wallSolidUnionAudit,counts,records,limitations:['No as-built height/thickness/partition survey certification','Perpendicular junction contacts and finish/structural layering are intentional, not globally removed','No live 3D visual confirmation in current browser']};
report.records=records.map(r=>({...r,bounds:{min:r.bounds.min.map(x=>+x.toFixed(6)),max:r.bounds.max.map(x=>+x.toFixed(6))}}));
fs.writeFileSync('docs/wall-audit-inventory-20261015.json',JSON.stringify(report)+'\n');
console.log(JSON.stringify({...report,records:undefined,counts:undefined},null,2));
if(invalid.length||overlaps.length)process.exitCode=1;
