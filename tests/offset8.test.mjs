import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {Offset8MachineTemplate} from '../frontend/src/offset8.js';import {Offset8PrintingSimulation,OFFSET8_SIMULATION_STAGES} from '../frontend/src/simulation-offset8.js';
import {OFFSET8_MODULE_SEQUENCE,OFFSET8_SPEC} from '../frontend/src/data/dimensions-offset8.js';import {OFFSET8_TAXONOMY,offset8TaxonomyStats} from '../frontend/src/data/taxonomy-offset8.js';import {OFFSET8_TECHNICAL_SOURCES} from '../frontend/src/data/sources-offset8.js';import {universalMachineConfig,universalTaxonomy,universalTechnicalSources} from '../frontend/src/universal-machine.js';
test('Offset 8 is dedicated CX104-8+LYYL geometry',()=>{const m=new Offset8MachineTemplate();assert.equal(OFFSET8_SPEC.configuration,'8 PU + L + Y + Y + L');assert.equal(OFFSET8_MODULE_SEQUENCE.length,12);for(const x of OFFSET8_MODULE_SEQUENCE)assert.ok(m.findNode('offset8-'+x.key.toLowerCase()));assert.ok(m.meshes.length>250);assert.equal(m.findNode('offset8-pu1-ink-roller-13'),null);m.dispose();});
test('each PU has physical offset train, 4+4 ink and 5 dampening rollers',()=>{const m=new Offset8MachineTemplate();for(let i=1;i<=8;i++){const id='offset8-pu'+i;for(const x of ['cylinders','inking','dampening','sheet'])assert.ok(m.findNode(id+'-'+x));const roles=[];m.findNode(id+'-inking').traverse(o=>o.userData?.rollerRole&&roles.push(o.userData.rollerRole));assert.equal(roles.filter(x=>x.startsWith('distributor')).length,4);assert.equal(roles.filter(x=>x.startsWith('form')).length,4);const d=[];m.findNode(id+'-dampening').traverse(o=>o.userData?.rollerRole&&d.push(o));assert.equal(d.length,5);}m.dispose();});
test('LYYL order has two evidence-bounded coaters and neutral dryer sections',()=>{const m=new Offset8MachineTemplate();assert.deepEqual(OFFSET8_MODULE_SEQUENCE.slice(-4).map(x=>x.key),['L1','Y1','Y2','L2']);for(const x of ['l1-chamber','l1-anilox','l1-drip','l1-supply','l1-apply','y1-air','y1-guide','y1-recirc','y1-exhaust','y2-air','y2-recirc','l2-drip','l2-apply'])assert.ok(m.findNode('offset8-'+x));assert.equal(m.findNode('offset8-y1').userData.energyTechnologyVerified,false);m.dispose();});
test('six-level taxonomy is populated and mapped',()=>{const s=offset8TaxonomyStats();for(let l=1;l<=6;l++)assert.ok(s.byLevel[l]>0);assert.ok(s.total>250);});
test('simulation rotates only real process rollers and restores every local-axis quaternion',()=>{
 const m=new Offset8MachineTemplate(),s=new Offset8PrintingSimulation(m.root,m);
 assert.equal(s.rotors.length,193);
 const allowed=/^(plate|blanket|impression|transfer|distributor-\d+|form-\d+|transfer-ink|damp-\d+|feed-wheel|anilox|coating-blanket|coating-impression|chain-sprocket|sheet-brake)$/;
 assert.equal(s.rotors.some(r=>!allowed.test(r.userData.rollerRole||'')),false);
 assert.equal(s.rotors.some(r=>['rail','sucker','air-bar','exhaust'].includes(r.userData.rollerRole)),false);
 assert.ok(s.suckers.length===4);assert.ok(OFFSET8_SIMULATION_STAGES.includes('Dynamic Sheet Brake'));
 s.start();let now=1000;for(let i=0;i<1800;i++){now+=10;s.update(now);}
 assert.ok(s.completed>0);assert.ok(s.state().mechanismCount>s.rotors.length);
 s.stop();assert.equal(s.state().pileSheetsVisible,0);
 assert.equal(s.rotors.every((r,i)=>r.quaternion.angleTo(s.rotorRest[i])<1e-9),true);
 s.dispose();m.dispose();
});
test('official CX104 limits are recorded without inventing installed roller counts or dryer energy technology',()=>{assert.deepEqual(OFFSET8_SPEC.maxSheet,[.720,1.040]);assert.deepEqual(OFFSET8_SPEC.maxPrint,[.710,1.020]);assert.equal(OFFSET8_SPEC.speedStandard,15000);assert.equal(OFFSET8_SPEC.speedOption,16500);assert.equal(OFFSET8_SPEC.feederPile,1.320);assert.equal(OFFSET8_SPEC.inkingRollerCountVerified,false);assert.equal(OFFSET8_SPEC.dampeningRollerCountVerified,false);assert.equal(OFFSET8_SPEC.dryerEnergyTechnologyVerified,false);});
test('OFFSET 8 app evidence routing matches its dedicated engine runtime',()=>{
 const cfg=universalMachineConfig('BMJ-MCH-0005');
 assert.equal(cfg.evidence.simulation,'VERIFIED_PROCESS_MODEL');
 assert.equal(cfg.evidence.geometry,'DEDICATED_OFFICIAL_FAMILY_REFERENCE');
 assert.deepEqual(universalTaxonomy('BMJ-MCH-0005'),OFFSET8_TAXONOMY);
 assert.deepEqual(universalTechnicalSources('BMJ-MCH-0005'),OFFSET8_TECHNICAL_SOURCES);
 assert.ok(OFFSET8_TECHNICAL_SOURCES.filter(s=>s.authority==='primary').length>=2);
});

test('V99 sheet centerline visits offset/coating nips without crossing cylinder cores',()=>{
 const m=new Offset8MachineTemplate(),s=new Offset8PrintingSimulation(m.root,m);
 const critical=[];m.root.updateMatrixWorld(true);
 m.root.traverse(o=>{if(o.isMesh&&['plate','blanket','impression','transfer','coating-blanket','coating-impression','anilox'].includes(o.userData.rollerRole)){const p=new THREE.Vector3();o.getWorldPosition(p);critical.push({p,r:o.userData.radius,role:o.userData.rollerRole});}});
 let minimum=Infinity;
 for(const p of s.curve.getPoints(900))for(const c of critical){const d=Math.hypot(p.x-c.p.x,p.y-c.p.y);minimum=Math.min(minimum,d);assert.ok(d>c.r*.98,`${c.role} core penetration d=${d.toFixed(3)} r=${c.r}`);}
 assert.ok(minimum<.34,'path should still approach a real process nip rather than float far above all cylinders');
 s.dispose();m.dispose();
});

test('V99 delivery stack accumulates on the represented pile surface and dryer/coater states are occupancy-driven',()=>{
 const m=new Offset8MachineTemplate(),s=new Offset8PrintingSimulation(m.root,m);s.start();let now=1000,coat=false,dry=false,brake=false;
 for(let i=0;i<2400;i++){now+=10;s.update(now);const st=s.state();coat||=st.coatingActive;dry||=st.dryerActive;brake||=st.deliveryBrakeActive;}
 assert.ok(coat&&dry&&brake);assert.equal(s.staticDeliveryStack.visible,false);assert.ok(s.completed>0);const visible=s.stack.filter(x=>x.visible);assert.ok(visible.length>0);assert.ok(visible.every(x=>x.position.y>=.654));
 s.dispose();m.dispose();
});

test('V101 delivery gripper bars move around the represented chain loop and reset exactly',()=>{
 const m=new Offset8MachineTemplate(),s=new Offset8PrintingSimulation(m.root,m);assert.equal(s.deliveryBars.length,8);const before=s.deliveryBars.map(b=>b.position.clone());
 s.start();let now=1000;for(let i=0;i<80;i++){now+=20;s.update(now);}assert.ok(s.deliveryBars.some((b,i)=>b.position.distanceTo(before[i])>.05));assert.equal(s.state().deliveryGripperActive,true);
 s.stop();assert.equal(s.deliveryBars.every((b,i)=>b.position.distanceTo(before[i])<1e-10),true);s.dispose();m.dispose();
});

test('V101 AirTransfer and coating details are functional references rather than unsupported exact claims',()=>{
 const m=new Offset8MachineTemplate();let venturi=0,levels=0;m.root.traverse(o=>{if(o.userData.airTransferNozzle)venturi++;if(o.userData.levelSensor)levels++;});
 assert.equal(venturi,56);assert.equal(levels,4);
 for(let i=1;i<=8;i++){assert.equal(m.findNode('offset8-pu'+i+'-inking').userData.exactRollerCountVerified,false);assert.equal(m.findNode('offset8-pu'+i+'-dampening').userData.exactRollerCountVerified,false);}
 m.dispose();
});
