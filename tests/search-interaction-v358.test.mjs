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
