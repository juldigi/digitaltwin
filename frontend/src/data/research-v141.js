import {V140_SOURCE_LEDGER} from './research-v140.js';
const s=(id,machineScope,title,publisher,url,kind='TECHNICAL_REFERENCE',confidence='OEM_PRIMARY')=>Object.freeze({id,machineScope,title,publisher,url,kind,confidence,reviewBatch:'V141-2026-09-22'});
export const V141_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V141-DIANA-BROCHURE','DIANA_EYE_55','Diana Eye 42/55 brochure · suction belt, camera/light options, optional air/mechanical ejection and 300 m/min technical data','HEIDELBERG','https://www.heidelberg.com/global/media/en/global_media/products___postpress_offline_inspection/downloads_1/diana_eye_42_55_lr.pdf','OEM_PRODUCT_BROCHURE'),
 s('V141-FOCUSIGHT-N650-ZH','SHARK_N650','FS-SHARK N650 current official Chinese product page · loading/transfer/reject/collection automation, good/bad return, 400 m/min, compressed-air requirement','Focusight','https://www.focusight.net/zh-cn/product/pro2/185.html','OEM_PRODUCT_REFERENCE'),
 s('V141-UPG-LY300-DETAIL','UPG_LY300','LQ-UPG LY300 detailed product page · feeder, Ricoh G5, servo/PLC, encoder/sensor, negative system, LED UV, 2K line-scan, plate-turn reject','Shanghai UPG','https://www.shanghai-upg.com/LQ-UPG-LY300-UV-Piezo-Inkjet-Printer-pd531823858.html','OEM_PRODUCT_REFERENCE')
]);
const seen=new Set();
export const V141_SOURCE_LEDGER=Object.freeze([...V141_NEW_RESEARCH_SOURCES,...V140_SOURCE_LEDGER].filter(e=>e.url&&!seen.has(e.url)&&(seen.add(e.url),true)));
export const V141_SOURCE_STATS=Object.freeze({
 total:V141_SOURCE_LEDGER.length,newReviewed:V141_NEW_RESEARCH_SOURCES.length,uniqueUrls:new Set(V141_SOURCE_LEDGER.map(e=>e.url)).size,
 oemOrPrimary:V141_SOURCE_LEDGER.filter(e=>/OEM_|PRIMARY_MECHANISM|EXACT_MODEL|MODEL_.*MANUAL|MODEL_INSTRUCTION/.test(String(e.kind)+' '+String(e.confidence))).length
});
