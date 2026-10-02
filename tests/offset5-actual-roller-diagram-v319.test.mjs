import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  OFFSET5_ACTUAL_ROLLER_DIAGRAM,
  OFFSET5_INKING_ROLLERS,
  OFFSET5_INK_DISTRIBUTORS,
  OFFSET5_DAMPENING_ROLLERS,
  TECHNICAL_SOURCES
} from '../frontend/src/data/sources-offset5.js';
import {OFFSET5_DIMENSIONS} from '../frontend/src/data/dimensions-offset5.js';
import {TAXONOMY_BY_ID,validateTaxonomy} from '../frontend/src/data/taxonomy-offset5.js';
import {Offset5CD102RealismTemplate,Offset5CD102RealismSimulation} from '../frontend/src/offset5-realism.js';

const expectedInk={
 '1':[72,'rubber-coated','blue'],'2':[66,'rubber-coated','red'],'3':[56,'plastic-coated',null],
 '4':[80,'rubber-coated','yellow'],'5':[68,'plastic-coated',null],'6':[72,'rubber-coated','blue'],
 '7':[56,'plastic-coated',null],'8':[60,'rubber-coated','white'],'9':[66,'rubber-coated','red'],
 '10':[56,'plastic-coated',null],'11':[80,'rubber-coated','yellow'],'12':[68,'plastic-coated',null],
 '13':[80,'rubber-coated','yellow'],'14':[60,'rubber-coated','white'],'15':[59,'rubber-coated',null]
};
const expectedDist={A:[85,'stainless steel'],B:[85,'plastic-coated'],C:[85,'plastic-coated'],D:[85,'plastic-coated']};
const expectedDamp={
 '16':[78,'rubber-coated',false],'17':[56,'rubber-coated',false],
 '18':[108,'plastic-coated',false],'19':[98,'rubber-coated',true],FR:[85,'chromium-plated',false]
};

test('V319 preserves BMJ custom Offset 5 dimensional contract',()=>{
 assert.equal(OFFSET5_DIMENSIONS.layout.printingUnitPitch,1.95);
 assert.equal(OFFSET5_DIMENSIONS.serviceInclusive.length,27);
 assert.equal(OFFSET5_DIMENSIONS.layout.printingUnitCount,8);
});

test('V319 actual on-machine roller diagram is the SSOT for PU roller table',()=>{
 assert.equal(OFFSET5_ACTUAL_ROLLER_DIAGRAM.sourceFile,'IMG_2777.jpeg');
 assert.equal(OFFSET5_INKING_ROLLERS.length,15);
 assert.equal(OFFSET5_INK_DISTRIBUTORS.length,4);
 assert.equal(OFFSET5_DAMPENING_ROLLERS.length,5);
 assert.ok(TECHNICAL_SOURCES.some(s=>s.id===OFFSET5_ACTUAL_ROLLER_DIAGRAM.sourceId));
 for(const spec of OFFSET5_INKING_ROLLERS)assert.deepEqual([spec.diameterMM,spec.surface,spec.colorCode],expectedInk[spec.code],spec.code);
 for(const spec of OFFSET5_INK_DISTRIBUTORS)assert.deepEqual([spec.diameterMM,spec.surface],expectedDist[spec.code],spec.code);
 for(const spec of OFFSET5_DAMPENING_ROLLERS)assert.deepEqual([spec.diameterMM,spec.surface,Boolean(spec.crowned)],expectedDamp[spec.code],spec.code);
});

test('V319 taxonomy maps every PU to actual roller diagram without the old material swaps',()=>{
 assert.equal(validateTaxonomy(),true);
 for(let unit=1;unit<=8;unit++){
  const prefix=`O5.PRINT.PU${unit}`;
  for(const spec of OFFSET5_INKING_ROLLERS){
   const n=TAXONOMY_BY_ID.get(`${prefix}.INK.R${spec.code}`);
   assert.ok(n,`PU${unit} missing ink roller ${spec.code}`);
   assert.equal(n.verified,true);
   assert.ok(n.sourceRefs.includes('SRC-O5-ROLLER-DIAGRAM-IMG2777'));
   assert.ok(n.description.includes(spec.surface));
  }
  for(const spec of OFFSET5_INK_DISTRIBUTORS){
   const n=TAXONOMY_BY_ID.get(`${prefix}.INK.DIST_${spec.code}`);
   assert.ok(n);assert.equal(n.verified,true);assert.ok(n.description.includes(spec.surface));
  }
  for(const spec of OFFSET5_DAMPENING_ROLLERS){
   const n=TAXONOMY_BY_ID.get(`${prefix}.DAMP.R${spec.code}`);
   assert.ok(n);assert.equal(n.verified,true);assert.ok(n.description.includes(spec.surface));
  }
 }
});

test('V319 live geometry repeats corrected PU roller metadata across all eight units',()=>{
 const m=new Offset5CD102RealismTemplate();
 try{
  assert.equal(m.root.userData.taxonomyVersion,'offset5-taxonomy-v18');
  assert.equal(m.root.userData.printingUnitReality.revision,'offset5-print-unit-reality-v319');
  for(let i=0;i<8;i++){
   for(const spec of OFFSET5_INKING_ROLLERS){
    const body=m.findNode(`press-${i}-ink-roller-${spec.code}-body`);
    assert.ok(body,`PU${i+1} ink roller ${spec.code} body missing`);
    const mesh=body.children.find(o=>o.isMesh);
    assert.equal(mesh?.userData.rollerSurface,spec.surface);
    assert.equal(mesh?.userData.nominalDiameterMM,spec.diameterMM);
   }
   for(const spec of OFFSET5_INK_DISTRIBUTORS){
    const body=m.findNode(`press-${i}-ink-distributor-${spec.code}-body`);
    const mesh=body?.children.find(o=>o.isMesh);
    assert.equal(mesh?.userData.rollerSurface,spec.surface);
   }
   for(const spec of OFFSET5_DAMPENING_ROLLERS){
    const body=m.findNode(`press-${i}-damp-roller-${spec.code}-body`);
    const mesh=body?.children.find(o=>o.isMesh);
    assert.equal(mesh?.userData.rollerSurface,spec.surface);
    assert.equal(Boolean(mesh?.userData.crowned),Boolean(spec.crowned));
   }
   for(const id of [`press-${i}-frame`,`press-${i}-cover`,`press-${i}-drive`,`press-${i}-top-deck`])assert.ok(m.findNode(id),`PU${i+1} exterior node ${id} missing`);
  }
  const pu1damp17=m.findNode('press-0-damp-roller-17-body').children.find(o=>o.isMesh);
  const pu1damp18=m.findNode('press-0-damp-roller-18-body').children.find(o=>o.isMesh);
  const pu1damp19=m.findNode('press-0-damp-roller-19-body').children.find(o=>o.isMesh);
  const pu1fr=m.findNode('press-0-damp-roller-FR-body').children.find(o=>o.isMesh);
  assert.ok(pu1damp17.material.roughness>.8,'17/ZW must visually read as rubber-coated');
  assert.ok(pu1damp18.material.metalness<.1,'18/T must visually read as plastic-coated');
  assert.ok(pu1damp19.material.roughness>.8,'19/DW must visually read as rubber-coated');
  assert.ok(pu1fr.material.metalness>.8,'FR must visually read as chromium-plated');
 }finally{m.dispose();}
});

test('V319 keeps all eight PU exteriors on the photo-verified handedness and removes synthetic unit styling',()=>{
 const m=new Offset5CD102RealismTemplate();
 try{
  m.root.updateMatrixWorld(true);
  for(let i=0;i<8;i++){
   const frame=m.findNode(`press-${i}-frame`),cover=m.findNode(`press-${i}-cover`),drive=m.findNode(`press-${i}-drive`),bridge=m.findNode(`press-${i}-fountain-support`);
   const top=m.findNode(`press-${i}-top-deck`),inkBay=m.findNode(`press-${i}-ink`),openBay=m.findNode(`press-${i}-open-ink-bay`);
   const ductBody=m.findNode(`press-${i}-ink-fountain-roller-body`),brand=m.findNode(`press-${i}-operator-brand`);
   assert.ok(frame&&cover&&drive&&bridge&&top&&inkBay&&openBay&&ductBody&&brand,`PU${i+1} exterior/open-top hierarchy incomplete`);
   assert.equal(frame.userData.openUpperFrame,true,`PU${i+1} structural top frame must remain open`);
   assert.equal(frame.userData.fullDepthTopBeam,false,`PU${i+1} must not regain the full-depth top beam regression`);
   assert.equal(top.userData.openUpperDeck,true,`PU${i+1} top must stay photo-locked OPEN`);
   assert.equal(top.userData.solidTopCover,false,`PU${i+1} must not regain the regressed solid hood`);
   assert.equal(inkBay.userData.openInkBed,true,`PU${i+1} ink bay must stay open`);
   assert.equal(inkBay.userData.solidInkEnclosure,false,`PU${i+1} must not regain the closed ink enclosure`);
   assert.equal(openBay.userData.normalStateVisible,true,`PU${i+1} open ink bay must be visible in normal state`);
   assert.equal(brand.userData.brandText,'HEIDELBERG Speedmaster');
   const ductMesh=ductBody.children.find(o=>o.isMesh);
   assert.ok(ductMesh,`PU${i+1} visible green duct roller missing`);
   assert.equal(ductMesh.material.color.getHex(),m.palette.photoRollerGreen,`PU${i+1} duct roller must preserve the photo-locked green surface`);
   assert.ok(ductMesh.material.roughness>.8,`PU${i+1} green duct roller must read as rubber/service-roll surface`);
   const coverZ=new THREE.Box3().setFromObject(cover).getCenter(new THREE.Vector3()).z;
   const driveZ=new THREE.Box3().setFromObject(drive).getCenter(new THREE.Vector3()).z;
   assert.ok(coverZ<-.5,`PU${i+1} operator-side cover must remain on world -Z`);
   assert.ok(driveZ>.5,`PU${i+1} drive-side cover must remain on world +Z`);
   let syntheticRed=false;
   bridge.traverse(o=>{if(o.isMesh&&o.material?.color?.getHex?.()===m.palette.red)syntheticRed=true;});
   assert.equal(syntheticRed,false,`PU${i+1} must not receive synthetic per-unit red exterior styling`);
  }
  m.setLow(true);
  for(let i=0;i<8;i++){
   const duct=m.findNode(`press-${i}-ink-fountain-roller-body`).children.find(o=>o.isMesh);
   const openFilm=m.findNode(`press-${i}-open-ink-bay`).children.find(o=>o.name==='Visible Ink Film Color'||o.userData?.visibleInkFilm);
   assert.equal(duct.visible,true,`PU${i+1} green duct roller is silhouette-critical and must survive mobile LOD`);
   assert.equal(openFilm?.visible,true,`PU${i+1} open ink film must survive mobile LOD`);
  }
  m.setLow(false);
  m.setExteriorOpen(false);
  for(let i=0;i<8;i++){
   assert.equal(m.findNode(`press-${i}-cover`).visible,true,`PU${i+1} exterior cabinet must be present by default`);
   assert.equal(m.findNode(`press-${i}-open-ink-bay`).visible,true,`PU${i+1} open ink bay must remain visible in normal state`);
   assert.equal(m.findNode(`press-${i}-ink-fountain-roller`).visible,true,`PU${i+1} green duct roller must remain visible in normal state`);
  }
  m.setExteriorOpen(true);
  for(let i=0;i<8;i++){
   assert.equal(m.findNode(`press-${i}-cover`).visible,false,`PU${i+1} cabinet cover must disappear only in cutaway mode`);
   assert.equal(m.findNode(`press-${i}-open-ink-bay`).visible,true,`PU${i+1} actual open-bay process geometry must not disappear with exterior covers`);
  }
 }finally{m.dispose();}
});

test('V319 simulation uses actual inking/distributor/dampening surfaces while keeping service timing unasserted',()=>{
 const m=new Offset5CD102RealismTemplate(),sim=new Offset5CD102RealismSimulation(m.root,m);
 try{
  const state=sim.state();
  assert.equal(state.rollerDiagramRevision,'offset5-print-unit-reality-v319');
  assert.equal(state.rollerDiagramSource,'IMG_2777.jpeg');
  assert.equal(state.inkRollerCount,8*(15+4));
  assert.equal(state.dampeningRollerSurfaceCount,8*5);
  assert.ok(state.rollerDiagramBoundary.includes('DO_NOT_INFER_NIP_PRESSURE_TIMING'));
  assert.equal(state.primaryCylinderDiagramPolicy,'IMG_2777_PLATE_AND_IMPRESSION_SAME_ROTATION_SENSE__BLANKET_OPPOSITE__NO_TIMING_OR_PHASE_CLAIM');
  assert.equal(state.openUpperDeckPolicy,'V404_V408_PHOTO_LOCK__NO_SOLID_PU_TOP__GREEN_DUCT_ROLL_REMAINS_GREEN');
  for(let i=1;i<=8;i++){
   const plate=sim.rotors.find(r=>r.role===`PU${i}-plate-cylinder`);
   const blanket=sim.rotors.find(r=>r.role===`PU${i}-blanket-cylinder`);
   const impression=sim.rotors.find(r=>r.role===`PU${i}-impression-cylinder`);
   const transfer=sim.rotors.find(r=>r.role===`PU${i}-transfer-cylinder`);
   assert.ok(plate&&blanket&&impression&&transfer,`PU${i} primary cylinder motion references missing`);
   assert.equal(plate.sign,impression.sign,`PU${i} plate and impression must share the diagram rotation sense`);
   assert.equal(blanket.sign,-plate.sign,`PU${i} blanket must counter-rotate against plate/impression`);
   assert.match(plate.source,/IMG_2777_PRIMARY_CYLINDER_RELATIVE_ROTATION/);
   assert.match(blanket.source,/IMG_2777_PRIMARY_CYLINDER_RELATIVE_ROTATION/);
   assert.match(impression.source,/IMG_2777_PRIMARY_CYLINDER_RELATIVE_ROTATION/);
   assert.match(transfer.source,/TRANSFER_NOT_SHOWN_IN_IMG_2777/);
  }
  const greenBefore=Array.from({length:8},(_,i)=>m.findNode(`press-${i}-ink-fountain-roller-body`).children.find(o=>o.isMesh).material.color.getHex());
  sim.start();
  assert.equal(sim.active,true);
  for(let i=0;i<8;i++){
   const mesh=m.findNode(`press-${i}-ink-fountain-roller-body`).children.find(o=>o.isMesh);
   assert.equal(mesh.material.color.getHex(),greenBefore[i],`PU${i+1} green duct roller must not be recolored by job-state ink visualization`);
  }
  for(const item of sim.dampeningSurfaces)assert.equal(item.material.emissiveIntensity,.035);
  sim.stop();
  assert.equal(sim.active,false);
 }finally{sim.dispose();m.dispose();}
});
