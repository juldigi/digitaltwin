export const DETAIL_LOD_LEVELS=Object.freeze([
 Object.freeze({level:0,key:'factory',label:'LOD 0 · Pabrik',scope:'FACTORY',implemented:true}),
 Object.freeze({level:1,key:'sample-machine',label:'LOD 1 · OFFSET 5',scope:'SAMPLE_MACHINE',implemented:true}),
 Object.freeze({level:2,key:'major-assembly',label:'LOD 2 · Unit utama',scope:'MAJOR_ASSEMBLY',implemented:false}),
 Object.freeze({level:3,key:'subassembly',label:'LOD 3 · Subassembly',scope:'SUBASSEMBLY',implemented:false}),
 Object.freeze({level:4,key:'component',label:'LOD 4 · Komponen',scope:'COMPONENT',implemented:false}),
 Object.freeze({level:5,key:'part',label:'LOD 5 · Part',scope:'PART',implemented:false})
]);

const BY_LEVEL=new Map(DETAIL_LOD_LEVELS.map(item=>[item.level,item]));
const clone=value=>value?{...value}:null;

export function lodForTaxonomyLevel(taxonomyLevel){
 const level=Math.max(1,Math.min(6,Number(taxonomyLevel)||1));
 if(level<=1)return 1;
 if(level===2)return 2;
 if(level===3)return 3;
 if(level===4)return 4;
 return 5;
}

export class DetailLODManager{
 constructor(){
  this.activeLevel=1;
  this.preparedLevel=null;
  this.listeners=new Set();
 }
 state(){
  const active=BY_LEVEL.get(this.activeLevel)||BY_LEVEL.get(1);
  const prepared=this.preparedLevel===null?null:BY_LEVEL.get(this.preparedLevel)||null;
  return Object.freeze({
   activeLevel:active.level,
   activeLabel:active.label,
   activeScope:active.scope,
   activeImplemented:active.implemented,
   preparedLevel:prepared?.level??null,
   preparedLabel:prepared?.label??null,
   preparedImplemented:prepared?.implemented??null,
   phaseImplementedLevels:[0,1],
   futurePreparedLevels:[2,3,4,5]
  });
 }
 subscribe(listener){
  if(typeof listener!=='function')return()=>{};
  this.listeners.add(listener);
  listener(this.state());
  return()=>this.listeners.delete(listener);
 }
 emit(){
  const snapshot=this.state();
  for(const listener of this.listeners)listener(snapshot);
  return snapshot;
 }
 setView(view){
  const next=view==='factory'?0:1;
  const changed=this.activeLevel!==next||this.preparedLevel!==null;
  this.activeLevel=next;
  this.preparedLevel=null;
  return changed?this.emit():this.state();
 }
 setTaxonomyContext(taxonomyLevel){
  if(this.activeLevel!==1)return this.state();
  const requested=lodForTaxonomyLevel(taxonomyLevel);
  const next=requested>1?requested:null;
  if(this.preparedLevel===next)return this.state();
  this.preparedLevel=next;
  return this.emit();
 }
 clearTaxonomyContext(){
  if(this.preparedLevel===null)return this.state();
  this.preparedLevel=null;
  return this.emit();
 }
 level(level){return clone(BY_LEVEL.get(Number(level))||null);}
}

export const DETAIL_LOD_ARCHITECTURE=Object.freeze({
 implemented:Object.freeze([0,1]),
 prepared:Object.freeze([2,3,4,5]),
 principle:'ZOOM DEEPER → REVEAL MORE VERIFIED KNOWLEDGE'
});
