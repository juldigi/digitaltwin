export const APP_BUILD='2026.09.25-222';

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
    building:true,walls:true,furniture:true,roof:false,machines:true,labels:true,landscape:true,
    reference:false,unidentified:true,compressedAir:false,ahuPiping:false,
    ducting:false,utilityAnchors:false
  },
  inspectionMode:{explode:false,explodeLevel:0,isolate:false,interior:false,interiorFocus:null},
  simulationState:{available:false,blocked:false,blockedReason:null,active:false,running:false,stage:null,speed:1,progress:0,completed:0,sheetsVisible:0,pileSheetsVisible:0},
  referenceState:{filter:'all'},
  inspectorState:{open:false,tab:'overview'},
  preferences:{theme:'dark',lowDetail:false,visualQuality:'auto'},
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
const PREF_KEYS=Object.freeze({theme:'bmj-digitaltwin-theme',lowDetail:'bmj-digitaltwin-low',visualQuality:'bmj-digitaltwin-visual-quality'});
const LEGACY_PREF_KEYS=Object.freeze({theme:'offset5-theme',lowDetail:'offset5-low'});
const readStoredPreference=(key,fallback)=>{if(typeof localStorage==='undefined')return fallback;try{const current=localStorage.getItem(PREF_KEYS[key]),legacy=current===null&&LEGACY_PREF_KEYS[key]?localStorage.getItem(LEGACY_PREF_KEYS[key]):null,value=current??legacy;if(legacy!==null){localStorage.setItem(PREF_KEYS[key],legacy);localStorage.removeItem(LEGACY_PREF_KEYS[key]);}if(key==='theme')return value==='light'?'light':'dark';if(key==='lowDetail')return value==='1';if(key==='visualQuality')return ['auto','hemat','seimbang','tinggi','engineering','cinematic'].includes(value)?value:'auto';}catch{}return fallback;};
const runtimeHref=()=>{if(typeof location!=='undefined'&&location.href)return location.href;const path=typeof location!=='undefined'?(location.pathname||'/'):'/';const search=typeof location!=='undefined'?(location.search||''):'';const hash=typeof location!=='undefined'?(location.hash||''):'';return 'http://localhost'+path+search+hash;};
let state={...clone(DEFAULT_STATE),preferences:{theme:readStoredPreference('theme','dark'),lowDetail:readStoredPreference('lowDetail',false),visualQuality:readStoredPreference('visualQuality','auto')}};
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
    next.simulationState={...next.simulationState,progress:Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):state.simulationState.progress};
  }
  return next;
}

export function setState(patch={},options={}){
  patch=normalizePatch(patch);
  const nested=['bootState','visibleLayers','inspectionMode','simulationState','referenceState','inspectorState','preferences'];
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
  if(key==='explode'&&!value)next.explodeLevel=0;
  return setState({inspectionMode:next},{url:false});
}
export function setSimulation(patch={}){return setState({simulationState:patch},{url:false})}
export function setReferenceFilter(filter='all'){return setState({referenceState:{filter:String(filter||'all')}},{url:false})}
export function setPreference(key,value){if(!(key in state.preferences))return getState();const normalized=key==='theme'?(value==='light'?'light':'dark'):key==='lowDetail'?Boolean(value):key==='visualQuality'&&['auto','hemat','seimbang','tinggi','engineering','cinematic'].includes(value)?value:key==='visualQuality'?'auto':value;if(typeof localStorage!=='undefined'){try{localStorage.setItem(PREF_KEYS[key],key==='lowDetail'?(normalized?'1':'0'):String(normalized));localStorage.removeItem(LEGACY_PREF_KEYS[key]);}catch{}}return setState({preferences:{[key]:normalized}},{url:false})}
export function setInspector(open,tab=state.inspectorState.tab){return setState({inspectorState:{open:Boolean(open),tab}},{url:false})}
export function openOverlay(name){
  return setState({
    overlay:name,
    inspectorState:{open:name==='inspector'?true:state.inspectorState.open}
  },{url:false});
}
export function closeOverlay(){return setState({overlay:null},{url:false})}
export function readUrlState(url=runtimeHref()){
  const parsed=new URL(url,runtimeHref()),params=parsed.searchParams,legacyMachine=params.get('machine');
  const selectedAsset=params.get('asset')||legacyMachine||null,selectedNode=params.get('node')||null;
  return {
    selectedAsset,
    selectedNode,
    sceneMode:params.get('scene')==='machine'||Boolean(selectedNode)||Boolean(legacyMachine)?'machine':'factory',
    viewMode:params.get('view')==='2d'?'2d':'3d',
    cameraPreset:params.get('camera')==='top'?'top':'iso'
  };
}
export function buildContextUrl(context=state,base=runtimeHref()){
  const url=new URL(base,runtimeHref()),params=url.searchParams;
  const selectedAsset=context.selectedAsset??context.asset??null,selectedNode=context.selectedNode??context.node??null;
  const sceneMode=context.sceneMode??context.scene??'factory',viewMode=context.viewMode??context.view??'3d',cameraPreset=context.cameraPreset??context.camera??'iso';
  params.delete('machine');
  if(selectedAsset)params.set('asset',selectedAsset);else params.delete('asset');
  if(selectedNode)params.set('node',selectedNode);else params.delete('node');
  if(sceneMode==='machine')params.set('scene','machine');else if(selectedAsset)params.set('scene','factory');else params.delete('scene');
  params.set('view',viewMode==='2d'?'2d':'3d');
  if(cameraPreset==='top')params.set('camera','top');else params.delete('camera');
  return url;
}
export function hydrateUrl(){
  state={...state,...readUrlState()};
  queueNotify();
  return getState();
}

function syncUrl(){
  const url=buildContextUrl(state);
  history.replaceState(history.state,'',url.pathname+url.search+url.hash);
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

if(typeof window!=='undefined')window.BMJAppState={getState,setState,setDomainState,setBoot,setActiveSection,setViewMode,selectContext,setLayer,setInspection,setSimulation,setReferenceFilter,setPreference,setInspector,openOverlay,closeOverlay,readUrlState,buildContextUrl,subscribe};
if(typeof document!=='undefined')document.documentElement.dataset.build=APP_BUILD;
