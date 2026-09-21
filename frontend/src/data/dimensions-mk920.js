const COMMON=Object.freeze({modelFamily:'MK 920 YMI',maxSheet:[.920,.650],minSheet:[.360,.520],maxSpeed:6500,foilPullAxes:3,processes:['hot-foil stamping','flatbed die-cutting'],dimensionalBoundary:'Sheet limits, rated speed and three precision foil-pull systems are family-reference-supported. Installed reel count, heating-zone count, platen force, exact exterior envelope and delivery options require BMJ serial-specific evidence.'});
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
