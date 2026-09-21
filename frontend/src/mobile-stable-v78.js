const m78=q=>document.querySelector(q);
function m78CleanTransient(){
  document.body.classList.remove('nav-open','ui-workbench-open');
  document.querySelectorAll('.floating-window').forEach(el=>{if(!el.closest('#detail-panel'))el.hidden=true;});
}
function m78Sync(){
  if(!matchMedia('(max-width:767px)').matches)return;
  const open=!document.body.classList.contains('panel-hidden');
  if(open){
    m78CleanTransient();
    document.body.classList.add('mobile-panel-open');
  }else{
    document.body.classList.remove('mobile-panel-open');
  }
}
function m78Boot(){
  if(!matchMedia('(max-width:767px)').matches)return;
  document.body.classList.add('light-mode');
  const observer=new MutationObserver(m78Sync);
  observer.observe(document.body,{attributes:true,attributeFilter:['class']});
  m78('#close-panel')?.addEventListener('click',()=>setTimeout(m78Sync,0));
  m78('#panel-toggle')?.addEventListener('click',()=>setTimeout(m78Sync,0));
  m78('.v76-mobile-detail')?.addEventListener('click',()=>setTimeout(m78Sync,0));
  m78Sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',m78Boot,{once:true});else m78Boot();
