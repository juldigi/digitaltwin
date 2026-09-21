const COMMON=Object.freeze({
 model:'MEDIA 100 II',workingWidthM:1.000,maxBlankLengthM:.600,referenceMinWorkingWidthM:.126,referenceMinBlankLengthM:.060,
 solidBoardGsm:[100,600],corrugatedReference:'N/F/E flute; some market listings also cite B flute depending configuration',
 nominalRunSpeedMMin:300,inchingSpeedMMin:20,motorKw:11,
 familyLengthsM:{A1:10.50,A2:11.80},familyWeightKg:{A1:4800,A2:5200},
 processes:['blank feeding','alignment / pre-break','pre-fold','lock-bottom / carton-forming conversion','glue application','final folding / trombone','compression delivery'],
 dimensionalBoundary:'BOBST MEDIA II family brochure supports 300 m/min continuous speed, 20 m/min inching, 11 kW drive and A1/A2 family envelope lengths. BMJ records identify MEDIA 100 II but not A1/A2 suffix, carton-kit setup, glue-head count, 4/6-corner servo package, barcode reader, ejector or delivery accessory. Those are therefore not claimed as installed.'
});
export const MEDIA100_ASSET_PROFILES=Object.freeze({
 'BMJ-MCH-0016':Object.freeze({...COMMON,assetId:'BMJ-MCH-0016',serial:'0341 06903',sap:'FGM-1',siteLabel:'FOLDER GLUER - 1 MACHINE'}),
 'BMJ-MCH-0018':Object.freeze({...COMMON,assetId:'BMJ-MCH-0018',serial:'0341 142 07',sap:'FGM-3',siteLabel:'FOLDER GLUER - 3 MACHINE'})
});
export function media100SpecFor(assetId='BMJ-MCH-0016'){return MEDIA100_ASSET_PROFILES[assetId]||MEDIA100_ASSET_PROFILES['BMJ-MCH-0016'];}
export const MEDIA100_SPEC=media100SpecFor('BMJ-MCH-0016');
export const MEDIA100_SPEC_FGM3=media100SpecFor('BMJ-MCH-0018');
export const MEDIA100_STATIONS=Object.freeze([
 {key:'FEED',label:'Friction feeder / vibrator',x:-5.0},{key:'PREFOLD',label:'Pre-fold / pre-break',x:-3.45},
 {key:'FORM',label:'Lock-bottom / folding conversion',x:-1.65},{key:'GLUE',label:'Glue application',x:.10},
 {key:'FINAL',label:'Final fold / trombone',x:2.05},{key:'PRESS',label:'Compression delivery',x:4.35}
]);
