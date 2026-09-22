import {V144_SOURCE_LEDGER} from './research-v144.js';
const s=(id,scope,title,publisher,url,kind='MICRO_REALISM_REFERENCE',confidence='INDUSTRY_TECHNICAL_REFERENCE')=>Object.freeze({id,machineScope:scope,title,publisher,url,kind,confidence,reviewBatch:'V145-2026-09-22'});
export const V145_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V145-OSHA-WH-PEDESTRIAN','WAREHOUSE','Powered industrial trucks · pedestrian traffic, marked walkways, barriers, convex mirrors and traffic controls','OSHA','https://www.osha.gov/etools/powered-industrial-trucks/workplace/pedestrian-traffic','WAREHOUSE_PEDESTRIAN_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V145-OSHA-WH-HAZARDS','WAREHOUSE','Warehousing hazards and solutions · rack protection, stable loads and material handling','OSHA','https://www.osha.gov/warehousing/hazards-solutions','WAREHOUSE_SAFETY_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V145-OSHA-WH-AISLES','WAREHOUSE','Powered industrial trucks · conventional and narrow aisle workplace considerations','OSHA','https://www.osha.gov/etools/powered-industrial-trucks/workplace/narrow-aisles','WAREHOUSE_AISLE_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V145-OSHA-OFFICE-ENV','OFFICE_ADMIN','Computer Workstations eTool · diffuse lighting, glare control, ventilation and diffuser placement','OSHA','https://www.osha.gov/etools/computer-workstations/workstation-environment','OFFICE_CEILING_ENVIRONMENT_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V145-OSHA-OFFICE-MONITOR','OFFICE_ADMIN','Computer Workstations eTool · monitor position and workstation geometry','OSHA','https://www.osha.gov/etools/computer-workstations/components/monitors','OFFICE_ERGONOMICS_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V145-OSHA-EXIT-ROUTES','FACILITY_SAFETY','29 CFR 1910.37 · unobstructed exit routes, lighting and marking','OSHA','https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.37','EGRESS_REFERENCE','REGULATORY_STANDARD_REFERENCE'),
 s('V145-OSHA-EXTINGUISHERS','FACILITY_SAFETY','29 CFR 1910.157 · accessible and identified portable fire extinguishers','OSHA','https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.157','FIRE_PROTECTION_REFERENCE','REGULATORY_STANDARD_REFERENCE'),
 s('V145-STORA-BOARD-STORAGE','RMS_WAREHOUSE','Paperboard storage · keep moisture barrier until acclimatized; 50–55% RH and 20–23°C reference','Stora Enso','https://www.storaenso.com/-/media/documents/download-center/documents/product-specifications/paperboard-materials/performa-natura-pe-15-en.pdf','PAPERBOARD_STORAGE_REFERENCE')
]);
const seen=new Set();
export const V145_SOURCE_LEDGER=Object.freeze([...V145_NEW_RESEARCH_SOURCES,...V144_SOURCE_LEDGER].filter(e=>e.url&&!seen.has(e.url)&&(seen.add(e.url),true)));
export const V145_SOURCE_STATS=Object.freeze({total:V145_SOURCE_LEDGER.length,newReviewed:V145_NEW_RESEARCH_SOURCES.length,uniqueUrls:new Set(V145_SOURCE_LEDGER.map(e=>e.url)).size});
