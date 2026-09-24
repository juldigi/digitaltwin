import {V201_SOURCE_LEDGER} from './research-v201.js';
const s=(id,scope,title,publisher,url,kind='FACILITY_REALISM_REFERENCE',confidence='INDUSTRY_OR_REGULATORY_REFERENCE')=>Object.freeze({id,machineScope:scope,title,publisher,url,kind,confidence,reviewBatch:'V202-2026-09-24'});
export const V202_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V202-HSE-PRINT-WALKWAYS','PRODUCTION_ROOM_ACCESS','Printing production areas · keep walkways marked and clear; designate pallet/trolley storage and waste bins','UK Health and Safety Executive','https://www.hse.gov.uk/printing/slips/production.htm','PRINTING_ROOM_CIRCULATION_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V202-OSHA-MATERIAL-AISLES','WAREHOUSE_ROOM_ACCESS','29 CFR 1910.176 · safe clearances at aisles, doorways and loading docks; stable storage and clear passageways','OSHA','https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.176','ROOM_AND_AISLE_CLEARANCE_REFERENCE','REGULATORY_STANDARD_REFERENCE'),
 s('V202-OSHA-WORKSTATION-MONITOR','OFFICE_ADMIN_PPIC_QC','Computer workstation monitors · directly in front of the user and coordinated with chair/desk','OSHA','https://www.osha.gov/etools/computer-workstations/components/monitors','WORKSTATION_FACING_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V202-OSHA-WORKSTATION-DESK','OFFICE_ADMIN_PPIC_QC','Computer workstation desks · adequate depth, leg clearance and primary work-zone component placement','OSHA','https://www.osha.gov/etools/computer-workstations/components/desks','WORKSTATION_LAYOUT_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V202-OSHA-WORKSTATION-EVALUATION','OFFICE_ADMIN_PPIC_QC','Computer workstation evaluation · monitor directly in front and sufficient clearance for neutral posture','OSHA','https://www.osha.gov/etools/computer-workstations/checklists/evaluation','WORKSTATION_CLEARANCE_REFERENCE','REGULATORY_GUIDANCE_REFERENCE')
]);
const seen=new Set();
export const V202_SOURCE_LEDGER=Object.freeze([...V202_NEW_RESEARCH_SOURCES,...V201_SOURCE_LEDGER].filter(e=>e.url&&!seen.has(e.url)&&(seen.add(e.url),true)));
export const V202_SOURCE_STATS=Object.freeze({total:V202_SOURCE_LEDGER.length,newReviewed:V202_NEW_RESEARCH_SOURCES.length,uniqueUrls:new Set(V202_SOURCE_LEDGER.map(e=>e.url)).size});
