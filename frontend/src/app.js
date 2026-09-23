import {selectPlantLayout} from './data/plant-actual.js';
import {loadFactoryFleet} from './factory-building.js';
import {FactoryEngine} from './engine.js';
import {initialState,validateLayout,validatePosition,worldToCad} from './model.js';
import {OFFSET5_TAXONOMY,TAXONOMY_BY_ID as OFFSET5_BY_ID,taxonomyChildren as offset5Children,taxonomyStats as offset5Stats} from './data/taxonomy-offset5.js';
import {PHOTO_REGISTRY as OFFSET5_PHOTOS,TECHNICAL_SOURCES as OFFSET5_SOURCES,photoStats as offset5PhotoStats,ORIENTATION as OFFSET5_ORIENTATION} from './data/sources-offset5.js';
import {confidenceLabel} from './data/confidence.js';
import {loadBundledPlantLayout,drawPlantPlan} from './data/plant-layout-data.js';
import {PRINTING_SIMULATION_STAGES as OFFSET5_SIM_STAGES,INK_SIMULATION_SEQUENCE as OFFSET5_INK_SEQUENCE} from './simulation.js';
import {MACHINE_REGISTRY,MACHINE_REGISTRY_BY_ID,MACHINE_REGISTRY_STATS} from './data/machine-registry.js';
import {FOUNDATION_SCOPE,foundationAssetPolicy,scopedRegistryHas3D,canOpenTechnical3D,isFoundationPrimary} from './data/foundation-scope.js';
import {assetTruth,connectionTruth,layoutTruth,positionVerification,truthStatus} from './data/truth-status.js';
import {buildDwgFidelityLedger} from './data/dwg-fidelity.js';
const LEGACY_MACHINE_ROUTE=Object.freeze({
 'BMJ-MCH-0002':'sheeting',
 'BMJ-MCH-0003':'offset5',
 'BMJ-MCH-0009':'offset10',
 'BMJ-MCH-0010':'apm2'
});
const normalizeMachineKey=key=>LEGACY_MACHINE_ROUTE[key]||key||FOUNDATION_SCOPE.primaryRoute;
let REQUESTED_MACHINE,GENERIC_CONFIG=null,MACHINE_KEY=FOUNDATION_SCOPE.primaryRoute,IS_OFFSET10=false,IS_APM2=false,IS_SHEETING=false,IS_GENERIC=false,IS_VERIFIED_REGISTRY_SIM=false,GENERIC_TAXONOMY=[],GENERIC_ROOT=null,ACTIVE_ROOT='O5',ACTIVE_TAXONOMY=OFFSET5_TAXONOMY,TAXONOMY_BY_ID=OFFSET5_BY_ID,taxonomyChildren=offset5Children,taxonomyStats=offset5Stats,PHOTO_REGISTRY=OFFSET5_PHOTOS,GENERIC_SOURCES=[],TECHNICAL_SOURCES=OFFSET5_SOURCES,photoStats=offset5PhotoStats,ORIENTATION=OFFSET5_ORIENTATION,PRINTING_SIMULATION_STAGES=OFFSET5_SIM_STAGES,INK_SIMULATION_SEQUENCE=OFFSET5_INK_SEQUENCE;
function configureActiveMachine(requested){
 REQUESTED_MACHINE=requested;
 MACHINE_KEY=FOUNDATION_SCOPE.primaryRoute;
 IS_OFFSET10=false;IS_APM2=false;IS_SHEETING=false;IS_GENERIC=false;IS_VERIFIED_REGISTRY_SIM=false;
 GENERIC_CONFIG=null;GENERIC_TAXONOMY=[];GENERIC_ROOT=null;GENERIC_SOURCES=[];
 ACTIVE_ROOT='O5';ACTIVE_TAXONOMY=OFFSET5_TAXONOMY;TAXONOMY_BY_ID=OFFSET5_BY_ID;
 taxonomyChildren=offset5Children;taxonomyStats=offset5Stats;PHOTO_REGISTRY=OFFSET5_PHOTOS;
 TECHNICAL_SOURCES=OFFSET5_SOURCES;photoStats=offset5PhotoStats;ORIENTATION=OFFSET5_ORIENTATION;
 PRINTING_SIMULATION_STAGES=OFFSET5_SIM_STAGES;INK_SIMULATION_SEQUENCE=OFFSET5_INK_SEQUENCE;
}
const INITIAL_URL_STATE=new URLSearchParams(location.search);
const INITIAL_REQUESTED_ASSET=INITIAL_URL_STATE.get('machine')||INITIAL_URL_STATE.get('asset');
configureActiveMachine(canOpenTechnical3D(INITIAL_REQUESTED_ASSET)?INITIAL_REQUESTED_ASSET:FOUNDATION_SCOPE.primaryRoute);
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'Belum tersedia').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=n=>Number.isFinite(n)?n.toLocaleString('id-ID',{maximumFractionDigits:4}):'Belum tersedia';
let state,engine,activeTab='overview',apiBase='',token='',role=null,editing=false,explode=0,selectedPart=null,selectedTaxonomyId=ACTIVE_ROOT,exteriorMode=false,exteriorPreviousLow=null,exteriorFocusKey=null,simulationState,simulationOwnsExterior=false,referenceCategoryFilter='all',toastTimer,bundledLayout=null,cachedDataActive=false;
function applyActiveMachineState(){
 state=structuredClone(initialState);referenceCategoryFilter='all';
 simulationState={active:false,running:false,paused:false,speed:1,stage:'Feeder',completed:0,progress:0,sheetsVisible:0,pileSheetsVisible:0,rotorCount:0,oscillatorCount:0,mechanismCount:0,inkFlowCount:0,uvLampCount:0,uvActive:false,pathVisible:IS_SHEETING?false:true,inkFlowVisible:true};
 if(IS_OFFSET10)state.asset={...state.asset,asset_id:'MACHINE-OFFSET10',asset_code:'OFFSET-10',codename:null,model:'CX104-2+LY-8+LY-1+L UV + FoilStar',description:'OFFSET 10',source_description:'OFFSET - 10 MACHINE',manufacturer:'Heidelberg',specification:'Speedmaster CX 104 · Full UV · FoilStar Gen.3 · X3 delivery',configuration:'CX104-2+LY-8+LY-1+L UV + FoilStar / X3','3d_status':'PROCEDURAL / DOCUMENT-GROUNDED',data_confidence:'HIGH CONFIDENCE',discovery_status:'OFFICIAL_DOCUMENTS_AVAILABLE',sources:OFFSET10_TECHNICAL_SOURCES};
 if(IS_APM2)state.asset={...state.asset,asset_id:'MACHINE-APM2',asset_code:'APM-2',codename:'APM-2',model:'SP 102',description:'AUTOPLATEN - 2 MACHINE',source_description:'BMJ Machine Database',manufacturer:'BOBST',specification:'Automatic flatbed die cutter · SP 102 family · 1994',configuration:'Feeder · Register / SideLay · Gripper Chain · Flatbed Platen · Stripping · Delivery','3d_status':'PROCEDURAL / DATABASE + LEGACY FAMILY REFERENCES',data_confidence:'IDENTITY VERIFIED / VARIANT REFERENCE',discovery_status:'SP102_FAMILY_REFERENCE_AVAILABLE',serial_number:'57115506',functional_location:'PC-PK2-CON-AUT-AUTOPLAT02',year:1994,sources:APM2_TECHNICAL_SOURCES};
 if(IS_SHEETING)state.asset={...state.asset,asset_id:'BMJ-MCH-0002',asset_code:'SBM-2',codename:'SBM-2',model:'HSM-CTM7',description:'SHEETING LEXUS',source_description:'BMJ Machine Database',manufacturer:'LEXUS',specification:'HSM-CTM7 · BMJ identity + BW HSM56 visual family · 2014',configuration:'Low two-sided rollstand ref. → Inclined Guide/Tension/EPC → Main Head/Cut Zone → Fast Tape → Slow Tape/Overlap → Lift Stacker','3d_status':'DEDICATED PROCEDURAL / SOURCE-GROUNDED VISUAL RECONSTRUCTION',data_confidence:'IDENTITY VERIFIED / VISUAL FAMILY REFERENCE / CUTTER TYPE UNRESOLVED',discovery_status:'LEXUS_HSM56_VISUAL_PLUS_MULTI_OEM_PROCESS_REFERENCES',serial_number:'00982',functional_location:'PC-PK2-OFS-SHT-SHEETING01',year:2014,sources:SHEETING_TECHNICAL_SOURCES};
 if(IS_GENERIC){const m=GENERIC_CONFIG.machine,e=GENERIC_CONFIG.evidence,units=GENERIC_TAXONOMY.filter(n=>n.level===2).map(n=>n.name);state.asset={...state.asset,asset_id:m.machineId,asset_code:m.sapCode||m.machineId,codename:m.sapCode,model:m.model,description:m.name,source_description:'BMJ Machine Database',manufacturer:null,specification:GENERIC_CONFIG.label,configuration:(units.length?units:GENERIC_CONFIG.modules).join(' · '),'3d_status':IS_VERIFIED_REGISTRY_SIM?'DEDICATED PROCEDURAL / '+e.geometry:'PROCEDURAL / '+e.geometry,data_confidence:e.grade,discovery_status:IS_VERIFIED_REGISTRY_SIM?'DEDICATED_EVIDENCE_AVAILABLE':'FAMILY_REFERENCE_AVAILABLE',serial_number:m.serial,functional_location:m.functionalLocation,year:m.year,sources:GENERIC_SOURCES};}
}
applyActiveMachineState();
function updateEvidenceStatus(){
 const summary=$('#evidence-summary'),detail=$('#evidence-detail');if(!summary||!detail)return;
 const identity=state?.asset?.asset_id||state?.asset?.asset_code||MACHINE_KEY;
 const photos=Array.isArray(PHOTO_REGISTRY)?PHOTO_REGISTRY.length:0,docs=Array.isArray(TECHNICAL_SOURCES)?TECHNICAL_SOURCES.length:0;
 const placement=placementForMachine?.('BMJ-MCH-0003')||null,truth=assetTruth(state?.asset,{placement,sourceCount:docs});
 summary.textContent=`${truth.dataConfidence} · ${docs} sumber`;
 detail.innerHTML=`${pair('Identitas aset',identity||'UNKNOWN')}${pair('Status operasi',truth.operatingStatus)}${pair('Health score',truth.healthScore)}${pair('3D source',truth.source3D)}${pair('3D detail',truth.detail3D)}${pair('Data confidence',truth.dataConfidence)}${pair('Posisi',truth.position)}${pair('Foto aktual / registry',photos?photos+' file':'UNKNOWN')}${pair('Dokumen / sumber teknis',docs?docs+' sumber':'UNKNOWN')}`;
}
function applyMachineShell(){
 const name=IS_OFFSET10?'OFFSET 10':IS_APM2?'APM 2':IS_SHEETING?'SHEETING LEXUS':IS_GENERIC?GENERIC_CONFIG.machine.name:'OFFSET 5';
 const maker=IS_OFFSET10||(!IS_APM2&&!IS_SHEETING&&!IS_GENERIC)?'Heidelberg':IS_APM2?'BOBST':IS_SHEETING?'LEXUS':GENERIC_CONFIG.label;
 const model=IS_OFFSET10?'CX104-2+LY-8+LY-1+L UV + FoilStar':IS_APM2?'SP 102 · 1994':IS_SHEETING?'HSM-CTM7 · 2014':IS_GENERIC?(GENERIC_CONFIG.machine.model||'Model belum terverifikasi'):'CD 102-8+L';
 document.title='Packaging Offset Factory Digital Twin · '+name;
 const title=$('#view-title'),sub=$('#view-subtitle'),label=$('#machine-label strong'),detail=$('#label-detail'),caption=$('#geometry-caption');
 if(title)title.textContent=name;if(sub)sub.textContent=maker+' · '+model;if(label)label.textContent=name;if(detail)detail.textContent=model;if(caption)caption.textContent='Model '+name;
 const heading=$('.asset-heading h2'),headingSub=$('.asset-heading p');if(heading)heading.textContent=name;if(headingSub)headingSub.textContent=maker+' · '+model;updateEvidenceStatus();
 const quick=$('.telemetry-strip section:first-child');
 if(quick&&IS_OFFSET10)quick.innerHTML='<h4>INFORMASI CEPAT</h4><span>Mesin <b>OFFSET 10</b></span><span>Konfigurasi <b>Full UV + FoilStar</b></span><span>Model <b>CX 104</b></span>';
 if(quick&&IS_APM2)quick.innerHTML='<h4>INFORMASI CEPAT</h4><span>Mesin <b>APM 2</b></span><span>Model <b>SP 102</b></span><span>Tahun <b>1994</b></span>';
 if(quick&&IS_SHEETING)quick.innerHTML='<h4>INFORMASI CEPAT</h4><span>Mesin <b>SHEETING LEXUS</b></span><span>Kode <b>SBM-2</b></span><span>Alur <b>Kanan → Kiri</b></span>';
 const simCaption=$('#tool-simulation span');if(simCaption)simCaption.textContent=IS_APM2?'Proses Autoplaten':IS_SHEETING?'Proses Sheeting':IS_GENERIC?(IS_VERIFIED_REGISTRY_SIM?'Simulasi Proses':'Belum Tervalidasi'):'Simulasi Proses';
 if(IS_OFFSET10){
  const mark=$('.brandmark');if(mark)mark.innerHTML='F<span>10</span>';
  const icon=$('.asset-icon');if(icon)icon.textContent='10';
  const kpi=$('.top-kpis>div:nth-child(2)');if(kpi)kpi.innerHTML='<small>REFERENSI TEKNIS</small><b>'+TECHNICAL_SOURCES.length+'</b><span>Terverifikasi</span>';
  const hierarchy=$('[data-workbench-card="hierarchy"] .asset-tree');if(hierarchy)hierarchy.innerHTML='<details open><summary>Pabrik <span class="tax-level">L0</span></summary><details open><summary>Area Produksi</summary><details open><summary><span class="active-node">OFFSET 10</span> <span class="tax-level">L1 · Mesin</span></summary><div>Preset Plus Feeder · 11 Printing Units · FoilStar Gen.3 · 3 Coating Units · 2 Y UV Units · X3 Delivery</div></details></details></details>';
  const hsmall=$('[data-workbench-card="hierarchy"] header small');if(hsmall)hsmall.textContent='Offset 10';
  const qsmall=$('[data-workbench-card="quick"] header small');if(qsmall)qsmall.textContent='OFFSET 10';
  const qgrid=$('[data-workbench-card="quick"] .quick-grid');if(qgrid)qgrid.innerHTML='<dt>Model</dt><dd>CX 104</dd><dt>Konfigurasi</dt><dd>2+LY-8+LY-1+L UV + FoilStar</dd><dt>Kecepatan maks.</dt><dd>15.000 sheets/jam</dd><dt>Sheet maks.</dt><dd>720 × 1.040 mm</dd><dt>Elevasi</dt><dd>564 mm</dd><dt>Printing Unit</dt><dd>11</dd><dt>Coating Unit</dt><dd>3</dd><dt>UV</dt><dd>6 interdeck + 3 EOP</dd><dt>Delivery</dt><dd>X3</dd>';
  const warning=$('#dwg-warning');if(warning)warning.textContent='Model Offset 10 memakai layout mesin final Heidelberg. Posisi plant tidak mengambil anchor OFU-1/Offset 5.';
 }else if(IS_APM2){
  const mark=$('.brandmark');if(mark)mark.innerHTML='A<span>2</span>';
  const icon=$('.asset-icon');if(icon)icon.textContent='A2';
  const kpi=$('.top-kpis>div:nth-child(2)');if(kpi)kpi.innerHTML='<small>REFERENSI TEKNIS</small><b>'+TECHNICAL_SOURCES.length+'</b><span>Database + family</span>';
  const hierarchy=$('[data-workbench-card="hierarchy"] .asset-tree');if(hierarchy)hierarchy.innerHTML='<details open><summary>Pabrik <span class="tax-level">L0</span></summary><details open><summary>Offset Converting</summary><details open><summary><span class="active-node">APM 2</span> <span class="tax-level">L1 · Mesin</span></summary><div>Feeder · Register / SideLay · Gripper Chain · Platen · Stripping · Delivery</div></details></details></details>';
  const hsmall=$('[data-workbench-card="hierarchy"] header small');if(hsmall)hsmall.textContent='APM 2';
  const qsmall=$('[data-workbench-card="quick"] header small');if(qsmall)qsmall.textContent='APM-2';
  const qgrid=$('[data-workbench-card="quick"] .quick-grid');if(qgrid)qgrid.innerHTML='<dt>Model</dt><dd>SP 102</dd><dt>Serial</dt><dd>57115506</dd><dt>Tahun</dt><dd>1994</dd><dt>Sheet maks.</dt><dd>1.020 × 720 mm</dd><dt>Kecepatan family ref.</dt><dd>7.500 sheets/jam</dd><dt>Tekanan family ref.</dt><dd>250 ton</dd><dt>Suffix</dt><dd>Belum terkonfirmasi</dd><dt>SAP Code</dt><dd>APM-2</dd>';
  const warning=$('#dwg-warning');if(warning)warning.textContent='Posisi APM 2 pada plant belum diklaim sampai anchor layout aktualnya tervalidasi.';
 }else if(IS_SHEETING){
  const mark=$('.brandmark');if(mark)mark.innerHTML='S<span>2</span>';
  const icon=$('.asset-icon');if(icon)icon.textContent='S2';
  const kpi=$('.top-kpis>div:nth-child(2)');if(kpi)kpi.innerHTML='<small>REFERENSI TEKNIS</small><b>'+TECHNICAL_SOURCES.length+'</b><span>Database + family</span>';
  const hierarchy=$('[data-workbench-card="hierarchy"] .asset-tree');if(hierarchy)hierarchy.innerHTML='<details open><summary>Pabrik <span class="tax-level">L0</span></summary><details open><summary>Offset Printing</summary><details open><summary><span class="active-node">SHEETING LEXUS</span> <span class="tax-level">L1 · Mesin</span></summary><div>Low Two-Sided Rollstand · Inclined Guide / Tension / EPC · Main Head / Cut Zone · Fast Tape · Slow Tape / Overlap · Lift Stacker</div></details></details></details>';
  const hsmall=$('[data-workbench-card="hierarchy"] header small');if(hsmall)hsmall.textContent='SBM-2';
  const qsmall=$('[data-workbench-card="quick"] header small');if(qsmall)qsmall.textContent='SBM-2';
  const qgrid=$('[data-workbench-card="quick"] .quick-grid');if(qgrid)qgrid.innerHTML='<dt>Model plant</dt><dd>HSM-CTM7</dd><dt>Serial</dt><dd>00982</dd><dt>Tahun</dt><dd>2014</dd><dt>SAP Code</dt><dd>SBM-2</dd><dt>Referensi visual</dt><dd>BW HSM 56 visual + Pasaban / Maxson / Unico process refs</dd><dt>HSM 56 pembanding</dt><dd>2014 · 300 m/min · 600 gsm</dd><dt>Jenis cutter exact</dt><dd>Belum terverifikasi</dd><dt>Alur aktual</dt><dd>RIGHT → LEFT</dd>';
  const warning=$('#dwg-warning');if(warning)warning.textContent='Orientasi Sheeting telah dikoreksi: input reel di kanan, proses menuju kiri, output stack di kiri. Posisi plant tetap menunggu anchor layout yang tervalidasi.';
 }else if(IS_GENERIC){
  const m=GENERIC_CONFIG.machine,mark=$('.brandmark');if(mark)mark.innerHTML=String(m.no).padStart(2,'0');
  const icon=$('.asset-icon');if(icon)icon.textContent=String(m.no).padStart(2,'0');
  const hierarchy=$('[data-workbench-card="hierarchy"] .asset-tree');if(hierarchy)hierarchy.innerHTML=`<details open><summary>Pabrik <span class="tax-level">L0</span></summary><details open><summary>${esc(m.area)}</summary><details open><summary><span class="active-node">${esc(m.name)}</span> <span class="tax-level">L1 · Mesin</span></summary><div>${GENERIC_CONFIG.modules.map(esc).join(' · ')}</div></details></details></details>`;
  const hsmall=$('[data-workbench-card="hierarchy"] header small');if(hsmall)hsmall.textContent=m.sapCode||m.machineId;
  const qsmall=$('[data-workbench-card="quick"] header small');if(qsmall)qsmall.textContent=m.sapCode||m.machineId;
  const qgrid=$('[data-workbench-card="quick"] .quick-grid');if(qgrid)qgrid.innerHTML=`<dt>Model</dt><dd>${esc(m.model||'Belum tersedia')}</dd><dt>Serial</dt><dd>${esc(m.serial||'Belum tersedia')}</dd><dt>Tahun</dt><dd>${esc(m.year||'Belum tersedia')}</dd><dt>Area</dt><dd>${esc(m.area)}</dd><dt>Status geometry</dt><dd>${esc(GENERIC_CONFIG.evidence.geometry)}</dd><dt>Status simulasi</dt><dd>${IS_VERIFIED_REGISTRY_SIM?'TERSEDIA · reference process':'DIBLOKIR · belum tervalidasi'}</dd><dt>Catatan bukti</dt><dd>${esc(GENERIC_CONFIG.evidence.reason)}</dd>`;
  const warning=$('#dwg-warning');if(warning)warning.textContent='Posisi dan orientasi mesin ini pada plant belum diklaim sampai anchor layout aktual tervalidasi.';
 }
}
applyMachineShell();
const toast=(message,error=false)=>{clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.toggle('error',error);$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,error?9000:5000);};
const safe=fn=>async(...args)=>{try{await fn(...args);}catch(e){console.error('[Digital Twin UI]',e);toast('Tindakan belum dapat dijalankan. Silakan coba kembali.',true);}};
const on=(id,fn)=>$(id)?.addEventListener('click',safe(fn));
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
 }else{
  const units=Array.from({length:8},(_,i)=>`<g transform="translate(${235+i*58} 0)"><rect x="0" y="78" width="50" height="86" rx="7"/><rect class="dark" x="5" y="91" width="40" height="28" rx="3"/><circle cx="17" cy="137" r="8"/><circle cx="34" cy="137" r="8"/><text x="25" y="72">PU${i+1}</text></g>`).join('');
  viewport.insertAdjacentHTML('beforeend',`<div class="static-machine-fallback" role="img" aria-label="Tampilan cadangan lengkap Offset 5 dari feeder sampai delivery"><svg viewBox="0 0 900 260" xmlns="http://www.w3.org/2000/svg"><style>.machine{fill:#e8edf0;stroke:#101820;stroke-width:2}.machine .dark{fill:#34424a}.machine text{font:700 10px system-ui;text-anchor:middle;fill:#101820;stroke:none}.flow{fill:none;stroke:#e95718;stroke-width:4;stroke-dasharray:10 7}</style><g class="machine"><g transform="translate(30 0)"><path d="M0 164V92l48-30h62v102z"/><rect class="dark" x="57" y="80" width="44" height="34" rx="3"/><text x="55" y="54">FEEDER</text></g><g transform="translate(145 0)"><path d="M0 164V125h82v39z"/><path class="dark" d="M8 126l65-25v18L8 144z"/><text x="40" y="96">REGISTER</text></g>${units}<g transform="translate(704 0)"><rect x="0" y="70" width="58" height="94" rx="8"/><rect class="dark" x="7" y="86" width="44" height="32" rx="3"/><text x="29" y="62">COATER</text></g><g transform="translate(770 0)"><path d="M0 164V98l82-32 18 98z"/><rect class="dark" x="18" y="103" width="58" height="33" rx="3"/><text x="48" y="55">DELIVERY</text></g></g><path class="flow" d="M45 183H845"/><text x="450" y="214" text-anchor="middle" font-family="system-ui" font-size="13" fill="currentColor">Feeder → Register → PU1–PU8 → Coating → Delivery</text></svg><p>Tampilan cadangan aktif karena akselerasi grafis 3D tidak tersedia pada browser ini. Struktur dan informasi mesin tetap dapat digunakan.</p></div>`);
 }
 $('#boot').hidden=true;
 $('#engine-status').textContent='Tampilan cadangan siap';
 console.warn('Fallback mesin aktif:',error?.message||error);
}
function modal(title,html){$('#modal-title').textContent=title;$('#modal-body').innerHTML=html;if(!$('#modal').open)$('#modal').showModal();}
function closeModal(){const dialog=$('#modal');if(dialog?.open)dialog.close();}
function emitDomainState(detail){window.dispatchEvent(new CustomEvent('bmj:domainstate',{detail}));}
function showPanel(){document.body.classList.remove('panel-hidden');if(matchMedia('(max-width:767px)').matches)document.body.classList.add('mobile-panel-open');emitDomainState({inspectorState:{open:true,tab:activeTab}});}
const activeLayout=()=>selectPlantLayout(state.layout,bundledLayout);
function redrawPlantPlan(){if(bundledLayout)drawPlantPlan($('#dwg-canvas'),bundledLayout);}
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
function enableExteriorOpen(){
 if(!engine)return false;
 if(!exteriorMode){exteriorPreviousLow=engine.low;exteriorMode=true;}
 engine.template.reset();engine.clearPartLabels();engine.isolated=false;engine.setLow(false);engine.template.setExteriorOpen(true);
 selectedPart=null;explode=0;return true;
}
function exitExteriorMode(){
 if(exteriorMode&&engine){
  engine.template.setExteriorOpen(false);engine.template.reset();engine.clearPartLabels();engine.isolated=false;
  if(exteriorPreviousLow!==null)engine.setLow(exteriorPreviousLow);
 }
 exteriorMode=false;exteriorPreviousLow=null;exteriorFocusKey=null;
}
function showExteriorAll(){
 if(!enableExteriorOpen())return;
 exteriorFocusKey=null;selectedTaxonomyId=ACTIVE_ROOT;engine.fit(engine.machine);renderPanel('exterior');
}
function focusExteriorArea(key){
 if(!engine)return;
 const area=exteriorAreas().find(item=>item.key===key),parts=exteriorAreaNodes(area);if(!area||!parts.length)return;
 if(!enableExteriorOpen())return;
 exteriorFocusKey=key;engine.fitObjects(parts);renderPanel('exterior');
}
function resetExteriorView(){
 if(!engine)return;exitExteriorMode();engine.fit(engine.machine);selectedPart=null;selectedTaxonomyId=ACTIVE_ROOT;explode=0;renderPanel('exterior');
}
function updateSimulationPanel(next=simulationState){
 simulationState=next||simulationState;
 const running=!!simulationState.running,active=!!simulationState.active,progress=Math.round((simulationState.progress||0)*100);
 const status=$('#sim-status'),stage=$('#sim-stage'),count=$('#sim-completed'),visible=$('#sim-visible'),pile=$('#sim-pile'),bar=$('#sim-progress-bar'),pause=$('#sim-pause'),start=$('#sim-start'),uv=$('#sim-uv-state'),uvCount=$('#sim-uv-count'),uvIndicator=$('#sim-uv-indicator');
 if(status)status.textContent=running?'RUNNING':active?'PAUSED':'READY';
 if(stage)stage.textContent=simulationState.stage||'Feeder';
 if(count)count.textContent=String(simulationState.completed||0);
 if(visible)visible.textContent=String(simulationState.sheetsVisible||0);
 if(pile)pile.textContent=String(simulationState.pileSheetsVisible||0);
 if(uv){uv.textContent=simulationState.uvActive?'AKTIF':'STANDBY';uv.classList.toggle('active',!!simulationState.uvActive);}
 if(uvCount)uvCount.textContent=String(simulationState.uvLampCount||0);
 if(uvIndicator)uvIndicator.classList.toggle('active',!!simulationState.uvActive);
 if(bar)bar.style.width=progress+'%';
 if(start)start.textContent=active?(running?'Running':'Lanjutkan'):(IS_APM2?'Mulai Simulasi Proses':IS_SHEETING?'Mulai Simulasi Sheeting':IS_VERIFIED_REGISTRY_SIM?'Mulai Simulasi Proses':'Mulai Simulasi Proses');
 if(pause)pause.textContent=running?'Pause':'Lanjut';
 document.querySelectorAll('[data-sim-speed]').forEach(b=>b.classList.toggle('active',Math.abs(+b.dataset.simSpeed-(simulationState.speed||1))<.01));
 document.querySelectorAll('[data-sim-stage]').forEach(b=>b.classList.toggle('active',b.dataset.simStage===(simulationState.stage||'')));
 $('#tool-simulation')?.classList.toggle('active',active);
 emitDomainState({simulationState:{active,playing:running,stage:simulationState.stage||null,speed:simulationState.speed||1,progress}});
}
function startPrintingSimulation(){
 if(!engine)return;
 if(engine.view!=='machine')setView('machine');
 if(!engine.isPrintingSimulationActive()){
  simulationOwnsExterior=!exteriorMode;
  enableExteriorOpen();
  engine.template.ghost(false);engine.isolated=false;engine.clearPartLabels();selectedPart=null;selectedTaxonomyId=ACTIVE_ROOT;explode=0;
  simulationState=engine.startPrintingSimulation();
  engine.fit(engine.machine);
 }else simulationState=engine.resumePrintingSimulation();
 updateSimulationPanel(simulationState);renderPanel('simulation');
}
function pausePrintingSimulation(){
 if(!engine?.isPrintingSimulationActive()){startPrintingSimulation();return;}
 simulationState=simulationState.running?engine.pausePrintingSimulation():engine.resumePrintingSimulation();
 updateSimulationPanel(simulationState);
}
function stopPrintingSimulation({restoreExterior=true}={}){
 if(!engine)return;
 simulationState=engine.stopPrintingSimulation();
 if(restoreExterior&&simulationOwnsExterior)exitExteriorMode();
 simulationOwnsExterior=false;updateSimulationPanel(simulationState);
 if(activeTab==='simulation')renderPanel('simulation');
}
function simulationLocksStructure(){
  if(engine?.isPrintingSimulationActive()){toast(IS_APM2?'Hentikan simulasi proses APM 2 sebelum memilih, mengurai, atau mengisolasi komponen.':IS_VERIFIED_REGISTRY_SIM?'Hentikan simulasi proses sebelum memilih, mengurai, atau mengisolasi komponen.':'Hentikan Simulasi Proses sebelum memilih, mengurai, atau mengisolasi komponen.');return true;}
 return false;
}
function choosePart(part){if(!part||!engine||simulationLocksStructure())return;engine.template.reset();engine.isolated=false;explode=0;selectedPart=part;engine.template.highlight(part);engine.template.ghost(true,part);engine.setPartLabels(part,selectedTaxonomyId);engine.fit(part);const meta=taxonomyForPart(part);emitDomainState({selectedAsset:MACHINE_KEY,selectedNode:meta?.id||part.userData?.nodeId||selectedTaxonomyId,inspectorState:{open:true,tab:'structure'}});}
function taxonomyForPart(part){const id=part?.userData?.nodeId;if(!id)return null;return ACTIVE_TAXONOMY.filter(n=>(n.meshRefs||[]).includes(id)).sort((a,b)=>Math.abs(a.level-5)-Math.abs(b.level-5))[0]||null;}
function taxonomyPath(id=selectedTaxonomyId){
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
 const tokens=referenceContextTokens(),activeReference=window.BMJAppState?.getState?.().activeReference||null;
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
 const filtered=referenceCategoryFilter==='all'?all:all.filter(item=>item.kind===referenceCategoryFilter),priorityCount=filtered.filter(item=>item.score>0).length;
 const contextLabel=selectedMeta&&selectedMeta.id!==ACTIVE_ROOT?selectedMeta.name:(IS_GENERIC?GENERIC_CONFIG.machine.name:state?.asset?.description||'Mesin aktif');
 const intro=IS_OFFSET10?'Model Offset 10 dibangun dari final drawing, proposal, layout UV, pre-installation, system diagram, technical data final, serta referensi resmi Heidelberg CX 104 dan FoilStar.':IS_APM2?'Identitas APM 2 berasal dari database BMJ; referensi SP 102 digunakan sesuai evidence boundary.':IS_SHEETING?'Identitas HSM-CTM7 berasal dari database BMJ; referensi HSM 56 dan referensi proses dipisahkan dari klaim bentuk exact.':IS_GENERIC?'Referensi mengikuti evidence map mesin aktif; detail khusus serial yang belum tersedia tetap dibatasi.':'Foto aktual dan dokumen CD102 diprioritaskan berdasarkan komponen yang sedang dipilih.';
 const filters=[['all','Semua'],['photo','Foto'],['document','Dokumen'],['manual','Manual'],['drawing','Gambar / Denah'],['evidence','Bukti / Sumber']];
 const cards=filtered.map(item=>{
  if(item.kind==='photo'){const p=item.photo;return `<article class="context-reference-card ${item.score>0?'is-priority':''} ${item.active?'is-active':''}" data-reference-card="${esc(p.id)}" tabindex="0" role="button" aria-pressed="${item.active?'true':'false'}" aria-label="Pilih referensi foto ${esc(p.filename)}"><header><span class="reference-kind">Foto</span>${item.score>0?'<em>Relevan ke konteks</em>':''}</header><h4>${esc(p.filename)}</h4><p>${esc(p.machineZone)} · ${esc(p.viewDirection)}</p><div class="reference-truth-row"><span>Confidence</span><strong>${esc(truthStatus(p.confidence,'UNVERIFIED'))}</strong></div><small>${esc(p.category||'Foto aktual')}</small></article>`;}
  const src=item.source,file=src.file||src.localFile||null,label=item.kind==='manual'?'Manual':item.kind==='drawing'?'Gambar / Denah':item.kind==='evidence'?'Bukti / Sumber':'Dokumen';
  return `<article class="context-reference-card ${item.score>0?'is-priority':''} ${item.active?'is-active':''}" data-reference-card="${esc(src.id||'source-'+item.index)}" tabindex="0" role="button" aria-pressed="${item.active?'true':'false'}" aria-label="Pilih referensi ${esc(src.title)}"><header><span class="reference-kind">${label}</span>${item.score>0?'<em>Relevan ke konteks</em>':''}</header><h4>${esc(src.title)}</h4><p>${esc(src.publisher||'Sumber teknis')}</p><div class="reference-truth-row"><span>Confidence</span><strong>${esc(truthStatus(src.confidence,'UNVERIFIED'))}</strong></div>${Array.isArray(src.supports)&&src.supports.length?`<small>${src.supports.length} fakta/fitur didukung</small>`:''}${file?`<small>${esc(file)}</small>`:''}${src.url?`<a href="${esc(src.url)}" target="_blank" rel="noopener">Buka sumber ↗</a>`:''}</article>`;
 }).join('');
 $('#panel-content').innerHTML=`<h3>Referensi</h3><div class="card accent reference-context-summary"><h4>Konteks: ${esc(contextLabel)}</h4><p>${esc(intro)}</p><span class="tag">${priorityCount?priorityCount+' sumber diprioritaskan':'Sumber mesin aktif'}</span><span class="tag">${all.length} total referensi</span></div><div class="reference-filter-strip">${filters.map(([key,label])=>`<button type="button" data-reference-filter="${key}" class="${referenceCategoryFilter===key?'active':''}">${label}<small>${counts[key]||0}</small></button>`).join('')}</div><div class="context-reference-list">${cards||'<p class="empty">Tidak ada referensi pada kategori ini.</p>'}</div><div class="card"><h4>Arah mesin</h4><p>${esc(flow)} · sisi operator ${esc(op)} · sisi penggerak ${esc(ds)}</p></div><p class="subtle">Prioritas hanya diberikan bila istilah pada struktur terpilih benar-benar ditemukan pada keterangan sumber. Sumber lain tetap tersedia sebagai konteks mesin dan tidak dianggap sebagai bukti langsung komponen.</p>`;
 $$('[data-reference-filter]').forEach(button=>button.onclick=()=>{referenceCategoryFilter=button.dataset.referenceFilter;renderReferencePanel();});
 const activateReferenceCard=card=>{emitDomainState({activeReference:card.dataset.referenceCard,activeSection:'reference'});$$('[data-reference-card]').forEach(x=>{const active=x===card;x.classList.toggle('is-active',active);x.setAttribute('aria-pressed',String(active));});};
 $$('[data-reference-card]').forEach(card=>{
  card.onclick=event=>{if(event.target.closest('a'))return;activateReferenceCard(card)};
  card.onkeydown=event=>{if(event.target.closest('a'))return;if(event.key==='Enter'||event.key===' '){event.preventDefault();activateReferenceCard(card)}};
 });
}
function resetTaxonomyRoot(){
 selectedTaxonomyId=ACTIVE_ROOT;selectedPart=null;explode=0;
 if(engine){engine.template.reset();engine.clearPartLabels();engine.isolated=false;engine.fit(engine.machine);}
 $('#tool-explode')?.classList.remove('active');$('#tool-isolate')?.classList.remove('active');
 emitDomainState({selectedAsset:MACHINE_KEY,selectedNode:ACTIVE_ROOT,inspectionMode:{explode:false,isolate:false}});
 renderPanel(activeTab);
}
function renderContextBreadcrumb(){
 const host=$('#context-breadcrumb');if(!host)return;
 if(engine?.view==='factory'){
  host.innerHTML='<button type="button" data-breadcrumb-factory aria-current="page">Pabrik</button>';
 }else{
  const path=taxonomyPath();
  host.innerHTML='<button type="button" data-breadcrumb-factory>Pabrik</button>'+path.map((node,index)=>`<span aria-hidden="true">/</span><button type="button" data-breadcrumb-node="${esc(node.id)}" ${index===path.length-1?'aria-current="page"':''}>${esc(node.name)}</button>`).join('');
 }
 host.querySelector('[data-breadcrumb-factory]')?.addEventListener('click',()=>{showHome();renderContextBreadcrumb();});
 host.querySelectorAll('[data-breadcrumb-node]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.breadcrumbNode;if(id===ACTIVE_ROOT)resetTaxonomyRoot();else selectTaxonomy(id,{revealPanel:true});}));
}
function taxonomyAtLevel(level){
 const target=Math.max(1,Math.min(6,Number(level)||1));let meta=TAXONOMY_BY_ID.get(selectedTaxonomyId)||TAXONOMY_BY_ID.get(ACTIVE_ROOT);
 while(meta&&meta.level>target)meta=meta.parentId?TAXONOMY_BY_ID.get(meta.parentId):meta;
 while(meta&&meta.level<target){const children=taxonomyChildren(meta.id);if(!children.length)return null;meta=children.find(n=>(n.meshRefs||[]).length)||children[0];}
 return meta?.level===target?meta:null;
}
function selectTaxonomy(id,{revealPanel=false}={}){
 if(simulationLocksStructure())return;const meta=TAXONOMY_BY_ID.get(id);if(!meta)return;
 selectedTaxonomyId=meta.id;const part=engine?.template.resolveTaxonomyNode(meta.id);
 if(part)choosePart(part);else{selectedPart=null;engine?.template.reset();engine?.clearPartLabels();emitDomainState({selectedAsset:MACHINE_KEY,selectedNode:meta.id,inspectorState:{open:true,tab:'structure'}});}
 if(revealPanel&&!matchMedia('(max-width:767px)').matches)showPanel();renderPanel('structure');
}
function taxonomyTree(parentId=ACTIVE_ROOT){
 const children=taxonomyChildren(parentId),selectedPath=new Set(taxonomyPath().map(node=>node.id));
 return children.map(n=>{
  const descendants=taxonomyChildren(n.id);
  const mapped=!!engine?.template.resolveTaxonomyNode(n.id);
  return `<div class="geometry-node"><button data-taxonomy="${esc(n.id)}" aria-pressed="${n.id===selectedTaxonomyId}">${esc(n.name)} <span class="tax-level">L${n.level}${mapped?' · Model':' · Referensi'}</span></button>${descendants.length?`<details ${selectedPath.has(n.id)?'open':''}><summary>${esc(n.levelName||'Struktur')}</summary>${taxonomyTree(n.id)}</details>`:''}</div>`;
 }).join('');
}
function renderFactoryPanel(){
 const layout=activeLayout(),layers=engine?.actualFactory?.layers;if(!layout?.placements||!layers)return false;
 const selectedAsset=window.BMJAppState?.getState?.().selectedAsset;
 const selectedMachine=selectedAsset?MACHINE_REGISTRY_BY_ID.get(selectedAsset):null;
 if(selectedMachine)return machineDetailDialog(selectedMachine);
 const known=layout.placements.filter(p=>p.status!=='UNIDENTIFIED'),unknown=layout.placements.filter(p=>p.status==='UNIDENTIFIED');
 const layerItems=[['roof','Atap'],['building','Bangunan & ruang'],['machines','Posisi aset'],['labels','Nama area & aset'],['unidentified','Area belum teridentifikasi'],['reference','Garis denah sumber']];
 $('#panel-content').innerHTML=`<h3>Fondasi pabrik</h3><p class="subtle">${known.length} posisi terpetakan · ${unknown.length} menunggu identifikasi posisi.</p><div class="card">${layerItems.map(([key,text])=>`<label class="check"><input type="checkbox" data-factory-layer="${key}" ${layers[key].visible?'checked':''}> ${text}</label>`).join('')}</div><label for="factory-asset-focus">Cari posisi aset</label><select id="factory-asset-focus"><option value="">Pilih posisi</option>${layout.placements.map(p=>`<option value="${p.machineId}">${esc(p.label)}${p.status==='UNIDENTIFIED'?' · belum teridentifikasi':''}</option>`).join('')}</select><div class="actions"><button id="factory-overview" class="secondary">Lihat seluruh pabrik</button><button id="factory-unknown" class="secondary">Posisi belum teridentifikasi</button></div><div class="card accent"><h4>Scope berbasis bukti</h4><p>Scene mempertahankan layout DWG dan semua posisi aset yang dapat diidentifikasi. Detail teknis penuh hanya dibuka untuk OFFSET 5. Sistem utilitas tersedia sebagai konteks pabrik dengan status sumber yang eksplisit; jalur yang belum diverifikasi tidak diperlakukan sebagai as-built.</p></div><div class="card"><h4>Ketelitian tampilan</h4><p>Fidelity DWG, konflik unit/scale, geometri belum diimplementasikan, dan batas sumber dapat diperiksa dari Denah Pabrik → Fidelity DWG. Nilai yang belum didukung sumber tetap ditandai UNKNOWN, APPROXIMATE, UNVERIFIED, atau CONFLICTING.</p></div>`;
 const canonicalFactoryLayer={roof:'roof',building:'building',machines:'machines',labels:'labels',unidentified:'unidentified',reference:'reference'};
 $$('[data-factory-layer]').forEach(input=>input.onchange=()=>{const key=input.dataset.factoryLayer,visible=input.checked;engine.setFactoryLayer(key,visible);const canonical=canonicalFactoryLayer[key];if(canonical)emitDomainState({visibleLayers:{[canonical]:visible}});});
 $('#factory-asset-focus').onchange=e=>{if(e.target.value){const p=layout.placements.find(p=>p.machineId===e.target.value),m=MACHINE_REGISTRY_BY_ID.get(e.target.value);engine.setFactoryLayer(p.status==='UNIDENTIFIED'?'unidentified':'machines',true);if(m)selectFactoryAssetContext(m,{historyMode:'none',openDialog:true,focus:true});else engine.focusFactoryAsset(e.target.value);}};
 $('#factory-overview').onclick=()=>{engine.clearFactorySelection();engine.fit(engine.factory,'iso');$('#geometry-caption').textContent='Pabrik · Seluruh Area';$('#scene-hint').textContent='Klik aset untuk memilih · seret untuk memutar · zoom dengan cubit/scroll';emitDomainState({selectedAsset:null,selectedArea:null,activeSection:'factory',cameraPreset:'iso'});};$('#factory-unknown').onclick=()=>{engine.clearFactorySelection();engine.setFactoryLayer('unidentified',true);engine.fit(layers.unidentified);};return true;
}
function renderPanel(tab=activeTab){
 if(editing&&engine){engine.edit(false);engine.onTransform=null;engine.applyPlacement(state);editing=false;}
 activeTab=tab;renderContextBreadcrumb();
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
   const primaryTruth=assetTruth(a,{placement:placementForMachine?.(FOUNDATION_SCOPE.primaryMachineId)||null,sourceCount:TECHNICAL_SOURCES.length});
   $('#panel-content').innerHTML=`<h3>Informasi mesin</h3><dl class="data-list">${pair('Nama aset',a.description)+pair('Kode aset',a.asset_code)+pair('Kode nama',a.codename)+pair('Model',a.model)+pair('Kategori',a.category||'PRODUCTION_MACHINE')+pair('Subkategori',a.subcategory||'OFFSET_PRINTING')+pair('Pabrikan',a.manufacturer)+pair('Spesifikasi',a.specification)+pair('Lokasi',a.location)+pair('Status operasi',primaryTruth.operatingStatus)+pair('Health score',primaryTruth.healthScore)}</dl><h3>Status model 3D</h3><dl class="data-list">${pair('3D source',primaryTruth.source3D)+pair('3D detail',primaryTruth.detail3D)+pair('Data confidence',primaryTruth.dataConfidence)+pair('Posisi',primaryTruth.position)+pair('Source count',primaryTruth.sourceCount?primaryTruth.sourceCount+' sumber':'UNKNOWN')}</dl><div class="card accent"><h4>Rekonstruksi berbasis denah + foto aktual</h4><p>Envelope mesin dan pitch berulang mengikuti footprint OFU-1 pada denah terkalibrasi. Bentuk luar mengacu pada foto aktual, sedangkan struktur fungsional internal mengacu pada dokumen CD102 yang tersedia.</p><span class="tag">PROCEDURAL / RECONSTRUCTED</span><span class="tag">PARTIAL / APPROXIMATE</span></div><dl class="data-list">${pair('Envelope struktur',structuralText)+pair('Envelope termasuk area servis',serviceText)+pair('Pitch modul berulang',pitchText)+pair('Susunan unit','8 printing unit + coating + extension/delivery')+pair('Posisi di pabrik',primaryTruth.position)+pair('Dokumen identitas',a.sources.length+' dokumen')}</dl><div class="card"><h4>Batas ketelitian</h4><p>Ukuran envelope dan pitch berasal dari denah OFU-1. Dimensi internal seperti bearer, nip, cam timing, dan setelan roller hanya ditampilkan bila benar-benar didukung dokumen; sisanya tetap referensi visual.</p></div>`;
  }
 }else if(tab==='structure'){
  const meta=TAXONOMY_BY_ID.get(selectedTaxonomyId)||TAXONOMY_BY_ID.get(ACTIVE_ROOT),stats=taxonomyStats();
  $('#panel-content').innerHTML=`<h3>Struktur mesin · 6 tingkat</h3><p class="subtle">Pilih bagian mesin untuk memusatkan tampilan. Object terpilih tetap terlihat penuh, sedangkan seluruh bagian lainnya otomatis transparan. Label <b>Model</b> berarti bagian tersebut dapat dipilih pada tampilan 3D; label <b>Referensi</b> berarti informasi bagian tersedia tetapi bentuk detailnya belum ditampilkan.</p><button id="tree-root" class="secondary">${IS_OFFSET10?'OFFSET 10':IS_APM2?'APM 2':IS_SHEETING?'SHEETING LEXUS':IS_GENERIC?GENERIC_CONFIG.machine.name:'OFFSET 5'} · Mesin</button><div class="card accent" style="margin-top:12px"><h4>${esc(meta.name)}</h4><p>Bagian terpilih pada struktur ${IS_OFFSET10?'Offset 10':IS_APM2?'APM 2':IS_SHEETING?'Sheeting Lexus':IS_GENERIC?GENERIC_CONFIG.machine.name:'Offset 5'}.</p><span class="tag">TINGKAT ${meta.level}</span></div><label for="explode">Jarak uraian <span id="explode-value">${Math.round(explode*100)}%</span></label><input id="explode" type="range" min="0" max="1" step="0.01" value="${explode}" ${engine?.view==='factory'?'disabled':''}><div class="actions"><button id="assemble" class="secondary">Rakit Kembali</button><button id="ghost" class="secondary ${engine?.template.ghosted?'active':''}">Transparan</button><button id="isolate" class="secondary ${engine?.isolated?'active':''}" aria-disabled="${selectedPart?'false':'true'}">Tampilkan Sendiri</button></div><div class="stage-strip">${[['Mesin',1],['Unit Utama',2],['Sub',3],['Block',4],['Part',5],['Spesifik Part',6]].map(([label,level])=>`<button data-stage="${level}" class="${meta.level===level?'active':''}"><span>${label}</span><small>L${level}</small></button>`).join('')}</div><div class="geometry-tree">${taxonomyTree()}</div><p class="subtle">${stats.total} bagian tercatat dalam struktur mesin.</p>`;
  $('#explode').addEventListener('input',e=>{explode=+e.target.value;engine?.template.explode(explode,selectedPart);if(selectedPart)engine.template.ghost(explode>0,selectedPart);$('#explode-value').textContent=Math.round(explode*100)+'%';$('#ghost').classList.toggle('active',!!engine?.template.ghosted);$('#tool-explode')?.classList.toggle('active',explode>0);emitDomainState({inspectionMode:{explode:explode>0}});});
  on('#assemble',()=>{explode=0;selectedPart=null;if(engine){engine.template.reset();engine.clearPartLabels();engine.isolated=false;engine.fit(engine.machine);}renderPanel();});
  on('#ghost',()=>{if(engine){engine.template.ghost(!engine.template.ghosted,selectedPart);$('#ghost').classList.toggle('active',engine.template.ghosted);}});
  on('#isolate',()=>{if(!engine){toast('Tampilan 3D belum tersedia.',true);return;}if(!selectedPart){toast('Pilih bagian mesin terlebih dahulu.');return;}engine.isolated=!engine.isolated;engine.template.isolate(selectedPart,engine.isolated);$('#isolate').classList.toggle('active',engine.isolated);});
  on('#tree-root',()=>{selectedTaxonomyId=ACTIVE_ROOT;selectedPart=null;explode=0;engine?.template.reset();if(engine){engine.clearPartLabels();engine.isolated=false;engine.fit(engine.machine);}renderPanel();});
  document.querySelectorAll('[data-taxonomy]').forEach(b=>b.onclick=()=>selectTaxonomy(b.dataset.taxonomy));
  document.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>{const candidate=taxonomyAtLevel(+b.dataset.stage);if(candidate)selectTaxonomy(candidate.id);});
 }else if(tab==='simulation'){
  const s=engine?.getPrintingSimulationState?.()||simulationState;simulationState=s;
  if(IS_APM2){
   $('#panel-content').innerHTML=`<h3>Simulasi Proses APM 2</h3><p class="subtle">Simulasi memperlihatkan alur sheet dari pile feeder ke suction head, register dan SideLay, pengambilalihan oleh gripper chain, penekanan pada flatbed die-cutting platen, stripping, lalu pelepasan gripper ke delivery pile. Gerak stroke, phase, tekanan dan timing adalah visualisasi proses—bukan setting servis OEM.</p><div class="card accent simulation-overview"><div class="simulation-status-row"><span id="sim-status" class="simulation-state">${s.running?'RUNNING':s.active?'PAUSED':'READY'}</span><b id="sim-stage">${esc(s.stage||'Pile Feeder')}</b></div><div class="simulation-progress"><span id="sim-progress-bar" style="width:${Math.round((s.progress||0)*100)}%"></span></div><dl class="data-list compact">${pair('Lembar selesai',s.completed||0)+pair('Lembar bergerak',s.sheetsVisible||0)}<dt>Lembar di pile</dt><dd id="sim-pile">${s.pileSheetsVisible||0}</dd>${pair('Mekanisme aktif',s.mechanismCount||0)+pair('Gerak osilasi',s.oscillatorCount||0)+pair('Drive / rotor',s.rotorCount||0)}</dl><div class="actions simulation-actions"><button id="sim-start" class="primary">${s.active?(s.running?'Running':'Lanjutkan'):'Mulai Simulasi Proses'}</button><button id="sim-pause" class="secondary">${s.running?'Pause':'Lanjut'}</button><button id="sim-stop" class="secondary">Stop & Reset</button></div></div><h4>Kecepatan visual</h4><div class="simulation-speed">${[.5,1,1.5,2].map(v=>`<button data-sim-speed="${v}" class="${Math.abs((s.speed||1)-v)<.01?'active':''}">${v}×</button>`).join('')}</div><label class="check"><input id="sim-path" type="checkbox" ${s.pathVisible!==false?'checked':''}> Tampilkan jalur sheet</label><h4>Alur proses</h4><div class="simulation-ink-flow">${APM2_PROCESS_STEPS.map((step,index)=>`<div><span>${index+1}</span><b>${esc(step)}</b></div>`).join('')}</div><div class="simulation-flow">${APM2_SIMULATION_STAGES.map(stage=>`<div data-sim-stage="${esc(stage)}" class="${stage===s.stage?'active':''}"><span></span><b>${esc(stage)}</b></div>`).join('')}</div><div class="card"><h4>Gerak yang divisualisasikan</h4><p>Suction head bergerak naik-turun, feed rollers dan sprocket berputar, SideLay melakukan gerak register lateral, gripper bars membawa sheet, platen melakukan pressure stroke, stripping frame bergerak pada fase berikutnya, lalu sheet berhenti dan menumpuk di delivery. SideLay ditonjolkan karena terdapat histori maintenance BMJ pada area tersebut.</p></div>`;
   on('#sim-start',startPrintingSimulation);on('#sim-pause',pausePrintingSimulation);on('#sim-stop',()=>stopPrintingSimulation({restoreExterior:true}));
   document.querySelectorAll('[data-sim-speed]').forEach(b=>b.onclick=()=>{simulationState=engine?.setPrintingSimulationSpeed(+b.dataset.simSpeed)||simulationState;updateSimulationPanel(simulationState);});
   const pathToggle=$('#sim-path');if(pathToggle)pathToggle.onchange=e=>{simulationState=engine?.setPrintingSimulationPathVisible(e.target.checked)||simulationState;updateSimulationPanel(simulationState);};
   updateSimulationPanel(s);
  }else if(IS_SHEETING){
   $('#panel-content').innerHTML=`<h3>Simulasi Proses Sheeting</h3><p class="subtle">V68 memodelkan aliran material sebagai proses kontinu: reel rendah di <b>kanan</b> → guide/tension/EPC → web <b>membelit permukaan Main Draw / Traction Drum</b> → target panjang tercapai → visible blade / cut event → fast tape → slow tape → overlap/shingle → landing → jogger alignment → lift-table stacker di <b>kiri</b>. Jalur debug dimatikan secara default agar tidak menutupi mekanisme. Timing dan rasio kecepatan bersifat visual-process reference, bukan setelan servis OEM.</p><div class="card accent simulation-overview"><div class="simulation-status-row"><span id="sim-status" class="simulation-state">${s.running?'RUNNING':s.active?'PAUSED':'READY'}</span><b id="sim-stage">${esc(s.stage||'Unwind / Continuous Web')}</b></div><div class="simulation-progress"><span id="sim-progress-bar" style="width:${Math.round((s.progress||0)*100)}%"></span></div><dl class="data-list compact"><dt>Lembar selesai</dt><dd id="sim-completed">${s.completed||0}</dd><dt>Lembar bergerak</dt><dd id="sim-visible">${s.sheetsVisible||0}</dd><dt>Lembar di pile</dt><dd id="sim-pile">${s.pileSheetsVisible||0}</dd>${pair('Mekanisme aktif',s.mechanismCount||0)+pair('Roll / drive aktif',s.rotorCount||0)}</dl><div class="actions simulation-actions"><button id="sim-start" class="primary">${s.active?(s.running?'Running':'Lanjutkan'):'Mulai Simulasi Sheeting'}</button><button id="sim-pause" class="secondary">${s.running?'Pause':'Lanjut'}</button><button id="sim-stop" class="secondary">Stop & Reset</button></div></div><h4>Kecepatan visual</h4><div class="simulation-speed">${[.5,1,1.5,2].map(v=>`<button data-sim-speed="${v}" class="${Math.abs((s.speed||1)-v)<.01?'active':''}">${v}×</button>`).join('')}</div><label class="check"><input id="sim-path" type="checkbox" ${s.pathVisible!==false?'checked':''}> Tampilkan garis referensi jalur proses</label><h4>Alur proses</h4><div class="simulation-ink-flow">${SHEETING_PROCESS_STEPS.map((step,index)=>`<div><span>${index+1}</span><b>${esc(step)}</b></div>`).join('')}</div><div class="simulation-flow">${SHEETING_SIMULATION_STAGES.map(stage=>`<div data-sim-stage="${esc(stage)}" class="${stage===s.stage?'active':''}"><span></span><b>${esc(stage)}</b></div>`).join('')}</div><div class="card"><h4>Gerak yang divisualisasikan</h4><p>Paper reel/chuck dan guide/tension roller berputar, lalu web terlihat benar-benar menyentuh dan membelit Main Draw / Traction Drum. Surface speed drum disinkronkan dengan gerak web; setelah web maju satu target panjang sheet, blade turun, cutting edge mencapai web, sheet dilepas, lalu blade naik kembali. Fungsi draw/traction drum adalah process-family reference dari arsitektur sheeter BW/Unico/Maxson, bukan klaim nama OEM exact HSM-CTM7. Setelah cut, sheet masuk fast tape, slow tape, overlap/shingle, landing, jogger alignment dan lift-table stacker.</p></div>`;
   on('#sim-start',startPrintingSimulation);on('#sim-pause',pausePrintingSimulation);on('#sim-stop',()=>stopPrintingSimulation({restoreExterior:true}));
   document.querySelectorAll('[data-sim-speed]').forEach(b=>b.onclick=()=>{simulationState=engine?.setPrintingSimulationSpeed(+b.dataset.simSpeed)||simulationState;updateSimulationPanel(simulationState);});
   const pathToggle=$('#sim-path');if(pathToggle)pathToggle.onchange=e=>{simulationState=engine?.setPrintingSimulationPathVisible(e.target.checked)||simulationState;updateSimulationPanel(simulationState);};
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
    document.querySelectorAll('[data-sim-speed]').forEach(b=>b.onclick=()=>{simulationState=engine?.setPrintingSimulationSpeed(+b.dataset.simSpeed)||simulationState;updateSimulationPanel(simulationState);});
    const pathToggle=$('#sim-path');if(pathToggle)pathToggle.onchange=e=>{simulationState=engine?.setPrintingSimulationPathVisible(e.target.checked)||simulationState;updateSimulationPanel(simulationState);};
    updateSimulationPanel(s);
   }else if(IS_GENERIC){
   const reason=GENERIC_CONFIG.evidence.reason;
   $('#panel-content').innerHTML=`<h3>Simulasi belum tervalidasi</h3><div class="card accent"><h4>Tidak dijalankan untuk mencegah gerakan palsu</h4><p>${esc(reason)}</p><span class="tag">${esc(GENERIC_CONFIG.evidence.grade)}</span><span class="tag">${esc(GENERIC_CONFIG.evidence.geometry)}</span></div><dl class="data-list">${pair('Status simulasi','DIBLOKIR')+pair('Komponen bergerak','0')+pair('Produk fiktif','0')+pair('Syarat aktivasi','Alur material + actuator + interlock + timing + output harus tervalidasi')}</dl><div class="card"><h4>Yang masih dapat diperiksa</h4><p>Model referensi tetap dapat diputar, difokuskan dan dibuka strukturnya, tetapi bukan representasi konfigurasi aktual BMJ sampai foto empat sisi, nameplate, manual, susunan modul dan arah proses tersedia.</p></div>`;
  }else{
  const s=engine?.getPrintingSimulationState?.()||simulationState;simulationState=s;
  $('#panel-content').innerHTML=`<h3>Simulasi Proses</h3><p class="subtle">${IS_OFFSET10?'Simulasi membuka exterior otomatis dan memperlihatkan feeder, sheet alignment, seluruh cylinder train, AirTransfer, inking, Alcolor dampening, FoilStar pada PU2, tiga coating unit, UV/drying dan X3 delivery. Jalur mekanis adalah visualisasi proses berbasis dokumen, bukan nilai timing atau setelan servis OEM.':'Simulasi menjalankan sheet travel sekaligus mekanisme utama mesin. Kertas mengikuti permukaan impression/transfer cylinder sebagai lembar fleksibel agar tidak menembus roll. Feeder dan register bergerak, gripper melakukan transfer antar-unit, cylinder/gear/roller berputar, distributor tinta berosilasi, tetesan tinta terlihat dari fountain menuju ductor, dampening bekerja, lalu UV curing, inspection dan delivery menyelesaikan alur. Nilai stroke, phase, intensitas UV dan timing adalah visualisasi proses, bukan setelan servis.'}</p><div class="card accent simulation-overview"><div class="simulation-status-row"><span id="sim-status" class="simulation-state">${s.running?'RUNNING':s.active?'PAUSED':'READY'}</span><b id="sim-stage">${esc(s.stage||'Feeder')}</b></div><div class="simulation-progress"><span id="sim-progress-bar" style="width:${Math.round((s.progress||0)*100)}%"></span></div><dl class="data-list compact">${pair('Lembar selesai',s.completed||0)+pair('Lembar bergerak',s.sheetsVisible||0)}<dt>Lembar di pile</dt><dd id="sim-pile">${s.pileSheetsVisible||0}</dd>${pair('Part mekanis aktif',s.mechanismCount||0)+pair('Gerak osilasi',s.oscillatorCount||0)+pair('Jalur tinta / dampening',s.inkFlowCount||0)+pair('Dynamic sheet brake',s.deliveryBrakeActive?'AKTIF':'STANDBY')}<dt>UV curing</dt><dd id="sim-uv-state" class="${s.uvActive?'active':''}">${s.uvActive?'AKTIF':'STANDBY'}</dd><dt>UV lamp visual</dt><dd><span id="sim-uv-count">${s.uvLampCount||0}</span> cassette</dd>${pair('Kecepatan visual',(s.speed||1)+'×')}</dl><div class="actions simulation-actions"><button id="sim-start" class="primary">${s.active?(s.running?'Running':'Lanjutkan'):'Mulai Simulasi Proses'}</button><button id="sim-pause" class="secondary">${s.running?'Pause':'Lanjut'}</button><button id="sim-stop" class="secondary">Stop & Reset</button></div></div><h4>Kecepatan visual</h4><div class="simulation-speed">${[.5,1,1.5,2].map(v=>`<button data-sim-speed="${v}" class="${Math.abs((s.speed||1)-v)<.01?'active':''}">${v}×</button>`).join('')}</div><label class="check"><input id="sim-path" type="checkbox" ${s.pathVisible!==false?'checked':''}> Tampilkan garis jalur kertas</label><label class="check"><input id="sim-ink-flow" type="checkbox" ${s.inkFlowVisible!==false?'checked':''}> Tampilkan aliran tinta & dampening</label><h4>Sistem tinta</h4><div class="simulation-ink-flow">${INK_SIMULATION_SEQUENCE.map((step,index)=>`<div><span>${index+1}</span><b>${esc(step)}</b></div>`).join('')}</div><p class="subtle">Tetesan memanjang menunjukkan cucuran tinta dari fountain menuju ductor/vibrator; jalur tipis berikutnya menunjukkan transfer film tinta antar-roller. Warna unit pada simulasi hanya pembeda visual, bukan urutan warna job aktual.</p><div class="simulation-uv-card"><span id="sim-uv-indicator" aria-hidden="true"></span><div><b>UV Curing System</b><small>Beam menyala otomatis saat sheet berada di bawah cassette dryer.</small></div></div><h4>Alur proses mesin</h4><div class="simulation-flow">${PRINTING_SIMULATION_STAGES.map(stage=>`<div data-sim-stage="${esc(stage)}" class="${stage===s.stage?'active':''}"><span></span><b>${esc(stage)}</b></div>`).join('')}</div><div class="card"><h4>Gerak yang disimulasikan</h4><p>Feeder, register, cylinder train, gripper/transfer, inking, dampening, coating, UV/dryer dan delivery bergerak bersama. Pada Offset 10, FoilStar PU2 dan tiga coating unit ikut divisualisasikan sesuai konfigurasi dokumen. Aliran tinta divisualkan sebagai cucuran fountain → ductor, lalu film menuju roller/distributor → form rollers → plate → blanket → sheet; dampening divisualkan terpisah dari pan/roller ke plate. UV beam aktif hanya ketika sheet melewati dryer. Saat mencapai delivery, gripper melepaskan sheet tepat di atas main pile dan lembar tetap terlihat menumpuk di atas stack yang sudah ada.</p></div>`;
  on('#sim-start',startPrintingSimulation);on('#sim-pause',pausePrintingSimulation);on('#sim-stop',()=>stopPrintingSimulation({restoreExterior:true}));
  document.querySelectorAll('[data-sim-speed]').forEach(b=>b.onclick=()=>{simulationState=engine?.setPrintingSimulationSpeed(+b.dataset.simSpeed)||simulationState;updateSimulationPanel(simulationState);});
  const pathToggle=$('#sim-path');if(pathToggle)pathToggle.onchange=e=>{simulationState=engine?.setPrintingSimulationPathVisible(e.target.checked)||simulationState;updateSimulationPanel(simulationState);};
  const inkToggle=$('#sim-ink-flow');if(inkToggle)inkToggle.onchange=e=>{simulationState=engine?.setPrintingSimulationInkFlowVisible(e.target.checked)||simulationState;updateSimulationPanel(simulationState);};
  updateSimulationPanel(s);

  }
 }else if(tab==='data'){
   const meta=TAXONOMY_BY_ID.get(selectedTaxonomyId)||TAXONOMY_BY_ID.get(ACTIVE_ROOT);
   const m=IS_GENERIC?GENERIC_CONFIG.machine:null;
   const placement=placementForMachine?.('BMJ-MCH-0003')||null,truth=assetTruth(a,{placement,sourceCount:TECHNICAL_SOURCES.length});
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
  $('#panel-content').innerHTML=`<h3>Buka Interior</h3><p class="subtle">Mode ini membuka cover/panel luar agar <b>seluruh interior mesin terlihat</b>. Rangka utama, frame, support, support bridge, tangga, landing, dan struktur penyangga tetap ditampilkan.</p><div class="card accent exterior-overview"><h4>${exteriorMode?'Interior terbuka · interior terlihat':'Interior tertutup · tampilan normal'}</h4><p>${exteriorMode?'Cover luar sedang disembunyikan dan detail interior dipaksa tampil penuh. Pilih area di bawah hanya untuk memusatkan kamera; area lain tetap tersedia.':'Tekan Buka Semua Cover untuk melihat cylinder, roller, gripper, drive, dampening, inking, transfer, dan detail internal lain yang sudah dimodelkan.'}</p><div class="actions"><button id="exterior-open" class="primary">Buka Semua Cover</button><button id="exterior-close" class="secondary">Tutup Interior</button></div></div><h4>Fokus area saat interior terbuka</h4><div class="exterior-area-list">${exteriorAreas().map(area=>`<button data-exterior-area="${esc(area.key)}" class="exterior-area-button ${exteriorFocusKey===area.key?'active':''}"><span><b>${esc(area.name)}</b><small>Interior + frame/support</small></span><span>Fokus ›</span></button>`).join('')}</div><p class="subtle">Mode ini hanya mengubah visibilitas cover dan level detail. Dimensi, posisi, serta geometri frame/support tidak diubah.</p>`;
  on('#exterior-open',showExteriorAll);on('#exterior-close',resetExteriorView);
  document.querySelectorAll('[data-exterior-area]').forEach(b=>b.onclick=()=>focusExteriorArea(b.dataset.exteriorArea));
 }else{
   renderReferencePanel();
 }
}
function renderStatus(){
 const l=activeLayout(),machineCount=$('#machine-count'),truth=layoutTruth(l),placement=placementForMachine?.('BMJ-MCH-0003')||null,assetStatus=assetTruth(state?.asset,{placement,sourceCount:TECHNICAL_SOURCES.length});
 if(machineCount)machineCount.textContent=MACHINE_REGISTRY_STATS.total.toLocaleString('id-ID');
 $('#layout-status').textContent=l?`DWG · ${truth.planGeometry}`:'DWG · UNKNOWN';
 $('#scale-status').textContent=`Skala · ${truth.scale}`;
 $('#lod-status').textContent=engine?.view==='factory'?`Elevasi · ${truth.elevation}`:`3D · ${assetStatus.source3D}`;
 $('#edit-position').disabled=false;
 $('#edit-position').setAttribute('aria-disabled',String(role!=='admin'||!state.layout));
 $('#edit-position').title=role!=='admin'?'Atur posisi tersedia untuk pengguna dengan izin pengaturan':!state.layout?'Sambungkan data terlebih dahulu untuk menyimpan posisi':'Atur posisi mesin';
}
async function request(path,{method='GET',data,base=apiBase,key=token}={}){
 if(!base)throw new Error('Layanan data belum disambungkan.');
 const headers={Authorization:'Bearer '+key};if(data!==undefined)headers['Content-Type']='application/json';if(method!=='GET')headers['If-Match']=String(state.revision);
 const res=await fetch(base+path,{method,headers,body:data===undefined?undefined:JSON.stringify(data),signal:AbortSignal.timeout(15000)});let result;try{result=await res.json();}catch{throw new Error('Layanan data mengirim respons yang tidak dikenali.');}if(!res.ok)throw new Error(result.error||'Layanan data tidak dapat merespons.');return result;
}
class CacheManager {
 async open(){return new Promise((resolve,reject)=>{const r=indexedDB.open('offset5-twin-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('data');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
 async get(key){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction('data'),r=tx.objectStore('data').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);tx.oncomplete=()=>db.close();});}
 async set(key,value){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction('data','readwrite');tx.objectStore('data').put(value,key);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);});}
 async clear(){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction('data','readwrite');tx.objectStore('data').clear();tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);});}
}
const cache=new CacheManager();
let cacheEnabled=false;try{cacheEnabled=localStorage.getItem('offset5-cache-enabled')==='1';}catch{}
function updateConnectionTruth(){
 const label=connectionTruth({online:navigator.onLine,cached:cachedDataActive,connected:Boolean(role)});
 const el=$('#connection');if(el)el.textContent=label;return label;
}
async function acceptState(next){state=next;engine?.loadLayout(activeLayout());if(engine?.view==='factory')engine.setView('factory',state);renderStatus();renderPanel();if(cacheEnabled){try{await cache.set(apiBase,{state,savedAt:new Date().toISOString()});}catch{toast('Data berhasil dimuat, tetapi salinan di perangkat tidak dapat disimpan.',true);}}}
function setView(view){
 const l=activeLayout();
 if(view==='factory'&&!l){layoutDialog();return;}
 if(view==='factory'&&engine?.isPrintingSimulationActive()){engine.stopPrintingSimulation();simulationState=engine.getPrintingSimulationState();simulationOwnsExterior=false;}if(view==='factory'&&exteriorMode)exitExteriorMode();editing=false;if(engine)engine.onTransform=null;explode=0;selectedPart=null;engine?.setView(view,state);
 $$('.rail>button').forEach(b=>b.classList.remove('active'));
 $('#nav-machine')?.classList.add('active');
 const machineName=IS_OFFSET10?'OFFSET 10':IS_APM2?'APM 2':IS_SHEETING?'SHEETING LEXUS':IS_GENERIC?GENERIC_CONFIG.machine.name:'OFFSET 5';
 const machineSubtitle=IS_OFFSET10?'Heidelberg Speedmaster · CX 104 · Full UV + FoilStar':IS_APM2?'BOBST · SP 102 · 1994 · Automatic Flatbed Die Cutter':IS_SHEETING?'LEXUS · HSM-CTM7 · SBM-2 · RIGHT → LEFT':IS_GENERIC?(GENERIC_CONFIG.label+' · '+(GENERIC_CONFIG.machine.model||'Model belum tersedia')):'OFU-1 · Heidelberg Speedmaster · CD 102-8+L';
 $('#view-kicker').textContent=view==='factory'?'PABRIK · 3D':'TAMPILAN MESIN 3D';
 $('#view-title').textContent=view==='factory'?'Pabrik Packaging Offset':machineName;
 $('#view-subtitle').textContent=view==='factory'?'Posisi mesin dan area produksi':machineSubtitle;
 const viewLayoutTruth=layoutTruth(l),viewAssetTruth=assetTruth(state?.asset,{placement:placementForMachine?.('BMJ-MCH-0003')||null,sourceCount:TECHNICAL_SOURCES.length});
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
 if(historyMode==='push')pushContextHistory({asset:null,node:null,scene:'factory',view:window.BMJAppState?.getState?.().viewMode||'3d',camera:'iso'});
 qStaticFallbackClear();engine?.clearFactorySelection();setView('factory');engine?.fit(engine.factory,'iso');
 document.title='Packaging Offset Factory Digital Twin';
 document.body.classList.add('panel-hidden');document.body.classList.remove('mobile-panel-open');
 $$('.rail>button').forEach(b=>b.classList.remove('active'));
 $('#nav-machine')?.classList.add('active');
 $('#view-kicker').textContent='PABRIK · DIGITAL TWIN';
 $('#view-title').textContent='Packaging Offset Factory';
 $('#view-subtitle').textContent='Bangunan, area, mesin, dan utilitas dalam satu konteks';
 $('#geometry-caption').textContent='Pabrik · Seluruh Area';
 $('#scene-hint').textContent='Klik aset untuk memilih · seret untuk memutar · zoom dengan cubit/scroll';
 selectedTaxonomyId=ACTIVE_ROOT;selectedPart=null;activeTab='overview';engine?.template?.reset?.();engine?.clearPartLabels?.();if(engine)engine.isolated=false;
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
  const params=new URLSearchParams(location.search);params.set('view','2d');
  history.replaceState(history.state,'',location.pathname+'?'+params.toString()+location.hash);
  emitDomainState({viewMode:'2d'});
 }
}
function connectionDialog(){
 modal('Sambungkan Data',`<p>Gunakan bagian ini jika Anda memiliki akses ke data tersimpan bersama. Untuk sekadar mencoba tampilan 3D, mode lokal sudah dapat digunakan.</p><form id="connection-form"><label for="api-base">Alamat layanan data</label><input id="api-base" type="url" value="${esc(apiBase)}" placeholder="https://alamat-layanan-data" required><label for="api-token">Kunci akses</label><input id="api-token" type="password" autocomplete="off" required><label class="check"><input id="enable-cache" type="checkbox" ${cacheEnabled?'checked':''}> Simpan salinan data di perangkat ini</label><p class="subtle">Gunakan pada perangkat pribadi jika ingin membuka data lebih cepat saat koneksi tidak stabil.</p><div class="actions"><button type="submit" class="primary">Sambungkan</button><button type="button" id="disconnect" class="secondary">Gunakan Mode Lokal</button></div><p id="connection-error" class="inline-error" role="alert"></p></form>`);
 $('#connection-form').onsubmit=async e=>{e.preventDefault();const submit=e.target.querySelector('[type=submit]');submit.disabled=true;try{const url=new URL($('#api-base').value.trim());if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(url.hostname))throw new Error('Alamat layanan harus menggunakan koneksi aman.');if(url.username||url.password||url.search||url.hash||url.pathname!=='/')throw new Error('Masukkan alamat utama layanan data.');const base=url.origin,key=$('#api-token').value,session=await request('/api/session',{base,key});const next=await request('/api/state',{base,key});apiBase=base;token=key;role=session.role;cacheEnabled=$('#enable-cache').checked;localStorage.setItem('offset5-api-base',base);localStorage.setItem('offset5-cache-enabled',cacheEnabled?'1':'0');if(!cacheEnabled)await cache.clear();await acceptState(next);cachedDataActive=false;updateConnectionTruth();closeModal();toast('Data berhasil disambungkan.');}catch(err){$('#connection-error').textContent=err.message;}finally{submit.disabled=false;}};
 on('#disconnect',async()=>{token='';role=null;await cache.clear();cacheEnabled=false;cachedDataActive=false;localStorage.removeItem('offset5-cache-enabled');state=structuredClone(initialState);engine?.loadLayout(bundledLayout);setView('machine');renderStatus();updateConnectionTruth();closeModal();toast('Mode lokal aktif.');});
}
function layoutDialog(){
 const l=activeLayout();
 const adminTools=role==='admin'?`<h3>Pengaturan denah</h3><p class="subtle">Gunakan hanya jika Anda perlu mengganti atau menyimpan penyesuaian posisi.</p><label for="layout-file">Pilih file pengaturan denah</label><input id="layout-file" type="file" accept=".json,application/json"><div class="actions"><button id="mapping" class="secondary">Atur Denah</button></div><p id="layout-error" class="inline-error" role="alert"></p>`:'';
 const truth=layoutTruth(l),offset5Placement=placementForMachine?.('BMJ-MCH-0003')||null,fidelity=l?(l.dwgFidelity||buildDwgFidelityLedger(l)):null;
 const counts=fidelity?.semantic3DCounts||{},transform=fidelity?.transform||{},unimplemented=fidelity?.unimplemented||[];
 const fidelityHtml=fidelity?`<details class="dwg-fidelity-ledger"><summary>Fidelity DWG <strong>${esc(fidelity.preservation)}</strong></summary><div class="dwg-fidelity-body"><p>Ledger ini membedakan source CAD yang dipertahankan dari geometry yang sudah dipromosikan ke 3D. Raw entity parity tidak diklaim bila extractor hanya menyediakan data yang sudah dinormalisasi.</p><dl class="system-info-grid">${pair('Source entity',fidelity.sourceEntityCount??'UNKNOWN')+pair('Source layer',fidelity.sourceLayerCount??'UNKNOWN')+pair('Source block',fidelity.sourceBlockCount??'UNKNOWN')+pair('Reference segment',fidelity.referenceSegmentCount)+pair('Floor 3D',counts.floor??0)+pair('Wall 3D',counts.walls??0)+pair('Column 3D',counts.columns??0)+pair('Door 3D',counts.doors??0)+pair('Opening / curtain',counts.openings??0)+pair('Label source',counts.labels??0)+pair('Axis mapping',transform.axisMap||'UNKNOWN')+pair('Scale factor',transform.scale??'UNKNOWN')+pair('Rotation',transform.rotation??'UNKNOWN')+pair('Origin X / Y',`${transform.originX??'UNKNOWN'} / ${transform.originY??'UNKNOWN'}`)}</dl><div class="dwg-unimplemented"><h4>Belum diimplementasikan sebagai 3D fisik</h4>${unimplemented.map(item=>`<div class="dwg-unimplemented-row"><strong>${esc(item.entityType)}</strong><span>${esc(item.semanticType)} · ${esc(item.threeDStatus)}</span><small>${esc(item.reason)}</small></div>`).join('')}</div></div></details>`:'';
 modal('Denah Pabrik',`<div class="card accent"><h4>${l?'DWG berhasil dimuat':'DWG belum tersedia'}</h4><p>${l?'Geometri plan, skala, elevasi, posisi, dan cakupan ekstraksi memiliki status verifikasi terpisah.':'Belum ada sumber DWG yang dapat ditampilkan.'}</p></div>${l?`<dl class="data-list">${pair('Source',truth.source)+pair('Nama sumber',truth.sourceFile)+pair('Plan geometry',truth.planGeometry)+pair('Source units',truth.sourceUnits)+pair('Scale',truth.scale)+pair('Elevation',truth.elevation)+pair('Posisi OFFSET 5',positionVerification(offset5Placement))+pair('Area yang dikenali',Array.isArray(l.functionalZones)?l.functionalZones.length+' area':'UNKNOWN')}</dl>${fidelityHtml}<div class="actions"><button id="view-layout" class="primary">Buka Denah</button></div>`:''}${adminTools}`);
 if(l)on('#view-layout',()=>{closeModal();setView('factory');});
 if(role==='admin')on('#mapping',mappingDialog);
 const input=$('#layout-file');
 if(input)input.onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>4*1024*1024)throw new Error('Ukuran file terlalu besar.');const layout=validateLayout(JSON.parse(await f.text()));const next=await request('/api/layout',{method:'PUT',data:layout});await acceptState(next);closeModal();setView('factory');toast('Denah berhasil diperbarui.');}catch(err){$('#layout-error').textContent=err.message;}};
}
function foundationStatusDialog(){
 const l=activeLayout(),layoutStatus=layoutTruth(l),fidelity=l?(l.dwgFidelity||buildDwgFidelityLedger(l)):buildDwgFidelityLedger(null);
 const placement=placementForMachine?.(FOUNDATION_SCOPE.primaryMachineId)||null,assetStatus=assetTruth(state?.asset,{placement,sourceCount:TECHNICAL_SOURCES.length});
 const placements=Array.isArray(l?.placements)?l.placements:[],mapped=placements.filter(p=>p.status!=='UNIDENTIFIED'),unidentified=placements.filter(p=>p.status==='UNIDENTIFIED');
 const placeholders=mapped.filter(p=>p.machineId!==FOUNDATION_SCOPE.primaryMachineId);
 const connection=connectionTruth({online:navigator.onLine,cached:cachedDataActive,connected:Boolean(role)});
 const unimplemented=fidelity?.unimplemented||[],reviewCount=unimplemented.reduce((sum,item)=>sum+(Number.isFinite(item.count)?item.count:0),0);
 modal('Status Fondasi',`<div class="card accent"><h4>Phase 1 · DWG + OFFSET 5</h4><p>Status ini dihitung dari sumber layout, ledger fidelity, metadata aset, dan kondisi koneksi saat ini. Nilai yang belum didukung sumber tetap ditampilkan sebagai UNKNOWN, UNVERIFIED, APPROXIMATE, atau CONFLICTING.</p></div><h3>DWG / Pabrik</h3><dl class="data-list">${pair('Source',layoutStatus.source)+pair('Nama sumber',layoutStatus.sourceFile)+pair('Plan geometry',layoutStatus.planGeometry)+pair('Source units',layoutStatus.sourceUnits)+pair('Scale',layoutStatus.scale)+pair('Elevation',layoutStatus.elevation)+pair('Fidelity',fidelity?.preservation||'UNKNOWN')+pair('Elemen belum 3D',unimplemented.length?`${unimplemented.length} kelas · ${reviewCount||'jumlah parsial'}`:'Tidak ada yang tercatat')}</dl><h3>OFFSET 5</h3><dl class="data-list">${pair('Asset',state?.asset?.description||'OFFSET 5')+pair('Model',state?.asset?.model)+pair('Posisi',assetStatus.position)+pair('3D source',assetStatus.source3D)+pair('3D detail',assetStatus.detail3D)+pair('Data confidence',assetStatus.dataConfidence)+pair('Status operasi',assetStatus.operatingStatus)+pair('Health score',assetStatus.healthScore)+pair('Source count',assetStatus.sourceCount?assetStatus.sourceCount+' sumber':'UNKNOWN')}</dl><h3>Scope & Koneksi</h3><dl class="data-list">${pair('Aset 3D teknis','1 · OFFSET 5')+pair('Placeholder terpetakan',placeholders.length)+pair('Posisi belum teridentifikasi',unidentified.length)+pair('Koneksi data',connection)+pair('Cache lokal',cacheEnabled?(cachedDataActive?'Aktif · sedang memakai cache':'Aktif'):'Tidak aktif')}</dl><div class="actions"><button id="status-open-layout" class="primary">Fidelity DWG</button><button id="status-open-offset5" class="secondary">Detail OFFSET 5</button></div>`);
 on('#status-open-layout',()=>{closeModal();layoutDialog();});
 on('#status-open-offset5',()=>{closeModal();setView('machine');showPanel();renderPanel('overview');engine?.fit(engine.machine);});
}
addEventListener('bmj:foundationstatusrequest',foundationStatusDialog);
function download(name,data){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function mappingDialog(){
 const l=state.layout;
 if(role!=='admin'){toast('Pengaturan denah memerlukan izin pengaturan.',true);return;}
 if(!l){toast('Sambungkan data dan simpan denah terlebih dahulu.',true);return;}
 const layers=[...new Set(l.entities.map(e=>e.layer))];
 const semantics=[['UNKNOWN','Belum dipilih'],['FLOOR','Lantai'],['BOUNDARY','Batas Area'],['WALL','Dinding'],['COLUMN','Kolom'],['DOOR','Pintu'],['OPENING','Bukaan'],['CORRIDOR','Jalur'],['AREA','Area'],['FOOTPRINT','Posisi Mesin'],['LABEL','Label'],['DIMENSION','Ukuran'],['STAIRS','Tangga'],['RAMP','Ramp']];
 modal('Atur Denah',`<p>Pilih jenis informasi untuk setiap lapisan, lalu sesuaikan posisi dan ukuran bila diperlukan.</p><form id="mapping-form">${layers.map((layer,i)=>`<div class="layer-row"><span>${esc(layer)}</span><select aria-label="Jenis ${esc(layer)}" data-layer="${i}">${semantics.map(([value,label])=>`<option value="${value}" ${(l.layerMapping?.[layer]||'UNKNOWN')===value?'selected':''}>${label}</option>`).join('')}</select></div>`).join('')}<h3>Posisi denah</h3><label for="units">Satuan</label><select id="units">${['UNKNOWN','mm','cm','m','inch','foot'].map(u=>`<option ${l.transform.sourceUnits===u?'selected':''}>${u}</option>`).join('')}</select><div class="form-row"><div><label for="origin-x">Titik acuan X</label><input id="origin-x" type="number" step="any" value="${l.transform.originX}" required></div><div><label for="origin-y">Titik acuan Y</label><input id="origin-y" type="number" step="any" value="${l.transform.originY}" required></div><div><label for="map-rotation">Rotasi (°)</label><input id="map-rotation" type="number" step="any" value="${l.transform.rotation}" required></div></div><h3>Kalibrasi ukuran</h3><div class="form-row"><div><label for="ref-source">Jarak pada denah</label><input id="ref-source" type="number" min="0.000001" step="any"></div><div><label for="ref-real">Jarak sebenarnya (m)</label><input id="ref-real" type="number" min="0.000001" step="any"></div></div><label for="ref-note">Catatan acuan</label><input id="ref-note"><div class="actions"><button type="submit" class="primary">Simpan</button></div><p id="mapping-error" class="inline-error" role="alert"></p></form>`);
 $('#mapping-form').onsubmit=async e=>{e.preventDefault();try{const next=structuredClone(l);next.layerMapping={};$$('[data-layer]').forEach(sel=>next.layerMapping[layers[+sel.dataset.layer]]=sel.value);const u=$('#units').value,scales={mm:.001,cm:.01,m:1,inch:.0254,foot:.3048};next.transform={sourceUnits:u,originX:+$('#origin-x').value,originY:+$('#origin-y').value,rotation:+$('#map-rotation').value,scale:scales[u]??null};if(u==='UNKNOWN'&&($('#ref-source').value||$('#ref-real').value)){const sourceDistance=+$('#ref-source').value,knownDistance=+$('#ref-real').value,note=$('#ref-note').value.trim();if(!(sourceDistance>0&&knownDistance>0&&note))throw new Error('Lengkapi kedua jarak dan catatan acuan.');next.transform.scale=knownDistance/sourceDistance;next.transform.calibration={sourceDistance,knownDistance,note};}validateLayout(next);await acceptState(await request('/api/layout',{method:'PUT',data:next}));closeModal();setView('factory');toast('Pengaturan denah disimpan.');}catch(err){$('#mapping-error').textContent=err.message;}};
}
function editorPanel(){
 if(!engine){toast('Tampilan 3D belum tersedia.',true);return;}
 if(role!=='admin'){toast('Atur posisi memerlukan izin pengaturan.',true);return;}
 if(!state.layout){toast('Sambungkan data dan simpan denah terlebih dahulu.',true);return;}
 setView('factory');showPanel();editing=true;engine.gizmo.setMode('translate');engine.gizmo.showX=true;engine.gizmo.showY=true;engine.gizmo.showZ=true;engine.edit(true);
 const sourcePlacement=placementForMachine?.(FOUNDATION_SCOPE.primaryMachineId)||null,sourcePosition=positionVerification(sourcePlacement);
 $('#panel-content').innerHTML=`<h3>Atur posisi mesin</h3><div class="card accent"><h4>Status sumber posisi: ${esc(sourcePosition)}</h4><p>DWG-VERIFIED hanya berasal dari geometri atau anchor sumber. Perubahan manual disimpan sebagai USER-CONFIRMED atau APPROXIMATE dan tidak mengubah status sumber DWG.</p></div><div class="edit-strip">${['translate','rotate','scale'].map((m,i)=>`<button data-gizmo="${m}" class="${i?'':'active'}">${['Geser','Putar','Skala'][i]}</button>`).join('')}</div><p class="subtle">Seret kontrol pada mesin atau isi angka untuk menyesuaikan posisi.</p><form id="position-form"><div class="form-row">${['x','y','z'].map(k=>`<div><label for="pos-${k}">Posisi THREE ${k.toUpperCase()}</label><input id="pos-${k}" type="number" step="any" required></div>`).join('')}</div><div class="form-row"><div><label for="pos-rotation">Rotasi (°)</label><input id="pos-rotation" type="number" step="any" required></div><div><label for="pos-scale">Skala tampilan</label><input id="pos-scale" type="number" min="0.00001" step="any" required></div></div><label class="check"><input id="snap" type="checkbox"> Gunakan langkah posisi tetap</label><p class="code" id="cad-coordinates"></p><p class="code" id="three-coordinates"></p><label for="position-confidence">Status perubahan manual</label><select id="position-confidence"><option value="APPROXIMATE">APPROXIMATE</option><option value="USER-CONFIRMED">USER-CONFIRMED</option></select><div class="actions"><button type="submit" class="primary">Simpan Posisi</button><button type="button" id="cancel-position" class="secondary">Batal</button><button type="button" id="reset-position" class="secondary">Kembalikan</button></div><p id="position-error" class="inline-error" role="alert"></p></form>`;
 const sync=()=>{for(const k of ['x','y','z'])$('#pos-'+k).value=engine.machine.position[k].toFixed(4);$('#pos-rotation').value=(engine.machine.rotation.y*180/Math.PI).toFixed(3);$('#pos-scale').value=engine.machine.scale.x.toFixed(4);const pos=worldToCad(engine.machine.position.x,engine.machine.position.z,state.layout.transform);$('#cad-coordinates').textContent=`DWG: X ${number(pos.x)} · Y ${number(pos.y)}`;$('#three-coordinates').textContent=`THREE: X ${number(engine.machine.position.x)} · Y ${number(engine.machine.position.y)} · Z ${number(engine.machine.position.z)}`;};
 engine.onTransform=sync;sync();
 $$('[data-gizmo]').forEach(b=>b.onclick=()=>{engine.gizmo.setMode(b.dataset.gizmo);engine.gizmo.showX=b.dataset.gizmo!=='rotate';engine.gizmo.showY=b.dataset.gizmo!=='scale';engine.gizmo.showZ=b.dataset.gizmo==='translate';$$('[data-gizmo]').forEach(c=>c.classList.toggle('active',b===c));});
 $('#snap').onchange=e=>{engine.gizmo.setTranslationSnap(e.target.checked?1:null);engine.gizmo.setRotationSnap(e.target.checked?Math.PI/12:null);engine.gizmo.setScaleSnap(e.target.checked?.1:null);};
 $$('[id^="pos-"]').forEach(el=>el.onchange=()=>{const vals=['x','y','z','rotation','scale'].map(k=>+$('#pos-'+k).value);if(vals.every(Number.isFinite)&&vals[4]>0){engine.machine.position.set(...vals.slice(0,3));engine.machine.rotation.set(0,vals[3]*Math.PI/180,0);engine.machine.scale.setScalar(vals[4]);sync();}});
 const end=()=>{engine.edit(false);engine.onTransform=null;editing=false;engine.applyPlacement(state);renderPanel();};
 on('#cancel-position',end);
 on('#reset-position',async()=>{await acceptState(await request('/api/position',{method:'DELETE'}));end();toast('Posisi dikembalikan.');});
 $('#position-form').onsubmit=async e=>{e.preventDefault();try{const p=Object.fromEntries(['x','y','z','rotation','scale'].map(k=>[k,+$('#pos-'+k).value]));p.confidence=$('#position-confidence').value;validatePosition(p);await acceptState(await request('/api/position',{method:'PUT',data:p}));end();toast('Posisi berhasil disimpan.');}catch(err){$('#position-error').textContent=err.message;}};
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
function currentViewMode(){return window.BMJAppState?.getState?.().viewMode==='2d'?'2d':'3d';}
function pushContextHistory({asset=null,node=null,scene='factory',view=currentViewMode(),camera='iso'}={}){
 const url=new URL(location.href);url.searchParams.delete('machine');
 if(asset)url.searchParams.set('asset',asset);else url.searchParams.delete('asset');
 if(node)url.searchParams.set('node',node);else url.searchParams.delete('node');
 if(scene==='machine')url.searchParams.set('scene','machine');else if(asset)url.searchParams.set('scene','factory');else url.searchParams.delete('scene');
 url.searchParams.set('view',view==='2d'?'2d':'3d');
 if(camera==='top')url.searchParams.set('camera','top');else url.searchParams.delete('camera');
 const next=url.pathname+url.search+url.hash,current=location.pathname+location.search+location.hash;
 const snapshot={asset:asset||null,node:node||null,scene:scene==='machine'?'machine':'factory',view:view==='2d'?'2d':'3d',camera:camera==='top'?'top':'iso'};
 if(next===current){history.replaceState(snapshot,'',url);return false;}
 history.pushState(snapshot,'',url);return true;
}
function resetMachineInspectionContext(){
 if(engine?.isPrintingSimulationActive?.()){engine.stopPrintingSimulation();simulationState=engine.getPrintingSimulationState?.()||simulationState;}
 if(exteriorMode)exitExteriorMode();
 if(engine){engine.template?.reset?.();engine.clearPartLabels?.();engine.isolated=false;}
 selectedPart=null;selectedTaxonomyId=ACTIVE_ROOT;explode=0;exteriorFocusKey=null;simulationOwnsExterior=false;activeTab='overview';
 $('#tool-explode')?.classList.remove('active');$('#tool-isolate')?.classList.remove('active');$('#tool-interior')?.classList.remove('active');$('#tool-simulation')?.classList.remove('active');
}
function applyRestoredCamera(preset='iso'){
 if(!engine)return;const mode=preset==='top'?'top':'iso',target=engine.view==='factory'?(engine.currentFactoryTarget?.()||engine.factory):(selectedPart||engine.machine);
 if(target)engine.fit(target,mode);
 $('[data-camera]').forEach(button=>button.classList.toggle('active',button.dataset.camera===mode));
}
function selectFactoryAssetContext(machine,{historyMode='none',openDialog=false,focus=true}={}){
 if(!machine)return false;
 if(historyMode==='push')pushContextHistory({asset:machine.machineId,node:null,scene:'factory',view:'3d',camera:'iso'});
 if(engine?.view!=='factory')setView('factory');
 if(focus)engine?.focusFactoryAsset(machine.machineId);else engine?.selectFactoryAsset(machine.machineId);
 const policy=foundationAssetPolicy(machine,placementForMachine(machine.machineId));
 $('#geometry-caption').textContent='Pabrik · '+machine.name;
 $('#scene-hint').textContent=policy.canOpenTechnical3D?'Aset teknis utama dipilih · buka detail untuk masuk ke model OFFSET 5':'Placeholder tata letak dipilih · detail teknis tetap dikunci pada fase fondasi';
 emitDomainState({selectedAsset:machine.machineId,selectedArea:machine.area||null,selectedNode:null,activeReference:null,activeSection:'asset',sceneMode:'factory',cameraPreset:'iso'});
 if(openDialog)machineDetailDialog(machine);
 return true;
}
function focusFoundationPlaceholder(machine,{historyMode='push',openDialog=false}={}){
 return selectFactoryAssetContext(machine,{historyMode,openDialog,focus:true});
}
function machineDetailDialog(machine){
 const placement=placementForMachine(machine.machineId),policy=foundationAssetPolicy(machine,placement),primary=policy.canOpenTechnical3D;
 const status=primary?'Aset 3D teknis utama':'Placeholder tata letak';
 const copy=primary?'OFFSET 5 adalah aset teknis utama pada fase fondasi. Struktur, detail 3D, sumber, dan simulasi dibuka dari satu konteks yang tervalidasi.':'Aset ini dipertahankan hanya sebagai konteks spasial dari denah. Metadata teknis inventori tidak ditampilkan pada fase fondasi agar placeholder tidak terlihat seperti aset yang sudah divalidasi.';
 const truth=primary?assetTruth(state?.asset,{placement,sourceCount:TECHNICAL_SOURCES.length}):null;
 const primaryData=primary?pair('Machine ID',machine.machineId)+pair('Area',machine.area)+pair('Model',machine.model)+pair('Serial Number',machine.serial)+pair('SAP Functional Location',machine.functionalLocation)+pair('SAP Code',machine.sapCode)+pair('Tahun',machine.year)+pair('3D source',truth.source3D)+pair('3D detail',truth.detail3D)+pair('Data confidence',truth.dataConfidence)+pair('Posisi',truth.position)+pair('Dasar posisi',positionStatusLabel(policy.positionStatus))+pair('Sumber identitas',machine.source==='USER_CONFIRMED'?'Konfirmasi pengguna':'Registry mesin'):'';
 const placeholderData=pair('ID posisi',machine.machineId)+pair('Area',machine.area)+pair('3D source','NOT_IMPLEMENTED · LAYOUT PLACEHOLDER')+pair('3D detail','NOT_IMPLEMENTED')+pair('Posisi',positionVerification(placement))+pair('Dasar posisi',positionStatusLabel(policy.positionStatus))+pair('Status detail','Belum dibuka pada fase fondasi');
 closeModal();showPanel();activeTab='overview';
 $('#panel-content').innerHTML=`<h3>${esc(machine.name)}</h3><div class="card accent"><h4>${esc(status)}</h4><p>${esc(copy)}</p></div><dl class="data-list">${primary?primaryData:placeholderData}</dl>${primary&&machine.note?`<div class="card"><h4>Catatan sumber</h4><p>${esc(machine.note)}</p></div>`:''}<div class="actions"><button id="${primary?'open-machine-3d':'focus-layout-asset'}" class="primary">${primary?'Buka Model 3D':'Pusatkan di Pabrik'}</button><button id="factory-inspector-back" class="secondary">Kembali ke Pabrik</button></div>`;
 emitDomainState({selectedAsset:machine.machineId,selectedArea:machine.area||null,selectedNode:null,activeReference:null,activeSection:'asset',sceneMode:'factory',cameraPreset:'iso',inspectorState:{open:true,tab:'overview'}});
 renderContextBreadcrumb();
 if(primary)on('#open-machine-3d',()=>switchActiveMachine(FOUNDATION_SCOPE.primaryRoute));
 else on('#focus-layout-asset',()=>selectFactoryAssetContext(machine,{historyMode:'none',openDialog:false,focus:true}));
 on('#factory-inspector-back',()=>showHome({historyMode:'push'}));
 return true;
}
async function switchActiveMachine(route,{historyMode='push'}={}){
 if(!canOpenTechnical3D(route)){
  const record=machineRecordForRoute(route);
  if(record){focusFoundationPlaceholder(record,{historyMode,openDialog:true});return false;}
  toast('Aset belum memiliki konteks tata letak yang dapat dibuka.',true);return false;
 }
 const normalizedRoute=normalizeMachineKey(route||FOUNDATION_SCOPE.primaryRoute);
 if(historyMode==='push')pushContextHistory({asset:FOUNDATION_SCOPE.primaryRoute,node:null,scene:'machine',view:'3d',camera:'iso'});
 closeModal();resetMachineInspectionContext();
 if(normalizedRoute===MACHINE_KEY){
  setView('machine');showPanel();renderPanel('overview');engine?.fit(engine.machine,'iso');$('#engine-status').textContent='OFFSET 5 · model 3D siap';
  emitDomainState({selectedAsset:FOUNDATION_SCOPE.primaryRoute,selectedNode:null,activeReference:null,activeSection:'asset',sceneMode:'machine',cameraPreset:'iso',inspectorState:{open:true,tab:'overview'}});return true;
 }
 document.body.classList.add('scene-switching');
 const boot=$('#boot');if(boot){boot.hidden=false;boot.innerHTML='<strong>Menyiapkan OFFSET 5…</strong><p>Memuat model 3D teknis dan struktur terverifikasi.</p>';}
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 try{
  configureActiveMachine(normalizedRoute);applyActiveMachineState();selectedTaxonomyId=ACTIVE_ROOT;
  applyMachineShell();
  if(engine){engine.switchMachine(MACHINE_KEY);engine.onTaxonomySelect=id=>selectTaxonomy(id,{revealPanel:false});engine.onSimulationUpdate=next=>{simulationState=next;updateSimulationPanel(next);};engine.onReset=()=>{explode=0;selectedPart=null;selectedTaxonomyId=ACTIVE_ROOT;renderPanel();};engine.onError=message=>toast(message,true);if(bundledLayout)engine.loadLayout(bundledLayout);engine.setView('machine',state);}
  else{qStaticFallbackClear();renderStaticMachineFallback(new Error('3D renderer unavailable'));}
  const taxCount=$('#taxonomy-count');if(taxCount)taxCount.textContent=taxonomyStats().total.toLocaleString('id-ID');
  renderStatus();redrawPlantPlan();showPanel();renderPanel('overview');engine?.fit(engine.machine,'iso');$('#engine-status').textContent='OFFSET 5 · model 3D siap';emitDomainState({selectedAsset:FOUNDATION_SCOPE.primaryRoute,selectedNode:null,activeReference:null,activeSection:'asset',sceneMode:'machine',cameraPreset:'iso',inspectorState:{open:true,tab:'overview'}});return true;
 }catch(error){toast('Model OFFSET 5 gagal dimuat: '+error.message,true);return false;}
 finally{if(boot)boot.hidden=true;document.body.classList.remove('scene-switching');}
}
function qStaticFallbackClear(){const viewport=$('#viewport');viewport?.querySelectorAll('.static-machine-fallback').forEach(node=>node.remove());}
async function restoreHistoryContext(){
 const params=new URLSearchParams(location.search),legacyMachine=params.get('machine'),route=legacyMachine||params.get('asset')||null,node=params.get('node'),viewMode=params.get('view')==='2d'?'2d':'3d',cameraPreset=params.get('camera')==='top'?'top':'iso';
 const sceneMode=params.get('scene')==='machine'||Boolean(node)||Boolean(legacyMachine)?'machine':'factory';
 if(!route){
  showHome({historyMode:'none'});applyRestoredCamera(cameraPreset);
  dispatchEvent(new CustomEvent('bmj:historyrestore',{detail:{selectedAsset:null,selectedNode:null,sceneMode:'factory',viewMode,cameraPreset}}));return;
 }
 const record=machineRecordForRoute(route);
 if(!record){
  showHome({historyMode:'none'});toast('Aset pada tautan ini tidak ditemukan. Pabrik ditampilkan sebagai gantinya.',true);
  dispatchEvent(new CustomEvent('bmj:historyrestore',{detail:{selectedAsset:null,selectedNode:null,sceneMode:'factory',viewMode,cameraPreset:'iso'}}));return;
 }
 if(sceneMode==='factory'||!canOpenTechnical3D(route)){
  selectFactoryAssetContext(record,{historyMode:'none',openDialog:false,focus:true});machineDetailDialog(record);applyRestoredCamera(cameraPreset);
  dispatchEvent(new CustomEvent('bmj:historyrestore',{detail:{selectedAsset:record.machineId,selectedNode:null,sceneMode:'factory',viewMode,cameraPreset}}));return;
 }
 await switchActiveMachine(FOUNDATION_SCOPE.primaryRoute,{historyMode:'none'});
 const restoredNode=node&&TAXONOMY_BY_ID.has(node)?node:null;
 if(restoredNode){setView('machine');selectTaxonomy(restoredNode,{revealPanel:true});showPanel();renderPanel('structure');}
 else{selectedTaxonomyId=ACTIVE_ROOT;selectedPart=null;engine?.clearPartLabels?.();showPanel();renderPanel('overview');}
 applyRestoredCamera(cameraPreset);
 dispatchEvent(new CustomEvent('bmj:historyrestore',{detail:{selectedAsset:FOUNDATION_SCOPE.primaryRoute,selectedNode:restoredNode,sceneMode:'machine',viewMode,cameraPreset}}));
}
addEventListener('popstate',()=>{restoreHistoryContext().catch(error=>toast('Riwayat tampilan gagal dipulihkan: '+error.message,true));});
function machineRoute(machine){
 return machine?.machineId==='BMJ-MCH-0009'?'offset10':machine?.machineId==='BMJ-MCH-0010'?'apm2':machine?.machineId==='BMJ-MCH-0002'?'sheeting':machine?.machineId==='BMJ-MCH-0003'?'offset5':machine?.machineId||'offset5';
}
function searchableTaxonomy(route){
 return canOpenTechnical3D(route)?OFFSET5_TAXONOMY:[];
}
function searchableSources(route){
 return canOpenTechnical3D(route)?OFFSET5_SOURCES:[];
}
function searchablePhotos(route){
 return canOpenTechnical3D(route)?OFFSET5_PHOTOS:[];
}
const normalizeSearchText=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let UNIVERSAL_SEARCH_INDEX=null;
function buildUniversalSearchIndex(){
 if(UNIVERSAL_SEARCH_INDEX)return UNIVERSAL_SEARCH_INDEX;
 const items=[],areas=new Set(),documentSeen=new Set(),photoSeen=new Set();
 for(const machine of MACHINE_REGISTRY){
  const route=machineRoute(machine),primary=isFoundationPrimary(machine);
  if(machine.area)areas.add(machine.area);
  const subtitle=primary?[machine.area,machine.sapCode,machine.model].filter(Boolean).join(' · '):[machine.area,'Placeholder tata letak'].filter(Boolean).join(' · ');
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
  if(item.type==='area'){emitDomainState({selectedArea:item.title,activeSection:'asset'});assetDialog(item.title);return;}
  if(item.type==='machine'&&!item.has3D){const record=MACHINE_REGISTRY_BY_ID.get(item.machineId);if(record)await openAssetContext(record);return;}
  if(item.route)await switchActiveMachine(item.route,{historyMode:'push'});
  else setView('machine');
  if(item.type==='component'){
   selectTaxonomy(item.nodeId,{revealPanel:true});showPanel();renderPanel('structure');
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
 if(!isFoundationPrimary(machine)){focusFoundationPlaceholder(machine,{historyMode:'push',openDialog:false});machineDetailDialog(machine);return;}
 const route=FOUNDATION_SCOPE.primaryRoute;
 await switchActiveMachine(route,{historyMode:'push'});
 emitDomainState({selectedAsset:route,selectedArea:machine.area||null,selectedNode:null,activeReference:null,activeSection:'asset',sceneMode:'machine',cameraPreset:'iso'});
}
function foundationAssetMatches(machine,query){
 const q=normalizeSearchText(query).trim();if(!q)return true;
 const primary=isFoundationPrimary(machine);
 const fields=primary?[machine.name,machine.machineId,machine.area,machine.sapCode,machine.functionalLocation,machine.model,machine.serial]:[machine.name,machine.machineId,machine.area];
 return normalizeSearchText(fields.filter(Boolean).join(' ')).includes(q);
}
function assetDialog(initialQuery=''){
 const areas=[...new Set(MACHINE_REGISTRY.map(m=>m.area).filter(Boolean))].sort();
 const options=(items,label)=>`<option value="">${label}</option>`+items.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
 let assetCategory='machine';
 modal('Aset',`<div class="asset-browser"><header><div><small>FASE FONDASI</small><h3>1 aset teknis · posisi aset lain dipertahankan</h3><p>OFFSET 5 adalah satu-satunya aset 3D teknis. Mesin/peralatan lain hanya ditampilkan sebagai placeholder spasial dari denah sampai fase ekspansi divalidasi.</p></div><div class="asset-browser-stat"><strong>1</strong><span>aset 3D teknis</span></div></header><div class="asset-category-tabs" role="tablist" aria-label="Kategori aset"><button type="button" data-asset-category="machine" class="active">Mesin</button><button type="button" data-asset-category="equipment">Peralatan</button><button type="button" data-asset-category="component">Komponen OFFSET 5</button></div><div class="asset-filter-grid"><label class="asset-search-wide"><span>Cari</span><input id="asset-search" type="search" autocomplete="off" placeholder="Nama aset, area, atau ID posisi…"></label><label data-asset-registry-filter><span>Area</span><select id="asset-area">${options(areas,'Semua area')}</select></label></div><div class="asset-result-summary" id="asset-result-summary"></div><div id="asset-results" class="asset-browser-results"></div></div>`);
 const renderComponents=query=>{
  const raw=String(query||'').trim().toLowerCase(),nodes=OFFSET5_TAXONOMY.filter(node=>node.id!=='O5'&&(!raw||[node.name,node.description,node.id,node.levelName].some(v=>String(v||'').toLowerCase().includes(raw)))).slice(0,100);
  $('#asset-result-summary').textContent=nodes.length+' komponen OFFSET 5 ditampilkan';
  $('#asset-results').innerHTML=nodes.length?nodes.map(node=>`<button type="button" data-component-id="${esc(node.id)}" class="asset-browser-row component-row"><span class="asset-thumbnail"><b>L${node.level}</b><small>${esc(node.levelName||'Struktur')}</small></span><span class="asset-browser-copy"><strong>${esc(node.name)}</strong><small>${esc(node.id)}</small><span>${esc(node.description||'Komponen OFFSET 5')}</span></span><em class="asset-data-badge">${engine?.template.resolveTaxonomyNode(node.id)?'Model':'Referensi'}</em></button>`).join(''):'<p class="empty">Tidak ada komponen yang sesuai.</p>';
  $$('[data-component-id]').forEach(button=>button.onclick=()=>{closeModal();switchActiveMachine(FOUNDATION_SCOPE.primaryRoute,{historyMode:'push'}).then(()=>{setView('machine');selectTaxonomy(button.dataset.componentId,{revealPanel:true});showPanel();renderPanel('structure');emitDomainState({selectedAsset:FOUNDATION_SCOPE.primaryRoute,selectedNode:button.dataset.componentId,activeSection:'asset'});});});
 };
 const render=()=>{
  const query=$('#asset-search').value,area=$('#asset-area').value;
  $$('[data-asset-registry-filter]').forEach(el=>el.hidden=assetCategory==='component');
  if(assetCategory==='component'){renderComponents(query);return;}
  const categoryFilter=machine=>assetCategory==='equipment'?machine.area==='UTILITY':machine.area!=='UTILITY';
  const found=MACHINE_REGISTRY.filter(machine=>categoryFilter(machine)&&(!area||machine.area===area)&&foundationAssetMatches(machine,query)).slice(0,100);
  $('#asset-result-summary').textContent=found.length+' posisi '+(assetCategory==='equipment'?'peralatan':'mesin')+' ditampilkan';
  $('#asset-results').innerHTML=found.length?found.map(machine=>{
   const primary=isFoundationPrimary(machine),policy=foundationAssetPolicy(machine,placementForMachine(machine.machineId));
   const copy=primary?[machine.model,machine.area].filter(Boolean).join(' · '):[machine.area,positionStatusLabel(policy.positionStatus)].filter(Boolean).join(' · ');
   return`<button type="button" data-machine-id="${machine.machineId}" class="asset-browser-row"><span class="asset-thumbnail"><b>${primary?'05':'P'}</b><small>${primary?'3D teknis':'Posisi'}</small></span><span class="asset-browser-copy"><strong>${esc(machine.name)}</strong><small>${esc(machine.machineId)}</small><span>${esc(copy)}</span></span><em class="asset-data-badge">${primary?'Aset utama':'Placeholder'}</em></button>`;
  }).join(''):'<p class="empty">Tidak ada posisi aset yang sesuai.</p>';
 $$('[data-machine-id]').forEach(button=>button.onclick=async()=>{const machine=MACHINE_REGISTRY_BY_ID.get(button.dataset.machineId);if(machine){closeModal();await openAssetContext(machine);}});
 };
 $('#asset-search').value=initialQuery;
 $$('[data-asset-category]').forEach(button=>button.onclick=()=>{assetCategory=button.dataset.assetCategory;$$('[data-asset-category]').forEach(x=>x.classList.toggle('active',x===button));render();});
 for(const id of ['#asset-search','#asset-area']){$(id).oninput=render;$(id).onchange=render;}render();
}
function settingsDialog(){
 const appState=window.BMJAppState?.getState?.()||{},device=matchMedia('(max-width:767px)').matches?'Ponsel':matchMedia('(max-width:1180px)').matches?'Tablet':'Desktop';
 const connectionStatus=connectionTruth({online:navigator.onLine,cached:cachedDataActive,connected:Boolean(role)});
 const serviceWorkerStatus=!('serviceWorker'in navigator)?'Tidak didukung':navigator.serviceWorker.controller?'Aktif':'Menunggu aktivasi';
 const selectedNode=appState.selectedNode||'Tidak ada komponen terpilih';
 modal('Pengaturan',`<div class="settings-section"><h3>Tampilan 3D</h3><label class="check"><input id="low-mode" type="checkbox" ${engine?.low?'checked':''} ${exteriorMode?'disabled':''}> Optimasi untuk perangkat dengan performa terbatas</label>${exteriorMode?'<p class="subtle">Optimasi sementara dinonaktifkan saat interior terbuka agar detail tetap terlihat.</p>':''}<label class="check"><input id="label-mode" type="checkbox" ${engine?.labels?'checked':''}> Tampilkan nama mesin dan area</label></div><div class="settings-section"><h3>Data di perangkat</h3><p class="subtle">${cacheEnabled?'Salinan data lokal aktif agar aplikasi lebih cepat dibuka kembali.':'Salinan data lokal tidak aktif.'}</p><button id="clear-cache" class="secondary">Bersihkan Data Tersimpan</button></div><details class="settings-section system-information"><summary>Informasi Sistem</summary><p>Diagnostik teknis ditempatkan di sini agar tampilan utama tetap sederhana.</p><dl class="system-info-grid">${pair('Versi aplikasi','V171')+pair('Mode fondasi','OFFSET 5 detail · aset lain placeholder · sistem berbasis bukti')}${pair('Perangkat',device)}${pair('Mode tampilan',appState.viewMode==='2d'?'2D':'3D')}${pair('Aset aktif',appState.selectedAsset||MACHINE_KEY)}${pair('Komponen terpilih',selectedNode)}${pair('Koneksi data',connectionStatus)}${pair('Penyimpanan lokal',cacheEnabled?'Aktif':'Tidak aktif')}${pair('Aplikasi offline',serviceWorkerStatus)}${pair('Status tampilan 3D',engine?'Siap':'Cadangan / belum siap')}</dl></details>`);
 $('#low-mode').onchange=e=>{engine?.setLow(e.target.checked);localStorage.setItem('offset5-low',e.target.checked?'1':'0');};
 $('#label-mode').onchange=e=>{if(engine)engine.labels=e.target.checked;$('#labels').classList.toggle('active',e.target.checked);emitDomainState({visibleLayers:{labels:e.target.checked}});};
 on('#clear-cache',async()=>{await cache.clear();toast('Data tersimpan di perangkat sudah dibersihkan.');});
}
function helpDialog(){
  const device=matchMedia('(max-width:767px)').matches?'ponsel':'komputer',section=window.BMJAppState?.getState?.().activeSection||'factory';
  const contextHelp=section==='simulation'?'Anda sedang berada di Simulasi OFFSET 5. Gunakan Mulai, Jeda, Stop, dan Kecepatan untuk mengendalikan proses yang sudah diaktifkan pada aset teknis utama.':section==='reference'?'Anda sedang berada di Referensi. Sumber yang paling berkaitan dengan bagian mesin terpilih akan ditempatkan lebih dulu.':section==='asset'?'Anda sedang berada di Aset. Cari mesin, peralatan, atau komponen lalu pilih hasil untuk membuka konteksnya.':'Anda sedang berada di Pabrik. Pilih mesin pada tampilan 3D atau melalui menu Aset.';
  modal('Bantuan',`<div class="help-intro"><small>PANDUAN KONTEKSTUAL · ${device.toUpperCase()}</small><h3>${esc(contextHelp)}</h3></div><div class="help-grid"><section><h3>Gerakkan tampilan</h3><p>Seret untuk memutar. Cubit atau scroll untuk memperbesar dan memperkecil. Gunakan Pusatkan untuk kembali ke objek yang sedang dipilih.</p></section><section><h3>Lihat bagian mesin</h3><p>Buka tab Struktur, lalu pilih tingkat Mesin → Unit Utama → Sub → Block → Part → Spesifik Part. Bagian yang dipilih akan ditandai dan dipusatkan.</p></section><section><h3>Buka Interior</h3><p>Gunakan Buka Interior untuk menyembunyikan cover luar sementara. Frame, support, dan posisi komponen tidak diubah.</p></section><section><h3>Jalankan simulasi</h3><p>Simulasi teknis pada fase fondasi tersedia untuk OFFSET 5. Aset lain tetap dapat ditemukan dan dipusatkan pada pabrik tanpa mengarang perilaku mesin.</p></section><section><h3>Gunakan 2D dan 3D</h3><p>Pindah tampilan dari tombol 2D / 3D. Mesin atau komponen yang dipilih tetap menjadi konteks aktif.</p></section><section><h3>Cari apa pun</h3><p>Gunakan kolom pencarian untuk menemukan OFFSET 5, komponen, sumber, area, atau posisi aset pada denah.</p></section></div><div class="card"><h3>Kejujuran data</h3><p>Informasi yang belum memiliki dasar sumber tetap ditandai belum tersedia atau belum terverifikasi. Aplikasi tidak mengisi status, ukuran, atau konfigurasi dengan tebakan.</p><p class="subtle">Informasi teknis aplikasi tersedia di Pengaturan → Informasi Sistem.</p></div>`);
}
renderPanel();renderStatus();const taxCount=$('#taxonomy-count');if(taxCount)taxCount.textContent=taxonomyStats().total.toLocaleString('id-ID');if(matchMedia('(max-width:800px)').matches)document.body.classList.add('panel-hidden');
try{engine=new FactoryEngine($('#viewport'),part=>{const meta=taxonomyForPart(part);if(meta)selectedTaxonomyId=meta.id;choosePart(part);showPanel();renderPanel('structure');});engine.onTaxonomySelect=id=>selectTaxonomy(id,{revealPanel:false});engine.onSimulationUpdate=next=>{simulationState=next;updateSimulationPanel(next);};simulationState=engine.getPrintingSimulationState();engine.onReset=()=>{explode=0;selectedPart=null;selectedTaxonomyId=ACTIVE_ROOT;renderPanel();};engine.onError=message=>toast(message,true);$('#engine-status').textContent='Menyiapkan denah pabrik';try{engine.setLow(localStorage.getItem('offset5-low')==='1'||matchMedia('(max-width:767px)').matches||matchMedia('(pointer:coarse) and (max-width:1024px)').matches);}catch{}}catch(e){renderStaticMachineFallback(e);$('#engine-status').textContent='Tampilan 3D belum tersedia';}
try{
 bundledLayout=await loadBundledPlantLayout();bundledLayout.fleet=await loadFactoryFleet();engine?.loadLayout(activeLayout());
 if(engine)engine.onFactorySelect=id=>{const m=MACHINE_REGISTRY.find(m=>m.machineId===id);if(m){selectFactoryAssetContext(m,{historyMode:'push',openDialog:false,focus:true});machineDetailDialog(m);}};
 renderStatus();redrawPlantPlan();
 await restoreHistoryContext();
 const boot=$('#boot');if(boot)boot.hidden=true;$('#engine-status').textContent=engine?'Pabrik 3D siap':'Denah tersedia · penampil 3D belum siap';
}catch(e){
 const boot=$('#boot');if(boot){boot.hidden=false;boot.innerHTML='<strong>Denah pabrik belum dapat dimuat</strong><p>Data CAD tersimpan tidak berhasil dibuka. Tidak ada geometri pengganti yang dibuat.</p><button id="boot-retry" class="primary">Muat Ulang</button>';on('#boot-retry',()=>location.reload());}
 $('#engine-status').textContent='Denah belum tersedia';toast('Denah pabrik gagal dimuat: '+e.message,true);
}
function scrollInspectorToTabStart(){
 const panel=$('#detail-panel'),content=$('#panel-content'),top=$('.panel-top'),tabs=$('.tabs');if(!panel||!content||!tabs)return;
 requestAnimationFrame(()=>{const sticky=(top?.offsetHeight||0)+(tabs?.offsetHeight||0);panel.scrollTo({top:Math.max(0,content.offsetTop-sticky),behavior:'auto'});});
}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{if(editing){engine.edit(false);engine.applyPlacement(state);engine.onTransform=null;editing=false;}renderPanel(b.dataset.tab);scrollInspectorToTabStart();});
on('#modal-close',closeModal);on('#connect',connectionDialog);on('#nav-machine',()=>activeLayout()?showHome({historyMode:'push'}):layoutDialog());on('#nav-layout',()=>activeLayout()?setView('factory'):layoutDialog());on('#notice-details',layoutDialog);on('#nav-assets',()=>assetDialog());on('#nav-sources',()=>{showPanel();renderPanel('sources');});on('#nav-help',helpDialog);on('#settings',settingsDialog);on('#close-panel',()=>document.body.classList.add('panel-hidden'));on('#focus-machine',()=>{if(!engine?.machine.visible)setView('machine');engine?.fit(engine.machine);});on('#edit-position',editorPanel);
$$('[data-camera]').forEach(b=>b.onclick=()=>{if(!engine)return;const mode=b.dataset.camera,isFactory=engine.view==='factory',target=isFactory?engine.currentFactoryTarget():(selectedPart||engine.machine);if(mode==='reset'){if(isFactory){engine.clearFactorySelection();engine.fit(engine.factory,'iso');$('#geometry-caption').textContent='Pabrik · Seluruh Area';$('#scene-hint').textContent='Klik aset untuk memilih · seret untuk memutar · zoom dengan cubit/scroll';emitDomainState({selectedAsset:null,selectedArea:null,activeSection:'factory'});}else{explode=0;selectedPart=null;engine.isolated=false;engine.template.reset();engine.clearPartLabels();$('#tool-explode')?.classList.remove('active');$('#tool-isolate')?.classList.remove('active');emitDomainState({inspectionMode:{explode:false,isolate:false,section:false},selectedNode:null});renderPanel();engine.fit(engine.machine,'iso');}$$('[data-camera]').forEach(c=>c.classList.toggle('active',c.dataset.camera==='iso'));emitDomainState({cameraPreset:'iso'});return;}if(mode==='fit'){engine.fit(target,'iso');emitDomainState({cameraPreset:'iso'});return;}const preset=mode==='top'?'top':'iso';engine.fit(target,preset);$$('[data-camera]').forEach(c=>c.classList.toggle('active',c.dataset.camera===mode));emitDomainState({cameraPreset:preset});});
on('#tool-pan',()=>{if(!engine)return;engine.controls.enablePan=!engine.controls.enablePan;$('#tool-pan').classList.toggle('active',engine.controls.enablePan);toast(engine.controls.enablePan?'Mode pan aktif · gunakan dua jari / klik kanan':'Mode pan nonaktif');});
on('#tool-explode',()=>{if(simulationLocksStructure())return;showPanel();selectedTaxonomyId=selectedTaxonomyId||ACTIVE_ROOT;renderPanel('structure');explode=explode>.01?0:.65;engine?.template.explode(explode,selectedPart);$('#tool-explode')?.classList.toggle('active',explode>0);emitDomainState({inspectionMode:{explode:explode>0}});renderPanel('structure');});
on('#tool-isolate',()=>{if(simulationLocksStructure())return;if(!engine||!selectedPart){showPanel();renderPanel('structure');toast('Pilih bagian mesin terlebih dahulu.',true);return;}engine.isolated=!engine.isolated;engine.template.isolate(selectedPart,engine.isolated);$('#tool-isolate').classList.toggle('active',engine.isolated);emitDomainState({inspectionMode:{isolate:engine.isolated}});});
on('#tool-simulation',()=>{showPanel();renderPanel('simulation');});
on('#labels',()=>{if(engine){engine.labels=!engine.labels;$('#labels').classList.toggle('active',engine.labels);emitDomainState({visibleLayers:{labels:engine.labels}});}});
on('#tool-interior',()=>{if(!engine)return;if(exteriorMode)resetExteriorView();else showExteriorAll();$('#tool-interior')?.classList.toggle('active',exteriorMode);emitDomainState({inspectionMode:{interior:exteriorMode}});});
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
try{const config=await fetch('./config.json').then(r=>r.json());apiBase=localStorage.getItem('offset5-api-base')||config.apiBase||'';if(cacheEnabled&&apiBase){const cached=await cache.get(apiBase);if(cached?.state){state=cached.state;cachedDataActive=true;engine?.loadLayout(activeLayout());renderStatus();renderPanel();updateConnectionTruth();toast('CACHED DATA · '+new Date(cached.savedAt).toLocaleString('id-ID'));}}else updateConnectionTruth();}catch(e){updateConnectionTruth();toast('Data tersimpan tidak dapat dibaca. Mode lokal tetap tersedia.',true);}
window.addEventListener('resize',redrawPlantPlan,{passive:true});$('#ui-workbench-toggle')?.addEventListener('click',()=>setTimeout(redrawPlantPlan,80));$$('[data-workbench="dwg"]').forEach(b=>b.addEventListener('click',()=>setTimeout(redrawPlantPlan,40)));if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
window.addEventListener('pagehide',()=>{token='';});
