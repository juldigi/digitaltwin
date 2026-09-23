const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
function syncExpandedState(){
 $('#ui-menu-toggle')?.setAttribute('aria-expanded',String(document.body.classList.contains('nav-open')));
 $('#panel-launcher')?.setAttribute('aria-expanded',String(!$('#panel-launcher-menu')?.hidden));
 $('#ui-workbench-toggle')?.setAttribute('aria-expanded',String(document.body.classList.contains('ui-workbench-open')));
 $('#ui-asset-panel')?.setAttribute('aria-expanded',String(!document.body.classList.contains('panel-hidden')));
}
function observeShellState(){
 const observer=new MutationObserver(syncExpandedState);observer.observe(document.body,{attributes:true,attributeFilter:['class']});
 const launcher=$('#panel-launcher-menu');if(launcher)observer.observe(launcher,{attributes:true,attributeFilter:['hidden']});
 document.addEventListener('click',()=>requestAnimationFrame(syncExpandedState));
 document.addEventListener('keydown',event=>{if(event.key==='Escape')requestAnimationFrame(syncExpandedState);});syncExpandedState();
}
function persistTheme(){
 const toggle=$('#ui-theme-toggle');let saved='';try{saved=localStorage.getItem('offset5-theme')||'';}catch{}
 if(saved==='light')document.body.classList.add('light-mode');toggle?.setAttribute('aria-pressed',String(document.body.classList.contains('light-mode')));
 toggle?.addEventListener('click',()=>{const light=document.body.classList.toggle('light-mode');toggle.setAttribute('aria-pressed',String(light));try{localStorage.setItem('offset5-theme',light?'light':'dark');}catch{}});
}
function improveControlFeedback(){
 for(const id of ['labels','tool-pan','tool-explode','tool-isolate']){const control=$(`#${id}`);if(!control)continue;control.setAttribute('aria-pressed',String(control.classList.contains('active')));control.addEventListener('click',()=>requestAnimationFrame(()=>control.setAttribute('aria-pressed',String(control.classList.contains('active')))));}
 $$('[data-camera]').forEach(button=>button.addEventListener('click',()=>$$('[data-camera]').forEach(item=>item.setAttribute('aria-pressed',String(item===button&&button.dataset.camera!=='reset')))));
 $$('.viewport-mode-switch button').forEach(button=>button.addEventListener('click',()=>$$('.viewport-mode-switch button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)))));
}
function closePanelsWhenNavigating(){$$('.rail>button,.rail-bottom button').forEach(button=>button.addEventListener('click',()=>{if(matchMedia('(max-width:767px)').matches)document.body.classList.remove('nav-open');requestAnimationFrame(syncExpandedState);}));}
function syncFullscreen(){const button=$('#fullscreen');const update=()=>{const active=Boolean(document.fullscreenElement);button?.setAttribute('aria-pressed',String(active));if(button)button.title=active?'Keluar dari layar penuh':'Layar penuh';};document.addEventListener('fullscreenchange',update);update();}
window.addEventListener('DOMContentLoaded',()=>{document.documentElement.dataset.uiVersion='38';observeShellState();persistTheme();improveControlFeedback();closePanelsWhenNavigating();syncFullscreen();});
