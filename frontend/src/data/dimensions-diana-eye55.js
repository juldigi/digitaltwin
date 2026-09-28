export const DIANA_EYE55_SPEC=Object.freeze({
 assetId:'BMJ-MCH-0019',model:'DIANA EYE 55',serial:'MP.FBA0-00058',year:2023,sap:'IPM-3',
 materialGsm:[90,650],maxSpeedMMin:300,maxSheetM:[.550,.500],
 minSheetHeidelbergM:[.070,.070],minSheetMasterworkCurrentM:[.090,.090],
 publishedSmallCartonOutputPerHour:{heidelbergBrochure:[80000,120000],heidelbergCurrent:80000,masterworkCurrent:120000},
 officialCurrentEnvelopeM:Object.freeze({standardFeederFishScaleDelivery:[7.472,2.900,2.025],standardFeederSideStacker:[7.970,2.900,2.025],source:'MASTERWORK_CURRENT_DIANA_EYE55'}),
 modeledEnvelopeMode:'STANDARD_FEEDER_FISH_SCALE_DELIVERY_REFERENCE',
 cameraCapacity:{top:4,area:2,rear:1},cameraFamilies:['4K RGB line-scan','7.3K RGB line-scan','8K B/W line-scan','RGB area camera'],
 rejectActuationOptions:['mechanical','air-nozzle'],installedCameraCountVerified:false,installedCameraMixVerified:false,installedRejectActuationVerified:false,installedStackerVerified:false,
 processCapabilities:['print-image inspection','hot/cold foil inspection','embossing / debossing inspection','hologram inspection','varnish / coating inspection','1D/2D code inspection','inline reject separation'],
 dimensionalBoundary:'300 m/min, 90–650 g/m² and 550×500 mm maximum format are consistent across official HEIDELBERG/Masterwork references. Current Masterwork publishes 7472×2900×2025 mm for Diana Eye 55 with standard feeder + fish-scale delivery and 7970×2900×2025 mm with optional side stacker; these are current family configurations, not a serial-2023 BMJ as-built survey. Minimum format/output differ by documentation generation. Up to four top cameras, one rear camera and up to two area cameras are capability limits, not proof of installed population. Reject can be mechanical or blowing; installed actuator and optional stacker remain BMJ serial-specific.'
});
export const DIANA_EYE55_STATIONS=Object.freeze([
 {key:'FEED',label:'Friction feeder / alignment blank',x:-3.55},{key:'TRANSPORT',label:'Transport suction-belt',x:-2.25},
 {key:'INSPECT',label:'Enclosure inspeksi camera + LED',x:-.25},{key:'PROCESS',label:'Pemrosesan citra',x:1.20},
 {key:'REJECT',label:'Ejection / sorting blank',x:2.45},{key:'DELIVERY',label:'Delivery blank accepted',x:3.55}
]);
