import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {COMPRESSED_AIR_ROUTING_TEMPLATE} from '../frontend/src/data/compressed-air-routes.js';
import {AHU_PIPE_ROUTING_TEMPLATE} from '../frontend/src/data/ahu-pipe-routes.js';
import {AHU_DUCT_ROUTING_TEMPLATE} from '../frontend/src/data/ahu-duct-routes.js';
import {UTILITY_ROUTING_TEMPLATES,materializeRoutingSystem,routingPathPoints,buildUtilityRoutingScaffold} from '../frontend/src/utility-routing.js';

const templates=[COMPRESSED_AIR_ROUTING_TEMPLATE,AHU_PIPE_ROUTING_TEMPLATE,AHU_DUCT_ROUTING_TEMPLATE];

test('V135 utility route schemas are node-segment based, unique and template-only',()=>{
 assert.equal(UTILITY_ROUTING_TEMPLATES.length,3);
 for(const system of templates){
  assert.equal(system.status,'TEMPLATE_ONLY',system.id);
  assert.equal(system.engineeringBoundary.actualRouteVerified,false,system.id);
  const nodeIds=new Set(system.nodes.map(n=>n.id)),segIds=new Set(system.segments.map(s=>s.id));
  assert.equal(nodeIds.size,system.nodes.length,system.id+' duplicate node id');
  assert.equal(segIds.size,system.segments.length,system.id+' duplicate segment id');
  for(const seg of system.segments){
   assert.ok(nodeIds.has(seg.from),system.id+' missing from node '+seg.from);
   assert.ok(nodeIds.has(seg.to),system.id+' missing to node '+seg.to);
   assert.equal(seg.status,'TEMPLATE_ONLY',seg.id);
  }
 }
 assert.equal(COMPRESSED_AIR_ROUTING_TEMPLATE.equipmentAnchors.length,7);
 assert.equal(AHU_PIPE_ROUTING_TEMPLATE.equipmentAnchors.length,20);
 assert.equal(AHU_DUCT_ROUTING_TEMPLATE.equipmentAnchors.length,24);
});

test('V135 utility route templates expose prepared compressor, AHU-pipe and AHU-duct component families',()=>{
 assert.ok(COMPRESSED_AIR_ROUTING_TEMPLATE.componentCatalog.includes('SWAN_NECK_TOP_TAKEOFF'));
 assert.ok(COMPRESSED_AIR_ROUTING_TEMPLATE.componentCatalog.includes('FUTURE_CAP'));
 assert.ok(AHU_PIPE_ROUTING_TEMPLATE.componentCatalog.includes('CONDENSATE_SLOPED_DRAIN'));
 assert.ok(AHU_PIPE_ROUTING_TEMPLATE.componentCatalog.includes('REFRIGERANT_SUCTION'));
 assert.ok(AHU_DUCT_ROUTING_TEMPLATE.componentCatalog.includes('TRANSITION'));
 assert.ok(AHU_DUCT_ROUTING_TEMPLATE.componentCatalog.includes('VOLUME_DAMPER'));
 assert.ok(AHU_DUCT_ROUTING_TEMPLATE.componentCatalog.includes('FIRE_DAMPER_OPTION'));
});

test('V135 routing override contract can accept future drawing coordinates without rebuilding schemas',()=>{
 const actual=materializeRoutingSystem(COMPRESSED_AIR_ROUTING_TEMPLATE,{
  status:'DRAWING_BASED',previewOrigin:[0,0,0],
  engineeringBoundary:{actualRouteVerified:true,actualPipeSizeVerified:true},
  nodes:{'CA-PKG-OUT':{p:[1,2,3],status:'DRAWING_BASED'}},
  segments:{'CA-S01':{diameterMm:80,status:'DRAWING_BASED'}}
 });
 assert.equal(actual.status,'DRAWING_BASED');
 assert.equal(actual.engineeringBoundary.actualRouteVerified,true);
 assert.equal(actual.engineeringBoundary.actualPipeSizeVerified,true);
 assert.equal(actual.engineeringBoundary.actualPressureVerified,false);
 assert.deepEqual(actual.nodes.find(n=>n.id==='CA-PKG-OUT').p,[1,2,3]);
 assert.equal(actual.segments.find(s=>s.id==='CA-S01').diameterMm,80);
 const path=routingPathPoints(actual,['CA-S01']);
 assert.equal(path.length,1);
 assert.deepEqual(path[0].from,[1,2,3]);
});

test('V135 factory routing renderer creates isolated utility layers and keeps template status explicit',()=>{
 const layers={};
 for(const key of ['utility_compressed_air','utility_ahu_piping','utility_ahu_ducting','utility_anchors'])layers[key]=new THREE.Group();
 const result=buildUtilityRoutingScaffold(layers);
 assert.equal(result.mode,'TEMPLATE_ONLY');
 assert.equal(result.actualRoutingApplied,false);
 assert.equal(result.systems.length,3);
 assert.ok(layers.utility_compressed_air.children.length>0);
 assert.ok(layers.utility_ahu_piping.children.length>0);
 assert.ok(layers.utility_ahu_ducting.children.length>0);
 assert.equal(layers.utility_anchors.children.length,3);
 for(const summary of result.systems){
  assert.equal(summary.actualRouteVerified,false,summary.system);
  assert.ok(summary.nodeCount>0&&summary.segmentCount>0,summary.system);
 }
 const caGroup=layers.utility_compressed_air.getObjectByName('BMJ-UTILITY-COMPRESSED-AIR-V1');
 const segment=caGroup.getObjectByName('CA-S01');
 assert.equal(segment.userData.status,'TEMPLATE_ONLY');
 assert.equal(segment.userData.actualRouteVerified,false);
});

test('V135 drawing override can promote one system while untouched systems remain templates',()=>{
 const layers={};
 for(const key of ['utility_compressed_air','utility_ahu_piping','utility_ahu_ducting','utility_anchors'])layers[key]=new THREE.Group();
 const result=buildUtilityRoutingScaffold(layers,{
  'BMJ-UTILITY-COMPRESSED-AIR-V1':{
   status:'DRAWING_BASED',
   engineeringBoundary:{actualRouteVerified:true},
   nodes:{'CA-PKG-OUT':{p:[2,1,0],status:'DRAWING_BASED'}}
  }
 });
 const ca=result.systems.find(s=>s.system==='COMPRESSED_AIR');
 const ahu=result.systems.find(s=>s.system==='AHU_PIPING');
 assert.equal(ca.actualRouteVerified,true);
 assert.equal(ahu.actualRouteVerified,false);
});
