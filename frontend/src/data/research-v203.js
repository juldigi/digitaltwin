import {V202_SOURCE_LEDGER} from './research-v202.js';
const s=(id,scope,title,publisher,url,kind='FACILITY_REALISM_REFERENCE',confidence='INDUSTRY_OR_REGULATORY_REFERENCE')=>Object.freeze({id,machineScope:scope,title,publisher,url,kind,confidence,reviewBatch:'V203-2026-09-24'});
export const V203_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V203-HSE-PRINT-PRODUCTION','PRODUCTION_CIRCULATION','Printing production areas · marked clear walkways, designated pallet loading/unloading and trolley storage, bins for strapping/wrapping/paper','UK Health and Safety Executive','https://www.hse.gov.uk/printing/slips/production.htm','PRINTING_CIRCULATION_HOUSEKEEPING_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V203-OSHA-1910-176','WAREHOUSE_DOOR_AISLE','29 CFR 1910.176 · clear aisles, loading docks and doorways; stable storage and housekeeping','OSHA','https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.176','MATERIAL_HANDLING_CLEARANCE_REFERENCE','REGULATORY_STANDARD_REFERENCE'),
 s('V203-OSHA-DESK','OFFICE_ADMIN_PPIC_QC','Desk/work surface · monitor directly in front, primary work-zone items close, under-desk leg clearance kept free','OSHA','https://www.osha.gov/etools/computer-workstations/components/desks','WORKSTATION_DESK_AND_LEG_CLEARANCE_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V203-OSHA-MONITOR','OFFICE_ADMIN_PPIC_QC','Monitor placement · directly in front of user and coordinated with chair/desk, typically 20–40 inches viewing distance','OSHA','https://www.osha.gov/etools/computer-workstations/components/monitors','WORKSTATION_MONITOR_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V203-OSHA-EVALUATION','OFFICE_ADMIN_PPIC_QC','Computer workstation evaluation checklist · front-facing monitor and adequate clearance','OSHA','https://www.osha.gov/etools/computer-workstations/checklists/evaluation','WORKSTATION_LAYOUT_AUDIT_REFERENCE','REGULATORY_GUIDANCE_REFERENCE')
]);
const seen=new Set();
export const V203_SOURCE_LEDGER=Object.freeze([...V203_NEW_RESEARCH_SOURCES,...V202_SOURCE_LEDGER].filter(e=>e.url&&!seen.has(e.url)&&(seen.add(e.url),true)));
export const V203_SOURCE_STATS=Object.freeze({total:V203_SOURCE_LEDGER.length,newReviewed:V203_NEW_RESEARCH_SOURCES.length,uniqueUrls:new Set(V203_SOURCE_LEDGER.map(e=>e.url)).size});
