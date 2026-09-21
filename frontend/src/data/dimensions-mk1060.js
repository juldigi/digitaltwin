export const MK1060_SPEC=Object.freeze({
 assetId:'BMJ-MCH-0013',model:'MK 1060 ER',serial:'20130830062',year:2013,sap:'APM-7',
 maxSheet:[1.060,.760],minSheet:[.400,.350],maxDieCut:[1.060,.745],chase:[1.096,.770],
 gripperMarginMm:[9,17],paperboardGsm:[90,2000],maxSpeed:6500,maxCuttingForceTonnes:260,
 processes:['flatbed die-cutting','double-action stripping','blanking','edge-waste delivery'],
 dimensionalBoundary:'Sheet/chase limits, gripper margin, stock range, 6500 sheet/hour production reference and the feeder→platen→stripping→blanking architecture are supported by the 2013 MK1060ER operating-manual archive. The 260-ton force is family-market-reference supported. Exact BMJ guard panels, tool frames, platform height and conveyor options remain serial-specific verification items.'
});
export const MK1060_STATIONS=Object.freeze([
 {key:'FEED',label:'Non-stop feeder',x:-4.15},{key:'REGISTER',label:'Feed table / register',x:-3.05},
 {key:'PLATEN',label:'Die-cutting platen',x:-1.45},{key:'STRIP',label:'Double-action stripping',x:.25},
 {key:'BLANK',label:'Blanking station',x:1.90},{key:'WASTE',label:'Edge-waste delivery',x:3.25},{key:'PRODUCT',label:'Product delivery',x:4.10}
]);
