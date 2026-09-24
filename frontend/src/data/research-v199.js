import {V198_SOURCE_LEDGER} from './research-v198.js';
const s=(id,scope,title,publisher,url,kind='FACILITY_REALISM_REFERENCE',confidence='INDUSTRY_OR_REGULATORY_REFERENCE')=>Object.freeze({id,machineScope:scope,title,publisher,url,kind,confidence,reviewBatch:'V199-2026-09-24'});
export const V199_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V199-OSHA-WORKSTATION-CHAIRS','OFFICE_ADMIN_PPIC_QC','Computer workstation chairs · backrest, armrest, five-leg base and coordinated adjustment','OSHA','https://www.osha.gov/etools/computer-workstations/components/chairs','WORKSTATION_CHAIR_ERGONOMICS_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V199-OSHA-WORKSTATION-MONITORS','OFFICE_ADMIN_PPIC_QC','Computer workstation monitors · place directly in front of the user with appropriate viewing distance','OSHA','https://www.osha.gov/etools/computer-workstations/components/monitors','WORKSTATION_MONITOR_ORIENTATION_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V199-OSHA-WORKSTATION-DESKS','OFFICE_ADMIN_PPIC_QC','Computer workstation desks · work-surface depth, component placement and leg clearance','OSHA','https://www.osha.gov/etools/computer-workstations/components/desks','WORKSTATION_DESK_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V199-OSHA-WORKSTATION-EVALUATION','OFFICE_ADMIN_PPIC_QC','Computer workstation evaluation · head, neck and trunk facing forward toward work/monitor','OSHA','https://www.osha.gov/etools/computer-workstations/checklists/evaluation','WORKSTATION_FACING_REFERENCE','REGULATORY_GUIDANCE_REFERENCE')
]);
const seen=new Set();
export const V199_SOURCE_LEDGER=Object.freeze([...V199_NEW_RESEARCH_SOURCES,...V198_SOURCE_LEDGER].filter(e=>e.url&&!seen.has(e.url)&&(seen.add(e.url),true)));
export const V199_SOURCE_STATS=Object.freeze({total:V199_SOURCE_LEDGER.length,newReviewed:V199_NEW_RESEARCH_SOURCES.length,uniqueUrls:new Set(V199_SOURCE_LEDGER.map(e=>e.url)).size});
