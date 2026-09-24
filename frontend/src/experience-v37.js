const $=selector=>document.querySelector(selector);

const THEME_KEY='bmj-digitaltwin-theme',LEGACY_THEME_KEY='offset5-theme';
function persistTheme(){
  const toggle=$('#ui-theme-toggle');
  let saved='';
  try{saved=localStorage.getItem(THEME_KEY)||localStorage.getItem(LEGACY_THEME_KEY)||'';if(saved&&localStorage.getItem(THEME_KEY)===null){localStorage.setItem(THEME_KEY,saved);localStorage.removeItem(LEGACY_THEME_KEY);}}catch{}
  if(saved==='light')document.body.classList.add('light-mode');
  toggle?.setAttribute('aria-pressed',String(document.body.classList.contains('light-mode')));
  toggle?.addEventListener('click',()=>{
    const light=document.body.classList.toggle('light-mode');
    toggle.setAttribute('aria-pressed',String(light));
    try{localStorage.setItem(THEME_KEY,light?'light':'dark');localStorage.removeItem(LEGACY_THEME_KEY);}catch{}
  });
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
  document.documentElement.dataset.uiVersion='39';
  persistTheme();
  syncFullscreen();
});
