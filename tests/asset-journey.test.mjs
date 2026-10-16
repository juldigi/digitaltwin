import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
const source=app.slice(app.indexOf('function assetDialog('),app.indexOf('function openSceneEditor('));
function chooser(intent='browse'){
 const elements=new Map();
 const $=id=>{if(!elements.has(id))elements.set(id,{value:'',innerHTML:'',textContent:'',focus(){this.focused=true;}});return elements.get(id);};
 const categories=['all','machine','equipment','component'].map(category=>({dataset:{assetCategory:category},classList:{toggle(){}},setAttribute(){}}));
 const registry=[{machineId:'press',name:'Offset',area:'PRINTING'},{machineId:'ahu',name:'AHU 1',area:'UTILITY'}];
 const context={$, $$:selector=>selector==='[data-asset-category]'?categories:[],on:(id,handler)=>{$(id).onclick=handler;},MACHINE_REGISTRY:registry,MACHINE_REGISTRY_BY_ID:new Map(registry.map(m=>[m.machineId,m])),MACHINE_REGISTRY_STATS:{modeled3D:2},getAppState:()=>({}),machineRecordForRoute:()=>null,esc:String,modal(){},canOpenTechnical3D:()=>true,foundationAssetPolicy:()=>({}),placementForMachine:()=>null,foundationAssetMatches:(m,q)=>m.name.toLowerCase().includes(q.toLowerCase())};
 context.intent=intent;vm.runInNewContext(source+';assetDialog("",{intent});',context);
 return {$,categories};
}
test('default catalogue includes production machines and utilities; searching AHU does not silently hide it',()=>{
 const {$}=chooser();assert.match($('#asset-results').innerHTML,/data-machine-id="press"/);assert.match($('#asset-results').innerHTML,/data-machine-id="ahu"/);
 $('#asset-search').value='AHU';$('#asset-search').oninput();assert.match($('#asset-results').innerHTML,/data-machine-id="ahu"/);assert.doesNotMatch($('#asset-results').innerHTML,/data-machine-id="press"/);
});
test('empty-state recovery clears query, area and category together',()=>{
 const {$,categories}=chooser();categories.find(b=>b.dataset.assetCategory==='machine').onclick();$('#asset-area').value='PRINTING';$('#asset-search').value='missing';$('#asset-search').oninput();assert.match($('#asset-results').innerHTML,/reset-asset-filters/);
 $('#reset-asset-filters').onclick();assert.equal($('#asset-search').value,'');assert.equal($('#asset-area').value,'');assert.match($('#asset-results').innerHTML,/data-machine-id="ahu"/);assert.equal($('#asset-search').focused,true);
});

test('simulation chooser labels the actual next action instead of promising only a detail view',()=>{
 const {$}=chooser('simulation');assert.match($('#asset-results').innerHTML,/Buka simulasi/);assert.doesNotMatch($('#asset-results').innerHTML,/Lihat detail/);
});
