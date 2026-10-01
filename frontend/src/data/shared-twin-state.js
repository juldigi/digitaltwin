export function preserveSharedTwinState(current,baseline){
 const next=structuredClone(baseline||{});
 if(!current||typeof current!=='object')return next;
 const shared=structuredClone(current);
 delete shared.asset;
 Object.assign(next,shared);
 return next;
}
