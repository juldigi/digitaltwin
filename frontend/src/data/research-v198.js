import {V147_SOURCE_LEDGER} from './research-v147.js';
const s=(id,scope,title,publisher,url,kind='FACILITY_REALISM_REFERENCE',confidence='INDUSTRY_OR_REGULATORY_REFERENCE')=>Object.freeze({id,machineScope:scope,title,publisher,url,kind,confidence,reviewBatch:'V198-2026-09-24'});
export const V198_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V198-OSHA-STORAGE-AISLES','WAREHOUSE_RMS_FG','29 CFR 1910.176 · handling materials, safe clearances, marked aisles and stable storage','OSHA','https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.176','WAREHOUSE_AISLE_STORAGE_REFERENCE','REGULATORY_STANDARD_REFERENCE'),
 s('V198-OSHA-WALKING-SURFACES','FACTORY_FLOOR','29 CFR 1910.22 · walking-working surfaces, housekeeping and floor condition','OSHA','https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.22','INDUSTRIAL_FLOOR_HOUSEKEEPING_REFERENCE','REGULATORY_STANDARD_REFERENCE'),
 s('V198-OSHA-PIT','WAREHOUSE_RMS_FG','Powered industrial trucks · operating environment and material-handling context','OSHA','https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.178','MATERIAL_HANDLING_REFERENCE','REGULATORY_STANDARD_REFERENCE'),
 s('V198-HSE-WAREHOUSING','WAREHOUSE_RMS_FG','Warehousing and storage · workplace transport, storage and pedestrian risk context','UK Health and Safety Executive','https://www.hse.gov.uk/logistics/warehousing.htm','WAREHOUSE_LAYOUT_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V198-HSE-WORKPLACE-TRANSPORT','FACTORY_TRAFFIC','Workplace transport · separating pedestrians and vehicles','UK Health and Safety Executive','https://www.hse.gov.uk/workplacetransport/separating.htm','PEDESTRIAN_VEHICLE_SEPARATION_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V198-IPB-PACKAGING-WAREHOUSE','RMS_WAREHOUSE','Optimasi tata letak unit gudang packaging di raw material warehouse PT XYZ','IPB University Repository','https://repository.ipb.ac.id/handle/123456789/179558','INDONESIA_PACKAGING_WAREHOUSE_CONTEXT','ACADEMIC_CONTEXT_REFERENCE'),
 s('V198-MITSUI-EPOXY','FACTORY_FLOOR','Indonesia warehouse clean-room example · epoxy-covered floor for dust control','Mitsui-Soko Indonesia','https://www.mitsui-soko.co.id/services/warehousing','INDONESIA_WAREHOUSE_FLOOR_CONTEXT','INDUSTRY_CONTEXT_REFERENCE'),
 s('V198-COMMONWEALTH-PAPER-STORAGE','RMS_WAREHOUSE','Paper warehouse moisture control · keep paper off concrete and protect during storage/handling','Commonwealth Inc.','https://www.commonwealthinc.com/insights/paper-warehouse-moisture-control-protect-quality-year-round','PAPER_STORAGE_HANDLING_REFERENCE','INDUSTRY_CONTEXT_REFERENCE')
]);
const seen=new Set();
export const V198_SOURCE_LEDGER=Object.freeze([...V198_NEW_RESEARCH_SOURCES,...V147_SOURCE_LEDGER].filter(e=>e.url&&!seen.has(e.url)&&(seen.add(e.url),true)));
export const V198_SOURCE_STATS=Object.freeze({total:V198_SOURCE_LEDGER.length,newReviewed:V198_NEW_RESEARCH_SOURCES.length,uniqueUrls:new Set(V198_SOURCE_LEDGER.map(e=>e.url)).size});
