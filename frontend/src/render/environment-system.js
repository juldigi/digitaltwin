// The environment is generated only for a focused machine on a capable desktop.
// One cached PMREM serves every machine; the factory remains in its own lighting.
export class EnvironmentSystem{
 constructor(renderer,scene){this.renderer=renderer;this.scene=scene;this.target=null;this.enabled=false;this.pending=null;this.disposed=false;}
 async setEnabled(enabled){
  if(this.disposed)return;
  this.enabled=Boolean(enabled);
  if(!this.enabled){this.scene.environment=null;return;}
  if(this.target){this.scene.environment=this.target.texture;return;}
  if(this.pending)return this.pending;
  this.pending=this.createEnvironment();
  try{await this.pending;}finally{this.pending=null;}
 }
 async createEnvironment(){
  try{
   const [{RoomEnvironment},{PMREMGenerator}]=await Promise.all([
    import('three/addons/environments/RoomEnvironment.js'),import('three')
   ]);
   const room=new RoomEnvironment(),generator=new PMREMGenerator(this.renderer);
   try{this.target=generator.fromScene(room,.04);}
   finally{
    generator.dispose();
    const resources=new Set();room.traverse(object=>{
     if(object.geometry)resources.add(object.geometry);
     for(const material of Array.isArray(object.material)?object.material:[object.material])if(material)resources.add(material);
    });resources.forEach(resource=>resource.dispose());
   }
   if(this.disposed){this.target.dispose();this.target=null;return;}
   if(this.enabled){this.scene.environment=this.target.texture;this.scene.environmentIntensity=.24;}
  }catch(error){this.enabled=false;this.scene.environment=null;console.warn('[Digital Twin environment fallback]',error);}
 }
 dispose(){this.disposed=true;this.enabled=false;this.scene.environment=null;this.target?.dispose();this.target=null;}
}
