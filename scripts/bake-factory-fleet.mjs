import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {writeFileSync} from 'node:fs';import {gzipSync} from 'node:zlib';
import {createMachineTemplate} from '../frontend/src/machine-runtime.js';
import {MACHINE_PLACEMENTS} from '../frontend/src/data/plant-actual.js';
const result=[];let unknown=0;
for(const place of MACHINE_PLACEMENTS){
 const t=createMachineTemplate(place.machineId);t.setLow?.(true);t.setExteriorOpen?.(false);t.root.updateMatrixWorld(true);
 const box=new THREE.Box3().setFromObject(t.root),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
 const buckets=new Map();
 t.root.traverse(o=>{
  if(!o.isMesh||Array.isArray(o.material))return;for(let a=o;a;a=a.parent)if(!a.visible)return;
  const b=new THREE.Box3().setFromObject(o),s=b.getSize(new THREE.Vector3());
  // Cull tiny service hardware only in the distant factory overview; source model remains unchanged.
  if(s.x*s.y*s.z<.003||Math.max(s.x,s.y,s.z)<.12)return;
  let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);g.translate(-center.x,-box.min.y,-center.z);
  for(const name of Object.keys(g.attributes))if(!['position','normal'].includes(name))g.deleteAttribute(name);
  if(!g.attributes.normal)g.computeVertexNormals();
  const c=o.material.color?.getHex()??0x8b9ba6;
  if(!buckets.has(c))buckets.set(c,[]);buckets.get(c).push(g);
 });
 const meshes=[];for(const [color,gs] of buckets){const g=mergeGeometries(gs);const pos=[],idx=[],lookup=new Map(),arr=g.attributes.position.array;for(let i=0;i<arr.length;i+=9){const tri=[];for(let j=0;j<9;j+=3){const xyz=[0,1,2].map(k=>Math.round(arr[i+j+k]*40)/40),key=xyz.join(',');if(!lookup.has(key)){lookup.set(key,pos.length/3);pos.push(...xyz);}tri.push(lookup.get(key));}if(new Set(tri).size===3)idx.push(...tri);}meshes.push({color,p:pos,i:idx});g.dispose();gs.forEach(g=>g.dispose());}
 const placement={...place};if(place.status==='UNIDENTIFIED'){placement.x=112+(unknown%3)*12;placement.y=8+Math.floor(unknown/3)*12;unknown++;}
 result.push({placement,size:size.toArray(),center:center.toArray(),floor:box.min.y,meshes});t.dispose();
}
const encoded=gzipSync(JSON.stringify(result)).toString('base64'),chunkSize=180000;
const chunks=Array.from({length:Math.ceil(encoded.length/chunkSize)},(_,i)=>encoded.slice(i*chunkSize,(i+1)*chunkSize));
chunks.forEach((chunk,i)=>writeFileSync(`frontend/src/data/factory-fleet-chunk-${i}.js`,`export default '${chunk}';\n`));
writeFileSync('frontend/src/data/factory-fleet-data.js',
  `// Distant-view geometry baked from existing machine templates; no detailed model edits.\n`+
  chunks.map((_,i)=>`import c${i} from './factory-fleet-chunk-${i}.js';`).join('\n')+
  `\nexport const FACTORY_FLEET_GZIP=[${chunks.map((_,i)=>`c${i}`).join(',')}].join('');\n`);
console.log({machines:result.length,unidentified:unknown,bytes:encoded.length});
