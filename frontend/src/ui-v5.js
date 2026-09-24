const $=selector=>document.querySelector(selector);

function wheelZoom(deltaY){
  const canvas=$('#viewport canvas');
  if(!canvas)return;
  canvas.dispatchEvent(new WheelEvent('wheel',{
    deltaY,bubbles:true,cancelable:true,
    clientX:canvas.clientWidth/2,clientY:canvas.clientHeight/2
  }));
}

function bindViewportShortcuts(){
  $('#zoom-plus')?.addEventListener('click',()=>wheelZoom(-320));
  $('#zoom-minus')?.addEventListener('click',()=>wheelZoom(320));
  $('#zoom-fit')?.addEventListener('click',()=>document.querySelector('[data-camera="fit"]')?.click());
}

function syncViewportMetadata(){
  const mobile=matchMedia('(max-width:767px)').matches;
  document.documentElement.dataset.viewport=mobile?'compact':'wide';
  document.documentElement.style.setProperty('--app-height',`${window.visualViewport?.height||window.innerHeight}px`);
}

window.addEventListener('DOMContentLoaded',()=>{
  document.documentElement.dataset.uiMode='canonical';
  bindViewportShortcuts();
  syncViewportMetadata();
  matchMedia('(max-width:767px)').addEventListener?.('change',syncViewportMetadata);
  window.visualViewport?.addEventListener('resize',syncViewportMetadata,{passive:true});
});
