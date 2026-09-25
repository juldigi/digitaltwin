import{getState,setState,setActiveSection,setViewMode,setLayer,setSimulation,setInspector,openOverlay,closeOverlay,subscribe}from'./state/app-state.js';
import{FOUNDATION_SCOPE,canOpenTechnical3D}from'./data/foundation-scope.js';

const q=(s,r=document)=>r.querySelector(s);
// The 2D plan is a sibling of the 3D workspace. Keep this switch outside the
// workspace's paint containment so the full-screen plan cannot cover it.
const modeSwitch=q('.viewport-mode-switch'),centerStack=q('.center-stack');
if(modeSwitch&&centerStack)centerStack.append(modeSwitch);
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
 const target=saved?.isConnected?saved:(fallback?q(fallback):null);
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
<symbol id="i-close" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></symbol><symbol id="i-back" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7M8 12h11"/></symbol>
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
 'nav-machine':'factory','nav-assets':'machine','nav-systems':'system','nav-view':'layers','nav-help':'help','ui-menu-toggle':'menu','settings':'settings',
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
const contextBackIcon=q('#context-back span');if(contextBackIcon)contextBackIcon.innerHTML=icon('back');
const modalBackIcon=q('#modal-back span');if(modalBackIcon)modalBackIcon.innerHTML=icon('back');
const mobileIcons={factory:'factory',asset:'machine',system:'system',more:'more'};
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
let documentLoaded=document.readyState==='complete',splashFinishTimer=0;
const finishSplash=()=>{if(!splash||splash.classList.contains('is-done'))return;splash.classList.add('is-done');sessionStorage.setItem('bmj-splash-seen','1');setTimeout(()=>splash.remove(),600)};
const showBootFailure=(message='Aplikasi belum berhasil dimuat')=>{const boot=q('#boot');if(!boot)return;boot.hidden=false;boot.innerHTML='<strong>'+escapeBootText(message)+'</strong><p>Periksa koneksi atau muat ulang halaman.</p><button type="button" id="boot-retry">Muat Ulang</button>';q('#boot-retry',boot)?.addEventListener('click',()=>location.reload())};
const escapeBootText=value=>String(value||'Aplikasi belum berhasil dimuat').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const syncSplashFromState=state=>{
 const phase=state?.bootState?.phase||'booting';
 if(phase==='error'||phase==='timeout')showBootFailure(state?.bootState?.message||'Aplikasi belum berhasil dimuat');
 if(!documentLoaded||!['ready','error','timeout'].includes(phase))return;
 clearTimeout(splashFinishTimer);splashFinishTimer=setTimeout(finishSplash,firstVisit&&phase==='ready'?900:100);
};
if(!documentLoaded)addEventListener('load',()=>{documentLoaded=true;syncSplashFromState(getState())},{once:true});
const BOOT_TIMEOUT_MS=12500;
setTimeout(()=>{const current=getState();if(current.bootState?.phase!=='booting')return;setState({bootState:{phase:'timeout',message:'Aplikasi belum berhasil dimuat'}},{url:false})},BOOT_TIMEOUT_MS);

const SECTION_BUTTONS={factory:'nav-machine',asset:'nav-assets',system:'nav-systems'};
function primarySectionFor(section){
 return section==='simulation'||section==='reference'?'asset':section;
}
function markSection(section){
 const primary=primarySectionFor(section);
 for(const [key,id]of Object.entries(SECTION_BUTTONS)){
  const el=q('#'+id),active=key===primary;
  el?.classList.toggle('active',active);
  if(el){if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');}
 }
 qa('[data-mobile-nav]').forEach(el=>{const active=el.dataset.mobileNav===primary;el.classList.toggle('active',active);if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')});
}
function closeDrawer(){document.body.classList.remove('nav-open');document.body.classList.remove('drawer-transitioning');const menuButton=q('#ui-menu-toggle');menuButton?.setAttribute('aria-expanded','false');menuButton?.setAttribute('aria-label','Buka navigasi');q('[data-mobile-nav="more"]')?.setAttribute('aria-expanded','false');restoreOverlayFocus('navigation','#ui-menu-toggle')}
function closeLayerManager(){const panel=q('#layer-manager');if(panel)panel.hidden=true;document.body.classList.remove('layer-open');if(getState().overlay==='layers')closeOverlay();restoreOverlayFocus('layers',PHASE1_FOUNDATION?'#nav-machine':'#nav-systems')}
function applyInspectorDom(state=getState()){
 const open=Boolean(state.inspectorState?.open),mobile=matchMedia('(max-width:767px)').matches;
 document.body.classList.toggle('panel-hidden',!open);
 document.body.classList.toggle('mobile-panel-open',open&&mobile);
}
function closeInspector({restoreFocus=true}={}){
 const next=setInspector(false);
 applyInspectorDom(next);
 if(restoreFocus)restoreOverlayFocus('inspector','#panel-toggle');
}
function openInspector(tab=getState().inspectorState.tab){
 beforeMajorOverlay('inspector');rememberOverlayFocus('inspector');
 const next=setInspector(true,tab);applyInspectorDom(next);
 if(matchMedia('(max-width:767px)').matches)focusOverlay(q('#detail-panel'),'#close-panel');
}
function toggleInspector(){
 if(getState().inspectorState?.open)closeInspector();
 else openInspector();
}
q('#panel-toggle')?.addEventListener('click',toggleInspector);
function applyViewModeDom(state=getState()){
 const is2d=state.viewMode==='2d',plan=q('#plant-plan-2d'),viewport=q('#viewport');
 document.body.classList.toggle('workspace-2d',is2d);
 if(plan)plan.hidden=!is2d;
 if(viewport)viewport.setAttribute('aria-hidden',String(is2d));
}
function stopSimulationForNavigation(targetSection){
 const state=getState();
 if(targetSection==='simulation'||(!state.simulationState?.active&&!state.simulationState?.running))return;
 dispatchEvent(new CustomEvent('bmj:simulationstoprequest'));
 setSimulation({active:false,running:false,stage:null,progress:0});
 document.body.classList.remove('simulation-transport-open');
 const bar=q('#simulation-transport');if(bar)bar.hidden=true;
}
function navigateSection(section,{inspectorTab=null}={}){
 stopSimulationForNavigation(section);
 beforeMajorOverlay(inspectorTab?'inspector':section);
 setActiveSection(section);markSection(section);
 if(inspectorTab)openInspector(inspectorTab);
 requestAnimationFrame(syncSimulationTransport);
}
function beforeMajorOverlay(name){
 const current=getState().overlay;
 if(current&&current!==name){
  if(current==='search')closeSearch();
  else if(current==='systems')closeSystemBrowser();
  else if(current==='layers')closeLayerManager();
  else if(current==='navigation')closeDrawer();
   else if(current==='modal'&&q('#modal')?.open)q('#modal-close')?.click();
  if(getState().overlay===current)closeOverlay();
 }
 if(name!=='inspector'&&getState().inspectorState?.open)closeInspector({restoreFocus:false});
 if(name!=='navigation')closeDrawer();
}
function openSystemBrowser(){
 beforeMajorOverlay('systems');rememberOverlayFocus('systems');ensureSystemBrowser();
 const panel=q('#system-browser');panel.hidden=false;document.body.classList.add('system-open');openOverlay('systems');setActiveSection(PHASE1_FOUNDATION?'factory':'system');markSection(PHASE1_FOUNDATION?'factory':'system');syncLayerControls();focusOverlay(panel,'[data-system-close]');
}
function openSystemLayers(){openSystemBrowser()}
function openLayerManager(){
 beforeMajorOverlay('layers');rememberOverlayFocus('layers');ensureLayerManager();
 const panel=q('#layer-manager');panel.hidden=false;document.body.classList.add('layer-open');openOverlay('layers');syncLayerControls();focusOverlay(panel,'[data-layer-close]');
}
function enterSimulation(){
 beforeMajorOverlay('inspector');
 const context=getState();
 if(context.sceneMode!=='machine'||!canOpenTechnical3D(context.selectedAsset)){
  dispatchEvent(new CustomEvent('bmj:simulateselectedmachine',{detail:{selectedAsset:context.selectedAsset}}));
  return;
 }
 setActiveSection('simulation');markSection('simulation');
 if(!q('#mode-3d')?.disabled){document.body.classList.remove('workspace-2d');setViewMode('3d')}
 q('#tool-simulation')?.click();
 openInspector('simulation');
 requestAnimationFrame(syncSimulationTransport);
}
addEventListener('bmj:simulationcontextready',event=>{
 if(event.detail?.available===false){setActiveSection('simulation');markSection('simulation');openInspector('simulation');requestAnimationFrame(syncSimulationTransport);return}
 enterSimulation();
});

const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let searchResults=[],searchActiveIndex=-1,searchTimer=0,suppressSearchFocus=false;
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
 searchActiveIndex=-1;
 suppressSearchFocus=true;
 restoreOverlayFocus('search','#global-search');
 requestAnimationFrame(()=>{suppressSearchFocus=false});
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
globalSearch?.addEventListener('focus',()=>{if(!suppressSearchFocus)openSearch(globalSearch.value)});
globalSearch?.addEventListener('click',()=>{if(getState().overlay!=='search')openSearch(globalSearch.value)});
globalSearch?.addEventListener('input',event=>{if(getState().overlay!=='search')openSearch(event.currentTarget.value);else requestUniversalSearch(event.currentTarget.value)});
globalSearch?.addEventListener('keydown',event=>{if(event.key==='ArrowDown'||event.key==='Enter'){event.preventDefault();openSearch(globalSearch.value)}});
q('#mobile-search-toggle')?.addEventListener('click',()=>openSearch(''));
addEventListener('bmj:searchresults',event=>renderSearchResults(event.detail));
addEventListener('bmj:systemsearchselect',event=>{if(PHASE1_FOUNDATION)return;const system=event.detail?.system||null;setState({selectedSystem:system},{url:false});openSystemLayers();if(['hvac','compressedAir','routing'].includes(system))q(`[data-system-focus="${system}"]`)?.click()});
q('#nav-systems')?.addEventListener('click',()=>{if(!PHASE1_FOUNDATION){stopSimulationForNavigation('system');openSystemBrowser()}});
q('#nav-view')?.addEventListener('click',openLayerManager);

const menu=q('#ui-menu-toggle');
menu?.addEventListener('click',()=>{const open=getState().overlay!=='navigation';document.body.classList.add('drawer-transitioning');if(open){beforeMajorOverlay('navigation');rememberOverlayFocus('navigation')}document.body.classList.toggle('nav-open',open);requestAnimationFrame(()=>document.body.classList.remove('drawer-transitioning'));menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Tutup navigasi':'Buka navigasi');if(open){openOverlay('navigation');focusOverlay(q('.rail'),'.rail button:not([hidden])')}else{closeOverlay();restoreOverlayFocus('navigation','#ui-menu-toggle')}});
q('#ui-backdrop')?.addEventListener('click',()=>{
 const overlay=getState().overlay;
 if(overlay==='search')closeSearch();
 else if(overlay==='systems')closeSystemBrowser();
 else if(overlay==='layers')closeLayerManager();
 else if(overlay==='navigation')closeDrawer();
 else if(overlay==='modal'&&q('#modal')?.open)q('#modal-close')?.click();
 else closeOverlay();
});
qa('.rail button').forEach(b=>b.addEventListener('click',()=>{if(innerWidth<768)closeDrawer()}));

qa('[data-mobile-nav]').forEach(button=>button.addEventListener('click',event=>{
 if(!matchMedia('(max-width:767px)').matches)return;
 const key=button.dataset.mobileNav;
 if(key==='more'){
  event.preventDefault();
  if(getState().overlay==='navigation'){closeDrawer();closeOverlay();return;}
  beforeMajorOverlay('navigation');rememberOverlayFocus('navigation');document.body.classList.add('nav-open');
  menu?.setAttribute('aria-expanded','true');button.setAttribute('aria-expanded','true');menu?.setAttribute('aria-label','Tutup navigasi');
  openOverlay('navigation');const rail=q('.rail');if(rail)requestAnimationFrame(()=>focusOverlay(rail,'.rail button:not([hidden])'));return;
 }
 if(document.body.classList.contains('nav-open')){closeDrawer();if(getState().overlay==='navigation')closeOverlay();}
 if(key==='factory'){dispatchEvent(new CustomEvent('bmj:mobilefactoryrequest'));return;}
 if(key==='asset'){dispatchEvent(new CustomEvent('bmj:mobileassetrequest'));return;}
 if(key==='system'){stopSimulationForNavigation('system');openSystemBrowser();}
}));

q('#mode-2d')?.addEventListener('click',()=>{
 const current=getState(),simulationTab=current.inspectorState?.tab==='simulation';
 if(current.simulationState?.active||simulationTab)dispatchEvent(new CustomEvent('bmj:simulationstoprequest'));
 if(current.inspectorState?.open&&simulationTab)q('[data-tab="overview"]')?.click();
 const next=setViewMode('2d');applyViewModeDom(next);setActiveSection('factory');markSection('factory');requestAnimationFrame(()=>dispatchEvent(new Event('resize')));
});
q('#mode-3d')?.addEventListener('click',()=>{const next=setViewMode('3d');applyViewModeDom(next);const section=getState().sceneMode==='machine'?'asset':'factory';stopSimulationForNavigation(section);setActiveSection(section);markSection(section);requestAnimationFrame(()=>{dispatchEvent(new Event('resize'));syncSimulationTransport()})});

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
function systemSurfaceMarkup(){
 return PHASE1_FOUNDATION?'':`<div class="canonical-system-grid">
  <button type="button" data-system-focus="hvac"><strong>HVAC</strong><small>Pipa AHU + ducting</small><span>Lihat jalur & peralatan</span></button>
  <button type="button" data-system-focus="compressedAir"><strong>Udara Bertekanan</strong><small>Pipa distribusi udara</small><span>Lihat jalur & peralatan</span></button>
  <button type="button" data-system-focus="routing"><strong>Jalur Utilitas</strong><small>Semua jalur yang tersedia</small><span>Lihat seluruh jalur</span></button>
  <button type="button" data-system-focus="water" class="system-unavailable"><strong>Air / IPAL</strong><small>Peralatan tersedia · jalur belum tersedia</small><span>Lihat batas data</span></button>
  <button type="button" data-system-focus="electrical" class="system-unavailable"><strong>Kelistrikan</strong><small>Jalur terpisah belum tersedia</small><span>Lihat batas data</span></button>
 </div><section id="system-context" class="canonical-system-context" aria-live="polite"><p>Pilih sistem untuk melihat jalur, peralatan terkait, status data, dan batas verifikasi.</p></section>`;
}
function bindSystemFocus(panel){
 if(PHASE1_FOUNDATION)return;
 qa('[data-system-focus]',panel).forEach(button=>button.addEventListener('click',()=>{
  if(q('#mode-3d')?.disabled)return;
  const system=button.dataset.systemFocus,keys=system==='hvac'?['ahuPiping','ducting']:system==='compressedAir'?['compressedAir']:system==='routing'?['compressedAir','ahuPiping','ducting','utilityAnchors']:[];
  document.body.classList.remove('workspace-2d');setViewMode('3d');setState({selectedSystem:system,activeSection:'system'},{url:false});
  qa('[data-system-focus]',panel).forEach(item=>item.classList.toggle('active',item===button));
  for(const key of keys){setLayer(key,true);dispatchEvent(new CustomEvent('bmj:layerchange',{detail:{key,visible:true}}))}
  syncLayerControls();markSection('system');dispatchEvent(new CustomEvent('bmj:systemfocus',{detail:{system}}));
 }));
}
function ensureSystemBrowser(){
 if(q('#system-browser'))return;
 const panel=document.createElement('section');panel.id='system-browser';panel.className='canonical-layer-manager canonical-system-browser';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','system-browser-title');panel.setAttribute('tabindex','-1');
 panel.innerHTML=`<header><div><small>SISTEM PABRIK</small><h3 id="system-browser-title">Sistem</h3></div><button type="button" data-system-close class="icon-btn" aria-label="Tutup">${icon('close')}</button></header>
 <p id="system-unavailable-note" role="status" hidden>Fitur sistem 3D memerlukan WebGL. Denah 2D tetap tersedia.</p>
 ${systemSurfaceMarkup()}
 <div class="canonical-layer-group unavailable"><h4>Batas data</h4><p>Jalur yang belum memiliki gambar atau verifikasi lapangan tetap ditandai belum tersedia. Aplikasi tidak membuat jalur aktual secara otomatis.</p></div>`;
 document.body.append(panel);q('[data-system-close]',panel)?.addEventListener('click',closeSystemBrowser);bindSystemFocus(panel);
}
function closeSystemBrowser(){const panel=q('#system-browser');if(panel)panel.hidden=true;document.body.classList.remove('system-open');if(getState().overlay==='systems')closeOverlay();restoreOverlayFocus('systems','#nav-systems')}
function ensureLayerManager(){
 if(q('#layer-manager'))return;
 const panel=document.createElement('section');panel.id='layer-manager';panel.className='canonical-layer-manager';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','layer-manager-title');panel.setAttribute('tabindex','-1');
 const layerControls=GROUPS.map(([title,items])=>`<div class="canonical-layer-group"><h4>${title}</h4>${items.map(([key,label])=>`<label><span>${label}</span><input type="checkbox" data-canonical-layer="${key}"></label>`).join('')}</div>`).join('');
 panel.innerHTML=`<header><div><small>TAMPILAN</small><h3 id="layer-manager-title">Pengaturan Tampilan</h3></div><button type="button" data-layer-close class="icon-btn" aria-label="Tutup">${icon('close')}</button></header>
 <p id="layer-unavailable-note" role="status" hidden>Layer 3D memerlukan WebGL. Denah 2D tetap tersedia.</p>
 ${layerControls}
 <div class="canonical-layer-group unavailable"><h4>Tentang tampilan</h4><p>Pengaturan ini hanya mengubah apa yang terlihat di layar. Data sumber dan posisi objek tidak berubah.</p></div>`;
 document.body.append(panel);
 q('[data-layer-close]',panel)?.addEventListener('click',closeLayerManager);
 qa('[data-canonical-layer]',panel).forEach(input=>input.addEventListener('change',()=>{
  const key=input.dataset.canonicalLayer,visible=input.checked;setLayer(key,visible);
  dispatchEvent(new CustomEvent('bmj:layerchange',{detail:{key,visible}}));
 }));
}
function syncLayerControls(){
 const state=getState(),unavailable=Boolean(q('#mode-3d')?.disabled);
 const note=q('#layer-unavailable-note');if(note)note.hidden=!unavailable;const systemNote=q('#system-unavailable-note');if(systemNote)systemNote.hidden=!unavailable;
 qa('[data-canonical-layer]').forEach(input=>{input.checked=Boolean(state.visibleLayers[input.dataset.canonicalLayer]);input.disabled=unavailable;input.title=unavailable?'Layer 3D memerlukan WebGL':''});
 qa('[data-system-focus]').forEach(button=>{button.disabled=unavailable;button.title=unavailable?'Fokus jalur 3D memerlukan WebGL':''});
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
 q('[data-transport-play]',bar).addEventListener('click',()=>dispatchEvent(new CustomEvent('bmj:simulationcommand',{detail:{action:'toggle'}})));
 q('[data-transport-stop]',bar).addEventListener('click',()=>dispatchEvent(new CustomEvent('bmj:simulationcommand',{detail:{action:'stop'}})));
 q('[data-transport-speed]',bar).addEventListener('change',e=>dispatchEvent(new CustomEvent('bmj:simulationcommand',{detail:{action:'speed',value:e.target.value}})));
 return bar;
}
function syncSimulationTransport(state=getState()){
 const bar=ensureSimulationTransport(),section=state.activeSection,sim=state.simulationState||{};
 const progress=Math.max(0,Math.min(100,(Number(sim.progress)||0)*100)),stage=sim.stage||'Siap';
 const transportOpen=section==='simulation'&&state.inspectorState?.tab==='simulation'&&Boolean(state.selectedAsset)&&sim.available!==false&&!sim.blocked;
 bar.hidden=!transportOpen;
 document.body.classList.toggle('simulation-transport-open',transportOpen);
 q('[data-transport-stage]',bar).textContent=stage;
 q('[data-transport-progress]',bar).value=progress;
 const play=q('[data-transport-play]',bar);play.textContent=sim.running?'Jeda':sim.active?'Lanjutkan':'Mulai';
 q('[data-transport-stop]',bar).disabled=!sim.active;
 const speed=String(sim.speed||1),speedSelect=q('[data-transport-speed]',bar);if([...speedSelect.options].some(option=>option.value===speed))speedSelect.value=speed;
}
ensureLayerManager();ensureSimulationTransport();

const INSPECTOR_TAB_SECTION={overview:'asset',structure:'asset',data:'asset',exterior:'asset',simulation:'simulation',sources:'reference'};
qa('#detail-panel [role="tab"]').forEach(tab=>tab.addEventListener('click',()=>{
 const tabKey=tab.dataset.tab||'overview',section=INSPECTOR_TAB_SECTION[tabKey]||'asset';
 if(section!=='simulation')stopSimulationForNavigation(section);
 setInspector(true,tabKey);setActiveSection(section);markSection(section);requestAnimationFrame(syncSimulationTransport);
}));
q('#close-panel')?.addEventListener('click',()=>closeInspector());
const modalElement=q('#modal');
addEventListener('bmj:modalopenrequest',()=>{beforeMajorOverlay('modal');openOverlay('modal')});
addEventListener('bmj:modalcloserequest',()=>{if(getState().overlay==='modal')closeOverlay()});
modalElement?.addEventListener('cancel',event=>{event.preventDefault();q('#modal-close')?.click()});
const syncViewport=()=>{document.documentElement.style.setProperty('--app-vh',`${window.visualViewport?.height||innerHeight}px`);const w=innerWidth;if(w>=768&&getState().overlay==='navigation'){closeDrawer();closeOverlay()}const next=setState({deviceMode:w<768?'mobile':w<=1180?'tablet':'desktop'},{url:false});applyInspectorDom(next)};
syncViewport();addEventListener('resize',syncViewport,{passive:true});window.visualViewport?.addEventListener('resize',syncViewport,{passive:true});

function syncInspectorTabs(state=getState()){
 const tabs=qa('#detail-panel [role="tab"]').filter(tab=>tab.getAttribute('aria-hidden')!=='true'),activeKey=state.inspectorState?.tab||'overview';
 const active=tabs.find(tab=>tab.dataset.tab===activeKey)||tabs[0];
 tabs.forEach(tab=>{const selected=tab===active;tab.setAttribute('aria-controls','panel-content');tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1});
}
const inspectorTablist=q('#detail-panel .tabs');
inspectorTablist?.addEventListener('keydown',event=>{
 const tabs=qa('[role="tab"]',inspectorTablist).filter(tab=>!tab.hidden&&tab.getAttribute('aria-hidden')!=='true');
 const current=tabs.indexOf(document.activeElement);if(current<0)return;
 let next=current;
 if(event.key==='ArrowRight')next=(current+1)%tabs.length;
 else if(event.key==='ArrowLeft')next=(current-1+tabs.length)%tabs.length;
 else if(event.key==='Home')next=0;
 else if(event.key==='End')next=tabs.length-1;
 else return;
 event.preventDefault();tabs[next].focus();tabs[next].click();
});
syncInspectorTabs(getState());

document.addEventListener('keydown',event=>{
 if(event.key==='Tab'){
  const overlay=getState().overlay;
  const root=overlay==='search'?q('#universal-search-panel'):overlay==='systems'?q('#system-browser'):overlay==='layers'?q('#layer-manager'):overlay==='navigation'?q('.rail'):overlay==='modal'?q('#modal'):null;
  if(root&&trapOverlayFocus(event,root))return;
 }
 if(event.key!=='Escape')return;
 const overlay=getState().overlay;
 if(overlay==='search'){closeSearch();return}
 if(overlay==='systems'){closeSystemBrowser();return}
 if(overlay==='layers'){closeLayerManager();return}
 if(overlay==='navigation'){closeDrawer();closeOverlay();return}
 if(overlay==='modal'&&q('#modal')?.open){q('#modal-close')?.click();closeOverlay();return}
 if(getState().inspectorState?.open)closeInspector();
});

const relabel=()=>{
 const labels={overview:'Ringkasan',structure:'Struktur',simulation:'Simulasi',exterior:'Buka Interior',sources:'Referensi'};
 qa('[data-tab]').forEach(btn=>{if(labels[btn.dataset.tab])btn.textContent=labels[btn.dataset.tab]});
 const focus=q('#focus-machine');if(focus)focus.textContent='Fokus di 3D';
 const top=q('.panel-top .eyebrow');if(top)top.textContent='KONTEKS TERPILIH';
 const search=q('#global-search');if(search)search.placeholder='Cari mesin, area, komponen, sistem, atau sumber…';
 const connection=q('#connection');if(connection)connection.textContent=navigator.onLine?'Data tersedia':'Offline';
};
function syncAccessibleControls(state){
 const panelToggle=q('#panel-toggle');if(panelToggle){const open=Boolean(state.inspectorState?.open);panelToggle.setAttribute('aria-expanded',String(open));panelToggle.setAttribute('aria-label',open?'Tutup detail pilihan':'Buka detail pilihan')}
 const mode2d=q('#mode-2d'),mode3d=q('#mode-3d'),is2d=state.viewMode==='2d';
 if(mode2d){mode2d.setAttribute('aria-pressed',String(is2d));mode2d.classList.toggle('active',is2d)}
 if(mode3d){mode3d.setAttribute('aria-pressed',String(!is2d));mode3d.classList.toggle('active',!is2d)}
}
function syncVisualHierarchy(state){
 const body=document.body,primary=primarySectionFor(state.activeSection);
 const hasSelection=Boolean(state.selectedAsset||state.selectedNode||state.selectedSystem||state.activeReference);
 body.dataset.sceneMode=state.sceneMode==='machine'?'machine':'factory';
 body.dataset.primarySection=primary;
 body.dataset.hasSelection=String(hasSelection);
 body.classList.toggle('context-selected',hasSelection);
 const heading=q('.scene-heading');
 if(heading)heading.classList.toggle('is-contextual',hasSelection||state.sceneMode==='machine');
 const toolbar=q('.scene-bottom');
 if(toolbar)toolbar.setAttribute('aria-label',state.sceneMode==='machine'?'Kontrol tampilan dan inspeksi mesin':'Kontrol tampilan pabrik');
 const back=q('#context-back');
 if(back){
  const canGoParent=Boolean(state.selectedAsset||state.selectedNode||state.sceneMode==='machine');
  back.hidden=!canGoParent;
  back.setAttribute('aria-label',state.selectedNode?'Kembali ke tingkat komponen sebelumnya':state.sceneMode==='machine'?'Kembali ke aset di pabrik':'Kembali ke pabrik');
 }
}
function syncViewModeText(el,next2d,is2d){
 if(!el)return;
 if(is2d){
  const last2d=el.dataset.viewMode2dText||'';
  if(el.dataset.viewModeCopy!=='2d'||el.textContent!==last2d)el.dataset.viewMode3dText=el.textContent;
  el.dataset.viewMode2dText=next2d;el.dataset.viewModeCopy='2d';if(el.textContent!==next2d)el.textContent=next2d;return;
 }
 if(el.dataset.viewModeCopy==='2d'){
  if(Object.prototype.hasOwnProperty.call(el.dataset,'viewMode3dText'))el.textContent=el.dataset.viewMode3dText;
  delete el.dataset.viewMode2dText;delete el.dataset.viewMode3dText;delete el.dataset.viewModeCopy;
 }
}
function syncViewModeContext(state){
 const is2d=state.viewMode==='2d',hasAsset=Boolean(state.selectedAsset);
 syncViewModeText(q('#view-kicker'),'DENAH PABRIK · 2D',is2d);
 syncViewModeText(q('#view-subtitle'),hasAsset?'Aset terpilih ditandai pada denah pabrik':'Posisi mesin, area produksi, dan konteks pabrik',is2d);
 syncViewModeText(q('#geometry-caption'),hasAsset?'Denah 2D · Aset terpilih':'Denah 2D · Seluruh Area',is2d);
 syncViewModeText(q('#scene-hint'),hasAsset?'Aset terpilih ditandai pada denah · pilih aset lain melalui menu Aset':'Pilih aset melalui menu Aset atau denah 2D.',is2d);
}
function syncPressedTools(state=getState()){
 const values={
  'tool-explode':Boolean(state.inspectionMode?.explode),
  'tool-isolate':Boolean(state.inspectionMode?.isolate),
  'tool-interior':Boolean(state.inspectionMode?.interior),
  labels:Boolean(state.visibleLayers?.labels)
 };
 for(const [id,active] of Object.entries(values)){const el=q('#'+id);if(el){el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));}}
}
relabel();const initialState=getState();applyViewModeDom(initialState);syncSplashFromState(initialState);syncPressedTools(initialState);syncInspectorTabs(initialState);subscribe(state=>{applyInspectorDom(state);applyViewModeDom(state);markSection(state.activeSection);syncLayerControls();syncAccessibleControls(state);syncPressedTools(state);syncInspectorTabs(state);syncVisualHierarchy(state);syncViewModeContext(state);syncSplashFromState(state);syncSimulationTransport(state)});
document.documentElement.dataset.uiArchitecture='v212-ui-ssot';
