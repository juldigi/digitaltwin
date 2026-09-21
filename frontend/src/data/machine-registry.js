// Master equipment registry normalized using the List All Machine.xlsx workbook.
// Internal machineId is deliberately independent from SAP Code because the source workbook
// contains duplicate/missing SAP identifiers. Unknown fields stay null instead of being inferred.
const row=(machineId,no,area,name,model=null,serial=null,functionalLocation=null,sapCode=null,year=null,has3D=true,source='EXCEL',note='')=>Object.freeze({
  machineId,no,area,name,model,serial,functionalLocation,sapCode,year,has3D,source,note
});

export const MACHINE_REGISTRY=Object.freeze([
  row('BMJ-MCH-0001',1,'OFFSET PRINTING','GUILOTINE POLAR 115 MACHINE (GLM-1)','115 EM MON','5831536','PC-PK2-OFS-SHT-000POLAR01','GLM-1',null,true,'EXCEL + POLAR_115_EM_MON_ARCHIVE + OPERATION_REFERENCE','Dedicated POLAR 115 EM-MON twin preserves BMJ serial/SAP/FLOC and models the consistently documented air-table, programmed backgauge, hydraulic clamp/knife and safety-barrier cut process. Published weight/accessory differences remain evidence-bounded; pallet lift, jogger and Autotrim are not inferred.'),
  row('BMJ-MCH-0002',2,'OFFSET PRINTING','SHEETING LEXUS','HSM-CTM7','00982','PC-PK2-OFS-SHT-SHEETING01','SBM-2',2014,true,'EXCEL + HSM56_FAMILY_REFERENCE + USER_CONFIRMED_ORIENTATION','Dedicated twin preserves confirmed RIGHT-to-LEFT process orientation and recovered HSM-CTM silhouette. HSM 56 specifications are family reference only; exact HSM-CTM7 OEM equivalence is not claimed.'),
  row('BMJ-MCH-0003',3,'OFFSET PRINTING','OFFSET UV INK - 5 MACHINE + INLINE INS','CD 102-8+L','550415','PC-PK2-OFS-PRT-00OFFSET05','OFU-1',2011,true),
  row('BMJ-MCH-0004',4,'OFFSET PRINTING','OFFSET - 7 MACHINE','YA1A1A','WDB-13006','PC-PK2-OFS-PRT-00OFFSET07','OFS-7',2013,true,'EXCEL + YA1A1A_EXTERNAL_MODEL_MATCH + EZGRAVTEK_COMPANY_IDENTITY','BMJ master name “OFFSET - 7 MACHINE” is preserved. External exact-model evidence identifies YA1A1A as a Beijing Zhenhengli/Ezgravtek single gravure press, so the 3D family reference is gravure rather than offset. Exact transport mode, cylinder/doctor-blade/ink/dryer/delivery configuration remains unverified and simulation stays blocked.'),
  row('BMJ-MCH-0005',5,'OFFSET PRINTING','OFFSET - 8 MACHINE','CX 104-8+LYYL','XB001916','PC-PK2-OFS-PRT-00OFFSET08','OFS-8',2022),
  row('BMJ-MCH-0006',6,'OFFSET PRINTING','OFFSET - 9 MACHINE','SX52-4+L','GS001804','PC-PK2-OFS-PRT-00OFFSET09','OFS-9',2024,true,'EXCEL + HEIDELBERG_SX52_PRIMARY_REFERENCE','Dedicated SX 52-4+L twin uses official Heidelberg architecture and technical limits. BMJ serial/configuration/year come from the site registry. UV, dryer, perfector and Anicolor options are excluded until serial-specific evidence is available.'),
  row('BMJ-MCH-0007',7,'OFFSET PRINTING','PILE TURNER 01','FZ 1200','24RVOFS0920','PC-PK2-CON-PLT','PLT-1',2020,true,'EXCEL + FZ1200_MULTI_VENDOR_PROCESS_REFERENCE','Dedicated process twin models clamp/turn/air/jog functions shared across FZ1200 references. OEM and exact installed capacity/hydraulic/blower configuration remain unverified. SAP Code PLT-1 is also used by Pile Turner 2; perlu validasi SAP sebelum dipakai sebagai identifier unik.'),
  row('BMJ-MCH-0008',8,'OFFSET PRINTING','PILE TURNER 03','FZ 1200','2105080SF34','PC-PK2-CON-PLT','PLT-3',2022,true,'EXCEL + FZ1200_MULTI_VENDOR_PROCESS_REFERENCE','Dedicated process twin models clamp/turn/air/jog functions shared across FZ1200 references. OEM and exact installed capacity/hydraulic/blower configuration remain unverified.'),
  row('BMJ-MCH-0009',9,'OFFSET PRINTING','OFFSET - 10 MACHINE','CX104-2+LY-8+LY-1+L UV + FoilStar',null,null,null,null,true,'OFFICIAL_DOCUMENTS','Model 3D dibangun dari final drawing Heidelberg, proposal Q417_R2_SF_FY27, layout IST UV, pre-installation, Technotrans system diagram dan final technical data. Serial, SAP Functional Location, SAP Code, dan tahun belum tersedia pada workbook sumber.'),

  row('BMJ-MCH-0010',10,'OFFSET CONVERTING','AUTOPLATEN - 2 MACHINE','SP 102','57115506','PC-PK2-CON-AUT-AUTOPLAT02','APM-2',1994,true,'EXCEL + LEGACY_SP102_REFERENCES','Identitas model/serial/FLOC/SAP Code/tahun berasal dari workbook BMJ. Model 3D memakai referensi keluarga legacy BOBST SP 102; suffix E/SE/CER/BMA dan aksesori aktual tidak diklaim tanpa foto/dokumen serial-specific.'),
  row('BMJ-MCH-0011',11,'OFFSET CONVERTING','AUTOPLATEN - 5 STAMPING','MK 920 YMI','20110509330','PC-PK2-CON-AUT-HOTSTAMP01','APM-5',2011,true,'EXCEL + MASTERWORK_ARCHIVE + TECHNICAL_MARKET_REFERENCE','Dedicated twin models the verified MK 920 YMI flatbed stamping/die-cutting process and three precision foil-pull axes. Installed reel count, heating zones, platen force, stripping option and exact envelope remain evidence-bounded.'),
  row('BMJ-MCH-0012',12,'OFFSET CONVERTING','AUTOPLATEN - 6 STAMPING','MK 920 YMI - II','20130529398A','PC-PK2-CON-AUT-HOTSTAMP02','APM-6',2013,true,'EXCEL + MASTERWORK_ARCHIVE + TECHNICAL_MARKET_REFERENCE','Second BMJ MK 920 YMI asset reuses the dedicated family-faithful stamping/die-cutting twin with its own serial/year/SAP identity. No unverified mechanical difference is inferred from the site suffix “II”.'),
  row('BMJ-MCH-0013',13,'OFFSET CONVERTING','AUTOPLATEN - 7 STRIPPING & BLANKING','MK 1060 ER','20130830062','PC-PK2-CON-AUT-AUTOPLAT07','APM-7',2013,true,'EXCEL + MK1060ER_2013_MANUAL_ARCHIVE + MASTERWORK_ARCHIVE + TECHNICAL_MARKET_REFERENCE','Dedicated twin follows the documented MK1060ER process train: non-stop feeder/feed table, platen die-cut, double-action stripping, blanking, sheet-edge waste and product delivery. Exact BMJ tooling/guard/platform configuration remains evidence-bounded.'),
  row('BMJ-MCH-0014',14,'OFFSET CONVERTING','AUTOPLATEN - 8 STRIPPING & BLANKING','Promatrix 106CSB','MP.DBE0-00100','PC-PK2-CON-AUT-AUTOPLAT08','APM-8',2022,true,'EXCEL + HEIDELBERG_PROMATRIX106CSB_PRIMARY','Dedicated twin follows official Promatrix 106 CSB architecture: non-stop feeder, suction-belt register table, cutting, stripping, blanking and CSB non-stop delivery. Installed options remain serial-specific.'),
  row('BMJ-MCH-0015',15,'OFFSET CONVERTING','AUTOPLATEN - 9 STRIPPING & BLANKING','Promatrix 106CSB','MP.DBE0-00115','PC-PK2-CON-AUT-AUTOPLAT09','APM-9',2024,true,'EXCEL + HEIDELBERG_PROMATRIX106CSB_PRIMARY','Second BMJ Promatrix 106 CSB asset uses the same dedicated OEM-process twin with its own serial/year/SAP identity; no unverified difference from APM-8 is inferred.'),
  row('BMJ-MCH-0016',16,'OFFSET CONVERTING','FOLDER GLUER - 1 MACHINE','MEDIA 100 II','0341 06903','PC-PK2-CON-FLG-00FOLDER01','FGM-1',null,true,'EXCEL + BOBST_MEDIA_II_ARCHIVE + INSTALLED_MACHINE_REFERENCES','Dedicated twin follows MEDIA II family process architecture while keeping A1/A2 suffix, exact envelope and installed glue/4-6-corner/control options explicitly unverified.'),
  row('BMJ-MCH-0017',17,'OFFSET CONVERTING','FOLDER GLUER - 2 MACHINE',null,null,'PC-PK2-CON-FLG-00FOLDER02','FGM-2'),
  row('BMJ-MCH-0018',18,'OFFSET CONVERTING','FOLDER GLUER - 3 MACHINE','MEDIA 100 II','0341 142 07','PC-PK2-CON-FLG-00FOLDER03','FGM-3',null,true,'EXCEL + BOBST_MEDIA_II_ARCHIVE + INSTALLED_MACHINE_REFERENCES','Second BMJ MEDIA 100 II asset uses the same dedicated evidence-bounded process twin with its own serial/SAP identity; no unverified accessory difference is inferred.'),
  row('BMJ-MCH-0019',19,'OFFSET CONVERTING','OFFLINE INSPECTION 3 - MK','DIANA EYE 55','MP.FBA0-00058','PC-PK2-CON-FLG-00INSPEC03','IPM-3',2023,true,'EXCEL + HEIDELBERG_DIANA_EYE_PRIMARY + MASTERWORK_PRIMARY','Dedicated inspection twin follows official Diana Eye 55 architecture: blank feed/alignment, suction-belt inspection, camera/LED optical section, image processing, reject sorting and accepted-product delivery. Installed camera/reject/stacker options remain serial-specific.'),
  row('BMJ-MCH-0020',20,'OFFSET CONVERTING','OFFLINE INSPECTION 4 - FOCUSIGHT','FS-SHARK-N650-P3N1','FPS241216001','PC-PK2-CON-FLG-00INSPEC04','IPM-4',2025,true,'EXCEL + FOCUSIGHT_N650_PRIMARY + FAMILY_ARCHIVE','Dedicated twin follows FS-SHARK N650 family process architecture. P3N1 suffix meaning, installed camera package, feeder mode, exact speed generation and reject/return configuration remain explicitly unverified.'),
  row('BMJ-MCH-0021',21,'OFFSET CONVERTING','AUTOBLANKING MACHINE 2','QF-100CS','2103072CGB05','PC-PK2-CON-STR-STRIPING02','ABM-2',2022),
  row('BMJ-MCH-0022',22,'OFFSET CONVERTING','PILE TURNER 2','FZ 1200','22000320','PC-PK2-CON-PLT','PLT-1',2020,true,'EXCEL + FZ1200_MULTI_VENDOR_PROCESS_REFERENCE','Dedicated process twin models clamp/turn/air/jog functions shared across FZ1200 references. OEM and exact installed capacity/hydraulic/blower configuration remain unverified. SAP Code PLT-1 is also used by Pile Turner 01; perlu validasi SAP sebelum dipakai sebagai identifier unik.'),
  row('BMJ-MCH-0023',23,'OFFSET CONVERTING','COLLATOR MACHINE'),
  row('BMJ-MCH-0024',24,'OFFSET CONVERTING','DIGITAL INKJET','UPG-LY300',null,null,null,2025,true,'EXCEL + UPG_LY300_PRIMARY','Dedicated twin uses exact matching UPG LY300 OEM documentation: automatic paging, servo conveyor, Ricoh G5 UV inkjet, LED UV curing, 2K inspection, plate-turn reject and collection/strapping interface. Serial/SAP/FLOC and installed optional accessories are not present in the BMJ registry.'),

  row('BMJ-MCH-0025',25,'PDS','CTP HEIDELBERG MACHINE',null,null,'GC-PK2-GEN-LT1-00PREPRESS-CTP1','CTP-1'),
  row('BMJ-MCH-0026',26,'PDS','CTP HEIDELBERG MACHINE',null,null,'GC-PK2-GEN-LT1-00PREPRESS-CTP2','CTP-2'),
  row('BMJ-MCH-0027',27,'PDS','CTF IMAGESETTER SCREEN MACHINE',null,null,'GC-PK2-GEN-LT1-00PREPRESS-IS01'),
  row('BMJ-MCH-0028',28,'PDS','ZUND MACHINE',null,null,'GC-PK2-GEN-LT1-00PREPRESS-ZUND'),

  row('BMJ-MCH-0029',29,'UTILITY','COMPRESSOR ATLAS COPCO NO.2'),
  row('BMJ-MCH-0030',30,'UTILITY','COMPRESSOR ATLAS COPCO NO.3'),
  row('BMJ-MCH-0031',31,'UTILITY','COMPRESSOR KAESER NO.4'),
  row('BMJ-MCH-0032',32,'UTILITY','COMPRESSOR KAESER NO.6'),
  row('BMJ-MCH-0033',33,'UTILITY','COMPRESSOR SWAN NO.7'),
  row('BMJ-MCH-0034',34,'UTILITY','COMPRESSOR KAESER NO.8'),
  row('BMJ-MCH-0035',35,'UTILITY','COMPRESSOR ATLAS COPCO NO.9'),
  row('BMJ-MCH-0036',36,'UTILITY','AHU 3'),
  row('BMJ-MCH-0037',37,'UTILITY','AHU 4'),
  row('BMJ-MCH-0038',38,'UTILITY','AHU 5'),
  row('BMJ-MCH-0039',39,'UTILITY','AHU 6'),
  row('BMJ-MCH-0040',40,'UTILITY','AHU 7 (SANSIN)'),
  row('BMJ-MCH-0041',41,'UTILITY','AHU 8')
]);

export const MACHINE_REGISTRY_BY_ID=new Map(MACHINE_REGISTRY.map(machine=>[machine.machineId,machine]));

export const MACHINE_REGISTRY_STATS=Object.freeze({
  total:MACHINE_REGISTRY.length,
  byArea:Object.freeze(Object.fromEntries(['OFFSET PRINTING','OFFSET CONVERTING','PDS','UTILITY'].map(area=>[area,MACHINE_REGISTRY.filter(machine=>machine.area===area).length]))),
  modeled3D:MACHINE_REGISTRY.filter(machine=>machine.has3D).length
});

export function searchMachines(query=''){
  const raw=String(query||'').trim().toLowerCase(),normalize=value=>String(value??'').toLowerCase().replace(/[^a-z0-9]+/g,'');
  if(!raw)return [...MACHINE_REGISTRY];
  const compact=normalize(raw);
  return MACHINE_REGISTRY.filter(machine=>[
    machine.no,machine.area,machine.name,machine.model,machine.serial,machine.functionalLocation,machine.sapCode,machine.year
  ].some(value=>{
    const text=String(value??'').toLowerCase();
    return text.includes(raw)||(compact&&normalize(text).includes(compact));
  }));
}
