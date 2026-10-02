import test from 'node:test';
import assert from 'node:assert/strict';
import {
 createMachineTemplate,
 createPolishedMachineTemplate,
 createMachineSimulation,
 validateFolderTemplate,
 validateFolderSimulation,
 FOLDER_RUNTIME_CONTRACTS
} from '../frontend/src/machine-runtime.js';

const folders=['BMJ-MCH-0016','BMJ-MCH-0017','BMJ-MCH-0018'];

test('V322 all three BMJ Folder Gluers pass evidence-bounded runtime truth contracts',()=>{
 for(const id of folders){
  const t=createPolishedMachineTemplate(id);
  try{
   const audit=validateFolderTemplate(t,id);
   assert.equal(audit.valid,true,id);
   assert.deepEqual(audit.errors,[],id);
   assert.equal(t.root.userData.folderRuntimeTruthLock,'PASS',id);
   assert.ok(FOLDER_RUNTIME_CONTRACTS[id],id);
   const sim=createMachineSimulation(id,t.root,t);
   try{
    const simAudit=validateFolderSimulation(sim,t,id);
    assert.equal(simAudit.valid,true,id);
    assert.equal(t.root.userData.folderSimulationTruthLock,'PASS',id);
   }finally{sim.dispose();}
  }finally{t.dispose();}
 }
});

test('V322 MEDIA100 FGM1/FGM3 preserve exact BMJ identity while installed option kits remain unverified and hidden',()=>{
 for(const id of ['BMJ-MCH-0016','BMJ-MCH-0018']){
  const t=createMachineTemplate(id);
  try{
   assert.equal(t.root.userData.assetId,id);
   assert.match(t.root.userData.geometryStatus,/INSTALLED_KITS_BOUNDED/);
   assert.equal(t.root.userData.engineeringDimensions,false);
   const serial=FOLDER_RUNTIME_CONTRACTS[id].serial,plates=[];t.root.traverse(o=>{if(o.userData?.identityPlacard)plates.push(o.userData.identityPlacard);});
   assert.equal(plates.length,1);assert.equal(plates[0].serial,serial);
   for(const flag of FOLDER_RUNTIME_CONTRACTS[id].unverifiedSpecFlags)assert.equal(t.root.userData.spec[flag],false,flag);
   for(const nodeId of ['media100-form-servo','media100-final-kicker']){
    const meshes=[];t.findNode(nodeId).traverse(o=>{if(o.isMesh)meshes.push(o);});
    assert.ok(meshes.length>0);assert.ok(meshes.every(m=>m.userData.capabilityOnly&&m.visible===false),nodeId);
   }
   const heads=[];t.findNode('media100-glue-upper').traverse(o=>{if(o.isMesh&&o.userData.glueHeadPosition)heads.push(o);});
   assert.equal(heads.length,3);assert.ok(heads.every(m=>m.userData.capabilityOnly&&m.visible===false));
  }finally{t.dispose();}
 }
});

test('V322 MEDIA100 low-detail and cutaway compose without losing the open-frame process signature or floating cover fittings',()=>{
 const t=createMachineTemplate('BMJ-MCH-0016');
 try{
  const micro=t.meshes.filter(m=>m.userData.detail&&!m.userData.silhouetteCritical&&!m.userData.capabilityOnly);
  const process=t.meshes.filter(m=>m.userData.belt||m.userData.tromboneBelt||m.userData.compressionBelt);
  const mounted=t.meshes.filter(m=>m.userData.coverMountedDetail);
  assert.ok(micro.length>0);assert.ok(process.length>10);assert.ok(mounted.length>=3);
  t.setLow(true);
  assert.ok(micro.every(m=>m.visible===false));
  assert.ok(process.every(m=>m.visible===true));
  t.setExteriorOpen(true);
  assert.ok(t.meshes.filter(m=>m.userData.exteriorCover).every(m=>m.visible===false));
  assert.ok(mounted.every(m=>m.visible===false),'identity plate / E-stop must not float after shell removal');
  assert.ok(process.every(m=>m.visible===true));
  t.setExteriorOpen(false);
  assert.ok(t.meshes.filter(m=>m.userData.exteriorCover).every(m=>m.visible===true));
  assert.ok(process.every(m=>m.visible===true));
  t.setLow(false);
  assert.ok(micro.every(m=>m.visible===true));
  for(const nodeId of ['media100-form-servo','media100-final-kicker']){
   const capability=[];t.findNode(nodeId).traverse(o=>{if(o.isMesh)capability.push(o);});
   assert.ok(capability.every(m=>m.visible===false),'unverified option became visible after LOD restore');
  }
 }finally{t.dispose();}
});

test('V322 FGM2 remains an unknown-identity multi-vendor process twin, never a presumed MEDIA100',()=>{
 const id='BMJ-MCH-0017',t=createMachineTemplate(id);
 try{
  const u=t.root.userData;
  assert.equal(u.assetId,id);
  assert.equal(u.exactFolderGluerOemVerified,false);
  assert.equal(u.exactFolderGluerModelVerified,false);
  assert.equal(u.neighborMedia100IdentityProof,false);
  assert.equal(u.installedIdentityBoundary,'OEM_MODEL_SERIAL_UNKNOWN__NO_MEDIA100_IDENTITY_ASSUMED');
  assert.match(u.geometryStatus,/NOT_MEDIA100_IDENTITY/);
  assert.doesNotMatch(t.root.name,/MEDIA 100/i);
  for(const nodeId of FOLDER_RUNTIME_CONTRACTS[id].capabilityNodes){
   const node=t.findNode(nodeId),meshes=[];node.traverse(o=>{if(o.isMesh)meshes.push(o);});
   assert.equal(node.userData.installedOptionVerified,false,nodeId);
   assert.ok(meshes.every(m=>m.userData.capabilityOnly&&m.visible===false),nodeId);
  }
  t.setLow(true);t.setLow(false);
  for(const nodeId of FOLDER_RUNTIME_CONTRACTS[id].capabilityNodes){
   const meshes=[];t.findNode(nodeId).traverse(o=>{if(o.isMesh)meshes.push(o);});
   assert.ok(meshes.every(m=>m.visible===false),nodeId+' leaked through LOD toggle');
  }
  const sim=createMachineSimulation(id,t.root,t);
  try{
   const state=sim.state();
   assert.equal(state.cartonBlankGeometryIsSchematic,true);
   assert.equal(state.crashLockInstalledVerified,false);
   assert.equal(state.fourSixCornerInstalledVerified,false);
   assert.equal(state.glueApplicatorTypeVerified,false);
   assert.equal(state.simulationBoundary,'FGM2_MULTI_VENDOR_COMMON_FOLD_GLUE_PROCESS_ONLY__BOX_STYLE_GLUE_HARDWARE_OPTIONS_NOT_INFERRED');
  }finally{sim.dispose();}
 }finally{t.dispose();}
});

test('V322 Folder truth lock fails closed on identity, option-boundary, and detached-process regressions',()=>{
 const t=createMachineTemplate('BMJ-MCH-0016');
 try{
  t.root.userData.taxonomyVersion='media100-v1';
  t.root.userData.spec={...t.root.userData.spec,installedCornerServoPackageVerified:true};
  const final=t.findNode('media100-final');final.parent.remove(final);
  const audit=validateFolderTemplate(t,'BMJ-MCH-0016');
  assert.equal(audit.valid,false);
  assert.ok(audit.errors.some(e=>e.code==='TAXONOMY_VERSION'));
  assert.ok(audit.errors.some(e=>e.code==='MEDIA100_OPTION_BOUNDARY'&&e.detail==='installedCornerServoPackageVerified'));
  assert.ok(audit.errors.some(e=>e.code==='CORE_NODE_DETACHED'&&e.detail==='media100-final'));
  assert.throws(()=>validateFolderTemplate(t,'BMJ-MCH-0016',{throwOnError:true}),/Folder Gluer runtime truth-lock failed/);
 }finally{t.dispose();}
});
