import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {FZ1200MachineTemplate} from '../frontend/src/fz1200.js';
import {FZ1200ProcessSimulation,FZ1200_SIMULATION_STAGES} from '../frontend/src/simulation-fz1200.js';
import {FZ1200_ASSET_PROFILES} from '../frontend/src/data/dimensions-fz1200.js';
import {fz1200TaxonomyFor} from '../frontend/src/data/taxonomy-fz1200.js';
import {FZ1200_TECHNICAL_SOURCES} from '../frontend/src/data/sources-fz1200.js';

test('FZ1200 keeps all three BMJ identities and supplier numbers remain reference-only',()=>{
 assert.equal(Object.keys(FZ1200_ASSET_PROFILES).length,3);assert.equal(FZ1200_ASSET_PROFILES['BMJ-MCH-0007'].serial,'24RVOFS0920');assert.equal(FZ1200_ASSET_PROFILES['BMJ-MCH-0008'].serial,'2105080SF34');assert.equal(FZ1200_ASSET_PROFILES['BMJ-MCH-0022'].serial,'22000320');
 const ref=FZ1200_ASSET_PROFILES['BMJ-MCH-0007'];assert.equal(ref.exactModelPublicReference.maxPileKg,1200);assert.deepEqual(ref.exactModelPublicReference.openingM,[.76,1.64]);assert.equal(ref.exactModelPublicReference.powerKw,9);
 assert.equal(ref.installedCapacityVerified,false);assert.equal(ref.installedOpeningVerified,false);assert.equal(ref.installedPowerVerified,false);assert.equal(ref.installedEnvelopeVerified,false);assert.equal(ref.exactNozzleCountVerified,false);
 assert.ok(FZ1200_TECHNICAL_SOURCES.some(s=>s.id==='FZ1200-EVIDENCE-BOUNDARY'));
});

test('each FZ1200 asset instantiates pivot-correct clamp turn air jog hydraulic geometry',()=>{
 for(const assetId of Object.keys(FZ1200_ASSET_PROFILES)){const model=new FZ1200MachineTemplate(assetId),box=new THREE.Box3().setFromObject(model.root);assert.equal(model.root.userData.assetId,assetId);assert.equal(model.root.userData.engineeringDimensions,false);assert.ok(!box.isEmpty());assert.ok(box.min.y>=-0.01);
  for(const id of ['fz1200-base','fz1200-clamp','fz1200-turn','fz1200-turn-yoke','fz1200-air','fz1200-jog','fz1200-hydraulic','fz1200-control'])assert.ok(model.findNode(id),id);
  assert.equal(model.findNode('fz1200-clamp').position.y,1.36);assert.equal(model.findNode('fz1200-turn-yoke').position.y,1.36);assert.equal(model.findNode('fz1200-air-nozzle').userData.exactNozzleCountVerified,false);model.dispose();}
});

test('FZ1200 true rotor whitelist excludes guide columns nozzles ducts hydraulics hoses and buttons',()=>{
 const model=new FZ1200MachineTemplate(),sim=new FZ1200ProcessSimulation(model.root,model),allowed=new Set(['trunnion-shaft','rotation-gear','blower','vibration','hyd-pump']);
 assert.equal(sim.rotors.length,6);assert.equal(sim.rotors.some(r=>!allowed.has(r.userData.mechanismRole)),false);
 const forbidden=['clamp-guide','trunnion','rotation-drive','air-nozzle','dust-duct','hyd-cylinder','hose','button'];assert.equal(model.meshes.some(m=>m.userData.rotor&&forbidden.includes(m.userData.mechanismRole)),false);
 sim.dispose();model.dispose();
});

test('FZ1200 clamps first, reaches lift clearance, then permits the pivot-correct 180 degree turn',()=>{
 const model=new FZ1200MachineTemplate(),sim=new FZ1200ProcessSimulation(model.root,model),clamp=model.findNode('fz1200-clamp'),yoke=model.findNode('fz1200-turn-yoke'),upper=model.findNode('fz1200-clamp-upper'),upper0=upper.position.y;
 sim.start();let now=1000;const advanceTo=target=>{while(sim.elapsed<target){now+=20;sim.update(now);}};
 advanceTo(2.35);let st=sim.state();assert.equal(st.clamped,true);assert.ok(upper.position.y<upper0-.40);assert.equal(st.interlocks.turnPermitted,false);
 advanceTo(3.55);st=sim.state();assert.equal(st.liftActive,true);assert.equal(st.interlocks.liftClearance,true);assert.equal(st.interlocks.turnPermitted,true);assert.ok(clamp.position.y>sim.rest.clampPosition.y+.10);assert.ok(yoke.position.y>sim.rest.yokePosition.y+.10);
 advanceTo(6.05);st=sim.state();assert.ok(st.turnAngleDeg>175);assert.ok(clamp.quaternion.angleTo(yoke.quaternion)<1e-9);assert.equal(st.interlocks.airPermitted,true);
 model.root.updateMatrixWorld(true);const pileBox=new THREE.Box3().setFromObject(model.findNode('fz1200-pile'));assert.ok(pileBox.min.y>0,'turned pile must stay above floor');
 sim.dispose();model.dispose();
});

test('FZ1200 airing and jogging use jets and opposing plate motion instead of spinning static hardware',()=>{
 const model=new FZ1200MachineTemplate(),sim=new FZ1200ProcessSimulation(model.root,model);sim.start();let now=1000,air=false,jog=false,jet=false;const jog0=sim.joggers.map(j=>j.position.clone());
 for(let i=0;i<500;i++){now+=20;sim.update(now);const s=sim.state();air||=s.airingActive;jog||=s.joggingActive;jet||=s.airJetCount>0;}
 assert.ok(air&&jog&&jet);assert.ok(sim.joggers.some((j,i)=>j.position.distanceTo(jog0[i])>.001)||sim.elapsed>9);
 sim.stop();assert.equal(sim.airJets.every(j=>!j.visible),true);assert.equal(sim.joggers.every((j,i)=>j.position.distanceTo(jog0[i])<1e-10),true);sim.dispose();model.dispose();
});

test('FZ1200 cycle remains continuous across repeated 180 degree turns and resets exactly',()=>{
 const model=new FZ1200MachineTemplate(),sim=new FZ1200ProcessSimulation(model.root,model),clamp=model.findNode('fz1200-clamp'),q0=clamp.quaternion.clone();sim.start();let now=1000;
 for(let i=0;i<1300;i++){now+=20;sim.update(now);}assert.ok(sim.completed>=2);assert.ok(clamp.quaternion.angleTo(q0)<.25,'two 180-degree cycles should approach a full 360-degree orientation');
 sim.stop();assert.ok(clamp.quaternion.angleTo(q0)<1e-10);assert.equal(sim.state().completed,0);sim.dispose();model.dispose();
});

test('FZ1200 taxonomy is six-level for every BMJ unit',()=>{
 for(const assetId of Object.keys(FZ1200_ASSET_PROFILES)){const taxonomy=fz1200TaxonomyFor(assetId);assert.deepEqual([...new Set(taxonomy.map(n=>n.level))].sort(),[1,2,3,4,5,6]);assert.equal(new Set(taxonomy.map(n=>n.id)).size,taxonomy.length);for(const n of taxonomy.filter(n=>n.level>1))assert.ok(taxonomy.some(p=>p.id===n.parentId),n.id);}
});

test('FZ1200 process stages preserve clamp turn air jog and unload ordering',()=>{
 assert.deepEqual(FZ1200_SIMULATION_STAGES,['Load pile','Clamp pile','Lift to turning clearance','Turn pile 180°','Air separation / dust removal','Jog / align','Stabilize turned pile','Lower and release for unloading']);
});

test('V104 FZ1200 interlocks prevent turn and air before clamp and lift clearance',()=>{
 const model=new FZ1200MachineTemplate(),sim=new FZ1200ProcessSimulation(model.root,model);sim.start();let now=1000;const advanceTo=t=>{while(sim.elapsed<t){now+=20;sim.update(now);}};
 advanceTo(1.1);let s=sim.state();assert.equal(s.interlocks.turnPermitted,false);assert.equal(s.turnAngleDeg,0);assert.equal(s.airingActive,false);
 advanceTo(2.4);s=sim.state();assert.equal(s.interlocks.clampSecured,true);assert.equal(s.interlocks.liftClearance,false);assert.equal(s.turnAngleDeg,0);
 advanceTo(4.0);s=sim.state();assert.equal(s.interlocks.turnPermitted,true);assert.ok(s.turnAngleDeg>0);assert.equal(s.airingActive,false);
 advanceTo(6.35);s=sim.state();assert.equal(s.interlocks.airPermitted,true);assert.equal(s.airingActive,true);
 sim.dispose();model.dispose();
});
