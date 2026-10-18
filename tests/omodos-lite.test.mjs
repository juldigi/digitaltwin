import test from 'node:test';
import assert from 'node:assert/strict';
import {mapOmodosMachineStatus} from '../frontend/src/omodos-status-map.js';

test('maps an unambiguous SAP code to one OMODOS status',()=>{
  const machine={machineId:'BMJ-MCH-0003',sapCode:'OFU-1',name:'OFFSET UV INK - 5 MACHINE + INLINE INS'};
  const statuses=[{code:'OFU-1',name:'Offset UV Ink - 5 Machine + Inline Ins',statusKey:'perhatian',statusLabel:'Perhatian'}];
  assert.equal(mapOmodosMachineStatus(machine,statuses,[machine],'').statusKey,'perhatian');
});

test('disambiguates duplicate SAP codes by machine name',()=>{
  const first={machineId:'BMJ-MCH-0007',sapCode:'PLT-1',name:'PILE TURNER 01'};
  const second={machineId:'BMJ-MCH-0022',sapCode:'PLT-1',name:'PILE TURNER 2'};
  const twin=[first,second];
  const statuses=[
    {code:'PLT-1',name:'PILE TURNER 01',statusKey:'normal'},
    {code:'PLT-1',name:'PILE TURNER 2',statusKey:'kritikal'}
  ];
  assert.equal(mapOmodosMachineStatus(first,statuses,twin)?.statusKey,'normal');
  assert.equal(mapOmodosMachineStatus(second,statuses,twin)?.statusKey,'kritikal');
});

test('returns null for an ambiguous row rather than assigning a guessed status',()=>{
  const machine={machineId:'BMJ-MCH-0007',sapCode:'PLT-1',name:'PILE TURNER 01'};
  const statuses=[{code:'PLT-1',name:'Pile Turner',statusKey:'kritikal'}];
  assert.equal(mapOmodosMachineStatus(machine,statuses,[machine,{machineId:'BMJ-MCH-0022',sapCode:'PLT-1',name:'PILE TURNER 2'}]),null);
});

test('direct explicit DigitalTwin machine id wins when supplied',()=>{
  const machine={machineId:'BMJ-MCH-0003',sapCode:'OFU-1',name:'Offset 5'};
  const status={twinMachineId:'BMJ-MCH-0003',code:'OTHER',name:'Alias',statusKey:'normal'};
  assert.equal(mapOmodosMachineStatus(machine,[status],[machine])?.statusKey,'normal');
});
