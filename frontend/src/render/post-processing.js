// Effects stay off in factory view and on phones. Failure falls back to direct
// rendering in the same canvas; no second renderer or animation loop is made.
export class PostProcessing{
 constructor(renderer,scene,camera){this.renderer=renderer;this.scene=scene;this.camera=camera;this.enabled=false;this.composer=null;this.request=0;}
 async setEnabled(enabled){
  const request=++this.request;
  if(!enabled){this.enabled=false;return;}
  if(this.composer){this.enabled=true;return;}
  try{
   const [{EffectComposer},{RenderPass},{UnrealBloomPass},{OutputPass},{Vector2}]=await Promise.all([
    import('three/addons/postprocessing/EffectComposer.js'),
    import('three/addons/postprocessing/RenderPass.js'),
    import('three/addons/postprocessing/UnrealBloomPass.js'),
    import('three/addons/postprocessing/OutputPass.js'),
    import('three')
   ]);
   if(request!==this.request)return;
   const composer=new EffectComposer(this.renderer);
   composer.addPass(new RenderPass(this.scene,this.camera));
   const bloom=new UnrealBloomPass(new Vector2(1,1),.12,.2,.96);
   composer.addPass(bloom);composer.addPass(new OutputPass());
   composer.setSize(this.renderer.domElement.clientWidth||1,this.renderer.domElement.clientHeight||1);
   this.composer=composer;this.enabled=true;
  }catch(error){this.enabled=false;console.warn('[Digital Twin post-processing fallback]',error);}
 }
 render(){if(this.enabled&&this.composer){this.composer.render();return true;}return false;}
 resize(width,height){this.composer?.setSize(width,height);}
 dispose(){this.request++;this.enabled=false;this.composer?.dispose();this.composer=null;}
}
