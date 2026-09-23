const DEFAULT_STATE={
  activeSection:'factory',
  selectedArea:null,
  selectedAsset:null,
  selectedNode:null,
  selectedSystem:null,
  sceneMode:'factory',
  viewMode:'3d',
  cameraPreset:'iso',
  visibleLayers:{
    building:true,roof:false,machines:true,labels:true,landscape:true,
    reference:false,unidentified:true,compressedAir:false,ahuPiping:false,
    ducting:false,utilityAnchors:false
  },
  inspectionMode:{explode:false,isolate:false,section:false,interior:false,labels:true},
  simulationState:{active:false,playing:false,stage:null,speed:1,progress:0},
  searchState:{open:false,query:''},
  inspectorState:{open:false,tab:'overview'},
  activeReference:null,
  deviceMode:'desktop',
  overlay:null
};

const listeners=new Set();
const clone=value=>typeof structuredClone==='function'?structuredClone(value):JSON.parse(JSON.stringify(value));
let state=clone(DEFAULT_STATE);
let notifyQueued=false;

export function getState(){return clone(state)}

export function setState(patch={},options={}){
  const nested=['visibleLayers','inspectionMode','simulationState','searchState','inspectorState'];
  const next={...state,...patch};
  for(const key of nested){
    if(patch[key])next[key]={...state[key],...patch[key]};
  }
  state=next;
  if(options.url!==false)syncUrl();
  queueNotify();
  return getState();
}

export function subscribe(listener){
  listeners.add(listener);
  listener(getState());
  return()=>listeners.delete(listener);
}

export function setActiveSection(activeSection){return setState({activeSection},{url:false})}
export function setViewMode(viewMode){return setState({viewMode})}
export function selectContext(patch={}){
  const allowed=['selectedArea','selectedAsset','selectedNode','selectedSystem','activeReference'];
  const next={};
  for(const key of allowed)if(Object.prototype.hasOwnProperty.call(patch,key))next[key]=patch[key];
  if(Object.prototype.hasOwnProperty.call(patch,'selectedAsset')||Object.prototype.hasOwnProperty.call(patch,'selectedNode')||Object.prototype.hasOwnProperty.call(patch,'selectedSystem')){
    next.inspectorState={...state.inspectorState,open:Boolean(patch.selectedAsset||patch.selectedNode||patch.selectedSystem||state.selectedAsset||state.selectedNode||state.selectedSystem)};
  }
  return setState(next);
}
export function setLayer(key,visible){
  if(!(key in state.visibleLayers))return getState();
  return setState({visibleLayers:{[key]:Boolean(visible)}},{url:false});
}
export function setInspection(key,value){
  if(!(key in state.inspectionMode))return getState();
  const next={[key]:Boolean(value)};
  if(key==='isolate'&&value)next.section=false;
  if(key==='section'&&value)next.isolate=false;
  return setState({inspectionMode:next},{url:false});
}
export function setSimulation(patch={}){
  return setState({simulationState:patch},{url:false});
}
export function setInspector(open,tab=state.inspectorState.tab){
  return setState({inspectorState:{open:Boolean(open),tab}},{url:false});
}
export function openOverlay(name){
  return setState({
    overlay:name,
    searchState:{open:name==='search'},
    inspectorState:{open:name==='inspector'?true:state.inspectorState.open}
  },{url:false});
}
export function closeOverlay(){
  return setState({overlay:null,searchState:{open:false}},{url:false});
}
export function hydrateUrl(){
  const params=new URLSearchParams(location.search);
  const selectedAsset=params.get('asset')||params.get('machine')||null;
  const selectedNode=params.get('node')||null;
  const sceneParam=params.get('scene');
  state={
    ...state,
    selectedAsset,
    selectedNode,
    sceneMode:sceneParam==='machine'||Boolean(selectedNode)?'machine':'factory',
    viewMode:params.get('view')==='2d'?'2d':'3d',
    cameraPreset:params.get('camera')==='top'?'top':'iso'
  };
  queueNotify();
  return getState();
}

function syncUrl(){
  const params=new URLSearchParams(location.search);
  params.delete('machine');
  const map={asset:state.selectedAsset,node:state.selectedNode,view:state.viewMode};
  for(const [key,value] of Object.entries(map)){
    if(value)params.set(key,value);else params.delete(key);
  }
  if(state.sceneMode==='machine')params.set('scene','machine');
  else if(state.selectedAsset)params.set('scene','factory');
  else params.delete('scene');
  if(state.cameraPreset&&state.cameraPreset!=='iso')params.set('camera',state.cameraPreset);else params.delete('camera');
  const query=params.toString();
  history.replaceState(history.state,'',location.pathname+(query?'?'+query:'')+location.hash);
}

function queueNotify(){
  if(notifyQueued)return;
  notifyQueued=true;
  queueMicrotask(()=>{
    notifyQueued=false;
    const snapshot=getState();
    for(const listener of listeners){
      try{listener(snapshot)}catch(error){console.error('[BMJ app state]',error)}
    }
    window.dispatchEvent(new CustomEvent('bmj:statechange',{detail:snapshot}));
  });
}

window.BMJAppState={getState,setState,setActiveSection,setViewMode,selectContext,setLayer,setInspection,setSimulation,setInspector,openOverlay,closeOverlay,subscribe};
