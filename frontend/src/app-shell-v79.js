import{getState,setState,setActiveSection,setViewMode,setLayer,setSimulation,setInspector,openOverlay,closeOverlay,hydrateUrl,subscribe}from'./state/app-state.js';
import{FOUNDATION_SCOPE}from'./data/foundation-scope.js';

const q=(s,r=document)=>r.querySelector(s);
const PHASE1_FOUNDATION=FOUNDATION_SCOPE.expansionMode==='LAYOUT_PLACEHOLDERS_ONLY';
const qa=(s,r=document)=>[...r.querySelectorAll(s)];
const FOCUSABLE='button:not([disabled]):not([tabindex="-1"]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';
const overlayReturnFocus=new Map();
function rememberOverlayFocus(name){
 const active=document.activeElement;
 if(active instanceof HTMLElement&&active!==document.body)overlayReturnFocus.set(name,active);
}
function restoreOverlayFocus(name,fallback){
 const saved=overlayReturnFocus.get(name);overlayReturnFocus.delete(name);
 if(!saved)return;
 const target=saved.isConnected?saved:q(fallback);
 if(target instanceof HTMLElement)requestAnimationFrame(()=>target.focus({preventScroll:true}));
}
function overlayFocusable(root){return root?qa(FOCUSABLE,root).filter(el=>!el.hidden&&el.getClientRects().length>0):[]}
function focusOverlay(root,preferred){
 const target=(preferred&&q(preferred,root))||overlayFocusable(root)[0]||root;
 if(target instanceof HTMLElement)requestAnimationFrame(()=>target.focus({preventScroll:true}));
}
function trapOverlayFocus(event,root){
 if(event.key!=='Tab'||!root)return false;
 const items=overlayFocusable(root);if(!items.length){event.preventDefault();root.focus?.();return true}
 const first=items[0],last=items.at(-1),active=document.activeElement;
 if(event.shiftKey&&(active===first||!root.contains(active))){event.preventDefault();last.focus();return true}
 if(!event.shiftKey&&(active===last||!root.contains(active))){event.preventDefault();first.focus();return true}
 return false;
}
const icon=name=>`<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><use href="#i-${name}"></use></svg>`;
const symbols=`<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
<symbol id="i-factory" viewBox="0 0 24 24"><path d="M3 21V9l6 3V8l6 4V5h6v16M3 21h18M7 17h2m4 0h2m4 0h2"/></symbol>
<symbol id="i-machine" viewBox="0 0 24 24"><path d="M3 8h14v10H3zM17 11h4v7h-4M6 8V5h8v3"/><circle cx="7" cy="19" r="1.5"/><circle cx="18" cy="19" r="1.5"/></symbol>
<symbol id="i-system" viewBox="0 0 24 24"><path d="M4 6h6v5H4zm10 7h6v5h-6zM10 8h4v8m-8-5v7h8"/></symbol>
<symbol id="i-simulation" viewBox="0 0 24 24"><path d="m9 7 8 5-8 5zM4 4v16h16"/></symbol>
<symbol id="i-file" viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6zM14 3v5h5M9 12h6M9 16h6"/></symbol>
<symbol id="i-help" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.6 2.1c-1 .6-1.4 1.1-1.4 2M12 17h.01"/></symbol>
<symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></symbol>
<symbol id="i-settings" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A8 8 0 0 0 15 6l-.3-2.6h-4L10.4 6A8 8 0 0 0 9 7.1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 1.4 1.1l.3 2.6h4L15 18a8 8 0 0 0 1.5-1.1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1z"/></symbol>
<symbol id="i-layers" viewBox="0 0 24 24"><path d="m4 7 8-4 8 4-8 4Z"/><path d="m4 12 8 4 8-4M4 17l8 4 8-4"/></symbol>
<symbol id="i-close" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></symbol>
<symbol id="i-more" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></symbol>
<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></symbol>
<symbol id="i-theme" viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z"/></symbol>
<symbol id="i-focus" viewBox="0 0 24 24"><path d="M8 3H4a1 1 0 0 0-1 1v4M16 3h4a1 1 0 0 1 1 1v4M21 16v4a1 1 0 0 1-1 1h-4M8 21H4a1 1 0 0 1-1-1v-4"/><circle cx="12" cy="12" r="3"/></symbol>
<symbol id="i-zoom-in" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M10.5 7.5v6M7.5 10.5h6"/></symbol>
<symbol id="i-zoom-out" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M7.5 10.5h6"/></symbol>
<symbol id="i-fullscreen" viewBox="0 0 24 24"><path d="M8 3H4a1 1 0 0 0-1 1v4M16 3h4a1 1 0 0 1 1 1v4M21 16v4a1 1 0 0 1-1 1h-4M8 21H4a1 1 0 0 1-1-1v-4"/></symbol>
<symbol id="i-label" viewBox="0 0 24 24"><path d="M4 5h10l6 7-6 7H4z"/><circle cx="8" cy="9" r="1"/></symbol>
<symbol id="i-interior" viewBox="0 0 24 24"><path d="M4 4h16v16H4zM12 4v16M7 8h2m6 0h2M7 12h2m6 0h2M7 16h2m6 0h2"/></symbol>
<symbol id="i-home-view" viewBox="0 0 24 24"><path d="m3 11 9-7 9 7M6 9v11h12V9M10 20v-6h4v6"/></symbol>
<symbol id="i-panel" viewBox="0 0 24 24"><path d="M4 4h16v16H4zM15 4v16M7 8h5M7 12h5M7 16h3"/></symbol>
</svg>`;
document.body.insertAdjacentHTML('afterbegin',symbols);

const iconMap={
 'nav-machine':'factory','nav-assets':'machine','nav-systems':'system','nav-simulation-mode':'simulation',
 'nav-sources':'file','nav-help':'help','nav-settings':'settings','ui-menu-toggle':'menu','settings':'settings',
 'close-panel':'close','modal-close':'close','ui-theme-toggle':'theme','global-search-icon':'search','mobile-search-toggle':'search','layer-manager-button':'layers',
 'panel-toggle':'panel','zoom-plus':'zoom-in','zoom-fit':'focus','zoom-minus':'zoom-out','labels':'label','fullscreen':'fullscreen'
};
for(const [id,name]of Object.entries(iconMap)){
 const el=q('#'+id);if(!el)continue;
 if(el.matches('.rail button')){
  const label=q('small',el)?.textContent||el.getAttribute('aria-label')||'';
  el.innerHTML=icon(name)+`<small>${label}</small>`;
 }else el.innerHTML=icon(name);
}
const mobileIcons={factory:'factory',asset:'machine',system:'system',simulation:'simulation',more:'more'};
qa('[data-mobile-nav]').forEach(el=>{const label=q('small',el)?.textContent||el.getAttribute('aria-label')||'';el.innerHTML=icon(mobileIcons[el.dataset.mobileNav]||'more')+`<small>${label}</small>`});
const mobileContextTools=document.createElement('section');mobileContextTools.className='mobile-context-tools';mobileContextTools.setAttribute('aria-label','Aksi tampilan dan inspeksi');mobileContextTools.innerHTML=`<small>INSPEKSI & TAMPILAN</small>
<button type="button" data-mobile-tool="top">${icon('focus')}<span>Tampak Atas</span></button>
<button type="button" data-mobile-tool="interior">${icon('interior')}<span>Buka Interior</span></button>
<button type="button" data-mobile-tool="labels">${icon('label')}<span>Label</span></button>
<button type="button" data-mobile-tool="home">${icon('home-view')}<span>Tampilan Awal</span></button>
<button type="button" data-mobile-tool="fullscreen">${icon('fullscreen')}<span>Layar Penuh</span></button>`;
q('.rail-bottom')?.before(mobileContextTools);
qa('[data-mobile-tool]',mobileContextTools).forEach(button=>button.addEventListener('click',()=>{
 const action=button.dataset.mobileTool;
 if(action==='top')q('[data-camera="top"]')?.click();
 if(action==='interior')q('#tool-interior')?.click();
 if(action==='labels')q('#labels')?.click();
 if(action==='home')q('[data-camera="reset"]')?.click();
 if(action==='fullscreen')q('#fullscreen')?.click();
 closeDrawer();closeOverlay();
}));

const splash=q('.app-splash');
const firstVisit=!sessionStorage.getItem('bmj-splash-seen');
const finishSplash=()=>{if(!splash||splash.classList.contains('is-done'))return;splash.classList.add('is-done');sessionStorage.setItem('bmj-splash-seen','1');setTimeout(()=>splash.remove(),600)};
addEventListener('load',()=>setTimeout(finishSplash,firstVisit?1250:180),{once:true});setTimeout(finishSplash,5000);

const SECTION_BUTTONS={factory:'nav-machine',asset:'nav-assets',system:'nav-systems',simulation:'nav-simulation-mode',reference:'nav-sources'};
function markSection(section){
 for(const [key,id]of Object.entries(SECTION_BUTTONS)){
  const el=q('#'+id),active=key===section;
  el?.classList.toggle('active',active);
  if(el)el.setAttribute('aria-current',active?'page':'false');
 }
 qa('[data-mobile-nav]').forEach(el=>{const active=el.dataset.mobileNav===section;el.classList.toggle('active',active);if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')});
}
function closeDrawer(){document.body.classList.remove('nav-open');q('#ui-menu-toggle')?.setAttribute('aria-expanded','false');restoreOverlayFocus('navigation','#ui-menu-toggle')}
function closeLayerManager(){const panel=q('#layer-manager');if(panel)panel.hidden=true;if(getState().overlay==='layers')closeOverlay();restoreOverlayFocus('layers',PHASE1_FOUNDATION?'#nav-machine':'#nav-systems')}
function closeInspector(){document.body.classList.add('panel-hidden');document.body.classList.remove('mobile-panel-open');setInspector(false)}
function toggleInspector(){
 if(document.body.classList.contains('panel-hidden')){
  beforeMajorOverlay('inspector');
  document.body.classList.remove('panel-hidden');
  if(matchMedia('(max-width:767px)').matches)document.body.classList.add('mobile-panel-open');
  setInspector(true);openOverlay('inspector');
 }else{
  closeInspector();
  if(getState().overlay==='inspector')closeOverlay();
 }
}
q('#panel-toggle')?.addEventListener('click',toggleInspector);
function beforeMajorOverlay(name){
 const current=getState().overlay;
 if(current&&current!==name){
  if(current==='search')closeSearch();
  else if(current==='layers')closeLayerManager();
  else if(current==='navigation')closeDrawer();
  else if(current==='inspector')closeInspector();
  else if(current==='modal'&&q('#modal')?.open)q('#modal-close')?.click();
  if(getState().overlay===current)closeOverlay();
 }
 if(name!=='inspector'&&!document.body.classList.contains('panel-hidden'))closeInspector();
 if(name!=='navigation')closeDrawer();
}
function openSystemLayers(){
 beforeMajorOverlay('layers');rememberOverlayFocus('layers');ensureLayerManager();
 const panel=q('#layer-manager');panel.hidden=false;openOverlay('layers');setActiveSection(PHASE1_FOUNDATION?'factory':'system');markSection(PHASE1_FOUNDATION?'factory':'system');syncLayerControls();focusOverlay(panel,'[data-layer-close]');
}
function enterSimulation(){
 if(q('#mode-3d')?.disabled){
  q('#mode-2d')?.click();
  const hint=q('#scene-hint');if(hint)hint.textContent='Simulasi 3D memerlukan WebGL. Denah 2D tetap tersedia di perangkat ini.';
  return;
 }
 beforeMajorOverlay('inspector');setActiveSection('simulation');markSection('simulation');
 document.body.classList.remove('workspace-2d');setViewMode('3d');
 q('#tool-simulation')?.click();
 setInspector(true,'simulation');openOverlay('inspector');
 requestAnimationFrame(syncSimulationTransport);
}

const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let searchResults=[],searchActiveIndex=-1,searchTimer=0;
function ensureSearchPalette(){
 let panel=q('#universal-search-panel');if(panel)return panel;
 panel=document.createElement('section');panel.id='universal-search-panel';panel.className='universal-search-panel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','universal-search-title');panel.setAttribute('tabindex','-1');
 panel.innerHTML=`<header><div class="universal-search-field">${icon('search')}<input id="universal-search-input" type="search" autocomplete="off" aria-label="Cari di seluruh digital twin" aria-controls="universal-search-results" aria-autocomplete="list" aria-expanded="true" placeholder="Cari mesin, area, komponen, sistem, dokumen, atau foto…"><button type="button" data-search-close class="icon-btn" aria-label="Tutup pencarian">${icon('close')}</button></div><small id="universal-search-title">Cari di seluruh Digital Twin</small></header><div id="universal-search-results" class="universal-search-results" role="listbox" aria-label="Hasil pencarian"><p class="universal-search-empty">Ketik nama mesin, komponen, area, sistem, dokumen, atau foto.</p></div>`;
 document.body.append(panel);
 q('[data-search-close]',panel)?.addEventListener('click',closeSearch);
 q('#universal-search-input',panel)?.addEventListener('input',event=>requestUniversalSearch(event.currentTarget.value));
 q('#universal-search-input',panel)?.addEventListener('keydown',searchKeydown);
 return panel;
}
function openSearch(seed=''){
 beforeMajorOverlay('search');rememberOverlayFocus('search');
 const panel=ensureSearchPalette(),input=q('#universal-search-input',panel);
 panel.hidden=false;openOverlay('search');document.body.classList.add('search-open');input.setAttribute('aria-expanded','true');
 if(seed!==undefined)input.value=seed;
 searchActiveIndex=-1;requestUniversalSearch(input.value);
 requestAnimationFrame(()=>input.focus());
}
function closeSearch(){
 const panel=q('#universal-search-panel'),input=q('#universal-search-input',panel||document);if(panel)panel.hidden=true;
 if(input){input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant')}
 document.body.classList.remove('search-open');
 if(getState().overlay==='search')closeOverlay();
 searchActiveIndex=-1;restoreOverlayFocus('search','#global-search');
}
function requestUniversalSearch(query){
 clearTimeout(searchTimer);
 const headerInput=q('#global-search');if(headerInput&&headerInput.value!==query)headerInput.value=query;
 searchTimer=setTimeout(()=>dispatchEvent(new CustomEvent('bmj:searchrequest',{detail:{query}})),120);
}
function renderSearchResults(detail={}){
 const panel=ensureSearchPalette(),host=q('.universal-search-results',panel),query=String(detail.query||'').trim();
 searchResults=Array.isArray(detail.results)?detail.results:[];searchActiveIndex=searchResults.length?0:-1;
 if(!query){host.innerHTML='<p class="universal-search-empty">Ketik nama mesin, komponen, area, sistem, dokumen, atau foto.</p>';q('#universal-search-input',panel)?.removeAttribute('aria-activedescendant');return}
 if(!searchResults.length){host.innerHTML='<p class="universal-search-empty">Tidak ada hasil yang sesuai.</p>';q('#universal-search-input',panel)?.removeAttribute('aria-activedescendant');return}
 let lastGroup='';
 host.innerHTML=searchResults.map((item,index)=>{
  const heading=item.group!==lastGroup?(lastGroup=item.group,`<h4>${escapeHtml(item.group)}</h4>`):'';
  return heading+`<button id="universal-search-option-${index}" type="button" class="universal-search-result ${index===searchActiveIndex?'active':''}" data-search-index="${index}" role="option" aria-selected="${index===searchActiveIndex?'true':'false'}"><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.subtitle||'')}</small></span><em>${escapeHtml(item.type==='component'?'Komponen':item.type==='machine'?'Mesin':item.type==='reference'?'Referensi':item.type==='system'?'Sistem':'Area')}</em></button>`;
 }).join('');
 qa('[data-search-index]',host).forEach(button=>button.addEventListener('click',()=>chooseSearchResult(Number(button.dataset.searchIndex))));
 updateSearchActive();
}
function updateSearchActive(){
 const panel=ensureSearchPalette(),host=q('.universal-search-results',panel),input=q('#universal-search-input',panel);
 qa('[data-search-index]',host).forEach((button,index)=>{const active=index===searchActiveIndex;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));if(active){input?.setAttribute('aria-activedescendant',button.id);button.scrollIntoView({block:'nearest'})}});
}
function searchKeydown(event){
 if(!searchResults.length)return;
 if(event.key==='ArrowDown'){event.preventDefault();searchActiveIndex=(searchActiveIndex+1)%searchResults.length;updateSearchActive()}
 else if(event.key==='ArrowUp'){event.preventDefault();searchActiveIndex=(searchActiveIndex-1+searchResults.length)%searchResults.length;updateSearchActive()}
 else if(event.key==='Enter'){event.preventDefault();chooseSearchResult(Math.max(0,searchActiveIndex))}
}
function chooseSearchResult(index){
 const item=searchResults[index];if(!item)return;
 closeSearch();dispatchEvent(new CustomEvent('bmj:searchselect',{detail:{item}}));
}
const globalSearch=q('#global-search');
globalSearch?.addEventListener('focus',()=>openSearch(globalSearch.value));
globalSearch?.addEventListener('input',event=>{if(getState().overlay!=='search')openSearch(event.currentTarget.value);else requestUniversalSearch(event.currentTarget.value)});
globalSearch?.addEventListener('keydown',event=>{if(event.key==='ArrowDown'||event.key==='Enter'){event.preventDefault();openSearch(globalSearch.value)}});
q('#mobile-search-toggle')?.addEventListener('click',()=>openSearch(''));
addEventListener('bmj:searchresults',event=>renderSearchResults(event.detail));
addEventListener('bmj:systemsearchselect',event=>{if(PHASE1_FOUNDATION)return;const system=event.detail?.system||null;setState({selectedSystem:system},{url:false});openSystemLayers();if(['hvac','compressedAir','routing'].includes(system))q(`[data-system-focus="${system}"]`)?.click()});
q('#nav-machine')?.addEventListener('click',()=>{setActiveSection('factory');document.body.classList.remove('workspace-2d');setViewMode('3d');markSection('factory');closeLayerManager()});
q('#nav-assets')?.addEventListener('click',()=>{beforeMajorOverlay('modal');setActiveSection('asset');markSection('asset');openOverlay('modal')});
q('#nav-systems')?.addEventListener('click',()=>{if(!PHASE1_FOUNDATION)openSystemLayers()});
q('#nav-simulation-mode')?.addEventListener('click',enterSimulation);
q('#nav-sources')?.addEventListener('click',()=>{beforeMajorOverlay('inspector');setActiveSection('reference');markSection('reference');setInspector(true,'sources');openOverlay('inspector')});
q('#nav-help')?.addEventListener('click',()=>{beforeMajorOverlay('modal');openOverlay('modal')});
q('#nav-settings')?.addEventListener('click',()=>{beforeMajorOverlay('modal');q('#settings')?.click();openOverlay('modal')});

const menu=q('#ui-menu-toggle');
menu?.addEventListener('click',()=>{const open=!document.body.classList.contains('nav-open');if(open){beforeMajorOverlay('navigation');rememberOverlayFocus('navigation')}document.body.classList.toggle('nav-open',open);menu.setAttribute('aria-expanded',String(open));if(open){openOverlay('navigation');focusOverlay(q('.rail'),'.rail button:not([hidden])')}else{closeOverlay();restoreOverlayFocus('navigation','#ui-menu-toggle')}});
q('#ui-backdrop')?.addEventListener('click',()=>{
 const overlay=getState().overlay;
 if(overlay==='search')closeSearch();
 else if(overlay==='layers')closeLayerManager();
 else if(overlay==='navigation')closeDrawer();
 else if(overlay==='inspector')closeInspector();
 else if(overlay==='modal'&&q('#modal')?.open)q('#modal-close')?.click();
 else closeOverlay();
});
qa('.rail button').forEach(b=>b.addEventListener('click',()=>{if(innerWidth<768&&b.id!=='nav-systems')closeDrawer()}));

const MOBILE_TARGET={factory:'nav-machine',asset:'nav-assets',system:'nav-systems',simulation:'nav-simulation-mode'};
qa('[data-mobile-nav]').forEach(button=>button.addEventListener('click',event=>{
 if(!matchMedia('(max-width:767px)').matches)return;
 const key=button.dataset.mobileNav;
 if(key==='more'){event.preventDefault();const open=!document.body.classList.contains('nav-open');if(open)beforeMajorOverlay('navigation');document.body.classList.toggle('nav-open',open);menu?.setAttribute('aria-expanded',String(open));if(open)openOverlay('navigation');else closeOverlay();return}
 const target=MOBILE_TARGET[key];if(target)q('#'+target)?.click();
}));

q('#mode-2d')?.addEventListener('click',()=>{document.body.classList.add('workspace-2d');setViewMode('2d');setActiveSection('factory');markSection('factory');requestAnimationFrame(()=>dispatchEvent(new Event('resize')))});
q('#mode-3d')?.addEventListener('click',()=>{document.body.classList.remove('workspace-2d');setViewMode('3d');setActiveSection('factory');markSection('factory');requestAnimationFrame(()=>dispatchEvent(new Event('resize')))});

const GROUPS=PHASE1_FOUNDATION?[
 ['Bangunan',[['building','Bangunan & ruang'],['roof','Atap']]],
 ['Posisi aset',[['machines','Placeholder aset'],['labels','Label'],['unidentified','Area belum teridentifikasi']]],
 ['Sumber',[['reference','Garis denah sumber']]]
]:[
 ['Bangunan',[['building','Dinding & ruangan'],['roof','Atap'],['landscape','Area luar']]],
 ['Produksi',[['machines','Mesin'],['labels','Label'],['unidentified','Area belum teridentifikasi']]],
 ['Utilitas',[['compressedAir','Pipa compressed air'],['ahuPiping','Pipa AHU'],['ducting','Ducting AHU'],['utilityAnchors','Titik koneksi referensi']]],
 ['Informasi',[['reference','Garis denah sumber']]]
];
function ensureLayerManager(){
 if(q('#layer-manager'))return;
 const panel=document.createElement('section');panel.id='layer-manager';panel.className='canonical-layer-manager';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','layer-manager-title');panel.setAttribute('tabindex','-1');
 const systemSurface=PHASE1_FOUNDATION?'':`<div class="canonical-system-grid">
  <button type="button" data-system-focus="hvac"><strong>HVAC</strong><small>Pipa AHU + ducting</small><span>Lihat jalur & peralatan</span></button>
  <button type="button" data-system-focus="compressedAir"><strong>Udara Bertekanan</strong><small>Pipa distribusi udara</small><span>Lihat jalur & peralatan</span></button>
  <button type="button" data-system-focus="routing"><strong>Jalur Utilitas</strong><small>Semua jalur yang tersedia</small><span>Lihat seluruh jalur</span></button>
  <button type="button" data-system-focus="water" class="system-unavailable"><strong>Air / IPAL</strong><small>Peralatan tersedia · jalur belum tersedia</small><span>Lihat batas data</span></button>
  <button type="button" data-system-focus="electrical" class="system-unavailable"><strong>Kelistrikan</strong><small>Jalur terpisah belum tersedia</small><span>Lihat batas data</span></button>
 </div><section id="system-context" class="canonical-system-context" aria-live="polite"><p>Pilih sistem untuk melihat jalur, peralatan terkait, status data, dan batas verifikasi.</p></section>`;
 panel.innerHTML=`<header><div><small>${PHASE1_FOUNDATION?'FASE FONDASI':'SISTEM & TAMPILAN'}</small><h3 id="layer-manager-title">${PHASE1_FOUNDATION?'Lapisan Pabrik':'Sistem & Lapisan'}</h3></div><button type="button" data-layer-close class="icon-btn" aria-label="Tutup">${icon('close')}</button></header>
 ${systemSurface}
 ${GROUPS.map(([title,items])=>`<div class="canonical-layer-group"><h4>${title}</h4>${items.map(([key,label])=>`<label><span>${label}</span><input type="checkbox" data-canonical-layer="${key}"></label>`).join('')}</div>`).join('')}
 <div class="canonical-layer-group unavailable"><h4>Batas fase</h4><p>${PHASE1_FOUNDATION?'Sistem utilitas dan detail teknis aset selain OFFSET 5 disimpan untuk fase ekspansi, tetapi tidak diaktifkan pada deliverable fondasi.':'Jalur yang belum memiliki drawing atau verifikasi lapangan tetap ditandai belum tersedia. Aplikasi tidak membuat jalur as-built secara otomatis.'}</p></div>`;
 q('.workspace')?.append(panel);
 q('[data-layer-close]',panel)?.addEventListener('click',closeLayerManager);
 qa('[data-canonical-layer]',panel).forEach(input=>input.addEventListener('change',()=>{
  const key=input.dataset.canonicalLayer,visible=input.checked;setLayer(key,visible);
  dispatchEvent(new CustomEvent('bmj:layerchange',{detail:{key,visible}}));
 }));
 if(!PHASE1_FOUNDATION)qa('[data-system-focus]',panel).forEach(button=>button.addEventListener('click',()=>{
  const system=button.dataset.systemFocus,keys=system==='hvac'?['ahuPiping','ducting']:system==='compressedAir'?['compressedAir']:system==='routing'?['compressedAir','ahuPiping','ducting','utilityAnchors']:[];
  document.body.classList.remove('workspace-2d');setViewMode('3d');setState({selectedSystem:system,activeSection:'system'},{url:false});
  qa('[data-system-focus]',panel).forEach(item=>item.classList.toggle('active',item===button));
  for(const key of keys){setLayer(key,true);dispatchEvent(new CustomEvent('bmj:layerchange',{detail:{key,visible:true}}))}
  syncLayerControls();markSection('system');dispatchEvent(new CustomEvent('bmj:systemfocus',{detail:{system}}));
 }));
}
function syncLayerControls(){
 const state=getState();qa('[data-canonical-layer]').forEach(input=>{input.checked=Boolean(state.visibleLayers[input.dataset.canonicalLayer])});
}
function renderSystemContext(detail={}){
 const host=q('#system-context');if(!host)return;
 const networks=Array.isArray(detail.networks)?detail.networks:[],equipment=Array.isArray(detail.equipment)?detail.equipment:[];
 const networkRows=networks.length?networks.map(net=>`<div class="system-network-row"><span><strong>${escapeHtml(net.system.replaceAll('_',' '))}</strong><small>${escapeHtml(net.status||'')}</small></span><em>${net.nodeCount||0} titik · ${net.segmentCount||0} jalur · ${net.equipmentAnchorCount||0} titik peralatan</em></div>`).join(''):'<p class="system-context-empty">Jalur terpisah belum tersedia untuk sistem ini.</p>';
 const equipmentRows=equipment.length?equipment.map(item=>`<button type="button" data-system-machine="${escapeHtml(item.machineId)}"><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.model||item.sapCode||item.machineId)}</small></span><em>Buka aset</em></button>`).join(''):'<p class="system-context-empty">Belum ada peralatan terkait yang dapat ditampilkan pada jalur sistem ini.</p>';
 host.innerHTML=`<header><div><small>KONTEKS SISTEM</small><h4>${escapeHtml(detail.title||'Sistem')}</h4></div><span class="system-route-status ${detail.actualRoutingApplied?'verified':'reference'}">${detail.actualRoutingApplied?'Jalur terverifikasi':'Acuan belum terverifikasi'}</span></header><div class="system-context-actions"><button type="button" data-system-refocus="${escapeHtml(detail.system||'')}">${icon('focus')}<span>Fokus jalur</span></button></div><h5>Jalur</h5>${networkRows}<h5>Peralatan terkait</h5><div class="system-equipment-list">${equipmentRows}</div><h5>Tujuan distribusi</h5><p class="system-context-empty">${escapeHtml(detail.consumerText||'Tujuan distribusi belum tersedia.')}</p><h5>Dasar data</h5><p class="system-context-empty">${escapeHtml(detail.sourceText||'Sumber data jalur belum tersedia.')}</p><div class="system-boundary"><strong>Batas data</strong><p>${escapeHtml(detail.boundary||'Status jalur belum tersedia.')}</p><small>Status data: ${escapeHtml(detail.routeMode||'BELUM TERSEDIA')}</small></div>`;
 qa('[data-system-machine]',host).forEach(button=>button.addEventListener('click',()=>dispatchEvent(new CustomEvent('bmj:systemassetselect',{detail:{machineId:button.dataset.systemMachine}}))));
 q('[data-system-refocus]',host)?.addEventListener('click',event=>dispatchEvent(new CustomEvent('bmj:systemfocus',{detail:{system:event.currentTarget.dataset.systemRefocus}})));
}
addEventListener('bmj:systemcontext',event=>renderSystemContext(event.detail));

function ensureSimulationTransport(){
 let bar=q('#simulation-transport');if(bar)return bar;
 bar=document.createElement('section');bar.id='simulation-transport';bar.className='canonical-simulation-transport';bar.hidden=true;bar.setAttribute('aria-label','Kontrol simulasi');
 bar.innerHTML=`<div class="sim-context"><small>SIMULASI PROSES</small><strong data-transport-stage>Siap</strong></div><button type="button" data-transport-play class="primary" aria-label="Mulai atau jeda simulasi">Mulai</button><label>Kecepatan<select data-transport-speed aria-label="Kecepatan simulasi"><option value=".5">0.5×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label><progress max="100" value="0" data-transport-progress aria-label="Progres simulasi"></progress><button type="button" data-transport-stop>Stop</button>`;
 q('.workspace')?.append(bar);
 q('[data-transport-play]',bar).addEventListener('click',()=>{const s=getState().simulationState;const target=s.playing?q('#sim-pause'):s.active?(q('#sim-pause')||q('#sim-start')):q('#sim-start');target?.click();requestAnimationFrame(syncSimulationTransport)});
 q('[data-transport-stop]',bar).addEventListener('click',()=>{q('#sim-stop')?.click();requestAnimationFrame(syncSimulationTransport)});
 q('[data-transport-speed]',bar).addEventListener('change',e=>{q(`[data-sim-speed="${e.target.value}"]`)?.click();requestAnimationFrame(syncSimulationTransport)});
 return bar;
}
function syncSimulationTransport(){
 const bar=ensureSimulationTransport(),section=getState().activeSection;
 const status=q('#sim-status')?.textContent?.trim()||'',stage=q('#sim-stage')?.textContent?.trim()||'Siap';
 const progressStyle=q('#sim-progress-bar')?.style?.width||'0%';const progress=Math.max(0,Math.min(100,parseFloat(progressStyle)||0));
 const active=status==='RUNNING'||status==='PAUSED',playing=status==='RUNNING';
 setSimulation({active,playing,stage,progress});
 bar.hidden=section!=='simulation';
 q('[data-transport-stage]',bar).textContent=stage;
 q('[data-transport-progress]',bar).value=progress;
 const play=q('[data-transport-play]',bar);play.textContent=playing?'Jeda':active?'Lanjutkan':'Mulai';
 const activeSpeed=qa('[data-sim-speed]').find(b=>b.classList.contains('active'))?.dataset.simSpeed;if(activeSpeed)q('[data-transport-speed]',bar).value=activeSpeed;
}
ensureLayerManager();ensureSimulationTransport();

const panelContent=q('#panel-content');if(panelContent)new MutationObserver(()=>requestAnimationFrame(syncSimulationTransport)).observe(panelContent,{childList:true,subtree:true});
q('[data-tab="simulation"]')?.addEventListener('click',()=>{setActiveSection('simulation');markSection('simulation');requestAnimationFrame(syncSimulationTransport)});
const modalElement=q('#modal');if(modalElement)new MutationObserver(()=>{if(modalElement.open){beforeMajorOverlay('modal');openOverlay('modal')}else if(getState().overlay==='modal')closeOverlay()}).observe(modalElement,{attributes:true,attributeFilter:['open']});
const bodyObserver=new MutationObserver(()=>{
 const open=!document.body.classList.contains('panel-hidden');setInspector(open);
 if(!open&&getState().overlay==='inspector')closeOverlay();
});
bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});

addEventListener('bmj:domainstate',event=>{
 const detail=event.detail||{};
 const carriesDeepLink=Object.prototype.hasOwnProperty.call(detail,'selectedAsset')||Object.prototype.hasOwnProperty.call(detail,'selectedNode')||Object.prototype.hasOwnProperty.call(detail,'viewMode');
 setState(detail,{url:carriesDeepLink});
});
addEventListener('bmj:historyrestore',event=>{
 const detail=event.detail||{},viewMode=detail.viewMode==='2d'?'2d':'3d';
 setState({selectedAsset:detail.selectedAsset||null,selectedNode:detail.selectedNode||null,viewMode},{url:false});
 if(viewMode==='2d')q('#mode-2d')?.click();else q('#mode-3d')?.click();
});
const syncViewport=()=>{document.documentElement.style.setProperty('--app-vh',`${window.visualViewport?.height||innerHeight}px`);const w=innerWidth;setTimeout(()=>window.BMJAppState?.setState({deviceMode:w<768?'mobile':w<=1180?'tablet':'desktop'},{url:false}),0)};
syncViewport();addEventListener('resize',syncViewport,{passive:true});window.visualViewport?.addEventListener('resize',syncViewport,{passive:true});

function syncInspectorTabs(){
 const tabs=qa('#detail-panel [role="tab"]').filter(tab=>tab.getAttribute('aria-hidden')!=='true');
 const active=tabs.find(tab=>tab.getAttribute('aria-selected')==='true')||tabs[0];
 tabs.forEach(tab=>{tab.setAttribute('aria-controls','panel-content');tab.tabIndex=tab===active?0:-1});
}
const inspectorTablist=q('#detail-panel .tabs');
inspectorTablist?.addEventListener('keydown',event=>{
 const tabs=qa('[role="tab"]',inspectorTablist).filter(tab=>tab.getAttribute('aria-hidden')!=='true');
 const current=tabs.indexOf(document.activeElement);if(current<0)return;
 let next=current;
 if(event.key==='ArrowRight')next=(current+1)%tabs.length;
 else if(event.key==='ArrowLeft')next=(current-1+tabs.length)%tabs.length;
 else if(event.key==='Home')next=0;
 else if(event.key==='End')next=tabs.length-1;
 else return;
 event.preventDefault();tabs[next].focus();tabs[next].click();
});
if(inspectorTablist)new MutationObserver(syncInspectorTabs).observe(inspectorTablist,{subtree:true,attributes:true,attributeFilter:['aria-selected']});
syncInspectorTabs();

document.addEventListener('keydown',event=>{
 if(event.key==='Tab'){
  const overlay=getState().overlay;
  const root=overlay==='search'?q('#universal-search-panel'):overlay==='layers'?q('#layer-manager'):overlay==='navigation'?q('.rail'):overlay==='modal'?q('#modal'):overlay==='inspector'&&matchMedia('(max-width:767px)').matches?q('#detail-panel'):null;
  if(root&&trapOverlayFocus(event,root))return;
 }
 if(event.key!=='Escape')return;
 const overlay=getState().overlay;
 if(overlay==='search'){closeSearch();return}
 if(overlay==='layers'){closeLayerManager();return}
 if(overlay==='navigation'){closeDrawer();closeOverlay();return}
 if(overlay==='inspector'){q('#close-panel')?.click();closeOverlay();return}
 if(overlay==='modal'&&q('#modal')?.open){q('#modal-close')?.click();closeOverlay();return}
 if(!document.body.classList.contains('panel-hidden'))q('#close-panel')?.click();
});

const relabel=()=>{
 const labels={overview:'Ringkasan',structure:'Struktur',simulation:'Simulasi',exterior:'Buka Interior',sources:'Referensi'};
 qa('[data-tab]').forEach(btn=>{if(labels[btn.dataset.tab])btn.textContent=labels[btn.dataset.tab]});
 const focus=q('#focus-machine');if(focus)focus.textContent='Pusatkan di 3D';
 const top=q('.panel-top .eyebrow');if(top)top.textContent='KONTEKS TERPILIH';
 const search=q('#global-search');if(search)search.placeholder='Cari OFFSET 5, komponen, area, atau dokumen…';
 const connection=q('#connection');if(connection)connection.textContent=navigator.onLine?'Data tersedia':'Offline';
};
relabel();const hydratedState=hydrateUrl();if(hydratedState.viewMode==='2d')q('#mode-2d')?.click();subscribe(state=>{markSection(state.activeSection);syncLayerControls()});
document.documentElement.dataset.uiArchitecture='v162-factory-first-systems';
