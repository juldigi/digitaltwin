const DEFAULT_STATE=Object.freeze({
  activeSection:'factory',selectedArea:null,selectedAsset:null,selectedNode:null,
  selectedSystem:null,viewMode:'3d',cameraPreset:'iso',
  visibleLayers:{structure:true,walls:true,roof:true,columns:true,doors:true,machines:true,workAreas:true,safetyZones:false,hvac:false,ducting:false,compressedAir:false,water:false,electrical:false,labels:true,accessRoutes:false,annotations:false,sensors:false},
  inspectionMode:{explode:false,isolate:false,section:false,interior:false,labels:true},
  simulationState:{active:false,playing:false,stage:0,speed:1,progress:0},
  searchState:{open:false,query:'',results:[]},
  inspectorState:{open:false,tab:'overview'},
  activeReference:null,deviceMode:'desktop',overlay:null
});
const clone=v=>JSON.parse(JSON.stringify(v));
const listeners=new Set();
let state=clone(DEFAULT_STATE);
let scheduled=false;
function notify(){
  scheduled=false;
  const snapshot=getState();
  listeners.forEach(fn=>{try{fn(snapshot)}catch(error){console.error('[app-state]',error)}});
  window.dispatchEvent(new CustomEvent('bmj:statechange',{detail:snapshot}));
}
export function getState(){return clone(state)}
export function setState(patch,meta={}){
  state={...state,...patch};
  if(!scheduled){scheduled=true;queueMicrotask(notify)}
  if(meta.url!==false)syncUrl();
  return getState();
}
export function updateState(updater,meta){return setState(updater(getState()),meta)}
export function subscribe(fn){listeners.add(fn);fn(getState());return()=>listeners.delete(fn)}
export function resetState(){state=clone(DEFAULT_STATE);notify()}
export function openOverlay(name){
  return setState({overlay:name,searchState:{...state.searchState,open:name==='search'},inspectorState:{...state.inspectorState,open:name==='inspector'||(name===null&&state.inspectorState.open)}},{url:false});
}
export function closeOverlay(){return setState({overlay:null,searchState:{...state.searchState,open:false}},{url:false})}
export function selectContext({area,asset,node,system,reference}={}){
  const next={};
  if(area!==undefined)next.selectedArea=area;
  if(asset!==undefined)next.selectedAsset=asset;
  if(node!==undefined)next.selectedNode=node;
  if(system!==undefined)next.selectedSystem=system;
  if(reference!==undefined)next.activeReference=reference;
  next.inspectorState={...state.inspectorState,open:Boolean(asset||node||system)};
  return setState(next);
}
export function setInspection(key,value){
  const modes={...state.inspectionMode,[key]:value};
  if(key==='isolate'&&value)modes.section=false;
  if(key==='section'&&value)modes.isolate=false;
  return setState({inspectionMode:modes},{url:false});
}
export function setLayer(key,value){
  return setState({visibleLayers:{...state.visibleLayers,[key]:value}},{url:false});
}
export function setSimulation(patch){
  return setState({simulationState:{...state.simulationState,...patch},activeSection:patch.active===false?'factory':'simulation'},{url:false});
}
export function hydrateUrl(){
  const p=new URLSearchParams(location.search);
  setState({
    selectedAsset:p.get('asset')||state.selectedAsset,
    selectedNode:p.get('node')||state.selectedNode,
    viewMode:p.get('view')||state.viewMode
  },{url:false});
}
function syncUrl(){
  const p=new URLSearchParams(location.search);
  const map={asset:state.selectedAsset,node:state.selectedNode,view:state.viewMode};
  Object.entries(map).forEach(([k,v])=>v?p.set(k,v):p.delete(k));
  history.replaceState(history.state,'',location.pathname+(p.size?'?'+p:'')+location.hash);
}
window.BMJAppState={getState,setState,selectContext,setLayer,setInspection,setSimulation,subscribe,openOverlay,closeOverlay};
