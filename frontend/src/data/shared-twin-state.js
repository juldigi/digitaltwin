export function preserveSharedTwinState(current,baseline){
 const next=structuredClone(baseline||{});
 if(!current||typeof current!=='object')return next;
 const shared=structuredClone(current);
 delete shared.asset;
 Object.assign(next,shared);
 return next;
}

export function mergeIncomingSharedTwinState(incoming,current){
 const next=structuredClone(incoming||{});
 if(current?.asset&&typeof current.asset==='object')next.asset=structuredClone(current.asset);
 return next;
}
