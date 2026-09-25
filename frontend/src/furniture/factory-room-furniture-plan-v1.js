/**
 * BMJ Packaging Offset Digital Twin — Room Furniture Program v1
 * --------------------------------------------------------------------------
 * Data-only room program / placement intent. It does NOT touch the application.
 * Use this as the merge contract for factory-building.js or a future room-props module.
 *
 * Positioning is expressed in normalized room-local anchors rather than hardcoded
 * world coordinates. The merger should resolve anchors against the actual room
 * envelope, door/swing zones, machine/service clearance and source CAD labels.
 */

export const ROOM_FURNITURE_PLAN_VERSION = 'RFP-V1-2026-09-25';
export const PLAN_ACCURACY = 'INDUSTRIAL_REALISM_REFERENCE_NOT_AS_BUILT';

export const REALISM_RULES = Object.freeze({
  floorContactToleranceM: 0.015,
  objectOverlapToleranceM: 0.025,
  wallPenetrationToleranceM: 0.015,
  defaultWallSetbackM: 0.06,
  doorKeepClearDepthM: 0.90,
  taskChairPullbackM: 0.72,
  visitorChairPullbackM: 0.62,
  mobileCartManeuverMarginM: 0.45,
  warehouseAisleRule: 'DO_NOT_HARDCODE_CODE_MINIMUMS; preserve source/layout clearances and OSHA-style clear unobstructed marked paths.',
  electricalRoomRule: 'No storage or furniture may obstruct electrical panels, controls, doors or required working clearances.',
  materialRule: 'Use differentiated PBR materials; do not render all furniture with one generic grey material.',
  geometryRule: 'No large visible furniture surface should remain a featureless cuboid when the real object has doors, joints, seams, handles, vents, frames, casters, fasteners or recesses.',
  placementRule: 'Furniture must be functionally oriented: chairs face work surfaces, monitors face users, cabinets open into clear space, carts align to working aisles, racks expose pick faces to aisles.',
  uncertaintyRule: 'Without field photos/measured data, label every object as realistic reference rather than as-built plant evidence.'
});

const A = (wall, offsetAlong = 0, offsetFromWall = 0.08) => ({ type: 'wallAnchor', wall, offsetAlong, offsetFromWall });
const C = (x = 0, z = 0) => ({ type: 'roomNormalized', x, z });
const F = (toward) => ({ facing: toward });

export const ROOM_FURNITURE_PROGRAMS = Object.freeze({
  ADMIN_OFFICE: {
    required: [
      { kind: 'officeDesk', qty: 1, anchor: A('workWall', 0, 0.10), ...F('roomCenter') },
      { kind: 'taskChair', qty: 1, anchor: C(0, 0.28), ...F('officeDesk') },
      { kind: 'mobilePedestal', qty: 1, anchor: A('workWall', 0.35, 0.10) },
      { kind: 'credenza', qty: 1, anchor: A('storageWall', 0, 0.08), ...F('roomCenter') },
      { kind: 'planningBoard', qty: 1, anchor: A('visualWall', 0, 0.025), mountHeightM: 1.35 },
      { kind: 'wasteStation', qty: 1, options: { count: 1, binWidth: 0.31, depth: 0.34, height: 0.55 }, anchor: A('storageWall', -0.38, 0.10) }
    ],
    optional: [
      { kind: 'visitorChair', qty: 2, anchor: C(0, -0.28), ...F('officeDesk') },
      { kind: 'mfp', qty: 1, anchor: A('equipmentWall', 0, 0.10), ...F('roomCenter') }
    ],
    visualNotes: ['Workstation must read as a real office assembly, not desk blocks.', 'Keep floor area around task chair visibly usable.', 'Cable tray/grommet/pedestal should be visible at close LOD.']
  },

  PPIC_OFFICE: {
    required: [
      { kind: 'officeDesk', qty: 2, anchor: A('workWall', 0, 0.10), layout: 'side-by-side', ...F('roomCenter') },
      { kind: 'taskChair', qty: 2, layout: 'paired-to-desks', ...F('officeDesk') },
      { kind: 'planningBoard', qty: 1, options: { width: 2.1, height: 1.0 }, anchor: A('visualWall', 0, 0.025), mountHeightM: 1.30 },
      { kind: 'credenza', qty: 1, anchor: A('storageWall', 0, 0.08), ...F('roomCenter') },
      { kind: 'mfp', qty: 1, anchor: A('equipmentWall', 0, 0.10), ...F('roomCenter') }
    ],
    optional: [{ kind: 'visitorChair', qty: 2, layout: 'briefing-pair', ...F('planningBoard') }],
    visualNotes: ['Planning board is a core PPIC visual cue.', 'Printer should be floor-standing with scanner/ADF/control panel/paper drawers.']
  },

  SUPERVISOR_OFFICE: {
    required: [
      { kind: 'officeDesk', qty: 1, anchor: A('workWall', 0, 0.10), ...F('roomCenter') },
      { kind: 'taskChair', qty: 1, ...F('officeDesk') },
      { kind: 'visitorChair', qty: 2, layout: 'front-of-desk', ...F('officeDesk') },
      { kind: 'credenza', qty: 1, anchor: A('storageWall', 0, 0.08), ...F('roomCenter') }
    ],
    optional: [{ kind: 'planningBoard', qty: 1, anchor: A('visualWall', 0, 0.025), mountHeightM: 1.35 }]
  },

  MEETING: {
    required: [
      { kind: 'planningBoard', qty: 1, options: { width: 2.1, height: 0.95 }, anchor: A('presentationWall', 0, 0.025), mountHeightM: 1.30 },
      { kind: 'visitorChair', qty: 6, layout: 'meeting-table-perimeter', ...F('roomCenter') }
    ],
    specialGeometry: [{ kind: 'meetingTable', dimensionsM: [2.20, 0.74, 0.95], shape: 'rounded-rectangle-or-racetrack', material: 'lightLaminate + powderDark frame' }],
    visualNotes: ['All chairs must face the table; no chairs turned into walls.', 'Presentation wall must remain visually clear.']
  },

  PDS_PREPRESS_OFFICE: {
    required: [
      { kind: 'officeDesk', qty: 1, anchor: A('workWall', 0, 0.10), ...F('roomCenter') },
      { kind: 'taskChair', qty: 1, ...F('officeDesk') },
      { kind: 'flatFile', qty: 1, anchor: A('storageWall', 0, 0.08), ...F('roomCenter') },
      { kind: 'plateTrolley', qty: 1, anchor: A('equipmentWall', 0, 0.14), ...F('clearAisle') }
    ],
    optional: [{ kind: 'planningBoard', qty: 1, anchor: A('visualWall', 0, 0.025), mountHeightM: 1.35 }],
    visualNotes: ['Flat-file drawers should be shallow and numerous, with handles and label holders.', 'Plate trolley must have separated vertical slots and real casters.']
  },

  PREPRESS: {
    required: [
      { kind: 'officeDesk', qty: 1, options: { width: 1.40, depth: 0.70 }, anchor: A('operatorWall', 0, 0.10), ...F('equipmentZone') },
      { kind: 'taskChair', qty: 1, ...F('officeDesk') },
      { kind: 'plateTrolley', qty: 1, anchor: A('equipmentWall', 0, 0.16), ...F('clearAisle') },
      { kind: 'flatFile', qty: 1, anchor: A('storageWall', 0, 0.08), ...F('roomCenter') }
    ],
    specialGeometry: [{ kind: 'lightInspectionTable', dimensionsM: [1.20, 0.82, 0.70], material: 'powder-coated frame + luminous translucent work surface' }]
  },

  QC_SAMPLE: {
    required: [
      { kind: 'qcBench', qty: 1, anchor: A('inspectionWall', 0, 0.12), ...F('roomCenter') },
      { kind: 'labStool', qty: 1, anchor: C(0, 0.30), ...F('qcBench') },
      { kind: 'flatFile', qty: 1, options: { width: 0.95, depth: 0.58, height: 0.78 }, anchor: A('sampleStorageWall', 0, 0.08), ...F('roomCenter') },
      { kind: 'planningBoard', qty: 1, options: { width: 1.20, height: 0.75 }, anchor: A('visualWall', 0, 0.025), mountHeightM: 1.35 }
    ],
    optional: [{ kind: 'officeDesk', qty: 1, options: { width: 1.25, depth: 0.65 }, anchor: A('operatorWall', 0, 0.10), ...F('roomCenter') }],
    visualNotes: ['Use real light-booth proportions; interior neutral grey and top diffuser must be readable.', 'Sample trays should look shallow, not like solid blocks.']
  },

  INCOMING_QC: {
    required: [
      { kind: 'qcBench', qty: 1, anchor: A('inspectionWall', 0, 0.12), ...F('roomCenter') },
      { kind: 'labStool', qty: 1, ...F('qcBench') },
      { kind: 'platformTrolley', qty: 1, options: { width: 0.95, depth: 0.62 }, anchor: A('stagingWall', 0, 0.15), ...F('clearAisle') },
      { kind: 'planningBoard', qty: 1, options: { width: 1.20, height: 0.75 }, anchor: A('visualWall', 0, 0.025), mountHeightM: 1.35 }
    ]
  },

  SPAREPART_WAREHOUSE: {
    required: [
      { kind: 'spareRack', qty: 'fit-by-room', layout: 'parallel-pick-faces', ...F('pickingAisle') },
      { kind: 'workbench', qty: 1, options: { width: 1.50, depth: 0.70 }, anchor: A('serviceWall', 0, 0.10), ...F('roomCenter') },
      { kind: 'toolCart', qty: 1, anchor: A('serviceWall', 0.40, 0.18), ...F('pickingAisle') },
      { kind: 'planningBoard', qty: 1, options: { width: 1.10, height: 0.70 }, anchor: A('visualWall', 0, 0.025), mountHeightM: 1.35 }
    ],
    visualNotes: ['Bins need open hopper fronts, lips and label windows.', 'Racks need actual uprights, slots, shelves, guards and visible pick face.', 'Heavy items visually belong on lower levels.']
  },

  WORKSHOP: {
    required: [
      { kind: 'workbench', qty: 1, anchor: A('workWall', 0, 0.10), ...F('roomCenter') },
      { kind: 'toolCabinet', qty: 1, anchor: A('storageWall', 0, 0.08), ...F('roomCenter') },
      { kind: 'toolCart', qty: 1, anchor: A('workWall', 0.45, 0.16), ...F('clearAisle') },
      { kind: 'wasteStation', qty: 1, options: { count: 2, height: 0.60 }, anchor: A('utilityWall', 0, 0.10) }
    ],
    visualNotes: ['Workbench top must be 40 mm-class multiplex/wood, not a paper-thin slab.', 'Vise requires body, jaws, screw/bar; cabinets need actual drawer/door segmentation.']
  },

  MAINTENANCE: {
    required: [
      { kind: 'workbench', qty: 1, anchor: A('workWall', 0, 0.10), ...F('roomCenter') },
      { kind: 'toolCabinet', qty: 2, layout: 'storage-wall-bank', ...F('roomCenter') },
      { kind: 'spareRack', qty: 1, options: { width: 0.95, depth: 0.44, height: 1.90, levels: 5 }, anchor: A('partsWall', 0, 0.08), ...F('pickingAisle') },
      { kind: 'toolCart', qty: 1, anchor: A('workWall', 0.45, 0.16), ...F('clearAisle') }
    ]
  },

  PANTRY: {
    required: [
      { kind: 'pantryRun', qty: 1, anchor: A('wetWall', 0, 0.02), ...F('roomCenter') },
      { kind: 'wasteStation', qty: 1, options: { count: 2, binWidth: 0.30, depth: 0.34, height: 0.55 }, anchor: A('utilityWall', 0, 0.08) }
    ],
    specialGeometry: [
      { kind: 'breakTable', dimensionsM: [1.20, 0.74, 0.70], shape: 'rounded-rectangle', material: 'laminate + powder-coated steel' },
      { kind: 'breakChair', qty: 4, dimensionsM: [0.45, 0.80, 0.48], shape: 'simple molded/stackable chair' }
    ],
    optional: [
      { kind: 'countertopMicrowave', dimensionsM: [0.50, 0.31, 0.40] },
      { kind: 'waterDispenser', dimensionsM: [0.32, 1.05, 0.34] }
    ],
    visualNotes: ['Only include appliances if space exists; never let them float or intersect upper cabinets.', 'Sink must include bowl/rim/faucet rather than a dark rectangle on the counter.']
  },

  LOCKER_CHANGE: {
    required: [
      { kind: 'lockerBank', qty: 'fit-by-wall', layout: 'continuous-bank', ...F('roomCenter') },
      { kind: 'lockerBench', qty: 1, anchor: C(0, 0), ...F('lockerBank') },
      { kind: 'shoeRack', qty: 1, options: { width: 1.10, depth: 0.34, height: 1.10 }, anchor: A('shoeWall', 0, 0.06), ...F('roomCenter') }
    ],
    visualNotes: ['Locker doors require vents, recessed handles/hasps, number plates and realistic legs/plinth.', 'Bench height should read as human seating scale, not a low box.']
  },

  TOILET: {
    required: [
      { kind: 'restroomSet', qty: 1, anchor: A('washWall', 0, 0.02) }
    ],
    specialGeometry: [
      { kind: 'lavatory', dimensionsM: [0.55, 0.83, 0.45], material: 'vitreous ceramic/china + chrome faucet' },
      { kind: 'floorDrain', dimensionsM: [0.12, 0.01, 0.12], material: 'stainless grating' },
      { kind: 'toiletCubicleHardware', elements: ['door', 'hinges', 'latch', 'feet', 'coat hook'] }
    ],
    visualNotes: ['Restroom accessories should use brushed stainless or proper molded dispensers, not generic wall blocks.']
  },

  PRAYER_ROOM: {
    required: [
      { kind: 'shoeRack', qty: 1, anchor: A('entryWall', 0, 0.06), ...F('entry') },
      { kind: 'prayerBench', qty: 1, anchor: A('entryWall', 0.35, 0.08), ...F('roomCenter') },
      { kind: 'prayerMat', qty: 'fit-by-room', layout: 'parallel-aligned-rows' }
    ],
    visualNotes: ['Keep the room visually calm; do not clutter it with speculative decorative objects.', 'Prayer mats must lie flush on the floor and align consistently.']
  },

  JANITOR: {
    required: [
      { kind: 'serviceSink', qty: 1, anchor: A('wetWall', 0, 0.02), ...F('roomCenter') },
      { kind: 'housekeepingCart', qty: 1, anchor: A('parkingWall', 0, 0.12), ...F('door') }
    ],
    specialGeometry: [
      { kind: 'mopToolRack', dimensionsM: [0.75, 0.12, 0.08], mountHeightM: 1.45, elements: ['rail', 'rubber grips', 'hooks'] },
      { kind: 'chemicalCabinet', dimensionsM: [0.55, 1.55, 0.40], material: 'powder-coated steel', elements: ['lock', 'vents', 'shelves', 'warning-label-area'] }
    ],
    visualNotes: ['Service sink must show real rim, deep bowl, backsplash, drain and wall supports.', 'Housekeeping cart must include molded base/storage tower/shelves/bag frame/casters.']
  },

  DISPATCH_LOADING: {
    required: [
      { kind: 'officeDesk', qty: 1, options: { width: 1.35, depth: 0.70 }, anchor: A('operatorWall', 0, 0.10), ...F('loadingArea') },
      { kind: 'taskChair', qty: 1, ...F('officeDesk') },
      { kind: 'platformTrolley', qty: 1, anchor: A('stagingWall', 0, 0.18), ...F('loadingRoute') },
      { kind: 'palletJack', qty: 1, anchor: A('equipmentParkingWall', 0, 0.22), ...F('loadingRoute') },
      { kind: 'statusBoard', qty: 1, options: { width: 1.30, height: 0.80 }, anchor: A('visualWall', 0, 0.025), mountHeightM: 1.35 }
    ],
    exteriorAdjacent: [
      { kind: 'bollard', qty: 'door-protection-pair' },
      { kind: 'wheelChock', qty: 2 },
      { kind: 'convexMirror', qty: 1, mountHeightM: 2.20 }
    ]
  },

  ELECTRICAL: {
    required: [],
    specialGeometry: [
      { kind: 'wallDocumentHolder', dimensionsM: [0.34, 0.44, 0.06], material: 'powder-coated steel/acrylic' },
      { kind: 'insulatingMatReference', placement: 'only where appropriate and never asserted as code compliance' }
    ],
    visualNotes: ['Intentionally sparse room.', 'Do not add desks, cartons, spare-part racks or decorative clutter in front of electrical equipment.']
  },

  FIRE_PUMP_ROOM: {
    required: [],
    specialGeometry: [{ kind: 'maintenanceLogHolder', dimensionsM: [0.30, 0.38, 0.05], mountHeightM: 1.45 }],
    visualNotes: ['Keep service paths around pumps/valves clear; no speculative storage furniture.']
  },

  BROKE_WASTE_ROOM: {
    required: [
      { kind: 'wasteStation', qty: 1, options: { count: 3, binWidth: 0.42, depth: 0.50, height: 0.76 }, anchor: A('collectionWall', 0, 0.12), ...F('roomCenter') },
      { kind: 'platformTrolley', qty: 1, options: { width: 0.95, depth: 0.70 }, anchor: A('parkingWall', 0, 0.16), ...F('door') }
    ],
    visualNotes: ['Bins need lids/openings/labels and wheels or feet as appropriate.', 'Keep floor visibly free of random loose blocks.']
  }
});

export const PRODUCTION_SUPPORT_PROGRAMS = Object.freeze({
  PRINTING: {
    required: [
      { kind: 'proofRack', qtyPerSelectedArea: 1 },
      { kind: 'consumablesCabinet', qtyPerSelectedArea: 1 },
      { kind: 'paperboardPallet', qty: 'contextual-only' }
    ],
    rules: ['Outside press service clearance.', 'Proof rack faces operator aisle.', 'Consumables cabinet doors must face usable clear space.']
  },
  CUTTING_SHEETING: {
    required: [
      { kind: 'sheetTrolley', qtyPerSelectedArea: 1 },
      { kind: 'wasteStation', qtyPerSelectedArea: 1, options: { count: 1, binWidth: 0.55, depth: 0.62, height: 0.75 } }
    ],
    rules: ['Paper stack stays below trolley rails.', 'Caster wheels touch floor; trolley must not overlap cutter service zone.']
  },
  AUTOPLATEN: {
    required: [{ kind: 'dieTrolley', qtyPerSelectedArea: 1 }],
    rules: ['Trolley rails/slots clearly support tools; do not use floating rectangular die blocks.', 'Park parallel to line-side aisle.']
  },
  FOLDER_GLUER: {
    required: [{ kind: 'cartonBlankTrolley', qtyPerSelectedArea: 1 }],
    rules: ['Blank stacks remain supported by base and side rails.', 'Avoid excessively high loads that read as unstable.']
  },
  RMS_WAREHOUSE: {
    required: [
      { kind: 'paperboardPallet', qty: 'source-contextual' },
      { kind: 'reelCradle', qty: 'source-contextual' },
      { kind: 'palletJack', qty: 'parking-only' },
      { kind: 'floorScale', qty: 1 },
      { kind: 'convexMirror', qty: 'blind-intersections-only' },
      { kind: 'statusBoard', qty: 1 }
    ],
    optional: [{ kind: 'stretchWrapper', qty: 1, onlyIf: 'dispatch/wrapping function actually belongs to zone' }],
    rules: ['Permanent travel paths remain clear and visually marked.', 'Pallet loads must be stable, supported and never float.', 'Reels sit in real cradles/chocks; no free-rolling cylinders on the floor.']
  },
  FINISHED_GOODS: {
    required: [
      { kind: 'paperboardPallet', qty: 'staging-based' },
      { kind: 'palletJack', qty: 'parking-only' },
      { kind: 'statusBoard', qty: 1 }
    ],
    optional: [{ kind: 'stretchWrapper', qty: 1, onlyIf: 'actual process confirmed' }],
    rules: ['Pallet labels and corner protectors should be visible at close range.', 'No pallet jack parked across pedestrian or vehicle path.']
  }
});

export const EXTERIOR_ACCESSORY_PROGRAM = Object.freeze({
  loadingDock: [
    { kind: 'bollard', rule: 'pair outside wide doors/dock edges where protection is appropriate' },
    { kind: 'wheelChock', rule: 'parking position at dock; do not leave random wedge blocks in travel path' },
    { kind: 'convexMirror', rule: 'blind corner only' },
    { kind: 'dockSignage', elements: ['clearance', 'pedestrian', 'loading-status'], rule: 'reference signage only unless actual text known' }
  ],
  buildingPerimeter: [
    { kind: 'weatherproofWasteBin', rule: 'only near staff access/service areas, not scattered decoratively' },
    { kind: 'hoseCabinetOrReel', rule: 'only if source/field evidence supports fire/service function' },
    { kind: 'equipmentBollard', rule: 'protect external utility equipment where appropriate' }
  ],
  ipalServiceContext: [
    { kind: 'maintenanceStool', rule: 'only where photo evidence exists' },
    { kind: 'serviceBucket', rule: 'only where photo evidence exists' },
    { kind: 'chemicalStorageOrRack', rule: 'use IPAL photo-evidence module, not generic furniture library' }
  ]
});

export function getRoomFurnitureProgram(program) {
  return ROOM_FURNITURE_PROGRAMS[program] || null;
}

export function validateProgramNames(programs = ROOM_FURNITURE_PROGRAMS) {
  const errors = [];
  for (const [name, spec] of Object.entries(programs)) {
    if (!Array.isArray(spec.required)) errors.push(`${name}: required must be an array`);
    for (const item of [...(spec.required || []), ...(spec.optional || [])]) {
      if (!item.kind) errors.push(`${name}: furniture item missing kind`);
    }
  }
  return errors;
}