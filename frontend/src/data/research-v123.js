import {V122_SOURCE_LEDGER} from './research-v122.js';
const s=(id,machineScope,title,publisher,url,kind='TECHNICAL_REFERENCE',confidence='OEM_PRIMARY')=>Object.freeze({id,machineScope,title,publisher,url,kind,confidence,reviewBatch:'V123-2026-09-21'});
export const V123_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V123-CX104-TECH','OFFSET8/OFFSET10','Speedmaster CX 104 technical data','HEIDELBERG','https://www.heidelberg.com/global/en/print_and_packaging/products/offset_printing/format_70_x_100/speedmaster_cx_104/technical_data/technical_data_cx_104.jsp','OEM_TECHNICAL_DATA'),
 s('V123-CX104-PRODUCT','OFFSET8/OFFSET10','Speedmaster CX 104 product architecture · AirTransfer, coating, delivery, dryer','HEIDELBERG','https://www.heidelberg.com/global/en/print_and_packaging/products/offset_printing/format_70_x_100/speedmaster_cx_104/product_information_5/product_information_cx_104.jsp','OEM_PRODUCT'),
 s('V123-CX104-ID','OFFSET8/OFFSET10','Speedmaster CX 104 Indonesia product reference','HEIDELBERG Indonesia','https://www.heidelberg.com/id/id/printing/offset_printing/speedmaster_cx_104.jsp','OEM_PRODUCT'),
 s('V123-FOILSTAR','OFFSET10','FoilStar cold transfer module · CX104 compatibility and indexing','HEIDELBERG','https://www.heidelberg.com/global/en/print_and_packaging/products/offset_printing/peripherals/printing_and_coating_unit/foil_star/product_information_19/foil_star.jsp','OEM_PRODUCT'),
 s('V123-CX104-2025','OFFSET8/OFFSET10','CX104 current configuration range and installed fleet','HEIDELBERG','https://www.heidelberg.com/global/en/about_heidelberg/press_relations/press_release/press_release_details/press_release_250369.jsp','OEM_TECHNICAL_NEWS'),
 s('V123-DIANA55','DIANAEYE55','Diana Eye 55 · cameras, suction belt, ejection, light sources','Masterwork','https://www.masterworkgroup.com/inspection-machine/diana-eye-55.html','OEM_PRODUCT'),
 s('V123-DIANA4255','DIANAEYE55','MK Diana Eye 42/55 · feeding knife, vibration/air, ultrasonic double-sheet, 8K','Masterwork','https://www.masterworkgroup.com/inspection-machine/mk-550qmini-inspection-machine.html','OEM_PRODUCT'),
 s('V123-SUPRA-A106','CTP','Suprasetter A106/106 · temperature stabilizer, internal punch, debris removal','HEIDELBERG','https://www.heidelberg.com/global/en/print_and_packaging/products/computer_to_plate_1/suprasetter_a106_106__106_uv/product_information_95/suprasetter_a106_106.jsp','OEM_PRODUCT'),
 s('V123-SUPRA-MANUAL','CTP','Suprasetter A106 user guide · imaging drum cleaning, punch waste, air filter','ManualsLib mirror','https://www.manualslib.com/manual/1730849/Heidelberg-Suprasetter-A106.html','MODEL_USER_MANUAL','MODEL_FAMILY_MANUAL'),
 s('V123-ZUND-G3','ZUND','Zünd G3 · zoned vacuum, beam height, ITI, ARC capability','Zünd','https://www.zund.com/en/cutting-systems/digital-cutting-systems/g3-cutter','OEM_PRODUCT'),
 s('V123-ZUND-ICC','ZUND','Integrated Compact Color Camera · LED lighting and laser pointer','Zünd','https://www.zund.com/en/cutting-systems/registration-methods/integrated-compact-color-camera','OEM_PRODUCT'),
 s('V123-ZUND-TANDEM','ZUND','G3 tandem vacuum operation · independently switchable plates','Zünd','https://www.zund.com/en/cutting-systems/digital-cutting-systems/g3-cutter/tandem-operation-g3','OEM_PRODUCT'),
 s('V123-ZUND-URT','ZUND','Universal Routing Tool · spindle, dust extraction and cooling','Zünd','https://www.zund.com/en/cutting-systems/modules-and-tools/universal-routing-tool-urt','OEM_TOOL_REFERENCE'),
 s('V123-ZUND-MODULES','ZUND','Zünd G3 modules and tools catalog','Zünd','https://www.zund.com/en/cutting-systems/modules-and-tools','OEM_TOOL_INDEX'),
 s('V123-ATLAS-MANUALS','COMPRESSOR','Atlas Copco official GA manuals portal','Atlas Copco Indonesia','https://www.atlascopco.com/id-id/compressors/manuals','OEM_MANUAL_INDEX'),
 s('V123-ATLAS-GA26','COMPRESSOR','GA26 oil-injected rotary screw compressor instruction book','ManualsLib mirror','https://www.manualslib.com/manual/3853961/Atlas-Copco-Ga-26.html','MODEL_INSTRUCTION_BOOK','MODEL_FAMILY_MANUAL'),
 s('V123-ATLAS-GA11-30','COMPRESSOR','GA11+–GA30 flow diagram · air/oil separator, MPV, coolers and oil circuit','Manualzz','https://manualzz.com/doc/71068967/atlas-copco-ga-11---ga-26--instruction-book','MODEL_INSTRUCTION_BOOK','MODEL_FAMILY_MANUAL'),
 s('V123-BOBST-GRIPPER','APM2','BOBST gripper-bar transport through cutting, stripping and blank separation','Google Patents','https://patents.google.com/patent/US20030107167A1/en','PRIMARY_MECHANISM','PRIMARY_MECHANISM'),
 s('V123-BOBST-BLANK','APM2','BOBST blank separation and frontal/side register process','Google Patents','https://patents.google.com/patent/US5810233A/es','PRIMARY_MECHANISM','PRIMARY_MECHANISM'),
 s('V123-BOBST-FOLD','MEDIA100','BOBST modular folding device for folder-gluer','Google Patents','https://patents.google.com/patent/US5762597A/en','PRIMARY_MECHANISM','PRIMARY_MECHANISM')
]);
const seen=new Set();
export const V123_SOURCE_LEDGER=Object.freeze([...V123_NEW_RESEARCH_SOURCES,...V122_SOURCE_LEDGER].filter(e=>e.url&&!seen.has(e.url)&&(seen.add(e.url),true)));
export const V123_SOURCE_STATS=Object.freeze({
 total:V123_SOURCE_LEDGER.length,
 newReviewed:V123_NEW_RESEARCH_SOURCES.length,
 oemOrPrimary:V123_SOURCE_LEDGER.filter(e=>/OEM_|PRIMARY_MECHANISM|MODEL_.*MANUAL|MODEL_INSTRUCTION/.test(String(e.kind)+' '+String(e.confidence))).length
});
