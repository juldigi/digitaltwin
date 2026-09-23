import test from 'node:test';
import assert from 'node:assert/strict';
import {loadActualPlantLayout,BASELINE_ID} from '../frontend/src/data/plant-actual.js';
import {buildActualFactory,loadFactoryFleet} from '../frontend/src/factory-building.js';

const semantics=root=>{
 const map=new Map();
 root.traverse(o=>{const s=o.userData?.semantic;if(s)map.set(s,(map.get(s)||0)+1);});
 return map;
};

test('V142 factory architecture keeps measured/user-confirmed envelope while adding reference realism',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const {root,layers}=buildActualFactory(layout,fleet);
 assert.equal(root.userData.baselineId,BASELINE_ID);
 assert.equal(root.userData.buildingDetailPass,'V198_ROOM_BY_ROOM_OPERATIONAL_REALISM_AND_PORTAL_CLEANUP');
 assert.equal(root.userData.researchVersion,'V198');
 assert.equal(root.userData.assumptions.roofEaves,4.5);
 assert.equal(root.userData.assumptions.roofRidge,7);
 assert.equal(root.userData.architecturalEvidenceBoundary.notAsBuilt,true);
 assert.equal(root.userData.architecturalEvidenceBoundary.utilityMEPActualRoutingAdded,false);
 assert.equal(layers.roof.visible,false);
 const sem=semantics(root);
 for(const [key,min] of [
  ['FLOOR_CONTROL_JOINT_REFERENCE',10],
  ['COLUMN_BASE_PLATE_REFERENCE',1],
  ['COLUMN_ANCHOR_BOLT_REFERENCE',4],
  ['PORTAL_RAFTER_REFERENCE',4],
  ['ROOF_PURLIN_REFERENCE',8],
  ['SUSPENDED_LINEAR_LED_REFERENCE',30],
  ['MAIN_ROOF_GUTTER_REFERENCE',4],
  ['MAIN_ROOF_DOWNPIPE_REFERENCE',4],
  ['DOCK_LEVELLER_REFERENCE',1],
  ['IPAL_X_BRACE_REFERENCE',4],
  ['IPAL_WALKWAY_HANDRAIL_REFERENCE',2]
 ])assert.ok((sem.get(key)||0)>=min,key+' missing/regressed');
});

test('V142 realism does not turn prepared MEP scaffolds into invented as-built routing',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const {root,utilityRouting}=buildActualFactory(layout,fleet);
 assert.equal(utilityRouting.mode,'TEMPLATE_ONLY');
 assert.equal(utilityRouting.actualRoutingApplied,false);
 assert.ok(utilityRouting.systems.length>=3);
 assert.ok(utilityRouting.systems.every(s=>s.actualRouteVerified===false));
 assert.match(root.userData.assumptions.utilityRoutingBoundary,/UTILITY_MODELS_RETAINED_FOR_EXPANSION_BUT_HIDDEN_IN_PHASE1_UI/);
});

test('V142 IPAL remains open-sided while receiving only structural/service reference detail',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const {root}=buildActualFactory(layout,fleet);
 assert.equal(root.userData.ipal.enclosingWalls,0);
 assert.equal(root.userData.ipal.openSides,true);
 assert.ok(root.userData.ipal.removedSourceWallSegments>=0);
 assert.ok(root.userData.ipal.structuralReference.xBracing>0);
 assert.ok(root.userData.ipal.structuralReference.guardrailElements>0);
 const sem=semantics(root);
 assert.ok((sem.get('IPAL_OPEN_FRAME_COLUMN')||0)>0);
 assert.ok((sem.get('IPAL_X_BRACE_REFERENCE')||0)>0);
 assert.equal(sem.get('IPAL_ENCLOSING_WALL')||0,0);
});

test('V142 press-room envelopes remain centered on their validated machine placements',async()=>{
 const [layout,fleet]=await Promise.all([loadActualPlantLayout(),loadFactoryFleet()]);
 const {root}=buildActualFactory(layout,fleet);
 assert.ok(root.userData.offsetRooms.length>=5);
 for(const r of root.userData.offsetRooms)assert.ok(r.centerError<1e-9,r.machineId+' room center drifted');
});
