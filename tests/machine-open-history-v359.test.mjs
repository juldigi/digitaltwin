import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
test('opening an already loaded machine commits its URL after the 3D control changes factory context',async()=>{
 const events=[];let current={sceneMode:'factory',viewMode:'2d'};
 const three={disabled:false,click(){events.push('mode');current={...current,viewMode:'3d',sceneMode:'factory'}}};
 const context=vm.createContext({machineSwitchEpoch:0,MACHINE_KEY:'offset5',ACTIVE_ROOT:'root',engine:{machineKey:'offset5',cancelMachineSwitch(){},isPrintingSimulationActive(){return false},fit(){}},document:{body:{classList:{remove(){}}}},$(selector){return selector==='#mode-3d'?three:selector==='#engine-status'?{}:null},resyncActiveMachineDescriptorFromEngine(){},canOpenTechnical3D(){return true},normalizeMachineKey(){return 'offset5'},currentSimulationState(){return {active:false}},machineRecordForRoute(){return {machineId:'OFU-1',name:'Offset 5'}},pushContextHistory(){events.push('push')},closeModal(){},resetMachineInspectionContext(){},setView(){},showPanel(){},renderPanel(){},emitDomainState(next){current={...current,...next};events.push('commit')},pushMachineContextHistory(node,options){events.push('url');assert.equal(current.sceneMode,'machine');assert.equal(current.viewMode,'3d');assert.equal(node,null);assert.equal(options.replace,true)}});
 vm.runInContext(app.slice(app.indexOf('async function switchActiveMachine('),app.indexOf("window.addEventListener('bmj:simulateselectedmachine'")),context);
 assert.equal(await vm.runInContext('switchActiveMachine("offset5")',context),true);
 assert.deepEqual(events,['push','mode','commit','url']);
});
