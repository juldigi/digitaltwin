import {V141_SOURCE_LEDGER} from './research-v141.js';
const s=(id,machineScope,title,publisher,url,kind='INDUSTRIAL_BUILDING_REFERENCE',confidence='VISUAL_FUNCTIONAL_REFERENCE')=>Object.freeze({id,machineScope,title,publisher,url,kind,confidence,reviewBatch:'V142-2026-09-22'});
export const V142_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V142-PORTAL-FRAME-STEELINFO','FACTORY_BUILDING','Portal-frame design reference · primary/secondary steel, service loads and suspended plant coordination','SteelConstruction.info','https://steelconstruction.info/topics/design/portal-frames','STRUCTURAL_REFERENCE','INDUSTRY_TECHNICAL_REFERENCE'),
 s('V142-RADIN-PRINT-INTERIOR','FACTORY_BUILDING','Industrial printing-plant visual reference · overhead ventilation/piping, steel structure, pallets and service platforms','Radin Print','https://www.radinprint.hr/usluge-mogucnosti.php','PRINTING_PLANT_VISUAL_REFERENCE'),
 s('V142-CONTROL-MEDIA-PRINT-HALL','FACTORY_BUILDING','Printing production hall visual reference · exposed steel grid, linear lighting, material staging and marked circulation','Cool-FX / Control Media','https://www.coat-fx.com/en/news/improving-working-environment-with-cool-fx','PRINTING_PLANT_VISUAL_REFERENCE'),
 s('V142-TAMIR-PRINT-VENTILATION','FACTORY_BUILDING','Printing house installation reference · roof steel, suspended ducting, lighting and material-handling environment','BLACHmet','https://www.blachmet.com.pl/realizacje/drukarnia-tamir-bystrzyca-klodzka/','PRINTING_PLANT_VISUAL_REFERENCE'),
 s('V142-INDUSTRIAL-HVAC-HALL','FACTORY_BUILDING','Industrial hall climate-control visual reference · overhead duct/service coordination, loading openings, barriers and floor markings','Mark Climate Technology','https://www.mark.nl/sectoren/industrie/','INDUSTRIAL_HALL_VISUAL_REFERENCE')
]);
const seen=new Set();
export const V142_SOURCE_LEDGER=Object.freeze([...V142_NEW_RESEARCH_SOURCES,...V141_SOURCE_LEDGER].filter(e=>e.url&&!seen.has(e.url)&&(seen.add(e.url),true)));
export const V142_SOURCE_STATS=Object.freeze({
 total:V142_SOURCE_LEDGER.length,newReviewed:V142_NEW_RESEARCH_SOURCES.length,uniqueUrls:new Set(V142_SOURCE_LEDGER.map(e=>e.url)).size,
 oemOrPrimary:V142_SOURCE_LEDGER.filter(e=>/OEM_|PRIMARY_MECHANISM|EXACT_MODEL|MODEL_.*MANUAL|MODEL_INSTRUCTION/.test(String(e.kind)+' '+String(e.confidence))).length
});
