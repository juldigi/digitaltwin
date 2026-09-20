// Offset 10 dimensional/configuration baseline.
// Ground truth: BMJ HEIDELBERG final drawing 2026_0723_03/04, proposal Q417_R2_SF_FY27,
// preinstallation report and final technical-data package. Visual-only reconstruction values are
// explicitly separated from verified project values.
export const OFFSET10_MODULE_SEQUENCE=Object.freeze([
  {key:'PU1',type:'print',label:'Printing Unit 1',process:'adhesive'},
  {key:'PU2',type:'print',label:'Printing Unit 2',foilStar:true,process:'foil-transfer'},
  {key:'CU1',type:'coat',label:'Coating Unit 1'},
  {key:'Y1',type:'dryer',label:'Y Unit 1 · Interdeck UV'},
  {key:'PU4',type:'print',label:'Printing Unit 4'},
  {key:'PU5',type:'print',label:'Printing Unit 5'},
  {key:'PU6',type:'print',label:'Printing Unit 6'},
  {key:'PU7',type:'print',label:'Printing Unit 7'},
  {key:'PU8',type:'print',label:'Printing Unit 8'},
  {key:'PU9',type:'print',label:'Printing Unit 9'},
  {key:'PU10',type:'print',label:'Printing Unit 10'},
  {key:'PU11',type:'print',label:'Printing Unit 11'},
  {key:'CU2',type:'coat',label:'Coating Unit 2'},
  {key:'Y2',type:'dryer',label:'Y Unit 2 · Interdeck UV'},
  {key:'PU14',type:'print',label:'Printing Unit 14'},
  {key:'CUF',type:'coat',label:'Final Coating Unit'}
]);

export const OFFSET10_PRINTING_UNIT_KEYS=Object.freeze(OFFSET10_MODULE_SEQUENCE.filter(m=>m.type==='print').map(m=>m.key));
export const OFFSET10_COATING_UNIT_KEYS=Object.freeze(OFFSET10_MODULE_SEQUENCE.filter(m=>m.type==='coat').map(m=>m.key));
export const OFFSET10_Y_UNIT_KEYS=Object.freeze(OFFSET10_MODULE_SEQUENCE.filter(m=>m.type==='dryer').map(m=>m.key));

// The final drawing explicitly shows a 1225 mm repeating pitch through the press line.
// The absolute origin is reconstruction-only; relative spacing and total reference length are document-grounded.
const modulePitch=1.225,firstModuleX=-7.80;
export const OFFSET10_MODULE_CENTERS=Object.freeze(Object.fromEntries(
  OFFSET10_MODULE_SEQUENCE.map((m,i)=>[m.key,Number((firstModuleX+i*modulePitch).toFixed(3))])
));

export const OFFSET10_DIMENSIONS=Object.freeze({
  source:'HEIDELBERG_FINAL_DRAWING_2026_0723_03/04 + Q417_R2_SF_FY27 + FINAL_TECHNICAL_DATA_2026_05_13',
  units:'m',
  verified:Object.freeze({
    pressElevation:.564,
    modulePitch:1.225,
    maxSheetWidth:1.040,
    maxSheetLength:.720,
    maxSpeedSph:15000,
    baseReferenceLength:27.749,
    serviceEnvelopeLength:34.293,
    serviceEnvelopeWidth:9.044,
    interdeckUvLampCount:6,
    endOfPressUvLampCount:3,
    deliveryExtensionModules:3,
    printingUnitCount:11,
    coatingUnitCount:3,
    yUnitCount:2,
    foilStarRollCapacity:6,
    foilStarPowerKw:25,
    uvPowerKw:226,
    totalConnectedPowerKw:509,
    machineOnlyWeightKg:98995,
    overallPressWeightKg:110181
  }),
  layout:Object.freeze({
    modulePitch,
    firstModuleX,
    // Visual reconstruction envelope, constrained to the official 1225 mm module pitch.
    printModuleWidth:.98,
    coatingModuleWidth:1.00,
    yModuleWidth:.88,
    sideFrameZ:1.36,
    bodyWidth:2.96,
    structuralWidth:4.30,
    mainDeckY:.564,
    unitBodyBottomY:.58,
    unitBodyTopY:2.70,
    foilStarTopY:4.48,
    // These feeder/delivery bounds close to the documented 27.749 m press-base reference span.
    feederCenterX:-10.15,
    feederLength:4.15,
    deliveryCenterX:12.95,
    deliveryLength:5.15,
    deliveryPileX:14.10,
    operatorSideZ:-1.48,
    driveSideZ:1.48,
    walkwayZ:1.88,
    serviceCabinetZ:3.25,
    pressBaseReferenceLength:27.749,
    serviceEnvelopeLength:34.293,
    serviceEnvelopeWidth:9.044
  })
});

export function offset10DimensionAudit(){
  const D=OFFSET10_DIMENSIONS.layout,centers=Object.values(OFFSET10_MODULE_CENTERS);
  const modeledBodySpan=(D.deliveryCenterX+D.deliveryLength/2)-(D.feederCenterX-D.feederLength/2);
  return Object.freeze({
    moduleCount:OFFSET10_MODULE_SEQUENCE.length,
    printingUnits:OFFSET10_PRINTING_UNIT_KEYS.length,
    coatingUnits:OFFSET10_COATING_UNIT_KEYS.length,
    yUnits:OFFSET10_Y_UNIT_KEYS.length,
    firstModuleX:centers[0],
    lastModuleX:centers.at(-1),
    modulePitch:D.modulePitch,
    modeledBodySpan:Number(modeledBodySpan.toFixed(3)),
    officialBaseReferenceLength:D.pressBaseReferenceLength,
    spanDelta:Number((modeledBodySpan-D.pressBaseReferenceLength).toFixed(3)),
    serviceEnvelope:[D.serviceEnvelopeLength,D.serviceEnvelopeWidth]
  });
}
