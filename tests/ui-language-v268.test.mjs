import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const shell=read('../frontend/src/app-shell-v79.js');
const app=read('../frontend/src/app.js');
const display=read('../frontend/src/display-language.js');
const state=read('../frontend/src/state/app-state.js');
const sw=read('../frontend/sw.js');

test('V268 localizes simulation-stage presentation without changing raw stage identity',()=>{
 assert.match(display,/export function readableSimulationStage\(value\)/);
 for(const [raw,label] of [
  ['Unwind / Web Tension','Pelepasan gulungan dan tension web'],
  ['Gripper-chain delivery','Delivery dengan gripper chain'],
  ['Pile separation','Pemisahan tumpukan'],
  ['Front and side register','Register depan dan samping']
 ])assert.ok(display.includes("'"+raw+"':'"+label+"'"),raw);
 assert.match(app,/stage\.textContent=readableSimulationStage\(simulation\.stage\|\|'Siap'\)/);
 assert.match(shell,/stage=readableSimulationStage\(sim\.stage\|\|'Siap'\)/);
 assert.match(app,/data-sim-stage="\$\{esc\(stage\)\}"/);
 assert.match(app,/stage===s\.stage\?'active':''/);
 assert.match(app,/esc\(readableSimulationStage\(stage\)\)/);
});

test('V268 localizes stage lists across dedicated and universal simulations',()=>{
 for(const source of [
  'APM2_PROCESS_STEPS.map','APM2_SIMULATION_STAGES.map','SHEETING_PROCESS_STEPS.map',
  'SHEETING_SIMULATION_STAGES.map','genericStages.map','INK_SIMULATION_SEQUENCE.map',
  'PRINTING_SIMULATION_STAGES.map'
 ])assert.ok(app.includes(source),source);
 assert.ok((app.match(/readableSimulationStage\(/g)||[]).length>=10);
});

test('V268 makes the mobile explode action understandable',()=>{
 assert.match(shell,/<b>Urai komponen<\/b><small>Pisahkan tampilan bagian mesin<\/small>/);
 assert.doesNotMatch(shell,/<b>Urai<\/b><small>Komponen mesin<\/small>/);
});

test('V268 rotates only internal build and cache identity while public release contract remains stable',()=>{
 assert.match(state,/APP_BUILD='2026\.09\.30-268'/);
 assert.match(sw,/factory-digital-twin-v268-simulation-language-20260930/);
 assert.match(sw,/const RELEASE='222'/);
});
