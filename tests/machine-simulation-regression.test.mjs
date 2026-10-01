import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {applyMachineDetailVisibility} from '../frontend/src/machine-visibility.js';

const fleet=MACHINE_REGISTRY.map(machine=>({
 id:machine.machineId,
 label:`${machine.area} · ${machine.name}`
}));

for(const {id,label} of fleet){
 test(`${label} (${id}): pause, resume, stop and repeat preserve mechanism home transforms`,()=>{
  const template=createPolishedMachineTemplate(id),simulation=createMachineSimulation(id,template.root,template);
  try{
   simulation.stop();
   const originals=[...template.meshes,...(template.nodes||[])];
   const home=new Map(originals.map(o=>[o,{p:o.position.clone(),q:o.quaternion.clone(),s:o.scale.clone()}]));
   for(let cycle=0;cycle<2;cycle++){
    const initial=simulation.start();
    if(initial.blocked){assert.equal(initial.active,false);assert.ok(initial.blockedReason);break;}
    let now=0;for(let f=0;f<=1800;f++){now=f*1000/60;simulation.update(now);}
    assert.ok(simulation.state().completed>0,`${id} no output after 30s`);
    const elapsed=simulation.elapsed;simulation.pause();for(let f=1;f<=10;f++)simulation.update(now+f*100);
    assert.equal(simulation.elapsed,elapsed,`${id} advances while paused`);
    simulation.resume();simulation.update(now+1100);simulation.update(now+1116);
    assert.ok(simulation.elapsed>elapsed,`${id} cannot resume`);
    const stopped=simulation.stop();assert.equal(stopped.active,false);assert.equal(stopped.running,false);assert.equal(stopped.completed,0);
    for(const [o,b] of home){
     assert.ok(o.position.distanceTo(b.p)<1e-7,`${id} ${o.name||o.userData.mechanismRole} position drift`);
     assert.ok(1-Math.abs(o.quaternion.dot(b.q))<1e-7,`${id} ${o.name||o.userData.mechanismRole} rotation drift`);
     assert.ok(o.scale.distanceTo(b.s)<1e-7,`${id} scale drift`);
    }
   }
  }finally{simulation.dispose();template.dispose();}
 });

 test(`${label} (${id}): render quality preserves open covers`,()=>{
  const t=createPolishedMachineTemplate(id);
  try{
   t.setExteriorOpen(true);
   const hidden=[];
   t.root.traverse(o=>{if((o.userData.exteriorCover||o.userData.coverMountedDetail)&&!o.visible)hidden.push(o)});
   for(const low of [true,false,true,false]){
    applyMachineDetailVisibility(t,low);
    assert.equal(t.exteriorOpen,true);
    assert.ok(hidden.every(o=>!o.visible),`${id} exposed closed cover during cutaway`);
   }
  }finally{t.dispose();}
 });
}

for(const {id,label} of fleet){
 test(`${label} (${id}): process-path preference stays synchronized after stop and fresh start`,()=>{
  const template=createPolishedMachineTemplate(id),simulation=createMachineSimulation(id,template.root,template);
  try{
   const initial=simulation.start();
   if(initial.blocked){assert.equal(initial.active,false);return;}
   simulation.setPathVisible?.(true);
   const pathObject=simulation.pathLine||simulation.path||null;
   if(pathObject&&typeof pathObject.visible==='boolean')assert.equal(pathObject.visible,true,`${id} path is enabled in state but hidden while active`);
   simulation.stop();
   const preference=simulation.state().pathVisible===true;
   const restarted=simulation.start();
   assert.equal(restarted.active,true);
   if(preference&&pathObject&&typeof pathObject.visible==='boolean')assert.equal(pathObject.visible,true,`${id} lost visible path after stop/start while pathVisible stayed true`);
  }finally{simulation.dispose();template.dispose();}
 });
}

test('fleet regression gate covers every registered equipment exactly once',()=>{
 assert.equal(fleet.length,41);
 assert.equal(new Set(fleet.map(item=>item.id)).size,41);
 assert.deepEqual(fleet.map(item=>item.id),MACHINE_REGISTRY.map(machine=>machine.machineId));
});

test('double click does not reset a running or paused simulation',()=>{
 const engine=readFileSync('frontend/src/engine.js','utf8');const body=engine.split("addEventListener('dblclick',()=>{")[1].split('});')[0];
 for(const running of [true,false]){let resets=0;const target={sceneEditing:false,simulation:{active:true,running},template:{reset(){resets++}}};vm.runInNewContext(`(function(){${body}}).call(target)`,{target});assert.equal(resets,0);}
});

test('OFFSET 8 reset preserves the inspection cutaway just like the other machines',()=>{
 const t=createPolishedMachineTemplate('BMJ-MCH-0005');
 try{
  t.setExteriorOpen(true);t.explode(true);t.reset();
  assert.equal(t.exteriorOpen,true);
  assert.ok(t.meshes.filter(m=>m.userData.exteriorCover).every(m=>!m.visible));
  t.setExteriorOpen(false);t.reset();assert.equal(t.exteriorOpen,false);
 }finally{t.dispose();}
});
