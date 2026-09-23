// APM 2 baseline. BMJ identity fields come from the user's machine database.
// Legacy SP 102 dimensions/performance are family references because the workbook does not
// specify an E/SE/CER/BMA suffix. They must not be presented as serial-specific OEM values.
export const APM2_DIMENSIONS=Object.freeze({
  source:'BMJ_MACHINE_DATABASE + BOBST_SP102EII_PROCESS_AND_ENVELOPE_REFERENCES',
  units:'m',
  verified:Object.freeze({
    assetCode:'APM-2',
    serial:'57115506',
    functionalLocation:'PC-PK2-CON-AUT-AUTOPLAT02',
    year:1994,
    model:'SP 102',
    maxSheetWidth:1.020,
    maxSheetLength:.720
  }),
  familyReference:Object.freeze({
    manufacturer:'BOBST',
    maxSpeedSph:7500,
    maxCuttingForceT:250,
    minSheetWidth:.400,
    minSheetLength:.350,
    bodyLengthRange:[5.75,5.82],
    bodyHeightRange:[2.15,2.20],
    bodyWidthWithOperatorAccessReference:4.07,
    referenceWeightKg:15000,
    gripperBarChainSetReference:14,
    intermittentStationTransportFamilyReference:true,
    suffix:'UNCONFIRMED'
  }),
  layout:Object.freeze({
    // visual reconstruction, fitted to the published SP 102 E/SE family envelope.
    bodyLength:5.82,
    bodyWidth:2.06,
    bodyHeight:2.18,
    serviceWidth:4.07,
    feederCenterX:-2.12,
    registerCenterX:-1.18,
    platenCenterX:-.20,
    strippingCenterX:.96,
    deliveryCenterX:2.10,
    pileCenterX:2.58,
    operatorSideZ:-1.03,
    driveSideZ:1.03,
    deckY:.20
  })
});

export const APM2_PROCESS_SEQUENCE=Object.freeze([
  {key:'FEEDER',label:'Pile Feeder'},
  {key:'REGISTER',label:'Feed Table / Register'},
  {key:'TRANSPORT',label:'Gripper Chain Transport'},
  {key:'PLATEN',label:'Flatbed Die-Cutting Platen'},
  {key:'STRIP',label:'Stripping Station'},
  {key:'DELIVERY',label:'Non-stop Delivery'}
]);

export function apm2DimensionAudit(){
  const d=APM2_DIMENSIONS.layout,r=APM2_DIMENSIONS.familyReference;
  return Object.freeze({
    machine:'APM-2',
    model:'SP 102',
    serial:APM2_DIMENSIONS.verified.serial,
    year:APM2_DIMENSIONS.verified.year,
    bodyEnvelope:[d.bodyLength,d.bodyWidth,d.bodyHeight],
    familyLengthRange:r.bodyLengthRange,
    familyHeightRange:r.bodyHeightRange,
    familyWidthWithOperatorAccessReference:r.bodyWidthWithOperatorAccessReference,
    variantSuffix:r.suffix,
    maxSheet:[APM2_DIMENSIONS.verified.maxSheetWidth,APM2_DIMENSIONS.verified.maxSheetLength]
  });
}
