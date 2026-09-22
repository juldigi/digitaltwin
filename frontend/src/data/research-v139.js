import {V138_SOURCE_LEDGER} from './research-v138.js';
const s=(id,machineScope,title,publisher,url,kind='TECHNICAL_REFERENCE',confidence='OEM_PRIMARY')=>Object.freeze({id,machineScope,title,publisher,url,kind,confidence,reviewBatch:'V139-2026-09-22'});
export const V139_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V139-SUPRA-US-OVERVIEW','CTP','HEIDELBERG Suprasetter overview · automation, extraction/filter, inline punching, IDS and integrated cooling by model','HEIDELBERG','https://www.heidelberg.com/us/en/products/computer_to_plate_1/prepress_overview.jsp','OEM_PRODUCT_REFERENCE'),
 s('V139-SUPRA-2024-BROCHURE','CTP','Suprasetter current family brochure · modular laser modules, IDS, automated loading and service-friendly architecture','HEIDELBERG','https://www.heidelberg.com/global/media/en/global_media/products___ctp/pdf_5/331561_PB_Suprasetter_EN_WEB.pdf','OEM_PRODUCT_BROCHURE'),
 s('V139-SCREEN-KATANA-PRIMARY','CTF','Katana 5040/5055 official SCREEN article · capstan transport, slack zones, gravity tension, polygon scanning and optional punch','SCREEN','https://www.screen.co.jp/ga_dtp/en/news/pdf/newsbox/vol9_pdf/newsbox_9_4.pdf','OEM_PRODUCT_REFERENCE'),
 s('V139-SCREEN-FTR-ARCHIVE','CTF','FT-R3035/3050 archived product literature · capstan media transport and automatic handling','SCREEN archived literature','https://www.scribd.com/document/236034169/Screen-FTR-3035-3050','ARCHIVED_OEM_LITERATURE','SCREEN_IMAGESSETTER_FAMILY_REFERENCE')
]);
const seen=new Set();
export const V139_SOURCE_LEDGER=Object.freeze([...V139_NEW_RESEARCH_SOURCES,...V138_SOURCE_LEDGER].filter(e=>e.url&&!seen.has(e.url)&&(seen.add(e.url),true)));
export const V139_SOURCE_STATS=Object.freeze({
 total:V139_SOURCE_LEDGER.length,newReviewed:V139_NEW_RESEARCH_SOURCES.length,uniqueUrls:new Set(V139_SOURCE_LEDGER.map(e=>e.url)).size,
 oemOrPrimary:V139_SOURCE_LEDGER.filter(e=>/OEM_|PRIMARY_MECHANISM|MODEL_.*MANUAL|MODEL_INSTRUCTION/.test(String(e.kind)+' '+String(e.confidence))).length
});
