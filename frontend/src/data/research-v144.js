import {V143_SOURCE_LEDGER} from './research-v143.js';
const s=(id,machineScope,title,publisher,url,kind='PACKAGING_INTERIOR_REFERENCE',confidence='INDUSTRY_TECHNICAL_REFERENCE')=>Object.freeze({id,machineScope,title,publisher,url,kind,confidence,reviewBatch:'V144-2026-09-22'});
export const V144_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V144-STORA-PAPERBOARD-STORAGE','RMS_WAREHOUSE','Paperboard Guide · warehouse/press-room climate, pallet wrapping and acclimatization','Stora Enso','https://4056792.fs1.hubspotusercontent-eu1.net/hubfs/4056792/Consumer%20board/Paperboard-guide.pdf','PACKAGING_MATERIAL_STORAGE_REFERENCE'),
 s('V144-CONDAIR-PACKAGING-RH','RMS_WAREHOUSE','Packaging humidity control · sheetfed litho, cartonboard and foil','Condair','https://www.condair.co.id/applications/industrial-manufacturing-humidification/packaging-humidification-humidifier-humidity','PACKAGING_ENVIRONMENT_REFERENCE'),
 s('V144-OSHA-WAREHOUSE','WAREHOUSE','Warehousing hazards and solutions · rack guarding, load placement and clear aisles','OSHA','https://www.osha.gov/warehousing/hazards-solutions','WAREHOUSE_SAFETY_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V144-OSHA-FORKLIFT-AISLE','WAREHOUSE','Powered industrial trucks · conventional rack aisle and narrow-aisle handling','OSHA','https://www.osha.gov/etools/powered-industrial-trucks/workplace/narrow-aisles','MATERIAL_HANDLING_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V144-OSHA-WORKSTATION-MONITOR','OFFICE_ADMIN','Computer Workstations eTool · monitor placement and viewing distance','OSHA','https://www.osha.gov/etools/computer-workstations/components/monitors','OFFICE_ERGONOMICS_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V144-OSHA-WORKSTATION-ENV','OFFICE_ADMIN','Computer Workstations eTool · lighting, glare, ventilation and workstation environment','OSHA','https://www.osha.gov/etools/computer-workstations/workstation-environment','OFFICE_ENVIRONMENT_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V144-OSHA-FLAMMABLES','PACKAGING_SUPPORT','29 CFR 1910.106 · flammable-liquid storage and aisle separation principles','OSHA','https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.106','CHEMICAL_STORAGE_BOUNDARY_REFERENCE','REGULATORY_STANDARD_REFERENCE')
]);
const seen=new Set();
export const V144_SOURCE_LEDGER=Object.freeze([...V144_NEW_RESEARCH_SOURCES,...V143_SOURCE_LEDGER].filter(e=>e.url&&!seen.has(e.url)&&(seen.add(e.url),true)));
export const V144_SOURCE_STATS=Object.freeze({total:V144_SOURCE_LEDGER.length,newReviewed:V144_NEW_RESEARCH_SOURCES.length,uniqueUrls:new Set(V144_SOURCE_LEDGER.map(e=>e.url)).size});
