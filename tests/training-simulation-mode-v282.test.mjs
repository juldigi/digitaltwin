import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const engine=readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const shell=readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');

test('V282 engine enforces training preset instead of relying on UI labels',()=>{
 assert.match(engine,/applyPrintingSimulationModePreset\(\)/);
 assert.match(engine,/const preset=simulationModePreset\(this\.simulationMode\.mode\)/);
 assert.match(engine,/if\(preset\.lockSpeed!==null\)this\.simulation\?\.setSpeed\(preset\.lockSpeed\)/);
 assert.match(engine,/if\(preset\.forcePathVisible\)this\.simulation\?\.setPathVisible\(true\)/);
 assert.match(engine,/setPrintingSimulationSpeed\(value\)\{const preset=simulationModePreset\(this\.simulationMode\.mode\);return this\.simulation\?\.setSpeed\(preset\.lockSpeed\?\?value\);\}/);
 assert.match(engine,/setPrintingSimulationPathVisible\(on\)\{const preset=simulationModePreset\(this\.simulationMode\.mode\);return this\.simulation\?\.setPathVisible\(preset\.forcePathVisible\?true:on\);\}/);
 assert.match(engine,/startPrintingSimulation\(\)\{this\.simulation\?\.start\(\);this\.simulationMode\.reset\(\);this\.applyPrintingSimulationModePreset\(\);return this\.simulation\?\.state\?\.\(\);\}/);
 assert.match(engine,/this\.simulation=nextSimulation;this\.applyPrintingSimulationModePreset\(\);/);
});

test('V282 detail simulation panel exposes three modes and explains training behavior',()=>{
 assert.match(app,/simulationModeOptions\(machineRecordForRoute\(MACHINE_KEY\)\)/);
 assert.match(app,/\['continuous','stages','training'\]\.includes\(simulation\.mode\)/);
 assert.match(app,/Mode Pelatihan mengunci kecepatan 0,5×, menampilkan jalur proses, dan berhenti otomatis setiap berganti tahap/);
 assert.match(app,/b\.disabled=simulation\.mode==='training'/);
 assert.match(app,/trainingPath\.disabled=simulation\.mode==='training'/);
 assert.match(app,/\['stages','training'\]\.includes\(simulation\.mode\)\?'Tahap berikutnya':'Lanjutkan'/);
});

test('V282 canonical transport uses machine-aware mode labels and locks training speed',()=>{
 assert.match(shell,/MACHINE_REGISTRY_BY_ID\.get\(state\.selectedAsset\)/);
 assert.match(shell,/simulationModeOptions\(machine\)/);
 assert.match(shell,/\['continuous','stages','training'\]\.includes\(sim\.mode\)/);
 assert.match(shell,/\['stages','training'\]\.includes\(mode\)\?'Tahap berikutnya':'Lanjutkan'/);
 assert.match(shell,/speedSelect\.disabled=mode==='training'/);
});
