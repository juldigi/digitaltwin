// Master equipment registry normalized using the List All Machine.xlsx workbook.
// Internal machineId is deliberately independent from SAP Code because the source workbook
// contains duplicate/missing SAP identifiers. Unknown fields stay null instead of being inferred.
const row=(machineId,no,area,name,model=null,serial=null,functionalLocation=null,sapCode=null,year=null,has3D=true,source='EXCEL',note='')=>Object.freeze({
  machineId,no,area,name,model,serial,functionalLocation,sapCode,year,has3D,source,note
});

export const MACHINE_REGISTRY=Object.freeze([
  row('BMJ-MCH-0001',1,'OFFSET PRINTING','GUILOTINE POLAR 115 MACHINE (GLM-1)','115 EM MON','5831536','PC-PK2-OFS-SHT-000POLAR01','GLM-1'),
  row('BMJ-MCH-0002',2,'OFFSET PRINTING','SHEETING LEXUS','HSM-CTM7','00982','PC-PK2-OFS-SHT-SHEETING01','SBM-2',2014),
  row('BMJ-MCH-0003',3,'OFFSET PRINTING','OFFSET UV INK - 5 MACHINE + INLINE INS','CD 102-8+L','550415','PC-PK2-OFS-PRT-00OFFSET05','OFU-1',2011,true),
  row('BMJ-MCH-0004',4,'OFFSET PRINTING','OFFSET - 7 MACHINE','YA1A1A','WDB-13006','PC-PK2-OFS-PRT-00OFFSET07','OFS-7',2013),
  row('BMJ-MCH-0005',5,'OFFSET PRINTING','OFFSET - 8 MACHINE','CX 104-8+LYYL','XB001916','PC-PK2-OFS-PRT-00OFFSET08','OFS-8',2022),
  row('BMJ-MCH-0006',6,'OFFSET PRINTING','OFFSET - 9 MACHINE','SX52-4+L','GS001804','PC-PK2-OFS-PRT-00OFFSET09','OFS-9',2024),
  row('BMJ-MCH-0007',7,'OFFSET PRINTING','PILE TURNER 01','FZ 1200','24RVOFS0920','PC-PK2-CON-PLT','PLT-1',2020,true,'EXCEL + FAMILY_REFERENCE','SAP Code PLT-1 juga dipakai Pile Turner 2; perlu validasi SAP. Geometry memakai referensi keluarga pile turner sampai OEM tervalidasi.'),
  row('BMJ-MCH-0008',8,'OFFSET PRINTING','PILE TURNER 03','FZ 1200','2105080SF34','PC-PK2-CON-PLT','PLT-3',2022,true,'EXCEL + FAMILY_REFERENCE','Functional Location PC-PK2-CON-PLT dipakai beberapa equipment. Geometry memakai referensi keluarga pile turner sampai OEM tervalidasi.'),
  row('BMJ-MCH-0009',9,'OFFSET PRINTING','OFFSET - 10 MACHINE','CX104-2+LY-8+LY-1+L UV + FoilStar',null,null,null,null,true,'OFFICIAL_DOCUMENTS','Model 3D dibangun dari final drawing Heidelberg, proposal Q417_R2_SF_FY27, layout IST UV, pre-installation, Technotrans system diagram dan final technical data. Serial, SAP Functional Location, SAP Code, dan tahun belum tersedia pada workbook sumber.'),

  row('BMJ-MCH-0010',10,'OFFSET CONVERTING','AUTOPLATEN - 2 MACHINE','SP 102','57115506','PC-PK2-CON-AUT-AUTOPLAT02','APM-2',1994,true,'EXCEL + LEGACY_SP102_REFERENCES','Identitas model/serial/FLOC/SAP Code/tahun berasal dari workbook BMJ. Model 3D memakai referensi keluarga legacy BOBST SP 102; suffix E/SE/CER/BMA dan aksesori aktual tidak diklaim tanpa foto/dokumen serial-specific.'),
  row('BMJ-MCH-0011',11,'OFFSET CONVERTING','AUTOPLATEN - 5 STAMPING','MK 920 YMI','20110509330','PC-PK2-CON-AUT-HOTSTAMP01','APM-5',2011),
  row('BMJ-MCH-0012',12,'OFFSET CONVERTING','AUTOPLATEN - 6 STAMPING','MK 920 YMI - II','20130529398A','PC-PK2-CON-AUT-HOTSTAMP02','APM-6',2013),
  row('BMJ-MCH-0013',13,'OFFSET CONVERTING','AUTOPLATEN - 7 STRIPPING & BLANKING','MK 1060 ER','20130830062','PC-PK2-CON-AUT-AUTOPLAT07','APM-7',2013),
  row('BMJ-MCH-0014',14,'OFFSET CONVERTING','AUTOPLATEN - 8 STRIPPING & BLANKING','Promatrix 106CSB','MP.DBE0-00100','PC-PK2-CON-AUT-AUTOPLAT08','APM-8',2022),
  row('BMJ-MCH-0015',15,'OFFSET CONVERTING','AUTOPLATEN - 9 STRIPPING & BLANKING','Promatrix 106CSB','MP.DBE0-00115','PC-PK2-CON-AUT-AUTOPLAT09','APM-9',2024),
  row('BMJ-MCH-0016',16,'OFFSET CONVERTING','FOLDER GLUER - 1 MACHINE','MEDIA 100 II','0341 06903','PC-PK2-CON-FLG-00FOLDER01','FGM-1'),
  row('BMJ-MCH-0017',17,'OFFSET CONVERTING','FOLDER GLUER - 2 MACHINE',null,null,'PC-PK2-CON-FLG-00FOLDER02','FGM-2'),
  row('BMJ-MCH-0018',18,'OFFSET CONVERTING','FOLDER GLUER - 3 MACHINE','MEDIA 100 II','0341 142 07','PC-PK2-CON-FLG-00FOLDER03','FGM-3'),
  row('BMJ-MCH-0019',19,'OFFSET CONVERTING','OFFLINE INSPECTION 3 - MK','DIANA EYE 55','MP.FBA0-00058','PC-PK2-CON-FLG-00INSPEC03','IPM-3',2023),
  row('BMJ-MCH-0020',20,'OFFSET CONVERTING','OFFLINE INSPECTION 4 - FOCUSIGHT','FS-SHARK-N650-P3N1','FPS241216001','PC-PK2-CON-FLG-00INSPEC04','IPM-4',2025),
  row('BMJ-MCH-0021',21,'OFFSET CONVERTING','AUTOBLANKING MACHINE 2','QF-100CS','2103072CGB05','PC-PK2-CON-STR-STRIPING02','ABM-2',2022),
  row('BMJ-MCH-0022',22,'OFFSET CONVERTING','PILE TURNER 2','FZ 1200','22000320','PC-PK2-CON-PLT','PLT-1',2020,true,'EXCEL + FAMILY_REFERENCE','SAP Code PLT-1 juga dipakai Pile Turner 01; perlu validasi SAP. Geometry memakai referensi keluarga pile turner sampai OEM tervalidasi.'),
  row('BMJ-MCH-0023',23,'OFFSET CONVERTING','COLLATOR MACHINE'),
  row('BMJ-MCH-0024',24,'OFFSET CONVERTING','DIGITAL INKJET','UPG-LY300',null,null,null,2025),

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
