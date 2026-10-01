const taxonomyRefSet=template=>{
 if(!template)return new Set();
 if(template.__semanticClickNodeIds)return template.__semanticClickNodeIds;
 const refs=new Set((template.taxonomy||[]).flatMap(node=>node.meshRefs||[]).filter(Boolean));
 Object.defineProperty(template,'__semanticClickNodeIds',{value:refs,writable:true,configurable:true});
 return refs;
};

export function resolveSemanticMachinePart(template,object){
 if(!template||!object)return null;
 const refs=taxonomyRefSet(template);
 for(let node=object;node&&node!==template.root;node=node.parent){
  const id=node.userData?.nodeId;
  if(id&&refs.has(id))return node;
 }
 return null;
}

export function isSemanticMachinePart(template,object){
 return Boolean(resolveSemanticMachinePart(template,object));
}
