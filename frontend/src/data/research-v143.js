import {V142_SOURCE_LEDGER} from './research-v142.js';
const s=(id,machineScope,title,publisher,url,kind='INDUSTRIAL_BUILDING_REFERENCE',confidence='INDUSTRY_TECHNICAL_REFERENCE')=>Object.freeze({id,machineScope,title,publisher,url,kind,confidence,reviewBatch:'V143-2026-09-22'});
export const V143_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V143-STEELINFO-SINGLE-STOREY','FACTORY_BUILDING','Single-storey industrial building engineering guide · portal frame, wall/roof bracing, secondary steelwork, eaves beams and stability','SteelConstruction.info','https://steelconstruction.info/resources-for-students/engineering-students-guide-to-single-storey-buildings','STRUCTURAL_REFERENCE'),
 s('V143-ARCELOR-INDUSTRIAL','FACTORY_BUILDING','Best practice in steel construction · industrial buildings, portal frames, envelope and service loads','ArcelorMittal Constructalia','https://constructalia.arcelormittal.com/files/Industrial_EN_Lowres--c3e931574ac1d0f586c79e0f97d43ad7.pdf','STRUCTURAL_REFERENCE'),
 s('V143-CRANEADAPT-INDUSTRIAL','FACTORY_BUILDING','Industrial steel building system reference · primary frame, secondary steel, bracing, roof/wall interfaces','CRANEADAPT','https://www.craneadapt.com/products/industrial-steel-buildings/','STRUCTURAL_VISUAL_REFERENCE'),
 s('V143-ZODIAC-PRINT-HALL','FACTORY_BUILDING','Commercial printing plant interior reference · presses, overhead ducting, lighting, partitions and clean production floor','Interioring / Zodiac Reprographics','https://www.interioring.com/projects/ms-zodiac-reprographics-pvt-ltd','PRINTING_PLANT_VISUAL_REFERENCE')
]);
const seen=new Set();
export const V143_SOURCE_LEDGER=Object.freeze([...V143_NEW_RESEARCH_SOURCES,...V142_SOURCE_LEDGER].filter(e=>e.url&&!seen.has(e.url)&&(seen.add(e.url),true)));
export const V143_SOURCE_STATS=Object.freeze({total:V143_SOURCE_LEDGER.length,newReviewed:V143_NEW_RESEARCH_SOURCES.length,uniqueUrls:new Set(V143_SOURCE_LEDGER.map(e=>e.url)).size});
