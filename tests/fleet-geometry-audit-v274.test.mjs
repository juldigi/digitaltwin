import test from 'node:test';
import assert from 'node:assert/strict';
import {auditMachineFleet} from '../scripts/audit-machine-fleet.mjs';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {isDedicatedMachineKey} from '../frontend/src/machine-runtime.js';

test('V274 audits geometry, materials, LOD silhouette, cover motion and simulation transforms for all 41 assets',()=>{
 const report=auditMachineFleet();
 assert.equal(report.total,41);
 assert.equal(report.audited,41);
 assert.equal(report.machines.length,41);
 assert.equal(new Set(report.machines.map(row=>row.machineId)).size,41);
 assert.equal(report.failed,0,JSON.stringify(report.failures,null,2));
 assert.equal(report.passed,41);
});

test('V274 keeps fleet maturity explicit instead of pretending every 3D route is serial-specific',()=>{
 const dedicated=MACHINE_REGISTRY.filter(machine=>isDedicatedMachineKey(machine.machineId));
 const evidenceBounded=MACHINE_REGISTRY.filter(machine=>!isDedicatedMachineKey(machine.machineId));
 assert.equal(dedicated.length+evidenceBounded.length,41);
 assert.ok(dedicated.length>=20,'dedicated fleet unexpectedly regressed');
 assert.ok(evidenceBounded.length>0,'reference/evidence-bounded fleet must remain explicit until verified');
 for(const machine of evidenceBounded){
  assert.equal(machine.has3D,true);
  assert.ok(machine.source||machine.note, machine.machineId+' lacks evidence boundary');
 }
});
