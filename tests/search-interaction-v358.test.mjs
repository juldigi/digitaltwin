import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../frontend/src/app-shell-v79.js',import.meta.url),'utf8');
function harness(){
 const host={innerHTML:'old result',attributes:{},setAttribute(k,v){this.attributes[k]=v}};
 const input={value:'new',removeAttribute(){}};
 const header={value:'old'};
 const context=vm.createContext({String,Boolean,clearTimeout(){},setTimeout(){return 1},ensureSearchPalette(){return {}},q(selector){return selector==='#global-search'?header:selector==='#universal-search-input'?input:host},getState(){return {overlay:'search'}}});
 vm.runInContext('let searchResults=[{title:"old"}],searchActiveIndex=0,searchTimer=1;'+source.slice(source.indexOf('function requestUniversalSearch('),source.indexOf('function updateSearchActive(')),context);
 return {context,host,input,header};
}
test('changing search prevents Enter from selecting an earlier query while debounce is pending',()=>{
 const h=harness();vm.runInContext('requestUniversalSearch("new")',h.context);
 assert.equal(vm.runInContext('searchResults.length',h.context),0);
 assert.equal(vm.runInContext('searchActiveIndex',h.context),-1);
 assert.equal(h.header.value,'new');assert.equal(h.host.attributes['aria-busy'],'true');
});
test('late search responses do not replace results for the current query',()=>{
 const h=harness();vm.runInContext('requestUniversalSearch("new");renderSearchResults({query:"old",results:[{title:"old"}]})',h.context);
 assert.equal(vm.runInContext('searchResults.length',h.context),0);
 assert.match(h.host.innerHTML,/Mencari/);
});
test('clearing the query removes earlier options and busy state immediately',()=>{
 const h=harness();vm.runInContext('requestUniversalSearch("")',h.context);
 assert.equal(vm.runInContext('searchResults.length',h.context),0);
 assert.equal(h.host.attributes['aria-busy'],'false');assert.match(h.host.innerHTML,/Ketik nama/);
});
test('factory summary cannot select technical tabs until machine context is open',()=>{
 const tabs=['overview','structure','simulation','sources'].map(key=>({dataset:{tab:key},attrs:{},getAttribute(k){return this.attrs[k]},setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]}}));
 const context=vm.createContext({qa(){return tabs}});
 vm.runInContext(source.slice(source.indexOf('function syncInspectorTabs('),source.indexOf('const inspectorTablist=')),context);
 vm.runInContext('syncInspectorTabs({sceneMode:"factory",inspectorState:{tab:"structure"}})',context);
 assert.equal(tabs[0].attrs['aria-selected'],'true');assert.ok(tabs.slice(1).every(tab=>tab.disabled&&tab.tabIndex===-1));
 vm.runInContext('syncInspectorTabs({sceneMode:"machine",inspectorState:{tab:"structure"}})',context);
 assert.ok(tabs.every(tab=>!tab.disabled));assert.equal(tabs[1].attrs['aria-selected'],'true');
});
test('changing a factory asset resets a stale structure tab before rendering the factory view',()=>{
 const app=readFileSync(new URL('../frontend/src/app.js',import.meta.url),'utf8');
 let tab='structure',opened=false;
 const context=vm.createContext({engine:null,setDomainState(next){tab=next.inspectorState.tab},setView(){assert.equal(tab,'overview')},foundationAssetPolicy(){return {canOpenTechnical3D:true}},placementForMachine(){},$(){return {}},emitDomainState(){},machineDetailDialog(){opened=true}});
 vm.runInContext(app.slice(app.indexOf('function selectFactoryAssetContext('),app.indexOf('function focusFoundationPlaceholder(')),context);
 assert.equal(vm.runInContext('selectFactoryAssetContext({machineId:"new",name:"New"},{openDialog:true,focus:false})',context),true);
 assert.ok(opened);
});
