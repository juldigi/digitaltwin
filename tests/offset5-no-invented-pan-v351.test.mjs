import test from 'node:test';
import assert from 'node:assert/strict';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {TAXONOMY_BY_ID} from '../frontend/src/data/taxonomy-offset5.js';
import {OFFSET5_DAMPENING_ROLLERS} from '../frontend/src/data/sources-offset5.js';

test('unsupported dampening tray is absent in exterior, interior and running simulation on every PU',()=>{
 const t=createPolishedMachineTemplate('offset5'),sim=createMachineSimulation('offset5',t.root,t);
 const check=()=>{
  for(let i=0;i<8;i++){
   const pan=t.findNode(`press-${i}-dampening-pan`),meshes=[];
   pan.traverse(o=>{if(o.isMesh)meshes.push(o);});
   assert.equal(meshes.length,0,'PU'+(i+1)+' must not regenerate the projecting tray');
   assert.equal(pan.userData.installedShapeVerified,false);
   for(const r of OFFSET5_DAMPENING_ROLLERS){
    const n=t.findNode(`press-${i}-damp-roller-${r.code}`);
    assert.equal(n.userData.nominalDiameterMM,r.diameterMM);
    assert.ok(t.findNode(`press-${i}-damp-roller-${r.code}-body`).children.some(o=>o.isMesh));
   }
   assert.equal(t.resolveTaxonomyNode(`O5.PRINT.PU${i+1}.DAMP.PAN`),t.findNode(`press-${i}-damp-roller-18-body`));
   assert.match(TAXONOMY_BY_ID.get(`O5.PRINT.PU${i+1}.DAMP.PAN`).description,/tidak menetapkan bentuk/);
  }
 };
 try{
  for(const low of [true,false])for(const interior of [false,true]){
   t.setLow(low);t.setExteriorOpen(interior);check();
   sim.start();for(let i=0;i<120;i++)sim.update(1/60);check();
   sim.pause();check();sim.resume();sim.update(1/60);check();sim.stop();t.reset();check();
  }
 }finally{sim.dispose();t.dispose();}
});
