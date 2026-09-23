import * as THREE from 'three';
import {clipWallToMachineClearance,machineClearanceBoxes} from './factory-building.js';

// Mobile factory view uses the same surveyed wall coordinates and fleet
// footprints. Detailed individual machines are loaded when selected.
export function buildFactoryOverview(layout,fleet){
 const root=new THREE.Group(),layers={},assets=new Map();root.name='BMJ factory · lightweight CAD overview';
 for(const name of ['building','roof','machines','labels','landscape','reference','unidentified','utility_compressed_air','utility_ahu_piping','utility_ahu_ducting','utility_anchors']){layers[name]=new THREE.Group();layers[name].name=name;root.add(layers[name]);}
 for(const name of ['roof','landscape','reference','unidentified','utility_compressed_air','utility_ahu_piping','utility_ahu_ducting','utility_anchors'])layers[name].visible=false;
 const outline=[[-4,2],[6,2],[6,6],[96,6],[96,90],[90,96],[73,96],[73,103],[23,103],[23,96],[6,96],[6,55],[-5,55],[-5,11],[-4,11]];
 const floor=new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(outline.map(([x,y])=>new THREE.Vector2(x,y)))),new THREE.MeshStandardMaterial({color:0xd8dcda,roughness:.95}));floor.rotation.x=-Math.PI/2;floor.position.y=-.02;floor.userData.semantic='CAD_FLOOR_OUTLINE';layers.building.add(floor);
 const box=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D();
 const clearances=machineClearanceBoxes(fleet);
 const walls=layout.actual.walls.flatMap(w=>clipWallToMachineClearance(w,clearances)).filter(w=>Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1])>.25);
 const wallMesh=new THREE.InstancedMesh(box,new THREE.MeshStandardMaterial({color:0x9eafb2,roughness:.86}),walls.length);
 walls.forEach((w,i)=>{const dx=w.b[0]-w.a[0],dz=-(w.b[1]-w.a[1]);dummy.position.set((w.a[0]+w.b[0])/2,1.72,-(w.a[1]+w.b[1])/2);dummy.rotation.set(0,-Math.atan2(dz,dx),0);dummy.scale.set(Math.hypot(dx,dz),3.44,Math.max(.09,w.width||.12));dummy.updateMatrix();wallMesh.setMatrixAt(i,dummy.matrix);});wallMesh.instanceMatrix.needsUpdate=true;wallMesh.userData.semantic='CAD_WALL_SEGMENTS';layers.building.add(wallMesh);
 const columns=layout.actual.columns,columnsMesh=new THREE.InstancedMesh(box,new THREE.MeshStandardMaterial({color:0x69818a,roughness:.82}),columns.length);
 columns.forEach(([x,y],i)=>{dummy.position.set(x,2.3,-y);dummy.rotation.set(0,0,0);dummy.scale.set(.35,4.6,.35);dummy.updateMatrix();columnsMesh.setMatrixAt(i,dummy.matrix);});columnsMesh.instanceMatrix.needsUpdate=true;columnsMesh.userData.semantic='CAD_COLUMN_CENTERS';layers.building.add(columnsMesh);
 const mat=new THREE.MeshStandardMaterial({color:0x5d8393,roughness:.74});
 for(const f of fleet){const p=f.placement;if(!Number.isFinite(p.x)||!Number.isFinite(p.y))continue;const g=new THREE.Group();g.name=p.label;g.position.set(p.x,0,-p.y);g.rotation.y=p.rotation*Math.PI/180;g.userData={machineId:p.machineId,representation:'CAD_POSITION_FOOTPRINT_OVERVIEW'};const m=new THREE.Mesh(box,mat);m.scale.set(Math.max(.3,f.size[0]),Math.max(.3,f.size[1]),Math.max(.3,f.size[2]));m.position.y=m.scale.y/2;m.userData.machineId=p.machineId;g.add(m);layers.machines.add(g);assets.set(p.machineId,g);}
 root.userData={baselineId:layout.baselineId,geometryStatus:'CAD_WALLS_AND_MACHINE_FOOTPRINTS__DETAILED_MODELS_ON_SELECTION',mobileOptimized:true};
 return {root,layers,assets,machineBoxes:[],utilityRouting:null};
}
