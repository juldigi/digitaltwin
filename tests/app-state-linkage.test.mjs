import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.window={dispatchEvent(){}};
globalThis.CustomEvent=class {constructor(type,options){this.type=type;this.detail=options.detail}};
globalThis.location={search:'',pathname:'/'};
globalThis.history={state:null,replaceState(){}};
const {getState,selectContext,hydrateUrl}=await import('../frontend/src/state/app-state.js');

test('clearing a selected asset closes the inspector when no other context remains',()=>{
  selectContext({selectedAsset:'offset5'});
  assert.equal(getState().inspectorState.open,true);
  selectContext({selectedAsset:null});
  assert.equal(getState().inspectorState.open,false);
});

test('clearing a node retains inspector while its machine remains selected',()=>{
  selectContext({selectedAsset:'offset5',selectedNode:'pu4'});
  selectContext({selectedNode:null});
  assert.equal(getState().inspectorState.open,true);
  assert.equal(getState().selectedNode,null);
  selectContext({selectedAsset:null});
});

test('asset deep link preserves factory selection and explicit machine scene',()=>{
  globalThis.location={search:'?asset=offset5&view=2d'};
  assert.equal(hydrateUrl().sceneMode,'factory');
  assert.equal(getState().viewMode,'2d');
  globalThis.location={search:'?asset=offset5&scene=machine'};
  assert.equal(hydrateUrl().sceneMode,'machine');
});
