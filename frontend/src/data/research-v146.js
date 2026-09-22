import {V145_SOURCE_LEDGER} from './research-v145.js';
const s=(id,scope,title,publisher,url,kind='FURNITURE_DETAIL_REFERENCE',confidence='INDUSTRY_TECHNICAL_REFERENCE')=>Object.freeze({id,machineScope:scope,title,publisher,url,kind,confidence,reviewBatch:'V146-2026-09-22'});
export const V146_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V146-OSHA-WORKSTATION-COMPONENTS','OFFICE_ADMIN','Computer workstation components · chairs, desks, document holders, keyboards, monitors, pointer devices and telephones','OSHA','https://www.osha.gov/etools/computer-workstations/components/','OFFICE_FURNITURE_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V146-OSHA-CHAIRS','OFFICE_ADMIN','Computer Workstations eTool · chair backrest, seat, armrest, five-leg base and casters','OSHA','https://www.osha.gov/etools/computer-workstations/components/chairs','TASK_CHAIR_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V146-OSHA-DESKS','OFFICE_ADMIN','Computer Workstations eTool · desk surface, leg clearance and primary work zone','OSHA','https://www.osha.gov/etools/computer-workstations/components/desks','DESK_REFERENCE','REGULATORY_GUIDANCE_REFERENCE'),
 s('V146-STEELCASE-THINK','OFFICE_ADMIN','Think task chair · adjustable arms, lumbar/back, five-star base and caster proportions','Steelcase','https://www.steelcase.com/eu-en/products/office-chairs/think/','TASK_CHAIR_VISUAL_REFERENCE'),
 s('V146-STEELCASE-SEATING','OFFICE_ADMIN','Steelcase seating specification · pneumatic height, adjustable arms, five-arm base and dual-wheel casters','Steelcase','https://www.steelcase.com/content/uploads/2019/08/seating.pdf','TASK_CHAIR_COMPONENT_REFERENCE'),
 s('V146-LYON-LOCKER','LOCKER_ROOM','Locker room benches, lockers and storage cabinet elevation references','Lyon Workspace','https://www.lyonworkspace.com/resource-center/elevations/','LOCKER_FURNITURE_REFERENCE'),
 s('V146-LABCONCO-WORKSPACE','QC_ROOM','Laboratory workspace organization · carts, shelves, seating and work-surface accessories','Labconco','https://www.labconco.com/category/parts-accessories/accessories/biosafety-cabinets-laminar-flow/clean-bench-accessories/nexus-horizontal-clean-bench-accessories/workspace-organization','QC_WORKSPACE_REFERENCE')
]);
const seen=new Set();
export const V146_SOURCE_LEDGER=Object.freeze([...V146_NEW_RESEARCH_SOURCES,...V145_SOURCE_LEDGER].filter(e=>e.url&&!seen.has(e.url)&&(seen.add(e.url),true)));
export const V146_SOURCE_STATS=Object.freeze({total:V146_SOURCE_LEDGER.length,newReviewed:V146_NEW_RESEARCH_SOURCES.length,uniqueUrls:new Set(V146_SOURCE_LEDGER.map(e=>e.url)).size});
