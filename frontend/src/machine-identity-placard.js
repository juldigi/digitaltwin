import * as THREE from 'three';

// Registry identity belongs to this BMJ asset; mechanical options still follow
// the separate model-family evidence boundary.
export function applyMachineIdentityPlacard(mesh,{sap,model,serial}){
 mesh.userData.identityPlacard={sap,model,serial,source:'BMJ_ASSET_REGISTRY'};
 if(typeof document==='undefined')return;
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=160;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 ctx.fillStyle='#19242b';ctx.fillRect(0,0,768,160);
 ctx.fillStyle='#f7f8f6';ctx.font='bold 43px Arial, sans-serif';ctx.fillText(`${sap}  ${model}`.slice(0,31),24,67);
 ctx.fillStyle='#a9d7e9';ctx.font='29px Arial, sans-serif';ctx.fillText(`BMJ  ·  S/N ${serial}`,24,119);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=2;
 mesh.material=new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,depthWrite:true});
 mesh.userData.identityPlacardMaterial=mesh.material;
}

export function disposeMachineIdentityPlacards(root){
 root.traverse(node=>{const material=node.userData.identityPlacardMaterial;if(material){material.map?.dispose();material.dispose();}});
}
