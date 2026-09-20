// Offset 5 dimensional reconstruction contract.
//
// Source hierarchy:
// 1) User-confirmed OFU-1 footprint + calibrated DXF geometry for outer envelope / module pitch.
// 2) User photos for exterior proportions and operator/drive-side relationships.
// 3) Supplied Heidelberg CD102 manuals for functional arrangement.
// 4) Heidelberg-family public technical data only as a plausibility cross-check.
//
// These values are NOT a manufacturer installation drawing for serial 550415.
// Heights of site-installed accessories (for example the FA-Swan bridge) remain photo-derived.
export const OFFSET5_DIMENSIONS=Object.freeze({
  revision:'offset5-dimensional-contract-v36',
  unit:'m',
  sourceStatus:'DXF_PLACEMENT + PHOTO_CORRECTED_INTERUNIT_ACCESS',
  structuralBody:Object.freeze({length:26.00,width:3.92,confidence:'USER_DIRECTED_CLEARANCE_CORRECTION'}),
  serviceInclusive:Object.freeze({length:27.00,width:4.60,confidence:'USER_DIRECTED_CLEARANCE_CORRECTION'}),
  repeatedPitch:Object.freeze({value:1.95,confidence:'USER_DIRECTED_CLEARANCE_CORRECTION',basis:'Expanded to preserve a supported inter-PU landing above every gripper transfer'}),
  familyCrossCheck:Object.freeze({
    pressHeight:2.17,
    straight8LengthRange:[13.91,14.39],
    feederPileHeightRange:[1.23,1.32],
    deliveryPileHeightRange:[1.205,1.295],
    status:'REFERENCE_ONLY'
  }),
  layout:Object.freeze({
    structuralMinX:-9.20,
    structuralMaxX:16.80,
    serviceMinX:-9.75,
    serviceMaxX:17.25,
    feederCenterX:-8.23,
    feederBodyLength:1.82,
    feedBoardCenterX:-6.65,
    feedBoardLength:1.40,
    firstPrintingUnitX:-5.10,
    printingUnitPitch:1.95,
    printingUnitCount:8,
    printingUnitFrameWidth:1.22,
    pu1FrameWidth:1.18,
    coaterCenterX:10.595,
    coaterLength:1.35,
    dryerCenterX:12.845,
    dryerLength:1.85,
    inspectionCenterX:13.45,
    deliveryCenterX:15.67,
    deliveryBodyLength:2.20,
    operatorWalkwayCenterZ:1.75,
    operatorWalkwayWidth:.82,
    driveWalkwayCenterZ:-1.62,
    driveWalkwayWidth:.64,
    utilityCenterZ:-2.04,
    platformLength:27.00,
    platformCenterX:3.75,
    operatorGalleryLength:23.80,
    operatorGalleryCenterX:3.40,
    driveGalleryLength:24.10,
    driveGalleryCenterX:3.25
  })
});

export const OFFSET5_UNIT_CENTERS=Object.freeze(
  Array.from({length:OFFSET5_DIMENSIONS.layout.printingUnitCount},(_,i)=>
    OFFSET5_DIMENSIONS.layout.firstPrintingUnitX+i*OFFSET5_DIMENSIONS.layout.printingUnitPitch
  )
);

export function offset5DimensionAudit(){
  const d=OFFSET5_DIMENSIONS.layout,centers=OFFSET5_UNIT_CENTERS;
  return Object.freeze({
    firstUnitX:centers[0],
    lastUnitX:centers.at(-1),
    unitPitch:d.printingUnitPitch,
    feederToBoardGap:(d.feedBoardCenterX-d.feedBoardLength/2)-(d.feederCenterX+d.feederBodyLength/2),
    boardToPU1Gap:(centers[0]-d.pu1FrameWidth/2)-(d.feedBoardCenterX+d.feedBoardLength/2),
    puGap:d.printingUnitPitch-d.printingUnitFrameWidth,
    pu1ToPU2Gap:d.printingUnitPitch-(d.pu1FrameWidth+d.printingUnitFrameWidth)/2,
    pu8ToCoaterGap:(d.coaterCenterX-d.coaterLength/2)-(centers.at(-1)+d.printingUnitFrameWidth/2),
    coaterToDryerGap:(d.dryerCenterX-d.dryerLength/2)-(d.coaterCenterX+d.coaterLength/2),
    dryerToDeliveryGap:(d.deliveryCenterX-d.deliveryBodyLength/2)-(d.dryerCenterX+d.dryerLength/2)
  });
}
