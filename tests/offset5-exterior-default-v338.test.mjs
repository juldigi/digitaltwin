import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';

test('V338 Offset 5 defaults to exterior and reveals interior only on request',()=>{
 const t=createPolishedMachineTemplate('offset5');
 try{
  const internals=t.meshes.filter(m=>m.userData.actualDiagramSource);
  assert.equal(internals.length,192);
  const check=on=>{
   assert.equal(t.exteriorOpen,on);
   assert.ok(internals.every(m=>m.visible===on));
   for(let i=0;i<8;i++){
    const green=t.findNode(`press-${i}-ink-fountain-roller-body`);
    assert.ok(green.children.some(m=>m.isMesh&&m.visible),'photo-grounded exterior green roller remains');
   }
  };
  check(false);
  for(const low of [true,false]){
   t.setLow(low);check(false);t.reset();check(false);
   t.setExteriorOpen(true);check(true);t.reset();check(true);
   t.setExteriorOpen(false);check(false);
  }
 }finally{t.dispose();}
});

test('V338 actual Offset 5 start handler preserves the chosen exterior mode',()=>{
 const app=readFileSync('frontend/src/app.js','utf8');
 const body=app.slice(app.indexOf('function startPrintingSimulation(){'),app.indexOf('function pausePrintingSimulation(){'));
 for(const interior of [false,true]){
  const t=createPolishedMachineTemplate('offset5'),noop=()=>{};
  try{
   t.setExteriorOpen(interior);let inkFlow=null;
   const engine={template:t,machine:t.root,simulation:{active:false},isPrintingSimulationActive:()=>false,
    getPrintingSimulationState:()=>({available:true}),setPrintingSimulationInkFlowVisible:on=>{inkFlow=on;},
    startPrintingSimulation:()=>({active:true}),fit:noop,clearPartLabels:noop};
   const context={engine,MACHINE_KEY:'offset5',simulationOwnsExterior:true,selectedPart:null,ACTIVE_ROOT:'root',
    isInteriorOpen:()=>interior,ensureMachineInspectionContext:()=>true,enableExteriorOpen(){throw Error('automatic cutaway forbidden');},
    updateSimulationPanel:noop,setActiveTaxonomyId:noop,setExplodeLevel:noop,renderPanel:noop,requestAnimationFrame:noop,toast:noop};
   vm.runInNewContext(`${body};startPrintingSimulation();`,context);
   assert.equal(t.exteriorOpen,interior);assert.equal(inkFlow,interior);assert.equal(context.simulationOwnsExterior,false);
  }finally{t.dispose();}
 }
});
