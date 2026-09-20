const m75=q=>document.querySelector(q);
const m75all=q=>[...document.querySelectorAll(q)];
let lastPrimary='machine';

function setMobileNavActive(name){
  if(name!=='menu')lastPrimary=name;
  m75all('[data-mobile-nav]').forEach(button=>{
    const active=button.dataset.mobileNav===name;
    button.classList.toggle('active',active);
    if(active)button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current');
  });
}
function closeMobileMenu(){
  document.body.classList.remove('nav-open');
  const menu=m75('[data-mobile-nav="menu"]');
  menu?.setAttribute('aria-expanded','false');
}
function openMobileMenu(){
  document.body.classList.remove('mobile-panel-open','ui-workbench-open');
  document.body.classList.add('panel-hidden','nav-open');
  const menu=m75('[data-mobile-nav="menu"]');
  menu?.setAttribute('aria-expanded','true');
  setMobileNavActive('menu');
}
function bindMobileFlagship(){
  const mobile=matchMedia('(max-width:767px)');
  const targets={
    machine:'#nav-machine',
    layout:'#nav-layout',
    assets:'#nav-assets',
    components:'#nav-components'
  };
  m75all('[data-mobile-nav]').forEach(button=>button.addEventListener('click',event=>{
    if(!mobile.matches)return;
    event.stopPropagation();
    const key=button.dataset.mobileNav;
    if(key==='menu'){
      if(document.body.classList.contains('nav-open')){closeMobileMenu();setMobileNavActive(lastPrimary);}
      else openMobileMenu();
      return;
    }
    closeMobileMenu();
    document.body.classList.remove('ui-workbench-open','mobile-panel-open');
    if(key!=='components')document.body.classList.add('panel-hidden');
    m75(targets[key])?.click();
    setMobileNavActive(key);
  }));

  Object.entries(targets).forEach(([key,selector])=>{
    m75(selector)?.addEventListener('click',()=>{if(mobile.matches){closeMobileMenu();setMobileNavActive(key);}});
  });

  m75('#panel-toggle')?.addEventListener('click',()=>{if(mobile.matches)closeMobileMenu();});
  m75('#ui-backdrop')?.addEventListener('click',()=>{if(mobile.matches){closeMobileMenu();if(!document.body.classList.contains('mobile-panel-open')&&!document.body.classList.contains('ui-workbench-open'))setMobileNavActive(lastPrimary);}});

  const observer=new MutationObserver(()=>{
    if(!mobile.matches)return;
    const menuOpen=document.body.classList.contains('nav-open');
    if(menuOpen)setMobileNavActive('menu');
    const menu=m75('[data-mobile-nav="menu"]');
    menu?.setAttribute('aria-expanded',menuOpen?'true':'false');
  });
  observer.observe(document.body,{attributes:true,attributeFilter:['class']});

  const sync=()=>{
    const nav=m75('.mobile-nav');
    if(nav)nav.hidden=!mobile.matches;
    if(!mobile.matches)closeMobileMenu();
  };
  mobile.addEventListener?.('change',sync);
  sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindMobileFlagship,{once:true});
else bindMobileFlagship();
