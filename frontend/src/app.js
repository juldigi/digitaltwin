import {selectPlantLayout} from './data/plant-actual.js';
import {loadFactoryFleet} from './factory-building.js';
import {FactoryEngine} from './engine.js';
import {validateSceneOverrides,validateSceneImport,createSceneIsolationGuard} from './scene-editor-state.js';
import {initialState,validateLayout,validatePosition,worldToCad} from './model.js';
import {OFFSET5_TAXONOMY,TAXONOMY_BY_ID as OFFSET5_BY_ID,taxonomyChildren as offset5Children,taxonomyStats as offset5Stats} from './data/taxonomy-offset5.js';
import {PHOTO_REGISTRY as OFFSET5_PHOTOS,TECHNICAL_SOURCES as OFFSET5_SOURCES,photoStats as offset5PhotoStats,ORIENTATION as OFFSET5_ORIENTATION} from './data/sources-offset5.js';
import {confidenceLabel} from './data/confidence.js';
import {loadBundledPlantLayout,drawPlantPlan} from './data/plant-layout-data.js';
import {PRINTING_SIMULATION_STAGES as OFFSET5_SIM_STAGES,INK_SIMULATION_SEQUENCE as OFFSET5_INK_SEQUENCE} from './simulation.js';
import {MACHINE_REGISTRY,MACHINE_REGISTRY_BY_ID,MACHINE_REGISTRY_STATS} from './data/machine-registry.js';
import {FOUNDATION_SCOPE,foundationAssetPolicy,scopedRegistryHas3D,canOpenTechnical3D,isFoundationPrimary} from './data/foundation-scope.js';
import {OFFSET10_TAXONOMY,OFFSET10_TAXONOMY_BY_ID,offset10TaxonomyChildren,offset10TaxonomyStats} from './data/taxonomy-offset10.js';
import {OFFSET10_PHOTO_REGISTRY,OFFSET10_TECHNICAL_SOURCES,offset10PhotoStats,OFFSET10_ORIENTATION} from './data/sources-offset10.js';
import {OFFSET10_SIMULATION_STAGES,OFFSET10_INK_SEQUENCE} from './simulation-offset10.js';
import {APM2_TAXONOMY,APM2_TAXONOMY_BY_ID,apm2TaxonomyChildren,apm2TaxonomyStats} from './data/taxonomy-apm2.js';
import {APM2_PHOTO_REGISTRY,APM2_TECHNICAL_SOURCES,apm2PhotoStats,APM2_ORIENTATION} from './data/sources-apm2.js';
import {APM2_SIMULATION_STAGES,APM2_PROCESS_STEPS} from './simulation-apm2.js';
import {SHEETING_TAXONOMY,SHEETING_TAXONOMY_BY_ID,sheetingTaxonomyChildren,sheetingTaxonomyStats} from './data/taxonomy-sheeting.js';
import {SHEETING_PHOTO_REGISTRY,SHEETING_TECHNICAL_SOURCES,sheetingPhotoStats,SHEETING_ORIENTATION} from './data/sources-sheeting.js';
import {SHEETING_SIMULATION_STAGES,SHEETING_PROCESS_STEPS} from './simulation-sheeting.js';
import {universalMachineConfig,universalTaxonomy,universalTechnicalSources} from './universal-machine.js';
import {assetTruth,connectionTruth,layoutTruth,positionVerification,truthStatus} from './data/truth-status.js';
import {buildDwgFidelityLedger} from './data/dwg-fidelity.js';
import {APP_BUILD,getState as getAppState,setDomainState,setSimulation as setAppSimulation,setInspector as setAppInspector,setBoot as setAppBoot,setPreference,readUrlState,buildContextUrl} from './state/app-state.js';
const MACHINE_ROUTE_BY_ID=Object.freeze({
 'BMJ-MCH-0002':'sheeting',
 [FOUNDATION_SCOPE.referenceMachineId]:'offset5',
 'BMJ-MCH-0009':'offset10',
 'BMJ-MCH-0010':'apm2'
});
const normalizeMachineKey=key=>{const raw=String(key??'').trim();return raw?(MACHINE_ROUTE_BY_ID[raw]||raw):null;};
const emptyTaxonomyStats=()=>({total:0,byLevel:{1:0,2:0,3:0,4:0,5:0,6:0}});
const emptyPhotoStats=()=>({unique:0,total:0});
const neutralOrientation=Object.freeze({feedDirection:'Belum memilih mesin',operatorSide:'Belum memilih mesin',driveSide:'Belum memilih mesin'});
let GENERIC_CONFIG=null,MACHINE_KEY=null,IS_OFFSET10=false,IS_APM2=false,IS_SHEETING=false,IS_GENERIC=false,IS_VERIFIED_REGISTRY_SIM=false,GENERIC_TAXONOMY=[],GENERIC_ROOT=null,ACTIVE_ROOT=null,ACTIVE_TAXONOMY=[],TAXONOMY_BY_ID=new Map(),taxonomyChildren=()=>[],taxonomyStats=emptyTaxonomyStats,PHOTO_REGISTRY=[],GENERIC_SOURCES=[],TECHNICAL_SOURCES=[],photoStats=emptyPhotoStats,ORIENTATION=neutralOrientation,PRINTING_SIMULATION_STAGES=[],INK_SIMULATION_SEQUENCE=[];
function clearActiveMachineDescriptor(){
 GENERIC_CONFIG=null;MACHINE_KEY=null;IS_OFFSET10=false;IS_APM2=false;IS_SHEETING=false;IS_GENERIC=false;IS_VERIFIED_REGISTRY_SIM=false;
 GENERIC_TAXONOMY=[];GENERIC_ROOT=null;ACTIVE_ROOT=null;ACTIVE_TAXONOMY=[];TAXONOMY_BY_ID=new Map();taxonomyChildren=()=>[];taxonomyStats=emptyTaxonomyStats;
 PHOTO_REGISTRY=[];GENERIC_SOURCES=[];TECHNICAL_SOURCES=[];photoStats=emptyPhotoStats;ORIENTATION=neutralOrientation;PRINTING_SIMULATION_STAGES=[];INK_SIMULATION_SEQUENCE=[];
}
function configureActiveMachine(requested){
 requested=normalizeMachineKey(requested);
 if(!requested){clearActiveMachineDescriptor();return false;}
 GENERIC_CONFIG=universalMachineConfig(requested);
 if(!['offset5','offset10','apm2','sheeting'].includes(requested)&&!GENERIC_CONFIG)throw new Error(`Model 3D tidak terdaftar untuk ${requested}`);
 MACHINE_KEY=requested;
 IS_OFFSET10=MACHINE_KEY==='offset10';IS_APM2=MACHINE_KEY==='apm2';IS_SHEETING=MACHINE_KEY==='sheeting';IS_GENERIC=!!GENERIC_CONFIG;IS_VERIFIED_REGISTRY_SIM=IS_GENERIC&&['VERIFIED_PROCESS_MODEL','FAMILY_PROCESS_MODEL'].includes(GENERIC_CONFIG.evidence.simulation);
 GENERIC_TAXONOMY=IS_GENERIC?universalTaxonomy(MACHINE_KEY):[];GENERIC_ROOT=GENERIC_TAXONOMY[0]?.id;
 ACTIVE_ROOT=IS_OFFSET10?'O10':IS_APM2?'APM2':IS_SHEETING?'SH':IS_GENERIC?GENERIC_ROOT:'O5';
 ACTIVE_TAXONOMY=IS_OFFSET10?OFFSET10_TAXONOMY:IS_APM2?APM2_TAXONOMY:IS_SHEETING?SHEETING_TAXONOMY:IS_GENERIC?GENERIC_TAXONOMY:OFFSET5_TAXONOMY;
 TAXONOMY_BY_ID=IS_OFFSET10?OFFSET10_TAXONOMY_BY_ID:IS_APM2?APM2_TAXONOMY_BY_ID:IS_SHEETING?SHEETING_TAXONOMY_BY_ID:IS_GENERIC?new Map(GENERIC_TAXONOMY.map(n=>[n.id,n])):OFFSET5_BY_ID;
 taxonomyChildren=IS_OFFSET10?offset10TaxonomyChildren:IS_APM2?apm2TaxonomyChildren:IS_SHEETING?sheetingTaxonomyChildren:IS_GENERIC?(id=>GENERIC_TAXONOMY.filter(n=>n.parentId===id)):offset5Children;
 taxonomyStats=IS_OFFSET10?offset10TaxonomyStats:IS_APM2?apm2TaxonomyStats:IS_SHEETING?sheetingTaxonomyStats:IS_GENERIC?(()=>({total:GENERIC_TAXONOMY.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(l=>[l,GENERIC_TAXONOMY.filter(n=>n.level===l).length]))})):offset5Stats;
 PHOTO_REGISTRY=IS_OFFSET10?OFFSET10_PHOTO_REGISTRY:IS_APM2?APM2_PHOTO_REGISTRY:IS_SHEETING?SHEETING_PHOTO_REGISTRY:IS_GENERIC?[]:OFFSET5_PHOTOS;
 GENERIC_SOURCES=IS_GENERIC?[{id:'BMJ-MACHINE-DATABASE',title:'Database Mesin Packaging Offset BMJ',publisher:'PT Bukit Muria Jaya',type:'USER_PROVIDED',confidence:'VERIFIED'},...universalTechnicalSources(MACHINE_KEY)]:[];
 TECHNICAL_SOURCES=IS_OFFSET10?OFFSET10_TECHNICAL_SOURCES:IS_APM2?APM2_TECHNICAL_SOURCES:IS_SHEETING?SHEETING_TECHNICAL_SOURCES:IS_GENERIC?GENERIC_SOURCES:OFFSET5_SOURCES;
 photoStats=IS_OFFSET10?offset10PhotoStats:IS_APM2?apm2PhotoStats:IS_SHEETING?sheetingPhotoStats:IS_GENERIC?(()=>({unique:0,total:0})):offset5PhotoStats;
 ORIENTATION=IS_OFFSET10?OFFSET10_ORIENTATION:IS_APM2?APM2_ORIENTATION:IS_SHEETING?SHEETING_ORIENTATION:IS_GENERIC?{feedDirection:'Mengikuti alur proses keluarga',operatorSide:'Belum terverifikasi',driveSide:'Belum terverifikasi'}:OFFSET5_ORIENTATION;
 PRINTING_SIMULATION_STAGES=IS_OFFSET10?OFFSET10_SIMULATION_STAGES:IS_APM2?APM2_SIMULATION_STAGES:IS_SHEETING?SHEETING_SIMULATION_STAGES:IS_GENERIC?(IS_VERIFIED_REGISTRY_SIM?(GENERIC_CONFIG.profile?.process?.length?GENERIC_CONFIG.profile.process:GENERIC_TAXONOMY.filter(n=>n.level===2).map(n=>n.name)):GENERIC_CONFIG.modules):OFFSET5_SIM_STAGES;
 INK_SIMULATION_SEQUENCE=IS_OFFSET10?OFFSET10_INK_SEQUENCE:IS_APM2?APM2_PROCESS_STEPS:IS_SHEETING?SHEETING_PROCESS_STEPS:IS_GENERIC?(IS_VERIFIED_REGISTRY_SIM?PRINTING_SIMULATION_STAGES:GENERIC_CONFIG.modules.map(x=>`${x} process`)):OFFSET5_INK_SEQUENCE;
 return true;
}
clearActiveMachineDescriptor();
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'Belum tersedia').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=n=>Number.isFinite(n)?n.toLocaleString('id-ID',{maximumFractionDigits:4}):'Belum tersedia';
const CONNECTION_STORAGE=Object.freeze({apiBase:'bmj-digitaltwin-api-base',cacheEnabled:'bmj-digitaltwin-cache-enabled'}),LEGACY_CONNECTION_STORAGE=Object.freeze({apiBase:'offset5-api-base',cacheEnabled:'offset5-cache-enabled'});
const activeInspectorTab=()=>getAppState().inspectorState?.tab||'overview';
const activeTaxonomyId=()=>{const node=getAppState().selectedNode;return node&&TAXONOMY_BY_ID.has(node)?node:ACTIVE_ROOT;};
const setActiveTaxonomyId=id=>setDomainState({selectedNode:id&&id!==ACTIVE_ROOT?id:null});
const explodeLevel=()=>Math.max(0,Math.min(1,Number(getAppState().inspectionMode?.explodeLevel)||0));
const setExplodeLevel=value=>{const level=Math.max(0,Math.min(1,Number(value)||0));setDomainState({inspectionMode:{explode:level>0,explodeLevel:level}});return level;};
const isInteriorOpen=()=>Boolean(getAppState().inspectionMode?.interior);
const isIsolated=()=>Boolean(getAppState().inspectionMode?.isolate);
const interiorFocus=()=>getAppState().inspectionMode?.interiorFocus||null;
const currentSimulationState=()=>getAppState().simulationState||{};
const referenceFilter=()=>getAppState().referenceState?.filter||'all';
const setReferenceFilter=filter=>setDomainState({referenceState:{filter:filter||'all'}});
const readConnectionSetting=(key,fallback='')=>{try{const current=localStorage.getItem(CONNECTION_STORAGE[key]);if(current!==null)return current;const legacy=localStorage.getItem(LEGACY_CONNECTION_STORAGE[key]);if(legacy!==null){localStorage.setItem(CONNECTION_STORAGE[key],legacy);localStorage.removeItem(LEGACY_CONNECTION_STORAGE[key]);return legacy;}}catch{}return fallback;};
let state,engine,apiBase='',token='',role=null,editing=false,selectedPart=null,exteriorPreviousLow=null,simulationOwnsExterior=false,toastTimer,bundledLayout=null,cachedDataActive=false;
function applyActiveMachineState(){
 state=structuredClone(initialState);setReferenceFilter('all');
 setAppSimulation({available:Boolean(MACHINE_KEY),blocked:false,blockedReason:null,active:false,running:false,speed:1,stage:null,completed:0,progress:0,sheetsVisible:0,pileSheetsVisible:0,rotorCount:0,oscillatorCount:0,mechanismCount:0,inkFlowCount:0,uvLampCount:0,uvActive:false,pathVisible:IS_SHEETING?false:Boolean(MACHINE_KEY),inkFlowVisible:Boolean(MACHINE_KEY)});
 if(!MACHINE_KEY){
  state.asset={...state.asset,asset_id:null,asset_code:null,codename:null,model:null,description:'Belum memilih mesin',source_description:null,category:null,subcategory:null,manufacturer:null,specification:null,configuration:null,serial_number:null,functional_location:null,year:null,'3d_status':'BELUM MEMILIH MESIN',data_confidence:null,discovery_status:null,sources:[]};
  return;
 }
 const registry=machineRecordForRoute(MACHINE_KEY);
 if(!registry)throw new Error('Identitas mesin aktif tidak ditemukan pada registry.');
 state.asset={...state.asset,asset_id:registry.machineId,asset_code:registry.sapCode||registry.machineId,codename:registry.sapCode||null,model:registry.model||null,description:registry.name,source_description:'BMJ Machine Database',category:registry.area||null,subcategory:null,manufacturer:null,specification:null,configuration:null,serial_number:registry.serial||null,functional_location:registry.functionalLocation||null,year:registry.year||null,sources:TECHNICAL_SOURCES};
 if(MACHINE_KEY==='offset5')state.asset={...state.asset,manufacturer:'Heidelberg',specification:'Heidelberg Speedmaster CD 102-8+L',configuration:'Feeder · 8 Printing Unit · Coating Unit · Delivery','3d_status':'PROCEDURAL / PHOTO + DOCUMENT GROUNDED',data_confidence:'HIGH CONFIDENCE',discovery_status:'BMJ_ACTUAL_EVIDENCE_AVAILABLE'};
 if(IS_OFFSET10)state.asset={...state.asset,manufacturer:'Heidelberg',specification:'Speedmaster CX 104 · Full UV · FoilStar Gen.3 · X3 delivery',configuration:'CX104-2+LY-8+LY-1+L UV + FoilStar / X3','3d_status':'PROCEDURAL / DOCUMENT-GROUNDED',data_confidence:'HIGH CONFIDENCE',discovery_status:'OFFICIAL_DOCUMENTS_AVAILABLE'};
 if(IS_APM2)state.asset={...state.asset,manufacturer:'BOBST',specification:'Automatic flatbed die cutter · SP 102 family · 1994',configuration:'Feeder · Register / SideLay · Gripper Chain · Flatbed Platen · Stripping · Delivery','3d_status':'PROCEDURAL / DATABASE + LEGACY FAMILY REFERENCES',data_confidence:'IDENTITY VERIFIED / VARIANT REFERENCE',discovery_status:'SP102_FAMILY_REFERENCE_AVAILABLE'};
 if(IS_SHEETING)state.asset={...state.asset,manufacturer:'LEXUS',specification:'HSM-CTM7 · BMJ actual photo reconstruction · 2014',configuration:'Single-reel hydraulic rollstand → low entry guide → overhead web carrier + deep roller loops → guarded LEXUS cross-cut → smooth take-away gap → slow overlap/shingling → rack stacker','3d_status':'DEDICATED PROCEDURAL / BMJ PHOTO-GROUNDED RECONSTRUCTION',data_confidence:'IDENTITY VERIFIED / ACTUAL PHOTO GEOMETRY / CUTTER INTERNAL UNRESOLVED',discovery_status:'BMJ_ACTUAL_PHOTOSET_PRIMARY__HSM_FAMILY_PROCESS_SECONDARY'};
 if(IS_GENERIC){const e=GENERIC_CONFIG.evidence,units=GENERIC_TAXONOMY.filter(n=>n.level===2).map(n=>n.name);state.asset={...state.asset,specification:GENERIC_CONFIG.label,configuration:(units.length?units:GENERIC_CONFIG.modules).join(' · '),'3d_status':IS_VERIFIED_REGISTRY_SIM?'DEDICATED PROCEDURAL / '+e.geometry:'PROCEDURAL / '+e.geometry,data_confidence:e.grade,discovery_status:IS_VERIFIED_REGISTRY_SIM?'DEDICATED_EVIDENCE_AVAILABLE':'FAMILY_REFERENCE_AVAILABLE'};}
}
applyActiveMachineState();
function updateEvidenceStatus(){
 const summary=$('#evidence-summary'),detail=$('#evidence-detail');if(!summary||!detail)return;
 const identity=state?.asset?.asset_id||state?.asset?.asset_code||MACHINE_KEY;
 const photos=Array.isArray(PHOTO_REGISTRY)?PHOTO_REGISTRY.length:0,docs=Array.isArray(TECHNICAL_SOURCES)?TECHNICAL_SOURCES.length:0;
 const placement=placementForMachine?.(activeMachineAssetId())||null,truth=assetTruth(state?.asset,{placement,sourceCount:docs});
 summary.textContent=`${truth.dataConfidence} · ${docs} sumber`;
 detail.innerHTML=`${pair('Identitas aset',identity||'UNKNOWN')}${pair('Status operasi',truth.operatingStatus)}${pair('Health score',truth.healthScore)}${pair('3D source',truth.source3D)}${pair('3D detail',truth.detail3D)}${pair('Data confidence',truth.dataConfidence)}${pair('Posisi',truth.position)}${pair('Foto aktual / registry',photos?photos+' file':'UNKNOWN')}${pair('Dokumen / sumber teknis',docs?docs+' sumber':'UNKNOWN')}`;
}
function applyMachineShell(){
 const name=IS_OFFSET10?'OFFSET 10':IS_APM2?'APM 2':IS_SHEETING?'SHEETING LEXUS':IS_GENERIC?GENERIC_CONFIG.machine.name:MACHINE_KEY==='offset5'?'OFFSET 5':'Mesin';
 const maker=IS_OFFSET10||MACHINE_KEY==='offset5'?'Heidelberg':IS_APM2?'BOBST':IS_SHEETING?'LEXUS':IS_GENERIC?(state?.asset?.manufacturer||'Pabrikan belum terverifikasi'):'Belum memilih mesin';
 const model=IS_OFFSET10?'CX104-2+LY-8+LY-1+L UV + FoilStar':IS_APM2?'SP 102 · 1994':IS_SHEETING?'HSM-CTM7 · 2014':IS_GENERIC?(GENERIC_CONFIG.machine.model||'Model belum terverifikasi'):MACHINE_KEY==='offset5'?'CD 102-8+L':'Pilih mesin dari daftar aset';
 document.title='Packaging Offset Factory Digital Twin · '+name;
 const title=$('#view-title'),sub=$('#view-subtitle'),caption=$('#geometry-caption');
 if(title)title.textContent=name;if(sub)sub.textContent=maker+' · '+model;if(caption)caption.textContent='Model '+name;
 const heading=$('.asset-heading h2'),headingSub=$('.asset-heading p');if(heading)heading.textContent=name;if(headingSub)headingSub.textContent=maker+' · '+model;updateEvidenceStatus();
 if(IS_OFFSET10){
  const mark=$('.brandmark');if(mark)mark.innerHTML='F<span>10</span>';
  const icon=$('.asset-icon');if(icon)icon.textContent='10';
  const kpi=$('.top-kpis>div:nth-child(2)');if(kpi)kpi.innerHTML='<small>REFERENSI TEKNIS</small><b>'+TECHNICAL_SOURCES.length+'</b><span>Terverifikasi</span>';
  const warning=$('#dwg-warning');if(warning)warning.textContent='Model Offset 10 memakai layout mesin final Heidelberg. Posisi plant tidak mengambil anchor OFU-1/Offset 5.';
 }else if(IS_APM2){
  const mark=$('.brandmark');if(mark)mark.innerHTML='A<span>2</span>';
  const icon=$('.asset-icon');if(icon)icon.textContent='A2';
  const kpi=$('.top-kpis>div:nth-child(2)');if(kpi)kpi.innerHTML='<small>REFERENSI TEKNIS</small><b>'+TECHNICAL_SOURCES.length+'</b><span>Database + family</span>';
  const warning=$('#dwg-warning');if(warning)warning.textContent='Posisi APM 2 pada plant belum diklaim sampai anchor layout aktualnya tervalidasi.';
 }else if(IS_SHEETING){
  const mark=$('.brandmark');if(mark)mark.innerHTML='S<span>2</span>';
  const icon=$('.asset-icon');if(icon)icon.textContent='S2';
  const kpi=$('.top-kpis>div:nth-child(2)');if(kpi)kpi.innerHTML='<small>REFERENSI TEKNIS</small><b>'+TECHNICAL_SOURCES.length+'</b><span>Database + family</span>';
  const warning=$('#dwg-warning');if(warning)warning.textContent='Sheeting memakai foto aktual BMJ sebagai visual source of truth. Rollstand dikoreksi menjadi satu reel dengan pasangan arm kiri/kanan. Simulasi memakai material state: web kontinu → sheet terbentuk → guarded cross-cut → sheet lepas pada web speed → akselerasi gap → slow overlap/shingle → stack. Pisau internal tidak direka karena tidak terlihat pada unit BMJ.';
 }else if(IS_GENERIC){
  const m=GENERIC_CONFIG.machine,mark=$('.brandmark');if(mark)mark.innerHTML=String(m.no).padStart(2,'0');
  const icon=$('.asset-icon');if(icon)icon.textContent=String(m.no).padStart(2,'0');
  const warning=$('#dwg-warning');if(warning)warning.textContent='Posisi dan orientasi mesin ini pada plant belum diklaim sampai anchor layout aktual tervalidasi.';
 }
}
if(MACHINE_KEY)applyMachineShell();
const toast=(message,error=false)=>{clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.toggle('error',error);$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,error?9000:5000);};
function handleEngineError(message='Penampil 3D mengalami gangguan.'){
 console.error('[Digital Twin engine]',message);toast(message,true);
 document.body.classList.add('workspace-2d','webgl-unavailable');
 $('#mode-2d')?.classList.add('active');
 const three=$('#mode-3d');if(three){three.classList.remove('active');three.disabled=true;three.title='3D sedang dipulihkan';}
 $('#engine-status').textContent='Denah 2D aktif · navigasi tetap tersedia';
 emitDomainState({viewMode:'2d'});redrawPlantPlan();
}
function handleEngineRecovered(){
 document.body.classList.remove('webgl-unavailable');
 const three=$('#mode-3d');if(three){three.disabled=false;three.title='';}
 $('#engine-status').textContent='Penampil 3D siap kembali';
}
const safe=fn=>async(...args)=>{try{await fn(...args);}catch(e){console.error('[Digital Twin UI]',e);toast('Tindakan belum dapat dijalankan. Silakan coba kembali.',true);}};
const on=(id,fn)=>$(id)?.addEventListener('click',safe(fn));
const stopSimulationBeforeNavigation=()=>window.dispatchEvent(new CustomEvent('bmj:simulationstoprequest'));
function renderStaticMachineFallback(error){
 const viewport=$('#viewport');
 if(!viewport)return;
 if(IS_APM2){
  viewport.insertAdjacentHTML('beforeend',`<div class="static-machine-fallback" role="img" aria-label="Tampilan cadangan APM 2 BOBST SP 102"><svg viewBox="0 0 900 260" xmlns="http://www.w3.org/2000/svg"><style>.m{fill:#e9e6dc;stroke:#1f292d;stroke-width:2}.g{fill:#355e47}.d{fill:#30383b}.t{font:700 11px system-ui;text-anchor:middle;fill:#172126}.flow{fill:none;stroke:#c86c42;stroke-width:4;stroke-dasharray:10 7}</style><g><rect class="m" x="35" y="70" width="170" height="105" rx="8"/><rect class="g" x="35" y="155" width="170" height="20"/><text class="t" x="120" y="58">FEEDER</text><rect class="m" x="205" y="104" width="105" height="71" rx="5"/><text class="t" x="257" y="93">REGISTER / SIDELAY</text><rect class="m" x="310" y="58" width="190" height="117" rx="8"/><rect class="d" x="352" y="90" width="106" height="55" rx="4"/><text class="t" x="405" y="47">DIE-CUTTING PLATEN</text><rect class="m" x="500" y="72" width="145" height="103" rx="7"/><text class="t" x="572" y="60">STRIPPING</text><rect class="m" x="645" y="84" width="175" height="91" rx="7"/><text class="t" x="732" y="72">DELIVERY</text></g><path class="flow" d="M55 194H805"/><text class="t" x="430" y="224">Pile → Register → Gripper Chain → Platen → Stripping → Delivery</text></svg><p>Tampilan cadangan aktif. Struktur 6 tingkat, SideLay, platen, stripping, drive dan referensi APM 2 tetap dapat digunakan.</p></div>`);
 }else if(IS_OFFSET10){
  const modules=['PU1','PU2','CU1','Y1','PU4','PU5','PU6','PU7','PU8','PU9','PU10','PU11','CU2','Y2','PU14','CUF'];
  const blocks=modules.map((name,i)=>{
   const x=155+i*39,w=33,type=name.startsWith('PU')?'pu':name.startsWith('CU')?'coat':'dryer';
   const y=type==='dryer'?101:78,h=type==='dryer'?63:86;
   return `<g transform="translate(${x} 0)"><rect class="${type}" x="0" y="${y}" width="${w}" height="${h}" rx="5"/><text x="${w/2}" y="${y-6}">${name}</text></g>`;
  }).join('');
  viewport.insertAdjacentHTML('beforeend',`<div class="static-machine-fallback" role="img" aria-label="Tampilan cadangan Offset 10 CX104 dari feeder sampai X3 delivery"><svg viewBox="0 0 900 260" xmlns="http://www.w3.org/2000/svg"><style>.machine rect{fill:#e8edf0;stroke:#101820;stroke-width:1.5}.machine .coat{fill:#dce5e8}.machine .dryer{fill:#d9d4ec}.machine text{font:700 7px system-ui;text-anchor:middle;fill:#101820}.flow{fill:none;stroke:#e95718;stroke-width:4;stroke-dasharray:10 7}</style><g class="machine"><g transform="translate(28 0)"><path d="M0 164V92l48-30h66v102z" fill="#e8edf0" stroke="#101820" stroke-width="1.5"/><text x="57" y="54">FEEDER</text></g>${blocks}<g transform="translate(790 0)"><path d="M0 164V90l72-26 18 100z" fill="#e8edf0" stroke="#101820" stroke-width="1.5"/><text x="42" y="54">X3 DELIVERY</text></g></g><path class="flow" d="M42 184H860"/><text x="450" y="216" text-anchor="middle" font-family="system-ui" font-size="12" fill="currentColor">Feeder → PU1 → PU2 / FoilStar → CU/Y/PU line → Final CU → X3 Delivery</text></svg><p>Tampilan cadangan aktif karena akselerasi grafis 3D tidak tersedia pada browser ini. Struktur, taxonomy, dan referensi Offset 10 tetap dapat digunakan.</p></div>`);
 }else if(IS_SHEETING){
  viewport.insertAdjacentHTML('beforeend',`<div class="static-machine-fallback" role="img" aria-label="Tampilan cadangan SHEETING LEXUS HSM-CTM7"><svg viewBox="0 0 900 260" xmlns="http://www.w3.org/2000/svg"><style>.m{fill:#e7e8e3;stroke:#16302f;stroke-width:2}.t{fill:#16a596;stroke:#16302f;stroke-width:2}.d{fill:#263238}.p{fill:#eee7d4}.txt{font:700 10px system-ui;text-anchor:middle;fill:#132120}.flow{fill:none;stroke:#16a596;stroke-width:4;stroke-dasharray:10 7}</style><g><rect class="m" x="60" y="92" width="150" height="78" rx="8"/><rect class="p" x="75" y="110" width="118" height="43" rx="4"/><text class="txt" x="135" y="80">OUTPUT / STACKER</text><rect class="m" x="210" y="102" width="175" height="68" rx="7"/><text class="txt" x="297" y="90">DELIVERY / LAYBOY</text><rect class="t" x="385" y="60" width="195" height="110" rx="9"/><rect class="d" x="425" y="91" width="112" height="45" rx="4"/><text class="txt" x="482" y="48">COMPACT CROSS-CUTTER</text><rect class="m" x="580" y="105" width="135" height="65" rx="7"/><text class="txt" x="648" y="93">FEED / EPC</text><circle class="p" cx="790" cy="125" r="52"/><rect class="t" x="770" y="55" width="40" height="140" rx="5"/><text class="txt" x="790" y="43">INPUT REEL</text></g><path class="flow" d="M825 205H80"/><text class="txt" x="450" y="230">RIGHT → LEFT · Rollstand → Feed/Tension/EPC → Cutter → Delivery → Stack</text></svg><p>Tampilan cadangan Sheeting aktif. Orientasi proses tetap input kanan dan output kiri.</p></div>`);
 }else if(IS_GENERIC){
  const modules=GENERIC_CONFIG.modules;
  const blockWidth=Math.max(64,Math.min(112,760/modules.length));
  const start=(900-blockWidth*modules.length)/2;
  const blocks=modules.map((name,i)=>{const x=start+i*blockWidth,w=blockWidth-8,h=82+(i%3)*14,y=166-h;return `<g transform="translate(${x} 0)"><rect x="0" y="${y}" width="${w}" height="${h}" rx="7"/><rect class="dark" x="7" y="${y+15}" width="${Math.max(18,w-14)}" height="22" rx="3"/><text x="${w/2}" y="${y-8}">${esc(name.length>18?name.slice(0,16)+'…':name)}</text></g>`;}).join('');
  const flow=modules.map(esc).join(' → ');
  viewport.insertAdjacentHTML('beforeend',`<div class="static-machine-fallback" role="img" aria-label="Tampilan cadangan ${esc(GENERIC_CONFIG.machine.name)}"><svg viewBox="0 0 900 260" xmlns="http://www.w3.org/2000/svg"><style>.machine{fill:#e8edf0;stroke:#101820;stroke-width:2}.machine .dark{fill:#34424a}.machine text{font:700 9px system-ui;text-anchor:middle;fill:#101820;stroke:none}.flow{fill:none;stroke:#e95718;stroke-width:4;stroke-dasharray:10 7}</style><g class="machine">${blocks}</g><path class="flow" d="M55 190H845"/><text x="450" y="222" text-anchor="middle" font-family="system-ui" font-size="11" fill="currentColor">${flow}</text></svg><p>Tampilan cadangan ${esc(GENERIC_CONFIG.label)} aktif karena akselerasi grafis 3D tidak tersedia pada browser ini. Struktur dan informasi ${esc(GENERIC_CONFIG.machine.name)} tetap dapat digunakan.</p></div>`);
 }else if(MACHINE_KEY==='offset5'){
  const units=Array.from({length:8},(_,i)=>`<g transform="translate(${235+i*58} 0)"><rect x="0" y="78" width="50" height="86" rx="7"/><rect class="dark" x="5" y="91" width="40" height="28" rx="3"/><circle cx="17" cy="137" r="8"/><circle cx="34" cy="137" r="8"/><text x="25" y="72">PU${i+1}</text></g>`).join('');
  viewport.insertAdjacentHTML('beforeend',`<div class="static-machine-fallback" role="img" aria-label="Tampilan cadangan lengkap Offset 5 dari feeder sampai delivery"><svg viewBox="0 0 900 260" xmlns="http://www.w3.org/2000/svg"><style>.machine{fill:#e8edf0;stroke:#101820;stroke-width:2}.machine .dark{fill:#34424a}.machine text{font:700 10px system-ui;text-anchor:middle;fill:#101820;stroke:none}.flow{fill:none;stroke:#e95718;stroke-width:4;stroke-dasharray:10 7}</style><g class="machine"><g transform="translate(30 0)"><path d="M0 164V92l48-30h62v102z"/><rect class="dark" x="57" y="80" width="44" height="34" rx="3"/><text x="55" y="54">FEEDER</text></g><g transform="translate(145 0)"><path d="M0 164V125h82v39z"/><path class="dark" d="M8 126l65-25v18L8 144z"/><text x="40" y="96">REGISTER</text></g>${units}<g transform="translate(704 0)"><rect x="0" y="70" width="58" height="94" rx="8"/><rect class="dark" x="7" y="86" width="44" height="32" rx="3"/><text x="29" y="62">COATER</text></g><g transform="translate(770 0)"><path d="M0 164V98l82-32 18 98z"/><rect class="dark" x="18" y="103" width="58" height="33" rx="3"/><text x="48" y="55">DELIVERY</text></g></g><path class="flow" d="M45 183H845"/><text x="450" y="214" text-anchor="middle" font-family="system-ui" font-size="13" fill="currentColor">Feeder → Register → PU1–PU8 → Coating → Delivery</text></svg><p>Tampilan cadangan aktif karena akselerasi grafis 3D tidak tersedia pada browser ini. Struktur dan informasi mesin tetap dapat digunakan.</p></div>`);
 }else{
  viewport.insertAdjacentHTML('beforeend',`<div class="static-machine-fallback factory-fallback" role="status" aria-label="Denah pabrik tersedia dalam mode 2D"><div class="static-factory-fallback-copy"><strong>Penampil 3D belum tersedia</strong><p>Belum ada mesin detail yang dipilih. Gunakan denah 2D atau menu Mesin untuk memilih aset tanpa mengasumsikan Offset 5 sebagai konteks aktif.</p></div></div>`);
 }
 $('#boot').hidden=true;
 $('#engine-status').textContent='Tampilan cadangan siap';
 console.warn('Fallback mesin aktif:',error?.message||error);
}
let modalBackHandler=null;
function modal(title,html,{back=null}={}){
 modalBackHandler=typeof back==='function'?back:null;
 const backButton=$('#modal-back');if(backButton)backButton.hidden=!modalBackHandler;
 $('#modal-title').textContent=title;$('#modal-body').innerHTML=html;
 dispatchEvent(new CustomEvent('bmj:modalopenrequest'));
 if(!$('#modal').open)$('#modal').showModal();
}
function goModalBack(){const back=modalBackHandler;if(back){modalBackHandler=null;back();return;}closeModal();}
function closeModal(){modalBackHandler=null;const backButton=$('#modal-back');if(backButton)backButton.hidden=true;const dialog=$('#modal');if(dialog?.open)dialog.close();dispatchEvent(new CustomEvent('bmj:modalcloserequest'));}
function emitDomainState(detail){return setDomainState(detail);}
function signalAppReady(status='ready'){
 const normalized=status==='error'?'error':'ready';
 setAppBoot(normalized,normalized==='error'?'Aplikasi gagal dimuat.':null);
 document.documentElement.dataset.appReady=normalized;
}
function showPanel(){setAppInspector(true,activeInspectorTab());}
const activeLayout=()=>selectPlantLayout(state.layout,bundledLayout);
function redrawPlantPlan(selectedAsset=getAppState().selectedAsset||null){
 if(!bundledLayout)return;
 const selectedMachineId=selectedAsset?(machineRecordForRoute(selectedAsset)?.machineId||selectedAsset):null;
 drawPlantPlan($('#dwg-canvas'),bundledLayout,{selectedAsset:selectedMachineId});
 const context=$('#dwg-context'),machine=selectedMachineId?MACHINE_REGISTRY_BY_ID.get(selectedMachineId):null;
 if(context)context.textContent=machine?'Pilihan aktif · '+machine.name:'Sumber layout aktual';
}
function pair(label,value){return `<dt>${esc(label)}</dt><dd${value==null?' class="unknown"':''}>${esc(value)}</dd>`;}
const exteriorAreas=()=>IS_APM2?[
 {key:'feeder',name:'Feeder / Sheet Separation',ids:['apm2-feeder']},
 {key:'register',name:'Register / SideLay',ids:['apm2-register']},
 {key:'transport',name:'Gripper Chain Transport',ids:['apm2-transport']},
 {key:'platen',name:'Die-Cutting Platen',ids:['apm2-platen']},
 {key:'stripping',name:'Stripping Station',ids:['apm2-stripping']},
 {key:'delivery',name:'Delivery',ids:['apm2-delivery']},
 {key:'drive',name:'Main Drive / Transmission',ids:['apm2-drive']},
 {key:'control',name:'Controls / Electrical',ids:['apm2-control']},
 {key:'safety',name:'Safety / Guards',ids:['apm2-safety']}
]:IS_OFFSET10?[
 {key:'feeder',name:'Preset Plus Feeder',ids:['o10-feeder','o10-feedboard']},
 ...['PU1','PU2','PU4','PU5','PU6','PU7','PU8','PU9','PU10','PU11','PU14'].map(key=>({key:key.toLowerCase(),name:key.replace('PU','Printing Unit '),ids:['o10-'+key.toLowerCase()]})),
 {key:'foil',name:'FoilStar Gen.3',ids:['o10-foilstar']},
 {key:'coat',name:'Coating Units',ids:['o10-coating-units']},
 {key:'uv',name:'UV / Drying System',ids:['o10-uv-system','o10-eop-uv']},
 {key:'delivery',name:'Preset Plus X3 Delivery',ids:['o10-delivery']},
 {key:'access',name:'Platform / Walkway / Akses',ids:['o10-platform']},
 {key:'aux',name:'Peripheral / Utility',ids:['o10-peripherals','o10-prinect-center']}
]:IS_SHEETING?[
 {key:'rollstand',name:'Low Two-Sided Rollstand',ids:['sheeting-rollstand']},
 {key:'feed',name:'Inclined Guide / Tension / EPC',ids:['sheeting-feed']},
 {key:'cutter',name:'Main Head / Cut Zone',ids:['sheeting-cutter','sheeting-window','sheeting-main-rollers','sheeting-knife','sheeting-cutter-transport']},
 {key:'delivery',name:'Fast / Slow / Overlap / Stacker',ids:['sheeting-delivery','sheeting-fast-belts','sheeting-slow-belts','sheeting-overlap-belts','sheeting-overlap','sheeting-layboy','sheeting-stacker-joggers']},
 {key:'control',name:'Control / Electrical / Hydraulic',ids:['sheeting-control']},
 {key:'access',name:'Catwalk / Structure',ids:['sheeting-access','sheeting-structure']}
]:IS_GENERIC?GENERIC_TAXONOMY.filter(n=>n.level===2).map((n,i)=>({key:`registry-${i+1}`,name:n.name,ids:n.meshRefs||[]})):[
 {key:'feeder',name:'Feeder',ids:['feeder']},
 {key:'register',name:'Register / Feed Table',ids:['feed-board']},
 ...Array.from({length:8},(_,i)=>({key:'pu'+(i+1),name:'Printing Unit '+(i+1),ids:[`press-${i+1}`]})),
 {key:'coater',name:'Coating Unit',ids:['coater']},
 {key:'dryer',name:'Dryer / Extension',ids:['dryer-extension']},
 {key:'inspection',name:'Inline Inspection',ids:['inspection-bridge']},
 {key:'delivery',name:'Delivery',ids:['delivery']},
 {key:'access',name:'Platform / Walkway / Akses',ids:['platform','drive-utilities','pu8-coater-access','coater-dryer-service-bay','dryer-delivery-access']}
];
const exteriorAreaNodes=area=>area?.ids.map(id=>engine?.template.findNode(id)).filter(Boolean)||[];
function enableExteriorOpen({forceDetail=true}={}){
 if(!engine)return false;
 if(!isInteriorOpen()){exteriorPreviousLow=engine.qualityProfile;setDomainState({inspectionMode:{interior:true}});}
 engine.template.reset();engine.clearPartLabels();setDomainState({inspectionMode:{isolate:false}});engine.isolated=false;if(forceDetail&&!engine.mobileRender)engine.applyQualityProfile(engine.qualityProfile==='hemat'?'seimbang':engine.qualityProfile);engine.template.setExteriorOpen(true);
 selectedPart=null;setExplodeLevel(0);return true;
}
function exitExteriorMode(){
 if(isInteriorOpen()&&engine){
  engine.template.setExteriorOpen(false);engine.template.reset();engine.clearPartLabels();engine.isolated=false;
  if(exteriorPreviousLow!==null)engine.applyQualityProfile(exteriorPreviousLow);
 }
 setDomainState({inspectionMode:{interior:false}});exteriorPreviousLow=null;setDomainState({inspectionMode:{interiorFocus:null}});
}
function showExteriorAll(){
 if(!enableExteriorOpen())return;
 setDomainState({inspectionMode:{interiorFocus:null}});setActiveTaxonomyId(ACTIVE_ROOT);engine.fit(engine.machine);renderPanel('exterior');
}
function focusExteriorArea(key){
 if(!engine)return;
 const area=exteriorAreas().find(item=>item.key===key),parts=exteriorAreaNodes(area);if(!area||!parts.length)return;
 if(!enableExteriorOpen())return;
 setDomainState({inspectionMode:{interiorFocus:key}});engine.fitObjects(parts);renderPanel('exterior');
}
function resetExteriorView(){
 if(!engine)return;exitExteriorMode();engine.fit(engine.machine);selectedPart=null;setActiveTaxonomyId(ACTIVE_ROOT);setExplodeLevel(0);renderPanel('exterior');
}
function commitSimulationState(next=currentSimulationState()){
 const raw=next||{},active=!!raw.active,running=!!raw.running,progress=Math.max(0,Math.min(1,Number(raw.progress)||0));
 const normalized={...currentSimulationState(),...raw,available:raw.available!==false&&!raw.blocked,blocked:!!raw.blocked,blockedReason:raw.blockedReason||null,active,running,stage:raw.stage||null,speed:Number(raw.speed)||1,progress};
 setAppSimulation(normalized);return normalized;
}
function updateSimulationPanel(next=currentSimulationState()){
 const simulation=commitSimulationState(next),running=simulation.running,active=simulation.active,progress=Math.round(simulation.progress*100);
 const status=$('#sim-status'),stage=$('#sim-stage'),count=$('#sim-completed'),visible=$('#sim-visible'),pile=$('#sim-pile'),bar=$('#sim-progress-bar'),pause=$('#sim-pause'),start=$('#sim-start'),uv=$('#sim-uv-state'),uvCount=$('#sim-uv-count'),uvIndicator=$('#sim-uv-indicator');
 if(status)status.textContent=simulation.blocked?'TIDAK TERSEDIA':running?'RUNNING':active?'PAUSED':'READY';
 if(stage)stage.textContent=simulation.stage||'Siap';
 if(count)count.textContent=String(simulation.completed||0);
 if(visible)visible.textContent=String(simulation.sheetsVisible||0);
 if(pile)pile.textContent=String(simulation.pileSheetsVisible||0);
 if(uv){uv.textContent=simulation.uvActive?'AKTIF':'STANDBY';uv.classList.toggle('active',!!simulation.uvActive);}
 if(uvCount)uvCount.textContent=String(simulation.uvLampCount||0);
 if(uvIndicator)uvIndicator.classList.toggle('active',!!simulation.uvActive);
 if(bar)bar.style.width=progress+'%';
 if(start)start.textContent=active?(running?'Running':'Lanjutkan'):(IS_APM2?'Mulai Simulasi Proses':IS_SHEETING?'Mulai Simulasi Sheeting':'Mulai Simulasi Proses');
 if(pause){pause.textContent=running?'Pause':'Lanjut';pause.disabled=!active;pause.setAttribute('aria-disabled',active?'false':'true');}
 document.querySelectorAll('[data-sim-speed]').forEach(b=>b.classList.toggle('active',Math.abs(+b.dataset.simSpeed-(simulation.speed||1))<.01));
 document.querySelectorAll('[data-sim-stage]').forEach(b=>b.classList.toggle('active',b.dataset.simStage===(simulation.stage||'')));
 return simulation;
}
function startPrintingSimulation(){
 if(!engine){toast('Simulasi 3D memerlukan WebGL di perangkat ini.',true);return;}
 if(!ensureMachineInspectionContext('Simulasi'))return;
 if(!engine.isPrintingSimulationActive()){
  const readiness=engine.getPrintingSimulationState?.()||currentSimulationState();
  if(readiness?.blocked||readiness?.available===false){toast(readiness?.blockedReason||'Simulasi proses untuk aset ini belum tersedia.',true);updateSimulationPanel(readiness);return;}
  simulationOwnsExterior=!isInteriorOpen();
  enableExteriorOpen({forceDetail:false});
  engine.template.ghost(false);engine.isolated=false;engine.clearPartLabels();selectedPart=null;setActiveTaxonomyId(ACTIVE_ROOT);setExplodeLevel(0);
  updateSimulationPanel(engine.startPrintingSimulation());
  engine.fit(engine.machine);
 }else updateSimulationPanel(engine.resumePrintingSimulation());
 renderPanel('simulation');
}
function pausePrintingSimulation(){
 if(!engine?.isPrintingSimulationActive())return;
 const simulation=currentSimulationState();
 updateSimulationPanel(simulation.running?engine.pausePrintingSimulation():engine.resumePrintingSimulation());
}
function stopPrintingSimulation({restoreExterior=true}={}){
 if(!engine)return;
 const next=engine.stopPrintingSimulation();
 if(restoreExterior&&simulationOwnsExterior)exitExteriorMode();
 simulationOwnsExterior=false;updateSimulationPanel(next);
 if(activeInspectorTab()==='simulation')renderPanel('simulation');
}
window.addEventListener('bmj:simulationstoprequest',()=>{if(engine?.isPrintingSimulationActive?.()||currentSimulationState().active)stopPrintingSimulation({restoreExterior:true});});
window.addEventListener('bmj:simulationcommand',event=>{
 const action=event.detail?.action,value=event.detail?.value;
 if(action==='toggle'){if(engine?.isPrintingSimulationActive?.()||currentSimulationState().active)pausePrintingSimulation();else startPrintingSimulation();return;}
 if(action==='stop'){stopPrintingSimulation({restoreExterior:true});return;}
 if(action==='speed')updateSimulationPanel(engine?.setPrintingSimulationSpeed?.(+value)||currentSimulationState());
});
function simulationLocksStructure(){
  if(engine?.isPrintingSimulationActive()){toast(IS_APM2?'Hentikan simulasi proses APM 2 sebelum memilih, mengurai, atau mengisolasi komponen.':IS_VERIFIED_REGISTRY_SIM?'Hentikan simulasi proses sebelum memilih, mengurai, atau mengisolasi komponen.':'Hentikan Simulasi Proses sebelum memilih, mengurai, atau mengisolasi komponen.');return true;}
 return false;
}
function activeMachineAssetId(){return machineRecordForRoute(MACHINE_KEY)?.machineId||getAppState().selectedAsset||MACHINE_KEY;}
function choosePart(part){if(!part||!engine||simulationLocksStructure())return;engine.template.reset();setDomainState({inspectionMode:{isolate:false}});engine.isolated=false;setExplodeLevel(0);selectedPart=part;engine.template.highlight(part);engine.template.ghost(true,part);engine.setPartLabels(part,activeTaxonomyId());engine.fit(part);const meta=taxonomyForPart(part);emitDomainState({selectedAsset:activeMachineAssetId(),selectedNode:meta?.id||part.userData?.nodeId||activeTaxonomyId(),inspectorState:{open:true,tab:'structure'}});}
function taxonomyForPart(part){const id=part?.userData?.nodeId;if(!id)return null;return ACTIVE_TAXONOMY.filter(n=>(n.meshRefs||[]).includes(id)).sort((a,b)=>Math.abs(a.level-5)-Math.abs(b.level-5))[0]||null;}
function taxonomyPath(id=activeTaxonomyId()){
 const path=[];let meta=TAXONOMY_BY_ID.get(id)||TAXONOMY_BY_ID.get(ACTIVE_ROOT),guard=0;
 while(meta&&guard++<8){path.unshift(meta);meta=meta.parentId?TAXONOMY_BY_ID.get(meta.parentId):null;}
 return path;
}
function referenceKind(source){
 const text=[source?.type,source?.title,source?.file,source?.localFile].filter(Boolean).join(' ').toLowerCase();
 if(/manual|procedure|service manual|operating manual/.test(text))return'manual';
 if(/drawing|layout|system diagram|preinstall|pre-install|technical data/.test(text))return'drawing';
 if(/database|evidence|user[_ -]?supplied|user[_ -]?provided|user[_ -]?evidence|source ledger/.test(text))return'evidence';
 return'document';
}
function referenceContextTokens(){
 const path=taxonomyPath();if(path.length<=1)return[];
 const stop=new Set(['mesin','machine','unit','utama','main','system','sistem','part','spesifik','specific','assembly','offset','reference','referensi','component','komponen']);
 const tokens=[];
 for(const node of path.slice(-3)){
  const raw=[node.name,node.description,node.levelName].filter(Boolean).join(' ').toLowerCase();
  for(const token of raw.split(/[^a-z0-9]+/).filter(Boolean))if(token.length>=4&&!stop.has(token)&&!tokens.includes(token))tokens.push(token);
 }
 return tokens.slice(0,18);
}
function contextualReferenceData(){
 const tokens=referenceContextTokens(),activeReference=getAppState().activeReference||null;
 const score=text=>tokens.reduce((sum,token)=>sum+(String(text||'').toLowerCase().includes(token)?1:0),0);
 const technical=TECHNICAL_SOURCES.map((source,index)=>{
  const support=Array.isArray(source.supports)?source.supports.join(' '):'',text=[source.title,source.publisher,source.type,source.note,support,source.file,source.localFile].filter(Boolean).join(' ');
  return{kind:referenceKind(source),source,index,score:score(text),active:source.id===activeReference};
 }).sort((a,b)=>b.score-a.score||a.index-b.index);
 const photos=PHOTO_REGISTRY.map((photo,index)=>({kind:'photo',photo,index,score:score([photo.filename,photo.machineZone,photo.viewDirection,photo.category].join(' ')),active:photo.id===activeReference})).sort((a,b)=>b.score-a.score||a.index-b.index);
 return{tokens,technical,photos,activeReference};
}
function renderReferencePanel(){
 const runtimeOrientation=engine?.template?.root?.userData?.orientation||ORIENTATION,flow=runtimeOrientation.feedDirection||runtimeOrientation.sheetFlow||runtimeOrientation.processFlow||'Arah proses mengikuti model referensi',op=runtimeOrientation.operatorSide||'Belum terverifikasi',ds=runtimeOrientation.driveSide||runtimeOrientation.gearSide||'Belum terverifikasi';
 const context=contextualReferenceData(),path=taxonomyPath(),selectedMeta=path.at(-1),all=[...context.photos,...context.technical],counts={all:all.length,photo:context.photos.length,document:0,manual:0,drawing:0,evidence:0};for(const item of context.technical)counts[item.kind]=(counts[item.kind]||0)+1;
 const filtered=referenceFilter()==='all'?all:all.filter(item=>item.kind===referenceFilter()),priorityCount=filtered.filter(item=>item.score>0).length;
 const contextLabel=selectedMeta&&selectedMeta.id!==ACTIVE_ROOT?selectedMeta.name:(IS_GENERIC?GENERIC_CONFIG.machine.name:state?.asset?.description||'Mesin aktif');
 const intro=IS_OFFSET10?'Model Offset 10 dibangun dari final drawing, proposal, layout UV, pre-installation, system diagram, technical data final, serta referensi resmi Heidelberg CX 104 dan FoilStar.':IS_APM2?'Identitas APM 2 berasal dari database BMJ; referensi SP 102 digunakan sesuai evidence boundary.':IS_SHEETING?'Identitas HSM-CTM7 berasal dari database BMJ; referensi HSM 56 dan referensi proses dipisahkan dari klaim bentuk exact.':IS_GENERIC?'Referensi mengikuti evidence map mesin aktif; detail khusus serial yang belum tersedia tetap dibatasi.':'Foto aktual dan dokumen CD102 diprioritaskan berdasarkan komponen yang sedang dipilih.';
 const filters=[['all','Semua'],['photo','Foto'],['document','Dokumen'],['manual','Manual'],['drawing','Gambar / Denah'],['evidence','Bukti / Sumber']];
 const cards=filtered.map(item=>{
  if(item.kind==='photo'){const p=item.photo;return `<article class="context-reference-card ${item.score>0?'is-priority':''} ${item.active?'is-active':''}" data-reference-card="${esc(p.id)}" tabindex="0" role="button" aria-pressed="${item.active?'true':'false'}" aria-label="Pilih referensi foto ${esc(p.filename)}"><header><span class="reference-kind">Foto</span>${item.score>0?'<em>Relevan ke konteks</em>':''}</header><h4>${esc(p.filename)}</h4><p>${esc(p.machineZone)} · ${esc(p.viewDirection)}</p><div class="reference-truth-row"><span>Confidence</span><strong>${esc(truthStatus(p.confidence,'UNVERIFIED'))}</strong></div><small>${esc(p.category||'Foto aktual')}</small></article>`;}
  const src=item.source,file=src.file||src.localFile||null,label=item.kind==='manual'?'Manual':item.kind==='drawing'?'Gambar / Denah':item.kind==='evidence'?'Bukti / Sumber':'Dokumen';
  return `<article class="context-reference-card ${item.score>0?'is-priority':''} ${item.active?'is-active':''}" data-reference-card="${esc(src.id||'source-'+item.index)}" tabindex="0" role="button" aria-pressed="${item.active?'true':'false'}" aria-label="Pilih referensi ${esc(src.title)}"><header><span class="reference-kind">${label}</span>${item.score>0?'<em>Relevan ke konteks</em>':''}</header><h4>${esc(src.title)}</h4><p>${esc(src.publisher||'Sumber teknis')}</p><div class="reference-truth-row"><span>Confidence</span><strong>${esc(truthStatus(src.confidence,'UNVERIFIED'))}</strong></div>${Array.isArray(src.supports)&&src.supports.length?`<small>${src.supports.length} fakta/fitur didukung</small>`:''}${file?`<small>${esc(file)}</small>`:''}${src.url?`<a href="${esc(src.url)}" target="_blank" rel="noopener">Buka sumber ↗</a>`:''}</article>`;
 }).join('');
 $('#panel-content').innerHTML=`<h3>Referensi</h3><div class="card accent reference-context-summary"><h4>Konteks: ${esc(contextLabel)}</h4><p>${esc(intro)}</p><span class="tag">${priorityCount?priorityCount+' sumber diprioritaskan':'Sumber mesin aktif'}</span><span class="tag">${all.length} total referensi</span></div><div class="reference-filter-strip">${filters.map(([key,label])=>`<button type="button" data-reference-filter="${key}" class="${referenceFilter()===key?'active':''}">${label}<small>${counts[key]||0}</small></button>`).join('')}</div><div class="context-reference-list">${cards||'<p class="empty">Tidak ada referensi pada kategori ini.</p>'}</div><div class="card"><h4>Arah mesin</h4><p>${esc(flow)} · sisi operator ${esc(op)} · sisi penggerak ${esc(ds)}</p></div><p class="subtle">Prioritas hanya diberikan bila istilah pada struktur terpilih benar-benar ditemukan pada keterangan sumber. Sumber lain tetap tersedia sebagai konteks mesin dan tidak dianggap sebagai bukti langsung komponen.</p>`;
 $$('[data-reference-filter]').forEach(button=>button.onclick=()=>{setReferenceFilter(button.dataset.referenceFilter);renderReferencePanel();});
 const activateReferenceCard=card=>{emitDomainState({activeReference:card.dataset.referenceCard,activeSection:'reference'});$$('[data-reference-card]').forEach(x=>{const active=x===card;x.classList.toggle('is-active',active);x.setAttribute('aria-pressed',String(active));});};
 $$('[data-reference-card]').forEach(card=>{
  card.onclick=event=>{if(event.target.closest('a'))return;activateReferenceCard(card)};
  card.onkeydown=event=>{if(event.target.closest('a'))return;if(event.key==='Enter'||event.key===' '){event.preventDefault();activateReferenceCard(card)}};
 });
}
function pushMachineContextHistory(node=null,{replace=false}={}){
 const appState=getAppState()||{},asset=activeMachineAssetId(),camera=appState.cameraPreset==='top'?'top':'iso';
 const args={asset,node:node&&node!==ACTIVE_ROOT?node:null,scene:'machine',view:currentViewMode(),camera};
 if(replace){history.replaceState(args,'',buildContextUrl(args));return false;}
 return pushContextHistory(args);
}
function resetTaxonomyRoot({historyMode='none'}={}){
 setActiveTaxonomyId(ACTIVE_ROOT);selectedPart=null;setExplodeLevel(0);
 if(engine){engine.template.reset();engine.clearPartLabels();engine.isolated=false;engine.fit(engine.machine);}
 $('#tool-explode')?.classList.remove('active');$('#tool-isolate')?.classList.remove('active');
 emitDomainState({selectedAsset:activeMachineAssetId(),selectedNode:null,inspectionMode:{explode:false,isolate:false},inspectorState:{open:true,tab:'overview'}});
 if(historyMode==='push')pushMachineContextHistory(null);
 renderPanel('overview');
}
function renderContextBreadcrumb(){
 const host=$('#context-breadcrumb');if(!host)return;
 if(engine?.view==='factory'){
  const selected=getAppState().selectedAsset,record=machineRecordForRoute(selected);
  host.innerHTML=record?'<button type="button" data-breadcrumb-factory>Pabrik</button><span aria-hidden="true">/</span><button type="button" aria-current="page">'+esc(record.name)+'</button>':'<button type="button" data-breadcrumb-factory aria-current="page">Pabrik</button>';
 }else{
  const path=taxonomyPath();
  host.innerHTML='<button type="button" data-breadcrumb-factory>Pabrik</button>'+path.map((node,index)=>`<span aria-hidden="true">/</span><button type="button" data-breadcrumb-node="${esc(node.id)}" ${index===path.length-1?'aria-current="page"':''}>${esc(node.name)}</button>`).join('');
 }
 host.querySelector('[data-breadcrumb-factory]')?.addEventListener('click',()=>{showHome({historyMode:'push'});renderContextBreadcrumb();});
 host.querySelectorAll('[data-breadcrumb-node]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.breadcrumbNode;if(id===ACTIVE_ROOT)resetTaxonomyRoot({historyMode:'push'});else selectTaxonomy(id,{revealPanel:true,historyMode:'push'});}));
}
function taxonomyAtLevel(level){
 const target=Math.max(1,Math.min(6,Number(level)||1));let meta=TAXONOMY_BY_ID.get(activeTaxonomyId())||TAXONOMY_BY_ID.get(ACTIVE_ROOT);
 while(meta&&meta.level>target)meta=meta.parentId?TAXONOMY_BY_ID.get(meta.parentId):meta;
 while(meta&&meta.level<target){const children=taxonomyChildren(meta.id);if(!children.length)return null;meta=children.find(n=>(n.meshRefs||[]).length)||children[0];}
 return meta?.level===target?meta:null;
}
function selectTaxonomy(id,{revealPanel=false,historyMode='none'}={}){
 if(simulationLocksStructure())return;const meta=TAXONOMY_BY_ID.get(id);if(!meta)return;
 setActiveTaxonomyId(meta.id);const part=engine?.template.resolveTaxonomyNode(meta.id);
 if(part)choosePart(part);else{selectedPart=null;engine?.template.reset();engine?.clearPartLabels();emitDomainState({selectedAsset:activeMachineAssetId(),selectedNode:meta.id,inspectorState:{open:true,tab:'structure'}});}
 if(historyMode==='push')pushMachineContextHistory(meta.id);
 if(revealPanel)showPanel();
 renderPanel('structure');
}
function navigateContextParent(){
 const appState=getAppState()||{},node=appState.selectedNode&&appState.selectedNode!==ACTIVE_ROOT?appState.selectedNode:null;
 if(appState.sceneMode==='machine'){
  if(node){
   const meta=TAXONOMY_BY_ID.get(node),parent=meta?.parentId;
   if(parent&&parent!==ACTIVE_ROOT){selectTaxonomy(parent,{revealPanel:true,historyMode:'push'});return;}
   resetTaxonomyRoot({historyMode:'push'});showPanel();return;
  }
  const record=machineRecordForRoute(appState.selectedAsset||MACHINE_KEY);
  if(record){selectFactoryAssetContext(record,{historyMode:'push',openDialog:true,focus:true});return;}
 }
 if(appState.selectedAsset){showHome({historyMode:'push'});return;}
 setAppInspector(false,'overview');
}
function taxonomyTree(parentId=ACTIVE_ROOT){
 const children=taxonomyChildren(parentId),selectedPath=new Set(taxonomyPath().map(node=>node.id));
 return children.map(n=>{
  const descendants=taxonomyChildren(n.id);
  const mapped=!!engine?.template.resolveTaxonomyNode(n.id);
  return `<div class="geometry-node"><button data-taxonomy="${esc(n.id)}" aria-pressed="${n.id===activeTaxonomyId()}"><span class="taxonomy-copy"><strong>${esc(n.name)}</strong><small>${esc(n.levelName||'Struktur')} · L${n.level}</small></span><span class="tax-level">${mapped?'Model 3D':'Referensi'}</span></button>${descendants.length?`<details ${selectedPath.has(n.id)?'open':''}><summary>${esc(n.levelName||'Struktur')}</summary>${taxonomyTree(n.id)}</details>`:''}</div>`;
 }).join('');
}
function renderFactoryPanel(){
 const layout=activeLayout(),layers=engine?.actualFactory?.layers;if(!layout?.placements||!layers)return false;
 const selectedAsset=getAppState().selectedAsset;
 const selectedMachine=selectedAsset?MACHINE_REGISTRY_BY_ID.get(selectedAsset):null;
 if(selectedMachine)return machineDetailDialog(selectedMachine);
 const known=layout.placements.filter(p=>p.status!=='UNIDENTIFIED'),unknown=layout.placements.filter(p=>p.status==='UNIDENTIFIED');
 const layerItems=[['roof','Atap'],['building','Bangunan & ruang'],['machines','Posisi aset'],['labels','Nama area & aset'],['unidentified','Area belum teridentifikasi'],['reference','Garis denah sumber']];
 $('#panel-content').innerHTML=`<h3>Denah pabrik</h3><p class="subtle">${known.length} posisi terpetakan · ${unknown.length} menunggu identifikasi posisi.</p><div class="card">${layerItems.map(([key,text])=>`<label class="check"><input type="checkbox" data-factory-layer="${key}" ${layers[key].visible?'checked':''}> ${text}</label>`).join('')}</div><label for="factory-asset-focus">Cari posisi aset</label><select id="factory-asset-focus"><option value="">Pilih posisi</option>${layout.placements.map(p=>`<option value="${p.machineId}">${esc(p.label)}${p.status==='UNIDENTIFIED'?' · belum teridentifikasi':''}</option>`).join('')}</select><div class="actions"><button id="factory-overview" class="secondary">Lihat seluruh pabrik</button><button id="factory-unknown" class="secondary">Posisi belum teridentifikasi</button></div><div class="card accent"><h4>Scope berbasis bukti</h4><p>Scene mempertahankan layout DWG dan semua posisi aset yang dapat diidentifikasi. Model 3D mengikuti aset yang dipilih; ketelitian tiap model mengikuti sumber yang tersedia. Sistem utilitas tersedia sebagai konteks pabrik dengan status sumber yang eksplisit; jalur yang belum diverifikasi tidak diperlakukan sebagai as-built.</p></div><div class="card"><h4>Ketelitian tampilan</h4><p>Fidelity DWG, konflik unit/scale, geometri belum diimplementasikan, dan batas sumber dapat diperiksa dari Denah Pabrik → Fidelity DWG. Nilai yang belum didukung sumber tetap ditandai UNKNOWN, APPROXIMATE, UNVERIFIED, atau CONFLICTING.</p></div>`;
 const canonicalFactoryLayer={roof:'roof',building:'building',machines:'machines',labels:'labels',unidentified:'unidentified',reference:'reference'};
 $$('[data-factory-layer]').forEach(input=>input.onchange=()=>{const key=input.dataset.factoryLayer,visible=input.checked;engine.setFactoryLayer(key,visible);const canonical=canonicalFactoryLayer[key];if(canonical)emitDomainState({visibleLayers:{[canonical]:visible}});});
 $('#factory-asset-focus').onchange=e=>{if(e.target.value){const p=layout.placements.find(p=>p.machineId===e.target.value),m=MACHINE_REGISTRY_BY_ID.get(e.target.value);engine.setFactoryLayer(p.status==='UNIDENTIFIED'?'unidentified':'machines',true);if(m)selectFactoryAssetContext(m,{historyMode:'none',openDialog:true,focus:true});else engine.focusFactoryAsset(e.target.value);}};
 $('#factory-overview').onclick=()=>showHome({historyMode:'push'});$('#factory-unknown').onclick=()=>{engine.clearFactorySelection();engine.setFactoryLayer('unidentified',true);engine.fit(layers.unidentified);};return true;
}
function renderPanel(tab=activeInspectorTab()){
 if(editing&&engine){engine.edit(false);engine.onTransform=null;engine.applyPlacement(state);editing=false;}
 setDomainState({inspectorState:{tab}});renderContextBreadcrumb();
 if(engine?.view==='factory'&&renderFactoryPanel())return;
 $$('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===tab)));
 const a=state.asset;
 if(tab==='overview'){
  const envelope=engine?.template?.root?.userData?.machineEnvelope;
  if(IS_OFFSET10){
   const v=envelope?.verified||{},audit=engine?.template?.root?.userData?.dimensionAudit||{};
   const serviceText=Number.isFinite(v.serviceEnvelopeLength)&&Number.isFinite(v.serviceEnvelopeWidth)?`${v.serviceEnvelopeLength.toLocaleString('id-ID',{maximumFractionDigits:3})} × ${v.serviceEnvelopeWidth.toLocaleString('id-ID',{maximumFractionDigits:3})} m`:'Belum tersedia';
   const pitchText=Number.isFinite(v.modulePitch)?`${v.modulePitch.toLocaleString('id-ID',{minimumFractionDigits:3,maximumFractionDigits:3})} m`:'Belum tersedia';
   const baseText=Number.isFinite(v.baseReferenceLength)?`${v.baseReferenceLength.toLocaleString('id-ID',{minimumFractionDigits:3,maximumFractionDigits:3})} m`:'Belum tersedia';
   $('#panel-content').innerHTML=`<h3>Informasi mesin</h3><dl class="data-list">${pair('Kode aset',a.asset_code)+pair('Pabrikan',a.manufacturer)+pair('Model',a.model)+pair('Kategori','Mesin produksi')+pair('Spesifikasi',a.specification)+pair('Status operasi',null)}</dl><h3>Model 3D</h3><div class="card accent"><h4>Rekonstruksi berbasis dokumen proyek + referensi resmi Heidelberg</h4><p>Tidak ada foto aktual Offset 10 yang tersedia. Bentuk dan susunan mesin dibangun dari final drawing BMJ, proposal Heidelberg, layout UV, technical data, serta referensi resmi CX 104 dan FoilStar. Bagian yang tidak didukung sumber tidak diperlakukan sebagai ukuran servis OEM.</p><span class="tag">FINAL DRAWING</span><span class="tag">PROPOSAL HEIDELBERG</span><span class="tag">REFERENSI RESMI</span></div><dl class="data-list">${pair('Panjang acuan press base',baseText)+pair('Service envelope',serviceText)+pair('Pitch modul',pitchText)+pair('Susunan utama','11 printing · 3 coating · 2 Y/UV · FoilStar PU2 · X3 delivery')+pair('Elevasi',Number.isFinite(v.pressElevation)?Math.round(v.pressElevation*1000)+' mm':'Belum tersedia')+pair('Kecepatan maksimum',Number.isFinite(v.maxSpeedSph)?v.maxSpeedSph.toLocaleString('id-ID')+' sheets/jam':'Belum tersedia')+pair('Berat mesin',Number.isFinite(v.machineOnlyWeightKg)?v.machineOnlyWeightKg.toLocaleString('id-ID')+' kg':'Belum tersedia')+pair('Referensi',TECHNICAL_SOURCES.length+' sumber')}</dl><div class="card"><h4>Batas ketelitian</h4><p>Pitch, envelope, konfigurasi, elevasi, UV, FoilStar dan data utilitas mengikuti dokumen proyek. Profil cover dan routing mekanisme yang tidak diberi dimensi lengkap adalah rekonstruksi visual yang disesuaikan agar tidak saling menembus dan tetap konsisten dengan arsitektur CX 104.</p></div>`;
  }else if(IS_APM2){
   const v=envelope?.verified||{},f=envelope?.familyReference||{},d=envelope?.layout||{};
   const bodyText=[d.bodyLength,d.bodyWidth,d.bodyHeight].every(Number.isFinite)?`${d.bodyLength.toLocaleString('id-ID',{maximumFractionDigits:2})} × ${d.bodyWidth.toLocaleString('id-ID',{maximumFractionDigits:2})} × ${d.bodyHeight.toLocaleString('id-ID',{maximumFractionDigits:2})} m`:'Belum tersedia';
   $('#panel-content').innerHTML=`<h3>Informasi mesin</h3><dl class="data-list">${pair('Kode aset','APM-2')+pair('Pabrikan','BOBST · identifikasi family reference')+pair('Model','SP 102')+pair('Serial Number',v.serial)+pair('Functional Location',v.functionalLocation)+pair('Tahun',String(v.year||''))+pair('Kategori','Automatic flatbed die cutter')}</dl><h3>Model 3D</h3><div class="card accent"><h4>Identitas BMJ + rekonstruksi keluarga BOBST SP 102</h4><p>Database BMJ memverifikasi model SP 102, serial 57115506 dan tahun 1994. Karena suffix E/SE/CER/BMA tidak tersedia pada database dan tidak ada foto aktual APM 2, bentuk/fungsi dibangun dari referensi legacy SP 102 yang se-era. Fitur yang variant-specific ditandai sebagai referensi, bukan diklaim sebagai konfigurasi serial ini.</p><span class="tag">DATABASE BMJ</span><span class="tag">SP 102 FAMILY</span><span class="tag">SUFFIX BELUM TERKONFIRMASI</span></div><dl class="data-list">${pair('Envelope model visual',bodyText)+pair('Sheet maksimum','1.020 × 720 mm')+pair('Kecepatan family reference',Number.isFinite(f.maxSpeedSph)?f.maxSpeedSph.toLocaleString('id-ID')+' sheets/jam':'Belum tersedia')+pair('Tekanan potong family reference',Number.isFinite(f.maxCuttingForceT)?f.maxCuttingForceT+' ton':'Belum tersedia')+pair('Berat family reference',Number.isFinite(f.referenceWeightKg)?f.referenceWeightKg.toLocaleString('id-ID')+' kg':'Belum tersedia')+pair('Alur proses','Feeder → Register / SideLay → Gripper Chain → Platen → Stripping → Delivery')+pair('Referensi',TECHNICAL_SOURCES.length+' sumber')}</dl><div class="card"><h4>Batas ketelitian</h4><p>Identitas mesin berasal dari database BMJ. Dimensi, performa dan aksesori legacy SP 102 adalah referensi keluarga mesin, bukan sertifikasi konfigurasi aktual APM 2. Posisi SideLay, gripper-chain, platen dan stripping direkonstruksi untuk menjelaskan fungsi tanpa mengarang suffix mesin.</p></div>`;
  }else if(IS_SHEETING){
   $('#panel-content').innerHTML=`<h3>Informasi mesin</h3><dl class="data-list">${pair('Kode aset','SBM-2')+pair('Pabrikan','LEXUS')+pair('Model plant','HSM-CTM7')+pair('Serial Number','00982')+pair('Functional Location','PC-PK2-OFS-SHT-SHEETING01')+pair('Tahun','2014')+pair('Kategori','Roll-to-sheet sheeter')}</dl><h3>Model 3D</h3><div class="card accent"><h4>Twin khusus Sheeting · orientasi proses terkoreksi</h4><p>Exterior V68 mempertahankan true inspection aperture dan detail V65, lalu memecah delivery menjadi tiga zona proses yang lebih masuk akal: fast tape untuk membuka gap sesudah cut, slow tape untuk transfer, lalu overlap tape sebelum stacker. Geometry exact HSM-CTM7 tetap tidak diklaim bila sumber spesifik tidak tersedia.</p><span class="tag">DATABASE BMJ</span><span class="tag">RIGHT → LEFT</span><span class="tag">LEXUS HSM56 VISUAL REF</span></div><dl class="data-list">${pair('Alur material','RIGHT → LEFT')+pair('Input','Paper reel rendah + exposed opposed chuck / fixed-position two-sided rollstand family reference · kanan')+pair('Pemotongan','Panoramic-window main head + Main Draw / Traction Drum family reference + visible flat-bed knife · exact HSM-CTM7 drum naming/actuation unresolved')+pair('Output','13 jalur tape × 3 zona proses (fast / slow / overlap) + adjustment assemblies + operator handwheel → lift-table stacker · kiri')+pair('Cut length family ref.','400–1700 mm')+pair('Knife load family ref.','600 gsm')+pair('Kecepatan family ref.','300 m/min')+pair('Referensi',TECHNICAL_SOURCES.length+' sumber')}</dl><div class="card"><h4>Batas ketelitian</h4><p>HSM-CTM7, serial, SAP code dan tahun adalah identitas database BMJ. Exterior V68 tetap memakai foto resmi HSM 56 untuk bentuk, tetapi logic proses simulation sekarang dipisahkan dari geometry evidence. Pasaban dipakai hanya untuk urutan fast belt → slow belt → overlay → stacking, Unico untuk hubungan web/draw-roll/cutter/tapes, dan Maxson untuk logika overlap/lift table. Tidak ada sumber sekunder tersebut yang dipakai untuk mengklaim bentuk exact HSM-CTM7.</p></div>`;
   }else if(IS_GENERIC){
    const m=GENERIC_CONFIG.machine,e=GENERIC_CONFIG.evidence,spec=engine?.template?.root?.userData?.spec||{},boundary=spec.dimensionalBoundary||e.reason;
    const specRows=[
     ['Machine ID',m.machineId],['SAP Code',m.sapCode],['Serial Number',m.serial],['Tahun',m.year],['Functional Location',m.functionalLocation],['Area',m.area],
     ['Status dasar data',e.grade],['Status model 3D',e.geometry],['Status simulasi',IS_VERIFIED_REGISTRY_SIM?'Tersedia · berbasis alur proses':'Diblokir · evidence belum cukup'],
     ['Envelope referensi',Array.isArray(spec.envelopeM||spec.referenceEnvelopeM)?(spec.envelopeM||spec.referenceEnvelopeM).map(v=>Number(v).toLocaleString('id-ID',{maximumFractionDigits:3})).join(' × ')+' m':null],
     ['Kecepatan referensi',Number.isFinite(spec.maxSpeedMMin)?spec.maxSpeedMMin+' m/min':Number.isFinite(spec.lineSpeedMaxMMin)?spec.lineSpeedMaxMMin+' m/min':Number.isFinite(spec.maxSpeed)?Number(spec.maxSpeed).toLocaleString('id-ID')+' /jam':Number.isFinite(spec.nominalRunSpeedMMin)?spec.nominalRunSpeedMMin+' m/min':null],
     ['Referensi teknis',TECHNICAL_SOURCES.length+' sumber']
    ].filter(([,v])=>v!==null&&v!==undefined&&v!=='');
    $('#panel-content').innerHTML=`<h3>Informasi mesin</h3><dl class="data-list">${specRows.map(([k,v])=>pair(k,v)).join('')}</dl><h3>Model 3D</h3><div class="card accent"><h4>${IS_VERIFIED_REGISTRY_SIM?'Model khusus berbasis sumber':'Model acuan dengan verifikasi data'}</h4><p>${esc(e.reason)}</p><span class="tag">${esc(e.grade)}</span><span class="tag">${esc(e.geometry)}</span><span class="tag">${IS_VERIFIED_REGISTRY_SIM?'SIMULASI TERSEDIA':'SIMULASI DIBLOKIR'}</span></div><div class="card"><h4>Batas ketelitian</h4><p>${esc(boundary)}</p></div>`;
   }else{
   const structural=envelope?.structuralBody,service=envelope?.serviceInclusive,pitch=envelope?.repeatedPitch;
   const structuralText=structural?`${structural.length.toLocaleString('id-ID',{maximumFractionDigits:2})} × ${structural.width.toLocaleString('id-ID',{maximumFractionDigits:2})} m`:'Belum tersedia';
   const serviceText=service?`${service.length.toLocaleString('id-ID',{maximumFractionDigits:2})} × ${service.width.toLocaleString('id-ID',{maximumFractionDigits:2})} m`:'Belum tersedia';
   const pitchText=pitch?`${pitch.value.toLocaleString('id-ID',{minimumFractionDigits:3,maximumFractionDigits:3})} m`:'Belum tersedia';
   const primaryTruth=assetTruth(a,{placement:placementForMachine?.(activeMachineAssetId())||null,sourceCount:TECHNICAL_SOURCES.length});
   $('#panel-content').innerHTML=`<h3>Informasi mesin</h3><dl class="data-list">${pair('Nama aset',a.description)+pair('Kode aset',a.asset_code)+pair('Kode nama',a.codename)+pair('Model',a.model)+pair('Kategori',a.category||'PRODUCTION_MACHINE')+pair('Subkategori',a.subcategory||'OFFSET_PRINTING')+pair('Pabrikan',a.manufacturer)+pair('Spesifikasi',a.specification)+pair('Lokasi',a.location)+pair('Status operasi',primaryTruth.operatingStatus)+pair('Health score',primaryTruth.healthScore)}</dl><h3>Status model 3D</h3><dl class="data-list">${pair('3D source',primaryTruth.source3D)+pair('3D detail',primaryTruth.detail3D)+pair('Data confidence',primaryTruth.dataConfidence)+pair('Posisi',primaryTruth.position)+pair('Source count',primaryTruth.sourceCount?primaryTruth.sourceCount+' sumber':'UNKNOWN')}</dl><div class="card accent"><h4>Rekonstruksi berbasis denah + foto aktual</h4><p>Envelope mesin dan pitch berulang mengikuti footprint OFU-1 pada denah terkalibrasi. Bentuk luar mengacu pada foto aktual, sedangkan struktur fungsional internal mengacu pada dokumen CD102 yang tersedia.</p><span class="tag">PROCEDURAL / RECONSTRUCTED</span><span class="tag">PARTIAL / APPROXIMATE</span></div><dl class="data-list">${pair('Envelope struktur',structuralText)+pair('Envelope termasuk area servis',serviceText)+pair('Pitch modul berulang',pitchText)+pair('Susunan unit','8 printing unit + coating + extension/delivery')+pair('Posisi di pabrik',primaryTruth.position)+pair('Dokumen identitas',a.sources.length+' dokumen')}</dl><div class="card"><h4>Batas ketelitian</h4><p>Ukuran envelope dan pitch berasal dari denah OFU-1. Dimensi internal seperti bearer, nip, cam timing, dan setelan roller hanya ditampilkan bila benar-benar didukung dokumen; sisanya tetap referensi visual.</p></div>`;
  }
 }else if(tab==='structure'){
  const meta=TAXONOMY_BY_ID.get(activeTaxonomyId())||TAXONOMY_BY_ID.get(ACTIVE_ROOT),stats=taxonomyStats();
  $('#panel-content').innerHTML=`<h3>Struktur mesin · 6 tingkat</h3><p class="subtle">Pilih bagian mesin untuk memusatkan tampilan. Bagian terpilih tetap terlihat penuh, sedangkan bagian lainnya dibuat transparan. Label <b>Model</b> berarti bagian tersebut dapat dipilih pada tampilan 3D; label <b>Referensi</b> berarti informasi bagian tersedia tetapi bentuk detailnya belum ditampilkan.</p><button id="tree-root" class="secondary">${IS_OFFSET10?'OFFSET 10':IS_APM2?'APM 2':IS_SHEETING?'SHEETING LEXUS':IS_GENERIC?GENERIC_CONFIG.machine.name:'OFFSET 5'} · Mesin</button><div class="card accent" style="margin-top:12px"><h4>${esc(meta.name)}</h4><p>Bagian terpilih pada struktur ${IS_OFFSET10?'Offset 10':IS_APM2?'APM 2':IS_SHEETING?'Sheeting Lexus':IS_GENERIC?GENERIC_CONFIG.machine.name:'Offset 5'}.</p><span class="tag">TINGKAT ${meta.level}</span></div><label for="explode">Jarak uraian <span id="explode-value">${Math.round(explodeLevel()*100)}%</span></label><input id="explode" type="range" min="0" max="1" step="0.01" value="${explodeLevel()}" ${engine?.view==='factory'?'disabled':''}><div class="actions"><button id="assemble" class="secondary">Rakit Kembali</button><button id="ghost" class="secondary ${engine?.template.ghosted?'active':''}">Transparan</button><button id="isolate" class="secondary ${engine?.isolated?'active':''}" aria-disabled="${selectedPart?'false':'true'}">Tampilkan Sendiri</button></div><div class="stage-strip">${[['Mesin',1],['Unit Utama',2],['Sub',3],['Block',4],['Part',5],['Spesifik Part',6]].map(([label,level])=>`<button data-stage="${level}" class="${meta.level===level?'active':''}"><span>${label}</span><small>L${level}</small></button>`).join('')}</div><div class="geometry-tree">${taxonomyTree()}</div><p class="subtle">${stats.total} bagian tercatat dalam struktur mesin.</p>`;
  $('#explode').addEventListener('input',e=>{setExplodeLevel(+e.target.value);engine?.template.explode(explodeLevel(),selectedPart);if(selectedPart)engine.template.ghost(explodeLevel()>0,selectedPart);$('#explode-value').textContent=Math.round(explodeLevel()*100)+'%';$('#ghost').classList.toggle('active',!!engine?.template.ghosted);$('#tool-explode')?.classList.toggle('active',explodeLevel()>0);});
  on('#assemble',()=>{setExplodeLevel(0);selectedPart=null;if(engine){engine.template.reset();engine.clearPartLabels();engine.isolated=false;engine.fit(engine.machine);}renderPanel();});
  on('#ghost',()=>{if(engine){engine.template.ghost(!engine.template.ghosted,selectedPart);$('#ghost').classList.toggle('active',engine.template.ghosted);}});
  on('#isolate',()=>{if(!engine){toast('Tampilan 3D belum tersedia.',true);return;}if(!selectedPart){toast('Pilih bagian mesin terlebih dahulu.');return;}engine.isolated=!engine.isolated;engine.template.isolate(selectedPart,engine.isolated);$('#isolate').classList.toggle('active',engine.isolated);});
  on('#tree-root',()=>{setActiveTaxonomyId(ACTIVE_ROOT);selectedPart=null;setExplodeLevel(0);engine?.template.reset();if(engine){engine.clearPartLabels();engine.isolated=false;engine.fit(engine.machine);}renderPanel();});
  document.querySelectorAll('[data-taxonomy]').forEach(b=>b.onclick=()=>selectTaxonomy(b.dataset.taxonomy));
  document.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>{const candidate=taxonomyAtLevel(+b.dataset.stage);if(candidate)selectTaxonomy(candidate.id);});
 }else if(tab==='simulation'){
  const s=commitSimulationState(engine?.getPrintingSimulationState?.()||currentSimulationState());
  if(!engine){
   $('#panel-content').innerHTML='<h3>Simulasi Proses</h3><div class="card accent"><h4>Simulasi 3D belum tersedia di perangkat ini</h4><p>Penampil 3D memerlukan akselerasi grafis WebGL. Anda tetap dapat melihat data, struktur, dan referensi mesin; jalankan simulasi pada perangkat atau browser yang mendukung WebGL.</p></div>';
  }else if(IS_APM2){
   $('#panel-content').innerHTML=`<h3>Simulasi Proses APM 2</h3><p class="subtle">Simulasi memperlihatkan alur sheet dari pile feeder ke suction head, register dan SideLay, pengambilalihan oleh gripper chain, penekanan pada flatbed die-cutting platen, stripping, lalu pelepasan gripper ke delivery pile. Gerak stroke, phase, tekanan dan timing adalah visualisasi proses—bukan setting servis OEM.</p><div class="card accent simulation-overview"><div class="simulation-status-row"><span id="sim-status" class="simulation-state">${s.running?'RUNNING':s.active?'PAUSED':'READY'}</span><b id="sim-stage">${esc(s.stage||'Pile Feeder')}</b></div><div class="simulation-progress"><span id="sim-progress-bar" style="width:${Math.round((s.progress||0)*100)}%"></span></div><dl class="data-list compact">${pair('Lembar selesai',s.completed||0)+pair('Lembar bergerak',s.sheetsVisible||0)}<dt>Lembar di pile</dt><dd id="sim-pile">${s.pileSheetsVisible||0}</dd>${pair('Mekanisme aktif',s.mechanismCount||0)+pair('Gerak osilasi',s.oscillatorCount||0)+pair('Drive / rotor',s.rotorCount||0)}</dl><div class="actions simulation-actions"><button id="sim-start" class="primary">${s.active?(s.running?'Running':'Lanjutkan'):'Mulai Simulasi Proses'}</button><button id="sim-pause" class="secondary">${s.running?'Pause':'Lanjut'}</button><button id="sim-stop" class="secondary">Stop & Reset</button></div></div><h4>Kecepatan visual</h4><div class="simulation-speed">${[.5,1,1.5,2].map(v=>`<button data-sim-speed="${v}" class="${Math.abs((s.speed||1)-v)<.01?'active':''}">${v}×</button>`).join('')}</div><label class="check"><input id="sim-path" type="checkbox" ${s.pathVisible!==false?'checked':''}> Tampilkan jalur sheet</label><h4>Alur proses</h4><div class="simulation-ink-flow">${APM2_PROCESS_STEPS.map((step,index)=>`<div><span>${index+1}</span><b>${esc(step)}</b></div>`).join('')}</div><div class="simulation-flow">${APM2_SIMULATION_STAGES.map(stage=>`<div data-sim-stage="${esc(stage)}" class="${stage===s.stage?'active':''}"><span></span><b>${esc(stage)}</b></div>`).join('')}</div><div class="card"><h4>Gerak yang divisualisasikan</h4><p>Suction head bergerak naik-turun, feed rollers dan sprocket berputar, SideLay melakukan gerak register lateral, gripper bars membawa sheet, platen melakukan pressure stroke, stripping frame bergerak pada fase berikutnya, lalu sheet berhenti dan menumpuk di delivery. SideLay ditonjolkan karena terdapat histori maintenance BMJ pada area tersebut.</p></div>`;
   on('#sim-start',startPrintingSimulation);on('#sim-pause',pausePrintingSimulation);on('#sim-stop',()=>stopPrintingSimulation({restoreExterior:true}));
   document.querySelectorAll('[data-sim-speed]').forEach(b=>b.onclick=()=>{updateSimulationPanel(engine?.setPrintingSimulationSpeed(+b.dataset.simSpeed)||currentSimulationState());});
   const pathToggle=$('#sim-path');if(pathToggle)pathToggle.onchange=e=>{updateSimulationPanel(engine?.setPrintingSimulationPathVisible(e.target.checked)||currentSimulationState());};
   updateSimulationPanel(s);
  }else if(IS_SHEETING){
   $('#panel-content').innerHTML=`<h3>Simulasi Proses Sheeting</h3><p class="subtle">V68 memodelkan aliran material sebagai proses kontinu: reel rendah di <b>kanan</b> → guide/tension/EPC → web <b>membelit permukaan Main Draw / Traction Drum</b> → target panjang tercapai → visible blade / cut event → fast tape → slow tape → overlap/shingle → landing → jogger alignment → lift-table stacker di <b>kiri</b>. Jalur debug dimatikan secara default agar tidak menutupi mekanisme. Timing dan rasio kecepatan bersifat visual-process reference, bukan setelan servis OEM.</p><div class="card accent simulation-overview"><div class="simulation-status-row"><span id="sim-status" class="simulation-state">${s.running?'RUNNING':s.active?'PAUSED':'READY'}</span><b id="sim-stage">${esc(s.stage||'Unwind / Continuous Web')}</b></div><div class="simulation-progress"><span id="sim-progress-bar" style="width:${Math.round((s.progress||0)*100)}%"></span></div><dl class="data-list compact"><dt>Lembar selesai</dt><dd id="sim-completed">${s.completed||0}</dd><dt>Lembar bergerak</dt><dd id="sim-visible">${s.sheetsVisible||0}</dd><dt>Lembar di pile</dt><dd id="sim-pile">${s.pileSheetsVisible||0}</dd>${pair('Mekanisme aktif',s.mechanismCount||0)+pair('Roll / drive aktif',s.rotorCount||0)}</dl><div class="actions simulation-actions"><button id="sim-start" class="primary">${s.active?(s.running?'Running':'Lanjutkan'):'Mulai Simulasi Sheeting'}</button><button id="sim-pause" class="secondary">${s.running?'Pause':'Lanjut'}</button><button id="sim-stop" class="secondary">Stop & Reset</button></div></div><h4>Kecepatan visual</h4><div class="simulation-speed">${[.5,1,1.5,2].map(v=>`<button data-sim-speed="${v}" class="${Math.abs((s.speed||1)-v)<.01?'active':''}">${v}×</button>`).join('')}</div><label class="check"><input id="sim-path" type="checkbox" ${s.pathVisible!==false?'checked':''}> Tampilkan garis referensi jalur proses</label><h4>Alur proses</h4><div class="simulation-ink-flow">${SHEETING_PROCESS_STEPS.map((step,index)=>`<div><span>${index+1}</span><b>${esc(step)}</b></div>`).join('')}</div><div class="simulation-flow">${SHEETING_SIMULATION_STAGES.map(stage=>`<div data-sim-stage="${esc(stage)}" class="${stage===s.stage?'active':''}"><span></span><b>${esc(stage)}</b></div>`).join('')}</div><div class="card"><h4>Gerak yang divisualisasikan</h4><p>Paper reel/chuck dan guide/tension roller berputar, lalu web terlihat benar-benar menyentuh dan membelit Main Draw / Traction Drum. Surface speed drum disinkronkan dengan gerak web; setelah web maju satu target panjang sheet, blade turun, cutting edge mencapai web, sheet dilepas, lalu blade naik kembali. Fungsi draw/traction drum adalah process-family reference dari arsitektur sheeter BW/Unico/Maxson, bukan klaim nama OEM exact HSM-CTM7. Setelah cut, sheet masuk fast tape, slow tape, overlap/shingle, landing, jogger alignment dan lift-table stacker.</p></div>`;
   on('#sim-start',startPrintingSimulation);on('#sim-pause',pausePrintingSimulation);on('#sim-stop',()=>stopPrintingSimulation({restoreExterior:true}));
   document.querySelectorAll('[data-sim-speed]').forEach(b=>b.onclick=()=>{updateSimulationPanel(engine?.setPrintingSimulationSpeed(+b.dataset.simSpeed)||currentSimulationState());});
   const pathToggle=$('#sim-path');if(pathToggle)pathToggle.onchange=e=>{updateSimulationPanel(engine?.setPrintingSimulationPathVisible(e.target.checked)||currentSimulationState());};
   updateSimulationPanel(s);
   }else if(IS_GENERIC&&IS_VERIFIED_REGISTRY_SIM){
    const m=GENERIC_CONFIG.machine,e=GENERIC_CONFIG.evidence,family=GENERIC_CONFIG.family,isAhu=family==='ahu',isCompressor=family==='compressor',isCtp=family==='ctp',isCtf=family==='imagesetter',isZund=family==='zund',isCollator=family==='collator',isBlanker=family==='blanker',isFolder=family==='folder';
    const flagRows=[
     ['Gripper indexing',s.transportIndexing],['Transport stopped',s.transportStopped],['Feeder suction',s.feederSuctionActive],['Cutting / platen',s.cuttingActive??s.platenClosed],['Pressure dwell',s.pressureDwell],['Stripping',s.strippingActive],['Blanking',s.blankingActive],['Tie-sheet demo',s.tieSheetActive],
     ['Heater ready',s.heaterReady],['Stamping contact',s.stampingContact],['Foil advance',s.foilAdvancing],['Waste foil rewind',s.wasteRewinding],['Pre-break',s.preBreakActive],['Forming',s.formingActive],['Folding',s.foldingActive],['Glue application',s.glueApplying],['Compression',s.compressionActive],['Delivery',s.deliveryActive],
     ['Digital print',s.printingActive],['Vision scan',s.scanActive],['Image processing',s.imageProcessingActive??s.processingActive],['Feeder drive',s.feederDriveActive],['Transport drive',s.transportDriveActive],['Delivery drive',s.deliveryDriveActive],['Vacuum hold',s.vacuumHoldActive],['Transfer vacuum ready',s.transferVacuumReady],['Transport encoder',s.transportEncoderActive],['Blank presence trigger',s.blankPresenceTrigger],['Lighting ready',s.illuminationReady??s.lightingProgramReady],['Camera trigger',s.cameraTriggerActive??s.cameraTrigger],['Capture complete',s.captureComplete],['Processing complete',s.processingComplete],['Decision ready',s.decisionReady],['Reject permit',s.rejectPermit],['Reject confirmed',s.rejectConfirmed],['Output counter',s.outputCountActive],['Good return confirmed',s.goodReturnConfirmed],['Bad return confirmed',s.badReturnConfirmed],['Negative-pitch capability',s.negativePitchCapabilityReference],['Negative-pitch active',s.negativePitchActive],['Material present',s.materialPresent],['Double-sheet clear',s.doubleSheetClear],['Encoder sync',s.encoderSync],['Print trigger',s.printTrigger],['Negative-pressure ready',s.negativePressureReady],['Negative pump',s.negativePumpActive],['Print permit',s.printPermit],['Print complete',s.printComplete],['UV power ready',s.uvPowerReady],['UV permit',s.uvPermit],['Cure complete',s.cureComplete],['Inspection complete',s.inspectionComplete],['Collection detected',s.collectionDetected],['Process interlock safe',s.interlockSafe],['Reject tracking',s.rejectTrackingActive],['Accepted delivery',s.acceptedDeliveryActive],['Good return',s.goodRoutingActive],['Bad return',s.badRoutingActive],['UV curing',s.uvActive],['Camera inspection',s.cameraActive],
     ['Air table',s.airTableActive],['Feeder suction',s.feederSuctionActive],['Registration',s.registrationActive],['SideLay',s.sideLayActive],['Backgauge motion',s.backgaugeMoving],['Pile loaded',s.pileLoaded],['Clamp command',s.clampCommand],['Pile clamped',s.clamped],['Clamp confirmed',s.clampConfirmed],['Lift active',s.liftActive],['Lift clearance',s.liftClearance],['Turn permitted',s.turnPermitted],['Turning assembly',s.turningActive],['Turn complete',s.turnComplete],['Turn lock command',s.turnLockCommand],['Turn locked',s.turnLockConfirmed],['Air pressure ready',s.airPressureReady],['Alignment complete',s.alignmentComplete],['Lowering',s.loweringActive],['Release permit',s.releasePermit],['Unload ready',s.unloadReady],['Guard interlock safe',s.guardInterlockSafe],['Pile-turner interlock safe',s.interlockSafe],['Hydraulic drive',s.hydraulicActive],['Clamp',s.clampActive],['Clamp contact',s.clampContact],['Knife downstroke',s.knifeDownstroke],['Knife upstroke',s.knifeUpstroke],['Cut separated',s.cutSeparated],['Safety blocked',s.blocked],['Coating transfer',s.coatingActive],['Dryer passage',s.dryerActive],['Venturi guidance',s.airGuidanceActive],['Delivery gripper bars',s.deliveryGripperActive],['Dynamic sheet brake',s.deliveryBrakeActive],['Air separation',s.airingActive],['Jogging / alignment',s.joggingActive],['Reject demo',s.demoRejectActive],['Delivery rake',s.deliveryRakeActive],['Supply air',isAhu?s.supplyAirActive:undefined],['Return-air reference',isAhu?s.returnAirReferenceActive:undefined],['Outdoor heat rejection',isAhu?s.outdoorHeatRejectionActive:undefined],['Evaporative pre-cooling',isAhu?s.evaporativePrecoolActive:undefined],['DX / evaporator stage',isAhu?s.dxEvaporatorActive:undefined],['Cooling coil conditioning',isAhu?s.genericCoilConditioningActive:undefined],['Air intake',isCompressor?s.compressorIntakeActive:undefined],['Screw compression',isCompressor?s.compressorCompressionActive:undefined],['Oil / air separation',isCompressor?s.compressorSeparationActive:undefined],['Aftercooling',isCompressor?s.compressorAftercoolingActive:undefined],['Oil circuit',isCompressor?s.compressorOilCircuitActive:undefined],['Condensate drain',isCompressor?s.compressorCondensateDrainActive:undefined],['Ring-main distribution',isCompressor?s.compressorDistributionActive:undefined],['Plate present',isCtp?s.ctpPlatePresent:undefined],['Register confirmed',isCtp?s.ctpRegisterConfirmed:undefined],['Drum load position',isCtp?s.ctpDrumAtLoadPosition:undefined],['Clamp confirmed',isCtp?s.ctpClampConfirmed:undefined],['Transport drive',isCtp?s.ctpTransportDriveActive:undefined],['Drum drive',isCtp?s.ctpDrumDriveActive:undefined],['Drum encoder sync',isCtp?s.ctpDrumEncoderSync:undefined],['Exposure permit',isCtp?s.ctpExposurePermit:undefined],['Laser exposure',isCtp?s.ctpExposureActive:undefined],['Laser traverse',isCtp?s.ctpLaserTraverseActive:undefined],['Laser beam / spot',isCtp?s.ctpLaserBeamVisible:undefined],['Unload permit',isCtp?s.ctpUnloadPermit:undefined],['Output plate detected',isCtp?s.ctpOutputDetected:undefined],['CTP interlock safe',isCtp?s.ctpInterlockSafe:undefined],['Media present',isCtf?s.imagesetterMediaPresent:undefined],['Supply brake',isCtf?s.imagesetterSupplyBrakeActive:undefined],['Tension valid',isCtf?s.imagesetterTensionValid:undefined],['Capstan encoder',isCtf?s.imagesetterCapstanEncoderActive:undefined],['Polygon at speed',isCtf?s.imagesetterPolygonAtSpeed:undefined],['Exposure permit',isCtf?s.imagesetterExposurePermit:undefined],['Capstan advance',isCtf?s.capstanAdvanceActive:undefined],['Tension regulation',isCtf?s.tensionRegulationActive:undefined],['Exposure complete',isCtf?s.imagesetterExposureComplete:undefined],['Cutter permit',isCtf?s.imagesetterCutterPermit:undefined],['Cutter home',isCtf?s.imagesetterCutterHomeConfirmed:undefined],['Output detected',isCtf?s.imagesetterOutputDetected:undefined],['CTF interlock safe',isCtf?s.imagesetterInterlockSafe:undefined],['Output handoff',isCtf?s.outputBoundaryActive:undefined],['Vacuum hold',isZund?s.vacuumHoldActive:undefined],['Gantry / carriage',isZund?s.zundAxisMotionActive:undefined],['Tool action',isZund?s.zundToolActionActive:undefined],['Vacuum contact',isZund?s.zundVacuumContactActive:undefined],['Vacuum control',isZund?s.zundVacuumControlActive:undefined],['Tool clearance safe',isZund?s.zundToolClearanceMaintained:undefined],['Suction feed',isCollator?(s.activeBinFeeds>0):undefined],['Air separation',isCollator?s.airSeparationActive:undefined],['Rotor pickup',isCollator?s.rotorPickupActive:undefined],['Suction blower',isCollator?s.collatorSuctionBlowerActive:undefined],['Separation-air control',isCollator?s.collatorSeparationAirControlActive:undefined],['Double-feed check',isCollator?s.doubleFeedCheckActive:undefined],['Gather transport',isCollator?s.gatherTransportActive:undefined],['Stack loading',isBlanker?s.blankerLoading:undefined],['Platform indexing',isBlanker?s.platformIndexing:undefined],['X servo',isBlanker?s.blankerXServoActive:undefined],['Y servo',isBlanker?s.blankerYServoActive:undefined],['Position feedback',isBlanker?s.blankerPositionFeedbackActive:undefined],['Hydraulic pump',isBlanker?s.blankerHydraulicPumpActive:undefined],['Press valve',isBlanker?s.blankerHydraulicValvePressActive:undefined],['Return valve',isBlanker?s.blankerHydraulicValveReturnActive:undefined],['Hydraulic pressure',isBlanker?s.blankerHydraulicPressureActive:undefined],['Separation',isBlanker?s.blankerSeparationActive:undefined],['Alignment',isFolder?s.alignmentActive:undefined],['Pre-break',isFolder?s.preBreakActive:undefined],['Final fold',isFolder?s.finalFoldActive:undefined],['Belt contact',isFolder?s.folderBeltContactActive:undefined],['Feeder drive',isFolder?s.folderFeederDriveActive:undefined],['Fold drive',isFolder?s.folderFoldDriveActive:undefined],['Compression drive',isFolder?s.folderCompressionDriveActive:undefined],['Delivery drive',isFolder?s.folderDeliveryDriveActive:undefined],['Folder delivery',isFolder?s.folderDeliveryActive:undefined]
    ].filter(([,v])=>typeof v==='boolean').map(([k,v])=>pair(k,v?'AKTIF':'STANDBY')).join('');
    const genericStages=GENERIC_CONFIG.profile?.process||GENERIC_CONFIG.modules||PRINTING_SIMULATION_STAGES;
    const pressureProfile=isCompressor&&s.compressorPressureProfile?s.compressorPressureProfile:null;
    const pressureRows=pressureProfile?pair('P discharge',pressureProfile.package+'% norm')+pair('P receiver',pressureProfile.receiver+'% norm')+pair('P after treatment',pressureProfile.afterTreatment+'% norm')+pair('P ring near / far',pressureProfile.ringNear+' / '+pressureProfile.ringFar+'% norm')+pair('P service 1 / 2 / 3',(pressureProfile.service||[]).join(' / ')+'% norm'):'';
    const numericRows=(Number.isFinite(s.turnAngleDeg)?pair('Sudut pile turn',Math.round(s.turnAngleDeg)+'°'):'')+(Number.isFinite(s.rejectedDemo)?pair('Reject demo',s.rejectedDemo):'')+(Number.isFinite(s.rejectSheetsVisible)?pair('Item reject terlihat',s.rejectSheetsVisible):'')+(isCtp&&s.ctpMaterialContact?pair('Kontak plate',s.ctpMaterialContact):'')+(isCtf&&s.imagesetterMediaContactStage?pair('Kontak media',s.imagesetterMediaContactStage):'')+(isZund&&s.zundVacuumMode?pair('Mode vacuum',s.zundVacuumMode):'')+(isFolder&&Number.isFinite(s.folderMaterialContactZone)?pair('Zona kontak blank',s.folderMaterialContactZone+1):'')+(isAhu?pair('Partikel supply',s.supplyAirflowParticleCount||0)+pair('Partikel return',s.returnAirflowParticleCount||0)+pair('Partikel outdoor',s.outdoorAirflowParticleCount||0)+pair('Routing duct plant',s.plantDuctRouteVerified?'TERVERIFIKASI':'BELUM TERVERIFIKASI'):'')+(isCompressor?pair('Partikel internal air',s.compressedAirParticleCount||0)+pair('Partikel distribusi',s.distributionAirParticleCount||0)+pair('Partikel oil circuit',s.oilFlowParticleCount||0)+pair('Partikel condensate',s.condensateParticleCount||0)+pair('Tekanan visual',Number.isFinite(s.compressorPressureNormalizedPct)?s.compressorPressureNormalizedPct+'% normalized':'-')+pair('Routing piping plant',s.plantCompressedAirRouteVerified?'TERVERIFIKASI':'BELUM TERVERIFIKASI')+pressureRows:'');
    const processIntro=isAhu?'Simulasi AHU memperlihatkan udara masuk melalui inlet/filter, melewati heat-exchange/cooling stage dan fan, lalu supply/return duct reference. Jalur plant tetap bukan as-built sampai drawing aktual tersedia.':isCompressor?'Simulasi compressor memperlihatkan intake → screw airend → oil-air separation → aftercooler → discharge/treatment → ring-main reference. Oil circuit dan condensate divisualkan terpisah; pressure tetap normalized.':isCtp?'Simulasi Suprasetter mengikuti external-drum CtP dengan interlock berurutan: plate present → register confirmed → drum load position → clamp confirmed → drum encoder sync → exposure permit → thermal-laser imaging → release clamp → unload permit → output confirmation. Loader, punch, debris-removal dan processor tetap option boundary sampai instalasi BMJ terverifikasi.':isCtf?'Simulasi SCREEN mengikuti roll-media capstan architecture dengan feedback chain: media present → supply brake/tension → gravity tension valid → capstan encoder → polygon at speed → exposure permit → laser imaging → exposure complete → cutter permit/home interlock → output detect. Punch dan inline processor tetap option boundary.':isZund?'Simulasi Zünd hanya menjalankan fungsi yang aman untuk family reference: vacuum hold-down dan gerak X-beam/Y-carriage mengikuti toolpath serpentine terkontrol. Aksi potong/crease/router sengaja tidak dijalankan karena tool package aktual BMJ belum teridentifikasi.':isCollator?'Simulasi collator memberi makan sheet secara bertahap per bin menggunakan suction-rotor/air separation reference, melewati feed-integrity sensing, kemudian bergabung ke common gathering transport dan delivery. Jumlah 10 bin tetap reference, bukan klaim unit BMJ.':isBlanker?'Simulasi ABM mengikuti family QF/LQF: stack masuk ke moving platform, X/Y servo mengindeks area ke bawah fixed hydraulic head, platform berhenti sebelum pressure stroke, blank/waste dipisahkan, lalu platform kembali.':isFolder?'Simulasi FGM-2 mengikuti zona umum folder-gluer: singulation → alignment/prebreak → primary fold → adhesive zone → final fold → compression → delivery. Crash-lock, 4/6-corner dan tipe glue applicator tetap tidak diasumsikan.':'Simulasi hanya menggerakkan mekanisme dan alur material yang sudah lolos evidence gate. Timing dan posisi detail bukan setelan produksi atau servis aktual.';
    $('#panel-content').innerHTML=`<h3>Simulasi Proses · ${esc(m.name)}</h3><p class="subtle">${processIntro}</p><div class="card accent simulation-overview"><div class="simulation-status-row"><span id="sim-status" class="simulation-state">${s.running?'RUNNING':s.active?'PAUSED':'READY'}</span><b id="sim-stage">${esc(s.stage||PRINTING_SIMULATION_STAGES[0]||'Proses')}</b></div><div class="simulation-progress"><span id="sim-progress-bar" style="width:${Math.round((s.progress||0)*100)}%"></span></div><dl class="data-list compact"><dt>${isAhu||isCompressor?'Siklus visual':'Output selesai'}</dt><dd id="sim-completed">${s.completed||0}</dd><dt>${isAhu||isCompressor?'Partikel aliran udara':'Material bergerak'}</dt><dd id="sim-visible">${isAhu||isCompressor?(s.airflowParticleCount||0):(s.sheetsVisible||0)}</dd><dt>${isAhu?'Supply / Return':isCompressor?'Internal / Distribusi':'Output di pile / collection'}</dt><dd id="sim-pile">${isAhu?((s.supplyAirflowParticleCount||0)+' / '+(s.returnAirflowParticleCount||0)):isCompressor?((s.compressedAirParticleCount||0)+' / '+(s.distributionAirParticleCount||0)):(s.pileSheetsVisible||0)}</dd>${pair(isAhu?'Mekanisme fan / actuator':isCompressor?'Drive / airend / fan':'Mekanisme terpetakan',s.mechanismCount||0)+numericRows+flagRows}</dl><div class="actions simulation-actions"><button id="sim-start" class="primary">${s.active?(s.running?'Running':'Lanjutkan'):'Mulai Simulasi Proses'}</button><button id="sim-pause" class="secondary">${s.running?'Pause':'Lanjut'}</button><button id="sim-stop" class="secondary">Stop & Reset</button></div></div><h4>Kecepatan visual</h4><div class="simulation-speed">${[.5,1,1.5,2].map(v=>`<button data-sim-speed="${v}" class="${Math.abs((s.speed||1)-v)<.01?'active':''}">${v}×</button>`).join('')}</div><label class="check"><input id="sim-path" type="checkbox" ${s.pathVisible!==false?'checked':''}> ${isCompressor?'Tampilkan piping distribusi reference':isAhu?'Tampilkan ducting reference':'Tampilkan jalur referensi jika tersedia'}</label><h4>${isAhu?'Alur tata udara referensi':isCompressor?'Alur compressed-air reference':isCtp?'Alur external-drum imaging':isCtf?'Alur media & exposure':isZund?'Alur vacuum + XY toolpath':isCollator?'Alur suction & gathering':isBlanker?'Alur blanking X/Y + fixed head':isFolder?'Alur folding & gluing':'Unit proses yang tervalidasi'}</h4><div class="simulation-flow">${genericStages.map(stage=>`<div data-sim-stage="${esc(stage)}" class="${stage===s.stage?'active':''}"><span></span><b>${esc(stage)}</b></div>`).join('')}</div>${isAhu?'<div class="card"><h4>Batas routing duct</h4><p>Model memperlihatkan koneksi AHU → supply trunk → branch → diffuser serta return-air reference loop. Karena AHU 3–8 belum memiliki anchor posisi plant yang tervalidasi, ducting ini adalah functional airflow reference dan belum menjadi jalur as-built pabrik.</p></div>':''}${isCompressor?'<div class="card"><h4>Batas piping distribusi</h4><p>Model memperlihatkan discharge flexible connection, isolation/check valve, receiver boundary, dryer/filter boundary, closed-loop ring-main, service drops dan drip legs. Karena ketujuh compressor belum memiliki anchor posisi plant tervalidasi dan drawing compressed-air piping aktual belum tersedia, geometri ini adalah functional distribution reference—bukan jalur as-built. Receiver, dryer dan filter juga tetap explicit option boundary sampai instalasi aktual dikonfirmasi.</p></div>':''}<div class="card"><h4>Evidence gate</h4><p>${esc(e.reason)}</p><span class="tag">${esc(e.grade)}</span><span class="tag">${esc(e.geometry)}</span></div>`;
    on('#sim-start',startPrintingSimulation);on('#sim-pause',pausePrintingSimulation);on('#sim-stop',()=>stopPrintingSimulation({restoreExterior:true}));
    document.querySelectorAll('[data-sim-speed]').forEach(b=>b.onclick=()=>{updateSimulationPanel(engine?.setPrintingSimulationSpeed(+b.dataset.simSpeed)||currentSimulationState());});
    const pathToggle=$('#sim-path');if(pathToggle)pathToggle.onchange=e=>{updateSimulationPanel(engine?.setPrintingSimulationPathVisible(e.target.checked)||currentSimulationState());};
    updateSimulationPanel(s);
   }else if(IS_GENERIC){
   const reason=GENERIC_CONFIG.evidence.reason;
   $('#panel-content').innerHTML=`<h3>Simulasi belum tervalidasi</h3><div class="card accent"><h4>Tidak dijalankan untuk mencegah gerakan palsu</h4><p>${esc(reason)}</p><span class="tag">${esc(GENERIC_CONFIG.evidence.grade)}</span><span class="tag">${esc(GENERIC_CONFIG.evidence.geometry)}</span></div><dl class="data-list">${pair('Status simulasi','DIBLOKIR')+pair('Komponen bergerak','0')+pair('Produk fiktif','0')+pair('Syarat aktivasi','Alur material + actuator + interlock + timing + output harus tervalidasi')}</dl><div class="card"><h4>Yang masih dapat diperiksa</h4><p>Model referensi tetap dapat diputar, difokuskan dan dibuka strukturnya, tetapi bukan representasi konfigurasi aktual BMJ sampai foto empat sisi, nameplate, manual, susunan modul dan arah proses tersedia.</p></div>`;
  }else{
  const s=commitSimulationState(engine?.getPrintingSimulationState?.()||currentSimulationState());
  $('#panel-content').innerHTML=`<h3>Simulasi Proses</h3><p class="subtle">${IS_OFFSET10?'Simulasi membuka exterior otomatis dan memperlihatkan feeder, sheet alignment, seluruh cylinder train, AirTransfer, inking, Alcolor dampening, FoilStar pada PU2, tiga coating unit, UV/drying dan X3 delivery. Jalur mekanis adalah visualisasi proses berbasis dokumen, bukan nilai timing atau setelan servis OEM.':'Simulasi menjalankan sheet travel sekaligus mekanisme utama mesin. Kertas mengikuti permukaan impression/transfer cylinder sebagai lembar fleksibel agar tidak menembus roll. Feeder dan register bergerak, gripper melakukan transfer antar-unit, cylinder/gear/roller berputar, distributor tinta berosilasi, tetesan tinta terlihat dari fountain menuju ductor, dampening bekerja, lalu UV curing, inspection dan delivery menyelesaikan alur. Nilai stroke, phase, intensitas UV dan timing adalah visualisasi proses, bukan setelan servis.'}</p><div class="card accent simulation-overview"><div class="simulation-status-row"><span id="sim-status" class="simulation-state">${s.running?'RUNNING':s.active?'PAUSED':'READY'}</span><b id="sim-stage">${esc(s.stage||'Feeder')}</b></div><div class="simulation-progress"><span id="sim-progress-bar" style="width:${Math.round((s.progress||0)*100)}%"></span></div><dl class="data-list compact">${pair('Lembar selesai',s.completed||0)+pair('Lembar bergerak',s.sheetsVisible||0)}<dt>Lembar di pile</dt><dd id="sim-pile">${s.pileSheetsVisible||0}</dd>${pair('Part mekanis aktif',s.mechanismCount||0)+pair('Gerak osilasi',s.oscillatorCount||0)+pair('Jalur tinta / dampening',s.inkFlowCount||0)+pair('Dynamic sheet brake',s.deliveryBrakeActive?'AKTIF':'STANDBY')}<dt>UV curing</dt><dd id="sim-uv-state" class="${s.uvActive?'active':''}">${s.uvActive?'AKTIF':'STANDBY'}</dd><dt>UV lamp visual</dt><dd><span id="sim-uv-count">${s.uvLampCount||0}</span> cassette</dd>${pair('Kecepatan visual',(s.speed||1)+'×')}</dl><div class="actions simulation-actions"><button id="sim-start" class="primary">${s.active?(s.running?'Running':'Lanjutkan'):'Mulai Simulasi Proses'}</button><button id="sim-pause" class="secondary">${s.running?'Pause':'Lanjut'}</button><button id="sim-stop" class="secondary">Stop & Reset</button></div></div><h4>Kecepatan visual</h4><div class="simulation-speed">${[.5,1,1.5,2].map(v=>`<button data-sim-speed="${v}" class="${Math.abs((s.speed||1)-v)<.01?'active':''}">${v}×</button>`).join('')}</div><label class="check"><input id="sim-path" type="checkbox" ${s.pathVisible!==false?'checked':''}> Tampilkan garis jalur kertas</label><label class="check"><input id="sim-ink-flow" type="checkbox" ${s.inkFlowVisible!==false?'checked':''}> Tampilkan aliran tinta & dampening</label><h4>Sistem tinta</h4><div class="simulation-ink-flow">${INK_SIMULATION_SEQUENCE.map((step,index)=>`<div><span>${index+1}</span><b>${esc(step)}</b></div>`).join('')}</div><p class="subtle">Tetesan memanjang menunjukkan cucuran tinta dari fountain menuju ductor/vibrator; jalur tipis berikutnya menunjukkan transfer film tinta antar-roller. Warna unit pada simulasi hanya pembeda visual, bukan urutan warna job aktual.</p><div class="simulation-uv-card"><span id="sim-uv-indicator" aria-hidden="true"></span><div><b>UV Curing System</b><small>Beam menyala otomatis saat sheet berada di bawah cassette dryer.</small></div></div><h4>Alur proses mesin</h4><div class="simulation-flow">${PRINTING_SIMULATION_STAGES.map(stage=>`<div data-sim-stage="${esc(stage)}" class="${stage===s.stage?'active':''}"><span></span><b>${esc(stage)}</b></div>`).join('')}</div><div class="card"><h4>Gerak yang disimulasikan</h4><p>Feeder, register, cylinder train, gripper/transfer, inking, dampening, coating, UV/dryer dan delivery bergerak bersama. Pada Offset 10, FoilStar PU2 dan tiga coating unit ikut divisualisasikan sesuai konfigurasi dokumen. Aliran tinta divisualkan sebagai cucuran fountain → ductor, lalu film menuju roller/distributor → form rollers → plate → blanket → sheet; dampening divisualkan terpisah dari pan/roller ke plate. UV beam aktif hanya ketika sheet melewati dryer. Saat mencapai delivery, gripper melepaskan sheet tepat di atas main pile dan lembar tetap terlihat menumpuk di atas stack yang sudah ada.</p></div>`;
  on('#sim-start',startPrintingSimulation);on('#sim-pause',pausePrintingSimulation);on('#sim-stop',()=>stopPrintingSimulation({restoreExterior:true}));
  document.querySelectorAll('[data-sim-speed]').forEach(b=>b.onclick=()=>{updateSimulationPanel(engine?.setPrintingSimulationSpeed(+b.dataset.simSpeed)||currentSimulationState());});
  const pathToggle=$('#sim-path');if(pathToggle)pathToggle.onchange=e=>{updateSimulationPanel(engine?.setPrintingSimulationPathVisible(e.target.checked)||currentSimulationState());};
  const inkToggle=$('#sim-ink-flow');if(inkToggle)inkToggle.onchange=e=>{updateSimulationPanel(engine?.setPrintingSimulationInkFlowVisible(e.target.checked)||currentSimulationState());};
  updateSimulationPanel(s);

  }
 }else if(tab==='data'){
   const meta=TAXONOMY_BY_ID.get(activeTaxonomyId())||TAXONOMY_BY_ID.get(ACTIVE_ROOT);
   const m=IS_GENERIC?GENERIC_CONFIG.machine:null;
   const placement=placementForMachine?.(activeMachineAssetId())||null,truth=assetTruth(a,{placement,sourceCount:TECHNICAL_SOURCES.length});
   const rows=[
    ['Kode aset / Machine ID',m?.machineId||a?.asset_code],
    ['SAP Code',m?.sapCode||a?.sap_code],
    ['Pabrikan',m?.manufacturer||a?.manufacturer],
    ['Model',m?.model||a?.model],
    ['Serial Number',m?.serial||a?.serial],
    ['Functional Location',m?.functionalLocation||a?.functional_location],
    ['Area / lokasi',m?.area||a?.location],
    ['Spesifikasi',m?.specification||a?.specification],
    ['Status operasi',truth.operatingStatus],
    ['Health score',truth.healthScore],
    ['3D source',truth.source3D],
    ['3D detail',truth.detail3D],
    ['Data confidence',truth.dataConfidence],
    ['Posisi',truth.position],
    ['Discovery status',truth.discoveryStatus],
    ['Node terpilih',meta?.name],
    ['Tingkat struktur',meta?.level?('L'+meta.level):null],
    ['Referensi teknis',truth.sourceCount?truth.sourceCount+' sumber':'UNKNOWN']
   ];
   $('#panel-content').innerHTML=`<h3>Data aset</h3><p class="subtle">Nilai yang tidak didukung sumber tidak diubah menjadi angka atau status pasti. UNKNOWN, UNVERIFIED, APPROXIMATE, dan CONFLICTING ditampilkan apa adanya.</p><dl class="data-list">${rows.map(([k,v])=>pair(k,v)).join('')}</dl><div class="card"><h4>Konteks aktif</h4><p>${esc(meta?.name||'Mesin')} · posisi ${esc(truth.position)}</p></div>`;
 }else if(tab==='exterior'){
  $('#panel-content').innerHTML=`<h3>Buka Interior</h3><p class="subtle">Mode ini membuka cover/panel luar agar <b>seluruh interior mesin terlihat</b>. Rangka utama, frame, support, support bridge, tangga, landing, dan struktur penyangga tetap ditampilkan.</p><div class="card accent exterior-overview"><h4>${isInteriorOpen()?'Interior terbuka · interior terlihat':'Interior tertutup · tampilan normal'}</h4><p>${isInteriorOpen()?'Cover luar sedang disembunyikan dan detail interior dipaksa tampil penuh. Pilih area di bawah hanya untuk memusatkan kamera; area lain tetap tersedia.':'Tekan Buka Semua Cover untuk melihat cylinder, roller, gripper, drive, dampening, inking, transfer, dan detail internal lain yang sudah dimodelkan.'}</p><div class="actions"><button id="exterior-open" class="primary">Buka Semua Cover</button><button id="exterior-close" class="secondary">Tutup Interior</button></div></div><h4>Fokus area saat interior terbuka</h4><div class="exterior-area-list">${exteriorAreas().map(area=>`<button data-exterior-area="${esc(area.key)}" class="exterior-area-button ${interiorFocus()===area.key?'active':''}"><span><b>${esc(area.name)}</b><small>Interior + frame/support</small></span><span>Fokus ›</span></button>`).join('')}</div><p class="subtle">Mode ini hanya mengubah visibilitas cover dan level detail. Dimensi, posisi, serta geometri frame/support tidak diubah.</p>`;
  on('#exterior-open',showExteriorAll);on('#exterior-close',resetExteriorView);
  document.querySelectorAll('[data-exterior-area]').forEach(b=>b.onclick=()=>focusExteriorArea(b.dataset.exteriorArea));
 }else{
   renderReferencePanel();
 }
}
function renderStatus(){
 const l=activeLayout(),machineCount=$('#machine-count'),truth=layoutTruth(l),placement=placementForMachine?.(machineRecordForRoute(MACHINE_KEY)?.machineId||null)||null,assetStatus=assetTruth(state?.asset,{placement,sourceCount:TECHNICAL_SOURCES.length});
 if(machineCount)machineCount.textContent=MACHINE_REGISTRY_STATS.total.toLocaleString('id-ID');
 $('#layout-status').textContent=l?`DWG · ${truth.planGeometry}`:'DWG · UNKNOWN';
 $('#scale-status').textContent=`Skala · ${truth.scale}`;
 $('#lod-status').textContent=engine?.view==='factory'?`Elevasi · ${truth.elevation}`:`3D · ${assetStatus.source3D}`;
}
async function request(path,{method='GET',data,base=apiBase,key=token}={}){
 if(!base)throw new Error('Layanan data belum disambungkan.');
 const headers={Authorization:'Bearer '+key};if(data!==undefined)headers['Content-Type']='application/json';if(method!=='GET'&&!path.startsWith('/api/superadmin/'))headers['If-Match']=String(state.revision);
 const res=await fetch(base+path,{method,headers,body:data===undefined?undefined:JSON.stringify(data),signal:AbortSignal.timeout(15000)});let result;try{result=await res.json();}catch{throw new Error('Layanan data mengirim respons yang tidak dikenali.');}if(!res.ok)throw new Error(result.error||'Layanan data tidak dapat merespons.');return result;
}
const CACHE_DB_NAME='bmj-digitaltwin-cache-v2';
class CacheManager {
 async open(){return new Promise((resolve,reject)=>{const r=indexedDB.open(CACHE_DB_NAME,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('data'))r.result.createObjectStore('data')};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
 async get(key){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction('data'),r=tx.objectStore('data').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);tx.oncomplete=()=>db.close();});}
 async set(key,value){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction('data','readwrite');tx.objectStore('data').put(value,key);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);});}
 async clear(){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction('data','readwrite');tx.objectStore('data').clear();tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);});}
}
const cache=new CacheManager();
let cacheEnabled=readConnectionSetting('cacheEnabled','0')==='1';
function updateConnectionTruth(){
 const label=connectionTruth({online:navigator.onLine,cached:cachedDataActive,connected:Boolean(role)});
 const el=$('#connection');if(el)el.textContent=label;return label;
}
async function acceptState(next){state=next;engine?.loadLayout(activeLayout());engine?.applySceneOverrides(next.sceneOverrides||{});if(engine?.view==='factory')engine.setView('factory',state);renderStatus();renderPanel();if(cacheEnabled){try{await cache.set(apiBase,{state,savedAt:new Date().toISOString()});}catch{toast('Data berhasil dimuat, tetapi salinan di perangkat tidak dapat disimpan.',true);}}}
function setView(view){
 const l=activeLayout();
 if(view==='factory'&&!l){layoutDialog();return;}
 if(view==='factory'&&engine?.isPrintingSimulationActive()){updateSimulationPanel(engine.stopPrintingSimulation());simulationOwnsExterior=false;}if(view==='factory'&&isInteriorOpen())exitExteriorMode();editing=false;if(engine)engine.onTransform=null;setExplodeLevel(0);selectedPart=null;engine?.setView(view,state);
 $$('.rail>button').forEach(b=>b.classList.remove('active'));
 $(view==='factory'?'#nav-machine':'#nav-assets')?.classList.add('active');
 const machineName=IS_OFFSET10?'OFFSET 10':IS_APM2?'APM 2':IS_SHEETING?'SHEETING LEXUS':IS_GENERIC?GENERIC_CONFIG.machine.name:MACHINE_KEY==='offset5'?'OFFSET 5':'Mesin';
 const machineSubtitle=IS_OFFSET10?'Heidelberg Speedmaster · CX 104 · Full UV + FoilStar':IS_APM2?'BOBST · SP 102 · 1994 · Automatic Flatbed Die Cutter':IS_SHEETING?'LEXUS · HSM-CTM7 · SBM-2 · RIGHT → LEFT':IS_GENERIC?(GENERIC_CONFIG.label+' · '+(GENERIC_CONFIG.machine.model||'Model belum tersedia')):MACHINE_KEY==='offset5'?'OFU-1 · Heidelberg Speedmaster · CD 102-8+L':'Pilih mesin untuk membuka model detail';
 $('#view-kicker').textContent=view==='factory'?'PABRIK · 3D':'TAMPILAN MESIN 3D';
 $('#view-title').textContent=view==='factory'?'Pabrik Packaging Offset':machineName;
 $('#view-subtitle').textContent=view==='factory'?'Posisi mesin dan area produksi':machineSubtitle;
 const viewLayoutTruth=layoutTruth(l),viewAssetTruth=assetTruth(state?.asset,{placement:placementForMachine?.(machineRecordForRoute(MACHINE_KEY)?.machineId||null)||null,sourceCount:TECHNICAL_SOURCES.length});
 $('#lod-status').textContent=view==='factory'?`Elevasi · ${viewLayoutTruth.elevation}`:`3D · ${viewAssetTruth.source3D}`;
 $('#geometry-caption').textContent=view==='factory'?'Pabrik · 3D':'Model '+machineName;
 const title=$('#notice-title'),note=$('#notice-text');
 if(title&&note){
  title.textContent=view==='factory'?'Informasi denah':'Catatan tampilan';
  note.textContent=view==='factory'?'Posisi mesin ditampilkan mengikuti denah yang tersedia. Beberapa tinggi bangunan masih berupa perkiraan visual.':(IS_OFFSET10?'Offset 10 direkonstruksi dari dokumen proyek BMJ dan referensi resmi Heidelberg; foto aktual mesin belum tersedia.':IS_APM2?'APM 2 memakai identitas database BMJ dan referensi legacy BOBST SP 102; suffix mesin dan foto aktual belum tersedia.':IS_SHEETING?'Sheeting mempertahankan baseline visual yang sudah dikoreksi: input reel di kanan, web bergerak kanan ke kiri, lalu cutter, delivery/layboy dan output stack di kiri.':'Model dibuat dengan mengacu pada foto aktual dan dokumen mesin yang tersedia.');
 }
 renderPanel();redrawPlantPlan();emitDomainState({activeSection:view==='factory'?'factory':'asset',sceneMode:view==='factory'?'factory':'machine'});
}
function showHome({historyMode='none'}={}){
 if(historyMode==='push')pushContextHistory({asset:null,node:null,scene:'factory',view:getAppState().viewMode||'3d',camera:'iso'});
 qStaticFallbackClear();engine?.clearFactorySelection();setView('factory');engine?.fit(engine.factory,'iso');
 document.title='Packaging Offset Factory Digital Twin';
 setAppInspector(false,'overview');
 $$('.rail>button').forEach(b=>b.classList.remove('active'));
 $('#nav-machine')?.classList.add('active');
 $('#view-kicker').textContent='PABRIK · DIGITAL TWIN';
 $('#view-title').textContent='Packaging Offset Factory';
 $('#view-subtitle').textContent='Bangunan, area, mesin, dan utilitas dalam satu konteks';
 $('#geometry-caption').textContent='Pabrik · Seluruh Area';
 $('#scene-hint').textContent='Klik aset untuk memilih · seret untuk memutar · zoom dengan cubit/scroll';
 setDomainState({inspectionMode:{explode:false,explodeLevel:0,isolate:false,interior:false,interiorFocus:null}});setActiveTaxonomyId(ACTIVE_ROOT);selectedPart=null;setDomainState({inspectorState:{tab:'overview'}});engine?.template?.reset?.();engine?.clearPartLabels?.();if(engine)engine.isolated=false;
 emitDomainState({selectedAsset:null,selectedArea:null,selectedNode:null,selectedSystem:null,activeReference:null,activeSection:'factory',sceneMode:'factory',cameraPreset:'iso',inspectorState:{open:false,tab:'overview'}});
 if(!engine){
  // No WebGL: show the actual CAD-backed 2D drawing instead of an empty 3D viewport.
  document.body.classList.add('workspace-2d');
  document.body.classList.add('webgl-unavailable');
  $('#mode-2d')?.classList.add('active');
  const three=$('#mode-3d');
  if(three){three.classList.remove('active');three.disabled=true;three.title='3D belum tersedia di perangkat ini';}
  $('#view-kicker').textContent='DENAH PABRIK · 2D';
  $('#view-subtitle').textContent='Penampil 3D belum tersedia di perangkat ini. Denah 2D tetap dapat digunakan.';
  $('#scene-hint').textContent='Pilih posisi aset melalui menu Aset atau denah 2D.';
  history.replaceState(history.state,'',buildContextUrl({...getAppState(),viewMode:'2d'}));
  emitDomainState({viewMode:'2d'});
 }
}
function connectionDialog({back=null}={}){
 modal('Sambungkan Data',`<p>Gunakan bagian ini jika Anda memiliki akses ke data tersimpan bersama. Untuk sekadar mencoba tampilan 3D, mode lokal sudah dapat digunakan.</p><form id="connection-form"><label for="api-base">Alamat layanan data</label><input id="api-base" type="url" value="${esc(apiBase)}" placeholder="https://alamat-layanan-data" required><label for="api-token">Kunci akses</label><input id="api-token" type="password" autocomplete="off" required><label class="check"><input id="enable-cache" type="checkbox" ${cacheEnabled?'checked':''}> Simpan salinan data di perangkat ini</label><p class="subtle">Gunakan pada perangkat pribadi jika ingin membuka data lebih cepat saat koneksi tidak stabil.</p><div class="actions"><button type="submit" class="primary">Sambungkan</button><button type="button" id="disconnect" class="secondary">Gunakan Mode Lokal</button></div><p id="connection-error" class="inline-error" role="alert"></p></form><div class="settings-section"><button id="superadmin-login" class="secondary">Masuk Superadmin dengan Kata Sandi</button></div>`,{back});
 $('#connection-form').onsubmit=async e=>{e.preventDefault();const submit=e.target.querySelector('[type=submit]');submit.disabled=true;try{const url=new URL($('#api-base').value.trim());if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(url.hostname))throw new Error('Alamat layanan harus menggunakan koneksi aman.');if(url.username||url.password||url.search||url.hash||url.pathname!=='/')throw new Error('Masukkan alamat utama layanan data.');const base=url.origin,key=$('#api-token').value,session=await request('/api/session',{base,key});const next=await request('/api/state',{base,key});apiBase=base;token=key;role=session.role;cacheEnabled=$('#enable-cache').checked;localStorage.setItem(CONNECTION_STORAGE.apiBase,base);localStorage.removeItem(LEGACY_CONNECTION_STORAGE.apiBase);localStorage.setItem(CONNECTION_STORAGE.cacheEnabled,cacheEnabled?'1':'0');localStorage.removeItem(LEGACY_CONNECTION_STORAGE.cacheEnabled);if(!cacheEnabled)await cache.clear();await acceptState(next);cachedDataActive=false;updateConnectionTruth();closeModal();toast('Data berhasil disambungkan.');}catch(err){$('#connection-error').textContent=err.message;}finally{submit.disabled=false;}};
 on('#superadmin-login',()=>{const loginBase=($('#api-base')?.value||apiBase||location.origin).trim();modal('Masuk Superadmin',`<form id="superadmin-form"><p>Masuk dengan kata sandi Superadmin. Gunakan kata sandi Superadmin Anda. Setelah masuk pertama kali, segera ganti kata sandi di Pengaturan.</p><label for="superadmin-password">Kata sandi</label><input id="superadmin-password" type="password" autocomplete="current-password" required><div class="actions"><button type="submit" class="primary">Masuk Superadmin</button></div><p id="superadmin-error" class="inline-error" role="alert"></p></form>`,{back:()=>connectionDialog({back})});$('#superadmin-form').onsubmit=async event=>{event.preventDefault();const button=event.target.querySelector('button');button.disabled=true;try{const base=new URL(loginBase,location.href).origin;const login=await request('/api/superadmin/login',{method:'POST',base,key:'',data:{password:$('#superadmin-password').value}});const next=await request('/api/state',{base,key:login.token});apiBase=base;token=login.token;role='superadmin';localStorage.setItem(CONNECTION_STORAGE.apiBase,base);localStorage.removeItem(LEGACY_CONNECTION_STORAGE.apiBase);await acceptState(next);updateConnectionTruth();closeModal();toast(login.passwordChangeRequired?'Masuk berhasil. Segera ganti kata sandi di Pengaturan.':'Masuk Superadmin berhasil.');}catch(error){$('#superadmin-error').textContent=error.message;}finally{button.disabled=false;}};});
 on('#disconnect',async()=>{token='';role=null;await cache.clear();cacheEnabled=false;cachedDataActive=false;localStorage.removeItem(CONNECTION_STORAGE.cacheEnabled);localStorage.removeItem(LEGACY_CONNECTION_STORAGE.cacheEnabled);state=structuredClone(initialState);engine?.loadLayout(bundledLayout);showHome({historyMode:'none'});renderStatus();updateConnectionTruth();closeModal();toast('Mode lokal aktif.');});
}
function layoutDialog(){
 const l=activeLayout();
 const adminTools=(role==='admin'||role==='superadmin')?`<h3>Pengaturan denah</h3><p class="subtle">Gunakan hanya jika Anda perlu mengganti atau menyimpan penyesuaian posisi.</p><label for="layout-file">Pilih file pengaturan denah</label><input id="layout-file" type="file" accept=".json,application/json"><div class="actions"><button id="mapping" class="secondary">Atur Denah</button></div><p id="layout-error" class="inline-error" role="alert"></p>`:'';
 const truth=layoutTruth(l),referencePlacement=placementForMachine?.(FOUNDATION_SCOPE.referenceMachineId)||null,fidelity=l?(l.dwgFidelity||buildDwgFidelityLedger(l)):null;
 const counts=fidelity?.semantic3DCounts||{},transform=fidelity?.transform||{},unimplemented=fidelity?.unimplemented||[];
 const fidelityHtml=fidelity?`<details class="dwg-fidelity-ledger"><summary>Fidelity DWG <strong>${esc(fidelity.preservation)}</strong></summary><div class="dwg-fidelity-body"><p>Ledger ini membedakan source CAD yang dipertahankan dari geometry yang sudah dipromosikan ke 3D. Raw entity parity tidak diklaim bila extractor hanya menyediakan data yang sudah dinormalisasi.</p><dl class="system-info-grid">${pair('Source entity',fidelity.sourceEntityCount??'UNKNOWN')+pair('Source layer',fidelity.sourceLayerCount??'UNKNOWN')+pair('Source block',fidelity.sourceBlockCount??'UNKNOWN')+pair('Reference segment',fidelity.referenceSegmentCount)+pair('Floor 3D',counts.floor??0)+pair('Wall 3D',counts.walls??0)+pair('Column 3D',counts.columns??0)+pair('Door 3D',counts.doors??0)+pair('Opening / curtain',counts.openings??0)+pair('Label source',counts.labels??0)+pair('Axis mapping',transform.axisMap||'UNKNOWN')+pair('Scale factor',transform.scale??'UNKNOWN')+pair('Rotation',transform.rotation??'UNKNOWN')+pair('Origin X / Y',`${transform.originX??'UNKNOWN'} / ${transform.originY??'UNKNOWN'}`)}</dl><div class="dwg-unimplemented"><h4>Belum diimplementasikan sebagai 3D fisik</h4>${unimplemented.map(item=>`<div class="dwg-unimplemented-row"><strong>${esc(item.entityType)}</strong><span>${esc(item.semanticType)} · ${esc(item.threeDStatus)}</span><small>${esc(item.reason)}</small></div>`).join('')}</div></div></details>`:'';
 modal('Denah Pabrik',`<div class="card accent"><h4>${l?'DWG berhasil dimuat':'DWG belum tersedia'}</h4><p>${l?'Geometri plan, skala, elevasi, posisi, dan cakupan ekstraksi memiliki status verifikasi terpisah.':'Belum ada sumber DWG yang dapat ditampilkan.'}</p></div>${l?`<dl class="data-list">${pair('Source',truth.source)+pair('Nama sumber',truth.sourceFile)+pair('Plan geometry',truth.planGeometry)+pair('Source units',truth.sourceUnits)+pair('Scale',truth.scale)+pair('Elevation',truth.elevation)+pair('Posisi '+FOUNDATION_SCOPE.referenceAssetName,positionVerification(referencePlacement))+pair('Area yang dikenali',Array.isArray(l.functionalZones)?l.functionalZones.length+' area':'UNKNOWN')}</dl>${fidelityHtml}<div class="actions"><button id="view-layout" class="primary">Buka Denah</button></div>`:''}${adminTools}`);
 if(l)on('#view-layout',()=>{closeModal();setView('factory');});
 if((role==='admin'||role==='superadmin'))on('#mapping',mappingDialog);
 const input=$('#layout-file');
 if(input)input.onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>4*1024*1024)throw new Error('Ukuran file terlalu besar.');const layout=validateLayout(JSON.parse(await f.text()));const next=await request('/api/layout',{method:'PUT',data:layout});await acceptState(next);closeModal();setView('factory');toast('Denah berhasil diperbarui.');}catch(err){$('#layout-error').textContent=err.message;}};
}
function foundationStatusDialog({back=null}={}){
 const l=activeLayout(),layoutStatus=layoutTruth(l),fidelity=l?(l.dwgFidelity||buildDwgFidelityLedger(l)):buildDwgFidelityLedger(null);
 const appState=getAppState()||{},selectedMachine=machineRecordForRoute(appState.selectedAsset),placement=selectedMachine?placementForMachine(selectedMachine.machineId):null;
 const assetStatus=selectedMachine?assetTruth(state?.asset,{placement,sourceCount:TECHNICAL_SOURCES.length}):null;
 const placements=Array.isArray(l?.placements)?l.placements:[],mapped=placements.filter(p=>p.status!=='UNIDENTIFIED'),unidentified=placements.filter(p=>p.status==='UNIDENTIFIED');
 const connection=connectionTruth({online:navigator.onLine,cached:cachedDataActive,connected:Boolean(role)});
 const friendly=value=>String(value??'Belum tersedia').replaceAll('UNKNOWN','Belum diketahui').replaceAll('UNVERIFIED','Belum diverifikasi').replaceAll('APPROXIMATE','Perkiraan').replaceAll('CONFLICTING','Perlu ditinjau');
 modal('Status Data & Sumber',`<div class="card accent"><h4>Kondisi data Digital Twin</h4><p>Ringkasan ini menunjukkan data yang tersedia, yang masih berupa perkiraan, dan bagian yang perlu diverifikasi.</p></div><h3>Pabrik</h3><dl class="data-list">${pair('Sumber denah',friendly(layoutStatus.sourceFile||layoutStatus.source))+pair('Geometri denah',friendly(layoutStatus.planGeometry))+pair('Skala',friendly(layoutStatus.scale))+pair('Ketinggian bangunan',friendly(layoutStatus.elevation))+pair('Kecocokan sumber',friendly(fidelity?.preservation))+pair('Posisi terpetakan',mapped.length)+pair('Posisi belum teridentifikasi',unidentified.length)}</dl>${selectedMachine?`<h3>Mesin terpilih</h3><dl class="data-list">${pair('Nama',selectedMachine.name)+pair('Model',selectedMachine.model||'Belum tersedia')+pair('Posisi',friendly(assetStatus?.position))+pair('Dasar model 3D',friendly(assetStatus?.source3D))+pair('Tingkat detail',friendly(assetStatus?.detail3D))+pair('Kepastian data',friendly(assetStatus?.dataConfidence))}</dl>`:''}<h3>Koneksi</h3><dl class="data-list">${pair('Layanan data',connection)+pair('Data tersimpan di perangkat',cacheEnabled?(cachedDataActive?'Sedang digunakan':'Aktif'):'Tidak aktif')}</dl><div class="actions"><button id="status-open-layout" class="primary">Lihat kecocokan denah</button></div>`,{back});
 on('#status-open-layout',()=>{closeModal();layoutDialog();});
}
function download(name,data){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function mappingDialog(){
 const l=state.layout;
 if((role!=='admin'&&role!=='superadmin')){toast('Pengaturan denah memerlukan izin pengaturan.',true);return;}
 if(!l){toast('Sambungkan data dan simpan denah terlebih dahulu.',true);return;}
 const layers=[...new Set(l.entities.map(e=>e.layer))];
 const semantics=[['UNKNOWN','Belum dipilih'],['FLOOR','Lantai'],['BOUNDARY','Batas Area'],['WALL','Dinding'],['COLUMN','Kolom'],['DOOR','Pintu'],['OPENING','Bukaan'],['CORRIDOR','Jalur'],['AREA','Area'],['FOOTPRINT','Posisi Mesin'],['LABEL','Label'],['DIMENSION','Ukuran'],['STAIRS','Tangga'],['RAMP','Ramp']];
 modal('Atur Denah',`<p>Pilih jenis informasi untuk setiap lapisan, lalu sesuaikan posisi dan ukuran bila diperlukan.</p><form id="mapping-form">${layers.map((layer,i)=>`<div class="layer-row"><span>${esc(layer)}</span><select aria-label="Jenis ${esc(layer)}" data-layer="${i}">${semantics.map(([value,label])=>`<option value="${value}" ${(l.layerMapping?.[layer]||'UNKNOWN')===value?'selected':''}>${label}</option>`).join('')}</select></div>`).join('')}<h3>Posisi denah</h3><label for="units">Satuan</label><select id="units">${['UNKNOWN','mm','cm','m','inch','foot'].map(u=>`<option ${l.transform.sourceUnits===u?'selected':''}>${u}</option>`).join('')}</select><div class="form-row"><div><label for="origin-x">Titik acuan X</label><input id="origin-x" type="number" step="any" value="${l.transform.originX}" required></div><div><label for="origin-y">Titik acuan Y</label><input id="origin-y" type="number" step="any" value="${l.transform.originY}" required></div><div><label for="map-rotation">Rotasi (°)</label><input id="map-rotation" type="number" step="any" value="${l.transform.rotation}" required></div></div><h3>Kalibrasi ukuran</h3><div class="form-row"><div><label for="ref-source">Jarak pada denah</label><input id="ref-source" type="number" min="0.000001" step="any"></div><div><label for="ref-real">Jarak sebenarnya (m)</label><input id="ref-real" type="number" min="0.000001" step="any"></div></div><label for="ref-note">Catatan acuan</label><input id="ref-note"><div class="actions"><button type="submit" class="primary">Simpan</button></div><p id="mapping-error" class="inline-error" role="alert"></p></form>`);
 $('#mapping-form').onsubmit=async e=>{e.preventDefault();try{const next=structuredClone(l);next.layerMapping={};$$('[data-layer]').forEach(sel=>next.layerMapping[layers[+sel.dataset.layer]]=sel.value);const u=$('#units').value,scales={mm:.001,cm:.01,m:1,inch:.0254,foot:.3048};next.transform={sourceUnits:u,originX:+$('#origin-x').value,originY:+$('#origin-y').value,rotation:+$('#map-rotation').value,scale:scales[u]??null};if(u==='UNKNOWN'&&($('#ref-source').value||$('#ref-real').value)){const sourceDistance=+$('#ref-source').value,knownDistance=+$('#ref-real').value,note=$('#ref-note').value.trim();if(!(sourceDistance>0&&knownDistance>0&&note))throw new Error('Lengkapi kedua jarak dan catatan acuan.');next.transform.scale=knownDistance/sourceDistance;next.transform.calibration={sourceDistance,knownDistance,note};}validateLayout(next);await acceptState(await request('/api/layout',{method:'PUT',data:next}));closeModal();setView('factory');toast('Pengaturan denah disimpan.');}catch(err){$('#mapping-error').textContent=err.message;}};
}
function placementForMachine(machineId){
 return bundledLayout?.fleet?.find(item=>item?.placement?.machineId===machineId)?.placement||null;
}
function positionStatusLabel(status){
 const labels={'CAD FOOTPRINT':'Footprint CAD','CAD LABEL':'Label CAD','CAD ZONE':'Zona CAD','CAD ROOM':'Ruang CAD','SOURCE ANNOTATION / REVIEW':'Anotasi sumber · perlu ditinjau','POSITION REVIEW REQUIRED':'Posisi perlu ditinjau'};
 return labels[status]||status||'Posisi perlu ditinjau';
}
function machineRecordForRoute(route){
 const key=String(route||'').trim(),normalized=normalizeMachineKey(key);
 return MACHINE_REGISTRY_BY_ID.get(key)||MACHINE_REGISTRY.find(machine=>normalizeMachineKey(machineRoute(machine))===normalized)||null;
}
function currentViewMode(){return getAppState().viewMode==='2d'?'2d':'3d';}
function pushContextHistory({asset=null,node=null,scene='factory',view=currentViewMode(),camera='iso'}={}){
 const snapshot={asset:asset||null,node:node||null,scene:scene==='machine'?'machine':'factory',view:view==='2d'?'2d':'3d',camera:camera==='top'?'top':'iso'};
 const url=buildContextUrl(snapshot),next=url.pathname+url.search+url.hash,current=location.pathname+location.search+location.hash;
 if(next===current){history.replaceState(snapshot,'',url);return false;}
 history.pushState(snapshot,'',url);return true;
}
function resetMachineInspectionContext(){
 if(engine?.isPrintingSimulationActive?.()){updateSimulationPanel(engine.stopPrintingSimulation());}
 if(isInteriorOpen())exitExteriorMode();
 if(engine){engine.template?.reset?.();engine.clearPartLabels?.();engine.isolated=false;}
 setDomainState({inspectionMode:{isolate:false,interiorFocus:null}});selectedPart=null;setActiveTaxonomyId(ACTIVE_ROOT);setExplodeLevel(0);simulationOwnsExterior=false;setDomainState({inspectorState:{tab:'overview'}});
 $('#tool-explode')?.classList.remove('active');$('#tool-isolate')?.classList.remove('active');$('#tool-interior')?.classList.remove('active');
}
function applyRestoredCamera(preset='iso'){
 if(!engine)return;const mode=preset==='top'?'top':'iso',target=engine.view==='factory'?(engine.currentFactoryTarget?.()||engine.factory):(selectedPart||engine.machine);
 if(target)engine.fit(target,mode);
 $$('[data-camera]').forEach(button=>button.classList.toggle('active',button.dataset.camera===mode));
}
function selectFactoryAssetContext(machine,{historyMode='none',openDialog=false,focus=true}={}){
 if(!machine)return false;
 if(historyMode==='push')pushContextHistory({asset:machine.machineId,node:null,scene:'factory',view:currentViewMode(),camera:'iso'});
 if(engine?.view!=='factory')setView('factory');
 if(focus)engine?.focusFactoryAsset(machine.machineId);else engine?.selectFactoryAsset(machine.machineId);
 const policy=foundationAssetPolicy(machine,placementForMachine(machine.machineId));
 $('#geometry-caption').textContent='Pabrik · '+machine.name;
 $('#scene-hint').textContent=policy.canOpenTechnical3D?'Aset dipilih · buka detail untuk melihat model 3D':'Posisi dipilih · model 3D belum tersedia';
 emitDomainState({selectedAsset:machine.machineId,selectedArea:machine.area||null,selectedNode:null,activeReference:null,activeSection:'asset',sceneMode:'factory',cameraPreset:'iso'});
 if(openDialog)machineDetailDialog(machine);
 return true;
}
function focusFoundationPlaceholder(machine,{historyMode='push',openDialog=false}={}){
 return selectFactoryAssetContext(machine,{historyMode,openDialog,focus:true});
}
function machineDetailDialog(machine){
 const placement=placementForMachine(machine.machineId),policy=foundationAssetPolicy(machine,placement),primary=policy.canOpenTechnical3D;
 const modelAvailable=primary&&!$('#mode-3d')?.disabled;
 const status=primary?'Model 3D tersedia':'Posisi pada denah';
 const copy=primary?'Buka model mesin untuk melihat struktur, simulasi, dan referensi yang tersedia.':'Model 3D belum tersedia untuk aset ini. Posisi pada denah tetap dapat diperiksa.';
 const truth=primary&&isFoundationPrimary(machine)?assetTruth(state?.asset,{placement,sourceCount:TECHNICAL_SOURCES.length}):null;
 const summaryData=pair('Area',machine.area)+pair('Model',machine.model||'Belum tersedia')+pair('Tahun',machine.year||'Belum tersedia')+pair('Posisi',truth?.position||positionVerification(placement));
 const primaryData=primary?pair('Machine ID',machine.machineId)+pair('Area',machine.area)+pair('Model',machine.model)+pair('Serial Number',machine.serial)+pair('SAP Functional Location',machine.functionalLocation)+pair('SAP Code',machine.sapCode)+pair('Tahun',machine.year)+pair('3D source',truth?.source3D||machine.source)+pair('3D detail',truth?.detail3D||'Model berbasis referensi')+pair('Data confidence',truth?.dataConfidence||'Sesuai sumber tersedia')+pair('Posisi',truth?.position||positionVerification(placement))+pair('Dasar posisi',positionStatusLabel(policy.positionStatus))+pair('Sumber identitas',machine.source==='USER_CONFIRMED'?'Konfirmasi pengguna':'Registry mesin'):'';
 const placeholderData=pair('ID posisi',machine.machineId)+pair('Area',machine.area)+pair('3D source','NOT_IMPLEMENTED · LAYOUT PLACEHOLDER')+pair('3D detail','NOT_IMPLEMENTED')+pair('Posisi',positionVerification(placement))+pair('Dasar posisi',positionStatusLabel(policy.positionStatus))+pair('Status detail','Belum dibuka pada fase fondasi');
 const technicalData=primary?primaryData:placeholderData;
 closeModal();setDomainState({inspectorState:{tab:'overview'}});showPanel();
 $('#panel-content').innerHTML=`<section class="context-summary"><div class="context-summary-head"><small>MESIN / PERALATAN TERPILIH</small><h3>${esc(machine.name)}</h3><p>${esc([machine.sapCode,machine.model].filter(Boolean).join(' · ')||machine.area||'Aset pabrik')}</p></div><div class="card accent context-status-card"><h4>${esc(status)}</h4><p>${esc(copy)}</p></div><dl class="data-list context-summary-data">${summaryData}</dl>${primary&&machine.note?`<div class="card context-note"><h4>Catatan</h4><p>${esc(machine.note)}</p></div>`:''}<details class="technical-details"><summary>Informasi teknis</summary><div class="technical-details-body"><dl class="data-list">${technicalData}</dl></div></details><div class="actions context-primary-actions single-action"><button id="${modelAvailable?'open-machine-3d':'focus-layout-asset'}" class="primary">${modelAvailable?'Buka Model 3D':'Pusatkan di Pabrik'}</button></div></section>`;
 emitDomainState({selectedAsset:machine.machineId,selectedArea:machine.area||null,selectedNode:null,activeReference:null,activeSection:'asset',sceneMode:'factory',cameraPreset:'iso',inspectorState:{open:true,tab:'overview'}});
 renderContextBreadcrumb();
 if(modelAvailable)on('#open-machine-3d',()=>switchActiveMachine(machineRoute(machine)));
 else on('#focus-layout-asset',()=>selectFactoryAssetContext(machine,{historyMode:'none',openDialog:false,focus:true}));
 return true;
}
window.addEventListener('bmj:machinecontextrequest',event=>{
 const record=machineRecordForRoute(event.detail?.selectedAsset);
 if(!record){assetDialog();return;}
 machineDetailDialog(record);
 if(!canOpenTechnical3D(record))toast(`${event.detail?.action||'Inspeksi'} ${record.name} belum tersedia. Detail posisi aset tetap ditampilkan.`,true);
});
function ensureMachineInspectionContext(action='Inspeksi'){
 const selectedAsset=getAppState().selectedAsset;
 if(engine?.view==='machine'&&canOpenTechnical3D(selectedAsset))return true;
 dispatchEvent(new CustomEvent('bmj:machinecontextrequest',{detail:{selectedAsset,action}}));
 return false;
}
async function switchActiveMachine(route,{historyMode='push'}={}){
 if(!canOpenTechnical3D(route)){
  const record=machineRecordForRoute(route);
  if(record){focusFoundationPlaceholder(record,{historyMode,openDialog:true});return false;}
  toast('Aset belum memiliki konteks tata letak yang dapat dibuka.',true);return false;
 }
 const normalizedRoute=normalizeMachineKey(route);if(!normalizedRoute){assetDialog();return false;}
 if(engine?.isPrintingSimulationActive?.()||currentSimulationState().active)stopPrintingSimulation({restoreExterior:true});
 const record=machineRecordForRoute(normalizedRoute),assetId=record?.machineId||normalizedRoute,assetName=record?.name||normalizedRoute,threeMode=$('#mode-3d'),targetView=threeMode?.disabled?'2d':'3d';
 if(targetView==='2d'){if(record){selectFactoryAssetContext(record,{historyMode,openDialog:true});return false;}toast('Model 3D belum tersedia di perangkat ini.',true);return false;}
 if(historyMode==='push')pushContextHistory({asset:assetId,node:null,scene:'machine',view:targetView,camera:'iso'});
 if(historyMode==='push'&&targetView==='3d')threeMode?.click();
 closeModal();resetMachineInspectionContext();
 if(normalizedRoute===MACHINE_KEY&&engine?.machineKey===normalizedRoute){
  setView('machine');showPanel();renderPanel('overview');engine?.fit(engine.machine,'iso');$('#engine-status').textContent=assetName+' · model 3D siap';
  emitDomainState({selectedAsset:assetId,selectedNode:null,activeReference:null,activeSection:'asset',sceneMode:'machine',cameraPreset:'iso',inspectorState:{open:true,tab:'overview'}});return true;
 }
 document.body.classList.add('scene-switching');
 const boot=$('#boot');if(boot){boot.hidden=false;boot.innerHTML='<strong>Menyiapkan '+esc(assetName)+'…</strong><p>Memuat model dan struktur mesin.</p>';}
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 const previousRoute=MACHINE_KEY,previousState=state,previousAsset=getAppState().selectedAsset;
 try{
  configureActiveMachine(normalizedRoute);applyActiveMachineState();UNIVERSAL_SEARCH_INDEX=null;setActiveTaxonomyId(ACTIVE_ROOT);
  applyMachineShell();
  if(engine){if(!await engine.switchMachine(MACHINE_KEY))throw new Error('Model belum dapat dibuka');engine.onTaxonomySelect=id=>selectTaxonomy(id,{revealPanel:true,historyMode:'push'});engine.onSimulationUpdate=next=>updateSimulationPanel(next);engine.onReset=()=>{setDomainState({inspectionMode:{isolate:false}});setExplodeLevel(0);selectedPart=null;setActiveTaxonomyId(ACTIVE_ROOT);renderPanel();};engine.onError=handleEngineError;engine.setView('machine',state);}
  else{qStaticFallbackClear();renderStaticMachineFallback(new Error('3D renderer unavailable'));}
  const taxCount=$('#taxonomy-count');if(taxCount)taxCount.textContent=taxonomyStats().total.toLocaleString('id-ID');
  renderStatus();redrawPlantPlan();showPanel();renderPanel('overview');engine?.fit(engine.machine,'iso');$('#engine-status').textContent=assetName+' · model 3D siap';emitDomainState({selectedAsset:assetId,selectedNode:null,activeReference:null,activeSection:'asset',sceneMode:'machine',cameraPreset:'iso',inspectorState:{open:true,tab:'overview'}});return true;
 }catch(error){
  state=previousState;
  if(previousRoute){
   configureActiveMachine(previousRoute);setActiveTaxonomyId(ACTIVE_ROOT);applyMachineShell();
   if(engine?.machineKey!==previousRoute){try{await engine.switchMachine(previousRoute);}catch{}}
   if(engine?.machine){engine.setView('machine',state);engine.fit(engine.machine,'iso');}
  }else{
   clearActiveMachineDescriptor();setActiveTaxonomyId(null);engine?.clearMachineContext?.();showHome({historyMode:'none'});
  }
  emitDomainState({selectedAsset:previousAsset||null,selectedNode:null,sceneMode:previousAsset?'machine':'factory',simulationState:{active:false,running:false,stage:null,progress:0}});
  toast('Model '+assetName+' gagal dimuat: '+error.message,true);return false;}
 finally{if(boot)boot.hidden=true;document.body.classList.remove('scene-switching');}
}
window.addEventListener('bmj:simulateselectedmachine',async event=>{
 const record=machineRecordForRoute(event.detail?.selectedAsset);
 if(!record){assetDialog('',{intent:'simulation'});return;}
 if(!canOpenTechnical3D(record)){machineDetailDialog(record);return;}
 if(!engine){
  configureActiveMachine(machineRoute(record));applyActiveMachineState();showPanel();renderPanel('simulation');
  dispatchEvent(new CustomEvent('bmj:simulationcontextready',{detail:{available:false}}));return;
 }
 const opened=await switchActiveMachine(machineRoute(record));
 if(opened)dispatchEvent(new CustomEvent('bmj:simulationcontextready',{detail:{available:true}}));
});
function qStaticFallbackClear(){const viewport=$('#viewport');viewport?.querySelectorAll('.static-machine-fallback').forEach(node=>node.remove());}
async function restoreHistoryContext(){
 const restored=readUrlState(),route=restored.selectedAsset,node=restored.selectedNode,viewMode=restored.viewMode,cameraPreset=restored.cameraPreset,sceneMode=restored.sceneMode;
 if(!route){
  showHome({historyMode:'none'});applyRestoredCamera(cameraPreset);
  emitDomainState({selectedAsset:null,selectedNode:null,sceneMode:'factory',viewMode,cameraPreset,activeSection:'factory'});return;
 }
 const record=machineRecordForRoute(route);
 if(!record){
  showHome({historyMode:'none'});toast('Aset pada tautan ini tidak ditemukan. Pabrik ditampilkan sebagai gantinya.',true);
  emitDomainState({selectedAsset:null,selectedNode:null,sceneMode:'factory',viewMode,cameraPreset:'iso',activeSection:'factory'});return;
 }
 if(sceneMode==='factory'||!canOpenTechnical3D(route)){
  selectFactoryAssetContext(record,{historyMode:'none',openDialog:false,focus:true});machineDetailDialog(record);applyRestoredCamera(cameraPreset);
  emitDomainState({selectedAsset:record.machineId,selectedNode:null,sceneMode:'factory',viewMode,cameraPreset,activeSection:'asset'});return;
 }
 await switchActiveMachine(machineRoute(record),{historyMode:'none'});
 const restoredNode=node&&TAXONOMY_BY_ID.has(node)?node:null;
 if(restoredNode){setView('machine');selectTaxonomy(restoredNode,{revealPanel:true,historyMode:'none'});}
 else{setActiveTaxonomyId(ACTIVE_ROOT);selectedPart=null;engine?.clearPartLabels?.();showPanel();renderPanel('overview');}
 applyRestoredCamera(cameraPreset);
 emitDomainState({selectedAsset:record.machineId,selectedNode:restoredNode,sceneMode:'machine',viewMode,cameraPreset,activeSection:'asset'});
}
addEventListener('popstate',()=>{dispatchEvent(new CustomEvent('bmj:historynavigationrequest'));restoreHistoryContext().catch(error=>toast('Riwayat tampilan gagal dipulihkan: '+error.message,true));});
function machineRoute(machine){return MACHINE_ROUTE_BY_ID[machine?.machineId]||machine?.machineId||null;}
function searchableTaxonomy(route){
 return isFoundationPrimary(route)?OFFSET5_TAXONOMY:normalizeMachineKey(route)===MACHINE_KEY?ACTIVE_TAXONOMY:[];
}
function searchableSources(route){
 return isFoundationPrimary(route)?OFFSET5_SOURCES:normalizeMachineKey(route)===MACHINE_KEY?TECHNICAL_SOURCES:[];
}
function searchablePhotos(route){
 return isFoundationPrimary(route)?OFFSET5_PHOTOS:normalizeMachineKey(route)===MACHINE_KEY?PHOTO_REGISTRY:[];
}
const normalizeSearchText=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let UNIVERSAL_SEARCH_INDEX=null;
function buildUniversalSearchIndex(){
 if(UNIVERSAL_SEARCH_INDEX)return UNIVERSAL_SEARCH_INDEX;
 const items=[],areas=new Set(),documentSeen=new Set(),photoSeen=new Set();
 for(const machine of MACHINE_REGISTRY){
  const route=machineRoute(machine),primary=isFoundationPrimary(machine);
  if(machine.area)areas.add(machine.area);
  const subtitle=primary?[machine.area,machine.sapCode,machine.model].filter(Boolean).join(' · '):[machine.area,'Posisi pada denah'].filter(Boolean).join(' · ');
  const aliases=primary?['OFFSET 5','OFU-1']:[];
  const keywords=primary?[machine.name,machine.machineId,machine.sapCode,machine.functionalLocation,machine.model,machine.serial,machine.area,...aliases]:[machine.name,machine.machineId,machine.area];
  items.push({type:'machine',group:'MESIN',title:machine.name,subtitle,route,machineId:machine.machineId,has3D:scopedRegistryHas3D(machine),aliases,keywords:keywords.filter(Boolean).join(' ')});
  if(!scopedRegistryHas3D(machine))continue;
  const taxonomy=searchableTaxonomy(route),byId=new Map(taxonomy.map(node=>[node.id,node]));
  const pathFor=node=>{const path=[];let cursor=node,guard=0;while(cursor&&guard++<8){path.unshift(cursor.name||cursor.id);cursor=cursor.parentId?byId.get(cursor.parentId):null;}return path.join(' / ')};
  for(const node of taxonomy){
   if((node.level||1)<=1)continue;
   const path=pathFor(node);
   items.push({type:'component',group:'KOMPONEN',title:node.name||node.id,subtitle:machine.name+' / '+path,route,machineId:machine.machineId,nodeId:node.id,keywords:[node.id,node.name,path,machine.name,machine.model].filter(Boolean).join(' ')});
  }
  for(const source of searchableSources(route)){
   const sourceKey=route+'|'+(source.id||source.title||source.url);if(documentSeen.has(sourceKey))continue;documentSeen.add(sourceKey);
   items.push({type:'reference',group:'DOKUMEN',title:source.title||source.id||'Dokumen',subtitle:[machine.name,source.publisher,source.type].filter(Boolean).join(' · '),route,machineId:machine.machineId,referenceId:source.id||source.title,keywords:[source.title,source.publisher,source.type,source.id,machine.name].filter(Boolean).join(' ')});
  }
  for(const photo of searchablePhotos(route)){
   const photoKey=route+'|'+(photo.filename||photo.id);if(photoSeen.has(photoKey))continue;photoSeen.add(photoKey);
   items.push({type:'reference',group:'FOTO',title:photo.filename||photo.id||'Foto',subtitle:[machine.name,photo.machineZone,photo.viewDirection].filter(Boolean).join(' · '),route,machineId:machine.machineId,referenceId:photo.filename||photo.id,keywords:[photo.filename,photo.machineZone,photo.viewDirection,machine.name].filter(Boolean).join(' ')});
  }
 }
 for(const area of [...areas].filter(Boolean).sort())items.push({type:'area',group:'AREA',title:area,subtitle:'Area pabrik',keywords:area});
 UNIVERSAL_SEARCH_INDEX=items.map(item=>({...item,_search:normalizeSearchText([item.title,item.subtitle,item.keywords].join(' '))}));
 return UNIVERSAL_SEARCH_INDEX;
}
function universalSearchResults(query){
 const q=normalizeSearchText(query).trim();if(!q)return [];
 const words=q.split(/\s+/).filter(Boolean);
 return buildUniversalSearchIndex().map(item=>{
  if(!words.every(word=>item._search.includes(word)))return null;
  const title=normalizeSearchText(item.title),subtitle=normalizeSearchText(item.subtitle);
  const exactAlias=item.type==='machine'&&item.aliases?.some(alias=>normalizeSearchText(alias)===q);
  let score=exactAlias?180:title===q?100:title.startsWith(q)?80:title.includes(q)?60:subtitle.includes(q)?35:20;
  if(item.type==='component'&&title.includes(q))score+=12;
  if(item.type==='machine')score+=25;
  return {...item,score,_search:undefined};
 }).filter(Boolean).sort((a,b)=>b.score-a.score||a.group.localeCompare(b.group,'id')||a.title.localeCompare(b.title,'id')).slice(0,48);
}
addEventListener('bmj:searchrequest',event=>{
 const query=event.detail?.query||'';
 dispatchEvent(new CustomEvent('bmj:searchresults',{detail:{query,results:universalSearchResults(query)}}));
});
addEventListener('bmj:searchselect',async event=>{
 const item=event.detail?.item;if(!item)return;
 try{
  if(item.type==='area'){emitDomainState({selectedArea:item.title});assetDialog(item.title);return;}
  if(item.type==='machine'&&!item.has3D){const record=MACHINE_REGISTRY_BY_ID.get(item.machineId);if(record)await openAssetContext(record);return;}
  if(item.route)await switchActiveMachine(item.route,{historyMode:'push'});
  else setView('machine');
  if(item.type==='component'){
   selectTaxonomy(item.nodeId,{revealPanel:true,historyMode:'push'});
   emitDomainState({selectedAsset:MACHINE_KEY,selectedNode:item.nodeId,activeSection:'asset',sceneMode:'machine'});
  }else if(item.type==='reference'){
   showPanel();renderPanel('sources');emitDomainState({selectedAsset:MACHINE_KEY,activeReference:item.referenceId,activeSection:'reference',sceneMode:'machine'});
  }else{
   showPanel();renderPanel('overview');emitDomainState({selectedAsset:MACHINE_KEY,selectedNode:null,activeSection:'asset',sceneMode:'machine'});
  }
 }catch(error){toast('Hasil pencarian tidak dapat dibuka: '+error.message,true);}
});
function registryBrand(machine){
 const text=[machine.name,machine.model,machine.source].filter(Boolean).join(' ').toUpperCase();
 const rules=[['HEIDELBERG','Heidelberg'],['BOBST','BOBST'],['MASTERWORK','Masterwork'],['MK 9','Masterwork'],['MK 1060','Masterwork'],['PROMATRIX','Heidelberg'],['POLAR','Polar'],['LEXUS','Lexus'],['FOCUSIGHT','Focusight'],['DIANA','Heidelberg'],['ATLAS COPCO','Atlas Copco'],['KAESER','Kaeser'],['SWAN','Swan'],['SANSIN','Sansin'],['ZUND','Zünd'],['SCREEN','SCREEN'],['UPG','UPG']];
 const match=rules.find(([token])=>text.includes(token));return match?.[1]||'Belum teridentifikasi';
}
function registryType(machine){
 const name=String(machine.name||'').toUpperCase();
 if(name.includes('COMPRESSOR'))return'Air Compressor';if(name.includes('AHU'))return'AHU';
 if(name.includes('OFFSET'))return'Printing Press';if(name.includes('AUTOPLATEN')||name.includes('AUTOBLANKING'))return'Die Cutting / Blanking';
 if(name.includes('FOLDER GLUER'))return'Folder Gluer';if(name.includes('INSPECTION'))return'Inspection';
 if(name.includes('PILE TURNER'))return'Pile Turner';if(name.includes('SHEETING'))return'Sheeting';if(name.includes('GUILOTINE'))return'Guillotine';
 if(name.includes('CTP')||name.includes('CTF')||name.includes('ZUND'))return'Prepress';if(name.includes('INKJET'))return'Digital Printing';
 if(name.includes('COLLATOR'))return'Collator';return machine.area==='UTILITY'?'Utility Equipment':'Production Equipment';
}
function registryDataStatus(machine){
 const fields=[machine.model,machine.serial,machine.functionalLocation,machine.sapCode,machine.year],count=fields.filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='').length;
 return count>=4?'Lengkap':count>=2?'Sebagian':'Terbatas';
}
async function openAssetContext(machine){
 if(!machine)return;
 if(!canOpenTechnical3D(machine)){focusFoundationPlaceholder(machine,{historyMode:'push',openDialog:false});machineDetailDialog(machine);return;}
 const route=machineRoute(machine);
 const opened=await switchActiveMachine(route,{historyMode:'push'});
 if(opened)emitDomainState({selectedAsset:machine.machineId,selectedArea:machine.area||null,selectedNode:null,activeReference:null,activeSection:'asset',sceneMode:'machine',cameraPreset:'iso'});
}
function foundationAssetMatches(machine,query){
 const q=normalizeSearchText(query).trim();if(!q)return true;
 const primary=canOpenTechnical3D(machine);
 const fields=primary?[machine.name,machine.machineId,machine.area,machine.sapCode,machine.functionalLocation,machine.model,machine.serial]:[machine.name,machine.machineId,machine.area];
 return normalizeSearchText(fields.filter(Boolean).join(' ')).includes(q);
}
function assetDialog(initialQuery='',{intent='browse'}={}){
 const simulationIntent=intent==='simulation';
 const areas=[...new Set(MACHINE_REGISTRY.map(m=>m.area).filter(Boolean))].sort();
 const options=(items,label)=>`<option value="">${label}</option>`+items.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
 let assetCategory='machine';
 const activeMachine=machineRecordForRoute(getAppState().selectedAsset),componentRoute=activeMachine&&normalizeMachineKey(machineRoute(activeMachine))===MACHINE_KEY?machineRoute(activeMachine):null;
 modal('Mesin',`<div class="asset-browser"><header><div><small>MESIN & PERALATAN</small><h3>Pilih mesin atau peralatan</h3><p>Pilih satu aset untuk langsung membuka konteksnya di pabrik atau model 3D.</p></div><div class="asset-browser-stat"><strong>${MACHINE_REGISTRY_STATS.modeled3D}</strong><span>aset dapat dipilih</span></div></header><div class="asset-category-tabs" role="tablist" aria-label="Kategori aset"><button type="button" data-asset-category="machine" class="active">Mesin</button><button type="button" data-asset-category="equipment">Peralatan</button><button type="button" data-asset-category="component" ${componentRoute&&!simulationIntent?'':'hidden'}>Komponen ${esc(activeMachine?.name||'mesin aktif')}</button></div><div class="asset-filter-grid"><label class="asset-search-wide"><span>Cari</span><input id="asset-search" type="search" autocomplete="off" placeholder="Nama mesin, kode, model, atau area…"></label><label data-asset-registry-filter><span>Area</span><select id="asset-area">${options(areas,'Semua area')}</select></label></div><div class="asset-result-summary" id="asset-result-summary"></div><div id="asset-results" class="asset-browser-results"></div></div>`);
 const renderComponents=query=>{
  const raw=String(query||'').trim().toLowerCase(),nodes=ACTIVE_TAXONOMY.filter(node=>node.id!==ACTIVE_ROOT&&(!raw||[node.name,node.description,node.id,node.levelName].some(v=>String(v||'').toLowerCase().includes(raw)))).slice(0,100);
  $('#asset-result-summary').textContent=nodes.length+' komponen '+activeMachine.name+' ditampilkan';
  $('#asset-results').innerHTML=nodes.length?nodes.map(node=>`<button type="button" data-component-id="${esc(node.id)}" class="asset-browser-row component-row"><span class="asset-thumbnail"><b>L${node.level}</b><small>${esc(node.levelName||'Struktur')}</small></span><span class="asset-browser-copy"><strong>${esc(node.name)}</strong><small>${esc(activeMachine.name)}</small><span>${esc(node.description||'Komponen mesin')}</span></span><em class="asset-data-badge">${engine?.template.resolveTaxonomyNode(node.id)?'Tersedia':'Referensi'}</em></button>`).join(''):'<p class="empty">Tidak ada komponen yang sesuai.</p>';
  $$('[data-component-id]').forEach(button=>button.onclick=()=>{closeModal();switchActiveMachine(componentRoute,{historyMode:'push'}).then(opened=>{if(!opened)return;setView('machine');selectTaxonomy(button.dataset.componentId,{revealPanel:true,historyMode:'push'});emitDomainState({selectedAsset:activeMachine.machineId,selectedNode:button.dataset.componentId,activeSection:'asset'});});});
 };
 const render=()=>{
  const query=$('#asset-search').value,area=$('#asset-area').value;
  $$('[data-asset-registry-filter]').forEach(el=>el.hidden=assetCategory==='component');
  if(assetCategory==='component'){renderComponents(query);return;}
  const categoryFilter=machine=>assetCategory==='equipment'?machine.area==='UTILITY':machine.area!=='UTILITY';
  const found=MACHINE_REGISTRY.filter(machine=>categoryFilter(machine)&&(!area||machine.area===area)&&foundationAssetMatches(machine,query)).slice(0,100);
  $('#asset-result-summary').textContent=found.length+' posisi '+(assetCategory==='equipment'?'peralatan':'mesin')+' ditampilkan';
  $('#asset-results').innerHTML=found.length?found.map(machine=>{
   const primary=canOpenTechnical3D(machine),policy=foundationAssetPolicy(machine,placementForMachine(machine.machineId));
   const copy=primary?[machine.model,machine.area].filter(Boolean).join(' · '):[machine.area,positionStatusLabel(policy.positionStatus)].filter(Boolean).join(' · ');
   return`<button type="button" data-machine-id="${machine.machineId}" class="asset-browser-row"><span class="asset-thumbnail"><b>${primary?'3D':'2D'}</b><small>${primary?'Model 3D':'Denah'}</small></span><span class="asset-browser-copy"><strong>${esc(machine.name)}</strong><small>${esc([machine.sapCode,machine.model].filter(Boolean).join(' · ')||machine.area||'Aset pabrik')}</small><span>${esc(copy)}</span></span><em class="asset-data-badge">${primary?'Buka 3D':'Lihat di pabrik'}</em></button>`;
  }).join(''):'<p class="empty">Tidak ada posisi aset yang sesuai.</p>';
 $$('[data-machine-id]').forEach(button=>button.onclick=async()=>{const machine=MACHINE_REGISTRY_BY_ID.get(button.dataset.machineId);if(machine){closeModal();if(simulationIntent){dispatchEvent(new CustomEvent('bmj:simulateselectedmachine',{detail:{selectedAsset:machine.machineId}}));return;}await openAssetContext(machine);}});
 };
 $('#asset-search').value=initialQuery;
 $$('[data-asset-category]').forEach(button=>button.onclick=()=>{assetCategory=button.dataset.assetCategory;$$('[data-asset-category]').forEach(x=>x.classList.toggle('active',x===button));render();});
 for(const id of ['#asset-search','#asset-area']){$(id).oninput=render;$(id).onchange=render;}render();
}
function openSceneEditor(){
 if(role!=='superadmin'||!engine?.actualFactory)return toast('Editor memerlukan koneksi Superadmin dan scene 3D.',true);
 const existingPanel=document.querySelector('#scene-editor-panel');if(existingPanel){existingPanel.querySelector('#se-search,button')?.focus();return toast('Editor Scene 3D sudah terbuka.');}
 setView('factory');engine.setSceneEditing(true);
 const baseline=new Map([...engine.sceneObjects].map(([id,node])=>[id,{position:node.position.toArray(),rotation:[node.rotation.x,node.rotation.y,node.rotation.z],scale:node.scale.toArray(),visible:node.visible}]));
 const overrides={...(state.sceneOverrides||{})};let selected=null,undo=[],redo=[],isolated=false,previewOriginal=false,history=[],editorCategory='machines',editorScope='factory',editorMachineId=null;const isolationGuard=createSceneIsolationGuard();
 const panel=document.createElement('section');panel.id='scene-editor-panel';panel.setAttribute('aria-label','Editor Scene 3D');panel.tabIndex=-1;document.body.append(panel);
 const editorCategories=[
  {id:'machines',label:'Mesin',hint:'Semua mesin dari database BMJ'},
  {id:'walls',label:'Dinding',hint:'Dinding dan partisi'},
  {id:'equipment',label:'Aksesori & Peralatan',hint:'Peralatan pendukung dan aksesori'},
  {id:'building',label:'Bangunan & Ruangan',hint:'Pintu, lantai, atap, kolom, area'},
  {id:'utilities',label:'Utilitas',hint:'IPAL, AHU, ducting, pipa dan udara tekan'},
  {id:'furniture',label:'Furniture',hint:'Meja, kursi, lemari, rak dan trolley'},
  {id:'uncategorized',label:'Belum dikategorikan',hint:'Objek yang belum dikenali kategorinya · khusus Superadmin'}
 ];
 const componentCategory={id:'components',label:'Bagian Mesin',hint:'Bagian dari mesin yang dipilih'};
 const assetIdByNode=new WeakMap();for(const [assetId,root] of engine.actualFactory?.assets||[])root.traverse(node=>assetIdByNode.set(node,'asset:'+assetId));
 const technicalSemantic=/^(SELECTION_OVERLAY|CAD_|CENTERLINE_|SOURCE_|SUPERADMIN_ADDED_PRIMITIVE$)/;
 const cleanEditorWords=value=>String(value||'').replace(/_V\d+/gi,'').replace(/_(REFERENCE|ACTUAL|VISUALIZATION|SUPPLEMENT|FUNCTIONAL|PHOTO|DERIVED|SOURCE|ASSEMBLY|NOT_AS_BUILT|NOT_SURVEYED|PLACEHOLDER)/gi,'').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();
 const titleWords=value=>cleanEditorWords(value).toLowerCase().replace(/\b\w/g,m=>m.toUpperCase());
 const editorCategoryFor=(id,node)=>{
  const sem=String(node?.userData?.semantic||'').toUpperCase();
  if(id.startsWith('part:')||id.startsWith('machine:'))return 'components';
  if(id.startsWith('asset:')||sem==='FACTORY_MACHINE'||node?.userData?.machineId&&engine.actualFactory?.assets?.has(node.userData.machineId))return 'machines';
  if(id.startsWith('wall:')||node?.userData?.editorWall||/(^|_)(WALL|PARTITION)(_|$)/.test(sem))return 'walls';
  if(/IPAL|AHU|HVAC|DUCT|COMPRESS|PNEUMATIC|PIPE|PIPING|UTILITY|WATER_TREATMENT|AIR_LINE|AIR_HEADER|BLOWER|PUMP|VALVE|DRAIN|MANHOLE/.test(sem))return 'utilities';
  if(/CHAIR|DESK|TABLE|CABINET|SHELF|RACK|LOCKER|TROLLEY|PALLET|STOOL|WORKBENCH|SOFA|BENCH|MONITOR|PEDESTAL|FURNITURE/.test(sem))return 'furniture';
  if(/ROOM|DOOR|GATE|FLOOR|ROOF|COLUMN|WINDOW|GLAZ|CANOPY|CEILING|STAIR|PLINTH|LANDSCAPE|GARDEN|PARKING|BUILDING/.test(sem))return 'building';
  return 'uncategorized';
 };
 const editorLabel=(id,node)=>{
  const sem=String(node?.userData?.semantic||''),upper=sem.toUpperCase(),category=editorCategoryFor(id,node);
  if(category==='machines'){const machineId=id.replace(/^asset:/,'')||node?.userData?.machineId,record=MACHINE_REGISTRY_BY_ID.get(machineId);return record?[record.sapCode||null,record.name].filter(Boolean).join(' · '):(node?.userData?.machineId||'Mesin');}
  if(id.startsWith('wall:')||node?.userData?.editorWall)return node?.userData?.roomLabel?('Dinding '+node.userData.roomLabel):'Dinding pabrik';
  if(category==='components'){
   const raw=node?.name||node?.userData?.label||node?.userData?.nodeId||sem;
   return titleWords(raw.replace(/^node[: ]?/i,'').replace(/^part[: ]?/i,'').replace(/^machine[: ]?/i,''))||'Komponen mesin';
  }
  if(node?.userData?.roomLabel&&/DOOR/.test(upper))return 'Pintu '+node.userData.roomLabel;
  if(node?.userData?.roomLabel&&/ROOM/.test(upper))return 'Ruangan '+node.userData.roomLabel;
  if(/STRUCTURAL_COLUMN|(^|_)COLUMN(_|$)/.test(upper))return 'Kolom bangunan';
  if(/ROOF/.test(upper))return 'Atap';
  if(/FLOOR/.test(upper))return 'Lantai';
  if(/GATE/.test(upper))return 'Gerbang';
  if(/CHAIR/.test(upper))return 'Kursi'+(node?.userData?.roomLabel?' '+node.userData.roomLabel:'');
  if(/DESK/.test(upper))return 'Meja kerja'+(node?.userData?.roomLabel?' '+node.userData.roomLabel:'');
  if(/TABLE/.test(upper))return 'Meja'+(node?.userData?.roomLabel?' '+node.userData.roomLabel:'');
  if(/CABINET|LOCKER/.test(upper))return 'Lemari';
  if(/RACK|SHELF/.test(upper))return 'Rak';
  if(/TROLLEY/.test(upper))return 'Trolley';
  if(/PALLET/.test(upper))return 'Pallet';
  if(/DUCT/.test(upper))return 'Ducting AHU';
  if(/AHU/.test(upper))return 'Peralatan AHU';
  if(/COMPRESS|PNEUMATIC|AIR_LINE|AIR_HEADER/.test(upper))return 'Sistem udara tekan';
  if(/IPAL|WATER_TREATMENT/.test(upper))return 'IPAL · '+(titleWords(sem.replace(/^IPAL_/i,''))||'Peralatan');
  const fromName=node?.name&&!/^(BMJ|building|roof|machines|labels|landscape|reference|unidentified|utility_)/i.test(node.name)?node.name:'';
  return titleWords(fromName||sem)||'Peralatan pabrik';
 };
 const selectableEditorObject=(id,node)=>{
  if(!node)return false;
  if(id.startsWith('asset:')||id.startsWith('wall:')||id.startsWith('new:')||id.startsWith('copy:')||id.startsWith('part:'))return true;
  if(technicalSemantic.test(String(node.userData?.semantic||'')))return false;
  if(id.startsWith('node:')&&node.userData?.editorStableId)return false;
  if(id.startsWith('node:')&&assetIdByNode.has(node))return false;
  if(id.startsWith('machine:')&&node.userData?.nodeId&&engine.sceneObjects.has('part:'+engine.machineKey+':'+node.userData.nodeId))return false;
  if(id.startsWith('machine:')&&!node.userData?.nodeId&&!node.name&&!node.userData?.semantic)return false;
  if(id.startsWith('node:')&&!node.userData?.semantic&&!node.name)return false;
  if(node.userData?.supersededByV202||node.userData?.supersededByV206)return false;
  if(node.visible===false&&!overrides[id])return false;
  return true;
 };
 const normalizeEditorSelection=(id,node)=>{
  const wallId=engine.sceneWallId(id);if(wallId)return wallId;
  const assetId=assetIdByNode.get(node);if(assetId)return assetId;
  if(id.startsWith('machine:')&&node?.userData?.nodeId){const partId='part:'+engine.machineKey+':'+node.userData.nodeId;if(engine.sceneObjects.has(partId))return partId;}
  return id;
 };
 const snapshot=()=>{undo.push(JSON.stringify(overrides));if(undo.length>50)undo.shift();redo=[];};
 const isolationBoundary=()=>editorScope==='machine'?engine.machine:engine.factory;const applyIsolation=()=>{if(isolated&&selected)isolationGuard.isolate(engine.sceneObjects.get(selected),isolationBoundary());};const apply=()=>{isolationGuard.restore();if((selected?.startsWith('machine:')||selected?.startsWith('part:'))||Object.keys(overrides).some(id=>id.startsWith('copy:')||id.startsWith('new:'))||[...baseline.keys()].some(id=>id.startsWith('copy:')||id.startsWith('new:'))){engine.applySceneOverrides(overrides);if(selected&&engine.sceneObjects.has(selected)&&!previewOriginal)engine.selectSceneObject(selected);else if(selected&&!engine.sceneObjects.has(selected)){engine.gizmo.detach();if(selected.startsWith('copy:')||selected.startsWith('new:'))selected=null;}}else for(const [id,v] of baseline){const node=engine.sceneObjects.get(id);if(!node)continue;const draft=overrides[id],x=draft?.identity&&draft.identity!==engine.sceneIdentity(id)?v:draft||v;node.position.fromArray(x.position);node.rotation.set(...x.rotation);node.scale.fromArray(x.scale);node.visible=x.visible&&!x.deleted;}engine.sceneOverrides=overrides;applyIsolation();};
 const current=()=>{if(!selected)return;const node=engine.sceneObjects.get(selected);return node&&{position:node.position.toArray(),rotation:[node.rotation.x,node.rotation.y,node.rotation.z],scale:node.scale.toArray(),visible:node.visible,locked:overrides[selected]?.locked||false,deleted:overrides[selected]?.deleted||false,identity:selected.startsWith('copy:')?overrides[selected]?.identity:engine.sceneIdentity(selected),...(selected.startsWith('copy:')?{sourceId:overrides[selected]?.sourceId}:{}),...(selected.startsWith('new:')?{shape:overrides[selected]?.shape}:{})};};
 let liveEditorUiFrame=0;
 const refreshEditorTransformUi=({live=false,message=''}={})=>{
  const v=current();if(!v)return;
  panel.querySelectorAll('[data-se-key]').forEach(input=>{const key=input.dataset.seKey,axis=+input.dataset.seAxis,raw=v[key]?.[axis];if(!Number.isFinite(raw)||document.activeElement===input)return;const shown=key==='rotation'?raw*180/Math.PI:raw;input.value=shown.toFixed(key==='rotation'?1:3);input.disabled=Boolean(v.locked||previewOriginal);});
  const draftCount=Object.keys(overrides).length,status=panel.querySelector('#se-status');if(status&&!previewOriginal)status.textContent=message||(draftCount?draftCount+' objek memiliki perubahan':'Belum ada perubahan baru');
  const undoButton=panel.querySelector('#se-undo'),redoButton=panel.querySelector('#se-redo');if(undoButton)undoButton.disabled=!undo.length||previewOriginal;if(redoButton)redoButton.disabled=!redo.length||previewOriginal;
  if(live)return;
  const info=selected?engine.sceneObjectInfo(selected):null,size=panel.querySelector('[data-se-size]'),collision=panel.querySelector('[data-se-collision]'),collisionCopy=panel.querySelector('[data-se-collision-copy]');
  if(size&&info)size.textContent=info.dimensions.map(n=>n.toFixed(2)).join(' × ')+' m';
  if(collision){const hits=info?.collisions||[];collision.hidden=!hits.length;if(collisionCopy)collisionCopy.textContent=hits.length?'Periksa: '+hits.join(', '):'';}
 };
 const scheduleEditorTransformUi=()=>{if(liveEditorUiFrame)return;liveEditorUiFrame=requestAnimationFrame(()=>{liveEditorUiFrame=0;refreshEditorTransformUi({live:true,message:'Mengubah objek…'});});};
 let keyboardMoveActive=false;
 const editorArrowKeys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
 const onEditorKeyDown=e=>{
  if(!selected?.startsWith('asset:')||previewOriginal||overrides[selected]?.locked||!editorArrowKeys.includes(e.key))return;
  const tag=e.target?.tagName;if(tag==='INPUT'||tag==='SELECT'||tag==='TEXTAREA'||e.target?.isContentEditable)return;
  const node=engine.sceneObjects.get(selected);if(!node)return;
  e.preventDefault();if(!keyboardMoveActive){snapshot();keyboardMoveActive=true;}
  const step=e.shiftKey?.5:.1,horizontal=e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0,vertical=e.key==='ArrowUp'?1:e.key==='ArrowDown'?-1:0;
  engine.moveSceneObjectInView(selected,horizontal,vertical,step);overrides[selected]=current();engine.sceneOverrides=overrides;
  const status=panel.querySelector('#se-status');if(status)status.textContent='Posisi mesin diubah · lepaskan tombol untuk menyelesaikan langkah';
 };
 const onEditorKeyUp=e=>{if(!keyboardMoveActive||!editorArrowKeys.includes(e.key))return;keyboardMoveActive=false;refreshEditorTransformUi();};
 const update=()=>{const queryBefore=panel.querySelector('#se-search')?.value||'',scrollBefore=panel.scrollTop,advancedOpen=panel.querySelector('.se-advanced')?.open||false,adminOpen=panel.querySelector('.se-admin-tools')?.open||false,focusId=document.activeElement?.id||null;const v=current(),info=selected?engine.sceneObjectInfo(selected):null,wallId=selected?engine.sceneWallId(selected):null,wallPoints=wallId===selected?engine.sceneWallEndpoints(selected):null;
 const sceneChoices=[...engine.sceneObjects].filter(([id,node])=>selectableEditorObject(id,node)&&editorCategoryFor(id,node)!=='machines').map(([id,node])=>({id,node,category:editorCategoryFor(id,node),name:editorLabel(id,node)}));
 const registryMachineChoices=MACHINE_REGISTRY.slice().sort((a,b)=>(a.no??999)-(b.no??999)).map(machine=>({id:'asset:'+machine.machineId,node:engine.actualFactory?.assets?.get(machine.machineId)||null,category:'machines',name:machine.name,machine,placed:Boolean(engine.actualFactory?.assets?.has(machine.machineId))}));
 const rawChoices=[...registryMachineChoices,...sceneChoices];
 const labelTotals=new Map();for(const item of rawChoices){const key=item.category+'|'+item.name;labelTotals.set(key,(labelTotals.get(key)||0)+1);}
 const labelSeen=new Map(),allChoices=rawChoices.map(item=>{const key=item.category+'|'+item.name,total=labelTotals.get(key)||1;if(total<2||item.category==='machines')return item;const number=(labelSeen.get(key)||0)+1;labelSeen.set(key,number);return {...item,name:item.name+' '+number};});
 const categoryCounts=Object.fromEntries(editorCategories.map(category=>[category.id,allChoices.filter(item=>item.category===category.id).length]));
 const choices=editorScope==='machine'?sceneChoices.filter(item=>item.category==='components'):allChoices.filter(item=>item.category===editorCategory);
 const selectedNode=selected?engine.sceneObjects.get(selected):null,selectedMachine=selected?.startsWith('asset:')?MACHINE_REGISTRY_BY_ID.get(selected.slice(6)):editorMachineId?MACHINE_REGISTRY_BY_ID.get(editorMachineId):null,selectedMachinePlaced=Boolean(selectedMachine&&engine.actualFactory?.assets?.has(selectedMachine.machineId)),selectedName=selectedNode?editorLabel(selected,selectedNode):selectedMachine?.name||'Objek 3D',draftCount=Object.keys(overrides).length,hasSelectionContext=Boolean(selected||selectedMachine),activeEditorCategory=editorScope==='machine'?componentCategory:editorCategories.find(category=>category.id===editorCategory);
 panel.innerHTML=`<header class="se-header"><div><small>SUPERADMIN</small><strong>Edit Pabrik 3D</strong><span>Pilih objek nyata, atur, lalu simpan.</span></div><button id="se-close" aria-label="Tutup editor">Tutup</button></header>
 <div class="se-progress" aria-label="Alur editor"><span class="${hasSelectionContext?'done':'current'}"><b>1</b>Pilih objek</span><span class="${!selected?'':draftCount?'done':'current'}"><b>2</b>Atur</span><span class="${draftCount?'current':''}"><b>3</b>Simpan</span></div>
 ${engine.staleSceneOverrides?.length?`<div class="se-alert" role="alert"><strong>${engine.staleSceneOverrides.length} perubahan lama dilewati</strong><span>Scene sudah berubah sehingga perubahan tersebut tidak diterapkan agar objek yang salah tidak ikut bergeser.</span></div>`:''}
 <section class="se-step">
  <div class="se-step-title"><b>1</b><div><strong>${editorScope==='machine'?'Pilih bagian mesin':'Pilih yang ingin diubah'}</strong><span>${editorScope==='machine'&&selectedMachine?'Bagian dari '+esc(selectedMachine.name):'Pilih langsung di tampilan 3D atau cari dari daftar.'}</span></div></div>
  ${editorScope==='machine'?`<div class="se-machine-context"><div><small>MESIN AKTIF</small><strong>${esc(selectedMachine?.name||'Mesin')}</strong><span>${esc([selectedMachine?.sapCode,selectedMachine?.model].filter(Boolean).join(' · ')||'Database BMJ')}</span></div><button id="se-back-machine">Edit seluruh mesin</button></div>`:`<div class="se-category-label">Pilih jenis objek</div><div class="se-category-grid">${editorCategories.map(category=>`<button data-se-category="${category.id}" class="${editorCategory===category.id?'active':''}" ${!categoryCounts[category.id]?'disabled':''}><strong>${category.label}</strong><span>${categoryCounts[category.id]||0}</span></button>`).join('')}</div>`}
  <div class="se-category-hint">${esc(activeEditorCategory?.hint||'')}</div>
  <input id="se-search" type="search" placeholder="Cari nama ${esc(activeEditorCategory?.label.toLowerCase()||'objek')}…" autocomplete="off">
  <select id="se-object" size="6" aria-label="Daftar objek 3D"></select>
  ${hasSelectionContext?`<div class="se-selected-card"><div><small>TERPILIH</small><strong>${esc(selectedName)}</strong><span>${selectedMachine&&editorScope==='factory'?esc([selectedMachine.sapCode,selectedMachine.model].filter(Boolean).join(' · ')||'Mesin dari database'):esc(activeEditorCategory?.label||'Objek pabrik')}</span></div>${selected?'<button id="se-focus">Lihat dekat</button>':''}</div>${selectedMachine&&editorScope==='factory'?`<div class="se-machine-edit-note"><strong>${selectedMachinePlaced?'Seluruh mesin aktif sebagai satu unit':'Mesin ada di database, belum ditempatkan di scene'}</strong><span>${selectedMachinePlaced?'Geser atau putar memindahkan seluruh mesin. Tombol panah mengikuti arah layar.':'Mesin tetap muncul di daftar database tetapi belum memiliki objek pabrik yang dapat digeser.'}</span>${selectedMachinePlaced&&canOpenTechnical3D(selectedMachine)?'<button id="se-edit-machine-parts">Edit bagian mesin</button>':''}</div>`:''}`:'<div class="se-empty-selection"><strong>Pilih satu objek</strong><span>Pilih kategori di atas, lalu pilih objek dari daftar atau klik langsung pada tampilan 3D.</span></div>'}
 </section>
 <section class="se-step ${selected?'':'is-disabled'}">
  <div class="se-step-title"><b>2</b><div><strong>Atur objek</strong><span>${selected?'Gunakan kontrol sederhana di bawah. Perubahan belum disimpan.':'Pilih objek terlebih dahulu.'}</span></div></div>
  ${selected?`<div class="se-primary-tools"><button data-se-mode="translate" ${engine.gizmo.mode==='translate'?'class="active"':''}>Geser</button><button data-se-mode="rotate" ${engine.gizmo.mode==='rotate'?'class="active"':''}>Putar</button><button data-se-mode="scale" ${engine.gizmo.mode==='scale'?'class="active"':''}>Ubah ukuran</button></div>
  <div class="se-quick-row"><button id="se-isolate">${isolated?'Tampilkan semua':'Fokus hanya objek ini'}</button><label class="se-snap-toggle" title="Gerakan posisi 10 cm dan putaran 5 derajat"><input id="se-snap" type="checkbox" ${engine.gizmo.translationSnap?'checked':''}><span>Gerak bertahap</span></label></div>
  <div class="se-nudge-card"><strong>Geser ${selectedMachine?'mesin':'objek'}</strong><span>${selectedMachine?'Keyboard: ← → ↑ ↓ = geser 10 cm · tahan Shift = 50 cm.':'Gunakan tombol ini jika sulit menggeser lewat 3D.'}</span><div class="se-nudge" aria-label="Gerakkan objek"><button data-se-nudge="x:-1">← Kiri</button><button data-se-nudge="x:1">Kanan →</button><button data-se-nudge="z:-1">↑ Depan</button><button data-se-nudge="z:1">↓ Belakang</button><button data-se-nudge="y:-1">Turun</button><button data-se-nudge="y:1">Naik</button><button data-se-turn="-1">↶ Putar kiri</button><button data-se-turn="1">Putar kanan ↷</button></div></div>
  <div class="se-object-actions"><button id="se-ground">Taruh di lantai</button><button id="se-hide">${v?.visible?'Sembunyikan':'Tampilkan'}</button><button id="se-lock">${v?.locked?'Buka kunci':'Kunci posisi'}</button><button id="se-duplicate">Buat salinan</button><button id="se-reset">Batalkan perubahan objek</button></div>
  ${info?`<div class="se-info-line"><span>Ukuran</span><strong data-se-size>${info.dimensions.map(n=>n.toFixed(2)).join(' × ')} m</strong></div><div class="se-alert warning" data-se-collision ${info.collisions.length?'':'hidden'}><strong>Objek kemungkinan bertabrakan</strong><span data-se-collision-copy>${info.collisions.length?'Periksa: '+esc(info.collisions.join(', ')):''}</span></div>`:''}
  ${wallId&&wallId!==selected?'<button id="se-wall" class="se-wide-action">Edit seluruh segmen dinding ini</button>':''}
  ${selected?'<button id="se-parent" class="se-link-button">Pilih bagian induknya</button>':''}
  <details class="se-advanced"><summary>Pengaturan lebih detail</summary>
   <div class="se-advanced-body">
    <p>Gunakan bagian ini hanya jika perlu angka atau penyelarasan presisi.</p>
    <div id="se-numbers">${v?['position','rotation','scale'].map(key=>`<fieldset><legend>${key==='position'?'Posisi (meter)':key==='rotation'?'Rotasi (derajat)':'Ukuran / skala'}</legend>${v[key].map((n,i)=>{const shown=key==='rotation'?n*180/Math.PI:n;return `<label>${'XYZ'[i]} <input data-se-key="${key}" data-se-axis="${i}" data-se-unit="${key==='rotation'?'deg':'raw'}" type="number" step="${key==='rotation'?'1':'0.01'}" value="${shown.toFixed(key==='rotation'?1:3)}" ${v.locked?'disabled':''}></label>`;}).join('')}</fieldset>`).join(''):''}</div>
    ${wallPoints?`<fieldset><legend>Titik ujung dinding</legend>${wallPoints.map((point,index)=>`<label>${index?'B':'A'} X <input type="number" step="0.01" data-wall-point="${index}" data-wall-axis="0" value="${point[0].toFixed(3)}"></label><label>${index?'B':'A'} Z <input type="number" step="0.01" data-wall-point="${index}" data-wall-axis="1" value="${point[1].toFixed(3)}"></label>`).join('')}<p>Panel, girt, kaca, dan flashing ikut bergerak bersama segmen.</p></fieldset>`:''}
    <fieldset><legend>Sejajarkan dengan aset lain</legend><select id="se-align-target"><option value="">Pilih aset acuan</option>${[...engine.actualFactory.assets].map(([id,node])=>`<option value="asset:${esc(id)}">${esc(node.name||id)}</option>`).join('')}</select><div class="se-inline-actions"><button data-se-align="x">Sejajar kiri/kanan</button><button data-se-align="z">Sejajar depan/belakang</button><button data-se-align="xz">Sejajar keduanya</button></div></fieldset>
    <div class="se-danger-zone"><button id="se-delete">${v?.deleted?'Pulihkan objek yang dihapus':'Hapus sementara objek'}</button></div>
    
   </div>
  </details>`:''}
 </section>
 <section class="se-step se-save-step">
  <div class="se-step-title"><b>3</b><div><strong>Simpan perubahan</strong><span>${previewOriginal?'Sedang melihat tampilan asli.':'Perubahan baru berlaku permanen setelah disimpan.'}</span></div></div>
  <div class="se-review-row"><button id="se-preview">${previewOriginal?'Kembali ke perubahan':'Bandingkan dengan tampilan asli'}</button><span id="se-status">${previewOriginal?'Tampilan asli · hanya melihat':draftCount?draftCount+' objek memiliki perubahan':'Belum ada perubahan baru'}</span></div>
  <div class="se-save-bar"><div><button id="se-undo" ${!undo.length?'disabled':''}>Urungkan</button><button id="se-redo" ${!redo.length?'disabled':''}>Ulangi</button></div><button id="se-save" class="primary" ${previewOriginal?'disabled':''}>Simpan perubahan</button></div>
 </section>
 <details class="se-admin-tools"><summary>Alat lanjutan Superadmin</summary><div class="se-advanced-body">
  <p>Fitur ini untuk koreksi teknis, pemulihan, dan pertukaran data scene.</p>
  ${editorScope==='factory'?'<div class="se-inline-actions"><button data-se-add="box">Tambah kotak sederhana</button><button data-se-add="cylinder">Tambah silinder sederhana</button></div>':''}
  <div class="se-inline-actions"><button id="se-history">Riwayat perubahan</button><button id="se-export">Buat cadangan editor</button></div>
  <label class="se-file-label">Pulihkan dari cadangan<input id="se-load-file" type="file" accept="application/json,.json"></label>
  <div id="se-history-list" hidden></div>
 </div></details>`;
 const fill=()=>{const query=panel.querySelector('#se-search').value.toLowerCase(),matches=choices.filter(item=>(item.name+' '+(item.machine?.sapCode||'')+' '+(item.machine?.model||'')+' '+(item.node?.userData?.roomLabel||'')).toLowerCase().includes(query)).slice(0,300);panel.querySelector('#se-object').innerHTML=matches.length?matches.map(item=>`<option value="${esc(item.id)}" ${item.id===selected||item.machine?.machineId===editorMachineId&&!selected?'selected':''}>${esc(item.name)}${item.category==='machines'&&!item.placed?' · belum ditempatkan':''}</option>`).join(''):'<option disabled>Tidak ada objek di kategori ini</option>';};panel.querySelector('#se-search').value=queryBefore;fill();const advanced=panel.querySelector('.se-advanced'),adminTools=panel.querySelector('.se-admin-tools');if(advanced)advanced.open=advancedOpen;if(adminTools)adminTools.open=adminOpen;panel.scrollTop=scrollBefore;if(focusId)panel.querySelector('#'+CSS.escape(focusId))?.focus({preventScroll:true});panel.querySelector('#se-search').oninput=fill;panel.querySelector('#se-object').onchange=e=>{const item=choices.find(choice=>choice.id===e.target.value);if(item?.category==='machines'){editorMachineId=item.machine.machineId;if(!item.node){selected=null;engine.gizmo.detach();update();return;}}engine.selectSceneObject(e.target.value);};panel.querySelector('#se-snap')?.addEventListener('change',e=>{engine.gizmo.setTranslationSnap(e.target.checked?.1:null);engine.gizmo.setRotationSnap(e.target.checked?Math.PI/36:null);});panel.querySelector('#se-focus')?.addEventListener('click',()=>{if(selected)engine.fit(engine.sceneObjects.get(selected));});panel.querySelector('#se-isolate')?.addEventListener('click',()=>{if(!selected)return;isolated=!isolated;apply();update();});
 panel.querySelectorAll('[data-se-mode]').forEach(b=>b.onclick=()=>{engine.gizmo.setMode(b.dataset.seMode);update();});panel.querySelectorAll('[data-se-key]').forEach(input=>input.onchange=()=>{if(previewOriginal||overrides[selected]?.locked)return;const value=+input.value;if(!Number.isFinite(value)||Math.abs(value)>100000||input.dataset.seKey==='scale'&&value<=0)return toast('Angka tidak valid.',true);snapshot();const v=current(),stored=input.dataset.seUnit==='deg'?value*Math.PI/180:value;v[input.dataset.seKey][+input.dataset.seAxis]=stored;overrides[selected]=v;apply();refreshEditorTransformUi();});
 const mutate=fn=>{if(!selected||previewOriginal||overrides[selected]?.locked)return;snapshot();fn();overrides[selected]=current();update();};
 panel.querySelectorAll('[data-se-add]').forEach(button=>button.onclick=()=>{if(previewOriginal)return;snapshot();const id='new:'+crypto.randomUUID(),point=engine.controls.target;overrides[id]={shape:button.dataset.seAdd,position:[point.x,.5,point.z],rotation:[0,0,0],scale:[1,1,1],visible:true,locked:false,deleted:false};selected=id;apply();update();});
 panel.querySelectorAll('[data-se-category]').forEach(button=>button.onclick=()=>{const nextCategory=button.dataset.seCategory;if(nextCategory===editorCategory&&editorScope==='factory')return;engine.gizmo.detach();isolationGuard.restore();selected=null;isolated=false;previewOriginal=false;editorCategory=nextCategory;editorScope='factory';engine.setView('factory',state);engine.applySceneOverrides(overrides);engine.setSceneEditing(true);update();});
 panel.querySelector('#se-edit-machine-parts')?.addEventListener('click',async()=>{const machine=MACHINE_REGISTRY_BY_ID.get(editorMachineId);if(!machine||!canOpenTechnical3D(machine))return toast('Model bagian mesin ini belum tersedia.',true);try{engine.gizmo.detach();isolationGuard.restore();selected=null;isolated=false;previewOriginal=false;configureActiveMachine(machineRoute(machine));applyActiveMachineState();setActiveTaxonomyId(ACTIVE_ROOT);applyMachineShell();await engine.switchMachine(MACHINE_KEY);engine.setView('machine',state);engine.setSceneEditing(true);engine.applySceneOverrides(overrides);editorScope='machine';editorCategory='components';update();}catch(error){toast('Bagian mesin belum dapat dibuka: '+error.message,true);}});
 panel.querySelector('#se-back-machine')?.addEventListener('click',()=>{engine.gizmo.detach();isolationGuard.restore();selected=null;isolated=false;previewOriginal=false;editorScope='factory';editorCategory='machines';clearActiveMachineDescriptor();applyActiveMachineState();engine.clearMachineContext?.();engine.setView('factory',state);engine.applySceneOverrides(overrides);engine.setSceneEditing(true);const id=editorMachineId&&engine.actualFactory?.assets?.has(editorMachineId)?'asset:'+editorMachineId:null;if(id)engine.selectSceneObject(id);else update();});
 panel.querySelector('#se-parent')?.addEventListener('click',()=>{const parent=engine.sceneObjects.get(selected)?.parent,id=parent&&engine.sceneObjectIds?.get(parent);if(id&&engine.sceneObjects.has(id))engine.selectSceneObject(id);});
 panel.querySelector('#se-wall')?.addEventListener('click',()=>{if(wallId)engine.selectSceneObject(wallId);});
 panel.querySelectorAll('[data-wall-point]').forEach(input=>input.onchange=()=>{if(previewOriginal||overrides[selected]?.locked)return;const points=engine.sceneWallEndpoints(selected);if(!points)return;const value=+input.value;if(!Number.isFinite(value)||Math.abs(value)>100000)return toast('Koordinat dinding tidak valid.',true);points[+input.dataset.wallPoint][+input.dataset.wallAxis]=value;snapshot();if(!engine.setSceneWallEndpoints(selected,points)){undo.pop();return toast('Panjang dinding harus minimal 0,28 meter.',true);}overrides[selected]=current();apply();update();});
 panel.querySelectorAll('[data-se-align]').forEach(button=>button.onclick=()=>{const targetId=panel.querySelector('#se-align-target').value;if(!targetId)return toast('Pilih aset acuan.',true);mutate(()=>{if(!engine.alignSceneObject(selected,targetId,button.dataset.seAlign))toast('Objek dan acuan tidak dapat disejajarkan.',true);});});
 panel.querySelectorAll('[data-se-nudge]').forEach(button=>button.onclick=()=>mutate(()=>{const [axis,direction]=button.dataset.seNudge.split(':'),step=engine.gizmo.translationSnap||.05;engine.sceneObjects.get(selected).position[axis]+=Number(direction)*step;}));
 panel.querySelectorAll('[data-se-turn]').forEach(button=>button.onclick=()=>mutate(()=>{engine.sceneObjects.get(selected).rotation.y+=Number(button.dataset.seTurn)*Math.PI/36;}));
 panel.querySelector('#se-preview').onclick=()=>{previewOriginal=!previewOriginal;isolationGuard.restore();if(previewOriginal){engine.gizmo.detach();engine.applySceneOverrides({});applyIsolation();}else{apply();if(selected&&!overrides[selected]?.locked)engine.gizmo.attach(engine.sceneObjects.get(selected));}update();};
 panel.querySelector('#se-hide')?.addEventListener('click',()=>mutate(()=>{engine.sceneObjects.get(selected).visible=!engine.sceneObjects.get(selected).visible;}));panel.querySelector('#se-delete')?.addEventListener('click',()=>{if(!selected)return;snapshot();const value=current();value.deleted=!value.deleted;if(value.deleted)value.visible=false;else value.visible=true;overrides[selected]=value;apply();update();});panel.querySelector('#se-lock')?.addEventListener('click',()=>{if(!selected)return;snapshot();const value=current();value.locked=!value.locked;overrides[selected]=value;apply();if(value.locked)engine.gizmo.detach();else engine.gizmo.attach(engine.sceneObjects.get(selected));update();});
 panel.querySelector('#se-ground')?.addEventListener('click',()=>mutate(()=>{engine.dropSceneObjectToFloor(selected);}));
 panel.querySelector('#se-duplicate')?.addEventListener('click',()=>{if(!selected||previewOriginal)return;const sourceId=selected.startsWith('copy:')?overrides[selected]?.sourceId:selected,source=engine.sceneObjects.get(sourceId);if(!source)return;let count=0;source.traverse(node=>{if(node.isMesh)count++;});if(count>300)return toast('Objek terlalu besar untuk diduplikasi. Pilih bagian yang lebih kecil.',true);snapshot();const id='copy:'+crypto.randomUUID(),value=current();value.position=[value.position[0]+.45,value.position[1],value.position[2]+.45];value.sourceId=sourceId;value.identity=engine.sceneIdentity(sourceId);value.locked=false;value.deleted=false;value.visible=true;overrides[id]=value;selected=id;apply();update();});
 panel.querySelector('#se-reset')?.addEventListener('click',()=>{if(!selected)return;snapshot();delete overrides[selected];apply();update();});
 panel.querySelector('#se-undo').onclick=()=>{if(previewOriginal||!undo.length)return;redo.push(JSON.stringify(overrides));Object.keys(overrides).forEach(k=>delete overrides[k]);Object.assign(overrides,JSON.parse(undo.pop()));apply();update();};
 panel.querySelector('#se-redo').onclick=()=>{if(previewOriginal||!redo.length)return;undo.push(JSON.stringify(overrides));Object.keys(overrides).forEach(k=>delete overrides[k]);Object.assign(overrides,JSON.parse(redo.pop()));apply();update();};
 panel.querySelector('#se-close').onclick=()=>{if(JSON.stringify(overrides)!==JSON.stringify(state.sceneOverrides||{})&&!confirm('Perubahan yang belum disimpan akan dibuang. Tutup Editor?'))return;isolated=false;isolationGuard.restore();Object.keys(overrides).forEach(k=>delete overrides[k]);Object.assign(overrides,state.sceneOverrides||{});engine.applySceneOverrides(state.sceneOverrides||{});engine.gizmo.setTranslationSnap(null);engine.gizmo.setRotationSnap(null);engine.setSceneEditing(false);clearActiveMachineDescriptor();applyActiveMachineState();engine.clearMachineContext?.();engine.onSceneSelect=null;engine.onSceneTransform=null;engine.gizmo.removeEventListener('mouseDown',onDragStart);engine.gizmo.removeEventListener('mouseUp',onDragEnd);document.removeEventListener('keydown',onEditorKeyDown);document.removeEventListener('keyup',onEditorKeyUp);if(liveEditorUiFrame)cancelAnimationFrame(liveEditorUiFrame);engine.setView('factory',state);panel.remove();};
 panel.querySelector('#se-save').disabled=previewOriginal;panel.querySelector('#se-save').onclick=async()=>{if(previewOriginal)return;const saveButton=panel.querySelector('#se-save');saveButton.disabled=true;try{const next=await request('/api/scene',{method:'PUT',data:{overrides}});isolationGuard.restore();await acceptState(next);applyIsolation();if(selected&&engine.sceneObjects.has(selected)&&!overrides[selected]?.locked)engine.selectSceneObject(selected);undo=[];redo=[];update();toast('Perubahan 3D berhasil disimpan.');}catch(e){panel.querySelector('#se-status').textContent=e.message;}finally{const currentButton=panel.querySelector('#se-save');if(currentButton)currentButton.disabled=previewOriginal;}};
 panel.querySelector('#se-export').onclick=()=>{const blob=new Blob([JSON.stringify({schemaVersion:1,overrides},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='cadangan-editor-3d-bmj.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);};
 panel.querySelector('#se-load-file').onchange=async e=>{try{const file=e.target.files?.[0];if(!file)return;if(file.size>1024*1024)throw new Error('Berkas melebihi 1 MB.');const parsed=JSON.parse(await file.text());if(parsed.schemaVersion!==1||!parsed.overrides||typeof parsed.overrides!=='object'||Array.isArray(parsed.overrides))throw new Error('Format override tidak valid.');validateSceneImport(parsed.overrides,{hasObject:id=>engine.sceneObjects.has(id),identityFor:id=>engine.sceneIdentity(id)});snapshot();Object.keys(overrides).forEach(k=>delete overrides[k]);Object.assign(overrides,parsed.overrides);apply();update();}catch(error){toast(error.message,true);}};
 panel.querySelector('#se-history').onclick=async()=>{try{const response=await request('/api/scene/revisions');history=response.revisions||[];const list=panel.querySelector('#se-history-list');list.hidden=false;list.innerHTML='<h4>Revisi sebelumnya</h4>'+history.slice().reverse().map((item,index)=>`<button data-se-revision="${esc(item.id)}">${esc(new Date(item.at).toLocaleString('id-ID'))} · ${item.objects??Object.keys(item.overrides||{}).length} objek · ${esc(item.by||'Superadmin')}</button>`).join('')+'<p>Memulihkan revisi langsung menyimpan perubahan dan membuat revisi cadangan baru.</p>';list.querySelectorAll('[data-se-revision]').forEach(button=>button.onclick=async()=>{try{const next=await request('/api/scene/restore',{method:'PUT',data:{id:button.dataset.seRevision}});isolationGuard.restore();await acceptState(next);Object.keys(overrides).forEach(k=>delete overrides[k]);Object.assign(overrides,next.sceneOverrides||{});apply();update();toast('Revisi berhasil dipulihkan.');}catch(error){toast(error.message,true);}});}catch(e){toast(e.message,true);}};
 if(previewOriginal){panel.querySelectorAll('button').forEach(button=>{if(!['se-preview','se-close','se-focus'].includes(button.id))button.disabled=true;});panel.querySelectorAll('#se-numbers input,#se-load-file').forEach(input=>input.disabled=true);}
 };engine.onSceneSelect=(id,node)=>{const normalized=normalizeEditorSelection(id,node||engine.sceneObjects.get(id)),target=engine.sceneObjects.get(normalized);selected=normalized;if(normalized?.startsWith('asset:'))editorMachineId=normalized.slice(6);editorCategory=editorCategoryFor(normalized,target);editorScope=editorCategory==='components'?'machine':'factory';if(normalized!==id)engine.selectSceneObject(normalized);if(previewOriginal)engine.gizmo.detach();update();};const onDragStart=()=>{if(selected)snapshot();};const onDragEnd=()=>{if(selected){overrides[selected]=current();refreshEditorTransformUi();}};engine.gizmo.addEventListener('mouseDown',onDragStart);engine.gizmo.addEventListener('mouseUp',onDragEnd);engine.onSceneTransform=()=>{if(selected&&!overrides[selected]?.locked){overrides[selected]=current();scheduleEditorTransformUi();}};document.addEventListener('keydown',onEditorKeyDown);document.addEventListener('keyup',onEditorKeyUp);update();
}
function settingsDialog(){
 const appState=getAppState()||{},device=matchMedia('(max-width:767px)').matches?'Ponsel':matchMedia('(max-width:1180px)').matches?'Tablet':'Desktop';
 const connectionStatus=connectionTruth({online:navigator.onLine,cached:cachedDataActive,connected:Boolean(role)});
 const serviceWorkerStatus=!('serviceWorker'in navigator)?'Tidak didukung':navigator.serviceWorker.controller?'Aktif':'Menunggu aktivasi';
 const selectedNode=appState.selectedNode||'Tidak ada komponen terpilih';
 modal('Pengaturan',`<div class="settings-section"><h3>Tampilan 3D</h3><label for="visual-quality">Kualitas visual</label><select id="visual-quality">${[["auto","Otomatis"],["hemat","Hemat"],["seimbang","Seimbang"],["tinggi","Tinggi"],["engineering","Teknis"],["cinematic","Cinematic"]].map(([value,label])=>`<option value="${value}" ${getAppState().preferences?.visualQuality===value?"selected":""}>${label}</option>`).join("")}</select><label class="check"><input id="low-mode" type="checkbox" ${Boolean(getAppState().preferences?.lowDetail)?'checked':''} ${isInteriorOpen()?'disabled':''}> Optimasi untuk perangkat dengan performa terbatas</label>${isInteriorOpen()?'<p class="subtle">Optimasi sementara dinonaktifkan saat interior terbuka agar detail tetap terlihat.</p>':''}<label class="check"><input id="label-mode" type="checkbox" ${Boolean(getAppState().visibleLayers?.labels)?'checked':''}> Tampilkan nama mesin dan area</label></div>${role==='superadmin'?'<div class="settings-section"><h3>Superadmin</h3><p class="subtle">Gunakan Edit Pabrik 3D untuk mengatur mesin, dinding, ruangan, furniture, aksesori, dan utilitas.</p><button id="scene-editor" class="primary">Edit Pabrik 3D</button><button id="change-superadmin-password" class="secondary">Ganti Kata Sandi</button></div>':''}<div class="settings-section"><h3>Data & sumber</h3><button id="settings-status" class="secondary">Status Data & Sumber</button><button id="settings-connect" class="secondary">Sambungkan Data</button></div><div class="settings-section"><h3>Data di perangkat</h3><p class="subtle">${cacheEnabled?'Salinan data lokal aktif agar aplikasi lebih cepat dibuka kembali.':'Salinan data lokal tidak aktif.'}</p><button id="clear-cache" class="secondary">Bersihkan Data Tersimpan</button></div><details class="settings-section system-information"><summary>Informasi Sistem</summary><p>Diagnostik teknis ditempatkan di sini agar tampilan utama tetap sederhana.</p><dl class="system-info-grid">${pair('Versi aplikasi',APP_BUILD)+pair('Cakupan model',MACHINE_REGISTRY_STATS.modeled3D+' aset 3D · sumber berbeda per mesin')}${pair('Perangkat',device)}${pair('Mode tampilan',appState.viewMode==='2d'?'2D':'3D')}${pair('Mesin / peralatan aktif',appState.selectedAsset||'Belum memilih')}${pair('Komponen terpilih',selectedNode)}${pair('Koneksi data',connectionStatus)}${pair('Penyimpanan lokal',cacheEnabled?'Aktif':'Tidak aktif')}${pair('Aplikasi offline',serviceWorkerStatus)}${pair('Status tampilan 3D',engine?'Siap':'Cadangan / belum siap')}</dl></details>`);
 $('#visual-quality').onchange=e=>{const profile=e.target.value;setPreference('visualQuality',profile);setPreference('lowDetail',profile==='hemat');engine?.setQualityProfile(profile);$('#low-mode').checked=profile==='hemat';};
 $('#low-mode').onchange=e=>{const lowDetail=Boolean(e.target.checked);setPreference('lowDetail',lowDetail);const profile=lowDetail?'hemat':'auto';setPreference('visualQuality',profile);$('#visual-quality').value=profile;engine?.setQualityProfile(profile);};
 $('#label-mode').onchange=e=>{const labels=Boolean(e.target.checked);setDomainState({visibleLayers:{labels}});if(engine)engine.labels=labels;$('#labels').classList.toggle('active',labels);};
 on('#change-superadmin-password',()=>{modal('Ganti Kata Sandi Superadmin',`<form id="change-password-form"><label for="old-password">Kata sandi saat ini</label><input id="old-password" type="password" autocomplete="current-password" required><label for="new-password">Kata sandi baru (minimal 12 karakter)</label><input id="new-password" type="password" autocomplete="new-password" minlength="12" required><label for="confirm-password">Ulangi kata sandi baru</label><input id="confirm-password" type="password" autocomplete="new-password" required><div class="actions"><button type="submit" class="primary">Simpan Kata Sandi</button></div><p id="password-error" class="inline-error" role="alert"></p></form>`,{back:settingsDialog});$('#change-password-form').onsubmit=async event=>{event.preventDefault();const button=event.target.querySelector('button');button.disabled=true;try{const currentPassword=$('#old-password').value,newPassword=$('#new-password').value;if(newPassword!==$('#confirm-password').value)throw new Error('Konfirmasi kata sandi tidak cocok.');await request('/api/superadmin/password',{method:'POST',data:{currentPassword,newPassword}});token='';role=null;updateConnectionTruth();closeModal();toast('Kata sandi tersimpan. Masuk kembali dengan kata sandi baru.');}catch(error){$('#password-error').textContent=error.message;}finally{button.disabled=false;}};});
 on('#settings-status',()=>foundationStatusDialog({back:settingsDialog}));on('#settings-connect',()=>connectionDialog({back:settingsDialog}));
 on('#scene-editor',()=>{closeModal();openSceneEditor();});
 on('#clear-cache',async()=>{await cache.clear();toast('Data tersimpan di perangkat sudah dibersihkan.');});
}
function helpDialog(){
  const device=matchMedia('(max-width:767px)').matches?'ponsel':'komputer',section=getAppState().activeSection||'factory';
  const contextHelp=section==='simulation'?'Anda sedang berada di Simulasi. Pilih mesin yang ingin diperiksa, lalu jalankan proses yang tersedia untuk mesin itu.':section==='reference'?'Anda sedang berada di Referensi. Sumber yang paling berkaitan dengan bagian mesin terpilih akan ditempatkan lebih dulu.':section==='asset'?'Anda sedang berada di Mesin. Cari mesin atau peralatan lalu pilih hasil untuk membuka konteksnya.':'Anda sedang berada di Pabrik. Pilih mesin pada tampilan 3D atau melalui menu Mesin.';
  modal('Bantuan',`<div class="help-intro"><small>PANDUAN KONTEKSTUAL · ${device.toUpperCase()}</small><h3>${esc(contextHelp)}</h3></div><div class="help-grid"><section><h3>Gerakkan tampilan</h3><p>Seret untuk memutar. Cubit atau scroll untuk memperbesar dan memperkecil. Gunakan Fokus untuk kembali ke objek yang sedang dipilih.</p></section><section><h3>Lihat bagian mesin</h3><p>Buka tab Struktur, lalu pilih tingkat Mesin → Unit Utama → Sub → Block → Part → Spesifik Part. Bagian yang dipilih akan ditandai dan dipusatkan.</p></section><section><h3>Buka Interior</h3><p>Gunakan Buka Interior untuk menyembunyikan cover luar sementara. Frame, support, dan posisi komponen tidak diubah.</p></section><section><h3>Jalankan simulasi</h3><p>Simulasi tersedia pada aset yang memiliki model proses terverifikasi atau referensi proses keluarga yang memadai. Jika bukti belum cukup, aplikasi menampilkan status diblokir beserta alasannya dan tidak menjalankan gerakan palsu.</p></section><section><h3>Gunakan 2D dan 3D</h3><p>Pindah tampilan dari tombol 2D / 3D. Mesin atau komponen yang dipilih tetap menjadi konteks aktif.</p></section><section><h3>Cari apa pun</h3><p>Gunakan kolom pencarian untuk menemukan mesin, komponen, sumber, area, atau posisi aset pada denah.</p></section></div><div class="card"><h3>Kejujuran data</h3><p>Informasi yang belum memiliki dasar sumber tetap ditandai belum tersedia atau belum terverifikasi. Aplikasi tidak mengisi status, ukuran, atau konfigurasi dengan tebakan.</p><p class="subtle">Informasi teknis aplikasi tersedia di Pengaturan → Informasi Sistem.</p></div>`);
}
renderPanel();renderStatus();const taxCount=$('#taxonomy-count');if(taxCount)taxCount.textContent=taxonomyStats().total.toLocaleString('id-ID');
try{engine=new FactoryEngine($('#viewport'),part=>{const meta=taxonomyForPart(part);if(meta)selectTaxonomy(meta.id,{revealPanel:true,historyMode:'push'});});engine.onTaxonomySelect=id=>selectTaxonomy(id,{revealPanel:true,historyMode:'push'});engine.onSimulationUpdate=next=>updateSimulationPanel(next);updateSimulationPanel(engine.getPrintingSimulationState());engine.onReset=()=>{setExplodeLevel(0);selectedPart=null;setActiveTaxonomyId(ACTIVE_ROOT);renderPanel();};engine.onError=handleEngineError;engine.onRecovered=handleEngineRecovered;$('#engine-status').textContent='Menyiapkan denah pabrik';try{engine.setQualityProfile(getAppState().preferences?.lowDetail?'hemat':getAppState().preferences?.visualQuality||'auto');}catch{}}catch(e){renderStaticMachineFallback(e);$('#engine-status').textContent='Tampilan 3D belum tersedia';}
try{
 bundledLayout=await loadBundledPlantLayout();engine?.loadLayout(activeLayout());engine?.applySceneOverrides(state?.sceneOverrides||{});
 if(engine)engine.onFactorySelect=id=>{const m=MACHINE_REGISTRY.find(m=>m.machineId===id);if(m){selectFactoryAssetContext(m,{historyMode:'push',openDialog:false,focus:true});machineDetailDialog(m);}};
 renderStatus();redrawPlantPlan();
 await restoreHistoryContext();
 const boot=$('#boot');if(boot)boot.hidden=true;$('#engine-status').textContent=engine?'Denah siap · detail 3D dimuat':'Denah tersedia · penampil 3D belum siap';
 signalAppReady('ready');
 // The complete fleet is a large compressed payload. Keep initial navigation
 // usable even when decoding or constructing the detailed factory fails.
 setTimeout(async()=>{
  try{const fleet=await loadFactoryFleet();bundledLayout.fleet=fleet;engine?.loadLayout(activeLayout());if(engine?.view==='factory')engine.fit(engine.factory,'iso',false);$('#engine-status').textContent=engine?'Pabrik 3D siap':'Denah tersedia · penampil 3D belum siap';}
  catch(error){console.error('[Digital Twin factory detail]',error);delete bundledLayout.fleet;try{engine?.loadLayout(activeLayout());}catch{}document.body.classList.add('workspace-2d');$('#engine-status').textContent='Denah siap · detail 3D belum tersedia';toast('Detail 3D pabrik gagal dimuat. Denah 2D tetap tersedia.',true);}
 },1600);
}catch(e){
 const boot=$('#boot');if(boot){boot.hidden=false;boot.innerHTML='<strong>Denah pabrik belum dapat dimuat</strong><p>Data CAD tersimpan tidak berhasil dibuka. Tidak ada geometri pengganti yang dibuat.</p><button id="boot-retry" class="primary">Muat Ulang</button>';on('#boot-retry',()=>location.reload());}
 $('#engine-status').textContent='Denah belum tersedia';toast('Denah pabrik gagal dimuat: '+e.message,true);signalAppReady('error');
}
function scrollInspectorToTabStart(){
 const panel=$('#detail-panel'),content=$('#panel-content'),top=$('.panel-top'),tabs=$('.tabs');if(!panel||!content||!tabs)return;
 requestAnimationFrame(()=>{const sticky=(top?.offsetHeight||0)+(tabs?.offsetHeight||0);panel.scrollTo({top:Math.max(0,content.offsetTop-sticky),behavior:'auto'});});
}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{if(editing){engine.edit(false);engine.applyPlacement(state);engine.onTransform=null;editing=false;}renderPanel(b.dataset.tab);scrollInspectorToTabStart();});
on('#modal-close',closeModal);on('#modal-back',goModalBack);on('#context-back',navigateContextParent);on('#connect',connectionDialog);const openFactoryNavigation=()=>{stopSimulationBeforeNavigation();return activeLayout()?showHome({historyMode:'push'}):layoutDialog();};const openAssetNavigation=()=>{stopSimulationBeforeNavigation();assetDialog();};on('#nav-machine',openFactoryNavigation);on('#nav-assets',openAssetNavigation);window.addEventListener('bmj:mobilefactoryrequest',safe(openFactoryNavigation));window.addEventListener('bmj:mobileassetrequest',safe(openAssetNavigation));on('#nav-help',()=>{stopSimulationBeforeNavigation();helpDialog();});on('#settings',()=>{stopSimulationBeforeNavigation();settingsDialog();});on('#focus-machine',()=>{if(!engine)return;if(engine.view==='factory'){const selected=getAppState().selectedAsset,record=machineRecordForRoute(selected);if(record)engine.focusFactoryAsset(record.machineId);else engine.fit(engine.factory,'iso');return;}engine.fit(selectedPart||engine.machine,'iso');});
$$('[data-camera]').forEach(b=>b.onclick=()=>{if(!engine)return;const mode=b.dataset.camera,isFactory=engine.view==='factory',target=isFactory?engine.currentFactoryTarget():(selectedPart||engine.machine);if(mode==='reset'){engine.fit(isFactory?engine.factory:engine.machine,'iso');$$('[data-camera]').forEach(c=>c.classList.toggle('active',c.dataset.camera==='iso'));emitDomainState({cameraPreset:'iso'});return;}if(mode==='fit'){engine.fit(target,'iso');emitDomainState({cameraPreset:'iso'});return;}const preset=mode==='top'?'top':'iso';engine.fit(target,preset);$$('[data-camera]').forEach(c=>c.classList.toggle('active',c.dataset.camera===mode));emitDomainState({cameraPreset:preset});});
on('#tool-explode',()=>{if(!ensureMachineInspectionContext('Urai')||simulationLocksStructure())return;showPanel();renderPanel('structure');setExplodeLevel(explodeLevel()>.01?0:.65);engine?.template.explode(explodeLevel(),selectedPart);$('#tool-explode')?.classList.toggle('active',explodeLevel()>0);renderPanel('structure');});
on('#tool-isolate',()=>{if(!ensureMachineInspectionContext('Isolasi')||simulationLocksStructure())return;if(!engine||!selectedPart){showPanel();renderPanel('structure');toast('Pilih bagian mesin terlebih dahulu.',true);return;}const isolated=!isIsolated();setDomainState({inspectionMode:{isolate:isolated}});engine.isolated=isolated;engine.template.isolate(selectedPart,isolated);$('#tool-isolate').classList.toggle('active',isolated);});
on('#labels',()=>{const labels=!Boolean(getAppState().visibleLayers?.labels);setDomainState({visibleLayers:{labels}});if(engine)engine.labels=labels;$('#labels').classList.toggle('active',labels);});
on('#tool-interior',()=>{if(!ensureMachineInspectionContext('Buka Interior'))return;if(isInteriorOpen())resetExteriorView();else showExteriorAll();$('#tool-interior')?.classList.toggle('active',isInteriorOpen());});
window.addEventListener('bmj:layerchange',event=>{if(!engine)return;const {key,visible}=event.detail||{};const map={building:'building',roof:'roof',machines:'machines',labels:'labels',landscape:'landscape',reference:'reference',unidentified:'unidentified',compressedAir:'utility_compressed_air',ahuPiping:'utility_ahu_piping',ducting:'utility_ahu_ducting',utilityAnchors:'utility_anchors'};const layer=map[key];if(!layer)return;if(key==='labels'){engine.labels=Boolean(visible);$('#labels')?.classList.toggle('active',engine.labels);}engine.setFactoryLayer(layer,Boolean(visible));});
window.addEventListener('bmj:systemfocus',event=>{
 if(!engine?.actualFactory?.layers)return;const system=event.detail?.system;
 const layerNames=system==='hvac'?['utility_ahu_ducting','utility_ahu_piping']:system==='compressedAir'?['utility_compressed_air']:system==='routing'?['utility_compressed_air','utility_ahu_piping','utility_ahu_ducting','utility_anchors']:[];
 const layers=layerNames.map(name=>engine.actualFactory.layers[name]).filter(Boolean),routing=engine.actualFactory.utilityRouting||engine.actualFactory.root?.userData?.utilityRouting||null;
 const wantedSystems=system==='hvac'?['AHU_PIPING','AHU_DUCTING']:system==='compressedAir'?['COMPRESSED_AIR']:system==='routing'?['COMPRESSED_AIR','AHU_PIPING','AHU_DUCTING']:[];
 const networks=(routing?.systems||[]).filter(item=>wantedSystems.includes(item.system));
 const equipment=system==='hvac'?MACHINE_REGISTRY.filter(m=>/^AHU\b/i.test(m.name)):system==='compressedAir'?MACHINE_REGISTRY.filter(m=>/COMPRESSOR/i.test(m.name)):system==='routing'?MACHINE_REGISTRY.filter(m=>/^AHU\b/i.test(m.name)||/COMPRESSOR/i.test(m.name)):[];
 if(layers.length){setView('factory');for(const name of layerNames)engine.setFactoryLayer(name,true);engine.fitObjects?.(layers);}
 else if(system==='water'||system==='electrical')toast('Routing terpisah sistem ini belum tersedia. Model pabrik tetap dipertahankan tanpa mengarang jalur as-built.');
 dispatchEvent(new CustomEvent('bmj:systemcontext',{detail:{
  system,
  title:system==='hvac'?'HVAC':system==='compressedAir'?'Udara Bertekanan':system==='routing'?'Jalur Utilitas':system==='water'?'Air / IPAL':'Kelistrikan',
  available:layers.length>0,
  routeMode:routing?.mode||'BELUM TERSEDIA',
  actualRoutingApplied:routing?.actualRoutingApplied===true,
  networks:networks.map(item=>({system:item.system,status:item.status,nodeCount:item.nodeCount,segmentCount:item.segmentCount,equipmentAnchorCount:item.equipmentAnchorCount,actualRouteVerified:item.actualRouteVerified===true})),
  equipment:equipment.map(m=>({machineId:m.machineId,name:m.name,model:m.model,sapCode:m.sapCode,area:m.area})),
  consumerText:system==='compressedAir'?'Titik pemakaian aktual belum dipetakan ke mesin karena gambar distribusi udara bertekanan belum tersedia.':system==='hvac'?'Jalur supply/return tersedia sebagai acuan fungsi; ruang dan terminal pemakaian aktual belum dipetakan.':system==='routing'?'Tujuan distribusi mengikuti masing-masing sistem dan masih menunggu gambar jalur yang terverifikasi.':'Tujuan distribusi belum tersedia sebagai data terpisah.',
  sourceText:system==='compressedAir'?'Database mesin BMJ + acuan jalur udara bertekanan':system==='hvac'?'Database AHU BMJ + acuan pipa dan ducting AHU':system==='routing'?'Acuan jalur utilitas + database peralatan BMJ':'Model bangunan BMJ; jalur terpisah belum tersedia',
  boundary:system==='water'?'Peralatan IPAL tersedia pada model bangunan, tetapi jalur air dan pipa proses belum dipetakan sebagai jalur yang terverifikasi.':system==='electrical'?'Kelistrikan mengikuti model bangunan; single-line diagram, cable tray, panel feeder, dan jalur kabel aktual belum tersedia.':'Jalur yang tampil masih berupa acuan sampai gambar aktual atau verifikasi lapangan diterapkan.'
 }}));
});
window.addEventListener('bmj:systemassetselect',async event=>{const machine=MACHINE_REGISTRY_BY_ID.get(event.detail?.machineId);if(machine)await openAssetContext(machine);});
on('#fullscreen',async()=>{if(!document.fullscreenEnabled){toast('Layar penuh tidak didukung browser ini.');return;}if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();});
window.addEventListener('offline',()=>{updateConnectionTruth();toast(cachedDataActive?'Koneksi terputus. Aplikasi menggunakan data tersimpan di perangkat.':'Koneksi terputus. Aplikasi tetap tersedia dalam mode lokal.');});window.addEventListener('online',()=>{updateConnectionTruth();if(role)request('/api/state').then(acceptState).then(()=>{cachedDataActive=false;updateConnectionTruth();toast('Data berhasil diperbarui.');}).catch(e=>toast(e.message,true));});
try{const config=await fetch('./config.json').then(r=>r.json());const savedBase=readConnectionSetting('apiBase','');apiBase=savedBase==='https://digitaltwin.offsetbmj.workers.dev'?config.apiBase:(savedBase||config.apiBase||'');if(savedBase==='https://digitaltwin.offsetbmj.workers.dev')localStorage.setItem(CONNECTION_STORAGE.apiBase,apiBase);if(cacheEnabled&&apiBase){const cached=await cache.get(apiBase);if(cached?.state){state=cached.state;cachedDataActive=true;engine?.loadLayout(activeLayout());renderStatus();renderPanel();updateConnectionTruth();toast('CACHED DATA · '+new Date(cached.savedAt).toLocaleString('id-ID'));}}else updateConnectionTruth();}catch(e){updateConnectionTruth();toast('Data tersimpan tidak dapat dibaca. Mode lokal tetap tersedia.',true);}
window.addEventListener('resize',()=>redrawPlantPlan(),{passive:true});window.addEventListener('bmj:statechange',event=>{if(document.body.classList.contains('workspace-2d'))redrawPlantPlan(event.detail?.selectedAsset||null);});
window.addEventListener('pagehide',()=>{token='';});
