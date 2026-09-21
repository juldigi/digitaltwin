const COMMON=Object.freeze({
 model:'Promatrix 106 CSB',sheetMax:[.760,1.060],sheetMin:[.300,.350],sheetMinMasterSet:[.350,.400],
 paperMinGsm:90,solidBoardMaxGsm:2000,corrugatedMaxM:.004,corrugatedMaxMasterSetM:.002,
 cuttingPressureMN:2.6,cuttingPressureTonnes:260,publishedMaxSpeed:8000,
 feederPileHeightM:1.5,feederPileNonStopHeightM:1.2,feederPileMaxKg:1500,
 deliveryPileHeightCSBM:1.2,deliveryPileMaxCSBKg:900,
 processes:['die-cutting','creasing / embossing','stripping','blanking','non-stop pile handling'],
 dimensionalBoundary:'Current HEIDELBERG technical data publishes 8000 sheets/hour for Promatrix 106 CS/CSB. Earlier official literature has generation-dependent speed figures, so installed BMJ serial speed/software level remains serial-specific. MasterSet, feeder logistics Auto-Non-Stop, chase changer and other options are not assumed installed unless site evidence confirms them.'
});
export const PROMATRIX106_ASSET_PROFILES=Object.freeze({
 'BMJ-MCH-0014':Object.freeze({...COMMON,assetId:'BMJ-MCH-0014',serial:'MP.DBE0-00100',year:2022,sap:'APM-8',siteLabel:'AUTOPLATEN - 8 STRIPPING & BLANKING'}),
 'BMJ-MCH-0015':Object.freeze({...COMMON,assetId:'BMJ-MCH-0015',serial:'MP.DBE0-00115',year:2024,sap:'APM-9',siteLabel:'AUTOPLATEN - 9 STRIPPING & BLANKING'})
});
export function promatrix106SpecFor(assetId='BMJ-MCH-0014'){return PROMATRIX106_ASSET_PROFILES[assetId]||PROMATRIX106_ASSET_PROFILES['BMJ-MCH-0014'];}
export const PROMATRIX106_SPEC=promatrix106SpecFor('BMJ-MCH-0014');
export const PROMATRIX106_SPEC_APM9=promatrix106SpecFor('BMJ-MCH-0015');
export const PROMATRIX106_STATIONS=Object.freeze([
 {key:'FEED',label:'Non-stop feeder',x:-4.20},{key:'TABLE',label:'Suction-belt feed table',x:-3.08},
 {key:'CUT',label:'Cutting station',x:-1.42},{key:'STRIP',label:'Stripping station',x:.38},
 {key:'BLANK',label:'Blanking station',x:2.12},{key:'DELIVERY',label:'CSB non-stop delivery',x:3.62}
]);
