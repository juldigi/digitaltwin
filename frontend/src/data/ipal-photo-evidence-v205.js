export const IPAL_PHOTO_EVIDENCE_V205=Object.freeze({
 version:'V205_IPAL_PHOTO_ACTUAL_20260924',
 sourceArchive:'IPAL.zip',
 sourcePhotos:Object.freeze(Array.from({length:15},(_,i)=>`IMG_${2511+i}`)),
 evidenceClass:'USER_SUPPLIED_CURRENT_PLANT_PHOTOGRAPHY',
 dimensionalStatus:'RELATIVE_VISUAL_RECONSTRUCTION_ONLY__NO_SURVEYED_ABSOLUTE_DIMENSIONS',
 processStatus:'VISUAL_EQUIPMENT_IDENTITY_ONLY__NO_UNVERIFIED_PID_CHEMISTRY_CAPACITY_OR_PIPE_DIAMETER_CLAIMS',
 verified:Object.freeze({
  openSides:true,
  mainCanopy:'OPEN_STEEL_FRAME_SHALLOW_CURVED_CORRUGATED_ROOF_WITH_TRANSLUCENT_STRIPS',
  operatorServiceBuilding:true,
  equalizationVisibleLabel:'BAK EKUALISASI',
  temporaryHoldingVisibleLabel:'BAK PENAMPUNGAN SEMENTARA',
  largeTankLiteralVisibleLabel:'TANGKI AN AEROBIK',
  confinedSpaceWarningVisible:true,
  sludgeUnitLiteralVisibleLabel:'UNIT (KARUNG) PENGERING LUMPUR',
  sludgeFilterBagsVisible:true,
  redProcessOrChemicalTanksVisible:true,
  coneBottomMetalVesselVisible:true,
  yellowPlatformsStairsAndGuardrailsVisible:true,
  pvcAndMetalPipingVisible:true,
  pumpsAndMotorsVisible:true,
  verticalGardenVisible:true,
  ornamentalPondAndFishVisible:true,
  adjacentUtilityEquipmentVisible:true
 }),
 unresolved:Object.freeze([
  'ABSOLUTE_EQUIPMENT_DIMENSIONS_AND_ELEVATIONS',
  'EXACT_PIPE_DIAMETERS_MATERIAL_SPECS_AND_ALL_ROUTING',
  'COMPLETE_PID_AND_PROCESS_FLOW_DIRECTION',
  'CHEMICAL_IDENTITIES_AND_DOSING_RATES',
  'TANK_CAPACITIES_AND_INTERNALS',
  'FUNCTION_OF_EACH_UNLABELLED_METAL_VESSEL',
  'PROCESS_NORMALIZATION_OF_LITERAL_TANK_TEXT_AN_AEROBIK',
  'ADJACENT_UTILITY_SYSTEM_LINKAGE'
 ])
});
