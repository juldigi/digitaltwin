import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMachineTemplate,
  createPolishedMachineTemplate,
  validateOffset5PilotTemplate,
  OFFSET5_PILOT_RUNTIME_CONTRACT
} from '../frontend/src/machine-runtime.js';

test('V320 Offset 5 runtime truth lock accepts only the merged V319 pilot baseline',()=>{
 const t=createMachineTemplate('offset5');
 try{
  const audit=validateOffset5PilotTemplate(t);
  assert.equal(audit.valid,true);
  assert.deepEqual(audit.errors,[]);
  assert.equal(t.root.userData.offset5RuntimeTruthLock,'PASS');
  assert.equal(t.root.userData.version,OFFSET5_PILOT_RUNTIME_CONTRACT.version);
  assert.equal(t.root.userData.taxonomyVersion,OFFSET5_PILOT_RUNTIME_CONTRACT.taxonomyVersion);
  assert.equal(t.root.userData.printingUnitReality.revision,OFFSET5_PILOT_RUNTIME_CONTRACT.realityRevision);
  assert.equal(t.root.userData.realismPack,OFFSET5_PILOT_RUNTIME_CONTRACT.realismPack);
  assert.equal(t.root.userData.dimensionLock,OFFSET5_PILOT_RUNTIME_CONTRACT.dimensionLock);
 }finally{t.dispose();}
});

test('V320 Offset 5 polished runtime preserves the same pilot truth contract',()=>{
 const t=createPolishedMachineTemplate('BMJ-MCH-0003');
 try{
  const audit=validateOffset5PilotTemplate(t);
  assert.equal(audit.valid,true);
  assert.equal(t.root.userData.presentationGeometryPolicy,'NO_GENERIC_GEOMETRY_REPLACEMENT__PRESERVE_MACHINE_SPECIFIC_TEMPLATE');
  for(let i=0;i<8;i++){
   assert.equal(t.findNode(`press-${i}-top-deck`).userData.openUpperDeck,true);
   assert.equal(t.findNode(`press-${i}-ink`).userData.openInkBed,true);
   assert.equal(t.findNode(`press-${i}-operator-brand`).userData.brandText,'HEIDELBERG Speedmaster');
  }
 }finally{t.dispose();}
});

test('V320 truth lock fails closed when a stale or regressed Offset 5 PU is injected',()=>{
 const t=createMachineTemplate('offset5');
 try{
  t.root.userData.version='offset5-photo-pdf-v36';
  t.findNode('press-3-top-deck').userData.solidTopCover=true;
  t.findNode('press-5-ink').userData.openInkBed=false;
  const audit=validateOffset5PilotTemplate(t);
  assert.equal(audit.valid,false);
  assert.ok(audit.errors.some(e=>e.code==='VERSION'));
  assert.ok(audit.errors.some(e=>e.code==='PU_TOP'&&e.detail===4));
  assert.ok(audit.errors.some(e=>e.code==='PU_INK_BAY'&&e.detail===6));
  assert.equal(t.root.userData.offset5RuntimeTruthLock,'FAIL');
  assert.throws(()=>validateOffset5PilotTemplate(t,{throwOnError:true}),/runtime truth-lock failed/i);
 }finally{t.dispose();}
});

test('V320 truth lock detects loss of the photo-locked green duct roller',()=>{
 const t=createMachineTemplate('offset5');
 try{
  const duct=t.findNode('press-0-ink-fountain-roller-body');
  duct.traverse(o=>{if(o.isMesh)delete o.userData.offset5InkDuctRollPhotoLocked;});
  const audit=validateOffset5PilotTemplate(t);
  assert.equal(audit.valid,false);
  assert.ok(audit.errors.some(e=>e.code==='PU_GREEN_DUCT_ROLL'&&e.detail===1));
 }finally{t.dispose();}
});
