import {V146_SOURCE_LEDGER} from './research-v146.js';
const s=(id,title,publisher,url,kind)=>Object.freeze({id,machineScope:'IPAL_WATER_TREATMENT',title,publisher,url,kind,confidence:'AUTHORITATIVE_FUNCTIONAL_REFERENCE',reviewBatch:'V147-2026-09-22'});
export const V147_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V147-EPA-PRELIMINARY','Preliminary Wastewater Treatment · screening, grit removal and flow equalization','US EPA','https://www.epa.gov/system/files/documents/2023-10/tawebinar_preliminarywastewatertreatment_230725.pdf','PRELIMINARY_TREATMENT_REFERENCE'),
 s('V147-EPA-SCREENING','Wastewater Technology Fact Sheet · Screening and Grit Removal','US EPA','https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P1000S7N.TXT','SCREENING_REFERENCE'),
 s('V147-EPA-EQUALIZATION','Flow Equalization','US EPA','https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=2000QTKP.TXT','EQUALIZATION_REFERENCE'),
 s('V147-EPA-CLARIFIER','Process Design Manual for Suspended Solids Removal','US EPA','https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=9101AVYN.TXT','CLARIFIER_WEIR_SCUM_REFERENCE'),
 s('V147-EPA-BACKWASH','Filter Backwash Recycling Rule Technical Guidance Manual','US EPA','https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=200025V5.TXT','FILTER_BACKWASH_REFERENCE'),
 s('V147-OSHA-CONFINED','Permit-required confined spaces · entrance opening protection','OSHA','https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.146','MANHOLE_SAFETY_REFERENCE'),
 s('V147-OSHA-H2S','Hydrogen Sulfide in Workplaces','OSHA','https://www.osha.gov/hydrogen-sulfide/hydrogen-sulfide-workplaces','WASTEWATER_HAZARD_CONTEXT')
]);
const seen=new Set();
export const V147_SOURCE_LEDGER=Object.freeze([...V147_NEW_RESEARCH_SOURCES,...V146_SOURCE_LEDGER].filter(e=>e.url&&!seen.has(e.url)&&(seen.add(e.url),true)));
export const V147_SOURCE_STATS=Object.freeze({total:V147_SOURCE_LEDGER.length,newReviewed:V147_NEW_RESEARCH_SOURCES.length,uniqueUrls:new Set(V147_SOURCE_LEDGER.map(e=>e.url)).size});
