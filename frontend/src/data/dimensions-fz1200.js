const COMMON=Object.freeze({
 model:'FZ 1200',processes:['pile clamping','pile turning','air separation / airing','jogging / alignment','dust / powder removal'],
 familyPaperSizeMaxM:[1.200,.800],familyPaperSizeMinM:[.560,.360],
 referenceCapacityKg:[1000,1200],referencePowerKw:[8,12],
 dimensionalBoundary:'FZ-1200 is sold by multiple printing-finishing suppliers/OEM channels with conflicting published capacity, power, opening and envelope values. The process architecture—clamp, turn, air, jog/align, dust removal—is consistent. BMJ serials are preserved, but OEM origin, exact clamp opening, hydraulic layout, blower count, capacity and dimensions are not inferred.'
});
export const FZ1200_ASSET_PROFILES=Object.freeze({
 'BMJ-MCH-0007':Object.freeze({...COMMON,assetId:'BMJ-MCH-0007',serial:'24RVOFS0920',year:2020,sap:'PLT-1',siteLabel:'PILE TURNER 01'}),
 'BMJ-MCH-0008':Object.freeze({...COMMON,assetId:'BMJ-MCH-0008',serial:'2105080SF34',year:2022,sap:'PLT-3',siteLabel:'PILE TURNER 03'}),
 'BMJ-MCH-0022':Object.freeze({...COMMON,assetId:'BMJ-MCH-0022',serial:'22000320',year:2020,sap:'PLT-1',siteLabel:'PILE TURNER 2'})
});
export function fz1200SpecFor(assetId='BMJ-MCH-0007'){return FZ1200_ASSET_PROFILES[assetId]||FZ1200_ASSET_PROFILES['BMJ-MCH-0007'];}
export const FZ1200_SPEC=fz1200SpecFor('BMJ-MCH-0007');
