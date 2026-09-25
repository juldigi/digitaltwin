import test from 'node:test';
import assert from 'node:assert/strict';
import {MACHINE_REGISTRY,MACHINE_REGISTRY_BY_ID} from '../frontend/src/data/machine-registry.js';
import {canOpenTechnical3D} from '../frontend/src/data/foundation-scope.js';
import {createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

test('selected registry assets resolve to their own models and processes',()=>{
  const cases=[
    ['BMJ-MCH-0003','offset5','Offset5CD102RealismTemplate','Offset5CD102RealismSimulation'],
    ['BMJ-MCH-0009','offset10','Offset10CX104SpecialRealismTemplate','Offset10CX104SpecialRealismSimulation'],
    ['BMJ-MCH-0002','sheeting','SheetingMachineTemplate','SheetingProcessSimulation'],
    ['BMJ-MCH-0010','apm2','APM2MachineTemplate','APM2ProcessSimulation'],
    ['BMJ-MCH-0001','BMJ-MCH-0001','Polar115MachineTemplate','Polar115ProcessSimulation'],
    ['BMJ-MCH-0005','BMJ-MCH-0005','Offset8CX104RealismTemplate','Offset8CX104RealismSimulation'],
    ['BMJ-MCH-0004','BMJ-MCH-0004','ReferenceMachineTemplate','ReferenceProcessSimulation']
  ];
  for(const [id,route,modelName,processName] of cases){
    assert.equal(canOpenTechnical3D(MACHINE_REGISTRY_BY_ID.get(id)),true,id);
    const model=createMachineTemplate(route);
    const process=createMachineSimulation(route,model.root,model);
    assert.equal(model.constructor.name,modelName,id);
    assert.equal(process.constructor.name,processName,id);
    process.dispose?.();model.dispose?.();
  }
  assert.equal(canOpenTechnical3D('BMJ-MCH-9999'),false);
});

test('every advertised registry model can be created without falling back to OFFSET 5',()=>{
  for(const machine of MACHINE_REGISTRY.filter(item=>item.has3D)){
    assert.equal(canOpenTechnical3D(machine),true,machine.machineId);
    const model=createMachineTemplate(machine.machineId);
    const process=createMachineSimulation(machine.machineId,model.root,model);
    assert.ok(model.root&&process,machine.machineId);
    if(machine.machineId!=='BMJ-MCH-0003')assert.notEqual(model.constructor.name,'OffsetMachineTemplate',machine.machineId);
    process.dispose?.();model.dispose?.();
  }
});
