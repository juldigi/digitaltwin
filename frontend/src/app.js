import {FactoryEngine} from './engine.js';
import {initialState,validateLayout,validatePosition,worldToCad} from './model.js';
import {OFFSET5_TAXONOMY,TAXONOMY_BY_ID as OFFSET5_BY_ID,taxonomyChildren as offset5Children,taxonomyStats as offset5Stats} from './data/taxonomy-offset5.js';
import {PHOTO_REGISTRY as OFFSET5_PHOTOS,TECHNICAL_SOURCES as OFFSET5_SOURCES,photoStats as offset5PhotoStats,ORIENTATION as OFFSET5_ORIENTATION} from './data/sources-offset5.js';
import {OFFSET10_TAXONOMY,OFFSET10_TAXONOMY_BY_ID,offset10TaxonomyChildren,offset10TaxonomyStats} from './data/taxonomy-offset10.js';
import {OFFSET10_PHOTO_REGISTRY,OFFSET10_TECHNICAL_SOURCES,offset10PhotoStats,OFFSET10_ORIENTATION} from './data/sources-offset10.js';
import {confidenceLabel} from './data/confidence.js';
import {loadBundledPlantLayout,drawPlantPlan} from './data/plant-layout-data.js';
import {PRINTING_SIMULATION_STAGES as OFFSET5_SIM_STAGES,INK_SIMULATION_SEQUENCE as OFFSET5_INK_SEQUENCE} from './simulation.js';
import {OFFSET10_SIMULATION_STAGES,OFFSET10_INK_SEQUENCE} from './simulation-offset10.js';
import {APM2_TAXONOMY,APM2_TAXONOMY_BY_ID,apm2TaxonomyChildren,apm2TaxonomyStats} from './data/taxonomy-apm2.js';
import {APM2_PHOTO_REGISTRY,APM2_TECHNICAL_SOURCES,apm2PhotoStats,APM2_ORIENTATION} from './data/sources-apm2.js';
import {APM2_SIMULATION_STAGES,APM2_PROCESS_STEPS} from './simulation-apm2.js';
import {SHEETING_TAXONOMY,SHEETING_TAXONOMY_BY_ID,sheetingTaxonomyChildren,sheetingTaxonomyStats} from './data/taxonomy-sheeting.js';
import {SHEETING_PHOTO_REGISTRY,SHEETING_TECHNICAL_SOURCES,sheetingPhotoStats,SHEETING_ORIENTATION} from './data/sources-sheeting.js';
import {SHEETING_SIMULATION_STAGES,SHEETING_PROCESS_STEPS} from './simulation-sheeting.js';
import {MACHINE_REGISTRY,MACHINE_REGISTRY_BY_ID,MACHINE_REGISTRY_STATS,searchMachines} from './data/machine-registry.js';
import {universalMachineConfig,universalTaxonomy,universalTechnicalSources} from './universal-machine.js';
const REQUESTED_MACHINE=new URLSearchParams(location.search).get('machine');
const GENERIC_CONFIG=universalMachineConfig(REQUESTED_MACHINE);
const MACHINE_KEY=['offset10','apm2','sheeting'].includes(REQUESTED_MACHINE)||GENERIC_CONFIG?REQUESTED_MACHINE:'offset5';
const IS_OFFSET10=MACHINE_KEY==='offset10',IS_APM2=MACHINE_KEY==='apm2',IS_SHEETING=MACHINE_KEY==='sheeting',IS_GENERIC=!!GENERIC_CONFIG;
const GENERIC_TAXONOMY=IS_GENERIC?universalTaxonomy(MACHINE_KEY):[],GENERIC_ROOT=GENERIC_TAXONOMY[0]?.id;
const ACTIVE_ROOT=IS_OFFSET10?'O10':IS_APM2?'APM2':IS_SHEETING?'SH':IS_GENERIC?GENERIC_ROOT:'O5';
const ACTIVE_TAXONOMY=IS_OFFSET10?OFFSET10_TAXONOMY:IS_APM2?APM2_TAXONOMY:IS_SHEETING?SHEETING_TAXONOMY:IS_GENERIC?GENERIC_TAXONOMY:OFFSET5_TAXONOMY;
const TAXONOMY_BY_ID=IS_OFFSET10?OFFSET10_TAXONOMY_BY_ID:IS_APM2?APM2_TAXONOMY_BY_ID:IS_SHEETING?SHEETING_TAXONOMY_BY_ID:IS_GENERIC?new Map(GENERIC_TAXONOMY.map(n=>[n.id,n])):OFFSET5_BY_ID;
const taxonomyChildren=IS_OFFSET10?offset10TaxonomyChildren:IS_APM2?apm2TaxonomyChildren:IS_SHEETING?sheetingTaxonomyChildren:IS_GENERIC?(id=>GENERIC_TAXONOMY.filter(n=>n.parentId===id)):offset5Children;
const taxonomyStats=IS_OFFSET10?offset10TaxonomyStats:IS_APM2?apm2TaxonomyStats:IS_SHEETING?sheetingTaxonomyStats:IS_GENERIC?(()=>({total:GENERIC_TAXONOMY.length,byLevel:Object.fromEntries([1,2,3,4,5,6].map(l=>[l,GENERIC_TAXONOMY.filter(n=>n.level===l).length]))})):offset5Stats;
const PHOTO_REGISTRY=IS_OFFSET10?OFFSET10_PHOTO_REGISTRY:IS_APM2?APM2_PHOTO_REGISTRY:IS_SHEETING?SHEETING_PHOTO_REGISTRY:IS_GENERIC?[]:OFFSET5_PHOTOS;
const GENERIC_SOURCES=IS_GENERIC?[{id:'BMJ-MACHINE-DATABASE',title:'Database Mesin Packaging Offset BMJ',publisher:'PT Bukit Muria Jaya',type:'USER_PROVIDED',confidence:'VERIFIED'},...universalTechnicalSources(MACHINE_KEY)]:[];
const TECHNICAL_SOURCES=IS_OFFSET10?OFFSET10_TECHNICAL_SOURCES:IS_APM2?APM2_TECHNICAL_SOURCES:IS_SHEETING?SHEETING_TECHNICAL_SOURCES:IS_GENERIC?GENERIC_SOURCES:OFFSET5_SOURCES;
const photoStats=IS_OFFSET10?offset10PhotoStats:IS_APM2?apm2PhotoStats:IS_SHEETING?sheetingPhotoStats:IS_GENERIC?(()=>({unique:0,total:0})):offset5PhotoStats;
const ORIENTATION=IS_OFFSET10?OFFSET10_ORIENTATION:IS_APM2?APM2_ORIENTATION:IS_SHEETING?SHEETING_ORIENTATION:IS_GENERIC?{feedDirection:'Mengikuti alur proses keluarga',operatorSide:'Belum terverifikasi',driveSide:'Belum terverifikasi'}:OFFSET5_ORIENTATION;
const PRINTING_SIMULATION_STAGES=IS_OFFSET10?OFFSET10_SIMULATION_STAGES:IS_APM2?APM2_SIMULATION_STAGES:IS_SHEETING?SHEETING_SIMULATION_STAGES:IS_GENERIC?GENERIC_CONFIG.modules:OFFSET5_SIM_STAGES;
const INK_SIMULATION_SEQUENCE=IS_OFFSET10?OFFSET10_INK_SEQUENCE:IS_APM2?APM2_PROCESS_STEPS:IS_SHEETING?SHEETING_PROCESS_STEPS:IS_GENERIC?GENERIC_CONFIG.modules.map(x=>`${x} process`):OFFSET5_INK_SEQUENCE;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'Belum tersedia').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=n=>Number.isFinite(n)?n.toLocaleString('id-ID',{maximumFractionDigits:4}):'Belum tersedia';
let state=structuredClone(initialState),engine,activeTab='overview',apiBase='',token='',role=null,editing=false,explode=0,selectedPart=null,selectedTaxonomyId=ACTIVE_ROOT,exteriorMode=false,exteriorPreviousLow=null,exteriorFocusKey=null,simulationState={active:false,running:false,paused:false,speed:1,stage:'Feeder',completed:0,progress:0,sheetsVisible:0,pileSheetsVisible:0,rotorCount:0,oscillatorCount:0,mechanismCount:0,inkFlowCount:0,uvLampCount:0,uvActive:false,pathVisible:true,inkFlowVisible:true},simulationOwnsExterior=false,toastTimer,bundledLayout=null;
if(IS_OFFSET10)state.asset={...state.asset,asset_id:'MACHINE-OFFSET10',asset_code:'OFFSET-10',codename:null,model:'CX104-2+LY-8+LY-1+L UV + FoilStar',description:'OFFSET 10',source_description:'OFFSET - 10 MACHINE',manufacturer:'Heidelberg',specification:'Speedmaster CX 104 · Full UV · FoilStar Gen.3 · X3 delivery',configuration:'CX104-2+LY-8+LY-1+L UV + FoilStar / X3','3d_status':'PROCEDURAL / DOCUMENT-GROUNDED',data_confidence:'HIGH CONFIDENCE',discovery_status:'OFFICIAL_DOCUMENTS_AVAILABLE',sources:OFFSET10_TECHNICAL_SOURCES};
if(IS_APM2)state.asset={...state.asset,asset_id:'MACHINE-APM2',asset_code:'APM-2',codename:'APM-2',model:'SP 102',description:'AUTOPLATEN - 2 MACHINE',source_description:'BMJ Machine Database',manufacturer:'BOBST',specification:'Automatic flatbed die cutter · SP 102 family · 1994',configuration:'Feeder · Register / SideLay · Gripper Chain · Flatbed Platen · Stripping · Delivery','3d_status':'PROCEDURAL / DATABASE + LEGACY FAMILY REFERENCES',data_confidence:'IDENTITY VERIFIED / VARIANT REFERENCE',discovery_status:'SP102_FAMILY_REFERENCE_AVAILABLE',serial_number:'57115506',functional_location:'PC-PK2-CON-AUT-AUTOPLAT02',year:1994,sources:APM2_TECHNICAL_SOURCES};
if(IS_SHEETING)state.asset={...state.asset,asset_id:'BMJ-MCH-0002',asset_code:'SBM-2',codename:'SBM-2',model:'HSM-CTM7',description:'SHEETING LEXUS',source_description:'BMJ Machine Database',manufacturer:'LEXUS',specification:'HSM-CTM7 · HSM 56 family reference · 2014',configuration:'Rollstand → Feed/Tension/EPC → Flat-Bed Knife → Delivery/Layboy → Stacker','3d_status':'DEDICATED PROCEDURAL / USER-CONFIRMED ORIENTATION + FAMILY REFERENCE',data_confidence:'IDENTITY VERIFIED / HSM56 FAMILY REFERENCE',discovery_status:'HSM56_FAMILY_REFERENCE_AVAILABLE',serial_number:'00982',functional_location:'PC-PK2-OFS-SHT-SHEETING01',year:2014,sources:SHEETING_TECHNICAL_SOURCES};
if(IS_GENERIC){const m=GENERIC_CONFIG.machine;state.asset={...state.asset,asset_id:m.machineId,asset_code:m.sapCode||m.machineId,codename:m.sapCode,model:m.model,description:m.name,source_description:'BMJ Machine Database',manufacturer:null,specification:GENERIC_CONFIG.label,configuration:GENERIC_CONFIG.modules.join(' · '),'3d_status':'PROCEDURAL / PARAMETRIC FAMILY REFERENCE',data_confidence:m.model?'IDENTITY VERIFIED / FAMILY REFERENCE':'IDENTITY VERIFIED / MODEL UNKNOWN',discovery_status:'FAMILY_REFERENCE_AVAILABLE',serial_number:m.serial,functional_location:m.functionalLocation,year:m.year,sources:GENERIC_SOURCES};}
function applyMachineShell(){
 const name=IS_OFFSET10?'OFFSET 10':IS_APM2?'APM 2':IS_SHEETING?'SHEETING LEXUS':IS_GENERIC?GENERIC_CONFIG.machine.name:'OFFSET 5';
 const maker=IS_OFFSET10||(!IS_APM2&&!IS_SHEETING&&!IS_GENERIC)?'Heidelberg':IS_APM2?'BOBST':IS_SHEETING?'LEXUS':GENERIC_CONFIG.label;
 const model=IS_OFFSET10?'CX104-2+LY-8+LY-1+L UV + FoilStar':IS_APM2?'SP 102 · 1994':IS_SHEETING?'HSM-CTM7 · 2014':IS_GENERIC?(GENERIC_CONFIG.machine.model||'Model belum terverifikasi'):'CD 102-8+L';
 document.title='Factory Digital Twin · '+name;
 const title=$('#view-title'),sub=$('#view-subtitle'),label=$('#machine-label strong'),detail=$('#label-detail'),caption=$('#geometry-caption');
 if(title)title.textContent=name;if(sub)sub.textContent=maker+' · '+model;if(label)label.textContent=name;if(detail)detail.textContent=model;if(caption)caption.textContent='Model '+name;
 const heading=$('.asset-heading h2'),headingSub=$('.asset-heading p');if(heading)heading.textContent=name;if(headingSub)headingSub.textContent=maker+' · '+model;
 const quick=$('.telemetry-strip section:first-child');
 if(quick&&IS_OFFSET10)quick.innerHTML='<h4>INFORMASI CEPAT</h4><span>Mesin <b>OFFSET 10</b></span><span>Konfigurasi <b>Full UV + FoilStar</b></span><span>Model <b>CX 104</b></span>';
 if(quick&&IS_APM2)quick.innerHTML='<h4>INFORMASI CEPAT</h4><span>Mesin <b>APM 2</b></span><span>Model <b>SP 102</b></span><span>Tahun <b>1994</b></span>';
 if(quick&&IS_SHEETING)quick.innerHTML='<h4>INFORMASI CEPAT</h4><span>Mesin <b>SHEETING LEXUS</b></span><span>Kode <b>SBM-2</b></span><span>Alur <b>Kanan → Kiri</b></span>';
 const simCaption=$('#tool-simulation span');if(simCaption)simCaption.textContent=IS_APM2?'Proses Autoplaten':IS_SHEETING?'Proses Sheeting':IS_GENERIC?'Simulasi Proses':'Printing Test';
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
  const hierarchy=$('[data-workbench-card="hierarchy"] .asset-tree');if(hierarchy)hierarchy.innerHTML='<details open><summary>Pabrik <span class="tax-level">L0</span></summary><details open><summary>Offset Printing</summary><details open><summary><span class="active-node">SHEETING LEXUS</span> <span class="tax-level">L1 · Mesin</span></summary><div>Rollstand / Unwind · Feed / Tension / EPC · Flat-Bed Knife · Delivery / Layboy · Control · Access</div></details></details></details>';
  const hsmall=$('[data-workbench-card="hierarchy"] header small');if(hsmall)hsmall.textContent='SBM-2';
  const qsmall=$('[data-workbench-card="quick"] header small');if(qsmall)qsmall.textContent='SBM-2';
  const qgrid=$('[data-workbench-card="quick"] .quick-grid');if(qgrid)qgrid.innerHTML='<dt>Model plant</dt><dd>HSM-CTM7</dd><dt>Serial</dt><dd>00982</dd><dt>Tahun</dt><dd>2014</dd><dt>SAP Code</dt><dd>SBM-2</dd><dt>Referensi family</dt><dd>LEXUS HSM 56</dd><dt>Cut length ref.</dt><dd>400–1700 mm</dd><dt>Knife load ref.</dt><dd>600 gsm</dd><dt>Speed ref.</dt><dd>300 m/min</dd><dt>Alur aktual</dt><dd>RIGHT → LEFT</dd>';
  const warning=$('#dwg-warning');if(warning)warning.textContent='Orientasi Sheeting telah dikoreksi: input reel di kanan, proses menuju kiri, output stack di kiri. Posisi plant tetap menunggu anchor layout yang tervalidasi.';
 }else if(IS_GENERIC){
  const m=GENERIC_CONFIG.machine,mark=$('.brandmark');if(mark)mark.innerHTML=String(m.no).padStart(2,'0');
  const icon=$('.asset-icon');if(icon)icon.textContent=String(m.no).padStart(2,'0');
  const hierarchy=$('[data-workbench-card="hierarchy"] .asset-tree');if(hierarchy)hierarchy.innerHTML=`<details open><summary>Pabrik <span class="tax-level">L0</span></summary><details open><summary>${esc(m.area)}</summary><details open><summary><span class="active-node">${esc(m.name)}</span> <span class="tax-level">L1 · Mesin</span></summary><div>${GENERIC_CONFIG.modules.map(esc).join(' · ')}</div></details></details></details>`;
  const hsmall=$('[data-workbench-card="hierarchy"] header small');if(hsmall)hsmall.textContent=m.sapCode||m.machineId;
  const qsmall=$('[data-workbench-card="quick"] header small');if(qsmall)qsmall.textContent=m.sapCode||m.machineId;
  const qgrid=$('[data-workbench-card="quick"] .quick-grid');if(qgrid)qgrid.innerHTML=`<dt>Model</dt><dd>${esc(m.model||'Belum tersedia')}</dd><dt>Serial</dt><dd>${esc(m.serial||'Belum tersedia')}</dd><dt>Tahun</dt><dd>${esc(m.year||'Belum tersedia')}</dd><dt>Area</dt><dd>${esc(m.area)}</dd><dt>Model 3D</dt><dd>Referensi parametrik keluarga</dd><dt>Konfigurasi aktual</dt><dd>${m.model?'Perlu verifikasi foto/manual':'Belum terverifikasi'}</dd>`;
  const warning=$('#dwg-warning');if(warning)warning.textContent='Posisi dan orientasi mesin ini pada plant belum diklaim sampai anchor layout aktual tervalidasi.';
 }
}
applyMachineShell();
const toast=(message,error=false)=>{clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.toggle('error',error);$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,error?9000:5000);};
const safe=fn=>async(...args)=>{try{await fn(...args);}catch(e){toast(e.message,true);}};
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
function closeModal(){$('#modal').close();}
function showPanel(){document.body.classList.remove('panel-hidden');if(matchMedia('(max-width:767px)').matches)document.body.classList.add('mobile-panel-open');}
const activeLayout=()=>state.layout||bundledLayout;
function redrawPlantPlan(){if(bundledLayout)drawPlantPlan($('#dwg-canvas'),bundledLayout);}
function pair(label,value){return `<dt>${esc(label)}</dt><dd${value==null?' class="unknown"':''}>${esc(value)}</dd>`;}
const EXTERIOR_AREAS=IS_APM2?[
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
]:IS_GENERIC?GENERIC_CONFIG.modules.map((name,i)=>({key:`module-${i+1}`,name,ids:[`universal-module-${i+1}`]})):[
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
 const area=EXTERIOR_AREAS.find(item=>item.key===key),parts=exteriorAreaNodes(area);if(!area||!parts.length)return;
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
 if(start)start.textContent=active?(running?'Running':'Lanjutkan'):(IS_APM2?'Mulai Simulasi Proses':'Mulai Printing Test');
 if(pause)pause.textContent=running?'Pause':'Lanjut';
 document.querySelectorAll('[data-sim-speed]').forEach(b=>b.classList.toggle('active',Math.abs(+b.dataset.simSpeed-(simulationState.speed||1))<.01));
 document.querySelectorAll('[data-sim-stage]').forEach(b=>b.classList.toggle('active',b.dataset.simStage===(simulationState.stage||'')));
 $('#tool-simulation')?.classList.toggle('active',active);
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
 if(engine?.isPrintingSimulationActive()){toast(IS_APM2?'Hentikan simulasi proses APM 2 sebelum memilih, mengurai, atau mengisolasi komponen.':'Hentikan simulasi Printing Test sebelum memilih, mengurai, atau mengisolasi komponen.');return true;}
 return false;
}
function choosePart(part){if(!part||!engine||simulationLocksStructure())return;engine.template.reset();engine.isolated=false;explode=0;selectedPart=part;engine.template.highlight(part);engine.template.ghost(true,part);engine.setPartLabels(part,selectedTaxonomyId);engine.fit(part);}
function taxonomyForPart(part){const id=part?.userData?.nodeId;if(!id)return null;return ACTIVE_TAXONOMY.filter(n=>(n.meshRefs||[]).includes(id)).sort((a,b)=>Math.abs(a.level-5)-Math.abs(b.level-5))[0]||null;}
function taxonomyAtLevel(level){
 const target=Math.max(1,Math.min(6,Number(level)||1));let meta=TAXONOMY_BY_ID.get(selectedTaxonomyId)||TAXONOMY_BY_ID.get(ACTIVE_ROOT);
 while(meta&&meta.level>target)meta=meta.parentId?TAXONOMY_BY_ID.get(meta.parentId):meta;
 while(meta&&meta.level<target){const children=taxonomyChildren(meta.id);if(!children.length)return null;meta=children.find(n=>(n.meshRefs||[]).length)||children[0];}
 return meta?.level===target?meta:null;
}
function selectTaxonomy(id,{revealPanel=false}={}){
 if(simulationLocksStructure())return;const meta=TAXONOMY_BY_ID.get(id);if(!meta)return;
 selectedTaxonomyId=meta.id;const part=engine?.template.resolveTaxonomyNode(meta.id);
 if(part)choosePart(part);else{selectedPart=null;engine?.template.reset();engine?.clearPartLabels();}
 if(revealPanel&&!matchMedia('(max-width:767px)').matches)showPanel();renderPanel('structure');
}
function taxonomyTree(parentId=ACTIVE_ROOT){
 const children=taxonomyChildren(parentId);
 return children.map(n=>{
  const descendants=taxonomyChildren(n.id);
  const mapped=!!engine?.template.resolveTaxonomyNode(n.id);
  return `<div class="geometry-node"><button data-taxonomy="${esc(n.id)}" aria-pressed="${n.id===selectedTaxonomyId}">${esc(n.name)} <span class="tax-level">L${n.level}${mapped?' · Model':' · Referensi'}</span></button>${descendants.length?`<details ${selectedTaxonomyId.startsWith(n.id)?'open':''}><summary>${esc(n.levelName)}</summary>${taxonomyTree(n.id)}</details>`:''}</div>`;
 }).join('');
}
function renderPanel(tab=activeTab){
 if(editing&&engine){engine.edit(false);engine.onTransform=null;engine.applyPlacement(state);editing=false;}
 activeTab=tab;
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
  }else{
   const structural=envelope?.structuralBody,service=envelope?.serviceInclusive,pitch=envelope?.repeatedPitch;
   const structuralText=structural?`${structural.length.toLocaleString('id-ID',{maximumFractionDigits:2})} × ${structural.width.toLocaleString('id-ID',{maximumFractionDigits:2})} m`:'Belum tersedia';
   const serviceText=service?`${service.length.toLocaleString('id-ID',{maximumFractionDigits:2})} × ${service.width.toLocaleString('id-ID',{maximumFractionDigits:2})} m`:'Belum tersedia';
   const pitchText=pitch?`${pitch.value.toLocaleString('id-ID',{minimumFractionDigits:3,maximumFractionDigits:3})} m`:'Belum tersedia';
   $('#panel-content').innerHTML=`<h3>Informasi mesin</h3><dl class="data-list">${pair('Kode aset',a.asset_code)+pair('Kode nama',a.codename)+pair('Pabrikan',a.manufacturer)+pair('Model',a.model)+pair('Kategori','Mesin produksi')+pair('Spesifikasi',a.specification)+pair('Lokasi',a.location)+pair('Status operasi',null)}</dl><h3>Model 3D</h3><div class="card accent"><h4>Rekonstruksi berbasis denah + foto aktual</h4><p>Envelope mesin dan pitch berulang mengikuti footprint OFU-1 pada denah terkalibrasi. Bentuk luar mengacu pada foto aktual, sedangkan struktur fungsional internal mengacu pada dokumen CD102 yang tersedia.</p><span class="tag">DENAH AKTUAL</span><span class="tag">FOTO AKTUAL</span><span class="tag">DOKUMEN MESIN</span></div><dl class="data-list">${pair('Envelope struktur',structuralText)+pair('Envelope termasuk area servis',serviceText)+pair('Pitch modul berulang',pitchText)+pair('Susunan unit','8 printing unit + coating + extension/delivery')+pair('Posisi di pabrik',activeLayout()?'Tersedia pada denah':'Belum tersedia')+pair('Dokumen identitas',a.sources.length+' dokumen')}</dl><div class="card"><h4>Batas ketelitian</h4><p>Ukuran envelope dan pitch berasal dari denah OFU-1. Dimensi internal seperti bearer, nip, cam timing, dan setelan roller hanya ditampilkan bila benar-benar didukung dokumen; sisanya tetap referensi visual.</p></div>`;
  }
 }else if(tab==='structure'){
  const meta=TAXONOMY_BY_ID.get(selectedTaxonomyId)||TAXONOMY_BY_ID.get(ACTIVE_ROOT),stats=taxonomyStats();
  $('#panel-content').innerHTML=`<h3>Struktur mesin · 6 tingkat</h3><p class="subtle">Pilih bagian mesin untuk memusatkan tampilan. Object terpilih tetap terlihat penuh, sedangkan seluruh bagian lainnya otomatis transparan. Label <b>Model</b> berarti bagian tersebut dapat dipilih pada tampilan 3D; label <b>Referensi</b> berarti informasi bagian tersedia tetapi bentuk detailnya belum ditampilkan.</p><button id="tree-root" class="secondary">${IS_OFFSET10?'OFFSET 10':IS_APM2?'APM 2':'OFFSET 5'} · Mesin</button><div class="card accent" style="margin-top:12px"><h4>${esc(meta.name)}</h4><p>Bagian terpilih pada struktur ${IS_OFFSET10?'Offset 10':IS_APM2?'APM 2':'Offset 5'}.</p><span class="tag">TINGKAT ${meta.level}</span></div><label for="explode">Jarak uraian <span id="explode-value">${Math.round(explode*100)}%</span></label><input id="explode" type="range" min="0" max="1" step="0.01" value="${explode}" ${engine?.view==='factory'?'disabled':''}><div class="actions"><button id="assemble" class="secondary">Rakit Kembali</button><button id="ghost" class="secondary ${engine?.template.ghosted?'active':''}">Transparan</button><button id="isolate" class="secondary ${engine?.isolated?'active':''}" aria-disabled="${selectedPart?'false':'true'}">Tampilkan Sendiri</button></div><div class="stage-strip">${[1,2,3,4,5,6].map(level=>`<button data-stage="${level}" class="${meta.level===level?'active':''}">L${level}</button>`).join('')}</div><div class="geometry-tree">${taxonomyTree()}</div><p class="subtle">${stats.total} bagian tercatat dalam struktur mesin.</p>`;
  $('#explode').addEventListener('input',e=>{explode=+e.target.value;engine?.template.explode(explode,selectedPart);if(selectedPart)engine.template.ghost(explode>0,selectedPart);$('#explode-value').textContent=Math.round(explode*100)+'%';$('#ghost').classList.toggle('active',!!engine?.template.ghosted);});
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
  }else{
  const s=engine?.getPrintingSimulationState?.()||simulationState;simulationState=s;
  $('#panel-content').innerHTML=`<h3>Simulasi Printing Test</h3><p class="subtle">${IS_OFFSET10?'Simulasi membuka exterior otomatis dan memperlihatkan feeder, sheet alignment, seluruh cylinder train, AirTransfer, inking, Alcolor dampening, FoilStar pada PU2, tiga coating unit, UV/drying dan X3 delivery. Jalur mekanis adalah visualisasi proses berbasis dokumen, bukan nilai timing atau setelan servis OEM.':'Simulasi menjalankan sheet travel sekaligus mekanisme utama mesin. Kertas mengikuti permukaan impression/transfer cylinder sebagai lembar fleksibel agar tidak menembus roll. Feeder dan register bergerak, gripper melakukan transfer antar-unit, cylinder/gear/roller berputar, distributor tinta berosilasi, tetesan tinta terlihat dari fountain menuju ductor, dampening bekerja, lalu UV curing, inspection dan delivery menyelesaikan alur. Nilai stroke, phase, intensitas UV dan timing adalah visualisasi proses, bukan setelan servis.'}</p><div class="card accent simulation-overview"><div class="simulation-status-row"><span id="sim-status" class="simulation-state">${s.running?'RUNNING':s.active?'PAUSED':'READY'}</span><b id="sim-stage">${esc(s.stage||'Feeder')}</b></div><div class="simulation-progress"><span id="sim-progress-bar" style="width:${Math.round((s.progress||0)*100)}%"></span></div><dl class="data-list compact">${pair('Lembar selesai',s.completed||0)+pair('Lembar bergerak',s.sheetsVisible||0)}<dt>Lembar di pile</dt><dd id="sim-pile">${s.pileSheetsVisible||0}</dd>${pair('Part mekanis aktif',s.mechanismCount||0)+pair('Gerak osilasi',s.oscillatorCount||0)+pair('Jalur tinta / dampening',s.inkFlowCount||0)}<dt>UV curing</dt><dd id="sim-uv-state" class="${s.uvActive?'active':''}">${s.uvActive?'AKTIF':'STANDBY'}</dd><dt>UV lamp visual</dt><dd><span id="sim-uv-count">${s.uvLampCount||0}</span> cassette</dd>${pair('Kecepatan visual',(s.speed||1)+'×')}</dl><div class="actions simulation-actions"><button id="sim-start" class="primary">${s.active?(s.running?'Running':'Lanjutkan'):'Mulai Printing Test'}</button><button id="sim-pause" class="secondary">${s.running?'Pause':'Lanjut'}</button><button id="sim-stop" class="secondary">Stop & Reset</button></div></div><h4>Kecepatan visual</h4><div class="simulation-speed">${[.5,1,1.5,2].map(v=>`<button data-sim-speed="${v}" class="${Math.abs((s.speed||1)-v)<.01?'active':''}">${v}×</button>`).join('')}</div><label class="check"><input id="sim-path" type="checkbox" ${s.pathVisible!==false?'checked':''}> Tampilkan garis jalur kertas</label><label class="check"><input id="sim-ink-flow" type="checkbox" ${s.inkFlowVisible!==false?'checked':''}> Tampilkan aliran tinta & dampening</label><h4>Sistem tinta</h4><div class="simulation-ink-flow">${INK_SIMULATION_SEQUENCE.map((step,index)=>`<div><span>${index+1}</span><b>${esc(step)}</b></div>`).join('')}</div><p class="subtle">Tetesan memanjang menunjukkan cucuran tinta dari fountain menuju ductor/vibrator; jalur tipis berikutnya menunjukkan transfer film tinta antar-roller. Warna unit pada simulasi hanya pembeda visual, bukan urutan warna job aktual.</p><div class="simulation-uv-card"><span id="sim-uv-indicator" aria-hidden="true"></span><div><b>UV Curing System</b><small>Beam menyala otomatis saat sheet berada di bawah cassette dryer.</small></div></div><h4>Alur proses mesin</h4><div class="simulation-flow">${PRINTING_SIMULATION_STAGES.map(stage=>`<div data-sim-stage="${esc(stage)}" class="${stage===s.stage?'active':''}"><span></span><b>${esc(stage)}</b></div>`).join('')}</div><div class="card"><h4>Gerak yang disimulasikan</h4><p>Feeder, register, cylinder train, gripper/transfer, inking, dampening, coating, UV/dryer dan delivery bergerak bersama. Pada Offset 10, FoilStar PU2 dan tiga coating unit ikut divisualisasikan sesuai konfigurasi dokumen. Aliran tinta divisualkan sebagai cucuran fountain → ductor, lalu film menuju roller/distributor → form rollers → plate → blanket → sheet; dampening divisualkan terpisah dari pan/roller ke plate. UV beam aktif hanya ketika sheet melewati dryer. Saat mencapai delivery, gripper melepaskan sheet tepat di atas main pile dan lembar tetap terlihat menumpuk di atas stack yang sudah ada.</p></div>`;
  on('#sim-start',startPrintingSimulation);on('#sim-pause',pausePrintingSimulation);on('#sim-stop',()=>stopPrintingSimulation({restoreExterior:true}));
  document.querySelectorAll('[data-sim-speed]').forEach(b=>b.onclick=()=>{simulationState=engine?.setPrintingSimulationSpeed(+b.dataset.simSpeed)||simulationState;updateSimulationPanel(simulationState);});
  const pathToggle=$('#sim-path');if(pathToggle)pathToggle.onchange=e=>{simulationState=engine?.setPrintingSimulationPathVisible(e.target.checked)||simulationState;updateSimulationPanel(simulationState);};
  const inkToggle=$('#sim-ink-flow');if(inkToggle)inkToggle.onchange=e=>{simulationState=engine?.setPrintingSimulationInkFlowVisible(e.target.checked)||simulationState;updateSimulationPanel(simulationState);};
  updateSimulationPanel(s);

  }
 }else if(tab==='exterior'){
  $('#panel-content').innerHTML=`<h3>Buka Exterior</h3><p class="subtle">Mode ini membuka cover/panel luar agar <b>seluruh interior mesin terlihat</b>. Rangka utama, frame, support, support bridge, tangga, landing, dan struktur penyangga tetap ditampilkan.</p><div class="card accent exterior-overview"><h4>${exteriorMode?'Exterior terbuka · interior terlihat':'Exterior tertutup · tampilan normal'}</h4><p>${exteriorMode?'Cover luar sedang disembunyikan dan detail interior dipaksa tampil penuh. Pilih area di bawah hanya untuk memusatkan kamera; area lain tetap tersedia.':'Tekan Buka Semua Cover untuk melihat cylinder, roller, gripper, drive, dampening, inking, transfer, dan detail internal lain yang sudah dimodelkan.'}</p><div class="actions"><button id="exterior-open" class="primary">Buka Semua Cover</button><button id="exterior-close" class="secondary">Tutup Exterior</button></div></div><h4>Fokus area saat exterior terbuka</h4><div class="exterior-area-list">${EXTERIOR_AREAS.map(area=>`<button data-exterior-area="${esc(area.key)}" class="exterior-area-button ${exteriorFocusKey===area.key?'active':''}"><span><b>${esc(area.name)}</b><small>Interior + frame/support</small></span><span>Fokus ›</span></button>`).join('')}</div><p class="subtle">Mode ini hanya mengubah visibilitas cover dan level detail. Dimensi, posisi, serta geometri frame/support tidak diubah.</p>`;
  on('#exterior-open',showExteriorAll);on('#exterior-close',resetExteriorView);
  document.querySelectorAll('[data-exterior-area]').forEach(b=>b.onclick=()=>focusExteriorArea(b.dataset.exteriorArea));
 }else{
  const ps=photoStats();
  $('#panel-content').innerHTML=`<h3>Referensi</h3><div class="card accent"><h4>${IS_OFFSET10||IS_APM2?TECHNICAL_SOURCES.length+' referensi teknis':ps.unique+' foto mesin tersedia'}</h4><p>${IS_OFFSET10?'Model Offset 10 dibangun dari final drawing, proposal, layout UV, pre-installation, system diagram, technical data final, serta referensi resmi Heidelberg CX 104 dan FoilStar. Tidak ada foto aktual Offset 10 yang digunakan.':IS_APM2?'Identitas APM 2 berasal dari database BMJ. Geometry dan fungsi memakai referensi legacy BOBST SP 102 se-era karena foto aktual dan suffix varian mesin belum tersedia.':'Foto digunakan untuk membantu menyusun bentuk luar dan orientasi mesin. Dokumen mesin digunakan untuk membantu mengenali nama dan fungsi bagian.'}</p><span class="tag">${IS_OFFSET10?'DOKUMEN PROYEK':IS_APM2?'DATABASE BMJ':'FOTO MESIN'}</span><span class="tag">DOKUMEN TEKNIS</span></div>${PHOTO_REGISTRY.length?'<h3>Foto aktual</h3>':''}${PHOTO_REGISTRY.map(p=>`<div class="card source-photo"><h4>${esc(p.filename)}</h4><p>${esc(p.machineZone)} · ${esc(p.viewDirection)}</p></div>`).join('')}<h3>Dokumen mesin</h3>${TECHNICAL_SOURCES.map(src=>`<div class="card"><h4>${esc(src.title)}</h4><p>${esc(src.publisher)}</p>${src.url?`<p><a href="${esc(src.url)}" target="_blank" rel="noopener">Buka dokumen ↗</a></p>`:''}</div>`).join('')}<div class="card"><h4>Arah mesin</h4><p>${esc(ORIENTATION.feedDirection)} · operator side ${esc(ORIENTATION.operatorSide)} · drive side ${esc(ORIENTATION.driveSide)}</p></div><p class="subtle">Jika data ukuran belum tersedia, aplikasi menampilkannya sebagai belum tersedia.</p>`;
 }
}
function renderStatus(){
 const l=activeLayout(),machineCount=$('#machine-count');
 if(machineCount)machineCount.textContent=MACHINE_REGISTRY_STATS.total.toLocaleString('id-ID');
 $('#layout-status').textContent=l?'Denah tersedia':'Denah belum tersedia';
 $('#scale-status').textContent=(IS_APM2||IS_OFFSET10)?'Posisi mesin belum divalidasi':l?.transform?.scale?'Posisi mesin tersedia':'Posisi perlu ditinjau';
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
async function acceptState(next){state=next;engine?.loadLayout(state.layout||bundledLayout);if(engine?.view==='factory')engine.setView('factory',state);renderStatus();renderPanel();if(cacheEnabled){try{await cache.set(apiBase,{state,savedAt:new Date().toISOString()});}catch{toast('Data berhasil dimuat, tetapi salinan di perangkat tidak dapat disimpan.',true);}}}
function setView(view){
 const l=activeLayout();
 if(view==='factory'&&!l){layoutDialog();return;}
 if(view==='factory'&&engine?.isPrintingSimulationActive()){engine.stopPrintingSimulation();simulationState=engine.getPrintingSimulationState();simulationOwnsExterior=false;}if(view==='factory'&&exteriorMode)exitExteriorMode();editing=false;if(engine)engine.onTransform=null;explode=0;selectedPart=null;engine?.setView(view,state);
 $$('.rail>button').forEach(b=>b.classList.remove('active'));
 $('#nav-'+(view==='factory'?'layout':'machine'))?.classList.add('active');
 const machineName=IS_OFFSET10?'OFFSET 10':IS_APM2?'APM 2':'OFFSET 5';
 const machineSubtitle=IS_OFFSET10?'Heidelberg Speedmaster · CX 104 · Full UV + FoilStar':IS_APM2?'BOBST · SP 102 · 1994 · Automatic Flatbed Die Cutter':'OFU-1 · Heidelberg Speedmaster · CD 102-8+L';
 $('#view-kicker').textContent=view==='factory'?'DENAH PABRIK':'TAMPILAN MESIN 3D';
 $('#view-title').textContent=view==='factory'?'Denah Pabrik':machineName;
 $('#view-subtitle').textContent=view==='factory'?'Posisi mesin dan area produksi':machineSubtitle;
 $('#lod-status').textContent=view==='factory'?'Denah siap':'Model siap';
 $('#geometry-caption').textContent=view==='factory'?'Denah Pabrik':'Model '+machineName;
 const title=$('#notice-title'),note=$('#notice-text');
 if(title&&note){
  title.textContent=view==='factory'?'Informasi denah':'Catatan tampilan';
  note.textContent=view==='factory'?'Posisi mesin ditampilkan mengikuti denah yang tersedia. Beberapa tinggi bangunan masih berupa perkiraan visual.':(IS_OFFSET10?'Offset 10 direkonstruksi dari dokumen proyek BMJ dan referensi resmi Heidelberg; foto aktual mesin belum tersedia.':IS_APM2?'APM 2 memakai identitas database BMJ dan referensi legacy BOBST SP 102; suffix mesin dan foto aktual belum tersedia.':'Model dibuat dengan mengacu pada foto aktual dan dokumen mesin yang tersedia.');
 }
 renderPanel();redrawPlantPlan();
}
function connectionDialog(){
 modal('Sambungkan Data',`<p>Gunakan bagian ini jika Anda memiliki akses ke data tersimpan bersama. Untuk sekadar mencoba tampilan 3D, mode lokal sudah dapat digunakan.</p><form id="connection-form"><label for="api-base">Alamat layanan data</label><input id="api-base" type="url" value="${esc(apiBase)}" placeholder="https://alamat-layanan-data" required><label for="api-token">Kunci akses</label><input id="api-token" type="password" autocomplete="off" required><label class="check"><input id="enable-cache" type="checkbox" ${cacheEnabled?'checked':''}> Simpan salinan data di perangkat ini</label><p class="subtle">Gunakan pada perangkat pribadi jika ingin membuka data lebih cepat saat koneksi tidak stabil.</p><div class="actions"><button type="submit" class="primary">Sambungkan</button><button type="button" id="disconnect" class="secondary">Gunakan Mode Lokal</button></div><p id="connection-error" class="inline-error" role="alert"></p></form>`);
 $('#connection-form').onsubmit=async e=>{e.preventDefault();const submit=e.target.querySelector('[type=submit]');submit.disabled=true;try{const url=new URL($('#api-base').value.trim());if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(url.hostname))throw new Error('Alamat layanan harus menggunakan koneksi aman.');if(url.username||url.password||url.search||url.hash||url.pathname!=='/')throw new Error('Masukkan alamat utama layanan data.');const base=url.origin,key=$('#api-token').value,session=await request('/api/session',{base,key});const next=await request('/api/state',{base,key});apiBase=base;token=key;role=session.role;cacheEnabled=$('#enable-cache').checked;localStorage.setItem('offset5-api-base',base);localStorage.setItem('offset5-cache-enabled',cacheEnabled?'1':'0');if(!cacheEnabled)await cache.clear();await acceptState(next);$('#connection').textContent=role==='admin'?'Data tersambung · Pengaturan':'Data tersambung';closeModal();toast('Data berhasil disambungkan.');}catch(err){$('#connection-error').textContent=err.message;}finally{submit.disabled=false;}};
 on('#disconnect',async()=>{token='';role=null;await cache.clear();cacheEnabled=false;localStorage.removeItem('offset5-cache-enabled');state=structuredClone(initialState);engine?.loadLayout(bundledLayout);setView('machine');renderStatus();$('#connection').textContent='Mode lokal';closeModal();toast('Mode lokal aktif.');});
}
function layoutDialog(){
 const l=activeLayout();
 const adminTools=role==='admin'?`<h3>Pengaturan denah</h3><p class="subtle">Gunakan hanya jika Anda perlu mengganti atau menyimpan penyesuaian posisi.</p><label for="layout-file">Pilih file pengaturan denah</label><input id="layout-file" type="file" accept=".json,application/json"><div class="actions"><button id="mapping" class="secondary">Atur Denah</button></div><p id="layout-error" class="inline-error" role="alert"></p>`:'';
 modal('Denah Pabrik',`<div class="card accent"><h4>${l?'Denah tersedia':'Denah belum tersedia'}</h4><p>${l?'Posisi mesin dan area pabrik dapat dibuka pada tampilan denah.':'Belum ada denah yang dapat ditampilkan.'}</p></div>${l?`<dl class="data-list">${pair('Nama denah',l.source.file)+pair('Posisi '+(IS_OFFSET10?'OFFSET 10':IS_APM2?'APM 2':'OFFSET 5'),(IS_OFFSET10||IS_APM2)?'Belum divalidasi pada denah':(l.positionStatus?'Tersedia':'Perlu ditinjau'))+pair('Area yang dikenali',Array.isArray(l.functionalZones)?l.functionalZones.length+' area':'Belum tersedia')}</dl><div class="actions"><button id="view-layout" class="primary">Buka Denah</button></div>`:''}${adminTools}`);
 if(l)on('#view-layout',()=>{closeModal();setView('factory');});
 if(role==='admin')on('#mapping',mappingDialog);
 const input=$('#layout-file');
 if(input)input.onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>4*1024*1024)throw new Error('Ukuran file terlalu besar.');const layout=validateLayout(JSON.parse(await f.text()));const next=await request('/api/layout',{method:'PUT',data:layout});await acceptState(next);closeModal();setView('factory');toast('Denah berhasil diperbarui.');}catch(err){$('#layout-error').textContent=err.message;}};
}
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
 $('#panel-content').innerHTML=`<h3>Atur posisi mesin</h3><div class="edit-strip">${['translate','rotate','scale'].map((m,i)=>`<button data-gizmo="${m}" class="${i?'':'active'}">${['Geser','Putar','Skala'][i]}</button>`).join('')}</div><p class="subtle">Seret kontrol pada mesin atau isi angka untuk menyesuaikan posisi.</p><form id="position-form"><div class="form-row">${['x','y','z'].map(k=>`<div><label for="pos-${k}">Posisi ${k.toUpperCase()}</label><input id="pos-${k}" type="number" step="any" required></div>`).join('')}</div><div class="form-row"><div><label for="pos-rotation">Rotasi (°)</label><input id="pos-rotation" type="number" step="any" required></div><div><label for="pos-scale">Skala tampilan</label><input id="pos-scale" type="number" min="0.00001" step="any" required></div></div><label class="check"><input id="snap" type="checkbox"> Gunakan langkah posisi tetap</label><p class="code" id="cad-coordinates"></p><label for="position-confidence">Status posisi</label><select id="position-confidence"><option value="APPROXIMATE">Perkiraan</option><option value="USER-CONFIRMED">Dikonfirmasi</option></select><div class="actions"><button type="submit" class="primary">Simpan Posisi</button><button type="button" id="cancel-position" class="secondary">Batal</button><button type="button" id="reset-position" class="secondary">Kembalikan</button></div><p id="position-error" class="inline-error" role="alert"></p></form>`;
 const sync=()=>{for(const k of ['x','y','z'])$('#pos-'+k).value=engine.machine.position[k].toFixed(4);$('#pos-rotation').value=(engine.machine.rotation.y*180/Math.PI).toFixed(3);$('#pos-scale').value=engine.machine.scale.x.toFixed(4);const pos=worldToCad(engine.machine.position.x,engine.machine.position.z,state.layout.transform);$('#cad-coordinates').textContent=`Posisi denah: X ${number(pos.x)} · Y ${number(pos.y)}`;};
 engine.onTransform=sync;sync();
 $$('[data-gizmo]').forEach(b=>b.onclick=()=>{engine.gizmo.setMode(b.dataset.gizmo);engine.gizmo.showX=b.dataset.gizmo!=='rotate';engine.gizmo.showY=b.dataset.gizmo!=='scale';engine.gizmo.showZ=b.dataset.gizmo==='translate';$$('[data-gizmo]').forEach(c=>c.classList.toggle('active',b===c));});
 $('#snap').onchange=e=>{engine.gizmo.setTranslationSnap(e.target.checked?1:null);engine.gizmo.setRotationSnap(e.target.checked?Math.PI/12:null);engine.gizmo.setScaleSnap(e.target.checked?.1:null);};
 $$('[id^="pos-"]').forEach(el=>el.onchange=()=>{const vals=['x','y','z','rotation','scale'].map(k=>+$('#pos-'+k).value);if(vals.every(Number.isFinite)&&vals[4]>0){engine.machine.position.set(...vals.slice(0,3));engine.machine.rotation.set(0,vals[3]*Math.PI/180,0);engine.machine.scale.setScalar(vals[4]);sync();}});
 const end=()=>{engine.edit(false);engine.onTransform=null;editing=false;engine.applyPlacement(state);renderPanel();};
 on('#cancel-position',end);
 on('#reset-position',async()=>{await acceptState(await request('/api/position',{method:'DELETE'}));end();toast('Posisi dikembalikan.');});
 $('#position-form').onsubmit=async e=>{e.preventDefault();try{const p=Object.fromEntries(['x','y','z','rotation','scale'].map(k=>[k,+$('#pos-'+k).value]));p.confidence=$('#position-confidence').value;validatePosition(p);await acceptState(await request('/api/position',{method:'PUT',data:p}));end();toast('Posisi berhasil disimpan.');}catch(err){$('#position-error').textContent=err.message;}};
}
function machineDetailDialog(machine){
 const status=machine.has3D?'Model 3D tersedia':'Terdaftar di database · model 3D belum dibuat';
 modal(machine.name,`<div class="card accent"><h4>${esc(status)}</h4><p>${machine.has3D?'Buka tampilan 3D untuk eksplorasi detail mesin.':'Record master sudah tersedia. Posisi dan geometry 3D tidak akan dibuat sebelum data referensi tersedia.'}</p></div><dl class="data-list">${pair('Machine ID',machine.machineId)+pair('Area',machine.area)+pair('Model',machine.model)+pair('Serial Number',machine.serial)+pair('SAP Functional Location',machine.functionalLocation)+pair('SAP Code',machine.sapCode)+pair('Tahun',machine.year)+pair('Sumber',machine.source==='USER_CONFIRMED'?'Konfirmasi pengguna':'Database mesin')}</dl>${machine.note?`<div class="card"><h4>Catatan data</h4><p>${esc(machine.note)}</p></div>`:''}${machine.has3D?'<div class="actions"><button id="open-machine-3d" class="primary">Buka Model 3D</button></div>':''}`);
 if(machine.has3D)on('#open-machine-3d',()=>{const route=machine.machineId==='BMJ-MCH-0009'?'offset10':machine.machineId==='BMJ-MCH-0010'?'apm2':machine.machineId==='BMJ-MCH-0003'?'offset5':machine.machineId;if(route!==MACHINE_KEY){location.href=`./?machine=${encodeURIComponent(route)}&v=55`;return;}closeModal();setView('machine');showPanel();renderPanel('overview');});
}
function assetDialog(){
 modal('Daftar Mesin',`<div class="card accent"><h4>${MACHINE_REGISTRY_STATS.total} equipment terdaftar</h4><p>OFFSET PRINTING ${MACHINE_REGISTRY_STATS.byArea['OFFSET PRINTING']} · OFFSET CONVERTING ${MACHINE_REGISTRY_STATS.byArea['OFFSET CONVERTING']} · PDS ${MACHINE_REGISTRY_STATS.byArea.PDS} · UTILITY ${MACHINE_REGISTRY_STATS.byArea.UTILITY}</p></div><label for="asset-search">Cari nama, SAP Code, Functional Location, model, atau serial</label><input id="asset-search" type="search" placeholder="Contoh: OFFSET 10, APM-7, AHU 5…"><div id="asset-results"></div><p class="subtle" style="margin-top:18px">Seluruh equipment memiliki route model 3D. Mesin dengan model atau varian yang belum tercatat memakai rekonstruksi parametrik tingkat keluarga dan ditandai sesuai tingkat keyakinannya.</p>`);
 const render=()=>{
   const found=searchMachines($('#asset-search').value).slice(0,60);
   $('#asset-results').innerHTML=found.length?found.map(machine=>`<button data-machine-id="${machine.machineId}" class="list-button"><span class="asset-icon">${String(machine.no).padStart(2,'0')}</span><span><strong>${esc(machine.name)}</strong><small>${esc(machine.area)} · ${esc(machine.sapCode||'SAP Code belum tersedia')} · ${esc(machine.model||'Model belum tersedia')}${machine.has3D?' · 3D tersedia':''}</small></span></button>`).join(''):'<p class="empty">Tidak ada mesin yang sesuai.</p>';
   document.querySelectorAll('[data-machine-id]').forEach(button=>button.onclick=()=>{const machine=MACHINE_REGISTRY_BY_ID.get(button.dataset.machineId);if(machine)machineDetailDialog(machine);});
 };
 $('#asset-search').oninput=render;render();
}
function settingsDialog(){
 modal('Pengaturan Tampilan',`<label class="check"><input id="low-mode" type="checkbox" ${engine?.low?'checked':''} ${exteriorMode?'disabled':''}> Mode ringan untuk perangkat dengan performa terbatas</label>${exteriorMode?'<p class="subtle">Mode ringan sementara dinonaktifkan saat exterior terbuka agar seluruh detail interior tetap terlihat.</p>':''}<label class="check"><input id="label-mode" type="checkbox" ${engine?.labels?'checked':''}> Tampilkan label mesin</label><h3>Data di perangkat</h3><p>${cacheEnabled?'Salinan data di perangkat aktif.':'Salinan data di perangkat tidak aktif.'}</p><button id="clear-cache" class="secondary">Bersihkan Data Tersimpan</button>`);
 $('#low-mode').onchange=e=>{engine?.setLow(e.target.checked);localStorage.setItem('offset5-low',e.target.checked?'1':'0');};
 $('#label-mode').onchange=e=>{if(engine)engine.labels=e.target.checked;$('#labels').classList.toggle('active',e.target.checked);};
 on('#clear-cache',async()=>{await cache.clear();toast('Data tersimpan di perangkat sudah dibersihkan.');});
}
function helpDialog(){
 modal('Panduan Penggunaan',`<h3>Navigasi 3D</h3><p>Seret untuk memutar mesin. Cubit atau scroll untuk memperbesar dan memperkecil. Gunakan tombol Atas, Fokus, Geser, dan Reset untuk berpindah tampilan dengan cepat.</p><h3>Melihat struktur mesin</h3><p>Klik bagian mesin atau buka menu Struktur Mesin. Label pada objek 3D dapat diklik untuk turun ke tingkat berikutnya sampai 6 tingkat. Gunakan tombol Naik pada label untuk kembali ke induknya, lalu gunakan Urai atau Tampilkan Sendiri bila perlu.</p><h3>Buka Exterior</h3><p>Gunakan menu Exterior lalu pilih Buka Semua Cover untuk melihat interior mesin sambil mempertahankan support mekanis yang dibutuhkan.</p><h3>Simulasi Proses</h3><p>Buka tab Simulasi. Pada mesin printing, simulasi memperlihatkan sheet travel dan sistem tinta/UV. Pada APM 2, simulasi memperlihatkan feeder, register/SideLay, gripper chain, die-cutting platen, stripping dan delivery.</p><h3>Panel informasi</h3><p>Filter, Denah Mini, Catatan, Detail Mesin, dan Panel Info dapat ditutup kapan saja. Gunakan tombol Panel untuk menampilkannya kembali.</p><h3>Data yang tersedia</h3><p>Offset 5 mengacu pada foto aktual dan dokumen mesin. Offset 10 mengacu pada final drawing/dokumen proyek BMJ serta referensi resmi Heidelberg. APM 2 memakai identitas database BMJ dan referensi legacy BOBST SP 102 karena foto aktual serta suffix variannya belum tersedia. Informasi yang belum didukung sumber tetap ditandai sebagai belum tersedia atau rekonstruksi visual.</p>`);
}
renderPanel();renderStatus();const taxCount=$('#taxonomy-count');if(taxCount)taxCount.textContent=taxonomyStats().total.toLocaleString('id-ID');if(matchMedia('(max-width:800px)').matches)document.body.classList.add('panel-hidden');
try{engine=new FactoryEngine($('#viewport'),part=>{const meta=taxonomyForPart(part);if(meta)selectedTaxonomyId=meta.id;choosePart(part);showPanel();renderPanel('structure');});engine.onTaxonomySelect=id=>selectTaxonomy(id,{revealPanel:false});engine.onSimulationUpdate=next=>{simulationState=next;updateSimulationPanel(next);};simulationState=engine.getPrintingSimulationState();engine.onReset=()=>{explode=0;selectedPart=null;selectedTaxonomyId=ACTIVE_ROOT;renderPanel();};engine.onError=message=>toast(message,true);$('#boot').hidden=true;$('#engine-status').textContent='Tampilan 3D siap';try{engine.setLow(localStorage.getItem('offset5-low')==='1'||matchMedia('(max-width:767px)').matches||matchMedia('(pointer:coarse) and (max-width:1024px)').matches);}catch{}}catch(e){renderStaticMachineFallback(e);}
try{bundledLayout=await loadBundledPlantLayout();if(!state.layout)engine?.loadLayout(bundledLayout);renderStatus();redrawPlantPlan();if(engine)setView('machine');}catch(e){toast('Denah pabrik gagal dimuat.',true);}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{if(editing){engine.edit(false);engine.applyPlacement(state);engine.onTransform=null;editing=false;}renderPanel(b.dataset.tab);});
on('#modal-close',closeModal);on('#connect',connectionDialog);on('#nav-machine',()=>setView('machine'));on('#nav-layout',()=>activeLayout()?setView('factory'):layoutDialog());on('#notice-details',layoutDialog);on('#nav-assets',assetDialog);on('#nav-sources',()=>{showPanel();renderPanel('sources');});on('#nav-help',helpDialog);on('#settings',settingsDialog);on('#close-panel',()=>document.body.classList.add('panel-hidden'));on('#focus-machine',()=>{if(!engine?.machine.visible)setView('machine');engine?.fit(engine.machine);});on('#edit-position',editorPanel);
$$('[data-camera]').forEach(b=>b.onclick=()=>{if(!engine)return;const mode=b.dataset.camera;$$('[data-camera]').forEach(c=>c.classList.toggle('active',c===b));const target=engine.view==='factory'?engine.factory:engine.machine;if(mode==='reset'){explode=0;selectedPart=null;engine.isolated=false;engine.template.reset();engine.clearPartLabels();renderPanel();engine.fit(target,'iso');}else engine.fit(target,mode==='top'?'top':'iso');});
on('#tool-pan',()=>{if(!engine)return;engine.controls.enablePan=!engine.controls.enablePan;$('#tool-pan').classList.toggle('active',engine.controls.enablePan);toast(engine.controls.enablePan?'Mode pan aktif · gunakan dua jari / klik kanan':'Mode pan nonaktif');});
on('#tool-explode',()=>{if(simulationLocksStructure())return;showPanel();selectedTaxonomyId=selectedTaxonomyId||ACTIVE_ROOT;renderPanel('structure');explode=explode>.01?0:.65;engine?.template.explode(explode,selectedPart);renderPanel('structure');});
on('#tool-isolate',()=>{if(simulationLocksStructure())return;if(!engine||!selectedPart){showPanel();renderPanel('structure');toast('Pilih bagian mesin terlebih dahulu.',true);return;}engine.isolated=!engine.isolated;engine.template.isolate(selectedPart,engine.isolated);$('#tool-isolate').classList.toggle('active',engine.isolated);});
on('#tool-simulation',()=>{showPanel();renderPanel('simulation');});
on('#labels',()=>{if(engine){engine.labels=!engine.labels;$('#labels').classList.toggle('active',engine.labels);}});on('#fullscreen',async()=>{if(!document.fullscreenEnabled){toast('Layar penuh tidak didukung browser ini.');return;}if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();});
window.addEventListener('offline',()=>{$('#connection').textContent='Mode lokal';toast('Koneksi data terputus. Aplikasi tetap dapat digunakan secara lokal.');});window.addEventListener('online',()=>{$('#connection').textContent=role?'Data tersambung':'Mode lokal';if(role)request('/api/state').then(acceptState).then(()=>{$('#connection').textContent='Data tersambung';toast('Data berhasil diperbarui.');}).catch(e=>toast(e.message,true));});
try{const config=await fetch('./config.json').then(r=>r.json());apiBase=localStorage.getItem('offset5-api-base')||config.apiBase||'';if(cacheEnabled&&apiBase){const cached=await cache.get(apiBase);if(cached?.state){state=cached.state;engine?.loadLayout(state.layout||bundledLayout);renderStatus();renderPanel();$('#connection').textContent='Data perangkat · '+new Date(cached.savedAt).toLocaleDateString('id-ID');}}}catch(e){toast('Data tersimpan tidak dapat dibaca. Mode lokal tetap tersedia.',true);}
window.addEventListener('resize',redrawPlantPlan,{passive:true});$('#ui-workbench-toggle')?.addEventListener('click',()=>setTimeout(redrawPlantPlan,80));$$('[data-workbench="dwg"]').forEach(b=>b.addEventListener('click',()=>setTimeout(redrawPlantPlan,40)));if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
window.addEventListener('pagehide',()=>{token='';});
