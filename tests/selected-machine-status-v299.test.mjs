import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');

test('V299 status-data dialog derives truth from the selected machine, not stale active presentation state',()=>{
 assert.match(app,/const appState=getAppState\(\)\|\|\{\},selectedMachine=machineRecordForRoute\(appState\.selectedAsset\),placement=selectedMachine\?placementForMachine\(selectedMachine\.machineId\):null;/);
 assert.match(app,/const assetStatus=selectedMachine\?factoryMachineTruth\(selectedMachine,placement\):null;/);
 assert.doesNotMatch(app,/const assetStatus=selectedMachine\?assetTruth\(state\?\.asset,\{placement,sourceCount:TECHNICAL_SOURCES\.length\}\):null;/);
});

test('V299 selected-machine status keeps position, 3D basis, detail and confidence tied to the same truth object',()=>{
 for(const field of ['position','source3D','detail3D','dataConfidence'])assert.match(app,new RegExp("assetStatus\\?\\."+field));
});
