import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
 UTILITY_RUNTIME_CONTRACTS,
 createMachineTemplate,
 createPolishedMachineTemplate,
 createMachineSimulation,
 validateUtilityTemplate,
 validateUtilitySimulation
} from '../frontend/src/machine-runtime.js';

const compressors=['BMJ-MCH-0029','BMJ-MCH-0030','BMJ-MCH-0031','BMJ-MCH-0032','BMJ-MCH-0033','BMJ-MCH-0034','BMJ-MCH-0035'];
const ahus=['BMJ-MCH-0036','BMJ-MCH-0037','BMJ-MCH-0038','BMJ-MCH-0039','BMJ-MCH-0040','BMJ-MCH-0041'];

test('V325 all thirteen utility assets pass fail-closed runtime truth contracts',()=>{
 for(const id of [...compressors,...ahus]){
  const template=createPolishedMachineTemplate(id);
  try{
   const audit=validateUtilityTemplate(template,id);
   assert.equal(audit.valid,true,id);
   assert.deepEqual(audit.errors,[],id);
   assert.equal(template.root.userData.utilityRuntimeTruthLock,'PASS',id);
   const sim=createMachineSimulation(id,template.root,template);
   try{
    const simAudit=validateUtilitySimulation(sim,template,id);
    assert.equal(simAudit.valid,true,id);
    assert.equal(template.root.userData.utilitySimulationTruthLock,'PASS',id);
   }finally{sim.dispose();}
  }finally{template.dispose();}
 }
});

test('V325 compressor brand families stay isolated while plant receiver dryer and ring-main geometry remain functional references',()=>{
 for(const id of compressors){
  const template=createMachineTemplate(id),u=template.root.userData,c=UTILITY_RUNTIME_CONTRACTS[id];
  try{
   assert.equal(u.exactCompressorModelVerified,false,id);
   assert.equal(u.brandEvidenceBoundary.brand,c.brandEvidence,id);
   assert.equal(template.cfg.evidence.geometry,c.geometry,id);
   for(const field of ['plantCompressedAirRouteVerified','airReceiverInstalledVerified','airDryerInstalledVerified','lineFilterPackageInstalledVerified','ringMainInstalledVerified'])assert.equal(u[field],false,id+':'+field);
   assert.equal(template.findNode('compressor-air-receiver-boundary').userData.installedOptionVerified,false,id);
   assert.equal(template.findNode('compressor-air-treatment-boundary').userData.installedConfigurationVerified,false,id);
   assert.equal(template.findNode('compressor-ring-main-reference').userData.installedRouteVerified,false,id);
   assert.equal(template.findNode('compressor-condensate-treatment-boundary').userData.installedConfigurationVerified,false,id);
  }finally{template.dispose();}
 }
});

test('V325 compressor airflow keeps a monotonic normalized pressure-loss profile without claiming measured plant pressure',()=>{
 for(const id of ['BMJ-MCH-0029','BMJ-MCH-0031','BMJ-MCH-0033']){
  const template=createMachineTemplate(id),sim=createMachineSimulation(id,template.root,template);
  try{
   sim.start();sim.update(1000);sim.update(2200);const s=sim.state(),p=s.compressorPressureProfile;
   assert.equal(template.root.userData.pressureValuesAreNormalized,true,id);
   assert.ok(s.compressorIntakeActive&&s.compressorCompressionActive&&s.compressorSeparationActive&&s.compressorAftercoolingActive&&s.compressorOilCircuitActive&&s.compressorCondensateDrainActive&&s.compressorDistributionActive,id);
   assert.ok(p.package>p.receiver&&p.receiver>p.afterTreatment&&p.afterTreatment>p.ringNear&&p.ringNear>p.ringFar,id+':'+JSON.stringify(p));
   assert.ok(p.service.every(v=>v<p.ringNear),id);
   assert.equal(s.plantCompressedAirRouteVerified,false,id);
  }finally{sim.dispose();template.dispose();}
 }
});

test('V325 generic AHU twins remain Eurovent-neutral and never invent outdoor refrigeration',()=>{
 for(const id of ['BMJ-MCH-0036','BMJ-MCH-0037','BMJ-MCH-0038','BMJ-MCH-0039','BMJ-MCH-0041']){
  const template=createMachineTemplate(id),u=template.root.userData,sim=createMachineSimulation(id,template.root,template);
  try{
   assert.equal(u.exactAhuModelVerified,false,id);assert.equal(u.sectionOrderVerified,false,id);assert.equal(u.airflowDirectionVerified,false,id);assert.equal(u.outdoorCondensingUnitAssumed,false,id);assert.equal(u.plantDuctRouteVerified,false,id);
   assert.equal(template.findNode('ahu-mixing-boundary').userData.installedConfigurationVerified,false,id);
   assert.equal(template.findNode('ahu-droplet-option').userData.installedOptionVerified,false,id);
   assert.equal(template.findNode('ahu-fan-drive').userData.installedDriveTypeVerified,false,id);
   sim.start();let now=1000,seenCoil=false;sim.update(now);
   for(let i=0;i<700;i++){now+=20;sim.update(now);const s=sim.state();seenCoil||=s.genericCoilConditioningActive;assert.equal(s.outdoorHeatRejectionActive,false,id);assert.equal(s.evaporativePrecoolActive,false,id);assert.equal(s.dxEvaporatorActive,false,id);}
   assert.equal(seenCoil,true,id);
  }finally{sim.dispose();template.dispose();}
 }
});

test('V325 SANSIN AHU 7 preserves two-stage family cooling and separate outdoor heat rejection without assigning 45N or 90N',()=>{
 const id='BMJ-MCH-0040',template=createMachineTemplate(id),u=template.root.userData,sim=createMachineSimulation(id,template.root,template);
 try{
  assert.equal(u.exactSansinModelVerified,false);assert.equal(u.installedDuctTypeVerified,false);assert.equal(u.plantDuctRouteVerified,false);
  assert.deepEqual(u.familyCandidates,['YZKJ-45N','YZKJ-90N']);
  assert.equal(template.findNode('sansin-outdoor-fan').userData.installedFanCountVerified,false);
  sim.start();let now=1000,seenWet=false,seenDx=false,seenOutdoor=false;sim.update(now);
  for(let i=0;i<900;i++){now+=20;sim.update(now);const s=sim.state();seenWet||=s.evaporativePrecoolActive;seenDx||=s.dxEvaporatorActive;seenOutdoor||=s.outdoorHeatRejectionActive;assert.equal(s.genericCoilConditioningActive,false);}
  assert.equal(seenWet,true);assert.equal(seenDx,true);assert.equal(seenOutdoor,true);
  const indoor=template.findNode('universal-module-4').getWorldPosition(new THREE.Vector3());
  const outdoor=template.findNode('universal-module-5').getWorldPosition(new THREE.Vector3());
  assert.ok(outdoor.distanceTo(indoor)>1.2);
 }finally{sim.dispose();template.dispose();}
});

test('V325 utility truth lock fails closed on promoted plant route wrong evidence and detached utility core node',()=>{
 const template=createMachineTemplate('BMJ-MCH-0029');
 try{
  template.root.userData.plantCompressedAirRouteVerified=true;
  template.cfg={...template.cfg,evidence:{...template.cfg.evidence,geometry:'PLACEHOLDER'}};
  const detached=template.findNode('compressor-ring-main-reference');detached.parent.remove(detached);
  const audit=validateUtilityTemplate(template,'BMJ-MCH-0029');
  assert.equal(audit.valid,false);
  assert.ok(audit.errors.some(e=>e.code==='COMPRESSED_AIR_INSTALLATION_BOUNDARY'&&String(e.detail).startsWith('plantCompressedAirRouteVerified:')));
  assert.ok(audit.errors.some(e=>e.code==='EVIDENCE_GEOMETRY'));
  assert.ok(audit.errors.some(e=>e.code==='CORE_NODE_DETACHED'&&e.detail==='compressor-ring-main-reference'));
  assert.throws(()=>validateUtilityTemplate(template,'BMJ-MCH-0029',{throwOnError:true}),/Utility runtime truth-lock failed/);
 }finally{template.dispose();}
});
