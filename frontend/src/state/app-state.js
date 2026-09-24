export const APP_BUILD='2026.09.25-211';

const DEFAULT_STATE={
  bootState:{phase:'booting',message:null},
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
  inspectionMode:{explode:false,explodeLevel:0,isolate:false,section:false,interior:false,labels:true},
  simulationState:{available:false,blocked:false,blockedReason:null,active:false,playing:false,paused:false,stage:null,speed:1,progress:0},
  searchState:{open:false,query:''},
  referenceState:{filter:'all'},
  inspectorState:{open:false,tab:'overview'},
  activeReference:null,
  deviceMode:'desktop',
  overlay:null
};

const listeners=new Set();
const clone=value=>typeof structuredClone==='function'?structuredClone(value):JSON.parse(JSON.stringify(value));
const ENUMS={
  activeSection:new Set(['factory','asset','system','simulation','reference','view','help']),
  sceneMode:new Set(['factory','machine']),
  viewMode:new Set(['2d','3d']),
  cameraPreset:new Set(['iso','top']),
  deviceMode:new Set(['mobile','tablet','desktop']),
  overlay:new Set([null,'search','systems','layers','navigation','modal','inspector'])
};
const INSPECTOR_TABS=new Set(['overview','structure','simulation','data','sources','exterior']);
const BOOT_PHASES=new Set(['booting','ready','error','timeout']);
let state=clone(DEFAULT_STATE);
let notifyQueued=false;

export function getState(){return clone(state)}

function normalizePatch(patch={}){
  const next={...patch};
  for(const key of ['activeSection','sceneMode','viewMode','cameraPreset','deviceMode'])if(Object.prototype.hasOwnProperty.call(next,key)&&!ENUMS[key].has(next[key]))delete next[key];
  if(Object.prototype.hasOwnProperty.call(next,'overlay')&&!ENUMS.overlay.has(next.overlay))delete next.overlay;
  if(next.inspectorState?.tab&&!INSPECTOR_TABS.has(next.inspectorState.tab))next.inspectorState={...next.inspectorState,tab:state.inspectorState.tab};
  if(next.bootState?.phase&&!BOOT_PHASES.has(next.bootState.phase))next.bootState={...next.bootState,phase:state.bootState.phase};
  if(next.inspectionMode?.explodeLevel!==undefined){
    const level=Number(next.inspectionMode.explodeLevel);
    next.inspectionMode={...next.inspectionMode,explodeLevel:Number.isFinite(level)?Math.max(0,Math.min(1,level)):state.inspectionMode.explodeLevel};
  }
  if(next.simulationState?.progress!==undefined){
    const progress=Number(next.simulationState.progress);
    next.simulationState={...next.simulationState,progress:Number.isFinite(progress)?Math.max(0,Math.min(100,progress)):state.simulationState.progress};
  }
  return next;
}

export function setState(patch={},options={}){
  patch=normalizePatch(patch);
  const nested=['bootState','visibleLayers','inspectionMode','simulationState','searchState','referenceState','inspectorState'];
  const next={...state,...patch};
  for(const key of nested)if(patch[key])next[key]={...state[key],...patch[key]};
  state=next;
  if(options.url!==false)syncUrl();
  queueNotify();
  return getState();
}

export function setDomainState(patch={}){return setState(patch,{url:false})}
export function subscribe(listener){
  listeners.add(listener);
  listener(getState());
  return()=>listeners.delete(listener);
}

export function setBoot(phase,message=null){return setState({bootState:{phase,message}},{url:false})}
export function setActiveSection(activeSection){return setState({activeSection},{url:false})}
export function setViewMode(viewMode){return setState({viewMode})}
export function selectContext(patch={}){
  const allowed=['selectedArea','selectedAsset','selectedNode','selectedSystem','activeReference'];
  const next={};
  for(const key of allowed)if(Object.prototype.hasOwnProperty.call(patch,key))next[key]=patch[key];
  if(Object.prototype.hasOwnProperty.call(patch,'selectedAsset')||Object.prototype.hasOwnProperty.call(patch,'selectedNode')||Object.prototype.hasOwnProperty.call(patch,'selectedSystem')){
    const selectedAsset=Object.prototype.hasOwnProperty.call(next,'selectedAsset')?next.selectedAsset:state.selectedAsset;
    const selectedNode=Object.prototype.hasOwnProperty.call(next,'selectedNode')?next.selectedNode:state.selectedNode;
    const selectedSystem=Object.prototype.hasOwnProperty.call(next,'selectedSystem')?next.selectedSystem:state.selectedSystem;
    next.inspectorState={...state.inspectorState,open:Boolean(selectedAsset||selectedNode||selectedSystem)};
  }
  return setState(next);
}
export function setLayer(key,visible){
  if(!(key in state.visibleLayers))return getState();
  return setState({visibleLayers:{[key]:Boolean(visible)}},{url:false});
}
export function setInspection(key,value){
  if(!(key in state.inspectionMode))return getState();
  if(key==='explodeLevel'){
    const explodeLevel=Math.max(0,Math.min(1,Number(value)||0));
    return setState({inspectionMode:{explodeLevel,explode:explodeLevel>0}},{url:false});
  }
  const next={[key]:Boolean(value)};
  if(key==='isolate'&&value)next.section=false;
  if(key==='section'&&value)next.isolate=false;
  if(key==='explode'&&!value)next.explodeLevel=0;
  return setState({inspectionMode:next},{url:false});
}
export function setSimulation(patch={}){return setState({simulationState:patch},{url:false})}
export function setReferenceFilter(filter='all'){return setState({referenceState:{filter:String(filter||'all')}},{url:false})}
export function setInspector(open,tab=state.inspectorState.tab){return setState({inspectorState:{open:Boolean(open),tab}},{url:false})}
export function openOverlay(name){
  return setState({
    overlay:name,
    searchState:{open:name==='search'},
    inspectorState:{open:name==='inspector'?true:state.inspectorState.open}
  },{url:false});
}
export function closeOverlay(){return setState({overlay:null,searchState:{open:false}},{url:false})}
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
  for(const [key,value] of Object.entries(map)){if(value)params.set(key,value);else params.delete(key);}
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
    for(const listener of listeners){try{listener(snapshot)}catch(error){console.error('[BMJ app state]',error)}}
    window.dispatchEvent(new CustomEvent('bmj:statechange',{detail:snapshot}));
  });
}

window.BMJAppState={getState,setState,setDomainState,setBoot,setActiveSection,setViewMode,selectContext,setLayer,setInspection,setSimulation,setReferenceFilter,setInspector,openOverlay,closeOverlay,subscribe};
document.documentElement.dataset.build=APP_BUILD;
