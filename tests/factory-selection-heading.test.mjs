import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const app=readFileSync('frontend/src/app.js','utf8');
const body=app.split('function syncFactoryAssetHeading(machine,placement){')[1].split('\n}\n')[0];
test('factory inspector heading and evidence follow each selected machine',()=>{
 const elements=new Map(['.asset-heading h2','.asset-heading p','#evidence-summary','#evidence-detail'].map(id=>[id,{}]));
 const context={$:id=>elements.get(id),pair:(k,v)=>`${k}:${v};`,positionVerification:p=>p?.verified?'DWG-VERIFIED':'UNKNOWN',readableStatus:v=>v==='DWG-VERIFIED'?'Terverifikasi dari DWG':'Belum diketahui'};
 for(const machine of [{machineId:'a',name:'OFFSET 5',sapCode:'OFU-1',model:'CD102',source:'USER_CONFIRMED'},{machineId:'b',name:'AHU',area:'UTILITAS',source:'Daftar mesin'}]){
  vm.runInNewContext(`(function(machine,placement){${body}})(machine,placement)`,{...context,machine,placement:{verified:machine.machineId==='a'}});
  assert.equal(elements.get('.asset-heading h2').textContent,machine.name);
  assert.equal(elements.get('.asset-heading p').textContent,machine.machineId==='a'?'OFU-1 · CD102':'UTILITAS');
  const evidence=elements.get('#evidence-detail').innerHTML;
  assert.ok(evidence.includes(`Identitas mesin atau peralatan:${machine.machineId}`));
  assert.ok(evidence.includes(machine.machineId==='a'?'Konfirmasi pengguna':'Daftar mesin'));
  assert.ok(!elements.get('#evidence-summary').textContent.includes('Memeriksa'));
 }
});
test('factory breadcrumb uses scene context even without a WebGL engine',()=>{
 const fn=app.split('function renderContextBreadcrumb(){')[1].split('\nfunction taxonomyAtLevel')[0];
 let html='';const host={set innerHTML(v){html=v},querySelector:()=>null,querySelectorAll:()=>[]};
 vm.runInNewContext(`(function(){${fn})()`,{$:id=>id==='#context-breadcrumb'?host:null,getAppState:()=>({sceneMode:'factory',selectedAsset:'a'}),engine:null,machineRecordForRoute:()=>({name:'OFFSET 5'}),esc:x=>x});
 assert.ok(html.includes('OFFSET 5'));assert.ok(html.includes('aria-current="page"'));
});
