import {APM2_TECHNICAL_SOURCES} from './sources-apm2.js';
import {DIANA_EYE55_TECHNICAL_SOURCES} from './sources-diana-eye55.js';
import {FZ1200_TECHNICAL_SOURCES} from './sources-fz1200.js';
import {MEDIA100_TECHNICAL_SOURCES} from './sources-media100.js';
import {MK1060_TECHNICAL_SOURCES} from './sources-mk1060.js';
import {MK920_TECHNICAL_SOURCES} from './sources-mk920.js';
import {OFFSET10_TECHNICAL_SOURCES} from './sources-offset10.js';
import {TECHNICAL_SOURCES as OFFSET5_TECHNICAL_SOURCES} from './sources-offset5.js';
import {OFFSET8_TECHNICAL_SOURCES} from './sources-offset8.js';
import {OFFSET9_TECHNICAL_SOURCES} from './sources-offset9.js';
import {POLAR115_TECHNICAL_SOURCES} from './sources-polar115.js';
import {PROMATRIX106_TECHNICAL_SOURCES} from './sources-promatrix106.js';
import {SHARK_N650_TECHNICAL_SOURCES} from './sources-shark-n650.js';
import {SHEETING_TECHNICAL_SOURCES} from './sources-sheeting.js';
import {UPG_LY300_TECHNICAL_SOURCES} from './sources-upg-ly300.js';

const s=(id,machineScope,title,publisher,url,kind='TECHNICAL_REFERENCE',confidence='FAMILY_REFERENCE')=>Object.freeze({id,machineScope,title,publisher,url,kind,confidence,reviewBatch:'V121-2026-09-21'});

export const V121_NEW_RESEARCH_SOURCES=Object.freeze([
 s('V121-CX104-TD','OFFSET8/OFFSET10','Speedmaster CX 104 technical data','HEIDELBERG','https://www.heidelberg.com/global/media/en/global_media/products___sheetfed_offset/current_pictures/technical_data_1/technical-data-speedmaster-cx-104.pdf','OEM_TECHNICAL_DATA','OEM_PRIMARY'),
 s('V121-CX104-PRODUCT','OFFSET8/OFFSET10','Speedmaster CX 104 product architecture','HEIDELBERG','https://www.heidelberg.com/global/en/print_and_packaging/products/offset_printing/format_70_x_100/speedmaster_cx_104/product_information_5/product_information_cx_104.jsp','OEM_PRODUCT','OEM_PRIMARY'),
 s('V121-CX104-TECHPAGE','OFFSET8/OFFSET10','Speedmaster CX 104 cylinder and pile technical data','HEIDELBERG','https://www.heidelberg.com/global/en/print_and_packaging/products/offset_printing/format_70_x_100/speedmaster_cx_104/technical_data/technical_data_cx_104.jsp','OEM_TECHNICAL_DATA','OEM_PRIMARY'),
 s('V121-CD102-PARTS','OFFSET5','HEIDELBERG service parts catalog: CD 102 coating doctor blades','HEIDELBERG','https://www.heidelberg.com/global/media/l1/global_media/services___technical_services/pdf_4/service_parts_catalog_for_prepress_and_press.pdf','OEM_PARTS_CATALOG','OEM_PRIMARY'),
 s('V121-CD102-INDO','OFFSET5','Speedmaster CD 102 Indonesia product reference','HEIDELBERG Indonesia','https://www.heidelberg.com/id/media/local_media/news_and_events/promo_pdf/2015_2/Promo_Mesin_Cetak_Speedmaster_SM_52_SM_74_CD_102_LR.pdf','OEM_BROCHURE','OEM_PRIMARY'),
 s('V121-CD102-ROLLER','OFFSET5','SM/CD 102 inking and Alcolor roller adjustment reference','Scribd archive','https://www.scribd.com/document/422865813/Roll-Ink-Setting-SMCD102','SERVICE_ARCHIVE','SECONDARY_TECHNICAL'),
 s('V121-CD102-DATA','OFFSET5','Speedmaster CD 102 technical specification archive','Scribd archive','https://www.scribd.com/document/343771304/Technical-Data-CD102-pdf','TECHNICAL_ARCHIVE','SECONDARY_TECHNICAL'),
 s('V121-CD102-PATH','OFFSET5','CD 102 packaging cylinder ratios and AirTransfer history','Printweek','https://www.printweek.com/content/review/heidelberg-speedmaster-102/','INDUSTRY_TECHNICAL','SECONDARY_TECHNICAL'),
 s('V121-FOILSTAR','OFFSET10','FoilStar and FoilStar Cure inline cold transfer','HEIDELBERG','https://www.youtube.com/watch?v=VhI_K2bkfbU','OEM_VIDEO','OEM_PRIMARY'),
 s('V121-POLAR-ED','POLAR115','POLAR cutter operator manual family 78-176 incl. 115','Operator manual archive','https://www.scribd.com/document/878245467/Polar-115ed-Operators-Manual-78-Ed-176ed-e','OPERATOR_MANUAL_ARCHIVE','SECONDARY_TECHNICAL'),
 s('V121-POLAR-EMC','POLAR115','POLAR 115/155 EMC operating instructions','Operator manual archive','https://www.scribd.com/document/588906127/EMC-I-Operating-Polar-115','OPERATOR_MANUAL_ARCHIVE','SECONDARY_TECHNICAL'),
 s('V121-BOBST-EVOLINE','APM2','BOBST SP 102 E Evoline technical and equipment data','Machinex','https://machinex.com/id/buy-machine/bobst/sp-102/1272-2007-bobst-sp-102-e-evoline','INSTALLED_MACHINE_REFERENCE','SECONDARY_TECHNICAL'),
 s('V121-BOBST-EII','APM2','BOBST SP 102 EII stripping station equipment reference','Used-Machines','https://www.used-machines.com/bobst-sp%2B102%2Beii/gm-223-68387','INSTALLED_MACHINE_REFERENCE','SECONDARY_TECHNICAL'),
 s('V121-BOBST-WG','APM2','BOBST SP 102-E II feeder/side-lay/stripping reference','Wayne Graham','https://waynegraham.com/post-press/die-cutting/item/bobst-sp-102-e-ii-die-cutter-with-stripping-unit-30157','INSTALLED_MACHINE_REFERENCE','SECONDARY_TECHNICAL'),
 s('V121-BOBST-BMA','APM2','1994 BOBST SP 102 BMA family equipment and drive reference','Machinex','https://machinex.com/buy-machine/bobst/sp-102/1883-1994-bobst-sp-102-bma-hotfoil','INSTALLED_MACHINE_REFERENCE','SECONDARY_TECHNICAL'),
 s('V121-BOBST-PARTS','APM2','SP102CER gripper bars chains stripping frames parts','MV Parts','https://shop.mvparts.eu/machinetypes/SP102CER/','PARTS_REFERENCE','SECONDARY_TECHNICAL'),
 s('V121-MK1060-MANUAL','MK1060ER','MK1060ER operating manual archive','Masterwork manual archive','https://www.scribd.com/document/1006142808/MK1060ER-Operation-Manual-2','OPERATOR_MANUAL_ARCHIVE','MODEL_SPECIFIC'),
 s('V121-MK1060-USA','MK1060ER','MK1060ER/ERS die cutting machine architecture','Masterwork USA','https://www.masterworkusa.com/products/mk1060er-die-cutting-machine/','OEM_PRODUCT','OEM_PRIMARY'),
 s('V121-MK1060-LIST','MK1060ER','MK1060ER installed blanking and stripping equipment','pressXchange','https://www.pressxchange.com/en/masterwork-mk-1060-er-year-2016/machine-id/406906/','INSTALLED_MACHINE_REFERENCE','SECONDARY_TECHNICAL'),
 s('V121-MK-PARTS','MK920/MK1060','MK platen feeder and stamping spare parts','Masterwork','https://www.masterworkgroup.com/spare-parts-and-consumables/','OEM_PARTS_CATALOG','OEM_PRIMARY'),
 s('V121-MK920-YMI','MK920','MK 920 YMI automatic platen foil stamping technical reference','Asia Machinery / Masterwork listing','https://www.asiamachinery.net/supplier/product_details.asp?ProID=6735&SupID=5772','MODEL_REFERENCE','SECONDARY_TECHNICAL'),
 s('V121-PROMATRIX-PDF','PROMATRIX106','Promatrix 106 CS/CSB brochure','HEIDELBERG','https://www.heidelberg.com/global/media/en/global_media/products___postpress_die_cutting/downloads_2/promatrix_106_cs_csb_lr.pdf','OEM_BROCHURE','OEM_PRIMARY'),
 s('V121-PROMATRIX-CSB','PROMATRIX106','Promatrix 106 CSB product architecture','HEIDELBERG','https://www.heidelberg.com/global/en/print_and_packaging/finishing/die_cutting/die_cutting__machines/promatrix_106_csb/promatrix_106_csb_1.jsp','OEM_PRODUCT','OEM_PRIMARY'),
 s('V121-MASTERMATRIX','PROMATRIX106','Mastermatrix 106 CSB station mechanics family cross-check','HEIDELBERG','https://www.heidelberg.com/global/en/print_and_packaging/finishing/die_cutting/die_cutting__machines/mastermatrix_106_csb/mastermatrix_106_csb_1.jsp','OEM_FAMILY_CROSSCHECK','OEM_PRIMARY'),
 s('V121-MEDIA100','MEDIA100','BOBST MEDIA 100 II installed process reference','Pressdepo','https://www.pressdepo.com/machine/en-122363/bobst-media-100-ii','INSTALLED_MACHINE_REFERENCE','SECONDARY_TECHNICAL'),
 s('V121-DIANA-OEM','DIANAEYE55','Diana Eye offline inspection','HEIDELBERG','https://www.heidelberg.com/global/en/print_and_packaging/finishing/print_inspection_systems/offline/diana_eye_1.jsp','OEM_PRODUCT','OEM_PRIMARY'),
 s('V121-DIANA-MK','DIANAEYE55','Diana Eye 55 inspection system mechanics','Masterwork','https://www.masterworkgroup.com/inspection-machine/diana-eye-55.html','OEM_PRODUCT','OEM_PRIMARY'),
 s('V121-DIANA-BROCHURE','DIANAEYE55','Diana Eye 42/55 brochure archive','HEIDELBERG Connect','https://fliphtml5.com/zztp/tzje','OEM_BROCHURE_ARCHIVE','OEM_DISTRIBUTOR'),
 s('V121-SHARK-N650','SHARKN650','FS-SHARK N650 sheet-fed offline inspection','Focusight','https://en.focusight.net/en/Product/Printing/515.html','OEM_PRODUCT','OEM_PRIMARY'),
 s('V121-SHARK-650C','SHARKN650','FS-SHARK-650-COLOR feeder/reject/staker family reference','Focusight','https://en.focusight.net/en/Product/Printing/518.html','OEM_FAMILY_CROSSCHECK','OEM_PRIMARY'),
 s('V121-LY300','UPG-LY300','LQ-UPG LY300 UV piezo inkjet printer','UPG','https://www.upg-consumable.com/uv-piezo-inkjet-printer-product/','OEM_PRODUCT','OEM_PRIMARY'),
 s('V121-MAXSON-DFK','SHEETING','MAXSON DFK dual-knife sheeter brochure','Maxson Automatic','https://maxsonautomatic.com/wp-content/uploads/2015/04/MAXSON_DFK_Brochure.pdf','OEM_BROCHURE','OEM_PRIMARY'),
 s('V121-PASABAN-CL165','SHEETING','Pasaban CL165 paper sheeter architecture','Pasaban','https://www.pasaban.com/en/file/43/cl165','OEM_PRODUCT','OEM_PRIMARY'),
 s('V121-BW-SHEETWIZARD','SHEETING','SheetWizard dual rotary sheeter','BW Papersystems','https://www.bwpapersystems.com/products/machine/new/sheetwizard','OEM_PRODUCT','OEM_PRIMARY'),
 s('V121-BW-ECON','SHEETING','eCon dual rotary folio sheeter','BW Papersystems','https://www.bwpapersystems.com/products/machine/new/econ','OEM_PRODUCT','OEM_PRIMARY'),
 s('V121-BAUMANN-BSW','FZ1200','Baumann BSW pile turner handling brochure','Baumann','https://www.baumann-italia.it/images/BROCHURES/bmwb_peripherie_EN.PDF','OEM_BROCHURE','OEM_PRIMARY'),
 s('V121-SUPRA-A106','CTP','Suprasetter A106/106','HEIDELBERG','https://www.heidelberg.com/global/en/print_and_packaging/products/computer_to_plate_1/suprasetter_a106_106__106_uv/product_information_95/suprasetter_a106_106.jsp','OEM_PRODUCT','OEM_PRIMARY'),
 s('V121-SUPRA-AUTO','CTP','Suprasetter A106/106 automation loaders','HEIDELBERG','https://www.heidelberg.com/global/en/print_and_packaging/products/computer_to_plate_1/automation/ctp_automation.jsp','OEM_PRODUCT','OEM_PRIMARY'),
 s('V121-SUPRA-DATA','CTP','Suprasetter family technical specifications','HEIDELBERG','https://www.heidelberg.com/global/media/l1/global_media/products___ctp/pdf_5/suprasetter_fam_tec_specs.pdf','OEM_TECHNICAL_DATA','OEM_PRIMARY'),
 s('V121-ZUND-G3','ZUND','Zünd G3 digital cutter','Zünd','https://www.zund.com/en/cutting-systems/digital-cutting-systems/g3-cutter','OEM_PRODUCT','OEM_PRIMARY'),
 s('V121-ZUND-G3-DATA','ZUND','Zünd G3 technical data','Zünd','https://www.zund.com/media/391/download/tda_technical%20data%20G3_13_EN-us.pdf?v=3','OEM_TECHNICAL_DATA','OEM_PRIMARY'),
 s('V121-ZUND-S3','ZUND','Zünd S3 digital cutter','Zünd','https://www.zund.com/en/cutting-systems/digital-cutting-systems/s3-cutter','OEM_FAMILY_CROSSCHECK','OEM_PRIMARY'),
 s('V121-ZUND-S3-DATA','ZUND','Zünd S3 technical data','Zünd','https://www.zund.com/media/395/download/tda_technical-data_S3_11_EN-us.pdf?v=3','OEM_TECHNICAL_DATA','OEM_PRIMARY'),
 s('V121-ZUND-ICC','ZUND','Integrated Compact Color Camera ICC','Zünd','https://www.zund.com/en/cutting-systems/registration-methods/integrated-compact-color-camera','OEM_PRODUCT','OEM_PRIMARY'),
 s('V121-ATLAS-GA','COMPRESSOR','GA 30+-75+ oil-injected screw compressor','Atlas Copco','https://www.atlascopco.com/id-id/compressors/products/air-compressor/rotary-screw-compressor/ga-plus-screw-compressor','OEM_PRODUCT','OEM_PRIMARY'),
 s('V121-KAESER-LARGE','COMPRESSOR','Large rotary screw compressor internal flow','KAESER','https://id.kaeser.com/products/rotary-screw-compressors/rotary-screw-compressors-with-fluid-cooling/large-rotary-screw-compressors-from-75-to-515-kw/','OEM_PRODUCT','OEM_PRIMARY'),
 s('V121-KAESER-DIRECT','COMPRESSOR','Rotary screw compressors with 1:1 direct drive','KAESER','https://id.kaeser.com/products/rotary-screw-compressors/rotary-screw-compressors-with-fluid-cooling/with-1-to-1-direct-drive/','OEM_PRODUCT','OEM_PRIMARY'),
 s('V121-SWAN-TSAD','COMPRESSOR','TS-AD direct screw compressor','SWAN','https://swan-aircompressor.com/en/products/screw/direct-driven-screw','OEM_PRODUCT','OEM_PRIMARY'),
 s('V121-SWAN-TMV','COMPRESSOR','TMV variable speed screw compressor','SWAN','https://swan-aircompressor.com/en/products/screw/variable-speed-screw','OEM_PRODUCT','OEM_PRIMARY'),
 s('V121-GRAVURE-PATENT','YA1A1A','Gravure doctor blade oscillation and nip geometry','Google Patents','https://patents.google.com/patent/JP6056112B1/en','MECHANISM_PATENT','PRIMARY_MECHANISM'),
 s('V121-GRAVURE-PATENT2','YA1A1A','Printing press doctor blade oscillation device','Google Patents','https://patents.google.com/patent/US20030213386A1/en','MECHANISM_PATENT','PRIMARY_MECHANISM'),
 s('V121-GRAVURE-TGS','YA1A1A','TGS1000 sheet-fed gravure press size and process family','PrintStar','https://printstar.org/machines/tsg-1000/','FAMILY_MACHINE_REFERENCE','SECONDARY_TECHNICAL'),
 s('V121-GRAVURE-ACADEMY','YA1A1A','Gravure process cylinder/doctor/impression/dryer mechanism','Labels & Labeling','https://www.labelsandlabeling.com/label-academy/article/print-processes-gravure-printing','PROCESS_REFERENCE','SECONDARY_TECHNICAL')
]);

const EXISTING=Object.freeze([
 ...APM2_TECHNICAL_SOURCES,...DIANA_EYE55_TECHNICAL_SOURCES,...FZ1200_TECHNICAL_SOURCES,...MEDIA100_TECHNICAL_SOURCES,
 ...MK1060_TECHNICAL_SOURCES,...MK920_TECHNICAL_SOURCES,...OFFSET10_TECHNICAL_SOURCES,...OFFSET5_TECHNICAL_SOURCES,
 ...OFFSET8_TECHNICAL_SOURCES,...OFFSET9_TECHNICAL_SOURCES,...POLAR115_TECHNICAL_SOURCES,...PROMATRIX106_TECHNICAL_SOURCES,
 ...SHARK_N650_TECHNICAL_SOURCES,...SHEETING_TECHNICAL_SOURCES,...UPG_LY300_TECHNICAL_SOURCES
]);

const normalize=e=>({id:e.id||e.sourceId||e.title||e.url,machineScope:e.machineScope||e.machine||'EXISTING',title:e.title||e.name||e.id||'Technical reference',publisher:e.publisher||e.source||'Existing registry',url:e.url,kind:e.kind||e.type||'EXISTING_REFERENCE',confidence:e.confidence||'EXISTING_EVIDENCE',reviewBatch:e.reviewBatch||'PRE-V121'});
const seen=new Set();
export const V121_SOURCE_LEDGER=Object.freeze([...EXISTING.map(normalize),...V121_NEW_RESEARCH_SOURCES].filter(e=>{if(!e.url||seen.has(e.url))return false;seen.add(e.url);return true;}));
export const V121_SOURCE_STATS=Object.freeze({
 total:V121_SOURCE_LEDGER.length,
 newReviewed:V121_NEW_RESEARCH_SOURCES.length,
 oemPrimary:V121_SOURCE_LEDGER.filter(e=>/OEM_PRIMARY|OEM_DISTRIBUTOR|PRIMARY_MECHANISM/.test(e.confidence)).length,
 byScope:Object.freeze(Object.fromEntries([...new Set(V121_SOURCE_LEDGER.map(e=>e.machineScope))].map(scope=>[scope,V121_SOURCE_LEDGER.filter(e=>e.machineScope===scope).length])))
});
