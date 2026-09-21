import {V121_SOURCE_LEDGER} from './research-v121.js';

const s=(id,machineScope,title,publisher,url,kind='TECHNICAL_REFERENCE',confidence='FAMILY_REFERENCE')=>Object.freeze({
 id,machineScope,title,publisher,url,kind,confidence,reviewBatch:'V122-2026-09-21'
});

export const V122_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V122-CD102-MANUAL','OFFSET5','Speedmaster CD 102 Preset Plus feeder / maintenance manual, 170 pages','ManualsLib mirror','https://www.manualslib.com/manual/3873618/Heidelberg-Speedmaster-Cd-102.html','OPERATOR_SERVICE_MANUAL','MODEL_FAMILY_MANUAL'),
 s('V122-CD102-MANUAL-INDEX','OFFSET5','Speedmaster CD 102 manual index and chapter map','ManualsLib','https://www.manualslib.com/products/Heidelberg-Speedmaster-Cd-102-11448575.html','MANUAL_INDEX','MODEL_FAMILY_MANUAL'),
 s('V122-CD102-FRONT-LAYS','OFFSET5','Speedmaster CD 102 manual page 96 · fifteen front lays','ManualsLib mirror','https://www.manualslib.com/manual/3873618/Heidelberg-Speedmaster-Cd-102.html?page=96','MODEL_MANUAL_PAGE','MODEL_FAMILY_MANUAL'),
 s('V122-CD102-PRESETPLUS','OFFSET5','Preset Plus feeder operating manual · pull lays, detectors, suction tape','Manualzz','https://manualzz.com/doc/30119591/heidelberg-preset-plus-feeder-operating-manual','OPERATOR_MANUAL','MODEL_FAMILY_MANUAL'),
 s('V122-SM102-MANUAL','OFFSET5','Speedmaster SM 102 / CD 102 shared Preset Plus service reference','ManualsLib mirror','https://www.manualslib.com/manual/2028000/Heidelberg-Speedmaster-Sm-102.html','SERVICE_MANUAL','MODEL_FAMILY_CROSSCHECK'),
 s('V122-CX104-OPMAN','OFFSET8/OFFSET10','Speedmaster CX104 print operating manual archive','Scribd archive','https://www.scribd.com/document/754517591/Operating-Manual-CX104-Print','OPERATOR_MANUAL_ARCHIVE','MODEL_MANUAL'),
 s('V122-CX104-PRESS','OFFSET8/OFFSET10','CX104 long configuration and unit-family press release','HEIDELBERG','https://www.heidelberg.com/global/en/about_heidelberg/press_relations/press_release/press_release_details/press_release_250369.jsp','OEM_TECHNICAL_NEWS','OEM_PRIMARY'),
 s('V122-FOILSTAR-PRODUCT','OFFSET10','FoilStar cold-transfer module architecture and compatible presses','HEIDELBERG','https://www.heidelberg.com/global/en/print_and_packaging/products/offset_printing/peripherals/printing_and_coating_unit/foil_star/product_information_19/foil_star.jsp','OEM_PRODUCT','OEM_PRIMARY'),
 s('V122-CD102-USED-PHOTO-8LX','OFFSET5','CD102-8 LX feeder / unit / delivery installed-machine visual set','pressXchange','https://www.pressxchange.com/en/8-color-heidelberg-cd-102-8-lx-coater-pree-set-feeder-and-delivery-year-1996/machine-id/65710/','INSTALLED_MACHINE_VISUAL','SECONDARY_VISUAL'),
 s('V122-CD102-USED-4','OFFSET5','CD102-4 feeder / feedboard installed-machine detail photographs','pressXchange','https://www.pressxchange.com/en/4-color-heidelberg-cd102-4-year-2005/machine-id/357387/','INSTALLED_MACHINE_VISUAL','SECONDARY_VISUAL'),
 s('V122-CD102-USED-5LX1','OFFSET5','CD102-5LX1 dryer / delivery exterior reference','pressXchange','https://www.pressxchange.com/en/5-color-heidelberg-cd-102-5lx1-year-2008/machine-id/303816/','INSTALLED_MACHINE_VISUAL','SECONDARY_VISUAL'),
 s('V122-CD102-USED-6LX','OFFSET5','CD102-6+LX feeder and delivery exterior reference','PressCity','https://presscity.com/en/machines/heidelberg/50534-56088/heidelberg-cd102-6lx.html','INSTALLED_MACHINE_VISUAL','SECONDARY_VISUAL'),
 s('V122-POLAR-SERVICE','POLAR115','POLAR 76/92/115/137/155 EMC/EM/SD service manual · knife, clamp, hydraulics, gear, backgauge','Scribd archive','https://www.scribd.com/document/697574927/Polar-service-manual-76-92-115-137-155-EMC-EM-SD-081','SERVICE_MANUAL_ARCHIVE','MODEL_FAMILY_SERVICE'),
 s('V122-POLAR-OPERATING','POLAR115','POLAR 115/155 EMC operating instructions · clamp pressure, knife, backgauge, FIXOMAT','Scribd archive','https://www.scribd.com/document/588906127/EMC-I-Operating-Polar-115','OPERATOR_MANUAL_ARCHIVE','MODEL_FAMILY_MANUAL'),
 s('V122-BOBST-EXPERTCUT-MANUAL','APM2','BOBST EXPERTCUT 106 PE startup/service procedure · pneumatic, vacuum, feeder and controls','ManualsLib','https://www.manualslib.com/manual/4194315/Bobst-Expertcut-106-Pe.html','OEM_SERVICE_PROCEDURE','OEM_FAMILY_CROSSCHECK'),
 s('V122-BOBST-EXPERTCUT-INDEX','APM2','BOBST EXPERTCUT 106 PE 376-page manual index','ManualsLib','https://www.manualslib.com/products/Bobst-Expertcut-106-Pe-15094900.html','MANUAL_INDEX','OEM_FAMILY_CROSSCHECK'),
 s('V122-BOBST-MANUALS','APM2','BOBST technical manual catalog index','ManualsLib','https://www.manualslib.com/brand/bobst/','MANUAL_INDEX','SECONDARY_INDEX'),
 s('V122-MK1060-MANUAL','MK1060ER','MK1060ER 168-page operating manual · gripper bar, stripping, blanking, lubrication, chains','Scribd archive','https://www.scribd.com/document/1006142808/MK1060ER-Operation-Manual-2','MODEL_OPERATOR_MANUAL','MODEL_SPECIFIC'),
 s('V122-PROMATRIX-PRODUCT','PROMATRIX106','Promatrix 106 CSB register, cutting, stripping and blanking station details','HEIDELBERG','https://www.heidelberg.com/global/en/print_and_packaging/finishing/die_cutting/die_cutting__machines/promatrix_106_csb/promatrix_106_csb_1.jsp','OEM_PRODUCT','OEM_PRIMARY'),
 s('V122-MASTERMATRIX-PRODUCT','PROMATRIX106','Mastermatrix 106 CSB camshaft drive and station mechanics cross-check','HEIDELBERG','https://www.heidelberg.com/global/en/print_and_packaging/finishing/die_cutting/die_cutting__machines/mastermatrix_106_csb/mastermatrix_106_csb_1.jsp','OEM_FAMILY_CROSSCHECK','OEM_PRIMARY'),
 s('V122-MEDIA100-CANAM','MEDIA100','BOBST MEDIA 100 II feeder, pre-fold, 4/6-corner, glue, trombone and compression equipment','Can-Am Packaging','https://www.canampackaging.com/folder-gluer.html','INSTALLED_MACHINE_REFERENCE','SECONDARY_TECHNICAL'),
 s('V122-MEDIA100-CANAM-DETAIL','MEDIA100','BOBST MEDIA 100 II detailed installed-machine configuration','Can-Am Packaging','https://www.canampackaging.com/folder-gluer/Post-whistler-760.html','INSTALLED_MACHINE_REFERENCE','SECONDARY_TECHNICAL'),
 s('V122-BOBST-FOLDER-PATENT','MEDIA100','BOBST modular folding device · twisted belt, pulleys and glue-shaft replacement','Google Patents','https://patents.google.com/patent/US5762597A/en','MECHANISM_PATENT','PRIMARY_MECHANISM'),
 s('V122-FOLDER-FEED-PATENT','MEDIA100','BOBST feeding and aligning device for folder-gluer','Google Patents','https://patents.google.com/patent/US20030203797A1/en','MECHANISM_PATENT','PRIMARY_MECHANISM'),
 s('V122-FOLDER-FEED-EP','MEDIA100','BOBST feeding/alignment device EP family filing','Google Patents','https://patents.google.com/patent/EP1350617A1/en','MECHANISM_PATENT','PRIMARY_MECHANISM'),
 s('V122-FOLDER-FEED-CN','MEDIA100','BOBST feeding/alignment device CN family filing','Google Patents','https://patents.google.com/patent/CN1228228C/en','MECHANISM_PATENT','PRIMARY_MECHANISM'),
 s('V122-FOLDER-MODULAR-JUSTIA','MEDIA100','BOBST modular folding device patent abstract and chronology','Justia Patents','https://patents.justia.com/patent/5762597','MECHANISM_PATENT','PRIMARY_MECHANISM'),
 s('V122-FOLDER-DRIVE-PATENT','MEDIA100','Folder-gluer upper/lower folding belt servo drive and sensors','Justia Patents','https://patents.justia.com/patent/8241195','MECHANISM_PATENT','PRIMARY_MECHANISM'),
 s('V122-FOLDER-GUIDE-PATENT','MEDIA100','Folder-gluer twisted belt and guide-bar folding mechanism','Google Patents','https://patents.google.com/patent/JP4554091B2/en','MECHANISM_PATENT','PRIMARY_MECHANISM'),
 s('V122-FOLDER-GUIDE2-PATENT','MEDIA100','Folder-gluer folding belts, gauge rollers and guide bars','Google Patents','https://patents.google.com/patent/JP5883747B2/en','MECHANISM_PATENT','PRIMARY_MECHANISM'),
 s('V122-FOLDER-TAB-PATENT','MEDIA100','BOBST side-tab holding / synchronized rotary folder hooks','Google Patents','https://patents.google.com/patent/US7637857B2/en','MECHANISM_PATENT','PRIMARY_MECHANISM'),
 s('V122-FOLDER-PRESS-PATENT','MEDIA100','Adjustable folder-gluer upper pressure belt / roller mechanism','Google Patents','https://patents.google.com/patent/CN205416507U/en','MECHANISM_PATENT','PRIMARY_MECHANISM'),
 s('V122-MASTERFOLD','MEDIA100','BOBST MASTERFOLD crash-lock, folding and ACCUPRESS family mechanics','BOBST','https://www.bobst.com/na/en/products/folding-gluing/masterfold-75-110','OEM_FAMILY_CROSSCHECK','OEM_PRIMARY'),
 s('V122-DIANA-MK2','DIANAEYE55','Diana Eye 42/55 current feeder, cameras, lighting, double-sheet detection','Masterwork','https://www.masterworkgroup.com/inspection-machine/mk-550qmini-inspection-machine.html','OEM_PRODUCT','OEM_PRIMARY'),
 s('V122-DIANA-PDF','DIANAEYE55','Diana Eye 42/55 brochure · camera/light/ejection configuration','Masterwork','https://www.masterworkgroup.com/data/upload/20230106/Diana-Eye-42.pdf','OEM_BROCHURE','OEM_PRIMARY'),
 s('V122-SHEETER-BW-FAQ','SHEETING','BW sheeter FAQ · slitter upper/bottom knives and dual rotary cross cutter','BW Papersystems','https://www.bwpapersystems.com/company/bw-papersystems-101','OEM_PROCESS_REFERENCE','OEM_PRIMARY'),
 s('V122-SHEETER-FALCON','SHEETING','Falcon folio sheeter brochure · decurler, slitter, dual rotary cutter, overlap and stacker','BW Papersystems','https://www.bwpapersystems.com/docs/default-source/machine-brochures/folio-size-sheeters/falcon_x_paper_a4_en.pdf?sfvrsn=224f837f_3','OEM_BROCHURE','OEM_PRIMARY'),
 s('V122-SHEETER-MAXSON-2026','SHEETING','MAXSON DFK current brochure · dual rotary, closed-loop web feed, slitter and pallet handling','Maxson Automatic','https://maxsonautomatic.com/wp-content/uploads/2026/05/DFK-1.pdf','OEM_BROCHURE','OEM_PRIMARY'),
 s('V122-SHEETER-BW-KNIFE','SHEETING','BW dual rotary high-speed knife-cylinder upgrade','BW Papersystems','https://www.bwpapersystems.com/products/upgrades-tips/upgrade/folio-size-sheeters/tip-mwu-2009-dual-rotary-hs-knife-cylinder','OEM_SERVICE_REFERENCE','OEM_PRIMARY'),
 s('V122-SHEETER-HAWK','SHEETING','Hawk 1650 dual rotary folio sheeter','BW Papersystems','https://www.bwpapersystems.com/products/machine/new/hawk-sheeter','OEM_PRODUCT','OEM_PRIMARY'),
 s('V122-SHEETER-CONTINUUM','SHEETING','Continuum 1850 dual rotary sheeter · pull roll, vacuum overlap, reject gate','BW Papersystems','https://www.bwpapersystems.com/products/machine/new/continuum','OEM_PRODUCT','OEM_PRIMARY'),
 s('V122-PASABAN-DOWNLOADS','SHEETING','Pasaban technical-data download center · sheeters/unwinders','Pasaban','https://www.pasaban.com/en/downloads','OEM_TECHNICAL_INDEX','OEM_PRIMARY'),
 s('V122-PASABAN-CL165-PDF','SHEETING','CL165 sheeter technical PDF · brake, decurl, slitting, pulling, Synchro cutter, reject/overlap','Pasaban','https://www.pasaban.com/uploads/machines/files/43/20221027CL165%20-%20ENG.pdf','OEM_TECHNICAL_DATA','OEM_PRIMARY'),
 s('V122-SUPRA-USER','CTP','Suprasetter A106 user manual · imaging drum cleaning, punch waste, air filter','ManualsLib mirror','https://www.manualslib.com/manual/1730849/Heidelberg-Suprasetter-A106.html','MODEL_USER_MANUAL','MODEL_FAMILY_MANUAL'),
 s('V122-SUPRA-INSTALL','CTP','Suprasetter A106 installation manual · chassis, chiller, imaging unit and APL interface','ManualsLib mirror','https://www.manualslib.com/manual/1634008/Heidelberg-Suprasetter-A106.html','MODEL_INSTALL_MANUAL','MODEL_FAMILY_MANUAL'),
 s('V122-SUPRA-INDEX','CTP','Suprasetter A106 manuals index','ManualsLib','https://www.manualslib.com/products/Heidelberg-Suprasetter-A106-10555029.html','MANUAL_INDEX','MODEL_FAMILY_MANUAL'),
 s('V122-SUPRA-PDF-MIRROR','CTP','Suprasetter A106 user guide PDF mirror','Manuals+','https://manuals.plus/m/8a658d0fbecf86f1fdb63e3a85e5a14c5132d96c3df32d47fbe694fb591a8572','USER_MANUAL_MIRROR','SECONDARY_MANUAL'),
 s('V122-ZUND-OPERATING','ZUND','Zünd G3 operating manual · beam/modules/tools/material fixing/vacuum generator','ManualsLib','https://www.manualslib.com/manual/4180656/Z-Nd-G3-Digital-Cutter.html','OEM_OPERATING_MANUAL_MIRROR','MODEL_FAMILY_MANUAL'),
 s('V122-ZUND-MOUNTING','ZUND','Zünd G3 light curtain mounting instructions · safety geometry','ManualsLib','https://www.manualslib.com/manual/3588562/Z-Nd-G3.html','OEM_INSTALL_MANUAL_MIRROR','MODEL_FAMILY_MANUAL'),
 s('V122-ZUND-MANUALS','ZUND','Zünd G3 manual index','ManualsLib','https://www.manualslib.com/products/Z-Nd-G3-14251374.html','MANUAL_INDEX','MODEL_FAMILY_MANUAL'),
 s('V122-ZUND-TOOLS','ZUND','Zünd G3/S3/D3/L3 modules and tools guide','Zünd','https://www.zund.com/media/375/download/Modules-and-Tools_Gen3_2_ANSICHT_EN-us.pdf?v=7','OEM_TOOLING_GUIDE','OEM_PRIMARY'),
 s('V122-ZUND-G3-OVERVIEW','ZUND','Zünd G3 digital cutter overview','Zünd','https://www.zund.com/media/391/download/Cutter_sales-overview_G3_EN-us.pdf?v=4','OEM_BROCHURE','OEM_PRIMARY'),
 s('V122-ZUND-MIT-MANUAL','ZUND','G3 operating manual mirror used by MIT fabrication lab','MIT CBA','https://fab.cba.mit.edu/content/tools/zund/manual.pdf','OPERATING_MANUAL_MIRROR','SECONDARY_MANUAL'),
 s('V122-ZUND-MANUALZZ','ZUND','Zünd G3 M/L/XL operating manual text mirror','Manualzz','https://manualzz.com/doc/6375378/z%C3%BCnd-g3-m-1600--g3-m-2500--g3-l-2500--g3-l-3200--g3-xl-16...','OPERATING_MANUAL_MIRROR','SECONDARY_MANUAL'),
 s('V122-ZUND-SCRIBD','ZUND','Zünd G3 operating manual 1.71 text archive','Scribd archive','https://www.scribd.com/document/565756349/Instrukcja-Obslugi-Zund-G3-CUTTER-1-71-en-gb','OPERATING_MANUAL_ARCHIVE','SECONDARY_MANUAL'),
 s('V122-ZUND-KCT','ZUND','Zünd KCT kiss-cut tool operating manual archive','Scribd archive','https://www.scribd.com/document/696051510/Operating-manual-KCT-kiss-cut-tool-PDF-Free-Download','TOOL_MANUAL_ARCHIVE','SECONDARY_MANUAL'),
 s('V122-HORIZON-VAC','COLLATOR','Horizon VAC-100 operator/maintenance manual · feed rings, sensors, blower, delivery','ManualsLib','https://www.manualslib.com/manual/1709743/Horizon-Fitness-Vac-100.html','MODEL_OPERATOR_MANUAL','MODEL_FAMILY_MANUAL'),
 s('V122-HORIZON-VAC-INDEX','COLLATOR','Horizon VAC-100 manuals index','ManualsLib','https://www.manualslib.com/products/Horizon-Fitness-Vac-100-10735284.html','MANUAL_INDEX','MODEL_FAMILY_MANUAL'),
 s('V122-HORIZON-VAC-SCRIBD','COLLATOR','VAC-100 manual text archive','Scribd archive','https://www.scribd.com/document/414807597/M-VAC100-E15-1','OPERATOR_MANUAL_ARCHIVE','SECONDARY_MANUAL'),
 s('V122-ATLAS-GA26-INDEX','COMPRESSOR','Atlas Copco GA26 instruction-book index','ManualsLib','https://www.manualslib.com/products/Atlas-Copco-Ga-26-10316594.html','MANUAL_INDEX','MODEL_FAMILY_MANUAL'),
 s('V122-ATLAS-GA26-MANUAL','COMPRESSOR','Atlas Copco GA26 oil-injected rotary screw compressor instruction book','ManualsLib','https://www.manualslib.com/manual/3853961/Atlas-Copco-Ga-26.html','INSTRUCTION_BOOK','MODEL_FAMILY_MANUAL'),
 s('V122-KAESER-SC2-FLUID','COMPRESSOR','KAESER SIGMA CONTROL 2 screw-fluid user manual','ManualsLib','https://www.manualslib.com/manual/2762038/Kaeser-Kompressoren-Sigma-Control-2.html','CONTROLLER_MANUAL','OEM_FAMILY_MANUAL'),
 s('V122-KAESER-SC2-CURRENT','COMPRESSOR','KAESER SIGMA CONTROL 2 current screw-fluid user manual','ManualsLib','https://www.manualslib.com/manual/3596127/Kaeser-Kompressoren-Sigma-Control-2.html','CONTROLLER_MANUAL','OEM_FAMILY_MANUAL'),
 s('V122-KAESER-SC2-SERVICE','COMPRESSOR','KAESER SIGMA CONTROL 2 service manual','ManualsLib','https://www.manualslib.com/manual/3041739/Kaeser-Kompressoren-Sigma-Control-2.html','SERVICE_MANUAL','OEM_FAMILY_MANUAL'),
 s('V122-KAESER-SC2-2021','COMPRESSOR','KAESER SIGMA CONTROL 2 screw-fluid user manual 5.x','ManualsLib','https://www.manualslib.com/manual/2980433/Kaeser-Kompressoren-Sigma-Control-2.html','CONTROLLER_MANUAL','OEM_FAMILY_MANUAL'),
 s('V122-SWAN-DOWNLOAD','COMPRESSOR','SWAN official download center · screw compressor series manuals/brochures','SWAN','https://www.swan-aircompressor.com/en/download','OEM_TECHNICAL_INDEX','OEM_PRIMARY'),
 s('V122-AHU-DAIKIN','AHU','Double-skin modular AHU design guide · casing, coil, drain pan, dampers, fan, filters','Daikin manual archive','https://www.scribd.com/document/472081251/eBookbkmt-Double-Skin-Modular-Air-Handling-Unit-DDM-AHU-Daikin','OEM_FAMILY_DESIGN_GUIDE_ARCHIVE','SECONDARY_TECHNICAL'),
 s('V122-GRAVURE-JUSTIA','YA1A1A','Gravure printer · engraved cylinder, ink supplier, doctor blade and impression cylinder','Justia Patents','https://patents.justia.com/patent/5381733','MECHANISM_PATENT','PRIMARY_MECHANISM')
]);

const seen=new Set();
export const V122_SOURCE_LEDGER=Object.freeze([...V122_NEW_RESEARCH_SOURCES,...V121_SOURCE_LEDGER].filter(e=>{
 if(!e.url||seen.has(e.url))return false;seen.add(e.url);return true;
}));
export const V122_SOURCE_STATS=Object.freeze({
 total:V122_SOURCE_LEDGER.length,
 newReviewed:V122_NEW_RESEARCH_SOURCES.length,
 primaryOrManual:V122_SOURCE_LEDGER.filter(e=>/OEM_PRIMARY|PRIMARY_MECHANISM|MODEL_.*MANUAL|OEM_.*MANUAL|MODEL_FAMILY_MANUAL/.test(String(e.confidence))).length,
 byScope:Object.freeze(Object.fromEntries([...new Set(V122_SOURCE_LEDGER.map(e=>e.machineScope))].map(scope=>[scope,V122_SOURCE_LEDGER.filter(e=>e.machineScope===scope).length])))
});
