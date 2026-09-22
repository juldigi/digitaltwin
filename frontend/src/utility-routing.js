import * as T from 'three';
import {COMPRESSED_AIR_ROUTING_TEMPLATE} from './data/compressed-air-routes.js';
import {AHU_PIPE_ROUTING_TEMPLATE} from './data/ahu-pipe-routes.js';
import {AHU_DUCT_ROUTING_TEMPLATE} from './data/ahu-duct-routes.js';

export const ROUTING_STATUS_LEVELS=Object.freeze(['TEMPLATE_ONLY','LAYOUT_ESTIMATED','DRAWING_BASED','FIELD_VERIFIED','AS_BUILT_CONFIRMED']);
export const UTILITY_ROUTING_TEMPLATES=Object.freeze([
 COMPRESSED_AIR_ROUTING_TEMPLATE,AHU_PIPE_ROUTING_TEMPLATE,AHU_DUCT_ROUTING_TEMPLATE
]);

const clonePoint=p=>[Number(p?.[0]||0),Number(p?.[1]||0),Number(p?.[2]||0)];
export function materializeRoutingSystem(template,override={}){
 const nodePatch=override.nodes||{},segmentPatch=override.segments||{};
 const nodes=template.nodes.map(n=>Object.freeze({...n,...(nodePatch[n.id]||{}),p:Object.freeze(clonePoint((nodePatch[n.id]||{}).p||n.p))}));
 const segments=template.segments.map(s=>Object.freeze({...s,...(segmentPatch[s.id]||{})}));
 const requestedActual=override.engineeringBoundary?.actualRouteVerified===true;
 const actualGate=requestedActual&&override.complete===true&&override.coordinateSpace==='FACTORY_WORLD_METRES';
 const engineeringBoundary=Object.freeze({...template.engineeringBoundary,...(override.engineeringBoundary||{}),actualRouteVerified:actualGate});
 const validation=Object.freeze({requestedActual,actualGate,complete:override.complete===true,coordinateSpace:override.coordinateSpace||'TEMPLATE_LOCAL',requiresCompleteWorldCoordinates:true});
 return Object.freeze({...template,...override,previewOrigin:Object.freeze(clonePoint(override.previewOrigin||template.previewOrigin)),engineeringBoundary,overrideValidation:validation,nodes:Object.freeze(nodes),segments:Object.freeze(segments),equipmentAnchors:Object.freeze(override.equipmentAnchors||template.equipmentAnchors)});
}
export function routingPathPoints(system,segmentIds=null){
 const ids=segmentIds?new Set(segmentIds):null,map=new Map(system.nodes.map(n=>[n.id,n])),out=[];
 for(const seg of system.segments){if(ids&&!ids.has(seg.id))continue;const a=map.get(seg.from),b=map.get(seg.to);if(!a||!b)continue;out.push(Object.freeze({segmentId:seg.id,kind:seg.kind,from:Object.freeze(point(system,a).toArray()),to:Object.freeze(point(system,b).toArray())}));}
 return Object.freeze(out);
}

const palette=Object.freeze({
 COMPRESSED_AIR:0x3c84a8,CHWS_MAIN:0x4ca8c8,CHWS_BRANCH:0x61b6d1,CHWR_MAIN:0x2c7088,CHWR_BRANCH:0x3b8297,
 CONDENSATE:0x77898e,REFRIGERANT_LIQUID:0x6b8fc7,REFRIGERANT_SUCTION:0x7a659f,
 SUPPLY:0xb6cbd2,SUPPLY_BRANCH:0xc6d7dc,RETURN:0x697b82,RETURN_BRANCH:0x7b8c91,OUTDOOR_AIR:0x7ca98c
});
const systemColor=system=>system.system==='COMPRESSED_AIR'?palette.COMPRESSED_AIR:system.system==='AHU_DUCTING'?palette.SUPPLY:palette.CHWS_MAIN;

function colorFor(system,segment){
 if(system.system==='COMPRESSED_AIR')return palette.COMPRESSED_AIR;
 return palette[segment.kind]||systemColor(system);
}
function material(color,opacity=1){
 return new T.MeshStandardMaterial({color,roughness:.58,metalness:.12,transparent:opacity<1,opacity,depthWrite:opacity>=1});
}
function point(system,node){const o=system.previewOrigin;return new T.Vector3(o[0]+node.p[0],o[1]+node.p[1],o[2]+node.p[2]);}
function pipeBetween(a,b,radius,color){
 const d=new T.Vector3().subVectors(b,a),len=d.length();if(len<1e-6)return null;
 const mesh=new T.Mesh(new T.CylinderGeometry(radius,radius,len,12),material(color));
 mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
}
function ductBetween(a,b,width,height,color){
 const d=new T.Vector3().subVectors(b,a),len=d.length();if(len<1e-6)return null;
 const mesh=new T.Mesh(new T.BoxGeometry(width,height,len),material(color,.88));mesh.position.copy(a).add(b).multiplyScalar(.5);
 mesh.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),d.normalize());mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
}
function flowArrow(a,b,color){
 const d=new T.Vector3().subVectors(b,a);if(d.length()<1e-6)return null;const dir=d.normalize(),g=new T.Group();
 const cone=new T.Mesh(new T.ConeGeometry(.075,.26,10),material(color));cone.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir);g.add(cone);g.position.copy(a).lerp(b,.57);return g;
}
function nodeVisual(node,color){
 let mesh;
 if(node.kind==='DIFFUSER')mesh=new T.Mesh(new T.BoxGeometry(.72,.055,.72),material(color,.82));
 else if(node.kind==='RETURN_GRILLE'||node.kind==='OUTDOOR_LOUVER')mesh=new T.Mesh(new T.BoxGeometry(.68,.46,.055),material(color,.82));
 else if(node.kind==='AIR_RECEIVER')mesh=new T.Mesh(new T.CylinderGeometry(.18,.18,.60,16),material(0x82969b,.70));
 else if(node.kind==='DRYER')mesh=new T.Mesh(new T.BoxGeometry(.46,.62,.42),material(0x7f9fa8,.55));
 else if(/VALVE|DAMPER|TEE|TRANSITION|TRAP|CLEANOUT/.test(node.kind))mesh=new T.Mesh(new T.OctahedronGeometry(.12),material(color));
 else mesh=new T.Mesh(new T.SphereGeometry(.075,10,8),material(color));
 mesh.userData={utilityRoutingNode:true,nodeId:node.id,kind:node.kind,status:node.status};return mesh;
}
function label(text,pos,parent,color='#1e4052'){
 if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=640;c.height=82;const ctx=c.getContext('2d');if(!ctx)return null;
 ctx.fillStyle='rgba(247,251,252,.94)';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=color;ctx.font='700 26px system-ui';ctx.textAlign='center';ctx.fillText(text,320,50,610);
 const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthTest:false}));
 sprite.position.copy(pos);sprite.scale.set(8.8,1.13,1);parent.add(sprite);return sprite;
}
function renderSystem(system,parent,anchorLayer){
 const group=new T.Group();group.name=system.id;group.userData={utilityRouting:true,system:system.system,status:system.status,schemaVersion:system.schemaVersion,engineeringBoundary:system.engineeringBoundary};parent.add(group);
 const map=new Map(system.nodes.map(n=>[n.id,n])),color=systemColor(system);
 for(const seg of system.segments){
  const from=map.get(seg.from),to=map.get(seg.to);if(!from||!to)continue;const a=point(system,from),b=point(system,to),c=colorFor(system,seg);
  const mesh=seg.shape==='duct'?ductBetween(a,b,seg.width||.50,seg.height||.35,c):pipeBetween(a,b,seg.radius||Math.max(.018,(seg.diameterMm||70)/2000),c);
  if(!mesh)continue;mesh.name=seg.id;mesh.userData={utilityRoutingSegment:true,routeSystem:system.system,segmentId:seg.id,kind:seg.kind,status:seg.status,from:seg.from,to:seg.to,actualRouteVerified:system.engineeringBoundary.actualRouteVerified===true};group.add(mesh);
  const arrow=flowArrow(a,b,c);if(arrow){arrow.name=seg.id+'-FLOW-REFERENCE';arrow.userData={flowDirectionReference:true,segmentId:seg.id,status:seg.status};group.add(arrow);}
 }
 for(const n of system.nodes){const v=nodeVisual(n,color);v.position.copy(point(system,n));v.name=n.id;group.add(v);}
 const title=label(system.system.replaceAll('_',' ')+' · TEMPLATE ONLY',new T.Vector3(system.previewOrigin[0]+5.3,5.35,system.previewOrigin[2]),group);
 if(title)title.userData={utilityRoutingLabel:true,status:'TEMPLATE_ONLY'};
 const anchorGroup=new T.Group();anchorGroup.name=system.id+' · FUTURE EQUIPMENT ANCHORS';anchorGroup.userData={equipmentAnchors:system.equipmentAnchors,status:'UNPLACED'};anchorLayer.add(anchorGroup);
 system.equipmentAnchors.forEach((anchor,i)=>{const marker=new T.Mesh(new T.SphereGeometry(.065,8,6),material(color,.72)),col=i%8,row=Math.floor(i/8);marker.position.set(system.previewOrigin[0]+.35+col*.28,.25+row*.24,system.previewOrigin[2]-5.0);marker.name=anchor.id;marker.userData={utilityEquipmentAnchor:true,...anchor};anchorGroup.add(marker);});
 return {id:system.id,system:system.system,status:system.status,nodeCount:system.nodes.length,segmentCount:system.segments.length,equipmentAnchorCount:system.equipmentAnchors.length,actualRouteVerified:system.engineeringBoundary.actualRouteVerified===true};
}

export function buildUtilityRoutingScaffold(layers,overrides={}){
 const anchorLayer=layers.utility_anchors;const summaries=[];
 for(const template of UTILITY_ROUTING_TEMPLATES){
  const system=materializeRoutingSystem(template,overrides[template.id]||{});
  const parent=layers[system.layerKey];if(parent&&anchorLayer)summaries.push(renderSystem(system,parent,anchorLayer));
 }
 if(anchorLayer)anchorLayer.userData={utilityRoutingAnchors:true,status:'UNPLACED_UNTIL_DRAWING_AVAILABLE',systems:summaries.map(s=>s.id)};
 const actualCount=summaries.filter(s=>s.actualRouteVerified).length,mode=actualCount===0?'TEMPLATE_ONLY':actualCount===summaries.length?'AS_BUILT_OR_DRAWING_APPLIED':'MIXED_TEMPLATE_AND_APPLIED';
 return Object.freeze({mode,schemaVersion:1,systems:Object.freeze(summaries.map(Object.freeze)),actualRoutingApplied:actualCount>0,appliedSystemCount:actualCount,overrideContract:Object.freeze({
  nodes:'{ [nodeId]: { p:[x,y,z], kind?, status? } }',segments:'{ [segmentId]: { width?, height?, diameterMm?, radius?, status? } }',
  coordinateSpace:'Use FACTORY_WORLD_METRES for applied routes: X = plant east/right, Y = elevation, Z = negative plan-Y.',verificationGate:'actualRouteVerified requires complete:true + coordinateSpace FACTORY_WORLD_METRES.',activation:'Pass per-system overrides into buildUtilityRoutingScaffold after routing drawing extraction.'
 })});
}
