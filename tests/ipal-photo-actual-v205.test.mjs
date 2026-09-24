import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';
import {loadActualPlantLayout} from '../frontend/src/data/plant-actual.js';
import {IPAL_PHOTO_EVIDENCE_V206} from '../frontend/src/data/ipal-photo-evidence-v206.js';

const collect=(root,re)=>{
 const out=[];root.traverse(o=>{if(re.test(String(o.userData?.semantic||'')))out.push(o);});return out;
};

test('V206 makes the 15 actual IPAL photos the dominant visible evidence layer',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),meta=built.root.userData,s=meta.buildingDetailStats;
 assert.equal(meta.ipal.enclosingWalls,0);
 assert.equal(meta.ipal.openSides,true);
 assert.equal(meta.ipal.photoActual.version,'V206');
 assert.equal(meta.ipal.photoActual.sourceArchive,'IPAL.zip');
 assert.equal(meta.ipal.photoActual.photoCount,15);
 assert.equal(meta.ipal.photoActual.files.length,15);
 assert.ok(s.v205IpalPhotoObjects>100,'photo actual reconstruction should be materially detailed');
 assert.ok(s.v205IpalLegacyHidden>0,'generic IPAL references should be superseded');
 assert.ok(s.v205IpalPipingRuns>0);
 assert.ok(s.v205IpalSafetyDetails>0);
 assert.ok(s.v205IpalVegetationObjects>0);
 assert.deepEqual(meta.ipal.processFlow,['PHOTO_ACTUAL_EQUIPMENT_IDENTITY_ONLY__PID_UNVERIFIED']);
 assert.deepEqual(meta.ipal.legacyReferenceFlow,['EQUALIZATION','AERATION','CLARIFICATION','FILTRATION','TRANSFER']);
 assert.match(meta.ipal.processFlowEvidence,/PHOTO_PID_UNVERIFIED/);
 assert.equal(meta.ipal.photoActual.processMotionDefault,false);
 assert.ok(meta.ipal.photoActual.unresolved.includes('COMPLETE_PID_AND_PROCESS_FLOW_DIRECTION'));
});

test('V206 exposes photo-confirmed IPAL equipment without inventing survey dimensions or chemistry',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const root=buildActualFactory(layout,fleet).root;
 for(const semantic of [
  'IPAL_PHOTO_BAK_EKUALISASI_WALL',
  'IPAL_PHOTO_BAK_PENAMPUNGAN_SEMENTARA_WALL',
  'IPAL_PHOTO_TANGKI_AN_AEROBIK',
  'IPAL_PHOTO_HOPPER_CONE_VESSEL',
  'IPAL_PHOTO_RED_CHEMICAL_TANK',
  'IPAL_PHOTO_SLUDGE_DEWATERING_BAG',
  'IPAL_PHOTO_OPERATOR_ROOM_FRONT_WALL',
  'IPAL_PHOTO_VERTICAL_GARDEN_PLANT',
  'IPAL_PHOTO_ORNAMENTAL_POND_WATER'
 ]){
  const found=collect(root,new RegExp('^'+semantic+'$'));
  assert.ok(found.length>0,semantic);
  assert.ok(found.every(o=>o.userData.evidenceLayer==='PHOTO_ACTUAL'),semantic+' evidence layer');
  assert.ok(found.every(o=>/NOT_SURVEYED/.test(String(o.userData.accuracy||''))),semantic+' dimension boundary');
 }
 const chemical=collect(root,/^IPAL_PHOTO_(?:RED|UPPER_RED)_CHEMICAL_TANK$/);
 assert.ok(chemical.length>=5);
 assert.ok(chemical.every(o=>o.userData.contents==='UNVERIFIED_FROM_PHOTO'));
});

test('V206 hides process-generic objects contradicted or overstated by the photographic evidence',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const root=buildActualFactory(layout,fleet).root;
 for(const semantic of ['IPAL_CLARIFIER','IPAL_FILTER_VESSEL','IPAL_AERATION_BASIN','IPAL_EQUALIZATION_BASIN']){
  const objects=collect(root,new RegExp('^'+semantic+'$'));
  assert.ok(objects.length>0,semantic+' legacy object should remain for provenance');
  assert.ok(objects.every(o=>o.visible===false),semantic+' should not render over photo actual geometry');
  assert.ok(objects.every(o=>o.userData.supersededByV206===true),semantic+' should be marked superseded');
 }
});

test('V206 preserves every machine placement and does not close the outdoor IPAL yard',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet);
 for(const p of layout.placements.filter(p=>p.status!=='UNIDENTIFIED')){
  const g=built.assets.get(p.machineId);if(!g)continue;
  assert.equal(g.position.x,p.x,p.machineId+' x moved');
  assert.equal(g.position.z,-p.y,p.machineId+' y moved');
  assert.equal(g.rotation.y,p.rotation*Math.PI/180,p.machineId+' rotation changed');
 }
 assert.equal(built.root.userData.ipal.enclosingWalls,0);
 assert.equal(built.root.userData.ipal.openSides,true);
});

test('V206 records photo-derived labels, topology and P&ID boundary explicitly',()=>{
 assert.equal(IPAL_PHOTO_EVIDENCE_V206.photoCount,15);
 assert.deepEqual(IPAL_PHOTO_EVIDENCE_V206.files[0],'IMG_2511.HEIC');
 assert.deepEqual(IPAL_PHOTO_EVIDENCE_V206.files.at(-1),'IMG_2525.HEIC');
 for(const label of ['BAK EKUALISASI','BAK PENAMPUNGAN SEMENTARA','TANGKI AN AEROBIK','UNIT (KARUNG) PENGERING LUMPUR'])assert.ok(IPAL_PHOTO_EVIDENCE_V206.confirmedLabels.includes(label),label);
 assert.match(IPAL_PHOTO_EVIDENCE_V206.confidencePolicy.dimensions,/NOT_SURVEYED/);
 assert.match(IPAL_PHOTO_EVIDENCE_V206.confidencePolicy.piping,/NOT_PID/);
 assert.match(IPAL_PHOTO_EVIDENCE_V206.confidencePolicy.processNames,/ONLY_WHEN_LABEL/);
});


test('V206 hardening makes the blue basins tall photo-like structures instead of low generic ponds',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const root=buildActualFactory(layout,fleet).root;
 const eq=collect(root,/^IPAL_PHOTO_BAK_EKUALISASI$/)[0],tmp=collect(root,/^IPAL_PHOTO_BAK_PENAMPUNGAN_SEMENTARA$/)[0];
 assert.ok(eq&&tmp);
 const eb=new T.Box3().setFromObject(eq),tb=new T.Box3().setFromObject(tmp);
 assert.ok(eb.max.y-eb.min.y>3,'Bak Ekualisasi must read as the tall photographed blue structure');
 assert.ok(tb.max.y-tb.min.y>1.7,'temporary holding basin must be visibly raised');
 assert.ok(collect(root,/^IPAL_PHOTO_EQUALIZATION_LEVEL_MARK$/).length>=11);
 assert.ok(collect(root,/^IPAL_PHOTO_TEMP_HOLDING_LEVEL_MARK$/).length>=6);
 assert.ok(collect(root,/^IPAL_PHOTO_BASIN_ACCESS_STAIR_TREAD$/).length>=12);
});

test('V206 hardening uses a continuous shallow canopy curve and fully supersedes the pre-photo IPAL layer',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root;
 assert.ok(collect(root,/^IPAL_PHOTO_CURVED_CANOPY_RAFTER$/).length>=60);
 assert.ok(collect(root,/^IPAL_PHOTO_TRANSLUCENT_ROOF_PANEL$/).length>=2);
 for(const semantic of ['IPAL_CONCRETE_SLAB','IPAL_OPEN_FRAME_COLUMN','IPAL_CANOPY_ROOF']){
  const legacy=collect(root,new RegExp('^'+semantic+'$'));
  assert.ok(legacy.length>0,semantic);
  assert.ok(legacy.every(o=>o.visible===false&&o.userData.supersededByV206===true),semantic+' must stay audit-only');
 }
 const paving=collect(root,/^IPAL_PHOTO_INTERLOCKING_PAVING$/)[0];
 assert.ok(paving&&paving.visible!==false);
});

test('V206 hardening separates adjacent utility context from the core IPAL process',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const root=buildActualFactory(layout,fleet).root;
 const group=collect(root,/^IPAL_PHOTO_ADJACENT_UTILITY_EQUIPMENT$/)[0];
 assert.ok(group);
 assert.equal(group.userData.coreProcess,false);
 assert.equal(group.userData.systemLinkage,'NOT_ASSERTED');
 assert.ok(collect(root,/^IPAL_PHOTO_ADJACENT_UTILITY_CABINET$/).length>=4);
 assert.ok(IPAL_PHOTO_EVIDENCE_V206.unresolved.includes('ADJACENT_UTILITY_EQUIPMENT_PROCESS_LINKAGE'));
});

test('V206 hardening keeps process motion off by default while ambient water and pond motion are deterministic',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root;
 assert.equal(typeof built.setIpalProcessMotion,'function');
 assert.equal(built.setIpalProcessMotion(false),false);
 assert.doesNotThrow(()=>built.update(1500));
 const fish=collect(root,/^IPAL_PHOTO_POND_FISH$/)[0];assert.ok(fish);
 const p1=[fish.position.x,fish.position.z];built.update(1500);const p2=[fish.position.x,fish.position.z];
 assert.deepEqual(p2,p1,'ambient motion must be absolute-time based and not drift');
 assert.equal(built.setIpalProcessMotion(true),true);
 built.update(2000);
 assert.equal(built.setIpalProcessMotion(false),false);
});

test('V206 hardening fixes the tank safety rail hierarchy and preserves literal photographed labels',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const root=buildActualFactory(layout,fleet).root;
 assert.ok(collect(root,/^IPAL_PHOTO_TANK_TOP_GUARDRAIL$/).length>=1);
 assert.ok(collect(root,/^IPAL_PHOTO_TANK_MID_GUARDRAIL$/).length>=1);
 assert.ok(collect(root,/^IPAL_PHOTO_TANK_GUARD_POST$/).length>=10);
 assert.ok(collect(root,/^IPAL_PHOTO_CONFINED_SPACE_WARNING_PLATE$/).length>=1);
 assert.ok(IPAL_PHOTO_EVIDENCE_V206.confirmedLabels.includes('TANGKI AN AEROBIK'));
 assert.ok(IPAL_PHOTO_EVIDENCE_V206.confirmedLabels.includes('UNIT (KARUNG) PENGERING LUMPUR'));
});


test('V206 detail pass 2 includes the photo-visible secondary equipment and service microdetails',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const root=buildActualFactory(layout,fleet).root;
 const expected=[
  ['IPAL_PHOTO_BLUE_COVERED_SERVICE_BASIN',1],
  ['IPAL_PHOTO_COVERED_BASIN_YELLOW_ACCESS_HATCH',4],
  ['IPAL_PHOTO_SECONDARY_CANOPY_GREEN_COLUMN',2],
  ['IPAL_PHOTO_SECONDARY_CANOPY_LINEAR_LIGHT',1],
  ['IPAL_PHOTO_LATTICE_COLUMN_CHORD',8],
  ['IPAL_PHOTO_SECOND_HOPPER_CONE_VESSEL',1],
  ['IPAL_PHOTO_SECOND_HOPPER_CYLINDER',1],
  ['IPAL_PHOTO_BLUE_AUXILIARY_VESSEL',2],
  ['IPAL_PHOTO_LARGE_RED_MIXING_TOWER',1],
  ['IPAL_PHOTO_SLUDGE_PVC_MANIFOLD',1],
  ['IPAL_PHOTO_SLUDGE_MANUAL_VALVE_HANDLE',5],
  ['IPAL_PHOTO_SLUDGE_DRAIN_SUMP_WALL',1],
  ['IPAL_PHOTO_TANK_EXTERNAL_WHITE_PIPE',2],
  ['IPAL_PHOTO_POND_REED',20],
  ['IPAL_PHOTO_MAINTENANCE_STOOL_SEAT',2]
 ];
 for(const [semantic,min] of expected)assert.ok(collect(root,new RegExp('^'+semantic+'$')).length>=min,semantic);
});

test('V206 detail pass 2 keeps newly reconstructed equipment footprints separated at the evidence-layout level',()=>{
 const r=IPAL_PHOTO_EVIDENCE_V206.relativeLayout;
 const box=v=>({minX:v.x-v.w/2,maxX:v.x+v.w/2,minY:v.y-v.d/2,maxY:v.y+v.d/2});
 const overlap=(a,b)=>Math.min(a.maxX,b.maxX)-Math.max(a.minX,b.minX)>0&&Math.min(a.maxY,b.maxY)-Math.max(a.minY,b.minY)>0;
 const cb=box(r.coveredServiceBasin),or=box(r.operatorRoom);
 assert.equal(overlap(cb,or),false,'covered basin must stop before operator room envelope');
 assert.ok(r.coveredServiceBasin.y<r.operatorRoom.y,'covered basin should remain on the photographed exterior/front side of operator room');
 const h=r.secondHopperVessel,rt=r.largeRedMixingTower;
 assert.ok(Math.hypot(h.x-rt.x,h.y-rt.y)>h.r+rt.r,'red tower must not overlap second hopper shell');
 const aux=r.blueAuxiliaryVessels.at(-1),rack=box(r.chemicalRack),auxBox={minX:aux.x-aux.r,maxX:aux.x+aux.r,minY:aux.y-aux.r,maxY:aux.y+aux.r};
 assert.equal(overlap(auxBox,rack),false,'auxiliary vessel must remain outside chemical rack footprint');
});

test('V206 detail pass 2 keeps the newly observed objects descriptive rather than inventing process identity',()=>{
 const observed=IPAL_PHOTO_EVIDENCE_V206.observedFeatures;
 for(const feature of ['BLUE_COVERED_SERVICE_BASIN_WITH_YELLOW_HATCHES','MULTIPLE_HOPPER_BOTTOM_METAL_VESSELS','BLUE_AUXILIARY_VERTICAL_VESSELS','LARGE_RED_MIXING_OR_PROCESS_TOWER','SLUDGE_MANIFOLD_VALVES_FLEXIBLE_HOSE_AND_DRAIN_SUMP','WHITE_EXTERNAL_TANK_NOZZLE_PIPE'])assert.ok(observed.includes(feature),feature);
 assert.ok(IPAL_PHOTO_EVIDENCE_V206.unresolved.includes('FUNCTION_OF_EACH_UNLABELLED_METAL_VESSEL'));
 assert.ok(IPAL_PHOTO_EVIDENCE_V206.unresolved.includes('EXACT_PIPE_DIAMETERS_MATERIAL_SPECS_AND_COMPLETE_ROUTING'));
});


test('V206 photo detail pass 2 includes the secondary actual-equipment groups seen across IMG_2514/2515/2517/2523/2525',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root;
 for(const semantic of [
  'IPAL_PHOTO_BLUE_COVERED_SERVICE_BASIN',
  'IPAL_PHOTO_COVERED_BASIN_YELLOW_ACCESS_HATCH',
  'IPAL_PHOTO_SECOND_HOPPER_CONE_VESSEL',
  'IPAL_PHOTO_SECOND_HOPPER_CYLINDER',
  'IPAL_PHOTO_BLUE_AUXILIARY_VESSEL',
  'IPAL_PHOTO_LARGE_RED_MIXING_TOWER',
  'IPAL_PHOTO_SLUDGE_PVC_MANIFOLD',
  'IPAL_PHOTO_SLUDGE_DRAIN_SUMP_WALL',
  'IPAL_PHOTO_TANK_EXTERNAL_WHITE_PIPE',
  'IPAL_PHOTO_SECONDARY_CANOPY_CORRUGATED_PANEL',
  'IPAL_PHOTO_SECONDARY_CANOPY_GREEN_COLUMN',
  'IPAL_PHOTO_OPERATOR_EXHAUST_FAN_RING',
  'IPAL_PHOTO_POND_REED',
  'IPAL_PHOTO_MAINTENANCE_STOOL_SEAT'
 ])assert.ok(collect(root,new RegExp('^'+semantic+'$')).length>0,semantic);
 assert.ok(IPAL_PHOTO_EVIDENCE_V206.observedFeatures.includes('BLUE_COVERED_SERVICE_BASIN_WITH_YELLOW_HATCHES'));
 assert.ok(IPAL_PHOTO_EVIDENCE_V206.observedFeatures.includes('MULTIPLE_HOPPER_BOTTOM_METAL_VESSELS'));
 assert.ok(IPAL_PHOTO_EVIDENCE_V206.observedFeatures.includes('SLUDGE_MANIFOLD_VALVES_FLEXIBLE_HOSE_AND_DRAIN_SUMP'));
});

test('V206 detail pass 2 grounds process support steel and keeps major reconstructed equipment envelopes non-penetrating',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),audit=built.root.userData.ipal.photoActual;
 assert.ok(audit.supportGroundingAudit.basePlates>=18,'base plates should be modeled on major yellow process supports');
 assert.ok(audit.supportGroundingAudit.anchorBolts>=72,'anchor bolts should physically attach base plates to the slab');
 assert.ok(audit.supportGroundingAudit.supportLegs>=18);
 assert.equal(audit.supportGroundingAudit.belowFloor,0);
 assert.equal(audit.supportGroundingAudit.floatingLegs,0);
 assert.deepEqual(audit.equipmentEnvelopeCollisions,[]);
 assert.ok(audit.equipmentMinGap>=0);
});

test('V206 detail pass 2 uses efficient batched roof corrugation and real toe-board continuity',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const root=buildActualFactory(layout,fleet).root;
 const ribs=collect(root,/^IPAL_PHOTO_CANOPY_CORRUGATION_RIBS$/);
 assert.equal(ribs.length,1,'roof corrugation should be batched into one object');
 assert.equal(ribs[0].userData.batched,true);
 assert.equal(ribs[0].userData.drawCallOptimized,true);
 assert.ok(collect(root,/^IPAL_PHOTO_HOPPER_PLATFORM_TOEBOARD$/).length>=2);
 assert.ok(collect(root,/^IPAL_PHOTO_CHEMICAL_RACK_TOEBOARD$/).length>=4);
 assert.ok(collect(root,/^IPAL_PHOTO_RED_TOWER_PLATFORM_TOEBOARD$/).length>=2);
});

test('V206 detail pass 2 gives photographed process piping visible unions instead of raw cylinder intersections',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const root=buildActualFactory(layout,fleet).root;
 assert.ok(collect(root,/UNION$/).length>=4);
 assert.ok(collect(root,/^IPAL_PHOTO_PUMP_DISCHARGE_UNION$/).length>=2);
 assert.ok(collect(root,/^IPAL_PHOTO_PUMP_TOP_UNION$/).length>=2);
 assert.ok(collect(root,/^IPAL_PHOTO_TANK_EXTERNAL_WHITE_NOZZLE$/).length>=1);
});


test('V206 microdetail pass 3 replaces primitive chemical tanks with molded shoulders and structural ribs',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const root=buildActualFactory(layout,fleet).root;
 assert.ok(collect(root,/^IPAL_PHOTO_RED_CHEMICAL_TANK_SHOULDER$/).length>=3);
 assert.ok(collect(root,/^IPAL_PHOTO_UPPER_RED_CHEMICAL_TANK_SHOULDER$/).length>=2);
 assert.ok(collect(root,/^IPAL_PHOTO_RED_CHEMICAL_TANK_MOLDED_RIB$/).length>=9);
 assert.ok(collect(root,/^IPAL_PHOTO_UPPER_RED_CHEMICAL_TANK_MOLDED_RIB$/).length>=6);
 assert.ok(collect(root,/^IPAL_PHOTO_RED_CHEMICAL_TANK_BASE_RIB$/).length>=3);
 assert.ok(collect(root,/^IPAL_PHOTO_UPPER_RED_CHEMICAL_TANK_BASE_RIB$/).length>=2);
 assert.ok(collect(root,/^IPAL_PHOTO_CHEMICAL_RACK_DIAGONAL_BRACE$/).length>=8);
 assert.ok(collect(root,/^IPAL_PHOTO_CHEMICAL_RACK_GUARD_POST$/).length>=20);
});

test('V206 microdetail pass 3 completes hopper tops and access protection instead of leaving open cylinders',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const root=buildActualFactory(layout,fleet).root;
 for(const semantic of [
  'IPAL_PHOTO_HOPPER_TOP_LID',
  'IPAL_PHOTO_HOPPER_TOP_NOZZLE',
  'IPAL_PHOTO_HOPPER_TOP_NOZZLE_FLANGE',
  'IPAL_PHOTO_SECOND_HOPPER_TOP_LID',
  'IPAL_PHOTO_SECOND_HOPPER_TOP_NOZZLE'
 ])assert.ok(collect(root,new RegExp('^'+semantic+'$')).length>0,semantic);
 assert.ok(collect(root,/^IPAL_PHOTO_HOPPER_GUARD_POST$/).length>=10);
});

test('V206 microdetail pass 3 gives the red tower a braced and guarded support frame',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const root=buildActualFactory(layout,fleet).root;
 assert.ok(collect(root,/^IPAL_PHOTO_RED_TOWER_DIAGONAL_BRACE$/).length>=4);
 assert.ok(collect(root,/^IPAL_PHOTO_RED_TOWER_GUARD_POST$/).length>=10);
 assert.ok(collect(root,/^IPAL_PHOTO_RED_TOWER_PLATFORM_TOEBOARD$/).length>=2);
});

test('V206 microdetail pass 3 completes secondary canopy drainage and photographed access-hatch hardware',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const root=buildActualFactory(layout,fleet).root;
 assert.ok(collect(root,/^IPAL_PHOTO_SECONDARY_CANOPY_GUTTER$/).length>=1);
 assert.ok(collect(root,/^IPAL_PHOTO_SECONDARY_CANOPY_DOWNPIPE$/).length>=1);
 assert.ok(collect(root,/^IPAL_PHOTO_COVERED_BASIN_HATCH_HINGE$/).length>=8);
 assert.ok(collect(root,/^IPAL_PHOTO_COVERED_BASIN_HATCH_LATCH$/).length>=4);
 assert.ok(collect(root,/^IPAL_PHOTO_SECONDARY_CANOPY_SUPPORT_BASE_PLATE$/).length>=2);
});

test('V206 microdetail pass 3 keeps collision and support audits green after adding detail',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const audit=buildActualFactory(layout,fleet).root.userData.ipal.photoActual;
 assert.deepEqual(audit.equipmentEnvelopeCollisions,[]);
 assert.equal(audit.supportGroundingAudit.belowFloor,0);
 assert.equal(audit.supportGroundingAudit.floatingLegs,0);
 assert.ok(audit.supportGroundingAudit.basePlates>=20);
 assert.ok(audit.supportGroundingAudit.anchorBolts>=80);
});


test('V206 topology correction removes unsupported open-basin water and tank ladder assumptions',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const root=buildActualFactory(layout,fleet).root;
 assert.equal(collect(root,/^IPAL_PHOTO_BAK_EKUALISASI_WATER$/).length,0);
 assert.equal(collect(root,/^IPAL_PHOTO_BAK_PENAMPUNGAN_SEMENTARA_WATER$/).length,0);
 assert.ok(collect(root,/^IPAL_PHOTO_BAK_EKUALISASI_INTERIOR_DEPTH_SHADOW$/).length>=1);
 assert.ok(collect(root,/^IPAL_PHOTO_BAK_PENAMPUNGAN_SEMENTARA_INTERIOR_DEPTH_SHADOW$/).length>=1);
 assert.equal(collect(root,/^IPAL_PHOTO_TANK_LADDER_(RAIL|RUNG)$/).length,0);
 assert.equal(IPAL_PHOTO_EVIDENCE_V206.photoTopologyRules.basinWaterSurface,'NOT_RENDERED_WHERE_PHOTOS_DO_NOT_SHOW_OPEN_WATER');
 assert.equal(IPAL_PHOTO_EVIDENCE_V206.photoTopologyRules.anaerobicAccess,'NO_VERTICAL_LADDER_ASSERTION');
});

test('V206 topology correction makes operator-room access match the photos',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const root=buildActualFactory(layout,fleet).root;
 assert.equal(collect(root,/^IPAL_PHOTO_OPERATOR_ROOM_FRONT_WINDOW$/).length,3);
 assert.equal(collect(root,/^IPAL_PHOTO_OPERATOR_ROOM_SIDE_DOOR$/).length,1);
 assert.equal(collect(root,/^IPAL_PHOTO_OPERATOR_ROOM_DOOR$/).length,0);
 assert.ok(collect(root,/^IPAL_PHOTO_SECONDARY_CANOPY_GREEN_COLUMN$/).length>=2);
 assert.equal(IPAL_PHOTO_EVIDENCE_V206.photoTopologyRules.operatorRoom,'THREE_WINDOW_FRONT_FACADE__DOOR_ON_SIDE_WALKWAY_FACADE');
});

test('V206 topology correction uses only local photo-visible pipe runs',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root,s=built.root.userData.buildingDetailStats;
 for(const semantic of ['IPAL_PHOTO_EQUALIZATION_FACADE_PIPE','IPAL_PHOTO_TEMP_HOLDING_LOCAL_RISER','IPAL_PHOTO_CHEMICAL_LOCAL_MANIFOLD','IPAL_PHOTO_TANK_TOP_LOCAL_NOZZLE'])assert.ok(collect(root,new RegExp('^'+semantic+'$')).length>0,semantic);
 assert.equal(collect(root,/^IPAL_PHOTO_PROCESS_PIPE$/).length,0);
 assert.ok(s.v206SyntheticCrossUnitPipesHidden>=5);
 assert.equal(IPAL_PHOTO_EVIDENCE_V206.photoTopologyRules.crossUnitPiping,'HIDDEN_UNLESS_CONTINUITY_IS_VISIBLE_ACROSS_PHOTOS');
});

test('V206 topology correction uses batched herringbone pavers and reduced chemical-rack density',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const built=buildActualFactory(layout,fleet),root=built.root,s=built.root.userData.buildingDetailStats;
 const paving=collect(root,/^IPAL_PHOTO_HERRINGBONE_PAVER_JOINTS$/);
 assert.equal(paving.length,1);
 assert.equal(paving[0].userData.batched,true);
 assert.ok(s.v206HerringboneSegments>500);
 assert.equal(s.v206ChemicalTankCount,5);
 assert.equal(collect(root,/^IPAL_PHOTO_RED_CHEMICAL_TANK$/).length,3);
 assert.equal(collect(root,/^IPAL_PHOTO_UPPER_RED_CHEMICAL_TANK$/).length,2);
});
