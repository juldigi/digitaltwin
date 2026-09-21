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

test('V123 Atlas compressor reference follows GA/G oil-injected family flow without claiming exact model',()=>{
 const m=createMachineTemplate('BMJ-MCH-0029');
 requireRoles(m,['atlas-intake-filter','atlas-oil-injected-screw-airend','atlas-oil-air-separator-vessel','atlas-oil-separator-element','atlas-minimum-pressure-valve','atlas-oil-filter','atlas-compressed-air-aftercooler','atlas-oil-cooler','atlas-moisture-separator-reference','atlas-electronic-condensate-drain-reference','atlas-elektronikon-controller-reference']);
 assert.equal(m.root.userData.exactCompressorModelVerified,false);
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
 assert.equal(m.findNode('universal-module-3').position.x,m.findNode('universal-module-4').position.x);
 assert.equal(m.findNode('universal-module-4').position.x,m.findNode('universal-module-5').position.x);
 assert.equal(m.root.userData.printingNip.relation,'GRAVURE_CYLINDER_TO_IMPRESSION_CYLINDER');
 assert.ok(m.taxonomy.filter(n=>n.level===6).length>=18);
 for(let i=1;i<=8;i++)for(const child of m.findNode('universal-module-'+i+'-active').children.filter(o=>o.isMesh&&o.userData.referencePlaceholder))assert.equal(child.visible,false);
 const sim=createMachineSimulation('BMJ-MCH-0004',m.root,m);
 const state=sim.start();
 assert.equal(state.blocked,true);
 assert.equal(state.available,false);
 sim.dispose();m.dispose();
});


test('V123 R3 QF-100CS ABM-2 uses one bounded family working bay with XY-safe hydraulic blanking logic',()=>{
 const m=createMachineTemplate('BMJ-MCH-0021');
 assert.equal(m.root.userData.researchVersion,'V123');
 assert.equal(m.root.userData.detailPass,'V123_R3_QF100CS_BOUNDED_FAMILY_RECONSTRUCTION');
 assert.equal(m.root.userData.exactModelPublicDocumentationFound,false);
 assert.equal(m.root.userData.installedBlankingHeadCountVerified,false);
 assert.equal(m.root.userData.installedCollectorStackerVerified,false);
 assert.equal(m.root.userData.simulationBinding.type,'XY_PLATFORM_FIXED_HYDRAULIC_HEAD');
 requireRoles(m,[
  'x-axis-ball-screw','x-axis-linear-guide','x-axis-servo-motor',
  'y-axis-ball-screw','y-axis-linear-guide','y-axis-servo-motor',
  'photoelectric-position-sensor','main-hydraulic-cylinder-reference',
  'hydraulic-ram-reference','blanking-pressure-plate','ram-guide-post',
  'honeycomb-pin-board','honeycomb-hole-reference','blanking-tool-pin',
  'waste-frame-support-rail','product-receiving-tray',
  'collector-stacker-option-envelope','operator-touchscreen',
  'hydraulic-reservoir','hydraulic-pump','plc-servo-cabinet'
 ]);
 assert.equal(m.findNode('qf100-head-ram').userData.modeledReferenceHeadCount,1);
 assert.equal(m.findNode('qf100-head-ram').userData.installedHeadCountVerified,false);
 assert.equal(m.findNode('qf100-collector-option').userData.installedOptionVerified,false);
 assert.equal(m.findNode('qf100-separation-interface').userData.noInventedForkOrConveyor,true);
 const levels=[...new Set(m.taxonomy.map(n=>n.level))].sort();
 assert.deepEqual(levels,[1,2,3,4,5,6]);
 assert.ok(m.taxonomy.filter(n=>n.level===6).length>=19);

 const sim=createMachineSimulation('BMJ-MCH-0021',m.root,m);
 const first=sim.start();
 assert.equal(first.available,true);assert.equal(first.blocked,false);
 assert.equal(first.simulationBoundary,'QF_LQF_1080_FAMILY_PROCESS_ONLY');
 let now=0,sawIndex=false,sawPress=false;
 for(let i=0;i<220;i++){
  now+=100;sim.update(now);const s=sim.state();
  sawIndex ||= s.platformIndexing;sawPress ||= s.blankingHeadPressing;
  assert.equal(s.mechanicalInterlockSafe,true,'platform indexing and hydraulic pressing must never overlap');
  assert.equal(s.platformIndexing&&s.blankingHeadPressing,false);
 }
 assert.equal(sawIndex,true);assert.equal(sawPress,true);
 sim.dispose();m.dispose();
});


test('V123 R3 compressor brand-lineage isolation prevents Atlas evidence leaking into KAESER or SWAN twins',()=>{
 const cases=[
  ['BMJ-MCH-0029','ATLAS',['atlas-intake-filter','atlas-oil-injected-screw-airend','atlas-oil-separator-element','atlas-compressed-air-aftercooler','atlas-elektronikon-controller-reference'],['KAESER','SWAN']],
  ['BMJ-MCH-0031','KAESER',['kaeser-dry-intake-filter','kaeser-sigma-profile-airend','kaeser-cooling-fluid-separator-tank','kaeser-minimum-pressure-check-valve','kaeser-eco-drain-reference','kaeser-sigma-control-family-reference'],['ATLAS','SWAN']],
  ['BMJ-MCH-0033','SWAN',['swan-air-filter-assembly','swan-screw-airend','swan-oil-air-separation-package-reference','swan-built-in-oil-air-cooler','swan-smart-control-panel-reference'],['ATLAS','KAESER']]
 ];
 for(const [id,brand,required,forbidden] of cases){
  const m=createMachineTemplate(id),set=roles(m);
  for(const role of required)assert.ok(set.has(role),id+' missing '+role);
  const evidence=[];m.root.traverse(o=>{if(o.userData?.evidence)evidence.push(String(o.userData.evidence));});
  for(const bad of forbidden)for(const e of evidence)assert.doesNotMatch(e,new RegExp(bad,'i'),id+' contaminated evidence '+e);
  assert.match(m.root.userData.referenceBrandFamily,new RegExp(brand==='ATLAS'?'Atlas':brand,'i'));
  assert.equal(m.root.userData.exactCompressorModelVerified,false);
  if(brand==='KAESER'){
   assert.equal(m.root.userData.kaeserDriveType,'UNVERIFIED_BELT_OR_1_TO_1_DIRECT');
   assert.equal(m.root.userData.brandEvidenceBoundary.controllerGeneration,'UNVERIFIED');
  }
  if(brand==='SWAN'){
   assert.equal(m.root.userData.installedSwanSeriesVerified,false);
   const vfd=[];m.root.traverse(o=>{if(o.userData?.mechanismRole==='swan-vfd-controller-option-reference')vfd.push(o);});
   assert.equal(vfd.length,1);assert.equal(vfd[0].userData.installedOptionVerified,false);
  }
  m.dispose();
 }
});
