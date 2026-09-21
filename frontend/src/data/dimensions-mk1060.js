export const MK1060_SPEC=Object.freeze({
 assetId:'BMJ-MCH-0013',model:'MK 1060 ER',serial:'20130830062',year:2013,sap:'APM-7',
 maxSheet:[1.060,.760],minSheet:[.400,.350],maxDieCut:[1.060,.745],chase:[1.096,.770],
 gripperMarginMm:[9,17],paperboardGsm:[90,2000],solidBoardMm:[.1,2],corrugatedMaxMm:4,
 maxSpeed:6500,maxCuttingForceTonnes:260,dieCutAccuracyMm:.075,feederPileMaxM:1.55,deliveryPileMaxM:1.20,
 manual2013Reference:Object.freeze({envelopeM:[7.05,4.50,2.40],weightT:20.6,mainMotorKw:14,fullLoadKw:25,airPressureMpa:.6,airFlowM3Min:.8}),
 masterworkUSAReference:Object.freeze({envelopeM:[7.05,4.50,2.60],weightT:20,mainMotorKw:15,fullLoadKw:23.2,airPressureMpa:[.6,.7],airFlowM3Min:.8}),
 installedEnvelopeHeightVerified:false,installedElectricalVariantVerified:false,installedPlatformGeometryVerified:false,
 processes:['flatbed die-cutting','double-action stripping','blanking','edge-waste delivery'],
 dimensionalBoundary:'The 2013 MK1060ER operating-manual archive and current Masterwork USA model page agree on 7050 mm length, 4500 mm width including platform, 1060×760 mm sheet size, 6500 sph and 260-tonne class pressure, but published height/weight/motor/full-load values differ. Geometry is therefore normalized to the shared model envelope and process architecture; serial-specific BMJ platform, guards, tooling and electrical variant are not asserted as measured installation data.'
});
export const MK1060_STATIONS=Object.freeze([
 {key:'FEED',label:'Non-stop feeder',x:-2.65},{key:'REGISTER',label:'Feed table / register',x:-1.55},
 {key:'PLATEN',label:'Die-cutting platen',x:-.75},{key:'STRIP',label:'Double-action stripping',x:.65},
 {key:'BLANK',label:'Blanking station',x:1.75},{key:'WASTE',label:'Edge-waste / product delivery',x:2.20}
]);
