export const SHARK_N650_SPEC=Object.freeze({
 assetId:'BMJ-MCH-0020',model:'FS-SHARK-N650-P3N1',family:'FS-SHARK N650',serial:'FPS241216001',year:2025,sap:'IPM-4',
 currentFamilyMaxSpeedMMin:400,currentFamilyMaxInspectionM:[.630,.300],currentFamilyMinInspectionM:[.070,.090],
 olderFamilyReferences:{speedMMin:[200,220,250,300,350],maxSheetExamplesM:[[.650,.420],[.600,.450]],older650Reference:Object.freeze({transportSpeedMMin:250,inspectionSpeedMMin:220,maxSheetM:[.600,.450],minSheetM:[.100,.100],paperGsm:[120,700],approxEnvelopeM:[6.95,3.65,2.20],approxWeightT:4.5})},
 suffixDecoded:false,installedFeederModeVerified:false,installedCameraPackageVerified:false,installedLightingPackageVerified:false,installedRejectTypeVerified:false,installedCollectionModeVerified:false,
 officialFloorSpaceModesM:{folderGluerConnection:[5.30,2.50,1.50],fishScaleOffline:[6.80,2.50,1.50],reflowLine:[12.50,3.50,1.50]},
 processes:['automatic loading','sheet transfer','surface inspection','print / color / registration / hot-stamp / variable-code detection','reject separation','good/bad product collection'],
 dimensionalBoundary:'Current Focusight FS-SHARK N650 page publishes 400 m/min and 630×300 mm inspection size, while older N650/650 references show lower speeds and different sheet windows. BMJ suffix P3N1 is retained verbatim but is not decoded into camera count or option content without serial-specific documentation. Exact feeder mode, cameras, lighting modules, reject type and return-line arrangement remain configuration-specific.'
});
export const SHARK_N650_STATIONS=Object.freeze([
 {key:'FEED',label:'Automatic feeder',x:-3.10},{key:'TRANSFER',label:'Full-suction transfer',x:-1.95},
 {key:'INSPECT',label:'Inspection tower',x:-.35},{key:'VISION',label:'Camera + controlled lighting',x:.10},
 {key:'REJECT',label:'Reject separation',x:1.65},{key:'RETURN',label:'Good/bad return collection',x:2.85}
]);
