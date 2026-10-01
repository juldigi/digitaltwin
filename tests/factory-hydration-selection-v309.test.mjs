import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FactoryEngine} from '../frontend/src/engine.js';

const engineSource=readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');

test('V309 selected factory outline is recomputed after proxy geometry is replaced',()=>{
 let updates=0,fits=0,matrices=0;
 const wrapper={updateWorldMatrix(){matrices++}};
 const context={
  factorySelectionId:'BMJ-MCH-0003',
  factorySelectionHelper:{update(){updates++}},
  view:'factory',
  transition:{start:1},
  isObjectVisible:()=>true,
  fit(object,mode){assert.equal(object,wrapper);assert.equal(mode,'operator');fits++}
 };
 assert.equal(FactoryEngine.prototype.refreshFactorySelectionAfterHydration.call(context,'BMJ-MCH-0003',wrapper),true);
 assert.equal(matrices,1);
 assert.equal(updates,1);
 assert.equal(fits,1);
});

test('V309 hydration never steals camera framing after the user has already taken control',()=>{
 let updates=0,fits=0;
 const context={
  factorySelectionId:'BMJ-MCH-0003',
  factorySelectionHelper:{update(){updates++}},
  view:'factory',
  transition:null,
  isObjectVisible:()=>true,
  fit(){fits++}
 };
 assert.equal(FactoryEngine.prototype.refreshFactorySelectionAfterHydration.call(context,'BMJ-MCH-0003',{updateWorldMatrix(){}}),true);
 assert.equal(updates,1,'selection outline still refreshes');
 assert.equal(fits,0,'manual camera is not overridden once transition has ended');
});

test('V309 hydration ignores non-selected machines and invokes selection sync only after detailed template mount',()=>{
 let updates=0;
 const context={factorySelectionId:'BMJ-MCH-0003',factorySelectionHelper:{update(){updates++}}};
 assert.equal(FactoryEngine.prototype.refreshFactorySelectionAfterHydration.call(context,'BMJ-MCH-0005',{}),false);
 assert.equal(updates,0);
 const mounted=engineSource.indexOf("this.factoryMachineTemplates.set(id,{template,root:detail});mounted++");
 const sync=engineSource.indexOf("this.refreshFactorySelectionAfterHydration(id,wrapper)",mounted);
 assert.ok(mounted>=0&&sync>mounted,'selection sync must happen after the detailed template replaces the proxy');
});
