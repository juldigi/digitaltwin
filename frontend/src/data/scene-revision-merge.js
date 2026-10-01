const clone=value=>JSON.parse(JSON.stringify(value??{}));

const stable=value=>JSON.stringify(value??null,(key,item)=>
 item&&typeof item==='object'&&!Array.isArray(item)
  ?Object.fromEntries(Object.keys(item).sort().map(name=>[name,item[name]]))
  :item
);

export function changedSceneOverrideIds(base={},next={}){
 const a=base&&typeof base==='object'?base:{},b=next&&typeof next==='object'?next:{};
 const keys=new Set([...Object.keys(a),...Object.keys(b)]);
 return [...keys].filter(id=>stable(a[id])!==stable(b[id])).sort();
}

export function mergeSceneRevisionDraft({base={},local={},remote={}}={}){
 const localChanged=changedSceneOverrideIds(base,local);
 const remoteChanged=changedSceneOverrideIds(base,remote);
 const remoteSet=new Set(remoteChanged),conflicts=localChanged.filter(id=>remoteSet.has(id));
 if(conflicts.length)return Object.freeze({merged:null,localChanged,remoteChanged,conflicts});
 const merged=clone(remote);
 for(const id of localChanged){
  if(Object.prototype.hasOwnProperty.call(local,id))merged[id]=clone(local[id]);
  else delete merged[id];
 }
 return Object.freeze({merged,localChanged,remoteChanged,conflicts:[]});
}
