import * as THREE from 'three';
import {FactoryEngine} from './engine.js';
import {loadBundledPlantLayout} from './data/plant-layout-data.js';
import {loadFactoryFleet} from './factory-building.js';
import {MACHINE_REGISTRY,MACHINE_REGISTRY_BY_ID} from './data/machine-registry.js';
import {mapOmodosMachineStatus} from './omodos-status-map.js';

const TRUSTED_PARENT_ORIGIN='https://omodos.juldigi.workers.dev';
const STATUS_MESSAGE='BMJ_OMODOS_MACHINE_STATUS_V1';
const viewport=document.getElementById('viewport');
const statusLayer=document.getElementById('machine-status-layer');
const leaders=document.getElementById('machine-status-leaders');
const syncText=document.getElementById('lite-sync-state');
const loading=document.getElementById('lite-loading');
const engine=new FactoryEngine(viewport,()=>{});
// This scene is a read-only overview: selecting any object never opens a technical panel.
engine.onFactorySelect=()=>{};
engine.onTaxonomySelect=()=>{};
engine.onError=message=>{syncText.textContent=String(message||'Tampilan 3D perlu dimuat ulang.');};
engine.onRecovered=()=>{syncText.textContent='Tampilan 3D pulih.';};

let layout=null;
let fleet=[];
let incomingStatuses=[];
let lastStatusSync=0;
let lastProjection=0;
let cardSignature='';
const cards=new Map();
const registryById=MACHINE_REGISTRY_BY_ID;
const placementById=new Map();
const codeCount=new Map();
for(const machine of MACHINE_REGISTRY){
  const code=normalizeCode(machine.sapCode);
  if(code)codeCount.set(code,(codeCount.get(code)||0)+1);
}
function normalizeCode(value){return String(value??'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'');}
function safeText(value,fallback='-'){const text=String(value??'').replace(/\s+/g,' ').trim();return text||fallback;}
function statusClass(key){
  const value=String(key||'').trim().toLowerCase();
  return ['kritikal','perhatian','normal','none'].includes(value)?value:'unlinked';
}
function statusShort(key,label){
  const k=statusClass(key);
  if(k==='kritikal')return 'Kritis';
  if(k==='perhatian')return 'Perhatian';
  if(k==='normal')return 'Normal';
  if(k==='none')return 'Belum ada';
  return label||'Belum tertaut';
}
function createCard(id,object){
  const machine=registryById.get(id)||null;
  const placement=placementById.get(id)||null;
  const name=safeText(placement?.label||machine?.name||object?.name||id,'Mesin');
  const code=safeText(machine?.sapCode||id,'-');
  const card=document.createElement('div');
  card.className='machine-status-card status-unlinked';
  card.dataset.machineId=id;
  card.setAttribute('role','img');
  card.setAttribute('aria-label',name+' · status belum terhubung');
  const dot=document.createElement('span');dot.className='status-dot';
  const copy=document.createElement('span');copy.className='status-copy';
  const title=document.createElement('span');title.className='status-name';title.textContent=name;
  const codeLine=document.createElement('span');codeLine.className='status-code';codeLine.textContent=code;
  copy.append(title,codeLine);
  const state=document.createElement('span');state.className='status-state';state.textContent='Belum tertaut';
  card.append(dot,copy,state);statusLayer.appendChild(card);
  const line=document.createElementNS('http://www.w3.org/2000/svg','line');
  line.setAttribute('stroke','rgba(33,62,79,.58)');line.setAttribute('stroke-width','1');
  line.setAttribute('stroke-linecap','round');leaders.appendChild(line);
  const entry={id,object,machine,placement,card,line,name,code,statusKey:'unlinked',statusLabel:'Belum tertaut',anchor:null};
  cards.set(id,entry);
  return entry;
}
function applyStatuses(){
  for(const entry of cards.values()){
    if(!entry.machine){
      setCardStatus(entry,'unlinked','Belum tertaut');
      continue;
    }
    const status=mapOmodosMachineStatus(entry.machine,incomingStatuses,MACHINE_REGISTRY,entry.placement?.label||'');
    if(!status){
      setCardStatus(entry,'unlinked','Belum tertaut');
      continue;
    }
    setCardStatus(entry,status.statusKey,status.statusLabel);
  }
}
function setCardStatus(entry,key,label){
  const cls=statusClass(key);
  entry.statusKey=cls;
  entry.statusLabel=safeText(label,statusShort(cls,label));
  entry.card.classList.remove('status-kritikal','status-perhatian','status-normal','status-none','status-unlinked');
  entry.card.classList.add('status-'+cls);
  entry.card.querySelector('.status-state').textContent=statusShort(cls,entry.statusLabel);
  const accessible=entry.name+' · '+entry.statusLabel;
  entry.card.setAttribute('aria-label',accessible);
  entry.card.title=accessible;
}
function syncCardElements(){
  const assets=engine.actualFactory?.assets;
  if(!assets)return;
  const ids=new Set(assets.keys());
  for(const [id,entry] of cards){
    if(!ids.has(id)){
      entry.card.remove();entry.line.remove();cards.delete(id);
    }
  }
  for(const [id,object] of assets){
    if(!cards.has(id))createCard(id,object);
    else cards.get(id).object=object;
  }
  applyStatuses();
}
function boxesOverlap(a,b,gap=3){
  return a.left < b.right+gap && a.right > b.left-gap && a.top < b.bottom+gap && a.bottom > b.top-gap;
}
const CANDIDATE_OFFSETS=[
  [0,0],[-42,0],[42,0],[-82,0],[82,0],
  [0,-28],[-42,-28],[42,-28],[-82,-28],[82,-28],
  [0,-56],[-42,-56],[42,-56],[-82,-56],[82,-56],
  [0,-84],[-42,-84],[42,-84]
];
function projectCards(now){
  if(!engine.actualFactory?.assets||engine.view!=='factory')return;
  const rect=viewport.getBoundingClientRect();
  if(rect.width<1||rect.height<1)return;
  engine.scene.updateMatrixWorld(true);
  engine.camera.updateMatrixWorld(true);
  const projected=[];
  for(const entry of cards.values()){
    const object=entry.object;
    if(!object||!engine.isObjectVisible(object)){entry.card.style.display='none';entry.line.style.display='none';continue;}
    const box=new THREE.Box3().setFromObject(object);
    if(box.isEmpty()){entry.card.style.display='none';entry.line.style.display='none';continue;}
    const center=box.getCenter(new THREE.Vector3());
    const height=Math.max(.25,box.max.y-box.min.y);
    const anchor=new THREE.Vector3(center.x,box.max.y+Math.max(.2,height*.08),center.z).project(engine.camera);
    if(anchor.z < -1 || anchor.z > 1 || anchor.x < -1.2 || anchor.x > 1.2 || anchor.y < -1.2 || anchor.y > 1.2){
      entry.card.style.display='none';entry.line.style.display='none';continue;
    }
    const x=(anchor.x+1)*.5*rect.width;
    const y=(1-anchor.y)*.5*rect.height;
    entry.anchor={x,y,z:anchor.z};
    projected.push({entry,x,y,z:anchor.z,priority:entry.statusKey==='kritikal'?3:entry.statusKey==='perhatian'?2:entry.statusKey==='normal'?1:0});
  }
  // Place critical and attention labels first, then keep the remaining cards legible.
  projected.sort((a,b)=>b.priority-a.priority||a.z-b.z);
  const occupied=[];
  for(const item of projected){
    const {entry,x,y}=item,card=entry.card;
    card.style.display='flex';
    card.classList.remove('compact');
    let width=card.offsetWidth||108,height=card.offsetHeight||34,placed=null;
    const seek=(w,h,offsets)=>{
      for(const [dx,dy] of offsets){
        const left=Math.max(3,Math.min(rect.width-w-3,x+dx-w/2));
        const top=Math.max(3,Math.min(rect.height-h-3,y-h-7+dy));
        const box={left,top,right:left+w,bottom:top+h};
        if(!occupied.some(other=>boxesOverlap(box,other)))return {box,left,top,width:w,height:h};
      }
      return null;
    };
    placed=seek(width,height,CANDIDATE_OFFSETS);
    if(!placed){
      card.classList.add('compact');width=card.offsetWidth||66;height=card.offsetHeight||21;
      placed=seek(width,height,CANDIDATE_OFFSETS);
    }
    if(!placed){
      // Keep dense clusters intelligible; the full status remains available after zooming/rotating.
      card.style.display='none';entry.line.style.display='none';continue;
    }
    const {box,left,top}=placed;
    occupied.push(box);
    card.style.left=left+'px';card.style.top=top+'px';
    entry.line.style.display='block';
    entry.line.setAttribute('x1',String(x));entry.line.setAttribute('y1',String(y-1));
    entry.line.setAttribute('x2',String(Math.max(left+6,Math.min(left+width-6,x))));
    entry.line.setAttribute('y2',String(top+height));
    entry.line.setAttribute('stroke-opacity',entry.statusKey==='kritikal'?'0.9':'0.6');
  }
}
function receiveParentMessage(event){
  if(event.source!==window.parent||event.origin!==TRUSTED_PARENT_ORIGIN)return;
  const data=event.data;
  if(!data||data.type!==STATUS_MESSAGE||!Array.isArray(data.items))return;
  incomingStatuses=data.items.slice(0,200).map(item=>({
    code:safeText(item?.code,''),
    name:safeText(item?.name,''),
    statusKey:statusClass(item?.statusKey),
    statusLabel:safeText(item?.statusLabel,'Belum ada data')
  }));
  lastStatusSync=Date.now();
  applyStatuses();
  syncText.textContent='Status Logbook/Patrol tersinkron · '+new Date(lastStatusSync).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
}
window.addEventListener('message',receiveParentMessage);
function requestStatuses(){
  if(window.parent===window)return;
  window.parent.postMessage({type:'BMJ_TWIN_LITE_READY_V1'},TRUSTED_PARENT_ORIGIN);
}
window.addEventListener('pagehide',()=>{window.removeEventListener('message',receiveParentMessage);engine.dispose();},{once:true});

async function boot(){
  const [bundled,fleetData]=await Promise.all([loadBundledPlantLayout(),loadFactoryFleet()]);
  layout=bundled;fleet=fleetData;
  layout.fleet=fleet;
  for(const p of [...(layout.placements||[]),...fleet.map(record=>record?.placement).filter(Boolean)]){
    if(p?.machineId&&!placementById.has(p.machineId))placementById.set(p.machineId,p);
  }
  engine.setQualityProfile(engine.getQualityCapabilities().mobile?'hemat':'seimbang');
  engine.loadLayout(layout);
  const hiddenLayers=['building','ipal','floor','walls','doors','windows','air_curtain','furniture','roof','labels','landscape','reference','utility_compressed_air','utility_ahu_piping','utility_ahu_ducting','utility_anchors'];
  for(const layer of hiddenLayers)engine.setFactoryLayer(layer,false);
  engine.setFactoryLayer('machines',true);
  engine.setFactoryLayer('unidentified',true);
  engine.labels=false;
  if(!engine.actualFactory?.assets?.size)throw new Error('Data model fleet tidak berisi objek 3D. Tampilan pengganti tidak dibuat.');
  engine.fit(engine.factory,'iso',false);
  syncCardElements();
  loading.hidden=true;
  requestStatuses();
  const syncTimer=window.setInterval(()=>{
    if(Date.now()-lastStatusSync>30000)syncText.textContent='Menunggu sinkronisasi status OMODOS · bukan data PLC real-time';
    requestStatuses();
  },5000);
  void syncTimer;
  const animate=(now)=>{
    if(document.hidden)return requestAnimationFrame(animate);
    if(now-lastProjection>120){lastProjection=now;syncCardElements();projectCards(now);}
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
  window.BMJ_OMODOS_TWIN_LITE={ready:true,engine,updateStatuses(items){if(Array.isArray(items)){incomingStatuses=items;lastStatusSync=Date.now();applyStatuses();}}};
}
boot().catch(error=>{
  console.error('[OMODOS DigitalTwin Lite]',error);
  loading.innerHTML='<strong>Tampilan 3D belum berhasil dimuat</strong><small>Model pabrik tidak dimuat. Silakan gunakan beranda OMODOS biasa atau muat ulang halaman.</small>';
  syncText.textContent='Gagal memuat model 3D';
});
