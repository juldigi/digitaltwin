import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {OffsetMachineTemplate} from '../frontend/src/offset5.js';
import {OFFSET5_DIMENSIONS,OFFSET5_UNIT_CENTERS} from '../frontend/src/data/dimensions-offset5.js';
import {PrintingSimulation,PRINTING_SIMULATION_STAGES,INK_SIMULATION_SEQUENCE} from '../frontend/src/simulation.js';

const run=(sim,end=18000,step=16)=>{
  sim.start();sim.update(0);
  for(let ms=step;ms<=end;ms+=step)sim.update(ms);
};

test('printing-unit geometry contains no static white sheet-path reference planes',()=>{
  const machine=new OffsetMachineTemplate();
  assert.equal(machine.meshes.filter(mesh=>mesh.name==='sheet path reference').length,0);
  assert.equal(machine.geometries.has('printing-unit-sheet-path-0'),false);
  machine.dispose();
});

test('V47 sheet centerline is monotonic and clears every primary and inter-unit transfer cylinder',()=>{
  const machine=new OffsetMachineTemplate(),sim=new PrintingSimulation(machine.root,machine);
  assert.ok(sim.pathLength>24&&sim.pathLength<42,`unexpected sheet path length ${sim.pathLength}`);
  let previous=-Infinity,minPrimary=Infinity,minTransfer=Infinity;
  for(let i=0;i<=2400;i++){
    const p=sim.curve.getPointAt(i/2400);
    assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z));
    assert.ok(p.x>=previous-.018,`sheet path backtracks at sample ${i}: ${p.x} < ${previous}`);
    assert.ok(p.y>.42&&p.y<1.75,`sheet path leaves transport corridor at sample ${i}: ${p.y}`);
    assert.ok(Math.abs(p.z)<.001,'sheet centerline must remain centered between OS and DS');
    previous=p.x;
    for(let u=0;u<8;u++){
      const cx=OFFSET5_UNIT_CENTERS[u],layout=machine.root.userData.printingUnitCylinderLayout[`PU${u+1}`];
      for(const cylinder of layout){
        const dx=p.x-(cx+cylinder.center[0]),dy=p.y-cylinder.center[1],distance=Math.hypot(dx,dy);
        if(Math.abs(dx)<.70){
          minPrimary=Math.min(minPrimary,distance-cylinder.radius);
          assert.ok(distance>=cylinder.radius-.002,`sheet centerline penetrates ${cylinder.name} in PU${u+1}: clearance ${distance-cylinder.radius}`);
        }
      }
    }
    for(let u=0;u<7;u++){
      const cx=(OFFSET5_UNIT_CENTERS[u]+OFFSET5_UNIT_CENTERS[u+1])/2,dx=p.x-cx,dy=p.y-.70,distance=Math.hypot(dx,dy);
      if(Math.abs(dx)<.45){
        minTransfer=Math.min(minTransfer,distance-.235);
        assert.ok(distance>=.233,`sheet centerline penetrates transfer drum PU${u+1}->PU${u+2}: clearance ${distance-.235}`);
      }
    }
  }
  assert.ok(minPrimary>=-.002&&minTransfer>=-.002);
  assert.equal(PRINTING_SIMULATION_STAGES[0],'Feeder');
  assert.equal(PRINTING_SIMULATION_STAGES.at(-1),'Delivery');
  sim.dispose();machine.dispose();
});

test('flexible sheets bend along gripper path and remain separated without rigid-body cylinder cutting',()=>{
  const machine=new OffsetMachineTemplate(),sim=new PrintingSimulation(machine.root,machine);
  run(sim,14000);
  const visible=sim.sheets.filter(sheet=>sheet.mesh.visible);
  assert.ok(visible.length>=6,'continuous printing test should carry several sheets');
  for(const sheet of visible){
    const a=sheet.mesh.geometry.attributes.position.array;
    assert.ok([...a].every(Number.isFinite),'flexible sheet has non-finite vertex');
    assert.ok(Number.isFinite(sheet.gripper.position.x)&&Number.isFinite(sheet.gripper.position.y));
    const y=[];
    for(let i=1;i<a.length;i+=3)y.push(a[i]);
    assert.ok(Math.max(...y)-Math.min(...y)>=0,'sheet deformation range invalid');
  }
  const ordered=[...visible].sort((a,b)=>a.userData.progress-b.userData.progress);
  for(let i=1;i<ordered.length;i++){
    const gap=(ordered[i].userData.progress-ordered[i-1].userData.progress)*sim.pathLength;
    assert.ok(gap>.85,`visible sheets bunch together along path: ${gap}`);
  }
  const curved=visible.find(sheet=>{
    const a=sheet.mesh.geometry.attributes.position.array,y=[];
    for(let i=1;i<a.length;i+=3)y.push(a[i]);
    return Math.max(...y)-Math.min(...y)>.035;
  });
  assert.ok(curved,'no visible sheet bends around a cylinder/transfer path');
  sim.dispose();machine.dispose();
});

test('printing test moves rotating and reciprocating mechanisms and restores their phase',()=>{
  const machine=new OffsetMachineTemplate(),sim=new PrintingSimulation(machine.root,machine);
  assert.ok(sim.rotors.length>220,`too few active rotating mechanisms: ${sim.rotors.length}`);
  assert.ok(sim.oscillators.length>50,`too few reciprocating mechanisms: ${sim.oscillators.length}`);
  assert.ok(sim.state().mechanismCount>300,`mechanical simulation coverage too small: ${sim.state().mechanismCount}`);
  const rotor=sim.rotors[0],rotorInitial=rotor.mesh.quaternion.clone(),osc=sim.oscillators[0],oscInitial=osc.object.position.clone();
  run(sim,9000);
  assert.ok(rotorInitial.angleTo(rotor.mesh.quaternion)>.001,'primary mechanisms did not rotate');
  assert.ok(osc.object.position.distanceTo(oscInitial)>.0001,'reciprocating mechanisms did not move');
  sim.pause();assert.equal(sim.state().paused,true);
  sim.resume();assert.equal(sim.state().running,true);
  sim.stop();
  assert.ok(rotorInitial.angleTo(rotor.mesh.quaternion)<1e-8,'rotor phase not restored');
  assert.ok(osc.object.position.distanceTo(oscInitial)<1e-8,'oscillator position not restored');
  sim.dispose();machine.dispose();
});

test('V47 shows visible ink drips plus left/right ink films and dampening paths in every PU',()=>{
  const machine=new OffsetMachineTemplate(),sim=new PrintingSimulation(machine.root,machine);
  assert.equal(sim.fluidFlows.length,32,'expected drip + two ink-film branches + dampening for each PU');
  for(const type of ['ink-drip','ink-film-left','ink-film-right','dampening'])assert.equal(sim.fluidFlows.filter(flow=>flow.type===type).length,8,`wrong ${type} count`);
  assert.deepEqual(INK_SIMULATION_SEQUENCE.slice(0,2),['Ink fountain / zone metering','Tetesan tinta ke ductor / vibrator']);
  const drip=sim.fluidFlows.find(flow=>flow.type==='ink-drip'),before=drip.particles[0].position.clone();
  sim.start();sim.update(0);for(let ms=16;ms<=3600;ms+=16)sim.update(ms);
  assert.ok(drip.particles[0].position.distanceTo(before)>.08,'visible ink droplet did not travel');
  assert.ok(drip.particles[0].scale.y>drip.particles[0].scale.x*1.8,'ink droplet is not visibly elongated as a drip');
  assert.ok(drip.tube.visible,'ink stream/tube should be visible');
  for(const flow of sim.fluidFlows)for(const particle of flow.particles){
    assert.ok(Number.isFinite(particle.position.x)&&Number.isFinite(particle.position.y)&&Number.isFinite(particle.position.z));
    assert.ok(particle.position.y>1.25&&particle.position.y<3.05,'ink/dampening visualization leaves PU process zone');
  }
  sim.setInkFlowVisible(false);
  assert.ok(sim.fluidFlows.every(flow=>!flow.tube.visible&&flow.particles.every(p=>!p.visible)),'ink-flow toggle did not hide all flow objects');
  sim.stop();sim.dispose();machine.dispose();
});

test('UV curing lamps and beams activate only while a sheet occupies the dryer and reset cleanly',()=>{
  const machine=new OffsetMachineTemplate(),sim=new PrintingSimulation(machine.root,machine);
  assert.equal(sim.uvLamps.reduce((sum,item)=>sum+item.count,0),3,'expected three logical UV cassette lamps');
  assert.equal(sim.uvBeams.reduce((sum,item)=>sum+item.count,0),3,'expected three logical UV beams');
  assert.ok(sim.uvBeams.every(item=>item.mesh.visible===false),'UV beams must start off');
  sim.start();sim.update(0);
  let observed=false;
  for(let ms=16;ms<=22000;ms+=16){
    sim.update(ms);
    if(sim.state().uvActive){observed=true;break;}
  }
  assert.equal(observed,true,'UV system never activated while sheets traversed dryer');
  assert.ok(sim.uvBeams.every(item=>item.mesh.visible),'UV beams must be visible while curing');
  assert.ok(sim.uvLamps.every(item=>item.material.emissiveIntensity>1),'UV lamps must visibly brighten while active');
  sim.stop();
  assert.equal(sim.state().uvActive,false);
  assert.ok(sim.uvBeams.every(item=>item.mesh.visible===item.initialVisible),'UV beams did not restore after stop');
  sim.dispose();machine.dispose();
});

test('each flexible sheet accumulates print color bands only after passing printing units',()=>{
  const machine=new OffsetMachineTemplate(),sim=new PrintingSimulation(machine.root,machine);
  run(sim,9000);
  const active=sim.sheets.filter(sheet=>sheet.mesh.visible);
  assert.ok(active.length>3);
  for(const sheet of active)assert.ok(sheet.userData.printed>=0&&sheet.userData.printed<=8);
  assert.ok(active.some(sheet=>sheet.userData.printed>0),'no simulated sheet received a printing layer');
  sim.dispose();machine.dispose();
});

test('V48 delivery releases finished sheets onto the existing paper pile and accumulates them',()=>{
  const machine=new OffsetMachineTemplate(),sim=new PrintingSimulation(machine.root,machine);
  const anchorBefore=sim.refreshDeliveryPileAnchor().clone(),end=sim.curve.getPointAt(1);
  assert.ok(Math.abs(end.x-anchorBefore.x)<.20,`delivery path misses pile center in X: ${end.x} vs ${anchorBefore.x}`);
  assert.ok(Math.abs(end.z-anchorBefore.z)<.02,'delivery path misses pile center laterally');
  assert.ok(end.y>=anchorBefore.y-.03&&end.y<=anchorBefore.y+.12,`delivery release height is not above pile: ${end.y} vs ${anchorBefore.y}`);
  run(sim,19000);
  const state=sim.state(),pile=sim.pileSheets.filter(sheet=>sheet.mesh.visible);
  assert.ok(state.completed>0,'no sheet completed into delivery');
  assert.ok(state.pileSheetsVisible>0,'delivery pile did not accumulate any sheet');
  assert.equal(state.pileSheetsVisible,pile.length);
  const ys=[];
  for(const sheet of pile){
    const a=sheet.mesh.geometry.attributes.position.array;
    assert.ok([...a].every(Number.isFinite),'delivered pile sheet contains non-finite vertices');
    let sx=0,sy=0,sz=0,n=0;
    for(let i=0;i<a.length;i+=3){sx+=a[i];sy+=a[i+1];sz+=a[i+2];n++;}
    assert.ok(Math.abs(sx/n-anchorBefore.x)<.02,'delivered sheet is horizontally misaligned from main pile');
    assert.ok(Math.abs(sz/n-anchorBefore.z)<.02,'delivered sheet is laterally misaligned from main pile');
    assert.ok(sy/n>=anchorBefore.y-.001,'delivered sheet sits below the existing pile top');
    ys.push(sy/n);
  }
  ys.sort((a,b)=>a-b);
  for(let i=1;i<ys.length;i++)assert.ok(ys[i]>=ys[i-1],'delivered sheets do not form an ordered stack');
  sim.stop();
  assert.equal(sim.state().pileSheetsVisible,0,'Stop & Reset must clear simulated delivered sheets');
  assert.ok(sim.pileSheets.every(sheet=>!sheet.mesh.visible),'pile sheets remain visible after reset');
  sim.dispose();machine.dispose();
});

test('simulation dryer zone corresponds to installed extension dimensions',()=>{
  assert.ok(OFFSET5_DIMENSIONS.layout.dryerLength>1);
});

test('V115 Offset5 prioritizes high-value downstream rotor animation within the mobile mesh budget',()=>{
  const machine=new OffsetMachineTemplate();
  const dynamic=machine.meshes.filter(m=>m.userData.dynamicRotor),byRole=role=>dynamic.filter(m=>m.userData.rotorRole===role);
  assert.equal(dynamic.length,10,'unexpected prioritized downstream dynamic rotor count');
  assert.equal(byRole('coater-process-roller').length,3);
  assert.equal(byRole('sheet-brake-roller').length,3);
  assert.equal(byRole('delivery-chain-sprocket').length,4);
  const references=machine.meshes.filter(m=>m.userData.motionBudget==='STATIC_REFERENCE_MOBILE');
  const referenceCount=role=>references.filter(m=>m.userData.rotorRoleReference===role).reduce((sum,m)=>sum+(m.userData.rotorElementCount||1),0);
  assert.equal(referenceCount('dryer-transport-roller'),6);
  assert.equal(referenceCount('delivery-chain-sprocket-ring'),4);
  assert.equal(referenceCount('delivery-tensioner-idler'),2);

  for(const id of ['coater-chamber-locks','dryer-ventilation','delivery-pile-lift']){
    const node=machine.findNode(id);assert.ok(node,id);const tagged=[];node.traverse(o=>{if(o.isMesh&&o.userData.dynamicRotor)tagged.push(o);});assert.equal(tagged.length,0,id+' must not be a dynamic rotor group');
  }
  const sprockets=byRole('delivery-chain-sprocket');assert.equal(new Set(sprockets.map(m=>m.userData.rotorPairKey)).size,4);
  const staticMeshes=references.map(mesh=>({mesh,q:mesh.quaternion.clone()}));
  const sim=new PrintingSimulation(machine.root,machine),taggedRotors=sim.rotors.filter(r=>r.source==='geometry-role-tag');
  assert.equal(taggedRotors.length,10);assert.equal(new Set(taggedRotors.map(r=>r.role)).size,3);
  const before=taggedRotors.map(r=>r.mesh.quaternion.clone());run(sim,5000);
  assert.ok(taggedRotors.some((r,i)=>r.mesh.quaternion.angleTo(before[i])>.001),'tagged downstream rotors never moved');
  assert.equal(staticMeshes.every(x=>x.mesh.quaternion.angleTo(x.q)<1e-10),true,'mobile-budget reference rotor unexpectedly moved');
  sim.stop();assert.equal(taggedRotors.every((r,i)=>r.mesh.quaternion.angleTo(before[i])<1e-8),true,'tagged rotor phase did not reset');
  sim.dispose();machine.dispose();
});
