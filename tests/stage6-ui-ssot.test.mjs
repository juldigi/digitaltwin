import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const app=read('../frontend/src/app.js');
const shell=read('../frontend/src/app-shell-v79.js');
const state=read('../frontend/src/state/app-state.js');
const html=read('../frontend/index.html');
const experience=read('../frontend/src/experience-v37.js');

test('Stage 6 canonical state owns all serializable UI context',()=>{
 assert.match(state,/bootState:\{phase:'booting',message:null\}/);
 assert.match(state,/selectedAsset:null/);
 assert.match(state,/selectedNode:null/);
 assert.match(state,/inspectionMode:\{explode:false,explodeLevel:0,isolate:false,interior:false,interiorFocus:null\}/);
 assert.match(state,/simulationState:\{available:false,blocked:false[\s\S]*running:false/);
 assert.match(state,/referenceState:\{filter:'all'\}/);
 assert.match(state,/inspectorState:\{open:false,tab:'overview'\}/);
 assert.match(state,/export function setDomainState/);
 assert.match(state,/export function setBoot/);
});

test('Stage 6 app writes canonical state directly instead of relaying domain-state events',()=>{
 assert.match(app,/function emitDomainState\(detail\)\{return setDomainState\(detail\);\}/);
 assert.doesNotMatch(app,/new CustomEvent\('bmj:domainstate'/);
 assert.doesNotMatch(shell,/bmj:domainstate/);
 assert.doesNotMatch(app,/\bactiveTab\b/);
 assert.doesNotMatch(app,/selectedTaxonomyId/);
 assert.doesNotMatch(app,/referenceCategoryFilter/);
 assert.doesNotMatch(app,/\bexteriorMode\b/);
 assert.doesNotMatch(app,/runtimeSimulationSnapshot/);
 assert.doesNotMatch(app,/exteriorFocusKey/);
});

test('Stage 6 active machine evidence and identity come from registry context',()=>{
 assert.match(app,/placementForMachine\?\.\(activeMachineAssetId\(\)\)/);
 assert.doesNotMatch(app,/placementForMachine\?\.\('BMJ-MCH-0003'\)\|\|null,truth=assetTruth/);
 assert.match(app,/const registry=machineRecordForRoute\(MACHINE_KEY\)/);
 assert.match(app,/asset_id:registry\.machineId/);
 assert.doesNotMatch(app,/MACHINE-OFFSET10/);
 assert.doesNotMatch(app,/MACHINE-APM2/);
 assert.match(app,/\[FOUNDATION_SCOPE\.referenceMachineId\]:'offset5'/);
 assert.match(app,/function machineRoute\(machine\)\{return MACHINE_ROUTE_BY_ID\[machine\?\.machineId\]\|\|machine\?\.machineId\|\|null;\}/);
});

test('Stage 6 deep-link state has one parser and one serializer',()=>{
 assert.match(state,/export function readUrlState/);
 assert.match(state,/export function buildContextUrl/);
 assert.match(app,/const restored=readUrlState\(\)/);
 assert.match(app,/buildContextUrl\(snapshot\)/);
 assert.doesNotMatch(app,/new URLSearchParams\(location\.search\)/);
});

test('Stage 6 simulation transport renders canonical state and sends commands only',()=>{
 const sync=shell.slice(shell.indexOf('function syncSimulationTransport'),shell.indexOf('const INSPECTOR_TAB_SECTION'));
 assert.match(sync,/state\.simulationState\|\|\{\}/);
 assert.match(sync,/sim\.progress/);
 assert.match(sync,/sim\.running/);
 assert.doesNotMatch(sync,/#sim-status/);
 assert.doesNotMatch(sync,/#sim-stage/);
 assert.doesNotMatch(sync,/setSimulation\(/);
 assert.match(shell,/bmj:simulationcommand/);
 assert.match(app,/window\.addEventListener\('bmj:simulationcommand'/);
 assert.match(app,/setAppSimulation\(normalized\)/);
});

test('Stage 6 boot lifecycle has one owner',()=>{
 assert.match(shell,/syncSplashFromState=state=>/);
 assert.match(shell,/const BOOT_TIMEOUT_MS=12500/);
 assert.doesNotMatch(shell,/bmj:appready/);
 assert.doesNotMatch(html,/splash-recovery/);
});

test('Stage 6 inspection controls derive from canonical state',()=>{
 assert.match(app,/const activeTaxonomyId=\(\)=>/);
 assert.match(app,/const explodeLevel=\(\)=>/);
 assert.match(app,/const setExplodeLevel=/);
 assert.match(app,/const isInteriorOpen=\(\)=>/);
 assert.match(app,/const interiorFocus=\(\)=>/);
 assert.match(app,/setDomainState\(\{inspectionMode:\{interior:true\}\}\)/);
 assert.match(app,/setDomainState\(\{inspectionMode:\{interior:false\}\}\)/);
 assert.match(app,/engine\?\.template\.explode\(explodeLevel\(\),selectedPart\)/);
});

test('Stage 6 app preferences are product-scoped with one-time legacy migration',()=>{
 assert.match(state,/PREF_KEYS=Object\.freeze\(\{theme:'bmj-digitaltwin-theme',lowDetail:'bmj-digitaltwin-low'\}\)/);
 assert.match(state,/LEGACY_PREF_KEYS=Object\.freeze\(\{theme:'offset5-theme',lowDetail:'offset5-low'\}\)/);
 assert.match(state,/export function setPreference/);
 assert.match(experience,/setPreference\('theme'/);
});

test('Stage 6 generic asset header does not present machine family as manufacturer',()=>{
 assert.match(app,/IS_GENERIC\?\(state\?\.asset\?\.manufacturer\|\|'Pabrikan belum terverifikasi'\)/);
 assert.doesNotMatch(app,/IS_GENERIC\?GENERIC_CONFIG\.label:'Belum memilih mesin'/);
 assert.doesNotMatch(app,/stage:MACHINE_KEY\?'Feeder':null/);
 assert.match(app,/simulation\.stage\|\|'Siap'/);
});
