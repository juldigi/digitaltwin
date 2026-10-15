// Orthographic previews of the existing baked fleet. No new machine geometry.
import {mkdirSync,writeFileSync} from 'node:fs';
import {deflateSync} from 'node:zlib';
import {loadFactoryFleet} from '../frontend/src/factory-building.js';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
const fleet=await loadFactoryFleet(),ids=new Set(MACHINE_REGISTRY.map(m=>m.machineId));
mkdirSync('frontend/assets/machines',{recursive:true});
const az=.72,el=.46,ca=Math.cos(az),sa=Math.sin(az),ce=Math.cos(el),se=Math.sin(el);
const project=([x,y,z])=>[x*ca-z*sa,-y*ce+(x*sa+z*ca)*se,x*sa*ce+y*se+z*ca*ce];
// Small deterministic CPU rasterizer keeps browser previews light; no WebGL dependency.
const crc=b=>{let c=0xffffffff;for(const v of b){c^=v;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;};
const chunk=(name,data)=>{const type=Buffer.from(name),out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);type.copy(out,4);data.copy(out,8);out.writeUInt32BE(crc(Buffer.concat([type,data])),data.length+8);return out;};
function raster(faces,point){
 const width=640,height=320,pixels=Buffer.alloc(width*height*4);
 for(const face of faces){const p=face.p.map(v=>point(v).map(x=>x*2)),[a,b,c]=p,area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);if(Math.abs(area)<.001)continue;
  const minX=Math.max(0,Math.floor(Math.min(...p.map(v=>v[0])))),maxX=Math.min(width-1,Math.ceil(Math.max(...p.map(v=>v[0])))),minY=Math.max(0,Math.floor(Math.min(...p.map(v=>v[1])))),maxY=Math.min(height-1,Math.ceil(Math.max(...p.map(v=>v[1])))),rgb=[1,3,5].map(i=>parseInt(face.color.slice(i,i+2),16)),alpha=Math.max(0,Math.min(1,face.opacity));
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){const px=x+.5,py=y+.5,u=((b[0]-px)*(c[1]-py)-(b[1]-py)*(c[0]-px))/area,v=((c[0]-px)*(a[1]-py)-(c[1]-py)*(a[0]-px))/area;if(u<-.0001||v<-.0001||u+v>1.0001)continue;const i=(y*width+x)*4,old=pixels[i+3]/255,combined=alpha+old*(1-alpha);for(let k=0;k<3;k++)pixels[i+k]=Math.round((rgb[k]*alpha+pixels[i+k]*old*(1-alpha))/(combined||1));pixels[i+3]=Math.round(combined*255);}
 }
 const raw=Buffer.alloc(height*(width*4+1));for(let y=0;y<height;y++)pixels.copy(raw,y*(width*4+1)+1,y*width*4,(y+1)*width*4);
 const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=6;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}
let count=0;
for(const f of fleet){
 const id=f.placement.machineId;if(!ids.has(id))continue;const faces=[];
 for(const m of f.meshes){
  const vertices=[];for(let i=0;i<m.p.length;i+=3)vertices.push([m.p[i],m.p[i+1],m.p[i+2]]);
  for(let i=0;i<m.i.length;i+=3){
   const v=m.i.slice(i,i+3).map(i=>vertices[i]);if(v.some(p=>!p))continue;
   const u=v[1].map((x,k)=>x-v[0][k]),w=v[2].map((x,k)=>x-v[0][k]),n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],len=Math.hypot(...n);if(len<1e-10)continue;
   const facing=(n[0]*sa*ce+n[1]*se+n[2]*ca*ce)/len;if(facing<0)continue;
   const shade=.60+.36*Math.max(0,(n[0]*-.35+n[1]*.85+n[2]*.4)/len),c=m.color??0x81929b;
   const color='#'+[c>>16&255,c>>8&255,c&255].map(v=>Math.min(255,Math.round(v*shade+12)).toString(16).padStart(2,'0')).join('');
   const p=v.map(project);faces.push({p,color,depth:p.reduce((n,v)=>n+v[2],0)/3,opacity:m.opacity??1});
  }
 }
 const points=faces.flatMap(f=>f.p),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);if(!points.length)throw Error('No preview geometry: '+id);
 const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),scale=Math.min(280/(maxX-minX||1),132/(maxY-minY||1));
 const point=p=>[20+(280-(maxX-minX)*scale)/2+(p[0]-minX)*scale,13+(132-(maxY-minY)*scale)/2+(p[1]-minY)*scale];
 const png=raster(faces.sort((a,b)=>a.depth-b.depth),point);
 writeFileSync(`frontend/assets/machines/${id}.png`,png);count++;
}
if(count!==MACHINE_REGISTRY.length)throw Error(`Preview coverage ${count}/${MACHINE_REGISTRY.length}`);
console.log({machinePreviews:count});
