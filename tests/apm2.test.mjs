import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {APM2MachineTemplate} from '../frontend/src/apm2.js';
import {APM2ProcessSimulation,APM2_SIMULATION_STAGES,APM2_PROCESS_STEPS} from '../frontend/src/simulation-apm2.js';
import {APM2_DIMENSIONS,APM2_PROCESS_SEQUENCE} from '../frontend/src/data/dimensions-apm2.js';
import {APM2_TAXONOMY,APM2_TAXONOMY_BY_ID,apm2TaxonomyStats} from '../frontend/src/data/taxonomy-apm2.js';
import {APM2_TECHNICAL_SOURCES} from '../frontend/src/data/sources-apm2.js';

test('APM2 identity stays faithful to BMJ while SP102 family transport evidence remains suffix-neutral',()=>{
 assert.equal(APM2_DIMENSIONS.verified.assetCode,'APM-2');assert.equal(APM2_DIMENSIONS.verified.model,'SP 102');assert.equal(APM2_DIMENSIONS.verified.serial,'57115506');assert.equal(APM2_DIMENSIONS.verified.functionalLocation,'PC-PK2-CON-AUT-AUTOPLAT02');assert.equal(APM2_DIMENSIONS.verified.year,1994);
 assert.equal(APM2_DIMENSIONS.familyReference.suffix,'UNCONFIRMED');assert.equal(APM2_DIMENSIONS.verified.maxSheetWidth,1.020);assert.equal(APM2_DIMENSIONS.verified.maxSheetLength,.720);assert.equal(APM2_DIMENSIONS.familyReference.maxSpeedSph,7500);assert.equal(APM2_DIMENSIONS.familyReference.maxCuttingForceT,250);
 assert.equal(APM2_DIMENSIONS.familyReference.gripperBarChainSetReference,14);assert.equal(APM2_DIMENSIONS.familyReference.intermittentStationTransportFamilyReference,true);
 assert.ok(APM2_TECHNICAL_SOURCES.some(s=>s.id==='APM2-SP102-CHAIN14'));assert.ok(APM2_TECHNICAL_SOURCES.some(s=>s.id==='APM2-BOBST-GRIPPER-PATENT'));
});

test('APM2 builds the complete SP102 family process line with explicit non-installation-CAD boundary',()=>{
 const machine=new APM2MachineTemplate(),box=new THREE.Box3().setFromObject(machine.root),size=box.getSize(new THREE.Vector3());
 for(const id of ['apm2-feeder','apm2-register','apm2-transport','apm2-platen','apm2-stripping','apm2-delivery','apm2-drive','apm2-control','apm2-safety','apm2-register-sidelay','apm2-gripper-bars','apm2-moving-platen','apm2-stripping-upper','apm2-delivery-paper-stack'])assert.ok(machine.findNode(id),id);
 assert.equal(machine.root.userData.bmjAssetId,'BMJ-MCH-0010');assert.equal(machine.root.userData.engineeringDimensions,false);assert.match(machine.root.userData.geometryStatus,/SUFFIX_UNCONFIRMED/);
 assert.ok(size.x>5.5&&size.x<7.2);assert.ok(size.y>1.9&&size.y<2.6);assert.ok(size.z>2&&size.z<3.5);assert.ok(box.min.y>-.05);machine.dispose();
});

test('APM2 geometry contains exactly fourteen family-reference gripper bars with unique phases',()=>{
 const machine=new APM2MachineTemplate(),bars=[];machine.root.traverse(o=>{if(o.userData.gripperBar)bars.push(o);});
 assert.equal(bars.length,14);assert.equal(new Set(bars.map(b=>b.userData.barPhase)).size,14);assert.equal(bars.every(b=>b.userData.familyCountReference===14),true);
 for(let i=1;i<=14;i++)assert.ok(machine.findNode('apm2-gripper-bar-'+i),String(i));
 const chainNode=APM2_TAXONOMY_BY_ID.get('APM2.TRANSPORT.BARS.SET');assert.ok(chainNode.sourceRefs.includes('APM2-SP102-CHAIN14'));assert.ok(chainNode.sourceRefs.includes('APM2-BOBST-GRIPPER-PATENT'));machine.dispose();
});

test('APM2 rotor collection is role-tagged and excludes suction stems controls and static platen hardware',()=>{
 const machine=new APM2MachineTemplate(),sim=new APM2ProcessSimulation(machine.root,machine),allowed=new Set(['feed-roller','chain-sprocket','main-motor','flywheel','clutch-brake','main-shaft','drive-gear']);
 assert.equal(sim.rotors.length,13);assert.equal(sim.rotors.every(r=>allowed.has(r.userData.mechanismRole)),true);assert.equal(sim.gripperBars.length,14);
 assert.equal(machine.meshes.some(m=>m.userData.driveRotor&&!allowed.has(m.userData.mechanismRole)),false);sim.dispose();machine.dispose();
});

test('APM2 feeder and SideLay act only in their registration windows while gripper chain remains stopped',()=>{
 const machine=new APM2MachineTemplate(),sim=new APM2ProcessSimulation(machine.root,machine),side=machine.findNode('apm2-register-sidelay'),side0=side.position.clone();sim.start();let now=1000;const advance=t=>{while(sim.elapsed<t){now+=20;sim.update(now);}};
 advance(.55);let s=sim.state();assert.equal(s.feederSuctionActive,true);assert.equal(s.transportStopped,true);
 advance(1.55);s=sim.state();assert.equal(s.registrationActive,true);assert.equal(s.sideLayActive,true);assert.equal(s.transportStopped,true);assert.ok(side.position.distanceTo(side0)>.001);
 advance(2.4);s=sim.state();assert.equal(s.transportIndexing,true);assert.equal(s.sideLayActive,false);sim.dispose();machine.dispose();
});

test('APM2 flatbed pressure dwell freezes sheets and all fourteen gripper bars',()=>{
 const machine=new APM2MachineTemplate(),sim=new APM2ProcessSimulation(machine.root,machine);sim.start();let now=1000;const advance=t=>{while(sim.elapsed<t){now+=20;sim.update(now);}};
 advance(3.55);let s=sim.state();assert.equal(s.platenClosed,true);assert.equal(s.pressureDwell,true);assert.equal(s.transportStopped,true);assert.equal(s.interlocks.platenRequiresStoppedTransport,true);
 const sheets=sim.sheets.map(x=>x.mesh.position.clone()),bars=sim.gripperBars.map(x=>x.position.clone());
 advance(3.90);assert.equal(sim.sheets.every((x,i)=>x.mesh.position.distanceTo(sheets[i])<1e-10),true);assert.equal(sim.gripperBars.every((x,i)=>x.position.distanceTo(bars[i])<1e-10),true);
 advance(4.65);assert.equal(sim.state().transportIndexing,true);assert.ok(sim.gripperBars.some((x,i)=>x.position.distanceTo(bars[i])>.03));sim.dispose();machine.dispose();
});

test('APM2 stripping family-reference stroke occurs only while transport is stopped',()=>{
 const machine=new APM2MachineTemplate(),sim=new APM2ProcessSimulation(machine.root,machine),upper=machine.findNode('apm2-stripping-upper'),lower=machine.findNode('apm2-stripping-lower'),u0=upper.position.clone(),l0=lower.position.clone();sim.start();let now=1000;const advance=t=>{while(sim.elapsed<t){now+=20;sim.update(now);}};
 advance(5.6);const s=sim.state();assert.equal(s.strippingActive,true);assert.equal(s.transportStopped,true);assert.equal(s.interlocks.strippingRequiresStoppedTransport,true);assert.equal(s.strippingConfigurationVerified,false);assert.ok(upper.position.distanceTo(u0)>.01);assert.ok(lower.position.distanceTo(l0)>.005);sim.dispose();machine.dispose();
});

test('APM2 converted sheets accumulate on top of represented delivery pile and reset cleanly',()=>{
 const machine=new APM2MachineTemplate(),sim=new APM2ProcessSimulation(machine.root,machine);sim.start();let now=1000;for(let i=0;i<1200;i++){now+=20;sim.update(now);}const s=sim.state();assert.ok(s.completed>0);assert.ok(s.pileSheetsVisible>0);assert.equal(s.visualTimeScaledDemo,true);assert.equal(s.familyProductionReferenceSph,7500);assert.ok(sim.pileSheets.filter(p=>p.mesh.visible).every(p=>p.mesh.position.y>=sim.pileAnchor.y));
 sim.stop();assert.equal(sim.state().pileSheetsVisible,0);assert.equal(sim.rotors.every((r,i)=>r.quaternion.angleTo(sim.rotorRest[i])<1e-9),true);assert.equal(sim.gripperBars.every((b,i)=>b.position.distanceTo(sim.barRest[i])<1e-10),true);sim.dispose();machine.dispose();
});

test('APM2 pause and resume do not jump process time',()=>{
 const machine=new APM2MachineTemplate(),sim=new APM2ProcessSimulation(machine.root,machine);sim.start();sim.update(1000);sim.update(1200);const t=sim.elapsed;sim.pause();sim.update(20000);sim.resume();sim.update(30000);assert.equal(sim.elapsed,t);sim.update(30020);assert.ok(sim.elapsed-t<.03);sim.dispose();machine.dispose();
});

test('APM2 taxonomy remains six-level and variant-specific systems stay reference-only',()=>{
 const machine=new APM2MachineTemplate(),stats=apm2TaxonomyStats();assert.ok(stats.total>190);for(let level=1;level<=6;level++)assert.ok(stats.byLevel[level]>0);
 for(const id of ['APM2','APM2.FEEDER','APM2.REGISTER','APM2.TRANSPORT','APM2.PLATEN','APM2.STRIP','APM2.DELIVERY','APM2.DRIVE','APM2.CONTROL','APM2.SAFETY'])assert.ok(APM2_TAXONOMY_BY_ID.has(id),id);
 assert.equal(APM2_TAXONOMY_BY_ID.get('APM2.STRIP.STATION').confidence,'REFERENCE_ONLY');assert.ok(!APM2_TAXONOMY.some(n=>/SP 102 (SE|E|CER|BMA)/i.test(n.name)));
 for(const id of ['APM2.TRANSPORT.BARS.SET','APM2.PLATEN.TOOLING.CHASE','APM2.STRIP.STATION.FRAMES','APM2.DELIVERY.PILE.STACK'])assert.ok(machine.resolveTaxonomyNode(id),id);machine.dispose();
});

test('APM2 process sequence explicitly separates index and dwell operations',()=>{
 assert.deepEqual(APM2_SIMULATION_STAGES,['Pile separation / suction pickup','Front lays + SideLay registration','Gripper index to platen','Flatbed die-cut pressure dwell','Gripper index to stripping','Stripping dwell · family reference','Gripper index to delivery','Gripper release / pile formation']);
 assert.equal(APM2_PROCESS_STEPS.length,8);assert.deepEqual(APM2_PROCESS_SEQUENCE.map(x=>x.key),['FEEDER','REGISTER','TRANSPORT','PLATEN','STRIP','DELIVERY']);
});

test('APM2 fourteen gripper bars advance only one chain pitch per machine cycle',()=>{
 const machine=new APM2MachineTemplate(),sim=new APM2ProcessSimulation(machine.root,machine);sim.start();let now=1000;const advance=t=>{while(sim.elapsed<t){now+=20;sim.update(now);}};
 const b=sim.gripperBars[0],p0=b.position.clone();advance(2.82);const afterIndex=b.position.clone();assert.ok(afterIndex.distanceTo(p0)>.01);assert.ok(afterIndex.distanceTo(p0)<1.5);
 advance(7.90);assert.ok(b.position.distanceTo(afterIndex)<1e-10,'gripper bar moved during stopped processing dwell');
 advance(10.75);assert.ok(b.position.distanceTo(afterIndex)>.01,'next cycle failed to advance the next chain pitch');
 sim.dispose();machine.dispose();
});
