import {V137_SOURCE_LEDGER} from './research-v137.js';
const s=(id,machineScope,title,publisher,url,kind='TECHNICAL_REFERENCE',confidence='OEM_PRIMARY')=>Object.freeze({id,machineScope,title,publisher,url,kind,confidence,reviewBatch:'V138-2026-09-22'});
export const V138_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V138-BOBST-MASTERFOLD170','FGM2','MASTERFOLD 170/230/300 · direct drives, automatic belt tensioning, box-stream control','BOBST','https://www.bobst.com/eu/en/products/folding-gluing/masterfold-170-230-300','OEM_PROCESS_REFERENCE'),
 s('V138-BOBST-NOVAFOLD','FGM2','NOVAFOLD 106/145/170 · driven upper belts, prebreaker and transfer architecture','BOBST','https://www.bobst.com/cn/en/products/folding-gluing/novafold-106-145-170','OEM_PROCESS_REFERENCE'),
 s('V138-HORIZON-VACL1000','COLLATOR','VAC-L1000 · individual blowing mechanisms and suction rotor feeding','Horizon International','https://www.horizon.co.jp/products/en/products/collators/vacl1000/vacl1000_e.html','OEM_PROCESS_REFERENCE'),
 s('V138-HORIZON-VAC1000-JP','COLLATOR','VAC-1000 · independently adjustable suction and separation blowers','Horizon International','https://www.horizon.co.jp/products/ja/products/collators/vac1000/vac1000_j.html','OEM_PROCESS_REFERENCE'),
 s('V138-UPG-FOLDER-GLUER','FGM2','LQ-ZH folder-gluer · continuous feed, cold-glue and variable line speed family reference','UP Group / Shanghai Yuyin','https://www.shanghai-yuyin.com/LQ-ZH-800-880C-880-1000-Automatic-Folder-Gluer-pd40069173.html','CLOSE_FAMILY_VENDOR_REFERENCE','SECONDARY_CLOSE_FAMILY')
]);
const seen=new Set();
export const V138_SOURCE_LEDGER=Object.freeze([...V138_NEW_RESEARCH_SOURCES,...V137_SOURCE_LEDGER].filter(e=>e.url&&!seen.has(e.url)&&(seen.add(e.url),true)));
export const V138_SOURCE_STATS=Object.freeze({
 total:V138_SOURCE_LEDGER.length,newReviewed:V138_NEW_RESEARCH_SOURCES.length,uniqueUrls:new Set(V138_SOURCE_LEDGER.map(e=>e.url)).size,
 oemOrPrimary:V138_SOURCE_LEDGER.filter(e=>/OEM_|PRIMARY_MECHANISM|MODEL_.*MANUAL|MODEL_INSTRUCTION/.test(String(e.kind)+' '+String(e.confidence))).length
});
