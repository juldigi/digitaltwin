import test from 'node:test';
import assert from 'node:assert/strict';
import {auditFleetCameraFraming} from '../scripts/audit-machine-camera-framing.mjs';

test('V305 all 41 machines fit desktop, portrait and operator camera frames without clipping or invalid transforms',()=>{
 const report=auditFleetCameraFraming();
 assert.equal(report.total,41);
 assert.equal(report.failed,0,JSON.stringify(report.failures,null,2));
 assert.equal(report.passed,41);
 assert.ok(report.machines.every(row=>row.desktop.maxX<=1.001&&row.desktop.maxY<=1.001));
 assert.ok(report.machines.every(row=>row.portrait.maxX<=1.001&&row.portrait.maxY<=1.001));
 assert.ok(report.machines.every(row=>row.operator.maxX<=1.001&&row.operator.maxY<=1.001));
});
