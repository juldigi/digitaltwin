import test from 'node:test';
import assert from 'node:assert/strict';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';

function visibility(template){
 const result=new Map();
 template.root.traverse(node=>{if(node.isMesh)result.set(node,node.visible);});
 return result;
}
function assertVisibility(template,expected,label){
 for(const [node,visible] of expected)assert.equal(node.visible,visible,`${label}: ${node.userData.ownerId||node.name}`);
}

test('V336 all 41 cutaways survive quality changes and restore closed geometry',()=>{
 for(const asset of MACHINE_REGISTRY){
  const template=createPolishedMachineTemplate(asset.machineId);
  try{
   template.setExteriorOpen(false);template.setLow(false);
   const closed=visibility(template);
   template.setExteriorOpen(true);
   const open=visibility(template);
   template.setLow(true);template.setLow(false);
   assertVisibility(template,open,`${asset.machineId} open after quality round-trip`);
   template.setLow(true);template.setExteriorOpen(false);template.setLow(false);
   assertVisibility(template,closed,`${asset.machineId} closed after quality round-trip`);
   template.setLow(true);template.setExteriorOpen(true);
   const lowOpen=visibility(template);
   template.setExteriorOpen(false);template.setLow(false);
   template.setExteriorOpen(true);template.setLow(true);
   assertVisibility(template,lowOpen,`${asset.machineId} independent toggle order`);
   template.setExteriorOpen(false);template.setLow(false);
   assertVisibility(template,closed,`${asset.machineId} final closed restore`);
  }finally{template.dispose();}
 }
});
