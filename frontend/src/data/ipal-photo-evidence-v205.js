export const IPAL_PHOTO_EVIDENCE_V205=Object.freeze({
 version:'V205',
 sourceArchive:'IPAL.zip',
 reviewDate:'2026-09-24',
 photoCount:15,
 files:Object.freeze(Array.from({length:15},(_,i)=>`IMG_${2511+i}.HEIC`)),
 confidencePolicy:Object.freeze({
  topology:'PHOTO_DERIVED_RELATIVE_LAYOUT',
  dimensions:'APPROXIMATE_FROM_PHOTOS_NOT_SURVEYED',
  processNames:'ONLY_WHEN_LABEL_OR_VISUAL_EVIDENCE_SUPPORTS_NAME',
  piping:'PHOTO_DERIVED_VISUAL_ROUTING_NOT_PID',
  materials:'PHOTO_DERIVED_VISUAL_MATCH',
  simulation:'FUNCTIONAL_VISUALIZATION_ONLY_NOT_PROCESS_CALCULATION'
 }),
 confirmedLabels:Object.freeze([
  'BAK EKUALISASI',
  'BAK PENAMPUNGAN SEMENTARA',
  'TANGKI AN AEROBIK',
  'UNIT (KARUNG) PENGERING LUMPUR',
  'BAHAYA! RUANG TERBATAS DILARANG MASUK',
  'BERACUN'
 ]),
 observedFeatures:Object.freeze([
  'OPEN_SIDED_STEEL_CANOPY',
  'CORRUGATED_METAL_AND_TRANSLUCENT_ROOF',
  'WHITE_OPERATOR_SERVICE_ROOM',
  'BLUE_CONCRETE_PROCESS_BASINS',
  'LARGE_VERTICAL_METAL_TANK',
  'HOPPER_BOTTOM_METAL_VESSEL',
  'TWO_LEVEL_YELLOW_CHEMICAL_RACK',
  'RED_POLY_CHEMICAL_TANKS',
  'SLUDGE_DEWATERING_BAGS',
  'PVC_AND_METAL_PROCESS_PIPING',
  'YELLOW_STAIRS_PLATFORMS_GUARDRAILS',
  'PUMPS_VALVES_NOZZLES_AND_PIPE_SUPPORTS',
  'INTERLOCKING_PAVING_AND_DRAINAGE',
  'VERTICAL_GARDEN',
  'ORNAMENTAL_WATER_CHANNEL',
  'WEATHERED_INDUSTRIAL_FINISHES'
 ]),
 relativeLayout:Object.freeze({
  equalization:{x:36.2,y:107.0,w:5.6,d:4.2,h:1.15,label:'BAK EKUALISASI'},
  temporaryHolding:{x:41.6,y:108.3,w:3.2,d:2.7,h:.95,label:'BAK PENAMPUNGAN SEMENTARA'},
  anaerobicTank:{x:45.7,y:111.0,r:2.05,h:4.0,label:'TANGKI AN AEROBIK'},
  hopperVessel:{x:41.5,y:114.2,r:1.45,cylinderH:2.3,coneH:1.25},
  chemicalRack:{x:53.2,y:109.7,w:6.1,d:4.2,h:3.6},
  sludgeDrying:{x:36.2,y:114.8,w:5.0,d:2.25,h:1.55},
  operatorRoom:{x:57.2,y:105.8,w:4.4,d:3.25,h:2.85},
  pond:{x:50.1,y:116.6,w:8.0,d:1.0},
  verticalGarden:{x:34.0,y:117.15,w:8.2,h:2.0}
 })
});
