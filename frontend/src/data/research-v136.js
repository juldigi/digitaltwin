import {V123_SOURCE_LEDGER} from './research-v123.js';
const s=(id,machineScope,title,publisher,url,kind='TECHNICAL_REFERENCE',confidence='OEM_PRIMARY')=>Object.freeze({id,machineScope,title,publisher,url,kind,confidence,reviewBatch:'V136-2026-09-22'});
export const V136_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V136-SUPRA-OVERVIEW','CTP','Suprasetter CtP overview · IDS, automation, extraction, punching and temperature-control matrix','HEIDELBERG','https://www.heidelberg.com/global/en/print_and_packaging/products/computer_to_plate_1/prepress_overview.jsp','OEM_PRODUCT_INDEX'),
 s('V136-BOBST-EXPERT-CORR','FGM2','EXPERTFOLD 106/145/165/215 · prebreaking, driven belts, folding and modular box capabilities','BOBST','https://www.bobst.com/sea/en/products/folding-gluing/expertfold-145-165','OEM_PROCESS_REFERENCE'),
 s('V136-BOBST-EXPERT-FC','FGM2','EXPERTFOLD 50/80/110 · prebreaker, folding, delivery and pressure-zone architecture','BOBST','https://www.bobst.com/na/en/products/folding-gluing/expertfold-50-80-110','OEM_PROCESS_REFERENCE'),
 s('V136-BOBST-MASTERFOLD-2026','FGM2','MASTERFOLD 170/230/300 modernization · folding-gluing platform architecture','BOBST','https://www.bobst.com/afr/en/news/bobst-launches-brand-new-masterfold-line-built-on-fully-redesigned-platform','OEM_TECHNICAL_NEWS'),
 s('V136-BOBST-FG-INDEX','FGM2','BOBST folder-gluer range · modular inline process families','BOBST','https://lebackend.bobst.com/usen/products/folding-gluing/folder-gluers/','OEM_PRODUCT_INDEX'),
 s('V136-BOBST-MASTERFOLD','FGM2','MASTERFOLD 170/230/300/350 · modular folding/gluing and quality-control boundaries','BOBST','https://www.bobst.com/sven/products/folding-gluing/folder-gluers/overview/machine/masterfold-170-230-300-350/','OEM_PROCESS_REFERENCE'),
 s('V136-BOBST-REAR-STACK','FGM2','VISIONFOLD rear-stack corrector · fishtail correction in folded-box delivery','BOBST','https://www.bobst.com/eu/en/news/1707121801-reedbut-increases-productivity-by-20-with-bobst-rear-stack-corrector-upgrade-on-its-visionfold-170','OEM_PROCESS_REFERENCE'),
 s('V136-BOBST-NOVAFOLD-UPGRADE','FGM2','NOVAFOLD 2025 update · extended folding section and controlled folding','BOBST','https://media.bobst.com/en/news/detail/article/1753435202-bobst-novafold-evolves-with-powerful-new-upgrades-to-drive-efficiency-and-precision/','OEM_TECHNICAL_NEWS'),
 s('V136-BOBST-ASSEMBLY-PATENT','FGM2','Folder-gluer process chain · feed, prebreak, fold/glue, eject, shingle delivery and pressing','Google Patents / BOBST','https://patents.google.com/patent/US7331915B2/en','PRIMARY_MECHANISM','PRIMARY_MECHANISM'),
 s('V136-BOBST-ALIGN-PATENT','FGM2','Feeding/alignment device for folded-glued blanks before pressure delivery','Google Patents / BOBST','https://patents.google.com/patent/EP1350617B1/en','PRIMARY_MECHANISM','PRIMARY_MECHANISM'),
 s('V136-BOBST-BLANK-ALIGN','FGM2','Blank alignment device in folder-gluer','Google Patents / BOBST','https://patents.google.com/patent/EP0381845B1/en','PRIMARY_MECHANISM','PRIMARY_MECHANISM'),
 s('V136-BOBST-FRONT-FOLD-A','FGM2','Front-panel turning mechanism in folder-gluer','Google Patents / BOBST','https://patents.google.com/patent/EP0876904A2/en','PRIMARY_MECHANISM','PRIMARY_MECHANISM'),
 s('V136-BOBST-FRONT-FOLD-B','FGM2','Granted front-panel turning mechanism in folder-gluer','Google Patents / BOBST','https://patents.google.com/patent/EP0876904B1/en','PRIMARY_MECHANISM','PRIMARY_MECHANISM'),
 s('V136-BOBST-POSITION-CORRECT','FGM2','Position correction for folded blank in folder-gluer','Google Patents / BOBST','https://patents.google.com/patent/EP3224039A1/en','PRIMARY_MECHANISM','PRIMARY_MECHANISM'),
 s('V136-BOBST-OPTICAL-CONTROL','FGM2','Optical blank-control device in folder-gluer','Google Patents / BOBST','https://patents.google.com/patent/EP3221221B2/en','PRIMARY_MECHANISM','PRIMARY_MECHANISM'),
 s('V136-BOBST-CORRECTION-ROLLER','FGM2','Correction roller/belt for lateral alignment in folder-gluer','Google Patents / BOBST','https://patents.google.com/patent/CH693177A5/en','PRIMARY_MECHANISM','PRIMARY_MECHANISM'),
 s('V136-BOBST-FOLDING-DEVICE','FGM2','Folding-sheet device in folding-gluing machine','Google Patents / BOBST','https://patents.google.com/patent/EP0458066A1/en','PRIMARY_MECHANISM','PRIMARY_MECHANISM'),
 s('V136-HORIZON-VACL600H','COLLATOR','VAC-L600H · individual bin blowing and rotary suction rotor feeding','Horizon International','https://www.horizon.co.jp/products/en/products/collators/vacl600h/vacl600h_e.html','OEM_PRODUCT_REFERENCE','CROSS_FAMILY_PROCESS_REFERENCE'),
 s('V136-DUPLO-DSC1060I','COLLATOR','DSC-10/60i · ten-bin dual-fan air separation and double-feed sensing','Duplo USA','https://www.duplousa.com/product/dsc-10-60i-collator/','OEM_PRODUCT_REFERENCE','CROSS_FAMILY_PROCESS_REFERENCE'),
 s('V136-ZUND-UM','ZUND','Universal Module · bayonet interface, tool detection and pressure/position modes','Zünd','https://www.zund.com/en/cutting-systems/modules-and-tools/universal-module','OEM_TOOL_REFERENCE'),
 s('V136-ZUND-EOT','ZUND','Electric Oscillating Tool capability reference','Zünd','https://www.zund.com/en/cutting-systems/modules-and-tools/electric-oscillating-tool-eot','OEM_TOOL_REFERENCE'),
 s('V136-ZUND-CTT1','ZUND','Creasing Tool Type 1 capability reference','Zünd','https://www.zund.com/en/cutting-systems/modules-and-tools/creasing-tool-type-1-ctt1','OEM_TOOL_REFERENCE'),
 s('V136-ZUND-UCT','ZUND','Universal Cutting Tool capability reference','Zünd','https://www.zund.com/en/cutting-systems/modules-and-tools/universal-cutting-tool-uct','OEM_TOOL_REFERENCE'),
 s('V136-ZUND-POT','ZUND','Pneumatic Oscillating Tool capability reference','Zünd','https://www.zund.com/en/cutting-systems/modules-and-tools/pneumatic-oscillating-tool-pot','OEM_TOOL_REFERENCE'),
 s('V136-ZUND-SCT','ZUND','Scoring Cutting Tool capability reference','Zünd','https://www.zund.com/en/cutting-systems/modules-and-tools/scoring-cutting-tool-sct','OEM_TOOL_REFERENCE'),
 s('V136-ZUND-WKT','ZUND','Wheel Knife Tool capability reference','Zünd','https://www.zund.com/en/cutting-systems/modules-and-tools/wheel-knife-tool-wkt','OEM_TOOL_REFERENCE'),
 s('V136-ZUND-VCT1','ZUND','V-Cutting Tool VCT1 capability reference','Zünd','https://www.zund.com/en/cutting-systems/modules-and-tools/v-cutting-tool-vct1','OEM_TOOL_REFERENCE'),
 s('V136-ZUND-KCM','ZUND','Kiss-Cut Module · pressure and position modes','Zünd','https://www.zund.com/en/cutting-systems/modules-and-tools/kiss-cut-module','OEM_TOOL_REFERENCE'),
 s('V136-ZUND-TOOLS-BOOK','ZUND','Modules & Tools 2026 reference catalogue','Zünd','https://books.zund.com/modulesandtools-en/page/2','OEM_TOOL_CATALOG')
]);
const seen=new Set();
export const V136_SOURCE_LEDGER=Object.freeze([...V136_NEW_RESEARCH_SOURCES,...V123_SOURCE_LEDGER].filter(e=>e.url&&!seen.has(e.url)&&(seen.add(e.url),true)));
export const V136_SOURCE_STATS=Object.freeze({
 total:V136_SOURCE_LEDGER.length,
 newReviewed:V136_NEW_RESEARCH_SOURCES.length,
 uniqueUrls:new Set(V136_SOURCE_LEDGER.map(e=>e.url)).size,
 oemOrPrimary:V136_SOURCE_LEDGER.filter(e=>/OEM_|PRIMARY_MECHANISM|MODEL_.*MANUAL|MODEL_INSTRUCTION/.test(String(e.kind)+' '+String(e.confidence))).length
});
