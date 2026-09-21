import test from 'node:test';
import assert from 'node:assert/strict';
import {V122_SOURCE_LEDGER,V122_SOURCE_STATS,V122_NEW_RESEARCH_SOURCES} from '../frontend/src/data/research-v122.js';
import {OffsetMachineTemplate} from '../frontend/src/offset5.js';
import {MK1060MachineTemplate} from '../frontend/src/mk1060.js';
import {Polar115MachineTemplate} from '../frontend/src/polar115.js';
import {SheetingMachineTemplate} from '../frontend/src/sheeting.js';
import {createMachineTemplate} from '../frontend/src/machine-runtime.js';
import {REFERENCE_MACHINE_IDS} from '../frontend/src/reference-machines.js';

const roles=(root,key='mechanismRole')=>{
 const s=new Set();root.traverse(o=>{const v=o.userData?.[key];if(v)s.add(v);});return s;
};
const roleUnion=root=>{
 const s=new Set();root.traverse(o=>{for(const k of ['mechanismRole','role'])if(o.userData?.[k])s.add(o.userData[k]);});return s;
};
const requireRoles=(model,required)=>{
 const set=roleUnion(model.root);
 for(const role of required)assert.ok(set.has(role),model.root.name+' missing '+role);
};

test('V122 research ledger exceeds 160 unique technical sources without URL duplication',()=>{
 const urls=V122_SOURCE_LEDGER.map(s=>s.url);
 assert.ok(V122_SOURCE_STATS.total>=160,'V122 ledger only has '+V122_SOURCE_STATS.total);
 assert.ok(V122_SOURCE_STATS.newReviewed>=60,'V122 new source batch only has '+V122_SOURCE_STATS.newReviewed);
 assert.equal(new Set(urls).size,urls.length,'V122 ledger contains duplicate URLs');
 assert.equal(V122_NEW_RESEARCH_SOURCES.length,V122_SOURCE_STATS.newReviewed);
});

test('V122 research includes model/service manuals and primary mechanism sources across major machine groups',()=>{
 const scopes=V122_SOURCE_LEDGER.map(s=>String(s.machineScope||''));
 for(const token of ['OFFSET5','OFFSET8/OFFSET10','POLAR115','APM2','MK1060ER','PROMATRIX106','MEDIA100','DIANAEYE55','SHEETING','CTP','ZUND','COLLATOR','COMPRESSOR','AHU','YA1A1A'])assert.ok(scopes.some(x=>x.includes(token)),token);
 assert.ok(V122_SOURCE_STATS.primaryOrManual>=35,'manual/primary source mix is too weak');
});

test('V122 Offset 5 Preset Plus feedboard exposes manual-grounded Level 5-6 register and detection components',()=>{
 const m=new OffsetMachineTemplate(),set=roles(m.root);
 assert.equal(m.root.userData.researchVersion,'V122');
 assert.ok(m.root.userData.researchSourceCount>=160);
 requireRoles(m,['front-lay','front-lay-pivot','pull-plate','propelling-roller','pull-sensor','multiple-sheet-detector-crossbar','suction-tape-rotary-valve','sheet-separator-finger','sheet-separation-blower-nozzle']);
 const front=m.findNode('feedboard-front-lays'),det=m.findNode('feedboard-detection');
 assert.equal(front.userData.exactFamilyCount,15);
 assert.equal(det.userData.manualOptionRange,'1..24 feeler rollers');
 assert.equal(det.userData.installedFeelerCountUnknown,true);
 m.dispose();
});

test('V122 MK1060ER exposes gripper-chain protection platen stripping blanking lubrication and delivery details',()=>{
 const m=new MK1060MachineTemplate();
 assert.equal(m.root.userData.researchVersion,'V122');assert.ok(m.root.userData.researchSourceCount>=160);
 requireRoles(m,['torque-limiter-proximity-switch','gripper-chain-guide','chain-tensioner-sprocket','cutting-force-adjuster','female-stripping-board','lower-stripping-needle','upper-carton-separation-rubber','complete-blank-delivery-frame','delivery-photocell','lubrication-pump','main-drive-chain-sprocket']);
 const lube=m.findNode('mk1060-lubrication-v122');assert.match(lube.userData.installedRoutingBoundary,/exact tube routing/i);
 m.dispose();
});

test('V122 POLAR 115 exposes backgauge sledge clamp pressure knife drive safety indication and hydraulic manifold detail',()=>{
 const m=new Polar115MachineTemplate();
 assert.equal(m.root.userData.researchVersion,'V122');assert.ok(m.root.userData.researchSourceCount>=160);
 requireRoles(m,['backgauge-sledge','backgauge-lead-nut','position-encoder-body','clamp-pressure-adjuster','clamp-piston-rod','knife-carrier-guide','knife-drive-clutch','knife-drive-gear','knife-change-handle','cut-line-emitter','hydraulic-pump-motor','hydraulic-solenoid-valve']);
 m.dispose();
});

test('V122 Sheeting keeps HSM-CTM7 exact boundary while adding tension slitter knife overlap and stacker references',()=>{
 const m=new SheetingMachineTemplate();
 assert.equal(m.root.userData.researchVersion,'V122');assert.ok(m.root.userData.researchSourceCount>=160);
 requireRoles(m,['unwind-brake-disc','rollstand-load-cell-reference','web-tension-load-cell-reference','epc-actuator-reference','upper-slitter-knife-reference','knife-linear-guide-bearing','knife-drive-motor-reference','overlap-vacuum-box-reference','sheet-count-sensor-reference','stack-height-sensor-reference','lift-drive-sprocket-reference']);
 const slitter=m.findNode('sheeting-slitter-v122'),knife=m.findNode('sheeting-knife');
 assert.equal(slitter.userData.installedOptionUnknown,true);
 assert.match(slitter.userData.evidenceBoundary,/no public evidence confirms/i);
 assert.match(knife.userData.v122Boundary,/exact HSM-CTM7/i);
 m.dispose();
});

test('V122 reference-family machines inherit expanded research metadata without becoming engineering CAD',()=>{
 for(const id of REFERENCE_MACHINE_IDS){
  const m=createMachineTemplate(id);
  assert.equal(m.root.userData.researchVersion,'V122',id);
  assert.ok(m.root.userData.researchSourceCount>=160,id);
  assert.equal(m.root.userData.engineeringDimensions,false,id);
  assert.equal(m.root.userData.referenceBuilder,'V122_RESEARCH_GROUNDED_BUILDER',id);
  m.dispose();
 }
});
