import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTOPLATEN_RUNTIME_CONTRACTS,
  createMachineTemplate,
  createPolishedMachineTemplate,
  createMachineSimulation,
  validateAutoplatenTemplate,
  validateAutoplatenSimulation
} from '../frontend/src/machine-runtime.js';

const assets=['BMJ-MCH-0010','BMJ-MCH-0011','BMJ-MCH-0012','BMJ-MCH-0013','BMJ-MCH-0014','BMJ-MCH-0015'];

test('V321 all six BMJ autoplaten assets pass the fail-closed runtime truth contract',()=>{
 for(const id of assets){
  const t=createPolishedMachineTemplate(id);
  try{
   const audit=validateAutoplatenTemplate(t,id);
   assert.equal(audit.valid,true,id);
   assert.deepEqual(audit.errors,[],id);
   assert.equal(t.root.userData.autoplatenRuntimeTruthLock,'PASS',id);
   assert.equal(audit.contract.serial,AUTOPLATEN_RUNTIME_CONTRACTS[id].serial,id);
   assert.ok(audit.contract.coreNodes.every(nodeId=>t.findNode(nodeId)),id);
   const sim=createMachineSimulation(id,t.root,t);
   try{
    const simAudit=validateAutoplatenSimulation(sim,t,id);
    assert.equal(simAudit.valid,true,id);
    assert.equal(t.root.userData.autoplatenSimulationTruthLock,'PASS',id);
   }finally{sim.dispose();}
  }finally{t.dispose();}
 }
});

test('V321 autoplaten truth lock rejects stale taxonomy identity and missing core station',()=>{
 const t=createMachineTemplate('BMJ-MCH-0014');
 try{
  t.root.userData.taxonomyVersion='promatrix106-v1';
  const plate=[];t.root.traverse(o=>{if(o.userData?.identityPlacard)plate.push(o);});
  plate[0].userData.identityPlacard={...plate[0].userData.identityPlacard,serial:'WRONG'};
  const node=t.findNode('pm106-blanking');node.userData.nodeId='pm106-blanking-stale';
  const detached=t.findNode('pm106-stripping');detached.parent.remove(detached);
  const audit=validateAutoplatenTemplate(t,'BMJ-MCH-0014');
  assert.equal(audit.valid,false);
  assert.ok(audit.errors.some(e=>e.code==='TAXONOMY_VERSION'));
  assert.ok(audit.errors.some(e=>e.code==='IDENTITY_SERIAL'));
  assert.ok(audit.errors.some(e=>e.code==='CORE_NODE_MISSING'&&e.detail==='pm106-blanking'));
  assert.ok(audit.errors.some(e=>e.code==='CORE_NODE_DETACHED'&&e.detail==='pm106-stripping'));
  assert.throws(()=>validateAutoplatenTemplate(t,'BMJ-MCH-0014',{throwOnError:true}),/Autoplaten runtime truth-lock failed/);
 }finally{t.dispose();}
});

test('V321 preserves evidence boundaries instead of upgrading family references into installed CAD claims',()=>{
 const apm2=createMachineTemplate('BMJ-MCH-0010'),mk5=createMachineTemplate('BMJ-MCH-0011'),mk6=createMachineTemplate('BMJ-MCH-0012'),mk7=createMachineTemplate('BMJ-MCH-0013');
 try{
  assert.equal(apm2.root.userData.engineeringDimensions,false);
  assert.match(apm2.root.userData.geometryStatus,/SUFFIX_UNCONFIRMED/);
  assert.equal(mk5.findNode('mk920-foil-unwind').userData.installedReelCountVerified,false);
  assert.equal(mk6.findNode('mk920-transport-bar').userData.installedBarCountVerified,false);
  for(const key of ['installedEnvelopeHeightVerified','installedElectricalVariantVerified','installedPlatformGeometryVerified'])assert.equal(mk7.root.userData.spec[key],false,key);
 }finally{apm2.dispose();mk5.dispose();mk6.dispose();mk7.dispose();}
});

test('V321 MK920 mobile LOD hides service microdetail while preserving silhouette and foil process signature',()=>{
 const t=createMachineTemplate('BMJ-MCH-0011');
 try{
  const details=t.meshes.filter(m=>m.userData.detail&&!m.userData.silhouetteCritical);
  const foil=t.meshes.filter(m=>m.userData.foilWeb);
  const silhouettes=t.meshes.filter(m=>m.userData.silhouetteCritical);
  assert.ok(details.length>0);
  assert.equal(foil.length,3);
  t.setLow(true);
  assert.ok(details.every(m=>m.visible===false));
  assert.ok(foil.every(m=>m.visible===true));
  assert.ok(silhouettes.filter(m=>!m.userData.exteriorCover&&!m.userData.coverMountedDetail).every(m=>m.visible===true));
  t.setExteriorOpen(true);
  assert.ok(t.meshes.filter(m=>m.userData.exteriorCover||m.userData.coverMountedDetail).every(m=>m.visible===false));
  assert.ok(foil.every(m=>m.visible===true));
  t.setExteriorOpen(false);
  assert.ok(t.meshes.filter(m=>m.userData.exteriorCover).every(m=>m.visible===true));
  assert.ok(details.every(m=>m.visible===false));
  t.setLow(false);
  assert.ok(details.every(m=>m.visible===true));
 }finally{t.dispose();}
});

test('V321 fleet simulation never performs platen/stripping/blanking work while gripper transport is indexing',()=>{
 const cases=[
  ['BMJ-MCH-0010',s=>s.platenClosed||s.strippingActive],
  ['BMJ-MCH-0011',s=>s.pressureDwell||s.stampingContact],
  ['BMJ-MCH-0012',s=>s.pressureDwell||s.stampingContact],
  ['BMJ-MCH-0013',s=>s.platenClosed||s.strippingActive||s.blankingActive],
  ['BMJ-MCH-0014',s=>s.cuttingActive||s.strippingActive||s.blankingActive],
  ['BMJ-MCH-0015',s=>s.cuttingActive||s.strippingActive||s.blankingActive]
 ];
 for(const [id,working] of cases){
  const t=createMachineTemplate(id),sim=createMachineSimulation(id,t.root,t);
  try{
   sim.start();let now=1000;sim.update(now);
   for(let i=0;i<800;i++){
    now+=20;sim.update(now);const state=sim.state();
    if(working(state))assert.equal(state.transportIndexing,false,id+' process work overlapped a chain index');
    assert.equal(Object.values(state.interlocks||{}).every(Boolean),true,id+' interlock contract failed');
   }
  }finally{sim.dispose();t.dispose();}
 }
});
