import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {FactoryEngine} from '../frontend/src/engine.js';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

for(const [id,family,hiddenKind,localKind,maxWidth] of [
  ['BMJ-MCH-0034','compressor','distribution','air',3],
  ['BMJ-MCH-0036','ahu','return','supply',8],
]){
  test(`${family}: frame the equipment and keep local flow visible on mobile`,()=>{
    const template=createPolishedMachineTemplate(id);
    const simulation=createMachineSimulation(id,template.root,template);
    try{
      simulation.setPathVisible(false);
      const context={template,machine:template.root,isObjectVisible:FactoryEngine.prototype.isObjectVisible};
      const focus=FactoryEngine.prototype.machineFocusBounds.call(context);
      const complete=new THREE.Box3().setFromObject(template.root);
      assert.ok(focus);
      assert.ok(focus.getSize(new THREE.Vector3()).x<maxWidth);
      assert.ok(complete.getSize(new THREE.Vector3()).x>focus.getSize(new THREE.Vector3()).x+2);
      assert.ok(Math.abs(focus.getCenter(new THREE.Vector3()).x)<1);

      const particles=family==='compressor'?simulation.compressorParticles:simulation.ahuParticles;
      assert.ok(particles.some(part=>part.kind===hiddenKind));
      assert.ok(particles.some(part=>part.kind===localKind));
      simulation.start();
      assert.ok(particles.filter(part=>part.kind===hiddenKind).every(part=>!part.mesh.visible));
      simulation.update(0);simulation.update(100);
      assert.ok(particles.filter(part=>part.kind===hiddenKind).every(part=>!part.mesh.visible));
      assert.ok(particles.some(part=>part.kind===localKind&&part.mesh.visible));
      simulation.setPathVisible(true);
      assert.ok(particles.filter(part=>part.kind===hiddenKind).every(part=>part.mesh.visible));
    }finally{simulation.dispose();template.dispose();}
  });
}
