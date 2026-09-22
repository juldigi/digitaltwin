import test from 'node:test';import assert from 'node:assert/strict';
import {normalizeMachineKey,isDedicatedMachineKey,createMachineTemplate,createMachineSimulation} from '../frontend/src/machine-runtime.js';
import {UniversalMachineTemplate,UniversalProcessSimulation,universalMachineConfig,universalTaxonomy,universalTechnicalSources} from '../frontend/src/universal-machine.js';
import {ReferenceMachineTemplate,ReferenceProcessSimulation,isReferenceMachineKey,REFERENCE_MACHINE_IDS} from '../frontend/src/reference-machines.js';
import {MACHINE_REGISTRY} from '../frontend/src/data/machine-registry.js';

const blockedReferenceIds=new Set(['BMJ-MCH-0004']);

test('legacy BMJ IDs normalize to the same dedicated routes used by machine cards',()=>{
 assert.equal(normalizeMachineKey('BMJ-MCH-0002'),'sheeting');
 assert.equal(normalizeMachineKey('BMJ-MCH-0003'),'offset5');
 assert.equal(normalizeMachineKey('BMJ-MCH-0009'),'offset10');
 assert.equal(normalizeMachineKey('BMJ-MCH-0010'),'apm2');
 for(const id of ['BMJ-MCH-0002','BMJ-MCH-0003','BMJ-MCH-0009','BMJ-MCH-0010'])assert.equal(isDedicatedMachineKey(id),true,id);
});

test('exact and strong dedicated assets never fall through to UniversalMachineTemplate',()=>{
 for(const key of ['BMJ-MCH-0006','BMJ-MCH-0007','BMJ-MCH-0008','BMJ-MCH-0011','BMJ-MCH-0012','BMJ-MCH-0013','BMJ-MCH-0014','BMJ-MCH-0015','BMJ-MCH-0016','BMJ-MCH-0018','BMJ-MCH-0019','BMJ-MCH-0020','BMJ-MCH-0022','BMJ-MCH-0024']){
  const template=createMachineTemplate(key);
  assert.notEqual(template.constructor,UniversalMachineTemplate,key+' fell through to plain universal geometry');
  const sim=createMachineSimulation(key,template.root,template);
  assert.notEqual(sim.constructor,UniversalProcessSimulation,key+' fell through to blocked universal simulation');
  sim.dispose();template.dispose();
 }
});

test('all reference assets use evidence-grounded geometry and simulation availability follows the evidence boundary',()=>{
 assert.equal(REFERENCE_MACHINE_IDS.length,21);
 for(const key of REFERENCE_MACHINE_IDS){
  assert.equal(isReferenceMachineKey(key),true,key);
  const template=createMachineTemplate(key),sim=createMachineSimulation(key,template.root,template);
  assert.ok(template instanceof ReferenceMachineTemplate,key);
  assert.ok(sim instanceof ReferenceProcessSimulation,key);
  const blocked=blockedReferenceIds.has(key);
  assert.equal(sim.state().blocked,blocked,key);
  assert.equal(sim.state().available,!blocked,key);
  assert.equal(universalMachineConfig(key).evidence.simulation,blocked?'BLOCKED':'FAMILY_PROCESS_MODEL',key);
  assert.notEqual(universalMachineConfig(key).evidence.geometry,'PLACEHOLDER',key);
  sim.dispose();template.dispose();
 }
});

test('every non-legacy dedicated BMJ runtime is synchronized with UI evidence taxonomy and source routing',()=>{
 const ids=['BMJ-MCH-0001','BMJ-MCH-0005','BMJ-MCH-0006','BMJ-MCH-0007','BMJ-MCH-0008','BMJ-MCH-0011','BMJ-MCH-0012','BMJ-MCH-0013','BMJ-MCH-0014','BMJ-MCH-0015','BMJ-MCH-0016','BMJ-MCH-0018','BMJ-MCH-0019','BMJ-MCH-0020','BMJ-MCH-0022','BMJ-MCH-0024'];
 for(const id of ids){
  const cfg=universalMachineConfig(id),template=createMachineTemplate(id);
  assert.ok(cfg,id);assert.equal(cfg.evidence.simulation,'VERIFIED_PROCESS_MODEL',id+' UI evidence is not simulation-enabled');
  const uiTax=universalTaxonomy(id),runtimeTax=template.taxonomy||[];
  assert.ok(uiTax.length>0,id+' UI taxonomy empty');assert.deepEqual(uiTax.map(n=>n.id),runtimeTax.map(n=>n.id),id+' taxonomy routing diverged');
  const uiSources=universalTechnicalSources(id),runtimeSources=template.root.userData?.sources||[];
  assert.ok(uiSources.length>0,id+' UI sources empty');
  if(runtimeSources.length)assert.deepEqual(uiSources.map(s=>s.id),runtimeSources.map(s=>s.id),id+' source routing diverged');
  template.dispose();
 }
});

test('V120 registry invariant: all 41 BMJ assets avoid plain universal geometry and blocked universal simulation',()=>{
 assert.equal(MACHINE_REGISTRY.length,41);
 for(const machine of MACHINE_REGISTRY){
  const template=createMachineTemplate(machine.machineId),sim=createMachineSimulation(machine.machineId,template.root,template);
  assert.notEqual(template.constructor,UniversalMachineTemplate,machine.machineId+' still renders plain universal geometry');
  assert.notEqual(sim.constructor,UniversalProcessSimulation,machine.machineId+' still uses blocked universal simulation');
  sim.dispose();template.dispose();
 }
});

test('V120 reference assets expose UI taxonomy and technical-source evidence',()=>{
 for(const id of REFERENCE_MACHINE_IDS){
  const tax=universalTaxonomy(id),sources=universalTechnicalSources(id);
  assert.ok(tax.length>0,id);assert.ok(sources.length>0,id);
  assert.deepEqual([...new Set(tax.map(n=>n.level))].sort(),[1,2,3,4,5,6],id);
 }
});

test('V132 AHU twins expose indoor/outdoor duct interfaces and separate supply return airflow simulation',()=>{
 const ids=['BMJ-MCH-0036','BMJ-MCH-0037','BMJ-MCH-0038','BMJ-MCH-0039','BMJ-MCH-0040','BMJ-MCH-0041'];
 for(const id of ids){
  const template=createMachineTemplate(id),roles=new Set(),nodes=new Set();
  template.root.traverse(o=>{if(o.userData?.mechanismRole)roles.add(o.userData.mechanismRole);if(o.userData?.nodeId)nodes.add(o.userData.nodeId);});
  assert.equal(template.root.userData.plantDuctRouteVerified,false,id);
  assert.ok(nodes.has(id==='BMJ-MCH-0040'?'sansin-air-distribution':'ahu-air-distribution'),id);
  assert.ok(nodes.has(id==='BMJ-MCH-0040'?'sansin-supply-duct':'ahu-supply-duct'),id);
  assert.ok(nodes.has(id==='BMJ-MCH-0040'?'sansin-return-duct':'ahu-return-duct'),id);
  assert.ok(roles.has(id==='BMJ-MCH-0040'?'sansin-supply-duct-trunk-reference':'ahu-supply-duct-trunk-reference'),id);
  const taxonomy=universalTaxonomy(id);assert.ok(taxonomy.some(n=>/Duct|Air Distribution/i.test(n.name)&&n.level===2),id+' duct taxonomy missing');
  const sim=createMachineSimulation(id,template.root,template),started=sim.start();
  assert.ok(started.airflowParticleCount>=28,id);
  assert.equal(started.supplyAirflowParticleCount,18,id);
  assert.equal(started.returnAirflowParticleCount,10,id);
  if(id==='BMJ-MCH-0040'){
   assert.equal(started.outdoorAirflowParticleCount,8,id);
   const indoor=template.findNode('universal-module-4'),outdoor=template.findNode('universal-module-5');
   assert.ok(outdoor.position.z-indoor.position.z>1.5,'SANSIN indoor/outdoor envelopes are not visibly separated');
   const oldBase=template.findNode('universal-base');assert.ok(oldBase.children.filter(c=>c.isMesh).every(m=>m.visible===false),'legacy continuous SANSIN base should be hidden');
  }else assert.equal(started.outdoorAirflowParticleCount,0,id);
  sim.update(0);sim.update(120);const state=sim.state();
  assert.equal(state.supplyAirActive,true,id);assert.equal(state.returnAirReferenceActive,true,id);
  assert.equal(state.plantDuctRouteVerified,false,id);
  sim.dispose();template.dispose();
 }
});

test('V132 keeps generic AHU evidence vendor-neutral and SANSIN evidence brand-specific',()=>{
 for(const id of ['BMJ-MCH-0036','BMJ-MCH-0037','BMJ-MCH-0038','BMJ-MCH-0039','BMJ-MCH-0041']){
  const urls=universalTechnicalSources(id).map(s=>s.url).join(' ');
  assert.doesNotMatch(urls,/sansin|nesacsentral|made-in-china/i,id);
 }
 const urls=universalTechnicalSources('BMJ-MCH-0040').map(s=>s.url).join(' ');
 assert.match(urls,/nesacsentral/i);
});

test('V132 generic AHUs never invent an outdoor condenser while SANSIN keeps the family outdoor heat-rejection package',()=>{
 for(const id of ['BMJ-MCH-0036','BMJ-MCH-0037','BMJ-MCH-0038','BMJ-MCH-0039','BMJ-MCH-0041']){
  const template=createMachineTemplate(id),roles=new Set();template.root.traverse(o=>{if(o.userData?.mechanismRole)roles.add(o.userData.mechanismRole);});
  assert.equal(template.root.userData.outdoorCondensingUnitAssumed,false,id);
  assert.ok(roles.has('ahu-weather-hood-boundary'),id);
  assert.ok(!roles.has('sansin-refrigeration-compressor-reference'),id);
  template.dispose();
 }
 const sansin=createMachineTemplate('BMJ-MCH-0040'),roles=new Set();sansin.root.traverse(o=>{if(o.userData?.mechanismRole)roles.add(o.userData.mechanismRole);});
 assert.ok(roles.has('sansin-refrigeration-compressor-reference'));
 assert.ok(roles.has('sansin-outdoor-condenser-fan-reference'));
 assert.ok(roles.has('sansin-refrigerant-interconnect-reference'));
 assert.ok(roles.has('sansin-outdoor-fan-guard-reference'));
 sansin.dispose();
});

test('V133 compressor twins expose detailed package flow and distribution piping references',()=>{
 const ids=['BMJ-MCH-0029','BMJ-MCH-0030','BMJ-MCH-0031','BMJ-MCH-0032','BMJ-MCH-0033','BMJ-MCH-0034','BMJ-MCH-0035'];
 for(const id of ids){
  const template=createMachineTemplate(id),roles=new Set(),nodes=new Set();
  template.root.traverse(o=>{if(o.userData?.mechanismRole)roles.add(o.userData.mechanismRole);if(o.userData?.nodeId)nodes.add(o.userData.nodeId);});
  assert.equal(template.root.userData.plantCompressedAirRouteVerified,false,id);
  assert.equal(template.root.userData.airReceiverInstalledVerified,false,id);
  assert.equal(template.root.userData.airDryerInstalledVerified,false,id);
  assert.equal(template.root.userData.ringMainInstalledVerified,false,id);
  for(const node of ['compressor-air-distribution','compressor-discharge-piping','compressor-air-receiver-boundary','compressor-air-treatment-boundary','compressor-ring-main-reference'])assert.ok(nodes.has(node),id+' missing '+node);
  for(const role of ['compressor-service-door-reference','compressor-cooling-air-inlet-louvre-reference','compressor-cooling-air-exhaust-grille-reference','compressor-flexible-discharge-connector-reference','compressor-discharge-check-valve-reference','compressor-discharge-isolation-valve-reference','compressed-air-receiver-reference','compressed-air-dryer-option-boundary','compressed-air-ring-main-reference','compressed-air-service-drop-reference','compressed-air-drip-leg-reference'])assert.ok(roles.has(role),id+' missing '+role);
  assert.equal(template.root.userData.unifiedCompressorCabinet,true,id);
  assert.equal(template.root.userData.distributionDesignReference.ringMainPreferred,true,id);
  assert.equal(template.root.userData.distributionDesignReference.installedPressureDropMeasured,false,id);
  const taxonomy=universalTaxonomy(id);assert.ok(taxonomy.some(n=>n.level===2&&n.name==='Compressed-Air Discharge / Distribution'),id+' missing distribution taxonomy');
  const sim=createMachineSimulation(id,template.root,template),started=sim.start();
  assert.equal(started.compressedAirParticleCount,26,id);
  assert.equal(started.distributionAirParticleCount,18,id);
  assert.equal(started.oilFlowParticleCount,10,id);
  assert.equal(started.condensateParticleCount,6,id);
  assert.equal(started.airflowParticleCount,44,id);
  sim.update(0);sim.update(120);const state=sim.state();
  assert.equal(state.compressorIntakeActive,true,id);
  assert.equal(state.compressorCompressionActive,true,id);
  assert.equal(state.compressorSeparationActive,true,id);
  assert.equal(state.compressorAftercoolingActive,true,id);
  assert.equal(state.compressorOilCircuitActive,true,id);
  assert.equal(state.compressorCondensateDrainActive,true,id);
  assert.equal(state.compressorDistributionActive,true,id);
  assert.ok(state.compressorPressureNormalizedPct>=85&&state.compressorPressureNormalizedPct<=95,id);
  assert.equal(state.plantCompressedAirRouteVerified,false,id);
  sim.dispose();template.dispose();
 }
});


test('V134 compressor airflow exposes twin-screw internals swan-neck drops pressure gradient and condensate treatment',()=>{
 const ids=['BMJ-MCH-0029','BMJ-MCH-0031','BMJ-MCH-0033'];
 for(const id of ids){
  const template=createMachineTemplate(id),roles=new Set();
  template.root.traverse(o=>{if(o.userData?.mechanismRole)roles.add(o.userData.mechanismRole);});
  const prefix=id==='BMJ-MCH-0029'?'atlas':id==='BMJ-MCH-0031'?'kaeser':'swan';
  assert.ok(roles.has(prefix+'-male-screw-rotor-reference'),id);
  assert.ok(roles.has(prefix+'-female-screw-rotor-reference'),id);
  assert.ok(roles.has(prefix+'-oil-injection-nozzle-reference'),id);
  assert.ok(roles.has('compressed-air-swan-neck-rise-reference'),id);
  assert.ok(roles.has('compressed-air-swan-neck-top-takeoff-reference'),id);
  assert.ok(roles.has('compressor-condensate-collection-manifold-reference'),id);
  assert.ok(roles.has('compressor-oil-water-separator-option-boundary'),id);
  assert.equal(template.root.userData.distributionDesignReference.serviceTakeoffCondensatePractice,'SWAN_NECK_TOP_TAKEOFF_WHERE_CONDENSATION_RISK_EXISTS',id);
  const sim=createMachineSimulation(id,template.root,template),started=sim.start();
  assert.equal(started.pathVisible,true,id);
  sim.update(0);sim.update(120);
  const st=sim.state(),p=st.compressorPressureProfile;
  assert.ok(p.package>p.receiver&&p.receiver>p.afterTreatment&&p.afterTreatment>p.ringNear&&p.ringNear>p.ringFar,id);
  assert.ok(p.service[0]>p.service[1]&&p.service[1]>p.service[2],id);
  sim.setPathVisible(false);assert.equal(sim.state().pathVisible,false,id);
  assert.equal(template.findNode('compressor-air-distribution').visible,false,id);
  sim.setPathVisible(true);assert.equal(template.findNode('compressor-air-distribution').visible,true,id);
  sim.dispose();template.dispose();
 }
});

test('V134 compressor taxonomy reaches detailed rotor and condensate-treatment nodes',()=>{
 for(const id of ['BMJ-MCH-0029','BMJ-MCH-0031','BMJ-MCH-0033']){
  const tax=universalTaxonomy(id);
  assert.ok(tax.some(n=>n.level===3&&/Twin Screw Rotor/.test(n.name)),id);
  assert.ok(tax.some(n=>n.level===3&&/Condensate Collection/.test(n.name)),id);
  assert.ok(tax.some(n=>n.level===6&&/Twin Screw Rotor/.test(n.name)),id);
  assert.ok(tax.some(n=>n.level===6&&/Oil-Water Separation/.test(n.name)),id);
 }
});

test('V133 compressor brand details remain evidence-bounded and source-specific',()=>{
 const atlas=createMachineTemplate('BMJ-MCH-0029'),aroles=new Set();atlas.root.traverse(o=>{if(o.userData?.mechanismRole)aroles.add(o.userData.mechanismRole);});
 assert.ok(aroles.has('atlas-airend-non-return-valve-reference'));assert.ok(aroles.has('atlas-separator-scavenge-line-reference'));assert.ok(aroles.has('atlas-oil-stop-valve-reference'));
 atlas.dispose();
 const kaeser=createMachineTemplate('BMJ-MCH-0031'),kroles=new Set();kaeser.root.traverse(o=>{if(o.userData?.mechanismRole)kroles.add(o.userData.mechanismRole);});
 assert.ok(kroles.has('kaeser-etm-temperature-management-reference'));assert.ok(kroles.has('kaeser-eco-drain-reference'));assert.ok(kroles.has('kaeser-package-air-outlet-reference'));
 kaeser.dispose();
 const swan=createMachineTemplate('BMJ-MCH-0033'),sroles=new Set();swan.root.traverse(o=>{if(o.userData?.mechanismRole)sroles.add(o.userData.mechanismRole);});
 assert.ok(sroles.has('swan-cyclonic-preseparator-family-reference'));assert.ok(sroles.has('swan-separator-element-family-reference'));assert.ok(sroles.has('swan-package-air-outlet-reference'));
 swan.dispose();
 const atlasUrls=universalTechnicalSources('BMJ-MCH-0029').map(s=>s.url).join(' ');
 const kaeserUrls=universalTechnicalSources('BMJ-MCH-0031').map(s=>s.url).join(' ');
 const swanUrls=universalTechnicalSources('BMJ-MCH-0033').map(s=>s.url).join(' ');
 assert.match(atlasUrls,/atlascopco\.com/);assert.match(atlasUrls,/compressed-air-distribution/);
 assert.match(kaeserUrls,/kaeser\.com/);assert.match(kaeserUrls,/37776/);
 assert.match(swanUrls,/swan-aircompressor\.com/);
});


test('V136 remaining reference twins use process-faithful motion boundaries instead of generic travel',()=>{
 // Suprasetter external drum: no generic workpiece, clamp/expose only in the imaging window.
 for(const id of ['BMJ-MCH-0025','BMJ-MCH-0026']){
  const t=createMachineTemplate(id),sim=createMachineSimulation(id,t.root,t);
  assert.equal(t.root.userData.researchVersion,'V138',id);
  assert.ok(t.root.userData.uniqueResearchUrls>200,id+' research ledger did not exceed 200 unique URLs');
  assert.equal(sim.processPiece,null,id+' must not use generic linear workpiece');
  sim.start();sim.elapsed=sim.cycle*.50;sim.updateCTP();const st=sim.state();
  assert.equal(st.ctpPlateClamped,true,id);assert.equal(st.ctpExposureActive,true,id);assert.equal(st.ctpLaserTraverseActive,true,id);
  assert.equal(st.ctpPunchInstalledVerified,false,id);
  assert.equal(st.simulationBoundary,'SUPRASETTER_EXTERNAL_DRUM_LOAD_CLAMP_IMAGE_UNLOAD__MODEL_OPTIONS_NOT_INFERRED',id);
  sim.dispose();t.dispose();
 }
 // Collator: only staggered active bins feed at once and sensing/gathering follows feed.
 {
  const id='BMJ-MCH-0023',t=createMachineTemplate(id),sim=createMachineSimulation(id,t.root,t);sim.start();sim.elapsed=sim.cycle*.24;sim.updateCollator();const st=sim.state();
  assert.ok(st.activeFeedBinIndexes.length>0,id);assert.ok(st.activeFeedBinIndexes.length<st.modeledBinCount,id);
  assert.equal(st.doubleFeedCheckActive,true,id);assert.equal(st.gatherTransportActive,true,id);
  sim.dispose();t.dispose();
 }
 // SCREEN CTF: capstan and tension regulation run in transport/exposure window; punch remains option-bounded.
 {
  const id='BMJ-MCH-0027',t=createMachineTemplate(id),sim=createMachineSimulation(id,t.root,t);sim.start();sim.elapsed=sim.cycle*.45;sim.updateImagesetter();const st=sim.state();
  assert.equal(st.capstanAdvanceActive,true,id);assert.equal(st.tensionRegulationActive,true,id);assert.equal(st.exposureActive,true,id);
  assert.equal(st.punchInstalledVerified,false,id);assert.equal(st.processorInstalledVerified,false,id);
  sim.dispose();t.dispose();
 }
 // Zünd: deterministic XY path is allowed, but no cutting action without installed tool evidence.
 {
  const id='BMJ-MCH-0028',t=createMachineTemplate(id),sim=createMachineSimulation(id,t.root,t);sim.start();sim.elapsed=sim.cycle*.50;sim.updateZund();const st=sim.state();
  assert.equal(st.zundAxisPathType,'SERPENTINE_REFERENCE_ONLY',id);assert.equal(st.zundAxisMotionActive,true,id);
  assert.equal(st.installedToolPackageVerified,false,id);assert.equal(st.zundToolActionActive,false,id);
  sim.dispose();t.dispose();
 }
});

test('V136 blanker and folder-gluer process phases preserve mechanical interlocks and real process order',()=>{
 {
  const id='BMJ-MCH-0021',t=createMachineTemplate(id),sim=createMachineSimulation(id,t.root,t);sim.start();
  for(const fraction of [.08,.22,.40,.52,.64,.78,.92]){sim.elapsed=sim.cycle*fraction;sim.updateBlanker();const st=sim.state();assert.equal(st.mechanicalInterlockSafe,true,id+' at '+fraction);assert.equal(st.platformIndexing&&st.blankingHeadPressing,false,id+' simultaneous indexing/press');}
  sim.elapsed=sim.cycle*.64;sim.updateBlanker();let st=sim.state();assert.equal(st.blankerPlatformAtPress,true);assert.equal(st.blankerHydraulicPressureActive,true);
  sim.elapsed=sim.cycle*.78;sim.updateBlanker();st=sim.state();assert.equal(st.blankerSeparationActive,true);
  sim.dispose();t.dispose();
 }
 {
  const id='BMJ-MCH-0017',t=createMachineTemplate(id),sim=createMachineSimulation(id,t.root,t);sim.start();
  sim.elapsed=sim.cycle*.20;sim.updateFolder();let st=sim.state();assert.equal(st.alignmentActive,true);assert.equal(st.preBreakActive,true);assert.equal(st.glueZoneActive,false);
  sim.elapsed=sim.cycle*.52;sim.updateFolder();st=sim.state();assert.equal(st.glueZoneActive,true);assert.equal(st.finalFoldActive,false);
  sim.elapsed=sim.cycle*.68;sim.updateFolder();st=sim.state();assert.equal(st.finalFoldActive,true);
  sim.elapsed=sim.cycle*.82;sim.updateFolder();st=sim.state();assert.equal(st.compressionActive,true);
  sim.elapsed=sim.cycle*.95;sim.updateFolder();st=sim.state();assert.equal(st.folderDeliveryActive,true);
  sim.dispose();t.dispose();
 }
});

test('V136 generic-looking facade details are replaced with family-grounded service morphology',()=>{
 const cases=[
  ['BMJ-MCH-0021',['qf100-lower-cabinet']],
  ['BMJ-MCH-0023',['collator-tower-detail']],
  ['BMJ-MCH-0025',['ctp-family-facade']],
  ['BMJ-MCH-0027',['ctf-family-facade']],
  ['BMJ-MCH-0028',['zund-table-edge-detail']]
 ];
 for(const [id,nodes] of cases){const t=createMachineTemplate(id);for(const node of nodes)assert.ok(t.findNode(node),id+' missing '+node);t.dispose();}
});

test('V136 YA1A1A remains blocked rather than inventing an unverified gravure transport simulation',()=>{
 const id='BMJ-MCH-0004',t=createMachineTemplate(id),sim=createMachineSimulation(id,t.root,t),st=sim.start();
 assert.equal(st.blocked,true);assert.equal(st.active,false);assert.match(st.blockedReason,/YA1A1A|gravure|transport|drive/i);
 sim.dispose();t.dispose();
});


test('V137 service-component contact mechanics are present on the least-specific reference twins',()=>{
 const rolesFor=id=>{const t=createMachineTemplate(id),roles=new Set();t.root.traverse(o=>{if(o.userData?.mechanismRole)roles.add(o.userData.mechanismRole);});return {t,roles};};
 {
  const {t,roles}=rolesFor('BMJ-MCH-0017');
  for(const role of ['primary-fold-belt-tensioner-reference','folder-gluer-bearing-block-reference','compression-pressure-roller-reference','box-stream-photoeye-reference'])assert.ok(roles.has(role),role);
  assert.equal(t.root.userData.researchVersion,'V138');assert.ok(t.root.userData.uniqueResearchUrls>205);t.dispose();
 }
 {
  const {t,roles}=rolesFor('BMJ-MCH-0023');
  for(const role of ['suction-rotor-vacuum-port-reference','double-feed-stop-pad-reference','double-feed-ir-emitter-reference','double-feed-ir-receiver-reference'])assert.ok(roles.has(role),role);
  t.dispose();
 }
 {
  const {t,roles}=rolesFor('BMJ-MCH-0025');
  for(const role of ['imaging-drum-encoder-reference','plate-clamp-actuator-reference','laser-linear-bearing-block-reference'])assert.ok(roles.has(role),role);
  t.dispose();
 }
 {
  const {t,roles}=rolesFor('BMJ-MCH-0027');
  for(const role of ['capstan-bearing-housing-reference','capstan-nip-pressure-arm-reference','gravity-tension-position-sensor-reference','polygon-scanner-bearing-reference'])assert.ok(roles.has(role),role);
  t.dispose();
 }
 {
  const {t,roles}=rolesFor('BMJ-MCH-0028');
  for(const role of ['gantry-servo-motor-reference','gantry-rack-pinion-reference','module-tool-detection-sensor-reference','module-z-pressure-position-actuator-reference'])assert.ok(roles.has(role),role);
  t.dispose();
 }
});

test('V137 collator sheet contact follows air-float suction pickup sensing and gather phases',()=>{
 const id='BMJ-MCH-0023',t=createMachineTemplate(id),sim=createMachineSimulation(id,t.root,t);sim.start();sim.elapsed=sim.cycle*.18;sim.updateCollator();let st=sim.state();
 assert.equal(st.airSeparationActive,true);assert.equal(st.rotorPickupActive,true);assert.equal(st.doubleFeedCheckActive,true);
 assert.ok(sim.collatorSheets.some(x=>Math.abs(x.mesh.rotation.z)>0),'sheet should tilt during suction pickup');
 sim.elapsed=sim.cycle*.52;sim.updateCollator();st=sim.state();assert.equal(st.gatherTransportActive,true);
 sim.dispose();t.dispose();
});

test('V137 Suprasetter laser beam appears only during drum-clamped exposure',()=>{
 const id='BMJ-MCH-0025',t=createMachineTemplate(id),sim=createMachineSimulation(id,t.root,t);sim.start();
 sim.elapsed=sim.cycle*.18;sim.updateCTP();let st=sim.state();assert.equal(st.ctpLaserBeamVisible,false);assert.notEqual(st.ctpMaterialContact,'DRUM_SURFACE');
 sim.elapsed=sim.cycle*.50;sim.updateCTP();st=sim.state();assert.equal(st.ctpPlateClamped,true);assert.equal(st.ctpLaserBeamVisible,true);assert.equal(st.ctpMaterialContact,'DRUM_SURFACE');
 sim.elapsed=sim.cycle*.90;sim.updateCTP();st=sim.state();assert.equal(st.ctpLaserBeamVisible,false);assert.equal(st.ctpMaterialContact,'OUTPUT_GUIDE');
 sim.dispose();t.dispose();
});

test('V137 SCREEN and Zund simulations expose physical contact state without inventing optional tool actions',()=>{
 {
  const id='BMJ-MCH-0027',t=createMachineTemplate(id),sim=createMachineSimulation(id,t.root,t);sim.start();sim.elapsed=sim.cycle*.50;sim.updateImagesetter();const st=sim.state();
  assert.equal(st.imagesetterMediaContactStage,'CAPSTAN_NIP_AND_EXPOSURE');assert.equal(st.capstanAdvanceActive,true);assert.equal(st.tensionRegulationActive,true);
  sim.dispose();t.dispose();
 }
 {
  const id='BMJ-MCH-0028',t=createMachineTemplate(id),sim=createMachineSimulation(id,t.root,t);sim.start();sim.elapsed=sim.cycle*.50;sim.updateZund();const st=sim.state();
  assert.equal(st.zundVacuumContactActive,true);assert.equal(st.zundToolClearanceMaintained,true);assert.equal(st.zundToolActionActive,false);
  assert.ok(sim.zundMaterial.position.y<.69,'vacuum should pull material to bed reference');
  sim.dispose();t.dispose();
 }
});

test('V137 FGM2 blank enters skewed then aligns while remaining in belt contact through process zones',()=>{
 const id='BMJ-MCH-0017',t=createMachineTemplate(id),sim=createMachineSimulation(id,t.root,t);sim.start();
 sim.elapsed=sim.cycle*.05;sim.updateFolder();let st=sim.state();assert.equal(st.folderBeltContactActive,true);assert.ok(Math.abs(sim.folderBlank.position.z)>0);
 sim.elapsed=sim.cycle*.25;sim.updateFolder();st=sim.state();assert.equal(st.alignmentActive,true);assert.ok(Math.abs(sim.folderBlank.position.z)<.075);
 sim.elapsed=sim.cycle*.52;sim.updateFolder();st=sim.state();assert.equal(st.glueZoneActive,true);assert.equal(st.folderMaterialContactZone,3);
 sim.dispose();t.dispose();
});


test('V138 selective drive and control chains match physical process phases',()=>{
 {
  const id='BMJ-MCH-0021',t=createMachineTemplate(id),sim=createMachineSimulation(id,t.root,t);sim.start();
  sim.elapsed=sim.cycle*.22;sim.updateBlanker();let st=sim.state();
  assert.equal(st.blankerXServoActive,true);assert.equal(st.blankerYServoActive,false);assert.equal(st.blankerHydraulicPumpActive,false);assert.equal(st.blankerPositionFeedbackActive,true);
  sim.elapsed=sim.cycle*.40;sim.updateBlanker();st=sim.state();
  assert.equal(st.blankerXServoActive,false);assert.equal(st.blankerYServoActive,true);assert.equal(st.blankerHydraulicValvePressActive,false);
  sim.elapsed=sim.cycle*.64;sim.updateBlanker();st=sim.state();
  assert.equal(st.blankerXServoActive,false);assert.equal(st.blankerYServoActive,false);assert.equal(st.blankerHydraulicPumpActive,true);assert.equal(st.blankerHydraulicValvePressActive,true);assert.equal(st.blankingHeadPressing,true);
  sim.elapsed=sim.cycle*.78;sim.updateBlanker();st=sim.state();
  assert.equal(st.blankerHydraulicValvePressActive,false);assert.equal(st.blankerHydraulicValveReturnActive,true);assert.equal(st.blankerSeparationActive,true);
  sim.dispose();t.dispose();
 }
 {
  const id='BMJ-MCH-0017',t=createMachineTemplate(id),sim=createMachineSimulation(id,t.root,t);sim.start();
  sim.elapsed=sim.cycle*.10;sim.updateFolder();let st=sim.state();assert.equal(st.folderFeederDriveActive,true);assert.equal(st.folderFoldDriveActive,false);
  sim.elapsed=sim.cycle*.38;sim.updateFolder();st=sim.state();assert.equal(st.folderFeederDriveActive,false);assert.equal(st.folderFoldDriveActive,true);assert.equal(st.folderCompressionDriveActive,false);
  sim.elapsed=sim.cycle*.83;sim.updateFolder();st=sim.state();assert.equal(st.folderFoldDriveActive,false);assert.equal(st.folderCompressionDriveActive,true);assert.equal(st.folderDeliveryDriveActive,false);
  sim.elapsed=sim.cycle*.95;sim.updateFolder();st=sim.state();assert.equal(st.folderDeliveryDriveActive,true);assert.equal(st.folderCompressionDriveActive,false);
  sim.dispose();t.dispose();
 }
 {
  const id='BMJ-MCH-0023',t=createMachineTemplate(id),sim=createMachineSimulation(id,t.root,t);sim.start();sim.elapsed=sim.cycle*.18;sim.updateCollator();const st=sim.state();
  assert.equal(st.collatorSuctionBlowerActive,true);assert.equal(st.collatorSeparationAirControlActive,true);assert.equal(st.airSeparationActive,true);assert.equal(st.rotorPickupActive,true);
  sim.dispose();t.dispose();
 }
 {
  const id='BMJ-MCH-0028',t=createMachineTemplate(id),sim=createMachineSimulation(id,t.root,t);sim.start();sim.elapsed=sim.cycle*.50;sim.updateZund();const st=sim.state();
  assert.equal(st.zundVacuumMode,'HOLD');assert.equal(st.zundVacuumControlActive,true);assert.equal(st.zundVacuumContactActive,true);assert.equal(st.zundToolActionActive,false);
  sim.dispose();t.dispose();
 }
});

test('V138 service-transmission morphology is exposed through six-level taxonomy',()=>{
 const cases=[
  ['BMJ-MCH-0021',['qf100-x-transmission-service','qf100-y-transmission-service'],['Servo Transmission Support','Hydraulic Pressure / Valve Control']],
  ['BMJ-MCH-0017',[],['Section Drive','Compression Section Drive','Delivery Independent Drive']],
  ['BMJ-MCH-0023',[],['Separation-Air Adjustment','Suction Air Control']],
  ['BMJ-MCH-0028',[],['Gantry Drive Service Chain','Module Z Pressure / Position Actuation','Vacuum Hold-Down Control Chain']]
 ];
 for(const [id,nodes,terms] of cases){
  const t=createMachineTemplate(id);for(const n of nodes)assert.ok(t.findNode(n),id+' missing '+n);
  const names=universalTaxonomy(id).map(x=>x.name).join(' | ').toLowerCase();
  for(const term of terms)assert.ok(names.includes(term.toLowerCase()),id+' missing taxonomy '+term);
  t.dispose();
 }
});

test('V138 QF close-family component brands remain reference metadata and not BMJ installed claims',()=>{
 const id='BMJ-MCH-0021',t=createMachineTemplate(id),meta=t.root.userData.qf1080PublishedComponentReference;
 assert.equal(meta.installedOnBmjVerified,false);
 assert.match(meta.plcHmi,/Delta/);assert.match(meta.leadscrew,/TBI/);assert.match(meta.hydraulicStation,/Oiltec/);assert.match(meta.hydraulicCylinder,/SMC/);
 t.dispose();
});
