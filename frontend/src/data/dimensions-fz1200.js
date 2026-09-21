const COMMON=Object.freeze({
 model:'FZ 1200',
 processes:['pile clamping','pile turning','air separation / airing','jogging / alignment','dust / powder removal'],
 exactModelPublicReference:Object.freeze({
  source:'Tangshan UANCHOR FZ1200 public product reference',
  maxPileKg:1200,
  maxPaperM:[1.200,.800],
  openingM:[.760,1.640],
  powerKw:9,
  supply:'3P 380V AC 50Hz',
  hydraulicPressureMPa:16,
  hydraulicTankL:12,
  netWeightKg:2800,
  envelopeM:[2.37,2.09,2.10]
 }),
 sameModelMarketRange:Object.freeze({
  maxPaperM:[1.200,.800],
  minPaperM:[.560,.360],
  capacityKg:[1000,1200],
  powerKw:[8,12]
 }),
 installedOemVerified:false,
 installedCapacityVerified:false,
 installedOpeningVerified:false,
 installedPowerVerified:false,
 installedEnvelopeVerified:false,
 installedHydraulicPressureVerified:false,
 installedOilTankVerified:false,
 installedNozzleCountVerified:false,
 installedBlowerLayoutVerified:false,
 installedCylinderCountVerified:false,
 dimensionalBoundary:'BMJ records exact model FZ 1200 on all three assets. Public FZ1200 data can therefore ground model-level process and reference dimensions, but it is not yet a nameplate match to BMJ serials. UANCHOR/JMM origin, installed load rating, opening, power, pressure, oil-tank size, nozzle count, cylinder layout, guard geometry and site envelope remain unverified until BMJ unit-specific evidence is available.'
});
export const FZ1200_ASSET_PROFILES=Object.freeze({
 'BMJ-MCH-0007':Object.freeze({...COMMON,assetId:'BMJ-MCH-0007',serial:'24RVOFS0920',year:2020,sap:'PLT-1',siteLabel:'PILE TURNER 01'}),
 'BMJ-MCH-0008':Object.freeze({...COMMON,assetId:'BMJ-MCH-0008',serial:'2105080SF34',year:2022,sap:'PLT-3',siteLabel:'PILE TURNER 03'}),
 'BMJ-MCH-0022':Object.freeze({...COMMON,assetId:'BMJ-MCH-0022',serial:'22000320',year:2020,sap:'PLT-1',siteLabel:'PILE TURNER 2'})
});
export function fz1200SpecFor(assetId='BMJ-MCH-0007'){return FZ1200_ASSET_PROFILES[assetId]||FZ1200_ASSET_PROFILES['BMJ-MCH-0007'];}
export const FZ1200_SPEC=fz1200SpecFor('BMJ-MCH-0007');
