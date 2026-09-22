import * as T from 'three';
import {FACTORY_FLEET_GZIP} from './data/factory-fleet-data.js';
import {decodePlantData} from './data/plant-actual.js';
let fleetCache;
export async function loadFactoryFleet(){return fleetCache||(fleetCache=await decodePlantData(FACTORY_FLEET_GZIP));}
export function buildActualFactory(layout,fleet){
 const root=new T.Group();root.name='BMJ · baseline 250804 + revisi';const layers={};
 for(const name of ['building','roof','machines','labels','landscape','reference','unidentified']){layers[name]=new T.Group();layers[name].name=name;root.add(layers[name]);}
 layers.roof.visible=false;layers.reference.visible=false;
 const mats=new Map();const material=(color,opacity=1)=>{const k=color+':'+opacity;if(!mats.has(k))mats.set(k,new T.MeshStandardMaterial({color,roughness:.82,metalness:.04,transparent:opacity<1,opacity,depthWrite:opacity===1,side:T.DoubleSide}));return mats.get(k);};
 const boxGeo=new T.BoxGeometry(1,1,1);
 const box=(parent,x,y,z,w,h,d,color,rot=0,opacity=1)=>{const o=new T.Mesh(boxGeo,material(color,opacity));o.position.set(x,y,z);o.scale.set(w,h,d);o.rotation.y=rot;o.receiveShadow=true;parent.add(o);return o;};
 const line=(parent,a,b,r,color)=>{const delta=new T.Vector3().subVectors(b,a),o=new T.Mesh(new T.CylinderGeometry(r,r,delta.length(),6),material(color));o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());parent.add(o);return o;};
 const label=(text,x,y,z,width=7,color='#20394c',parent=layers.labels)=>{
  if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=512;c.height=80;const ctx=c.getContext('2d');if(!ctx)return;
  ctx.fillStyle='rgba(250,253,255,.92)';ctx.fillRect(0,0,512,80);ctx.fillStyle=color;ctx.font='600 27px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,49,490);
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const s=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:false}));s.position.set(x,y,z);s.scale.set(width,width*80/512,1);parent.add(s);return s;
 };
 const data=layout.actual,b=layers.building;
 // The outline follows the source production hall and attached office/service wings.
 const outline=[[-4,2],[6,2],[6,6],[96,6],[96,90],[90,96],[73,96],[73,103],[23,103],[23,96],[6,96],[6,55],[-5,55],[-5,11],[-4,11]];
 const shape=new T.Shape(outline.map(([x,y])=>new T.Vector2(x,y))),floor=new T.Mesh(new T.ShapeGeometry(shape),material(0xd8dcda));floor.rotation.x=-Math.PI/2;floor.position.y=-.015;floor.receiveShadow=true;b.add(floor);
 box(layers.landscape,47,-.25,-57,117,.35,137,0x9ea9a5);
 box(layers.landscape,47,-.06,1.8,110,.04,7.5,0x626d73);
 box(layers.landscape,-9,-.06,-53,5,.04,110,0x626d73);
 const machineBoxes=[];
 for(const f of fleet){const p=f.placement,r=p.rotation*Math.PI/180,c=Math.abs(Math.cos(r)),s=Math.abs(Math.sin(r));machineBoxes.push({p,minX:p.x-(f.size[0]*c+f.size[2]*s)/2,maxX:p.x+(f.size[0]*c+f.size[2]*s)/2,minY:p.y-(f.size[0]*s+f.size[2]*c)/2,maxY:p.y+(f.size[0]*s+f.size[2]*c)/2});}
 const intersectsMachine=(a,c)=>machineBoxes.some(m=>m.p.status!=='UNIDENTIFIED'&&Math.max(a[0],c[0])>m.minX+.05&&Math.min(a[0],c[0])<m.maxX-.05&&Math.max(a[1],c[1])>m.minY+.05&&Math.min(a[1],c[1])<m.maxY-.05);
 const omitted=[];
 for(const w of data.walls){const [a,c]=[w.a,w.b];if(intersectsMachine(a,c)){omitted.push(w);continue;}
  const dx=c[0]-a[0],dy=c[1]-a[1],len=Math.hypot(dx,dy),r=Math.atan2(dy,dx),x=(a[0]+c[0])/2,z=-(a[1]+c[1])/2;
  const wall=box(b,x,1.6,z,len,3.2,w.width,0xe8e5df,r);wall.userData={semantic:'WALL',sourceHandles:w.handles,heightStatus:'VISUAL_ESTIMATE'};
  box(b,x,.2,z,len,.4,w.width+.015,0x6b8289,r);
  // Clerestory window treatment has source-aligned position, with assumed sill and glass detail.
  if(len>4){box(b,x,2.15,z,Math.max(.6,len-.55),.65,w.width+.02,0xa5cbd0,r,.48);}
 }
 for(const [x,y] of data.columns){if(intersectsMachine([x-.3,y-.3],[x+.3,y+.3]))continue;box(b,x,3.4,-y,.32,6.8,.32,0x819397);box(b,x,.18,-y,.55,.36,.55,0xa1aaa8);}
 for(const d of data.doors){const g=new T.Group();g.position.set(d.x,0,-d.y);g.rotation.y=d.rotation*Math.PI/180;b.add(g);g.userData={semantic:'DOOR',evidence:d.evidence};
  box(g,-d.width/2,1.2,0,.07,2.4,.13,0x526b75);box(g,d.width/2,1.2,0,.07,2.4,.13,0x526b75);box(g,0,2.38,0,d.width+.1,.08,.13,0x526b75);
  const leaf=box(g,-d.width/2+.15,1.13,-d.width*.38,d.width*.9,2.25,.045,0xa7bdc4,Math.PI/2.6);leaf.userData.semantic='OPEN_DOOR_LEAF';
 }
 for(const d of data.curtains){const g=new T.Group();g.position.set(d.x,0,-d.y);g.rotation.y=d.rotation*Math.PI/180;b.add(g);g.userData={semantic:'PVC_CURTAIN',evidence:d.evidence};
  box(g,0,2.86,0,d.width+.2,.14,.16,0x526e7c);
  const n=Math.ceil(d.width/.22);for(let i=0;i<n;i++)box(g,-d.width/2+(i+.5)*d.width/n,1.4,.015*(i%2),d.width/n+.025,2.75,.012,0xb2e1e4,0,.22);
 }
 // Open loading dock, bumpers, canopy and source folding-gate entrance.
 box(b,84,.42,-4.1,7.5,.85,3.2,0x8d9798);for(const x of [81,83,85,87])box(b,x,.75,-2.45,.32,.6,.18,0x303b42);
 box(layers.roof,84,4.5,-4.2,9,.15,5,0x536e7a);box(b,14,1.25,-2.2,4.5,2.5,.09,0x8a9da3,0,.6);
 // Roof panels and trusses are elevations inferred from the footprint, independently hideable.
 for(const [x,w,z,d] of [[51,90,-51,90],[47.5,51,-99.5,7],[.5,11,-33,44]]){
  const half=w/2,slope=Math.atan2(2,half),len=Math.hypot(half,2);
  for(const sign of [-1,1]){const roof=box(layers.roof,x+sign*w/4,7.8,z,len,.16,d,0x6e8790);roof.rotation.z=-sign*slope;
   for(let j=-d/2+1;j<d/2;j+=2)line(layers.roof,new T.Vector3(x,8.85,z+j),new T.Vector3(x+sign*w/2,6.85,z+j),.035,0xa7b8bc);
  }
  for(let zz=z-d/2+3;zz<z+d/2;zz+=6){line(layers.roof,new T.Vector3(x-w/2,6.6,zz),new T.Vector3(x+w/2,6.6,zz),.07,0x4d6570);line(layers.roof,new T.Vector3(x-w/2,6.6,zz),new T.Vector3(x,8.7,zz),.07,0x4d6570);line(layers.roof,new T.Vector3(x,8.7,zz),new T.Vector3(x+w/2,6.6,zz),.07,0x4d6570);}
 }
 // Source-labelled service rooms: modest furniture silhouettes, no invented machine identities.
 const roomWords=/Workshop|Adm Room|QC Sample|R\.PDS|R\.Sample|R\.INCOMING|WH Spareparts|Mushola|Loading Dock|CTF|CTP|Toilet|R\.BROKE|R\.FPS|Electric room|PPIC/i;
 for(const l of data.labels){if(!roomWords.test(l.text))continue;if(l.x>34.7&&l.x<63.1&&l.y>56.9&&l.y<65.1)continue;
  label(l.text,l.x,3.45,-l.y,Math.min(8,3+l.text.length*.13),'#526772');
  if(/Adm|QC|PPIC|PDS|Sample/i.test(l.text)){box(b,l.x,.75,-l.y,1.3,.09,.7,0xb89d78);for(const xx of [-.5,.5])box(b,l.x+xx,.37,-l.y,.06,.7,.5,0x63737b);box(b,l.x,.48,-l.y+.7,.5,.1,.5,0x526d7c);}
  if(/Spareparts|Workshop/i.test(l.text))for(let i=0;i<3;i++)box(b,l.x+i*.9,1,-l.y,.75,2,.48,0x7d9195);
 }
 // Raw-material racks stay in the northern RMS zone; Sheeting is below it, never on it.
 for(const x of [85,88.5,92])for(const y of [73,78,83]){box(b,x,.12,-y,1.8,.24,2.4,0x9b7c55);for(let n=0;n<3;n++){const roll=new T.Mesh(new T.CylinderGeometry(.48,.48,1.4,12),material(0xd9cbb0));roll.position.set(x+(n-1)*.55,.93,-y);b.add(roll);}}
 label('RMS',88.5,3.8,-81,5);
 // IPAL / utilities follow the northern service yard, not the machine registry.
 for(const [x,y,r,h] of [[55.5,112,2.7,2.1],[46,113,1.1,2],[46,108,1.1,2],[59.5,106.5,1,1.7]]){const tank=new T.Mesh(new T.CylinderGeometry(r,r,h,24),material(0x8fa59b));tank.position.set(x,h/2,-y);b.add(tank);}
 label('IPAL',52,3.5,-116,5);
 // Landscape is a visual assumption outside the measured building, explicitly recorded in metadata.
 for(let i=0;i<10;i++){const x=-13.1,z=-8-i*10;box(layers.landscape,x,.08,z,2.4,.22,4,0x69846b);line(layers.landscape,new T.Vector3(x,0,z),new T.Vector3(x,2,z),.13,0x87745c);for(const [dx,dy,dz] of [[0,3,0],[-.65,2.65,.2],[.65,2.6,-.2]]){const crown=new T.Mesh(new T.IcosahedronGeometry(1.1,1),material(0x4f785b));crown.position.set(x+dx,dy,z+dz);layers.landscape.add(crown);}}
 for(let i=0;i<12;i++){box(layers.landscape,26+i*4,.18,8,3,.35,1.6,0x879b87);const shrub=new T.Mesh(new T.IcosahedronGeometry(.65,1),material(0x50775d));shrub.position.set(26+i*4,.85,8);layers.landscape.add(shrub);}
 for(const z of [-61,-68])box(layers.landscape,-9,1.2,z,.45,2.4,.45,0x71878d);
 box(layers.landscape,-9,1.15,-64.5,.09,2.1,5,0x617b86,0,.55);label('GERBANG',-9,3.7,-64.5,6,'#244b5c');
 // All assets use existing silhouette meshes at unit scale, centred inside their own footprint.
 const assets=new Map();
 for(const f of fleet){const p=f.placement,g=new T.Group();g.name=p.label;g.position.set(p.x,0,-p.y);g.rotation.y=p.rotation*Math.PI/180;g.userData={machineId:p.machineId,placementStatus:p.status,semantic:'FACTORY_MACHINE',scaleFitApplied:false};
  for(const s of f.meshes){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(s.p,3));geo.setIndex(s.i);geo.computeVertexNormals();const mesh=new T.Mesh(geo,material(s.color));mesh.userData.machineId=p.machineId;g.add(mesh);}
  (p.status==='UNIDENTIFIED'?layers.unidentified:layers.machines).add(g);assets.set(p.machineId,g);
  label(p.label,p.x,Math.max(3.3,f.size[1]+.6),-p.y,Math.min(9,4+p.label.length*.08),p.status==='UNIDENTIFIED'?'#8a5921':'#244b5c',p.status==='UNIDENTIFIED'?layers.unidentified:layers.labels);
 }
 box(layers.unidentified,124,-.07,-44,38,.1,86,0xd9d4c5);label('POSISI AKTUAL BELUM TERIDENTIFIKASI',124,4,-90,30,'#835a2c',layers.unidentified);
 const pts=data.segments.flatMap(s=>[s[0],.012,-s[1],s[2],.012,-s[3]]),geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pts,3));layers.reference.add(new T.LineSegments(geo,new T.LineBasicMaterial({color:0x355e72,transparent:true,opacity:.4})));
 root.userData={baselineId:layout.baselineId,assumptions:data.assumptions,omittedCollisionWalls:omitted.length,legacyWalls:data.legacyWalls.length};
 return {root,layers,assets,machineBoxes};
}
