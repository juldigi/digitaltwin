import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {syncFactoryLayerVisibility} from '../frontend/src/factory-layer-visibility.js';
import {buildLowDetailFactory} from '../frontend/src/engine.js';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';

test('scene rebuild applies all saved layer choices, including the outdoor area',()=>{
 const makeEngine=()=>{
  const layers=Object.fromEntries(['roof','building','ipal','landscape','labels','floor','furniture','doors','windows','air_curtain','utility_ahu_ducting'].map(key=>[key,{visible:false}]));
  return {actualFactory:{layers},setFactoryLayer(key,on){layers[key].visible=on;}};
 };
 const preferences={roof:true,building:false,ipal:true,landscape:true,labels:false,floor:true,furniture:false,doors:true,windows:false,airCurtain:true,ducting:false};
 for(const engine of [makeEngine(),makeEngine()]){
  syncFactoryLayerVisibility(engine,preferences);
  assert.equal(engine.actualFactory.layers.roof.visible,true);
  assert.equal(engine.actualFactory.layers.building.visible,false);
  assert.equal(engine.actualFactory.layers.ipal.visible,true);
  assert.equal(engine.actualFactory.layers.landscape.visible,true);
  assert.equal(engine.actualFactory.layers.labels.visible,false);
  assert.equal(engine.actualFactory.layers.utility_ahu_ducting.visible,false);
  for(const [layer,expected] of [['floor',true],['furniture',false],['doors',true],['windows',false],['air_curtain',true]])assert.equal(engine.actualFactory.layers[layer].visible,expected);
  assert.equal(engine.labels,false);
 }
});

test('factory panel exposes the outdoor area and every scene load restores preferences',()=>{
 const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
 assert.match(app,/\['landscape','Taman, jalan & gerbang'\]/);
 assert.match(app,/function loadVisibleFactoryLayout\(layout\)/);
 assert.doesNotMatch(app,/engine\?\.loadLayout\(/);
});

test('memory-limited factory still shows the approach road and gate when outdoors is enabled',async()=>{
 const layout=await loadActualPlantLayout();
 const built=buildLowDetailFactory(layout,[]);
 const roads=[],gates=[];
 built.layers.landscape.traverse(object=>{
  if(object.userData?.semantic==='MOBILE_APPROACH_ROAD_REFERENCE')roads.push(object);
  if(object.userData?.semantic==='MOBILE_ENTRANCE_GATE_REFERENCE')gates.push(object);
 });
 assert.equal(roads.length,2);
 assert.equal(gates.length,1);
 syncFactoryLayerVisibility({actualFactory:built,setFactoryLayer(name,on){built.layers[name].visible=on;}},{landscape:true});
 assert.equal(built.layers.landscape.visible,true);
 assert.ok([...roads,...gates].every(object=>object.userData.accuracy==='LANDSCAPE_REFERENCE_NOT_AS_BUILT'));
});


test('V258 hiding building structure does not hide the IPAL process yard',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),ipal=built.root.getObjectByName('IPAL_OPEN_AIR_WATER_TREATMENT');
 assert.ok(built.layers.ipal,'dedicated IPAL layer must exist');
 assert.ok(ipal,'IPAL process-yard root must exist');
 assert.equal(ipal.parent,built.layers.ipal,'IPAL must not remain parented to the building structure layer');
 const engine={actualFactory:built,setFactoryLayer(name,on){built.layers[name].visible=on;}};
 syncFactoryLayerVisibility(engine,{building:false,ipal:true});
 assert.equal(built.layers.building.visible,false);
 assert.equal(built.layers.ipal.visible,true);
 const visibleThroughParents=object=>{for(let node=object;node;node=node.parent)if(node.visible===false)return false;return true;};
 assert.equal(visibleThroughParents(ipal),true,'IPAL must remain visible through the complete parent chain');
 assert.equal(ipal.userData.independentFromBuildingStructure,true);
});


test('V259 IPAL canopy roof and steel stay owned by IPAL when building and global roof are hidden',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),ipal=built.root.getObjectByName('IPAL_OPEN_AIR_WATER_TREATMENT');
 assert.ok(ipal?.userData.ownsCanopyStructure);
 assert.ok(ipal?.userData.ownsCanopyRoof);
 const canopyPattern=/^IPAL_PHOTO_(?:CANOPY_COLUMN|CURVED_CANOPY_RAFTER|CORRUGATED_CANOPY_ROOF|TRANSLUCENT_ROOF_PANEL|ROOF_PURLIN|ROOF_GUTTER|CANOPY_CORRUGATION_RIBS)$/;
 const canopy=[],leaked=[];
 ipal.traverse(object=>{if(canopyPattern.test(String(object.userData?.semantic||'')))canopy.push(object);});
 built.layers.roof.traverse(object=>{if(canopyPattern.test(String(object.userData?.semantic||'')))leaked.push(object);});
 assert.ok(canopy.length>=20,'photo-derived IPAL canopy must remain present');
 assert.equal(leaked.length,0,'IPAL canopy must not leak into the global factory roof layer');
 const engine={actualFactory:built,setFactoryLayer(name,on){built.layers[name].visible=on;}};
 syncFactoryLayerVisibility(engine,{building:false,roof:false,ipal:true});
 const visibleThroughParents=object=>{for(let node=object;node;node=node.parent)if(node.visible===false)return false;return true;};
 assert.ok(canopy.every(visibleThroughParents),'hiding main building/roof must not open the IPAL canopy');
});
