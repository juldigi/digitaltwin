import {CONFIDENCE} from './confidence.js';

export const ORIENTATION=Object.freeze({
  coordinateSystem:{x:'+X · arah aliran material',y:'+Y · vertikal',z:'+Z · sisi drive'},
  feedDirection:'FEEDER_TO_DELIVERY_POSITIVE_X',operatorSide:'NEGATIVE_Z',driveSide:'POSITIVE_Z',
  feederEnd:'NEGATIVE_X',deliveryEnd:'POSITIVE_X',confidence:CONFIDENCE.HIGH
});


// V319 — actual on-machine roller diagram photographed by the user on Offset 5.
// This is an installed-machine visual authority for roller identity/topology/nominal table data,
// but it is NOT a nip-setting, pressure, bearer or dimensional service measurement.
export const OFFSET5_ACTUAL_ROLLER_DIAGRAM=Object.freeze({
  revision:'offset5-print-unit-reality-v319',
  sourceId:'SRC-O5-ROLLER-DIAGRAM-IMG2777',
  sourceFile:'IMG_2777.jpeg',
  title:'ROLLER DIAGRAM · HEIDELBERG CD-102',
  evidenceClass:'USER_PHOTO_OF_ON_MACHINE_DIAGRAM',
  appliesTo:'OFFSET 5 · CD 102-8+L · PU1-PU8',
  confirms:Object.freeze([
    'inking roller codes 1-15 and distributor rollers A-D',
    'dampening rollers 16/FEAW, 17/ZW, 18/T, 19/DW and FR',
    'nominal roller diameters, color identification and material/remark table',
    'relative sectional topology above the plate cylinder',
    'plate → blanket → impression cylinder order',
    'plate and impression share the same shown rotation sense while blanket is opposite',
    'RAKEL, AIR BLOWER and WATER callout zones shown on the posted diagram',
    'BWD blanket wash-up and ICWD impression-cylinder wash-up callout zones'
  ]),
  boundary:'SCHEMATIC_TOPOLOGY_AND_NOMINAL_TABLE_ONLY__DO_NOT_INFER_NIP_PRESSURE_TIMING_BEARER_DIAMETER_OR_SERVICE_SETTING'
});



// V320 — evidence precedence guard.
// The user-photographed on-machine diagram is the installed-machine authority for what is
// visibly fitted on BMJ Offset 5. The OEM SM/CD102 procedure remains authoritative for generic
// procedure/contact-setting references, but must never silently overwrite an installed-machine
// material/color entry when the two sources disagree.
export const OFFSET5_ROLLER_EVIDENCE_POLICY=Object.freeze({
  revision:'offset5-roller-evidence-policy-v320',
  installedAuthority:'SRC-O5-ROLLER-DIAGRAM-IMG2777',
  genericProcedureReference:'SRC-CD102-ROLLER-PROCEDURE',
  precedence:Object.freeze([
    'USER_PHOTO_OF_ON_MACHINE_DIAGRAM',
    'USER_PHOTOS_OF_INSTALLED_MACHINE',
    'USER_SUPPLIED_OEM_PROCEDURE',
    'MANUFACTURER_FAMILY_REFERENCE'
  ]),
  conflictRule:'INSTALLED_DIAGRAM_WINS_FOR_VISIBLE_INSTALLED_ROLLER_MATERIAL_COLOR_AND_TOPOLOGY__OEM_PROCEDURE_REMAINS_REFERENCE_FOR_GENERIC_SERVICE_SEQUENCE_AND_CONTACT_SETTINGS',
  knownConflicts:Object.freeze([
    Object.freeze({code:'15',field:'colorCode',installed:'white',oemProcedure:'none',resolution:'installed'}),
    Object.freeze({code:'17',field:'surface',installed:'rubber-coated',oemProcedure:'Rilsan / plastic-coated',resolution:'installed'}),
    Object.freeze({code:'18',field:'surface+crown',installed:'plastic-coated / not marked crowned',oemProcedure:'rubber / crowned',resolution:'installed'}),
    Object.freeze({code:'19',field:'surface+crown',installed:'rubber-coated / crowned',oemProcedure:'stainless steel / not marked crowned',resolution:'installed'}),
    Object.freeze({code:'A',field:'surface',installed:'stainless steel',oemProcedure:'Rilsan / plastic-coated',resolution:'installed'})
  ]),
  compatibleSpecificity:Object.freeze([
    Object.freeze({codes:['3','5','7','10','12','B','C','D'],installed:'plastic-coated',oemProcedure:'Rilsan',note:'Rilsan is treated as the more specific OEM family coating term, not a reason to override the installed diagram.'}),
    Object.freeze({code:'FR',installed:'chromium-plated',oemProcedure:'chromium-plated',note:'sources agree'}),
    Object.freeze({code:'16',installed:'rubber-coated',oemProcedure:'rubber',note:'sources agree'})
  ])
});

const freezeRollers=rows=>Object.freeze(rows.map(row=>Object.freeze({...row,sectionCenter:Object.freeze(row.sectionCenter)})));

export const OFFSET5_INKING_ROLLERS=freezeRollers([
  {code:'1',designation:'2nd inking form roller',diameterMM:72,colorCode:'blue',surface:'rubber-coated',materialKind:'rollerBlue',sectionCenter:[.2336,2.0554,0]},
  {code:'2',designation:'3rd inking form roller',diameterMM:66,colorCode:'red',surface:'rubber-coated',materialKind:'rollerRed',sectionCenter:[.1019,2.0515,0]},
  {code:'3',designation:'Ink transfer roller',diameterMM:56,colorCode:null,surface:'plastic-coated',materialKind:'plastic',sectionCenter:[.1639,2.1309,0]},
  {code:'4',designation:'Ink transfer roller',diameterMM:80,colorCode:'yellow',surface:'rubber-coated',materialKind:'rollerYellow',sectionCenter:[.3111,2.2123,0]},
  {code:'5',designation:'Ink transfer roller',diameterMM:68,colorCode:null,surface:'plastic-coated',materialKind:'plastic',sectionCenter:[.2065,2.2607,0]},
  {code:'6',designation:'Ink transfer roller',diameterMM:72,colorCode:'blue',surface:'rubber-coated',materialKind:'rollerBlue',sectionCenter:[.1019,2.2161,0]},
  {code:'7',designation:'Ink transfer roller',diameterMM:56,colorCode:null,surface:'plastic-coated',materialKind:'plastic',sectionCenter:[.0380,2.2955,0]},
  {code:'8',designation:'Ink transfer roller',diameterMM:60,colorCode:'white',surface:'rubber-coated',materialKind:'rollerWhite',sectionCenter:[-.0279,2.2355,0]},
  {code:'9',designation:'Ink transfer roller',diameterMM:66,colorCode:'red',surface:'rubber-coated',materialKind:'rollerRed',sectionCenter:[.4467,2.1658,0]},
  {code:'10',designation:'Ink transfer roller',diameterMM:56,colorCode:null,surface:'plastic-coated',materialKind:'plastic',sectionCenter:[.5474,2.1696,0]},
  {code:'11',designation:'Ink transfer roller',diameterMM:80,colorCode:'yellow',surface:'rubber-coated',materialKind:'rollerYellow',sectionCenter:[.4447,2.4040,0]},
  {code:'12',designation:'Ink transfer roller',diameterMM:68,colorCode:null,surface:'plastic-coated',materialKind:'plastic',sectionCenter:[.5532,2.4389,0]},
  {code:'13',designation:'4th inking form roller',diameterMM:80,colorCode:'yellow',surface:'rubber-coated',materialKind:'rollerYellow',sectionCenter:[-.0259,2.0031,0]},
  {code:'14',designation:'1st inking form roller',diameterMM:60,colorCode:'white',surface:'rubber-coated',materialKind:'rollerWhite',sectionCenter:[.3421,1.9759,0]},
  {code:'15',designation:'Ink vibrator',diameterMM:59,colorCode:'white',surface:'rubber-coated',materialKind:'rollerWhite',sectionCenter:[.2835,2.5410,0],sectionPositionPolicy:'IMG_2777_CONTACT_FIT_TO_DISTRIBUTOR_A'}
]);

export const OFFSET5_INK_DISTRIBUTORS=freezeRollers([
  {code:'A',designation:'Ink distributor roller',diameterMM:85,colorCode:null,surface:'stainless steel',materialKind:'steel',sectionCenter:[.3246,2.4447,0]},
  {code:'B',designation:'Ink distributor roller',diameterMM:85,colorCode:null,surface:'plastic-coated',materialKind:'plastic',sectionCenter:[.4118,2.2820,0]},
  {code:'C',designation:'Ink distributor roller',diameterMM:85,colorCode:null,surface:'plastic-coated',materialKind:'plastic',sectionCenter:[.3479,2.0922,0]},
  {code:'D',designation:'Ink distributor roller',diameterMM:85,colorCode:null,surface:'plastic-coated',materialKind:'plastic',sectionCenter:[.0109,2.1290,0]}
]);

export const OFFSET5_DAMPENING_ROLLERS=freezeRollers([
  {code:'16',diagramAlias:'FEAW',designation:'Dampening form roller',diameterMM:78,colorCode:null,surface:'rubber-coated',materialKind:'rubber',sectionCenter:[.4370,1.8307,0]},
  {code:'17',diagramAlias:'ZW',designation:'Intermediate roller',diameterMM:56,colorCode:null,surface:'rubber-coated',materialKind:'rubber',sectionCenter:[.4273,1.9372,0]},
  {code:'18',diagramAlias:'T',designation:'Water pan roller',diameterMM:108,colorCode:null,surface:'plastic-coated',materialKind:'plastic',sectionCenter:[.7082,1.7571,0]},
  {code:'19',diagramAlias:'DW',designation:'Metering roller',diameterMM:98,colorCode:null,surface:'rubber-coated',materialKind:'rubber',crowned:true,sectionCenter:[.5764,1.8597,0]},
  {code:'FR',diagramAlias:'FR',designation:'Dampening distributor',diameterMM:85,colorCode:null,surface:'chromium-plated',materialKind:'chromium',sectionCenter:[.4796,1.7067,0]}
]);

export const OFFSET5_FORM_ROLLER_ORDER=Object.freeze(['14','1','2','13']);

// Visual rotation topology for simulation only. Each listed contact pair counter-rotates.
// The signs are relative senses, not RPM, phase, timing, nip pressure or a maintenance setting.
// IMG_2777 establishes the numbered/distributor/dampening contact topology; the fountain↔15
// relation additionally uses the accepted upper-PU photo/OEM fountain-vibrator functional reference.
export const OFFSET5_INKING_CONTACT_PAIRS=Object.freeze([
  Object.freeze(['PLATE','13']),Object.freeze(['PLATE','2']),Object.freeze(['PLATE','1']),Object.freeze(['PLATE','14']),
  Object.freeze(['13','D']),Object.freeze(['2','D']),Object.freeze(['2','3']),Object.freeze(['1','3']),Object.freeze(['1','C']),
  Object.freeze(['3','6']),Object.freeze(['6','D']),Object.freeze(['6','7']),Object.freeze(['6','5']),Object.freeze(['7','8']),
  Object.freeze(['8','D']),Object.freeze(['5','4']),Object.freeze(['4','B']),Object.freeze(['4','C']),Object.freeze(['C','14']),
  Object.freeze(['C','9']),Object.freeze(['9','B']),Object.freeze(['9','10']),Object.freeze(['B','11']),Object.freeze(['11','A']),
  Object.freeze(['11','12']),Object.freeze(['FOUNTAIN','15']),Object.freeze(['15','A'])
]);
export const OFFSET5_INKING_ROTATION_SENSE=Object.freeze({
  PLATE:1,FOUNTAIN:1,'1':-1,'2':-1,'3':1,'4':-1,'5':1,'6':-1,'7':1,'8':-1,'9':-1,'10':1,'11':-1,'12':1,'13':-1,'14':-1,'15':-1,A:1,B:1,C:1,D:1
});

export const OFFSET5_DAMPENING_CONTACT_PAIRS=Object.freeze([
  Object.freeze(['PLATE','16']),Object.freeze(['16','17']),Object.freeze(['16','19']),Object.freeze(['16','FR']),Object.freeze(['19','18'])
]);
export const OFFSET5_DAMPENING_ROTATION_SENSE=Object.freeze({PLATE:1,'16':-1,'17':1,'19':1,FR:1,'18':-1});

// Cross-system contact visible on IMG_2777 and explicitly referenced by the OEM roller-adjustment
// table: white inking form roller 14 contacts intermediate dampening roller 17/ZW.
export const OFFSET5_CROSS_SYSTEM_CONTACT_PAIRS=Object.freeze([
  Object.freeze(['14','17'])
]);

// OEM family/service reference only. These values come from the supplied SM/CD102 roller
// procedure and are not promoted to a serial-specific installed setting. They are preserved so
// maintenance/service views can distinguish a documented reference from reconstructed geometry.
const stripe=(from,to,targetMM,minusMM,plusMM,note='')=>Object.freeze({
  from,to,targetMM,minusMM,plusMM,note,
  sourceId:'SRC-CD102-ROLLER-PROCEDURE',
  confidence:CONFIDENCE.REFERENCE_ONLY,
  installedSettingVerified:false
});
export const OFFSET5_OEM_CONTACT_SETTING_REFERENCES=Object.freeze([
  stripe('15','FOUNTAIN',4,.5,.5,'Ink vibrator ↔ ink fountain roller'),
  stripe('15','A',5,0,2,'Ink vibrator ↔ distributor A; OEM note: for mechanical reasons'),
  stripe('14','C',4,0,1,'Inking form roller 1, white ↔ distributor C'),
  stripe('1','C',4,0,1,'Inking form roller 2, blue ↔ distributor C'),
  stripe('2','D',4,0,1,'Inking form roller 3, red ↔ distributor D'),
  stripe('13','D',4,0,1,'Inking form roller 4, yellow ↔ distributor D'),
  stripe('14','PLATE',4,1,0,'Inking form roller 1, white ↔ printing plate'),
  stripe('1','PLATE',4,1,0,'Inking form roller 2, blue ↔ printing plate'),
  stripe('2','PLATE',4,1,0,'Inking form roller 3, red ↔ printing plate'),
  stripe('13','PLATE',4,1,0,'Inking form roller 4, yellow ↔ printing plate'),
  stripe('14','17',3,0,1,'Inking form roller 1, white ↔ intermediate roller 17/ZW')
]);



export const TECHNICAL_SOURCES=Object.freeze([
  {id:'SRC-O5-ROLLER-DIAGRAM-IMG2777',title:'Offset 5 · on-machine ROLLER DIAGRAM HEIDELBERG CD-102',publisher:'PT Bukit Muria Jaya / installed machine evidence',url:null,type:'USER_PHOTO_OF_ON_MACHINE_DIAGRAM',confidence:CONFIDENCE.PHOTO_VERIFIED,localFile:'IMG_2777.jpeg',supports:['roller codes 1-19, A-D and FR','nominal diameters','installed roller material/remark table','installed color identification including roller 15 white','relative inking/dampening topology','roller 14 ↔ 17/ZW cross-system contact','plate-blanket-impression sequence','RAKEL / AIR BLOWER / WATER / BWD / ICWD callout zones','installed configuration overrides conflicting generic roller-procedure table rows'],boundary:'Installed-machine visual/table authority for the fields it shows. It is still a schematic, not engineering CAD, and does not provide installed nip pressure, timing, bearer diameter, wear condition or service setting.'},
  {id:'SRC-CD102-SERVICE-MANUAL',title:'Speedmaster CD 102 · electrical/service manual (446 pages)',publisher:'Heidelberger Druckmaschinen AG',url:null,type:'USER_SUPPLIED_OEM_MANUAL',confidence:CONFIDENCE.HIGH,localFile:'pdfcoffee.com_cd102pdf-4-pdf-free.pdf',supports:['feeder pile centering 11M9','pile support adjustment 11M8','suction-head height 11M5','suction-head/format adjustment 11M6','pile stops 11M11/11M12','format wheels 11M4','cover-guide height 1M4','front-lay adjustment 1M2/1M3','printing-pressure adjustment 1...nM5','sheet-arrival and monitoring architecture']},
  {id:'SRC-CD102-ROLLER-PROCEDURE',title:'SM/CD102 · Removing and installing the inking rollers',publisher:'Heidelberger Druckmaschinen AG',url:null,type:'USER_SUPPLIED_OEM_PROCEDURE',confidence:CONFIDENCE.HIGH,localFile:'SMCD102_roller_remove_procedure.pdf',supports:['generic SM/CD102 roller map 1-19','distributor rollers A-D','dampening distributor FR','generic roller diameters/material table','inking form roller color identification','roller removal/installation sequence','ink-stripe adjustment references including 14↔17/ZW'],boundary:'OEM family/service procedure, not serial-550415 installed evidence. Where its generic material/color row conflicts with on-machine IMG_2777, IMG_2777 is authoritative for the BMJ installed model. Stripe/adjustment values remain REFERENCE_ONLY unless independently verified on the installed press.'},
  {id:'SRC-HEIDELBERG-CD102',title:'Speedmaster CD 102 · official product information',publisher:'Heidelberger Druckmaschinen AG',url:'https://www.heidelberg.com/global/media/en/global_media/products___sheetfed_offset/2020_20/product_brochures_1/speedmaster-cd-102-product-information.pdf',type:'MANUFACTURER_PRODUCT_INFORMATION',confidence:CONFIDENCE.REFERENCE_ONLY,supports:['Preset Plus feeder','front-lay sheet alignment','sheet arrival monitoring','special gripper systems','AirTransfer sheet transport','inking and Alcolor dampening','ink fountain','chamber-blade coating unit','dryer system','sheet brake','Preset Plus delivery','central lubrication']},
  {id:'SRC-HD-SUCTION-BELT-PATENT',title:'Device for adapting negative pressure in a suction-belt feed table',publisher:'Heidelberger Druckmaschinen AG',url:'https://patents.google.com/patent/US5697606A/en',type:'MANUFACTURER_PATENT',confidence:CONFIDENCE.REFERENCE_ONLY,supports:['suction-belt feed table','negative-pressure chambers','sheet transport','operating-condition adaptation']},
  {id:'SRC-HD-SHEET-ALIGN-PATENT',title:'Device for aligning sheets in a feeder of a sheet-processing machine',publisher:'Heidelberger Druckmaschinen AG',url:'https://patents.google.com/patent/US6681697B2/en',type:'MANUFACTURER_PATENT',confidence:CONFIDENCE.REFERENCE_ONLY,supports:['feed table','sheet alignment','front lay reference','side-pull reference','sheet sensor reference']},
  {id:'SRC-HD-PRESET-PLUS-MANUAL',title:'Preset Plus Feeder operating manual · archived mirror',publisher:'Heidelberger Druckmaschinen AG',url:'https://www.scribd.com/document/458032567/CD-102-New-Feeder-1-pdf',type:'MANUFACTURER_MANUAL_MIRROR',confidence:CONFIDENCE.REFERENCE_ONLY,supports:['blowing/suction nozzle','propelling roller','pull plate','suction tape module','guide plate','drive roller','idler pulley','multiple-sheet detector']},
  {id:'SRC-FOCUSIGHT-SWAN',title:'FS-SWAN Offset Printing Online Inspection System',publisher:'Focusight Technology Co., Ltd.',url:'https://en.focusight.net/en/Product/Printing/536.html',type:'MANUFACTURER_PRODUCT_PAGE',confidence:CONFIDENCE.REFERENCE_ONLY,supports:['inline sheet inspection','camera/imaging assembly','lighting','image processing','alarm and marking system']},
  {id:'SRC-SM102-INSTALL-DIMENSIONS',title:'Speedmaster SM 102 technical specifications · family reference only',publisher:'Heidelberger Druckmaschinen AG',url:'https://www.scribd.com/document/591071065/SM-102-Specs',type:'MANUFACTURER_MANUAL_MIRROR',confidence:CONFIDENCE.REFERENCE_ONLY,supports:['102-platform family component spacing context only'],boundary:'BMJ OFU-1 is a custom installed machine; these generic family dimensions must not override user-confirmed plant dimensions.'},
  {id:'SRC-SX102-DIMENSION-CROSSCHECK',title:'Speedmaster SX 102 · official technical information',publisher:'Heidelberger Druckmaschinen AG',url:'https://www.heidelberg.com/global/en/print_and_packaging/products/offset_printing/format_70_x_100/speedmaster_sx_102/technical_data___equipment_5/technical_data___equipment_5.jsp',type:'MANUFACTURER_TECHNICAL_DATA',confidence:CONFIDENCE.REFERENCE_ONLY,supports:['102-format sheet orientation','Preset Plus functional family context'],boundary:'Reference family only; not a dimensional substitute for custom BMJ OFU-1.'},
  {id:'SRC-CD102-8LX-DIMENSION-CROSSCHECK',title:'Heidelberg CD 102-8+LX used-machine family visual reference',publisher:'ROEPA / used-equipment listing',url:'https://roepa.com/offers/heidelberg-cd-102-8-lx-2000-from-2005-380885?locale=de',type:'SECONDARY_EQUIPMENT_LISTING',confidence:CONFIDENCE.REFERENCE_ONLY,supports:['older CD102 eight-color long-delivery silhouette and component sequence only'],boundary:'Not BMJ serial 550415 and never used to normalize BMJ custom installed dimensions.'},
  {id:'SRC-USER-PHOTOS',title:'Foto aktual OFFSET 5',publisher:'PT Bukit Muria Jaya',url:null,type:'USER_EVIDENCE',confidence:CONFIDENCE.PHOTO_VERIFIED,supports:['outer housing','visible feeder structure','operator platform','visible delivery structure','visible inline-inspection gantry']}
]);

export const PHOTO_REGISTRY=Object.freeze([
  ['p01','IMG_2312.jpeg','Delivery pile/end','end view toward printing units','active_geometry_reference',CONFIDENCE.HIGH],
  ['p02','IMG_1970.jpeg','Printing units','upper ink/roller','active_geometry_reference',CONFIDENCE.HIGH],
  ['p03','IMG_1971.jpeg','Printing units','upper ink/roller','active_geometry_reference',CONFIDENCE.HIGH],
  ['p04','IMG_1656.jpeg','Delivery','panel view','active_geometry_reference',CONFIDENCE.HIGH],
  ['p05','IMG_1624.jpeg','Feeder end','controls/end view','active_geometry_reference',CONFIDENCE.HIGH],
  ['p06','IMG_1625.jpeg','Feeder pile','open frame and suction head','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p07','IMG_1626.jpeg','Feed board / PU1 interface','board, grille and gauge detail','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p08','IMG_1627.jpeg','Printing units','operator side','active_geometry_reference',CONFIDENCE.HIGH],
  ['p09','IMG_1628.jpeg','Printing units','upper operator side','active_geometry_reference',CONFIDENCE.HIGH],
  ['p10','IMG_1629.jpeg','Coating / delivery transition','platform, raised hood and end housing','supplementary_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p11','IMG_1630.jpeg','Inline inspection','sloped hood, gantry and camera pods','supplementary_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p12','IMG_1631.jpeg','Inline inspection','gantry/camera pods','supplementary_reference',CONFIDENCE.HIGH],
  ['p13','IMG_1633.jpeg','Inline inspection','top beam','supplementary_reference',CONFIDENCE.HIGH],
  ['p14','IMG_1634.jpeg','Machine end','orientation overview','orientation_reference',CONFIDENCE.HIGH],
  ['p15','IMG_1165.jpeg','Service zone','gauge/hose detail','detail_reference',CONFIDENCE.MEDIUM],
  ['p16','IMG_0947.jpeg','Service zone','roller detail','detail_reference',CONFIDENCE.MEDIUM],
  ['p17','IMG_2388(2).jpeg','Delivery to feeder overview','operator-side longitudinal overview','orientation_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p18','IMG_2391(1).jpeg','Delivery / coating / printing units','operator-side walkway and inspection bridge','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p19','IMG_2392.jpeg','Coating to printing units','operator-side steps, covers and platform','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p20','IMG_2389(1).jpeg','Delivery to printing units','drive-side longitudinal overview and service aisle','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p21','IMG_2390(1).jpeg','Inspection / printing units','drive-side railing, flat covers and secondary steps','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p22','IMG_2395.jpeg','Feeder to printing units','drive-side pile portal, utility cabinet and hose routing','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p23','IMG_1628(2).jpeg','Printing Unit 1 to downstream units','top view from feeder toward delivery','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p24','IMG_1662.jpeg','Inter-unit operator access bay','operator side looking through PU gap','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['pzip2463','IMG_2463.HEIC','Offset 5 exterior / access / feed to delivery','Offset5.zip · multi-angle actual view','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['pzip2464','IMG_2464.HEIC','Offset 5 exterior / access / feed to delivery','Offset5.zip · multi-angle actual view','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['pzip2465','IMG_2465.HEIC','Offset 5 exterior / access / feed to delivery','Offset5.zip · multi-angle actual view','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['pzip2466','IMG_2466.HEIC','Offset 5 exterior / access / feed to delivery','Offset5.zip · multi-angle actual view','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['pzip2467','IMG_2467.HEIC','Offset 5 exterior / access / feed to delivery','Offset5.zip · multi-angle actual view','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['pzip2468','IMG_2468.HEIC','Offset 5 exterior / access / feed to delivery','Offset5.zip · multi-angle actual view','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['pzip2469','IMG_2469.HEIC','Offset 5 exterior / access / feed to delivery','Offset5.zip · multi-angle actual view','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['pzip2470','IMG_2470.HEIC','Offset 5 exterior / access / feed to delivery','Offset5.zip · multi-angle actual view','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['pzip2471','IMG_2471.HEIC','Offset 5 exterior / access / feed to delivery','Offset5.zip · multi-angle actual view','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['pzip2472','IMG_2472.HEIC','Offset 5 exterior / access / feed to delivery','Offset5.zip · multi-angle actual view','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['pzip2473','IMG_2473.HEIC','Offset 5 exterior / access / feed to delivery','Offset5.zip · multi-angle actual view','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['pzip2474','IMG_2474.HEIC','Offset 5 exterior / access / feed to delivery','Offset5.zip · multi-angle actual view','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['pzip2475','IMG_2475.HEIC','Offset 5 exterior / access / feed to delivery','Offset5.zip · multi-angle actual view','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['pzip2476','IMG_2476.HEIC','Offset 5 exterior / access / feed to delivery','Offset5.zip · multi-angle actual view','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['pzip2477','IMG_2477.HEIC','Offset 5 exterior / access / feed to delivery','Offset5.zip · multi-angle actual view','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['pzip2478','IMG_2478.HEIC','Offset 5 exterior / access / feed to delivery','Offset5.zip · multi-angle actual view','active_geometry_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p1657','IMG_1657.jpeg','Drive-side line / feeder / access context','Actual press-room view','orientation_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p1658','IMG_1658.jpeg','Drive-side line / feeder / access context','Actual press-room view','orientation_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p1659','IMG_1659.jpeg','Drive-side line / feeder / access context','Actual press-room view','orientation_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p1660','IMG_1660.jpeg','Drive-side line / feeder / access context','Actual press-room view','orientation_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p1661','IMG_1661.jpeg','Drive-side line / feeder / access context','Actual press-room view','orientation_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['pwide','E8B95414-5558-4D27-8BDC-A469766E0F9B.jpeg','Press and building context','Longitudinal actual press-room view','orientation_reference',CONFIDENCE.PHOTO_VERIFIED],
  ['p25','IMG_2777.jpeg','Printing Units 1–8','on-machine roller diagram / internal sectional topology','actual_internal_diagram_reference',CONFIDENCE.PHOTO_VERIFIED]
].map(([id,filename,machineZone,viewDirection,category,confidence])=>Object.freeze({id,filename,machineZone,viewDirection,category,confidence,duplicateOf:filename==='IMG_1628(2).jpeg'?'p09':null})));

export const photoStats=()=>PHOTO_REGISTRY.reduce((s,p)=>{s.uploaded++;if(!p.duplicateOf)s.unique++;s[p.category]=(s[p.category]||0)+1;return s;},{uploaded:0,unique:0,duplicate:0,active_geometry_reference:0,supplementary_reference:0,orientation_reference:0,detail_reference:0});
