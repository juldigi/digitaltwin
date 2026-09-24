const $=selector=>document.querySelector(selector);

function persistTheme(){
  const toggle=$('#ui-theme-toggle');
  let saved='';
  try{saved=localStorage.getItem('offset5-theme')||'';}catch{}
  if(saved==='light')document.body.classList.add('light-mode');
  toggle?.setAttribute('aria-pressed',String(document.body.classList.contains('light-mode')));
  toggle?.addEventListener('click',()=>{
    const light=document.body.classList.toggle('light-mode');
    toggle.setAttribute('aria-pressed',String(light));
    try{localStorage.setItem('offset5-theme',light?'light':'dark');}catch{}
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
