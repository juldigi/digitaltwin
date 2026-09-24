// A fingerprint guards path-based IDs when the procedural factory changes between builds.
export function sceneIdentity(node){
  if(!node)return '';
  const source=node.userData||{};
  return JSON.stringify([
    node.type||'',node.name||'',source.semantic||'',source.sourceEntityId||'',
    source.sourceLayer||'',node.geometry?.type||'',node.children?.length||0
  ]);
}

export function validateSceneOverrides(changes){
  if(!changes||typeof changes!=='object'||Array.isArray(changes)||Object.keys(changes).length>500)throw new Error('Override scene tidak valid (maksimal 500 objek).');
  for(const [id,value] of Object.entries(changes)){
    if(!/^(asset:[A-Za-z0-9_-]+|wall:[A-Za-z0-9_-]+|part:[A-Za-z0-9_-]+:[A-Za-z0-9_.-]+|node:[0-9.]+|machine:[A-Za-z0-9_-]+:(?:root|[0-9.]+)|(?:copy|new):[a-f0-9-]{36})$/.test(id)||id.length>150)throw new Error('ID objek tidak valid.');
    if(!value||typeof value!=='object'||Array.isArray(value)||typeof value.visible!=='boolean')throw new Error('Properti objek tidak valid.');
    const allowed=['position','rotation','scale','visible','locked','deleted','identity','sourceId','shape'];
    if(Object.keys(value).some(key=>!allowed.includes(key)))throw new Error('Properti objek tidak dikenal.');
    for(const key of ['position','rotation','scale'])if(!Array.isArray(value[key])||value[key].length!==3||value[key].some(n=>!Number.isFinite(n)||Math.abs(n)>100000))throw new Error('Transform objek tidak valid.');
    if(value.scale.some(n=>n<=0))throw new Error('Skala objek harus positif.');
    if(value.locked!==undefined&&typeof value.locked!=='boolean'||value.deleted!==undefined&&typeof value.deleted!=='boolean')throw new Error('Status objek tidak valid.');
    if(value.identity!==undefined&&(typeof value.identity!=='string'||value.identity.length>300))throw new Error('Identitas objek tidak valid.');
    if(id.startsWith('copy:')&&!/^(asset:[A-Za-z0-9_-]+|wall:[A-Za-z0-9_-]+|part:[A-Za-z0-9_-]+:[A-Za-z0-9_.-]+|node:[0-9.]+|machine:[A-Za-z0-9_-]+:(?:root|[0-9.]+))$/.test(value.sourceId||''))throw new Error('Sumber duplikasi tidak valid.');
    if(!id.startsWith('copy:')&&value.sourceId!==undefined)throw new Error('Sumber duplikasi hanya untuk salinan.');
    if(id.startsWith('new:')&&!['box','cylinder'].includes(value.shape))throw new Error('Bentuk objek baru tidak didukung.');
    if(!id.startsWith('new:')&&value.shape!==undefined)throw new Error('Bentuk hanya untuk objek baru.');
  }
  return changes;
}

// Generated objects do not exist in the scene until overrides are replayed.
// Duplicates must be checked against their original source, not their new ID.
export function validateSceneImport(changes,{hasObject,identityFor}){
  validateSceneOverrides(changes);
  for(const [id,value] of Object.entries(changes)){
    if(id.startsWith('new:'))continue;
    const source=id.startsWith('copy:')?value.sourceId:id;
    if(!hasObject(source)||value.identity&&value.identity!==identityFor(source))throw new Error('Berkas berisi objek yang tidak sesuai versi scene saat ini.');
  }
  return changes;
}


export function createSceneIsolationGuard(){
  const saved=new Map();
  const restore=()=>{
    for(const [node,visible] of saved)if(node)node.visible=visible;
    const count=saved.size;saved.clear();return count;
  };
  const isolate=(selected,boundary)=>{
    restore();
    if(!selected||!boundary)return 0;
    let node=selected;
    while(node?.parent&&node!==boundary){
      for(const sibling of node.parent.children){
        if(sibling===node)continue;
        if(!saved.has(sibling))saved.set(sibling,sibling.visible);
        sibling.visible=false;
      }
      node=node.parent;
    }
    // Refuse to climb outside the requested editor scope.
    if(node!==boundary){restore();return 0;}
    return saved.size;
  };
  return {isolate,restore,get size(){return saved.size;}};
}
