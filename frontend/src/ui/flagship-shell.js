import{getState,setState,subscribe,selectContext,setLayer,setInspection,setSimulation,hydrateUrl,openOverlay,closeOverlay}from'../state/app-state.js';

const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ICONS={
 factory:'<svg viewBox="0 0 24 24"><path d="M3 21V9l6 3V8l6 4V5h6v16M3 21h18M7 17h2m4 0h2m4 0h2"/></svg>',
 asset:'<svg viewBox="0 0 24 24"><path d="M4 7h16v12H4zM8 7V4h8v3M8 12h8m-8 4h5"/></svg>',
 system:'<svg viewBox="0 0 24 24"><path d="M4 6h6v5H4zm10 7h6v5h-6zM10 8h4v8m-8-5v7h8"/></svg>',
 simulation:'<svg viewBox="0 0 24 24"><path d="m9 7 8 5-8 5zM4 4v16h16"/></svg>',
 reference:'<svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6zM14 3v4h4M9 12h6m-6 4h6"/></svg>',
 more:'<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>',
 help:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.3 2.3 0 1 1 3.7 1.8c-1 .7-1.5 1.1-1.5 2.2m0 4h.01"/></svg>',
 settings:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/></svg>'
};
function icon(name){return '<span class="ds-icon" aria-hidden="true">'+ICONS[name]+'</span>'}
function dispatchLegacy(id){
 const el=document.getElementById(id);if(el){el.click();return true}return false
}
function canonicalNavigation(){
 const rail=$('.rail');if(!rail)return;
 rail.innerHTML='<div class="rail-title">DIGITAL TWIN</div>'+
 [['factory','Pabrik'],['asset','Aset'],['system','Sistem'],['simulation','Simulasi'],['reference','Referensi']].map(([key,label])=>'<button type="button" data-section="'+key+'" aria-label="'+label+'">'+icon(key)+'<small>'+label+'</small></button>').join('')+
 '<div class="rail-bottom"><button type="button" data-section="help" aria-label="Bantuan">'+icon('help')+'<small>Bantuan</small></button><button type="button" data-section="settings" aria-label="Pengaturan">'+icon('settings')+'<small>Pengaturan</small></button></div>';
 $$('.rail [data-section]').forEach(btn=>btn.addEventListener('click',()=>activateSection(btn.dataset.section)));
 const mobile=$('.mobile-nav');if(mobile){
  mobile.hidden=false;
  mobile.innerHTML=[['factory','Pabrik'],['asset','Aset'],['system','Sistem'],['simulation','Simulasi'],['more','Lainnya']].map(([key,label])=>'<button type="button" data-section="'+key+'" aria-label="'+label+'">'+icon(key)+'<small>'+label+'</small></button>').join('');
  $$('.mobile-nav [data-section]').forEach(btn=>btn.addEventListener('click',()=>keyAction(btn.dataset.section)));
 }
}
function keyAction(section){
 if(section==='more'){document.body.classList.toggle('nav-open');return}
 activateSection(section)
}
function activateSection(section){
 document.body.classList.remove('nav-open');
 if(section==='help'){dispatchLegacy('nav-help');return}
 if(section==='settings'){dispatchLegacy('settings');return}
 setState({activeSection:section});
 const legacy={factory:'nav-machine',asset:'nav-assets',reference:'nav-sources'}[section];
 if(legacy)dispatchLegacy(legacy);
 if(section==='system')openSystemSheet();
 if(section==='simulation'){setSimulation({active:true});showTransport(true)}
}
function improveHeader(){
 const search=$('#global-search');if(search){search.placeholder='Cari mesin, area, komponen, sistem, atau dokumen…';search.setAttribute('autocomplete','off');search.addEventListener('input',debounce(()=>renderSearch(search.value),140));search.addEventListener('focus',()=>renderSearch(search.value))}
 const connection=$('#connection');if(connection){connection.textContent=navigator.onLine?'Data tersedia':'Offline';connection.classList.toggle('offline',!navigator.onLine)}
 $$('.top-kpis').forEach(el=>el.remove());
 const settings=$('#settings');if(settings)settings.innerHTML=icon('settings');
 const menu=$('#ui-menu-toggle');if(menu)menu.innerHTML=icon('more');
}
function improveInspector(){
 const top=$('.panel-top .eyebrow');if(top)top.textContent='KONTEKS TERPILIH';
 const tabs=$('.tabs');if(tabs){
  const labels={overview:'Ringkasan',structure:'Struktur',simulation:'Simulasi',exterior:'Data',sources:'Referensi'};
  $$('[data-tab]',tabs).forEach(btn=>{btn.textContent=labels[btn.dataset.tab]||btn.textContent;btn.addEventListener('click',()=>setState({inspectorState:{...getState().inspectorState,open:true,tab:btn.dataset.tab}}))})
 }
 const confidence=$('.confidence-panel h4');if(confidence)confidence.textContent='Data sebagian terverifikasi';
 const footer=$('.panel-footer');if(footer){const focus=$('#focus-machine');if(focus)focus.textContent='Pusatkan di 3D'}
}
function improveToolbar(){
 const map={
  'tool-explode':['Urai','explode'],
  'tool-isolate':['Isolasi','isolate'],
  'tool-simulation':['Simulasi Proses','simulation']
 };
 Object.entries(map).forEach(([id,[label,key]])=>{const el=document.getElementById(id);if(!el)return;el.firstChild.textContent=label+' ';el.setAttribute('aria-label',label);el.addEventListener('click',()=>key==='simulation'?setSimulation({active:true,playing:true}):setInspection(key,!getState().inspectionMode[key]))});
 const fit=$('[data-camera="fit"]');if(fit){fit.firstChild.textContent='Pusatkan ';fit.setAttribute('aria-label','Pusatkan pilihan')}
 const reset=$('[data-camera="reset"]');if(reset){reset.firstChild.textContent='Beranda ';reset.setAttribute('aria-label','Kembali ke tampilan awal')}
 const option=$('.scene-options');if(option&&!$('#layer-manager-button'))option.insertAdjacentHTML('afterbegin','<button id="layer-manager-button" class="icon-btn" aria-label="Kelola lapisan" title="Lapisan">'+icon('system')+'</button>');
 $('#layer-manager-button')?.addEventListener('click',toggleLayerManager);
}
const GROUPS={
 Bangunan:[['structure','Struktur'],['walls','Dinding'],['roof','Atap'],['columns','Kolom'],['doors','Pintu']],
 Produksi:[['machines','Mesin'],['workAreas','Area kerja'],['safetyZones','Zona keselamatan']],
 Utilitas:[['hvac','HVAC'],['ducting','Ducting'],['compressedAir','Compressed Air'],['water','Water / IPAL'],['electrical','Electrical']],
 Informasi:[['labels','Label'],['accessRoutes','Jalur akses'],['annotations','Anotasi'],['sensors','Sensor']]
};
function ensureLayerManager(){
 if($('#layer-manager'))return;
 const node=document.createElement('section');node.id='layer-manager';node.className='layer-manager';node.hidden=true;node.setAttribute('aria-label','Kelola lapisan');
 node.innerHTML='<header><h3>Lapisan</h3><button type="button" class="icon-btn" data-close aria-label="Tutup">×</button></header>'+Object.entries(GROUPS).map(([title,items])=>'<div class="layer-group"><h4>'+title+'</h4>'+items.map(([key,label])=>'<label class="layer-toggle"><span>'+label+'</span><input type="checkbox" data-layer="'+key+'"></label>').join('')+'</div>').join('');
 $('.workspace')?.append(node);$('[data-close]',node)?.addEventListener('click',()=>{node.hidden=true;closeOverlay()});
 $$('[data-layer]',node).forEach(input=>input.addEventListener('change',()=>applyLayer(input.dataset.layer,input.checked)));
}
function toggleLayerManager(){ensureLayerManager();const node=$('#layer-manager');node.hidden=!node.hidden;if(!node.hidden){openOverlay('layers');syncLayerControls()}}
function syncLayerControls(){const s=getState();$$('[data-layer]').forEach(input=>input.checked=Boolean(s.visibleLayers[input.dataset.layer]))}
function applyLayer(key,value){
 setLayer(key,value);
 window.dispatchEvent(new CustomEvent('bmj:layerchange',{detail:{key,visible:value}}));
 const legacy={labels:'labels',hvac:'layer-hvac',ducting:'layer-ducting',compressedAir:'layer-compressor',water:'layer-water',electrical:'layer-electrical'}[key];
 const el=legacy&&document.getElementById(legacy);if(el&&el.classList.contains('active')!==value)el.click()
}
function showTransport(show){
 let bar=$('#simulation-transport');
 if(!bar){bar=document.createElement('section');bar.id='simulation-transport';bar.className='simulation-transport';bar.setAttribute('aria-label','Kontrol simulasi');bar.innerHTML='<button data-sim="prev" aria-label="Tahap sebelumnya">‹</button><button data-sim="play" aria-label="Putar atau jeda">▶</button><button data-sim="next" aria-label="Tahap berikutnya">›</button><select data-sim-speed aria-label="Kecepatan"><option>.5</option><option selected>1</option><option>2</option></select><progress max="100" value="0" aria-label="Progres simulasi"></progress><button data-sim="stop">Stop</button>';$('.workspace')?.append(bar);
  $('[data-sim="play"]',bar).addEventListener('click',()=>{const s=getState().simulationState;dispatchLegacy('simulation-toggle');setSimulation({active:true,playing:!s.playing})});
  $('[data-sim="stop"]',bar).addEventListener('click',()=>{dispatchLegacy('simulation-stop');setSimulation({active:false,playing:false,progress:0});showTransport(false)});
  $('[data-sim="prev"]',bar).addEventListener('click',()=>window.dispatchEvent(new CustomEvent('bmj:simulationstep',{detail:-1})));
  $('[data-sim="next"]',bar).addEventListener('click',()=>window.dispatchEvent(new CustomEvent('bmj:simulationstep',{detail:1})));
  $('[data-sim-speed]',bar).addEventListener('change',e=>{setSimulation({speed:Number(e.target.value)});window.dispatchEvent(new CustomEvent('bmj:simulationspeed',{detail:Number(e.target.value)}))});
 }
 bar.hidden=!show
}
function buildIndex(){
 const results=[];
 $$('[data-machine-id],.machine-card,[data-taxonomy-id],[data-source-id]').forEach(el=>{
  const text=(el.innerText||el.textContent||'').trim().replace(/\s+/g,' ');if(!text)return;
  results.push({label:text.slice(0,100),type:el.matches('[data-machine-id],.machine-card')?'Mesin':el.matches('[data-taxonomy-id]')?'Komponen':'Referensi',element:el})
 });
 return results
}
let searchIndex=[];
function renderSearch(query){
 let box=$('#universal-search-results');if(!box){box=document.createElement('section');box.id='universal-search-results';box.className='search-results';box.hidden=true;box.setAttribute('aria-label','Hasil pencarian');document.body.append(box)}
 const q=query.trim().toLowerCase();if(q.length<2){box.hidden=true;closeOverlay();return}
 searchIndex=buildIndex();const hits=searchIndex.filter(item=>item.label.toLowerCase().includes(q)).slice(0,24);
 const grouped=Object.groupBy?Object.groupBy(hits,x=>x.type):hits.reduce((a,x)=>((a[x.type]??=[]).push(x),a),{});
 box.innerHTML=hits.length?Object.entries(grouped).map(([type,items])=>'<div class="search-group-title">'+type.toUpperCase()+'</div>'+items.map((item,i)=>'<button class="search-result" data-result="'+hits.indexOf(item)+'"><span>'+escapeHtml(item.label)+'</span><small>'+type+'</small></button>').join('')).join(''):'<div class="empty-state"><strong>Tidak ditemukan</strong><p>Coba nama mesin, area, komponen, sistem, atau dokumen lain.</p></div>';
 box.hidden=false;openOverlay('search');$$('[data-result]',box).forEach(btn=>btn.addEventListener('click',()=>{const item=hits[Number(btn.dataset.result)];item.element.click();item.element.scrollIntoView?.({block:'nearest'});box.hidden=true;selectContext({asset:item.type==='Mesin'?item.label:getState().selectedAsset,node:item.type==='Komponen'?item.label:null});search.blur()}));
}
function openSystemSheet(){ensureLayerManager();const node=$('#layer-manager');node.hidden=false;openOverlay('layers')}
function syncSelectionFromLegacy(){
 const title=$('#view-title')?.textContent?.trim();if(title&&title!==getState().selectedAsset)selectContext({asset:title},{url:false})
}
function render(state){
 $$('[data-section]').forEach(btn=>{const active=btn.dataset.section===state.activeSection;btn.classList.toggle('active',active);btn.setAttribute('aria-current',active?'page':'false')});
 document.body.classList.toggle('panel-hidden',!state.inspectorState.open&&document.body.classList.contains('panel-hidden'));
 syncLayerControls();showTransport(state.simulationState.active)
}
function escapeHtml(v){const d=document.createElement('div');d.textContent=v;return d.innerHTML}
function debounce(fn,wait){let id;return(...args)=>{clearTimeout(id);id=setTimeout(()=>fn(...args),wait)}}
function deviceMode(){const w=innerWidth;return w<768?'mobile':w<=1180?'tablet':'desktop'}
function updateViewport(){document.documentElement.style.setProperty('--app-vh',innerHeight+'px');setState({deviceMode:deviceMode()},{url:false})}
function closeTopOverlay(){
 const state=getState();if(state.overlay==='search'){$('#universal-search-results').hidden=true;$('#global-search')?.blur()}if(state.overlay==='layers')$('#layer-manager').hidden=true;closeOverlay()
}
function init(){
 canonicalNavigation();improveHeader();improveInspector();improveToolbar();ensureLayerManager();hydrateUrl();updateViewport();subscribe(render);
 addEventListener('resize',debounce(updateViewport,120),{passive:true});
 addEventListener('online',improveHeader);addEventListener('offline',improveHeader);
 addEventListener('keydown',e=>{if(e.key==='Escape')closeTopOverlay()});
 $('#close-panel')?.addEventListener('click',()=>setState({inspectorState:{...getState().inspectorState,open:false}},{url:false}));
 $('#panel-toggle')?.addEventListener('click',()=>setState({inspectorState:{...getState().inspectorState,open:true}},{url:false}));
 const observer=new MutationObserver(debounce(syncSelectionFromLegacy,80));const title=$('#view-title');if(title)observer.observe(title,{childList:true,subtree:true,characterData:true});
 document.documentElement.dataset.uiArchitecture='flagship-v148';
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
