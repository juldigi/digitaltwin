import * as THREE from 'three';
import {FactoryEngine} from './engine.js';
import {loadBundledPlantLayout} from './data/plant-layout-data.js';
import {loadFactoryFleet} from './factory-building.js';
import {getState} from './state/app-state.js';
import {MACHINE_REGISTRY} from './data/machine-registry.js';

const OMODOS_ORIGIN='https://omodos.juldigi.workers.dev';
const TYPE_INIT='OMODOS_FACTORY_MONITOR_INIT';
const TYPE_REVOKE='OMODOS_FACTORY_MONITOR_REVOKE';
const TYPE_STATUS_REQUEST='OMODOS_FACTORY_MONITOR_STATUS_REQUEST';
const gate=document.getElementById('monitor-gate');
const app=document.getElementById('monitor-app');
const viewport=document.getElementById('factory-viewport');
const labels=document.getElementById('machine-label-layer');
const loading=document.getElementById('loading-state');
const errorBox=document.getElementById('viewer-error');
const normalize=value=>String(value??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
const registryById=new Map(MACHINE_REGISTRY.map(row=>[row.machineId,row]));
const STATUS_RANK={kritikal:4,perhatian:3,normal:2,none:1,unknown:0};
let authorized=false,starting=false,engine=null,layout=null,fleet=[],records=[],renderToken=0,lastLabelPaint=0;
let mode='iso',quality='auto';
const statusSummary={total:0,critical:0,attention:0,normal:0,unknown:0};

function setGateMessage(message){
 const hint=gate?.querySelector('.gate-hint');
 if(hint)hint.textContent=message;
}
function rejectAccess(){
 authorized=false;
 records=[];
 renderToken++;
 if(engine){
  try{cancelAnimationFrame(engine.frame);engine.resizeObserver?.disconnect();engine.renderer?.dispose();}catch{}
  engine=null;
 }
 if(viewport){viewport.querySelectorAll('canvas').forEach(node=>node.remove());}
 if(labels)labels.replaceChildren();
 if(app)app.hidden=true;
 if(gate)gate.hidden=false;
 setGateMessage('Akses hanya tersedia melalui sesi Superadmin OMODOS.');
 starting=false;
}
function sanitizeRecords(value){
 if(!Array.isArray(value))return [];
 return value.slice(0,250).map(row=>{
  if(!row||typeof row!=='object')return null;
  const key=['kritikal','perhatian','normal','none'].includes(String(row.key))?String(row.key):'none';
  return {
   code:String(row.code||'').slice(0,80),
   name:String(row.name||'').slice(0,140),
   key,
   statusLabel:String(row.statusLabel||'Belum Ada Data').slice(0,60),
   sourceLabel:String(row.sourceLabel||'').slice(0,40),
   updatedAt:row.updatedAt?String(row.updatedAt).slice(0,40):'',
   description:String(row.description||'').slice(0,350)
  };
 }).filter(Boolean);
}
function acceptStatusMessage(event){
 if(event.origin!==OMODOS_ORIGIN||event.source!==window.parent)return;
 if(event.data?.type===TYPE_REVOKE){
  rejectAccess();
  return;
 }
 if(event.data?.type===TYPE_STATUS_REQUEST){
  if(authorized)window.parent.postMessage({type:TYPE_INIT,authorized:true,role:'Superadmin',statuses:records},OMODOS_ORIGIN);
  return;
 }
 if(event.data?.type!==TYPE_INIT||event.data?.authorized!==true||event.data?.role!=='Superadmin')return;
 records=sanitizeRecords(event.data.statuses);
 if(authorized&&!app.hidden&&engine){renderSummary();paintLabels(true);return;}
 authorized=true;
 if(gate)gate.hidden=true;
 if(app)app.hidden=false;
 void boot();
}
window.addEventListener('message',acceptStatusMessage);
if(window.parent!==window){
 window.parent.postMessage({type:TYPE_STATUS_REQUEST},OMODOS_ORIGIN);
}

function statusForMachine(machineId){
 const machine=registryById.get(machineId)||{};
 const statusRecords=records.map(row=>({row,score:0}));
 const targetCode=normalize(machine.sapCode||'');
 const targetNames=[machine.name,machine.codename,machine.model,machine.functionalLocation].map(normalize).filter(Boolean);
 const candidates=statusRecords.map(item=>{
  const code=normalize(item.row.code);
  const name=normalize(item.row.name).replace(/\\b0+(\\d+)\\b/g,'$1');
  let codeScore=targetCode&&code===targetCode?100:0;
  let nameScore=0;
  if(name&&targetNames.some(target=>target.replace(/\\b0+(\\d+)\\b/g,'$1')===name))nameScore=95;
  for(const rawTarget of targetNames){
   const target=rawTarget.replace(/\\b0+(\\d+)\\b/g,'$1');
   if(!target||!name)continue;
   const targetTokens=new Set(target.split(' ').filter(t=>t.length>1));
   const tokens=name.split(' ').filter(t=>t.length>1);
   const shared=tokens.filter(t=>targetTokens.has(t)).length;
   if(shared)nameScore=Math.max(nameScore,Math.round(75*shared/Math.max(1,tokens.length)));
   if(name.includes(target)||target.includes(name))nameScore=Math.max(nameScore,80);
  }
  return {...item,score:codeScore+nameScore};
 }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||a.row.name.localeCompare(b.row.name,'id'));
 if(!candidates.length)return {key:'none',statusLabel:'Belum ada data',sourceLabel:'Belum ada sumber',updatedAt:'',code:machine.sapCode||'',name:machine.name||machineId};
 const first=candidates[0],second=candidates[1];
 // Duplicate SAP codes are disambiguated by model/name similarity. If identity still ties,
 // do not assert another machine's status.
 if(second&&first.score===second.score&&normalize(first.row.name)!==normalize(second.row.name)){
  return {key:'none',statusLabel:'Perlu pemetaan',sourceLabel:'Identitas belum cocok',updatedAt:'',code:first.row.code||machine.sapCode||'',name:machine.name||machineId};
 }
 return {...first.row};
}
function machineRows(){
 const actual=engine?.actualFactory;
 if(!actual?.assets)return [];
 const fleetById=new Map((fleet||[]).map(row=>[row?.placement?.machineId,row]));
 const rows=[];
 for(const [machineId,object] of actual.assets){
  const record=registryById.get(machineId)||{};
  const placement=fleetById.get(machineId)?.placement;
  const status=statusForMachine(machineId);
  rows.push({machineId,object,record,status,label:placement?.label||record.sapCode||record.codename||record.name||machineId});
 }
 return rows;
}
function renderSummary(){
 const rows=machineRows();
 const tally={total:rows.length,critical:0,attention:0,normal:0,unknown:0};
 for(const item of rows){
  if(item.status.key==='kritikal')tally.critical++;
  else if(item.status.key==='perhatian')tally.attention++;
  else if(item.status.key==='normal')tally.normal++;
  else tally.unknown++;
 }
 Object.assign(statusSummary,tally);
 for(const [id,value] of [['summary-total',tally.total],['summary-critical',tally.critical],['summary-attention',tally.attention],['summary-normal',tally.normal],['summary-unknown',tally.unknown]]){
  const el=document.getElementById(id);if(el)el.textContent=String(value);
 }
 const times=records.map(r=>Date.parse(r.updatedAt||'')).filter(Number.isFinite);
 const newest=times.length?Math.max(...times):null;
 const updated=document.getElementById('updated-at');
 if(updated)updated.textContent=newest?('Data status diperbarui '+new Date(newest).toLocaleString('id-ID',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})):'Waktu status tidak tersedia';
}
function cardClass(key){return key==='kritikal'?'critical':key==='perhatian'?'attention':key==='normal'?'normal':'unknown';}
function overlaps(a,b,pad=3){return a.left<b.right+pad&&a.right>b.left-pad&&a.top<b.bottom+pad&&a.bottom>b.top-pad;}
function candidateOffsets(){
 return [[0,-8],[0,-30],[0,-52],[-48,-12],[48,-12],[-70,-28],[70,-28],[0,16],[-94,8],[94,8],[-40,-72],[40,-72],[-118,-36],[118,-36],[-92,-66],[92,-66],[0,-90]];
}
function projectMachine(object,viewportRect){
 object.updateWorldMatrix?.(true,true);
 const bounds=new THREE.Box3().setFromObject(object);
 if(bounds.isEmpty())return null;
 const point=bounds.getCenter(new THREE.Vector3());
 point.y=bounds.max.y+Math.max(.15,(bounds.max.y-bounds.min.y)*.04);
 point.project(engine.camera);
 if(point.z < -1 || point.z > 1 || Math.abs(point.x)>1.08 || Math.abs(point.y)>1.08)return null;
 return {x:(point.x*.5+.5)*viewportRect.width,y:(-.5*point.y+.5)*viewportRect.height};
}
function paintLabels(force=false){
 if(!authorized||!engine||!labels||app.hidden)return;
 const now=performance.now();if(!force&&now-lastLabelPaint<130)return;lastLabelPaint=now;
 const rect=viewport.getBoundingClientRect();if(rect.width<2||rect.height<2)return;
 const narrow=matchMedia('(max-width:700px)').matches;
 const rows=machineRows().sort((a,b)=>(STATUS_RANK[b.status.key]||0)-(STATUS_RANK[a.status.key]||0)||a.label.localeCompare(b.label,'id'));
 const existing=new Map([...labels.children].map(el=>[el.dataset.machineId,el]));
 const placed=[];
 for(const item of rows){
  let card=existing.get(item.machineId);
  if(!card){
   card=document.createElement('div');card.className='machine-status-card';card.dataset.machineId=item.machineId;
   const name=document.createElement('span');name.className='machine-name';
   const status=document.createElement('span');status.className='machine-status';
   card.append(name,status);labels.append(card);
  }
  existing.delete(item.machineId);
  card.className='machine-status-card '+cardClass(item.status.key);
  const nameEl=card.querySelector('.machine-name'),statusEl=card.querySelector('.machine-status');
  nameEl.textContent=item.label;
  statusEl.textContent=item.status.statusLabel||'Belum ada data';
  card.title=[item.record?.name||item.record?.code||item.record?.description,item.status.sourceLabel,item.status.description].filter(Boolean).join(' · ');
  const p=projectMachine(item.object,rect);
  if(!p){card.hidden=true;continue;}
  card.hidden=false;
  const measured=card.getBoundingClientRect(),w=narrow?Math.max(47,measured.width):Math.max(82,measured.width),h=narrow?20:31;
  const offsets=candidateOffsets();
  let chosen=null;
  for(const [dx,dy] of offsets){
   const x=Math.max(w/2+2,Math.min(rect.width-w/2-2,p.x+dx));
   const y=Math.max(h+3,Math.min(rect.height-26,p.y+dy));
   const box={left:x-w/2,right:x+w/2,top:y-h,bottom:y};
   if(!placed.some(prior=>overlaps(box,prior,narrow?1:3))){chosen={x,y,box};break;}
  }
  if(!chosen){
   // Use compact anchoring as the fallback; all cards remain represented and follow the machines.
   const x=Math.max(w/2+2,Math.min(rect.width-w/2-2,p.x));
   const y=Math.max(h+3,Math.min(rect.height-26,p.y-8));
   chosen={x,y,box:{left:x-w/2,right:x+w/2,top:y-h,bottom:y}};
  }
  placed.push(chosen.box);card.style.left=chosen.x+'px';card.style.top=chosen.y+'px';
 }
 for(const card of existing.values())card.remove();
}
function syncLayers(){
 const settings={building:false,ipal:true,floor:true,walls:false,doors:false,windows:false,airCurtain:false,furniture:false,roof:false,machines:true,labels:false,landscape:true,reference:false,unidentified:false,compressedAir:false,ahuPiping:false,ducting:false,utilityAnchors:false};
 for(const [key,value] of Object.entries(settings))engine?.setFactoryLayer(key,value);
}
async function boot(){
 if(!authorized||starting||engine)return;
 starting=true;
 try{
  loading.hidden=false;errorBox.hidden=true;
  layout=await loadBundledPlantLayout();
  fleet=await loadFactoryFleet();
  if(!authorized)return;
  layout.fleet=fleet;
  quality=(matchMedia('(max-width:767px)').matches||matchMedia('(pointer:coarse)').matches)?'hemat':'auto';
  engine=new FactoryEngine(viewport,()=>{});
  engine.onFactorySelect=()=>{}; // The monitor has no machine-detail navigation.
  engine.onError=message=>showError(message||'Model 3D tidak berhasil dimuat.');
  engine.onRecovered=()=>{if(authorized){loading.hidden=true;renderSummary();paintLabels(true);}};
  engine.setQualityProfile(quality);
  engine.loadLayout(layout);
  // Keep DigitalTwin's existing distant-view machine assets, but cancel the
  // interactive/detail-model hydration used by the full engineering viewer.
  // This Superadmin monitor is intentionally static and has no machine-detail route.
  engine.factoryDetailHydration++;
  syncLayers();
  engine.setView('factory',getState());
  engine.fit(engine.factory,mode,false);
  loading.hidden=true;
  renderSummary();paintLabels(true);
  const token=++renderToken;
  const draw=()=>{
   if(!authorized||token!==renderToken||!engine)return;
   paintLabels();
   requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
  if(window.parent!==window)window.parent.postMessage({type:TYPE_STATUS_REQUEST},OMODOS_ORIGIN);
 }catch(error){
  showError(error instanceof Error?error.message:'Model 3D tidak berhasil dimuat.');
 }finally{starting=false;}
}
function showError(message){
 if(loading)loading.hidden=true;
 if(errorBox){errorBox.hidden=false;errorBox.textContent='Tampilan 3D belum berhasil dimuat. '+String(message||'Periksa koneksi lalu coba buka kembali OMODOS.').slice(0,300);}
}
document.getElementById('camera-iso')?.addEventListener('click',()=>{
 if(!authorized||!engine)return;mode='iso';engine.fit(engine.factory,'iso',false);
 document.getElementById('camera-iso')?.classList.add('active');document.getElementById('camera-iso')?.setAttribute('aria-pressed','true');
 document.getElementById('camera-top')?.classList.remove('active');document.getElementById('camera-top')?.setAttribute('aria-pressed','false');
 paintLabels(true);
});
document.getElementById('camera-top')?.addEventListener('click',()=>{
 if(!authorized||!engine)return;mode='top';engine.fit(engine.factory,'top',false);
 document.getElementById('camera-top')?.classList.add('active');document.getElementById('camera-top')?.setAttribute('aria-pressed','true');
 document.getElementById('camera-iso')?.classList.remove('active');document.getElementById('camera-iso')?.setAttribute('aria-pressed','false');
 paintLabels(true);
});
document.getElementById('camera-fit')?.addEventListener('click',()=>{
 if(!authorized||!engine)return;engine.fit(engine.factory,mode,false);paintLabels(true);
});
window.addEventListener('resize',()=>paintLabels(true),{passive:true});
window.addEventListener('pagehide',()=>{authorized=false;renderToken++;});

