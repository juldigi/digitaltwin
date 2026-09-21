import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {MACHINE_REGISTRY_BY_ID} from './data/machine-registry.js';
import {mechanicalProfile} from './data/mechanical-profiles.js';
import {POLAR115_TAXONOMY} from './data/taxonomy-polar115.js';
import {POLAR115_TECHNICAL_SOURCES} from './data/sources-polar115.js';
import {OFFSET8_TAXONOMY} from './data/taxonomy-offset8.js';
import {OFFSET8_TECHNICAL_SOURCES} from './data/sources-offset8.js';
import {OFFSET9_TAXONOMY} from './data/taxonomy-offset9.js';
import {OFFSET9_TECHNICAL_SOURCES} from './data/sources-offset9.js';
import {MK920_TAXONOMY,mk920TaxonomyFor} from './data/taxonomy-mk920.js';
import {MK920_TECHNICAL_SOURCES} from './data/sources-mk920.js';
import {MK1060_TAXONOMY} from './data/taxonomy-mk1060.js';
import {MK1060_TECHNICAL_SOURCES} from './data/sources-mk1060.js';
import {promatrix106TaxonomyFor} from './data/taxonomy-promatrix106.js';
import {PROMATRIX106_TECHNICAL_SOURCES} from './data/sources-promatrix106.js';
import {media100TaxonomyFor} from './data/taxonomy-media100.js';
import {MEDIA100_TECHNICAL_SOURCES} from './data/sources-media100.js';
import {DIANA_EYE55_TAXONOMY} from './data/taxonomy-diana-eye55.js';
import {DIANA_EYE55_TECHNICAL_SOURCES} from './data/sources-diana-eye55.js';
import {SHARK_N650_TAXONOMY} from './data/taxonomy-shark-n650.js';
import {SHARK_N650_TECHNICAL_SOURCES} from './data/sources-shark-n650.js';
import {fz1200TaxonomyFor} from './data/taxonomy-fz1200.js';
import {FZ1200_TECHNICAL_SOURCES} from './data/sources-fz1200.js';
import {UPG_LY300_TAXONOMY} from './data/taxonomy-upg-ly300.js';
import {UPG_LY300_TECHNICAL_SOURCES} from './data/sources-upg-ly300.js';
import {OFFSET7_GRAVURE_TAXONOMY} from './data/taxonomy-offset7.js';
import {QF100CS_TAXONOMY} from './data/taxonomy-qf100cs.js';
import {compressorTaxonomyFor} from './data/taxonomy-compressors.js';
import {COLLATOR_TAXONOMY} from './data/taxonomy-collator.js';
import {suprasetterTaxonomyFor} from './data/taxonomy-suprasetter.js';
import {SCREEN_IMAGESETTER_TAXONOMY} from './data/taxonomy-imagesetter.js';
import {FGM2_TAXONOMY} from './data/taxonomy-fgm2.js';
import {ZUND_TAXONOMY} from './data/taxonomy-zund.js';
import {ahuTaxonomyFor} from './data/taxonomy-ahu.js';

const FAMILY_BY_NO=new Map([
 [1,'guillotine'],[2,'sheeter'],[4,'gravure'],[5,'offset'],[6,'offset'],[7,'pileturner'],[8,'pileturner'],
 [11,'hotfoil'],[12,'hotfoil'],[13,'diecutter'],[14,'diecutter'],[15,'diecutter'],[16,'folder'],[17,'folder'],[18,'folder'],
 [19,'inspection'],[20,'inspection'],[21,'blanker'],[22,'pileturner'],[23,'collator'],[24,'inkjet'],[25,'ctp'],[26,'ctp'],
 [27,'imagesetter'],[28,'zund'],[29,'compressor'],[30,'compressor'],[31,'compressor'],[32,'compressor'],
 [33,'compressor'],[34,'compressor'],[35,'compressor'],[36,'ahu'],[37,'ahu'],[38,'ahu'],[39,'ahu'],[40,'ahu'],[41,'ahu']
]);
const LABELS={guillotine:'Guillotine Cutter',sheeter:'Roll / Sheet Converting',gravure:'Single-Unit Gravure Press',offset:'Sheetfed Offset Press',pileturner:'Pile Turner',hotfoil:'Hot Foil Stamping',diecutter:'Die Cutting & Stripping',folder:'Folder Gluer',inspection:'Offline Inspection',blanker:'Automatic Blanking',collator:'Sheet Collator',inkjet:'Digital Inkjet',ctp:'Computer to Plate',imagesetter:'CTF Imagesetter',zund:'Digital Cutting Table',compressor:'Rotary Air Compressor',ahu:'Air Handling Unit'};
const MODULES={
 guillotine:['Infeed Table','Backgauge','Cutting Station','Clamp','Knife Drive','Delivery / Side Tables','Hydraulic & Control'],
 sheeter:['Roll Stand','Web Tension','Infeed','Slitting','Cross Cutter','Overlap Conveyor','Sheet Stacker','Drive & Control'],
 gravure:['Substrate Infeed','Register / Transport','Ink Pan / Circulation','Gravure Cylinder','Doctor Blade','Impression Cylinder','Drying / Exhaust','Delivery / Rewind'],
 offset:['Preset Feeder','Feedboard / Register','Printing Units','Coating / Dryer','Delivery','Drive & Control'],
 pileturner:['Base & Lift','Pile Clamp Assembly','Turning Yoke / Trunnion','Air Separation / Dust Removal','Jogging / Alignment','Hydraulic Drive','Safety & Control'],
 hotfoil:['Feeder','Register','Foil Unwind','Heating / Stamping Platen','Foil Advance','Stripping','Delivery','Drive & Control'],
 diecutter:['Feeder','Register','Gripper Transport','Die-Cutting Platen','Stripping','Blanking','Delivery','Drive & Control'],
 folder:['Blank Feeder & Separation','Alignment & Prebreaking','Primary Folding / Box-Style Capabilities','Glue Application Boundary','Final Folding & Squaring','Compression Section','Delivery & Control'],
 inspection:['Feeder','Alignment','Camera / Lighting','Image Processing','Reject Gate','Delivery','Control'],
 blanker:['Feeder','Transport','Stripping / Blanking','Blank Separation','Waste Removal','Delivery','Drive & Control'],
 collator:['Feed Stations','Sheet Detection','Gathering Conveyor','Alignment','Stacker','Delivery','Control'],
 inkjet:['Feeder','Cleaning / Corona','Transport','Printheads','UV / Drying','Inspection','Stacker','Ink & Control'],
 ctp:['Plate Loader','Transport','Imaging Drum','Laser Head','Punch','Processor / Unload','Vacuum & Control'],
 imagesetter:['Media Cassette / Supply','Capstan Transport / Tension','High-Speed Polygon Scanner','Laser / Beam Optics','Cut / Punch Boundary','Output / Processor Interface'],
 zund:['Vacuum Cutting Table','X-Axis Travelling Beam','Y/Z Tool Carriage & Module Slots','Installed Tool Package Boundary','Registration / Initialization Boundary','Operator / Vacuum / Material Handling'],
 compressor:['Air Intake','Compression Element','Electric Motor','Oil Separator','Cooling','Air / Oil Circuit','Controller'],
 ahu:['Intake / Damper','Filter Bank','Cooling / Heat-Exchange Coil','Moisture / Drain Section','Supply Fan','Access / Service Section','Discharge / Control']
};
const FAMILY_SOURCES={
 guillotine:[['POLAR 115 EM archive reference','https://www.exapro.com/polar-115-em-monitor-p241022253/']],
 gravure:[
  ['YA1A1A exact-model gravure classification · public equipment register','https://zjjcmspublic.oss-cn-hangzhou-zwynet-d01-a.internet.cloud.zj.gov.cn/jcms_files/jcms1/web3765/site/attach/0/7812f59accf74d029e3be38b6d7c4db6.pdf'],
  ['YA1A1A installed single-gravure evidence','https://www.wlzp.vip/touch/wzp/index.aspx?comid=49287'],
  ['YA1A1 used-machine 920×650 / 5000 sheet-h class','https://www.sohu.com/a/130659125_167159'],
  ['YA1A1A 650×920 installed-machine visual reference','https://hnyrbz.com/PicList.aspx?ClassID=26'],
  ['YA1A1C 65×92 OEM successor-family visual reference','https://www.ezgravtek.com/NewsDetail.aspx?ID=180'],
  ['YA1B1 OEM successor-family visual reference','https://www.ezgravtek.com/ProDetail.aspx?Proid=30'],
  ['Ezgravtek sheet-fed gravure technology / current family','https://en.ezgravtek.com/NewsDetail.aspx?ID=233'],
  ['Sheet-fed gravure transfer / ink pan / gripper patent','https://patents.google.com/patent/JP3292876B2/en'],
  ['Sheet-fed gravure feeder / transfer / impression / delivery train patent','https://patents.google.com/patent/US8720334B2/en'],
  ['Gravure doctor holder / oscillator patent','https://patents.google.com/patent/US20030213386A1/en'],
  ['H. C. MOOG sheet-fed rotogravure press program','https://www.hcmoog.de/products/program/'],
  ['H. C. MOOG sheet-fed gravure technology / drying options','https://www.hcmoog.de/products/rotogravure-technology/'],
  ['Gravure printing nip principle · paperboard manual','https://www.iggesund.com/insights/paperboard-know-how/paperboard-manual/paperboard-manual-publication/printing-and-converting-performance/gravure-printing/']
 ],
 offset:[['Heidelberg CX 104 official','https://www.heidelberg.com/global/en/print_and_packaging/products/offset_printing/format_70_x_100/speedmaster_cx_104/product_information_5/product_information_cx_104.jsp'],['Heidelberg SX 52 brochure','https://www.heidelberg.com/tw/media/local_media/product/brochures/Speedmaster_SX_52.pdf']],
 hotfoil:[['MK 920 YMI archive','https://www.pressdepo.com/machine/en-133612/mk-920-ymi-foil-stamping-machine']],
 diecutter:[['Heidelberg Promatrix 106 CSB official','https://www.heidelberg.com/global/fr/print_and_packaging/finishing/die_cutting/die_cutting__machines/promatrix_106_csb/promatrix_106_csb_1.jsp']],
 folder:[
  ['BOBST Media 100 II neighbor-process reference · FGM-1/FGM-3 class only','https://www.pressxchange.com/en/bobst-media-100-ii-a2-year-2002/machine-id/385095/'],
  ['BOBST NOVAFOLD folder-gluer process reference','https://www.bobst.com/na/en/news/1642421329-completing-the-folding-gluing-dream-team-bobst-introduces-the-brand-new-novafold'],
  ['Jaya Makmur Mesindo folder-gluer catalogue + BMJ customer association · not installation proof','https://jayamakmurmesindo.com/'],
  ['BOBST modular folding mechanism patent','https://patents.google.com/patent/US5762597A/en']
 ],
 inspection:[['Masterwork inspection systems','https://www.masterworkgroup.com/inspection-machine/mk-550qmini-inspection-machine.html']],
 blanker:[
  ['QF-1080B · moving platform / stable head / servo-ball-screw family reference','https://www.shanghai-yuyin.com/QF-1080B-Automatic-Blanking-Machine-pd45580714.html'],
  ['QF-1080C · family architecture and C-variant boundary','https://www.shanghai-yuyin.com/QF-1080C-Automatic-Blanking-Machine-pd45746924.html'],
  ['LQF-1080CS · two-axis moving platform / fixed hydraulic head reference','https://www.shanghai-upg.com/LQF-1080CS-Automatic-Blanking-Machine-pd44776496.html'],
  ['UPG blanking family technical detail · hydraulic station / double lead screw / honeycomb board / HMI','https://www.shanghai-upg.com/Advantages-of-automatic-blanking-machine-id3320993.html'],
  ['Collecting / stacker variant · option boundary only','https://www.shanghai-upg.com/LQ-QF-1080B-Blanking-Machine-with-Collecting-And-Stacker-pd45266496.html'],
  ['Installed QF-1080C visual reference','https://printpack.ru/news/instalacion/mashina-dlya-razdeleniya-kartonnyh-zagotovok-uanchor-qf-1080c-origamo.html'],
  ['Jaya Makmur Mesindo · QF1080B/QF1080C catalogue + BMJ customer association · family relevance only','https://jayamakmurmesindo.com/']
 ],
 collator:[
  ['Horizon VAC-1000 official 10-bin air-suction collator','https://www.horizon.co.jp/products/en/products/collators/vac1000/vac1000_e.html'],
  ['Horizon VAC-600H official modular suction collator','https://www.horizon.co.jp/products/en/products/collators/vac600h/vac600h_e.html'],
  ['Duplo DSC-10/60i official ten-bin suction collator family','https://www.duplousa.com/product/isaddle-5-0/'],
  ['Vertical collator suction-rotor mechanism patent','https://patents.google.com/patent/US20050242484A1/en']
 ],
 ctp:[
  ['HEIDELBERG Suprasetter A75 official product page','https://www.heidelberg.com/global/en/print_and_packaging/products/computer_to_plate_1/suprasetter_a52_a75/product_information_94/suprasetter_a52_a75.jsp'],
  ['HEIDELBERG Suprasetter A106/106 official product page','https://www.heidelberg.com/global/en/print_and_packaging/products/computer_to_plate_1/suprasetter_a106_106__106_uv/product_information_95/suprasetter_a106_106.jsp'],
  ['HEIDELBERG Suprasetter family technical data','https://www.heidelberg.com/global/media/l1/global_media/products___ctp/pdf_5/suprasetter_fam_tec_specs.pdf'],
  ['HEIDELBERG Suprasetter A52/A75 product guide','https://www.heidelberg.com/global/media/en/global_media/products___ctp/pdf_5/a52_a75_product_guide.pdf']
 ],
 imagesetter:[
  ['SCREEN Katana 5040/5055 official technical article','https://www.screen.co.jp/ga_dtp/en/news/pdf/newsbox/vol9_pdf/newsbox_9_4.pdf'],
  ['SCREEN FT-R3035/3050 archived product literature','https://www.scribd.com/document/236034169/Screen-FTR-3035-3050'],
  ['SCREEN FT-R3050 installed-system reference','https://www.ronseintech.com/en/product/screen-ftr-3050-imagesetter/index.html'],
  ['SCREEN Katana FT-R5055 installed-system reference','https://www.graph4print.com/machine/en-118752/screen-katana-ft-r-5055-imagesetter']
 ],
 zund:[
  ['Zünd G3 official modular flatbed cutter','https://www.zund.com/en/cutting-systems/digital-cutting-systems/g3-cutter'],
  ['Zünd S3 official compact modular cutter','https://www.zund.com/en/cutting-systems/digital-cutting-systems/s3-cutter'],
  ['Zünd official modules and tools catalogue','https://www.zund.com/en/cutting-systems/modules-and-tools'],
  ['Zünd Gen3 modules/tools technical brochure','https://www.zund.com/media/375/download/Modules-and-Tools_Gen3_2_ANSICHT_EN-us.pdf?v=7'],
  ['Zünd Universal Routing Tool official','https://www.zund.com/en/cutting-systems/modules-and-tools/universal-routing-tool-urt'],
  ['Zünd Universal Module official','https://www.zund.com/en/cutting-systems/modules-and-tools/universal-module']
 ],
 compressor:[
  ['Atlas Copco GA oil-injected screw compressor family','https://www.atlascopco.com/id-id/compressors/products/air-compressor/rotary-screw-compressor/ga-series'],
  ['Atlas Copco GA 37-90 component / controller family','https://www.atlascopco.com/en-id/compressors/products/air-compressor/rotary-screw-compressor/ga-screw-compressor'],
  ['KAESER 1:1 direct-drive rotary screw family','https://id.kaeser.com/products/rotary-screw-compressors/rotary-screw-compressors-with-fluid-cooling/with-1-to-1-direct-drive/'],
  ['KAESER belt-drive rotary screw family','https://id.kaeser.com/products/rotary-screw-compressors/rotary-screw-compressors-with-fluid-cooling/with-belt-drive/'],
  ['KAESER rotary screw component / flow brochure','https://id.kaeser.com/download.ashx?id=tcm%3A148-5928'],
  ['SWAN TS-AD direct screw compressor family','https://swan-aircompressor.com/en/products/screw/direct-driven-screw'],
  ['SWAN TMV variable-speed screw compressor family','https://swan-aircompressor.com/en/products/screw/variable-speed-screw'],
  ['SWAN Screw Compressor Series catalogue','https://www.swan-aircompressor.com/en/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBa1VNIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--00fd60abbc79a7b9a28569af7dedf6aca949ded0/Screw%20Compressor%20Series.pdf?disposition=preview']
 ],
 ahu:[
  ['Eurovent AHU Guidebook','https://www.eurovent.me/wp-content/uploads/2021-eurovent-ahu-guidebook-second-edition-en-web.pdf'],
  ['Eurovent 6/18 AHU quality criteria','https://www.eurovent.me/wp-content/uploads/eurovent-rec-6-18-quality-criteria-for-air-handling-units-2022-en-2.pdf'],
  ['PT Sansin Indonesia / NES AC Central','https://www.nesacsentral.web.id/'],
  ['NES YZKJ-45N/90N industrial central air-conditioner family','https://sansinmachinery.en.made-in-china.com/product/FYGRPNzdCLVg/China-Nes-Evaporative-Cooling-Energy-Saving-Industrial-Central-Air-Conditioner.html']
 ]
};
const REFERENCE_SOURCES_BY_NO=new Map([
 [4,FAMILY_SOURCES.gravure],[17,FAMILY_SOURCES.folder],[21,FAMILY_SOURCES.blanker],[23,FAMILY_SOURCES.collator],
 [25,FAMILY_SOURCES.ctp],[26,FAMILY_SOURCES.ctp],[27,FAMILY_SOURCES.imagesetter],[28,FAMILY_SOURCES.zund],
 [29,[FAMILY_SOURCES.compressor[0],FAMILY_SOURCES.compressor[1]]],[30,[FAMILY_SOURCES.compressor[0],FAMILY_SOURCES.compressor[1]]],[35,[FAMILY_SOURCES.compressor[0],FAMILY_SOURCES.compressor[1]]],
 [31,[FAMILY_SOURCES.compressor[2],FAMILY_SOURCES.compressor[3],FAMILY_SOURCES.compressor[4]]],[32,[FAMILY_SOURCES.compressor[2],FAMILY_SOURCES.compressor[3],FAMILY_SOURCES.compressor[4]]],[34,[FAMILY_SOURCES.compressor[2],FAMILY_SOURCES.compressor[3],FAMILY_SOURCES.compressor[4]]],
 [33,[FAMILY_SOURCES.compressor[5],FAMILY_SOURCES.compressor[6],FAMILY_SOURCES.compressor[7]]],
 [40,[['PT Sansin Indonesia / NES central cooling family','https://www.nesacsentral.web.id/']]],
 [36,FAMILY_SOURCES.ahu],[37,FAMILY_SOURCES.ahu],[38,FAMILY_SOURCES.ahu],[39,FAMILY_SOURCES.ahu],[41,FAMILY_SOURCES.ahu]
]);

const EVIDENCE_BY_NO=new Map([
 [1,{grade:'MODEL_PROCESS_GROUNDED',geometry:'DEDICATED_MODEL_REFERENCE',simulation:'VERIFIED_PROCESS_MODEL',reason:'Dedicated POLAR 115 EM-MON twin uses the BMJ model/serial identity plus repeatedly documented 115 EM/EM-MON architecture: 115 cm guillotine, air table and side tables, programmed backgauge, hydraulic clamp/knife, photoelectric safety and two-hand cut command. Exact BMJ accessory package and internal hydraulic routing remain serial-specific.'}],
 [4,{grade:'MODEL_IDENTIFIED_PROCESS_GROUNDED',geometry:'YA1A1A_EXACT_IDENTITY__SHEETFED_GRAVURE_MECHANISM_REFERENCE',simulation:'BLOCKED',reason:'YA1A1A is externally documented as a Beijing Zhenhengli single sheet-fed gravure press. V123 R2 deepens the model with documented sheet-fed gravure mechanisms: swing-pawl sheet transfer, impression-cylinder gripper, adjustable ink pan / drop-feed option boundary, gravure cylinder journals, pivoting doctor holder with axial oscillation, anti-slack pre-nip roller, drying/exhaust and high-pile delivery. Exact BMJ YA1A1A drive topology, ink-feed mode, cylinder dimensions and dryer technology remain unverified, therefore simulation stays blocked rather than inventing motion.'}],
 [5,{grade:'DOCUMENT_GROUNDED',geometry:'DEDICATED_OFFICIAL_FAMILY_REFERENCE',simulation:'VERIFIED_PROCESS_MODEL',reason:'Dedicated OFFSET 8 twin combines the BMJ CX 104-8+LYYL identity/serial/year and installed 8 PU + L + Y + Y + L sequence with official HEIDELBERG CX 104 sheet, stock, speed, pile and Preset Plus architecture. Dryer energy technology and serial-specific option packages remain intentionally unasserted.'}],
 [6,{grade:'DOCUMENT_GROUNDED',geometry:'DEDICATED_OFFICIAL_FAMILY_REFERENCE',simulation:'VERIFIED_PROCESS_MODEL',reason:'Dedicated SX 52-4+L twin uses official HEIDELBERG sheet limits, central suction-tape/Venturi feed, offset-cylinder/TransferJacket architecture, speed-compensated inking, Alcolor film dampening, chamber-blade coating and Venturi delivery principles plus the BMJ identity/configuration record. Standard versus high-pile delivery, dryer/UV/perfector/Anicolor options and exact internal roller counts remain unverified.'}],
 [7,{grade:'MODEL_IDENTIFIED_EXACT_PUBLIC_REFERENCE',geometry:'FZ1200_EXACT_MODEL_PROCESS_REFERENCE__BMJ_OEM_UNVERIFIED',simulation:'VERIFIED_PROCESS_MODEL',reason:'BMJ records exact model FZ 1200. Dedicated twin now uses public exact-model FZ1200 mechanics and service references for clamp/lift, 180° turning, high-pressure airing, dust removal, vibration/alignment and hydraulic station. UANCHOR publishes 1200 kg, 1200×800 mm, 760–1640 mm opening, 9 kW and max 16 MPa for FZ1200, but none of the three BMJ serials has a public OEM match; therefore supplier/OEM and installed ratings/layout remain unverified.'}],
 [8,{grade:'MODEL_IDENTIFIED_EXACT_PUBLIC_REFERENCE',geometry:'FZ1200_EXACT_MODEL_PROCESS_REFERENCE__BMJ_OEM_UNVERIFIED',simulation:'VERIFIED_PROCESS_MODEL',reason:'BMJ records exact model FZ 1200. Dedicated twin now uses public exact-model FZ1200 mechanics and service references for clamp/lift, 180° turning, high-pressure airing, dust removal, vibration/alignment and hydraulic station. UANCHOR publishes 1200 kg, 1200×800 mm, 760–1640 mm opening, 9 kW and max 16 MPa for FZ1200, but none of the three BMJ serials has a public OEM match; therefore supplier/OEM and installed ratings/layout remain unverified.'}],
 [11,{grade:'MODEL_IDENTIFIED_PROCESS_GROUNDED',geometry:'DEDICATED_PROCESS_REFERENCE',simulation:'VERIFIED_PROCESS_MODEL',reason:'Dedicated MK 920 YMI twin uses BMJ identity plus reference-supported sheet limits, rated speed, flatbed stamping architecture and three foil-pull axes. Serial-specific options remain bounded.'}],
 [12,{grade:'MODEL_IDENTIFIED_PROCESS_GROUNDED',geometry:'DEDICATED_PROCESS_REFERENCE',simulation:'VERIFIED_PROCESS_MODEL',reason:'APM-6 is the second BMJ MK 920 YMI asset. It uses the same reference-supported flatbed stamping architecture and three foil-pull axes as APM-5 while keeping its own serial/year/SAP identity; no extra option is inferred from the site suffix II.'}],
 [13,{grade:'MODEL_MANUAL_PROCESS_GROUNDED',geometry:'DEDICATED_MANUAL_PROCESS_REFERENCE',simulation:'VERIFIED_PROCESS_MODEL',reason:'Dedicated MK 1060 ER twin uses BMJ identity plus the 2013 operating-manual architecture: suction feeder, feed table, platen press, double-action stripping, blanking and sheet-edge waste delivery. Exact BMJ tooling and guard details remain serial-specific.'}],
 [14,{grade:'OEM_PROCESS_GROUNDED',geometry:'DEDICATED_OEM_PROCESS_REFERENCE',simulation:'VERIFIED_PROCESS_MODEL',reason:'Dedicated APM-8 Promatrix 106 CSB twin follows HEIDELBERG documentation for non-stop feeder, suction-belt register table, cutting, stripping, blanking and CSB non-stop delivery. Optional MasterSet/logistics/tooling are not inferred.'}],
 [15,{grade:'OEM_PROCESS_GROUNDED',geometry:'DEDICATED_OEM_PROCESS_REFERENCE',simulation:'VERIFIED_PROCESS_MODEL',reason:'Dedicated APM-9 Promatrix 106 CSB twin follows HEIDELBERG documentation for non-stop feeder, suction-belt register table, cutting, stripping, blanking and CSB non-stop delivery. Optional MasterSet/logistics/tooling are not inferred.'}],
 [16,{grade:'MODEL_FAMILY_PROCESS_GROUNDED',geometry:'DEDICATED_FAMILY_PROCESS_REFERENCE',simulation:'VERIFIED_PROCESS_MODEL',reason:'Dedicated FGM-1 MEDIA 100 II twin follows the documented MEDIA II folder-gluer process and machine examples: feeder, pre-fold, carton-forming/lock-bottom architecture, glue application, final fold/trombone and compression delivery. A1/A2 suffix and accessories remain unverified.'}],
 [17,{grade:'FUNCTIONAL_MULTI_VENDOR_REFERENCE',geometry:'MULTI_VENDOR_FOLDER_GLUER_PROCESS_REFERENCE',simulation:'FAMILY_PROCESS_MODEL',reason:'FGM-2 has no model/serial/OEM in the BMJ registry, so it is no longer shaped as a presumed MEDIA 100 II. The twin uses only the process intersection supported by folder-gluer references: blank feeding/separation, alignment/prebreaking, folding belts/guides, adhesive application boundary, final folding, compression and delivery/control. MEDIA 100 II evidence from neighboring FGM-1/FGM-3 and Jaya Makmur Mesindo folder-gluer/BMJ association improve local relevance but do not prove FGM-2 brand/model. Crash-lock, 4/6-corner, glue-gun/disc type, glue detection, counter/kicker and downstream packer remain unverified capabilities.'}],
 [18,{grade:'MODEL_FAMILY_PROCESS_GROUNDED',geometry:'DEDICATED_FAMILY_PROCESS_REFERENCE',simulation:'VERIFIED_PROCESS_MODEL',reason:'Dedicated FGM-3 MEDIA 100 II twin uses the same evidence-bounded MEDIA II process architecture while retaining its own BMJ serial/SAP identity. No A1/A2 or accessory difference is inferred.'}],
 [19,{grade:'OEM_PROCESS_GROUNDED',geometry:'DEDICATED_OEM_PROCESS_REFERENCE',simulation:'VERIFIED_PROCESS_MODEL',reason:'Dedicated DIANA EYE 55 twin follows official HEIDELBERG/Masterwork architecture for blank feeding, suction-belt inspection, camera/LED imaging, image processing and inline reject separation. Installed camera mix, reject actuation and optional stacker remain serial-specific.'}],
 [20,{grade:'MODEL_FAMILY_PROCESS_GROUNDED',geometry:'DEDICATED_FAMILY_PROCESS_REFERENCE',simulation:'VERIFIED_PROCESS_MODEL',reason:'Dedicated IPM-4 twin follows Focusight FS-SHARK N650 primary documentation for automated feeding, full-suction transfer, high-speed vision inspection, reject separation and good/bad return collection. The P3N1 suffix and installed camera/feeder/reject configuration remain undecoded.'}],
 [21,{grade:'MODEL_IDENTIFIED_CLOSE_FAMILY_PROCESS',geometry:'QF_LQF_1080_FAMILY_PROCESS_REFERENCE__QF100CS_EXACT_EQUIVALENCE_UNVERIFIED',simulation:'FAMILY_PROCESS_MODEL',reason:'The BMJ identity QF-100CS is preserved from the plant registry. Public exact-model QF-100CS documentation remains unresolved. QF/LQF-1080 B/C/BS/CS manufacturer-family references consistently establish a moving X/Y platform under a stable hydraulic blanking head, servo motors, ball screws, straight-line guides, photoelectric positioning, PLC/HMI control and configurable pin-board tooling. Jaya Makmur Mesindo publicly lists QF1080B/QF1080C and separately lists PT Bukit Muria Jaya Karawang/Kudus among customers, strengthening local supplier-family relevance without proving ABM-2 purchase or exact QF-100CS equivalence. Dual-head architecture and collecting/stacker hardware are variant capabilities only and are not asserted as installed on ABM-2.'}],
 [22,{grade:'MODEL_IDENTIFIED_EXACT_PUBLIC_REFERENCE',geometry:'FZ1200_EXACT_MODEL_PROCESS_REFERENCE__BMJ_OEM_UNVERIFIED',simulation:'VERIFIED_PROCESS_MODEL',reason:'BMJ records exact model FZ 1200. Dedicated twin now uses public exact-model FZ1200 mechanics and service references for clamp/lift, 180° turning, high-pressure airing, dust removal, vibration/alignment and hydraulic station. UANCHOR publishes 1200 kg, 1200×800 mm, 760–1640 mm opening, 9 kW and max 16 MPa for FZ1200, but none of the three BMJ serials has a public OEM match; therefore supplier/OEM and installed ratings/layout remain unverified.'}],
 [23,{grade:'FUNCTIONAL_MULTI_VENDOR_REFERENCE',geometry:'MULTI_VENDOR_10_BIN_SUCTION_COLLATOR_PROCESS_REFERENCE',simulation:'FAMILY_PROCESS_MODEL',reason:'The BMJ registry records only COLLATOR MACHINE with no OEM/model/serial. The twin therefore uses the process intersection documented by Horizon VAC-1000/VAC-600H, Duplo DSC-10/60i and a vertical-collator patent: modular vertical feed bins, suction-rotor / air-assisted separation, feed-integrity sensing, common gathering transport, set delivery and touchscreen control. Ten bins are a modeled cross-family tower reference shared by Horizon and Duplo, not a claim about the installed BMJ bin count or OEM.'}],
 [24,{grade:'OEM_MODEL_GROUNDED',geometry:'DEDICATED_OEM_MODEL_REFERENCE',simulation:'VERIFIED_PROCESS_MODEL',reason:'Dedicated UPG-LY300 twin uses the matching manufacturer model documentation for automatic paging, servo transport, Ricoh G5 UV inkjet, LED UV curing, 2K inspection, plate-turn rejection and collection. Optional/custom accessories remain bounded.'}],
 [25,{grade:'OEM_MULTI_MODEL_FAMILY_REFERENCE',geometry:'HEIDELBERG_SUPRASETTER_MULTI_MODEL_FAMILY_REFERENCE',simulation:'FAMILY_PROCESS_MODEL',reason:'CTP-1 is confirmed Heidelberg but exact Suprasetter model/serial/format is absent. The twin uses only mechanisms supported across the official Suprasetter family: plate entry/transport, external imaging drum, HEIDELBERG thermal laser architecture and IDS, plus unload. ATL/DTL/ACL/DCL/APL loaders, internal punch, debris removal, temperature stabilization, downstream processor/stacker and laser-module count remain explicit capability boundaries and are not animated as installed.'}],
 [26,{grade:'OEM_MULTI_MODEL_FAMILY_REFERENCE',geometry:'HEIDELBERG_SUPRASETTER_MULTI_MODEL_FAMILY_REFERENCE',simulation:'FAMILY_PROCESS_MODEL',reason:'CTP-2 is confirmed Heidelberg but exact Suprasetter model/serial/format is absent. It remains a distinct BMJ asset while sharing the bounded Suprasetter family process architecture. Automatic loader type, punch, debris removal, temperature stabilization, processor/stacker and laser-module/productivity configuration are not inferred.'}],
 [27,{grade:'OEM_MULTI_MODEL_FAMILY_REFERENCE',geometry:'SCREEN_FTR_KATANA_MULTI_MODEL_FAMILY_REFERENCE',simulation:'FAMILY_PROCESS_MODEL',reason:'The BMJ asset is confirmed SCREEN CTF imagesetter but model/serial is absent. The twin uses the documented intersection of FT-R3035/3050 and Katana 5040/5055 families: roll-media supply, automatic loading, capstan transport, slack/tension control, polygon-mirror fast scan, red-laser optics, media cut and cassette/processor output boundary. Exact model, 633 versus 635 nm wavelength, media width, punch installation, polygon speed/facet applicability, output cassette, inline processor and RIP/interface generation remain unverified.'}],
 [28,{grade:'OEM_MULTI_MODEL_FAMILY_REFERENCE',geometry:'ZUND_G3_S3_MODULAR_PLATFORM_REFERENCE',simulation:'FAMILY_PROCESS_MODEL',reason:'The BMJ asset is confirmed Zünd but exact model/table/tool package is absent. The twin models only common platform mechanics: vacuum flatbed hold-down, X-axis travelling beam, Y/Z carriage, modular carrier slots and control/vacuum interfaces. UCT/EOT/POT cutting tools, CTT creasing, URT/RM routing, ARC, ICC camera, ITI initialization and conveyor/roll-off/tandem handling are explicit family capabilities, not installed claims. Simulation therefore moves platform axes only until the actual BMJ module/tool package is identified.'}],
 ...[29,30,35].map(no=>[no,{grade:'BRAND_FAMILY_REFERENCE',geometry:'ATLAS_COPCO_GA_G_OIL_INJECTED_FAMILY_REFERENCE',simulation:'FAMILY_PROCESS_MODEL',reason:'The registry identifies Atlas Copco but not the exact model. Geometry follows official GA/G oil-injected screw principles only: intake/load-unload, motor/airend, oil-air separation, minimum-pressure path, oil circuit, cooler/aftercooler, condensate handling and Elektronikon-family control. Exact GA/G variant, VSD, Full Feature dryer, power and piping are not asserted.'}]),
 ...[31,32,34].map(no=>[no,{grade:'BRAND_FAMILY_REFERENCE',geometry:'KAESER_SIGMA_FLUID_COOLED_FAMILY_REFERENCE',simulation:'FAMILY_PROCESS_MODEL',reason:'The registry identifies KAESER but not the model. Geometry follows official KAESER fluid-cooled screw architecture: intake/inlet valve, SIGMA PROFILE airend, motor interface, cooling-fluid separator tank/cartridge, minimum-pressure check valve, thermostatic/fluid-filter circuit, air/fluid coolers, centrifugal separator/ECO-DRAIN and SIGMA CONTROL family. Belt versus 1:1 direct drive and exact controller generation remain unverified.'}]),
 [33,{grade:'BRAND_FAMILY_REFERENCE',geometry:'SWAN_TS_AD_TMV_SCREW_FAMILY_REFERENCE',simulation:'FAMILY_PROCESS_MODEL',reason:'The registry identifies SWAN but not the model. Geometry follows SWAN TS-AD/TMV screw-family references: air-filter assembly, screw airend/drive interface, built-in oil-air cooling, cooling fan family and smart/variable-frequency control. Exact TS-AD versus TMV series, horsepower, coupling/VFD configuration and separator internals remain unverified.'}],
 ...[36,37,38,39,41].map(no=>[no,{grade:'FUNCTIONAL_MULTI_VENDOR_REFERENCE',geometry:'EUROVENT_SECTIONAL_AHU_FUNCTIONAL_REFERENCE',simulation:'FAMILY_PROCESS_MODEL',reason:'The BMJ registry identifies the AHU asset but provides no OEM/model/section order/airflow direction. The twin uses Eurovent-neutral AHU functions only: inlet/damper, filter bank, finned heat-exchange coil, condensate pan/trap for dehumidifying cooling, supply fan, service access and discharge/control. Mixing arrangement, filter class, coil fluid/DX type, droplet eliminator, fan type/drive and section order are explicit configuration boundaries.'}]),
 [40,{grade:'BRAND_FAMILY_REFERENCE',geometry:'SANSIN_NES_YZKJ_INDOOR_OUTDOOR_REFERENCE',simulation:'FAMILY_PROCESS_MODEL',reason:'AHU 7 is identified by BMJ as SANSIN. The family reference follows NES/YZKJ two-stage industrial cooling: dust filtration, honeycomb wet-curtain pre-cooling, low-temperature fin evaporator, supply fan, outdoor refrigeration/evaporative-condenser module and water/refrigerant circuits. YZKJ-45N versus YZKJ-90N, 50/100 kW capacity, fan count, refrigerant charge, duct routing and exact installed controller remain unverified.'}]
]);
const DEFAULT_EVIDENCE=Object.freeze({grade:'IDENTITY_ONLY',geometry:'PLACEHOLDER',simulation:'BLOCKED',reason:'Machine-specific evidence is insufficient for mechanically faithful geometry or simulation.'});
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function universalMachineConfig(machineId){const machine=MACHINE_REGISTRY_BY_ID.get(machineId);if(!machine)return null;const family=FAMILY_BY_NO.get(machine.no);if(!family)return null;return {machine,family,label:LABELS[family],modules:MODULES[family],profile:mechanicalProfile(machine.no),evidence:Object.freeze(EVIDENCE_BY_NO.get(machine.no)||DEFAULT_EVIDENCE)};}
export function universalTechnicalSources(machineId){const cfg0=universalMachineConfig(machineId);const refs=cfg0?REFERENCE_SOURCES_BY_NO.get(cfg0.machine.no):null;if(refs)return refs.map(([title,url],i)=>({id:`REFERENCE-${cfg0.machine.no}-${i+1}`,title,publisher:new URL(url).hostname.replace(/^www\./,''),url,type:'TECHNICAL_REFERENCE',confidence:cfg0.machine.model?'MODEL/FAMILY REFERENCE':'FAMILY REFERENCE'}));if(machineId==='BMJ-MCH-0001')return [...POLAR115_TECHNICAL_SOURCES];if(machineId==='BMJ-MCH-0005')return [...OFFSET8_TECHNICAL_SOURCES];if(machineId==='BMJ-MCH-0006')return [...OFFSET9_TECHNICAL_SOURCES];if(['BMJ-MCH-0011','BMJ-MCH-0012'].includes(machineId))return [...MK920_TECHNICAL_SOURCES];if(machineId==='BMJ-MCH-0013')return [...MK1060_TECHNICAL_SOURCES];if(['BMJ-MCH-0014','BMJ-MCH-0015'].includes(machineId))return [...PROMATRIX106_TECHNICAL_SOURCES];if(['BMJ-MCH-0016','BMJ-MCH-0018'].includes(machineId))return [...MEDIA100_TECHNICAL_SOURCES];if(machineId==='BMJ-MCH-0019')return [...DIANA_EYE55_TECHNICAL_SOURCES];if(machineId==='BMJ-MCH-0020')return [...SHARK_N650_TECHNICAL_SOURCES];if(['BMJ-MCH-0007','BMJ-MCH-0008','BMJ-MCH-0022'].includes(machineId))return [...FZ1200_TECHNICAL_SOURCES];if(machineId==='BMJ-MCH-0024')return [...UPG_LY300_TECHNICAL_SOURCES];const cfg=universalMachineConfig(machineId);if(!cfg)return [];return (FAMILY_SOURCES[cfg.family]||[]).map(([title,url],i)=>({id:`FAMILY-${cfg.family.toUpperCase()}-${i+1}`,title,publisher:new URL(url).hostname.replace(/^www\./,''),url,type:'TECHNICAL_REFERENCE',confidence:cfg.machine.model?'MEDIUM CONFIDENCE':'REFERENCE ONLY'}));}

export function universalTaxonomy(machineId){
 if(machineId==='BMJ-MCH-0001')return [...POLAR115_TAXONOMY];
 if(machineId==='BMJ-MCH-0004')return [...OFFSET7_GRAVURE_TAXONOMY];
 if(machineId==='BMJ-MCH-0021')return [...QF100CS_TAXONOMY];
 if(machineId==='BMJ-MCH-0023')return [...COLLATOR_TAXONOMY];
 if(['BMJ-MCH-0025','BMJ-MCH-0026'].includes(machineId))return [...suprasetterTaxonomyFor(machineId)];
 if(machineId==='BMJ-MCH-0027')return [...SCREEN_IMAGESETTER_TAXONOMY];
 if(machineId==='BMJ-MCH-0017')return [...FGM2_TAXONOMY];
 if(machineId==='BMJ-MCH-0028')return [...ZUND_TAXONOMY];
 if(['BMJ-MCH-0036','BMJ-MCH-0037','BMJ-MCH-0038','BMJ-MCH-0039','BMJ-MCH-0040','BMJ-MCH-0041'].includes(machineId))return [...ahuTaxonomyFor(machineId)];
 if(['BMJ-MCH-0029','BMJ-MCH-0030','BMJ-MCH-0031','BMJ-MCH-0032','BMJ-MCH-0033','BMJ-MCH-0034','BMJ-MCH-0035'].includes(machineId))return [...compressorTaxonomyFor(machineId)];
 if(machineId==='BMJ-MCH-0005')return [...OFFSET8_TAXONOMY];
 if(machineId==='BMJ-MCH-0006')return [...OFFSET9_TAXONOMY];
 if(['BMJ-MCH-0011','BMJ-MCH-0012'].includes(machineId))return [...mk920TaxonomyFor(machineId)];
 if(machineId==='BMJ-MCH-0013')return [...MK1060_TAXONOMY];
 if(['BMJ-MCH-0014','BMJ-MCH-0015'].includes(machineId))return [...promatrix106TaxonomyFor(machineId)];
 if(['BMJ-MCH-0016','BMJ-MCH-0018'].includes(machineId))return [...media100TaxonomyFor(machineId)];
 if(machineId==='BMJ-MCH-0019')return [...DIANA_EYE55_TAXONOMY];
 if(machineId==='BMJ-MCH-0020')return [...SHARK_N650_TAXONOMY];
 if(['BMJ-MCH-0007','BMJ-MCH-0008','BMJ-MCH-0022'].includes(machineId))return [...fz1200TaxonomyFor(machineId)];
 if(machineId==='BMJ-MCH-0024')return [...UPG_LY300_TAXONOMY];
 const cfg=universalMachineConfig(machineId);if(!cfg)return [];
 const root='U'+String(cfg.machine.no).padStart(2,'0'),nodes=[];
 const add=(id,parentId,level,levelName,name,meshRefs=[],description='')=>nodes.push(Object.freeze({id,parentId,level,levelName,name,machineZone:name,meshRefs,sourceRefs:['BMJ-MACHINE-DATABASE',`FAMILY-${cfg.family.toUpperCase()}`],confidence:cfg.machine.model?'FAMILY_REFERENCE':'REFERENCE_ONLY',verified:false,explodeVector:[level===2?.7:.12,level<4?.18:.08,0],explodeDistance:level===2?.9:level===3?.55:level===4?.34:level===5?.22:.12,focusCamera:null,description,maintenanceTag:null}));
 add(root,null,1,'Mesin',`${cfg.machine.name} · ${cfg.machine.model||'model belum terverifikasi'}`,['MACHINE-UNIVERSAL'],`Identitas berasal dari database BMJ. Geometry ${cfg.label} berbasis arsitektur keluarga dan tidak mengklaim varian yang belum tercatat.`);
 (cfg.profile?.architecture||cfg.modules).forEach((name,i)=>{const a=`${root}.M${i+1}`,mesh=`universal-module-${i+1}`;add(a,root,2,'Unit Utama',name,[mesh]);const b=a+'.SUB';add(b,a,3,'Sub',`${name} Assembly`,[mesh]);const c=b+'.BLOCK';add(c,b,4,'Block',`${name} Functional Block`,[mesh]);const d=c+'.PART';add(d,c,5,'Part',`${name} Service Group`,[mesh]);add(d+'.SPEC',d,6,'Spesifik Part',`${name} Active Element`,[`${mesh}-active`]);});
 return nodes;
}

export class UniversalMachineTemplate{
 constructor(machineId){
  this.cfg=universalMachineConfig(machineId);if(!this.cfg)throw new Error('Konfigurasi model 3D mesin tidak ditemukan.');
  this.root=new THREE.Group();this.root.name='MACHINE-UNIVERSAL';this.root.userData={assetId:machineId,family:this.cfg.family,confidence:this.cfg.evidence.geometry,evidenceGrade:this.cfg.evidence.grade,simulationStatus:this.cfg.evidence.simulation,evidenceReason:this.cfg.evidence.reason,geometryStatus:'MODEL_FAMILY_MECHANICAL_PROFILE__INSTALLED_OPTIONS_REQUIRE_BMJ_VERIFICATION',processPrinciple:this.cfg.profile?.process||[],installedUnknowns:this.cfg.profile?.unknowns||[]};
  this.parts=[];this.nodes=[];this.meshes=[];this.geometries=new Map();this.materials=new Map();this.exteriorOpen=false;this.ghosted=false;this.activeMeshes=[];
  this.palette={body:0xe5e7e4,dark:0x283238,steel:0x8c999d,accent:0x2d6e72,orange:0xc86f42,paper:0xeee7d2,glass:0x68a3b5,blue:0x447899,filter:0xd5c7a5};
  this.build();this.taxonomy=universalTaxonomy(machineId);this.taxonomyById=new Map(this.taxonomy.map(n=>[n.id,n]));
  for(const n of this.nodes){n.userData.rest=n.position.clone();n.userData.restQuaternion=n.quaternion.clone();}this.root.updateMatrixWorld(true);
 }
 group(parent,id,name,pos=[0,0,0],explode=[0,.15,0]){const g=new THREE.Group();g.name=name;g.position.set(...pos);g.userData={assetId:this.cfg.machine.machineId,nodeId:id,selectable:true,confidence:this.cfg.machine.model?'FAMILY_REFERENCE':'REFERENCE_ONLY',explode:new THREE.Vector3(...explode)};parent.add(g);this.nodes.push(g);if(parent===this.root)this.parts.push(g);return g;}
 material(kind,owner){const k=(owner.userData.nodeId||'root')+kind;if(!this.materials.has(k)){const glass=kind==='glass';this.materials.set(k,new THREE.MeshStandardMaterial({color:this.palette[kind]??this.palette.dark,metalness:['steel','dark'].includes(kind)?.42:.08,roughness:glass?.18:.55,transparent:glass,opacity:glass?.35:1}));}return this.materials.get(k);}
 mesh(g,geo,key,kind,pos=[0,0,0],rot=null){if(!this.geometries.has(key))this.geometries.set(key,geo());const m=new THREE.Mesh(this.geometries.get(key),this.material(kind,g));m.position.set(...pos);if(rot)m.rotation.set(...rot);m.castShadow=kind!=='glass';m.receiveShadow=true;m.userData={ownerId:g.userData.nodeId};g.add(m);this.meshes.push(m);return m;}
 box(g,s,p,k='body',r=.025){return this.mesh(g,()=>r?new RoundedBoxGeometry(...s,2,r):new THREE.BoxGeometry(...s),'b'+s+r,k,p);}
 cyl(g,r,l,p,k='steel',axis='z'){return this.mesh(g,()=>new THREE.CylinderGeometry(r,r,l,18),'c'+r+l,k,p,axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:null);}
 active(o){o.userData.activeElement=true;this.activeMeshes.push(o);return o;}
 cover(o){o.userData.exteriorCover=true;return o;}
 build(){
  const f=this.cfg.family,mods=this.cfg.profile?.architecture||this.cfg.modules,n=mods.length,envelope=this.cfg.profile?.footprint||[Math.max(4.2,n*.92+1.2),2,1.8],pitch=Math.max(.72,(envelope[0]-1.1)/Math.max(1,n)),total=envelope[0],base=this.group(this.root,'universal-base','Base Frame',[0,0,0],[0,-.2,0]);this.box(base,[total,.22,1.9],[0,.11,0],'dark',.035);
  if(f==='ahu')return this.buildAHU(total);
  if(f==='compressor')return this.buildCompressor(total);
  if(f==='zund')return this.buildZund(total);
  mods.forEach((name,i)=>{const x=(i-(n-1)/2)*pitch,g=this.group(this.root,`universal-module-${i+1}`,name,[x,0,0],[Math.sign(x||1)*.45,.2,0]);
   const h=Math.max(1.15,(envelope[2]||1.8)-.45),w=pitch*.86;
   this.cover(this.box(g,[w,h,.09],[0,.3+h/2,-.93],'body',.035));this.cover(this.box(g,[w,.20,1.75],[0,.3+h,0],'body',.03));
   for(const z of [-.72,.72]){this.box(g,[.07,h,.07],[-w*.35,.3+h/2,z],'steel',.01);this.box(g,[.07,h,.07],[w*.35,.3+h/2,z],'steel',.01);}
   const active=this.group(g,`universal-module-${i+1}-active`,name+' Active Element',[0,0,0],[0,.15,.15]);
   if(['folder','inspection','collator','inkjet','sheeter'].includes(f)){for(const z of [-.5,-.17,.17,.5])this.active(this.cyl(active,.07,w*.72,[0,.86,z],'steel','x'));this.box(active,[w*.82,.035,1.2],[0,.77,0],'paper',.005);}
   else if(f==='pileturner'){this.active(this.cyl(active,.48,.16,[0,1.0,0],'accent','z'));for(const z of [-.55,.55])this.box(active,[.72,.07,.12],[0,1.0,z],'steel',.01);}
   else if(f==='guillotine'){this.active(this.box(active,[w*.78,.10,1.2],[0,1.12,0],'orange',.01));this.box(active,[w*.82,.06,1.3],[0,.72,0],'steel',.01);}
   else {for(const y of [.72,1.02,1.32])this.active(this.cyl(active,.18,1.22,[0,y,0],i%3===0?'orange':'steel','z'));}
  });
 }
 buildCompressor(total){const g=this.group(this.root,'universal-module-1','Compressor Package',[0,0,0],[.5,.2,0]);this.cover(this.box(g,[3.4,1.75,1.65],[0,1.02,0],'body',.08));const a=this.group(g,'universal-module-1-active','Motor / Compression Element',[0,0,0]);this.active(this.cyl(a,.38,1.1,[-.55,.86,0],'accent','x'));this.active(this.cyl(a,.28,.9,[.55,.86,0],'steel','x'));this.box(a,[.48,1.0,.72],[1.16,1.1,0],'dark',.04);for(let i=1;i<(this.cfg.profile?.architecture||this.cfg.modules).length;i++){const x=-1.4+i*.42,m=this.group(this.root,`universal-module-${i+1}`,(this.cfg.profile?.architecture||this.cfg.modules)[i],[x,0,0],[.3,.2,0]);this.box(m,[.28,.36,.42],[0,.48,.56],'steel',.02);}}
 buildAHU(total){this.cfg.modules.forEach((name,i)=>{const x=(i-(this.cfg.modules.length-1)/2)*1.08,g=this.group(this.root,`universal-module-${i+1}`,name,[x,0,0],[Math.sign(x||1)*.45,.2,0]);this.cover(this.box(g,[1.02,1.72,1.72],[0,1.02,0],'body',.035));const a=this.group(g,`universal-module-${i+1}-active`,name+' Active Element');if(i===4)this.active(this.cyl(a,.52,.18,[0,1.03,0],'accent','z'));else if(i===1)this.box(a,[.12,1.3,1.3],[0,1.03,0],'filter',.01);else this.active(this.cyl(a,.08,1.25,[0,1.02,0],'steel','z'));});}
 buildZund(total){const g=this.group(this.root,'universal-module-1','Vacuum Cutting Table',[0,0,0],[0,.2,0]);this.box(g,[5.8,.35,2.7],[0,.45,0],'dark',.05);this.box(g,[5.55,.06,2.45],[0,.65,0],'body',.01);for(let i=1;i<this.cfg.modules.length;i++){const x=-2.4+(i-1)*.8,m=this.group(this.root,`universal-module-${i+1}`,this.cfg.modules[i],[x,0,0],[.3,.25,0]),a=this.group(m,`universal-module-${i+1}-active`,this.cfg.modules[i]+' Active Element');this.active(this.box(a,[.28,.55,.32],[0,1.0,0],i===2?'orange':'steel',.025));}const rail=this.group(this.root,'zund-gantry','Tool Gantry');this.box(rail,[.18,1.05,2.9],[0,1.05,0],'accent',.025);}
 resolvePart(o){for(let p=o;p&&p!==this.root;p=p.parent)if(p.userData.selectable)return p;return null;}findNode(id){return id==='MACHINE-UNIVERSAL'?this.root:this.nodes.find(n=>n.userData.nodeId===id)||null;}
 resolveTaxonomyNode(id){let m=this.taxonomyById.get(id);while(m){for(const r of m.meshRefs||[]){const n=this.findNode(r);if(n)return n;}m=m.parentId?this.taxonomyById.get(m.parentId):null;}return this.root;}
 contains(a,b){for(let p=b;p;p=p.parent)if(p===a)return true;return false;}
 explode(t,s=null){for(const n of this.nodes)n.position.copy(n.userData.rest);const targets=s?(s.children.filter(c=>c.userData.selectable).length?s.children.filter(c=>c.userData.selectable):[s]):this.parts;for(const n of targets)n.position.addScaledVector(n.userData.explode,THREE.MathUtils.clamp(+t||0,0,1));}
 highlight(p){for(const m of this.meshes){m.material.emissive?.setHex(p&&this.contains(p,m)?0x17494a:0);m.material.emissiveIntensity=.3;}}highlightMany(ps=[]){for(const m of this.meshes){m.material.emissive?.setHex(ps.some(p=>this.contains(p,m))?0x17494a:0);m.material.emissiveIntensity=.3;}}
 ghost(on,except=null){this.ghosted=on;for(const m of this.meshes){const fade=on&&(!except||!this.contains(except,m));m.material.transparent=fade||m.userData.exteriorCover||m.material.transparent;m.material.opacity=fade?.14:(m.material.color?.getHex()===this.palette.glass?.35:1);m.material.depthWrite=!fade;}}
 isolate(p,on=true){for(const n of this.nodes)n.visible=!on||!p||this.contains(p,n)||this.contains(n,p);}showOnly(ps=[],on=true){for(const n of this.nodes)n.visible=!on||!ps.length||ps.some(p=>n===p||this.contains(n,p));}
 setExteriorOpen(on=true){this.exteriorOpen=!!on;for(const m of this.meshes)if(m.userData.exteriorCover)m.visible=!on;this.root.userData.interiorCutawayVisible=on;}
 setLow(on){for(const m of this.meshes)if(m.userData.detail)m.visible=!on;}reset(){const open=this.exteriorOpen;this.explode(0);this.highlight(null);this.isolate(null,false);this.ghost(false);for(const n of this.nodes)n.quaternion.copy(n.userData.restQuaternion);if(open)this.setExteriorOpen(true);}dispose(){this.geometries.forEach(g=>g.dispose());this.materials.forEach(m=>m.dispose());}
}

export class UniversalProcessSimulation{
 constructor(machine,template){this.machine=machine;this.template=template;this.group=new THREE.Group();this.group.name='UNIVERSAL-PROCESS-SIMULATION-BLOCKED';machine.add(this.group);this.active=false;this.running=false;this.speed=1;this.elapsed=0;this.lastNow=null;this.completed=0;this.pathVisible=false;this.inkFlowVisible=false;this.onUpdate=null;this.available=false;this.blockedReason=template.cfg.evidence.reason;}
 state(){return {available:false,blocked:true,blockedReason:this.blockedReason,evidenceGrade:this.template.cfg.evidence.grade,geometryStatus:this.template.cfg.evidence.geometry,active:false,running:false,paused:false,speed:this.speed,stage:'Simulasi belum tervalidasi',completed:0,progress:0,sheetsVisible:0,pileSheetsVisible:0,rotorCount:0,oscillatorCount:0,mechanismCount:0,inkFlowCount:0,uvLampCount:0,uvActive:false,pathVisible:false,inkFlowVisible:false};}
 start(){this.active=false;this.running=false;this.onUpdate?.(this.state());return this.state();}pause(){return this.state();}resume(){return this.start();}stop(){this.active=false;this.running=false;this.elapsed=0;this.completed=0;this.lastNow=null;return this.state();}setSpeed(v){this.speed=Math.max(.35,Math.min(2,+v||1));return this.state();}setPathVisible(){this.pathVisible=false;return this.state();}setInkFlowVisible(){return this.state();}
 update(now){this.lastNow=now;}
 dispose(){this.stop();this.group.removeFromParent();}
}