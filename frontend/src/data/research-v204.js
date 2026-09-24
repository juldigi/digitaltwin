import {V203_SOURCE_LEDGER} from './research-v203.js';
const s=(id,scope,title,publisher,url,kind='FACILITY_REALISM_REFERENCE',confidence='INDUSTRY_OR_REGULATORY_REFERENCE')=>Object.freeze({id,machineScope:scope,title,publisher,url,kind,confidence,reviewBatch:'V204-2026-09-24'});
export const V204_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V204-HSE-DSE-CHECKLIST','OFFICE_ADMIN_PPIC_QC','Display screen equipment workstation checklist · assess display, furniture and work environment together','UK Health and Safety Executive','https://www.hse.gov.uk/pubns/ck1.htm','WORKSTATION_ASSESSMENT_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V204-HSE-SITE-ROUTES','FACTORY_CIRCULATION','Site layout and internal traffic routes · appropriate pedestrian/vehicle routes, crossings and parking areas','UK Health and Safety Executive','https://www.hse.gov.uk/workplacetransport/checklist/section2.htm','FACTORY_ROUTE_LAYOUT_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V204-HSE-SAFE-WORKPLACE','FACTORY_CIRCULATION','Creating a safe workplace · unobstructed routes, adequate width, separate marked pedestrian and vehicle areas','UK Health and Safety Executive','https://www.hse.gov.uk/workplacetransport/information/safeworkplace.htm','FACTORY_CIRCULATION_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V204-HSE-DSE-POSTURE','OFFICE_ADMIN_PPIC_QC','Standard workstation setup · screen and keyboard central, screen directly in front, mouse aligned with elbow','UK Health and Safety Executive','https://www.hse.gov.uk/msd/dse/good-posture.htm','WORKSTATION_POSTURE_REFERENCE','REGULATORY_GUIDANCE_REFERENCE')
]);
const seen=new Set();
export const V204_SOURCE_LEDGER=Object.freeze([...V204_NEW_RESEARCH_SOURCES,...V203_SOURCE_LEDGER].filter(e=>e.url&&!seen.has(e.url)&&(seen.add(e.url),true)));
export const V204_SOURCE_STATS=Object.freeze({total:V204_SOURCE_LEDGER.length,newReviewed:V204_NEW_RESEARCH_SOURCES.length,uniqueUrls:new Set(V204_SOURCE_LEDGER.map(e=>e.url)).size});
