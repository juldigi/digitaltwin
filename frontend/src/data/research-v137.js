import {V136_SOURCE_LEDGER} from './research-v136.js';
const s=(id,machineScope,title,publisher,url,kind='TECHNICAL_REFERENCE',confidence='OEM_PRIMARY')=>Object.freeze({id,machineScope,title,publisher,url,kind,confidence,reviewBatch:'V137-2026-09-22'});
export const V137_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V137-BOBST-BELTS-BEARINGS','FGM2','Folder-gluer bearings and belts · transport precision, tension and alignment maintenance','BOBST','https://www.bobst.com/na/en/news/1767883801-care-for-bearings-and-belts-that-boost-your-folding-and-gluing-process','OEM_SERVICE_REFERENCE','OEM_PRIMARY'),
 s('V137-HORIZON-VAC-SERIES','COLLATOR','VAC series suction-rotor sequence · air float, pickup, double-feed stop pads and rotary feed','Horizon International','https://www.horizon.co.jp/products/catalog/e_pdf/e001co/04vac_pdf/vacseries_e.pdf','OEM_TECHNICAL_BROCHURE','OEM_PRIMARY'),
 s('V137-HORIZON-VAC1000','COLLATOR','VAC-1000 · rotary suction feeding and per-bin infrared double-feed detection','Horizon International','https://www.horizon.co.jp/products/en/products/collators/vac1000/vac1000_e.html','OEM_PRODUCT_REFERENCE','OEM_PRIMARY'),
 s('V137-ZUND-MODULES-PDF','ZUND','Modules & Tools · modular carriers, tool families and operating modes','Zünd','https://www.zund.com/media/375/download/Modules-and-Tools_Gen3_2_ANSICHT_EN-us.pdf?v=7','OEM_TOOL_CATALOG','OEM_PRIMARY')
]);
const seen=new Set();
export const V137_SOURCE_LEDGER=Object.freeze([...V137_NEW_RESEARCH_SOURCES,...V136_SOURCE_LEDGER].filter(e=>e.url&&!seen.has(e.url)&&(seen.add(e.url),true)));
export const V137_SOURCE_STATS=Object.freeze({
 total:V137_SOURCE_LEDGER.length,newReviewed:V137_NEW_RESEARCH_SOURCES.length,uniqueUrls:new Set(V137_SOURCE_LEDGER.map(e=>e.url)).size,
 oemOrPrimary:V137_SOURCE_LEDGER.filter(e=>/OEM_|PRIMARY_MECHANISM|MODEL_.*MANUAL|MODEL_INSTRUCTION/.test(String(e.kind)+' '+String(e.confidence))).length
});
