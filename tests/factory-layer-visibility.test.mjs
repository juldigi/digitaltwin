import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {syncFactoryLayerVisibility} from '../frontend/src/factory-layer-visibility.js';
import {buildLowDetailFactory} from '../frontend/src/engine.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';

test('scene rebuild applies all saved layer choices, including the outdoor area',()=>{
 const makeEngine=()=>{
  const layers=Object.fromEntries(['roof','landscape','labels','utility_ahu_ducting'].map(key=>[key,{visible:false}]));
  return {actualFactory:{layers},setFactoryLayer(key,on){layers[key].visible=on;}};
 };
 const preferences={roof:true,landscape:true,labels:false,ducting:false};
 for(const engine of [makeEngine(),makeEngine()]){
  syncFactoryLayerVisibility(engine,preferences);
  assert.equal(engine.actualFactory.layers.roof.visible,true);
  assert.equal(engine.actualFactory.layers.landscape.visible,true);
  assert.equal(engine.actualFactory.layers.labels.visible,false);
  assert.equal(engine.actualFactory.layers.utility_ahu_ducting.visible,false);
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
