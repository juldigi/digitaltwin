import{getState,setState,setActiveSection,setViewMode,setLayer,setSimulation,setInspector,openOverlay,closeOverlay,hydrateUrl,subscribe}from'./state/app-state.js';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>[...r.querySelectorAll(s)];
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
</svg>`;
document.body.insertAdjacentHTML('afterbegin',symbols);

const iconMap={
 'nav-machine':'factory','nav-assets':'machine','nav-systems':'system','nav-simulation-mode':'simulation',
 'nav-sources':'file','nav-help':'help','nav-settings':'settings','ui-menu-toggle':'menu','settings':'settings',
 'close-panel':'close','modal-close':'close','ui-theme-toggle':'theme','global-search-icon':'search','layer-manager-button':'layers'
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
function closeDrawer(){document.body.classList.remove('nav-open');q('#ui-menu-toggle')?.setAttribute('aria-expanded','false')}
function closeLayerManager(){const panel=q('#layer-manager');if(panel)panel.hidden=true;if(getState().overlay==='layers')closeOverlay()}
function closeInspector(){document.body.classList.add('panel-hidden');document.body.classList.remove('mobile-panel-open');setInspector(false)}
function beforeMajorOverlay(name){
 const state=getState();
 if(state.overlay&&state.overlay!==name)closeLayerManager();
 if(name!=='inspector'&&!document.body.classList.contains('panel-hidden'))closeInspector();
 closeDrawer();
}
function openSystemLayers(){
 beforeMajorOverlay('layers');ensureLayerManager();
 const panel=q('#layer-manager');panel.hidden=false;openOverlay('layers');setActiveSection('system');markSection('system');syncLayerControls();
}
function enterSimulation(){
 beforeMajorOverlay('inspector');setActiveSection('simulation');markSection('simulation');
 document.body.classList.remove('workspace-2d');
 q('#tool-simulation')?.click();
 setInspector(true,'simulation');openOverlay('inspector');
 requestAnimationFrame(syncSimulationTransport);
}
q('#nav-machine')?.addEventListener('click',()=>{setActiveSection('factory');document.body.classList.remove('workspace-2d');setViewMode('3d');markSection('factory');closeLayerManager()});
q('#nav-assets')?.addEventListener('click',()=>{beforeMajorOverlay('modal');setActiveSection('asset');markSection('asset');openOverlay('modal')});
q('#nav-systems')?.addEventListener('click',openSystemLayers);
q('#nav-simulation-mode')?.addEventListener('click',enterSimulation);
q('#nav-sources')?.addEventListener('click',()=>{beforeMajorOverlay('inspector');setActiveSection('reference');markSection('reference');setInspector(true,'sources');openOverlay('inspector')});
q('#nav-help')?.addEventListener('click',()=>{beforeMajorOverlay('modal');openOverlay('modal')});
q('#nav-settings')?.addEventListener('click',()=>{beforeMajorOverlay('modal');q('#settings')?.click();openOverlay('modal')});

const menu=q('#ui-menu-toggle');
menu?.addEventListener('click',()=>{const open=!document.body.classList.contains('nav-open');document.body.classList.toggle('nav-open',open);menu.setAttribute('aria-expanded',String(open));if(open)openOverlay('navigation');else closeOverlay()});
q('#ui-backdrop')?.addEventListener('click',()=>{closeDrawer();closeLayerManager();if(getState().overlay!=='inspector')closeOverlay()});
qa('.rail button').forEach(b=>b.addEventListener('click',()=>{if(innerWidth<768&&b.id!=='nav-systems')closeDrawer()}));

const MOBILE_TARGET={factory:'nav-machine',asset:'nav-assets',system:'nav-systems',simulation:'nav-simulation-mode'};
qa('[data-mobile-nav]').forEach(button=>button.addEventListener('click',event=>{
 if(!matchMedia('(max-width:767px)').matches)return;
 const key=button.dataset.mobileNav;
 if(key==='more'){event.preventDefault();const open=!document.body.classList.contains('nav-open');document.body.classList.toggle('nav-open',open);menu?.setAttribute('aria-expanded',String(open));if(open)openOverlay('navigation');return}
 const target=MOBILE_TARGET[key];if(target)q('#'+target)?.click();
}));

q('#mode-2d')?.addEventListener('click',()=>{document.body.classList.add('workspace-2d');setViewMode('2d');setActiveSection('factory');markSection('factory');requestAnimationFrame(()=>dispatchEvent(new Event('resize')))});
q('#mode-3d')?.addEventListener('click',()=>{document.body.classList.remove('workspace-2d');setViewMode('3d');setActiveSection('factory');markSection('factory');requestAnimationFrame(()=>dispatchEvent(new Event('resize')))});

const GROUPS=[
 ['Bangunan',[['building','Dinding & ruangan'],['roof','Atap'],['landscape','Area luar']]],
 ['Produksi',[['machines','Mesin'],['labels','Label'],['unidentified','Area belum teridentifikasi']]],
 ['Utilitas',[['compressedAir','Pipa compressed air'],['ahuPiping','Pipa AHU'],['ducting','Ducting AHU'],['utilityAnchors','Titik koneksi referensi']]],
 ['Informasi',[['reference','Garis denah sumber']]]
];
function ensureLayerManager(){
 if(q('#layer-manager'))return;
 const panel=document.createElement('section');panel.id='layer-manager';panel.className='canonical-layer-manager';panel.hidden=true;panel.setAttribute('aria-label','Kelola lapisan');
 panel.innerHTML=`<header><div><small>SISTEM & TAMPILAN</small><h3>Lapisan</h3></div><button type="button" data-layer-close class="icon-btn" aria-label="Tutup">${icon('close')}</button></header>
 ${GROUPS.map(([title,items])=>`<div class="canonical-layer-group"><h4>${title}</h4>${items.map(([key,label])=>`<label><span>${label}</span><input type="checkbox" data-canonical-layer="${key}"></label>`).join('')}</div>`).join('')}
 <div class="canonical-layer-group unavailable"><h4>Belum memiliki layer terpisah</h4><p>Water / IPAL dan Electrical tetap mengikuti model bangunan sampai routing aktual tersedia.</p></div>`;
 q('.workspace')?.append(panel);
 q('[data-layer-close]',panel)?.addEventListener('click',closeLayerManager);
 qa('[data-canonical-layer]',panel).forEach(input=>input.addEventListener('change',()=>{
  const key=input.dataset.canonicalLayer,visible=input.checked;setLayer(key,visible);
  dispatchEvent(new CustomEvent('bmj:layerchange',{detail:{key,visible}}));
 }));
}
function syncLayerControls(){
 const state=getState();qa('[data-canonical-layer]').forEach(input=>{input.checked=Boolean(state.visibleLayers[input.dataset.canonicalLayer])});
}

function ensureSimulationTransport(){
 let bar=q('#simulation-transport');if(bar)return bar;
 bar=document.createElement('section');bar.id='simulation-transport';bar.className='canonical-simulation-transport';bar.hidden=true;bar.setAttribute('aria-label','Kontrol simulasi');
 bar.innerHTML=`<div class="sim-context"><small>SIMULASI PROSES</small><strong data-transport-stage>Siap</strong></div><button type="button" data-transport-play class="primary" aria-label="Mulai atau jeda simulasi">Mulai</button><label>Kecepatan<select data-transport-speed aria-label="Kecepatan simulasi"><option value=".5">0.5×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label><progress max="100" value="0" data-transport-progress aria-label="Progres simulasi"></progress><button type="button" data-transport-stop>Stop</button>`;
 q('.workspace')?.append(bar);
 q('[data-transport-play]',bar).addEventListener('click',()=>{const s=getState().simulationState;const target=s.active?(q('#sim-pause')||q('#sim-start')):q('#sim-start');target?.click();requestAnimationFrame(syncSimulationTransport)});
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
const bodyObserver=new MutationObserver(()=>{
 const open=!document.body.classList.contains('panel-hidden');setInspector(open);
 if(!open&&getState().overlay==='inspector')closeOverlay();
});
bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});

addEventListener('bmj:domainstate',event=>{
 const detail=event.detail||{};
 setState(detail,{url:false});
});
const syncViewport=()=>{document.documentElement.style.setProperty('--app-vh',`${visualViewport?.height||innerHeight}px`);const w=innerWidth;setTimeout(()=>window.BMJAppState?.setState({deviceMode:w<768?'mobile':w<=1180?'tablet':'desktop'},{url:false}),0)};
syncViewport();addEventListener('resize',syncViewport,{passive:true});visualViewport?.addEventListener('resize',syncViewport,{passive:true});

document.addEventListener('keydown',event=>{
 if(event.key!=='Escape')return;
 const overlay=getState().overlay;
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
 const search=q('#global-search');if(search)search.placeholder='Cari mesin, area, komponen, sistem, atau dokumen…';
 const connection=q('#connection');if(connection)connection.textContent=navigator.onLine?'Data tersedia':'Offline';
};
relabel();hydrateUrl();subscribe(state=>{markSection(state.activeSection);syncLayerControls()});
document.documentElement.dataset.uiArchitecture='v149-safe-shell';
