// Keep hard face normals and material response through distant-view compression.
export function fleetMaterialDescriptor(material){
 return {
  color:material.color?.getHex()??0x8b9ba6,
  roughness:Number.isFinite(material.roughness)?material.roughness:.82,
  metalness:Number.isFinite(material.metalness)?material.metalness:0,
  opacity:Number.isFinite(material.opacity)?material.opacity:1,
  surface:material.userData?.industrialSurface||null
 };
}

export function bakeIndexedSurface(geometry){
 const p=[],n=[],i=[],lookup=new Map(),pos=geometry.attributes.position.array,norm=geometry.attributes.normal.array;
 for(let t=0;t<pos.length;t+=9){
  const tri=[];
  for(let j=0;j<9;j+=3){
   const at=t+j,xyz=[0,1,2].map(k=>Math.round(pos[at+k]*40)/40);
   const normal=[0,1,2].map(k=>Math.round(norm[at+k]*1000)/1000);
   const key=xyz.concat(normal).join(',');
   if(!lookup.has(key)){lookup.set(key,p.length/3);p.push(...xyz);n.push(...normal);}
   tri.push(lookup.get(key));
  }
  // Quantization can collapse a tiny bevel; do not emit zero-area faces.
  const points=tri.map(v=>p.slice(v*3,v*3+3)),a=points[0],b=points[1],c=points[2];
  const ab=b.map((v,k)=>v-a[k]),ac=c.map((v,k)=>v-a[k]);
  const area2=(ab[1]*ac[2]-ab[2]*ac[1])**2+(ab[2]*ac[0]-ab[0]*ac[2])**2+(ab[0]*ac[1]-ab[1]*ac[0])**2;
  if(area2>1e-12)i.push(...tri);
 }
 return {p,n,i};
}
