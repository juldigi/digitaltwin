const COMMON=Object.freeze({
 modelFamily:'MK 920 YMI',maxSheet:[.920,.650],minSheet:[.360,.520],maxStampingSpeed:6500,maxSpeed:6500,foilPullAxes:3,foilAdvanceIncrementMm:1,
 processes:['hot-foil stamping','flatbed die-cutting'],
 installedReelCountVerified:false,installedHeatingZoneCountVerified:false,installedPlatenForceVerified:false,installedEnvelopeVerified:false,installedTransverseFoilAxesVerified:false,
 relatedYMMarketReference:Object.freeze({maxSheet:[.920,.650],minSheet:[.360,.320],maxDieCut:[.910,.630],maxStamp:[.900,.600],dieCutSpeed:7500,stampingSpeed:6500,foilPullLongitudinal:3,foilPullTransverse:2,heatingZones:20,temperatureC:[40,180],approxEnvelopeM:[5.6,4.5,2.2],approxWeightT:15}),
 dimensionalBoundary:'BMJ identity is exact for MK 920 YMI / YMI-II. The 920×650 mm format, 6500 sph stamping reference, three precision longitudinal foil-pull systems and 1 mm foil-advance control are supported at model/family level. A closely related MK920YM market reference publishes 360×320 mm minimum sheet, 3 longitudinal + 2 transverse foil drives and 20 heating zones, but those values are retained only as related-family reference and are not promoted to the installed YMI/YMI-II units without serial-specific documentation.'
});
export const MK920_ASSET_PROFILES=Object.freeze({
 'BMJ-MCH-0011':Object.freeze({...COMMON,assetId:'BMJ-MCH-0011',model:'MK 920 YMI',serial:'20110509330',year:2011,sap:'APM-5',siteLabel:'AUTOPLATEN - 5 STAMPING'}),
 'BMJ-MCH-0012':Object.freeze({...COMMON,assetId:'BMJ-MCH-0012',model:'MK 920 YMI - II',serial:'20130529398A',year:2013,sap:'APM-6',siteLabel:'AUTOPLATEN - 6 STAMPING'})
});
export function mk920SpecFor(assetId='BMJ-MCH-0011'){return MK920_ASSET_PROFILES[assetId]||MK920_ASSET_PROFILES['BMJ-MCH-0011'];}
export const MK920_SPEC=mk920SpecFor('BMJ-MCH-0011');
export const MK920_SPEC_APM6=mk920SpecFor('BMJ-MCH-0012');
export const MK920_STATIONS=Object.freeze([
 {key:'FEED',label:'Pile Feeder',x:-3.15},{key:'REGISTER',label:'Registration Table',x:-2.05},{key:'FOIL',label:'Foil Unwind and Advance',x:-.65},{key:'PLATEN',label:'Heated Stamping Platen',x:.20},{key:'TRANSPORT',label:'Gripper-chain Transport',x:1.10},{key:'DELIVERY',label:'Delivery Pile',x:2.65}
]);
