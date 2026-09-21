export const DIANA_EYE55_SPEC=Object.freeze({
 assetId:'BMJ-MCH-0019',model:'DIANA EYE 55',serial:'MP.FBA0-00058',year:2023,sap:'IPM-3',
 materialGsm:[90,650],maxSpeedMMin:300,maxSheetM:[.550,.500],
 minSheetHeidelbergM:[.070,.070],minSheetMasterworkCurrentM:[.090,.090],
 publishedSmallCartonOutputPerHour:{heidelbergBrochure:[80000,120000],heidelbergCurrent:80000},
 cameraCapacity:{top:4,area:2,rear:1},cameraFamilies:['4K RGB line-scan','7.3K RGB line-scan','8K B/W line-scan','RGB area camera'],
 rejectActuationOptions:['mechanical','air-nozzle'],installedCameraCountVerified:false,installedCameraMixVerified:false,installedRejectActuationVerified:false,installedStackerVerified:false,
 processCapabilities:['print-image inspection','hot/cold foil inspection','embossing / debossing inspection','hologram inspection','varnish / coating inspection','1D/2D code inspection','inline reject separation'],
 dimensionalBoundary:'300 m/min, 90–650 g/m² and 550×500 mm maximum format are consistent across official HEIDELBERG/Masterwork references. Minimum format and published small-carton output differ by documentation generation (70×70 vs 90×90 mm; current page 80k/h vs brochure 80–120k/h). Up to four top cameras, one rear camera and up to two area cameras are machine capability, not proof of installed population. Reject can be mechanical or optional air-nozzle; installed actuator, optional stacker and exact enclosure dimensions remain BMJ serial-specific.'
});
export const DIANA_EYE55_STATIONS=Object.freeze([
 {key:'FEED',label:'Friction feeder / blank alignment',x:-3.55},{key:'TRANSPORT',label:'Suction-belt transport',x:-2.25},
 {key:'INSPECT',label:'Camera + LED inspection enclosure',x:-.25},{key:'PROCESS',label:'Image processing',x:1.20},
 {key:'REJECT',label:'Blank ejection / sorting',x:2.45},{key:'DELIVERY',label:'Accepted blank delivery',x:3.55}
]);
