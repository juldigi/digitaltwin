export function publicCacheState(value){
 const safe=structuredClone(value||{});
 if(safe&&typeof safe==='object')delete safe.sceneRevisions;
 return safe;
}

export function cacheContainsPrivilegedState(value){
 return Boolean(value&&typeof value==='object'&&Object.prototype.hasOwnProperty.call(value,'sceneRevisions'));
}
