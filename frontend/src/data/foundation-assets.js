// Phase-1 spatial registry derived from the master equipment list.
// Only OFFSET 5 carries technical identity in the foundation runtime.
// All other records intentionally expose spatial identity only; the full technical
// registry remains in machine-registry.js for later validated expansion phases.
export const FOUNDATION_ASSETS=Object.freeze([
  Object.freeze({machineId:'BMJ-MCH-0001',no:1,area:'OFFSET PRINTING',name:'GUILOTINE POLAR 115 MACHINE (GLM-1)',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0002',no:2,area:'OFFSET PRINTING',name:'SHEETING LEXUS',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0003',no:3,area:'OFFSET PRINTING',name:'OFFSET UV INK - 5 MACHINE + INLINE INS',model:'CD 102-8+L',serial:'550415',functionalLocation:'PC-PK2-OFS-PRT-00OFFSET05',sapCode:'OFU-1',year:2011,has3D:true,source:'PHASE1_PRIMARY_TECHNICAL_ASSET',note:'OFFSET 5 is the only technical asset exposed in the foundation phase.'}),
  Object.freeze({machineId:'BMJ-MCH-0004',no:4,area:'OFFSET PRINTING',name:'OFFSET - 7 MACHINE',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0005',no:5,area:'OFFSET PRINTING',name:'OFFSET - 8 MACHINE',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0006',no:6,area:'OFFSET PRINTING',name:'OFFSET - 9 MACHINE',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0007',no:7,area:'OFFSET PRINTING',name:'PILE TURNER 01',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0008',no:8,area:'OFFSET PRINTING',name:'PILE TURNER 03',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0009',no:9,area:'OFFSET PRINTING',name:'OFFSET - 10 MACHINE',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0010',no:10,area:'OFFSET CONVERTING',name:'AUTOPLATEN - 2 MACHINE',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0011',no:11,area:'OFFSET CONVERTING',name:'AUTOPLATEN - 5 STAMPING',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0012',no:12,area:'OFFSET CONVERTING',name:'AUTOPLATEN - 6 STAMPING',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0013',no:13,area:'OFFSET CONVERTING',name:'AUTOPLATEN - 7 STRIPPING & BLANKING',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0014',no:14,area:'OFFSET CONVERTING',name:'AUTOPLATEN - 8 STRIPPING & BLANKING',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0015',no:15,area:'OFFSET CONVERTING',name:'AUTOPLATEN - 9 STRIPPING & BLANKING',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0016',no:16,area:'OFFSET CONVERTING',name:'FOLDER GLUER - 1 MACHINE',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0017',no:17,area:'OFFSET CONVERTING',name:'FOLDER GLUER - 2 MACHINE',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0018',no:18,area:'OFFSET CONVERTING',name:'FOLDER GLUER - 3 MACHINE',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0019',no:19,area:'OFFSET CONVERTING',name:'OFFLINE INSPECTION 3 - MK',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0020',no:20,area:'OFFSET CONVERTING',name:'OFFLINE INSPECTION 4 - FOCUSIGHT',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0021',no:21,area:'OFFSET CONVERTING',name:'AUTOBLANKING MACHINE 2',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0022',no:22,area:'OFFSET CONVERTING',name:'PILE TURNER 2',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0023',no:23,area:'OFFSET CONVERTING',name:'COLLATOR MACHINE',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0024',no:24,area:'OFFSET CONVERTING',name:'DIGITAL INKJET',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0025',no:25,area:'PDS',name:'CTP HEIDELBERG MACHINE',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0026',no:26,area:'PDS',name:'CTP HEIDELBERG MACHINE',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0027',no:27,area:'PDS',name:'CTF IMAGESETTER SCREEN MACHINE',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0028',no:28,area:'PDS',name:'ZUND MACHINE',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0029',no:29,area:'UTILITY',name:'COMPRESSOR ATLAS COPCO NO.2',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0030',no:30,area:'UTILITY',name:'COMPRESSOR ATLAS COPCO NO.3',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0031',no:31,area:'UTILITY',name:'COMPRESSOR KAESER NO.4',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0032',no:32,area:'UTILITY',name:'COMPRESSOR KAESER NO.6',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0033',no:33,area:'UTILITY',name:'COMPRESSOR SWAN NO.7',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0034',no:34,area:'UTILITY',name:'COMPRESSOR KAESER NO.8',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0035',no:35,area:'UTILITY',name:'COMPRESSOR ATLAS COPCO NO.9',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0036',no:36,area:'UTILITY',name:'AHU 3',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0037',no:37,area:'UTILITY',name:'AHU 4',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0038',no:38,area:'UTILITY',name:'AHU 5',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0039',no:39,area:'UTILITY',name:'AHU 6',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0040',no:40,area:'UTILITY',name:'AHU 7 (SANSIN)',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''}),
  Object.freeze({machineId:'BMJ-MCH-0041',no:41,area:'UTILITY',name:'AHU 8',model:null,serial:null,functionalLocation:null,sapCode:null,year:null,has3D:false,source:'DWG_LAYOUT_PLACEHOLDER',note:''})
]);

export const FOUNDATION_ASSETS_BY_ID=new Map(FOUNDATION_ASSETS.map(asset=>[asset.machineId,asset]));

export const FOUNDATION_ASSET_STATS=Object.freeze({
  total:FOUNDATION_ASSETS.length,
  byArea:Object.freeze(Object.fromEntries(['OFFSET PRINTING','OFFSET CONVERTING','PDS','UTILITY'].map(area=>[area,FOUNDATION_ASSETS.filter(asset=>asset.area===area).length]))),
  technical3D:FOUNDATION_ASSETS.filter(asset=>asset.has3D).length,
  placeholders:FOUNDATION_ASSETS.filter(asset=>!asset.has3D).length
});

export function foundationAssetSearch(query=''){
  const raw=String(query||'').trim().toLowerCase();
  if(!raw)return [...FOUNDATION_ASSETS];
  return FOUNDATION_ASSETS.filter(asset=>[asset.machineId,asset.name,asset.area,asset.has3D?asset.model:null,asset.has3D?asset.sapCode:null].some(value=>String(value??'').toLowerCase().includes(raw)));
}
