import test from 'node:test';
import assert from 'node:assert/strict';
import {V123_SOURCE_LEDGER,V123_SOURCE_STATS,V123_NEW_RESEARCH_SOURCES} from '../frontend/src/data/research-v123.js';
import {Offset10MachineTemplate} from '../frontend/src/offset10.js';
import {Offset8MachineTemplate} from '../frontend/src/offset8.js';
import {DianaEye55MachineTemplate} from '../frontend/src/diana-eye55.js';
import {createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';

const roles=model=>{const s=new Set();model.root.traverse(o=>{if(o.userData?.mechanismRole)s.add(o.userData.mechanismRole);});return s;};
const requireRoles=(model,arr)=>{const s=roles(model);for(const r of arr)assert.ok(s.has(r),model.root.name+' missing '+r);};

test(`V123 research ledger contains ${V123_SOURCE_STATS.total} unique sources after deduplication`,()=>{
 const urls=V123_SOURCE_LEDGER.map(s=>s.url);
 assert.ok(V123_SOURCE_STATS.total>=195,'V123 ledger only has '+V123_SOURCE_STATS.total);
 assert.ok(V123_SOURCE_STATS.newReviewed>=20);
 assert.equal(new Set(urls).size,urls.length);
 assert.equal(V123_NEW_RESEARCH_SOURCES.length,V123_SOURCE_STATS.newReviewed);
 assert.ok(V123_SOURCE_STATS.oemOrPrimary>=50);
});

test('V123 CX104 Offset 10 exposes OEM coating AirTransfer delivery brake and FoilStar sensing detail',()=>{
 const m=new Offset10MachineTemplate();
 assert.equal(m.root.userData.researchVersion,'V123');assert.ok(m.root.userData.researchSourceCount>=195);
 requireRoles(m,['doctor-blade-metering-edge','doctor-blade-sealing-edge','compact-anilox-bearing-unit','coating-level-sensor','airtransfer-venturi-nozzle','sheet-brake-belt-reference','sheet-brake-position-sensor','delivery-pile-height-sensor','foil-unwind-index-encoder','foil-rewind-index-encoder','foil-dancer-position-sensor']);
 assert.equal(m.findNode('o10-foilstar').userData.oemIndexingConfirmed,true);
 assert.equal(m.findNode('o10-foilstar').userData.minimumFoilThicknessMicron,6);
 for(const id of ['o10-cu1','o10-cu2','o10-cuf'])assert.equal(m.findNode(id+'-chamber').userData.oemArchitecture,'PRESSURIZED_CHAMBER_DOCTOR_BLADE');
 m.dispose();
});

test('V123 CX104 Offset 8 LYYL exposes chamber doctor blade Venturi and Preset Plus delivery detail',()=>{
 const m=new Offset8MachineTemplate();
 assert.equal(m.root.userData.researchVersion,'V123');assert.ok(m.root.userData.researchSourceCount>=195);
 requireRoles(m,['doctor-blade-metering-edge','doctor-blade-sealing-edge','compact-anilox-bearing-unit','coating-level-sensor','airtransfer-venturi-nozzle','sheet-brake-belt-reference','sheet-brake-position-sensor','delivery-pile-height-sensor']);
 for(let i=1;i<=8;i++)assert.equal(m.findNode('offset8-pu'+i+'-sheet').userData.oemFunction,'AIRTRANSFER_CONTACT_FREE_SHEET_GUIDANCE');
 m.dispose();
});

test('V123 Diana Eye 55 exposes feeder knife air blowing ultrasonic double-sheet camera and bounded ejection',()=>{
 const m=new DianaEye55MachineTemplate();
 assert.equal(m.root.userData.researchVersion,'V123');assert.ok(m.root.userData.researchSourceCount>=195);
 requireRoles(m,['patented-feeding-knife-reference','vibration-motor-reference','feeder-air-manifold','feeder-air-blowing-nozzle','ultrasonic-double-sheet-emitter','ultrasonic-double-sheet-receiver','reject-confirmation-sensor']);
 assert.equal(m.findNode('diana55-feed-double').userData.oemTechnology,'ULTRASONIC_DOUBLE_SHEET_DETECTION');
 assert.equal(m.findNode('diana55-light').userData.oemIlluminationModes,4);
 assert.equal(m.findNode('diana55-reject').userData.inlineFaultBlankEjectionConfirmed,true);
 assert.equal(m.findNode('diana55-reject').userData.installedRejectActuationVerified,false);
 m.dispose();
});

test('V123 Suprasetter reference adds thermal stabilization and debris-removal detail without asserting installed options',()=>{
 const m=createMachineTemplate('BMJ-MCH-0025');
 assert.equal(m.root.userData.researchVersion,'V123');
 requireRoles(m,['temperature-stabilizer-interface','temperature-control-line-reference','debris-removal-vacuum-fan','debris-filter-cartridge']);
 assert.equal(m.root.userData.suprasetterOptions.internalPunch,'AVAILABLE_NOT_INSTALLATION_CONFIRMED');
 assert.equal(m.root.userData.engineeringDimensions,false);m.dispose();
});

test('V123 Zund reference exposes zoned vacuum ITI ICC laser and router extraction while ARC remains capability-only',()=>{
 const m=createMachineTemplate('BMJ-MCH-0028');
 requireRoles(m,['vacuum-zone-valve','iti-initialization-pad','icc-laser-pointer-reference','router-dust-extraction-hose']);
 assert.equal(m.findNode('universal-module-1-active').userData.individuallySwitchableVacuumZones,true);
 assert.match(m.findNode('universal-module-4-active').userData.arcMagazineCapability,/OPTIONAL/);
 m.dispose();
});

test('V123 compressor reference follows explicit GA26 air-oil flow architecture',()=>{
 const m=createMachineTemplate('BMJ-MCH-0031');
 requireRoles(m,['oil-separator-element','oil-scavenge-line','air-cooler-core','oil-cooler-core','condensate-trap']);
 assert.equal(m.root.userData.engineeringDimensions,false);m.dispose();
});


test('V123 R2 YA1A1A Offset 7 exposes bounded sheet-fed gravure mechanisms and blocks invented simulation',()=>{
 const m=createMachineTemplate('BMJ-MCH-0004');
 assert.equal(m.root.userData.researchVersion,'V123');
 assert.equal(m.root.userData.simulationStatus,'BLOCKED_PENDING_YA1A1A_TRANSPORT_DRIVE_VERIFICATION');
 requireRoles(m,[
  'swing-gripper-shaft','swing-pawl-gripper','ink-pan-bottom','ink-pan-lift-screw',
  'ink-drop-nozzle-reference','engraved-gravure-cylinder','doctor-pivot-shaft','doctor-blade-edge',
  'doctor-axial-oscillator','doctor-oscillation-damper','impression-cylinder',
  'impression-cylinder-gripper-bar','slack-suppression-press-roller','air-knife-reference',
  'dryer-exhaust-fan','delivery-chain-guide','delivery-pile-platform','main-drive-motor-reference',
  'transmission-line-shaft-reference'
 ]);
 assert.equal(m.findNode('o7-ink-drop-option').userData.installedOptionVerified,false);
 assert.equal(m.findNode('o7-transmission').userData.installedTopologyVerified,false);
 assert.ok(m.taxonomy.filter(n=>n.level===6).length>=18);
 const sim=createMachineSimulation('BMJ-MCH-0004',m.root,m);
 const state=sim.start();
 assert.equal(state.blocked,true);
 assert.equal(state.available,false);
 sim.dispose();m.dispose();
});
