import {V139_SOURCE_LEDGER} from './research-v139.js';
const s=(id,machineScope,title,publisher,url,kind='TECHNICAL_REFERENCE',confidence='EXACT_MODEL_REFERENCE')=>Object.freeze({id,machineScope,title,publisher,url,kind,confidence,reviewBatch:'V140-2026-09-22'});
export const V140_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V140-UANCHOR-FZ1200','FZ1200','FZ1200 exact-model public reference · 1200 kg, 1200×800 mm, 760–1640 mm opening, 9 kW, max 16 MPa, 12 L hydraulic tank','UANCHOR','https://www.playingcardsmachine.com/pile-turner/semi-automatic-pile-turner.html','EXACT_MODEL_PUBLIC_REFERENCE'),
 s('V140-ROYAL-RYFZ1200','FZ1200','RYFZ-1200 close-family unit description · base frame, fork housing, platforms, clamping cylinder, chain wheels, pivot bearing, tilting cylinder, hydraulics, ventilation and locking mechanism','Royal China','https://royal-china.en.made-in-china.com/product/lwUfCXqPnkWn/China-Professional-Paper-Stacking-Jogger-Machine-Dust-Removing-Paper-Pile-Turner.html','CLOSE_FAMILY_COMPONENT_REFERENCE','SECONDARY_CLOSE_FAMILY'),
 s('V140-MAYKWA-FZ1200','FZ1200','FZ-1200 same-model market reference · turning, jogging and ventilation process','MAYKWA','https://www.maykwamachinery.com/paper-pile-turning-machine-product/','SAME_MODEL_MARKET_REFERENCE','SECONDARY_SAME_MODEL')
]);
const seen=new Set();
export const V140_SOURCE_LEDGER=Object.freeze([...V140_NEW_RESEARCH_SOURCES,...V139_SOURCE_LEDGER].filter(e=>e.url&&!seen.has(e.url)&&(seen.add(e.url),true)));
export const V140_SOURCE_STATS=Object.freeze({
 total:V140_SOURCE_LEDGER.length,newReviewed:V140_NEW_RESEARCH_SOURCES.length,uniqueUrls:new Set(V140_SOURCE_LEDGER.map(e=>e.url)).size,
 oemOrPrimary:V140_SOURCE_LEDGER.filter(e=>/OEM_|PRIMARY_MECHANISM|EXACT_MODEL|MODEL_.*MANUAL|MODEL_INSTRUCTION/.test(String(e.kind)+' '+String(e.confidence))).length
});
