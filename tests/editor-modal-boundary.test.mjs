import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const app=readFileSync('frontend/src/app.js','utf8');
const shell=readFileSync('frontend/src/app-shell-v79.js','utf8');
const handler=app.split('const onEditorKeyDown=e=>{')[1].split('\n };')[0];

test('editor shortcuts do not escape a confirmation dialog',()=>{
 for(const key of ['Escape','z','ArrowLeft']){
  let closes=0,changes=0;
  const context={$:()=>({open:true}),editorBusy:false,keyboardMoveActive:false,
   panel:{querySelector:()=>({click:()=>closes++})},undoChange:()=>changes++,redoChange:()=>changes++};
  const event={key,ctrlKey:true,target:{tagName:'BUTTON'},preventDefault(){throw new Error('editor handled modal input')}};
  vm.runInNewContext(`(e=>{${handler}})(event)`,{...context,event});
  assert.equal(closes,0);assert.equal(changes,0);
 }
});

test('Escape closes only the foreground modal and cancels native dialog handling',()=>{
 const body=shell.split("document.addEventListener('keydown',event=>{")[1].split('\n});')[0];
 let closed=0,prevented=0,stopped=0;
 const event={key:'Escape',preventDefault:()=>prevented++,stopImmediatePropagation:()=>stopped++};
 vm.runInNewContext(`(event=>{${body}})(event)`,{event,getState:()=>({overlay:'modal'}),
  q:selector=>selector==='#modal'?{open:true}:{click:()=>closed++},closeOverlay:()=>{}});
 assert.equal(closed,1);assert.equal(prevented,1);assert.equal(stopped,1);
});

test('all baked factory chunks are available in the offline shell',()=>{
 const sw=readFileSync('frontend/sw.js','utf8');
 const cached=vm.runInNewContext(sw+'\nPRECACHE;', {self:{addEventListener(){}}});
 const manifest=readFileSync('frontend/src/data/factory-fleet-data.js','utf8');
 for(const [,file] of manifest.matchAll(/from '\.\/(factory-fleet-chunk-\d+\.js)'/g)){
  assert.ok(cached.includes('./src/data/'+file),file+' missing from offline cache');
 }
});

test('history restoration keeps the 2D fallback when 3D is unavailable',async()=>{
 const body=app.split('async function restoreHistoryContext(){')[1].split("\naddEventListener('popstate'")[0];
 for(const engine of [null,{renderFaulted:true}]){
  let context={selectedAsset:null,selectedNode:null,viewMode:'3d',cameraPreset:'iso',sceneMode:'factory'},final;
  const sandbox={engine,readUrlState:()=>({...context}),history:{state:null,replaceState:(_state,_title,next)=>{context=next}},
   buildContextUrl:next=>next,showHome(){},applyRestoredCamera(){},emitDomainState:next=>{final=next}};
  await vm.runInNewContext(`(async()=>{${body})()`,sandbox);
  assert.equal(final.viewMode,'2d');assert.equal(context.viewMode,'2d');
 }
});
