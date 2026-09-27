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
  revision:'offset5-dimensional-contract-v251',
  unit:'m',
  sourceStatus:'PHOTO_RECALIBRATED_COMPACT_CD102_8L + OEM_102_FAMILY_CROSSCHECK + DXF_PLACEMENT_ONLY',
  structuralBody:Object.freeze({length:18.20,width:3.45,confidence:'PHOTO_RECALIBRATED_REFERENCE_ENVELOPE_NOT_SERIAL_SURVEY'}),
  serviceInclusive:Object.freeze({length:19.10,width:4.20,confidence:'PHOTO_RECALIBRATED_SERVICE_ENVELOPE_NOT_SERIAL_SURVEY'}),
  repeatedPitch:Object.freeze({value:1.23,confidence:'HEIDELBERG_102_FAMILY_PROPORTION_CROSSCHECK',basis:'Compact repeated press-body pitch; operator access is side-mounted and no longer represented as a full-width structural gap'}),
  familyCrossCheck:Object.freeze({
    pressHeight:2.17,
    straight8LengthRange:[13.91,14.39],
    feederPileHeightRange:[1.23,1.32],
    deliveryPileHeightRange:[1.205,1.295],
    status:'REFERENCE_ONLY',
    sx102Straight8Envelope:Object.freeze({length:15.97,width:3.93,height:2.15,source:'HEIDELBERG_SX102_CURRENT_FAMILY_REFERENCE'}),
    cd102SixPlusCoaterReferenceLength:15.85,
    cd102InstalledEightPlusCoaterExactLength:'UNVERIFIED'
  }),
  layout:Object.freeze({
    structuralMinX:-7.70,
    structuralMaxX:10.50,
    serviceMinX:-8.15,
    serviceMaxX:10.95,
    feederCenterX:-6.95,
    feederBodyLength:1.65,
    feedBoardCenterX:-5.55,
    feedBoardLength:1.15,
    firstPrintingUnitX:-4.35,
    printingUnitPitch:1.23,
    printingUnitCount:8,
    printingUnitFrameWidth:1.05,
    pu1FrameWidth:1.05,
    coaterCenterX:5.55,
    coaterLength:1.05,
    dryerCenterX:6.95,
    dryerLength:1.35,
    inspectionCenterX:7.45,
    deliveryCenterX:9.25,
    deliveryBodyLength:2.20,
    operatorWalkwayCenterZ:1.58,
    operatorWalkwayWidth:.72,
    driveWalkwayCenterZ:-1.56,
    driveWalkwayWidth:.62,
    utilityCenterZ:-1.93,
    platformLength:19.10,
    platformCenterX:1.40,
    operatorGalleryLength:16.85,
    operatorGalleryCenterX:1.15,
    driveGalleryLength:16.95,
    driveGalleryCenterX:1.12
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
