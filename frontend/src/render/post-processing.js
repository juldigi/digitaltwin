// Explicit Sinematik only; the economical and automatic profiles retain direct
// rendering. One composer, bounded targets, no extra renderer or frame loop.
export function cinematicResolution(width,height,pixelRatio=1){
 width=Math.max(1,width||1);height=Math.max(1,height||1);
 const ratio=Math.min(2,Math.max(1,pixelRatio||1),Math.sqrt(2000000/(width*height)));
 return {width,height,pixelRatio:ratio,aoWidth:Math.max(1,Math.ceil(width*ratio/2)),aoHeight:Math.max(1,Math.ceil(height*ratio/2))};
}
async function loadModules(){
 const modules=await Promise.all([
  import('three/addons/postprocessing/EffectComposer.js'),import('three/addons/postprocessing/RenderPass.js'),
  import('three/addons/postprocessing/GTAOPass.js'),import('three/addons/postprocessing/UnrealBloomPass.js'),
  import('three/addons/postprocessing/SMAAPass.js'),import('three/addons/postprocessing/OutputPass.js'),import('three')
 ]);
 return Object.assign({},...modules);
}
function release(composer){
 if(!composer)return;
 for(const pass of composer.passes||[]){pass.dispose?.();if(pass.gtaoMaterial)pass.gtaoMaterial.dispose();}
 composer.dispose();
}
// Three r180's normal buffer otherwise treats ghosted guards as solid walls.
export function createOpaqueContactPass(GTAOPass,...args){
 class AO extends GTAOPass{
  _overrideVisibility(){
   super._overrideVisibility();
   this.scene.traverseVisible(o=>{
    if(o.isMesh&&[].concat(o.material||[]).every(m=>m.transparent||m.opacity<.94)){
     o.visible=false;this._visibilityCache.push(o);
    }
   });
  }
  _renderOverride(...args){try{return super._renderOverride(...args);}finally{this._restoreVisibility();}}
 }
 return new AO(...args);
}
export class PostProcessing{
 constructor(renderer,scene,camera,{load=loadModules}={}){
  this.renderer=renderer;this.scene=scene;this.camera=camera;this.load=load;
  this.enabled=false;this.composer=null;this.ao=null;this.pending=null;this.disposed=false;
  this.width=renderer.domElement?.clientWidth||1;this.height=renderer.domElement?.clientHeight||1;
 }
 async setEnabled(enabled){
  if(this.disposed)return;
  this.enabled=Boolean(enabled);
  if(!this.enabled){release(this.composer);this.composer=null;this.ao=null;return;}
  if(this.composer)return;
  if(!this.pending)this.pending=this.create();
  try{await this.pending;}finally{this.pending=null;}
 }
 async create(){
  let composer;
  try{
   const {EffectComposer,RenderPass,GTAOPass,UnrealBloomPass,SMAAPass,OutputPass,Vector2}=await this.load();
   if(this.disposed||!this.enabled)return;
   composer=new EffectComposer(this.renderer);
   composer.addPass(new RenderPass(this.scene,this.camera));
   const ao=createOpaqueContactPass(GTAOPass,this.scene,this.camera,1,1,undefined,{radius:.22,thickness:.06,samples:8,screenSpaceRadius:false},{radius:4,samples:8});
   ao.blendIntensity=.35;composer.addPass(ao);
   composer.addPass(new UnrealBloomPass(new Vector2(1,1),.08,.2,.98));
   composer.addPass(new SMAAPass());composer.addPass(new OutputPass());
   this.composer=composer;this.ao=ao;this.resize(this.width,this.height);
  }catch(error){release(composer);this.composer=null;this.ao=null;this.enabled=false;console.warn('[Digital Twin post-processing fallback]',error);}
 }
 render(){
  if(!this.enabled||!this.composer)return false;
  const override=this.scene.overrideMaterial,visibility=[];
  this.scene.traverse?.(o=>{if((o.isPoints||o.isLine||o.isLine2)&&o.visible)visibility.push(o);});
  try{this.composer.render();return true;}
  catch(error){this.enabled=false;this.renderer.setRenderTarget?.(null);this.scene.overrideMaterial=override;for(const o of visibility)o.visible=true;console.warn('[Digital Twin post-processing fallback]',error);return false;}
 }
 resize(width,height){
  this.width=width;this.height=height;if(!this.composer)return;
  const size=cinematicResolution(width,height,this.renderer.getPixelRatio?.()||1);
  this.composer.setPixelRatio(size.pixelRatio);this.composer.setSize(size.width,size.height);
  this.ao.setSize(size.aoWidth,size.aoHeight);
 }
 dispose(){if(this.disposed)return;this.disposed=true;this.enabled=false;release(this.composer);this.composer=null;this.ao=null;}
}
