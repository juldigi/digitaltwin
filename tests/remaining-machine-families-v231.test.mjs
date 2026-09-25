import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {UniversalMachineTemplate} from '../frontend/src/universal-machine.js';

const source=readFileSync(resolve('frontend/src/universal-machine.js'),'utf8');
const bake=readFileSync(resolve('scripts/bake-factory-fleet.mjs'),'utf8');
const sw=readFileSync(resolve('frontend/sw.js'),'utf8');

const withMachine=(id,fn)=>{const m=new UniversalMachineTemplate(id);try{fn(m);}finally{m.dispose();}};

test('V231 dispatches unresolved machine families to dedicated process-intersection builders',()=>{
 for(const [family,builder] of [['folder','buildFolderGluer'],['blanker','buildBlanker'],['collator','buildCollator'],['ctp','buildCTP'],['imagesetter','buildImagesetter']]){
  assert.match(source,new RegExp("if\\(f==='"+family+"'\\)return this\\."+builder+"\\(total\\)"));
 }
});

test('V231 FGM-2 is an open folder-gluer process line and never impersonates MEDIA 100 II',()=>{
 withMachine('BMJ-MCH-0017',m=>{
  assert.equal(m.root.userData.visualRefinement,'V231_FGM2_MULTI_VENDOR_FOLDER_GLUER_INTERSECTION');
  assert.match(m.root.userData.installedIdentityBoundary,/OEM_MODEL_SERIAL_UNKNOWN/);
  assert.ok(m.findNode('fgm2-open-frame'));
  assert.ok(m.findNode('universal-module-1'));
  assert.ok(m.findNode('universal-module-7'));
  assert.equal(m.findNode('universal-module-4').userData.installedGlueArchitectureVerified,false);
 });
 assert.match(source,/NO_MEDIA100_IDENTITY_ASSUMED/);
});

test('V231 QF-100CS stays family-bounded while gaining the characteristic moving table and fixed head silhouette',()=>{
 withMachine('BMJ-MCH-0021',m=>{
  assert.equal(m.root.userData.visualRefinement,'V231_QF100CS_BLANKER_FAMILY_SILHOUETTE');
  assert.match(m.root.userData.installedIdentityBoundary,/QF100CS_EXACT_PUBLIC_EQUIVALENCE_UNVERIFIED/);
  assert.ok(m.findNode('blanker-shell'));
  const platform=m.findNode('universal-module-2');
  const head=m.findNode('universal-module-3');
  let xy=false,fixed=false;
  platform.traverse(o=>{if(o.userData?.xyServoPlatform)xy=true;});
  head.traverse(o=>{if(o.userData?.fixedHydraulicHead)fixed=true;});
  assert.ok(xy&&fixed);
 });
});

test('V231 collator uses a vertical bin tower instead of a horizontal generic conveyor',()=>{
 withMachine('BMJ-MCH-0023',m=>{
  assert.equal(m.root.userData.visualRefinement,'V231_SUCTION_COLLATOR_TOWER_INTERSECTION');
  const tower=m.findNode('universal-module-1');
  assert.equal(tower.userData.referenceBinCount,10);
  assert.equal(tower.userData.installedBinCountVerified,false);
 });
});

test('V231 CTP uses the Suprasetter-family low front grille, sloped hood and external imaging drum',()=>{
 withMachine('BMJ-MCH-0025',m=>{
  assert.equal(m.root.userData.visualRefinement,'V231_HEIDELBERG_SUPRASETTER_FAMILY_SILHOUETTE');
  assert.match(m.root.userData.installedIdentityBoundary,/EXACT_A52_A75_A106_106_MODEL_UNKNOWN/);
  let grille=false,drum=false;
  m.root.traverse(o=>{if(o.userData?.frontVentilationIdentity)grille=true;if(o.userData?.externalImagingDrum)drum=true;});
  assert.ok(grille&&drum);
  assert.equal(m.findNode('universal-module-5').userData.internalPunchInstalled,false);
 });
});

test('V231 CTF imagesetter uses roll cassette, capstan/scanner and bounded cutter architecture',()=>{
 withMachine('BMJ-MCH-0027',m=>{
  assert.equal(m.root.userData.visualRefinement,'V231_SCREEN_FTR_KATANA_FAMILY_SILHOUETTE');
  assert.match(m.root.userData.installedIdentityBoundary,/EXACT_SCREEN_MODEL_UNKNOWN/);
  let cassette=false,scanner=false;
  m.root.traverse(o=>{if(o.userData?.mediaCassetteReference)cassette=true;if(o.userData?.polygonScannerReference)scanner=true;});
  assert.ok(cassette&&scanner);
  assert.equal(m.findNode('universal-module-5').userData.punchInstalled,false);
 });
});

test('V231 Zund flatbed has vacuum-bed grid, bridge gantry and bounded module carrier',()=>{
 withMachine('BMJ-MCH-0028',m=>{
  assert.equal(m.root.userData.visualRefinement,'V231_ZUND_G3_S3_MODULAR_FLATBED_SILHOUETTE');
  assert.ok(m.findNode('zund-gantry'));
  let carrier=false;m.root.traverse(o=>{if(o.userData?.moduleCarrierReference)carrier=true;});
  assert.ok(carrier);
 });
});

test('V231 compressor silhouettes distinguish Atlas Copco, KAESER and SWAN family packages',()=>{
 const ids=[['BMJ-MCH-0029','ATLAS_COPCO'],['BMJ-MCH-0031','KAESER'],['BMJ-MCH-0033','SWAN']];
 for(const [id,brand] of ids)withMachine(id,m=>{
  assert.match(m.root.userData.visualRefinement,new RegExp(brand));
  assert.match(m.root.userData.installedIdentityBoundary,/EXACT_MODEL_KW_DRIVE/);
  let vent=false,control=false;m.root.traverse(o=>{if(o.userData?.ventilationPanel)vent=true;if(o.userData?.controllerFamilyReference)control=true;});
  assert.ok(vent&&control);
 });
});

test('V231 AHUs are sectional double-skin packages with service seams and functional internals',()=>{
 for(const id of ['BMJ-MCH-0036','BMJ-MCH-0040'])withMachine(id,m=>{
  assert.match(m.root.userData.visualRefinement,/V231_/);
  let seam=false,handle=false,active=false;
  m.root.traverse(o=>{if(o.userData?.panelSeam)seam=true;if(o.userData?.serviceDoorHandle)handle=true;if(o.userData?.fanWheelReference||o.userData?.filterBankReference||o.userData?.coilReference)active=true;});
  assert.ok(seam&&handle&&active);
 });
});

test('V231 home geometry still bakes these same live templates and cache contract remains stable',()=>{
 assert.match(bake,/const t=createMachineTemplate\(place\.machineId\)/);
 assert.match(sw,/V231 remaining machine families realism/);
 assert.match(sw,/factory-digital-twin-v222-overlay-state-ssot-20260925/);
 assert.match(sw,/const RELEASE='222'/);
});
