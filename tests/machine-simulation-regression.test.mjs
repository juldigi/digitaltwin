import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createPolishedMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {applyMachineDetailVisibility} from '../frontend/src/machine-visibility.js';
const groups=[['offset',[3,4,5,6,9]],['autoplaten',[10,11,12,13,14,15,21]],['folder',[16,17,18]],['inspection',[19,20]],['PDS',[24,25,26,27,28]],['utility',[29,30,31,32,33,34,35,36,37,38,39,40,41]]];
for(const [group,ids] of groups)for(const no of ids){
 const id=`BMJ-MCH-${String(no).padStart(4,'0')}`;
 test(`${group} ${id}: pause, resume, stop and repeat preserve mechanism home transforms`,()=>{
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
    for(const [o,b] of home){assert.ok(o.position.distanceTo(b.p)<1e-7,`${id} ${o.name||o.userData.mechanismRole} position drift`);assert.ok(1-Math.abs(o.quaternion.dot(b.q))<1e-7,`${id} ${o.name||o.userData.mechanismRole} rotation drift`);assert.ok(o.scale.distanceTo(b.s)<1e-7,`${id} scale drift`);}
   }
  }finally{simulation.dispose();template.dispose();}
 });
 test(`${group} ${id}: render quality preserves open covers`,()=>{
  const t=createPolishedMachineTemplate(id);
  try{t.setExteriorOpen(true);const hidden=[];t.root.traverse(o=>{if((o.userData.exteriorCover||o.userData.coverMountedDetail)&&!o.visible)hidden.push(o)});
   for(const low of [true,false,true,false]){applyMachineDetailVisibility(t,low);assert.equal(t.exteriorOpen,true);assert.ok(hidden.every(o=>!o.visible),`${id} exposed closed cover during cutaway`);}
  }finally{t.dispose();}
 });
}
test('double click does not reset a running or paused simulation',()=>{
 const engine=readFileSync('frontend/src/engine.js','utf8');const body=engine.split("addEventListener('dblclick',()=>{")[1].split('});')[0];
 for(const running of [true,false]){let resets=0;const target={sceneEditing:false,simulation:{active:true,running},template:{reset(){resets++}}};vm.runInNewContext(`(function(){${body}}).call(target)`,{target});assert.equal(resets,0);}
});
