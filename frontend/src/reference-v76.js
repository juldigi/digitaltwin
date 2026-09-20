const v76=q=>document.querySelector(q);
const v76all=q=>[...document.querySelectorAll(q)];

function v76MachineName(){return v76('#view-title')?.textContent?.trim()||'Mesin';}
function v76MachineModel(){return v76('#view-subtitle')?.textContent?.trim()||'Model 3D';}
function v76MiniMachine(){
  return '<div class="v76-mini-machine" aria-hidden="true">'+Array.from({length:10},()=>'<i></i>').join('')+'</div>';
}
function v76SetSmall(id,label){
  const el=v76(id+' small');if(el)el.textContent=label;
}
function v76Delegate(selector){
  const target=v76(selector);if(target)target.click();
}
function v76BuildLogo(){
  if(v76('.v76-logo-block'))return;
  const logo=document.createElement('div');logo.className='v76-logo-block';logo.innerHTML='<strong>BMJ</strong><small>PACKAGING</small>';document.body.append(logo);
}
function v76BuildRail(){
  const rail=v76('.rail');if(!rail)return;
  v76SetSmall('#nav-machine','Beranda');
  v76SetSmall('#nav-layout','Peta Pabrik');
  v76SetSmall('#nav-assets','Mesin');
  v76SetSmall('#nav-components','Struktur');
  v76SetSmall('#nav-exterior','Exterior');
  v76SetSmall('#nav-sources','Referensi');
  v76SetSmall('#nav-view-panels','Panel');
  v76SetSmall('#nav-help','Panduan');
  if(!v76('#v76-nav-simulation')){
    const b=document.createElement('button');b.id='v76-nav-simulation';b.type='button';b.title='Simulasi proses';b.innerHTML='<span>▶</span><small>Simulasi</small>';
    v76('#nav-assets')?.after(b);
    b.addEventListener('click',()=>{document.body.classList.remove('nav-open');v76Delegate('#tool-simulation');});
  }
  if(!v76('.v76-rail-foot')){
    const foot=document.createElement('div');foot.className='v76-rail-foot';foot.innerHTML='Better Packaging<br>A Brighter Tomorrow';rail.append(foot);
  }
}
function v76BuildKpis(){
  const kpis=v76('.top-kpis');if(!kpis)return;
  if(!v76('.v76-view-kpi')){
    const view=document.createElement('div');view.className='v76-view-kpi';view.innerHTML='<small>MODE</small><b>3D</b><span>Tampilan interaktif</span>';kpis.append(view);
  }
  if(!v76('.v76-clock-kpi')){
    const clock=document.createElement('div');clock.className='v76-clock-kpi';clock.innerHTML='<small>WAKTU</small><b data-v76-time>--:--</b><span data-v76-date>Hari ini</span>';kpis.append(clock);
  }
  const tick=()=>{
    const now=new Date(),time=v76('[data-v76-time]'),date=v76('[data-v76-date]');
    if(time)time.textContent=now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
    if(date)date.textContent=now.toLocaleDateString('id-ID',{weekday:'short',day:'2-digit',month:'short'});
  };
  tick();setInterval(tick,30000);
}
function v76BuildReferenceControls(){
  const legend=v76('.asset-legend');
  if(legend){
    legend.hidden=false;
    const machine=v76('#legend-machine'),all=v76('#legend-all'),clean=v76('#legend-clean');
    if(machine)machine.textContent='Fokus Utama';
    if(all)all.textContent='Semua Mesin';
    if(clean)clean.textContent='Tampilan Sederhana';
  }
}
function v76SelectedLabel(){
  const selected=v76('.part-label.is-selected .part-label-name')||v76('.part-label:not([hidden]) .part-label-name');
  const stage=v76('[data-part-label-stage]')?.textContent?.trim();
  return {name:selected?.textContent?.trim()||v76MachineName(),stage:stage||'Mesin · model 3D'};
}
function v76BuildSelectionCard(){
  const workspace=v76('.workspace');if(!workspace||v76('.v76-selection-card'))return;
  const card=document.createElement('section');card.className='v76-selection-card';card.setAttribute('aria-label','Komponen terpilih');
  card.innerHTML='<div class="v76-card-kicker">Komponen Terpilih</div>'+v76MiniMachine()+
    '<div class="v76-selection-main"><strong data-v76-selection-title></strong><small data-v76-selection-sub></small><span class="v76-state">Model siap ditampilkan</span></div>'+
    '<div class="v76-selection-data">'+
      '<div><span>Mesin</span><b data-v76-machine></b></div>'+
      '<div><span>Struktur</span><b data-v76-taxonomy></b></div>'+
      '<div><span>Referensi</span><b data-v76-reference></b></div>'+
      '<div><span>Data operasi</span><b>Belum tersedia</b></div>'+
    '</div><button type="button" class="v76-mobile-detail">Lihat Detail</button>';
  workspace.append(card);
  card.querySelector('.v76-mobile-detail')?.addEventListener('click',()=>{document.body.classList.remove('panel-hidden');document.body.classList.add('mobile-panel-open');v76Delegate('#panel-toggle');});
  v76RefreshSelection();
}
function v76RefreshSelection(){
  const card=v76('.v76-selection-card');if(!card)return;
  const picked=v76SelectedLabel();
  const title=card.querySelector('[data-v76-selection-title]'),sub=card.querySelector('[data-v76-selection-sub]');
  if(title)title.textContent=picked.name;if(sub)sub.textContent=picked.stage+' · '+v76MachineModel();
  const machine=card.querySelector('[data-v76-machine]');if(machine)machine.textContent=v76MachineName();
  const tax=card.querySelector('[data-v76-taxonomy]');if(tax)tax.textContent=(v76('#taxonomy-count')?.textContent||'—')+' bagian';
  const ref=card.querySelector('[data-v76-reference]');if(ref)ref.textContent=(v76('.top-kpis>div:nth-child(2) b')?.textContent||'—');
}
function v76BuildInspector(){
  const panel=v76('#detail-panel');if(!panel)return;
  if(!v76('.v76-breadcrumb')){
    const bc=document.createElement('div');bc.className='v76-breadcrumb';bc.textContent='Mesin › Unit Utama › Sub › Block › Part › Spesifik Part';
    panel.querySelector('.panel-top')?.after(bc);
  }
  if(!v76('.v76-panel-actions')){
    const actions=document.createElement('div');actions.className='v76-panel-actions';
    actions.innerHTML=
      '<button type="button" class="primary" data-v76-action="focus"><span>⌖</span>Fokus</button>'+
      '<button type="button" data-v76-action="explode"><span>◇</span>Urai</button>'+
      '<button type="button" data-v76-action="simulation"><span>▷</span>Simulasi</button>'+
      '<button type="button" data-v76-action="sources"><span>▤</span>Referensi</button>'+
      '<button type="button" data-v76-action="reset"><span>↶</span>Reset</button>';
    panel.append(actions);
    actions.addEventListener('click',e=>{
      const b=e.target.closest('[data-v76-action]');if(!b)return;
      const map={focus:'#focus-machine',explode:'#tool-explode',simulation:'#tool-simulation',sources:'#nav-sources',reset:'[data-camera="reset"]'};
      v76Delegate(map[b.dataset.v76Action]);
    });
  }
}
function v76BuildMobileNav(){
  const nav=v76('.mobile-nav');if(!nav)return;
  const labels={machine:'Beranda',layout:'Peta',assets:'Mesin',components:'Detail'};
  Object.entries(labels).forEach(([key,label])=>{const el=nav.querySelector('[data-mobile-nav="'+key+'"] small');if(el)el.textContent=label;});
}
function v76WatchSelection(){
  const layer=v76('#part-label-layer'),content=v76('#panel-content');
  const obs=new MutationObserver(()=>v76RefreshSelection());
  if(layer)obs.observe(layer,{subtree:true,childList:true,attributes:true,characterData:true});
  if(content)obs.observe(content,{subtree:true,childList:true,attributes:true,characterData:true});
}
function v76Responsive(){
  const mobile=matchMedia('(max-width:767px)');
  const sync=()=>{
    if(!mobile.matches && !document.body.classList.contains('v76-user-closed-panel')){
      document.body.classList.remove('panel-hidden','mobile-panel-open');
    }
  };
  mobile.addEventListener?.('change',sync);sync();
  v76('#close-panel')?.addEventListener('click',()=>{if(!mobile.matches)document.body.classList.add('v76-user-closed-panel');});
  v76('#panel-toggle')?.addEventListener('click',()=>document.body.classList.remove('v76-user-closed-panel'));
}
function v76Boot(){
  document.documentElement.dataset.referenceUi='v76-bmj';
  v76BuildLogo();v76BuildRail();v76BuildKpis();v76BuildReferenceControls();v76BuildSelectionCard();v76BuildInspector();v76BuildMobileNav();v76WatchSelection();v76Responsive();
  setTimeout(v76RefreshSelection,350);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',v76Boot,{once:true});else v76Boot();
