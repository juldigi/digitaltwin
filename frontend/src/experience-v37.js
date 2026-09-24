import {getState,setPreference,subscribe} from './state/app-state.js';
const $=selector=>document.querySelector(selector);

function applyTheme(state=getState()){
  const light=state.preferences?.theme==='light';
  document.body.classList.toggle('light-mode',light);
  const toggle=$('#ui-theme-toggle');
  toggle?.setAttribute('aria-pressed',String(light));
  if(toggle)toggle.title=light?'Gunakan tema gelap':'Gunakan tema terang';
}
function bindTheme(){
  const toggle=$('#ui-theme-toggle');
  toggle?.addEventListener('click',()=>setPreference('theme',getState().preferences?.theme==='light'?'dark':'light'));
  applyTheme(getState());
}
function syncFullscreen(){
  const button=$('#fullscreen');
  const update=()=>{
    const active=Boolean(document.fullscreenElement);
    button?.setAttribute('aria-pressed',String(active));
    if(button)button.title=active?'Keluar dari layar penuh':'Layar penuh';
  };
  document.addEventListener('fullscreenchange',update);
  update();
}
window.addEventListener('DOMContentLoaded',()=>{
  document.documentElement.dataset.uiVersion='40';
  bindTheme();
  syncFullscreen();
  subscribe(applyTheme);
});
