import test from 'node:test';
import assert from 'node:assert/strict';
import {OFFSET5_TAXONOMY,TAXONOMY_BY_ID} from '../frontend/src/data/taxonomy-offset5.js';
import {createPolishedMachineTemplate} from '../frontend/src/machine-runtime.js';

test('every Offset 5 detail has a resolvable geometry target with explicit assembly-reference boundaries',()=>{
 const t=createPolishedMachineTemplate('offset5');
 try{
  let inherited=0;
  for(const n of OFFSET5_TAXONOMY.filter(n=>n.level>=5)){
   assert.ok(n.meshRefs.length,`${n.id} has an empty target`);
   for(const ref of n.meshRefs)assert.ok(t.findNode(ref),`${n.id}: missing ${ref}`);
   if(n.geometryScope==='ASSEMBLY_ANCHOR_ONLY'){
    inherited++;assert.equal(n.confidence,'REFERENCE_ONLY');assert.equal(n.verified,false);
    assert.deepEqual(n.meshRefs,TAXONOMY_BY_ID.get(n.geometryAnchorParentId).meshRefs);
    assert.match(n.description,/belum dimodelkan atau diverifikasi/);
   }
  }
  assert.ok(inherited>150,'audit must include all upstream and downstream reference-only details');
 }finally{t.dispose();}
});
