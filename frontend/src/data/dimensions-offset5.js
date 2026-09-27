// Offset 5 dimensional reconstruction contract.
//
// Source hierarchy:
// 1) BMJ user photographs and confirmed installed identity: CD 102-8+L / OFU-1 / serial 550415.
// 2) Supplied Heidelberg CD/SM102 service documentation for functional topology.
// 3) HEIDELBERG 102-format technical data and SM102 installation tables for dimensional plausibility.
// 4) External CD102 family photographs only for silhouette/access cross-checks.
//
// IMPORTANT: the exact serial-550415 installation drawing is still unavailable. The prior 1.95 m
// printing-unit pitch and 26–27 m body were removed because they elongated the press far beyond the
// 102-platform family geometry. Human access is represented on the side galleries / seam bridges,
// not by stretching the cylinder-to-cylinder process pitch.
export const OFFSET5_DIMENSIONS=Object.freeze({
  revision:'offset5-dimensional-contract-v37-reality-recalibration',
  unit:'m',
  sourceStatus:'BMJ_PHOTO_IDENTITY + OEM_FUNCTION + 102_FORMAT_DIMENSION_CROSSCHECK',
  structuralBody:Object.freeze({length:18.50,width:3.05,confidence:'PHOTO_EXTENSION_RECONSTRUCTION_CROSSCHECKED_TO_CD102_8LX_FAMILY'}),
  serviceInclusive:Object.freeze({length:19.25,width:4.76,confidence:'VISUAL_SERVICE_ENVELOPE_NOT_FOUNDATION_CLEARANCE'}),
  repeatedPitch:Object.freeze({
    value:1.22,
    confidence:'102_PLATFORM_FAMILY_INCREMENT_CROSSCHECK',
    basis:'SM102 installation tables increase one printing unit by 1220 mm; BMJ inter-unit access is modeled outside the cylinder pitch rather than inflating the process train'
  }),
  familyCrossCheck:Object.freeze({
    pressHeight:2.17,
    maxSheet:[.72,1.02],
    maxOutputSph:15000,
    sm102EightPlusLPresetLength:15.61,
    sm102EightPlusLXPresetLength:18.05,
    sm102EightPlusLMinimumWorkingSpace:[20.74,6.28],
    sx102EightUnitSampleLength:15.95,
    sx102EightUnitSampleWidth:3.33,
    feederPileHeightRange:[1.23,1.32],
    deliveryPileHeightRange:[1.205,1.295],
    status:'FAMILY_CROSSCHECK_NOT_SERIAL_550415_INSTALLATION_DRAWING'
  }),
  layout:Object.freeze({
    structuralMinX:-8.15,
    structuralMaxX:10.35,
    serviceMinX:-8.55,
    serviceMaxX:10.70,
    feederCenterX:-7.20,
    feederBodyLength:1.82,
    feedBoardCenterX:-5.65,
    feedBoardLength:1.25,
    firstPrintingUnitX:-4.00,
    printingUnitPitch:1.22,
    printingUnitCount:8,
    printingUnitFrameWidth:1.10,
    pu1FrameWidth:1.10,
    coaterCenterX:5.72,
    coaterLength:1.10,
    dryerCenterX:7.25,
    dryerLength:1.70,
    inspectionCenterX:7.92,
    deliveryCenterX:9.35,
    deliveryBodyLength:2.10,
    // Pre-mirror local coordinates: OffsetMachineTemplate.alignOperatorSide() mirrors lateral handedness
    // so the final world orientation remains operator side = -Z and drive side = +Z.
    operatorWalkwayCenterZ:1.78,
    operatorWalkwayWidth:.78,
    driveWalkwayCenterZ:-1.62,
    driveWalkwayWidth:.60,
    utilityCenterZ:-2.10,
    platformLength:19.25,
    platformCenterX:1.075,
    operatorGalleryLength:18.70,
    operatorGalleryCenterX:1.00,
    driveGalleryLength:18.75,
    driveGalleryCenterX:1.00
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
    dryerToDeliveryGap:(d.deliveryCenterX-d.deliveryBodyLength/2)-(d.dryerCenterX+d.dryerLength/2),
    structuralLength:d.structuralMaxX-d.structuralMinX,
    serviceLength:d.serviceMaxX-d.serviceMinX
  });
}
